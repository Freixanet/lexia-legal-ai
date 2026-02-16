import { LEXIA_SYSTEM_PROMPT } from './prompts';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onComplete: (fullText: string) => void;
  onError: (error: string) => void;
}

// In development, calls localhost; in production, calls relative /api/chat
const API_URL = '/api/chat';

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

export function generateTitle(firstMessage: string): string {
  const cleaned = firstMessage.replace(/[¿?¡!]/g, '').trim();
  const words = cleaned.split(/\s+/).slice(0, 6).join(' ');
  return words.length > 50 ? words.substring(0, 50) + '…' : words;
}

export async function streamChat(
  messages: Message[],
  callbacks: StreamCallbacks,
  signal?: AbortSignal
): Promise<void> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        systemPrompt: LEXIA_SYSTEM_PROMPT,
      }),
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        (errorData as Record<string, string>)?.error ||
        `Error ${response.status}: ${response.statusText}`;
      callbacks.onError(errorMessage);
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      callbacks.onError('No se pudo establecer la conexión de streaming.');
      return;
    }

    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;

        const data = trimmed.slice(6);
        if (data === '[DONE]') {
          callbacks.onComplete(fullText);
          return;
        }

        try {
          const parsed = JSON.parse(data);
          const token = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
          if (token) {
            fullText += token;
            callbacks.onToken(token);
          }
        } catch {
          // Skip invalid JSON lines
        }
      }
    }

    callbacks.onComplete(fullText);
  } catch (err) {
    if ((err as Error).name === 'AbortError') return;
    callbacks.onError(`Error de conexión: ${(err as Error).message}`);
  }
}
