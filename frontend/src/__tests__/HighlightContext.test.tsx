import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { HighlightProvider, useHighlights } from "@/contexts/HighlightContext";
import { clearCache } from "@/lib/highlightDB";
import type { Highlight } from "@/types";
import type { ReactNode } from "react";

// Mock useAuth to always return authenticated
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { id: "user-123", email: "test@test.com" },
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
  }),
  AuthProvider: ({ children }: { children: ReactNode }) => children,
}));

// Mock the API client
vi.mock("@/lib/api", () => ({
  apiClient: {
    getHighlightsForContent: vi.fn(),
    createHighlight: vi.fn(),
    updateHighlight: vi.fn(),
    deleteHighlight: vi.fn(),
    getHighlight: vi.fn(),
    setAccessToken: vi.fn(),
    getAccessToken: vi.fn(() => "test-token"),
    refreshToken: vi.fn(),
  },
}));

// Import the mocked module
import { apiClient } from "@/lib/api";

const mockHighlight: Highlight = {
  id: "highlight-1",
  userId: "user-123",
  contentType: "pattern_tutorial",
  contentId: "two-pointers",
  startOffset: 10,
  endOffset: 50,
  selectedText: "test highlight",
  color: "yellow",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  version: 1,
};

// Wrapper component with provider
const Wrapper = ({ children }: { children: ReactNode }) => (
  <HighlightProvider>{children}</HighlightProvider>
);

