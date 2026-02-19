import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { EXAMPLE_PROMPTS } from '../services/prompts';
import type { Attachment } from '../services/api';
import './LandingPage.css';

// ... (props and icons remain the same)

interface LandingPageProps {
  onSendMessage: (message: string, options?: { attachment?: Attachment }) => void;
}

// SVG Icons Map
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Laboral": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
    </svg>
  ),
  "Vivienda": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  ),
  "Consumo": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"></circle>
      <circle cx="20" cy="21" r="1"></circle>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
    </svg>
  ),
  "Herencias": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  ),
  "Tráfico": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13"></rect>
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
      <circle cx="5.5" cy="18.5" r="2.5"></circle>
      <circle cx="18.5" cy="18.5" r="2.5"></circle>
    </svg>
  ),
  "Datos": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  )
};

const LandingPage: React.FC<LandingPageProps> = ({ onSendMessage }) => {
  const [input, setInput] = useState('');
  const [showAllCards, setShowAllCards] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<Attachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (!trimmed && !pendingAttachment) return;
    onSendMessage(trimmed, { attachment: pendingAttachment || undefined });
    setInput('');
    setPendingAttachment(null);
  };

  const handlePromptClick = (question: string) => {
    onSendMessage(question);
  };

  const visiblePrompts = EXAMPLE_PROMPTS.slice(0, 3);
  const hiddenPrompts = EXAMPLE_PROMPTS.slice(3);

  return (
    <motion.div 
      className="landing" 
      role="region" 
      aria-label="Página de inicio de Lexia"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
    >
      <div className="landing-content">
        {/* Hero */}
        <header className="landing-hero">
          <div className="landing-badge fade-in" role="status">
            <span className="landing-badge-dot" aria-hidden="true" />
            Asistente Legal IA
          </div>

          <h1 className="landing-headline">
            <span className="headline-serif">Resuelve tus</span>
            <span className="headline-accent">dudas legales</span>
            <span className="headline-serif">con inteligencia artificial</span>
          </h1>

          <p className="landing-subtitle">
            Lexia es tu asistente legal inteligente. Haz cualquier pregunta sobre derecho
            y recibe respuestas claras, estructuradas y con referencias legales.
          </p>
        </header>

        {/* Search / Ask Bar */}
        <form className="landing-search" onSubmit={handleSubmit} role="search" aria-label="Buscar consulta legal">
          <motion.div 
            className="landing-search-container" 
            layoutId="chat-input-container"
            style={{ position: 'relative' }} /* For absolute pill positioning */
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
                aria-label="Adjuntar documento"
                title="Adjuntar PDF o Imagen"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
              </button>
            </div>
            <label htmlFor="landing-search-input" className="visually-hidden">
              Tu consulta legal
            </label>
            <input
              id="landing-search-input"
              className="landing-search-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Haz tu consulta legal..."
              autoComplete="off"
            />
            
            <div className="landing-search-actions">
              <button
                id="landing-submit-btn"
                className="landing-search-btn"
                type="submit"
                disabled={!input.trim() && !pendingAttachment}
                aria-label="Enviar consulta"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </motion.div>

        </form>

        {/* Example Prompts */}
        <section className="landing-prompts" aria-label="Consultas de ejemplo">
          {/* ... (prompts content remains same) */}
          <h2 className="landing-prompts-title">Prueba con una de estas consultas</h2>
          <div className="landing-prompts-grid" role="list">
             {/* ... mapped prompts ... */}
             {visiblePrompts.map((prompt, i) => (
              <button
                key={i}
                className="prompt-card"
                onClick={() => handlePromptClick(prompt.question)}
                role="listitem" // Explicitly setting listitem for list roll
                aria-label={`${prompt.category}: ${prompt.question}`}
              >
                <span className="prompt-card-icon" aria-hidden="true">
                  {CATEGORY_ICONS[prompt.category] || <span style={{fontSize: '20px'}}>?</span>}
                </span>
                <div className="prompt-card-content">
                  <span className="prompt-card-category">{prompt.category}</span>
                  <p className="prompt-card-question">{prompt.question}</p>
                </div>
                <svg className="prompt-card-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            ))}
             <div className={`prompts-expandable ${showAllCards ? 'expanded' : ''}`}>
              {hiddenPrompts.map((prompt, i) => (
                <button
                  key={i + 3}
                  className="prompt-card"
                  onClick={() => handlePromptClick(prompt.question)}
                  role="listitem"
                  aria-label={`${prompt.category}: ${prompt.question}`}
                >
                  <span className="prompt-card-icon" aria-hidden="true">
                    {CATEGORY_ICONS[prompt.category] || <span style={{fontSize: '20px'}}>?</span>}
                  </span>
                  <div className="prompt-card-content">
                    <span className="prompt-card-category">{prompt.category}</span>
                    <p className="prompt-card-question">{prompt.question}</p>
                  </div>
                  <svg className="prompt-card-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
          {/* ... toggle button ... */}
           <button
            className="prompts-toggle"
            onClick={() => setShowAllCards(!showAllCards)}
            aria-expanded={showAllCards}
          >
            {showAllCards ? 'Ver menos' : 'Ver más consultas'}
            <svg
              className={`prompts-toggle-icon ${showAllCards ? 'rotated' : ''}`}
              width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2"
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </section>

        {/* Footer */}
        <footer className="landing-footer">
          <div className="landing-footer-legal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            <p>
              Lexia proporciona información orientativa basada en IA y no constituye 
              asesoramiento legal profesional. Para decisiones legales importantes, 
              consulta siempre con un abogado colegiado.
            </p>
          </div>
        </footer>
      </div>
    </motion.div>
  );
};

export default LandingPage;
