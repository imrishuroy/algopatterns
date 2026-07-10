#!/usr/bin/env python3
"""Update Grid DP (2D Navigation) tutorial in patterns.json."""
import json, copy

CONTENT = r"""## What is Grid DP?

Grid DP solves problems where you navigate an m×n grid from a starting cell to an ending cell, with constrained movement, and need to count paths or optimize some path value.

**Use it when:** movement is restricted (right/down only), the answer at a cell depends on adjacent cells you arrived from, and you need to count paths or minimize/maximize a cost across all paths.

---

## Foundational Concept: 2D Grid State

In 1D DP, one index defines the subproblem: `dp[i]` captures everything needed to answer "what happens at position i."

In Grid DP, **two indices** define the subproblem: `dp[i][j]` captures the answer for cell (row i, column j). The state is a **position in 2D space**, not a position in a sequence.

| Concept | State | Transitions | Example |
|---------|-------|-------------|---------|
| 1D DP | `dp[i]` (one index) | From `i-1`, `i-2`, etc. | Climbing Stairs |
| Grid DP | `dp[i][j]` (row, col) | From `(i-1,j)` above, `(i,j-1)` left | Unique Paths |

**Why two indices?** A cell's identity in a 2D grid needs both row and column. Knowing only the row doesn't tell you which cell you're in.

**Right/Down movement — reachability:**

```
Grid (0-indexed, arrows show valid moves):
  (0,0) → (0,1) → (0,2)
    ↓       ↓       ↓
  (1,0) → (1,1) → (1,2)
    ↓       ↓       ↓
  (2,0) → (2,1) → (2,2)

From (0,0): ALL cells reachable (go right then down in any order)
From (1,1): only (1,2), (2,1), (2,2) reachable
From (2,2): NONE reachable (destination, no valid moves out)
```

**Critical:** Under right/down-only movement, cell `(i,j)` can only be reached from `(i-1,j)` or `(i,j-1)`. No cycles exist. This makes DP correct: you always compute smaller cells before larger ones.

---

## Problem Statement

Given an `m × n` grid, starting at the top-left cell `(0,0)`, moving only **right** or **down** at each step, find the number of distinct paths to the bottom-right cell `(m-1, n-1)`.

**Primary example (used throughout this article):**
```
Input:  m = 3, n = 3
Output: 6
```

**Example 2:**
```
Input:  m = 3, n = 7
Output: 28
```

**Example 3 — 1×1 grid:**
```
Input:  m = 1, n = 1
Output: 1
Explanation: Already at the destination. One path: do nothing.
```

**Edge cases:**
```
m=1, n=5 → 1   (only path: go right 4 times, no choices)
m=5, n=1 → 1   (only path: go down 4 times, no choices)
m=1, n=1 → 1   (start = destination)
Obstacle at start or end → 0
```

---

## The Core Decision/Insight

At each cell `(i, j)`, ask: **where could I have come from?**

- From **above**: cell `(i-1, j)` — you moved down into `(i, j)`
- From **left**: cell `(i, j-1)` — you moved right into `(i, j)`

The number of ways to reach `(i, j)` equals the number of ways to reach `(i-1, j)` PLUS the number of ways to reach `(i, j-1)`:

```
ways(i, j) = ways(i-1, j) + ways(i, j-1)
```

This is similar to Climbing Stairs where `f(n) = f(n-1) + f(n-2)` — combine two prior results. Here the two prior results are **spatial neighbors** (above and left), not just `n-1` and `n-2`.

**All 6 paths through a 3×3 grid** (2 rights + 2 downs, in every ordering):

```
Path 1: R→R→D→D   (0,0)→(0,1)→(0,2)→(1,2)→(2,2)
Path 2: R→D→R→D   (0,0)→(0,1)→(1,1)→(1,2)→(2,2)
Path 3: R→D→D→R   (0,0)→(0,1)→(1,1)→(2,1)→(2,2)
Path 4: D→R→R→D   (0,0)→(1,0)→(1,1)→(1,2)→(2,2)
Path 5: D→R→D→R   (0,0)→(1,0)→(1,1)→(2,1)→(2,2)
Path 6: D→D→R→R   (0,0)→(1,0)→(2,0)→(2,1)→(2,2)

Paths 2, 3, 4, 5 all pass through (1,1) → ways(1,1) = 4 paths visit it.
```

---

## Approach 1: Recursion (Brute Force)

**State definition:** `solve(i, j)` = number of distinct paths from `(0,0)` to cell `(i, j)`.

```
solve(i, j):
    // Base case: at the start cell
    if i == 0 AND j == 0: return 1

    // Out of bounds: no valid path exists here
    if i < 0 OR j < 0: return 0

    // Combine: arrived from above OR from left
    return solve(i - 1, j) + solve(i, j - 1)
```

**Base cases:**
- `solve(0, 0) = 1`: the start cell has exactly one way to reach itself
- `i < 0` or `j < 0`: outside the grid, return 0

**Time:** O(2^(m+n)). From the destination, each call branches into two sub-calls. At each of the `m+n-2` steps you choose one of two predecessors, so the call tree grows exponentially.

**Space:** O(m+n) recursion stack depth (the longest path from destination to origin has `m+n-2` steps).

**Recursion tree for solve(2,2)** — showing overlapping subproblems:

```
                        solve(2,2)
                      /            \
             solve(1,2)            solve(2,1)
            /         \           /         \
       solve(0,2)  solve(1,1)  solve(1,1)  solve(2,0)
       /      \    /      \       ↑
  s(-1,2) s(0,1) s(0,1) s(1,0)  REPEATED!
   [0]    /   \
      s(-1,1) s(0,0)
        [0]    [1]
```

`solve(1,1)` appears under both `solve(1,2)` and `solve(2,1)`. In a larger grid, the same cell `(i,j)` gets recomputed once for every distinct ordering of rights and downs that reaches it — which grows combinatorially.

---

## Approach 2: Memoization (Top-Down DP)

Add a 2D cache keyed by `(row, col)`. Before recursing, check if the answer is already known.

```
memo = 2D array [m][n], initialized to -1

solve(i, j, memo):
    if i == 0 AND j == 0: return 1
    if i < 0 OR j < 0: return 0

    if memo[i][j] != -1: return memo[i][j]   // cache hit

    memo[i][j] = solve(i - 1, j, memo) + solve(i, j - 1, memo)
    return memo[i][j]
```

**Boundary handling:** check `i < 0` or `j < 0` BEFORE accessing `memo[i][j]`. Unlike some 1D patterns that shift indices to handle a "no previous element" sentinel, grid bounds are natural array bounds — out-of-bounds simply returns 0.

**Time:** O(m×n). Each of the m×n cells is computed exactly once; every subsequent call returns the cached value in O(1).

**Space:** O(m×n) for the memo table, plus O(m+n) for the recursion stack.

---

## Approach 3: Tabulation (Bottom-Up DP)

Build the solution iteratively. Fill every cell using already-computed neighbors.

**State definition:**
```
dp[i][j] = number of distinct paths from (0,0) to cell (i,j)
```

This is the same state as memoization. Unlike some DP patterns where tabulation must redefine the state, here the forward definition works directly for bottom-up fill.

**Exception — backward-fill problems:** When the answer at a cell depends on what happens AFTER that cell (e.g., Dungeon Game: "minimum health to survive the remaining path"), you must fill from `(m-1, n-1)` backward to `(0, 0)`, so each cell's requirement can be computed from the already-known requirements of the cells that follow it.

**Base case initialization:**
```
dp[0][0] = 1

// First row: only reachable by moving right from (0,0)
for j from 1 to n-1: dp[0][j] = 1

// First column: only reachable by moving down from (0,0)
for i from 1 to m-1: dp[i][0] = 1
```

**Recurrence:**
```
for i from 1 to m-1:
    for j from 1 to n-1:
        dp[i][j] = dp[i-1][j] + dp[i][j-1]
```

**Fill order:** row-major, top-to-bottom, left-to-right. When computing `dp[i][j]`, both `dp[i-1][j]` (above) and `dp[i][j-1]` (left) are already filled.

**Final answer:**
- Forward problems: `dp[m-1][n-1]`
- Backward-fill problems (Dungeon Game): `dp[0][0]`

**Time:** O(m×n). **Space:** O(m×n), reducible — see next section.

---

## Step-by-Step Walkthrough

**Grid:** 3×3, Unique Paths. Expected answer: 6.

**Step 1 — Initialize first row and column:**
```
dp:
  [ 1,  1,  1 ]
  [ 1,  ?,  ? ]
  [ 1,  ?,  ? ]

dp[0][j] = 1 for all j: top row, only one way in (go right from start)
dp[i][0] = 1 for all i: left column, only one way in (go down from start)
```

**Step 2 — Fill (1,1):**
```
dp[1][1] = dp[0][1] + dp[1][0] = 1 + 1 = 2
(2 paths to (1,1): RD or DR from (0,0))

dp:
  [ 1,  1,  1 ]
  [ 1,  2,  ? ]
  [ 1,  ?,  ? ]
```

**Step 3 — Fill (1,2):**
```
dp[1][2] = dp[0][2] + dp[1][1] = 1 + 2 = 3

dp:
  [ 1,  1,  1 ]
  [ 1,  2,  3 ]
  [ 1,  ?,  ? ]
```

**Step 4 — Fill (2,1):**
```
dp[2][1] = dp[1][1] + dp[2][0] = 2 + 1 = 3

dp:
  [ 1,  1,  1 ]
  [ 1,  2,  3 ]
  [ 1,  3,  ? ]
```

**Step 5 — Fill (2,2):**
```
dp[2][2] = dp[1][2] + dp[2][1] = 3 + 3 = 6

dp:
  [ 1,  1,  1 ]
  [ 1,  2,  3 ]
  [ 1,  3,  6 ]
```

**Answer:** `dp[2][2] = 6`. Every cell's value is the count of distinct paths from `(0,0)` to that cell.

---

## Memoization vs Tabulation

| Aspect | Memoization (Top-Down) | Tabulation (Bottom-Up) |
|--------|------------------------|------------------------|
| State | (row, col) pairs, filled on demand | dp[i][j] table, filled row by row |
| Space | O(m×n) memo + O(m+n) recursion stack | O(m×n), reducible to O(n) with rolling row |
| Direction | Explores from destination back to start lazily | Builds from top-left (or bottom-right for backward problems) |
| Computes | Only cells actually reachable on some recursive path | All m×n cells |
| Easier to write? | Yes — mirrors the recursive insight directly | Simple here since the state definition matches; backward-fill problems need extra care |

---

## Beyond Standard DP: Space Optimization

`dp[i][j]` only depends on `dp[i-1][j]` (directly above) and `dp[i][j-1]` (to the left in the same row). No row older than one step back is ever needed.

**Rolling 1D array:**
```
dp = array of size n, initialized to 1  (base: first row)

for i from 1 to m-1:
    for j from 1 to n-1:
        dp[j] = dp[j] + dp[j-1]
        //       ↑           ↑
        //  dp[j] before update = previous row's value (from above)
        //  dp[j-1] after update = current row's left neighbor
```

Before `dp[j]` is overwritten, it holds the previous row's value — exactly `dp[i-1][j]`. After overwriting, `dp[j-1]` already holds the current row's left neighbor — exactly `dp[i][j-1]`.

**Space:** O(n) instead of O(m×n).

---

## Extending to Variations

**"What if some cells are blocked (obstacles)?"**

Memoization: return 0 immediately when the cell is blocked, before checking neighbors.

Tabulation: set `dp[i][j] = 0` for blocked cells. That zero propagates naturally through the recurrence — any cell reachable only via blocked cells also gets 0. If the start or end cell is blocked, the answer is 0.

**"What if I need min/max path SUM instead of counting paths?"**

Change the combine function from addition to min/max, and add the current cell's value:
```
dp[i][j] = min(dp[i-1][j], dp[i][j-1]) + grid[i][j]
```
Initialize: `dp[0][0] = grid[0][0]`, first row/column with running prefix sums.

**"What if the cost depends on what happens AFTER a cell (e.g., a health/resource constraint)?"**

Fill the table backward from `(m-1, n-1)` to `(0, 0)`. Each cell's required value is computed from the already-known requirements of the cells that follow it. The recurrence flips direction. Answer is at `dp[0][0]`.

**"What if I need to track TWO simultaneous paths through the grid?"**

Extend the state to `(row1, col1, row2, col2)`. Since both paths take the same number of steps simultaneously, `row1 + col1 = row2 + col2 = step` always. Exploit this to reduce state: use `(step, col1, col2)` where `row1 = step - col1` and `row2 = step - col2`.

**Quick Reference:**

| Problem Type | Key Adaptation |
|-------------|----------------|
| Unique Paths | Combine = sum (count ways) |
| Minimum/Maximum Path Sum | Combine = min/max, add grid[i][j] |
| Obstacles | Zero out blocked cells, let zero propagate |
| Dungeon Game | Fill backward from destination to start |
| Cherry Pickup | Track two paths via extended/reduced state |

---

## Debugging Checklist

- [ ] Did you initialize the first row and first column separately, since each only has one direction of arrival?
- [ ] Are you filling the table in the correct order (row-major top-to-bottom, or backward if required) so that dependencies are always computed before use?
- [ ] Are you checking grid boundaries (`i` within `[0, m)` and `j` within `[0, n)`) before accessing neighbors?
- [ ] If obstacles are present, does the zero (unreachable) value propagate correctly to cells that are only reachable through blocked paths?
- [ ] Is your combine function correct: sum for counting paths, min/max for cost optimization?
- [ ] If this is a backward-dependency problem, are you starting the fill from the destination cell, not `(0,0)`?
- [ ] Are you accidentally allowing all four movement directions, which breaks the fill-order invariant by creating cycles?

---

## Common Mistakes

1. **Forgetting separate first-row/column initialization.** The general recurrence `dp[i][j] = dp[i-1][j] + dp[i][j-1]` reads from the row above and the column to the left. For the first row there is no row above; for the first column there is no column to the left. Applying the general formula without handling these borders reads uninitialized or zero values and produces wrong counts.

2. **Wrong fill order.** If you fill column-major (varying row first inside the outer loop) when the recurrence needs row-major, `dp[i][j-1]` may not yet be computed when you read it. Always fill in the order your recurrence demands.

3. **Obstacle zero not propagating correctly.** Zeroing a blocked cell is right, but manually zeroing every cell after a block is wrong — those cells may still be reachable via other routes. Set blocked cells to 0 and let the recurrence handle propagation: unreachable cells become 0 naturally when all their valid predecessors are 0.

4. **Applying forward fill to backward-dependency problems.** For problems like Dungeon Game, the answer at `(i,j)` depends on what health is needed after `(i,j)`, not before. Filling top-left to bottom-right produces wrong values everywhere.

5. **Off-by-one between grid and dp dimensions.** Some implementations add a padding row/column of zeros to simplify boundary handling. If you do this, ensure `dp[i+1][j+1]` corresponds to `grid[i][j]`. Mixing the indexing leads to boundary reads of stale zeros or index-out-of-bounds errors.

6. **Four-direction movement in a naive recursion.** Right/down only means you never recurse toward `(i+1,j)` or `(i,j+1)` from `(i,j)`. Four-direction movement creates cycles (right then left, forever), breaks memoization correctness, and causes infinite recursion.

---

## Practice Problems

**Easy:**
- Unique Paths
- Minimum Path Sum

**Medium:**
- Unique Paths II (with obstacles)
- Triangle
- Maximal Square

**Hard:**
- Dungeon Game
- Cherry Pickup
- Cherry Pickup II"""

