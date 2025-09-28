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

export function isRightJustified (value: types.ValueResolved): boolean {
  return value.type === types.TiNumber || value.type === types.TiList
}

export interface GlyphDataBase {
  hex: string
  name: string
  strict: string
  length: number
  virtual: boolean
  utf8?: string
}

export interface GlyphDataSingle extends GlyphDataBase {
  glyph: string
}

export interface GlyphDataComposite extends GlyphDataBase {
  composite: string[]
}

export type GlyphData = GlyphDataSingle | GlyphDataComposite

export function isGlyphDataSingle (glyph: GlyphData): glyph is GlyphDataSingle {
  return 'glyph' in glyph
}

export function isGlyphDataComposite (glyph: GlyphData): glyph is GlyphDataComposite {
  return 'composite' in glyph
}

export interface PrintOptions {
  newline: boolean
  rightJustify: boolean
  overflow: boolean
  row: number | undefined
  col: number | undefined
}

export const DEFAULT_PRINT_OPTIONS: PrintOptions = {
  newline: true,
  rightJustify: false,
  overflow: false,
  row: undefined,
  col: undefined,
}

export function createPrintOptions (options: Partial<PrintOptions> = {}): PrintOptions {
  return { ...DEFAULT_PRINT_OPTIONS, ...options }
}

/**
 * @alpha
 */
export interface CanvasRenderingContext2DLike {
  fillStyle: string
  fillRect(x: number, y: number, width: number, height: number): void
  getImageData(x: number, y: number, width: number, height: number): ImageData
  putImageData(imageData: ImageData, x: number, y: number): void
}

/**
 * @alpha
 */
export interface CanvasLike {
  width: number
  height: number
  style?: {
    border?: string
    backgroundColor?: string
    imageRendering?: string
  }
  getContext(contextId: string, options?: { willReadFrequently?: boolean }): CanvasRenderingContext2DLike | null
}
