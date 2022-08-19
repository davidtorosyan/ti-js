// entry point (web)
// ==================

import * as webLoader from './inject/web/loader.web'

import { run } from './run/runtime'
import { on } from './run/daemon'
import { parse } from './parse/parser'

webLoader.init()

export { run, on, parse }

export function exec (source, callback) {
  const lines = parse(source)
  run(lines, {
    outputCallback: callback,
  })
}
