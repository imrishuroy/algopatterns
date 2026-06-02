-- Quiz Questions for Hash Map Pattern
-- Run: psql "postgresql://..." -f scripts/seed/quiz_questions_hash_map.sql

-- Clear existing hash-map questions first
DELETE FROM quiz_questions WHERE pattern_id = 'hash-map';

-- Section: Hash Map Fundamentals
INSERT INTO quiz_questions (pattern_id, section_slug, question_type, difficulty, question_text, code_snippet, options, correct_answer, explanation, display_order) VALUES
('hash-map', NULL, 'multiple-choice', 'easy',
 'What is the average time complexity of HashMap lookup?',
 NULL,
 '["O(n)", "O(log n)", "O(1)", "O(n²)"]',
 '2',
 'Hash tables provide O(1) average-case lookup using hash functions to compute array indices directly.',
 1),

('hash-map', NULL, 'multiple-choice', 'easy',
 'When should you use a HashSet instead of a HashMap?',
 NULL,
 '["When you need key-value pairs", "When you only need to check existence, not store values", "When order matters", "When you need sorted data"]',
 '1',
 'Use Set for existence checks only. Use Map when you need to associate values with keys.',
 2),

('hash-map', NULL, 'true-false', 'easy',
 'HashMap guarantees O(1) lookup in all cases.',
 NULL,
 NULL,
 'false',
 'Average case is O(1), but worst case (many collisions) is O(n). Good hash functions minimize collisions.',
 3),

('hash-map', NULL, 'multiple-choice', 'easy',
 'What is the space complexity of storing n elements in a HashMap?',
 NULL,
 '["O(1)", "O(log n)", "O(n)", "O(n²)"]',
 '2',
 'HashMap stores each element once, requiring O(n) space for n elements.',
 4),

('hash-map', NULL, 'multiple-choice', 'easy',
 'In JavaScript, what is the difference between Map and plain object {}?',
 NULL,
 '["No difference", "Map can have any type as key; objects only allow strings/symbols", "Objects are faster", "Map uses less memory"]',
 '1',
 'Map accepts any value as key (numbers, objects). Plain objects convert keys to strings.',
 5),

-- Two Sum Pattern
('hash-map', NULL, 'code-output', 'easy',
 'For nums = [2, 7, 11, 15] and target = 9, what does Two Sum return?',
 'function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) {
      return [seen.get(complement), i];
    }
    seen.set(nums[i], i);
  }
  return [-1, -1];
}',
 '["[0, 1]", "[1, 0]", "[0, 2]", "[2, 7]"]',
 '0',
 'At i=0: complement=7, not seen, store 2→0. At i=1: complement=2, found at index 0. Return [0,1].',
 6),

('hash-map', NULL, 'multiple-choice', 'medium',
 'In Two Sum, why check for complement BEFORE adding the current element?',
 NULL,
 '["Performance optimization", "Prevents using the same element twice", "It is just a convention", "Both approaches work the same"]',
 '1',
 'If target=6 and nums has one 3, checking after adding would find 3 as its own complement.',
 7),

('hash-map', NULL, 'identify-bug', 'medium',
 'What is wrong with this Two Sum code?',
 'function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    seen.set(nums[i], i);  // Store first
    const complement = target - nums[i];
    if (seen.has(complement)) {
      return [seen.get(complement), i];
    }
  }
  return [-1, -1];
}',
 '["Stores before checking - may return same index twice", "Loop direction is wrong", "complement calculation is wrong", "Nothing is wrong"]',
 '0',
 'Storing before checking: if target=6 and nums[i]=3, it finds itself as complement, returning [i, i].',
 8),

('hash-map', NULL, 'code-output', 'medium',
 'For nums = [3, 3] and target = 6, what should Two Sum return?',
 NULL,
 '["[0, 0]", "[0, 1]", "[1, 1]", "[-1, -1]"]',
 '1',
 'At i=0: store 3→0. At i=1: complement=3 found at index 0. Return [0, 1]. Two different indices.',
 9),

-- Frequency Counting
('hash-map', NULL, 'multiple-choice', 'medium',
 'For counting character frequencies in lowercase strings, what is more efficient than HashMap?',
 NULL,
 '["LinkedList", "int[26] array indexed by character", "TreeMap", "Stack"]',
 '1',
 'For fixed alphabet (26 letters), an array with index = char - ''a'' is faster and uses less memory.',
 10),

