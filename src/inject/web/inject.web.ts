// inject.web
// ===========

import * as inject from '../inject'
import { WebEventTarget } from './event.web'
import { WebLooper } from './looper.web'
import { WebPerf } from './perf.web'

export function init () {
  inject.setEventTarget(new WebEventTarget())
  inject.setLooper(new WebLooper())
  inject.setPerf(new WebPerf())
}
