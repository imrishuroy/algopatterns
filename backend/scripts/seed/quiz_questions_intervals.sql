-- Quiz Questions for Intervals Pattern
-- Run: psql "postgresql://..." -f scripts/seed/quiz_questions_intervals.sql

-- Clear existing intervals questions first
DELETE FROM quiz_questions WHERE pattern_id = 'intervals';

-- Section: Intervals Fundamentals
INSERT INTO quiz_questions (pattern_id, section_slug, question_type, difficulty, question_text, code_snippet, options, correct_answer, explanation, display_order) VALUES
('intervals', NULL, 'multiple-choice', 'easy',
 'What is typically the first step when solving interval problems?',
 NULL,
 '["Iterate through intervals", "Sort intervals by start time (or end time)", "Count total intervals", "Find maximum end time"]',
 '1',
 'Almost all interval problems require sorting first. Sort by start time for merging, by end time for greedy selection.',
 1),

('intervals', NULL, 'multiple-choice', 'easy',
 'Two intervals [a, b] and [c, d] overlap if:',
 NULL,
 '["a < d AND c < b", "a <= c AND b >= d", "a == c", "b == c"]',
 '0',
 'Intervals overlap if one starts before the other ends AND vice versa. Equivalently: max(a,c) <= min(b,d).',
 2),

('intervals', NULL, 'true-false', 'easy',
 'Intervals [1, 3] and [3, 5] are considered overlapping in most merge problems.',
 NULL,
 NULL,
 'true',
 'When one ends exactly where another starts (touching), they are typically merged. Overlap: curr.start <= prev.end.',
 3),

('intervals', NULL, 'code-output', 'easy',
 'Do intervals [1, 4] and [5, 8] overlap?',
 '// [1, 4] ends at 4
// [5, 8] starts at 5
// 5 > 4, no overlap',
 '["Yes", "No"]',
 '1',
 'No overlap. First ends at 4, second starts at 5. There is a gap between them.',
 4),

('intervals', NULL, 'multiple-choice', 'easy',
 'What is the time complexity of most interval algorithms after sorting?',
 NULL,
 '["O(n²)", "O(n log n)", "O(n)", "O(log n)"]',
 '1',
 'Sorting is O(n log n), then single pass is O(n). Total: O(n log n), dominated by sorting.',
 5),

-- Merge Intervals
('intervals', NULL, 'multiple-choice', 'medium',
 'In Merge Intervals, how do we determine if current interval should be merged with previous?',
 NULL,
 '["If current.start == previous.end", "If current.start <= previous.end", "If current.start < previous.start", "If arrays have same length"]',
 '1',
 'Merge if current starts before or when previous ends. Then update end to max(prev.end, curr.end).',
 6),

('intervals', NULL, 'code-output', 'medium',
 'After merging [[1,3],[2,6],[8,10],[15,18]], what is the result?',
 '// Sort by start: already sorted
// [1,3] and [2,6] overlap -> [1,6]
// [1,6] and [8,10] no overlap
// [8,10] and [15,18] no overlap',
 '["[[1,6],[8,10],[15,18]]", "[[1,3],[2,6],[8,18]]", "[[1,18]]", "[[1,6],[8,18]]"]',
 '0',
 '[1,3] and [2,6] merge to [1,6]. Result: [[1,6],[8,10],[15,18]].',
 7),

('intervals', NULL, 'identify-bug', 'medium',
 'What is wrong with this merge intervals code?',
 'function merge(intervals) {
  intervals.sort((a, b) => a[0] - b[0]);
  const result = [intervals[0]];

  for (let i = 1; i < intervals.length; i++) {
    const last = result[result.length - 1];
    const curr = intervals[i];

    if (curr[0] <= last[1]) {
      last[1] = curr[1];  // Bug here
    } else {
      result.push(curr);
    }
  }
  return result;
}',
 '["Should be last[1] = Math.max(last[1], curr[1])", "Sort is wrong", "Overlap condition is wrong", "Nothing is wrong"]',
 '0',
 'curr[1] might be smaller than last[1] (e.g., [1,10] and [2,5]). Must use max(last[1], curr[1]).',
 8),

('intervals', NULL, 'code-output', 'medium',
 'Merging [[1,10],[2,5],[6,8]], what is the result?',
 '// [1,10] already covers [2,5] and [6,8]
// Result: [[1,10]]',
 '["[[1,10]]", "[[1,5],[6,10]]", "[[1,8]]", "[[2,8]]"]',
 '0',
 '[1,10] contains both [2,5] and [6,8]. All merge into single [1,10].',
 9),

-- Insert Interval
('intervals', NULL, 'multiple-choice', 'medium',
 'In Insert Interval, what are the three phases?',
 NULL,
 '["Sort, merge, return", "Add intervals before new, merge overlapping, add intervals after", "Binary search, insert, sort", "Iterate twice"]',
 '1',
 '1) Add all intervals ending before new starts. 2) Merge all overlapping. 3) Add remaining intervals.',
 10),

