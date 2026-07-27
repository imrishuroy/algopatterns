-- Quiz Questions for Greedy Pattern
-- Run: psql "postgresql://..." -f scripts/seed/quiz_questions_greedy.sql

-- Clear existing greedy questions first
DELETE FROM quiz_questions WHERE pattern_id = 'greedy';

-- Section: Greedy Fundamentals
INSERT INTO quiz_questions (pattern_id, section_slug, question_type, difficulty, question_text, code_snippet, options, correct_answer, explanation, display_order) VALUES
('greedy', NULL, 'multiple-choice', 'easy',
 'What is the GREEDY-CHOICE PROPERTY?',
 NULL,
 '["The algorithm uses the least memory", "A locally optimal choice leads to a globally optimal solution", "The solution requires sorting first", "The algorithm runs in O(n) time"]',
 '1',
 'The greedy-choice property means making the best choice at each step without reconsidering leads to the overall best solution.',
 1),

('greedy', NULL, 'multiple-choice', 'easy',
 'What is OPTIMAL SUBSTRUCTURE in greedy algorithms?',
 NULL,
 '["The code is well-organized", "Optimal solution contains optimal solutions to subproblems", "The algorithm uses recursion", "The solution is always O(n)"]',
 '1',
 'Optimal substructure means the optimal solution to the problem contains optimal solutions to its subproblems.',
 2),

('greedy', NULL, 'true-false', 'easy',
 'Greedy algorithms always produce the optimal solution for any problem.',
 NULL,
 NULL,
 'false',
 'Greedy only works when the problem has the greedy-choice property. For problems like 0/1 Knapsack, greedy fails and DP is needed.',
 3),

('greedy', NULL, 'multiple-choice', 'easy',
 'Which keyword in a problem often signals a greedy approach might work?',
 NULL,
 '["Find all", "Count total", "Minimum number of / Maximum", "List every"]',
 '2',
 'Keywords like "minimum number of", "maximum", "optimal", "earliest", or "latest" often indicate greedy might apply.',
 4),

('greedy', NULL, 'multiple-choice', 'easy',
 'What is the key difference between Greedy and Dynamic Programming?',
 NULL,
 '["Greedy is always faster", "Greedy commits to choices; DP explores all options", "DP cannot solve optimization problems", "There is no difference"]',
 '1',
 'Greedy makes irrevocable choices at each step. DP considers all possibilities and picks the best. If greedy fails, try DP.',
 5),

-- Section: Activity Selection
('greedy', NULL, 'multiple-choice', 'medium',
 'In Activity Selection, why do we sort by END time rather than START time?',
 NULL,
 '["End time sorting is faster", "Activities that finish earliest leave maximum room for others", "Start time sorting gives wrong answer", "It does not matter which we use"]',
 '1',
 'Sorting by end time ensures we pick activities that finish earliest, leaving maximum time for subsequent activities.',
 6),

('greedy', NULL, 'code-output', 'medium',
 'Given activities with (start, end): [(1,4), (3,5), (0,6), (5,7), (8,9), (5,9)], how many maximum non-overlapping activities can be selected?',
 '// Sort by end time: [(1,4), (3,5), (0,6), (5,7), (8,9), (5,9)]
// Sorted: [(1,4), (3,5), (0,6), (5,7), (5,9), (8,9)]
// Select (1,4), then (5,7), then (8,9)',
 '["2", "3", "4", "5"]',
 '1',
 'After sorting by end time: select (1,4), skip overlapping, select (5,7), select (8,9). Total = 3 activities.',
 7),

