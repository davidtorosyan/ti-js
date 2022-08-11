// looper.web
// ===========

export function postMessage(message, targetOrigin, transfer) {
    return window.postMessage(message, targetOrigin, transfer)
}

export function addEventListener(type, listener, useCapture) {
    return window.addEventListener(type, listener, useCapture)
}

export function removeEventListener(type, listener, useCapture) {
    return window.removeEventListener(type, listener, useCapture)
}

export function source() {
    return window
}
