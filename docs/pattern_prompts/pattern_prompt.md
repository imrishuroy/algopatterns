# Pattern Improvement Template

Use this prompt to improve any pattern to match the quality of the DP pattern.

Replace `[PATTERN_NAME]` with the pattern you want to improve (e.g., Heap, Sliding Window, Two Pointers, Graphs, Trees, etc.).

---

# Improve the [PATTERN_NAME] Pattern to Match the Quality of the DP Pattern

I want you to review the entire [PATTERN_NAME] pattern located at `/patterns/[pattern-slug]` in `patterns.json`.

Before making any changes, carefully study the Dynamic Programming pattern in this project.

The DP pattern is the quality benchmark. I do **not** want the [PATTERN_NAME] pattern to simply contain more text. I want it to teach in the same way that the DP content teaches.

The DP content is excellent because it:

- Builds intuition before algorithms
- Explains every "why"
- Uses simple English
- Introduces concepts gradually
- Uses diagrams and visualizations extensively
- Shows multiple approaches (where applicable)
- Explains mistakes beginners make
- Gives pattern-recognition rules
- Includes debugging checklists
- Shows how to extend the pattern
- Contains interactive visualizations
- Makes users feel confident rather than overwhelmed

I want the [PATTERN_NAME] pattern to follow the exact same philosophy.

---

# First Task: Review Only

Do **NOT** modify anything yet.

Read the entire [PATTERN_NAME] pattern and compare it section-by-section against the DP content.

For every section answer:

- What is missing?
- What is confusing?
- What is too advanced?
- What should be simplified?
- What visuals are missing?
- What intuition is missing?
- What beginner questions are left unanswered?
- What interview concepts are missing?
- Which sections should be reordered?

Challenge the entire structure if necessary. Don't assume the current organization is correct.

---

# The Standard

The [PATTERN_NAME] pattern should become the best [PATTERN_NAME] learning resource available online.

Imagine a student who has never heard the term "[PATTERN_NAME]."

After reading this pattern they should understand:

- What [PATTERN_NAME] is (clear definition)
- Why it exists (what problem it solves)
- How it works (step-by-step operations)
- Why it's efficient (complexity analysis with intuition)
- When to use it (pattern recognition)
- When NOT to use it (anti-patterns)
- Common mistakes and how to avoid them
- How to implement it in Java and JavaScript
- How to explain it in an interview

without needing YouTube or another article.

---

# Input Constraint Analysis

Every pattern MUST include a constraint-to-complexity mapping.

## Why This Matters

Interviewers often give constraints as hints. If `n <= 10^5` and you propose O(n^2), they'll ask for optimization. Teaching users to read constraints is critical for pattern recognition.

## Universal Constraint Reference Table

Include this table in the introduction or pattern recognition section:

| Input Size | Max Complexity | Typical Patterns |
|------------|----------------|------------------|
| n <= 10 | O(n!) | Brute force, all permutations |
| n <= 20 | O(2^n) | Bitmask DP, backtracking |
| n <= 100 | O(n^3) | Floyd-Warshall, interval DP, 3 nested loops |
| n <= 1,000 | O(n^2) | Simple DP, nested loops |
| n <= 100,000 | O(n log n) | Sorting, heap, binary search, divide & conquer |
| n <= 10^7 | O(n) | Two pointers, sliding window, hash map, prefix sum |
| n <= 10^9 | O(log n) or O(1) | Binary search, math, formula |

## Pattern-Specific Constraint Table

For [PATTERN_NAME], add a table showing when this pattern is the right choice:

| Constraint | [PATTERN_NAME] Feasible? | Reason |
|------------|--------------------------|--------|
| [Constraint 1] | Yes/No | [Why] |
| [Constraint 2] | Yes/No | [Why] |

---

# Content Structure Requirements

## Section 1: Introduction

Every pattern MUST start with:

1. **Real-world analogy** - Build intuition before terminology
2. **Clear definition** - What IS this thing? Define the concept explicitly
3. **The problem it solves** - Why do simpler approaches fail?
4. **Real-world examples table** - Where is this used?
5. **Learning objectives** - What will they understand after this tutorial?

