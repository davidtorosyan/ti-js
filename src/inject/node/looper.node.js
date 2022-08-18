// looper.node
// ===========

const { Worker } = require('worker_threads')

let worker

function createWorker() {
    worker = new Worker(new URL('./worker.js', import.meta.url))
}

function destroyWorker() {
    worker.terminate()
    worker = undefined
}

function workerExists() {
    return typeof worker !== 'undefined'
}

function workerHasListeners() {
    return worker.listenerCount('message') > 0
}

export function postMessage(message, targetOrigin, transfer) {
    if (!workerExists()) {
        return
    }
    
    worker.postMessage(message)
}

export function addEventListener(type, listener, useCapture) {
    if (!workerExists()) {
        createWorker()
    }

    worker.on(type, listener)
}

export function removeEventListener(type, listener, useCapture) {
    if (!workerExists()) {
        return
    }

    worker.off(type, listener)

    if (!workerHasListeners()) {
        destroyWorker()
    }
}