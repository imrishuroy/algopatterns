-- Quiz Questions for Backtracking Pattern
-- Run: psql "$DATABASE_URL" -f scripts/seed/quiz_questions_backtracking.sql
-- Total: 50 questions covering all 18 sections

-- Clear existing backtracking questions first
DELETE FROM quiz_questions WHERE pattern_id = 'backtracking';

-- ============================================================
-- Section 1-2: Backtracking Fundamentals & Template
-- ============================================================
INSERT INTO quiz_questions (pattern_id, section_slug, question_type, difficulty, question_text, code_snippet, options, correct_answer, explanation, display_order) VALUES
('backtracking', 'what-is-backtracking', 'multiple-choice', 'easy',
 'What is the core idea of backtracking?',
 NULL,
 '["Sort the input first", "Build solutions incrementally, undo choices that don''t work", "Use dynamic programming", "Always use recursion depth-first"]',
 '1',
 'Backtracking explores paths, abandoning (backtracking from) those that cannot lead to valid solutions.',
 1),

('backtracking', 'what-is-backtracking', 'multiple-choice', 'easy',
 'What does "backtrack" mean in backtracking algorithms?',
 NULL,
 '["Restart from the beginning", "Undo the last choice and try the next option", "Skip to the end", "Use memoization"]',
 '1',
 'Backtrack = undo the most recent choice (e.g., pop from path) and try the next alternative.',
 2),

('backtracking', 'the-universal-backtracking-template', 'multiple-choice', 'easy',
 'What are the three steps in the backtracking template?',
 NULL,
 '["Start, Middle, End", "Choose, Explore, Unchoose", "Push, Pop, Return", "Init, Loop, Exit"]',
 '1',
 'The universal template is CHOOSE (make a decision), EXPLORE (recurse), UNCHOOSE (undo the decision).',
 3),

('backtracking', 'the-universal-backtracking-template', 'identify-bug', 'medium',
 'What is wrong with this backtracking code?',
 'function backtrack(path) {
    if (isGoal(path)) {
        result.push(path);  // BUG
        return;
    }
    for (const choice of choices) {
        path.push(choice);
        backtrack(path);
        path.pop();
    }
}',
 '["Missing [...path] - pushing reference instead of copy", "Missing return statement", "Loop is wrong", "Base case is wrong"]',
 '0',
 'Pushing path directly means all results reference the same array. Use [...path] or path.slice() to copy.',
 4),

-- ============================================================
-- Section 3: Subsets
-- ============================================================
('backtracking', 'subsets-power-set', 'code-output', 'medium',
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
 5),

('backtracking', 'subsets-power-set', 'multiple-choice', 'medium',
 'In subsets generation, why do we pass "start" index to recursive calls?',
 NULL,
 '["To avoid using the same element twice", "To generate subsets in order and avoid duplicates like [1,2] and [2,1]", "For performance optimization", "It is not necessary"]',
 '1',
 'start ensures we only pick elements after the current one, avoiding duplicate subsets in different orders.',
 6),

('backtracking', 'subsets-power-set', 'multiple-choice', 'easy',
 'What is the time complexity of generating all subsets?',
 NULL,
 '["O(n)", "O(n log n)", "O(n²)", "O(2^n)"]',
 '3',
 'Each element can be included or excluded: 2 choices × n elements = 2^n subsets.',
 7),

-- ============================================================
-- Section 4: Permutations
-- ============================================================
('backtracking', 'permutations-all-orderings', 'multiple-choice', 'medium',
 'In permutations, why do we use a "used" array instead of "start" index?',
 NULL,
 '["Performance is better", "We can use any element at any position, but each only once", "It handles duplicates better", "Both approaches work the same"]',
 '1',
 'Permutations can pick any unused element at each step. "used" tracks which elements are already in the current permutation.',
 8),

('backtracking', 'permutations-all-orderings', 'code-output', 'medium',
 'For nums = [1, 2, 3], how many permutations are generated?',
 NULL,
 '["3", "6", "8", "9"]',
 '1',
 '3! = 6 permutations: [1,2,3], [1,3,2], [2,1,3], [2,3,1], [3,1,2], [3,2,1].',
 9),

