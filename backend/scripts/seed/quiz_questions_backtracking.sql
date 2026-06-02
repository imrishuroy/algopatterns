-- Quiz Questions for Backtracking Pattern
-- Run: psql "postgresql://..." -f scripts/seed/quiz_questions_backtracking.sql

-- Clear existing backtracking questions first
DELETE FROM quiz_questions WHERE pattern_id = 'backtracking';

-- Section: Backtracking Fundamentals
INSERT INTO quiz_questions (pattern_id, section_slug, question_type, difficulty, question_text, code_snippet, options, correct_answer, explanation, display_order) VALUES
('backtracking', NULL, 'multiple-choice', 'easy',
 'What is the core idea of backtracking?',
 NULL,
 '["Sort the input first", "Build solutions incrementally, undo choices that don''t work", "Use dynamic programming", "Always use recursion depth-first"]',
 '1',
 'Backtracking explores paths, abandoning (backtracking from) those that cannot lead to valid solutions.',
 1),

('backtracking', NULL, 'multiple-choice', 'easy',
 'What does "backtrack" mean in backtracking algorithms?',
 NULL,
 '["Restart from the beginning", "Undo the last choice and try the next option", "Skip to the end", "Use memoization"]',
 '1',
 'Backtrack = undo the most recent choice (e.g., pop from path) and try the next alternative.',
 2),

('backtracking', NULL, 'true-false', 'easy',
 'Backtracking always finds all possible solutions.',
 NULL,
 NULL,
 'true',
 'Backtracking exhaustively explores all valid paths, so it finds all solutions (unless pruned intentionally).',
 3),

('backtracking', NULL, 'multiple-choice', 'easy',
 'What is the typical time complexity of generating all subsets?',
 NULL,
 '["O(n)", "O(n log n)", "O(n²)", "O(2^n)"]',
 '3',
 'Each element can be included or excluded: 2 choices × n elements = 2^n subsets.',
 4),

('backtracking', NULL, 'multiple-choice', 'easy',
 'What is the typical time complexity of generating all permutations?',
 NULL,
 '["O(n)", "O(n²)", "O(2^n)", "O(n!)"]',
 '3',
 'Permutations: n choices for first, n-1 for second, ... = n! total arrangements.',
 5),

-- Subsets Questions
('backtracking', NULL, 'code-output', 'medium',
 'For nums = [1, 2], how many subsets are generated?',
 'function subsets(nums) {
  const result = [];
  function backtrack(start, path) {
    result.push([...path]);
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]);
      backtrack(i + 1, path);
      path.pop();
    }
  }
  backtrack(0, []);
  return result;
}',
 '["2", "3", "4", "5"]',
 '2',
 '2^2 = 4 subsets: [], [1], [2], [1,2].',
 6),

('backtracking', NULL, 'multiple-choice', 'medium',
 'In subsets generation, why do we pass "start" index to recursive calls?',
 NULL,
 '["To avoid using the same element twice", "To generate subsets in order and avoid duplicates like [1,2] and [2,1]", "For performance optimization", "It is not necessary"]',
 '1',
 'start ensures we only pick elements after the current one, avoiding duplicate subsets in different orders.',
 7),

('backtracking', NULL, 'code-output', 'medium',
 'In subsets, why do we use result.push([...path]) instead of result.push(path)?',
 NULL,
 '["Performance optimization", "path is modified later; we need a copy of its current state", "JavaScript requirement", "No difference"]',
 '1',
 'path is mutated during backtracking. We must copy it, or all entries in result would reference the same (empty) array.',
 8),

-- Permutations Questions
('backtracking', NULL, 'multiple-choice', 'medium',
 'In permutations, why do we use a "used" array instead of "start" index?',
 NULL,
 '["Performance is better", "We can use any element at any position, but each only once", "It handles duplicates better", "Both approaches work the same"]',
 '1',
 'Permutations can pick any unused element at each step. "used" tracks which elements are already in the current permutation.',
 9),

('backtracking', NULL, 'code-output', 'medium',
 'For nums = [1, 2, 3], how many permutations are generated?',
 NULL,
 '["3", "6", "8", "9"]',
 '1',
 '3! = 6 permutations: [1,2,3], [1,3,2], [2,1,3], [2,3,1], [3,1,2], [3,2,1].',
 10),