('greedy', NULL, 'identify-bug', 'medium',
 'What is wrong with this activity selection code?',
 'function activitySelection(activities) {
  activities.sort((a, b) => a[0] - b[0]); // Bug here
  let count = 1, lastEnd = activities[0][1];
  for (let i = 1; i < activities.length; i++) {
    if (activities[i][0] >= lastEnd) {
      count++;
      lastEnd = activities[i][1];
    }
  }
  return count;
}',
 '["Should sort by END time (a[1] - b[1]), not start time", "The comparison should use > instead of >=", "count should start at 0", "lastEnd initialization is wrong"]',
 '0',
 'Activity selection requires sorting by end time to maximize non-overlapping activities. Sorting by start time gives suboptimal results.',
 8),

-- Section: Jump Game
('greedy', NULL, 'multiple-choice', 'easy',
 'In Jump Game I, what does the greedy approach track?',
 NULL,
 '["Number of jumps taken", "The farthest index reachable so far", "All possible paths", "The shortest jump at each step"]',
 '1',
 'Track the maximum reachable index. If current index exceeds max reachable, return false. If max reachable >= last index, return true.',
 9),

('greedy', NULL, 'code-output', 'medium',
 'For nums = [2,3,1,1,4], can you reach the last index?',
 'function canJump(nums) {
  let maxReach = 0;
  for (let i = 0; i < nums.length; i++) {
    if (i > maxReach) return false;
    maxReach = Math.max(maxReach, i + nums[i]);
  }
  return true;
}',
 '["true", "false"]',
 '0',
 'Index 0: maxReach = 2. Index 1: maxReach = max(2, 1+3) = 4. Since 4 >= 4 (last index), return true.',
 10),

('greedy', NULL, 'code-output', 'medium',
 'For nums = [3,2,1,0,4], can you reach the last index?',
 NULL,
 '["true", "false"]',
 '1',
 'At index 3, nums[3] = 0 and maxReach = 3. We cannot progress past index 3, so we cannot reach index 4.',
 11),

('greedy', NULL, 'code-output', 'medium',
 'For nums = [2,3,1,1,4], what is the minimum number of jumps to reach the last index?',
 'function jump(nums) {
  let jumps = 0, currentEnd = 0, farthest = 0;
  for (let i = 0; i < nums.length - 1; i++) {
    farthest = Math.max(farthest, i + nums[i]);
    if (i === currentEnd) {
      jumps++;
      currentEnd = farthest;
    }
  }
  return jumps;
}',
 '["1", "2", "3", "4"]',
 '1',
 'Jump 1: from index 0 to 1 (reach up to index 4). Jump 2: from index 1 to 4. Minimum = 2 jumps.',
 12),

-- Section: Best Time to Buy and Sell Stock
('greedy', NULL, 'multiple-choice', 'easy',
 'In Best Time to Buy and Sell Stock, what greedy insight solves the problem in O(n)?',
 NULL,
 '["Try all pairs", "Track minimum price seen so far, compute max profit at each step", "Sort the prices first", "Use two pointers from both ends"]',
 '1',
 'Track the minimum price seen. At each price, the potential profit is current - minSoFar. Keep the maximum profit.',
 13),

('greedy', NULL, 'code-output', 'medium',
 'For prices = [7,1,5,3,6,4], what is the maximum profit?',
 'function maxProfit(prices) {
  let minPrice = Infinity, maxProfit = 0;
  for (const price of prices) {
    minPrice = Math.min(minPrice, price);
    maxProfit = Math.max(maxProfit, price - minPrice);
  }
  return maxProfit;
}',
 '["4", "5", "6", "7"]',
 '1',
 'Buy at price 1 (day 2), sell at price 6 (day 5). Profit = 6 - 1 = 5.',
 14),

-- Section: Gas Station
('greedy', NULL, 'multiple-choice', 'medium',
 'In Gas Station (circular route), what key insight does the greedy solution use?',
 NULL,
 '["Start from the station with most gas", "If total gas >= total cost, a solution exists; start after the point where tank goes negative", "Always pick the cheapest station", "Use BFS to find the path"]',
 '1',
 'If total gas >= total cost, a valid starting point exists. When tank goes negative, the next station is a candidate start.',
 15),

