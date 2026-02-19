import { LEXIA_SYSTEM_PROMPT } from './prompts';
import { fetchEventSource } from '@microsoft/fetch-event-source';

export interface Attachment {
  name: string;
  type: string; // MIME type
  data: string; // Base64 chunk
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  attachments?: Attachment[];
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

export async function generateSmartTitle(firstMessage: string): Promise<string> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task: 'title',
        messages: [{ role: 'user', content: firstMessage }]
      })
    });

    if (!response.ok) throw new Error('Failed to generate title');
    
    const data = await response.json();
    return data.title || generateTitle(firstMessage);
  } catch (error) {
    console.error('Smart title generation failed:', error);
    return generateTitle(firstMessage);
  }
}

export async function streamChat(
  messages: Message[],
  callbacks: StreamCallbacks,
  options?: { jurisdiction: string; sourcesEnabled: boolean },
  signal?: AbortSignal
): Promise<void> {
  let fullText = '';

  try {
    await fetchEventSource(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
          attachments: m.attachments,
        })),
        systemPrompt: LEXIA_SYSTEM_PROMPT,
        jurisdiction: options?.jurisdiction,
        sourcesEnabled: options?.sourcesEnabled,
      }),
      signal,
      async onopen(response) {
        if (response.ok) {
          return; // everything is good
        } else if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          // client-side errors are usually non-retriable
           const errorData = await response.json().catch(() => ({}));
           const errorMessage = (errorData as Record<string, string>)?.error || `Error ${response.status}: ${response.statusText}`;
           throw new Error(errorMessage);
        } else {
           throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
      },
      onmessage(msg) {
        // if the server emits an error message, throw an exception
        // so it gets handled by the onerror callback
        if (msg.event === 'FatalError') {
          throw new Error(msg.data);
        }
        
        if (msg.data === '[DONE]') {
            return;
        }

        try {
          const parsed = JSON.parse(msg.data);
          const token = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
          if (token) {
            fullText += token;
            callbacks.onToken(token);
          }
        } catch (e) {
          // ignore invalid json from stream
        }
      },
      onclose() {
        // if the server closes the connection, we want to complete
        callbacks.onComplete(fullText);
      },
      onerror(err) {
        if (signal?.aborted) {
            // User aborted, do nothing (or rethrow if library requires)
             throw err; 
        }
        // Rethrow to stop retries if desired, or handle retry logic
        throw err;
      }
    });
  } catch (err) {
     if (signal?.aborted) return;
     
     // Friendly message when backend proxy is not available (e.g. GitHub Pages)
     if ((err as Error).message?.includes('Failed to fetch') || (err as Error).message?.includes('NetworkError')) {
       callbacks.onError('El servicio de IA no está disponible en esta versión estática. Visita la versión completa en Vercel para usar el asistente legal.');
     } else {
       callbacks.onError(`Error de conexión: ${(err as Error).message}`);
     }
  }
}
