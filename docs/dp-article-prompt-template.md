# DP Pattern Article Prompt Template

Use this prompt to generate comprehensive DP pattern articles for the algorithm learning platform.

---

## PROMPT

I need you to write a comprehensive Dynamic Programming article for the **[PATTERN_NAME]** pattern for our algorithm learning platform. Follow this exact structure and quality standards based on our existing LIS article template.

### Target Audience

- Beginners who need foundational concepts explained clearly
- Experts who want quick reference and edge cases
- Goal: Reader can solve ALL related practice problems themselves after reading (no spoon-feeding solutions)

### Article Structure (Follow Exactly)

#### 1. WHAT IS [PATTERN_NAME]?

- One paragraph definition with **bold** key term
- "Use it when..." sentence explaining when to apply this pattern
- Keep it concise (3-4 sentences max)

#### 2. FOUNDATIONAL CONCEPT (if needed)

- Explain prerequisite concept with comparison table:

| Concept | Property1 | Property2 | Example |
|---------|-----------|-----------|---------|

- Include concrete example showing WHY this concept matters
- Skip if no prerequisite needed

#### 3. PROBLEM STATEMENT

- Clear one-line definition of the canonical problem
- 2-3 examples with Input/Output/Explanation format:
```
Input: [example input]
Output: [expected output]

Explanation: [brief explanation]
```
- Include edge cases (empty input, single element, all same values, etc.)
- Use SAME example throughout article for consistency

#### 4. THE DECISION AT EACH STEP

- What decision do we make at each position?
- State definition: what does our state track?
- Show multiple decision paths with small example
- Trace through showing how decisions lead to answer

#### 5. APPROACH 1: RECURSION (Brute Force)

- Pseudocode with comments:
```
solve(state):
    if base_case: return base_value
    
    // try all choices
    for each choice:
        result = combine(solve(next_state))
    
    return result
```
- State definition explained
- Base case(s) explained
- Recursive case(s) explained
- Time complexity with WHY (e.g., "O(2^n) - each element has 2 choices")
- Space complexity
- ASCII recursion tree showing OVERLAPPING SUBPROBLEMS:
```
solve(0)
├── solve(1)
│   ├── solve(2)
│   └── solve(3) <-- REPEATED!
└── solve(2)
    └── solve(3) <-- REPEATED!
```

#### 6. APPROACH 2: MEMOIZATION (Top-Down DP)

- Same recursion + cache
- Pseudocode showing memo lookup and storage
- Explain memo key (why this uniquely identifies subproblem)
- Time: O(...) - each state computed once
- Space: O(...) memo + O(...) stack

#### 7. APPROACH 3: TABULATION (Bottom-Up DP)

- State definition: `dp[i] = ...` or `dp[i][j] = ...`
- Fill order: which direction and WHY
- Base case initialization
- Recurrence relation with pseudocode
- Final answer extraction (NOT always dp[n-1]!)
- Time and Space complexity

#### 8. STEP-BY-STEP WALKTHROUGH

- Use SAME example from Problem Statement
- Show COMPLETE trace, not just final state
- For each step show:
  - Current state being computed
  - Values being compared/combined
  - Updated table/array
- Final answer with explanation

#### 9. MEMOIZATION VS TABULATION COMPARISON TABLE

| Aspect | Memoization (Top-Down) | Tabulation (Bottom-Up) |
|--------|------------------------|------------------------|
| **State** | ... | ... |
| **Space** | ... | ... |
| **Direction** | ... | ... |
| **Computes** | ... | ... |
| **Easier to write?** | ... | ... |

#### 10. EXTENDING TO OTHER PROBLEMS

Structure as questions:
- "What if I need to [variation]?"
  - Adaptation: [how to modify]
- Include Quick Reference table:

| Problem Type | Key Adaptation |
|-------------|----------------|
| Variation 1 | ... |
| Variation 2 | ... |

#### 11. DEBUGGING CHECKLIST

- [ ] Check 1
- [ ] Check 2
- [ ] Check 3
(5-7 items, pattern-specific)

#### 12. COMMON MISTAKES

1. **Mistake name:** Explanation
2. **Mistake name:** Explanation
(4-6 items)

#### 13. PRACTICE PROBLEMS (by difficulty)

**Easy:**
- Problem 1
- Problem 2

**Medium:**
- Problem 1
- Problem 2

**Hard:**
- Problem 1
- Problem 2

---

### Code Templates Section

Provide templates for each approach with variations:

**templates.recursion**
```java
// [PATTERN] - Recursion
// [Brief description]
// TIME: O(...), SPACE: O(...)

// VARIATION 1: [Name] (e.g., MINIMIZE, MAXIMIZE, COUNT, FEASIBILITY)
[code]

// VARIATION 2: [Name]
[code]

// VARIATION 3: [Name]
[code]
```

