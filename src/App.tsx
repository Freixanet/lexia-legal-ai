import { AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, lazy, Suspense, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { del } from 'idb-keyval';
import { useChat } from './hooks/useChat';
import { STORAGE_KEY_CONVERSATIONS } from './constants/storage';
import { COOKIE_CONSENT_KEY } from './constants/cookies';
import { DISCLAIMER_ACCEPTED_KEY } from './constants/disclaimer';
import { isLoggedIn, clearLoggedIn } from './constants/auth';
import { getStoredAppVersion, setStoredAppVersion, type AppVersion } from './constants/appVersion';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import ChatLeftBar from './components/ChatLeftBar';
import ErrorBoundary from './components/ui/ErrorBoundary';
import CookieBanner from './components/CookieBanner';
import LegalDisclaimerModal from './components/LegalDisclaimerModal';
import Icon from './components/ui/Icon';
import Toast from './components/ui/Toast';
import { SkeletonLanding, SkeletonChat } from './components/ui/Skeleton';
import './components/ui/ErrorBoundary.css';
import './components/ui/Skeleton.css';
import './App.css';
import './styles/alt-version.css';

const LandingPage = lazy(() => import('./components/LandingPage'));
const ChatInterface = lazy(() => import('./components/ChatInterface'));
const LegalPage = lazy(() => import('./components/LegalPage'));
const LoginPage = lazy(() => import('./components/LoginPage'));

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('lexia-theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('lexia-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

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
  const draftsRef = useRef<Record<string, string>>({});

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
    getDraft: (id: string) => draftsRef.current[id] ?? '',
    saveDraft: (id: string, text: string) => {
      draftsRef.current[id] = text;
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

  /** Flujo: acceso → login; tras login → pantalla principal; al iniciar consulta → chat. */
  useEffect(() => {
    if (isLegalPage) return;
    if (!loggedIn && isLoginPage) return;
    if (!loggedIn) {
      navigate('/iniciar-sesion', { replace: true });
      return;
    }
    if (loggedIn && isLoginPage) {
      navigate('/', { replace: true });
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
    return <div className="app" style={{ minHeight: '100dvh', backgroundColor: 'var(--color-bg-primary)' }} />;
  }

  return (
    <ErrorBoundary>
      <div className={`app ${sidebarOpen ? 'sidebar-open' : ''}`}>
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

        <main id="main-content" className="app-main">
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
            {isLegalPage ? (
              <Suspense key="legal" fallback={<SkeletonLanding />}>
                <LegalPage key={path} />
              </Suspense>
            ) : isLoginPage ? (
              <Suspense key="login" fallback={<SkeletonLanding />}>
                <LoginPage key={path} />
              </Suspense>
            ) : isLanding ? (
              <Suspense key="landing" fallback={<SkeletonLanding />}>
                <LandingPage
                  key="landing"
                  onSendMessage={handleSendMessage}
                />
              </Suspense>
            ) : (
              <Suspense key="chat" fallback={<SkeletonChat />}>
                {activeConversation ? (
                  <ChatInterface
                    key={`chat-${chatIdFromRoute}`}
                    conversation={activeConversation}
                    isStreaming={isStreaming}
                    error={error}
                    onSendMessage={handleSendMessage}
                    onStopStreaming={stopStreaming}
                    draftConfig={draftConfig}
                  />
                ) : (
                  <SkeletonChat key="chat-loading" />
                )}
              </Suspense>
            )}
          </AnimatePresence>
        </main>
        <CookieBanner />
        {appToast && (
          <Toast
            message={appToast.message}
            onClose={() => setAppToast(null)}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
