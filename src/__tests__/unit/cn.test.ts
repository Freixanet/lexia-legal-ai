import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils/cn'

describe('cn', () => {
  it('returns empty string for no args', () => {
    expect(cn()).toBe('')
  })

  it('merges single class', () => {
    expect(cn('foo')).toBe('foo')
  })

  it('merges multiple classes', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('filters falsy values', () => {
    expect(cn('foo', false, 'bar', null, undefined)).toBe('foo bar')
  })

  it('tailwind-merge: later class overrides conflicting', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('handles conditional object', () => {
    expect(cn({ 'bg-red-500': true, 'bg-blue-500': false })).toBe('bg-red-500')
  })

  it('handles array of classes', () => {
    expect(cn(['a', 'b'], 'c')).toBe('a b c')
  })
})
