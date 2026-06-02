-- Quiz Questions for Dynamic Programming Pattern
-- Run: psql "postgresql://..." -f scripts/seed/quiz_questions_dynamic_programming.sql

-- Clear existing dynamic-programming questions first
DELETE FROM quiz_questions WHERE pattern_id = 'dynamic-programming';

-- Section: DP Fundamentals
INSERT INTO quiz_questions (pattern_id, section_slug, question_type, difficulty, question_text, code_snippet, options, correct_answer, explanation, display_order) VALUES
('dynamic-programming', NULL, 'multiple-choice', 'easy',
 'What are the two key properties that make a problem suitable for dynamic programming?',
 NULL,
 '["Sorting and searching", "Overlapping subproblems and optimal substructure", "Recursion and iteration", "Arrays and strings"]',
 '1',
 'DP works when subproblems repeat (overlapping) and optimal solution uses optimal sub-solutions (optimal substructure).',
 1),

('dynamic-programming', NULL, 'multiple-choice', 'easy',
 'What is memoization?',
 NULL,
 '["A type of sorting", "Caching results of subproblems to avoid recomputation", "Converting recursion to iteration", "A memory optimization technique"]',
 '1',
 'Memoization stores computed results so identical subproblems return cached values instead of recomputing.',
 2),

('dynamic-programming', NULL, 'multiple-choice', 'easy',
 'What is the difference between top-down and bottom-up DP?',
 NULL,
 '["No difference", "Top-down uses recursion+memoization; bottom-up uses iteration", "Top-down is faster", "Bottom-up uses more memory"]',
 '1',
 'Top-down: recursive with memo (start from problem, break down). Bottom-up: iterative (build from base cases).',
 3),

('dynamic-programming', NULL, 'true-false', 'easy',
 'Every recursive solution can be converted to a dynamic programming solution.',
 NULL,
 NULL,
 'false',
 'Only problems with overlapping subproblems benefit from DP. Pure divide-and-conquer (like merge sort) doesn''t.',
 4),

('dynamic-programming', NULL, 'multiple-choice', 'easy',
 'What are the three steps to solve a DP problem?',
 NULL,
 '["Sort, search, return", "Define state, write recurrence, identify base cases", "Read input, process, output", "Initialize, loop, return"]',
 '1',
 'State = what info needed. Recurrence = how current depends on previous. Base cases = simplest answers.',
 5),

-- Climbing Stairs / Fibonacci
('dynamic-programming', NULL, 'code-output', 'easy',
 'For Climbing Stairs with n = 3 (1 or 2 steps at a time), how many ways?',
 '// Ways to reach step 3:
// 1+1+1, 1+2, 2+1
// dp[1] = 1, dp[2] = 2
// dp[3] = dp[2] + dp[1] = 3',
 '["2", "3", "4", "5"]',
 '1',
 'Three ways: (1,1,1), (1,2), (2,1). Formula: dp[n] = dp[n-1] + dp[n-2].',
 6),

('dynamic-programming', NULL, 'multiple-choice', 'medium',
 'How can we optimize Climbing Stairs from O(n) space to O(1)?',
 NULL,
 '["Use arrays instead of recursion", "Only keep last 2 values since dp[i] depends on dp[i-1] and dp[i-2]", "Use bit manipulation", "Space cannot be optimized"]',
 '1',
 'Only need two previous values. Use two variables instead of full array.',
 7),

('dynamic-programming', NULL, 'identify-bug', 'medium',
 'What is wrong with this Climbing Stairs code?',
 'function climbStairs(n) {
  const dp = new Array(n + 1);
  dp[1] = 1;
  dp[2] = 2;
  for (let i = 3; i <= n; i++) {
    dp[i] = dp[i-1] + dp[i-2];
  }
  return dp[n];
}',
 '["Missing base case handling for n <= 2", "Loop should start at 1", "dp array size is wrong", "Recurrence relation is wrong"]',
 '0',
 'If n=1, dp[2] is set but we return dp[1]. Need: if (n <= 2) return n.',
 8),

-- House Robber
('dynamic-programming', NULL, 'multiple-choice', 'medium',
 'In House Robber, what is the recurrence relation?',
 NULL,
 '["dp[i] = dp[i-1] + nums[i]", "dp[i] = max(dp[i-1], dp[i-2] + nums[i])", "dp[i] = min(dp[i-1], dp[i-2])", "dp[i] = nums[i] - dp[i-1]"]',
 '1',
 'At each house: skip it (dp[i-1]) or rob it (dp[i-2] + nums[i]). Take maximum.',
 9),

