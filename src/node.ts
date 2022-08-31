// entry point (node)
// ==================

import * as nodeLoader from './inject/node/loader.node'
nodeLoader.init()

/**
 * A library for compiling and running TI-Basic, built for node.
 *
 * @packageDocumentation
 */
export * from './common'
