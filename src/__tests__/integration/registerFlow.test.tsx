import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from '@/components/LoginPage'

describe('Register flow', () => {
  it('login page has Regístrate button for registration', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )
    expect(screen.getByRole('button', { name: /regístrate/i })).toBeInTheDocument()
  })
})
