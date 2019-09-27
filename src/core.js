/* eslint-disable camelcase */
import * as daemon from './daemon'
import * as iolib from './io'
import * as types from './types'

let default_mem

function get_mem () {
  if (default_mem === undefined) {
    default_mem = new_mem()
  }

  return default_mem
}

export function error (type, code, hideSource = false) {
  return {
    type: type,
    code: code,
    hideSource: hideSource
  }
}

// eslint-disable-next-line camelcase
export function new_value (num, type = 'numeric') {
  return {
    type: type,
    value: num
  }
}

// eslint-disable-next-line camelcase
function new_var (name) {
  const val = new_value(0)
  val.name = name
  return val
};

// eslint-disable-next-line camelcase
export function new_mem () {
  return {
    vars: {
      A: new_var('A'),
      B: new_var('B'),
      C: new_var('C'),
      D: new_var('D'),
      E: new_var('E'),
      F: new_var('F'),
      G: new_var('G'),
      H: new_var('H'),
      I: new_var('I'),
      J: new_var('J'),
      K: new_var('K'),
      L: new_var('L'),
      M: new_var('M'),
      N: new_var('N'),
      O: new_var('O'),
      P: new_var('P'),
      Q: new_var('Q'),
      R: new_var('R'),
      S: new_var('S'),
      T: new_var('T'),
      U: new_var('U'),
      V: new_var('V'),
      W: new_var('W'),
      X: new_var('X'),
      Y: new_var('Y'),
      Z: new_var('Z'),
      THETA: new_var('θ')
    },
    ans: new_var(),
    prgms: []
  }
};

export function isTruthy (x) {
  return x.value !== 0
}

export function prgmNew (name, program, source = []) {
  get_mem().prgms.push(
    {
      name: name,
      program: program,
      source: source
    })
}

export function prgmExec (name) {
  const found = get_mem().prgms.find(e => e.name === name)

  if (found === undefined) {
    error('UNDEFINED')
  }

  run(found.program, { source: found.source })
}

