#!/usr/bin/env python3
"""
Fix Palindrome DP article:
 - Remove em dashes (—) per AGENTS.md rules
 - Remove hyphens from compound words (user rule)
 - Simplify complex words
 - Only touches prose, not code blocks
"""

import json
import re

# ── replacements applied LINE BY LINE in prose only ──────────────────────────

EXACT_LINE = {
    # section headings
    "## Approach 2: Memoization (Top-Down DP)": "## Approach 2: Memoization (Top Down DP)",
    "## Approach 3: Tabulation (Bottom-Up DP)": "## Approach 3: Tabulation (Bottom Up DP)",
    "## Step-by-Step Walkthrough": "## Step by Step Walkthrough",
    "### Initialize — Length 1": "### Initialize: Length 1",
    "### Fill — Length 2": "### Fill: Length 2",
    "### Fill — Length 3": "### Fill: Length 3",
    "### Fill — Length 4": "### Fill: Length 4",
    "### Fill — Length 5": "### Fill: Length 5",
    "### Fill — Length 6": "### Fill: Length 6",
    "### Final Table": "### Final Table",
    "### Expand Around Center — O(n²) time, O(1) space": "### Expand Around Center: O(n²) time, O(1) space",
    "### Manacher's Algorithm — O(n) time, O(n) space": "### Manacher's Algorithm: O(n) time, O(n) space",
}

