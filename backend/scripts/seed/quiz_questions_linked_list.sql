-- Quiz Questions for Linked List Pattern
-- Run this after the migration: psql -d algopatterns -f quiz_questions_linked_list.sql

-- Clear existing linked-list questions first
DELETE FROM quiz_questions WHERE pattern_id = 'linked-list';

-- Section: Linked List Fundamentals
INSERT INTO quiz_questions (pattern_id, section_slug, question_type, difficulty, question_text, code_snippet, options, correct_answer, explanation, display_order) VALUES
('linked-list', NULL, 'multiple-choice', 'easy',
 'What is the main advantage of a linked list over an array?',
 NULL,
 '["Faster random access", "Dynamic size with O(1) insertion/deletion at known position", "Less memory usage", "Better cache locality"]',
 '1',
 'Linked lists can grow/shrink dynamically and insert/delete at a known position in O(1) time, unlike arrays which require shifting elements.',
 1),

('linked-list', NULL, 'multiple-choice', 'easy',
 'What is the time complexity of accessing the nth element in a singly linked list?',
 NULL,
 '["O(1)", "O(log n)", "O(n)", "O(n²)"]',
 '2',
 'Unlike arrays, linked lists require traversal from the head to reach element n, taking O(n) time.',
 2),

('linked-list', NULL, 'true-false', 'easy',
 'In a singly linked list, you can traverse backwards from any node.',
 NULL,
 NULL,
 'false',
 'Singly linked lists only have forward pointers (next). You need a doubly linked list to traverse backwards.',
 3),

('linked-list', NULL, 'code-output', 'easy',
 'What does this code return for list: 1 → 2 → 3 → null?',
 'function countNodes(head) {
  let count = 0;
  let curr = head;
  while (curr) {
    count++;
    curr = curr.next;
  }
  return count;
}',
 '["0", "2", "3", "4"]',
 '1',
 'The loop visits each node once: 1, 2, 3. Count increments 3 times.',
 4),

('linked-list', NULL, 'multiple-choice', 'easy',
 'Why do we use a dummy node in linked list problems?',
 NULL,
 '["To improve time complexity", "To simplify edge cases when the head might change", "To reduce space complexity", "It is required by all linked list algorithms"]',
 '1',
 'A dummy node eliminates special handling for operations that might modify the head (like deletion or merging).',
 5),

-- Reversal Questions
('linked-list', NULL, 'multiple-choice', 'medium',
 'When reversing a linked list iteratively, how many pointers do we need?',
 NULL,
 '["1 (curr)", "2 (curr, next)", "3 (prev, curr, next)", "4 (head, prev, curr, next)"]',
 '2',
 'We need prev (reversed portion), curr (current node), and next (to save before overwriting curr.next).',
 6),

('linked-list', NULL, 'code-output', 'medium',
 'After reversing the list 1 → 2 → 3 → 4, what is returned?',
 'function reverse(head) {
  let prev = null, curr = head;
  while (curr) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev;
}',
 '["1 → 2 → 3 → 4", "4 → 3 → 2 → 1", "null", "1"]',
 '1',
 'The list is reversed: 4 becomes the new head, pointing back to 3, 2, 1, then null.',
 7),

('linked-list', NULL, 'identify-bug', 'medium',
 'What is wrong with this reversal code?',
 'function reverse(head) {
  let prev = null, curr = head;
  while (curr) {
    curr.next = prev;  // Bug here
    prev = curr;
    curr = curr.next;
  }
  return prev;
}',
 '["prev should start as head", "We lose the next node reference before moving forward", "The while condition is wrong", "prev and curr are swapped"]',
 '1',
 'We overwrite curr.next before saving it, so curr.next is now prev and we cannot advance to the original next node.',
 8),

('linked-list', NULL, 'code-output', 'hard',
 'After this partial reversal of 1→2→3→4→5 (reverse nodes 2-4), what is the result?',
 '// Reverse from position 2 to 4 (1-indexed)
// Input: 1 → 2 → 3 → 4 → 5
// Reverse segment: 2 → 3 → 4 becomes 4 → 3 → 2',
 '["1 → 4 → 3 → 2 → 5", "4 → 3 → 2 → 1 → 5", "1 → 2 → 3 → 4 → 5", "5 → 4 → 3 → 2 → 1"]',
 '0',
 'Only the segment from position 2 to 4 is reversed. Node 1 now points to 4, and 2 points to 5.',
 9),

