# How I Stopped Memorizing LeetCode and Started Recognizing Patterns

*The mental framework that changed how I approach coding interviews.*

---

I used to solve problems the wrong way.

I'd grind LeetCode for hours, memorize solutions, and feel confident. Then I'd walk into an interview, see a slightly different problem, and freeze.

Sound familiar?

The turning point came when I stopped asking "How do I solve this?" and started asking **"What pattern does this problem fit?"**

This shift took me from struggling with mediums to solving hards in 20 minutes.

Here's exactly how I think about coding problems now.

---

## The Pattern Recognition Framework

Before I show you patterns, you need to understand how to recognize them. Here's my mental checklist:

### Step 1: Read the Constraints First (Not the Problem)

This is counterintuitive, but the constraints tell you which algorithms are even possible.

| Constraint | What It Tells You |
|------------|-------------------|
| `n ≤ 15` | Brute force is fine. Think backtracking, bitmask. |
| `n ≤ 100` | O(n³) works. Consider 3 nested loops. |
| `n ≤ 1,000` | O(n²) is acceptable. DP tables, nested loops. |
| `n ≤ 10,000` | O(n log n) needed. Sorting, binary search, heap. |
| `n ≤ 100,000` | O(n) or O(n log n). Single pass, two pointers. |
| `n ≤ 10^7` | O(n) max. Careful with constants. |
| `n > 10^7` | O(log n) or O(1). Math trick or binary search. |

**Example:** If n = 10^5 and you're thinking of a nested loop, stop. You need a smarter approach.

### Step 2: Identify the "Shape" of the Problem

| Shape | Pattern Direction |
|-------|-------------------|
| Linear sequence (array/string) | Two pointers, sliding window, DP |
| Grid/matrix | BFS, DFS, DP on grid |
| Tree structure | DFS, recursion, tree DP |
| Graph connections | BFS, DFS, Union-Find, topological sort |
| Choices at each step | DP, backtracking |
| Finding optimal | DP, greedy (if locally optimal = globally optimal) |

### Step 3: Look for Trigger Words

These words in problem statements are dead giveaways:

| Trigger Words | Almost Always Means |
|---------------|---------------------|
| "sorted array" | Binary search or two pointers |
| "contiguous subarray" | Sliding window or prefix sum |
| "all permutations/combinations" | Backtracking |
| "shortest path" | BFS (unweighted) or Dijkstra (weighted) |
| "number of ways" | DP |
| "maximum/minimum with constraint" | DP or binary search on answer |
| "connected components" | Union-Find or DFS |
| "dependencies/order" | Topological sort |
| "k largest/smallest" | Heap |
| "prefix/starts with" | Trie |

---

## The Patterns That Actually Matter

I'm not going to list 15 patterns with generic templates. Instead, here are the **7 patterns that solve 80% of problems**, with the specific insights that make them click.

---

## 1. The Shrinking Window

Most people learn sliding window wrong. They think it's about "maintaining a window." It's not.

**The real insight:** You're looking for the point where something becomes invalid, then you shrink until it's valid again.

**The pattern:**
```java
int left = 0;
int result = 0;

for (int right = 0; right < n; right++) {
    // Add arr[right] to your window state
    
    while (windowIsInvalid()) {
        // Remove arr[left] from window state
        left++;
    }
    
    // Window is now valid - update result
    result = Math.max(result, right - left + 1);
}
```

**The key question:** "What makes my window invalid?"

- For "longest substring without repeats" → a character appears twice
- For "minimum window substring" → we don't have all required characters
- For "max consecutive ones with k flips" → we used more than k flips

**When it clicks:** Stop thinking about "sliding." Think about expanding until you break something, then fixing it by shrinking.

---

## 2. Binary Search on the Answer

This is the most underrated pattern. Many "optimization" problems aren't about finding the answer directly—they're about checking if an answer works.

**The insight:** If you can answer "Is X a valid answer?" in O(n), you can find the optimal X in O(n log n).

