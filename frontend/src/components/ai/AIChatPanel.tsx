"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useAIChat } from "@/hooks/useAIChat";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { QuickActions } from "./QuickActions";
import { PatternQuickActions } from "./PatternQuickActions";
import { useAuth } from "@/contexts/AuthContext";
import type { ContextType, PatternQuickAction } from "@/types/ai";

interface AIChatPanelProps {
  problemSlug?: string;
  problemTitle?: string;
  problemDescription?: string;
  patternId?: string;
  patternName?: string;
  patternDifficulty?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  activeSection?: string;
  sectionContent?: string;
  contextType?: ContextType;
  code?: string;
  language?: string;
  errorMessage?: string;
  initialMessage?: string;
  initialMessageKey?: number;
  isOpen: boolean;
  onClose: () => void;
}

export function AIChatPanel({
  problemSlug,
  problemTitle,
  problemDescription,
  patternId,
  patternName,
  patternDifficulty,
  timeComplexity,
  spaceComplexity,
  activeSection,
  sectionContent,
  contextType,
  code,
  language,
  errorMessage,
  initialMessage,
  initialMessageKey,
  isOpen,
  onClose,
}: AIChatPanelProps) {
  const { isAuthenticated } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hintLevel, setHintLevel] = useState(1);
  const [showHistory, setShowHistory] = useState(false);

  const {
    messages,
    isLoading,
    isLoadingHistory,
    error,
    archivedSessions,
    isViewingArchived,
    sendMessage,
    stopStreaming,
    clearMessages,
    startNewChat,
    loadArchivedSession,
  } = useAIChat({
    problemSlug,
    problemTitle,
    problemDescription,
    patternId,
    patternName,
    patternDifficulty,
    timeComplexity,
    spaceComplexity,
    sectionContent,
    activeSection,
    contextType,
    code,
    language,
    errorMessage,
  });

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleQuickActionResult = useCallback(
    (result: string, _type: "hint" | "review" | "explain") => {
      sendMessage(`[Received AI response]`, false);
    },
    [sendMessage]
  );

  const handlePatternQuickAction = useCallback(
    (_action: PatternQuickAction, message: string) => {
      sendMessage(message);
    },
    [sendMessage]
  );

  const handleHintUsed = useCallback(() => {
    setHintLevel((prev) => Math.min(prev + 1, 4));
  }, []);

  const initialMessageRef = useRef<number>(0);

  useEffect(() => {
    if (initialMessage && (initialMessageKey ?? 0) > initialMessageRef.current && isOpen) {
      initialMessageRef.current = initialMessageKey ?? 0;
      sendMessage(initialMessage);
    }
  }, [initialMessage, initialMessageKey, isOpen, sendMessage]);

  if (!isOpen) return null;

  return (
    <div className="flex flex-col h-full bg-gray-900 border-l border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">AI Assistant</span>
          <span className="text-[10px] text-gray-500 px-1.5 py-0.5 bg-gray-800 rounded">
            {isViewingArchived ? "Archived" : contextType === "pattern" ? "Pattern" : "Socratic"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {/* History toggle */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`p-1.5 rounded transition-colors ${
              showHistory ? "text-indigo-400 bg-indigo-900/30" : "text-gray-500 hover:text-white hover:bg-gray-800"
            }`}
            title="Chat history"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          {/* New chat button */}
          {messages.length > 0 && !isViewingArchived && (
            <button
              onClick={startNewChat}
              className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-800 rounded transition-colors"
              title="New chat"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
          {/* Back to active chat (when viewing archived) */}
          {isViewingArchived && (
            <button
              onClick={startNewChat}
              className="p-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-gray-800 rounded transition-colors"
              title="Back to active chat"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
          )}
          {messages.length > 0 && !isViewingArchived && (
            <button
              onClick={clearMessages}
              className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-800 rounded transition-colors"
              title="Clear"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-800 rounded transition-colors"
            title="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* History Panel */}
      {showHistory && (
        <div className="border-b border-gray-800 bg-gray-900/50 max-h-32 overflow-y-auto">
          {archivedSessions.length > 0 ? (
            <>
              <div className="px-3 py-1.5 text-[10px] text-gray-500 uppercase tracking-wide">Previous Chats</div>
              {archivedSessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => {
                    loadArchivedSession(session.id);
                    setShowHistory(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-gray-800 transition-colors border-t border-gray-800/50"
                >
                  <div className="text-xs text-gray-300 truncate">
                    {session.title || "Untitled chat"}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    {new Date(session.last_message_at).toLocaleDateString()} · {session.message_count} messages
                  </div>
                </button>
              ))}
            </>
          ) : (
            <div className="px-3 py-3 text-center text-xs text-gray-500">
              No saved chats yet. Click <span className="text-gray-400">+</span> to save the current one.
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      {isAuthenticated && contextType === "pattern" && patternId && patternName ? (
        <PatternQuickActions
          patternId={patternId}
          patternName={patternName}
          activeSection={activeSection || ""}
          onAction={handlePatternQuickAction}
        />
      ) : isAuthenticated && contextType !== "pattern" ? (
        <QuickActions
          problemSlug={problemSlug || ""}
          problemTitle={problemTitle || ""}
          problemDescription={problemDescription}
          code={code || ""}
          language={language || ""}
          errorMessage={errorMessage}
          hintLevel={hintLevel}
          onHintUsed={handleHintUsed}
          onResult={handleQuickActionResult}
        />
      ) : null}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3">
        {isLoadingHistory ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500" />
          </div>
        ) : !isAuthenticated ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <svg
              className="w-10 h-10 text-gray-600 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <p className="text-sm text-gray-400 mb-3">Sign in to use AI Assistant</p>
            <a
              href="/login"
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm transition-colors"
            >
              Sign In
            </a>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <p className="text-sm text-gray-400 mb-2">
              {contextType === "pattern"
                ? "Ask about the pattern or use quick actions above"
                : "Ask about the problem or use quick actions above"}
            </p>
            <p className="text-xs text-gray-500">I guide with questions, not answers</p>
          </div>
        ) : (
          <>
            {isViewingArchived && (
              <div className="mb-3 px-2 py-1.5 bg-indigo-900/20 border border-indigo-800/50 rounded text-xs text-indigo-300">
                Viewing archived chat (read-only)
              </div>
            )}
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}

        {error && (
          <div className="p-2 bg-red-900/20 border border-red-800 rounded text-red-400 text-xs">
            {error}
          </div>
        )}
      </div>

      {/* Input */}
      {isAuthenticated && !isViewingArchived && (
        <ChatInput
          onSend={sendMessage}
          onStop={stopStreaming}
          isLoading={isLoading}
          disabled={!isAuthenticated}
        />
      )}
    </div>
  );
}
