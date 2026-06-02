-- Quiz Questions for Union-Find Pattern
-- Run: psql "postgresql://..." -f scripts/seed/quiz_questions_union_find.sql

-- Clear existing union-find questions first
DELETE FROM quiz_questions WHERE pattern_id = 'union-find';

-- Section: Union-Find Fundamentals
INSERT INTO quiz_questions (pattern_id, section_slug, question_type, difficulty, question_text, code_snippet, options, correct_answer, explanation, display_order) VALUES
('union-find', NULL, 'multiple-choice', 'easy',
 'What are the two main operations in Union-Find?',
 NULL,
 '["Insert and Delete", "Find and Union", "Push and Pop", "Add and Remove"]',
 '1',
 'Union-Find supports Find (which set contains element) and Union (merge two sets).',
 1),

('union-find', NULL, 'multiple-choice', 'easy',
 'What does the parent array represent in Union-Find?',
 NULL,
 '["The child of each element", "The element that each node points to (toward root)", "The rank of each element", "The size of each set"]',
 '1',
 'parent[i] points to i''s parent. Following parent pointers leads to the root (set representative).',
 2),

('union-find', NULL, 'code-output', 'easy',
 'After initializing UnionFind(5), what is parent[3]?',
 'constructor(n) {
  this.parent = Array.from({length: n}, (_, i) => i);
  // parent = [0, 1, 2, 3, 4]
}',
 '["0", "3", "4", "undefined"]',
 '1',
 'Initially, each element is its own parent (self-loop): parent[i] = i. So parent[3] = 3.',
 3),

('union-find', NULL, 'true-false', 'easy',
 'In Union-Find, if parent[x] === x, then x is the root of its set.',
 NULL,
 NULL,
 'true',
 'A root points to itself. If parent[x] === x, x is the representative/root of its set.',
 4),

('union-find', NULL, 'multiple-choice', 'easy',
 'What is Union-Find commonly used for?',
 NULL,
 '["Sorting elements", "Finding shortest paths", "Tracking connected components", "Binary search"]',
 '2',
 'Union-Find efficiently tracks which elements are in the same connected component/group.',
 5),

-- Find Operation
('union-find', NULL, 'multiple-choice', 'medium',
 'What does the find(x) operation return?',
 NULL,
 '["The parent of x", "The root/representative of x''s set", "The size of x''s set", "Whether x exists"]',
 '1',
 'find(x) traverses parent pointers until reaching the root, returning the set representative.',
 6),

('union-find', NULL, 'code-output', 'medium',
 'After union(0,1) and union(1,2), what does find(2) return?',
 '// Initially: parent = [0, 1, 2]
// union(0,1): parent = [0, 0, 2]  (1 points to 0)
// union(1,2): find(1)=0, find(2)=2, parent = [0, 0, 0]',
 '["0", "1", "2", "3"]',
 '0',
 'After unions, 0, 1, 2 are in the same set. find(2) returns the root, which is 0.',
 7),

('union-find', NULL, 'multiple-choice', 'medium',
 'What is path compression in Union-Find?',
 NULL,
 '["Compressing the array size", "Making each node point directly to the root during find", "Removing duplicate elements", "Sorting the parent array"]',
 '1',
 'Path compression flattens the tree by making every node on the find path point directly to the root.',
 8),

('union-find', NULL, 'code-output', 'medium',
 'What is the key line for path compression?',
 'find(x) {
  if (this.parent[x] !== x) {
    this.parent[x] = this.find(this.parent[x]);  // <-- This line
  }
  return this.parent[x];
}',
 '["It recursively finds the root", "It sets parent[x] directly to the root", "Both A and B", "Neither"]',
 '2',
 'The line does both: recursively finds root AND sets parent[x] to that root (compression).',
 9),

('union-find', NULL, 'true-false', 'medium',
 'Without path compression, find() has O(n) worst-case time complexity.',
 NULL,
 NULL,
 'true',
 'Without compression, the tree can become a long chain, requiring O(n) traversal to reach root.',
 10),

