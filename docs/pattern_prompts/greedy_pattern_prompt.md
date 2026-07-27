# Greedy Pattern Improvement Prompt (FAANG-Ready Edition)

Use this prompt to re write the entire Greedy pattern to match the quality of the DP pattern and Heap Pattern, please review the contents of dp pattern and heap pattern. and provide a complete rewrite of the greedy pattern to match the quality of the DP pattern and Heap Pattern.
---

# Improve the Greedy Pattern to FAANG Interview Standards

## Target Audience
- Software engineers preparing for FAANG (Meta, Amazon, Apple, Netflix, Google) interviews
- Engineers targeting top tech companies (Microsoft, Uber, Airbnb, LinkedIn, etc.)
- Competitive programmers preparing for contests and advanced greedy problem solving
- Anyone wanting to master greedy algorithms at an expert level

## Quality Standard
The DP pattern and Heap pattern are the quality benchmark. The Greedy pattern should:
1. Build intuition before algorithms
2. Teach WHEN greedy works vs WHEN it fails
3. Cover ALL common FAANG greedy problem types
4. Include proof techniques for correctness
5. Provide interview-ready communication scripts

---

# Improve the Greedy Pattern to Match the Quality of the DP Pattern

I want you to re write the entire Greedy pattern located at `id: "greedy"` in `patterns.json`.

Before making any changes, carefully study the Dynamic Programming and Heap pattern in this project.

The DP pattern and Heap Pattern are the quality benchmark. I do **not** want the Greedy pattern to simply contain more text. I want it to teach in the same way that the DP and Heap patterns content teaches.

---

# Current State Analysis

## What the Greedy Pattern Has

| Aspect | Status | Details |
|--------|--------|---------|
| Tutorial sections | 16 | Good coverage of core problems |
| Variations | 6 | Intervals, Merge, Jump, Stock, Two-Pointer, Heap |
| Common problems | 10 | Core problems listed |
| Key insights | 7 | Good but could expand |
| Common mistakes | 4 | Needs expansion |
| ASCII diagrams | 10/16 sections | Good visual traces |
| Tables | 4/16 sections | Could add more |
| Visualizers linked | **0** | **CRITICAL GAP** |
| Code format | Correct (`code` not `approaches`) | Good |

## Critical Gap: Unused Visualizers

**5+ visualizers exist but NONE are linked to the tutorial!**



---

# Gaps Against pattern_prompt.md Requirements

## Missing Content

| Requirement | Current State | Action Needed |
|-------------|---------------|---------------|
| Learning objectives | ❌ Missing | Add "What You'll Learn" to Section 1 |
| Input constraint mapping | ❌ Missing | Add constraint table |
| Checkpoint questions | ❌ Missing | Add after key concepts |
| Follow-up questions | ❌ Missing | Add for each problem |
| Edge case checklist | ⚠️ Partial (in mistakes) | Expand and formalize |
| Interview communication | ⚠️ Partial (Section 14) | Add UMPIRE scripts |
| Pattern comparison | ✅ Has (Section 6) | Could expand more |
| Complexity derivations | ⚠️ Partial (Section 15) | Add formal proofs |
| Difficulty progression | ❌ Missing | Order problems Easy→Hard |
| Dry-run trace tables | ⚠️ Partial (ASCII traces) | Formalize into tables |
| Visualizer integration | ❌ None linked | **Link all 5+ visualizers** |

---

# Greedy Algorithm: Core Concepts to Cover

## What Makes Greedy Work

### The Two Properties

**1. Greedy-Choice Property**
At each step, a locally optimal choice leads to a globally optimal solution. We can make the best choice RIGHT NOW without worrying about future consequences.

**2. Optimal Substructure**
An optimal solution contains optimal solutions to subproblems. After making a greedy choice, we're left with a smaller subproblem of the same type.

### Proving Greedy Correctness

**Exchange Argument:**
Show that any optimal solution can be transformed into the greedy solution without losing optimality.

**Greedy Stays Ahead:**
Show that at every step, the greedy solution is at least as good as any other partial solution.

---

# Input Constraint Analysis for Greedy

Add this table to Section 1 (Introduction):

## When Greedy Techniques Are Feasible

| Input Size | Max Complexity | Greedy Feasible? | Notes |
|------------|----------------|------------------|-------|
| n ≤ 10 | O(n!) | ✅ | Brute force also works |
| n ≤ 1,000 | O(n²) | ✅ | Greedy is overkill but fine |
| n ≤ 100,000 | O(n log n) | ✅ | **Sweet spot for greedy** (sort + scan) |
| n ≤ 10^7 | O(n) | ✅ | Linear scan greedy ideal |
| n ≤ 10^9 | O(log n) | ⚠️ | Only binary search greedy |

## Constraint Signals for Greedy Problems

| Constraint | Likely Approach |
|------------|-----------------|
| n ≤ 10^5, intervals given | Sort by start/end + linear scan O(n log n) |
| n ≤ 10^5, "minimum/maximum" | Greedy with sorting or heap |
| "Can you reach..." | Track maximum reach, O(n) |
| "Minimum jumps/moves" | BFS-like greedy, O(n) |
| "Optimal pairing" | Sort + two pointers |
| "Schedule/assign tasks" | Priority queue greedy |

---

# The 12 Greedy Sub-Patterns

## 1. Kadane's Algorithm (Maximum Subarray)

**When to use:** Maximum/minimum subarray sum, maximum product subarray

**Key Insight:** At each position, decide: extend the current subarray OR start fresh. The greedy choice is to start fresh if the current sum becomes negative.

**Template:**
```
maxSum = nums[0], currentSum = nums[0]
for i = 1 to n-1:
    currentSum = max(nums[i], currentSum + nums[i])
    maxSum = max(maxSum, currentSum)
return maxSum
```

**Why Greedy Works:**
- If `currentSum` is negative, adding it to `nums[i]` can only make things worse
- Starting fresh at `nums[i]` is always better than dragging negative baggage
- This is greedy because we make the locally optimal choice at each position

**Problems:**
- Maximum Subarray (LC 53)
- Maximum Product Subarray (LC 152) - needs modification for negatives
- Maximum Sum Circular Subarray (LC 918)

## 2. Interval Scheduling (Sort by End Time)

**When to use:** Maximum non-overlapping intervals, activity selection, minimum removals

**Key Insight:** Finishing early leaves maximum room for future activities

**Template:**
```
Sort by END time
count = 1, lastEnd = first.end
for each interval:
    if start >= lastEnd:
        count++, lastEnd = end
```

**Problems:**
- Activity Selection
- Non-overlapping Intervals (LC 435)
- Minimum Number of Arrows to Burst Balloons (LC 452)
- Meeting Rooms (LC 252)

## 2. Interval Merging (Sort by Start Time)

**When to use:** Merge overlapping intervals, insert interval

**Key Insight:** Sort by start to process intervals in order, extend end when overlapping

**Template:**
```
Sort by START time
for each interval:
    if overlaps with last: extend end
    else: add new interval
```

**Problems:**
- Merge Intervals (LC 56)
- Insert Interval (LC 57)
- Interval List Intersections (LC 986)

## 3. Jump Game (Maximum Reach Tracking)

**When to use:** Can reach end, minimum jumps to reach

**Key Insight:** Track the farthest position reachable at each step

**Template (Can Jump):**
```
maxReach = 0
for i = 0 to n-1:
    if i > maxReach: return false
    maxReach = max(maxReach, i + nums[i])
return true
```

**Template (Min Jumps):**
```
jumps = 0, currentEnd = 0, farthest = 0
for i = 0 to n-2:
    farthest = max(farthest, i + nums[i])
    if i == currentEnd:
        jumps++
        currentEnd = farthest
return jumps
```

