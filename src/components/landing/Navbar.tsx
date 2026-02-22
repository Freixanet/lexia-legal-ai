'use client';

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`landing-v3-nav ${scrolled ? 'scrolled' : ''}`}
      role="navigation"
      aria-label="Principal"
    >
      <div className="landing-v3-nav-inner">
        <Link to="/" className="landing-v3-nav-logo">
          Lexia
        </Link>
        <div className="landing-v3-nav-links">
          <a href="#features">Funciones</a>
          <a href="#how-it-works">Cómo funciona</a>
          <a href="#pricing">Precios</a>
          <a href="#faq">FAQ</a>
          <Link to="/iniciar-sesion" className="landing-v3-nav-cta">
            Entrar
          </Link>
        </div>
      </div>
    </nav>
  );
}
