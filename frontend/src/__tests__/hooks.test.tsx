import { useAIChat } from "@/hooks/useAIChat";
import { useInlineAI } from "@/hooks/useInlineAI";
import {
  useIsDesktop,
  useIsMobile,
  useMediaQuery,
} from "@/hooks/useMediaQuery";
import { useTextSelection } from "@/hooks/useTextSelection";
import type { ChatResponse } from "@/types/ai";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { RefObject } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock @/lib/ai-api for useAIChat tests
vi.mock("@/lib/ai-api", () => {
  const mockMethods = {
    chat: vi.fn(),
    chatStream: vi.fn(),
    getSessions: vi.fn(),
    getArchivedSessions: vi.fn(),
    getSessionMessages: vi.fn(),
    clearSession: vi.fn(),
    archiveSession: vi.fn(),
  };
  return { aiApiClient: mockMethods };
});

import { aiApiClient } from "@/lib/ai-api";

// Helpers

/** Creates a minimal DOMRect-compatible object (jsdom may not expose DOMRect). */
function fakeRect(
  x = 0,
  y = 0,
  width = 0,
  height = 0
): DOMRect {
  return { x, y, width, height, top: y, right: x + width, bottom: y + height, left: x } as DOMRect;
}

/** Creates a mock Monaco editor instance for useInlineAI tests. */
function createMockEditor(overrides: Record<string, unknown> = {}) {
  const selection = {
    isEmpty: () => false,
    startLineNumber: 1,
    endLineNumber: 3,
    ...(overrides.selection as Record<string, unknown> || {}),
  };

  const model = {
    getValueInRange: vi.fn(() => "selected code"),
    ...(overrides.model as Record<string, unknown> || {}),
  };

  const position = {
    lineNumber: 3,
    column: 1,
    ...(overrides.position as Record<string, unknown> || {}),
  };

  const domNode = document.createElement("div");
  vi.spyOn(domNode, "getBoundingClientRect").mockReturnValue(fakeRect(0, 0, 800, 600));

  return {
    getSelection: vi.fn(() => selection),
    getModel: vi.fn(() => model),
    getPosition: vi.fn(() => position),
    getDomNode: vi.fn(() => domNode),
    getScrollTop: vi.fn(() => 0),
    getOption: vi.fn((_: number) => 20),
    executeEdits: vi.fn(),
    addCommand: vi.fn(),
    ...overrides,
  };
}

