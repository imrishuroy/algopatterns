# DP Pattern Article Prompt Template

Use this prompt to generate comprehensive DP pattern articles for the algorithm learning platform.

## PROMPT

I need you to write a comprehensive Dynamic Programming article for the **[PATTERN_NAME]** pattern for our algorithm learning platform. Follow this exact structure and quality standards.

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
- Time complexity with WHY (e.g., "O(2^n). Each element has 2 choices.")
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
- Time: O(...). Each state computed once.
- Space: O(...) memo + O(...) stack.

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

### Code Templates Section

Provide templates for each approach with variations. Templates show pattern structure, not specific problem solution.

**templates.recursion**

```java
// [PATTERN] - Recursion Template
// TIME: O(...), SPACE: O(...)

// COUNT WAYS (e.g., Climbing Stairs)
[code for counting]

// MINIMIZE COST (e.g., Min Cost Stairs)
[code for minimization]

// MAXIMIZE VALUE (e.g., House Robber)
[code for maximization]

// FEASIBILITY (e.g., Can reach target?)
[code for boolean check]
```

**templates.memoization**
Same structure with memo lookup/storage added

**templates.tabulation**
Same structure with iterative fill

**templates.spaceOptimized**
If applicable (e.g., O(1) instead of O(n))

### Approaches Section (Language-Specific)

Provide for Java and JavaScript:

- approaches.recursion.java / .javascript
- approaches.memoization.java / .javascript
- approaches.tabulation.java / .javascript
- approaches.spaceOptimized.java / .javascript

Each should be complete, runnable code for the PRIMARY problem of this pattern (the canonical example used throughout the article).

### Writing Style Guidelines

- No fluff. Every sentence teaches something.
- Concrete over abstract. Always show examples.
- Consistent examples. Same input throughout entire article.
- Pseudocode first. Language-agnostic understanding before code.
- Explain the WHY. Not just what, but why it works.
- Mark critical insights. Bold or "Critical:" prefix.
- Use markdown tables. For comparisons and quick reference.
- Code blocks with comments. But minimal, only non-obvious parts.
- NO horizontal rules (---) between sections.
- NO emojis unless explicitly requested.
- Use simple English words.
- Use periods to end complexity statements: "Time: O(n). Each state computed once."
- Never use em dashes between words. Use colons, commas, or periods instead.

### What NOT to Include

- Don't give full solutions to practice problems (only conceptual hints)
- Don't explain basic DP concepts (assume reader knows what DP is)
- Don't use emojis
- Don't add motivational text or filler
- Don't repeat the same information in different words
- Don't use em dashes (—) between words

### JSON Output Format

The output must be valid JSON matching this exact structure:

```json
{
  "title": "[PATTERN_NAME]",
  "content": "[Full markdown article - all 13 sections]",
  "templates": {
    "recursion": "[Java template with COUNT/MINIMIZE/MAXIMIZE/FEASIBILITY variations]",
    "memoization": "[Java template with memo added]",
    "tabulation": "[Java template with iterative fill]",
    "spaceOptimized": "[Java template with O(1) space if applicable]"
  },
  "approaches": {
    "recursion": {
      "java": "[Complete runnable Java code for primary problem]",
      "javascript": "[Complete runnable JavaScript code for primary problem]"
    },
    "memoization": {
      "java": "[Complete runnable Java code]",
      "javascript": "[Complete runnable JavaScript code]"
    },
    "tabulation": {
      "java": "[Complete runnable Java code]",
      "javascript": "[Complete runnable JavaScript code]"
    },
    "spaceOptimized": {
      "java": "[Complete runnable Java code]",
      "javascript": "[Complete runnable JavaScript code]"
    }
  },
  "exampleName": "[Primary Problem Name, e.g., 'Climbing Stairs']"
}
```

**Important JSON notes:**
- Escape newlines as `\n` in content strings
- Escape quotes as `\"` inside strings
- No trailing commas
- All code must be syntactically valid

### Pattern-Specific Details (Fill Before Using)

```
### Pattern-Specific Details for [PATTERN_NAME]

- **Core problem:** [One sentence description of canonical problem]
- **Key state variables:** [What the DP state tracks, e.g., dp[i] = ways to reach i]
- **Typical recurrence:** [The formula, e.g., dp[i] = dp[i-1] + dp[i-2]]
- **Base cases:** [List base cases, e.g., dp[0] = 1, dp[1] = 1]
- **Common variations:**
  - [Variation 1]: [brief description]
  - [Variation 2]: [brief description]
- **Primary example:** [The example to use throughout, e.g., n=5 for climbing stairs]
- **Expected answer:** [What the answer should be, e.g., 8 ways]
- **Related practice problems:**
  - Easy: [problem names]
  - Medium: [problem names]
  - Hard: [problem names]
```

### Quality Checklist Before Finalizing

Content:
- [ ] What is section: definition + when to use (3-4 sentences)
- [ ] Foundational concept explained (if needed)
- [ ] Problem statement with 2-3 examples including edge cases
- [ ] Core decision/insight clearly articulated
- [ ] Recursion with overlapping subproblems tree
- [ ] Memoization with memo key explanation
- [ ] Tabulation with fill order and base case
- [ ] Complete step-by-step walkthrough with same example
- [ ] Comparison table between approaches
- [ ] Variations section with "what if" questions
- [ ] Debugging checklist (5-7 items)
- [ ] Common mistakes (4-6 items)
- [ ] Practice problems by difficulty (Easy/Medium/Hard)

