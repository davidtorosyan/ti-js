// core
// ====

import * as types from './types'

function error (type, code, hideSource = false) {
  return {
    type: type,
    code: code,
    hideSource: hideSource
  }
}

function tiError (code, hideSource = false) {
  return error(types.ti, code, hideSource)
}

export const DataTypeError = tiError('DATA TYPE')
export const SyntaxError = tiError('SYNTAX')
export const UndefinedError = tiError('UNDEFINED')
export const LabelError = tiError('LABEL')
export const ArgumentError = tiError('ARGUMENT')
export const DimMismatchError = tiError('DIM MISMATCH')
export const DivideByZeroError = tiError('DIVIDE BY 0')
export const InvalidDimError = tiError('INVALID DIM')

export const SyntaxErrorHiddenSource = tiError('SYNTAX', true)

export function libError (code, hideSource = false) {
  return error(types.lib, code, hideSource)
}

export function newMem () {
  return {
    vars: {},
    ans: newFloat()
  }
}

export function newFloat (value = 0) {
  return { type: types.NUMBER, float: value }
}

export const ONE = newFloat(1)

export const MINUSONE = newFloat(-1)
