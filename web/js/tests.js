/* global ti, $, jQuery, tiJsTests */

// ----- Constants -----

const TOGGLECLASS_SETTING = 'toggleclass'
const HIDE_SUCCESS_SETTING = 'hideSuccess'

const DEFAULT_SETTINGS = {
  [TOGGLECLASS_SETTING]: {},
  [HIDE_SUCCESS_SETTING]: false,
}

// ----- On ready -----

$(() => {
  initFonts()
  initPage()
  initTests()
  initInput()
  initButtons()
  configureTranspiler()
  restoreToggleClass()
  detectLibraryVersion()
});

(function ($) {
  $.fn.persistToggleClass = function (className, state) {
    $(this).toggleClass(className, state)

    const map = getFromStorage(TOGGLECLASS_SETTING)

    this.each(function () {
      const id = $(this).attr('id')
      if (id !== undefined) {
        map[id] = {
          className,
          state: $(this).hasClass(className),
        }
      }
    })

    saveToStorage(TOGGLECLASS_SETTING, map)

    return this
  }

  $.fn.invert = function () {
    return this.end().not(this)
  }
})(jQuery)

function restoreToggleClass () {
  const map = getFromStorage(TOGGLECLASS_SETTING)

  Object.keys(map).forEach(key => {
    const $elem = $('#' + key)
    if ($elem.length > 0) {
      const value = map[key]
      $elem.toggleClass(value.className, value.state)
    } else {
      delete map[key]
    }
  })

  saveToStorage(TOGGLECLASS_SETTING, map)
}

function initFonts () {
  $('head').append($(`\
<link rel="preconnect" href="https://fonts.gstatic.com">
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;500;700&display=swap" rel="stylesheet">
  `))
}

function initPage () {
  $('#content').append($(`\
<h1><a href="../">TI-JS</a> TESTS</h1>
<div id="versionInfo">
    <p><strong>TI-JS Library:</strong> <span id="libraryVersion">Loading...</span> | <strong>Built:</strong> <span id="libraryBuildTime">Loading...</span></p>
</div>
<div>
    <h3>Results</h3>
    <div id="testSummary">
        <div>
            <label for="overall">Successful tests:</label>
            <span id="overall"></span>
        </div>
        <div>
            <label for="failed">Failed:</label>
            <span id="failed"></span>
        </div>
        <div>
            <label for="running">Running:</label>
            <span id="running"></span>
        </div>
        <div>
            <button id="collapseAll">-</button>
            <button id="expandAll">+</button>
        </div>
        <div>
            <label for="collapseSuccess">Auto-hide success</label>
            <input id="collapseSuccess" type="checkbox"></input>
        </div>
    </div>
    <h3>Tests</h3>
    <table id="testTable">
        <thead>
            <tr>
                <th>Result</th>
                <th>Name</th>
                <th>Input</th>
                <th>Stdin</th>
                <th>Expected</th>
                <th>Output</th>
            </tr>
        </thead>
    </table>
</div>
`))
}

function initInput () {
  const $testCases = $('[data-type=testCase]')
  bindCheckbox($('#collapseSuccess'), HIDE_SUCCESS_SETTING, value => {
    if (value === true) {
      $testCases
        .filter('[data-result=success]')
        .persistToggleClass('collapse', true)
        .invert()
        .persistToggleClass('collapse', false)
    }
  })
}

function bindCheckbox ($checkBox, name, callback) {
  $checkBox.prop('checked', getFromStorage(name))
  $checkBox.on('change', () => saveToStorage(name, $checkBox.is(':checked'), callback))
}

function initTests () {
  const trimInput = (text) => {
    const indent = tiJsTests.options.indent

    if (text === undefined || text.indexOf('\n') === -1) {
      return text
    }

    return text
      .split('\n')
      .filter((line, index, array) => index !== array.length - 1)
      .map(line => line.substring(indent))
      .join('\n')
  }

  const $tbody = $('<tbody>')
  $tbody.attr('data-type', 'testCases')

  const testNameMap = {}

  tiJsTests.testCases.forEach(testCase => {
    const sanitizedName = testCase.name.replace(' ', '').toLowerCase()
    testNameMap[sanitizedName] = (testNameMap[sanitizedName] || 0) + 1
    const id = `test_${sanitizedName}_${testNameMap[sanitizedName]}`

    const $row = $('<tr>')
    $row.attr('data-type', 'testCase')
    $row.attr('id', id)

    const $result = $('<span>')
    $result.attr('data-type', 'result')
    $row.append($('<td>').append($result))

    const $name = $('<span>')
    $name.attr('data-type', 'name')
    $name.text(testCase.name)
    $row.append($('<td>').append($name))

    const $input = $('<textarea>')
    $input.attr('data-type', 'input')
    $input.val(trimInput(testCase.input))
    $row.append($('<td>').append($input))

    const $stdin = $('<textarea>')
    $stdin.attr('data-type', 'stdin')
    $stdin.val(trimInput(testCase.stdin))
    $row.append($('<td>').append($stdin))

    const $expected = $('<textarea>')
    $expected.attr('data-type', 'expected')
    $expected.attr('readonly', true)
    $expected.val(trimInput(testCase.expected))
    $row.append($('<td>').append($expected))

    const $output = $('<textarea>')
    $output.attr('data-type', 'output')
    $output.attr('readonly', true)
    $row.append($('<td>').append($output))

    $tbody.append($row)
  })

  $tbody.on(
    'click',
    '[data-type=result], [data-type=name]',
    e => $(e.currentTarget)
      .parents('[data-type=testCase]')
      .persistToggleClass('collapse'))

  $('#testTable').append($tbody)
}

