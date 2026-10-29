"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import LanguageToggle from "@/components/ui/LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { SupportedLanguage } from "@/types";

const CodeBlock = dynamic(() => import("@/components/ui/CodeBlock"), {
  loading: () => (
    <div
      className="h-32 rounded-md animate-pulse"
      style={{ background: "var(--bg-elevated)" }}
    />
  ),
});

const CONSTRAINTS = [
  {
    id: "c1",
    size: "n ≤ 15",
    complexity: "O(n!) or O(2^n)",
    what: "Brute force, backtracking, all permutations",
  },
  {
    id: "c2",
    size: "n ≤ 20",
    complexity: "O(2^n)",
    what: "Backtracking, recursion, bitmask DP",
  },
  {
    id: "c3",
    size: "n ≤ 100",
    complexity: "O(n³)",
    what: "Triple nested loops, Floyd-Warshall",
  },
  {
    id: "c4",
    size: "n ≤ 1,000",
    complexity: "O(n²)",
    what: "Nested loops, simple DP",
  },
  {
    id: "c5",
    size: "n ≤ 100,000",
    complexity: "O(n log n)",
    what: "Sorting, heap, binary search",
  },
  {
    id: "c6",
    size: "n ≤ 1,000,000",
    complexity: "O(n)",
    what: "Single pass, two pointers, sliding window",
  },
  {
    id: "c7",
    size: "n > 10^7",
    complexity: "O(log n) or O(1)",
    what: "Binary search, math formula",
  },
];

const PATTERN_MAPPINGS = [
  {
    id: "m1",
    problem: "Sorted array, find pair",
    pattern: "Two Pointers",
    time: "O(n)",
    space: "O(1)",
  },
  {
    id: "m2",
    problem: "Contiguous subarray/substring",
    pattern: "Sliding Window",
    time: "O(n)",
    space: "O(k)",
  },
  {
    id: "m3",
    problem: "Range sum queries",
    pattern: "Prefix Sum",
    time: "O(1) query",
    space: "O(n)",
  },
  {
    id: "m4",
    problem: "Find complement/duplicates",
    pattern: "Hash Map",
    time: "O(n)",
    space: "O(n)",
  },
  {
    id: "m5",
    problem: "Search sorted/find boundary",
    pattern: "Binary Search",
    time: "O(log n)",
    space: "O(1)",
  },
  {
    id: "m6",
    problem: "Matching brackets/NGE",
    pattern: "Stack",
    time: "O(n)",
    space: "O(n)",
  },
  {
    id: "m7",
    problem: "In-place reversal/cycle",
    pattern: "Linked List",
    time: "O(n)",
    space: "O(1)",
  },
  {
    id: "m8",
    problem: "Tree traversal/path",
    pattern: "DFS/BFS",
    time: "O(n)",
    space: "O(h)",
  },
  {
    id: "m9",
    problem: "Connectivity/shortest path",
    pattern: "Graphs",
    time: "O(V+E)",
    space: "O(V+E)",
  },
  {
    id: "m10",
    problem: "Top K/streaming median",
    pattern: "Heap",
    time: "O(n log k)",
    space: "O(k)",
  },
  {
    id: "m11",
    problem: "Counting ways/optimization",
    pattern: "DP",
    time: "O(n*m)",
    space: "O(n)",
  },
  {
    id: "m12",
    problem: "Generate all combinations",
    pattern: "Backtracking",
    time: "O(2^n)",
    space: "O(n)",
  },
  {
    id: "m13",
    problem: "Merge/schedule ranges",
    pattern: "Intervals",
    time: "O(n log n)",
    space: "O(n)",
  },
  {
    id: "m14",
    problem: "Prefix search/autocomplete",
    pattern: "Trie",
    time: "O(L)",
    space: "O(N*L)",
  },
  {
    id: "m15",
    problem: "Dynamic connectivity",
    pattern: "Union-Find",
    time: "O(1) amortized",
    space: "O(n)",
  },
  {
    id: "m16",
    problem: "Interval scheduling / maximize non-overlap",
    pattern: "Greedy",
    time: "O(n log n)",
    space: "O(1)",
  },
  {
    id: "m18",
    problem: "Max subarray / running sum",
    pattern: "Kadane's (Arrays)",
    time: "O(n)",
    space: "O(1)",
  },
  {
    id: "m19",
    problem: "Find unique / cancel duplicates",
    pattern: "Bit Manipulation",
    time: "O(n)",
    space: "O(1)",
  },
];

type CodeMap = { java: string; go: string };

