"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { Pattern, Question } from "@/types";
import { categoryToPatternId } from "@/lib/questions";
import PatternCard from "./PatternCard";
import patternsData from "@/lib/patterns.json";
import { useProgress } from "@/contexts/ProgressContext";
import { useFilter } from "@/contexts/FilterContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import QuoteSection from "@/components/QuoteSection";
import Dropdown from "@/components/ui/Dropdown";

const FREE_PATTERN_IDS = new Set([
  "sliding-window",
  "two-pointers",
  "binary-search",
]);

interface DashboardProps {
  questions: Question[];
}

const companyLogos: Record<string, string> = {
  Adobe: "/logos/adobe.svg",
  Amazon: "/logos/amazon.svg",
  Anthropic: "/logos/anthropic.svg",
  Apple: "/logos/apple.svg",
  Atlassian: "/logos/atlassian.svg",
  Bloomberg: "/logos/bloomberg.svg",
  Databricks: "/logos/databricks.svg",
  Dropbox: "/logos/dropbox.svg",
  Facebook: "/logos/facebook.svg",
  Flipkart: "/logos/flipkart.svg",
  Google: "/logos/google.svg",
  Intuit: "/logos/intuit.svg",
  LinkedIn: "/logos/linkedin.svg",
  Meta: "/logos/meta.svg",
  Microsoft: "/logos/microsoft.svg",
  Netflix: "/logos/netflix.svg",
  Nvidia: "/logos/nvidia.svg",
  OpenAI: "/logos/openai.svg",
  Palantir: "/logos/palantir.svg",
  Qualcomm: "/logos/qualcomm.svg",
  Salesforce: "/logos/salesforce.svg",
  Stripe: "/logos/stripe.svg",
  Tesla: "/logos/tesla.svg",
  Uber: "/logos/uber.svg",
  Walmart: "/logos/walmart.svg",
};

// skipcq: JS-0067
export default function Dashboard({ questions }: DashboardProps) {
  const patterns = patternsData as Pattern[];
  const { completed } = useProgress();
  const { companyFilter, setCompanyFilter } = useFilter();
  const { isPro } = useSubscription();
  const [searchQuery, setSearchQuery] = useState("");

  const companies = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => q.companies.forEach((c) => set.add(c)));
    return [...set].sort();
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    if (!companyFilter) return questions;
    return questions.filter((q) => q.companies.includes(companyFilter));
  }, [questions, companyFilter]);

  const patternStats = useMemo(() => {
    const stats = new Map<string, { total: number; completed: number }>();

    patterns.forEach((p) => {
      stats.set(p.id, { total: 0, completed: 0 });
    });

    filteredQuestions.forEach((q) => {
      const patternId = categoryToPatternId[q.category];
      if (patternId && stats.has(patternId)) {
        const current = stats.get(patternId)!;
        current.total++;
        if (completed.has(q.id)) {
          current.completed++;
        }
      }
    });

    return stats;
  }, [patterns, filteredQuestions, completed]);

  const filteredPatterns = useMemo(() => {
    let result = patterns;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.category.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    if (companyFilter) {
      result = result.filter((p) => {
        const stats = patternStats.get(p.id);
        return stats && stats.total > 0;
      });
    }

    return result;
  }, [patterns, searchQuery, companyFilter, patternStats]);

  const clearFilters = () => {
    setSearchQuery("");
    setCompanyFilter("");
  };

  const hasActiveFilters = searchQuery || companyFilter;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
            style={{ color: "var(--text-3)" }}
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
            placeholder="Search patterns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 focus:outline-none transition-colors"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-1)",
              borderRadius: "var(--radius-lg)",
              color: "var(--text-1)",
              fontFamily: "var(--font-body)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--border-2)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--border-1)";
            }}
          />
        </div>

        {/* Company Filter */}
        <div className="sm:w-56">
          <Dropdown
            value={companyFilter}
            onChange={setCompanyFilter}
            options={companies}
            placeholder="All Companies"
            logos={companyLogos}
            icon={
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            }
          />
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-4 py-3 text-sm flex items-center justify-center gap-2 transition-all hover:scale-105"
            style={{
              color: "var(--text-2)",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-1)",
              borderRadius: "var(--radius-lg)",
            }}
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}
      </div>

      {/* Quote */}
      <QuoteSection />

      {/* Patterns Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-lg font-semibold"
            style={{
              color: "var(--text-1)",
              fontFamily: "var(--font-heading)",
            }}
          >
            {companyFilter
              ? `Patterns with ${companyFilter} Questions`
              : "All Patterns"}
          </h2>
          <span className="text-sm" style={{ color: "var(--text-3)" }}>
            {filteredPatterns.length} patterns
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatterns.map((pattern) => {
            const stats = patternStats.get(pattern.id) || {
              total: 0,
              completed: 0,
            };
            const isFreePattern = FREE_PATTERN_IDS.has(pattern.id);
            return (
              <PatternCard
                key={pattern.id}
                pattern={pattern}
                questionsCount={stats.total}
                completedCount={stats.completed}
                isFree={!isPro && isFreePattern}
                isLocked={!isPro && !isFreePattern}
              />
            );
          })}
        </div>
      </div>

      {filteredPatterns.length === 0 && (
        <div className="text-center py-12">
          <p className="mb-4" style={{ color: "var(--text-3)" }}>
            No patterns match your filters
          </p>
          <button
            onClick={clearFilters}
            className="transition-colors hover:opacity-80"
            style={{ color: "var(--accent-1)" }}
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Floating Action Button for AI Chat */}
      <Link
        href="/chat"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all hover:scale-110 hover:shadow-xl"
        style={{
          background: "var(--accent-1)",
          color: "white",
        }}
        title="Ask AI Tutor"
      >
        <MessageSquare className="w-6 h-6" />
      </Link>
    </div>
  );
}