Code:
- [ ] Templates have 4 variations (COUNT/MINIMIZE/MAXIMIZE/FEASIBILITY)
- [ ] Approaches have Java + JavaScript for all 4 methods
- [ ] All code syntactically valid
- [ ] All code tested with expected inputs/outputs
- [ ] Time/space complexity comments on each approach

Style:
- [ ] No em dashes (—)
- [ ] No emojis
- [ ] Periods after complexity statements
- [ ] Same example used throughout
- [ ] No horizontal rules between sections

Verification:
- [ ] All calculations in walkthrough verified manually
- [ ] Code outputs match expected values
- [ ] Base cases produce correct results
- [ ] Edge cases handled (n=0, n=1, empty input)
- [ ] Valid JSON structure (test with JSON.parse)

## EXAMPLE: 1D DP (Recursive Numbers)

### Pattern-Specific Details

```
- **Core problem:** Count ways to reach step n, taking 1 or 2 steps at a time
- **Key state variables:** f(n) = number of ways to reach step n
- **Typical recurrence:** f(n) = f(n-1) + f(n-2)
- **Base cases:** f(0) = 1, f(1) = 1
- **Common variations:**
  - Variable steps (1,2,3): f(n) = f(n-1) + f(n-2) + f(n-3)
  - With costs: f(n) = min(f(n-1) + cost[n-1], f(n-2) + cost[n-2])
  - Decision (House Robber): f(n) = max(f(n-1), f(n-2) + val[n])
- **Primary example:** n = 5
- **Expected answer:** 8 ways
- **Related practice problems:**
  - Easy: Fibonacci Number, Climbing Stairs, N-th Tribonacci
  - Medium: Min Cost Climbing Stairs, Decode Ways, House Robber
  - Hard: Frog Jump, Knight Dialer
```

### Generated Content Preview

The article should produce values like:
- f(0) = 1, f(1) = 1, f(2) = 2, f(3) = 3, f(4) = 5, f(5) = 8
- Walkthrough shows: dp[2] = dp[1] + dp[0] = 1 + 1 = 2, etc.
- Final answer: 8 ways to climb 5 stairs

## INTERACTIVE VISUALIZER REQUIREMENTS

After article is complete, the visualizer component should:

### 1. Phase Tabs

Four phases matching the article approaches:
- **Recursion**: Tree visualization showing function calls
- **Memoization**: Tree with cache hits highlighted (yellow)
- **Tabulation**: Array/table filling animation
- **Space Optimized**: Variable sliding animation (if applicable)

### 2. Controls

- Play/Pause button
- Step forward/back buttons
- Reset button
- Speed selector (0.5x, 1x, 2x)
- Step counter (current / total)

### 3. Each Phase Must Show

- Current state being computed (highlighted)
- Formula being applied
- Values being compared/combined
- Progress through steps

### 4. Answer Display

After animation completes, show answer prominently:
```jsx
{step >= maxSteps && step > 0 && (
  <div className="text-sm text-center bg-green-600/20 px-4 py-2 rounded-lg">
    <span className="text-green-400 font-bold">
      Answer: [description] = [value]
    </span>
  </div>
)}
```

Condition pattern:
- For array-based phases: `step >= steps.length && step > 0`
- For tree phases: `step >= nodeOrder.length - 1 && step > 0`

### 5. Visualizer Data Generation

Each phase needs step generation function:

```javascript
// Table phase example
const generateTableSteps = () => {
  const steps = [];
  // Base cases
  steps.push({ i: 0, value: 1, formula: "dp[0] = 1 (base case)" });
  steps.push({ i: 1, value: 1, formula: "dp[1] = 1 (base case)" });
  
  // Recurrence
  for (let i = 2; i <= TARGET_N; i++) {
    const curr = dp[i-1] + dp[i-2];
    steps.push({
      i,
      value: curr,
      formula: `dp[${i}] = dp[${i-1}] + dp[${i-2}] = ${dp[i-1]} + ${dp[i-2]} = ${curr}`
    });
  }
  return steps;
};
```

### 6. Visual Consistency

- Use same example as article (e.g., n=5 for climbing stairs)
- Colors: Blue for current, Green for computed, Yellow for cache hit
- Font: Monospace for values and formulas
- Background: Dark theme (gray-800, gray-900)

## FILE LOCATIONS

- Article content goes in: `frontend/src/lib/patterns.json`
  - Find `id: "dynamic-programming"` pattern
  - Add to `tutorial` array at correct index
- Visualizer goes in: `frontend/src/components/visualizers/[PatternName]Visualizer.tsx`

## VERIFICATION COMMANDS

After generating, verify with:

```bash
# Test code correctness
node -e "
function solve(n) { /* paste code */ }
console.log('n=0:', solve(0));
console.log('n=1:', solve(1));
console.log('n=5:', solve(5));
"

# Validate JSON
node -e "
const content = \`[paste JSON]\`;
JSON.parse(content);
console.log('Valid JSON');
"

# Lint visualizer
cd frontend && npx eslint src/components/visualizers/[Name]Visualizer.tsx
```
