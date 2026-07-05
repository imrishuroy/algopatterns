"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { apiClient } from "@/lib/api";
import { searchDB } from "@/lib/searchDB";
import { useAuth } from "./AuthContext";
import type {
  SearchHistoryItem,
  RecentViewItem,
  FavoriteItem,
  SearchMode,
  SearchContentType,
} from "@/types";

interface SearchContextValue {
  isOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  recentSearches: SearchHistoryItem[];
  recentlyViewed: RecentViewItem[];
  favorites: FavoriteItem[];
  searchMode: SearchMode;
  setSearchMode: (mode: SearchMode) => void;
  addToHistory: (
    query: string,
    mode: SearchMode,
    resultCount: number
  ) => Promise<void>;
  trackView: (
    contentType: SearchContentType,
    contentId: string,
    title: string,
    url: string
  ) => Promise<void>;
  addFavorite: (
    contentType: SearchContentType,
    contentId: string
  ) => Promise<void>;
  removeFavorite: (id: string) => Promise<void>;
  isFavorite: (contentType: SearchContentType, contentId: string) => boolean;
  clearHistory: () => Promise<void>;
  clearRecentViews: () => Promise<void>;
  isLoading: boolean;
}

const SearchContext = createContext<SearchContextValue | null>(null);

// skipcq: JS-0067
export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
}

interface SearchProviderProps {
  children: React.ReactNode;
}

// Helper to get initial search mode from localStorage
// skipcq: JS-0067
function getInitialSearchMode(): SearchMode {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("searchMode");
    if (saved === "ai" || saved === "keyword") {
      return saved;
    }
  }
  return "keyword";
}

