import { useState, useCallback, useRef, useEffect } from 'react';
import { get, set } from 'idb-keyval';
import { streamChat, generateId, generateTitle, generateSmartTitle, type Message, type Conversation, type Attachment } from '../services/api';

const STORAGE_KEY_CONVERSATIONS = 'lexia_conversations';

export function useChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const conversationsRef = useRef(conversations);
  const isInitialLoad = useRef(true);

  // Keep ref in sync ensuring async callbacks always have latest state
  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  // Initial load and migration
  useEffect(() => {
    async function loadData() {
      try {
        // Try idb first
        const idbData = await get<Conversation[]>(STORAGE_KEY_CONVERSATIONS);
        
        if (idbData && idbData.length > 0) {
          setConversations(idbData);
        } else {
          // Migration from localStorage
          const localDataRaw = localStorage.getItem(STORAGE_KEY_CONVERSATIONS);
          if (localDataRaw) {
            const localData = JSON.parse(localDataRaw) as Conversation[];
            setConversations(localData);
            await set(STORAGE_KEY_CONVERSATIONS, localData);
            localStorage.removeItem(STORAGE_KEY_CONVERSATIONS);
            console.log("Migrated discussions from localStorage to IndexedDB");
          }
        }
      } catch (err) {
        console.error("Failed to load conversations from IndexedDB", err);
      } finally {
        setIsLoaded(true);
      }
    }
    loadData();
  }, []);

  // Persist conversations
  useEffect(() => {
    if (isInitialLoad.current) {
      if (isLoaded) {
          isInitialLoad.current = false;
      }
      return;
    }
    set(STORAGE_KEY_CONVERSATIONS, conversations).catch(console.error);
  }, [conversations, isLoaded]);

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
    async (content: string, options?: { jurisdiction?: string; sourcesEnabled?: boolean; attachment?: Attachment }) => {
      setError(null);
      let conversationId = activeConversationId;
      
      const currentConversations = conversationsRef.current;

      if (!conversationId) {
        conversationId = generateId();
        const newConversation: Conversation = {
          id: conversationId,
          title: generateTitle(content || (options?.attachment ? `Documento: ${options.attachment.name}` : 'Nueva consulta')),
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        // Optimistic update for UI
        setConversations((prev) => [newConversation, ...prev]);
        setActiveConversationId(conversationId);
      }

      const userMessage: Message = {
        id: generateId(),
        role: 'user',
        content,
        timestamp: Date.now(),
        ...(options?.attachment ? { attachments: [options.attachment] } : {})
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
      let allMessages: Message[] = [];
      const existingConv = conversationsRef.current.find((c) => c.id === conversationId);
      
      if (existingConv) {
         allMessages = [...existingConv.messages, userMessage];
      } else {
         allMessages = [userMessage];
      }

      if (allMessages.length === 0) allMessages = [userMessage];

      // --- SMART TITLE GENERATION ---
      // Trigger if it's a new conversation OR an existing empty conversation
      const isNewConversation = !activeConversationId;
      const isEmptyConversation = currentConversations.find(c => c.id === conversationId)?.messages.length === 0;

      if (isNewConversation || isEmptyConversation) {
        // Enriquecer el contexto si hay un adjunto para mejorar la generación del título
        const titleContext = options?.attachment 
            ? `Texto: "${content}". Archivo adjunto: "${options.attachment.name}"`
            : content;
            
        generateSmartTitle(titleContext).then((smartTitle) => {
          setConversations((prev) => 
            prev.map((c) => (c.id === conversationId ? { ...c, title: smartTitle } : c))
          );
        });
      }

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
      }, {
        jurisdiction: options?.jurisdiction ?? 'es',
        sourcesEnabled: options?.sourcesEnabled ?? true
      }, abortController.signal);

      return conversationId;
    },
    [activeConversationId]
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
    isLoaded,
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
