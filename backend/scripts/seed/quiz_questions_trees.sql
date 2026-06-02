-- Quiz Questions for Trees Pattern
-- Run: psql "postgresql://..." -f scripts/seed/quiz_questions_trees.sql

-- Clear existing trees questions first
DELETE FROM quiz_questions WHERE pattern_id = 'trees';

-- Section: Tree Fundamentals
INSERT INTO quiz_questions (pattern_id, section_slug, question_type, difficulty, question_text, code_snippet, options, correct_answer, explanation, display_order) VALUES
('trees', NULL, 'multiple-choice', 'easy',
 'What is the maximum number of children a node can have in a binary tree?',
 NULL,
 '["1", "2", "3", "Unlimited"]',
 '1',
 'In a binary tree, each node can have at most 2 children: left and right.',
 1),

('trees', NULL, 'multiple-choice', 'easy',
 'What is the height of a tree with only a root node?',
 NULL,
 '["0", "1", "2", "-1"]',
 '0',
 'Height is the number of edges on the longest path from root to leaf. A single node has no edges, so height is 0.',
 2),

('trees', NULL, 'true-false', 'easy',
 'In a Binary Search Tree (BST), all values in the left subtree are less than the root.',
 NULL,
 NULL,
 'true',
 'BST property: left subtree values < root < right subtree values.',
 3),

('trees', NULL, 'multiple-choice', 'easy',
 'What is the base case for most tree recursive functions?',
 NULL,
 '["node.val === 0", "node === null", "node.left === null", "node === root"]',
 '1',
 'When we reach a null node, we''ve gone past a leaf. This is the base case to stop recursion.',
 4),

('trees', NULL, 'code-output', 'easy',
 'What is the depth of node with value 4?',
 '//        1       <- depth 0
//       / \\
//      2   3     <- depth 1
//     /
//    4           <- depth ?',
 '["0", "1", "2", "3"]',
 '2',
 'Depth is the number of edges from root to the node. Root(1) → 2 → 4 = 2 edges.',
 5),

-- Traversal Questions
('trees', NULL, 'multiple-choice', 'medium',
 'Which traversal visits nodes in sorted order for a BST?',
 NULL,
 '["Preorder", "Inorder", "Postorder", "Level order"]',
 '1',
 'Inorder (left → root → right) visits BST nodes in ascending sorted order.',
 6),

('trees', NULL, 'code-output', 'medium',
 'What is the preorder traversal of this tree?',
 '//     1
//    / \\
//   2   3
//  / \\
// 4   5',
 '["1, 2, 4, 5, 3", "4, 2, 5, 1, 3", "4, 5, 2, 3, 1", "1, 2, 3, 4, 5"]',
 '0',
 'Preorder: root first, then left subtree, then right. 1 → (2 → 4 → 5) → 3.',
 7),

('trees', NULL, 'code-output', 'medium',
 'What is the inorder traversal of this tree?',
 '//     1
//    / \\
//   2   3
//  / \\
// 4   5',
 '["1, 2, 4, 5, 3", "4, 2, 5, 1, 3", "4, 5, 2, 3, 1", "1, 2, 3, 4, 5"]',
 '1',
 'Inorder: left subtree, root, right subtree. (4 → 2 → 5) → 1 → 3.',
 8),

('trees', NULL, 'code-output', 'medium',
 'What is the postorder traversal of this tree?',
 '//     1
//    / \\
//   2   3
//  / \\
// 4   5',
 '["1, 2, 4, 5, 3", "4, 2, 5, 1, 3", "4, 5, 2, 3, 1", "1, 2, 3, 4, 5"]',
 '2',
 'Postorder: left subtree, right subtree, root last. (4 → 5 → 2) → 3 → 1.',
 9),

('trees', NULL, 'multiple-choice', 'medium',
 'Which traversal is best for deleting a tree (freeing memory)?',
 NULL,
 '["Preorder", "Inorder", "Postorder", "Level order"]',
 '2',
 'Postorder deletes children before parent, ensuring no dangling references.',
 10),

