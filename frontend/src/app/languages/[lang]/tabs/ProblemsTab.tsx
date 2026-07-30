"use client";

import { useState, useMemo } from "react";
import { ProblemReference, difficultyColors } from "@/types/languages";
import { ExternalLink, Search, Filter } from "lucide-react";

interface ProblemsTabProps {
  problems: ProblemReference[];
}

// skipcq: JS-0067
export default function ProblemsTab({ problems }: ProblemsTabProps) {
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");

  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.topics.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchesDifficulty =
        difficultyFilter === "all" || p.difficulty === difficultyFilter;
      return matchesSearch && matchesDifficulty;
    });
  }, [problems, search, difficultyFilter]);

  const difficulties = ["all", "Easy", "Medium", "Hard"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-2">
          Practice Problems
        </h2>
        <p className="text-gray-400">
          Common LeetCode problems to practice with this language guide. Sorted
          by relevance to the topics covered.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search problems or topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <div className="flex gap-1">
            {difficulties.map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  difficultyFilter === diff
                    ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                    : "bg-gray-800 text-gray-400 hover:text-white"
                }`}
              >
                {diff === "all" ? "All" : diff}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Problem List */}
      <div className="space-y-3">
        {filteredProblems.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No problems found matching your filters.
          </div>
        ) : (
          filteredProblems.map((problem, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50 border border-gray-800 hover:border-gray-700 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-medium text-white truncate">
                    {problem.name}
                  </h3>
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full ${difficultyColors[problem.difficulty]}`}
                  >
                    {problem.difficulty}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {problem.topics.map((topic, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 text-xs rounded bg-gray-700 text-gray-300"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
              {problem.leetcodeUrl && (
                <a
                  href={problem.leetcodeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-4 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                  title="Open on LeetCode"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              )}
            </div>
          ))
        )}
      </div>

      {/* Stats */}
      <div className="flex gap-6 pt-4 border-t border-gray-800 text-sm text-gray-400">
        <span>
          <span className="text-green-400 font-medium">
            {problems.filter((p) => p.difficulty === "Easy").length}
          </span>{" "}
          Easy
        </span>
        <span>
          <span className="text-yellow-400 font-medium">
            {problems.filter((p) => p.difficulty === "Medium").length}
          </span>{" "}
          Medium
        </span>
        <span>
          <span className="text-red-400 font-medium">
            {problems.filter((p) => p.difficulty === "Hard").length}
          </span>{" "}
          Hard
        </span>
      </div>
    </div>
  );
}
