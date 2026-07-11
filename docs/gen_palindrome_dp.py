#!/usr/bin/env python3
"""Generate and inject comprehensive Palindrome DP article into patterns.json."""

import json

CONTENT = r"""## What is Palindrome DP?

**Palindrome DP** is a dynamic programming pattern where the subproblem is defined over a range [i, j] of a string, and the answer depends on whether the two endpoints match and whether the inner range [i+1, j-1] has the same palindromic property.

Use it when the problem asks about palindromic substrings, palindromic subsequences, minimum cuts into palindromes, or counting palindromic substructures.

---

## Foundational Concept: Substring vs. Subsequence

Before writing any recurrence, decide which type of palindrome the problem is asking about. This choice completely determines the recurrence.

| Concept | Must be Contiguous? | On Mismatch | State Type | Example from "abcbda" |
|---------|--------------------|----|---|---|
| **Palindromic Substring** | Yes | Not a palindrome (false) | Boolean | "bcb" (indices 1–3) |
| **Palindromic Subsequence** | No | Skip one end, take the best | Length (integer) | "abcba" (indices 0,1,2,3,5) |

**Concrete example using "abcbda":**
- Longest palindromic **substring** = `"bcb"` (length 3) — must be contiguous, so the 'd' at index 4 blocks extension
- Longest palindromic **subsequence** = `"abcba"` (length 5) — skip 'd', take a(0), b(1), c(2), b(3), a(5)

This single distinction drives which recurrence you write. Using the substring recurrence on a subsequence problem (or vice versa) is the most common source of wrong answers.

**Critical: Why is the state (i, j) rather than just i?**

Unlike 1D DP where a single index suffices, palindromes require knowing **both** ends of the range being examined. "Is s[i..j] a palindrome?" cannot be answered from just one endpoint. This makes Palindrome DP a specialization of **Interval DP** — every subproblem is a contiguous range, and the answer for a range depends on the answer for a smaller range.

---

## Problem Statement

Given a string `s`, find the **longest contiguous substring** that reads the same forwards and backwards.

**Primary example (used throughout this article):**
```
Input:  s = "abcbda"
Output: "bcb"
Length: 3
```

**Additional examples:**
```
Input:  s = "racecar"     Output: "racecar"   (entire string is a palindrome)
Input:  s = "aab"         Output: "aa"
Input:  s = "abcd"        Output: "a"          (no palindrome longer than 1)
```

**Edge cases:**
```
s = ""      → ""           (empty string)
s = "x"     → "x"          (single char is always a palindrome)
s = "aaaa"  → "aaaa"       (all identical, whole string qualifies)
s = "abcd"  → any single char  (no two adjacent chars match)
```

---

## The Core Decision/Insight

**At each range [i, j], one question determines everything: do the endpoints match?**

```
If s[i] == s[j]:
    [i, j] is a palindrome IF AND ONLY IF [i+1, j-1] is also a palindrome.

If s[i] != s[j]:
    [i, j] is definitively NOT a palindrome (for substring problems).
    For subsequence problems: skip one endpoint and take the better result.
```

**Connection to Interval DP:** General Interval DP searches over all possible split points k inside [i, j]. Palindrome DP fixes the "split" — always check the two endpoints and shrink inward. Same fill-order requirement, simpler recurrence.

### Tracing the decision on "abcbda"

```
Check [1, 3] = "bcb":
  s[1]='b' == s[3]='b' ✓  →  check inner [2, 2]
  [2, 2] is a single char   →  trivially true
  [1, 3] IS a palindrome ✓

Check [0, 5] = "abcbda":
  s[0]='a' == s[5]='a' ✓  →  check inner [1, 4]
  [1, 4]: s[1]='b' vs s[4]='d'  →  NOT equal
  [1, 4] is NOT a palindrome    →  [0, 5] is NOT a palindrome

Check [0, 4] = "abcbd":
  s[0]='a' == s[4]='d'? NO  →  immediately NOT a palindrome
```

The shrink-inward pattern bottoms out at two base cases:
- `i > j` (empty range): always true — reached by even-length palindromes
- `i == j` (single character): always true

---

## Approach 1: Recursion (Brute Force)

**State:** `isPalindrome(i, j)` = "is s[i..j] a palindrome?"

```
function isPalindrome(s, i, j):
    if i >= j: return true             // base: empty or single char
    if s[i] != s[j]: return false      // endpoints differ
    return isPalindrome(s, i+1, j-1)  // shrink inward

function longestPalindromeSubstring(s):
    start = 0, maxLen = 1
    for i from 0 to n-1:
        for j from i to n-1:
            if isPalindrome(s, i, j) AND j - i + 1 > maxLen:
                start = i
                maxLen = j - i + 1
    return s[start .. start+maxLen-1]
```

**Time:** O(n³) — O(n²) pairs (i, j), each verification recurses up to O(n) deep.
**Space:** O(n) recursion depth.

### Overlapping Subproblems

When multiple outer ranges share the same inner range, that inner range is verified redundantly:

```
isPalindrome(1, 3):
  s[1]='b' == s[3]='b' → isPalindrome(2, 2)   ← computed once here

isPalindrome(0, 4):
  s[0]='a' vs s[4]='d' → returns false immediately (no inner call)

Consider a string where [0,5] and [1,3] both need [2,2]:
  isPalindrome(1, 3) → isPalindrome(2, 2)          ← FIRST call
  isPalindrome(0, 5) → isPalindrome(1, 4)
                    → isPalindrome(2, 3)
                    → isPalindrome(3, 2) [base]
  (deeper nesting) → isPalindrome(2, 2)             ↑ REPEATED!

For a longer string like "XbcbX...":
  isPalindrome(1, 3)   → isPalindrome(2, 2)   ← REPEATED
  isPalindrome(0, 4)   → isPalindrome(1, 3)
                       → isPalindrome(2, 2)   ↑ REPEATED!
  isPalindrome(0, 6)   → isPalindrome(1, 5)
                       → isPalindrome(2, 4)
                       → isPalindrome(3, 3)   ← different, but [2,2] reappears elsewhere
```

Every shared inner range recomputed from different outer contexts is wasted work. Memoization eliminates this by caching each (i, j) result after its first computation.

---

## Approach 2: Memoization (Top-Down DP)

Add a 2D cache. `memo[i][j]` stores the palindrome check result once computed.

```
memo = 2D array [n][n], initialized to UNVISITED

function isPalindrome(s, i, j, memo):
    if i >= j: return true
    if memo[i][j] != UNVISITED: return memo[i][j]   // cache hit

    if s[i] != s[j]:
        memo[i][j] = false
        return false

    result = isPalindrome(s, i+1, j-1, memo)
    memo[i][j] = result
    return result
```

**Note on memo value type:** For the substring variant, memo[i][j] stores a boolean (or tri-state: UNVISITED/TRUE/FALSE). For the subsequence length variant, memo[i][j] stores an integer length. The caching principle is identical — only the stored type changes.

**Time:** O(n²) — at most n² distinct (i, j) pairs, each computed exactly once.
**Space:** O(n²) memo + O(n) recursion stack.

---

## Approach 3: Tabulation (Bottom-Up DP)

Build the palindrome table iteratively, from small ranges to large.

**State:** `dp[i][j]` = true if s[i..j] is a palindrome, false otherwise.

**Recurrence:**
```
dp[i][j] = (s[i] == s[j]) && dp[i+1][j-1]
```

**Fill order is critical:** `dp[i][j]` reads `dp[i+1][j-1]`, a smaller range. Smaller ranges must be computed first. Two equivalent strategies:

```
Strategy A — Increasing length (explicit):
    for len from 1 to n:
        for i from 0 to n-len:
            j = i + len - 1
            ...

Strategy B — Decreasing i:
    for i from n-1 down to 0:
        for j from i to n-1:
            ...
```

Both guarantee dp[i+1][j-1] is ready before dp[i][j].

**Base cases (must set explicitly before the general recurrence):**

```
// Length 1: every single character is a palindrome
for i from 0 to n-1:
    dp[i][i] = true

// Length 2: only if both chars match
for i from 0 to n-2:
    dp[i][i+1] = (s[i] == s[i+1])
```

**Critical:** Both base cases must be initialized before the length-3+ loop runs. The length-2 base case is especially important — a length-4 range [i, i+3] reads dp[i+1][i+2] (length 2). If that cell was never set, the result is corrupted silently.

**General recurrence (length 3 and above):**
```
for len from 3 to n:
    for i from 0 to n-len:
        j = i + len - 1
        dp[i][j] = (s[i] == s[j]) && dp[i+1][j-1]
```

**Extracting the final answer:**

**Critical:** The answer is **not** `dp[0][n-1]`. That cell is only true if the entire string is a palindrome. The longest palindromic substring can end anywhere. Track the maximum as you fill:

```
// Track while filling base cases and general loop:
if dp[i][j] == true AND (j - i + 1) > maxLen:
    start = i
    maxLen = j - i + 1

return s[start .. start+maxLen-1]
```

**Time:** O(n²) | **Space:** O(n²)

---

## Step-by-Step Walkthrough

String: `s = "abcbda"`, n = 6
Indices: `a=0, b=1, c=2, b=3, d=4, a=5`

### Initialize — Length 1

All single characters are palindromes. `maxLen = 1, start = 0`.

```
dp table (T=true, F=false, .=not yet computed):
     j: 0    1    2    3    4    5
i=0: [ T    .    .    .    .    . ]
i=1: [      T    .    .    .    . ]
i=2: [           T    .    .    . ]
i=3: [                T    .    . ]
i=4: [                     T    . ]
i=5: [                          T ]
```

### Fill — Length 2

`dp[i][i+1] = (s[i] == s[i+1])`

```
dp[0][1]: 'a'=='b'? NO  → F
dp[1][2]: 'b'=='c'? NO  → F
dp[2][3]: 'c'=='b'? NO  → F
dp[3][4]: 'b'=='d'? NO  → F
dp[4][5]: 'd'=='a'? NO  → F
```

No length-2 palindromes. maxLen stays 1.

```
     j: 0    1    2    3    4    5
i=0: [ T    F    .    .    .    . ]
i=1: [      T    F    .    .    . ]
i=2: [           T    F    .    . ]
i=3: [                T    F    . ]
i=4: [                     T    F ]
i=5: [                          T ]
```

### Fill — Length 3

`dp[i][j] = (s[i]==s[j]) && dp[i+1][j-1]`

```
dp[0][2]: s[0]='a' == s[2]='c'? NO → F
dp[1][3]: s[1]='b' == s[3]='b'? YES → check dp[2][2]=T → dp[1][3]=T
          "bcb" is a palindrome! length=3 > maxLen=1 → start=1, maxLen=3
dp[2][4]: s[2]='c' == s[4]='d'? NO → F
dp[3][5]: s[3]='b' == s[5]='a'? NO → F
```

```
     j: 0    1    2    3    4    5
i=0: [ T    F    F    .    .    . ]
i=1: [      T    F    T    .    . ]   ← dp[1][3]=T found "bcb"
i=2: [           T    F    F    . ]
i=3: [                T    F    F ]
i=4: [                     T    F ]
i=5: [                          T ]
maxLen=3, start=1
```

### Fill — Length 4

```
dp[0][3]: s[0]='a' == s[3]='b'? NO → F
dp[1][4]: s[1]='b' == s[4]='d'? NO → F
dp[2][5]: s[2]='c' == s[5]='a'? NO → F
```

### Fill — Length 5

```
dp[0][4]: s[0]='a' == s[4]='d'? NO → F
dp[1][5]: s[1]='b' == s[5]='a'? NO → F
```

### Fill — Length 6

```
dp[0][5]: s[0]='a' == s[5]='a'? YES → check dp[1][4]=F → dp[0][5]=F
```

### Final Table

```
     j: 0    1    2    3    4    5
i=0: [ T    F    F    F    F    F ]
i=1: [      T    F    T    F    F ]
i=2: [           T    F    F    F ]
i=3: [                T    F    F ]
i=4: [                     T    F ]
i=5: [                          T ]
```

**Answer:** `start=1, maxLen=3` → `s[1..3]` = **"bcb"**

Only one cell above the main diagonal (besides the diagonal itself) is true: `dp[1][3]`. The entire string `dp[0][5]` is false because the inner range `dp[1][4]` ("bcbd") is not a palindrome.

---

## Memoization vs. Tabulation

| Aspect | Memoization (Top-Down) | Tabulation (Bottom-Up) |
|--------|------------------------|------------------------|
| State | (i, j) pairs, filled on demand | dp[i][j] table, filled by length |
| Space | O(n²) memo + recursion stack | O(n²), no stack |
| Direction | Shrinks a range inward recursively | Builds small ranges up into larger ones |
| Computes | Only ranges actually queried | All O(n²) ranges |
| Easier to write? | Yes — mirrors the recursive check directly | Requires careful base-case + fill-order handling |

For most palindrome problems the fill-order constraint in tabulation is non-trivial to get right on the first attempt — memoization is easier to write correctly. Tabulation is preferred when stack overflow is a concern (very long strings) or when all cells will be queried anyway (partition problems scan the whole table).

---

## Beyond Standard DP

### Expand Around Center — O(n²) time, O(1) space

For substring problems only, you can avoid the DP table entirely. Start from each possible center and expand outward as long as both sides match:

```
for center from 0 to 2n-2:
    left  = center / 2           // integer division
    right = left + center % 2   // same as left for odd centers; left+1 for even

    while left >= 0 AND right < n AND s[left] == s[right]:
        // [left, right] is a palindrome — update maxLen if needed
        left--
        right++
```

The single loop over `2n-1` centers covers both odd-length (center at a character) and even-length (center between two characters) palindromes without separate cases.

**When to prefer this over the DP table:** Substring problems only. Saves O(n²) space. Cannot be extended to partition or subsequence variations that need all dp[i][j] values precomputed.

### Manacher's Algorithm — O(n) time, O(n) space

Manacher's finds the longest palindromic substring in linear time. It reuses previously computed palindrome radius values: when a new center falls inside an already-found palindrome, its radius is at least as large as the mirror center's radius, clamped to the right boundary. Use expand-around-center for interviews; Manacher's for competitive programming or when the string length is in the millions.

---

## Extending to Variations

**"What if characters don't need to be contiguous?" — Longest Palindromic Subsequence**

Change `dp[i][j]` from a boolean to a **length**:

```
If s[i] == s[j]:   dp[i][j] = 2 + dp[i+1][j-1]
If s[i] != s[j]:   dp[i][j] = max(dp[i+1][j], dp[i][j-1])
```

**Critical:** This is the most common confusion point. The substring recurrence sets dp[i][j] = false on mismatch — the range is simply not a palindrome. The subsequence recurrence keeps dp[i][j] a positive value even on mismatch, because skipping one endpoint still leaves a valid subsequence. Never set dp[i][j] = 0 on mismatch for subsequence problems.

Base cases: `dp[i][i] = 1`, `dp[i][j] = 0` when i > j. Final answer: `dp[0][n-1]` (unlike substring, the answer IS the whole-range query).

---

**"What if I need to partition the whole string with minimum cuts?" — Palindrome Partitioning II**

Two-pass approach — complete them in order:

1. Build the full boolean palindrome table (standard substring recurrence).
2. Layer a 1D cut-count DP on top:

```
cuts[j] = 0                                   if dp[0][j] is true
cuts[j] = min over all i of (cuts[i-1] + 1)  for each i where dp[i][j] is true
```

**Critical:** The palindrome table must be fully built before the cuts pass begins. The cuts pass reads dp[i][j] for all i ≤ j for every j — if any cell is uninitialized, the cut count is wrong. Never interleave the two passes.

---

**"What if I need to count palindromic substrings/subsequences?"**

For counting palindromic **substrings**: no change to the recurrence — increment a counter whenever dp[i][j] is true:

```
count = 0
for each (i, j): if dp[i][j]: count++
```

For counting distinct palindromic **subsequences**, the recurrence requires extra care to avoid double-counting when boundary characters repeat. This is a significantly harder problem ("Count Different Palindromic Subsequences", Hard).

---

**"What if one character may be deleted?" — Valid Palindrome II**

For the greedy case (at most one deletion): the standard two-pointer approach suffices without DP. When endpoints mismatch, try skipping the left endpoint or the right endpoint, and check if either remaining range is a plain palindrome.

For a general budget of k changes/deletions: add a third dimension `dp[i][j][budget]` — minimum changes to make s[i..j] a palindrome with at most `budget` operations remaining. State space becomes O(n² × k).

---

### Quick Reference

| Problem Type | Key Adaptation |
|-------------|----------------|
| Longest Palindromic Substring | Boolean dp[i][j]; track max length + start index while filling |
| Longest Palindromic Subsequence | dp[i][j] = length; stays valid (via max of neighbors) on mismatch |
| Palindrome Partitioning II | Layer a 1D cut-count DP on top of the fully-built palindrome table |
| Count Palindromic Substrings | Increment a counter whenever dp[i][j] is true |
| Valid Palindrome II | Two-pointer with one retry on mismatch (greedy); or add a budget dimension |

---

## Debugging Checklist

- [ ] Filling the table so dp[i+1][j-1] is always computed before dp[i][j]? (i decreasing, or fill by increasing length)
- [ ] Both base cases set explicitly — length 1 (always true) and length 2 (s[i] == s[i+1])?
- [ ] For substring problems, tracking max length AND its starting index, not just a boolean?
- [ ] For subsequence problems, does dp[i][j] stay valid (via max of neighbors) when characters differ, instead of becoming false?
- [ ] Loop bounds preventing access to dp[i+1][j-1] when range length is less than 2? (the length-3+ loop handles this)
- [ ] If solving a partition problem, is the palindrome table fully built BEFORE the cut-count pass begins?
- [ ] Avoiding an O(n) inner scan to re-verify palindromes instead of reusing the memo/table?

---

## Common Mistakes

1. **Re-verifying palindromes with an O(n) scan** instead of reusing the O(n²) table. This silently degrades to O(n³) even though a table exists, because the table cells aren't being read.

2. **Using the substring recurrence for a subsequence problem** (or vice versa). The substring version sets dp[i][j] = false on mismatch. The subsequence version takes max(dp[i+1][j], dp[i][j-1]) on mismatch. Using the wrong one produces an answer that compiles and runs but is numerically wrong.

3. **Skipping or miscomputing the length-2 base case.** The general recurrence for length 3 reads dp[i+1][j-1], which is a length-1 cell — already initialized. But length 4 reads a length-2 cell. If the length-2 base case is missing, every length-4+ range that depends on it is corrupted silently.

4. **Assuming dp[0][n-1] is the answer for Longest Palindromic Substring.** That cell is true only if the entire string is a palindrome. The correct answer is the max-length true cell anywhere in the table, tracked as you fill.

5. **Filling the table in the wrong direction.** Increasing i with j fixed (or other orders that mix i and j incorrectly) reads dp[i+1][j-1] before it is computed, producing wrong results that are hard to diagnose because the table partially fills correctly.

6. **Mixing the palindrome table pass and the cut-count pass** in partition problems. The cut-count DP reads dp[i][j] for all i ≤ j. If the palindrome table is not fully built yet, cells may be uninitialized (false), causing the cut count to overestimate.

---

## Practice Problems

**Easy:**
- Valid Palindrome — two-pointer check, no DP; foundational understanding of the palindrome property
- Palindrome Partitioning — enumerate all valid partitions using backtracking; use palindrome check as a pruning condition

**Medium:**
- Longest Palindromic Substring — primary problem of this pattern
- Palindromic Substrings — count all palindromic substrings; same table, just count true cells
- Longest Palindromic Subsequence — subsequence variant; change boolean to length, handle mismatch with max of neighbors
- Valid Palindrome II — at most one deletion; greedy two-pointer with one retry on mismatch

**Hard:**
- Palindrome Partitioning II — minimum cuts; palindrome table + 1D cut DP layered on top
- Count Different Palindromic Subsequences — counting with duplicate avoidance; significantly harder recurrence
- Shortest Palindrome — build on prefix palindrome detection; reduces to a KMP or hashing problem"""

