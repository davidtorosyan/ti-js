// utilities for use in parsing ti-basic
// ==================

import * as types from './types.js'

export function buildBinaryExpression (head, tail) {
  return tail.reduce(function (result, element) {
    return {
      type: types.BINARY,
      operator: element[0],
      left: result,
      right: element[1]
    }
  }, head)
}
export function buildImplicitBinaryExpression (head, tail, end) {
  const list = tail.flat()
  if (end !== null) {
    list.push(end)
  }
  return list.reduce(function (result, element) {
    return {
      type: types.BINARY,
      operator: '*',
      left: result,
      right: element
    }
  }, head)
}