describe("HighlightContext", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await clearCache();

    // Mock navigator.onLine
    Object.defineProperty(navigator, "onLine", {
      value: true,
      writable: true,
      configurable: true,
    });
  });

  describe("fetchHighlightsForContent", () => {
    it("should fetch highlights from API and update state", async () => {
      vi.mocked(apiClient.getHighlightsForContent).mockResolvedValue({
        success: true,
        data: { highlights: [mockHighlight] },
      });

      const { result } = renderHook(() => useHighlights(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.fetchHighlightsForContent(
          "pattern_tutorial",
          "two-pointers"
        );
      });

      await waitFor(() => {
        const highlights = result.current.getHighlightsForContent(
          "pattern_tutorial",
          "two-pointers"
        );
        expect(highlights).toHaveLength(1);
        expect(highlights[0].id).toBe("highlight-1");
      });
    });

    it("should not fetch if already fetched", async () => {
      vi.mocked(apiClient.getHighlightsForContent).mockResolvedValue({
        success: true,
        data: { highlights: [mockHighlight] },
      });

      const { result } = renderHook(() => useHighlights(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.fetchHighlightsForContent(
          "pattern_tutorial",
          "two-pointers"
        );
      });

      await act(async () => {
        await result.current.fetchHighlightsForContent(
          "pattern_tutorial",
          "two-pointers"
        );
      });

      // Should only call API once
      expect(apiClient.getHighlightsForContent).toHaveBeenCalledTimes(1);
    });
  });

  describe("createHighlight", () => {
    it("should create highlight with optimistic update", async () => {
      const serverResponse = { ...mockHighlight, id: "server-id" };
      vi.mocked(apiClient.createHighlight).mockResolvedValue({
        success: true,
        data: serverResponse,
      });

      const { result } = renderHook(() => useHighlights(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        const created = await result.current.createHighlight({
          contentType: "pattern_tutorial",
          contentId: "two-pointers",
          startOffset: 10,
          endOffset: 50,
          selectedText: "test highlight",
          color: "yellow",
        });
        expect(created?.id).toBe("server-id");
      });

      const highlights = result.current.getHighlightsForContent(
        "pattern_tutorial",
        "two-pointers"
      );
      expect(highlights).toHaveLength(1);
      expect(highlights[0].id).toBe("server-id");
    });

    it("should keep optimistic update when offline", async () => {
      // Simulate offline
      Object.defineProperty(navigator, "onLine", {
        value: false,
        configurable: true,
      });
      vi.mocked(apiClient.createHighlight).mockRejectedValue(
        new Error("Network error")
      );

      const { result } = renderHook(() => useHighlights(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.createHighlight({
          contentType: "pattern_tutorial",
          contentId: "two-pointers",
          startOffset: 10,
          endOffset: 50,
          selectedText: "offline highlight",
          color: "blue",
        });
      });

      // Highlight should still be visible (temp id)
      const highlights = result.current.getHighlightsForContent(
        "pattern_tutorial",
        "two-pointers"
      );
      expect(highlights).toHaveLength(1);
      expect(highlights[0].id).toMatch(/^temp-/);
    });

    it("should remove optimistic update on API error when online", async () => {
      vi.mocked(apiClient.createHighlight).mockResolvedValue({
        success: false,
        data: {} as Highlight,
        error: { code: "ERROR", message: "Failed" },
      });

      const { result } = renderHook(() => useHighlights(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.createHighlight({
          contentType: "pattern_tutorial",
          contentId: "two-pointers",
          startOffset: 10,
          endOffset: 50,
          selectedText: "fail highlight",
          color: "yellow",
        });
      });

      const highlights = result.current.getHighlightsForContent(
        "pattern_tutorial",
        "two-pointers"
      );
      expect(highlights).toHaveLength(0);
    });
  });

  describe("updateHighlight", () => {
    it("should update highlight with optimistic update", async () => {
      // First fetch the highlight
      vi.mocked(apiClient.getHighlightsForContent).mockResolvedValue({
        success: true,
        data: { highlights: [mockHighlight] },
      });

      const updatedHighlight = {
        ...mockHighlight,
        color: "blue" as const,
        version: 2,
      };
      vi.mocked(apiClient.updateHighlight).mockResolvedValue({
        success: true,
        data: updatedHighlight,
      });

      const { result } = renderHook(() => useHighlights(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.fetchHighlightsForContent(
          "pattern_tutorial",
          "two-pointers"
        );
      });

      await act(async () => {
        await result.current.updateHighlight("highlight-1", {
          color: "blue",
          version: 1,
        });
      });

      const highlights = result.current.getHighlightsForContent(
        "pattern_tutorial",
        "two-pointers"
      );
      expect(highlights[0].color).toBe("blue");
    });
  });

  describe("deleteHighlight", () => {
    it("should delete highlight with optimistic update", async () => {
      // First fetch the highlight
      vi.mocked(apiClient.getHighlightsForContent).mockResolvedValue({
        success: true,
        data: { highlights: [mockHighlight] },
      });
      vi.mocked(apiClient.deleteHighlight).mockResolvedValue({
        success: true,
        data: undefined as never,
      });

      const { result } = renderHook(() => useHighlights(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.fetchHighlightsForContent(
          "pattern_tutorial",
          "two-pointers"
        );
      });

      expect(
        result.current.getHighlightsForContent(
          "pattern_tutorial",
          "two-pointers"
        )
      ).toHaveLength(1);

      await act(async () => {
        await result.current.deleteHighlight("highlight-1");
      });

      expect(
        result.current.getHighlightsForContent(
          "pattern_tutorial",
          "two-pointers"
        )
      ).toHaveLength(0);
    });

    it("should keep deletion when offline", async () => {
      // First fetch the highlight
      vi.mocked(apiClient.getHighlightsForContent).mockResolvedValue({
        success: true,
        data: { highlights: [mockHighlight] },
      });

      const { result } = renderHook(() => useHighlights(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.fetchHighlightsForContent(
          "pattern_tutorial",
          "two-pointers"
        );
      });

      // Simulate offline
      Object.defineProperty(navigator, "onLine", {
        value: false,
        configurable: true,
      });
      vi.mocked(apiClient.deleteHighlight).mockRejectedValue(
        new Error("Network error")
      );

      await act(async () => {
        await result.current.deleteHighlight("highlight-1");
      });

      // Should still be deleted from UI
      expect(
        result.current.getHighlightsForContent(
          "pattern_tutorial",
          "two-pointers"
        )
      ).toHaveLength(0);
    });
  });

  describe("clearHighlights", () => {
    it("should clear all highlights", async () => {
      vi.mocked(apiClient.getHighlightsForContent).mockResolvedValue({
        success: true,
        data: { highlights: [mockHighlight] },
      });

      const { result } = renderHook(() => useHighlights(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.fetchHighlightsForContent(
          "pattern_tutorial",
          "two-pointers"
        );
      });

      expect(
        result.current.getHighlightsForContent(
          "pattern_tutorial",
          "two-pointers"
        )
      ).toHaveLength(1);

      await act(async () => {
        await result.current.clearHighlights();
      });

      expect(
        result.current.getHighlightsForContent(
          "pattern_tutorial",
          "two-pointers"
        )
      ).toHaveLength(0);
    });
  });
});
