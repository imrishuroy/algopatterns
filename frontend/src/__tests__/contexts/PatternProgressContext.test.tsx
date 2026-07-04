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
    getPatternProgress: vi.fn(),
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

const originalRAF = window.requestAnimationFrame;
window.requestAnimationFrame = (cb: FrameRequestCallback) => {
  cb(0);
  return 0;
};

describe("PatternProgressContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    vi.mocked(apiClient.getPatternProgress).mockResolvedValue({
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

  describe("initial state - not logged in", () => {
    it("should start with no completed sections when not logged in", async () => {
      const { result } = renderHook(() => usePatternProgress(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isCompleted("sliding-window", 0)).toBe(false);
      expect(result.current.getCompletedCount("sliding-window")).toBe(0);
    });

    it("should not call API when not logged in", async () => {
      renderHook(() => usePatternProgress(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(apiClient.getPatternProgress).not.toHaveBeenCalled();
      });
    });
  });

  describe("initial state - logged in", () => {
    beforeEach(() => {
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
    });

    it("should load progress from database when logged in", async () => {
      const serverProgress = {
        "sliding-window": [0, 1, 2],
        "two-pointers": [0],
      };
      vi.mocked(apiClient.getPatternProgress).mockResolvedValue({
        success: true,
        data: { progress: serverProgress },
      });

      const { result } = renderHook(() => usePatternProgress(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isCompleted("sliding-window", 0)).toBe(true);
      expect(result.current.isCompleted("sliding-window", 1)).toBe(true);
      expect(result.current.isCompleted("sliding-window", 2)).toBe(true);
      expect(result.current.isCompleted("sliding-window", 3)).toBe(false);
      expect(result.current.isCompleted("two-pointers", 0)).toBe(true);
      expect(result.current.getCompletedCount("sliding-window")).toBe(3);
    });

    it("should call API to fetch progress", async () => {
      renderHook(() => usePatternProgress(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(apiClient.getPatternProgress).toHaveBeenCalled();
      });
    });

    it("should handle API failure gracefully", async () => {
      vi.mocked(apiClient.getPatternProgress).mockRejectedValue(
        new Error("Network error")
      );

      const { result } = renderHook(() => usePatternProgress(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.getCompletedCount("sliding-window")).toBe(0);
    });
  });

  describe("auth loading state", () => {
    it("should wait for auth to finish loading before fetching progress", () => {
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        isLoading: true,
        isAuthenticated: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        loginWithGoogle: vi.fn(),
        handleGoogleCallback: vi.fn(),
        refreshUser: vi.fn(),
      });

      renderHook(() => usePatternProgress(), {
        wrapper: Wrapper,
      });

      expect(apiClient.getPatternProgress).not.toHaveBeenCalled();
    });
  });

  describe("markComplete", () => {
    beforeEach(() => {
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
    });

    it("should mark a section as complete with optimistic update", async () => {
      const { result } = renderHook(() => usePatternProgress(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.markComplete("dp-basics", 0);
      });

      expect(result.current.isCompleted("dp-basics", 0)).toBe(true);
      expect(result.current.getCompletedCount("dp-basics")).toBe(1);
    });

    it("should call backend API when marking complete", async () => {
      const { result } = renderHook(() => usePatternProgress(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
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

    it("should revert optimistic update on API failure", async () => {
      vi.mocked(apiClient.markSectionComplete).mockRejectedValue(
        new Error("Network error")
      );

      const { result } = renderHook(() => usePatternProgress(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.markComplete("dp-basics", 0);
      });

      await waitFor(() => {
        expect(result.current.isCompleted("dp-basics", 0)).toBe(false);
      });
    });

    it("should not call API when not logged in", async () => {
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

      const { result } = renderHook(() => usePatternProgress(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.markComplete("dp-basics", 0);
      });

      expect(apiClient.markSectionComplete).not.toHaveBeenCalled();
    });
  });

  describe("markIncomplete", () => {
    beforeEach(() => {
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
    });

    it("should mark a section as incomplete with optimistic update", async () => {
      vi.mocked(apiClient.getPatternProgress).mockResolvedValue({
        success: true,
        data: { progress: { "dp-basics": [0, 1] } },
      });

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

    it("should call backend API when marking incomplete", async () => {
      vi.mocked(apiClient.getPatternProgress).mockResolvedValue({
        success: true,
        data: { progress: { "dp-basics": [0, 1] } },
      });

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

    it("should revert optimistic update on API failure", async () => {
      vi.mocked(apiClient.getPatternProgress).mockResolvedValue({
        success: true,
        data: { progress: { "dp-basics": [0, 1] } },
      });
      vi.mocked(apiClient.markSectionIncomplete).mockRejectedValue(
        new Error("Network error")
      );

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
        expect(result.current.isCompleted("dp-basics", 0)).toBe(true);
      });
    });
  });

  describe("toggleComplete", () => {
    beforeEach(() => {
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
    });

    it("should toggle from incomplete to complete", async () => {
      const { result } = renderHook(() => usePatternProgress(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.toggleComplete("sliding-window", 0);
      });

      expect(result.current.isCompleted("sliding-window", 0)).toBe(true);
    });

    it("should toggle from complete to incomplete", async () => {
      vi.mocked(apiClient.getPatternProgress).mockResolvedValue({
        success: true,
        data: { progress: { "sliding-window": [0] } },
      });

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
    beforeEach(() => {
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
    });

    it("should calculate progress percentage", async () => {
      vi.mocked(apiClient.getPatternProgress).mockResolvedValue({
        success: true,
        data: { progress: { "dp-basics": [0, 1, 2] } },
      });

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
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.getProgress("unknown-pattern", 10)).toBe(0);
    });

    it("should return 0 when total sections is 0", async () => {
      const { result } = renderHook(() => usePatternProgress(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.getProgress("dp-basics", 0)).toBe(0);
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
