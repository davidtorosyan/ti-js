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
export function new_value (num, type = 'number') {
  return {
    type: type,
    value: num
  }
}

function newFloat (value = 0) {
  return { type: types.NUMBER, float: value }
}

const ONE = newFloat(1)

const MINUSONE = newFloat(-1)

// eslint-disable-next-line camelcase
export function new_mem () {
  return {
    vars: {
      A: newFloat(),
      B: newFloat(),
      C: newFloat(),
      D: newFloat(),
      E: newFloat(),
      F: newFloat(),
      G: newFloat(),
      H: newFloat(),
      I: newFloat(),
      J: newFloat(),
      K: newFloat(),
      L: newFloat(),
      M: newFloat(),
      N: newFloat(),
      O: newFloat(),
      P: newFloat(),
      Q: newFloat(),
      R: newFloat(),
      S: newFloat(),
      T: newFloat(),
      U: newFloat(),
      V: newFloat(),
      W: newFloat(),
      X: newFloat(),
      Y: newFloat(),
      Z: newFloat(),
      THETA: newFloat()
    },
    ans: newFloat(),
    prgms: []
  }
};

export function isTruthy (value) {
  if (value.type === types.NUMBER) {
    return resolveNumber(value) !== 0
  }
  return false
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
    stop: () => {
      io.cleanup()
      daemon.clearTinyInterval(taskId)
    }
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
    console.debug(`Line: ${state.i}, \t\
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
      console.debug(state.bus.mem)
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

  let source, sourceLine

  switch (type) {
    // ----- CtlStatement -----
    case types.IfStatement:
      state.ifResult = isTruthy(evaluate(line.value, state.bus.mem))
      break
    case types.ThenStatement:
      throw error('ti', 'SYNTAX')
    case types.ElseStatement:
      if (state.blockStack.length === 0) {
        throw error('ti', 'SYNTAX')
      }
      if (state.lines[state.blockStack.pop()].type === types.ThenStatement) {
        state.blockStack.push(state.i)
        state.falsyStackHeight = state.blockStack.length
      } else {
        throw error('ti', 'SYNTAX')
      }
      break
    case types.ForLoop:
      assignVariable(state.bus.mem, line.variable.name, evaluate(line.start, state.bus.mem))
      state.blockStack.push(state.i)
      if (!isTruthy(evaluate(binaryOperation(line.variable, '<=', line.end), state.bus.mem))) {
        state.falsyStackHeight = state.blockStack.length
      }
      break
    case types.WhileLoop:
      state.blockStack.push(state.i)
      if (!isTruthy(evaluate(line.value, state.bus.mem))) {
        state.falsyStackHeight = state.blockStack.length
      }
      break
    case types.RepeatLoop:
      state.blockStack.push(state.i)
      break
    case types.EndStatement:
      if (state.blockStack.length === 0) {
        throw error('ti', 'SYNTAX')
      }
      source = state.blockStack.pop()
      sourceLine = state.lines[source]
      if (sourceLine.type === types.ForLoop ||
              sourceLine.type === types.WhileLoop ||
              sourceLine.type === types.RepeatLoop) {
        if (sourceLine.type === types.ForLoop) {
          increment(state.bus.mem, sourceLine.variable, sourceLine.step)
          if (isTruthy(evaluate(binaryOperation(sourceLine.variable, '<=', sourceLine.end), state.bus.mem))) {
            state.blockStack.push(source)
            state.i = source
          }
        } else if (isTruthy(evaluate(sourceLine.value, state.bus.mem))) {
          state.blockStack.push(source)
          state.i = source
        }
      } else if (sourceLine.type === types.ThenStatement ||
                  sourceLine.type === types.ElseStatement) {
        // empty
      } else {
        throw error('lib', `impossibleEndFrom'${sourceLine.type}`)
      }
      break
    case types.PauseStatement:
      throw error('lib', 'unimplemented')
    case types.LabelStatement:
      break
    case types.GotoStatement:
      state.searchLabel = line.location
      state.i = -1
      break
      // TODO increment and decrement have an interaction with DelVar
    case types.IncrementSkip:
      increment(state.bus.mem, line.variable, ONE)
      state.incrementDecrementResult = isTruthy(evaluate(binaryOperation(line.variable, '<=', line.end), state.bus.mem))
      break
    case types.DecrementSkip:
      increment(state.bus.mem, line.variable, MINUSONE)
      state.incrementDecrementResult = isTruthy(evaluate(binaryOperation(line.variable, '>=', line.end), state.bus.mem))
      break
      // ----- other -----
    case types.AssignmentStatement:
      assignVariable(state.bus.mem, line.variable.name, evaluate(line.value, state.bus.mem))
      break
    case types.Display:
      state.bus.io.stdout(valueToString(evaluate(line.value, state.bus.mem)))
      break
    case types.Prompt:
      state.bus.io.stdout(`${line.variable.name}=?`, false)
      state.bus.io.onStdin(input => state.bus.ctl.resume(() => {
        if (input === null || input === undefined || input === '') {
          state.bus.io.stdout('')
          throw error('ti', 'SYNTAX', true)
        }
        state.bus.io.stdout(input)
        assignVariable(state.bus.mem, line.variable.name, newFloat(parseFloat(input)))
      }))
      return daemon.SUSPEND
    case types.ValueStatement:
      assignAns(state.bus.mem, evaluate(line.value, state.bus.mem))
      break
    case types.SyntaxError:
      throw error('ti', 'SYNTAX')
    default:
      throw error('lib', 'unexpected')
  }
}

