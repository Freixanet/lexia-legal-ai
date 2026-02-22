'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQ_ITEMS = [
  {
    q: '¿Lexia sustituye a un abogado?',
    a: 'No. Lexia proporciona información y orientación legal general. Para decisiones legales importantes, siempre recomendamos consultar con un abogado colegiado.',
  },
  {
    q: '¿Es legal usar Lexia?',
    a: 'Sí. Lexia es una herramienta de información legal, no un servicio de asesoramiento legal. Similar a buscar información legal en internet, pero más organizada y fiable.',
  },
  {
    q: '¿Mis datos están seguros?',
    a: 'Sí. Usamos cifrado en tránsito y en reposo, cumplimos con el RGPD y no vendemos tus datos. Puedes exportar o eliminar tu información cuando quieras.',
  },
  {
    q: '¿La información está actualizada?',
    a: 'Nuestras fuentes se actualizan con la legislación vigente. Para normas muy recientes, te indicamos la fecha de la fuente.',
  },
  {
    q: '¿En qué jurisdicciones funciona?',
    a: 'Principalmente España. Estamos ampliando a otros países de habla hispana.',
  },
  {
    q: '¿Puedo cancelar en cualquier momento?',
    a: 'Sí. Puedes cancelar tu plan Pro en cualquier momento desde la configuración. No hay permanencia.',
  },
];

export function FAQ() {
  const [openId, setOpenId] = useState<number | null>(0);

  return (
    <section id="faq" className="landing-v3-section" aria-labelledby="faq-title">
      <div className="landing-v3-container landing-v3-faq-container">
        <motion.h2
          id="faq-title"
          className="landing-v3-section-title"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Preguntas frecuentes
        </motion.h2>
        <div className="landing-v3-faq-list">
          {FAQ_ITEMS.map((item, i) => (
            <div
              key={i}
              className="landing-v3-faq-item"
              style={{ borderBottom: '1px solid var(--color-border)' }}
            >
              <button
                type="button"
                className="landing-v3-faq-question"
                onClick={() => setOpenId(openId === i ? null : i)}
                aria-expanded={openId === i}
                aria-controls={`faq-answer-${i}`}
                id={`faq-question-${i}`}
              >
                {item.q}
                <span className="landing-v3-faq-icon" aria-hidden>
                  {openId === i ? '−' : '+'}
                </span>
              </button>
              <AnimatePresence mode="wait">
                {openId === i && (
                  <motion.div
                    id={`faq-answer-${i}`}
                    role="region"
                    aria-labelledby={`faq-question-${i}`}
                    className="landing-v3-faq-answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    {item.a}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
