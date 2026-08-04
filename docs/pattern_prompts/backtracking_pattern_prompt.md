# Backtracking Pattern Improvement Prompt (FAANG-Ready Edition)

Use this prompt to rewrite the entire Backtracking pattern to match the quality of the DP pattern and Heap pattern.

---

# Implementation Notes (Updated August 2026)

## Completed Work

The following sections have been implemented and verified:

| Section | Status | Visualizer | Notes |
|---------|--------|------------|-------|
| 2. Subsets (Power Set) | ✅ Complete | SubsetsVisualizer (purple) | Decision tree, step trace, Q&A |
| 3. Permutations | ✅ Complete | PermutationsVisualizer (blue) | used[] array pattern |
| 4. Combinations | ✅ Complete | CombinationsVisualizer (cyan) | Pruning optimization |
| 5. Letter Combinations | ✅ Complete | PhoneLetterVisualizer (amber) | Map/StringBuilder pattern |
| 6. Handling Duplicates | ✅ Complete | PermutationsIIVisualizer (indigo) | Subsets II + Permutations II |
| 7. Combination Sum | ✅ Complete | 3 visualizers (emerald/orange/violet) | CS I, II, III all covered |
| 8. Grid Backtracking |  | WordSearchVisualizer (sky) | visited vs mismatch states |

## Key Decisions Made

### 1. Tutorial Section Structure
Each section follows this consistent format:
- **Definition/Introduction** - What is this pattern?
- **Problem Statement** - LeetCode-style with example
- **Decision Tree** - ASCII using box-drawing characters (┌┴┐─│)
- **Step-by-Step Trace** - Table format with columns: Step, start, path, remain, Action
- **Code Pattern** - Inline JavaScript examples with key insight highlighted
- **Comparison Table** - When multiple variations exist
- **Q&A Section** - 3-4 questions with collapsible `<details>` answers

