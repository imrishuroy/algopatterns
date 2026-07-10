#!/usr/bin/env python3
"""Generate and inject Multi-State DP article into patterns.json."""

import json
import os

PATTERNS_PATH = os.path.join(os.path.dirname(__file__), "../frontend/src/lib/patterns.json")

# ──────────────────────────────────────────────────────────────────────────────
# CONTENT
# ──────────────────────────────────────────────────────────────────────────────

CONTENT = """\
## Single-State vs Multi-State DP

Standard DP tracks one value per position: length of LIS ending at index i, or max sum of subarray ending at i. This works when the optimal decision at position i depends only on WHAT you've accumulated, not on HOW you got there.

Multi-state DP is needed when the LEGALITY or OPTIMALITY of your next action depends on an extra condition beyond position alone. That condition — holding a share, how many transactions remain, whether a cooldown is active — must be encoded as an additional state dimension alongside position.

| Aspect | Single-State DP | Multi-State DP |
|--------|----------------|----------------|
| State | `dp[i]` — one value per position | `dp[i][s]` — one value per (position, condition) pair |
| Tracks | Accumulated result up to position i | Accumulated result given position i AND current condition s |
| When legal? | Always | Depends on condition s (e.g., can't buy if holding) |
| Example | Max subarray sum ending at i | Max profit on day i while holding a share |
| Recurrence | `dp[i] = f(dp[i-1])` | `hold[i] = f(hold[i-1], rest[i-1])` — states reference each other |

**Concrete wrong-answer example:**

`prices = [6, 1, 3, 2, 4, 7]`

Naive single-state approach: `dp[i]` = max profit achievable through day i.

| Day | Price | Naive dp[i] | Reasoning |
|-----|-------|-------------|-----------|
| 0   | 6     | 0           | No prior buy |
| 1   | 1     | 0           | Price dropped |
| 2   | 3     | 2           | Buy at 1 (day 1), sell at 3 (day 2) |
| 3   | 2     | 2           | No improvement |
| 4   | 4     | 5           | "Also buy at 2 (day 3), sell at 4 (day 4)" → 2+3=5, but ILLEGAL: sold day 2, cooldown day 3, can't buy day 3 |
| 5   | 7     | 8           | Compound wrong answer |

**Naive answer: 8 (wrong). Correct answer: 6.**

The single-state dp[i] has no way to distinguish "I sold yesterday (cooldown — can't buy today)" from "I rested yesterday (free to buy today)." That distinction requires an extra state dimension.


## Problem Statement

Given an array `prices` where `prices[i]` is the stock price on day i, find the maximum profit achievable. You may complete as many transactions as you like, subject to:
- You must sell before you buy again (hold at most one share at a time).
- After you sell, you must wait **one full day** before buying again (one-day cooldown).

**Primary example** — used throughout this article:

```
prices = [6, 1, 3, 2, 4, 7]
```

```
Example 1:
Input:  [6, 1, 3, 2, 4, 7]
Output: 6
Explanation: Buy day 1 (price=1), hold through days 2–4, sell day 5 (price=7).
             Profit = 7 - 1 = 6.
             (Alternative: buy day 1, sell day 2 +2, cooldown day 3, buy day 4,
             sell day 5 +3 → total 5. Less optimal.)
```

```
Example 2:
Input:  [1, 2, 3, 0, 2]
Output: 3
Explanation: Buy day 0 (price=1), sell day 1 (price=2), cooldown day 2,
             buy day 3 (price=0), sell day 4 (price=2). Profit = 1 + 2 = 3.
```

```
Example 3:
Input:  [1]
Output: 0
Explanation: Only one price — no complete transaction possible.
```

**Edge cases:**
```
Input:  []          → 0   (empty array)
Input:  [5]         → 0   (single price)
Input:  [5,4,3,2]  → 0   (strictly decreasing — never profitable to buy)
Input:  [1,2,3,4]  → 3   (strictly increasing — buy day 0, sell day 3; no cooldown needed mid-sequence)
Input:  [3,3,3,3]  → 0   (all identical — buying equals selling price)
```


## The Core Decision/Insight

On each day you are in exactly one of three states:

- **HOLD**: you currently own a share.
- **SOLD**: you just sold a share (one-day cooldown — cannot buy today).
- **REST**: you are free to act (no share held, not in cooldown).

From each state, only specific actions are legal:

| Current State | Legal Actions | Resulting Next State |
|--------------|--------------|----------------------|
| REST | Buy | HOLD |
| REST | Do nothing | REST |
| HOLD | Sell | SOLD |
| HOLD | Do nothing | HOLD |
| SOLD | Must wait (cooldown) | REST |

**Critical:** SOLD transitions unconditionally to REST. This is what encodes the one-day wait — after selling you spend one day in SOLD (cooldown) before entering REST where buying is legal again.

This is a **State Machine DP**: instead of one recurrence per position, you define one recurrence per STATE. Each state's value on day i is the maximum over legal transitions from day i-1's states. The states reference each other's previous-day values.

**Decision trace for `[6, 1, 3, 2, 4, 7]`:**

```
Day | Price | State  | Action         | Cumulative profit
----|-------|--------|----------------|------------------
 0  |   6   | REST   | rest           | 0
 1  |   1   | REST   | buy → HOLD     | -1  (paid 1)
 2  |   3   | HOLD   | hold           | -1
 3  |   2   | HOLD   | hold           | -1
 4  |   4   | HOLD   | hold           | -1
 5  |   7   | HOLD   | sell → SOLD    |  6  (received 7)
→ Final profit: 6
```

Alternative (suboptimal) path:

```
Day | Price | State  | Action         | Cumulative profit
----|-------|--------|----------------|------------------
 0  |   6   | REST   | rest           | 0
 1  |   1   | REST   | buy → HOLD     | -1
 2  |   3   | HOLD   | sell → SOLD    |  2
 3  |   2   | SOLD   | cooldown→REST  |  2
 4  |   4   | REST   | buy → HOLD     | -2  (net: paid 4, have 2 from before)
 5  |   7   | HOLD   | sell → SOLD    |  5  (received 7, net 2+3=5)
→ Final profit: 5 (worse than 6)
```

The DP explores all such paths implicitly, keeping the maximum at each (day, state) pair.


## Approach 1: Recursion (Brute Force)

Recursively explore every legal sequence of actions from day 0, branching at each decision point.

```
solve(i, state):
    if i >= n: return 0                             // no more days, no more profit

    if state == REST:                               // can buy or do nothing
        buy  = solve(i+1, HOLD) - prices[i]        // pay prices[i] to buy
        rest = solve(i+1, REST)                     // skip today
        return max(buy, rest)

    if state == HOLD:                               // can sell or do nothing
        sell = solve(i+1, SOLD) + prices[i]        // receive prices[i] from selling
        hold = solve(i+1, HOLD)                     // keep holding
        return max(sell, hold)

    if state == SOLD:                               // cooldown — no choice
        return solve(i+1, REST)

// Call: solve(0, REST)
```

**Base case:** `i >= n` returns 0. No days remaining means no profit possible in any state.

**Time:** O(2^n). REST and HOLD each branch into 2 choices; with n days the tree has up to 2^n leaves.

**Space:** O(n) — recursion depth is at most n frames.

### Overlapping Subproblems

For `prices = [6, 1, 3, 2, 4, 7]`, partial recursion tree from the root:

```
                    solve(0, REST)
                   /               \\
        solve(1,HOLD)-6         solve(1,REST)
        /            \\           /           \\
  solve(2,SOLD)+1  solve(2,HOLD)  solve(2,HOLD)-1  solve(2,REST)
                       |               ↑
                  solve(3,HOLD)     REPEATED!
                  ...
```

`solve(2, HOLD)` is reached via two independent paths:
1. REST → buy (day 0) → HOLD → hold (day 1) → HOLD
2. REST → rest (day 0) → REST → buy (day 1) → HOLD

The same `(day=2, state=HOLD)` subproblem is solved independently each time — identical work repeated.


## Approach 2: Memoization (Top-Down DP)

Same recursion with a cache keyed by `(day, state)`. Compute each pair once; return the cached result on all subsequent calls.

```
memo = 2D table: memo[day][state], size n × 3
       initialized to UNSET
       (state: 0=REST, 1=HOLD, 2=SOLD)

solve(i, state):
    if i >= n: return 0
    if memo[i][state] != UNSET: return memo[i][state]     // cache hit

    if state == REST:
        result = max(solve(i+1, HOLD) - prices[i],        // buy
                     solve(i+1, REST))                     // rest
    elif state == HOLD:
        result = max(solve(i+1, SOLD) + prices[i],        // sell
                     solve(i+1, HOLD))                     // hold
    else:   // SOLD
        result = solve(i+1, REST)                          // cooldown

    memo[i][state] = result
    return result
```

**What the memo stores:** A profit VALUE for each `(day, state)` pair — the maximum profit achievable from day i onward, entering day i in the given state. The key carries an extra state dimension compared to single-variable DP, but the caching principle is identical: compute once, reuse everywhere. The only change is that the lookup key now has two components instead of one.

**Time:** O(n × 3) = O(n). Three states per day, O(1) work per state once cached.

**Space:** O(n) memo table (n × 3 entries) + O(n) recursion stack.


## Approach 3: Tabulation (Bottom-Up DP)

Build the solution iteratively from day 0 to day n-1. No recursion.

**State definition:**
- `hold[i]` = max profit on day i while holding a share
- `sold[i]` = max profit on day i having just sold (in cooldown)
- `rest[i]` = max profit on day i while free to act (not holding, not in cooldown)

**Fill order:** Day i depends on all three of day i-1's values. Fill left to right: day 0 → day 1 → ... → day n-1. Every dependency is guaranteed to be computed before it is needed.

**Base cases (day 0):**
```
hold[0] = -prices[0]     // only option: buy on day 0
sold[0] = -INFINITY      // impossible — can't sell on day 0 without a prior buy
rest[0] = 0              // do nothing on day 0
```

**Critical:** All three must be set explicitly before the loop. Leaving `sold[0]` uninitialized produces an incorrect `rest[1]`.

**Recurrence:**
```
hold[i] = max(hold[i-1],              // keep holding from yesterday
              rest[i-1] - prices[i])   // buy today (only from REST, not from SOLD)

sold[i] = hold[i-1] + prices[i]       // sell today (only from HOLD)

rest[i] = max(rest[i-1],              // stay resting from yesterday
              sold[i-1])               // cooldown from yesterday's sell ends today
```

**Why `rest[i-1] - prices[i]` and not `sold[i-1] - prices[i]`?**

After selling on day i-1 (entering SOLD), the cooldown requires staying in SOLD on day i-1 and entering REST on day i. So buying on day i requires that **yesterday you were in REST**, not in SOLD. Using `sold[i-1]` here would let you buy the day immediately after selling — the very constraint the cooldown is supposed to prevent.

**Final answer:**
```
max(sold[n-1], rest[n-1])
```

Not `hold[n-1]`. Ending while still holding a share means you never received payment for it — you'd have been better off not buying at all. The answer is the maximum over the two non-holding terminal states.

**Time:** O(n). One pass through prices.

**Space:** O(n). Three arrays of length n. Reducible to O(1) — see Section 9.


## Step-by-Step Walkthrough

`prices = [6, 1, 3, 2, 4, 7]` — same array throughout.

**Initialization (day 0, price=6):**
```
hold[0] = -6      buy on day 0 at price 6
sold[0] = -∞      impossible — can't sell without a prior buy
rest[0] =  0      do nothing
Best so far: max(-∞, 0) = 0
```

**Day 1 (price=1):**
```
hold[1] = max(hold[0], rest[0] - prices[1])
        = max(-6,  0 - 1)
        = max(-6, -1)
        = -1
        ← buying at day 1 (price=1) after resting day 0 beats buying at day 0 (price=6)

sold[1] = hold[0] + prices[1]
        = -6 + 1
        = -5
        ← selling what was bought at 6 for 1: a -5 loss

rest[1] = max(rest[0], sold[0])
        = max(0, -∞)
        = 0
        ← no profitable sold state to transition from

Best so far: max(-5, 0) = 0
```

**Day 2 (price=3):**
```
hold[2] = max(hold[1], rest[1] - prices[2])
        = max(-1, 0 - 3)
        = max(-1, -3)
        = -1
        ← keep holding from day 1 (bought at 1)

sold[2] = hold[1] + prices[2]
        = -1 + 3
        = 2
        ← sell today: bought at 1, sold at 3, profit = 2

rest[2] = max(rest[1], sold[1])
        = max(0, -5)
        = 0
        ← sold[1] = -5 is worse, stay resting

Best so far: max(2, 0) = 2
```

**Day 3 (price=2):**
```
hold[3] = max(hold[2], rest[2] - prices[3])
        = max(-1, 0 - 2)
        = max(-1, -2)
        = -1
        ← keep holding from day 1

sold[3] = hold[2] + prices[3]
        = -1 + 2
        = 1
        ← sell today: bought at 1, sold at 2, profit = 1

rest[3] = max(rest[2], sold[2])
        = max(0, 2)
        = 2
        ← sold at day 2 for +2; cooldown ended; now free to act with 2 in hand

Best so far: max(1, 2) = 2
```

**Day 4 (price=4):**
```
hold[4] = max(hold[3], rest[3] - prices[4])
        = max(-1, 2 - 4)
        = max(-1, -2)
        = -1
        ← keep holding from day 1 (still best buy was at price 1)

sold[4] = hold[3] + prices[4]
        = -1 + 4
        = 3
        ← sell today: bought at 1, sold at 4, profit = 3

rest[4] = max(rest[3], sold[3])
        = max(2, 1)
        = 2
        ← rest[3]=2 is better than sold[3]=1

Best so far: max(3, 2) = 3
```

**Day 5 (price=7):**
```
hold[5] = max(hold[4], rest[4] - prices[5])
        = max(-1, 2 - 7)
        = max(-1, -5)
        = -1
        ← keep holding from day 1

sold[5] = hold[4] + prices[5]
        = -1 + 7
        = 6
        ← sell today: bought at 1, sold at 7, profit = 6

rest[5] = max(rest[4], sold[4])
        = max(2, 3)
        = 3
        ← sold[4]=3 now the better resting base

Best so far: max(6, 3) = 6
```

**Final answer:** `max(sold[5], rest[5]) = max(6, 3) = 6`

| Day | Price | hold[i] | sold[i] | rest[i] | Best |
|-----|-------|---------|---------|---------|------|
| 0   | 6     | -6      | -∞      | 0       | 0    |
| 1   | 1     | -1      | -5      | 0       | 0    |
| 2   | 3     | -1      | 2       | 0       | 2    |
| 3   | 2     | -1      | 1       | 2       | 2    |
| 4   | 4     | -1      | 3       | 2       | 3    |
| 5   | 7     | -1      | **6**   | 3       | **6** |

`hold[i]` stays at -1 throughout: the best buy was always "buy day 1 at price 1." No later REST value was high enough to justify a second buy at a better combined entry cost.


## Memoization vs Tabulation Comparison

| Aspect | Memoization (Top-Down) | Tabulation (Bottom-Up) |
|--------|------------------------|------------------------|
| State | `(day, state)` pairs filled on demand | `hold[i]`/`sold[i]`/`rest[i]` arrays filled day by day |
| Space | O(n) memo + O(n) recursion stack | O(n) arrays, no stack (reducible to O(1)) |
| Direction | Branches recursively forward, unwinds backward | Builds from day 0 forward to day n-1 |
| Computes | Only (day, state) pairs actually reached | Every day × every state |
| Easier to write? | Yes — mirrors branching decisions directly | Requires identifying all states and transitions up front |
| Base cases | Handled by `i >= n` in the recursion | Must set day-0 values explicitly for all three states |


## Beyond Standard DP

**O(1)-space rolling-variable optimization:**

`hold[i]`, `sold[i]`, `rest[i]` each depend only on day i-1's values. Replace three arrays with three scalars:

```
hold = -prices[0]
sold = -INFINITY
rest = 0

for i from 1 to n-1:
    prevHold = hold                        // save BEFORE hold is updated
    hold = max(hold, rest - prices[i])
    rest = max(rest, sold)                 // use OLD sold before it's overwritten
    sold = prevHold + prices[i]            // use saved prevHold, NOT updated hold
```

**Critical:** `sold` must be computed from the OLD `hold` (before the current-day buy potentially updates it). Saving `prevHold` first enforces this. Updating in any other order silently introduces a one-off state error.

**Transaction-count variants:** When k ≥ ⌊n/2⌋, every profitable day-over-day move is reachable — the k limit is effectively unlimited. Recognizing this collapses the transaction-count dimension away, reducing a 3D recurrence to the simpler two-state (hold/notHold) form.


## Extending to Variations

**"What if there's no cooldown — unlimited transactions?"**

Drop the SOLD state entirely. After selling, you can buy again the very next day.

Reduction: two states — HOLD and notHold.

```
hold[i]    = max(hold[i-1], notHold[i-1] - prices[i])
notHold[i] = max(notHold[i-1], hold[i-1] + prices[i])
```

notHold covers both "resting" and "just sold," because the distinction no longer matters.

**"What if I'm limited to at most k transactions?"**

Add a transaction-count dimension: `hold[t][i]` and `rest[t][i]`, where t is the number of complete buy-sell transactions used so far.

**Critical:** This is the most common confusion point. Decide whether to count a transaction on BUY or on SELL — and apply it consistently throughout every transition. Counting on buy:

```
hold[t][i] = max(hold[t][i-1], rest[t-1][i-1] - prices[i])   // buy costs 1 transaction
rest[t][i] = max(rest[t][i-1], hold[t][i-1] + prices[i])      // sell doesn't change count
```

Counting on sell is equally valid — just swap which transition increments t.

**"What if every sale incurs a transaction fee?"**

No new state dimension needed. Subtract the fee at the moment of selling:

```
sold[i] = hold[i-1] + prices[i] - fee
```

The fee depends only on the act of selling, not on any history, so it doesn't change which states are needed.

**"What if there's an extra locked state after BUYING (not just after selling)?"**

Add an explicit state for "just bought, locked next day" — the same way SOLD separates "just sold" from "free to buy." The general principle: any condition that changes which actions are LEGAL tomorrow needs its own state. The cooldown-after-sell pattern here is the canonical example; a lockout-after-buy follows identically.

**Quick Reference:**

| Problem Type | States Needed | Key Adaptation |
|-------------|--------------|----------------|
| Unlimited transactions | hold, notHold | No cooldown/sold state needed |
| Cooldown after sell | hold, sold, rest | sold → rest transition enforces one-day wait |
| Transaction fee | hold, notHold | Subtract fee in sell transition; no new state |
| At most k transactions | hold[t], rest[t] | Add transaction-count dimension; increment at buy or sell consistently |
| At most 2 transactions | hold1, rest1, hold2, rest2 | Small k: enumerate state pairs explicitly |


## Debugging Checklist

- [ ] Have you identified EVERY state dimension the decision depends on (holding? cooldown? transactions used?) — not just position?
- [ ] Are all base cases (day 0 for every state) explicitly initialized before the loop runs?
- [ ] Does every transition reference the CORRECT previous state — selling reads yesterday's HOLD, buying reads yesterday's REST (not yesterday's SOLD)?
- [ ] Is the final answer extracted from the correct ending states (`max(sold[n-1], rest[n-1])`, never `hold[n-1]`)?
- [ ] If a transaction limit k exists, are you counting each transaction at ONE consistent point (buy OR sell, not both)?
- [ ] Are days filled in increasing order so every dependency is already computed?
- [ ] In the O(1) space optimization, are you saving `prevHold` before updating `hold`, so `sold` uses the old value?


## Common Mistakes

1. **Single-state DP:** Using only `dp[i]` (profit up to day i) silently drops the cooldown constraint. Without knowing yesterday's state, you can't tell whether buying today is legal.

2. **Forgetting to initialize all base cases:** Initializing `hold[0]` but leaving `sold[0]` undefined. `sold[0]` must be set to -∞ (impossible on day 0); an uninitialized value propagates incorrect rests onward.

3. **Buying from the wrong previous state:** Computing `hold[i] = max(hold[i-1], sold[i-1] - prices[i])` instead of `rest[i-1] - prices[i]`. After selling, you're in cooldown (SOLD) and cannot buy the next day — only REST allows buying.

4. **Extracting the answer from `hold[n-1]`:** Ending while holding a share means you never received the sale proceeds. The answer is always `max(sold[n-1], rest[n-1])`.

5. **Double-counting transactions:** In k-transaction variants, incrementing the count on both the buy AND the sell transition effectively counts each transaction twice, cutting capacity in half.

6. **Overwrite bug in O(1) optimization:** Updating `hold` first (incorporating today's buy), then computing `sold = hold + prices[i]` — which uses today's updated `hold` instead of yesterday's. Save `prevHold` before any updates.


## Practice Problems

**Easy:**
- Best Time to Buy and Sell Stock (single transaction — baseline, no multi-state needed)
- Best Time to Buy and Sell Stock II (unlimited transactions — two-state, no cooldown)

**Medium:**
- Best Time to Buy and Sell Stock with Cooldown (three-state: hold/sold/rest)
- Best Time to Buy and Sell Stock with Transaction Fee (two-state: hold/notHold, fee at sell)
- House Robber (two-state: robbed previous house or not — same "can't take adjacent" constraint structure)
- Best Time to Buy and Sell Stock III (at most 2 transactions — enumerate four state pairs explicitly)

**Hard:**
- Best Time to Buy and Sell Stock IV (at most k transactions — add transaction-count dimension)
- Paint House / Paint Fence variants (state: previous color or run-length of same color)
- Student Attendance Record II (state: absences used, consecutive lates — multiple simultaneous conditions)
"""

