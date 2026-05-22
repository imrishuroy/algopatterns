-- Quiz Questions for Binary Search Pattern
-- Run this after the migration: psql -d algopatterns -f quiz_questions_binary_search.sql

-- Clear existing binary-search questions first
DELETE FROM quiz_questions WHERE pattern_id = 'binary-search';

-- Binary Search Fundamentals
INSERT INTO quiz_questions (pattern_id, section_slug, question_type, difficulty, question_text, code_snippet, options, correct_answer, explanation, display_order) VALUES
('binary-search', NULL, 'multiple-choice', 'easy',
 'What is the time complexity of binary search?',
 NULL,
 '["O(n)", "O(log n)", "O(n log n)", "O(1)"]',
 '1',
 'Binary search eliminates half the search space each step, resulting in O(log n) time complexity. For 1 million elements, it takes only ~20 steps.',
 1),

('binary-search', NULL, 'multiple-choice', 'easy',
 'Why is binary search compared to looking up a word in a physical dictionary?',
 NULL,
 '["Both are alphabetically sorted", "Both eliminate half the search space each step", "Both use page numbers", "Both require memorization"]',
 '1',
 'Like opening a dictionary in the middle and deciding which half to search, binary search eliminates half the remaining elements with each comparison.',
 2),

('binary-search', NULL, 'multiple-choice', 'medium',
 'What is the key requirement for applying binary search?',
 NULL,
 '["Array must have unique elements", "Array must be sorted or have a monotonic condition", "Array must have even length", "Array must contain integers"]',
 '1',
 'Binary search requires a monotonic condition - once something becomes true (or false), it stays that way. This allows eliminating half the search space.',
 3),

('binary-search', NULL, 'code-output', 'easy',
 'How many comparisons does binary search need to find an element in a sorted array of 1,000,000 elements (worst case)?',
 NULL,
 '["1,000,000", "1,000", "20", "100"]',
 '2',
 'log₂(1,000,000) ≈ 20. Binary search needs at most 20 comparisons for a million elements!',
 4),

('binary-search', NULL, 'multiple-choice', 'medium',
 'Why do we use mid = left + (right - left) / 2 instead of mid = (left + right) / 2?',
 NULL,
 '["It''s faster to compute", "To avoid integer overflow", "To round down correctly", "There''s no difference"]',
 '1',
 'When left + right exceeds Integer.MAX_VALUE, it overflows. Using left + (right - left) / 2 avoids this by never adding two large numbers.',
 5),

('binary-search', NULL, 'code-output', 'medium',
 'What does this binary search return?',
 'const nums = [1, 3, 5, 7, 9];
const target = 4;

let left = 0, right = nums.length - 1;
while (left <= right) {
  const mid = Math.floor((left + right) / 2);
  if (nums[mid] === target) return mid;
  if (nums[mid] < target) left = mid + 1;
  else right = mid - 1;
}
return -1;',
 '["1", "2", "-1", "0"]',
 '2',
 'Target 4 is not in the array [1, 3, 5, 7, 9]. The search exhausts all possibilities and returns -1.',
 6),

('binary-search', NULL, 'true-false', 'easy',
 'Binary search only works on arrays of numbers.',
 NULL,
 NULL,
 'false',
 'Binary search works on any sorted collection - strings, dates, custom objects with a comparator. It also works on "answer spaces" (binary search on answer).',
 7),

('binary-search', NULL, 'multiple-choice', 'medium',
 'When should you use while (left <= right) vs while (left < right)?',
 NULL,
 '["They are interchangeable", "Use <= for exact match, < for boundary finding", "Use < for exact match, <= for boundary finding", "Always use <="]',
 '1',
 'Use left <= right when searching for exact match (exits when left > right). Use left < right for boundary finding (exits when left == right, converging to answer).',
 8),

('binary-search', NULL, 'code-output', 'medium',
 'For array [1, 2, 2, 2, 3] and target 2, what index does lower bound return?',
 'function lowerBound(nums, target) {
  let left = 0, right = nums.length;
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] < target) left = mid + 1;
    else right = mid;
  }
  return left;
}',
 '["0", "1", "3", "4"]',
 '1',
 'Lower bound finds the first index where nums[i] >= target. The first 2 is at index 1.',
 9),

('binary-search', NULL, 'multiple-choice', 'hard',
 'In lower bound search, why do we use right = mid instead of right = mid - 1?',
 NULL,
 '["To avoid skipping elements", "Because mid could be the answer", "To prevent infinite loops", "It''s a coding convention"]',
 '1',
 'When nums[mid] >= target, mid could be the first occurrence. Using right = mid keeps it in the search space while narrowing down.',
 10);

-- Rotated Array Questions
INSERT INTO quiz_questions (pattern_id, section_slug, question_type, difficulty, question_text, code_snippet, options, correct_answer, explanation, display_order) VALUES
('binary-search', NULL, 'multiple-choice', 'medium',
 'In a rotated sorted array like [4, 5, 6, 7, 1, 2, 3], what is always true at any midpoint?',
 NULL,
 '["Both halves are sorted", "One half is always sorted", "Neither half is sorted", "The midpoint is the pivot"]',
 '1',
 'Key insight: at any midpoint, ONE half is always sorted. This lets us decide which half to search based on whether the target is in the sorted range.',
 11),

