import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import type { AIMessage } from "@/types/ai";

// Mocks – hoisted before imports

vi.mock("@/lib/ai-api", () => ({
  aiApiClient: {
    chatStream: vi.fn(),
    getHint: vi.fn(),
    reviewCode: vi.fn(),
    explainError: vi.fn(),
    getSessions: vi.fn(),
    getArchivedSessions: vi.fn(),
    getSessionMessages: vi.fn(),
    clearSession: vi.fn(),
    archiveSession: vi.fn(),
    chat: vi.fn(),
  },
}));

vi.mock("@/hooks/useAIChat", () => ({
  useAIChat: vi.fn(),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn(),
}));

// Imports

import { useAIChat } from "@/hooks/useAIChat";
import { useAuth } from "@/contexts/AuthContext";
import { aiApiClient, type AISessionData } from "@/lib/ai-api";
import { AIChatPanel } from "@/components/ai/AIChatPanel";
import { AIToggleButton } from "@/components/ai/AIToggleButton";
import { ChatInput } from "@/components/ai/ChatInput";
import { ChatMessage } from "@/components/ai/ChatMessage";
import { InlineAI } from "@/components/ai/InlineAI";
import { PatternQuickActions } from "@/components/ai/PatternQuickActions";
import { QuickActions } from "@/components/ai/QuickActions";

// Helpers

function createMessage(overrides: Partial<AIMessage> = {}): AIMessage {
  return {
    id: `msg-${Math.random().toString(36).slice(2, 8)}`,
    role: "assistant",
    content: "Default response",
    timestamp: new Date("2024-06-01T12:00:00Z"),
    ...overrides,
  };
}

const baseChatMock = () => ({
  messages: [] as AIMessage[],
  isLoading: false,
  isLoadingHistory: false,
  error: null as string | null,
  sessionId: null as string | null,
  archivedSessions: [] as AISessionData[],
  isViewingArchived: false,
  sendMessage: vi.fn(),
  stopStreaming: vi.fn(),
  clearMessages: vi.fn(),
  startNewChat: vi.fn(),
  loadArchivedSession: vi.fn(),
});

const baseAuthMock = () => ({
  isAuthenticated: true,
  isLoading: false,
  user: { id: "u1", email: "a@b.com", name: "Test", emailVerified: true },
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  refreshUser: vi.fn(),
  loginWithGoogle: vi.fn(),
  handleGoogleCallback: vi.fn(),
});

const defaultPanelProps = {
  problemSlug: "two-sum",
  problemTitle: "Two Sum",
  problemDescription: "Find two numbers",
  code: "function twoSum() {}",
  language: "javascript",
  isOpen: true,
  onClose: vi.fn(),
};

function fireKeyDown(
  el: HTMLElement,
  key: string,
  opts: { shiftKey?: boolean } = {}
) {
  fireEvent.keyDown(el, { key, ...opts });
}

// AIChatPanel

