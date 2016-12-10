!function(t,e){if("object"==typeof exports&&"object"==typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var n=e();for(var r in n)("object"==typeof exports?exports:t)[r]=n[r]}}(this,function(){return function(t){function e(r){if(n[r])return n[r].exports;var s=n[r]={exports:{},id:r,loaded:!1};return t[r].call(s.exports,s,s.exports,e),s.loaded=!0,s.exports}var n={};return e.m=t,e.c=n,e.p="",e(0)}([function(t,e,n){t.exports=n(1)},function(t,e,n){"use strict";function r(t){return f.init(t)}var s=this&&this.__extends||function(t,e){function n(){this.constructor=t}for(var r in e)e.hasOwnProperty(r)&&(t[r]=e[r]);t.prototype=null===e?Object.create(e):(n.prototype=e.prototype,new n)},i=n(2),o=n(3),c=n(4),u=function(){function t(){var t=this;t._actions=new i.tsMap,t._views=new i.tsMap,t._models=new i.tsMap,t._query=[],t._events=["change","delete","upsert","drop","select","error"],t._callbacks=new i.tsMap,t._callbacks.set("*",new i.tsMap),t._events.forEach(function(e){t._callbacks.get("*").set(e,[])})}return t.prototype.init=function(t){return t&&(this._selectedTable=t),this},t.prototype.connect=function(t){var e=this;return e._backend=t||new c.someSQL_MemDB,new a(e,function(t,n){e._backend.connect(e._models,t,n)})},t.prototype.on=function(t,e){var n=this,r=this;return t.split(" ").forEach(function(t){if(n._events.indexOf(t)==-1)throw new Error(t+"ins't a valid attachable event!");r._callbacks.get(r._selectedTable).get(t).push(e)}),this},t.prototype.model=function(t){var e=this,n=e._selectedTable;return e._callbacks.set(n,new i.tsMap),e._callbacks.get(n).set("*",[]),e._events.forEach(function(t){e._callbacks.get(n).set(t,[])}),e._models.set(n,t),e._views.set(n,{}),e._actions.set(n,{}),this},t.prototype.views=function(t){return this._views.set(this._selectedTable,t),this},t.prototype.getView=function(t,e){var n=this,r=n._selectedTable,s=n._views.get(r)[t];return s[1].apply(n,[n._cleanArgs(s[0],e)])},t.prototype._cleanArgs=function(t,e){var n=this,r=(n._selectedTable,{});return t.forEach(function(t){var s=t.split(":");s.length>1?r[s[0]]=n._cast(s[1],e[s[0]]):r[s[0]]=e[s[0]]}),r},t.prototype._cast=function(t,e){switch(["string","int","float","array","map"].indexOf(t)){case 0:return String(e);case 1:return parseInt(e);case 2:return parseFloat(e);case 3:case 4:return JSON.parse(JSON.stringify(e));default:return""}},t.prototype.actions=function(t){return this._actions.set(this._selectedTable,t),this},t.prototype.doAction=function(t,e){var n=this,r=n._selectedTable,s=n._actions.get(r)[t];return s[1].apply(n,[n._cleanArgs(s[0],e)])},t.prototype.query=function(t,e){this._query=[];var n=t.toLowerCase();return["select","upsert","delete","drop"].indexOf(n)!=-1&&this._query.push(new i.tsMap([["type",n],["args",e]])),this},t.prototype.where=function(t){return this._addCmd("where",t),this},t.prototype.andWhere=function(t){return this._addCmd("andWhere",t),this},t.prototype.orWhere=function(t){return this._addCmd("orWhere",t),this},t.prototype.orderBy=function(t){return this._addCmd("orderby",t),this},t.prototype.limit=function(t){return this._addCmd("limit",t),this},t.prototype.offset=function(t){return this._addCmd("offset",t),this},t.prototype._addCmd=function(t,e){this._query.push(new i.tsMap([["type",t],["args",e]]))},t.prototype.exec=function(){var t=this,e=t._selectedTable;t._triggerEvents=[],this._query.map(function(t){switch(t.get("type")){case"select":return[t.get("type")];case"delete":case"upsert":case"drop":return[t.get("type"),"change"];default:return[]}}).forEach(function(e){e.forEach(function(e){t._triggerEvents.push(e)})});var n=function(n){t._triggerEvents.forEach(function(r){t._callbacks.get(e).get(r).concat(t._callbacks.get("*").get(r)).forEach(function(e){e.apply(t,[r,n])})})};return new a(this,function(r,s){t._backend.exec(e,t._query,function(s){n({table:e,query:t._query.map(function(t){return t.toJSON()}),time:(new Date).getTime(),result:s}),r(s)},function(r){t._triggerEvents=["error"],n({table:e,query:t._query.map(function(t){return t.toJSON()}),time:(new Date).getTime(),result:r}),s(r)})})},t.prototype.custom=function(t,e){var n=this;return new a(n,function(r,s){n._backend.custom?n._backend.custom(t,e,r,s):r()})},t.prototype.loadJS=function(t){var e=this;return o.tsPromise.all(t.map(function(t){return e.init(e._selectedTable).query("upsert",t).exec()}))},t.prototype.loadCSV=function(t){var e=this,n=[];return new a(e,function(r,s){o.tsPromise.all(t.split("\n").map(function(t,r){return new a(e,function(s,i){if(0==r)n=t.split(","),s();else{var o={},c=t.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g).map(function(t){return t.replace(/^"(.+(?="$))"$/,"$1")});n.forEach(function(t,e){0!=c[e].indexOf("{")&&0!=c[e].indexOf("[")||(c[e]=JSON.parse(c[e].replace(/'/g,'"'))),o[t]=c[e]}),e.init(e._selectedTable).query("upsert",c).exec().then(function(){s()})}})})).then(function(){r()})})},t.prototype.toCSV=function(t){var e=this;return new a(e,function(n,r){e.exec().then(function(r){var s=e._query.filter(function(t){return"select"==t.get("type")}).map(function(t){return t.get("args")?t.get("args").map(function(t){return e._models[e._selectedTable].filter(function(e){return e.key==t})[0]}):e._models.get(e._selectedTable)})[0];t&&r.unshift(s.map(function(t){return t.key})),n(r.map(function(e,n){return t&&0==n?e:s.filter(function(t){return!!e[t.key]}).map(function(t){switch(t.type){case"map":return'"'+JSON.stringify(e[t.key]).replace(/"/g,"'")+'"';case"array":return'"'+JSON.stringify(e[t.key]).replace(/"/g,"'")+'"';default:return JSON.stringify(e[t.key])}}).join(",")}).join("\n"))})})},t.uuid=function(t){return t?t:function(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(t){var e=16*Math.random()|0,n="x"==t?e:3&e|8;return n.toString(16)})}()},t.hash=function(t){for(var e=5381,n=0;n<t.length;n++){var r=t.charCodeAt(n);e=(e<<5)+e+r}return String(e)},t}();e.someSQL_Instance=u;var a=function(t){function e(e,n){var r=t.call(this,n)||this;return r.scope=e,r}return s(e,t),e.prototype.then=function(t,n){var r=this;return new e(r.scope,function(e,s){r.done(function(n){e(t.apply(r.scope,[n]))},function(t){s(n.apply(r.scope,[t]))})})},e}(o.tsPromise),f=new u;e.someSQL=r},function(t,e){"use strict";var n=function(){function t(t){var e=this;e._items=[],e._keys=[],e._values=[],e.length=0,t&&t.forEach(function(t,n){e.set(t[0],t[1])})}return t.prototype.fromJSON=function(t){for(var e in t)t.hasOwnProperty(e)&&this.set(e,t[e])},t.prototype.toJSON=function(){var t={},e=this;return e.keys().forEach(function(n){t[String(n)]=e.get(n)}),t},t.prototype.entries=function(){return[].slice.call(this._items)},t.prototype.keys=function(){return[].slice.call(this._keys)},t.prototype.values=function(){return[].slice.call(this._values)},t.prototype.has=function(t){return this._keys.indexOf(t)>-1},t.prototype.get=function(t){var e=this._keys.indexOf(t);return e>-1?this._values[e]:void 0},t.prototype.set=function(t,e){var n=this,r=this._keys.indexOf(t);r>-1?(n._items[r][1]=e,n._values[r]=e):(n._items.push([t,e]),n._keys.push(t),n._values.push(e)),n.length=n.size()},t.prototype.size=function(){return this._items.length},t.prototype.clear=function(){var t=this;t._keys.length=t._values.length=t._items.length=0,t.length=t.size()},t.prototype.delete=function(t){var e=this,n=e._keys.indexOf(t);return n>-1&&(e._keys.splice(n,1),e._values.splice(n,1),e._items.splice(n,1),e.length=e.size(),!0)},t.prototype.forEach=function(t){var e=this;e._keys.forEach(function(n){t(e.get(n),n)})},t.prototype.map=function(t){var e=this;return this._keys.map(function(n){return t(e.get(n),n)})},t.prototype.filter=function(t){var e=this;return e._keys.forEach(function(n){0==t(e.get(n),n)&&e.delete(n)}),this},t.prototype.clone=function(){return new t(JSON.parse(JSON.stringify(this._items)))},t}();e.tsMap=n},function(t,e){"use strict";var n=function(){function t(t){this._callbacks=[],this._failed=!1,this._resolved=!1,this._settled=!1,t(this._resolve.bind(this),this._reject.bind(this))}return t.resolve=function(e){return new t(function(t){t(e)})},t.reject=function(e){return new t(function(t,n){n(e)})},t.race=function(e){var n=!1;return new t(function(t,r){e.forEach(function(e){e.then(function(e){n||(t(e),n=!0)}).catch(function(t){r(t),n=!0})})})},t.all=function(e){return new t(function(t,n){var r=e.length,s=[],i=!1;e.forEach(function(e,o){e.then(function(e){i||(r--,s[o]=e,0==r&&t(s))}).catch(function(t){n(t),i=!0})})})},t.prototype.done=function(t,e){this._settled?setTimeout(this._release.bind(this,t,e),0):this._callbacks.push({onSuccess:t,onFail:e})},t.prototype.then=function(e,n){var r=this;return new t(function(t,s){r.done(function(n){if("function"==typeof e)try{n=e(n)}catch(t){return void s(t)}t(n)},function(e){if("function"==typeof n){try{e=n(e)}catch(t){return void s(t)}t(e)}else s(e)})})},t.prototype.catch=function(t){return this.then(null,t)},t.prototype._release=function(t,e){if(this._failed){if("function"!=typeof e)throw this._value;e(this._value)}else"function"==typeof t&&t(this._value)},t.prototype._resolve=function(e){this._resolved||(this._resolved=!0,e instanceof t?e.done(this._settle.bind(this),function(t){this._failed=!0,this._settle(t)}.bind(this)):this._settle(e))},t.prototype._reject=function(t){this._resolved||(this._resolved=!0,this._failed=!0,this._settle(t))},t.prototype._settle=function(t){this._settled=!0,this._value=t,setTimeout(this._callbacks.forEach.bind(this._callbacks,function(t){this._release(t.onSuccess,t.onFail)},this),0)},t}();e.tsPromise=n},function(t,e,n){"use strict";var r=n(1),s=n(3),i=n(2),o=function(){function t(){var t=this;t._tables=new i.tsMap,t._tIndex=new i.tsMap,t._models=new i.tsMap,t._tCacheI=new i.tsMap,t._immu=new i.tsMap,t._i=new i.tsMap}return t.prototype.connect=function(t,e){var n=this;t.forEach(function(t,e){n._newModel(e,t)}),e()},t.prototype._newModel=function(t,e){this._models.set(t,e),this._tables.set(t,[]),this._tIndex.set(t,[]),this._i.set(t,1)},t.prototype.exec=function(t,e,n,i){var o=this;o._sT=t,o._mod=[],o._act=null,o._cacheKey=r.someSQL_Instance.hash(JSON.stringify(e)),s.tsPromise.all(e.map(function(t){return new s.tsPromise(function(e,n){o._query(t,e)})})).then(function(){o._exec(n)})},t.prototype._query=function(t,e){["upsert","select","delete","drop"].indexOf(t.get("type"))!=-1&&(this._act=t),["where","orderby","limit","offset","andWhere","orWhere"].indexOf(t.get("type"))!=-1&&this._mod.push(t),e()},t.prototype._exec=function(t){var e=this;switch(e._act.get("type")){case"upsert":var n=0,s=function(t){e._tCacheI.forEach(function(n,r){n&&n.indexOf(t)!=-1&&(e._tCacheI.delete(r),e._immu.delete(r))})},i=e._mod.filter(function(t){return["where","andWhere","orWhere"].indexOf(t.get("type"))!=-1});if(i.length){var o=e._where(e._tIndex.get(e._sT)),c=e._tables.get(e._sT);o.forEach(function(t,r){for(var i in e._act.get("args"))c[t][i]=e._act.get("args")[i];s(r),n++})}else{var u="";e._models.get(e._sT).forEach(function(t){"uuid"!=t.type||e._act.get("args")[t.key]||(e._act.get("args")[t.key]=r.someSQL_Instance.uuid()),t.props&&t.props.indexOf("pk")!=-1&&(u=t.key,t.props.indexOf("ai")==-1||e._act.get("args")[t.key]||(e._act.get("args")[t.key]=e._i.get(e._sT),e._i.set(e._sT,e._i.get(e._sT)+1)))});var a=e._act.get("args")[u];e._tIndex.get(e._sT).indexOf(a)==-1?e._tIndex.get(e._sT).push(a):s(a),e._tables.get(e._sT)[a]=e._act.get("args"),n++}t(n+" row(s) upserted");break;case"select":if(!e._immu.has(e._cacheKey)){var f=e._tables.get(e._sT);e._tCacheI.set(e._cacheKey,[]),e._immu.set(e._cacheKey,JSON.parse(JSON.stringify(e._where(e._tIndex.get(e._sT)).sort(function(t,n){return e._mod.filter(function(t){return"orderby"==t.type}).map(function(e){for(var r in e.get("args")){if(f[t][r]==f[n][r])return 0;var s=f[t][r]>f[n][r]?1:-1;return"asc"==e.get("args")[r]?s:-s}}).reduce(function(t,e){return t+e},0)||0}).filter(function(t,n){var r=0;return!e._mod.filter(function(t){return["limit","offset"].indexOf(t.type)!=-1}).sort(function(t,e){return t.type<e.type?1:-1}).map(function(t,e){switch(t.type){case"offset":return r=t.get("args"),n>=t.get("args")?0:1;case"limit":return n<r+t.get("args")?0:1}}).reduce(function(t,e){return t+e},0)}).map(function(t,n){if(e._tCacheI.get(e._cacheKey).push(n),e._act.get("args")&&e._act.get("args").length){var r=JSON.parse(JSON.stringify(f[t]));return e._models.get(e._sT).forEach(function(t){e._act.get("args").indexOf(t.key)==-1&&delete r[t.key]}),r}return f[t]}))))}t(e._immu.get(e._cacheKey));break;case"delete":var p=e._where(e._tIndex.get(e._sT)),h=e._tables.get(e._sT);p.forEach(function(t,n){delete h[t],e._tIndex.get(e._sT).splice(e._tIndex.get(e._sT).indexOf(t),1),e._tCacheI.forEach(function(n,r){n&&n.indexOf(t)!=-1&&(e._tCacheI.delete(r),e._immu.delete(r))})}),t(p.length+" row(s) deleted");break;case"drop":e._tables.set(e._sT,[]),e._tIndex.set(e._sT,[]),e._i.set(e._sT,1),t("Success")}},t.prototype._where=function(t){var e=this,n=e._tables.get(e._sT);return t.filter(function(t,r){var s=[];return e._mod.filter(function(t){return"andWhere"==t.get("type")}).forEach(function(t){t.get("args").forEach(function(t){s.push({type:"where",args:t})})}),0==e._mod.filter(function(t){return"where"==t.get("type")}).concat(s).map(function(r){return e._models.get(e._sT).map(function(s){return s.key==r.get("args")[0]?e._compare(r.get("args")[2],r.get("args")[1],n[t][s.key]):0}).reduce(function(t,e){return t+e},0)}).reduce(function(t,e){return t+e},0)}).filter(function(t){var r=[];return e._mod.map(function(t){"orWhere"==t.type&&t.args.forEach(function(t){r.push(t)})}),0==r.length||e._models.get(e._sT).map(function(s){return r.filter(function(r){return 1!=e._compare(r[2],r[1],n[t][s.key])}).length}).filter(function(t){return t>0}).length>0})},t.prototype._compare=function(t,e,n){switch(e){case"=":return n==t?0:1;case">":return n>t?0:1;case"<":return n<t?0:1;case"<=":return n<=t?0:1;case">=":return n>=t?0:1;case"IN":return t.indexOf(n)==-1?1:0;case"NOT IN":return t.indexOf(n)==-1?0:1;case"LIKE":return n.search(t)==-1?1:0;default:return 0}},t}();e.someSQL_MemDB=o}])});