TEMPLATE_RECURSION = r"""// Grid DP - Recursion
// solve(i, j) = answer for cell (i,j), measuring from (0,0)
// TIME: O(2^(m+n)), SPACE: O(m+n) recursion depth

// VARIATION 1: Unique Paths (count distinct paths)
public int solve(int i, int j) {
    if (i == 0 && j == 0) return 1;
    if (i < 0 || j < 0) return 0;
    return solve(i - 1, j) + solve(i, j - 1);
}

// VARIATION 2: Minimum Path Sum (add grid cost)
public int solve(int i, int j, int[][] grid) {
    if (i == 0 && j == 0) return grid[0][0];
    if (i < 0 || j < 0) return Integer.MAX_VALUE;
    int fromAbove = solve(i - 1, j, grid);
    int fromLeft  = solve(i, j - 1, grid);
    return Math.min(fromAbove, fromLeft) + grid[i][j];
}

// VARIATION 3: With obstacles (blocked cell returns 0)
public int solve(int i, int j, int[][] grid) {
    if (i < 0 || j < 0) return 0;
    if (grid[i][j] == 1) return 0;   // obstacle
    if (i == 0 && j == 0) return 1;
    return solve(i - 1, j, grid) + solve(i, j - 1, grid);
}"""

TEMPLATE_MEMOIZATION = r"""// Grid DP - Memoization
// memo[i][j] caches the answer for cell (i,j)
// TIME: O(m*n), SPACE: O(m*n) memo + O(m+n) stack

// VARIATION 1: Unique Paths
public int solve(int i, int j, int[][] memo) {
    if (i == 0 && j == 0) return 1;
    if (i < 0 || j < 0) return 0;
    if (memo[i][j] != -1) return memo[i][j];
    memo[i][j] = solve(i - 1, j, memo) + solve(i, j - 1, memo);
    return memo[i][j];
}

// VARIATION 2: Minimum Path Sum
public int solve(int i, int j, int[][] grid, int[][] memo) {
    if (i == 0 && j == 0) return grid[0][0];
    if (i < 0 || j < 0) return Integer.MAX_VALUE;
    if (memo[i][j] != -1) return memo[i][j];
    int fromAbove = solve(i - 1, j, grid, memo);
    int fromLeft  = solve(i, j - 1, grid, memo);
    memo[i][j] = Math.min(fromAbove, fromLeft) + grid[i][j];
    return memo[i][j];
}

// VARIATION 3: With obstacles
public int solve(int i, int j, int[][] grid, int[][] memo) {
    if (i < 0 || j < 0) return 0;
    if (grid[i][j] == 1) return 0;
    if (i == 0 && j == 0) return 1;
    if (memo[i][j] != -1) return memo[i][j];
    memo[i][j] = solve(i - 1, j, grid, memo) + solve(i, j - 1, grid, memo);
    return memo[i][j];
}"""