describe("AIChatPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAIChat).mockReturnValue(baseChatMock());
    vi.mocked(useAuth).mockReturnValue(baseAuthMock());
    Element.prototype.scrollIntoView = vi.fn() as unknown as (
      opts?: ScrollIntoViewOptions
    ) => void;
  });

  it("renders content when open", () => {
    render(<AIChatPanel {...defaultPanelProps} />);
    expect(screen.getByText("Thor AI")).toBeInTheDocument();
  });

  it("renders Thor AI icon in the header", () => {
    render(<AIChatPanel {...defaultPanelProps} />);
    const icon = screen.getByAltText("Thor AI");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute("src");
  });

  it("returns null when closed", () => {
    const { container } = render(
      <AIChatPanel {...defaultPanelProps} isOpen={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("close button calls onClose", () => {
    const onClose = vi.fn();
    render(<AIChatPanel {...defaultPanelProps} onClose={onClose} />);
    const buttons = screen.getAllByRole("button");
    const closeBtn = buttons.find((b) => b.getAttribute("title") === "Close");
    expect(closeBtn).toBeDefined();
    fireEvent.click(closeBtn!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("shows history toggle button when archivedSessions exist", () => {
    vi.mocked(useAIChat).mockReturnValue({
      ...baseChatMock(),
      archivedSessions: [
        {
          id: "s1",
          user_id: "u1",
          title: "Old chat",
          is_archived: true,
          started_at: new Date().toISOString(),
          last_message_at: new Date().toISOString(),
          message_count: 3,
          total_tokens: 100,
        },
      ],
    });
    render(<AIChatPanel {...defaultPanelProps} />);
    const btn = screen.getByTitle("Chat history");
    expect(btn).toBeInTheDocument();
  });

  it("toggles history panel when history button is clicked", () => {
    vi.mocked(useAIChat).mockReturnValue({
      ...baseChatMock(),
      archivedSessions: [
        {
          id: "s1",
          user_id: "u1",
          title: "Old chat",
          is_archived: true,
          started_at: new Date().toISOString(),
          last_message_at: new Date().toISOString(),
          message_count: 3,
          total_tokens: 100,
        },
      ],
    });
    render(<AIChatPanel {...defaultPanelProps} />);
    const historyBtn = screen.getByTitle("Chat history");

    expect(screen.queryByText("Previous Chats")).not.toBeInTheDocument();
    fireEvent.click(historyBtn);
    expect(screen.getByText("Previous Chats")).toBeInTheDocument();
    expect(screen.getByText("Old chat")).toBeInTheDocument();

    fireEvent.click(historyBtn);
    expect(screen.queryByText("Previous Chats")).not.toBeInTheDocument();
  });

  it("clicking an archived session loads it and hides the history panel", () => {
    const loadArchivedSession = vi.fn();
    vi.mocked(useAIChat).mockReturnValue({
      ...baseChatMock(),
      archivedSessions: [
        {
          id: "s1",
          user_id: "u1",
          title: "Old chat",
          is_archived: true,
          started_at: new Date().toISOString(),
          last_message_at: new Date().toISOString(),
          message_count: 3,
          total_tokens: 100,
        },
      ],
      loadArchivedSession,
    });
    render(<AIChatPanel {...defaultPanelProps} />);
    fireEvent.click(screen.getByTitle("Chat history"));
    fireEvent.click(screen.getByText("Old chat"));
    expect(loadArchivedSession).toHaveBeenCalledWith("s1");
    expect(screen.queryByText("Previous Chats")).not.toBeInTheDocument();
  });

  it("shows new chat button when messages exist and not viewing archived", () => {
    vi.mocked(useAIChat).mockReturnValue({
      ...baseChatMock(),
      messages: [createMessage({ role: "user", content: "Hi" })],
    });
    render(<AIChatPanel {...defaultPanelProps} />);
    expect(screen.getByTitle("New chat")).toBeInTheDocument();
  });

  it("new chat button calls startNewChat", () => {
    const startNewChat = vi.fn();
    vi.mocked(useAIChat).mockReturnValue({
      ...baseChatMock(),
      messages: [createMessage({ role: "user", content: "Hi" })],
      startNewChat,
    });
    render(<AIChatPanel {...defaultPanelProps} />);
    fireEvent.click(screen.getByTitle("New chat"));
    expect(startNewChat).toHaveBeenCalledTimes(1);
  });

  it("shows clear button when messages exist and not viewing archived", () => {
    vi.mocked(useAIChat).mockReturnValue({
      ...baseChatMock(),
      messages: [createMessage({ role: "user", content: "Hi" })],
    });
    render(<AIChatPanel {...defaultPanelProps} />);
    expect(screen.getByTitle("Clear")).toBeInTheDocument();
  });

  it("clear button calls clearMessages", () => {
    const clearMessages = vi.fn();
    vi.mocked(useAIChat).mockReturnValue({
      ...baseChatMock(),
      messages: [createMessage({ role: "user", content: "Hi" })],
      clearMessages,
    });
    render(<AIChatPanel {...defaultPanelProps} />);
    fireEvent.click(screen.getByTitle("Clear"));
    expect(clearMessages).toHaveBeenCalledTimes(1);
  });

  it("shows back button when viewing archived", () => {
    vi.mocked(useAIChat).mockReturnValue({
      ...baseChatMock(),
      isViewingArchived: true,
    });
    render(<AIChatPanel {...defaultPanelProps} />);
    expect(screen.getByTitle("Back to active chat")).toBeInTheDocument();
  });

  it("back button calls startNewChat", () => {
    const startNewChat = vi.fn();
    vi.mocked(useAIChat).mockReturnValue({
      ...baseChatMock(),
      isViewingArchived: true,
      startNewChat,
    });
    render(<AIChatPanel {...defaultPanelProps} />);
    fireEvent.click(screen.getByTitle("Back to active chat"));
    expect(startNewChat).toHaveBeenCalledTimes(1);
  });

  it("shows loading spinner when isLoadingHistory is true", () => {
    vi.mocked(useAIChat).mockReturnValue({
      ...baseChatMock(),
      isLoadingHistory: true,
    });
    const { container } = render(<AIChatPanel {...defaultPanelProps} />);
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("shows sign-in prompt when not authenticated", () => {
    vi.mocked(useAuth).mockReturnValue({
      ...baseAuthMock(),
      isAuthenticated: false,
      user: null,
    });
    render(<AIChatPanel {...defaultPanelProps} />);
    expect(screen.getByText("Sign in to use Thor AI")).toBeInTheDocument();
    expect(screen.getByText("Sign In")).toBeInTheDocument();
  });

  it("does not render QuickActions or ChatInput when not authenticated", () => {
    vi.mocked(useAuth).mockReturnValue({
      ...baseAuthMock(),
      isAuthenticated: false,
      user: null,
    });
    render(<AIChatPanel {...defaultPanelProps} />);
    expect(screen.queryByText("Hint")).not.toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText("Ask a question...")
    ).not.toBeInTheDocument();
  });

  it("shows empty state when authenticated with no messages", () => {
    render(<AIChatPanel {...defaultPanelProps} />);
    expect(
      screen.getByText("Ask about the problem or use quick actions above")
    ).toBeInTheDocument();
    expect(
      screen.getByText("I guide with questions, not answers")
    ).toBeInTheDocument();
  });

  it("renders ChatMessage for each message", () => {
    vi.mocked(useAIChat).mockReturnValue({
      ...baseChatMock(),
      messages: [
        createMessage({ id: "m1", role: "user", content: "User msg" }),
        createMessage({ id: "m2", role: "assistant", content: "Bot msg" }),
      ],
    });
    render(<AIChatPanel {...defaultPanelProps} />);
    expect(screen.getByText("User msg")).toBeInTheDocument();
    expect(screen.getByText("Bot msg")).toBeInTheDocument();
  });

  it("displays error message when present", () => {
    vi.mocked(useAIChat).mockReturnValue({
      ...baseChatMock(),
      error: "Something went wrong",
    });
    render(<AIChatPanel {...defaultPanelProps} />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("shows archived banner when viewing archived", () => {
    vi.mocked(useAIChat).mockReturnValue({
      ...baseChatMock(),
      isViewingArchived: true,
      messages: [createMessage({ role: "user", content: "Hi" })],
    });
    render(<AIChatPanel {...defaultPanelProps} />);
    expect(
      screen.getByText("Viewing archived chat (read-only)")
    ).toBeInTheDocument();
  });

  it("does not render ChatInput when viewing archived", () => {
    vi.mocked(useAIChat).mockReturnValue({
      ...baseChatMock(),
      isViewingArchived: true,
    });
    render(<AIChatPanel {...defaultPanelProps} />);
    expect(
      screen.queryByPlaceholderText("Ask a question...")
    ).not.toBeInTheDocument();
  });

  it("renders QuickActions and ChatInput when authenticated", () => {
    render(<AIChatPanel {...defaultPanelProps} />);
    expect(screen.getByText(/Hint/)).toBeInTheDocument();
    expect(screen.getByText("Review")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Ask a question...")
    ).toBeInTheDocument();
  });
});

// AIToggleButton

describe("AIToggleButton", () => {
  it("renders null when isOpen is true", () => {
    const { container } = render(
      <AIToggleButton isOpen={true} onClick={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders button when isOpen is false", () => {
    render(<AIToggleButton isOpen={false} onClick={vi.fn()} />);
    const btn = screen.getByTitle("Open Thor AI");
    expect(btn).toBeInTheDocument();
    expect(btn.tagName).toBe("BUTTON");
  });

  it("renders SVG icon", () => {
    render(<AIToggleButton isOpen={false} onClick={vi.fn()} />);
    const btn = screen.getByTitle("Open Thor AI");
    const svg = btn.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg!.getAttribute("viewBox")).toBe("0 0 24 24");
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(<AIToggleButton isOpen={false} onClick={onClick} />);
    fireEvent.click(screen.getByTitle("Open Thor AI"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("shows active visual state when panel is open (returns null)", () => {
    const { container } = render(
      <AIToggleButton isOpen={true} onClick={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("has correct CSS classes when visible", () => {
    render(<AIToggleButton isOpen={false} onClick={vi.fn()} />);
    const btn = screen.getByTitle("Open Thor AI");
    expect(btn.className).toContain("fixed");
    expect(btn.className).toContain("bottom-6");
    expect(btn.className).toContain("right-6");
    expect(btn.className).toContain("rounded-full");
  });

  it("shows hasNewMessage badge when prop is true", () => {
    render(
      <AIToggleButton isOpen={false} onClick={vi.fn()} hasNewMessage={true} />
    );
    const btn = screen.getByTitle("Open Thor AI");
    const badge = btn.querySelector("span");
    expect(badge).toBeInTheDocument();
    expect(badge!.className).toContain("bg-red-500");
    expect(badge!.className).toContain("animate-pulse");
  });

  it("does not render badge when hasNewMessage is false", () => {
    render(
      <AIToggleButton isOpen={false} onClick={vi.fn()} hasNewMessage={false} />
    );
    const btn = screen.getByTitle("Open Thor AI");
    const badge = btn.querySelector("span");
    // The only span would be the badge, so it shouldn't exist
    expect(badge).toBeNull();
  });

  it("does not render badge when hasNewMessage is undefined", () => {
    render(<AIToggleButton isOpen={false} onClick={vi.fn()} />);
    const btn = screen.getByTitle("Open Thor AI");
    expect(btn.querySelector("span")).toBeNull();
  });

  it("has descriptive title attribute for accessibility", () => {
    render(<AIToggleButton isOpen={false} onClick={vi.fn()} />);
    expect(screen.getByTitle("Open Thor AI")).toBeInTheDocument();
  });
});

// ChatInput

describe("ChatInput", () => {
  it("renders textarea and send button", () => {
    render(<ChatInput onSend={vi.fn()} isLoading={false} />);
    expect(
      screen.getByPlaceholderText("Ask a question...")
    ).toBeInTheDocument();
    expect(screen.getByTitle("Send")).toBeInTheDocument();
  });

  it("updates input value on change", () => {
    render(<ChatInput onSend={vi.fn()} isLoading={false} />);
    const textarea = screen.getByPlaceholderText("Ask a question...");
    fireEvent.change(textarea, { target: { value: "Hello" } });
    expect(textarea).toHaveValue("Hello");
  });

  it("calls onSend with trimmed text on submit via Enter", () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} isLoading={false} />);
    const textarea = screen.getByPlaceholderText("Ask a question...");
    fireEvent.change(textarea, { target: { value: "  test message  " } });
    fireKeyDown(textarea, "Enter");
    expect(onSend).toHaveBeenCalledWith("test message");
  });

  it("clears input after successful send", () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} isLoading={false} />);
    const textarea = screen.getByPlaceholderText("Ask a question...");
    fireEvent.change(textarea, { target: { value: "Hello" } });
    fireKeyDown(textarea, "Enter");
    expect(textarea).toHaveValue("");
  });

  it("does NOT call onSend with empty text", () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} isLoading={false} />);
    const textarea = screen.getByPlaceholderText("Ask a question...");
    fireEvent.change(textarea, { target: { value: "   " } });
    fireKeyDown(textarea, "Enter");
    expect(onSend).not.toHaveBeenCalled();
  });

  it("does NOT call onSend when isLoading is true", () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} isLoading={true} />);
    const textarea = screen.getByPlaceholderText("Ask a question...");
    fireEvent.change(textarea, { target: { value: "Hello" } });
    // When isLoading is true, the textarea is disabled; fireEvent still works
    fireKeyDown(textarea, "Enter");
    expect(onSend).not.toHaveBeenCalled();
  });

  it("does NOT call onSend when disabled is true", () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} isLoading={false} disabled={true} />);
    const textarea = screen.getByPlaceholderText("Ask a question...");
    fireEvent.change(textarea, { target: { value: "Hello" } });
    fireKeyDown(textarea, "Enter");
    expect(onSend).not.toHaveBeenCalled();
  });

  it("disables input and button when disabled is true", () => {
    render(<ChatInput onSend={vi.fn()} isLoading={false} disabled={true} />);
    expect(screen.getByPlaceholderText("Ask a question...")).toBeDisabled();
    expect(screen.getByTitle("Send")).toBeDisabled();
  });

  it("does NOT submit on Shift+Enter", () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} isLoading={false} />);
    const textarea = screen.getByPlaceholderText("Ask a question...");
    fireEvent.change(textarea, { target: { value: "Hello" } });
    fireKeyDown(textarea, "Enter", { shiftKey: true });
    expect(onSend).not.toHaveBeenCalled();
  });

  it("shows placeholder text", () => {
    render(
      <ChatInput
        onSend={vi.fn()}
        isLoading={false}
        placeholder="Custom placeholder"
      />
    );
    expect(
      screen.getByPlaceholderText("Custom placeholder")
    ).toBeInTheDocument();
  });

  it("send button is disabled when input is empty", () => {
    render(<ChatInput onSend={vi.fn()} isLoading={false} />);
    expect(screen.getByTitle("Send")).toBeDisabled();
  });

  it("send button is enabled when input is non-empty", () => {
    render(<ChatInput onSend={vi.fn()} isLoading={false} />);
    const textarea = screen.getByPlaceholderText("Ask a question...");
    fireEvent.change(textarea, { target: { value: "Hello" } });
    expect(screen.getByTitle("Send")).not.toBeDisabled();
  });

  it("shows stop button when isLoading is true", () => {
    render(<ChatInput onSend={vi.fn()} isLoading={true} />);
    expect(screen.getByTitle("Stop")).toBeInTheDocument();
    expect(screen.queryByTitle("Send")).not.toBeInTheDocument();
  });

  it("calls onStop when stop button is clicked", () => {
    const onStop = vi.fn();
    render(<ChatInput onSend={vi.fn()} onStop={onStop} isLoading={true} />);
    fireEvent.click(screen.getByTitle("Stop"));
    expect(onStop).toHaveBeenCalledTimes(1);
  });

  it("send button click calls onSend", () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} isLoading={false} />);
    const textarea = screen.getByPlaceholderText("Ask a question...");
    fireEvent.change(textarea, { target: { value: "Hello" } });
    fireEvent.click(screen.getByTitle("Send"));
    expect(onSend).toHaveBeenCalledWith("Hello");
  });
});

