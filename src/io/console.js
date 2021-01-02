// console
// =====

import * as types from '../common/types'

export function stdout() {
  return (value, options) => {
    console.log(value)
  }
}

export function stdin () {
  return (callback, options = {}) => {
    setTimeout(() => {
      if (callback(prompt('Input?')) === true) {
       stdin(callback, options)
      }
    }, 100)
  };
}
