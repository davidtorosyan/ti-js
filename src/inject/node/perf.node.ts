// perf.node
// =========

import { performance } from 'perf_hooks'

export class NodePerf {
  now (): number {
    return performance.now()
  }
}
