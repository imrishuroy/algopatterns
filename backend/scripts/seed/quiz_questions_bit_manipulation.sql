-- Quiz Questions for Bit Manipulation Pattern
-- Run: psql "postgresql://..." -f scripts/seed/quiz_questions_bit_manipulation.sql

-- Clear existing bit-manipulation questions first
DELETE FROM quiz_questions WHERE pattern_id = 'bit-manipulation';

-- Section: Bit Fundamentals
INSERT INTO quiz_questions (pattern_id, section_slug, question_type, difficulty, question_text, code_snippet, options, correct_answer, explanation, display_order) VALUES
('bit-manipulation', NULL, 'multiple-choice', 'easy',
 'What is the result of 5 & 3 (bitwise AND)?',
 '// 5 = 101
// 3 = 011',
 '["0", "1", "7", "8"]',
 '1',
 '5 (101) & 3 (011) = 001 = 1. AND returns 1 only when BOTH bits are 1.',
 1),

('bit-manipulation', NULL, 'multiple-choice', 'easy',
 'What is the result of 5 | 3 (bitwise OR)?',
 '// 5 = 101
// 3 = 011',
 '["1", "5", "7", "8"]',
 '2',
 '5 (101) | 3 (011) = 111 = 7. OR returns 1 when ANY bit is 1.',
 2),

('bit-manipulation', NULL, 'multiple-choice', 'easy',
 'What is the result of 5 ^ 5 (XOR with itself)?',
 NULL,
 '["0", "5", "10", "25"]',
 '0',
 'Any number XOR with itself equals 0. This is the key property: a ^ a = 0.',
 3),

('bit-manipulation', NULL, 'true-false', 'easy',
 'The expression n & 1 returns 1 if n is odd, and 0 if n is even.',
 NULL,
 NULL,
 'true',
 'The rightmost bit (bit 0) is 1 for odd numbers and 0 for even numbers. n & 1 isolates this bit.',
 4),

('bit-manipulation', NULL, 'code-output', 'easy',
 'What is the value of (1 << 3)?',
 '// Left shift 1 by 3 positions',
 '["3", "4", "8", "16"]',
 '2',
 '1 << 3 = 0001 << 3 = 1000 = 8. Left shift by n multiplies by 2^n.',
 5),

-- XOR Properties
('bit-manipulation', NULL, 'multiple-choice', 'easy',
 'What is the result of a ^ 0?',
 NULL,
 '["0", "a", "1", "-a"]',
 '1',
 'XOR with 0 returns the original number: a ^ 0 = a. This is the identity property.',
 6),

('bit-manipulation', NULL, 'multiple-choice', 'medium',
 'In the Single Number problem, why does XOR-ing all elements give the unique element?',
 '// Array: [2, 3, 2]
// Result: 2 ^ 3 ^ 2 = ?',
 '["XOR sorts the array", "Pairs cancel out (a ^ a = 0), leaving the unique element", "XOR finds the maximum", "XOR counts occurrences"]',
 '1',
 'Since a ^ a = 0 and a ^ 0 = a, all pairs cancel out. Only the unique element remains.',
 7),

('bit-manipulation', NULL, 'code-output', 'medium',
 'What is the result of XOR-ing [4, 1, 2, 1, 2]?',
 '// 4 ^ 1 ^ 2 ^ 1 ^ 2
// Rearrange: 4 ^ (1 ^ 1) ^ (2 ^ 2)',
 '["0", "4", "10", "1"]',
 '1',
 'Pairs (1^1) and (2^2) cancel to 0. Only 4 remains: 4 ^ 0 ^ 0 = 4.',
 8),

-- n & (n-1) Trick
('bit-manipulation', NULL, 'multiple-choice', 'medium',
 'What does n & (n-1) do?',
 NULL,
 '["Doubles the number", "Clears the rightmost 1 bit", "Sets all bits to 1", "Reverses the bits"]',
 '1',
 'n & (n-1) clears the rightmost 1 bit. This is used in counting bits and checking power of 2.',
 9),

('bit-manipulation', NULL, 'code-output', 'medium',
 'What is the result of 12 & 11?',
 '// 12 = 1100
// 11 = 1011',
 '["8", "11", "12", "3"]',
 '0',
 '12 (1100) & 11 (1011) = 1000 = 8. The rightmost 1 bit (at position 2) is cleared.',
 10),