# ──────────────────────────────────────────────────────────────────────────────
# TEMPLATES
# ──────────────────────────────────────────────────────────────────────────────

TEMPLATE_RECURSION = """\
// Multi-State DP - Recursion
// At each day i: branch on current state, choose among legal actions
// State transitions encode which actions are legal
// TIME: O(2^n) without memo, SPACE: O(n) recursion depth

// VARIATION 1: Buy/Sell with Cooldown (three states: REST=0, HOLD=1, SOLD=2)
function solve(i, state, prices) {
    if (i >= prices.length) return 0;
    if (state === 0) { // REST: buy or rest
        return Math.max(
            solve(i+1, 1, prices) - prices[i],   // buy → enter HOLD
            solve(i+1, 0, prices)                 // rest → stay REST
        );
    } else if (state === 1) { // HOLD: sell or hold
        return Math.max(
            solve(i+1, 2, prices) + prices[i],   // sell → enter SOLD (cooldown)
            solve(i+1, 1, prices)                 // hold → stay HOLD
        );
    } else { // SOLD: cooldown — no choice
        return solve(i+1, 0, prices);             // forced → enter REST
    }
}
// Call: solve(0, 0, prices)

// VARIATION 2: Buy/Sell Unlimited Transactions (two states: notHolding, holding)
function solve(i, holding, prices) {
    if (i >= prices.length) return 0;
    if (!holding) {
        return Math.max(
            solve(i+1, true, prices) - prices[i],  // buy → HOLD
            solve(i+1, false, prices)               // skip → stay NOT HOLDING
        );
    } else {
        return Math.max(
            solve(i+1, false, prices) + prices[i],  // sell → NOT HOLDING
            solve(i+1, true, prices)                 // hold → stay HOLD
        );
    }
}
// Call: solve(0, false, prices)

// VARIATION 3: Buy/Sell with At Most K Transactions (adds transaction-count dimension)
// Count transaction on buy: txnsLeft decrements when buying
function solve(i, holding, txnsLeft, prices) {
    if (i >= prices.length) return 0;
    if (!holding) {
        const buy = txnsLeft > 0
            ? solve(i+1, true, txnsLeft-1, prices) - prices[i]
            : -Infinity;
        const skip = solve(i+1, false, txnsLeft, prices);
        return Math.max(buy, skip);
    } else {
        return Math.max(
            solve(i+1, false, txnsLeft, prices) + prices[i],  // sell
            solve(i+1, true, txnsLeft, prices)                 // hold
        );
    }
}
// Call: solve(0, false, k, prices)
"""