const PATTERNS: {
  id: string;
  name: string;
  when: string;
  time: string;
  space: string;
  coreIdea: string;
  whenToUse: string[];
  keyPoints: string[];
  commonMistakes: string[];
  dontUseWhen: string[];
  variants: { name: string; behavior: string; example: string }[];
  keyTakeaways: string[];
  problems: string[];
  code: CodeMap;
}[] = [
  {
    id: "two-pointers",
    name: "1. Two Pointers",
    when: "Sorted array, pairs, palindrome, partitioning",
    time: "O(n)",
    space: "O(1)",
    coreIdea:
      "Two pointers eliminate the inner loop by using sorted order as a decision rule. When you have a sorted array and need pairs or triplets, you place one pointer at each end and move inward: sum too small means move the left pointer right, sum too large means move the right pointer left. This reduces O(n²) brute force to a single O(n) pass.",
    whenToUse: [
      "Sorted array with pair or triplet sum problems",
      "Finding pairs with a target sum in O(n) instead of O(n²)",
      "Removing duplicates or compacting an array in-place",
      "Palindrome checking and string or array validation",
      "Container or area problems where shrinking the range improves the answer",
      "Partitioning arrays (Dutch National Flag, 3-way partition)",
      "Cycle detection in linked lists (fast/slow pointer variant)",
    ],
    keyPoints: [
      "Works best on sorted arrays: reduces O(n²) to O(n)",
      "Opposite direction: start from both ends, move inward",
      "Same direction (fast/slow): in-place modifications, cycle detection",
      "For 3Sum: fix one element with outer loop, two pointers for the rest",
      "Floyd's: when fast/slow meet, reset one to head and step both by 1 to find cycle start",
    ],
    commonMistakes: [
      "Forgetting to sort the array first when the problem requires sorted order",
      "Using wrong comparison (< vs <=) causing infinite loops or missed elements",
      "Not skipping duplicates in 3Sum-type problems: after picking nums[i], skip if nums[i] == nums[i-1]",
      "Floyd's cycle start: after the meeting point, reset one pointer to head and step BOTH by 1 (not 2)",
    ],
    dontUseWhen: [
      "The array cannot be sorted and original indices must be preserved",
      "You need all pairs in an unsorted array, not just a check for existence (use a hash map instead)",
      "The problem involves non-contiguous elements or independent ranges (prefix sum or hash map fits better)",
      "The two sequences come from completely separate arrays with no ordering relationship",
    ],
    variants: [
      {
        name: "Opposite direction",
        behavior:
          "Start one pointer at index 0 and one at the last index, converge inward until they meet",
        example: "Two Sum II, 3Sum, Container With Most Water, Valid Palindrome",
      },
      {
        name: "Same direction (fast/slow)",
        behavior:
          "Both start at the same end; slow marks the write position, fast scans ahead",
        example: "Remove Duplicates from Sorted Array, Move Zeroes",
      },
      {
        name: "Floyd's cycle detection",
        behavior:
          "Slow moves one step, fast moves two; after meeting reset one pointer to head then step both by one",
        example:
          "Linked List Cycle, Linked List Cycle II, Find the Duplicate Number",
      },
    ],
    keyTakeaways: [
      "Sort first when allowed: sorted order gives you a guaranteed decision rule at each step",
      "Opposite direction shrinks the search space every step because the sum changes predictably",
      "Same direction compacts an array in-place in O(n) time and O(1) space",
      "For 3Sum, fix one element with the outer loop and run opposite-direction pointers for the rest",
      "After Floyd's meeting point, reset one pointer to head and step both by one to find the cycle entry",
    ],
    problems: [
      "Two Sum II",
      "3Sum",
      "Container With Most Water",
      "Valid Palindrome",
      "Remove Duplicates",
    ],
    code: {
      java: `// Time: O(n)  Space: O(1)

// TWO SUM II
// Problem: Given a sorted integer array and a target, return the indices of the two numbers
//          that add up to target. Exactly one solution exists; cannot use the same element twice.
// Intuition: sorted order gives a direction rule; each comparison eliminates one element.
// Steps:
//   1. Place left=0, right=arr.length-1
//   2. Compute sum = arr[left] + arr[right]
//   3. If sum==target, return [left, right]
//   4. If sum<target, move left right (need larger value)
//   5. If sum>target, move right left (need smaller value)
int left = 0, right = arr.length - 1;
while (left < right) {
    int sum = arr[left] + arr[right];
    if (sum == target) return new int[]{left, right};
    else if (sum < target) left++;   // sum too small: need a bigger left value
    else right--;                    // sum too big: need a smaller right value
}

// REMOVE DUPLICATES FROM SORTED ARRAY
// Problem: Given a sorted array, remove duplicates in-place and return the new length.
//          The relative order must be kept; extra space is not allowed.
// Intuition: slow is the write head; fast finds the next unique value.
// Steps:
//   1. slow=0, fast=1
//   2. If nums[fast] != nums[slow], increment slow, write nums[fast] there
//   3. Always increment fast
//   4. Return slow+1 (new length)
int slow = 0;
for (int fast = 1; fast < nums.length; fast++) {
    if (nums[fast] != nums[slow]) {
        nums[++slow] = nums[fast];
    }
}
return slow + 1;  // new length

// 3SUM
// Problem: Given an integer array, return all unique triplets [a, b, c] where a + b + c == 0.
//          The result must not contain duplicate triplets.
// Intuition: fix one element, reduce to 2Sum on the remaining sorted subarray.
// Steps:
//   1. Sort the array
//   2. For each i, skip if nums[i]==nums[i-1] (duplicate)
//   3. left=i+1, right=end; run two pointers
//   4. If sum==0, record, skip inner duplicates, advance both
//   5. If sum<0, left++; if sum>0, right--
Arrays.sort(nums);
List<List<Integer>> result = new ArrayList<>();
for (int i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] == nums[i - 1]) continue; // skip outer duplicates
    int left = i + 1, right = nums.length - 1;
    while (left < right) {
        int sum = nums[i] + nums[left] + nums[right];
        if (sum == 0) {
            result.add(Arrays.asList(nums[i], nums[left], nums[right]));
            while (left < right && nums[left] == nums[left + 1]) left++;   // skip inner duplicates
            while (left < right && nums[right] == nums[right - 1]) right--;
            left++; right--;
        } else if (sum < 0) left++;
        else right--;
    }
}

// CONTAINER WITH MOST WATER
// Problem: Given an array of heights representing vertical lines, find two lines that form
//          a container holding the most water. Return the maximum water volume.
// Intuition: moving the shorter side might find a taller wall; moving the taller side never helps.
// Steps:
//   1. left=0, right=height.length-1
//   2. area = min(height[left], height[right]) * (right-left)
//   3. Update maxArea
//   4. Move the shorter side inward
//   5. Repeat until pointers meet
int left = 0, right = height.length - 1, maxArea = 0;
while (left < right) {
    int area = Math.min(height[left], height[right]) * (right - left);
    maxArea = Math.max(maxArea, area);
    if (height[left] < height[right]) left++;  // shorter side limits area, move it
    else right--;
}
return maxArea;

// VALID PALINDROME
// Problem: Given a string, return true if it reads the same forwards and backwards after
//          keeping only alphanumeric characters and ignoring case.
// Intuition: two pointers converge inward; any mismatch rules out a palindrome.
// Steps:
//   1. left=0, right=s.length()-1
//   2. Skip non-alphanumeric from both sides
//   3. Compare chars case-insensitively; if differ, return false
//   4. Advance both pointers; return true when they cross
int left = 0, right = s.length() - 1;
while (left < right) {
    while (left < right && !Character.isLetterOrDigit(s.charAt(left))) left++;
    while (left < right && !Character.isLetterOrDigit(s.charAt(right))) right--;
    if (Character.toLowerCase(s.charAt(left)) != Character.toLowerCase(s.charAt(right)))
        return false;
    left++; right--;
}
return true;

// LINKED LIST CYCLE DETECTION (Floyd's Tortoise and Hare)
// Problem: Given the head of a linked list, return true if there is a cycle in it.
//          A cycle means some node's next pointer points to a previously visited node.
// Intuition: if a cycle exists, the fast pointer will lap the slow pointer.
// Steps:
//   1. Start slow and fast both at head
//   2. Move slow one step, fast two steps
//   3. If fast reaches null, no cycle: return false
//   4. If slow==fast, met inside cycle: return true
ListNode slow = head, fast = head;
while (fast != null && fast.next != null) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow == fast) return true;  // cycle exists
}`,
      go: `// Time: O(n)  Space: O(1)

// TWO SUM II
// Problem: Given a sorted integer array and a target, return the indices of the two numbers
//          that add up to target. Exactly one solution exists; cannot use the same element twice.
// Intuition: sorted order gives a direction rule, so each comparison eliminates one element.
// Steps:
//   1. Place left at start, right at end
//   2. Compute sum = arr[left] + arr[right]
//   3. If sum == target, return both indices
//   4. If sum < target, move left right (need a larger value)
//   5. If sum > target, move right left (need a smaller value)
// Time: O(n)  Space: O(1)
func twoSumSorted(arr []int, target int) (int, int) {
    left, right := 0, len(arr)-1
    for left < right {
        sum := arr[left] + arr[right]
        if sum == target {
            return left, right
        } else if sum < target {
            left++  // sum too small: move left pointer to a larger value
        } else {
            right-- // sum too big: move right pointer to a smaller value
        }
    }
    return -1, -1
}

// REMOVE DUPLICATES FROM SORTED ARRAY
// Problem: Given a sorted array, remove duplicates in-place and return the new length.
//          No extra space allowed; elements beyond the new length do not matter.
// Intuition: slow pointer is the write head; fast scans for the next unique value.
// Steps:
//   1. Start slow=0 (last written unique index), fast=1
//   2. If nums[fast] != nums[slow], advance slow, write nums[fast] there
//   3. Always advance fast
//   4. Return slow+1 (new length, not last index)
// Time: O(n)  Space: O(1)
func removeDuplicates(nums []int) int {
    if len(nums) == 0 {
        return 0
    }
    slow := 0
    for fast := 1; fast < len(nums); fast++ {
        if nums[fast] != nums[slow] {
            slow++
            nums[slow] = nums[fast]
        }
    }
    return slow + 1
}

// 3SUM
// Problem: Given an integer array, return all unique triplets [a, b, c] where a + b + c == 0.
//          The result must not contain duplicate triplets.
// Intuition: fixing one element reduces 3Sum to 2Sum on the remaining sorted subarray.
// Steps:
//   1. Sort the array (enables duplicate skipping and pointer direction rule)
//   2. For each index i, skip if nums[i] == nums[i-1] (outer duplicate)
//   3. Run two pointers on nums[i+1..end]: left=i+1, right=end
//   4. If sum==0, record triplet, skip inner duplicates, advance both pointers
//   5. If sum<0, move left right; if sum>0, move right left
// Time: O(n²)  Space: O(1) excluding output
func threeSum(nums []int) [][]int {
    sort.Ints(nums)
    result := [][]int{}
    for i := 0; i < len(nums)-2; i++ {
        if i > 0 && nums[i] == nums[i-1] {
            continue // skip outer duplicates
        }
        left, right := i+1, len(nums)-1
        for left < right {
            sum := nums[i] + nums[left] + nums[right]
            if sum == 0 {
                result = append(result, []int{nums[i], nums[left], nums[right]})
                for left < right && nums[left] == nums[left+1] {
                    left++ // skip inner left duplicates
                }
                for left < right && nums[right] == nums[right-1] {
                    right-- // skip inner right duplicates
                }
                left++
                right--
            } else if sum < 0 {
                left++
            } else {
                right--
            }
        }
    }
    return result
}

// CONTAINER WITH MOST WATER
// Problem: Given an array of heights, find two lines that together with the x-axis form
//          a container holding the most water. Return the maximum volume.
// Intuition: moving the shorter side might find a taller wall; moving the taller side can never improve.
// Steps:
//   1. Place left at start, right at end
//   2. Compute area = min(height[left], height[right]) * (right - left)
//   3. Update maxArea if this area is larger
//   4. Move the shorter side inward (the taller side limits area, not width)
//   5. Repeat until pointers meet
// Time: O(n)  Space: O(1)
func maxArea(height []int) int {
    left, right, maxA := 0, len(height)-1, 0
    for left < right {
        area := min(height[left], height[right]) * (right - left)
        if area > maxA {
            maxA = area
        }
        if height[left] < height[right] {
            left++  // shorter side limits area, move it inward
        } else {
            right--
        }
    }
    return maxA
}

// VALID PALINDROME
// Problem: Given a string, return true if it reads the same forwards and backwards after
//          keeping only alphanumeric characters and ignoring case.
// Intuition: two pointers converge inward; any mismatch immediately rules out a palindrome.
// Steps:
//   1. Place left at start, right at end
//   2. Skip non-alphanumeric characters from both sides
//   3. Compare chars at left and right case-insensitively
//   4. If they differ, return false
//   5. Advance both pointers inward; return true when pointers cross
// Time: O(n)  Space: O(1)
func isPalindrome(s string) bool {
    left, right := 0, len(s)-1
    for left < right {
        for left < right && !isAlNum(s[left]) {
            left++
        }
        for left < right && !isAlNum(s[right]) {
            right--
        }
        if toLower(s[left]) != toLower(s[right]) {
            return false
        }
        left++
        right--
    }
    return true
}

// isAlNum checks whether a byte is an English letter (a-z, A-Z) or digit (0-9).
// ASCII values: 'a'-'z' = 97-122, 'A'-'Z' = 65-90, '0'-'9' = 48-57.
// Returns true if the byte belongs to any of these ranges.
func isAlNum(c byte) bool {
    return (c >= 'a' && c <= 'z') ||
        (c >= 'A' && c <= 'Z') ||
        (c >= '0' && c <= '9')
}

// toLower converts an uppercase ASCII letter to lowercase.
// In ASCII, lowercase letters are exactly 32 greater than their uppercase counterparts.
// Example: 'A' = 65, 'a' = 97, so 65 + 32 = 97.
// If the byte is not an uppercase letter, return it unchanged.
func toLower(c byte) byte {
    if c >= 'A' && c <= 'Z' {
        return c + 32
    }
    return c
}

// LINKED LIST CYCLE DETECTION (Floyd's Tortoise and Hare)
// Problem: Given the head of a linked list, return true if there is a cycle in it.
//          A cycle means some node's next pointer points back to a previous node.
// Intuition: if a cycle exists, the fast pointer (2 steps) will lap the slow pointer (1 step).
// Steps:
//   1. Start slow and fast both at head
//   2. Move slow one step, fast two steps each iteration
//   3. If fast reaches nil, no cycle: return false
//   4. If slow == fast, they met inside the cycle: return true
// Time: O(n)  Space: O(1)
type ListNode struct {
    Val  int
    Next *ListNode
}

func hasCycle(head *ListNode) bool {
    slow, fast := head, head
    for fast != nil && fast.Next != nil {
        slow = slow.Next
        fast = fast.Next.Next
        if slow == fast {
            return true // they met inside the cycle
        }
    }
    return false
}`,
    },
  },
  {
    id: "sliding-window",
    name: "2. Sliding Window",
    when: "Contiguous subarray/substring, 'consecutive', 'at most K'",
    time: "O(n)",
    space: "O(k) - k is window or charset size",
    coreIdea:
      "A sliding window keeps a running summary over a contiguous range. Every element enters the window exactly once from the right and leaves exactly once from the left, so total work is O(n) regardless of window size. When the window moves right by one, you undo the outgoing left element and add the incoming right element instead of recomputing the whole range from scratch.",
    whenToUse: [
      "Problems about contiguous subarrays or substrings",
      "Finding the longest or shortest subarray satisfying a constraint",
      "Fixed-size window: max or min sum of exactly k elements",
      "Problems with the word 'consecutive' or 'contiguous'",
      "Anagram or permutation finding in strings",
      "Problems with 'at most K distinct' or 'no more than K replacements'",
    ],
    keyPoints: [
      "Window size = right - left + 1",
      "Fixed window: slide by adding right, removing left at i >= k-1",
      "Variable window: expand right freely, shrink left when constraint violated",
      "For MINIMUM length: update result INSIDE while loop (valid window)",
      "For MAXIMUM length: update result AFTER while loop (valid window)",
      "Use HashMap for character frequencies; 'matches' counter avoids full map comparison",
    ],
    commonMistakes: [
      "Forgetting to shrink the window when the constraint is violated (causes wrong answer or infinite loop)",
      "Updating result at the wrong point: inside the while loop for minimum length, outside for maximum",
      "Off-by-one in window size: window length is right - left + 1, not right - left",
      "Not removing the map key when its frequency reaches 0 (leaks stale keys that affect size checks)",
    ],
    dontUseWhen: [
      "Elements can be skipped or are non-contiguous: sliding window only works on unbroken ranges",
      "You need pairs or triplets in a sorted array (two pointers handles this more cleanly)",
      "You need the same range sum for many independent queries on a static array (use prefix sum)",
      "You need the maximum or minimum element inside every window (monotonic deque is faster at O(n))",
    ],
    variants: [
      {
        name: "Fixed size",
        behavior:
          "Window is always exactly K wide; add the right element, remove arr[i - K + 1] once i >= K - 1",
        example: "Maximum Sum Subarray of Size K, Contains Duplicate II",
      },
      {
        name: "Smallest valid window",
        behavior:
          "Shrink from left as soon as the window is valid; update result inside the while loop",
        example:
          "Minimum Window Substring, Smallest Subarray with Sum >= K",
      },
      {
        name: "Largest valid window",
        behavior:
          "Expand right freely; shrink left only when the constraint breaks; update result after the while loop",
        example:
          "Longest Substring Without Repeating Characters, Longest Subarray with at Most K Ones",
      },
      {
        name: "Frequency map window",
        behavior:
          "HashMap tracks character counts; a 'matches' counter avoids scanning the whole map on each step",
        example: "Find All Anagrams in a String, Permutation in String",
      },
    ],
    keyTakeaways: [
      "Window size = right - left + 1",
      "Expand right always, shrink left only when the constraint is broken",
      "Update result inside the while loop for minimum length, after the while loop for maximum length",
      "Fixed window: subtract arr[i - k + 1] instead of rebuilding the sum each time",
      "Use a matches counter with a frequency map to avoid comparing the full map on every step",
    ],
    problems: [
      "Longest Substring Without Repeating",
      "Minimum Window Substring",
      "Find All Anagrams",
      "Max Consecutive Ones III",
    ],
    code: {
      java: `// Time: O(n)  Space: O(k)  (k is window or charset size)

// VARIABLE SIZE WINDOW
// Problem: Given a string and integer k, find the length of the longest substring
//          containing at most k distinct characters.
// Intuition: expand right always; shrink left only when distinct chars exceed k.
// Steps:
//   1. Expand right: add s[right] to freq map
//   2. Shrink left while freq.size() > k: remove s[left], delete if count hits 0, advance left
//   3. Update maxLen = max(maxLen, right-left+1)
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

// FIXED SIZE WINDOW
// Problem: Given an integer array and a window size k, find the maximum sum of any
//          contiguous subarray of exactly k elements.
// Intuition: slide by adding the incoming right element and subtracting the outgoing left element.
// Steps:
//   1. Accumulate windowSum for first k elements
//   2. For each i >= k: windowSum += arr[i] - arr[i-k+1]; update maxSum
int windowSum = 0, maxSum = 0;
for (int i = 0; i < arr.length; i++) {
    windowSum += arr[i];
    if (i >= k - 1) {
        maxSum = Math.max(maxSum, windowSum);
        windowSum -= arr[i - k + 1];
    }
}

// MINIMUM WINDOW SUBSTRING
// Problem: Given strings s and t, find the smallest substring of s that contains all
//          characters of t including duplicates. Return "" if no such substring exists.
// Intuition: expand right until all chars satisfied; then shrink left to minimize.
// Steps:
//   1. Build need map from t; required = need.size()
//   2. Expand right: add s[r] to win; if win[c]==need[c], formed++
//   3. While formed==required: record window if smallest; shrink left
//   4. Shrinking: remove s[l]; if win[c] < need[c], formed--
Map<Character, Integer> need = new HashMap<>(), win = new HashMap<>();
for (char c : t.toCharArray()) need.merge(c, 1, Integer::sum);
int l = 0, formed = 0, required = need.size();
int bestLen = Integer.MAX_VALUE, bestL = 0;
for (int r = 0; r < s.length(); r++) {
    char c = s.charAt(r);
    win.merge(c, 1, Integer::sum);
    if (need.containsKey(c) && win.get(c).equals(need.get(c))) formed++;
    while (formed == required) {
        if (r - l + 1 < bestLen) { bestLen = r - l + 1; bestL = l; }
        char lc = s.charAt(l);
        win.merge(lc, -1, Integer::sum);
        if (need.containsKey(lc) && win.get(lc) < need.get(lc)) formed--;
        l++;
    }
}
// result: s.substring(bestL, bestL + bestLen)

// FIND ALL ANAGRAMS
// Problem: Given strings s and p, return all start indices in s where a substring is
//          an anagram of p. An anagram uses the same characters in any order.
// Intuition: anagrams have the same char frequencies; compare int[26] arrays in O(1).
// Steps:
//   1. Build pFreq from p; seed wFreq with first len(p) chars of s
//   2. If Arrays.equals(pFreq, wFreq), record index 0
//   3. Slide: wFreq[s[i]-'a']++, wFreq[s[i-p.length()]-'a']--
//   4. Record i-p.length()+1 on each match
int[] pFreq = new int[26], wFreq = new int[26];
for (char c : p.toCharArray()) pFreq[c - 'a']++;
List<Integer> anagramStarts = new ArrayList<>();
for (int i = 0; i < s.length(); i++) {
    wFreq[s.charAt(i) - 'a']++;
    if (i >= p.length()) wFreq[s.charAt(i - p.length()) - 'a']--;
    if (Arrays.equals(pFreq, wFreq)) anagramStarts.add(i - p.length() + 1);
}

// MAX CONSECUTIVE ONES III
// Problem: Given a binary array and integer k, return the maximum number of consecutive 1s
//          you can get if you may flip at most k zeros.
// Intuition: window is valid while it contains at most K zeros.
// Steps:
//   1. Expand right: if nums[right]==0, zeros++
//   2. Shrink left while zeros > k: if nums[left++]==0, zeros--
//   3. Update maxLen = max(maxLen, right-left+1)
int left = 0, zeros = 0, maxLen = 0;
for (int right = 0; right < nums.length; right++) {
    if (nums[right] == 0) zeros++;
    while (zeros > k) {
        if (nums[left++] == 0) zeros--;
    }
    maxLen = Math.max(maxLen, right - left + 1);
}`,
      go: `// Time: O(n)  Space: O(k)  (k is window or charset size)

// VARIABLE SIZE WINDOW
// Problem: Given a string and integer k, find the length of the longest substring
//          containing at most k distinct characters.
// Intuition: expand right always; shrink left only when the constraint (distinct chars > k) breaks.
// Steps:
//   1. Expand right: add s[right] to freq map
//   2. Shrink left while freq has more than k entries: remove s[left], delete key if count hits 0, advance left
//   3. Update maxLen = max(maxLen, right-left+1)
// Time: O(n)  Space: O(k)
func longestKDistinct(s string, k int) int {
    left, maxLen := 0, 0
    freq := make(map[byte]int)

    for right := 0; right < len(s); right++ {
        // 1. EXPAND: add right element
        freq[s[right]]++

        // 2. SHRINK: while window is invalid
        for len(freq) > k {
            freq[s[left]]--
            if freq[s[left]] == 0 {
                delete(freq, s[left])
            }
            left++
        }

        // 3. UPDATE: window is now valid
        if right-left+1 > maxLen {
            maxLen = right - left + 1
        }
    }
    return maxLen
}

// FIXED SIZE WINDOW
// Problem: Given an integer array and window size k, find the maximum sum of any
//          contiguous subarray of exactly k elements.
// Intuition: slide the window by subtracting the outgoing element and adding the incoming one.
// Steps:
//   1. Seed: sum the first k elements
//   2. maxSum = windowSum
//   3. For each i from k to end: windowSum += arr[i] - arr[i-k]
//   4. Update maxSum if windowSum is larger
// Time: O(n)  Space: O(1)
func maxSumFixed(arr []int, k int) int {
    windowSum := 0
    for i := 0; i < k; i++ {
        windowSum += arr[i]
    }
    maxSum := windowSum
    for i := k; i < len(arr); i++ {
        // arr[i] slides into the window on the right.
        // arr[i-k] slides out on the left (window of size k ending at i starts at i-k+1).
        // Subtracting the outgoing element avoids recomputing the whole sum each step.
        windowSum += arr[i] - arr[i-k]
        if windowSum > maxSum {
            maxSum = windowSum
        }
    }
    return maxSum
}

// MINIMUM WINDOW SUBSTRING
// Problem: Given strings s and t, find the smallest substring of s that contains all
//          characters of t including duplicates. Return "" if no such substring exists.
// Intuition: expand right until all chars satisfied, then shrink left to minimize.
// Steps:
//   1. Build need map from t; required = len(need)
//   2. Expand right: add s[right] to window; if window[c] == need[c], increment formed
//   3. While formed == required: record window if smallest so far, then shrink left
//   4. Shrinking: remove s[left] from window; if it drops below need[c], decrement formed
//   5. Return the best (smallest) window found
// Time: O(n)  Space: O(k)  k=charset size
func minWindow(s, t string) string {
    need := make(map[byte]int)
    for i := 0; i < len(t); i++ {
        need[t[i]]++
    }
    window := make(map[byte]int)
    left, formed, required := 0, 0, len(need)
    best := ""
    for right := 0; right < len(s); right++ {
        c := s[right]
        window[c]++
        if need[c] > 0 && window[c] == need[c] {
            formed++
        }
        for formed == required {
            sub := s[left : right+1]
            if best == "" || len(sub) < len(best) {
                best = sub
            }
            l := s[left]
            window[l]--
            if need[l] > 0 && window[l] < need[l] {
                formed--
            }
            left++
        }
    }
    return best
}

// FIND ALL ANAGRAMS IN A STRING
// Problem: Given strings s and p, return all start indices in s where a substring is
//          an anagram of p. An anagram uses the same characters in any order.
// Intuition: anagrams share identical char frequencies; compare fixed [26]int arrays in O(1).
// Steps:
//   1. Build pFreq from p; seed wFreq with the first len(p) chars of s
//   2. If pFreq == wFreq, record index 0
//   3. Slide the window: add s[i], remove s[i-len(p)], compare pFreq == wFreq
//   4. Record i-len(p)+1 on each match
// Time: O(n)  Space: O(1)  (fixed 26-element arrays)
func findAnagrams(s, p string) []int {
    if len(s) < len(p) {
        return nil
    }
    var pFreq, wFreq [26]int
    for i := 0; i < len(p); i++ {
        pFreq[p[i]-'a']++
        wFreq[s[i]-'a']++
    }
    result := []int{}
    if pFreq == wFreq {
        result = append(result, 0)
    }
    for i := len(p); i < len(s); i++ {
        wFreq[s[i]-'a']++            // add incoming right character
        wFreq[s[i-len(p)]-'a']--     // remove outgoing left character
        if pFreq == wFreq {
            result = append(result, i-len(p)+1)
        }
    }
    return result
}

// MAX CONSECUTIVE ONES III
// Problem: Given a binary array and integer k, return the maximum number of consecutive 1s
//          you can get by flipping at most k zeros.
// Intuition: a flipped zero still looks like a 1; window is valid while zeros <= K.
// Steps:
//   1. Expand right: if nums[right]==0, increment zeros
//   2. Shrink left while zeros > k: if nums[left]==0, decrement zeros; advance left
//   3. Update maxLen = max(maxLen, right-left+1)
// Time: O(n)  Space: O(1)
func longestOnes(nums []int, k int) int {
    left, zeros, maxLen := 0, 0, 0
    for right := 0; right < len(nums); right++ {
        if nums[right] == 0 {
            zeros++
        }
        for zeros > k {
            if nums[left] == 0 {
                zeros--
            }
            left++
        }
        if right-left+1 > maxLen {
            maxLen = right - left + 1
        }
    }
    return maxLen
}`,
    },
  },
  {
    id: "prefix-sum",
    name: "3. Prefix Sum",
    when: "Range sum queries, subarray sum equals K, product except self",
    time: "O(n) build, O(1) query",
    space: "O(n)",
    coreIdea:
      "A prefix sum array stores cumulative totals so any range sum reduces to a single subtraction: rangeSum(i, j) = prefix[j+1] - prefix[i]. For subarray-sum problems you run one pass and store how many times each prefix sum has appeared in a hash map, so finding 'how many previous prefix sums equal currentSum - k' is an O(1) lookup instead of an inner loop.",
    whenToUse: [
      "Multiple range sum queries on a static array",
      "Counting subarrays whose sum equals a target k",
      "Product of all elements except self (prefix and suffix products)",
      "Finding a pivot or equilibrium index where left sum equals right sum",
      "2D matrix range sum queries",
      "Problems involving running totals or cumulative counts",
    ],
    keyPoints: [
      "prefix[i] = sum of arr[0..i-1], prefix[0] = 0 (one extra slot)",
      "Range sum [i,j] = prefix[j+1] - prefix[i]",
      "Subarray sum = k: use HashMap to find (currentSum - k); each lookup is O(1)",
      "MUST initialize map with {0: 1} for subarrays starting at index 0",
      "For products: use prefix AND suffix arrays (handle zeros separately)",
      "Extends to 2D: prefix[i][j] = sum of submatrix from (0,0) to (i,j)",
    ],
    commonMistakes: [
      "Not initializing {0: 1} in the HashMap: without it, subarrays starting from index 0 are missed",
      "Off-by-one in prefix indexing: prefix[i] = sum of arr[0..i-1], so use prefix[j+1] - prefix[i] for range [i,j]",
      "Division approach for product except self fails when zeros are present",
      "Range sum formula: it is prefix[j+1] - prefix[i], not prefix[j] - prefix[i-1]",
    ],
    dontUseWhen: [
      "The array is updated between queries (use a Fenwick tree or segment tree for mutable arrays)",
      "You need the max or min of a range, not the sum (sparse table or segment tree applies here)",
      "The window moves and you only need an adjacent update (sliding window is simpler)",
      "The problem involves products with zeros (the division shortcut fails; handle zeros separately or use prefix and suffix arrays)",
    ],
    variants: [
      {
        name: "Range sum query",
        behavior:
          "Build prefix array once in O(n), answer each query in O(1) using prefix[j+1] - prefix[i]",
        example: "Range Sum Query, Immutable",
      },
      {
        name: "Subarray sum equals K",
        behavior:
          "One pass; store prefix sum counts in a hash map; add prefixCount[currentSum - k] to the answer",
        example: "Subarray Sum Equals K, Continuous Subarray Sum",
      },
      {
        name: "Prefix and suffix products",
        behavior:
          "Left pass builds prefix products, right pass multiplies in suffix products; no division needed",
        example: "Product of Array Except Self",
      },
      {
        name: "2D prefix sum",
        behavior:
          "prefix[i][j] = sum of submatrix from (0,0) to (i-1, j-1); rectangle query uses four corners",
        example: "Range Sum Query 2D",
      },
    ],
    keyTakeaways: [
      "prefix[i] = sum of arr[0..i-1], so prefix[0] = 0; range sum [i,j] = prefix[j+1] - prefix[i]",
      "Always initialize the hash map with {0: 1} so subarrays starting at index 0 are counted",
      "Subarray sum lookup: count += prefixCount[currentSum - k] before incrementing prefixCount[currentSum]",
      "Prefix and suffix product arrays let you handle zeros without any division",
      "2D prefix sums turn O(rows*cols) rectangle queries into O(1)",
    ],
    problems: [
      "Subarray Sum Equals K",
      "Product Except Self",
      "Range Sum Query",
      "Contiguous Array",
    ],
    code: {
      java: `// Time: O(n) build, O(1) query  Space: O(n)

// BUILD PREFIX SUM ARRAY
// Problem: Given an array, precompute cumulative sums so any range sum [i, j]
//          can be answered in O(1) without iterating through elements each time.
// Intuition: prefix[j+1] - prefix[i] gives sum of arr[i..j] in one subtraction.
// Steps:
//   1. Create prefix of length arr.length+1; prefix[0]=0
//   2. prefix[i+1] = prefix[i] + arr[i]
//   3. Query: rangeSum(i,j) = prefix[j+1] - prefix[i]
int[] prefix = new int[arr.length + 1];
for (int i = 0; i < arr.length; i++) {
    prefix[i + 1] = prefix[i] + arr[i];
}
// Range sum [i, j] = prefix[j + 1] - prefix[i]

// SUBARRAY SUM EQUALS K
// Problem: Given an integer array and target k, return the count of subarrays whose
//          elements sum exactly to k. Subarrays must be contiguous.
// Intuition: if currentSum - k was seen before, the subarray between those indices sums to k.
// Steps:
//   1. Initialize prefixCount = {0: 1} (handles subarrays starting at index 0)
//   2. For each num: sum += num
//   3. count += prefixCount.getOrDefault(sum-k, 0)
//   4. prefixCount.merge(sum, 1, Integer::sum)
Map<Integer, Integer> prefixCount = new HashMap<>();
prefixCount.put(0, 1);  // CRITICAL: handles subarrays from index 0
int sum = 0, count = 0;

for (int num : nums) {
    sum += num;
    // How many previous prefix sums equal (sum - k)?
    count += prefixCount.getOrDefault(sum - k, 0);
    prefixCount.merge(sum, 1, Integer::sum);
}
return count;

// PRODUCT EXCEPT SELF
// Problem: Given an integer array, return an array where each element is the product
//          of all elements except itself. Must run in O(n) without using division.
// Intuition: result[i] = left product * right product; compute in two passes.
// Steps:
//   1. Left pass: result[i] = product of nums[0..i-1]
//   2. Right pass: multiply result[i] by running suffix product; update suffix
//   3. Return result
int[] result = new int[nums.length];
result[0] = 1;
for (int i = 1; i < nums.length; i++) {
    result[i] = result[i - 1] * nums[i - 1]; // prefix product up to i-1
}
int right = 1;
for (int i = nums.length - 1; i >= 0; i--) {
    result[i] *= right;  // multiply in suffix product
    right *= nums[i];
}

// CONTIGUOUS ARRAY
// Problem: Given a binary array, find the maximum length subarray with equal number
//          of 0s and 1s.
// Intuition: treat 0 as -1; equal counts means running sum revisits a value seen before.
// Steps:
//   1. Initialize firstSeen = {0: -1}
//   2. For each element: runningSum += nums[i]==1 ? 1 : -1
//   3. If runningSum in firstSeen: maxLen = max(maxLen, i - firstSeen.get(runningSum))
//   4. Otherwise: firstSeen.put(runningSum, i)
Map<Integer, Integer> firstSeen = new HashMap<>();
firstSeen.put(0, -1);
int runningSum = 0, maxLen = 0;
for (int i = 0; i < nums.length; i++) {
    runningSum += (nums[i] == 1) ? 1 : -1;
    if (firstSeen.containsKey(runningSum)) {
        maxLen = Math.max(maxLen, i - firstSeen.get(runningSum));
    } else {
        firstSeen.put(runningSum, i);
    }
}`,
      go: `// Time: O(n) build, O(1) query  Space: O(n)
// BUILD PREFIX SUM ARRAY
// Problem: Given an array, precompute cumulative sums so any range sum [i, j]
//          can be answered in O(1) without iterating through elements each time.
// Intuition: prefix[j+1] - prefix[i] gives the sum of arr[i..j] in one subtraction.
// Steps:
//   1. Create prefix of length len(arr)+1; prefix[0]=0
//   2. prefix[i+1] = prefix[i] + arr[i]
//   3. Range sum [i,j] = prefix[j+1] - prefix[i]
// Time: O(n) build  Space: O(n)
func buildPrefix(arr []int) []int {
    prefix := make([]int, len(arr)+1)
    for i, v := range arr {
        prefix[i+1] = prefix[i] + v
    }
    return prefix
}

// SUBARRAY SUM EQUALS K
// Problem: Given an integer array and target k, return the count of subarrays whose
//          elements sum exactly to k. Subarrays must be contiguous.
// Intuition: if prefixSum[j] - prefixSum[i] == k, then nums[i..j] sums to k.
//   So look up (currentSum - k) in a hash map of past prefix sums.
// Steps:
//   1. Initialize prefixCount = {0: 1} (handles subarrays starting at index 0)
//   2. For each num, add to running sum
//   3. count += prefixCount[sum-k] (how many past sums satisfy the condition)
//   4. Increment prefixCount[sum]
// Time: O(n)  Space: O(n)
func subarraySum(nums []int, k int) int {
    // {0: 1} seeds the map with "a prefix sum of 0 occurred once" (before any elements).
    // Without this, subarrays that start at index 0 would be missed.
    // Example: nums=[3,1], k=3. At i=0, currentSum=3, we look up prefixCount[3-3]=prefixCount[0].
    // That must be 1 to count the subarray [3], but it would be 0 without the seed.
    prefixCount := map[int]int{0: 1}
    sum, count := 0, 0
    for _, num := range nums {
        sum += num
        count += prefixCount[sum-k] // how many past prefix sums equal sum-k
        prefixCount[sum]++
    }
    return count
}

// PRODUCT EXCEPT SELF
// Problem: Given an integer array, return an array where each element is the product
//          of all other elements. Must run in O(n) without using division.
// Intuition: result[i] = left product of nums[0..i-1] times right product of nums[i+1..end].
// Steps:
//   1. Left pass: result[i] = product of nums[0..i-1]
//   2. Right pass (right-to-left): multiply result[i] by running suffix product; update suffix
//   3. Return result
// Time: O(n)  Space: O(1) extra
func productExceptSelf(nums []int) []int {
    n := len(nums)
    result := make([]int, n)
    result[0] = 1
    for i := 1; i < n; i++ {
        result[i] = result[i-1] * nums[i-1] // prefix product up to i-1
    }
    right := 1
    for i := n - 1; i >= 0; i-- {
        result[i] *= right // multiply in suffix product
        right *= nums[i]
    }
    return result
}

// CONTIGUOUS ARRAY
// Problem: Given a binary array, find the maximum length subarray with equal number
//          of 0s and 1s.
// Intuition: treat 0 as -1; equal counts means running sum returns to a value seen before.
// Steps:
//   1. Initialize firstSeen = {0: -1} (runningSum 0 seen before index 0)
//   2. For each element: add +1 for 1, -1 for 0 to runningSum
//   3. If runningSum seen before, length = i - firstSeen[runningSum]; update maxLen
//   4. Otherwise record firstSeen[runningSum] = i
// Time: O(n)  Space: O(n)
func findMaxLength(nums []int) int {
    firstSeen := map[int]int{0: -1}
    runningSum, maxLen := 0, 0
    for i, n := range nums {
        if n == 1 {
            runningSum++
        } else {
            runningSum--
        }
        if j, ok := firstSeen[runningSum]; ok {
            if i-j > maxLen {
                maxLen = i - j
            }
        } else {
            firstSeen[runningSum] = i
        }
    }
    return maxLen
}`,
    },
  },
  {
    id: "binary-search",
    name: "4. Binary Search",
    when: "Sorted array, find boundary, minimize/maximize answer",
    time: "O(log n)",
    space: "O(1)",
    coreIdea:
      "Binary search works whenever the search space forms a sorted yes/no boundary: everything to one side satisfies the condition, everything to the other side does not. Each comparison cuts the remaining space in half, reaching the answer in O(log n). You do not need a literal sorted array: any monotone predicate (canShip in n days, canEat at speed k) can be binary-searched over its range of possible answers.",
    whenToUse: [
      "Searching for a value in a sorted array",
      "Finding the first or last occurrence of a target",
      "Searching in a rotated sorted array",
      "Binary search on the answer: minimize the maximum or maximize the minimum",
      "Finding a boundary: the first position where a condition becomes true",
      "Any search space that forms a monotone yes/no function",
    ],
    keyPoints: [
      "Use mid = left + (right-left)/2 to avoid integer overflow",
      "left <= right for exact match; left < right for boundary/lower-bound",
      "Rotated array: one half is ALWAYS sorted, use that half's boundaries to decide direction",
      "Binary search on answer: define canAchieve(x) predicate, binary search the range",
      "First occurrence: when found, keep searching left (right = mid)",
      "Last occurrence: when found, keep searching right (left = mid+1)",
    ],
    commonMistakes: [
      "Integer overflow: use mid = left + (right - left) / 2, not (left + right) / 2",
      "Infinite loop from inconsistent boundary updates: left = mid+1 and right = mid-1 for exact search; left = mid+1 and right = mid for lower bound",
      "Wrong loop condition: use <= for exact match (loop ends when left > right), < for boundary (left == right is the answer)",
      "Not correctly setting lo and hi for binary search on answer: lo = minimum possible value, hi = maximum possible value",
    ],
    dontUseWhen: [
      "The array is unsorted and you cannot sort it (linear scan or hash map is your only option)",
      "You need to find all occurrences, not just one (use prefix sum or sliding window)",
      "The search space has no monotone structure: you cannot define a true/false boundary that holds consistently",
      "The dataset changes frequently between queries (a balanced BST or sorted structure handles dynamic inserts)",
    ],
    variants: [
      {
        name: "Exact match",
        behavior:
          "left <= right loop; return mid when arr[mid] == target; return -1 when loop ends",
        example: "Binary Search, Search in Rotated Sorted Array",
      },
      {
        name: "Lower bound (first position >= target)",
        behavior:
          "left < right loop; right = mid when condition holds; left = mid + 1 otherwise; answer is left",
        example: "Find First and Last Position, First Bad Version",
      },
      {
        name: "Binary search on answer",
        behavior:
          "Define a feasibility predicate; binary search the range [minPossible, maxPossible]",
        example:
          "Koko Eating Bananas, Capacity to Ship Packages, Split Array Largest Sum",
      },
      {
        name: "Rotated array",
        behavior:
          "One half is always sorted; check which half is sorted, then decide which side to search",
        example:
          "Search in Rotated Sorted Array, Find Minimum in Rotated Sorted Array",
      },
    ],
    keyTakeaways: [
      "Use mid = left + (right - left) / 2 to prevent integer overflow",
      "Use left <= right for exact match; use left < right for lower-bound style searches",
      "Binary search on answer: write a canAchieve(x) predicate, search [minVal, maxVal]",
      "Rotated array: one half is always sorted; use that half's boundaries to decide direction",
      "When looking for the first true position, keep right = mid (do not subtract 1) so the answer is never skipped",
    ],
    problems: [
      "Binary Search",
      "Search in Rotated Array",
      "Find First and Last Position",
      "Koko Eating Bananas",
      "Capacity to Ship Packages",
    ],
    code: {
      java: `// Time: O(log n)  Space: O(1)

// BINARY SEARCH
// Problem: Given a sorted integer array and a target value, return the index of target,
//          or -1 if it does not exist.
// Intuition: each comparison halves the search space.
// Steps:
//   1. left=0, right=arr.length-1
//   2. mid = left + (right-left)/2 (avoids overflow)
//   3. If arr[mid]==target, return mid
//   4. If arr[mid]<target, left=mid+1; else right=mid-1
//   5. Return -1 if not found
int left = 0, right = arr.length - 1;
while (left <= right) {
    int mid = left + (right - left) / 2;
    if (arr[mid] == target) return mid;
    else if (arr[mid] < target) left = mid + 1;  // target is in right half
    else right = mid - 1;                         // target is in left half
}
return -1;

// LOWER BOUND
// Problem: Given a sorted array and target, find the first index where arr[i] >= target.
//          Returns arr.length if all elements are smaller than target.
// Intuition: left < right loop; right=mid keeps the potential answer in range.
// Steps:
//   1. left=0, right=arr.length
//   2. mid = left + (right-left)/2
//   3. If arr[mid]<target: left=mid+1; else right=mid
//   4. Return left (left==right is the answer)
int left = 0, right = arr.length;
while (left < right) {
    int mid = left + (right - left) / 2;
    if (arr[mid] < target) left = mid + 1;
    else right = mid;  // mid could be the answer: don't exclude it
}
return left;

// BINARY SEARCH ON ANSWER
// Problem: Find the minimum feasible value x in a range [lo, hi] given a monotone predicate
//          canAchieve(x) that is false for too-small values and true for large enough values.
// Intuition: canAchieve is monotone (false then true); binary search the answer space.
// Steps:
//   1. left=minPossible, right=maxPossible
//   2. mid = left + (right-left)/2
//   3. If canAchieve(mid): right=mid (try smaller)
//   4. Else: left=mid+1 (must go larger)
//   5. Return left
int left = minPossible, right = maxPossible;
while (left < right) {
    int mid = left + (right - left) / 2;
    if (canAchieve(mid)) right = mid;  // mid works: try something smaller
    else left = mid + 1;               // mid doesn't work: must go larger
}
return left;

// SEARCH IN ROTATED SORTED ARRAY
// Problem: A sorted array was rotated at some pivot. Given the rotated array and a target,
//          return the target's index, or -1 if not present. Do it in O(log n).
// Intuition: use sorted half's endpoints to decide which half to search.
// Steps:
//   1. lo=0, hi=nums.length-1; compute mid
//   2. If nums[lo]<=nums[mid]: left half sorted; check if target in [lo,mid)
//   3. Else: right half sorted; check if target in (mid,hi]
//   4. Narrow search to appropriate half
int searchRotated(int[] nums, int target) {
    int lo = 0, hi = nums.length - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] == target) return mid;
        if (nums[lo] <= nums[mid]) { // left half is sorted
            if (target >= nums[lo] && target < nums[mid]) hi = mid - 1;
            else lo = mid + 1;
        } else { // right half is sorted
            if (target > nums[mid] && target <= nums[hi]) lo = mid + 1;
            else hi = mid - 1;
        }
    }
    return -1;
}

// FIND FIRST OCCURRENCE
// Problem: Given a sorted array and target, find the leftmost index where target appears.
//          Return -1 if target is not present.
// Intuition: when target is found, record it but keep searching left for an earlier one.
// Steps:
//   1. lo=0, hi=nums.length-1, result=-1
//   2. If nums[mid]==target: result=mid, hi=mid-1 (keep going left)
//   3. If nums[mid]<target: lo=mid+1; else hi=mid-1
//   4. Return result
int findFirst(int[] nums, int target) {
    int lo = 0, hi = nums.length - 1, result = -1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] == target) { result = mid; hi = mid - 1; } // keep going left
        else if (nums[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return result;
}`,
      go: `// Time: O(log n)  Space: O(1)

// BINARY SEARCH
// Problem: Given a sorted integer array and a target value, return the index of target,
//          or -1 if it does not exist.
// Intuition: each comparison eliminates half the remaining search space.
// Steps:
//   1. left=0, right=len-1
//   2. mid = left + (right-left)/2 (avoids integer overflow)
//   3. If arr[mid]==target, return mid
//   4. If arr[mid]<target, left=mid+1 (search right half)
//   5. If arr[mid]>target, right=mid-1 (search left half)
//   6. Return -1 if loop ends without match
// Time: O(log n)  Space: O(1)
func binarySearch(arr []int, target int) int {
    left, right := 0, len(arr)-1
    for left <= right {
        mid := left + (right-left)/2 // avoids overflow vs (left+right)/2
        if arr[mid] == target {
            return mid
        } else if arr[mid] < target {
            left = mid + 1  // target is in the right half
        } else {
            right = mid - 1 // target is in the left half
        }
    }
    return -1
}

// LOWER BOUND
// Problem: Given a sorted array and target, find the first index where arr[i] >= target.
//          Returns len(arr) if all elements are smaller than target.
// Intuition: use left < right so the loop ends at the answer; right=mid keeps the answer in range.
// Steps:
//   1. left=0, right=len(arr)  (right can be len, meaning "not found")
//   2. mid = left + (right-left)/2
//   3. If arr[mid] < target: left=mid+1 (mid too small)
//   4. Else: right=mid (mid could be the answer, keep it)
//   5. Return left (left==right at end)
// Time: O(log n)  Space: O(1)
func lowerBound(arr []int, target int) int {
    left, right := 0, len(arr)
    for left < right {
        mid := left + (right-left)/2
        if arr[mid] < target {
            left = mid + 1 // mid is too small: answer is to the right
        } else {
            right = mid    // mid might be the answer: keep it in range
        }
    }
    return left // left == right at this point
}

// BINARY SEARCH ON ANSWER
// Problem: Find the minimum feasible value x in a range [lo, hi] given a monotone predicate
//          canAchieve(x) that is false for too-small values and true for large enough values.
// Intuition: canAchieve is monotone (false then true); binary search the answer space.
// Steps:
//   1. Set lo=minPossible, hi=maxPossible
//   2. mid = lo + (hi-lo)/2
//   3. If canAchieve(mid): hi=mid (mid works, try smaller)
//   4. Else: lo=mid+1 (mid doesn't work, must go larger)
//   5. Return lo when lo==hi
// Time: O(log(range) * cost of canAchieve)  Space: O(1)
func searchOnAnswer(lo, hi int, canAchieve func(int) bool) int {
    for lo < hi {
        mid := lo + (hi-lo)/2
        if canAchieve(mid) {
            hi = mid      // mid works: try something smaller
        } else {
            lo = mid + 1  // mid doesn't work: must be larger
        }
    }
    return lo
}

// SEARCH IN ROTATED SORTED ARRAY
// Problem: A sorted array was rotated at some unknown pivot. Given the rotated array and a
//          target, return the index of target or -1. Must run in O(log n).
// Intuition: after rotation, one half is always sorted; use its endpoints to decide direction.
// Steps:
//   1. lo=0, hi=len-1; compute mid
//   2. If nums[lo] <= nums[mid], left half is sorted
//      a. If target in [nums[lo], nums[mid]), hi=mid-1; else lo=mid+1
//   3. Else right half is sorted
//      a. If target in (nums[mid], nums[hi]], lo=mid+1; else hi=mid-1
//   4. Return -1 if not found
// Time: O(log n)  Space: O(1)
func searchRotated(nums []int, target int) int {
    lo, hi := 0, len(nums)-1
    for lo <= hi {
        mid := lo + (hi-lo)/2
        if nums[mid] == target {
            return mid
        }
        if nums[lo] <= nums[mid] { // left half is sorted (no rotation in it)
            if target >= nums[lo] && target < nums[mid] {
                hi = mid - 1 // target is in the sorted left half
            } else {
                lo = mid + 1 // target must be in the right half
            }
        } else { // right half is sorted
            if target > nums[mid] && target <= nums[hi] {
                lo = mid + 1 // target is in the sorted right half
            } else {
                hi = mid - 1 // target must be in the left half
            }
        }
    }
    return -1
}

// FIND FIRST OCCURRENCE
// Problem: Given a sorted array and target, return the leftmost index where target appears.
//          Return -1 if target is not present.
// Intuition: when target is found, don't stop; keep searching left for an earlier occurrence.
// Steps:
//   1. lo=0, hi=len-1, result=-1
//   2. If nums[mid]==target: result=mid, hi=mid-1 (keep searching left)
//   3. If nums[mid]<target: lo=mid+1
//   4. If nums[mid]>target: hi=mid-1
//   5. Return result
// Time: O(log n)  Space: O(1)
func findFirst(nums []int, target int) int {
    lo, hi, result := 0, len(nums)-1, -1
    for lo <= hi {
        mid := lo + (hi-lo)/2
        if nums[mid] == target {
            result = mid
            hi = mid - 1 // found one: keep looking left for an earlier occurrence
        } else if nums[mid] < target {
            lo = mid + 1
        } else {
            hi = mid - 1
        }
    }
    return result
}`,
    },
  },
  {
    id: "stack",
    name: "5. Stack / Monotonic Stack",
    when: "Matching pairs, next greater/smaller, expression evaluation",
    time: "O(n)",
    space: "O(n)",
    coreIdea:
      "A stack solves problems where the most recently seen item is the most relevant one, which happens naturally with nested structures and next-greater queries. A monotonic stack keeps elements in sorted order by popping anything that violates the order when a new element arrives; the popped elements have found their answer (the current element), so each element is pushed and popped at most once, giving O(n) total.",
    whenToUse: [
      "Matching parentheses, brackets, or any paired structure",
      "Expression evaluation (calculators, reverse Polish notation)",
      "Finding the next greater or next smaller element for each item",
      "Largest rectangle in histogram or similar 'span' problems",
      "Decoding nested strings or handling nested structures",
      "Simplifying file paths or call stacks",
    ],
    keyPoints: [
      "LIFO: last in, first out, which is perfect for nested or paired structures",
      "Monotonic DECREASING: pop when current > top → finds next greater element",
      "Monotonic INCREASING: pop when current < top → finds next smaller element",
      "Store INDICES not values for position-based problems",
      "For circular arrays: iterate 2*n, use i % n for index",
      "Process remaining stack after loop: those elements never found their next greater/smaller",
    ],
    commonMistakes: [
      "Forgetting to process elements still in the stack after the main loop (those elements have no next greater/smaller)",
      "Wrong monotonic direction: decreasing stack for next greater, increasing stack for next smaller",
      "Not storing indices in the stack when distance or position matters for the answer",
      "Integer overflow in calculator problems: use int64 or check for division edge cases",
    ],
    dontUseWhen: [
      "You need the minimum or maximum over a sliding window of size K (monotonic deque is more efficient)",
      "The problem is about range sums or prefix queries (prefix sum is the right tool)",
      "You need random access to elements by position (an array or deque is better)",
      "The paired structure is not sequential and the nesting can be non-local (graph-based approaches fit better)",
    ],
    variants: [
      {
        name: "Matching pairs",
        behavior:
          "Push opening brackets; on closing bracket, check if top matches; return false if stack is non-empty at end",
        example: "Valid Parentheses, Minimum Remove to Make Valid Parentheses",
      },
      {
        name: "Monotonic decreasing (next greater)",
        behavior:
          "Pop while top is smaller than current; popped elements get current as their next greater element",
        example: "Daily Temperatures, Next Greater Element I and II",
      },
      {
        name: "Monotonic increasing (next smaller)",
        behavior:
          "Pop while top is larger than current; popped elements get current as their next smaller element",
        example: "Largest Rectangle in Histogram, Trapping Rain Water",
      },
      {
        name: "Calculator / expression",
        behavior:
          "Push numbers and operators; handle precedence by evaluating when a lower-precedence operator arrives",
        example: "Basic Calculator II, Evaluate Reverse Polish Notation",
      },
    ],
    keyTakeaways: [
      "Decreasing stack finds the next greater element; increasing stack finds the next smaller element",
      "Store indices in the stack, not values, whenever position or distance matters",
      "Process the remaining stack after the loop: those elements never found a greater/smaller element",
      "For circular arrays, iterate 2*n and use i % n as the index",
      "Each element is pushed once and popped once, so even with the inner while loop the total is O(n)",
    ],
    problems: [
      "Valid Parentheses",
      "Daily Temperatures",
      "Largest Rectangle in Histogram",
      "Next Greater Element",
    ],
    code: {
      java: `// Time: O(n)  Space: O(n)

// VALID PARENTHESES
// Problem: Given a string of brackets '(', ')', '{', '}', '[', ']', return true if every
//          opening bracket is closed in the correct order.
// Intuition: most recently opened bracket must close first (LIFO = stack).
// Steps:
//   1. For each char: if opening, push; if closing, check stack top matches
//   2. If no match or stack empty, return false; else pop
//   3. Return stack.isEmpty() after loop
Deque<Character> stack = new ArrayDeque<>();
Map<Character, Character> pairs = Map.of(')', '(', ']', '[', '}', '{');
for (char c : s.toCharArray()) {
    if (c == '(' || c == '[' || c == '{') {  // opening bracket
        stack.push(c);
    } else if (stack.isEmpty() || stack.pop() != pairs.get(c)) {
        return false;  // unmatched closing bracket
    }
}
return stack.isEmpty();

// NEXT GREATER ELEMENT
// Problem: For each element in an array, find the first element to its right that is greater.
//          Return -1 if no such element exists.
// Intuition: decreasing stack; when a larger value arrives, it answers all smaller stack tops.
// Steps:
//   1. Fill result with -1
//   2. For each i: while stack top's value < nums[i], pop and set result[top]=nums[i]
//   3. Push i; remaining indices in stack have no next greater element
int[] result = new int[n];
Arrays.fill(result, -1);
Deque<Integer> stack = new ArrayDeque<>();  // stores INDICES

for (int i = 0; i < n; i++) {
    while (!stack.isEmpty() && nums[stack.peek()] < nums[i]) {
        result[stack.pop()] = nums[i];  // current is their answer
    }
    stack.push(i);
}

// DAILY TEMPERATURES
// Problem: Given a list of daily temperatures, return an array where answer[i] is the number
//          of days you have to wait until a warmer temperature. Use 0 if no warmer day exists.
// Intuition: same as next greater element; store indices to compute distance.
// Steps:
//   1. For each i: while stack top's temperature < temperatures[i], pop idx; answer[idx]=i-idx
//   2. Push i; remaining indices in stack means no warmer day found (answer stays 0)
int[] answer = new int[temperatures.length];
Deque<Integer> stk = new ArrayDeque<>(); // stores indices
for (int i = 0; i < temperatures.length; i++) {
    while (!stk.isEmpty() && temperatures[stk.peek()] < temperatures[i]) {
        int idx = stk.pop();
        answer[idx] = i - idx; // days waited
    }
    stk.push(i);
}

// LARGEST RECTANGLE IN HISTOGRAM
// Problem: Given an array of bar heights, find the area of the largest rectangle
//          that fits entirely within the histogram.
// Intuition: a bar's max rectangle ends when a shorter bar arrives; use increasing stack.
// Steps:
//   1. Iterate i from 0 to heights.length inclusive (sentinel h=0 at i==length flushes stack)
//   2. While stack top's height > current h: pop; width = stack empty ? i : i-top-1
//   3. area = height * width; update maxArea; push i
Deque<Integer> monoStack = new ArrayDeque<>();
int maxArea = 0;
for (int i = 0; i <= heights.length; i++) {
    int h = (i == heights.length) ? 0 : heights[i]; // sentinel flushes stack at end
    while (!monoStack.isEmpty() && heights[monoStack.peek()] > h) {
        int height = heights[monoStack.pop()];
        int width = monoStack.isEmpty() ? i : i - monoStack.peek() - 1;
        maxArea = Math.max(maxArea, height * width);
    }
    monoStack.push(i);
}`,
      go: `// Time: O(n)  Space: O(n)

// VALID PARENTHESES
// Problem: Given a string of brackets, return true if every opening bracket is closed in
//          the correct order and by the matching type.
// Intuition: the most recently opened bracket must be closed first (LIFO = stack).
// Steps:
//   1. For each char: if opening bracket, push it
//   2. If closing bracket: if stack empty or top doesn't match, return false
//   3. If top matches, pop it
//   4. After loop: return true only if stack is empty
// Time: O(n)  Space: O(n)
func isValid(s string) bool {
    stack := []byte{}
    pairs := map[byte]byte{')': '(', ']': '[', '}': '{'}
    for i := 0; i < len(s); i++ {
        c := s[i]
        if c == '(' || c == '[' || c == '{' {
            stack = append(stack, c)
        } else {
            if len(stack) == 0 || stack[len(stack)-1] != pairs[c] {
                return false // unmatched closing bracket
            }
            stack = stack[:len(stack)-1]
        }
    }
    return len(stack) == 0
}

// NEXT GREATER ELEMENT
// Problem: For each element in the array, find the first element to its right that is greater.
//          Return -1 if no such element exists.
// Intuition: maintain a decreasing stack; when a larger value arrives, it is the answer for all smaller stack tops.
// Steps:
//   1. Initialize result with -1 (default: no next greater)
//   2. For each index i, while stack top's value < nums[i]: pop, set result[top]=nums[i]
//   3. Push index i onto the stack
//   4. Indices remaining in stack after loop have no next greater element
// Time: O(n)  Space: O(n)
func nextGreater(nums []int) []int {
    n := len(nums)
    result := make([]int, n)
    for i := range result {
        result[i] = -1 // default: no next greater element
    }
    stack := []int{} // stores indices, not values

    for i := 0; i < n; i++ {
        // pop all indices whose value is smaller than the current value
        for len(stack) > 0 && nums[stack[len(stack)-1]] < nums[i] {
            idx := stack[len(stack)-1]
            stack = stack[:len(stack)-1]
            result[idx] = nums[i] // nums[i] is the next greater for idx
        }
        stack = append(stack, i)
    }
    return result
}

// DAILY TEMPERATURES
// Problem: Given a list of daily temperatures, return an array where answer[i] is the number
//          of days to wait for a warmer day. Use 0 if no warmer day ever comes.
// Intuition: same as next greater element; store indices so we can compute distance.
// Steps:
//   1. Initialize answer slice with zeros
//   2. For each index i, while stack top's temperature < temperatures[i]: pop idx, answer[idx]=i-idx
//   3. Push index i
//   4. Indices still in stack waited forever (answer stays 0)
// Time: O(n)  Space: O(n)
func dailyTemperatures(temperatures []int) []int {
    answer := make([]int, len(temperatures))
    stack := []int{} // stores indices so we can compute distance
    for i, temp := range temperatures {
        for len(stack) > 0 && temperatures[stack[len(stack)-1]] < temp {
            idx := stack[len(stack)-1]
            stack = stack[:len(stack)-1]
            answer[idx] = i - idx // days waited = current index - stored index
        }
        stack = append(stack, i)
    }
    return answer
}

// LARGEST RECTANGLE IN HISTOGRAM
// Problem: Given an array of bar heights in a histogram, find the area of the largest
//          rectangle that fits within the histogram bars.
// Intuition: a bar's max-width rectangle ends when a shorter bar arrives on its right.
// Steps:
//   1. For each i from 0 to len(heights) inclusive (include sentinel h=0 to flush stack)
//   2. While stack top's height > current h: pop it; width = i - newTop - 1 (or i if stack empty)
//   3. Compute area = poppedHeight * width; update maxArea
//   4. Push index i
// Time: O(n)  Space: O(n)
func largestRectangleArea(heights []int) int {
    stack := []int{}
    maxArea := 0
    for i := 0; i <= len(heights); i++ {
        h := 0 // sentinel value: forces all remaining bars to be popped
        if i < len(heights) {
            h = heights[i]
        }
        for len(stack) > 0 && heights[stack[len(stack)-1]] > h {
            height := heights[stack[len(stack)-1]]
            stack = stack[:len(stack)-1]
            // width: if stack is empty the bar spans from 0 to i; otherwise from top+1 to i-1
            width := i
            if len(stack) > 0 {
                width = i - stack[len(stack)-1] - 1
            }
            if height*width > maxArea {
                maxArea = height * width
            }
        }
        stack = append(stack, i)
    }
    return maxArea
}`,
    },
  },
  {
    id: "trees",
    name: "6. Trees (DFS/BFS)",
    when: "Traversal, path sum, validate BST, level order",
    time: "O(n)",
    space: "O(h) DFS, O(w) BFS - h is height, w is max width",
    coreIdea:
      "Tree problems decompose naturally into recursive subproblems: solve for the left subtree, solve for the right subtree, combine the results. The traversal order determines what information is available at each step: inorder gives BST nodes in sorted order, preorder lets you process a node before its children (serialization), and postorder lets you use children's results to compute the parent's answer (heights, deletion). BFS processes nodes level by level using a queue.",
    whenToUse: [
      "Tree traversal problems (inorder for BST sorted output, preorder for serialization)",
      "Finding the depth, height, or diameter of a tree",
      "Validating BST properties with range constraints",
      "Level-order (BFS) processing for shortest depth or level-by-level results",
      "Finding the lowest common ancestor of two nodes",
      "Serialization and deserialization of a tree",
    ],
    keyPoints: [
      "Inorder (L then Root then R): BST gives SORTED order, use for validation and kth-element problems",
      "Preorder (Root→L→R): serialize/copy tree",
      "Postorder (L→R→Root): compute heights, delete tree",
      "BFS (level order): shortest depth, level-by-level processing",
      "BST validation: pass min/max bounds DOWN the tree, not just the parent value",
      "Diameter/path-through-root: use closure variable to track global max across calls",
    ],
    commonMistakes: [
      "Forgetting the base case for nil nodes: most recursive tree functions start with 'if root == nil { return ... }'",
      "BST validation bug: passing the parent value as the only bound misses ancestors. Pass both min and max bounds down",
      "Using wrong traversal order for the problem (inorder, preorder, and postorder each serve a different purpose)",
      "Integer overflow in BST validation: use math.MinInt64 and math.MaxInt64, not int32 bounds",
    ],
    dontUseWhen: [
      "The structure is a general graph with cycles (use DFS/BFS with a visited set instead)",
      "You need to find the shortest path by number of edges (BFS on a graph, not recursive DFS)",
      "The tree has up to 10^5 nodes and the recursion would exceed the call stack limit (use an iterative approach with an explicit stack)",
      "The problem involves editing many nodes simultaneously (segment tree or other range-update structures apply)",
    ],
    variants: [
      {
        name: "DFS preorder",
        behavior:
          "Process root, then left subtree, then right subtree; parent value is available before children",
        example: "Serialize and Deserialize Binary Tree, Path Sum",
      },
      {
        name: "DFS inorder",
        behavior:
          "Process left subtree, then root, then right subtree; gives sorted output for a BST",
        example: "Validate Binary Search Tree, Kth Smallest Element in BST",
      },
      {
        name: "DFS postorder",
        behavior:
          "Process left subtree, then right subtree, then root; children results feed into parent computation",
        example:
          "Maximum Depth, Diameter of Binary Tree, Delete Nodes and Return Forest",
      },
      {
        name: "BFS level order",
        behavior:
          "Use a queue; capture queue size at the start of each iteration to process one level at a time",
        example:
          "Binary Tree Level Order Traversal, Minimum Depth, Right Side View",
      },
    ],
    keyTakeaways: [
      "Every recursive tree function needs a base case: if root == nil return the appropriate zero value",
      "BST validation requires passing min and max bounds down the tree, not just comparing with the parent",
      "Inorder of a BST yields sorted order: use this for validation and kth-element problems",
      "Use a closure variable to track a global maximum across all recursive calls (diameter, max path sum)",
      "BFS level order: snapshot queue size at the start of each outer loop iteration to separate levels",
    ],
    problems: [
      "Maximum Depth",
      "Validate BST",
      "Lowest Common Ancestor",
      "Level Order Traversal",
      "Diameter of Binary Tree",
    ],
    code: {
      java: `// Time: O(n)  Space: O(h) DFS / O(w) BFS  (h=height, w=max width)

// MAX DEPTH OF BINARY TREE
// Problem: Given the root of a binary tree, return its maximum depth (the number of nodes
//          along the longest root-to-leaf path).
// Intuition: depth = 1 + max of children's depths; base case is null node = 0.
// Steps:
//   1. If node==null, return 0
//   2. l = maxDepth(node.left), r = maxDepth(node.right)
//   3. Return 1 + Math.max(l, r)
int maxDepth(TreeNode node) {
    if (node == null) return 0;
    int left = maxDepth(node.left);
    int right = maxDepth(node.right);
    return 1 + Math.max(left, right);
}

// VALIDATE BST
// Problem: Given the root of a binary tree, determine if it is a valid Binary Search Tree.
//          Every left descendant must be strictly less than the node; every right descendant strictly greater.
// Intuition: pass min/max bounds down; going left tightens upper bound, right tightens lower.
// Steps:
//   1. If node==null, return true
//   2. If node.val <= min or node.val >= max, return false
//   3. Recurse: isValidBST(left, min, node.val) && isValidBST(right, node.val, max)
boolean isValidBST(TreeNode node, long min, long max) {
    if (node == null) return true;
    if (node.val <= min || node.val >= max) return false;
    return isValidBST(node.left, min, node.val) &&
           isValidBST(node.right, node.val, max);
}

// LEVEL ORDER TRAVERSAL
// Problem: Given the root of a binary tree, return its node values grouped by level
//          from top to bottom. Each level's values form a sub-list.
// Intuition: snapshot queue size at start of each level to separate levels.
// Steps:
//   1. Enqueue root
//   2. While queue not empty: size = queue.size(); process size nodes, enqueue children
//   3. Add each level's values to result
if (root == null) return result;
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
}

// LOWEST COMMON ANCESTOR
// Problem: Given a binary tree and two nodes p and q, find the deepest node that is
//          an ancestor of both p and q.
// Intuition: if p and q split across left and right, current node is the LCA.
// Steps:
//   1. If root==null or root==p or root==q, return root
//   2. left = LCA(left), right = LCA(right)
//   3. If both non-null: return root; else return whichever is non-null
TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
    if (root == null || root == p || root == q) return root;
    TreeNode left = lowestCommonAncestor(root.left, p, q);
    TreeNode right = lowestCommonAncestor(root.right, p, q);
    if (left != null && right != null) return root; // p and q in different subtrees
    return (left != null) ? left : right;
}

// DIAMETER OF BINARY TREE
// Problem: Given the root of a binary tree, return the length of the diameter: the longest
//          path between any two nodes (path does not need to pass through the root).
// Intuition: diameter at a node = left arm + right arm; track global max via instance variable.
// Steps:
//   1. armLength(node) returns longest downward path from node
//   2. At each node: diameter = max(diameter, left + right)
//   3. Return 1 + max(left, right) as arm for parent
int diameter = 0;
int armLength(TreeNode node) {
    if (node == null) return 0;
    int left = armLength(node.left);
    int right = armLength(node.right);
    diameter = Math.max(diameter, left + right); // path through this node
    return 1 + Math.max(left, right);
}`,
      go: `// Time: O(n)  Space: O(h) DFS / O(w) BFS  (h=height, w=max width)
type TreeNode struct {
    Val   int
    Left  *TreeNode
    Right *TreeNode
}

// MAX DEPTH OF BINARY TREE
// Problem: Given the root of a binary tree, return its maximum depth (the number of nodes
//          along the longest root-to-leaf path).
// Intuition: depth of a node = 1 + max of its children's depths (postorder: children first).
// Steps:
//   1. If root==nil, return 0 (base case)
//   2. Recurse: l = maxDepth(left), r = maxDepth(right)
//   3. Return 1 + max(l, r)
// Time: O(n)  Space: O(h)  h=height of tree
func maxDepth(root *TreeNode) int {
    if root == nil {
        return 0 // base case: empty tree has depth 0
    }
    l, r := maxDepth(root.Left), maxDepth(root.Right)
    if l > r {
        return 1 + l
    }
    return 1 + r
}

// VALIDATE BST
// Problem: Given the root of a binary tree, determine if it is a valid BST where every
//          left descendant is strictly less and every right descendant strictly greater.
// Intuition: pass min/max bounds down; every node must be strictly inside (min, max).
// Steps:
//   1. Call validate(root, math.MinInt, math.MaxInt)
//   2. If node==nil, return true
//   3. If node.Val <= min or node.Val >= max, return false
//   4. Recurse: validate(left, min, node.Val) and validate(right, node.Val, max)
// Time: O(n)  Space: O(h)
// requires import "math"
func isValidBST(root *TreeNode) bool {
    return validate(root, math.MinInt, math.MaxInt)
}

func validate(node *TreeNode, min, max int) bool {
    if node == nil {
        return true
    }
    if node.Val <= min || node.Val >= max {
        return false
    }
    return validate(node.Left, min, node.Val) &&
        validate(node.Right, node.Val, max)
}

// BINARY TREE LEVEL ORDER TRAVERSAL
// Problem: Given the root of a binary tree, return its node values level by level from
//          left to right. Each level's values form a sub-list.
// Intuition: BFS with a queue; snapshot queue size at start of each level to separate levels.
// Steps:
//   1. If root==nil, return nil
//   2. Enqueue root
//   3. While queue not empty: levelSize = len(queue); dequeue exactly levelSize nodes
//   4. For each dequeued node: record its value, enqueue its children
//   5. Append level to result
// Time: O(n)  Space: O(w)  w=max width of tree
//
//       1        Level 0
//      / \
//     2   3      Level 1
//    / \
//   4   5        Level 2
// Level order: [[1], [2, 3], [4, 5]]
func levelOrder(root *TreeNode) [][]int {
    if root == nil {
        return nil
    }

    result := [][]int{}
    queue := []*TreeNode{root}

    for len(queue) > 0 {
        levelSize := len(queue) // number of nodes at current level
        level := []int{}

        for i := 0; i < levelSize; i++ {
            // dequeue front node
            node := queue[0]
            queue = queue[1:]

            level = append(level, node.Val)

            // enqueue children for next level
            if node.Left != nil {
                queue = append(queue, node.Left)
            }
            if node.Right != nil {
                queue = append(queue, node.Right)
            }
        }

        result = append(result, level)
    }

    return result
}

// LOWEST COMMON ANCESTOR
// Problem: Given a binary tree and two nodes p and q, find the deepest node that is
//          an ancestor of both p and q.
// Intuition: if p and q are in different subtrees, the current node is their LCA.
// Steps:
//   1. If root==nil or root==p or root==q, return root
//   2. Recurse: left = LCA(left), right = LCA(right)
//   3. If both non-nil: p and q split across subtrees; return root (the LCA)
//   4. Return whichever side is non-nil (both p and q are in that subtree)
// Time: O(n)  Space: O(h)
func lowestCommonAncestor(root, p, q *TreeNode) *TreeNode {
    if root == nil || root == p || root == q {
        return root // found one of the targets (or hit leaf)
    }
    left := lowestCommonAncestor(root.Left, p, q)
    right := lowestCommonAncestor(root.Right, p, q)
    if left != nil && right != nil {
        return root // p and q are in different subtrees: this node is the LCA
    }
    if left != nil {
        return left
    }
    return right
}

// DIAMETER OF BINARY TREE
// Problem: Given the root of a binary tree, return the length of the longest path between
//          any two nodes. The path does not need to pass through the root.
// Intuition: diameter through a node = left arm + right arm; track global max via closure.
// Steps:
//   1. Define depth(node) returning the longest arm going down one side
//   2. At each node: diameter = max(diameter, leftDepth + rightDepth)
//   3. Return 1 + max(leftDepth, rightDepth) as the arm length for the parent
//   4. Call depth(root); return diameter
// Time: O(n)  Space: O(h)
func diameterOfBinaryTree(root *TreeNode) int {
    diameter := 0
    var depth func(*TreeNode) int
    depth = func(node *TreeNode) int {
        if node == nil {
            return 0
        }
        l, r := depth(node.Left), depth(node.Right)
        if l+r > diameter {
            diameter = l + r
        }
        if l > r {
            return 1 + l
        }
        return 1 + r
    }
    depth(root)
    return diameter
}`,
    },
  },
  {
    id: "graphs",
    name: "7. Graphs",
    when: "Connected components, shortest path, cycle detection, dependency order",
    time: "O(V+E) BFS/DFS, O((V+E) log V) Dijkstra",
    space: "O(V+E)",
    coreIdea:
      "Graph algorithms explore nodes and edges to answer questions about connectivity, reachability, and ordering. BFS expands outward one layer at a time and guarantees the minimum number of edges to reach any node, making it the right choice for unweighted shortest paths. DFS follows one path as deep as possible before backtracking, making it useful for cycle detection, connected components, and topological ordering.",
    whenToUse: [
      "Finding connected components (number of islands, provinces)",
      "Shortest path in an unweighted graph (BFS guarantees minimum edges)",
      "Cycle detection in directed or undirected graphs",
      "Dependency ordering with topological sort (course prerequisites)",
      "Network connectivity and grouping problems",
      "Weighted shortest path with Dijkstra",
    ],
    keyPoints: [
      "BFS: shortest path in UNWEIGHTED graph (guarantees fewest edges)",
      "DFS: explore deep and backtrack, useful for cycle detection and connected components",
      "Mark visited BEFORE adding to queue (BFS) to prevent re-adding",
      "Topological sort: only for DAGs; Kahn's (indegree BFS) or DFS postorder",
      "Cycle detection in directed graph: 3-color DFS (white=unvisited, gray=in-stack, black=done)",
      "Dijkstra: weighted shortest path with min-heap, O((V+E) log V)",
    ],
    commonMistakes: [
      "Marking visited AFTER enqueuing allows duplicate entries in the queue. Mark visited BEFORE you enqueue",
      "Using DFS for shortest path gives some path, not the shortest one. Always use BFS for unweighted shortest path",
      "Not handling disconnected graphs: loop over all nodes as potential starting points, not just node 0",
      "Topological sort on a cyclic graph: check that the output length equals n; if not, there is a cycle",
    ],
    dontUseWhen: [
      "Edges have weights and you need the shortest path (use Dijkstra for non-negative weights, Bellman-Ford for negative)",
      "You only need to check whether two nodes are in the same component repeatedly after batch edge inserts (Union-Find is faster)",
      "The structure is a tree with no cycles (simpler recursive tree algorithms apply)",
      "The graph is too large to store as an adjacency list (use implicit BFS on the problem's state space instead)",
    ],
    variants: [
      {
        name: "BFS shortest path",
        behavior:
          "Queue of (node, distance); mark visited before enqueuing to prevent duplicates; return distance when target is reached",
        example: "Word Ladder, Shortest Path in Binary Matrix, 01 Matrix",
      },
      {
        name: "DFS connected components",
        behavior:
          "Outer loop over all nodes; for each unvisited node start a DFS and increment component count",
        example: "Number of Islands, Number of Provinces",
      },
      {
        name: "Cycle detection (directed)",
        behavior:
          "Three-color DFS: white=unvisited, gray=in current path, black=fully processed; gray-to-gray edge is a cycle",
        example: "Course Schedule, Course Schedule II",
      },
      {
        name: "Topological sort (Kahn's BFS)",
        behavior:
          "Build indegree array; start BFS from all zero-indegree nodes; decrement neighbors; if output size < n there is a cycle",
        example: "Course Schedule II, Alien Dictionary, Task Scheduler",
      },
    ],
    keyTakeaways: [
      "Mark nodes as visited before enqueuing in BFS, not after popping, to prevent the same node being added to the queue multiple times",
      "BFS gives shortest path in unweighted graphs; DFS gives a path but not necessarily the shortest",
      "For disconnected graphs, loop over all nodes as BFS/DFS starting points, not just node 0",
      "Topological sort output length less than n means a cycle exists",
      "Three-color DFS detects cycles in directed graphs: a back edge to a gray (in-progress) node is the cycle",
    ],
    problems: [
      "Number of Islands",
      "Course Schedule",
      "Clone Graph",
      "Word Ladder",
      "Pacific Atlantic Water Flow",
    ],
    code: {
      java: `// Time: O(V+E) BFS/DFS, O((V+E) log V) Dijkstra  Space: O(V+E)

// BFS - SHORTEST PATH
// Problem: Given an unweighted graph and start/end nodes, return the minimum number of
//          edges needed to travel from start to end. Return -1 if unreachable.
// Intuition: BFS explores level by level; first arrival = fewest edges.
// Steps:
//   1. Mark start as visited; enqueue (start, dist=0)
//   2. Dequeue; if target reached, return dist
//   3. For each unvisited neighbor: mark visited BEFORE enqueuing, enqueue (neighbor, dist+1)
//   4. Return -1 if unreachable
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

// NUMBER OF ISLANDS
// Problem: Given a 2D grid of '1's (land) and '0's (water), return the number of islands.
//          An island is a group of connected '1's (4-directionally).
// Intuition: each DFS from an unvisited '1' marks the whole island; count how many DFS calls we start.
// Steps:
//   1. Build a visited[][] array; scan every cell
//   2. If cell is unvisited land ('1'): increment count, call dfs(i, j)
//   3. dfs: if out-of-bounds, visited, or water, return
//   4. Mark visited[i][j]=true; recurse in all 4 directions using dirs array
int[][] dirs = {{0, 1}, {1, 0}, {0, -1}, {-1, 0}};

int numIslands(char[][] grid) {
    int m = grid.length, n = grid[0].length;
    boolean[][] visited = new boolean[m][n];
    int count = 0;
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            if (!visited[i][j] && grid[i][j] == '1') {
                count++;
                dfs(i, j, grid, visited);
            }
        }
    }
    return count;
}

void dfs(int i, int j, char[][] grid, boolean[][] visited) {
    if (i < 0 || i >= grid.length || j < 0 || j >= grid[0].length) return;
    if (visited[i][j] || grid[i][j] == '0') return;
    visited[i][j] = true;
    for (int[] dir : dirs) {
        dfs(i + dir[0], j + dir[1], grid, visited);
    }
}

// TOPOLOGICAL SORT (Kahn's BFS)
// Problem: Given n tasks and a list of prerequisite pairs [a, b] meaning b must happen before a,
//          return a valid ordering of all tasks, or an empty list if a cycle makes it impossible.
// Intuition: nodes with no prerequisites are ready immediately; processing them unblocks others.
// Steps:
//   1. Build graph and indegree array from edges
//   2. Enqueue all nodes with indegree==0
//   3. Dequeue node, add to order; for each neighbor, decrement indegree; enqueue if hits 0
//   4. If order.size() < n, a cycle exists (not all nodes processed)
int[] indegree = new int[n];
List<List<Integer>> graph = new ArrayList<>();
for (int i = 0; i < n; i++) graph.add(new ArrayList<>());
for (int[] edge : edges) {        // build graph + indegree
    graph.get(edge[0]).add(edge[1]);
    indegree[edge[1]]++;
}
Queue<Integer> queue = new LinkedList<>();
for (int i = 0; i < n; i++) {
    if (indegree[i] == 0) queue.offer(i);  // start with nodes that have no prereqs
}
List<Integer> order = new ArrayList<>();
while (!queue.isEmpty()) {
    int node = queue.poll();
    order.add(node);
    for (int neighbor : graph.get(node)) {
        if (--indegree[neighbor] == 0) queue.offer(neighbor);
    }
}
// if order.size() != n, there's a cycle

// CLONE GRAPH
// Problem: Given a node in a connected undirected graph, return a deep copy of the graph.
//          The graph may have cycles; every node has a list of its neighbors.
// Intuition: store clone in visited BEFORE recursing to break cycles.
// Steps:
//   1. If node==null, return null
//   2. If in visited, return existing clone
//   3. Create copy, store in visited; recurse on each neighbor and add clone to copy.neighbors
Map<Node, Node> visited = new HashMap<>();
Node cloneGraph(Node node) {
    if (node == null) return null;
    if (visited.containsKey(node)) return visited.get(node);
    Node copy = new Node(node.val);
    visited.put(node, copy);
    for (Node nb : node.neighbors) {
        copy.neighbors.add(cloneGraph(nb));
    }
    return copy;
}

// WORD LADDER
// Problem: Given beginWord, endWord, and a wordList, find the shortest transformation sequence
//          from beginWord to endWord where each step changes exactly one letter and the
//          result must be in wordList. Return 0 if no such sequence exists.
// Intuition: BFS finds the shortest path; try all 26 letters at every position.
// Steps:
//   1. Build wordSet; return 0 if endWord not in set
//   2. BFS from beginWord (steps=1); for each word, try swapping each position with a-z
//   3. If next==endWord, return steps+1; if in wordSet, remove and enqueue
//   4. Increment steps per level
int ladderLength(String begin, String end, List<String> wordList) {
    Set<String> wordSet = new HashSet<>(wordList);
    if (!wordSet.contains(end)) return 0;
    Queue<String> bfsQueue = new LinkedList<>();
    bfsQueue.offer(begin);
    int steps = 1;
    while (!bfsQueue.isEmpty()) {
        int size = bfsQueue.size();
        for (int i = 0; i < size; i++) {
            char[] word = bfsQueue.poll().toCharArray();
            for (int j = 0; j < word.length; j++) {
                char orig = word[j];
                for (char c = 'a'; c <= 'z'; c++) {
                    word[j] = c;
                    String next = new String(word);
                    if (next.equals(end)) return steps + 1;
                    if (wordSet.remove(next)) bfsQueue.offer(next);
                }
                word[j] = orig;
            }
        }
        steps++;
    }
    return 0;
}`,
      go: `// Time: O(V+E) BFS/DFS, O((V+E) log V) Dijkstra  Space: O(V+E)

// BFS - SHORTEST PATH
// Problem: Given an unweighted graph and start/end nodes, return the minimum number of
//          edges to travel from start to end. Return -1 if unreachable.
// Intuition: BFS explores level by level; the first arrival at any node is via the fewest edges.
// Steps:
//   1. Mark start as visited; enqueue (start, dist=0)
//   2. Dequeue node; if it is the target, return dist
//   3. For each unvisited neighbor: mark visited BEFORE enqueuing, enqueue (neighbor, dist+1)
//   4. Return -1 if target not reachable
// Time: O(V+E)  Space: O(V)
func bfsShortestPath(graph [][]int, start, end int) int {
    visited := make([]bool, len(graph))
    visited[start] = true
    type state struct{ node, dist int }
    queue := []state{{start, 0}}
    for len(queue) > 0 {
        curr := queue[0]
        queue = queue[1:]
        if curr.node == end {
            return curr.dist
        }
        for _, neighbor := range graph[curr.node] {
            if !visited[neighbor] {
                visited[neighbor] = true // mark BEFORE enqueuing
                queue = append(queue, state{neighbor, curr.dist + 1})
            }
        }
    }
    return -1
}

// NUMBER OF ISLANDS
// Problem: Given a 2D grid of '1's (land) and '0's (water), return the number of islands.
//          An island is surrounded by water and formed by connecting adjacent land cells (4-directionally).
// Intuition: each DFS from an unvisited '1' marks the whole island; count how many DFS calls we start.
// Steps:
//   1. Build visited[][] array; scan every cell
//   2. If cell is unvisited land ('1'): increment count, call dfs(i, j)
//   3. dfs: if out-of-bounds, visited, or water, return
//   4. Mark visited[i][j]=true; recurse in all 4 directions using dirs array
// Time: O(m*n)  Space: O(m*n) visited array + recursion stack
var islandDirs = [][2]int{{0, 1}, {1, 0}, {0, -1}, {-1, 0}}

func numIslands(grid [][]byte) int {
    m, n := len(grid), len(grid[0])
    visited := make([][]bool, m)
    for i := range visited {
        visited[i] = make([]bool, n)
    }
    count := 0
    for i := 0; i < m; i++ {
        for j := 0; j < n; j++ {
            if !visited[i][j] && grid[i][j] == '1' {
                count++
                dfsIsland(i, j, grid, visited)
            }
        }
    }
    return count
}

func dfsIsland(i, j int, grid [][]byte, visited [][]bool) {
    if i < 0 || i >= len(grid) || j < 0 || j >= len(grid[0]) {
        return
    }
    if visited[i][j] || grid[i][j] == '0' {
        return
    }
    visited[i][j] = true
    for _, dir := range islandDirs {
        dfsIsland(i+dir[0], j+dir[1], grid, visited)
    }
}

// TOPOLOGICAL SORT (Kahn's BFS via indegree)
// Problem: Given n tasks and prerequisite pairs, return a valid ordering of all tasks.
//          Return an empty slice if a cycle makes it impossible.
// Intuition: nodes with no incoming edges are ready first; processing one unblocks its dependents.
// Steps:
//   1. Build adjacency list and indegree array from edges
//   2. Enqueue all nodes with indegree==0
//   3. Dequeue a node, add to order, decrement indegree of neighbors
//   4. If a neighbor's indegree hits 0, enqueue it
//   5. If len(order) < n at the end, a cycle exists
// Time: O(V+E)  Space: O(V+E)
func topoSort(n int, prereqs [][2]int) []int {
    graph := make([][]int, n)
    indegree := make([]int, n)
    for _, p := range prereqs {
        graph[p[1]] = append(graph[p[1]], p[0])
        indegree[p[0]]++
    }
    queue := []int{}
    for i := 0; i < n; i++ {
        if indegree[i] == 0 {
            queue = append(queue, i)
        }
    }
    order := []int{}
    for len(queue) > 0 {
        node := queue[0]
        queue = queue[1:]
        order = append(order, node)
        for _, neighbor := range graph[node] {
            indegree[neighbor]--
            if indegree[neighbor] == 0 {
                queue = append(queue, neighbor)
            }
        }
    }
    // len(order) != n means cycle exists
    return order
}

// CLONE GRAPH
// Problem: Given a node in a connected undirected graph, return a deep copy of the graph.
//          The graph may contain cycles; each node has a val and a list of neighbors.
// Intuition: store the clone before recursing on neighbors to break cycles.
// Steps:
//   1. If node==nil, return nil
//   2. If node already in visited map, return its clone
//   3. Create a clone, store it in visited BEFORE recursing
//   4. Recurse on each neighbor, appending clones to copy.Neighbors
// Time: O(V+E)  Space: O(V)
type GraphNode struct {
    Val       int
    Neighbors []*GraphNode
}

func cloneGraph(node *GraphNode) *GraphNode {
    if node == nil {
        return nil
    }
    visited := map[*GraphNode]*GraphNode{}
    var dfs func(*GraphNode) *GraphNode
    dfs = func(n *GraphNode) *GraphNode {
        if c, ok := visited[n]; ok {
            return c // already cloned: return existing copy
        }
        c := &GraphNode{Val: n.Val}
        visited[n] = c // store BEFORE recursing to break cycles
        for _, nb := range n.Neighbors {
            c.Neighbors = append(c.Neighbors, dfs(nb))
        }
        return c
    }
    return dfs(node)
}

// WORD LADDER
// Problem: Given beginWord, endWord, and a wordList, find the length of the shortest
//          transformation sequence where each step changes exactly one letter and lands
//          on a word in wordList. Return 0 if no sequence exists.
// Intuition: BFS finds the shortest path; each word is a node, one-letter changes are edges.
// Steps:
//   1. Build wordSet from wordList; return 0 if endWord not in set
//   2. BFS from beginWord (steps=1)
//   3. For each word in current level: try all 26 letters at each position
//   4. If resulting word == endWord, return steps+1
//   5. If word is in wordSet, remove it and enqueue it; increment steps per level
// Time: O(M*26*N)  M=word length, N=number of words  Space: O(N)
func ladderLength(beginWord, endWord string, wordList []string) int {
    wordSet := make(map[string]bool)
    for _, w := range wordList {
        wordSet[w] = true
    }
    if !wordSet[endWord] {
        return 0
    }
    queue := []string{beginWord}
    steps := 1
    for len(queue) > 0 {
        size := len(queue)
        for _, word := range queue[:size] {
            b := []byte(word)
            for j := range b {
                orig := b[j]
                for c := byte('a'); c <= 'z'; c++ {
                    b[j] = c
                    next := string(b)
                    if next == endWord {
                        return steps + 1
                    }
                    if wordSet[next] {
                        delete(wordSet, next)
                        queue = append(queue, next)
                    }
                }
                b[j] = orig
            }
        }
        queue = queue[size:]
        steps++
    }
    return 0
}`,
    },
  },
  {
    id: "heap",
    name: "8. Heap / Priority Queue",
    when: "Top K elements, streaming median, merge K sorted lists",
    time: "O(log n) push/pop, O(n log k) top K",
    space: "O(k) top K, O(n) median",
    coreIdea:
      "A heap always gives you the minimum (or maximum) element in O(log n) time without sorting the whole collection. The counterintuitive rule: to find the K largest elements, use a min-heap of size K. The root holds the Kth largest (the weakest keeper), and when a new element beats the root it evicts it and takes its place. This runs in O(n log K) compared to O(n log n) for full sorting.",
    whenToUse: [
      "Finding the K largest or K smallest elements efficiently",
      "Computing a running (streaming) median as numbers arrive",
      "Merging K sorted lists or arrays",
      "Task scheduling with priorities",
      "Continuously tracking the minimum or maximum as elements are added or removed",
    ],
    keyPoints: [
      "OPPOSITE HEAP RULE: K largest → MIN-heap of size K; K smallest → MAX-heap of size K",
      "Go uses container/heap interface: implement Len, Less, Swap, Push, Pop",
      "Invert Less (i > j instead of i < j) to turn min-heap into max-heap",
      "Streaming median: max-heap for lower half, min-heap for upper half; roots give middle",
      "Merge K sorted: push (value, listIndex, elementIndex) into min-heap",
      "Heapify array is O(n), not O(n log n)",
    ],
    commonMistakes: [
      "Wrong heap type: K LARGEST needs a MIN-heap of size K (root = Kth largest, the weakest of the top K)",
      "Not evicting when the heap exceeds K: pop when size > K, not when size >= K",
      "Operating on an empty heap causes a panic: always check size before peek or pop",
      "In Java, (a, b) -> a - b is a min-heap and (a, b) -> b - a is a max-heap. Swapping them inverts results",
    ],
    dontUseWhen: [
      "You need random access or the Kth element of a static, fully known array (sort in O(n log n) or use QuickSelect in O(n) average)",
      "You need the max or min of a sliding window (monotonic deque gives O(n) instead of O(n log n))",
      "You need sorted order of all elements (sorting the array directly is simpler)",
      "The number of elements is small enough that a sorted list is fast enough and easier to reason about",
    ],
    variants: [
      {
        name: "Top K largest",
        behavior:
          "Min-heap of size K; push each element; pop when size exceeds K; root is the answer",
        example: "Kth Largest Element in an Array, Top K Frequent Elements",
      },
      {
        name: "Top K smallest",
        behavior:
          "Max-heap of size K; push each element; pop when size exceeds K; root is the answer",
        example: "Kth Smallest Element in a Matrix, K Closest Points to Origin",
      },
      {
        name: "Streaming median",
        behavior:
          "Max-heap for lower half, min-heap for upper half; balance sizes after each insert; median comes from one or both roots",
        example: "Find Median from Data Stream",
      },
      {
        name: "Merge K sorted",
        behavior:
          "Push (value, listIndex, elementIndex) into a min-heap; pop min, push its successor from the same list",
        example:
          "Merge K Sorted Lists, Smallest Range Covering Elements from K Lists",
      },
    ],
    keyTakeaways: [
      "K largest uses a min-heap of size K; K smallest uses a max-heap of size K (always the opposite heap type)",
      "Pop when heap size exceeds K, not when it equals K, to keep exactly K elements",
      "Streaming median: after each insert balance so the max-heap (lower half) has equal or one more element than the min-heap",
      "Heapifying an array from scratch is O(n), not O(n log n)",
      "Always check that the heap is non-empty before peek or pop to avoid panics",
    ],
    problems: [
      "Kth Largest Element",
      "Top K Frequent Elements",
      "Find Median from Data Stream",
      "Merge K Sorted Lists",
    ],
    code: {
      java: `// Time: O(n log k) top K  Space: O(k)

// KTH LARGEST ELEMENT
// Problem: Given an integer array and k, return the kth largest element.
//          Note: kth largest means the kth element in descending sorted order, not kth distinct.
// Intuition: keep only K largest seen; root is the Kth largest (the weakest keeper).
// Steps:
//   1. Push each element into minHeap
//   2. If minHeap.size() > k, poll (remove smallest)
//   3. Return minHeap.peek() after all elements processed
PriorityQueue<Integer> minHeap = new PriorityQueue<>();
for (int num : nums) {
    minHeap.offer(num);
    if (minHeap.size() > k) {
        minHeap.poll();  // remove smallest
    }
}
return minHeap.peek();  // Kth largest is at top

// STREAMING MEDIAN
// Problem: Design a data structure that supports adding numbers from a stream and
//          finding the median of all numbers added so far.
// Intuition: lo (max-heap) holds lower half, hi (min-heap) holds upper half; tops = middle values.
// Steps:
//   1. addNum: push to lo, then move lo.top to hi
//   2. If hi.size() > lo.size(), move hi.top back to lo
//   3. findMedian: if sizes equal, average tops; else lo.top is median
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
    return (lo.peek() + (double) hi.peek()) / 2.0;  // cast avoids int overflow
}

// TOP K FREQUENT ELEMENTS
// Problem: Given an integer array and k, return the k most frequently occurring elements.
//          The answer can be returned in any order.
// Intuition: min-heap of size K keeps the K highest-frequency elements; root is the least frequent keeper.
// Steps:
//   1. Build freq map
//   2. Min-heap ordered by frequency; push each unique element
//   3. If heap.size() > k, poll (evict least frequent)
//   4. Poll remaining elements into result array
Map<Integer, Integer> freq = new HashMap<>();
for (int n : nums) freq.merge(n, 1, Integer::sum);
PriorityQueue<Integer> topKHeap = new PriorityQueue<>(Comparator.comparingInt(freq::get)); // min by freq
for (int n : freq.keySet()) {
    topKHeap.offer(n);
    if (topKHeap.size() > k) topKHeap.poll(); // remove least frequent
}
int[] topK = new int[k];
for (int i = k - 1; i >= 0; i--) topK[i] = topKHeap.poll();

// MERGE K SORTED LISTS
// Problem: Given k sorted linked lists, merge them into one sorted linked list and return it.
// Intuition: the minimum across all list heads is always at the min-heap root.
// Steps:
//   1. Push all non-null list heads into a min-heap (ordered by val)
//   2. Poll minimum node; attach to result
//   3. Push node.next into heap if non-null
//   4. Repeat until heap empty; return dummy.next
ListNode mergeKLists(ListNode[] lists) {
    PriorityQueue<ListNode> mergeHeap = new PriorityQueue<>((a, b) -> a.val - b.val);
    for (ListNode h : lists) {
        if (h != null) mergeHeap.offer(h);
    }
    ListNode dummy = new ListNode(0), curr = dummy;
    while (!mergeHeap.isEmpty()) {
        ListNode node = mergeHeap.poll();
        curr.next = node;
        curr = curr.next;
        if (node.next != null) mergeHeap.offer(node.next);
    }
    return dummy.next;
}`,
      go: `// Time: O(n log k) top K  Space: O(k)
// Go's container/heap package requires implementing heap.Interface on your slice type.
// Less(i, j) defines ordering: i < j means min-heap; i > j means max-heap.
import "container/heap"

// Min-heap implements heap.Interface
type MinHeap []int

func (h MinHeap) Len() int {
    return len(h)
}
func (h MinHeap) Less(i, j int) bool {
    return h[i] < h[j]
}
func (h MinHeap) Swap(i, j int) {
    h[i], h[j] = h[j], h[i]
}
func (h *MinHeap) Push(x any) {
    *h = append(*h, x.(int))
}
func (h *MinHeap) Pop() any {
    old := *h
    x := old[len(old)-1]
    *h = old[:len(old)-1]
    return x
}

// Max-heap: invert Less so largest is at the root
type MaxHeap []int

func (h MaxHeap) Len() int {
    return len(h)
}
func (h MaxHeap) Less(i, j int) bool {
    return h[i] > h[j] // inverted: largest element floats to the top
}
func (h MaxHeap) Swap(i, j int) {
    h[i], h[j] = h[j], h[i]
}
func (h *MaxHeap) Push(x any) {
    *h = append(*h, x.(int))
}
func (h *MaxHeap) Pop() any {
    old := *h
    x := old[len(old)-1]
    *h = old[:len(old)-1]
    return x
}

// KTH LARGEST ELEMENT IN AN ARRAY
// Problem: Given an integer array and k, return the kth largest element (not kth distinct).
//          For example, k=1 returns the maximum.
// Intuition: a min-heap of size K keeps the top K largest; the root is the Kth largest.
// Steps:
//   1. Push each element into a min-heap
//   2. If heap size > K, pop the smallest (evict anything smaller than the top K)
//   3. Return heap root after all elements are processed
// Time: O(n log k)  Space: O(k)
func findKthLargest(nums []int, k int) int {
    h := &MinHeap{}
    heap.Init(h)
    for _, num := range nums {
        heap.Push(h, num)
        if h.Len() > k {
            heap.Pop(h) // evict the weakest of the current top-K
        }
    }
    return (*h)[0] // Kth largest sits at top
}

// FIND MEDIAN FROM DATA STREAM
// Problem: Design a data structure supporting addNum(int) and findMedian() on a growing
//          stream of numbers. findMedian returns the median of all numbers added so far.
// Intuition: split numbers into lower half (max-heap) and upper half (min-heap); median = tops.
// Steps:
//   1. AddNum: push to lo (max-heap), then move lo's top to hi (min-heap) to enforce ordering
//   2. Rebalance: if hi.size > lo.size, move hi's top back to lo
//   3. FindMedian: if lo.size > hi.size, return lo's top; else average lo and hi tops
// Time: O(log n) add  Space: O(n)
type MedianFinder struct {
    lo *MaxHeap // max-heap: lower half
    hi *MinHeap // min-heap: upper half
}

func NewMedianFinder() *MedianFinder {
    lo, hi := &MaxHeap{}, &MinHeap{}
    heap.Init(lo)
    heap.Init(hi)
    return &MedianFinder{lo: lo, hi: hi}
}

func (mf *MedianFinder) AddNum(num int) {
    heap.Push(mf.lo, num)
    heap.Push(mf.hi, heap.Pop(mf.lo)) // always push to hi via lo to maintain ordering
    if mf.hi.Len() > mf.lo.Len() {    // rebalance: lo should be >= hi in size
        heap.Push(mf.lo, heap.Pop(mf.hi))
    }
}

func (mf *MedianFinder) FindMedian() float64 {
    if mf.lo.Len() > mf.hi.Len() {
        return float64((*mf.lo)[0])
    }
    return float64((*mf.lo)[0]+(*mf.hi)[0]) / 2.0
}

// TOP K FREQUENT ELEMENTS
// Problem: Given an integer array and k, return the k most frequently occurring elements
//          in any order.
// Intuition: bucket sort by frequency is O(n); max frequency is len(nums) so bucket size is bounded.
// Steps:
//   1. Build freq map
//   2. Create bucket array of size len(nums)+1; bucket[f] holds all values with frequency f
//   3. Scan bucket from highest index down; collect until k results gathered
// Time: O(n)  Space: O(n)
func topKFrequent(nums []int, k int) []int {
    freq := make(map[int]int)
    for _, n := range nums {
        freq[n]++
    }
    // bucket[i] holds all numbers with frequency i; index is the frequency itself
    bucket := make([][]int, len(nums)+1)
    for v, f := range freq {
        bucket[f] = append(bucket[f], v)
    }
    result := []int{}
    for i := len(bucket) - 1; i >= 0 && len(result) < k; i-- {
        result = append(result, bucket[i]...)
    }
    return result[:k]
}

// MERGE K SORTED LISTS
// Problem: Given an array of k sorted linked lists, merge them all into one sorted linked list
//          and return it.
// Intuition: the next smallest node is always at the top of a min-heap over list heads.
// Steps:
//   1. Push each non-nil list head into a min-heap
//   2. Pop the minimum node, append to result list
//   3. Push its successor (node.Next) into the heap if non-nil
//   4. Repeat until heap is empty
// Time: O(N log K)  N=total nodes, K=number of lists  Space: O(K)
type listNodeHeap []*ListNode

func (h listNodeHeap) Len() int {
    return len(h)
}
func (h listNodeHeap) Less(i, j int) bool {
    return h[i].Val < h[j].Val // min-heap: smallest value at top
}
func (h listNodeHeap) Swap(i, j int) {
    h[i], h[j] = h[j], h[i]
}
func (h *listNodeHeap) Push(x any) {
    *h = append(*h, x.(*ListNode))
}
func (h *listNodeHeap) Pop() any {
    old := *h
    x := old[len(old)-1]
    *h = old[:len(old)-1]
    return x
}

func mergeKLists(lists []*ListNode) *ListNode {
    h := &listNodeHeap{}
    for _, head := range lists {
        if head != nil {
            heap.Push(h, head)
        }
    }
    dummy := &ListNode{}
    curr := dummy
    for h.Len() > 0 {
        node := heap.Pop(h).(*ListNode)
        curr.Next = node
        curr = curr.Next
        if node.Next != nil {
            heap.Push(h, node.Next)
        }
    }
    return dummy.Next
}`,
    },
  },
  {
    id: "dp",
    name: "9. Dynamic Programming",
    when: "Counting ways, optimization (min/max), overlapping subproblems",
    time: "O(n) 1D, O(n*m) 2D, O(n^2) interval DP",
    space: "O(n) to O(n*m), often reducible to O(1) with rolling variables",
    coreIdea:
      "Dynamic programming works when a problem has two properties: optimal substructure (the best solution to the whole problem uses best solutions to sub-problems) and overlapping subproblems (brute-force recursion solves the same sub-problems repeatedly). You define a state, write a recurrence relation that expresses the current state in terms of smaller states, establish base cases, and fill the table bottom-up (or cache top-down).",
    whenToUse: [
      "Problem asks for the count of ways (paths, combinations, arrangements)",
      "Problem asks for the minimum or maximum (cost, profit, steps, length)",
      "Optimal substructure: the optimal solution is built from optimal sub-solutions",
      "Overlapping subproblems: brute force solves the same sub-problem multiple times",
      "Problems with 'take or skip', 'include or exclude', or 'use at most once' decisions",
      "Sequence alignment: LCS, edit distance, longest palindromic subsequence",
    ],
    keyPoints: [
      "Identify DP: 'Can I break into smaller subproblems?' + 'Will I solve the same subproblem again?'",
      "Framework: 1) Define state 2) Recurrence relation 3) Base cases",
      "Recursion → Memo: just add a cache (check before computing, store after)",
      "Memo → Tabulation: create dp array, fill base cases, loop small to large",
      "0/1 Knapsack (use once): iterate items outer, capacity REVERSE inner",
      "Unbounded Knapsack (reuse): iterate items outer, capacity FORWARD inner",
      "Space optimization: if dp[i] only needs last row, use 1D rolling array",
    ],
    commonMistakes: [
      "Wrong state definition: a missing dimension means you cannot distinguish different situations at the same index",
      "Getting base cases wrong or forgetting them: always reason through dp[0] and dp[1] by hand",
      "Wrong loop direction in tabulation: dependencies must be fully computed before the current cell",
      "0/1 Knapsack loop direction: iterating capacity FORWARD allows reusing items (unbounded). Iterate REVERSE for single use",
    ],
    dontUseWhen: [
      "Each sub-problem is solved only once with no repeated work (pure recursion or divide-and-conquer is enough)",
      "The problem asks you to generate all solutions, not count or optimize (use backtracking)",
      "Greedy provably works at each step (DP has extra overhead if greedy is sufficient)",
      "The state space is too large to store (space optimization or a different approach is needed)",
    ],
    variants: [
      {
        name: "1D DP (linear sequence)",
        behavior:
          "dp[i] depends only on dp[i-1] and dp[i-2]; often reducible to two variables",
        example: "Climbing Stairs, House Robber, Fibonacci",
      },
      {
        name: "0/1 Knapsack",
        behavior:
          "Items used at most once; iterate capacity in reverse to prevent reuse within the same item pass",
        example: "Partition Equal Subset Sum, 0-1 Knapsack Problem",
      },
      {
        name: "Unbounded Knapsack",
        behavior:
          "Items can be reused; iterate capacity forward so the same item can contribute multiple times",
        example: "Coin Change, Coin Change II, Rod Cutting",
      },
      {
        name: "2D DP (two sequences)",
        behavior:
          "dp[i][j] relates to dp[i-1][j], dp[i][j-1], or dp[i-1][j-1]; often reducible to two 1D rows",
        example: "Longest Common Subsequence, Edit Distance, Unique Paths",
      },
    ],
    keyTakeaways: [
      "Define state first: dp[i] must uniquely encode everything you need to make the next decision",
      "Recurrence before code: write dp[i] = f(dp[i-1], ...) on paper before typing",
      "0/1 Knapsack iterates capacity in reverse; unbounded Knapsack iterates forward",
      "Base cases: reason through dp[0] and dp[1] by hand before filling the rest of the table",
      "Space optimization: if dp[i] only uses the previous row, replace the 2D table with two 1D arrays",
    ],
    problems: [
      "Climbing Stairs",
      "House Robber",
      "Coin Change",
      "Longest Common Subsequence",
      "Edit Distance",
      "Longest Increasing Subsequence",
    ],
    code: {
      java: `// Time: O(n) 1D, O(n*m) 2D  Space: O(n) or O(1) with rolling vars

// CLIMBING STAIRS
// Problem: You can climb 1 or 2 steps at a time. Given n steps, return the number of
//          distinct ways to reach the top.
// Intuition: ways[i] = ways[i-1] + ways[i-2] (Fibonacci recurrence).
// Steps:
//   1. dp[0]=1, dp[1]=1 (base cases)
//   2. For i from 2 to n: dp[i] = dp[i-1] + dp[i-2]
//   3. Return dp[n]
int[] dp = new int[n + 1];
dp[0] = dp[1] = 1;
for (int i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
}

// 0/1 KNAPSACK - Partition Equal Subset Sum (each item used at most once)
// Problem: Given an integer array nums, return true if you can partition it into two subsets
//          with equal sum. Each number can be used at most once.
// Intuition: dp[j] = can we reach sum j? Iterate capacity in reverse to prevent reuse.
// Steps:
//   1. dp[0]=true; target = total/2
//   2. For each num: iterate j from target DOWN to num
//   3. dp[j] |= dp[j-num]
//   4. Return dp[target]
boolean[] dp = new boolean[target + 1];
dp[0] = true;
for (int num : nums) {
    // Iterate capacity in reverse so each item is counted at most once.
    // If we went forward, dp[j-num] would already include the current item,
    // letting it be used multiple times (unbounded behaviour instead of 0/1).
    for (int j = target; j >= num; j--) {
        dp[j] = dp[j] || dp[j - num];
    }
}

// UNBOUNDED KNAPSACK - Coin Change (min coins, coins reusable)
// Problem: Given coin denominations and a target amount, return the fewest coins needed to make
//          up that amount. Each coin may be used unlimited times. Return -1 if not possible.
// Intuition: iterate capacity forward so same coin can be used multiple times.
// Steps:
//   1. dp[0]=0; dp[i]=amount+1 (sentinel for "unreachable")
//   2. For each coin, iterate i from coin to amount (forward = allow reuse)
//   3. dp[i] = min(dp[i], dp[i-coin]+1)
//   4. Return dp[amount] if <= amount, else -1
int[] dp = new int[amount + 1];
Arrays.fill(dp, amount + 1);  // amount+1 acts as "infinity" (unreachable)
dp[0] = 0;
for (int coin : coins) {
    // Iterate capacity forward so the same coin can be reused multiple times.
    // dp[i-coin] may already include this coin, and that is intentional here.
    for (int i = coin; i <= amount; i++) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
    }
}
return dp[amount] > amount ? -1 : dp[amount];

// LONGEST INCREASING SUBSEQUENCE (LIS)
// Problem: Given an integer array nums, return the length of the longest strictly increasing
//          subsequence. Elements do not need to be contiguous.
// Intuition: dp[i] = LIS ending at i; extend from every earlier smaller element.
// Steps:
//   1. dp[i]=1 for all i (each element is its own LIS)
//   2. For each i: for each j<i where nums[j]<nums[i]: dp[i] = max(dp[i], dp[j]+1)
//   3. Return max of dp
int[] dp = new int[n];
Arrays.fill(dp, 1);  // every element is an LIS of length 1 by itself
for (int i = 1; i < n; i++) {
    for (int j = 0; j < i; j++) {
        if (nums[j] < nums[i]) {
            dp[i] = Math.max(dp[i], dp[j] + 1);
        }
    }
}
int best = 1;
for (int len : dp) best = Math.max(best, len);
return best;

// HOUSE ROBBER
// Problem: Given an array of non-negative integers representing money in each house, return the
//          maximum amount you can rob without robbing two adjacent houses.
// Intuition: at each house, rob it (prev+money) or skip it (curr); only last two values needed.
// Steps:
//   1. prev=0, curr=0
//   2. next = max(curr, prev+money); then prev=curr, curr=next
//   3. Return curr
int prev = 0, curr = 0;
for (int money : nums) {
    int next = Math.max(curr, prev + money); // rob this or skip
    prev = curr;
    curr = next;
}
return curr;

// LONGEST COMMON SUBSEQUENCE (2D DP)
// Problem: Given two strings text1 and text2, return the length of their longest common
//          subsequence. A subsequence preserves relative order but need not be contiguous.
// Intuition: if chars match, extend; otherwise take the best of skipping one from either string.
// Steps:
//   1. lcs[i][j] = LCS of text1[0..i-1] and text2[0..j-1]; base case = 0
//   2. If chars match: lcs[i][j] = lcs[i-1][j-1] + 1
//   3. Else: lcs[i][j] = max(lcs[i-1][j], lcs[i][j-1])
//   4. Return lcs[m][n]
int[][] lcs = new int[m + 1][n + 1];
for (int i = 1; i <= m; i++) {
    for (int j = 1; j <= n; j++) {
        if (text1.charAt(i - 1) == text2.charAt(j - 1)) {
            lcs[i][j] = lcs[i - 1][j - 1] + 1; // chars match: extend both
        } else {
            lcs[i][j] = Math.max(lcs[i - 1][j], lcs[i][j - 1]); // skip one char
        }
    }
}
return lcs[m][n];

// EDIT DISTANCE
// Problem: Given two strings word1 and word2, return the minimum number of single-character
//          operations (insert, delete, replace) needed to transform word1 into word2.
// Intuition: if chars match, free; else 1 + min of replace, delete, insert.
// Steps:
//   1. Base cases: edit[i][0]=i, edit[0][j]=j
//   2. If chars match: edit[i][j] = edit[i-1][j-1]
//   3. Else: edit[i][j] = 1 + min(edit[i-1][j-1] replace, edit[i-1][j] delete, edit[i][j-1] insert)
//   4. Return edit[m][n]
int[][] edit = new int[m + 1][n + 1];
for (int i = 0; i <= m; i++) edit[i][0] = i;
for (int j = 0; j <= n; j++) edit[0][j] = j;
for (int i = 1; i <= m; i++) {
    for (int j = 1; j <= n; j++) {
        if (word1.charAt(i - 1) == word2.charAt(j - 1)) {
            edit[i][j] = edit[i - 1][j - 1]; // match: no cost
        } else {
            edit[i][j] = 1 + Math.min(edit[i - 1][j - 1], // replace
                             Math.min(edit[i - 1][j],      // delete
                                      edit[i][j - 1]));    // insert
        }
    }
}
return edit[m][n];`,
      go: `// Time: O(n) 1D, O(n*m) 2D  Space: O(n) or O(1) with rolling vars

// CLIMBING STAIRS
// Problem: You can climb 1 or 2 steps at a time. Given n steps, return the number of
//          distinct ways to reach the top.
// Intuition: ways to reach step i = ways from i-1 + ways from i-2 (Fibonacci recurrence).
// Steps:
//   1. Base cases: 1 way to reach step 1, 2 ways to reach step 2
//   2. For each step from 3 to n: current = prev + curr
//   3. Only need last two values; use two variables instead of array
// Time: O(n)  Space: O(1)
func climbStairs(n int) int {
    if n <= 2 {
        return n
    }
    prev, curr := 1, 2
    for i := 3; i <= n; i++ {
        prev, curr = curr, prev+curr
    }
    return curr
}

// 0/1 KNAPSACK - Partition Equal Subset Sum
// Problem: Given an integer array nums, return true if you can partition it into two subsets
//          with equal sum. Each number can be used at most once.
// Intuition: can we pick a subset summing to total/2? Each number used at most once.
// Steps:
//   1. Compute total; return false if odd
//   2. dp[j] = can we reach sum j; dp[0]=true
//   3. For each num, iterate capacity from target DOWN to num (prevents reusing num)
//   4. dp[j] |= dp[j-num]
//   5. Return dp[target]
// Time: O(n*target)  Space: O(target)
func canPartition(nums []int) bool {
    total := 0
    for _, n := range nums {
        total += n
    }
    if total%2 != 0 {
        return false
    }
    target := total / 2
    dp := make([]bool, target+1)
    dp[0] = true
    for _, num := range nums {
        // Iterate capacity from high to low so each number is used at most once.
        // If we went low to high, dp[j-num] would already reflect the current num
        // in this pass, letting it be included multiple times (0/1 becomes unbounded).
        for j := target; j >= num; j-- {
            dp[j] = dp[j] || dp[j-num]
        }
    }
    return dp[target]
}

// UNBOUNDED KNAPSACK - Coin Change (min coins to reach amount)
// Problem: Given coin denominations and a target amount, return the fewest coins needed to make
//          up that amount. Each coin may be used unlimited times. Return -1 if not possible.
// Intuition: each coin can be reused; iterate capacity forward so prior uses of same coin are allowed.
// Steps:
//   1. dp[0]=0; dp[i] = amount+1 (sentinel for "unreachable")
//   2. For each coin, iterate i from coin to amount (forward allows reuse)
//   3. dp[i] = min(dp[i], dp[i-coin]+1)
//   4. Return dp[amount] if reachable, else -1
// Time: O(amount * len(coins))  Space: O(amount)
func coinChange(coins []int, amount int) int {
    dp := make([]int, amount+1)
    for i := 1; i <= amount; i++ {
        dp[i] = amount + 1
    }
    for _, coin := range coins {
        // Iterate capacity from low to high so the same coin can be used multiple times.
        // dp[i-coin] is already updated in this pass, meaning we can build on a solution
        // that already used this coin, which is exactly what "unbounded" means.
        for i := coin; i <= amount; i++ {
            if dp[i-coin]+1 < dp[i] {
                dp[i] = dp[i-coin] + 1
            }
        }
    }
    if dp[amount] > amount {
        return -1
    }
    return dp[amount]
}

// LONGEST INCREASING SUBSEQUENCE (LIS) - O(n²) DP
// Problem: Given an integer array nums, return the length of the longest strictly increasing
//          subsequence. Elements do not need to be contiguous.
// Intuition: dp[i] = LIS ending at index i; try extending every earlier LIS that ends at a smaller value.
// Steps:
//   1. Initialize dp[i]=1 (every element is a valid LIS by itself)
//   2. For each i, check all j < i where nums[j] < nums[i]: dp[i] = max(dp[i], dp[j]+1)
//   3. Track global max across all dp[i]
// Time: O(n²)  Space: O(n)  (O(n log n) possible with binary search)
func lengthOfLIS(nums []int) int {
    n := len(nums)
    dp := make([]int, n)
    for i := range dp {
        dp[i] = 1 // every element is an LIS of length 1 by itself
    }
    best := 1
    for i := 1; i < n; i++ {
        for j := 0; j < i; j++ {
            if nums[j] < nums[i] && dp[j]+1 > dp[i] {
                dp[i] = dp[j] + 1 // extend LIS ending at j with nums[i]
            }
        }
        if dp[i] > best {
            best = dp[i]
        }
    }
    return best
}

// HOUSE ROBBER
// Problem: Given an array of non-negative integers representing money in each house, return the
//          maximum amount you can rob without robbing two adjacent houses.
// Intuition: at each house choose rob (prev+money) or skip (curr); only last two values needed.
// Steps:
//   1. prev=0 (two houses ago), curr=0 (one house ago)
//   2. For each house: next = max(curr, prev + money)
//   3. Advance: prev=curr, curr=next
//   4. Return curr
// Time: O(n)  Space: O(1)
func rob(nums []int) int {
    prev, curr := 0, 0
    for _, money := range nums {
        next := curr
        if prev+money > curr {
            next = prev + money // rob this house
        }
        prev, curr = curr, next
    }
    return curr
}

// LONGEST COMMON SUBSEQUENCE (2D DP)
// Problem: Given two strings text1 and text2, return the length of their longest common
//          subsequence. A subsequence preserves relative order but need not be contiguous.
// Intuition: if last chars match, extend; otherwise take the best of skipping one char from either string.
// Steps:
//   1. dp[i][j] = LCS of text1[0..i-1] and text2[0..j-1]; base case dp[0][*]=dp[*][0]=0
//   2. If text1[i-1]==text2[j-1]: dp[i][j] = dp[i-1][j-1] + 1
//   3. Else: dp[i][j] = max(dp[i-1][j], dp[i][j-1])
//   4. Return dp[m][n]
// Time: O(m*n)  Space: O(m*n)
func longestCommonSubsequence(text1, text2 string) int {
    m, n := len(text1), len(text2)
    dp := make([][]int, m+1)
    for i := range dp {
        dp[i] = make([]int, n+1)
    }
    for i := 1; i <= m; i++ {
        for j := 1; j <= n; j++ {
            if text1[i-1] == text2[j-1] {
                dp[i][j] = dp[i-1][j-1] + 1 // chars match: extend both
            } else {
                dp[i][j] = dp[i-1][j]
                if dp[i][j-1] > dp[i][j] {
                    dp[i][j] = dp[i][j-1] // skip one char, take best
                }
            }
        }
    }
    return dp[m][n]
}

// EDIT DISTANCE
// Problem: Given two strings word1 and word2, return the minimum number of single-character
//          operations (insert, delete, replace) needed to transform word1 into word2.
// Intuition: if chars match, no cost; otherwise 1 + min of the three operations.
// Steps:
//   1. dp[i][j] = edit distance for word1[0..i-1] to word2[0..j-1]
//   2. Base cases: dp[i][0]=i (delete i chars), dp[0][j]=j (insert j chars)
//   3. If word1[i-1]==word2[j-1]: dp[i][j] = dp[i-1][j-1]
//   4. Else: dp[i][j] = 1 + min(dp[i-1][j-1] replace, dp[i-1][j] delete, dp[i][j-1] insert)
//   5. Return dp[m][n]
// Time: O(m*n)  Space: O(m*n)
func minDistance(word1, word2 string) int {
    m, n := len(word1), len(word2)
    dp := make([][]int, m+1)
    for i := range dp {
        dp[i] = make([]int, n+1)
        dp[i][0] = i // delete i chars from word1
    }
    for j := 0; j <= n; j++ {
        dp[0][j] = j // insert j chars into word1
    }
    for i := 1; i <= m; i++ {
        for j := 1; j <= n; j++ {
            if word1[i-1] == word2[j-1] {
                dp[i][j] = dp[i-1][j-1] // no cost
            } else {
                dp[i][j] = 1 + min3(dp[i-1][j-1], dp[i-1][j], dp[i][j-1])
            }
        }
    }
    return dp[m][n]
}

func min3(a, b, c int) int {
    if a < b {
        if a < c {
            return a
        }
        return c
    }
    if b < c {
        return b
    }
    return c
}`,
    },
  },
  {
    id: "backtracking",
    name: "10. Backtracking",
    when: "Generate all combinations/permutations/subsets, constraint satisfaction",
    time: "O(2^n) subsets, O(n!) permutations",
    space: "O(n) recursion depth",
    coreIdea:
      "Backtracking builds solutions one choice at a time and abandons a path the moment it cannot lead to a valid answer. The template is always: CHOOSE an option, EXPLORE recursively, UN-CHOOSE to restore state. This prunes large parts of the search tree, but worst-case complexity is still exponential because you may explore every branch. Pruning constraints early (before the recursive call) is the key to making backtracking fast in practice.",
    whenToUse: [
      "Generating all combinations, permutations, or subsets",
      "Constraint satisfaction problems like Sudoku or N-Queens",
      "Path finding subject to constraints",
      "Partitioning a string into valid segments (palindrome partitioning)",
      "Any problem requiring exploration of all possible decisions in sequence",
    ],
    keyPoints: [
      "Pattern: CHOOSE → EXPLORE → UN-CHOOSE (always undo after recursive call returns)",
      "Subsets: start from current index (i+1) to avoid revisiting",
      "Permutations: use visited/used array, iterate from 0 every time",
      "Duplicates: sort first, then skip if nums[i] == nums[i-1] && !used[i-1]",
      "Prune EARLY: check constraints before recursing (break if candidates[i] > remaining)",
      "In Go: use closures; make a copy of path when saving to results (append([]int{}, path...))",
    ],
    commonMistakes: [
      "Forgetting to undo the choice after the recursive call: without backtracking the path accumulates wrong elements",
      "Not handling duplicates: sort the input first, then skip nums[i] == nums[i-1] when the previous element was not used",
      "Wrong start index: subsets and combinations use i+1 (no repeat); combination sum allowing repeats uses i (not i+1)",
      "Saving the path without copying: path is a shared slice, so append([]int{}, path...) is required before appending to results",
    ],
    dontUseWhen: [
      "You only need the count of solutions, not the solutions themselves (DP counts in polynomial time)",
      "The search space has optimal substructure and overlapping subproblems (DP is faster)",
      "The problem is about a single path with constraints (greedy or BFS may suffice)",
      "n is large (above 20-25): exponential backtracking will time out for large inputs",
    ],
    variants: [
      {
        name: "Subsets",
        behavior:
          "Add current state to results at every call; loop from start index to avoid revisiting earlier elements",
        example: "Subsets, Subsets II, Combination Sum III",
      },
      {
        name: "Permutations",
        behavior:
          "Use a visited boolean array; loop from index 0 each time; add to results only when path length equals n",
        example: "Permutations, Permutations II",
      },
      {
        name: "Combination sum (with reuse)",
        behavior:
          "Pass i (not i+1) to allow reusing the current element; prune when candidate exceeds remaining target",
        example: "Combination Sum, Combination Sum II",
      },
      {
        name: "Constraint satisfaction",
        behavior:
          "Check validity before placing; try all options at each cell; undo placement before trying next",
        example: "N-Queens, Sudoku Solver, Word Search",
      },
    ],
    keyTakeaways: [
      "Always undo the choice after the recursive call returns, or the path accumulates wrong elements",
      "Sort the input first when you need to skip duplicates, then skip nums[i] == nums[i-1] when the previous was not used",
      "Subsets and combinations use i+1 to avoid revisiting; combination sum with reuse uses i",
      "Copy the path slice before appending to results: the slice is shared and will be mutated later",
      "Prune before recursing: if candidates[i] > remaining, break early (works when input is sorted)",
    ],
    problems: [
      "Subsets",
      "Permutations",
      "Combination Sum",
      "N-Queens",
      "Word Search",
      "Palindrome Partitioning",
    ],
    code: {
      java: `// Time: O(2^n) subsets, O(n!) permutations  Space: O(n) recursion depth

// SUBSETS
// Problem: Given an integer array nums with unique elements, return all possible subsets
//          (the power set). The solution set must not contain duplicate subsets.
// Intuition: add path at every call (including empty), then extend by choosing each remaining element.
// Steps:
//   1. Add new ArrayList<>(path) to result at every call
//   2. For i from start: add nums[i] (choose), recurse with i+1 (explore), remove last (un-choose)
// Time: O(2^n)  Space: O(n)
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
// Problem: Given an array nums of distinct integers, return all possible permutations
//          in any order.
// Intuition: use a boolean used[] array so every element is available at each level.
// Steps:
//   1. If path.size()==n, save a copy to result
//   2. For i from 0: if used[i], skip
//   3. Mark used[i]=true, add nums[i], recurse, remove last, used[i]=false
// Time: O(n!)  Space: O(n)
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

// COMBINATION SUM
// Problem: Given an array of distinct integers candidates and a target integer, return all
//          unique combinations that sum to target. Each candidate may be used unlimited times.
// Intuition: pass i (not i+1) to allow reuse; prune when candidate exceeds remaining target.
// Steps:
//   1. Sort candidates before calling (enables break-based pruning)
//   2. If target==0, save new ArrayList<>(path) to result
//   3. For i from start: if candidates[i] > target, break (all further are larger)
//   4. Add candidates[i], recurse with (i, target-candidates[i]), remove last
// Time: O(2^target)  Space: O(target)
void backtrack(int[] candidates, int start, int target,
               List<Integer> path, List<List<Integer>> result) {
    if (target == 0) {
        result.add(new ArrayList<>(path));
        return;
    }
    for (int i = start; i < candidates.length; i++) {
        if (candidates[i] > target) break;  // prune
        path.add(candidates[i]);
        backtrack(candidates, i, target - candidates[i], path, result);  // i not i+1: allows reuse
        path.remove(path.size() - 1);
    }
}

// N-QUEENS
// Problem: Place n queens on an n×n chessboard so that no two queens attack each other.
//          Return all distinct solutions as board configurations.
// Intuition: place one queen per row; boolean arrays track attacked columns and both diagonals.
// Steps:
//   1. If row==n, save board copy to result
//   2. For each col: if cols[col] or either diagonal is under attack, skip
//   3. Mark all three attack arrays true, build row string, recurse to row+1
//   4. Remove last row from board, reset attack arrays (backtrack)
// Time: O(n!)  Space: O(n^2)
void solveNQueens(int n, int row, boolean[] cols, boolean[] diag1, boolean[] diag2,
                  List<String> board, List<List<String>> result) {
    if (row == n) { result.add(new ArrayList<>(board)); return; }
    for (int col = 0; col < n; col++) {
        // All cells on the same anti-diagonal (top-right to bottom-left) share the value row-col.
        // We add n to avoid negative indices. Example: row=0, col=3, n=4 → index 0-3+4=1.
        // All cells on the same main diagonal (top-left to bottom-right) share row+col,
        // which is always non-negative, so no offset is needed.
        if (cols[col] || diag1[row - col + n] || diag2[row + col]) continue;
        cols[col] = diag1[row - col + n] = diag2[row + col] = true;
        char[] rowArr = new char[n];
        Arrays.fill(rowArr, '.'); rowArr[col] = 'Q';
        board.add(new String(rowArr));
        solveNQueens(n, row + 1, cols, diag1, diag2, board, result);
        board.remove(board.size() - 1);
        cols[col] = diag1[row - col + n] = diag2[row + col] = false;
    }
}

// WORD SEARCH
// Problem: Given a 2D character grid and a string word, return true if the word exists as a
//          path of adjacent (horizontally or vertically) cells. Each cell may be used at most once.
// Intuition: DFS from every cell; overwrite to '#' to mark visited, restore on return.
// Steps:
//   1. For each cell, call dfsWord(board, word, r, c, 0)
//   2. In dfsWord: if idx==word.length(), return true
//   3. If out of bounds, wrong char, or '#', return false
//   4. Mark cell '#', recurse 4 directions with idx+1, restore cell, return found
// Time: O(m*n*4^L)  Space: O(L) depth
boolean exist(char[][] board, String word) {
    for (int r = 0; r < board.length; r++)
        for (int c = 0; c < board[0].length; c++)
            if (dfsWord(board, word, r, c, 0)) return true;
    return false;
}
boolean dfsWord(char[][] board, String word, int r, int c, int idx) {
    if (idx == word.length()) return true;
    if (r < 0 || r >= board.length || c < 0 || c >= board[0].length
        || board[r][c] != word.charAt(idx)) return false;
    char tmp = board[r][c]; board[r][c] = '#'; // mark visited
    boolean found = dfsWord(board, word, r+1, c, idx+1)
                 || dfsWord(board, word, r-1, c, idx+1)
                 || dfsWord(board, word, r, c+1, idx+1)
                 || dfsWord(board, word, r, c-1, idx+1);
    board[r][c] = tmp; // restore
    return found;
}

// PALINDROME PARTITIONING
// Problem: Given a string s, partition it such that every substring in the partition is a
//          palindrome. Return all possible palindrome partitioning of s.
// Intuition: try every prefix that passes isPalin, recurse on the rest, backtrack.
// Steps:
//   1. If start==s.length(), save new ArrayList<>(path) to result
//   2. For end from start+1 to s.length(): if s[start:end] is palindrome, add to path
//   3. Recurse with start=end, then remove last element (backtrack)
//   4. isPalin checks s[l]==s[r] while l<r, advancing inward
// Time: O(n * 2^n)  Space: O(n)
boolean isPalin(String s, int l, int r) {
    while (l < r) if (s.charAt(l++) != s.charAt(r--)) return false;
    return true;
}
void partitionHelper(String s, int start, List<String> path, List<List<String>> result) {
    if (start == s.length()) { result.add(new ArrayList<>(path)); return; }
    for (int end = start + 1; end <= s.length(); end++) {
        if (isPalin(s, start, end - 1)) {
            path.add(s.substring(start, end));
            partitionHelper(s, end, path, result);
            path.remove(path.size() - 1);
        }
    }
}`,
      go: `// Time: O(2^n) subsets, O(n!) permutations  Space: O(n) recursion depth

// SUBSETS
// Problem: Given an integer array nums with unique elements, return all possible subsets
//          (the power set). The solution set must not contain duplicate subsets.
// Intuition: at each step, CHOOSE an element, EXPLORE, then UN-CHOOSE (backtrack).
// Steps:
//   1. Add a copy of path to results at every call (including empty set)
//   2. For i from start to end: choose nums[i], recurse with i+1, un-choose
//   3. Copying path before saving is critical: the slice is reused during backtracking
// Time: O(2^n)  Space: O(n) recursion depth
func subsets(nums []int) [][]int {
    result := [][]int{}
    var backtrack func(start int, path []int)
    backtrack = func(start int, path []int) {
        // path is a slice, a view into an underlying array that backtracking reuses.
        // Without a copy, every saved result would point to the same memory and all
        // change as we backtrack. append([]int{}, path...) allocates a new backing
        // array so each saved snapshot is independent.
        tmp := append([]int{}, path...)
        result = append(result, tmp)
        for i := start; i < len(nums); i++ {
            path = append(path, nums[i]) // CHOOSE
            backtrack(i+1, path)          // EXPLORE
            path = path[:len(path)-1]     // UN-CHOOSE
        }
    }
    backtrack(0, []int{})
    return result
}

// PERMUTATIONS
// Problem: Given an array nums of distinct integers, return all possible permutations
//          in any order.
// Intuition: loop from index 0 each time; use a visited array to skip used elements.
// Steps:
//   1. If path is full, save a copy to results
//   2. For i from 0 to end: if used[i], skip
//   3. Mark used[i]=true, choose nums[i], recurse, un-choose, used[i]=false
// Time: O(n!)  Space: O(n)
func permute(nums []int) [][]int {
    result := [][]int{}
    used := make([]bool, len(nums))
    var backtrack func(path []int)
    backtrack = func(path []int) {
        if len(path) == len(nums) {
            result = append(result, append([]int{}, path...))
            return
        }
        for i := 0; i < len(nums); i++ {
            if used[i] {
                continue
            }
            used[i] = true
            path = append(path, nums[i])
            backtrack(path)
            path = path[:len(path)-1]
            used[i] = false
        }
    }
    backtrack([]int{})
    return result
}

// COMBINATION SUM
// Problem: Given an array of distinct integers candidates and a target integer, return all
//          unique combinations that sum to target. Each candidate may be used unlimited times.
// Intuition: pass i (not i+1) to allow reuse; sort and break when candidate > remaining.
// Steps:
//   1. Sort candidates (enables early pruning)
//   2. If remaining==0, save path copy to results
//   3. For i from start: if candidates[i] > remaining, break (sorted: all further are larger too)
//   4. Choose candidates[i], recurse with (i, remaining-candidates[i]), un-choose
// Time: O(2^target)  Space: O(target) depth
func combinationSum(candidates []int, target int) [][]int {
    sort.Ints(candidates) // required: break-based pruning only works on sorted input
    result := [][]int{}
    var backtrack func(start, remaining int, path []int)
    backtrack = func(start, remaining int, path []int) {
        if remaining == 0 {
            result = append(result, append([]int{}, path...))
            return
        }
        for i := start; i < len(candidates); i++ {
            if candidates[i] > remaining {
                break // prune: sorted, so all future are larger
            }
            path = append(path, candidates[i])
            backtrack(i, remaining-candidates[i], path) // i not i+1: allows reuse
            path = path[:len(path)-1]
        }
    }
    backtrack(0, target, []int{})
    return result
}

// N-QUEENS
// Problem: Place n queens on an n×n chessboard so that no two queens attack each other.
//          Return all distinct solutions as board configurations.
// Intuition: place exactly one queen per row; track cols and both diagonal directions to detect conflicts in O(1).
// Steps:
//   1. Use bool arrays: cols[], diag1 (row-col+n), diag2 (row+col) to mark attacked lines
//   2. For each row, try every column not under attack
//   3. Mark the three lines, recurse to next row, then unmark (backtrack)
//   4. When row==n, all queens placed; save the board copy
// Time: O(n!)  Space: O(n^2) for board storage
func solveNQueens(n int) [][]string {
    result := [][]string{}
    cols := make([]bool, n)
    // Anti-diagonal (top-right to bottom-left): every cell on the same anti-diagonal
    // has the same row-col value. That value can be negative (e.g. row=0, col=3 → -3),
    // so we add n to shift all indices into the range [0, 2n-1].
    // Main diagonal (top-left to bottom-right): every cell on the same main diagonal
    // has the same row+col value, which is always in [0, 2n-2], so no shift needed.
    diag1 := make([]bool, 2*n) // indexed by row - col + n
    diag2 := make([]bool, 2*n) // indexed by row + col
    var bt func(row int, board []string)
    bt = func(row int, board []string) {
        if row == n {
            result = append(result, append([]string{}, board...))
            return
        }
        for col := 0; col < n; col++ {
            if cols[col] || diag1[row-col+n] || diag2[row+col] {
                continue
            }
            cols[col], diag1[row-col+n], diag2[row+col] = true, true, true
            rowStr := make([]byte, n)
            for i := range rowStr {
                rowStr[i] = '.'
            }
            rowStr[col] = 'Q'
            bt(row+1, append(board, string(rowStr)))
            cols[col], diag1[row-col+n], diag2[row+col] = false, false, false
        }
    }
    bt(0, []string{})
    return result
}

// WORD SEARCH
// Problem: Given a 2D character grid and a string word, return true if the word exists as a
//          path of adjacent (horizontally or vertically) cells. Each cell may be used at most once.
// Intuition: DFS from every cell; temporarily overwrite to '#' to mark visited, then restore on return.
// Steps:
//   1. For each cell, call dfs(r, c, 0) as the potential start of the word
//   2. In dfs: if idx==len(word), return true (full match)
//   3. If out of bounds, wrong character, or visited ('#'), return false
//   4. Mark cell visited, recurse in all 4 directions with idx+1, then restore cell
// Time: O(m*n*4^L) where L is word length  Space: O(L) recursion depth
func exist(board [][]byte, word string) bool {
    rows, cols := len(board), len(board[0])
    var dfs func(r, c, idx int) bool
    dfs = func(r, c, idx int) bool {
        if idx == len(word) {
            return true
        }
        if r < 0 || r >= rows || c < 0 || c >= cols || board[r][c] != word[idx] {
            return false
        }
        tmp := board[r][c]
        board[r][c] = '#' // mark visited
        found := dfs(r+1, c, idx+1) || dfs(r-1, c, idx+1) ||
            dfs(r, c+1, idx+1) || dfs(r, c-1, idx+1)
        board[r][c] = tmp // restore
        return found
    }
    for r := 0; r < rows; r++ {
        for c := 0; c < cols; c++ {
            if dfs(r, c, 0) {
                return true
            }
        }
    }
    return false
}

// PALINDROME PARTITIONING
// Problem: Given a string s, partition it such that every substring in the partition is a
//          palindrome. Return all possible palindrome partitioning of s.
// Intuition: try every prefix that is a palindrome, recurse on the remainder, backtrack.
// Steps:
//   1. If start==len(s), save a copy of path (valid complete partition)
//   2. Try every end from start+1 to len(s): check if s[start:end] is a palindrome
//   3. If palindrome, add to path, recurse with start=end, then pop path (backtrack)
//   4. isPalin uses two pointers inward
// Time: O(n * 2^n)  Space: O(n) recursion depth
func partition(s string) [][]string {
    result := [][]string{}
    isPalin := func(l, r int) bool {
        for l < r {
            if s[l] != s[r] {
                return false
            }
            l++
            r--
        }
        return true
    }
    var bt func(start int, path []string)
    bt = func(start int, path []string) {
        if start == len(s) {
            result = append(result, append([]string{}, path...))
            return
        }
        for end := start + 1; end <= len(s); end++ {
            if isPalin(start, end-1) {
                bt(end, append(path, s[start:end]))
            }
        }
    }
    bt(0, []string{})
    return result
}`,
    },
  },
  {
    id: "intervals",
    name: "11. Intervals",
    when: "Merge overlapping, scheduling, finding gaps",
    time: "O(n log n)",
    space: "O(n)",
    coreIdea:
      "Interval problems become tractable once you sort by start time. After sorting, you only need to compare each interval with the last one you processed, because earlier intervals cannot overlap with a later one that already passed them. For meeting rooms, splitting starts and ends into two separately sorted arrays lets you track the running room count with two pointers in O(n) after the O(n log n) sort.",
    whenToUse: [
      "Merging overlapping intervals into non-overlapping ranges",
      "Finding free time slots between a list of busy intervals",
      "Determining the minimum number of meeting rooms needed",
      "Finding the intersection of two lists of intervals",
      "Maximizing the number of non-overlapping intervals",
      "Line sweep problems with events at start and end points",
    ],
    keyPoints: [
      "Always SORT first: by start for merging, by end for max non-overlapping",
      "Overlap condition (sorted by start): curr.start <= prev.end",
      "Merge: extend end with max(last.end, curr.end) because one interval may be fully inside another",
      "Meeting rooms II: two sorted arrays (starts/ends) + two pointers tracks room count",
      "Line sweep: event array with +1 start and -1 end, scan running total",
      "For intersection of two lists: advance the pointer with the smaller end time",
    ],
    commonMistakes: [
      "Not sorting intervals before processing: the sort is not optional, it is the foundation of every interval algorithm",
      "Wrong overlap condition: two intervals [a,b] and [c,d] overlap when c <= b (not strict <), so touching endpoints count as overlap for merge",
      "Not using max when merging: always use max(last.end, curr.end) because one interval may be completely inside another",
      "Mixing up sort keys: sort by START time for merging; sort by END time for maximizing non-overlapping count",
    ],
    dontUseWhen: [
      "Intervals are point-based (single values, not ranges): prefix sum or difference arrays are simpler",
      "You need to answer many range queries on a mutable dataset (segment tree or interval tree handles updates better)",
      "The problem is about scheduling jobs to maximize profit with deadlines (greedy on sorted jobs by deadline or profit)",
      "Intervals are defined on a circular timeline like clock hours (wrap-around logic changes the overlap condition)",
    ],
    variants: [
      {
        name: "Merge overlapping",
        behavior:
          "Sort by start; if current start <= last end, extend last end to max of both ends; otherwise append current",
        example: "Merge Intervals, Insert Interval",
      },
      {
        name: "Max non-overlapping (maximize count)",
        behavior:
          "Sort by END time; greedily pick intervals that do not overlap the last selected; increment count",
        example: "Non-overlapping Intervals, Activity Selection Problem",
      },
      {
        name: "Min rooms needed",
        behavior:
          "Sort starts and ends separately; use two pointers; increment rooms if next start is before the earliest end, otherwise advance the end pointer",
        example: "Meeting Rooms II, Car Pooling",
      },
      {
        name: "Line sweep",
        behavior:
          "Create +1 event at each start and -1 event at each end; sort all events; scan running total to find peaks",
        example: "Meeting Rooms II, Number of Airplanes in the Sky",
      },
    ],
    keyTakeaways: [
      "Sort by start for merging; sort by end for maximizing the count of non-overlapping intervals",
      "Overlap condition (after sorting by start): curr.start <= prev.end (touching counts as overlap for merge)",
      "When merging, always use max(last.end, curr.end) because one interval may be fully inside another",
      "Meeting Rooms II: after splitting and sorting starts and ends separately, one pointer pair is enough",
      "Line sweep handles complex overlap counting with simple +1 / -1 events",
    ],
    problems: [
      "Merge Intervals",
      "Insert Interval",
      "Meeting Rooms",
      "Meeting Rooms II",
      "Non-overlapping Intervals",
    ],
    code: {
      java: `// Time: O(n log n)  Space: O(n)

// MERGE INTERVALS
// Problem: Given an array of intervals, merge all overlapping intervals and return the result
//          as an array of non-overlapping intervals covering all input intervals.
// Intuition: after sorting by start, each interval only needs to compare with the last merged one.
// Steps:
//   1. Sort by start time
//   2. Add first interval to result
//   3. For each subsequent interval: if curr.start <= last.end, extend last.end = max(last.end, curr.end)
//   4. Otherwise, add curr as a new non-overlapping interval
// Time: O(n log n)  Space: O(n)
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

// MEETING ROOMS II
// Problem: Given an array of meeting time intervals, return the minimum number of conference
//          rooms required to hold all meetings simultaneously.
// Intuition: split starts and ends; a sorted two-pointer scan counts simultaneous meetings.
// Steps:
//   1. Separate starts[] and ends[], sort each independently
//   2. Walk starts with a pointer; if start < ends[endPtr], need a new room
//   3. Otherwise, a room freed: advance endPtr
//   4. rooms holds the peak simultaneous count
// Time: O(n log n)  Space: O(n)
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
}

// INSERT INTERVAL
// Problem: Given a sorted list of non-overlapping intervals and a new interval, insert the new
//          interval and merge any resulting overlaps. Return the updated list.
// Intuition: three-phase scan: copy before, merge overlapping, copy after.
// Steps:
//   1. Add all intervals that end before newInterval starts (no overlap)
//   2. While intervals overlap newInterval, expand newInterval to cover both
//   3. Add the merged newInterval, then add all remaining intervals
// Time: O(n)  Space: O(n)
List<int[]> insertResult = new ArrayList<>();
int i = 0, len = intervals.length;
// add all intervals that end before newInterval starts
while (i < len && intervals[i][1] < newInterval[0]) insertResult.add(intervals[i++]);
// merge all overlapping intervals with newInterval
while (i < len && intervals[i][0] <= newInterval[1]) {
    newInterval[0] = Math.min(newInterval[0], intervals[i][0]);
    newInterval[1] = Math.max(newInterval[1], intervals[i][1]);
    i++;
}
insertResult.add(newInterval);
while (i < len) insertResult.add(intervals[i++]); // add remainder

// NON-OVERLAPPING INTERVALS
// Problem: Given an array of intervals, return the minimum number of intervals you must remove
//          to make the rest non-overlapping.
// Intuition: greedily keep the interval with the earliest end; that leaves the most room for the rest.
// Steps:
//   1. Sort by end time
//   2. Track lastEnd = first interval's end
//   3. For each subsequent interval: if start < lastEnd, it overlaps, increment removed
//   4. Otherwise update lastEnd = current end (we keep this interval)
// Time: O(n log n)  Space: O(1)
// sort by END time; greedily keep earliest-ending intervals
Arrays.sort(intervals, (a, b) -> a[1] - b[1]);
int removed = 0, lastEnd = intervals[0][1];
for (int j = 1; j < intervals.length; j++) {
    if (intervals[j][0] < lastEnd) { // overlap: remove current
        removed++;
    } else {
        lastEnd = intervals[j][1]; // keep this interval
    }
}`,
      go: `// Time: O(n log n)  Space: O(n)
import "sort"

// MERGE INTERVALS
// Problem: Given an array of intervals, merge all overlapping intervals and return the result
//          as an array of non-overlapping intervals covering all input intervals.
// Intuition: after sorting by start, each interval only needs to compare with the last merged one.
// Steps:
//   1. Sort intervals by start time
//   2. Initialize result with a copy of the first interval
//   3. For each subsequent interval: if curr[0] <= last[1], extend last[1] = max(last[1], curr[1])
//   4. Otherwise append curr as a new non-overlapping interval
// Time: O(n log n)  Space: O(n)
func merge(intervals [][]int) [][]int {
    sort.Slice(intervals, func(i, j int) bool {
        return intervals[i][0] < intervals[j][0]
    })
    result := [][]int{{intervals[0][0], intervals[0][1]}} // copy to avoid mutating input
    for _, curr := range intervals[1:] {
        last := result[len(result)-1]
        if curr[0] <= last[1] { // overlap
            if curr[1] > last[1] {
                last[1] = curr[1] // extend (use max!)
            }
        } else {
            result = append(result, []int{curr[0], curr[1]})
        }
    }
    return result
}

// MEETING ROOMS II
// Problem: Given an array of meeting time intervals, return the minimum number of conference
//          rooms required to hold all meetings simultaneously.
// Intuition: separate starts and ends; sorted two-pointer counts peak simultaneous meetings.
// Steps:
//   1. Extract starts[] and ends[] from intervals, sort each independently
//   2. Walk starts in order; if start < ends[endPtr], open a new room (rooms++)
//   3. Otherwise a room freed up: advance endPtr (do not increment rooms)
//   4. Return rooms (peak count of overlapping meetings)
// Time: O(n log n)  Space: O(n)
func minMeetingRooms(intervals [][]int) int {
    n := len(intervals)
    starts := make([]int, n)
    ends := make([]int, n)
    for i, iv := range intervals {
        starts[i] = iv[0]
        ends[i] = iv[1]
    }
    sort.Ints(starts)
    sort.Ints(ends)

    rooms, endPtr := 0, 0
    for _, start := range starts {
        if start < ends[endPtr] {
            rooms++ // new meeting started before any ended
        } else {
            endPtr++ // a room freed up
        }
    }
    return rooms
}

// INSERT INTERVAL
// Problem: Given a sorted list of non-overlapping intervals and a new interval, insert the new
//          interval and merge any resulting overlaps. Return the updated list.
// Intuition: three-phase scan: copy non-overlapping before, expand newInterval through overlaps, copy rest.
// Steps:
//   1. Append all intervals that end before newInterval starts (intervals[i][1] < newInterval[0])
//   2. While intervals[i][0] <= newInterval[1]: expand newInterval to cover both
//   3. Append merged newInterval, then append all remaining intervals
// Time: O(n)  Space: O(n)
func insert(intervals [][]int, newInterval []int) [][]int {
    result := [][]int{}
    i := 0
    // add all intervals that end before newInterval starts
    for i < len(intervals) && intervals[i][1] < newInterval[0] {
        result = append(result, intervals[i])
        i++
    }
    // merge all overlapping intervals
    for i < len(intervals) && intervals[i][0] <= newInterval[1] {
        if intervals[i][0] < newInterval[0] {
            newInterval[0] = intervals[i][0]
        }
        if intervals[i][1] > newInterval[1] {
            newInterval[1] = intervals[i][1]
        }
        i++
    }
    result = append(result, newInterval)
    result = append(result, intervals[i:]...)
    return result
}

// NON-OVERLAPPING INTERVALS
// Problem: Given an array of intervals, return the minimum number of intervals you must remove
//          to make the rest non-overlapping.
// Intuition: greedily keep the interval with the earliest end, removing any that conflict with it.
// Steps:
//   1. Sort by end time
//   2. Initialize lastEnd = first interval's end
//   3. For each remaining interval: if iv[0] < lastEnd, it overlaps; increment removed
//   4. Otherwise keep it: update lastEnd = iv[1]
// Time: O(n log n)  Space: O(1)
func eraseOverlapIntervals(intervals [][]int) int {
    sort.Slice(intervals, func(i, j int) bool {
        return intervals[i][1] < intervals[j][1]
    })
    removed, lastEnd := 0, intervals[0][1]
    for _, iv := range intervals[1:] {
        if iv[0] < lastEnd { // overlap: remove this interval
            removed++
        } else {
            lastEnd = iv[1] // keep: update lastEnd
        }
    }
    return removed
}`,
    },
  },
  {
    id: "trie",
    name: "12. Trie (Prefix Tree)",
    when: "Prefix search, autocomplete, word dictionary, word search in grid",
    time: "O(L) per operation - L is word length",
    space: "O(N*L) - N words, L average length",
    coreIdea:
      "A Trie stores strings as a tree of characters so all strings sharing a prefix share that prefix's path. Insert, search, and startsWith all take O(L) time where L is the word length, which is much faster than scanning every stored string. The isEnd flag at a node is critical: it distinguishes a complete word from a prefix, so 'app' does not accidentally match when only 'apple' was inserted.",
    whenToUse: [
      "Prefix-based search: autocomplete, typeahead, search suggestions",
      "Word dictionary with insert, search, and startsWith operations",
      "Word search in a grid with pruning (Word Search II)",
      "Pattern matching with wildcards where '.' matches any character",
      "Finding the longest common prefix among a list of strings",
      "Any problem where grouping by prefix dramatically reduces search time",
    ],
    keyPoints: [
      "Each node has children (array[26] or map) and isEnd flag",
      "isEnd distinguishes complete words from mere prefixes (search vs startsWith)",
      "Insert/Search/StartsWith all run in O(word length)",
      "For wildcards '.': DFS trying all 26 children recursively",
      "Word Search II: build Trie of words, DFS on grid, prune by removing found words from the Trie",
      "Store the word string at end node to avoid rebuilding it during search",
    ],
    commonMistakes: [
      "Missing the isEnd check: search('app') returns true even when only 'apple' is in the Trie",
      "Case sensitivity issues: 'A' - 'a' gives a negative index and causes a panic. Normalize or use a map",
      "Memory waste with children[26] for sparse data: use a map[byte]*TrieNode for non-alphabetic or large character sets",
      "Not removing found words from the Trie in Word Search II: causes duplicate results for words that appear multiple times on the grid",
    ],
    dontUseWhen: [
      "You only need exact-match lookups with no prefix queries (a hash set gives O(1) average lookup)",
      "The character set is very large (Unicode): use a map[byte]*TrieNode instead of a fixed-size children array to avoid wasting memory",
      "The number of words is small (under a few hundred): a sorted slice with binary search is simpler",
      "You need substring search anywhere in the string, not just from the start (suffix array or KMP is more appropriate)",
    ],
    variants: [
      {
        name: "Basic insert/search/startsWith",
        behavior:
          "children[26] array per node; isEnd flag marks complete words; all three operations walk the tree one character at a time",
        example: "Implement Trie (Prefix Tree)",
      },
      {
        name: "Wildcard matching",
        behavior:
          "When '.' is encountered, DFS all 26 non-nil children recursively",
        example: "Design Add and Search Words Data Structure",
      },
      {
        name: "Word search in grid with Trie",
        behavior:
          "Build Trie from word list; DFS on grid using Trie to prune dead branches early; remove words from Trie as they are found",
        example: "Word Search II",
      },
      {
        name: "Search suggestions",
        behavior:
          "Insert all products sorted; for each prefix, find the Trie node, then DFS to collect up to 3 lexicographically smallest completions",
        example: "Search Suggestions System",
      },
    ],
    keyTakeaways: [
      "isEnd must be true for search to return true; startsWith does not need isEnd",
      "Normalize input to lowercase before indexing: uppercase chars give negative array indices and cause panics",
      "Word Search II: prune found words by removing them from the Trie to avoid returning duplicates",
      "Store the complete word string at the end node to avoid reconstructing it during DFS",
      "For non-alphabetic characters or large character sets, replace children[26] with a map to save memory",
    ],
    problems: [
      "Implement Trie",
      "Word Search II",
      "Design Add and Search Words",
      "Search Suggestions System",
    ],
    code: {
      java: `// Time: O(L) per operation  Space: O(N*L)  (L=word length, N=number of words)

// TRIE - prefix tree with insert, search, startsWith
// Problem: Implement a Trie data structure that supports insert(word), search(word) returning
//          true only if the exact word was inserted, and startsWith(prefix) returning true for any stored word with that prefix.
// Intuition: each character is a node; sharing a prefix means sharing a path; isEnd marks complete words.
// Steps:
//   1. Insert: walk character by character; create child if missing; set isEnd=true at last char
//   2. Search: walk to the end node with searchPrefix; return node != null && node.isEnd
//   3. StartsWith: walk to the prefix end node; return node != null (isEnd not required)
// Time: O(L) per op  Space: O(N*L)
class TrieNode {
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
}

// DESIGN ADD AND SEARCH WORDS
// Problem: Design a data structure supporting addWord(word) and search(word) where search
//          may use '.' as a wildcard that matches any single letter.
// Intuition: normal Trie insert; search branches into DFS over all children when '.' is seen.
// Steps:
//   1. addWord: standard Trie insert (walk chars, create nodes, set isEnd)
//   2. searchWord: call dfsSearch(root, word, 0)
//   3. In dfsSearch: if idx==word.length(), return node.isEnd
//   4. If char=='.', try all non-null children recursively; else follow the specific child
// Time: O(L) normal, O(26^L) worst case with dots  Space: O(N*L)
class WordDictionary {
    TrieNode root = new TrieNode();

    void addWord(String word) {
        TrieNode node = root;
        for (char c : word.toCharArray()) {
            int i = c - 'a';
            if (node.children[i] == null) node.children[i] = new TrieNode();
            node = node.children[i];
        }
        node.isEnd = true;
    }

    boolean searchWord(String word) {
        return dfsSearch(root, word, 0);
    }

    boolean dfsSearch(TrieNode node, String word, int idx) {
        if (idx == word.length()) return node.isEnd;
        char c = word.charAt(idx);
        if (c == '.') {
            for (TrieNode child : node.children)
                if (child != null && dfsSearch(child, word, idx + 1)) return true;
            return false;
        }
        TrieNode next = node.children[c - 'a'];
        return next != null && dfsSearch(next, word, idx + 1);
    }
}

// SEARCH SUGGESTIONS SYSTEM
// Problem: Given an array of product names and a searchWord, return a list of up to 3 product
//          suggestions after each character of searchWord is typed, sorted lexicographically.
// Intuition: sort products; maintain a [lo, hi] window that shrinks as each prefix character is added.
// Steps:
//   1. Sort products lexicographically
//   2. For each character typed: shrink lo from left and hi from right to products matching the prefix so far
//   3. Collect up to 3 products from lo to min(lo+3, hi+1) as suggestions
// Time: O(n log n + n*L)  Space: O(n)
List<List<String>> suggestedProducts(String[] products, String searchWord) {
    Arrays.sort(products); // lexicographic order
    List<List<String>> result = new ArrayList<>();
    int lo = 0, hi = products.length - 1;
    for (int k = 0; k < searchWord.length(); k++) {
        char c = searchWord.charAt(k);
        while (lo <= hi && (products[lo].length() <= k || products[lo].charAt(k) != c)) lo++;
        while (lo <= hi && (products[hi].length() <= k || products[hi].charAt(k) != c)) hi--;
        List<String> suggestions = new ArrayList<>();
        for (int j = lo; j < Math.min(lo + 3, hi + 1); j++) suggestions.add(products[j]);
        result.add(suggestions);
    }
    return result;
}`,
      go: `// Time: O(L) per operation  Space: O(N*L)  (L=word length, N=number of words)

// TRIE - prefix tree with Insert, Search, StartsWith
// Problem: Implement a Trie data structure that supports Insert(word), Search(word) returning
//          true only if the exact word was inserted, and StartsWith(prefix) for any stored word with that prefix.
// Intuition: each character is one node level; shared prefixes share the same path; isEnd marks complete words.
// Steps:
//   1. Insert: for each char compute idx=c-'a'; create child if nil; advance; set isEnd=true at end
//   2. Search: walk to end node via findNode; return node != nil && node.isEnd
//   3. StartsWith: return findNode(prefix) != nil (isEnd not required)
// Time: O(L) per op  Space: O(N*L)
type TrieNode struct {
    children [26]*TrieNode
    isEnd    bool
}

type Trie struct {
    root *TrieNode
}

func NewTrie() *Trie {
    return &Trie{root: &TrieNode{}}
}

func (t *Trie) Insert(word string) {
    node := t.root
    for _, c := range word {
        idx := c - 'a'
        if node.children[idx] == nil {
            node.children[idx] = &TrieNode{}
        }
        node = node.children[idx]
    }
    node.isEnd = true
}

func (t *Trie) Search(word string) bool {
    node := t.findNode(word)
    return node != nil && node.isEnd
}

func (t *Trie) StartsWith(prefix string) bool {
    return t.findNode(prefix) != nil
}

// findNode navigates to the end of s; returns nil if path broken
func (t *Trie) findNode(s string) *TrieNode {
    node := t.root
    for i := 0; i < len(s); i++ {
        idx := s[i] - 'a'
        if node.children[idx] == nil {
            return nil
        }
        node = node.children[idx]
    }
    return node
}

// DESIGN ADD AND SEARCH WORDS
// Problem: Design a data structure supporting AddWord(word) and Search(word) where search
//          may use '.' as a wildcard that matches any single letter.
// Intuition: normal Trie insert; Search uses DFS to branch into all children at each '.' character.
// Steps:
//   1. AddWord: standard Trie insert (create nodes, set isEnd)
//   2. Search: call dfs(root, word, 0)
//   3. In dfs: if idx==len(word), return node.isEnd
//   4. If word[idx]=='.', try all non-nil children with idx+1; else follow specific child
// Time: O(L) normal, O(26^L) worst case with dots  Space: O(N*L)
type WordDictionary struct {
    root *TrieNode
}

func (wd *WordDictionary) AddWord(word string) {
    node := wd.root
    for _, c := range word {
        idx := c - 'a'
        if node.children[idx] == nil {
            node.children[idx] = &TrieNode{}
        }
        node = node.children[idx]
    }
    node.isEnd = true
}

func (wd *WordDictionary) Search(word string) bool {
    return wd.dfs(wd.root, word, 0)
}

func (wd *WordDictionary) dfs(node *TrieNode, word string, idx int) bool {
    if idx == len(word) {
        return node.isEnd
    }
    c := word[idx]
    if c == '.' {
        for _, child := range node.children {
            if child != nil && wd.dfs(child, word, idx+1) {
                return true
            }
        }
        return false
    }
    next := node.children[c-'a']
    return next != nil && wd.dfs(next, word, idx+1)
}

// SEARCH SUGGESTIONS SYSTEM
// Problem: Given an array of product names and a searchWord, return a list of up to 3 product
//          suggestions after each character of searchWord is typed, sorted lexicographically.
// Intuition: sort products; maintain a [lo, hi] window that narrows to products matching the growing prefix.
// Steps:
//   1. Sort products lexicographically
//   2. For each character: shrink lo (advance while mismatch at position k) and hi (shrink similarly)
//   3. Collect up to 3 products from lo to min(lo+3, hi+1)
// Time: O(n log n + n*L)  Space: O(n)
func suggestedProducts(products []string, searchWord string) [][]string {
    sort.Strings(products)
    result := [][]string{}
    lo, hi := 0, len(products)-1
    for k := 0; k < len(searchWord); k++ {
        c := searchWord[k]
        for lo <= hi && (len(products[lo]) <= k || products[lo][k] != c) {
            lo++
        }
        for lo <= hi && (len(products[hi]) <= k || products[hi][k] != c) {
            hi--
        }
        suggestions := []string{}
        for j := lo; j < lo+3 && j <= hi; j++ {
            suggestions = append(suggestions, products[j])
        }
        result = append(result, suggestions)
    }
    return result
}`,
    },
  },
  {
    id: "union-find",
    name: "13. Union-Find (Disjoint Set)",
    when: "Dynamic connectivity, cycle detection in undirected graph, grouping",
    time: "O(alpha(n)) near O(1) amortized",
    space: "O(n)",
    coreIdea:
      "Union-Find maintains a collection of disjoint sets and answers two questions in nearly O(1): are two elements in the same set, and can we merge two sets. Path compression (making every node point directly to its root during find) and union by rank (attaching the smaller tree under the larger one) together make each operation O(alpha(n)), which is effectively constant for all practical input sizes.",
    whenToUse: [
      "Checking dynamic connectivity as edges are added",
      "Cycle detection in an undirected graph",
      "Grouping accounts or friend circles",
      "Counting connected components that change as edges are added",
      "Kruskal's algorithm for minimum spanning tree",
    ],
    keyPoints: [
      "Two operations: find(x) returns root, union(x,y) merges components",
      "Path compression: point node directly to root during find, which flattens the tree over time",
      "Union by rank: attach smaller-rank tree under the larger one, keeps the tree shallow",
      "Both optimizations together → O(α(n)) ≈ O(1) amortized per operation",
      "For 2D grids: flatten (r,c) to r*cols+c as the node index",
      "Track component count with a counter; decrement on each successful union",
    ],
    commonMistakes: [
      "Skipping path compression: without it, find degrades to O(log n) in the worst case",
      "Not initializing parent[i] = i for every node at the start",
      "Using Union for connectivity queries instead of Connected (which calls Find for both and compares)",
      "Forgetting to decrement the component count after a successful union",
    ],
    dontUseWhen: [
      "You need to split a component apart (Union-Find only merges, never splits)",
      "You need to know all members of a component, not just the representative (store a separate list per root)",
      "The graph is directed and you need cycle detection in a directed graph (use three-color DFS instead)",
      "Edges arrive in batch and you need the graph state after each batch (BFS/DFS on the final graph is simpler)",
    ],
    variants: [
      {
        name: "Basic connectivity",
        behavior:
          "parent[i] = i initially; find with path compression; union by rank; connected checks if Find(a) == Find(b)",
        example: "Number of Provinces, Graph Valid Tree",
      },
      {
        name: "Count components",
        behavior:
          "Start with count = n; decrement count on each successful union (when roots differ)",
        example:
          "Number of Connected Components in an Undirected Graph",
      },
      {
        name: "Cycle detection (undirected)",
        behavior:
          "For each edge (u, v): if Find(u) == Find(v), the edge creates a cycle; otherwise union them",
        example: "Redundant Connection, Graph Valid Tree",
      },
      {
        name: "2D grid flattening",
        behavior:
          "Map cell (r, c) to node r*cols + c; run Union-Find on the flattened indices",
        example:
          "Number of Islands (Union-Find variant), Surrounded Regions",
      },
    ],
    keyTakeaways: [
      "Always initialize parent[i] = i for every node before any union operations",
      "Path compression is required: without it, find degrades to O(log n) in the worst case",
      "Union by rank keeps the tree shallow; always attach the lower-rank root under the higher-rank root",
      "Decrement the component counter only when the two roots are different (a real merge happened)",
      "For directed graph cycle detection, use three-color DFS instead of Union-Find",
    ],
    problems: [
      "Number of Provinces",
      "Redundant Connection",
      "Accounts Merge",
      "Longest Consecutive Sequence",
    ],
    code: {
      java: `// Time: O(alpha(n)) per op, near O(1) amortized  Space: O(n)

// UNION-FIND - dynamic connectivity with path compression and union by rank
// Problem: Implement a Union-Find (Disjoint Set Union) structure that supports find(x), union(x,y),
//          and connected(x,y) in near O(1) amortized time. Used to track connected components.
// Intuition: find() returns the root (compressing path on the way); union() merges by rank to stay shallow.
// Steps:
//   1. Init parent[i]=i, rank[i]=0, count=n for all nodes
//   2. find(x): if parent[x]!=x, recurse and compress: parent[x]=find(parent[x])
//   3. union(x,y): find both roots; if same, return false; attach lower-rank under higher-rank; count--
//   4. connected(x,y): return find(x)==find(y)
// Time: O(alpha(n)) amortized  Space: O(n)
class UnionFind {
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
}

// NUMBER OF PROVINCES
// Problem: Given an n×n adjacency matrix isConnected where isConnected[i][j]==1 means cities i and j
//          are directly connected, return the total number of provinces (connected components).
// Intuition: treat each row/col as a node; union directly connected pairs; return remaining component count.
// Steps:
//   1. Create UnionFind of size n
//   2. For each pair (i, j) with i<j: if isConnected[i][j]==1, call uf.union(i, j)
//   3. Return uf.count (decremented once per successful union)
// Time: O(n^2 * alpha(n))  Space: O(n)
int findCircleNum(int[][] isConnected) {
    int n = isConnected.length;
    UnionFind uf = new UnionFind(n);
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            if (isConnected[i][j] == 1) uf.union(i, j);
    return uf.count;
}

// REDUNDANT CONNECTION
// Problem: Given a graph with n nodes and n edges (one extra edge creating a cycle), return the
//          redundant edge that can be removed to make the graph a tree.
// Intuition: process edges in order; the first edge whose endpoints already share a root is the redundant one.
// Steps:
//   1. Create UnionFind of size n+1 (nodes are 1-indexed)
//   2. For each edge [u, v]: call uf.union(u, v)
//   3. If union returns false (already connected), return that edge immediately
// Time: O(n * alpha(n))  Space: O(n)
int[] findRedundantConnection(int[][] edges) {
    int n = edges.length;
    UnionFind uf = new UnionFind(n + 1); // 1-indexed
    for (int[] edge : edges) {
        if (!uf.union(edge[0], edge[1])) {
            return edge; // already connected: this edge is redundant
        }
    }
    return new int[]{};
}`,
      go: `// Time: O(alpha(n)) per op, near O(1) amortized  Space: O(n)

// UNION-FIND - dynamic connectivity with path compression and union by rank
// Problem: Implement a Union-Find (Disjoint Set Union) structure that supports Find(x), Union(x,y),
//          and Connected(x,y) in near O(1) amortized time. Used to track connected components.
// Intuition: Find() returns the root and flattens the path; Union() merges by rank to keep trees shallow.
// Steps:
//   1. Init parent[i]=i, rank[i]=0, Count=n
//   2. Find(x): if parent[x]!=x, compress path and recurse: parent[x]=Find(parent[x])
//   3. Union(x,y): find both roots; if same return false; attach lower-rank under higher; Count--
//   4. Connected(x,y): return Find(x)==Find(y)
// Time: O(alpha(n)) amortized  Space: O(n)
type UnionFind struct {
    parent []int
    rank   []int
    Count  int // number of connected components
}

func NewUnionFind(n int) *UnionFind {
    parent := make([]int, n)
    for i := range parent {
        parent[i] = i
    }
    return &UnionFind{parent: parent, rank: make([]int, n), Count: n}
}

func (uf *UnionFind) Find(x int) int {
    if uf.parent[x] != x {
        uf.parent[x] = uf.Find(uf.parent[x]) // path compression
    }
    return uf.parent[x]
}

func (uf *UnionFind) Union(x, y int) bool {
    px, py := uf.Find(x), uf.Find(y)
    if px == py {
        return false // already in same component
    }
    // union by rank: attach smaller under larger
    if uf.rank[px] < uf.rank[py] {
        px, py = py, px
    }
    uf.parent[py] = px
    if uf.rank[px] == uf.rank[py] {
        uf.rank[px]++
    }
    uf.Count--
    return true
}

func (uf *UnionFind) Connected(x, y int) bool {
    return uf.Find(x) == uf.Find(y)
}

// NUMBER OF PROVINCES
// Problem: Given an n×n adjacency matrix isConnected where isConnected[i][j]==1 means cities i and j
//          are directly connected, return the total number of provinces (connected components).
// Intuition: treat each index as a node; union directly connected pairs; return remaining Count.
// Steps:
//   1. Create UnionFind of size n
//   2. For each pair (i, j) with i<j: if isConnected[i][j]==1, call uf.Union(i, j)
//   3. Return uf.Count
// Time: O(n^2 * alpha(n))  Space: O(n)
func findCircleNum(isConnected [][]int) int {
    n := len(isConnected)
    uf := NewUnionFind(n)
    for i := 0; i < n; i++ {
        for j := i + 1; j < n; j++ {
            if isConnected[i][j] == 1 {
                uf.Union(i, j)
            }
        }
    }
    return uf.Count
}

// REDUNDANT CONNECTION
// Problem: Given a graph with n nodes and n edges (one extra edge creating a cycle), return the
//          redundant edge that can be removed to make the graph a tree.
// Intuition: process edges in order; first edge whose endpoints already share a root is the answer.
// Steps:
//   1. Create UnionFind of size len(edges)+1 (1-indexed nodes)
//   2. For each edge: call uf.Union(edge[0], edge[1])
//   3. If Union returns false (same root), return that edge immediately
// Time: O(n * alpha(n))  Space: O(n)
func findRedundantConnection(edges [][]int) []int {
    uf := NewUnionFind(len(edges) + 1) // 1-indexed nodes
    for _, edge := range edges {
        if !uf.Union(edge[0], edge[1]) {
            return edge // already connected: this edge creates a cycle
        }
    }
    return nil
}`,
    },
  },
  {
    id: "linked-list",
    name: "14. Linked List",
    when: "Reversal, cycle detection, merge, find middle, reorder",
    time: "O(n)",
    space: "O(1) iterative, O(n) recursive",
    coreIdea:
      "Linked list problems almost always come down to careful pointer manipulation. The fast/slow pointer technique solves middle-finding and cycle detection in O(n) time and O(1) space by exploiting the speed difference between two pointers. A dummy head node eliminates special-casing when the operation might change the head, because you always have a node before the first real node to anchor your pointers.",
    whenToUse: [
      "In-place reversal of all or part of a linked list",
      "Cycle detection and finding the cycle entry point",
      "Finding the middle element with fast/slow pointers",
      "Merging two or more sorted linked lists",
      "Reordering nodes by position (reorder list, rotate list)",
    ],
    keyPoints: [
      "Use DUMMY node when head might change (merge, remove nodes)",
      "Fast/slow pointers: when fast reaches nil, slow is at middle",
      "Cycle start: after meeting point, reset one pointer to head, step both by 1 until they meet",
      "Reverse in groups: track prev group tail, connect properly after reversal",
      "Draw diagrams! Pointer manipulation is error-prone",
      "Always save next before modifying curr.Next",
    ],
    commonMistakes: [
      "Losing the next pointer before overwriting it: always save next = curr.Next before changing curr.Next",
      "Not using a dummy node when the head can change: merging or removing nodes at the head becomes much cleaner with a dummy",
      "Nil pointer panic: always check node != nil and node.Next != nil before dereferencing",
      "Forgetting to reconnect the tail when reversing a segment: the reversed segment's new tail still points to the old next",
    ],
    dontUseWhen: [
      "You need random access by index (use an array; linked lists are O(n) for index access)",
      "The operation requires sorting (merge sort on linked lists is O(n log n) but awkward; convert to array first if n is small)",
      "You need to search by value repeatedly (a hash map gives O(1) lookup; a linked list is O(n) per search)",
      "Memory overhead per node is a concern (each node carries a pointer; arrays have better cache locality)",
    ],
    variants: [
      {
        name: "Reversal",
        behavior:
          "Three pointers: prev (nil), curr (head), next; each step: save next, point curr to prev, advance prev and curr",
        example: "Reverse Linked List, Reverse Nodes in k-Group",
      },
      {
        name: "Fast/slow to find middle",
        behavior:
          "Both start at head; slow moves one step, fast moves two; when fast hits nil, slow is at the middle",
        example: "Middle of the Linked List, Reorder List, Sort List",
      },
      {
        name: "Cycle detection (Floyd's)",
        behavior:
          "After slow and fast meet, reset slow to head; advance both one step at a time until they meet again: that node is the cycle entry",
        example: "Linked List Cycle II, Find the Duplicate Number",
      },
      {
        name: "Merge with dummy head",
        behavior:
          "Create a dummy node; curr = dummy; compare heads of both lists and advance the smaller one; attach the remaining tail at the end",
        example: "Merge Two Sorted Lists, Merge K Sorted Lists",
      },
    ],
    keyTakeaways: [
      "Always save next = curr.Next before overwriting curr.Next or you lose the rest of the list",
      "Use a dummy head when the operation can change the real head: it removes all special-case code for the first node",
      "Fast/slow: when fast reaches nil, slow is at the middle; for even-length lists slow lands on the second middle",
      "Cycle entry: after the meeting point, reset one pointer to head and step both by one until they meet",
      "Check node != nil and node.Next != nil before dereferencing to avoid nil pointer panics",
    ],
    problems: [
      "Reverse Linked List",
      "Linked List Cycle",
      "Merge Two Sorted Lists",
      "Reorder List",
      "Remove Nth Node From End",
    ],
    code: {
      java: `// Time: O(n)  Space: O(1) iterative

// REVERSE LINKED LIST
// Problem: Given the head of a singly linked list, reverse the list in place and return
//          the new head.
// Intuition: walk forward while flipping each pointer backward; three pointers handle the state.
// Steps:
//   1. Initialize prev=null, curr=head
//   2. While curr!=null: save next=curr.next, flip curr.next=prev
//   3. Advance prev=curr, curr=next
//   4. Return prev (new head)
// Time: O(n)  Space: O(1)
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

// FIND MIDDLE
// Problem: Given the head of a singly linked list, return the middle node. For even-length
//          lists, return the second middle node.
// Intuition: fast moves 2x, so when fast reaches the end, slow is at the midpoint.
// Steps:
//   1. Initialize slow=head, fast=head
//   2. While fast!=null and fast.next!=null: slow=slow.next, fast=fast.next.next
//   3. Return slow (midpoint, or second-middle for even-length lists)
// Time: O(n)  Space: O(1)
ListNode findMiddle(ListNode head) {
    ListNode slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
    }
    return slow;
}

// DETECT CYCLE AND FIND START
// Problem: Given the head of a linked list, return the node where the cycle begins, or null
//          if there is no cycle.
// Intuition: fast/slow meet inside the cycle; resetting slow to head then stepping both by 1 finds the entry.
// Steps:
//   1. Move slow by 1, fast by 2; if they meet, a cycle exists
//   2. Reset slow=head; step both by 1 until slow==fast
//   3. Return slow (cycle entry point); return null if fast reaches nil
// Time: O(n)  Space: O(1)
ListNode detectCycle(ListNode head) {
    ListNode slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow == fast) {  // cycle detected
            // After slow and fast meet inside the cycle, reset slow to head.
            // Both pointers are now the same distance from the cycle entry point.
            // This is a mathematical property of Floyd's algorithm.
            // Step both by 1 until they meet again: that node is the cycle start.
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
// Problem: Given the heads of two sorted linked lists, merge them into one sorted linked list
//          and return the head of the merged list.
// Intuition: dummy head avoids special-casing the first node; always attach the smaller head.
// Steps:
//   1. Create dummy node; curr points to dummy
//   2. While both lists non-null: attach the smaller node, advance that list's pointer
//   3. Attach the remaining non-null list tail directly (no loop needed)
//   4. Return dummy.next
// Time: O(m+n)  Space: O(1)
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
}

// REORDER LIST
// Problem: Given the head of a linked list L0->L1->...->Ln, reorder it in-place to
//          L0->Ln->L1->Ln-1->... Do not return a new list; modify in place.
// Intuition: find middle, reverse second half, interleave two halves.
// Steps:
//   1. Find middle with fast/slow; split list at middle (slow.next=null)
//   2. Reverse the second half
//   3. Interleave: for each step, insert one node from second half after the current first-half node
// Time: O(n)  Space: O(1)
void reorderList(ListNode head) {
    if (head == null || head.next == null) return;
    // 1. find middle
    ListNode slow = head, fast = head;
    while (fast.next != null && fast.next.next != null) {
        slow = slow.next; fast = fast.next.next;
    }
    // 2. reverse second half
    ListNode prev = null, curr = slow.next;
    slow.next = null; // split
    while (curr != null) {
        ListNode next = curr.next; curr.next = prev; prev = curr; curr = next;
    }
    // 3. merge two halves alternately
    ListNode first = head, second = prev;
    while (second != null) {
        ListNode tmp1 = first.next, tmp2 = second.next;
        first.next = second; second.next = tmp1;
        first = tmp1; second = tmp2;
    }
}

// REMOVE NTH NODE FROM END
// Problem: Given the head of a linked list and an integer n, remove the nth node from the
//          end of the list in one pass and return the head.
// Intuition: create an n+1 gap so when fast hits nil, slow is just before the target node.
// Steps:
//   1. Create dummy; fast and slow start at dummy
//   2. Advance fast by n+1 steps to create the gap
//   3. Slide both until fast==null; slow is now the node before the target
//   4. slow.next = slow.next.next to unlink the target; return dummy.next
// Time: O(n)  Space: O(1)
ListNode removeNthFromEnd(ListNode head, int n) {
    ListNode dummy = new ListNode(0);
    dummy.next = head;
    ListNode fast = dummy, slow = dummy;
    for (int i = 0; i <= n; i++) fast = fast.next; // gap of n+1
    while (fast != null) { fast = fast.next; slow = slow.next; }
    slow.next = slow.next.next; // remove node
    return dummy.next;
}`,
      go: `// Time: O(n)  Space: O(1) iterative
type ListNode struct {
    Val  int
    Next *ListNode
}

// REVERSE LINKED LIST
// Problem: Given the head of a singly linked list, reverse the list in place and return
//          the new head.
// Intuition: three pointers flip each link backward; prev becomes the new head when curr reaches nil.
// Steps:
//   1. Initialize prev=nil, curr=head
//   2. While curr!=nil: save next=curr.Next, flip curr.Next=prev
//   3. Advance prev=curr, curr=next
//   4. Return prev (new head)
// Time: O(n)  Space: O(1)
func reverseList(head *ListNode) *ListNode {
    var prev *ListNode
    curr := head
    for curr != nil {
        next := curr.Next // CRITICAL: save next before overwriting curr.Next
        curr.Next = prev  // reverse the pointer
        prev = curr
        curr = next
    }
    return prev // prev is the new head
}

// FIND MIDDLE OF LINKED LIST
// Problem: Given the head of a singly linked list, return the middle node. For even-length
//          lists, return the second middle node.
// Intuition: fast moves 2x so when it reaches nil, slow is exactly at the middle.
// Steps:
//   1. Initialize slow=head, fast=head
//   2. While fast!=nil and fast.Next!=nil: slow=slow.Next, fast=fast.Next.Next
//   3. Return slow (for even-length: second-middle node)
// Time: O(n)  Space: O(1)
func findMiddle(head *ListNode) *ListNode {
    slow, fast := head, head
    for fast != nil && fast.Next != nil {
        slow = slow.Next
        fast = fast.Next.Next
    }
    return slow
}

// DETECT CYCLE AND FIND CYCLE ENTRY POINT - Floyd's algorithm
// Problem: Given the head of a linked list, return the node where the cycle begins, or nil
//          if there is no cycle.
// Intuition: fast/slow meet inside cycle; resetting slow to head then stepping both by 1 finds the entry.
// Steps:
//   1. Move slow by 1, fast by 2; if they meet, cycle exists
//   2. Reset slow=head; advance both by 1 until slow==fast
//   3. Return slow (the cycle's entry node); return nil if fast reaches nil
// Time: O(n)  Space: O(1)
func detectCycle(head *ListNode) *ListNode {
    slow, fast := head, head
    for fast != nil && fast.Next != nil {
        slow = slow.Next
        fast = fast.Next.Next
        if slow == fast { // cycle detected
            slow = head
            for slow != fast { // both move 1 step to find entry
                slow = slow.Next
                fast = fast.Next
            }
            return slow
        }
    }
    return nil
}

// MERGE TWO SORTED LISTS
// Problem: Given the heads of two sorted linked lists, merge them into one sorted linked list
//          and return the head of the merged list.
// Intuition: dummy head removes special-casing for the first node; always attach the smaller head.
// Steps:
//   1. Create dummy; curr=dummy
//   2. While both non-nil: attach smaller node, advance that list pointer, advance curr
//   3. Attach remaining non-nil tail directly (curr.Next=l1 or l2)
//   4. Return dummy.Next
// Time: O(m+n)  Space: O(1)
func mergeTwoLists(l1, l2 *ListNode) *ListNode {
    dummy := &ListNode{}
    curr := dummy
    for l1 != nil && l2 != nil {
        if l1.Val <= l2.Val {
            curr.Next = l1
            l1 = l1.Next
        } else {
            curr.Next = l2
            l2 = l2.Next
        }
        curr = curr.Next
    }
    if l1 != nil {
        curr.Next = l1
    } else {
        curr.Next = l2
    }
    return dummy.Next
}

// REORDER LIST
// Problem: Given the head of a linked list L0->L1->...->Ln, reorder it in-place to
//          L0->Ln->L1->Ln-1->... Do not return a new list; modify in place.
// Intuition: find middle, reverse second half, interleave the two halves together.
// Steps:
//   1. Find middle with fast/slow (stop when fast.Next==nil or fast.Next.Next==nil)
//   2. Split: slow.Next=nil; reverse the second half
//   3. Interleave: alternate inserting one node from second half after each first-half node
// Time: O(n)  Space: O(1)
func reorderList(head *ListNode) {
    if head == nil || head.Next == nil {
        return
    }
    // 1. find middle
    slow, fast := head, head
    for fast.Next != nil && fast.Next.Next != nil {
        slow = slow.Next
        fast = fast.Next.Next
    }
    // 2. reverse second half
    var prev *ListNode
    curr := slow.Next
    slow.Next = nil // split list
    for curr != nil {
        next := curr.Next
        curr.Next = prev
        prev = curr
        curr = next
    }
    // 3. merge two halves alternately
    first, second := head, prev
    for second != nil {
        tmp1, tmp2 := first.Next, second.Next
        first.Next = second
        second.Next = tmp1
        first = tmp1
        second = tmp2
    }
}

// REMOVE NTH NODE FROM END
// Problem: Given the head of a linked list and an integer n, remove the nth node from the
//          end of the list in one pass and return the head.
// Intuition: n+1 gap between fast and slow means when fast hits nil, slow is just before the target.
// Steps:
//   1. Create dummy; fast=slow=dummy
//   2. Advance fast n+1 times to open the gap
//   3. Slide both until fast==nil; slow is now before the target node
//   4. slow.Next = slow.Next.Next to unlink; return dummy.Next
// Time: O(n)  Space: O(1)
func removeNthFromEnd(head *ListNode, n int) *ListNode {
    dummy := &ListNode{Next: head}
    fast, slow := dummy, dummy
    for i := 0; i <= n; i++ { // advance fast by n+1 steps to create the gap
        fast = fast.Next
    }
    for fast != nil { // slide both until fast reaches nil
        fast = fast.Next
        slow = slow.Next
    }
    slow.Next = slow.Next.Next // unlink the nth node from end
    return dummy.Next
}`,
    },
  },
  {
    id: "greedy",
    name: "15. Greedy",
    when: "Interval scheduling, minimize/maximize with local optimal choices",
    time: "O(n log n) with sort, O(n) for tracking problems",
    space: "O(1)",
    coreIdea:
      "A greedy algorithm makes the locally optimal choice at each step and never revisits it. This works when the problem has the greedy-choice property: a locally best pick is always part of some globally optimal solution. For interval scheduling the key insight is to always take the interval that ends the earliest, because it leaves the maximum remaining time for future intervals and can never make things worse.",
    whenToUse: [
      "Interval scheduling: select the maximum number of non-overlapping activities",
      "Problems where a locally optimal choice at each step leads to the global optimum",
      "Sorting enables a clear 'best' choice at every step",
      "Tracking a running maximum or minimum (Jump Game, Buy and Sell Stock)",
      "Problems with a clear exchange argument: swapping two adjacent choices never makes things worse",
    ],
    keyPoints: [
      "Greedy-choice property: a locally optimal choice leads to a globally optimal solution",
      "Interval scheduling (max non-overlapping): sort by END time, always pick earliest-ending",
      "Interval merging (sort by start) vs non-overlapping selection (sort by end): do not mix the sort keys",
      "Jump Game: track max reachable index; if i > maxReach, you're stuck",
      "Prove it works: exchange argument or greedy-stays-ahead proof",
      "If greedy fails (e.g., 0/1 Knapsack), switch to DP",
    ],
    commonMistakes: [
      "Applying greedy where the greedy-choice property does not hold (0/1 Knapsack needs DP)",
      "Wrong sorting key: sort by END time for max non-overlapping, by START time for merging",
      "Greedy coin change only works for canonical coin systems like US coins. Use DP for arbitrary coin sets",
      "Not testing the greedy on small counterexamples: always verify with a tricky case before coding",
    ],
    dontUseWhen: [
      "The problem is 0/1 Knapsack or any variant where items are taken at most once and the greedy choice does not guarantee the global optimum (use DP)",
      "Coin change with arbitrary coin denominations: greedy only works for canonical coin systems like US denominations",
      "The greedy choice at step i depends on choices made at step i+2 or later (you need lookahead, which greedy does not have)",
      "You cannot prove an exchange argument: if swapping any two adjacent greedy choices cannot make things worse, greedy works; if it can, use DP",
    ],
    variants: [
      {
        name: "Interval scheduling (max non-overlapping)",
        behavior:
          "Sort by end time; greedily pick any interval that starts at or after the last selected end time",
        example: "Non-overlapping Intervals, Meeting Rooms",
      },
      {
        name: "Running max/reach",
        behavior:
          "Track the farthest reachable index; if current index exceeds it you are stuck",
        example: "Jump Game, Jump Game II",
      },
      {
        name: "Running min/max for profit",
        behavior: "Track the minimum seen so far; update max profit as you scan",
        example: "Best Time to Buy and Sell Stock",
      },
      {
        name: "Task scheduling",
        behavior:
          "Always process the highest-frequency remaining task; use a max-heap and cooldown counter",
        example: "Task Scheduler, Reorganize String",
      },
    ],
    keyTakeaways: [
      "Prove the greedy-choice property before coding: can you always include the greedy pick in an optimal solution",
      "Interval scheduling: sort by END time and pick the earliest-ending non-overlapping interval",
      "Greedy coin change only works for canonical (US-style) denominations; use DP for arbitrary coin sets",
      "Exchange argument: if swapping any two adjacent choices cannot hurt the answer, greedy is correct",
      "If greedy gives a counterexample on a small test, switch to DP immediately",
    ],
    problems: [
      "Non-overlapping Intervals",
      "Jump Game",
      "Best Time to Buy and Sell Stock",
      "Gas Station",
      "Meeting Rooms II",
      "Task Scheduler",
    ],
    code: {
      java: `// Time: O(n log n) with sort, O(n) for tracking  Space: O(1)

// MAX NON-OVERLAPPING INTERVALS
// Problem: Given an array of intervals, find the maximum number of non-overlapping intervals
//          you can select (equivalently: the minimum number to remove to make all remaining non-overlapping).
// Intuition: sort by end time; greedy pick of earliest-ending always leaves maximum room for the rest.
// Steps:
//   1. Sort by end time
//   2. Initialize count=1, lastEnd=intervals[0][1]
//   3. For each subsequent interval: if iv[0] >= lastEnd, take it (count++, update lastEnd)
// Time: O(n log n)  Space: O(1)
Arrays.sort(intervals, (a, b) -> a[1] - b[1]);
int count = 1, lastEnd = intervals[0][1];
for (int i = 1; i < intervals.length; i++) {  // start at 1: index 0 already counted
    int[] iv = intervals[i];
    if (iv[0] >= lastEnd) {  // no overlap
        count++;
        lastEnd = iv[1];
    }
}

// JUMP GAME
// Problem: Given an integer array nums where nums[i] is the max jump from index i, return
//          true if you can reach the last index starting from index 0.
// Intuition: track farthest reachable index; if current i exceeds it, you are stuck.
// Steps:
//   1. Initialize maxReach=0
//   2. For each i: if i > maxReach return false; update maxReach = max(maxReach, i+nums[i])
//   3. If loop completes without getting stuck, return true
// Time: O(n)  Space: O(1)
int maxReach = 0;
for (int i = 0; i < nums.length; i++) {
    if (i > maxReach) return false;  // stuck
    maxReach = Math.max(maxReach, i + nums[i]);
}
return true;

// BEST TIME TO BUY AND SELL STOCK
// Problem: Given an array prices where prices[i] is the stock price on day i, return the
//          maximum profit from one buy and one sell. Return 0 if no profit is possible.
// Intuition: track running minimum price; at each step compute profit if selling today.
// Steps:
//   1. Initialize minPrice=prices[0], maxProfit=0
//   2. For each price: update maxProfit = max(maxProfit, price-minPrice); update minPrice = min(minPrice, price)
//   3. Return maxProfit
// Time: O(n)  Space: O(1)
int minPrice = prices[0], maxProfit = 0;
for (int price : prices) {
    maxProfit = Math.max(maxProfit, price - minPrice);
    minPrice = Math.min(minPrice, price);
}
return maxProfit;

// GAS STATION
// Problem: Given gas[] and cost[] arrays for n stations in a circle, return the index of the
//          starting station that lets you complete the circuit, or -1 if none exists.
// Intuition: if total gas >= total cost a solution exists; reset start whenever tank goes negative.
// Steps:
//   1. For each station: accumulate totalGas and tank (gas[i]-cost[i])
//   2. If tank < 0: no station from current start to i can be the answer; set start=i+1, tank=0
//   3. After loop: if totalGas >= 0, return start; else return -1 (impossible)
// Time: O(n)  Space: O(1)
int canCompleteCircuit(int[] gas, int[] cost) {
    int totalGas = 0, tank = 0, start = 0;
    for (int i = 0; i < gas.length; i++) {
        int diff = gas[i] - cost[i];
        totalGas += diff;
        tank += diff;
        if (tank < 0) { // can't reach i+1 from start; try starting at i+1
            start = i + 1;
            tank = 0;
        }
    }
    return (totalGas >= 0) ? start : -1;
}

// TASK SCHEDULER
// Problem: Given a list of CPU tasks and a cooldown n, return the minimum number of intervals
//          needed to execute all tasks so the same task is not repeated within n intervals.
// Intuition: the most-frequent task creates (maxFreq-1) mandatory gaps of size n; other tasks fill them.
// Steps:
//   1. Count frequency of each task; sort freq[]
//   2. maxFreq = freq[25]; idle = (maxFreq-1)*n
//   3. For remaining tasks (freq[24] down to 0): subtract min(maxFreq-1, freq[i]) from idle (while idle>0)
//   4. Return tasks.length + max(0, idle)
// Time: O(n)  Space: O(1) (fixed 26-slot array)
int leastInterval(char[] tasks, int n) {
    int[] freq = new int[26];
    for (char t : tasks) freq[t - 'A']++;
    Arrays.sort(freq);
    int maxFreq = freq[25];
    // (maxFreq-1) gaps between occurrences of the busiest task, each gap needs n cooldown slots
    int idle = (maxFreq - 1) * n;
    for (int i = 24; i >= 0 && idle > 0; i--) {
        idle -= Math.min(maxFreq - 1, freq[i]); // each other task fills at most (maxFreq-1) idle slots
    }
    return tasks.length + Math.max(0, idle);
}`,
      go: `// Time: O(n log n) with sort, O(n) for tracking  Space: O(1)
import "sort"

// MAX NON-OVERLAPPING INTERVALS
// Problem: Given an array of intervals, find the maximum number of non-overlapping intervals
//          you can select (equivalently: the minimum number to remove to make all remaining non-overlapping).
// Intuition: sort by end time; greedily keep earliest-ending; overlapping ones must be removed.
// Steps:
//   1. Sort by end time
//   2. Initialize removed=0, lastEnd=intervals[0][1]
//   3. For each subsequent interval: if iv[0] < lastEnd, it overlaps (removed++); else update lastEnd
//   4. Return removed
// Time: O(n log n)  Space: O(1)
func eraseOverlapIntervals(intervals [][]int) int {
    sort.Slice(intervals, func(i, j int) bool {
        return intervals[i][1] < intervals[j][1]
    })
    removed, lastEnd := 0, intervals[0][1]
    for _, iv := range intervals[1:] {
        if iv[0] < lastEnd { // overlap: remove current
            removed++
        } else {
            lastEnd = iv[1] // no overlap: take this interval
        }
    }
    return removed
}

// JUMP GAME
// Problem: Given an integer array nums where nums[i] is the max jump from index i, return
//          true if you can reach the last index starting from index 0.
// Intuition: track farthest reachable index; if any index exceeds it, you are stuck.
// Steps:
//   1. Initialize maxReach=0
//   2. For each i: if i > maxReach return false (stuck); update maxReach = max(maxReach, i+nums[i])
//   3. If loop completes, return true
// Time: O(n)  Space: O(1)
func canJump(nums []int) bool {
    maxReach := 0
    for i, n := range nums {
        if i > maxReach {
            return false // stuck: no jump from a previous index can reach here
        }
        if i+n > maxReach {
            maxReach = i + n // update farthest reachable index
        }
    }
    return true
}

// BEST TIME TO BUY AND SELL STOCK
// Problem: Given an array prices where prices[i] is the stock price on day i, return the
//          maximum profit from one buy and one sell. Return 0 if no profit is possible.
// Intuition: track running minimum price seen so far; profit if selling today is price-minPrice.
// Steps:
//   1. Initialize minPrice=prices[0], profit=0
//   2. For each price after the first: update profit = max(profit, price-minPrice); update minPrice = min(minPrice, price)
//   3. Return profit
// Time: O(n)  Space: O(1)
func maxProfit(prices []int) int {
    minPrice, profit := prices[0], 0
    for _, price := range prices[1:] {
        if price-minPrice > profit {
            profit = price - minPrice
        }
        if price < minPrice {
            minPrice = price
        }
    }
    return profit
}

// GAS STATION
// Problem: Given gas[] and cost[] arrays for n stations in a circle, return the index of the
//          starting station that lets you complete the circuit, or -1 if none exists.
// Intuition: if total gas >= total cost a solution exists; reset start when tank goes negative.
// Steps:
//   1. For each station: compute diff=gas[i]-cost[i]; add to totalGas and tank
//   2. If tank < 0: no station from current start to i can work; set start=i+1, tank=0
//   3. After loop: if totalGas >= 0 return start; else return -1
// Time: O(n)  Space: O(1)
func canCompleteCircuit(gas, cost []int) int {
    totalGas, tank, start := 0, 0, 0
    for i := range gas {
        diff := gas[i] - cost[i]
        totalGas += diff
        tank += diff
        if tank < 0 { // can't reach i+1 from current start
            start = i + 1
            tank = 0
        }
    }
    if totalGas >= 0 {
        return start
    }
    return -1
}

// TASK SCHEDULER
// Problem: Given a list of CPU tasks and a cooldown n, return the minimum number of intervals
//          needed to execute all tasks so the same task is not repeated within n intervals.
// Intuition: most-frequent task creates (maxFreq-1) mandatory gaps of n; other tasks fill idle slots.
// Steps:
//   1. Count frequency per task; sort freq[] ascending
//   2. maxFreq=freq[25]; idle=(maxFreq-1)*n
//   3. For i from 24 down while idle>0: idle -= min(maxFreq-1, freq[i]) (each fills that many idle slots)
//   4. Return len(tasks) + max(0, idle)
// Time: O(n)  Space: O(1)
func leastInterval(tasks []byte, n int) int {
    freq := [26]int{}
    for _, t := range tasks {
        freq[t-'A']++
    }
    sort.Ints(freq[:])
    maxFreq := freq[25]
    // (maxFreq-1) gaps between occurrences of the most-frequent task; each gap has n cooldown slots
    idle := (maxFreq - 1) * n
    for i := 24; i >= 0 && idle > 0; i-- {
        if freq[i] < maxFreq-1 {
            idle -= freq[i] // this task fills freq[i] idle slots
        } else {
            idle -= maxFreq - 1 // caps at (maxFreq-1): last occurrence needs no cooldown after
        }
    }
    if idle < 0 {
        idle = 0
    }
    return len(tasks) + idle
}`,
    },
  },
  {
    id: "hash-map",
    name: "16. Hash Map",
    when: "Finding pairs/complements, counting frequencies, grouping by property",
    time: "O(n) average",
    space: "O(n)",
    coreIdea:
      "A hash map stores key-value pairs with O(1) average-time lookup, insert, and delete. The core use is eliminating an inner loop: instead of scanning the array again for a complement or duplicate, you store what you have seen so far in the map and check in one step. The critical rule for Two Sum and similar problems is to look up the complement before inserting the current element, not after, to avoid matching an element with itself.",
    whenToUse: [
      "Finding pairs or complements in O(n) instead of O(n²) (Two Sum)",
      "Counting frequencies of characters, numbers, or words",
      "Detecting duplicates or checking if two structures are equivalent",
      "Grouping elements by a shared property (group anagrams by sorted key)",
      "Two-way bijective mapping for isomorphic strings or word pattern matching",
      "Memoization cache in top-down DP",
    ],
    keyPoints: [
      "Check if the complement exists BEFORE adding the current element to the map",
      "For anagrams: use a sorted string or a fixed-size [26]int frequency array as the map key",
      "Use a Set when you only need to check if something exists; use a Map when you need the value or index",
      "Longest consecutive sequence: put all numbers in a set, then only start counting from numbers that have no left neighbor",
      "Two maps for two-way (bijective) mapping, e.g. isomorphic strings",
      "HashMap is O(1) average but O(n) worst case due to hash collisions",
    ],
    commonMistakes: [
      "Checking for the complement AFTER adding the current element: this finds the same element as its own complement (self-match)",
      "Wrong key for grouping anagrams: use the sorted string or a 26-element frequency signature, not the raw string",
      "Using HashMap when a simple Set suffices: if you only need to check existence, a set has lower overhead",
      "Assuming HashMap is always O(1): worst-case is O(n) per operation when many keys collide",
    ],
    dontUseWhen: [
      "You only need to check existence with no associated value (use a set for lower overhead and cleaner code)",
      "The keys are small non-negative integers (a direct-address array is faster with O(1) worst case and better cache performance)",
      "You need sorted order (hash maps have no ordering; use a balanced BST like TreeMap in Java or sort the keys)",
      "Memory is extremely tight (each hash map entry has pointer overhead; arrays use less memory per element)",
    ],
    variants: [
      {
        name: "Complement lookup (Two Sum style)",
        behavior:
          "Check if target - current is already in the map; if so return the pair; otherwise insert current with its index",
        example: "Two Sum, Three Sum (hash map variant), Four Sum II",
      },
      {
        name: "Frequency counting",
        behavior:
          "Increment map[element] for each element; use the counts for anagram checks, majority element, or top-K queries",
        example: "Valid Anagram, Top K Frequent Elements, Majority Element",
      },
      {
        name: "Grouping by key",
        behavior:
          "Compute a canonical key for each element (sorted string for anagrams, remainder for grouping); append to map[key]",
        example: "Group Anagrams, Find Duplicate File in System",
      },
      {
        name: "Consecutive sequence",
        behavior:
          "Load all numbers into a set; only start counting from numbers with no left neighbor (num - 1 not in set)",
        example: "Longest Consecutive Sequence",
      },
    ],
    keyTakeaways: [
      "Look up the complement before inserting the current element to avoid matching an element with itself",
      "For anagram grouping, use the sorted string or a fixed 26-integer frequency signature as the map key",
      "Use a set when you only need existence checks; use a map when you need the stored value or index",
      "Hash map is O(1) average but O(n) worst case per operation when hash collisions are severe",
      "Consecutive sequence: starting a count only when num - 1 is absent keeps the total time at O(n)",
    ],
    problems: [
      "Two Sum",
      "Group Anagrams",
      "Top K Frequent Elements",
      "Longest Consecutive Sequence",
      "Valid Anagram",
    ],
    code: {
      java: `// Time: O(n) average  Space: O(n)

// TWO SUM
// Problem: Given an integer array nums and a target, return the indices of the two numbers
//          that add up to target. Exactly one solution exists; each element used at most once.
// Intuition: store each element's index; check if its complement already exists before inserting.
// Steps:
//   1. Create seen map (value -> index)
//   2. For each nums[i]: compute complement = target-nums[i]
//   3. If seen contains complement, return [seen[complement], i]
//   4. Otherwise, seen.put(nums[i], i) and continue
// Time: O(n)  Space: O(n)
Map<Integer, Integer> seen = new HashMap<>();
for (int i = 0; i < nums.length; i++) {
    int complement = target - nums[i];
    if (seen.containsKey(complement)) {
        return new int[]{seen.get(complement), i};
    }
    seen.put(nums[i], i);
}

// FREQUENCY COUNT
// Problem: Count how many times each character appears in a string. Returns a map from
//          character to its frequency, useful as a building block for anagram and window problems.
// Steps:
//   1. Create frequency map
//   2. For each character, increment freq[c] (use merge() or getOrDefault(c,0)+1)
// Time: O(n)  Space: O(k) where k is number of distinct characters
Map<Character, Integer> freq = new HashMap<>();
for (char c : s.toCharArray()) {
    freq.merge(c, 1, Integer::sum);
}

// GROUP ANAGRAMS
// Problem: Given an array of strings, group the anagrams together and return the groups
//          in any order.
// Intuition: anagrams share the same sorted character sequence; use it as the map key.
// Steps:
//   1. For each string: sort its chars to form the key
//   2. groups.computeIfAbsent(key, ...).add(str)
//   3. Return all map values as a list
// Time: O(n * L log L) where L is string length  Space: O(n*L)
Map<String, List<String>> groups = new HashMap<>();
for (String str : strs) {
    char[] chars = str.toCharArray();
    Arrays.sort(chars);
    String key = new String(chars);
    groups.computeIfAbsent(key, k -> new ArrayList<>()).add(str);
}
return new ArrayList<>(groups.values());

// LONGEST CONSECUTIVE SEQUENCE
// Problem: Given an unsorted integer array nums, return the length of the longest consecutive
//          integer sequence. Must run in O(n) time.
// Intuition: only start counting from n where n-1 is absent (that is the sequence start), avoids O(n^2).
// Steps:
//   1. Load all numbers into a HashSet
//   2. For each n: if n-1 not in set, this is a sequence start; count while n+len is in set
//   3. Update longest = max(longest, len)
// Time: O(n)  Space: O(n)
Set<Integer> numSet = new HashSet<>(Arrays.asList(nums));
int longest = 0;
for (int n : numSet) {
    if (!numSet.contains(n - 1)) {  // only start from sequence beginning
        int len = 1;
        while (numSet.contains(n + len)) len++;
        longest = Math.max(longest, len);
    }
}

// TOP K FREQUENT ELEMENTS
// Problem: Given an integer array nums and an integer k, return the k most frequently
//          occurring elements in O(n) time without using a heap.
// Intuition: bucket sort by frequency: bucket[freq] holds all elements with that frequency.
// Steps:
//   1. Build freqMap: element -> count
//   2. Create bucket array of size n+1; place each element into bucket[its frequency]
//   3. Scan buckets from high to low, collecting elements until k gathered
// Time: O(n)  Space: O(n)
Map<Integer, Integer> freqMap = new HashMap<>();
for (int n : nums) freqMap.merge(n, 1, Integer::sum);
List<Integer>[] buckets = new List[nums.length + 1];
for (int v : freqMap.keySet()) {
    int f = freqMap.get(v);
    if (buckets[f] == null) buckets[f] = new ArrayList<>();
    buckets[f].add(v);
}
int[] topK = new int[k];
int idx = 0;
for (int i = buckets.length - 1; i >= 0 && idx < k; i--)
    if (buckets[i] != null)
        for (int v : buckets[i])
            if (idx < k) topK[idx++] = v;

// VALID ANAGRAM
// Problem: Given two strings s and t, return true if t is an anagram of s (same characters
//          with the same frequencies, just reordered).
// Intuition: increment count for s, decrement for t; if any count != 0, not an anagram.
// Steps:
//   1. If lengths differ, return false
//   2. For each char in s: count[c-'a']++
//   3. For each char in t: if --count[c-'a'] < 0 return false
//   4. Return true (all counts balanced)
// Time: O(n)  Space: O(1) (fixed 26-element array)
boolean isAnagram(String s, String t) {
    if (s.length() != t.length()) return false;
    int[] count = new int[26];
    for (char c : s.toCharArray()) count[c - 'a']++;
    for (char c : t.toCharArray()) {
        if (--count[c - 'a'] < 0) return false;
    }
    return true;
}`,
      go: `// Time: O(n) average  Space: O(n)
import "sort"

// TWO SUM
// Problem: Given an integer array nums and a target, return the indices of the two numbers
//          that add up to target. Exactly one solution exists; each element used at most once.
// Intuition: store each element's index; check complement before inserting to avoid self-pairing.
// Steps:
//   1. Create seen map (value -> index)
//   2. For each i, num: if seen[target-num] exists, return [j, i]
//   3. Otherwise seen[num] = i and continue
// Time: O(n)  Space: O(n)
func twoSum(nums []int, target int) []int {
    seen := make(map[int]int) // value -> index
    for i, num := range nums {
        if j, ok := seen[target-num]; ok {
            return []int{j, i} // complement found earlier at index j
        }
        seen[num] = i // store current number's index for future lookups
    }
    return nil
}

// FREQUENCY COUNT
// Problem: Count how many times each character appears in a string. Returns a map from
//          character to its frequency, useful as a building block for anagram and window problems.
// Steps:
//   1. Create freq map; for each byte: freq[c]++
//   2. Return the map
// Time: O(n)  Space: O(k)
func charFrequency(s string) map[byte]int {
    freq := make(map[byte]int)
    for i := 0; i < len(s); i++ {
        freq[s[i]]++
    }
    return freq
}

// GROUP ANAGRAMS
// Problem: Given an array of strings, group the anagrams together and return the groups
//          in any order.
// Intuition: anagrams share the same sorted character sequence; use it as the map key.
// Steps:
//   1. For each string: sort its bytes to get the canonical key
//   2. Append string to groups[key]
//   3. Collect all groups map values into the result
// Time: O(n * L log L)  Space: O(n*L)
func groupAnagrams(strs []string) [][]string {
    groups := make(map[string][]string)
    for _, s := range strs {
        b := []byte(s)
        sort.Slice(b, func(i, j int) bool { return b[i] < b[j] })
        key := string(b)
        groups[key] = append(groups[key], s)
    }
    result := make([][]string, 0, len(groups))
    for _, g := range groups {
        result = append(result, g)
    }
    return result
}

// LONGEST CONSECUTIVE SEQUENCE
// Problem: Given an unsorted integer array nums, return the length of the longest consecutive
//          integer sequence. Must run in O(n) time.
// Intuition: only start counting from n where n-1 is absent (sequence start), avoiding O(n^2) restarts.
// Steps:
//   1. Load all numbers into a set (map[int]bool)
//   2. For each n: if set[n-1] exists, skip (not the start)
//   3. Count length: increment while set[n+length] exists
//   4. Update longest = max(longest, length)
// Time: O(n)  Space: O(n)
func longestConsecutive(nums []int) int {
    set := make(map[int]bool)
    for _, n := range nums {
        set[n] = true
    }
    longest := 0
    for n := range set {
        if !set[n-1] { // n has no left neighbor: it's the start of a streak
            length := 1
            for set[n+length] {
                length++
            }
            if length > longest {
                longest = length
            }
        }
    }
    return longest
}

// TOP K FREQUENT ELEMENTS
// Problem: Given an integer array nums and an integer k, return the k most frequently
//          occurring elements in O(n) time without using a heap.
// Intuition: bucket sort by frequency eliminates the need for a heap or sort.
// Steps:
//   1. Build freq map (element -> count)
//   2. Create bucket slice of size n+1; bucket[f] holds all elements with frequency f
//   3. Scan buckets from len(bucket)-1 down, collecting into result until len(result)==k
// Time: O(n)  Space: O(n)
func topKFrequentHashMap(nums []int, k int) []int {
    freq := make(map[int]int)
    for _, n := range nums {
        freq[n]++
    }
    bucket := make([][]int, len(nums)+1)
    for v, f := range freq {
        bucket[f] = append(bucket[f], v)
    }
    result := []int{}
    for i := len(bucket) - 1; i >= 0 && len(result) < k; i-- {
        result = append(result, bucket[i]...)
    }
    return result[:k]
}

// VALID ANAGRAM
// Problem: Given two strings s and t, return true if t is an anagram of s (same characters
//          with the same frequencies, just reordered).
// Intuition: increment count for s chars, decrement for t chars; all must end at zero.
// Steps:
//   1. If len(s) != len(t), return false
//   2. Increment count[s[i]-'a'] and decrement count[t[i]-'a'] simultaneously
//   3. If any count[i] != 0 after the loop, return false; else return true
// Time: O(n)  Space: O(1)
func isAnagram(s, t string) bool {
    if len(s) != len(t) {
        return false
    }
    count := [26]int{}
    for i := 0; i < len(s); i++ {
        count[s[i]-'a']++
        count[t[i]-'a']--
    }
    for _, c := range count {
        if c != 0 {
            return false
        }
    }
    return true
}`,
    },
  },
  {
    id: "arrays-strings",
    name: "17. Arrays and Strings",
    when: "Running max/min subarray (Kadane's), prefix/suffix products, in-place modifications",
    time: "O(n) with hash map, O(n log n) with sorting",
    space: "O(n) for hash map/prefix arrays, O(1) for in-place tricks",
    coreIdea:
      "Arrays and strings support a set of fundamental techniques that avoid extra data structures. Kadane's algorithm decides at each index whether to extend the current subarray or start fresh: the answer is always the running maximum of those two choices. Product Except Self avoids division by making two passes over the array: a left pass builds prefix products and a right pass applies suffix products, using the output array itself as scratch space.",
    whenToUse: [
      "HashMap or set for O(1) lookups and frequency counting",
      "Sorting when the order of elements matters or enables two pointers",
      "In-place modifications to achieve O(1) space (Dutch National Flag, next permutation)",
      "Prefix and suffix pass to compute range products or running aggregates without division",
      "Frequency arrays (size 26) as faster alternatives to maps for lowercase letter problems",
      "Kadane's algorithm when the problem asks for the maximum sum contiguous subarray",
    ],
    keyPoints: [
      "Kadane's algorithm: at each position, either extend the previous subarray or start fresh. Start fresh when the running sum goes negative",
      "Product Except Self: one left-to-right pass builds prefix products, one right-to-left pass applies suffix products. No division needed",
      "In-place trick: use the output array itself as extra storage during computation to achieve O(1) extra space",
      "Dutch National Flag (3-way partition): use low/mid/high pointers to sort 0s, 1s, and 2s in one pass",
      "Sorting often unlocks a simpler approach: enables binary search, two pointers, or greedy",
      "For string problems: check if sorted forms match for anagrams, use frequency array instead of a map for lowercase letters",
    ],
    commonMistakes: [
      "Not checking the empty array or single element edge case: Kadane's must initialize with nums[0], not 0",
      "Off-by-one errors in window sizes, prefix indices, or product loop boundaries",
      "Integer overflow when multiplying or summing large numbers: use int64 in Go or long in Java",
      "Forgetting that sorting modifies the original array order: if original indices matter, save them first",
    ],
    dontUseWhen: [
      "You need multiple range sum or range product queries on a static array (build a prefix sum array once)",
      "The array is sorted and you are looking for a pair or triplet (two pointers is simpler and O(n))",
      "The problem requires tracking a running window of variable size (sliding window is cleaner)",
      "The values are keys with associated data (a hash map is needed, not raw array operations)",
    ],
    variants: [
      {
        name: "Kadane's max subarray",
        behavior:
          "At each index pick max(nums[i], currSum + nums[i]); track the overall maximum seen so far",
        example: "Maximum Subarray, Maximum Product Subarray",
      },
      {
        name: "Prefix and suffix product",
        behavior:
          "Left-to-right pass fills prefix products into output array; right-to-left pass multiplies in suffix products using a running variable",
        example: "Product of Array Except Self",
      },
      {
        name: "In-place three-way partition",
        behavior:
          "Low, mid, high pointers; swap mid with low when element is 0, swap mid with high when element is 2, leave 1 in place",
        example: "Sort Colors (Dutch National Flag), Next Permutation",
      },
      {
        name: "Frequency array for letters",
        behavior:
          "int[26] array indexed by c - 'a'; faster than a hash map for lowercase-only problems",
        example:
          "Valid Anagram, Find All Anagrams in a String, Check if Two Strings are Equivalent",
      },
    ],
    keyTakeaways: [
      "Kadane's: initialize with nums[0] not 0; all elements can be negative so 0 is not a safe sentinel",
      "Product Except Self: one left pass for prefix products, one right pass for suffix products, no division needed",
      "Dutch National Flag: do not increment mid after swapping with high because the swapped value is unchecked",
      "Sort a copy if you need sorted order but also need original indices",
      "Integer overflow for sum or product of large arrays: use int64 in Go or long in Java",
    ],
    problems: [
      "Maximum Subarray",
      "Product of Array Except Self",
      "Sort Colors",
      "Rotate Array",
      "Next Permutation",
    ],
    code: {
      java: `// Time: O(n)  Space: O(n) prefix/O(1) in-place tricks

// KADANE'S ALGORITHM - maximum subarray sum
// Problem: Given an integer array nums, find the contiguous subarray with the largest sum
//          and return that sum. The array may contain negative numbers.
// Intuition: at each index, extending is only better than restarting if currSum > 0.
// Steps:
//   1. Initialize maxSum=nums[0], currSum=nums[0] (not 0 in case all elements are negative)
//   2. For i from 1: currSum = max(nums[i], currSum+nums[i]); maxSum = max(maxSum, currSum)
//   3. Return maxSum
// Time: O(n)  Space: O(1)
int maxSum = nums[0], currSum = nums[0];
for (int i = 1; i < nums.length; i++) {
    currSum = Math.max(nums[i], currSum + nums[i]);
    maxSum = Math.max(maxSum, currSum);
}

// PRODUCT EXCEPT SELF
// Problem: Given an integer array nums, return an array output where output[i] is the product
//          of all elements except nums[i]. Must run in O(n) with no division operator.
// Intuition: left pass builds prefix products into result; right pass multiplies suffix products in-place.
// Steps:
//   1. result[0]=1; for i=1..n-1: result[i] = result[i-1] * nums[i-1] (prefix products)
//   2. Initialize right=1; for i=n-1..0: result[i] *= right; right *= nums[i] (apply suffix)
//   3. Return result (O(1) extra space, output array used as scratch)
// Time: O(n)  Space: O(1) extra
int[] result = new int[nums.length];
result[0] = 1;
for (int i = 1; i < nums.length; i++) {
    result[i] = result[i - 1] * nums[i - 1]; // prefix product
}
int right = 1;
for (int i = nums.length - 1; i >= 0; i--) {
    result[i] *= right;  // multiply by suffix product
    right *= nums[i];
}

// DUTCH NATIONAL FLAG
// Problem: Given an array containing only 0s, 1s, and 2s, sort it in place in O(n) time
//          and O(1) space without using a sort function.
// Intuition: maintain three regions; mid scans forward; only swap-with-high does not advance mid.
// Steps:
//   1. Initialize low=0, mid=0, high=n-1
//   2. While mid<=high: if nums[mid]==0 swap with low++, mid++; if 1 mid++; if 2 swap with high--, do NOT advance mid
//   3. Region [0..low-1]=0s, [low..mid-1]=1s, [high+1..n-1]=2s
// Time: O(n)  Space: O(1)
int low = 0, mid = 0, high = nums.length - 1;
while (mid <= high) {
    if (nums[mid] == 0) {
        swap(nums, low++, mid++);
    } else if (nums[mid] == 1) {
        mid++;
    } else {
        swap(nums, mid, high--); // don't increment mid: check swapped value
    }
}

// ROTATE ARRAY
// Problem: Given an integer array nums, rotate it to the right by k steps in place.
//          For example, [1,2,3,4,5] rotated right by 2 becomes [4,5,1,2,3].
// Intuition: reversing the whole array then reversing the two segments achieves a rotation in-place.
// Steps:
//   1. k %= n (handle k > n)
//   2. reverse(0, n-1), then reverse(0, k-1), then reverse(k, n-1)
// Time: O(n)  Space: O(1)
void rotate(int[] nums, int k) {
    int n = nums.length;
    k %= n;
    reverse(nums, 0, n - 1);
    reverse(nums, 0, k - 1);
    reverse(nums, k, n - 1);
}
void reverse(int[] nums, int l, int r) {
    while (l < r) { int tmp = nums[l]; nums[l++] = nums[r]; nums[r--] = tmp; }
}

// NEXT PERMUTATION
// Problem: Given an array of integers, rearrange it to the next lexicographically greater
//          permutation in place. If already the greatest, rearrange to the lowest (ascending) order.
// Intuition: find the rightmost dip, swap with the next-larger element to its right, reverse the suffix.
// Steps:
//   1. Scan right-to-left: find rightmost i where nums[i] < nums[i+1]
//   2. Scan right-to-left: find rightmost j where nums[j] > nums[i]; swap nums[i] and nums[j]
//   3. Reverse the suffix from i+1 to end (converts the largest suffix arrangement to smallest)
//   4. If no i found (entire array descending), just reverse the whole array
// Time: O(n)  Space: O(1)
void nextPermutation(int[] nums) {
    int n = nums.length, i = n - 2;
    // find rightmost element smaller than its right neighbor
    while (i >= 0 && nums[i] >= nums[i + 1]) i--;
    if (i >= 0) {
        int j = n - 1;
        while (nums[j] <= nums[i]) j--; // find just-larger element
        int tmp = nums[i]; nums[i] = nums[j]; nums[j] = tmp; // swap
    }
    // reverse from i+1 to end to get smallest suffix
    for (int l = i + 1, r = n - 1; l < r; l++, r--) {
        int tmp = nums[l]; nums[l] = nums[r]; nums[r] = tmp;
    }
}`,
      go: `// Time: O(n)  Space: O(n) prefix/O(1) in-place tricks

// MAXIMUM SUBARRAY - find the contiguous subarray with the largest sum (Kadane's)
// Problem: Given an integer array nums, find the contiguous subarray with the largest sum
//          and return that sum. The array may contain negative numbers.
// Intuition: extend the current subarray or start fresh at each position; a negative prefix only hurts.
// Steps:
//   1. Initialize maxSum=nums[0], currSum=nums[0] (must start with nums[0], not 0)
//   2. For each num from nums[1:]: if currSum+num < num, start fresh (currSum=num); else extend
//   3. Update maxSum = max(maxSum, currSum); return maxSum
// Time: O(n)  Space: O(1)
func maxSubArray(nums []int) int {
    maxSum := nums[0]
    currSum := nums[0]
    for _, num := range nums[1:] {
        if currSum+num < num {
            currSum = num // negative prefix: restart the subarray here
        } else {
            currSum += num
        }
        if currSum > maxSum {
            maxSum = currSum
        }
    }
    return maxSum
}

// PRODUCT EXCEPT SELF
// Problem: Given an integer array nums, return an array output where output[i] is the product
//          of all elements except nums[i]. Must run in O(n) with no division operator.
// Intuition: left pass stores prefix products in result; right pass multiplies suffix in-place.
// Steps:
//   1. result[0]=1; for i=1..n-1: result[i] = result[i-1]*nums[i-1] (prefix products)
//   2. right=1; for i=n-1..0: result[i] *= right; right *= nums[i] (suffix products)
//   3. Return result
// Time: O(n)  Space: O(1) extra (output array not counted)
func productExceptSelf(nums []int) []int {
    n := len(nums)
    result := make([]int, n)
    result[0] = 1
    for i := 1; i < n; i++ {
        result[i] = result[i-1] * nums[i-1] // prefix products
    }
    right := 1
    for i := n - 1; i >= 0; i-- {
        result[i] *= right // apply suffix products
        right *= nums[i]
    }
    return result
}

// DUTCH NATIONAL FLAG
// Problem: Given an array containing only 0s, 1s, and 2s, sort it in place in O(n) time
//          and O(1) space without using a sort function.
// Intuition: maintain three regions; only swap-with-high does not advance mid (swapped value is unknown).
// Steps:
//   1. Initialize low=0, mid=0, high=n-1
//   2. While mid<=high: nums[mid]==0: swap with low, low++, mid++; 1: mid++; 2: swap with high, high-- (no mid++)
//   3. Invariant: [0..low-1]=0s, [low..mid-1]=1s, [high+1..n-1]=2s
// Time: O(n)  Space: O(1)
func sortColors(nums []int) {
    low, mid, high := 0, 0, len(nums)-1
    for mid <= high {
        switch nums[mid] {
        case 0:
            nums[low], nums[mid] = nums[mid], nums[low]
            low++
            mid++ // safe to advance: swapped element came from the 1s region
        case 1:
            mid++
        default:
            nums[mid], nums[high] = nums[high], nums[mid]
            high-- // do NOT advance mid: the newly arrived value from high is unchecked
        }
    }
}

// ROTATE ARRAY RIGHT BY K
// Problem: Given an integer array nums, rotate it to the right by k steps in place.
//          For example, [1,2,3,4,5] rotated right by 2 becomes [4,5,1,2,3].
// Intuition: reversing the full array then each segment achieves rotation without extra space.
// Steps:
//   1. k %= n (normalize)
//   2. rev(0, n-1) then rev(0, k-1) then rev(k, n-1)
// Time: O(n)  Space: O(1)
func rotate(nums []int, k int) {
    n := len(nums)
    if n == 0 {
        return
    }
    k %= n
    rev := func(l, r int) {
        for l < r {
            nums[l], nums[r] = nums[r], nums[l]
            l++
            r--
        }
    }
    rev(0, n-1)   // reverse all
    rev(0, k-1)   // reverse first k
    rev(k, n-1)   // reverse remaining
}

// NEXT PERMUTATION
// Problem: Given an array of integers, rearrange it to the next lexicographically greater
//          permutation in place. If already the greatest, rearrange to the lowest (ascending) order.
// Intuition: find the rightmost dip, swap with next-larger to its right, reverse the suffix.
// Steps:
//   1. Scan right-to-left: find rightmost i where nums[i] < nums[i+1]
//   2. If found: scan from right to find smallest j where nums[j] > nums[i]; swap nums[i] and nums[j]
//   3. Reverse suffix from i+1 to end (converts largest to smallest arrangement of suffix)
//   4. If no dip found (descending), reverse whole array
// Time: O(n)  Space: O(1)
func nextPermutation(nums []int) {
    n := len(nums)
    i := n - 2
    // scan right to left to find the rightmost dip (ascending break from the right)
    for i >= 0 && nums[i] >= nums[i+1] {
        i--
    }
    if i >= 0 {
        j := n - 1
        for nums[j] <= nums[i] { // find the smallest element right of i that is still larger
            j--
        }
        nums[i], nums[j] = nums[j], nums[i]
    }
    // reverse suffix: turning the largest arrangement of the suffix into the smallest
    for l, r := i+1, n-1; l < r; l, r = l+1, r-1 {
        nums[l], nums[r] = nums[r], nums[l]
    }
}`,
    },
  },
  {
    id: "bit-manipulation",
    name: "18. Bit Manipulation",
    when: "Find unique element among pairs, count set bits, check power of 2, represent sets as bitmasks",
    time: "O(1) per number, O(n) for array problems",
    space: "O(1)",
    coreIdea:
      "Bit manipulation uses CPU-native bitwise operations to solve problems in O(1) time and O(1) space that would otherwise need extra memory or extra passes. The most important trick is XOR: a XOR a = 0 and a XOR 0 = a, so XOR-ing a list where every element appears twice except one leaves only the lone element. The operation n AND (n-1) clears the rightmost 1-bit, which gives a fast way to count set bits and check powers of 2.",
    whenToUse: [
      "Finding the unique element among duplicates (XOR cancels pairs: a XOR a = 0)",
      "Counting set bits or checking if a number is a power of 2",
      "Performing arithmetic (add, subtract) without using + or - operators",
      "Reversing bits or manipulating individual bit positions",
      "Representing subsets as bitmasks for enumeration in O(2^n)",
      "Any problem that needs an O(1) space solution using bit tricks",
    ],
    keyPoints: [
      "XOR rule: a XOR a = 0 and a XOR 0 = a. XOR all numbers together to cancel duplicates and find the unique one",
      "n AND (n-1) clears the rightmost 1-bit. Count how many times until n becomes 0 to count all set bits",
      "Power of 2 check: n > 0 AND n AND (n-1) == 0. A power of 2 has exactly one 1-bit, so clearing it gives 0",
      "n AND (-n) isolates the rightmost 1-bit. Used in Fenwick trees and to split numbers into two groups",
      "Left shift by k multiplies by 2^k. Right shift by k divides by 2^k (integer division)",
      "In Go, use &^ for AND NOT (bit clear). In Java/C++, use & ~mask",
    ],
    commonMistakes: [
      "Mixing up n & (n-1) which clears the rightmost 1-bit, and n & (-n) which isolates it. They do opposite things",
      "Negative numbers in two's complement: all bits to the left of the sign bit are 1, so be careful with right shifts",
      "Off-by-one in bit positions: bit 0 is the rightmost (least significant), bit 31 is the leftmost for a 32-bit int",
      "In Go, use &^ for AND NOT (bit clear). In Java and C++, use & ~mask instead",
    ],
    dontUseWhen: [
      "The problem involves floating-point numbers (bitwise operations do not apply to floats directly)",
      "Clarity is more important than micro-optimization (a hash map or counter is easier to read and debug for most interviewers)",
      "You need to manipulate more than 64 bits (standard integer types overflow; use a big-integer library or array of ints)",
      "The bit trick you plan to use is obscure enough that you cannot explain it clearly in an interview (a clean solution beats a clever one)",
    ],
    variants: [
      {
        name: "Find the single number (XOR)",
        behavior:
          "XOR all elements together; paired elements cancel to 0; the lone element remains",
        example: "Single Number, Missing Number",
      },
      {
        name: "Count set bits (Brian Kernighan)",
        behavior:
          "Loop: n = n AND (n-1) clears one 1-bit per iteration; count iterations until n == 0",
        example: "Number of 1 Bits, Counting Bits",
      },
      {
        name: "Bitmask DP / subset enumeration",
        behavior:
          "Represent each subset as an integer bitmask; iterate all 2^n masks; check bit i with (mask >> i) & 1",
        example: "Subsets (bitmask approach), Traveling Salesman (bitmask DP)",
      },
      {
        name: "Bit get/set/clear",
        behavior:
          "Get bit i: (n >> i) & 1. Set bit i: n | (1 << i). Clear bit i: n & ~(1 << i). Toggle bit i: n ^ (1 << i)",
        example: "Single Number II, Reverse Bits, Sum of Two Integers",
      },
    ],
    keyTakeaways: [
      "XOR: a ^ a = 0 and a ^ 0 = a; XOR-ing all elements cancels every pair and leaves the singleton",
      "n & (n-1) clears the rightmost 1-bit; n & (-n) isolates it. They do opposite things so do not swap them",
      "Power of two check: n > 0 AND n & (n-1) == 0 (exactly one bit set)",
      "In Go use &^ for AND NOT (bit clear); in Java and C++ use & ~mask",
      "Bit 0 is the least significant (rightmost); right-shift by k divides by 2^k (integer division)",
    ],
    problems: [
      "Single Number",
      "Number of 1 Bits",
      "Power of Two",
      "Counting Bits",
      "Missing Number",
      "Reverse Bits",
    ],
    code: {
      java: `// Time: O(1) per number, O(n) for array  Space: O(1)

// FIND SINGLE NUMBER
// Problem: Given a non-empty integer array where every element appears twice except one,
//          find that single element. Must run in O(n) time and O(1) extra space.
// Intuition: XOR cancels pairs (a^a=0) and preserves singletons (a^0=a).
// Steps:
//   1. Initialize result=0
//   2. XOR every element: result ^= num
//   3. All duplicates cancel; return result (the singleton)
// Time: O(n)  Space: O(1)
int result = 0;
for (int num : nums) {
    result ^= num;
}
return result;

// COUNT SET BITS
// Problem: Given an integer n, return the number of set bits (1-bits) in its binary
//          representation (also known as the Hamming weight).
// Intuition: n&(n-1) clears the rightmost 1-bit each iteration; count until n becomes 0.
// Steps:
//   1. Initialize count=0
//   2. While n!=0: n &= n-1 (clears rightmost 1-bit), count++
//   3. Return count
// Time: O(number of 1-bits)  Space: O(1)
int count = 0;
while (n != 0) {
    n &= (n - 1);
    count++;
}
return count;

// IS POWER OF TWO
// Problem: Given an integer n, return true if it is a power of two. A power of two has
//          exactly one 1-bit in binary (e.g., 1, 2, 4, 8, ...).
// Intuition: n & (n-1) clears the single 1-bit of a power of 2, leaving 0.
// Steps: return n > 0 && (n & (n-1)) == 0
// Time: O(1)  Space: O(1)
return n > 0 && (n & (n - 1)) == 0;

// GET / SET / CLEAR a specific bit position
// Problem: Implement helpers to get, set, clear, and toggle the bit at a given position in an integer.
// Steps: get=(n>>pos)&1; set=n|(1<<pos); clear=n&~(1<<pos); toggle=n^(1<<pos)
// Time: O(1)  Space: O(1)
int getBit(int n, int pos)   { return (n >> pos) & 1; }
int setBit(int n, int pos)   { return n | (1 << pos); }
int clearBit(int n, int pos) { return n & ~(1 << pos); }

// MISSING NUMBER
// Problem: Given an array nums containing n distinct numbers from [0, n], return the one
//          number in the range that is missing.
// Intuition: XOR all indices 0..n with all values; matching pairs cancel; missing number remains.
// Steps:
//   1. Initialize missing=nums.length (the extra index n)
//   2. For each i: missing ^= i ^ nums[i] (XOR both index and value)
//   3. Return missing (all matched pairs cancelled out)
// Time: O(n)  Space: O(1)
int missing = nums.length;
for (int i = 0; i < nums.length; i++) {
    missing ^= i ^ nums[i];
}
return missing;

// COUNTING BITS
// Problem: Given an integer n, return an array ans of length n+1 where ans[i] is the
//          number of 1-bits in the binary representation of i, for i from 0 to n.
// Intuition: dp[i] = dp[i>>1] + (i&1); i>>1 drops the last bit (already computed); i&1 adds its own LSB.
// Steps:
//   1. dp[0]=0; for i=1..n: dp[i] = dp[i>>1] + (i & 1)
//   2. Return dp array
// Time: O(n)  Space: O(n)
int[] countBits(int n) {
    int[] dp = new int[n + 1];
    for (int i = 1; i <= n; i++) {
        dp[i] = dp[i >> 1] + (i & 1);
    }
    return dp;
}

// REVERSE BITS
// Problem: Reverse the bits of a given 32-bit unsigned integer and return the result as
//          an unsigned integer.
// Intuition: read n's LSB, shift result left to make room, OR the bit in; repeat 32 times.
// Steps:
//   1. result=0; repeat 32 times: result = (result<<1) | (n&1); n >>>= 1 (unsigned shift)
//   2. Return result
// Time: O(32) = O(1)  Space: O(1)
int reverseBits(int n) {
    int result = 0;
    for (int i = 0; i < 32; i++) {
        result = (result << 1) | (n & 1);
        n >>>= 1;
    }
    return result;
}`,
      go: `// Time: O(1) per number, O(n) for array  Space: O(1)

// FIND SINGLE NUMBER
// Problem: Given a non-empty integer array where every element appears twice except one,
//          find that single element. Must run in O(n) time and O(1) extra space.
// Intuition: XOR cancels pairs (a^a=0) and preserves the singleton (a^0=a).
// Steps:
//   1. Initialize result=0
//   2. For each num: result ^= num (pairs cancel, singleton remains)
//   3. Return result
// Time: O(n)  Space: O(1)
func singleNumber(nums []int) int {
    result := 0
    for _, n := range nums {
        result ^= n
    }
    return result
}

// COUNT SET BITS
// Problem: Given an integer n, return the number of set bits (1-bits) in its binary
//          representation (also known as the Hamming weight).
// Intuition: n&(n-1) clears the rightmost 1-bit each iteration; count until n becomes 0.
// Steps:
//   1. count=0; while n!=0: n &= n-1, count++
//   2. Return count
// Time: O(number of 1-bits)  Space: O(1)
func hammingWeight(n int) int {
    count := 0
    for n != 0 {
        n &= n - 1 // clears rightmost 1-bit each iteration
        count++
    }
    return count
}

// IS POWER OF TWO
// Problem: Given an integer n, return true if it is a power of two. A power of two has
//          exactly one 1-bit in binary (e.g., 1, 2, 4, 8, ...).
// Steps: return n > 0 && n&(n-1) == 0 (n&(n-1) clears the single bit; result is 0 for powers of 2)
// Time: O(1)  Space: O(1)
func isPowerOfTwo(n int) bool {
    return n > 0 && n&(n-1) == 0
}

// GET / SET / CLEAR a specific bit position
// Problem: Implement helpers to get, set, clear, and toggle the bit at a given position in an integer.
// Steps: get=(n>>pos)&1; set=n|(1<<pos); clear=n&^(1<<pos) (&^ is AND NOT in Go); toggle=n^(1<<pos)
// Time: O(1)  Space: O(1)
func getBit(n, pos int) int   { return (n >> pos) & 1 }
func setBit(n, pos int) int   { return n | (1 << pos) }
func clearBit(n, pos int) int { return n &^ (1 << pos) } // &^ is AND NOT in Go

// MISSING NUMBER
// Problem: Given an array nums containing n distinct numbers from [0, n], return the one
//          number in the range that is missing.
// Intuition: XOR all indices 0..n with all values; matched pairs cancel; missing number remains.
// Steps:
//   1. missing = len(nums) (the extra index n)
//   2. For each i, n: missing ^= i ^ n
//   3. Return missing
// Time: O(n)  Space: O(1)
func missingNumber(nums []int) int {
    missing := len(nums)
    for i, n := range nums {
        missing ^= i ^ n
    }
    return missing
}

// COUNTING BITS
// Problem: Given an integer n, return an array ans of length n+1 where ans[i] is the
//          number of 1-bits in the binary representation of i, for i from 0 to n.
// Intuition: dp[i] = dp[i>>1] + (i&1); i>>1 drops the last bit; (i&1) adds whether i is odd.
// Steps:
//   1. dp[0]=0; for i=1..n: dp[i] = dp[i>>1] + (i & 1)
//   2. Return dp
// Time: O(n)  Space: O(n)
func countBits(n int) []int {
    dp := make([]int, n+1)
    for i := 1; i <= n; i++ {
        dp[i] = dp[i>>1] + (i & 1)
    }
    return dp
}

// REVERSE BITS
// Problem: Reverse the bits of a given 32-bit unsigned integer and return the result as
//          an unsigned integer.
// Intuition: read num's LSB, shift result left to make room, OR the bit in; repeat 32 times.
// Steps:
//   1. result=0; repeat 32 times: result = (result<<1) | (num&1); num >>= 1
//   2. Return result (uint32 avoids sign extension on right shift)
// Time: O(32) = O(1)  Space: O(1)
func reverseBits(num uint32) uint32 {
    var result uint32
    for i := 0; i < 32; i++ {
        result = (result << 1) | (num & 1) // shift result left, OR in num's LSB
        num >>= 1                           // expose the next bit of num
    }
    return result
}`,
    },
  },
];