export function SearchProvider({ children }: SearchProviderProps) {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<SearchHistoryItem[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<RecentViewItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [searchMode, setSearchMode] =
    useState<SearchMode>(getInitialSearchMode);
  const [isLoading, setIsLoading] = useState(false);

  // Load cached data on mount
  useEffect(() => {
    const loadCachedData = async () => {
      try {
        const cached = await searchDB.getAll();
        setRecentSearches(cached.searches);
        setRecentlyViewed(cached.recentViews);
        setFavorites(cached.favorites);
      } catch (error) {
        console.error("Failed to load search cache:", error);
      }
    };

    loadCachedData();
  }, []);

  // Fetch fresh data from server when authenticated
  useEffect(() => {
    // skipcq: JS-R1005
    if (!isAuthenticated) return;

    const loadServerData = async () => {
      setIsLoading(true);
      try {
        const [historyRes, recentRes, favRes] = await Promise.all([
          apiClient.getSearchHistory(20),
          apiClient.getRecentViews(20),
          apiClient.getFavorites(50),
        ]);

        if (historyRes.success && historyRes.data) {
          setRecentSearches(historyRes.data.history || []);
        }
        if (recentRes.success && recentRes.data) {
          setRecentlyViewed(recentRes.data.recent || []);
        }
        if (favRes.success && favRes.data) {
          setFavorites(favRes.data.favorites || []);
        }

        // Sync to IndexedDB
        await searchDB.sync({
          searches: historyRes.data?.history || [],
          recentViews: recentRes.data?.recent || [],
          favorites: favRes.data?.favorites || [],
        });
      } catch (error) {
        console.error("Failed to fetch search data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadServerData();
  }, [isAuthenticated]);

  // Wrap setSearchMode to also persist to localStorage
  const handleSetSearchMode = useCallback((mode: SearchMode) => {
    setSearchMode(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("searchMode", mode);
    }
  }, []);

  const openSearch = useCallback(() => setIsOpen(true), []);
  const closeSearch = useCallback(() => setIsOpen(false), []);

  const addToHistory = useCallback(
    async (query: string, mode: SearchMode, resultCount: number) => {
      const newItem: SearchHistoryItem = {
        id: crypto.randomUUID(),
        query,
        mode,
        resultCount,
        createdAt: new Date().toISOString(),
      };

      // Optimistic update
      setRecentSearches((prev) => [newItem, ...prev.slice(0, 19)]);

      // Save to IndexedDB
      await searchDB.addSearch({
        query,
        mode,
        resultCount,
        createdAt: newItem.createdAt,
      });

      // Save to server if authenticated
      if (isAuthenticated) {
        try {
          await apiClient.addToSearchHistory(query, mode, resultCount);
        } catch (error) {
          console.error("Failed to save search to history:", error);
        }
      }
    },
    [isAuthenticated]
  );

  const trackView = useCallback(
    async (
      contentType: SearchContentType,
      contentId: string,
      title: string,
      url: string
    ) => {
      const existingIndex = recentlyViewed.findIndex(
        (v) => v.contentType === contentType && v.contentId === contentId
      );

      const newItem: RecentViewItem = {
        id:
          existingIndex >= 0
            ? recentlyViewed[existingIndex].id
            : crypto.randomUUID(),
        contentType,
        contentId,
        title,
        url,
        viewCount:
          existingIndex >= 0 ? recentlyViewed[existingIndex].viewCount + 1 : 1,
        lastViewedAt: new Date().toISOString(),
      };

      // Optimistic update
      setRecentlyViewed((prev) => {
        const filtered = prev.filter(
          (v) => !(v.contentType === contentType && v.contentId === contentId)
        );
        return [newItem, ...filtered.slice(0, 19)];
      });

      // Save to IndexedDB
      await searchDB.addRecentView(newItem);

      // Save to server if authenticated
      if (isAuthenticated) {
        try {
          await apiClient.trackView({ contentType, contentId, title, url });
        } catch (error) {
          console.error("Failed to track view:", error);
        }
      }
    },
    [isAuthenticated, recentlyViewed]
  );

// skipcq: JS-R1005

  const addFavorite = useCallback(
    async (contentType: SearchContentType, contentId: string) => {
      // Check if already favorited
      const existing = favorites.find(
        (f) => f.contentType === contentType && f.contentId === contentId
      );
      if (existing) return;

      const newItem: FavoriteItem = {
        id: crypto.randomUUID(),
        contentType,
        contentId,
        title: contentId, // Will be updated by server
        url: `/${contentType}s/${contentId}`,
        createdAt: new Date().toISOString(),
      };

      // Optimistic update
      setFavorites((prev) => [newItem, ...prev]);

      // Save to IndexedDB
      await searchDB.addFavorite(newItem);

      // Save to server if authenticated
      if (isAuthenticated) {
        try {
          const res = await apiClient.addFavorite({ contentType, contentId });
          if (res.success && res.data) {
            // Update with server response
            const data = res.data;
            setFavorites((prev) =>
              prev.map((f) =>
                f.id === newItem.id
                  ? { ...f, id: data.id, createdAt: data.createdAt }
                  : f
              )
            );
          }
        } catch (error) {
          console.error("Failed to add favorite:", error);
          // Rollback on error
          setFavorites((prev) => prev.filter((f) => f.id !== newItem.id));
        }
      }
    },
    [isAuthenticated, favorites]
  );

  const removeFavorite = useCallback(
    async (id: string) => {
      // Optimistic update
      const removed = favorites.find((f) => f.id === id);
      setFavorites((prev) => prev.filter((f) => f.id !== id));

      // Remove from IndexedDB
      await searchDB.removeFavorite(id);

      // Remove from server if authenticated
      if (isAuthenticated) {
        try {
          await apiClient.removeFavorite(id);
        } catch (error) {
          console.error("Failed to remove favorite:", error);
          // Rollback on error
          if (removed) {
            setFavorites((prev) => [removed, ...prev]);
          }
        }
      }
    },
    [isAuthenticated, favorites]
  );

  const isFavorite = useCallback(
    (contentType: SearchContentType, contentId: string) => {
      return favorites.some(
        (f) => f.contentType === contentType && f.contentId === contentId
      );
    },
    [favorites]
  );

  const clearHistory = useCallback(async () => {
    setRecentSearches([]);
    await searchDB.clearSearches();

    if (isAuthenticated) {
      try {
        await apiClient.clearSearchHistory();
      } catch (error) {
        console.error("Failed to clear search history:", error);
      }
    }
  }, [isAuthenticated]);

  const clearRecentViews = useCallback(async () => {
    setRecentlyViewed([]);
    await searchDB.clearRecentViews();

    if (isAuthenticated) {
      try {
        await apiClient.clearRecentViews();
      } catch (error) {
        console.error("Failed to clear recent views:", error);
      }
    }
  }, [isAuthenticated]);

  const value = useMemo(
    () => ({
      isOpen,
      openSearch,
      closeSearch,
      recentSearches,
      recentlyViewed,
      favorites,
      searchMode,
      setSearchMode: handleSetSearchMode,
      addToHistory,
      trackView,
      addFavorite,
      removeFavorite,
      isFavorite,
      clearHistory,
      clearRecentViews,
      isLoading,
    }),
    [
      isOpen,
      openSearch,
      closeSearch,
      recentSearches,
      recentlyViewed,
      favorites,
      searchMode,
      handleSetSearchMode,
      addToHistory,
      trackView,
      addFavorite,
      removeFavorite,
      isFavorite,
      clearHistory,
      clearRecentViews,
      isLoading,
    ]
  );

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
}