**The pattern:**
```java
int lo = minPossible, hi = maxPossible;

while (lo < hi) {
    int mid = lo + (hi - lo) / 2;
    
    if (isValid(mid)) {
        hi = mid;      // mid works, try smaller
    } else {
        lo = mid + 1;  // mid doesn't work, need larger
    }
}

return lo;
```

**When to use it:** The problem asks for "minimum X such that..." or "maximum X that satisfies..."

**Classic examples:**
- Koko eating bananas: Binary search on eating speed
- Split array largest sum: Binary search on the largest sum
- Capacity to ship packages: Binary search on ship capacity

**The trick:** Don't solve the optimization problem. Solve the decision problem, then binary search.

---

## 3. The Two-State DP

Forget complex DP formulations. Most interview DP problems boil down to tracking two states.

**The insight:** At each position, you're either "in" something or "out" of it.

**Examples:**
- House Robber: `rob[i]` vs `skip[i]`
- Buy/Sell Stock: `holding[i]` vs `notHolding[i]`
- Paint House: `endWithRed[i]` vs `endWithBlue[i]` vs `endWithGreen[i]`

**The pattern:**
```java
int include = 0, exclude = 0;

for (int num : nums) {
    int newInclude = exclude + num;  // Must exclude previous to include current
    int newExclude = Math.max(include, exclude);  // Can come from either
    
    include = newInclude;
    exclude = newExclude;
}

return Math.max(include, exclude);
```

**When it clicks:** Stop thinking about `dp[i]`. Think about "What are the possible states I can be in at position i?"

---

## 4. The Parent Pointer (Union-Find)

Union-Find seems complex until you realize it's just "everyone points to their leader."

**The insight:** You're not grouping elements. You're answering "Who's your ultimate boss?"

**The pattern:**
```java
int[] parent;

int find(int x) {
    if (parent[x] != x) {
        parent[x] = find(parent[x]);  // Path compression: point directly to root
    }
    return parent[x];
}

void union(int x, int y) {
    int px = find(x), py = find(y);
    if (px != py) {
        parent[px] = py;  // Make one root point to the other
    }
}
```

**When to use:** 
- "Are X and Y connected?"
- "How many groups/components?"
- Anything involving merging sets dynamically

**The trick:** The magic is in `find()`. After path compression, every element points directly to its root. This makes subsequent operations nearly O(1).

---

## 5. The Level-by-Level BFS

BFS isn't just "visit neighbors." The power is in processing **one level at a time**.

**The insight:** Each level represents one "step" or "unit of distance."

**The pattern:**
```java
Queue<Node> queue = new LinkedList<>();
queue.offer(start);
int level = 0;

while (!queue.isEmpty()) {
    int size = queue.size();  // Freeze the current level size
    
    for (int i = 0; i < size; i++) {
        Node node = queue.poll();
        
        // Process node at this level
        if (isTarget(node)) return level;
        
        // Add neighbors for next level
        for (Node neighbor : node.neighbors) {
            queue.offer(neighbor);
        }
    }
    
    level++;  // Finished this level, move to next
}
```

**Why the size trick matters:** Without `int size = queue.size()`, you can't tell when one level ends and the next begins.

**Use it for:**
- Shortest path in unweighted graph
- Minimum operations/moves/steps
- Anything that spreads (rotting oranges, word ladder)

---

## 6. The Monotonic Stack

This pattern has one job: for each element, find the "next greater" or "previous smaller" element efficiently.

**The insight:** Maintain a stack where elements are always increasing (or decreasing). When a new element breaks the pattern, you've found answers for elements you pop.

**The pattern:**
```java
int[] result = new int[n];
Arrays.fill(result, -1);
Stack<Integer> stack = new Stack<>();  // Store indices

for (int i = 0; i < n; i++) {
    // Pop elements that found their "next greater"
    while (!stack.isEmpty() && nums[i] > nums[stack.peek()]) {
        int idx = stack.pop();
        result[idx] = nums[i];  // nums[i] is the next greater for nums[idx]
    }
    stack.push(i);
}
```

