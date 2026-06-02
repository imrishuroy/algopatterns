/* global patternsData, dataAdapter */
"use strict";
const STORAGE_KEY = 'dsa-tracker-completed';
const questions = [
    // Arrays & Strings
    { id: 'as-1', name: 'Two Sum', url: 'https://leetcode.com/problems/two-sum', difficulty: 'Easy', pattern: 'Hash Map', companies: ['Google', 'Amazon', 'Meta', 'Apple', 'Microsoft', 'Netflix', 'LinkedIn', 'Tesla', 'Databricks'], frequency: '🔥🔥🔥', category: 'Arrays & Strings' },
    { id: 'as-2', name: '3Sum', url: 'https://leetcode.com/problems/3sum', difficulty: 'Medium', pattern: 'Two Pointers', companies: ['Google', 'Amazon', 'Apple', 'Meta', 'Tesla'], frequency: '🔥🔥🔥', category: 'Arrays & Strings' },
    { id: 'as-3', name: 'Product of Array Except Self', url: 'https://leetcode.com/problems/product-of-array-except-self', difficulty: 'Medium', pattern: 'Prefix/Suffix', companies: ['Google', 'Amazon', 'Meta', 'Apple'], frequency: '🔥🔥🔥', category: 'Arrays & Strings' },
    { id: 'as-4', name: 'Maximum Subarray', url: 'https://leetcode.com/problems/maximum-subarray', difficulty: 'Medium', pattern: "Kadane's/DP", companies: ['Amazon', 'Microsoft', 'LinkedIn', 'Tesla'], frequency: '🔥🔥🔥', category: 'Arrays & Strings' },
    { id: 'as-5', name: 'Group Anagrams', url: 'https://leetcode.com/problems/group-anagrams', difficulty: 'Medium', pattern: 'Hash Map', companies: ['Google', 'Amazon', 'Meta', 'Apple', 'Tesla', 'Salesforce', 'Adobe'], frequency: '🔥🔥🔥', category: 'Arrays & Strings' },
    { id: 'as-6', name: 'Valid Anagram', url: 'https://leetcode.com/problems/valid-anagram', difficulty: 'Easy', pattern: 'Hash Map', companies: ['Amazon', 'Google'], frequency: '🔥🔥', category: 'Arrays & Strings' },
    { id: 'as-7', name: 'Contains Duplicate', url: 'https://leetcode.com/problems/contains-duplicate', difficulty: 'Easy', pattern: 'Hash Set', companies: ['Amazon', 'Google'], frequency: '🔥🔥', category: 'Arrays & Strings' },
    { id: 'as-8', name: 'Valid Palindrome', url: 'https://leetcode.com/problems/valid-palindrome', difficulty: 'Easy', pattern: 'Two Pointers', companies: ['Meta', 'Amazon'], frequency: '🔥🔥', category: 'Arrays & Strings' },
    { id: 'as-9', name: 'Valid Palindrome II', url: 'https://leetcode.com/problems/valid-palindrome-ii', difficulty: 'Easy', pattern: 'Two Pointers', companies: ['Meta'], frequency: '🔥🔥', category: 'Arrays & Strings' },
    { id: 'as-10', name: 'Move Zeroes', url: 'https://leetcode.com/problems/move-zeroes', difficulty: 'Easy', pattern: 'Two Pointers', companies: ['Meta'], frequency: '🔥🔥', category: 'Arrays & Strings' },
    { id: 'as-11', name: 'Rotate Image', url: 'https://leetcode.com/problems/rotate-image', difficulty: 'Medium', pattern: 'Matrix', companies: ['Amazon', 'Microsoft', 'Google'], frequency: '🔥🔥', category: 'Arrays & Strings' },
    { id: 'as-12', name: 'Sort Colors', url: 'https://leetcode.com/problems/sort-colors', difficulty: 'Medium', pattern: 'Dutch Flag', companies: ['Microsoft', 'Google'], frequency: '🔥🔥', category: 'Arrays & Strings' },
    { id: 'as-13', name: 'String Compression', url: 'https://leetcode.com/problems/string-compression', difficulty: 'Medium', pattern: 'Two Pointers', companies: ['Google'], frequency: '🔥', category: 'Arrays & Strings' },
    { id: 'as-14', name: 'Encode and Decode Strings', url: 'https://leetcode.com/problems/encode-and-decode-strings', difficulty: 'Medium', pattern: 'String', companies: ['Google'], frequency: '🔥', category: 'Arrays & Strings' },
    { id: 'as-15', name: 'Longest Common Prefix', url: 'https://leetcode.com/problems/longest-common-prefix', difficulty: 'Easy', pattern: 'String', companies: ['Amazon'], frequency: '🔥', category: 'Arrays & Strings' },
    { id: 'as-16', name: 'Add Strings', url: 'https://leetcode.com/problems/add-strings', difficulty: 'Easy', pattern: 'Math', companies: ['Meta', 'Google'], frequency: '🔥🔥', category: 'Arrays & Strings' },
    { id: 'as-17', name: 'Add Binary', url: 'https://leetcode.com/problems/add-binary', difficulty: 'Easy', pattern: 'Math', companies: ['Google'], frequency: '🔥', category: 'Arrays & Strings' },
    { id: 'as-18', name: 'Merge Strings Alternately', url: 'https://leetcode.com/problems/merge-strings-alternately', difficulty: 'Easy', pattern: 'Two Pointers', companies: ['Google'], frequency: '🔥', category: 'Arrays & Strings' },
    { id: 'as-19', name: 'Integer to English Words', url: 'https://leetcode.com/problems/integer-to-english-words', difficulty: 'Hard', pattern: 'String/Math', companies: ['Amazon', 'Palantir'], frequency: '🔥🔥', category: 'Arrays & Strings' },
    { id: 'as-20', name: 'First Missing Positive', url: 'https://leetcode.com/problems/first-missing-positive', difficulty: 'Hard', pattern: 'Cyclic Sort', companies: ['Google', 'Tesla'], frequency: '🔥🔥', category: 'Arrays & Strings' },
    { id: 'as-21', name: 'Trapping Rain Water', url: 'https://leetcode.com/problems/trapping-rain-water', difficulty: 'Hard', pattern: 'Two Pointers/Stack', companies: ['Google', 'Amazon', 'Apple', 'Netflix', 'Palantir', 'Databricks'], frequency: '🔥🔥🔥', category: 'Arrays & Strings' },
    { id: 'as-22', name: 'Custom Sort String', url: 'https://leetcode.com/problems/custom-sort-string', difficulty: 'Medium', pattern: 'Hash Map', companies: ['Meta'], frequency: '🔥🔥', category: 'Arrays & Strings' },
    { id: 'as-23', name: 'Maximum Swap', url: 'https://leetcode.com/problems/maximum-swap', difficulty: 'Medium', pattern: 'Greedy', companies: ['Meta'], frequency: '🔥🔥', category: 'Arrays & Strings' },
    { id: 'as-24', name: 'Reverse Integer', url: 'https://leetcode.com/problems/reverse-integer', difficulty: 'Medium', pattern: 'Math', companies: ['Amazon'], frequency: '🔥', category: 'Arrays & Strings' },
    { id: 'as-25', name: 'Find the Difference', url: 'https://leetcode.com/problems/find-the-difference', difficulty: 'Easy', pattern: 'Hash/XOR', companies: ['Google'], frequency: '🔥', category: 'Arrays & Strings' },
    { id: 'as-26', name: 'Greatest Common Divisor of Strings', url: 'https://leetcode.com/problems/greatest-common-divisor-of-strings', difficulty: 'Easy', pattern: 'Math/String', companies: ['Google', 'Amazon'], frequency: '🔥', category: 'Arrays & Strings' },
    { id: 'as-27', name: 'Kids With the Greatest Number of Candies', url: 'https://leetcode.com/problems/kids-with-the-greatest-number-of-candies', difficulty: 'Easy', pattern: 'Array', companies: ['Amazon'], frequency: '🔥', category: 'Arrays & Strings' },
    { id: 'as-28', name: 'Can Place Flowers', url: 'https://leetcode.com/problems/can-place-flowers', difficulty: 'Easy', pattern: 'Greedy', companies: ['LinkedIn', 'Amazon'], frequency: '🔥', category: 'Arrays & Strings' },
    { id: 'as-29', name: 'Reverse Vowels of a String', url: 'https://leetcode.com/problems/reverse-vowels-of-a-string', difficulty: 'Easy', pattern: 'Two Pointers', companies: ['Google'], frequency: '🔥', category: 'Arrays & Strings' },
    { id: 'as-30', name: 'Increasing Triplet Subsequence', url: 'https://leetcode.com/problems/increasing-triplet-subsequence', difficulty: 'Medium', pattern: 'Greedy', companies: ['Meta', 'Google'], frequency: '🔥🔥', category: 'Arrays & Strings' },
    // ==================== Two Pointers ====================
    { id: 'tp-1', name: 'Container With Most Water', url: 'https://leetcode.com/problems/container-with-most-water', difficulty: 'Medium', pattern: 'Two Pointers', companies: ['Google', 'Amazon', 'Apple'], frequency: '🔥🔥🔥', category: 'Two Pointers' },
    { id: 'tp-2', name: 'Two Sum II - Input Array Is Sorted', url: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted', difficulty: 'Medium', pattern: 'Two Pointers', companies: ['Google'], frequency: '🔥🔥', category: 'Two Pointers' },
    { id: 'tp-3', name: 'Remove Nth Node From End of List', url: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list', difficulty: 'Medium', pattern: 'Fast/Slow', companies: ['Meta'], frequency: '🔥🔥', category: 'Two Pointers' },
    { id: 'tp-4', name: 'Backspace String Compare', url: 'https://leetcode.com/problems/backspace-string-compare', difficulty: 'Easy', pattern: 'Two Pointers', companies: ['Google'], frequency: '🔥', category: 'Two Pointers' },
    { id: 'tp-5', name: 'Is Subsequence', url: 'https://leetcode.com/problems/is-subsequence', difficulty: 'Easy', pattern: 'Two Pointers', companies: ['Google'], frequency: '🔥', category: 'Two Pointers' },
    // ==================== Sliding Window ====================
    { id: 'sw-1', name: 'Longest Substring Without Repeating Characters', url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters', difficulty: 'Medium', pattern: 'Sliding Window', companies: ['Google', 'Amazon', 'Apple', 'Microsoft', 'Meta'], frequency: '🔥🔥🔥', category: 'Sliding Window' },
    { id: 'sw-2', name: 'Minimum Window Substring', url: 'https://leetcode.com/problems/minimum-window-substring', difficulty: 'Hard', pattern: 'Sliding Window', companies: ['Google', 'Amazon', 'Netflix', 'Tesla'], frequency: '🔥🔥🔥', category: 'Sliding Window' },
    { id: 'sw-3', name: 'Sliding Window Maximum', url: 'https://leetcode.com/problems/sliding-window-maximum', difficulty: 'Hard', pattern: 'Monotonic Deque', companies: ['Google', 'Amazon', 'Uber'], frequency: '🔥🔥🔥', category: 'Sliding Window' },
    { id: 'sw-4', name: 'Longest Repeating Character Replacement', url: 'https://leetcode.com/problems/longest-repeating-character-replacement', difficulty: 'Medium', pattern: 'Sliding Window', companies: ['Amazon', 'Apple'], frequency: '🔥🔥', category: 'Sliding Window' },
    { id: 'sw-5', name: 'Maximum Average Subarray I', url: 'https://leetcode.com/problems/maximum-average-subarray-i', difficulty: 'Easy', pattern: 'Sliding Window', companies: ['Google'], frequency: '🔥', category: 'Sliding Window' },
    { id: 'sw-6', name: 'Max Consecutive Ones III', url: 'https://leetcode.com/problems/max-consecutive-ones-iii', difficulty: 'Medium', pattern: 'Sliding Window', companies: ['Google'], frequency: '🔥', category: 'Sliding Window' },
    { id: 'sw-7', name: 'Minimum Size Subarray Sum', url: 'https://leetcode.com/problems/minimum-size-subarray-sum', difficulty: 'Medium', pattern: 'Sliding Window', companies: ['Google'], frequency: '🔥', category: 'Sliding Window' },
    { id: 'sw-8', name: 'Find All Anagrams in a String', url: 'https://leetcode.com/problems/find-all-anagrams-in-a-string', difficulty: 'Medium', pattern: 'Sliding Window', companies: ['Google', 'Databricks'], frequency: '🔥🔥', category: 'Sliding Window' },
    { id: 'sw-9', name: 'Permutation in String', url: 'https://leetcode.com/problems/permutation-in-string', difficulty: 'Medium', pattern: 'Sliding Window', companies: ['Microsoft'], frequency: '🔥🔥', category: 'Sliding Window' },
    { id: 'sw-10', name: 'Maximum Points You Can Obtain from Cards', url: 'https://leetcode.com/problems/maximum-points-you-can-obtain-from-cards', difficulty: 'Medium', pattern: 'Sliding Window', companies: ['Google'], frequency: '🔥', category: 'Sliding Window' },
    // ==================== Prefix Sum ====================
    { id: 'ps-1', name: 'Subarray Sum Equals K', url: 'https://leetcode.com/problems/subarray-sum-equals-k', difficulty: 'Medium', pattern: 'Prefix Sum + Hash', companies: ['Meta', 'Amazon', 'Tesla'], frequency: '🔥🔥🔥', category: 'Prefix Sum' },
    { id: 'ps-2', name: 'Continuous Subarray Sum', url: 'https://leetcode.com/problems/continuous-subarray-sum', difficulty: 'Medium', pattern: 'Prefix Sum', companies: ['Meta'], frequency: '🔥🔥', category: 'Prefix Sum' },
    { id: 'ps-3', name: 'Range Sum Query - Immutable', url: 'https://leetcode.com/problems/range-sum-query-immutable', difficulty: 'Easy', pattern: 'Prefix Sum', companies: ['Google'], frequency: '🔥', category: 'Prefix Sum' },
    { id: 'ps-4', name: 'Contiguous Array', url: 'https://leetcode.com/problems/contiguous-array', difficulty: 'Medium', pattern: 'Prefix Sum', companies: ['Google'], frequency: '🔥🔥', category: 'Prefix Sum' },
    { id: 'ps-5', name: 'Find Pivot Index', url: 'https://leetcode.com/problems/find-pivot-index', difficulty: 'Easy', pattern: 'Prefix Sum', companies: ['Google', 'Tesla'], frequency: '🔥🔥', category: 'Prefix Sum' },
    // ==================== Hash Map / Set ====================
    { id: 'hm-1', name: 'Longest Consecutive Sequence', url: 'https://leetcode.com/problems/longest-consecutive-sequence', difficulty: 'Medium', pattern: 'Hash Set', companies: ['Google'], frequency: '🔥🔥', category: 'Hash Map / Set' },
    { id: 'hm-2', name: 'Word Pattern', url: 'https://leetcode.com/problems/word-pattern', difficulty: 'Easy', pattern: 'Hash Map', companies: ['Google'], frequency: '🔥', category: 'Hash Map / Set' },
    { id: 'hm-3', name: 'Isomorphic Strings', url: 'https://leetcode.com/problems/isomorphic-strings', difficulty: 'Easy', pattern: 'Hash Map', companies: ['LinkedIn'], frequency: '🔥', category: 'Hash Map / Set' },
    { id: 'hm-4', name: 'Top K Frequent Elements', url: 'https://leetcode.com/problems/top-k-frequent-elements', difficulty: 'Medium', pattern: 'Hash + Heap', companies: ['Google', 'Amazon', 'Meta', 'Apple', 'Netflix'], frequency: '🔥🔥🔥', category: 'Hash Map / Set' },
    { id: 'hm-5', name: 'Contains Duplicate II', url: 'https://leetcode.com/problems/contains-duplicate-ii', difficulty: 'Easy', pattern: 'Hash Map', companies: ['Amazon'], frequency: '🔥', category: 'Hash Map / Set' },
    // ==================== Stack / Monotonic Stack ====================
    { id: 'st-1', name: 'Valid Parentheses', url: 'https://leetcode.com/problems/valid-parentheses', difficulty: 'Easy', pattern: 'Stack', companies: ['Apple', 'Amazon', 'Google'], frequency: '🔥🔥🔥', category: 'Stack / Monotonic Stack' },
    { id: 'st-2', name: 'Daily Temperatures', url: 'https://leetcode.com/problems/daily-temperatures', difficulty: 'Medium', pattern: 'Monotonic Stack', companies: ['Netflix', 'Google'], frequency: '🔥🔥', category: 'Stack / Monotonic Stack' },
    { id: 'st-3', name: 'Next Greater Element I', url: 'https://leetcode.com/problems/next-greater-element-i', difficulty: 'Easy', pattern: 'Monotonic Stack', companies: ['Google'], frequency: '🔥', category: 'Stack / Monotonic Stack' },
    { id: 'st-4', name: 'Next Greater Element II', url: 'https://leetcode.com/problems/next-greater-element-ii', difficulty: 'Medium', pattern: 'Monotonic Stack', companies: ['Amazon'], frequency: '🔥', category: 'Stack / Monotonic Stack' },
    { id: 'st-5', name: 'Largest Rectangle in Histogram', url: 'https://leetcode.com/problems/largest-rectangle-in-histogram', difficulty: 'Hard', pattern: 'Monotonic Stack', companies: ['Microsoft', 'Google'], frequency: '🔥🔥', category: 'Stack / Monotonic Stack' },
    { id: 'st-6', name: 'Evaluate Reverse Polish Notation', url: 'https://leetcode.com/problems/evaluate-reverse-polish-notation', difficulty: 'Medium', pattern: 'Stack', companies: ['Google'], frequency: '🔥', category: 'Stack / Monotonic Stack' },
    { id: 'st-7', name: 'Basic Calculator II', url: 'https://leetcode.com/problems/basic-calculator-ii', difficulty: 'Medium', pattern: 'Stack', companies: ['Meta'], frequency: '🔥🔥', category: 'Stack / Monotonic Stack' },
    { id: 'st-8', name: 'Basic Calculator III', url: 'https://leetcode.com/problems/basic-calculator-iii', difficulty: 'Hard', pattern: 'Stack', companies: ['Google'], frequency: '🔥', category: 'Stack / Monotonic Stack' },
    { id: 'st-9', name: 'Simplify Path', url: 'https://leetcode.com/problems/simplify-path', difficulty: 'Medium', pattern: 'Stack', companies: ['Google'], frequency: '🔥', category: 'Stack / Monotonic Stack' },
    { id: 'st-10', name: 'Asteroid Collision', url: 'https://leetcode.com/problems/asteroid-collision', difficulty: 'Medium', pattern: 'Stack', companies: ['Microsoft', 'Databricks'], frequency: '🔥🔥', category: 'Stack / Monotonic Stack' },
    { id: 'st-11', name: 'Decode String', url: 'https://leetcode.com/problems/decode-string', difficulty: 'Medium', pattern: 'Stack', companies: ['Amazon', 'Databricks'], frequency: '🔥🔥', category: 'Stack / Monotonic Stack' },
    { id: 'st-12', name: 'Sum of Subarray Minimums', url: 'https://leetcode.com/problems/sum-of-subarray-minimums', difficulty: 'Medium', pattern: 'Monotonic Stack', companies: ['Amazon'], frequency: '🔥', category: 'Stack / Monotonic Stack' },
    { id: 'st-13', name: 'Min Stack', url: 'https://leetcode.com/problems/min-stack', difficulty: 'Medium', pattern: 'Stack', companies: ['Amazon', 'Microsoft', 'Flipkart'], frequency: '🔥🔥', category: 'Stack / Monotonic Stack' },
    // ==================== Linked List ====================
    { id: 'll-1', name: 'Reverse Linked List', url: 'https://leetcode.com/problems/reverse-linked-list', difficulty: 'Easy', pattern: 'Iteration/Recursion', companies: ['Apple', 'Amazon', 'Google'], frequency: '🔥🔥🔥', category: 'Linked List' },
    { id: 'll-2', name: 'Merge Two Sorted Lists', url: 'https://leetcode.com/problems/merge-two-sorted-lists', difficulty: 'Easy', pattern: 'Two Pointers', companies: ['Amazon', 'Meta', 'Microsoft'], frequency: '🔥🔥🔥', category: 'Linked List' },
    { id: 'll-3', name: 'Linked List Cycle', url: 'https://leetcode.com/problems/linked-list-cycle', difficulty: 'Easy', pattern: 'Fast/Slow Pointers', companies: ['Google'], frequency: '🔥🔥', category: 'Linked List' },
    { id: 'll-4', name: 'Add Two Numbers', url: 'https://leetcode.com/problems/add-two-numbers', difficulty: 'Medium', pattern: 'Math', companies: ['Microsoft', 'Amazon'], frequency: '🔥🔥🔥', category: 'Linked List' },
    { id: 'll-5', name: 'Copy List with Random Pointer', url: 'https://leetcode.com/problems/copy-list-with-random-pointer', difficulty: 'Medium', pattern: 'Hash Map', companies: ['Meta', 'Microsoft'], frequency: '🔥🔥🔥', category: 'Linked List' },
    { id: 'll-6', name: 'Reorder List', url: 'https://leetcode.com/problems/reorder-list', difficulty: 'Medium', pattern: 'Fast/Slow + Reverse', companies: ['Meta'], frequency: '🔥🔥', category: 'Linked List' },
    { id: 'll-7', name: 'Insert into a Sorted Circular Linked List', url: 'https://leetcode.com/problems/insert-into-a-sorted-circular-linked-list', difficulty: 'Medium', pattern: 'Linked List', companies: ['Meta'], frequency: '🔥🔥', category: 'Linked List' },
    { id: 'll-8', name: 'Reverse Linked List II', url: 'https://leetcode.com/problems/reverse-linked-list-ii', difficulty: 'Medium', pattern: 'In-place Reversal', companies: ['Google'], frequency: '🔥🔥', category: 'Linked List' },
    { id: 'll-9', name: 'Swap Nodes in Pairs', url: 'https://leetcode.com/problems/swap-nodes-in-pairs', difficulty: 'Medium', pattern: 'Recursion', companies: ['Google'], frequency: '🔥', category: 'Linked List' },
    { id: 'll-10', name: 'Reverse Nodes in k-Group', url: 'https://leetcode.com/problems/reverse-nodes-in-k-group', difficulty: 'Hard', pattern: 'In-place Reversal', companies: ['Microsoft'], frequency: '🔥🔥', category: 'Linked List' },
    { id: 'll-11', name: 'Merge k Sorted Lists', url: 'https://leetcode.com/problems/merge-k-sorted-lists', difficulty: 'Hard', pattern: 'Heap/Divide&Conquer', companies: ['Amazon', 'Google', 'Meta', 'Palantir', 'Anthropic', 'Microsoft', 'Intuit'], frequency: '🔥🔥🔥', category: 'Linked List' },
    { id: 'll-12', name: 'Odd Even Linked List', url: 'https://leetcode.com/problems/odd-even-linked-list', difficulty: 'Medium', pattern: 'Linked List', companies: ['Google'], frequency: '🔥', category: 'Linked List' },
    { id: 'll-13', name: 'Find the Duplicate Number', url: 'https://leetcode.com/problems/find-the-duplicate-number', difficulty: 'Medium', pattern: "Floyd's Cycle", companies: ['Google', 'Tesla'], frequency: '🔥🔥', category: 'Linked List' },
    // ==================== Binary Search ====================
    { id: 'bs-1', name: 'Binary Search', url: 'https://leetcode.com/problems/binary-search', difficulty: 'Easy', pattern: 'Binary Search', companies: ['Google'], frequency: '🔥', category: 'Binary Search' },
    { id: 'bs-2', name: 'Search in Rotated Sorted Array', url: 'https://leetcode.com/problems/search-in-rotated-sorted-array', difficulty: 'Medium', pattern: 'Modified Binary Search', companies: ['Google', 'Amazon', 'Tesla'], frequency: '🔥🔥🔥', category: 'Binary Search' },
    { id: 'bs-3', name: 'Find Minimum in Rotated Sorted Array', url: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array', difficulty: 'Medium', pattern: 'Binary Search', companies: ['Google'], frequency: '🔥🔥', category: 'Binary Search' },
    { id: 'bs-4', name: 'Find Peak Element', url: 'https://leetcode.com/problems/find-peak-element', difficulty: 'Medium', pattern: 'Binary Search', companies: ['Meta', 'Google'], frequency: '🔥🔥', category: 'Binary Search' },
    { id: 'bs-5', name: 'Search a 2D Matrix', url: 'https://leetcode.com/problems/search-a-2d-matrix', difficulty: 'Medium', pattern: 'Binary Search', companies: ['Apple', 'Microsoft'], frequency: '🔥🔥', category: 'Binary Search' },
    { id: 'bs-6', name: 'Search a 2D Matrix II', url: 'https://leetcode.com/problems/search-a-2d-matrix-ii', difficulty: 'Medium', pattern: 'Binary Search', companies: ['Google'], frequency: '🔥🔥', category: 'Binary Search' },
    { id: 'bs-7', name: 'Koko Eating Bananas', url: 'https://leetcode.com/problems/koko-eating-bananas', difficulty: 'Medium', pattern: 'Binary Search on Answer', companies: ['Amazon', 'Google', 'Netflix'], frequency: '🔥🔥🔥', category: 'Binary Search' },
    { id: 'bs-8', name: 'Capacity To Ship Packages Within D Days', url: 'https://leetcode.com/problems/capacity-to-ship-packages-within-d-days', difficulty: 'Medium', pattern: 'Binary Search on Answer', companies: ['Databricks'], frequency: '🔥🔥', category: 'Binary Search' },
    { id: 'bs-9', name: 'Median of Two Sorted Arrays', url: 'https://leetcode.com/problems/median-of-two-sorted-arrays', difficulty: 'Hard', pattern: 'Binary Search', companies: ['Google', 'Amazon', 'Apple', 'Microsoft'], frequency: '🔥🔥🔥', category: 'Binary Search' },
    { id: 'bs-10', name: 'Search Insert Position', url: 'https://leetcode.com/problems/search-insert-position', difficulty: 'Easy', pattern: 'Binary Search', companies: ['Google'], frequency: '🔥', category: 'Binary Search' },
    // ==================== Trees ====================
    { id: 'tr-1', name: 'Maximum Depth of Binary Tree', url: 'https://leetcode.com/problems/maximum-depth-of-binary-tree', difficulty: 'Easy', pattern: 'DFS/BFS', companies: ['Amazon', 'Google'], frequency: '🔥🔥🔥', category: 'Trees' },
    { id: 'tr-2', name: 'Same Tree', url: 'https://leetcode.com/problems/same-tree', difficulty: 'Easy', pattern: 'DFS', companies: ['Google'], frequency: '🔥', category: 'Trees' },
    { id: 'tr-3', name: 'Symmetric Tree', url: 'https://leetcode.com/problems/symmetric-tree', difficulty: 'Easy', pattern: 'DFS/BFS', companies: ['Microsoft'], frequency: '🔥🔥', category: 'Trees' },
    { id: 'tr-4', name: 'Balanced Binary Tree', url: 'https://leetcode.com/problems/balanced-binary-tree', difficulty: 'Easy', pattern: 'DFS', companies: ['Adobe', 'Walmart'], frequency: '🔥🔥', category: 'Trees' },
    { id: 'tr-5', name: 'Invert Binary Tree', url: 'https://leetcode.com/problems/invert-binary-tree', difficulty: 'Easy', pattern: 'DFS', companies: ['Amazon'], frequency: '🔥🔥', category: 'Trees' },
    { id: 'tr-6', name: 'Binary Tree Level Order Traversal', url: 'https://leetcode.com/problems/binary-tree-level-order-traversal', difficulty: 'Medium', pattern: 'BFS', companies: ['Google', 'Amazon', 'Microsoft', 'Uber', 'Intuit'], frequency: '🔥🔥🔥', category: 'Trees' },
    { id: 'tr-7', name: 'Binary Tree Zigzag Level Order Traversal', url: 'https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal', difficulty: 'Medium', pattern: 'BFS', companies: ['Amazon'], frequency: '🔥🔥', category: 'Trees' },
    { id: 'tr-8', name: 'Binary Tree Right Side View', url: 'https://leetcode.com/problems/binary-tree-right-side-view', difficulty: 'Medium', pattern: 'BFS/DFS', companies: ['Meta'], frequency: '🔥🔥', category: 'Trees' },
    { id: 'tr-9', name: 'Validate Binary Search Tree', url: 'https://leetcode.com/problems/validate-binary-search-tree', difficulty: 'Medium', pattern: 'DFS', companies: ['Google', 'Amazon'], frequency: '🔥🔥🔥', category: 'Trees' },
    { id: 'tr-10', name: 'Lowest Common Ancestor of a Binary Tree', url: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree', difficulty: 'Medium', pattern: 'DFS', companies: ['Meta', 'Amazon', 'Apple', 'Google'], frequency: '🔥🔥🔥', category: 'Trees' },
    { id: 'tr-11', name: 'Lowest Common Ancestor of a BST', url: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree', difficulty: 'Medium', pattern: 'BST', companies: ['LinkedIn', 'Google'], frequency: '🔥🔥', category: 'Trees' },
    { id: 'tr-12', name: 'Kth Smallest Element in a BST', url: 'https://leetcode.com/problems/kth-smallest-element-in-a-bst', difficulty: 'Medium', pattern: 'Inorder', companies: ['Google', 'Amazon', 'Walmart'], frequency: '🔥🔥', category: 'Trees' },
    { id: 'tr-13', name: 'Construct Binary Tree from Preorder and Inorder Traversal', url: 'https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal', difficulty: 'Medium', pattern: 'Divide & Conquer', companies: ['Microsoft', 'Google'], frequency: '🔥🔥', category: 'Trees' },
    { id: 'tr-14', name: 'Serialize and Deserialize Binary Tree', url: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree', difficulty: 'Hard', pattern: 'BFS/DFS', companies: ['Google', 'Amazon', 'Apple', 'Meta', 'Netflix', 'Anthropic'], frequency: '🔥🔥🔥', category: 'Trees' },
    { id: 'tr-15', name: 'Binary Tree Maximum Path Sum', url: 'https://leetcode.com/problems/binary-tree-maximum-path-sum', difficulty: 'Hard', pattern: 'DFS', companies: ['Google', 'Amazon', 'Microsoft'], frequency: '🔥🔥🔥', category: 'Trees' },
    { id: 'tr-16', name: 'Diameter of Binary Tree', url: 'https://leetcode.com/problems/diameter-of-binary-tree', difficulty: 'Easy', pattern: 'DFS', companies: ['Meta', 'Amazon', 'Google'], frequency: '🔥🔥🔥', category: 'Trees' },
    { id: 'tr-17', name: 'Path Sum III', url: 'https://leetcode.com/problems/path-sum-iii', difficulty: 'Medium', pattern: 'DFS + Prefix Sum', companies: ['Google'], frequency: '🔥🔥', category: 'Trees' },
    { id: 'tr-18', name: 'Count Good Nodes in Binary Tree', url: 'https://leetcode.com/problems/count-good-nodes-in-binary-tree', difficulty: 'Medium', pattern: 'DFS', companies: ['Google'], frequency: '🔥', category: 'Trees' },
    { id: 'tr-19', name: 'Sum Root to Leaf Numbers', url: 'https://leetcode.com/problems/sum-root-to-leaf-numbers', difficulty: 'Medium', pattern: 'DFS', companies: ['Apple', 'Google', 'Flipkart', 'Microsoft'], frequency: '🔥🔥', category: 'Trees' },
    { id: 'tr-20', name: 'Check Completeness of a Binary Tree', url: 'https://leetcode.com/problems/check-completeness-of-a-binary-tree', difficulty: 'Medium', pattern: 'BFS', companies: ['Apple'], frequency: '🔥', category: 'Trees' },
    { id: 'tr-21', name: 'Binary Tree Vertical Order Traversal', url: 'https://leetcode.com/problems/vertical-order-traversal-of-a-binary-tree', difficulty: 'Medium', pattern: 'BFS', companies: ['Meta'], frequency: '🔥🔥', category: 'Trees' },
    { id: 'tr-22', name: 'All Nodes Distance K in Binary Tree', url: 'https://leetcode.com/problems/all-nodes-distance-k-in-binary-tree', difficulty: 'Medium', pattern: 'BFS + Graph', companies: ['Databricks', 'Google'], frequency: '🔥🔥', category: 'Trees' },
    { id: 'tr-23', name: 'Range Sum of BST', url: 'https://leetcode.com/problems/range-sum-of-bst', difficulty: 'Easy', pattern: 'BST', companies: ['Meta'], frequency: '🔥🔥', category: 'Trees' },
    { id: 'tr-24', name: 'Find Leaves of Binary Tree', url: 'https://leetcode.com/problems/find-leaves-of-binary-tree', difficulty: 'Medium', pattern: 'DFS', companies: ['Google', 'LinkedIn'], frequency: '🔥🔥', category: 'Trees' },
    { id: 'tr-25', name: 'Maximum Difference Between Node and Ancestor', url: 'https://leetcode.com/problems/maximum-difference-between-node-and-ancestor', difficulty: 'Medium', pattern: 'DFS', companies: ['Amazon', 'Google'], frequency: '🔥', category: 'Trees' },
    { id: 'tr-26', name: 'Amount of Time for Binary Tree to Be Infected', url: 'https://leetcode.com/problems/amount-of-time-for-binary-tree-to-be-infected', difficulty: 'Medium', pattern: 'BFS', companies: ['Google'], frequency: '🔥', category: 'Trees' },
    // ==================== Graphs ====================
    { id: 'gr-1', name: 'Number of Islands', url: 'https://leetcode.com/problems/number-of-islands', difficulty: 'Medium', pattern: 'DFS/BFS', companies: ['Google', 'Amazon', 'Meta', 'Apple', 'Microsoft', 'Palantir', 'Anthropic', 'Adobe'], frequency: '🔥🔥🔥', category: 'Graphs' },
    { id: 'gr-2', name: 'Clone Graph', url: 'https://leetcode.com/problems/clone-graph', difficulty: 'Medium', pattern: 'DFS/BFS', companies: ['Meta', 'Microsoft', 'Amazon', 'Google', 'Uber', 'Apple'], frequency: '🔥🔥🔥', category: 'Graphs' },
    { id: 'gr-3', name: 'Course Schedule', url: 'https://leetcode.com/problems/course-schedule', difficulty: 'Medium', pattern: 'Topological Sort', companies: ['Amazon', 'Apple', 'Palantir'], frequency: '🔥🔥🔥', category: 'Graphs' },
    { id: 'gr-4', name: 'Course Schedule II', url: 'https://leetcode.com/problems/course-schedule-ii', difficulty: 'Medium', pattern: 'Topological Sort', companies: ['Google', 'Netflix', 'Palantir', 'Anthropic'], frequency: '🔥🔥🔥', category: 'Graphs' },
    { id: 'gr-5', name: 'Rotting Oranges', url: 'https://leetcode.com/problems/rotting-oranges', difficulty: 'Medium', pattern: 'BFS', companies: ['Amazon', 'Databricks'], frequency: '🔥🔥🔥', category: 'Graphs' },
    { id: 'gr-6', name: 'Word Ladder', url: 'https://leetcode.com/problems/word-ladder', difficulty: 'Hard', pattern: 'BFS', companies: ['Google', 'Amazon', 'LinkedIn'], frequency: '🔥🔥🔥', category: 'Graphs' },
    { id: 'gr-7', name: 'Accounts Merge', url: 'https://leetcode.com/problems/accounts-merge', difficulty: 'Medium', pattern: 'Union-Find/DFS', companies: ['Meta', 'Google'], frequency: '🔥🔥', category: 'Graphs' },
    { id: 'gr-8', name: 'Making a Large Island', url: 'https://leetcode.com/problems/making-a-large-island', difficulty: 'Hard', pattern: 'DFS + Union-Find', companies: ['Meta', 'Amazon'], frequency: '🔥🔥', category: 'Graphs' },
    { id: 'gr-9', name: 'Shortest Path in Binary Matrix', url: 'https://leetcode.com/problems/shortest-path-in-binary-matrix', difficulty: 'Medium', pattern: 'BFS', companies: ['Meta', 'Microsoft'], frequency: '🔥🔥', category: 'Graphs' },
    { id: 'gr-10', name: 'Network Delay Time', url: 'https://leetcode.com/problems/network-delay-time', difficulty: 'Medium', pattern: 'Dijkstra', companies: ['Netflix', 'Google', 'Uber'], frequency: '🔥🔥', category: 'Graphs' },
    { id: 'gr-11', name: 'Cheapest Flights Within K Stops', url: 'https://leetcode.com/problems/cheapest-flights-within-k-stops', difficulty: 'Medium', pattern: 'BFS/Bellman-Ford', companies: ['Microsoft', 'Databricks'], frequency: '🔥🔥', category: 'Graphs' },
    { id: 'gr-12', name: 'Evaluate Division', url: 'https://leetcode.com/problems/evaluate-division', difficulty: 'Medium', pattern: 'DFS/Union-Find', companies: ['Google'], frequency: '🔥🔥', category: 'Graphs' },
    { id: 'gr-13', name: 'Alien Dictionary', url: 'https://leetcode.com/problems/alien-dictionary', difficulty: 'Hard', pattern: 'Topological Sort', companies: ['Google', 'OpenAI', 'Tesla'], frequency: '🔥🔥🔥', category: 'Graphs' },
    { id: 'gr-14', name: 'Walls and Gates', url: 'https://leetcode.com/problems/walls-and-gates', difficulty: 'Medium', pattern: 'BFS', companies: ['Google'], frequency: '🔥🔥', category: 'Graphs' },
    { id: 'gr-15', name: 'Number of Provinces', url: 'https://leetcode.com/problems/number-of-provinces', difficulty: 'Medium', pattern: 'Union-Find/DFS', companies: ['Amazon'], frequency: '🔥🔥', category: 'Graphs' },
    { id: 'gr-16', name: 'Max Area of Island', url: 'https://leetcode.com/problems/max-area-of-island', difficulty: 'Medium', pattern: 'DFS', companies: ['Palantir'], frequency: '🔥🔥', category: 'Graphs' },
    { id: 'gr-17', name: 'Flood Fill', url: 'https://leetcode.com/problems/flood-fill', difficulty: 'Easy', pattern: 'DFS/BFS', companies: ['Google', 'Adobe', 'Apple'], frequency: '🔥🔥', category: 'Graphs' },
    { id: 'gr-18', name: 'Surrounded Regions', url: 'https://leetcode.com/problems/surrounded-regions', difficulty: 'Medium', pattern: 'DFS/BFS', companies: ['Google'], frequency: '🔥🔥', category: 'Graphs' },
    { id: 'gr-19', name: 'Pacific Atlantic Water Flow', url: 'https://leetcode.com/problems/pacific-atlantic-water-flow', difficulty: 'Medium', pattern: 'DFS', companies: ['Google'], frequency: '🔥', category: 'Graphs' },
    { id: 'gr-20', name: 'Shortest Path in a Grid with Obstacles Elimination', url: 'https://leetcode.com/problems/shortest-path-in-a-grid-with-obstacles-elimination', difficulty: 'Hard', pattern: 'BFS', companies: ['Google'], frequency: '🔥', category: 'Graphs' },
    { id: 'gr-21', name: 'All Ancestors of a Node in DAG', url: 'https://leetcode.com/problems/all-ancestors-of-a-node-in-a-directed-acyclic-graph', difficulty: 'Medium', pattern: 'DFS', companies: ['Palantir'], frequency: '🔥', category: 'Graphs' },
    { id: 'gr-22', name: 'Is Graph Bipartite?', url: 'https://leetcode.com/problems/is-graph-bipartite', difficulty: 'Medium', pattern: 'BFS/DFS', companies: ['Google'], frequency: '🔥', category: 'Graphs' },
    { id: 'gr-23', name: 'Number of Closed Islands', url: 'https://leetcode.com/problems/number-of-closed-islands', difficulty: 'Medium', pattern: 'DFS', companies: ['Google'], frequency: '🔥', category: 'Graphs' },
    { id: 'gr-24', name: 'Longest Increasing Path in a Matrix', url: 'https://leetcode.com/problems/longest-increasing-path-in-a-matrix', difficulty: 'Hard', pattern: 'DFS + Memo', companies: ['Meta', 'Google', 'Microsoft', 'Uber', 'Adobe'], frequency: '🔥🔥', category: 'Graphs' },
    { id: 'gr-25', name: 'Bus Routes', url: 'https://leetcode.com/problems/bus-routes', difficulty: 'Hard', pattern: 'BFS', companies: ['Apple'], frequency: '🔥', category: 'Graphs' },
    // ==================== Heap / Priority Queue ====================
    { id: 'hp-1', name: 'Kth Largest Element in an Array', url: 'https://leetcode.com/problems/kth-largest-element-in-an-array', difficulty: 'Medium', pattern: 'Heap/Quickselect', companies: ['Google', 'Amazon', 'Meta'], frequency: '🔥🔥🔥', category: 'Heap / Priority Queue' },
    { id: 'hp-2', name: 'K Closest Points to Origin', url: 'https://leetcode.com/problems/k-closest-points-to-origin', difficulty: 'Medium', pattern: 'Heap', companies: ['Amazon', 'Google', 'Databricks'], frequency: '🔥🔥🔥', category: 'Heap / Priority Queue' },
    { id: 'hp-3', name: 'Find Median from Data Stream', url: 'https://leetcode.com/problems/find-median-from-data-stream', difficulty: 'Hard', pattern: 'Two Heaps', companies: ['Amazon', 'Netflix', 'Google', 'Apple'], frequency: '🔥🔥🔥', category: 'Heap / Priority Queue' },
    { id: 'hp-4', name: 'Task Scheduler', url: 'https://leetcode.com/problems/task-scheduler', difficulty: 'Medium', pattern: 'Heap + Greedy', companies: ['Amazon', 'Google'], frequency: '🔥🔥🔥', category: 'Heap / Priority Queue' },
    { id: 'hp-5', name: 'Reorganize String', url: 'https://leetcode.com/problems/reorganize-string', difficulty: 'Medium', pattern: 'Heap', companies: ['Amazon', 'Tesla'], frequency: '🔥🔥', category: 'Heap / Priority Queue' },
    { id: 'hp-6', name: 'Meeting Rooms II', url: 'https://leetcode.com/problems/meeting-rooms-ii', difficulty: 'Medium', pattern: 'Heap', companies: ['Google', 'Netflix', 'OpenAI'], frequency: '🔥🔥🔥', category: 'Heap / Priority Queue' },
    { id: 'hp-7', name: 'Smallest Range Covering Elements from K Lists', url: 'https://leetcode.com/problems/smallest-range-covering-elements-from-k-lists', difficulty: 'Hard', pattern: 'Heap', companies: ['Google'], frequency: '🔥', category: 'Heap / Priority Queue' },
    { id: 'hp-8', name: 'Sort Characters By Frequency', url: 'https://leetcode.com/problems/sort-characters-by-frequency', difficulty: 'Medium', pattern: 'Heap/Bucket Sort', companies: ['Google'], frequency: '🔥', category: 'Heap / Priority Queue' },
    { id: 'hp-9', name: 'Find K Pairs with Smallest Sums', url: 'https://leetcode.com/problems/find-k-pairs-with-smallest-sums', difficulty: 'Medium', pattern: 'Heap', companies: ['Google'], frequency: '🔥', category: 'Heap / Priority Queue' },
    { id: 'hp-10', name: 'K-th Smallest Prime Fraction', url: 'https://leetcode.com/problems/k-th-smallest-prime-fraction', difficulty: 'Medium', pattern: 'Binary Search/Heap', companies: ['Google'], frequency: '🔥', category: 'Heap / Priority Queue' },
    // ==================== Dynamic Programming ====================
    { id: 'dp-1', name: 'Climbing Stairs', url: 'https://leetcode.com/problems/climbing-stairs', difficulty: 'Easy', pattern: '1D DP', companies: ['Amazon'], frequency: '🔥🔥', category: 'Dynamic Programming' },
    { id: 'dp-2', name: 'House Robber', url: 'https://leetcode.com/problems/house-robber', difficulty: 'Medium', pattern: '1D DP', companies: ['Google'], frequency: '🔥🔥', category: 'Dynamic Programming' },
    { id: 'dp-3', name: 'House Robber II', url: 'https://leetcode.com/problems/house-robber-ii', difficulty: 'Medium', pattern: '1D DP', companies: ['LinkedIn'], frequency: '🔥', category: 'Dynamic Programming' },
    { id: 'dp-4', name: 'Coin Change', url: 'https://leetcode.com/problems/coin-change', difficulty: 'Medium', pattern: 'Unbounded Knapsack', companies: ['Google', 'Amazon'], frequency: '🔥🔥🔥', category: 'Dynamic Programming' },
    { id: 'dp-5', name: 'Coin Change II', url: 'https://leetcode.com/problems/coin-change-ii', difficulty: 'Medium', pattern: 'Unbounded Knapsack', companies: ['Amazon'], frequency: '🔥🔥', category: 'Dynamic Programming' },
    { id: 'dp-6', name: 'Word Break', url: 'https://leetcode.com/problems/word-break', difficulty: 'Medium', pattern: 'DP + Trie', companies: ['Meta', 'Amazon', 'Apple', 'Databricks', 'Anthropic'], frequency: '🔥🔥🔥', category: 'Dynamic Programming' },
    { id: 'dp-7', name: 'Word Break II', url: 'https://leetcode.com/problems/word-break-ii', difficulty: 'Hard', pattern: 'DP + Backtracking', companies: ['Amazon'], frequency: '🔥🔥', category: 'Dynamic Programming' },
    { id: 'dp-8', name: 'Longest Palindromic Substring', url: 'https://leetcode.com/problems/longest-palindromic-substring', difficulty: 'Medium', pattern: 'Expand Around Center', companies: ['Amazon', 'Google', 'Meta'], frequency: '🔥🔥🔥', category: 'Dynamic Programming' },
    { id: 'dp-9', name: 'Decode Ways', url: 'https://leetcode.com/problems/decode-ways', difficulty: 'Medium', pattern: '1D DP', companies: ['Meta', 'LinkedIn'], frequency: '🔥🔥', category: 'Dynamic Programming' },
    { id: 'dp-10', name: 'Unique Paths', url: 'https://leetcode.com/problems/unique-paths', difficulty: 'Medium', pattern: '2D DP', companies: ['Google', 'Uber', 'Amazon', 'Adobe'], frequency: '🔥🔥', category: 'Dynamic Programming' },
    { id: 'dp-11', name: 'Longest Increasing Subsequence', url: 'https://leetcode.com/problems/longest-increasing-subsequence', difficulty: 'Medium', pattern: 'DP + Binary Search', companies: ['Google', 'Amazon'], frequency: '🔥🔥🔥', category: 'Dynamic Programming' },
    { id: 'dp-12', name: 'Maximum Product Subarray', url: 'https://leetcode.com/problems/maximum-product-subarray', difficulty: 'Medium', pattern: 'DP', companies: ['Amazon', 'LinkedIn', 'Microsoft'], frequency: '🔥🔥', category: 'Dynamic Programming' },
    { id: 'dp-13', name: 'Jump Game', url: 'https://leetcode.com/problems/jump-game', difficulty: 'Medium', pattern: 'Greedy/DP', companies: ['Google', 'Amazon'], frequency: '🔥🔥', category: 'Dynamic Programming' },
    { id: 'dp-14', name: 'Jump Game II', url: 'https://leetcode.com/problems/jump-game-ii', difficulty: 'Medium', pattern: 'Greedy', companies: ['Google'], frequency: '🔥🔥', category: 'Dynamic Programming' },
    { id: 'dp-15', name: 'Best Time to Buy and Sell Stock', url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock', difficulty: 'Easy', pattern: 'DP/Greedy', companies: ['Meta', 'Amazon', 'Apple', 'Microsoft'], frequency: '🔥🔥🔥', category: 'Dynamic Programming' },
    { id: 'dp-16', name: 'Edit Distance', url: 'https://leetcode.com/problems/edit-distance', difficulty: 'Hard', pattern: '2D DP', companies: ['Google', 'Netflix', 'LinkedIn', 'Uber', 'Adobe'], frequency: '🔥🔥🔥', category: 'Dynamic Programming' },
    { id: 'dp-17', name: 'Longest Common Subsequence', url: 'https://leetcode.com/problems/longest-common-subsequence', difficulty: 'Medium', pattern: '2D DP', companies: ['Google'], frequency: '🔥🔥', category: 'Dynamic Programming' },
    { id: 'dp-18', name: 'Partition Equal Subset Sum', url: 'https://leetcode.com/problems/partition-equal-subset-sum', difficulty: 'Medium', pattern: '0/1 Knapsack', companies: ['Google', 'Amazon', 'Uber', 'Flipkart'], frequency: '🔥🔥', category: 'Dynamic Programming' },
    { id: 'dp-19', name: 'Burst Balloons', url: 'https://leetcode.com/problems/burst-balloons', difficulty: 'Hard', pattern: 'Interval DP', companies: ['Google'], frequency: '🔥🔥', category: 'Dynamic Programming' },
    { id: 'dp-20', name: 'Regular Expression Matching', url: 'https://leetcode.com/problems/regular-expression-matching', difficulty: 'Hard', pattern: '2D DP', companies: ['Microsoft', 'Palantir'], frequency: '🔥🔥', category: 'Dynamic Programming' },
    { id: 'dp-21', name: 'Maximum Profit in Job Scheduling', url: 'https://leetcode.com/problems/maximum-profit-in-job-scheduling', difficulty: 'Hard', pattern: 'DP + Binary Search', companies: ['Apple'], frequency: '🔥🔥', category: 'Dynamic Programming' },
    { id: 'dp-22', name: 'N-th Tribonacci Number', url: 'https://leetcode.com/problems/n-th-tribonacci-number', difficulty: 'Easy', pattern: '1D DP', companies: ['Google'], frequency: '🔥', category: 'Dynamic Programming' },
    { id: 'dp-23', name: 'Number of Dice Rolls With Target Sum', url: 'https://leetcode.com/problems/number-of-dice-rolls-with-target-sum', difficulty: 'Medium', pattern: 'DP', companies: ['Google'], frequency: '🔥', category: 'Dynamic Programming' },
    { id: 'dp-24', name: 'Frog Jump', url: 'https://leetcode.com/problems/frog-jump', difficulty: 'Hard', pattern: 'DP', companies: ['Google'], frequency: '🔥', category: 'Dynamic Programming' },
    { id: 'dp-25', name: 'Split Array Largest Sum', url: 'https://leetcode.com/problems/split-array-largest-sum', difficulty: 'Hard', pattern: 'Binary Search + DP', companies: ['Google'], frequency: '🔥', category: 'Dynamic Programming' },
    // ==================== Backtracking ====================
    { id: 'bt-1', name: 'Subsets', url: 'https://leetcode.com/problems/subsets', difficulty: 'Medium', pattern: 'Backtracking', companies: ['Meta', 'Amazon'], frequency: '🔥🔥🔥', category: 'Backtracking' },
    { id: 'bt-2', name: 'Permutations', url: 'https://leetcode.com/problems/permutations', difficulty: 'Medium', pattern: 'Backtracking', companies: ['Meta', 'Google'], frequency: '🔥🔥🔥', category: 'Backtracking' },
    { id: 'bt-3', name: 'Permutations II', url: 'https://leetcode.com/problems/permutations-ii', difficulty: 'Medium', pattern: 'Backtracking', companies: ['Google'], frequency: '🔥', category: 'Backtracking' },
    { id: 'bt-4', name: 'Combination Sum', url: 'https://leetcode.com/problems/combination-sum', difficulty: 'Medium', pattern: 'Backtracking', companies: ['Google', 'Microsoft', 'Amazon'], frequency: '🔥🔥🔥', category: 'Backtracking' },
    { id: 'bt-5', name: 'Letter Combinations of a Phone Number', url: 'https://leetcode.com/problems/letter-combinations-of-a-phone-number', difficulty: 'Medium', pattern: 'Backtracking', companies: ['Meta', 'Google'], frequency: '🔥🔥🔥', category: 'Backtracking' },
    { id: 'bt-6', name: 'Word Search', url: 'https://leetcode.com/problems/word-search', difficulty: 'Medium', pattern: 'Backtracking', companies: ['Google'], frequency: '🔥🔥', category: 'Backtracking' },
    { id: 'bt-7', name: 'Word Search II', url: 'https://leetcode.com/problems/word-search-ii', difficulty: 'Hard', pattern: 'Backtracking + Trie', companies: ['Google'], frequency: '🔥🔥', category: 'Backtracking' },
    { id: 'bt-8', name: 'N-Queens', url: 'https://leetcode.com/problems/n-queens', difficulty: 'Hard', pattern: 'Backtracking', companies: ['Google'], frequency: '🔥🔥', category: 'Backtracking' },
    { id: 'bt-9', name: 'Palindrome Partitioning', url: 'https://leetcode.com/problems/palindrome-partitioning', difficulty: 'Medium', pattern: 'Backtracking', companies: ['Google'], frequency: '🔥', category: 'Backtracking' },
    { id: 'bt-10', name: 'Generate Parentheses', url: 'https://leetcode.com/problems/generate-parentheses', difficulty: 'Medium', pattern: 'Backtracking', companies: ['Google'], frequency: '🔥🔥', category: 'Backtracking' },
    { id: 'bt-11', name: 'Remove Invalid Parentheses', url: 'https://leetcode.com/problems/remove-invalid-parentheses', difficulty: 'Hard', pattern: 'BFS/Backtracking', companies: ['Meta'], frequency: '🔥🔥', category: 'Backtracking' },
    { id: 'bt-12', name: 'Expression Add Operators', url: 'https://leetcode.com/problems/expression-add-operators', difficulty: 'Hard', pattern: 'Backtracking', companies: ['Meta'], frequency: '🔥', category: 'Backtracking' },
    { id: 'bt-13', name: 'Sudoku Solver', url: 'https://leetcode.com/problems/sudoku-solver', difficulty: 'Hard', pattern: 'Backtracking', companies: ['Microsoft'], frequency: '🔥', category: 'Backtracking' },
    // ==================== Intervals ====================
    { id: 'iv-1', name: 'Merge Intervals', url: 'https://leetcode.com/problems/merge-intervals', difficulty: 'Medium', pattern: 'Sorting', companies: ['Google', 'Amazon', 'Meta', 'Apple', 'Netflix', 'Palantir', 'LinkedIn'], frequency: '🔥🔥🔥', category: 'Intervals' },
    { id: 'iv-2', name: 'Insert Interval', url: 'https://leetcode.com/problems/insert-interval', difficulty: 'Medium', pattern: 'Intervals', companies: ['Google'], frequency: '🔥🔥', category: 'Intervals' },
    { id: 'iv-3', name: 'Non-overlapping Intervals', url: 'https://leetcode.com/problems/non-overlapping-intervals', difficulty: 'Medium', pattern: 'Greedy', companies: ['Google'], frequency: '🔥🔥', category: 'Intervals' },
    { id: 'iv-4', name: 'Meeting Rooms', url: 'https://leetcode.com/problems/meeting-rooms', difficulty: 'Easy', pattern: 'Sorting', companies: ['Google'], frequency: '🔥', category: 'Intervals' },
    { id: 'iv-5', name: 'Meeting Rooms III', url: 'https://leetcode.com/problems/meeting-rooms-iii', difficulty: 'Hard', pattern: 'Heap', companies: ['Google'], frequency: '🔥', category: 'Intervals' },
    { id: 'iv-6', name: 'Minimum Number of Arrows to Burst Balloons', url: 'https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons', difficulty: 'Medium', pattern: 'Greedy', companies: ['Google'], frequency: '🔥', category: 'Intervals' },
    { id: 'iv-7', name: 'Employee Free Time', url: 'https://leetcode.com/problems/employee-free-time', difficulty: 'Hard', pattern: 'Heap', companies: ['Google'], frequency: '🔥', category: 'Intervals' },
    // ==================== Trie ====================
    { id: 'ti-1', name: 'Implement Trie (Prefix Tree)', url: 'https://leetcode.com/problems/implement-trie-prefix-tree', difficulty: 'Medium', pattern: 'Trie', companies: ['Google', 'Netflix', 'OpenAI', 'Tesla', 'Anthropic', 'Uber', 'Salesforce', 'Amazon'], frequency: '🔥🔥🔥', category: 'Trie' },
    { id: 'ti-2', name: 'Design Add and Search Words Data Structure', url: 'https://leetcode.com/problems/design-add-and-search-words-data-structure', difficulty: 'Medium', pattern: 'Trie + DFS', companies: ['LinkedIn', 'Google'], frequency: '🔥🔥', category: 'Trie' },
    { id: 'ti-3', name: 'Search Suggestions System', url: 'https://leetcode.com/problems/search-suggestions-system', difficulty: 'Medium', pattern: 'Trie', companies: ['Google'], frequency: '🔥🔥', category: 'Trie' },
    // ==================== Design ====================
    { id: 'ds-1', name: 'LRU Cache', url: 'https://leetcode.com/problems/lru-cache', difficulty: 'Medium', pattern: 'Hash + DLL', companies: ['Google', 'Amazon', 'Meta', 'Apple', 'Microsoft', 'Netflix', 'OpenAI', 'Palantir', 'Tesla', 'Databricks', 'LinkedIn', 'Anthropic'], frequency: '🔥🔥🔥', category: 'Design' },
    { id: 'ds-2', name: 'LFU Cache', url: 'https://leetcode.com/problems/lfu-cache', difficulty: 'Hard', pattern: 'Hash + DLL', companies: ['Amazon', 'OpenAI', 'Google'], frequency: '🔥🔥', category: 'Design' },
    { id: 'ds-3', name: 'Insert Delete GetRandom O(1)', url: 'https://leetcode.com/problems/insert-delete-getrandom-o1', difficulty: 'Medium', pattern: 'Hash + Array', companies: ['Amazon', 'LinkedIn'], frequency: '🔥🔥', category: 'Design' },
    { id: 'ds-4', name: 'Design Hit Counter', url: 'https://leetcode.com/problems/design-hit-counter', difficulty: 'Medium', pattern: 'Queue/Array', companies: ['Netflix', 'Databricks', 'Anthropic'], frequency: '🔥🔥', category: 'Design' },
    { id: 'ds-5', name: 'Design Tic-Tac-Toe', url: 'https://leetcode.com/problems/design-tic-tac-toe', difficulty: 'Medium', pattern: 'Design', companies: ['Meta'], frequency: '🔥🔥', category: 'Design' },
    { id: 'ds-6', name: 'Time Based Key-Value Store', url: 'https://leetcode.com/problems/time-based-key-value-store', difficulty: 'Medium', pattern: 'Hash + Binary Search', companies: ['OpenAI', 'Databricks', 'Anthropic'], frequency: '🔥🔥', category: 'Design' },
    { id: 'ds-7', name: 'Snapshot Array', url: 'https://leetcode.com/problems/snapshot-array', difficulty: 'Medium', pattern: 'Hash + Binary Search', companies: ['OpenAI', 'Databricks'], frequency: '🔥🔥', category: 'Design' },
    { id: 'ds-8', name: 'Dot Product of Two Sparse Vectors', url: 'https://leetcode.com/problems/dot-product-of-two-sparse-vectors', difficulty: 'Medium', pattern: 'Hash Map', companies: ['Meta'], frequency: '🔥🔥🔥', category: 'Design' },
    { id: 'ds-9', name: 'Design In-Memory File System', url: 'https://leetcode.com/problems/design-in-memory-file-system', difficulty: 'Hard', pattern: 'Trie/Tree', companies: ['Amazon', 'Google'], frequency: '🔥🔥', category: 'Design' },
    { id: 'ds-10', name: 'Design Search Autocomplete System', url: 'https://leetcode.com/problems/design-search-autocomplete-system', difficulty: 'Hard', pattern: 'Trie + Heap', companies: ['Amazon'], frequency: '🔥🔥', category: 'Design' },
    { id: 'ds-11', name: 'Max Stack', url: 'https://leetcode.com/problems/max-stack', difficulty: 'Hard', pattern: 'Stack + Tree', companies: ['LinkedIn', 'Databricks'], frequency: '🔥🔥', category: 'Design' },
    { id: 'ds-12', name: "All O'one Data Structure", url: 'https://leetcode.com/problems/all-oone-data-structure', difficulty: 'Hard', pattern: 'Hash + DLL', companies: ['LinkedIn', 'Databricks'], frequency: '🔥', category: 'Design' },
    { id: 'ds-13', name: 'Nested List Weight Sum', url: 'https://leetcode.com/problems/nested-list-weight-sum', difficulty: 'Medium', pattern: 'DFS', companies: ['Meta', 'LinkedIn'], frequency: '🔥🔥', category: 'Design' },
    { id: 'ds-14', name: 'Nested List Weight Sum II', url: 'https://leetcode.com/problems/nested-list-weight-sum-ii', difficulty: 'Medium', pattern: 'DFS', companies: ['LinkedIn'], frequency: '🔥', category: 'Design' },
    { id: 'ds-15', name: 'Design HashMap', url: 'https://leetcode.com/problems/design-hashmap', difficulty: 'Easy', pattern: 'Design', companies: ['Tesla'], frequency: '🔥', category: 'Design' },
    { id: 'ds-16', name: 'Design Underground System', url: 'https://leetcode.com/problems/design-underground-system', difficulty: 'Medium', pattern: 'Design', companies: ['Tesla'], frequency: '🔥', category: 'Design' },
    { id: 'ds-17', name: 'Web Crawler Multithreaded', url: 'https://leetcode.com/problems/web-crawler-multithreaded', difficulty: 'Medium', pattern: 'BFS + Threads', companies: ['OpenAI', 'Anthropic'], frequency: '🔥🔥', category: 'Design' },
    { id: 'ds-18', name: 'Random Pick with Weight', url: 'https://leetcode.com/problems/random-pick-with-weight', difficulty: 'Medium', pattern: 'Prefix Sum + Binary Search', companies: ['Meta'], frequency: '🔥🔥', category: 'Design' },
    // ==================== Matrix ====================
    { id: 'mx-1', name: 'Valid Sudoku', url: 'https://leetcode.com/problems/valid-sudoku', difficulty: 'Medium', pattern: 'Hash Set', companies: ['Google', 'Amazon'], frequency: '🔥🔥', category: 'Matrix' },
    { id: 'mx-2', name: 'Spiral Matrix', url: 'https://leetcode.com/problems/spiral-matrix', difficulty: 'Medium', pattern: 'Simulation', companies: ['Google'], frequency: '🔥🔥', category: 'Matrix' },
    { id: 'mx-3', name: 'Set Matrix Zeroes', url: 'https://leetcode.com/problems/set-matrix-zeroes', difficulty: 'Medium', pattern: 'In-place', companies: ['Microsoft', 'Google'], frequency: '🔥🔥', category: 'Matrix' },
    { id: 'mx-4', name: '01 Matrix', url: 'https://leetcode.com/problems/01-matrix', difficulty: 'Medium', pattern: 'BFS', companies: ['Google', 'Uber', 'Intuit'], frequency: '🔥🔥', category: 'Matrix' },
    { id: 'mx-5', name: 'Game of Life', url: 'https://leetcode.com/problems/game-of-life', difficulty: 'Medium', pattern: 'Simulation', companies: ['OpenAI'], frequency: '🔥', category: 'Matrix' },
    { id: 'mx-6', name: 'Toeplitz Matrix', url: 'https://leetcode.com/problems/toeplitz-matrix', difficulty: 'Easy', pattern: 'Matrix', companies: ['Meta'], frequency: '🔥', category: 'Matrix' },
    { id: 'mx-7', name: 'Diagonal Traverse', url: 'https://leetcode.com/problems/diagonal-traverse', difficulty: 'Medium', pattern: 'Matrix', companies: ['Meta'], frequency: '🔥', category: 'Matrix' },
    // ==================== Greedy ====================
    { id: 'gy-1', name: 'Candy', url: 'https://leetcode.com/problems/candy', difficulty: 'Hard', pattern: 'Greedy', companies: ['Google'], frequency: '🔥', category: 'Greedy' },
    { id: 'gy-2', name: 'Gas Station', url: 'https://leetcode.com/problems/gas-station', difficulty: 'Medium', pattern: 'Greedy', companies: ['Google'], frequency: '🔥', category: 'Greedy' },
    { id: 'gy-3', name: 'H-Index', url: 'https://leetcode.com/problems/h-index', difficulty: 'Medium', pattern: 'Sorting/Counting', companies: ['Google'], frequency: '🔥', category: 'Greedy' },
    // ==================== Math / Bit Manipulation ====================
    { id: 'mb-1', name: 'Pow(x, n)', url: 'https://leetcode.com/problems/powx-n', difficulty: 'Medium', pattern: 'Binary Exponentiation', companies: ['Meta', 'Google'], frequency: '🔥🔥', category: 'Math / Bit Manipulation' },
    { id: 'mb-2', name: 'Happy Number', url: 'https://leetcode.com/problems/happy-number', difficulty: 'Easy', pattern: "Floyd's Cycle", companies: ['Google'], frequency: '🔥', category: 'Math / Bit Manipulation' },
    { id: 'mb-3', name: 'Number of 1 Bits', url: 'https://leetcode.com/problems/number-of-1-bits', difficulty: 'Easy', pattern: 'Bit Manipulation', companies: ['Tesla', 'Google'], frequency: '🔥', category: 'Math / Bit Manipulation' },
    { id: 'mb-4', name: 'Reverse Bits', url: 'https://leetcode.com/problems/reverse-bits', difficulty: 'Easy', pattern: 'Bit Manipulation', companies: ['Tesla'], frequency: '🔥', category: 'Math / Bit Manipulation' },
    { id: 'mb-5', name: 'Single Number', url: 'https://leetcode.com/problems/single-number', difficulty: 'Easy', pattern: 'XOR', companies: ['Tesla'], frequency: '🔥', category: 'Math / Bit Manipulation' },
    { id: 'mb-6', name: 'Counting Bits', url: 'https://leetcode.com/problems/counting-bits', difficulty: 'Medium', pattern: 'Bit Manipulation', companies: ['Tesla'], frequency: '🔥', category: 'Math / Bit Manipulation' },
    { id: 'mb-7', name: 'Sum of Two Integers', url: 'https://leetcode.com/problems/sum-of-two-integers', difficulty: 'Medium', pattern: 'Bit Manipulation', companies: ['Tesla'], frequency: '🔥', category: 'Math / Bit Manipulation' },
    { id: 'mb-8', name: 'Missing Number', url: 'https://leetcode.com/problems/missing-number', difficulty: 'Easy', pattern: 'Math/XOR', companies: ['Microsoft'], frequency: '🔥', category: 'Math / Bit Manipulation' },
    // ==================== Divide and Conquer ====================
    { id: 'dc-1', name: 'Majority Element', url: 'https://leetcode.com/problems/majority-element', difficulty: 'Easy', pattern: 'Boyer-Moore', companies: ['Google'], frequency: '🔥', category: 'Divide and Conquer' },
    { id: 'dc-2', name: 'Longest Substring with At Least K Repeating Characters', url: 'https://leetcode.com/problems/longest-substring-with-at-least-k-repeating-characters', difficulty: 'Medium', pattern: 'Divide & Conquer', companies: ['Google'], frequency: '🔥', category: 'Divide and Conquer' },
    // ==================== Concurrency ====================
    { id: 'cc-1', name: 'Print in Order', url: 'https://leetcode.com/problems/print-in-order', difficulty: 'Easy', pattern: 'Concurrency', companies: ['Databricks'], frequency: '🔥', category: 'Concurrency' },
    { id: 'cc-2', name: 'Print FooBar Alternately', url: 'https://leetcode.com/problems/print-foobar-alternately', difficulty: 'Medium', pattern: 'Concurrency', companies: ['Databricks'], frequency: '🔥', category: 'Concurrency' },
    { id: 'cc-3', name: 'Building H2O', url: 'https://leetcode.com/problems/building-h2o', difficulty: 'Medium', pattern: 'Concurrency', companies: ['Databricks'], frequency: '🔥', category: 'Concurrency' },
    { id: 'cc-4', name: 'The Dining Philosophers', url: 'https://leetcode.com/problems/the-dining-philosophers', difficulty: 'Medium', pattern: 'Concurrency', companies: ['Databricks'], frequency: '🔥', category: 'Concurrency' },
    { id: 'cc-5', name: 'Fizz Buzz Multithreaded', url: 'https://leetcode.com/problems/fizz-buzz-multithreaded', difficulty: 'Medium', pattern: 'Concurrency', companies: ['Databricks'], frequency: '🔥', category: 'Concurrency' },
    // ==================== Custom Problems ====================
    { id: 'cu-1', name: 'KV Store Serialize/Deserialize', url: '#', difficulty: 'Hard', pattern: 'Design / Strings', companies: ['OpenAI'], frequency: '🔥🔥', category: 'Custom Problems', description: 'Multi-part: serialization, file persistence, multithreading, versioned store' },
    { id: 'cu-2', name: 'CD Directory Navigation', url: '#', difficulty: 'Hard', pattern: 'String / Path Resolution', companies: ['OpenAI'], frequency: '🔥🔥', category: 'Custom Problems', description: 'Implement cd() with relative/absolute paths, .., ., ~, symlink cycle detection' },
    { id: 'cu-3', name: 'Excel/Spreadsheet Engine', url: '#', difficulty: 'Hard', pattern: 'Graph / Design', companies: ['OpenAI'], frequency: '🔥🔥', category: 'Custom Problems', description: 'Cell get/set with formula dependencies, circular dependency detection' },
    { id: 'cu-4', name: 'In-Memory Database', url: '#', difficulty: 'Hard', pattern: 'Database Design', companies: ['OpenAI', 'Anthropic'], frequency: '🔥🔥', category: 'Custom Problems', description: 'SET/GET/DELETE → filtered scans → TTL → backup/restore' },
    { id: 'cu-5', name: 'Resumable Iterator', url: '#', difficulty: 'Hard', pattern: 'Iterator / State', companies: ['OpenAI'], frequency: '🔥🔥', category: 'Custom Problems', description: 'Stateful iterator with getState()/setState(), nested structures, async' },
    { id: 'cu-6', name: 'Web Crawler', url: '#', difficulty: 'Hard', pattern: 'BFS / Concurrency', companies: ['Anthropic'], frequency: '🔥🔥', category: 'Custom Problems', description: 'BFS crawl → multithreaded/async optimization' },
    { id: 'cu-7', name: 'LRU Cache (Bugfix + Extend)', url: '#', difficulty: 'Hard', pattern: 'Design / Debugging', companies: ['Anthropic'], frequency: '🔥🔥', category: 'Custom Problems', description: 'Fix bugs in given code, add persistence, handle *args/**kwargs' },
    { id: 'cu-8', name: 'Stack Trace / Profiler', url: '#', difficulty: 'Hard', pattern: 'Parsing / Design', companies: ['Anthropic'], frequency: '🔥🔥', category: 'Custom Problems', description: 'Convert sampling profiler data to chronological events' },
    { id: 'cu-9', name: 'Tokenization Engine', url: '#', difficulty: 'Hard', pattern: 'String / NLP', companies: ['Anthropic'], frequency: '🔥🔥', category: 'Custom Problems', description: 'Code review, tokenize/detokenize with vocabulary coverage' },
    { id: 'cu-10', name: 'Distributed Mode/Median', url: '#', difficulty: 'Hard', pattern: 'Distributed Systems', companies: ['Anthropic'], frequency: '🔥🔥', category: 'Custom Problems', description: 'Compute statistics across 10 nodes with bandwidth constraints' },
    { id: 'cu-11', name: 'File System Size Analysis', url: '#', difficulty: 'Medium', pattern: 'Tree / Design', companies: ['Google'], frequency: '🔥🔥', category: 'Custom Problems', description: 'Calculate sizes of files/folders, find largest files' },
    { id: 'cu-12', name: 'Remove Duplicate Messages', url: '#', difficulty: 'Medium', pattern: 'Hash Map + Time', companies: ['Google'], frequency: '🔥🔥', category: 'Custom Problems', description: 'Remove duplicate messages within 10-second window' },
    { id: 'cu-13', name: 'Remove Bad Pairs from String', url: '#', difficulty: 'Medium', pattern: 'Stack', companies: ['Google'], frequency: '🔥🔥', category: 'Custom Problems', description: 'Remove adjacent chars with same letter in different cases (e.g., xX, Aa)' },
    { id: 'cu-14', name: 'Interns and Flats Assignment', url: '#', difficulty: 'Medium', pattern: 'Greedy / Sorting', companies: ['Google'], frequency: '🔥🔥', category: 'Custom Problems', description: 'Assign interns to flats minimizing distance or maximizing satisfaction' },
    { id: 'cu-15', name: 'Song Shuffler', url: '#', difficulty: 'Easy', pattern: 'Fisher-Yates', companies: ['Google'], frequency: '🔥', category: 'Custom Problems', description: 'Implement shuffle where every permutation is equally likely' },
    { id: 'cu-16', name: 'Async Node Counting', url: '#', difficulty: 'Hard', pattern: 'Distributed / Trees', companies: ['OpenAI'], frequency: '🔥🔥', category: 'Custom Problems', description: 'Count tree nodes using only async parent-child messaging' },
    { id: 'cu-17', name: 'Toy Language Interpreter', url: '#', difficulty: 'Hard', pattern: 'Parsing / Compilers', companies: ['OpenAI'], frequency: '🔥🔥', category: 'Custom Problems', description: '75-min round: lexer, parser, evaluator for variables, arithmetic, control flow' },
];
class DSATracker {
    constructor() {
        this.completedQuestions = new Set();
        this.filters = {
            search: '',
            category: '',
            difficulty: '',
            company: '',
            frequency: '',
            status: ''
        };
        this.sortBy = 'default';
        this.expandedSections = new Set();
        this.loadProgress();
        this.setupEventListeners();
        this.populateFilters();
        this.render();
    }
    loadProgress() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            this.completedQuestions = new Set(JSON.parse(saved));
        }
    }
    saveProgress() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...this.completedQuestions]));
    }
    toggleQuestion(id) {
        if (this.completedQuestions.has(id)) {
            this.completedQuestions.delete(id);
        }
        else {
            this.completedQuestions.add(id);
        }
        this.saveProgress();
        this.updateStats();
        this.updateQuestionRow(id);
    }
    updateQuestionRow(id) {
        const row = document.querySelector(`[data-id="${id}"]`);
        if (row) {
            const isCompleted = this.completedQuestions.has(id);
            const checkbox = row.querySelector('input[type="checkbox"]');
            if (checkbox)
                checkbox.checked = isCompleted;
            row.classList.toggle('bg-green-900/20', isCompleted);
            row.classList.toggle('border-green-800', isCompleted);
            row.classList.toggle('bg-gray-800/50', !isCompleted);
            row.classList.toggle('border-gray-700', !isCompleted);
        }
    }
    getFilteredQuestions() {
        let filtered = questions.filter(q => {
            if (this.filters.search && !q.name.toLowerCase().includes(this.filters.search.toLowerCase()) &&
                !q.pattern.toLowerCase().includes(this.filters.search.toLowerCase())) {
                return false;
            }
            if (this.filters.category && q.category !== this.filters.category)
                return false;
            if (this.filters.difficulty && q.difficulty !== this.filters.difficulty)
                return false;
            if (this.filters.company && !q.companies.includes(this.filters.company))
                return false;
            if (this.filters.frequency && q.frequency !== this.filters.frequency)
                return false;
            if (this.filters.status === 'completed' && !this.completedQuestions.has(q.id))
                return false;
            if (this.filters.status === 'pending' && this.completedQuestions.has(q.id))
                return false;
            return true;
        });
        if (this.sortBy === 'difficulty') {
            const order = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
            filtered.sort((a, b) => order[a.difficulty] - order[b.difficulty]);
        }
        else if (this.sortBy === 'frequency') {
            const order = { '🔥🔥🔥': 1, '🔥🔥': 2, '🔥': 3, '⚪': 4 };
            filtered.sort((a, b) => (order[a.frequency] || 5) - (order[b.frequency] || 5));
        }
        return filtered;
    }
    populateFilters() {
        const categories = [...new Set(questions.map(q => q.category))].sort();
        const companies = [...new Set(questions.flatMap((q) => q.companies))];
        companies.sort();
        const categorySelect = document.getElementById('categoryFilter');
        categories.forEach((cat) => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categorySelect.appendChild(option);
        });
        const companySelect = document.getElementById('companyFilter');
        companies.forEach((comp) => {
            const option = document.createElement('option');
            option.value = comp;
            option.textContent = comp;
            companySelect.appendChild(option);
        });
    }
    setupEventListeners() {
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.filters.search = e.target.value;
            this.render();
        });
        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            this.filters.category = e.target.value;
            this.render();
        });
        document.getElementById('difficultyFilter').addEventListener('change', (e) => {
            this.filters.difficulty = e.target.value;
            this.render();
        });
        document.getElementById('companyFilter').addEventListener('change', (e) => {
            this.filters.company = e.target.value;
            this.render();
        });
        document.getElementById('frequencyFilter').addEventListener('change', (e) => {
            this.filters.frequency = e.target.value;
            this.render();
        });
        document.getElementById('statusFilter').addEventListener('change', (e) => {
            this.filters.status = e.target.value;
            this.render();
        });
        document.getElementById('clearFilters').addEventListener('click', () => {
            this.filters = { search: '', category: '', difficulty: '', company: '', frequency: '', status: '' };
            document.getElementById('searchInput').value = '';
            document.getElementById('categoryFilter').value = '';
            document.getElementById('difficultyFilter').value = '';
            document.getElementById('companyFilter').value = '';
            document.getElementById('frequencyFilter').value = '';
            document.getElementById('statusFilter').value = '';
            this.render();
        });
        document.getElementById('sortByDifficulty').addEventListener('click', () => {
            this.sortBy = this.sortBy === 'difficulty' ? 'default' : 'difficulty';
            this.render();
        });
        document.getElementById('sortByFrequency').addEventListener('click', () => {
            this.sortBy = this.sortBy === 'frequency' ? 'default' : 'frequency';
            this.render();
        });
        document.getElementById('resetBtn').addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
                this.completedQuestions.clear();
                this.saveProgress();
                this.render();
            }
        });
    }
    updateStats() {
        const total = questions.length;
        const completed = this.completedQuestions.size;
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
        document.getElementById('completedCount').textContent = completed.toString();
        document.getElementById('totalCount').textContent = total.toString();
        document.getElementById('progressPercent').textContent = `${percent}%`;
        const ring = document.getElementById('progressRing');
        ring.setAttribute('stroke-dashoffset', (100 - percent).toString());
        const easy = questions.filter(q => q.difficulty === 'Easy');
        const medium = questions.filter(q => q.difficulty === 'Medium');
        const hard = questions.filter(q => q.difficulty === 'Hard');
        document.getElementById('easyCount').textContent = easy.length.toString();
        document.getElementById('mediumCount').textContent = medium.length.toString();
        document.getElementById('hardCount').textContent = hard.length.toString();
        document.getElementById('easyDone').textContent = easy.filter(q => this.completedQuestions.has(q.id)).length.toString();
        document.getElementById('mediumDone').textContent = medium.filter(q => this.completedQuestions.has(q.id)).length.toString();
        document.getElementById('hardDone').textContent = hard.filter(q => this.completedQuestions.has(q.id)).length.toString();
    }
    getDifficultyColor(difficulty) {
        switch (difficulty) {
            case 'Easy': return 'text-green-400 bg-green-400/10';
            case 'Medium': return 'text-yellow-400 bg-yellow-400/10';
            case 'Hard': return 'text-red-400 bg-red-400/10';
            default: return 'text-gray-400 bg-gray-400/10';
        }
    }
    getCategoryIcon(category) {
        return '';
    }
    toggleSection(category) {
        if (this.expandedSections.has(category)) {
            this.expandedSections.delete(category);
        }
        else {
            this.expandedSections.add(category);
        }
        this.render();
    }
    render() {
        const filtered = this.getFilteredQuestions();
        const container = document.getElementById('questionsList');
        const emptyState = document.getElementById('emptyState');
        if (filtered.length === 0) {
            container.innerHTML = '';
            emptyState.classList.remove('hidden');
        }
        else {
            emptyState.classList.add('hidden');
            // Group questions by category
            const grouped = {};
            filtered.forEach(q => {
                if (!grouped[q.category])
                    grouped[q.category] = [];
                grouped[q.category].push(q);
            });
            // Define category order
            const categoryOrder = [
                'Arrays & Strings', 'Two Pointers', 'Sliding Window', 'Prefix Sum',
                'Hash Map / Set', 'Stack', 'Monotonic Stack', 'Linked List', 'Binary Search',
                'Trees', 'Graphs', 'Heap / Priority Queue', 'Dynamic Programming',
                'Backtracking', 'Intervals', 'Trie', 'Design', 'Matrix', 'Greedy',
                'Math & Bit Manipulation', 'Divide & Conquer', 'Union-Find',
                'Topological Sort', 'Segment Tree', 'Custom Problems'
            ];
            const sortedCategories = Object.keys(grouped).sort((a, b) => {
                const aIndex = categoryOrder.indexOf(a);
                const bIndex = categoryOrder.indexOf(b);
                if (aIndex === -1 && bIndex === -1)
                    return a.localeCompare(b);
                if (aIndex === -1)
                    return 1;
                if (bIndex === -1)
                    return -1;
                return aIndex - bIndex;
            });
            container.innerHTML = sortedCategories.map(category => {
                const categoryQuestions = grouped[category];
                const completedInCategory = categoryQuestions.filter(q => this.completedQuestions.has(q.id)).length;
                const isExpanded = this.expandedSections.has(category);
                const icon = this.getCategoryIcon(category);
                return `
                    <div class="section-container mb-4 rounded-xl border border-gray-700 overflow-hidden bg-gray-800/30">
                        <button class="section-header w-full flex items-center justify-between p-4 hover:bg-gray-700/50 transition cursor-pointer"
                                data-category="${category}">
                            <div class="flex items-center gap-3">
                                <span class="text-xl">${icon}</span>
                                <span class="font-semibold text-white">${category}</span>
                                <span class="text-xs px-2 py-1 rounded-full ${completedInCategory === categoryQuestions.length ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}">
                                    ${completedInCategory}/${categoryQuestions.length}
                                </span>
                            </div>
                            <svg class="w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                            </svg>
                        </button>
                        <div class="section-content ${isExpanded ? '' : 'hidden'}">
                            <div class="p-2 space-y-1">
                                ${categoryQuestions.map(q => {
                    const isCompleted = this.completedQuestions.has(q.id);
                    return `
                                        <div class="question-row flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700/50 transition ${isCompleted ? 'bg-green-900/10' : ''}"
                                             data-id="${q.id}">
                                            <label class="flex items-center cursor-pointer">
                                                <input type="checkbox" class="w-4 h-4 rounded border-gray-600 bg-gray-700 text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
                                                    ${isCompleted ? 'checked' : ''} data-question-id="${q.id}">
                                            </label>
                                            <div class="flex-1 min-w-0">
                                                <div class="flex items-center gap-2 flex-wrap">
                                                    <a href="${q.url}" target="_blank" rel="noopener noreferrer"
                                                       class="text-sm text-gray-200 hover:text-primary transition ${isCompleted ? 'line-through text-gray-500' : ''}">
                                                        ${q.name}
                                                    </a>
                                                    <span class="px-1.5 py-0.5 text-xs font-medium rounded ${this.getDifficultyColor(q.difficulty)}">${q.difficulty}</span>
                                                    <span class="text-xs">${q.frequency}</span>
                                                </div>
                                            </div>
                                            <div class="hidden sm:flex items-center gap-1">
                                                ${q.companies.slice(0, 3).map(c => `<span class="px-1.5 py-0.5 text-xs bg-primary/10 text-primary/80 rounded">${c}</span>`).join('')}
                                                ${q.companies.length > 3 ? `<span class="text-xs text-gray-500">+${q.companies.length - 3}</span>` : ''}
                                            </div>
                                        </div>
                                    `;
                }).join('')}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
            // Add section toggle listeners
            container.querySelectorAll('.section-header').forEach(header => {
                header.addEventListener('click', (e) => {
                    const category = e.currentTarget.dataset.category;
                    this.toggleSection(category);
                });
            });
            // Add checkbox listeners
            container.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                checkbox.addEventListener('change', (e) => {
                    e.stopPropagation();
                    const id = e.target.dataset.questionId;
                    this.toggleQuestion(id);
                });
            });
        }
        document.getElementById('visibleCount').textContent = filtered.length.toString();
        this.updateStats();
    }
}
class PatternsModal {
    constructor() {
        this.modal = document.getElementById('patternsModal');
        this.patternsList = document.getElementById('patternsList');
        this.patternContent = document.getElementById('patternContent');
        this.searchInput = document.getElementById('patternSearch');
        this.selectedPattern = null;
        this.patterns = [];
        this.dataAdapter = typeof dataAdapter !== 'undefined' ? dataAdapter : null;
        this.setupEventListeners();
        this.init();
    }
    async init() {
        if (this.dataAdapter) {
            try {
                await this.dataAdapter.init();
                this.patterns = await this.dataAdapter.getPatterns();
            } catch (e) {
                console.warn('DataAdapter init failed, falling back to patternsData:', e);
                this.patterns = typeof patternsData !== 'undefined' ? patternsData : [];
            }
        } else {
            this.patterns = typeof patternsData !== 'undefined' ? patternsData : [];
        }
        this.renderPatternsList();
    }
    setupEventListeners() {
        document.getElementById('patternsBtn').addEventListener('click', () => this.open());
        document.getElementById('closePatterns').addEventListener('click', () => this.close());
        document.getElementById('patternsOverlay').addEventListener('click', () => this.close());
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.modal.classList.contains('hidden')) {
                this.close();
            }
        });
        this.searchInput.addEventListener('input', (e) => {
            this.renderPatternsList(e.target.value);
        });
    }
    open() {
        this.modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        if (!this.selectedPattern && this.patterns.length > 0) {
            this.selectPattern(this.patterns[0].id);
        }
    }
    close() {
        this.modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
    renderPatternsList(searchTerm = '') {
        if (!this.patterns || this.patterns.length === 0) {
            this.patternsList.innerHTML = '<p class="text-gray-500 text-sm">Patterns data not loaded</p>';
            return;
        }
        const filtered = this.patterns.filter(p =>
            p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.patternsList.innerHTML = filtered.map(pattern => `
            <button class="pattern-item w-full text-left px-3 py-2.5 rounded-lg transition flex items-center gap-3 ${this.selectedPattern === pattern.id ? 'bg-primary/20 text-primary' : 'text-gray-300 hover:bg-gray-800'}"
                    data-pattern-id="${pattern.id}">
                <span class="text-lg">${pattern.icon}</span>
                <div class="flex-1 min-w-0">
                    <div class="font-medium text-sm truncate">${pattern.category}</div>
                    <div class="text-xs text-gray-500">${pattern.difficulty}</div>
                </div>
            </button>
        `).join('');
        this.patternsList.querySelectorAll('.pattern-item').forEach(item => {
            item.addEventListener('click', () => {
                this.selectPattern(item.dataset.patternId);
            });
        });
    }
    selectPattern(patternId) {
        this.selectedPattern = patternId;
        this.currentLang = 'javascript';
        this.renderPatternsList(this.searchInput.value);
        const pattern = this.patterns.find(p => p.id === patternId);
        if (!pattern) return;

        const codeTemplates = pattern.codeTemplates || { javascript: pattern.template || '', java: '' };
        const commonMistakes = pattern.commonMistakes || [];

        this.patternContent.innerHTML = `
            <div class="animate-fade-in">
                <!-- Header -->
                <div class="flex items-start gap-4 mb-8">
                    <div class="text-5xl">${pattern.icon}</div>
                    <div class="flex-1">
                        <h1 class="text-3xl font-bold text-white mb-2">${pattern.category}</h1>
                        <p class="text-gray-400">${pattern.description}</p>
                        <div class="flex items-center gap-4 mt-4">
                            <span class="px-3 py-1 text-sm bg-primary/20 text-primary rounded-full">
                                Difficulty: ${pattern.difficulty}
                            </span>
                            <span class="text-sm text-gray-500">
                                Time: ${pattern.timeComplexity} | Space: ${pattern.spaceComplexity}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- When to Use -->
                <div class="mb-8">
                    <h2 class="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        When to Use This Pattern
                    </h2>
                    <ul class="space-y-2">
                        ${pattern.whenToUse.map(item => `
                            <li class="flex items-start gap-2 text-gray-300">
                                <span class="text-green-400 mt-0.5">✓</span>
                                <span>${item}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>

                <!-- Code Template with Language Toggle -->
                <div class="mb-8">
                    <div class="flex items-center justify-between mb-4">
                        <h2 class="text-xl font-semibold text-white flex items-center gap-2">
                            <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                            </svg>
                            Code Template
                        </h2>
                        <div class="flex bg-gray-800 rounded-lg p-1">
                            <button class="lang-btn px-3 py-1 text-sm rounded-md transition ${this.currentLang === 'javascript' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}" data-lang="javascript">JavaScript</button>
                            <button class="lang-btn px-3 py-1 text-sm rounded-md transition ${this.currentLang === 'java' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}" data-lang="java">Java</button>
                        </div>
                    </div>
                    <div class="relative">
                        <pre id="mainCodeBlock" class="bg-gray-900 rounded-xl p-4 overflow-x-auto border border-gray-800 max-h-96"><code class="text-sm text-gray-300 font-mono">${this.escapeHtml(codeTemplates.javascript)}</code></pre>
                        <button class="copy-btn absolute top-3 right-3 px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition">Copy</button>
                    </div>
                </div>

                <!-- Key Insights -->
                <div class="mb-8">
                    <h2 class="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <svg class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                        </svg>
                        Key Insights
                    </h2>
                    <div class="grid gap-3">
                        ${pattern.keyInsights.map((insight, i) => `
                            <div class="flex items-start gap-3 bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                                <span class="flex-shrink-0 w-6 h-6 bg-yellow-400/20 text-yellow-400 text-sm font-medium rounded-full flex items-center justify-center">${i + 1}</span>
                                <p class="text-gray-300">${insight}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>

                ${commonMistakes.length > 0 ? `
                <!-- Common Mistakes -->
                <div class="mb-8">
                    <h2 class="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                        </svg>
                        Common Mistakes to Avoid
                    </h2>
                    <div class="bg-red-900/10 border border-red-900/30 rounded-xl p-4">
                        <ul class="space-y-2">
                            ${commonMistakes.map(mistake => `
                                <li class="flex items-start gap-2 text-gray-300">
                                    <span class="text-red-400 mt-0.5">✗</span>
                                    <span>${mistake}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
                ` : ''}

                <!-- Pattern Variations (Expandable) -->
                <div class="mb-8">
                    <h2 class="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                        </svg>
                        Pattern Variations
                    </h2>
                    <div class="space-y-3" id="variationsContainer">
                        ${pattern.variations.map((v, idx) => `
                            <div class="variation-card bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
                                <button class="variation-header w-full p-4 text-left flex items-center justify-between hover:bg-gray-800/50 transition" data-idx="${idx}">
                                    <div>
                                        <h3 class="font-semibold text-white">${v.name}</h3>
                                        <p class="text-sm text-gray-400 mt-1">${v.desc}</p>
                                        ${v.when ? `<p class="text-xs text-primary mt-2">When: ${v.when}</p>` : ''}
                                    </div>
                                    <svg class="variation-chevron w-5 h-5 text-gray-500 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                                    </svg>
                                </button>
                                <div class="variation-content hidden border-t border-gray-800">
                                    ${v.template ? `
                                    <div class="p-4">
                                        <div class="flex justify-end mb-2">
                                            <div class="flex bg-gray-800 rounded-lg p-1">
                                                <button class="var-lang-btn px-2 py-0.5 text-xs rounded transition bg-primary text-white" data-idx="${idx}" data-lang="javascript">JS</button>
                                                <button class="var-lang-btn px-2 py-0.5 text-xs rounded transition text-gray-400" data-idx="${idx}" data-lang="java">Java</button>
                                            </div>
                                        </div>
                                        <pre class="bg-gray-950 rounded-lg p-3 overflow-x-auto text-xs" id="varCode-${idx}"><code class="text-gray-300 font-mono">${this.escapeHtml(v.template.javascript || '')}</code></pre>
                                    </div>
                                    ` : ''}
                                    ${v.problems ? `
                                    <div class="px-4 pb-4">
                                        <p class="text-xs text-gray-500 mb-2">Practice:</p>
                                        <div class="flex flex-wrap gap-1">
                                            ${v.problems.map(p => `
                                                <a href="https://leetcode.com/problems/${this.toSlug(p)}/" target="_blank" class="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 rounded transition">${p}</a>
                                            `).join('')}
                                        </div>
                                    </div>
                                    ` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Common Problems -->
                <div class="mb-8">
                    <h2 class="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                        </svg>
                        Must-Practice Problems
                    </h2>
                    <div class="flex flex-wrap gap-2">
                        ${pattern.commonProblems.map(problem => `
                            <a href="https://leetcode.com/problems/${this.toSlug(problem)}/" target="_blank" rel="noopener noreferrer"
                               class="px-3 py-1.5 bg-gray-800 hover:bg-primary/20 hover:text-primary text-gray-300 rounded-lg text-sm transition flex items-center gap-1 border border-gray-700 hover:border-primary/50">
                                ${problem}
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                                </svg>
                            </a>
                        `).join('')}
                    </div>
                </div>

                <!-- Complexity -->
                <div class="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 border border-primary/20">
                    <h2 class="text-lg font-semibold text-white mb-4">Complexity Analysis</h2>
                    <div class="grid sm:grid-cols-2 gap-4">
                        <div>
                            <div class="text-sm text-gray-400 mb-1">Time Complexity</div>
                            <div class="text-xl font-mono text-primary">${pattern.timeComplexity}</div>
                        </div>
                        <div>
                            <div class="text-sm text-gray-400 mb-1">Space Complexity</div>
                            <div class="text-xl font-mono text-secondary">${pattern.spaceComplexity}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Event listeners for language toggle
        this.patternContent.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.dataset.lang;
                this.currentLang = lang;
                const codeBlock = document.getElementById('mainCodeBlock');
                codeBlock.querySelector('code').textContent = codeTemplates[lang] || '';
                this.patternContent.querySelectorAll('.lang-btn').forEach(b => {
                    b.classList.toggle('bg-primary', b.dataset.lang === lang);
                    b.classList.toggle('text-white', b.dataset.lang === lang);
                    b.classList.toggle('text-gray-400', b.dataset.lang !== lang);
                });
            });
        });

        // Copy button for main code
        this.patternContent.querySelector('.copy-btn').addEventListener('click', (e) => {
            const code = document.getElementById('mainCodeBlock').querySelector('code').textContent;
            navigator.clipboard.writeText(code).then(() => {
                e.target.textContent = 'Copied!';
                setTimeout(() => { e.target.textContent = 'Copy'; }, 2000);
            });
        });

        // Variation expand/collapse
        this.patternContent.querySelectorAll('.variation-header').forEach(header => {
            header.addEventListener('click', () => {
                const card = header.closest('.variation-card');
                const content = card.querySelector('.variation-content');
                const chevron = card.querySelector('.variation-chevron');
                content.classList.toggle('hidden');
                chevron.classList.toggle('rotate-180');
            });
        });

        // Variation language toggle
        this.patternContent.querySelectorAll('.var-lang-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = btn.dataset.idx;
                const lang = btn.dataset.lang;
                const variation = pattern.variations[idx];
                if (variation.template) {
                    const codeEl = document.getElementById(`varCode-${idx}`);
                    codeEl.querySelector('code').textContent = variation.template[lang] || '';
                    btn.parentElement.querySelectorAll('.var-lang-btn').forEach(b => {
                        b.classList.toggle('bg-primary', b.dataset.lang === lang);
                        b.classList.toggle('text-white', b.dataset.lang === lang);
                        b.classList.toggle('text-gray-400', b.dataset.lang !== lang);
                    });
                }
            });
        });
    }
    escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    escapeAttr(str) {
        return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }
    toSlug(name) {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DSATracker();
    new PatternsModal();
});
