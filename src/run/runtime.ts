// runtime
// =======

import * as core from '../common/core'
import * as signal from '../common/signal'
import * as types from '../common/types'
import * as statement from '../evaluate/statement'
import * as iolib from '../evaluate/helper/iolib'
import * as daemon from './daemon'
import { Memory } from '../device/memory'

/**
 * @alpha
 */
export interface RunOptions {
  source?: string | string[]
  frequencyMs?: number
  outputCallback?: (value: string, newline: boolean) => void
  elem?: JQuery
  debug?: boolean
  callback?: (status: string) => void
  input?: JQuery
  stdin?: string
  includeErrors?: boolean
  includeLibErrors?: boolean
  includeLineNumbers?: boolean
  includeSource?: boolean
}

/**
 * @alpha
 */
export interface ProgramHandle {
  getStatus(): string
  isActive(): boolean
  stop(): void
}

/**
 * @alpha
 */
export function run (lines: types.Line[], options: RunOptions = {}): ProgramHandle {
  let sourceLines: string[] | undefined
  if (options.source !== undefined) {
    if (Array.isArray(options.source)) {
      sourceLines = options.source
    } else {
      sourceLines = options.source.split(/\r?\n/)
    }
  }

  let frequencyMs = 1
  if (options.frequencyMs !== undefined) {
    frequencyMs = options.frequencyMs
  }

  const ioOptions: iolib.IoOptions = {
    includeErrors: options.includeErrors ?? true,
    includeLibErrors: options.includeLibErrors ?? true,
    includeLineNumbers: options.includeLineNumbers ?? false,
    includeSource: options.includeSource ?? false,
  }

  if (options.outputCallback !== undefined) {
    ioOptions.output = options.outputCallback
  }
  if (options.elem !== undefined) {
    ioOptions.output = iolib.elemOutput(options.elem)
  }
  if (options.input !== undefined) {
    ioOptions.input = options.input
  }
  if (options.stdin !== undefined) {
    ioOptions.stdin = options.stdin
  }

  const state: statement.State = {
    mem: new Memory(),

    resume: undefined,
    resumeCallback: undefined,

    debug: options.debug === true,
    sourceLines,

    searchLabel: undefined,
    ifResult: undefined,
    incrementDecrementResult: undefined,

    maximumLines: 50,
    linesRun: 0,

    blockStack: [],
    falsyStackHeight: undefined,
    falsyBlockPreviousIf: undefined,

    i: 0,
    lines,

    frequencyMs,

    status: 'pending',

    rows: 8,
    columns: 16,

    io: ioOptions,
  }

  if (options.callback !== undefined) {
    state.callback = options.callback
  }

  const taskId = daemon.setTinyInterval(
    () => runLoop(state),
    state.frequencyMs,
    { debug: state.debug },
  )
  state.resume = (callback): void => {
    state.resumeCallback = callback
    daemon.resumeTinyInterval(taskId)
  }

  return {
    getStatus: () => state.status,
    isActive: () => state.status === 'pending' || state.status === 'running',
    stop: (): void => {
      iolib.cleanup(state.io)
      daemon.clearTinyInterval(taskId)
    },
  }
}

function runLoop (state: statement.State): string | undefined {
  let result: string | undefined
  let exceptionToThrow

  try {
    state.status = 'running'
    result = runLine(state)
  } catch (ex: unknown) {
    if (!(ex instanceof core.TiJsError)) {
      state.status = 'faulted'
      exceptionToThrow = ex
    } else {
      state.status = 'err'
      let sourceLine: core.TiJsSource | undefined
      if (state.i < state.lines.length) {
        const currentLine = state.lines[state.i]
        if (currentLine !== undefined) {
          let source = currentLine.source
          if (state.sourceLines !== undefined) {
            source = state.sourceLines[state.i]
          }
          sourceLine = {
            index: state.i,
            line: source,
          }
        }
      }

      iolib.stderr(ex, state.io, sourceLine)
    }

    result = signal.DONE
  }

  if (result === signal.DONE) {
    if (state.status !== 'faulted' && state.status !== 'err') {
      state.status = 'done'
    }

    const callback = state.callback
    if (callback !== undefined) {
      setTimeout(() => callback(state.status), 0)
    }

    if (typeof exceptionToThrow !== 'undefined') {
      throw exceptionToThrow
    }
  } else {
    state.i += 1
  }

  return result
}