**templates.memoization**
Same structure with memo added

**templates.tabulation**
Same structure with iterative fill

**templates.spaceOptimized**
If applicable (e.g., O(n) instead of O(n^2))

---

### Approaches Section (Language-Specific)

Provide for Java and JavaScript:

- approaches.recursion.java / .javascript
- approaches.memoization.java / .javascript
- approaches.tabulation.java / .javascript
- approaches.spaceOptimized.java / .javascript

Each should be complete, runnable code for the PRIMARY problem of this pattern.

---

### Writing Style Guidelines

- No fluff - Every sentence teaches something
- Concrete over abstract - Always show examples
- Consistent examples - Same input throughout
- Pseudocode first - Language-agnostic understanding before code
- Explain the WHY - Not just what, but why it works
- Mark critical insights - Bold or "Critical:" prefix
- Use markdown tables - For comparisons and quick reference
- Code blocks with comments - But minimal, only non-obvious parts
- NO horizontal rules (---) between sections
- NO emojis unless explicitly requested
- Use simple English words

### What NOT to Include

- Don't give full solutions to practice problems (only conceptual hints)
- Don't explain basic DP concepts (assume reader knows what DP is)
- Don't use emojis
- Don't add motivational text or filler
- Don't repeat the same information in different words
- Don't use em dashes (—) between words - use colons, commas, or periods instead

---

### JSON Output Format

```json
{
  "title": "[PATTERN_NAME]",
  "content": "[Full markdown article]",
  "templates": {
    "recursion": "[Template code]",
    "memoization": "[Template code]",
    "tabulation": "[Template code]",
    "spaceOptimized": "[Template code]"
  },
  "approaches": {
    "recursion": { "java": "...", "javascript": "..." },
    "memoization": { "java": "...", "javascript": "..." },
    "tabulation": { "java": "...", "javascript": "..." },
    "spaceOptimized": { "java": "...", "javascript": "..." }
  },
  "exampleName": "[Primary Problem Name]"
}
```

---

### Pattern-Specific Details for [PATTERN_NAME]

Fill in these details before using the prompt:

- **Core problem:** [One sentence description]
- **Key state variables:** [What the DP state tracks]
- **Typical recurrence:** [The formula pattern]
- **Common variations:**
  - Variation 1: [description]
  - Variation 2: [description]
- **Related practice problems:** [List from LeetCode/similar]

---

### Quality Checklist Before Finalizing

- [ ] Foundational concept explained (if needed)
- [ ] Problem statement with 2-3 examples including edge cases
- [ ] Core decision/insight clearly articulated
- [ ] Recursion with overlapping subproblems shown
- [ ] Memoization with state explanation
- [ ] Tabulation with fill order and base case
- [ ] Complete step-by-step walkthrough with same example
- [ ] Comparison table between approaches
- [ ] Variations section with "what if" questions
- [ ] Debugging checklist (5-7 items)
- [ ] Common mistakes (4-6 items)
- [ ] Practice problems by difficulty
- [ ] Code templates with multiple variations
- [ ] Language-specific approaches (Java + JavaScript)
- [ ] Valid JSON structure
- [ ] No solutions to practice problems
- [ ] All code examples tested and verified
- [ ] All calculations in walkthrough verified

---

## EXAMPLE USAGE

For Interval DP pattern:

```
### Pattern-Specific Details for Interval DP

- **Core problem:** Optimal way to merge/split a range, where cost depends on subrange results
- **Key state variables:** dp[i][j] = optimal answer for subarray from index i to j
- **Typical recurrence:** dp[i][j] = best over all k in [i,j) of: dp[i][k] + dp[k+1][j] + merge_cost
- **Common variations:**
  - Matrix Chain Multiplication
  - Burst Balloons
  - Minimum Cost to Merge Stones
  - Palindrome Partitioning
- **Related practice problems:**
  - Easy: None (Interval DP is inherently medium+)
  - Medium: Palindrome Partitioning II
  - Hard: Burst Balloons, Strange Printer, Minimum Cost to Merge Stones
```

---

## INTERACTIVE VISUALIZER NOTES

After article is complete, the visualizer should:

1. **Concept Tab** (animated steps):
   - What is the pattern? (static intro)
   - Key insight visualization
   - State definition visualization
   - Recurrence visualization
   - 5-7 steps total, playable

2. **Algorithm Tab** (step-by-step execution):
   - Use SAME example from article
   - Show state being computed
   - Show values being compared
   - Show table/array updates
   - Highlight current cell

3. **Result Tab**:
   - Final answer prominently displayed
   - Optimal path/solution shown if applicable

4. **Answer Display**:
   - Format: `Answer: [description] = [value]`
   - Show after animation completes
   - Include example solution (e.g., "tour: A → B → D → C → A")
