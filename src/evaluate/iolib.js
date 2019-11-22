// iolib
// =====

import * as types from '../common/types'

const enterkey = 13

export function stdout (value, options = {}, newline = true) {
  if (options.elem === undefined) {
    console.log(value)
    return
  }
  setTimeout(() => {
    let result = options.elem.val() + value
    if (newline) {
      result += '\n'
    }
    options.elem.val(result)
  }, 0)
}

export function stderr (ex, options = {}) {
  if ((ex.type === types.ti && !options.includeErrors) ||
      (ex.type === types.lib && !options.includeLibErrors)) {
    console.log(ex)
    return
  }
  let value = ''
  if (ex.type === types.ti) {
    value += 'ERR:'
  } else if (ex.type === types.lib) {
    value += 'Error: '
  } else {
    value += 'Unexpected: '
  }
  value += ex.code
  if (options.includeLineNumbers && ex.source !== undefined && ex.source.index !== undefined) {
    value += ` on line ${ex.source.index}`
  }
  if (options.includeSource && ex.source !== undefined && ex.source.line !== undefined) {
    value += ` :${ex.source.line}`
  }
  stdout(value, options)
}

export function onStdin (callback, options = {}) {
  if (options.stdin !== undefined && options.stdin !== '' && options.stdinQueue === undefined) {
    options.stdinQueue = options.stdin.split('\n').reverse()
  }
  if (options.stdinQueue !== undefined) {
    setTimeout(() => {
      const result = options.stdinQueue.pop()
      if (callback(result) === true) {
        onStdin(callback, options)
      }
    }, 0)
    return
  }
  if (options.input === undefined) {
    setTimeout(() => {
      if (callback(prompt('Input?')) === true) {
        onStdin(callback, options)
      }
    }, 100)
    return
  }
  setTimeout(() => options.input.val(''), 0)
  options.input.on('keypress', e => {
    if (e.keyCode === enterkey) {
      const result = options.input.val()
      setTimeout(() => options.input.val(''), 0)
      if (callback(result) !== true) {
        options.input.off('keypress')
      }
    }
  })
}

export function cleanup (options = {}) {
  if (options.input !== undefined) {
    options.input.off('keypress')
  }
}