### 2. Decision Trees Must Use Box Characters
**CRITICAL:** Never use backslashes (`\`) in decision trees - they get stripped during JSON processing/rendering.

```
// BAD - backslashes will disappear
      []
     / \
   [1]  [2]

// GOOD - use box-drawing characters
          []
    ┌─────┴─────┐
   [1]         [2]
```

### 3. Code Field Structure (Tabbed Section)
The `code` field in each tutorial section contains code for all 3 languages shown in tabs:

```json
{
  "code": {
    "javascript": "// All JS code here",
    "java": "// All Java code here", 
    "go": "// All Go code here"
  }
}
```

For sections with multiple problems (like Combination Sum), include ALL variations in each language:
```javascript
// Combination Sum I - elements can be reused
function combinationSum(candidates, target) { ... }

// Combination Sum II - no reuse, has duplicates
function combinationSum2(candidates, target) { ... }

// Combination Sum III - k numbers from 1-9
function combinationSum3(k, n) { ... }
```

### 4. Interactive Visualizer Design

Each visualizer follows this consistent design:

**Layout:**
1. Title + subtitle (candidates/target info)
2. Input display (boxes showing candidates and target)
3. Controls row: Back | Play/Pause | Forward | Reset
4. Speed buttons: 0.5x | 1x | 2x + Step counter
5. SVG decision tree (main visualization)
6. Legend (color meanings)
7. Status message (current action)
8. Found combinations display
9. Key insight footer

**Color Schemes by Visualizer:**
| Visualizer | Primary Color | Accent |
|------------|---------------|--------|
| Subsets | Purple (#8b5cf6) | |
| Permutations | Blue (#3b82f6) | |
| Combinations | Cyan (#06b6d4) | |
| Phone Letters | Amber (#f59e0b) | |
| Permutations II | Indigo (#6366f1) | |
| Combination Sum I | Emerald (#10b981) | |
| Combination Sum II | Orange (#f97316) | Amber for skipped |
| Combination Sum III | Violet (#8b5cf6) | |
| Word Search | Sky (#0ea5e9) | |

**Node States:**
- `exploring` - Primary color (active branch)
- `found` - Green (#10b981) with glow
- `pruned` - Red (#ef4444) with 50% opacity, dashed line
- `skipped` - Amber (#f59e0b) with 50% opacity (for duplicates)
- `visited` - Different from mismatch in grid search

**Sizing Guidelines (learned from overflow issues):**
- SVG viewBox: 600x350 to 600x420 (not 700+)
- Node radius: 28px
- Level height: 100px
- Base node width: 80px
- Gap between siblings: 20px
- Labels BELOW nodes (not inside) for remaining values

**Example Choice Guidelines:**
- Keep examples small enough to fit on screen
- CS I: [2,3], target=5 → [[2,3]] (simple reuse demo)
- CS II: [1,1,2,4], target=5 → [[1,4]] (shows duplicate skip)
- CS III: k=2, n=5 → [[1,4],[2,3]] (not k=3 which is too wide)

### 5. Duplicate Markers in Text
When showing which element is being skipped, use carets to point:

```
Input: [1, 1, 2]
       ↑  ↑
      1st 2nd (skip - duplicate at same level)
```

Or with explicit markers:
```
sorted: [1, 1, 2, 5]
            ^
            Skip! Same as previous at this level
```

### 6. Q&A Format
Always use collapsible details for answers:

```markdown
**Q1: Why pass `i` instead of `i+1` in Combination Sum I?**

<details>
<summary>Answer</summary>

Passing `i` allows the same element to be chosen again...
</details>
```

### 7. Complexity Tables
Use consistent format for multi-variation sections:

```markdown
| Problem | Time | Space | Notes |
|---------|------|-------|-------|
| CS I | O(n^(target/min)) | O(target/min) | Can pick smallest repeatedly |
| CS II | O(2^n) | O(n) | Each element: include or skip |
| CS III | O(C(9,k)) | O(k) | Choose k from 9 elements |
```

### 8. The Key Differences Section
Always show side-by-side code comparison for related problems:

```javascript
// Combination Sum I: can reuse same element
backtrack(i, remaining - candidates[i], path);  // Pass i

// Combination Sum II: no reuse + skip duplicates
if (i > start && candidates[i] === candidates[i-1]) continue;
backtrack(i + 1, remaining - candidates[i], path);  // Pass i+1

// Combination Sum III: no reuse + exactly k numbers
if (path.length === k && remaining === 0) { result.push([...path]); return; }
backtrack(i + 1, remaining - i, path);  // Pass i+1, loop 1 to 9
```

### 9. TutorialSection.tsx Integration
When adding new visualizers:

1. Add dynamic import at top of file:
```tsx
const CombinationSum2Visualizer = dynamic(
  () => import("@/components/visualizers/CombinationSum2Visualizer"),
  { loading: VisualizerLoading, ssr: false }
);
```

2. Add render condition in JSX:
```tsx
{cat === "Backtracking" && title.includes("Combination Sum") && (
  <>
    <div className="mt-8">
      <h4 className="..."><span className="text-emerald-400">▶</span> CS I</h4>
      <CombinationSumVisualizer />
    </div>
    {/* More visualizers... */}
  </>
)}
```

3. Use fragment `<>...</>` when rendering multiple visualizers for one section.

### 10. Code Verification Checklist
Before marking a section complete, verify ALL code:

```bash
# JavaScript - run directly
node -e "function combinationSum(...) { ... } console.log(combinationSum([2,3,6,7], 7));"

# Java - compile and run
javac TestFile.java && java TestFile

# Go - run directly
go run test_file.go
```

Test cases for Combination Sum variations:
- CS I: [2,3,6,7], target=7 → [[2,2,3],[7]]
- CS II: [1,1,2,5,6,7,10], target=8 → [[1,1,6],[1,2,5],[1,7],[2,6]]
- CS III: k=3, n=7 → [[1,2,4]]
- CS III: k=2, n=5 → [[1,4],[2,3]]

### 11. Step-by-Step Trace Format
Use consistent table columns based on problem type:

**Combination Sum (target-based):**
```markdown
| Step | start | path | remain | Action |
|------|-------|------|--------|--------|
| 1 | 0 | [] | 5 | Try 2 |
| 2 | 0 | [2] | 3 | Try 2 again (reuse allowed) |
| 3 | 0 | [2,2] | 1 | 1 < min(candidates), backtrack |
| 4 | 1 | [2] | 3 | Try 3 |
| 5 | 1 | [2,3] | 0 | Found! Add [2,3] |
```

**Subsets/Combinations (no target):**
```markdown
| Step | index | path | Action |
|------|-------|------|--------|
| 1 | 0 | [] | Include 1 |
| 2 | 1 | [1] | Include 2 |
| 3 | 2 | [1,2] | Add result, backtrack |
```

**Grid Backtracking:**
```markdown
| Step | (row,col) | matched | Action |
|------|-----------|---------|--------|
| 1 | (0,0) | "" | Try 'A', matches word[0] |
| 2 | (0,0) | "A" | Mark visited, explore neighbors |
```

### 12. Pruning Documentation
Always explicitly document pruning conditions:

```javascript
// Pruning: if remaining becomes negative, stop exploring
if (remaining < 0) return;

// Pruning: if we can't reach k elements
if (9 - start + 1 < k - path.length) return;

// Pruning: if remaining sum too small
if (remaining > (9 + 9 - k + 1) * k / 2) return;
```

### 13. Common Mistakes Section
Each section should call out common interview mistakes:

```markdown
**Common Mistakes:**
1. Forgetting to sort for duplicate handling (CS II)
2. Using `i` instead of `i+1` when reuse not allowed
3. Not making a copy: `result.push(path)` vs `result.push([...path])`
4. Forgetting to restore state after backtrack (grid problems)
```

## Remaining Sections (Not Yet Updated)

The following sections need the same treatment:

| Section | Topic | Needs |
|---------|-------|-------|
| 0 | Introduction | Review for consistency |
| 1 | Core Concept | Review for consistency |
| 9 | Palindrome Partitioning | Decision tree, visualizer, Q&A |
| 10 | N-Queens | Grid visualizer, step trace, Q&A |
| 11 | Sudoku Solver | Constraint visualization, Q&A |
| 12 | Generate Parentheses | Decision tree, open/close tracking |
| 13 | Subset Sum | Compare with CS variations |
| 14 | Expression Operators | Expression tree visualization |
| 15 | Restore IP Addresses | Segment validation, Q&A |
| 16 | Interview Patterns | Summary, pattern recognition |
| 17 | Practice Problems | Problem links, hints |
| 18 | Conclusion | Recap, next steps |

## Visualizer Naming Convention

Follow this pattern for new visualizers:
- `{ProblemName}Visualizer.tsx` - e.g., `PalindromePartitionVisualizer.tsx`
- Place in `frontend/src/components/visualizers/`
- Use dynamic import with SSR disabled
- Include loading state via `VisualizerLoading` component

---

# Improve the Backtracking Pattern to FAANG Interview Standards

## Target Audience
- Software engineers preparing for FAANG (Meta, Amazon, Apple, Netflix, Google) interviews
- Engineers targeting top tech companies (Microsoft, Uber, Airbnb, LinkedIn, etc.)
- Competitive programmers preparing for contests
- Anyone wanting to master backtracking at an expert level

## Quality Standard
The DP pattern and Heap pattern are the quality benchmark. The Backtracking pattern should:
1. Build intuition before algorithms
2. Explain every "why" with simple examples
3. Use extensive visualizations (decision trees, state diagrams)
4. Cover ALL common FAANG backtracking problem types
5. Include templates for each sub-pattern
6. Provide interview-ready communication scripts

---

# Current State Analysis

## What the Backtracking Pattern Has

| Aspect | Status | Details |
|--------|--------|---------|
| Tutorial sections | 15 | Good coverage of basics |
| Variations | 5 | Subsets, Permutations, Combinations, Duplicates, Grid |
| Common problems | 8 | Core problems listed |
| Key insights | 5 | Good but could expand |
| Common mistakes | 4 | Needs expansion |
| ASCII diagrams | 12/15 sections | Good visual traces |
| Tables | 4/15 sections | Could add more |
| Visualizers linked | 0 | CRITICAL GAP |
| Code format | Correct (`code` not `approaches`) | Good |

## Critical Gaps

| Requirement | Current State | Action Needed |
|-------------|---------------|---------------|
| Learning objectives | Missing | Add "What You'll Learn" to Section 1 |
| Input constraint mapping | Missing | Add constraint table |
| Checkpoint questions | Missing | Add after key concepts |
| Follow-up questions | Missing | Add for each problem |
| Edge case checklist | Partial | Expand and formalize |
| Interview communication | Missing | Add UMPIRE scripts |
| Pattern comparison | Partial | Expand (Backtracking vs DP vs Greedy) |
| Complexity derivations | Partial | Add formal proofs |
| Difficulty progression | Missing | Order problems Easy -> Hard |
| Dry-run trace tables | Partial | Formalize into tables |
| Visualizer integration | None linked | Link all existing visualizers |
| Pruning techniques | Basic | Add comprehensive pruning section |

---

# What is Backtracking?

## The Core Idea

Backtracking is a systematic way to explore all possible solutions by:
1. Building solutions incrementally
2. Abandoning paths that cannot lead to valid solutions (pruning)
3. Undoing choices and trying alternatives

**Think of it like exploring a maze:**
```
        START
           │
     ┌─────┼─────┐
     │     │     │
    [A]   [B]   [C]    ← Make a choice
     │     │     │
    Dead  ┌┴┐   Goal!   ← Evaluate
    End   │ │
         [D][E]         ← Continue or backtrack
          │  │
        Dead Goal!
        End
```

When you hit a dead end, you "backtrack" to the last decision point and try a different path.

## The Backtracking Formula

```
Backtracking = DFS + Pruning + Undo

1. Choose    → Make a choice (add to path)
2. Explore   → Recursively explore (DFS)
3. Unchoose  → Undo the choice (backtrack)
```

## When to Use Backtracking

| Signal | Example |
|--------|---------|
| "Generate ALL" | All permutations, all subsets, all paths |
| "Find ALL valid" | All valid parentheses, all valid IP addresses |
| "Constraint satisfaction" | Sudoku, N-Queens, crossword puzzles |
| Exponential output | 2^n subsets, n! permutations |
| Decision tree structure | Include/exclude, take/skip choices |

---

# Input Constraint Analysis for Backtracking

## When Backtracking is Feasible

| Input Size | Max Complexity | Typical Patterns |
|------------|----------------|------------------|
| n <= 10 | O(n!) | Permutations, full search |
| n <= 15-20 | O(2^n) | Subsets, combinations, bitmask |
| n <= 25 | O(2^n) with pruning | Meet-in-the-middle, heavy pruning |
| n <= 100 | O(n^2) to O(n^3) | NOT backtracking (use DP/Greedy) |

**Key insight:** If n > 20 and output is exponential, backtracking will TLE. Consider DP or pruning optimizations.

## Constraint Signals for Backtracking

| Constraint | Likely Approach |
|------------|-----------------|
| n <= 10, "all orderings" | Full permutation O(n!) |
| n <= 20, "all subsets/combinations" | Subset generation O(2^n) |
| n <= 9, "grid with constraints" | Sudoku/N-Queens style |
| "generate all valid X" | Backtracking with pruning |
| "count all ways" (small n) | Backtracking (or DP if overlapping) |

---

# The 8 Backtracking Sub-Patterns

## 1. Subsets (Power Set)

**When to use:** Generate all 2^n subsets of an array.

**Key insight:** At each element, make a binary choice: include or exclude.

**Why `i + 1`?** To avoid duplicates. `[1,2]` and `[2,1]` are the same subset.

**Time:** O(n * 2^n) - 2^n subsets, O(n) to copy each.

**Space:** O(n) recursion depth.

**Problems:**
- Subsets (LC 78)
- Subsets II (LC 90)
- Letter Case Permutation (LC 784)

### Complete Runnable Code

**Go:**
```go
package main

import "fmt"

func subsets(nums []int) [][]int {
    result := [][]int{}
    path := []int{}
    
    var backtrack func(start int)
    backtrack = func(start int) {
        // Add current path (copy to avoid reference issues)
        temp := make([]int, len(path))
        copy(temp, path)
        result = append(result, temp)
        
        for i := start; i < len(nums); i++ {
            path = append(path, nums[i])    // Choose
            backtrack(i + 1)                 // Explore
            path = path[:len(path)-1]        // Unchoose
        }
    }
    
    backtrack(0)
    return result
}

func main() {
    nums := []int{1, 2, 3}
    result := subsets(nums)
    fmt.Printf("Input: %v\n", nums)
    fmt.Printf("Output: %v\n", result)
    // Output: [[] [1] [1 2] [1 2 3] [1 3] [2] [2 3] [3]]
}
```

**Java:**
```java
import java.util.*;

public class Subsets {
    public List<List<Integer>> subsets(int[] nums) {
        List<List<Integer>> result = new ArrayList<>();
        backtrack(nums, 0, new ArrayList<>(), result);
        return result;
    }
    
    private void backtrack(int[] nums, int start, List<Integer> path, 
                           List<List<Integer>> result) {
        // Add current path (copy to avoid reference issues)
        result.add(new ArrayList<>(path));
        
        for (int i = start; i < nums.length; i++) {
            path.add(nums[i]);              // Choose
            backtrack(nums, i + 1, path, result);  // Explore
            path.remove(path.size() - 1);   // Unchoose
        }
    }
    
    public static void main(String[] args) {
        Subsets solution = new Subsets();
        int[] nums = {1, 2, 3};
        List<List<Integer>> result = solution.subsets(nums);
        System.out.println("Input: " + Arrays.toString(nums));
        System.out.println("Output: " + result);
        // Output: [[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]]
    }
}
```

**JavaScript:**
```javascript
function subsets(nums) {
    const result = [];
    const path = [];
    
    function backtrack(start) {
        // Add current path (copy to avoid reference issues)
        result.push([...path]);
        
        for (let i = start; i < nums.length; i++) {
            path.push(nums[i]);     // Choose
            backtrack(i + 1);       // Explore
            path.pop();             // Unchoose
        }
    }
    
    backtrack(0);
    return result;
}

// Test
const nums = [1, 2, 3];
const result = subsets(nums);
console.log("Input:", nums);
console.log("Output:", JSON.stringify(result));
// Output: [[],[1],[1,2],[1,2,3],[1,3],[2],[2,3],[3]]
```

---

## 2. Permutations

**When to use:** Generate all n! orderings of elements.

**Key insight:** Use a `used[]` array to track which elements are in the current path.

**Why not use `start` like subsets?** Because order matters! `[1,2]` and `[2,1]` are different permutations.

**Time:** O(n * n!) - n! permutations, O(n) to copy each.

**Space:** O(n) for recursion and used array.

**Problems:**
- Permutations (LC 46)
- Permutations II (LC 47)
- Next Permutation (LC 31)

### Complete Runnable Code

**Go:**
```go
package main

import "fmt"

func permute(nums []int) [][]int {
    result := [][]int{}
    path := []int{}
    used := make([]bool, len(nums))
    
    var backtrack func()
    backtrack = func() {
        if len(path) == len(nums) {
            temp := make([]int, len(path))
            copy(temp, path)
            result = append(result, temp)
            return
        }
        
        for i := 0; i < len(nums); i++ {  // Start from 0, not start!
            if used[i] {
                continue
            }
            
            used[i] = true                   // Mark used
            path = append(path, nums[i])     // Choose
            backtrack()                      // Explore
            path = path[:len(path)-1]        // Unchoose
            used[i] = false                  // Unmark
        }
    }
    
    backtrack()
    return result
}

func main() {
    nums := []int{1, 2, 3}
    result := permute(nums)
    fmt.Printf("Input: %v\n", nums)
    fmt.Printf("Output: %v\n", result)
    fmt.Printf("Count: %d permutations\n", len(result))
    // Output: [[1 2 3] [1 3 2] [2 1 3] [2 3 1] [3 1 2] [3 2 1]]
    // Count: 6 permutations (3! = 6)
}
```

**Java:**
```java
import java.util.*;

public class Permutations {
    public List<List<Integer>> permute(int[] nums) {
        List<List<Integer>> result = new ArrayList<>();
        boolean[] used = new boolean[nums.length];
        backtrack(nums, used, new ArrayList<>(), result);
        return result;
    }
    
    private void backtrack(int[] nums, boolean[] used, List<Integer> path,
                           List<List<Integer>> result) {
        if (path.size() == nums.length) {
            result.add(new ArrayList<>(path));
            return;
        }
        
        for (int i = 0; i < nums.length; i++) {  // Start from 0!
            if (used[i]) continue;
            
            used[i] = true;                 // Mark used
            path.add(nums[i]);              // Choose
            backtrack(nums, used, path, result);  // Explore
            path.remove(path.size() - 1);   // Unchoose
            used[i] = false;                // Unmark
        }
    }
    
    public static void main(String[] args) {
        Permutations solution = new Permutations();
        int[] nums = {1, 2, 3};
        List<List<Integer>> result = solution.permute(nums);
        System.out.println("Input: " + Arrays.toString(nums));
        System.out.println("Output: " + result);
        System.out.println("Count: " + result.size() + " permutations");
        // Output: [[1,2,3], [1,3,2], [2,1,3], [2,3,1], [3,1,2], [3,2,1]]
    }
}
```

**JavaScript:**
```javascript
function permute(nums) {
    const result = [];
    const path = [];
    const used = new Array(nums.length).fill(false);
    
    function backtrack() {
        if (path.length === nums.length) {
            result.push([...path]);
            return;
        }
        
        for (let i = 0; i < nums.length; i++) {  // Start from 0!
            if (used[i]) continue;
            
            used[i] = true;             // Mark used
            path.push(nums[i]);         // Choose
            backtrack();                // Explore
            path.pop();                 // Unchoose
            used[i] = false;            // Unmark
        }
    }
    
    backtrack();
    return result;
}

// Test
const nums = [1, 2, 3];
const result = permute(nums);
console.log("Input:", nums);
console.log("Output:", JSON.stringify(result));
console.log("Count:", result.length, "permutations");
// Output: [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]
```

---

## 3. Combinations (Choose K from N)

**When to use:** Select exactly k elements from n elements.

**Key insight:** Same as subsets, but only add to result when `path.length == k`.

**Pruning insight:** If we need 3 more elements but only 2 remain, skip this branch early.

**Time:** O(k * C(n,k)) - C(n,k) combinations, O(k) to copy each.

**Problems:**
- Combinations (LC 77)
- Combination Sum (LC 39)
- Combination Sum II (LC 40)
- Combination Sum III (LC 216)

### Complete Runnable Code

**Go:**
```go
package main

import "fmt"

func combine(n int, k int) [][]int {
    result := [][]int{}
    path := []int{}
    
    var backtrack func(start int)
    backtrack = func(start int) {
        if len(path) == k {
            temp := make([]int, k)
            copy(temp, path)
            result = append(result, temp)
            return
        }
        
        // Pruning: need (k - len(path)) more elements
        // Can only go up to n - remaining + 1
        remaining := k - len(path)
        for i := start; i <= n-remaining+1; i++ {
            path = append(path, i)       // Choose
            backtrack(i + 1)             // Explore
            path = path[:len(path)-1]    // Unchoose
        }
    }
    
    backtrack(1)
    return result
}

func main() {
    n, k := 4, 2
    result := combine(n, k)
    fmt.Printf("C(%d, %d) = %v\n", n, k, result)
    fmt.Printf("Count: %d combinations\n", len(result))
    // Output: C(4, 2) = [[1 2] [1 3] [1 4] [2 3] [2 4] [3 4]]
    // Count: 6 combinations
}
```

**Java:**
```java
import java.util.*;

public class Combinations {
    public List<List<Integer>> combine(int n, int k) {
        List<List<Integer>> result = new ArrayList<>();
        backtrack(n, k, 1, new ArrayList<>(), result);
        return result;
    }
    
    private void backtrack(int n, int k, int start, List<Integer> path,
                           List<List<Integer>> result) {
        if (path.size() == k) {
            result.add(new ArrayList<>(path));
            return;
        }
        
        // Pruning: need (k - path.size()) more elements
        int remaining = k - path.size();
        for (int i = start; i <= n - remaining + 1; i++) {
            path.add(i);                        // Choose
            backtrack(n, k, i + 1, path, result);  // Explore
            path.remove(path.size() - 1);       // Unchoose
        }
    }
    
    public static void main(String[] args) {
        Combinations solution = new Combinations();
        int n = 4, k = 2;
        List<List<Integer>> result = solution.combine(n, k);
        System.out.printf("C(%d, %d) = %s%n", n, k, result);
        System.out.printf("Count: %d combinations%n", result.size());
        // Output: C(4, 2) = [[1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]]
    }
}
```

**JavaScript:**
```javascript
function combine(n, k) {
    const result = [];
    const path = [];
    
    function backtrack(start) {
        if (path.length === k) {
            result.push([...path]);
            return;
        }
        
        // Pruning: need (k - path.length) more elements
        const remaining = k - path.length;
        for (let i = start; i <= n - remaining + 1; i++) {
            path.push(i);           // Choose
            backtrack(i + 1);       // Explore
            path.pop();             // Unchoose
        }
    }
    
    backtrack(1);
    return result;
}

// Test
const n = 4, k = 2;
const result = combine(n, k);
console.log(`C(${n}, ${k}) =`, JSON.stringify(result));
console.log(`Count: ${result.length} combinations`);
// Output: C(4, 2) = [[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]
```

---

## 4. Handling Duplicates

**When to use:** Input has duplicate elements, but output should have unique results.

**Key insight:** Sort first, then skip duplicates at the same decision level.

**Why `i > start`?** First occurrence at this level is OK. Skip only the subsequent duplicates.

**Why `!used[i-1]`?** Forces using duplicates in order. If `nums = [1,1,2]`:
- Use first `1`, then second `1` -> Valid
- Skip first `1`, use second `1` -> Duplicate, skip

**Problems:**
- Subsets II (LC 90)
- Permutations II (LC 47)
- Combination Sum II (LC 40)

### Complete Runnable Code: Subsets with Duplicates

**Go:**
```go
package main

import (
    "fmt"
    "sort"
)

func subsetsWithDup(nums []int) [][]int {
    sort.Ints(nums)  // MUST sort first!
    result := [][]int{}
    path := []int{}
    
    var backtrack func(start int)
    backtrack = func(start int) {
        temp := make([]int, len(path))
        copy(temp, path)
        result = append(result, temp)
        
        for i := start; i < len(nums); i++ {
            // Skip duplicates at SAME LEVEL
            if i > start && nums[i] == nums[i-1] {
                continue
            }
            
            path = append(path, nums[i])
            backtrack(i + 1)
            path = path[:len(path)-1]
        }
    }
    
    backtrack(0)
    return result
}

func main() {
    nums := []int{1, 2, 2}
    result := subsetsWithDup(nums)
    fmt.Printf("Input: %v\n", nums)
    fmt.Printf("Output: %v\n", result)
    // Output: [[] [1] [1 2] [1 2 2] [2] [2 2]]
    // Note: No duplicate subsets like [2] appearing twice
}
```

**Java:**
```java
import java.util.*;

public class SubsetsWithDup {
    public List<List<Integer>> subsetsWithDup(int[] nums) {
        Arrays.sort(nums);  // MUST sort first!
        List<List<Integer>> result = new ArrayList<>();
        backtrack(nums, 0, new ArrayList<>(), result);
        return result;
    }
    
    private void backtrack(int[] nums, int start, List<Integer> path,
                           List<List<Integer>> result) {
        result.add(new ArrayList<>(path));
        
        for (int i = start; i < nums.length; i++) {
            // Skip duplicates at SAME LEVEL
            if (i > start && nums[i] == nums[i - 1]) continue;
            
            path.add(nums[i]);
            backtrack(nums, i + 1, path, result);
            path.remove(path.size() - 1);
        }
    }
    
    public static void main(String[] args) {
        SubsetsWithDup solution = new SubsetsWithDup();
        int[] nums = {1, 2, 2};
        List<List<Integer>> result = solution.subsetsWithDup(nums);
        System.out.println("Input: " + Arrays.toString(nums));
        System.out.println("Output: " + result);
        // Output: [[], [1], [1, 2], [1, 2, 2], [2], [2, 2]]
    }
}
```

**JavaScript:**
```javascript
function subsetsWithDup(nums) {
    nums.sort((a, b) => a - b);  // MUST sort first!
    const result = [];
    const path = [];
    
    function backtrack(start) {
        result.push([...path]);
        
        for (let i = start; i < nums.length; i++) {
            // Skip duplicates at SAME LEVEL
            if (i > start && nums[i] === nums[i - 1]) continue;
            
            path.push(nums[i]);
            backtrack(i + 1);
            path.pop();
        }
    }
    
    backtrack(0);
    return result;
}

// Test
const nums = [1, 2, 2];
const result = subsetsWithDup(nums);
console.log("Input:", nums);
console.log("Output:", JSON.stringify(result));
// Output: [[],[1],[1,2],[1,2,2],[2],[2,2]]
```

### Complete Runnable Code: Permutations with Duplicates

**Go:**
```go
package main

import (
    "fmt"
    "sort"
)

func permuteUnique(nums []int) [][]int {
    sort.Ints(nums)  // MUST sort first!
    result := [][]int{}
    path := []int{}
    used := make([]bool, len(nums))
    
    var backtrack func()
    backtrack = func() {
        if len(path) == len(nums) {
            temp := make([]int, len(path))
            copy(temp, path)
            result = append(result, temp)
            return
        }
        
        for i := 0; i < len(nums); i++ {
            if used[i] {
                continue
            }
            // Skip duplicate if previous identical element not used
            if i > 0 && nums[i] == nums[i-1] && !used[i-1] {
                continue
            }
            
            used[i] = true
            path = append(path, nums[i])
            backtrack()
            path = path[:len(path)-1]
            used[i] = false
        }
    }
    
    backtrack()
    return result
}

func main() {
    nums := []int{1, 1, 2}
    result := permuteUnique(nums)
    fmt.Printf("Input: %v\n", nums)
    fmt.Printf("Output: %v\n", result)
    fmt.Printf("Count: %d unique permutations\n", len(result))
    // Output: [[1 1 2] [1 2 1] [2 1 1]]
    // Count: 3 (not 6, because of duplicates)
}
```

**Java:**
```java
import java.util.*;

public class PermutationsII {
    public List<List<Integer>> permuteUnique(int[] nums) {
        Arrays.sort(nums);  // MUST sort first!
        List<List<Integer>> result = new ArrayList<>();
        boolean[] used = new boolean[nums.length];
        backtrack(nums, used, new ArrayList<>(), result);
        return result;
    }
    
    private void backtrack(int[] nums, boolean[] used, List<Integer> path,
                           List<List<Integer>> result) {
        if (path.size() == nums.length) {
            result.add(new ArrayList<>(path));
            return;
        }
        
        for (int i = 0; i < nums.length; i++) {
            if (used[i]) continue;
            // Skip duplicate if previous identical element not used
            if (i > 0 && nums[i] == nums[i - 1] && !used[i - 1]) continue;
            
            used[i] = true;
            path.add(nums[i]);
            backtrack(nums, used, path, result);
            path.remove(path.size() - 1);
            used[i] = false;
        }
    }
    
    public static void main(String[] args) {
        PermutationsII solution = new PermutationsII();
        int[] nums = {1, 1, 2};
        List<List<Integer>> result = solution.permuteUnique(nums);
        System.out.println("Input: " + Arrays.toString(nums));
        System.out.println("Output: " + result);
        System.out.println("Count: " + result.size() + " unique permutations");
        // Output: [[1, 1, 2], [1, 2, 1], [2, 1, 1]]
    }
}
```

**JavaScript:**
```javascript
function permuteUnique(nums) {
    nums.sort((a, b) => a - b);  // MUST sort first!
    const result = [];
    const path = [];
    const used = new Array(nums.length).fill(false);
    
    function backtrack() {
        if (path.length === nums.length) {
            result.push([...path]);
            return;
        }
        
        for (let i = 0; i < nums.length; i++) {
            if (used[i]) continue;
            // Skip duplicate if previous identical element not used
            if (i > 0 && nums[i] === nums[i - 1] && !used[i - 1]) continue;
            
            used[i] = true;
            path.push(nums[i]);
            backtrack();
            path.pop();
            used[i] = false;
        }
    }
    
    backtrack();
    return result;
}

// Test
const nums = [1, 1, 2];
const result = permuteUnique(nums);
console.log("Input:", nums);
console.log("Output:", JSON.stringify(result));
console.log("Count:", result.length, "unique permutations");
// Output: [[1,1,2],[1,2,1],[2,1,1]]
```

---

## 5. Combination Sum Variants

**Variants based on element reuse:**

| Problem | Can Reuse? | Has Duplicates? | Next Index |
|---------|------------|-----------------|------------|
| Combination Sum | Yes | No | `i` (same) |
| Combination Sum II | No | Yes | `i + 1` |
| Combination Sum III | No | No (1-9) | `i + 1` |
| Coin Change (count) | Yes | No | `i` |

**Optimization:** Sort candidates and break early when `candidates[i] > remaining`.

**Problems:**
- Combination Sum (LC 39)
- Combination Sum II (LC 40)
- Combination Sum III (LC 216)
- Combination Sum IV (LC 377) - Actually DP!

### Complete Runnable Code: Combination Sum (Unlimited Reuse)

**Go:**
```go
package main

import "fmt"

func combinationSum(candidates []int, target int) [][]int {
    result := [][]int{}
    path := []int{}
    
    var backtrack func(start, remaining int)
    backtrack = func(start, remaining int) {
        if remaining == 0 {
            temp := make([]int, len(path))
            copy(temp, path)
            result = append(result, temp)
            return
        }
        if remaining < 0 {
            return  // Pruning
        }
        
        for i := start; i < len(candidates); i++ {
            path = append(path, candidates[i])
            backtrack(i, remaining-candidates[i])  // i, NOT i+1 (reuse allowed)
            path = path[:len(path)-1]
        }
    }
    
    backtrack(0, target)
    return result
}

func main() {
    candidates := []int{2, 3, 6, 7}
    target := 7
    result := combinationSum(candidates, target)
    fmt.Printf("Candidates: %v, Target: %d\n", candidates, target)
    fmt.Printf("Output: %v\n", result)
    // Output: [[2 2 3] [7]]
}
```

**Java:**
```java
import java.util.*;

public class CombinationSum {
    public List<List<Integer>> combinationSum(int[] candidates, int target) {
        List<List<Integer>> result = new ArrayList<>();
        backtrack(candidates, target, 0, new ArrayList<>(), result);
        return result;
    }
    
    private void backtrack(int[] candidates, int remaining, int start,
                           List<Integer> path, List<List<Integer>> result) {
        if (remaining == 0) {
            result.add(new ArrayList<>(path));
            return;
        }
        if (remaining < 0) return;  // Pruning
        
        for (int i = start; i < candidates.length; i++) {
            path.add(candidates[i]);
            backtrack(candidates, remaining - candidates[i], i, path, result);  // i, NOT i+1
            path.remove(path.size() - 1);
        }
    }
    
    public static void main(String[] args) {
        CombinationSum solution = new CombinationSum();
        int[] candidates = {2, 3, 6, 7};
        int target = 7;
        List<List<Integer>> result = solution.combinationSum(candidates, target);
        System.out.printf("Candidates: %s, Target: %d%n", Arrays.toString(candidates), target);
        System.out.println("Output: " + result);
        // Output: [[2, 2, 3], [7]]
    }
}
```

**JavaScript:**
```javascript
function combinationSum(candidates, target) {
    const result = [];
    const path = [];
    
    function backtrack(start, remaining) {
        if (remaining === 0) {
            result.push([...path]);
            return;
        }
        if (remaining < 0) return;  // Pruning
        
        for (let i = start; i < candidates.length; i++) {
            path.push(candidates[i]);
            backtrack(i, remaining - candidates[i]);  // i, NOT i+1 (reuse allowed)
            path.pop();
        }
    }
    
    backtrack(0, target);
    return result;
}

// Test
const candidates = [2, 3, 6, 7];
const target = 7;
const result = combinationSum(candidates, target);
console.log(`Candidates: [${candidates}], Target: ${target}`);
console.log("Output:", JSON.stringify(result));
// Output: [[2,2,3],[7]]
```

### Complete Runnable Code: Combination Sum II (No Reuse, Has Duplicates)

**Go:**
```go
package main

import (
    "fmt"
    "sort"
)

func combinationSum2(candidates []int, target int) [][]int {
    sort.Ints(candidates)  // MUST sort for duplicate handling
    result := [][]int{}
    path := []int{}
    
    var backtrack func(start, remaining int)
    backtrack = func(start, remaining int) {
        if remaining == 0 {
            temp := make([]int, len(path))
            copy(temp, path)
            result = append(result, temp)
            return
        }
        
        for i := start; i < len(candidates); i++ {
            // Pruning: too large
            if candidates[i] > remaining {
                break
            }
            // Skip duplicates at same level
            if i > start && candidates[i] == candidates[i-1] {
                continue
            }
            
            path = append(path, candidates[i])
            backtrack(i+1, remaining-candidates[i])  // i+1 (no reuse)
            path = path[:len(path)-1]
        }
    }
    
    backtrack(0, target)
    return result
}

func main() {
    candidates := []int{10, 1, 2, 7, 6, 1, 5}
    target := 8
    result := combinationSum2(candidates, target)
    fmt.Printf("Candidates: %v, Target: %d\n", candidates, target)
    fmt.Printf("Output: %v\n", result)
    // Output: [[1 1 6] [1 2 5] [1 7] [2 6]]
}
```

**Java:**
```java
import java.util.*;

public class CombinationSumII {
    public List<List<Integer>> combinationSum2(int[] candidates, int target) {
        Arrays.sort(candidates);  // MUST sort for duplicate handling
        List<List<Integer>> result = new ArrayList<>();
        backtrack(candidates, target, 0, new ArrayList<>(), result);
        return result;
    }
    
    private void backtrack(int[] candidates, int remaining, int start,
                           List<Integer> path, List<List<Integer>> result) {
        if (remaining == 0) {
            result.add(new ArrayList<>(path));
            return;
        }
        
        for (int i = start; i < candidates.length; i++) {
            // Pruning: too large
            if (candidates[i] > remaining) break;
            // Skip duplicates at same level
            if (i > start && candidates[i] == candidates[i - 1]) continue;
            
            path.add(candidates[i]);
            backtrack(candidates, remaining - candidates[i], i + 1, path, result);  // i+1
            path.remove(path.size() - 1);
        }
    }
    
    public static void main(String[] args) {
        CombinationSumII solution = new CombinationSumII();
        int[] candidates = {10, 1, 2, 7, 6, 1, 5};
        int target = 8;
        List<List<Integer>> result = solution.combinationSum2(candidates, target);
        System.out.printf("Candidates: %s, Target: %d%n", Arrays.toString(candidates), target);
        System.out.println("Output: " + result);
        // Output: [[1, 1, 6], [1, 2, 5], [1, 7], [2, 6]]
    }
}
```

**JavaScript:**
```javascript
function combinationSum2(candidates, target) {
    candidates.sort((a, b) => a - b);  // MUST sort for duplicate handling
    const result = [];
    const path = [];
    
    function backtrack(start, remaining) {
        if (remaining === 0) {
            result.push([...path]);
            return;
        }
        
        for (let i = start; i < candidates.length; i++) {
            // Pruning: too large
            if (candidates[i] > remaining) break;
            // Skip duplicates at same level
            if (i > start && candidates[i] === candidates[i - 1]) continue;
            
            path.push(candidates[i]);
            backtrack(i + 1, remaining - candidates[i]);  // i+1 (no reuse)
            path.pop();
        }
    }
    
    backtrack(0, target);
    return result;
}

// Test
const candidates = [10, 1, 2, 7, 6, 1, 5];
const target = 8;
const result = combinationSum2(candidates, target);
console.log(`Candidates: [${candidates}], Target: ${target}`);
console.log("Output:", JSON.stringify(result));
// Output: [[1,1,6],[1,2,5],[1,7],[2,6]]
```

---

## 6. Grid Backtracking

**When to use:** Search for patterns in 2D grids (word search, path finding).

**Key insight:** Mark cells visited before exploring, restore after backtracking.

**Why modify the grid?** Saves space vs maintaining a separate `visited` array.

**Problems:**
- Word Search (LC 79)
- Word Search II (LC 212) - Use Trie for optimization
- Unique Paths III (LC 980)
- Shortest Path in Binary Matrix (BFS better)

### Complete Runnable Code: Word Search

**Go:**
```go
package main

import "fmt"

func exist(board [][]byte, word string) bool {
    rows, cols := len(board), len(board[0])
    
    var backtrack func(row, col, index int) bool
    backtrack = func(row, col, index int) bool {
        // Found complete word
        if index == len(word) {
            return true
        }
        
        // Out of bounds or wrong character
        if row < 0 || row >= rows || col < 0 || col >= cols {
            return false
        }
        if board[row][col] != word[index] {
            return false
        }
        
        // Mark visited
        temp := board[row][col]
        board[row][col] = '#'
        
        // Explore 4 directions
        found := backtrack(row+1, col, index+1) ||
                 backtrack(row-1, col, index+1) ||
                 backtrack(row, col+1, index+1) ||
                 backtrack(row, col-1, index+1)
        
        // Restore (backtrack)
        board[row][col] = temp
        
        return found
    }
    
    // Try starting from each cell
    for r := 0; r < rows; r++ {
        for c := 0; c < cols; c++ {
            if backtrack(r, c, 0) {
                return true
            }
        }
    }
    return false
}

func main() {
    board := [][]byte{
        {'A', 'B', 'C', 'E'},
        {'S', 'F', 'C', 'S'},
        {'A', 'D', 'E', 'E'},
    }
    
    tests := []string{"ABCCED", "SEE", "ABCB"}
    for _, word := range tests {
        // Need fresh board each time (or restore properly)
        testBoard := make([][]byte, len(board))
        for i := range board {
            testBoard[i] = make([]byte, len(board[i]))
            copy(testBoard[i], board[i])
        }
        result := exist(testBoard, word)
        fmt.Printf("Word '%s': %v\n", word, result)
    }
    // Output:
    // Word 'ABCCED': true
    // Word 'SEE': true
    // Word 'ABCB': false (can't reuse B)
}
```

**Java:**
```java
public class WordSearch {
    public boolean exist(char[][] board, String word) {
        int rows = board.length, cols = board[0].length;
        
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (backtrack(board, word, r, c, 0)) {
                    return true;
                }
            }
        }
        return false;
    }
    
    private boolean backtrack(char[][] board, String word, int row, int col, int index) {
        // Found complete word
        if (index == word.length()) return true;
        
        // Out of bounds or wrong character
        if (row < 0 || row >= board.length || col < 0 || col >= board[0].length) {
            return false;
        }
        if (board[row][col] != word.charAt(index)) return false;
        
        // Mark visited
        char temp = board[row][col];
        board[row][col] = '#';
        
        // Explore 4 directions
        boolean found = backtrack(board, word, row + 1, col, index + 1) ||
                        backtrack(board, word, row - 1, col, index + 1) ||
                        backtrack(board, word, row, col + 1, index + 1) ||
                        backtrack(board, word, row, col - 1, index + 1);
        
        // Restore (backtrack)
        board[row][col] = temp;
        
        return found;
    }
    
    public static void main(String[] args) {
        WordSearch solution = new WordSearch();
        char[][] board = {
            {'A', 'B', 'C', 'E'},
            {'S', 'F', 'C', 'S'},
            {'A', 'D', 'E', 'E'}
        };
        
        String[] tests = {"ABCCED", "SEE", "ABCB"};
        for (String word : tests) {
            // Clone board for each test
            char[][] testBoard = new char[board.length][];
            for (int i = 0; i < board.length; i++) {
                testBoard[i] = board[i].clone();
            }
            boolean result = solution.exist(testBoard, word);
            System.out.printf("Word '%s': %b%n", word, result);
        }
        // Output:
        // Word 'ABCCED': true
        // Word 'SEE': true
        // Word 'ABCB': false
    }
}
```

**JavaScript:**
```javascript
function exist(board, word) {
    const rows = board.length;
    const cols = board[0].length;
    
    function backtrack(row, col, index) {
        // Found complete word
        if (index === word.length) return true;
        
        // Out of bounds or wrong character
        if (row < 0 || row >= rows || col < 0 || col >= cols) {
            return false;
        }
        if (board[row][col] !== word[index]) return false;
        
        // Mark visited
        const temp = board[row][col];
        board[row][col] = '#';
        
        // Explore 4 directions
        const found = backtrack(row + 1, col, index + 1) ||
                      backtrack(row - 1, col, index + 1) ||
                      backtrack(row, col + 1, index + 1) ||
                      backtrack(row, col - 1, index + 1);
        
        // Restore (backtrack)
        board[row][col] = temp;
        
        return found;
    }
    
    // Try starting from each cell
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (backtrack(r, c, 0)) {
                return true;
            }
        }
    }
    return false;
}

