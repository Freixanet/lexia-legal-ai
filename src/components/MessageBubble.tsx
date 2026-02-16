import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Message } from '../services/api';
import './MessageBubble.css';

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isStreaming }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable
    }
  };

  const formattedTime = new Date(message.timestamp).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <article
      className={`message-bubble ${isUser ? 'message-user' : 'message-assistant'}`}
      aria-label={`${isUser ? 'Tu mensaje' : 'Respuesta de Lexia'} a las ${formattedTime}`}
    >
      {!isUser && (
        <div className="message-avatar" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
            <path d="M8 24V8h2.5v13.5H20V24H8Z" fill="currentColor"/>
            <circle cx="23" cy="10" r="2.5" fill="currentColor" opacity="0.6"/>
          </svg>
        </div>
      )}
      <div className="message-content-wrapper">
        {!isUser && (
          <span className="message-sender">Lexia</span>
        )}
        <div className={`message-body ${isUser ? '' : 'markdown-content'}`}>
          {isUser ? (
            <p>{message.content}</p>
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          )}
          {isStreaming && (
            <span className="typing-cursor" aria-hidden="true" />
          )}
        </div>
        <div className="message-meta">
          <time className="message-time" dateTime={new Date(message.timestamp).toISOString()}>
            {formattedTime}
          </time>
          {!isUser && !isStreaming && (
            <button
              className="message-copy-btn"
              onClick={handleCopy}
              aria-label={copied ? 'Copiado' : 'Copiar respuesta'}
              aria-live="polite"
            >
              {copied ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default MessageBubble;
