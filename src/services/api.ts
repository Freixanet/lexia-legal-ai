import { LEXIA_SYSTEM_PROMPT } from './prompts';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { pseudonymizeUserContent } from '../utils/pseudonymize';

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
        messages: [{ role: 'user', content: pseudonymizeUserContent(firstMessage) }]
      })
    });

    if (!response.ok) {
      try {
        const fallbackData = await response.json();
        if (fallbackData.title) return fallbackData.title;
      } catch (e) {
        // Ignore pars error on failure response
      }
      throw new Error(`Failed to generate title: HTTP ${response.status}`);
    }
    
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
          content: m.role === 'user' ? pseudonymizeUserContent(m.content) : m.content,
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
            callbacks.onComplete(fullText);
            throw new Error('STOP_STREAM');
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
        // if the server closes the connection natively, we want to complete
        callbacks.onComplete(fullText);
      },
      onerror(err) {
        if ((err as Error).message === 'STOP_STREAM') {
            return; // Expected explicit stop, do not retry and do not throw to UI
        }
        if (signal?.aborted) {
             throw err; 
        }

        // --- EXPONENTIAL BACKOFF WITH FULL JITTER ---
        const maxRetries = 4;
        const msg = (err as Error).message || '';
        
        // Determinar si el error es elegible para reintento (429 Too Many Requests, 500+ Server Errors, Network drops)
        const isRetriable = 
          msg.includes('429') || 
          msg.includes('502') || 
          msg.includes('503') || 
          msg.includes('504') || 
          msg.includes('Failed to fetch') || 
          msg.includes('NetworkError');

        if (isRetriable) {
            // Track retries within a closure variable maintained by fetchEventSource context
            // @ts-ignore (injecting ad-hoc property on error object since we don't control the runner state easily)
            err._retries = (err._retries || 0) + 1;
            
            // @ts-ignore
            if (err._retries <= maxRetries) {
                // @ts-ignore
                const attempt = err._retries;
                // Calculate base delay: 1000ms * 2^attempt (1s, 2s, 4s, 8s)
                const baseDelay = 1000 * Math.pow(2, attempt);
                // Introduce Full Jitter to avoid thunderous herd effect: random value between 0 and baseDelay
                const jitterDelay = Math.random() * baseDelay;
                
                console.warn(`[Lexia Network] Interrupción SSE detectada. Executando Backoff (Intento ${attempt}/${maxRetries}). Esperando ${Math.round(jitterDelay)}ms...`);
                
                // Return numerical value explicitly instructs @microsoft/fetch-event-source to wait N ms and retry!
                return jitterDelay; 
            }
        }
        
        // Rethrow to stop retries if exhausted or not retriable
        throw err;
      }
    });
  } catch (err) {
     if (signal?.aborted || (err as Error).message === 'STOP_STREAM') return;
     
     // Friendly message when backend proxy is not available (e.g. GitHub Pages)
     if ((err as Error).message?.includes('Failed to fetch') || (err as Error).message?.includes('NetworkError')) {
       callbacks.onError('El servicio de IA no está disponible en esta versión estática. Visita la versión completa en Vercel para usar el asistente legal.');
     } else {
       callbacks.onError(`Error de conexión: ${(err as Error).message}`);
     }
  }
}