('greedy', NULL, 'code-output', 'medium',
 'For gas = [1,2,3,4,5] and cost = [3,4,5,1,2], which station should you start from?',
 '// Total gas = 15, total cost = 15 (solution exists)
// Try starting points, track where tank goes negative',
 '["0", "1", "2", "3"]',
 '3',
 'Starting at station 3: tank = 4-1=3, then 3+5-2=6, then 6+1-3=4, then 4+2-4=2, then 2+3-5=0. Valid circuit.',
 16),

-- Section: Boats to Save People
('greedy', NULL, 'multiple-choice', 'medium',
 'In Boats to Save People (each boat holds at most 2 people with weight limit), what greedy strategy minimizes boats?',
 NULL,
 '["Put heaviest people first", "Sort by weight, pair lightest with heaviest if possible", "Random pairing", "Put lightest people first"]',
 '1',
 'Sort people by weight. Use two pointers: try to pair lightest with heaviest. If they fit, both board; otherwise heaviest goes alone.',
 17),

('greedy', NULL, 'code-output', 'medium',
 'For people = [3,2,2,1] and limit = 3, what is the minimum number of boats?',
 'function numRescueBoats(people, limit) {
  people.sort((a, b) => a - b); // [1,2,2,3]
  let boats = 0, left = 0, right = people.length - 1;
  while (left <= right) {
    if (people[left] + people[right] <= limit) left++;
    right--;
    boats++;
  }
  return boats;
}',
 '["2", "3", "4", "1"]',
 '1',
 'Sorted: [1,2,2,3]. Person 3 alone (1+3>3), boat 1. Pair (1,2)=3, boat 2. Person 2 alone, boat 3. Total = 3 boats.',
 18),

-- Section: Hand of Straights
('greedy', NULL, 'multiple-choice', 'medium',
 'In Hand of Straights (rearrange cards into groups of consecutive W cards), what greedy approach works?',
 NULL,
 '["Start groups from random cards", "Always start groups from the smallest available card", "Start groups from the largest card", "Use dynamic programming"]',
 '1',
 'Use a frequency map. Always start a new group with the smallest available card, then greedily take the next W-1 consecutive cards.',
 19),

('greedy', NULL, 'code-output', 'medium',
 'For hand = [1,2,3,6,2,3,4,7,8] and groupSize = 3, can you rearrange into groups of 3 consecutive cards?',
 '// Sort: [1,2,2,3,3,4,6,7,8]
// Group 1: [1,2,3] ✓
// Group 2: [2,3,4] ✓
// Group 3: [6,7,8] ✓',
 '["true", "false"]',
 '0',
 'Cards can form groups [1,2,3], [2,3,4], [6,7,8]. All groups are consecutive with size 3.',
 20),

-- Section: Partition Labels
('greedy', NULL, 'multiple-choice', 'medium',
 'In Partition Labels, what do we track to find minimum partitions where each letter appears in at most one part?',
 NULL,
 '["First occurrence of each character", "Last occurrence of each character", "Frequency of each character", "Alphabetical order"]',
 '1',
 'Track last occurrence of each character. A partition ends when we reach the last occurrence of all characters seen so far.',
 21),

('greedy', NULL, 'code-output', 'medium',
 'For s = "ababcbacadefegdehijhklij", what are the partition sizes?',
 '// Last occurrences computed, partition ends when index == max last occurrence seen
// Partition 1: "ababcbaca" (9 chars)
// Partition 2: "defegde" (7 chars)
// Partition 3: "hijhklij" (8 chars)',
 '["[9,7,8]", "[8,8,8]", "[10,6,8]", "[9,8,7]"]',
 '0',
 'Partitions: "ababcbaca" (9), "defegde" (7), "hijhklij" (8). Sizes = [9, 7, 8].',
 22),

