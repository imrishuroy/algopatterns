"use client";

import { useState } from "react";
import { Pattern, TutorialSection } from "@/types";
import CodeBlock from "@/components/ui/CodeBlock";
import LanguageToggle from "@/components/ui/LanguageToggle";

interface PatternSectionCardProps {
  pattern: Pattern;
}

function TutorialContent({
  tutorial,
  currentLang,
  setCurrentLang,
}: {
  tutorial: TutorialSection[];
  currentLang: string;
  setCurrentLang: (lang: string) => void;
}) {
  return (
    <div className="space-y-10">
      {tutorial.map((section, idx) => (
        <div key={idx}>
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-7 h-7 bg-indigo-500/30 rounded-md flex items-center justify-center text-indigo-400 text-sm font-bold">
              {idx + 1}
            </span>
            {section.title}
          </h3>
          <div className="text-gray-100 leading-relaxed whitespace-pre-line mb-5 text-base">
            {section.content}
          </div>
          {section.code && (
            <div className="mt-4">
              <div className="flex justify-end mb-2">
                <LanguageToggle
                  currentLang={currentLang}
                  onChange={setCurrentLang}
                  languages={["java", "javascript", "python", "cpp", "go"].filter(
                    (k) => section.code?.[k as keyof typeof section.code]
                  )}
                  size="sm"
                />
              </div>
              <CodeBlock
                code={
                  section.code[currentLang as keyof typeof section.code] ||
                  section.code.java ||
                  section.code.javascript ||
                  ""
                }
                language={currentLang}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function PatternSectionCard({
  pattern,
}: PatternSectionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentLang, setCurrentLang] = useState<string>("java");

  const languageOrder = ["java", "javascript", "python", "cpp", "go"];
  const availableLanguages = languageOrder.filter((lang) =>
    pattern.codeTemplates[lang as keyof typeof pattern.codeTemplates]?.trim()
  );

  const currentCode =
    pattern.codeTemplates[currentLang as keyof typeof pattern.codeTemplates] ||
    pattern.codeTemplates[
      availableLanguages[0] as keyof typeof pattern.codeTemplates
    ] ||
    "";

  const hasTutorial = pattern.tutorial && pattern.tutorial.length > 0;

  return (
    <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-md border border-indigo-500/30 overflow-hidden mb-3">
      {/* Collapsed Header - Click to Expand */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500/20 rounded-md flex items-center justify-center">
            <svg
              className="w-5 h-5 text-indigo-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold">
                About This Pattern
              </span>
              <span className="px-2 py-0.5 text-xs bg-indigo-500/20 text-indigo-400 rounded-full">
                {pattern.difficulty}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-0.5">Click to learn more</p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-5 pt-2 border-t border-gray-700/50 animate-fade-in">
          {/* Complexity info */}
          <div className="flex items-center gap-4 text-sm text-gray-400 mb-5 pb-4 border-b border-gray-700/50">
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

          {/* Tutorial Content (if available) */}
          {hasTutorial ? (
            <div className="mb-8">
              <TutorialContent
                tutorial={pattern.tutorial!}
                currentLang={currentLang}
                setCurrentLang={setCurrentLang}
              />
            </div>
          ) : (
            <>
              {/* Fallback to original format */}
              <p className="text-gray-300 mb-5 leading-relaxed">
                {pattern.description}
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-green-400"
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
                    When to Use
                  </h4>
                  <ul className="space-y-1.5">
                    {pattern.whenToUse.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-gray-400"
                      >
                        <span className="text-green-400 mt-0.5">&#10003;</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-yellow-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                    Key Insights
                  </h4>
                  <ul className="space-y-1.5">
                    {pattern.keyInsights.map((insight, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-gray-400"
                      >
                        <span className="text-yellow-400 font-medium">
                          {i + 1}.
                        </span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-indigo-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                      />
                    </svg>
                    Code Template
                  </h4>
                  <LanguageToggle
                    currentLang={currentLang}
                    onChange={setCurrentLang}
                    languages={availableLanguages}
                    size="sm"
                  />
                </div>
                <CodeBlock code={currentCode} language={currentLang} />
              </div>

              {pattern.commonMistakes && pattern.commonMistakes.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-red-400"
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
                    Common Mistakes
                  </h4>
                  <div className="bg-red-900/10 border border-red-900/30 rounded-md p-3">
                    <ul className="space-y-1.5">
                      {pattern.commonMistakes.map((mistake, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-gray-400"
                        >
                          <span className="text-red-400 mt-0.5">&#10007;</span>
                          <span>{mistake}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </>
          )}

          {pattern.variations && pattern.variations.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z"
                  />
                </svg>
                Variations
              </h4>
              <div className="space-y-4">
                {pattern.variations.map((variation, idx) => (
                  <VariationInline
                    key={variation.id || idx}
                    variation={variation}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function VariationInline({
  variation,
}: {
  variation: Pattern["variations"][0] & { guide?: string };
}) {
  const [currentLang, setCurrentLang] = useState<string>("java");

  const hasTemplate =
    variation.template &&
    (variation.template.javascript || variation.template.java);
  const hasProblems = variation.problems && variation.problems.length > 0;
  const hasGuide = !!variation.guide;

  const languageOrder = ["java", "javascript", "python", "cpp", "go"];
  const availableLanguages = variation.template
    ? languageOrder.filter((lang) =>
        variation.template?.[lang as keyof typeof variation.template]?.trim()
      )
    : [];

  const currentCode =
    variation.template?.[currentLang as keyof typeof variation.template] ||
    variation.template?.[
      availableLanguages[0] as keyof typeof variation.template
    ] ||
    "";

  return (
    <div className="bg-gray-900/50 rounded-md border border-gray-800 p-4">
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <h5 className="font-medium text-white text-sm">{variation.name}</h5>
          {hasGuide && (
            <a
              href={variation.guide}
              className="px-2 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 text-xs rounded-md transition flex items-center gap-1"
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
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              Full Guide
            </a>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">{variation.desc}</p>
        {variation.when && (
          <p className="text-xs text-indigo-400 mt-1">When: {variation.when}</p>
        )}
      </div>

      {hasTemplate && (
        <div className="mb-3">
          <div className="flex justify-end mb-2">
            <LanguageToggle
              currentLang={currentLang}
              onChange={setCurrentLang}
              languages={availableLanguages}
              size="sm"
            />
          </div>
          <CodeBlock code={currentCode} language={currentLang} />
        </div>
      )}

      {hasProblems && (
        <div>
          <p className="text-xs text-gray-500 mb-2">Practice:</p>
          <div className="flex flex-wrap gap-1">
            {variation.problems!.map((problem, i) => {
              const slug = problem
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
              return (
                <span
                  key={i}
                  className="inline-flex items-center bg-gray-800 rounded-md overflow-hidden"
                >
                  <a
                    href={`/problems/${slug}`}
                    className="px-2 py-1 hover:bg-gray-700 text-xs text-gray-300 transition"
                  >
                    {problem}
                  </a>
                  <a
                    href={`https://leetcode.com/problems/${slug}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-1.5 py-1 hover:bg-gray-700 text-gray-500 hover:text-gray-300 transition border-l border-gray-700"
                    title="Open on LeetCode"
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
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
