// looper.web
// ===========

export function post (message: string) {
  return window.postMessage(message, '*')
}

export function on (message: string, listener: () => void) {
  return window.addEventListener('message', wrapListener(message, listener))
}

export function off (message: string, listener: () => void) {
  return window.removeEventListener('message', wrapListener(message, listener))
}

function wrapListener (message: string, listener: () => void) {
  return (event: MessageEvent) => {
    if (event.source === window && event.data === message) {
      event.stopPropagation()
      listener()
    }
  }
}
