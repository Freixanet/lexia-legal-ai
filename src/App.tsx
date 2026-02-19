import { AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useChat } from './hooks/useChat';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import LandingPage from './components/LandingPage';
import ChatInterface from './components/ChatInterface';
import './App.css';

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    conversations,
    isLoaded,
    activeConversation,
    activeConversationId,
    setActiveConversationId,
    isStreaming,
    streamingContent,
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
    // Navigate home, useChat will generate ID on sendMessage
    setActiveConversationId(null);
    navigate('/');
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
    <div className="app">
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
                  streamingContent={streamingContent}
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
      </main>
    </div>
  );
}

export default App;
