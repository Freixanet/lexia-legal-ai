'use client';

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function FinalCTA() {
  return (
    <section className="landing-v3-section landing-v3-final-cta" aria-labelledby="final-cta-title">
      <div className="landing-v3-container">
        <motion.div
          className="landing-v3-final-cta-inner"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 id="final-cta-title" className="landing-v3-final-cta-title">
            Tu problema legal no tiene por qué quitarte el sueño
          </h2>
          <p className="landing-v3-final-cta-sub">
            Empieza gratis. Sin tarjeta. Sin compromiso.
          </p>
          <Link to="/iniciar-sesion" className="landing-v3-final-cta-btn">
            Empezar ahora →
          </Link>
          <p className="landing-v3-final-cta-note">
            Únete a miles de personas que ya usan Lexia
          </p>
        </motion.div>
      </div>
    </section>
  );
}
