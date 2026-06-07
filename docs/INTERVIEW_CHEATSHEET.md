# Algorithm Patterns - Interview Cheat Sheet

> Quick revision guide covering all patterns. Scan before interviews!

---

## The Golden Rule: Check Constraints First

Before anything else, look at the input size. This tells you which algorithms are even possible.

| Input Size | Time Complexity | What Works |
|------------|-----------------|------------|
| **n ≤ 15** | O(n!) or O(2^n) | Brute force, backtracking, generate all permutations/subsets |
| **n ≤ 20** | O(2^n) | Backtracking, recursion, bitmask DP |
| **n ≤ 100** | O(n³) | Triple nested loops, Floyd-Warshall |
| **n ≤ 1,000** | O(n²) | Nested loops, simple DP, compare all pairs |
| **n ≤ 10,000** | O(n²) with care | DP with optimization, nested loops if fast |
| **n ≤ 100,000** | O(n log n) | Sorting, heap, divide & conquer, binary search |
| **n ≤ 1,000,000** | O(n) | Single pass, two pointers, sliding window, hash map |
| **n > 10,000,000** | O(log n) or O(1) | Binary search, math formula, bit manipulation |

### Quick Mental Check

```
n ≤ 20     → Backtracking is fine (2^20 ≈ 1 million)
n ≤ 3000   → O(n²) is fine (9 million operations)
n ≤ 10^6   → Need O(n) or O(n log n)
n > 10^6   → Need O(log n) or O(1)
```

---

## Quick Pattern Selector

| Problem Type | Pattern | Time | Space |
|-------------|---------|------|-------|
| Sorted array, find pair | Two Pointers | O(n) | O(1) |
| Contiguous subarray/substring | Sliding Window | O(n) | O(k) |
| Range sum queries | Prefix Sum | O(n) build, O(1) query | O(n) |
| Find complement/duplicates | Hash Map | O(n) | O(n) |
| Search sorted/find boundary | Binary Search | O(log n) | O(1) |
| Matching brackets/NGE | Stack | O(n) | O(n) |
| In-place reversal/cycle | Linked List | O(n) | O(1) |
| Tree traversal/path | Trees (DFS/BFS) | O(n) | O(h) |
| Connectivity/shortest path | Graphs | O(V+E) | O(V+E) |
| Top K/streaming median | Heap | O(n log k) | O(k) |
| Counting ways/optimization | Dynamic Programming | O(n*m) | O(n) |
| Generate all combinations | Backtracking | O(2^n) | O(n) |
| Merge/schedule ranges | Intervals | O(n log n) | O(n) |
| Prefix search/autocomplete | Trie | O(L) | O(N*L) |
| Dynamic connectivity | Union-Find | O(1) amortized | O(n) |

---

## 1. Two Pointers

**When:** Sorted array, pairs, palindrome, partitioning

### Templates

```javascript
// OPPOSITE DIRECTION - sorted array pairs
let left = 0, right = arr.length - 1;
while (left < right) {
    if (sum < target) left++;
    else if (sum > target) right--;
    else return [left, right];
}

// SAME DIRECTION - remove duplicates
let slow = 0;
for (let fast = 1; fast < n; fast++) {
    if (nums[fast] !== nums[slow]) {
        slow++;
        nums[slow] = nums[fast];
    }
}

// CYCLE DETECTION (Floyd's)
let slow = head, fast = head;
while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true; // cycle!
}
// Find cycle start: reset slow to head, move both 1 step
```

**Key Points:**
- Sorted array = O(n) instead of O(n^2)
- For 3Sum: fix one, two pointers for rest
- Dutch Flag: 3 pointers (low, mid, high)

**Problems:** Two Sum II, 3Sum, Container With Most Water, Valid Palindrome, Sort Colors

---

## 2. Sliding Window

**When:** Contiguous subarray/substring, "consecutive", "at most K"

### Templates

```javascript
// VARIABLE SIZE - find maximum
let left = 0, result = 0;
for (let right = 0; right < s.length; right++) {
    // 1. EXPAND: add s[right] to window
    freq.set(s[right], (freq.get(s[right]) || 0) + 1);
    
    // 2. SHRINK: while window invalid
    while (windowInvalid) {
        // remove s[left]
        left++;
    }
    
    // 3. UPDATE: result (for max, AFTER while)
    result = Math.max(result, right - left + 1);
}

// FIXED SIZE
for (let i = 0; i < arr.length; i++) {
    windowSum += arr[i];
    if (i >= k - 1) {
        result = Math.max(result, windowSum);
        windowSum -= arr[i - k + 1];
    }
}
```