-- Section: Queue Reconstruction by Height
('greedy', NULL, 'multiple-choice', 'hard',
 'In Queue Reconstruction by Height [[h,k] where k = people in front with height >= h], what sorting strategy works?',
 NULL,
 '["Sort by h ascending, then k ascending", "Sort by h descending, then k ascending; insert at index k", "Sort by k only", "No sorting needed"]',
 '1',
 'Sort by height descending (tallest first), then by k ascending. Insert each person at index k. Taller people are placed first, so k stays valid.',
 23),

('greedy', NULL, 'code-output', 'hard',
 'For people = [[7,0],[4,4],[7,1],[5,0],[6,1],[5,2]], what is the reconstructed queue?',
 '// Sort: [[7,0],[7,1],[6,1],[5,0],[5,2],[4,4]]
// Insert [7,0] at 0: [[7,0]]
// Insert [7,1] at 1: [[7,0],[7,1]]
// Insert [6,1] at 1: [[7,0],[6,1],[7,1]]
// Insert [5,0] at 0: [[5,0],[7,0],[6,1],[7,1]]
// Insert [5,2] at 2: [[5,0],[7,0],[5,2],[6,1],[7,1]]
// Insert [4,4] at 4: [[5,0],[7,0],[5,2],[6,1],[4,4],[7,1]]',
 '["[[5,0],[7,0],[5,2],[6,1],[4,4],[7,1]]", "[[7,0],[7,1],[6,1],[5,0],[5,2],[4,4]]", "[[4,4],[5,0],[5,2],[6,1],[7,0],[7,1]]", "[[7,0],[6,1],[7,1],[5,0],[5,2],[4,4]]"]',
 '0',
 'After sorting and inserting at index k: [[5,0],[7,0],[5,2],[6,1],[4,4],[7,1]].',
 24),

-- Section: Merge Triplets
('greedy', NULL, 'multiple-choice', 'medium',
 'In Merge Triplets to Form Target, what greedy filtering strategy works?',
 NULL,
 '["Use all triplets", "Only use triplets where no element exceeds the corresponding target element", "Pick the largest triplets", "Sort triplets first"]',
 '1',
 'Filter out triplets where any element exceeds target. From remaining, check if we can find triplets covering each target position.',
 25),

('greedy', NULL, 'code-output', 'medium',
 'For triplets = [[2,5,3],[1,8,4],[1,7,5]] and target = [2,7,5], can you form the target?',
 '// Filter: [2,5,3] ok (2<=2,5<=7,3<=5), [1,8,4] no (8>7), [1,7,5] ok
// From [2,5,3]: can get 2 for position 0
// From [1,7,5]: can get 7 for position 1, 5 for position 2
// All positions covered!',
 '["true", "false"]',
 '0',
 'Triplet [2,5,3] provides target[0]=2. Triplet [1,7,5] provides target[1]=7 and target[2]=5. All covered.',
 26),

-- Section: Non-Overlapping Intervals
('greedy', NULL, 'multiple-choice', 'medium',
 'To find the minimum number of intervals to REMOVE for non-overlapping, which greedy approach works?',
 NULL,
 '["Remove longest intervals", "Sort by end time, count overlaps and remove later-ending intervals", "Remove intervals with most overlaps", "Sort by start time, remove all overlaps"]',
 '1',
 'Sort by end time. For each interval, if it overlaps with previous, remove it (increment count). Keep the one ending earliest.',
 27),

('greedy', NULL, 'code-output', 'medium',
 'For intervals = [[1,2],[2,3],[3,4],[1,3]], how many intervals must be removed?',
 '// Sort by end: [[1,2],[2,3],[1,3],[3,4]]
// [1,2] keep (end=2)
// [2,3] keep (start=2 >= end=2)
// [1,3] remove (start=1 < end=3, overlaps)
// [3,4] keep',
 '["0", "1", "2", "3"]',
 '1',
 'After sorting by end time: keep [1,2], [2,3], [3,4]. Remove [1,3] which overlaps. Total removed = 1.',
 28),