Example structure:
```
## Why Do We Need [PATTERN_NAME]?

[Real-world analogy that makes the concept intuitive]

### What is [PATTERN_NAME]?

[Clear, explicit definition. Don't assume they know.]

### Real-World Examples

| Scenario | Why [PATTERN_NAME]? |
|----------|---------------------|
| Example 1 | Reason |
| Example 2 | Reason |

### The Problem: Why Simpler Approaches Fail

[Show why array, sorting, brute force, etc. don't work well]

### What You'll Learn

By the end of this tutorial, you will:
- [Objective 1]
- [Objective 2]
- [Objective 3]
```

## Subsequent Sections: Operations and Concepts

Each operation/concept section should include:

- Intuition first (why does this work?)
- ASCII visualization
- Step-by-step walkthrough
- Dry-run trace table (for loops/iterations)
- Code in both Java and JavaScript
- Complexity analysis with derivation

## Checkpoint Questions

After key concepts, add self-check questions:

```markdown
> **Quick Check:** [Question testing understanding of the concept just taught]
>
> <details>
> <summary>Think first, then click to reveal</summary>
>
> [Answer with explanation]
> </details>
```

Place checkpoint questions:
- After introducing a counter-intuitive concept
- After explaining "why" something works
- Before moving to a more advanced topic
- After each major pattern variation

## Pattern Sections: Problem-Solving Patterns

For each variation/sub-pattern:

- Pattern name and when to use it
- Key insight or "trick"
- Visual walkthrough
- Template code
- Example problem with solution
- Dry-run trace table
- Follow-up questions section
- Related problems list (ordered by difficulty)

## Difficulty Progression

Structure problems within each pattern from easy to hard:

| Level | Characteristics | Expected Solve Time |
|-------|-----------------|---------------------|
| **Easy** | Direct pattern application, single data structure | 10-15 min |
| **Medium** | Pattern + one twist, or two data structures | 20-30 min |
| **Hard** | Multiple patterns combined, tricky edge cases | 30-45 min |

Order problems as:
1. **Foundation (Easy):** Pure pattern, no tricks
2. **Variation (Medium):** Same pattern, modified constraints
3. **Combination (Hard):** Multiple patterns or advanced optimization

## Final Sections

Every pattern MUST end with:

- Pattern Recognition (decision flowchart or checklist)
- Pattern Comparison (when to use [PATTERN_NAME] vs alternatives)
- Common Mistakes and Debugging
- Edge Case Checklist
- Complexity Reference Table
- Interview Tips and Communication Templates

---

# Follow-up Questions

Every problem-solving section MUST include common interview follow-ups.

## Required Format

| Original Problem | Common Follow-up | How to Extend |
|-----------------|------------------|---------------|
| [Problem name] | "What if [variation]?" | [Brief approach] |

## Universal Follow-ups (Apply to Most Patterns)

- "Can you optimize the space complexity?"
- "What if the input doesn't fit in memory?"
- "Can you do it in-place?"
- "What if the input is streaming (online algorithm)?"
- "Can you return the actual solution, not just the count/length?"
- "What if there are multiple valid answers?"
- "How would you handle duplicates?"

## Pattern-Specific Follow-ups

Add follow-ups specific to [PATTERN_NAME]. Think about:
- What constraints could change?
- What additional requirements could be added?
- How could this combine with other patterns?

---

# Edge Case Verification

Every pattern MUST include an edge case checklist.

## Universal Edge Cases (Test Every Solution)

- [ ] **Empty input**: `[]`, `""`, `null`, `n = 0`
- [ ] **Single element**: `[1]`, `"a"`, `n = 1`
- [ ] **Two elements**: `[1, 2]` (minimum for meaningful comparisons)
- [ ] **All identical**: `[5, 5, 5, 5]`
- [ ] **Already optimal**: sorted, all valid, no work needed
- [ ] **Worst case**: reverse sorted, all invalid, maximum work

## Numeric Edge Cases

- [ ] **Zero**: `k = 0`, `target = 0`
- [ ] **Negative numbers**: `[-5, -1, 3]`
- [ ] **Boundary values**: `Integer.MAX_VALUE`, `Integer.MIN_VALUE`
- [ ] **Overflow potential**: large sums, products

## Data Structure Edge Cases

**Arrays/Strings:**
- [ ] All same elements
- [ ] Strictly increasing/decreasing
- [ ] Single unique element

**Linked Lists:**
- [ ] Null head
- [ ] Single node
- [ ] Cycle present

**Trees:**
- [ ] Null root
- [ ] Single node (root only)
- [ ] Skewed tree (all left or all right)
- [ ] Complete vs incomplete

