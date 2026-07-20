"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  Plus,
  LogIn,
  Code2,
  Timer,
  Network,
  GitBranch,
  MessageSquare,
  PanelLeftClose,
  PanelLeft,
  Pencil,
  Trash2,
  Check,
  X,
  MoreHorizontal,
  Download,
  Search,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAIChat } from "@/hooks/useAIChat";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChatMessage, ChatInput } from "@/components/ai";
import type { ChatInputHandle } from "@/components/ai/ChatInput";
import { aiApiClient, type AISessionData } from "@/lib/ai-api";

export const ChatClient = () => {
  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth();
  const { language } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<ChatInputHandle>(null);

  const {
    messages,
    isLoading,
    isLoadingHistory,
    error,
    sessions,
    currentSessionId,
    sendMessage,
    stopStreaming,
    startNewChat,
    loadSession,
    deleteSession,
    renameSession,
  } = useAIChat({
    contextType: "general",
    language,
    isAuthenticated,
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(
    (content: string) => {
      sendMessage(content);
      setInputValue("");
    },
    [sendMessage]
  );

  const handleQuickAction = useCallback((prompt: string) => {
    setInputValue(prompt);
    inputRef.current?.setValue(prompt);
    inputRef.current?.focus();
  }, []);

  // Export chat session as Markdown
  const exportSession = useCallback(
    async (sessionId: string) => {
      try {
        const session = sessions.find((s) => s.id === sessionId);
        const sessionTitle = session?.title || "Chat";

        // Get messages to export
        let exportMessages: Array<{ role: string; content: string }>;
        if (sessionId === currentSessionId) {
          exportMessages = messages;
        } else {
          const response = await aiApiClient.getSessionMessages(sessionId);
          exportMessages = response.data?.messages || [];
        }

        if (exportMessages.length === 0) {
          return;
        }

        // Build Markdown content
        const lines: string[] = [];
        lines.push(`# ${sessionTitle}`);
        lines.push("");
        lines.push(
          `*Exported on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}*`
        );
        lines.push("");
        lines.push("---");
        lines.push("");

        for (const msg of exportMessages) {
          const role = msg.role === "user" ? "You" : "AlgoPatterns AI";
          lines.push(`## ${role}`);
          lines.push("");
          lines.push(msg.content);
          lines.push("");
        }

        const markdown = lines.join("\n");

        // Create and download file
        const blob = new Blob([markdown], { type: "text/markdown" });
        const downloadUrl = URL.createObjectURL(blob);
        const downloadLink = document.createElement("a");
        downloadLink.href = downloadUrl;
        downloadLink.download = `${sessionTitle.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.md`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(downloadUrl);
      } catch {
        // Silent fail for export errors
      }
    },
    [sessions, messages, currentSessionId]
  );

  // Loading state while auth is initializing
  if (isAuthLoading) {
    return (
      <div
        className="flex h-[calc(100vh-64px)] items-center justify-center"
        style={{ background: "var(--bg-base)" }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-10 h-10 border-3 border-t-transparent rounded-full animate-spin"
            style={{
              borderColor: "var(--accent-1)",
              borderTopColor: "transparent",
            }}
          />
          <p style={{ color: "var(--text-2)" }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Unauthenticated state
  if (!isAuthenticated) {
    return (
      <div
        className="flex h-[calc(100vh-64px)] items-center justify-center"
        style={{ background: "var(--bg-base)" }}
      >
        <div className="max-w-md text-center px-4">
          <Image
            src="/thor_ai_icon.png"
            alt="Thor AI"
            width={80}
            height={80}
            className="mx-auto mb-6 rounded-full"
          />
          <h1
            className="text-2xl md:text-3xl font-bold mb-3"
            style={{ color: "var(--text-1)" }}
          >
            Thor AI
          </h1>
          <p className="mb-6" style={{ color: "var(--text-2)" }}>
            Your personal DSA tutor. Get help with any algorithm question, paste
            problems, analyze complexity, or visualize data structures.
          </p>
          <a
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 text-white font-medium transition-all hover:opacity-90"
            style={{
              background: "var(--accent-gradient)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <LogIn className="w-5 h-5" />
            Sign In to Start
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex h-[calc(100vh-64px)]"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Sidebar */}
      <div
        className={`flex-shrink-0 transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-0"
        } overflow-hidden`}
        style={{
          background: "var(--bg-surface)",
          borderRight: "1px solid var(--border-1)",
        }}
      >
        <div className="w-64 h-full flex flex-col">
          {/* Sidebar Header */}
          <div
            className="flex items-center justify-between p-3"
            style={{ borderBottom: "1px solid var(--border-1)" }}
          >
            <button
              onClick={startNewChat}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all flex-1"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-1)",
                borderRadius: "var(--radius-md)",
                color: "var(--text-1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--border-2)";
                e.currentTarget.style.background = "var(--bg-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-1)";
                e.currentTarget.style.background = "var(--bg-elevated)";
              }}
            >
              <Plus className="w-4 h-4" />
              New Chat
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 ml-2 transition-colors"
              style={{
                color: "var(--text-3)",
                borderRadius: "var(--radius-sm)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--bg-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
              title="Close sidebar"
            >
              <PanelLeftClose className="w-5 h-5" />
            </button>
          </div>

          {/* Search Input */}
          {sessions.length > 0 && (
            <div className="px-2 py-2">
              <div
                className="relative flex items-center"
                style={{
                  background: "var(--bg-elevated)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-1)",
                }}
              >
                <Search
                  className="w-4 h-4 absolute left-2.5 pointer-events-none"
                  style={{ color: "var(--text-3)" }}
                />
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-1.5 pl-8 pr-3 text-sm bg-transparent outline-none"
                  style={{ color: "var(--text-1)" }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 p-0.5"
                    style={{ color: "var(--text-3)" }}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto px-2 pb-2">
            {isLoadingHistory ? (
              <div
                className="text-xs text-center py-4"
                style={{ color: "var(--text-3)" }}
              >
                Loading...
              </div>
            ) : sessions.length === 0 ? (
              <div
                className="text-xs text-center py-8"
                style={{ color: "var(--text-3)" }}
              >
                <MessageSquare
                  className="w-8 h-8 mx-auto mb-2 opacity-50"
                  style={{ color: "var(--text-3)" }}
                />
                No conversations yet
              </div>
            ) : (
              <div className="space-y-1">
                {sessions
                  .filter((session) => {
                    if (!searchQuery.trim()) return true;
                    const query = searchQuery.toLowerCase();
                    const title = (session.title || "").toLowerCase();
                    return title.includes(query);
                  })
                  .map((session) => (
                    // skipcq: JS-0357 - HistoryItem is defined below in same file
                    <HistoryItem
                      key={session.id}
                      session={session}
                      isActive={session.id === currentSessionId}
                      onClick={() => loadSession(session.id)}
                      onDelete={() => deleteSession(session.id)}
                      onRename={(newTitle) =>
                        renameSession(session.id, newTitle)
                      }
                      onExport={() => exportSession(session.id)}
                    />
                  ))}
                {searchQuery.trim() &&
                  sessions.filter((s) =>
                    (s.title || "")
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase())
                  ).length === 0 && (
                    <div
                      className="text-xs text-center py-4"
                      style={{ color: "var(--text-3)" }}
                    >
                      No matching conversations
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sidebar toggle when closed */}
        {!sidebarOpen && (
          <div
            className="flex items-center px-4 py-2"
            style={{ borderBottom: "1px solid var(--border-1)" }}
          >
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 transition-colors"
              style={{
                color: "var(--text-3)",
                borderRadius: "var(--radius-sm)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--bg-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
              title="Open sidebar"
            >
              <PanelLeft className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              {/* skipcq: JS-0357 - WelcomeMessage is defined below in same file */}
              <WelcomeMessage
                userName={user?.name}
                onQuickAction={handleQuickAction}
              />
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-4 w-full">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {error && (
                <div className="text-center text-sm text-red-400 mt-2">
                  {error}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4" style={{ borderTop: "1px solid var(--border-1)" }}>
          <div className="max-w-3xl mx-auto">
            <ChatInput
              ref={inputRef}
              onSend={handleSend}
              isLoading={isLoading}
              onStop={stopStreaming}
              defaultValue={inputValue}
              placeholder="Ask any DSA question..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Welcome message component
const WelcomeMessage = ({
  userName,
  onQuickAction,
}: {
  userName?: string;
  onQuickAction: (prompt: string) => void;
}) => {
  const suggestions = [
    {
      icon: Code2,
      label: "Solve a problem",
      prompt: "Help me solve this problem: ",
      example: '"Two Sum with O(n) solution"',
    },
    {
      icon: Timer,
      label: "Analyze complexity",
      prompt: "Analyze the time and space complexity of this code:\n\n",
      example: '"Is my BFS O(n) or O(n²)?"',
    },
    {
      icon: Network,
      label: "Visualize with diagrams",
      prompt: "Draw a diagram showing how ",
      example: '"Show how quicksort partitions"',
    },
    {
      icon: GitBranch,
      label: "Compare approaches",
      prompt: "Compare and contrast ",
      example: '"BFS vs DFS for shortest path"',
    },
  ];

  const capabilities = [
    "Step-by-step problem solving",
    "Code optimization suggestions",
    "Pattern recognition and matching",
    "Interview prep and mock questions",
  ];

  return (
    <div className="flex flex-col items-center text-center px-4 max-w-2xl">
      <Image
        src="/thor_ai_icon.png"
        alt="Thor AI"
        width={64}
        height={64}
        className="mb-4 rounded-full"
      />
      <h2
        className="text-2xl font-bold mb-2"
        style={{ color: "var(--text-1)" }}
      >
        {userName ? `Hey ${userName.split(" ")[0]}!` : "Welcome!"}
      </h2>
      <p className="max-w-md mb-6" style={{ color: "var(--text-2)" }}>
        I&apos;m Thor AI, your personal DSA tutor. Ask me anything about
        algorithms, data structures, or coding patterns.
      </p>

      {/* Capability pills */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {capabilities.map((cap) => (
          <span
            key={cap}
            className="px-3 py-1 text-xs"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-1)",
              borderRadius: "var(--radius-full)",
              color: "var(--text-3)",
            }}
          >
            {cap}
          </span>
        ))}
      </div>

      {/* Quick action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
        {suggestions.map((item) => (
          <button
            key={item.label}
            onClick={() => onQuickAction(item.prompt)}
            className="p-4 text-left transition-all group"
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border-1)",
              borderRadius: "var(--radius-lg)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--border-2)";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "var(--shadow-lg)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-1)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <item.icon
                className="w-4 h-4"
                style={{ color: "var(--accent-1)" }}
              />
              <span
                className="font-medium text-sm"
                style={{ color: "var(--text-1)" }}
              >
                {item.label}
              </span>
            </div>
            <span className="text-xs italic" style={{ color: "var(--text-3)" }}>
              {item.example}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

// Confirmation Dialog Component
const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  variant = "danger",
}: {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "warning";
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: "bg-red-500/20 text-red-400",
      button: "bg-red-600 hover:bg-red-500",
    },
    warning: {
      icon: "bg-yellow-500/20 text-yellow-400",
      button: "bg-yellow-600 hover:bg-yellow-500",
    },
  };

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-50 p-0 m-auto backdrop:bg-black/60 border-0 rounded-lg shadow-2xl max-w-sm w-full overflow-hidden"
      style={{
        background: "var(--bg-surface)",
      }}
      onClose={onCancel}
    >
      <div
        className="w-full"
        style={{
          borderColor: "var(--border-1)",
        }}
      >
        {/* Header */}
        <div
          className="px-5 py-4 flex items-start gap-3"
          style={{ borderBottom: "1px solid var(--border-1)" }}
        >
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${variantStyles[variant].icon}`}
          >
            {variant === "danger" ? (
              <Trash2 className="w-5 h-5" />
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            )}
          </div>
          <div>
            <h3
              className="text-base font-semibold"
              style={{ color: "var(--text-1)" }}
            >
              {title}
            </h3>
            <p className="text-sm mt-1" style={{ color: "var(--text-3)" }}>
              {message}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div
          className="px-5 py-3 flex justify-end gap-2"
          style={{ background: "var(--bg-elevated)" }}
        >
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium rounded-md transition-colors"
            style={{
              color: "var(--text-2)",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--bg-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--bg-surface)";
            }}
          >
            {cancelLabel || "Cancel"}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium rounded-md text-white transition-colors ${variantStyles[variant].button}`}
          >
            {confirmLabel || "Confirm"}
          </button>
        </div>
      </div>
    </dialog>
  );
};

// History item component with three-dot menu
const HistoryItem = ({
  session,
  isActive,
  onClick,
  onDelete,
  onRename,
  onExport,
}: {
  session: AISessionData;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
  onRename: (newTitle: string) => void;
  onExport: () => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editTitle, setEditTitle] = useState(session.title || "");
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  const getRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isMenuOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuHeight = 160; // Approximate menu height
      const menuWidth = 140;

      // Default: position below button, aligned to right edge
      let top = rect.bottom + 4;
      let left = rect.right - menuWidth;

      // If menu would go below viewport, position above button
      if (top + menuHeight > window.innerHeight) {
        top = rect.top - menuHeight - 4;
      }

      // Ensure menu doesn't go off left edge
      if (left < 8) {
        left = 8;
      }

      setMenuPosition({ top, left });
    }
    setIsMenuOpen(!isMenuOpen);
  };

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditTitle(session.title || "");
    setIsEditing(true);
    setIsMenuOpen(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSaveEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRename(editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
    setEditTitle(session.title || "");
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    setShowDeleteConfirm(true);
  };

  const handleExportClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    onExport();
  };

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(false);
    onDelete();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (editTitle.trim()) {
        onRename(editTitle.trim());
      }
      setIsEditing(false);
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditTitle(session.title || "");
    }
  };

  if (isEditing) {
    return (
      <div
        className="w-full p-2 flex items-center gap-1"
        style={{
          borderRadius: "var(--radius-sm)",
          background: "var(--bg-hover)",
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 text-sm px-2 py-1 bg-transparent focus:outline-none"
          style={{
            color: "var(--text-1)",
            border: "1px solid var(--border-2)",
            borderRadius: "var(--radius-sm)",
          }}
        />
        <button
          onClick={handleSaveEdit}
          className="p-1 transition-colors"
          style={{ color: "var(--accent-1)" }}
          title="Save"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={handleCancelEdit}
          className="p-1 transition-colors"
          style={{ color: "var(--text-3)" }}
          title="Cancel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <>
      <div
        className="w-full text-left p-2 transition-all flex items-start gap-2 group relative"
        style={{
          borderRadius: "var(--radius-sm)",
          background:
            isActive || isHovered || isMenuOpen
              ? "var(--bg-hover)"
              : "transparent",
          cursor: "pointer",
        }}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <MessageSquare
          className="w-4 h-4 mt-0.5 flex-shrink-0"
          style={{ color: isActive ? "var(--accent-1)" : "var(--text-3)" }}
        />
        <div className="flex-1 min-w-0">
          <div
            className="text-sm truncate pr-8"
            style={{ color: isActive ? "var(--text-1)" : "var(--text-2)" }}
          >
            {session.title || "New conversation"}
          </div>
          <div
            className="text-[10px] mt-0.5"
            style={{ color: "var(--text-3)" }}
          >
            {getRelativeTime(session.last_message_at)}
          </div>
        </div>

        {/* Three-dot menu button */}
        {(isHovered || isMenuOpen) && (
          <div className="absolute right-1 top-1/2 -translate-y-1/2">
            <button
              ref={buttonRef}
              onClick={handleMenuClick}
              className="p-1.5 transition-colors rounded"
              style={{
                color: "var(--text-3)",
                background: isMenuOpen ? "var(--bg-elevated)" : "transparent",
              }}
              onMouseEnter={(e) => {
                if (!isMenuOpen) {
                  e.currentTarget.style.background = "var(--bg-elevated)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isMenuOpen) {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {/* Dropdown menu - rendered via portal to escape overflow clipping */}
            {isMenuOpen &&
              createPortal(
                <div
                  ref={menuRef}
                  className="fixed py-1 min-w-[140px] z-[9999] rounded-md shadow-lg"
                  style={{
                    top: menuPosition.top,
                    left: menuPosition.left,
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-1)",
                  }}
                >
                  <button
                    onClick={handleStartEdit}
                    className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors"
                    style={{ color: "var(--text-2)" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--bg-hover)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                    Rename
                  </button>
                  <button
                    onClick={handleExportClick}
                    className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors"
                    style={{ color: "var(--text-2)" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--bg-hover)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                  <div
                    className="my-1"
                    style={{ borderTop: "1px solid var(--border-1)" }}
                  />
                  <button
                    onClick={handleDeleteClick}
                    className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors text-red-400 hover:text-red-300"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(239, 68, 68, 0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>,
                document.body
              )}
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete conversation"
        message="Are you sure you want to delete this conversation? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        variant="danger"
      />
    </>
  );
};
