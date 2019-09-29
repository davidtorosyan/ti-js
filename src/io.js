export function error (io, ex) {
  if (ex.type === 'ti') {
    io.stderr(`ERR:${ex.code}`, ex.source)
  } else if (ex.type === 'lib') {
    io.liberr(`Error: ${ex.code}`, ex.source)
  }
};

// eslint-disable-next-line camelcase
export const default_io = {
  stdout: x => console.log(x),
  stderr: (x, source) => console.log(x),
  liberr: (x, source) => console.log(x),
  onStdin: callback => setTimeout(() => callback(prompt('Input?')), 100)
}

// eslint-disable-next-line camelcase
export function val_io (elem, options = {}) {
  const parseOption = (option, defaultValue) => {
    return option === undefined ? defaultValue : option === true
  }

  const includeErrors = parseOption(options.includeErrors, true)
  const includeLineNumbers = parseOption(options.includeLineNumbers, true)
  const includeSource = parseOption(options.includeSource, true)
  const includeLibErrors = parseOption(options.includeLibErrors, true)
  const input = options.input

  const appendToOutput = (x, newline = true) => setTimeout(() => {
    let result = elem.val() + x
    if (newline) {
      result += '\n'
    }
    elem.val(result)
  }, 0)

  const appendToError = (x, source) => {
    let result = x
    if (source !== undefined) {
      if (source.index !== undefined && includeLineNumbers) {
        result += ` on line ${source.index}`
      }

      if (source.line !== undefined && includeSource) {
        result += ` :${source.line}`
      }
    }
    appendToOutput(result)
  }

  const enterkey = 13

  const onStdin = callback => {
    setTimeout(() => input.val(''), 0)
    input.on('keypress', e => {
      if (e.keyCode === enterkey) {
        input.off('keypress')
        const result = input.val()
        setTimeout(() => input.val(''), 0)
        callback(result)
      }
    })
  }

  return {
    stdout: appendToOutput,
    stderr: includeErrors ? appendToError : default_io.stderr,
    liberr: includeLibErrors ? appendToError : default_io.stderr,
    onStdin: input !== undefined ? onStdin : default_io.onStdin
  }
};