import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './ui/Icon';
import { hasAcceptedDisclaimer, setDisclaimerAccepted, DISCLAIMER_TEXT } from '../constants/disclaimer';
import './LegalDisclaimerModal.css';

interface LegalDisclaimerModalProps {
  /** Si es true, muestra el popup aunque ya se hubiera aceptado (útil en desarrollo). */
  forceOpen?: boolean;
  /** Se llama al aceptar cuando el popup se abrió con forceOpen. */
  onForceClose?: () => void;
}

const LegalDisclaimerModal: React.FC<LegalDisclaimerModalProps> = ({ forceOpen = false, onForceClose }) => {
  const [accepted, setAccepted] = useState(() => hasAcceptedDisclaimer());

  useEffect(() => {
    setAccepted(hasAcceptedDisclaimer());
  }, [forceOpen]);

  const showModal = forceOpen || !accepted;

  const handleAccept = () => {
    setDisclaimerAccepted();
    setAccepted(true);
    onForceClose?.();
  };

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          key="legal-disclaimer"
          className="legal-disclaimer-overlay"
          role="dialog"
        aria-modal="true"
        aria-labelledby="legal-disclaimer-title"
        aria-describedby="legal-disclaimer-desc"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        <motion.div
          className="legal-disclaimer-card"
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 8 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="legal-disclaimer-icon" aria-hidden="true">
            <Icon name="balanza" size={32} strokeWidth={1.8} />
          </div>
          <h2 id="legal-disclaimer-title" className="legal-disclaimer-title">
            Aviso legal
          </h2>
          <p id="legal-disclaimer-desc" className="legal-disclaimer-text">
            {DISCLAIMER_TEXT}
          </p>
          <p className="legal-disclaimer-hint">
            Para usar Lexia debes aceptar este aviso. Puedes consultar el Aviso legal completo en el pie de la aplicación.
          </p>
          <button
            type="button"
            className="legal-disclaimer-btn"
            onClick={handleAccept}
            autoFocus
          >
            Acepto
          </button>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LegalDisclaimerModal;
