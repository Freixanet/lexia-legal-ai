'use client';

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const DEMO_MESSAGES: { role: 'user' | 'assistant'; content: string; delay: number }[] = [
  { role: 'user', content: 'Me han despedido sin darme explicaciones. ¿Es legal?', delay: 0 },
  {
    role: 'assistant',
    content: '**Resumen:** Un despido sin causa ni preaviso puede ser improcedente. Tienes derecho a indemnización y, en muchos casos, a reclamar la readmisión.\n\n**Base legal:** Art. 55 ET (despido disciplinario), Art. 56 ET (causas). El empresario debe comunicarte por escrito la causa. Si no lo hace o la causa no es válida, el despido puede declararse nulo o improcedente.\n\n**Pasos recomendados:**\n1. Solicita por escrito el finiquito y la carta de despido con causa.\n2. Si no te la dan o no estás de acuerdo, presenta demanda ante el SMAC en 20 días hábiles.\n3. Consulta con un abogado laboral para valorar tu caso.',
    delay: 800,
  },
];

export function Demo() {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const total = DEMO_MESSAGES.length;
    const timers: ReturnType<typeof setTimeout>[] = [];
    DEMO_MESSAGES.forEach((_, i) => {
      timers.push(
        setTimeout(() => setVisibleCount((c) => Math.min(c + 1, total)), DEMO_MESSAGES[i].delay + i * 1200)
      );
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <section id="demo" className="landing-v3-section" aria-labelledby="demo-title">
      <div className="landing-v3-container">
        <motion.h2
          id="demo-title"
          className="landing-v3-section-title"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Así responde Lexia
        </motion.h2>
        <div className="landing-v3-demo-mockup">
          <div className="landing-v3-demo-chat">
            <AnimatePresence mode="popLayout">
              {DEMO_MESSAGES.slice(0, visibleCount).map((msg, i) => (
                <motion.div
                  key={i}
                  className={`landing-v3-demo-msg ${msg.role}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  {msg.role === 'user' ? (
                    <p>{msg.content}</p>
                  ) : (
                    <div className="landing-v3-demo-assistant">
                      <p className="landing-v3-demo-section">📊 Resumen</p>
                      <p>Un despido sin causa puede ser improcedente. Tienes derecho a indemnización.</p>
                      <p className="landing-v3-demo-section">📖 Base legal</p>
                      <p>Art. 55 ET, Art. 56 ET.</p>
                      <p className="landing-v3-demo-section">✅ Pasos</p>
                      <p>Solicita carta de despido → Presenta demanda en 20 días → Consulta abogado.</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <Link to="/iniciar-sesion" className="landing-v3-demo-cta">
            Pruébalo con tu caso →
          </Link>
        </div>
      </div>
    </section>
  );
}