('bit-manipulation', NULL, 'multiple-choice', 'medium',
 'How can you check if n is a power of 2 using bit manipulation?',
 NULL,
 '["n % 2 == 0", "n > 0 && (n & (n-1)) == 0", "n & 1 == 0", "(n >> 1) == n/2"]',
 '1',
 'Power of 2 has exactly one 1 bit. n & (n-1) clears it, leaving 0. Must check n > 0.',
 11),

('bit-manipulation', NULL, 'code-output', 'easy',
 'Is 8 a power of 2? What is 8 & 7?',
 '// 8 = 1000
// 7 = 0111',
 '["0 (Yes, power of 2)", "1 (No)", "8 (No)", "7 (No)"]',
 '0',
 '8 (1000) & 7 (0111) = 0. Since result is 0 and 8 > 0, it is a power of 2.',
 12),

-- Counting Bits
('bit-manipulation', NULL, 'code-output', 'medium',
 'How many 1 bits are in the number 11 (binary: 1011)?',
 '// Use n & (n-1) repeatedly
// 1011 → 1010 → 1000 → 0000',
 '["2", "3", "4", "1"]',
 '1',
 'Count steps until n becomes 0: 1011 → 1010 (1) → 1000 (2) → 0000 (3). Three 1 bits.',
 13),

('bit-manipulation', NULL, 'multiple-choice', 'medium',
 'What is the time complexity of counting 1 bits using n & (n-1)?',
 NULL,
 '["O(1)", "O(k) where k is the number of 1 bits", "O(log n)", "O(n)"]',
 '1',
 'Each n & (n-1) removes exactly one 1 bit. We loop k times where k = number of 1 bits.',
 14),

-- n & (-n) Trick
('bit-manipulation', NULL, 'multiple-choice', 'medium',
 'What does n & (-n) do?',
 NULL,
 '["Clears the rightmost 1 bit", "Isolates the rightmost 1 bit", "Returns the negative", "Counts 1 bits"]',
 '1',
 'n & (-n) isolates the rightmost 1 bit. Useful for separating elements into groups.',
 15),

('bit-manipulation', NULL, 'code-output', 'medium',
 'What is the result of 12 & (-12)?',
 '// 12 = 0...01100
// -12 = 1...10100 (two''s complement)',
 '["4", "8", "12", "0"]',
 '0',
 '12 & (-12) = 4. The rightmost 1 bit of 12 is at position 2, so the result is 100 = 4.',
 16),

-- Missing Number
('bit-manipulation', NULL, 'multiple-choice', 'medium',
 'In "Missing Number" problem, why do we XOR indices with array values?',
 '// Array [3, 0, 1] with n=3
// Missing: one number from [0, 1, 2, 3]',
 '["To sort the array", "Pairs cancel, leaving the missing number", "To find the maximum", "To count occurrences"]',
 '1',
 'XOR indices (0,1,2) + n (3) with values (3,0,1). All pairs cancel except the missing number.',
 17),

('bit-manipulation', NULL, 'code-output', 'medium',
 'For array [3, 0, 1] (n=3), what is the missing number using XOR?',
 '// xor = 3 (start with n)
// xor ^= 0 ^ 3 → 0
// xor ^= 1 ^ 0 → 1
// xor ^= 2 ^ 1 → 2',
 '["0", "1", "2", "3"]',
 '2',
 'The missing number is 2. XOR of (0,1,2,3) with (3,0,1) leaves only 2.',
 18),

-- Get/Set/Clear/Toggle Bit
('bit-manipulation', NULL, 'multiple-choice', 'easy',
 'How do you get the bit at position i in number n?',
 NULL,
 '["n & i", "(n >> i) & 1", "n | (1 << i)", "n ^ (1 << i)"]',
 '1',
 'Right shift n by i positions, then AND with 1 to isolate the bit: (n >> i) & 1.',
 19),

('bit-manipulation', NULL, 'multiple-choice', 'easy',
 'How do you set (turn ON) the bit at position i in number n?',
 NULL,
 '["n & (1 << i)", "n | (1 << i)", "n ^ (1 << i)", "(n >> i) | 1"]',
 '1',
 'OR with a mask that has only bit i set: n | (1 << i). OR with 1 always gives 1.',
 20),

