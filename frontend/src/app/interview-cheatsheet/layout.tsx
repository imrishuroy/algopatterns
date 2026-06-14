import { Metadata } from "next";
import { FAQJsonLd } from "@/components/seo/JsonLd";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://algopatterns.com";

export const metadata: Metadata = {
  title: "Coding Interview Cheatsheet - DSA Patterns & Complexity Guide",
  description:
    "Complete coding interview cheatsheet: time complexity guide, pattern recognition table, constraint analysis, and algorithm selection tips. Essential for FAANG interviews.",
  keywords: [
    "coding interview cheatsheet",
    "algorithm cheat sheet",
    "big o cheatsheet",
    "dsa patterns cheatsheet",
    "leetcode cheatsheet",
    "time complexity guide",
    "faang interview cheatsheet",
  ],
  openGraph: {
    title: "Coding Interview Cheatsheet - DSA Patterns & Complexity Guide",
    description:
      "Essential cheatsheet for coding interviews: complexity analysis, pattern selection, and algorithm tips.",
    url: `${siteUrl}/interview-cheatsheet`,
    type: "article",
  },
  alternates: {
    canonical: `${siteUrl}/interview-cheatsheet`,
  },
};

const faqs = [
  {
    question: "How do I know which algorithm pattern to use?",
    answer:
      "Look at the input constraints first. n ≤ 15 suggests backtracking/brute force, n ≤ 1000 allows O(n²) solutions, n ≤ 100,000 needs O(n log n), and n > 10^6 requires O(n) or better. Then match problem type to pattern: sorted arrays → two pointers, contiguous subarrays → sliding window, etc.",
  },
  {
    question: "What time complexity is acceptable for coding interviews?",
    answer:
      "Most interview problems expect O(n) to O(n log n) solutions. If n ≤ 10^5, O(n log n) is fine. If n ≤ 10^6 or more, aim for O(n). Always mention your complexity analysis to the interviewer.",
  },
  {
    question: "How many DSA patterns should I know for interviews?",
    answer:
      "Focus on mastering 15-17 core patterns: Two Pointers, Sliding Window, Binary Search, BFS/DFS, Dynamic Programming, Backtracking, Graphs, Trees, Heaps, Stacks, Hash Maps, Linked Lists, Tries, Intervals, Union-Find, Prefix Sum, and Greedy algorithms.",
  },
];

export default function CheatsheetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <FAQJsonLd faqs={faqs} />
      {children}
    </>
  );
}