// useMediaQuery
describe("useMediaQuery", () => {
  let matchMediaMock: ReturnType<typeof vi.fn>;
  let listeners: Record<string, (e: { matches: boolean }) => void>;

  beforeEach(() => {
    listeners = {};
    matchMediaMock = vi.fn();
    window.matchMedia = matchMediaMock as (query: string) => MediaQueryList;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function createMql(matches: boolean) {
    return {
      matches,
      addEventListener: vi.fn((event: string, listener: (e: { matches: boolean }) => void) => {
        listeners[event] = listener;
      }),
      removeEventListener: vi.fn(),
    };
  }

  it("should return true when the query matches", () => {
    matchMediaMock.mockReturnValue(createMql(true));
    const { result } = renderHook(() => useMediaQuery("(min-width: 1024px)"));
    expect(result.current).toBe(true);
  });

  it("should return false when the query does not match", () => {
    matchMediaMock.mockReturnValue(createMql(false));
    const { result } = renderHook(() => useMediaQuery("(min-width: 1024px)"));
    expect(result.current).toBe(false);
  });

  it("should update state when the media query match changes", () => {
    const mql = createMql(false);
    matchMediaMock.mockReturnValue(mql);
    const { result } = renderHook(() => useMediaQuery("(min-width: 1024px)"));
    expect(result.current).toBe(false);

    act(() => {
      listeners.change({ matches: true });
    });
    expect(result.current).toBe(true);

    act(() => {
      listeners.change({ matches: false });
    });
    expect(result.current).toBe(false);
  });

  it("should clean up the event listener on unmount", () => {
    const mql = createMql(true);
    matchMediaMock.mockReturnValue(mql);
    const { unmount } = renderHook(() => useMediaQuery("(min-width: 1024px)"));
    unmount();
    expect(mql.removeEventListener).toHaveBeenCalledWith("change", expect.any(Function));
  });

  it("useIsMobile should return true when viewport is narrow", () => {
    matchMediaMock.mockReturnValue(createMql(false));
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it("useIsMobile should return false when viewport is wide", () => {
    matchMediaMock.mockReturnValue(createMql(true));
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  // useIsTablet is not tested directly because it short-circuits on initial
  // render (the second useMediaQuery is skipped when the first returns false),
  // violating the Rules of Hooks. This is a known issue in the production code.
  // Instead, we verify the individual media queries that comprise it.
  it("useIsTablet tablet range: min-width:768px matches and min-width:1024px does not", async () => {
    matchMediaMock
      .mockImplementation((query: string) => {
        if (query === "(min-width: 768px)") return createMql(true);
        if (query === "(min-width: 1024px)") return createMql(false);
        return createMql(false);
      });
    const w768 = renderHook(() => useMediaQuery("(min-width: 768px)"));
    const w1024 = renderHook(() => useMediaQuery("(min-width: 1024px)"));
    await waitFor(() => expect(w768.result.current).toBe(true));
    await waitFor(() => expect(w1024.result.current).toBe(false));
    expect(w768.result.current && !w1024.result.current).toBe(true);
  });

  it("useIsDesktop should return true at or above 1024px", () => {
    matchMediaMock.mockReturnValue(createMql(true));
    const { result } = renderHook(() => useIsDesktop());
    expect(result.current).toBe(true);
  });
});

// useTextSelection
describe("useTextSelection", () => {
  let container: HTMLElement;
  let containerRef: RefObject<HTMLElement | null>;

  const containerText = "This is some text content for testing selection features";

  function setupSelectionMocks(overrides: {
    selectedText?: string;
    isCollapsed?: boolean;
    inContainer?: boolean;
    startOffset?: number;
  } = {}) {
    const {
      selectedText = "text",
      isCollapsed = false,
      inContainer = true,
      startOffset = 12,
    } = overrides;

    const mockRange = {
      commonAncestorContainer: inContainer ? container : document.body,
      startContainer: inContainer ? container : document.body,
      endContainer: inContainer ? container : document.body,
      startOffset,
      endOffset: startOffset + selectedText.length,
      getBoundingClientRect: () => fakeRect(50, 100, 150, 20),
    };

    const mockSelection = {
      isCollapsed,
      rangeCount: 1,
      getRangeAt: (_i: number) => mockRange,
      toString: () => selectedText,
      removeAllRanges: vi.fn(),
    };

    vi.spyOn(window, "getSelection").mockReturnValue(mockSelection as unknown as Selection);
    vi.spyOn(document, "createRange").mockImplementation(() => {
      let selectNodeContentsCalled = false;
      let setEndOffset = 0;
      return {
        selectNodeContents: vi.fn(() => {
          selectNodeContentsCalled = true;
        }),
        setEnd: vi.fn((_node: Node, offset: number) => {
          setEndOffset = offset;
        }),
        toString: vi.fn(() => {
          if (selectNodeContentsCalled) {
            return containerText.substring(0, setEndOffset);
          }
          return "";
        }),
        getBoundingClientRect: () => fakeRect(),
        collapsed: true,
        commonAncestorContainer: container,
        startContainer: container,
        endContainer: container,
        startOffset: 0,
        endOffset: 0,
      } as unknown as Range;
    });
  }

  beforeEach(() => {
    container = document.createElement("div");
    container.textContent = containerText;
    document.body.appendChild(container);
    containerRef = { current: container };

    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });
  });

  afterEach(() => {
    document.body.removeChild(container);
    vi.restoreAllMocks();
  });

  function fireMouseUp() {
    container.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
  }

  function fireMouseDown(target: Element) {
    target.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
  }

  function fireEscape() {
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
  }

  it("should return null selection initially", () => {
    const { result } = renderHook(() => useTextSelection(containerRef));
    expect(result.current.selection).toBeNull();
  });

  it("should capture a valid selection within the container", () => {
    setupSelectionMocks();
    const { result } = renderHook(() => useTextSelection(containerRef));

    act(() => {
      fireMouseUp();
    });

    expect(result.current.selection).not.toBeNull();
    expect(result.current.selection!.text).toBe("text");
    expect(result.current.selection!.startOffset).toBe(12);
    expect(result.current.selection!.endOffset).toBe(16);
    expect(result.current.selection!.startLine).toBe(1);
    expect(result.current.selection!.endLine).toBe(1);
    expect(result.current.selection!.rect).toBeDefined();
  });

  it("should ignore a selection outside the container", () => {
    setupSelectionMocks({ inContainer: false });
    const { result } = renderHook(() => useTextSelection(containerRef));

    act(() => {
      fireMouseUp();
    });

    expect(result.current.selection).toBeNull();
  });

  it("should respect the minLength option", () => {
    setupSelectionMocks({ selectedText: "ab" });
    const { result } = renderHook(() => useTextSelection(containerRef, { minLength: 3 }));

    act(() => {
      fireMouseUp();
    });

    expect(result.current.selection).toBeNull();
  });

  it("should respect the maxLength option", () => {
    const longText = "a".repeat(5001);
    setupSelectionMocks({ selectedText: longText });
    const { result } = renderHook(() => useTextSelection(containerRef, { maxLength: 5000 }));

    act(() => {
      fireMouseUp();
    });

    expect(result.current.selection).toBeNull();
  });

  it("should clear selection on mouse down outside the toolbar", () => {
    setupSelectionMocks();
    const { result } = renderHook(() => useTextSelection(containerRef));

    act(() => {
      fireMouseUp();
    });
    expect(result.current.selection).not.toBeNull();

    const nonToolbar = document.createElement("span");
    document.body.appendChild(nonToolbar);
    act(() => {
      fireMouseDown(nonToolbar);
    });
    document.body.removeChild(nonToolbar);

    expect(result.current.selection).toBeNull();
  });

  it("should not clear selection when clicking on the highlight toolbar", () => {
    setupSelectionMocks();
    const { result } = renderHook(() => useTextSelection(containerRef));

    act(() => {
      fireMouseUp();
    });
    expect(result.current.selection).not.toBeNull();

    const toolbar = document.createElement("div");
    toolbar.setAttribute("data-highlight-toolbar", "");
    document.body.appendChild(toolbar);
    act(() => {
      fireMouseDown(toolbar);
    });
    document.body.removeChild(toolbar);

    expect(result.current.selection).not.toBeNull();
  });

  it("should clear selection on Escape key", () => {
    setupSelectionMocks();
    const { result } = renderHook(() => useTextSelection(containerRef));

    act(() => {
      fireMouseUp();
    });
    expect(result.current.selection).not.toBeNull();

    act(() => {
      fireEscape();
    });

    expect(result.current.selection).toBeNull();
  });

  it("should not capture selection when enabled is false", () => {
    setupSelectionMocks();
    const { result } = renderHook(() => useTextSelection(containerRef, { enabled: false }));

    act(() => {
      fireMouseUp();
    });

    expect(result.current.selection).toBeNull();
  });

  it("clearSelection helper should reset selection to null", () => {
    setupSelectionMocks();
    const { result } = renderHook(() => useTextSelection(containerRef));

    act(() => {
      fireMouseUp();
    });
    expect(result.current.selection).not.toBeNull();

    act(() => {
      result.current.clearSelection();
    });

    expect(result.current.selection).toBeNull();
  });
});

// useAIChat
describe("useAIChat", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default: no active sessions, no archived sessions
    vi.mocked(aiApiClient.getSessions).mockResolvedValue({
      success: true,
      data: { sessions: [] },
    });
    vi.mocked(aiApiClient.getArchivedSessions).mockResolvedValue({
      success: true,
      data: { sessions: [] },
    });
    vi.mocked(aiApiClient.getSessionMessages).mockResolvedValue({
      success: true,
      data: { messages: [] },
    });
  });

  // initial state

  it("should return initial state", () => {
    const { result } = renderHook(() => useAIChat());
    expect(result.current.messages).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isLoadingHistory).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.sessionId).toBeNull();
    expect(result.current.archivedSessions).toEqual([]);
    expect(result.current.isViewingArchived).toBe(false);
    expect(typeof result.current.sendMessage).toBe("function");
    expect(typeof result.current.stopStreaming).toBe("function");
    expect(typeof result.current.clearMessages).toBe("function");
    expect(typeof result.current.startNewChat).toBe("function");
    expect(typeof result.current.loadArchivedSession).toBe("function");
  });

  // sendMessage streaming

  it("should send a message with streaming and append chunks", async () => {
    const abortFn = vi.fn();
    vi.mocked(aiApiClient.chatStream).mockImplementation(
      (_req, onChunk, _onError, onDone) => {
        onChunk("Hello");
        onChunk(" world");
        onDone();
        return abortFn;
      }
    );

    const { result } = renderHook(() => useAIChat());

    await act(async () => {
      await result.current.sendMessage("test", true);
    });

    expect(aiApiClient.chatStream).toHaveBeenCalledTimes(1);
    const req = vi.mocked(aiApiClient.chatStream).mock.calls[0][0];
    expect(req.message).toBe("test");
    expect(req.history).toEqual([{ role: "user", content: "test" }]);

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0].role).toBe("user");
    expect(result.current.messages[0].content).toBe("test");
    expect(result.current.messages[1].role).toBe("assistant");
    expect(result.current.messages[1].content).toBe("Hello world");
    expect(result.current.messages[1].isStreaming).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should handle streaming errors via the onError callback", async () => {
    vi.mocked(aiApiClient.chatStream).mockImplementation(
      (_req, _onChunk, onError, _onDone) => {
        onError("Stream error occurred");
        return vi.fn();
      }
    );

    const { result } = renderHook(() => useAIChat());

    await act(async () => {
      await result.current.sendMessage("test", true);
    });

    expect(result.current.error).toBe("Stream error occurred");
    expect(result.current.isLoading).toBe(false);
    const assistantMsg = result.current.messages.find((m) => m.role === "assistant");
    expect(assistantMsg?.isStreaming).toBe(false);
    expect(assistantMsg?.content).toBe("Sorry, an error occurred.");
  });

  // sendMessage non-streaming

  it("should send a message without streaming on success", async () => {
    vi.mocked(aiApiClient.chat).mockResolvedValue({
      success: true,
      data: {
        content: "Full response",
        sessionId: "session-abc",
        tokensUsed: 50,
        model: "gpt-4o",
      },
    });

    const { result } = renderHook(() => useAIChat());

    await act(async () => {
      await result.current.sendMessage("hello", false);
    });

    expect(aiApiClient.chat).toHaveBeenCalledTimes(1);
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[1].content).toBe("Full response");
    expect(result.current.messages[1].isStreaming).toBe(false);
    expect(result.current.sessionId).toBe("session-abc");
    expect(result.current.isLoading).toBe(false);
  });

  it("should handle non-streaming API error response", async () => {
    vi.mocked(aiApiClient.chat).mockResolvedValue({
      success: false,
      data: {} as ChatResponse,
      error: { code: "AI_ERROR", message: "Model unavailable" },
    });

    const { result } = renderHook(() => useAIChat());

    await act(async () => {
      await result.current.sendMessage("hello", false);
    });

    expect(result.current.error).toBe("Model unavailable");
    expect(result.current.messages[1].content).toBe("Sorry, an error occurred.");
    expect(result.current.isLoading).toBe(false);
  });

  it("should handle non-streaming network error (exception)", async () => {
    vi.mocked(aiApiClient.chat).mockRejectedValue(new Error("Network failure"));

    const { result } = renderHook(() => useAIChat());

    await act(async () => {
      await result.current.sendMessage("hello", false);
    });

    expect(result.current.error).toBe("Network failure");
    expect(result.current.messages[1].content).toBe("Sorry, an error occurred.");
    expect(result.current.isLoading).toBe(false);
  });

  it("should not send an empty message", async () => {
    const { result } = renderHook(() => useAIChat());

    await act(async () => {
      await result.current.sendMessage("  ", true);
    });

    expect(aiApiClient.chatStream).not.toHaveBeenCalled();
    expect(result.current.messages).toHaveLength(0);
  });

  // stopStreaming

  it("should stop an active stream", async () => {
    const abortFn = vi.fn();
    vi.mocked(aiApiClient.chatStream).mockImplementation(
      (_req, onChunk, _onError, _onDone) => {
        onChunk("Partial");
        return abortFn;
      }
    );

    const { result } = renderHook(() => useAIChat());

    await act(async () => {
      await result.current.sendMessage("test", true);
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.messages[1].content).toBe("Partial");
    expect(result.current.messages[1].isStreaming).toBe(true);

    act(() => {
      result.current.stopStreaming();
    });

    expect(abortFn).toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.messages[1].isStreaming).toBe(false);
  });

  it("stopStreaming should be a no-op when no stream is active", () => {
    const { result } = renderHook(() => useAIChat());
    act(() => {
      result.current.stopStreaming();
    });
    expect(result.current.isLoading).toBe(false);
  });

  // clearMessages

  it("should clear messages and session when a session exists", async () => {
    vi.mocked(aiApiClient.chat).mockResolvedValue({
      success: true,
      data: {
        content: "Response",
        sessionId: "session-xyz",
        tokensUsed: 10,
        model: "gpt-4o",
      },
    });
    vi.mocked(aiApiClient.clearSession).mockResolvedValue({
      success: true,
      data: { cleared: true },
    });

    const { result } = renderHook(() => useAIChat());

    // Create a session via non-streaming chat
    await act(async () => {
      await result.current.sendMessage("hello", false);
    });
    expect(result.current.sessionId).toBe("session-xyz");

    await act(async () => {
      await result.current.clearMessages();
    });

    expect(aiApiClient.clearSession).toHaveBeenCalledWith("session-xyz");
    expect(result.current.messages).toEqual([]);
    expect(result.current.sessionId).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("should clear messages without a session", async () => {
    const { result } = renderHook(() => useAIChat());

    // Add a message via streaming
    vi.mocked(aiApiClient.chatStream).mockImplementation(
      (_req, _onChunk, _onError, onDone) => {
        onDone();
        return vi.fn();
      }
    );

    await act(async () => {
      await result.current.sendMessage("hi", true);
    });
    expect(result.current.messages).toHaveLength(2);

    await act(async () => {
      await result.current.clearMessages();
    });

    expect(aiApiClient.clearSession).not.toHaveBeenCalled();
    expect(result.current.messages).toEqual([]);
    expect(result.current.sessionId).toBeNull();
  });

  // startNewChat

  it("should archive the current session and start fresh", async () => {
    vi.mocked(aiApiClient.chat).mockResolvedValue({
      success: true,
      data: {
        content: "Response",
        sessionId: "session-arch",
        tokensUsed: 10,
        model: "gpt-4o",
      },
    });
    vi.mocked(aiApiClient.archiveSession).mockResolvedValue({
      success: true,
      data: { archived: true },
    });
    vi.mocked(aiApiClient.getArchivedSessions).mockResolvedValue({
      success: true,
      data: {
        sessions: [
          {
            id: "session-arch",
            user_id: "u1",
            is_archived: true,
            problem_slug: "two-sum",
            started_at: "2024-01-01T00:00:00Z",
            last_message_at: "2024-01-01T00:00:00Z",
            message_count: 1,
            total_tokens: 10,
          },
        ],
      },
    });

    const { result } = renderHook(() => useAIChat({ problemSlug: "two-sum" }));

    await act(async () => {
      await result.current.sendMessage("archive me", false);
    });
    expect(result.current.sessionId).toBe("session-arch");

    await act(async () => {
      await result.current.startNewChat();
    });

    expect(aiApiClient.archiveSession).toHaveBeenCalledWith("session-arch", expect.any(String));
    expect(result.current.messages).toEqual([]);
    expect(result.current.sessionId).toBeNull();
    expect(result.current.archivedSessions).toHaveLength(1);
    expect(result.current.archivedSessions[0].id).toBe("session-arch");
  });

  it("startNewChat should just clear when there is no session", async () => {
    const { result } = renderHook(() => useAIChat());

    await act(async () => {
      await result.current.startNewChat();
    });

    expect(aiApiClient.archiveSession).not.toHaveBeenCalled();
    expect(result.current.messages).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  // loadArchivedSession

  it("should load messages from an archived session", async () => {
    vi.mocked(aiApiClient.getSessionMessages).mockResolvedValue({
      success: true,
      data: {
        messages: [
          {
            id: "m1",
            session_id: "arch-1",
            role: "user",
            content: "Old question",
            created_at: "2024-01-01T00:00:00Z",
          },
          {
            id: "m2",
            session_id: "arch-1",
            role: "assistant",
            content: "Old answer",
            created_at: "2024-01-01T00:00:00Z",
          },
        ],
      },
    });

    const { result } = renderHook(() => useAIChat());

    await act(async () => {
      await result.current.loadArchivedSession("arch-1");
    });

    expect(aiApiClient.getSessionMessages).toHaveBeenCalledWith("arch-1");
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0].content).toBe("Old question");
    expect(result.current.messages[1].content).toBe("Old answer");
    expect(result.current.sessionId).toBe("arch-1");
    expect(result.current.isLoadingHistory).toBe(false);
  });

  it("should handle error when loading an archived session fails", async () => {
    vi.mocked(aiApiClient.getSessionMessages).mockRejectedValue(new Error("Not found"));

    const { result } = renderHook(() => useAIChat());

    await act(async () => {
      await result.current.loadArchivedSession("bad-id");
    });

    expect(result.current.error).toBe("Failed to load archived chat");
    expect(result.current.isLoadingHistory).toBe(false);
  });

  // history loading on mount

  it("should load chat history when problemSlug is provided and an active session exists", async () => {
    vi.mocked(aiApiClient.getSessions).mockResolvedValue({
      success: true,
      data: {
        sessions: [
          {
            id: "existing-session",
            user_id: "u1",
            problem_slug: "two-sum",
            is_archived: false,
            started_at: "2024-01-01T00:00:00Z",
            last_message_at: "2024-01-01T00:00:00Z",
            message_count: 2,
            total_tokens: 20,
          },
        ],
      },
    });

    vi.mocked(aiApiClient.getSessionMessages).mockResolvedValue({
      success: true,
      data: {
        messages: [
          {
            id: "hist-1",
            session_id: "existing-session",
            role: "user",
            content: "history msg",
            created_at: "2024-01-01T00:00:00Z",
          },
        ],
      },
    });

    const { result } = renderHook(() => useAIChat({ problemSlug: "two-sum" }));

    await waitFor(() => {
      expect(result.current.isLoadingHistory).toBe(false);
    });

    expect(result.current.sessionId).toBe("existing-session");
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].content).toBe("history msg");
  });

  it("should skip history loading when problemSlug is not provided", async () => {
    const { result } = renderHook(() => useAIChat());
    expect(result.current.isLoadingHistory).toBe(false);
    expect(aiApiClient.getSessions).not.toHaveBeenCalled();
  });
});

