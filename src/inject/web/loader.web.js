// loader.web
// ===========

import * as loader from '../loader'
import * as looper from './looper.web'
import * as event from './event.web'

export function init() {
    loader.set(loader.LOOPER, looper)
    loader.set(loader.EVENT, event)
}