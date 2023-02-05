# TI-JS Development Guide

If you're interested in getting involved (or even just learning more about TI-JS),
you've come to the right place.

## Table of contents

- [Community](#community)
- [Development](#development)
- [Architecture](#architecture)
- [Roadmap](#roadmap)

## Community

### Issues

If you run into an issue, file it [here](https://github.com/davidtorosyan/ti-js/issues). Make sure to include tails about what you're trying to do, and why.

### Pull Requests

Before making pull requests, reach out to the [maintainer](https://github.com/davidtorosyan) via email.

Once you've published a pull request, automatic checks will make sure tests pass and linting looks good. If there are any issues, fix them and update your PR.

If you're making updates to the grammar or adding new functionality, make sure to update the [roadmap](#roadmap).

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
| `npm run start`        | Starts up a dev server at http://localhost:9080/playground/ |
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

## Architecture

### Diagram

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

### Web vs Node

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

### Testing

### ASCII

### API Extractor

### Versioning

### Auxillary projects

## Roadmap

Below is a table of which commands have been implemented so far.

**Legend**

| Symbol          | Meaning                   |
| --------------- | ------------------------- |
| ✅ Complete     | No more to do!            |
| ⚠ Partial       | In place, but not fully.  |
| ⏱ Planned      | Not started, but planned. |
| ⛔ Out of scope | No plans to implement. Usually this is because it's not useful for programming. |

**Columns**
* **Grammar**: whether or not the command is captured by the [grammar](src/parse/tibasic.peggy).
* **Behavior**: whether or not the command is handled properly in [evaluate](src/evaluate).

**Table of Contents**
- [Keyboard](#keyboard)
- [Test](#test)
- [PRGM](#prgm)
- [Lists](#lists)
- [Stats](#stats)
- [Math](#math)
- [Angle](#angle)
- [Draw](#draw)
- [STO](#sto)
- [Vars](#vars)
- [Distr](#distr)
- [Stat Plot](#stat-plot)
- [Table Setup](#table-setup)
- [Format](#format)
- [Zoom](#zoom)
- [Matrix](#matrix)

### Keyboard

#### Tokens

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `Ans`          | ✅ Complete     | ✅ Complete     |       |
| `&theta`       | ✅ Complete     | ✅ Complete     |       |
| `->`           | ✅ Complete     | ✅ Complete     |       |

#### Constants

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `&i`           | ⏱ Planned      | ⏱ Planned       |       |
| `&pi`          | ⏱ Planned      | ⏱ Planned       |       |
| `&e`           | ⏱ Planned      | ⏱ Planned       |       |

#### Operators

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `+`            | ✅ Complete     | ✅ Complete     |       |
| `-`            | ✅ Complete     | ✅ Complete     |       |
| `&-`           | ✅ Complete     | ✅ Complete     | unary negative |
| `*`            | ✅ Complete     | ✅ Complete     |       |
| `/`            | ✅ Complete     | ✅ Complete     |       |
| `^`            | ⏱ Planned      | ⏱ Planned       |       |
| `^-1`          | ⏱ Planned      | ⏱ Planned       |       |
| `&E`           | ✅ Complete     | ✅ Complete     | scientific notation |
| `()`           | ✅ Complete     | ✅ Complete     |       |
| `&root(`       | ⏱ Planned      | ⏱ Planned       |       |
| `&10^(`        | ⏱ Planned      | ⏱ Planned       |       |
| `&e^(`         | ⏱ Planned      | ⏱ Planned       |       |
| `log(`         | ⏱ Planned      | ⏱ Planned       |       |
| `ln(`          | ⏱ Planned      | ⏱ Planned       |       |

#### Trig

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `sin(`         | ⏱ Planned      | ⏱ Planned       |       |
| `cos(`         | ⏱ Planned      | ⏱ Planned       |       |
| `tan(`         | ⏱ Planned      | ⏱ Planned       |       |
| `sin-1(`       | ⏱ Planned      | ⏱ Planned       |       |
| `cos-1(`       | ⏱ Planned      | ⏱ Planned       |       |
| `tan-1(`       | ⏱ Planned      | ⏱ Planned       |       |

### Test

#### Test

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `=`            | ✅ Complete     | ✅ Complete     |       |
| `!=`           | ✅ Complete     | ✅ Complete     |       |
| `>`            | ✅ Complete     | ✅ Complete     |       |
| `>=`           | ✅ Complete     | ✅ Complete     |       |
| `<`            | ✅ Complete     | ✅ Complete     |       |
| `<=`           | ✅ Complete     | ✅ Complete     |       |

#### Logic

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `and`          | ✅ Complete     | ✅ Complete     |       |
| `or`           | ✅ Complete     | ✅ Complete     |       |
| `xor`          | ✅ Complete     | ✅ Complete     |       |
| `not(`         | ⏱ Planned      | ⏱ Planned      |       |

### PRGM

#### CTL   

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `If`           | ✅ Complete     | ✅ Complete     |       |
| `Then`         | ✅ Complete     | ✅ Complete     |       |
| `Else`         | ✅ Complete     | ✅ Complete     |       |
| `For(`         | ⚠ Partial       | ⚠ Partial       | should accept expressions |
| `While`        | ✅ Complete     | ✅ Complete     |       |
| `Repeat`       | ✅ Complete     | ✅ Complete     |       |
| `End`          | ✅ Complete     | ✅ Complete     |       |
| `Pause`        | ✅ Complete     | ✅ Complete     |       |
| `Lbl`          | ✅ Complete     | ✅ Complete     |       |
| `Goto`         | ✅ Complete     | ✅ Complete     |       |
| `IS>(`         | ✅ Complete     | ✅ Complete     |       |
| `DS<(`         | ✅ Complete     | ✅ Complete     |       |
| `Menu(`        | ✅ Complete     | ✅ Complete     |       |
| `prgm`         | ✅ Complete     | ⏱ Planned      |       |
| `Return`       | ✅ Complete     | ⚠ Partial       | should handle subprograms |
| `Stop`         | ✅ Complete     | ✅ Complete     |       |
| `DelVar`       | ⚠ Partial       | ✅ Complete     | should be able to appear multiple times in a line |
| `GraphStyle(`  | ✅ Complete     | ⏱ Planned      |       |
| `OpenLib(`     | ✅ Complete     | ⛔ Out of scope |       |
| `ExecLib(`     | ✅ Complete     | ⛔ Out of scope |       |

#### I/O

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `Input`        | ✅ Complete     | ✅ Complete     |       |
| `Prompt`       | ⚠ Partial       | ⚠ Partial       | should allow multiple variables |
| `Disp`         | ✅ Complete     | ✅ Complete     |       |
| `DispGraph`    | ✅ Complete     | ⏱ Planned      |       |
| `DispTable`    | ✅ Complete     | ⏱ Planned      |       |
| `Output(`      | ✅ Complete     | ⚠ Partial       | should respect rows/cols |
| `getKey`       | ✅ Complete     | ⏱ Planned      |       |
| `ClrHome`      | ✅ Complete     | ⏱ Planned      |       |
| `ClrTable`     | ✅ Complete     | ⏱ Planned      |       |
| `GetCalc(`     | ✅ Complete     | ⏱ Planned      |       |
| `Get(`         | ✅ Complete     | ⏱ Planned      |       |
| `Send(`        | ✅ Complete     | ⏱ Planned      |       |

### Lists

#### OPS

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `SortA(`       | ⏱ Planned      | ⏱ Planned      |       |
| `SortD(`       | ⏱ Planned      | ⏱ Planned      |       |
| `dim(`         | ⏱ Planned      | ⏱ Planned      |       |
| `Fill(`        | ⏱ Planned      | ⏱ Planned      |       |
| `seq(`         | ⏱ Planned      | ⏱ Planned      |       |
| `cumSum(`      | ⏱ Planned      | ⏱ Planned      |       |
| `dList(`       | ⏱ Planned      | ⏱ Planned      |       |
| `Select(`      | ⏱ Planned      | ⏱ Planned      |       |
| `augment(`     | ⏱ Planned      | ⏱ Planned      |       |
| `List>matr(`   | ⏱ Planned      | ⏱ Planned      |       |
| `Matr>list(`   | ⏱ Planned      | ⏱ Planned      |       |
| `&list`        | ✅ Complete    | ✅ Complete     | named lists |

### Stats

#### Edit

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `ClrList`      | ⏱ Planned      | ⏱ Planned      |       |
| `SetUpEditor`  | ⏱ Planned      | ⏱ Planned      |       |

#### Calc

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `1-Var Stats`  | ⛔ Out of scope | ⛔ Out of scope |       |
| `2-Var Stats`  | ⛔ Out of scope | ⛔ Out of scope |       |
| `Med-Med`      | ⛔ Out of scope | ⛔ Out of scope |       |
| `LinReg(ax+b)` | ⛔ Out of scope | ⛔ Out of scope |       |
| `QuadReg`      | ⛔ Out of scope | ⛔ Out of scope |       |
| `CubicReg`     | ⛔ Out of scope | ⛔ Out of scope |       |
| `QuartReg`     | ⛔ Out of scope | ⛔ Out of scope |       |
| `LinReg(a+bx)` | ⛔ Out of scope | ⛔ Out of scope |       |
| `LnReg`        | ⛔ Out of scope | ⛔ Out of scope |       |
| `ExpReg`       | ⛔ Out of scope | ⛔ Out of scope |       |
| `PwrReg`       | ⛔ Out of scope | ⛔ Out of scope |       |
| `Logistic`     | ⛔ Out of scope | ⛔ Out of scope |       |
| `SinReg`       | ⛔ Out of scope | ⛔ Out of scope |       |
| `Manual-Fit`   | ⛔ Out of scope | ⛔ Out of scope |       |

#### Tests

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `Z-Test(`      | ⛔ Out of scope | ⛔ Out of scope |       |
| `T-Test`       | ⛔ Out of scope | ⛔ Out of scope |       |
| `2-SampZTest(` | ⛔ Out of scope | ⛔ Out of scope |       |
| `2-SampTTest`  | ⛔ Out of scope | ⛔ Out of scope |       |
| `1-PropZTest(` | ⛔ Out of scope | ⛔ Out of scope |       |
| `2-PropZTest(` | ⛔ Out of scope | ⛔ Out of scope |       |
| `ZInterval`    | ⛔ Out of scope | ⛔ Out of scope |       |
| `TInterval`    | ⛔ Out of scope | ⛔ Out of scope |       |
| `2-SampZInt(`  | ⛔ Out of scope | ⛔ Out of scope |       |
| `2-SampTInt`   | ⛔ Out of scope | ⛔ Out of scope |       |
| `1-PropZInt(`  | ⛔ Out of scope | ⛔ Out of scope |       |
| `2-PropZInt(`  | ⛔ Out of scope | ⛔ Out of scope |       |
| `X2-Test(`     | ⛔ Out of scope | ⛔ Out of scope |       |
| `X2GOF-Test(`  | ⛔ Out of scope | ⛔ Out of scope |       |
| `2-SampFTest`  | ⛔ Out of scope | ⛔ Out of scope |       |
| `LinRegTTest`  | ⛔ Out of scope | ⛔ Out of scope |       |
| `LinRegTInt`   | ⛔ Out of scope | ⛔ Out of scope |       |
| `ANOVA(`       | ⛔ Out of scope | ⛔ Out of scope |       |

#### Stat Math

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `min(`         | ⏱ Planned      | ⏱ Planned      |       |
| `max(`         | ⏱ Planned      | ⏱ Planned      |       |
| `mean(`        | ⏱ Planned      | ⏱ Planned      |       |
| `median(`      | ⏱ Planned      | ⏱ Planned      |       |
| `sum(`         | ⏱ Planned      | ⏱ Planned      |       |
| `prod(`        | ⏱ Planned      | ⏱ Planned      |       |
| `stdDev(`      | ⏱ Planned      | ⏱ Planned      |       |
| `variance(`    | ⏱ Planned      | ⏱ Planned      |       |

### Math

#### Core Math

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `>Frac`        | ⏱ Planned      | ⏱ Planned      |       |     
| `>Dec`         | ⏱ Planned      | ⏱ Planned      |       |    
| `^3`           | ⏱ Planned      | ⏱ Planned      |       |  
| `&3root(`      | ⏱ Planned      | ⏱ Planned      |       |       
| `&Nroot(`      | ⏱ Planned      | ⏱ Planned      |       |       
| `fMin(`        | ⏱ Planned      | ⏱ Planned      |       |     
| `fMax(`        | ⏱ Planned      | ⏱ Planned      |       |     
| `nDeriv(`      | ⏱ Planned      | ⏱ Planned      |       |       
| `fnInt(`       | ⏱ Planned      | ⏱ Planned      |       |      
| `solve(`       | ⏱ Planned      | ⏱ Planned      |       |

#### Num

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `abs(`         | ⏱ Planned      | ⏱ Planned      |       |
| `round(`       | ⏱ Planned      | ⏱ Planned      |       |
| `iPart(`       | ⏱ Planned      | ⏱ Planned      |       |
| `fPart(`       | ⏱ Planned      | ⏱ Planned      |       |
| `int(`         | ⏱ Planned      | ⏱ Planned      |       |
| `min(`         | ⏱ Planned      | ⏱ Planned      |       |
| `max(`         | ⏱ Planned      | ⏱ Planned      |       |
| `lcm(`         | ⏱ Planned      | ⏱ Planned      |       |
| `gcd(`         | ⏱ Planned      | ⏱ Planned      |       |

#### Cpx

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `conj(`        | ⏱ Planned      | ⏱ Planned      |       |
| `real(`        | ⏱ Planned      | ⏱ Planned      |       |
| `imag(`        | ⏱ Planned      | ⏱ Planned      |       |
| `angle(`       | ⏱ Planned      | ⏱ Planned      |       |
| `abs(`         | ⏱ Planned      | ⏱ Planned      |       |
| `>Rect(`       | ⏱ Planned      | ⏱ Planned      |       |
| `>Polar(`      | ⏱ Planned      | ⏱ Planned      |       |

#### Prb

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `rand`         | ⏱ Planned      | ⏱ Planned      |       |
| `nPr`          | ⏱ Planned      | ⏱ Planned      |       |
| `nCr`          | ⏱ Planned      | ⏱ Planned      |       |
| `!`            | ⏱ Planned      | ⏱ Planned      |       |
| `randInt(`     | ⏱ Planned      | ⏱ Planned      |       |
| `randNorm(`    | ⏱ Planned      | ⏱ Planned      |       |
| `randBin(`     | ⏱ Planned      | ⏱ Planned      |       |

### Angle

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `&deg`         | ⏱ Planned      | ⏱ Planned      |       |
| `'`            | ⏱ Planned      | ⏱ Planned      |       |
| `&r`           | ⏱ Planned      | ⏱ Planned      |       |
| `>DMS`         | ⏱ Planned      | ⏱ Planned      |       |
| `R>Pr(`        | ⏱ Planned      | ⏱ Planned      |       |
| `R>Ptheta(`    | ⏱ Planned      | ⏱ Planned      |       |
| `P>Rx(`        | ⏱ Planned      | ⏱ Planned      |       |
| `P>Ry(`        | ⏱ Planned      | ⏱ Planned      |       |

### Draw

#### Core Draw

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `ClrDraw`      | ⏱ Planned      | ⏱ Planned      |       |
| `Line(`        | ⏱ Planned      | ⏱ Planned      |       |
| `Horizontal`   | ⏱ Planned      | ⏱ Planned      |       |
| `Veritcal`     | ⏱ Planned      | ⏱ Planned      |       |
| `Tangent(`     | ⏱ Planned      | ⏱ Planned      |       |
| `DrawF`        | ⏱ Planned      | ⏱ Planned      |       |
| `Shade(`       | ⏱ Planned      | ⏱ Planned      |       |
| `DrawInv`      | ⏱ Planned      | ⏱ Planned      |       |
| `Circle(`      | ⏱ Planned      | ⏱ Planned      |       |
| `Text(`        | ⏱ Planned      | ⏱ Planned      |       |

#### Points

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `Pt-On(`       | ⏱ Planned      | ⏱ Planned      |       |
| `Pt-Off(`      | ⏱ Planned      | ⏱ Planned      |       |
| `Pt-Change(`   | ⏱ Planned      | ⏱ Planned      |       |
| `pxl-On(`      | ⏱ Planned      | ⏱ Planned      |       |
| `pxl-Off(`     | ⏱ Planned      | ⏱ Planned      |       |
| `pxl-Change(`  | ⏱ Planned      | ⏱ Planned      |       |
| `pxl-Test(`    | ⏱ Planned      | ⏱ Planned      |       |


### STO

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `StorePic`     | ⏱ Planned      | ⏱ Planned      |       |
| `RecallPic`    | ⏱ Planned      | ⏱ Planned      |       |
| `StoreGDB`     | ⏱ Planned      | ⏱ Planned      |       |
| `RecallGDB`    | ⏱ Planned      | ⏱ Planned      |       |

### Vars

#### Numbered

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `Str`          | ✅ Complete     | ✅ Complete     |       |
| `&L`           | ✅ Complete     | ✅ Complete     | lists |
| `[A]`          | ⏱ Planned      | ⏱ Planned      | matrix (letters A-J) |
| `GDB`          | ⏱ Planned      | ⏱ Planned      |       |
| `&Y`           | ⏱ Planned      | ⏱ Planned      |       |
| `&XT`          | ⏱ Planned      | ⏱ Planned      |       |
| `&YT`          | ⏱ Planned      | ⏱ Planned      |       |
| `&r`           | ⏱ Planned      | ⏱ Planned      |       |

#### Y-Vars

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `FnOn`         | ⏱ Planned      | ⏱ Planned      |       |
| `FnOff`        | ⏱ Planned      | ⏱ Planned      |       |

#### Window

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `Xmin`         | ⏱ Planned      | ⏱ Planned      |       |
| `Xmax`         | ⏱ Planned      | ⏱ Planned      |       |
| `Xscl`         | ⏱ Planned      | ⏱ Planned      |       |
| `Ymin`         | ⏱ Planned      | ⏱ Planned      |       |
| `Ymax`         | ⏱ Planned      | ⏱ Planned      |       |
| `Yscl`         | ⏱ Planned      | ⏱ Planned      |       |
| `Xres`         | ⏱ Planned      | ⏱ Planned      |       |
| `&deltaX`      | ⏱ Planned      | ⏱ Planned      |       |
| `&deltaY`      | ⏱ Planned      | ⏱ Planned      |       |
| `XFact`        | ⏱ Planned      | ⏱ Planned      |       |
| `YFact`        | ⏱ Planned      | ⏱ Planned      |       |
| `Tmin`         | ⏱ Planned      | ⏱ Planned      |       |
| `Tmax`         | ⏱ Planned      | ⏱ Planned      |       |
| `Tstep`        | ⏱ Planned      | ⏱ Planned      |       |
| `&thetamin`    | ⏱ Planned      | ⏱ Planned      |       |
| `&thetamax`    | ⏱ Planned      | ⏱ Planned      |       |
| `&thetastep`   | ⏱ Planned      | ⏱ Planned      |       |
| `u(nMin)`      | ⏱ Planned      | ⏱ Planned      |       |
| `v(nMin)`      | ⏱ Planned      | ⏱ Planned      |       |
| `w(nMin)`      | ⏱ Planned      | ⏱ Planned      |       |
| `nMin`         | ⏱ Planned      | ⏱ Planned      |       |
| `nMax`         | ⏱ Planned      | ⏱ Planned      |       |
| `PlotStart`    | ⏱ Planned      | ⏱ Planned      |       |
| `PlotStep`     | ⏱ Planned      | ⏱ Planned      |       |


#### Zoom Vars

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `ZXmin`        | ⏱ Planned      | ⏱ Planned      |       |
| `ZXmax`        | ⏱ Planned      | ⏱ Planned      |       |
| `ZXscl`        | ⏱ Planned      | ⏱ Planned      |       |
| `ZYmin`        | ⏱ Planned      | ⏱ Planned      |       |
| `ZYmax`        | ⏱ Planned      | ⏱ Planned      |       |
| `ZYscl`        | ⏱ Planned      | ⏱ Planned      |       |
| `ZXres`        | ⏱ Planned      | ⏱ Planned      |       |
| `ZTmin`        | ⏱ Planned      | ⏱ Planned      |       |
| `ZTmax`        | ⏱ Planned      | ⏱ Planned      |       |
| `ZTstep`       | ⏱ Planned      | ⏱ Planned      |       |
| `Z&thetamin`   | ⏱ Planned      | ⏱ Planned      |       |
| `Z&thetamax`   | ⏱ Planned      | ⏱ Planned      |       |
| `Z&thetastep`  | ⏱ Planned      | ⏱ Planned      |       |
| `Zu(nMin)`     | ⏱ Planned      | ⏱ Planned      |       |
| `Zv(nMin)`     | ⏱ Planned      | ⏱ Planned      |       |
| `Zw(nMin)`     | ⏱ Planned      | ⏱ Planned      |       |
| `ZnMin`        | ⏱ Planned      | ⏱ Planned      |       |
| `ZnMax`        | ⏱ Planned      | ⏱ Planned      |       |
| `ZPlotStart`   | ⏱ Planned      | ⏱ Planned      |       |
| `ZPlotStep`    | ⏱ Planned      | ⏱ Planned      |       |

#### Statistics

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `Stat vars`    | ⛔ Out of scope | ⛔ Out of scope | too many to list |

#### Table

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `TblStart`     | ⛔ Out of scope | ⛔ Out of scope |       |
| `&deltaTbl`    | ⛔ Out of scope | ⛔ Out of scope |       |
| `TblInput`     | ⛔ Out of scope | ⛔ Out of scope |       |

### Distr

#### Distr

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `normalpdf(`   | ⛔ Out of scope | ⛔ Out of scope |       |
| `normalcdf(`   | ⛔ Out of scope | ⛔ Out of scope |       |
| `invNorm(`     | ⛔ Out of scope | ⛔ Out of scope |       |
| `invT(`        | ⛔ Out of scope | ⛔ Out of scope |       |
| `tpdf(`        | ⛔ Out of scope | ⛔ Out of scope |       |
| `tcdf(`        | ⛔ Out of scope | ⛔ Out of scope |       |
| `x2pdf(`       | ⛔ Out of scope | ⛔ Out of scope |       |
| `x2cdf(`       | ⛔ Out of scope | ⛔ Out of scope |       |
| `Fpdf(`        | ⛔ Out of scope | ⛔ Out of scope |       |
| `Fcdf(`        | ⛔ Out of scope | ⛔ Out of scope |       |
| `binompdf(`    | ⛔ Out of scope | ⛔ Out of scope |       |
| `binomcdf(`    | ⛔ Out of scope | ⛔ Out of scope |       |
| `poissonpdf(`  | ⛔ Out of scope | ⛔ Out of scope |       |
| `poissoncdf(`  | ⛔ Out of scope | ⛔ Out of scope |       |
| `geometpdf(`   | ⛔ Out of scope | ⛔ Out of scope |       |
| `geometcdf(`   | ⛔ Out of scope | ⛔ Out of scope |       |

#### Draw

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `ShadeNorm(`   | ⛔ Out of scope | ⛔ Out of scope |       |
| `Shade_t(`     | ⛔ Out of scope | ⛔ Out of scope |       |
| `ShadeX2(`     | ⛔ Out of scope | ⛔ Out of scope |       |
| `ShadeF(`      | ⛔ Out of scope | ⛔ Out of scope |       |

### Stat Plot

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `Plot1(`       | ⛔ Out of scope | ⛔ Out of scope |       |
| `Plot2(`       | ⛔ Out of scope | ⛔ Out of scope |       |
| `Plot3(`       | ⛔ Out of scope | ⛔ Out of scope |       |
| `PlotsOff`     | ⛔ Out of scope | ⛔ Out of scope |       |
| `PlotsOn`      | ⛔ Out of scope | ⛔ Out of scope |       |
| `Scatter`      | ⛔ Out of scope | ⛔ Out of scope |       |
| `xyLine`       | ⛔ Out of scope | ⛔ Out of scope |       |
| `Histogram`    | ⛔ Out of scope | ⛔ Out of scope |       |
| `ModBoxplot`   | ⛔ Out of scope | ⛔ Out of scope |       |
| `Boxplot`      | ⛔ Out of scope | ⛔ Out of scope |       |
| `NormProbPlot` | ⛔ Out of scope | ⛔ Out of scope |       |
| `&box`         | ⏱ Planned      | ⏱ Planned      |       |
| `&cross`       | ⏱ Planned      | ⏱ Planned      |       |
| `&dot`         | ⏱ Planned      | ⏱ Planned      |       |

### Table Setup

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `IndpntAuto`   | ⛔ Out of scope | ⛔ Out of scope |       |
| `IndpntAsk`    | ⛔ Out of scope | ⛔ Out of scope |       |
| `DependAuto`   | ⛔ Out of scope | ⛔ Out of scope |       |
| `DependAsk`    | ⛔ Out of scope | ⛔ Out of scope |       |

### Format

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `RectGC`       | ⏱ Planned      | ⏱ Planned      |       |
| `PolarGC`      | ⏱ Planned      | ⏱ Planned      |       |
| `CoordOn`      | ⏱ Planned      | ⏱ Planned      |       |
| `CoordOff`     | ⏱ Planned      | ⏱ Planned      |       |
| `GridOff`      | ⏱ Planned      | ⏱ Planned      |       |
| `GridOn`       | ⏱ Planned      | ⏱ Planned      |       |
| `AxesOn`       | ⏱ Planned      | ⏱ Planned      |       |
| `AxesOff`      | ⏱ Planned      | ⏱ Planned      |       |
| `LabelOff`     | ⏱ Planned      | ⏱ Planned      |       |
| `LabelOn`      | ⏱ Planned      | ⏱ Planned      |       |
| `ExprOn`       | ⏱ Planned      | ⏱ Planned      |       |
| `ExprOff`      | ⏱ Planned      | ⏱ Planned      |       |

### Zoom

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `ZBox`         | ⏱ Planned      | ⏱ Planned      |       |
| `Zoom In`      | ⏱ Planned      | ⏱ Planned      |       |
| `Zoom Out`     | ⏱ Planned      | ⏱ Planned      |       |
| `ZDecimal`     | ⏱ Planned      | ⏱ Planned      |       |
| `ZSquare`      | ⏱ Planned      | ⏱ Planned      |       |
| `ZStandard`    | ⏱ Planned      | ⏱ Planned      |       |
| `ZTrig`        | ⏱ Planned      | ⏱ Planned      |       |
| `ZInteger`     | ⏱ Planned      | ⏱ Planned      |       |
| `ZoomStat`     | ⏱ Planned      | ⏱ Planned      |       |
| `ZoomFit`      | ⏱ Planned      | ⏱ Planned      |       |
| `ZPrevious`    | ⏱ Planned      | ⏱ Planned      |       |
| `ZoomSto`      | ⏱ Planned      | ⏱ Planned      |       |
| `ZoomRcl`      | ⏱ Planned      | ⏱ Planned      |       |

### Matrix

| Command        | Grammar          | Behavior        | Notes |
| -------------- | ---------------- | --------------- | ----- |
| `det(`         | ⏱ Planned      | ⏱ Planned      |       |
| `&T`           | ⏱ Planned      | ⏱ Planned      |       |
| `dim(`         | ⏱ Planned      | ⏱ Planned      |       |
| `Fill(`        | ⏱ Planned      | ⏱ Planned      |       |
| `identity(`    | ⏱ Planned      | ⏱ Planned      |       |
| `randM(`       | ⏱ Planned      | ⏱ Planned      |       |
| `augment(`     | ⏱ Planned      | ⏱ Planned      |       |
| `Matr>list(`   | ⏱ Planned      | ⏱ Planned      |       |
| `List>matr(`   | ⏱ Planned      | ⏱ Planned      |       |
| `cumSum(`      | ⏱ Planned      | ⏱ Planned      |       |
| `ref(`         | ⏱ Planned      | ⏱ Planned      |       |
| `rref(`        | ⏱ Planned      | ⏱ Planned      |       |
| `rowSwap(`     | ⏱ Planned      | ⏱ Planned      |       |
| `row+(`        | ⏱ Planned      | ⏱ Planned      |       |
| `*row(`        | ⏱ Planned      | ⏱ Planned      |       |
| `*row+(`       | ⏱ Planned      | ⏱ Planned      |       |