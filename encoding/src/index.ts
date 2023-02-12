import * as fs from 'fs'
import * as path from 'path'
import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'

import { createNames } from './lib/name'
import { createStricts } from './lib/strict'
import { createUtf8 } from './lib/utf8'
import { writeMarkdown } from './lib/markdown'
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
    output.push({
      hex: record.hex,
      name: names.get(record)!,
      strict: stricts.get(record)!,
      utf8: createUtf8(record),
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

main()
