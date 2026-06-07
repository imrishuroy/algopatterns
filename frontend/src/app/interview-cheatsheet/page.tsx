"use client";

import { useState } from "react";
import CodeBlock from "@/components/ui/CodeBlock";

export default function InterviewCheatsheetPage() {
  const [expandedPattern, setExpandedPattern] = useState<string | null>(null);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Interview Cheat Sheet
        </h1>
        <p className="text-gray-400">
          Quick revision guide - scan this before your interview
        </p>
      </div>

      {/* Constraints Guide */}
      <ConstraintsGuide />

      {/* Quick Pattern Selector */}
      <QuickPatternSelector />

      {/* All Patterns */}
      <AllPatterns
        expandedPattern={expandedPattern}
        setExpandedPattern={setExpandedPattern}
      />

      {/* Keyword to Algorithm */}
      <KeywordToAlgorithm />

      {/* Quick Decision Tree */}
      <DecisionTree />

      {/* Complexity Reference */}
      <ComplexityReference />

      {/* Common Mistakes */}
      <CommonMistakes />
    </div>
  );
}

function ConstraintsGuide() {
  const constraints = [
    { size: "n ≤ 15", complexity: "O(n!) or O(2^n)", what: "Brute force, backtracking, all permutations" },
    { size: "n ≤ 20", complexity: "O(2^n)", what: "Backtracking, recursion, bitmask DP" },
    { size: "n ≤ 100", complexity: "O(n³)", what: "Triple nested loops, Floyd-Warshall" },
    { size: "n ≤ 1,000", complexity: "O(n²)", what: "Nested loops, simple DP" },
    { size: "n ≤ 100,000", complexity: "O(n log n)", what: "Sorting, heap, binary search" },
    { size: "n ≤ 1,000,000", complexity: "O(n)", what: "Single pass, two pointers, sliding window" },
    { size: "n > 10^7", complexity: "O(log n) or O(1)", what: "Binary search, math formula" },
  ];

  return (
    <section className="mb-10">
      <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
        <h2 className="text-xl font-bold text-white mb-2">
          The Golden Rule: Check Constraints First
        </h2>
        <p className="text-gray-400 mb-5">
          Before anything else, look at the input size. This tells you which algorithms are even possible.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 px-3 text-gray-400 font-medium">Input Size</th>
                <th className="text-left py-2 px-3 text-gray-400 font-medium">Complexity</th>
                <th className="text-left py-2 px-3 text-gray-400 font-medium">What Works</th>
              </tr>
            </thead>
            <tbody>
              {constraints.map((c, i) => (
                <tr key={i} className="border-b border-gray-800">
                  <td className="py-2.5 px-3 font-mono font-semibold text-indigo-400">{c.size}</td>
                  <td className="py-2.5 px-3 font-mono text-green-400">{c.complexity}</td>
                  <td className="py-2.5 px-3 text-gray-300">{c.what}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function QuickPatternSelector() {
  const mappings = [
    { problem: "Sorted array, find pair", pattern: "Two Pointers", time: "O(n)", space: "O(1)" },
    { problem: "Contiguous subarray/substring", pattern: "Sliding Window", time: "O(n)", space: "O(k)" },
    { problem: "Range sum queries", pattern: "Prefix Sum", time: "O(1) query", space: "O(n)" },
    { problem: "Find complement/duplicates", pattern: "Hash Map", time: "O(n)", space: "O(n)" },
    { problem: "Search sorted/find boundary", pattern: "Binary Search", time: "O(log n)", space: "O(1)" },
    { problem: "Matching brackets/NGE", pattern: "Stack", time: "O(n)", space: "O(n)" },
    { problem: "In-place reversal/cycle", pattern: "Linked List", time: "O(n)", space: "O(1)" },
    { problem: "Tree traversal/path", pattern: "DFS/BFS", time: "O(n)", space: "O(h)" },
    { problem: "Connectivity/shortest path", pattern: "Graphs", time: "O(V+E)", space: "O(V+E)" },
    { problem: "Top K/streaming median", pattern: "Heap", time: "O(n log k)", space: "O(k)" },
    { problem: "Counting ways/optimization", pattern: "DP", time: "O(n*m)", space: "O(n)" },
    { problem: "Generate all combinations", pattern: "Backtracking", time: "O(2^n)", space: "O(n)" },
    { problem: "Merge/schedule ranges", pattern: "Intervals", time: "O(n log n)", space: "O(n)" },
    { problem: "Prefix search/autocomplete", pattern: "Trie", time: "O(L)", space: "O(N*L)" },
    { problem: "Dynamic connectivity", pattern: "Union-Find", time: "O(1)", space: "O(n)" },
  ];

  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-white mb-4">Quick Pattern Selector</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-2 px-3 text-gray-400 font-medium">Problem Type</th>
              <th className="text-left py-2 px-3 text-gray-400 font-medium">Pattern</th>
              <th className="text-left py-2 px-3 text-gray-400 font-medium">Time</th>
              <th className="text-left py-2 px-3 text-gray-400 font-medium">Space</th>
            </tr>
          </thead>
          <tbody>
            {mappings.map((m, i) => (
              <tr key={i} className="border-b border-gray-800 hover:bg-gray-900/50">
                <td className="py-2 px-3 text-gray-300">{m.problem}</td>
                <td className="py-2 px-3 text-indigo-400 font-medium">{m.pattern}</td>
                <td className="py-2 px-3 text-green-400 font-mono text-xs">{m.time}</td>
                <td className="py-2 px-3 text-blue-400 font-mono text-xs">{m.space}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function AllPatterns({
  expandedPattern,
  setExpandedPattern,
}: {
  expandedPattern: string | null;
  setExpandedPattern: (p: string | null) => void;
}) {
  const patterns = [
    {
      id: "two-pointers",
      name: "1. Two Pointers",
      when: "Sorted array, pairs, palindrome, partitioning",
      keyPoints: [
        "Reduces O(n²) brute force to O(n) on sorted arrays",
        "Opposite direction: start from both ends, move inward",
        "Same direction (fast/slow): for in-place modifications",
        "For 3Sum: fix one element, use two pointers for the rest",
      ],
      problems: ["Two Sum II", "3Sum", "Container With Most Water", "Valid Palindrome", "Remove Duplicates"],
      code: `// OPPOSITE DIRECTION - find pair with target sum
int left = 0, right = arr.length - 1;
while (left < right) {
    int sum = arr[left] + arr[right];
    if (sum == target) return new int[]{left, right};
    else if (sum < target) left++;
    else right--;
}

// SAME DIRECTION - remove duplicates in-place
int slow = 0;
for (int fast = 1; fast < nums.length; fast++) {
    if (nums[fast] != nums[slow]) {
        nums[++slow] = nums[fast];
    }
}
return slow + 1;  // new length

// CYCLE DETECTION (Floyd's)
ListNode slow = head, fast = head;
while (fast != null && fast.next != null) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow == fast) return true;  // cycle exists
}`,
    },
    {
      id: "sliding-window",
      name: "2. Sliding Window",
      when: "Contiguous subarray/substring, 'consecutive', 'at most K'",
      keyPoints: [
        "Window size = right - left + 1",
        "Fixed window: slide by adding right, removing left",
        "Variable window: expand right, shrink left when invalid",
        "For MAXIMUM length: update AFTER shrinking (valid window)",
        "For MINIMUM length: update WHILE shrinking (valid window)",
      ],
      problems: ["Longest Substring Without Repeating", "Minimum Window Substring", "Find All Anagrams", "Max Consecutive Ones III"],
      code: `// VARIABLE SIZE - longest substring with at most K distinct
int left = 0, maxLen = 0;
Map<Character, Integer> freq = new HashMap<>();

for (int right = 0; right < s.length(); right++) {
    // 1. EXPAND: add right element to window
    char c = s.charAt(right);
    freq.merge(c, 1, Integer::sum);

    // 2. SHRINK: while window is invalid
    while (freq.size() > k) {
        char leftChar = s.charAt(left);
        freq.merge(leftChar, -1, Integer::sum);
        if (freq.get(leftChar) == 0) freq.remove(leftChar);
        left++;
    }

    // 3. UPDATE: max length (window is now valid)
    maxLen = Math.max(maxLen, right - left + 1);
}

// FIXED SIZE - max sum of k elements
int windowSum = 0, maxSum = 0;
for (int i = 0; i < arr.length; i++) {
    windowSum += arr[i];
    if (i >= k - 1) {
        maxSum = Math.max(maxSum, windowSum);
        windowSum -= arr[i - k + 1];
    }
}`,
    },
    {
      id: "prefix-sum",
      name: "3. Prefix Sum",
      when: "Range sum queries, subarray sum equals K, product except self",
      keyPoints: [
        "prefix[i] = sum of arr[0..i-1], prefix[0] = 0",
        "Range sum [i,j] = prefix[j+1] - prefix[i]",
        "Subarray sum = k: use HashMap to find complement (sum - k)",
        "MUST initialize map with {0: 1} for subarrays starting at index 0",
      ],
      problems: ["Subarray Sum Equals K", "Product Except Self", "Range Sum Query", "Contiguous Array"],
      code: `// BUILD PREFIX SUM ARRAY
int[] prefix = new int[arr.length + 1];
for (int i = 0; i < arr.length; i++) {
    prefix[i + 1] = prefix[i] + arr[i];
}
// Range sum [i, j] = prefix[j + 1] - prefix[i]

// SUBARRAY SUM EQUALS K (count subarrays)
Map<Integer, Integer> prefixCount = new HashMap<>();
prefixCount.put(0, 1);  // CRITICAL: handles subarrays from index 0
int sum = 0, count = 0;

for (int num : nums) {
    sum += num;
    // How many previous prefix sums equal (sum - k)?
    count += prefixCount.getOrDefault(sum - k, 0);
    prefixCount.merge(sum, 1, Integer::sum);
}
return count;`,
    },
    {
      id: "binary-search",
      name: "4. Binary Search",
      when: "Sorted array, find boundary, minimize/maximize answer",
      keyPoints: [
        "Use mid = left + (right - left) / 2 to avoid overflow",
        "left <= right for exact match, left < right for boundary",
        "Binary search on answer: find min/max value satisfying condition",
        "Rotated array: one half is ALWAYS sorted",
      ],
      problems: ["Binary Search", "Search in Rotated Array", "Find First and Last Position", "Koko Eating Bananas", "Capacity to Ship Packages"],
      code: `// EXACT MATCH
int left = 0, right = arr.length - 1;
while (left <= right) {
    int mid = left + (right - left) / 2;
    if (arr[mid] == target) return mid;
    else if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
}
return -1;

// FIRST POSITION >= TARGET (lower bound)
int left = 0, right = arr.length;
while (left < right) {
    int mid = left + (right - left) / 2;
    if (arr[mid] < target) left = mid + 1;
    else right = mid;
}
return left;

// BINARY SEARCH ON ANSWER (minimize maximum)
int left = minPossible, right = maxPossible;
while (left < right) {
    int mid = left + (right - left) / 2;
    if (canAchieve(mid)) right = mid;  // try smaller
    else left = mid + 1;
}
return left;`,
    },
    {
      id: "stack",
      name: "5. Stack / Monotonic Stack",
      when: "Matching pairs, next greater/smaller, expression evaluation",
      keyPoints: [
        "LIFO: last in, first out - perfect for nested structures",
        "Monotonic decreasing: pop when current > top (next greater)",
        "Monotonic increasing: pop when current < top (next smaller)",
        "Store INDICES not values for position-based problems",
        "For circular arrays: iterate 2*n, use i % n",
      ],
      problems: ["Valid Parentheses", "Daily Temperatures", "Largest Rectangle in Histogram", "Next Greater Element"],
      code: `// VALID PARENTHESES
Deque<Character> stack = new ArrayDeque<>();
Map<Character, Character> pairs = Map.of(')', '(', ']', '[', '}', '{');
for (char c : s.toCharArray()) {
    if (pairs.containsValue(c)) {
        stack.push(c);
    } else if (stack.isEmpty() || stack.pop() != pairs.get(c)) {
        return false;
    }
}
return stack.isEmpty();

// NEXT GREATER ELEMENT (monotonic decreasing stack)
int[] result = new int[n];
Arrays.fill(result, -1);
Deque<Integer> stack = new ArrayDeque<>();  // stores INDICES

for (int i = 0; i < n; i++) {
    while (!stack.isEmpty() && nums[stack.peek()] < nums[i]) {
        result[stack.pop()] = nums[i];  // current is their answer
    }
    stack.push(i);
}`,
    },
    {
      id: "trees",
      name: "6. Trees (DFS/BFS)",
      when: "Traversal, path sum, validate BST, level order",
      keyPoints: [
        "Preorder: root → left → right (copy/serialize tree)",
        "Inorder: left → root → right (BST gives sorted order!)",
        "Postorder: left → right → root (delete tree, compute heights)",
        "BFS: level order traversal, find minimum depth",
        "For BST validation: pass min/max bounds down",
      ],
      problems: ["Maximum Depth", "Validate BST", "Lowest Common Ancestor", "Level Order Traversal", "Diameter of Binary Tree"],
      code: `// DFS - MAX DEPTH (postorder)
int maxDepth(TreeNode node) {
    if (node == null) return 0;
    int left = maxDepth(node.left);
    int right = maxDepth(node.right);
    return 1 + Math.max(left, right);
}

// VALIDATE BST (pass bounds down)
boolean isValidBST(TreeNode node, long min, long max) {
    if (node == null) return true;
    if (node.val <= min || node.val >= max) return false;
    return isValidBST(node.left, min, node.val) &&
           isValidBST(node.right, node.val, max);
}

// BFS - LEVEL ORDER
Queue<TreeNode> queue = new LinkedList<>();
queue.offer(root);
List<List<Integer>> result = new ArrayList<>();
while (!queue.isEmpty()) {
    int size = queue.size();
    List<Integer> level = new ArrayList<>();
    for (int i = 0; i < size; i++) {
        TreeNode node = queue.poll();
        level.add(node.val);
        if (node.left != null) queue.offer(node.left);
        if (node.right != null) queue.offer(node.right);
    }
    result.add(level);
}`,
    },
    {
      id: "graphs",
      name: "7. Graphs",
      when: "Connected components, shortest path, cycle detection, dependency order",
      keyPoints: [
        "BFS: shortest path in UNWEIGHTED graph, level by level",
        "DFS: explore as deep as possible, backtrack",
        "Mark visited BEFORE adding to queue (BFS) to avoid duplicates",
        "Topological sort: only for DAG, use indegree (Kahn's) or DFS",
        "Cycle detection: use 3 colors (white/gray/black) in DFS",
      ],
      problems: ["Number of Islands", "Course Schedule", "Clone Graph", "Word Ladder", "Pacific Atlantic Water Flow"],
      code: `// BFS - SHORTEST PATH (unweighted)
int bfs(int start, int end, List<List<Integer>> graph) {
    Queue<int[]> queue = new LinkedList<>();
    Set<Integer> visited = new HashSet<>();
    queue.offer(new int[]{start, 0});
    visited.add(start);

    while (!queue.isEmpty()) {
        int[] curr = queue.poll();
        int node = curr[0], dist = curr[1];
        if (node == end) return dist;

        for (int neighbor : graph.get(node)) {
            if (!visited.contains(neighbor)) {
                visited.add(neighbor);  // mark BEFORE adding!
                queue.offer(new int[]{neighbor, dist + 1});
            }
        }
    }
    return -1;
}

// DFS ON GRID (Number of Islands)
int[][] dirs = {{0,1}, {0,-1}, {1,0}, {-1,0}};
void dfs(char[][] grid, int r, int c) {
    if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length
        || grid[r][c] == '0') return;
    grid[r][c] = '0';  // mark visited
    for (int[] d : dirs) dfs(grid, r + d[0], c + d[1]);
}

// TOPOLOGICAL SORT (Kahn's BFS)
Queue<Integer> queue = new LinkedList<>();
int[] indegree = new int[n];
// ... build graph and compute indegrees ...
for (int i = 0; i < n; i++) {
    if (indegree[i] == 0) queue.offer(i);
}
List<Integer> order = new ArrayList<>();
while (!queue.isEmpty()) {
    int node = queue.poll();
    order.add(node);
    for (int neighbor : graph.get(node)) {
        if (--indegree[neighbor] == 0) queue.offer(neighbor);
    }
}
// if order.size() != n, there's a cycle`,
    },
    {
      id: "heap",
      name: "8. Heap / Priority Queue",
      when: "Top K elements, streaming median, merge K sorted lists",
      keyPoints: [
        "K largest elements: use MIN-heap of size K",
        "K smallest elements: use MAX-heap of size K",
        "Java PriorityQueue is MIN-heap by default",
        "Streaming median: two heaps (max-heap for lower, min-heap for upper)",
        "Merge K sorted: heap of K elements, always pop min",
      ],
      problems: ["Kth Largest Element", "Top K Frequent Elements", "Find Median from Data Stream", "Merge K Sorted Lists"],
      code: `// KTH LARGEST (min-heap of size K)
PriorityQueue<Integer> minHeap = new PriorityQueue<>();
for (int num : nums) {
    minHeap.offer(num);
    if (minHeap.size() > k) {
        minHeap.poll();  // remove smallest
    }
}
return minHeap.peek();  // Kth largest is at top

// STREAMING MEDIAN (two heaps)
PriorityQueue<Integer> lo = new PriorityQueue<>(Collections.reverseOrder()); // max-heap: lower half
PriorityQueue<Integer> hi = new PriorityQueue<>();  // min-heap: upper half

void addNum(int num) {
    lo.offer(num);
    hi.offer(lo.poll());  // balance
    if (hi.size() > lo.size()) {
        lo.offer(hi.poll());
    }
}

double findMedian() {
    if (lo.size() > hi.size()) return lo.peek();
    return (lo.peek() + hi.peek()) / 2.0;
}`,
    },
    {
      id: "dp",
      name: "9. Dynamic Programming",
      when: "Counting ways, optimization (min/max), overlapping subproblems",
      keyPoints: [
        "Framework: 1) Define state 2) Recurrence relation 3) Base case",
        "0/1 Knapsack (use once): iterate items, then capacity REVERSE",
        "Unbounded Knapsack (reuse): iterate items, then capacity FORWARD",
        "LCS/Edit Distance: 2D DP, compare characters",
        "Space optimization: if only need previous row, use 1D array",
      ],
      problems: ["Climbing Stairs", "House Robber", "Coin Change", "Longest Common Subsequence", "Edit Distance", "Longest Increasing Subsequence"],
      code: `// CLIMBING STAIRS (Fibonacci pattern)
int[] dp = new int[n + 1];
dp[0] = dp[1] = 1;
for (int i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
}

// 0/1 KNAPSACK - Partition Equal Subset Sum
boolean[] dp = new boolean[target + 1];
dp[0] = true;
for (int num : nums) {
    for (int j = target; j >= num; j--) {  // REVERSE!
        dp[j] = dp[j] || dp[j - num];
    }
}

// UNBOUNDED KNAPSACK - Coin Change (min coins)
int[] dp = new int[amount + 1];
Arrays.fill(dp, amount + 1);
dp[0] = 0;
for (int coin : coins) {
    for (int i = coin; i <= amount; i++) {  // FORWARD!
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
    }
}
return dp[amount] > amount ? -1 : dp[amount];

// LONGEST INCREASING SUBSEQUENCE
int[] dp = new int[n];
Arrays.fill(dp, 1);
for (int i = 1; i < n; i++) {
    for (int j = 0; j < i; j++) {
        if (nums[j] < nums[i]) {
            dp[i] = Math.max(dp[i], dp[j] + 1);
        }
    }
}`,
    },
    {
      id: "backtracking",
      name: "10. Backtracking",
      when: "Generate all combinations/permutations/subsets, constraint satisfaction",
      keyPoints: [
        "Pattern: choose → explore → un-choose (backtrack)",
        "Subsets: start from current index (i + 1)",
        "Permutations: use visited array, iterate from 0",
        "For duplicates: sort first, skip if nums[i] == nums[i-1] && !used[i-1]",
        "Prune early: check constraints before recursing",
      ],
      problems: ["Subsets", "Permutations", "Combination Sum", "N-Queens", "Word Search", "Palindrome Partitioning"],
      code: `// SUBSETS
void backtrack(int[] nums, int start, List<Integer> path,
               List<List<Integer>> result) {
    result.add(new ArrayList<>(path));  // add current subset
    for (int i = start; i < nums.length; i++) {
        path.add(nums[i]);              // choose
        backtrack(nums, i + 1, path, result);  // explore
        path.remove(path.size() - 1);   // un-choose
    }
}

// PERMUTATIONS
void backtrack(int[] nums, boolean[] used, List<Integer> path,
               List<List<Integer>> result) {
    if (path.size() == nums.length) {
        result.add(new ArrayList<>(path));
        return;
    }
    for (int i = 0; i < nums.length; i++) {
        if (used[i]) continue;
        used[i] = true;
        path.add(nums[i]);
        backtrack(nums, used, path, result);
        path.remove(path.size() - 1);
        used[i] = false;
    }
}

// COMBINATION SUM (can reuse elements)
void backtrack(int[] candidates, int start, int target,
               List<Integer> path, List<List<Integer>> result) {
    if (target == 0) {
        result.add(new ArrayList<>(path));
        return;
    }
    for (int i = start; i < candidates.length; i++) {
        if (candidates[i] > target) break;  // prune
        path.add(candidates[i]);
        backtrack(candidates, i, target - candidates[i], path, result);
        path.remove(path.size() - 1);
    }
}`,
    },
    {
      id: "intervals",
      name: "11. Intervals",
      when: "Merge overlapping, scheduling, finding gaps",
      keyPoints: [
        "Always SORT first (by start or end)",
        "Merge: sort by start, extend end if overlap",
        "Non-overlapping (max activities): sort by END time, greedy",
        "Meeting rooms: use min-heap or line sweep",
        "Overlap condition: curr.start <= prev.end",
      ],
      problems: ["Merge Intervals", "Insert Interval", "Meeting Rooms", "Meeting Rooms II", "Non-overlapping Intervals"],
      code: `// MERGE INTERVALS
Arrays.sort(intervals, (a, b) -> a[0] - b[0]);  // sort by start
List<int[]> result = new ArrayList<>();
result.add(intervals[0]);

for (int[] curr : intervals) {
    int[] last = result.get(result.size() - 1);
    if (curr[0] <= last[1]) {  // overlap
        last[1] = Math.max(last[1], curr[1]);  // merge
    } else {
        result.add(curr);
    }
}

// MEETING ROOMS II (min rooms needed)
int[] starts = new int[n], ends = new int[n];
for (int i = 0; i < n; i++) {
    starts[i] = intervals[i][0];
    ends[i] = intervals[i][1];
}
Arrays.sort(starts);
Arrays.sort(ends);

int rooms = 0, endPtr = 0;
for (int start : starts) {
    if (start < ends[endPtr]) {
        rooms++;  // need new room
    } else {
        endPtr++;  // reuse room
    }
}`,
    },
    {
      id: "trie",
      name: "12. Trie (Prefix Tree)",
      when: "Prefix search, autocomplete, word dictionary, word search in grid",
      keyPoints: [
        "Each node has children (array[26] or HashMap) and isEnd flag",
        "Insert/Search/StartsWith all O(word length)",
        "For wildcards: use DFS, try all children for '.'",
        "Word Search II: build Trie of words, DFS on grid",
      ],
      problems: ["Implement Trie", "Word Search II", "Design Add and Search Words", "Search Suggestions System"],
      code: `class TrieNode {
    TrieNode[] children = new TrieNode[26];
    boolean isEnd = false;
}

class Trie {
    TrieNode root = new TrieNode();

    void insert(String word) {
        TrieNode node = root;
        for (char c : word.toCharArray()) {
            int i = c - 'a';
            if (node.children[i] == null) {
                node.children[i] = new TrieNode();
            }
            node = node.children[i];
        }
        node.isEnd = true;
    }

    boolean search(String word) {
        TrieNode node = searchPrefix(word);
        return node != null && node.isEnd;
    }

    boolean startsWith(String prefix) {
        return searchPrefix(prefix) != null;
    }

    private TrieNode searchPrefix(String prefix) {
        TrieNode node = root;
        for (char c : prefix.toCharArray()) {
            int i = c - 'a';
            if (node.children[i] == null) return null;
            node = node.children[i];
        }
        return node;
    }
}`,
    },
    {
      id: "union-find",
      name: "13. Union-Find (Disjoint Set)",
      when: "Dynamic connectivity, cycle detection in undirected graph, grouping",
      keyPoints: [
        "Two operations: find(x) and union(x, y)",
        "Path compression: point directly to root during find",
        "Union by rank: attach smaller tree under larger",
        "Both optimizations → O(α(n)) ≈ O(1) amortized",
        "For 2D grids: flatten index as i * cols + j",
      ],
      problems: ["Number of Provinces", "Redundant Connection", "Accounts Merge", "Longest Consecutive Sequence"],
      code: `class UnionFind {
    int[] parent, rank;
    int count;  // number of connected components

    UnionFind(int n) {
        parent = new int[n];
        rank = new int[n];
        count = n;
        for (int i = 0; i < n; i++) parent[i] = i;
    }

    int find(int x) {
        if (parent[x] != x) {
            parent[x] = find(parent[x]);  // path compression
        }
        return parent[x];
    }

    boolean union(int x, int y) {
        int px = find(x), py = find(y);
        if (px == py) return false;  // already connected

        // union by rank
        if (rank[px] < rank[py]) { int t = px; px = py; py = t; }
        parent[py] = px;
        if (rank[px] == rank[py]) rank[px]++;
        count--;
        return true;
    }

    boolean connected(int x, int y) {
        return find(x) == find(y);
    }
}`,
    },
    {
      id: "linked-list",
      name: "14. Linked List",
      when: "Reversal, cycle detection, merge, find middle, reorder",
      keyPoints: [
        "Use DUMMY node when head might change",
        "Fast/slow pointers: cycle detection, find middle",
        "Reverse: save next, redirect, move forward",
        "Merge two sorted: use dummy, compare and link",
        "Draw diagrams! Pointer manipulation is error-prone",
      ],
      problems: ["Reverse Linked List", "Linked List Cycle", "Merge Two Sorted Lists", "Reorder List", "Remove Nth Node From End"],
      code: `// REVERSE LINKED LIST
ListNode reverse(ListNode head) {
    ListNode prev = null, curr = head;
    while (curr != null) {
        ListNode next = curr.next;
        curr.next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
}

// FIND MIDDLE (for odd: exact middle, for even: second middle)
ListNode findMiddle(ListNode head) {
    ListNode slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
    }
    return slow;
}

// DETECT CYCLE AND FIND START
ListNode detectCycle(ListNode head) {
    ListNode slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow == fast) {  // cycle detected
            slow = head;
            while (slow != fast) {
                slow = slow.next;
                fast = fast.next;
            }
            return slow;  // cycle start
        }
    }
    return null;  // no cycle
}

// MERGE TWO SORTED LISTS
ListNode mergeTwoLists(ListNode l1, ListNode l2) {
    ListNode dummy = new ListNode(0);
    ListNode curr = dummy;
    while (l1 != null && l2 != null) {
        if (l1.val <= l2.val) {
            curr.next = l1;
            l1 = l1.next;
        } else {
            curr.next = l2;
            l2 = l2.next;
        }
        curr = curr.next;
    }
    curr.next = (l1 != null) ? l1 : l2;
    return dummy.next;
}`,
    },
  ];

  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-white mb-4">All Patterns with Templates</h2>
      <div className="space-y-3">
        {patterns.map((pattern) => (
          <div
            key={pattern.id}
            className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden"
          >
            <button
              onClick={() =>
                setExpandedPattern(expandedPattern === pattern.id ? null : pattern.id)
              }
              className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-800/50 transition"
            >
              <div>
                <h3 className="font-bold text-white">{pattern.name}</h3>
                <p className="text-sm text-gray-400">{pattern.when}</p>
              </div>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${
                  expandedPattern === pattern.id ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {expandedPattern === pattern.id && (
              <div className="p-4 pt-3 border-t border-gray-800">
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Key Points:</h4>
                  <ul className="space-y-1">
                    {pattern.keyPoints.map((point, i) => (
                      <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                        <span className="text-indigo-400 mt-1">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Template:</h4>
                  <CodeBlock code={pattern.code} language="java" />
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Practice:</h4>
                  <div className="flex flex-wrap gap-2">
                    {pattern.problems.map((problem, i) => {
                      const slug = problem
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/(^-|-$)/g, "");
                      return (
                        <a
                          key={i}
                          href={`https://leetcode.com/problems/${slug}/`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition"
                        >
                          {problem}
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function KeywordToAlgorithm() {
  const keywords = [
    { keyword: "Top K / Kth largest", algo: "Heap", reason: "Min-heap of size K → O(n log K)" },
    { keyword: "Sorted array", algo: "Binary Search / Two Pointers", reason: "O(log n) search or O(n) pairs" },
    { keyword: "How many ways", algo: "DP", reason: "Count with overlapping subproblems" },
    { keyword: "Substring / subarray", algo: "Sliding Window", reason: "Contiguous elements, O(n)" },
    { keyword: "Prefix / autocomplete", algo: "Trie", reason: "O(word length) prefix lookup" },
    { keyword: "Palindrome", algo: "Two Pointers / DP", reason: "Verify O(n) or count O(n²)" },
    { keyword: "Parentheses / valid", algo: "Stack", reason: "LIFO matches nested pairs" },
    { keyword: "Next greater/smaller", algo: "Monotonic Stack", reason: "O(n) with stack ordering" },
    { keyword: "Subarray sum = k", algo: "Prefix Sum + HashMap", reason: "Find complement in O(1)" },
    { keyword: "Shortest path", algo: "BFS / Dijkstra", reason: "Unweighted O(V+E) vs weighted" },
    { keyword: "All combinations", algo: "Backtracking", reason: "Generate with choose-explore-undo" },
    { keyword: "Course schedule", algo: "Topological Sort", reason: "DAG ordering via indegree" },
    { keyword: "Connected components", algo: "Union-Find / DFS", reason: "Dynamic vs static graph" },
    { keyword: "Merge intervals", algo: "Sort + Greedy", reason: "Sort by start, extend end" },
    { keyword: "Maximum/minimum", algo: "DP / Greedy", reason: "Optimal substructure" },
    { keyword: "In-place / O(1) space", algo: "Two Pointers", reason: "Modify array without extra space" },
  ];

  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-white mb-2">Keyword to Algorithm</h2>
      <p className="text-gray-400 mb-5 text-sm">
        Problems rarely tell you which algorithm to use, but the wording usually leaks it.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {keywords.map((k, i) => (
          <div
            key={i}
            className="p-3 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-700 transition"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-white font-medium">{k.keyword}</span>
              <span className="text-indigo-400 font-semibold text-sm">{k.algo}</span>
            </div>
            <p className="text-gray-500 text-xs">{k.reason}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function DecisionTree() {
  const decisions = [
    {
      question: "Is it about ARRAYS?",
      options: [
        "Sorted? → Binary Search or Two Pointers",
        "Find pair/complement? → HashMap O(n) or Two Pointers O(n)",
        "Subarray/substring? → Sliding Window or Prefix Sum",
        "In-place modification? → Two Pointers (fast/slow)",
      ],
    },
    {
      question: "Is it about SEARCHING?",
      options: [
        "Sorted array? → Binary Search O(log n)",
        "Minimize maximum? → Binary Search on Answer",
        "Prefix/dictionary? → Trie O(word length)",
        "Range queries? → Segment Tree or Prefix Sum",
      ],
    },
    {
      question: "Is it about GENERATING?",
      options: [
        "All subsets? → Backtracking (i + 1)",
        "All permutations? → Backtracking (visited[])",
        "Combinations with sum? → Backtracking + Pruning",
        "Count ways? → DP (not backtracking)",
      ],
    },
    {
      question: "Is it about OPTIMIZATION?",
      options: [
        "Overlapping subproblems? → DP",
        "Greedy choice works? → Greedy",
        "Pick/skip items? → 0/1 Knapsack DP",
        "Unlimited items? → Unbounded Knapsack DP",
      ],
    },
    {
      question: "Is it about GRAPHS/TREES?",
      options: [
        "Shortest path (unweighted)? → BFS",
        "Shortest path (weighted)? → Dijkstra",
        "Ordering/dependencies? → Topological Sort",
        "Connectivity? → Union-Find or DFS",
        "Level-order? → BFS, Path/sum? → DFS",
      ],
    },
    {
      question: "Is it about SEQUENCES?",
      options: [
        "Matching pairs? → Stack",
        "Next greater/smaller? → Monotonic Stack",
        "Merge sorted? → Two Pointers or Heap",
        "Streaming K-th? → Heap",
      ],
    },
  ];

  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-white mb-4">Quick Decision Tree</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {decisions.map((d, i) => (
          <div key={i} className="p-4 bg-gray-900 rounded-xl border border-gray-800">
            <h3 className="font-semibold text-indigo-400 mb-2">{d.question}</h3>
            <ul className="space-y-1">
              {d.options.map((opt, j) => (
                <li key={j} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-gray-500">├</span>
                  {opt}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function ComplexityReference() {
  const complexities = [
    { pattern: "Two Pointers", time: "O(n)", space: "O(1)" },
    { pattern: "Sliding Window", time: "O(n)", space: "O(k)" },
    { pattern: "Prefix Sum", time: "O(n) / O(1)", space: "O(n)" },
    { pattern: "Hash Map", time: "O(n) avg", space: "O(n)" },
    { pattern: "Binary Search", time: "O(log n)", space: "O(1)" },
    { pattern: "Stack", time: "O(n)", space: "O(n)" },
    { pattern: "Tree DFS", time: "O(n)", space: "O(h)" },
    { pattern: "Tree BFS", time: "O(n)", space: "O(w)" },
    { pattern: "Graph BFS/DFS", time: "O(V+E)", space: "O(V+E)" },
    { pattern: "Dijkstra", time: "O((V+E)logV)", space: "O(V)" },
    { pattern: "Top K (Heap)", time: "O(n log k)", space: "O(k)" },
    { pattern: "DP 1D", time: "O(n)", space: "O(n) or O(1)" },
    { pattern: "DP 2D", time: "O(n*m)", space: "O(n*m)" },
    { pattern: "Backtracking (subsets)", time: "O(2^n)", space: "O(n)" },
    { pattern: "Backtracking (perms)", time: "O(n!)", space: "O(n)" },
    { pattern: "Trie", time: "O(L) per op", space: "O(N*L)" },
    { pattern: "Union-Find", time: "O(α(n)) ≈ O(1)", space: "O(n)" },
  ];

  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-white mb-4">Complexity Reference</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-2 px-3 text-gray-400 font-medium">Pattern</th>
              <th className="text-left py-2 px-3 text-gray-400 font-medium">Time</th>
              <th className="text-left py-2 px-3 text-gray-400 font-medium">Space</th>
            </tr>
          </thead>
          <tbody>
            {complexities.map((c, i) => (
              <tr key={i} className="border-b border-gray-800">
                <td className="py-2 px-3 text-gray-300">{c.pattern}</td>
                <td className="py-2 px-3 text-green-400 font-mono text-xs">{c.time}</td>
                <td className="py-2 px-3 text-blue-400 font-mono text-xs">{c.space}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function CommonMistakes() {
  const mistakes = [
    { pattern: "Two Pointers", mistake: "Forgetting to sort the array first" },
    { pattern: "Sliding Window", mistake: "Update result INSIDE while for min, AFTER for max" },
    { pattern: "Prefix Sum", mistake: "Must initialize map.put(0, 1) for subarrays from index 0" },
    { pattern: "Binary Search", mistake: "Use left + (right-left)/2 to avoid integer overflow" },
    { pattern: "Stack", mistake: "Decreasing stack for next greater, increasing for next smaller" },
    { pattern: "Linked List", mistake: "Always use dummy node when head might change" },
    { pattern: "Trees", mistake: "BST inorder = sorted; validate with min/max bounds" },
    { pattern: "Graphs", mistake: "BFS for shortest path, not DFS (DFS gives A path)" },
    { pattern: "Heap", mistake: "K largest = min-heap, K smallest = max-heap" },
    { pattern: "DP Knapsack", mistake: "0/1: reverse loop, Unbounded: forward loop" },
    { pattern: "Backtracking", mistake: "Must undo choice after recursive call returns" },
    { pattern: "Intervals", mistake: "Sort by start to merge, by end to maximize non-overlap" },
    { pattern: "Union-Find", mistake: "Must use path compression for O(1) amortized" },
    { pattern: "Trie", mistake: "isEnd flag distinguishes complete words from prefixes" },
  ];

  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-white mb-4">Common Mistakes to Avoid</h2>
      <div className="grid md:grid-cols-2 gap-2">
        {mistakes.map((m, i) => (
          <div
            key={i}
            className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg flex items-start gap-3"
          >
            <span className="text-red-400 font-medium min-w-[110px]">{m.pattern}</span>
            <span className="text-gray-300 text-sm">{m.mistake}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
