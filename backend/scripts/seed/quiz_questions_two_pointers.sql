-- Quiz Questions for Two Pointers Pattern
-- Run: psql "postgresql://..." -f scripts/seed/quiz_questions_two_pointers.sql

-- Clear existing two-pointers questions first
DELETE FROM quiz_questions WHERE pattern_id = 'two-pointers';

-- Section: Two Pointers Fundamentals
INSERT INTO quiz_questions (pattern_id, section_slug, question_type, difficulty, question_text, code_snippet, options, correct_answer, explanation, display_order) VALUES
('two-pointers', NULL, 'multiple-choice', 'easy',
 'What is the main benefit of using two pointers over brute force?',
 NULL,
 '["Uses less memory", "Reduces O(n²) to O(n) time complexity", "Works on unsorted arrays", "Simpler to implement"]',
 '1',
 'Two pointers eliminate redundant comparisons, reducing quadratic brute force to linear time.',
 1),

('two-pointers', NULL, 'multiple-choice', 'easy',
 'For the opposite direction two-pointer technique, where do the pointers typically start?',
 NULL,
 '["Both at the beginning", "Both at the end", "One at start, one at end", "One at middle, one at end"]',
 '2',
 'Opposite direction: left starts at index 0, right starts at the last index, and they move toward each other.',
 2),

('two-pointers', NULL, 'true-false', 'easy',
 'Two pointers technique only works on sorted arrays.',
 NULL,
 NULL,
 'false',
 'While many two-pointer problems require sorted arrays, some (like remove duplicates, fast/slow) work on unsorted arrays.',
 3),

('two-pointers', NULL, 'multiple-choice', 'easy',
 'What is the space complexity of most two-pointer algorithms?',
 NULL,
 '["O(n)", "O(log n)", "O(1)", "O(n²)"]',
 '2',
 'Two pointers use only a constant amount of extra space (just the pointer variables).',
 4),

('two-pointers', NULL, 'code-output', 'easy',
 'For sorted array [1, 2, 3, 4, 6] with target 6, which pair do the two pointers find first?',
 'let left = 0, right = 4;
// arr = [1, 2, 3, 4, 6], target = 6
// Find two numbers that sum to target',
 '["(1, 5) - indices 0 and 4", "(2, 4) - indices 1 and 3", "(3, 3) - not valid", "(1, 2) - indices 0 and 1"]',
 '1',
 'left=0 (val 1), right=4 (val 6): sum=7>6, right--. left=0, right=3: sum=5<6, left++. left=1, right=3: sum=6. Found!',
 5),

-- Opposite Direction Questions
('two-pointers', NULL, 'multiple-choice', 'medium',
 'In Two Sum II (sorted array), when should we move the left pointer right?',
 NULL,
 '["When sum > target", "When sum < target", "When sum == target", "Always move left first"]',
 '1',
 'If sum < target, we need a larger sum. Moving left pointer right increases the sum (sorted array).',
 6),

('two-pointers', NULL, 'code-output', 'medium',
 'For "Container With Most Water" with heights [1,8,6,2,5,4,8,3,7], what is the maximum area?',
 '// Width = right - left
// Height = min(heights[left], heights[right])
// Area = width * height',
 '["49", "56", "64", "42"]',
 '0',
 'Maximum area is between indices 1 and 8: width=7, height=min(8,7)=7, area=49.',
 7),

('two-pointers', NULL, 'multiple-choice', 'medium',
 'In "Container With Most Water", why do we move the pointer with the smaller height?',
 NULL,
 '["To maximize width", "Moving the taller one cannot increase area", "It is arbitrary", "To minimize height"]',
 '1',
 'Area is limited by the shorter line. Moving the shorter one might find a taller line; moving the taller one can only decrease width.',
 8),

('two-pointers', NULL, 'code-output', 'medium',
 'Is "racecar" a valid palindrome using two pointers?',
 'function isPalindrome(s) {
  let left = 0, right = s.length - 1;
  while (left < right) {
    if (s[left] !== s[right]) return false;
    left++;
    right--;
  }
  return true;
}',
 '["true", "false"]',
 '0',
 'r==r, a==a, c==c, e==e (middle). All pairs match, so it is a palindrome.',
 9),