('backtracking', NULL, 'identify-bug', 'medium',
 'What is wrong with this permutation code?',
 'function permute(nums) {
  const result = [];
  function backtrack(path, used) {
    if (path.length === nums.length) {
      result.push([...path]);
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      used[i] = true;
      path.push(nums[i]);
      backtrack(path, used);
      path.pop();
      // Missing: used[i] = false;
    }
  }
  backtrack([], new Array(nums.length).fill(false));
  return result;
}',
 '["Missing used[i] = false after recursion (backtrack)", "Should use i+1 instead of i", "path.pop() is wrong", "Base case is incorrect"]',
 '0',
 'Must reset used[i] = false after backtracking, otherwise elements stay "used" for other branches.',
 11),

-- Handling Duplicates
('backtracking', NULL, 'multiple-choice', 'medium',
 'To handle duplicates in subsets/permutations, what should we do first?',
 NULL,
 '["Use a Set", "Sort the input array", "Skip every other element", "Use a different algorithm"]',
 '1',
 'Sorting groups duplicates together, making it easy to skip them with: if (i > start && nums[i] === nums[i-1]) continue.',
 12),

('backtracking', NULL, 'code-output', 'medium',
 'For nums = [1, 2, 2], how many unique subsets exist?',
 '// Sort: [1, 2, 2]
// Skip duplicate: if (i > start && nums[i] === nums[i-1]) continue',
 '["4", "5", "6", "8"]',
 '2',
 'Unique subsets: [], [1], [2], [1,2], [2,2], [1,2,2]. That''s 6 subsets.',
 13),

('backtracking', NULL, 'multiple-choice', 'hard',
 'In Permutations II (with duplicates), when do we skip?',
 NULL,
 '["if nums[i] === nums[i-1]", "if nums[i] === nums[i-1] && !used[i-1]", "if used[i]", "if i > 0"]',
 '1',
 'Skip if same as previous AND previous is not used. This ensures we use duplicates in order, avoiding duplicate permutations.',
 14),

-- Combination Sum
('backtracking', NULL, 'multiple-choice', 'medium',
 'In Combination Sum (elements can be reused), what changes in the recursive call?',
 NULL,
 '["Use i+1 as start", "Use i as start (not i+1)", "Use 0 as start", "No recursive call needed"]',
 '1',
 'Pass i (not i+1) to allow reusing the same element. For no reuse, pass i+1.',
 15),

('backtracking', NULL, 'code-output', 'medium',
 'For candidates = [2, 3] and target = 6, how many combinations sum to 6?',
 '// [2,2,2] = 6
// [3,3] = 6',
 '["1", "2", "3", "4"]',
 '1',
 'Two combinations: [2,2,2] and [3,3].',
 16),

('backtracking', NULL, 'multiple-choice', 'medium',
 'When should we prune (stop early) in Combination Sum?',
 NULL,
 '["When target becomes 0", "When remaining target < 0", "When index exceeds array length", "All of the above"]',
 '3',
 'Prune when: target < 0 (overshot), index out of bounds, or optionally when current element > remaining (if sorted).',
 17),

-- N-Queens
('backtracking', NULL, 'multiple-choice', 'hard',
 'In N-Queens, what constraints must we check before placing a queen?',
 NULL,
 '["Same row only", "Same column, same diagonal, same anti-diagonal", "Adjacent cells only", "Same row and column only"]',
 '1',
 'Queens attack on rows, columns, and both diagonals. Check all three (row is implicitly safe if we place one per row).',
 18),

('backtracking', NULL, 'code-output', 'hard',
 'For 4-Queens, how many valid solutions exist?',
 NULL,
 '["0", "1", "2", "4"]',
 '2',
 'The 4-Queens problem has exactly 2 distinct solutions.',
 19),

('backtracking', NULL, 'multiple-choice', 'hard',
 'How do we efficiently check diagonal attacks in N-Queens?',
 NULL,
 '["Check all previous queens each time", "Use sets: col + row for one diagonal, col - row for other", "Use 2D array", "Diagonals cannot be checked efficiently"]',
 '1',
 'All cells on a diagonal have the same (row - col) or (row + col). Store these in sets for O(1) lookup.',
 20),

