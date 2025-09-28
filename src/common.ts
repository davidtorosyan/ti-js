// entry point (common)
// ====================

import { run, RunOptions, ProgramHandle } from './run/runtime'
import { on } from './run/daemon'
import { parse, ParseOptions } from './parse/parser'
import * as types from './common/types'
import { getVersion, getBuildTime } from './common/version'
import { CanvasLike, CanvasRenderingContext2DLike } from './common/core'

export {
  run,
  on,
  parse,
  types,
  getVersion,
  getBuildTime,
}

export type {
  RunOptions,
  ProgramHandle,
  ParseOptions,
  CanvasLike,
  CanvasRenderingContext2DLike,
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