**Key Points:**
- Window size = `right - left + 1`
- For MIN: update result INSIDE while (when valid)
- For MAX: update result AFTER while (when valid)
- Anagram: use frequency map + matches counter

**Problems:** Longest Substring Without Repeating, Minimum Window Substring, Find All Anagrams

---

## 3. Prefix Sum

**When:** Range sum queries, subarray sum = k, product except self

### Templates

```javascript
// BUILD PREFIX SUM
const prefix = [0];
for (let num of arr) {
    prefix.push(prefix[prefix.length - 1] + num);
}
// Range sum [i, j] = prefix[j+1] - prefix[i]

// SUBARRAY SUM = K (HashMap)
const prefixCount = new Map([[0, 1]]);  // CRITICAL: init with 0!
let sum = 0, count = 0;
for (let num of nums) {
    sum += num;
    count += prefixCount.get(sum - k) || 0;  // look for complement
    prefixCount.set(sum, (prefixCount.get(sum) || 0) + 1);
}

// PRODUCT EXCEPT SELF (no division)
// Left products, then multiply by right products
for (let i = 0; i < n; i++) {
    result[i] = leftProduct;
    leftProduct *= nums[i];
}
for (let i = n - 1; i >= 0; i--) {
    result[i] *= rightProduct;
    rightProduct *= nums[i];
}
```

**Key Points:**
- Always init HashMap with `{0: 1}` for subarrays from start
- 2D: `prefix[i][j] = matrix + top + left - topLeft`

**Problems:** Subarray Sum Equals K, Product Except Self, Range Sum Query

---

## 4. Hash Map / Set

**When:** Find complement, group by key, frequency count, duplicates

### Templates

```javascript
// TWO SUM - complement lookup
const seen = new Map();
for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) return [seen.get(complement), i];
    seen.set(nums[i], i);  // add AFTER check!
}

// GROUP ANAGRAMS
const groups = new Map();
for (let s of strs) {
    const key = [...s].sort().join('');  // or char count
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(s);
}

// LONGEST CONSECUTIVE
const numSet = new Set(nums);
for (let num of numSet) {
    if (!numSet.has(num - 1)) {  // only start from sequence beginning
        let length = 1;
        while (numSet.has(num + length)) length++;
        longest = Math.max(longest, length);
    }
}
```

**Key Points:**
- Check complement BEFORE adding current element
- For lowercase: use `int[26]` instead of HashMap (faster)
- Two maps for bijective mapping (isomorphic strings)

**Problems:** Two Sum, Group Anagrams, Top K Frequent, Longest Consecutive Sequence

---

## 5. Binary Search

**When:** Sorted array, find boundary, search on answer space

### Templates

```javascript
// EXACT MATCH
let left = 0, right = arr.length - 1;
while (left <= right) {  // <= for exact match
    const mid = left + Math.floor((right - left) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
}

// LOWER BOUND (first >= target)
while (left < right) {  // < for boundary
    const mid = left + Math.floor((right - left) / 2);
    if (arr[mid] < target) left = mid + 1;
    else right = mid;  // keep mid in range
}

// ROTATED ARRAY - one half ALWAYS sorted
if (nums[left] <= nums[mid]) {  // left half sorted
    if (nums[left] <= target && target < nums[mid]) right = mid - 1;
    else left = mid + 1;
} else {  // right half sorted
    if (nums[mid] < target && target <= nums[right]) left = mid + 1;
    else right = mid - 1;
}

// BINARY SEARCH ON ANSWER
while (left < right) {
    const mid = left + Math.floor((right - left) / 2);
    if (canAchieve(mid)) right = mid;  // try smaller
    else left = mid + 1;
}
```

**Key Points:**
- Use `left + (right - left) / 2` to avoid overflow
- `<=` for exact match, `<` for boundary finding
- Rotated: check which half is sorted first

**Problems:** Search in Rotated Array, Koko Eating Bananas, Find First and Last Position

---

## 6. Stack / Monotonic Stack

**When:** Matching pairs, next greater/smaller element, calculator

### Templates

