import React from 'react';
import { ThemeProvider } from '@/app/providers';

/**
 * Metadata para la app (document title/description se gestionan en index.html en Vite).
 * Fuentes: Inter y JetBrains Mono cargadas en index.html (Google Fonts).
 */
const LEXIA_METADATA = {
  title: 'Lexia — Asistente Legal IA',
  description:
    'Lexia — Tu asistente legal inteligente impulsado por IA. Orientación legal accesible. Resuelve dudas legales de forma rápida.',
  ogImage: '/og-image.png',
  url: '', // Sustituir por NEXT_PUBLIC_APP_URL o window.location.origin en runtime
};

/**
 * Layout raíz: envuelve la app con ThemeProvider (dark por defecto).
 * En Vite no hay next/font; las fuentes Inter y JetBrains Mono se cargan en index.html.
 */
export function RootLayout({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

export { LEXIA_METADATA };
