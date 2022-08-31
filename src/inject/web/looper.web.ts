// looper.web
// ===========

import type { Looper } from '../looper'

export class WebLooper implements Looper {
  post (message: string) {
    return window.postMessage(message, '*')
  }

  on (message: string, listener: () => void) {
    return window.addEventListener('message', this.wrapListener(message, listener))
  }

  off (message: string, listener: () => void) {
    return window.removeEventListener('message', this.wrapListener(message, listener))
  }

  private wrapListener (message: string, listener: () => void) {
    return (event: MessageEvent) => {
      if (event.source === window && event.data === message) {
        event.stopPropagation()
        listener()
      }
    }
  }
}