```javascript
// VALID PARENTHESES
const pairs = { ')': '(', ']': '[', '}': '{' };
for (let c of s) {
    if ('([{'.includes(c)) stack.push(c);
    else if (!stack.length || stack.pop() !== pairs[c]) return false;
}
return stack.length === 0;

// NEXT GREATER ELEMENT (monotonic decreasing stack)
const result = new Array(n).fill(-1);
const stack = [];  // store INDICES
for (let i = 0; i < n; i++) {
    while (stack.length && nums[stack[stack.length-1]] < nums[i]) {
        result[stack.pop()] = nums[i];  // current is their answer
    }
    stack.push(i);
}

// CALCULATOR II
let num = 0, sign = '+';
for (let c of s + '+') {  // add terminator
    if (isDigit(c)) num = num * 10 + Number(c);
    else if (c !== ' ') {
        if (sign === '+') stack.push(num);
        else if (sign === '-') stack.push(-num);
        else if (sign === '*') stack.push(stack.pop() * num);
        else if (sign === '/') stack.push(Math.trunc(stack.pop() / num));
        sign = c; num = 0;
    }
}
```

**Key Points:**
- Monotonic DECREASING: pop when current > top (next greater)
- Monotonic INCREASING: pop when current < top (next smaller)
- Store INDICES for position-based problems
- Circular arrays: iterate `2*n`, use `i % n`

**Problems:** Valid Parentheses, Daily Temperatures, Largest Rectangle in Histogram

---

## 7. Linked List

**When:** Reversal, cycle detection, merge, reorder

### Templates

```javascript
// REVERSE
let prev = null, curr = head;
while (curr) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
}
return prev;

// FIND MIDDLE (slow/fast)
let slow = head, fast = head;
while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
}
return slow;

// MERGE TWO SORTED
const dummy = { next: null };
let tail = dummy;
while (l1 && l2) {
    if (l1.val <= l2.val) { tail.next = l1; l1 = l1.next; }
    else { tail.next = l2; l2 = l2.next; }
    tail = tail.next;
}
tail.next = l1 || l2;
return dummy.next;
```

**Key Points:**
- ALWAYS use dummy node when head might change
- Fast/slow: fast reaches end, slow at middle
- Cycle start: after meeting, reset one to head, move both 1 step
- Draw diagrams!

**Problems:** Reverse Linked List, Linked List Cycle II, Merge K Sorted, Reorder List

---

## 8. Trees (DFS/BFS)

**When:** Traversal, path sum, validate BST, level order

### Templates

```javascript
// DFS TEMPLATE
function dfs(node) {
    if (!node) return baseCase;
    // Preorder: process BEFORE children
    const left = dfs(node.left);
    // Inorder: process BETWEEN (BST = sorted!)
    const right = dfs(node.right);
    // Postorder: process AFTER children
    return combine(left, right, node.val);
}

// BFS LEVEL ORDER
const queue = [root], result = [];
while (queue.length) {
    const levelSize = queue.length;
    const level = [];
    for (let i = 0; i < levelSize; i++) {
        const node = queue.shift();
        level.push(node.val);
        if (node.left) queue.push(node.left);
        if (node.right) queue.push(node.right);
    }
    result.push(level);
}

// VALIDATE BST (pass bounds DOWN)
function isValid(node, min = -Infinity, max = Infinity) {
    if (!node) return true;
    if (node.val <= min || node.val >= max) return false;
    return isValid(node.left, min, node.val) && 
           isValid(node.right, node.val, max);
}
```

**Key Points:**
- Inorder BST = sorted order
- LCA: if both in same subtree, recurse; else current is LCA
- Diameter: use closure variable for global max
- Serialize: preorder + null markers

**Problems:** Max Depth, Validate BST, LCA, Level Order, Diameter, Serialize/Deserialize

---

## 9. Graphs

**When:** Connected components, shortest path, dependency order, cycle

### Templates

