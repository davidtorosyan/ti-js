# TI-JS

## Table of contents

- [Introduction](#introduction)
- [Setup](#setup)
- [Usage](#usage)
- [License](#license)

## Introduction

This is an effort to write a TI-Basic compiler and runtime in JavaScript.

Note that this project is ***not*** a TI-83 or TI-84 emulator.

Rather, the two goals are:
1. Bring the TI-Basic language to life
2. Show off TI-Basic programs in the browser

**Current status**: Only a small subset of TI-Basic is implemented. The next step is completing the [grammar](src/parse/tibasic.pegjs).

TI-JS is in prerelease and is not yet versioned.

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