const KEYWORDS = [
  {
    id: "k1",
    keyword: "Top K / Kth largest",
    algo: "Heap",
    reason: "Min-heap of size K → O(n log K)",
  },
  {
    id: "k2",
    keyword: "Sorted array",
    algo: "Binary Search / Two Pointers",
    reason: "O(log n) search or O(n) pairs",
  },
  {
    id: "k3",
    keyword: "How many ways",
    algo: "DP",
    reason: "Count with overlapping subproblems",
  },
  {
    id: "k4",
    keyword: "Substring / subarray",
    algo: "Sliding Window",
    reason: "Contiguous elements, O(n)",
  },
  {
    id: "k5",
    keyword: "Prefix / autocomplete",
    algo: "Trie",
    reason: "O(word length) prefix lookup",
  },
  {
    id: "k6",
    keyword: "Palindrome",
    algo: "Two Pointers / DP",
    reason: "Verify O(n) or count/longest O(n²)",
  },
  {
    id: "k7",
    keyword: "Parentheses / valid",
    algo: "Stack",
    reason: "LIFO matches nested pairs",
  },
  {
    id: "k8",
    keyword: "Next greater/smaller",
    algo: "Monotonic Stack",
    reason: "O(n) with stack ordering",
  },
  {
    id: "k9",
    keyword: "Subarray sum = k",
    algo: "Prefix Sum + HashMap",
    reason: "Find complement in O(1)",
  },
  {
    id: "k10",
    keyword: "Shortest path",
    algo: "BFS / Dijkstra",
    reason: "Unweighted O(V+E) vs weighted O((V+E)logV)",
  },
  {
    id: "k11",
    keyword: "All combinations",
    algo: "Backtracking",
    reason: "Generate with choose-explore-undo",
  },
  {
    id: "k12",
    keyword: "Course schedule",
    algo: "Topological Sort",
    reason: "DAG ordering via indegree",
  },
  {
    id: "k13",
    keyword: "Connected components",
    algo: "Union-Find / DFS",
    reason: "Dynamic vs static graph",
  },
  {
    id: "k14",
    keyword: "Merge intervals",
    algo: "Sort + Greedy",
    reason: "Sort by start, extend end",
  },
  {
    id: "k15",
    keyword: "Maximum/minimum",
    algo: "DP / Greedy",
    reason: "Optimal substructure → try both",
  },
  {
    id: "k16",
    keyword: "In-place / O(1) space",
    algo: "Two Pointers",
    reason: "Modify array without extra space",
  },
  {
    id: "k17",
    keyword: "Interval scheduling / maximize activities",
    algo: "Greedy",
    reason: "Sort by end time, pick earliest-ending",
  },
  {
    id: "k18",
    keyword: "Jump game / reach end",
    algo: "Greedy",
    reason: "Track max reachable index O(n)",
  },
  {
    id: "k19",
    keyword: "Two Sum / find complement",
    algo: "Hash Map",
    reason: "O(1) lookup instead of O(n) inner loop",
  },
  {
    id: "k20",
    keyword: "Maximum subarray sum",
    algo: "Kadane's Algorithm",
    reason: "Track running max ending at each position",
  },
  {
    id: "k21",
    keyword: "Find unique / XOR pairs cancel",
    algo: "Bit Manipulation",
    reason: "XOR cancels duplicates: a XOR a = 0",
  },
  {
    id: "k22",
    keyword: "Power of 2 / count set bits",
    algo: "Bit Manipulation",
    reason: "n AND (n-1) clears rightmost 1-bit in O(1)",
  },
];

