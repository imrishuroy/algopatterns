# Pattern Improvement Template

Use this prompt to improve any pattern to match the quality of the DP pattern.

Replace `[PATTERN_NAME]` with the pattern you want to improve (e.g., Heap, Sliding Window, Two Pointers).

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
- Shows multiple approaches
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

without needing YouTube or another article.

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

[List of concepts they'll master]
```

## Subsequent Sections: Operations and Concepts

Each operation/concept section should include:

- Intuition first (why does this work?)
- ASCII visualization
- Step-by-step walkthrough
- Code in both Java and JavaScript
- Complexity analysis with explanation

## Pattern Sections: Problem-Solving Patterns

For each pattern (e.g., Top K, Two Heaps):

- Pattern name and when to use it
- Key insight or "trick"
- Visual walkthrough
- Template code
- Example problem with solution
- Related problems list

## Final Sections

- Pattern Recognition (decision flowchart or checklist)
- Common Mistakes and Debugging
- Complexity Reference Table
- Interview Tips and Templates

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

## JavaScript Heap Disclaimer

Since JavaScript has no built-in heap, add this disclaimer to JS code that simulates heaps with sorted arrays:

```javascript
// Note: Uses sorted array (O(n log n) per op) for interview clarity
// In production, use a proper heap library
```

## Code Quality

- Both Java and JavaScript for every code block
- Clear comments explaining the logic
- Consistent variable naming
- No unused variables or dead code

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
  }
}
```

---

# Teaching Principles

## 1. Define Before Using

Never assume terminology is known. If you mention "heap", "priority queue", "bubble up", etc., define it first.

**Bad:** "This is exactly what a heap does."
**Good:** "This is exactly what a heap does. A heap is a specialized tree-based data structure that..."

## 2. Intuition Before Algorithm

Always explain WHY something works before showing HOW.

**Bad:** "Here's the bubble-up algorithm..."
**Good:** "When we insert a new element, it might be smaller than its parent, violating the heap property. We fix this by swapping upward until the property is restored. This is called bubble-up."

## 3. Visual Before Code

Show ASCII diagrams before code. Let them SEE the algorithm.

```
Insert 5 into min-heap:

Step 1: Add at end       Step 2: Bubble up
        10                      5
       /  \                   /  \
      20   15      →        20   10
     /                      /
    5                      15
```

## 4. Simple English

Avoid jargon. Write at a high school reading level.

**Bad:** "The heap invariant is maintained via percolation."
**Good:** "After each operation, we restore the heap property by moving elements up or down."

## 5. Answer Every "Why"

- Why complete binary tree? (No gaps = array storage)
- Why O(log n)? (Tree height is log n)
- Why min-heap for K largest? (Keep the Kth largest at root)

---

# Common Mistakes to Avoid

Based on our experience improving patterns:

1. **Not defining core concepts** - Always define what the data structure IS
2. **Using `approaches` for single-approach sections** - Creates empty UI buttons
3. **Missing JavaScript disclaimers** - JS has no built-in heap
4. **Unused code variables** - Review all code for dead code
5. **Inconsistency between warnings and examples** - If you warn against a pattern, don't use it in examples without disclaimer
6. **Jumping to code before intuition** - Always explain WHY first

---

# Review Checklist

Before finalizing, verify:

- [ ] Section 1 has a clear definition of the concept
- [ ] Every section has both Java and JavaScript code (where applicable)
- [ ] All code compiles/runs correctly
- [ ] No unused variables in code
- [ ] ASCII visualizations for all operations
- [ ] Pattern recognition section with decision flowchart
- [ ] Common mistakes section
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
6. Missing visualizations
7. Section-by-section improvement recommendations
8. Proposed section outline (reordered if needed)

Then implement the improvements:

1. Rewrite/add sections following the structure above
2. Use `code` format (not `approaches`) for single-approach sections
3. Validate JSON
4. Run lint
5. Test in browser

The goal is not to create the **longest** tutorial.

The goal is to create the **clearest, most intuitive, most visual, and most beginner-friendly** learning resource while remaining valuable for interview preparation.