('hash-map', NULL, 'code-output', 'medium',
 'For nums = [1, 1, 1, 2, 2, 3], what is the frequency map?',
 'const freq = new Map();
for (let num of nums) {
  freq.set(num, (freq.get(num) || 0) + 1);
}',
 '["{1: 3, 2: 2, 3: 1}", "{1: 1, 2: 2, 3: 3}", "{1: 2, 2: 2, 3: 2}", "{3: 3, 2: 2, 1: 1}"]',
 '0',
 '1 appears 3 times, 2 appears 2 times, 3 appears 1 time.',
 11),

('hash-map', NULL, 'multiple-choice', 'medium',
 'In "Top K Frequent Elements", after building frequency map, how do we find top K?',
 NULL,
 '["Linear scan k times", "Sort by frequency or use heap/bucket sort", "Binary search", "Random sampling"]',
 '1',
 'Sort entries by frequency (O(n log n)) or use min-heap of size k (O(n log k)) or bucket sort (O(n)).',
 12),

('hash-map', NULL, 'code-output', 'medium',
 'For nums = [1,1,1,2,2,3] and k = 2, what are the top 2 frequent elements?',
 NULL,
 '["[1, 2]", "[2, 3]", "[1, 3]", "[3, 2]"]',
 '0',
 'Frequencies: 1→3, 2→2, 3→1. Top 2 by frequency: [1, 2].',
 13),

-- Group Anagrams
('hash-map', NULL, 'multiple-choice', 'medium',
 'For grouping anagrams, what makes a good hash key?',
 NULL,
 '["The string length", "The sorted version of the string", "The first character", "The string itself"]',
 '1',
 'Anagrams have identical sorted forms: "eat", "tea", "ate" all become "aet". Use as grouping key.',
 14),

('hash-map', NULL, 'code-output', 'medium',
 'For strs = ["eat","tea","tan","ate","nat","bat"], how many anagram groups exist?',
 '// Groups by sorted key:
// "aet": ["eat","tea","ate"]
// "ant": ["tan","nat"]
// "abt": ["bat"]',
 '["2", "3", "4", "6"]',
 '1',
 'Three groups: {eat,tea,ate}, {tan,nat}, {bat}.',
 15),

('hash-map', NULL, 'multiple-choice', 'hard',
 'What is an alternative to sorting for generating anagram keys?',
 NULL,
 '["Use string length", "Count character frequencies as a string (e.g., \"#1#0#0...\")", "Use hash code", "Compare character by character"]',
 '1',
 'Character count string: count each letter, join with delimiter. O(n) vs O(n log n) for sorting.',
 16),

-- Valid Anagram
('hash-map', NULL, 'code-output', 'easy',
 'Are "anagram" and "nagaram" anagrams?',
 '// anagram: a-3, n-1, g-1, r-1, m-1
// nagaram: n-1, a-3, g-1, r-1, m-1',
 '["true", "false"]',
 '0',
 'Same character frequencies. Both have: a=3, n=1, g=1, r=1, m=1.',
 17),

('hash-map', NULL, 'multiple-choice', 'medium',
 'To check if two strings are anagrams, which approach is most efficient?',
 NULL,
 '["Sort both and compare", "Count frequencies, compare counts", "Both have same complexity", "Use Set intersection"]',
 '1',
 'Frequency counting is O(n). Sorting is O(n log n). For large strings, counting is faster.',
 18),

-- Longest Consecutive Sequence
('hash-map', NULL, 'multiple-choice', 'medium',
 'In "Longest Consecutive Sequence", why use a HashSet?',
 NULL,
 '["To remove duplicates", "For O(1) lookups to check if num+1 exists", "To sort the array", "To count frequencies"]',
 '1',
 'Set enables O(1) checks for consecutive numbers (num+1, num+2, ...) without sorting.',
 19),

('hash-map', NULL, 'code-output', 'medium',
 'For nums = [100, 4, 200, 1, 3, 2], what is the longest consecutive sequence length?',
 '// Sequences: [1,2,3,4], [100], [200]
// Longest: [1,2,3,4] with length 4',
 '["2", "3", "4", "5"]',
 '2',
 'Longest consecutive sequence is [1,2,3,4] with length 4.',
 20),

