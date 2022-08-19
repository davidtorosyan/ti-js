// loader.node
// ===========

import * as loader from '../loader'
import * as looper from './looper.node'
import * as event from './event.node'
import { perf } from './perf.node'

export function init () {
  loader.set(loader.LOOPER, looper)
  loader.set(loader.EVENT, event)
  loader.set(loader.PERF, perf)
}
