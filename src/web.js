// entry point (web)
// ==================

import * as webLoader from './inject/web/loader.web'

webLoader.init()

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