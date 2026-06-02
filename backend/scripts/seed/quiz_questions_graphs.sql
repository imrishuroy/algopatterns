-- Quiz Questions for Graphs Pattern
-- Run: psql "postgresql://..." -f scripts/seed/quiz_questions_graphs.sql

-- Clear existing graphs questions first
DELETE FROM quiz_questions WHERE pattern_id = 'graphs';

-- Section: Graph Fundamentals
INSERT INTO quiz_questions (pattern_id, section_slug, question_type, difficulty, question_text, code_snippet, options, correct_answer, explanation, display_order) VALUES
('graphs', NULL, 'multiple-choice', 'easy',
 'What are the two main ways to represent a graph?',
 NULL,
 '["Array and LinkedList", "Adjacency Matrix and Adjacency List", "Stack and Queue", "Tree and Heap"]',
 '1',
 'Adjacency Matrix uses O(V²) space. Adjacency List uses O(V+E) space and is preferred for sparse graphs.',
 1),

('graphs', NULL, 'multiple-choice', 'easy',
 'When should you use BFS instead of DFS?',
 NULL,
 '["For deeper exploration", "For finding shortest path in unweighted graphs", "For topological sorting", "For detecting back edges"]',
 '1',
 'BFS explores level by level, guaranteeing shortest path in unweighted graphs. DFS goes deep first.',
 2),

('graphs', NULL, 'true-false', 'easy',
 'DFS always finds the shortest path between two nodes.',
 NULL,
 NULL,
 'false',
 'DFS finds A path, not necessarily the shortest. Use BFS for shortest path in unweighted graphs.',
 3),

('graphs', NULL, 'multiple-choice', 'easy',
 'What is the time complexity of BFS/DFS on a graph with V vertices and E edges?',
 NULL,
 '["O(V)", "O(E)", "O(V + E)", "O(V × E)"]',
 '2',
 'We visit each vertex once O(V) and traverse each edge once O(E). Total: O(V + E).',
 4),

('graphs', NULL, 'multiple-choice', 'easy',
 'In grid problems, how many neighbors does each cell typically have?',
 NULL,
 '["2", "4 (up, down, left, right)", "6", "8"]',
 '1',
 'Standard grid traversal uses 4 directions. Some problems use 8 (including diagonals).',
 5),

-- DFS Questions
('graphs', NULL, 'multiple-choice', 'medium',
 'What data structure does DFS typically use?',
 NULL,
 '["Queue", "Stack (explicit or call stack)", "Heap", "Hash Table"]',
 '1',
 'DFS uses LIFO - recursion (call stack) or explicit stack for iterative implementation.',
 6),

('graphs', NULL, 'code-output', 'medium',
 'In "Number of Islands", what is the result for this grid?',
 'grid = [
  ["1","1","0","0","0"],
  ["1","1","0","0","0"],
  ["0","0","1","0","0"],
  ["0","0","0","1","1"]
]',
 '["2", "3", "4", "5"]',
 '1',
 'Three islands: top-left (4 cells), middle (1 cell), bottom-right (2 cells).',
 7),

('graphs', NULL, 'multiple-choice', 'medium',
 'In grid DFS, why do we mark cells as visited BEFORE recursing?',
 NULL,
 '["Performance optimization", "Prevents infinite loops by avoiding revisiting", "Required by the algorithm", "To count cells"]',
 '1',
 'Without marking before recursing, we might revisit the same cell from different paths, causing infinite recursion.',
 8),

('graphs', NULL, 'identify-bug', 'medium',
 'What is wrong with this island counting code?',
 'function numIslands(grid) {
  let count = 0;
  function dfs(r, c) {
    if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length) return;
    if (grid[r][c] === "0") return;
    // Missing: grid[r][c] = "0";
    dfs(r+1, c); dfs(r-1, c); dfs(r, c+1); dfs(r, c-1);
  }
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      if (grid[r][c] === "1") { count++; dfs(r, c); }
    }
  }
  return count;
}',
 '["Missing visited marking - causes infinite recursion", "Loop bounds are wrong", "Count increment is wrong", "DFS directions are incomplete"]',
 '0',
 'Without marking grid[r][c] = "0", we keep revisiting the same cells infinitely.',
 9),

-- BFS Questions
('graphs', NULL, 'multiple-choice', 'medium',
 'What data structure does BFS use?',
 NULL,
 '["Stack", "Queue", "Heap", "Tree"]',
 '1',
 'BFS uses FIFO (queue) to explore nodes level by level.',
 10),

