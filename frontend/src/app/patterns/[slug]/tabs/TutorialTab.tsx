"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Pattern } from "@/types";
import { CourseSidebar, CourseNavigation } from "@/components/course";
import TutorialSection from "@/components/course/TutorialSection";
import { QuizCard } from "@/components/quiz";
import { Highlightable } from "@/components/ui/Highlightable";
import { slugify, findSectionIndexBySlug } from "@/lib/slugify";

interface TutorialTabProps {
  pattern: Pattern;
  onAskAI?: (selectedText: string) => void;
  initialSectionSlug?: string;
}

const TutorialTab = ({
  pattern,
  onAskAI,
  initialSectionSlug,
}: TutorialTabProps) => {
  const router = useRouter();
  const sections = pattern.tutorial || [];

  const getInitialSectionIndex = () => {
    if (initialSectionSlug === "quiz") {
      return sections.length;
    }
    if (initialSectionSlug) {
      const index = findSectionIndexBySlug(sections, initialSectionSlug);
      return index !== -1 ? index : 0;
    }
    return 0;
  };

  const [currentSectionIndex, setCurrentSectionIndex] = useState(
    getInitialSectionIndex
  );
  const sidebarRef = useRef<HTMLDivElement>(null);
  const hasTutorial = pattern.tutorial && pattern.tutorial.length > 0;
  const sectionsRef = useRef(sections);
  const isQuizPage = currentSectionIndex === sections.length;

  // Keep sectionsRef in sync with sections
  useEffect(() => {
    sectionsRef.current = sections;
  });

  const handleSectionChange = useCallback(
    (index: number) => {
      const currentSections = sectionsRef.current;
      setCurrentSectionIndex(index);
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Navigate to new URL
      if (index === currentSections.length) {
        router.push(`/patterns/${pattern.id}/quiz`, { scroll: false });
      } else if (currentSections[index]) {
        const sectionSlug = slugify(currentSections[index].title);
        router.push(`/patterns/${pattern.id}/${sectionSlug}`, { scroll: false });
      }
    },
    [pattern.id, router]
  );

  // Handle sidebar scroll independently
  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar) return undefined;

    const handleWheel = (e: WheelEvent) => {
      const { scrollTop, scrollHeight, clientHeight } = sidebar;
      const isAtTop = scrollTop === 0;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

      // Only prevent default if we can scroll in that direction
      if ((e.deltaY < 0 && !isAtTop) || (e.deltaY > 0 && !isAtBottom)) {
        e.stopPropagation();
      } else if ((e.deltaY < 0 && isAtTop) || (e.deltaY > 0 && isAtBottom)) {
        // At boundary, let parent scroll
      } else {
        e.stopPropagation();
      }
    };

    sidebar.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      sidebar.removeEventListener("wheel", handleWheel);
    };
  }, []);

  // Legacy hash support: redirect hash URLs to new format
  useEffect(() => {
    if (sections.length === 0) return;

    const hash = window.location.hash;
    if (!hash || hash === "#") return;

    const hashValue = hash.slice(1);

    if (hashValue === "quiz") {
      router.replace(`/patterns/${pattern.id}/quiz`);
      return;
    }

    // Try numeric format: #section-0, #section-1, etc.
    if (hashValue.startsWith("section-")) {
      const index = parseInt(hashValue.replace("section-", ""), 10);
      if (!isNaN(index) && index >= 0 && index < sections.length) {
        const sectionSlug = slugify(sections[index].title);
        router.replace(`/patterns/${pattern.id}/${sectionSlug}`);
        return;
      }
    }

    // Try slug format: #minimum-arrows-to-burst-balloons
    const slugIndex = findSectionIndexBySlug(sections, hashValue);
    if (slugIndex !== -1) {
      const normalizedSlug = slugify(sections[slugIndex].title);
      router.replace(`/patterns/${pattern.id}/${normalizedSlug}`);
    }
  }, [pattern.id, router, sections]);

  if (!hasTutorial) {
    return (
      <div className="space-y-8">
        <div className="bg-gray-900 rounded-md border border-gray-800 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Overview</h2>
          <p className="text-gray-300 leading-relaxed">{pattern.description}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-900 rounded-md border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="text-green-400">✓</span> When to Use
            </h3>
            <ul className="space-y-3">
              {pattern.whenToUse.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-300">
                  <span className="text-green-400 mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gray-900 rounded-md border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="text-yellow-400">💡</span> Key Insights
            </h3>
            <ul className="space-y-3">
              {pattern.keyInsights.map((insight, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-300">
                  <span className="text-yellow-400 font-bold">{i + 1}.</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {pattern.commonMistakes && pattern.commonMistakes.length > 0 && (
          <div className="bg-red-500/5 rounded-md border border-red-500/20 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="text-red-400">⚠️</span> Common Mistakes
            </h3>
            <ul className="space-y-3">
              {pattern.commonMistakes.map((mistake, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-300">
                  <span className="text-red-400">✗</span>
                  <span>{mistake}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  const currentSection = isQuizPage ? null : sections[currentSectionIndex];

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <div
          ref={sidebarRef}
          className="sticky top-0 max-h-[70vh] overflow-y-auto overscroll-none scrollbar-none"
        >
          <CourseSidebar
            pattern={pattern}
            currentSectionIndex={currentSectionIndex}
            onSectionChange={handleSectionChange}
          />
        </div>
      </div>

      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden">
        <CourseSidebar
          pattern={pattern}
          currentSectionIndex={currentSectionIndex}
          onSectionChange={handleSectionChange}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex justify-center">
        <div className="w-full max-w-3xl">
          {isQuizPage ? (
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Quiz</h2>
                <p className="text-gray-400">
                  Test your understanding of {pattern.category}
                </p>
              </div>
              <QuizCard patternId={pattern.id} questionCount={15} />
            </div>
          ) : (
            <>
              {currentSection && (
                <Highlightable
                  contentType="pattern_tutorial"
                  contentId={`${pattern.id}:section-${currentSectionIndex}`}
                  onAskAI={onAskAI}
                >
                  <TutorialSection
                    pattern={pattern}
                    section={currentSection}
                    sectionIndex={currentSectionIndex}
                  />
                </Highlightable>
              )}
              <CourseNavigation
                pattern={pattern}
                currentSectionIndex={currentSectionIndex}
                onNavigate={handleSectionChange}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorialTab;
