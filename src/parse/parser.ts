// parser
// ======

import * as types from '../common/types'
import {
  parse as parseTiBasic,
  SyntaxError,
} from './tibasic.peggy';


type ParseOptions = {
  sourceMap?: string
}

export function parse(source: string, options: ParseOptions = {}) {
  if (source === undefined) {
    throw new Error('Undefined source!')
  }

  const sourceMap = options.sourceMap || 'inline'

  // TODO:
  // * Allow multiple statements per line with ':'
  const sourceLines = source.split(/\r?\n/)
  const parsedLines = sourceLines.map(s => {
    let parsedLine
    try {
      parsedLine = parseTiBasic(s)
    } catch (error: any) {
      if (error instanceof SyntaxError) {
        parsedLine = { type: 'SyntaxError' }
      } else {
        throw error
      }
    }
    if (sourceMap === 'inline') {
      parsedLine.source = s
    }
    return parsedLine
  })

  return parsedLines
}

export function parseExpression(source: String) {
  if (source === undefined) {
    throw new Error('Undefined source!')
  }

  const sourceLines = source.split(/\r?\n/)
  if (sourceLines.length > 1) {
    throw new Error('Too many lines for an expression')
  }
  const sourceLine = sourceLines[0]
  if (sourceLine === undefined) {
    throw new Error('Too few lines for an expression')
  }
  let parsedLine
  try {
    parsedLine = parseTiBasic(sourceLine)
  } catch (error: any) {
    if (!(error instanceof SyntaxError)) {
      throw error
    }
  }

  return parsedLine !== undefined && parsedLine.type === types.ValueStatement ? parsedLine.value : { type: 'SyntaxError' }
}
