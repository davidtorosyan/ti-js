import parser from './tibasic.pegjs'
// import peg from 'pegjs'
// import grammar from './tibasic.pegjs'

// ----- private -----

// const parser = peg.generate(grammar)

function quote (str) {
  return "'" + str + "'"
}

function buildList (lines) {
  return '[\n  ' + lines.join(',\n  ') + '\n]'
}

// ----- fetcher -----

export function download (url, callback) {
  const request = new XMLHttpRequest()
  request.open('GET', url, true)

  request.onload = () => {
    if (request.status >= 200 && request.status < 400) {
      callback(request.response)
    } else {
      throw new Error('Failed to download: ' + request.statusText)
    }
  }

  request.onerror = () => {
    throw new Error('Failed to download.')
  }

  request.send()
};

// ----- parser -----

export function parse (source, options = {}) {
  // ----- initialize -----

  if (source === undefined) {
    throw new Error('Undefined source!')
  }

  const name = options.name
  const includeSource = options.includeSource

  if (includeSource !== undefined && name === undefined) {
    throw new Error('Cannot include source without specifying name')
  }

  // ----- parse -----

  const sourceLines = source.split(/\r?\n/)
  const parsedLines = sourceLines.map(s => {
    try {
      const parsedLine = parser.parse(s)
      parsedLine.source = s
      return parsedLine
    } catch (error) {
      if (error.name === 'SyntaxError') {
        return { type: 'SyntaxError' }
      }

      throw error
    }
  })

  let lines = parsedLines

  if (name !== undefined) {
    lines = `tilib.core.prgmNew('${name}', ${lines}`

    if (includeSource) {
      lines += `, ${buildList(sourceLines.map(s => quote(s)))}`
    }

    lines += ')'
  }

  return lines
}