TEMPLATE_RECURSION = r"""// Palindrome DP - Recursion
// At each range [i, j]: check s[i] == s[j], then recurse inward to [i+1, j-1]
// Base: i >= j → true (empty or single char is always a palindrome)
// TIME: O(n^3), SPACE: O(n) recursion depth

// VARIATION 1: Longest Palindromic Substring (boolean check + max tracking)
boolean isPalindrome(String s, int i, int j) {
    if (i >= j) return true;
    if (s.charAt(i) != s.charAt(j)) return false;
    return isPalindrome(s, i + 1, j - 1);
}

// Scan all pairs (i, j), track the longest true range
int start = 0, maxLen = 1;
for (int i = 0; i < n; i++)
    for (int j = i; j < n; j++)
        if (isPalindrome(s, i, j) && j - i + 1 > maxLen) { start = i; maxLen = j - i + 1; }
// Answer: s.substring(start, start + maxLen)

// VARIATION 2: Longest Palindromic Subsequence (length, valid even on mismatch)
int lps(String s, int i, int j) {
    if (i == j) return 1;                                              // single char
    if (i > j)  return 0;                                              // empty range
    if (s.charAt(i) == s.charAt(j))
        return 2 + lps(s, i + 1, j - 1);                             // match: extend both ends
    return Math.max(lps(s, i + 1, j), lps(s, i, j - 1));            // no match: skip one end
}
// Call: lps(s, 0, n-1)

// VARIATION 3: Min Cuts for Palindrome Partitioning (built on top of palindrome table)
// Step 1 — compute isPalindrome(i,j) for all pairs (using recursion or table)
// Step 2 — layer a 1D cuts DP on top:
int[] cuts = new int[n]; Arrays.fill(cuts, Integer.MAX_VALUE);
for (int j = 0; j < n; j++) {
    if (isPalindrome(s, 0, j)) { cuts[j] = 0; continue; }
    for (int i = 1; i <= j; i++)
        if (isPalindrome(s, i, j))
            cuts[j] = Math.min(cuts[j], cuts[i - 1] + 1);
}
// Answer: cuts[n-1]"""

