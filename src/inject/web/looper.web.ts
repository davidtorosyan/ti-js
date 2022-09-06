// looper.web
// ===========

import type { Looper } from '../looper'

export class WebLooper implements Looper {
  post (message: string): void {
    window.postMessage(message, '*')
  }

  on (message: string, listener: () => void): void {
    window.addEventListener('message', this.wrapListener(message, listener))
  }

  off (message: string, listener: () => void): void {
    window.removeEventListener('message', this.wrapListener(message, listener))
  }

  private wrapListener (message: string, listener: () => void) {
    return (event: MessageEvent): void => {
      if (event.source === window && event.data === message) {
        event.stopPropagation()
        listener()
      }
    }
  }
}
