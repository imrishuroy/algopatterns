-- Quiz Questions for Dynamic Programming Pattern
-- Run: psql "postgresql://..." -f scripts/seed/quiz_questions_dynamic_programming.sql

-- Clear existing dynamic-programming questions first
DELETE FROM quiz_questions WHERE pattern_id = 'dynamic-programming';

-- Section 1: DP Fundamentals
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
 'Only problems with overlapping subproblems benefit from DP. Pure divide-and-conquer (like merge sort) does not have overlapping subproblems.',
 4),

('dynamic-programming', NULL, 'multiple-choice', 'easy',
 'What are the three steps to solve a DP problem?',
 NULL,
 '["Sort, search, return", "Define state, write recurrence, identify base cases", "Read input, process, output", "Initialize, loop, return"]',
 '1',
 'State = what info needed. Recurrence = how current depends on previous. Base cases = simplest answers.',
 5),

-- Section 2: 1D DP / Climbing Stairs / Fibonacci
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

-- Section 3: Decision DP / House Robber
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

-- Section 4: 0/1 Knapsack
('dynamic-programming', NULL, 'multiple-choice', 'medium',
 'In 0/1 Knapsack (each item once), why iterate capacity in REVERSE?',
 NULL,
 '["Performance optimization", "Prevents using same item multiple times", "Forward does not work", "Reverse is faster"]',
 '1',
 'Reverse ensures dp[j-weight] uses previous row value (without current item), not current row.',
 12),

('dynamic-programming', NULL, 'code-output', 'medium',
 'For Partition Equal Subset Sum with nums = [1, 5, 11, 5], can we partition into equal sums?',
 '// Total = 22, target = 11
// Can we make 11? [1, 5, 5] = 11 or [11] = 11
// Yes!',
 '["true", "false"]',
 '0',
 'Total is 22, so each subset should sum to 11. [1,5,5] and [11] both sum to 11.',
 13),

('dynamic-programming', NULL, 'multiple-choice', 'medium',
 'What is the state for 0/1 Knapsack?',
 NULL,
 '["Just the remaining capacity", "Item index and remaining capacity", "Total value collected", "Number of items used"]',
 '1',
 'Need to track which item we are considering (index) and remaining capacity to make decisions.',
 14),

-- Section 5: Unbounded Knapsack / Coin Change
('dynamic-programming', NULL, 'multiple-choice', 'medium',
 'In Coin Change (minimum coins), what does dp[i] represent?',
 NULL,
 '["Number of ways to make amount i", "Minimum coins needed to make amount i", "Maximum coins to make amount i", "Whether amount i is possible"]',
 '1',
 'dp[i] = minimum number of coins to make amount i. Initialize with Infinity, dp[0] = 0.',
 15),

('dynamic-programming', NULL, 'code-output', 'medium',
 'For coins = [1, 2, 5] and amount = 11, what is the minimum number of coins?',
 '// 11 = 5 + 5 + 1 = 3 coins
// Or: 5 + 2 + 2 + 2 = 4 coins (worse)',
 '["2", "3", "4", "5"]',
 '1',
 'Minimum: 5 + 5 + 1 = 3 coins.',
 16),

('dynamic-programming', NULL, 'multiple-choice', 'medium',
 'In unbounded knapsack (like Coin Change), why do we iterate amount in FORWARD direction?',
 NULL,
 '["Performance optimization", "To allow using same coin multiple times", "Reverse does not work", "It is just convention"]',
 '1',
 'Forward iteration means dp[i-coin] is already updated with current coin, allowing reuse.',
 17),

('dynamic-programming', NULL, 'multiple-choice', 'hard',
 'What is the key difference between "Coin Change" and "Coin Change II"?',
 NULL,
 '["Different coins", "Minimum coins vs count of combinations", "One uses 2D, other uses 1D", "No difference"]',
 '1',
 'Coin Change: minimum coins needed. Coin Change II: count number of ways (combinations).',
 18),

