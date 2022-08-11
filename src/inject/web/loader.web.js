// loader.web
// ===========

import * as loader from '../loader'
import * as looper from './looper.web'

export function init() {
    loader.set(loader.LOOPER, looper)
}