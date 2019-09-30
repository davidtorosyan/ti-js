const messageName = 'tiny-timeout-message'
const exceptionName = 'tiny-timeout-exception'
const minimumDelay = 0.001 // 1 microsecond
const tasks = {}
const exceptions = []
let running = false
let nextTaskId = 0
const maxExceptions = 1000

const daemonEventTarget = document.createTextNode(null)

function daemonEvent (name) {
  const event = new Event(name)
  daemonEventTarget.dispatchEvent(event)
}

function daemonStartIfNeeded () {
  if (running === false) {
    running = true
    daemonEvent('start')
    window.postMessage(messageName, '*')
  }
}

function daemonCreateTask (func, delay, runOnce) {
  const taskId = nextTaskId++

  tasks[taskId] = {
    func: func,
    delay: Math.max(delay, minimumDelay),
    lastRun: undefined,
    runOnce: runOnce,
    stopOnException: true,
    suspended: false
  }

  daemonStartIfNeeded()
  return taskId
}

function daemonResumeTask (taskId) {
  if (!(taskId in tasks)) {
    console.log(tasks)
    throw new Error(`Error resuming: task '${taskId}' not found`)
  }
  tasks[taskId].suspended = false
  daemonStartIfNeeded()
};

function daemonDeleteTask (taskId) {
  delete tasks[taskId]
};

function daemonHandleMessage (event) {
  if (!(event.source === window && event.data === messageName)) {
    return
  }

  event.stopPropagation()

  const time = performance.now()
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
        result = FAULTED

        if (exceptions.length < maxExceptions) {
          exceptions.push(ex)
          window.postMessage(exceptionName, '*')
        }
      }

      if (result === DONE ||
                task.runOnce ||
                (task.stopOnException && result === FAULTED)) {
        daemonDeleteTask(taskId)
        runningTaskCount -= 1
        break
      }

      if (result === SUSPEND) {
        task.suspended = true
        runningTaskCount -= 1
        suspendedTaskCount += 1
        break
      }

      if (result === YIELD) {
        break
      }
    }
  })

  if (runningTaskCount === 0) {
    running = false
    if (suspendedTaskCount > 0) {
      daemonEvent('suspend')
    } else {
      daemonEvent('stop')
    }
  } else {
    window.postMessage(messageName, '*')
  }
};

function daemonHandleException (event) {
  if (!(event.source === window && event.data === exceptionName)) {
    return
  }

  if (exceptions.length > 0) {
    throw exceptions.pop()
  }
}

window.addEventListener('message', daemonHandleMessage, true)
window.addEventListener('message', daemonHandleException, true)

export function setTinyInterval (func, delay) {
  return daemonCreateTask(func, delay)
}

export function clearTinyInterval (tinyIntervalID) {
  daemonDeleteTask(tinyIntervalID)
}

export function resumeTinyInterval (tinyIntervalID) {
  daemonResumeTask(tinyIntervalID)
}

export function setTinyTimeout (func, delay) {
  return daemonCreateTask(func, delay, true)
}

export function clearTinyTimeout (tinyTimeoutID) {
  daemonDeleteTask(tinyTimeoutID)
}

export const YIELD = 'yield'
export const DONE = 'done'
export const FAULTED = 'faulted'
export const SUSPEND = 'suspend'

export const addEventListener = daemonEventTarget.addEventListener.bind(daemonEventTarget)
export const removeEventListener = daemonEventTarget.removeEventListener.bind(daemonEventTarget)
export const dispatchEvent = daemonEventTarget.dispatchEvent.bind(daemonEventTarget)