TEMPLATE_MEMOIZATION = """\
// Multi-State DP - Memoization
// Cache (day, state) pairs — same recursion, add lookup before branching
// TIME: O(n * states), SPACE: O(n * states) memo + O(n) stack

// VARIATION 1: Cooldown — memo[day][state], 3 states
function solveWithCooldown(prices) {
    const n = prices.length;
    const memo = Array.from({length: n}, () => new Array(3).fill(null));
    function solve(i, state) {
        if (i >= n) return 0;
        if (memo[i][state] !== null) return memo[i][state];
        let result;
        if (state === 0) {
            result = Math.max(solve(i+1, 1) - prices[i], solve(i+1, 0));
        } else if (state === 1) {
            result = Math.max(solve(i+1, 2) + prices[i], solve(i+1, 1));
        } else {
            result = solve(i+1, 0);
        }
        return memo[i][state] = result;
    }
    return solve(0, 0);
}

// VARIATION 2: Unlimited — memo[day][holding], 2 states
function solveUnlimited(prices) {
    const n = prices.length;
    const memo = Array.from({length: n}, () => new Array(2).fill(null));
    function solve(i, holding) {
        if (i >= n) return 0;
        const h = holding ? 1 : 0;
        if (memo[i][h] !== null) return memo[i][h];
        let result;
        if (!holding) {
            result = Math.max(solve(i+1, true) - prices[i], solve(i+1, false));
        } else {
            result = Math.max(solve(i+1, false) + prices[i], solve(i+1, true));
        }
        return memo[i][h] = result;
    }
    return solve(0, false);
}

// VARIATION 3: At Most K Transactions — memo[day][txnsLeft][holding], 3D
function solveKTransactions(prices, k) {
    const n = prices.length;
    const memo = Array.from({length: n}, () =>
        Array.from({length: k+1}, () => new Array(2).fill(null)));
    function solve(i, txns, holding) {
        if (i >= n || txns === 0) return 0;
        const h = holding ? 1 : 0;
        if (memo[i][txns][h] !== null) return memo[i][txns][h];
        let result;
        if (!holding) {
            const buy = txns > 0 ? solve(i+1, txns-1, true) - prices[i] : -Infinity;
            result = Math.max(buy, solve(i+1, txns, false));
        } else {
            result = Math.max(solve(i+1, txns, false) + prices[i], solve(i+1, txns, true));
        }
        return memo[i][txns][h] = result;
    }
    return solve(0, k, false);
}
"""

