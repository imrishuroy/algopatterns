import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { SearchProvider, useSearch } from "@/contexts/SearchContext";
import { searchDB } from "@/lib/searchDB";
import type { ReactNode } from "react";

// Mock useAuth
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    isAuthenticated: false,
    user: null,
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
    search: vi.fn(),
    getSearchHistory: vi.fn(),
    getRecentViews: vi.fn(),
    getFavorites: vi.fn(),
    addToSearchHistory: vi.fn(),
    trackView: vi.fn(),
    addFavorite: vi.fn(),
    removeFavorite: vi.fn(),
    clearSearchHistory: vi.fn(),
    clearRecentViews: vi.fn(),
  },
}));

// Wrapper component with provider
const Wrapper = ({ children }: { children: ReactNode }) => (
  <SearchProvider>{children}</SearchProvider>
);

describe("SearchContext", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    localStorage.clear();
    // Clear searchDB
    await searchDB.sync({ searches: [], recentViews: [], favorites: [] });
  });

  describe("useSearch hook", () => {
    it("should throw if used outside provider", () => {
      // Suppress console.error for this test
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => {
        renderHook(() => useSearch());
      }).toThrow("useSearch must be used within a SearchProvider");

      consoleSpy.mockRestore();
    });
  });

  describe("modal state", () => {
    it("should initialize with modal closed", () => {
      const { result } = renderHook(() => useSearch(), { wrapper: Wrapper });
      expect(result.current.isOpen).toBe(false);
    });

    it("should open modal", () => {
      const { result } = renderHook(() => useSearch(), { wrapper: Wrapper });

      act(() => {
        result.current.openSearch();
      });

      expect(result.current.isOpen).toBe(true);
    });

    it("should close modal", () => {
      const { result } = renderHook(() => useSearch(), { wrapper: Wrapper });

      act(() => {
        result.current.openSearch();
      });
      act(() => {
        result.current.closeSearch();
      });

      expect(result.current.isOpen).toBe(false);
    });
  });

  describe("search mode", () => {
    it("should default to keyword mode", () => {
      const { result } = renderHook(() => useSearch(), { wrapper: Wrapper });
      expect(result.current.searchMode).toBe("keyword");
    });

    it("should change search mode", () => {
      const { result } = renderHook(() => useSearch(), { wrapper: Wrapper });

      act(() => {
        result.current.setSearchMode("ai");
      });

      expect(result.current.searchMode).toBe("ai");
    });

    it("should persist search mode to localStorage", () => {
      const { result } = renderHook(() => useSearch(), { wrapper: Wrapper });

      act(() => {
        result.current.setSearchMode("ai");
      });

      expect(localStorage.getItem("searchMode")).toBe("ai");
    });

    it("should restore search mode from localStorage", () => {
      localStorage.setItem("searchMode", "ai");

      const { result } = renderHook(() => useSearch(), { wrapper: Wrapper });

      expect(result.current.searchMode).toBe("ai");
    });
  });

  describe("context functions exist", () => {
    it("should provide addToHistory function", () => {
      const { result } = renderHook(() => useSearch(), { wrapper: Wrapper });
      expect(typeof result.current.addToHistory).toBe("function");
    });

    it("should provide trackView function", () => {
      const { result } = renderHook(() => useSearch(), { wrapper: Wrapper });
      expect(typeof result.current.trackView).toBe("function");
    });

    it("should provide addFavorite function", () => {
      const { result } = renderHook(() => useSearch(), { wrapper: Wrapper });
      expect(typeof result.current.addFavorite).toBe("function");
    });

    it("should provide removeFavorite function", () => {
      const { result } = renderHook(() => useSearch(), { wrapper: Wrapper });
      expect(typeof result.current.removeFavorite).toBe("function");
    });

    it("should provide isFavorite function", () => {
      const { result } = renderHook(() => useSearch(), { wrapper: Wrapper });
      expect(typeof result.current.isFavorite).toBe("function");
    });

    it("should provide clearHistory function", () => {
      const { result } = renderHook(() => useSearch(), { wrapper: Wrapper });
      expect(typeof result.current.clearHistory).toBe("function");
    });

    it("should provide clearRecentViews function", () => {
      const { result } = renderHook(() => useSearch(), { wrapper: Wrapper });
      expect(typeof result.current.clearRecentViews).toBe("function");
    });
  });

  describe("initial state", () => {
    it("should start with empty recent searches", () => {
      const { result } = renderHook(() => useSearch(), { wrapper: Wrapper });
      expect(result.current.recentSearches).toEqual([]);
    });

    it("should start with empty recently viewed", () => {
      const { result } = renderHook(() => useSearch(), { wrapper: Wrapper });
      expect(result.current.recentlyViewed).toEqual([]);
    });

    it("should start with empty favorites", () => {
      const { result } = renderHook(() => useSearch(), { wrapper: Wrapper });
      expect(result.current.favorites).toEqual([]);
    });

    it("should start with isLoading false", () => {
      const { result } = renderHook(() => useSearch(), { wrapper: Wrapper });
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("isFavorite", () => {
    it("should return false for non-favorited items", () => {
      const { result } = renderHook(() => useSearch(), { wrapper: Wrapper });
      expect(result.current.isFavorite("pattern", "sliding-window")).toBe(
        false
      );
    });
  });

  describe("cached data loading", () => {
    it("should load cached data on mount", async () => {
      // Pre-populate cache
      await searchDB.addSearch({
        query: "cached query",
        mode: "keyword",
        resultCount: 3,
        createdAt: new Date().toISOString(),
      });

      const { result } = renderHook(() => useSearch(), { wrapper: Wrapper });

      // Wait for cache to load
      await waitFor(() => {
        expect(result.current.recentSearches.length).toBeGreaterThan(0);
      });

      expect(result.current.recentSearches[0].query).toBe("cached query");
    });
  });

  describe("addToHistory integration", () => {
    it("should call addToHistory without errors", async () => {
      const { result } = renderHook(() => useSearch(), { wrapper: Wrapper });

      // Should not throw
      await act(async () => {
        await result.current.addToHistory("test query", "keyword", 5);
      });

      // Verify the function completed - we check indexedDB instead
      const cached = await searchDB.getAll();
      expect(cached.searches.some((s) => s.query === "test query")).toBe(true);
    });
  });

  describe("trackView integration", () => {
    it("should call trackView without errors", async () => {
      const { result } = renderHook(() => useSearch(), { wrapper: Wrapper });

      // Should not throw
      await act(async () => {
        await result.current.trackView(
          "pattern",
          "two-pointers",
          "Two Pointers",
          "/patterns/two-pointers"
        );
      });

      // Verify the function completed - we check indexedDB instead
      const cached = await searchDB.getAll();
      expect(
        cached.recentViews.some((v) => v.contentId === "two-pointers")
      ).toBe(true);
    });
  });

  describe("favorites integration", () => {
    it("should call addFavorite without errors", async () => {
      const { result } = renderHook(() => useSearch(), { wrapper: Wrapper });

      // Should not throw
      await act(async () => {
        await result.current.addFavorite("pattern", "sliding-window");
      });

      // Verify the function completed - we check indexedDB instead
      const cached = await searchDB.getAll();
      expect(
        cached.favorites.some((f) => f.contentId === "sliding-window")
      ).toBe(true);
    });
  });
});