// Test
const board = [
    ['A', 'B', 'C', 'E'],
    ['S', 'F', 'C', 'S'],
    ['A', 'D', 'E', 'E']
];

const tests = ["ABCCED", "SEE", "ABCB"];
for (const word of tests) {
    // Clone board for each test
    const testBoard = board.map(row => [...row]);
    const result = exist(testBoard, word);
    console.log(`Word '${word}': ${result}`);
}
// Output:
// Word 'ABCCED': true
// Word 'SEE': true
// Word 'ABCB': false
```

---

## 7. Constraint Satisfaction (N-Queens, Sudoku)

**When to use:** Place items following specific rules, find all valid configurations.

**Diagonal insight:**
```
Main diagonal (row - col constant):
  0 -1 -2 -3
  1  0 -1 -2
  2  1  0 -1
  3  2  1  0

Anti-diagonal (row + col constant):
  0  1  2  3
  1  2  3  4
  2  3  4  5
  3  4  5  6
```

**Problems:**
- N-Queens (LC 51)
- N-Queens II (LC 52) - Just count
- Sudoku Solver (LC 37)
- Valid Sudoku (LC 36) - Not backtracking

### Complete Runnable Code: N-Queens

**Go:**
```go
package main

import (
    "fmt"
    "strings"
)

