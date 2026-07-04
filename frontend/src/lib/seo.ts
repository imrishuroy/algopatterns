import { Metadata } from "next";

export const siteConfig = {
  name: "AlgoPatterns",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://algopatterns.in",
  description:
    "Master Data Structures & Algorithms with pattern-based learning. Interactive visualizers, step-by-step animations, and curated problem sets for FAANG interviews.",
  keywords: [
    "DSA",
    "algorithms",
    "data structures",
    "coding patterns",
    "leetcode",
    "FAANG interview",
    "coding interview",
    "software engineer interview",
  ],
};

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "AlgoPatterns - Master DSA Patterns for FAANG Interviews",
    template: "%s | AlgoPatterns",
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: "AlgoPatterns" }],
  creator: "AlgoPatterns",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: "AlgoPatterns - Master DSA Patterns for FAANG Interviews",
    description: siteConfig.description,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "AlgoPatterns - Master DSA Patterns",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AlgoPatterns - Master DSA Patterns for FAANG Interviews",
    description: siteConfig.description,
    images: ["/opengraph-image"],
    creator: "@algopatterns",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "GN9sKyZeBRDfjzlfvY8mPl0NB0zbnt2gHnPbmWpK3ng",
  },
};

type PatternSEO = {
  title: string;
  description: string;
  keywords: string[];
};

