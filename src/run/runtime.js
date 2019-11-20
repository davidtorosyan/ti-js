// runtime
// =======

import * as types from '../common/types'
import * as core from '../common/core'
import * as signal from '../common/signal'
import * as statement from '../evaluate/statement'
import * as daemon from './daemon'
import * as iolib from './io'

export function run (lines, options = {}) {
  let sourceLines = []
  if (options.source !== undefined) {
    if (Array.isArray(options.source)) {
      sourceLines = options.source
    } else {
      sourceLines = options.source.split(/\r?\n/)
    }
  }

  let io = iolib.fromConsole
  if (options.io !== undefined) {
    io = options.io
  }

  let frequencyMs = 1
  if (options.frequencyMs !== undefined) {
    frequencyMs = options.frequencyMs
  }

  const state = {
    mem: core.newMem(),
    io: io,

    resume: undefined,
    resumeCallback: undefined,

    debug: options.debug === true,
    sourceLines: sourceLines,

    searchLabel: undefined,
    ifResult: undefined,
    incrementDecrementResult: undefined,

    maximumLines: 50,
    linesRun: 0,

    blockStack: [],
    falsyStackHeight: undefined,
    falsyBlockPreviousIf: undefined,

    i: 0,
    lines: lines,

    callback: options.callback,
    frequencyMs: frequencyMs,

    status: 'pending'
  }

  const taskId = daemon.setTinyInterval(() => runLoop(state), state.frequencyMs)
  state.resume = (callback) => {
    state.resumeCallback = callback
    daemon.resumeTinyInterval(taskId)
  }

  return {
    getStatus: () => state.status,
    isActive: () => state.status === 'pending' || state.status === 'running',
    stop: () => {
      io.cleanup()
      daemon.clearTinyInterval(taskId)
    }
  }
}

function runLoop (state) {
  let result

  try {
    state.status = 'running'
    result = runLine(state)
  } catch (ex) {
    state.status = 'faulted'

    if (ex.type === undefined) {
      throw ex
    }

    if (state.i < state.lines.length && ex.hideSource !== true) {
      let source = state.lines[state.i].source
      if (state.sourceLines !== undefined) {
        source = state.sourceLines[state.i]
      }
      ex.source = {
        index: state.i,
        line: source
      }
    }

    iolib.error(state.io, ex)
    result = signal.DONE
  }

  if (result === signal.DONE) {
    if (state.status !== 'faulted') {
      state.status = 'done'
    }

    if (state.callback !== undefined) {
      setTimeout(state.callback, 0)
    }
  } else {
    state.i += 1
  }

  return result
}

function runLine (state) {
  if (state.debug) {
    console.debug({
      Line: state.i,
      searchLabel: state.searchLabel,
      ifResult: state.ifResult,
      blockStack: state.blockStack,
      falsyStackHeight: state.falsyStackHeight,
      falsyBlockPreviousIf: state.falsyBlockPreviousIf,
      source: state.source,
      mem: state.mem
    })
  }

  if (state.resumeCallback !== undefined) {
    state.resumeCallback()
    state.resumeCallback = undefined
  }

  if (state.i >= state.lines.length) {
    if (state.searchLabel !== undefined) {
      throw core.LabelError
    }

    if (state.ifResult !== undefined || state.incrementDecrementResult !== undefined) {
      throw core.SyntaxError
    }

    if (state.debug) {
      console.debug(state.mem)
    }

    return signal.DONE
  }

  state.linesRun++

  if (state.linesRun >= state.maximumLines) {
    throw core.libError('maxlines')
  }

  const line = state.lines[state.i]
  const type = line.type

  // ----- scan for end -----

  if (state.falsyStackHeight !== undefined) {
    const lastBlockIndex = state.blockStack[state.blockStack.length - 1]
    const lastBlock = state.lines[lastBlockIndex]

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
    const ifResultFalse = state.ifResult !== true
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
    const incrementDecrementResultFalse = state.incrementDecrementResult !== true
    state.incrementDecrementResult = undefined

    if (incrementDecrementResultFalse) {
      return
    }
  }

  // ----- normal execution -----

  if (line.extra === true) {
    throw core.SyntaxError
  }
  if (line.args === true) {
    throw core.ArgumentError
  }

  return statement.evaluate(line, state)
}