-- Section 6: LCS (Two Sequences)
('dynamic-programming', NULL, 'multiple-choice', 'medium',
 'In LCS (Longest Common Subsequence), if characters match, what is the recurrence?',
 NULL,
 '["dp[i][j] = dp[i-1][j-1]", "dp[i][j] = dp[i-1][j-1] + 1", "dp[i][j] = max(dp[i-1][j], dp[i][j-1])", "dp[i][j] = 1"]',
 '1',
 'If s1[i-1] === s2[j-1], we extend the previous LCS: dp[i][j] = dp[i-1][j-1] + 1.',
 19),

('dynamic-programming', NULL, 'code-output', 'medium',
 'For text1 = "abcde" and text2 = "ace", what is the LCS length?',
 '// Common subsequence: "ace"
// Length = 3',
 '["2", "3", "4", "5"]',
 '1',
 'LCS is "ace" with length 3.',
 20),

('dynamic-programming', NULL, 'multiple-choice', 'medium',
 'If characters do NOT match in LCS, what is the recurrence?',
 NULL,
 '["dp[i][j] = 0", "dp[i][j] = dp[i-1][j-1]", "dp[i][j] = max(dp[i-1][j], dp[i][j-1])", "dp[i][j] = min(dp[i-1][j], dp[i][j-1])"]',
 '2',
 'If no match, take maximum of skipping character from either string.',
 21),

('dynamic-programming', NULL, 'multiple-choice', 'medium',
 'In Edit Distance, what are the three operations?',
 NULL,
 '["Add, remove, sort", "Insert, delete, replace", "Swap, reverse, copy", "Push, pop, peek"]',
 '1',
 'Edit Distance counts minimum insert, delete, replace operations to transform one string to another.',
 22),

('dynamic-programming', NULL, 'code-output', 'medium',
 'For word1 = "horse" and word2 = "ros", what is the edit distance?',
 '// horse -> rorse (replace h with r)
// rorse -> rose (delete r)
// rose -> ros (delete e)
// 3 operations',
 '["2", "3", "4", "5"]',
 '1',
 'Minimum 3 operations: replace h to r, delete r, delete e.',
 23),

-- Section 7: LIS (Longest Increasing Subsequence)
('dynamic-programming', NULL, 'multiple-choice', 'medium',
 'In LIS (Longest Increasing Subsequence), what does dp[i] represent?',
 NULL,
 '["Length of LIS ending at index i", "Length of LIS starting at index i", "Total LIS count", "Whether index i is in LIS"]',
 '0',
 'dp[i] = length of longest increasing subsequence that ends at index i.',
 24),

('dynamic-programming', NULL, 'code-output', 'medium',
 'For nums = [10, 9, 2, 5, 3, 7, 101, 18], what is the LIS length?',
 '// One LIS: [2, 3, 7, 101] or [2, 5, 7, 101]
// Length = 4',
 '["3", "4", "5", "6"]',
 '1',
 'LIS: [2, 3, 7, 101] or [2, 5, 7, 18]. Length = 4.',
 25),

('dynamic-programming', NULL, 'multiple-choice', 'hard',
 'How can LIS be optimized from O(n^2) to O(n log n)?',
 NULL,
 '["Use memoization", "Use binary search with patience sorting", "Use two pointers", "It cannot be optimized"]',
 '1',
 'Maintain array of smallest tail elements. Binary search to find position for each element. O(n log n).',
 26),

('dynamic-programming', NULL, 'multiple-choice', 'medium',
 'What is the time complexity of the basic LIS DP solution?',
 NULL,
 '["O(n)", "O(n log n)", "O(n^2)", "O(2^n)"]',
 '2',
 'For each element i, we check all previous elements j < i. Two nested loops = O(n^2).',
 27),

