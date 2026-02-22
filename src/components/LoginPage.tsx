import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { setLoggedIn } from '../constants/auth';
import './LoginPage.css';

const PHRASES = ['Lexia', 'Empower\nyourself.'];
const TYPEWRITER_DELAY_MS = 180;
const DELETE_DELAY_MS = 70;
const PAUSE_AFTER_TYPING_MS = 1400;
const TICK_MS = 50;

type Phase = 'typing' | 'pause' | 'deleting';

/**
 * Haptic leve por letra (solo en dispositivos que lo soportan).
 */
function triggerHaptic(): void {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(6);
  }
}

/**
 * Página de inicio de sesión: texto alternando "Lexia" / "Empower yourself."
 * con typewriter, borrado más rápido y haptic por letra.
 * Un solo intervalo (tick) controla todo el ciclo para evitar fallos al cambiar de frase.
 */
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('typing');
  const [displayedLength, setDisplayedLength] = useState(0);

  const phaseRef = useRef(phase);
  const phraseIndexRef = useRef(phraseIndex);
  const displayedLengthRef = useRef(displayedLength);
  const lastTypingAtRef = useRef(0);
  const lastDeletingAtRef = useRef(0);
  const pauseStartedAtRef = useRef(0);

  phaseRef.current = phase;
  phraseIndexRef.current = phraseIndex;
  displayedLengthRef.current = displayedLength;

  /** Un solo efecto: un tick cada TICK_MS que avanza el ciclo según la fase actual */
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      const p = phaseRef.current;
      const idx = phraseIndexRef.current;
      const phrase = PHRASES[idx];
      const curLen = displayedLengthRef.current;

      if (p === 'typing') {
        if (curLen >= phrase.length) {
          setPhase('pause');
          pauseStartedAtRef.current = now;
          return;
        }
        if (now - lastTypingAtRef.current >= TYPEWRITER_DELAY_MS) {
          lastTypingAtRef.current = now;
          triggerHaptic();
          setDisplayedLength((prev) => prev + 1);
        }
        return;
      }

      if (p === 'pause') {
        if (now - pauseStartedAtRef.current >= PAUSE_AFTER_TYPING_MS) {
          setPhase('deleting');
        }
        return;
      }

      if (p === 'deleting') {
        if (curLen <= 0) {
          lastTypingAtRef.current = now;
          setPhraseIndex((i) => (i + 1) % PHRASES.length);
          setPhase('typing');
          setDisplayedLength(0);
          return;
        }
        if (now - lastDeletingAtRef.current >= DELETE_DELAY_MS) {
          lastDeletingAtRef.current = now;
          setDisplayedLength((prev) => prev - 1);
        }
      }
    }, TICK_MS);

    return () => clearInterval(id);
  }, []);

  const currentPhrase = PHRASES[phraseIndex];
  const displayedText = currentPhrase.slice(0, displayedLength);
  const showCursor =
    (phase === 'typing' && displayedLength < currentPhrase.length) ||
    phase === 'pause' ||
    (phase === 'deleting' && displayedLength > 0) ||
    (phase === 'typing' && displayedLength === currentPhrase.length);

  const handleLogin = useCallback(() => {
    setLoggedIn();
    navigate('/');
  }, [navigate]);

  const handleApple = useCallback(() => {
    // Placeholder: integrar Sign in with Apple
    handleLogin();
  }, [handleLogin]);

  const handleGoogle = useCallback(() => {
    // Placeholder: integrar Sign in with Google
    handleLogin();
  }, [handleLogin]);

  // #region agent log
  useEffect(() => {
    const t = setTimeout(() => {
      const g = (el: Element | null) => el ? window.getComputedStyle(el) : null;
      const bg = (el: Element | null) => g(el)?.backgroundColor ?? 'N/A';
      const main = document.getElementById('main-content');
      const loginWelcome = document.querySelector('.login-welcome');
      const chain: { tag: string; class: string; bg: string; borderTop: string; boxShadow: string }[] = [];
      let node: Node | null = loginWelcome;
      while (node && node !== main) {
        if (node.nodeType === 1) {
          const e = node as Element;
          const s = g(e);
          chain.push({
            tag: e.tagName,
            class: e.className?.toString().slice(0, 80) ?? '',
            bg: s?.backgroundColor ?? 'N/A',
            borderTop: s?.borderTopWidth + ' ' + s?.borderTopStyle + ' ' + s?.borderTopColor ?? '',
            boxShadow: s?.boxShadow ?? ''
          });
        }
        node = node.parentNode;
      }
      const payload = {
        sessionId: 'ba9ffe',
        runId: 'login-bg-debug',
        hypothesisId: 'A',
        location: 'LoginPage.tsx:useEffect',
        message: 'Login page computed backgrounds and main->.login-welcome chain',
        data: {
          htmlBg: bg(document.documentElement),
          htmlDataTheme: document.documentElement.getAttribute('data-theme'),
          htmlDataAppVersion: document.documentElement.getAttribute('data-app-version'),
          htmlDataLexiaPage: document.documentElement.getAttribute('data-lexia-page'),
          bodyBg: bg(document.body),
          rootBg: bg(document.getElementById('root')),
          appBg: bg(document.querySelector('.app')),
          mainBg: main ? bg(main) : 'N/A',
          chainFromMainToLogin: chain
        },
        timestamp: Date.now()
      };
      fetch('http://127.0.0.1:7694/ingest/c16cdd1e-5739-4aec-9ebc-33369bb623e8', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'ba9ffe' }, body: JSON.stringify(payload) }).catch(() => {});
      const payload2 = {
        sessionId: 'ba9ffe',
        runId: 'login-bg-debug',
        hypothesisId: 'B',
        location: 'LoginPage.tsx:useEffect',
        message: 'Computed --color-bg-primary on html vs .app',
        data: {
          htmlVar: g(document.documentElement)?.getPropertyValue('--color-bg-primary')?.trim() || 'N/A',
          appVar: g(document.querySelector('.app'))?.getPropertyValue('--color-bg-primary')?.trim() || 'N/A',
          loginWelcomeBg: bg(loginWelcome),
          loginCenterBg: bg(document.querySelector('.login-welcome-center')),
          loginTitleBg: bg(document.querySelector('.login-welcome-title')),
          loginTitleBorder: g(document.querySelector('.login-welcome-title'))?.borderTop ?? 'N/A',
          loginTitleBoxShadow: g(document.querySelector('.login-welcome-title'))?.boxShadow ?? 'N/A'
        },
        timestamp: Date.now()
      };
      fetch('http://127.0.0.1:7694/ingest/c16cdd1e-5739-4aec-9ebc-33369bb623e8', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'ba9ffe' }, body: JSON.stringify(payload2) }).catch(() => {});
      const el = (sel: string) => document.querySelector(sel);
      const fullBg = (el: Element | null) => el ? { background: g(el)?.background?.slice(0, 120), backgroundImage: g(el)?.backgroundImage?.slice(0, 120) } : null;
      const pseudo = (el: Element | null, p: string) => el ? (() => { try { const s = window.getComputedStyle(el, p); return { bg: s.backgroundColor?.slice(0, 40), bgImage: s.backgroundImage?.slice(0, 80) }; } catch { return null; } })() : null;
      const payload3 = {
        sessionId: 'ba9ffe',
        runId: 'login-bg-debug',
        hypothesisId: 'F',
        location: 'LoginPage.tsx:useEffect',
        message: 'Full background and gradient check; pseudo-elements',
        data: {
          htmlFull: fullBg(document.documentElement),
          bodyFull: fullBg(document.body),
          mainFull: fullBg(main),
          appFull: fullBg(el('.app')),
          htmlBefore: pseudo(document.documentElement, '::before'),
          htmlAfter: pseudo(document.documentElement, '::after'),
          bodyBefore: pseudo(document.body, '::before'),
          bodyAfter: pseudo(document.body, '::after'),
          mainBefore: main ? pseudo(main, '::before') : null,
          mainAfter: main ? pseudo(main, '::after') : null
        },
        timestamp: Date.now()
      };
      fetch('http://127.0.0.1:7694/ingest/c16cdd1e-5739-4aec-9ebc-33369bb623e8', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'ba9ffe' }, body: JSON.stringify(payload3) }).catch(() => {});
      const mainRect = main?.getBoundingClientRect();
      const welcomeRect = loginWelcome?.getBoundingClientRect();
      const fixedOrAbsolute: { sel: string; top: number; left: number; bg: string; zIndex: string }[] = [];
      document.querySelectorAll('*').forEach((el) => {
        const s = g(el);
        if (s?.position === 'fixed' || s?.position === 'absolute') {
          const r = (el as Element).getBoundingClientRect();
          if (r.top < 200 && r.height > 0) fixedOrAbsolute.push({ sel: (el as Element).tagName + (el.className ? '.' + (el as Element).className.toString().split(/\s/)[0] : ''), top: r.top, left: r.left, bg: s.backgroundColor?.slice(0, 30) ?? '', zIndex: s.zIndex ?? '' });
        }
      });
      const payload4 = {
        sessionId: 'ba9ffe',
        runId: 'login-bg-debug',
        hypothesisId: 'G',
        location: 'LoginPage.tsx:useEffect',
        message: 'Rects and fixed/absolute overlays in top 200px',
        data: {
          mainRect: mainRect ? { top: mainRect.top, left: mainRect.left, width: mainRect.width, height: mainRect.height } : null,
          loginWelcomeRect: welcomeRect ? { top: welcomeRect.top, left: welcomeRect.left, width: welcomeRect.width, height: welcomeRect.height } : null,
          fixedOrAbsoluteInTop: fixedOrAbsolute.slice(0, 20)
        },
        timestamp: Date.now()
      };
      fetch('http://127.0.0.1:7694/ingest/c16cdd1e-5739-4aec-9ebc-33369bb623e8', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'ba9ffe' }, body: JSON.stringify(payload4) }).catch(() => {});
    }, 500);
    return () => clearTimeout(t);
  }, []);
  // #endregion

  return (
    <div className="login-welcome" role="main" aria-label="Iniciar sesión en Lexia">
      <div className="login-welcome-center">
        <h1 className="login-welcome-title" aria-live="polite" aria-atomic="true">
          {displayedText}
          {showCursor && (
            <span className="login-welcome-cursor" aria-hidden="true">
              |
            </span>
          )}
        </h1>
      </div>

      <motion.div
        className="login-welcome-actions-wrap"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 1.2 }}
      >
        <div className="login-welcome-actions">
        <button
          type="button"
          className="login-welcome-btn login-welcome-btn-apple"
          onClick={handleApple}
          aria-label="Continuar con Apple"
        >
          <span className="login-welcome-btn-icon" aria-hidden="true">
            <AppleIcon />
          </span>
          Continuar con Apple
        </button>

        <button
          type="button"
          className="login-welcome-btn login-welcome-btn-google"
          onClick={handleGoogle}
          aria-label="Continuar con Google"
        >
          <span className="login-welcome-btn-icon" aria-hidden="true">
            <GoogleIcon />
          </span>
          Continuar con Google
        </button>

        <button
          type="button"
          className="login-welcome-btn login-welcome-btn-secondary"
          onClick={handleLogin}
          aria-label="Regístrate"
        >
          Regístrate
        </button>

        <button
          type="button"
          className="login-welcome-btn login-welcome-btn-ghost"
          onClick={handleLogin}
          aria-label="Inicia sesión"
        >
          Inicia sesión
        </button>
        </div>
      </motion.div>
    </div>
  );
};

/** Icono Apple (Sign in with Apple) */
function AppleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

/** Icono Google */
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export default LoginPage;
