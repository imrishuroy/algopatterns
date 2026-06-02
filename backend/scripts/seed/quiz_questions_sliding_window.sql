-- Quiz Questions for Sliding Window Pattern
-- Run: psql "postgresql://..." -f scripts/seed/quiz_questions_sliding_window.sql

-- Clear existing sliding-window questions first
DELETE FROM quiz_questions WHERE pattern_id = 'sliding-window';

-- Section: Sliding Window Fundamentals
INSERT INTO quiz_questions (pattern_id, section_slug, question_type, difficulty, question_text, code_snippet, options, correct_answer, explanation, display_order) VALUES
('sliding-window', NULL, 'multiple-choice', 'easy',
 'What is the main advantage of sliding window over brute force for subarray problems?',
 NULL,
 '["Uses less memory", "Avoids recalculating entire window - only updates boundaries", "Works on unsorted arrays", "Simpler to implement"]',
 '1',
 'Sliding window incrementally updates by adding/removing boundary elements instead of recalculating from scratch each time.',
 1),

('sliding-window', NULL, 'multiple-choice', 'easy',
 'When should you consider using the sliding window technique?',
 NULL,
 '["Finding pairs with a target sum", "Finding contiguous subarray/substring with a constraint", "Sorting an array", "Binary search problems"]',
 '1',
 'Sliding window is ideal for contiguous subarray/substring problems with constraints like max sum, longest without repeating, etc.',
 2),

('sliding-window', NULL, 'true-false', 'easy',
 'Sliding window only works on sorted arrays.',
 NULL,
 NULL,
 'false',
 'Sliding window works on any array. It tracks a contiguous range, not element ordering.',
 3),

('sliding-window', NULL, 'multiple-choice', 'easy',
 'What is the time complexity of most sliding window algorithms?',
 NULL,
 '["O(n²)", "O(n log n)", "O(n)", "O(1)"]',
 '2',
 'Each element is visited at most twice (once by right pointer, once by left), giving O(n) time.',
 4),

('sliding-window', NULL, 'multiple-choice', 'easy',
 'How do you calculate the current window size?',
 NULL,
 '["right - left", "right - left + 1", "left - right + 1", "right + left"]',
 '1',
 'Window size = right - left + 1. For indices 2 to 5: size = 5 - 2 + 1 = 4 elements.',
 5),

-- Fixed Size Window
('sliding-window', NULL, 'multiple-choice', 'medium',
 'In a fixed-size window of size k, when do we start recording results?',
 NULL,
 '["From index 0", "From index k", "From index k-1 (when window is full)", "At the end only"]',
 '2',
 'Window becomes full when right index reaches k-1. That''s when we have exactly k elements.',
 6),

('sliding-window', NULL, 'code-output', 'medium',
 'For arr = [2, 1, 5, 1, 3, 2] and k = 3, what is the maximum sum of any subarray of size 3?',
 'function maxSum(arr, k) {
  let windowSum = 0, maxSum = -Infinity;
  for (let i = 0; i < arr.length; i++) {
    windowSum += arr[i];
    if (i >= k - 1) {
      maxSum = Math.max(maxSum, windowSum);
      windowSum -= arr[i - k + 1];
    }
  }
  return maxSum;
}',
 '["7", "8", "9", "10"]',
 '2',
 'Subarrays of size 3: [2,1,5]=8, [1,5,1]=7, [5,1,3]=9, [1,3,2]=6. Maximum is 9.',
 7),

('sliding-window', NULL, 'identify-bug', 'medium',
 'What is wrong with this fixed window code?',
 'function maxSum(arr, k) {
  let windowSum = 0, maxSum = 0;
  for (let i = 0; i < arr.length; i++) {
    windowSum += arr[i];
    if (i >= k) {  // Bug here
      maxSum = Math.max(maxSum, windowSum);
      windowSum -= arr[i - k];
    }
  }
  return maxSum;
}',
 '["Should be i >= k - 1", "Should initialize maxSum to -Infinity", "Both A and B are bugs", "Nothing is wrong"]',
 '2',
 'Two bugs: (1) i >= k misses first window, should be i >= k - 1. (2) maxSum = 0 fails for negative arrays.',
 8),

('sliding-window', NULL, 'code-output', 'medium',
 'For arr = [1, 12, -5, -6, 50, 3] and k = 4, what is the maximum average?',
 '// Window sums: [1,12,-5,-6]=2, [12,-5,-6,50]=51, [-5,-6,50,3]=42
// Averages: 0.5, 12.75, 10.5',
 '["10.5", "12.75", "0.5", "51"]',
 '1',
 'Maximum sum is 51 for [12,-5,-6,50]. Average = 51/4 = 12.75.',
 9),

-- Variable Size Window - Maximum
('sliding-window', NULL, 'multiple-choice', 'medium',
 'In variable-size sliding window for "longest" problems, when do we update the result?',
 NULL,
 '["Inside the while loop (when shrinking)", "After the while loop (when window is valid)", "Before expanding", "At the end of the array only"]',
 '1',
 'For maximum/longest: update AFTER shrinking (window is valid). For minimum/shortest: update INSIDE shrinking loop.',
 10),

