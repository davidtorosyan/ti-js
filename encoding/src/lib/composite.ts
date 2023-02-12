import type { TiTokenInput } from './common'

export function createComposites (input: readonly TiTokenInput[]): Map<TiTokenInput, string> {
  const result = new Map<TiTokenInput, string>()

  for (const record of input) {
    const composite = createComposite(record.hex, record.token)
    result.set(record, composite)
  }

  return result
}

function createComposite (hex: string, _token: string): string {
  return hex
}
