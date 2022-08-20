// event.node
// ==========

import { EventEmitter } from 'events'
import type { EventTarget } from '../event'

export function createEventTarget(): EventTarget {
  const emitter = new EventEmitter()
  return {
    addEventListener: (type: string, listener: () => void) => emitter.on(type, listener),
    removeEventListener: (type: string, listener: () => void) => emitter.off(type, listener),
    dispatchEvent: (name: string) => emitter.emit(name)
  }
}