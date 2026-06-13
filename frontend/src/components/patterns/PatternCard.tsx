"use client";

import Link from "next/link";
import { Pattern } from "@/types";

interface PatternCardProps {
  pattern: Pattern;
  questionsCount: number;
  completedCount: number;
  isFree?: boolean;
  isLocked?: boolean;
}

const difficultyColors: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  Easy: {
    bg: "rgba(34, 197, 94, 0.15)",
    text: "#4ade80",
    border: "rgba(34, 197, 94, 0.3)",
  },
  Medium: {
    bg: "rgba(250, 204, 21, 0.15)",
    text: "#facc15",
    border: "rgba(250, 204, 21, 0.3)",
  },
  Hard: {
    bg: "rgba(239, 68, 68, 0.15)",
    text: "#f87171",
    border: "rgba(239, 68, 68, 0.3)",
  },
  "Easy-Medium": {
    bg: "rgba(52, 211, 153, 0.15)",
    text: "#34d399",
    border: "rgba(52, 211, 153, 0.3)",
  },
  "Medium-Hard": {
    bg: "rgba(251, 146, 60, 0.15)",
    text: "#fb923c",
    border: "rgba(251, 146, 60, 0.3)",
  },
};

export default function PatternCard({
  pattern,
  questionsCount,
  completedCount,
  isFree = false,
  isLocked = false,
}: PatternCardProps) {
  const progress =
    questionsCount > 0
      ? Math.round((completedCount / questionsCount) * 100)
      : 0;
  const colors =
    difficultyColors[pattern.difficulty] || difficultyColors["Medium"];

  return (
    <Link href={`/patterns/${pattern.id}`}>
      <div
        className="group relative p-5 transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full flex flex-col"
        style={{
          background: "var(--card-bg)",
          backdropFilter: "blur(var(--blur))",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--border-1)",
          boxShadow: "var(--shadow-sm)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--border-2)";
          e.currentTarget.style.boxShadow =
            "var(--shadow-lg), var(--shadow-glow)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--border-1)";
          e.currentTarget.style.boxShadow = "var(--shadow-sm)";
        }}
      >
        {/* Title & Difficulty */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <h3
              className="font-semibold transition-colors"
              style={{
                color: "var(--text-1)",
                fontFamily: "var(--font-heading)",
              }}
            >
              {pattern.category}
            </h3>
            <svg
              className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all"
              style={{ color: "var(--accent-1)" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="inline-block px-2 py-0.5 text-xs font-medium"
              style={{
                background: colors.bg,
                color: colors.text,
                border: `1px solid ${colors.border}`,
                borderRadius: "var(--radius-full)",
              }}
            >
              {pattern.difficulty}
            </span>
            {isFree && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium"
                style={{
                  background: "rgba(34, 197, 94, 0.15)",
                  color: "#4ade80",
                  border: "1px solid rgba(34, 197, 94, 0.3)",
                  borderRadius: "var(--radius-full)",
                }}
              >
                Free
              </span>
            )}
            {isLocked && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium"
                style={{
                  background: "rgba(251, 191, 36, 0.15)",
                  color: "#fbbf24",
                  border: "1px solid rgba(251, 191, 36, 0.3)",
                  borderRadius: "var(--radius-full)",
                }}
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Pro
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p
          className="text-sm mb-4 line-clamp-2 flex-grow"
          style={{ color: "var(--text-2)" }}
        >
          {pattern.description.slice(0, 100)}...
        </p>

        {/* Progress */}
        <div className="mt-auto">
          <div className="flex items-center justify-between text-sm mb-2">
            <span style={{ color: "var(--text-3)" }}>
              {completedCount}/{questionsCount} solved
            </span>
            <span className="font-medium" style={{ color: "var(--accent-1)" }}>
              {progress}%
            </span>
          </div>
          <div
            className="h-2 overflow-hidden"
            style={{
              background: "var(--bg-elevated)",
              borderRadius: "var(--radius-full)",
            }}
          >
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                background: "var(--accent-gradient)",
                borderRadius: "var(--radius-full)",
              }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
