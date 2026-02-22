/**
 * Aproximación de tokens: ~4 caracteres por token en español.
 * Trunca texto para no superar un límite aproximado de tokens.
 */
const CHARS_PER_TOKEN = 4

export function truncateToTokenLimit(text: string, maxTokens: number): string {
  if (!text || typeof text !== 'string') return ''
  const maxChars = maxTokens * CHARS_PER_TOKEN
  if (text.length <= maxChars) return text
  return text.slice(0, maxChars).trim() + '…'
}

export function approximateTokenCount(text: string): number {
  if (!text || typeof text !== 'string') return 0
  return Math.ceil(text.length / CHARS_PER_TOKEN)
}