# ordered so longer phrases match first
PHRASE = [
    # em dashes → correct punctuation (AGENTS.md rules)
    ("(length 3) — must be contiguous, so the 'd' at index 4 blocks extension",
     "(length 3). The 'd' at index 4 blocks extension"),
    ("(length 5) — skip 'd', take a(0), b(1), c(2), b(3), a(5)",
     "(length 5). Skip 'd', take a(0), b(1), c(2), b(3), a(5)"),
    ("always true — reached by even-length palindromes",
     "always true, reached by even length palindromes"),
    ("always true — used when processing even-length substrings",
     "always true, used when processing even length substrings"),
    ("O(n³) — O(n²) pairs (i, j), each verification recurses up to O(n) deep.",
     "O(n³). O(n²) pairs (i, j), each verification recurses up to O(n) deep."),
    ("O(n²) — at most n² distinct (i, j) pairs, each computed exactly once.",
     "O(n²). At most n² distinct (i, j) pairs, each computed exactly once."),
    ("Strategy A — Increasing length (explicit):", "Strategy A: increasing length:"),
    ("Strategy B — Decreasing i:", "Strategy B: decreasing i:"),
    ("Yes — mirrors the recursive check directly", "Yes, mirrors the recursive check directly"),
    ("the fill-order constraint in tabulation is non-trivial to get right on the first attempt — "
     "memoization is easier to write correctly.",
     "the fill order requirement in tabulation is tricky to get right. Memoization is easier to write correctly."),
    ("the fill-order constraint in tabulation is non-trivial to get right on the first attempt — "
     "memoization is easier to write correctly",
     "the fill order requirement in tabulation is tricky to get right. Memoization is easier to write correctly"),
    ("no change to the recurrence — increment a counter whenever dp[i][j] is true:",
     "no change to the recurrence. Increment a counter whenever dp[i][j] is true:"),
    ("`dp[i][j][budget]` — minimum changes to make s[i..j] a palindrome with at most `budget` operations remaining.",
     "`dp[i][j][budget]`. Minimum changes to make s[i..j] a palindrome with at most `budget` operations remaining."),
    ("The substring recurrence sets dp[i][j] = false on mismatch — the range is simply not a palindrome.",
     "The substring recurrence sets dp[i][j] = false on mismatch. The range is simply not a palindrome."),
    ("The substring recurrence sets dp[i][j] = false on mismatch — the range is simply not a palindrome",
     "The substring recurrence sets dp[i][j] = false on mismatch. The range is simply not a palindrome"),
    ("""**"What if characters don't need to be contiguous?" — Longest Palindromic Subsequence**""",
     """**Longest Palindromic Subsequence: what if characters don't need to be contiguous?**"""),
    ('**"What if I need to partition the whole string with minimum cuts?" — Palindrome Partitioning II**',
     "**Palindrome Partitioning II: what if you need minimum cuts?**"),
    ('**"What if I need to count palindromic substrings/subsequences?"**',
     "**Counting palindromic substrings or subsequences**"),
    ('**"What if one character may be deleted?" — Valid Palindrome II**',
     "**Valid Palindrome II: what if one character may be deleted?**"),
    ("Two-pass approach — complete them in order:", "Two pass approach, complete them in order:"),
    ("— length 1 (always true) and length 2 (s[i] == s[i+1])?",
     ", length 1 (always true) and length 2 (s[i] == s[i+1])?"),
    # practice problems list: Problem — desc  →  Problem: desc
    ("- Valid Palindrome — two-pointer check, no DP; foundational understanding of the palindrome property",
     "- Valid Palindrome: two pointer check, no DP needed; builds foundational understanding of the palindrome property"),
    ("- Palindrome Partitioning — enumerate all valid partitions using backtracking; use palindrome check as a pruning condition",
     "- Palindrome Partitioning: enumerate all valid partitions using backtracking; use the palindrome check as a pruning condition"),
    ("- Longest Palindromic Substring — primary problem of this pattern",
     "- Longest Palindromic Substring: primary problem of this pattern"),
    ("- Palindromic Substrings — count all palindromic substrings; same table, just count true cells",
     "- Palindromic Substrings: count all palindromic substrings; same table, just count true cells"),
    ("- Longest Palindromic Subsequence — subsequence variant; change boolean to length, handle mismatch with max of neighbors",
     "- Longest Palindromic Subsequence: subsequence variant; change boolean to length, handle mismatch with max of neighbors"),
    ("- Valid Palindrome II — at most one deletion; greedy two-pointer with one retry on mismatch",
     "- Valid Palindrome II: at most one deletion; greedy two pointer with one retry on mismatch"),
    ("- Palindrome Partitioning II — minimum cuts; palindrome table + 1D cut DP layered on top",
     "- Palindrome Partitioning II: minimum cuts; palindrome table with 1D cut DP layered on top"),
    ("- Count Different Palindromic Subsequences — counting with duplicate avoidance; significantly harder recurrence",
     "- Count Different Palindromic Subsequences: counting with duplicate avoidance; significantly harder recurrence"),
    ("- Shortest Palindrome — build on prefix palindrome detection; reduces to a KMP or hashing problem",
     "- Shortest Palindrome: build on prefix palindrome detection; reduces to a KMP or hashing problem"),
    # quick-reference table em dashes inside cells
    ("| Longest Palindromic Substring | Boolean dp[i][j], track max length + start index while filling |",
     "| Longest Palindromic Substring | Boolean dp[i][j]; track max length and start index while filling |"),
    ("| Longest Palindromic Subsequence | dp[i][j] = length; stays valid (via max of neighbors) on mismatch |",
     "| Longest Palindromic Subsequence | dp[i][j] = length; stays valid via max of neighbors on mismatch |"),
    ("| Palindrome Partitioning II | Layer a 1D cut-count DP on top of the fully-built palindrome table |",
     "| Palindrome Partitioning II | Layer a 1D cut count DP on top of the fully built palindrome table |"),
    ("| Valid Palindrome II | Two-pointer with one retry on mismatch (greedy); or add a budget dimension |",
     "| Valid Palindrome II | Two pointer with one retry on mismatch (greedy); or add a budget dimension |"),
    # table row in comparison table
    ("| Easier to write? | Yes — mirrors the recursive check directly | Requires careful base-case + fill-order handling |",
     "| Easier to write? | Yes, mirrors the recursive check directly | Requires careful base case and fill order handling |"),
    # misc
    ("(or tri-state: UNVISITED/TRUE/FALSE)", "(or three states: unvisited, true, false)"),
    ("The single loop over `2n-1` centers covers both odd-length (center at a character) and even-length (center between two characters) palindromes without separate cases.",
     "The single loop over `2n-1` centers covers both odd length (center at a character) and even length (center between two characters) palindromes without needing separate cases."),
    ("previously computed palindrome radius values: when a new center falls inside an already-found palindrome",
     "previously computed palindrome radius values: when a new center falls inside a palindrome that was already found"),
    ("Unlike substring, the answer IS the whole-range query",
     "Unlike substring, the answer is the full range query"),
    ("unlike substring, the answer IS the whole-range query",
     "unlike substring, the answer is the full range query"),
    ("The shrink-inward pattern bottoms out at two base cases:",
     "The inward shrink pattern bottoms out at two base cases:"),
    ("For most palindrome problems the fill-order constraint in tabulation is non-trivial to get right on the first attempt. Memoization is easier to write correctly.",
     "For most palindrome problems, the fill order requirement in tabulation is tricky to get right. Memoization is easier to write correctly."),
    ("For most palindrome problems the fill-order constraint in tabulation is non-trivial to get right on the first attempt — memoization is easier to write correctly.",
     "For most palindrome problems, the fill order requirement in tabulation is tricky to get right. Memoization is easier to write correctly."),
    # Remaining compound words in prose
    ("fill-order", "fill order"),
    ("base-case", "base case"),
    ("cut-count", "cut count"),
    ("fully-built", "fully built"),
    ("two-pointer", "two pointer"),
    ("Two-pointer", "Two pointer"),
    ("Two-pass", "Two pass"),
    ("two-pass", "two pass"),
    ("double-counting", "double counting"),
    ("max-length", "max length"),
    ("non-trivial", "tricky"),
    ("expand-around-center", "expand around center"),
    ("Re-verifying", "Rechecking"),
    ("re-verify", "recheck"),
    ("Top-Down", "Top Down"),
    ("Bottom-Up", "Bottom Up"),
    ("top-down", "top down"),
    ("bottom-up", "bottom up"),
    ("Step-by-Step", "Step by Step"),
    ("step-by-step", "step by step"),
]


