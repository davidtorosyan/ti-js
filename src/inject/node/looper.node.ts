// looper.node
// ===========

import { Worker } from 'worker_threads'
import type { Looper } from '../looper'

type Listener = () => void
type WrappedListener = (message: string) => void

export class NodeLooper implements Looper {
  private worker: Worker | undefined
  private readonly listenerMap = new Map<string, Map<Listener, WrappedListener>>()

  post (message: string): void {
    if (this.worker === undefined) {
      return
    }

    this.worker.postMessage(message)
  }

  on (message: string, listener: () => void): void {
    if (this.worker === undefined) {
      this.worker = this.createWorker()
    }

    this.worker.on('message', this.wrapListener(message, listener))
  }

  off (message: string, listener: () => void): void {
    if (this.worker === undefined) {
      return
    }

    this.worker.off('message', this.wrapListener(message, listener))

    if (!this.workerHasListeners()) {
      this.destroyWorker()
    }
  }

  private createWorker (): Worker {
    return new Worker(new URL('./worker.ts', import.meta.url))
  }

  private destroyWorker (): void {
    if (this.worker !== undefined) {
      this.worker.terminate()
      this.worker = undefined
    }
  }

  private workerHasListeners (): boolean {
    return this.worker !== undefined && this.worker.listenerCount('message') > 0
  }

  private wrapListener (message: string, listener: () => void): WrappedListener {
    let secondary = this.listenerMap.get(message)
    if (secondary === undefined) {
      secondary = new Map<Listener, WrappedListener>()
      this.listenerMap.set(message, secondary)
    }

    let wrapped = secondary.get(listener)
    if (wrapped === undefined) {
      wrapped = (postedMessage: string): void => {
        if (postedMessage === message) {
          listener()
        }
      }
      secondary.set(listener, wrapped)
    }

    return wrapped
  }
}