func solveNQueens(n int) [][]string {
    result := [][]string{}
    cols := make(map[int]bool)      // Columns under attack
    diag1 := make(map[int]bool)     // Main diagonals (row - col)
    diag2 := make(map[int]bool)     // Anti-diagonals (row + col)
    board := make([]string, n)
    
    var backtrack func(row int)
    backtrack = func(row int) {
        if row == n {
            // Found valid configuration
            temp := make([]string, n)
            copy(temp, board)
            result = append(result, temp)
            return
        }
        
        for col := 0; col < n; col++ {
            if cols[col] || diag1[row-col] || diag2[row+col] {
                continue
            }
            
            // Place queen
            cols[col] = true
            diag1[row-col] = true
            diag2[row+col] = true
            board[row] = strings.Repeat(".", col) + "Q" + strings.Repeat(".", n-col-1)
            
            backtrack(row + 1)
            
            // Remove queen (backtrack)
            delete(cols, col)
            delete(diag1, row-col)
            delete(diag2, row+col)
        }
    }
    
    backtrack(0)
    return result
}

func main() {
    n := 4
    solutions := solveNQueens(n)
    fmt.Printf("%d-Queens: Found %d solutions\n\n", n, len(solutions))
    
    for i, solution := range solutions {
        fmt.Printf("Solution %d:\n", i+1)
        for _, row := range solution {
            fmt.Println(row)
        }
        fmt.Println()
    }
    // Output:
    // 4-Queens: Found 2 solutions
    // Solution 1:
    // .Q..
    // ...Q
    // Q...
    // ..Q.
    // Solution 2:
    // ..Q.
    // Q...
    // ...Q
    // .Q..
}
```

**Java:**
```java
import java.util.*;

public class NQueens {
    public List<List<String>> solveNQueens(int n) {
        List<List<String>> result = new ArrayList<>();
        Set<Integer> cols = new HashSet<>();
        Set<Integer> diag1 = new HashSet<>();
        Set<Integer> diag2 = new HashSet<>();
        String[] board = new String[n];
        
        backtrack(n, 0, cols, diag1, diag2, board, result);
        return result;
    }
    
    private void backtrack(int n, int row, Set<Integer> cols, 
                           Set<Integer> diag1, Set<Integer> diag2,
                           String[] board, List<List<String>> result) {
        if (row == n) {
            result.add(new ArrayList<>(Arrays.asList(board)));
            return;
        }
        
        for (int col = 0; col < n; col++) {
            if (cols.contains(col) || diag1.contains(row - col) || 
                diag2.contains(row + col)) {
                continue;
            }
            
            // Place queen
            cols.add(col);
            diag1.add(row - col);
            diag2.add(row + col);
            board[row] = ".".repeat(col) + "Q" + ".".repeat(n - col - 1);
            
            backtrack(n, row + 1, cols, diag1, diag2, board, result);
            
            // Remove queen (backtrack)
            cols.remove(col);
            diag1.remove(row - col);
            diag2.remove(row + col);
        }
    }
    
