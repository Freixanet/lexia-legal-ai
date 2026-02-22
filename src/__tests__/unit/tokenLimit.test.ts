import { describe, it, expect } from 'vitest'
import { truncateToTokenLimit, approximateTokenCount } from '@/utils/tokenLimit'

describe('approximateTokenCount', () => {
  it('returns 0 for empty or non-string', () => {
    expect(approximateTokenCount('')).toBe(0)
    expect(approximateTokenCount(null as unknown as string)).toBe(0)
  })

  it('estimates ~4 chars per token', () => {
    expect(approximateTokenCount('abcd')).toBe(1)
    expect(approximateTokenCount('abcdefgh')).toBe(2)
    expect(approximateTokenCount('a'.repeat(40))).toBe(10)
  })
})

describe('truncateToTokenLimit', () => {
  it('returns empty for empty or non-string', () => {
    expect(truncateToTokenLimit('', 100)).toBe('')
  })

  it('returns full text when under limit', () => {
    const text = 'hello world'
    expect(truncateToTokenLimit(text, 10)).toBe(text)
  })

  it('truncates and adds ellipsis when over limit', () => {
    const text = 'a'.repeat(100)
    const out = truncateToTokenLimit(text, 10)
    expect(out.length).toBeLessThanOrEqual(10 * 4 + 1)
    expect(out.endsWith('…')).toBe(true)
  })

  it('respects maxTokens', () => {
    const text = 'x'.repeat(100)
    const out = truncateToTokenLimit(text, 5)
    expect(out.length).toBe(5 * 4 + 1)
  })
})
