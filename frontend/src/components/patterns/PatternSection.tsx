"use client";

import { useMemo } from "react";
import { Pattern, Question } from "@/types";
import PatternSectionCard from "./PatternSectionCard";

interface PatternSectionProps {
  pattern: Pattern;
  questions: Question[];
  completed: Set<string>;
  onToggleComplete: (id: string) => void;
}

const difficultyColors: Record<string, string> = {
  Easy: "text-green-400",
  Medium: "text-yellow-400",
  Hard: "text-red-400",
};

export default function PatternSection({
  pattern,
  questions,
  completed,
  onToggleComplete,
}: PatternSectionProps) {
  const stats = useMemo(() => {
    const total = questions.length;
    const done = questions.filter((q) => completed.has(q.id)).length;
    return {
      total,
      done,
      percent: total ? Math.round((done / total) * 100) : 0,
    };
  }, [questions, completed]);

  return (
    <section className="mb-12 scroll-mt-20" id={pattern.id}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {pattern.category}
            </h2>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span>{questions.length} problems</span>
              <span className="text-indigo-400">
                {stats.done}/{stats.total} done
              </span>
              <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-300"
                  style={{ width: `${stats.percent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <PatternSectionCard pattern={pattern} />

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-300 mb-3">
          Practice Problems
        </h3>
        {questions.map((q) => (
          <div
            key={q.id}
            className={`flex items-center gap-4 p-4 bg-gray-800/50 rounded-md border transition hover:translate-x-1 ${
              completed.has(q.id)
                ? "border-green-500/30 bg-green-500/5"
                : "border-gray-700"
            }`}
          >
            <button
              onClick={() => onToggleComplete(q.id)}
              className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition flex-shrink-0 ${
                completed.has(q.id)
                  ? "bg-green-500 border-green-500"
                  : "border-gray-600 hover:border-green-500"
              }`}
            >
              {completed.has(q.id) && (
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <a
                  href={`/problems/${q.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`}
                  className="text-white hover:text-indigo-400 font-medium transition"
                >
                  {q.name}
                </a>
                <a
                  href={q.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-300 transition"
                  title="Open on LeetCode"
                >
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
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
                <span className="text-gray-500">{q.pattern}</span>
                {q.companies.length > 0 && (
                  <>
                    <span className="text-gray-600">|</span>
                    <span className="text-gray-500">
                      {q.companies.join(", ")}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <span className={difficultyColors[q.difficulty]}>
                {q.difficulty}
              </span>
              <span title="Frequency">{q.frequency}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
