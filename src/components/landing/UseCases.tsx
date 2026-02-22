'use client';

import { motion } from 'framer-motion';

const CASES = [
  { emoji: '🏠', label: 'Alquiler y vivienda' },
  { emoji: '💼', label: 'Problemas laborales' },
  { emoji: '🛒', label: 'Reclamaciones de consumo' },
  { emoji: '👨‍👩‍👧', label: 'Derecho de familia' },
  { emoji: '📋', label: 'Herencias' },
  { emoji: '🚗', label: 'Multas y sanciones' },
  { emoji: '📝', label: 'Contratos' },
  { emoji: '🏢', label: 'Emprendimiento' },
];

export function UseCases() {
  return (
    <section id="use-cases" className="landing-v3-section" aria-labelledby="cases-title">
      <div className="landing-v3-container">
        <motion.h2
          id="cases-title"
          className="landing-v3-section-title"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Casos de uso
        </motion.h2>
        <div className="landing-v3-cases-grid">
          {CASES.map((c, i) => (
            <motion.button
              key={c.label}
              type="button"
              className="landing-v3-case-card"
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span aria-hidden>{c.emoji}</span>
              <span>{c.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