('backtracking', 'permutations-all-orderings', 'identify-bug', 'medium',
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
 10),

-- ============================================================
-- Section 5: Combinations
-- ============================================================
('backtracking', 'combinations-choose-k-from-n', 'multiple-choice', 'medium',
 'What is the key difference between Combinations and Subsets?',
 NULL,
 '["Combinations use a loop, Subsets don''t", "Combinations have a fixed size k, Subsets include all sizes", "Combinations allow duplicates", "No difference"]',
 '1',
 'Combinations C(n,k) requires exactly k elements. Subsets includes all 2^n combinations of any size.',
 11),

('backtracking', 'combinations-choose-k-from-n', 'code-output', 'medium',
 'For n=4, k=2, how many combinations exist?',
 NULL,
 '["4", "6", "8", "12"]',
 '1',
 'C(4,2) = 4!/(2!×2!) = 6 combinations: [1,2], [1,3], [1,4], [2,3], [2,4], [3,4].',
 12),

-- ============================================================
-- Section 6: Letter Combinations of Phone Number
-- ============================================================
('backtracking', 'letter-combinations-of-a-phone-number', 'multiple-choice', 'medium',
 'In Letter Combinations of Phone Number, what determines the number of results?',
 NULL,
 '["Length of input digits", "Product of letters per digit (e.g., 3×3×4 for \"237\")", "Sum of letters per digit", "Always 26^n"]',
 '1',
 'Each digit maps to 3-4 letters. Total = product of letter counts for each digit.',
 13),

('backtracking', 'letter-combinations-of-a-phone-number', 'code-output', 'medium',
 'For digits = "23", how many letter combinations exist?',
 '// 2 -> "abc" (3 letters)
// 3 -> "def" (3 letters)',
 '["6", "8", "9", "12"]',
 '2',
 '3 × 3 = 9 combinations: ad, ae, af, bd, be, bf, cd, ce, cf.',
 14),

-- ============================================================
-- Section 7: Handling Duplicates
-- ============================================================
('backtracking', 'handling-duplicates', 'multiple-choice', 'medium',
 'To handle duplicates in subsets/permutations, what should we do first?',
 NULL,
 '["Use a Set", "Sort the input array", "Skip every other element", "Use a different algorithm"]',
 '1',
 'Sorting groups duplicates together, making it easy to skip them with: if (i > start && nums[i] === nums[i-1]) continue.',
 15),

('backtracking', 'handling-duplicates', 'code-output', 'medium',
 'For nums = [1, 2, 2], how many unique subsets exist?',
 '// Sort: [1, 2, 2]
// Skip duplicate: if (i > start && nums[i] === nums[i-1]) continue',
 '["4", "5", "6", "8"]',
 '2',
 'Unique subsets: [], [1], [2], [1,2], [2,2], [1,2,2]. That''s 6 subsets.',
 16),

('backtracking', 'handling-duplicates', 'multiple-choice', 'hard',
 'In Permutations II (with duplicates), when do we skip?',
 NULL,
 '["if nums[i] === nums[i-1]", "if nums[i] === nums[i-1] && !used[i-1]", "if used[i]", "if i > 0"]',
 '1',
 'Skip if same as previous AND previous is not used. This ensures we use duplicates in order.',
 17),

('backtracking', 'handling-duplicates', 'multiple-choice', 'medium',
 'Why is the condition "i > start" important in duplicate skipping?',
 NULL,
 '["Performance optimization", "Ensures we use the first occurrence, skip the rest at same level", "Prevents infinite loops", "Not actually necessary"]',
 '1',
 'i > start means we are not at the first element of this decision level, so we can safely skip duplicates.',
 18),

-- ============================================================
-- Section 8: Combination Sum
-- ============================================================
('backtracking', 'combination-sum-problems', 'multiple-choice', 'medium',
 'In Combination Sum (elements can be reused), what changes in the recursive call?',
 NULL,
 '["Use i+1 as start", "Use i as start (not i+1)", "Use 0 as start", "No recursive call needed"]',
 '1',
 'Pass i (not i+1) to allow reusing the same element. For no reuse, pass i+1.',
 19),