**Problems:**
- Jump Game (LC 55)
- Jump Game II (LC 45)
- Video Stitching (LC 1024)

## 4. Running Min/Max (Track Best So Far)

**When to use:** Best time to buy/sell stock, maximum difference

**Key Insight:** Track minimum/maximum seen so far to make optimal decisions

**Template:**
```
minSoFar = infinity, maxProfit = 0
for each price:
    minSoFar = min(minSoFar, price)
    maxProfit = max(maxProfit, price - minSoFar)
return maxProfit
```

**Problems:**
- Best Time to Buy and Sell Stock (LC 121)
- Best Time to Buy and Sell Stock II (LC 122)
- Maximum Difference Between Increasing Elements (LC 2016)

## 5. Two-Pointer Greedy

**When to use:** Optimal pairing, container problems, sorted array optimization

**Key Insight:** Move the "worse" pointer to potentially find better solutions

**Template:**
```
Sort if needed
left = 0, right = n-1
while left < right:
    Process pair
    if condition: move left
    else: move right
```

**Problems:**
- Container With Most Water (LC 11)
- Boats to Save People (LC 881)
- Two Sum II (LC 167)
- 3Sum Closest (LC 16)

## 6. Heap-Based Greedy

**When to use:** Scheduling, reorganizing, always pick best available

**Key Insight:** Use priority queue to efficiently find the best option

**Template:**
```
Build max-heap of frequencies/values
while heap not empty:
    Pick top element
    Process and potentially re-add
```

**Problems:**
- Task Scheduler (LC 621)
- Reorganize String (LC 767)
- Meeting Rooms II (LC 253)
- K Closest Points to Origin (LC 973)

## 7. Circular Array Greedy

**When to use:** Circular routes, gas station problems

**Key Insight:** If total resource >= total cost, solution exists. Find starting point by tracking where we run out.

**Template:**
```
totalGain = 0, currentGain = 0, start = 0
for i = 0 to n-1:
    gain = resource[i] - cost[i]
    totalGain += gain
    currentGain += gain
    if currentGain < 0:
        start = i + 1
        currentGain = 0
return totalGain >= 0 ? start : -1
```

**Problems:**
- Gas Station (LC 134)
- Circular Array Loop (LC 457)

## 8. Greedy Reconstruction

**When to use:** Reconstruct sequence from constraints, ordering problems

**Key Insight:** Process elements in a specific order so constraints are automatically satisfied

**Template (Queue Reconstruction):**
```
Sort by height DESC, then k ASC
result = []
for each person:
    Insert at index = k
```

**Problems:**
- Queue Reconstruction by Height (LC 406)
- Largest Number (LC 179)
- Remove K Digits (LC 402)

## 9. Last Occurrence Greedy (Partition Labels)

**When to use:** Partition into minimum parts where each element appears in only one part

**Key Insight:** Track the LAST occurrence of each element. A partition must extend to include all last occurrences of elements it contains.

**Template:**
```
lastIndex = {} // Map char -> last index
for i, char in s:
    lastIndex[char] = i

partitions = []
start = 0, end = 0
for i, char in s:
    end = max(end, lastIndex[char])
    if i == end:
        partitions.append(end - start + 1)
        start = i + 1
return partitions
```

**Problems:**
- Partition Labels (LC 763)
- Merge Intervals (variation)

## 10. Greedy with HashMap (Consecutive Groups)

**When to use:** Forming consecutive sequences, grouping elements

**Key Insight:** Use a frequency map and greedily form groups starting from the smallest available element

**Template (Hand of Straights):**
```
if n % groupSize != 0: return false
count = Counter(hand)
for card in sorted(count.keys()):
    while count[card] > 0:
        for i in range(groupSize):
            if count[card + i] <= 0: return false
            count[card + i]--
return true
```

**Problems:**
- Hand of Straights (LC 846)
- Divide Array in Sets of K Consecutive Numbers (LC 1296)
- Split Array into Consecutive Subsequences (LC 659)

## 11. Greedy Verification (Merge Triplets)

**When to use:** Check if target can be formed by selecting/combining elements

**Key Insight:** Greedily collect "good" elements that don't violate constraints, then check if all requirements are satisfied

**Template (Merge Triplets):**
```
// A triplet is "good" if none of its values exceed the target
good = [false, false, false]
for triplet in triplets:
    if triplet[0] <= target[0] AND 
       triplet[1] <= target[1] AND 
       triplet[2] <= target[2]:
        // This triplet can contribute
        if triplet[0] == target[0]: good[0] = true
        if triplet[1] == target[1]: good[1] = true
        if triplet[2] == target[2]: good[2] = true
return good[0] AND good[1] AND good[2]
```

**Problems:**
- Merge Triplets to Form Target Triplet (LC 1899)
- Check if Array Is Sorted and Rotated (LC 1752)

## 12. Range Tracking Greedy (Valid Parenthesis String)

**When to use:** Strings with wildcards, flexible matching, balance checking

**Key Insight:** Track a RANGE of possible values instead of a single value. The wildcard can be any option, so track [low, high] bounds.

**Template (Valid Parenthesis String):**
```
low = 0, high = 0  // Range of possible open parentheses count
for char in s:
    if char == '(':
        low++, high++
    else if char == ')':
        low--, high--
    else:  // char == '*'
        low--   // * could be ')'
        high++  // * could be '('
    
    if high < 0: return false  // Too many ')'
    low = max(low, 0)  // low can't go negative (we'd choose * as empty)

return low == 0  // Must be able to balance
```

**Why This Works:**
- `high` tracks maximum possible open count (all * treated as '(')
- `low` tracks minimum possible open count (all * treated as ')' or empty)
- If at any point even the maximum can't stay non-negative, we fail
- At the end, we need low == 0 (can balance with some * choices)

**Problems:**
- Valid Parenthesis String (LC 678)
- Check if a Parentheses String Can Be Valid (LC 2116)

---

# FAANG-Level Advanced Greedy Patterns

## 13. Monotonic Stack Greedy

**When to use:** Next greater/smaller element, removing elements to form optimal sequence

**Key Insight:** Maintain a stack where elements follow a monotonic order. Pop when a better option appears.

**Template (Remove K Digits):**
```
stack = []
for digit in num:
    while k > 0 AND stack AND stack.top() > digit:
        stack.pop()
        k--
    stack.push(digit)
// Remove remaining k digits from end
while k > 0:
    stack.pop()
    k--
return stack (remove leading zeros)
```

**Problems:**
- Remove K Digits (LC 402) - Amazon, Google
- Remove Duplicate Letters (LC 316) - Facebook
- Create Maximum Number (LC 321) - Google
- Smallest Subsequence of Distinct Characters (LC 1081)

## 14. Two-Pass Greedy (Candy Problem Pattern)

**When to use:** Constraints depend on neighbors in both directions

**Key Insight:** Make two passes - one left-to-right, one right-to-left. Combine results.

**Template:**
```
// Pass 1: Left to Right
for i = 1 to n-1:
    if arr[i] > arr[i-1]: left[i] = left[i-1] + 1

// Pass 2: Right to Left  
for i = n-2 to 0:
    if arr[i] > arr[i+1]: right[i] = right[i+1] + 1

// Combine
result = sum(max(left[i], right[i]) for all i)
```

**Problems:**
- Candy (LC 135) - Google, Amazon
- Trapping Rain Water (LC 42) - can also use two-pass
- Product of Array Except Self (LC 238) - two-pass pattern

## 15. Greedy with Sorting + Binary Search

