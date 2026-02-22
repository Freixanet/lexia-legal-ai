import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MessageBubble from '@/components/MessageBubble'
import type { Message } from '@/services/api'

function makeMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: '1',
    role: 'assistant',
    content: 'Hello',
    timestamp: Date.now(),
    ...overrides,
  }
}

describe('MessageBubble', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } })
  })

  it('renders user message content', () => {
    const msg = makeMessage({ role: 'user', content: 'My question' })
    render(<MessageBubble message={msg} />)
    expect(screen.getByText('My question')).toBeInTheDocument()
  })

  it('renders assistant message content', () => {
    const msg = makeMessage({ role: 'assistant', content: 'Here is the answer.' })
    render(<MessageBubble message={msg} />)
    expect(screen.getByText('Here is the answer.')).toBeInTheDocument()
  })

  it('renders markdown in assistant messages', () => {
    const msg = makeMessage({ content: '**Bold** and *italic*' })
    render(<MessageBubble message={msg} />)
    expect(screen.getByText('Bold')).toBeInTheDocument()
    expect(screen.getByText('italic')).toBeInTheDocument()
  })

  it('shows copy button for assistant messages when not streaming', () => {
    const msg = makeMessage({ role: 'assistant', content: 'Answer' })
    render(<MessageBubble message={msg} />)
    expect(screen.getByRole('button', { name: /copiar/i })).toBeInTheDocument()
  })

  it('does not show copy button for user messages', () => {
    const msg = makeMessage({ role: 'user', content: 'Question' })
    render(<MessageBubble message={msg} />)
    expect(screen.queryByRole('button', { name: /copiar/i })).not.toBeInTheDocument()
  })

  it('calls onCopyConfirm when copy is clicked', async () => {
    const user = userEvent.setup()
    const onCopyConfirm = vi.fn()
    const msg = makeMessage({ role: 'assistant', content: 'Copy this' })
    render(<MessageBubble message={msg} onCopyConfirm={onCopyConfirm} />)
    await user.click(screen.getByRole('button', { name: /copiar/i }))
    expect(onCopyConfirm).toHaveBeenCalledWith('Copiado ✓')
  })

  it('renders time in es-ES format', () => {
    const msg = makeMessage({ timestamp: new Date(2025, 0, 15, 14, 30).getTime() })
    render(<MessageBubble message={msg} />)
    expect(screen.getByText(/14:30/)).toBeInTheDocument()
  })
})