('backtracking', 'combination-sum-problems', 'code-output', 'medium',
 'For candidates = [2, 3] and target = 6, how many combinations sum to 6?',
 '// [2,2,2] = 6
// [3,3] = 6',
 '["1", "2", "3", "4"]',
 '1',
 'Two combinations: [2,2,2] and [3,3].',
 20),

('backtracking', 'combination-sum-problems', 'multiple-choice', 'medium',
 'In Combination Sum II (no reuse, with duplicates), what two things must we do?',
 NULL,
 '["Sort and use i+1", "Sort and skip duplicates with i > start check", "Use a Set", "Nothing special"]',
 '1',
 'Sort to group duplicates, skip with i > start && nums[i] === nums[i-1], and use i+1 to prevent reuse.',
 21),

-- ============================================================
-- Section 9: Grid Backtracking - Word Search
-- ============================================================
('backtracking', 'grid-backtracking-word-search', 'multiple-choice', 'medium',
 'In Word Search (find word in grid), how do we avoid revisiting cells?',
 NULL,
 '["Use a visited matrix", "Temporarily mark the cell (e.g., ''#''), restore after", "Both work", "Cannot avoid revisiting"]',
 '2',
 'Both work. In-place marking saves space. Key: mark before recursing, restore after (backtrack).',
 22),

('backtracking', 'grid-backtracking-word-search', 'identify-bug', 'hard',
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
}',
 '["Missing visited marking - same cell can be used multiple times", "Base case is wrong", "Boundary check is wrong", "DFS directions are wrong"]',
 '0',
 'Without marking visited, the same cell can be revisited in the same path, giving wrong results.',
 23),

('backtracking', 'grid-backtracking-word-search', 'multiple-choice', 'medium',
 'What is the time complexity of Word Search?',
 NULL,
 '["O(m×n)", "O(m×n×4^L) where L is word length", "O(4^(m×n))", "O(L)"]',
 '1',
 'We start from each cell (m×n) and explore up to 4 directions for L characters.',
 24),

-- ============================================================
-- Section 10: N-Queens
-- ============================================================
('backtracking', 'n-queens', 'multiple-choice', 'hard',
 'In N-Queens, what constraints must we check before placing a queen?',
 NULL,
 '["Same row only", "Same column, same diagonal, same anti-diagonal", "Adjacent cells only", "Same row and column only"]',
 '1',
 'Queens attack on rows, columns, and both diagonals. Check all three (row is implicitly safe if we place one per row).',
 25),

('backtracking', 'n-queens', 'code-output', 'hard',
 'For 4-Queens, how many valid solutions exist?',
 NULL,
 '["0", "1", "2", "4"]',
 '2',
 'The 4-Queens problem has exactly 2 distinct solutions.',
 26),

('backtracking', 'n-queens', 'multiple-choice', 'hard',
 'How do we efficiently check diagonal attacks in N-Queens?',
 NULL,
 '["Check all previous queens each time", "Use sets: (row - col) for main diagonal, (row + col) for anti-diagonal", "Use 2D array", "Diagonals cannot be checked efficiently"]',
 '1',
 'All cells on a diagonal have the same (row - col) or (row + col). Store these in sets for O(1) lookup.',
 27),

('backtracking', 'n-queens', 'code-output', 'medium',
 'For N=8, how many valid N-Queens solutions exist?',
 NULL,
 '["12", "40", "92", "120"]',
 '2',
 'The 8-Queens problem has exactly 92 distinct solutions.',
 28),

-- ============================================================
-- Section 11: Sudoku Solver
-- ============================================================
('backtracking', 'sudoku-solver', 'multiple-choice', 'hard',
 'In Sudoku Solver, what constraints must each number satisfy?',
 NULL,
 '["Unique in row only", "Unique in row, column, and 3x3 box", "Unique in diagonal", "No constraints"]',
 '1',
 'Each number 1-9 must be unique in its row, column, and 3×3 sub-box.',
 29),

