"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArticleMeta, ArticleSection } from "@/content/articles";
import { sections as recursionSections } from "@/content/articles/recursion/sections";
import { sections as algorithmParadigmsSections } from "@/content/articles/algorithm-paradigms/sections";

interface ArticleSectionClientProps {
  article: ArticleMeta;
  section: ArticleSection;
  sectionIndex: number;
}

// skipcq: JS-0067
const getSectionComponents = (
  articleSlug: string
): Record<string, React.ComponentType> => {
  switch (articleSlug) {
    case "recursion":
      return recursionSections;
    case "algorithm-paradigms":
      return algorithmParadigmsSections;
    default:
      return {};
  }
};

// skipcq: JS-0067
const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "beginner":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "intermediate":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "advanced":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
};

// skipcq: JS-0067, JS-R1005, JS-0415
export default function ArticleSectionClient({
  article,
  section,
  sectionIndex,
}: ArticleSectionClientProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const sectionComponents = getSectionComponents(article.slug);
  const SectionComponent = sectionComponents[section.slug];

  const handleSectionClick = useCallback(
    (sectionSlug: string) => {
      router.push(`/articles/${article.slug}/${sectionSlug}`, { scroll: true });
    },
    [router, article.slug]
  );

  const prevSection =
    sectionIndex > 0 ? article.sections[sectionIndex - 1] : null;
  const nextSection =
    sectionIndex < article.sections.length - 1
      ? article.sections[sectionIndex + 1]
      : null;

  const progress =
    article.sections.length > 0
      ? ((sectionIndex + 1) / article.sections.length) * 100
      : 0;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Fixed Sidebar TOC */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed top-0 left-0 w-72 h-screen z-30 transition-transform duration-300 hidden lg:block`}
      >
        <div className="h-full overflow-y-auto border-r border-gray-800 bg-gray-950">
          <div className="p-4 pt-20">
            {/* Back Button */}
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 text-sm mb-6 transition-colors hover:opacity-80"
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
              Back to Articles
            </Link>

            {/* Article Info */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-white">{article.title}</h2>
              <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                <span
                  className={`px-2 py-0.5 rounded-md border ${getDifficultyColor(article.difficulty)}`}
                >
                  {article.difficulty}
                </span>
                <span>{article.estimatedTime}</span>
              </div>
            </div>

            {/* Table of Contents */}
            <nav className="space-y-1">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Table of Contents
              </div>
              {article.sections.map((s, index) => {
                const isActive = section.slug === s.slug;

                return (
                  <button
                    key={s.slug}
                    onClick={() => handleSectionClick(s.slug)}
                    className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-md transition group text-left ${
                      isActive
                        ? "bg-indigo-500/20 text-indigo-300"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    <span
                      className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition ${
                        isActive
                          ? "bg-indigo-500 text-white"
                          : "bg-gray-700 text-gray-400 group-hover:bg-gray-600"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-sm font-medium ${isActive ? "text-white" : ""}`}
                      >
                        {s.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {s.estimatedTime}
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* Progress indicator */}
            <div className="mt-6 pt-6 border-t border-gray-800">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span>Reading progress</span>
                <span>
                  {sectionIndex + 1}/{article.sections.length}
                </span>
              </div>
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Author info */}
            <div className="mt-6 pt-6 border-t border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                  {article.authorAvatar}
                </div>
                <div>
                  <div className="text-sm text-white">{article.author}</div>
                  <div className="text-xs text-gray-500">
                    {article.publishedAt}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Toggle Sidebar Button (Desktop) */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-1/2 -translate-y-1/2 z-40 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white p-1.5 rounded-r-md border border-l-0 border-gray-700 transition hidden lg:block"
        style={{ left: sidebarOpen ? "18rem" : "0" }}
      >
        <svg
          className={`w-4 h-4 transition-transform ${sidebarOpen ? "" : "rotate-180"}`}
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
      </button>

      {/* Main Content */}
      <main
        className={`${sidebarOpen ? "lg:ml-72" : "lg:ml-0"} transition-[margin] duration-300`}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 lg:pt-8 pb-8">
          {/* Mobile Header */}
          <div className="lg:hidden mb-8">
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 text-sm mb-6 transition-colors hover:opacity-80"
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
              Back to Articles
            </Link>

            <div className="flex items-center gap-3 mb-3">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(article.difficulty)}`}
              >
                {article.difficulty}
              </span>
              <span className="text-gray-500 text-sm">
                {article.estimatedTime}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">
              {article.title}
            </h1>
            <p className="text-gray-400">{article.description}</p>
          </div>

          {/* Section Content */}
          <article className="scroll-mt-20">
            {SectionComponent ? (
              <SectionComponent />
            ) : (
              <div className="text-center py-12">
                <h2 className="text-xl text-gray-400">
                  Section content not found
                </h2>
              </div>
            )}
          </article>

          {/* Navigation */}
          <div className="mt-12 pt-8 border-t border-gray-800">
            <div className="flex items-center justify-between gap-4">
              {prevSection ? (
                <Link
                  href={`/articles/${article.slug}/${prevSection.slug}`}
                  className="flex-1 flex items-center gap-3 px-4 py-3 bg-gray-900 hover:bg-gray-800 rounded-md border border-gray-800 transition group"
                >
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-white transition"
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
                  <div className="text-left">
                    <div className="text-xs text-gray-500">Previous</div>
                    <div className="text-sm text-white group-hover:text-indigo-300 transition">
                      {prevSection.title}
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="flex-1" />
              )}

              {nextSection ? (
                <Link
                  href={`/articles/${article.slug}/${nextSection.slug}`}
                  className="flex-1 flex items-center justify-end gap-3 px-4 py-3 bg-gray-900 hover:bg-gray-800 rounded-md border border-gray-800 transition group"
                >
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Next</div>
                    <div className="text-sm text-white group-hover:text-indigo-300 transition">
                      {nextSection.title}
                    </div>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-white transition"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              ) : (
                <Link
                  href="/articles"
                  className="flex-1 flex items-center justify-end gap-3 px-4 py-3 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 rounded-md border border-indigo-500/30 transition group"
                >
                  <div className="text-right">
                    <div className="text-xs text-gray-400">Completed!</div>
                    <div className="text-sm text-white group-hover:text-indigo-300 transition">
                      Browse More Articles
                    </div>
                  </div>
                  <svg
                    className="w-5 h-5 text-indigo-400 group-hover:text-white transition"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="mt-8 pt-6 border-t border-gray-800">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-500">Tags:</span>
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile floating navigation */}
      <MobileFloatingNav
        article={article}
        currentSection={section}
        sectionIndex={sectionIndex}
        onSectionClick={handleSectionClick}
      />
    </div>
  );
}

// skipcq: JS-0067
function MobileFloatingNav({
  article,
  currentSection,
  sectionIndex,
  onSectionClick,
}: {
  article: ArticleMeta;
  currentSection: ArticleSection;
  sectionIndex: number;
  onSectionClick: (slug: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden fixed bottom-4 right-4 z-50">
      {isOpen && (
        <div className="absolute bottom-14 right-0 w-64 p-3 bg-gray-900 rounded-md border border-gray-800 shadow-xl space-y-1 max-h-80 overflow-y-auto">
          {article.sections.map((s, index) => (
            <button
              key={s.slug}
              onClick={() => {
                onSectionClick(s.slug);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left ${
                currentSection.slug === s.slug
                  ? "bg-indigo-500/20 text-indigo-300"
                  : "text-gray-400 hover:bg-gray-800"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                  currentSection.slug === s.slug
                    ? "bg-indigo-500 text-white"
                    : "bg-gray-700 text-gray-400"
                }`}
              >
                {index + 1}
              </span>
              <span className="text-sm truncate">{s.title}</span>
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-indigo-500 hover:bg-indigo-400 text-white rounded-full shadow-lg flex items-center justify-center transition"
      >
        {isOpen ? (
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <div className="text-xs font-bold">
            {sectionIndex + 1}/{article.sections.length}
          </div>
        )}
      </button>
    </div>
  );
}
