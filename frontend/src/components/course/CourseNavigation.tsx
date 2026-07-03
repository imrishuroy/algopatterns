"use client";

import React from "react";
import { usePatternProgress } from "@/contexts/PatternProgressContext";
import { Pattern } from "@/types";
import { ArrowLeft, ArrowRight, CheckCircle, Circle, FileQuestion } from "lucide-react";

interface CourseNavigationProps {
  pattern: Pattern;
  currentSectionIndex: number;
  onNavigate: (index: number) => void;
}

const CourseNavigation: React.FC<CourseNavigationProps> = ({
  pattern,
  currentSectionIndex,
  onNavigate,
}) => {
  const { isCompleted, toggleComplete } = usePatternProgress();

  const sections = pattern.tutorial || [];
  const totalSections = sections.length;
  const hasPrev = currentSectionIndex > 0;
  const isLastSection = currentSectionIndex === totalSections - 1;
  const completed = isCompleted(pattern.id, currentSectionIndex);

  const prevSection = hasPrev ? sections[currentSectionIndex - 1] : null;
  const nextSection = !isLastSection ? sections[currentSectionIndex + 1] : null;

  const handleToggleComplete = () => {
    toggleComplete(pattern.id, currentSectionIndex);
  };

  const handleNext = () => {
    onNavigate(currentSectionIndex + 1);
  };

  const handlePrev = () => {
    if (hasPrev) {
      onNavigate(currentSectionIndex - 1);
    }
  };

  const markCompleteButton = (
    <button
      onClick={handleToggleComplete}
      className={`flex items-center gap-2 text-sm transition-colors ${
        completed
          ? "text-green-400 hover:text-green-300"
          : "text-gray-500 hover:text-gray-300"
      }`}
    >
      {completed ? (
        <CheckCircle className="w-5 h-5" />
      ) : (
        <Circle className="w-5 h-5" />
      )}
      <span>{completed ? "Completed" : "Mark complete"}</span>
    </button>
  );

  const nextButton = !isLastSection ? (
    <button
      onClick={handleNext}
      className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors group"
    >
      <span className="text-sm">{nextSection?.title}</span>
      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
    </button>
  ) : (
    <button
      onClick={handleNext}
      className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors group"
    >
      <FileQuestion className="w-4 h-4" />
      <span className="text-sm">Take Quiz</span>
      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
    </button>
  );

  const prevButton = hasPrev && (
    <button
      onClick={handlePrev}
      className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
    >
      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
      <span className="text-sm">{prevSection?.title}</span>
    </button>
  );

  return (
    <div className="mt-12 pt-6 border-t border-gray-800">
      <div className="flex items-center justify-between">
        {/* Left side */}
        {hasPrev ? prevButton : markCompleteButton}

        {/* Center - only show if prev exists */}
        {hasPrev && markCompleteButton}

        {/* Right side */}
        {nextButton}
      </div>
    </div>
  );
};

export default CourseNavigation;