('intervals', NULL, 'code-output', 'medium',
 'Insert [4,8] into [[1,2],[3,5],[6,7],[8,10],[12,16]]. What is the result?',
 '// [1,2] before [4,8]
// [3,5] overlaps [4,8] -> merge to [3,8]
// [6,7] overlaps [3,8] -> merge to [3,8]
// [8,10] overlaps [3,8] -> merge to [3,10]
// [12,16] after',
 '["[[1,2],[3,10],[12,16]]", "[[1,2],[4,8],[12,16]]", "[[1,10],[12,16]]", "[[1,2],[3,8],[8,10],[12,16]]"]',
 '0',
 'All from [3,5] to [8,10] merge with [4,8] resulting in [3,10].',
 11),

-- Meeting Rooms
('intervals', NULL, 'multiple-choice', 'medium',
 'In Meeting Rooms I (can attend all?), what indicates a conflict?',
 NULL,
 '["Any meeting exists", "Two meetings overlap", "More than 3 meetings", "Meeting longer than 1 hour"]',
 '1',
 'If any two meetings overlap, person cannot attend all. Sort by start, check if any meeting starts before previous ends.',
 12),

('intervals', NULL, 'code-output', 'medium',
 'For meetings [[0,30],[5,10],[15,20]], can one person attend all?',
 '// Sort by start: [[0,30],[5,10],[15,20]]
// [5,10] starts at 5, but [0,30] ends at 30
// 5 < 30 -> overlap!',
 '["true", "false"]',
 '1',
 'False. [0,30] overlaps with [5,10] and [15,20]. Cannot attend all.',
 13),

('intervals', NULL, 'multiple-choice', 'medium',
 'In Meeting Rooms II, what are we trying to find?',
 NULL,
 '["Total meeting duration", "Minimum number of meeting rooms needed", "Maximum meeting length", "Number of conflicts"]',
 '1',
 'Find minimum rooms to host all meetings. Equivalent to maximum concurrent meetings at any time.',
 14),

('intervals', NULL, 'code-output', 'medium',
 'For meetings [[0,30],[5,10],[15,20]], how many rooms are needed?',
 '// At time 5: [0,30] and [5,10] both active -> 2 rooms
// At time 15: [0,30] and [15,20] both active -> 2 rooms
// Max concurrent = 2',
 '["1", "2", "3", "4"]',
 '1',
 'Two rooms needed. [0,30] spans entire time, overlapping with both other meetings.',
 15),

-- Line Sweep / Event Points
('intervals', NULL, 'multiple-choice', 'medium',
 'In the line sweep approach for Meeting Rooms II, what events do we create?',
 NULL,
 '["Only start times", "Only end times", "+1 for each start, -1 for each end", "Intervals directly"]',
 '2',
 'Create events: +1 when meeting starts, -1 when meeting ends. Running sum = concurrent meetings.',
 16),

('intervals', NULL, 'code-output', 'medium',
 'Using line sweep for [[1,3],[2,4],[3,5]], what is the maximum concurrent meetings?',
 '// Events: (1,+1), (2,+1), (3,+1), (3,-1), (4,-1), (5,-1)
// At time 2: count = 2
// At time 3: before processing: count = 3, then -1 = 2
// Max = 2? Actually depends on order. Start before end: max = 2',
 '["1", "2", "3", "4"]',
 '1',
 'Maximum 2 concurrent. At any point, at most 2 meetings overlap.',
 17),

('intervals', NULL, 'multiple-choice', 'hard',
 'When sorting events in line sweep, if start and end times are equal, which should come first?',
 NULL,
 '["Start event (+1)", "End event (-1)", "Doesn''t matter", "Depends on problem"]',
 '3',
 'If meeting at [1,2] and [2,3], putting end before start means they don''t need separate rooms. Problem-dependent.',
 18),

-- Non-overlapping Intervals
('intervals', NULL, 'multiple-choice', 'medium',
 'To find maximum non-overlapping intervals, how should we sort?',
 NULL,
 '["By start time", "By end time", "By interval length", "No sorting needed"]',
 '1',
 'Sort by end time. Greedily pick earliest-ending interval that doesn''t overlap with previous selection.',
 19),

('intervals', NULL, 'code-output', 'medium',
 'For intervals [[1,2],[2,3],[3,4],[1,3]], minimum removals to make non-overlapping?',
 '// Sort by end: [[1,2],[2,3],[1,3],[3,4]]
// Pick [1,2], then [2,3], then [3,4]
// [1,3] overlaps with [2,3], remove it
// Remove 1 interval',
 '["0", "1", "2", "3"]',
 '1',
 'Remove [1,3]. Keep [1,2], [2,3], [3,4] which don''t overlap. Minimum removal = 1.',
 20),

