import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Message } from '../../services/api';
import Citation from '../ui/Citation';
import { parseSources, preprocessContent } from '../../utils/citations';
import './MessageBubbleV1.css';

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

const MessageBubbleV1: React.FC<MessageBubbleProps> = ({ message, isStreaming }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(message.content); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };

  const formattedTime = new Date(message.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  const { sources, verificationStatus, processedContent } = useMemo(() => {
    if (isUser || isStreaming) return { cleanContent: message.content, sources: [], verificationStatus: 'none', processedContent: message.content };
    const parsed = parseSources(message.content);
    const processed = preprocessContent(parsed.cleanContent);
    const status = parsed.sources.length > 0 ? 'verified' : 'unverified';
    return { cleanContent: parsed.cleanContent, sources: parsed.sources, verificationStatus: status, processedContent: processed };
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
    <article className={`message-bubble ${isUser ? 'message-user' : 'message-assistant'}`} aria-label={`${isUser ? 'Tu mensaje' : 'Respuesta de Lexia'} a las ${formattedTime}`}>
      {!isUser && (
        <div className="message-avatar" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 32 32" fill="none"><path d="M8 24V8h2.5v13.5H20V24H8Z" fill="currentColor"/><circle cx="23" cy="10" r="2.5" fill="currentColor" opacity="0.6"/></svg>
        </div>
      )}
      <div className="message-content-wrapper">
        {!isUser && <span className="message-sender">Lexia</span>}
        <div className={`message-body ${isUser ? '' : 'markdown-content'}`}>
          {isUser ? (
            <>
              {message.attachments && message.attachments.length > 0 && (
                <div className="message-attachment-indicator" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: message.content ? '8px' : '0', fontSize: '0.9rem' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                  <span>{message.attachments[0].name}</span>
                </div>
              )}
              {message.content && <p>{message.content}</p>}
            </>
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>{processedContent}</ReactMarkdown>
          )}
          {isStreaming && <span className="typing-cursor" aria-hidden="true" />}
          {!isUser && !isStreaming && verificationStatus !== 'none' && (
            <div className="message-sources-summary">
              <div className={`sources-badge-inline ${verificationStatus}`}>
                {verificationStatus === 'verified' ? (
                  <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>{sources.length} Fuentes Verificadas</>
                ) : (
                  <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>Sin Verificación</>
                )}
              </div>
              {sources.length > 0 && (
                <details className="sources-details-minimal">
                  <summary>Ver lista de fuentes</summary>
                  <ul className="sources-list-minimal">
                    {sources.map((s) => (<li key={s.id}><span className="source-id">[{s.id}]</span>{s.url ? <a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a> : <span>{s.title}</span>}</li>))}
                  </ul>
                </details>
              )}
            </div>
          )}
        </div>
        <div className="message-meta">
          <time className="message-time" dateTime={new Date(message.timestamp).toISOString()}>{formattedTime}</time>
          {!isUser && !isStreaming && (
            <button className="message-copy-btn" onClick={handleCopy} aria-label={copied ? 'Copiado' : 'Copiar respuesta'} aria-live="polite">
              {copied ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
              )}
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default React.memo(MessageBubbleV1);