function assignVariable (mem, name, value) {
  if (value.type === types.NUMBER) {
    mem.vars[name] = value
  }
}

function assignAns (mem, value) {
  mem.ans = value
}

function binaryOperation (left, operator, right) {
  return {
    type: types.BINARY,
    operator,
    left,
    right
  }
}

function increment (mem, variable, step) {
  assignVariable(mem, variable.name, evaluate({
    type: types.BINARY,
    operator: '+',
    left: variable,
    right: step
  }, mem), mem)
}

function evaluate (value, mem) {
  const t = value.type
  if (t === types.NUMBER || t === types.STRING) {
    return value
  } else if (t === types.UNARY) {
    const argument = evaluate(value.argument, mem)
    if (argument.type === types.NUMBER) {
      const argumentNumber = resolveNumber(argument)
      let result
      switch (value.operator) {
        case '-': result = -1 * argumentNumber; break
        default: throw error('lib', 'unexpected numeric unary operator')
      }
      return { type: types.NUMBER, float: result }
    }
  } else if (t === types.BINARY) {
    const left = evaluate(value.left, mem)
    const right = evaluate(value.right, mem)
    if (left.type !== right.type) {
      throw error('ti', 'DATA TYPE')
    }
    if (left.type === types.NUMBER) {
      const leftNumber = resolveNumber(left)
      const rightNumber = resolveNumber(right)
      let result
      switch (value.operator) {
        case '+': result = leftNumber + rightNumber; break
        case '-': result = leftNumber - rightNumber; break
        case '*': result = leftNumber * rightNumber; break
        case '/': result = leftNumber / rightNumber; break
        case '=': result = leftNumber === rightNumber ? 1 : 0; break
        case '!=': result = leftNumber !== rightNumber ? 1 : 0; break
        case '>=': result = leftNumber >= rightNumber ? 1 : 0; break
        case '>': result = leftNumber > rightNumber ? 1 : 0; break
        case '<=': result = leftNumber <= rightNumber ? 1 : 0; break
        case '<': result = leftNumber < rightNumber ? 1 : 0; break
        default: throw error('lib', 'unexpected numeric binray operator')
      }
      return { type: types.NUMBER, float: result }
    } else if (left.type === types.STRING) {
      let result
      let numberResult
      switch (value.operator) {
        case '+': result = left.chars + right.chars; break
        case '=': numberResult = left.chars === right.chars ? 1 : 0; break
        case '!=': numberResult = left.chars !== right.chars ? 1 : 0; break
        default: throw error('lib', 'unexpected string binary operator')
      }
      if (result !== undefined) {
        return { type: types.STRING, chars: result }
      }
      if (numberResult !== undefined) {
        return { type: types.NUMBER, float: numberResult }
      }
      throw error('lib', 'unexpected string binary result')
    }
  } else if (t === types.VARIABLE) {
    return mem.vars[value.name]
  } else if (t === types.ANS) {
    return mem.ans
  }

  throw error('lib', 'unexpected value')
}

function resolveNumber (value) {
  if (value.float !== undefined) {
    return value.float
  }
  let str = ''
  if (value.integer !== undefined && value.integer !== null) {
    str += value.integer
  }
  if (value.fraction !== undefined && value.fraction !== null) {
    str += '.' + value.fraction
  }
  if (value.exponent !== undefined && value.exponent !== null) {
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
    case types.STRING:
      str = value.chars
      break
    default:
      throw error('lib', 'unexpected value tostring')
  }
  return str
}
