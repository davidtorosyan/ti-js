import * as types from './types.js'

export function join (arr) {
  if (arr === null) return undefined
  return Array.isArray(arr) ? arr.join('') : arr
}

export function joinNonEmpty (arr) {
  const result = join(arr)
  return result === '' ? undefined : result
}

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