('bit-manipulation', NULL, 'multiple-choice', 'easy',
 'How do you clear (turn OFF) the bit at position i in number n?',
 NULL,
 '["n & (1 << i)", "n | (1 << i)", "n & ~(1 << i)", "n ^ (1 << i)"]',
 '2',
 'AND with a mask that has bit i as 0 and all others as 1: n & ~(1 << i).',
 21),

('bit-manipulation', NULL, 'code-output', 'easy',
 'What is the value of 5 | (1 << 1)?',
 '// 5 = 101
// 1 << 1 = 010
// Set bit 1 of 5',
 '["5", "6", "7", "4"]',
 '2',
 '5 (101) | 2 (010) = 111 = 7. We set bit 1, which was already 0.',
 22),

-- Sum of Two Integers
('bit-manipulation', NULL, 'multiple-choice', 'hard',
 'In adding two numbers without + operator, what does XOR represent?',
 NULL,
 '["The carry bits", "Sum without carry", "Product", "Difference"]',
 '1',
 'XOR gives sum without considering carry: 0+0=0, 0+1=1, 1+0=1, 1+1=0 (ignores carry).',
 23),

('bit-manipulation', NULL, 'multiple-choice', 'hard',
 'In adding two numbers without + operator, what does (a & b) << 1 represent?',
 NULL,
 '["Sum without carry", "The carry bits shifted left", "Product", "Overflow"]',
 '1',
 'AND identifies where both bits are 1 (carry occurs), left shift moves carry to next position.',
 24),

('bit-manipulation', NULL, 'code-output', 'hard',
 'What is the first iteration result when adding 5 and 3 using bit manipulation?',
 '// a = 5 (101), b = 3 (011)
// sum = a ^ b = ?
// carry = (a & b) << 1 = ?',
 '["sum=6, carry=2", "sum=8, carry=0", "sum=2, carry=6", "sum=7, carry=1"]',
 '0',
 'sum = 5 ^ 3 = 101 ^ 011 = 110 = 6. carry = (5 & 3) << 1 = (001) << 1 = 010 = 2.',
 25),

-- Reverse Bits
('bit-manipulation', NULL, 'multiple-choice', 'medium',
 'To reverse bits, what is the general approach?',
 NULL,
 '["XOR all bits", "Extract each bit from right, place it from left", "Use n & (n-1) repeatedly", "Swap halves recursively"]',
 '1',
 'Extract bit at position i using (n >> i) & 1, place it at position (31-i) in result.',
 26),

('bit-manipulation', NULL, 'code-output', 'medium',
 'Reversing 8-bit number 00101011 (43), what are the first 2 bits of the result?',
 '// Original: 0 0 1 0 1 0 1 1
// Reversed: 1 1 ...',
 '["00", "01", "10", "11"]',
 '3',
 'The rightmost bits (11) become the leftmost bits. Result starts with 11.',
 27),

-- Single Number II
('bit-manipulation', NULL, 'multiple-choice', 'hard',
 'In Single Number II (elements appear 3 times except one), what technique is used?',
 NULL,
 '["XOR all elements", "Count bits at each position mod 3", "Sort and find", "Use HashMap"]',
 '1',
 'Count 1s at each bit position. If count % 3 != 0, the unique number has 1 at that position.',
 28),

('bit-manipulation', NULL, 'code-output', 'hard',
 'For [2, 2, 3, 2], what is the single number using bit counting mod 3?',
 '// 2 = 10, appears 3 times
// 3 = 11, appears 1 time
// Count at pos 0: 3 (mod 3 = 0)
// Count at pos 1: 4 (mod 3 = 1)',
 '["2", "3", "0", "1"]',
 '1',
 'Position 1: 4 ones (3 from 2s, 1 from 3), 4 % 3 = 1. Position 0: 1 one, 1 % 3 = 1. Result: 11 = 3.',
 29),