-- Section: Kadane's Algorithm
('greedy', NULL, 'multiple-choice', 'easy',
 'What is the key greedy decision in Kadane''s algorithm for maximum subarray?',
 NULL,
 '["Always include all elements", "At each position, decide: extend current subarray or start fresh", "Sort the array first", "Use divide and conquer"]',
 '1',
 'At each element, choose max(current element alone, current element + previous sum). Start fresh if adding to previous sum makes it worse.',
 29),

('greedy', NULL, 'code-output', 'medium',
 'For nums = [-2,1,-3,4,-1,2,1,-5,4], what is the maximum subarray sum?',
 'function maxSubArray(nums) {
  let maxSum = nums[0], currentSum = nums[0];
  for (let i = 1; i < nums.length; i++) {
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
  }
  return maxSum;
}',
 '["4", "5", "6", "7"]',
 '2',
 'Maximum subarray is [4,-1,2,1] with sum = 6.',
 30),

-- Section: Valid Parenthesis String
('greedy', NULL, 'multiple-choice', 'hard',
 'In Valid Parenthesis String (with * as wildcard), what does the greedy range-tracking approach maintain?',
 NULL,
 '["Count of stars used", "Min and max possible open bracket count", "All possible strings", "Just the balance count"]',
 '1',
 'Track [minOpen, maxOpen] range. * can be (, ), or empty, so it affects the range. Valid if 0 is within final range.',
 31),

('greedy', NULL, 'code-output', 'hard',
 'For s = "(*)", is it a valid parenthesis string?',
 '// ( -> minOpen=1, maxOpen=1
// * -> minOpen=0, maxOpen=2 (could be empty, (, or ))
// ) -> minOpen=0 (max(0,-1)), maxOpen=1
// minOpen=0, maxOpen=1, 0 is in range [0,1] -> valid',
 '["true", "false"]',
 '0',
 'The * can act as ) making "()" or as empty making "()" still. Valid string.',
 32),

-- Section: When Greedy Fails
('greedy', NULL, 'multiple-choice', 'medium',
 'For which problem does greedy FAIL and DP is required?',
 NULL,
 '["Activity Selection", "0/1 Knapsack", "Jump Game", "Best Time to Buy and Sell Stock"]',
 '1',
 '0/1 Knapsack requires DP because taking a locally optimal item might prevent a globally better combination. Greedy only works for fractional knapsack.',
 33),

('greedy', NULL, 'multiple-choice', 'medium',
 'Why does greedy fail for Coin Change with arbitrary denominations?',
 NULL,
 '["Greedy is too slow", "Taking largest coins first may not give minimum coins", "Coins must be sorted", "It actually works for all cases"]',
 '1',
 'Example: coins [1,3,4], amount 6. Greedy: 4+1+1=3 coins. Optimal: 3+3=2 coins. Greedy fails for non-canonical coin systems.',
 34),

-- Section: Proving Correctness
('greedy', NULL, 'multiple-choice', 'hard',
 'What is the "exchange argument" used for in greedy algorithms?',
 NULL,
 '["Swapping elements in an array", "Proving that swapping a non-greedy choice with a greedy choice does not worsen the solution", "Exchanging time for space complexity", "Trading accuracy for speed"]',
 '1',
 'Exchange argument: show that any optimal solution can be transformed into the greedy solution without making it worse, proving greedy is optimal.',
 35),

('greedy', NULL, 'multiple-choice', 'hard',
 'What is the "greedy stays ahead" proof technique?',
 NULL,
 '["The greedy algorithm runs fastest", "At each step, show the greedy solution is at least as good as any other partial solution", "Greedy uses less memory", "The greedy choice is made first"]',
 '1',
 'Greedy stays ahead: prove by induction that after each greedy choice, the partial solution is at least as good as any alternative.',
 36);
