"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Pattern } from "@/types";
import { questions, categoryToPatternId } from "@/lib/questions";
import { useProgress } from "@/contexts/ProgressContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import TutorialTab from "./tabs/TutorialTab";
import ProblemsTab from "./tabs/ProblemsTab";
import CheatsheetTab from "./tabs/CheatsheetTab";
import { Highlightable } from "@/components/ui/Highlightable";
import { UpgradePrompt } from "@/components/pricing";

type Tab = "tutorial" | "problems" | "cheatsheet";

const FREE_PATTERN_IDS = new Set([
  "sliding-window",
  "two-pointers",
  "binary-search",
]);

interface PatternPageClientProps {
  pattern: Pattern;
}

const difficultyColors: Record<string, string> = {
  Easy: "bg-green-500/20 text-green-400",
  Medium: "bg-yellow-500/20 text-yellow-400",
  Hard: "bg-red-500/20 text-red-400",
  "Easy-Medium": "bg-emerald-500/20 text-emerald-400",
  "Medium-Hard": "bg-orange-500/20 text-orange-400",
};

export default function PatternPageClient({ pattern }: PatternPageClientProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<Tab>(
    tabParam === "problems" || tabParam === "cheatsheet" ? tabParam : "tutorial"
  );

  useEffect(() => {
    if (tabParam === "problems" || tabParam === "cheatsheet" || tabParam === "tutorial") {
      setActiveTab(tabParam);
    }
  }, [tabParam]);
  const { completed, toggleComplete } = useProgress();
  const { isPro, isLoading: subscriptionLoading } = useSubscription();

  const isLocked = !isPro && !FREE_PATTERN_IDS.has(pattern.id);

  const patternQuestions = useMemo(() => {
    return questions.filter((q) => {
      const patternId = categoryToPatternId[q.category];
      return patternId === pattern.id;
    });
  }, [pattern.id]);

  const stats = useMemo(() => {
    const total = patternQuestions.length;
    const done = patternQuestions.filter((q) => completed.has(q.id)).length;
    return {
      total,
      done,
      percent: total > 0 ? Math.round((done / total) * 100) : 0,
    };
  }, [patternQuestions, completed]);

  const tabs = [
    { id: "tutorial" as Tab, label: "Tutorial" },
    { id: "problems" as Tab, label: "Problems", count: stats.total },
    { id: "cheatsheet" as Tab, label: "Cheatsheet" },
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span>Back</span>
            </Link>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  {pattern.category}
                </h1>
                <span
                  className={`px-3 py-1 text-sm rounded-full ${difficultyColors[pattern.difficulty]}`}
                >
                  {pattern.difficulty}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>
                  Time:{" "}
                  <span className="text-indigo-400 font-mono">
                    {pattern.timeComplexity}
                  </span>
                </span>
                <span>
                  Space:{" "}
                  <span className="text-purple-400 font-mono">
                    {pattern.spaceComplexity}
                  </span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  {stats.done}/{stats.total}
                </div>
                <div className="text-sm text-gray-500">problems solved</div>
              </div>
              <div className="w-16 h-16 relative">
                <svg
                  className="w-full h-full transform -rotate-90"
                  viewBox="0 0 64 64"
                >
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    className="text-gray-800"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="url(#miniGradient)"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${stats.percent * 1.76} 176`}
                  />
                  <defs>
                    <linearGradient
                      id="miniGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
                  {stats.percent}%
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 md:mt-6 -mb-px overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 md:px-4 py-2 md:py-3 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-gray-950 text-white border-t border-l border-r border-gray-800"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="px-2 py-0.5 text-xs bg-gray-800 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-6xl mx-auto px-4 py-4 md:py-8">
        {subscriptionLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-gray-400">Loading...</div>
          </div>
        ) : isLocked ? (
          <UpgradePrompt
            feature={`the ${pattern.category} pattern`}
            title="Premium Pattern"
            description={`The ${pattern.category} pattern is available exclusively for Pro members. Upgrade to unlock all patterns, visualizers, and premium features.`}
          />
        ) : (
          <>
            {activeTab === "tutorial" && (
              <Highlightable
                contentType="pattern_tutorial"
                contentId={pattern.id}
              >
                <TutorialTab pattern={pattern} />
              </Highlightable>
            )}
            {activeTab === "problems" && (
              <ProblemsTab
                questions={patternQuestions}
                completed={completed}
                onToggleComplete={toggleComplete}
                patternId={pattern.id}
              />
            )}
            {activeTab === "cheatsheet" && (
              <Highlightable
                contentType="pattern_cheatsheet"
                contentId={pattern.id}
              >
                <CheatsheetTab pattern={pattern} />
              </Highlightable>
            )}
          </>
        )}
      </div>
    </div>
  );
}
