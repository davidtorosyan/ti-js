# TI-JS

## Table of contents

- [Introduction](#introduction)
- [Setup](#setup)
- [Usage](#usage)
- [License](#license)

## Introduction

TI-JS lets you run TI-Basic programs in the browser (by acting as a compiler/runtime, not through emulation).

Currently working on expanding the [grammar](src/parse/tibasic.peggy), so this is in prerelease.

Check out the [project page](https://www.davidtorosyan.com/ti-js/) and the [test suite](https://www.davidtorosyan.com/ti-js/tests/), or [playground](https://www.davidtorosyan.com/ti-js/playground/).

## Setup

TI-JS releases are available via [npm](https://www.npmjs.com/package/ti-js).

*For developing, see the [CONTRIBUTING.md](CONTRIBUTING.md).*

### Node

If you've got a `package.json`, you'll want to install first:

```sh
npm install ti-js
```
How you then import it depends on the platform you're developing for. See the table below:

| platform | CommonJS                                   | ES6                                        |
| ---------| ------------------------------------------ | ------------------------------------------ |
| node     | `require('ti-js')`                         | `import * as ti from 'ti-js'`              |
| web      | `const ti = require('ti-js/dist/web/ti')`  | `import * as ti from 'ti-js/dist/web/ti'`  |

See [sample](sample/) directories for examples.

### Static

If you've just got a static webpage, you can import the library like so:

```html
<script
    src="https://cdn.jsdelivr.net/npm/ti-js@latest/dist/web/ti.min.js"
    crossorigin="anonymous"></script>
```

*Note that you can specify the version you want instead of using `latest`.*

Then just declare `ti` as global in your scripts and use it:

```js
/* global ti */
```

See the [docs](docs/) directory for example webpages.

## Usage

*Note: In progress! This library is still in pre-release.*

### Writing TI-BASIC code

This library doesn't support TI-BASIC exactly, but an ASCII-fied version of it.

Furthermore, not all commands are implemented yet.

To see which commands are available, refer to the table in [ROADMAP.md](ROADMAP.md).

### API

The interface is still in progress, but here's two ways you can use the library.

**Porcelain**

The simplest way to use the library is the `exec` command, which runs
a TI-Basic program, collects the output, and passes it to a specified callback.

```js
ti.exec('Disp "hello world"', output => {
  document.body.innerHTML += output
})
```

**Plumbing**

If you want more control over the runtime, use the `parse` and `run` commands
directly. This will let you inspect the running program and redirect the output
wherever you like.

```js
const lines = ti.parse(source)
program = ti.run(lines, {
    elem: $output,
})
```

## License
[MIT](https://choosealicense.com/licenses/mit/)