// ChatMessage

describe("ChatMessage", () => {
  it("renders user message with right alignment", () => {
    const msg = createMessage({ role: "user", content: "User text" });
    const { container } = render(<ChatMessage message={msg} />);
    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv.className).toContain("justify-end");
  });

  it("renders assistant message with left alignment", () => {
    const msg = createMessage({ role: "assistant", content: "Bot text" });
    const { container } = render(<ChatMessage message={msg} />);
    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv.className).toContain("justify-start");
  });

  it("renders user message with indigo background", () => {
    const msg = createMessage({ role: "user", content: "User text" });
    const { container } = render(<ChatMessage message={msg} />);
    const bubble = container.querySelector(".max-w-\\[90\\%\\]") as HTMLElement;
    // The class contains both rounded-md px-3 py-2 text-sm and role-specific styles
    expect(bubble.className).toContain("bg-indigo-600");
    expect(bubble.className).toContain("text-white");
  });

  it("renders assistant message with gray background and border", () => {
    const msg = createMessage({ role: "assistant", content: "Bot text" });
    const { container } = render(<ChatMessage message={msg} />);
    const bubble = container.querySelector(".max-w-\\[90\\%\\]") as HTMLElement;
    expect(bubble.className).toContain("bg-gray-800");
    expect(bubble.className).toContain("border");
  });

  it("renders text content properly", () => {
    const msg = createMessage({ role: "user", content: "Hello world" });
    render(<ChatMessage message={msg} />);
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("renders code blocks within messages", () => {
    const msg = createMessage({
      role: "assistant",
      content: "Here is code:\n```javascript\nconst x = 1;\n```",
    });
    const { container } = render(<ChatMessage message={msg} />);
    const pre = container.querySelector("pre");
    expect(pre).toBeInTheDocument();
    const codeEl = pre!.querySelector("code");
    expect(codeEl).toBeInTheDocument();
    expect(codeEl!.textContent).toBe("const x = 1;");
  });

  it("shows language label on code blocks", () => {
    const msg = createMessage({
      role: "assistant",
      content: '```python\nprint("hi")\n```',
    });
    const { container } = render(<ChatMessage message={msg} />);
    expect(container.querySelector("pre")?.textContent).toContain("python");
  });

  it("renders inline code", () => {
    const msg = createMessage({
      role: "user",
      content: "Use the `map()` function",
    });
    const { container } = render(<ChatMessage message={msg} />);
    const codeEl = container.querySelector("code");
    expect(codeEl).toBeInTheDocument();
    expect(codeEl!.textContent).toBe("map()");
  });

  it("renders bold text", () => {
    const msg = createMessage({
      role: "assistant",
      content: "This is **important**",
    });
    const { container } = render(<ChatMessage message={msg} />);
    const strong = container.querySelector("strong");
    expect(strong).toBeInTheDocument();
    expect(strong!.textContent).toBe("important");
  });

  it("renders italic text with asterisk", () => {
    const msg = createMessage({
      role: "assistant",
      content: "This is *emphasized*",
    });
    const { container } = render(<ChatMessage message={msg} />);
    const em = container.querySelector("em");
    expect(em).toBeInTheDocument();
    expect(em!.textContent).toBe("emphasized");
  });

  it("renders italic text with underscore", () => {
    const msg = createMessage({
      role: "assistant",
      content: "This is _emphasized_",
    });
    const { container } = render(<ChatMessage message={msg} />);
    const em = container.querySelector("em");
    expect(em).toBeInTheDocument();
    expect(em!.textContent).toBe("emphasized");
  });

  it("renders headers (h2, h3, h4)", () => {
    const msg = createMessage({
      role: "assistant",
      content: "# Big\n## Medium\n### Small",
    });
    const { container } = render(<ChatMessage message={msg} />);
    expect(container.querySelector("h2")).toBeInTheDocument();
    expect(container.querySelector("h2")!.textContent).toBe("Big");
    expect(container.querySelector("h3")!.textContent).toBe("Medium");
    expect(container.querySelector("h4")!.textContent).toBe("Small");
  });

  it("renders bullet lists", () => {
    const msg = createMessage({
      role: "assistant",
      content: "- Item 1\n- Item 2",
    });
    render(<ChatMessage message={msg} />);
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
  });

  it("renders numbered lists", () => {
    const msg = createMessage({
      role: "assistant",
      content: "1. First\n2. Second",
    });
    render(<ChatMessage message={msg} />);
    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
  });

  it("renders horizontal rules", () => {
    const msg = createMessage({
      role: "assistant",
      content: "Above\n---\nBelow",
    });
    const { container } = render(<ChatMessage message={msg} />);
    expect(container.querySelector("hr")).toBeInTheDocument();
  });

  it("shows streaming cursor when isStreaming is true", () => {
    const msg = createMessage({
      role: "assistant",
      content: "Partial response",
      isStreaming: true,
    });
    const { container } = render(<ChatMessage message={msg} />);
    const cursor = container.querySelector(".animate-pulse");
    expect(cursor).toBeInTheDocument();
  });

  it("shows bouncing dots when streaming with empty content", () => {
    const msg = createMessage({
      role: "assistant",
      content: "",
      isStreaming: true,
    });
    const { container } = render(<ChatMessage message={msg} />);
    const dots = container.querySelectorAll(".animate-bounce");
    expect(dots.length).toBe(3);
  });

  it("has correct message container structure", () => {
    const msg = createMessage({ role: "user", content: "Test" });
    const { container } = render(<ChatMessage message={msg} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  // ASCII / preformatted rendering

  it("renders box-drawing unicode in a font-mono <pre>", () => {
    const msg = createMessage({
      role: "assistant",
      content: "root\n├── left\n│   └── leaf\n└── right",
    });
    const { container } = render(<ChatMessage message={msg} />);
    // The FormattedText block containing box-drawing chars must be a <pre>
    const pres = Array.from(container.querySelectorAll("pre"));
    const monoPre = pres.find((p) => p.className.includes("font-mono"));
    expect(monoPre).toBeInTheDocument();
    expect(monoPre?.textContent).toContain("├── left");
  });

  it("renders pipe-delimited markdown table in a font-mono <pre>", () => {
    const msg = createMessage({
      role: "assistant",
      content: "| Name | Age |\n|------|-----|\n| Alice | 25 |",
    });
    const { container } = render(<ChatMessage message={msg} />);
    const pres = Array.from(container.querySelectorAll("pre"));
    const monoPre = pres.find((p) => p.className.includes("font-mono"));
    expect(monoPre).toBeInTheDocument();
    expect(monoPre?.textContent).toContain("Name");
    expect(monoPre?.textContent).toContain("Alice");
  });

  it("renders ASCII +---+ table in a font-mono <pre>", () => {
    const msg = createMessage({
      role: "assistant",
      content: "+------+------+\n| Col1 | Col2 |\n+------+------+",
    });
    const { container } = render(<ChatMessage message={msg} />);
    const pres = Array.from(container.querySelectorAll("pre"));
    const monoPre = pres.find((p) => p.className.includes("font-mono"));
    expect(monoPre).toBeInTheDocument();
    expect(monoPre?.textContent).toContain("Col1");
  });

  it("renders / \\ tree branches in a font-mono <pre>", () => {
    const msg = createMessage({
      role: "assistant",
      content: "     4\n    / \\\n   2   6",
    });
    const { container } = render(<ChatMessage message={msg} />);
    const pres = Array.from(container.querySelectorAll("pre"));
    const monoPre = pres.find((p) => p.className.includes("font-mono"));
    expect(monoPre).toBeInTheDocument();
    // All lines of the block (including digits) must be inside the same <pre>
    expect(monoPre?.textContent).toContain("4");
    expect(monoPre?.textContent).toContain("/ \\");
    expect(monoPre?.textContent).toContain("2");
    expect(monoPre?.textContent).toContain("6");
  });

  it("does NOT render plain paragraphs as font-mono <pre>", () => {
    const msg = createMessage({
      role: "assistant",
      content: "This is a normal paragraph without any ASCII art.",
    });
    const { container } = render(<ChatMessage message={msg} />);
    // There should be no standalone font-mono <pre> (code fences excluded)
    const pres = Array.from(container.querySelectorAll("pre"));
    const monoPres = pres.filter((p) => p.className.includes("font-mono"));
    expect(monoPres.length).toBe(0);
  });
});

// InlineAI

describe("InlineAI", () => {
  const basePosition = { top: 100, left: 100 };

  const defaultInlineProps = {
    isOpen: true,
    onClose: vi.fn(),
    position: basePosition,
    selectedCode: "const x = 1;",
    fullCode: "function test() { const x = 1; }",
    language: "javascript",
    problemSlug: "two-sum",
    problemTitle: "Two Sum",
    onApply: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(aiApiClient.chatStream).mockImplementation(
      (_req, onChunk, _onError, onDone) => {
        onChunk("Streamed response");
        onDone();
        return vi.fn();
      }
    );
  });

  afterEach(() => {
    cleanup();
  });

  it("does NOT render when isOpen is false", () => {
    const { container } = render(
      <InlineAI {...defaultInlineProps} isOpen={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders when isOpen is true", () => {
    render(<InlineAI {...defaultInlineProps} />);
    expect(screen.getByText("Thor AI")).toBeInTheDocument();
  });

  it("renders Thor AI icon in the header", () => {
    render(<InlineAI {...defaultInlineProps} />);
    const icon = screen.getByAltText("Thor AI");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute("src");
  });

  it("shows header with title", () => {
    render(<InlineAI {...defaultInlineProps} />);
    expect(screen.getByText("Thor AI")).toBeInTheDocument();
    expect(screen.getByText("⌘K")).toBeInTheDocument();
  });

  it("has close button that calls onClose", () => {
    const onClose = vi.fn();
    render(<InlineAI {...defaultInlineProps} onClose={onClose} />);
    const header = screen.getByText("Thor AI").closest("div")!;
    const buttons = header.parentElement!.querySelectorAll("button");
    // The close button is the only button in the header aside from action buttons
    const closeBtn = Array.from(buttons).find(
      (b) => b.querySelector("svg") && !b.querySelector("span")
    );
    expect(closeBtn).toBeDefined();
    fireEvent.click(closeBtn!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("shows action buttons (Explain, Improve, Debug, Complexity)", () => {
    render(<InlineAI {...defaultInlineProps} />);
    expect(screen.getByText("Explain")).toBeInTheDocument();
    expect(screen.getByText("Improve")).toBeInTheDocument();
    expect(screen.getByText("Debug")).toBeInTheDocument();
    expect(screen.getByText("Complexity")).toBeInTheDocument();
  });

  it("does NOT show action buttons when selectedCode is empty", () => {
    render(<InlineAI {...defaultInlineProps} selectedCode="" />);
    expect(screen.queryByText("Explain")).not.toBeInTheDocument();
    expect(screen.queryByText("Improve")).not.toBeInTheDocument();
    expect(screen.queryByText("Debug")).not.toBeInTheDocument();
    expect(screen.queryByText("Complexity")).not.toBeInTheDocument();
  });

  it("has 'Ask' text input with send", () => {
    render(<InlineAI {...defaultInlineProps} />);
    const placeholder = `Ask about this code...`;
    expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument();
    const input = screen.getByPlaceholderText(placeholder) as HTMLInputElement;
    const submitBtn = input
      .closest("form")!
      .querySelector('button[type="submit"]')!;
    expect(submitBtn).toBeInTheDocument();
  });

  it("uses 'Ask anything...' placeholder when no selectedCode", () => {
    render(<InlineAI {...defaultInlineProps} selectedCode="" />);
    expect(screen.getByPlaceholderText("Ask anything...")).toBeInTheDocument();
  });

  it("clicking Explain triggers chatStream", async () => {
    render(<InlineAI {...defaultInlineProps} />);
    fireEvent.click(screen.getByText("Explain"));
    await waitFor(() => {
      expect(aiApiClient.chatStream).toHaveBeenCalledTimes(1);
    });
    const req = vi.mocked(aiApiClient.chatStream).mock.calls[0][0];
    expect(req.message).toContain("Explain");
    expect(req.message).toContain("const x = 1;");
  });

  it("clicking Improve triggers chatStream", async () => {
    render(<InlineAI {...defaultInlineProps} />);
    fireEvent.click(screen.getByText("Improve"));
    await waitFor(() => {
      expect(aiApiClient.chatStream).toHaveBeenCalled();
    });
  });

  it("clicking Debug triggers chatStream", async () => {
    render(<InlineAI {...defaultInlineProps} />);
    fireEvent.click(screen.getByText("Debug"));
    await waitFor(() => {
      expect(aiApiClient.chatStream).toHaveBeenCalled();
    });
  });

  it("clicking Complexity triggers chatStream", async () => {
    render(<InlineAI {...defaultInlineProps} />);
    fireEvent.click(screen.getByText("Complexity"));
    await waitFor(() => {
      expect(aiApiClient.chatStream).toHaveBeenCalled();
    });
  });

  it("shows streamed response text", async () => {
    render(<InlineAI {...defaultInlineProps} />);
    fireEvent.click(screen.getByText("Explain"));
    await waitFor(() => {
      expect(screen.getByText("Streamed response")).toBeInTheDocument();
    });
  });

  it("shows loading indicator during streaming", async () => {
    vi.mocked(aiApiClient.chatStream).mockImplementation(
      (_req, _onChunk, _onError, _onDone) => {
        // Don't call any callbacks to keep loading state active
        return vi.fn();
      }
    );
    render(<InlineAI {...defaultInlineProps} />);
    fireEvent.click(screen.getByText("Explain"));
    expect(screen.getByText("Thinking...")).toBeInTheDocument();
  });

  it("displays error message when streaming fails", async () => {
    vi.mocked(aiApiClient.chatStream).mockImplementation(
      (_req, _onChunk, onError, _onDone) => {
        onError("API failure");
        return vi.fn();
      }
    );
    render(<InlineAI {...defaultInlineProps} />);
    fireEvent.click(screen.getByText("Explain"));
    await waitFor(() => {
      expect(screen.getByText("Error: API failure")).toBeInTheDocument();
    });
  });

  it("submits custom prompt via form submit", async () => {
    render(<InlineAI {...defaultInlineProps} />);
    const input = screen.getByPlaceholderText(
      "Ask about this code..."
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "What does this do?" } });
    const form = input.closest("form")!;
    fireEvent.submit(form);
    await waitFor(() => {
      expect(aiApiClient.chatStream).toHaveBeenCalled();
    });
  });

  it("clears input after custom prompt submit", async () => {
    render(<InlineAI {...defaultInlineProps} />);
    const input = screen.getByPlaceholderText(
      "Ask about this code..."
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Explain" } });
    const form = input.closest("form")!;
    fireEvent.submit(form);
    await waitFor(() => {
      expect(input.value).toBe("");
    });
  });

  it("does not submit empty input", async () => {
    render(<InlineAI {...defaultInlineProps} />);
    const form = screen
      .getByPlaceholderText("Ask about this code...")
      .closest("form")!;
    fireEvent.submit(form);
    expect(aiApiClient.chatStream).not.toHaveBeenCalled();
  });

  it("submit button is disabled when input is empty", () => {
    render(<InlineAI {...defaultInlineProps} />);
    const submitBtn = screen
      .getByPlaceholderText("Ask about this code...")
      .closest("form")!
      .querySelector('button[type="submit"]')!;
    expect(submitBtn).toBeDisabled();
  });

  it("input is disabled when isLoading", async () => {
    vi.mocked(aiApiClient.chatStream).mockImplementation(
      (_req, _onChunk, _onError, _onDone) => {
        return vi.fn();
      }
    );
    render(<InlineAI {...defaultInlineProps} />);
    fireEvent.click(screen.getByText("Explain"));
    const input = screen.getByPlaceholderText(
      "Ask about this code..."
    ) as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it("pressing Escape calls onClose", () => {
    const onClose = vi.fn();
    render(<InlineAI {...defaultInlineProps} onClose={onClose} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("clicking outside calls onClose", () => {
    const onClose = vi.fn();
    render(<InlineAI {...defaultInlineProps} onClose={onClose} />);
    fireEvent.mouseDown(document.body);
    expect(onClose).toHaveBeenCalled();
  });

  it("does not call onClose when clicking inside the component", () => {
    const onClose = vi.fn();
    render(<InlineAI {...defaultInlineProps} onClose={onClose} />);
    const panel = screen.getByText("Thor AI").closest('[class*="z-50"]')!;
    fireEvent.mouseDown(panel);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("cleans up event listeners on unmount", () => {
    const onClose = vi.fn();
    const { unmount } = render(
      <InlineAI {...defaultInlineProps} onClose={onClose} />
    );
    unmount();
    // After unmount, Escape should not trigger onClose
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("renders with correct positioning style", () => {
    render(
      <InlineAI {...defaultInlineProps} position={{ top: 200, left: 300 }} />
    );
    const panel = screen
      .getByText("Thor AI")
      .closest('[class*="z-50"]') as HTMLElement;
    expect(panel.style.top).toBe("200px");
    expect(panel.style.left).toBe("300px");
  });

  it("action buttons disappear after clicking one (response shown)", async () => {
    render(<InlineAI {...defaultInlineProps} />);
    expect(screen.getByText("Explain")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Explain"));
    await waitFor(() => {
      expect(screen.queryByText("Explain")).not.toBeInTheDocument();
    });
  });
});

// QuickActions

describe("QuickActions", () => {
  const defaultQuickProps = {
    problemSlug: "two-sum",
    problemTitle: "Two Sum",
    problemDescription: "Find two numbers",
    code: "function twoSum() {}",
    language: "javascript",
    errorMessage: undefined as string | undefined,
    hintLevel: 1,
    onHintUsed: vi.fn(),
    onResult: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(aiApiClient.getHint).mockResolvedValue({
      success: true,
      data: {
        hint: "Try two pointers",
        level: 1,
        pattern: "Two Pointers",
        tokensUsed: 10,
      },
    });
    vi.mocked(aiApiClient.reviewCode).mockResolvedValue({
      success: true,
      data: { review: "Looks good", tokensUsed: 5 },
    });
    vi.mocked(aiApiClient.explainError).mockResolvedValue({
      success: true,
      data: { explanation: "Null reference", tokensUsed: 3 },
    });
  });

  it("renders Hint and Review buttons", () => {
    render(<QuickActions {...defaultQuickProps} />);
    expect(screen.getByText(/Hint/)).toBeInTheDocument();
    expect(screen.getByText("Review")).toBeInTheDocument();
  });

  it("renders Explain Error button when errorMessage is provided", () => {
    render(
      <QuickActions {...defaultQuickProps} errorMessage="TypeError: null" />
    );
    expect(screen.getByText("Explain Error")).toBeInTheDocument();
  });

  it("does NOT render Explain Error button without errorMessage", () => {
    render(<QuickActions {...defaultQuickProps} />);
    expect(screen.queryByText("Explain Error")).not.toBeInTheDocument();
  });

  it("Hint button shows hintLevel in label", () => {
    const { rerender } = render(
      <QuickActions {...defaultQuickProps} hintLevel={1} />
    );
    expect(screen.getByText(/Hint 1\/4/)).toBeInTheDocument();

    rerender(<QuickActions {...defaultQuickProps} hintLevel={3} />);
    expect(screen.getByText(/Hint 3\/4/)).toBeInTheDocument();
  });

  it("Hint and Review buttons are disabled when code is empty", () => {
    render(<QuickActions {...defaultQuickProps} code="" />);
    expect(screen.getByText(/Hint/).closest("button")).toBeDisabled();
    expect(screen.getByText("Review").closest("button")).toBeDisabled();
  });

  it("clicking Hint calls getHint API and triggers callbacks", async () => {
    const onResult = vi.fn();
    const onHintUsed = vi.fn();
    render(
      <QuickActions
        {...defaultQuickProps}
        onResult={onResult}
        onHintUsed={onHintUsed}
      />
    );
    fireEvent.click(screen.getByText(/Hint/).closest("button")!);
    await waitFor(() => {
      expect(aiApiClient.getHint).toHaveBeenCalled();
    });
    expect(aiApiClient.getHint).toHaveBeenCalledWith(
      expect.objectContaining({
        problemSlug: "two-sum",
        hintLevel: 1,
      })
    );
    await waitFor(() => {
      expect(onResult).toHaveBeenCalledWith("Try two pointers", "hint");
    });
    expect(onHintUsed).toHaveBeenCalled();
  });

  it("clicking Review calls reviewCode API and triggers onResult", async () => {
    const onResult = vi.fn();
    render(<QuickActions {...defaultQuickProps} onResult={onResult} />);
    fireEvent.click(screen.getByText("Review").closest("button")!);
    await waitFor(() => {
      expect(aiApiClient.reviewCode).toHaveBeenCalled();
    });
    expect(aiApiClient.reviewCode).toHaveBeenCalledWith(
      expect.objectContaining({ problemSlug: "two-sum" })
    );
    await waitFor(() => {
      expect(onResult).toHaveBeenCalledWith("Looks good", "review");
    });
  });

  it("clicking Explain Error calls explainError API and triggers onResult", async () => {
    const onResult = vi.fn();
    render(
      <QuickActions
        {...defaultQuickProps}
        errorMessage="TypeError: null"
        onResult={onResult}
      />
    );
    fireEvent.click(screen.getByText("Explain Error").closest("button")!);
    await waitFor(() => {
      expect(aiApiClient.explainError).toHaveBeenCalled();
    });
    expect(aiApiClient.explainError).toHaveBeenCalledWith(
      expect.objectContaining({ errorMessage: "TypeError: null" })
    );
    await waitFor(() => {
      expect(onResult).toHaveBeenCalledWith("Null reference", "explain");
    });
  });

  it("shows spinner on Hint button during loading", async () => {
    vi.mocked(aiApiClient.getHint).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                success: true,
                data: { hint: "Try", level: 1, pattern: "", tokensUsed: 1 },
              }),
            1000
          )
        )
    );
    render(<QuickActions {...defaultQuickProps} />);
    fireEvent.click(screen.getByText(/Hint/).closest("button")!);
    await waitFor(() => {
      const hintBtn = screen.getByText(/Hint/).closest("button")!;
      expect(hintBtn.querySelector(".animate-spin")).toBeInTheDocument();
    });
  });

  it("shows spinner on Review button during loading", async () => {
    vi.mocked(aiApiClient.reviewCode).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                success: true,
                data: { review: "OK", tokensUsed: 1 },
              }),
            1000
          )
        )
    );
    render(<QuickActions {...defaultQuickProps} />);
    fireEvent.click(screen.getByText("Review").closest("button")!);
    await waitFor(() => {
      const reviewBtn = screen.getByText("Review").closest("button")!;
      expect(reviewBtn.querySelector(".animate-spin")).toBeInTheDocument();
    });
  });

  it("shows spinner on Explain Error button during loading", async () => {
    vi.mocked(aiApiClient.explainError).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                success: true,
                data: { explanation: "Err", tokensUsed: 1 },
              }),
            1000
          )
        )
    );
    render(<QuickActions {...defaultQuickProps} errorMessage="Error: bad" />);
    fireEvent.click(screen.getByText("Explain Error").closest("button")!);
    await waitFor(() => {
      const errBtn = screen.getByText("Explain Error").closest("button")!;
      expect(errBtn.querySelector(".animate-spin")).toBeInTheDocument();
    });
  });

  it("all buttons are disabled while any action is loading", async () => {
    vi.mocked(aiApiClient.getHint).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                success: true,
                data: { hint: "Try", level: 1, pattern: "", tokensUsed: 1 },
              }),
            1000
          )
        )
    );
    render(<QuickActions {...defaultQuickProps} errorMessage="Err" />);
    fireEvent.click(screen.getByText(/Hint/).closest("button")!);
    await waitFor(() => {
      const buttons = screen.getAllByRole("button");
      buttons.forEach((btn) => {
        expect((btn as HTMLButtonElement).disabled).toBe(true);
      });
    });
  });

  it("handles getHint API failure gracefully", async () => {
    vi.mocked(aiApiClient.getHint).mockRejectedValue(
      new Error("Network error")
    );
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const onResult = vi.fn();
    render(<QuickActions {...defaultQuickProps} onResult={onResult} />);
    fireEvent.click(screen.getByText(/Hint/).closest("button")!);
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to get hint:",
        expect.any(Error)
      );
    });
    expect(onResult).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("handles reviewCode API failure gracefully", async () => {
    vi.mocked(aiApiClient.reviewCode).mockRejectedValue(
      new Error("Network error")
    );
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const onResult = vi.fn();
    render(<QuickActions {...defaultQuickProps} onResult={onResult} />);
    fireEvent.click(screen.getByText("Review").closest("button")!);
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to get review:",
        expect.any(Error)
      );
    });
    expect(onResult).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("handles explainError API failure gracefully", async () => {
    vi.mocked(aiApiClient.explainError).mockRejectedValue(
      new Error("Network error")
    );
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const onResult = vi.fn();
    render(
      <QuickActions
        {...defaultQuickProps}
        errorMessage="Err"
        onResult={onResult}
      />
    );
    fireEvent.click(screen.getByText("Explain Error").closest("button")!);
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to explain error:",
        expect.any(Error)
      );
    });
    expect(onResult).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("does not call getHint when code is empty", () => {
    render(<QuickActions {...defaultQuickProps} code="" />);
    fireEvent.click(screen.getByText(/Hint/).closest("button")!);
    expect(aiApiClient.getHint).not.toHaveBeenCalled();
  });

  it("has correct data attributes on buttons", () => {
    render(<QuickActions {...defaultQuickProps} errorMessage="Err" />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(3);
    buttons.forEach((btn) => {
      expect(btn.className).toContain("rounded-md");
    });
  });
});

