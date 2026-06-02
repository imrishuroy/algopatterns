-- Quiz Questions for Trie Pattern
-- Run: psql "postgresql://..." -f scripts/seed/quiz_questions_trie.sql

-- Clear existing trie questions first
DELETE FROM quiz_questions WHERE pattern_id = 'trie';

-- Section: Trie Fundamentals
INSERT INTO quiz_questions (pattern_id, section_slug, question_type, difficulty, question_text, code_snippet, options, correct_answer, explanation, display_order) VALUES
('trie', NULL, 'multiple-choice', 'easy',
 'What does each node in a Trie represent?',
 NULL,
 '["A complete word", "A single character", "A prefix", "A suffix"]',
 '1',
 'Each node represents a single character. The path from root to any node represents a prefix.',
 1),

('trie', NULL, 'multiple-choice', 'easy',
 'What is the primary advantage of a Trie over a Hash Set for string operations?',
 NULL,
 '["Less memory usage", "Efficient prefix-based operations", "Faster exact match lookup", "Simpler implementation"]',
 '1',
 'Tries excel at prefix operations like autocomplete. Finding all words with a prefix is O(p + n) where p is prefix length.',
 2),

('trie', NULL, 'true-false', 'easy',
 'In a Trie, every node represents a complete word.',
 NULL,
 NULL,
 'false',
 'Only nodes marked with isEnd=true represent complete words. Other nodes are just prefixes.',
 3),

('trie', NULL, 'multiple-choice', 'easy',
 'What is the time complexity of inserting a word of length L into a Trie?',
 NULL,
 '["O(1)", "O(L)", "O(n)", "O(n * L)"]',
 '1',
 'We traverse/create one node per character, so insertion is O(L) where L is word length.',
 4),

('trie', NULL, 'code-output', 'easy',
 'After inserting "cat" and "car", how many nodes are in the Trie (excluding root)?',
 '// Insert: "cat", "car"
//     root
//      |
//      c
//      |
//      a
//     / \\
//    t   r',
 '["3", "4", "5", "6"]',
 '1',
 'Nodes: c, a, t, r = 4 nodes. "c" and "a" are shared between both words.',
 5),

-- Trie Structure Questions
('trie', NULL, 'multiple-choice', 'medium',
 'What is the purpose of the isEnd flag in a Trie node?',
 NULL,
 '["To mark the root node", "To indicate a complete word ends at this node", "To count word frequency", "To link to parent node"]',
 '1',
 'isEnd distinguishes between a prefix and a complete word. "car" has isEnd=true, but "ca" does not if only "car" was inserted.',
 6),

('trie', NULL, 'code-output', 'medium',
 'After inserting "app", "apple", "application", which nodes have isEnd=true?',
 '// Words: app, apple, application
//     root → a → p → p(✓) → l → e(✓) → ... → n(✓)',
 '["Only the last node", "Nodes for p, e, and n (end of each word)", "All nodes", "Only the root"]',
 '1',
 'isEnd is true at: p (app), e (apple), n (application) - marking where each complete word ends.',
 7),

('trie', NULL, 'multiple-choice', 'medium',
 'In Java, why use TrieNode[26] instead of HashMap for children?',
 NULL,
 '["It is always faster", "Fixed alphabet size makes array more memory-efficient", "HashMap cannot store characters", "It handles Unicode better"]',
 '1',
 'For lowercase English letters (26), an array is faster and uses predictable memory. HashMap is better for large/variable alphabets.',
 8),

('trie', NULL, 'identify-bug', 'medium',
 'What is wrong with this search function?',
 'search(word) {
  let node = this.root;
  for (let c of word) {
    if (!node.children[c]) return false;
    node = node.children[c];
  }
  return true;  // Bug here
}',
 '["Should return false", "Should check node.isEnd instead of true", "Loop condition is wrong", "Should start from node.children"]',
 '1',
 'Returning true means "prefix exists". For search, we must return node.isEnd to confirm it is a complete word.',
 9),

('trie', NULL, 'code-output', 'medium',
 'Trie has words: ["app", "apple"]. What does search("app") return?',
 NULL,
 '["true", "false", "null", "undefined"]',
 '0',
 '"app" was explicitly inserted, so its node has isEnd=true. search("app") returns true.',
 10),

('trie', NULL, 'code-output', 'medium',
 'Trie has words: ["apple"]. What does search("app") return?',
 NULL,
 '["true", "false", "null", "undefined"]',
 '1',
 '"app" is a prefix of "apple" but was never inserted as a word. Its node has isEnd=false.',
 11),

('trie', NULL, 'code-output', 'medium',
 'Trie has words: ["apple"]. What does startsWith("app") return?',
 NULL,
 '["true", "false", "null", "undefined"]',
 '0',
 'startsWith only checks if the prefix path exists. "app" is a valid prefix of "apple", so returns true.',
 12),

-- Insert and Search Operations
('trie', NULL, 'code-output', 'medium',
 'What is the output of this sequence?',
 'const trie = new Trie();
trie.insert("hello");
trie.insert("help");
console.log(trie.startsWith("hel"));
console.log(trie.search("hel"));',
 '["true, true", "true, false", "false, true", "false, false"]',
 '1',
 'startsWith("hel") is true (prefix exists). search("hel") is false ("hel" was not inserted as a word).',
 13),

('trie', NULL, 'multiple-choice', 'medium',
 'What is the space complexity of a Trie storing N words of average length L?',
 NULL,
 '["O(N)", "O(L)", "O(N * L)", "O(N + L)"]',
 '2',
 'Worst case: no shared prefixes, each word creates L nodes. Total: O(N * L) nodes.',
 14),

