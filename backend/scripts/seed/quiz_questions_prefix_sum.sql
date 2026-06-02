-- Quiz Questions for Prefix Sum Pattern
-- Run: psql "postgresql://..." -f scripts/seed/quiz_questions_prefix_sum.sql

-- Clear existing prefix-sum questions first
DELETE FROM quiz_questions WHERE pattern_id = 'prefix-sum';

-- Section: Prefix Sum Fundamentals
INSERT INTO quiz_questions (pattern_id, section_slug, question_type, difficulty, question_text, code_snippet, options, correct_answer, explanation, display_order) VALUES
('prefix-sum', NULL, 'multiple-choice', 'easy',
 'What is the main purpose of a prefix sum array?',
 NULL,
 '["Sort the array", "Answer range sum queries in O(1) time", "Find the maximum element", "Reverse the array"]',
 '1',
 'Prefix sums precompute cumulative sums so that any range sum can be calculated in constant time.',
 1),

('prefix-sum', NULL, 'multiple-choice', 'easy',
 'For prefix array where prefix[i] = sum of arr[0..i-1], what is the sum of arr[2..5]?',
 NULL,
 '["prefix[5] - prefix[2]", "prefix[6] - prefix[2]", "prefix[5] - prefix[1]", "prefix[6] - prefix[1]"]',
 '1',
 'Sum of arr[i..j] = prefix[j+1] - prefix[i]. For arr[2..5]: prefix[6] - prefix[2].',
 2),

('prefix-sum', NULL, 'code-output', 'easy',
 'For arr = [1, 2, 3, 4, 5], what is the prefix sum array?',
 '// prefix[0] = 0 (empty sum)
// prefix[1] = arr[0] = 1
// prefix[2] = arr[0] + arr[1] = 3
// etc.',
 '["[1, 3, 6, 10, 15]", "[0, 1, 3, 6, 10, 15]", "[0, 1, 2, 3, 4, 5]", "[1, 2, 3, 4, 5]"]',
 '1',
 'prefix = [0, 1, 3, 6, 10, 15]. We prepend 0 for easier range calculations.',
 3),

('prefix-sum', NULL, 'true-false', 'easy',
 'The time complexity to build a prefix sum array is O(n).',
 NULL,
 NULL,
 'true',
 'We iterate through the array once, computing each prefix sum in O(1). Total: O(n).',
 4),

('prefix-sum', NULL, 'code-output', 'easy',
 'Using prefix = [0, 1, 3, 6, 10, 15], what is the sum of arr[1..3]?',
 '// arr = [1, 2, 3, 4, 5]
// sum of arr[1..3] = arr[1] + arr[2] + arr[3] = 2 + 3 + 4 = 9
// Using prefix: prefix[4] - prefix[1]',
 '["6", "9", "10", "15"]',
 '1',
 'prefix[4] - prefix[1] = 10 - 1 = 9. This equals arr[1] + arr[2] + arr[3] = 2 + 3 + 4.',
 5),

-- Range Sum Queries
('prefix-sum', NULL, 'multiple-choice', 'medium',
 'Why do we often start the prefix array with 0?',
 NULL,
 '["It is required by the algorithm", "Makes range sum formula simpler: prefix[j+1] - prefix[i]", "Saves memory", "It is just a convention"]',
 '1',
 'prefix[0] = 0 means prefix[i] = sum of first i elements. Range [i,j] = prefix[j+1] - prefix[i] works cleanly.',
 6),

('prefix-sum', NULL, 'code-output', 'medium',
 'For arr = [3, -1, 4, 1, -5, 9], what is prefix[4]?',
 '// prefix[0] = 0
// prefix[1] = 3
// prefix[2] = 3 + (-1) = 2
// prefix[3] = 2 + 4 = 6
// prefix[4] = 6 + 1 = 7',
 '["6", "7", "8", "3"]',
 '1',
 'prefix[4] = sum of first 4 elements = 3 + (-1) + 4 + 1 = 7.',
 7),

('prefix-sum', NULL, 'multiple-choice', 'medium',
 'How many range sum queries can be answered after O(n) preprocessing?',
 NULL,
 '["Only n queries", "O(n²) queries", "Unlimited queries, each in O(1)", "One query only"]',
 '2',
 'After building prefix array in O(n), any number of range queries can be answered in O(1) each.',
 8),

-- Subarray Sum Equals K
('prefix-sum', NULL, 'multiple-choice', 'medium',
 'In "Subarray Sum Equals K", what do we store in the HashMap?',
 NULL,
 '["Array elements and indices", "Prefix sum values and their frequencies", "Subarray lengths", "Target values"]',
 '1',
 'Store how many times each prefix sum has occurred. If (currentSum - k) exists, those are valid subarray starts.',
 9),

('prefix-sum', NULL, 'code-output', 'medium',
 'For nums = [1, 1, 1] and k = 2, how many subarrays sum to k?',
 '// Prefix sums: 0, 1, 2, 3
// At sum=2: sum-k=0 exists (count=1) -> 1 subarray
// At sum=3: sum-k=1 exists (count=1) -> 1 subarray
// Total: 2',
 '["1", "2", "3", "4"]',
 '1',
 'Two subarrays: [1,1] at indices (0,1) and [1,1] at indices (1,2).',
 10),