TEMPLATE_MEMOIZATION = r"""// Palindrome DP - Memoization (Top-Down)
// Cache (i, j) results: boolean for substring, int for subsequence length
// TIME: O(n^2) states × O(1) per state = O(n^2), SPACE: O(n^2) memo + O(n) stack

// VARIATION 1: Longest Palindromic Substring
int[][] memo = new int[n][n]; // 0=unvisited, 1=palindrome, -1=not palindrome

boolean isPalindrome(String s, int i, int j) {
    if (i >= j) return true;
    if (memo[i][j] != 0) return memo[i][j] == 1;      // cache hit
    boolean res = s.charAt(i) == s.charAt(j) && isPalindrome(s, i + 1, j - 1);
    memo[i][j] = res ? 1 : -1;
    return res;
}

int start = 0, maxLen = 1;
for (int i = 0; i < n; i++)
    for (int j = i; j < n; j++)
        if (isPalindrome(s, i, j) && j - i + 1 > maxLen) { start = i; maxLen = j - i + 1; }
// Answer: s.substring(start, start + maxLen)

// VARIATION 2: Longest Palindromic Subsequence
int[][] memo = new int[n][n];
for (int[] row : memo) Arrays.fill(row, -1); // -1 = unvisited

int lps(String s, int i, int j) {
    if (i == j) return 1;
    if (i > j)  return 0;
    if (memo[i][j] != -1) return memo[i][j];          // cache hit
    if (s.charAt(i) == s.charAt(j))
        memo[i][j] = 2 + lps(s, i + 1, j - 1);
    else
        memo[i][j] = Math.max(lps(s, i + 1, j), lps(s, i, j - 1));
    return memo[i][j];
}
// Answer: lps(s, 0, n-1)"""

