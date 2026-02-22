import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Icon from './ui/Icon';
import { AVISO_LEGAL_TITLE, AVISO_LEGAL_CONTENT } from '../content/avisoLegal';
import { POLITICA_PRIVACIDAD_TITLE, POLITICA_PRIVACIDAD_CONTENT } from '../content/privacidad';
import { POLITICA_COOKIES_TITLE, POLITICA_COOKIES_CONTENT } from '../content/cookies';
import './LegalPage.css';

type LegalPageType = 'aviso-legal' | 'privacidad' | 'cookies';

const LEGAL_PAGES: Record<LegalPageType, { title: string; content: string }> = {
  'aviso-legal': { title: AVISO_LEGAL_TITLE, content: AVISO_LEGAL_CONTENT },
  privacidad: { title: POLITICA_PRIVACIDAD_TITLE, content: POLITICA_PRIVACIDAD_CONTENT },
  cookies: { title: POLITICA_COOKIES_TITLE, content: POLITICA_COOKIES_CONTENT },
};

const LegalPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname.replace(/\/$/, '') || '/';
  const type: LegalPageType =
    path === '/aviso-legal' ? 'aviso-legal' : path === '/privacidad' ? 'privacidad' : path === '/cookies' ? 'cookies' : 'aviso-legal';

  const { title, content } = LEGAL_PAGES[type];

  return (
    <div className="legal-page" role="main" aria-label={title}>
      <div className="legal-page-inner">
        <button
          type="button"
          className="legal-page-back"
          onClick={() => navigate(-1)}
          aria-label="Volver atrás"
        >
          <Icon name="arrow-right" size={18} className="legal-page-back-icon" />
          Volver
        </button>
        <header className="legal-page-header">
          <h1 className="legal-page-title">{title}</h1>
          <p className="legal-page-updated">
            Última actualización: {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </header>
        <div className="legal-page-body markdown-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content.trim()}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
