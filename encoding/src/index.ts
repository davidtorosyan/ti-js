import * as fs from 'fs'
import * as path from 'path'
import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'

import { createNames } from './lib/name'
import { createStricts } from './lib/strict'
import { createUtf8 } from './lib/utf8'
import type { TiTokenInput, TiTokenOutput } from './lib/common'

function main (): void {
  const input = readInput()
  const output = transform(input)
  writeOutput(output)
  writeMarkdown(output)
}

function transform (input: TiTokenInput[]): TiTokenOutput[] {
  const output: TiTokenOutput[] = []

  const names = createNames(input)
  const stricts = createStricts(input)

  for (const record of input) {
    const strict = stricts.get(record)!

    output.push({
      hex: record.hex,
      name: names.get(record)!,
      strict,
      utf8: createUtf8(record, strict),
    })
  }

  return output
}

function readInput (): TiTokenInput[] {
  const inputFilePath = path.resolve(__dirname, '../data/input.csv')
  const fileContent = fs.readFileSync(inputFilePath, { encoding: 'utf-8' })
  const records: TiTokenInput[] = parse(fileContent, {
    delimiter: ',',
    columns: ['hex', 'token'],
    fromLine: 2,
    quote: false,
  })
  return records
}

function writeOutput (output: TiTokenOutput[]): void {
  const outputFilePath = path.resolve(__dirname, '../dist/output.csv')
  const outDir = path.dirname(outputFilePath)
  const result = stringify(output, {
    delimiter: ',',
    header: true,
  })
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir)
  }
  fs.writeFileSync(outputFilePath, result, { encoding: 'utf-8' })
}

function writeMarkdown (output: TiTokenOutput[]): void {
  const outputFilePath = path.resolve(__dirname, '../dist/ENCODING.md')
  const outDir = path.dirname(outputFilePath)
  const result = stringify(output, {
    delimiter: ' | ',
    cast: {
      string: prepareMarkdown,
    },
    quote: false,
    header: true,
  })

  const index = result.indexOf('\n')
  const header = '| ' + result.substring(0, index) + ' |'
  const divider = header.replace(/`[^`]+`/g, '-')
  const markdown = header + '\n' + divider + '\n' + result.substring(index + 1)

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir)
  }
  fs.writeFileSync(outputFilePath, markdown, { encoding: 'utf-8' })
}

function prepareMarkdown (input: string): string {
  if (input.includes('`')) {
    return '`` ' + input + ' ``'
  }
  return '`' + input.replace(/\|/, '\\|') + '`'
}

main()