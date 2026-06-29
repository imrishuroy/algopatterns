"use client";

import { useState } from "react";
import CodeBlock from "@/components/ui/CodeBlock";
import LanguageToggle from "@/components/ui/LanguageToggle";

type Language = "java" | "python" | "javascript";
type Tab = "cheatsheet" | "constraints" | "patterns" | "keywords";

export default function PatternRecognitionPage() {
  const [activeTab, setActiveTab] = useState<Tab>("cheatsheet");
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [currentLang, setCurrentLang] = useState<Language>("java");

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 md:py-8">
      {/* Header */}
      <div className="text-center mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Pattern Recognition Guide
        </h1>
        <p className="text-gray-400 text-sm md:text-base">
          Learn to identify the right approach for any coding problem
        </p>
      </div>

      {/* Simple Tab Navigation */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {[
          { id: "cheatsheet", label: "Quick Cheatsheet" },
          { id: "constraints", label: "By Constraints" },
          { id: "patterns", label: "By Pattern" },
          { id: "keywords", label: "By Keywords" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`px-4 py-2 rounded-md font-medium whitespace-nowrap transition ${
              activeTab === tab.id
                ? "bg-indigo-500 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "cheatsheet" && <CheatsheetTab />}
      {activeTab === "constraints" && (
        <ConstraintsTab
          currentLang={currentLang}
          setCurrentLang={setCurrentLang}
        />
      )}
      {activeTab === "patterns" && (
        <PatternsTab
          selectedPattern={selectedPattern}
          setSelectedPattern={setSelectedPattern}
          currentLang={currentLang}
          setCurrentLang={setCurrentLang}
        />
      )}
      {activeTab === "keywords" && <KeywordsTab />}
    </div>
  );
}

function CheatsheetTab() {
  return (
    <div className="space-y-6">
      {/* The Golden Rule */}
      <div className="p-6 bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-md border border-amber-500/30">
        <h2 className="text-xl font-bold text-amber-400 mb-4">
          The Golden Rule: Check Constraints First
        </h2>
        <p className="text-gray-300 mb-4">
          Before anything else, look at the input size. This tells you which
          algorithms are even possible.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 bg-gray-900/50 rounded-md text-center">
            <div className="text-red-400 font-mono font-bold">n ≤ 20</div>
            <div className="text-sm text-gray-400 mt-1">Brute force OK</div>
            <div className="text-xs text-gray-500">O(2ⁿ), O(n!)</div>
          </div>
          <div className="p-3 bg-gray-900/50 rounded-md text-center">
            <div className="text-orange-400 font-mono font-bold">n ≤ 3000</div>
            <div className="text-sm text-gray-400 mt-1">Nested loops OK</div>
            <div className="text-xs text-gray-500">O(n²)</div>
          </div>
          <div className="p-3 bg-gray-900/50 rounded-md text-center">
            <div className="text-green-400 font-mono font-bold">n ≤ 10⁶</div>
            <div className="text-sm text-gray-400 mt-1">Single loop</div>
            <div className="text-xs text-gray-500">O(n), O(n log n)</div>
          </div>
          <div className="p-3 bg-gray-900/50 rounded-md text-center">
            <div className="text-blue-400 font-mono font-bold">n &gt; 10⁶</div>
            <div className="text-sm text-gray-400 mt-1">Math/Binary Search</div>
            <div className="text-xs text-gray-500">O(log n), O(1)</div>
          </div>
        </div>
      </div>

      {/* Quick Pattern Lookup */}
      <div className="p-6 bg-gray-900 rounded-md border border-gray-800">
        <h2 className="text-xl font-bold text-white mb-4">
          Quick Pattern Lookup
        </h2>

        <div className="space-y-4">
          {/* By Input Type */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
              If you see this input...
            </h3>
            <div className="grid md:grid-cols-2 gap-2">
              {[
                {
                  input: "Sorted array",
                  patterns: "Binary Search, Two Pointers",
                },
                {
                  input: "Unsorted array",
                  patterns: "HashMap, Sort first, Sliding Window",
                },
                {
                  input: "String",
                  patterns: "Two Pointers, Sliding Window, Stack",
                },
                { input: "Tree", patterns: "DFS, BFS, Recursion" },
                { input: "Graph", patterns: "BFS, DFS, Union Find" },
                { input: "2D Grid", patterns: "DFS/BFS, DP" },
                { input: "Linked List", patterns: "Two Pointers (fast/slow)" },
                { input: "Intervals", patterns: "Sort + Greedy" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2 bg-gray-800/50 rounded-md"
                >
                  <span className="text-white font-medium min-w-[100px]">
                    {item.input}
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className="text-indigo-400 text-sm">
                    {item.patterns}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* By Output Type */}
          <div className="pt-4 border-t border-gray-800">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
              If you need this output...
            </h3>
            <div className="grid md:grid-cols-2 gap-2">
              {[
                { output: "All combinations/subsets", pattern: "Backtracking" },
                { output: "Max/Min value", pattern: "DP or Greedy" },
                {
                  output: "True/False (can reach?)",
                  pattern: "DP, BFS, or DFS",
                },
                { output: "Shortest path", pattern: "BFS (unweighted)" },
                { output: "Number of ways", pattern: "DP" },
                {
                  output: "Kth largest/smallest",
                  pattern: "Heap or QuickSelect",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2 bg-gray-800/50 rounded-md"
                >
                  <span className="text-white font-medium min-w-[160px]">
                    {item.output}
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className="text-emerald-400 text-sm">
                    {item.pattern}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Decision Flowchart */}
      <div className="p-6 bg-gray-900 rounded-md border border-gray-800">
        <h2 className="text-xl font-bold text-white mb-4">
          Simple Decision Flow
        </h2>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              1
            </div>
            <div>
              <span className="text-white font-medium">Check n</span>
              <span className="text-gray-400 ml-2">
                → Eliminates impossible approaches
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              2
            </div>
            <div>
              <span className="text-white font-medium">Look at input type</span>
              <span className="text-gray-400 ml-2">
                → Array? Tree? Graph? String?
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              3
            </div>
            <div>
              <span className="text-white font-medium">
                Check what output is needed
              </span>
              <span className="text-gray-400 ml-2">
                → Single number? List? Boolean?
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              4
            </div>
            <div>
              <span className="text-white font-medium">Spot keywords</span>
              <span className="text-gray-400 ml-2">
                → &quot;Shortest&quot;, &quot;All combinations&quot;,
                &quot;Maximum&quot;
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConstraintsTab({
  currentLang,
  setCurrentLang,
}: {
  currentLang: Language;
  setCurrentLang: (l: Language) => void;
}) {
  const [selected, setSelected] = useState<string>("small");

  const data: Record<
    string,
    {
      title: string;
      range: string;
      desc: string;
      algos: string[];
      code: Record<Language, string>;
    }
  > = {
    small: {
      title: "Small n (≤ 20)",
      range: "n ≤ 20",
      desc: "You can try every possibility. Brute force, recursion, and backtracking work fine here.",
      algos: [
        "Backtracking",
        "Recursion",
        "Generate all subsets (2ⁿ)",
        "Generate all permutations (n!)",
      ],
      code: {
        java: `// Generate all subsets - O(2^n)
void subsets(int[] nums, int i, List<Integer> curr) {
    if (i == nums.length) {
        result.add(new ArrayList<>(curr));
        return;
    }
    // Choice 1: skip nums[i]
    subsets(nums, i + 1, curr);
    // Choice 2: include nums[i]
    curr.add(nums[i]);
    subsets(nums, i + 1, curr);
    curr.remove(curr.size() - 1);
}`,
        python: `# Generate all subsets - O(2^n)
def subsets(nums, i, curr, result):
    if i == len(nums):
        result.append(curr[:])
        return
    # Choice 1: skip nums[i]
    subsets(nums, i + 1, curr, result)
    # Choice 2: include nums[i]
    curr.append(nums[i])
    subsets(nums, i + 1, curr, result)
    curr.pop()`,
        javascript: `// Generate all subsets - O(2^n)
function subsets(nums, i, curr, result) {
    if (i === nums.length) {
        result.push([...curr]);
        return;
    }
    // Choice 1: skip nums[i]
    subsets(nums, i + 1, curr, result);
    // Choice 2: include nums[i]
    curr.push(nums[i]);
    subsets(nums, i + 1, curr, result);
    curr.pop();
}`,
      },
    },
    medium: {
      title: "Medium n (≤ 3000)",
      range: "n ≤ 3000",
      desc: "Nested loops are OK. O(n²) solutions will pass.",
      algos: ["Two nested loops", "Simple DP", "Compare all pairs"],
      code: {
        java: `// Two Sum (brute force) - O(n²)
int[] twoSum(int[] nums, int target) {
    for (int i = 0; i < nums.length; i++) {
        for (int j = i + 1; j < nums.length; j++) {
            if (nums[i] + nums[j] == target) {
                return new int[]{i, j};
            }
        }
    }
    return new int[]{-1, -1};
}`,
        python: `# Two Sum (brute force) - O(n²)
def two_sum(nums, target):
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return [-1, -1]`,
        javascript: `// Two Sum (brute force) - O(n²)
function twoSum(nums, target) {
    for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) {
            if (nums[i] + nums[j] === target) {
                return [i, j];
            }
        }
    }
    return [-1, -1];
}`,
      },
    },
    large: {
      title: "Large n (≤ 10⁶)",
      range: "n ≤ 10⁶",
      desc: "Need O(n) or O(n log n). Use single loops, sorting, or hash maps.",
      algos: [
        "Single loop",
        "Two Pointers",
        "Sliding Window",
        "HashMap",
        "Sorting",
      ],
      code: {
        java: `// Two Sum (optimized) - O(n)
int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> map = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        int need = target - nums[i];
        if (map.containsKey(need)) {
            return new int[]{map.get(need), i};
        }
        map.put(nums[i], i);
    }
    return new int[]{-1, -1};
}`,
        python: `# Two Sum (optimized) - O(n)
def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        need = target - num
        if need in seen:
            return [seen[need], i]
        seen[num] = i
    return [-1, -1]`,
        javascript: `// Two Sum (optimized) - O(n)
function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const need = target - nums[i];
        if (map.has(need)) {
            return [map.get(need), i];
        }
        map.set(nums[i], i);
    }
    return [-1, -1];
}`,
      },
    },
    huge: {
      title: "Huge n (> 10⁶)",
      range: "n > 10⁶",
      desc: "Need O(log n) or O(1). Binary search or math formulas only.",
      algos: ["Binary Search", "Math formulas", "Bit manipulation"],
      code: {
        java: `// Binary Search - O(log n)
