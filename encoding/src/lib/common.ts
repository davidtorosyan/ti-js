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
}
