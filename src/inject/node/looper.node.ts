// looper.node
// ===========

import { Worker } from 'worker_threads'

let worker: Worker | undefined

function createWorker () {
  worker = new Worker(new URL('./worker.ts', import.meta.url))
}

function destroyWorker () {
  if (worker !== undefined) {
    worker.terminate()
    worker = undefined
  }
}

function workerHasListeners () {
  return worker !== undefined && worker.listenerCount('message') > 0
}

export function post (message: string) {
  if (worker === undefined) {
    return
  }

  worker.postMessage(message)
}

export function on (message: string, listener: () => void) {
  if (worker === undefined) {
    createWorker()
  }

  worker!.on('message', wrapListener(message, listener))
}

export function off (message: string, listener: () => void) {
  if (worker === undefined) {
    return
  }

  worker.off('message', wrapListener(message, listener))

  if (!workerHasListeners()) {
    destroyWorker()
  }
}

type Listener = () => void
type WrappedListener = (message: string) => void
const listenerMap = new Map<string, Map<Listener, WrappedListener>>()

function wrapListener (message: string, listener: () => void) {
  let secondary = listenerMap.get(message)
  if (secondary === undefined) {
    secondary = new Map<Listener, WrappedListener>()
    listenerMap.set(message, secondary)
  }

  let wrapped = secondary.get(listener)
  if (wrapped === undefined) {
    wrapped = (postedMessage: string) => {
      if (postedMessage === message) {
        listener()
      }
    }
    secondary.set(listener, wrapped)
  }

  return wrapped
}
