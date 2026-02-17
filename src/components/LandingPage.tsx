import React, { useState } from 'react';
import { EXAMPLE_PROMPTS } from '../services/prompts';
import './LandingPage.css';

interface LandingPageProps {
  onSendMessage: (message: string) => void;
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

  const visiblePrompts = EXAMPLE_PROMPTS.slice(0, 3);
  const hiddenPrompts = EXAMPLE_PROMPTS.slice(3);

  return (
    <div className="landing" role="region" aria-label="Página de inicio de Lexia">
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
            {/* First 3 always visible */}
            {visiblePrompts.map((prompt, i) => (
              <button
                key={i}
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
            {/* Remaining 3 — collapsed on mobile, always visible on desktop */}
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
          {/* Mobile toggle */}
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
    </div>
  );
};

export default LandingPage;
