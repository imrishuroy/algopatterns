"use client";

import { useState } from "react";
import Link from "next/link";
import { ArticleMeta } from "@/content/articles";

interface ArticleLayoutProps {
  article: ArticleMeta;
  children: React.ReactNode;
  currentSection?: string;
}

export default function ArticleLayout({
  article,
  children,
  currentSection,
}: ArticleLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "w-72" : "w-0"
          } flex-shrink-0 transition-all duration-300 overflow-hidden`}
        >
          <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto border-r border-gray-800 bg-gray-900/50">
            <div className="p-4">
              {/* Article Info */}
              <Link href={`/articles/${article.slug}`} className="block mb-6">
                <h2 className="text-lg font-bold text-white hover:text-indigo-400 transition">
                  {article.title}
                </h2>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                  <span
                    className={`px-2 py-0.5 rounded-md ${
                      article.difficulty === "beginner"
                        ? "bg-green-500/20 text-green-400"
                        : article.difficulty === "intermediate"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {article.difficulty}
                  </span>
                  <span>{article.estimatedTime}</span>
                </div>
              </Link>

              {/* Sections Navigation */}
              <nav className="space-y-1">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Sections
                </div>
                {article.sections.map((section, index) => {
                  const isActive = currentSection === section.slug;
                  const sectionPath = `/articles/${article.slug}/${section.slug}`;

                  return (
                    <Link
                      key={section.slug}
                      href={sectionPath}
                      className={`flex items-start gap-3 px-3 py-2.5 rounded-md transition group ${
                        isActive
                          ? "bg-indigo-500/20 text-indigo-300"
                          : "text-gray-400 hover:bg-gray-800 hover:text-white"
                      }`}
                    >
                      <span
                        className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
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
                          {section.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {section.estimatedTime}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </nav>

              {/* Progress indicator */}
              <div className="mt-6 pt-6 border-t border-gray-800">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span>Progress</span>
                  <span>0/{article.sections.length}</span>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                    style={{ width: "0%" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Toggle Sidebar Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed left-0 top-1/2 -translate-y-1/2 z-40 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white p-1.5 rounded-r-md border border-l-0 border-gray-700 transition"
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
        <main className="flex-1 min-w-0">
          <div className="max-w-4xl mx-auto px-6 py-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <Link
                href="/articles"
                className="hover:text-indigo-400 transition"
              >
                Articles
              </Link>
              <span>/</span>
              <Link
                href={`/articles/${article.slug}`}
                className="hover:text-indigo-400 transition"
              >
                {article.title}
              </Link>
              {currentSection && (
                <>
                  <span>/</span>
                  <span className="text-gray-300">
                    {
                      article.sections.find((s) => s.slug === currentSection)
                        ?.title
                    }
                  </span>
                </>
              )}
            </nav>

            {/* Content */}
            {children}

            {/* Section Navigation */}
            {currentSection && (
              <SectionNavigation
                article={article}
                currentSection={currentSection}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function SectionNavigation({
  article,
  currentSection,
}: {
  article: ArticleMeta;
  currentSection: string;
}) {
  const currentIndex = article.sections.findIndex(
    (s) => s.slug === currentSection
  );
  const prevSection =
    currentIndex > 0 ? article.sections[currentIndex - 1] : null;
  const nextSection =
    currentIndex < article.sections.length - 1
      ? article.sections[currentIndex + 1]
      : null;

  return (
    <div className="mt-12 pt-8 border-t border-gray-800">
      <div className="flex items-center justify-between gap-4">
        {prevSection ? (
          <Link
            href={`/articles/${article.slug}/${prevSection.slug}`}
            className="flex-1 p-4 bg-gray-900 hover:bg-gray-800 rounded-md border border-gray-800 transition group"
          >
            <div className="text-xs text-gray-500 mb-1">Previous</div>
            <div className="text-sm font-medium text-white group-hover:text-indigo-400 transition flex items-center gap-2">
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
              {prevSection.title}
            </div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}

        {nextSection ? (
          <Link
            href={`/articles/${article.slug}/${nextSection.slug}`}
            className="flex-1 p-4 bg-gray-900 hover:bg-gray-800 rounded-md border border-gray-800 transition group text-right"
          >
            <div className="text-xs text-gray-500 mb-1">Next</div>
            <div className="text-sm font-medium text-white group-hover:text-indigo-400 transition flex items-center justify-end gap-2">
              {nextSection.title}
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>
        ) : (
          <Link
            href="/articles"
            className="flex-1 p-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 rounded-md border border-indigo-500/30 transition group text-right"
          >
            <div className="text-xs text-indigo-400 mb-1">Completed!</div>
            <div className="text-sm font-medium text-white group-hover:text-indigo-300 transition flex items-center justify-end gap-2">
              Back to Articles
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
