// ti-basic parser using pegjs
// ==================

import parser from './tibasic.pegjs'

export function parse (source, options = {}) {
  if (source === undefined) {
    throw new Error('Undefined source!')
  }

  const sourceMap = options.sourceMap || 'inline'

  const sourceLines = source.split(/\r?\n/)
  const parsedLines = sourceLines.map(s => {
    let parsedLine
    try {
      parsedLine = parser.parse(s)
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
