import { Metadata } from "next";
import { siteConfig } from "@/lib/seo";
import { BreadcrumbJsonLd, FAQJsonLd } from "@/components/seo/JsonLd";
import InterviewCheatsheetClient from "./InterviewCheatsheetClient";

const siteUrl = siteConfig.url;

export const metadata: Metadata = {
  title: "Interview Cheatsheet - Algorithm Patterns Quick Reference | AlgoPatterns",
  description:
    "Complete interview cheatsheet: constraint-to-complexity guide, pattern quick-reference table, keyword-to-algorithm mappings, and code templates for all major DSA patterns. Essential for FAANG interviews.",
  keywords: [
    "interview cheatsheet",
    "algorithm cheatsheet",
    "dsa cheatsheet",
    "coding interview reference",
    "time complexity guide",
    "algorithm patterns quick reference",
    "leetcode cheatsheet",
    "faang interview prep",
  ],
  openGraph: {
    title: "Interview Cheatsheet - Algorithm Patterns Quick Reference | AlgoPatterns",
    description:
      "Constraint guide, pattern lookup, keyword-to-algorithm mappings, and code templates for all major DSA patterns.",
    type: "article",
    url: `${siteUrl}/interview-cheatsheet`,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "AlgoPatterns Interview Cheatsheet",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Interview Cheatsheet | AlgoPatterns",
    description:
      "Algorithm patterns quick reference: constraint guide, keyword mappings, and code templates.",
    images: ["/opengraph-image"],
  },
  alternates: {
    canonical: `${siteUrl}/interview-cheatsheet`,
  },
};

const breadcrumbs = [
  { name: "Home", url: siteUrl },
  { name: "Interview Cheatsheet", url: `${siteUrl}/interview-cheatsheet` },
];

// FAQ structured data — consolidates all FAQs for Google rich results
const faqItems = [
  { question: "How do I know which algorithm pattern to use in a coding interview?", answer: "Look at the input constraints first. n ≤ 15 suggests backtracking or brute force, n ≤ 1,000 allows O(n²), n ≤ 100,000 needs O(n log n), and n > 10^6 requires O(n) or better. Then match the problem type: sorted arrays → two pointers, contiguous subarrays → sliding window, finding complement/pairs → hash map." },
  { question: "What time complexity is acceptable in coding interviews?", answer: "Most interview problems expect O(n) to O(n log n) solutions. If n ≤ 10^5, O(n log n) is fine. If n ≤ 10^6 or more, aim for O(n). Always state your time and space complexity to the interviewer." },
  { question: "How many DSA patterns should I know for FAANG interviews?", answer: "Focus on mastering 15–17 core patterns: Two Pointers, Sliding Window, Binary Search, BFS/DFS, Dynamic Programming, Backtracking, Graphs, Trees, Heaps, Stacks, Hash Maps, Linked Lists, Tries, Intervals, Union-Find, Prefix Sum, and Greedy algorithms." },
  { question: "When should I use a Heap or Priority Queue?", answer: "Use a Heap (Priority Queue) when the problem involves Top K or Kth largest elements. A min-heap of size K gives O(n log K) time complexity." },
  { question: "When should I use Binary Search?", answer: "Use Binary Search on a sorted array or when searching for a boundary value. It runs in O(log n). Also apply binary search on the answer for min/max optimization problems." },
  { question: "When should I use Dynamic Programming?", answer: "Use DP when the problem asks 'How many ways' or involves optimal substructure with overlapping subproblems. Use memoization (top-down) or tabulation (bottom-up)." },
  { question: "When should I use Sliding Window?", answer: "Use Sliding Window for substring or subarray problems involving contiguous elements. It runs in O(n) time and avoids the O(n²) nested loop approach." },
  { question: "When should I use Two Pointers?", answer: "Use Two Pointers on sorted arrays to find pairs, for palindrome verification, or for in-place O(1) space array manipulation. Runs in O(n)." },
  { question: "When should I use a Stack?", answer: "Use a Stack for parentheses/bracket matching, expression evaluation, or finding the next greater/smaller element using a monotonic stack approach. Runs in O(n)." },
  { question: "When should I use BFS or Dijkstra for shortest path?", answer: "Use BFS for shortest path in unweighted graphs — O(V+E). Use Dijkstra for shortest path in weighted graphs with non-negative weights — O((V+E) log V)." },
  { question: "When should I use Backtracking?", answer: "Use Backtracking when the problem asks for all combinations, permutations, or subset solutions. Generate solutions with the choose-explore-undo pattern." },
];

export default function InterviewCheatsheetPage() {
  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <FAQJsonLd faqs={faqItems} />
      <InterviewCheatsheetClient />
    </>
  );
}
