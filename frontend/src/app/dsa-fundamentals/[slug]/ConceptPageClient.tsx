"use client";

import Link from "next/link";
import { Concept, ConceptCategory, SupportedLanguage } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";
import CodeBlock from "@/components/ui/CodeBlock";

interface ConceptPageClientProps {
  concept: Concept;
}

const categoryColors: Record<ConceptCategory, string> = {
  "Data Structures": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "Collections & Maps": "bg-green-500/20 text-green-400 border-green-500/30",
  "Arrays & Sorting": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "String & Character": "bg-pink-500/20 text-pink-400 border-pink-500/30",
  "Type Conversions & Math":
    "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "Arithmetic Patterns": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  "Java Fundamentals": "bg-red-500/20 text-red-400 border-red-500/30",
  "Algorithm Idioms": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
};

const languageLabels: Record<SupportedLanguage, string> = {
  java: "Java",
  python: "Python",
  cpp: "C++",
  javascript: "JavaScript",
};

export default function ConceptPageClient({ concept }: ConceptPageClientProps) {
  const { language, setLanguage } = useLanguage();

  const currentCode = concept.codeSnippets[language] || "";

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      {/* Header */}
      <div
        className="border-b"
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border-1)",
        }}
      >
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Back Button */}
          <Link
            href="/dsa-fundamentals"
            className="inline-flex items-center gap-2 text-sm mb-4 transition-colors hover:opacity-80"
            style={{ color: "var(--text-3)" }}
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Fundamentals
          </Link>

          {/* Title and Category */}
          <div className="flex flex-col gap-3">
            <span
              className={`inline-block w-fit px-2.5 py-1 text-xs font-medium rounded-md border ${
                categoryColors[concept.category]
              }`}
            >
              {concept.category}
            </span>
            <h1
              className="text-2xl md:text-3xl font-bold"
              style={{ color: "var(--text-1)" }}
            >
              {concept.name}
            </h1>
          </div>

          {/* Complexity badges if available */}
          {(concept.timeComplexity || concept.spaceComplexity) && (
            <div className="flex items-center gap-4 mt-4 text-sm">
              {concept.timeComplexity && (
                <div className="flex items-center gap-2">
                  <span style={{ color: "var(--text-3)" }}>Time:</span>
                  <code
                    className="px-2 py-0.5 rounded text-xs font-mono"
                    style={{
                      background: "var(--bg-elevated)",
                      color: "var(--accent-1)",
                    }}
                  >
                    {concept.timeComplexity}
                  </code>
                </div>
              )}
              {concept.spaceComplexity && (
                <div className="flex items-center gap-2">
                  <span style={{ color: "var(--text-3)" }}>Space:</span>
                  <code
                    className="px-2 py-0.5 rounded text-xs font-mono"
                    style={{
                      background: "var(--bg-elevated)",
                      color: "var(--accent-2)",
                    }}
                  >
                    {concept.spaceComplexity}
                  </code>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* What is it? - Main explanation */}
        <section className="mb-10">
          <h2
            className="text-xl font-semibold mb-4"
            style={{ color: "var(--text-1)" }}
          >
            What is it?
          </h2>
          <p
            className="text-base leading-relaxed"
            style={{ color: "var(--text-2)" }}
          >
            {concept.description}
          </p>
          {concept.explanation && (
            <p
              className="text-base leading-relaxed mt-4"
              style={{ color: "var(--text-2)" }}
            >
              {concept.explanation}
            </p>
          )}
        </section>

        {/* When to Use - with better styling */}
        <section className="mb-10">
          <h2
            className="text-xl font-semibold mb-4"
            style={{ color: "var(--text-1)" }}
          >
            When to Use
          </h2>
          <p
            className="text-sm mb-4"
            style={{ color: "var(--text-3)" }}
          >
            Use this concept when you encounter these scenarios:
          </p>
          <div
            className="rounded-xl border p-5"
            style={{
              background: "var(--bg-elevated)",
              borderColor: "var(--border-1)",
            }}
          >
            <ul className="space-y-3">
              {concept.whenToUse.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3"
                  style={{ color: "var(--text-2)" }}
                >
                  <span
                    className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium"
                    style={{
                      background: "rgba(34, 197, 94, 0.2)",
                      color: "#4ade80",
                    }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-sm pt-0.5">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Code Implementation with language selector */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-xl font-semibold"
              style={{ color: "var(--text-1)" }}
            >
              Code Implementation
            </h2>
            <div
              className="flex rounded-lg p-1"
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
          <p
            className="text-sm mb-4"
            style={{ color: "var(--text-3)" }}
          >
            Here&apos;s how to implement this in {languageLabels[language]}. The code includes common patterns and usage examples.
          </p>
          <CodeBlock code={currentCode} language={language} />
        </section>

        {/* Key Points - Important things to remember */}
        {concept.keyPoints && concept.keyPoints.length > 0 && (
          <section className="mb-10">
            <h2
              className="text-xl font-semibold mb-4"
              style={{ color: "var(--text-1)" }}
            >
              Key Points to Remember
            </h2>
            <p
              className="text-sm mb-4"
              style={{ color: "var(--text-3)" }}
            >
              These are the most important things to remember about this concept:
            </p>
            <div
              className="rounded-xl border p-5"
              style={{
                background: "linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)",
                borderColor: "rgba(99, 102, 241, 0.2)",
              }}
            >
              <ul className="space-y-3">
                {concept.keyPoints.map((point, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3"
                    style={{ color: "var(--text-2)" }}
                  >
                    <svg
                      className="w-5 h-5 flex-shrink-0 mt-0.5"
                      style={{ color: "var(--accent-1)" }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-sm">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Common Mistakes - What to avoid */}
        {concept.commonMistakes && concept.commonMistakes.length > 0 && (
          <section className="mb-10">
            <h2
              className="text-xl font-semibold mb-4"
              style={{ color: "var(--text-1)" }}
            >
              Common Mistakes to Avoid
            </h2>
            <p
              className="text-sm mb-4"
              style={{ color: "var(--text-3)" }}
            >
              Watch out for these common pitfalls when using this concept:
            </p>
            <div
              className="rounded-xl border p-5"
              style={{
                background: "rgba(239, 68, 68, 0.05)",
                borderColor: "rgba(239, 68, 68, 0.2)",
              }}
            >
              <ul className="space-y-3">
                {concept.commonMistakes.map((mistake, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3"
                    style={{ color: "var(--text-2)" }}
                  >
                    <svg
                      className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <span className="text-sm">{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Practice Problems */}
        {concept.relatedProblems && concept.relatedProblems.length > 0 && (
          <section className="mb-10">
            <h2
              className="text-xl font-semibold mb-4"
              style={{ color: "var(--text-1)" }}
            >
              Practice Problems
            </h2>
            <p
              className="text-sm mb-4"
              style={{ color: "var(--text-3)" }}
            >
              Practice these problems to solidify your understanding:
            </p>
            <div
              className="rounded-xl border p-5"
              style={{
                background: "var(--bg-elevated)",
                borderColor: "var(--border-1)",
              }}
            >
              <div className="flex flex-wrap gap-2">
                {concept.relatedProblems.map((problem, i) => (
                  <span
                    key={i}
                    className="px-3 py-2 text-sm rounded-lg transition-colors"
                    style={{
                      background: "var(--bg-base)",
                      color: "var(--text-2)",
                      border: "1px solid var(--border-1)",
                    }}
                  >
                    {problem}
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Related Patterns */}
        {concept.relatedPatterns && concept.relatedPatterns.length > 0 && (
          <section className="mb-10">
            <h2
              className="text-xl font-semibold mb-4"
              style={{ color: "var(--text-1)" }}
            >
              Related Patterns
            </h2>
            <p
              className="text-sm mb-4"
              style={{ color: "var(--text-3)" }}
            >
              This concept is commonly used with these algorithm patterns:
            </p>
            <div className="flex flex-wrap gap-3">
              {concept.relatedPatterns.map((pattern, i) => (
                <Link
                  key={i}
                  href={`/patterns/${pattern}`}
                  className="px-4 py-2 text-sm rounded-lg transition-all hover:scale-105"
                  style={{
                    background: "var(--accent-gradient)",
                    color: "white",
                  }}
                >
                  {pattern
                    .split("-")
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ")}
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