export function run (lines, options = {}) {
  let sourceLines = []
  if (options.source !== undefined) {
    if (Array.isArray(options.source)) {
      sourceLines = options.source
    } else {
      sourceLines = options.source.split(/\r?\n/)
    }
  }

  let io = iolib.default_io
  if (options.io !== undefined) {
    io = options.io
  }

  let frequencyMs = 1
  if (options.frequencyMs !== undefined) {
    frequencyMs = options.frequencyMs
  }

  const state = {
    bus: {
      mem: new_mem(),
      io: io,
      ctl: {
        resume: undefined,
        callback: undefined
      }
    },

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
  state.bus.ctl.resume = (callback) => {
    state.bus.ctl.callback = callback
    daemon.resumeTinyInterval(taskId)
  }

  return {
    getStatus: () => state.status,
    isActive: () => state.status === 'pending' || state.status === 'running',
    stop: () => daemon.clearTinyInterval(taskId)
  }
}

export function runLoop (state) {
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
      ex.source = {
        index: state.i,
        line: state.sourceLines === undefined ? undefined : state.sourceLines[state.i]
      }
    }

    iolib.error(state.bus.io, ex)
    result = daemon.DONE
  }

  if (result === daemon.DONE) {
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

export function runLine (state) {
  if (state.debug) {
    console.log(`Line: ${state.i}, \t\
searchLabel: ${state.searchLabel || ''}, \t\
ifResult: ${state.ifResult || ''}, \t\
blockStack: ${state.blockStack || ''} \t\
falsyStackHeight: ${state.falsyStackHeight || ''}, \t\
falsyBlockPreviousIf: ${state.falsyBlockPreviousIf || ''}, \t\
source: ${state.sourceLines[state.i] || ''}`)
  }

  if (state.i >= state.lines.length) {
    if (state.searchLabel !== undefined) {
      throw error('ti', 'LABEL')
    }

    if (state.debug) {
      console.log(state.bus.mem)
    }

    return daemon.DONE
  }

  if (state.bus.ctl.callback !== undefined) {
    state.bus.ctl.callback()
    state.bus.ctl.callback = undefined
  }

  state.linesRun++

  if (state.linesRun >= state.maximumLines) {
    throw error('lib', 'maxlines')
  }

  const line = state.lines[state.i]
  const type = line.type

  // ----- scan for end -----

  if (state.falsyStackHeight !== undefined) {
    const lastBlockIndex = state.blockStack[state.blockStack.length - 1]
    const lastBlock = state.lines[lastBlockIndex]

    if (type === 'EndStatement' ||
      (type === 'ElseStatement' && lastBlock.type === 'ThenStatement')) {
      state.blockStack.pop()

      if (state.blockStack.length < state.falsyStackHeight) {
        state.falsyStackHeight = undefined
      }
    }

    if (type === 'ForLoop' ||
      type === 'RepeatLoop' ||
      type === 'WhileLoop' ||
      (type === 'ThenStatement' && state.falsyBlockPreviousIf === true) ||
      (type === 'ElseStatement' && lastBlock.type === 'ThenStatement')) {
      state.blockStack.push(state.i)
    }

    state.falsyBlockPreviousIf = type === 'IfStatement'
    return
  }

  state.falsyBlockPreviousIf = undefined

  // ----- search for label -----

  if (state.searchLabel !== undefined) {
    if (type === 'LabelStatement' && line.label === state.searchLabel) {
      state.searchLabel = undefined
    }

    return
  }

  // ----- check if result -----

  if (state.ifResult !== undefined) {
    const ifResultFalse = state.ifResult !== true
    state.ifResult = undefined

    if (type === 'ThenStatement') {
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

  let source, sourceLine

  switch (type) {
    // ----- CtlStatement -----
    case 'IfStatement':
      state.ifResult = isTruthy(line.condition(state.bus))
      break
    case 'ThenStatement':
      throw error('ti', 'SYNTAX')
    case 'ElseStatement':
      if (state.blockStack.length === 0) {
        throw error('ti', 'SYNTAX')
      }
      if (state.lines[state.blockStack.pop()].type === 'ThenStatement') {
        state.blockStack.push(state.i)
        state.falsyStackHeight = state.blockStack.length
      } else {
        throw error('ti', 'SYNTAX')
      }
      break
    case 'ForLoop':
      line.init(state.bus)
      state.blockStack.push(state.i)
      if (!isTruthy(line.condition(state.bus))) {
        state.falsyStackHeight = state.blockStack.length
      }
      break
    case 'WhileLoop':
      state.blockStack.push(state.i)
      if (!isTruthy(line.condition(state.bus))) {
        state.falsyStackHeight = state.blockStack.length
      }
      break
    case 'RepeatLoop':
      state.blockStack.push(state.i)
      break
    case 'EndStatement':
      if (state.blockStack.length === 0) {
        throw error('ti', 'SYNTAX')
      }
      source = state.blockStack.pop()
      sourceLine = state.lines[source]
      if (sourceLine.type === 'ForLoop' ||
              sourceLine.type === 'WhileLoop' ||
              sourceLine.type === 'RepeatLoop') {
        if (sourceLine.type === 'ForLoop') {
          sourceLine.step(state.bus)
        }

        if (isTruthy(sourceLine.condition(state.bus))) {
          state.blockStack.push(source)
          state.i = source
        }
      } else if (sourceLine.type === 'ThenStatement' ||
                  sourceLine.type === 'ElseStatement') {
        // empty
      } else {
        throw error('lib', `impossibleEndFrom'${sourceLine.type}`)
      }
      break
    case 'PauseStatement':
      throw error('lib', 'unimplemented')
    case 'LabelStatement':
      break
    case 'GotoStatement':
      state.searchLabel = line.label
      state.i = -1
      break
      // TODO increment and decrement have an interaction with DelVar
    case 'IncrementSkip':
      line.increment(state.bus)
      state.incrementDecrementResult = isTruthy(line.condition(state.bus))
      break
    case 'DecrementSkip':
      line.decrement(state.bus)
      state.incrementDecrementResult = isTruthy(line.condition(state.bus))
      break
      // ----- other -----
    case 'Assignment':
      line.statement(state.bus)
      break
    case 'Display':
      state.bus.io.stdout(valueToString(evaluate(line.value)))
      break
    case 'IoStatement':
      line.statement(state.bus)
      if (line.action === 'suspend') {
        return daemon.SUSPEND
      }
      break
    case 'ValueStatement':
      state.bus.mem.ans = line.statement(state.bus)
      break
    case 'SyntaxError':
      throw error('ti', 'SYNTAX')
    default:
      throw error('lib', 'unexpected')
  }
}

function evaluate (value) {
  switch (value.type) {
    case types.NUMBER:
      return value
    case 'binary':
      return applyBinaryOperator(value)
    default:
      throw error('lib', 'unexpected')
  }
}

function applyBinaryOperator (value) {
  const left = evaluate(value.left)
  const right = evaluate(value.right)
  switch (left.type) {
    case types.NUMBER:
      return applyBinaryOperatorToNumber(left, right, value.operator)
    default:
      throw error('lib', 'unexpected')
  }
}

function applyBinaryOperatorToNumber (left, right, operator) {
  if (right.type !== types.NUMBER) {
    throw error('ti', 'DATA TYPE')
  }
  const leftNumber = resolveNumber(left)
  const rightNumber = resolveNumber(right)

  let result
  switch (operator) {
    case '+': result = leftNumber + rightNumber; break
    case '-': result = leftNumber - rightNumber; break
    default: throw error('lib', 'unexpected')
  }
  return { type: types.NUMBER, float: result }
}

function resolveNumber (value) {
  if (value.float !== undefined) {
    return value.float
  }
  let str = ''
  if (value.integer !== undefined) {
    str += value.integer
  }
  if (value.fraction !== undefined) {
    str += '.' + value.fraction
  }
  if (value.exponent !== undefined) {
    str += 'e' + value.exponent
  }
  return parseFloat(str)
}

function valueToString (value) {
  let str = ''
  switch (value.type) {
    case types.NUMBER:
      str = resolveNumber(value).toString()
      if (str.startsWith('0.')) {
        str = str.substring(1)
      }
      break
    default:
      throw error('lib', 'unexpected')
  }
  return str
}
