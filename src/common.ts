// entry point (common)
// ====================

import { run, RunOptions } from './run/runtime'
import { on } from './run/daemon'
import { parse, ParseOptions } from './parse/parser'
import * as types from './common/types'

/**
 * A library for compiling and running TI-Basic.
 *
 * @packageDocumentation
 */
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