TEMPLATE_TABULATION = """\
// Multi-State DP - Tabulation
// Fill by increasing day; every transition looks exactly one day back
// TIME: O(n * states), SPACE: O(n * states) — reducible to O(states) with rolling vars

// VARIATION 1: Cooldown — three arrays (hold, sold, rest)
function solveWithCooldown(prices) {
    const n = prices.length;
    if (n === 0) return 0;
    const hold = new Array(n), sold = new Array(n), rest = new Array(n);
    hold[0] = -prices[0];   // buy on day 0
    sold[0] = -Infinity;    // impossible on day 0
    rest[0] = 0;            // do nothing on day 0
    for (let i = 1; i < n; i++) {
        hold[i] = Math.max(hold[i-1], rest[i-1] - prices[i]); // buy only from REST
        sold[i] = hold[i-1] + prices[i];                       // sell only from HOLD
        rest[i] = Math.max(rest[i-1], sold[i-1]);              // cooldown ends → REST
    }
    return Math.max(sold[n-1], rest[n-1]); // NOT hold[n-1]
}

// VARIATION 2: Unlimited — two arrays (hold, notHold)
function solveUnlimited(prices) {
    const n = prices.length;
    if (n === 0) return 0;
    const hold = new Array(n), notHold = new Array(n);
    hold[0] = -prices[0];
    notHold[0] = 0;
    for (let i = 1; i < n; i++) {
        hold[i]    = Math.max(hold[i-1], notHold[i-1] - prices[i]);
        notHold[i] = Math.max(notHold[i-1], hold[i-1] + prices[i]);
    }
    return notHold[n-1];
}

// VARIATION 3: At Most K Transactions — 2D arrays indexed by transactions used
// hold[t][i] = max profit using exactly t buys, currently holding, on day i
function solveKTransactions(prices, k) {
    const n = prices.length;
    if (n === 0 || k === 0) return 0;
    // hold[t][i], rest[t][i]: t = transactions used (counted on buy)
    const hold = Array.from({length: k+1}, () => new Array(n).fill(-Infinity));
    const rest = Array.from({length: k+1}, () => new Array(n).fill(0));
    for (let t = 1; t <= k; t++) {
        hold[t][0] = -prices[0]; // use 1 transaction to buy on day 0
    }
    for (let i = 1; i < n; i++) {
        for (let t = 1; t <= k; t++) {
            hold[t][i] = Math.max(hold[t][i-1], rest[t-1][i-1] - prices[i]); // buy: costs 1 txn
            rest[t][i] = Math.max(rest[t][i-1], hold[t][i-1] + prices[i]);   // sell
        }
    }
    return rest[k][n-1];
}
"""