TEMPLATE_TABULATION = r"""// Palindrome DP - Tabulation (Bottom-Up)
// Fill dp[i][j] by INCREASING LENGTH — guarantees dp[i+1][j-1] ready before dp[i][j]
// TIME: O(n^2), SPACE: O(n^2)

// VARIATION 1: Longest Palindromic Substring
boolean[][] dp = new boolean[n][n];
int start = 0, maxLen = 1;

// Base: length 1 (every single char is a palindrome)
for (int i = 0; i < n; i++) dp[i][i] = true;

// Base: length 2 — MUST handle separately before the general loop
for (int i = 0; i < n - 1; i++) {
    if (s.charAt(i) == s.charAt(i + 1)) {
        dp[i][i + 1] = true;
        if (maxLen < 2) { start = i; maxLen = 2; }
    }
}

// General: length 3+
for (int len = 3; len <= n; len++) {
    for (int i = 0; i <= n - len; i++) {
        int j = i + len - 1;
        if (s.charAt(i) == s.charAt(j) && dp[i + 1][j - 1]) {
            dp[i][j] = true;
            if (len > maxLen) { start = i; maxLen = len; }
        }
    }
}
// Answer: s.substring(start, start + maxLen)  — NOT dp[0][n-1]

// VARIATION 2: Longest Palindromic Subsequence
int[][] dp = new int[n][n];
for (int i = 0; i < n; i++) dp[i][i] = 1; // base: length 1

for (int len = 2; len <= n; len++) {
    for (int i = 0; i <= n - len; i++) {
        int j = i + len - 1;
        if (s.charAt(i) == s.charAt(j))
            dp[i][j] = 2 + (len == 2 ? 0 : dp[i + 1][j - 1]);
        else
            dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1]);
    }
}
// Answer: dp[0][n-1]"""

