export interface TiTokenInput {
    hex: string
    token: string
  }

export interface TiTokenOutput {
    hex: string
    name: string
    strict: string
    utf8: string | undefined
    composite: string | undefined
    length: number
    glyph: string | undefined
}

export interface TiSprite {
  width: number
  height: number
  x: number
  y: number
}
