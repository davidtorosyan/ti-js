# TI-JS

## Table of contents

- [Introduction](#introduction)
- [Setup](#setup)
- [Usage](#usage)
- [License](#license)

## Introduction

TI-JS lets you run TI-Basic programs in the browser (by acting as a compiler/runtime, not through emulation).

Currently working on expanding the [grammar](src/parse/tibasic.peggy), so this is in prerelease and is not yet versioned.

Check out the [project page](https://www.davidtorosyan.com/ti-js/) and the [test suite](https://www.davidtorosyan.com/ti-js/tests/), or [playground](https://www.davidtorosyan.com/ti-js/playground/).

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

To convert TI-Basic to JavaScript, use `ti.parse`:

```js
var ast = ti.parse('1->X');
console.log(ast);
/*
    output:
    [
      {
        "type": "assign",
        "value": {
          "type": "number",
          "integer": "1"
        },
        "variable": {
          "type": "variable",
          "name": "X"
        },
        "source": "1->X"
      }
    ]
*/
```

The options for parse:

Option | default value | description
--- | --- | ---
sourceMap | `inline` | if `inline`, will embed the original source in the output AST.

To run the AST, use `ti.run`:

```js
var ast = ti.parse('Disp 4');
ti.run(ast)
// output: 4
```

The options:

Option | default value | description
--- | --- | ---
source | `undefined` | the original TI-Basic code, as a string or an array of strings; overrides inline source
debug | `false` | if `true`, will emit debug logs.
io | `undefined` | redirects output instead of going to the console; use `ti.ioFromVal` to create this
frequencyMs | `1` | how long on average to take executing each line in milliseconds; minimum value is `0.001`


See the [web](/web) directory for more examples.

## License
[MIT](https://choosealicense.com/licenses/mit/)
