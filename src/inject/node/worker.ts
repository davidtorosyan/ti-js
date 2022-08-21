// worker
// ======

import { parentPort } from 'worker_threads'

parentPort?.on('message', (msg: string) => {
  parentPort?.postMessage(msg)
})