-- Single Number III
('bit-manipulation', NULL, 'multiple-choice', 'hard',
 'In Single Number III (two unique elements), after XOR-ing all elements we get a^b. How do we separate a and b?',
 NULL,
 '["Divide by 2", "Find rightmost set bit to split into two groups", "XOR again", "Use subtraction"]',
 '1',
 'Find a bit where a and b differ (rightmost 1 in a^b). Split elements by this bit, XOR each group.',
 30),

-- JavaScript Specifics
('bit-manipulation', NULL, 'true-false', 'medium',
 'In JavaScript, bitwise operations work on 64-bit numbers.',
 NULL,
 NULL,
 'false',
 'JavaScript bitwise ops work on 32-bit signed integers. Use >>> 0 for unsigned or BigInt for larger.',
 31),

('bit-manipulation', NULL, 'multiple-choice', 'medium',
 'What is the difference between >> and >>> in JavaScript?',
 NULL,
 '["No difference", ">> is arithmetic shift (preserves sign), >>> is logical shift (fills with 0)", ">>> is arithmetic shift, >> is logical", ">> is faster"]',
 '1',
 '>> preserves the sign bit (fills with 1 for negative). >>> always fills with 0 (unsigned shift).',
 32),

-- Identify Bug Questions
('bit-manipulation', NULL, 'identify-bug', 'medium',
 'What is wrong with this power of two check?',
 'function isPowerOfTwo(n) {
    return (n & (n - 1)) === 0;
}',
 '["Missing check for n > 0", "Should use OR instead of AND", "n-1 should be n+1", "Nothing is wrong"]',
 '0',
 '0 & (-1) = 0, but 0 is not a power of 2. Need: return n > 0 && (n & (n-1)) === 0.',
 33),

('bit-manipulation', NULL, 'identify-bug', 'hard',
 'What is wrong with this bit counting code?',
 'function countBits(n) {
    let count = 0;
    while (n > 0) {
        n = n & (n - 1);
        count++;
    }
    return count;
}',
 '["Should use n !== 0 instead of n > 0 for negative numbers", "Logic is wrong", "Should increment before AND", "Nothing is wrong for positive numbers"]',
 '0',
 'For negative numbers, n > 0 is always false. Use n !== 0 to handle negative numbers correctly.',
 34),

-- Two's Complement
('bit-manipulation', NULL, 'multiple-choice', 'medium',
 'In two''s complement, what is -1 represented as in binary?',
 NULL,
 '["00000001", "10000001", "11111111", "00000000"]',
 '2',
 '-1 in two''s complement is all 1s (11111111 for 8-bit). This is because ~0 + 1 = -1.',
 35),

('bit-manipulation', NULL, 'multiple-choice', 'medium',
 'To get the negative of n using bit manipulation, what is the formula?',
 NULL,
 '["~n", "~n + 1", "n - 1", "n ^ -1"]',
 '1',
 'Two''s complement: -n = ~n + 1 (flip all bits and add 1).',
 36),

-- Edge Cases
('bit-manipulation', NULL, 'multiple-choice', 'hard',
 'What is a potential issue with 1 << 31 in Java?',
 NULL,
 '["It equals 0", "It equals Integer.MIN_VALUE (negative)", "It throws an exception", "No issue"]',
 '1',
 '1 << 31 sets only the sign bit, resulting in Integer.MIN_VALUE (-2147483648). Use 1L << 31 for positive.',
 37),

('bit-manipulation', NULL, 'true-false', 'hard',
 'In two''s complement, -Integer.MIN_VALUE equals Integer.MIN_VALUE due to overflow.',
 NULL,
 NULL,
 'true',
 'MIN_VALUE has no positive equivalent in 32-bit signed int. Negating it overflows back to itself.',
 38),

-- Time/Space Complexity
('bit-manipulation', NULL, 'multiple-choice', 'easy',
 'What is the time complexity of single bit operations like AND, OR, XOR?',
 NULL,
 '["O(1)", "O(log n)", "O(n)", "O(32)"]',
 '0',
 'Single bitwise operations are O(1). They operate on fixed-size integers in constant time.',
 39),

('bit-manipulation', NULL, 'multiple-choice', 'medium',
 'What is the space complexity of most bit manipulation solutions?',
 NULL,
 '["O(n)", "O(log n)", "O(1)", "O(32)"]',
 '2',
 'Most bit manipulation uses only a few integer variables, giving O(1) space.',
 40);
