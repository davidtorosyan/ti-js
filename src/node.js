// entry point (node)
// ==================

import * as nodeLoader from './inject/node/loader.node'

nodeLoader.init()

import { run } from './run/runtime'
import { on } from './run/daemon'
import { parse } from './parse/parser'

export { run, on, parse }

export function exec (source, callback) {
    const lines = parse(source)
    const program = run(lines, {
        outputCallback: callback,
    })
}