('prefix-sum', NULL, 'multiple-choice', 'medium',
 'Why do we initialize the HashMap with {0: 1} in subarray sum problems?',
 NULL,
 '["Performance optimization", "To count subarrays that start from index 0", "Required by JavaScript", "To handle empty arrays"]',
 '1',
 'If currentSum === k, then currentSum - k = 0. Without {0:1}, we miss subarrays starting at index 0.',
 11),

('prefix-sum', NULL, 'identify-bug', 'medium',
 'What is wrong with this Subarray Sum Equals K code?',
 'function subarraySum(nums, k) {
  const prefixCount = new Map();  // Bug: missing {0: 1}
  let sum = 0, count = 0;
  for (let num of nums) {
    sum += num;
    count += prefixCount.get(sum - k) || 0;
    prefixCount.set(sum, (prefixCount.get(sum) || 0) + 1);
  }
  return count;
}',
 '["Missing prefixCount.set(0, 1) initialization", "Loop condition is wrong", "count += should be count =", "sum calculation is wrong"]',
 '0',
 'Without {0: 1}, subarrays starting from index 0 with sum === k are not counted.',
 12),

('prefix-sum', NULL, 'code-output', 'hard',
 'For nums = [1, 2, 3] and k = 3, how many subarrays sum to 3?',
 '// Subarrays: [1,2]=3, [3]=3
// Prefix: 0->1->3->6
// At sum=3: sum-k=0 exists (count=1)
// At sum=6: sum-k=3 exists (count=1)',
 '["1", "2", "3", "4"]',
 '1',
 'Two subarrays: [1,2] and [3]. Both sum to 3.',
 13),

-- Contiguous Array (0s and 1s)
('prefix-sum', NULL, 'multiple-choice', 'medium',
 'In "Contiguous Array" (equal 0s and 1s), what transformation do we apply?',
 NULL,
 '["Replace 0s with -1s, then find subarray with sum 0", "Count 0s and 1s separately", "Sort the array first", "Use two pointers"]',
 '0',
 'Transform 0→-1. Equal 0s and 1s means sum = 0. Use prefix sum + HashMap to find longest such subarray.',
 14),

('prefix-sum', NULL, 'code-output', 'medium',
 'For arr = [0, 1, 0, 1], what is the longest contiguous subarray with equal 0s and 1s?',
 '// Transform: [-1, 1, -1, 1]
// Prefix sums: 0, -1, 0, -1, 0
// Sum 0 appears at indices 0, 2, 4
// Longest: index 0 to 4 (exclusive) = length 4',
 '["2", "3", "4", "1"]',
 '2',
 'The entire array [0,1,0,1] has 2 zeros and 2 ones. Length = 4.',
 15),

-- Product Except Self
('prefix-sum', NULL, 'multiple-choice', 'medium',
 'In "Product of Array Except Self" without division, what approach is used?',
 NULL,
 '["Single pass multiplication", "Prefix products from left AND suffix products from right", "Recursion", "Sorting first"]',
 '1',
 'result[i] = (product of all left elements) × (product of all right elements). Two passes.',
 16),

('prefix-sum', NULL, 'code-output', 'medium',
 'For nums = [1, 2, 3, 4], what are the left prefix products?',
 '// left[0] = 1 (no elements to left)
// left[1] = 1
// left[2] = 1 * 2 = 2
// left[3] = 1 * 2 * 3 = 6',
 '["[1, 1, 2, 6]", "[1, 2, 6, 24]", "[24, 12, 4, 1]", "[1, 1, 1, 1]"]',
 '0',
 'Left prefix products: [1, 1, 2, 6]. Each position contains product of all elements to its left.',
 17),

('prefix-sum', NULL, 'code-output', 'medium',
 'For nums = [1, 2, 3, 4], what is the final result of Product Except Self?',
 '// left = [1, 1, 2, 6]
// right products (from right): 24, 12, 4, 1
// result[i] = left[i] * right[i]',
 '["[24, 12, 8, 6]", "[1, 2, 3, 4]", "[24, 12, 4, 1]", "[6, 8, 12, 24]"]',
 '0',
 'result = [1×24, 1×12, 2×4, 6×1] = [24, 12, 8, 6].',
 18),

('prefix-sum', NULL, 'multiple-choice', 'hard',
 'How does Product Except Self achieve O(1) extra space?',
 NULL,
 '["It cannot achieve O(1) space", "Store left products in result array, compute right products in a variable", "Use bit manipulation", "Use recursion"]',
 '1',
 'First pass: store left products in result. Second pass: multiply by right products using a single variable.',
 19),

-- Find Pivot Index
('prefix-sum', NULL, 'multiple-choice', 'medium',
 'What is the pivot index in an array?',
 NULL,
 '["Middle index", "Index where left sum equals right sum", "Index of maximum element", "Index where element equals sum"]',
 '1',
 'Pivot index i: sum(arr[0..i-1]) === sum(arr[i+1..n-1]). Elements to left equal elements to right.',
 20),

