import { useState } from 'react';
import { useChat } from './hooks/useChat';
import Sidebar from './components/Sidebar';
import LandingPage from './components/LandingPage';
import ChatInterface from './components/ChatInterface';
import './App.css';

function App() {
  const {
    conversations,
    activeConversation,
    activeConversationId,
    setActiveConversationId,
    isStreaming,
    streamingContent,
    error,
    createConversation,
    deleteConversation,
    sendMessage,
    stopStreaming,
    clearAllConversations,
  } = useChat();

  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 769);

  const handleNewConversation = () => {
    createConversation();
  };

  const handleGoHome = () => {
    setActiveConversationId(null);
  };

  return (
    <div className={`app ${sidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Skip to main content — a11y */}
      <a href="#main-content" className="skip-link">
        Saltar al contenido principal
      </a>

      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={setActiveConversationId}
        onNewConversation={handleNewConversation}
        onDeleteConversation={deleteConversation}
        onClearAll={clearAllConversations}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main id="main-content" className="app-main">
        {activeConversation ? (
          <ChatInterface
            conversation={activeConversation}
            isStreaming={isStreaming}
            streamingContent={streamingContent}
            error={error}
            onSendMessage={sendMessage}
            onStopStreaming={stopStreaming}
            onOpenSidebar={() => setSidebarOpen(true)}
            sidebarOpen={sidebarOpen}
          />
        ) : (
          <LandingPage
            onSendMessage={sendMessage}
            onOpenSidebar={() => setSidebarOpen(true)}
            sidebarOpen={sidebarOpen}
          />
        )}

        {/* Home button when in chat */}
        {activeConversation && (
          <button
            id="home-button"
            className="app-home-btn"
            onClick={handleGoHome}
            aria-label="Volver al inicio"
          >
            <svg width="18" height="18" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <path d="M8 24V8h2.5v13.5H20V24H8Z" fill="currentColor"/>
              <circle cx="23" cy="10" r="2.5" fill="currentColor" opacity="0.6"/>
            </svg>
          </button>
        )}
      </main>
    </div>
  );
}

export default App;
