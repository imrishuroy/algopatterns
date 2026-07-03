"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePatternProgress } from "@/contexts/PatternProgressContext";
import { Pattern } from "@/types";
import { ChevronLeft, ChevronRight, Menu, X, CheckCircle2, Circle, FileQuestion } from "lucide-react";

interface CourseSidebarProps {
  pattern: Pattern;
  currentSectionIndex: number;
  onSectionChange?: (index: number) => void;
}

const CourseSidebar: React.FC<CourseSidebarProps> = ({
  pattern,
  currentSectionIndex,
  onSectionChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isCompleted, getProgress } = usePatternProgress();

  const sections = pattern.tutorial || [];
  const totalSections = sections.length;
  const progress = getProgress(pattern.id, totalSections);

  const handleSectionClick = (index: number) => {
    onSectionChange?.(index);
    setIsOpen(false);
  };

  const sidebarContent = (
    <div className="p-4 space-y-4">
      {/* Back Link */}
      <Link
        href="/patterns"
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
      >
        <ChevronLeft className="w-4 h-4 flex-shrink-0" />
        <span>All Patterns</span>
      </Link>

      {/* Pattern Title */}
      <div className="border-b border-gray-800 pb-4">
        <h2 className="font-semibold text-white text-lg leading-tight">
          {pattern.category}
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          {pattern.difficulty}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Progress</span>
          <span className="text-indigo-400 font-medium">{progress}%</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Section List */}
      <nav className="space-y-1 pb-8">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Contents
        </h3>
        {sections.map((section, index) => {
          const completed = isCompleted(pattern.id, index);
          const isCurrent = index === currentSectionIndex;

          return (
            <button
              key={`${pattern.id}-section-${index}-${section.title}`}
              onClick={() => handleSectionClick(index)}
              className={`
                w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all
                ${isCurrent
                  ? "bg-indigo-500/10 border border-indigo-500/30"
                  : "hover:bg-gray-800/50 border border-transparent"
                }
              `}
            >
              {/* Status Icon */}
              <span className="flex-shrink-0 mt-0.5">
                {completed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <Circle
                    className={`w-5 h-5 ${
                      isCurrent ? "text-indigo-400" : "text-gray-600"
                    }`}
                  />
                )}
              </span>

              {/* Section Info - Full text, no truncation */}
              <div className="flex-1 min-w-0">
                <span
                  className={`
                    block text-sm font-medium leading-snug
                    ${isCurrent ? "text-white" : completed ? "text-gray-300" : "text-gray-400"}
                  `}
                >
                  {index + 1}. {section.title}
                </span>
              </div>

              {/* Current Indicator */}
              {isCurrent && (
                <ChevronRight className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              )}
            </button>
          );
        })}

        {/* Take Quiz - Final item (index = sections.length) */}
        <button
          onClick={() => handleSectionClick(sections.length)}
          className={`
            w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all mt-2
            ${currentSectionIndex === sections.length
              ? "bg-indigo-500/10 border border-indigo-500/30"
              : "hover:bg-gray-800/50 border border-transparent"
            }
          `}
        >
          <span className="flex-shrink-0">
            <FileQuestion className={`w-5 h-5 ${currentSectionIndex === sections.length ? "text-indigo-400" : "text-indigo-400/70"}`} />
          </span>
          <span className={`text-sm font-medium ${currentSectionIndex === sections.length ? "text-white" : "text-indigo-400"}`}>
            Take Quiz
          </span>
          {currentSectionIndex === sections.length && (
            <ChevronRight className="w-4 h-4 text-indigo-400 flex-shrink-0 ml-auto" />
          )}
        </button>
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar - Rendered inline in parent's sticky container */}
      <div className="hidden lg:block bg-gray-900/50 rounded-lg border border-gray-800">
        {sidebarContent}
      </div>

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-20 left-4 z-50 p-2 bg-gray-800 rounded-lg border border-gray-700 shadow-lg hover:bg-gray-700 transition-colors"
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isOpen ? (
          <X className="w-5 h-5 text-gray-300" />
        ) : (
          <Menu className="w-5 h-5 text-gray-300" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`
          lg:hidden fixed top-0 left-0 z-40 h-screen
          w-72 bg-gray-900 border-r border-gray-800
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          overflow-y-auto
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default CourseSidebar;
