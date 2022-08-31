// event.web
// =========

import type { EventTarget } from '../event'

export class WebEventTarget implements EventTarget {
  private readonly textNode: Text

  constructor () {
    this.textNode = document.createTextNode('')
  }

  addEventListener (type: string, listener: () => void) {
    this.textNode.addEventListener(type, listener)
  }

  removeEventListener (type: string, listener: () => void) {
    this.textNode.removeEventListener(type, listener)
  }

  dispatchEvent (name: string) {
    this.textNode.dispatchEvent(new Event(name))
  }
}
