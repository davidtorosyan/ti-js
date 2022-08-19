// entry point (node)
// ==================

import * as nodeLoader from './inject/node/loader.node'

import { run } from './run/runtime'
import { on } from './run/daemon'
import { parse } from './parse/parser'

nodeLoader.init()

export { run, on, parse }

export function exec (source, callback) {
  const lines = parse(source)
  run(lines, {
    outputCallback: callback,
  })
}
