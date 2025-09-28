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
  [FREQUENCY_SETTING]: 1,
}

// ----- On ready -----

$(() => {
  initFonts()
  initPage()
  initInput()
  configureTranspiler()
})

function initFonts () {
  $('head').append($(`\
<link rel="preconnect" href="https://fonts.gstatic.com">
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;500;700&display=swap" rel="stylesheet">
  `))
}

function initPage () {
  $('#content').append($(`\
  <h1><a href="../">TI-JS</a> PLAYGROUND</h1>
  <div class="playground">
      <div>
          <label for="options">Options</label>
          <div id="options">
              <label for="debug">Debug</label>
              <input id="debug" type="checkbox"></input>

              <label for="persist">Persist</label>
              <input id="persist" type="checkbox"></input>

              <label for="frequency">Frequency</label>
              <input id="frequency" type="number"
                  min="1" max="1000" step="10"></input>
          </div>
      </div>
      <div>
          <label for="control">Control</label>
          <div id="control">
              <svg class="status">
                  <circle id="daemonStatus" />
              </svg>
              <button id="run">Run</button>
          </div>
      </div>
      <div>
          <table>
              <thead>
                  <tr>
                      <th>Source</th>
                      <th>Output</th>
                      <th>Screen</th>
                      <th>Input</th>
                  </tr>
              </thead>
              <tbody>
                  <tr>
                      <td>
                          <textarea id="source" autofocus rows="15" cols="20"></textarea>
                      </td>
                      <td>
                          <textarea id="output" readonly rows="15" cols="20"></textarea>
                      </td>
                      <td>
                      <div id="screen-container" style="margin-top: 10px;"></div>
                        </td>
                      <td>
                          <textarea id="input" rows="15" cols="20"></textarea>
                      </td>
                  </tr>
              </tbody>
          </table>
          </div>
      <div>
          <label for="transpiled">AST</label>
          <textarea id="transpiled" readonly rows="15" cols="100"></textarea>
      </div>

  </div>
`))
}

function initInput () {
  const $source = $('#source')

  bindCheckbox($('#debug'), DEBUG_SETTING)
  bindCheckbox($('#persist'), PERSIST_SETTING, value => {
    if (value === true) {
      saveToStorage(SOURCE_SETTING, $source.val())
    }
  })
  bindNumber($('#frequency'), FREQUENCY_SETTING)

  const defaultInput = `\
For(X,1,3,1)
Disp X
End`

  bindTextarea(
    $source,
    SOURCE_SETTING,
    () => getFromStorage(PERSIST_SETTING),
    callback => callback(defaultInput))
}

function configureTranspiler () {
  const $source = $('#source')
  const $ast = $('#transpiled')
  const $output = $('#output')
  const $input = $('#input')
  const $screenContainer = $('#screen-container')
  const $daemonStatus = $('#daemonStatus')

  ti.on('start', () => $daemonStatus.attr('data-status', 'running'))
  ti.on('suspend', () => $daemonStatus.attr('data-status', 'suspended'))
  ti.on('stop', () => $daemonStatus.removeAttr('data-status'))

  let program

  const transpile = () => {
    if (program !== undefined && program.isActive()) {
      program.stop()
    }

    const source = $source.val()
    if (source.length === 0) {
      return
    }

    const lines = ti.parse(source)
    const ast = JSON.stringify(lines, (key, value) => {
      if (value !== null) return value
    }, 2)

    $ast.val(ast)

    $output.val('')
    $screenContainer.empty()

    program = ti.run(lines, {
      debug: getFromStorage(DEBUG_SETTING),
      elem: $output,
      screenElem: $screenContainer,
      input: $input,
      frequencyMs: getFromStorage(FREQUENCY_SETTING),
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

function bindCheckbox ($checkBox, name, callback) {
  $checkBox.prop('checked', getFromStorage(name))
  $checkBox.on('change', () =>
    saveToStorage(name, $checkBox.is(':checked'), callback))
}

function bindNumber ($number, name) {
  $number.prop('value', getFromStorage(name))
  $number.on('change', () => saveToStorage(name, parseFloat($number.val())))
}

function getFromStorage (name) {
  const value = JSON.parse(localStorage.getItem(name))
  return value === null ? DEFAULT_SETTINGS[name] : value
}

function saveToStorage (name, value, callback) {
  localStorage.setItem(name, JSON.stringify(value))
  if (callback !== undefined) {
    callback(value)
  }
}
