-- Quiz Questions for Heap Pattern
-- Run: psql "postgresql://..." -f scripts/seed/quiz_questions_heap.sql

-- Clear existing heap questions first
DELETE FROM quiz_questions WHERE pattern_id = 'heap';

-- Section: Heap Fundamentals
INSERT INTO quiz_questions (pattern_id, section_slug, question_type, difficulty, question_text, code_snippet, options, correct_answer, explanation, display_order) VALUES
('heap', NULL, 'multiple-choice', 'easy',
 'What is the time complexity of inserting an element into a heap?',
 NULL,
 '["O(1)", "O(log n)", "O(n)", "O(n log n)"]',
 '1',
 'Insert at the end O(1), then bubble up O(log n) to maintain heap property. Total: O(log n).',
 1),

('heap', NULL, 'multiple-choice', 'easy',
 'What is at the root of a min-heap?',
 NULL,
 '["Maximum element", "Minimum element", "Median element", "Random element"]',
 '1',
 'In a min-heap, the root is always the smallest element. Parent <= children.',
 2),

('heap', NULL, 'true-false', 'easy',
 'In Java, PriorityQueue is a min-heap by default.',
 NULL,
 NULL,
 'true',
 'Java PriorityQueue is min-heap. Use Collections.reverseOrder() or custom comparator for max-heap.',
 3),

('heap', NULL, 'multiple-choice', 'easy',
 'What is the time complexity of extracting the min/max from a heap?',
 NULL,
 '["O(1)", "O(log n)", "O(n)", "O(n log n)"]',
 '1',
 'Remove root O(1), move last to root, bubble down O(log n). Total: O(log n).',
 4),

('heap', NULL, 'code-output', 'easy',
 'After inserting [3, 1, 4, 1, 5] into a min-heap, what is the root?',
 '// Min-heap: smallest element at root
// Elements: 3, 1, 4, 1, 5',
 '["1", "3", "4", "5"]',
 '0',
 'The smallest element (1) is at the root of the min-heap.',
 5),

-- Kth Largest/Smallest
('heap', NULL, 'multiple-choice', 'medium',
 'To find the Kth LARGEST element, which heap type should you use?',
 NULL,
 '["Max-heap of size n", "Min-heap of size K", "Max-heap of size K", "Min-heap of size n"]',
 '1',
 'Min-heap of size K: root is the Kth largest. Elements smaller than Kth are removed.',
 6),

('heap', NULL, 'code-output', 'medium',
 'For nums = [3, 2, 1, 5, 6, 4] and k = 2, what is the 2nd largest element?',
 '// Sorted: 1, 2, 3, 4, 5, 6
// 2nd largest = 5',
 '["4", "5", "6", "3"]',
 '1',
 'Second largest element is 5 (largest is 6).',
 7),

('heap', NULL, 'multiple-choice', 'medium',
 'Why use a min-heap of size K for Kth largest instead of max-heap of size n?',
 NULL,
 '["Min-heap is faster", "Space: O(K) vs O(n), and O(n log K) vs O(n log n) time", "Max-heap doesn''t work", "No difference"]',
 '1',
 'Min-heap of size K: O(K) space, O(n log K) time. Much better when K << n.',
 8),

('heap', NULL, 'identify-bug', 'medium',
 'What is wrong with this Kth largest code?',
 'function findKthLargest(nums, k) {
  const maxHeap = [];
  for (let num of nums) {
    maxHeap.push(num);
    maxHeap.sort((a, b) => b - a);  // Max-heap
    if (maxHeap.length > k) maxHeap.pop();
  }
  return maxHeap[0];
}',
 '["Should use min-heap, not max-heap", "Sort direction is correct but logic is wrong", "maxHeap[0] is wrong", "Nothing is wrong"]',
 '0',
 'Max-heap keeps largest elements, but root is the largest, not Kth largest. Use min-heap: root = Kth largest.',
 9),

('heap', NULL, 'code-output', 'medium',
 'Using min-heap of size 3, after processing [7, 10, 4, 3, 20, 15], what elements remain?',
 '// Process: 7 → [7]
// 10 → [7, 10]
// 4 → [4, 7, 10]
// 3 → [4, 7, 10] (3 < 4, replace? No, 3 goes in then pop min)
// Actually: heap keeps 3 largest, so [10, 15, 20]',
 '["[3, 4, 7]", "[10, 15, 20]", "[4, 7, 10]", "[7, 10, 15]"]',
 '1',
 'Min-heap of size 3 keeps the 3 largest: [10, 15, 20]. Root (10) is the 3rd largest.',
 10),

