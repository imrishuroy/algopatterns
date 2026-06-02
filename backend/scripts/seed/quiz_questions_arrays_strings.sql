-- Quiz Questions for Arrays & Strings Pattern
-- Run: psql "postgresql://..." -f scripts/seed/quiz_questions_arrays_strings.sql

-- Clear existing arrays-strings questions first
DELETE FROM quiz_questions WHERE pattern_id = 'arrays-strings';

-- Section: Arrays & Strings Fundamentals
INSERT INTO quiz_questions (pattern_id, section_slug, question_type, difficulty, question_text, code_snippet, options, correct_answer, explanation, display_order) VALUES
('arrays-strings', NULL, 'multiple-choice', 'easy',
 'What is the time complexity of accessing an element by index in an array?',
 NULL,
 '["O(1)", "O(n)", "O(log n)", "O(n²)"]',
 '0',
 'Arrays provide direct access by index in constant time O(1) - this is their main advantage.',
 1),

('arrays-strings', NULL, 'multiple-choice', 'easy',
 'What is the time complexity of inserting an element at the beginning of an array?',
 NULL,
 '["O(1)", "O(n)", "O(log n)", "O(n²)"]',
 '1',
 'Inserting at the beginning requires shifting all existing elements right - O(n) time.',
 2),

('arrays-strings', NULL, 'true-false', 'easy',
 'Strings in JavaScript and Java are immutable.',
 NULL,
 NULL,
 'true',
 'Strings are immutable in both languages. Any "modification" creates a new string object.',
 3),

('arrays-strings', NULL, 'multiple-choice', 'easy',
 'What is the best data structure for O(1) average-case lookup by value?',
 NULL,
 '["Array", "Linked List", "Hash Map/Set", "Binary Tree"]',
 '2',
 'Hash Map/Set provides O(1) average lookup using hash function to compute index.',
 4),

('arrays-strings', NULL, 'code-output', 'easy',
 'What does this code return for nums = [2, 7, 11, 15] and target = 9?',
 'function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}',
 '["[0, 1]", "[1, 0]", "[0, 2]", "[]"]',
 '0',
 'nums[0]=2, complement=7. nums[1]=7, complement=2 exists in map at index 0. Return [0, 1].',
 5),

-- Hash Map Questions
('arrays-strings', NULL, 'multiple-choice', 'medium',
 'In Two Sum, why use a hash map instead of nested loops?',
 NULL,
 '["Uses less memory", "Reduces O(n²) to O(n) time", "Handles duplicates better", "Required for the problem"]',
 '1',
 'Hash map allows O(1) complement lookup, reducing O(n²) brute force to O(n) single pass.',
 6),

('arrays-strings', NULL, 'code-output', 'medium',
 'How do we check if two strings are anagrams using a hash map approach?',
 '// "anagram" and "nagaram"
// Count frequency of each character',
 '["Sort both and compare", "Count char frequencies, compare counts", "Both A and B work", "Neither works"]',
 '2',
 'Both work: sorting is O(n log n), frequency counting is O(n). Hash map approach is faster.',
 7),

('arrays-strings', NULL, 'multiple-choice', 'medium',
 'For Group Anagrams, what makes a good hash key?',
 NULL,
 '["The original string", "Sorted version of the string", "String length", "First character"]',
 '1',
 'Anagrams have the same sorted form. "eat", "tea", "ate" all become "aet" - use as key to group.',
 8),

('arrays-strings', NULL, 'code-output', 'medium',
 'What is the output for groupAnagrams(["eat","tea","tan","ate","nat","bat"])?',
 NULL,
 '["3 groups", "4 groups", "5 groups", "6 groups"]',
 '0',
 'Groups: ["eat","tea","ate"], ["tan","nat"], ["bat"]. Three groups based on sorted key.',
 9),

('arrays-strings', NULL, 'identify-bug', 'medium',
 'What is wrong with this Two Sum code?',
 'function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    map.set(nums[i], i);  // Store first
  }
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [i, map.get(complement)];
    }
  }
}',
 '["Might return same index twice for nums[i] + nums[i] = target", "Should use object not Map", "Loop direction is wrong", "Nothing is wrong"]',
 '0',
 'If target = 6 and nums has a single 3, this returns [i, i]. Need: map.get(complement) !== i check.',
 10),