('graphs', NULL, 'code-output', 'medium',
 'In "Rotting Oranges", if all fresh oranges can be reached, what do we return?',
 '// BFS from all rotten oranges simultaneously
// Each level = 1 minute
// Return number of levels (minutes) until all fresh are rotten',
 '["Number of rotten oranges", "Number of fresh oranges", "Minutes until all oranges are rotten", "Total oranges"]',
 '2',
 'BFS level = 1 minute. Return the time (levels) when all fresh oranges become rotten.',
 11),

('graphs', NULL, 'multiple-choice', 'medium',
 'In multi-source BFS (like Rotting Oranges), how do we start?',
 NULL,
 '["Pick one source randomly", "Add ALL sources to queue initially", "Process sources one at a time", "Use DFS instead"]',
 '1',
 'Multi-source BFS: add all starting points to queue at level 0. They expand simultaneously.',
 12),

('graphs', NULL, 'code-output', 'hard',
 'In "Word Ladder" from "hit" to "cog" with words ["hot","dot","dog","lot","log","cog"], what is the shortest transformation length?',
 '// hit → hot → dot → dog → cog (5 words)
// Or: hit → hot → lot → log → cog (5 words)',
 '["4", "5", "6", "No transformation possible"]',
 '1',
 'Shortest path: hit→hot→dot→dog→cog = 5 words (4 transformations).',
 13),

-- Topological Sort
('graphs', NULL, 'multiple-choice', 'medium',
 'What type of graph allows topological sorting?',
 NULL,
 '["Any graph", "Only DAG (Directed Acyclic Graph)", "Only undirected graphs", "Only weighted graphs"]',
 '1',
 'Topological sort requires DAG. Cycles make ordering impossible (chicken and egg problem).',
 14),

('graphs', NULL, 'multiple-choice', 'medium',
 'What does "indegree" of a node represent?',
 NULL,
 '["Number of outgoing edges", "Number of incoming edges", "Total edges", "Node value"]',
 '1',
 'Indegree = number of edges pointing INTO the node. Outdegree = edges going out.',
 15),

('graphs', NULL, 'code-output', 'medium',
 'In Kahn''s algorithm, which nodes are added to the queue first?',
 '// Build indegree array
// Process nodes with indegree 0 first',
 '["Nodes with most edges", "Nodes with indegree 0 (no prerequisites)", "Random nodes", "Nodes with highest values"]',
 '1',
 'Start with nodes that have no dependencies (indegree = 0). They can be processed immediately.',
 16),

('graphs', NULL, 'code-output', 'medium',
 'For Course Schedule: 4 courses, prerequisites [[1,0],[2,0],[3,1],[3,2]], what is one valid order?',
 '// 0 has no prereqs
// 1 needs 0, 2 needs 0
// 3 needs 1 and 2',
 '["[0,1,2,3]", "[3,2,1,0]", "[1,2,0,3]", "[0,2,1,3]"]',
 '0',
 '0 first (no prereqs), then 1 and 2 (need 0), finally 3 (needs 1 and 2). [0,1,2,3] or [0,2,1,3].',
 17),

('graphs', NULL, 'multiple-choice', 'medium',
 'How do we detect a cycle using topological sort (Kahn''s algorithm)?',
 NULL,
 '["If queue becomes empty early", "If processed count < total nodes (some nodes never reach indegree 0)", "If any node has indegree > 1", "Cycles cannot be detected"]',
 '1',
 'If we cannot process all nodes (cycle blocks some from reaching indegree 0), graph has a cycle.',
 18),

-- Cycle Detection
('graphs', NULL, 'multiple-choice', 'hard',
 'In DFS cycle detection, what do the three states (white/gray/black) represent?',
 NULL,
 '["Node values", "Unvisited / Currently in recursion stack / Fully processed", "Edge types", "Distance from source"]',
 '1',
 'White: not visited. Gray: being processed (in current path). Black: fully done. Gray→Gray = cycle.',
 19),

('graphs', NULL, 'true-false', 'medium',
 'An undirected graph with V vertices and E >= V edges always has a cycle.',
 NULL,
 NULL,
 'true',
 'A tree (connected, no cycles) has exactly V-1 edges. With E >= V edges, at least one cycle exists.',
 20),