def fix_line(line):
    for old, new in PHRASE:
        if old in line:
            line = line.replace(old, new)
    return line


def process_content(content):
    lines = content.split("\n")
    result = []
    in_code = False

    for line in lines:
        stripped = line.strip()

        # track code block boundaries
        if stripped.startswith("```"):
            in_code = not in_code
            result.append(line)
            continue

        if in_code:
            result.append(line)
            continue

        # exact whole-line replacements first
        if line in EXACT_LINE:
            result.append(EXACT_LINE[line])
            continue

        # phrase replacements
        result.append(fix_line(line))

    return "\n".join(result)


def main():
    path = "frontend/src/lib/patterns.json"
    with open(path, encoding="utf-8") as f:
        data = json.load(f)

    for pattern in data:
        if pattern.get("id") == "dynamic-programming":
            for item in pattern.get("tutorial", []):
                if isinstance(item, dict) and item.get("title") == "Palindrome DP":
                    original = item["content"]
                    fixed = process_content(original)
                    item["content"] = fixed

                    # report remaining violations
                    remaining_em = [
                        (i, l)
                        for i, l in enumerate(fixed.split("\n"))
                        if "—" in l
                    ]
                    # find hyphenated prose words (outside code blocks)
                    remaining_hyphens = []
                    in_code = False
                    for i, l in enumerate(fixed.split("\n")):
                        if l.strip().startswith("```"):
                            in_code = not in_code
                        if not in_code:
                            m = re.findall(r"[a-zA-Z]+-[a-zA-Z]+", l)
                            if m:
                                remaining_hyphens.append((i, m, l[:100]))

                    print(f"Content length: {len(fixed)}")
                    print(f"Remaining em dashes: {len(remaining_em)}")
                    for i, l in remaining_em:
                        print(f"  line {i}: {l[:100]}")
                    print(f"Remaining hyphenated words: {len(remaining_hyphens)}")
                    for i, m, l in remaining_hyphens:
                        print(f"  line {i}: {m} | {l}")

    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print("\nWritten.")


if __name__ == "__main__":
    main()