    public static void main(String[] args) {
        NQueens solution = new NQueens();
        int n = 4;
        List<List<String>> solutions = solution.solveNQueens(n);
        
        System.out.printf("%d-Queens: Found %d solutions%n%n", n, solutions.size());
        
        int i = 1;
        for (List<String> sol : solutions) {
            System.out.printf("Solution %d:%n", i++);
            for (String row : sol) {
                System.out.println(row);
            }
            System.out.println();
        }
    }
}
```

**JavaScript:**
```javascript
function solveNQueens(n) {
    const result = [];
    const cols = new Set();
    const diag1 = new Set();  // row - col
    const diag2 = new Set();  // row + col
    const board = new Array(n);
    
    function backtrack(row) {
        if (row === n) {
            result.push([...board]);
            return;
        }
        
        for (let col = 0; col < n; col++) {
            if (cols.has(col) || diag1.has(row - col) || diag2.has(row + col)) {
                continue;
            }
            
            // Place queen
            cols.add(col);
            diag1.add(row - col);
            diag2.add(row + col);
            board[row] = '.'.repeat(col) + 'Q' + '.'.repeat(n - col - 1);
            
            backtrack(row + 1);
            
            // Remove queen (backtrack)
            cols.delete(col);
            diag1.delete(row - col);
            diag2.delete(row + col);
        }
    }
    
    backtrack(0);
    return result;
}

// Test
const n = 4;
const solutions = solveNQueens(n);
console.log(`${n}-Queens: Found ${solutions.length} solutions\n`);

solutions.forEach((solution, i) => {
    console.log(`Solution ${i + 1}:`);
    solution.forEach(row => console.log(row));
    console.log();
});
// Output:
// 4-Queens: Found 2 solutions
// Solution 1:
// .Q..
// ...Q
// Q...
// ..Q.
// Solution 2:
// ..Q.
// Q...
// ...Q
// .Q..
```

### Complete Runnable Code: Sudoku Solver

**Go:**
```go
package main

import "fmt"

func solveSudoku(board [][]byte) {
    solve(board)
}

func solve(board [][]byte) bool {
    for row := 0; row < 9; row++ {
        for col := 0; col < 9; col++ {
            if board[row][col] == '.' {
                for num := byte('1'); num <= '9'; num++ {
                    if isValid(board, row, col, num) {
                        board[row][col] = num
                        
                        if solve(board) {
                            return true
                        }
                        
                        board[row][col] = '.'  // Backtrack
                    }
                }
                return false  // No valid digit works
            }
        }
    }
    return true  // All cells filled
}

func isValid(board [][]byte, row, col int, num byte) bool {
    // Check row
    for c := 0; c < 9; c++ {
        if board[row][c] == num {
            return false
        }
    }
    
    // Check column
    for r := 0; r < 9; r++ {
        if board[r][col] == num {
            return false
        }
    }
    
    // Check 3x3 box
    boxRow, boxCol := (row/3)*3, (col/3)*3
    for r := boxRow; r < boxRow+3; r++ {
        for c := boxCol; c < boxCol+3; c++ {
            if board[r][c] == num {
                return false
            }
        }
    }
    
    return true
}

func printBoard(board [][]byte) {
    for i, row := range board {
        if i%3 == 0 && i != 0 {
            fmt.Println("------+-------+------")
        }
        for j, cell := range row {
            if j%3 == 0 && j != 0 {
                fmt.Print("| ")
            }
            fmt.Printf("%c ", cell)
        }
        fmt.Println()
    }
}

func main() {
    board := [][]byte{
        {'5', '3', '.', '.', '7', '.', '.', '.', '.'},
        {'6', '.', '.', '1', '9', '5', '.', '.', '.'},
        {'.', '9', '8', '.', '.', '.', '.', '6', '.'},
        {'8', '.', '.', '.', '6', '.', '.', '.', '3'},
        {'4', '.', '.', '8', '.', '3', '.', '.', '1'},
        {'7', '.', '.', '.', '2', '.', '.', '.', '6'},
        {'.', '6', '.', '.', '.', '.', '2', '8', '.'},
        {'.', '.', '.', '4', '1', '9', '.', '.', '5'},
        {'.', '.', '.', '.', '8', '.', '.', '7', '9'},
    }
    
    fmt.Println("Before:")
    printBoard(board)
    
    solveSudoku(board)
    
    fmt.Println("\nAfter:")
    printBoard(board)
}
```

**Java:**
```java
public class SudokuSolver {
    public void solveSudoku(char[][] board) {
        solve(board);
    }
    
    private boolean solve(char[][] board) {
        for (int row = 0; row < 9; row++) {
            for (int col = 0; col < 9; col++) {
                if (board[row][col] == '.') {
                    for (char num = '1'; num <= '9'; num++) {
                        if (isValid(board, row, col, num)) {
                            board[row][col] = num;
                            
                            if (solve(board)) {
                                return true;
                            }
                            
                            board[row][col] = '.';  // Backtrack
                        }
                    }
                    return false;  // No valid digit works
                }
            }
        }
        return true;  // All cells filled
    }
    
    private boolean isValid(char[][] board, int row, int col, char num) {
        // Check row
        for (int c = 0; c < 9; c++) {
            if (board[row][c] == num) return false;
        }
        
        // Check column
        for (int r = 0; r < 9; r++) {
            if (board[r][col] == num) return false;
        }
        
        // Check 3x3 box
        int boxRow = (row / 3) * 3, boxCol = (col / 3) * 3;
        for (int r = boxRow; r < boxRow + 3; r++) {
            for (int c = boxCol; c < boxCol + 3; c++) {
                if (board[r][c] == num) return false;
            }
        }
        
        return true;
    }
    
    private void printBoard(char[][] board) {
        for (int i = 0; i < 9; i++) {
            if (i % 3 == 0 && i != 0) {
                System.out.println("------+-------+------");
            }
            for (int j = 0; j < 9; j++) {
                if (j % 3 == 0 && j != 0) {
                    System.out.print("| ");
                }
                System.out.print(board[i][j] + " ");
            }
            System.out.println();
        }
    }
    
    public static void main(String[] args) {
        SudokuSolver solver = new SudokuSolver();
        char[][] board = {
            {'5','3','.','.','7','.','.','.','.'},
            {'6','.','.','1','9','5','.','.','.'},
            {'.','9','8','.','.','.','.','6','.'},
            {'8','.','.','.','6','.','.','.','3'},
            {'4','.','.','8','.','3','.','.','1'},
            {'7','.','.','.','2','.','.','.','6'},
            {'.','6','.','.','.','.','2','8','.'},
            {'.','.','.','4','1','9','.','.','5'},
            {'.','.','.','.','8','.','.','7','9'}
        };
        
        System.out.println("Before:");
        solver.printBoard(board);
        
        solver.solveSudoku(board);
        
        System.out.println("\nAfter:");
        solver.printBoard(board);
    }
}
```

**JavaScript:**
```javascript
function solveSudoku(board) {
    solve(board);
}

function solve(board) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === '.') {
                for (let num = 1; num <= 9; num++) {
                    const char = String(num);
                    if (isValid(board, row, col, char)) {
                        board[row][col] = char;
                        
                        if (solve(board)) {
                            return true;
                        }
                        
                        board[row][col] = '.';  // Backtrack
                    }
                }
                return false;  // No valid digit works
            }
        }
    }
    return true;  // All cells filled
}

function isValid(board, row, col, num) {
    // Check row
    for (let c = 0; c < 9; c++) {
        if (board[row][c] === num) return false;
    }
    
    // Check column
    for (let r = 0; r < 9; r++) {
        if (board[r][col] === num) return false;
    }
    
    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = boxRow; r < boxRow + 3; r++) {
        for (let c = boxCol; c < boxCol + 3; c++) {
            if (board[r][c] === num) return false;
        }
    }
    
    return true;
}

function printBoard(board) {
    for (let i = 0; i < 9; i++) {
        if (i % 3 === 0 && i !== 0) {
            console.log('------+-------+------');
        }
        let row = '';
        for (let j = 0; j < 9; j++) {
            if (j % 3 === 0 && j !== 0) {
                row += '| ';
            }
            row += board[i][j] + ' ';
        }
        console.log(row);
    }
}

// Test
const board = [
    ['5','3','.','.','7','.','.','.','.'],
    ['6','.','.','1','9','5','.','.','.'],
    ['.','9','8','.','.','.','.','6','.'],
    ['8','.','.','.','6','.','.','.','3'],
    ['4','.','.','8','.','3','.','.','1'],
    ['7','.','.','.','2','.','.','.','6'],
    ['.','6','.','.','.','.','2','8','.'],
    ['.','.','.','4','1','9','.','.','5'],
    ['.','.','.','.','8','.','.','7','9']
];

console.log('Before:');
printBoard(board);

solveSudoku(board);

console.log('\nAfter:');
printBoard(board);
```

---

## 8. String Partitioning

**When to use:** Split a string into parts satisfying some condition.

**Optimization:** Precompute validity (e.g., isPalindrome table).

**Problems:**
- Palindrome Partitioning (LC 131)
- Restore IP Addresses (LC 93)
- Word Break II (LC 140) - Memoization helps
- Expression Add Operators (LC 282)

### Complete Runnable Code: Palindrome Partitioning

**Go:**
```go
package main

import "fmt"

func partition(s string) [][]string {
    result := [][]string{}
    path := []string{}
    
    var backtrack func(start int)
    backtrack = func(start int) {
        if start == len(s) {
            temp := make([]string, len(path))
            copy(temp, path)
            result = append(result, temp)
            return
        }
        
        for end := start; end < len(s); end++ {
            substring := s[start : end+1]
            if isPalindrome(substring) {
                path = append(path, substring)
                backtrack(end + 1)
                path = path[:len(path)-1]
            }
        }
    }
    
    backtrack(0)
    return result
}

func isPalindrome(s string) bool {
    left, right := 0, len(s)-1
    for left < right {
        if s[left] != s[right] {
            return false
        }
        left++
        right--
    }
    return true
}

func main() {
    tests := []string{"aab", "a", "racecar"}
    for _, s := range tests {
        result := partition(s)
        fmt.Printf("Input: \"%s\"\n", s)
        fmt.Printf("Output: %v\n\n", result)
    }
    // Output:
    // Input: "aab"
    // Output: [[a a b] [aa b]]
    // Input: "a"
    // Output: [[a]]
    // Input: "racecar"
    // Output: [[r a c e c a r] [r a cec a r] [r aceca r] [racecar]]
}
```

**Java:**
```java
import java.util.*;

public class PalindromePartitioning {
    public List<List<String>> partition(String s) {
        List<List<String>> result = new ArrayList<>();
        backtrack(s, 0, new ArrayList<>(), result);
        return result;
    }
    
    private void backtrack(String s, int start, List<String> path,
                           List<List<String>> result) {
        if (start == s.length()) {
            result.add(new ArrayList<>(path));
            return;
        }
        
        for (int end = start; end < s.length(); end++) {
            String substring = s.substring(start, end + 1);
            if (isPalindrome(substring)) {
                path.add(substring);
                backtrack(s, end + 1, path, result);
                path.remove(path.size() - 1);
            }
        }
    }
    
    private boolean isPalindrome(String s) {
        int left = 0, right = s.length() - 1;
        while (left < right) {
            if (s.charAt(left++) != s.charAt(right--)) {
                return false;
            }
        }
        return true;
    }
    
    public static void main(String[] args) {
        PalindromePartitioning solution = new PalindromePartitioning();
        String[] tests = {"aab", "a", "racecar"};
        
        for (String s : tests) {
            List<List<String>> result = solution.partition(s);
            System.out.printf("Input: \"%s\"%n", s);
            System.out.println("Output: " + result);
            System.out.println();
        }
        // Output:
        // Input: "aab"
        // Output: [[a, a, b], [aa, b]]
        // Input: "a"
        // Output: [[a]]
        // Input: "racecar"
        // Output: [[r, a, c, e, c, a, r], [r, a, cec, a, r], [r, aceca, r], [racecar]]
    }
}
```

**JavaScript:**
```javascript
function partition(s) {
    const result = [];
    const path = [];
    
    function isPalindrome(str) {
        let left = 0, right = str.length - 1;
        while (left < right) {
            if (str[left++] !== str[right--]) return false;
        }
        return true;
    }
    
    function backtrack(start) {
        if (start === s.length) {
            result.push([...path]);
            return;
        }
        
        for (let end = start; end < s.length; end++) {
            const substring = s.slice(start, end + 1);
            if (isPalindrome(substring)) {
                path.push(substring);
                backtrack(end + 1);
                path.pop();
            }
        }
    }
    
    backtrack(0);
    return result;
}

