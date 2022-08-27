// inject
// ===========

/* eslint-disable @typescript-eslint/no-explicit-any */

export const LOOPER = 'looper'
export const EVENT = 'event'
export const PERF = 'perf'

type Callback = (value: any) => void

const map = new Map<string, any>()
const callbackMap = new Map<string, Array<Callback>>()

export function set (name: string, value: any) {
  map.set(name, value)
  const callbacks = callbackMap.get(name)
  if (callbacks !== undefined) {
    callbacks.forEach(callback => callback(value))
  }
}

export function subscribe (name: string, callback: Callback) {
  let callbacks = callbackMap.get(name)
  if (callbacks === undefined) {
    callbacks = []
    callbackMap.set(name, callbacks)
  }
  callbacks.push(callback)
  if (map.has(name)) {
    callback(map.get(name))
  }
}

export function unsubscribe (name: string, callback: Callback) {
  const callbacks = callbackMap.get(name)
  if (callbacks === undefined) {
    return
  }
  const index = callbacks.indexOf(callback)
  if (index === -1) {
    return
  }
  callbacks.splice(index, 1)
}
