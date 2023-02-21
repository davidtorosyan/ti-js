// core
// ====

import * as types from './types'

export enum TiErrorCode {
  DataType = 'DATA TYPE',
  Syntax = 'SYNTAX',
  Undefined = 'UNDEFINED',
  Label = 'LABEL',
  Argument = 'ARGUMENT',
  DimMismatch = 'DIM MISMATCH',
  DivideByZero = 'DIVIDE BY 0',
  InvalidDim = 'INVALID DIM',
  Domain = 'DOMAIN',
}

export const UNIMPLEMENTED_MESSAGE = 'unimplemented'

export interface TiJsSource {
  index: number
  line: string | undefined
}

export class TiJsError extends Error {
}

export class TiError extends TiJsError {
  constructor (
    public code: TiErrorCode,
  ) {
    super(`ERR:${code}`)
  }
}

export class LibError extends TiJsError {
  constructor (
    message: string,
  ) {
    super(`Error: ${message}`)
  }
}

export function newFloat (value = 0): types.NumberResolved {
  return {
    type: types.TiNumber,
    resolved: true,
    float: value,
  }
}

export const ONE = newFloat(1)

export const MINUSONE = newFloat(-1)

export function exhaustiveMatchingGuard (_: never): never {
  throw new Error('Should not have reached here')
}