-- Section 8: Grid DP (2D Navigation)
('dynamic-programming', NULL, 'multiple-choice', 'medium',
 'In "Unique Paths" grid problem, what is the recurrence?',
 NULL,
 '["dp[i][j] = dp[i-1][j] * dp[i][j-1]", "dp[i][j] = dp[i-1][j] + dp[i][j-1]", "dp[i][j] = min(dp[i-1][j], dp[i][j-1])", "dp[i][j] = max(dp[i-1][j], dp[i][j-1])"]',
 '1',
 'Paths to (i,j) = paths from top + paths from left. Addition for counting.',
 28),

('dynamic-programming', NULL, 'code-output', 'medium',
 'For a 3x3 grid, how many unique paths from top-left to bottom-right?',
 '// Only right and down moves
// dp[i][j] = dp[i-1][j] + dp[i][j-1]
// Result: 6 paths',
 '["4", "5", "6", "8"]',
 '2',
 'For 3x3 grid: 6 unique paths (need 2 rights and 2 downs = C(4,2) = 6).',
 29),

('dynamic-programming', NULL, 'multiple-choice', 'medium',
 'In Minimum Path Sum, what is the recurrence?',
 NULL,
 '["dp[i][j] = dp[i-1][j] + dp[i][j-1] + grid[i][j]", "dp[i][j] = min(dp[i-1][j], dp[i][j-1]) + grid[i][j]", "dp[i][j] = max(dp[i-1][j], dp[i][j-1]) + grid[i][j]", "dp[i][j] = grid[i][j]"]',
 '1',
 'Take minimum cost path from top or left, add current cell value.',
 30),

('dynamic-programming', NULL, 'multiple-choice', 'medium',
 'In Unique Paths II with obstacles, how do we handle blocked cells?',
 NULL,
 '["Skip them", "Set dp[i][j] = 0 for obstacles", "Use different recurrence", "Obstacles cannot be handled"]',
 '1',
 'If cell is obstacle, dp[i][j] = 0 (no paths through it). Otherwise use normal recurrence.',
 31),

-- Section 9: Interval DP
('dynamic-programming', NULL, 'multiple-choice', 'hard',
 'In Interval DP, what is the typical loop order?',
 NULL,
 '["Left to right only", "Right to left only", "By increasing interval length", "Random order works"]',
 '2',
 'Process intervals by increasing length. dp[i][j] depends on smaller intervals inside [i,j].',
 32),

('dynamic-programming', NULL, 'multiple-choice', 'hard',
 'In Matrix Chain Multiplication, what does dp[i][j] represent?',
 NULL,
 '["Product of matrices i to j", "Minimum operations to multiply matrices i to j", "Maximum operations", "Whether multiplication is possible"]',
 '1',
 'dp[i][j] = minimum scalar multiplications to compute product of matrices from i to j.',
 33),

('dynamic-programming', NULL, 'multiple-choice', 'hard',
 'In Burst Balloons, why do we think about which balloon to burst LAST instead of FIRST?',
 NULL,
 '["No particular reason", "Bursting first creates dependencies between left and right", "It is faster", "First does not work"]',
 '1',
 'If we burst balloon k first, remaining balloons change neighbors. Bursting last keeps subproblems independent.',
 34),

('dynamic-programming', NULL, 'code-output', 'hard',
 'For Burst Balloons with nums = [3, 1, 5, 8], what is the maximum coins?',
 '// Add virtual balloons: [1, 3, 1, 5, 8, 1]
// Optimal: burst 1, then 5, then 3, then 8
// 3*1*5 + 3*5*8 + 1*3*8 + 1*8*1 = 15+120+24+8 = 167',
 '["152", "167", "180", "200"]',
 '1',
 'Maximum coins = 167. Order: burst in sequence that maximizes total.',
 35),

-- Section 10: Palindrome DP
('dynamic-programming', NULL, 'multiple-choice', 'medium',
 'In Longest Palindromic Subsequence, what is the recurrence when characters match?',
 NULL,
 '["dp[i][j] = dp[i+1][j-1]", "dp[i][j] = dp[i+1][j-1] + 2", "dp[i][j] = max(dp[i+1][j], dp[i][j-1])", "dp[i][j] = 1"]',
 '1',
 'If s[i] == s[j], we extend palindrome by 2: dp[i][j] = dp[i+1][j-1] + 2.',
 36),

