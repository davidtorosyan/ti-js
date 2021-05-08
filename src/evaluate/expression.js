// expression
// ==========

import * as core from '../common/core'
import * as types from '../common/types'
import * as operation from './operation'

export function evaluate (value, mem) {
  const behavior = expressionOf[value.type]
  if (behavior === undefined) {
    throw core.libError('unexpected value')
  }
  return behavior(value, mem)
}

const expressionOf = {}

// ----- Expressions -----

expressionOf[types.SyntaxError] = (value, mem) => {
  throw core.SyntaxError
}

// ----- Values -----

expressionOf[types.NUMBER] = (value, mem) => {
  if (value.float !== undefined) {
    return value
  }
  return {
    type: types.NUMBER,
    float: operation.resolveNumber(value)
  }
}

expressionOf[types.STRING] = (value, mem) => {
  return value
}

expressionOf[types.LIST] = (value, mem) => {
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
    resolved: true
  }
}

// ----- Variables -----

expressionOf[types.VARIABLE] = (value, mem) => {
  let result = mem.vars[value.name]
  if (result === undefined) {
    result = mem.vars[value.name] = core.newFloat()
  }
  return result
}

expressionOf[types.STRINGVARIABLE] = (value, mem) => {
  const result = mem.vars[value.name]
  if (result === undefined) {
    throw core.UndefinedError
  }
  return result
}

expressionOf[types.LISTVARIABLE] = (value, mem) => {
  const result = mem.vars[value.name]
  if (result === undefined) {
    throw core.UndefinedError
  }
  return result
}

expressionOf[types.LISTINDEX] = (value, mem) => {
  const list = evaluate(value.list, mem)
  const index = evaluate(value.index, mem)
  if (index.type !== types.NUMBER) {
    throw core.InvalidDimError
  }
  if (index.float < 1 || index.float > list.elements.length) {
    throw core.InvalidDimError
  }
  return {
    type: types.NUMBER,
    float: list.elements[index.float - 1].float
  }
}

// ----- Tokens -----

expressionOf[types.ANS] = (value, mem) => {
  return mem.ans
}

expressionOf[types.GetKey] = (value, mem) => {
  throw core.UnimplementedError
}

// ----- Operators -----

expressionOf[types.UNARY] = (value, mem) => {
  const argument = evaluate(value.argument, mem)
  const behavior = unaryOf[argument.type]
  if (behavior === undefined) {
    throw core.libError('unexpected unary argument')
  }
  return behavior(value.operator, argument)
}

expressionOf[types.BINARY] = (value, mem) => {
  const left = evaluate(value.left, mem)
  const right = evaluate(value.right, mem)
  const behavior = binaryOf[left.type]
  if (behavior === undefined) {
    throw core.libError('unexpected binary left')
  }
  return behavior(value.operator, left, right)
}

// ----- Unary -----

const unaryOf = {}

unaryOf[types.NUMBER] = (operator, argument) => {
  return { type: types.NUMBER, float: applyUnaryOperation(operator, argument.float) }
}

unaryOf[types.STRING] = (operator, argument) => {
  throw core.DataTypeError
}

unaryOf[types.LIST] = (operator, argument) => {
  return {
    type: types.LIST,
    elements: argument.elements.map(e => ({ type: types.NUMBER, float: applyUnaryOperation(operator, e.float) })),
    resolved: true
  }
}

// ----- Binary -----

const binaryOf = {}

binaryOf[types.NUMBER] = (operator, left, right) => {
  if (right.type !== types.NUMBER) {
    if (right.type === types.LIST) {
      return applyBinaryOperationListAndNumber(operator, right, left)
    }
    throw core.DataTypeError
  }
  return { type: types.NUMBER, float: applyBinaryOperation(operator, left.float, right.float) }
}

binaryOf[types.STRING] = (operator, left, right) => {
  if (right.type !== types.STRING) {
    throw core.DataTypeError
  }
  if (['+'].includes(operator)) {
    return { type: types.STRING, chars: applyBinaryOperation(operator, left.chars, right.chars) }
  }
  if (['=', '!='].includes(operator)) {
    return { type: types.NUMBER, float: applyBinaryOperation(operator, left.chars, right.chars) }
  }
  throw core.DataTypeError
}

binaryOf[types.LIST] = (operator, left, right) => {
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
    elements: left.elements.map((e, i) => ({ type: types.NUMBER, float: applyBinaryOperation(operator, e.float, right.elements[i].float) })),
    resolved: true
  }
}

// ----- Helper -----

function applyBinaryOperationListAndNumber (operator, list, number) {
  return {
    type: types.LIST,
    elements: list.elements.map((e, i) => ({ type: types.NUMBER, float: applyBinaryOperation(operator, e.float, number.float) })),
    resolved: true
  }
}

function applyUnaryOperation (operator, x) {
  switch (operator) {
    case '&-': return x * -1
    default: throw core.libError('unexpected unary operator')
  }
}

function applyBinaryOperation (operator, x, y) {
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
    case 'and': return x && y ? 1 : 0
    case 'or': return x || y ? 1 : 0
    default: throw core.libError('unexpected binary operator')
  }
}
