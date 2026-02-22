import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getStoredConsent,
  setStoredConsent,
  DEFAULT_CONSENT_NEEDED_ONLY,
  DEFAULT_CONSENT_ALL,
} from '../constants/cookies';
import './CookieBanner.css';

const CookieBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [showGranular, setShowGranular] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [personalization, setPersonalization] = useState(false);

  useEffect(() => {
    const consent = getStoredConsent();
    if (!consent) setVisible(true);
  }, []);

  const acceptNecessary = () => {
    setStoredConsent(DEFAULT_CONSENT_NEEDED_ONLY);
    setVisible(false);
  };

  const acceptAll = () => {
    setStoredConsent(DEFAULT_CONSENT_ALL);
    setVisible(false);
  };

  const saveGranular = () => {
    setStoredConsent({
      necessary: true,
      analytics,
      personalization,
    });
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-label="Aviso de cookies">
      <div className="cookie-banner-inner">
        <p className="cookie-banner-text">
          Usamos cookies propias para el correcto funcionamiento de Lexia y, si lo aceptas, para análisis y personalización. Puedes aceptar solo las necesarias, todas o configurar tus preferencias.
          {' '}
          <Link to="/cookies" className="cookie-banner-link">Más información</Link>
        </p>
        <div className="cookie-banner-actions">
          <button type="button" className="cookie-banner-btn cookie-banner-btn-secondary" onClick={() => setShowGranular(!showGranular)}>
            {showGranular ? 'Ocultar opciones' : 'Configurar'}
          </button>
          <button type="button" className="cookie-banner-btn cookie-banner-btn-secondary" onClick={acceptNecessary}>
            Solo necesarias
          </button>
          <button type="button" className="cookie-banner-btn cookie-banner-btn-primary" onClick={acceptAll}>
            Aceptar todas
          </button>
        </div>
      </div>

      {showGranular && (
        <div className="cookie-banner-granular" role="region" aria-label="Opciones de cookies">
          <p className="cookie-banner-granular-title">Elige qué cookies permitir:</p>
          <div className="cookie-banner-granular-list">
            <div className="cookie-banner-granular-item cookie-banner-granular-required">
              <span className="cookie-banner-granular-label">Necesarias</span>
              <span className="cookie-banner-granular-desc">Esenciales para el funcionamiento (sesión, preferencias). No se pueden desactivar.</span>
              <span className="cookie-banner-granular-badge">Siempre activas</span>
            </div>
            <label className="cookie-banner-granular-item cookie-banner-granular-checkbox">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                aria-describedby="cookie-desc-analytics"
              />
              <span className="cookie-banner-granular-label">Analíticas</span>
              <span id="cookie-desc-analytics" className="cookie-banner-granular-desc">Uso agregado para mejorar el servicio (si están integradas).</span>
            </label>
            <label className="cookie-banner-granular-item cookie-banner-granular-checkbox">
              <input
                type="checkbox"
                checked={personalization}
                onChange={(e) => setPersonalization(e.target.checked)}
                aria-describedby="cookie-desc-personalization"
              />
              <span className="cookie-banner-granular-label">Personalización</span>
              <span id="cookie-desc-personalization" className="cookie-banner-granular-desc">Recordar preferencias (tema, idioma) entre sesiones.</span>
            </label>
          </div>
          <div className="cookie-banner-granular-actions">
            <button type="button" className="cookie-banner-btn cookie-banner-btn-primary" onClick={saveGranular}>
              Guardar preferencias
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CookieBanner;
