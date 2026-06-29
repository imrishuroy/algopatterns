"use client";

import { useState, useMemo, useEffect, useRef, useCallback, startTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Pattern } from "@/types";
import { questions, categoryToPatternId } from "@/lib/questions";
import { useProgress } from "@/contexts/ProgressContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import TutorialTab from "./tabs/TutorialTab";
import ProblemsTab from "./tabs/ProblemsTab";
import CheatsheetTab from "./tabs/CheatsheetTab";
import { Highlightable } from "@/components/ui/Highlightable";
import { UpgradePrompt } from "@/components/pricing";
import { AIChatPanel } from "@/components/ai";

type Tab = "tutorial" | "problems" | "cheatsheet";

const FREE_PATTERN_IDS = new Set([
  "sliding-window",
  "two-pointers",
  "binary-search",
]);

interface PatternPageClientProps {
  pattern: Pattern;
}

const difficultyColors: Record<string, string> = {
  Easy: "bg-green-500/20 text-green-400",
  Medium: "bg-yellow-500/20 text-yellow-400",
  Hard: "bg-red-500/20 text-red-400",
  "Easy-Medium": "bg-emerald-500/20 text-emerald-400",
  "Medium-Hard": "bg-orange-500/20 text-orange-400",
};

export default function PatternPageClient({ pattern }: PatternPageClientProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<Tab>(
    tabParam === "problems" || tabParam === "cheatsheet" ? tabParam : "tutorial"
  );
  const [isAIChatOpen, setIsAIChatOpen] = useState(true);
  const [aiPanelWidth, setAiPanelWidth] = useState(28);
  const [activeSection, setActiveSection] = useState<string>("");
  const [sectionContent, setSectionContent] = useState<string>("");
  const [aiInitialMessage, setAiInitialMessage] = useState<string>();
  const [aiMessageKey, setAiMessageKey] = useState(0);
  const activeSectionRef = useRef(activeSection);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    activeSectionRef.current = activeSection;
  }, [activeSection]);

  useEffect(() => {
    if (tabParam === "problems" || tabParam === "cheatsheet" || tabParam === "tutorial") {
      startTransition(() => {
        setActiveTab(tabParam);
      });
    }
  }, [tabParam]);
  const { completed, toggleComplete } = useProgress();
  const { isPro, isLoading: subscriptionLoading } = useSubscription();

  const isLocked = !isPro && !FREE_PATTERN_IDS.has(pattern.id);

  const patternQuestions = useMemo(() => {
    return questions.filter((q) => {
      const patternId = categoryToPatternId[q.category];
      return patternId === pattern.id;
    });
  }, [pattern.id]);

  const stats = useMemo(() => {
    const total = patternQuestions.length;
    const done = patternQuestions.filter((q) => completed.has(q.id)).length;
    return {
      total,
      done,
      percent: total > 0 ? Math.round((done / total) * 100) : 0,
    };
  }, [patternQuestions, completed]);

  const tabs = [
    { id: "tutorial" as Tab, label: "Tutorial" },
    { id: "problems" as Tab, label: "Problems", count: stats.total },
    { id: "cheatsheet" as Tab, label: "Cheatsheet" },
  ];

  // Track active tutorial section via IntersectionObserver (200ms throttle)
  useEffect(() => {
    if (activeTab !== "tutorial" || !isAIChatOpen) return;

    let lastUpdate = 0;
    const THROTTLE_MS = 200;

    const observer = new IntersectionObserver(
      (entries) => {
        const now = Date.now();
        if (now - lastUpdate < THROTTLE_MS) return;

        for (const entry of entries) {
          if (entry.isIntersecting) {
            lastUpdate = now;
            const sectionId = entry.target.getAttribute("data-section-id") || "";
            if (sectionId && sectionId !== activeSectionRef.current) {
              setActiveSection(sectionId);
              setSectionContent(entry.target.textContent?.slice(0, 2000) || "");
            }
          }
        }
      },
      { threshold: 0.3 }
    );

    const timer = setTimeout(() => {
      document.querySelectorAll("[data-section-id]").forEach((el) => observer.observe(el));
    }, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [activeTab, isAIChatOpen, pattern.id]);

  // Keyboard shortcut for AI panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "a") {
        e.preventDefault();
        setIsAIChatOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Resizable AI panel
  const handleResize = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const startX = e.clientX;
      const startWidth = aiPanelWidth;

      const handleMouseMove = (e: MouseEvent) => {
        const container = containerRef.current;
        if (!container) return;
        const containerWidth = container.offsetWidth;
        const delta = startX - e.clientX;
        const newWidth = startWidth + (delta / containerWidth) * 100;
        setAiPanelWidth(Math.min(Math.max(newWidth, 15), 45));
      };

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [aiPanelWidth]
  );

  const handleAskAI = useCallback(
    (selectedText: string) => {
      const sectionLabel = activeSectionRef.current || pattern.category;
      const prompt = `Please explain the following text from the "${sectionLabel}" section of the ${pattern.category} pattern:\n\n"${selectedText}"`;
      setAiInitialMessage(prompt);
      setAiMessageKey((k) => k + 1);
      setIsAIChatOpen(true);
    },
    [pattern.category]
  );

  const handleCloseAI = useCallback(() => {
    setIsAIChatOpen(false);
		setAiInitialMessage(undefined);
    setAiMessageKey(0);
  }, []);

  const header = (
    <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm flex-shrink-0">
      <div className="px-4 py-4">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>Back</span>
          </Link>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {pattern.category}
              </h1>
              <span
                className={`px-3 py-1 text-sm rounded-full ${difficultyColors[pattern.difficulty]}`}
              >
                {pattern.difficulty}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>
                Time:{" "}
                <span className="text-indigo-400 font-mono">{pattern.timeComplexity}</span>
              </span>
              <span>
                Space:{" "}
                <span className="text-purple-400 font-mono">{pattern.spaceComplexity}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-white">
                {stats.done}/{stats.total}
              </div>
              <div className="text-sm text-gray-500">problems solved</div>
            </div>
            <div className="w-16 h-16 relative">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 64 64">
                <circle
                  cx="32" cy="32" r="28"
                  stroke="currentColor" strokeWidth="4" fill="none"
                  className="text-gray-800"
                />
                <circle
                  cx="32" cy="32" r="28"
                  stroke="url(#miniGradient)" strokeWidth="4" fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${stats.percent * 1.76} 176`}
                />
                <defs>
                  <linearGradient id="miniGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
                {stats.percent}%
              </span>
            </div>
            <button
              onClick={() => setIsAIChatOpen(!isAIChatOpen)}
              className={`p-2 rounded-md transition-colors border ${
                isAIChatOpen
                  ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-400"
                  : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600"
              }`}
              title="Thor AI (Cmd+Shift+A)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex gap-1 mt-4 md:mt-6 -mb-px overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 md:py-3 text-sm font-medium rounded-t-md transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-gray-950 text-white border-t border-l border-r border-gray-800"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="px-2 py-0.5 text-xs bg-gray-800 rounded-full">{tab.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className="h-[calc(100vh-64px)] flex bg-gray-950">
      {/* Main Content Column */}
      <div
        className="flex flex-col flex-1 min-w-0 overflow-hidden"
      >        {header}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-4 md:py-8">
            {subscriptionLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-gray-400">Loading...</div>
              </div>
            ) : isLocked ? (
              <UpgradePrompt
                feature={`the ${pattern.category} pattern`}
                title="Premium Pattern"
                description={`The ${pattern.category} pattern is available exclusively for Pro members. Upgrade to unlock all patterns, visualizers, and premium features.`}
              />
            ) : (
              <>
                {activeTab === "tutorial" && (
                  <Highlightable contentType="pattern_tutorial" contentId={pattern.id} onAskAI={handleAskAI}>
                    <TutorialTab pattern={pattern} />
                  </Highlightable>
                )}
                {activeTab === "problems" && (
                  <ProblemsTab
                    questions={patternQuestions}
                    completed={completed}
                    onToggleComplete={toggleComplete}
                    patternId={pattern.id}
                  />
                )}
                {activeTab === "cheatsheet" && (
                  <Highlightable contentType="pattern_cheatsheet" contentId={pattern.id} onAskAI={handleAskAI}>
                    <CheatsheetTab pattern={pattern} />
                  </Highlightable>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Resize Handle + AI Panel (Desktop) */}
      {isAIChatOpen && (
        <>
          <div
            onMouseDown={handleResize}
            className="hidden md:block w-1 bg-gray-800 hover:bg-indigo-500 cursor-col-resize transition-colors flex-shrink-0"
          />
          <div
            className="hidden md:flex flex-col flex-shrink-0 overflow-hidden"
            style={{ width: `${aiPanelWidth}%`, height: "100%" }}
          >
            <AIChatPanel
              patternId={pattern.id}
              patternName={pattern.category}
              patternDifficulty={pattern.difficulty}
              timeComplexity={pattern.timeComplexity}
              spaceComplexity={pattern.spaceComplexity}
              activeSection={activeSection}
              sectionContent={sectionContent}
              contextType="pattern"
              language="java"
              initialMessage={aiInitialMessage}
              initialMessageKey={aiMessageKey}
              isOpen={isAIChatOpen}
              onClose={handleCloseAI}
            />
          </div>
        </>
      )}

      {/* Mobile AI Overlay */}
      {isAIChatOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-gray-950">
          <AIChatPanel
            patternId={pattern.id}
            patternName={pattern.category}
            patternDifficulty={pattern.difficulty}
            timeComplexity={pattern.timeComplexity}
            spaceComplexity={pattern.spaceComplexity}
            activeSection={activeSection}
            sectionContent={sectionContent}
            contextType="pattern"
            language="java"
            initialMessage={aiInitialMessage}
            initialMessageKey={aiMessageKey}
            isOpen={isAIChatOpen}
            onClose={handleCloseAI}
          />
        </div>
      )}
    </div>
  );
}
