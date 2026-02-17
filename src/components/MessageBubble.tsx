import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Message } from '../services/api';
import './MessageBubble.css';

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

interface Source {
  title: string;
  url?: string;
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

  // Extract sources from content
  const { cleanContent, sources, verificationStatus } = useMemo(() => {
    if (isUser || isStreaming) {
      return { cleanContent: message.content, sources: [], verificationStatus: 'none' };
    }

    const sourcesRegex = /---SOURCES---([\s\S]*?)---END SOURCES---/;
    const match = message.content.match(sourcesRegex);

    if (!match) {
      // If we are finished streaming but no block found, it's unverified/no sources
      return { cleanContent: message.content, sources: [], verificationStatus: 'none' };
    }

    const sourcesBlock = match[1].trim();
    const cleanContent = message.content.replace(sourcesRegex, '').trim();

    if (sourcesBlock === 'None') {
      return { cleanContent, sources: [], verificationStatus: 'unverified' };
    }

    const parsedSources = sourcesBlock.split('\n')
      .map((line): Source | null => {
        const trimmed = line.trim();
        if (!trimmed.startsWith('-')) return null;
        
        // Parse "- [Title](Url)" or "- [Title]"
        const lineMatch = trimmed.match(/-\s*\[([^\]]+)\](?:\(([^)]+)\))?/);
        if (lineMatch) {
          return { 
            title: lineMatch[1], 
            url: lineMatch[2] || undefined 
          };
        }
        return null;
      })
      .filter((s): s is Source => s !== null);

    return { 
      cleanContent, 
      sources: parsedSources, 
      verificationStatus: parsedSources.length > 0 ? 'verified' : 'unverified' 
    };
  }, [message.content, isUser, isStreaming]);

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
              {cleanContent}
            </ReactMarkdown>
          )}
          {isStreaming && (
            <span className="typing-cursor" aria-hidden="true" />
          )}

          {/* Sources Block - Only for assistant, when not streaming */}
          {!isUser && !isStreaming && verificationStatus !== 'none' && (
            <div className="message-sources">
              <details className="sources-details">
                <summary className={`sources-summary ${verificationStatus === 'verified' ? 'verified' : 'unverified'}`}>
                  <div className="sources-badge">
                    {verificationStatus === 'verified' ? (
                      <>
                        <svg className="sources-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Fuentes Verificadas
                      </>
                    ) : (
                      <>
                        <svg className="sources-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                           <line x1="12" y1="8" x2="12" y2="12" />
                           <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        Sin Verificación
                      </>
                    )}
                  </div>
                  <svg className="sources-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </summary>
                <div className="sources-content">
                  {sources.length > 0 ? (
                    <ul className="sources-list" role="list">
                      {sources.map((s, i) => (
                        <li key={i}>
                          <a 
                            href={s.url || '#'} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={s.url ? 'source-link' : 'source-text'}
                            onClick={(e) => !s.url && e.preventDefault()}
                          >
                            {s.title}
                            {s.url && (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                <polyline points="15 3 21 3 21 9" />
                                <line x1="10" y1="14" x2="21" y2="3" />
                              </svg>
                            )}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="sources-empty">
                      Esta respuesta está basada en el entrenamiento general del modelo y no cita fuentes legislativas específicas externas.
                    </p>
                  )}
                </div>
              </details>
            </div>
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
