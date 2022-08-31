// daemon
// ======

/* eslint-disable @typescript-eslint/no-non-null-assertion */

import * as signal from '../common/signal'
import type { EventFactory, EventTarget } from '../inject/event'
import * as loader from '../inject/loader'
import type { Looper } from '../inject/looper'
import type { Perf } from '../inject/perf'

type CreateTaskOptions = {
  debug: boolean
}

type Task = {
  func: () => string | undefined,
  delay: number,
  lastRun: number | undefined,
  runOnce: boolean,
  stopOnException: boolean,
  suspended: boolean,
  debug: boolean,
}

const loopMessageName = 'daemon-loop'
const exceptionName = 'daemon-exception'
const minimumDelay = 0.001 // 1 microsecond
const tasks = new Map<number, Task>()
const exceptions: Array<unknown> = []
let running = false
let nextTaskId = 0
const maxExceptions = 1000

let looper: Looper | undefined

function startLooper () {
  looper?.on(loopMessageName, handleMessage)
  looper?.on(exceptionName, handleException)
}

function stopLooper () {
  looper?.off(loopMessageName, handleMessage)
  looper?.off(exceptionName, handleException)
}

function updateLooper (value: Looper) {
  looper = value
}

loader.subscribe(loader.LOOPER, updateLooper)

let eventFactory: EventFactory | undefined
let eventTarget: EventTarget | undefined

function updateEventFactory (value: EventFactory) {
  eventFactory = value

  eventTarget = eventFactory.createEventTarget()
}

loader.subscribe(loader.EVENT, updateEventFactory)

let perf: Perf | undefined

function updatePerf (value: Perf) {
  perf = value
}

loader.subscribe(loader.PERF, updatePerf)

function fireEvent (name: string) {
  eventTarget?.dispatchEvent(name)
}

function startIfNeeded () {
  if (running === false) {
    running = true
    fireEvent('start')
    startLooper()
    looper!.post(loopMessageName)
  }
}

function createTask (
  func: () => string | undefined,
  delay: number,
  runOnce: boolean,
  options: CreateTaskOptions,
) {
  const taskId = nextTaskId++
  const debug = options.debug

  if (debug) {
    console.debug(`[Task ${taskId}] Start`)
  }

  tasks.set(taskId, {
    func,
    delay: Math.max(delay, minimumDelay),
    lastRun: undefined,
    runOnce,
    stopOnException: true,
    suspended: false,
    debug,
  })

  startIfNeeded()
  return taskId
}

function resumeTask (taskId: number) {
  const task = tasks.get(taskId)

  if (task === undefined) {
    throw new Error(`Error resuming: task '${taskId}' not found`)
  }

  if (task.debug) {
    console.debug(`[Task ${taskId}] Resume`)
  }

  task.suspended = false
  startIfNeeded()
}

function suspendTask (taskId: number) {
  const task = tasks.get(taskId)

  if (task === undefined) {
    throw new Error(`Error suspending: task '${taskId}' not found`)
  }

  if (task.debug) {
    console.debug(`[Task ${taskId}] Suspend`)
  }

  task.suspended = true
}

function deleteTask (taskId: number) {
  const task = tasks.get(taskId)

  if (task === undefined) {
    throw new Error(`Error deleting: task '${taskId}' not found`)
  }

  if (task.debug) {
    console.debug(`[Task ${taskId}] Stop`)
  }

  tasks.delete(taskId)
}

function handleMessage () {
  const time = perf!.now()
  let runningTaskCount = 0
  let suspendedTaskCount = 0

  tasks.forEach((task, taskId) => {
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
          looper!.post(exceptionName)
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
    looper!.post(loopMessageName)
  }
}

function handleException () {
  if (exceptions.length > 0) {
    throw exceptions.pop()
  }
}

export function setTinyInterval (
  func: () => string | undefined,
  delay: number,
  options: CreateTaskOptions = { debug: false },
) {
  return createTask(func, delay, false, options)
}

export function clearTinyInterval (tinyIntervalID: number) {
  deleteTask(tinyIntervalID)
}

export function resumeTinyInterval (tinyIntervalID: number) {
  resumeTask(tinyIntervalID)
}

export function setTinyTimeout (
  func: () => string | undefined,
  delay: number,
  options: CreateTaskOptions = { debug: false },
) {
  return createTask(func, delay, true, options)
}

export function clearTinyTimeout (tinyTimeoutID: number) {
  deleteTask(tinyTimeoutID)
}

/**
 * @alpha
 */
export function on (type: string, listener: () => void) {
  eventTarget!.addEventListener(type, listener)
}

export function off (type: string, listener: () => void) {
  eventTarget!.removeEventListener(type, listener)
}
