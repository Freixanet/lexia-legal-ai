'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useState, useEffect } from 'react';

const METRICS = [
  { value: 12000, suffix: '', label: 'consultas resueltas' },
  { value: 3500, suffix: '', label: 'documentos analizados' },
  { value: 15, suffix: '+', label: 'áreas del derecho' },
];

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1500;
    const step = target / (duration / 16);
    let current = 0;
    const t = setInterval(() => {
      current += step;
      if (current >= target) {
        setCount(target);
        clearInterval(t);
      } else setCount(Math.floor(current));
    }, 16);
    return () => clearInterval(t);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {count.toLocaleString('es-ES')}{suffix}
    </span>
  );
}

export function SocialProof() {
  return (
    <section className="landing-v3-section" aria-labelledby="proof-title">
      <div className="landing-v3-container">
        <motion.h2
          id="proof-title"
          className="landing-v3-section-title"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Confían en Lexia
        </motion.h2>
        <div className="landing-v3-proof-grid">
          {METRICS.map((m) => (
            <motion.div
              key={m.label}
              className="landing-v3-proof-item"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="landing-v3-proof-value">
                <AnimatedCounter target={m.value} suffix={m.suffix} />
              </span>
              <span className="landing-v3-proof-label">{m.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
