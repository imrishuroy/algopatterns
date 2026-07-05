"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { useSearch } from "@/contexts/SearchContext";
import { SearchInput } from "./SearchInput";
import { SearchResults } from "./SearchResults";
import { QuickAccess } from "./QuickAccess";
import { PreviewPanel } from "./PreviewPanel";
import {
  localSearch,
  getLocalSearchCount,
  mergeSearchResults,
} from "@/lib/localSearch";
import type { SearchResults as SearchResultsType, SearchResult } from "@/types";

// Wrapper component that conditionally renders the modal content
// This allows the inner component to reset its state when re-mounted
export function SearchModal() {
  const { isOpen } = useSearch();

  // Check if we're in browser environment for portal rendering
  if (typeof document === "undefined" || !isOpen) return null;

  // Use key to force remount and reset state when modal opens
  return <SearchModalContent key={isOpen ? "open" : "closed"} />;
}

function SearchModalContent() {
  const router = useRouter();
  const { closeSearch, searchMode, setSearchMode, addToHistory } = useSearch();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultsType | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentFilteredResults, setCurrentFilteredResults] = useState<
    SearchResult[]
  >([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Debounced search - combines local and API results
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Don't search for short queries
    if (query.length < 2) {
      // Use microtask to avoid synchronous setState in effect body
      queueMicrotask(() => setResults(null));
      return;
    }

    // Immediately show local search results (instant via microtask)
    const localResults = localSearch(query);
    const localCount = getLocalSearchCount(localResults);

    if (localCount > 0) {
      queueMicrotask(() => {
        setResults({
          query,
          mode: searchMode,
          totalResults: localCount,
          results: localResults,
        });
        setSelectedIndex(0);
      });
    }

    // Then fetch API results and merge
    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await apiClient.search(query, searchMode);
        if (res.success && res.data) {
          // Merge local results with API results
          const mergedResults = mergeSearchResults(
            localResults,
            res.data.results
          );
          const totalCount = Object.values(mergedResults).reduce(
            (sum, arr) => sum + arr.length,
            0
          );
          setResults({
            query,
            mode: searchMode,
            totalResults: totalCount,
            results: mergedResults,
            suggestions: res.data.suggestions,
          });
          setSelectedIndex(0);
        } else if (localCount === 0) {
          // No API results and no local results
          setResults(null);
        }
      } catch (error) {
        console.error("Search failed:", error);
        // Keep local results on API error
        if (localCount === 0) {
          setResults(null);
        }
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, searchMode]);

  // Get results for keyboard navigation
  // Uses currentFilteredResults if set (from tab changes), otherwise falls back to all results
  const getNavigableResults = useCallback((): SearchResult[] => {
    if (currentFilteredResults.length > 0) {
      return currentFilteredResults;
    }
    if (!results) return [];
    const flat: SearchResult[] = [];
    const types = [
      "pattern",
      "question",
      "concept",
      "article",
      "solution",
      "highlight",
    ];
    for (const type of types) {
      const items = results.results[type as keyof typeof results.results];
      if (items) {
        flat.push(...items);
      }
    }
    // Sort by score (higher first) - matches SearchResults display order
    return flat.sort((a, b) => b.score - a.score);
  }, [results, currentFilteredResults]);

  // Update filtered results when search results change (reset to "all" tab)
  useEffect(() => {
    queueMicrotask(() => {
      if (results) {
        const flat: SearchResult[] = [];
        const types = [
          "pattern",
          "question",
          "concept",
          "article",
          "solution",
          "highlight",
        ];
        for (const type of types) {
          const items = results.results[type as keyof typeof results.results];
          if (items) {
            flat.push(...items);
          }
        }
        setCurrentFilteredResults(flat.sort((a, b) => b.score - a.score));
      } else {
        setCurrentFilteredResults([]);
      }
    });
  }, [results]);

  // Navigate to result
  const navigateToResult = useCallback(
    (result: SearchResult) => {
      // Save to history
      if (query) {
        addToHistory(query, searchMode, results?.totalResults || 0);
      }
      closeSearch();

      // For URLs with hashes, use window.location for proper hash navigation
      // This ensures the hashchange event fires and the page scrolls correctly
      if (result.url.includes("#")) {
        window.location.href = result.url;
      } else {
        router.push(result.url);
      }
    },
    [query, searchMode, results, addToHistory, closeSearch, router]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const navigable = getNavigableResults();

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, navigable.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (navigable[selectedIndex]) {
            navigateToResult(navigable[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          closeSearch();
          break;
        case "Tab":
          e.preventDefault();
          setSearchMode(searchMode === "keyword" ? "ai" : "keyword");
          break;
      }
    },
    [
      getNavigableResults,
      selectedIndex,
      navigateToResult,
      closeSearch,
      searchMode,
      setSearchMode,
    ]
  );

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion: string) => {
    setQuery(suggestion);
  }, []);

  // Handle recent search click
  const handleRecentSearchClick = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
  }, []);

  const navigable = getNavigableResults();
  const selectedResult = navigable[selectedIndex];
  const showQuickAccess = query.length < 2;
  const showResults = query.length >= 2 && results;
  const showPreview = selectedResult && !showQuickAccess;

  return createPortal(
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeSearch}
      />

      {/* Modal */}
      <div className="relative flex items-start justify-center pt-[10vh] xl:pt-[12vh] px-4">
        <div
          className="w-full max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl bg-gray-900 rounded-xl border border-gray-700 shadow-2xl overflow-hidden"
          onKeyDown={handleKeyDown}
        >
          {/* Search Input */}
          <SearchInput
            ref={inputRef}
            query={query}
            onQueryChange={setQuery}
            mode={searchMode}
            onModeChange={setSearchMode}
            onClose={closeSearch}
            isLoading={isLoading}
          />

          {/* Content Area */}
          <div className="flex max-h-[55vh] lg:max-h-[60vh] xl:max-h-[65vh] 2xl:max-h-[70vh]">
            {/* Results/Quick Access */}
            <div className="flex-1 overflow-y-auto">
              {showQuickAccess && (
                <QuickAccess
                  onSearchClick={handleRecentSearchClick}
                  onResultClick={navigateToResult}
                />
              )}
              {showResults && (
                <SearchResults
                  results={results}
                  selectedIndex={selectedIndex}
                  onSelect={navigateToResult}
                  onHover={setSelectedIndex}
                  onSuggestionClick={handleSuggestionClick}
                  onTabChange={setCurrentFilteredResults}
                />
              )}
              {query.length >= 2 && !isLoading && !results?.totalResults && (
                <div className="p-8 text-center">
                  <p className="text-gray-400">
                    No results for &quot;{query}&quot;
                  </p>
                  <p className="text-sm mt-2 text-gray-600">
                    Try different keywords or press{" "}
                    <kbd className="px-1 py-0.5 bg-gray-800 rounded text-gray-500">
                      tab
                    </kbd>{" "}
                    for AI search
                  </p>
                </div>
              )}
            </div>

            {/* Preview Panel */}
            {showPreview && <PreviewPanel result={selectedResult} />}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-gray-800 text-xs text-gray-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-gray-800 rounded text-gray-400">
                  ↑↓
                </kbd>
                <span className="text-gray-600">navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-gray-800 rounded text-gray-400">
                  ↵
                </kbd>
                <span className="text-gray-600">open</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400">
                  tab
                </kbd>
                <span className="text-gray-600">toggle mode</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400">
                  esc
                </kbd>
                <span className="text-gray-600">close</span>
              </span>
            </div>
            {searchMode === "ai" && (
              <span className="flex items-center gap-1.5 text-violet-400">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
                  />
                </svg>
                <span>AI semantic search</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
