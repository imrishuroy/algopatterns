import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, renderHook, act, waitFor } from "@testing-library/react";
import { ProgressProvider, useProgress } from "@/contexts/ProgressContext";
import type { ReactNode } from "react";

const STORAGE_KEY = "algopatterns-completed";

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@/lib/api", () => ({
  apiClient: {
    getProgress: vi.fn(),
    toggleProgress: vi.fn(),
    syncProgress: vi.fn(),
  },
}));

import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const mockedUseAuth = vi.mocked(useAuth);
const mockedApiClient = vi.mocked(apiClient);

const Wrapper = ({ children }: { children: ReactNode }) => (
  <ProgressProvider>{children}</ProgressProvider>
);

function mockAuthenticated() {
  mockedUseAuth.mockReturnValue({
    isAuthenticated: true,
    user: {
      id: "user-123",
      email: "test@test.com",
      name: "Test",
      emailVerified: true,
    },
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    refreshUser: vi.fn(),
    loginWithGoogle: vi.fn(),
    handleGoogleCallback: vi.fn(),
  });
}

function mockUnauthenticated() {
  mockedUseAuth.mockReturnValue({
    isAuthenticated: false,
    user: null,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    refreshUser: vi.fn(),
    loginWithGoogle: vi.fn(),
    handleGoogleCallback: vi.fn(),
  });
}

