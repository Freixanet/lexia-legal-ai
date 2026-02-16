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

  // Persist conversations
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

  const sendMessage = useCallback(
    async (content: string) => {
      setError(null);
      let conversationId = activeConversationId;

      if (!conversationId) {
        conversationId = generateId();
        const newConversation: Conversation = {
          id: conversationId,
          title: generateTitle(content),
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        setConversations((prev) => [newConversation, ...prev]);
        setActiveConversationId(conversationId);
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

      // Get current messages for context
      const currentConv = conversations.find((c) => c.id === conversationId);
      const allMessages = [...(currentConv?.messages || []), userMessage];

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
    [activeConversationId, conversations]
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
  };
}
