// jquery
// =====

import * as types from '../common/types'

const enterkey = 13

export function stdout($elem) {
  return (value, options = {}) => {
    const newline = options.newline === undefined ? true : options.newline
    setTimeout(() => {
      let result = $elem.val() + value
      if (newline) {
        result += '\n'
      }
      $elem.val(result)
    }, 0)
  }
}

export function stdin ($elem) {
  return (callback, options = {}) => {
    setTimeout(() => $elem.val(''), 0)
    $elem.on('keypress', e => {
      if (e.keyCode === enterkey) {
        const result = $elem.val()
        setTimeout(() => $elem.val(''), 0)
        if (callback(result) !== true) {
          $elem.off('keypress')
        }
      }
    })
  }
}

export function cleanup ($elem) {
  $elem.off('keypress')
}
