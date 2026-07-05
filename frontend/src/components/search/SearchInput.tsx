"use client";

import React, { forwardRef } from "react";
import type { SearchMode } from "@/types";

interface SearchInputProps {
  query: string;
  onQueryChange: (query: string) => void;
  mode: SearchMode;
  onModeChange: (mode: SearchMode) => void;
  onClose: () => void;
  isLoading: boolean;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput( // skipcq: JS-0067, JS-R1005
    { query, onQueryChange, mode, onModeChange, onClose, isLoading },
    ref
  ) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800">
        {/* Search Icon */}
        <svg
          className="w-5 h-5 text-gray-500 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        {/* Input */}
        <input
          ref={ref}
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={
            mode === "ai"
              ? "Ask anything about DSA patterns..."
              : "Search patterns, questions, articles..."
          }
          className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-lg"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />

        {/* Loading Spinner */}
        {isLoading && (
          <svg
            className="w-5 h-5 text-gray-500 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}

        {/* Mode Toggle */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className={`text-xs ${mode === "keyword" ? "text-white" : "text-gray-500"}`}>
            Search
          </span>
          <button
            role="switch"
            aria-checked={mode === "ai"}
            onClick={() => onModeChange(mode === "keyword" ? "ai" : "keyword")}
            className={`relative h-5 w-10 rounded-full transition-colors ${
              mode === "ai" ? "bg-violet-500" : "bg-gray-500"
            }`}
            title="Toggle search mode (Tab)"
          >
            <span
              className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-white shadow-md transition-all ${
                mode === "ai" ? "right-[-1px]" : "left-[-1px]"
              }`}
            />
          </button>
          <span className={`text-xs ${mode === "ai" ? "text-violet-400 font-medium" : "text-gray-500"}`}>
            AI
          </span>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-1.5 text-gray-500 hover:text-gray-300 transition-colors"
          title="Close (Esc)"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    );
  }
);
