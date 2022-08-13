// looper.node
// ===========

const { Worker } = require('worker_threads')

const worker = new Worker(new URL('./worker.js', import.meta.url))

export function postMessage(message, targetOrigin, transfer) {
    return worker.postMessage(message)
}

export function addEventListener(type, listener, useCapture) {
    return worker.on(type, listener)
}

export function removeEventListener(type, listener, useCapture) {
    return worker.off(type, listener)
}