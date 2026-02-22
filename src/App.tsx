import { AnimatePresence } from 'framer-motion';
import { useState, useEffect, useLayoutEffect, useRef, lazy, Suspense, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { del } from 'idb-keyval';
import { useChat } from './hooks/useChat';
import { STORAGE_KEY_CONVERSATIONS, STORAGE_KEY_DRAFT_PREFIX } from './constants/storage';
import { COOKIE_CONSENT_KEY } from './constants/cookies';
import { DISCLAIMER_ACCEPTED_KEY } from './constants/disclaimer';
import { isLoggedIn, clearLoggedIn } from './constants/auth';
import { getStoredAppVersion, setStoredAppVersion, type AppVersion } from './constants/appVersion';
import { useTheme } from './app/providers';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import ChatLeftBar from './components/ChatLeftBar';
import ErrorBoundary from './components/ui/ErrorBoundary';
import CookieBanner from './components/CookieBanner';
import LegalDisclaimerModal from './components/LegalDisclaimerModal';
import Icon from './components/ui/Icon';
import Toast from './components/ui/Toast';
import { SkeletonLanding, SkeletonChat, SkeletonLegal, SkeletonLogin } from './components/ui/Skeleton';
import { LoadingLegal, LoadingLogin } from './app/loading';
import { PageTransition } from './components/shared/PageTransition';
import { EmojiRain } from './components/shared/EmojiRain';
const CommandPalette = lazy(() => import('./components/shared/CommandPalette').then(m => ({ default: m.CommandPalette })));
const KeyboardShortcutsCheatsheet = lazy(() => import('./components/shared/KeyboardShortcutsCheatsheet').then(m => ({ default: m.KeyboardShortcutsCheatsheet })));
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import './components/ui/ErrorBoundary.css';
import './components/ui/Skeleton.css';
import './App.css';
import './styles/alt-version.css';

const LandingPage = lazy(() => import('./components/LandingPage'));
const LandingV3 = lazy(() => import('./components/landing/LandingV3').then(m => ({ default: m.LandingV3 })));
const ChatInterface = lazy(() => import('./components/ChatInterface'));
const LegalPage = lazy(() => import('./components/LegalPage'));
const LoginPage = lazy(() => import('./components/LoginPage'));

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const { theme, toggleTheme } = useTheme();

  const [appVersion, setAppVersion] = useState<AppVersion>(getStoredAppVersion);

  useEffect(() => {
    document.documentElement.setAttribute('data-app-version', appVersion);
    setStoredAppVersion(appVersion);
  }, [appVersion]);

  const setVersion = (v: AppVersion) => () => setAppVersion(v);

  const {
    conversations,
    isLoaded,
    activeConversationId,
    setActiveConversationId,
    isStreaming,
    error,
    createConversation,
    deleteConversation,
    restoreConversation,
    renameConversation,
    sendMessage,
    stopStreaming,
    clearAllConversations,
  } = useChat();

  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const [appToast, setAppToast] = useState<{ message: string } | null>(null);
  const [forceDisclaimerOpen, setForceDisclaimerOpen] = useState(false);
  const [konamiRain, setKonamiRain] = useState(false);
  const [chatFocusMode, setChatFocusMode] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [cheatsheetOpen, setCheatsheetOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(() => typeof navigator !== 'undefined' && !navigator.onLine);
  const draftsRef = useRef<Record<string, string>>({});
  const chatInputRef = useRef<HTMLTextAreaElement | null>(null);
  const commandPaletteOpenRef = useRef(false);
  const cheatsheetOpenRef = useRef(false);
  commandPaletteOpenRef.current = commandPaletteOpen;
  cheatsheetOpenRef.current = cheatsheetOpen;

  useEffect(() => {
    const onOnline = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  useEffect(() => {
    let touchStartX = 0;
    let touchEndX = 0;
    const minSwipeDistance = 50;
    const handleTouchStart = (e: TouchEvent) => { touchStartX = e.changedTouches[0].screenX; };
    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].screenX;
      const swipeDistance = touchEndX - touchStartX;
      if (touchStartX < 30 && swipeDistance > minSwipeDistance && !sidebarOpen) setSidebarOpen(true);
      if (swipeDistance < -minSwipeDistance && sidebarOpen) setSidebarOpen(false);
    };
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [sidebarOpen]);

  const draftConfig = useMemo(() => ({
    getDraft: (id: string) => {
      const mem = draftsRef.current[id];
      if (mem !== undefined) return mem;
      try {
        return localStorage.getItem(STORAGE_KEY_DRAFT_PREFIX + id) ?? '';
      } catch {
        return '';
      }
    },
    saveDraft: (id: string, text: string) => {
      draftsRef.current[id] = text;
      try {
        if (text) localStorage.setItem(STORAGE_KEY_DRAFT_PREFIX + id, text);
        else localStorage.removeItem(STORAGE_KEY_DRAFT_PREFIX + id);
      } catch {
        /* ignore */
      }
    }
  }), []);

  const path = useMemo(() => location.pathname.replace(/\/$/, '') || '/', [location.pathname]);
  const isLegalPage = path === '/aviso-legal' || path === '/privacidad' || path === '/cookies';
  const isLoginPage = path === '/iniciar-sesion' || path === '/login';
  const chatIdFromRoute = useMemo(() => {
    if (isLegalPage) return null;
    const match = location.pathname.match(/^\/c\/(.+)$/);
    return match ? match[1] : null;
  }, [location.pathname, isLegalPage]);

  const isLanding = !chatIdFromRoute && !isLegalPage && !isLoginPage;
  const loggedIn = isLoggedIn();

  /** Un solo color de fondo en toda la página de login: html y body usan el mismo que .app */
  useLayoutEffect(() => {
    const el = document.documentElement;
    if (isLoginPage) {
      el.setAttribute('data-lexia-page', 'login');
    } else {
      el.removeAttribute('data-lexia-page');
    }
    return () => el.removeAttribute('data-lexia-page');
  }, [isLoginPage]);

  /** Flujo: acceso → login; tras login → pantalla principal; al iniciar consulta → chat. No redirigir si ya está logueado y va explícitamente a login (ej. botón "Iniciar sesión" en la barra). */
  useEffect(() => {
    if (isLegalPage) return;
    if (!loggedIn && isLoginPage) return;
    if (!loggedIn) {
      navigate('/iniciar-sesion', { replace: true });
    }
  }, [loggedIn, isLoginPage, isLegalPage, navigate]);

  useEffect(() => {
    if (chatIdFromRoute) {
      setActiveConversationId(chatIdFromRoute);
    } else {
      setActiveConversationId(null);
    }
  }, [chatIdFromRoute, setActiveConversationId]);

  const activeConversation = useMemo(() => {
    if (!chatIdFromRoute) return null;
    return conversations.find((c) => c.id === chatIdFromRoute) || null;
  }, [chatIdFromRoute, conversations]);

  const handleNewConversation = useCallback(() => {
    const id = createConversation();
    navigate(`/c/${id}`);
  }, [createConversation, navigate]);

  const handleGoHome = useCallback(() => {
    setSidebarOpen(false);
    navigate('/');
  }, [navigate]);

  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  useKeyboardShortcuts({
    onNewChat: handleNewConversation,
    onOpenCommandPalette: () => setCommandPaletteOpen(true),
    onFocusChatInput: () => chatInputRef.current?.focus(),
    onCloseModalOrStop: () => {
      if (commandPaletteOpenRef.current) setCommandPaletteOpen(false);
      else if (cheatsheetOpenRef.current) setCheatsheetOpen(false);
      else stopStreaming();
    },
    onToggleSidebar: handleToggleSidebar,
    onToggleTheme: toggleTheme,
    onOpenCheatsheet: () => setCheatsheetOpen(true),
    disableGlobal: false,
  });

  const handleSelectConversation = useCallback((id: string) => {
    navigate(`/c/${id}`);
  }, [navigate]);

  const handleDeleteConversation = useCallback((id: string) => {
    deleteConversation(id);
    if (activeConversationId === id) {
      navigate('/');
    }
  }, [deleteConversation, activeConversationId, navigate]);

  const handleSendMessage = useCallback(async (content: string, options?: any) => {
    const id = await sendMessage(content, options);
    if (id) {
      navigate(`/c/${id}`);
    }
  }, [sendMessage, navigate]);

  /** Derecho de supresión RGPD: borra todas las conversaciones y preferencias en este dispositivo. */
  const handleDeleteAllData = useCallback(async () => {
    await del(STORAGE_KEY_CONVERSATIONS);
    localStorage.removeItem('lexia-theme');
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    localStorage.removeItem(DISCLAIMER_ACCEPTED_KEY);
    clearLoggedIn();
    clearAllConversations();
    setSidebarOpen(false);
    navigate('/iniciar-sesion');
    setAppToast({ message: 'Todos tus datos han sido eliminados.' });
  }, [clearAllConversations, navigate]);

  if (!isLoaded) {
    return (
      <div className="app app-loading" style={{ minHeight: '100dvh', backgroundColor: 'var(--color-bg-primary)' }} role="status" aria-live="polite">
        <div className="app-loading-content">
          <div className="app-loading-spinner" aria-hidden="true" />
          <p className="app-loading-text">Cargando Lexia…</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div
        className={`app ${sidebarOpen ? 'sidebar-open' : ''}${isLoginPage ? ' app--login' : ''}`}
        data-focus-mode={chatFocusMode ? '' : undefined}
      >
        {isOffline && (
          <div className="offline-banner" role="status" aria-live="polite">
            Sin conexión. Tus mensajes se enviarán cuando vuelvas.
          </div>
        )}
        <LegalDisclaimerModal
          forceOpen={forceDisclaimerOpen}
          onForceClose={() => setForceDisclaimerOpen(false)}
        />
        {!chatIdFromRoute && !isLoginPage && (
          <div className="app-corner-controls" role="group" aria-label="Accesos rápidos">
            <button
              type="button"
              className={`app-version-btn ${appVersion === 'default' ? 'active' : ''}`}
              onClick={setVersion('default')}
              aria-label="Versión 1"
              title="Versión 1"
            >
              1
            </button>
            <button
              type="button"
              className={`app-version-btn ${appVersion === 'alt' ? 'active' : ''}`}
              onClick={setVersion('alt')}
              aria-label="Versión 2"
              title="Versión 2"
            >
              2
            </button>
            <button
              type="button"
              className={`app-version-btn ${appVersion === 'v3' ? 'active' : ''}`}
              onClick={setVersion('v3')}
              aria-label="Versión 3"
              title="Versión 3 — Nueva experiencia"
            >
              3
            </button>
            <button
              type="button"
              className="app-corner-btn"
              onClick={handleNewConversation}
              aria-label="Ir al chat"
              title="Ir al chat (sin iniciar sesión)"
            >
              <Icon name="message-circle" size={14} strokeWidth={2} />
            </button>
            <button
              type="button"
              className="app-corner-btn"
              onClick={() => setForceDisclaimerOpen(true)}
              aria-label="Ver aviso legal de entrada"
              title="Ver aviso legal de entrada"
            >
              <Icon name="balanza" size={14} strokeWidth={2} />
            </button>
          </div>
        )}
        <a href="#main-content" className="skip-link">
          Saltar al contenido principal
        </a>

        {!isLoginPage && (
          <TopBar
            onGoHome={handleGoHome}
            onNewConversation={handleNewConversation}
            onToggleSidebar={handleToggleSidebar}
            sidebarOpen={sidebarOpen}
            theme={theme}
            onToggleTheme={toggleTheme}
            isLanding={isLanding}
            isChatView={!!chatIdFromRoute}
            isStreaming={isStreaming}
          />
        )}

        <Sidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onGoHome={handleGoHome}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
          onRestoreConversation={restoreConversation}
          onRenameConversation={renameConversation}
          onClearAll={clearAllConversations}
          onDeleteAllData={handleDeleteAllData}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main id="main-content" className={`app-main${isLoginPage ? ' app-main--login' : ''}`}>
          {chatIdFromRoute && (
            <ChatLeftBar
              onToggleSidebar={handleToggleSidebar}
              onGoHome={handleGoHome}
              onNewConversation={handleNewConversation}
              onOpenDisclaimer={() => setForceDisclaimerOpen(true)}
              sidebarOpen={sidebarOpen}
              appVersion={appVersion}
              onSetVersion={setAppVersion}
            />
          )}
          {chatIdFromRoute && (
            <button
              type="button"
              className="chat-theme-toggle"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
              title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
            >
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
            </button>
          )}
          <AnimatePresence mode="wait">
            <PageTransition
              key={isLegalPage ? 'legal' : isLoginPage ? 'login' : isLanding ? 'landing' : `chat-${chatIdFromRoute ?? 'none'}`}
            >
              {isLegalPage ? (
                <Suspense fallback={<LoadingLegal />}>
                  <LegalPage key={path} />
                </Suspense>
              ) : isLoginPage ? (
                <Suspense fallback={<LoadingLogin />}>
                  <LoginPage key={path} />
                </Suspense>
              ) : isLanding ? (
                <Suspense fallback={<SkeletonLanding />}>
                  {appVersion === 'v3' ? (
                    <LandingV3 key="landing-v3" />
                  ) : (
                    <LandingPage
                      key="landing"
                      onSendMessage={handleSendMessage}
                    />
                  )}
                </Suspense>
              ) : (
                <Suspense fallback={<SkeletonChat />}>
                  {activeConversation ? (
                    <ChatInterface
                      key={`chat-${chatIdFromRoute}`}
                      conversation={activeConversation}
                      isStreaming={isStreaming}
                      error={error}
                      onSendMessage={handleSendMessage}
                      onStopStreaming={stopStreaming}
                      draftConfig={draftConfig}
                      onKonamiTrigger={() => setKonamiRain(true)}
                      onFocusModeChange={setChatFocusMode}
                      chatInputRef={chatInputRef}
                      onShowToast={(msg) => setAppToast({ message: msg })}
                    />
                  ) : (
                    <SkeletonChat key="chat-loading" />
                  )}
                </Suspense>
              )}
            </PageTransition>
          </AnimatePresence>
        </main>
        <CookieBanner />
        {appToast && (
          <Toast
            message={appToast.message}
            onClose={() => setAppToast(null)}
          />
        )}
        <EmojiRain show={konamiRain} onComplete={() => setKonamiRain(false)} />
        {commandPaletteOpen && (
          <Suspense fallback={null}>
            <CommandPalette
              open={commandPaletteOpen}
              onClose={() => setCommandPaletteOpen(false)}
              items={conversations.map((c) => ({
                type: 'conversation' as const,
                id: c.id,
                title: c.title,
                description: c.messages.length > 0 ? c.messages[c.messages.length - 1].content.slice(0, 60) + (c.messages[c.messages.length - 1].content.length > 60 ? '…' : '') : undefined,
              }))}
              onSelectConversation={handleSelectConversation}
              onNewChat={handleNewConversation}
              onUploadDocument={() => {
                handleNewConversation();
                setAppToast({ message: 'Usa el botón de adjuntar en el chat para subir un documento.' });
              }}
              onToggleTheme={toggleTheme}
              onToggleSidebar={handleToggleSidebar}
              theme={theme}
            />
          </Suspense>
        )}
        {cheatsheetOpen && (
          <Suspense fallback={null}>
            <KeyboardShortcutsCheatsheet open={cheatsheetOpen} onClose={() => setCheatsheetOpen(false)} />
          </Suspense>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