('trees', NULL, 'code-output', 'medium',
 'What is the level order (BFS) traversal of this tree?',
 '//     1
//    / \\
//   2   3
//  / \\
// 4   5',
 '["[[1], [2, 3], [4, 5]]", "[[1, 2, 3, 4, 5]]", "[[4, 5], [2, 3], [1]]", "[[1], [3, 2], [5, 4]]"]',
 '0',
 'BFS visits level by level: [1], then [2, 3], then [4, 5].',
 11),

-- DFS Recursive Patterns
('trees', NULL, 'code-output', 'medium',
 'What does this function return for a tree with nodes 1, 2, 3 (root=1)?',
 'function maxDepth(node) {
  if (!node) return 0;
  const left = maxDepth(node.left);
  const right = maxDepth(node.right);
  return 1 + Math.max(left, right);
}
//     1
//    / \\
//   2   3',
 '["0", "1", "2", "3"]',
 '2',
 'Depth: max(depth(2), depth(3)) + 1 = max(1, 1) + 1 = 2.',
 12),

('trees', NULL, 'multiple-choice', 'medium',
 'When computing tree diameter, why do we use a closure/global variable?',
 NULL,
 '["To improve time complexity", "The max path might not pass through the root", "To avoid recursion", "It is required by the algorithm"]',
 '1',
 'Diameter can be between any two nodes. We track the global max because the longest path might not include root.',
 13),

('trees', NULL, 'identify-bug', 'medium',
 'What is wrong with this maxDepth code?',
 'function maxDepth(node) {
  if (!node) return 0;
  return Math.max(maxDepth(node.left), maxDepth(node.right));
}',
 '["Base case should return -1", "Missing +1 to count current node", "Should use min instead of max", "Left and right are swapped"]',
 '1',
 'We need to add 1 for the current node: return 1 + Math.max(left, right).',
 14),

-- BST Questions
('trees', NULL, 'multiple-choice', 'medium',
 'To validate a BST, what must we pass down to each recursive call?',
 NULL,
 '["Only the parent value", "Min and max bounds", "The root value", "Nothing extra needed"]',
 '1',
 'Each node must be within a valid range. Pass min/max bounds and narrow them as you go down.',
 15),

('trees', NULL, 'code-output', 'medium',
 'Is this a valid BST?',
 '//      5
//     / \\
//    3   7
//   / \\
//  1   6  <- Is 6 valid here?',
 '["Yes, it is valid", "No, 6 should be in right subtree of 5"]',
 '1',
 '6 is greater than 5 but is in the left subtree. In a BST, ALL left descendants must be < root.',
 16),

('trees', NULL, 'code-output', 'hard',
 'What is the kth smallest element (k=3) in this BST?',
 '//      5
//     / \\
//    3   7
//   / \\
//  2   4
// Inorder: 2, 3, 4, 5, 7',
 '["3", "4", "5", "7"]',
 '1',
 'Inorder gives sorted order: 2, 3, 4, 5, 7. The 3rd smallest is 4.',
 17),

('trees', NULL, 'multiple-choice', 'medium',
 'What is the time complexity of searching in a balanced BST?',
 NULL,
 '["O(1)", "O(log n)", "O(n)", "O(n log n)"]',
 '1',
 'In a balanced BST, each comparison eliminates half the tree: O(log n).',
 18),

('trees', NULL, 'true-false', 'medium',
 'In a BST, the inorder successor of a node is always in its right subtree.',
 NULL,
 NULL,
 'false',
 'If the node has a right subtree, successor is the leftmost node in it. Otherwise, it''s an ancestor.',
 19),

-- LCA Questions
('trees', NULL, 'multiple-choice', 'medium',
 'For Lowest Common Ancestor (LCA), when is the current node the answer?',
 NULL,
 '["When it equals one of the targets", "When one target is in left subtree and other in right", "When both targets are in the same subtree", "When the node is a leaf"]',
 '1',
 'If p is in left subtree and q is in right (or vice versa), current node is the LCA - the paths diverge here.',
 20),