const DECISIONS = [
  {
    id: "d1",
    question: "Is it about ARRAYS?",
    options: [
      { id: "d1-o1", text: "Sorted? → Binary Search or Two Pointers" },
      {
        id: "d1-o2",
        text: "Find pair/complement? → HashMap O(n) or Two Pointers O(n)",
      },
      {
        id: "d1-o3",
        text: "Subarray/substring? → Sliding Window or Prefix Sum",
      },
      {
        id: "d1-o4",
        text: "In-place modification? → Two Pointers (fast/slow)",
      },
    ],
  },
  {
    id: "d2",
    question: "Is it about SEARCHING?",
    options: [
      { id: "d2-o1", text: "Sorted array? → Binary Search O(log n)" },
      { id: "d2-o2", text: "Minimize maximum? → Binary Search on Answer" },
      { id: "d2-o3", text: "Prefix/dictionary? → Trie O(word length)" },
      { id: "d2-o4", text: "Range queries? → Segment Tree or Prefix Sum" },
    ],
  },
  {
    id: "d3",
    question: "Is it about GENERATING?",
    options: [
      { id: "d3-o1", text: "All subsets? → Backtracking (i + 1)" },
      { id: "d3-o2", text: "All permutations? → Backtracking (visited[])" },
      { id: "d3-o3", text: "Combinations with sum? → Backtracking + Pruning" },
      { id: "d3-o4", text: "Count ways? → DP (not backtracking)" },
    ],
  },
  {
    id: "d4",
    question: "Is it about OPTIMIZATION?",
    options: [
      { id: "d4-o1", text: "Overlapping subproblems? → DP" },
      { id: "d4-o2", text: "Greedy choice provably works? → Greedy" },
      { id: "d4-o3", text: "Pick/skip items once? → 0/1 Knapsack DP" },
      { id: "d4-o4", text: "Unlimited item use? → Unbounded Knapsack DP" },
    ],
  },
  {
    id: "d5",
    question: "Is it about GRAPHS/TREES?",
    options: [
      { id: "d5-o1", text: "Shortest path (unweighted)? → BFS" },
      { id: "d5-o2", text: "Shortest path (weighted)? → Dijkstra" },
      { id: "d5-o3", text: "Ordering/dependencies? → Topological Sort" },
      { id: "d5-o4", text: "Connectivity? → Union-Find or DFS" },
      { id: "d5-o5", text: "Level-order? → BFS, Path/sum? → DFS" },
    ],
  },
  {
    id: "d6",
    question: "Is it about SEQUENCES?",
    options: [
      { id: "d6-o1", text: "Matching pairs? → Stack" },
      { id: "d6-o2", text: "Next greater/smaller? → Monotonic Stack" },
      { id: "d6-o3", text: "Merge sorted? → Two Pointers or Heap" },
      { id: "d6-o4", text: "Streaming K-th? → Heap" },
    ],
  },
  {
    id: "d7",
    question: "Is it about INTERVALS?",
    options: [
      { id: "d7-o1", text: "Merge overlapping? → Sort by start + Greedy" },
      {
        id: "d7-o2",
        text: "Max non-overlapping? → Sort by END + Greedy",
      },
      { id: "d7-o3", text: "Min rooms needed? → Two sorted arrays or Heap" },
      {
        id: "d7-o4",
        text: "Count at time point? → Line sweep (+1/-1 events)",
      },
    ],
  },
];

