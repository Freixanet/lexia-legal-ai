import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageBubble from './MessageBubble';
import ErrorCard from './ErrorCard';
import type { Conversation, Attachment } from '../services/api';
import './ChatInterface.css';

interface ChatInterfaceProps {
  conversation: Conversation;
  isStreaming: boolean;
  streamingContent: string;
  error: string | null;
  onSendMessage: (message: string, options?: { attachment?: Attachment }) => void;
  onStopStreaming: () => void;
  draftConfig: {
    getDraft: (id: string) => string;
    saveDraft: (id: string, text: string) => void;
  }
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  conversation,
  isStreaming,
  streamingContent,
  error,
  onSendMessage,
  onStopStreaming,
  draftConfig,
}) => {
  const [input, setInput] = useState(() => draftConfig.getDraft(conversation.id));
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [pendingAttachment, setPendingAttachment] = useState<Attachment | null>(null);
  
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const container = chatMessagesRef.current;
    if (!container) return;

    // Check if user is scrolled to the bottom (within 100px tolerance)
    const isScrolledToBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
    
    // Only auto-scroll if user is already at the bottom OR we are not actively streaming (e.g. initial load)
    if (!isStreaming || isScrolledToBottom) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      messagesEndRef.current?.scrollIntoView({
        behavior: mediaQuery.matches ? 'auto' : 'smooth'
      });
    }
  }, [conversation.messages, streamingContent, isStreaming]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
    // Save draft when input changes
    draftConfig.saveDraft(conversation.id, input);
  }, [input, conversation.id, draftConfig]);

  // Load draft when conversation changes
  useEffect(() => {
    setInput(draftConfig.getDraft(conversation.id));
  }, [conversation.id, draftConfig]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Prevent files > 2.5MB for Vercel Edge 4MB payload limit
    if (file.size > 2.5 * 1024 * 1024) {
      alert("El documento es demasiado grande (máx 2.5MB para mantener el límite del servidor).");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setPendingAttachment({
        name: file.name,
        type: file.type,
        data: base64
      });
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if ((!trimmed && !pendingAttachment) || isStreaming) return;
    onSendMessage(trimmed, { attachment: pendingAttachment || undefined });
    setInput('');
    setPendingAttachment(null);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <motion.div 
      className="chat-interface"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Chat Header */}
      {/* Chat Header */}
      <header className="chat-header">
        <div className="chat-header-info">
          <h2 className="chat-header-title">{conversation.title}</h2>
        </div>

        <div className="chat-header-controls">
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
        ref={chatMessagesRef}
        className="chat-messages"
        role="log"
        aria-label="Historial de mensajes"
        aria-live="polite"
        aria-relevant="additions"
      >
        <div className="chat-messages-container">
          <AnimatePresence initial={false}>
            {conversation.messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <MessageBubble message={msg} />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Streaming message — renders tokens directly as they arrive from SSE */}
          {isStreaming && streamingContent && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <MessageBubble
                message={{
                  id: 'streaming',
                  role: 'assistant',
                  content: streamingContent,
                  timestamp: Date.now(),
                }}
                isStreaming={true}
              />
            </motion.div>
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
          <motion.div 
            className="chat-input-container" 
            layoutId="chat-input-container"
          >
            {pendingAttachment && (
               <div className="chat-attachment-pill">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                 </svg>
                 <span className="attachment-name">{pendingAttachment.name}</span>
                 <button 
                   type="button" 
                   className="attachment-remove" 
                   onClick={() => setPendingAttachment(null)}
                   aria-label="Quitar archivo"
                 >
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                 </button>
               </div>
            )}
            <label htmlFor="chat-message-input" className="visually-hidden">
              Tu consulta legal
            </label>
            <div className="chat-input-leading-actions">
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*,application/pdf"
                onChange={handleFileChange}
              />
              <button
                type="button"
                className="chat-attach-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={isStreaming}
                aria-label="Adjuntar documento"
                title="Adjuntar PDF o Imagen"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
              </button>
            </div>
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
                  disabled={!input.trim() && !pendingAttachment}
                  aria-label="Enviar mensaje"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              )}
            </div>
          </motion.div>
          <p className="chat-disclaimer" aria-label="Aviso legal">
            ⚖️ Lexia proporciona información orientativa. No constituye asesoramiento legal profesional.
          </p>
        </form>
      </div>
    </motion.div>
  );
};

export default ChatInterface;
