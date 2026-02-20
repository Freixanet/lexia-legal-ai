import { AnimatePresence } from 'framer-motion';
import { useState, useEffect, lazy, Suspense, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useChat } from './hooks/useChat';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { SkeletonLanding, SkeletonChat } from './components/ui/Skeleton';
import './components/ui/ErrorBoundary.css';
import './components/ui/Skeleton.css';
import './App.css';
import './styles/v1-overrides.css';

const LandingPageV2 = lazy(() => import('./components/LandingPage'));
const ChatInterfaceV2 = lazy(() => import('./components/ChatInterface'));
const LandingPageV1 = lazy(() => import('./components/v1/LandingPageV1'));
const ChatInterfaceV1 = lazy(() => import('./components/v1/ChatInterfaceV1'));

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('lexia-theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  const [designVersion, setDesignVersion] = useState<'v1' | 'v2'>(() => {
    const saved = localStorage.getItem('lexia-design');
    return saved === 'v1' ? 'v1' : 'v2';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('lexia-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (designVersion === 'v1') {
      document.documentElement.setAttribute('data-design', 'v1');
    } else {
      document.documentElement.removeAttribute('data-design');
    }
    localStorage.setItem('lexia-design', designVersion);
  }, [designVersion]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const toggleDesign = () => setDesignVersion(prev => prev === 'v1' ? 'v2' : 'v1');

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
  const [drafts, setDrafts] = useState<Record<string, string>>({});

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
    getDraft: (id: string) => drafts[id] || '',
    saveDraft: (id: string, text: string) => {
      setDrafts((prev) => ({ ...prev, [id]: text }));
    }
  }), [drafts]);

  // Parse route: determine if we're on landing or a chat
  const chatIdFromRoute = useMemo(() => {
    const match = location.pathname.match(/^\/c\/(.+)$/);
    return match ? match[1] : null;
  }, [location.pathname]);

  const isLanding = !chatIdFromRoute;

  // Sync activeConversationId with route
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

  const LandingPage = designVersion === 'v1' ? LandingPageV1 : LandingPageV2;
  const ChatInterface = designVersion === 'v1' ? ChatInterfaceV1 : ChatInterfaceV2;

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
          designVersion={designVersion}
          onToggleDesign={toggleDesign}
        />

        <Sidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
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
                  key={`landing-${designVersion}`}
                  onSendMessage={handleSendMessage}
                />
              </Suspense>
            ) : (
              <Suspense key="chat" fallback={<SkeletonChat />}>
                {activeConversation ? (
                  <ChatInterface
                    key={`chat-${designVersion}-${chatIdFromRoute}`}
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
