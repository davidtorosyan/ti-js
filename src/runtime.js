import * as core from './core'

export function disp (io, x) {
  let str = x.value.toString()
  if (x.type === 'numeric' && str.startsWith('0.')) {
    str = str.substring(1)
  }
  io.stdout(str)
}

export function prompt (io, ctl, x) {
  io.stdout(`${x.name}=?`, false)
  io.onStdin(input => ctl.resume(() => {
    if (input === null || input === undefined || input === '') {
      io.stdout('')
      throw core.error('ti', 'SYNTAX', true)
    }

    io.stdout(input)
    assign(x, num(input))
  }))
}

export function assign (variable, value) {
  if (variable.type === value.type) {
    variable.value = value.value
  } else if (variable.type === 'numeric') {
    // do nothing
  } else if (variable.type === 'string') {
    throw core.error('ti', 'DATA TYPE')
  } else {
    throw core.error('lib', 'UnknownVariableType')
  }
}

export function num (integer, fraction, exponent) {
  let str = ''
  if (integer !== undefined) {
    str += integer
  }
  if (fraction !== undefined) {
    str += '.' + fraction
  }
  if (exponent !== undefined) {
    str += 'e' + exponent
  }
  return core.new_value(parseFloat(str))
};

export function str (x) { return core.new_value(x, 'string') }

const unaryOperation = (operation, supportedTypes = ['numeric']) =>
  (x) => {
    if (!supportedTypes.includes(x.type)) { throw core.error('ti', 'DATA TYPE') }
    return core.new_value(operation(x.value), x.type)
  }

export const negative = unaryOperation(x => -1 * x)

const binaryOperation = (operation, supportedTypes = ['numeric']) =>
  (x, y) => {
    if (x.type !== y.type || !supportedTypes.includes(x.type)) { throw core.error('ti', 'DATA TYPE') }
    return core.new_value(operation(x.value, y.value), x.type)
  }

export const multiply = binaryOperation((x, y) => x * y)
export const divide = binaryOperation((x, y) => x / y)
export const add = binaryOperation((x, y) => x + y, ['numeric', 'string'])
export const minus = binaryOperation((x, y) => x - y)

const testOperation = (operation, supportedTypes = ['numeric']) =>
  binaryOperation((x, y) => operation(x, y) ? 1 : 0, supportedTypes)

export const testEquals = testOperation((x, y) => x === y, ['numeric', 'string'])
export const testNotEquals = testOperation((x, y) => x !== y, ['numeric', 'string'])
export const testGreater = testOperation((x, y) => x > y)
export const testGreaterEquals = testOperation((x, y) => x >= y)
export const testLess = testOperation((x, y) => x < y)
export const testLessEquals = testOperation((x, y) => x <= y)
