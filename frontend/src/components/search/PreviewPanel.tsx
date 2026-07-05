"use client";

import React from "react";
import type { SearchResult } from "@/types";

interface PreviewPanelProps {
  result: SearchResult;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "bg-green-600/20 text-green-400 border-green-500/30",
  Medium: "bg-yellow-600/20 text-yellow-400 border-yellow-500/30",
  Hard: "bg-red-600/20 text-red-400 border-red-500/30",
  "Easy-Medium": "bg-green-600/20 text-green-400 border-green-500/30",
  "Medium-Hard": "bg-orange-600/20 text-orange-400 border-orange-500/30",
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  pattern: (
    <div className="w-10 h-10 rounded-lg bg-teal-600/20 flex items-center justify-center">
      <svg
        className="w-5 h-5 text-teal-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
        />
      </svg>
    </div>
  ),
  question: (
    <div className="w-10 h-10 rounded-lg bg-orange-600/20 flex items-center justify-center">
      <svg
        className="w-5 h-5 text-orange-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>
  ),
  concept: (
    <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
      <svg
        className="w-5 h-5 text-blue-400"
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
    </div>
  ),
  article: (
    <div className="w-10 h-10 rounded-lg bg-green-600/20 flex items-center justify-center">
      <svg
        className="w-5 h-5 text-green-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    </div>
  ),
  highlight: (
    <div className="w-10 h-10 rounded-lg bg-yellow-600/20 flex items-center justify-center">
      <svg
        className="w-5 h-5 text-yellow-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
        />
      </svg>
    </div>
  ),
  solution: (
    <div className="w-10 h-10 rounded-lg bg-pink-600/20 flex items-center justify-center">
      <svg
        className="w-5 h-5 text-pink-400"
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
    </div>
  ),
};

export function PreviewPanel({ result }: PreviewPanelProps) { // skipcq: JS-0067, JS-R1005
  const preview = result.preview || {};

  return (
    <div className="hidden sm:block w-64 lg:w-72 xl:w-80 2xl:w-96 border-l border-gray-800 p-4 overflow-y-auto bg-gray-900/50">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        {TYPE_ICONS[result.type] || (
          <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center">
            <span className="text-gray-400 text-sm">?</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-white truncate">{result.title}</h3>
          <span className="text-xs text-gray-500 capitalize">
            {result.type}
          </span>
        </div>
      </div>

      {/* Difficulty Badge */}
      {result.difficulty && (
        <div className="mb-4">
          <span
            className={`inline-flex px-2.5 py-1 text-xs font-medium rounded border ${
              DIFFICULTY_COLORS[result.difficulty] ||
              "bg-gray-700 text-gray-300 border-gray-600"
            }`}
          >
            {result.difficulty}
          </span>
        </div>
      )}

      {/* Description */}
      <p className="text-sm text-gray-400 mb-4 line-clamp-4">
        {result.description}
      </p>

      {/* Pattern-specific preview */}
      {result.type === "pattern" && preview && (
        <div className="space-y-3">
          {preview.category && (
            <div className="text-xs">
              <span className="text-gray-500">Category:</span>{" "}
              <span className="text-gray-300">{preview.category}</span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            {preview.timeComplexity && (
              <div className="bg-gray-800/50 rounded px-2.5 py-2">
                <div className="text-xs text-gray-500">Time</div>
                <div className="text-sm text-gray-300 font-mono">
                  {preview.timeComplexity}
                </div>
              </div>
            )}
            {preview.spaceComplexity && (
              <div className="bg-gray-800/50 rounded px-2.5 py-2">
                <div className="text-xs text-gray-500">Space</div>
                <div className="text-sm text-gray-300 font-mono">
                  {preview.spaceComplexity}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Question-specific preview */}
      {result.type === "question" && preview && (
        <div className="space-y-3">
          {preview.patternId && (
            <div className="text-xs">
              <span className="text-gray-500">Pattern:</span>{" "}
              <span className="text-teal-400">{preview.patternId}</span>
            </div>
          )}
          {preview.companies && (preview.companies as string[]).length > 0 && (
            <div>
              <div className="text-xs text-gray-500 mb-1.5">Companies</div>
              <div className="flex flex-wrap gap-1">
                {(preview.companies as string[]).slice(0, 5).map((company) => (
                  <span
                    key={company}
                    className="px-2 py-0.5 text-xs bg-gray-800 text-gray-400 rounded"
                  >
                    {company}
                  </span>
                ))}
                {(preview.companies as string[]).length > 5 && (
                  <span className="px-2 py-0.5 text-xs text-gray-600">
                    +{(preview.companies as string[]).length - 5}
                  </span>
                )}
              </div>
            </div>
          )}
          {preview.leetcodeUrl && (
            <a
              href={preview.leetcodeUrl as string}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0z" />
              </svg>
              View on LeetCode
            </a>
          )}
        </div>
      )}

      {/* Concept-specific preview */}
      {result.type === "concept" && preview && (
        <div className="space-y-3">
          {preview.category && (
            <div className="text-xs">
              <span className="text-gray-500">Category:</span>{" "}
              <span className="text-gray-300">{preview.category}</span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            {preview.timeComplexity && (
              <div className="bg-gray-800/50 rounded px-2.5 py-2">
                <div className="text-xs text-gray-500">Time</div>
                <div className="text-sm text-gray-300 font-mono">
                  {preview.timeComplexity}
                </div>
              </div>
            )}
            {preview.spaceComplexity && (
              <div className="bg-gray-800/50 rounded px-2.5 py-2">
                <div className="text-xs text-gray-500">Space</div>
                <div className="text-sm text-gray-300 font-mono">
                  {preview.spaceComplexity}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Solution-specific preview */}
      {result.type === "solution" && preview && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {preview.timeComplexity && (
              <div className="bg-gray-800/50 rounded px-2.5 py-2">
                <div className="text-xs text-gray-500">Time</div>
                <div className="text-sm text-gray-300 font-mono">
                  {preview.timeComplexity}
                </div>
              </div>
            )}
            {preview.spaceComplexity && (
              <div className="bg-gray-800/50 rounded px-2.5 py-2">
                <div className="text-xs text-gray-500">Space</div>
                <div className="text-sm text-gray-300 font-mono">
                  {preview.spaceComplexity}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Highlight-specific preview */}
      {result.type === "highlight" && preview && (
        <div className="space-y-3">
          {preview.text && (
            <div className="p-3 bg-gray-800/50 rounded border-l-2 border-yellow-500">
              <p className="text-sm text-gray-300 italic line-clamp-3">
                &quot;{preview.text}&quot;
              </p>
            </div>
          )}
          {preview.color && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500">Color:</span>
              <span
                className="w-4 h-4 rounded"
                style={{
                  backgroundColor:
                    preview.color === "yellow"
                      ? "rgba(249, 115, 22, 0.4)"
                      : preview.color === "green"
                        ? "rgba(20, 184, 166, 0.4)"
                        : preview.color === "blue"
                          ? "rgba(99, 102, 241, 0.45)"
                          : preview.color === "pink"
                            ? "rgba(244, 63, 94, 0.4)"
                            : "rgba(6, 182, 212, 0.4)",
                }}
              />
              <span className="text-gray-400 capitalize">{preview.color}</span>
            </div>
          )}
        </div>
      )}

      {/* Open action */}
      <div className="mt-6 pt-4 border-t border-gray-800">
        <p className="text-xs text-gray-500">
          <kbd className="px-1 py-0.5 bg-gray-800 rounded text-gray-400">↵</kbd>{" "}
          to open
        </p>
      </div>
    </div>
  );
}
