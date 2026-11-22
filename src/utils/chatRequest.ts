import { chatMessageSchema } from '../../api/chat-schema';
import { MAX_CHAT_MESSAGES, MAX_MESSAGE_CHARACTERS } from '../constants/chat';
import type { Message } from '../services/api';
import { pseudonymizeUserContent } from './pseudonymize';

export function getContentLimitError(content: string): string | null {
  if (content.length > MAX_MESSAGE_CHARACTERS || pseudonymizeUserContent(content).length > MAX_MESSAGE_CHARACTERS) {
    return `La consulta no puede superar los ${MAX_MESSAGE_CHARACTERS} caracteres. Divide el texto en varios mensajes.`;
  }
  return null;
}

export function isRequestMessageValid(message: Message): boolean {
  return !message.requestRejected && chatMessageSchema.safeParse({
    ...message,
    content: message.role === 'user' ? pseudonymizeUserContent(message.content) : message.content,
  }).success;
}

export function getRequestMessages(messages: Message[]): Message[] {
  const recent = messages.filter(isRequestMessageValid).slice(-MAX_CHAT_MESSAGES);
  const firstUser = recent.findIndex((message) => message.role === 'user');
  return firstUser === -1 ? [] : recent.slice(firstUser);
}
