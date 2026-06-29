"use client";

import { useState } from "react";
import QuizModal from "./QuizModal";

interface QuizCardProps {
  patternId: string;
  sectionSlug?: string;
  questionCount?: number;
}

export default function QuizCard({
  patternId,
  sectionSlug,
  questionCount = 15,
}: QuizCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="bg-gradient-to-r from-teal-900/30 to-teal-800/30 rounded-md border border-teal-700/30 p-6 mt-12">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-teal-900/50 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-6 h-6 text-teal-400"
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
            <div>
              <h3 className="text-lg font-semibold text-white">
                Test Your Knowledge
              </h3>
              <p className="text-gray-400 text-sm">
                Take a quick {questionCount} question quiz to test what you&apos;ve
                learned.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-full font-medium transition-colors"
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
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
            Start Quiz
          </button>
        </div>
      </div>

      <QuizModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        patternId={patternId}
        sectionSlug={sectionSlug}
      />
    </>
  );
}
