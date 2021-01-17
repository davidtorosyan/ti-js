// entry point
// ==================

export { run } from './run/runtime'
export { on } from './run/daemon'
export { parse } from './parse/parser'

import * as io.auto from './io/auto'
export { io.auto }
// export * from './io/console' as console
// export * from './io/jquery' as jquery

export function exec (source, callback) {
    const lines = ti.parse(source)
    const program = ti.run(lines, {
        outputCallback: callback,
    })
}