**When to use:** Optimal assignment, matching problems

**Key Insight:** Sort one array, then for each element in other array, use binary search to find optimal match.

**Template (Advantage Shuffle / Russian Roulette):**
```
Sort nums1
For each num in nums2:
    Find smallest num1 > num (upper bound)
    If found: assign it
    Else: assign smallest remaining
```

**Problems:**
- Advantage Shuffle (LC 870) - Google
- Assign Cookies (LC 455) - Microsoft
- Boats to Save People (LC 881) - variant

## 16. Line Sweep Greedy

**When to use:** Intervals with events at specific times, overlapping calculations

**Key Insight:** Convert intervals to events (+1 at start, -1 at end), sort by time, scan and track state.

**Template:**
```
events = []
for interval in intervals:
    events.append((start, +1))
    events.append((end, -1))
events.sort()  // By time, end before start for ties

count = 0, maxCount = 0
for time, delta in events:
    count += delta
    maxCount = max(maxCount, count)
```

**Problems:**
- Meeting Rooms II (LC 253) - Facebook, Google
- Car Pooling (LC 1094) - Uber
- My Calendar I/II/III (LC 729, 731, 732) - Google

## 17. Greedy String Building

**When to use:** Build lexicographically smallest/largest string, character selection

**Key Insight:** At each position, greedily choose the best available character that still allows completing the task.

**Template (Smallest Subsequence):**
```
lastIndex = {char: last occurrence for char in s}
stack = []
inStack = set()
for i, char in s:
    if char in inStack: continue
    while stack AND char < stack.top() AND lastIndex[stack.top()] > i:
        inStack.remove(stack.pop())
    stack.push(char)
    inStack.add(char)
```

**Problems:**
- Remove Duplicate Letters (LC 316) - Facebook
- Smallest Subsequence of Distinct Characters (LC 1081)
- Largest Number (LC 179) - Amazon

## 18. Greedy with Priority Queue (Two Heaps)

**When to use:** Need to track best from two different criteria simultaneously

**Key Insight:** Use two heaps - one for each criterion. Process greedily from appropriate heap.

**Template (IPO):**
```
minHeapByCost = all projects sorted by cost
maxHeapByProfit = []
capital = initialCapital

for k projects:
    // Move all affordable projects to profit heap
    while minHeapByCost AND minHeapByCost.top().cost <= capital:
        maxHeapByProfit.push(minHeapByCost.pop())
    
    if maxHeapByProfit empty: break
    capital += maxHeapByProfit.pop().profit
```

**Problems:**
- IPO (LC 502) - LinkedIn, Amazon
- Find Median from Data Stream (LC 295) - Amazon, Microsoft
- Sliding Window Median (LC 480) - Google

## 19. Greedy on Graphs (Topological Sort / Kahn's Algorithm)

**When to use:** Task scheduling with dependencies, course prerequisites, build order

**Key Insight:** Greedily process nodes with zero in-degree (no dependencies). This is greedy because we always pick a "ready" node without looking ahead.