('dynamic-programming', NULL, 'code-output', 'medium',
 'For nums = [2, 7, 9, 3, 1], what is the maximum amount you can rob?',
 '// dp[0] = 2
// dp[1] = max(2, 7) = 7
// dp[2] = max(7, 2+9) = 11
// dp[3] = max(11, 7+3) = 11
// dp[4] = max(11, 11+1) = 12',
 '["11", "12", "13", "14"]',
 '1',
 'Rob houses 0, 2, 4: 2 + 9 + 1 = 12.',
 10),

('dynamic-programming', NULL, 'multiple-choice', 'medium',
 'In House Robber II (houses in circle), how do we handle the circular constraint?',
 NULL,
 '["Use modulo arithmetic", "Solve twice: exclude first house OR exclude last house, take max", "Start from middle", "Cannot be solved with DP"]',
 '1',
 'First and last houses are adjacent. Solve for houses[0..n-2] and houses[1..n-1], return max.',
 11),

-- Coin Change
('dynamic-programming', NULL, 'multiple-choice', 'medium',
 'In Coin Change (minimum coins), what does dp[i] represent?',
 NULL,
 '["Number of ways to make amount i", "Minimum coins needed to make amount i", "Maximum coins to make amount i", "Whether amount i is possible"]',
 '1',
 'dp[i] = minimum number of coins to make amount i. Initialize with Infinity, dp[0] = 0.',
 12),

('dynamic-programming', NULL, 'code-output', 'medium',
 'For coins = [1, 2, 5] and amount = 11, what is the minimum number of coins?',
 '// 11 = 5 + 5 + 1 = 3 coins
// Or: 5 + 2 + 2 + 2 = 4 coins (worse)',
 '["2", "3", "4", "5"]',
 '1',
 'Minimum: 5 + 5 + 1 = 3 coins.',
 13),

('dynamic-programming', NULL, 'multiple-choice', 'medium',
 'In unbounded knapsack (like Coin Change), why do we iterate amount in FORWARD direction?',
 NULL,
 '["Performance optimization", "To allow using same coin multiple times", "Reverse doesn''t work", "It is just convention"]',
 '1',
 'Forward iteration means dp[i-coin] is already updated with current coin, allowing reuse.',
 14),

-- 0/1 Knapsack
('dynamic-programming', NULL, 'multiple-choice', 'medium',
 'In 0/1 Knapsack (each item once), why iterate capacity in REVERSE?',
 NULL,
 '["Performance optimization", "Prevents using same item multiple times", "Forward doesn''t work", "Reverse is faster"]',
 '1',
 'Reverse ensures dp[j-weight] uses previous row''s value (without current item), not current row''s.',
 15),

('dynamic-programming', NULL, 'code-output', 'medium',
 'For Partition Equal Subset Sum with nums = [1, 5, 11, 5], can we partition into equal sums?',
 '// Total = 22, target = 11
// Can we make 11? [1, 5, 5] = 11 or [11] = 11
// Yes!',
 '["true", "false"]',
 '0',
 'Total is 22, so each subset should sum to 11. [1,5,5] and [11] both sum to 11.',
 16),

('dynamic-programming', NULL, 'multiple-choice', 'hard',
 'What is the key difference between "Coin Change" and "Coin Change II"?',
 NULL,
 '["Different coins", "Minimum coins vs count of combinations", "One uses 2D, other uses 1D", "No difference"]',
 '1',
 'Coin Change: minimum coins needed. Coin Change II: count number of ways (combinations).',
 17),

-- Longest Increasing Subsequence
('dynamic-programming', NULL, 'multiple-choice', 'medium',
 'In LIS (Longest Increasing Subsequence), what does dp[i] represent?',
 NULL,
 '["Length of LIS ending at index i", "Length of LIS starting at index i", "Total LIS count", "Whether index i is in LIS"]',
 '0',
 'dp[i] = length of longest increasing subsequence that ends at index i.',
 18),

('dynamic-programming', NULL, 'code-output', 'medium',
 'For nums = [10, 9, 2, 5, 3, 7, 101, 18], what is the LIS length?',
 '// One LIS: [2, 3, 7, 101] or [2, 5, 7, 101]
// Length = 4',
 '["3", "4", "5", "6"]',
 '1',
 'LIS: [2, 3, 7, 101] or [2, 5, 7, 18]. Length = 4.',
 19),

('dynamic-programming', NULL, 'multiple-choice', 'hard',
 'How can LIS be optimized from O(n²) to O(n log n)?',
 NULL,
 '["Use memoization", "Use binary search with patience sorting", "Use two pointers", "It cannot be optimized"]',
 '1',
 'Maintain array of smallest tail elements. Binary search to find position for each element. O(n log n).',
 20),

