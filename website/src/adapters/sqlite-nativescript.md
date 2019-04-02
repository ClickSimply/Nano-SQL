# SQLite \(NativeScript\)

[![nanoSQL Logo](https://github.com/ClickSimply/Nano-SQL/raw/2.0/graphics/logo.png)](https://github.com/ClickSimply/Nano-SQL/tree/2.0/packages/Core)

[![nanoSQL Logo](https://badge.fury.io/js/%40nano-sql%2Fadapter-sqlite-nativescript.svg) ](https://badge.fury.io/js/%40nano-sql%2Fadapter-sqlite-nativescript)[![nanoSQL Logo](https://img.shields.io/npm/l/express.svg?style=flat-square)](https://github.com/ClickSimply/@nano-sql/core/blob/master/LICENSE)

## nanoSQL 2 SQLite NativeScript Adapter

**Allows you to run SQLite in NativeScript with** [**nanoSQL 2**](https://www.npmjs.com/package/@nano-sql/core)

[Documentation](https://nanosql.gitbook.io/docs/adapters/sqlite-nativescript) \| [Bugs](https://github.com/ClickSimply/Nano-SQL/issues) \| [Chat](https://gitter.im/nano-sql/community)

Includes all typings.

## Installation <a id="installation"></a>

```bash
tns plugin add @nano-sql/adapter-sqlite-nativescript
```

## Usage <a id="usage"></a>

```typescript
import { NativeSQLite } from "@nano-sql/adapter-sqlite-nativescript";
import { nSQL } from "@nano-sql/core";

nSQL().connect({
    id: "my_db",
    mode: new NativeSQLite(),
    tables: [...]
}).then(...)
```

## API <a id="api"></a>

The `NativeSQLite` class accepts one optional arguments in it's constructor.

#### Filename <a id="filename"></a>

The first argument is the filename to the SQLite database to connect to, default is `:memory:` which creates a temporary database.

## MIT License <a id="mit-license"></a>

Copyright \(c\) 2019 Scott Lott

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files \(the "Software"\), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.Some content has been disabled in this document