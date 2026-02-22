import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import ChatInterface from '@/components/ChatInterface'
import type { Conversation } from '@/services/api'

function makeConversation(messages: Conversation['messages'] = []): Conversation {
  return {
    id: 'int-1',
    title: 'Integration',
    messages,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

describe('Send message flow', () => {
  it('user can type and submit a message', async () => {
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
    await user.type(input, '¿Cuál es el plazo para reclamar una indemnización?')
    await user.type(input, '{Enter}')
    expect(onSendMessage).toHaveBeenCalledWith(
      '¿Cuál es el plazo para reclamar una indemnización?',
      expect.objectContaining({})
    )
  })

  it('draft is saved when user types', async () => {
    const user = userEvent.setup()
    const saveDraft = vi.fn()
    const draftConfig = { getDraft: () => '', saveDraft }
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
    const input = screen.getByPlaceholderText(/describe tu duda/i)
    await user.type(input, 'Hola')
    expect(saveDraft).toHaveBeenCalled()
  })
})