('intervals', NULL, 'multiple-choice', 'medium',
 'Minimum removal for non-overlapping equals n minus:',
 NULL,
 '["Number of overlaps", "Maximum non-overlapping intervals we can keep", "Total intervals", "Longest interval"]',
 '1',
 'Remove = total - max_non_overlapping. Find max that can coexist, remove the rest.',
 21),

-- Interval Intersection
('intervals', NULL, 'multiple-choice', 'medium',
 'When finding intersection of two sorted interval lists, what do we compute for overlapping intervals?',
 NULL,
 '["Union of the intervals", "[max(start1, start2), min(end1, end2)]", "[min(start1, start2), max(end1, end2)]", "Just the first interval"]',
 '1',
 'Intersection start = max of starts, intersection end = min of ends. Valid if start <= end.',
 22),

('intervals', NULL, 'code-output', 'medium',
 'Intersection of [[0,2],[5,10]] and [[1,5],[8,12]]?',
 '// [0,2] ∩ [1,5] = [max(0,1), min(2,5)] = [1,2]
// [5,10] ∩ [1,5] = [max(5,1), min(10,5)] = [5,5]
// [5,10] ∩ [8,12] = [max(5,8), min(10,12)] = [8,10]',
 '["[[1,2],[5,5],[8,10]]", "[[1,5],[8,10]]", "[[0,2],[8,12]]", "[[1,2],[8,10]]"]',
 '0',
 'Three intersections: [1,2], [5,5] (single point), [8,10].',
 23),

('intervals', NULL, 'multiple-choice', 'medium',
 'In interval intersection with two lists, how do we advance pointers?',
 NULL,
 '["Always advance both", "Advance the one with smaller end time", "Advance the one with larger end time", "Random"]',
 '1',
 'Advance pointer for interval that ends first - it cannot intersect with future intervals of the other list.',
 24),

-- Interval Scheduling Maximization
('intervals', NULL, 'multiple-choice', 'hard',
 'Why does sorting by end time work for maximum non-overlapping selection?',
 NULL,
 '["It is the fastest sort", "Greedy: picking earliest end leaves most room for future intervals", "End times are unique", "It doesn''t matter"]',
 '1',
 'Greedy proof: picking earliest-ending interval leaves maximum time for subsequent selections.',
 25),

('intervals', NULL, 'code-output', 'hard',
 'For activity selection [[1,4],[3,5],[0,6],[5,7],[3,9],[5,9],[6,10],[8,11],[8,12],[2,14],[12,16]], maximum non-overlapping?',
 '// Sort by end: [1,4],[3,5],[0,6],[5,7],...
// Pick [1,4], then [5,7], then [8,11], then [12,16]
// 4 activities',
 '["3", "4", "5", "6"]',
 '1',
 'Maximum 4 non-overlapping activities using greedy selection by end time.',
 26),

-- Employee Free Time
('intervals', NULL, 'multiple-choice', 'hard',
 'For "Employee Free Time" (find common free slots), what is the approach?',
 NULL,
 '["Find union of all busy times", "Merge all busy intervals, gaps are free time", "Intersect all schedules", "Sort by start only"]',
 '1',
 'Flatten and merge all busy intervals. Gaps between merged intervals are common free times.',
 27),

-- Edge Cases
('intervals', NULL, 'code-output', 'medium',
 'What is the result of merging [[1,4],[4,5]]?',
 '// [1,4] and [4,5]: start of second = end of first
// Typically: 4 <= 4, so they merge to [1,5]',
 '["[[1,4],[4,5]]", "[[1,5]]", "[[1,4]]", "[[4,5]]"]',
 '1',
 'They touch at point 4. With condition curr[0] <= last[1], they merge to [1,5].',
 28),

('intervals', NULL, 'identify-bug', 'medium',
 'What is wrong with this meeting rooms code?',
 'function canAttendAll(intervals) {
  for (let i = 0; i < intervals.length - 1; i++) {
    if (intervals[i][1] > intervals[i+1][0]) {
      return false;
    }
  }
  return true;
}',
 '["Missing sort by start time first", "Comparison should be >=", "Loop bounds are wrong", "Nothing is wrong"]',
 '0',
 'Must sort by start time first. Without sorting, adjacent intervals in array may not be adjacent in time.',
 29),

('intervals', NULL, 'multiple-choice', 'medium',
 'What data structure can efficiently support "add interval" and "query overlapping"?',
 NULL,
 '["Array only", "Interval Tree or Segment Tree", "Hash Map", "Stack"]',
 '1',
 'Interval Tree or Segment Tree supports O(log n) insertion and efficient overlap queries.',
 30);