-- Fast/Slow Pointer Questions
('linked-list', NULL, 'multiple-choice', 'medium',
 'In the fast/slow pointer technique, how does fast move compared to slow?',
 NULL,
 '["Same speed", "Twice as fast", "Three times as fast", "Backwards"]',
 '1',
 'Fast moves 2 nodes per step (fast = fast.next.next), slow moves 1 node (slow = slow.next).',
 10),

('linked-list', NULL, 'code-output', 'medium',
 'For list 1 → 2 → 3 → 4 → 5, where does slow point when fast reaches the end?',
 'let slow = head, fast = head;
while (fast && fast.next) {
  slow = slow.next;
  fast = fast.next.next;
}
// fast is now at 5 (or null after 5)',
 '["Node 1", "Node 2", "Node 3", "Node 4"]',
 '2',
 'Fast: 1→3→5(end). Slow: 1→2→3. When fast reaches end, slow is at the middle (node 3).',
 11),

('linked-list', NULL, 'code-output', 'medium',
 'For list 1 → 2 → 3 → 4 (even length), where does slow point?',
 'let slow = head, fast = head;
while (fast && fast.next) {
  slow = slow.next;
  fast = fast.next.next;
}',
 '["Node 1", "Node 2", "Node 3", "Node 4"]',
 '2',
 'Fast: 1→3→null(past end). Slow: 1→2→3. For even lists, slow ends at the second middle node.',
 12),

('linked-list', NULL, 'true-false', 'medium',
 'If a linked list has a cycle, fast and slow pointers will eventually meet.',
 NULL,
 NULL,
 'true',
 'In a cycle, fast gains 1 node on slow each step. They will meet within the cycle.',
 13),

('linked-list', NULL, 'multiple-choice', 'hard',
 'After fast and slow meet in a cycle, how do we find the cycle start?',
 NULL,
 '["Return the meeting point", "Move one pointer to head, then both move 1 step until they meet", "Count the cycle length first", "The slow pointer is already at the start"]',
 '1',
 'Mathematical property: distance from head to cycle start equals distance from meeting point to cycle start (going forward).',
 14),

('linked-list', NULL, 'code-output', 'hard',
 'In a list with cycle: 1 → 2 → 3 → 4 → 5 → 3 (5 points back to 3), which node is the cycle start?',
 '// Nodes: 1 → 2 → 3 → 4 → 5
//                 ↑_________|
// 5.next = node 3',
 '["Node 1", "Node 2", "Node 3", "Node 5"]',
 '2',
 'The cycle starts at node 3, where 5 points back to.',
 15),

-- Remove Nth from End
('linked-list', NULL, 'multiple-choice', 'medium',
 'To remove the nth node from the end, what is the two-pointer approach?',
 NULL,
 '["Move both pointers together from start", "Move fast n steps ahead, then move both until fast reaches end", "Use slow/fast with different speeds", "Reverse the list first"]',
 '1',
 'Advance fast by n nodes first. Then move both together. When fast reaches end, slow is at the node before the target.',
 16),

('linked-list', NULL, 'code-output', 'medium',
 'For list 1→2→3→4→5, remove 2nd from end. What is the result?',
 '// n = 2 (2nd from end is node 4)
// List: 1 → 2 → 3 → 4 → 5',
 '["1→2→3→5", "1→2→4→5", "1→3→4→5", "2→3→4→5"]',
 '0',
 '2nd from end is node 4. After removal: 1→2→3→5.',
 17),

('linked-list', NULL, 'multiple-choice', 'medium',
 'Why use a dummy node when removing nth from end?',
 NULL,
 '["To improve time complexity", "To handle the case when we need to remove the head", "To reduce space complexity", "It is not needed"]',
 '1',
 'If n equals the list length, we remove the head. Dummy node simplifies this edge case.',
 18),

-- Merge Lists
('linked-list', NULL, 'code-output', 'medium',
 'Merging lists 1→3→5 and 2→4→6, what are the first 3 nodes of result?',
 'function mergeTwoLists(l1, l2) {
  const dummy = { next: null };
  let tail = dummy;
  while (l1 && l2) {
    if (l1.val <= l2.val) {
      tail.next = l1; l1 = l1.next;
    } else {
      tail.next = l2; l2 = l2.next;
    }
    tail = tail.next;
  }
  tail.next = l1 || l2;
  return dummy.next;
}',
 '["1→2→3", "1→3→2", "2→1→3", "1→3→5"]',
 '0',
 'Compare heads: 1<2 (take 1), 3>2 (take 2), 3<4 (take 3). Result starts with 1→2→3.',
 19),

