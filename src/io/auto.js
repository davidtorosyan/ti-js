// auto
// =====

import * as types from '../common/types'

export function stdin (lines) {
  const queue = lines.split('\n').reverse()
  return (callback, options = {}) {
    const result = queue.pop()
    setTimeout(() => {
      if (callback(result) === true) {
        stdin(callback, options)
      }
    }, 0)
  }
}