**When to use:** Any problem mentioning "next greater," "previous smaller," "span," or histogram-like visuals.

**The trick:** Draw the stack state after each element. You'll see the pattern immediately.

---

## 7. The Backtracking Template

Backtracking is just DFS with "undo." The template is always the same.

**The insight:** Make a choice, explore, undo the choice, try the next option.

**The pattern:**
```java
void backtrack(int start, List<Integer> current, List<List<Integer>> result) {
    // Check if current is a valid solution
    if (isComplete(current)) {
        result.add(new ArrayList<>(current));  // Copy! Don't add reference
        return;
    }
    
    for (int i = start; i < candidates.length; i++) {
        // Skip duplicates (if needed)
        if (i > start && candidates[i] == candidates[i-1]) continue;
        
        current.add(candidates[i]);           // Make choice
        backtrack(i + 1, current, result);    // Explore (i+1 to avoid reuse)
        current.remove(current.size() - 1);   // Undo choice
    }
}
```

**The variations:**
- `backtrack(i + 1, ...)` → Each element used at most once (subsets, combinations)
- `backtrack(i, ...)` → Elements can repeat (coin change combinations)
- `backtrack(0, ...)` → Full rearrangement allowed (permutations)

**Common mistakes:**
1. Forgetting to copy: `result.add(current)` adds a reference that gets modified
2. Wrong starting index for the recursion
3. Not handling duplicates in sorted input

---

## The Decision Flowchart

When you see a new problem, walk through this:

```
Is input sorted or can be sorted?
├── Yes → Consider: Binary Search, Two Pointers
└── No → Continue

Does it involve contiguous elements?
├── Yes → Consider: Sliding Window, Prefix Sum, Kadane's
└── No → Continue

Is it a graph/tree structure?
├── Tree → DFS recursion, level-order BFS
├── Graph → BFS for shortest path, DFS for all paths, Union-Find for connectivity
└── No → Continue

Does it ask for "all" combinations/permutations?
├── Yes → Backtracking
└── No → Continue

Does it have optimal substructure?
├── Yes → Dynamic Programming
└── No → Consider: Greedy, Math trick
```

---

## Real Interview Advice

### What Interviewers Actually Look For

1. **Communication:** Explain your thought process, not just code
2. **Pattern recognition:** Show you identified the problem type
3. **Trade-off awareness:** Mention time/space complexity before coding
4. **Testing:** Walk through an example after coding

### The 5-Minute Rule

If you haven't identified the pattern in 5 minutes, you're probably overcomplicating it. Step back and:
- Re-read the constraints
- Look for trigger words
- Consider a brute force first

### The "What If" Questions

Interviewers love follow-ups. Be ready for:
- "What if the array is sorted?" → Enables binary search/two pointers
- "What if we need to do this repeatedly?" → Precompute with prefix sum/preprocessing
- "What if memory is limited?" → Optimize space, use streaming approach
- "What if the input is huge?" → Consider external sorting, MapReduce thinking

---

## Practice Strategy

Don't grind randomly. Here's a focused approach:

**Week 1-2:** Master sliding window and two pointers. Do 10 problems each.

**Week 3-4:** Focus on BFS/DFS and basic DP. Do 15 problems total.

**Week 5-6:** Practice backtracking and binary search variations. Do 10 problems each.

**Week 7-8:** Mix everything. Do timed practice, 45 min per problem max.

**Key:** After solving, always ask "What pattern was this?" and "What was the trigger that told me?"

---

## Final Thought

The goal isn't to solve every LeetCode problem. It's to recognize patterns so fast that new problems feel familiar.

When you see a problem and immediately think "This is just binary search on the answer" or "Classic sliding window," you've made it.

That recognition is what separates people who grind for years from people who crack interviews in a few months.

---

*Practice these patterns with visual explanations at [AlgoPatterns](https://algopatterns.in)*

---

**Tags:** #leetcode #codinginterview #algorithms #datastructures #faang #programming #softwareengineering