TEMPLATE_SPACE_OPTIMIZED = r"""// Palindrome DP - Expand Around Center
// O(1) space for SUBSTRING problems — no dp table needed
// TIME: O(n^2), SPACE: O(1)

// Single loop over 2n-1 centers covers both odd- and even-length palindromes
int start = 0, maxLen = 1;
for (int center = 0; center < 2 * n - 1; center++) {
    int left  = center / 2;
    int right = left + center % 2;  // same as left for odd; left+1 for even centers

    while (left >= 0 && right < n && s.charAt(left) == s.charAt(right)) {
        if (right - left + 1 > maxLen) { start = left; maxLen = right - left + 1; }
        left--;
        right++;
    }
}
// Answer: s.substring(start, start + maxLen)

// Manacher's Algorithm — O(n) time, O(n) space
// When a new center falls inside an already-found palindrome, its radius is at least
// the mirror center's radius (clamped to the right boundary). Eliminates redundant work.
// Use expand-around-center for interviews; Manacher's for competitive programming.
//
// This approach does NOT extend to subsequence or partition variations —
// those require the full O(n^2) dp table."""

APPROACH_RECURSION_JAVA = r"""// Longest Palindromic Substring - Recursion
// TIME: O(n^3), SPACE: O(n)

class Solution {
    public String longestPalindrome(String s) {
        int n = s.length();
        int start = 0, maxLen = 1;

        for (int i = 0; i < n; i++) {
            for (int j = i; j < n; j++) {
                if (isPalindrome(s, i, j) && j - i + 1 > maxLen) {
                    start = i;
                    maxLen = j - i + 1;
                }
            }
        }
        return s.substring(start, start + maxLen);
    }

    private boolean isPalindrome(String s, int i, int j) {
        if (i >= j) return true;
        if (s.charAt(i) != s.charAt(j)) return false;
        return isPalindrome(s, i + 1, j - 1);
    }
}"""

