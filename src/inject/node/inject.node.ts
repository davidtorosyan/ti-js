// inject.node
// ===========

import * as inject from '../inject'
import { NodeEventTarget } from './event.node'
import { NodeLooper } from './looper.node'
import { NodePerf } from './perf.node'

export function init () {
  inject.setEventTarget(new NodeEventTarget())
  inject.setLooper(new NodeLooper())
  inject.setPerf(new NodePerf())
}