// Test
const tests = ["aab", "a", "racecar"];
for (const s of tests) {
    const result = partition(s);
    console.log(`Input: "${s}"`);
    console.log("Output:", JSON.stringify(result));
    console.log();
}
// Output:
// Input: "aab"
// Output: [["a","a","b"],["aa","b"]]
// Input: "a"
// Output: [["a"]]
// Input: "racecar"
// Output: [["r","a","c","e","c","a","r"],["r","a","cec","a","r"],["r","aceca","r"],["racecar"]]
```

### Complete Runnable Code: Restore IP Addresses

**Go:**
```go
package main

import (
    "fmt"
    "strconv"
    "strings"
)

func restoreIpAddresses(s string) []string {
    result := []string{}
    segments := []string{}
    
    var backtrack func(start int)
    backtrack = func(start int) {
        // Goal: 4 segments using all characters
        if len(segments) == 4 {
            if start == len(s) {
                result = append(result, strings.Join(segments, "."))
            }
            return
        }
        
        // Pruning: check remaining characters
        remaining := len(s) - start
        segmentsNeeded := 4 - len(segments)
        if remaining < segmentsNeeded || remaining > segmentsNeeded*3 {
            return
        }
        
        // Try segments of length 1, 2, or 3
        for length := 1; length <= 3 && start+length <= len(s); length++ {
            segment := s[start : start+length]
            if isValidSegment(segment) {
                segments = append(segments, segment)
                backtrack(start + length)
                segments = segments[:len(segments)-1]
            }
        }
    }
    
    backtrack(0)
    return result
}

func isValidSegment(segment string) bool {
    // No leading zeros (except "0" itself)
    if len(segment) > 1 && segment[0] == '0' {
        return false
    }
    // Range check: 0-255
    num, _ := strconv.Atoi(segment)
    return num >= 0 && num <= 255
}

func main() {
    tests := []string{"25525511135", "0000", "101023"}
    for _, s := range tests {
        result := restoreIpAddresses(s)
        fmt.Printf("Input: \"%s\"\n", s)
        fmt.Printf("Output: %v\n\n", result)
    }
    // Output:
    // Input: "25525511135"
    // Output: [255.255.11.135 255.255.111.35]
    // Input: "0000"
    // Output: [0.0.0.0]
    // Input: "101023"
    // Output: [1.0.10.23 1.0.102.3 10.1.0.23 10.10.2.3 101.0.2.3]
}
```

**Java:**
```java
import java.util.*;

public class RestoreIPAddresses {
    public List<String> restoreIpAddresses(String s) {
        List<String> result = new ArrayList<>();
        backtrack(s, 0, new ArrayList<>(), result);
        return result;
    }
    
    private void backtrack(String s, int start, List<String> segments,
                           List<String> result) {
        // Goal: 4 segments using all characters
        if (segments.size() == 4) {
            if (start == s.length()) {
                result.add(String.join(".", segments));
            }
            return;
        }
        
        // Pruning
        int remaining = s.length() - start;
        int segmentsNeeded = 4 - segments.size();
        if (remaining < segmentsNeeded || remaining > segmentsNeeded * 3) {
            return;
        }
        
        // Try segments of length 1, 2, or 3
        for (int len = 1; len <= 3 && start + len <= s.length(); len++) {
            String segment = s.substring(start, start + len);
            if (isValidSegment(segment)) {
                segments.add(segment);
                backtrack(s, start + len, segments, result);
                segments.remove(segments.size() - 1);
            }
        }
    }
    
    private boolean isValidSegment(String segment) {
        // No leading zeros (except "0" itself)
        if (segment.length() > 1 && segment.charAt(0) == '0') {
            return false;
        }
        // Range check: 0-255
        int num = Integer.parseInt(segment);
        return num >= 0 && num <= 255;
    }
    
    public static void main(String[] args) {
        RestoreIPAddresses solution = new RestoreIPAddresses();
        String[] tests = {"25525511135", "0000", "101023"};
        
        for (String s : tests) {
            List<String> result = solution.restoreIpAddresses(s);
            System.out.printf("Input: \"%s\"%n", s);
            System.out.println("Output: " + result);
            System.out.println();
        }
        // Output:
        // Input: "25525511135"
        // Output: [255.255.11.135, 255.255.111.35]
        // Input: "0000"
        // Output: [0.0.0.0]
        // Input: "101023"
        // Output: [1.0.10.23, 1.0.102.3, 10.1.0.23, 10.10.2.3, 101.0.2.3]
    }
}
```

**JavaScript:**
```javascript
function restoreIpAddresses(s) {
    const result = [];
    const segments = [];
    
    function isValidSegment(segment) {
        // No leading zeros (except "0" itself)
        if (segment.length > 1 && segment[0] === '0') return false;
        // Range check: 0-255
        const num = parseInt(segment);
        return num >= 0 && num <= 255;
    }
    
    function backtrack(start) {
        // Goal: 4 segments using all characters
        if (segments.length === 4) {
            if (start === s.length) {
                result.push(segments.join('.'));
            }
            return;
        }
        
        // Pruning
        const remaining = s.length - start;
        const segmentsNeeded = 4 - segments.length;
        if (remaining < segmentsNeeded || remaining > segmentsNeeded * 3) {
            return;
        }
        
        // Try segments of length 1, 2, or 3
        for (let len = 1; len <= 3 && start + len <= s.length; len++) {
            const segment = s.slice(start, start + len);
            if (isValidSegment(segment)) {
                segments.push(segment);
                backtrack(start + len);
                segments.pop();
            }
        }
    }
    
    backtrack(0);
    return result;
}

// Test
const tests = ["25525511135", "0000", "101023"];
for (const s of tests) {
    const result = restoreIpAddresses(s);
    console.log(`Input: "${s}"`);
    console.log("Output:", result);
    console.log();
}
// Output:
// Input: "25525511135"
// Output: ["255.255.11.135", "255.255.111.35"]
// Input: "0000"
// Output: ["0.0.0.0"]
// Input: "101023"
// Output: ["1.0.10.23", "1.0.102.3", "10.1.0.23", "10.10.2.3", "101.0.2.3"]
```

---

## 9. Generate Parentheses

**When to use:** Generate all valid combinations of n pairs of parentheses.

**Key insight:** Track open and close count. Can add `(` if open < n. Can add `)` if close < open.

**Problems:**
- Generate Parentheses (LC 22)
- Valid Parenthesis String (LC 678)
- Remove Invalid Parentheses (LC 301)

### Complete Runnable Code

**Go:**
```go
package main

import "fmt"

func generateParenthesis(n int) []string {
    result := []string{}
    
    var backtrack func(current string, open, close int)
    backtrack = func(current string, open, close int) {
        if len(current) == 2*n {
            result = append(result, current)
            return
        }
        
        // Can add '(' if we haven't used all
        if open < n {
            backtrack(current+"(", open+1, close)
        }
        
        // Can add ')' only if it won't exceed open count
        if close < open {
            backtrack(current+")", open, close+1)
        }
    }
    
    backtrack("", 0, 0)
    return result
}

func main() {
    for n := 1; n <= 3; n++ {
        result := generateParenthesis(n)
        fmt.Printf("n=%d: %v (count: %d)\n", n, result, len(result))
    }
    // Output:
    // n=1: [()] (count: 1)
    // n=2: [(()) ()()] (count: 2)
    // n=3: [((()))(()())(())()(())()())] (count: 5)
}
```

**Java:**
```java
import java.util.*;

public class GenerateParentheses {
    public List<String> generateParenthesis(int n) {
        List<String> result = new ArrayList<>();
        backtrack(result, "", 0, 0, n);
        return result;
    }
    
    private void backtrack(List<String> result, String current, 
                           int open, int close, int n) {
        if (current.length() == 2 * n) {
            result.add(current);
            return;
        }
        
        // Can add '(' if we haven't used all
        if (open < n) {
            backtrack(result, current + "(", open + 1, close, n);
        }
        
        // Can add ')' only if it won't exceed open count
        if (close < open) {
            backtrack(result, current + ")", open, close + 1, n);
        }
    }
    
    public static void main(String[] args) {
        GenerateParentheses solution = new GenerateParentheses();
        for (int n = 1; n <= 3; n++) {
            List<String> result = solution.generateParenthesis(n);
            System.out.printf("n=%d: %s (count: %d)%n", n, result, result.size());
        }
        // Output:
        // n=1: [()] (count: 1)
        // n=2: [(()), ()()] (count: 2)
        // n=3: [((())), (()()), (())(), ()(()), ()()()] (count: 5)
    }
}
```

**JavaScript:**
```javascript
function generateParenthesis(n) {
    const result = [];
    
    function backtrack(current, open, close) {
        if (current.length === 2 * n) {
            result.push(current);
            return;
        }
        
        // Can add '(' if we haven't used all
        if (open < n) {
            backtrack(current + '(', open + 1, close);
        }
        
        // Can add ')' only if it won't exceed open count
        if (close < open) {
            backtrack(current + ')', open, close + 1);
        }
    }
    
    backtrack('', 0, 0);
    return result;
}

// Test
for (let n = 1; n <= 3; n++) {
    const result = generateParenthesis(n);
    console.log(`n=${n}: [${result.join(', ')}] (count: ${result.length})`);
}
// Output:
// n=1: [()] (count: 1)
// n=2: [(()), ()()] (count: 2)
// n=3: [((())), (()()), (())(), ()(()), ()()()] (count: 5)
```

---

## 10. Letter Combinations of Phone Number

**When to use:** Generate all possible letter combinations from phone digits.

**Key insight:** Each digit maps to 3-4 letters. Explore all combinations.

**Problems:**
- Letter Combinations of a Phone Number (LC 17)

### Complete Runnable Code

**Go:**
```go
package main

import "fmt"

func letterCombinations(digits string) []string {
    if len(digits) == 0 {
        return []string{}
    }
    
    mapping := map[byte]string{
        '2': "abc", '3': "def", '4': "ghi", '5': "jkl",
        '6': "mno", '7': "pqrs", '8': "tuv", '9': "wxyz",
    }
    
    result := []string{}
    
    var backtrack func(index int, current string)
    backtrack = func(index int, current string) {
        if index == len(digits) {
            result = append(result, current)
            return
        }
        
        letters := mapping[digits[index]]
        for i := 0; i < len(letters); i++ {
            backtrack(index+1, current+string(letters[i]))
        }
    }
    
    backtrack(0, "")
    return result
}

func main() {
    tests := []string{"23", "2", ""}
    for _, digits := range tests {
        result := letterCombinations(digits)
        fmt.Printf("Input: \"%s\"\n", digits)
        fmt.Printf("Output: %v (count: %d)\n\n", result, len(result))
    }
    // Output:
    // Input: "23"
    // Output: [ad ae af bd be bf cd ce cf] (count: 9)
    // Input: "2"
    // Output: [a b c] (count: 3)
    // Input: ""
    // Output: [] (count: 0)
}
```

**Java:**
```java
import java.util.*;

public class LetterCombinations {
    private static final Map<Character, String> MAPPING = Map.of(
        '2', "abc", '3', "def", '4', "ghi", '5', "jkl",
        '6', "mno", '7', "pqrs", '8', "tuv", '9', "wxyz"
    );
    
    public List<String> letterCombinations(String digits) {
        List<String> result = new ArrayList<>();
        if (digits == null || digits.isEmpty()) {
            return result;
        }
        backtrack(digits, 0, new StringBuilder(), result);
        return result;
    }
    
    private void backtrack(String digits, int index, StringBuilder current,
                           List<String> result) {
        if (index == digits.length()) {
            result.add(current.toString());
            return;
        }
        
        String letters = MAPPING.get(digits.charAt(index));
        for (char letter : letters.toCharArray()) {
            current.append(letter);
            backtrack(digits, index + 1, current, result);
            current.deleteCharAt(current.length() - 1);
        }
    }
    
