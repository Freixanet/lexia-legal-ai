import { useState } from 'react';
import { useChat } from './hooks/useChat';
import TopBar from './components/TopBar';
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
    restoreConversation,
    renameConversation,
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

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

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
      />

      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={setActiveConversationId}
        onNewConversation={handleNewConversation}
        onDeleteConversation={deleteConversation}
        onRestoreConversation={restoreConversation}
        onRenameConversation={renameConversation}
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
          />
        ) : (
          <LandingPage
            onSendMessage={sendMessage}
          />
        )}
      </main>
    </div>
  );
}

export default App;
