"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Pattern, SupportedLanguage, TutorialSection as TutorialSectionType, DPApproach } from "@/types";
import LanguageToggle from "@/components/ui/LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";

const APPROACH_LABELS: Record<DPApproach, string> = {
  recursion: "Recursion",
  memoization: "Memoization",
  tabulation: "Tabulation",
  spaceOptimized: "Space Optimized",
};

const VisualizerLoading = () => (
  <div className="h-64 rounded-md animate-pulse" style={{ background: "var(--bg-elevated)" }} />
);

const CodeBlock = dynamic(() => import("@/components/ui/CodeBlock"), {
  loading: VisualizerLoading,
  ssr: false,
});

const DPTreeVisualizer = dynamic(() => import("@/components/visualizers/DPTreeVisualizer"), { loading: VisualizerLoading, ssr: false });
const DPTransformationVisualizer = dynamic(() => import("@/components/visualizers/DPTransformationVisualizer"), { loading: VisualizerLoading, ssr: false });
const DPTableVisualizer = dynamic(() => import("@/components/visualizers/DPTableVisualizer"), { loading: VisualizerLoading, ssr: false });
const DPJourneyVisualizer = dynamic(() => import("@/components/visualizers/DPJourneyVisualizer"), { loading: VisualizerLoading, ssr: false });
const DPComparisonVisualizer = dynamic(() => import("@/components/visualizers/DPComparisonVisualizer"), { loading: VisualizerLoading, ssr: false });
const RecurrenceBuilderVisualizer = dynamic(() => import("@/components/visualizers/RecurrenceBuilderVisualizer"), { loading: VisualizerLoading, ssr: false });
const ActivitySelectionVisualizer = dynamic(() => import("@/components/visualizers/ActivitySelectionVisualizer"), { loading: VisualizerLoading, ssr: false });
const JumpGameVisualizer = dynamic(() => import("@/components/visualizers/JumpGameVisualizer"), { loading: VisualizerLoading, ssr: false });
const GridBFSVisualizer = dynamic(() => import("@/components/visualizers/GridBFSVisualizer"), { loading: VisualizerLoading, ssr: false });
const TopologicalSortVisualizer = dynamic(() => import("@/components/visualizers/TopologicalSortVisualizer"), { loading: VisualizerLoading, ssr: false });
const DijkstraVisualizer = dynamic(() => import("@/components/visualizers/DijkstraVisualizer"), { loading: VisualizerLoading, ssr: false });
const TwoSumVisualizer = dynamic(() => import("@/components/visualizers/TwoSumVisualizer"), { loading: VisualizerLoading, ssr: false });
const AnagramGroupVisualizer = dynamic(() => import("@/components/visualizers/AnagramGroupVisualizer"), { loading: VisualizerLoading, ssr: false });
const ConsecutiveSequenceVisualizer = dynamic(() => import("@/components/visualizers/ConsecutiveSequenceVisualizer"), { loading: VisualizerLoading, ssr: false });
const KthLargestVisualizer = dynamic(() => import("@/components/visualizers/KthLargestVisualizer"), { loading: VisualizerLoading, ssr: false });
const MedianFinderVisualizer = dynamic(() => import("@/components/visualizers/MedianFinderVisualizer"), { loading: VisualizerLoading, ssr: false });
const MergeKListsVisualizer = dynamic(() => import("@/components/visualizers/MergeKListsVisualizer"), { loading: VisualizerLoading, ssr: false });
const MergeIntervalsVisualizer = dynamic(() => import("@/components/visualizers/MergeIntervalsVisualizer"), { loading: VisualizerLoading, ssr: false });
const MeetingRoomsVisualizer = dynamic(() => import("@/components/visualizers/MeetingRoomsVisualizer"), { loading: VisualizerLoading, ssr: false });
const IntervalIntersectionVisualizer = dynamic(() => import("@/components/visualizers/IntervalIntersectionVisualizer"), { loading: VisualizerLoading, ssr: false });
const LinkedListReversalVisualizer = dynamic(() => import("@/components/visualizers/LinkedListReversalVisualizer"), { loading: VisualizerLoading, ssr: false });
const CycleDetectionVisualizer = dynamic(() => import("@/components/visualizers/CycleDetectionVisualizer"), { loading: VisualizerLoading, ssr: false });
const ReorderListVisualizer = dynamic(() => import("@/components/visualizers/ReorderListVisualizer"), { loading: VisualizerLoading, ssr: false });
const PrefixSumVisualizer = dynamic(() => import("@/components/visualizers/PrefixSumVisualizer"), { loading: VisualizerLoading, ssr: false });
const SubarraySumKVisualizer = dynamic(() => import("@/components/visualizers/SubarraySumKVisualizer"), { loading: VisualizerLoading, ssr: false });
const ProductExceptSelfVisualizer = dynamic(() => import("@/components/visualizers/ProductExceptSelfVisualizer"), { loading: VisualizerLoading, ssr: false });
const FixedWindowVisualizer = dynamic(() => import("@/components/visualizers/FixedWindowVisualizer"), { loading: VisualizerLoading, ssr: false });
const LongestSubstringVisualizer = dynamic(() => import("@/components/visualizers/LongestSubstringVisualizer"), { loading: VisualizerLoading, ssr: false });
const FindAnagramsVisualizer = dynamic(() => import("@/components/visualizers/FindAnagramsVisualizer"), { loading: VisualizerLoading, ssr: false });
const ValidParenthesesVisualizer = dynamic(() => import("@/components/visualizers/ValidParenthesesVisualizer"), { loading: VisualizerLoading, ssr: false });
const NextGreaterVisualizer = dynamic(() => import("@/components/visualizers/NextGreaterVisualizer"), { loading: VisualizerLoading, ssr: false });
const LargestRectangleVisualizer = dynamic(() => import("@/components/visualizers/LargestRectangleVisualizer"), { loading: VisualizerLoading, ssr: false });
const TreeTraversalVisualizer = dynamic(() => import("@/components/visualizers/TreeTraversalVisualizer"), { loading: VisualizerLoading, ssr: false });
const LevelOrderVisualizer = dynamic(() => import("@/components/visualizers/LevelOrderVisualizer"), { loading: VisualizerLoading, ssr: false });
const BSTValidationVisualizer = dynamic(() => import("@/components/visualizers/BSTValidationVisualizer"), { loading: VisualizerLoading, ssr: false });
const TrieInsertVisualizer = dynamic(() => import("@/components/visualizers/TrieInsertVisualizer"), { loading: VisualizerLoading, ssr: false });
const TrieSearchVisualizer = dynamic(() => import("@/components/visualizers/TrieSearchVisualizer"), { loading: VisualizerLoading, ssr: false });
const TwoSumSortedVisualizer = dynamic(() => import("@/components/visualizers/TwoSumSortedVisualizer"), { loading: VisualizerLoading, ssr: false });
const ContainerWaterVisualizer = dynamic(() => import("@/components/visualizers/ContainerWaterVisualizer"), { loading: VisualizerLoading, ssr: false });
const RemoveDuplicatesVisualizer = dynamic(() => import("@/components/visualizers/RemoveDuplicatesVisualizer"), { loading: VisualizerLoading, ssr: false });
const UnionFindVisualizer = dynamic(() => import("@/components/visualizers/UnionFindVisualizer"), { loading: VisualizerLoading, ssr: false });
const ConnectedComponentsVisualizer = dynamic(() => import("@/components/visualizers/ConnectedComponentsVisualizer"), { loading: VisualizerLoading, ssr: false });
const TwoSumHashMapVisualizer = dynamic(() => import("@/components/visualizers/TwoSumHashMapVisualizer"), { loading: VisualizerLoading, ssr: false });
const KadaneVisualizer = dynamic(() => import("@/components/visualizers/KadaneVisualizer"), { loading: VisualizerLoading, ssr: false });
const PrefixSumArrayVisualizer = dynamic(() => import("@/components/visualizers/PrefixSumArrayVisualizer"), { loading: VisualizerLoading, ssr: false });
const SubsetsVisualizer = dynamic(() => import("@/components/visualizers/SubsetsVisualizer"), { loading: VisualizerLoading, ssr: false });
const PermutationsVisualizer = dynamic(() => import("@/components/visualizers/PermutationsVisualizer"), { loading: VisualizerLoading, ssr: false });
const NQueensVisualizer = dynamic(() => import("@/components/visualizers/NQueensVisualizer"), { loading: VisualizerLoading, ssr: false });
const BinarySearchVisualizer = dynamic(() => import("@/components/visualizers/BinarySearchVisualizer"), { loading: VisualizerLoading, ssr: false });
const RotatedArrayVisualizer = dynamic(() => import("@/components/visualizers/RotatedArrayVisualizer"), { loading: VisualizerLoading, ssr: false });
const KokoEatingVisualizer = dynamic(() => import("@/components/visualizers/KokoEatingVisualizer"), { loading: VisualizerLoading, ssr: false });
const ClimbingStairsVisualizer = dynamic(() => import("@/components/visualizers/ClimbingStairsVisualizer"), { loading: VisualizerLoading, ssr: false });
const HouseRobberVisualizer = dynamic(() => import("@/components/visualizers/HouseRobberVisualizer"), { loading: VisualizerLoading, ssr: false });
const KnapsackDPVisualizer = dynamic(() => import("@/components/visualizers/KnapsackDPVisualizer"), { loading: VisualizerLoading, ssr: false });
const CoinChangeVisualizer = dynamic(() => import("@/components/visualizers/CoinChangeVisualizer"), { loading: VisualizerLoading, ssr: false });
const LCSVisualizer = dynamic(() => import("@/components/visualizers/LCSVisualizer"), { loading: VisualizerLoading, ssr: false });
const LISVisualizer = dynamic(() => import("@/components/visualizers/LISVisualizer"), { loading: VisualizerLoading, ssr: false });
const GridDPVisualizer = dynamic(() => import("@/components/visualizers/GridDPVisualizer"), { loading: VisualizerLoading, ssr: false });
const IntervalDPVisualizer = dynamic(() => import("@/components/visualizers/IntervalDPVisualizer"), { loading: VisualizerLoading, ssr: false });
const PalindromeDPVisualizer = dynamic(() => import("@/components/visualizers/PalindromeDPVisualizer"), { loading: VisualizerLoading, ssr: false });
const TreeDPVisualizer = dynamic(() => import("@/components/visualizers/TreeDPVisualizer"), { loading: VisualizerLoading, ssr: false });
const BitmaskDPVisualizer = dynamic(() => import("@/components/visualizers/BitmaskDPVisualizer"), { loading: VisualizerLoading, ssr: false });
const MultiStateDPVisualizer = dynamic(() => import("@/components/visualizers/MultiStateDPVisualizer"), { loading: VisualizerLoading, ssr: false });

