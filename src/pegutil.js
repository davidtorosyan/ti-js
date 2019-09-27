export function join (arr) {
  if (arr === null) return undefined
  return Array.isArray(arr) ? arr.join('') : arr
}

export function joinNonEmpty (arr) {
  const result = join(arr)
  return result === '' ? undefined : result
}
