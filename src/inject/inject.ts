// inject
// ===========

import type { EventTarget } from './event'
import type { Looper } from './looper'
import type { Perf } from './perf'

let eventTarget: EventTarget | undefined

export function getEventTarget (): EventTarget {
  if (eventTarget === undefined) {
    throw new Error('EventTarget is undefined')
  }
  return eventTarget
}

export function setEventTarget (impl: EventTarget): void {
  eventTarget = impl
}

let looper: Looper | undefined

export function getLooper (): Looper {
  if (looper === undefined) {
    throw new Error('looper is undefined')
  }
  return looper
}

export function setLooper (impl: Looper): void {
  looper = impl
}

let perf: Perf | undefined

export function getPerf (): Perf {
  if (perf === undefined) {
    throw new Error('Perf is undefined')
  }
  return perf
}

export function setPerf (impl: Perf): void {
  perf = impl
}