const COMPLEXITIES = [
  { id: "cx1", pattern: "Two Pointers", time: "O(n)", space: "O(1)" },
  { id: "cx2", pattern: "Sliding Window", time: "O(n)", space: "O(k)" },
  { id: "cx3", pattern: "Prefix Sum", time: "O(n) / O(1)", space: "O(n)" },
  { id: "cx4", pattern: "Hash Map", time: "O(n) avg", space: "O(n)" },
  { id: "cx5", pattern: "Binary Search", time: "O(log n)", space: "O(1)" },
  { id: "cx6", pattern: "Stack", time: "O(n)", space: "O(n)" },
  { id: "cx7", pattern: "Tree DFS", time: "O(n)", space: "O(h)" },
  { id: "cx8", pattern: "Tree BFS", time: "O(n)", space: "O(w)" },
  { id: "cx9", pattern: "Graph BFS/DFS", time: "O(V+E)", space: "O(V+E)" },
  { id: "cx10", pattern: "Dijkstra", time: "O((V+E)logV)", space: "O(V)" },
  { id: "cx11", pattern: "Top K (Heap)", time: "O(n log k)", space: "O(k)" },
  { id: "cx12", pattern: "DP 1D", time: "O(n)", space: "O(n) or O(1)" },
  { id: "cx13", pattern: "DP 2D", time: "O(n*m)", space: "O(n*m)" },
  {
    id: "cx14",
    pattern: "Backtracking (subsets)",
    time: "O(2^n)",
    space: "O(n)",
  },
  { id: "cx15", pattern: "Backtracking (perms)", time: "O(n!)", space: "O(n)" },
  { id: "cx16", pattern: "Trie", time: "O(L) per op", space: "O(N*L)" },
  { id: "cx17", pattern: "Union-Find", time: "O(α(n)) ≈ O(1)", space: "O(n)" },
  {
    id: "cx18",
    pattern: "Greedy (with sort)",
    time: "O(n log n)",
    space: "O(1)",
  },
  { id: "cx19", pattern: "Hash Map", time: "O(n) avg", space: "O(n)" },
  { id: "cx20", pattern: "Kadane's (max subarray)", time: "O(n)", space: "O(1)" },
  { id: "cx21", pattern: "Bit Manipulation", time: "O(1) or O(n)", space: "O(1)" },
];

