import * as fs from 'fs'
import * as path from 'path'
import { stringify } from 'csv-stringify/sync'
import type { TiTokenOutput } from './common'

export function writeMarkdown (output: TiTokenOutput[]): void {
  const outputFilePath = path.resolve(__dirname, '../../dist/ENCODING.md')
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
