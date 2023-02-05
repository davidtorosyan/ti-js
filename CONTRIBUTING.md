# TI-JS Development Guide

If you're interested in getting involved (or even just learning more about TI-JS),
you've come to the right place.

Other resources:
* [README.md](README.md): project overview
* [ROADMAP.md](ROAMDAP.md): planned work

## Table of contents

- [Community](#community)
  - [Issues](#issues)
  - [Pull requests](#pull-requests)
- [Development](#development)
  - [Commands](#commands)
  - [Code directory](#code-directory)
  - [Tooling](#tooling)
  - [Testing](#testing)
  - [API](#api)
  - [Versioning](#versioning)
  - [Auxillary projects](#auxillary-projects)
- [Architecture](#architecture)
  - [Overview](#overview)
  - [Dependency injection](#dependency-injection)
  - [I/O](#io)
  - [Character encoding](#character-encoding)

## Community

### Issues

If you run into an issue, file it [here](https://github.com/davidtorosyan/ti-js/issues). Make sure to include tails about what you're trying to do, and why.

### Pull Requests

Before making pull requests, reach out to the [maintainer](https://github.com/davidtorosyan) via email.

Once you've published a pull request, automatic checks will make sure tests pass and linting looks good. If there are any issues, fix them and update your PR.

If you're making updates to the grammar or adding new functionality, make sure to update the [ROADMAP.md](ROADMAP.md).

## Development

### Commands

Make sure you have [node](https://nodejs.org/en/) installed then run:
```sh
npm install
```

You can now then run any of the scripts in [package.json](package.json).
Here's a list of the more useful commands:

| Command                | Description |
| ---------------------- | ------------|
| `npm run bt`           | Build and test. Also updates API documentation. Will fail if there are lint errors. |
| `npm run lint:fix`     | Fixes simple lint errors. |
| `npm run next`         | Creates a new version, pushes it to npm, and pushes to github. Will fail if there are lint warnings or unresolved API changes. If this happens, run `npm run bt`. |
| `npm start`        | Starts up a dev server at http://localhost:9080/playground/ |
| `npm run cov`          | Print test coverage results. |

You're unlikely to use the other commands directly, but here they are:

| Command                | Description |
| ---------------------- | ------------|
| `npm run clean`        | Cleans build directory. |
| `npm run build`        | Builds with webpack. |
| `npm test`             | Runs tests. Note that you'll want to build first, so just use `npm run bt` instead. |
| `npm run lint`         | Print lint warnings and errors. Fails if there lint errors. |
| `npm run lint:prod`    | Same as above, fail even on warnings. |
| `npm run api:extractor`| Runs the API extractor. |
| `npm run api:post`     | Copy API output to build output. |
| `npm run api:prod`     | Fails if there have been changes to the TypeScript API without corresponding updates to the API file. |
| `npm run api`          | Updates the API file from the TypeScript API. |
| `npm run bump`         | Increments the patch version. |
| `npm run bt:prod`      | Build and test, but fail if there lint warnings or unconfirmed API changes. |
| `npm run push`         | Builds and publishes to NPM. |

*Note that unless you're the maintainer, you won't have permissions to push directly to npm or github.*

### Code directory

| File                                      | Category      | Description |
| ------------------------------------------| ------------- | ------------|
| [.github/](.github/)                      | 🔨 repo      | CI, github actions |
| [api/](api/)                              | 🔎 api        | latest API goes here |
| [docs/](docs/)                            | 📚 docs       | hosts the [website](https://davidtorosyan.com/ti-js/) |
| [sample/](sample/)                        | 💡 sample     | sample projects that use this library |
| [src/](src/)                              | 💻 code       | the source code |
| [tests/](tests/)                          | 🔬 tests      | the test framework |
| [web/](web/)                              | 🔬 tests      | dev tools, plus the actual test cases |
| [.eslintignore](.eslintignore)            | 🧹 lint       | files not to lint |
| [.eslintrc.js](.eslintrc.js)              | 🧹 lint       | lint config and overrides |
| [.gitignore](.gitignore)                  | 🔨 repo       | files not to track |
| [.taprc](.taprc)                          | 🔬 tests      | code coverage config |
| [api-extractor.json](api-extractor.json)  | 🔎 api        | API extraction config |
| [CONTRIBUTING.md](CONTRIBUTING.md)        | 📚 docs       | how to contribute |
| [LICENSE](LICENSE)                        | 📚 docs       | license information |
| [package-lock.json](package-lock.json)    | 📦 node       | npm lock file |
| [package.json](package.json)              | 📦 node       | node scripts and package dependencies |
| [README.md](README.md)                    | 📚 docs       | the readme |
| [tsconfig.json](tsconfig.json)            | 📜 typescript | typescript config and rules |
| [tsdoc.json](tsdoc.json)                  | 🔎 api        | API extraction integration with typscript |
| [webpack.config.js](webpack.config.js)    | 🏗 webpack     | common build config |
| [webpack.dev.js](webpack.dev.js)          | 🏗 webpack     | dev build config |
| [webpack.prod.js](webpack.prod.js)        | 🏗 webpack     | prod build config |

### Tooling

While developing, you can use the following dev tools:

| Tool                                                             | Description |
| -----------------------------------------------------------------| ------------|
| [tests](https://www.davidtorosyan.com/ti-js/tests/)              | runs unit tests |
| [playground](https://www.davidtorosyan.com/ti-js/playground/)    | debug programs and view the AST |

The prod versions are linked above, but you can get dev builds with `npm start`.

### Testing

Test cases are stored as a JS object in [web/js/testCases.js](web/js/testCases.js).

You can run them in two ways:
* `npm run bt`: this will build and run tests using [Node-Tap](https://node-tap.org/). This is integrated using [tests/e2e.js](tests/e2e.js).
* `npm run start`: this will build and run a devserver, which will let you view the test results at http://localhost:9080/tests/. You can view the production build of that site [here](https://www.davidtorosyan.com/ti-js/tests/).

TAP also gives coverage information, which you can view using `npm run cov`.
The [.taprc](.taprc) defines the minimum code coverage rules.

### API

The library is typescript compatible, which means its types are exported in a `ti.d.ts` file.
Normally this means handcrafting that file, but the [API Extractor](https://api-extractor.com/) helps automate that.

For example, the `Variable` type in [types.ts](src/common/types.ts):
```ts
/**
 * @alpha
 */
export type Variable =
    NumberVariable
    | StringVariable
    | ListVariable
```

Compiles to this in the [ti.api.md](api/ti.api.md):
```ts
// @alpha (undocumented)
type Variable = NumberVariable | StringVariable | ListVariable;
```

Which then becomes this in `ti.d.ts`:
```ts
/**
 * @alpha
 */
declare type Variable = NumberVariable | StringVariable | ListVariable;
```

*Note that we're in prerelease, so everything is `@alpha` and undocumented.*

See the [Commands](#commands) table for the commands relevant to API extraction.
In general, double check that the API isn't updated unintentionally.

### Versioning

This project uses [semantic versioning](https://semver.org/).

Since we're in prerelease, the major version is `0` and there's no changelog.
Releases simply increment the patch version.

The project will move into release once there's at least one interesting use case.
This will probably be demonstrating a real program (written for the calculator) running in the browser.

### Auxillary projects

In addition to the library, there are various directories with their own build processes:

| Directory                            | Description |
| -------------------------------------| ------------|
| [docs/](docs/)                       | hosts the [website](https://davidtorosyan.com/ti-js/) |
| [sample/node/](sample/node/)         | demos library usage with a node app |
| [sample/node-ts/](sample/node-ts/)   | demos library usage with a node app, using typescript |
| [sample/web/](sample/web/)           | demos library usage with a web app |
| [sample/web-ts/](sample/web-ts/)     | demos library usage with a web app, using typescript |
| [web/](web/)                         | website with dev tools |

View their README files to learn more.

## Architecture

### Overview

Here's an overview of how the library works:

![TI-JS Architecture diagram](https://docs.google.com/drawings/d/e/2PACX-1vQmzmE56izHkLRbEP1tGw-Lgho7p9tJC1r4LPO8MvwFaUmjodRFKOqwpamql3Rt9WHBJoA7t3vhdI7F/pub?w=960&h=720)

| Component                               | Description |
| ----------------------------------------| ----------- |
| [exec](src/common.ts)                   | top-level helper |
| [parser](src/parse/parser.ts)           | converts strings to objects that represent the AST |
| [runtime](src/run/runtime.ts)           | sets up device memory and executes the AST |
| [statement](src/evaluate/statement.ts)  | evaluates individual statements |
| [iolib](src/evaluate/helper/iolib.ts)   | helps manage input and output |
| [daemon](src/run/daemon.ts)             | executes statements in a tight loop |
| [inject](src/inject/inject.ts)          | provides different implementations for web and node |

### Dependency injection

The library is available for both web apps (client side) and node apps (server side).

However, node and web don't have the same capabilities. For example, in a web app you can use `window.postMessage` to write a non-blocking loop, but there's no `window` in node.

To solve this, we use **dependency injection**:

![TI-JS Dependency injection diagram](https://docs.google.com/drawings/d/e/2PACX-1vQnO3nsjCkHAna9dLLTL2aJP4mk-umwcRqBfwmdtvcuVmyu9gBr25wWmiUcaJDdl0xSysLszUTOAr_p/pub?w=578&h=460)


| Component                                          | Description |
| ---------------------------------------------------| ----------- |
| 🟪 [looper](src/inject/looper.ts)                  | this defines a `Looper` interface. |
| 🟪 [inject](src/inject/inject.ts)                  | has `getLooper` and `setLooper` functions |
| 🟦 [looper.web](src/inject/web/looper.web.ts)      | implements `Looper` using `window`. |
| 🟧 [looper.node](src/inject/node/looper.node.ts)   | implements `Looper` using `Worker`. |
| 🟦 [inject.web](src/inject/web/inject.web.ts)      | calls `setLooper` with the web implementation |
| 🟧 [inject.node](src/inject/node/inject.node.ts)   | calls `setLooper` with the node implementation |
| 🟦 [web.ts](src/web.ts)                            | calls `init` on `inject.web`, and exports `common.ts` |
| 🟧 [node.ts](src/node.ts)                          | calls `init` on `inject.node`, and exports `common.ts` |
| ⬜ [common.ts](src/common.ts)                      | defines the library, including... |
| ⬜ [daemon.ts](src/run/daemon.ts)                  | calls `getLooper` on `inject` |

If you're wondering we this isn't as simple as in `if` statement,
the reason is that in some cases these are *build time* dependencies.

That means we need two separate builds, defined in [webpack.config.js](webpack.config.js):
```js
const web = merge(common, {
  target: 'web',
  entry: './src/web.ts',
  output: {
    path: path.resolve(__dirname, 'dist/web'),
    filename: 'ti.js',
  },
})

const node = merge(common, {
  target: 'node',
  entry: './src/node.ts',
  output: {
    path: path.resolve(__dirname, 'dist/node'),
    filename: 'ti.js',
  },
  externals: [nodeExternals()],
})
```

Incidentially, that's why node can do `require('ti-js')`
while web has to do `require('ti-js/dist/web/ti')` - we can only define one default output path.

### I/O

Input and output is mostly handled by [iolib.ts](src/evaluate/helper/iolib.ts).

Currently this supports using DOM elements for IO, but not anything like a real calculator.
This will need to be revamped in order to support real programs.

### Character encoding

TI-BASIC does not use ASCII, of course. Instead, it its own encoding commonly exported to computers in .8XP (or .83P) format.

For example, the `For(` token is 4 bytes in ASCII, but only a single byte in TI-BASIC encoding.

To keep things simple, this library only deals with ASCII. This means characters like `θ` are represented as `&theta`. In some cases this means code that would ambiguously convert to TI-BASIC (for example, is `->` an arrow or a minus sign followed by a greater than sign?).

At some point we might implement a strict version of the language which could be lossesly converted back and forth into TI-BASIC, something like what [tiopt](https://www.club.cc.cmu.edu/~ajo/ti/tiopt.html) does.