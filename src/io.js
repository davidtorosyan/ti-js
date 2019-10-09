// input/output
// ==================

export function error (io, ex) {
  if (ex.type === 'ti') {
    io.stderr(`ERR:${ex.code}`, ex.source)
  } else if (ex.type === 'lib') {
    io.liberr(`Error: ${ex.code}`, ex.source)
  }
};

export const fromConsole = {
  stdout: x => console.log(x),
  stderr: (x, source) => console.log(x),
  liberr: (x, source) => console.log(x),
  onStdin: callback => setTimeout(() => callback(prompt('Input?')), 100),
  cleanup: () => {}
}

export function ioFromVal (elem, options = {}) {
  const parseOption = (option, defaultValue) => {
    return option === undefined ? defaultValue : option === true
  }

  const includeErrors = parseOption(options.includeErrors, true)
  const includeLineNumbers = parseOption(options.includeLineNumbers, true)
  const includeSource = parseOption(options.includeSource, true)
  const includeLibErrors = parseOption(options.includeLibErrors, true)
  const input = options.input
  const stdin = options.stdin

  let stdinQueue
  if (stdin !== undefined && stdin !== '') {
    stdinQueue = stdin.split('\n').reverse()
  }

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

  let onStdin = fromConsole.onStdin
  if (stdinQueue !== undefined) {
    onStdin = callback => {
      setTimeout(() => {
        const result = stdinQueue.pop()
        callback(result)
      })
    }
  } else if (input !== undefined) {
    onStdin = callback => {
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
  }

  let cleanup = fromConsole.cleanup
  if (input !== undefined) {
    cleanup = () => input.off('keypress')
  }

  return {
    stdout: appendToOutput,
    stderr: includeErrors ? appendToError : fromConsole.stderr,
    liberr: includeLibErrors ? appendToError : fromConsole.stderr,
    onStdin,
    cleanup
  }
};
