import { describe, it, expect } from 'vitest'
import { formatTime, formatDate } from '@/utils/formatDate'

describe('formatTime', () => {
  it('formats timestamp to short time (es-ES)', () => {
    const ts = new Date(2025, 0, 15, 14, 30).getTime()
    const result = formatTime(ts)
    expect(result).toMatch(/\d{1,2}:\d{2}/)
  })

  it('returns valid time for 0', () => {
    const result = formatTime(0)
    expect(result).toBeDefined()
    expect(result.length).toBeGreaterThan(0)
  })
})

describe('formatDate', () => {
  it('formats timestamp to local date (es-ES)', () => {
    const ts = new Date(2025, 0, 15).getTime()
    const result = formatDate(ts)
    expect(result).toContain('15')
    expect(result).toBeDefined()
  })
})
