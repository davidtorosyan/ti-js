// daemon
// ======

import * as signal from '../common/signal'
import * as inject from '../inject/inject'

interface CreateTaskOptions {
  debug: boolean
}

interface Task {
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
const exceptions: unknown[] = []
let running = false
let nextTaskId = 0
const maxExceptions = 1000

const looper = inject.getLooper
const eventTarget = inject.getEventTarget
const perf = inject.getPerf

function startLooper (): void {
  looper().on(loopMessageName, handleMessage)
  looper().on(exceptionName, handleException)
}

function stopLooper (): void {
  looper().off(loopMessageName, handleMessage)
  looper().off(exceptionName, handleException)
}

function fireEvent (name: string): void {
  eventTarget().dispatchEvent(name)
}

function startIfNeeded (): void {
  if (!running) {
    running = true
    fireEvent('start')
    startLooper()
    looper().post(loopMessageName)
  }
}

function createTask (
  func: () => string | undefined,
  delay: number,
  runOnce: boolean,
  options: CreateTaskOptions,
): number {
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

function resumeTask (taskId: number): void {
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

function suspendTask (taskId: number): void {
  const task = tasks.get(taskId)

  if (task === undefined) {
    throw new Error(`Error suspending: task '${taskId}' not found`)
  }

  if (task.debug) {
    console.debug(`[Task ${taskId}] Suspend`)
  }

  task.suspended = true
}

function deleteTask (taskId: number): void {
  const task = tasks.get(taskId)

  if (task === undefined) {
    throw new Error(`Error deleting: task '${taskId}' not found`)
  }

  if (task.debug) {
    console.debug(`[Task ${taskId}] Stop`)
  }

  tasks.delete(taskId)
}

function handleMessage (): void {
  const time = perf().now()
  let runningTaskCount = 0
  let suspendedTaskCount = 0

  tasks.forEach((task, taskId) => {
    let runs
    if (task.suspended) {
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
          looper().post(exceptionName)
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
    looper().post(loopMessageName)
  }
}

function handleException (): void {
  if (exceptions.length > 0) {
    throw exceptions.pop()
  }
}

export function setTinyInterval (
  func: () => string | undefined,
  delay: number,
  options: CreateTaskOptions = { debug: false },
): number {
  return createTask(func, delay, false, options)
}

export function clearTinyInterval (tinyIntervalID: number): void {
  deleteTask(tinyIntervalID)
}

export function resumeTinyInterval (tinyIntervalID: number): void {
  resumeTask(tinyIntervalID)
}

export function setTinyTimeout (
  func: () => string | undefined,
  delay: number,
  options: CreateTaskOptions = { debug: false },
): number {
  return createTask(func, delay, true, options)
}

export function clearTinyTimeout (tinyTimeoutID: number): void {
  deleteTask(tinyTimeoutID)
}

/**
 * @alpha
 */
export function on (type: string, listener: () => void): void {
  eventTarget().addEventListener(type, listener)
}

export function off (type: string, listener: () => void): void {
  eventTarget().removeEventListener(type, listener)
}
