import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import {
  PatternProgressProvider,
  usePatternProgress,
} from "@/contexts/PatternProgressContext";
import type { ReactNode } from "react";
import type { User } from "@/types";

vi.mock("@/lib/api", () => ({
  apiClient: {
    syncPatternProgress: vi.fn(),
    markSectionComplete: vi.fn(),
    markSectionIncomplete: vi.fn(),
  },
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn(),
}));

import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const mockUser: User = {
  id: "user-123",
  email: "test@test.com",
  name: "Test User",
  emailVerified: true,
};

const Wrapper = ({ children }: { children: ReactNode }) => (
  <PatternProgressProvider>{children}</PatternProgressProvider>
);

const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

const originalRAF = window.requestAnimationFrame;
window.requestAnimationFrame = (cb: FrameRequestCallback) => {
  cb(0);
  return 0;
};

describe("PatternProgressContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      loginWithGoogle: vi.fn(),
      handleGoogleCallback: vi.fn(),
      refreshUser: vi.fn(),
    });
    vi.mocked(apiClient.syncPatternProgress).mockResolvedValue({
      success: true,
      data: { progress: {} },
    });
    vi.mocked(apiClient.markSectionComplete).mockResolvedValue({
      success: true,
      data: { message: "Section marked as complete" },
    });
    vi.mocked(apiClient.markSectionIncomplete).mockResolvedValue({
      success: true,
      data: { message: "Section marked as incomplete" },
    });
  });

  afterAll(() => {
    window.requestAnimationFrame = originalRAF;
  });

  describe("initial state", () => {
    it("should start with no completed sections", async () => {
      const { result } = renderHook(() => usePatternProgress(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.isCompleted("sliding-window", 0)).toBe(false);
        expect(result.current.getCompletedCount("sliding-window")).toBe(0);
      });
    });

    it("should load progress from localStorage", async () => {
      const storedProgress = {
        "sliding-window": [0, 1, 2],
        "two-pointers": [0],
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storedProgress));

      const { result } = renderHook(() => usePatternProgress(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.isCompleted("sliding-window", 0)).toBe(true);
        expect(result.current.isCompleted("sliding-window", 1)).toBe(true);
        expect(result.current.isCompleted("sliding-window", 2)).toBe(true);
        expect(result.current.isCompleted("sliding-window", 3)).toBe(false);
        expect(result.current.isCompleted("two-pointers", 0)).toBe(true);
        expect(result.current.getCompletedCount("sliding-window")).toBe(3);
      });
    });
  });

  describe("markComplete", () => {
    it("should mark a section as complete", async () => {
      const { result } = renderHook(() => usePatternProgress(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.isCompleted("dp-basics", 0)).toBe(false);
      });

      act(() => {
        result.current.markComplete("dp-basics", 0);
      });

      expect(result.current.isCompleted("dp-basics", 0)).toBe(true);
      expect(result.current.getCompletedCount("dp-basics")).toBe(1);
    });

    it("should save to localStorage when marking complete", async () => {
      const { result } = renderHook(() => usePatternProgress(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.isCompleted("dp-basics", 0)).toBe(false);
      });

      act(() => {
        result.current.markComplete("dp-basics", 2);
      });

      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          "pattern_progress",
          expect.stringContaining("dp-basics")
        );
      });
    });

    it("should call backend API when user is logged in", async () => {
      vi.mocked(useAuth).mockReturnValue({
        user: mockUser,
        isLoading: false,
        isAuthenticated: true,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        loginWithGoogle: vi.fn(),
        handleGoogleCallback: vi.fn(),
        refreshUser: vi.fn(),
      });

      const { result } = renderHook(() => usePatternProgress(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.isCompleted("dp-basics", 0)).toBe(false);
      });

      act(() => {
        result.current.markComplete("dp-basics", 3);
      });

      await waitFor(() => {
        expect(apiClient.markSectionComplete).toHaveBeenCalledWith(
          "dp-basics",
          3
        );
      });
    });
  });

  describe("markIncomplete", () => {
    it("should mark a section as incomplete", async () => {
      const storedProgress = { "dp-basics": [0, 1] };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storedProgress));

      const { result } = renderHook(() => usePatternProgress(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.isCompleted("dp-basics", 0)).toBe(true);
      });

      act(() => {
        result.current.markIncomplete("dp-basics", 0);
      });

      expect(result.current.isCompleted("dp-basics", 0)).toBe(false);
      expect(result.current.getCompletedCount("dp-basics")).toBe(1);
    });

    it("should call backend API when user is logged in", async () => {
      vi.mocked(useAuth).mockReturnValue({
        user: mockUser,
        isLoading: false,
        isAuthenticated: true,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        loginWithGoogle: vi.fn(),
        handleGoogleCallback: vi.fn(),
        refreshUser: vi.fn(),
      });

      const storedProgress = { "dp-basics": [0, 1] };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storedProgress));

      const { result } = renderHook(() => usePatternProgress(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.isCompleted("dp-basics", 0)).toBe(true);
      });

      act(() => {
        result.current.markIncomplete("dp-basics", 0);
      });

      await waitFor(() => {
        expect(apiClient.markSectionIncomplete).toHaveBeenCalledWith(
          "dp-basics",
          0
        );
      });
    });
  });

  describe("toggleComplete", () => {
    it("should toggle from incomplete to complete", async () => {
      const { result } = renderHook(() => usePatternProgress(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.isCompleted("sliding-window", 0)).toBe(false);
      });

      act(() => {
        result.current.toggleComplete("sliding-window", 0);
      });

      expect(result.current.isCompleted("sliding-window", 0)).toBe(true);
    });

    it("should toggle from complete to incomplete", async () => {
      const storedProgress = { "sliding-window": [0] };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storedProgress));

      const { result } = renderHook(() => usePatternProgress(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.isCompleted("sliding-window", 0)).toBe(true);
      });

      act(() => {
        result.current.toggleComplete("sliding-window", 0);
      });

      expect(result.current.isCompleted("sliding-window", 0)).toBe(false);
    });
  });

  describe("getProgress", () => {
    it("should calculate progress percentage", async () => {
      const storedProgress = { "dp-basics": [0, 1, 2] };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storedProgress));

      const { result } = renderHook(() => usePatternProgress(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.getProgress("dp-basics", 10)).toBe(30);
      });
    });

    it("should return 0 for empty pattern", async () => {
      const { result } = renderHook(() => usePatternProgress(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.getProgress("unknown-pattern", 10)).toBe(0);
      });
    });

    it("should return 0 when total sections is 0", async () => {
      const { result } = renderHook(() => usePatternProgress(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.getProgress("dp-basics", 0)).toBe(0);
      });
    });
  });

  describe("backend sync", () => {
    it("should sync with backend when user logs in", async () => {
      const storedProgress = { "dp-basics": [0, 1] };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storedProgress));

      const mergedProgress = {
        "dp-basics": [0, 1, 2],
        "sliding-window": [0],
      };
      vi.mocked(apiClient.syncPatternProgress).mockResolvedValue({
        success: true,
        data: { progress: mergedProgress },
      });

      vi.mocked(useAuth).mockReturnValue({
        user: mockUser,
        isLoading: false,
        isAuthenticated: true,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        loginWithGoogle: vi.fn(),
        handleGoogleCallback: vi.fn(),
        refreshUser: vi.fn(),
      });

      const { result } = renderHook(() => usePatternProgress(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(apiClient.syncPatternProgress).toHaveBeenCalledWith({
          "dp-basics": [0, 1],
        });
      });

      await waitFor(() => {
        expect(result.current.isCompleted("dp-basics", 2)).toBe(true);
        expect(result.current.isCompleted("sliding-window", 0)).toBe(true);
      });
    });
  });
});

describe("usePatternProgress hook", () => {
  it("should throw error when used outside provider", () => {
    expect(() => {
      renderHook(() => usePatternProgress());
    }).toThrow("usePatternProgress must be used within a PatternProgressProvider");
  });
});