('sliding-window', NULL, 'code-output', 'medium',
 'For s = "abcabcbb", what is the length of the longest substring without repeating characters?',
 'function lengthOfLongestSubstring(s) {
  const seen = new Set();
  let left = 0, maxLen = 0;
  for (let right = 0; right < s.length; right++) {
    while (seen.has(s[right])) {
      seen.delete(s[left]);
      left++;
    }
    seen.add(s[right]);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}',
 '["2", "3", "4", "5"]',
 '1',
 'Longest substrings without repeating: "abc" (length 3). After that, characters start repeating.',
 11),

('sliding-window', NULL, 'code-output', 'medium',
 'For s = "bbbbb", what is the length of the longest substring without repeating?',
 NULL,
 '["1", "2", "3", "5"]',
 '0',
 'Every character is "b". The longest non-repeating substring is just "b" with length 1.',
 12),

('sliding-window', NULL, 'multiple-choice', 'medium',
 'In "Longest Repeating Character Replacement" with k replacements, what do we track?',
 NULL,
 '["Count of each character in window", "Count of most frequent character in window", "Both A and B", "Neither"]',
 '2',
 'Track frequency of each char AND the max frequency. Valid window: size - maxFreq <= k (can replace the rest).',
 13),

('sliding-window', NULL, 'code-output', 'hard',
 'For s = "AABABBA" and k = 1, what is the longest substring after at most 1 replacement?',
 '// Track: window size - maxFreq <= k
// "AABA" has 3 A''s, 1 B. size=4, maxFreq=3. 4-3=1 <= k. Valid!',
 '["3", "4", "5", "6"]',
 '1',
 'Window "AABA" (indices 0-3): 4 chars, 3 A''s. Replace 1 B → "AAAA". Length 4.',
 14),

-- Variable Size Window - Minimum
('sliding-window', NULL, 'multiple-choice', 'medium',
 'For "minimum" window problems, where do we update the result?',
 NULL,
 '["After the while loop", "Inside the while loop (each time window is valid)", "At the start of each iteration", "Only at the end"]',
 '1',
 'For minimum: update INSIDE the shrinking loop. Each valid (smaller) window could be the answer.',
 15),

('sliding-window', NULL, 'code-output', 'medium',
 'For nums = [2, 3, 1, 2, 4, 3] and target = 7, what is the minimum subarray length with sum >= 7?',
 'function minSubArrayLen(target, nums) {
  let left = 0, sum = 0, minLen = Infinity;
  for (let right = 0; right < nums.length; right++) {
    sum += nums[right];
    while (sum >= target) {
      minLen = Math.min(minLen, right - left + 1);
      sum -= nums[left++];
    }
  }
  return minLen === Infinity ? 0 : minLen;
}',
 '["1", "2", "3", "4"]',
 '1',
 'Subarray [4,3] has sum 7 with length 2. This is the minimum.',
 16),

('sliding-window', NULL, 'identify-bug', 'medium',
 'What is wrong with this minimum window code?',
 'function minSubArrayLen(target, nums) {
  let left = 0, sum = 0, minLen = Infinity;
  for (let right = 0; right < nums.length; right++) {
    sum += nums[right];
    while (sum >= target) {
      sum -= nums[left++];
    }
    minLen = Math.min(minLen, right - left + 1);  // Bug: wrong position
  }
  return minLen === Infinity ? 0 : minLen;
}',
 '["Result update should be INSIDE the while loop", "Should use if instead of while", "left++ is wrong", "sum calculation is wrong"]',
 '0',
 'For minimum problems, update inside the while loop when window is valid. Outside, the window may be invalid.',
 17),

-- Anagram / Permutation Problems
('sliding-window', NULL, 'multiple-choice', 'medium',
 'For "Find All Anagrams", what makes the sliding window approach efficient?',
 NULL,
 '["Sort both strings", "Compare frequency maps as window slides", "Check all permutations", "Use binary search"]',
 '1',
 'Fixed window of pattern length. Track frequencies and matches count. Update incrementally as window slides.',
 18),

('sliding-window', NULL, 'code-output', 'medium',
 'For s = "cbaebabacd" and p = "abc", at which indices do anagrams of p start?',
 '// p = "abc" (length 3)
// Check each window of size 3
// Index 0: "cba" - anagram ✓
// Index 6: "bac" - anagram ✓',
 '["[0]", "[0, 6]", "[0, 3, 6]", "[6]"]',
 '1',
 '"cba" at index 0 and "bac" at index 6 are anagrams of "abc".',
 19),

('sliding-window', NULL, 'multiple-choice', 'hard',
 'In the "matches counter" approach for anagrams, when do we increment matches?',
 NULL,
 '["When any character is added", "When a character''s count in window equals its count in pattern", "When window size equals pattern size", "When all characters match"]',
 '1',
 'matches++ when sFreq[c] === pFreq[c]. We track how many characters have exact matching frequencies.',
 20),