('prefix-sum', NULL, 'code-output', 'medium',
 'For nums = [1, 7, 3, 6, 5, 6], what is the pivot index?',
 '// Total sum = 28
// At index 3 (value 6):
// Left sum = 1 + 7 + 3 = 11
// Right sum = 5 + 6 = 11',
 '["2", "3", "4", "5"]',
 '1',
 'At index 3: left sum = 11, right sum = 11. Pivot index = 3.',
 21),

('prefix-sum', NULL, 'multiple-choice', 'medium',
 'How to efficiently find pivot index using prefix sum?',
 NULL,
 '["Compare prefix sum to (total - prefix - current)", "Build two prefix arrays", "Sort first", "Use binary search"]',
 '0',
 'leftSum = prefix[i]. rightSum = total - prefix[i] - nums[i]. If equal, i is pivot.',
 22),

-- Continuous Subarray Sum (Divisible by K)
('prefix-sum', NULL, 'multiple-choice', 'hard',
 'In "Continuous Subarray Sum" divisible by k, what do we store in HashMap?',
 NULL,
 '["Prefix sums", "Prefix sum mod k and its first index", "Element frequencies", "Subarray lengths"]',
 '1',
 'Store (prefixSum % k) → first index. If same remainder seen again (at least 2 apart), subarray sum is divisible by k.',
 23),

('prefix-sum', NULL, 'code-output', 'hard',
 'For nums = [23, 2, 4, 6, 7] and k = 6, is there a subarray of length >= 2 divisible by 6?',
 '// Prefix sums: 0, 23, 25, 29, 35, 42
// Mod 6: 0, 5, 1, 5, 5, 0
// At index 5: mod=0, first occurrence was index 0
// Length = 5 - 0 = 5 >= 2 ✓',
 '["true", "false"]',
 '0',
 'Yes. [2,4] sums to 6, divisible by 6. Also entire array sums to 42, divisible by 6.',
 24),

('prefix-sum', NULL, 'multiple-choice', 'hard',
 'Why do we need to check "index difference >= 2" in Continuous Subarray Sum?',
 NULL,
 '["Performance optimization", "Problem requires subarray length at least 2", "To handle negative numbers", "To avoid division by zero"]',
 '1',
 'The problem specifically asks for subarrays with at least 2 elements, so we check index difference.',
 25),

-- 2D Prefix Sum
('prefix-sum', NULL, 'multiple-choice', 'hard',
 'In 2D prefix sum, what does prefix[i][j] represent?',
 NULL,
 '["Sum of row i", "Sum of column j", "Sum of submatrix from (0,0) to (i-1,j-1)", "Sum of diagonal"]',
 '2',
 'prefix[i][j] = sum of all elements in the rectangle from top-left (0,0) to (i-1,j-1).',
 26),

('prefix-sum', NULL, 'code-output', 'hard',
 'For matrix [[1,2],[3,4]], what is prefix[2][2]?',
 '// prefix[i][j] = sum of submatrix (0,0) to (i-1,j-1)
// prefix[2][2] = 1 + 2 + 3 + 4 = 10',
 '["4", "6", "7", "10"]',
 '3',
 'prefix[2][2] = sum of entire 2x2 matrix = 1 + 2 + 3 + 4 = 10.',
 27),

('prefix-sum', NULL, 'multiple-choice', 'hard',
 'To build 2D prefix sum, what is the formula for prefix[i][j]?',
 NULL,
 '["matrix[i-1][j-1] + prefix[i-1][j-1]", "matrix[i-1][j-1] + prefix[i-1][j] + prefix[i][j-1] - prefix[i-1][j-1]", "prefix[i-1][j] + prefix[i][j-1]", "matrix[i][j] only"]',
 '1',
 'Include current cell, add top and left prefixes, subtract overlap (top-left) to avoid double counting.',
 28),

('prefix-sum', NULL, 'identify-bug', 'medium',
 'What is wrong with this prefix sum builder?',
 'function buildPrefix(arr) {
  const prefix = [];
  for (let i = 0; i < arr.length; i++) {
    prefix[i] = prefix[i-1] + arr[i];  // Bug here
  }
  return prefix;
}',
 '["prefix[i-1] is undefined when i=0", "Should use push instead", "Loop should go backwards", "arr[i] should be arr[i-1]"]',
 '0',
 'When i=0, prefix[-1] is undefined. Initialize prefix[0] = arr[0] or use prefix = [0] and adjust indexing.',
 29),

('prefix-sum', NULL, 'multiple-choice', 'medium',
 'When is prefix sum NOT the right approach?',
 NULL,
 '["Multiple range sum queries", "Array is frequently updated between queries", "Finding subarray with target sum", "Computing running totals"]',
 '1',
 'If array changes frequently, prefix sums must be rebuilt. Use Segment Tree or Fenwick Tree for dynamic updates.',
 30);