TEMPLATE_SPACE_OPTIMIZED = """\
// Multi-State DP - Space Optimized (O(1) rolling scalars)
// hold[i]/sold[i]/rest[i] depend only on day i-1 — replace arrays with scalars
// CRITICAL: save old values before overwriting; update order matters

// VARIATION 1: Cooldown — O(1) space
function solveWithCooldown(prices) {
    const n = prices.length;
    if (n === 0) return 0;
    let hold = -prices[0], sold = -Infinity, rest = 0;
    for (let i = 1; i < n; i++) {
        const prevHold = hold;              // save BEFORE hold is updated
        hold = Math.max(hold, rest - prices[i]);
        rest = Math.max(rest, sold);        // use OLD sold before it's overwritten
        sold = prevHold + prices[i];        // use saved prevHold, NOT updated hold
    }
    return Math.max(sold, rest);
}

// VARIATION 2: Unlimited — O(1) space
function solveUnlimited(prices) {
    const n = prices.length;
    if (n === 0) return 0;
    let hold = -prices[0], notHold = 0;
    for (let i = 1; i < n; i++) {
        const prevHold = hold;
        hold    = Math.max(hold, notHold - prices[i]);
        notHold = Math.max(notHold, prevHold + prices[i]);
    }
    return notHold;
}

// VARIATION 3: At Most K Transactions — O(k) space (k pairs of scalars)
// For general k, cannot reduce to O(1) — each transaction level needs its own pair
function solveKTransactions(prices, k) {
    const n = prices.length;
    if (n === 0 || k === 0) return 0;
    // holds[t] and rests[t]: current-day values for transaction count t
    const holds = new Array(k+1).fill(-Infinity);
    const rests = new Array(k+1).fill(0);
    for (let t = 1; t <= k; t++) holds[t] = -prices[0];
    for (let i = 1; i < n; i++) {
        // Iterate t from k down to 1 to avoid using updated values from the same day
        for (let t = k; t >= 1; t--) {
            holds[t] = Math.max(holds[t], rests[t-1] - prices[i]);
            rests[t] = Math.max(rests[t], holds[t] + prices[i]);
            // Note: holds[t] is updated before rests[t] here — this is correct because
            // rests[t-1] (used for buying into holds[t]) belongs to transaction level t-1
            // which we process AFTER t in the descending loop, preserving day i-1 values.
        }
    }
    return rests[k];
}
"""

