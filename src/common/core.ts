// core
// ====

import * as types from './types'

export type TiJsSource = {
  index: number
  line: string
}

export type TiJsError = {
  type: string
  code: any
  hideSource: boolean
  source?: TiJsSource
}

function error(type: string, code: any, hideSource = false): TiJsError {
  return {
    type,
    code,
    hideSource,
  }
}

function tiError(code: string, hideSource = false) {
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
export const DomainError = tiError('DOMAIN')

export function libError(code: string, hideSource = false) {
  return error(types.lib, code, hideSource)
}

export const UnimplementedError = libError('unimplemented')

export type Memory = {
  vars: Map<string, types.ValueResolved>
  ans: types.ValueResolved
}

export function newMem(): Memory {
  return {
    vars: new Map<string, types.ValueResolved>(),
    ans: newFloat(),
  }
}

export function newFloat(value = 0): types.NumberResolved {
  return {
    type: types.NUMBER,
    resolved: true,
    float: value
  }
}

export const ONE = newFloat(1)

export const MINUSONE = newFloat(-1)

export function exhaustiveMatchingGuard(_: never): never {
  throw new Error("Should not have reached here")
}