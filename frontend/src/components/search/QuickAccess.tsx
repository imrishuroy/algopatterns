"use client";

import React from "react";
import { useSearch } from "@/contexts/SearchContext";
import type { SearchResult, SearchContentType } from "@/types";

interface QuickAccessProps {
  onSearchClick: (query: string) => void;
  onResultClick: (result: SearchResult) => void;
}

const TYPE_ICONS: Record<SearchContentType, React.ReactNode> = {
  pattern: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
      />
    </svg>
  ),
  question: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  concept: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
      />
    </svg>
  ),
  article: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  ),
  solution: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
      />
    </svg>
  ),
  highlight: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
      />
    </svg>
  ),
};

export function QuickAccess({
  // skipcq: JS-0067, JS-R1005
  onSearchClick,
  onResultClick,
}: QuickAccessProps) {
  const {
    recentSearches,
    recentlyViewed,
    favorites,
    clearHistory,
    clearRecentViews,
  } = useSearch();

  const hasContent =
    recentSearches.length > 0 ||
    recentlyViewed.length > 0 ||
    favorites.length > 0;

  if (!hasContent) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-gray-400">
          Search patterns, questions, concepts, and more
        </p>
        <p className="text-xs mt-3 text-gray-600">
          Press{" "}
          <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-500">
            tab
          </kbd>{" "}
          to switch between keyword and AI search
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Recent Searches
            </h3>
            <button
              onClick={clearHistory}
              className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
            >
              Clear
            </button>
          </div>
          <div className="space-y-0.5">
            {recentSearches.slice(0, 5).map((search) => (
              <button
                key={search.id}
                onClick={() => onSearchClick(search.query)}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-gray-800 text-left transition-colors group"
              >
                <svg
                  className="w-4 h-4 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-gray-300 group-hover:text-white transition-colors">
                  {search.query}
                </span>
                <span className="ml-auto text-xs text-gray-600">
                  {search.resultCount} results
                </span>
                {search.mode === "ai" && (
                  <span className="px-1.5 py-0.5 text-xs bg-gray-800 text-gray-500 rounded">
                    AI
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Recently Viewed
            </h3>
            <button
              onClick={clearRecentViews}
              className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
            >
              Clear
            </button>
          </div>
          <div className="space-y-0.5">
            {recentlyViewed.slice(0, 5).map((item) => (
              <button
                key={item.id}
                onClick={() =>
                  onResultClick({
                    id: item.contentId,
                    type: item.contentType,
                    title: item.title,
                    description: "",
                    url: item.url,
                    score: 0,
                  })
                }
                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-gray-800 text-left transition-colors group"
              >
                <span className="text-gray-600">
                  {TYPE_ICONS[item.contentType]}
                </span>
                <span className="text-gray-300 group-hover:text-white transition-colors truncate">
                  {item.title}
                </span>
                <span className="ml-auto text-xs text-gray-600 capitalize">
                  {item.contentType}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Favorites */}
      {favorites.length > 0 && (
        <section>
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Favorites
          </h3>
          <div className="space-y-0.5">
            {favorites.slice(0, 5).map((item) => (
              <button
                key={item.id}
                onClick={() =>
                  onResultClick({
                    id: item.contentId,
                    type: item.contentType,
                    title: item.title,
                    description: "",
                    url: item.url,
                    score: 0,
                  })
                }
                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-gray-800 text-left transition-colors group"
              >
                <svg
                  className="w-4 h-4 text-yellow-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-gray-300 group-hover:text-white transition-colors truncate">
                  {item.title}
                </span>
                <span className="ml-auto text-xs text-gray-600 capitalize">
                  {item.contentType}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