('two-pointers', NULL, 'identify-bug', 'medium',
 'What is wrong with this two sum code?',
 'function twoSum(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left <= right) {  // Bug here
    const sum = arr[left] + arr[right];
    if (sum === target) return [left, right];
    else if (sum < target) left++;
    else right--;
  }
  return [-1, -1];
}',
 '["Should be left < right, not left <= right", "Should use !== instead of ===", "Pointers should start differently", "Return value is wrong"]',
 '0',
 'When left == right, we are using the same element twice. Condition should be left < right.',
 10),

-- Same Direction (Fast/Slow) Questions
('two-pointers', NULL, 'multiple-choice', 'medium',
 'In "Remove Duplicates from Sorted Array", what does the slow pointer represent?',
 NULL,
 '["Current element being checked", "Position to place the next unique element", "The duplicate element", "End of array"]',
 '1',
 'Slow marks where to write the next unique value. Fast scans ahead to find unique elements.',
 11),

('two-pointers', NULL, 'code-output', 'medium',
 'After removing duplicates from [1,1,2,2,3], what is the new length?',
 'function removeDuplicates(nums) {
  let slow = 0;
  for (let fast = 1; fast < nums.length; fast++) {
    if (nums[fast] !== nums[slow]) {
      slow++;
      nums[slow] = nums[fast];
    }
  }
  return slow + 1;
}',
 '["2", "3", "4", "5"]',
 '1',
 'Unique elements are [1, 2, 3]. slow ends at index 2, so length = slow + 1 = 3.',
 12),

('two-pointers', NULL, 'code-output', 'medium',
 'After "Move Zeroes" on [0,1,0,3,12], what is the array?',
 '// Move all zeroes to end, maintain order of non-zeroes',
 '["[1,3,12,0,0]", "[0,0,1,3,12]", "[1,0,3,0,12]", "[12,3,1,0,0]"]',
 '0',
 'Non-zeroes maintain relative order and move to front: [1,3,12,0,0].',
 13),

('two-pointers', NULL, 'multiple-choice', 'medium',
 'Why is fast/slow pointer useful for in-place array modification?',
 NULL,
 '["It sorts the array", "Slow tracks write position while fast reads ahead", "It uses O(n) extra space", "It reverses the array"]',
 '1',
 'Slow = where to write next valid element. Fast = scan to find valid elements. O(1) space, in-place.',
 14),

-- 3Sum Questions
('two-pointers', NULL, 'multiple-choice', 'medium',
 'How does 3Sum use two pointers?',
 NULL,
 '["Three pointers for three numbers", "Fix one number, use two pointers for the other two", "Two nested loops with two pointers", "Binary search with two pointers"]',
 '1',
 'Outer loop fixes one number. For each fixed number, use two pointers on remaining array to find pair summing to -fixed.',
 15),

('two-pointers', NULL, 'code-output', 'hard',
 'For nums = [-1,0,1,2,-1,-4], how many unique triplets sum to 0?',
 '// After sorting: [-4,-1,-1,0,1,2]
// Triplets: [-1,-1,2], [-1,0,1]',
 '["1", "2", "3", "4"]',
 '1',
 'Two unique triplets: [-1,-1,2] and [-1,0,1]. Duplicates are skipped.',
 16),

('two-pointers', NULL, 'multiple-choice', 'hard',
 'In 3Sum, how do we avoid duplicate triplets?',
 NULL,
 '["Use a hash set for results", "Skip duplicate values when moving pointers", "Sort the output", "Check each triplet against all previous"]',
 '1',
 'After finding a triplet, skip over duplicate values for all three positions to avoid generating the same triplet.',
 17),

('two-pointers', NULL, 'true-false', 'medium',
 '3Sum requires the input array to be sorted.',
 NULL,
 NULL,
 'true',
 'Sorting is essential for the two-pointer approach to work correctly and to easily skip duplicates.',
 18),

-- Floyd''s Cycle Detection
('two-pointers', NULL, 'multiple-choice', 'medium',
 'In Floyd''s cycle detection, how fast does the fast pointer move compared to slow?',
 NULL,
 '["Same speed", "Twice as fast", "Three times as fast", "Variable speed"]',
 '1',
 'Slow moves 1 step, fast moves 2 steps per iteration. If there is a cycle, they will meet.',
 19),

('two-pointers', NULL, 'true-false', 'medium',
 'If fast and slow pointers meet, there is definitely a cycle.',
 NULL,
 NULL,
 'true',
 'In a linear structure, fast would reach the end. Meeting means fast "lapped" slow inside a cycle.',
 20),