# ──────────────────────────────────────────────────────────────────────────────
# APPROACHES — primary problem: Best Time to Buy and Sell Stock with Cooldown
# ──────────────────────────────────────────────────────────────────────────────

APPROACH_RECURSION_JAVA = """\
// Best Time to Buy and Sell Stock with Cooldown - Recursion
// TIME: O(2^n), SPACE: O(n)

class Solution {
    private int[] prices;

    public int maxProfit(int[] prices) {
        this.prices = prices;
        return solve(0, 0); // start day 0 in REST state
    }

    // state: 0=REST, 1=HOLD, 2=SOLD
    private int solve(int day, int state) {
        if (day >= prices.length) return 0;

        if (state == 0) { // REST: buy or do nothing
            int buy  = solve(day + 1, 1) - prices[day];
            int rest = solve(day + 1, 0);
            return Math.max(buy, rest);
        } else if (state == 1) { // HOLD: sell or keep holding
            int sell = solve(day + 1, 2) + prices[day];
            int hold = solve(day + 1, 1);
            return Math.max(sell, hold);
        } else { // SOLD: cooldown, no choice
            return solve(day + 1, 0);
        }
    }
}
"""

APPROACH_RECURSION_JS = """\
// Best Time to Buy and Sell Stock with Cooldown - Recursion
// TIME: O(2^n), SPACE: O(n)

function maxProfit(prices) {
    // state: 0=REST, 1=HOLD, 2=SOLD
    function solve(day, state) {
        if (day >= prices.length) return 0;

        if (state === 0) { // REST: buy or do nothing
            return Math.max(
                solve(day + 1, 1) - prices[day],  // buy
                solve(day + 1, 0)                  // rest
            );
        } else if (state === 1) { // HOLD: sell or keep holding
            return Math.max(
                solve(day + 1, 2) + prices[day],  // sell
                solve(day + 1, 1)                  // hold
            );
        } else { // SOLD: cooldown, no choice
            return solve(day + 1, 0);
        }
    }
    return solve(0, 0);
}
"""