('binary-search', NULL, 'code-output', 'medium',
 'In the rotated array [4, 5, 6, 7, 1, 2, 3], which half is sorted when mid = 3 (value 7)?',
 'const nums = [4, 5, 6, 7, 1, 2, 3];
// Index:      0  1  2  3  4  5  6
// mid = 3, nums[mid] = 7
// left = 0, nums[left] = 4',
 '["Left half [4,5,6,7]", "Right half [1,2,3]", "Both halves", "Neither half"]',
 '0',
 'Since nums[left] (4) <= nums[mid] (7), the left half is sorted. The rotation point is in the right half.',
 12),

('binary-search', NULL, 'multiple-choice', 'medium',
 'How do you check if the left half is sorted in a rotated array?',
 NULL,
 '["nums[mid] < nums[right]", "nums[left] <= nums[mid]", "nums[left] < nums[right]", "nums[mid] > nums[left]"]',
 '1',
 'If nums[left] <= nums[mid], the left half from left to mid is sorted. Use <= to handle the case when left == mid.',
 13),

('binary-search', NULL, 'code-output', 'hard',
 'What is the minimum element in the rotated array [4, 5, 6, 7, 0, 1, 2]?',
 'const nums = [4, 5, 6, 7, 0, 1, 2];
// Finding minimum in rotated sorted array',
 '["4", "0", "2", "7"]',
 '1',
 'The minimum is at the rotation point. In [4, 5, 6, 7, 0, 1, 2], the array was rotated at index 4, so 0 is the minimum.',
 14),

('binary-search', NULL, 'multiple-choice', 'hard',
 'When finding minimum in rotated array, why do we compare nums[mid] with nums[right]?',
 NULL,
 '["To check if array is sorted", "To determine which half contains the minimum", "To find the maximum element", "To count rotations"]',
 '1',
 'If nums[mid] > nums[right], the minimum must be in the right half (rotation point is there). Otherwise, it''s in the left half or at mid.',
 15);

-- Binary Search on Answer
INSERT INTO quiz_questions (pattern_id, section_slug, question_type, difficulty, question_text, code_snippet, options, correct_answer, explanation, display_order) VALUES
('binary-search', NULL, 'multiple-choice', 'medium',
 'What type of problem is "Koko Eating Bananas" (find minimum eating speed)?',
 NULL,
 '["Standard binary search", "Rotated array search", "Binary search on answer", "Two pointer technique"]',
 '2',
 'Koko Eating Bananas is a classic "binary search on answer" problem. Instead of searching an array, we search the range of possible speeds.',
 16),

('binary-search', NULL, 'multiple-choice', 'medium',
 'In binary search on answer, what is the "predicate" or "canAchieve" function?',
 NULL,
 '["A function that sorts the array", "A function that checks if a given answer satisfies the constraint", "A function that finds the midpoint", "A function that reverses the array"]',
 '1',
 'The predicate (e.g., canFinish, canShip) checks if a given answer value satisfies the problem constraints. We binary search to find the optimal answer.',
 17),

('binary-search', NULL, 'code-output', 'hard',
 'For piles = [3, 6, 7, 11] and h = 8 hours, what is the minimum eating speed?',
 'const piles = [3, 6, 7, 11];
const h = 8;

// At speed k=4:
// hours = ceil(3/4) + ceil(6/4) + ceil(7/4) + ceil(11/4)
// hours = 1 + 2 + 2 + 3 = 8',
 '["3", "4", "5", "11"]',
 '1',
 'At speed 4: ceil(3/4)=1, ceil(6/4)=2, ceil(7/4)=2, ceil(11/4)=3, total=8 hours. Speed 3 would take 10 hours (too slow). Minimum speed is 4.',
 18),

('binary-search', NULL, 'multiple-choice', 'medium',
 'In "Capacity to Ship Packages", what is the minimum possible capacity?',
 NULL,
 '["1", "Sum of all weights", "Maximum weight in array", "Average weight"]',
 '2',
 'The minimum capacity must be at least the maximum weight (otherwise we can''t ship the heaviest package). The maximum capacity is the sum of all weights (ship everything in one day).',
 19),

('binary-search', NULL, 'true-false', 'medium',
 'In binary search on answer, the search space is always an array given in the input.',
 NULL,
 NULL,
 'false',
 'In binary search on answer, we define our own search space based on the problem constraints (e.g., speeds from 1 to max(piles), capacities from max(weight) to sum(weights)).',
 20);

