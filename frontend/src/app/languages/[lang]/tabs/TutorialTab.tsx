"use client";

import { useRef, useEffect, useState } from "react";
import {
  LanguageGuide,
  SectionContent,
  difficultyColors,
} from "@/types/languages";
import { Highlightable } from "@/components/ui/Highlightable";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  ChevronLeft,
  CheckCircle2,
  Circle,
  Clock,
  Lightbulb,
  AlertTriangle,
  PanelLeftClose,
  PanelLeft,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

interface TutorialTabProps {
  guide: LanguageGuide;
  categories: string[];
  currentSectionIndex: number;
  completedSections: Set<number>;
  onSectionChange: (index: number) => void;
  onToggleComplete: (index: number) => void;
  onAskAI: (text: string) => void;
}

// Sidebar component
const Sidebar = ({
  guide,
  categories,
  currentSectionIndex,
  completedSections,
  onSectionChange,
  onCollapse,
}: {
  guide: LanguageGuide;
  categories: string[];
  currentSectionIndex: number;
  completedSections: Set<number>;
  onSectionChange: (index: number) => void;
  onCollapse: () => void;
}) => {
  const sectionRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const totalSections = guide.sections.length;
  const progress = Math.round((completedSections.size / totalSections) * 100);

  useEffect(() => {
    const currentRef = sectionRefs.current.get(currentSectionIndex);
    if (currentRef && typeof currentRef.scrollIntoView === "function") {
      currentRef.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [currentSectionIndex]);

  return (
    <div className="p-4 space-y-4">
      {/* Back Link + Collapse Toggle */}
      <div className="flex items-center justify-between">
        <Link
          href="/languages"
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4 flex-shrink-0" />
          <span>All Languages</span>
        </Link>
        <button
          onClick={onCollapse}
          className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          title="Collapse sidebar"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* Guide Title */}
      <div className="border-b border-gray-800 pb-4">
        <h2 className="font-semibold text-white text-lg leading-tight">
          {guide.displayName}
        </h2>
        <p className="text-sm text-gray-400 mt-1">{guide.difficulty}</p>
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

      {/* Section List by Category */}
      <nav className="space-y-4 pb-8">
        {categories.map((category) => {
          const categorySections = guide.sections
            .map((s, i) => ({ section: s, index: i }))
            .filter((item) => item.section.category === category);

          return (
            <div key={category}>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {category}
              </h3>
              <div className="space-y-1">
                {categorySections.map(({ section, index }) => {
                  const isCompleted = completedSections.has(index);
                  const isCurrent = index === currentSectionIndex;

                  return (
                    <button
                      key={section.id}
                      ref={(el) => {
                        if (el) sectionRefs.current.set(index, el);
                      }}
                      onClick={() => onSectionChange(index)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-left text-sm transition-all ${
                        isCurrent
                          ? "bg-indigo-500/20 text-white border-l-2 border-indigo-500"
                          : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 flex-shrink-0" />
                      )}
                      <span className="truncate">{section.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
    </div>
  );
};

// Section Navigation component (like patterns page)
const SectionNavigation = ({
  sections,
  currentSectionIndex,
  isCompleted,
  onNavigate,
  onToggleComplete,
}: {
  sections: { title: string; id: string }[];
  currentSectionIndex: number;
  isCompleted: boolean;
  onNavigate: (index: number) => void;
  onToggleComplete: () => void;
}) => {
  const hasPrev = currentSectionIndex > 0;
  const hasNext = currentSectionIndex < sections.length - 1;
  const prevSection = hasPrev ? sections[currentSectionIndex - 1] : null;
  const nextSection = hasNext ? sections[currentSectionIndex + 1] : null;

  const markCompleteButton = (
    <button
      onClick={onToggleComplete}
      className={`flex items-center gap-2 text-sm transition-colors ${
        isCompleted
          ? "text-green-400 hover:text-green-300"
          : "text-gray-500 hover:text-gray-300"
      }`}
    >
      {isCompleted ? (
        <CheckCircle2 className="w-5 h-5" />
      ) : (
        <Circle className="w-5 h-5" />
      )}
      <span>{isCompleted ? "Completed" : "Mark complete"}</span>
    </button>
  );

  const prevButton = hasPrev && (
    <button
      onClick={() => onNavigate(currentSectionIndex - 1)}
      className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
    >
      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
      <span className="text-sm truncate max-w-[200px]">
        {prevSection?.title}
      </span>
    </button>
  );

  const nextButton = hasNext && (
    <button
      onClick={() => onNavigate(currentSectionIndex + 1)}
      className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors group"
    >
      <span className="text-sm truncate max-w-[200px]">
        {nextSection?.title}
      </span>
      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
    </button>
  );

  return (
    <div className="mt-12 pt-6 border-t border-gray-800">
      <div className="flex items-center justify-between gap-4">
        {/* Left side */}
        <div className="flex-1 min-w-0">
          {hasPrev ? prevButton : markCompleteButton}
        </div>

        {/* Center - only show if prev exists */}
        {hasPrev && <div className="flex-shrink-0">{markCompleteButton}</div>}

        {/* Right side */}
        <div className="flex-1 min-w-0 flex justify-end">{nextButton}</div>
      </div>
    </div>
  );
};

// Render content blocks
const ContentRenderer = ({
  content,
  language,
}: {
  content: SectionContent[];
  language: string;
}) => {
  // Generate a stable key for each content block
  const getBlockKey = (block: SectionContent, index: number): string => {
    if (block.text) return `${block.type}-${block.text.slice(0, 30)}`;
    if (block.code) return `code-${block.code.slice(0, 30)}`;
    if (block.title) return `${block.type}-${block.title}`;
    if (block.message) return `${block.type}-${block.message.slice(0, 30)}`;
    return `${block.type}-${index}`;
  };

  return (
    <div className="space-y-6">
      {content.map((block, index) => {
        const key = getBlockKey(block, index);
        switch (block.type) {
          case "heading":
            const HeadingTag = `h${block.level || 3}` as "h2" | "h3" | "h4";
            return (
              <HeadingTag
                key={key}
                className={`font-semibold text-white ${
                  block.level === 2
                    ? "text-xl mt-8"
                    : block.level === 4
                      ? "text-base mt-4"
                      : "text-lg mt-6"
                }`}
              >
                {block.text}
              </HeadingTag>
            );

          case "text":
            return (
              <p key={key} className="text-gray-300 leading-relaxed">
                {block.text}
              </p>
            );

          case "code":
            return (
              <div
                key={key}
                className="relative group rounded-md overflow-hidden border border-gray-800 bg-[#011627]"
              >
                {/* Header bar */}
                <div className="flex items-center justify-between px-4 py-2 bg-[#0d1b2a] border-b border-gray-800">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    {block.filename && (
                      <span className="text-xs text-gray-400 ml-2 font-medium">
                        {block.filename}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(block.code || "");
                    }}
                    className="px-3 py-1 text-xs rounded-md transition flex items-center gap-1 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300"
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
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Copy
                  </button>
                </div>
                <div className="overflow-auto scrollbar-thin">
                  <SyntaxHighlighter
                    language={block.language || language.toLowerCase()}
                    style={oneDark}
                    showLineNumbers
                    lineNumberStyle={{
                      minWidth: "2.5em",
                      paddingRight: "1em",
                      textAlign: "right",
                      userSelect: "none",
                      color: "#4a5568",
                      fontSize: "0.75rem",
                    }}
                    customStyle={{
                      margin: 0,
                      background: "#011627",
                      borderRadius: 0,
                      padding: "1rem",
                      fontSize: "0.875rem",
                      lineHeight: "1.6",
                    }}
                    codeTagProps={{
                      style: {
                        fontFamily:
                          "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                      },
                    }}
                  >
                    {(block.code || "").trim()}
                  </SyntaxHighlighter>
                </div>
              </div>
            );

          case "tip":
            return (
              <div
                key={key}
                className="flex gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
              >
                <Lightbulb className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  {block.title && (
                    <h4 className="font-medium text-emerald-400 mb-1">
                      {block.title}
                    </h4>
                  )}
                  <p className="text-gray-300 text-sm">{block.message}</p>
                </div>
              </div>
            );

          case "warning":
            return (
              <div
                key={key}
                className="flex gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20"
              >
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  {block.title && (
                    <h4 className="font-medium text-amber-400 mb-1">
                      {block.title}
                    </h4>
                  )}
                  <p className="text-gray-300 text-sm">{block.message}</p>
                </div>
              </div>
            );

          case "comparison":
            return (
              <div key={key} className="grid gap-3">
                {block.items?.map((item) => (
                  <div
                    key={item.label}
                    className="flex gap-4 p-3 rounded-lg bg-gray-800/50"
                  >
                    <div className="font-medium text-indigo-400 min-w-[140px]">
                      {item.label}
                    </div>
                    <div className="text-gray-300">{item.description}</div>
                  </div>
                ))}
              </div>
            );

          case "complexity":
            return (
              <div
                key={key}
                className="p-4 rounded-lg bg-gray-800/50 border border-gray-700"
              >
                <h4 className="font-medium text-white mb-3">Complexity</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Time:</span>{" "}
                    <span className="text-indigo-400 font-mono">
                      {block.time}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Space:</span>{" "}
                    <span className="text-purple-400 font-mono">
                      {block.space}
                    </span>
                  </div>
                </div>
                {block.explanation && (
                  <p className="text-gray-400 text-sm mt-2">
                    {block.explanation}
                  </p>
                )}
              </div>
            );

          case "table":
            return (
              <div
                key={key}
                className="overflow-x-auto rounded-lg border border-gray-700"
              >
                <table className="w-full text-sm">
                  {block.headers && (
                    <thead className="bg-gray-800/80">
                      <tr>
                        {block.headers.map((header) => (
                          <th
                            key={header}
                            className="px-4 py-3 text-left font-medium text-indigo-400 border-b border-gray-700"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                  )}
                  <tbody className="divide-y divide-gray-700/50">
                    {block.rows?.map((row) => (
                      <tr
                        key={row[0]}
                        className="bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
                      >
                        {row.map((cell, cellIndex) => (
                          <td
                            key={cell}
                            className={`px-4 py-3 ${cellIndex === 0 ? "font-mono text-emerald-400" : "text-gray-300"}`}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
};

// skipcq: JS-0067
export default function TutorialTab({
  guide,
  categories,
  currentSectionIndex,
  completedSections,
  onSectionChange,
  onToggleComplete,
  onAskAI,
}: TutorialTabProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const currentSection = guide.sections[currentSectionIndex];
  const isCompleted = completedSections.has(currentSectionIndex);

  return (
    <div className="flex h-full">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out border-r border-gray-800 ${
          isSidebarCollapsed ? "w-0 border-r-0 overflow-hidden" : "w-72"
        }`}
      >
        {/* Scrollable Sidebar Content - independent scroll */}
        <div
          className={`h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent transition-opacity duration-300 ${
            isSidebarCollapsed ? "opacity-0" : "opacity-100"
          }`}
        >
          <Sidebar
            guide={guide}
            categories={categories}
            currentSectionIndex={currentSectionIndex}
            completedSections={completedSections}
            onSectionChange={onSectionChange}
            onCollapse={() => setIsSidebarCollapsed(true)}
          />
        </div>
      </aside>

      {/* Collapsed Sidebar Toggle (shown when collapsed) */}
      {isSidebarCollapsed && (
        <div className="hidden lg:flex flex-shrink-0 items-start p-2 border-r border-gray-800">
          <button
            onClick={() => setIsSidebarCollapsed(false)}
            className="flex items-center justify-center w-8 h-8 rounded-md bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            title="Expand sidebar"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Content - independent scroll */}
      <div
        className={`flex-1 min-w-0 h-full overflow-y-auto transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? "lg:pl-4" : "lg:pl-8"
        } pr-4 lg:pr-8 py-4 md:py-8`}
      >
        <Highlightable
          contentType="language_guide"
          contentId={`${guide.id}-${currentSection.id}`}
          onAskAI={onAskAI}
        >
          {/* Section Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-white">
                {currentSection.title}
              </h2>
              <span
                className={`px-2 py-0.5 text-xs rounded-full border ${difficultyColors[currentSection.difficulty]}`}
              >
                {currentSection.difficulty}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {currentSection.estimatedTime}
              </span>
              <span>{currentSection.category}</span>
            </div>
          </div>

          {/* Content */}
          <div
            data-section-id={currentSection.id}
            className="prose prose-invert max-w-none"
          >
            <ContentRenderer
              content={currentSection.content}
              language={guide.name}
            />
          </div>
        </Highlightable>

        {/* Navigation */}
        <SectionNavigation
          sections={guide.sections}
          currentSectionIndex={currentSectionIndex}
          isCompleted={isCompleted}
          onNavigate={onSectionChange}
          onToggleComplete={() => onToggleComplete(currentSectionIndex)}
        />
      </div>
    </div>
  );
}