**Graphs:**
- [ ] Empty graph (no nodes)
- [ ] Single node
- [ ] Disconnected components
- [ ] Cycles
- [ ] Self-loops
- [ ] Parallel edges

## Pattern-Specific Edge Cases

Add edge cases specific to [PATTERN_NAME]. Think about:
- What inputs would break a naive implementation?
- What boundary conditions exist?
- What happens at the limits of the data structure?

---

# Dry-Run Trace Tables

For any algorithm with loops or state changes, include a trace table.

## Format

| Step | var1 | var2 | var3 | Action Taken |
|------|------|------|------|--------------|
| init | [initial] | [initial] | [initial] | Initialize |
| 1 | [value] | [value] | [value] | [What happened] |
| 2 | [value] | [value] | [value] | [What happened] |
| done | [final] | [final] | [final] | [Result] |

## Example

```
arr = [1, 3, 5, 7, 9], target = 12

| Step | left | right | arr[left] | arr[right] | sum | Action |
|------|------|-------|-----------|------------|-----|--------|
| init | 0 | 4 | 1 | 9 | 10 | Initialize pointers |
| 1 | 1 | 4 | 3 | 9 | 12 | 10 < 12, move left++ |
| done | 1 | 4 | 3 | 9 | 12 | Found target! |
```

## When to Include

- Two pointers / sliding window (pointer positions)
- DP table filling (which cells update)
- Graph traversals (visited state, queue/stack contents)
- Heap operations (heap state after each operation)
- Any iterative algorithm with multiple state variables

---

# Interview Communication

Teaching code isn't enough. Users must learn to EXPLAIN their thinking.

## The UMPIRE Method

Include this framework for every pattern:

1. **U**nderstand: "Let me make sure I understand the problem..."
2. **M**atch: "This looks like a [PATTERN_NAME] problem because..."
3. **P**lan: "My approach is to..."
4. **I**mplement: [Write code]
5. **R**eview: "Let me trace through an example..."
6. **E**valuate: "Time: O(x) because..., Space: O(y) because..."

## Pattern-Specific Communication Template

For [PATTERN_NAME], provide a fill-in-the-blank script:

```
I'll use [PATTERN_NAME] to solve this.

The key insight is [ONE SENTENCE INSIGHT].

Here's my approach:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Time complexity is O([X]) because [SPECIFIC REASON].
Space complexity is O([Y]) because [SPECIFIC REASON].

Let me trace through the example: [BRIEF TRACE]
```

## Before Coding Checklist

Teach users to ask these questions before writing code:

- "What are the constraints?" (determines feasible complexity)
- "What should I return if input is empty?"
- "Can there be duplicates?"
- "Is the input sorted?"
- "Can values be negative?"
- "What if there are multiple valid answers?"

---

# Pattern Comparison

When to use [PATTERN_NAME] vs alternatives.

## Required Format

| Decision Factor | [PATTERN_NAME] | Alternative A | Alternative B |
|-----------------|----------------|---------------|---------------|
| Time Complexity | O(?) | O(?) | O(?) |
| Space Complexity | O(?) | O(?) | O(?) |
| Best When | [Condition] | [Condition] | [Condition] |
| Avoid When | [Condition] | [Condition] | [Condition] |

## Example Comparisons to Consider

Think about what patterns solve similar problems:
- Two Pointers vs Sliding Window vs Hash Map
- DFS vs BFS vs Union-Find
- Heap vs Sorting vs QuickSelect
- DP vs Greedy vs Backtracking
- Binary Search vs Two Pointers vs Linear Scan

Include the most relevant comparison for [PATTERN_NAME].

---

# Complexity Derivation

Don't just state complexity. PROVE it with intuition.

## Required Format

```
**Claim:** [Operation] is O([complexity])

**Why:**
1. [Property of data structure]: [explanation]
2. [Bound on iterations/operations]: [count]
3. [Cost per iteration]: [time]
**Total:** [multiplication] = O([complexity])
```

## Example

```
**Claim:** Binary search is O(log n)

**Why:**
1. Each comparison eliminates half the remaining elements
2. After k comparisons, n / 2^k elements remain
3. Search ends when n / 2^k = 1, so k = log2(n)
**Total:** O(log n) comparisons
```

## What to Derive

For [PATTERN_NAME], provide derivations for:
- Main operation time complexity
- Space complexity (especially if non-obvious)
- Any O(n) claim that looks like it should be O(n^2) (like heapify)
- Why one approach is better than another

