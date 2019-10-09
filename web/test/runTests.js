/* global ti, $, jQuery, tiJsTests */

// ----- Constants -----

const TOGGLECLASS_SETTING = 'toggleclass'

const DEFAULT_SETTINGS = {
  [TOGGLECLASS_SETTING]: {}
}

// ----- On ready -----

$(() => {
  initTests()
  initButtons()
  configureTranspiler()
  restoreToggleClass()
});

(function ($) {
  $.fn.persistToggleClass = function (className, state) {
    $(this).toggleClass(className, state)

    const map = getFromStorage(TOGGLECLASS_SETTING)

    this.each(function () {
      const id = $(this).attr('id')
      if (id !== undefined) {
        map[id] = {
          className: className,
          state: $(this).hasClass(className)
        }
      }
    })

    saveToStorage(TOGGLECLASS_SETTING, map)

    return this
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
    e => $(e.currentTarget).parents('[data-type=testCase]').persistToggleClass('collapse'))

  $('#testTable').append($tbody)
}

function initButtons () {
  const $testCases = $('[data-type=testCase]')

  $('#collapseAll').on('click', () => $testCases
    .persistToggleClass('collapse', true))

  $('#expandAll').on('click', () => $testCases
    .persistToggleClass('collapse', false))

  $('#collapseSuccessful').on('click', () => $testCases
    .has('[data-result=success]')
    .persistToggleClass('collapse', true))
}

function configureTranspiler () {
  const $overall = $('#overall')
  const $failed = $('#failed')
  const $running = $('#running')

  const $testCases = $('[data-type=testCases]')
  const $allTests = $testCases.find('[data-type=result]')

  const updateCount = () => {
    const $successTests = $allTests.filter('[data-result=success]')
    const $failedTests = $allTests.filter('[data-result=failure]')

    const allCount = $allTests.length
    const successCount = $successTests.length
    const failedCount = $failedTests.length
    const runningCount = allCount - (successCount + failedCount)

    $overall.text(`${successCount}/${allCount}`)
    $failed.text(failedCount)
    $running.text(runningCount)

    $overall.toggleClass('success', successCount === allCount)
    $failed.toggleClass('failed', failedCount > 0)
    $running.toggleClass('running', runningCount > 0)
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

    const io = ti.ioFromVal($output, { includeLineNumbers: false, includeSource: false, stdin: $stdin.val() })

    $result.text('Transpiling')
    $result.removeAttr('data-result')

    const source = $input.val()
    let lines
    try {
      lines = ti.parse(source)
    } catch (ex) {
      $result.text('Failure')
      $result.attr('data-result', 'failure')
      updateCount()
      return
    }

    $output.val('')

    $result.text('Running')

    const callback = () => {
      const output = trimLastNewline($output.val())
      if (output === $expected.val()) {
        $result.text('Success')
        $result.attr('data-result', 'success')
      } else {
        $result.text('Failure')
        $result.attr('data-result', 'failure')
      }

      updateCount()
    }

    ti.run(lines, {
      debug: false,
      io: io,
      callback: callback
    })
  }

  $('[data-type=testCases]').on('input selectionchange propertychange', '[data-type=input]', e => transpile($(e.currentTarget)))
  $('[data-type=testCases] [data-type=input]').each((i, input) => transpile($(input)))
}

// ----- Helpers -----

function getFromStorage (name) {
  const value = JSON.parse(localStorage.getItem(name))
  return value === null ? DEFAULT_SETTINGS[name] : value
}

function saveToStorage (name, value) {
  localStorage.setItem(name, JSON.stringify(value))
}
