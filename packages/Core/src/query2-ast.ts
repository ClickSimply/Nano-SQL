import {
    TableQueryResult,
    InanoSQLGraphArgs,
    InanoSQLJoinArgs,
    InanoSQLQueryAST,
    InanoSQLProcessedSort,
    InanoSQLUnionArgs,
    InanoSQLFunctionQuery,
    InanoSQLWhereQuery,
    InanoSQLProcessedWhere,
    InanoSQLQuery2,
    InanoSQLInstance, InanoSQLSelectTable, InanoSQLTableAST, InanoSQLGraphAST
} from "./interfaces";
import {fastID, isFunction, isObject, QueryArguments} from "./utilities";




export class QueryAST {

    /**
     * Generate query into AST
     *
     * @static
     * @param {InanoSQLQuery} query
     * @returns {InanoSQLQueryAST}
     * @memberof QueryAST
     */
    static generate(nSQL: InanoSQLInstance, query: InanoSQLQuery2): InanoSQLQueryAST {
    
        const action = String(query.action).trim().toLowerCase();

        const tableObj = this.processTable(query.table);

        if (["total", "upsert", "delete", "describe indexes", "drop", "drop table", "alter table", "rebuild indexes", "conform rows"].indexOf(action) !== -1 && !tableObj.str) {
            throw new Error(`nSQL: Query ${action} requires a local table to be selected!`);
        }

        if (action === "upsert" && query.where && Array.isArray(query.actionArgs) && query.actionArgs.length > 1) {
            throw new Error(`nSQL: Upsert query can only have one data object when using WHERE argument!`);
        }

        const selectArgs = action === "select" && query.actionArgs ? QueryAST.select(nSQL, query.actionArgs) : undefined;

        const hasAggrFn = selectArgs ? this.hasAggrFn(nSQL, selectArgs) : false;

        return {
            dbId: query.databaseID || "",
            parent: nSQL,
            table: tableObj,
            db: query.databaseID ? nSQL.getDB(query.databaseID) : (Object.keys(nSQL.dbs).length ? nSQL.dbs[Object.keys(nSQL.dbs)[0]] : undefined),
            action: action,
            hasAggrFn: hasAggrFn,
            args: {
                raw: query.actionArgs,
                select: selectArgs,
            },
            cacheID: query.cacheID || fastID(),
            where: QueryAST.where(nSQL, query.where),
            originalWhere: query.where as any[],
            having: QueryAST.where(nSQL, query.having),
            originalHaving: query.having as any[],
            range: QueryAST.offsetLimit(query.offset || 0, query.limit || 0),
            orderBy: QueryAST.sortBy(nSQL, query.orderBy),
            groupBy: QueryAST.sortBy(nSQL, query.groupBy),
            distinct: query.distinct && Array.isArray(query.distinct) ? query.distinct.map(q => QueryAST.functionString(nSQL, q)) : undefined,
            graph: this.processGraph(query.graph && !Array.isArray(query.graph) ? [query.graph] : query.graph as InanoSQLGraphArgs[]),
            join: this.processJoin(query.join && !Array.isArray(query.join) ? [query.join] : query.join as InanoSQLJoinArgs[]),
            updateImmutable: query.updateImmutable,
            union: this.processUnion(query.union)
        };
    }

    static processUnion(unionArgs?: InanoSQLUnionArgs) {
        if (!unionArgs) return undefined;
        return {
            ...unionArgs,
            tables: unionArgs.tables.map(t => this.processTable(t))
        }
    }


    static processGraph(graphArgs?: InanoSQLGraphArgs[]) {
        if (!graphArgs) return undefined;

        return graphArgs.map(g => {

            return {
                ...g,
                with: this.processTable(g.with),
                originalWith: g.with,
                graph: g.graph ? this.processGraph(g.graph && !Array.isArray(g.graph) ? [g.graph] : g.graph) : undefined
            }
        })
    }

    static processTable(select: InanoSQLSelectTable): InanoSQLTableAST {

        if (typeof select === "string") {
            return {
                as: select,
                str: select
            }
        } else if (Array.isArray(select)) {
            return {
                arr: select
            }
        } else if (typeof select === "function") {
            return {
                fn: select
            }
        } else if (isObject(select) && typeof select !== "function") {
            return {
                as: select.as,
                pk: select.pk,
                str: typeof select.table === "string" ? select.table : undefined,
                arr: Array.isArray(select.table) ? select.table : undefined,
                fn: typeof select.table === "function" ? select.table : undefined,
                query: select.query ? select.query : undefined
            }
        }

        return {};
    }

    static processJoin(joinArgs?:InanoSQLJoinArgs[]) {
        if (!joinArgs) return undefined;

        return joinArgs.map(v => {

            return {
                flatten: v.flatten !== undefined ? v.flatten : true,
                on: v.on || [],
                type: v.type,
                with: this.processTable(v.with),
                originalWith: v.with
            }
        })
    }