-- Prefix/Suffix Questions
('arrays-strings', NULL, 'multiple-choice', 'medium',
 'What is the key idea in "Product of Array Except Self" without division?',
 NULL,
 '["Sort the array first", "Use prefix products and suffix products", "Use recursion", "Use nested loops"]',
 '1',
 'result[i] = product of all elements before i × product of all elements after i. Two passes.',
 11),

('arrays-strings', NULL, 'code-output', 'medium',
 'For nums = [1, 2, 3, 4], what are the prefix products?',
 '// prefix[i] = product of nums[0] to nums[i-1]
// prefix[0] = 1 (empty product)',
 '["[1, 1, 2, 6]", "[1, 2, 6, 24]", "[1, 1, 1, 1]", "[24, 12, 4, 1]"]',
 '0',
 'prefix[0]=1, prefix[1]=1, prefix[2]=1*2=2, prefix[3]=1*2*3=6. Result: [1, 1, 2, 6].',
 12),

('arrays-strings', NULL, 'code-output', 'medium',
 'For nums = [1, 2, 3, 4], what is the final result of Product Except Self?',
 '// prefix = [1, 1, 2, 6]
// suffix products: 24, 12, 4, 1 (from right)
// result[i] = prefix[i] * suffix[i]',
 '["[24, 12, 8, 6]", "[1, 2, 3, 4]", "[24, 12, 4, 1]", "[6, 8, 12, 24]"]',
 '0',
 'result = [1*24, 1*12, 2*4, 6*1] = [24, 12, 8, 6].',
 13),

-- Kadane''s Algorithm
('arrays-strings', NULL, 'multiple-choice', 'medium',
 'What problem does Kadane''s Algorithm solve?',
 NULL,
 '["Two Sum", "Maximum Subarray Sum", "Group Anagrams", "Product Except Self"]',
 '1',
 'Kadane''s finds the contiguous subarray with the maximum sum in O(n) time.',
 14),

('arrays-strings', NULL, 'code-output', 'medium',
 'For nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4], what is the maximum subarray sum?',
 '// Kadane: at each position, decide to extend or start fresh
// Max subarray is [4, -1, 2, 1] = 6',
 '["4", "5", "6", "7"]',
 '2',
 'Maximum contiguous sum is [4, -1, 2, 1] = 6.',
 15),

('arrays-strings', NULL, 'multiple-choice', 'medium',
 'In Kadane''s Algorithm, when do we start a new subarray?',
 NULL,
 '["When current element is negative", "When current sum becomes negative", "When current element > current sum + current element", "At every index"]',
 '2',
 'currentSum = max(nums[i], currentSum + nums[i]). Start fresh when element alone > extending.',
 16),

('arrays-strings', NULL, 'identify-bug', 'medium',
 'What is wrong with this Kadane''s implementation?',
 'function maxSubArray(nums) {
  let maxSum = 0;  // Bug here
  let currentSum = 0;
  for (let num of nums) {
    currentSum = Math.max(num, currentSum + num);
    maxSum = Math.max(maxSum, currentSum);
  }
  return maxSum;
}',
 '["maxSum should start at nums[0], not 0", "currentSum should start at nums[0]", "Both A and B", "Nothing is wrong"]',
 '0',
 'If all elements are negative, maxSum=0 is wrong. Initialize maxSum = nums[0] (or -Infinity).',
 17),

-- Cyclic Sort / Index as Hash
('arrays-strings', NULL, 'multiple-choice', 'hard',
 'What is the key insight in "First Missing Positive" with O(1) space?',
 NULL,
 '["Sort the array first", "Use the array indices as implicit hash - place number n at index n-1", "Use bit manipulation", "Cannot be done in O(1) space"]',
 '1',
 'For numbers in range [1, n], place each at its "home" index. Then scan for first mismatch.',
 18),

('arrays-strings', NULL, 'code-output', 'hard',
 'For nums = [3, 4, -1, 1], what is the first missing positive?',
 '// After cyclic sort: [1, -1, 3, 4]
// Index 0: 1 ✓, Index 1: -1 ✗ (should be 2)',
 '["1", "2", "3", "5"]',
 '1',
 'After placing valid numbers at their indices: [1, -1, 3, 4]. Index 1 should have 2. Answer: 2.',
 19),

