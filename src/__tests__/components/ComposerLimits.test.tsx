import { fireEvent, render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import ChatInterface from '@/components/ChatInterface';
import LandingPage from '@/components/LandingPage';
import { MAX_MESSAGE_CHARACTERS } from '@/constants/chat';

describe.each(['chat', 'landing'] as const)('%s composer limits', (surface) => {
  it('exposes the cap, shows Spanish feedback, and blocks oversized input before submitting', () => {
    const onSendMessage = vi.fn();
    render(<BrowserRouter>
      {surface === 'chat' ? <ChatInterface
        conversation={{ id: 'limits', title: 'Consulta', messages: [], createdAt: 0, updatedAt: 0 }}
        isStreaming={false} error={null} onSendMessage={onSendMessage} onStopStreaming={vi.fn()}
        draftConfig={{ getDraft: () => '', saveDraft: vi.fn() }}
      /> : <LandingPage onSendMessage={onSendMessage} />}
    </BrowserRouter>);
    const input = screen.getByPlaceholderText(surface === 'chat' ? /describe tu duda/i : /describe tu situación/i);
    expect(input).toHaveAttribute('maxlength', String(MAX_MESSAGE_CHARACTERS));
    fireEvent.change(input, { target: { value: 'x'.repeat(MAX_MESSAGE_CHARACTERS + 1) } });
    expect(screen.getByRole('status')).toHaveTextContent('10001 / 10000 caracteres');
    fireEvent.submit(input.closest('form')!);
    expect(onSendMessage).not.toHaveBeenCalled();
    const content = 'x'.repeat(MAX_MESSAGE_CHARACTERS);
    fireEvent.change(input, { target: { value: content } });
    expect(screen.getByRole('status')).toHaveTextContent('10000 / 10000 caracteres');
    fireEvent.submit(input.closest('form')!);
    expect(onSendMessage).toHaveBeenCalledWith(content, expect.any(Object));
  });

  it.each([
    'x'.repeat(MAX_MESSAGE_CHARACTERS - 14) + ' DNI: 1234',
    'DNI: 1234 '.repeat(700),
  ])('retains text and the chat draft when pseudonymization would exceed the limit (case %#)', (content) => {
    const onSendMessage = vi.fn();
    let draft = '';
    const saveDraft = vi.fn((_id: string, text: string) => { draft = text; });
    render(<BrowserRouter>
      {surface === 'chat' ? <ChatInterface
        conversation={{ id: 'limits', title: 'Consulta', messages: [], createdAt: 0, updatedAt: 0 }}
        isStreaming={false} error={null} onSendMessage={onSendMessage} onStopStreaming={vi.fn()}
        draftConfig={{ getDraft: () => draft, saveDraft }}
      /> : <LandingPage onSendMessage={onSendMessage} />}
    </BrowserRouter>);
    const input = screen.getByPlaceholderText(surface === 'chat' ? /describe tu duda/i : /describe tu situación/i);
    expect(content.length).toBeLessThan(MAX_MESSAGE_CHARACTERS);
    fireEvent.change(input, { target: { value: content } });
    fireEvent.submit(input.closest('form')!);
    expect(onSendMessage).not.toHaveBeenCalled();
    expect(input).toHaveValue(content);
    expect(screen.getByRole('status')).toHaveTextContent('La consulta no puede superar los 10000 caracteres');
    if (surface === 'chat') {
      expect(draft).toBe(content);
      expect(saveDraft).not.toHaveBeenCalledWith('limits', '');
    }

    fireEvent.change(input, { target: { value: 'Consulta corregida' } });
    fireEvent.submit(input.closest('form')!);
    expect(onSendMessage).toHaveBeenCalledWith('Consulta corregida', expect.any(Object));
    expect(input).toHaveValue('');
    if (surface === 'chat') expect(draft).toBe('');
  });
});
