"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { aiApiClient, type AISessionData } from "@/lib/ai-api";
import type {
  AIMessage,
  ChatRequest,
  ConversationMessage,
  ContextType,
} from "@/types/ai";

interface UseAIChatOptions {
  problemSlug?: string;
  problemTitle?: string;
  problemDescription?: string;
  patternId?: string;
  patternName?: string;
  patternDifficulty?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  sectionContent?: string;
  activeSection?: string;
  contextType?: ContextType;
  code?: string;
  language?: string;
  errorMessage?: string;
  isAuthenticated?: boolean;
}

// skipcq: JS-0067
export function useAIChat(options: UseAIChatOptions = {}) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<AISessionData[]>([]);
  const [archivedSessions, setArchivedSessions] = useState<AISessionData[]>([]);
  const abortRef = useRef<(() => void) | null>(null);
  const historyLoadedRef = useRef<string | null>(null);

  // currentSessionId is an alias for sessionId for general chat page compatibility
  const currentSessionId = sessionId;

  // Load chat history and sessions when problem/pattern changes or for general chat
  useEffect(() => {
    const loadHistory = async () => {
      // Don't attempt until authenticated
      if (!options.isAuthenticated) return;

      const contextKey =
        options.problemSlug || options.patternId || options.contextType || "";

      // Don't reload if we already loaded for this context
      if (historyLoadedRef.current === contextKey) return;

      setIsLoadingHistory(true);
      try {
        // Load sessions (for general chat mode, load all sessions)
        const sessionsRes = await aiApiClient.getSessions();

        if (sessionsRes.success && sessionsRes.data.sessions) {
          // Store all sessions for general chat mode
          setSessions(sessionsRes.data.sessions);

          // For problem/pattern context, find and load the active session
          if (options.problemSlug || options.patternId) {
            const session = sessionsRes.data.sessions.find((s) => {
              if (options.problemSlug)
                return s.problem_slug === options.problemSlug && !s.is_archived;
              if (options.patternId)
                return s.pattern_id === options.patternId && !s.is_archived;
              return false;
            });

            if (session) {
              setSessionId(session.id);
              const messagesRes = await aiApiClient.getSessionMessages(
                session.id
              );
              if (messagesRes.success && messagesRes.data.messages) {
                const loadedMessages: AIMessage[] =
                  messagesRes.data.messages.map((m) => ({
                    id: m.id,
                    role: m.role,
                    content: m.content,
                    timestamp: new Date(m.created_at),
                  }));
                setMessages(loadedMessages);
              }
            }
          }
        }

        // Load archived sessions for problem/pattern context
        if (options.problemSlug || options.patternId) {
          const archivedRes = await aiApiClient.getArchivedSessions(
            options.problemSlug,
            options.patternId
          );
          if (archivedRes.success && archivedRes.data.sessions) {
            setArchivedSessions(archivedRes.data.sessions);
          }
        }

        historyLoadedRef.current = contextKey;
      } catch (err) {
        console.warn("[useAIChat] Failed to load history:", err);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadHistory();
  }, [
    options.problemSlug,
    options.patternId,
    options.contextType,
    options.isAuthenticated,
  ]);

  const sendMessage = useCallback(
    async (content: string, useStreaming = true) => {
      if (!content.trim()) return;

      setError(null);
      setIsLoading(true);

      const userMessage: AIMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);

      const assistantMessageId = `assistant-${Date.now()}`;
      const assistantMessage: AIMessage = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Build conversation history from existing messages (excluding the new user message we just added)
      // Get current messages state to build history
      const currentMessages = [...messages, userMessage];
      const history: ConversationMessage[] = currentMessages
        .filter((msg) => !msg.isStreaming && msg.content)
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

      const req: ChatRequest = {
        message: content.trim(),
        problemSlug: options.problemSlug,
        problemTitle: options.problemTitle,
        problemDescription: options.problemDescription,
        patternId: options.patternId,
        patternName: options.patternName,
        patternDifficulty: options.patternDifficulty,
        timeComplexity: options.timeComplexity,
        spaceComplexity: options.spaceComplexity,
        sectionContent: options.sectionContent,
        activeSection: options.activeSection,
        contextType: options.contextType,
        code: options.code,
        language: options.language,
        history: history.length > 0 ? history : undefined,
        errorMessage: options.errorMessage,
      };

      if (useStreaming) {
        abortRef.current = aiApiClient.chatStream(
          req,
          (chunk) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, content: msg.content + chunk }
                  : msg
              )
            );
          },
          (err) => {
            setError(err);
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? {
                      ...msg,
                      isStreaming: false,
                      content: msg.content || "Sorry, an error occurred.",
                    }
                  : msg
              )
            );
            setIsLoading(false);
          },
          (sessionId?: string) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, isStreaming: false }
                  : msg
              )
            );
            if (sessionId) setSessionId(sessionId);
            setIsLoading(false);
            abortRef.current = null;
          }
        );
      } else {
        try {
          const response = await aiApiClient.chat(req);
          if (response.success) {
            setSessionId(response.data.sessionId);
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? {
                      ...msg,
                      content: response.data.content,
                      isStreaming: false,
                    }
                  : msg
              )
            );
          } else {
            setError(response.error?.message || "Failed to get response");
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? {
                      ...msg,
                      content: "Sorry, an error occurred.",
                      isStreaming: false,
                    }
                  : msg
              )
            );
          }
        } catch (err) {
          setError((err as Error).message);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? {
                    ...msg,
                    content: "Sorry, an error occurred.",
                    isStreaming: false,
                  }
                : msg
            )
          );
        }
        setIsLoading(false);
      }
    },
    [
      options.problemSlug,
      options.problemTitle,
      options.problemDescription,
      options.patternId,
      options.patternName,
      options.patternDifficulty,
      options.timeComplexity,
      options.spaceComplexity,
      options.sectionContent,
      options.activeSection,
      options.contextType,
      options.code,
      options.language,
      options.errorMessage,
      messages,
    ]
  );

  const stopStreaming = useCallback(() => {
    if (abortRef.current) {
      abortRef.current();
      abortRef.current = null;
      setIsLoading(false);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.isStreaming ? { ...msg, isStreaming: false } : msg
        )
      );
    }
  }, []);

  const clearMessages = useCallback(async () => {
    // Clear from database if we have a session
    if (sessionId) {
      try {
        await aiApiClient.clearSession(sessionId);
      } catch (err) {
        console.warn("[useAIChat] Failed to clear session:", err);
      }
    }
    setMessages([]);
    setError(null);
    setSessionId(null);
    historyLoadedRef.current = null;
  }, [sessionId]);

  // Archive current chat and start fresh
  const startNewChat = useCallback(async () => {
    if (!sessionId || messages.length === 0) {
      // No session or no messages, just clear
      setMessages([]);
      setError(null);
      return;
    }

    try {
      // Generate title from first user message
      const firstUserMsg = messages.find((m) => m.role === "user");
      const title = firstUserMsg?.content.slice(0, 100) || "Chat";

      await aiApiClient.archiveSession(sessionId, title);

      // Add to archived sessions list
      if (options.problemSlug || options.patternId) {
        const archivedRes = await aiApiClient.getArchivedSessions(
          options.problemSlug,
          options.patternId
        );
        if (archivedRes.success && archivedRes.data.sessions) {
          setArchivedSessions(archivedRes.data.sessions);
        }
      }
    } catch (err) {
      console.warn("[useAIChat] Failed to archive session:", err);
    }

    setMessages([]);
    setError(null);
    setSessionId(null);
  }, [sessionId, messages, options.problemSlug, options.patternId]);

  // Load messages from an archived session (read-only view)
  const loadArchivedSession = useCallback(async (archivedSessionId: string) => {
    setIsLoadingHistory(true);
    try {
      const messagesRes =
        await aiApiClient.getSessionMessages(archivedSessionId);
      if (messagesRes.success && messagesRes.data.messages) {
        const loadedMessages: AIMessage[] = messagesRes.data.messages.map(
          (m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: new Date(m.created_at),
          })
        );
        setMessages(loadedMessages);
        setSessionId(archivedSessionId);
      }
    } catch (err) {
      console.warn("[useAIChat] Failed to load archived session:", err);
      setError("Failed to load archived chat");
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // Load a session by ID (for general chat mode)
  const loadSession = useCallback(async (targetSessionId: string) => {
    setIsLoadingHistory(true);
    try {
      const messagesRes = await aiApiClient.getSessionMessages(targetSessionId);
      if (messagesRes.success && messagesRes.data.messages) {
        const loadedMessages: AIMessage[] = messagesRes.data.messages.map(
          (m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: new Date(m.created_at),
          })
        );
        setMessages(loadedMessages);
        setSessionId(targetSessionId);
        setError(null);
      }
    } catch (err) {
      console.warn("[useAIChat] Failed to load session:", err);
      setError("Failed to load chat session");
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // Delete a session (removes the entire session, not just messages)
  const deleteSession = useCallback(
    async (targetSessionId: string) => {
      try {
        await aiApiClient.deleteSession(targetSessionId);
        // Remove from sessions list
        setSessions((prev) => prev.filter((s) => s.id !== targetSessionId));
        // If we deleted the current session, clear messages
        if (targetSessionId === sessionId) {
          setMessages([]);
          setSessionId(null);
        }
      } catch (err) {
        console.warn("[useAIChat] Failed to delete session:", err);
        setError("Failed to delete chat session");
      }
    },
    [sessionId]
  );

  // Rename a session
  const renameSession = useCallback(
    async (targetSessionId: string, newTitle: string) => {
      try {
        await aiApiClient.archiveSession(targetSessionId, newTitle);
        // Update sessions list with new title
        setSessions((prev) =>
          prev.map((s) =>
            s.id === targetSessionId ? { ...s, title: newTitle } : s
          )
        );
      } catch (err) {
        console.warn("[useAIChat] Failed to rename session:", err);
        setError("Failed to rename chat session");
      }
    },
    []
  );

  // Check if current session is archived (read-only)
  const isViewingArchived = sessionId
    ? archivedSessions.some((s) => s.id === sessionId)
    : false;

  return {
    messages,
    isLoading,
    isLoadingHistory,
    error,
    sessionId,
    currentSessionId,
    sessions,
    archivedSessions,
    isViewingArchived,
    sendMessage,
    stopStreaming,
    clearMessages,
    startNewChat,
    loadSession,
    deleteSession,
    renameSession,
    loadArchivedSession,
  };
}
