import React, { useState } from 'react';
import { EXAMPLE_PROMPTS } from '../services/prompts';
import './LandingPage.css';

interface LandingPageProps {
  onSendMessage: (message: string) => void;
  onOpenSidebar: () => void;
  sidebarOpen: boolean;
}

const LandingPage: React.FC<LandingPageProps> = ({ onSendMessage, onOpenSidebar, sidebarOpen }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setInput('');
  };

  const handlePromptClick = (question: string) => {
    onSendMessage(question);
  };

  return (
    <div className="landing" role="region" aria-label="Página de inicio de Lexia">
      {/* Mobile menu */}
      <button
        id="landing-sidebar-toggle"
        className="landing-menu-btn"
        onClick={onOpenSidebar}
        aria-label="Abrir menú lateral"
        aria-expanded={sidebarOpen}
        aria-controls="sidebar"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

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

          <p className="landing-subtitle fade-in-up">
            Lexia es tu asistente legal inteligente. Haz cualquier pregunta sobre derecho
            y recibe respuestas claras, estructuradas y con referencias legales.
          </p>
        </header>

        {/* Search / Ask Bar */}
        <form className="landing-search" onSubmit={handleSubmit} role="search" aria-label="Buscar consulta legal">
          <div className="landing-search-container">
            <svg className="landing-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
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
            <button
              id="landing-submit-btn"
              className="landing-search-btn"
              type="submit"
              disabled={!input.trim()}
              aria-label="Enviar consulta"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>

        </form>

        {/* Example Prompts */}
        <section className="landing-prompts" aria-label="Consultas de ejemplo">
          <h2 className="landing-prompts-title">Prueba con una de estas consultas</h2>
          <div className="landing-prompts-grid" role="list">
            {EXAMPLE_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                className="prompt-card"
                onClick={() => handlePromptClick(prompt.question)}
                style={{ animationDelay: `${i * 80}ms` }}
                role="listitem"
                aria-label={`${prompt.category}: ${prompt.question}`}
              >
                <span className="prompt-card-icon" aria-hidden="true">{prompt.icon}</span>
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
    </div>
  );
};

export default LandingPage;
