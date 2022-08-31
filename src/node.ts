// entry point (node)
// ==================

import * as nodeLoader from './inject/node/loader.node'

/**
 * A library for compiling and running TI-Basic.
 *
 * @packageDocumentation
 */

import { run, RunOptions } from './run/runtime'
import { on } from './run/daemon'
import { parse, ParseOptions } from './parse/parser'
import * as types from './common/types'

nodeLoader.init()

export {
  run,
  RunOptions,
  on,
  parse,
  ParseOptions,
  types,
}

/**
 * @alpha
 */
export function exec (source: string, callback: (output: string) => void) {
  const lines = parse(source)
  run(lines, {
    outputCallback: callback,
  })
}
