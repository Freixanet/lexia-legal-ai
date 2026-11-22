import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { get, set } from 'idb-keyval';
import { useChat } from '@/hooks/useChat';
import { MAX_MESSAGE_CHARACTERS } from '@/constants/chat';
import { STORAGE_KEY_CONVERSATIONS } from '@/constants/storage';
import { streamChat, type Conversation, type Message } from '@/services/api';

vi.mock('idb-keyval', () => ({ get: vi.fn(), set: vi.fn().mockResolvedValue(undefined) }));
vi.mock('@/services/api', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/services/api')>(),
  streamChat: vi.fn().mockResolvedValue(undefined),
  generateSmartTitle: vi.fn().mockResolvedValue('Consulta'),
}));

const history: Message[] = Array.from({ length: 104 }, (_, index) => ({
  id: `saved-${index}`, role: index % 2 === 0 ? 'user' : 'assistant',
  content: `Mensaje ${index}`, timestamp: index,
}));

async function loadChat(messages: Message[] = history) {
  const conversation: Conversation = { id: 'saved', title: 'Consulta', messages, createdAt: 0, updatedAt: 0 };
  vi.mocked(get).mockResolvedValue([conversation]);
  const hook = renderHook(() => useChat());
  await waitFor(() => expect(hook.result.current.isLoaded).toBe(true));
  act(() => hook.result.current.setActiveConversationId('saved'));
  return hook;
}

describe('useChat request limits', () => {
  beforeEach(() => vi.clearAllMocks());

  it('guards bypassed UI input without saving or sending the rejected content', async () => {
    const { result } = await loadChat();
    await act(async () => { await result.current.sendMessage('x'.repeat(MAX_MESSAGE_CHARACTERS + 1)); });
    expect(result.current.error).toContain('10000');
    expect(result.current.activeConversation?.messages).toEqual(history);
    expect(streamChat).not.toHaveBeenCalled();
  });

  it('rejects empty content without an attachment before changing history', async () => {
    const { result } = await loadChat();
    await act(async () => { await result.current.sendMessage(''); });
    expect(result.current.error).toContain('contenido válido');
    expect(result.current.activeConversation?.messages).toEqual(history);
    expect(streamChat).not.toHaveBeenCalled();
  });

  it('sends boundary-length content with a bounded window while saving the entire history', async () => {
    const { result } = await loadChat();
    const content = 'x'.repeat(MAX_MESSAGE_CHARACTERS);
    await act(async () => { await result.current.sendMessage(content); });
    const request = vi.mocked(streamChat).mock.calls[0][0];
    expect(request.length).toBeLessThanOrEqual(100);
    expect(request[0].role).toBe('user');
    expect(request[request.length - 1].content).toBe(content);
    expect(result.current.activeConversation?.messages).toHaveLength(105);
    expect(result.current.activeConversation?.messages.slice(0, 104)).toEqual(history);
    expect(set).toHaveBeenLastCalledWith(STORAGE_KEY_CONVERSATIONS, result.current.conversations);
  });

  it('keeps a 400-rejected turn saved but excludes it from the next request', async () => {
    const { result } = await loadChat();
    await act(async () => { await result.current.sendMessage('Consulta rechazada'); });
    act(() => vi.mocked(streamChat).mock.calls[0][1].onError('Solicitud no válida', 400));
    expect(result.current.isStreaming).toBe(false);
    expect(result.current.activeConversation?.messages[104]).toMatchObject({ content: 'Consulta rechazada', requestRejected: true });
    await act(async () => { await result.current.sendMessage('Nueva consulta'); });
    const request = vi.mocked(streamChat).mock.calls[1][0];
    expect(request.some((turn) => turn.content === 'Consulta rechazada')).toBe(false);
    expect(request[request.length - 1].content).toBe('Nueva consulta');
    expect(result.current.activeConversation?.messages).toHaveLength(106);
    expect(set).toHaveBeenLastCalledWith(STORAGE_KEY_CONVERSATIONS, result.current.conversations);
  });
});
