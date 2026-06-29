"use client";

import { useState } from "react";
import { aiApiClient } from "@/lib/ai-api";
import type { HintResponse, ReviewResponse, ExplainResponse } from "@/types/ai";

interface QuickActionsProps {
  problemSlug: string;
  problemTitle: string;
  problemDescription?: string;
  code: string;
  language: string;
  errorMessage?: string;
  hintLevel: number;
  onHintUsed: () => void;
  onResult: (result: string, type: "hint" | "review" | "explain") => void;
}

export function QuickActions({
  problemSlug,
  problemTitle,
  problemDescription,
  code,
  language,
  errorMessage,
  hintLevel,
  onHintUsed,
  onResult,
}: QuickActionsProps) {
  const [loading, setLoading] = useState<"hint" | "review" | "explain" | null>(null);

  const getHint = async () => {
    if (!code.trim()) return;
    setLoading("hint");
    try {
      const response = await aiApiClient.getHint({
        problemSlug,
        problemTitle,
        problemDescription,
        code,
        language,
        hintLevel,
      });
      if (response.success) {
        const data = response.data as HintResponse;
        onResult(data.hint, "hint");
        onHintUsed();
      }
    } catch (err) {
      console.error("Failed to get hint:", err);
    }
    setLoading(null);
  };

  const getReview = async () => {
    if (!code.trim()) return;
    setLoading("review");
    try {
      const response = await aiApiClient.reviewCode({
        problemSlug,
        problemTitle,
        problemDescription,
        code,
        language,
      });
      if (response.success) {
        const data = response.data as ReviewResponse;
        onResult(data.review, "review");
      }
    } catch (err) {
      console.error("Failed to get review:", err);
    }
    setLoading(null);
  };

  const explainError = async () => {
    if (!errorMessage) return;
    setLoading("explain");
    try {
      const response = await aiApiClient.explainError({
        code,
        language,
        errorType: "runtime",
        errorMessage,
      });
      if (response.success) {
        const data = response.data as ExplainResponse;
        onResult(data.explanation, "explain");
      }
    } catch (err) {
      console.error("Failed to explain error:", err);
    }
    setLoading(null);
  };

  return (
    <div className="flex flex-wrap gap-2 p-3 border-b border-gray-800">
      <button
        onClick={getHint}
        disabled={loading !== null || !code.trim()}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-md text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-700"
      >
        {loading === "hint" ? (
          <Spinner />
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        )}
        Hint {hintLevel}/4
      </button>

      <button
        onClick={getReview}
        disabled={loading !== null || !code.trim()}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-md text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-700"
      >
        {loading === "review" ? (
          <Spinner />
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
        )}
        Review
      </button>

      {errorMessage && (
        <button
          onClick={explainError}
          disabled={loading !== null}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-md text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-700"
        >
          {loading === "explain" ? (
            <Spinner />
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
          Explain Error
        </button>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
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
  );
}
