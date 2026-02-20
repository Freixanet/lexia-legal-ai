import { AnimatePresence } from 'framer-motion';
import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
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
    activeConversation,
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

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].screenX;
      const swipeDistance = touchEndX - touchStartX;

      if (touchStartX < 30 && swipeDistance > minSwipeDistance && !sidebarOpen) {
        setSidebarOpen(true);
      }
      if (swipeDistance < -minSwipeDistance && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [sidebarOpen]);

  const draftConfig = {
    getDraft: (id: string) => drafts[id] || '',
    saveDraft: (id: string, text: string) => {
      setDrafts((prev) => ({ ...prev, [id]: text }));
    }
  };

  useEffect(() => {
    const match = location.pathname.match(/^\/c\/(.+)$/);
    if (match && match[1]) {
      setActiveConversationId(match[1]);
    } else if (location.pathname === '/') {
      setActiveConversationId(null);
    }
  }, [location.pathname, setActiveConversationId]);

  const handleNewConversation = () => {
    setActiveConversationId(null);
    if (location.pathname === '/') {
      const input = document.getElementById('landing-search-input');
      if (input) input.focus();
    } else {
      navigate('/');
    }
  };

  const handleGoHome = () => {
    setActiveConversationId(null);
    navigate('/');
  };

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleSelectConversation = (id: string) => {
    navigate(`/c/${id}`);
  };

  const handleDeleteConversation = (id: string) => {
    deleteConversation(id);
    if (activeConversationId === id || location.pathname === `/c/${id}`) {
      navigate('/');
    }
  };

  const handleSendMessage = async (content: string, options?: any) => {
    const id = await sendMessage(content, options);
    if (id && location.pathname === '/') {
      navigate(`/c/${id}`);
    }
  };

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
            <Routes location={location} key={location.pathname + designVersion}>
              <Route path="/" element={
                <Suspense fallback={<SkeletonLanding />}>
                  <LandingPage key={`landing-${designVersion}`} onSendMessage={handleSendMessage} />
                </Suspense>
              } />
              <Route path="/c/:id" element={
                <Suspense fallback={<SkeletonChat />}>
                  {activeConversation ? (
                    <ChatInterface
                      key={`chat-${designVersion}`}
                      conversation={activeConversation}
                      isStreaming={isStreaming}
                      error={error}
                      onSendMessage={handleSendMessage}
                      onStopStreaming={stopStreaming}
                      draftConfig={draftConfig}
                    />
                  ) : (
                    <div style={{ padding: '2rem', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                      Conversación no encontrada.
                    </div>
                  )}
                </Suspense>
              } />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;
