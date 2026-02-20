import { AnimatePresence } from 'framer-motion';
import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useChat } from './hooks/useChat';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import './App.css';

// Lazy loaded routes for Code Splitting
const LandingPage = lazy(() => import('./components/LandingPage'));
const ChatInterface = lazy(() => import('./components/ChatInterface'));

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Theme Management
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

  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 769);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  // Swipe gesture to open sidebar on mobile
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
      
      // Only trigger if swipe started from left edge (first 30px)
      if (touchStartX < 30 && swipeDistance > minSwipeDistance && !sidebarOpen) {
        setSidebarOpen(true);
      }
      // Swipe left to close
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

  // Sync activeConversationId with URL
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
      // User is already on Home, improve UX by autofocusing the chat request input
      // instead of performing a dummy navigation loop
      const input = document.getElementById('landing-search-input');
      if (input) {
         input.focus();
      }
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
    // If it's a new conversation from root, navigate to its URL once created
    if (id && location.pathname === '/') {
       navigate(`/c/${id}`);
    }
  };

  if (!isLoaded) {
    return <div className="app" style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)' }} />;
  }

  return (
    <div className={`app ${sidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Skip to main content — a11y */}
      <a href="#main-content" className="skip-link">
        Saltar al contenido principal
      </a>

      {/* Persistent top bar */}
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
        <Suspense fallback={<div className="app" style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)' }} />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={
                <LandingPage key="landing-page" onSendMessage={handleSendMessage} />
              } />
              <Route path="/c/:id" element={
                activeConversation ? (
                  <ChatInterface
                    key="chat-interface"
                    conversation={activeConversation}
                    isStreaming={isStreaming}
                    error={error}
                    onSendMessage={handleSendMessage}
                    onStopStreaming={stopStreaming}
                    draftConfig={draftConfig}
                  />
                ) : (
                  <div style={{ padding: '2rem', color: 'var(--color-primary-light)', textAlign: 'center' }}>
                    Conversación no encontrada.
                  </div>
                )
              } />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>
    </div>
  );
}

export default App;