('arrays-strings', NULL, 'multiple-choice', 'hard',
 'In cyclic sort for "Find All Duplicates", why use while instead of if?',
 NULL,
 '["Performance optimization", "The swapped value might also need to be placed correctly", "To handle negative numbers", "While is more readable"]',
 '1',
 'After swapping, the new value at current index might also be out of place. Keep swapping until correct.',
 20),

-- Subarray Count Problems
('arrays-strings', NULL, 'multiple-choice', 'hard',
 'For "Subarray Sum Equals K", what do we store in the hash map?',
 NULL,
 '["Array elements", "Prefix sum frequencies", "Subarray lengths", "Index pairs"]',
 '1',
 'Store count of each prefix sum. If (currentSum - k) exists, those occurrences mark valid subarray starts.',
 21),

('arrays-strings', NULL, 'code-output', 'hard',
 'For nums = [1, 1, 1] and k = 2, how many subarrays sum to k?',
 '// Subarrays: [1,1] at (0,1), [1,1] at (1,2)
// prefixSum: 0 -> 1 -> 2 -> 3
// When sum=2: sum-k=0 exists (count=1)
// When sum=3: sum-k=1 exists (count=1)',
 '["1", "2", "3", "4"]',
 '1',
 'Two subarrays: [1,1] starting at index 0, and [1,1] starting at index 1.',
 22),

('arrays-strings', NULL, 'multiple-choice', 'hard',
 'Why initialize the prefix sum map with {0: 1} in subarray sum problems?',
 NULL,
 '["Performance optimization", "To handle subarrays starting from index 0", "To avoid null checks", "It is not necessary"]',
 '1',
 'Prefix sum of 0 (empty prefix) means the subarray from index 0 to current position. Count it as 1 occurrence.',
 23),

-- String Manipulation
('arrays-strings', NULL, 'multiple-choice', 'medium',
 'What is the time complexity of string concatenation in a loop with n iterations?',
 NULL,
 '["O(n)", "O(n²)", "O(log n)", "O(1)"]',
 '1',
 'Strings are immutable. Each concatenation creates a new string, copying all previous characters. Total: O(n²).',
 24),

('arrays-strings', NULL, 'multiple-choice', 'medium',
 'How to avoid O(n²) string concatenation in a loop?',
 NULL,
 '["Use shorter strings", "Use StringBuilder (Java) or array.join() (JS)", "Concatenate fewer times", "Not possible to avoid"]',
 '1',
 'StringBuilder/StringBuffer (Java) or building an array and joining (JS) achieves O(n).',
 25),

('arrays-strings', NULL, 'code-output', 'medium',
 'What is the output of "hello".split("").reverse().join("")?',
 NULL,
 '["hello", "olleh", "hloel", "Error"]',
 '1',
 'split("") → ["h","e","l","l","o"], reverse() → ["o","l","l","e","h"], join("") → "olleh".',
 26),

-- Edge Cases
('arrays-strings', NULL, 'multiple-choice', 'easy',
 'What should you check first when working with arrays?',
 NULL,
 '["If it is sorted", "If it has duplicates", "If it is empty or has one element", "If elements are positive"]',
 '2',
 'Empty array or single element are common edge cases that can cause index errors or wrong results.',
 27),

('arrays-strings', NULL, 'identify-bug', 'medium',
 'What is wrong with this Contains Duplicate code?',
 'function containsDuplicate(nums) {
  const set = new Set();
  for (let num of nums) {
    set.add(num);
  }
  return set.size < nums.length;  // Check at end
}',
 '["Should check set.has(num) before adding for early return", "Set usage is wrong", "Comparison should be ===", "Nothing is wrong - both work"]',
 '3',
 'Both approaches work. Checking has() before add() can return early, but end comparison is also correct.',
 28),

('arrays-strings', NULL, 'true-false', 'medium',
 'Integer overflow should be considered when computing array element products.',
 NULL,
 NULL,
 'true',
 'Product of large numbers can overflow. Use long/BigInt or check bounds before multiplication.',
 29),

('arrays-strings', NULL, 'multiple-choice', 'medium',
 'For in-place array modification, what technique is commonly used?',
 NULL,
 '["Create a copy first", "Two pointers - read pointer and write pointer", "Recursion", "Always use extra array"]',
 '1',
 'Read pointer scans elements, write pointer marks where to place valid elements. O(1) space.',
 30);