-- Clone Graph
('graphs', NULL, 'multiple-choice', 'medium',
 'In "Clone Graph", why do we need a HashMap?',
 NULL,
 '["To sort nodes", "To map original nodes to cloned nodes, preventing duplicate clones", "To count edges", "HashMap is not needed"]',
 '1',
 'HashMap tracks which nodes are already cloned. Without it, we would create multiple clones of the same node.',
 21),

('graphs', NULL, 'identify-bug', 'medium',
 'What is wrong with this graph clone code?',
 'function cloneGraph(node) {
  if (!node) return null;
  const visited = new Map();

  function clone(n) {
    const copy = { val: n.val, neighbors: [] };
    visited.set(n, copy);  // Set after creating copy

    for (let neighbor of n.neighbors) {
      if (visited.has(neighbor)) {
        copy.neighbors.push(visited.get(neighbor));
      } else {
        copy.neighbors.push(clone(neighbor));
      }
    }
    return copy;
  }
  return clone(node);
}',
 '["Should check visited BEFORE creating copy to handle cycles", "Loop is wrong", "Return value is wrong", "Nothing is wrong"]',
 '0',
 'Should check if already visited at the start of clone(). Current code creates duplicates for cycles.',
 22),

-- Dijkstra's Algorithm
('graphs', NULL, 'multiple-choice', 'hard',
 'When should you use Dijkstra instead of BFS?',
 NULL,
 '["For unweighted graphs", "For weighted graphs with non-negative weights", "For detecting cycles", "For topological sort"]',
 '1',
 'Dijkstra handles weighted edges. BFS only works for unweighted (or equal weight) edges.',
 23),

('graphs', NULL, 'multiple-choice', 'hard',
 'What data structure makes Dijkstra efficient?',
 NULL,
 '["Queue", "Stack", "Min-Heap / Priority Queue", "HashMap"]',
 '2',
 'Min-heap extracts the node with smallest distance in O(log V), making Dijkstra O((V+E) log V).',
 24),

('graphs', NULL, 'code-output', 'hard',
 'In Network Delay Time, if signal starts at node 1 and graph is [[1,2,1],[2,3,2],[1,3,4]], what is the delay?',
 '// 1→2: cost 1
// 2→3: cost 2
// 1→3: cost 4
// Shortest to 2: 1, to 3: min(1+2, 4) = 3
// Max delay = 3',
 '["1", "2", "3", "4"]',
 '2',
 'Path 1→2→3 costs 3, which is less than direct 1→3 (cost 4). All nodes reached in max 3 time.',
 25),

('graphs', NULL, 'multiple-choice', 'hard',
 'Why does Dijkstra fail with negative weights?',
 NULL,
 '["It cannot handle negative numbers", "A shorter path might be found later through negative edges", "It causes infinite loops", "Negative weights are invalid"]',
 '1',
 'Dijkstra assumes processed nodes have final shortest distance. Negative edges can invalidate this.',
 26),

-- Connected Components
('graphs', NULL, 'multiple-choice', 'medium',
 'How do we count connected components in an undirected graph?',
 NULL,
 '["Count nodes with no edges", "DFS/BFS from each unvisited node, count how many times we start", "Count edges", "Use topological sort"]',
 '1',
 'Each DFS/BFS from an unvisited node explores one component. Count the number of traversal starts.',
 27),

('graphs', NULL, 'code-output', 'medium',
 'For edges [[0,1],[1,2],[3,4]] with 5 nodes, how many connected components?',
 '// Component 1: 0-1-2
// Component 2: 3-4
// Total: 2 components',
 '["1", "2", "3", "5"]',
 '1',
 'Two components: {0,1,2} connected together, {3,4} connected together.',
 28),

-- Graph Representation
('graphs', NULL, 'multiple-choice', 'medium',
 'For a sparse graph (few edges), which representation is more space-efficient?',
 NULL,
 '["Adjacency Matrix O(V²)", "Adjacency List O(V+E)", "Both are equal", "Edge List"]',
 '1',
 'Adjacency List uses O(V+E). For sparse graphs where E << V², this is much better than O(V²) matrix.',
 29),

('graphs', NULL, 'code-output', 'medium',
 'To convert grid to adjacency list, what is the neighbor of cell (1,1) in a 3x3 grid?',
 '// 4-directional neighbors
// (1,1) neighbors: (0,1), (2,1), (1,0), (1,2)',
 '["4 neighbors", "2 neighbors", "8 neighbors", "1 neighbor"]',
 '0',
 'Cell (1,1) in a 3x3 grid has 4 valid neighbors: up(0,1), down(2,1), left(1,0), right(1,2).',
 30);