---

# Code Format Requirements

## Use `code` format, NOT `approaches` format

For patterns where there's only ONE way to solve each problem (not multiple approaches like DP), use the simple `code` format:

```json
{
  "title": "Section Title",
  "content": "Markdown content...",
  "code": {
    "java": "// Java code here",
    "javascript": "// JavaScript code here"
  }
}
```

Do NOT use `approaches` format unless there are genuinely multiple solving strategies (like recursion vs memoization vs tabulation in DP).

The `approaches` format creates approach selector buttons in the UI. If there's only one approach, you get a single empty/useless button.

## JavaScript-Specific Disclaimers

Since JavaScript lacks some built-in data structures, add disclaimers:

**For Heap/Priority Queue:**
```javascript
// Note: Uses sorted array (O(n log n) per op) for interview clarity
// In production, use a proper heap library like 'heap-js'
```

**For TreeMap/TreeSet equivalent:**
```javascript
// Note: JavaScript has no built-in TreeMap
// Using Map + sorting for demonstration
```

## Code Quality

- Both Java and JavaScript for every code block
- Clear comments explaining the logic (not what, but WHY)
- Consistent variable naming
- No unused variables or dead code
- Handle edge cases explicitly in code

---

# Visualizer Integration

Interactive visualizers dramatically improve understanding.

## How to Reference a Visualizer

In tutorial section JSON:

```json
{
  "title": "Section Title",
  "content": "Markdown content...",
  "visualizer": "VisualizerComponentName",
  "code": { "java": "...", "javascript": "..." }
}
```

## Visualizer Audit Process

Before finalizing a pattern:

1. **Search for existing visualizers:**
   ```
   ls frontend/src/components/visualizers/ | grep -i [pattern-name]
   ```

2. **Check what's available but not used:**
   - Many visualizers exist but aren't linked to tutorials
   - The DP pattern has 17 visualizers available but only uses 4!

3. **List all visualizers in the pattern's tutorial**

4. **Ensure visualizer names match actual component file names**

## When to Add Visualizers

Every pattern should have visualizers for:
- Core operations (e.g., heap insert/extract, tree traversal)
- The main problem-solving technique
- At least one complete problem walkthrough

If a visualizer doesn't exist, use detailed ASCII diagrams as fallback.

---

# JSON Structure

## Pattern Top-Level Fields

```json
{
  "id": "pattern-slug",
  "name": "Pattern Name",
  "category": "Category",
  "difficulty": "Beginner|Intermediate|Advanced",
  "description": "One-line description",
  "whenToUse": ["Use case 1", "Use case 2"],
  "codeTemplates": {
    "java": "// Main template",
    "javascript": "// Main template"
  },
  "keyInsights": ["Insight 1", "Insight 2"],
  "commonMistakes": ["Mistake 1", "Mistake 2"],
  "timeComplexity": "O(?) for main operation",
  "spaceComplexity": "O(?) typical",
  "variations": [...],
  "commonProblems": [...],
  "tutorial": [...]
}
```

## Tutorial Section Fields

```json
{
  "title": "Section Title",
  "content": "Markdown content with ## headers, tables, code blocks",
  "code": {
    "java": "// Optional executable code",
    "javascript": "// Optional executable code"
  },
  "visualizer": "OptionalVisualizerName"
}
```

---

# Teaching Principles

## 1. Define Before Using

Never assume terminology is known. If you mention specialized terms, define them first.

**Bad:** "This is exactly what a [term] does."
**Good:** "This is exactly what a [term] does. A [term] is [clear definition]..."

## 2. Intuition Before Algorithm

Always explain WHY something works before showing HOW.

**Bad:** "Here's the algorithm..."
**Good:** "The key insight is [WHY]. This works because [REASON]. Here's how we implement it..."

## 3. Visual Before Code

Show ASCII diagrams or reference visualizers before code. Let them SEE the algorithm.

```
Before:          After:
[diagram]   -->  [diagram]
```

## 4. Simple English

Avoid jargon. Write at a high school reading level.

**Bad:** "The invariant is maintained via percolation."
**Good:** "After each operation, we restore the property by moving elements up or down."

## 5. Answer Every "Why"

Anticipate and answer questions:
- Why this data structure?
- Why this time complexity?
- Why this approach over alternatives?

## 6. Trace Tables for Understanding

