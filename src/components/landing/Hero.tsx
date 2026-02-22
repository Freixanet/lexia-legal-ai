'use client';

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const HEADLINE_WORDS = ['Tu', 'problema', 'legal', 'tiene', 'solución.'];
const TYPEWRITER_TEXT = '¿Pueden subirme el alquiler sin avisar?';

export function Hero() {
  const [typewriter, setTypewriter] = useState('');
  const [showCaret, setShowCaret] = useState(true);

  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      if (i <= TYPEWRITER_TEXT.length) {
        setTypewriter(TYPEWRITER_TEXT.slice(0, i));
        i++;
      } else {
        clearInterval(t);
        setInterval(() => setShowCaret((c) => !c), 500);
      }
    }, 80);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="landing-v3-hero" aria-labelledby="hero-headline">
      <div className="landing-v3-hero-bg">
        <div className="landing-v3-hero-gradient" />
        <div className="landing-v3-hero-dots" aria-hidden />
      </div>

      <div className="landing-v3-hero-inner">
        <motion.span
          className="landing-v3-hero-badge"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          ✨ Potenciado por IA avanzada
        </motion.span>

        <h1 id="hero-headline" className="landing-v3-hero-headline">
          {HEADLINE_WORDS.map((word, i) => (
            <motion.span
              key={word}
              className="landing-v3-hero-word"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              {word}{' '}
            </motion.span>
          ))}
        </h1>

        <motion.p
          className="landing-v3-hero-subheadline"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          Orientación legal inteligente con IA. Respuestas claras, en segundos, sin jerga incomprensible.
        </motion.p>

        <motion.div
          className="landing-v3-hero-ctas"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.75 }}
        >
          <Link to="/iniciar-sesion" className="landing-v3-hero-cta-primary">
            Empezar gratis →
          </Link>
          <a href="#demo" className="landing-v3-hero-cta-secondary">
            Ver cómo funciona ↓
          </a>
        </motion.div>

        <motion.div
          className="landing-v3-hero-demo-input-wrap"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          <div className="landing-v3-hero-demo-input">
            <span className="landing-v3-hero-demo-text">
              {typewriter}
              <span className={showCaret ? 'caret' : 'caret hide'}>|</span>
            </span>
          </div>
        </motion.div>

        <motion.p
          className="landing-v3-hero-trust"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.4 }}
        >
          Basado en legislación española vigente · Actualizado 2024 · Cifrado de extremo a extremo
        </motion.p>
      </div>
    </section>
  );
}
