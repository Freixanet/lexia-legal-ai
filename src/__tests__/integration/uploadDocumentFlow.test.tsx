import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ChatInterface from '@/components/ChatInterface'
import type { Conversation } from '@/services/api'

function makeConversation(): Conversation {
  return {
    id: 'up-1',
    title: 'Upload test',
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

describe('Upload document flow', () => {
  it('chat interface exposes attach button for documents', () => {
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
    const attach = screen.getByRole('button', { name: /adjuntar/i })
    expect(attach).toBeInTheDocument()
    attach.click()
    const fileInput = document.querySelector('input[type="file"]')
    expect(fileInput).toBeInTheDocument()
  })
})