TEMPLATE_TABULATION = r"""// Grid DP - Tabulation
// dp[i][j] = answer for cell (i,j), filled row-major
// TIME: O(m*n), SPACE: O(m*n)

// VARIATION 1: Unique Paths
public int uniquePaths(int m, int n) {
    int[][] dp = new int[m][n];
    for (int i = 0; i < m; i++) dp[i][0] = 1;
    for (int j = 0; j < n; j++) dp[0][j] = 1;
    for (int i = 1; i < m; i++)
        for (int j = 1; j < n; j++)
            dp[i][j] = dp[i-1][j] + dp[i][j-1];
    return dp[m-1][n-1];
}

// VARIATION 2: Minimum Path Sum
public int minPathSum(int[][] grid) {
    int m = grid.length, n = grid[0].length;
    int[][] dp = new int[m][n];
    dp[0][0] = grid[0][0];
    for (int i = 1; i < m; i++) dp[i][0] = dp[i-1][0] + grid[i][0];
    for (int j = 1; j < n; j++) dp[0][j] = dp[0][j-1] + grid[0][j];
    for (int i = 1; i < m; i++)
        for (int j = 1; j < n; j++)
            dp[i][j] = Math.min(dp[i-1][j], dp[i][j-1]) + grid[i][j];
    return dp[m-1][n-1];
}

// VARIATION 3: Backward fill (Dungeon Game style)
// Fill from (m-1,n-1) backward to (0,0); answer is dp[0][0]
public int backwardFill(int[][] grid) {
    int m = grid.length, n = grid[0].length;
    int[][] dp = new int[m][n];
    dp[m-1][n-1] = Math.max(1 - grid[m-1][n-1], 1);
    for (int i = m-2; i >= 0; i--)
        dp[i][n-1] = Math.max(dp[i+1][n-1] - grid[i][n-1], 1);
    for (int j = n-2; j >= 0; j--)
        dp[m-1][j] = Math.max(dp[m-1][j+1] - grid[m-1][j], 1);
    for (int i = m-2; i >= 0; i--)
        for (int j = n-2; j >= 0; j--)
            dp[i][j] = Math.max(Math.min(dp[i+1][j], dp[i][j+1]) - grid[i][j], 1);
    return dp[0][0];
}"""

