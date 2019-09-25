/* global ti, $ */

// ----- Constants -----

const DEBUG_SETTING = 'debug'
const PERSIST_SETTING = 'persist'
const SOURCE_SETTING = 'source'
const FREQUENCY_SETTING = 'frequency'

const DEFAULT_SETTINGS = {
  [DEBUG_SETTING]: false,
  [PERSIST_SETTING]: true,
  [SOURCE_SETTING]: undefined,
  [FREQUENCY_SETTING]: 1
}

// ----- On ready -----

$(() => {
  initInput()
  configureTranspiler()
})

function initInput () {
  bindCheckbox($('#debug'), DEBUG_SETTING)
  bindCheckbox($('#persist'), PERSIST_SETTING)
  bindNumber($('#frequency'), FREQUENCY_SETTING)

  bindTextarea(
    $('#source'),
    SOURCE_SETTING,
    () => getFromStorage(PERSIST_SETTING),
    callback => $.get('/api/loop.8xp.txt', callback))
}

function configureTranspiler () {
  const $source = $('#source')
  const $transpiled = $('#transpiled')
  const $output = $('#output')
  const $input = $('#input')
  const $daemonStatus = $('#daemonStatus')

  ti.daemon.addEventListener('start', () => $daemonStatus.attr('data-status', 'running'))
  ti.daemon.addEventListener('suspend', () => $daemonStatus.attr('data-status', 'suspended'))
  ti.daemon.addEventListener('stop', () => $daemonStatus.removeAttr('data-status'))

  const io = ti.io.val_io($output, { input: $input })

  let program

  const transpile = () => {
    if (program !== undefined && program.isActive()) {
      program.stop()
    }

    const source = $source.val()
    if (source.length === 0) {
      return
    }

    const transpiled = ti.parser.parse(source, { output: 'source' })
    $transpiled.val(transpiled)

    $output.val('')
    // eslint-disable-next-line no-eval
    const lines = eval(transpiled)
    program = ti.core.run(lines, {
      source: source,
      debug: getFromStorage(DEBUG_SETTING),
      io: io,
      frequencyMs: getFromStorage(FREQUENCY_SETTING)
    })
  }

  $source.on('input selectionchange propertychange', transpile)
  $('#run').on('click', transpile)
  transpile()
}

// ----- Helpers -----

function bindTextarea ($textArea, name, condition = () => true, load = undefined) {
  $textArea.on('input selectionchange propertychange', () => {
    if (condition() === true) {
      saveToStorage(name, $textArea.val())
    }
  })

  if (condition() === true) {
    const result = getFromStorage(name)
    if (result !== undefined) {
      $textArea.val(result)
      $textArea.trigger('propertychange')
      return
    }
  }

  if (load !== undefined) {
    load(result => {
      $textArea.val(result)
      $textArea.trigger('propertychange')
    })
  }
}

function bindCheckbox ($checkBox, name) {
  $checkBox.prop('checked', getFromStorage(name))
  $checkBox.on('change', () => saveToStorage(name, $checkBox.is(':checked')))
}

function bindNumber ($number, name) {
  $number.prop('value', getFromStorage(name))
  $number.on('change', () => saveToStorage(name, parseFloat($number.val())))
}

function getFromStorage (name) {
  const value = JSON.parse(localStorage.getItem(name))
  return value === null ? DEFAULT_SETTINGS[name] : value
}

function saveToStorage (name, value) {
  localStorage.setItem(name, JSON.stringify(value))
}
