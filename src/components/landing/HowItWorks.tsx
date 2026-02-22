'use client';

import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { motion } from 'framer-motion';

const STEPS = [
  { icon: '💬', label: 'Describe tu situación' },
  { icon: '⚖️', label: 'Lexia analiza con IA + legislación' },
  { icon: '✅', label: 'Recibe tu plan de acción' },
];

export function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section id="how-it-works" className="landing-v3-section" aria-labelledby="how-title">
      <div className="landing-v3-container" ref={ref}>
        <motion.h2
          id="how-title"
          className="landing-v3-section-title"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Cómo funciona
        </motion.h2>
        <div className="landing-v3-how-steps">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.label}
              className="landing-v3-how-step"
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.2 }}
            >
              <span className="landing-v3-how-icon" aria-hidden>
                {step.icon}
              </span>
              <span className="landing-v3-how-label">{step.label}</span>
              {i < STEPS.length - 1 && <span className="landing-v3-how-connector" aria-hidden />}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