TEMPLATE_SPACE_OPTIMIZED = r"""// Grid DP - Space Optimized (Rolling Row)
// dp[j] represents the current row's column j
// Before update: dp[j] = previous row's value (from above)
// dp[j-1] after update = current row's left neighbor
// TIME: O(m*n), SPACE: O(n)

// VARIATION 1: Unique Paths
public int uniquePaths(int m, int n) {
    int[] dp = new int[n];
    Arrays.fill(dp, 1);   // base case: first row all 1s
    for (int i = 1; i < m; i++) {
        for (int j = 1; j < n; j++) {
            dp[j] = dp[j] + dp[j-1];
            //       ↑           ↑
            //  old dp[j] = from above, dp[j-1] = from left (already updated)
        }
    }
    return dp[n-1];
}

// VARIATION 2: Minimum Path Sum
public int minPathSum(int[][] grid) {
    int m = grid.length, n = grid[0].length;
    int[] dp = new int[n];
    dp[0] = grid[0][0];
    for (int j = 1; j < n; j++) dp[j] = dp[j-1] + grid[0][j];
    for (int i = 1; i < m; i++) {
        dp[0] += grid[i][0];
        for (int j = 1; j < n; j++)
            dp[j] = Math.min(dp[j], dp[j-1]) + grid[i][j];
    }
    return dp[n-1];
}"""

