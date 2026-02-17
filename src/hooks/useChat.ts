import { useState, useCallback, useRef, useEffect } from 'react';
import { streamChat, generateId, generateTitle, type Message, type Conversation } from '../services/api';

const STORAGE_KEY_CONVERSATIONS = 'lexia_conversations';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable
  }
}

export function useChat() {
  const [conversations, setConversations] = useState<Conversation[]>(() =>
    loadFromStorage(STORAGE_KEY_CONVERSATIONS, [])
  );
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const conversationsRef = useRef(conversations);

  // Keep ref in sync ensuring async callbacks always have latest state
  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  // Persist conservations
  useEffect(() => {
    saveToStorage(STORAGE_KEY_CONVERSATIONS, conversations);
  }, [conversations]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;

  const createConversation = useCallback((): string => {
    const id = generateId();
    const newConversation: Conversation = {
      id,
      title: 'Nueva consulta',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setConversations((prev) => [newConversation, ...prev]);
    setActiveConversationId(id);
    setError(null);
    return id;
  }, []);

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversationId === id) {
        setActiveConversationId(null);
      }
    },
    [activeConversationId]
  );

  const restoreConversation = useCallback((conversation: Conversation) => {
    setConversations((prev) => {
      // Avoid duplicates
      if (prev.some(c => c.id === conversation.id)) return prev;
      // Insert back (sorting will be handled by Sidebar, but we prepend for now or just add)
      return [conversation, ...prev].sort((a, b) => b.updatedAt - a.updatedAt);
    });
  }, []);

  const renameConversation = useCallback((id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
    );
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      setError(null);
      let conversationId = activeConversationId;
      
      const currentConversations = conversationsRef.current;

      if (!conversationId) {
        conversationId = generateId();
        const newConversation: Conversation = {
          id: conversationId,
          title: generateTitle(content),
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        // Optimistic update for UI
        setConversations((prev) => [newConversation, ...prev]);
        setActiveConversationId(conversationId);
        
        // Critical: Also update ref immediately for current scope logic if needed, 
        // ALTHOUGH we are about to use currentConversations which is still old.
        // Better strategy: construct the *new* list locally for streamChat context.
        // We will push the new convo to currentConversations array clone? 
        // No, currentConversations is the ref value.
        // Actually, if we just created it, we know it's empty.
      }

      const userMessage: Message = {
        id: generateId(),
        role: 'user',
        content,
        timestamp: Date.now(),
      };

      // Update conversation with user message
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== conversationId) return c;
          const isFirst = c.messages.length === 0;
          return {
            ...c,
            title: isFirst ? generateTitle(content) : c.title,
            messages: [...c.messages, userMessage],
            updatedAt: Date.now(),
          };
        })
      );

      // Start streaming
      setIsStreaming(true);
      setStreamingContent('');

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // Get current messages for context using REF source of truth
      // If we just created a conversation, it won't be in currentConversations yet (from Ref).
      // So we must handle that case.
      
      let allMessages: Message[] = [];
      
      // If activeConversationId was null, we just created a new one. 
      // The old ref doesn't have it.
      // So effectively context is [userMessage].
      
      // However, if conversationId existed:
      const existingConv = conversationsRef.current.find((c) => c.id === conversationId);
      
      if (existingConv) {
         allMessages = [...existingConv.messages, userMessage];
      } else {
         // New conversation scenario or race condition.
         // If we just created it (conversationId defined above), previous messages are empty.
         allMessages = [userMessage];
      }

      // Safe check: ensure allMessages is not empty
      if (allMessages.length === 0) allMessages = [userMessage];

      await streamChat(allMessages, {
        onToken: (token) => {
          setStreamingContent((prev) => prev + token);
        },
        onComplete: (fullText) => {
          const assistantMessage: Message = {
            id: generateId(),
            role: 'assistant',
            content: fullText,
            timestamp: Date.now(),
          };

          setConversations((prev) =>
            prev.map((c) => {
              if (c.id !== conversationId) return c;
              return {
                ...c,
                messages: [...c.messages, assistantMessage],
                updatedAt: Date.now(),
              };
            })
          );

          setIsStreaming(false);
          setStreamingContent('');
        },
        onError: (errorMsg) => {
          setError(errorMsg);
          setIsStreaming(false);
          setStreamingContent('');
        },
      }, abortController.signal);
    },
    [activeConversationId] // removed conversations from dependency
  );

  const stopStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
    setStreamingContent('');
  }, []);

  const clearAllConversations = useCallback(() => {
    setConversations([]);
    setActiveConversationId(null);
  }, []);

  return {
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
    restoreConversation,
    renameConversation,
  };
}
