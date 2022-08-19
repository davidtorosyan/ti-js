// inject
// ===========

export const LOOPER = 'looper'
export const EVENT = 'event'
export const PERF = 'perf'

const map = new Map()
const callbacks = new Map()

export function set (name, value) {
  map.set(name, value)
  if (callbacks.has(name)) {
    callbacks.get(name).forEach(callback => callback(value))
  }
}

export function subscribe (name, callback) {
  if (!callbacks.has(name)) {
    callbacks.set(name, [])
  }
  callbacks.get(name).push(callback)
  if (map.has(name)) {
    callback(map.get(name))
  }
}

export function unsubscribe (name, callback) {
  if (!callbacks.has(name)) {
    return
  }
  const array = callbacks.get(name).push(callback)
  const index = array.indexOf(callback)
  if (index === -1) {
    return
  }
  array.splice(index, 1)
}