describe("ProgressContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    mockAuthenticated();

    mockedApiClient.getProgress.mockResolvedValue({
      success: true,
      data: { questionIds: ["q1", "q2"] },
    });

    mockedApiClient.syncProgress.mockImplementation(async (ids: string[]) => ({
      success: true,
      data: { questionIds: ids },
    }));

    mockedApiClient.toggleProgress.mockImplementation(
      async (_id: string, _completed: boolean) => ({
        success: true,
        data: { questionIds: [] },
      })
    );
  });

  describe("renders children", () => {
    it("should render children passed to provider", async () => {
      let container: HTMLElement | undefined;

      await act(async () => {
        const rendered = render(
          <ProgressProvider>
            <div data-testid="child">child content</div>
          </ProgressProvider>
        );
        container = rendered.container;
      });

      expect(container!.innerHTML).toContain("child content");
    });
  });

  describe("loading state", () => {
    it("should start with isLoading true and become false after load", async () => {
      const { result } = renderHook(() => useProgress(), {
        wrapper: Wrapper,
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it("should load progress from API when authenticated", async () => {
      const { result } = renderHook(() => useProgress(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockedApiClient.getProgress).toHaveBeenCalledTimes(1);
      expect(result.current.completed).toEqual(new Set(["q1", "q2"]));
    });

    it("should load progress from localStorage when not authenticated", async () => {
      mockUnauthenticated();

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(["local-q1", "local-q2"])
      );

      const { result } = renderHook(() => useProgress(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockedApiClient.getProgress).not.toHaveBeenCalled();
      expect(result.current.completed).toEqual(
        new Set(["local-q1", "local-q2"])
      );
    });
  });

  describe("error handling", () => {
    it("should return empty set when API fails and localStorage is empty", async () => {
      mockedApiClient.getProgress.mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useProgress(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.completed).toEqual(new Set());
    });

    it("should load from localStorage fallback when API fails with local data", async () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(["fallback-q1", "fallback-q2"])
      );

      mockedApiClient.getProgress.mockRejectedValue(new Error("Network error"));

      // syncProgress should preserve the fallback IDs
      mockedApiClient.syncProgress.mockImplementation(
        async (ids: string[]) => ({
          success: true,
          data: { questionIds: ids },
        })
      );

      const { result } = renderHook(() => useProgress(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.completed).toEqual(
        new Set(["fallback-q1", "fallback-q2"])
      );
    });

    it("should not call API when unauthenticated and localStorage is empty", async () => {
      mockUnauthenticated();

      const { result } = renderHook(() => useProgress(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockedApiClient.getProgress).not.toHaveBeenCalled();
      expect(result.current.completed).toEqual(new Set());
    });
  });

  describe("toggleComplete", () => {
    it("should add an item to completed set and call API when authenticated", async () => {
      mockedApiClient.getProgress.mockResolvedValue({
        success: true,
        data: { questionIds: [] },
      });

      mockedApiClient.toggleProgress.mockResolvedValue({
        success: true,
        data: { questionIds: ["q3"] },
      });

      const { result } = renderHook(() => useProgress(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.toggleComplete("q3");
      });

      expect(mockedApiClient.toggleProgress).toHaveBeenCalledWith("q3", true);
      expect(result.current.completed.has("q3")).toBe(true);
    });

    it("should remove an item from completed set when toggling again", async () => {
      mockedApiClient.getProgress.mockResolvedValue({
        success: true,
        data: { questionIds: ["q1"] },
      });

      mockedApiClient.toggleProgress.mockResolvedValue({
        success: true,
        data: { questionIds: [] },
      });

      const { result } = renderHook(() => useProgress(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.toggleComplete("q1");
      });

      expect(mockedApiClient.toggleProgress).toHaveBeenCalledWith("q1", false);
      expect(result.current.completed.has("q1")).toBe(false);
    });

    it("should update completed set from API response after toggle", async () => {
      mockedApiClient.getProgress.mockResolvedValue({
        success: true,
        data: { questionIds: [] },
      });

      const { result } = renderHook(() => useProgress(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockedApiClient.toggleProgress.mockResolvedValue({
        success: true,
        data: { questionIds: ["q1", "q2"] },
      });

      await act(async () => {
        await result.current.toggleComplete("q1");
      });

      expect(result.current.completed).toEqual(new Set(["q1", "q2"]));
    });

    it("should revert on API error during toggle", async () => {
      mockedApiClient.getProgress.mockResolvedValue({
        success: true,
        data: { questionIds: [] },
      });

      const { result } = renderHook(() => useProgress(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockedApiClient.toggleProgress.mockRejectedValue(
        new Error("Server error")
      );

      await act(async () => {
        await result.current.toggleComplete("q1");
      });

      expect(result.current.completed.has("q1")).toBe(false);
    });

    it("should save to localStorage when not authenticated", async () => {
      mockUnauthenticated();

      const { result } = renderHook(() => useProgress(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.toggleComplete("local-q1");
      });

      expect(mockedApiClient.toggleProgress).not.toHaveBeenCalled();
      expect(result.current.completed.has("local-q1")).toBe(true);
      expect(localStorage.getItem(STORAGE_KEY)).toContain("local-q1");
    });

    it("should increment celebrationKey when adding a new item", async () => {
      mockedApiClient.getProgress.mockResolvedValue({
        success: true,
        data: { questionIds: [] },
      });

      const { result } = renderHook(() => useProgress(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const initialKey = result.current.celebrationKey;

      await act(async () => {
        await result.current.toggleComplete("q1");
      });

      expect(result.current.celebrationKey).toBe(initialKey + 1);
    });

    it("should not increment celebrationKey when removing an item", async () => {
      mockedApiClient.getProgress.mockResolvedValue({
        success: true,
        data: { questionIds: ["q1"] },
      });

      const { result } = renderHook(() => useProgress(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const initialKey = result.current.celebrationKey;

      await act(async () => {
        await result.current.toggleComplete("q1");
      });

      expect(result.current.celebrationKey).toBe(initialKey);
    });
  });

  describe("syncFromLocal", () => {
    it("should sync local progress to API and clear localStorage", async () => {
      mockedApiClient.getProgress.mockResolvedValue({
        success: true,
        data: { questionIds: [] },
      });

      mockedApiClient.syncProgress.mockResolvedValue({
        success: true,
        data: { questionIds: ["synced-q1", "synced-q2"] },
      });

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(["local-q1", "local-q2"])
      );

      const { result } = renderHook(() => useProgress(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.syncFromLocal();
      });

      expect(mockedApiClient.syncProgress).toHaveBeenCalledWith([
        "local-q1",
        "local-q2",
      ]);
      expect(result.current.completed).toEqual(
        new Set(["synced-q1", "synced-q2"])
      );
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it("should do nothing when not authenticated", async () => {
      mockUnauthenticated();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(["local-q1"]));

      const { result } = renderHook(() => useProgress(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.syncFromLocal();
      });

      expect(mockedApiClient.syncProgress).not.toHaveBeenCalled();
      expect(localStorage.getItem(STORAGE_KEY)).toBe(
        JSON.stringify(["local-q1"])
      );
    });

    it("should do nothing when localStorage is empty", async () => {
      const { result } = renderHook(() => useProgress(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.syncFromLocal();
      });

      expect(mockedApiClient.syncProgress).not.toHaveBeenCalled();
    });

    it("should keep localStorage on sync failure", async () => {
      mockedApiClient.getProgress.mockResolvedValue({
        success: true,
        data: { questionIds: [] },
      });

      mockedApiClient.syncProgress.mockRejectedValue(new Error("Sync failed"));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(["local-q1"]));

      const { result } = renderHook(() => useProgress(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.syncFromLocal();
      });

      expect(localStorage.getItem(STORAGE_KEY)).toBe(
        JSON.stringify(["local-q1"])
      );
    });
  });

  describe("resetProgress", () => {
    beforeEach(() => {
      vi.spyOn(globalThis, "confirm").mockReturnValue(true);
    });

    it("should clear completed set and localStorage", async () => {
      mockedApiClient.getProgress.mockResolvedValue({
        success: true,
        data: { questionIds: ["q1", "q2"] },
      });

      localStorage.setItem(STORAGE_KEY, JSON.stringify(["q1", "q2"]));

      const { result } = renderHook(() => useProgress(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.resetProgress();
      });

      expect(result.current.completed.size).toBe(0);
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it("should call toggleProgress for each completed item when authenticated", async () => {
      mockedApiClient.getProgress.mockResolvedValue({
        success: true,
        data: { questionIds: ["q1", "q2"] },
      });

      const { result } = renderHook(() => useProgress(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.resetProgress();
      });

      expect(mockedApiClient.toggleProgress).toHaveBeenCalledWith("q1", false);
      expect(mockedApiClient.toggleProgress).toHaveBeenCalledWith("q2", false);
    });

    it("should not do anything if confirm is cancelled", async () => {
      vi.spyOn(globalThis, "confirm").mockReturnValue(false);

      mockedApiClient.getProgress.mockResolvedValue({
        success: true,
        data: { questionIds: ["q1"] },
      });

      const { result } = renderHook(() => useProgress(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.resetProgress();
      });

      expect(result.current.completed).toEqual(new Set(["q1"]));
      expect(mockedApiClient.toggleProgress).not.toHaveBeenCalled();
    });

    it("should handle errors during reset gracefully", async () => {
      mockedApiClient.getProgress.mockResolvedValue({
        success: true,
        data: { questionIds: ["q1", "q2"] },
      });

      mockedApiClient.toggleProgress.mockRejectedValue(
        new Error("Reset error")
      );

      const { result } = renderHook(() => useProgress(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.resetProgress();
      });

      expect(result.current.completed.size).toBe(0);
    });
  });

  describe("auto-sync on login", () => {
    it("should sync local progress to API when user logs in with local data", async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(["local-q1"]));

      mockedApiClient.syncProgress.mockResolvedValue({
        success: true,
        data: { questionIds: ["local-q1", "api-q1"] },
      });

      const { result } = renderHook(() => useProgress(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.completed).toEqual(
          new Set(["local-q1", "api-q1"])
        );
      });

      expect(mockedApiClient.syncProgress).toHaveBeenCalledWith(["local-q1"]);
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it("should not sync when there is no local progress data", async () => {
      mockedApiClient.getProgress.mockResolvedValue({
        success: true,
        data: { questionIds: ["api-q1"] },
      });

      const { result } = renderHook(() => useProgress(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockedApiClient.syncProgress).not.toHaveBeenCalled();
      expect(result.current.completed).toEqual(new Set(["api-q1"]));
    });

    it("should not sync when not authenticated", async () => {
      mockUnauthenticated();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(["local-q1"]));

      const { result } = renderHook(() => useProgress(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockedApiClient.syncProgress).not.toHaveBeenCalled();
    });

    it("should keep localStorage if auto-sync fails", async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(["local-q1"]));

      mockedApiClient.syncProgress.mockRejectedValue(new Error("Sync failed"));

      const { result } = renderHook(() => useProgress(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(localStorage.getItem(STORAGE_KEY)).toBe(
        JSON.stringify(["local-q1"])
      );
    });
  });
});

describe("useProgress hook", () => {
  it("should throw error when used outside provider", () => {
    expect(() => {
      renderHook(() => useProgress());
    }).toThrow("useProgress must be used within a ProgressProvider");
  });
});