('backtracking', 'sudoku-solver', 'multiple-choice', 'hard',
 'What is the time complexity of Sudoku Solver in worst case?',
 NULL,
 '["O(81)", "O(9^81)", "O(9^empty_cells)", "O(n²)"]',
 '2',
 'Each empty cell has up to 9 choices. With constraint propagation, practical performance is much better.',
 30),

('backtracking', 'sudoku-solver', 'multiple-choice', 'medium',
 'How do we find the 3x3 box index from row and column?',
 NULL,
 '["row + col", "row * 3 + col", "Math.floor(row/3) * 3 + Math.floor(col/3)", "(row % 3) + (col % 3)"]',
 '2',
 'Integer division by 3 gives the box row/col, then combine: Math.floor(row/3)*3 + Math.floor(col/3).',
 31),

-- ============================================================
-- Section 12: Restore IP Addresses
-- ============================================================
('backtracking', 'restore-ip-addresses', 'multiple-choice', 'medium',
 'What are the constraints for a valid IP segment?',
 NULL,
 '["Any number", "0-255 with no leading zeros (except \"0\" itself)", "Only single digits", "Must be even"]',
 '1',
 'Each segment must be 0-255. Leading zeros are invalid (\"01\" is not valid, but \"0\" is).',
 32),

('backtracking', 'restore-ip-addresses', 'code-output', 'medium',
 'For string \"25525511135\", how many valid IP addresses can be formed?',
 NULL,
 '["1", "2", "3", "4"]',
 '1',
 'Two valid IPs: \"255.255.11.135\" and \"255.255.111.35\".',
 33),

('backtracking', 'restore-ip-addresses', 'multiple-choice', 'medium',
 'What is the minimum and maximum length for a valid IP string?',
 NULL,
 '["1-10", "4-12", "8-16", "Any length"]',
 '1',
 'Minimum: 4 digits (1.1.1.1). Maximum: 12 digits (255.255.255.255).',
 34),

-- ============================================================
-- Section 13: Generate Parentheses
-- ============================================================
('backtracking', 'generate-parentheses', 'multiple-choice', 'medium',
 'In Generate Parentheses, what are the two key constraints?',
 NULL,
 '["Total length and balance", "Open count <= n AND close count <= open count", "Equal opens and closes", "No consecutive same type"]',
 '1',
 'Can add ''('' if open < n. Can add '')'' only if close < open (ensures balance).',
 35),

('backtracking', 'generate-parentheses', 'code-output', 'medium',
 'For n = 3, how many valid parentheses combinations exist?',
 NULL,
 '["3", "4", "5", "6"]',
 '2',
 'The nth Catalan number. For n=3: 5 combinations.',
 36),

('backtracking', 'generate-parentheses', 'multiple-choice', 'medium',
 'Why is Generate Parentheses different from other backtracking problems?',
 NULL,
 '["It uses DP", "No loop - just 2 conditional decisions (add \"(\" or \")\")", "It requires sorting", "It uses BFS"]',
 '1',
 'Instead of looping through choices, we have exactly 2 conditional branches: add \"(\" if open < n, add \")\" if close < open.',
 37),

-- ============================================================
-- Section 14: Palindrome Partitioning
-- ============================================================
('backtracking', 'palindrome-partitioning', 'multiple-choice', 'hard',
 'In Palindrome Partitioning, what do we try at each step?',
 NULL,
 '["All possible characters", "All possible prefixes starting from current index that are palindromes", "Only single characters", "Pairs of characters"]',
 '1',
 'Try each prefix starting at current index. If it''s a palindrome, add it and recurse on the rest.',
 38),

('backtracking', 'palindrome-partitioning', 'code-output', 'hard',
 'For string \"aab\", how many palindrome partitions exist?',
 NULL,
 '["1", "2", "3", "4"]',
 '1',
 'Two partitions: [\"a\",\"a\",\"b\"] and [\"aa\",\"b\"].',
 39),

-- ============================================================
-- Section 15: Pruning Techniques
-- ============================================================
('backtracking', 'pruning-techniques', 'multiple-choice', 'medium',
 'What is "pruning" in backtracking?',
 NULL,
 '["Removing elements from array", "Stopping early when current path cannot lead to valid solution", "Using memoization", "Sorting the input"]',
 '1',
 'Pruning = cutting off search branches early when we know they won''t yield valid solutions.',
 40),