APPROACH_RECURSION_JAVA = r"""// Unique Paths - Recursion
// TIME: O(2^(m+n)), SPACE: O(m+n)

public int uniquePaths(int m, int n) {
    return solve(m - 1, n - 1);
}

private int solve(int i, int j) {
    if (i == 0 && j == 0) return 1;
    if (i < 0 || j < 0) return 0;
    return solve(i - 1, j) + solve(i, j - 1);
}"""

APPROACH_MEMOIZATION_JAVA = r"""// Unique Paths - Memoization
// TIME: O(m*n), SPACE: O(m*n)

public int uniquePaths(int m, int n) {
    int[][] memo = new int[m][n];
    for (int[] row : memo) Arrays.fill(row, -1);
    return solve(m - 1, n - 1, memo);
}

private int solve(int i, int j, int[][] memo) {
    if (i == 0 && j == 0) return 1;
    if (i < 0 || j < 0) return 0;
    if (memo[i][j] != -1) return memo[i][j];
    memo[i][j] = solve(i - 1, j, memo) + solve(i, j - 1, memo);
    return memo[i][j];
}"""

APPROACH_TABULATION_JAVA = r"""// Unique Paths - Tabulation
// TIME: O(m*n), SPACE: O(m*n)

public int uniquePaths(int m, int n) {
    int[][] dp = new int[m][n];
    for (int i = 0; i < m; i++) dp[i][0] = 1;
    for (int j = 0; j < n; j++) dp[0][j] = 1;
    for (int i = 1; i < m; i++)
        for (int j = 1; j < n; j++)
            dp[i][j] = dp[i-1][j] + dp[i][j-1];
    return dp[m-1][n-1];
}"""

