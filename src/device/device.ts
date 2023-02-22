// device
// ====

import { Memory } from './memory'
import type * as types from '../common/types'
import type * as iolib from '../evaluate/helper/iolib'

export { Memory }

export interface RuntimeSettings {
  debug: boolean
  maximumLines: number
  frequencyMs: number
}

export interface IoSettings {
  rows: number
  columns: number
  io: iolib.IoOptions
}

export interface Callbacks {
  resume: ((callback?: () => void) => void) | undefined
  resumeCallback: (() => void) | undefined
  callback?: (status: string) => void
}

export interface Program {
  lines: types.Line[]
  sourceLines: string[] | undefined
}

export interface ProgramState {
  searchLabel: string | undefined
  ifResult: boolean | undefined
  incrementDecrementResult: boolean | undefined
  linesRun: number
  blockStack: number[]
  falsyStackHeight: number | undefined
  falsyBlockPreviousIf: boolean | undefined
  i: number
  status: string
}

export class Device {
  private memory: Memory = new Memory()
}
