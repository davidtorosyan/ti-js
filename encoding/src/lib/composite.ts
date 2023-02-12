import type { TiTokenInput } from './common'

export function createComposites (input: readonly TiTokenInput[]): Map<TiTokenInput, string> {
  const result = new Map<TiTokenInput, string>()

  const tokenMap = new Map(input.map(record => [record.token, record.hex]))

  for (const record of input) {
    const composite = createComposite(record.hex, record.token, tokenMap)
    if (composite) {
      result.set(record, composite)
    }
  }

  return result
}

function createComposite (_hex: string, token: string, tokenMap: Map<string, string>): string | undefined {
  if (token.length === 1) {
    return undefined
  }

  let result = ''
  for (const char of token) {
    result += tokenMap.get(char)
  }

  return result
}
