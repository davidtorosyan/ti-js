// expression
// ==========

import * as core from '../common/core'
import * as types from '../common/types'
import * as operation from './operation'

export function evaluate(value: types.ValueExpression, mem: core.Memory) {
  const behavior = expressionOf.get(value.type)
  if (behavior === undefined) {
    throw core.libError('unexpected value')
  }
  return behavior(value, mem)
}

type ExpressionBehavior = (value: types.ValueExpression, mem: core.Memory) => types.ValueResolved
const expressionOf = new Map<string, ExpressionBehavior>()

// ----- Expressions -----

expressionOf.set(types.SyntaxError, (_value, _mem) => {
  throw core.SyntaxError
})

// ----- Values -----

expressionOf.set(types.NUMBER, (value, _mem) => {
  if (value.type !== types.NUMBER) {
    throw core.libError('unexpected expression type, number')
  }
  if (value.resolved) {
    return value
  }
  return core.newFloat(operation.resolveNumber(value))
})

expressionOf.set(types.STRING, (value, _mem) => {
  if (value.type !== types.STRING) {
    throw core.libError('unexpected expression type, string')
  }
  return value
})

expressionOf.set(types.LIST, (value, mem) => {
  if (value.type !== types.LIST) {
    throw core.libError('unexpected expression type, list')
  }
  if (value.resolved === true) {
    return value
  }
  return {
    type: types.LIST,
    elements: value.elements.map(function (element) {
      const result = evaluate(element, mem)
      if (result.type !== types.NUMBER) {
        // TODO: a list of lists should be a syntax error
        // However, a list of list variables should still be a data type error
        // Distinguishing them here is hard - should be done in grammar?
        throw core.DataTypeError
      }
      return result
    }),
    resolved: true,
  }
})

// ----- Variables -----

expressionOf.set(types.VARIABLE, (value, mem) => {
  if (value.type !== types.VARIABLE) {
    throw core.libError('unexpected expression type, variable')
  }
  let result = mem.vars.get(value.name)
  if (result === undefined) {
    result = core.newFloat()
    mem.vars.set(value.name, result)
  }
  return result
})

expressionOf.set(types.STRINGVARIABLE, (value, mem) => {
  if (value.type !== types.STRINGVARIABLE) {
    throw core.libError('unexpected expression type, string variable')
  }
  const result = mem.vars.get(value.name)
  if (result === undefined) {
    throw core.UndefinedError
  }
  return result
})

expressionOf.set(types.LISTVARIABLE, (value, mem) => {
  if (value.type !== types.LISTVARIABLE) {
    throw core.libError('unexpected expression type, list variable')
  }
  const result = mem.vars.get(value.name)
  if (result === undefined) {
    throw core.UndefinedError
  }
  return result
})

expressionOf.set(types.LISTINDEX, (value, mem) => {
  if (value.type !== types.LISTINDEX) {
    throw core.libError('unexpected expression type, list index')
  }
  const list = evaluate(value.list, mem)
  const index = evaluate(value.index, mem)
  if (list.type !== types.LIST) {
    throw core.libError('unexpected expression type, should be list')
  }
  if (index.type !== types.NUMBER) {
    throw core.InvalidDimError
  }
  if (index.float < 1 || index.float > list.elements.length) {
    throw core.InvalidDimError
  }
  const elem = list.elements[index.float - 1]
  if (elem === undefined) {
    throw core.libError('unexpected incorrect list length')
  }
  return core.newFloat(elem.float)
})

// ----- Tokens -----

expressionOf.set(types.ANS, (_value, mem) => {
  return mem.ans
})

expressionOf.set(types.GetKey, (_value, _mem) => {
  throw core.UnimplementedError
})

// ----- Operators -----

expressionOf.set(types.UNARY, (value, mem) => {
  if (value.type !== types.UNARY) {
    throw core.libError('unexpected expression type, unary')
  }
  const argument = evaluate(value.argument, mem)
  const behavior = unaryOf.get(argument.type)
  if (behavior === undefined) {
    throw core.libError('unexpected unary argument')
  }
  return behavior(value.operator, argument)
})

expressionOf.set(types.BINARY, (value, mem) => {
  if (value.type !== types.BINARY) {
    throw core.libError('unexpected expression type, binary')
  }
  const left = evaluate(value.left, mem)
  const right = evaluate(value.right, mem)
  const behavior = binaryOf.get(left.type)
  if (behavior === undefined) {
    throw core.libError('unexpected binary left')
  }
  return behavior(value.operator, left, right)
})

