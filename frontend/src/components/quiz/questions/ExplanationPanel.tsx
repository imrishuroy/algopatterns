"use client";

import type { Answer } from "@/types/quiz";

interface ExplanationPanelProps {
  answer: Answer;
}

export default function ExplanationPanel({ answer }: ExplanationPanelProps) {
  return (
    <div
      className={`mt-6 p-5 rounded-md border ${
        answer.isCorrect
          ? "bg-green-950/30 border-green-800/50"
          : "bg-red-950/20 border-red-800/40"
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        {answer.isCorrect ? (
          <>
            <svg
              className="w-5 h-5 text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-semibold text-green-400">Correct!</span>
          </>
        ) : (
          <>
            <svg
              className="w-5 h-5 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-semibold text-red-400">Incorrect</span>
          </>
        )}
      </div>
      <p className="text-gray-300 leading-relaxed">{answer.explanation}</p>
    </div>
  );
}