function initButtons () {
  const $testCases = $('[data-type=testCase]')

  $('#collapseAll').on('click', () => $testCases
    .persistToggleClass('collapse', true))

  $('#expandAll').on('click', () => $testCases
    .persistToggleClass('collapse', false))
}

function configureTranspiler () {
  const $overall = $('#overall')
  const $failed = $('#failed')
  const $running = $('#running')

  const $testCases = $('[data-type=testCase]')

  const updateCount = () => {
    const $successTests = $testCases.filter('[data-result=success]')
    const $failedTests = $testCases.filter('[data-result=failure]')

    const allCount = $testCases.length
    const successCount = $successTests.length
    const failedCount = $failedTests.length
    const runningCount = allCount - (successCount + failedCount)

    $overall.text(`${successCount}/${allCount}`)
    $failed.text(failedCount)
    $running.text(runningCount)

    $overall.toggleClass('success', successCount === allCount)
    $failed.toggleClass('failed', failedCount > 0)
    $running.toggleClass('running', runningCount > 0)

    let title = 'ti-js'

    if (runningCount > 0) {
      title += ': Running'
    } else if (successCount === allCount) {
      title += ': Success'
    } else {
      title += `: Failed (${failedCount})`
    }

    document.title = title
  }

  updateCount()

  const trimLastNewline = (text) => {
    if (text.length > 0) {
      const lastCharacter = text[text.length - 1]
      if (lastCharacter === '\n') {
        text = text.substring(0, text.length - 1)
      }
    }

    return text
  }

  const transpile = ($input) => {
    if ($input.length === 0) {
      throw new Error('Missing input!')
    }

    const $testCase = $input.parents('[data-type=testCase]')
    const $stdin = $testCase.find('[data-type=stdin]')
    const $expected = $testCase.find('[data-type=expected]')
    const $output = $testCase.find('[data-type=output]')
    const $result = $testCase.find('[data-type=result]')

    $result.text('Transpiling')
    $result.removeAttr('data-result')
    if (getFromStorage(HIDE_SUCCESS_SETTING)) {
      $testCase.persistToggleClass('collapse', false)
    }

    const source = $input.val()
    let lines
    try {
      lines = ti.parse(source)
    } catch (ex) {
      $result.text('Failure')
      $testCase.attr('data-result', 'failure')
      updateCount()
      return
    }

    $output.val('')

    $result.text('Running')

    const callback = (status) => {
      if (status === 'faulted') {
        $result.text('Faulted')
        $testCase.attr('data-result', 'failure')
      } else {
        const output = trimLastNewline($output.val())
        if (output === $expected.val()) {
          $result.text('Success')
          $testCase.attr('data-result', 'success')

          if (getFromStorage(HIDE_SUCCESS_SETTING)) {
            $testCase.persistToggleClass('collapse', true)
          }
        } else {
          $result.text('Failure')
          $testCase.attr('data-result', 'failure')
        }
      }

      updateCount()
    }

    ti.run(lines, {
      debug: false,
      elem: $output,
      includeLineNumbers: false,
      includeSource: false,
      stdin: $stdin.val(),
      callback,
    })
  }

  $('[data-type=testCases]').on(
    'input selectionchange propertychange',
    '[data-type=input]', e => transpile($(e.currentTarget)))

  $('[data-type=testCases] [data-type=input]').each(
    (i, input) => transpile($(input)))
}

// ----- Helpers -----

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

function detectLibraryVersion () {
  try {
    let libraryInfo = 'Unknown'
    let buildInfo = 'Unknown'

    if (typeof ti !== 'undefined') {
      // Use the exported functions if available
      if (typeof ti.getVersion === 'function') {
        libraryInfo = ti.getVersion()
      } else {
        libraryInfo = 'TI-JS loaded'
      }

      if (typeof ti.getBuildTime === 'function') {
        buildInfo = ti.getBuildTime()
      } else {
        buildInfo = 'Unknown'
      }
    } else {
      libraryInfo = 'TI library not loaded'
      buildInfo = 'N/A'
    }

    $('#libraryVersion').text(libraryInfo)
    $('#libraryBuildTime').text(buildInfo)
  } catch (ex) {
    $('#libraryVersion').text(`Error: ${ex.message}`)
    $('#libraryBuildTime').text('Error')
  }
}
