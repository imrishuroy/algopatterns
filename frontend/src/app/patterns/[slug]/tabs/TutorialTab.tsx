"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Pattern, SupportedLanguage } from "@/types";
import CodeBlock from "@/components/ui/CodeBlock";
import LanguageToggle from "@/components/ui/LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import DPTreeVisualizer from "@/components/visualizers/DPTreeVisualizer";
import DPTransformationVisualizer from "@/components/visualizers/DPTransformationVisualizer";
import DPTableVisualizer from "@/components/visualizers/DPTableVisualizer";
import KnapsackVisualizer from "@/components/visualizers/KnapsackVisualizer";
import DPComparisonVisualizer from "@/components/visualizers/DPComparisonVisualizer";
import RecurrenceBuilderVisualizer from "@/components/visualizers/RecurrenceBuilderVisualizer";
import ActivitySelectionVisualizer from "@/components/visualizers/ActivitySelectionVisualizer";
import JumpGameVisualizer from "@/components/visualizers/JumpGameVisualizer";
import GridBFSVisualizer from "@/components/visualizers/GridBFSVisualizer";
import TopologicalSortVisualizer from "@/components/visualizers/TopologicalSortVisualizer";
import DijkstraVisualizer from "@/components/visualizers/DijkstraVisualizer";
import TwoSumVisualizer from "@/components/visualizers/TwoSumVisualizer";
import AnagramGroupVisualizer from "@/components/visualizers/AnagramGroupVisualizer";
import ConsecutiveSequenceVisualizer from "@/components/visualizers/ConsecutiveSequenceVisualizer";
import KthLargestVisualizer from "@/components/visualizers/KthLargestVisualizer";
import MedianFinderVisualizer from "@/components/visualizers/MedianFinderVisualizer";
import MergeKListsVisualizer from "@/components/visualizers/MergeKListsVisualizer";
import MergeIntervalsVisualizer from "@/components/visualizers/MergeIntervalsVisualizer";
import MeetingRoomsVisualizer from "@/components/visualizers/MeetingRoomsVisualizer";
import IntervalIntersectionVisualizer from "@/components/visualizers/IntervalIntersectionVisualizer";
import LinkedListReversalVisualizer from "@/components/visualizers/LinkedListReversalVisualizer";
import CycleDetectionVisualizer from "@/components/visualizers/CycleDetectionVisualizer";
import ReorderListVisualizer from "@/components/visualizers/ReorderListVisualizer";
import PrefixSumVisualizer from "@/components/visualizers/PrefixSumVisualizer";
import SubarraySumKVisualizer from "@/components/visualizers/SubarraySumKVisualizer";
import ProductExceptSelfVisualizer from "@/components/visualizers/ProductExceptSelfVisualizer";
import FixedWindowVisualizer from "@/components/visualizers/FixedWindowVisualizer";
import LongestSubstringVisualizer from "@/components/visualizers/LongestSubstringVisualizer";
import FindAnagramsVisualizer from "@/components/visualizers/FindAnagramsVisualizer";
import ValidParenthesesVisualizer from "@/components/visualizers/ValidParenthesesVisualizer";
import NextGreaterVisualizer from "@/components/visualizers/NextGreaterVisualizer";
import LargestRectangleVisualizer from "@/components/visualizers/LargestRectangleVisualizer";
import TreeTraversalVisualizer from "@/components/visualizers/TreeTraversalVisualizer";
import LevelOrderVisualizer from "@/components/visualizers/LevelOrderVisualizer";
import BSTValidationVisualizer from "@/components/visualizers/BSTValidationVisualizer";
import TrieInsertVisualizer from "@/components/visualizers/TrieInsertVisualizer";
import TrieSearchVisualizer from "@/components/visualizers/TrieSearchVisualizer";
import TwoSumSortedVisualizer from "@/components/visualizers/TwoSumSortedVisualizer";
import ContainerWaterVisualizer from "@/components/visualizers/ContainerWaterVisualizer";
import RemoveDuplicatesVisualizer from "@/components/visualizers/RemoveDuplicatesVisualizer";
import UnionFindVisualizer from "@/components/visualizers/UnionFindVisualizer";
import ConnectedComponentsVisualizer from "@/components/visualizers/ConnectedComponentsVisualizer";
import { QuizCard } from "@/components/quiz";
import TwoSumHashMapVisualizer from "@/components/visualizers/TwoSumHashMapVisualizer";
import KadaneVisualizer from "@/components/visualizers/KadaneVisualizer";
import PrefixSumArrayVisualizer from "@/components/visualizers/PrefixSumArrayVisualizer";
import SubsetsVisualizer from "@/components/visualizers/SubsetsVisualizer";
import PermutationsVisualizer from "@/components/visualizers/PermutationsVisualizer";
import NQueensVisualizer from "@/components/visualizers/NQueensVisualizer";
import BinarySearchVisualizer from "@/components/visualizers/BinarySearchVisualizer";
import RotatedArrayVisualizer from "@/components/visualizers/RotatedArrayVisualizer";
import KokoEatingVisualizer from "@/components/visualizers/KokoEatingVisualizer";

