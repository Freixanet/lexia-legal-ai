import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { generateSmartTitle, streamChat } from '@/services/api';
import { MAX_MESSAGE_CHARACTERS } from '@/constants/chat';

vi.mock('@microsoft/fetch-event-source', () => ({ fetchEventSource: vi.fn() }));

describe('chat HTTP errors', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('bounds title context including attachment descriptions to the same limit', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ title: 'Consulta' })));
    await expect(generateSmartTitle('x'.repeat(MAX_MESSAGE_CHARACTERS + 100))).resolves.toBe('Consulta');
    const body = JSON.parse(String(fetch.mock.calls[0][1]?.body));
    expect(body.messages[0].content).toHaveLength(MAX_MESSAGE_CHARACTERS);
  });

  it('passes HTTP 400 status to the hook so it can exclude a rejected turn', async () => {
    vi.mocked(fetchEventSource).mockImplementation(async (_url, options) => {
      try {
        await options?.onopen?.(new Response(JSON.stringify({ error: 'Invalid body' }), { status: 400 }));
      } catch (error) {
        options?.onerror?.(error);
      }
    });
    const onError = vi.fn();
    await streamChat([{ id: '1', role: 'user', content: 'Consulta', timestamp: 0 }], {
      onToken: vi.fn(), onComplete: vi.fn(), onError,
    });
    expect(onError).toHaveBeenCalledWith('Error de conexión: Invalid body', 400);
  });
});