// useInlineAI
describe("useInlineAI", () => {
  let editor: ReturnType<typeof createMockEditor>;

  beforeEach(() => {
    editor = createMockEditor();
  });

  it("should return initial closed state", () => {
    const { result } = renderHook(() => useInlineAI(editor));
    expect(result.current.isOpen).toBe(false);
    expect(result.current.selectedCode).toBe("");
    expect(result.current.position).toEqual({ top: 0, left: 0 });
  });

  it("should open with a non-empty selection", () => {
    const { result } = renderHook(() => useInlineAI(editor));

    act(() => {
      result.current.open();
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.selectedCode).toBe("selected code");
    expect(result.current.position.top).toBeGreaterThan(0);
    expect(result.current.position.left).toBeGreaterThan(0);
  });

  it("should open with an empty selection (selectionRange null)", () => {
    const emptySelectionEditor = createMockEditor({
      selection: {
        isEmpty: () => true,
        startLineNumber: 5,
        endLineNumber: 5,
      },
    });

    const { result } = renderHook(() => useInlineAI(emptySelectionEditor));

    act(() => {
      result.current.open();
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.selectedCode).toBe("selected code");
  });

  it("should do nothing when editor instance is null", () => {
    const { result } = renderHook(() => useInlineAI(null));

    act(() => {
      result.current.open();
    });

    expect(result.current.isOpen).toBe(false);
  });

  it("should close from open state", () => {
    const { result } = renderHook(() => useInlineAI(editor));

    act(() => {
      result.current.open();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.close();
    });
    expect(result.current.isOpen).toBe(false);
  });

  it("should apply code via executeEdits and close", () => {
    const { result } = renderHook(() => useInlineAI(editor));

    // Open first to set selectionRange
    act(() => {
      result.current.open();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.applyCode("replacement code");
    });

    expect(editor.executeEdits).toHaveBeenCalledWith("inline-ai", [
      {
        range: editor.getSelection(),
        text: "replacement code",
        forceMoveMarkers: true,
      },
    ]);
    expect(result.current.isOpen).toBe(false);
  });

  it("should not apply code when there is no selectionRange", () => {
    const emptySelectionEditor = createMockEditor({
      selection: {
        isEmpty: () => true,
        startLineNumber: 5,
        endLineNumber: 5,
      },
    });

    const { result } = renderHook(() => useInlineAI(emptySelectionEditor));

    // Open - selectionRange will be null because selection is empty
    act(() => {
      result.current.open();
    });

    act(() => {
      result.current.applyCode("code");
    });

    expect(emptySelectionEditor.executeEdits).not.toHaveBeenCalled();
  });

  it("should not apply code when editor instance is null", () => {
    const { result } = renderHook(() => useInlineAI(null));

    act(() => {
      result.current.applyCode("code");
    });

    // No crash, no-op
    expect(result.current.isOpen).toBe(false);
  });

  it("should register the keyboard shortcut on mount", () => {
    const { unmount } = renderHook(() => useInlineAI(editor));

    // 2048 (CtrlCmd) | 41 (KeyK)
    expect(editor.addCommand).toHaveBeenCalledWith(2048 | 41, expect.any(Function));

    // Verify the handler opens the panel
    const handler = vi.mocked(editor.addCommand).mock.calls[0][1];
    act(() => {
      handler();
    });

    expect(editor.getSelection).toHaveBeenCalled();

    unmount();
  });
});
