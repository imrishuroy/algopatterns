"use client";

import React from "react";
import type { PatternQuickAction } from "@/types/ai";

const actionLabels: Record<PatternQuickAction, string> = {
  explain: "Explain Concept",
  compare: "Compare Patterns",
  whenToUse: "When to Use",
  walkThrough: "Walk Through",
  practiceNext: "Practice Next",
};

const actionIcons: Record<PatternQuickAction, React.ReactNode> = {
  explain: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
      />
    </svg>
  ),
  compare: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
      />
    </svg>
  ),
  whenToUse: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  walkThrough: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  practiceNext: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    </svg>
  ),
};

interface PatternQuickActionsProps {
  patternId: string;
  patternName: string;
  activeSection: string;
  onAction: (action: PatternQuickAction, message: string) => void;
}

export function PatternQuickActions({
  patternId,
  patternName,
  activeSection,
  onAction,
}: PatternQuickActionsProps) {
  const triggers: Record<PatternQuickAction, () => void> = {
    explain: () => {
      const sectionLabel = activeSection || "this pattern";
      onAction(
        "explain",
        `Please explain the "${sectionLabel}" concept in simpler terms with a concrete example.`
      );
    },
    compare: () => {
      onAction(
        "compare",
        `Compare the ${patternName} pattern with sliding window. When should I use one over the other?`
      );
    },
    whenToUse: () => {
      onAction(
        "whenToUse",
        `Summarize when to use the ${patternName} pattern. What are the key signals in a problem description that indicate this pattern fits?`
      );
    },
    walkThrough: () => {
      const sectionLabel = activeSection || "the core technique";
      onAction(
        "walkThrough",
        `Walk me through "${sectionLabel}" step by step. Show me what happens at each step and why it works.`
      );
    },
    practiceNext: () => {
      onAction(
        "practiceNext",
        `Which problem should I start with to practice the ${patternName} pattern? Recommend problems in order from easiest to hardest from the curated list.`
      );
    },
  };

  const allActions: PatternQuickAction[] = [
    "explain",
    "compare",
    "whenToUse",
    "walkThrough",
    "practiceNext",
  ];

  return (
    <div className="flex flex-wrap gap-1.5 p-3 border-b border-gray-800">
      {allActions.map((action) => (
        <button
          key={action}
          onClick={triggers[action]}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-md text-xs font-medium transition-colors border border-gray-700"
        >
          {actionIcons[action]}
          {actionLabels[action]}
        </button>
      ))}
    </div>
  );
}