APPROACH_RECURSION_JS = r"""// Longest Palindromic Substring - Recursion
// TIME: O(n^3), SPACE: O(n)

function longestPalindrome(s) {
    const n = s.length;
    let start = 0, maxLen = 1;

    function isPalindrome(i, j) {
        if (i >= j) return true;
        if (s[i] !== s[j]) return false;
        return isPalindrome(i + 1, j - 1);
    }

    for (let i = 0; i < n; i++) {
        for (let j = i; j < n; j++) {
            if (isPalindrome(i, j) && j - i + 1 > maxLen) {
                start = i;
                maxLen = j - i + 1;
            }
        }
    }
    return s.slice(start, start + maxLen);
}"""

APPROACH_MEMOIZATION_JAVA = r"""// Longest Palindromic Substring - Memoization
// TIME: O(n^2), SPACE: O(n^2)

class Solution {
    private int[][] memo;

    public String longestPalindrome(String s) {
        int n = s.length();
        memo = new int[n][n]; // 0=unvisited, 1=palindrome, -1=not palindrome
        int start = 0, maxLen = 1;

        for (int i = 0; i < n; i++) {
            for (int j = i; j < n; j++) {
                if (isPalindrome(s, i, j) && j - i + 1 > maxLen) {
                    start = i;
                    maxLen = j - i + 1;
                }
            }
        }
        return s.substring(start, start + maxLen);
    }

    private boolean isPalindrome(String s, int i, int j) {
        if (i >= j) return true;
        if (memo[i][j] != 0) return memo[i][j] == 1;
        boolean result = s.charAt(i) == s.charAt(j) && isPalindrome(s, i + 1, j - 1);
        memo[i][j] = result ? 1 : -1;
        return result;
    }
}"""

