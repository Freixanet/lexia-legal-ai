'use client';

import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="landing-v3-footer" role="contentinfo">
      <div className="landing-v3-container landing-v3-footer-inner">
        <div className="landing-v3-footer-brand">
          <Link to="/" className="landing-v3-footer-logo">
            Lexia
          </Link>
          <p className="landing-v3-footer-desc">
            Orientación legal inteligente con IA. Información clara, no sustituye a un abogado.
          </p>
        </div>
        <div className="landing-v3-footer-links">
          <div className="landing-v3-footer-col">
            <span className="landing-v3-footer-col-title">Legal</span>
            <Link to="/aviso-legal">Términos</Link>
            <Link to="/privacidad">Privacidad</Link>
            <Link to="/cookies">Cookies</Link>
          </div>
          <div className="landing-v3-footer-col">
            <span className="landing-v3-footer-col-title">Producto</span>
            <a href="#contact">Contacto</a>
            <a href="#faq">FAQ</a>
          </div>
        </div>
      </div>
      <div className="landing-v3-footer-bottom">
        <p>© 2024 Lexia Technologies S.L.</p>
        <p className="landing-v3-footer-disclaimer">
          Lexia no constituye un servicio de asesoramiento legal profesional.
        </p>
      </div>
    </footer>
  );
}