('dynamic-programming', NULL, 'code-output', 'medium',
 'For string "bbbab", what is the longest palindromic subsequence length?',
 '// "bbbb" is the longest palindromic subsequence
// Length = 4',
 '["3", "4", "5", "2"]',
 '1',
 'LPS is "bbbb" with length 4.',
 37),

('dynamic-programming', NULL, 'multiple-choice', 'medium',
 'What is the relationship between Longest Palindromic Subsequence and LCS?',
 NULL,
 '["No relationship", "LPS(s) = LCS(s, reverse(s))", "LPS is always longer", "LCS is always longer"]',
 '1',
 'LPS of string s equals LCS of s and its reverse. Common subsequence that reads same both ways.',
 38),

('dynamic-programming', NULL, 'multiple-choice', 'hard',
 'In Palindrome Partitioning II (minimum cuts), what does dp[i] represent?',
 NULL,
 '["Number of palindromes ending at i", "Minimum cuts to partition s[0..i] into palindromes", "Whether s[0..i] is palindrome", "Length of longest palindrome"]',
 '1',
 'dp[i] = minimum cuts needed to partition substring s[0..i] into all palindromes.',
 39),

-- Section 11: Multi-State DP
('dynamic-programming', NULL, 'multiple-choice', 'medium',
 'In Maximum Product Subarray, why do we track both max AND min at each position?',
 NULL,
 '["Performance optimization", "Negative times negative can become positive maximum", "To handle zeros", "Min is not actually needed"]',
 '1',
 'Multiplying by negative flips sign. Current minimum might become maximum after negative multiplication.',
 40),

('dynamic-programming', NULL, 'code-output', 'medium',
 'For nums = [2, 3, -2, 4], what is the maximum product subarray?',
 '// [2, 3] = 6
// Full array = 2*3*(-2)*4 = -48
// Max is 6',
 '["4", "6", "8", "12"]',
 '1',
 'Maximum product is 6 from subarray [2, 3].',
 41),

('dynamic-programming', NULL, 'multiple-choice', 'hard',
 'In Best Time to Buy and Sell Stock with Cooldown, what are the states?',
 NULL,
 '["Just holding or not holding", "Hold, Sold (just sold), Rest (cooldown)", "Buy and Sell only", "One state is enough"]',
 '1',
 'Three states: Hold (have stock), Sold (just sold, must cooldown), Rest (can buy tomorrow).',
 42),

('dynamic-programming', NULL, 'multiple-choice', 'hard',
 'In Best Time to Buy and Sell Stock III (at most 2 transactions), how many states?',
 NULL,
 '["2 states", "4 states: buy1, sell1, buy2, sell2", "Just track profit", "Depends on prices"]',
 '1',
 'Track 4 states: profit after first buy, first sell, second buy, second sell.',
 43),

-- Section 12: Tree DP
('dynamic-programming', NULL, 'multiple-choice', 'hard',
 'In Tree DP, what is the typical traversal order?',
 NULL,
 '["Pre-order (top to bottom)", "Post-order (bottom to top, children before parent)", "Level order", "Any order works"]',
 '1',
 'Process children first, then combine results at parent. Post-order ensures children computed before parent.',
 44),

('dynamic-programming', NULL, 'multiple-choice', 'hard',
 'In House Robber III (tree structure), what does dp[node] represent?',
 NULL,
 '["Maximum money robbing subtree rooted at node", "Pair: (max if rob node, max if skip node)", "Just whether to rob", "Sum of all nodes"]',
 '1',
 'Return pair for each node: (max if we rob this node, max if we skip this node). Parent combines based on constraint.',
 45),

