import React, { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import ErrorCard from './ErrorCard';
import type { Conversation } from '../services/api';
import './ChatInterface.css';

interface ChatInterfaceProps {
  conversation: Conversation;
  isStreaming: boolean;
  streamingContent: string;
  error: string | null;
  onSendMessage: (message: string) => void;
  onStopStreaming: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  conversation,
  isStreaming,
  streamingContent,
  error,
  onSendMessage,
  onStopStreaming,
}) => {
  const [input, setInput] = useState('');
  const [jurisdiction, setJurisdiction] = useState('es');
  const [sourcesEnabled, setSourcesEnabled] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    messagesEndRef.current?.scrollIntoView({
      behavior: mediaQuery.matches ? 'auto' : 'smooth'
    });
  }, [conversation.messages, streamingContent]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    onSendMessage(trimmed);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="chat-interface">
      {/* Chat Header */}
      {/* Chat Header */}
      <header className="chat-header">
        <div className="chat-header-info">
          <h2 className="chat-header-title">{conversation.title}</h2>
        </div>

        <div className="chat-header-controls">
          {/* Jurisdiction Selector */}
          <div className="header-control-group">
            <select 
              className="header-select" 
              aria-label="Seleccionar jurisdicción"
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
            >
              <option value="es">España</option>
              <option value="cat">Cataluña</option>
              <option value="mad">Madrid</option>
              <option value="eu">Unión Europea</option>
            </select>
          </div>

          {/* Sources Toggle */}
          <button 
            className={`header-toggle ${sourcesEnabled ? 'active' : ''}`}
            aria-pressed={sourcesEnabled}
            aria-label="Alternar fuentes verificadas"
            onClick={() => setSourcesEnabled(!sourcesEnabled)}
          >
            <span className="toggle-label">Fuentes</span>
            <div className="toggle-track">
              <div className="toggle-thumb" />
            </div>
          </button>

          {/* Status (Only shows on error/offline) */}
          {isOffline && (
            <div className="header-status-indicator offline">
               Offline
            </div>
          )}
        </div>
      </header>

      {/* Messages Area */}
      <div
        className="chat-messages"
        role="log"
        aria-label="Historial de mensajes"
        aria-live="polite"
        aria-relevant="additions"
      >
        <div className="chat-messages-container">
          {conversation.messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {/* Streaming message — renders tokens directly as they arrive from SSE */}
          {isStreaming && streamingContent && (
            <MessageBubble
              message={{
                id: 'streaming',
                role: 'assistant',
                content: streamingContent,
                timestamp: Date.now(),
              }}
              isStreaming={true}
            />
          )}

          {/* Loading indicator */}
          {isStreaming && !streamingContent && (
            <div className="chat-loading" role="status" aria-label="Procesando respuesta">
              <div className="chat-loading-avatar" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
                  <path d="M8 24V8h2.5v13.5H20V24H8Z" fill="currentColor"/>
                  <circle cx="23" cy="10" r="2.5" fill="currentColor" opacity="0.6"/>
                </svg>
              </div>
              <div className="chat-loading-dots" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <span className="visually-hidden">Lexia está escribiendo...</span>
            </div>
          )}

          {error && (
            <div className="chat-error-container">
              <ErrorCard message={error} />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="chat-input-area">
        <form className="chat-input-form" onSubmit={handleSubmit} aria-label="Enviar mensaje">
          <div className="chat-input-container">
            <label htmlFor="chat-message-input" className="visually-hidden">
              Tu consulta legal
            </label>
            <textarea
              id="chat-message-input"
              ref={textareaRef}
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe tu duda legal..."
              rows={1}
              disabled={isStreaming}
              aria-label="Escribe tu consulta legal"
            />
            <div className="chat-input-actions">
              {isStreaming ? (
                <button
                  id="chat-stop-btn"
                  type="button"
                  className="chat-stop-btn"
                  onClick={onStopStreaming}
                  aria-label="Detener respuesta"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                </button>
              ) : (
                <button
                  id="chat-send-btn"
                  type="submit"
                  className="chat-send-btn"
                  disabled={!input.trim()}
                  aria-label="Enviar mensaje"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          <p className="chat-disclaimer" aria-label="Aviso legal">
            ⚖️ Lexia proporciona información orientativa. No constituye asesoramiento legal profesional.
          </p>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