// PatternQuickActions

describe("PatternQuickActions", () => {
  const defaultPatternQuickProps = {
    patternId: "two-pointers",
    patternName: "Two Pointers",
    activeSection: "Core Technique",
    onAction: vi.fn(),
  };

  it("renders all five action buttons", () => {
    render(<PatternQuickActions {...defaultPatternQuickProps} />);
    expect(screen.getByText("Explain Concept")).toBeInTheDocument();
    expect(screen.getByText("Compare Patterns")).toBeInTheDocument();
    expect(screen.getByText("When to Use")).toBeInTheDocument();
    expect(screen.getByText("Walk Through")).toBeInTheDocument();
    expect(screen.getByText("Practice Next")).toBeInTheDocument();
  });

  it("calls onAction with 'explain' and active section", () => {
    render(<PatternQuickActions {...defaultPatternQuickProps} />);
    fireEvent.click(screen.getByText("Explain Concept"));
    expect(defaultPatternQuickProps.onAction).toHaveBeenCalledWith(
      "explain",
      expect.stringContaining("Core Technique")
    );
  });

  it("calls onAction with 'compare' referencing pattern name", () => {
    render(<PatternQuickActions {...defaultPatternQuickProps} />);
    fireEvent.click(screen.getByText("Compare Patterns"));
    expect(defaultPatternQuickProps.onAction).toHaveBeenCalledWith(
      "compare",
      expect.stringContaining("Two Pointers")
    );
  });

  it("calls onAction with 'whenToUse' referencing pattern name", () => {
    render(<PatternQuickActions {...defaultPatternQuickProps} />);
    fireEvent.click(screen.getByText("When to Use"));
    expect(defaultPatternQuickProps.onAction).toHaveBeenCalledWith(
      "whenToUse",
      expect.stringContaining("Two Pointers")
    );
  });

  it("calls onAction with 'walkThrough' using active section", () => {
    render(<PatternQuickActions {...defaultPatternQuickProps} />);
    fireEvent.click(screen.getByText("Walk Through"));
    expect(defaultPatternQuickProps.onAction).toHaveBeenCalledWith(
      "walkThrough",
      expect.stringContaining("Core Technique")
    );
  });

  it("calls onAction with 'practiceNext' referencing pattern name", () => {
    render(<PatternQuickActions {...defaultPatternQuickProps} />);
    fireEvent.click(screen.getByText("Practice Next"));
    expect(defaultPatternQuickProps.onAction).toHaveBeenCalledWith(
      "practiceNext",
      expect.stringContaining("Two Pointers")
    );
  });

  it("uses 'this pattern' fallback when activeSection is empty", () => {
    render(
      <PatternQuickActions {...defaultPatternQuickProps} activeSection="" />
    );
    fireEvent.click(screen.getByText("Explain Concept"));
    expect(defaultPatternQuickProps.onAction).toHaveBeenCalledWith(
      "explain",
      expect.stringContaining("this pattern")
    );
  });

  it("uses 'the core technique' fallback when activeSection is empty for walkthrough", () => {
    render(
      <PatternQuickActions {...defaultPatternQuickProps} activeSection="" />
    );
    fireEvent.click(screen.getByText("Walk Through"));
    expect(defaultPatternQuickProps.onAction).toHaveBeenCalledWith(
      "walkThrough",
      expect.stringContaining("the core technique")
    );
  });
});