// ----- Unary -----

type UnaryBehavior = (operator: string, argument: types.ValueResolved) => types.ValueResolved
const unaryOf = new Map<string, UnaryBehavior>()

unaryOf.set(types.NUMBER, (operator, argument) => {
  if (argument.type !== types.NUMBER) {
    throw core.libError('unexpected expression type, unary number')
  }
  return core.newFloat(applyUnaryOperation(operator, argument.float))
})

unaryOf.set(types.STRING, (_operator, argument) => {
  if (argument.type !== types.STRING) {
    throw core.libError('unexpected expression type, unary string')
  }
  throw core.DataTypeError
})

unaryOf.set(types.LIST, (operator, argument) => {
  if (argument.type !== types.LIST) {
    throw core.libError('unexpected expression type, unary list')
  }
  return {
    type: types.LIST,
    elements: argument.elements.map(e => (
      core.newFloat(applyUnaryOperation(operator, e.float)))),
    resolved: true,
  }
})

// ----- Binary -----

type BinaryBehavior = (operator: string, left: types.ValueResolved, right: types.ValueResolved) => types.ValueResolved
const binaryOf = new Map<string, BinaryBehavior>()

binaryOf.set(types.NUMBER, (operator, left, right) => {
  if (left.type !== types.NUMBER) {
    throw core.libError('unexpected expression type, binary number')
  }
  if (right.type !== types.NUMBER) {
    if (right.type === types.LIST) {
      return applyBinaryOperationListAndNumber(operator, right, left)
    }
    throw core.DataTypeError
  }
  return core.newFloat(applyBinaryOperation(operator, left.float, right.float))
})

binaryOf.set(types.STRING, (operator, left, right) => {
  if (left.type !== types.STRING) {
    throw core.libError('unexpected expression type, binary string')
  }
  if (right.type !== types.STRING) {
    throw core.DataTypeError
  }
  switch (operator) {
    case '+': return { type: types.STRING, chars: left.chars + right.chars }
    case '=': return core.newFloat(left.chars === right.chars ? 1 : 0)
    case '!=': return core.newFloat(left.chars !== right.chars ? 1 : 0)
    default: throw core.DataTypeError
  }
})

binaryOf.set(types.LIST, (operator, left, right) => {
  if (left.type !== types.LIST) {
    throw core.libError('unexpected expression type, binary list')
  }
  if (right.type !== types.LIST) {
    if (right.type === types.NUMBER) {
      return applyBinaryOperationListAndNumber(operator, left, right)
    }
    throw core.DataTypeError
  }
  if (left.elements.length !== right.elements.length) {
    throw core.DimMismatchError
  }
  return {
    type: types.LIST,
    elements: left.elements.map((e, i) => (
      core.newFloat(applyBinaryOperation(operator, e.float, right.elements[i]!.float)))),
    resolved: true,
  }
})

// ----- Helper -----

function applyBinaryOperationListAndNumber(
  operator: string,
  list: types.ListResolved,
  number: types.NumberResolved,
): types.ListResolved {
  return {
    type: types.LIST,
    elements: list.elements.map((e, _i) => (
      core.newFloat(applyBinaryOperation(operator, e.float, number.float)))),
    resolved: true,
  }
}

function applyUnaryOperation(operator: string, x: number) {
  switch (operator) {
    case '&-': return x * -1
    default: throw core.libError('unexpected unary operator')
  }
}

function applyBinaryOperation(operator: string, x: number, y: number) {
  if (operator === '/' && y === 0) {
    throw core.DivideByZeroError
  }
  switch (operator) {
    case '+': return x + y
    case '-': return x - y
    case '*': return x * y
    case '/': return x / y
    case '=': return x === y ? 1 : 0
    case '!=': return x !== y ? 1 : 0
    case '>=': return x >= y ? 1 : 0
    case '>': return x > y ? 1 : 0
    case '<=': return x <= y ? 1 : 0
    case '<': return x < y ? 1 : 0
    case ' and ': return x && y ? 1 : 0
    case ' or ': return x || y ? 1 : 0
    case ' xor ': return (!x && y) || (x && !y) ? 1 : 0
    default: throw core.libError('unexpected binary operator')
  }
}