import React, { useState } from 'react';
import Icon from './ui/Icon';
import './ErrorCard.css';

interface ErrorCardProps {
  message: string;
  onRetry?: () => void;
}

const ErrorCard: React.FC<ErrorCardProps> = ({ message, onRetry }) => {
  const [copied, setCopied] = useState(false);
  const isStaticError = message.toLowerCase().includes('versión estática') || message.toLowerCase().includes('vercel');

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore
    }
  };

  const handleOpenDemo = () => {
    window.open('https://lexia-law.vercel.app', '_blank');
  };

  return (
    <div className="error-card" role="alert">
      <div className="error-card-header">
        <div className="error-status">
          <span className="status-dot" aria-hidden="true" />
          <span className="status-text">Desconectado</span>
        </div>
        <h3 className="error-title">Servicio no disponible</h3>
      </div>

      <p className="error-message">{message}</p>

      <div className="error-actions">
        {isStaticError && (
          <button
            onClick={handleOpenDemo}
            className="error-btn error-btn-primary"
            aria-label="Abrir demo"
          >
            <Icon name="external-link" size={16} />
            Abrir Demo
          </button>
        )}

        <button
          onClick={handleCopyLink}
          className="error-btn error-btn-secondary"
          aria-label={copied ? "Enlace copiado" : "Copiar enlace"}
        >
          {copied ? (
            <><Icon name="check" size={16} /> Copiado</>
          ) : (
            <><Icon name="copy" size={16} /> Copiar Enlace</>
          )}
        </button>

        {onRetry && !isStaticError && (
          <button onClick={onRetry} className="error-btn error-btn-primary">
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorCard;
