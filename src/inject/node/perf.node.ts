// perf.node
// =========

import { performance } from 'perf_hooks'

export class NodePerf {
  now () {
    return performance.now()
  }
}