int search(int[] nums, int target) {
    int left = 0, right = nums.length - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] == target) return mid;
        if (nums[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`,
        python: `# Binary Search - O(log n)
def search(nums, target):
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
        javascript: `// Binary Search - O(log n)
function search(nums, target) {
    let left = 0, right = nums.length - 1;
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (nums[mid] === target) return mid;
        if (nums[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`,
      },
    },
  };

  const current = data[selected];

  return (
    <div className="space-y-6">
      {/* Selector */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(data).map(([key, val]) => (
          <button
            key={key}
            onClick={() => setSelected(key)}
            className={`px-4 py-2 rounded-md font-medium transition ${
              selected === key
                ? "bg-indigo-500 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            {val.range}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6 bg-gray-900 rounded-md border border-gray-800">
        <h2 className="text-2xl font-bold text-white mb-2">{current.title}</h2>
        <p className="text-gray-400 mb-4">{current.desc}</p>

        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Common algorithms:
          </h3>
          <div className="flex flex-wrap gap-2">
            {current.algos.map((algo, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-md text-sm"
              >
                {algo}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
              Example:
            </h3>
            <LanguageToggle
              currentLang={currentLang}
              onChange={(l) => setCurrentLang(l as Language)}
              languages={["java", "python", "javascript"]}
              size="sm"
            />
          </div>
          <CodeBlock code={current.code[currentLang]} language={currentLang} />
        </div>
      </div>
    </div>
  );
}

function PatternsTab({
  selectedPattern,
  setSelectedPattern,
  currentLang,
  setCurrentLang,
}: {
  selectedPattern: string | null;
  setSelectedPattern: (p: string | null) => void;
  currentLang: Language;
  setCurrentLang: (l: Language) => void;
}) {
  const patterns = [
    {
      id: "two-pointers",
      name: "Two Pointers",
      when: "Sorted array, find pairs, palindrome check",
      template: {
        java: `// Two Pointers - find pair with target sum
int left = 0, right = arr.length - 1;
while (left < right) {
    int sum = arr[left] + arr[right];
    if (sum == target) return new int[]{left, right};
    if (sum < target) left++;
    else right--;
}`,
        python: `# Two Pointers - find pair with target sum
left, right = 0, len(arr) - 1
while left < right:
    total = arr[left] + arr[right]
    if total == target:
        return [left, right]
    if total < target:
        left += 1
    else:
        right -= 1`,
        javascript: `// Two Pointers - find pair with target sum
let left = 0, right = arr.length - 1;
while (left < right) {
    const sum = arr[left] + arr[right];
    if (sum === target) return [left, right];
    if (sum < target) left++;
    else right--;
}`,
      },
      problems: ["Two Sum II", "3Sum", "Container With Most Water"],
    },
    {
      id: "sliding-window",
      name: "Sliding Window",
      when: "Subarray/substring problems, contiguous elements",
      template: {
        java: `// Sliding Window - max sum of k elements
int left = 0, sum = 0, maxSum = 0;
for (int right = 0; right < arr.length; right++) {
    sum += arr[right];
    if (right - left + 1 == k) {
        maxSum = Math.max(maxSum, sum);
        sum -= arr[left];
        left++;
    }
}`,
        python: `# Sliding Window - max sum of k elements
left = 0
curr_sum = max_sum = 0
for right in range(len(arr)):
    curr_sum += arr[right]
    if right - left + 1 == k:
        max_sum = max(max_sum, curr_sum)
        curr_sum -= arr[left]
        left += 1`,
        javascript: `// Sliding Window - max sum of k elements
let left = 0, sum = 0, maxSum = 0;
for (let right = 0; right < arr.length; right++) {
    sum += arr[right];
    if (right - left + 1 === k) {
        maxSum = Math.max(maxSum, sum);
        sum -= arr[left];
        left++;
    }
}`,
      },
      problems: [
        "Maximum Subarray",
        "Longest Substring Without Repeating Characters",
      ],
    },
    {
      id: "binary-search",
      name: "Binary Search",
      when: "Sorted array, find target, minimize/maximize answer",
      template: {
        java: `// Binary Search
int left = 0, right = arr.length - 1;
while (left <= right) {
    int mid = left + (right - left) / 2;
    if (arr[mid] == target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
}
return -1;`,
        python: `# Binary Search
left, right = 0, len(arr) - 1
while left <= right:
    mid = (left + right) // 2
    if arr[mid] == target:
        return mid
    if arr[mid] < target:
        left = mid + 1
    else:
        right = mid - 1
return -1`,
        javascript: `// Binary Search
let left = 0, right = arr.length - 1;
while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
}
return -1;`,
      },
      problems: ["Binary Search", "Search in Rotated Sorted Array"],
    },
    {
      id: "bfs-dfs",
      name: "BFS / DFS",
      when: "Trees, graphs, grids, shortest path, connected components",
      template: {
        java: `// BFS - shortest path
Queue<int[]> queue = new LinkedList<>();
queue.add(new int[]{startRow, startCol, 0});
visited[startRow][startCol] = true;

while (!queue.isEmpty()) {
    int[] curr = queue.poll();
    if (isTarget(curr)) return curr[2]; // distance

    for (int[] dir : directions) {
        int nr = curr[0] + dir[0];
        int nc = curr[1] + dir[1];
        if (isValid(nr, nc) && !visited[nr][nc]) {
            visited[nr][nc] = true;
            queue.add(new int[]{nr, nc, curr[2] + 1});
        }
    }
}`,
        python: `# BFS - shortest path
from collections import deque
queue = deque([(start_row, start_col, 0)])
visited = {(start_row, start_col)}

while queue:
    row, col, dist = queue.popleft()
    if is_target(row, col):
        return dist

    for dr, dc in directions:
        nr, nc = row + dr, col + dc
        if is_valid(nr, nc) and (nr, nc) not in visited:
            visited.add((nr, nc))
            queue.append((nr, nc, dist + 1))`,
        javascript: `// BFS - shortest path
const queue = [[startRow, startCol, 0]];
visited[startRow][startCol] = true;

while (queue.length > 0) {
    const [row, col, dist] = queue.shift();
    if (isTarget(row, col)) return dist;

    for (const [dr, dc] of directions) {
        const nr = row + dr, nc = col + dc;
        if (isValid(nr, nc) && !visited[nr][nc]) {
            visited[nr][nc] = true;
            queue.push([nr, nc, dist + 1]);
        }
    }
}`,
      },
      problems: ["Number of Islands", "Word Ladder", "Binary Tree Level Order"],
    },
    {
      id: "dp",
      name: "Dynamic Programming",
      when: '"Number of ways", "Maximum/minimum", overlapping subproblems',
      template: {
        java: `// DP - Climbing Stairs (how many ways?)
int[] dp = new int[n + 1];
dp[0] = 1;
dp[1] = 1;
for (int i = 2; i <= n; i++) {
    dp[i] = dp[i-1] + dp[i-2];
}
return dp[n];`,
        python: `# DP - Climbing Stairs (how many ways?)
dp = [0] * (n + 1)
dp[0] = dp[1] = 1
for i in range(2, n + 1):
    dp[i] = dp[i-1] + dp[i-2]
return dp[n]`,
        javascript: `// DP - Climbing Stairs (how many ways?)
const dp = new Array(n + 1).fill(0);
dp[0] = dp[1] = 1;
for (let i = 2; i <= n; i++) {
    dp[i] = dp[i-1] + dp[i-2];
}
return dp[n];`,
      },
      problems: ["Climbing Stairs", "House Robber", "Coin Change"],
    },
    {
      id: "backtracking",
      name: "Backtracking",
      when: "Generate all combinations/permutations, small n (≤20)",
      template: {
        java: `// Backtracking - generate subsets
void backtrack(int[] nums, int start, List<Integer> curr) {
    result.add(new ArrayList<>(curr));

    for (int i = start; i < nums.length; i++) {
        curr.add(nums[i]);       // choose
        backtrack(nums, i + 1, curr);  // explore
        curr.remove(curr.size() - 1);  // un-choose
    }
}`,
        python: `# Backtracking - generate subsets
def backtrack(start, curr):
    result.append(curr[:])

    for i in range(start, len(nums)):
        curr.append(nums[i])    # choose
        backtrack(i + 1, curr)  # explore
        curr.pop()              # un-choose`,
        javascript: `// Backtracking - generate subsets
function backtrack(start, curr) {
    result.push([...curr]);

    for (let i = start; i < nums.length; i++) {
        curr.push(nums[i]);      // choose
        backtrack(i + 1, curr);  // explore
        curr.pop();              // un-choose
    }
}`,
      },
      problems: ["Subsets", "Permutations", "Combination Sum"],
    },
    {
      id: "heap",
      name: "Heap",
      when: "K largest/smallest, median, priority scheduling",
      template: {
        java: `// Heap - find K largest elements
PriorityQueue<Integer> minHeap = new PriorityQueue<>();
for (int num : nums) {
    minHeap.add(num);
    if (minHeap.size() > k) {
        minHeap.poll();  // remove smallest
    }
}
// minHeap now contains k largest elements`,
        python: `# Heap - find K largest elements
import heapq
min_heap = []
for num in nums:
    heapq.heappush(min_heap, num)
    if len(min_heap) > k:
        heapq.heappop(min_heap)  # remove smallest
# min_heap now contains k largest elements`,
        javascript: `// Heap - find K largest elements
// Note: JS doesn't have built-in heap, use array + sort
// Or use a library. Here's the concept:
const result = [];
for (const num of nums) {
    result.push(num);
    result.sort((a, b) => a - b);
    if (result.length > k) result.shift();
}
// result contains k largest elements`,
      },
      problems: [
        "Kth Largest Element",
        "Top K Frequent Elements",
        "Merge K Sorted Lists",
      ],
    },
    {
      id: "expand-center",
      name: "Expand Around Center",
      when: "Palindrome substrings, longest palindrome, O(1) space vs O(n²) DP",
      template: {
        java: `// Expand Around Center - O(n²) time, O(1) space
// For each center, expand outward while chars match
public String longestPalindrome(String s) {
    int start = 0, end = 0;
    for (int i = 0; i < s.length(); i++) {
        int len1 = expand(s, i, i);     // odd length
        int len2 = expand(s, i, i + 1); // even length
        int len = Math.max(len1, len2);
        if (len > end - start) {
            start = i - (len - 1) / 2;
            end = i + len / 2;
        }
    }
    return s.substring(start, end + 1);
}

int expand(String s, int l, int r) {
    while (l >= 0 && r < s.length() && s.charAt(l) == s.charAt(r)) {
        l--; r++;
    }
    return r - l - 1;
}`,
        python: `# Expand Around Center - O(n²) time, O(1) space
def longestPalindrome(s):
    def expand(l, r):
        while l >= 0 and r < len(s) and s[l] == s[r]:
            l -= 1
            r += 1
        return r - l - 1

    start = end = 0
    for i in range(len(s)):
        len1 = expand(i, i)      # odd length
        len2 = expand(i, i + 1)  # even length
        max_len = max(len1, len2)
        if max_len > end - start:
            start = i - (max_len - 1) // 2
            end = i + max_len // 2
    return s[start:end + 1]`,
        javascript: `// Expand Around Center - O(n²) time, O(1) space
function longestPalindrome(s) {
    const expand = (l, r) => {
        while (l >= 0 && r < s.length && s[l] === s[r]) {
            l--; r++;
        }
        return r - l - 1;
    };

    let start = 0, end = 0;
    for (let i = 0; i < s.length; i++) {
        const len1 = expand(i, i);     // odd length
        const len2 = expand(i, i + 1); // even length
        const len = Math.max(len1, len2);
        if (len > end - start) {
            start = i - Math.floor((len - 1) / 2);
            end = i + Math.floor(len / 2);
        }
    }
    return s.substring(start, end + 1);
}`,
      },
      problems: [
        "Longest Palindromic Substring",
        "Palindromic Substrings",
        "Valid Palindrome II",
      ],
    },
  ];

  const selected = patterns.find((p) => p.id === selectedPattern);

  return (
    <div className="space-y-6">
      {/* Pattern Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {patterns.map((pattern) => (
          <button
            key={pattern.id}
            onClick={() =>
              setSelectedPattern(
                selectedPattern === pattern.id ? null : pattern.id
              )
            }
            className={`p-4 rounded-md border text-left transition ${
              selectedPattern === pattern.id
                ? "bg-indigo-500/20 border-indigo-500"
                : "bg-gray-900 border-gray-800 hover:border-gray-700"
            }`}
          >
            <div className="font-medium text-white">{pattern.name}</div>
          </button>
        ))}
      </div>

      {/* Selected Pattern Detail */}
      {selected && (
        <div className="p-6 bg-gray-900 rounded-md border border-gray-800 animate-fade-in">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white">{selected.name}</h2>
            <p className="text-gray-400 text-sm">{selected.when}</p>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                Template:
              </h3>
              <LanguageToggle
                currentLang={currentLang}
                onChange={(l) => setCurrentLang(l as Language)}
                languages={["java", "python", "javascript"]}
                size="sm"
              />
            </div>
            <CodeBlock
              code={selected.template[currentLang]}
              language={currentLang}
            />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Practice:
            </h3>
            <div className="flex flex-wrap gap-2">
              {selected.problems.map((problem, i) => {
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
                    className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-md text-sm transition"
                  >
                    {problem}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {!selected && (
        <div className="text-center py-12 text-gray-500">
          Click a pattern above to see details
        </div>
      )}
    </div>
  );
}

function KeywordsTab() {
  const keywords = [
    {
      category: "Dynamic Programming",
      color: "indigo",
      words: [
        "Number of ways",
        "Maximum profit",
        "Minimum cost",
        "Can you reach",
        "Longest/Shortest",
      ],
    },
    {
      category: "Two Pointers",
      color: "purple",
      words: [
        "Sorted array",
        "Palindrome",
        "Two sum (sorted)",
        "Remove duplicates",
      ],
    },
    {
      category: "Sliding Window",
      color: "emerald",
      words: ["Substring", "Subarray", "Consecutive", "Window", "Contiguous"],
    },
    {
      category: "BFS",
      color: "cyan",
      words: ["Shortest path", "Level order", "Nearest", "Minimum steps"],
    },
    {
      category: "DFS / Backtracking",
      color: "rose",
      words: [
        "All combinations",
        "All permutations",
        "All paths",
        "Generate all",
      ],
    },
    {
      category: "Heap",
      color: "green",
      words: ["K largest", "K smallest", "Top K", "Median", "Priority"],
    },
    {
      category: "Stack",
      color: "yellow",
      words: ["Parentheses", "Brackets", "Valid expression", "Next greater"],
    },
    {
      category: "HashMap",
      color: "blue",
      words: ["Frequency", "Count", "Anagram", "Two sum (unsorted)"],
    },
    {
      category: "Binary Search",
      color: "violet",
      words: ["Sorted", "Search", "Kth element", "Minimize maximum"],
    },
    {
      category: "Union Find",
      color: "red",
      words: ["Connected components", "Groups", "Islands", "Friends"],
    },
  ];

  const colorMap: Record<string, string> = {
    indigo: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    emerald: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    cyan: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    rose: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    green: "bg-green-500/20 text-green-400 border-green-500/30",
    yellow: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    violet: "bg-violet-500/20 text-violet-400 border-violet-500/30",
    red: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  return (
    <div className="space-y-4">
      <p className="text-gray-400 mb-6">
        When you see these words in a problem, they usually hint at specific
        patterns:
      </p>

      {keywords.map((group, i) => (
        <div
          key={i}
          className={`p-4 rounded-md border ${colorMap[group.color]}`}
        >
          <div className="font-semibold mb-2">{group.category}</div>
          <div className="flex flex-wrap gap-2">
            {group.words.map((word, j) => (
              <span key={j} className="px-2 py-1 bg-black/20 rounded-md text-sm">
                &quot;{word}&quot;
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
