"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Concept, ConceptCategory, SupportedLanguage } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";

interface DSAFundamentalsClientProps {
  concepts: Concept[];
  categories: string[];
}

const categoryConfig: Record<
  ConceptCategory,
  { badge: string; accent: string; icon: string }
> = {
  "Data Structures": {
    badge: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    accent: "from-blue-500/20 to-blue-600/5",
    icon: "🏗️",
  },
  "Collections & Maps": {
    badge: "bg-green-500/20 text-green-400 border-green-500/30",
    accent: "from-green-500/20 to-green-600/5",
    icon: "📦",
  },
  "Arrays & Sorting": {
    badge: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    accent: "from-purple-500/20 to-purple-600/5",
    icon: "📊",
  },
  "String & Character": {
    badge: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    accent: "from-pink-500/20 to-pink-600/5",
    icon: "✏️",
  },
  "Type Conversions & Math": {
    badge: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    accent: "from-orange-500/20 to-orange-600/5",
    icon: "🔢",
  },
  "Arithmetic Patterns": {
    badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    accent: "from-yellow-500/20 to-yellow-600/5",
    icon: "➕",
  },
  "Java Fundamentals": {
    badge: "bg-red-500/20 text-red-400 border-red-500/30",
    accent: "from-red-500/20 to-red-600/5",
    icon: "☕",
  },
  "Algorithm Idioms": {
    badge: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    accent: "from-cyan-500/20 to-cyan-600/5",
    icon: "⚡",
  },
};

const languageLabels: Record<SupportedLanguage, string> = {
  java: "Java",
  python: "Python",
  cpp: "C++",
  javascript: "JavaScript",
};

export default function DSAFundamentalsClient({
  concepts,
  categories,
}: DSAFundamentalsClientProps) {
  const { language, setLanguage } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConcepts = useMemo(() => {
    return concepts.filter((concept) => {
      const matchesCategory =
        selectedCategory === "all" || concept.category === selectedCategory;
      const matchesSearch =
        searchQuery === "" ||
        concept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        concept.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [concepts, selectedCategory, searchQuery]);

  const groupedConcepts = useMemo(() => {
    const groups: Record<string, Concept[]> = {};
    for (const concept of filteredConcepts) {
      if (!groups[concept.category]) {
        groups[concept.category] = [];
      }
      groups[concept.category].push(concept);
    }
    return groups;
  }, [filteredConcepts]);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      {/* Header */}
      <div
        className="border-b sticky top-0 z-10 backdrop-blur-md"
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border-1)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1
                className="text-2xl md:text-3xl font-bold"
                style={{ color: "var(--text-1)" }}
              >
                DSA Fundamentals
              </h1>
              <p className="mt-1 text-sm" style={{ color: "var(--text-3)" }}>
                Essential concepts and code snippets for coding interviews
              </p>
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <span
                className="text-sm font-medium"
                style={{ color: "var(--text-3)" }}
              >
                Language:
              </span>
              <div
                className="flex rounded-md p-1"
                style={{ background: "var(--bg-elevated)" }}
              >
                {(Object.keys(languageLabels) as SupportedLanguage[]).map(
                  (lang) => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                        language === lang ? "text-white" : "hover:opacity-80"
                      }`}
                      style={{
                        background:
                          language === lang
                            ? "var(--accent-gradient)"
                            : "transparent",
                        color: language === lang ? "white" : "var(--text-2)",
                      }}
                    >
                      {languageLabels[lang]}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
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
                placeholder="Search concepts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-md text-sm focus:outline-none focus:ring-2 transition-all"
                style={{
                  background: "var(--bg-elevated)",
                  color: "var(--text-1)",
                  border: "1px solid var(--border-1)",
                }}
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 rounded-md text-sm focus:outline-none focus:ring-2 transition-all cursor-pointer"
              style={{
                background: "var(--bg-elevated)",
                color: "var(--text-1)",
                border: "1px solid var(--border-1)",
              }}
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {filteredConcepts.length === 0 ? (
          <div className="text-center py-16" style={{ color: "var(--text-3)" }}>
            <p className="text-lg">No concepts found matching your criteria.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="mt-4 px-4 py-2 rounded-md transition-colors"
              style={{
                background: "var(--accent-1)",
                color: "white",
              }}
            >
              Clear filters
            </button>
          </div>
        ) : selectedCategory === "all" ? (
          // Grouped view when showing all
          <div className="space-y-10">
            {categories
              .filter((cat) => groupedConcepts[cat]?.length > 0)
              .map((category) => (
                <section key={category}>
                  <h2
                    className="text-lg font-semibold mb-4 flex items-center gap-3"
                    style={{ color: "var(--text-1)" }}
                  >
                    <span>{category}</span>
                    <span
                      className="text-sm font-normal px-2 py-0.5 rounded-full"
                      style={{
                        background: "var(--bg-elevated)",
                        color: "var(--text-3)",
                      }}
                    >
                      {groupedConcepts[category].length}
                    </span>
                  </h2>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {groupedConcepts[category].map((concept) => (
                      <ConceptCard key={concept.id} concept={concept} />
                    ))}
                  </div>
                </section>
              ))}
          </div>
        ) : (
          // Flat view when category is selected
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {filteredConcepts.map((concept) => (
              <ConceptCard key={concept.id} concept={concept} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ConceptCard({ concept }: { concept: Concept }) {
  const config = categoryConfig[concept.category];
  const problemCount = concept.relatedProblems?.length || 0;

  return (
    <Link href={`/dsa-fundamentals/${concept.slug}`}>
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
        {/* Title & Category */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <h3
              className="font-semibold transition-colors"
              style={{
                color: "var(--text-1)",
                fontFamily: "var(--font-heading)",
              }}
            >
              {concept.name}
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
          <span
            className={`inline-block px-2 py-0.5 text-xs font-medium ${config?.badge}`}
            style={{ borderRadius: "var(--radius-full)" }}
          >
            {concept.category}
          </span>
        </div>

        {/* Description */}
        <p
          className="text-sm mb-4 line-clamp-2 flex-grow"
          style={{ color: "var(--text-2)" }}
        >
          {concept.description.slice(0, 120)}...
        </p>

        {/* Stats */}
        <div className="mt-auto flex items-center justify-between text-sm">
          <span style={{ color: "var(--text-3)" }}>
            {problemCount} {problemCount === 1 ? "problem" : "problems"}
          </span>
          <span className="font-medium" style={{ color: "var(--accent-1)" }}>
            {concept.keyPoints?.length || 0} key points
          </span>
        </div>
      </div>
    </Link>
  );
}