('linked-list', NULL, 'multiple-choice', 'medium',
 'What is the time complexity of merging two sorted linked lists?',
 NULL,
 '["O(1)", "O(min(m,n))", "O(m + n)", "O(m × n)"]',
 '2',
 'We traverse each list once, comparing and linking nodes. Total: O(m + n).',
 20),

('linked-list', NULL, 'true-false', 'easy',
 'When merging two sorted lists, we always need to create new nodes.',
 NULL,
 NULL,
 'false',
 'We reuse existing nodes by adjusting their next pointers. No new nodes needed.',
 21),

-- Intersection and Advanced
('linked-list', NULL, 'multiple-choice', 'medium',
 'To find the intersection of two linked lists, what is the optimal approach?',
 NULL,
 '["Use a hash set to store nodes from one list", "Use two pointers that switch lists when reaching end", "Compare every pair of nodes", "Sort both lists first"]',
 '1',
 'Two pointers traverse both lists. When one reaches end, it continues from the other list''s head. They meet at intersection.',
 22),

('linked-list', NULL, 'code-output', 'hard',
 'Lists A: 1→2→3→6→7 and B: 4→5→6→7 intersect at 6. Using two pointers, where do they meet?',
 '// A: 1 → 2 → 3 ↘
//                  6 → 7
// B:     4 → 5 ↗
// pA traverses A then B, pB traverses B then A',
 '["Node 1", "Node 4", "Node 6", "They never meet"]',
 '2',
 'pA path: 1,2,3,6,7,4,5,6. pB path: 4,5,6,7,1,2,3,6. Both reach node 6 at the same step.',
 23),

('linked-list', NULL, 'multiple-choice', 'hard',
 'For "Reorder List" (L0→Ln→L1→Ln-1→...), what is the approach?',
 NULL,
 '["Use recursion only", "Find middle, reverse second half, merge alternating", "Use a stack", "Sort the list first"]',
 '1',
 'Three steps: 1) Find middle with fast/slow, 2) Reverse second half, 3) Merge two halves alternating.',
 24),

('linked-list', NULL, 'code-output', 'hard',
 'Reordering list 1→2→3→4→5, what is the result?',
 '// Steps:
// 1. Find middle: 3
// 2. Reverse second half: 5→4
// 3. Merge: 1→5→2→4→3',
 '["1→5→2→4→3", "1→2→3→4→5", "5→4→3→2→1", "1→3→5→2→4"]',
 '0',
 'L0(1)→Ln(5)→L1(2)→Ln-1(4)→L2(3). The result is 1→5→2→4→3.',
 25),

-- Edge Cases and Best Practices
('linked-list', NULL, 'multiple-choice', 'easy',
 'What should you always check before accessing node.next?',
 NULL,
 '["node.val is valid", "node is not null", "node.next.next exists", "node is the head"]',
 '1',
 'Always check if node is not null before accessing node.next to avoid null pointer exceptions.',
 26),

('linked-list', NULL, 'identify-bug', 'medium',
 'What is wrong with this cycle detection code?',
 'function hasCycle(head) {
  let slow = head, fast = head;
  while (fast.next) {  // Bug here
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}',
 '["Should check fast && fast.next", "slow should start at head.next", "Comparison should use ==", "Return value is wrong"]',
 '0',
 'Must check both fast && fast.next. If fast is null, accessing fast.next throws an error.',
 27),

('linked-list', NULL, 'true-false', 'medium',
 'Drawing diagrams is unnecessary for linked list problems if you understand the concept.',
 NULL,
 NULL,
 'false',
 'Pointer manipulation is error-prone. Drawing diagrams helps visualize state changes and catch bugs.',
 28),

('linked-list', NULL, 'multiple-choice', 'medium',
 'What is the space complexity of reversing a linked list iteratively?',
 NULL,
 '["O(1)", "O(log n)", "O(n)", "O(n²)"]',
 '0',
 'Iterative reversal only uses a constant number of pointers (prev, curr, next). O(1) space.',
 29),

('linked-list', NULL, 'multiple-choice', 'hard',
 'For "Reverse Nodes in k-Group", what is the key insight?',
 NULL,
 '["Reverse entire list, then split", "Track the node before each group and reconnect after reversal", "Use recursion for each node", "Convert to array first"]',
 '1',
 'Track the node before each k-group. After reversing the group, connect: prevGroupEnd→newGroupStart, oldGroupStart→nextGroupStart.',
 30);