-- Word Search / Grid Backtracking
('backtracking', NULL, 'multiple-choice', 'medium',
 'In Word Search (find word in grid), how do we avoid revisiting cells?',
 NULL,
 '["Use a visited matrix", "Temporarily mark the cell (e.g., ''#''), restore after", "Both work", "Cannot avoid revisiting"]',
 '2',
 'Both work. In-place marking saves space. Key: mark before recursing, restore after (backtrack).',
 21),

('backtracking', NULL, 'identify-bug', 'hard',
 'What is wrong with this Word Search code?',
 'function exist(board, word) {
  function dfs(i, j, k) {
    if (k === word.length) return true;
    if (i < 0 || i >= board.length || j < 0 || j >= board[0].length) return false;
    if (board[i][j] !== word[k]) return false;

    // Missing: mark as visited
    const result = dfs(i+1,j,k+1) || dfs(i-1,j,k+1) || dfs(i,j+1,k+1) || dfs(i,j-1,k+1);
    // Missing: unmark
    return result;
  }
  // ... starting loop
}',
 '["Missing visited marking - same cell can be used multiple times", "Base case is wrong", "Boundary check is wrong", "DFS directions are wrong"]',
 '0',
 'Without marking visited, the same cell can be revisited in the same path, giving wrong results.',
 22),

-- Generate Parentheses
('backtracking', NULL, 'multiple-choice', 'medium',
 'In Generate Parentheses, what are the two key constraints?',
 NULL,
 '["Total length and balance", "Open count <= n AND close count <= open count", "Equal opens and closes", "No consecutive same type"]',
 '1',
 'Can add ''('' if open < n. Can add '')'' only if close < open (ensures balance).',
 23),

('backtracking', NULL, 'code-output', 'medium',
 'For n = 2, how many valid parentheses combinations exist?',
 '// n = 2 means 2 pairs of parentheses
// Valid: "(())", "()()"',
 '["1", "2", "3", "4"]',
 '1',
 'For n=2: "(())" and "()()". Two valid combinations.',
 24),

-- Palindrome Partitioning
('backtracking', NULL, 'multiple-choice', 'hard',
 'In Palindrome Partitioning, what do we try at each step?',
 NULL,
 '["All possible characters", "All possible substrings starting from current index that are palindromes", "Only single characters", "Pairs of characters"]',
 '1',
 'Try each prefix starting at current index. If it''s a palindrome, add it and recurse on the rest.',
 25),

('backtracking', NULL, 'code-output', 'hard',
 'For string "aab", what are the palindrome partitions?',
 '// Partitions where each part is a palindrome
// "a" + "a" + "b"
// "aa" + "b"',
 '["1 partition", "2 partitions", "3 partitions", "4 partitions"]',
 '1',
 'Two partitions: ["a","a","b"] and ["aa","b"].',
 26),

-- Optimization and Pruning
('backtracking', NULL, 'multiple-choice', 'medium',
 'What is "pruning" in backtracking?',
 NULL,
 '["Removing elements from array", "Stopping early when current path cannot lead to valid solution", "Using memoization", "Sorting the input"]',
 '1',
 'Pruning = cutting off search branches early when we know they won''t yield valid solutions. Improves efficiency.',
 27),

('backtracking', NULL, 'true-false', 'medium',
 'Backtracking can be optimized with memoization when subproblems overlap.',
 NULL,
 NULL,
 'true',
 'If same state is reached multiple times, memoization avoids recomputation. This bridges to dynamic programming.',
 28),

('backtracking', NULL, 'multiple-choice', 'hard',
 'In Combination Sum, how can we prune more aggressively?',
 NULL,
 '["Sort candidates; if current > remaining, break (larger ones won''t work either)", "Skip odd numbers", "Only use first half of array", "Pruning not possible"]',
 '0',
 'Sort first. If candidates[i] > remaining, all subsequent (larger) candidates are also too big. Break the loop.',
 29),

('backtracking', NULL, 'identify-bug', 'medium',
 'What is wrong with this subsets code?',
 'function subsets(nums) {
  const result = [];
  function backtrack(start, path) {
    result.push(path);  // Bug here
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]);
      backtrack(i + 1, path);
      path.pop();
    }
  }
  backtrack(0, []);
  return result;
}',
 '["Should push [...path] (copy), not path reference", "start should be 0 always", "pop() should be before recursive call", "Base case is missing"]',
 '0',
 'Pushing path directly means all entries reference the same array. After backtracking, all become empty. Use [...path].',
 30);
