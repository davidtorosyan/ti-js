// expression
// ==========

import * as core from '../common/core'
import * as types from '../common/types'
import * as operation from './operation'
import * as unary from './expressions/unary'
import * as binary from './expressions/binary'

export function evaluate (value: types.ValueExpression, mem: core.Memory) {
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
  return unary.evaluate(value.operator, argument)
})

expressionOf.set(types.BINARY, (value, mem) => {
  if (value.type !== types.BINARY) {
    throw core.libError('unexpected expression type, binary')
  }
  const left = evaluate(value.left, mem)
  const right = evaluate(value.right, mem)
  return binary.evaluate(value.operator, left, right)
})
