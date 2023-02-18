import * as fs from 'fs'
import * as path from 'path'
import { stringify } from 'csv-stringify/sync'
import { ARROW, ARROW_STRICT } from '../util/hex'
import { chunkString } from '../util/text'
import type { TiTokenOutput } from './common'

export interface MarkdownOutput {
    hex: string
    name: string
    strict: string
    utf8: string | undefined
    composite: string | undefined
}

export function writeMarkdown (output: TiTokenOutput[]): void {
  const outputFilePath = path.resolve(__dirname, '../../dist/ENCODING.md')
  const outDir = path.dirname(outputFilePath)
  const markdownOutputs = transformOutputs(output)
  const result = stringify(markdownOutputs, {
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

function transformOutputs (outputs: TiTokenOutput[]): MarkdownOutput[] {
  const strictMap = new Map(outputs.map(output => [output.hex, output.strict]))
  strictMap.set(ARROW, ARROW_STRICT)
  return outputs.map(output => transformOutput(output, strictMap))
}

function transformOutput (output: TiTokenOutput, strictMap: Map<string, string>): MarkdownOutput {
  let composite
  if (output.composite) {
    const chunked = chunkString(output.composite, output.hex.length)
    composite = chunked.map(hex => strictMap.get(hex)).join('')
  }

  return {
    hex: output.hex,
    name: output.name,
    strict: output.strict,
    utf8: output.utf8,
    composite,
  }
}

function prepareMarkdown (input: string): string {
  if (input.includes('`')) {
    return '`` ' + input + ' ``'
  }
  return '`' + input.replace(/\|/, '\\|') + '`'
}