('trees', NULL, 'code-output', 'medium',
 'What is the LCA of nodes 4 and 5?',
 '//       3
//      / \\
//     5   1
//    / \\
//   6   2
//      / \\
//     7   4',
 '["3", "5", "2", "1"]',
 '1',
 'Node 5 is an ancestor of 4 (through 2). The LCA of a node and its descendant is the ancestor itself.',
 21),

('trees', NULL, 'code-output', 'hard',
 'What is the LCA of nodes 6 and 4?',
 '//       3
//      / \\
//     5   1
//    / \\
//   6   2
//      / \\
//     7   4',
 '["3", "5", "2", "6"]',
 '1',
 '6 is in left subtree of 5, 4 is in right subtree of 5. They diverge at 5, so LCA is 5.',
 22),

-- BFS Questions
('trees', NULL, 'multiple-choice', 'medium',
 'In BFS level order traversal, why do we track the level size?',
 NULL,
 '["To improve time complexity", "To know when a level ends and next begins", "To count total nodes", "It is not necessary"]',
 '1',
 'We save queue.length before processing. This tells us how many nodes belong to current level.',
 23),

('trees', NULL, 'code-output', 'medium',
 'What is the right side view of this tree?',
 '//       1
//      / \\
//     2   3
//    /     \\
//   4       5
// Right side view: rightmost node at each level',
 '["[1, 3, 5]", "[1, 2, 4]", "[1, 3, 4]", "[5, 3, 1]"]',
 '0',
 'Level 0: 1, Level 1: 3 (rightmost), Level 2: 5 (rightmost). View from right: [1, 3, 5].',
 24),

('trees', NULL, 'multiple-choice', 'medium',
 'What data structure is used for BFS traversal?',
 NULL,
 '["Stack", "Queue", "Heap", "Hash Map"]',
 '1',
 'BFS uses a queue (FIFO) to process nodes level by level.',
 25),

-- Path Sum and Advanced
('trees', NULL, 'code-output', 'medium',
 'Does a root-to-leaf path with sum 22 exist?',
 '//       5
//      / \\
//     4   8
//    /   / \\
//   11  13  4
//  /  \\      \\
// 7    2      1
// Path: 5 → 4 → 11 → 2 = 22',
 '["Yes", "No"]',
 '0',
 'Path 5 → 4 → 11 → 2 = 22. This is a valid root-to-leaf path.',
 26),

('trees', NULL, 'multiple-choice', 'hard',
 'For "Binary Tree Maximum Path Sum", why might the answer be negative?',
 NULL,
 '["It is a bug", "All node values could be negative", "The tree is empty", "Paths must include the root"]',
 '1',
 'If all values are negative, the max path sum is still the least negative value (or single node).',
 27),

('trees', NULL, 'identify-bug', 'hard',
 'What is wrong with this path sum code?',
 'function hasPathSum(node, target) {
  if (!node) return target === 0;
  return hasPathSum(node.left, target - node.val) ||
         hasPathSum(node.right, target - node.val);
}',
 '["Base case should check if node is a LEAF, not just null", "Should use + instead of -", "Missing the root value", "Logic operators are wrong"]',
 '0',
 'Reaching null from a non-leaf doesn''t count. Must check: if (!node.left && !node.right) return target === node.val.',
 28),

-- Serialization
('trees', NULL, 'multiple-choice', 'hard',
 'Which traversal is commonly used for tree serialization?',
 NULL,
 '["Inorder only", "Preorder with null markers", "Postorder only", "Level order only"]',
 '1',
 'Preorder with null markers (e.g., "1,2,null,null,3") uniquely represents the tree structure.',
 29),

('trees', NULL, 'code-output', 'hard',
 'What is the preorder serialization of this tree (using # for null)?',
 '//     1
//    / \\
//   2   3
//      / \\
//     4   5',
 '["1,2,#,#,3,4,#,#,5,#,#", "1,2,3,4,5,#,#,#,#,#,#", "#,#,2,#,#,4,5,3,1", "1,#,2,#,3,4,5"]',
 '0',
 'Preorder: 1, then left subtree (2,#,#), then right subtree (3, (4,#,#), (5,#,#)).',
 30);