    public static void main(String[] args) {
        LetterCombinations solution = new LetterCombinations();
        String[] tests = {"23", "2", ""};
        
        for (String digits : tests) {
            List<String> result = solution.letterCombinations(digits);
            System.out.printf("Input: \"%s\"%n", digits);
            System.out.printf("Output: %s (count: %d)%n%n", result, result.size());
        }
        // Output:
        // Input: "23"
        // Output: [ad, ae, af, bd, be, bf, cd, ce, cf] (count: 9)
        // Input: "2"
        // Output: [a, b, c] (count: 3)
        // Input: ""
        // Output: [] (count: 0)
    }
}
```

**JavaScript:**
```javascript
function letterCombinations(digits) {
    if (!digits || digits.length === 0) {
        return [];
    }
    
    const mapping = {
        '2': 'abc', '3': 'def', '4': 'ghi', '5': 'jkl',
        '6': 'mno', '7': 'pqrs', '8': 'tuv', '9': 'wxyz'
    };
    
    const result = [];
    
    function backtrack(index, current) {
        if (index === digits.length) {
            result.push(current);
            return;
        }
        
        const letters = mapping[digits[index]];
        for (const letter of letters) {
            backtrack(index + 1, current + letter);
        }
    }
    
    backtrack(0, '');
    return result;
}

// Test
const tests = ["23", "2", ""];
for (const digits of tests) {
    const result = letterCombinations(digits);
    console.log(`Input: "${digits}"`);
    console.log(`Output: [${result.join(', ')}] (count: ${result.length})\n`);
}
// Output:
// Input: "23"
// Output: [ad, ae, af, bd, be, bf, cd, ce, cf] (count: 9)
// Input: "2"
// Output: [a, b, c] (count: 3)
// Input: ""
// Output: [] (count: 0)
```

---

# Pruning Techniques (Critical for Efficiency)

Pruning is the art of cutting branches that cannot lead to valid solutions.

## Types of Pruning

### 1. Feasibility Pruning
Stop if current state cannot reach a valid solution.

```
// Combination Sum: remaining < 0
if remaining < 0: return

// Combinations: not enough elements left
if remaining_elements < elements_needed: return
```

### 2. Duplicate Pruning
Skip paths that would produce duplicate results.

```
// After sorting
if i > start AND nums[i] == nums[i-1]: continue
```

### 3. Constraint Pruning
Skip choices that violate constraints immediately.

```
// N-Queens: skip if column/diagonal attacked
if col in cols OR (row-col) in diag1: continue
```

### 4. Bound Pruning (Branch and Bound)
Skip paths that cannot beat current best.

```
// Find minimum: current_cost already >= best_cost
if current_cost >= best_cost: return
```

### 5. Symmetry Pruning
Skip symmetric configurations.

```
// First queen in first row can only be in first half
// Other half is mirror image
if row == 0 AND col > n/2: break
```

## Pruning Impact

| Problem | Without Pruning | With Pruning |
|---------|-----------------|--------------|
| N-Queens (n=12) | TLE | ~0.1s |
| Sudoku | TLE | <1s |
| Combination Sum | Acceptable | Much faster |

---

# Complexity Analysis

## Deriving Backtracking Complexity

### Subsets (Power Set)
**Claim:** O(n * 2^n)

**Why:**
1. Each element has 2 choices (include/exclude)
2. Total subsets = 2 * 2 * 2 * ... * 2 = 2^n
3. Each subset takes O(n) to copy
4. Total: O(n * 2^n)

### Permutations
**Claim:** O(n * n!)

**Why:**
1. First position: n choices
2. Second position: n-1 choices
3. ...
4. Total arrangements = n * (n-1) * ... * 1 = n!
5. Each permutation takes O(n) to copy
6. Total: O(n * n!)

### Combinations C(n,k)
**Claim:** O(k * C(n,k))

**Why:**
1. Number of ways to choose k from n = C(n,k) = n! / (k! * (n-k)!)
2. Each combination takes O(k) to copy
3. Total: O(k * C(n,k))

### Grid Search (Word Search)
**Claim:** O(m * n * 4^L) where L = word length

**Why:**
1. Start from each of m*n cells
2. At each step, 4 directions to explore
3. Maximum depth = L (word length)
4. Without visited tracking: 4^L paths from each cell
5. Total: O(m * n * 4^L)

**With pruning:** Much better in practice due to mismatches and visited cells.

---

# Edge Case Checklist

## Universal Backtracking Edge Cases

- [ ] **Empty input**: `nums = []`, `s = ""`
- [ ] **Single element**: `[5]`, `"a"`
- [ ] **All same elements**: `[1, 1, 1, 1]`
- [ ] **Already sorted**: verify algorithm works
- [ ] **Reverse sorted**: verify no issues
- [ ] **All duplicates**: `[2, 2, 2]` subsets/permutations

## Problem-Specific Edge Cases

**Subsets/Combinations:**
- [ ] k = 0 (empty subset)
- [ ] k = n (full array)
- [ ] k > n (no valid combinations)

**Permutations:**
- [ ] n = 1 (single permutation)
- [ ] All duplicates (only one unique permutation)

**Combination Sum:**
- [ ] target = 0 (empty combination valid?)
- [ ] No valid combination (return [])
- [ ] Single element equals target
- [ ] Negative numbers in candidates

**Grid Backtracking:**
- [ ] 1x1 grid
- [ ] Word longer than grid cells
- [ ] Word not in grid
- [ ] Word requires revisiting (invalid)

**N-Queens:**
- [ ] n = 1 (trivial)
- [ ] n = 2 or n = 3 (no solution)
- [ ] n = 4 (first non-trivial with solutions)

---

# Backtracking vs DP vs Greedy

## When to Choose Which

| Aspect | Backtracking | DP | Greedy |
|--------|--------------|-----|--------|
| Goal | Generate ALL solutions | COUNT or find ONE optimal | Find ONE optimal (fast) |
| Output size | Exponential (2^n, n!) | Single value or O(n) | Single value |
| Subproblems | Independent exploration | Overlapping (reuse) | No backtracking |
| Time | Exponential | Polynomial | Usually O(n) or O(n log n) |
| n range | n <= 15-20 | n <= 1000+ | n <= 10^6+ |

## Decision Framework

```
Does the problem ask for ALL solutions?
├── Yes → Backtracking
└── No → Does it ask for COUNT or ONE optimal?
         ├── Yes → Are there overlapping subproblems?
         │         ├── Yes → DP
         │         └── No → Could be Backtracking or Greedy
         └── Just checking feasibility?
                   └── Depends on constraints
                       ├── n <= 20 → Backtracking OK
                       └── n > 20 → Need DP/Greedy
```

## Example Problems by Technique

| Problem | Technique | Reason |
|---------|-----------|--------|
| Generate all subsets | Backtracking | Need ALL 2^n subsets |
| Count subsets summing to k | DP | Only need COUNT, overlapping subproblems |
| Can partition into 2 equal sums | DP | Feasibility with overlap |
| Maximum profit (items once) | DP (0/1 Knapsack) | Optimal value |
| Activity selection | Greedy | Greedy choice property |
| N-Queens all solutions | Backtracking | Need ALL configurations |
| Can place N queens | Backtracking | Small n, constraint satisfaction |

---

# Follow-up Questions

## Subsets/Combinations Follow-ups

| Original | Follow-up | Approach |
|----------|-----------|----------|
| Generate all subsets | "What if input has duplicates?" | Sort + skip duplicates |
| Combinations C(n,k) | "What if we need combinations summing to target?" | Add remaining parameter |
| Subsets | "What if order matters?" | Switch to permutation template |
| Subsets | "Generate iteratively (no recursion)?" | BFS/bit manipulation |

## Permutations Follow-ups

| Original | Follow-up | Approach |
|----------|-----------|----------|
| All permutations | "What about duplicates?" | Sort + !used[i-1] check |
| Permutations | "Find the kth permutation?" | Mathematical calculation |
| Permutations | "Generate next permutation in place?" | Next permutation algorithm |
| Permutations | "Count permutations (don't generate)?" | Just compute n! |

## Grid Search Follow-ups

| Original | Follow-up | Approach |
|----------|-----------|----------|
| Word Search | "Search for multiple words?" | Use Trie + backtracking |
| Word Search | "Find longest word in grid?" | Trie with all words |
| Word Search | "Words can overlap in grid?" | Track used per word |

## N-Queens Follow-ups

| Original | Follow-up | Approach |
|----------|-----------|----------|
| Find all solutions | "Just count solutions?" | Remove board tracking |
| N-Queens | "What about N-Rooks?" | Only check columns |
| N-Queens | "Place k queens (k < n)?" | Stop at k placements |
| N-Queens | "Some positions blocked?" | Add initial check |

---

# Interview Communication

## The UMPIRE Method for Backtracking

### Understand
> "Let me make sure I understand. We need to generate [all subsets / all permutations / all valid X] from [input]. Are there duplicates in the input? Should the output contain duplicates?"

### Match
> "This is a backtracking problem because we need to generate ALL possible [configurations/combinations/arrangements]. I'll use the [subsets/permutations/combinations] template."

### Plan
**For Subsets:**
> "I'll iterate through elements, at each position deciding to include or exclude it. I'll use a start index to avoid duplicate subsets like [1,2] and [2,1]. Every partial result is a valid subset."

**For Permutations:**
> "I'll use a used array to track which elements are in my current path. I iterate from index 0 each time and skip used elements. I add to result when path length equals n."

**For Combinations:**
> "Similar to subsets, but I only add to result when path length equals k. I'll prune by checking if enough elements remain."

**For Grid Search:**
> "I'll start DFS from each cell, exploring 4 directions. I mark cells visited by modifying the grid, and restore them when backtracking."

### Implement
Write clean, commented code. Emphasize the three phases: Choose, Explore, Unchoose.

### Review
> "Let me trace through [example input]. Starting with empty path..."
> [Walk through the decision tree]

### Evaluate
> "Time: O([complexity]) because [reason]. Space: O([n]) for recursion depth plus O([output size]) for storing results."

## Communication Templates

### Subsets Script
```
"I'll use backtracking to generate all subsets.

At each element, I have two choices: include it or skip it.
I use a start index to ensure we don't revisit earlier elements,
which prevents duplicates like [1,2] and [2,1].

Every partial path is a valid subset, so I add to result at every step.

For [1,2,3]:
- Start with [], add to result
- Include 1: [1], add, then explore [1,2], [1,2,3], [1,3]
- Skip 1, include 2: [2], then [2,3]
- Skip 1,2, include 3: [3]

Time: O(n * 2^n), Space: O(n)"
```

### Permutations Script
```
"I'll use backtracking with a used array.

Unlike subsets, order matters here, so I need to consider all elements
at each position, not just elements after a start index.

I maintain a used[] array to track what's already in my path.
I add to result only when path.length equals nums.length.

For [1,2,3]:
- Position 0: try 1, 2, or 3
- Position 1: try remaining unused elements
- Position 2: only one element left

Time: O(n * n!), Space: O(n)"
```

### Combination Sum Script
```
"I'll use backtracking with a remaining sum parameter.

At each candidate, I can either:
1. Use it (subtract from remaining, stay at same index to allow reuse)
2. Skip it (move to next index)

I prune when remaining < 0.
I add to result when remaining == 0.

For candidates=[2,3,6,7], target=7:
- Try 2: remaining=5, try 2 again: remaining=3, ...
- Eventually find [2,2,3] and [7]