APPROACH_MEMOIZATION_JAVA = """\
// Best Time to Buy and Sell Stock with Cooldown - Memoization
// TIME: O(n), SPACE: O(n)

class Solution {
    private int[] prices;
    private int[][] memo;

    public int maxProfit(int[] prices) {
        this.prices = prices;
        int n = prices.length;
        this.memo = new int[n][3];
        for (int[] row : memo) Arrays.fill(row, Integer.MIN_VALUE);
        return solve(0, 0);
    }

    // state: 0=REST, 1=HOLD, 2=SOLD
    private int solve(int day, int state) {
        if (day >= prices.length) return 0;
        if (memo[day][state] != Integer.MIN_VALUE) return memo[day][state];

        int result;
        if (state == 0) {
            result = Math.max(
                solve(day + 1, 1) - prices[day],
                solve(day + 1, 0)
            );
        } else if (state == 1) {
            result = Math.max(
                solve(day + 1, 2) + prices[day],
                solve(day + 1, 1)
            );
        } else {
            result = solve(day + 1, 0);
        }

        memo[day][state] = result;
        return result;
    }
}
"""

APPROACH_MEMOIZATION_JS = """\
// Best Time to Buy and Sell Stock with Cooldown - Memoization
// TIME: O(n), SPACE: O(n)

function maxProfit(prices) {
    const n = prices.length;
    const memo = Array.from({length: n}, () => new Array(3).fill(null));

    // state: 0=REST, 1=HOLD, 2=SOLD
    function solve(day, state) {
        if (day >= n) return 0;
        if (memo[day][state] !== null) return memo[day][state];

        let result;
        if (state === 0) {
            result = Math.max(
                solve(day + 1, 1) - prices[day],
                solve(day + 1, 0)
            );
        } else if (state === 1) {
            result = Math.max(
                solve(day + 1, 2) + prices[day],
                solve(day + 1, 1)
            );
        } else {
            result = solve(day + 1, 0);
        }

        memo[day][state] = result;
        return result;
    }

    return solve(0, 0);
}
"""

