// event.web
// =========

import type { EventTarget } from '../event'

export function createEventTarget(): EventTarget {
  const textNode = document.createTextNode("")
  return {
    addEventListener: (type: string, listener: () => void) => textNode.addEventListener(type, listener),
    removeEventListener: (type: string, listener: () => void) => textNode.removeEventListener(type, listener),
    dispatchEvent: (name: string) => textNode.dispatchEvent(new Event(name))
  }
}