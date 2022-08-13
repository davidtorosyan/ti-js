// looper.web
// ===========

export function postMessage(message, targetOrigin, transfer) {
    return window.postMessage(message, targetOrigin, transfer)
}

export function addEventListener(type, listener, useCapture) {
    return window.addEventListener(type, wrapListener(listener), useCapture)
}

export function removeEventListener(type, listener, useCapture) {
    return window.removeEventListener(type, wrapListener(listener), useCapture)
}

function wrapListener(listener) {
    return (event) => {
        if (event.source === window) {
            event.stopPropagation()
            listener(event.data)
        }
    }
}