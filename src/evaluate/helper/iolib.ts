// iolib
// =====

import type { TiJsError } from '../../common/core'
import * as types from '../../common/types'

const enterkey = 13

export type IoOptions = {
  output?: (value: string, newline: boolean) => void
  input?: JQuery<HTMLElement>
  stdin?: string
  stdinQueue?: Array<string>
  includeErrors: boolean
  includeLibErrors: boolean
  includeLineNumbers: boolean
  includeSource: boolean
}

export function elemOutput (elem: JQuery<HTMLElement>) {
  return (value: string, newline: boolean): void => {
    setTimeout(() => {
      let result = elem.val() + value
      if (newline) {
        result += '\n'
      }
      elem.val(result)
    }, 0)
  }
}

export function stdout (value: string, options: IoOptions, newline = true): void {
  if (options.output === undefined) {
    console.log(value)
    return
  }
  options.output(value, newline)
}

export function stderr (ex: TiJsError, options: IoOptions): void {
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
  if (options.includeLineNumbers && ex.source?.index !== undefined) {
    value += ` on line ${ex.source.index}`
  }
  if (options.includeSource && ex.source?.line !== undefined) {
    value += ` :${ex.source.line}`
  }
  stdout(value, options)
}

export function onStdin (callback: (text: string | null | undefined) => boolean, options: IoOptions): void {
  if (options.stdin !== undefined && options.stdin !== '' && options.stdinQueue === undefined) {
    options.stdinQueue = options.stdin.split('\n').reverse()
  }
  const queue = options.stdinQueue
  if (queue !== undefined) {
    setTimeout(() => {
      const result = queue.pop()
      if (callback(result) === true) {
        onStdin(callback, options)
      }
    }, 0)
    return
  }
  const input = options.input
  if (input === undefined) {
    setTimeout(() => {
      if (callback(prompt('Input?')) === true) {
        onStdin(callback, options)
      }
    }, 100)
    return
  }
  setTimeout(() => input.val(''), 0)
  input.on('keypress', e => {
    if (e.keyCode === enterkey) {
      const result = input.val()?.toString()
      setTimeout(() => input.val(''), 0)
      if (callback(result) !== true) {
        input.off('keypress')
      }
    }
  })
}

export function cleanup (options: IoOptions): void {
  if (options.input !== undefined) {
    options.input.off('keypress')
  }
}
