// daemon
// ======

import * as signal from '../common/signal'
import * as loader from '../inject/loader'

const loopMessageName = 'daemon-loop'
const exceptionName = 'daemon-exception'
const minimumDelay = 0.001 // 1 microsecond
const tasks = {}
const exceptions = []
let running = false
let nextTaskId = 0
const maxExceptions = 1000

let looper

function startLooper () {
  if (typeof looper !== 'undefined') {
    looper.addEventListener('message', handleMessage, true)
    looper.addEventListener('message', handleException, true)
  }
}

function stopLooper () {
  if (typeof looper !== 'undefined') {
    looper.removeEventListener('message', handleMessage, true)
    looper.removeEventListener('message', handleException, true)
  }
}

function updateLooper (value) {
  looper = value
}

loader.subscribe(loader.LOOPER, updateLooper)

let eventFactory
let eventTarget

function updateEventFactory (value) {
  eventFactory = value

  eventTarget = eventFactory.createEventTarget()
}

loader.subscribe(loader.EVENT, updateEventFactory)

let perf

function updatePerf (value) {
  perf = value
}

loader.subscribe(loader.PERF, updatePerf)

function fireEvent (name) {
  eventTarget.dispatchEvent(name)
}

function startIfNeeded () {
  if (running === false) {
    running = true
    fireEvent('start')
    startLooper()
    looper.postMessage(loopMessageName, '*')
  }
}

function createTask (func, delay, runOnce, options) {
  const taskId = nextTaskId++
  const debug = options.debug === true

  if (debug) {
    console.debug(`[Task ${taskId}] Start`)
  }

  tasks[taskId] = {
    func,
    delay: Math.max(delay, minimumDelay),
    lastRun: undefined,
    runOnce,
    stopOnException: true,
    suspended: false,
    debug,
  }

  startIfNeeded()
  return taskId
}

function resumeTask (taskId) {
  if (!(taskId in tasks)) {
    throw new Error(`Error resuming: task '${taskId}' not found`)
  }

  if (tasks[taskId].debug) {
    console.debug(`[Task ${taskId}] Resume`)
  }

  tasks[taskId].suspended = false
  startIfNeeded()
};

function suspendTask (taskId) {
  if (!(taskId in tasks)) {
    throw new Error(`Error suspending: task '${taskId}' not found`)
  }

  if (tasks[taskId].debug) {
    console.debug(`[Task ${taskId}] Suspend`)
  }

  tasks[taskId].suspended = true
};

function deleteTask (taskId) {
  if (!(taskId in tasks)) {
    throw new Error(`Error deleting: task '${taskId}' not found`)
  }

  if (tasks[taskId].debug) {
    console.debug(`[Task ${taskId}] Stop`)
  }

  delete tasks[taskId]
};

function handleMessage (data) {
  if (data !== loopMessageName) {
    return
  }

  const time = perf.now()
  const taskIds = Object.keys(tasks)
  let runningTaskCount = 0
  let suspendedTaskCount = 0

  taskIds.forEach(taskId => {
    const task = tasks[taskId]

    let runs
    if (task.suspended === true) {
      runs = 0
      suspendedTaskCount += 1
    } else {
      runningTaskCount += 1

      if (task.lastRun === undefined || task.runOnce) {
        runs = 1
      } else {
        const timeSinceRun = time - task.lastRun
        runs = Math.floor(timeSinceRun / task.delay)
      }
    }

    if (runs > 0) {
      task.lastRun = time
    }

    for (let i = 0; i < runs; i++) {
      let result

      try {
        result = task.func()
      } catch (ex) {
        result = signal.FAULTED

        if (exceptions.length < maxExceptions) {
          exceptions.push(ex)
          looper.postMessage(exceptionName, '*')
        }
      }

      if (result === signal.DONE ||
                task.runOnce ||
                (task.stopOnException && result === signal.FAULTED)) {
        deleteTask(taskId)
        runningTaskCount -= 1
        break
      }

      if (result === signal.SUSPEND) {
        suspendTask(taskId)
        runningTaskCount -= 1
        suspendedTaskCount += 1
        break
      }

      if (result === signal.YIELD) {
        break
      }
    }
  })

  if (runningTaskCount === 0) {
    running = false
    stopLooper()
    if (suspendedTaskCount > 0) {
      fireEvent('suspend')
    } else {
      fireEvent('stop')
    }
  } else {
    looper.postMessage(loopMessageName, '*')
  }
};

function handleException (data) {
  if (data !== exceptionName) {
    return
  }

  if (exceptions.length > 0) {
    throw exceptions.pop()
  }
}

export function setTinyInterval (func, delay, options = {}) {
  return createTask(func, delay, false, options)
}

export function clearTinyInterval (tinyIntervalID) {
  deleteTask(tinyIntervalID)
}

export function resumeTinyInterval (tinyIntervalID) {
  resumeTask(tinyIntervalID)
}

export function setTinyTimeout (func, delay, options = {}) {
  return createTask(func, delay, true)
}

export function clearTinyTimeout (tinyTimeoutID) {
  deleteTask(tinyTimeoutID)
}

export function on (type, listener, options) {
  eventTarget.addEventListener(type, listener, options)
}

export function off (type, listener, options) {
  eventTarget.removeEventListener(type, listener, options)
}