('two-pointers', NULL, 'multiple-choice', 'hard',
 'After detecting a cycle, how do we find the cycle start?',
 NULL,
 '["Count cycle length first", "Move one pointer to head, both move 1 step until they meet", "The meeting point is the start", "Use binary search"]',
 '1',
 'Reset one pointer to head. Move both at same speed (1 step). They meet at cycle start (mathematical property).',
 21),

('two-pointers', NULL, 'code-output', 'hard',
 'Can Floyd''s algorithm detect cycles in arrays (not just linked lists)?',
 '// Find Duplicate Number in [1,3,4,2,2]
// Treat value as "next pointer": index 0 → index nums[0]',
 '["Yes, by treating values as pointers", "No, only works on linked lists", "Only with extra space", "Only on sorted arrays"]',
 '0',
 'Treat nums[i] as next index. This creates an implicit linked list. Cycle exists where duplicate points back.',
 22),

-- Dutch National Flag
('two-pointers', NULL, 'multiple-choice', 'hard',
 'In "Sort Colors" (Dutch National Flag), how many pointers are used?',
 NULL,
 '["1", "2", "3", "4"]',
 '2',
 'Three pointers: low (boundary for 0s), mid (current), high (boundary for 2s). 1s end up in middle.',
 23),

('two-pointers', NULL, 'code-output', 'hard',
 'After Sort Colors on [2,0,2,1,1,0], what is the result?',
 '// 0 = red, 1 = white, 2 = blue
// Sort in order: all 0s, then 1s, then 2s',
 '["[0,0,1,1,2,2]", "[0,1,2,0,1,2]", "[2,2,1,1,0,0]", "[0,0,2,2,1,1]"]',
 '0',
 'Dutch National Flag sorts to [0,0,1,1,2,2] in one pass with three pointers.',
 24),

('two-pointers', NULL, 'multiple-choice', 'hard',
 'In Dutch National Flag, why don''t we increment mid after swapping with high?',
 NULL,
 '["We always increment mid", "The swapped value from high hasn''t been checked yet", "To avoid going out of bounds", "It is a bug"]',
 '1',
 'When swapping with high, we get an unchecked value. Must check it before moving mid. When swapping with low, both values are known.',
 25),

-- Trapping Rain Water
('two-pointers', NULL, 'multiple-choice', 'hard',
 'In "Trapping Rain Water", what determines how much water a position can hold?',
 NULL,
 '["Its own height", "min(leftMax, rightMax) - current height", "max(leftMax, rightMax)", "leftMax + rightMax"]',
 '1',
 'Water level = min of max heights on both sides. Water trapped = water level - current height (if positive).',
 26),

('two-pointers', NULL, 'code-output', 'hard',
 'For heights [0,1,0,2,1,0,1,3,2,1,2,1], how much water is trapped?',
 NULL,
 '["4", "5", "6", "7"]',
 '2',
 'Total trapped water is 6 units. Each position contributes based on min(leftMax, rightMax) - height.',
 27),

('two-pointers', NULL, 'multiple-choice', 'hard',
 'Why does the two-pointer solution for Trapping Rain Water work?',
 NULL,
 '["We only need to track one side''s max at a time", "The shorter side determines water level, so process it first", "It does not work, we need DP", "Random optimization"]',
 '1',
 'Process the side with smaller max height. That side''s water level is determined (limited by its max), regardless of other side.',
 28),

-- Edge Cases
('two-pointers', NULL, 'identify-bug', 'medium',
 'What is wrong with this palindrome check?',
 'function isPalindrome(s) {
  let left = 0, right = s.length;  // Bug here
  while (left < right) {
    if (s[left] !== s[right]) return false;
    left++;
    right--;
  }
  return true;
}',
 '["right should be s.length - 1", "Should use <= instead of <", "left should start at 1", "Return values are swapped"]',
 '0',
 's.length is out of bounds. right should be s.length - 1 (last valid index).',
 29),

('two-pointers', NULL, 'multiple-choice', 'medium',
 'When is two pointers NOT the right approach?',
 NULL,
 '["Finding pairs in sorted array", "Finding subarrays with exact sum in unsorted array", "Checking palindrome", "Removing duplicates in-place"]',
 '1',
 'Unsorted array with exact sum needs sliding window or hash map. Two pointers need sorted data for sum problems.',
 30);