const MISTAKES = [
  {
    id: "ms1",
    pattern: "Two Pointers",
    mistake: "Forgetting to sort the array first when required",
  },
  {
    id: "ms2",
    pattern: "Sliding Window",
    mistake: "Update result INSIDE while for min, AFTER for max",
  },
  {
    id: "ms3",
    pattern: "Prefix Sum",
    mistake: "Must initialize map with {0:1} for subarrays starting at index 0",
  },
  {
    id: "ms4",
    pattern: "Binary Search",
    mistake: "Use left+(right-left)/2 to avoid integer overflow",
  },
  {
    id: "ms5",
    pattern: "Stack",
    mistake: "Decreasing stack for next greater, increasing for next smaller",
  },
  {
    id: "ms6",
    pattern: "Linked List",
    mistake: "Always use dummy node when head might change",
  },
  {
    id: "ms7",
    pattern: "Trees",
    mistake: "BST inorder = sorted; validate with min/max bounds not just parent",
  },
  {
    id: "ms8",
    pattern: "Graphs",
    mistake: "BFS for shortest path, not DFS (DFS gives A path, not shortest)",
  },
  {
    id: "ms9",
    pattern: "Heap",
    mistake: "K largest = min-heap; K smallest = max-heap (opposite!)",
  },
  {
    id: "ms10",
    pattern: "DP Knapsack",
    mistake: "0/1: reverse loop (no reuse); Unbounded: forward loop (reuse ok)",
  },
  {
    id: "ms11",
    pattern: "Backtracking",
    mistake: "Must undo choice after recursive call; copy slice when saving result",
  },
  {
    id: "ms12",
    pattern: "Intervals",
    mistake: "Sort by start to merge; sort by END to maximize non-overlap",
  },
  {
    id: "ms13",
    pattern: "Union-Find",
    mistake: "Must use path compression or amortized cost degrades to O(log n)",
  },
  {
    id: "ms14",
    pattern: "Trie",
    mistake: "isEnd flag distinguishes complete words from mere prefixes",
  },
  {
    id: "ms15",
    pattern: "Greedy",
    mistake: "Verify greedy-choice property holds; 0/1 Knapsack needs DP, not greedy",
  },
  {
    id: "ms16",
    pattern: "Hash Map",
    mistake: "Check complement BEFORE adding current element, not after (finds same element)",
  },
  {
    id: "ms17",
    pattern: "Kadane's",
    mistake: "Initialize with nums[0] not 0; all numbers can be negative",
  },
  {
    id: "ms18",
    pattern: "Bit Manip",
    mistake: "n&(n-1) clears rightmost 1-bit; n&(-n) isolates it. Don't mix them up",
  },
];