    static hasAggrFn(nSQL: InanoSQLInstance, select: {as?: string, value: (string | InanoSQLFunctionQuery)}[]): boolean {

        // only checks top level of SELECT arguments
        let hasAggr = false;

        let i = 0;
        while(i < select.length && hasAggr === false) {
            const selectArg = select[i];
            if (typeof selectArg.value !== "string") { // function in SELECT
                const fnName = selectArg.value.name;
                const fnOpts = nSQL.functions[fnName];
                if (!fnOpts) {
                    throw new Error(`Function ${fnName} not found!`);
                }
                if (fnOpts.type === "A") {
                    hasAggr = true;
                }
            }
            i++;
        }

        return hasAggr;

    }

    /**
     * Process .orderBy() and .groupBy() arguments from user into AST.
     *
     * @static
     * @param {(string[] | {[column: string]: string})} [sortArgs]
     * @returns {(undefined | InanoSQLProcessedSort[])}
     * @memberof QueryAST
     */
    static sortBy(nSQL: InanoSQLInstance, sortArgs?: string[] | {[column: string]: string}): undefined | InanoSQLProcessedSort[] {
        if (!sortArgs) return undefined;
    
        if (Array.isArray(sortArgs)) { // parse V2 format
            return sortArgs.map((v) => {
                const splitValue = v.split(" ").map(s => s.trim());
                return QueryAST.singleSortBy(nSQL, splitValue[0], splitValue[1]);
            })
        } else { // parse V1 format
            return Object.keys(sortArgs).map((col) => {
                const dir = sortArgs[col];
                return QueryAST.singleSortBy(nSQL, col, dir);
            })
        }
    }

    /**
     * Process single orderBy or groupBy objects into AST.
     *
     * @static
     * @param {string} column
     * @param {string} [direction]
     * @returns {InanoSQLProcessedSort}
     * @memberof QueryAST
     */
    static singleSortBy(nSQL: InanoSQLInstance, column: string, direction?: string): InanoSQLProcessedSort {

        const dir = String(direction || "").trim().toLowerCase() || "asc";
    
        return {
            dir: dir !== "asc" && dir !== "desc" ? "asc" : dir,
            value: QueryAST.functionString(nSQL, column)
        }
    }

    /**
     * Converts SELECT arguments into an AST.
     *
     * @static
     * @param {(string[] | undefined)} args
     * @returns
     * @memberof QueryAST
     */
    static select(nSQL: InanoSQLInstance, args: string[] | undefined) {
        // prevent undefined behavior
        if (!args || !Array.isArray(args)) return undefined;
    
        return args.map(v => {
            const splitVal = String(v).split(/\s+as\s+/gmi).map(s => s.trim());
            return {
                original: v,
                value: QueryAST.functionString(nSQL, splitVal[0]),
                as: splitVal[1],
            }
        });
    }

    /**
     * Turn offset/limit into range object
     *
     * @static
     * @param {number} offset
     * @param {number} limit
     * @returns {(undefined | [number, number])}
     * @memberof QueryAST
     */
    static offsetLimit(offset: number, limit: number): undefined | [number, number] {
        // prevent undefined behavior
        if (typeof offset !== "number" || typeof limit !== "number") return undefined;
    
        // no offset/limit
        if (offset + limit === 0) return undefined;
    
        return [offset, offset + limit];
    }

    /**
     * Convert a string that might contain a nested function call into an AST, or leave it as a string if it doesn't.
     *
     * @static
     * @param {string} functionString
     * @returns {(string | InanoSQLFunctionQuery)}
     * @memberof QueryAST
     */
    static functionString(nSQL: InanoSQLInstance, functionString: string): string | InanoSQLFunctionQuery {

        // prevent undefined behavior
        if (typeof functionString !== "string") return "";

        const end = functionString.lastIndexOf(")");

        const start = functionString.indexOf("(");
    
        // no functions in this string
        if (start === -1 && end === -1) return functionString;

        // escape parentheses
        if (start !== -1 && functionString[start - 1] === "\\") return functionString;
        if (end !== -1 && functionString[end - 1] === "\\") return functionString;

        // parentheses don't having matching pairs
        if (start === -1 || end === -1) {
            throw new Error("nSQL: " + functionString + " has no matching parentheses!");
        }
    
        const functionName = functionString.slice(0, start).toLowerCase();
        const functionArgs = functionString.slice(start + 1, end);

        if (!nSQL.functions[functionName]) {
            throw new Error(`nSQL: Function ${functionName} not found!`);
        }
    
        // find all the commas that are not inside nested function calls
        let splitCommas: number[] = [-1];
        let isNestedFunction = 0;
        let i = 0;
        while(i < functionArgs.length) {
            const char = functionArgs[i];
            if (char === "(") {
                isNestedFunction++;
            } else if (char === ")") {
                isNestedFunction--;
            } else if (char === "," && isNestedFunction === 0) {
                splitCommas.push(i);
            }
            i++;
        }
        splitCommas.push(functionArgs.length);
    
        if (isNestedFunction !== 0) {
            throw new Error(functionString + " has incorrect nesting of functions!");
        }
    
        const processedArgs = splitCommas.length > 2 ? splitCommas.reduce((prev: (string|InanoSQLFunctionQuery)[], cur: number, i: number) => {
            if (splitCommas[i + 1] === undefined) return prev;
    
            const section: [number, number] = [splitCommas[i] + 1, splitCommas[i + 1]];
            const fnArg = functionArgs.slice(...section).trim();
            prev.push(QueryAST.functionString(nSQL, fnArg));
            return prev;
        }, []) : [functionArgs.replace(/\,/gmi, "").trim()];
    
        return {
            name: functionName,
            args: processedArgs,
            _nSQL: nSQL
        }
    }