('backtracking', 'pruning-techniques', 'multiple-choice', 'hard',
 'In Combination Sum, why do we use "break" instead of "continue" when candidate > remaining?',
 NULL,
 '["No difference", "Break is faster", "Array is sorted, so all remaining candidates are also too large", "Continue is actually correct"]',
 '2',
 'With sorted input, if candidates[i] > remaining, all subsequent elements are larger too. Break stops the entire loop.',
 41),

('backtracking', 'pruning-techniques', 'multiple-choice', 'medium',
 'Why must we sort the array before using the break optimization?',
 NULL,
 '["Sorting is always required", "Sorting ensures larger elements come after smaller ones", "Sorting removes duplicates", "Sorting is optional"]',
 '1',
 'Sorting guarantees that once we find a candidate too large, ALL remaining candidates are also too large.',
 42),

('backtracking', 'pruning-techniques', 'true-false', 'medium',
 'Pruning changes the worst-case time complexity of backtracking.',
 NULL,
 NULL,
 'false',
 'Pruning improves average-case performance dramatically but doesn''t change worst-case complexity (still exponential).',
 43),

-- ============================================================
-- Section 16: Quick Reference
-- ============================================================
('backtracking', 'quick-reference', 'multiple-choice', 'medium',
 'Which pattern uses a "used[]" array for tracking?',
 NULL,
 '["Subsets", "Combinations", "Permutations", "Combination Sum"]',
 '2',
 'Permutations need to track which elements are currently in the path, using a used[] array.',
 44),

('backtracking', 'quick-reference', 'multiple-choice', 'medium',
 'When should you use backtracking vs dynamic programming?',
 NULL,
 '["Backtracking for counting, DP for generating", "Backtracking for generating ALL solutions, DP for counting or finding ONE optimal", "They are interchangeable", "DP is always better"]',
 '1',
 'Backtracking generates all solutions (exponential). DP counts or finds optimal solutions (polynomial).',
 45),

-- ============================================================
-- Section 17: UMPIRE Method
-- ============================================================
('backtracking', 'umpire-method', 'multiple-choice', 'easy',
 'What does UMPIRE stand for in interview problem-solving?',
 NULL,
 '["Understand, Match, Plan, Implement, Review, Evaluate", "Use, Modify, Program, Iterate, Return, Exit", "Understand, Memorize, Practice, Improve, Repeat, Excel", "None of these"]',
 '0',
 'UMPIRE: Understand the problem, Match to pattern, Plan approach, Implement code, Review with examples, Evaluate complexity.',
 46),

('backtracking', 'umpire-method', 'multiple-choice', 'medium',
 'In the UNDERSTAND phase, what should you NOT assume?',
 NULL,
 '["Input is always valid", "There are no duplicates unless stated", "Both A and B", "You should assume everything"]',
 '2',
 'Never assume. Ask clarifying questions about duplicates, empty input, constraints, etc.',
 47),

-- ============================================================
-- Section 18: Common Mistakes
-- ============================================================
('backtracking', 'common-mistakes', 'identify-bug', 'medium',
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
 'Pushing path directly means all entries reference the same array. After backtracking, all become empty.',
 48),

('backtracking', 'common-mistakes', 'multiple-choice', 'medium',
 'Your permutations code runs forever. What is likely wrong?',
 NULL,
 '["Missing base case", "Missing path.pop() or used[i] = false (backtrack step)", "Wrong loop bounds", "Too much recursion"]',
 '1',
 'Infinite loop usually means forgetting to undo choices. Both path.pop() and used[i] = false are needed.',
 49),

('backtracking', 'common-mistakes', 'multiple-choice', 'medium',
 'Your Word Search works once but fails on subsequent searches. What is wrong?',
 NULL,
 '["Missing boundary checks", "Not restoring grid cells after DFS", "Wrong character comparison", "Missing base case"]',
 '1',
 'If you mark cells with ''#'' but don''t restore them, the grid is corrupted for future searches.',
 50);
