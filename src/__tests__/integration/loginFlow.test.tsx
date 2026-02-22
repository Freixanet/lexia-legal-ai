import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from '@/components/LoginPage'

vi.mock('@/constants/auth', () => ({ isLoggedIn: vi.fn(() => false), setLoggedIn: vi.fn() }))

describe('Login flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders login page with main region', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )
    expect(screen.getByRole('main', { name: /iniciar sesión/i })).toBeInTheDocument()
  })

  it('has Inicia sesión and Regístrate buttons', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )
    expect(screen.getByRole('button', { name: /inicia sesión/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /regístrate/i })).toBeInTheDocument()
  })

  it('has social login options', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )
    expect(screen.getByRole('button', { name: /continuar con google/i })).toBeInTheDocument()
  })
})
