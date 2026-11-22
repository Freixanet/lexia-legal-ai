import { describe, expect, it } from 'vitest';
import { chatBodySchema } from '../../../api/chat-schema';
import { MAX_CHAT_MESSAGES, MAX_MESSAGE_CHARACTERS } from '@/constants/chat';
import type { Message } from '@/services/api';
import { getContentLimitError, getRequestMessages } from '@/utils/chatRequest';

const message = (index: number, overrides: Partial<Message> = {}): Message => ({
  id: String(index), role: index % 2 === 0 ? 'user' : 'assistant',
  content: `Mensaje ${index}`, timestamp: index, ...overrides,
});

describe('chat content limit', () => {
  it('accepts empty, short and exactly-at-limit content', () => {
    for (const content of ['', 'Consulta', 'x'.repeat(MAX_MESSAGE_CHARACTERS)]) {
      expect(getContentLimitError(content)).toBeNull();
    }
  });

  it('rejects content over the shared server limit', () => {
    const content = 'x'.repeat(MAX_MESSAGE_CHARACTERS + 1);
    expect(getContentLimitError(content)).toContain(String(MAX_MESSAGE_CHARACTERS));
    expect(chatBodySchema.safeParse({ messages: [message(0, { content })] }).success).toBe(false);
  });

  it('also guards expansion during pseudonymization', () => {
    expect(getContentLimitError('x'.repeat(MAX_MESSAGE_CHARACTERS - 14) + ' DNI: 1234')).not.toBeNull();
  });
});

describe('request-only history window', () => {
  it('returns an empty window for no messages or no user turns', () => {
    expect(getRequestMessages([])).toEqual([]);
    expect(getRequestMessages([message(1)])).toEqual([]);
  });

  it('keeps short histories and attachment-only turns', () => {
    const history = [message(0), message(1), message(2, {
      content: '', attachments: [{ name: 'file.pdf', type: 'application/pdf', data: 'cGRm' }],
    })];
    expect(getRequestMessages(history)).toEqual(history);
  });

  it.each([100, 101, 102, 205])('windows %i messages from the most recent user turn boundary', (length) => {
    const history = Array.from({ length: length - 1 }, (_, index) => message(index));
    const latest = message(length - 1, { role: 'user' });
    history.push(latest);
    const saved = history.map((turn) => ({ ...turn }));
    const result = getRequestMessages(history);
    const recent = history.slice(-MAX_CHAT_MESSAGES);
    expect(result).toEqual(recent.slice(recent.findIndex((turn) => turn.role === 'user')));
    expect(result.length).toBeLessThanOrEqual(MAX_CHAT_MESSAGES);
    expect(result[0].role).toBe('user');
    expect(result[result.length - 1]).toBe(latest);
    expect(history).toEqual(saved);
    expect(chatBodySchema.safeParse({ messages: result }).success).toBe(true);
  });

  it('omits invalid legacy and 400-rejected turns without changing saved history', () => {
    const history = [
      message(0, { content: 'x'.repeat(MAX_MESSAGE_CHARACTERS + 1) }),
      message(1, { content: '' }),
      message(2, { requestRejected: true }),
      message(3, { attachments: [{ name: 'empty.pdf', type: 'application/pdf', data: 'data:application/pdf;base64,' }] }),
      message(4),
    ];
    expect(getRequestMessages(history)).toEqual([history[4]]);
    expect(history).toHaveLength(5);
    expect(history[0].content).toHaveLength(MAX_MESSAGE_CHARACTERS + 1);
  });
});
