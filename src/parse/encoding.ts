import encodingJson from '../gen/encoding.json'
import { Trie } from './trie'

const TOKEN_START = '&{'
const TOKEN_END = '}'

export const strictTokens = new Set(encodingJson.map(record => record.strict))

export const trie = buildTrie(
  encodingJson
    .filter(record => isEscaped(record.strict))
    .map(record => unescape(record.strict))
    .filter(strict => strict.length > 1),
)

function buildTrie (records: string[]): Trie {
  const trie = new Trie()
  for (const record of records) {
    trie.add(record)
  }
  return trie
}

export function toStrict (line: string): string {
  let result = ''

  // Track when we're inside an escaped token (e.g., &{If})
  let tokenStart: number | undefined

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === undefined) continue

    if (tokenStart !== undefined) {
      // We're inside an escaped token - accumulate characters until we find the closing }
      result += char
      if (char === TOKEN_END) {
        // Found the end of the escaped token - validate it's a known token
        const token = line.substring(tokenStart, i + 1)
        if (!strictTokens.has(token)) {
          throw new Error(`Unknown strict token found: ${token}`)
        }
        tokenStart = undefined // Exit escaped token mode
      }
    } else if (char === TOKEN_START[0]) {
      // Found start of an escaped token (&) - enter escaped token mode
      tokenStart = i
      result += char
    } else {
      // Normal character processing - try to find multi-character tokens first
      const longest = trie.search(line.substring(i))
      if (longest !== undefined) {
        // Found a multi-character token (like "If", "Then") - escape it
        result += escape(longest)
        i += longest.length - 1 // Skip ahead past the token
      } else if (strictTokens.has(char)) {
        // Single character that's already a valid strict token
        result += char
      } else {
        // Unknown character
        throw new Error(`Unknown character found: ${char}`)
      }
    }
  }

  // Ensure all escaped tokens were properly closed
  if (tokenStart) {
    throw new Error(`Unterminated token escape starting on index: ${tokenStart}`)
  }

  return result
}

export function tok (token: string): string {
  if (strictTokens.has(token)) {
    return token
  }

  const escaped = escape(token)
  if (strictTokens.has(escaped)) {
    return escaped
  }

  throw new Error(`Token not recognized in strict mode!: ${token}`)
}

function escape (token: string): string {
  if (token.includes(TOKEN_END)) {
    throw new Error(`Cannot escape token!: ${token}`)
  }

  return TOKEN_START + token + TOKEN_END
}

function isEscaped (token: string): boolean {
  return token.startsWith(TOKEN_START) && token.endsWith(TOKEN_END)
}

function unescape (token: string): string {
  if (isEscaped(token)) {
    return token.substring(TOKEN_START.length, token.length - TOKEN_END.length)
  }
  return token
}