APPROACH_SPACE_OPTIMIZED_JAVA = r"""// Unique Paths - Space Optimized
// TIME: O(m*n), SPACE: O(n)

public int uniquePaths(int m, int n) {
    int[] dp = new int[n];
    Arrays.fill(dp, 1);
    for (int i = 1; i < m; i++)
        for (int j = 1; j < n; j++)
            dp[j] += dp[j-1];
    return dp[n-1];
}"""

APPROACH_RECURSION_JS = r"""// Unique Paths - Recursion
// TIME: O(2^(m+n)), SPACE: O(m+n)

function uniquePaths(m, n) {
    function solve(i, j) {
        if (i === 0 && j === 0) return 1;
        if (i < 0 || j < 0) return 0;
        return solve(i - 1, j) + solve(i, j - 1);
    }
    return solve(m - 1, n - 1);
}"""

APPROACH_MEMOIZATION_JS = r"""// Unique Paths - Memoization
// TIME: O(m*n), SPACE: O(m*n)

function uniquePaths(m, n) {
    const memo = Array.from({length: m}, () => new Array(n).fill(-1));

    function solve(i, j) {
        if (i === 0 && j === 0) return 1;
        if (i < 0 || j < 0) return 0;
        if (memo[i][j] !== -1) return memo[i][j];
        memo[i][j] = solve(i - 1, j) + solve(i, j - 1);
        return memo[i][j];
    }

    return solve(m - 1, n - 1);
}"""

