// entry point (common)
// ====================

import { run, RunOptions, ProgramHandle } from './run/runtime'
import { on } from './run/daemon'
import { parse, ParseOptions } from './parse/parser'
import * as types from './common/types'
import { getVersion, getBuildTime } from './common/version'

export {
  run,
  RunOptions,
  ProgramHandle,
  on,
  parse,
  ParseOptions,
  types,
  getVersion,
  getBuildTime,
}

/**
 * @alpha
 */
export function exec (source: string, callback: (output: string) => void): void {
  const lines = parse(source)
  run(lines, {
    outputCallback: callback,
  })
}
