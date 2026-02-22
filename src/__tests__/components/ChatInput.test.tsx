import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import ChatInterface from '@/components/ChatInterface'
import type { Conversation } from '@/services/api'

/**
 * ChatInput is embedded in ChatInterface. We test submit and focus behavior
 * by rendering ChatInterface with a minimal conversation and mocked onSendMessage.
 */
function makeConversation(overrides: Partial<Conversation> = {}): Conversation {
  return {
    id: 'conv-1',
    title: 'Test',
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  }
}

describe('ChatInput (via ChatInterface)', () => {
  it('renders input with placeholder', () => {
    const onSendMessage = vi.fn()
    const draftConfig = { getDraft: () => '', saveDraft: vi.fn() }
    render(
      <BrowserRouter>
        <ChatInterface
          conversation={makeConversation()}
          isStreaming={false}
          error={null}
          onSendMessage={onSendMessage}
          onStopStreaming={() => {}}
          draftConfig={draftConfig}
        />
      </BrowserRouter>
    )
    const input = screen.getByPlaceholderText(/describe tu duda/i)
    expect(input).toBeInTheDocument()
    expect(input.getAttribute('aria-label')).toMatch(/consulta legal/i)
  })

  it('sends message on submit', async () => {
    const user = userEvent.setup()
    const onSendMessage = vi.fn()
    const draftConfig = { getDraft: () => '', saveDraft: vi.fn() }
    render(
      <BrowserRouter>
        <ChatInterface
          conversation={makeConversation()}
          isStreaming={false}
          error={null}
          onSendMessage={onSendMessage}
          onStopStreaming={() => {}}
          draftConfig={draftConfig}
        />
      </BrowserRouter>
    )
    const input = screen.getByPlaceholderText(/describe tu duda/i)
    await user.type(input, '¿Plazo de reclamación?')
    const form = input.closest('form')
    expect(form).toBeTruthy()
    await user.type(input, '{Enter}')
    expect(onSendMessage).toHaveBeenCalledWith('¿Plazo de reclamación?', expect.any(Object))
  })

  it('does not send when input is empty', async () => {
    const user = userEvent.setup()
    const onSendMessage = vi.fn()
    const draftConfig = { getDraft: () => '', saveDraft: vi.fn() }
    render(
      <BrowserRouter>
        <ChatInterface
          conversation={makeConversation()}
          isStreaming={false}
          error={null}
          onSendMessage={onSendMessage}
          onStopStreaming={() => {}}
          draftConfig={draftConfig}
        />
      </BrowserRouter>
    )
    const input = screen.getByPlaceholderText(/describe tu duda/i)
    await user.type(input, '{Enter}')
    expect(onSendMessage).not.toHaveBeenCalled()
  })
})