-- Union Operation
('union-find', NULL, 'multiple-choice', 'medium',
 'What does union(x, y) do?',
 NULL,
 '["Finds if x and y are connected", "Merges the sets containing x and y", "Removes x and y from their sets", "Swaps x and y"]',
 '1',
 'union(x, y) merges the two sets by making one root point to the other.',
 11),

('union-find', NULL, 'code-output', 'medium',
 'What does union(x, y) return if x and y are already in the same set?',
 'union(x, y) {
  const px = this.find(x), py = this.find(y);
  if (px === py) return false;  // Already connected
  // ... merge logic
  return true;
}',
 '["true", "false", "undefined", "Error"]',
 '1',
 'If roots are equal, they are already in the same set. Return false (no merge needed).',
 12),

('union-find', NULL, 'multiple-choice', 'medium',
 'What is "union by rank"?',
 NULL,
 '["Always attach the first tree to the second", "Attach the shorter tree under the taller tree", "Attach by alphabetical order", "Random attachment"]',
 '1',
 'Union by rank attaches the tree with smaller rank under the one with larger rank, keeping trees balanced.',
 13),

('union-find', NULL, 'code-output', 'medium',
 'With union by rank, when do we increment the rank?',
 'if (rank[px] < rank[py]) {
  parent[px] = py;
} else if (rank[px] > rank[py]) {
  parent[py] = px;
} else {
  parent[py] = px;
  rank[px]++;  // When?
}',
 '["Always after union", "Only when ranks are equal", "Only when px has higher rank", "Never"]',
 '1',
 'Rank increases only when merging trees of equal rank. Otherwise, the taller tree''s rank stays the same.',
 14),

('union-find', NULL, 'true-false', 'medium',
 'Union by rank without path compression gives O(log n) per operation.',
 NULL,
 NULL,
 'true',
 'Union by rank alone keeps tree height O(log n). Combined with path compression: O(α(n)) ≈ O(1).',
 15),

-- Time Complexity
('union-find', NULL, 'multiple-choice', 'medium',
 'What is the amortized time complexity of find() with both optimizations?',
 NULL,
 '["O(n)", "O(log n)", "O(α(n)) ≈ O(1)", "O(n²)"]',
 '2',
 'With path compression and union by rank, operations are O(α(n)) where α is inverse Ackermann - effectively constant.',
 16),

('union-find', NULL, 'multiple-choice', 'easy',
 'What is the space complexity of Union-Find for n elements?',
 NULL,
 '["O(1)", "O(log n)", "O(n)", "O(n²)"]',
 '2',
 'We store parent[] and rank[] arrays, each of size n. Total: O(n).',
 17),

-- Connected Components
('union-find', NULL, 'code-output', 'medium',
 'With 5 elements and unions (0,1), (2,3), (0,2), how many components remain?',
 '// Start: 5 components [0], [1], [2], [3], [4]
// union(0,1): 4 components [0,1], [2], [3], [4]
// union(2,3): 3 components [0,1], [2,3], [4]
// union(0,2): 2 components [0,1,2,3], [4]',
 '["1", "2", "3", "5"]',
 '1',
 'After all unions: {0,1,2,3} and {4}. Two connected components remain.',
 18),

('union-find', NULL, 'multiple-choice', 'medium',
 'How do we track the number of connected components?',
 NULL,
 '["Count elements with parent[i] === i", "Maintain a count variable, decrement on successful union", "Use a separate array", "Count unique values in parent array"]',
 '1',
 'Start with count = n. Each successful union (returns true) decreases count by 1.',
 19),

-- Cycle Detection
('union-find', NULL, 'multiple-choice', 'medium',
 'How does Union-Find detect a cycle in an undirected graph?',
 NULL,
 '["If find(x) === x", "If union(x, y) returns false (edge connects same component)", "If parent array has duplicates", "Cycles cannot be detected"]',
 '1',
 'Adding edge (x, y) where find(x) === find(y) means they are already connected - adding this edge creates a cycle.',
 20),