```javascript
// DFS ON GRID (Number of Islands)
const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
function dfs(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] === '0') return;
    grid[r][c] = '0';  // mark visited
    for (let [dr, dc] of dirs) dfs(r + dr, c + dc);
}

// BFS SHORTEST PATH
const queue = [[start, 0]];
const visited = new Set([start]);
while (queue.length) {
    const [node, dist] = queue.shift();
    if (node === end) return dist;
    for (let neighbor of graph[node]) {
        if (!visited.has(neighbor)) {
            visited.add(neighbor);  // mark BEFORE adding
            queue.push([neighbor, dist + 1]);
        }
    }
}

// TOPOLOGICAL SORT (Kahn's - BFS)
const indegree = new Array(n).fill(0);
for (let [from, to] of edges) { graph[from].push(to); indegree[to]++; }
const queue = indegree.map((d, i) => d === 0 ? i : -1).filter(x => x >= 0);
while (queue.length) {
    const node = queue.shift();
    order.push(node);
    for (let neighbor of graph[node]) {
        if (--indegree[neighbor] === 0) queue.push(neighbor);
    }
}
return order.length === n ? order : [];  // empty = cycle

// DIJKSTRA (weighted shortest path)
const dist = new Array(n).fill(Infinity);
dist[start] = 0;
const pq = [[0, start]];  // [distance, node]
while (pq.length) {
    pq.sort((a,b) => a[0] - b[0]);
    const [d, u] = pq.shift();
    if (d > dist[u]) continue;  // skip outdated
    for (let [v, w] of graph[u]) {
        if (dist[u] + w < dist[v]) {
            dist[v] = dist[u] + w;
            pq.push([dist[v], v]);
        }
    }
}
```

**Key Points:**
- BFS for unweighted shortest path
- Mark visited BEFORE adding to queue
- Topo sort: only works on DAG (cycle = invalid)
- Cycle detection: 3 states (white/gray/black)

**Problems:** Number of Islands, Course Schedule, Clone Graph, Word Ladder, Network Delay Time

---

## 10. Heap / Priority Queue

**When:** Top K, streaming median, merge K sorted

### Templates

```javascript
// K LARGEST (use MIN-heap of size K)
for (let num of nums) {
    minHeap.push(num);
    if (minHeap.length > k) minHeap.shift();  // remove smallest
}
return minHeap[0];  // Kth largest

// TWO HEAPS - STREAMING MEDIAN
class MedianFinder {
    small = [];  // max-heap (lower half) - negate values
    large = [];  // min-heap (upper half)
    
    addNum(num) {
        this.small.push(-num); this.small.sort((a,b) => a-b);
        this.large.push(-this.small.shift()); this.large.sort((a,b) => a-b);
        if (this.large.length > this.small.length) {
            this.small.push(-this.large.shift());
            this.small.sort((a,b) => a-b);
        }
    }
    
    findMedian() {
        return this.small.length > this.large.length
            ? -this.small[0]
            : (-this.small[0] + this.large[0]) / 2;
    }
}

// MERGE K SORTED LISTS
// Init heap with first element of each list
// Pop min, add its next to heap
```

**Key Points:**
- K largest = MIN-heap of size K (top is Kth largest)
- K smallest = MAX-heap of size K
- Streaming median: max-heap for lower half, min-heap for upper half
- Java: `PriorityQueue` is min-heap by default

**Problems:** Kth Largest, Top K Frequent, Find Median, Merge K Sorted Lists

---

## 11. Dynamic Programming

**When:** Counting ways, optimization, take/skip decisions

### Framework

1. **STATE**: What info needed to make decision?
2. **RECURRENCE**: How does current depend on previous?
3. **BASE CASE**: Simplest subproblem answer

### Templates

```javascript
// 1D DP - House Robber
let prev2 = nums[0], prev1 = Math.max(nums[0], nums[1]);
for (let i = 2; i < n; i++) {
    const curr = Math.max(prev1, prev2 + nums[i]);
    prev2 = prev1;
    prev1 = curr;
}

// 2D DP - LCS
for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
        if (s1[i-1] === s2[j-1]) dp[i][j] = dp[i-1][j-1] + 1;
        else dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
    }
}

// 0/1 KNAPSACK (each item once)
for (let num of nums) {
    for (let j = target; j >= num; j--) {  // REVERSE!
        dp[j] = dp[j] || dp[j - num];
    }
}

// UNBOUNDED KNAPSACK (reuse items)
for (let coin of coins) {
    for (let i = coin; i <= amount; i++) {  // FORWARD!
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
    }
}
```

**Key Points:**
- 0/1 Knapsack: inner loop REVERSE
- Unbounded: inner loop FORWARD
- Space optimize: if dp[i] only needs dp[i-1], use variables

**Problems:** Climbing Stairs, House Robber, Coin Change, LCS, Edit Distance, Word Break

---

## 12. Backtracking

**When:** Generate all combinations/permutations/subsets, constraints

### Templates