interface TutorialSectionProps {
  pattern: Pattern;
  section: TutorialSectionType;
  sectionIndex: number;
}

const renderVisualizers = (pattern: Pattern, section: TutorialSectionType) => {
  const cat = pattern.category;
  const title = section.title;

  return (
    <>
      {/* DP Visualizers */}
      {cat === "Dynamic Programming" && title.includes("How DP is Discovered") && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-indigo-400">▶</span> Interactive DP Journey
          </h4>
          <DPJourneyVisualizer />
        </div>
      )}

      {cat === "Dynamic Programming" && title.includes("Decision Trees") && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-indigo-400">▶</span> Interactive Decision Tree
          </h4>
          <DPTreeVisualizer />
        </div>
      )}

      {cat === "Dynamic Programming" && title.includes("Deriving Recurrence") && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-purple-400">▶</span> Interactive Recurrence Builder
          </h4>
          <RecurrenceBuilderVisualizer />
        </div>
      )}

      {cat === "Dynamic Programming" && title.includes("Complete DP Transformation") && (
        <div className="mt-8 space-y-8">
          <div>
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="text-green-400">▶</span> Interactive Transformation
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

      {cat === "Dynamic Programming" && title.includes("1D DP") && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-green-400">▶</span> Interactive Climbing Stairs
          </h4>
          <ClimbingStairsVisualizer />
        </div>
      )}

      {cat === "Dynamic Programming" && title.includes("Decision DP") && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-green-400">▶</span> Interactive House Robber
          </h4>
          <HouseRobberVisualizer />
        </div>
      )}

      {cat === "Dynamic Programming" && title.includes("2D DP") && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-blue-400">▶</span> Interactive 2D Table
          </h4>
          <DPTableVisualizer />
        </div>
      )}

      {cat === "Dynamic Programming" && title.includes("0/1 Knapsack") && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-orange-400">▶</span> Interactive 0/1 Knapsack
          </h4>
          <KnapsackDPVisualizer />
        </div>
      )}

      {cat === "Dynamic Programming" && title.includes("Unbounded Knapsack") && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-yellow-400">▶</span> Interactive Coin Change
          </h4>
          <CoinChangeVisualizer />
        </div>
      )}

      {cat === "Dynamic Programming" && title.includes("LCS") && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-cyan-400">▶</span> Interactive LCS
          </h4>
          <LCSVisualizer />
        </div>
      )}

      {cat === "Dynamic Programming" && title.includes("LIS") && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-emerald-400">▶</span> Interactive LIS
          </h4>
          <LISVisualizer />
        </div>
      )}

      {cat === "Dynamic Programming" && title.includes("Grid DP") && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-violet-400">▶</span> Interactive Grid DP
          </h4>
          <GridDPVisualizer />
        </div>
      )}

      {cat === "Dynamic Programming" && title.includes("Interval DP") && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-rose-400">▶</span> Interactive Interval DP
          </h4>
          <IntervalDPVisualizer />
        </div>
      )}

      {cat === "Dynamic Programming" && title.includes("Palindrome DP") && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-purple-400">▶</span> Interactive Palindrome DP
          </h4>
          <PalindromeDPVisualizer />
        </div>
      )}

      {cat === "Dynamic Programming" && title.includes("Multi-State DP") && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-pink-400">▶</span> Interactive Multi-State DP
          </h4>
          <MultiStateDPVisualizer />
        </div>
      )}

      {cat === "Dynamic Programming" && title.includes("Tree DP") && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-teal-400">▶</span> Interactive Tree DP
          </h4>
          <TreeDPVisualizer />
        </div>
      )}

      {cat === "Dynamic Programming" && title.includes("Bitmask DP") && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-amber-400">▶</span> Interactive Bitmask DP
          </h4>
          <BitmaskDPVisualizer />
        </div>
      )}

      {/* Greedy Visualizers */}
      {cat === "Greedy" && (title.includes("Activity") || title.includes("Interval") || title.includes("Scheduling")) && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-green-400">▶</span> Interactive Activity Selection
          </h4>
          <ActivitySelectionVisualizer />
        </div>
      )}

      {cat === "Greedy" && (title.includes("Jump") || title.includes("Reachability") || title.includes("Array Traversal")) && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-blue-400">▶</span> Interactive Jump Game
          </h4>
          <JumpGameVisualizer />
        </div>
      )}

      {/* Graph Visualizers */}
      {cat === "Graphs" && (title.includes("Grid") || title.includes("Islands") || title.includes("DFS vs BFS")) && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-cyan-400">▶</span> Interactive Grid Traversal
          </h4>
          <GridBFSVisualizer />
        </div>
      )}

      {cat === "Graphs" && (title.includes("Topological") || title.includes("Course")) && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-purple-400">▶</span> Interactive Topological Sort
          </h4>
          <TopologicalSortVisualizer />
        </div>
      )}

      {cat === "Graphs" && (title.includes("Dijkstra") || title.includes("Weighted")) && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-orange-400">▶</span> Interactive Dijkstra
          </h4>
          <DijkstraVisualizer />
        </div>
      )}

      {/* Hash Map / Set Visualizers */}
      {cat === "Hash Map / Set" && (title.includes("Two Sum") || title.includes("Complement")) && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-pink-400">▶</span> Interactive Two Sum
          </h4>
          <TwoSumVisualizer />
        </div>
      )}

      {cat === "Hash Map / Set" && (title.includes("Grouping") || title.includes("Anagram")) && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-indigo-400">▶</span> Interactive Anagram Grouping
          </h4>
          <AnagramGroupVisualizer />
        </div>
      )}

      {cat === "Hash Map / Set" && (title.includes("Consecutive") || title.includes("Sequence")) && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-teal-400">▶</span> Interactive Consecutive Sequence
          </h4>
          <ConsecutiveSequenceVisualizer />
        </div>
      )}

      {/* Heap / Priority Queue Visualizers */}
      {cat === "Heap / Priority Queue" && (title.includes("Kth") || title.includes("K Largest") || title.includes("Top K")) && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-amber-400">▶</span> Interactive Kth Largest
          </h4>
          <KthLargestVisualizer />
        </div>
      )}

      {cat === "Heap / Priority Queue" && (title.includes("Two Heaps") || title.includes("Median")) && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-rose-400">▶</span> Interactive Median Finder
          </h4>
          <MedianFinderVisualizer />
        </div>
      )}

      {cat === "Heap / Priority Queue" && (title.includes("Merge K") || title.includes("Merging")) && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-violet-400">▶</span> Interactive Merge K Lists
          </h4>
          <MergeKListsVisualizer />
        </div>
      )}

      {/* Intervals Visualizers */}
      {cat === "Intervals" && title.includes("Merge") && !title.includes("K") && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-emerald-400">▶</span> Interactive Merge Intervals
          </h4>
          <MergeIntervalsVisualizer />
        </div>
      )}

      {cat === "Intervals" && (title.includes("Meeting") || title.includes("Line Sweep")) && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-indigo-400">▶</span> Interactive Meeting Rooms
          </h4>
          <MeetingRoomsVisualizer />
        </div>
      )}

      {cat === "Intervals" && title.includes("Intersection") && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-cyan-400">▶</span> Interactive Interval Intersection
          </h4>
          <IntervalIntersectionVisualizer />
        </div>
      )}

      {/* Linked List Visualizers */}
      {cat === "Linked List" && (title.includes("Reversal") || (title.includes("Reverse") && !title.includes("k-Group"))) && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-blue-400">▶</span> Interactive Linked List Reversal
          </h4>
          <LinkedListReversalVisualizer />
        </div>
      )}

      {cat === "Linked List" && (title.includes("Fast/Slow") || title.includes("Floyd") || title.includes("Cycle")) && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-green-400">▶</span> Interactive Cycle Detection
          </h4>
          <CycleDetectionVisualizer />
        </div>
      )}

      {cat === "Linked List" && (title.includes("Reorder") || title.includes("Combining")) && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-purple-400">▶</span> Interactive Reorder List
          </h4>
          <ReorderListVisualizer />
        </div>
      )}

      {/* Prefix Sum Visualizers */}
      {cat === "Prefix Sum" && (title.includes("Building") || title.includes("Querying") || title.includes("What is")) && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-orange-400">▶</span> Interactive Prefix Sum
          </h4>
          <PrefixSumVisualizer />
        </div>
      )}

      {cat === "Prefix Sum" && (title.includes("Subarray Sum") || title.includes("HashMap")) && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-pink-400">▶</span> Interactive Subarray Sum K
          </h4>
          <SubarraySumKVisualizer />
        </div>
      )}

      {cat === "Prefix Sum" && (title.includes("Product") || title.includes("Except Self")) && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-violet-400">▶</span> Interactive Product Except Self
          </h4>
          <ProductExceptSelfVisualizer />
        </div>
      )}

      {/* Sliding Window Visualizers */}
      {cat === "Sliding Window" && (title.includes("Fixed") || title.includes("Maximum Sum")) && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-blue-400">▶</span> Interactive Fixed Window
          </h4>
          <FixedWindowVisualizer />
        </div>
      )}

      {cat === "Sliding Window" && (title.includes("Longest Substring") || title.includes("Without Repeating")) && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-purple-400">▶</span> Interactive Longest Substring
          </h4>
          <LongestSubstringVisualizer />
        </div>
      )}

      {cat === "Sliding Window" && (title.includes("Anagram") || title.includes("Frequency Counter")) && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-pink-400">▶</span> Interactive Find Anagrams
          </h4>
          <FindAnagramsVisualizer />
        </div>
      )}

      {/* Stack / Monotonic Stack Visualizers */}
      {cat === "Stack / Monotonic Stack" && title.includes("Interactive") && title.includes("Valid Parentheses") && (
        <div className="mt-8">
          <ValidParenthesesVisualizer />
        </div>
      )}

      {cat === "Stack / Monotonic Stack" && title.includes("Interactive") && title.includes("Next Greater") && (
        <div className="mt-8">
          <NextGreaterVisualizer />
        </div>
      )}

      {cat === "Stack / Monotonic Stack" && title.includes("Interactive") && title.includes("Largest Rectangle") && (
        <div className="mt-8">
          <LargestRectangleVisualizer />
        </div>
      )}

      {/* Trees Visualizers */}
      {cat === "Trees" && title.includes("Interactive") && title.includes("DFS") && (
        <div className="mt-8">
          <TreeTraversalVisualizer />
        </div>
      )}

      {cat === "Trees" && title.includes("Interactive") && title.includes("Level Order") && (
        <div className="mt-8">
          <LevelOrderVisualizer />
        </div>
      )}

      {cat === "Trees" && title.includes("Interactive") && title.includes("BST") && (
        <div className="mt-8">
          <BSTValidationVisualizer />
        </div>
      )}

      {/* Trie Visualizers */}
      {cat === "Trie" && title.includes("Interactive") && title.includes("Insert") && (
        <div className="mt-8">
          <TrieInsertVisualizer />
        </div>
      )}

      {cat === "Trie" && title.includes("Interactive") && title.includes("Search") && (
        <div className="mt-8">
          <TrieSearchVisualizer />
        </div>
      )}

      {/* Two Pointers Visualizers */}
      {cat === "Two Pointers" && title.includes("Interactive") && title.includes("Two Sum") && (
        <div className="mt-8">
          <TwoSumSortedVisualizer />
        </div>
      )}

      {cat === "Two Pointers" && title.includes("Interactive") && title.includes("Container") && (
        <div className="mt-8">
          <ContainerWaterVisualizer />
        </div>
      )}

      {cat === "Two Pointers" && title.includes("Interactive") && title.includes("Remove Duplicates") && (
        <div className="mt-8">
          <RemoveDuplicatesVisualizer />
        </div>
      )}

      {/* Union-Find Visualizers */}
      {cat === "Union-Find" && title.includes("Interactive") && title.includes("Union-Find") && (
        <div className="mt-8">
          <UnionFindVisualizer />
        </div>
      )}

      {cat === "Union-Find" && title.includes("Interactive") && title.includes("Connected Components") && (
        <div className="mt-8">
          <ConnectedComponentsVisualizer />
        </div>
      )}

      {/* Arrays & Strings Visualizers */}
      {cat === "Arrays & Strings" && title.includes("Interactive") && title.includes("Two Sum") && (
        <div className="mt-8">
          <TwoSumHashMapVisualizer />
        </div>
      )}

      {cat === "Arrays & Strings" && title.includes("Interactive") && title.includes("Kadane") && (
        <div className="mt-8">
          <KadaneVisualizer />
        </div>
      )}

      {cat === "Arrays & Strings" && title.includes("Interactive") && title.includes("Prefix Sum") && (
        <div className="mt-8">
          <PrefixSumArrayVisualizer />
        </div>
      )}

      {/* Backtracking Visualizers */}
      {cat === "Backtracking" && title.includes("Interactive") && title.includes("Subsets") && (
        <div className="mt-8">
          <SubsetsVisualizer />
        </div>
      )}

      {cat === "Backtracking" && title.includes("Interactive") && title.includes("Permutations") && (
        <div className="mt-8">
          <PermutationsVisualizer />
        </div>
      )}

      {cat === "Backtracking" && title.includes("Interactive") && title.includes("N-Queens") && (
        <div className="mt-8">
          <NQueensVisualizer />
        </div>
      )}

      {/* Binary Search Visualizers */}
      {cat === "Binary Search" && title.includes("Interactive") && title.includes("Binary Search Visualizer") && (
        <div className="mt-8">
          <BinarySearchVisualizer />
        </div>
      )}

      {cat === "Binary Search" && title.includes("Interactive") && title.includes("Rotated Array") && (
        <div className="mt-8">
          <RotatedArrayVisualizer />
        </div>
      )}

      {cat === "Binary Search" && title.includes("Interactive") && title.includes("Binary Search on Answer") && (
        <div className="mt-8">
          <KokoEatingVisualizer />
        </div>
      )}
    </>
  );
};

