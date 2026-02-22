'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EMOJI = '⚖️';
const DURATION_MS = 3000;
const COUNT = 40;

interface Particle {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
}

interface EmojiRainProps {
  show: boolean;
  onComplete: () => void;
}

export function EmojiRain({ show, onComplete }: EmojiRainProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!show) return;
    setParticles(
      Array.from({ length: COUNT }, (_, i) => ({
        id: i,
        x: Math.random() * 100 - 10,
        delay: Math.random() * 0.3,
        duration: 1.5 + Math.random() * 1,
        size: 14 + Math.random() * 12,
      }))
    );
    const t = setTimeout(() => {
      onComplete();
      setParticles([]);
    }, DURATION_MS);
    return () => clearTimeout(t);
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <div
          className="emoji-rain"
          aria-hidden
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 9999,
            overflow: 'hidden',
          }}
        >
          {particles.map((p) => (
            <motion.span
              key={p.id}
              className="emoji-rain-particle"
              style={{
                position: 'absolute',
                left: `${p.x}%`,
                top: -30,
                fontSize: p.size,
              }}
              initial={{ y: 0, opacity: 0.8 }}
              animate={{
                y: '100vh',
                opacity: 0,
                transition: {
                  delay: p.delay,
                  duration: p.duration,
                  ease: 'linear',
                },
              }}
              exit={{ opacity: 0 }}
            >
              {EMOJI}
            </motion.span>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
