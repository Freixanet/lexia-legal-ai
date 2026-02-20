import React, { useState } from 'react';
import './ErrorCardV1.css';

interface ErrorCardProps {
  message: string;
  onRetry?: () => void;
}

const ErrorCardV1: React.FC<ErrorCardProps> = ({ message, onRetry }) => {
  const [copied, setCopied] = useState(false);
  const isStaticError = message.toLowerCase().includes('versión estática') || message.toLowerCase().includes('vercel');

  const handleCopyLink = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };

  const handleOpenDemo = () => { window.open('https://lexia-law.vercel.app', '_blank'); };

  return (
    <div className="error-card" role="alert">
      <div className="error-card-header">
        <div className="error-status"><span className="status-dot disconnected" aria-hidden="true" /><span className="status-text">Desconectado</span></div>
        <h3 className="error-title">Servicio no disponible</h3>
      </div>
      <p className="error-message">{message}</p>
      <div className="error-actions">
        {isStaticError && (
          <button onClick={handleOpenDemo} className="error-btn error-btn-primary" aria-label="Abrir demo">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
            Abrir Demo
          </button>
        )}
        <button onClick={handleCopyLink} className="error-btn error-btn-secondary" aria-label={copied ? "Enlace copiado" : "Copiar enlace"}>
          {copied ? (<><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>Copiado</>) : (<><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>Copiar Enlace</>)}
        </button>
        {onRetry && !isStaticError && <button onClick={onRetry} className="error-btn error-btn-primary">Reintentar</button>}
      </div>
    </div>
  );
};

export default ErrorCardV1;
