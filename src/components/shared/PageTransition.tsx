'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

const easeOut = [0.22, 1, 0.36, 1] as const;
const duration = 0.3;

const variants = {
  initial: {
    opacity: 0,
    y: 12,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration,
      ease: easeOut,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: duration * 0.8,
      ease: easeOut,
    },
  },
};

interface PageTransitionProps {
  children: ReactNode;
  /** Clase opcional para el wrapper. */
  className?: string;
}

/**
 * Envuelve el contenido de la página con animación de entrada/salida:
 * fade + slide-up al entrar (300ms easeOut), fade al salir.
 */
export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      className={className}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}
