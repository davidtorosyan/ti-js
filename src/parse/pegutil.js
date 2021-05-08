// pegutil
// =======

import * as types from '../common/types'

export function buildLogicalExpression (head, tail) {
  return tail.reduce(function (result, element) {

    return {
      type: types.BINARY,
      operator: element[1],
      left: result,
      right: element[3]
    }
  }, head)
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

export function buildMenuStatement (title, options) {
  const choices = options.map(function (element) {
    return {
      option: element[1],
      location: element[3]
    }
  })
  return {
    type: types.MenuStatement,
    title,
    choices
  }
}

export function buildList (head, tail) {
  return {
    type: types.LIST,
    elements: [head].concat(tail)
  }
}
