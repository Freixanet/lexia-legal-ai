/**
 * Loading UIs para feedback instantáneo (Suspense fallbacks).
 * Lexia usa Vite + React Router; no hay loading.tsx por ruta como en Next.js.
 * Este módulo centraliza los skeletons por tipo de ruta para usar en App.
 */
import { SkeletonLanding, SkeletonChat, SkeletonLegal, SkeletonLogin } from '@/components/ui/Skeleton';

/** Fallback genérico: skeleton de landing (neutral). */
export function Loading() {
  return <SkeletonLanding />;
}

/** Fallback para rutas de landing (/, /iniciar-sesion cuando no login). */
export function LoadingLanding() {
  return <SkeletonLanding />;
}

/** Fallback para vista de chat (/c/:id). */
export function LoadingChat() {
  return <SkeletonChat />;
}

/** Fallback para páginas legales (/aviso-legal, /privacidad, /cookies). */
export function LoadingLegal() {
  return <SkeletonLegal />;
}

/** Fallback para página de login (/iniciar-sesion, /login). */
export function LoadingLogin() {
  return <SkeletonLogin />;
}

export default Loading;
