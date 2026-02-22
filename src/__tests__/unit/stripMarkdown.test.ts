import { describe, it, expect } from 'vitest'
import { stripMarkdown } from '@/utils/stripMarkdown'

describe('stripMarkdown', () => {
  it('returns empty string for empty or non-string', () => {
    expect(stripMarkdown('')).toBe('')
    expect(stripMarkdown(null as unknown as string)).toBe('')
  })

  it('strips bold', () => {
    expect(stripMarkdown('**bold**')).toBe('bold')
    expect(stripMarkdown('*italic*')).toBe('italic')
  })

  it('strips links, keeps text', () => {
    expect(stripMarkdown('[click](https://x.com)')).toBe('click')
  })

  it('strips headings', () => {
    expect(stripMarkdown('## Title')).toBe('Title')
    expect(stripMarkdown('# Big')).toBe('Big')
  })

  it('strips inline code backticks', () => {
    expect(stripMarkdown('use `code` here')).toBe('use code here')
  })

  it('strips code blocks', () => {
    expect(stripMarkdown('```\nconst x = 1\n```')).toBe('')
  })

  it('strips list bullets', () => {
    expect(stripMarkdown('- item one\n- item two')).toContain('item one')
    expect(stripMarkdown('- item one')).not.toMatch(/^-\s/)
  })

  it('strips blockquote', () => {
    expect(stripMarkdown('> quote')).toContain('quote')
    expect(stripMarkdown('> quote')).not.toMatch(/^>\s/)
  })

  it('normalizes multiple newlines', () => {
    expect(stripMarkdown('a\n\n\n\nb')).toBe('a\n\nb')
  })
})
