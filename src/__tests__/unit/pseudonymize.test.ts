import { describe, it, expect } from 'vitest'
import { pseudonymizeUserContent } from '@/utils/pseudonymize'

describe('pseudonymizeUserContent', () => {
  it('returns empty string as-is', () => {
    expect(pseudonymizeUserContent('')).toBe('')
  })

  it('returns non-string input as-is', () => {
    expect(pseudonymizeUserContent(null as unknown as string)).toBe(null)
  })

  it('replaces "me llamo X" with [Usuario]', () => {
    expect(pseudonymizeUserContent('Hola, me llamo Juan Pérez.')).toBe('Hola, me llamo [Usuario].')
  })

  it('replaces "mi nombre es X" with [Usuario]', () => {
    expect(pseudonymizeUserContent('Mi nombre es María García.')).toContain('[Usuario]')
  })

  it('replaces email in "mi correo es X" with [correo]', () => {
    expect(pseudonymizeUserContent('Mi correo es foo@example.com')).toContain('[correo]')
    expect(pseudonymizeUserContent('Mi correo es foo@example.com')).not.toContain('foo@example.com')
  })

  it('replaces DNI/NIF with [documento]', () => {
    expect(pseudonymizeUserContent('Mi NIF es 12345678A')).toContain('[documento]')
    expect(pseudonymizeUserContent('DNI: 12345678-A')).toContain('[documento]')
  })

  it('leaves text without PII unchanged', () => {
    const text = '¿Cuál es el plazo para reclamar?'
    expect(pseudonymizeUserContent(text)).toBe(text)
  })
})
