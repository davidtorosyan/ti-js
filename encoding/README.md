# TI-JS Character Encoding

This is a code generation project for managing character encoding.

If you're not sure what this is, refer first to the [README.md](../README.md) of the TI-JS project.

## Table of contents

- [Overview](#overview)
- [Artifacts](#artifacts)
- [Commands](#commands)

## Overview

The TI-84 graphic calculator (and its siblings) use custom character encoding.
This presents a few challenges, namely:
* There's no obvious way to type or render many of the characters.
* Transferring a program between a calculator and a PC means you can lose data if you're not careful.

This project seeks to fix this by creating a table that maps between TI character encoding and more standard representations.

As an example, the equivalent of an "if statement" is actually represented by a single byte: `0xCE`.
It's renderered as:

<img src="./out/sprites/token_0x00CE.png" alt="0x00CE" width="95px" height="55px">

In the TI-JS language however, we'll represent it as `&{If }` to disambiguate it from the sequence `I`, `f`, and the space character.

Rather than figure this out by hand, we take existing resources and run them through some simple transformations.
The resulting artifacts will be used by the main TI-JS project.

Resources:
* [parse8xp](https://github.com/Lekensteyn/parse8xp)
* [tiopt, the TI-83 Basic optimizer](https://www.club.cc.cmu.edu/~ajo/ti/tiopt.html)
* [TI-Basic Developer: Tokens and Token Size](http://tibasicdev.wikidot.com/tokens)
* [TI-Basic Developer: TI-83 Plus Large Font](http://tibasicdev.wikidot.com/83lgfont)

## Artifacts

### Input

| File                                | Description |
| ----------------------------------- | ------------|
| [input.csv](./data/input.csv)       | Mostly sourced from `parse8xp`, this is our staring point, a list of hex codes and their nearest ASCII representations. |
| [glyphs.txt](./data/glyphs.txt)     | An list of single-character tokens along with their pixel representation in emoji form.  |
| [unicode.csv](./data/unicode.csv)   | The first thousand unicode characters, mainly to grab their names. |
| [web.txt](./data/web.txt)           | Image URLs sourced from the TI-Basic Developer wiki, used to generate glyphs. |

### Output

| File                                | Description |
| ----------------------------------- | ------------|
| [ENCODING.md](./out/ENCODING.md)    |  |
| [output.json](./out/output.json)    |  |
| [sprites.png](./out/sprites.png)    |  |
| [sprites/](./out/)                  |  |

A note on image encoding:

## Commands

Make sure you have [node](https://nodejs.org/en/) installed then run:
```sh
npm install
```

You can now then run any of the scripts in [package.json](package.json).
Here's a list of the more useful commands:

| Command                | Description |
| ---------------------- | ------------|
| `npm run bp`           | Build and publish to ./out. Will fail if there are lint errors. |
| `npm run lint:fix`     | Fixes simple lint errors. |

You're unlikely to use the other commands directly, but here they are:

| Command                | Description |
| ---------------------- | ------------|
| `npm run clean`        | Cleans build directory. |
| `npm run build`        | Builds to ./dist. |
| `npm run lint`         | Print lint warnings and errors. Fails if there lint errors. |
| `npm run lint:prod`    | Same as above, fail even on warnings. |
| `npm run b`            | Cleans, builds, and lints. |
| `npm run b:prod`       | Same as above, fail even on lint warnings. |
| `npm run pub:clean`    | Cleans ./out. |
| `npm run pub:sprites`  | Publish sprites to ./out. |
| `npm run pub:table`    | Publish tables to ./out. |
| `npm run pub`          | Publishes everything needed to ./out. |
| `npm run pub:check`    | Fails if ./out has uncommited changes. |
| `npm run pub:prod`     | Publishes to ./out and fails if that would cause a change. |
| `npm run bp:prod`      | Build and publish, and fail if that updates ./out. |
| `npm run web`          | Downloads images from the web and computes glyphs. |