-- Minimum Window Substring
('sliding-window', NULL, 'multiple-choice', 'hard',
 'In "Minimum Window Substring", what triggers shrinking the window?',
 NULL,
 '["Window size exceeds some limit", "Window contains all required characters", "A character is repeated", "Window sum exceeds target"]',
 '1',
 'Shrink when window is valid (contains all chars from t). Keep shrinking to find minimum while staying valid.',
 21),

('sliding-window', NULL, 'code-output', 'hard',
 'For s = "ADOBECODEBANC" and t = "ABC", what is the minimum window substring?',
 '// Need: A, B, C
// "ADOBEC" has all (length 6)
// "BECODEBA" has all but longer
// "BANC" has all (length 4) - minimum!',
 '["ADOBEC", "BANC", "ABC", "CODEBANC"]',
 '1',
 '"BANC" (length 4) is the shortest substring containing A, B, and C.',
 22),

('sliding-window', NULL, 'multiple-choice', 'hard',
 'Why use a "have" and "need" counter in Minimum Window Substring?',
 NULL,
 '["Track window size", "Know when we have all required characters (have === need)", "Count duplicates", "Optimize memory"]',
 '1',
 'need = unique chars in t. have = chars with sufficient count in window. have === need means window is valid.',
 23),

-- Sliding Window Maximum (with Deque)
('sliding-window', NULL, 'multiple-choice', 'hard',
 'In "Sliding Window Maximum", why use a deque instead of just tracking max?',
 NULL,
 '["Deque is faster", "When max leaves window, we need the next max ready", "Deque uses less memory", "Simple max tracking works fine"]',
 '1',
 'Deque stores candidates in decreasing order. When current max leaves window, next max is at deque front.',
 24),

('sliding-window', NULL, 'code-output', 'hard',
 'For nums = [1,3,-1,-3,5,3,6,7] and k = 3, what are the sliding window maximums?',
 '// Window [1,3,-1] max=3
// Window [3,-1,-3] max=3
// Window [-1,-3,5] max=5
// Window [-3,5,3] max=5
// Window [5,3,6] max=6
// Window [3,6,7] max=7',
 '["[3,3,5,5,6,7]", "[1,3,5,5,6,7]", "[3,3,-1,5,5,6]", "[3,3,5,3,6,7]"]',
 '0',
 'Maximums for each window position: 3, 3, 5, 5, 6, 7.',
 25),

('sliding-window', NULL, 'multiple-choice', 'hard',
 'What invariant does the deque maintain in Sliding Window Maximum?',
 NULL,
 '["Increasing order from front to back", "Decreasing order from front to back", "Sorted by index", "Random order"]',
 '1',
 'Deque maintains decreasing order. Front is always the max. Remove smaller elements before adding new one.',
 26),

-- Edge Cases and Variations
('sliding-window', NULL, 'multiple-choice', 'medium',
 'For "Max Consecutive Ones III" (can flip at most k zeros), what constraint defines the window?',
 NULL,
 '["Number of ones <= k", "Number of zeros in window <= k", "Window size <= k", "Sum of window <= k"]',
 '1',
 'Window is valid if zeros count <= k. We can flip up to k zeros to ones.',
 27),

('sliding-window', NULL, 'code-output', 'medium',
 'For nums = [1,1,1,0,0,0,1,1,1,1,0] and k = 2, what is the longest sequence of 1s after flipping at most 2 zeros?',
 '// Can flip 2 zeros to get consecutive 1s
// Best: [1,1,1,0,0,1,1,1,1] - flip positions 3,4 or 4,10
// Actually: indices 0-9 with flipping zeros at 3,4 gives 10? No...
// Window with at most 2 zeros: indices 3-10 [0,0,0,1,1,1,1,0] has 3 zeros
// indices 0-5 [1,1,1,0,0,0] has 3 zeros
// indices 5-10 [0,1,1,1,1,0] has 2 zeros = length 6',
 '["5", "6", "7", "10"]',
 '1',
 'Longest window with at most 2 zeros: [0,1,1,1,1,0] or [1,1,1,0,0,1] - length 6.',
 28),

('sliding-window', NULL, 'identify-bug', 'medium',
 'What is wrong with this longest substring code?',
 'function lengthOfLongestSubstring(s) {
  const seen = new Set();
  let left = 0, maxLen = 0;
  for (let right = 0; right < s.length; right++) {
    if (seen.has(s[right])) {
      seen.delete(s[left]);
      left++;
    }
    seen.add(s[right]);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}',
 '["Should use while instead of if for shrinking", "maxLen update is wrong", "seen.add is in wrong place", "left++ should be left--"]',
 '0',
 'if removes only one element. Need while to keep removing until the duplicate is gone.',
 29),

('sliding-window', NULL, 'multiple-choice', 'medium',
 'What distinguishes sliding window from two pointers?',
 NULL,
 '["They are the same technique", "Sliding window tracks a contiguous range; two pointers can be non-contiguous", "Two pointers is faster", "Sliding window only works on strings"]',
 '1',
 'Sliding window maintains a contiguous subarray/substring. Two pointers can work on non-contiguous elements (like sorted array ends).',
 30);
