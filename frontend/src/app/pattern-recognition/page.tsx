import { Metadata } from "next";
import { siteConfig } from "@/lib/seo";
import { BreadcrumbJsonLd, FAQJsonLd } from "@/components/seo/JsonLd";
import PatternRecognitionClient from "./PatternRecognitionClient";

const siteUrl = siteConfig.url;

export const metadata: Metadata = {
  title:
    "Pattern Recognition Guide - Identify the Right Algorithm | AlgoPatterns",
  description:
    "Learn to identify the correct algorithm pattern for any coding problem. Constraint-based lookups, pattern cheatsheets, and keyword-to-algorithm mappings for FAANG interview prep.",
  keywords: [
    "pattern recognition",
    "algorithm identification",
    "coding problem patterns",
    "constraint based algorithm",
    "when to use sliding window",
    "when to use dynamic programming",
    "leetcode pattern guide",
    "algorithm decision tree",
  ],
  openGraph: {
    title:
      "Pattern Recognition Guide - Identify the Right Algorithm | AlgoPatterns",
    description:
      "Constraint-based algorithm lookups, pattern cheatsheets, and keyword-to-algorithm mappings for coding interviews.",
    type: "article",
    url: `${siteUrl}/pattern-recognition`,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "AlgoPatterns Pattern Recognition Guide",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pattern Recognition Guide | AlgoPatterns",
    description:
      "Learn to identify the right algorithm for any coding problem with constraint and keyword lookups.",
    images: ["/opengraph-image"],
  },
  alternates: {
    canonical: `${siteUrl}/pattern-recognition`,
  },
};

const breadcrumbs = [
  { name: "Home", url: siteUrl },
  { name: "Pattern Recognition", url: `${siteUrl}/pattern-recognition` },
];

const patternFaqs = [
  {
    question: "When should I use the Sliding Window pattern?",
    answer:
      "Use Sliding Window when the problem involves contiguous subarrays or substrings, and you need to find maximum/minimum/longest/shortest elements satisfying a condition. Keywords: subarray, substring, window, contiguous, consecutive.",
  },
  {
    question: "When should I use Two Pointers?",
    answer:
      "Use Two Pointers for sorted arrays or linked lists when searching for pairs, reversing, or partitioning. Also useful when you need to compare elements from both ends. Keywords: sorted array, pair sum, in-place, reverse.",
  },
  {
    question: "When should I use Binary Search?",
    answer:
      "Use Binary Search when the input is sorted or has a monotonic property, and you need O(log n) time complexity. Also use for finding boundaries or searching on answer space. Keywords: sorted, rotated sorted, find minimum, search target.",
  },
  {
    question: "When should I use Dynamic Programming?",
    answer:
      "Use DP when the problem has optimal substructure (solution depends on subproblems) and overlapping subproblems. Look for counting combinations, optimization problems, or decisions at each step. Keywords: minimum cost, maximum profit, number of ways, can reach.",
  },
  {
    question: "When should I use a Hash Map?",
    answer:
      "Use Hash Map for O(1) lookups, counting frequencies, grouping elements, or finding complements. Essential for problems requiring quick access to previously seen elements. Keywords: two sum, frequency, group by, unique, duplicate.",
  },
  {
    question: "When should I use BFS vs DFS for graphs?",
    answer:
      "Use BFS for shortest path in unweighted graphs, level-order traversal, or when exploring nodes layer by layer. Use DFS for exhaustive search, detecting cycles, topological sort, or finding all paths.",
  },
  {
    question: "When should I use a Heap/Priority Queue?",
    answer:
      "Use Heap when you need repeated access to the minimum or maximum element, for top K problems, merge K sorted lists, or scheduling problems. Keywords: kth largest, top k, median, merge sorted.",
  },
  {
    question: "When should I use Backtracking?",
    answer:
      "Use Backtracking for exhaustive search problems like permutations, combinations, subsets, or constraint satisfaction (N-Queens, Sudoku). When you need to explore all possibilities and prune invalid paths.",
  },
];

// skipcq: JS-0067
export default function PatternRecognitionPage() {
  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <FAQJsonLd faqs={patternFaqs} />
      <PatternRecognitionClient />
    </>
  );
}
