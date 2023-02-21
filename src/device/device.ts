// device
// ====

import { Memory } from './memory'

export { Memory }

export interface State {
  debug: boolean
  maximumLines: number
  frequencyMs: number
  rows: number
  columns: number
  io: iolib.IoOptions
}

export interface State {
  rows: number
  columns: number
  io: iolib.IoOptions
}

export interface State {
  resume: ((callback?: () => void) => void) | undefined
  resumeCallback: (() => void) | undefined
  callback?: (status: string) => void
}

export interface State {
  sourceLines: string[] | undefined
  lines: types.Line[]
}

export interface State {
  searchLabel: string | undefined
  ifResult: boolean | undefined
  incrementDecrementResult: boolean | undefined
  linesRun: number
  blockStack: number[]
  falsyStackHeight: number | undefined
  falsyBlockPreviousIf: boolean | undefined
  i: number
  lines: types.Line[]
  status: string
}

export class Device {
  private memory: Memory = new Memory()
}
