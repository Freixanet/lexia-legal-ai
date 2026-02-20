import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageBubbleV1 from './MessageBubbleV1';
import ErrorCardV1 from './ErrorCardV1';
import type { Conversation, Attachment } from '../../services/api';
import './ChatInterfaceV1.css';
import Worker from '../../workers/fileProcessor?worker';
import { streamStore } from '../../store/streamStore';

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
          <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
            <path d="M8 24V8h2.5v13.5H20V24H8Z" fill="currentColor"/>
            <circle cx="23" cy="10" r="2.5" fill="currentColor" opacity="0.6"/>
          </svg>
        </div>
        <div className="chat-loading-dots" aria-hidden="true"><span /><span /><span /></div>
        <span className="visually-hidden">Lexia está escribiendo...</span>
      </div>
    );
  }

  return (
    <MessageBubbleV1 message={{ id: 'streaming', role: 'assistant', content, timestamp: Date.now() }} isStreaming={true} />
  );
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({ conversation, isStreaming, error, onSendMessage, onStopStreaming, draftConfig }) => {
  const [input, setInput] = useState(() => draftConfig.getDraft(conversation.id));
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [pendingAttachment, setPendingAttachment] = useState<Attachment | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  }, [input]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setInput(draftConfig.getDraft(conversation.id)); }, [conversation.id]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);
    draftConfig.saveDraft(conversation.id, value);
  }, [conversation.id, draftConfig]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/') && file.size > 2.5 * 1024 * 1024) {
      alert("El documento PDF es demasiado grande (máx 2.5MB para mantener el límite del servidor).");
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
            setPendingAttachment({ name: file.name, type: event.data.type, data: reader.result as string });
            setIsProcessingFile(false);
            worker.terminate();
          };
          reader.readAsDataURL(blob);
          return;
        } else {
          setPendingAttachment({ name: file.name, type: event.data.type, data: base64Data });
        }
      } else { alert("Hubo un error al procesar el archivo: " + event.data.error); }
      setIsProcessingFile(false);
      worker.terminate();
    };
    worker.onerror = () => { alert("Error en proceso de archivo."); setIsProcessingFile(false); worker.terminate(); };
    worker.postMessage({ file });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if ((!trimmed && !pendingAttachment) || isStreaming) return;
    onSendMessage(trimmed, { attachment: pendingAttachment || undefined });
    setInput('');
    draftConfig.saveDraft(conversation.id, '');
    setPendingAttachment(null);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); }
  };

  return (
    <motion.div className="chat-interface" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
      <header className="chat-header">
        <div className="chat-header-info"><h2 className="chat-header-title">{conversation.title}</h2></div>
        <div className="chat-header-controls">
          {isOffline && <div className="header-status-indicator offline">Offline</div>}
        </div>
      </header>
      <div className="chat-messages" role="log" aria-label="Historial de mensajes" aria-live="polite" aria-relevant="additions">
        <div className="chat-messages-container">
          <AnimatePresence initial={false}>
            {conversation.messages.map((msg) => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <MessageBubbleV1 message={msg} />
              </motion.div>
            ))}
          </AnimatePresence>
          {isStreaming && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><StreamingBubble /></motion.div>)}
          {error && (<div className="chat-error-container"><ErrorCardV1 message={error} /></div>)}
          <div className="scroll-anchor" />
        </div>
      </div>
      <div className="chat-input-area">
        <form className="chat-input-form" onSubmit={handleSubmit} aria-label="Enviar mensaje">
          <motion.div className="chat-input-container" layoutId="chat-input-container">
            {pendingAttachment && (
              <div className="chat-attachment-pill">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                <span className="attachment-name">{pendingAttachment.name}</span>
                <button type="button" className="attachment-remove" onClick={() => setPendingAttachment(null)} aria-label="Quitar archivo">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            )}
            <label htmlFor="chat-message-input" className="visually-hidden">Tu consulta legal</label>
            <div className="chat-input-leading-actions">
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*,application/pdf" onChange={handleFileChange} />
              <button type="button" className={`chat-attach-btn ${isProcessingFile ? 'processing' : ''}`} onClick={() => fileInputRef.current?.click()} disabled={isStreaming || isProcessingFile} aria-label="Adjuntar documento" title="Adjuntar PDF o Imagen">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
              </button>
            </div>
            <textarea id="chat-message-input" ref={textareaRef} className="chat-input" value={input} onChange={handleInputChange} onKeyDown={handleKeyDown} placeholder="Describe tu duda legal..." rows={1} disabled={isStreaming || isProcessingFile} aria-label="Escribe tu consulta legal" />
            <div className="chat-input-actions">
              {isStreaming ? (
                <button id="chat-stop-btn" type="button" className="chat-stop-btn" onClick={onStopStreaming} aria-label="Detener respuesta">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
                </button>
              ) : (
                <button id="chat-send-btn" type="submit" className="chat-send-btn" disabled={(!input.trim() && !pendingAttachment) || isProcessingFile} aria-label="Enviar mensaje">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                </button>
              )}
            </div>
          </motion.div>
          <p className="chat-disclaimer" aria-label="Aviso legal">⚖️ Lexia proporciona información orientativa. No constituye asesoramiento legal profesional.</p>
        </form>
      </div>
    </motion.div>
  );
};

export default ChatInterface;