APPROACH_TABULATION_JS = r"""// Unique Paths - Tabulation
// TIME: O(m*n), SPACE: O(m*n)

function uniquePaths(m, n) {
    const dp = Array.from({length: m}, () => new Array(n).fill(0));
    for (let i = 0; i < m; i++) dp[i][0] = 1;
    for (let j = 0; j < n; j++) dp[0][j] = 1;
    for (let i = 1; i < m; i++)
        for (let j = 1; j < n; j++)
            dp[i][j] = dp[i-1][j] + dp[i][j-1];
    return dp[m-1][n-1];
}"""

APPROACH_SPACE_OPTIMIZED_JS = r"""// Unique Paths - Space Optimized
// TIME: O(m*n), SPACE: O(n)

function uniquePaths(m, n) {
    const dp = new Array(n).fill(1);
    for (let i = 1; i < m; i++)
        for (let j = 1; j < n; j++)
            dp[j] += dp[j-1];
    return dp[n-1];
}"""

def main():
    path = "/Users/rishu.kumar/Developer/imrishuroy/algopatterns/frontend/src/lib/patterns.json"
    with open(path) as f:
        data = json.load(f)

    dp = next(p for p in data if p.get("id") == "dynamic-programming")
    tutorials = dp["tutorial"]
    idx = next(i for i, t in enumerate(tutorials) if t.get("title") == "Grid DP (2D Navigation)")

    tutorials[idx] = {
        "title": "Grid DP (2D Navigation)",
        "content": CONTENT,
        "templates": {
            "recursion": TEMPLATE_RECURSION,
            "memoization": TEMPLATE_MEMOIZATION,
            "tabulation": TEMPLATE_TABULATION,
            "spaceOptimized": TEMPLATE_SPACE_OPTIMIZED,
        },
        "approaches": {
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
        },
        "exampleName": "Unique Paths",
    }

    with open(path, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"Updated tutorial at index {idx}.")
    print(f"Content length: {len(CONTENT)} chars")

if __name__ == "__main__":
    main()
