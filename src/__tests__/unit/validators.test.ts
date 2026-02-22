import { describe, it, expect } from 'vitest'
import {
  chatMessageSchema,
  conversationTitleSchema,
  emailSchema,
  userNameSchema,
} from '@/lib/validators/schemas'

describe('chatMessageSchema', () => {
  it('accepts non-empty content under max length', () => {
    const result = chatMessageSchema.safeParse({ content: 'Hola' })
    expect(result.success).toBe(true)
  })

  it('rejects empty content', () => {
    const result = chatMessageSchema.safeParse({ content: '' })
    expect(result.success).toBe(false)
  })

  it('rejects content over 50000 chars', () => {
    const result = chatMessageSchema.safeParse({ content: 'x'.repeat(50001) })
    expect(result.success).toBe(false)
  })
})

describe('conversationTitleSchema', () => {
  it('accepts valid title', () => {
    expect(conversationTitleSchema.safeParse('Subida de alquiler').success).toBe(true)
  })

  it('rejects empty', () => {
    expect(conversationTitleSchema.safeParse('').success).toBe(false)
  })

  it('rejects over 200 chars', () => {
    expect(conversationTitleSchema.safeParse('a'.repeat(201)).success).toBe(false)
  })
})

describe('emailSchema', () => {
  it('accepts valid email', () => {
    expect(emailSchema.safeParse('user@example.com').success).toBe(true)
  })

  it('rejects invalid email', () => {
    expect(emailSchema.safeParse('notanemail').success).toBe(false)
    expect(emailSchema.safeParse('@example.com').success).toBe(false)
  })
})

describe('userNameSchema', () => {
  it('accepts optional undefined', () => {
    expect(userNameSchema.safeParse(undefined).success).toBe(true)
  })

  it('accepts 2-50 chars', () => {
    expect(userNameSchema.safeParse('Ab').success).toBe(true)
    expect(userNameSchema.safeParse('a'.repeat(50)).success).toBe(true)
  })

  it('rejects too short', () => {
    expect(userNameSchema.safeParse('A').success).toBe(false)
  })

  it('rejects too long', () => {
    expect(userNameSchema.safeParse('a'.repeat(51)).success).toBe(false)
  })
})