```javascript
// SUBSETS
function backtrack(start, path) {
    result.push([...path]);  // add current state
    for (let i = start; i < nums.length; i++) {
        path.push(nums[i]);
        backtrack(i + 1, path);  // start from i+1
        path.pop();  // BACKTRACK!
    }
}

// PERMUTATIONS
function backtrack(path, used) {
    if (path.length === nums.length) {
        result.push([...path]);
        return;
    }
    for (let i = 0; i < nums.length; i++) {
        if (used[i]) continue;
        used[i] = true;
        path.push(nums[i]);
        backtrack(path, used);
        path.pop();
        used[i] = false;  // BACKTRACK!
    }
}

// COMBINATION SUM (can reuse)
function backtrack(start, path, remaining) {
    if (remaining === 0) { result.push([...path]); return; }
    if (remaining < 0) return;
    for (let i = start; i < candidates.length; i++) {
        path.push(candidates[i]);
        backtrack(i, path, remaining - candidates[i]);  // i, not i+1!
        path.pop();
    }
}
```

**Key Points:**
- ALWAYS undo changes after recursive call
- For duplicates: sort first, skip if `nums[i] === nums[i-1]`
- Subsets: start from i; Permutations: use visited array
- Prune EARLY: check constraints before recursing

**Problems:** Subsets, Permutations, Combination Sum, N-Queens, Word Search

---

## 13. Intervals

**When:** Merge ranges, scheduling, non-overlapping

### Templates

```javascript
// MERGE INTERVALS
intervals.sort((a, b) => a[0] - b[0]);  // sort by start!
const result = [intervals[0]];
for (let curr of intervals) {
    const last = result[result.length - 1];
    if (curr[0] <= last[1]) {  // overlap
        last[1] = Math.max(last[1], curr[1]);
    } else {
        result.push(curr);
    }
}

// MEETING ROOMS II (min rooms = max concurrent)
const events = [];
for (let [start, end] of intervals) {
    events.push([start, 1]);   // +1 at start
    events.push([end, -1]);    // -1 at end
}
events.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
let rooms = 0, maxRooms = 0;
for (let [time, delta] of events) {
    rooms += delta;
    maxRooms = Math.max(maxRooms, rooms);
}
```

**Key Points:**
- ALWAYS sort by start (or end for greedy selection)
- Overlap condition: `curr.start <= prev.end`
- Max non-overlapping: sort by END time (greedy)

**Problems:** Merge Intervals, Insert Interval, Meeting Rooms II, Non-overlapping Intervals

---

## 14. Trie

**When:** Prefix search, autocomplete, word dictionary

### Template

```javascript
class Trie {
    constructor() { this.root = {}; }
    
    insert(word) {
        let node = this.root;
        for (let c of word) {
            if (!node[c]) node[c] = {};
            node = node[c];
        }
        node.isEnd = true;
    }
    
    search(word) {
        let node = this.root;
        for (let c of word) {
            if (!node[c]) return false;
            node = node[c];
        }
        return node.isEnd === true;
    }
    
    startsWith(prefix) {
        let node = this.root;
        for (let c of prefix) {
            if (!node[c]) return false;
            node = node[c];
        }
        return true;
    }
}
```

**Key Points:**
- Each path from root = prefix
- `isEnd` flag distinguishes words from prefixes
- For wildcards: DFS trying all children

**Problems:** Implement Trie, Word Search II, Design Add and Search Words

---

## 15. Union-Find

**When:** Dynamic connectivity, cycle detection, accounts merge

### Template

```javascript
class UnionFind {
    constructor(n) {
        this.parent = Array.from({length: n}, (_, i) => i);
        this.rank = new Array(n).fill(0);
    }
    
    find(x) {
        if (this.parent[x] !== x) {
            this.parent[x] = this.find(this.parent[x]);  // path compression
        }
        return this.parent[x];
    }
    
    union(x, y) {
        const px = this.find(x), py = this.find(y);
        if (px === py) return false;  // already connected
        // union by rank
        if (this.rank[px] < this.rank[py]) this.parent[px] = py;
        else if (this.rank[px] > this.rank[py]) this.parent[py] = px;
        else { this.parent[py] = px; this.rank[px]++; }
        return true;
    }
}
```

**Key Points:**
- Path compression + union by rank = O(1) amortized
- For 2D grids: flatten index as `i * cols + j`
- Track component count with counter variable

