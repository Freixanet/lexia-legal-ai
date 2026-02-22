import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import ChatInterface from '@/components/ChatInterface'
import type { Conversation } from '@/services/api'

/**
 * File upload is part of ChatInterface (attach button + hidden input).
 * We test that the attach button is present and that file input exists.
 */
function makeConversation(): Conversation {
  return {
    id: 'c1',
    title: 'Test',
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

describe('FileUpload (via ChatInterface)', () => {
  it('renders attach button', () => {
    const draftConfig = { getDraft: () => '', saveDraft: vi.fn() }
    render(
      <BrowserRouter>
        <ChatInterface
          conversation={makeConversation()}
          isStreaming={false}
          error={null}
          onSendMessage={vi.fn()}
          onStopStreaming={() => {}}
          draftConfig={draftConfig}
        />
      </BrowserRouter>
    )
    expect(screen.getByRole('button', { name: /adjuntar/i })).toBeInTheDocument()
  })

  it('attach button has correct title', () => {
    const draftConfig = { getDraft: () => '', saveDraft: vi.fn() }
    render(
      <BrowserRouter>
        <ChatInterface
          conversation={makeConversation()}
          isStreaming={false}
          error={null}
          onSendMessage={vi.fn()}
          onStopStreaming={() => {}}
          draftConfig={draftConfig}
        />
      </BrowserRouter>
    )
    const btn = screen.getByRole('button', { name: /adjuntar/i })
    expect(btn.getAttribute('title')).toMatch(/PDF o imagen/i)
  })

  it('file input accepts documents', () => {
    const draftConfig = { getDraft: () => '', saveDraft: vi.fn() }
    render(
      <BrowserRouter>
        <ChatInterface
          conversation={makeConversation()}
          isStreaming={false}
          error={null}
          onSendMessage={vi.fn()}
          onStopStreaming={() => {}}
          draftConfig={draftConfig}
        />
      </BrowserRouter>
    )
    const input = document.querySelector('input[type="file"]')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('accept')
  })
})