('union-find', NULL, 'code-output', 'medium',
 'Edges: [(0,1), (1,2), (2,0)]. Which edge is redundant (creates cycle)?',
 '// Process edges:
// (0,1): union(0,1) -> true, no cycle
// (1,2): union(1,2) -> true, no cycle
// (2,0): union(2,0) -> false! Same component',
 '["(0,1)", "(1,2)", "(2,0)", "None"]',
 '2',
 'After first two edges, 0,1,2 are connected. Edge (2,0) connects same component - redundant/cycle.',
 21),

-- 2D Grid Problems
('union-find', NULL, 'multiple-choice', 'medium',
 'For a 2D grid with m rows and n columns, how do we flatten (i, j) to a 1D index?',
 NULL,
 '["i + j", "i * n + j", "i * m + j", "i + j * m"]',
 '1',
 'Flatten: index = row * numCols + col = i * n + j. This maps 2D coordinates to 1D array.',
 22),

('union-find', NULL, 'code-output', 'medium',
 'In a 3x4 grid, what is the flattened index of cell (1, 2)?',
 '// m = 3 rows, n = 4 cols
// index = i * n + j = 1 * 4 + 2',
 '["2", "5", "6", "7"]',
 '2',
 'index = 1 * 4 + 2 = 6. Cell (1,2) maps to index 6.',
 23),

-- Accounts Merge
('union-find', NULL, 'multiple-choice', 'hard',
 'In "Accounts Merge", what do we union?',
 NULL,
 '["Account names", "Email indices - emails belonging to same person", "Account indices only", "Names and emails together"]',
 '1',
 'Union email indices. If two accounts share an email, union all their emails. Same root = same person.',
 24),

('union-find', NULL, 'true-false', 'hard',
 'In Accounts Merge, we need a map from email to first account index that contains it.',
 NULL,
 NULL,
 'true',
 'Map email → index. When we see an email again, union its index with the stored index.',
 25),

-- Advanced Concepts
('union-find', NULL, 'multiple-choice', 'hard',
 'How can Union-Find track the size of each set?',
 NULL,
 '["Store size in rank array", "Use a separate size array, update on union", "Count during find", "Not possible efficiently"]',
 '1',
 'Maintain size[] array. On union, add sizes: size[newRoot] = size[px] + size[py].',
 26),

('union-find', NULL, 'identify-bug', 'medium',
 'What is wrong with this find function?',
 'find(x) {
  while (this.parent[x] !== x) {
    x = this.parent[x];
  }
  return x;
}',
 '["It returns wrong value", "Missing path compression - works but suboptimal", "Infinite loop possible", "Should use recursion"]',
 '1',
 'This iterative find works correctly but lacks path compression. Add: parent[x] = parent[parent[x]] in loop.',
 27),

('union-find', NULL, 'identify-bug', 'medium',
 'What is wrong with this initialization?',
 'constructor(n) {
  this.parent = new Array(n).fill(0);
  this.rank = new Array(n).fill(0);
}',
 '["rank should not be all zeros", "parent should be [0,1,2,...,n-1], not all zeros", "n should be n+1", "Nothing is wrong"]',
 '1',
 'parent[i] should equal i initially (each element is its own root). fill(0) makes everyone point to 0.',
 28),

('union-find', NULL, 'multiple-choice', 'hard',
 'When is Union-Find preferred over BFS/DFS for connectivity?',
 NULL,
 '["Always", "When connections are added dynamically (online algorithm)", "When we need shortest path", "For directed graphs"]',
 '1',
 'Union-Find excels at dynamic connectivity - efficiently handling a stream of union queries. BFS/DFS need full recomputation.',
 29),

('union-find', NULL, 'true-false', 'hard',
 'Union-Find can efficiently support a "disconnect" operation.',
 NULL,
 NULL,
 'false',
 'Standard Union-Find only supports union. Disconnect (split sets) is not efficiently supported without special techniques.',
 30);