-- Peak Element & Special Cases
INSERT INTO quiz_questions (pattern_id, section_slug, question_type, difficulty, question_text, code_snippet, options, correct_answer, explanation, display_order) VALUES
('binary-search', NULL, 'multiple-choice', 'medium',
 'In Find Peak Element, if nums[mid] < nums[mid + 1], where is the peak?',
 NULL,
 '["At mid", "In the left half", "In the right half", "Doesn''t exist"]',
 '2',
 'If nums[mid] < nums[mid + 1], we''re on a rising slope. A peak MUST exist on the right (either we keep rising and hit the boundary, or we find a peak).',
 21),

('binary-search', NULL, 'code-output', 'medium',
 'In array [1, 2, 3, 1], what is the peak element index?',
 'const nums = [1, 2, 3, 1];
// A peak is greater than its neighbors
// nums[-1] = nums[n] = -∞ (boundaries are valleys)',
 '["0", "1", "2", "3"]',
 '2',
 'At index 2, value 3 is greater than both neighbors (2 and 1). Index 2 is the peak.',
 22),

('binary-search', NULL, 'multiple-choice', 'hard',
 'Why can we use binary search for Find Peak Element even though the array isn''t sorted?',
 NULL,
 '["The array is partially sorted", "We can always determine which direction leads to a peak", "Peaks are always in the middle", "We''re searching for any peak, not a specific one"]',
 '1',
 'At any point, comparing mid with mid+1 tells us the slope direction. If rising (mid < mid+1), a peak exists on the right. This satisfies the binary search requirement.',
 23);

-- 2D Matrix Search
INSERT INTO quiz_questions (pattern_id, section_slug, question_type, difficulty, question_text, code_snippet, options, correct_answer, explanation, display_order) VALUES
('binary-search', NULL, 'multiple-choice', 'medium',
 'In a fully sorted matrix (each row starts > previous row ends), how do we convert 1D index to 2D?',
 NULL,
 '["row = mid / cols, col = mid % cols", "row = mid % cols, col = mid / cols", "row = mid / rows, col = mid % rows", "row = cols * mid, col = rows * mid"]',
 '0',
 'For a matrix with n columns: row = index / n (integer division), col = index % n (remainder). This maps 1D index to 2D coordinates.',
 24),

('binary-search', NULL, 'code-output', 'medium',
 'In a 4x3 matrix, what are the row and column for 1D index 7?',
 'const matrix = [
  [1,  2,  3 ],  // row 0
  [4,  5,  6 ],  // row 1
  [7,  8,  9 ],  // row 2
  [10, 11, 12]   // row 3
];
const cols = 3;
const index = 7;
// row = 7 / 3 = 2, col = 7 % 3 = 1',
 '["row=1, col=3", "row=2, col=1", "row=3, col=0", "row=2, col=2"]',
 '1',
 '7 / 3 = 2 (row), 7 % 3 = 1 (column). So index 7 is at row 2, column 1, which contains value 8.',
 25),

('binary-search', NULL, 'multiple-choice', 'medium',
 'For Search Matrix II (rows and columns sorted independently), why start from top-right corner?',
 NULL,
 '["It''s the maximum element", "Moving left decreases value, moving down increases value", "It''s closer to the center", "It''s the minimum element"]',
 '1',
 'From top-right: if current > target, go left (smaller). If current < target, go down (larger). Each step eliminates a row or column.',
 26);

-- Common Pitfalls
INSERT INTO quiz_questions (pattern_id, section_slug, question_type, difficulty, question_text, code_snippet, options, correct_answer, explanation, display_order) VALUES
('binary-search', NULL, 'identify-bug', 'hard',
 'What''s wrong with this binary search code?',
 'function search(nums, target) {
  let left = 0, right = nums.length - 1;
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] < target) {
      left = mid;  // Bug here!
    } else {
      right = mid - 1;
    }
  }
  return nums[left] === target ? left : -1;
}',
 '["Should use left <= right", "left = mid causes infinite loop", "right should be nums.length", "Should return mid, not left"]',
 '1',
 'When left + 1 = right and nums[mid] < target, mid = left and left = mid doesn''t move the pointer, causing an infinite loop. Use left = mid + 1.',
 27),

('binary-search', NULL, 'multiple-choice', 'medium',
 'What happens if you use while (left < right) with both left = mid + 1 and right = mid - 1?',
 NULL,
 '["Works correctly", "May skip the answer", "Infinite loop", "Array out of bounds"]',
 '1',
 'With left < right, the loop exits when left == right. If both pointers move away from mid (mid+1 and mid-1), you might skip the element where left == right.',
 28),

('binary-search', NULL, 'true-false', 'medium',
 'An empty array will cause a crash in standard binary search if not handled explicitly.',
 NULL,
 NULL,
 'false',
 'With left = 0, right = length - 1 = -1, the condition left <= right (0 <= -1) is false, so the loop never runs and returns -1 safely.',
 29),

('binary-search', NULL, 'multiple-choice', 'hard',
 'When using while (left < right) for lower bound, what should the initial value of right be?',
 NULL,
 '["nums.length - 1", "nums.length", "0", "mid"]',
 '1',
 'Use right = nums.length (not length - 1) because the answer might be "after all elements" (target > all elements). This returns length as the insertion point.',
 30);