const TutorialSection: React.FC<TutorialSectionProps> = ({
  pattern,
  section,
  sectionIndex,
}) => {
  const { language: currentLang, setLanguage: setCurrentLang } = useLanguage();

  // Get available approaches from section (for code examples)
  const availableApproaches = section.approaches
    ? (Object.keys(section.approaches) as DPApproach[]).filter(
        (key) => section.approaches?.[key]?.java || section.approaches?.[key]?.javascript
      )
    : [];

  // Get available templates (for pseudocode/templates)
  const availableTemplates = section.templates
    ? (Object.keys(section.templates) as DPApproach[]).filter(
        (key) => section.templates?.[key]
      )
    : [];

  const [selectedApproach, setSelectedApproach] = useState<DPApproach>(
    availableApproaches[0] || availableTemplates[0] || "recursion"
  );

  const [selectedTemplate, setSelectedTemplate] = useState<DPApproach>(
    availableTemplates[0] || "recursion"
  );

  return (
    <article className="scroll-mt-24" id={`section-${sectionIndex}`}>
      {/* Section Header */}
      <div className="flex items-baseline gap-3 mb-6">
        <span className="text-indigo-400 font-mono text-lg">
          {sectionIndex + 1}.
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
                const content = String(children).replace(/\n$/, "");
                const languageMatch = className?.match(/language-(\w+)/);
                const language = languageMatch ? languageMatch[1] : null;

                const isBlock =
                  className?.includes("language-") ||
                  (typeof children === "string" && children.includes("\n")) ||
                  props.node?.position?.start.line !== props.node?.position?.end.line;

                if (isBlock) {
                  // Detect language from content
                  const detectLanguage = (code: string): { lang: string; label?: string } | null => {
                    // Java-specific patterns (type declarations, generics, etc.)
                    if (code.match(/\b(int|boolean|void|public|private|String|Integer|Map<|List<|new \w+\()\b/) ||
                        code.match(/for\s*\(\s*int\s/)) {
                      return { lang: "java" };
                    }
                    // Python-specific patterns (must have actual Python syntax, not just colons)
                    if (code.match(/\bdef\s+\w+\s*\(/) || code.includes("elif ") ||
                        code.match(/^\s*(import|from)\s+\w+/m) || code.includes("self.")) {
                      return { lang: "python" };
                    }
                    // Generic code-like content (pseudocode/template)
                    if (code.includes("//") || code.match(/\breturn\b/) || code.includes("if (") ||
                        code.includes("function") || code.includes("for (") || code.includes("while (") ||
                        code.includes("=>") || code.includes("const ") || code.includes("let ") ||
                        code.match(/\bf\(\w+\)\s*=/) || code.match(/memo\[/)) {
                      return { lang: "javascript", label: "Template" };
                    }
                    return null;
                  };

                  // Programming languages that should show with their name
                  const knownLanguages = ["java", "javascript", "js", "python", "py", "cpp", "c", "go", "typescript", "ts"];
                  const hasKnownLanguage = language && knownLanguages.includes(language.toLowerCase());

                  if (hasKnownLanguage) {
                    // Explicit language specified - use CodeBlock with that language
                    return (
                      <div className="my-6">
                        <CodeBlock
                          code={content}
                          language={language}
                          showCopy
                        />
                      </div>
                    );
                  }

                  const detected = detectLanguage(content);
                  if (detected) {
                    return (
                      <div className="my-6">
                        <CodeBlock
                              code={content}
                              language={detected.lang}
                              label={detected.label}
                              showCopy
                            />
                      </div>
                    );
                  }

                  // For plain text blocks (examples, output), use simple styling
                  const lines = content.split("\n");
                  return (
                    <div className="my-6 rounded-md overflow-hidden bg-gray-900/80 border border-gray-800">
                      <div className="p-4 overflow-x-auto">
                        {lines.map((line, lineIndex) => (
                              <div key={`line-${line.slice(0, 20)}-${lineIndex}`} className="leading-relaxed">
                            <span className="text-sm font-mono whitespace-pre text-gray-300">
                              {line || " "}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                // Inline code
                return (
                  <code className="px-1.5 py-0.5 bg-gray-800/80 text-indigo-300 rounded text-[0.9em] font-mono border border-gray-700/50">
                    {children}
                  </code>
                );
              },
              pre: ({ children }) => children,
              table: ({ children }) => (
                <div className="my-8 overflow-x-auto rounded-md border border-gray-800 bg-gray-900/50">
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
                <blockquote className="my-6 pl-4 border-l-4 border-indigo-500 bg-indigo-500/10 py-3 pr-4 rounded-r-md">
                  {children}
                </blockquote>
              ),
            }}
          >
            {section.content}
          </ReactMarkdown>
        </div>

        {/* Templates - Pseudocode with approach tabs */}
        {section.templates && availableTemplates.length > 0 && (
          <div className="mt-8">
            <h4 className="text-base font-semibold text-gray-300 mb-3">Template</h4>
            {/* Template Approach Tabs */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {availableTemplates.map((approach) => (
                <button
                  key={approach}
                  onClick={() => setSelectedTemplate(approach)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all ${
                    selectedTemplate === approach
                      ? "bg-indigo-600 text-white"
                      : "text-gray-400 hover:text-gray-300 hover:bg-gray-800 border border-gray-700"
                  }`}
                >
                  {APPROACH_LABELS[approach]}
                </button>
              ))}
            </div>
            <CodeBlock
              code={section.templates[selectedTemplate] || ""}
              language="javascript"
              label="Template"
              showCopy
            />
          </div>
        )}

        {/* Code Block - Approaches (for DP patterns) */}
        {section.approaches && availableApproaches.length > 0 && (
          <div className="mt-8">
            <h4 className="text-base font-semibold text-gray-300 mb-3">Example: {section.exampleName || "Code"}</h4>
            {/* Approach Tabs */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {availableApproaches.map((approach) => (
                <button
                  key={approach}
                  onClick={() => setSelectedApproach(approach)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all ${
                    selectedApproach === approach
                      ? "bg-indigo-600 text-white"
                      : "text-gray-400 hover:text-gray-300 hover:bg-gray-800 border border-gray-700"
                  }`}
                >
                  {APPROACH_LABELS[approach]}
                </button>
              ))}
              <div className="flex-1" />
              <LanguageToggle
                currentLang={currentLang}
                onChange={(lang) => setCurrentLang(lang as SupportedLanguage)}
                languages={
                  Object.keys(section.approaches[selectedApproach] || {}).filter(
                    (k) => section.approaches?.[selectedApproach]?.[k as "java" | "javascript"]
                  )
                }
                size="sm"
              />
            </div>
            <CodeBlock
              code={
                section.approaches[selectedApproach]?.[currentLang as "java" | "javascript"] ||
                section.approaches[selectedApproach]?.java ||
                section.approaches[selectedApproach]?.javascript ||
                ""
              }
              language={currentLang}
              collapsible
              highlightable
              contentType="tutorial_code"
              contentId={`${pattern.id}:section-${sectionIndex}:${selectedApproach}:${currentLang}`}
            />
          </div>
        )}

        {/* Code Block - Simple (for non-DP patterns) */}
        {section.code && !section.approaches && (
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
              collapsible
              highlightable
              contentType="tutorial_code"
              contentId={`${pattern.id}:section-${sectionIndex}:${currentLang}`}
            />
          </div>
        )}

        {/* Visualizers - Render based on pattern category and section title */}
        {renderVisualizers(pattern, section)}
      </div>
    </article>
  );
};

export default TutorialSection;