('hash-map', NULL, 'multiple-choice', 'medium',
 'In Longest Consecutive Sequence, why only start counting from numbers where (num-1) is NOT in the set?',
 NULL,
 '["Performance optimization - avoids counting same sequence multiple times", "Required for correctness", "To handle negative numbers", "To save memory"]',
 '0',
 'If num-1 exists, num is not the start of a sequence. Counting only from starts makes it O(n) total.',
 21),

-- Contains Duplicate
('hash-map', NULL, 'code-output', 'easy',
 'For nums = [1, 2, 3, 1], does the array contain duplicates?',
 'function containsDuplicate(nums) {
  const seen = new Set();
  for (let num of nums) {
    if (seen.has(num)) return true;
    seen.add(num);
  }
  return false;
}',
 '["true", "false"]',
 '0',
 '1 appears twice. When we see 1 the second time, it is already in the set.',
 22),

('hash-map', NULL, 'multiple-choice', 'easy',
 'What is the most efficient way to check for duplicates?',
 NULL,
 '["Nested loops O(n²)", "Sort then scan O(n log n)", "HashSet O(n)", "All are equally efficient"]',
 '2',
 'HashSet: O(n) time, O(n) space. Each element is checked and added in O(1) average.',
 23),

-- Isomorphic Strings
('hash-map', NULL, 'multiple-choice', 'medium',
 'For checking isomorphic strings, why do we need TWO hash maps?',
 NULL,
 '["Performance optimization", "To ensure bijective (one-to-one) mapping in both directions", "One map is for caching", "Two maps are not needed"]',
 '1',
 'One map: a→b might allow a→b and c→b. Two maps ensure each char maps to exactly one other char.',
 24),

('hash-map', NULL, 'code-output', 'medium',
 'Are "egg" and "add" isomorphic?',
 '// e→a, g→d, g→d
// Mapping: e→a (new), g→d (new), g→d (consistent)
// Reverse: a→e, d→g, d→g (consistent)',
 '["true", "false"]',
 '0',
 'e↔a, g↔d. Each character maps consistently to exactly one other character.',
 25),

('hash-map', NULL, 'code-output', 'medium',
 'Are "foo" and "bar" isomorphic?',
 '// f→b, o→a, o→r
// o maps to both a and r - not consistent!',
 '["true", "false"]',
 '1',
 'o would need to map to both a and r. Inconsistent mapping, not isomorphic.',
 26),

-- First Unique Character
('hash-map', NULL, 'code-output', 'easy',
 'For s = "leetcode", what is the index of the first unique character?',
 '// Frequencies: l-1, e-3, t-1, c-1, o-1, d-1
// First unique (freq=1): l at index 0',
 '["0", "2", "4", "5"]',
 '0',
 'l appears once and is at index 0. It is the first non-repeating character.',
 27),

('hash-map', NULL, 'multiple-choice', 'medium',
 'To find first unique character, what is the optimal approach?',
 NULL,
 '["Two passes: first count frequencies, then find first with count 1", "Sort and find", "Nested loops", "Single pass with LinkedHashMap"]',
 '0',
 'Pass 1: build frequency map. Pass 2: find first char with frequency 1. O(n) time.',
 28),

-- Edge Cases
('hash-map', NULL, 'identify-bug', 'medium',
 'What is wrong with this frequency counter?',
 'function countFreq(arr) {
  const freq = {};
  for (let item of arr) {
    freq[item]++;  // Bug here
  }
  return freq;
}',
 '["freq[item] is undefined initially, becomes NaN", "Should use Map instead of object", "Loop is wrong", "Return value is wrong"]',
 '0',
 'undefined + 1 = NaN. Initialize first: freq[item] = (freq[item] || 0) + 1.',
 29),

('hash-map', NULL, 'multiple-choice', 'medium',
 'When using objects as HashMap keys in JavaScript, what problem can occur?',
 NULL,
 '["Objects are converted to \"[object Object]\" string", "Performance is slower", "Memory leaks", "No problems"]',
 '0',
 'Plain objects stringify keys. Two different objects become the same key "[object Object]". Use Map instead.',
 30);
