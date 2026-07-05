"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Question } from "@/types";

const SCROLL_STORAGE_KEY = "problems_scroll_position";

interface ProblemsTabProps {
  questions: Question[];
  completed: Set<string>;
  onToggleComplete: (id: string) => void;
  patternId: string;
}

const difficultyColors: Record<string, string> = {
  Easy: "text-green-400",
  Medium: "text-yellow-400",
  Hard: "text-red-400",
};

const difficultyOrder = { Easy: 0, Medium: 1, Hard: 2 };

type SortOption = "difficulty" | "frequency" | "name" | "status";

// Convert problem name to slug format
function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function ProblemsTab({
  questions,
  completed,
  onToggleComplete,
  patternId,
}: ProblemsTabProps) {
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("");
  const [showCompleted, setShowCompleted] = useState<
    "all" | "completed" | "todo"
  >("all");
  const [sortBy, setSortBy] = useState<SortOption>("difficulty");
  // Restore scroll position when returning from problem page
  useEffect(() => {
    const savedScroll = sessionStorage.getItem(
      `${SCROLL_STORAGE_KEY}_${patternId}`
    );
    if (savedScroll) {
      const scrollTop = parseInt(savedScroll, 10);
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollTop);
      });
      sessionStorage.removeItem(`${SCROLL_STORAGE_KEY}_${patternId}`);
    }
  }, [patternId]);

  // Save scroll position before navigating to problem
  const saveScrollPosition = () => {
    sessionStorage.setItem(
      `${SCROLL_STORAGE_KEY}_${patternId}`,
      window.scrollY.toString()
    );
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...questions];

    // Search filter
    if (search) {
      const query = search.toLowerCase();
      result = result.filter(
        (q) =>
          q.name.toLowerCase().includes(query) ||
          q.pattern.toLowerCase().includes(query)
      );
    }

    // Difficulty filter
    if (difficultyFilter) {
      result = result.filter((q) => q.difficulty === difficultyFilter);
    }

    // Status filter
    if (showCompleted === "completed") {
      result = result.filter((q) => completed.has(q.id));
    } else if (showCompleted === "todo") {
      result = result.filter((q) => !completed.has(q.id));
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "difficulty":
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        case "frequency":
          return b.frequency.length - a.frequency.length;
        case "name":
          return a.name.localeCompare(b.name);
        case "status":
          return (completed.has(a.id) ? 1 : 0) - (completed.has(b.id) ? 1 : 0);
        default:
          return 0;
      }
    });

    return result;
  }, [questions, search, difficultyFilter, showCompleted, sortBy, completed]);

  const stats = {
    total: questions.length,
    completed: questions.filter((q) => completed.has(q.id)).length,
    easy: questions.filter((q) => q.difficulty === "Easy").length,
    medium: questions.filter((q) => q.difficulty === "Medium").length,
    hard: questions.filter((q) => q.difficulty === "Hard").length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gray-900 rounded-md border border-gray-800 p-4 text-center">
          <div className="text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-sm text-gray-500">Total</div>
        </div>
        <div className="bg-gray-900 rounded-md border border-gray-800 p-4 text-center">
          <div className="text-2xl font-bold text-indigo-400">
            {stats.completed}
          </div>
          <div className="text-sm text-gray-500">Solved</div>
        </div>
        <div className="bg-gray-900 rounded-md border border-gray-800 p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{stats.easy}</div>
          <div className="text-sm text-gray-500">Easy</div>
        </div>
        <div className="bg-gray-900 rounded-md border border-gray-800 p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {stats.medium}
          </div>
          <div className="text-sm text-gray-500">Medium</div>
        </div>
        <div className="bg-gray-900 rounded-md border border-gray-800 p-4 text-center">
          <div className="text-2xl font-bold text-red-400">{stats.hard}</div>
          <div className="text-sm text-gray-500">Hard</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 rounded-md border border-gray-800 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
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
              <input
                type="text"
                placeholder="Search problems..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <select
            value={showCompleted}
            onChange={(e) =>
              setShowCompleted(e.target.value as "all" | "completed" | "todo")
            }
            className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="todo">To Do</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-800">
          <span className="text-sm text-gray-500">Sort by:</span>
          {(["difficulty", "frequency", "name", "status"] as SortOption[]).map(
            (option) => (
              <button
                key={option}
                onClick={() => setSortBy(option)}
                className={`text-sm px-3 py-1.5 rounded-md transition-colors ${
                  sortBy === option
                    ? "bg-indigo-500/20 text-indigo-400"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            )
          )}
        </div>
      </div>

      {/* Problems List */}
      <div className="space-y-2">
        {filteredAndSorted.map((q, idx) => (
          <div
            key={q.id}
            className={`flex items-center gap-4 p-4 bg-gray-900 rounded-md border transition-all hover:translate-x-1 ${
              completed.has(q.id)
                ? "border-green-500/30 bg-green-500/5"
                : "border-gray-800 hover:border-gray-700"
            }`}
          >
            {/* Number */}
            <span className="w-8 text-center text-sm text-gray-600 font-mono">
              {idx + 1}
            </span>

            {/* Checkbox */}
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

            {/* Problem Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Link
                  href={`/problems/${nameToSlug(q.name)}`}
                  className="text-white hover:text-indigo-400 font-medium transition truncate"
                >
                  {q.name}
                </Link>
                <a
                  href={q.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-300 transition flex-shrink-0"
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
                    <span className="text-gray-700">•</span>
                    <span className="text-gray-500 truncate max-w-[200px]">
                      {q.companies.slice(0, 3).join(", ")}
                      {q.companies.length > 3 && ` +${q.companies.length - 3}`}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Metadata */}
            <div className="flex items-center gap-4">
              <span
                className={`text-sm font-medium ${difficultyColors[q.difficulty]}`}
              >
                {q.difficulty}
              </span>
              <span className="text-sm" title="Frequency">
                {q.frequency}
              </span>
              <Link
                href={`/problems/${nameToSlug(q.name)}?from=${patternId}`}
                onClick={saveScrollPosition}
                className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium rounded-md transition"
              >
                Solve
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filteredAndSorted.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No problems match your filters
        </div>
      )}
    </div>
  );
}
