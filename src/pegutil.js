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