function runLine (state: statement.State): string | undefined {
  if (state.debug) {
    console.debug({
      Line: state.i,
      searchLabel: state.searchLabel,
      ifResult: state.ifResult,
      blockStack: state.blockStack,
      falsyStackHeight: state.falsyStackHeight,
      falsyBlockPreviousIf: state.falsyBlockPreviousIf,
      source: (state.sourceLines ?? [])[state.i],
      mem: state.mem,
    })
  }

  if (state.resumeCallback !== undefined) {
    state.resumeCallback()
    state.resumeCallback = undefined
  }

  const line = state.lines[state.i]?.statement

  if (line === undefined) {
    if (state.searchLabel !== undefined) {
      throw new core.TiError(core.TiErrorCode.Label)
    }

    if (state.ifResult !== undefined || state.incrementDecrementResult !== undefined) {
      throw new core.TiError(core.TiErrorCode.Syntax)
    }

    if (state.debug) {
      console.debug(state.mem)
    }

    return signal.DONE
  }

  state.linesRun++

  if (state.linesRun >= state.maximumLines) {
    throw new core.LibError('maxlines')
  }

  const type = line.type

  // ----- scan for end -----

  if (state.falsyStackHeight !== undefined) {
    const lastBlockIndex = state.blockStack[state.blockStack.length - 1]
    if (lastBlockIndex === undefined) {
      throw new core.LibError('falsy stack lead to missing line index')
    }
    const lastBlock = state.lines[lastBlockIndex]?.statement
    if (lastBlock === undefined) {
      throw new core.LibError('falsy stack lead to missing line')
    }

    if (type === types.EndStatement ||
      (type === types.ElseStatement && lastBlock.type === types.ThenStatement)) {
      state.blockStack.pop()

      if (state.blockStack.length < state.falsyStackHeight) {
        state.falsyStackHeight = undefined
      }
    }

    if (type === types.ForLoop ||
      type === types.RepeatLoop ||
      type === types.WhileLoop ||
      (type === types.ThenStatement && state.falsyBlockPreviousIf === true) ||
      (type === types.ElseStatement && lastBlock.type === types.ThenStatement)) {
      state.blockStack.push(state.i)
    }

    state.falsyBlockPreviousIf = type === types.IfStatement
    return
  }

  state.falsyBlockPreviousIf = undefined

  // ----- search for label -----

  if (state.searchLabel !== undefined) {
    if (type === types.LabelStatement && line.location === state.searchLabel) {
      state.searchLabel = undefined
    }

    return
  }

  // ----- check if result -----

  if (state.ifResult !== undefined) {
    const ifResultFalse = !state.ifResult
    state.ifResult = undefined

    if (type === types.ThenStatement) {
      state.blockStack.push(state.i)

      if (ifResultFalse) {
        state.falsyStackHeight = state.blockStack.length
      }

      return
    }

    if (ifResultFalse) {
      return
    }
  }

  // ----- check incrementDecrementResult -----

  if (state.incrementDecrementResult !== undefined) {
    const incrementDecrementResultFalse = !state.incrementDecrementResult
    state.incrementDecrementResult = undefined

    if (incrementDecrementResultFalse) {
      return
    }
  }

  // ----- normal execution -----

  const couldHaveExtra =
    type === types.IfStatement ||
    type === types.ThenStatement ||
    type === types.ElseStatement ||
    type === types.ForLoop ||
    type === types.WhileLoop ||
    type === types.RepeatLoop ||
    type === types.EndStatement

  if (couldHaveExtra && line.extra === true) {
    throw new core.TiError(core.TiErrorCode.Syntax)
  }

  const couldHaveArgs =
    type === types.ForLoop

  if (couldHaveArgs && line.args) {
    throw new core.TiError(core.TiErrorCode.Argument)
  }

  return statement.evaluate(line, state)
}