('dynamic-programming', NULL, 'code-output', 'hard',
 'For binary tree [3, 2, 3, null, 3, null, 1], what is maximum we can rob without adjacent?',
 '//     3
//    / \
//   2   3
//    \   \
//     3   1
// Option 1: Rob root (3) + grandchildren (3 + 1) = 7
// Option 2: Skip root, rob children (2 + 3) + their children if any
// But 2 and its child 3 are adjacent, so cant rob both
// Best: 3 (root) + 3 + 1 = 7',
 '["6", "7", "8", "9"]',
 '1',
 'Rob root (3) and grandchildren (3 and 1) = 7. Cannot rob adjacent nodes.',
 46),

('dynamic-programming', NULL, 'multiple-choice', 'hard',
 'In Binary Tree Maximum Path Sum, why might a path NOT go through a node to both children?',
 NULL,
 '["Not allowed by problem", "We might take max of left or right path only, not both", "Children are always included", "Path must include all nodes"]',
 '1',
 'A path through both children uses this node as "turn point". But answer might be entirely in one subtree.',
 47),

-- Section 13: Bitmask DP
('dynamic-programming', NULL, 'multiple-choice', 'hard',
 'When should we use Bitmask DP?',
 NULL,
 '["When n is small (usually n <= 20) and we track subset of items", "For any array problem", "When we need O(1) space", "Only for bit manipulation problems"]',
 '0',
 'Bitmask DP useful when n is small and we need to track which subset of items used. State space is 2^n.',
 48),

('dynamic-programming', NULL, 'multiple-choice', 'hard',
 'In Traveling Salesman Problem with bitmask, what does dp[mask][i] represent?',
 NULL,
 '["Distance from city i", "Min cost to visit cities in mask, ending at city i", "Whether city i is visited", "Number of cities visited"]',
 '1',
 'dp[mask][i] = minimum cost to visit exactly the cities in bitmask, currently at city i.',
 49),

('dynamic-programming', NULL, 'code-output', 'hard',
 'How many states in Bitmask DP for n = 5 cities with ending position?',
 '// mask: 2^5 = 32 possible subsets
// ending position: 5 cities
// Total: 32 * 5 = 160 states',
 '["32", "64", "160", "320"]',
 '2',
 '2^n masks times n ending positions = 2^5 * 5 = 160 states.',
 50),

('dynamic-programming', NULL, 'multiple-choice', 'hard',
 'How do we check if bit i is set in mask?',
 NULL,
 '["mask & i", "mask & (1 << i)", "mask | i", "mask >> i"]',
 '1',
 'Use (mask & (1 << i)) != 0 to check if bit at position i is set.',
 51),

('dynamic-programming', NULL, 'multiple-choice', 'hard',
 'How do we set bit i in mask?',
 NULL,
 '["mask + i", "mask | (1 << i)", "mask & (1 << i)", "mask ^ i"]',
 '1',
 'Use mask | (1 << i) to turn on bit at position i.',
 52),

-- Section 14: Pattern Recognition
('dynamic-programming', NULL, 'multiple-choice', 'medium',
 'When you see "count the number of ways", what DP type is likely?',
 NULL,
 '["Min/Max DP", "Counting DP with addition", "Boolean DP", "Cannot use DP"]',
 '1',
 'Counting problems use addition: dp[i] = sum of dp[j] for all valid transitions.',
 53),

('dynamic-programming', NULL, 'multiple-choice', 'medium',
 'When you see "minimum cost" or "maximum profit", what operation combines subproblems?',
 NULL,
 '["Addition", "Multiplication", "Min or Max", "XOR"]',
 '2',
 'Optimization problems use min() or max() to choose best subproblem result.',
 54),

('dynamic-programming', NULL, 'multiple-choice', 'medium',
 'Which problem type suggests 0/1 Knapsack pattern?',
 NULL,
 '["Counting paths in grid", "Partition into equal subsets", "Finding longest palindrome", "Sorting elements"]',
 '1',
 'Partition Equal Subset Sum is classic 0/1 Knapsack: can we select subset summing to target?',
 55),

