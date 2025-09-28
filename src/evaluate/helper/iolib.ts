// iolib
// =====

import * as core from '../../common/core'
import { createPrintOptions, PrintOptions, CanvasLike } from '../../common/core'
import { Screen } from './screen'

const enterkey = 13

export type OutputFunction = (value: string, printOptions: PrintOptions) => void

export interface IoOptions {
  output?: OutputFunction
  input?: JQuery
  stdin?: string
  stdinQueue?: string[]
  includeErrors: boolean
  includeLibErrors: boolean
  includeLineNumbers: boolean
  includeSource: boolean
}

export function elemOutput (elem: JQuery) {
  return (value: string, printOptions: PrintOptions): void => {
    setTimeout(() => {
      let result = elem.val() + value
      if (printOptions.newline) {
        result += '\n'
      }
      elem.val(result)
    }, 0)
  }
}

export function stdout (value: string, options: IoOptions, printOptions: Partial<PrintOptions> = {}): void {
  const printOptionsResolved = createPrintOptions(printOptions)
  if (options.output === undefined) {
    console.log(value)
    return
  }
  options.output(value, printOptionsResolved)
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

export function screenOutput (elem: JQuery): (value: string, printOptions: PrintOptions) => void {
  const screen = new Screen(elem)
  return screen.print.bind(screen)
}

export function canvasScreenOutput (canvas: CanvasLike): (value: string, printOptions: PrintOptions) => void {
  const screen = new Screen(canvas)
  return screen.print.bind(screen)
}

export function simpleOutput (callback: (text: string, newline: boolean) => void): OutputFunction {
  return (value: string, printOptions: PrintOptions): void => {
    callback(value, printOptions.newline)
  }
}

export function compositeOutput (outputs: Array<(value: string, printOptions: PrintOptions) => void>) {
  return (value: string, printOptions: PrintOptions): void => {
    outputs.forEach(output => output(value, printOptions))
  }
}

export function cleanup (options: IoOptions): void {
  if (options.input !== undefined) {
    options.input.off('keypress')
  }
}
