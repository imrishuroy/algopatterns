"use client";

import React, { useState, useMemo } from "react";
import type {
  SearchResults as SearchResultsType,
  SearchResult,
  SearchContentType,
} from "@/types";

interface SearchResultsProps {
  results: SearchResultsType;
  selectedIndex: number;
  onSelect: (result: SearchResult) => void;
  onHover: (index: number) => void;
  onSuggestionClick: (suggestion: string) => void;
  onTabChange?: (filteredResults: SearchResult[]) => void;
}

type TabType = "all" | SearchContentType;

const TYPE_CONFIG: Record<
  SearchContentType,
  { label: string; shortLabel: string; icon: React.ReactNode; color: string }
> = {
  pattern: {
    label: "Patterns",
    shortLabel: "Patterns",
    icon: (
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
    color: "text-teal-400",
  },
  question: {
    label: "Questions",
    shortLabel: "Questions",
    icon: (
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
    color: "text-orange-400",
  },
  concept: {
    label: "Concepts",
    shortLabel: "Concepts",
    icon: (
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
    color: "text-blue-400",
  },
  article: {
    label: "Articles",
    shortLabel: "Articles",
    icon: (
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
    color: "text-green-400",
  },
  solution: {
    label: "Solutions",
    shortLabel: "Solutions",
    icon: (
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
    color: "text-pink-400",
  },
  highlight: {
    label: "Highlights",
    shortLabel: "Highlights",
    icon: (
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
    color: "text-yellow-400",
  },
};

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "bg-green-600/20 text-green-400",
  Medium: "bg-yellow-600/20 text-yellow-400",
  Hard: "bg-red-600/20 text-red-400",
  "Easy-Medium": "bg-green-600/20 text-green-400",
  "Medium-Hard": "bg-orange-600/20 text-orange-400",
  beginner: "bg-green-600/20 text-green-400",
  intermediate: "bg-yellow-600/20 text-yellow-400",
  advanced: "bg-red-600/20 text-red-400",
};

// Get all results sorted by score
function getAllResultsSorted(results: SearchResultsType): SearchResult[] { // skipcq: JS-0067
  const allResults: SearchResult[] = [];
  const types: SearchContentType[] = [
    "pattern",
    "question",
    "concept",
    "article",
    "solution",
    "highlight",
  ];

  for (const type of types) {
    const items = results.results[type];
    if (items) {
      allResults.push(...items);
    }
  }

  return allResults.sort((a, b) => b.score - a.score);
}

// Get counts for each type
function getTypeCounts(results: SearchResultsType): Record<TabType, number> { // skipcq: JS-0067
  const counts: Record<TabType, number> = {
    all: 0,
    pattern: 0,
    question: 0,
    concept: 0,
    article: 0,
    solution: 0,
    highlight: 0,
  };

  const types: SearchContentType[] = [
    "pattern",
    "question",
    "concept",
    "article",
    "solution",
    "highlight",
  ];

  for (const type of types) {
    const items = results.results[type];
    const count = items?.length || 0;
    counts[type] = count;
    counts.all += count;
  }

  return counts;
}

export function SearchResults({ // skipcq: JS-0067, JS-R1005
  results,
  selectedIndex,
  onSelect,
  onHover,
  onSuggestionClick,
  onTabChange,
}: SearchResultsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("all");

  const counts = useMemo(() => getTypeCounts(results), [results]);

  // Get filtered results based on active tab
  const filteredResults = useMemo(() => {
    if (activeTab === "all") {
      return getAllResultsSorted(results);
    }
    return (results.results[activeTab] || []).sort((a, b) => b.score - a.score);
  }, [results, activeTab]);

  // Handle tab change - reset selection and notify parent
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    // Get new filtered results for this tab
    const newResults =
      tab === "all"
        ? getAllResultsSorted(results)
        : (results.results[tab] || []).sort((a, b) => b.score - a.score);
    onTabChange?.(newResults);
    onHover(0); // Reset selection to first item
  };

  // Tabs to show (only show tabs with results)
  const tabs = useMemo(() => {
    const allTabs: { id: TabType; label: string }[] = [
      { id: "all", label: "All" },
      { id: "pattern", label: "Patterns" },
      { id: "question", label: "Questions" },
      { id: "concept", label: "Concepts" },
      { id: "article", label: "Articles" },
      { id: "solution", label: "Solutions" },
    ];

    // Only include highlight tab if there are highlights
    if (counts.highlight > 0) {
      allTabs.push({ id: "highlight", label: "Highlights" });
    }

    // Filter to only show tabs with results (except "All" which always shows)
    return allTabs.filter((tab) => tab.id === "all" || counts[tab.id] > 0);
  }, [counts]);

  return (
    <div>
      {/* Suggestions */}
      {results.suggestions && results.suggestions.length > 0 && (
        <div className="px-4 py-2 border-b border-gray-800">
          <span className="text-xs text-gray-500">Suggestions: </span>
          {results.suggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => onSuggestionClick(suggestion)}
              className="ml-2 text-xs text-teal-400 hover:text-teal-300 hover:underline"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 px-2 py-2 border-b border-gray-800 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = counts[tab.id];

          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium
                transition-colors whitespace-nowrap
                ${
                  isActive
                    ? "bg-gray-700 text-white"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
                }
              `}
            >
              <span>{tab.label}</span>
              <span
                className={`
                  text-xs px-1.5 py-0.5 rounded-full
                  ${isActive ? "bg-gray-600 text-gray-200" : "bg-gray-800 text-gray-500"}
                `}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Results List */}
      <div className="p-2 max-h-[45vh] lg:max-h-[50vh] xl:max-h-[55vh] 2xl:max-h-[60vh] overflow-y-auto">
        {filteredResults.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            No results in this category
          </div>
        ) : (
          <div className="space-y-0.5">
            {filteredResults.map((result, index) => { // skipcq: JS-R1005
              const config = TYPE_CONFIG[result.type];
              const isSelected = index === selectedIndex;

              return (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => onSelect(result)}
                  onMouseEnter={() => onHover(index)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    isSelected ? "bg-gray-800" : "hover:bg-gray-800/50"
                  }`}
                >
                  {/* Icon */}
                  <span
                    className={`flex-shrink-0 p-1.5 rounded-md bg-gray-800/80 ${config.color}`}
                  >
                    {config.icon}
                  </span>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium truncate">
                        {result.title}
                      </span>
                      {result.difficulty && (
                        <span
                          className={`px-1.5 py-0.5 text-xs rounded ${
                            DIFFICULTY_COLORS[result.difficulty] ||
                            "bg-gray-700 text-gray-300"
                          }`}
                        >
                          {result.difficulty}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {result.description}
                    </p>
                  </div>

                  {/* Type indicator (only in "All" tab) */}
                  {activeTab === "all" && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded bg-gray-800 ${config.color} flex-shrink-0`}
                    >
                      {config.shortLabel}
                    </span>
                  )}

                  {/* Arrow */}
                  {isSelected && (
                    <svg
                      className="w-4 h-4 text-gray-500 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer with total count */}
      <div className="px-4 py-2 text-xs text-gray-600 border-t border-gray-800">
        {results.totalResults} result{results.totalResults !== 1 ? "s" : ""}{" "}
        found
      </div>
    </div>
  );
}

// Export helper for SearchModal to get filtered results for keyboard navigation
export function getFilteredResults( // skipcq: JS-0067
  results: SearchResultsType,
  activeTab: TabType
): SearchResult[] {
  if (activeTab === "all") {
    return getAllResultsSorted(results);
  }
  return (results.results[activeTab] || []).sort((a, b) => b.score - a.score);
}
