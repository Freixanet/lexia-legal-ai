import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Message } from '../services/api';
import Citation from './ui/Citation';
import Icon from './ui/Icon';
import { LexiaLogo } from './ui/Icon';
import { parseSources, preprocessContent } from '../utils/citations';
import { extractAlerts } from '../utils/legalSections';
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

  const { sources, verificationStatus, processedContent, alerts } = useMemo(() => {
    if (isUser || isStreaming) {
      return {
        cleanContent: message.content,
        sources: [],
        verificationStatus: 'none',
        processedContent: message.content,
        alerts: [],
      };
    }

    const parsed = parseSources(message.content);
    const { alerts: extractedAlerts } = extractAlerts(parsed.cleanContent);
    const processed = preprocessContent(parsed.cleanContent);
    const status = parsed.sources.length > 0 ? 'verified' : 'unverified';

    return {
      cleanContent: parsed.cleanContent,
      sources: parsed.sources,
      verificationStatus: status,
      processedContent: processed,
      alerts: extractedAlerts,
    };
  }, [message.content, isUser, isStreaming]);

  const MarkdownComponents = {
    a: ({ href, children, ...props }: any) => {
      if (href?.startsWith('citation:')) {
        const id = href.split(':')[1];
        const source = sources.find(s => s.id === id);
        return <Citation id={id} source={source} />;
      }
      return <a href={href} {...props} target="_blank" rel="noopener noreferrer">{children}</a>;
    }
  };

  return (
    <article
      className={`message-bubble ${isUser ? 'message-user' : 'message-assistant'}`}
      aria-label={`${isUser ? 'Tu mensaje' : 'Respuesta de Lexia'} a las ${formattedTime}`}
    >
      {!isUser && (
        <div className="message-avatar" aria-hidden="true">
          <LexiaLogo size={18} />
        </div>
      )}
      <div className="message-content-wrapper">
        {!isUser && (
          <span className="message-sender">Lexia</span>
        )}
        <div className={`message-body ${isUser ? '' : 'markdown-content'}`}>
          {isUser ? (
            <>
              {message.attachments && message.attachments.length > 0 && (
                <div className="message-attachment-indicator">
                  <Icon name="document" size={14} />
                  <span>{message.attachments[0].name}</span>
                </div>
              )}
              {message.content && <p>{message.content}</p>}
            </>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={MarkdownComponents}
            >
              {processedContent}
            </ReactMarkdown>
          )}
          {isStreaming && (
            <span className="typing-cursor" aria-hidden="true" />
          )}

          {!isUser && !isStreaming && alerts.length > 0 && (
            <div className="legal-alerts">
              {alerts.map((alert, i) => (
                <div
                  key={i}
                  className={`legal-alert legal-alert-${alert.type}`}
                  role="alert"
                >
                  <div className="legal-alert-header">
                    <Icon
                      name="alert-triangle"
                      size={16}
                      strokeWidth={2.5}
                    />
                    <span className="legal-alert-label">
                      {alert.type === 'red' ? 'ALERTA ROJA — Plazo crítico' : 'ALERTA — Atención necesaria'}
                    </span>
                  </div>
                  <p className="legal-alert-content">{alert.content}</p>
                </div>
              ))}
            </div>
          )}

          {!isUser && !isStreaming && verificationStatus !== 'none' && (
            <div className="message-sources-summary">
              <div className={`sources-badge-inline ${verificationStatus}`}>
                {verificationStatus === 'verified' ? (
                  <>
                    <Icon name="check" size={12} strokeWidth={2.5} />
                    {sources.length} Fuentes Verificadas
                  </>
                ) : (
                  <>
                    <Icon name="alert-triangle" size={12} strokeWidth={2.5} />
                    Sin Verificación
                  </>
                )}
              </div>

              {sources.length > 0 && (
                <details className="sources-details-minimal">
                  <summary>Ver lista de fuentes</summary>
                  <ul className="sources-list-minimal">
                    {sources.map((s) => (
                      <li key={s.id}>
                        <span className="source-id">[{s.id}]</span>
                        {s.url ? (
                          <a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a>
                        ) : (
                          <span>{s.title}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
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
              {copied ? <Icon name="check" size={14} /> : <Icon name="copy" size={14} />}
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default React.memo(MessageBubble);