-- Edit Distance / LCS
('dynamic-programming', NULL, 'multiple-choice', 'medium',
 'In Edit Distance, what are the three operations?',
 NULL,
 '["Add, remove, sort", "Insert, delete, replace", "Swap, reverse, copy", "Push, pop, peek"]',
 '1',
 'Edit Distance counts minimum insert, delete, replace operations to transform one string to another.',
 21),

('dynamic-programming', NULL, 'code-output', 'medium',
 'For word1 = "horse" and word2 = "ros", what is the edit distance?',
 '// horse → rorse (replace h with r)
// rorse → rose (delete r)
// rose → ros (delete e)
// 3 operations',
 '["2", "3", "4", "5"]',
 '1',
 'Minimum 3 operations: replace h→r, delete r, delete e.',
 22),

('dynamic-programming', NULL, 'multiple-choice', 'medium',
 'In LCS (Longest Common Subsequence), if characters match, what is the recurrence?',
 NULL,
 '["dp[i][j] = dp[i-1][j-1]", "dp[i][j] = dp[i-1][j-1] + 1", "dp[i][j] = max(dp[i-1][j], dp[i][j-1])", "dp[i][j] = 1"]',
 '1',
 'If s1[i-1] === s2[j-1], we extend the previous LCS: dp[i][j] = dp[i-1][j-1] + 1.',
 23),

('dynamic-programming', NULL, 'code-output', 'medium',
 'For text1 = "abcde" and text2 = "ace", what is the LCS length?',
 '// Common subsequence: "ace"
// Length = 3',
 '["2", "3", "4", "5"]',
 '1',
 'LCS is "ace" with length 3.',
 24),

-- Word Break
('dynamic-programming', NULL, 'multiple-choice', 'medium',
 'In Word Break, what does dp[i] represent?',
 NULL,
 '["Number of words ending at i", "Whether s[0..i-1] can be segmented into dictionary words", "Length of longest word at i", "Index of last word"]',
 '1',
 'dp[i] = true if substring s[0..i-1] can be broken into valid dictionary words.',
 25),

('dynamic-programming', NULL, 'code-output', 'medium',
 'For s = "leetcode" and wordDict = ["leet", "code"], can the string be segmented?',
 '// "leet" + "code" = "leetcode"
// dp[4] = true (leet), dp[8] = true (code)',
 '["true", "false"]',
 '0',
 '"leetcode" = "leet" + "code". Both are in dictionary.',
 26),

-- Grid DP
('dynamic-programming', NULL, 'multiple-choice', 'medium',
 'In "Unique Paths" grid problem, what is the recurrence?',
 NULL,
 '["dp[i][j] = dp[i-1][j] * dp[i][j-1]", "dp[i][j] = dp[i-1][j] + dp[i][j-1]", "dp[i][j] = min(dp[i-1][j], dp[i][j-1])", "dp[i][j] = max(dp[i-1][j], dp[i][j-1])"]',
 '1',
 'Paths to (i,j) = paths from top + paths from left. Addition for counting.',
 27),

('dynamic-programming', NULL, 'code-output', 'medium',
 'For a 3x3 grid, how many unique paths from top-left to bottom-right?',
 '// Only right and down moves
// dp[i][j] = dp[i-1][j] + dp[i][j-1]
// Result: 6 paths',
 '["4", "5", "6", "8"]',
 '2',
 'For 3x3 grid: 6 unique paths (need 2 rights and 2 downs = C(4,2) = 6).',
 28),

-- Space Optimization
('dynamic-programming', NULL, 'multiple-choice', 'hard',
 'When can we reduce 2D DP space to 1D?',
 NULL,
 '["Always", "When dp[i][j] only depends on dp[i-1][...] (previous row only)", "When problem is simple", "Never"]',
 '1',
 'If current row only needs previous row, use 1D array and overwrite in correct order.',
 29),

('dynamic-programming', NULL, 'identify-bug', 'medium',
 'What is wrong with this Coin Change code?',
 'function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(0);  // Bug: should be Infinity
  dp[0] = 0;
  for (let coin of coins) {
    for (let i = coin; i <= amount; i++) {
      dp[i] = Math.min(dp[i], dp[i - coin] + 1);
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}',
 '["Should initialize with Infinity, not 0", "Loop direction is wrong", "Base case is wrong", "Return value is wrong"]',
 '0',
 'fill(0) means min() always picks 0. Need fill(Infinity) so valid paths replace it.',
 30);
