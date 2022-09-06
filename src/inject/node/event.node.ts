// event.node
// ==========

import { EventEmitter } from 'events'
import type { EventTarget } from '../event'

export class NodeEventTarget implements EventTarget {
  private readonly emitter: EventEmitter

  constructor () {
    this.emitter = new EventEmitter()
  }

  addEventListener (type: string, listener: () => void): void {
    this.emitter.on(type, listener)
  }

  removeEventListener (type: string, listener: () => void): void {
    this.emitter.off(type, listener)
  }

  dispatchEvent (name: string): void {
    this.emitter.emit(name)
  }
}