APPROACH_MEMOIZATION_JS = r"""// Longest Palindromic Substring - Memoization
// TIME: O(n^2), SPACE: O(n^2)

function longestPalindrome(s) {
    const n = s.length;
    // 0=unvisited, 1=palindrome, -1=not palindrome
    const memo = Array.from({length: n}, () => new Array(n).fill(0));
    let start = 0, maxLen = 1;

    function isPalindrome(i, j) {
        if (i >= j) return true;
        if (memo[i][j] !== 0) return memo[i][j] === 1;
        const result = s[i] === s[j] && isPalindrome(i + 1, j - 1);
        memo[i][j] = result ? 1 : -1;
        return result;
    }

    for (let i = 0; i < n; i++) {
        for (let j = i; j < n; j++) {
            if (isPalindrome(i, j) && j - i + 1 > maxLen) {
                start = i;
                maxLen = j - i + 1;
            }
        }
    }
    return s.slice(start, start + maxLen);
}"""

APPROACH_TABULATION_JAVA = r"""// Longest Palindromic Substring - Tabulation
// Fill by increasing length so dp[i+1][j-1] is always ready
// TIME: O(n^2), SPACE: O(n^2)

class Solution {
    public String longestPalindrome(String s) {
        int n = s.length();
        boolean[][] dp = new boolean[n][n];
        int start = 0, maxLen = 1;

        // Base: length 1
        for (int i = 0; i < n; i++) dp[i][i] = true;

        // Base: length 2
        for (int i = 0; i < n - 1; i++) {
            if (s.charAt(i) == s.charAt(i + 1)) {
                dp[i][i + 1] = true;
                start = i;
                maxLen = 2;
            }
        }

        // General: length 3 and above
        for (int len = 3; len <= n; len++) {
            for (int i = 0; i <= n - len; i++) {
                int j = i + len - 1;
                if (s.charAt(i) == s.charAt(j) && dp[i + 1][j - 1]) {
                    dp[i][j] = true;
                    if (len > maxLen) {
                        start = i;
                        maxLen = len;
                    }
                }
            }
        }

        return s.substring(start, start + maxLen);
    }
}"""

