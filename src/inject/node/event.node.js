// event.node
// ==========

import { EventEmitter } from 'events'

export function createEventTarget() {
    return new EventEmitter()
}

export function dispatchEvent(eventTarget, eventName) {
    eventTarget.emit(eventName)
}