**Problems:** Number of Provinces, Redundant Connection, Accounts Merge

---

## Quick Complexity Reference

| Pattern | Time | Space |
|---------|------|-------|
| Two Pointers | O(n) | O(1) |
| Sliding Window | O(n) | O(k) |
| Prefix Sum | O(n) build / O(1) query | O(n) |
| Hash Map | O(n) avg | O(n) |
| Binary Search | O(log n) | O(1) |
| Stack | O(n) | O(n) |
| Linked List | O(n) | O(1) |
| Tree DFS | O(n) | O(h) |
| Tree BFS | O(n) | O(w) |
| Graph BFS/DFS | O(V+E) | O(V+E) |
| Dijkstra | O((V+E)logV) | O(V) |
| Heap Operations | O(log n) | O(n) |
| Top K | O(n log k) | O(k) |
| DP 1D | O(n) | O(n) or O(1) |
| DP 2D | O(n*m) | O(n*m) or O(n) |
| Backtracking (subsets) | O(2^n) | O(n) |
| Backtracking (permutations) | O(n!) | O(n) |
| Intervals | O(n log n) | O(n) |
| Trie | O(L) per op | O(N*L) |
| Union-Find | O(alpha(n)) ~ O(1) | O(n) |

---

## Common Mistakes to Avoid

1. **Two Pointers**: Forgetting to sort first
2. **Sliding Window**: Updating result at wrong place (inside vs outside while)
3. **Prefix Sum**: Not initializing `{0: 1}` in HashMap
4. **Binary Search**: Integer overflow with `(left + right) / 2`
5. **Stack**: Wrong comparison direction for monotonic stack
6. **Linked List**: Not using dummy node when head can change
7. **Trees**: Using wrong traversal order
8. **Graphs**: Using DFS for shortest path (gives A path, not shortest)
9. **Heap**: Using wrong heap type (min vs max)
10. **DP**: Wrong loop order (0/1 vs unbounded knapsack)
11. **Backtracking**: Forgetting to backtrack (undo changes)
12. **Intervals**: Not sorting first

---

## Keyword to Algorithm Cheat Sheet

> Problems rarely tell you which algorithm to use, but the wording usually leaks it. Learn to read these signals!

### "Top K" / "Kth largest"
**Heap** — track the K-item boundary in O(n log K) instead of sorting all n.
- *Problems: K Closest Points, Kth Largest Element*

### "Sorted" / "rotated sorted" / "in O(log n)"
**Binary Search** — halve the search space at each step using order.
- *Problems: Search in Rotated Array, Find First and Last Position*

### "How many ways..."
Choose by what the input looks like:
- **DFS** — when choices form a tree of decisions. *Decode Ways*
- **DP** — when subproblems overlap on a grid or sequence. *Unique Paths*

### "Substring" / "contiguous"
**Sliding Window** — contiguous slices extend and shrink in O(1) at each step.
- *Problems: Longest Substring Without Repeating Characters*

### "Prefix" / "autocomplete" / "starts with"
**Trie** — share storage for common prefixes; lookup runs in O(word length).
- *Problems: Implement Trie, Search Suggestions System*

### "Palindrome"
Choose by whether you're verifying or constructing:
- **Two Pointers** — to verify a single string. *Valid Palindrome*
- **DFS** — to enumerate every valid partition. *Palindrome Partitioning*
- **DP** — to minimize cuts or count partitions. *Palindrome Partitioning II*

### "Tree"
Do you care about depth, or just need to visit every node?
- **BFS** — for level-order, shallowest depth, "right-side view". *Level Order Traversal*
- **DFS** — for sums, heights, paths (anything not level-related). *Max Depth*

### "Parentheses" / "brackets"
**Stack** — brackets close in reverse order, last opened first closed (LIFO).
- *Problems: Valid Parentheses, Min Remove to Make Valid*

### "Next greater" / "next smaller" / "warmer day"
**Monotonic Stack** — keep candidates in stack order so answer pops out in O(1) amortized.
- *Problems: Daily Temperatures, Next Greater Element*

### "Subarray"
Contiguous slices, but the right tool depends on what you're computing:
- **Sliding Window** — fixed size or monotonic constraint. *Max Sum Subarray of Size K*
- **Prefix Sum** — for range-sum queries. *Range Sum Query*
- **HashMap of prefix sums** — for sum equals a target. *Subarray Sum Equals K*

