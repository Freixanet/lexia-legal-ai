import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageBubble from './MessageBubble';
import ErrorCard from './ErrorCard';
import Icon from './ui/Icon';
import { LexiaLogo } from './ui/Icon';
import type { Conversation, Attachment } from '../services/api';
import './ChatInterface.css';
import Worker from '../workers/fileProcessor?worker';
import { streamStore } from '../store/streamStore';

interface ChatInterfaceProps {
  conversation: Conversation;
  isStreaming: boolean;
  error: string | null;
  onSendMessage: (message: string, options?: { attachment?: Attachment }) => void;
  onStopStreaming: () => void;
  draftConfig: {
    getDraft: (id: string) => string;
    saveDraft: (id: string, text: string) => void;
  }
}

const StreamingBubble: React.FC = () => {
  const [content, setContent] = useState(streamStore.getContent());

  useEffect(() => {
    const unsubscribe = streamStore.subscribe(setContent);
    return () => { unsubscribe(); };
  }, []);

  if (!content) {
    return (
      <div className="chat-loading" role="status" aria-label="Procesando respuesta">
        <div className="chat-loading-avatar" aria-hidden="true">
          <LexiaLogo size={16} />
        </div>
        <div className="chat-loading-dots" aria-hidden="true">
          <span /><span /><span />
        </div>
        <span className="visually-hidden">Lexia está escribiendo...</span>
      </div>
    );
  }

  return (
    <MessageBubble
      message={{
        id: 'streaming',
        role: 'assistant',
        content,
        timestamp: Date.now(),
      }}
      isStreaming={true}
    />
  );
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  conversation,
  isStreaming,
  error,
  onSendMessage,
  onStopStreaming,
  draftConfig,
}) => {
  const [input, setInput] = useState(() => draftConfig.getDraft(conversation.id));
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [pendingAttachment, setPendingAttachment] = useState<Attachment | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [showScrollFab, setShowScrollFab] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

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
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
    draftConfig.saveDraft(conversation.id, input);
  }, [input, conversation.id, draftConfig]);

  useEffect(() => {
    setInput(draftConfig.getDraft(conversation.id));
  }, [conversation.id, draftConfig]);

  const handleScroll = useCallback(() => {
    if (!messagesRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    setShowScrollFab(distanceFromBottom > 200);
  }, []);

  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const scrollToBottom = () => {
    if (!messagesRef.current) return;
    messagesRef.current.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: 'smooth'
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && file.size > 2.5 * 1024 * 1024) {
      alert("El documento PDF es demasiado grande (máx 2.5MB).");
      return;
    }

    setIsProcessingFile(true);

    const worker = new Worker();

    worker.onmessage = (event) => {
      if (event.data.success) {
        let base64Data = event.data.base64;

        if (event.data.isBuffer && event.data.buffer) {
          const blob = new Blob([event.data.buffer], { type: event.data.type });
          const reader = new FileReader();
          reader.onloadend = () => {
            setPendingAttachment({
              name: file.name,
              type: event.data.type,
              data: reader.result as string
            });
            setIsProcessingFile(false);
            worker.terminate();
          };
          reader.readAsDataURL(blob);
          return;
        } else {
          setPendingAttachment({
            name: file.name,
            type: event.data.type,
            data: base64Data
          });
        }
      } else {
        alert("Error al procesar el archivo: " + event.data.error);
      }
      setIsProcessingFile(false);
      worker.terminate();
    };

    worker.onerror = () => {
      alert("Error en proceso de archivo.");
      setIsProcessingFile(false);
      worker.terminate();
    };

    worker.postMessage({ file });

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

  const isEmpty = conversation.messages.length === 0 && !isStreaming;

  return (
    <motion.div
      className="chat-interface"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      aria-busy={isStreaming}
    >
      {/* Chat Header */}
      <header className="chat-header">
        <div className="chat-header-info">
          <h2 className="chat-header-title">{conversation.title}</h2>
        </div>
        <div className="chat-header-controls">
          {isOffline && (
            <div className="header-status-indicator offline" role="alert">
              Offline
            </div>
          )}
        </div>
      </header>

      {/* Messages Area */}
      <div
        className="chat-messages"
        ref={messagesRef}
        role="log"
        aria-label="Historial de mensajes"
        aria-live="polite"
        aria-relevant="additions"
      >
        <div className="chat-messages-container">
          {isEmpty && (
            <motion.div
              className="chat-empty-state"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="chat-empty-icon">
                <LexiaLogo size={28} />
              </div>
              <p className="chat-empty-text">
                Describe tu situación legal y Lexia la analizará con legislación vigente.
              </p>
            </motion.div>
          )}

          <AnimatePresence initial={false}>
            {conversation.messages.map((msg, idx) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx > conversation.messages.length - 3 ? 0.05 : 0 }}
              >
                <MessageBubble message={msg} />
              </motion.div>
            ))}
          </AnimatePresence>

          {isStreaming && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <StreamingBubble />
            </motion.div>
          )}

          {error && (
            <div className="chat-error-container" role="alert">
              <ErrorCard message={error} />
            </div>
          )}

          <div className="scroll-anchor" />
        </div>
      </div>

      {/* Scroll to Bottom FAB */}
      <AnimatePresence>
        {showScrollFab && (
          <motion.button
            className="chat-scroll-fab"
            onClick={scrollToBottom}
            aria-label="Ir al final"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <Icon name="arrow-down" size={18} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="chat-input-area">
        <div className="chat-input-fade" aria-hidden="true" />
        <form className="chat-input-form" onSubmit={handleSubmit} aria-label="Enviar mensaje">
          <motion.div
            className="chat-input-container"
            layoutId="chat-input-container"
          >
            {pendingAttachment && (
              <div className="chat-attachment-pill">
                <Icon name="document" size={14} />
                <span className="attachment-name">{pendingAttachment.name}</span>
                <button
                  type="button"
                  className="attachment-remove"
                  onClick={() => setPendingAttachment(null)}
                  aria-label="Quitar archivo"
                >
                  <Icon name="close" size={14} />
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
                className={`chat-attach-btn ${isProcessingFile ? 'processing' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                disabled={isStreaming || isProcessingFile}
                aria-label="Adjuntar documento"
                title="Adjuntar PDF o imagen"
              >
                <Icon name="attach" size={20} />
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
              disabled={isStreaming || isProcessingFile}
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
                  <Icon name="stop" size={16} />
                </button>
              ) : (
                <button
                  id="chat-send-btn"
                  type="submit"
                  className="chat-send-btn"
                  disabled={(!input.trim() && !pendingAttachment) || isProcessingFile}
                  aria-label="Enviar mensaje"
                >
                  <Icon name="send" size={16} />
                </button>
              )}
            </div>
          </motion.div>
          <p className="chat-disclaimer" aria-label="Aviso legal">
            Lexia proporciona información orientativa. No constituye asesoramiento legal profesional.
          </p>
        </form>
      </div>
    </motion.div>
  );
};

export default ChatInterface;