APPROACH_TABULATION_JS = r"""// Longest Palindromic Substring - Tabulation
// Fill by increasing length so dp[i+1][j-1] is always ready
// TIME: O(n^2), SPACE: O(n^2)

function longestPalindrome(s) {
    const n = s.length;
    const dp = Array.from({length: n}, () => new Array(n).fill(false));
    let start = 0, maxLen = 1;

    // Base: length 1
    for (let i = 0; i < n; i++) dp[i][i] = true;

    // Base: length 2
    for (let i = 0; i < n - 1; i++) {
        if (s[i] === s[i + 1]) {
            dp[i][i + 1] = true;
            start = i;
            maxLen = 2;
        }
    }

    // General: length 3 and above
    for (let len = 3; len <= n; len++) {
        for (let i = 0; i <= n - len; i++) {
            const j = i + len - 1;
            if (s[i] === s[j] && dp[i + 1][j - 1]) {
                dp[i][j] = true;
                if (len > maxLen) {
                    start = i;
                    maxLen = len;
                }
            }
        }
    }

    return s.slice(start, start + maxLen);
}"""

APPROACH_SPACE_OPTIMIZED_JAVA = r"""// Longest Palindromic Substring - Expand Around Center
// O(1) space by expanding from each possible center
// TIME: O(n^2), SPACE: O(1)

class Solution {
    public String longestPalindrome(String s) {
        int n = s.length();
        int start = 0, maxLen = 1;

        for (int center = 0; center < 2 * n - 1; center++) {
            int left  = center / 2;
            int right = left + center % 2;

            while (left >= 0 && right < n && s.charAt(left) == s.charAt(right)) {
                if (right - left + 1 > maxLen) {
                    start = left;
                    maxLen = right - left + 1;
                }
                left--;
                right++;
            }
        }

        return s.substring(start, start + maxLen);
    }
}"""

APPROACH_SPACE_OPTIMIZED_JS = r"""// Longest Palindromic Substring - Expand Around Center
// O(1) space by expanding from each possible center
// TIME: O(n^2), SPACE: O(1)

function longestPalindrome(s) {
    const n = s.length;
    let start = 0, maxLen = 1;

    for (let center = 0; center < 2 * n - 1; center++) {
        let left  = Math.floor(center / 2);
        let right = left + center % 2;

        while (left >= 0 && right < n && s[left] === s[right]) {
            if (right - left + 1 > maxLen) {
                start = left;
                maxLen = right - left + 1;
            }
            left--;
            right++;
        }
    }

    return s.slice(start, start + maxLen);
}"""


def main():
    path = "/Users/rishu.kumar/Developer/imrishuroy/algopatterns/frontend/src/lib/patterns.json"
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    updated = False
    for pattern in data:
        if pattern.get("id") == "dynamic-programming":
            tutorial = pattern.get("tutorial", [])
            for item in tutorial:
                if isinstance(item, dict) and item.get("title") == "Palindrome DP":
                    item["content"] = CONTENT
                    item["templates"] = {
                        "recursion": TEMPLATE_RECURSION,
                        "memoization": TEMPLATE_MEMOIZATION,
                        "tabulation": TEMPLATE_TABULATION,
                        "spaceOptimized": TEMPLATE_SPACE_OPTIMIZED,
                    }
                    item["approaches"] = {
                        "recursion": {
                            "java": APPROACH_RECURSION_JAVA,
                            "javascript": APPROACH_RECURSION_JS,
                        },
                        "memoization": {
                            "java": APPROACH_MEMOIZATION_JAVA,
                            "javascript": APPROACH_MEMOIZATION_JS,
                        },
                        "tabulation": {
                            "java": APPROACH_TABULATION_JAVA,
                            "javascript": APPROACH_TABULATION_JS,
                        },
                        "spaceOptimized": {
                            "java": APPROACH_SPACE_OPTIMIZED_JAVA,
                            "javascript": APPROACH_SPACE_OPTIMIZED_JS,
                        },
                    }
                    item["exampleName"] = "Longest Palindromic Substring"
                    item["exampleProblems"] = [
                        "Longest Palindromic Substring",
                        "Palindromic Substrings",
                        "Longest Palindromic Subsequence",
                        "Palindrome Partitioning II",
                    ]
                    updated = True
                    print("Updated Palindrome DP tutorial item.")
                    break

    if not updated:
        print("ERROR: Palindrome DP item not found.")
        return

    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print("patterns.json written successfully.")


if __name__ == "__main__":
    main()