interface TutorialTabProps {
  pattern: Pattern;
}

export default function TutorialTab({ pattern }: TutorialTabProps) {
  const { language: currentLang, setLanguage: setCurrentLang } = useLanguage();
  const hasTutorial = pattern.tutorial && pattern.tutorial.length > 0;

  if (!hasTutorial) {
    return (
      <div className="space-y-8">
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Overview</h2>
          <p className="text-gray-300 leading-relaxed">{pattern.description}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
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

          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
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
          <div className="bg-red-500/5 rounded-2xl border border-red-500/20 p-6">
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

  return (
    <div className="space-y-14">
      {pattern.tutorial!.map((section, idx) => (
        <article key={idx} className="scroll-mt-24" id={`section-${idx}`}>
          {/* Section Header - Simple numbering */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-indigo-400 font-mono text-lg">
              {idx + 1}.
            </span>
            <h2 className="text-2xl font-bold text-white">{section.title}</h2>
          </div>

          {/* Section Content */}
          <div className="pl-7">
            <div className="tutorial-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => (
                    <p className="text-gray-300 leading-relaxed mb-5">
                      {children}
                    </p>
                  ),
                  strong: ({ children }) => (
                    <strong className="text-white font-semibold">
                      {children}
                    </strong>
                  ),
                  h1: ({ children }) => (
                    <h3 className="text-2xl font-bold text-white mt-8 mb-4">
                      {children}
                    </h3>
                  ),
                  h2: ({ children }) => (
                    <h4 className="text-xl font-semibold text-white mt-6 mb-3">
                      {children}
                    </h4>
                  ),
                  h3: ({ children }) => (
                    <h5 className="text-lg font-semibold text-indigo-400 mt-5 mb-2">
                      {children}
                    </h5>
                  ),
                  ul: ({ children }) => (
                    <ul className="space-y-2 my-4">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="space-y-2 my-4 counter-reset-item">
                      {children}
                    </ol>
                  ),
                  li: ({ children, ...props }) => {
                    const isOrdered =
                      props.node?.position &&
                      props.node.position.start.column > 1;
                    return (
                      <li className="text-gray-300 leading-relaxed flex items-start gap-2">
                        <span className="text-indigo-400 flex-shrink-0 select-none">
                          {isOrdered ? "" : "•"}
                        </span>
                        <span>{children}</span>
                      </li>
                    );
                  },
                  code: ({ className, children, ...props }) => {
                    const isBlock =
                      className?.includes("language-") ||
                      (typeof children === "string" && children.includes("\n"));

                    if (
                      isBlock ||
                      props.node?.position?.start.line !==
                        props.node?.position?.end.line
                    ) {
                      const content = String(children).replace(/\n$/, "");
                      const lines = content.split("\n");

                      return (
                        <div className="my-6 rounded-lg overflow-hidden bg-gray-900 border border-gray-800">
                          <div className="p-4 overflow-x-auto">
                            {lines.map((line, i) => (
                              <div key={i} className="leading-relaxed">
                                <span
                                  className={`text-sm font-mono whitespace-pre ${
                                    line.includes("←") ||
                                    line.includes("Answer") ||
                                    line.includes("✓")
                                      ? "text-green-400 font-medium"
                                      : line.startsWith("Array:") ||
                                          line.startsWith("Prefix") ||
                                          line.startsWith("String:")
                                        ? "text-indigo-400"
                                        : line.startsWith("Step") ||
                                            line.startsWith("i=")
                                          ? "text-gray-300"
                                          : line.includes("Maximum") ||
                                              line.includes("Final") ||
                                              line.includes("Result")
                                            ? "text-yellow-400"
                                            : line.includes("|")
                                              ? "text-gray-400"
                                              : "text-gray-400"
                                  }`}
                                >
                                  {line || " "}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <code className="px-1.5 py-0.5 bg-gray-800 text-indigo-300 rounded text-[0.9em] font-mono">
                        {children}
                      </code>
                    );
                  },
                  pre: ({ children }) => <>{children}</>,
                  table: ({ children }) => (
                    <div className="my-8 overflow-x-auto rounded-xl border border-gray-800 bg-gray-900/50">
                      <table className="w-full border-collapse min-w-[500px]">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-b border-gray-700">
                      {children}
                    </thead>
                  ),
                  tbody: ({ children }) => (
                    <tbody className="divide-y divide-gray-800">
                      {children}
                    </tbody>
                  ),
                  tr: ({ children }) => (
                    <tr className="hover:bg-gray-800/30 transition-colors">
                      {children}
                    </tr>
                  ),
                  th: ({ children }) => (
                    <th className="px-5 py-4 text-left text-sm font-bold text-indigo-300 uppercase tracking-wider">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-5 py-4 text-gray-300 text-sm">
                      {children}
                    </td>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="my-6 pl-4 border-l-4 border-indigo-500 bg-indigo-500/10 py-3 pr-4 rounded-r-lg">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {section.content}
              </ReactMarkdown>
            </div>

            {/* Code Block */}
            {section.code && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-400">
                    Code
                  </span>
                  <LanguageToggle
                    currentLang={currentLang}
                    onChange={(lang) => setCurrentLang(lang as SupportedLanguage)}
                    languages={Object.keys(section.code).filter(
                      (k) => section.code?.[k as keyof typeof section.code]
                    )}
                    size="sm"
                  />
                </div>
                <CodeBlock
                  code={
                    section.code[currentLang as keyof typeof section.code] ||
                    section.code.java ||
                    section.code.javascript ||
                    ""
                  }
                  language={currentLang}
                  collapsible={true}
                  highlightable
                  contentType="tutorial_code"
                  contentId={`${pattern.id}:section-${idx}:${currentLang}`}
                />
              </div>
            )}

            {/* DP Visualizers - Interactive Components */}
            {pattern.category === "Dynamic Programming" &&
              section.title.includes("Decision Trees") && (
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-indigo-400">▶</span> Interactive
                    Decision Tree
                  </h4>
                  <DPTreeVisualizer />
                </div>
              )}

            {pattern.category === "Dynamic Programming" &&
              section.title.includes("Deriving Recurrence") && (
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-purple-400">▶</span> Interactive
                    Recurrence Builder
                  </h4>
                  <RecurrenceBuilderVisualizer />
                </div>
              )}

            {pattern.category === "Dynamic Programming" &&
              section.title.includes("Complete DP Transformation") && (
                <div className="mt-8 space-y-8">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <span className="text-green-400">▶</span> Interactive
                      Transformation
                    </h4>
                    <DPTransformationVisualizer />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <span className="text-pink-400">▶</span> Side-by-Side Race
                    </h4>
                    <DPComparisonVisualizer />
                  </div>
                </div>
              )}

            {pattern.category === "Dynamic Programming" &&
              section.title.includes("1D DP") && (
                <div className="mt-8 space-y-8">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <span className="text-green-400">▶</span> Interactive DP
                      Transformation
                    </h4>
                    <DPTransformationVisualizer />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <span className="text-pink-400">▶</span> Side-by-Side
                      Comparison
                    </h4>
                    <DPComparisonVisualizer />
                  </div>
                </div>
              )}

            {pattern.category === "Dynamic Programming" &&
              section.title.includes("Decision DP") && (
                <div className="mt-8 space-y-8">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <span className="text-green-400">▶</span> Interactive House
                      Robber
                    </h4>
                    <DPTransformationVisualizer />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <span className="text-pink-400">▶</span> Side-by-Side
                      Comparison
                    </h4>
                    <DPComparisonVisualizer />
                  </div>
                </div>
              )}

            {pattern.category === "Dynamic Programming" &&
              section.title.includes("2D DP") && (
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-blue-400">▶</span> Interactive 2D
                    Table
                  </h4>
                  <DPTableVisualizer />
                </div>
              )}

            {pattern.category === "Dynamic Programming" &&
              section.title.includes("Knapsack") && (
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-orange-400">▶</span> Interactive
                    Knapsack
                  </h4>
                  <KnapsackVisualizer />
                </div>
              )}

            {/* Greedy Visualizers */}
            {pattern.category === "Greedy" &&
              (section.title.includes("Activity") ||
                section.title.includes("Interval") ||
                section.title.includes("Scheduling")) && (
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-green-400">▶</span> Interactive
                    Activity Selection
                  </h4>
                  <ActivitySelectionVisualizer />
                </div>
              )}

            {pattern.category === "Greedy" &&
              (section.title.includes("Jump") ||
                section.title.includes("Reachability") ||
                section.title.includes("Array Traversal")) && (
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-blue-400">▶</span> Interactive Jump
                    Game
                  </h4>
                  <JumpGameVisualizer />
                </div>
              )}

            {/* Graph Visualizers */}
            {pattern.category === "Graphs" &&
              (section.title.includes("Grid") ||
                section.title.includes("Islands") ||
                section.title.includes("DFS vs BFS")) && (
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-cyan-400">▶</span> Interactive Grid
                    Traversal
                  </h4>
                  <GridBFSVisualizer />
                </div>
              )}

            {pattern.category === "Graphs" &&
              (section.title.includes("Topological") ||
                section.title.includes("Course")) && (
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-purple-400">▶</span> Interactive
                    Topological Sort
                  </h4>
                  <TopologicalSortVisualizer />
                </div>
              )}

            {pattern.category === "Graphs" &&
              (section.title.includes("Dijkstra") ||
                section.title.includes("Weighted")) && (
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-orange-400">▶</span> Interactive
                    Dijkstra
                  </h4>
                  <DijkstraVisualizer />
                </div>
              )}

            {/* Hash Map / Set Visualizers */}
            {pattern.category === "Hash Map / Set" &&
              (section.title.includes("Two Sum") ||
                section.title.includes("Complement")) && (
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-pink-400">▶</span> Interactive Two Sum
                  </h4>
                  <TwoSumVisualizer />
                </div>
              )}

            {pattern.category === "Hash Map / Set" &&
              (section.title.includes("Grouping") ||
                section.title.includes("Anagram")) && (
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-indigo-400">▶</span> Interactive
                    Anagram Grouping
                  </h4>
                  <AnagramGroupVisualizer />
                </div>
              )}

            {pattern.category === "Hash Map / Set" &&
              (section.title.includes("Consecutive") ||
                section.title.includes("Sequence")) && (
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-teal-400">▶</span> Interactive
                    Consecutive Sequence
                  </h4>
                  <ConsecutiveSequenceVisualizer />
                </div>
              )}

            {/* Heap / Priority Queue Visualizers */}
            {pattern.category === "Heap / Priority Queue" &&
              (section.title.includes("Kth") ||
                section.title.includes("K Largest") ||
                section.title.includes("Top K")) && (
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-amber-400">▶</span> Interactive Kth
                    Largest
                  </h4>
                  <KthLargestVisualizer />
                </div>
              )}

            {pattern.category === "Heap / Priority Queue" &&
              (section.title.includes("Two Heaps") ||
                section.title.includes("Median")) && (
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-rose-400">▶</span> Interactive Median
                    Finder
                  </h4>
                  <MedianFinderVisualizer />
                </div>
              )}

            {pattern.category === "Heap / Priority Queue" &&
              (section.title.includes("Merge K") ||
                section.title.includes("Merging")) && (
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-violet-400">▶</span> Interactive Merge
                    K Lists
                  </h4>
                  <MergeKListsVisualizer />
                </div>
              )}

            {/* Intervals Visualizers */}
            {pattern.category === "Intervals" &&
              section.title.includes("Merge") &&
              !section.title.includes("K") && (
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-emerald-400">▶</span> Interactive
                    Merge Intervals
                  </h4>
                  <MergeIntervalsVisualizer />
                </div>
              )}

            {pattern.category === "Intervals" &&
              (section.title.includes("Meeting") ||
                section.title.includes("Line Sweep")) && (
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-indigo-400">▶</span> Interactive
                    Meeting Rooms
                  </h4>
                  <MeetingRoomsVisualizer />
                </div>
              )}

            {pattern.category === "Intervals" &&
              section.title.includes("Intersection") && (
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-cyan-400">▶</span> Interactive
                    Interval Intersection
                  </h4>
                  <IntervalIntersectionVisualizer />
                </div>
              )}

            {/* Linked List Visualizers */}
            {pattern.category === "Linked List" &&
              (section.title.includes("Reversal") ||
                (section.title.includes("Reverse") &&
                  !section.title.includes("k-Group"))) && (
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-blue-400">▶</span> Interactive Linked
                    List Reversal
                  </h4>
                  <LinkedListReversalVisualizer />
                </div>
              )}

            {pattern.category === "Linked List" &&
              (section.title.includes("Fast/Slow") ||
                section.title.includes("Floyd") ||
                section.title.includes("Cycle")) && (
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-green-400">▶</span> Interactive Cycle
                    Detection
                  </h4>
                  <CycleDetectionVisualizer />
                </div>
              )}

            {pattern.category === "Linked List" &&
              (section.title.includes("Reorder") ||
                section.title.includes("Combining")) && (
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-purple-400">▶</span> Interactive
                    Reorder List
                  </h4>
                  <ReorderListVisualizer />
                </div>
              )}

            {/* Prefix Sum Visualizers */}
            {pattern.category === "Prefix Sum" &&
              (section.title.includes("Building") ||
                section.title.includes("Querying") ||
                section.title.includes("What is")) && (
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-orange-400">▶</span> Interactive
                    Prefix Sum
                  </h4>
                  <PrefixSumVisualizer />
                </div>
              )}

            {pattern.category === "Prefix Sum" &&
              (section.title.includes("Subarray Sum") ||
                section.title.includes("HashMap")) && (
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-pink-400">▶</span> Interactive
                    Subarray Sum K
                  </h4>
                  <SubarraySumKVisualizer />
                </div>
              )}

            {pattern.category === "Prefix Sum" &&
              (section.title.includes("Product") ||
                section.title.includes("Except Self")) && (
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-violet-400">▶</span> Interactive
                    Product Except Self
                  </h4>
                  <ProductExceptSelfVisualizer />
                </div>
              )}

            {/* Sliding Window Visualizers */}
            {pattern.category === "Sliding Window" &&
              (section.title.includes("Fixed") ||
                section.title.includes("Maximum Sum")) && (
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-blue-400">▶</span> Interactive Fixed
                    Window
                  </h4>
                  <FixedWindowVisualizer />
                </div>
              )}

            {pattern.category === "Sliding Window" &&
              (section.title.includes("Longest Substring") ||
                section.title.includes("Without Repeating")) && (
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-purple-400">▶</span> Interactive
                    Longest Substring
                  </h4>
                  <LongestSubstringVisualizer />
                </div>
              )}

            {pattern.category === "Sliding Window" &&
              (section.title.includes("Anagram") ||
                section.title.includes("Frequency Counter")) && (
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-pink-400">▶</span> Interactive Find
                    Anagrams
                  </h4>
                  <FindAnagramsVisualizer />
                </div>
              )}

            {/* Stack / Monotonic Stack Visualizers */}
            {pattern.category === "Stack / Monotonic Stack" &&
              section.title.includes("Interactive") &&
              section.title.includes("Valid Parentheses") && (
                <div className="mt-8">
                  <ValidParenthesesVisualizer />
                </div>
              )}

            {pattern.category === "Stack / Monotonic Stack" &&
              section.title.includes("Interactive") &&
              section.title.includes("Next Greater") && (
                <div className="mt-8">
                  <NextGreaterVisualizer />
                </div>
              )}

            {pattern.category === "Stack / Monotonic Stack" &&
              section.title.includes("Interactive") &&
              section.title.includes("Largest Rectangle") && (
                <div className="mt-8">
                  <LargestRectangleVisualizer />
                </div>
              )}

            {/* Trees Visualizers */}
            {pattern.category === "Trees" &&
              section.title.includes("Interactive") &&
              section.title.includes("DFS") && (
                <div className="mt-8">
                  <TreeTraversalVisualizer />
                </div>
              )}

            {pattern.category === "Trees" &&
              section.title.includes("Interactive") &&
              section.title.includes("Level Order") && (
                <div className="mt-8">
                  <LevelOrderVisualizer />
                </div>
              )}

            {pattern.category === "Trees" &&
              section.title.includes("Interactive") &&
              section.title.includes("BST") && (
                <div className="mt-8">
                  <BSTValidationVisualizer />
                </div>
              )}

            {/* Trie Visualizers */}
            {pattern.category === "Trie" &&
              section.title.includes("Interactive") &&
              section.title.includes("Insert") && (
                <div className="mt-8">
                  <TrieInsertVisualizer />
                </div>
              )}

            {pattern.category === "Trie" &&
              section.title.includes("Interactive") &&
              section.title.includes("Search") && (
                <div className="mt-8">
                  <TrieSearchVisualizer />
                </div>
              )}

            {/* Two Pointers Visualizers */}
            {pattern.category === "Two Pointers" &&
              section.title.includes("Interactive") &&
              section.title.includes("Two Sum") && (
                <div className="mt-8">
                  <TwoSumSortedVisualizer />
                </div>
              )}

            {pattern.category === "Two Pointers" &&
              section.title.includes("Interactive") &&
              section.title.includes("Container") && (
                <div className="mt-8">
                  <ContainerWaterVisualizer />
                </div>
              )}

            {pattern.category === "Two Pointers" &&
              section.title.includes("Interactive") &&
              section.title.includes("Remove Duplicates") && (
                <div className="mt-8">
                  <RemoveDuplicatesVisualizer />
                </div>
              )}

            {/* Union-Find Visualizers */}
            {pattern.category === "Union-Find" &&
              section.title.includes("Interactive") &&
              section.title.includes("Union-Find") && (
                <div className="mt-8">
                  <UnionFindVisualizer />
                </div>
              )}

            {pattern.category === "Union-Find" &&
              section.title.includes("Interactive") &&
              section.title.includes("Connected Components") && (
                <div className="mt-8">
                  <ConnectedComponentsVisualizer />
                </div>
              )}

            {/* Arrays & Strings Visualizers */}
            {pattern.category === "Arrays & Strings" &&
              section.title.includes("Interactive") &&
              section.title.includes("Two Sum") && (
                <div className="mt-8">
                  <TwoSumHashMapVisualizer />
                </div>
              )}

            {pattern.category === "Arrays & Strings" &&
              section.title.includes("Interactive") &&
              section.title.includes("Kadane") && (
                <div className="mt-8">
                  <KadaneVisualizer />
                </div>
              )}

            {pattern.category === "Arrays & Strings" &&
              section.title.includes("Interactive") &&
              section.title.includes("Prefix Sum") && (
                <div className="mt-8">
                  <PrefixSumArrayVisualizer />
                </div>
              )}

            {/* Backtracking Visualizers */}
            {pattern.category === "Backtracking" &&
              section.title.includes("Interactive") &&
              section.title.includes("Subsets") && (
                <div className="mt-8">
                  <SubsetsVisualizer />
                </div>
              )}

            {pattern.category === "Backtracking" &&
              section.title.includes("Interactive") &&
              section.title.includes("Permutations") && (
                <div className="mt-8">
                  <PermutationsVisualizer />
                </div>
              )}

            {pattern.category === "Backtracking" &&
              section.title.includes("Interactive") &&
              section.title.includes("N-Queens") && (
                <div className="mt-8">
                  <NQueensVisualizer />
                </div>
              )}

            {/* Binary Search Visualizers */}
            {pattern.category === "Binary Search" &&
              section.title.includes("Interactive") &&
              section.title.includes("Binary Search Visualizer") && (
                <div className="mt-8">
                  <BinarySearchVisualizer />
                </div>
              )}

            {pattern.category === "Binary Search" &&
              section.title.includes("Interactive") &&
              section.title.includes("Rotated Array") && (
                <div className="mt-8">
                  <RotatedArrayVisualizer />
                </div>
              )}

            {pattern.category === "Binary Search" &&
              section.title.includes("Interactive") &&
              section.title.includes("Binary Search on Answer") && (
                <div className="mt-8">
                  <KokoEatingVisualizer />
                </div>
              )}
          </div>
        </article>
      ))}

      <QuizCard patternId={pattern.id} questionCount={15} />
    </div>
  );
}