-- Top K Frequent
('heap', NULL, 'multiple-choice', 'medium',
 'For Top K Frequent Elements, what do we put in the heap?',
 NULL,
 '["Elements directly", "(frequency, element) pairs", "Only frequencies", "Sorted array"]',
 '1',
 'Store (frequency, element) pairs. Min-heap of size K keeps K most frequent.',
 11),

('heap', NULL, 'code-output', 'medium',
 'For nums = [1,1,1,2,2,3] and k = 2, what are the top 2 frequent elements?',
 '// Frequency: 1→3, 2→2, 3→1
// Top 2 by frequency: 1 and 2',
 '["[1, 2]", "[2, 3]", "[1, 3]", "[3, 2]"]',
 '0',
 'Element 1 appears 3 times, element 2 appears 2 times. Top 2: [1, 2].',
 12),

('heap', NULL, 'multiple-choice', 'hard',
 'What is the time complexity of finding Top K Frequent using heap?',
 NULL,
 '["O(n)", "O(n log n)", "O(n log k)", "O(k log n)"]',
 '2',
 'Build frequency map O(n), then maintain heap of size K while iterating: O(n log K).',
 13),

-- Two Heaps (Median)
('heap', NULL, 'multiple-choice', 'medium',
 'In "Find Median from Data Stream", why use two heaps?',
 NULL,
 '["Performance optimization", "Max-heap for lower half, min-heap for upper half gives O(1) median access", "One heap is not enough", "To handle duplicates"]',
 '1',
 'Lower half in max-heap (top = largest of small), upper half in min-heap (top = smallest of large). Median from tops.',
 14),

('heap', NULL, 'code-output', 'medium',
 'After adding [2, 3, 4] to MedianFinder, what is the median?',
 '// Numbers: 2, 3, 4
// Sorted: 2, 3, 4
// Median (middle) = 3',
 '["2", "3", "4", "2.5"]',
 '1',
 'Median of [2, 3, 4] is 3 (middle element).',
 15),

('heap', NULL, 'code-output', 'medium',
 'After adding [1, 2, 3, 4] to MedianFinder, what is the median?',
 '// Even count: average of two middle elements
// Sorted: 1, 2, 3, 4
// Median = (2 + 3) / 2 = 2.5',
 '["2", "2.5", "3", "3.5"]',
 '1',
 'Even count: average of two middle elements. (2 + 3) / 2 = 2.5.',
 16),

('heap', NULL, 'multiple-choice', 'hard',
 'In two-heap median, how do we maintain balance?',
 NULL,
 '["Always add to smaller heap", "Add to max-heap first, then rebalance so sizes differ by at most 1", "Add alternately", "Size doesn''t matter"]',
 '1',
 'Add to max-heap, move its max to min-heap. If min-heap larger, move its min back. Keeps sizes balanced.',
 17),

('heap', NULL, 'identify-bug', 'hard',
 'What is wrong with this median finder?',
 'class MedianFinder {
  constructor() {
    this.small = [];  // max-heap
    this.large = [];  // min-heap
  }
  addNum(num) {
    this.small.push(-num);
    this.small.sort((a,b) => a-b);
    // Missing: balance step
  }
  findMedian() {
    return -this.small[0];
  }
}',
 '["Missing balance step - all elements go to small heap", "Sort direction is wrong", "findMedian is wrong", "Constructor is wrong"]',
 '0',
 'Missing the balance step: move max of small to large, then rebalance if needed.',
 18),

-- Merge K Sorted Lists
('heap', NULL, 'multiple-choice', 'medium',
 'In "Merge K Sorted Lists", what goes into the heap?',
 NULL,
 '["All nodes from all lists", "Only head nodes from each list initially", "Only the smallest elements", "Random nodes"]',
 '1',
 'Start with K head nodes. Pop min, add its next node. Heap always has at most K elements.',
 19),

('heap', NULL, 'code-output', 'medium',
 'Merging [[1,4,5], [1,3,4], [2,6]], what is the first element popped from heap?',
 '// Initial heap: 1, 1, 2 (heads of each list)
// Min = 1 (from first or second list)',
 '["1", "2", "3", "4"]',
 '0',
 'Initial heap contains heads: 1, 1, 2. Minimum is 1.',
 20),