APPROACH_TABULATION_JAVA = """\
// Best Time to Buy and Sell Stock with Cooldown - Tabulation
// TIME: O(n), SPACE: O(n)

class Solution {
    public int maxProfit(int[] prices) {
        int n = prices.length;
        if (n == 0) return 0;

        int[] hold = new int[n];
        int[] sold = new int[n];
        int[] rest = new int[n];

        hold[0] = -prices[0];
        sold[0] = Integer.MIN_VALUE / 2; // impossible on day 0
        rest[0] = 0;

        for (int i = 1; i < n; i++) {
            hold[i] = Math.max(hold[i-1], rest[i-1] - prices[i]); // buy only from REST
            sold[i] = hold[i-1] + prices[i];                       // sell from HOLD
            rest[i] = Math.max(rest[i-1], sold[i-1]);              // cooldown ends
        }

        return Math.max(sold[n-1], rest[n-1]); // never hold[n-1]
    }
}
"""

APPROACH_TABULATION_JS = """\
// Best Time to Buy and Sell Stock with Cooldown - Tabulation
// TIME: O(n), SPACE: O(n)

function maxProfit(prices) {
    const n = prices.length;
    if (n === 0) return 0;

    const hold = new Array(n);
    const sold = new Array(n);
    const rest = new Array(n);

    hold[0] = -prices[0];
    sold[0] = -Infinity;  // impossible on day 0
    rest[0] = 0;

    for (let i = 1; i < n; i++) {
        hold[i] = Math.max(hold[i-1], rest[i-1] - prices[i]); // buy only from REST
        sold[i] = hold[i-1] + prices[i];                       // sell from HOLD
        rest[i] = Math.max(rest[i-1], sold[i-1]);              // cooldown ends
    }

    return Math.max(sold[n-1], rest[n-1]); // never hold[n-1]
}
"""

APPROACH_SPACE_OPT_JAVA = """\
// Best Time to Buy and Sell Stock with Cooldown - Space Optimized O(1)
// TIME: O(n), SPACE: O(1)

class Solution {
    public int maxProfit(int[] prices) {
        int n = prices.length;
        if (n == 0) return 0;

        int hold = -prices[0];
        int sold = Integer.MIN_VALUE / 2; // impossible on day 0
        int rest = 0;

        for (int i = 1; i < n; i++) {
            int prevHold = hold;                               // save BEFORE hold updates
            hold = Math.max(hold, rest - prices[i]);
            rest = Math.max(rest, sold);                       // use OLD sold
            sold = prevHold + prices[i];                       // use saved prevHold
        }

        return Math.max(sold, rest);
    }
}
"""

APPROACH_SPACE_OPT_JS = """\
// Best Time to Buy and Sell Stock with Cooldown - Space Optimized O(1)
// TIME: O(n), SPACE: O(1)

function maxProfit(prices) {
    const n = prices.length;
    if (n === 0) return 0;

    let hold = -prices[0];
    let sold = -Infinity;  // impossible on day 0
    let rest = 0;

    for (let i = 1; i < n; i++) {
        const prevHold = hold;                      // save BEFORE hold updates
        hold = Math.max(hold, rest - prices[i]);
        rest = Math.max(rest, sold);                // use OLD sold
        sold = prevHold + prices[i];               // use saved prevHold
    }

    return Math.max(sold, rest);
}
"""

# ──────────────────────────────────────────────────────────────────────────────
# INJECT INTO patterns.json
# ──────────────────────────────────────────────────────────────────────────────

def main():
    with open(PATTERNS_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    dp_pattern = next(p for p in data if p["id"] == "dynamic-programming")
    tutorial = dp_pattern["tutorial"]

    # Find multi-state DP entry (index 12, title check for safety)
    idx = next(i for i, item in enumerate(tutorial)
               if isinstance(item, dict) and item.get("title") == "Multi-State DP")

    existing = tutorial[idx]

    tutorial[idx] = {
        "title": "Multi-State DP",
        "visualizer": existing.get("visualizer", ""),
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
                "java": APPROACH_SPACE_OPT_JAVA,
                "javascript": APPROACH_SPACE_OPT_JS,
            },
        },
        "exampleName": "Best Time to Buy and Sell Stock with Cooldown",
        "exampleProblems": existing.get("exampleProblems", [
            "Best Time to Buy and Sell Stock with Cooldown",
            "Best Time to Buy and Sell Stock with Transaction Fee",
            "Best Time to Buy and Sell Stock III",
            "House Robber",
        ]),
    }

    with open(PATTERNS_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"Updated Multi-State DP entry at tutorial index {idx}.")
    print(f"Content length: {len(CONTENT):,} chars")
    print(f"File written: {PATTERNS_PATH}")

if __name__ == "__main__":
    main()
