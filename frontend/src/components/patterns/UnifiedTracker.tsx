"use client";

import { useState, useMemo } from "react";
import { Pattern, Question } from "@/types";
import { categoryToPatternId } from "@/lib/questions";
import PatternSection from "./PatternSection";
import QuoteSection from "@/components/QuoteSection";
import patternsData from "@/lib/patterns.json";
import { useProgress } from "@/contexts/ProgressContext";
import Confetti from "@/components/ui/Confetti";

interface UnifiedTrackerProps {
  questions: Question[];
}

export default function UnifiedTracker({ questions }: UnifiedTrackerProps) {
  const patterns = patternsData as Pattern[];
  const { completed, toggleComplete, resetProgress, celebrationKey } =
    useProgress();
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");

  const companies = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => q.companies.forEach((c) => set.add(c)));
    return [...set].sort();
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (search && !q.name.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (difficultyFilter && q.difficulty !== difficultyFilter) return false;
      if (companyFilter && !q.companies.includes(companyFilter)) return false;
      return true;
    });
  }, [questions, search, difficultyFilter, companyFilter]);

  const categories = useMemo(() => {
    return [...new Set(filteredQuestions.map((q) => q.category))];
  }, [filteredQuestions]);

  const patternsByCategory = useMemo(() => {
    const map = new Map<string, Pattern>();
    patterns.forEach((p) => {
      const matchingCategories = Object.entries(categoryToPatternId)
        .filter(([, patternId]) => patternId === p.id)
        .map(([category]) => category);
      matchingCategories.forEach((cat) => map.set(cat, p));
    });
    return map;
  }, [patterns]);

  return (
    <div>
      {celebrationKey > 0 && <Confetti key={celebrationKey} />}
      <div className="bg-gray-800/50 rounded-md p-4 mb-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Filters
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setSearch("");
                setDifficultyFilter("");
                setCompanyFilter("");
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300"
            >
              Clear Filters
            </button>
            <button
              onClick={resetProgress}
              className="text-xs text-gray-500 hover:text-red-400 transition flex items-center gap-1"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Reset Progress
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <input
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Companies</option>
            {companies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <QuoteSection />

      {categories.map((category) => {
        const pattern = patternsByCategory.get(category);
        const categoryQuestions = filteredQuestions.filter(
          (q) => q.category === category
        );

        if (categoryQuestions.length === 0) return null;

        if (!pattern) {
          return (
            <section key={category} className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">{category}</h2>
                  <span className="text-sm text-gray-500">
                    {categoryQuestions.length} problems
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                {categoryQuestions.map((q) => (
                  <div
                    key={q.id}
                    className={`flex items-center gap-4 p-4 bg-gray-800/50 rounded-md border transition hover:translate-x-1 ${
                      completed.has(q.id)
                        ? "border-green-500/30 bg-green-500/5"
                        : "border-gray-700"
                    }`}
                  >
                    <button
                      onClick={() => toggleComplete(q.id)}
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
                      <a
                        href={q.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-indigo-400 font-medium transition"
                      >
                        {q.name}
                      </a>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500">
                        <span>{q.pattern}</span>
                        {q.companies.length > 0 && (
                          <>
                            <span className="text-gray-600">|</span>
                            <span>{q.companies.join(", ")}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span
                        className={
                          q.difficulty === "Easy"
                            ? "text-green-400"
                            : q.difficulty === "Medium"
                              ? "text-yellow-400"
                              : "text-red-400"
                        }
                      >
                        {q.difficulty}
                      </span>
                      <span>{q.frequency}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        }

        return (
          <PatternSection
            key={category}
            pattern={pattern}
            questions={categoryQuestions}
            completed={completed}
            onToggleComplete={toggleComplete}
          />
        );
      })}

      {filteredQuestions.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No questions match your filters
        </div>
      )}
    </div>
  );
}