Time: O(n^(target/min)), Space: O(target/min)"
```

---

# Checkpoint Questions

## After "Subsets Template"

> **Quick Check:** Why do we use `start` index in subsets but `used[]` array in permutations?
>
> <details>
> <summary>Think first, then click</summary>
>
> **Subsets:** Order doesn't matter. `[1,2]` and `[2,1]` are the same subset.
> Using `start` ensures we only consider elements AFTER the current position,
> preventing us from going "backwards" and creating duplicates.
>
> **Permutations:** Order matters. `[1,2]` and `[2,1]` are different.
> We need to consider ALL elements at each position, so we iterate from 0.
> But we can't reuse elements in the same permutation, so we track with `used[]`.
> </details>

## After "Handling Duplicates"

> **Quick Check:** Input is `[1,2,2]`. Why does `i > start && nums[i] == nums[i-1]` prevent duplicates?
>
> <details>
> <summary>Think first, then click</summary>
>
> Consider generating subsets at start=0:
> - i=0: take first element (1), valid
> - i=1: take first 2, valid (produces subsets like [2], [1,2])
> - i=2: take second 2, but nums[2] == nums[1] and i > start
>   This would produce the SAME subsets as i=1, so we SKIP
>
> The first occurrence at each level is OK. Subsequent identical values
> at the same level would create duplicates, so we skip them.
> </details>

## After "Grid Backtracking"

> **Quick Check:** Why do we modify the grid (`grid[i][j] = '#'`) instead of using a separate visited array?
>
> <details>
> <summary>Think first, then click</summary>
>
> Both approaches work, but modifying the grid:
> 1. Saves O(m*n) space for the visited array
> 2. Is slightly faster (no hash lookups)
> 3. Works because we restore the cell after backtracking
>
> The key is ALWAYS restoring: `grid[i][j] = temp` after the recursive calls.
> If you forget this, the grid gets corrupted for other paths!
> </details>

## After "N-Queens Diagonal Check"

> **Quick Check:** Why does `row - col` identify a main diagonal and `row + col` identify an anti-diagonal?
>
> <details>
> <summary>Think first, then click</summary>
>
> On a main diagonal (top-left to bottom-right):
> ```
> (0,0) -> 0-0 = 0
> (1,1) -> 1-1 = 0
> (2,2) -> 2-2 = 0
> ```
> Same value! Moving diagonally, row and col increase equally, so difference is constant.
>
> On an anti-diagonal (top-right to bottom-left):
> ```
> (0,2) -> 0+2 = 2
> (1,1) -> 1+1 = 2
> (2,0) -> 2+0 = 2
> ```
> Same value! Moving down-left, row increases while col decreases, so sum is constant.
> </details>

---

# Dry-Run Trace Tables

## Subsets Trace

Input: `[1, 2, 3]`

| Step | start | path | Action | Result |
|------|-------|------|--------|--------|
| 1 | 0 | [] | Add [] to result | [[], ...] |
| 2 | 0 | [] | i=0, add 1 | path=[1] |
| 3 | 1 | [1] | Add [1] to result | [..., [1], ...] |
| 4 | 1 | [1] | i=1, add 2 | path=[1,2] |
| 5 | 2 | [1,2] | Add [1,2] to result | |
| 6 | 2 | [1,2] | i=2, add 3 | path=[1,2,3] |
| 7 | 3 | [1,2,3] | Add [1,2,3] to result | |
| 8 | - | [1,2,3] | Backtrack, pop 3 | path=[1,2] |
| 9 | - | [1,2] | Backtrack, pop 2 | path=[1] |
| 10 | 2 | [1] | i=2, add 3 | path=[1,3] |
| 11 | 3 | [1,3] | Add [1,3] to result | |
| ... | ... | ... | Continue pattern | |

**Final Result:** `[[], [1], [1,2], [1,2,3], [1,3], [2], [2,3], [3]]`

## Permutations Trace

Input: `[1, 2]`

| Step | path | used | Action | Result |
|------|------|------|--------|--------|
| 1 | [] | [F,F] | Start backtrack | |
| 2 | [] | [F,F] | i=0, use 1 | path=[1], used=[T,F] |
| 3 | [1] | [T,F] | i=0, skip (used) | |
| 4 | [1] | [T,F] | i=1, use 2 | path=[1,2], used=[T,T] |
| 5 | [1,2] | [T,T] | len=n, add [1,2] | [[1,2], ...] |
| 6 | [1,2] | [T,T] | Backtrack | path=[1], used=[T,F] |
| 7 | [1] | [T,F] | Backtrack | path=[], used=[F,F] |
| 8 | [] | [F,F] | i=1, use 2 | path=[2], used=[F,T] |
| 9 | [2] | [F,T] | i=0, use 1 | path=[2,1], used=[T,T] |
| 10 | [2,1] | [T,T] | len=n, add [2,1] | [[1,2], [2,1]] |

**Final Result:** `[[1,2], [2,1]]`

---

# Common Mistakes and How to Fix Them

## 1. Forgetting to Backtrack

**Bug:**
```javascript
path.push(nums[i]);
backtrack(i + 1, path);
// Missing: path.pop();
```

**Symptom:** Results contain elements from previous branches.

**Fix:** Always pair push with pop in the finally block or right after recursive call.

## 2. Not Copying the Path

**Bug:**
```javascript
if (goal) {
    result.push(path);  // Wrong! Pushes reference
}
```

**Symptom:** All results are empty arrays or identical.

**Fix:** Push a copy: `result.push([...path])` or `new ArrayList<>(path)`

## 3. Wrong Index: `i` vs `i + 1`

**Bug:**
```javascript
// For subsets (should move forward)
backtrack(i, path);  // Causes infinite loop

// For combination sum with reuse (should stay)
backtrack(i + 1, remaining - nums[i], path);  // Doesn't allow reuse
```

**Fix:** 
- Subsets/Combinations (no reuse): use `i + 1`
- Combination Sum (reuse allowed): use `i`

## 4. Duplicate Handling Without Sorting

**Bug:**
```javascript
if (i > start && nums[i] === nums[i-1]) continue;  // Works only if sorted!
```

**Fix:** Always sort first: `nums.sort((a, b) => a - b)`

## 5. Modifying Grid Without Restoring

**Bug:**
```javascript
grid[i][j] = '#';
let found = dfs(i+1, j) || dfs(i-1, j);
// Missing: grid[i][j] = temp;
return found;
```

**Symptom:** Grid gets corrupted, later searches fail.

**Fix:** Always restore in finally or after all recursive calls.

---

# Difficulty Progression

## Easy
1. **Subsets** (LC 78) - Basic template
2. **Letter Combinations of Phone Number** (LC 17) - Simple mapping
3. **Combinations** (LC 77) - Basic with k limit

## Medium
4. **Subsets II** (LC 90) - Handle duplicates
5. **Permutations** (LC 46) - Use used[] array
6. **Permutations II** (LC 47) - Duplicates in permutations
7. **Combination Sum** (LC 39) - With reuse
8. **Combination Sum II** (LC 40) - No reuse, duplicates
9. **Generate Parentheses** (LC 22) - Constraint-based
10. **Palindrome Partitioning** (LC 131) - String partitioning

## Medium-Hard
11. **Word Search** (LC 79) - Grid backtracking
12. **N-Queens** (LC 51) - Constraint satisfaction
13. **Sudoku Solver** (LC 37) - Complex constraints
14. **Restore IP Addresses** (LC 93) - String with validation
15. **Expression Add Operators** (LC 282) - Multiple operations

## Hard
16. **Word Search II** (LC 212) - Trie + backtracking
17. **N-Queens II** (LC 52) - Count only (optimization)
18. **Word Break II** (LC 140) - Memoization + backtracking
19. **Stickers to Spell Word** (LC 691) - State compression

---

# Template Summary

## Universal Backtracking Template

```
function backtrack(state, choices, path, result):
    if isGoal(state):
        result.add(copy(path))
        return
    
    for choice in choices:
        if not isValid(choice, state):
            continue  // Pruning
        
        // Choose
        applyChoice(path, state, choice)
        
        // Explore
        backtrack(newState, newChoices, path, result)
        
        // Unchoose (Backtrack)
        undoChoice(path, state, choice)
```

## Quick Reference

| Pattern | Start Index | Track Used | Add When | Key Difference |
|---------|-------------|------------|----------|----------------|
| Subsets | Yes (start) | No | Every step | Order doesn't matter |
| Permutations | No (from 0) | Yes | path.len == n | Order matters |
| Combinations | Yes (start) | No | path.len == k | Fixed size subset |
| Combination Sum | Yes (start) | No | remaining == 0 | Target sum |
| With duplicates | Sort first | Varies | + skip check | i > start && == |

---

# Visualizer Integration

The following visualizers should be linked:

| Section | Visualizer |
|---------|------------|
| Subsets | `SubsetsVisualizer` |
| Permutations | `PermutationsVisualizer` |
| N-Queens | `NQueensVisualizer` |
| Word Search | `WordSearchVisualizer` |
| Decision Tree | `BacktrackingTreeVisualizer` |

---

# Review Checklist

Before finalizing, verify:

## Content Completeness
- [ ] Section 1 has "What You'll Learn" objectives
- [ ] Input constraint mapping table added
- [ ] All 8 sub-patterns covered with templates
- [ ] Follow-up questions for each problem type
- [ ] Edge case checklist complete
- [ ] Interview UMPIRE scripts for main patterns
- [ ] Checkpoint questions (4+ minimum)

## Visualizations
- [ ] All existing visualizers linked
- [ ] ASCII decision trees for each pattern
- [ ] Dry-run trace tables for key algorithms
- [ ] Complexity derivations with proofs

## Teaching Quality
- [ ] Simple English throughout
- [ ] "Why" explained before "How"
- [ ] Problems ordered by difficulty
- [ ] Common mistakes with fixes
- [ ] Pattern comparison (vs DP, vs Greedy)

## Code Quality
- [ ] Both Java and JavaScript for all code
- [ ] Comments explaining the "why"
- [ ] No unused variables
- [ ] Edge cases handled

## Structure
- [ ] JSON validates
- [ ] Lint passes
- [ ] Test in browser

---

# Implementation Priority

## Phase 1: Critical
1. Add "What You'll Learn" to introduction
2. Add input constraint mapping table
3. Link all existing visualizers
4. Add complexity derivations

## Phase 2: High Value
5. Add checkpoint questions (4+)
6. Add follow-up questions for each pattern
7. Expand edge case checklist
8. Add UMPIRE communication scripts
9. Add comprehensive pruning section

## Phase 3: Polish
10. Formalize dry-run trace tables
11. Add more ASCII decision trees
12. Expand pattern comparison section
13. Order problems by difficulty
14. Add more common mistakes

---

# Final Deliverable

After implementing all improvements:

1. 15+ tutorial sections covering all 8 sub-patterns
2. 4+ checkpoint questions
3. Follow-up questions for each problem type
4. Complete edge case checklist
5. UMPIRE scripts for backtracking
6. Constraint mapping table
7. Formal trace tables
8. Complexity derivations
9. All visualizers linked
10. Comprehensive pruning section

The Backtracking pattern should become the best backtracking learning resource online, enabling anyone to:
- Recognize backtracking problems instantly
- Choose the right template (subsets vs permutations vs combinations)
- Handle duplicates correctly
- Apply effective pruning
- Communicate clearly in interviews
- Solve any FAANG backtracking question

---

# Appendix: All Backtracking Problems by Sub-Pattern

## Subsets Family
- Subsets (LC 78) - Easy
- Subsets II (LC 90) - Medium
- Letter Case Permutation (LC 784) - Medium

## Permutations Family
- Permutations (LC 46) - Medium
- Permutations II (LC 47) - Medium
- Next Permutation (LC 31) - Medium
- Permutation Sequence (LC 60) - Hard

## Combinations Family
- Combinations (LC 77) - Medium
- Combination Sum (LC 39) - Medium
- Combination Sum II (LC 40) - Medium
- Combination Sum III (LC 216) - Medium
- Factor Combinations (LC 254) - Medium

## String Partitioning
- Palindrome Partitioning (LC 131) - Medium
- Restore IP Addresses (LC 93) - Medium
- Word Break II (LC 140) - Hard
- Expression Add Operators (LC 282) - Hard

## Grid Backtracking
- Word Search (LC 79) - Medium
- Word Search II (LC 212) - Hard
- Unique Paths III (LC 980) - Hard
- Robot Room Cleaner (LC 489) - Hard

## Constraint Satisfaction
- N-Queens (LC 51) - Hard
- N-Queens II (LC 52) - Hard
- Sudoku Solver (LC 37) - Hard
- Beautiful Arrangement (LC 526) - Medium

## Parentheses/Brackets
- Generate Parentheses (LC 22) - Medium
- Valid Parenthesis String (LC 678) - Medium
- Remove Invalid Parentheses (LC 301) - Hard

## Miscellaneous
- Letter Combinations of Phone Number (LC 17) - Medium
- Gray Code (LC 89) - Medium
- Additive Number (LC 306) - Medium
- Matchsticks to Square (LC 473) - Medium
- Partition to K Equal Sum Subsets (LC 698) - Medium