### "Max subarray"
**Greedy (Kadane's)** — at each index, extend the run or restart; choice is local.
- *Problems: Maximum Subarray*

### "Two sum / K sum"
**Two Pointers** on sorted array — each move strictly raises or lowers the sum.
- *Problems: Two Sum II, 3Sum, 4Sum*

### "Max/longest sequence"
- **DP / DFS with memo** — when a position depends on earlier positions. *Longest Increasing Subsequence*
- **Monotonic Deque** — for max within a sliding window. *Sliding Window Maximum*

### "Minimum/Shortest"
Three very different problems wear the same word:
- **BFS** — fewest edges in an unweighted graph. *Shortest Path in Binary Matrix*
- **Dijkstra** — shortest path with non-negative edge weights. *Network Delay Time*
- **DP / DFS** — cumulative cost on a grid or sequence. *Minimum Path Sum*

### "Partition/split"
**DFS** — each split point is a recursive choice; memoize if suffixes repeat.
- *Problems: Decode Ways, Word Break*

### "Subsequence"
**DP / DFS with memo** — pick-or-skip at each index, with overlapping subproblems.
- *Problems: Longest Increasing Subsequence, Is Subsequence*

### "All combinations / permutations / subsets" / "generate every"
**Backtracking** — DFS that records a partial solution, recurses, then undoes the choice.
- *Problems: Permutations, Subsets, Combination Sum*

### "Matrix" / "Grid"
A grid is a graph. Connectivity = BFS/DFS; Optimization = DP.
- **BFS / DFS** — connectivity, flood-fill, region counting. *Number of Islands*
- **DP** — optimization where each cell builds on neighbors. *Maximal Square*

### "Jump"
- **Greedy** — when "always reach as far as possible" works. *Jump Game*
- **DP** — when counting jumps or greedy fails. *Jump Game II*

### "Game"
**DP on game states** — "can the player to move force a win?" recurses with overlap.
- *Problems: Divisor Game, Stone Game*

### "Connected component"
**Union-Find** — near-O(1) union and find beat re-running BFS after each edge.
- Use BFS/DFS instead when graph is built once and you traverse few times.
- *Problems: Number of Connected Components, Accounts Merge*

### "Schedule" / "prerequisites" / "build order" / "course"
**Topological Sort** (Kahn's BFS or DFS post-order) — directed dependencies must be linearized.
- Detects cycles as a side effect.
- *Problems: Course Schedule, Alien Dictionary*

### "Transitive relationship"
If A relates to B and B relates to C means A relates to C, it's a graph in disguise:
- **BFS** — to answer a single query by traversing on the fly. *Word Ladder*
- **BFS or Union-Find** — for many queries on a fixed relation set. *Evaluate Division*

### "Interval" / "range" / "meeting"
**Greedy after sorting** — by start (merge) or by end (fit-in), then one pass.
- *Problems: Merge Intervals, Meeting Rooms II*

---

## Quick Decision Tree

```
Is it about SEARCHING?
├── Sorted array? → Binary Search
├── Find pair/complement? → HashMap or Two Pointers
└── Prefix search? → Trie

Is it about CONTIGUOUS elements?
├── Fixed-size window? → Sliding Window
├── Variable-size with constraint? → Sliding Window
└── Range sum query? → Prefix Sum

Is it about GENERATING all possibilities?
├── All subsets? → Backtracking (start from i+1)
├── All permutations? → Backtracking (use visited array)
└── With constraints? → Backtracking + Pruning

Is it about OPTIMIZATION?
├── Overlapping subproblems? → DP
├── Local choice → global optimal? → Greedy
└── Each item used once vs unlimited? → 0/1 vs Unbounded Knapsack

Is it about GRAPHS?
├── Shortest path (unweighted)? → BFS
├── Shortest path (weighted)? → Dijkstra
├── Dependencies/ordering? → Topological Sort
├── Connected components? → DFS/BFS or Union-Find
└── Cycle detection? → DFS with 3 colors

Is it about SEQUENCES/STACKS?
├── Matching pairs? → Stack
├── Next greater/smaller? → Monotonic Stack
├── Expression evaluation? → Stack
└── Reverse/rearrange? → Linked List techniques

Is it about TREES?
├── Need level info? → BFS
├── Need path/sum/height? → DFS
└── BST property? → Inorder = sorted
```

---

*Good luck with your interviews!*