('trie', NULL, 'true-false', 'medium',
 'Tries are always more memory-efficient than Hash Sets for storing words.',
 NULL,
 NULL,
 'false',
 'Tries can use MORE memory due to node overhead. They trade space for prefix operation efficiency.',
 15),

-- Wildcard Search
('trie', NULL, 'multiple-choice', 'hard',
 'For wildcard search with "." (matches any character), what approach is used?',
 NULL,
 '["Binary search", "DFS trying all children when encountering \".\"", "Replace \".\" with all letters and search each", "Wildcards are not supported in Tries"]',
 '1',
 'When we hit ".", we recursively try all existing children at that node using DFS.',
 16),

('trie', NULL, 'code-output', 'hard',
 'Trie has ["bad", "dad", "mad"]. Does search("b.d") return true?',
 '// Pattern: "b.d" where . matches any character
// Words in trie: bad, dad, mad',
 '["true", "false"]',
 '0',
 '"b.d" matches "bad": b=b, .=a (any char), d=d. Pattern matches, returns true.',
 17),

('trie', NULL, 'code-output', 'hard',
 'Trie has ["bad", "dad", "mad"]. Does search("..d") return true?',
 NULL,
 '["true", "false"]',
 '0',
 '"..d" matches all three words. First . matches b/d/m, second . matches a, d matches d.',
 18),

('trie', NULL, 'multiple-choice', 'hard',
 'What is the worst-case time complexity of wildcard search with pattern "..."?',
 NULL,
 '["O(L)", "O(26^L) where L is pattern length", "O(N) where N is number of words", "O(1)"]',
 '1',
 'Each "." can branch to 26 children. Pattern of all dots explores entire trie: O(26^L) worst case.',
 19),

-- Word Search II (Trie + Grid)
('trie', NULL, 'multiple-choice', 'hard',
 'In "Word Search II" (find words in grid), why use Trie instead of searching each word?',
 NULL,
 '["Trie uses less memory", "Single DFS traversal can find all words with shared prefixes", "Trie is easier to implement", "Grid search requires Trie"]',
 '1',
 'Build Trie of all words. One DFS from each cell can find multiple words that share prefixes, avoiding redundant traversals.',
 20),

('trie', NULL, 'multiple-choice', 'hard',
 'In Word Search II, when should we stop DFS early?',
 NULL,
 '["When we find any word", "When current path is not a prefix in the Trie", "When we reach grid boundary", "Never stop early"]',
 '1',
 'If current path doesn''t exist in Trie (node is null), no words can be found - prune immediately.',
 21),

('trie', NULL, 'true-false', 'hard',
 'In Word Search II, after finding a word, we should immediately remove it from the Trie.',
 NULL,
 NULL,
 'true',
 'Removing found words (setting isEnd=false or pruning) prevents duplicates and can improve performance.',
 22),

-- Autocomplete and Applications
('trie', NULL, 'multiple-choice', 'medium',
 'For autocomplete with prefix "app", how do we find all matching words?',
 NULL,
 '["Search for \"app\" only", "Navigate to prefix node, then DFS to collect all words below", "Check every word in dictionary", "Use binary search"]',
 '1',
 'Traverse to the node for "app", then DFS from there, collecting all paths where isEnd=true.',
 23),

('trie', NULL, 'code-output', 'medium',
 'Trie has ["apple", "app", "application", "banana"]. How many words match prefix "app"?',
 NULL,
 '["1", "2", "3", "4"]',
 '2',
 '"apple", "app", "application" all start with "app". That''s 3 words.',
 24),

('trie', NULL, 'multiple-choice', 'medium',
 'Which operation is NOT efficient with a basic Trie?',
 NULL,
 '["Insert word", "Search word", "Find words with prefix", "Delete word"]',
 '3',
 'Deletion is tricky - must check if node is used by other words before removing. Requires careful cleanup.',
 25),

-- Edge Cases
('trie', NULL, 'code-output', 'easy',
 'What does search("") return on a non-empty Trie?',
 NULL,
 '["true", "false", "Error", "undefined"]',
 '1',
 'Empty string means we stay at root. Root typically has isEnd=false (unless "" was explicitly inserted).',
 26),

('trie', NULL, 'multiple-choice', 'medium',
 'How should a Trie handle case-insensitive search?',
 NULL,
 '["Store uppercase only", "Convert to lowercase before insert and search", "Store both cases at each node", "Tries cannot be case-insensitive"]',
 '1',
 'Normalize to one case (usually lowercase) during both insert and search operations.',
 27),

('trie', NULL, 'identify-bug', 'medium',
 'What is wrong with this insert function?',
 'insert(word) {
  let node = this.root;
  for (let c of word) {
    if (!node.children[c]) {
      node.children[c] = new TrieNode();
    }
  }
  node.isEnd = true;
}',
 '["Should check if word is empty", "Missing node = node.children[c] to advance", "isEnd should be false", "Loop should go backwards"]',
 '1',
 'We create children but never advance to them. Need: node = node.children[c] after creating/checking.',
 28),

('trie', NULL, 'multiple-choice', 'hard',
 'To count words with a given prefix, what should we store at each node?',
 NULL,
 '["Nothing extra needed", "A count of words passing through this node", "All words as a list", "Parent pointer"]',
 '1',
 'Store a count that increments during insert. The count at prefix end tells how many words share that prefix.',
 29),

('trie', NULL, 'true-false', 'medium',
 'A Trie can efficiently find the longest common prefix of all inserted words.',
 NULL,
 NULL,
 'true',
 'Traverse from root while there is exactly one child and isEnd is false. This path is the longest common prefix.',
 30);
