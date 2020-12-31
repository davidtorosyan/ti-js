// entry point
// ==================

export { run } from './run/runtime'
export { on } from './run/daemon'
export { parse } from './parse/parser'

export function exec (source, callback) {
    const lines = ti.parse(source)
    const program = ti.run(lines, {
        outputCallback: callback,
    })
}