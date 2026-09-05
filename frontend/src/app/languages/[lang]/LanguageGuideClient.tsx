"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LanguageGuide, languageAccents } from "@/types/languages";
import { getSectionCategories } from "@/lib/languages";
import { Highlightable } from "@/components/ui/Highlightable";
import { AIChatPanel } from "@/components/ai";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import TutorialTab from "./tabs/TutorialTab";
import CheatsheetTab from "./tabs/CheatsheetTab";

type Tab = "tutorial" | "cheatsheet";

interface LanguageGuideClientProps {
  guide: LanguageGuide;
  initialSectionId?: string;
}

// Storage key for tutorial progress (per language) - used for unauthenticated users
const getStorageKey = (guideId: string) =>
  `algopatterns-tutorial-${guideId}-completed`;

// Convert guide ID to tutorial pattern ID (e.g., "go" -> "tutorial-go")
const getTutorialPatternId = (guideId: string) => `tutorial-${guideId}`;

// skipcq: JS-0067, JS-R1005, JS-0415
export default function LanguageGuideClient({
  guide,
  initialSectionId,
}: LanguageGuideClientProps) {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("tutorial");

  const getInitialSectionIndex = () => {
    if (initialSectionId) {
      const index = guide.sections.findIndex((s) => s.id === initialSectionId);
      return index !== -1 ? index : 0;
    }
    return 0;
  };

  const [currentSectionIndex, setCurrentSectionIndex] = useState(
    getInitialSectionIndex
  );
  const [isAIChatOpen, setIsAIChatOpen] = useState(true);
  const [aiPanelWidth, setAiPanelWidth] = useState(28);
  const [aiInitialMessage, setAiInitialMessage] = useState<string>();
  const [aiMessageKey, setAiMessageKey] = useState(0);
  const [completedSections, setCompletedSections] = useState<Set<number>>(
    new Set()
  );
  const [isProgressLoading, setIsProgressLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const accentColor = languageAccents[guide.id] || "#6366f1";
  const categories = getSectionCategories(guide);
  const totalSections = guide.sections.length;
  const progress = Math.round((completedSections.size / totalSections) * 100);

  // Support legacy hash navigation (redirect to new URL format)
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const index = guide.sections.findIndex((s) => s.id === hash);
      if (index !== -1) {
        router.replace(`/languages/${guide.id}/${hash}`);
      }
    }
  }, [guide.id, guide.sections, router]);

  // Load tutorial progress from backend (authenticated) or localStorage (guest)
  // skipcq: JS-R1005
  useEffect(() => {
    const loadProgress = async () => {
      setIsProgressLoading(true);
      const tutorialId = getTutorialPatternId(guide.id);

      if (user) {
        // Authenticated: fetch from backend
        try {
          const response = await apiClient.getPatternProgress();
          if (response.data?.progress) {
            const sections = response.data.progress[tutorialId] || [];
            setCompletedSections(new Set(sections));

            // Sync any local progress to backend on first load
            const localKey = getStorageKey(guide.id);
            const localData = localStorage.getItem(localKey);
            if (localData) {
              try {
                const localSections = JSON.parse(localData) as number[];
                if (localSections.length > 0) {
                  // Merge local progress with server progress
                  const merged = new Set([...sections, ...localSections]);
                  if (merged.size > sections.length) {
                    await apiClient.syncPatternProgress({
                      [tutorialId]: [...merged],
                    });
                    setCompletedSections(merged);
                  }
                  // Clear local storage after sync
                  localStorage.removeItem(localKey);
                }
              } catch {
                // Ignore parse errors
              }
            }
          }
        } catch {
          // Fallback to localStorage on error
          try {
            const saved = localStorage.getItem(getStorageKey(guide.id));
            if (saved) {
              setCompletedSections(new Set(JSON.parse(saved) as number[]));
            }
          } catch {
            // Ignore
          }
        }
      } else if (!isAuthLoading) {
        // Guest: load from localStorage
        try {
          const saved = localStorage.getItem(getStorageKey(guide.id));
          if (saved) {
            setCompletedSections(new Set(JSON.parse(saved) as number[]));
          }
        } catch {
          // Ignore parse errors
        }
      }

      setIsProgressLoading(false);
    };

    if (!isAuthLoading) {
      loadProgress();
    }
  }, [user, isAuthLoading, guide.id]);

  // Derive active section from current state (no effect needed)
  const derivedActiveSection =
    activeTab === "tutorial" && guide.sections[currentSectionIndex]
      ? guide.sections[currentSectionIndex].title
      : "";
  const derivedSectionContent =
    activeTab === "tutorial" && guide.sections[currentSectionIndex]
      ? guide.sections[currentSectionIndex].content
          .map((c) => c.text || c.code || c.message || "")
          .join(" ")
          .slice(0, 2000)
      : "";

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
      const sectionLabel =
        derivedActiveSection || guide.sections[currentSectionIndex]?.title;
      const prompt = `Please explain the following text from the "${sectionLabel}" section of the ${guide.displayName} guide:\n\n"${selectedText}"`;
      setAiInitialMessage(prompt);
      setAiMessageKey((k) => k + 1);
      setIsAIChatOpen(true);
    },
    [
      guide.displayName,
      guide.sections,
      currentSectionIndex,
      derivedActiveSection,
    ]
  );

  const handleCloseAI = useCallback(() => {
    setIsAIChatOpen(false);
    setAiInitialMessage(undefined); // skipcq: JS-W1042
    setAiMessageKey(0);
  }, []);

  const handleSectionChange = useCallback(
    (index: number) => {
      setCurrentSectionIndex(index);
      const sectionId = guide.sections[index].id;
      router.push(`/languages/${guide.id}/${sectionId}`, { scroll: false });
    },
    [guide.sections, guide.id, router]
  );

  const handleToggleComplete = useCallback(
    async (index: number) => {
      const tutorialId = getTutorialPatternId(guide.id);
      const isCompleting = !completedSections.has(index);

      // Optimistic update
      setCompletedSections((prev) => {
        const next = new Set(prev);
        if (next.has(index)) {
          next.delete(index);
        } else {
          next.add(index);
        }
        return next;
      });

      if (user) {
        // Authenticated: save to backend
        try {
          if (isCompleting) {
            await apiClient.markSectionComplete(tutorialId, index);
          } else {
            await apiClient.markSectionIncomplete(tutorialId, index);
          }
        } catch {
          // Revert on error
          setCompletedSections((prev) => {
            const reverted = new Set(prev);
            if (isCompleting) {
              reverted.delete(index);
            } else {
              reverted.add(index);
            }
            return reverted;
          });
        }
      } else {
        // Guest: save to localStorage
        setCompletedSections((prev) => {
          try {
            localStorage.setItem(
              getStorageKey(guide.id),
              JSON.stringify([...prev])
            );
          } catch {
            // Ignore storage errors
          }
          return prev;
        });
      }
    },
    [guide.id, user, completedSections]
  );

  const tabs = [
    { id: "tutorial" as Tab, label: "Tutorial" },
    { id: "cheatsheet" as Tab, label: "Cheatsheet" },
  ];

  return (
    <div ref={containerRef} className="h-[calc(100vh-64px)] flex bg-gray-950">
      {/* Main Content Column */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm flex-shrink-0">
          <div className="px-4 py-4">
            <div className="flex items-center gap-4 mb-4">
              <Link
                href="/languages"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span>Languages</span>
              </Link>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-white">
                    {guide.displayName}
                  </h1>
                  <span
                    className="px-3 py-1 text-sm rounded-full"
                    style={{
                      background: `${accentColor}20`,
                      color: accentColor,
                    }}
                  >
                    v{guide.version}
                  </span>
                </div>
                <p className="text-sm text-gray-400">{guide.description}</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {isProgressLoading ? (
                      <span className="inline-block w-12 h-6 bg-gray-800 animate-pulse rounded" />
                    ) : (
                      `${completedSections.size}/${totalSections}`
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    sections completed
                  </div>
                </div>
                <div className="w-16 h-16 relative">
                  <svg
                    className="w-full h-full transform -rotate-90"
                    viewBox="0 0 64 64"
                  >
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      className="text-gray-800"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke={accentColor}
                      strokeWidth="4"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${progress * 1.76} 176`}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
                    {progress}%
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
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === "tutorial" ? (
            <TutorialTab
              guide={guide}
              categories={categories}
              currentSectionIndex={currentSectionIndex}
              completedSections={completedSections}
              onSectionChange={handleSectionChange}
              onToggleComplete={handleToggleComplete}
              onAskAI={handleAskAI}
            />
          ) : (
            <div className="h-full overflow-y-auto">
              <div className="py-4 md:py-8 px-4 max-w-4xl mx-auto">
                <Highlightable
                  contentType="language_cheatsheet"
                  contentId={guide.id}
                  onAskAI={handleAskAI}
                >
                  <CheatsheetTab
                    cheatsheet={guide.cheatsheet}
                    language={guide.name}
                  />
                </Highlightable>
              </div>
            </div>
          )}
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
              patternId={guide.id}
              patternName={guide.displayName}
              patternDifficulty={guide.difficulty}
              activeSection={derivedActiveSection}
              sectionContent={derivedSectionContent}
              contextType="language_guide"
              language={guide.name.toLowerCase()}
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
            patternId={guide.id}
            patternName={guide.displayName}
            patternDifficulty={guide.difficulty}
            activeSection={derivedActiveSection}
            sectionContent={derivedSectionContent}
            contextType="language_guide"
            language={guide.name.toLowerCase()}
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
