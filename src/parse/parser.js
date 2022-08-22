// parser
// ======

import * as types from '../common/types'
import peggyParser from './tibasic.peggy'

export function parse (source, options = {}) {
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
      parsedLine = peggyParser.parse(s)
    } catch (error) {
      if (error.name === 'SyntaxError') {
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

export function parseExpression (source) {
  if (source === undefined) {
    throw new Error('Undefined source!')
  }

  const sourceLines = source.split(/\r?\n/)
  if (sourceLines.Length > 1) {
    throw new Error('Too many lines for an expression')
  }
  const sourceLine = sourceLines[0]
  let parsedLine
  try {
    parsedLine = peggyParser.parse(sourceLine)
  } catch (error) {
    if (error.name !== 'SyntaxError') {
      throw error
    }
  }

  return parsedLine !== undefined && parsedLine.type === types.ValueStatement ? parsedLine.value : { type: 'SyntaxError' }
}
