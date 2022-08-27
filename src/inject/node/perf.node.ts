// perf.node
// =========

import { performance } from 'perf_hooks'

export function now () {
  return performance.now()
}