export const patternSEO: Record<string, PatternSEO> = {
  "arrays-strings": {
    title: "Arrays & Strings Pattern - DSA Fundamentals",
    description:
      "Master array and string manipulation patterns including hash maps, prefix sums, and Kadane's algorithm. Essential foundation for coding interviews with 20+ practice problems.",
    keywords: [
      "array algorithms",
      "string manipulation",
      "hash map leetcode",
      "two sum solution",
      "kadane algorithm",
      "prefix sum array",
    ],
  },
  backtracking: {
    title: "Backtracking Pattern - Complete Algorithm Guide",
    description:
      "Learn backtracking technique for solving constraint satisfaction problems. Master permutations, combinations, N-Queens, and Sudoku solver with visual explanations.",
    keywords: [
      "backtracking algorithm",
      "recursion backtracking",
      "n queens problem",
      "sudoku solver algorithm",
      "permutations combinations",
      "constraint satisfaction",
    ],
  },
  "binary-search": {
    title: "Binary Search Pattern - Algorithm Tutorial",
    description:
      "Master binary search and its variations including search in rotated array, finding boundaries, and binary search on answer. O(log n) efficiency explained.",
    keywords: [
      "binary search algorithm",
      "binary search leetcode",
      "search rotated array",
      "binary search template",
      "upper bound lower bound",
      "binary search on answer",
    ],
  },
  "dynamic-programming": {
    title: "Dynamic Programming Patterns - Complete DP Guide",
    description:
      "Master DP with 8 core patterns: 1D, 2D, interval, tree, state machine, and more. Visual explanations with memoization and tabulation approaches for 50+ problems.",
    keywords: [
      "dynamic programming patterns",
      "dp leetcode",
      "memoization vs tabulation",
      "knapsack problem",
      "longest common subsequence",
      "dp state transition",
    ],
  },
  greedy: {
    title: "Greedy Algorithm Patterns - When & How to Use",
    description:
      "Learn greedy algorithms for interval scheduling, activity selection, and optimization problems. Understand when greedy works and how to prove correctness.",
    keywords: [
      "greedy algorithm",
      "interval scheduling",
      "activity selection",
      "greedy vs dynamic programming",
      "jump game solution",
      "task scheduler algorithm",
    ],
  },
  graphs: {
    title: "Graph Algorithms - DFS, BFS, Topological Sort",
    description:
      "Complete guide to graph algorithms: DFS, BFS, cycle detection, topological sort, shortest paths (Dijkstra, Bellman-Ford), and minimum spanning trees.",
    keywords: [
      "graph algorithms",
      "dfs bfs",
      "topological sort",
      "dijkstra algorithm",
      "cycle detection graph",
      "shortest path algorithm",
    ],
  },
  "hash-map": {
    title: "Hash Map & Hash Set Patterns - O(1) Lookups",
    description:
      "Master hash table patterns for frequency counting, two-sum variations, and grouping problems. Essential data structure for coding interviews.",
    keywords: [
      "hash map algorithm",
      "hash table leetcode",
      "frequency counting",
      "two sum hash map",
      "group anagrams solution",
      "hash set applications",
    ],
  },
  heap: {
    title: "Heap & Priority Queue Patterns - Top K Problems",
    description:
      "Learn heap data structure for top K elements, merge K sorted lists, median finding, and scheduling problems. Min heap vs max heap explained.",
    keywords: [
      "heap data structure",
      "priority queue",
      "top k elements",
      "merge k sorted lists",
      "find median stream",
      "min heap max heap",
    ],
  },
  intervals: {
    title: "Interval Problems - Merge & Schedule Patterns",
    description:
      "Master interval manipulation: merging overlapping intervals, meeting rooms, insert interval, and interval scheduling. Sorting-based solutions explained.",
    keywords: [
      "interval problems leetcode",
      "merge intervals algorithm",
      "meeting rooms solution",
      "interval scheduling",
      "overlapping intervals",
      "insert interval",
    ],
  },
  "linked-list": {
    title: "Linked List Patterns - Reversal & Fast-Slow Pointers",
    description:
      "Complete guide to linked list algorithms: reversal, cycle detection, merge lists, and fast-slow pointer technique for finding middle and detecting loops.",
    keywords: [
      "linked list algorithms",
      "reverse linked list",
      "detect cycle linked list",
      "fast slow pointer",
      "merge two sorted lists",
      "linked list middle",
    ],
  },
  "prefix-sum": {
    title: "Prefix Sum Pattern - Range Query Optimization",
    description:
      "Learn prefix sum technique for O(1) range sum queries, subarray sum problems, and 2D prefix sums. Essential for array optimization problems.",
    keywords: [
      "prefix sum array",
      "range sum query",
      "subarray sum equals k",
      "cumulative sum",
      "2d prefix sum",
      "running sum array",
    ],
  },
  "sliding-window": {
    title: "Sliding Window Pattern - Subarray & Substring Problems",
    description:
      "Master sliding window technique for maximum/minimum subarray, longest substring, and window-based problems. Fixed and variable window templates included.",
    keywords: [
      "sliding window algorithm",
      "sliding window leetcode",
      "maximum subarray",
      "longest substring without repeating",
      "minimum window substring",
      "sliding window template",
    ],
  },
  stack: {
    title: "Stack Patterns - Monotonic Stack & Expression Parsing",
    description:
      "Learn stack applications: monotonic stack for next greater element, expression evaluation, valid parentheses, and histogram problems.",
    keywords: [
      "stack algorithms",
      "monotonic stack",
      "next greater element",
      "valid parentheses",
      "expression evaluation",
      "largest rectangle histogram",
    ],
  },
  trees: {
    title: "Tree Algorithms - Traversal, BST & Tree DP",
    description:
      "Complete guide to tree algorithms: DFS/BFS traversals, BST operations, lowest common ancestor, tree diameter, and tree dynamic programming.",
    keywords: [
      "tree algorithms",
      "binary tree traversal",
      "binary search tree",
      "lowest common ancestor",
      "tree diameter",
      "inorder preorder postorder",
    ],
  },
  trie: {
    title: "Trie Data Structure - Prefix Tree Implementation",
    description:
      "Learn Trie (prefix tree) for autocomplete, word search, and prefix matching problems. Implementation guide with insert, search, and startsWith operations.",
    keywords: [
      "trie data structure",
      "prefix tree",
      "autocomplete algorithm",
      "word search trie",
      "implement trie",
      "prefix matching",
    ],
  },
  "two-pointers": {
    title: "Two Pointers Pattern - Array & String Problems",
    description:
      "Master two pointers technique for sorted arrays, palindrome checking, and container problems. Includes opposite direction, same direction, and fast-slow variations.",
    keywords: [
      "two pointers algorithm",
      "two pointers leetcode",
      "two sum sorted array",
      "container with most water",
      "valid palindrome",
      "three sum solution",
    ],
  },
  "union-find": {
    title: "Union-Find (Disjoint Set) - Connected Components",
    description:
      "Learn Union-Find data structure for connected components, cycle detection in graphs, and dynamic connectivity. Path compression and union by rank optimizations.",
    keywords: [
      "union find algorithm",
      "disjoint set",
      "connected components",
      "path compression",
      "union by rank",
      "number of islands union find",
    ],
  },
};

export function getPatternMetadata(slug: string, category: string, description: string): Metadata {
  const seo = patternSEO[slug];
  const baseUrl = siteConfig.url;

  const title = seo?.title || `${category} Pattern - DSA Tutorial`;
  const metaDescription =
    seo?.description ||
    `${description} Learn with interactive visualizations and curated practice problems.`;
  const keywords = seo?.keywords || [slug, "algorithm", "leetcode", "dsa pattern"];

  return {
    title,
    description: metaDescription,
    keywords,
    openGraph: {
      title,
      description: metaDescription,
      type: "article",
      url: `${baseUrl}/patterns/${slug}`,
      siteName: "AlgoPatterns",
      locale: "en_US",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: metaDescription,
      images: ["/opengraph-image"],
    },
    alternates: {
      canonical: `${baseUrl}/patterns/${slug}`,
    },
  };
}
