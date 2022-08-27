// pegutil
// =======

import * as types from '../common/types'

function toBinary (
  left: types.ValueExpression,
  rightOp: types.ValueExpression | [string, types.ValueExpression],
): types.BinaryExpression {
  return {
    type: types.BINARY,
    operator: Array.isArray(rightOp) ? rightOp[0] : '*',
    left,
    right: Array.isArray(rightOp) ? rightOp[1] : rightOp,
  }
}

export function buildBinaryExpression (
  head: types.ValueExpression,
  tail: Array<[string, types.ValueExpression]>,
): types.ValueExpression {
  return tail.reduce(toBinary, head)
}

export function buildImplicitBinaryExpression (
  head: types.ValueExpression,
  tail: Array<[types.ValueExpression, types.ValueExpression]>,
  end: types.ValueExpression,
): types.ValueExpression {
  const list = tail.flat()
  if (end !== null) {
    list.push(end)
  }
  return list.reduce(toBinary, head)
}

function toMenuChoice (
  element: [string, types.TiString, string, string],
): types.MenuChoice {
  return {
    option: element[1],
    location: element[3],
  }
}

export function buildMenuStatement (
  title: types.TiString,
  options: Array<[string, types.TiString, string, string]>,
) {
  const choices = options.map(toMenuChoice)
  return {
    type: types.MenuStatement,
    title,
    choices,
  }
}

export function buildList (
  head: types.ValueExpression,
  tail: Array<types.ValueExpression>,
) {
  return {
    type: types.LIST,
    elements: [head].concat(tail),
  }
}
