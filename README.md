# TI-JS

## Table of contents

- [Introduction](#introduction)
- [Setup](#setup)
- [Usage](#usage)
- [License](#license)

## Introduction

This is an effort to write a TI-Basic to JavaScript transpiler and runtime.

Note that this project is ***not*** a TI-83 or TI-84 emulator, as those already exist.

Rather, the two goals are:
1. Bring the TI-Basic language to life
2. Show off TI-Basic programs in the browser

**Current status**: Only a small subset of TI-Basic is implemented. The next step is completing the [grammar](src/tibasic.pegjs).

## Setup

To build, use node.

```sh
npm install
npm run build # production build
npm start # dev build, experiment at localhost:9080/playground/
```

To setup the library for use in the browser, import it:

```html
<script src="ti.js"></script>
```

## Usage

To convert TI-Basic to JavaScript, use `ti.parser`:

```js
let source = "1->X"
let transpiled = ti.parser.parse(source, options={ output: "source" });
console.log(transpiled);
/*
    output:
    [
      { type: 'Assignment', statement: (bus) => { ti.runtime.assign(bus.mem.vars.X, ti.runtime.num('1', '', '')) } }
    ]
*/
```

There are a number of options:

Option | default value | description
--- | --- | ---
output | `"program"` | if set to `"program"`, the method will return transpiled program; if set to `"source"`, it will return transpiled parser source code as a string
name | `undefined` | if set, the generated code will be wrapped in `tilib.core.prgmNew`, so it could later be run with `tilib.core.prgmExec` and the given name
includeSource | `false` | if `true`, will embed the original source in the output. Only valid if `name` is set

To run the transpiled code, use `ti.core.run` or `ti.core.prgmExec`:

```js
let source = "Disp 4"
let transpiled = tipiler.parser.parse(source);
ti.core.run(transpiled)
// output: 4

ti.parser.parse(source, options={ name: "assign" });
ti.core.prgmExec("assign");
// output: 4
```

The options:

Option | default value | description
--- | --- | ---
source | `undefined` | the original TI-Basic code, as a string or an array of strings; if provided, debug and error messages will include the source line
debug | `false` | if `true`, will emit debug logs.

See the [web](/web) directory for more examples.

## License
[MIT](https://choosealicense.com/licenses/mit/)
