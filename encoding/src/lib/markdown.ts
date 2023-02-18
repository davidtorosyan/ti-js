import { write } from '../util/file'
import { stringify } from 'csv-stringify/sync'
import { strictMapExtra } from '../util/hex'
import { chunkString } from '../util/text'
import type { TiTokenOutput, TiSprite } from './common'
import type { CastingContext } from 'csv-stringify/sync'

export interface MarkdownOutput {
    hex: string
    name: string
    strict: string
    utf8: string | undefined
    composite: string | undefined
    sprite: string
}

export function writeMarkdown (output: TiTokenOutput[], sprites: Map<string, TiSprite>): void {
  const markdownOutputs = transformOutputs(output, sprites)
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
  const divider = header.replace(/\s\S+\s/g, ' - ')
  const markdown = header + '\n' + divider + '\n' + result.substring(index + 1)

  write('ENCODING.md', markdown)
}

function transformOutputs (outputs: TiTokenOutput[], sprites: Map<string, TiSprite>): MarkdownOutput[] {
  const strictMap = new Map(outputs.map(output => [output.hex, output.strict]))

  strictMapExtra.forEach((value, key) => strictMap.set(key, value))

  return outputs.map(output => transformOutput(output, strictMap, sprites))
}

function transformOutput (
  output: TiTokenOutput,
  strictMap: Map<string, string>,
  sprites: Map<string, TiSprite>,
): MarkdownOutput {
  const hex = output.hex

  let composite
  if (output.composite) {
    const chunked = chunkString(output.composite, hex.length)
    composite = chunked.map(glyphHex => {
      const mapped = strictMap.get(glyphHex)
      if (mapped === undefined) {
        throw new Error(`Missing strict map for ${glyphHex} while trying to composite ${hex}`)
      }
      return mapped
    }).join('')
  }

  const spriteInfo = sprites.get(hex)
  if (spriteInfo === undefined) {
    throw new Error(`Missing sprite info for hex: ${hex}`)
  }
  const sprite = formatSprite(hex, spriteInfo)

  return {
    hex,
    name: output.name,
    strict: output.strict,
    utf8: output.utf8,
    composite,
    sprite,
  }
}

function prepareMarkdown (input: string, context: CastingContext): string {
  if (context.header) {
    return input
  }
  if (context.column === 'sprite') {
    return input
  }
  if (input.includes('`')) {
    return '`` ' + input + ' ``'
  }
  return '`' + input.replace(/\|/, '\\|') + '`'
}

function formatSprite (hex: string, sprite: TiSprite): string {
  const url = `./sprites/token_${hex}.png`
  return `<img src="${url}" alt="${hex}" width="${sprite.width}px" height="${sprite.height}px">`
}
