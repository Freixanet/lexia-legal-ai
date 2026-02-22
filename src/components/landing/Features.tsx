'use client';

import { motion } from 'framer-motion';

const FEATURES = [
  {
    emoji: '💬',
    title: 'Chat Legal Inteligente',
    description:
      'Pregunta cualquier duda legal y recibe respuestas claras, estructuradas y con base legal. Como hablar con un experto que habla tu idioma.',
  },
  {
    emoji: '📄',
    title: 'Análisis de Documentos',
    description:
      'Sube contratos, demandas o cualquier documento. Lexia lo analiza y te dice exactamente qué significa, qué riesgos tiene y qué hacer.',
  },
  {
    emoji: '🎯',
    title: 'Acción, no confusión',
    description:
      'Cada respuesta incluye pasos concretos que puedes seguir. Sin ambigüedades, sin jerga. Saber qué hacer y cuándo hacerlo.',
  },
];

export function Features() {
  return (
    <section id="features" className="landing-v3-section" aria-labelledby="features-title">
      <div className="landing-v3-container">
        <motion.h2
          id="features-title"
          className="landing-v3-section-title"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Todo lo que necesitas
        </motion.h2>
        <div className="landing-v3-features-grid">
          {FEATURES.map((f, i) => (
            <motion.article
              key={f.title}
              className="landing-v3-feature-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <span className="landing-v3-feature-emoji" aria-hidden>
                {f.emoji}
              </span>
              <h3 className="landing-v3-feature-title">{f.title}</h3>
              <p className="landing-v3-feature-desc">{f.description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
