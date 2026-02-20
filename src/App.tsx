import { AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, lazy, Suspense, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useChat } from './hooks/useChat';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { SkeletonLanding, SkeletonChat } from './components/ui/Skeleton';
import './components/ui/ErrorBoundary.css';
import './components/ui/Skeleton.css';
import './App.css';

const LandingPage = lazy(() => import('./components/LandingPage'));
const ChatInterface = lazy(() => import('./components/ChatInterface'));

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

  const chatIdFromRoute = useMemo(() => {
    const match = location.pathname.match(/^\/c\/(.+)$/);
    return match ? match[1] : null;
  }, [location.pathname]);

  const isLanding = !chatIdFromRoute;

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

  if (!isLoaded) {
    return <div className="app" style={{ minHeight: '100dvh', backgroundColor: 'var(--color-bg-primary)' }} />;
  }

  return (
    <ErrorBoundary>
      <div className={`app ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <a href="#main-content" className="skip-link">
          Saltar al contenido principal
        </a>

        <TopBar
          onGoHome={handleGoHome}
          onNewConversation={handleNewConversation}
          onToggleSidebar={handleToggleSidebar}
          sidebarOpen={sidebarOpen}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

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
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main id="main-content" className="app-main">
          <AnimatePresence mode="wait">
            {isLanding ? (
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
      </div>
    </ErrorBoundary>
  );
}

export default App;
