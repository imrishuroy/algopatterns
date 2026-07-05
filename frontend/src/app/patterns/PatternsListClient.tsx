"use client";

import { useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Pattern } from "@/types";

interface PatternsListClientProps {
  patterns: Pattern[];
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

// skipcq: JS-0067
export default function PatternsListClient({
  patterns,
}: PatternsListClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Derive the URL query param as the single source of truth.
  // inputValue tracks the controlled input independently so typing feels instant.
  const urlQuery = searchParams.get("q") ?? "";
  const [inputValue, setInputValue] = useState(urlQuery);

  // Use the URL param as the filter so that back/forward navigation works
  // without needing a setState-in-effect.
  const activeQuery = urlQuery;

  const filteredPatterns = useMemo(() => {
    const query = activeQuery.trim().toLowerCase();
    if (!query) return patterns;
    return patterns.filter(
      (p) =>
        p.category.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
    );
  }, [patterns, activeQuery]);

  const handleSearch = (value: string) => {
    setInputValue(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set("q", value.trim());
    } else {
      params.delete("q");
    }
    router.replace(`/patterns${params.size > 0 ? `?${params}` : ""}`, {
      scroll: false,
    });
  };

  // skipcq: JS-0415
  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
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
          value={inputValue}
          onChange={(e) => handleSearch(e.target.value)}
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

      {/* Results count */}
      <div className="flex items-center justify-between">
        <h2
          className="text-lg font-semibold"
          style={{ color: "var(--text-1)", fontFamily: "var(--font-heading)" }}
        >
          {activeQuery.trim()
            ? `Results for "${activeQuery.trim()}"`
            : "All Patterns"}
        </h2>
        <span className="text-sm" style={{ color: "var(--text-3)" }}>
          {filteredPatterns.length} patterns
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPatterns.map((pattern) => {
          const colors =
            difficultyColors[pattern.difficulty] || difficultyColors["Medium"];
          return (
            <Link key={pattern.id} href={`/patterns/${pattern.id}`}>
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
                </div>
                <p
                  className="text-sm line-clamp-2 flex-grow"
                  style={{ color: "var(--text-2)" }}
                >
                  {pattern.description.slice(0, 120)}...
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {filteredPatterns.length === 0 && (
        <div className="text-center py-12">
          <p className="mb-4" style={{ color: "var(--text-3)" }}>
            No patterns match &quot;{activeQuery}&quot;
          </p>
          <button
            onClick={() => {
              setInputValue("");
              handleSearch("");
            }}
            className="transition-colors hover:opacity-80"
            style={{ color: "var(--accent-1)" }}
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}
