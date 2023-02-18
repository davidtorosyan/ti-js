import { write } from '../util/file'
import { stringify } from 'csv-stringify/sync'
import { strictMapExtra } from '../util/hex'
import { chunkString } from '../util/text'
import type { TiTokenOutput, TiSprite } from './common'

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
  const divider = header.replace(/`[^`]+`/g, '-')
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

  let sprite = ''
  const spriteLookup = sprites.get(hex)
  if (spriteLookup !== undefined) {
    sprite = formatSprite(spriteLookup)
  } else {
    // throw new Error(`Missing sprite for hex: ${hex}`)
  }

  return {
    hex,
    name: output.name,
    strict: output.strict,
    utf8: output.utf8,
    composite,
    sprite,
  }
}

function prepareMarkdown (input: string): string {
  if (input.startsWith('<img')) {
    return input
  }
  if (input.includes('`')) {
    return '`` ' + input + ' ``'
  }
  return '`' + input.replace(/\|/, '\\|') + '`'
}

function formatSprite (sprite: TiSprite): string {
  const url = '../dist/draw.png'
  const style = [
    `width: ${sprite.width}px;`,
    `height: ${sprite.height}px;`,
    `background: url(${url}) -${sprite.x}px -${sprite.y}px;`,
  ].join('; ')
  return `<img width="1" height="1" style="${style}" src="">`
}