('dynamic-programming', NULL, 'multiple-choice', 'medium',
 'Which pattern fits "compare two strings character by character"?',
 NULL,
 '["1D DP", "2D DP on two sequences (like LCS/Edit Distance)", "Tree DP", "Bitmask DP"]',
 '1',
 'Two sequence comparison uses 2D DP: dp[i][j] considers prefixes s1[0..i-1] and s2[0..j-1].',
 56),

-- Section 15: Space Optimization
('dynamic-programming', NULL, 'multiple-choice', 'hard',
 'When can we reduce 2D DP space to 1D?',
 NULL,
 '["Always", "When dp[i][j] only depends on dp[i-1][...] (previous row only)", "When problem is simple", "Never"]',
 '1',
 'If current row only needs previous row, use 1D array and overwrite in correct order.',
 57),

('dynamic-programming', NULL, 'identify-bug', 'medium',
 'What is wrong with this Coin Change code?',
 'function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(0);  // Bug here
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
 58),

-- Section 16: Word Break
('dynamic-programming', NULL, 'multiple-choice', 'medium',
 'In Word Break, what does dp[i] represent?',
 NULL,
 '["Number of words ending at i", "Whether s[0..i-1] can be segmented into dictionary words", "Length of longest word at i", "Index of last word"]',
 '1',
 'dp[i] = true if substring s[0..i-1] can be broken into valid dictionary words.',
 59),

('dynamic-programming', NULL, 'code-output', 'medium',
 'For s = "leetcode" and wordDict = ["leet", "code"], can the string be segmented?',
 '// "leet" + "code" = "leetcode"
// dp[4] = true (leet), dp[8] = true (code)',
 '["true", "false"]',
 '0',
 '"leetcode" = "leet" + "code". Both are in dictionary.',
 60),

-- Additional questions for comprehensive coverage

('dynamic-programming', NULL, 'true-false', 'medium',
 'In DP, top-down (memoization) and bottom-up (tabulation) always produce the same result.',
 NULL,
 NULL,
 'true',
 'Both approaches solve same recurrence. Top-down may skip unreachable states; bottom-up computes all.',
 61),

('dynamic-programming', NULL, 'multiple-choice', 'hard',
 'What is the time complexity of Interval DP (like Matrix Chain Multiplication)?',
 NULL,
 '["O(n)", "O(n^2)", "O(n^3)", "O(2^n)"]',
 '2',
 'O(n^2) intervals times O(n) split points per interval = O(n^3).',
 62),

('dynamic-programming', NULL, 'multiple-choice', 'medium',
 'In Decode Ways, if current digit is 0, what happens?',
 NULL,
 '["dp[i] = dp[i-1]", "dp[i] = 0 (invalid unless paired with 1 or 2)", "dp[i] = dp[i-2]", "Skip this digit"]',
 '1',
 '0 alone is invalid. Only valid if previous digit is 1 or 2 (forming 10 or 20).',
 63),

('dynamic-programming', NULL, 'code-output', 'medium',
 'For Decode Ways with s = "226", how many ways to decode?',
 '// "226" can be decoded as:
// 2-2-6 -> "BBF"
// 22-6 -> "VF"
// 2-26 -> "BZ"
// Total: 3 ways',
 '["2", "3", "4", "5"]',
 '1',
 'Three decodings: (2,2,6), (22,6), (2,26).',
 64),

('dynamic-programming', NULL, 'multiple-choice', 'hard',
 'In Regular Expression Matching with DP, what does dp[i][j] mean?',
 NULL,
 '["Length of match", "Whether s[0..i-1] matches pattern p[0..j-1]", "Number of ways to match", "Index of match"]',
 '1',
 'dp[i][j] = true if first i characters of s match first j characters of pattern p.',
 65),

