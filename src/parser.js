// ti-basic parser using pegjs
// ==================

import pegJsParser from './tibasic.pegjs'
import * as types from './types'

export function parse (source, options = {}) {
  if (source === undefined) {
    throw new Error('Undefined source!')
  }

  const sourceMap = options.sourceMap || 'inline'

  const sourceLines = source.split(/\r?\n/)
  const parsedLines = sourceLines.map(s => {
    let parsedLine
    try {
      parsedLine = pegJsParser.parse(s)
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
    parsedLine = pegJsParser.parse(sourceLine)
  } catch (error) {
    if (error.name !== 'SyntaxError') {
      throw error
    }
  }

  return parsedLine !== undefined && parsedLine.type === types.ValueStatement ? parsedLine.value : { type: 'SyntaxError' }
}
