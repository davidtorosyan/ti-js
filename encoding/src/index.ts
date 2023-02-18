import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'

import { createNames } from './lib/name'
import { createStricts } from './lib/strict'
import { createComposites } from './lib/composite'
import { createUtf8 } from './lib/utf8'
import { writeMarkdown } from './lib/markdown'
import { readGlyphs } from './lib/pixels'
import { drawSprites } from './lib/draw'
import { read, write } from './util/file'
import type { TiTokenInput, TiTokenOutput } from './lib/common'

function main (): void {
  const input = readInput()
  const glyphs = readGlyphs()
  const output = transform(input, glyphs)
  writeOutput(output)

  const sprites = drawSprites(output, glyphs)
  writeMarkdown(output, sprites)
}

function transform (input: TiTokenInput[], glpyhs: Map<string, string>): TiTokenOutput[] {
  const output: TiTokenOutput[] = []

  const names = createNames(input)
  const stricts = createStricts(input)
  const composites = createComposites(input)

  for (const record of input) {
    const composite = composites.get(record)
    const length = composite === undefined ? 1 : composite.length / record.hex.length

    output.push({
      hex: record.hex,
      name: names.get(record)!,
      strict: stricts.get(record)!,
      utf8: createUtf8(record),
      composite,
      length,
      glyph: glpyhs.get(record.hex),
    })
  }

  return output
}

function readInput (): TiTokenInput[] {
  const fileContent = read('input.csv')
  const records: TiTokenInput[] = parse(fileContent, {
    delimiter: ',',
    columns: ['hex', 'token'],
    fromLine: 2,
    quote: false,
  })
  return records
}

function writeOutput (output: TiTokenOutput[]): void {
  const result = stringify(output, {
    delimiter: ',',
    header: true,
  })
  write('output.csv', result)
}

main()
