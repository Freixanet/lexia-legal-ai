'use client';

import { useEffect, useState } from 'react';

const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];

/**
 * Detecta el código Konami (↑↑↓↓←→←→BA) y opcionalmente la palabra "konami" en un input.
 * Retorna true cuando se activa el easter egg.
 */
export function useKonami(options?: { onTrigger?: () => void }) {
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    let index = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (triggered) return;
      const key = e.code;
      if (key === KONAMI_CODE[index]) {
        index++;
        if (index === KONAMI_CODE.length) {
          setTriggered(true);
          options?.onTrigger?.();
        }
      } else {
        index = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggered, options?.onTrigger]);

  return triggered;
}

/** Comprueba si el texto escrito contiene "konami" (easter egg). */
export function checkKonamiText(text: string): boolean {
  return text.toLowerCase().trim().includes('konami');
}