const ConstraintRow = ({
  constraint,
}: {
  constraint: (typeof CONSTRAINTS)[number];
}) => (
  <tr className="border-b border-gray-800">
    <td className="py-2.5 px-3 font-mono font-semibold text-indigo-400">
      {constraint.size}
    </td>
    <td className="py-2.5 px-3 font-mono text-green-400">
      {constraint.complexity}
    </td>
    <td className="py-2.5 px-3 text-gray-300">{constraint.what}</td>
  </tr>
);

const ConstraintsTable = () => (
  <table className="w-full text-sm">
    <thead>
      <tr className="border-b border-gray-700">
        <th className="text-left py-2 px-3 text-gray-400 font-medium">
          Input Size
        </th>
        <th className="text-left py-2 px-3 text-gray-400 font-medium">
          Complexity
        </th>
        <th className="text-left py-2 px-3 text-gray-400 font-medium">
          What Works
        </th>
      </tr>
    </thead>
    <tbody>
      {CONSTRAINTS.map((c) => (
        <ConstraintRow key={c.id} constraint={c} />
      ))}
    </tbody>
  </table>
);

const MappingRow = ({
  mapping,
}: {
  mapping: (typeof PATTERN_MAPPINGS)[number];
}) => (
  <tr className="border-b border-gray-800 hover:bg-gray-900/50">
    <td className="py-2 px-3 text-gray-300">{mapping.problem}</td>
    <td className="py-2 px-3 text-indigo-400 font-medium">{mapping.pattern}</td>
    <td className="py-2 px-3 text-green-400 font-mono text-xs">
      {mapping.time}
    </td>
    <td className="py-2 px-3 text-blue-400 font-mono text-xs">
      {mapping.space}
    </td>
  </tr>
);