    /**
     * Convert nested .where() arrays into AST
     *
     * @static
     * @param {any[]} whereStatement
     * @returns {InanoSQLWhereQuery}
     * @memberof QueryAST
     */
    static arrayWhere(nSQL: InanoSQLInstance, whereStatement: any[]): InanoSQLWhereQuery {

        // prevent undefined behavior
        if (Array.isArray(whereStatement) !== true) {
            throw new Error("nSQL: Attempted to pass non array value into where array processing!");
        }
    
        if (typeof whereStatement[0] === "string") { // bottom of nested structure

            if ([
                whereStatement.indexOf(undefined),
                whereStatement.indexOf(null),
                whereStatement.indexOf("")
            ].filter(v => v === -1).length !== 3) {
                throw new Error(`nSQL: Can't use undefined, null or empty string in WHERE.  Please use 'NULL' string if you're querying for empty rows.`);
            }

            if (["IN", "NOT IN", "INTERSECT", "INTERSECT ALL", "NOT INTERSECT", "INTERSECT ANY", "INTERSECT NONE", "DOES NOT INCLUDE", "NOT INCLUDES"].indexOf(whereStatement[1]) !== -1 && !Array.isArray(whereStatement[2])) {
                throw new Error(`nSQL: '${whereStatement[1]}' WHERE query requires an array argument on the right side!`);
            }

            if (["REGEXP", "REGEX"].indexOf(whereStatement[1]) !== -1 && !(whereStatement[2] instanceof RegExp)) {
                throw new Error(`nSQL: '${whereStatement[1]}' WHERE query requires a regular expression on the right side!`);
            }

            if (["BETWEEN", "NOT BETWEEN", "INCLUDES BETWEEN"].indexOf(whereStatement[1]) !== -1 && (!Array.isArray(whereStatement[2]) || whereStatement[2].length !== 2)) {
                throw new Error(`nSQL: '${whereStatement[1]}' WHERE query requires an array argument on the right side of length 2!`);
            }

            if (["LIKE", "INCLUDES LIKE", "NOT LIKE"].indexOf(whereStatement[1]) !== -1 && (typeof whereStatement[2] !== "string")) {
                throw new Error(`nSQL: '${whereStatement[1]}' WHERE query requires a string argument!`);
            }

            return {
                STMT: [
                    QueryAST.functionString(nSQL, whereStatement[0]), // maybe function or string
                    whereStatement[1], // should be string of LIKE, =, !=, etc
                    (() => { // could be string, function string, array of function strings or anything else
                        if (typeof whereStatement[2] === "string") {
                            return QueryAST.functionString(nSQL, whereStatement[2]);
                        } else if (Array.isArray(whereStatement[2])) {
                            return whereStatement[2].map(s => typeof s === "string" ? QueryAST.functionString(nSQL, s) : s);
                        }
                        return whereStatement[2]
                    })()
                ]
            }
        } else {
            return {
                NESTED: whereStatement.map((where, i) => {
                    if (i % 2 === 1) {
                        const ANDOR = String(where).trim().toUpperCase() as "OR"|"AND";
                        if (ANDOR !== "AND" && ANDOR !== "OR") {
                            throw new Error("Malformed WHERE statement:" + JSON.stringify(whereStatement))
                        }
                        return {ANDOR: ANDOR};
                    }
                    return QueryAST.arrayWhere(nSQL, where);
                })
            }
        }
    }

    /**
     * Convert user provided .where() arguments into an AST
     *
     * @static
     * @param {(any[] | ((row: {[key: string]: any; }, i?: number) => boolean) | undefined)} whereStatement
     * @returns {(undefined | InanoSQLProcessedWhere)}
     * @memberof QueryAST
     */
    static where(nSQL: InanoSQLInstance, whereStatement: any[] | ((row: {[key: string]: any; }, i?: number) => boolean) | undefined): undefined | InanoSQLProcessedWhere {
        // no where statement
        if (typeof whereStatement === "undefined") {
            return undefined;
        }
    
        // where statement is js function
        if (typeof whereStatement === "function") {
            return {
                type: "fn",
                eval: whereStatement
            }
        }
    
        // where statement is array or array of arrays
        return {
            type: "arr",
            arr: QueryAST.arrayWhere(nSQL, whereStatement)
        }
    }

}