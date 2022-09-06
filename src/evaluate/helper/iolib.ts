// iolib
// =====

import * as core from '../../common/core'

const enterkey = 13

export interface IoOptions {
  output?: (value: string, newline: boolean) => void
  input?: JQuery
  stdin?: string
  stdinQueue?: string[]
  includeErrors: boolean
  includeLibErrors: boolean
  includeLineNumbers: boolean
  includeSource: boolean
}

export function elemOutput (elem: JQuery) {
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

export function stderr (ex: core.TiJsError, options: IoOptions, sourceLine: core.TiJsSource | undefined): void {
  if ((ex instanceof core.TiError && !options.includeErrors) ||
    (ex instanceof core.LibError && !options.includeLibErrors)) {
    console.log(ex)
    return
  }
  let value = ex.message
  if (options.includeLineNumbers && sourceLine?.index !== undefined) {
    value += ` on line ${sourceLine.index}`
  }
  if (options.includeSource && sourceLine?.line !== undefined) {
    value += ` :${sourceLine.line}`
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
      if (callback(result)) {
        onStdin(callback, options)
      }
    }, 0)
    return
  }
  const input = options.input
  if (input === undefined) {
    setTimeout(() => {
      if (callback(prompt('Input?'))) {
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
      if (!callback(result)) {
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