('heap', NULL, 'multiple-choice', 'medium',
 'What is the time complexity of merging K sorted lists with total N elements?',
 NULL,
 '["O(N)", "O(N log K)", "O(NK)", "O(N log N)"]',
 '1',
 'Each of N elements is pushed/popped from heap of size K once. O(N log K).',
 21),

-- Task Scheduler
('heap', NULL, 'multiple-choice', 'hard',
 'In "Task Scheduler", why use a max-heap?',
 NULL,
 '["To process tasks alphabetically", "To always execute the task with highest remaining count first (greedy)", "Max-heap is faster", "To track cooling time"]',
 '1',
 'Greedy: execute most frequent task first to minimize idle time. Max-heap gives highest count task.',
 22),

('heap', NULL, 'code-output', 'hard',
 'For tasks = ["A","A","A","B","B","B"] and n = 2, what is minimum time?',
 '// A needs 2 intervals between executions
// Optimal: A B idle A B idle A B = 8 intervals
// Or: A B _ A B _ A B',
 '["6", "7", "8", "9"]',
 '2',
 'With cooldown n=2: A_B_A_B_A_B takes 8 time units (including idles).',
 23),

-- K Closest Points
('heap', NULL, 'multiple-choice', 'medium',
 'For "K Closest Points to Origin", which heap type is optimal?',
 NULL,
 '["Min-heap of all points", "Max-heap of size K", "Min-heap of size K", "No heap needed"]',
 '1',
 'Max-heap of size K: root is the farthest among K closest. If new point is closer, replace root.',
 24),

('heap', NULL, 'code-output', 'medium',
 'For points [[1,3],[-2,2],[5,8],[0,1]] and k = 2, which are the 2 closest to origin?',
 '// Distances: sqrt(10), sqrt(8), sqrt(89), sqrt(1)
// sqrt(1) = 1, sqrt(8) ≈ 2.83
// Closest: [0,1] and [-2,2]',
 '["[[1,3],[-2,2]]", "[[-2,2],[0,1]]", "[[5,8],[0,1]]", "[[1,3],[5,8]]"]',
 '1',
 '[0,1] has distance 1, [-2,2] has distance √8 ≈ 2.83. These are the 2 closest.',
 25),

-- Heap Implementation
('heap', NULL, 'multiple-choice', 'medium',
 'In array representation of a heap, what are the children of node at index i?',
 NULL,
 '["i+1 and i+2", "2i and 2i+1", "2i+1 and 2i+2", "i-1 and i-2"]',
 '2',
 'For 0-indexed array: children at 2i+1 and 2i+2. Parent at (i-1)/2.',
 26),

('heap', NULL, 'multiple-choice', 'medium',
 'What is "heapify" operation?',
 NULL,
 '["Insert element", "Build heap from array in O(n)", "Extract min/max", "Delete element"]',
 '1',
 'Heapify converts an array into a heap in O(n) time using bottom-up approach.',
 27),

('heap', NULL, 'true-false', 'medium',
 'A sorted array is always a valid heap.',
 NULL,
 NULL,
 'true',
 'Ascending sorted array satisfies min-heap property (parent <= children). Descending = max-heap.',
 28),

-- Edge Cases
('heap', NULL, 'identify-bug', 'medium',
 'What is wrong with this code?',
 'function kthSmallest(nums, k) {
  const minHeap = [];
  for (let num of nums) {
    minHeap.push(num);
    minHeap.sort((a, b) => a - b);
    if (minHeap.length > k) minHeap.shift();  // Remove min
  }
  return minHeap[0];
}',
 '["Removing min gives Kth largest, not smallest. Need max-heap.", "Sort is wrong", "Return value is wrong", "Nothing is wrong"]',
 '0',
 'For Kth smallest, use max-heap of size K. Current code removes smallest, keeping K largest.',
 29),

('heap', NULL, 'multiple-choice', 'medium',
 'When is a heap NOT the best choice?',
 NULL,
 '["Finding K largest elements", "Finding median from stream", "Finding if element exists", "Merge K sorted lists"]',
 '2',
 'Heap doesn''t support efficient search. Use HashSet for O(1) existence checks.',
 30);