-- Section 17: Expand Around Center (Palindrome Substring)
('dynamic-programming', NULL, 'multiple-choice', 'medium',
 'What is the key idea of Expand Around Center for palindrome substrings?',
 NULL,
 '["Use DP table", "Treat each index (and gap) as potential center, expand outward", "Sort the string first", "Use recursion"]',
 '1',
 'For each possible center (n centers for odd length, n-1 for even), expand while characters match.',
 66),

('dynamic-programming', NULL, 'multiple-choice', 'medium',
 'What is the time complexity of Expand Around Center for Longest Palindromic Substring?',
 NULL,
 '["O(n)", "O(n^2)", "O(n^3)", "O(n log n)"]',
 '1',
 'O(n) centers, each expansion takes O(n) worst case. Total O(n^2).',
 67),

('dynamic-programming', NULL, 'multiple-choice', 'medium',
 'How many centers do we check for a string of length n?',
 NULL,
 '["n", "n-1", "2n-1 (n for odd-length, n-1 for even-length)", "n^2"]',
 '2',
 'Odd-length palindromes: n centers (each character). Even-length: n-1 centers (between characters). Total: 2n-1.',
 68),

('dynamic-programming', NULL, 'code-output', 'medium',
 'For string "babad", what is the longest palindromic substring?',
 '// Centers: b, a, b, a, d (odd) + gaps (even)
// Expanding from index 1 (a): "bab"
// Expanding from index 2 (b): "aba"
// Both length 3',
 '["bab or aba", "babad", "aba", "b"]',
 '0',
 'Either "bab" or "aba" is correct. Both are palindromes of length 3.',
 69),

-- Section 18: How DP is Discovered (framework questions)
('dynamic-programming', NULL, 'multiple-choice', 'easy',
 'What is the first step when approaching a DP problem?',
 NULL,
 '["Write code immediately", "Identify if problem has overlapping subproblems", "Sort the input", "Use brute force"]',
 '1',
 'First check if problem has DP properties: overlapping subproblems and optimal substructure.',
 70),

('dynamic-programming', NULL, 'multiple-choice', 'medium',
 'What should you do BEFORE converting recursion to tabulation?',
 NULL,
 '["Write tabulation directly", "Make sure recursive solution with memoization works correctly", "Optimize for space", "Add more base cases"]',
 '1',
 'Always verify recursive solution first. Tabulation is mechanical conversion once recurrence is correct.',
 71),

('dynamic-programming', NULL, 'multiple-choice', 'medium',
 'When defining DP state, what question should you ask?',
 NULL,
 '["How fast can I solve this?", "What is the minimum information I need to make a decision?", "How much memory do I have?", "What is the output format?"]',
 '1',
 'State = minimum info to make optimal decision at current step. Too little = wrong answer. Too much = slow.',
 72),

-- Additional coverage for common problems
('dynamic-programming', NULL, 'multiple-choice', 'medium',
 'In Jump Game, what does dp[i] represent?',
 NULL,
 '["Maximum jump from i", "Whether we can reach index i from start", "Number of ways to reach i", "Minimum jumps to i"]',
 '1',
 'dp[i] = true if we can reach index i starting from index 0.',
 73),

('dynamic-programming', NULL, 'multiple-choice', 'medium',
 'In Triangle problem (minimum path sum), why do we go bottom-up?',
 NULL,
 '["Top-down does not work", "Bottom-up avoids tracking which cell we came from", "It is faster", "Less memory needed"]',
 '1',
 'Going bottom-up: dp[j] = min(dp[j], dp[j+1]) + triangle[i][j]. No need to track path, just propagate minimums up.',
 74),

('dynamic-programming', NULL, 'code-output', 'medium',
 'For Perfect Squares with n = 12, what is the minimum number of perfect squares?',
 '// 12 = 4 + 4 + 4 = 3 squares
// Or 12 = 9 + 1 + 1 + 1 = 4 squares (worse)',
 '["2", "3", "4", "5"]',
 '1',
 'Minimum: 4 + 4 + 4 = 3 perfect squares.',
 75);