const PatternSelectorTable = () => (
  <table className="w-full text-sm">
    <thead>
      <tr className="border-b border-gray-700">
        <th className="text-left py-2 px-3 text-gray-400 font-medium">
          Problem Type
        </th>
        <th className="text-left py-2 px-3 text-gray-400 font-medium">
          Pattern
        </th>
        <th className="text-left py-2 px-3 text-gray-400 font-medium">Time</th>
        <th className="text-left py-2 px-3 text-gray-400 font-medium">Space</th>
      </tr>
    </thead>
    <tbody>
      {PATTERN_MAPPINGS.map((m) => (
        <MappingRow key={m.id} mapping={m} />
      ))}
    </tbody>
  </table>
);

const SLUG_OVERRIDES: Record<string, string> = {
  "Two Sum II": "two-sum-ii-input-array-is-sorted",
  "Remove Duplicates": "remove-duplicates-from-sorted-array",
  "Longest Substring Without Repeating":
    "longest-substring-without-repeating-characters",
  "Find All Anagrams": "find-all-anagrams-in-a-string",
  "Range Sum Query": "range-sum-query-immutable",
  "Search in Rotated Array": "search-in-rotated-sorted-array",
  "Find First and Last Position":
    "find-first-and-last-position-of-element-in-sorted-array",
  "Maximum Depth": "maximum-depth-of-binary-tree",
  "Validate BST": "validate-binary-search-tree",
  "Lowest Common Ancestor": "lowest-common-ancestor-of-a-binary-tree",
  "Level Order Traversal": "binary-tree-level-order-traversal",
  "Kth Largest Element": "kth-largest-element-in-an-array",
  "Remove Nth Node From End": "remove-nth-node-from-end-of-list",
  "Design Add and Search Words": "design-add-and-search-words-data-structure",
  "Implement Trie": "implement-trie-prefix-tree",
};

const ProblemLink = ({ problem }: { problem: string }) => {
  const slug =
    SLUG_OVERRIDES[problem] ??
    problem
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  return (
    <a
      href={`https://leetcode.com/problems/${slug}/`}
      target="_blank"
      rel="noopener noreferrer"
      className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-md text-sm transition"
    >
      {problem}
    </a>
  );
};

const PatternCard = ({
  pattern,
  isExpanded,
  onToggle,
  language,
}: {
  pattern: (typeof PATTERNS)[number];
  isExpanded: boolean;
  onToggle: () => void;
  language: string;
}) => {
  const effectiveLang = language === "go" ? "go" : "java";
  const code = pattern.code[effectiveLang];

  return (
    <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onToggle();
        }}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-800/50 transition cursor-pointer"
      >
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white">{pattern.name}</h3>
          <p className="text-sm text-gray-400">{pattern.when}</p>
        </div>
        <div className="flex items-center gap-3 ml-3 flex-shrink-0">
          <Link
            href={`/patterns/${pattern.id}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-md transition"
          >
            Full guide
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
      {isExpanded && (
        <div className="p-4 pt-3 border-t border-gray-800">
          <div className="flex items-center gap-6 text-sm mb-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Time:</span>
              <span className="font-mono text-green-400 text-xs">{pattern.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Space:</span>
              <span className="font-mono text-blue-400 text-xs">{pattern.space}</span>
            </div>
          </div>
          <div className="mb-4 p-3 rounded-md" style={{ background: "var(--bg-elevated)" }}>
            <h4 className="text-sm font-semibold text-indigo-400 mb-1">Core Idea:</h4>
            <p className="text-sm text-gray-300 leading-relaxed">{pattern.coreIdea}</p>
          </div>
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-green-400 mb-2">
              When to Use:
            </h4>
            <ul className="space-y-1">
              {pattern.whenToUse.map((item, i) => (
                // skipcq: JS-0437 - no stable id; pattern.id+index is unique
                <li key={`${pattern.id}-when-${i}`} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-400 mb-2">
              Key Insights:
            </h4>
            <ul className="space-y-1">
              {pattern.keyPoints.map((point, i) => (
                // skipcq: JS-0437 - no stable id; pattern.id+index is unique
                <li key={`${pattern.id}-kp-${i}`} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-yellow-400 font-bold mt-0.5">{i + 1}.</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-red-400 mb-2">
              Common Mistakes:
            </h4>
            <ul className="space-y-1">
              {pattern.commonMistakes.map((mistake, i) => (
                // skipcq: JS-0437 - no stable id; pattern.id+index is unique
                <li key={`${pattern.id}-cm-${i}`} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-red-400 mt-1">✗</span>
                  {mistake}
                </li>
              ))}
            </ul>
          </div>
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-orange-400 mb-2">
              Don&apos;t Use When:
            </h4>
            <ul className="space-y-1">
              {pattern.dontUseWhen.map((item, i) => (
                // skipcq: JS-0437 - no stable id; pattern.id+index is unique
                <li key={`${pattern.id}-duw-${i}`} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-orange-400 mt-1">✗</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-400 mb-2">Variants:</h4>
            <div className="space-y-2">
              {pattern.variants.map((v) => (
                <div key={v.name} className="p-2.5 rounded-md border border-gray-700 bg-gray-800/50">
                  <span className="text-sm font-medium text-indigo-300">{v.name}</span>
                  <p className="text-xs text-gray-400 mt-1 mb-1">{v.behavior}</p>
                  <p className="text-xs text-gray-500">e.g. {v.example}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mb-4 p-3 rounded-md border border-yellow-500/20 bg-yellow-500/5">
            <h4 className="text-sm font-semibold text-yellow-400 mb-2">Key Takeaways:</h4>
            <ul className="space-y-1">
              {pattern.keyTakeaways.map((item, i) => (
                // skipcq: JS-0437 - no stable id; pattern.id+index is unique
                <li key={`${pattern.id}-kt-${i}`} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">★</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-400 mb-2">
              Template:
            </h4>
            <CodeBlock code={code} language={effectiveLang} />
          </div>
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-400 mb-2">
              Practice:
            </h4>
            <div className="flex flex-wrap gap-2">
              {pattern.problems.map((problem) => (
                <ProblemLink key={problem} problem={problem} />
              ))}
            </div>
          </div>
          <div className="pt-3 border-t border-gray-800">
            <Link
              href={`/patterns/${pattern.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition"
            >
              Read full guide with tutorial, visualizer, and quiz
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

const KeywordCard = ({ item }: { item: (typeof KEYWORDS)[number] }) => (
  <div className="p-3 bg-gray-900 rounded-md border border-gray-800 hover:border-gray-700 transition">
    <div className="flex items-center justify-between mb-1">
      <span className="text-white font-medium">{item.keyword}</span>
      <span className="text-indigo-400 font-semibold text-sm">{item.algo}</span>
    </div>
    <p className="text-gray-500 text-xs">{item.reason}</p>
  </div>
);

const DecisionOption = ({
  option,
}: {
  option: { id: string; text: string };
}) => (
  <li className="text-sm text-gray-300 flex items-start gap-2">
    <span className="text-gray-500">├</span>
    {option.text}
  </li>
);

const DecisionCard = ({
  decision,
}: {
  decision: (typeof DECISIONS)[number];
}) => (
  <div className="p-4 bg-gray-900 rounded-md border border-gray-800">
    <h3 className="font-semibold text-indigo-400 mb-2">{decision.question}</h3>
    <ul className="space-y-1">
      {decision.options.map((opt) => (
        <DecisionOption key={opt.id} option={opt} />
      ))}
    </ul>
  </div>
);

const ComplexityRow = ({ item }: { item: (typeof COMPLEXITIES)[number] }) => (
  <tr className="border-b border-gray-800">
    <td className="py-2 px-3 text-gray-300">{item.pattern}</td>
    <td className="py-2 px-3 text-green-400 font-mono text-xs">{item.time}</td>
    <td className="py-2 px-3 text-blue-400 font-mono text-xs">{item.space}</td>
  </tr>
);

const ComplexityTable = () => (
  <table className="w-full text-sm">
    <thead>
      <tr className="border-b border-gray-700">
        <th className="text-left py-2 px-3 text-gray-400 font-medium">
          Pattern
        </th>
        <th className="text-left py-2 px-3 text-gray-400 font-medium">Time</th>
        <th className="text-left py-2 px-3 text-gray-400 font-medium">Space</th>
      </tr>
    </thead>
    <tbody>
      {COMPLEXITIES.map((c) => (
        <ComplexityRow key={c.id} item={c} />
      ))}
    </tbody>
  </table>
);

const MistakeCard = ({ item }: { item: (typeof MISTAKES)[number] }) => (
  <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-md flex items-start gap-3">
    <span className="text-red-400 font-medium min-w-[110px]">
      {item.pattern}
    </span>
    <span className="text-gray-300 text-sm">{item.mistake}</span>
  </div>
);

// skipcq: JS-0067
const InterviewCheatsheetPage = () => {
  const [expandedPattern, setExpandedPattern] = useState<string | null>(null);
  const { language, setLanguage } = useLanguage();

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 md:py-8">
      <div className="text-center mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Interview Cheat Sheet
        </h1>
        <p className="text-gray-400 text-sm md:text-base">
          Quick revision guide: scan this before your interview
        </p>
      </div>

      <section className="mb-8 md:mb-10">
        <div className="p-4 md:p-6 bg-gray-900 rounded-md border border-gray-800">
          <h2 className="text-lg md:text-xl font-bold text-white mb-2">
            The Golden Rule: Check Constraints First
          </h2>
          <p className="text-gray-400 mb-5">
            Before anything else, look at the input size. This tells you which
            algorithms are even possible.
          </p>
          <div className="overflow-x-auto">
            <ConstraintsTable />
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-white mb-4">
          Quick Pattern Selector
        </h2>
        <div className="overflow-x-auto">
          <PatternSelectorTable />
        </div>
      </section>

      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">
            All Patterns with Templates
          </h2>
          <LanguageToggle
            currentLang={language === "go" ? "go" : "java"}
            onChange={(lang) => setLanguage(lang as SupportedLanguage)}
            languages={["java", "go"]}
            size="sm"
          />
        </div>
        <div className="space-y-3">
          {PATTERNS.map((pattern) => (
            <PatternCard
              key={pattern.id}
              pattern={pattern}
              isExpanded={expandedPattern === pattern.id}
              onToggle={() =>
                setExpandedPattern((prev) =>
                  prev === pattern.id ? null : pattern.id
                )
              }
              language={language}
            />
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-white mb-2">
          Keyword to Algorithm
        </h2>
        <p className="text-gray-400 mb-5 text-sm">
          Problems rarely tell you which algorithm to use, but the wording
          usually leaks it.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {KEYWORDS.map((k) => (
            <KeywordCard key={k.id} item={k} />
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-white mb-4">
          Quick Decision Tree
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {DECISIONS.map((d) => (
            <DecisionCard key={d.id} decision={d} />
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-white mb-4">
          Complexity Reference
        </h2>
        <div className="overflow-x-auto">
          <ComplexityTable />
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-white mb-4">
          Common Mistakes to Avoid
        </h2>
        <div className="grid md:grid-cols-2 gap-2">
          {MISTAKES.map((m) => (
            <MistakeCard key={m.id} item={m} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default InterviewCheatsheetPage;