**Template (Kahn's Algorithm):**
```
// Build in-degree map and adjacency list
inDegree = {node: count of incoming edges}
graph = {node: list of nodes it points to}

// Start with all nodes that have no dependencies
queue = [nodes where inDegree == 0]
result = []

while queue not empty:
    node = queue.dequeue()  // Greedy: pick any ready node
    result.append(node)
    
    for neighbor in graph[node]:
        inDegree[neighbor]--
        if inDegree[neighbor] == 0:
            queue.enqueue(neighbor)

return result if len(result) == numNodes else [] // Cycle detected
```

**Why This Is Greedy:**
- At each step, we pick ANY node with in-degree 0 (no lookahead)
- Once processed, a node is never reconsidered
- The greedy choice (any ready node) leads to valid topological order

**Problems:**
- Course Schedule (LC 207) - Amazon, Google
- Course Schedule II (LC 210) - Amazon, Facebook
- Alien Dictionary (LC 269) - Facebook, Google
- Parallel Courses (LC 1136) - Google

**Bridge to Other Patterns:**
- Connects to Heap: Use min-heap for lexicographically smallest order
- Connects to DP: When you need to count paths or find longest path, add DP on top of topo sort

---

# Classic Greedy Algorithms (Must Know for FAANG)

## Huffman Coding
- **What:** Build optimal prefix-free binary codes
- **Greedy choice:** Always merge two nodes with smallest frequencies
- **Where asked:** Google, System Design discussions
- **Time:** O(n log n)

## Dijkstra's Algorithm
- **What:** Shortest path in weighted graph (non-negative weights)
- **Greedy choice:** Always expand the closest unvisited vertex
- **Where asked:** Google, Uber, Lyft
- **Note:** This is greedy! Each step picks the globally closest unvisited node.

## Kruskal's / Prim's MST
- **What:** Minimum Spanning Tree
- **Greedy choice:** 
  - Kruskal: Add smallest edge that doesn't create cycle
  - Prim: Add smallest edge connecting tree to non-tree vertex
- **Where asked:** Google, Amazon (network design problems)

## Fractional Knapsack
- **What:** Fill knapsack to maximize value (can take fractions)
- **Greedy choice:** Take items in order of value/weight ratio
- **Why it works:** No constraint on taking whole items
- **Contrast:** 0/1 Knapsack requires DP

## Job Sequencing with Deadlines
- **What:** Schedule jobs to maximize profit, each has deadline
- **Greedy choice:** Sort by profit, schedule each in latest available slot before deadline
- **Where asked:** Amazon

---

# FAANG Company-Specific Problem Focus

## Google
- Interval problems (Meeting Rooms, Merge Intervals)
- Line sweep problems
- Greedy + Binary Search combinations
- String manipulation (Remove Duplicate Letters)
- **Frequently Asked:** Jump Game II, Task Scheduler, Remove K Digits

## Amazon
- Stock trading problems
- Greedy scheduling (Job Sequencing)
- Two-pass problems (Candy)
- Priority queue greedy
- **Frequently Asked:** Gas Station, Best Time to Buy/Sell Stock, Candy

## Meta (Facebook)
- String greedy (Reorganize String)
- Interval scheduling
- Heap-based greedy
- **Frequently Asked:** Task Scheduler, Reorganize String, Meeting Rooms II

## Microsoft
- Two-pointer greedy
- Array manipulation
- Simulation greedy
- **Frequently Asked:** Container With Most Water, Jump Game

## Apple
- Optimization problems
- Greedy + DP hybrid decisions
- **Frequently Asked:** Gas Station, Best Time to Buy/Sell Stock II

---

# When Greedy FAILS: Counterexamples to Know

Understanding when greedy fails is just as important as knowing when it works.

## Classic Counterexamples

### 1. Coin Change (Arbitrary Denominations)
```
Coins: [1, 3, 4], Amount: 6
Greedy: 4 + 1 + 1 = 3 coins
Optimal: 3 + 3 = 2 coins

Why: Greedy picks largest first, but smaller coins combine better
Fix: Use DP
```

### 2. 0/1 Knapsack
```
Items: [(weight=10, value=60), (weight=20, value=100), (weight=30, value=120)]
Capacity: 50, Greedy by ratio: 60/10=6, 100/20=5, 120/30=4
Greedy picks: item1 + item2 = 160 (weight=30)
Optimal: item2 + item3 = 220 (weight=50)

Why: Taking best ratio item blocks better combinations
Fix: Use DP
```

### 3. Longest Increasing Subsequence
```
Array: [3, 1, 2, 8, 4, 5]
Greedy (always take next larger): 3 -> 8 (length 2)
Optimal: 1 -> 2 -> 4 -> 5 (length 4)

Why: Greedy commits too early; smaller values enable longer subsequences
Fix: Use DP or binary search
```

### 4. Weighted Interval Scheduling
```
Intervals with weights: [(1,4,w=3), (2,6,w=5), (5,7,w=2)]
Greedy by end time: picks (1,4), (5,7) = weight 5
Optimal: picks (2,6) alone = weight 5, OR different combination

Why: Weights change the calculus; earliest end might have low weight
Fix: Use DP with binary search
```

### 5. Matrix Chain Multiplication
```
Greedy doesn't work at all - must try all orderings
Fix: Interval DP
```

## The "Greedy Fails" Checklist

Before using greedy, check if any of these apply:
- [ ] Choices have dependencies (taking A affects value of B)
- [ ] Problem has 0/1 constraints (can't take fractions/partial)
- [ ] Items have multiple attributes (weight AND value)
- [ ] Order of operations matters (matrix multiplication)
- [ ] Need to count ALL solutions (not just find one)
- [ ] Local optimal demonstrably differs from global optimal

---

# Edge Case Checklist for Greedy

## Universal Greedy Edge Cases

- [ ] **Empty input**: `[]`, `n = 0`
- [ ] **Single element**: `[x]`, `n = 1`
- [ ] **All same values**: `[5, 5, 5, 5]`
- [ ] **Already optimal**: input requires no changes
- [ ] **Worst case**: maximum work required
- [ ] **Greedy fails**: verify greedy actually works for this problem type

## Pattern-Specific Edge Cases

### Interval Scheduling:
- [ ] All intervals overlap (return 1 or n-1 removals)
- [ ] No intervals overlap (return all)
- [ ] Touching intervals: `[[1,2], [2,3]]` (usually not overlapping)
- [ ] Nested intervals: `[[1,10], [2,3]]`
- [ ] Single interval
- [ ] **Identical intervals**: `[[1,2], [1,2], [1,2]]` (trips up counting logic)

### Jump Game:
- [ ] Single element (already at end): return true / 0 jumps
- [ ] Zero at index 0: `[0, ...]` (stuck immediately)
- [ ] All zeros except first: `[n, 0, 0, ..., 0]`
- [ ] Can overshoot: `[5, 0, 0, 0, 0]`
- [ ] Exactly reach end: `[1, 1, 1, 1]`

### Stock Trading:
- [ ] Prices always increase: buy first, sell last
- [ ] Prices always decrease: don't trade (profit = 0)
- [ ] Single price: can't trade
- [ ] Two prices: one transaction max

### Two-Pointer:
- [ ] Two elements: minimum case
- [ ] All same height/value
- [ ] Sorted vs unsorted input
- [ ] Symmetric input

### Gas Station:
- [ ] Single station: check if gas[0] >= cost[0]
- [ ] All stations have excess: start anywhere
- [ ] Total gas < total cost: impossible
- [ ] Only one valid starting point

---

# Follow-up Questions for Greedy

## Activity Selection / Interval Scheduling Follow-ups

| Original Problem | Common Follow-up | How to Handle |
|-----------------|------------------|---------------|
| Max non-overlapping | "Return the actual intervals selected?" | Track selections during greedy |
| Max non-overlapping | "What if intervals have weights?" | Becomes Weighted Interval Scheduling (DP) |
| Min arrows | "What if balloons have different sizes?" | Still greedy, sort by end |
| Meeting rooms count | "Which meetings go in which room?" | Track room assignments with heap |

## Jump Game Follow-ups

| Original Problem | Common Follow-up | How to Handle |
|-----------------|------------------|---------------|
| Can reach end | "Return the path?" | Track parent pointers or BFS |
| Min jumps | "What if you can also jump backward?" | BFS (greedy won't work) |
| Min jumps | "What if each jump has a cost?" | DP or Dijkstra |
| Min jumps | "Count number of ways to reach end?" | DP (greedy gives one path) |

## Stock Trading Follow-ups

| Original Problem | Common Follow-up | How to Handle |
|-----------------|------------------|---------------|
| Single transaction | "Unlimited transactions?" | Sum all positive differences |
| Unlimited transactions | "Max 2 transactions?" | DP with transaction state |
| Unlimited transactions | "With cooldown period?" | Multi-state DP |
| Unlimited transactions | "With transaction fee?" | Greedy or DP |

## Two-Pointer Greedy Follow-ups

| Original Problem | Common Follow-up | How to Handle |
|-----------------|------------------|---------------|
| Container water | "What if there are obstacles?" | Modified two-pointer |
| Boats to save | "What if boats have different capacities?" | Sort both, match greedily |
| Boats to save | "Minimize total weight per boat?" | Bin packing (NP-hard, use approximation) |

## General Greedy Follow-ups

| Follow-up Type | How to Handle |
|----------------|---------------|
| "Can you prove greedy is optimal?" | Exchange argument or greedy-stays-ahead |
| "What if greedy doesn't work?" | Try DP or explain the counterexample |
| "Can you do it in-place?" | Often yes for greedy (O(1) extra space) |
| "What if input is streaming?" | Online greedy algorithms |

---

# Interview Communication for Greedy

Add this section after the introduction:

## The UMPIRE Method for Greedy Problems

### Understand
> "Let me make sure I understand. We have [input description]. We need to [find/minimize/maximize] [goal]. Are there any constraints like [common constraint]?"

### Match
> "This looks like a greedy problem because [reason]. The key insight is [greedy choice]."

### Plan

**For Interval Scheduling:**
> "I'll sort intervals by end time. Then iterate through and greedily select each interval that doesn't conflict with the last selected one. This works because finishing early leaves maximum room for future intervals."

**For Jump Game:**
> "I'll track the maximum reachable position as I scan the array. If at any point my current index exceeds the maximum reach, I'm stuck. This is greedy because we always want to extend our reach as far as possible."

**For Stock Trading:**
> "I'll track the minimum price seen so far. At each day, I calculate the profit if I sell today and update my maximum profit. This works because we always want to buy at the lowest possible price."

**For Two-Pointer:**
> "I'll use two pointers starting from both ends. At each step, I'll move the pointer that gives less potential benefit. This is greedy because we're always trying to improve our current solution."

**For Heap-Based Greedy (Priority Queue Signal):**
> "I notice that while iterating, I need to continuously access the dynamic minimum/maximum from a changing set of candidates. This signals a Priority Queue.
>
> For example, in Meeting Rooms II, as I process each meeting, I need to know if any room is available (the one that ends earliest). A min-heap tracking room end times lets me check this in O(log n)."

**When to recognize Heap is needed:**
- You need the "best" (min/max) from a set that changes as you iterate
- Sorting once isn't enough because new elements become valid mid-iteration
- Keywords: "minimum resources at any time", "always pick the most/least frequent", "schedule optimally"

### Implement
Write clean, commented code.

### Review
Trace through an example:
> "Let me trace through [example]. [Step-by-step trace showing greedy choices]."

### Evaluate
> "Time complexity is O([X]) because [reason].
> Space complexity is O([Y]) because [reason].
> This greedy approach works because [brief proof or intuition]."

---

# Checkpoint Questions for Greedy

Add after key concepts:

## After "Greedy-Choice Property" (Section 2)

> **Quick Check:** Why does greedy work for Activity Selection but NOT for 0/1 Knapsack?
>
> <details>
> <summary>Think first, then click</summary>
>
> **Activity Selection:** Choosing the activity that ends earliest leaves maximum room for other activities. Any other choice can only do worse or equal.
>
> **0/1 Knapsack:** Taking the item with best value/weight ratio might fill up capacity with one heavy item, blocking multiple lighter items that together give more value. Counterexample: items [(weight=10, value=60), (weight=20, value=100), (weight=30, value=120)], capacity=50. Greedy by ratio takes first two items (value=160), but optimal is items 2+3 (value=220).
> </details>

## After "Sort by End Time" (Section 3)

> **Quick Check:** Why do we sort by END time (not start time) for maximum non-overlapping intervals?
>
> <details>
> <summary>Think first, then click</summary>
>
> Sorting by end time is greedy: pick the interval that finishes earliest.
>
> This leaves the maximum room for future intervals. If you sorted by start time, you might pick a long interval that blocks many shorter ones.
>
> Example: [[1,10], [2,3], [4,5]]
> - Sort by start: pick [1,10], blocks everything. Count = 1.
> - Sort by end: pick [2,3], then [4,5]. Count = 2. ✓
> </details>

## After "Jump Game Max Reach" (Section 4)

> **Quick Check:** In Jump Game II (minimum jumps), why do we only increment jumps when `i == currentEnd`?
>
> <details>
> <summary>Think first, then click</summary>
>
> Think of it like BFS levels. `currentEnd` marks the boundary of positions reachable with the current number of jumps. When we reach this boundary, we MUST jump to continue.
>
> We don't increment earlier because we might find a better launching position before reaching the boundary. We track `farthest` to remember the best option.
>
> Example: [2, 3, 1, 1, 4]
> - Initially: currentEnd=0, farthest=0, jumps=0
> - i=0: farthest=2, i==currentEnd, jump! currentEnd=2, jumps=1
> - i=1: farthest=4, i<currentEnd, no jump yet
> - i=2: farthest=4, i==currentEnd, jump! currentEnd=4, jumps=2
> - i=3: We can stop (farthest >= n-1)
> </details>

## After "Two-Pointer Greedy" (Section 10)

> **Quick Check:** In Container With Most Water, why do we always move the pointer at the shorter line?
>
> <details>
> <summary>Think first, then click</summary>
>
> Area = min(height[left], height[right]) × width
>
> If we move the taller pointer, width decreases and min height can only stay same or decrease. Area can only decrease!
>
> If we move the shorter pointer, width decreases but min height might increase. Area COULD increase.
>
> So moving the shorter pointer is the only way to potentially improve. This is the greedy choice.
> </details>

## After "Gas Station" (Section 9)

> **Quick Check:** If we fail at station j starting from station i, why can we skip stations i+1 to j as potential starting points?
>
> <details>
> <summary>Think first, then click</summary>
>
> If we start at i and fail at j, it means:
> - We had non-negative tank at every station from i to j-1
> - We went negative at j
>
> For any station k between i and j:
> - Starting at i, we reached k with some fuel >= 0
> - If we start fresh at k with 0 fuel, we have LESS fuel than before
> - Since we failed at j with MORE fuel, we'll definitely fail with less
>
> So stations i+1 to j cannot be valid starting points.
> </details>

---

# Complexity Derivations for Greedy

## Activity Selection: O(n log n)

**Claim:** Maximum non-overlapping intervals is O(n log n) time, O(1) space.

**Why:**
1. Sorting n intervals: O(n log n)
2. Single pass through sorted intervals: O(n)
3. Each interval is examined exactly once
4. Only track one variable (lastEnd): O(1) space

**Total:** O(n log n) + O(n) = O(n log n)

## Jump Game: O(n)

**Claim:** Jump Game I is O(n) time, O(1) space.

**Why:**
1. Single pass through array: O(n)
2. Each element visited exactly once
3. Constant operations per element (max, comparison)
4. Only track one variable (maxReach): O(1) space

**Total:** O(n)

## Why Greedy is Often Faster Than DP

**Key Insight:** Greedy makes ONE choice at each step; DP explores ALL choices.

| Problem Type | Greedy | DP |
|--------------|--------|-----|
| Activity Selection | O(n log n) | O(n log n) or O(n²) |
| 0/1 Knapsack | N/A (fails) | O(n × W) |
| Coin Change | O(n) if canonical | O(n × amount) |
| Jump Game | O(n) | O(n²) |

**When Greedy = Optimal:**
- Single choice at each step, no backtracking
- Proof: exchange argument or greedy-stays-ahead
- Time: Usually O(n) or O(n log n)

---

# Pattern Comparison: Greedy vs Alternatives

## When to Use Greedy vs DP vs Other

| Decision Factor | Greedy | DP | Backtracking |
|-----------------|--------|-----|--------------|
| Makes choice | One best | All options | All with pruning |
| Reconsiders | Never | Via subproblems | Yes (backtracks) |
| Time | Usually O(n log n) | O(n²) to O(n × W) | Exponential |
| Proves optimal | Exchange argument | Bellman equation | Exhaustive search |
| Fails when | No greedy-choice property | No overlapping subproblems | Too many states |

## Greedy vs DP Decision Tree

```
Does problem have greedy-choice property?
├── YES → Can I prove local optimal = global optimal?
│   ├── YES → Use Greedy
│   └── UNSURE → Try examples, if counterexample found → Use DP
└── NO → Does problem have overlapping subproblems?
    ├── YES → Use DP
    └── NO → Use simple recursion or iteration
```

## Common Mistakes in Pattern Choice

| Problem | Wrong Approach | Correct Approach | Why |
|---------|----------------|------------------|-----|
| 0/1 Knapsack | Greedy by ratio | DP | Taking best ratio might block better combinations |
| Coin Change (arbitrary) | Greedy by largest | DP | [1,3,4], amount=6: greedy=4+1+1=3, optimal=3+3=2 |
| Weighted Intervals | Greedy by end | DP | Weights change the optimal selection |
| Jump Game | DP | Greedy | Overlapping, but greedy-choice property holds |
| Activity Selection | DP | Greedy | Simpler and equally optimal |

---

# Difficulty Progression for Greedy

Reorder problems and add difficulty labels:

## Easy
1. **Best Time to Buy and Sell Stock** - Running minimum, single pass
2. **Lemonade Change** - Simple greedy simulation
3. **Assign Cookies** - Sort both, greedy matching
4. **Jump Game** - Track max reach

## Medium
5. **Maximum Subarray** - Kadane's algorithm, extend or start fresh
6. **Jump Game II** - BFS-like level tracking
7. **Gas Station** - Circular greedy insight
8. **Non-overlapping Intervals** - Sort by end, count
9. **Merge Intervals** - Sort by start, extend
10. **Container With Most Water** - Two-pointer greedy
11. **Boats to Save People** - Sort, two-pointer pairing
12. **Partition Labels** - Track last occurrence
13. **Queue Reconstruction by Height** - Sort DESC, insert
14. **Hand of Straights** - Greedy with frequency map
15. **Merge Triplets to Form Target Triplet** - Greedy verification
16. **Valid Parenthesis String** - Range tracking [low, high]

## Medium-Hard
17. **Task Scheduler** - Frequency counting or heap
18. **Reorganize String** - Heap-based greedy
19. **Minimum Number of Arrows** - Interval scheduling variant
20. **Best Time to Buy and Sell Stock II** - Capture all gains

## Hard
21. **Candy** - Two-pass greedy
22. **Create Maximum Number** - Monotonic stack + merge
23. **IPO** - Two heaps greedy
24. **Minimum Cost to Hire K Workers** - Ratio sorting + heap

---

# Visualizer Integration

**CRITICAL: Link the 5+ existing visualizers!**

Update tutorial sections with visualizer references:

```json
{
  "title": "The Classic Example: Activity Selection",
  "content": "...",
  "visualizer": "ActivitySelectionVisualizer",
  "code": { "java": "...", "javascript": "..." }
}
```

| Section | Add Visualizer |
|---------|----------------|
| Section 3: Activity Selection | `ActivitySelectionVisualizer` |
| Section 4: Jump Game (Can Jump) | `JumpGameVisualizer` |
| Section 5: Jump Game II (Min Jumps) | `JumpGameVisualizer` |
| Section 10: Boats to Save People | `ContainerWaterVisualizer` (similar pattern) |
| Heap-Based Greedy variation | `TaskSchedulerVisualizer` |
| Heap-Based Greedy variation | `ReorganizeStringVisualizer` |
| Interval Scheduling | `MinimumArrowsVisualizer` |

---

# Dry-Run Trace Tables

Convert existing ASCII traces to formal tables:

## Activity Selection Trace

Input: Activities with (start, end): [(1,4), (3,5), (0,6), (5,7), (3,9), (5,9), (6,10), (8,11)]

| Step | Current | End Time | Last Selected End | Overlap? | Action | Selected Count |
|------|---------|----------|-------------------|----------|--------|----------------|
| sort | - | - | - | - | Sort by end time | 0 |
| 1 | (1,4) | 4 | -∞ | No | SELECT, lastEnd=4 | 1 |
| 2 | (3,5) | 5 | 4 | 3<4 Yes | Skip | 1 |
| 3 | (0,6) | 6 | 4 | 0<4 Yes | Skip | 1 |
| 4 | (5,7) | 7 | 4 | 5≥4 No | SELECT, lastEnd=7 | 2 |
| 5 | (3,9) | 9 | 7 | 3<7 Yes | Skip | 2 |
| 6 | (5,9) | 9 | 7 | 5<7 Yes | Skip | 2 |
| 7 | (6,10) | 10 | 7 | 6<7 Yes | Skip | 2 |
| 8 | (8,11) | 11 | 7 | 8≥7 No | SELECT, lastEnd=11 | 3 |

**Result:** 3 activities selected: (1,4), (5,7), (8,11)

## Jump Game Trace

Input: nums = [2, 3, 1, 1, 4]

| Step | Index | nums[i] | maxReach Before | i > maxReach? | New maxReach | Result |
|------|-------|---------|-----------------|---------------|--------------|--------|
| init | - | - | 0 | - | - | - |
| 1 | 0 | 2 | 0 | 0>0? No | max(0, 0+2)=2 | Continue |
| 2 | 1 | 3 | 2 | 1>2? No | max(2, 1+3)=4 | Continue |
| 3 | 2 | 1 | 4 | 2>4? No | max(4, 2+1)=4 | Continue |
| 4 | 3 | 1 | 4 | 3>4? No | max(4, 3+1)=4 | Continue |
| done | - | - | 4 | 4≥4? Yes | - | **Can reach!** |

## Jump Game II (Min Jumps) Trace

Input: nums = [2, 3, 1, 1, 4]

| Step | i | nums[i] | farthest | currentEnd | i==currentEnd? | jumps | Action |
|------|---|---------|----------|------------|----------------|-------|--------|
| init | - | - | 0 | 0 | - | 0 | Initialize |
| 1 | 0 | 2 | max(0,0+2)=2 | 0 | Yes | 1 | JUMP! currentEnd=2 |
| 2 | 1 | 3 | max(2,1+3)=4 | 2 | No | 1 | Extend farthest |
| 3 | 2 | 1 | max(4,2+1)=4 | 2 | Yes | 2 | JUMP! currentEnd=4 |
| 4 | 3 | 1 | max(4,3+1)=4 | 4 | No | 2 | Reached end zone |

**Result:** 2 jumps

## Gas Station Trace

Input: gas = [1, 2, 3, 4, 5], cost = [3, 4, 5, 1, 2]

| Step | i | gas[i] | cost[i] | net | currentTank | totalTank | currentTank<0? | start |
|------|---|--------|---------|-----|-------------|-----------|----------------|-------|
| init | - | - | - | - | 0 | 0 | - | 0 |
| 1 | 0 | 1 | 3 | -2 | -2 | -2 | Yes | 1 |
| 2 | 1 | 2 | 4 | -2 | -2 | -4 | Yes | 2 |
| 3 | 2 | 3 | 5 | -2 | -2 | -6 | Yes | 3 |
| 4 | 3 | 4 | 1 | +3 | 3 | -3 | No | 3 |
| 5 | 4 | 5 | 2 | +3 | 6 | 0 | No | 3 |

**Result:** totalTank=0 ≥ 0, so solution exists. Start at station 3.

## Maximum Subarray (Kadane's) Trace

Input: nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]

| Step | i | nums[i] | currentSum Before | Decision | currentSum After | maxSum |
|------|---|---------|-------------------|----------|------------------|--------|
| init | - | - | - | - | -2 | -2 |
| 1 | 1 | 1 | -2 | -2+1=-1 < 1, start fresh | 1 | 1 |
| 2 | 2 | -3 | 1 | 1+(-3)=-2 > -3, extend | -2 | 1 |
| 3 | 3 | 4 | -2 | -2+4=2 < 4, start fresh | 4 | 4 |
| 4 | 4 | -1 | 4 | 4+(-1)=3 > -1, extend | 3 | 4 |
| 5 | 5 | 2 | 3 | 3+2=5 > 2, extend | 5 | 5 |
| 6 | 6 | 1 | 5 | 5+1=6 > 1, extend | 6 | **6** |
| 7 | 7 | -5 | 6 | 6+(-5)=1 > -5, extend | 1 | 6 |
| 8 | 8 | 4 | 1 | 1+4=5 > 4, extend | 5 | 6 |

**Result:** Maximum subarray sum = 6, subarray is [4, -1, 2, 1]

## Valid Parenthesis String Trace

Input: s = "(*))"

| Step | i | char | low Before | high Before | Action | low After | high After | Valid? |
|------|---|------|------------|-------------|--------|-----------|------------|--------|
| init | - | - | 0 | 0 | Initialize | 0 | 0 | ✓ |
| 1 | 0 | '(' | 0 | 0 | Open paren | 1 | 1 | ✓ |
| 2 | 1 | '*' | 1 | 1 | Wildcard: low--, high++ | max(0,0)=0 | 2 | ✓ |
| 3 | 2 | ')' | 0 | 2 | Close paren | max(-1,0)=0 | 1 | ✓ |
| 4 | 3 | ')' | 0 | 1 | Close paren | max(-1,0)=0 | 0 | ✓ |

**Result:** low=0, so string CAN be valid. (* can be treated as '(' to balance)

## Partition Labels Trace

Input: s = "ababcbacadefegdehijhklij"

| Step | i | char | lastIndex[char] | end Before | end After | i==end? | Action |
|------|---|------|-----------------|------------|-----------|---------|--------|
| pre | - | - | a:8,b:5,c:7,d:14,e:15,f:11,g:13,h:19,i:22,j:23,k:20,l:21 | - | - | - | Precompute |
| 1 | 0 | 'a' | 8 | 0 | 8 | No | Extend to 8 |
| 2 | 1 | 'b' | 5 | 8 | 8 | No | Stay at 8 |
| ... | ... | ... | ... | ... | ... | ... | ... |
| 9 | 8 | 'a' | 8 | 8 | 8 | **Yes** | Partition! Size=9 |
| 10 | 9 | 'd' | 14 | 9 | 14 | No | New partition starts |
| ... | ... | ... | ... | ... | ... | ... | ... |
| 16 | 15 | 'e' | 15 | 15 | 15 | **Yes** | Partition! Size=7 |
| 17 | 16 | 'h' | 19 | 16 | 19 | No | New partition starts |
| ... | ... | ... | ... | ... | ... | ... | ... |
| 24 | 23 | 'j' | 23 | 23 | 23 | **Yes** | Partition! Size=8 |

**Result:** Partitions = [9, 7, 8] ("ababcbaca", "defegde", "hijhklij")

---

# Review Checklist for Greedy Pattern

Before finalizing, verify:

## Content Completeness
- [ ] Section 1 has "What You'll Learn" objectives
- [ ] Input constraint mapping table added
- [ ] Follow-up questions for each problem type (12 sub-patterns)
- [ ] Edge case checklist expanded and formalized
- [ ] Interview communication (UMPIRE) scripts for main sub-patterns
- [ ] Checkpoint questions after key concepts (5+ questions)

## Visualizations
- [ ] `ActivitySelectionVisualizer` linked to Section 3
- [ ] `JumpGameVisualizer` linked to Sections 4-5
- [ ] `ContainerWaterVisualizer` linked to Two-Pointer section
- [ ] `TaskSchedulerVisualizer` linked to Heap variation
- [ ] `MinimumArrowsVisualizer` linked to Interval section
- [ ] Dry-run trace tables formalized (4+ tables)

## Teaching Quality
- [ ] Complexity derivations added (not just stated)
- [ ] Pattern comparison matrix (Greedy vs DP) complete
- [ ] Problems ordered by difficulty (Easy → Medium → Hard)
- [ ] Common mistakes section expanded with code examples
- [ ] Proof techniques explained (exchange argument, greedy-stays-ahead)

## Code Quality
- [ ] All sections have Java + JavaScript
- [ ] No unused variables
- [ ] Edge cases handled in code comments
- [ ] Consistent naming

## Structure
- [ ] JSON validates
- [ ] Lint passes
- [ ] Test visualizers in browser

---

# Implementation Priority

## Phase 1: Critical (Do First)
1. **Link all 5+ visualizers** - Zero visualizers linked is unacceptable
2. Add "What You'll Learn" to Section 1
3. Add input constraint mapping table

## Phase 2: High Value
4. Add checkpoint questions (5+ minimum)
5. Add follow-up questions for each sub-pattern
6. Expand edge case checklist by sub-pattern
7. Add UMPIRE communication scripts for main patterns

## Phase 3: Polish
8. Add complexity derivations with proofs
9. Convert ASCII traces to formal tables
10. Expand Greedy vs DP comparison section
11. Reorder problems by difficulty
12. Add proof technique explanations

---

# Final Deliverable

After implementing all improvements:

1. All 6+ visualizers linked
2. 5+ checkpoint questions
3. Follow-up questions for 12 sub-patterns
4. Complete edge case checklist by pattern
5. UMPIRE scripts for main greedy approaches
6. Constraint mapping table
7. 7+ formal trace tables (Activity Selection, Jump Game I/II, Gas Station, Maximum Subarray, Valid Parenthesis String, Partition Labels)
8. Complexity derivations with intuition

The Greedy pattern should become the best greedy algorithms learning resource online, matching the quality of the DP pattern while clearly differentiating when greedy works vs when DP is needed.

---

# Problems Covered in This Prompt

All problems from the current Greedy pattern in the app:

| Problem | Sub-Pattern | Section |
|---------|-------------|---------|
| **Maximum Subarray** | Kadane's Algorithm | Sub-pattern 1 |
| **Jump Game** | Maximum Reach Tracking | Sub-pattern 3 |
| **Jump Game II** | Maximum Reach Tracking | Sub-pattern 3 |
| **Gas Station** | Circular Array Greedy | Sub-pattern 7 |
| **Hand of Straights** | Greedy with HashMap | Sub-pattern 10 |
| **Merge Triplets to Form Target Triplet** | Greedy Verification | Sub-pattern 11 |
| **Partition Labels** | Last Occurrence Greedy | Sub-pattern 9 |
| **Valid Parenthesis String** | Range Tracking Greedy | Sub-pattern 12 |

---

# Complete FAANG Greedy Problem List (50+ Problems)

## Tier 1: Must Know (Asked Frequently)

| Problem | LeetCode # | Difficulty | Companies | Sub-Pattern |
|---------|-----------|------------|-----------|-------------|
| Jump Game | 55 | Medium | Amazon, Microsoft | Max Reach |
| Jump Game II | 45 | Medium | Amazon, Google | Max Reach + BFS |
| Gas Station | 134 | Medium | Amazon, Apple | Circular Greedy |
| Best Time to Buy and Sell Stock | 121 | Easy | All FAANG | Running Min |
| Best Time to Buy and Sell Stock II | 122 | Medium | All FAANG | Sum Gains |
| Maximum Subarray | 53 | Medium | All FAANG | Kadane's |
| Container With Most Water | 11 | Medium | Amazon, Google | Two-Pointer |
| Merge Intervals | 56 | Medium | All FAANG | Sort by Start |
| Non-overlapping Intervals | 435 | Medium | Google, Facebook | Sort by End |
| Meeting Rooms II | 253 | Medium | Facebook, Google | Line Sweep |
| Task Scheduler | 621 | Medium | Facebook, Microsoft | Heap Greedy |
| Partition Labels | 763 | Medium | Amazon | Last Occurrence |

## Tier 2: Commonly Asked

| Problem | LeetCode # | Difficulty | Companies | Sub-Pattern |
|---------|-----------|------------|-----------|-------------|
| Candy | 135 | Hard | Google, Amazon | Two-Pass |
| Remove K Digits | 402 | Medium | Google, Amazon | Monotonic Stack |
| Reorganize String | 767 | Medium | Facebook, Google | Heap Greedy |
| Queue Reconstruction by Height | 406 | Medium | Google | Greedy Reconstruction |
| Minimum Number of Arrows | 452 | Medium | Facebook | Interval Scheduling |
| Insert Interval | 57 | Medium | Google, LinkedIn | Interval Merge |
| Boats to Save People | 881 | Medium | Google | Two-Pointer |
| Valid Parenthesis String | 678 | Medium | Amazon | Range Tracking |
| Assign Cookies | 455 | Easy | Microsoft | Two-Pointer |
| Lemonade Change | 860 | Easy | Amazon | Simulation |
| Car Pooling | 1094 | Medium | Uber, Lyft | Line Sweep |
| IPO | 502 | Hard | LinkedIn, Amazon | Two Heaps |

## Tier 3: Advanced / Less Common

| Problem | LeetCode # | Difficulty | Companies | Sub-Pattern |
|---------|-----------|------------|-----------|-------------|
| Create Maximum Number | 321 | Hard | Google | Monotonic Stack |
| Remove Duplicate Letters | 316 | Medium | Facebook | Monotonic Stack |
| Wiggle Subsequence | 376 | Medium | Amazon | State Tracking |
| Minimum Cost to Hire K Workers | 857 | Hard | Google | Ratio + Heap |
| Advantage Shuffle | 870 | Medium | Google | Sort + Match |
| Bag of Tokens | 948 | Medium | Amazon | Two-Pointer |
| Divide Array in K Consecutive | 1296 | Medium | Amazon | HashMap Groups |
| Hand of Straights | 846 | Medium | Google | HashMap Groups |
| Split Array into Consecutive | 659 | Medium | Google | HashMap Groups |
| Minimum Swaps for Bracket | 1963 | Medium | Amazon | Balance Tracking |
| Smallest String with Swaps | 1202 | Medium | Amazon | Union-Find + Greedy |
| Trapping Rain Water | 42 | Hard | All FAANG | Two-Pointer/Stack |

## Tier 4: System Design Related

| Algorithm | Use Case | Companies |
|-----------|----------|-----------|
| Huffman Coding | Data compression | Google, Netflix |
| Dijkstra's Algorithm | Maps, routing | Google, Uber |
| Kruskal's/Prim's MST | Network design | Amazon, Google |
| Job Scheduling | Task orchestration | Amazon, Microsoft |
| Fractional Knapsack | Resource allocation | All |

---

# FAANG Interview Communication Scripts

## The 30-Second Pattern Recognition Speech

When you identify a greedy problem, say:

> "This looks like a greedy problem. I can see that [specific signal - e.g., 'we need to maximize non-overlapping intervals' or 'we're tracking a running maximum']. 
> 
> The greedy insight is [one sentence - e.g., 'finishing early leaves room for more activities' or 'we should always extend our reach as far as possible'].
> 
> Let me verify this works with a quick example... [trace through small example]
> 
> I'll now code this up."

## Proving Correctness (When Asked)

### Exchange Argument Script:
> "I'll use an exchange argument to prove correctness.
> 
> Assume there's an optimal solution that differs from greedy's first choice. 
> 
> If I swap the optimal's first choice with greedy's first choice, the solution either stays the same or improves because [specific reason].
> 
> Therefore, greedy's choice is at least as good as any alternative, and we can apply this reasoning inductively."

### Greedy Stays Ahead Script:
> "I'll show that greedy stays ahead at every step.
> 
> At step k, greedy has made k choices. I claim these k choices are at least as good as any k choices from the optimal solution.
> 
> Base case: greedy's first choice [reason why it's optimal or tied for optimal].
> 
> Inductive step: assuming greedy is ahead after k-1 steps, step k maintains or extends the lead because [reason]."

## Handling "Why Not DP?" Questions

> "DP would work but is overkill here. The key observation is that the greedy choice at each step doesn't affect future choices - once we [make this choice], the remaining problem is independent.
> 
> If [specific scenario where greedy fails - e.g., 'intervals had weights' or 'we needed to count all ways'], then yes, we'd need DP because past choices would affect future value."

## Time/Space Complexity Explanation

> "Time is O([complexity]) because [specific reason - e.g., 'we sort once in O(n log n) then scan once in O(n)'].
> 
> Space is O([complexity]) because [specific reason - e.g., 'we only track a constant number of variables' or 'the result array holds at most n intervals']."

---

# Red Flags: When Greedy is Wrong

## Instant Disqualifiers for Greedy

1. **"Count the number of ways"** → Almost always DP
2. **"Find all possible solutions"** → Backtracking
3. **Items have both weight AND value** → Usually DP (0/1 Knapsack)
4. **"With at most k transactions/uses"** → Multi-state DP
5. **Order of operations matters** → Interval DP

## When to Double-Check Your Greedy

- [ ] Does my greedy choice ever block a better solution later?
- [ ] Can I construct a counterexample?
- [ ] Does adding constraints (weights, limits) break it?
- [ ] Am I counting ways vs finding one way?

---

# Quick Reference: Greedy Problem Signals

| If You See... | Think... | Pattern |
|---------------|----------|---------|
| "Maximum non-overlapping" | Sort by END time | Interval Scheduling |
| "Merge overlapping" | Sort by START time | Interval Merge |
| "Can you reach the end" | Track max reach | Jump Game |
| "Minimum jumps to reach" | BFS-like levels | Jump Game II |
| "Best time to buy/sell" | Track running min | Stock Trading |
| "Maximum water/area" | Two pointers, move shorter | Container |
| "Pair items optimally" | Sort both, match | Assignment |
| "Minimum rooms/resources" | Line sweep or heap | Meeting Rooms |
| "Rearrange without adjacent same" | Heap with cooldown | Task Scheduler |
| "Partition into groups" | Track last occurrence | Partition Labels |
| "Form consecutive groups" | Frequency map | Hand of Straights |
| "Remove k to optimize" | Monotonic stack | Remove K Digits |
| "Satisfy both directions" | Two-pass | Candy |
| "Circular route" | Track total and current | Gas Station |
| "Course prerequisites/dependencies" | Topological sort (Kahn's) | Greedy on Graphs |
| "Dynamic min/max while iterating" | Priority Queue (Heap) | Heap-Based Greedy |
| "Lexicographically smallest/largest" | Monotonic stack + greedy | String Building |

---

# Final Checklist for FAANG-Ready Greedy Pattern

## Content Must-Haves
- [ ] 19 sub-patterns fully documented (12 core + 7 advanced)
- [ ] 50+ problems categorized by tier
- [ ] Company-specific focus areas
- [ ] Counterexamples for when greedy fails
- [ ] Interview communication scripts
- [ ] Proof techniques (exchange argument, greedy stays ahead)
- [ ] Priority Queue identification heuristic

## Teaching Quality
- [ ] Build intuition before algorithm
- [ ] Explain WHY greedy works for each pattern
- [ ] Show WHY greedy fails for related DP problems
- [ ] Trace tables for all major patterns
- [ ] Checkpoint questions to verify understanding

## Interview Readiness
- [ ] 30-second pattern recognition speech
- [ ] Complexity explanation scripts
- [ ] "Why not DP?" response prepared
- [ ] Red flags for greedy misuse
- [ ] Quick reference signal table

The goal: A student should be able to solve ANY greedy problem asked at a FAANG interview after studying this pattern thoroughly.

---

# Execution Instructions (For LLM/AI Assistants)

**IMPORTANT:** This prompt is comprehensive (~1500 lines). To avoid output truncation or "lost in the middle" issues, do NOT generate the entire `patterns.json` update in one response.

## Phased Execution Directive

Execute this prompt in phases:

**Phase 1: Foundation**
- Update Section 1 (Introduction) with "What You'll Learn" objectives
- Add input constraint mapping table
- Integrate `ActivitySelectionVisualizer` and `JumpGameVisualizer`
- Stop and ask to continue

**Phase 2: Core Patterns (1-6)**
- Update Kadane's Algorithm section
- Update Interval Scheduling section  
- Update Jump Game sections (I and II)
- Update Running Min/Max section
- Update Two-Pointer Greedy section
- Update Heap-Based Greedy section
- Stop and ask to continue

**Phase 3: Core Patterns (7-12)**
- Update Circular Array Greedy section
- Update Greedy Reconstruction section
- Update Last Occurrence Greedy section
- Update Greedy with HashMap section
- Update Greedy Verification section
- Update Range Tracking Greedy section
- Stop and ask to continue

**Phase 4: Advanced Patterns (13-19)**
- Add Monotonic Stack Greedy section
- Add Two-Pass Greedy section
- Add Greedy + Binary Search section
- Add Line Sweep Greedy section
- Add Greedy String Building section
- Add Two Heaps section
- Add Greedy on Graphs section
- Stop and ask to continue

**Phase 5: Supporting Content**
- Add checkpoint questions (5+)
- Add follow-up questions tables
- Add edge case checklists
- Add UMPIRE communication scripts
- Add complexity derivations
- Stop and ask to continue

**Phase 6: Trace Tables & Final Polish**
- Add all dry-run trace tables
- Add "When Greedy Fails" counterexamples
- Add FAANG problem list
- Add Quick Reference signal table
- Validate JSON structure
- Final review

## Quality Gates Per Phase

Before moving to the next phase, verify:
- [ ] JSON is valid (no syntax errors)
- [ ] All code has both Java and JavaScript
- [ ] Visualizer references match actual component names
- [ ] No placeholder text like "[TODO]" or "[FILL IN]"

This phased approach ensures high-fidelity output for the detailed trace tables and UMPIRE scripts.
