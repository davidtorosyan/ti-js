// parser
// ======

import * as types from 'common/types'
import { toStrict } from './encoding'
import {
  parse as peggyParse,
  SyntaxError as peggySyntaxError,
} from './tibasic.peggy'

/**
 * @alpha
 */
export interface ParseOptions {
  sourceMap?: string
}

/**
 * @alpha
 */
export function parse (source: string, options: ParseOptions = {}): types.Line[] {
  const sourceMap = options.sourceMap ?? 'inline'

  // TODO:
  // * Allow multiple statements per line with ':'
  const sourceLines = source.split(/\r?\n/)
  const parsedLines = sourceLines.map((s: string): types.Line => {
    const sourceLine = toStrict(s)

    let parsedLine: types.Statement
    try {
      parsedLine = peggyParse(sourceLine)
    } catch (error: unknown) {
      if (error instanceof peggySyntaxError) {
        parsedLine = { type: types.TiSyntaxError }
      } else {
        throw error
      }
    }
    return {
      statement: parsedLine,
      source: sourceMap === 'inline' ? sourceLine : undefined,
    }
  })

  return parsedLines
}

export function parseExpression (source: string): types.ValueExpression {
  const sourceLines = source.split(/\r?\n/)
  if (sourceLines.length > 1) {
    throw new Error('Too many lines for an expression')
  }
  const sourceLine = sourceLines[0]
  if (sourceLine === undefined) {
    throw new Error('Too few lines for an expression')
  }
  let parsedLine: types.Statement
  try {
    parsedLine = peggyParse(sourceLine)
  } catch (error: unknown) {
    if (error instanceof peggySyntaxError) {
      parsedLine = { type: types.TiSyntaxError }
    } else {
      throw error
    }
  }

  return parsedLine.type === types.ValueStatement ? parsedLine.value : { type: types.TiSyntaxError }
}