For loops and state changes, show a trace table in addition to ASCII diagrams.

## 7. Prove Complexity, Don't Just State It

Provide derivations for non-obvious complexity claims.

---

# Common Mistakes to Avoid

Based on our experience improving patterns:

1. **Not defining core concepts** - Always define what the data structure IS
2. **Using `approaches` for single-approach sections** - Creates empty UI buttons
3. **Missing language-specific disclaimers** - JS has no built-in heap, TreeMap, etc.
4. **Unused code variables** - Review all code for dead code
5. **Inconsistency between warnings and examples** - If you warn against a pattern, don't use it in examples without disclaimer
6. **Jumping to code before intuition** - Always explain WHY first
7. **Missing visualizer integration** - Check if visualizers exist but aren't linked
8. **No trace tables for complex loops** - ASCII alone isn't enough
9. **Stating complexity without derivation** - Prove it, don't just claim it
10. **No follow-up questions** - Interviewers always ask follow-ups

---

# Review Checklist

Before finalizing, verify:

## Content Completeness
- [ ] Section 1 has clear definition, analogy, and "What You'll Learn"
- [ ] Input constraint mapping table included
- [ ] Every section has both Java and JavaScript code (where applicable)
- [ ] Follow-up questions section for each problem pattern
- [ ] Edge case checklist included
- [ ] Interview communication script/template included
- [ ] Pattern comparison matrix (vs alternatives)
- [ ] Checkpoint questions after key concepts

## Visualizations
- [ ] ASCII visualizations for all operations
- [ ] Searched `/components/visualizers/` for existing visualizers
- [ ] All applicable visualizers are referenced in tutorial
- [ ] Dry-run trace tables for loop-heavy algorithms

## Teaching Quality
- [ ] Problems ordered by difficulty (Easy -> Medium -> Hard)
- [ ] Complexity derivations (not just statements)
- [ ] Pattern recognition flowchart or decision table
- [ ] Common mistakes section with code examples

## Code Quality
- [ ] All code compiles/runs correctly
- [ ] No unused variables in code
- [ ] JS-specific disclaimers where applicable
- [ ] Consistent naming conventions
- [ ] Edge cases handled in code

## Structure
- [ ] Interview tips section
- [ ] Complexity reference table
- [ ] JSON validates correctly
- [ ] Lint passes

---

# Final Deliverable

After review, produce:

1. Overall quality score (out of 10)
2. Strengths
3. Weaknesses
4. Missing concepts
5. Missing intuition
6. Missing visualizations (check existing visualizers!)
7. Section-by-section improvement recommendations
8. Proposed section outline (reordered if needed)

Then implement the improvements:

1. Rewrite/add sections following the structure above
2. Use `code` format (not `approaches`) for single-approach sections
3. Add visualizer references for existing visualizers
4. Add trace tables for iterative algorithms
5. Add checkpoint questions
6. Add follow-up questions
7. Add interview communication templates
8. Validate JSON
9. Run lint
10. Test in browser

The goal is not to create the **longest** tutorial.

The goal is to create the **clearest, most intuitive, most visual, and most beginner-friendly** learning resource while remaining valuable for interview preparation.

---

# Quick Reference: New Section Templates

## Input Constraint Table Template
```markdown
| Constraint | [PATTERN_NAME] Works? | Reason |
|------------|----------------------|--------|
| n <= X | Yes/No | [Why] |
```

## Checkpoint Question Template
```markdown
> **Quick Check:** [Question]
>
> <details>
> <summary>Think first, then click</summary>
> [Answer]
> </details>
```

## Follow-up Questions Template
```markdown
| Original | Follow-up | Extension |
|----------|-----------|-----------|
| [Problem] | "What if...?" | [Approach] |
```

## Trace Table Template
```markdown
| Step | var1 | var2 | Action |
|------|------|------|--------|
| init | X | Y | Initialize |
| 1 | X' | Y' | [Action] |
```

## Complexity Derivation Template
```markdown
**Claim:** [Operation] is O([X])

**Why:**
1. [Fact]: [Explanation]
2. [Bound]: [Count]
3. [Cost]: [Per operation]
**Total:** O([X])
```

## Interview Script Template
```markdown
I'll use [PATTERN_NAME] to solve this.
The key insight is [INSIGHT].
My approach: [STEPS].
Time: O(X) because [REASON].
Space: O(Y) because [REASON].
```
