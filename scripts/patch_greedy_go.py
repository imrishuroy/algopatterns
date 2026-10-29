#!/usr/bin/env python3
"""Patches the greedy pattern in patterns.json with Go language support."""
import json

# Section 3: Activity Selection
GO_S3 = """\
func maxActivities(intervals [][]int) int {
    // Sort by end time - the key greedy insight
    sort.Slice(intervals, func(i, j int) bool {
        return intervals[i][1] < intervals[j][1]
    })

    count := 1
    lastEnd := intervals[0][1]

    for i := 1; i < len(intervals); i++ {
        if intervals[i][0] >= lastEnd {
            count++
            lastEnd = intervals[i][1]
        }
    }
    return count
}\
"""

# Section 4: Jump Game
GO_S4 = """\
func canJump(nums []int) bool {
    maxReach := 0

    for i := 0; i < len(nums); i++ {
        // If current position is beyond our reach, we're stuck
        if i > maxReach {
            return false
        }

        // Update the furthest we can reach
        if i+nums[i] > maxReach {
            maxReach = i + nums[i]
        }

        // Early exit if we can already reach the end
        if maxReach >= len(nums)-1 {
            return true
        }
    }
    return true
}\
"""

# Section 5: Jump Game II
GO_S5 = """\
func jump(nums []int) int {
    jumps := 0
    currentEnd := 0 // End of current BFS level
    farthest := 0   // Farthest reachable in next level

    for i := 0; i < len(nums)-1; i++ {
        if i+nums[i] > farthest {
            farthest = i + nums[i]
        }

        // Reached end of current level - must jump
        if i == currentEnd {
            jumps++
            currentEnd = farthest
        }
    }
    return jumps
}\
"""

# Section 6: Best Time to Buy and Sell Stock
GO_S6 = """\
// INTUITION: To maximize profit, we need to buy low and sell high.
// But we must buy BEFORE we sell. So at each day, we ask:
// "What's the best profit if I sell TODAY?"
// Answer: today's price minus the LOWEST price seen so far.

func maxProfit(prices []int) int {
    // Track the minimum price seen so far (best buy opportunity)
    minPrice := math.MaxInt32

    // Track the best profit we can achieve
    maxProfit := 0

    for _, price := range prices {
        // Update the best buy price (minimum so far)
        // This represents: "If I were to buy, what's the best price?"
        if price < minPrice {
            minPrice = price
        }

        // Calculate profit if we sell at today's price
        // profit = sell price - buy price = price - minPrice
        profit := price - minPrice

        // Update max profit if this is better
        if profit > maxProfit {
            maxProfit = profit
        }
    }

    // If prices only went down, maxProfit stays 0 (don't trade)
    return maxProfit
}\
"""

# Section 7: Gas Station
GO_S7 = """\
func canCompleteCircuit(gas []int, cost []int) int {
    totalGas := 0
    totalCost := 0
    tank := 0
    start := 0

    for i := 0; i < len(gas); i++ {
        totalGas += gas[i]
        totalCost += cost[i]
        tank += gas[i] - cost[i]

        // Can't reach next station, try starting from i+1
        if tank < 0 {
            start = i + 1
            tank = 0
        }
    }

    // If we have enough total gas, 'start' is the answer
    if totalGas >= totalCost {
        return start
    }
    return -1
}\
"""

# Section 8: Boats to Save People
GO_S8 = """\
// INTUITION: To minimize boats, we want to maximize sharing.
// Heavy people are hard to pair (need light partners).
// Light people are flexible (can pair with almost anyone).
// Strategy: Try pairing heaviest with lightest. If they don't fit,
// the heaviest goes alone (no one else could pair with them anyway).

func numRescueBoats(people []int, limit int) int {
    // Step 1: Sort so we can use two pointers
    sort.Ints(people)

    // Two pointers: lightest and heaviest person
    left := 0                // Lightest person
    right := len(people) - 1 // Heaviest person
    boats := 0

    for left <= right {
        // The heaviest person (right) ALWAYS gets on a boat
        boats++

        // Can the lightest person join the heaviest?
        if people[left]+people[right] <= limit {
            // Yes! Both board the same boat
            left++ // Lightest is now handled
        }
        // If no, heaviest goes alone (no one can pair with them)

        // Either way, heaviest is handled
        right--
    }

    return boats
}\
"""

# Section 9: Hand of Straights
GO_S9 = """\
func isNStraightHand(hand []int, groupSize int) bool {
    // Quick check: must be divisible
    if len(hand)%groupSize != 0 {
        return false
    }

    // Count frequency of each card
    count := make(map[int]int)
    for _, card := range hand {
        count[card]++
    }

    // Extract and sort keys (Go maps have no guaranteed order)
    keys := make([]int, 0, len(count))
    for k := range count {
        keys = append(keys, k)
    }
    sort.Ints(keys)

    // Process from smallest card
    for _, first := range keys {
        freq := count[first]
        if freq == 0 {
            continue
        }

        // Try to form a group of consecutive cards
        for i := 0; i < groupSize; i++ {
            card := first + i
            if count[card] < freq {
                return false
            }
            count[card] -= freq
        }
    }

    return true
}\
"""

# Section 10: Partition Labels
GO_S10 = """\
func partitionLabels(s string) []int {
    // Find last index of each character
    lastIndex := [26]int{}
    for i, c := range s {
        lastIndex[c-'a'] = i
    }

    result := []int{}
    start := 0
    end := 0

    for i, c := range s {
        // Extend partition to include last occurrence of current char
        if lastIndex[c-'a'] > end {
            end = lastIndex[c-'a']
        }

        // Can we close the partition?
        if i == end {
            result = append(result, end-start+1)
            start = i + 1
        }
    }

    return result
}\
"""

# Section 11: Queue Reconstruction by Height
GO_S11 = """\
// INTUITION: Tall people don't see shorter people.
// So if we place tall people first, adding shorter people later
// won't change the k values of tall people!
//
// Strategy:
// 1. Sort tallest first (they should be placed first)
// 2. For same height, smaller k first (so they're in place when we insert larger k)
// 3. Insert each person at index = k (all people in queue are >= height)

func reconstructQueue(people [][]int) [][]int {
    // Sort: tallest first, then by k ascending for same height
    sort.Slice(people, func(i, j int) bool {
        if people[i][0] != people[j][0] {
            return people[i][0] > people[j][0] // Height DESC
        }
        return people[i][1] < people[j][1] // k ASC (for same height)
    })

    // Insert each person at index = their k value.
    // Everyone already in the queue is >= current height,
    // so k directly tells us how many people should be in front.
    result := make([][]int, 0, len(people))
    for _, person := range people {
        k := person[1]
        result = append(result, person) // grow
        copy(result[k+1:], result[k:]) // shift right
        result[k] = person             // place at k
    }

    return result
}\
"""

# Section 12: Merge Triplets
GO_S12 = """\
func mergeTriplets(triplets [][]int, target []int) bool {
    found := [3]bool{}

    for _, t := range triplets {
        // Skip if any value exceeds target (would overshoot)
        if t[0] > target[0] || t[1] > target[1] || t[2] > target[2] {
            continue
        }

        // This triplet is usable - check which target values it contributes
        for i := 0; i < 3; i++ {
            if t[i] == target[i] {
                found[i] = true
            }
        }
    }

    return found[0] && found[1] && found[2]
}\
"""

# Section 13: Non-Overlapping Intervals
GO_S13 = """\
func eraseOverlapIntervals(intervals [][]int) int {
    if len(intervals) == 0 {
        return 0
    }

    // Sort by end time
    sort.Slice(intervals, func(i, j int) bool {
        return intervals[i][1] < intervals[j][1]
    })

    nonOverlapping := 1 // First interval always selected
    lastEnd := intervals[0][1]

    for i := 1; i < len(intervals); i++ {
        // If current starts after (or at) last end, select it
        if intervals[i][0] >= lastEnd {
            nonOverlapping++
            lastEnd = intervals[i][1]
        }
    }

    return len(intervals) - nonOverlapping
}\
"""

# Section 14: Kadane's Algorithm
GO_S14 = """\
func maxSubArray(nums []int) int {
    maxSum := nums[0]
    currentSum := nums[0]

    for i := 1; i < len(nums); i++ {
        // Greedy choice: extend or start fresh
        if nums[i] > currentSum+nums[i] {
            currentSum = nums[i]
        } else {
            currentSum = currentSum + nums[i]
        }
        if currentSum > maxSum {
            maxSum = currentSum
        }
    }
    return maxSum
}\
"""

# Section 15: Valid Parenthesis String
GO_S15 = """\
// INTUITION:
// Without wildcards, we track ONE count of unmatched '('.
// With wildcards, each '*' can be '(', ')', or empty - creating MANY possible counts.
// Instead of trying all combinations (exponential), we track the RANGE of possible counts.
//
// KEY IDEA: Track [low, high] where:
//   low  = minimum possible unmatched '(' (if all '*' become ')')
//   high = maximum possible unmatched '(' (if all '*' become '(')
//
// If at any point high < 0: even treating all '*' as '(' can't save us - too many ')'
// If at the end low == 0: there EXISTS an assignment of '*' that balances to 0

func checkValidString(s string) bool {
    // low:  min possible open '(' count (greedy: all '*' as ')')
    // high: max possible open '(' count (greedy: all '*' as '(')
    low, high := 0, 0

    for _, c := range s {
        if c == '(' {
            // '(' always adds 1 to both bounds
            // Range shifts right: [low, high] -> [low+1, high+1]
            low++
            high++
        } else if c == ')' {
            // ')' always subtracts 1 from both bounds
            // Range shifts left: [low, high] -> [low-1, high-1]
            low--
            high--
        } else {
            // '*' can be ')', empty, or '('
            // ')' would decrease count, '(' would increase count
            // So range EXPANDS: [low, high] -> [low-1, high+1]
            low--  // if '*' becomes ')'
            high++ // if '*' becomes '('
        }

        // CRITICAL CHECK: If high < 0, even making all '*' into '('
        // can't fix the excess ')'. Impossible to balance.
        if high < 0 {
            return false
        }

        // CLAMP low to 0: We can't have negative unmatched '('.
        // If low < 0, it just means we COULD treat some '*' as ')'
        // but we don't HAVE to. We can choose '(' or empty instead.
        if low < 0 {
            low = 0
        }
    }

    // Final check: low == 0 means there's SOME way to assign '*'
    // such that we end with exactly 0 unmatched '('.
    return low == 0
}\
"""

# codeTemplates Go
GO_CODE_TEMPLATES = """\
/*
 * GREEDY ALGORITHM FRAMEWORK
 *
 * Step 1: SORT or preprocess to enable greedy choices
 * Step 2: ITERATE and make greedy choice at each step
 * Step 3: CHECK if we can take this item (greedy criterion)
 * Step 4: UPDATE state and continue
 *
 * KEY INSIGHT: Greedy works when:
 * - Local optimal choice leads to global optimal
 * - No need to reconsider past decisions
 */

// ACTIVITY SELECTION (Classic Greedy)
// Sort by END time - leave max room for future activities
func maxActivities(intervals [][]int) int {
    sort.Slice(intervals, func(i, j int) bool {
        return intervals[i][1] < intervals[j][1]
    })

    count := 1
    lastEnd := intervals[0][1]

    for i := 1; i < len(intervals); i++ {
        if intervals[i][0] >= lastEnd {
            count++
            lastEnd = intervals[i][1]
        }
    }
    return count
}

// JUMP GAME - Can we reach the end?
func canJump(nums []int) bool {
    maxReach := 0

    for i := 0; i < len(nums); i++ {
        if i > maxReach {
            return false
        }
        if i+nums[i] > maxReach {
            maxReach = i + nums[i]
        }
        if maxReach >= len(nums)-1 {
            return true
        }
    }
    return true
}

// JUMP GAME II - Minimum jumps
func jump(nums []int) int {
    jumps, currentEnd, farthest := 0, 0, 0

    for i := 0; i < len(nums)-1; i++ {
        if i+nums[i] > farthest {
            farthest = i + nums[i]
        }
        if i == currentEnd {
            jumps++
            currentEnd = farthest
        }
    }
    return jumps
}

// GAS STATION
func canCompleteCircuit(gas []int, cost []int) int {
    totalTank, currentTank, start := 0, 0, 0

    for i := 0; i < len(gas); i++ {
        net := gas[i] - cost[i]
        totalTank += net
        currentTank += net

        if currentTank < 0 {
            start = i + 1
            currentTank = 0
        }
    }
    if totalTank >= 0 {
        return start
    }
    return -1
}\
"""

# Variation templates

GO_VAR0 = """\
// Maximum non-overlapping intervals
// Sort by END time - leaves maximum room for future
func maxNonOverlapping(intervals [][]int) int {
    sort.Slice(intervals, func(i, j int) bool {
        return intervals[i][1] < intervals[j][1]
    })

    count := 1
    lastEnd := intervals[0][1]

    for i := 1; i < len(intervals); i++ {
        if intervals[i][0] >= lastEnd {
            count++
            lastEnd = intervals[i][1]
        }
    }
    return count
}

// Minimum intervals to remove (inverse)
func eraseOverlapIntervals(intervals [][]int) int {
    return len(intervals) - maxNonOverlapping(intervals)
}

// Minimum arrows to burst balloons
func findMinArrowShots(points [][]int) int {
    sort.Slice(points, func(i, j int) bool {
        return points[i][1] < points[j][1]
    })

    arrows := 1
    arrowPos := points[0][1]

    for i := 1; i < len(points); i++ {
        if points[i][0] > arrowPos {
            arrows++
            arrowPos = points[i][1]
        }
    }
    return arrows
}\
"""

GO_VAR1 = """\
// Merge overlapping intervals
// Sort by START time
func merge(intervals [][]int) [][]int {
    sort.Slice(intervals, func(i, j int) bool {
        return intervals[i][0] < intervals[j][0]
    })

    result := [][]int{}
    current := intervals[0]

    for i := 1; i < len(intervals); i++ {
        if intervals[i][0] <= current[1] {
            // Overlapping - extend
            if intervals[i][1] > current[1] {
                current[1] = intervals[i][1]
            }
        } else {
            result = append(result, current)
            current = intervals[i]
        }
    }
    result = append(result, current)

    return result
}

// Insert and merge
func insert(intervals [][]int, newInterval []int) [][]int {
    result := [][]int{}
    i := 0

    // Add all before
    for i < len(intervals) && intervals[i][1] < newInterval[0] {
        result = append(result, intervals[i])
        i++
    }

    // Merge overlapping
    for i < len(intervals) && intervals[i][0] <= newInterval[1] {
        if intervals[i][0] < newInterval[0] {
            newInterval[0] = intervals[i][0]
        }
        if intervals[i][1] > newInterval[1] {
            newInterval[1] = intervals[i][1]
        }
        i++
    }
    result = append(result, newInterval)

    // Add all after
    for i < len(intervals) {
        result = append(result, intervals[i])
        i++
    }

    return result
}\
"""

GO_VAR2 = """\
// Jump Game - Can reach end?
func canJump(nums []int) bool {
    maxReach := 0
    for i := 0; i < len(nums); i++ {
        if i > maxReach {
            return false
        }
        if i+nums[i] > maxReach {
            maxReach = i + nums[i]
        }
    }
    return true
}

// Jump Game II - Minimum jumps (BFS-like)
func jump(nums []int) int {
    jumps := 0
    currentEnd := 0 // End of current BFS level
    farthest := 0   // Farthest in next level

    for i := 0; i < len(nums)-1; i++ {
        if i+nums[i] > farthest {
            farthest = i + nums[i]
        }

        if i == currentEnd { // Finished current level
            jumps++
            currentEnd = farthest
        }
    }
    return jumps
}\
"""

GO_VAR3 = """\
// Unlimited transactions - capture every gain
func maxProfit(prices []int) int {
    profit := 0
    for i := 1; i < len(prices); i++ {
        if prices[i] > prices[i-1] {
            profit += prices[i] - prices[i-1]
        }
    }
    return profit
}

// With transaction fee
func maxProfitWithFee(prices []int, fee int) int {
    cash := 0          // Max profit not holding
    hold := -prices[0] // Max profit holding

    for i := 1; i < len(prices); i++ {
        newCash := hold + prices[i] - fee
        if newCash > cash {
            cash = newCash
        }
        newHold := cash - prices[i]
        if newHold > hold {
            hold = newHold
        }
    }
    return cash
}\
"""

GO_VAR4 = """\
// Container With Most Water
func maxArea(height []int) int {
    left, right := 0, len(height)-1
    maxWater := 0

    for left < right {
        h := height[left]
        if height[right] < h {
            h = height[right]
        }
        water := h * (right - left)
        if water > maxWater {
            maxWater = water
        }

        // Move the shorter side (greedy: only way to potentially improve)
        if height[left] < height[right] {
            left++
        } else {
            right--
        }
    }
    return maxWater
}

// Boats to Save People
func numRescueBoats(people []int, limit int) int {
    sort.Ints(people)
    left, right := 0, len(people)-1
    boats := 0

    for left <= right {
        if people[left]+people[right] <= limit {
            left++ // Lightest fits with heaviest
        }
        right-- // Heaviest always needs boat
        boats++
    }
    return boats
}\
"""

GO_VAR5 = """\
// Task Scheduler (formula approach - no heap needed)
func leastInterval(tasks []byte, n int) int {
    freq := [26]int{}
    for _, c := range tasks {
        freq[c-'A']++
    }

    maxFreq, maxCount := 0, 0
    for _, f := range freq {
        if f > maxFreq {
            maxFreq = f
            maxCount = 1
        } else if f == maxFreq {
            maxCount++
        }
    }

    result := (maxFreq-1)*(n+1) + maxCount
    if len(tasks) > result {
        return len(tasks)
    }
    return result
}

// Reorganize String - no adjacent same chars
type freqItem [2]int // [frequency, char index]
type maxFreqHeap []freqItem

func (h maxFreqHeap) Len() int {
    return len(h)
}
func (h maxFreqHeap) Less(i, j int) bool {
    return h[i][0] > h[j][0]
}
func (h maxFreqHeap) Swap(i, j int) {
    h[i], h[j] = h[j], h[i]
}
func (h *maxFreqHeap) Push(x any) {
    *h = append(*h, x.(freqItem))
}
func (h *maxFreqHeap) Pop() any {
    old := *h
    n := len(old)
    x := old[n-1]
    *h = old[:n-1]
    return x
}

func reorganizeString(s string) string {
    freq := [26]int{}
    for _, c := range s {
        freq[c-'a']++
    }

    h := &maxFreqHeap{}
    for i, f := range freq {
        if f > 0 {
            heap.Push(h, freqItem{f, i})
        }
    }
    heap.Init(h)

    result := []byte{}
    var prev freqItem

    for h.Len() > 0 {
        curr := heap.Pop(h).(freqItem)
        result = append(result, byte(curr[1]+'a'))
        curr[0]--

        if prev[0] > 0 {
            heap.Push(h, prev)
        }
        prev = curr
    }

    if len(result) == len(s) {
        return string(result)
    }
    return ""
}\
"""

GO_VAR6 = """\
// Kadane's Algorithm - Maximum Subarray
func maxSubArray(nums []int) int {
    maxSum := nums[0]
    currentSum := nums[0]

    for i := 1; i < len(nums); i++ {
        // Greedy choice: start fresh if currentSum is negative
        if nums[i] > currentSum+nums[i] {
            currentSum = nums[i]
        } else {
            currentSum = currentSum + nums[i]
        }
        if currentSum > maxSum {
            maxSum = currentSum
        }
    }
    return maxSum
}\
"""

GO_VAR7 = """\
// Gas Station
func canCompleteCircuit(gas []int, cost []int) int {
    totalGain, currentGain, start := 0, 0, 0

    for i := 0; i < len(gas); i++ {
        gain := gas[i] - cost[i]
        totalGain += gain
        currentGain += gain

        if currentGain < 0 {
            start = i + 1
            currentGain = 0
        }
    }
    if totalGain >= 0 {
        return start
    }
    return -1
}\
"""

GO_VAR8 = """\
// Partition Labels
func partitionLabels(s string) []int {
    lastIndex := [26]int{}
    for i, c := range s {
        lastIndex[c-'a'] = i
    }

    result := []int{}
    start, end := 0, 0

    for i, c := range s {
        if lastIndex[c-'a'] > end {
            end = lastIndex[c-'a']
        }
        if i == end {
            result = append(result, end-start+1)
            start = i + 1
        }
    }
    return result
}\
"""

GO_VAR9 = """\
// Valid Parenthesis String
func checkValidString(s string) bool {
    low, high := 0, 0

    for _, c := range s {
        if c == '(' {
            low++
            high++
        } else if c == ')' {
            low--
            high--
        } else {
            low--  // '*' as ')'
            high++ // '*' as '('
        }

        if high < 0 {
            return false
        }
        if low < 0 {
            low = 0
        }
    }
    return low == 0
}\
"""

GO_VAR10 = """\
// Remove K Digits
func removeKdigits(num string, k int) string {
    stack := []byte{}

    for i := 0; i < len(num); i++ {
        digit := num[i]
        for k > 0 && len(stack) > 0 && stack[len(stack)-1] > digit {
            stack = stack[:len(stack)-1]
            k--
        }
        stack = append(stack, digit)
    }

    // Remove remaining digits from the back
    stack = stack[:len(stack)-k]

    // Remove leading zeros
    start := 0
    for start < len(stack)-1 && stack[start] == '0' {
        start++
    }

    if len(stack) == 0 {
        return "0"
    }
    return string(stack[start:])
}\
"""

GO_VAR11 = """\
// Candy
func candy(ratings []int) int {
    n := len(ratings)
    candies := make([]int, n)
    for i := range candies {
        candies[i] = 1
    }

    // Pass 1: Left to Right
    for i := 1; i < n; i++ {
        if ratings[i] > ratings[i-1] {
            candies[i] = candies[i-1] + 1
        }
    }

    // Pass 2: Right to Left
    for i := n - 2; i >= 0; i-- {
        if ratings[i] > ratings[i+1] && candies[i] <= candies[i+1] {
            candies[i] = candies[i+1] + 1
        }
    }

    total := 0
    for _, c := range candies {
        total += c
    }
    return total
}\
"""

GO_VAR12 = """\
// Hand of Straights / Divide Array in Sets of K Consecutive Numbers
func isNStraightHand(hand []int, groupSize int) bool {
    if len(hand)%groupSize != 0 {
        return false
    }

    // Count frequency of each card
    count := make(map[int]int)
    for _, card := range hand {
        count[card]++
    }

    // Sort keys (Go maps have no guaranteed order, unlike Java's TreeMap)
    keys := make([]int, 0, len(count))
    for k := range count {
        keys = append(keys, k)
    }
    sort.Ints(keys)

    // Process from smallest card
    for _, first := range keys {
        freq := count[first]
        if freq == 0 {
            continue
        }

        // Try to form a group starting at 'first'
        for i := 0; i < groupSize; i++ {
            card := first + i
            if count[card] < freq {
                return false
            }
            count[card] -= freq
        }
    }
    return true
}\
"""

GO_VAR13 = """\
// Merge Triplets to Form Target
func mergeTriplets(triplets [][]int, target []int) bool {
    found := [3]bool{}

    for _, t := range triplets {
        // Filter: skip if any value exceeds target
        if t[0] > target[0] || t[1] > target[1] || t[2] > target[2] {
            continue
        }

        // Collect: check which target components this provides
        for i := 0; i < 3; i++ {
            if t[i] == target[i] {
                found[i] = true
            }
        }
    }

    return found[0] && found[1] && found[2]
}\
"""

# Go-specific mistakes block to append to section 17
GO_MISTAKES_BLOCK = """

## Go-Specific Mistakes

**Mistake: Using math.Max for integers**

Go's `math.Max` operates on `float64`, not `int`. Use explicit comparisons or Go 1.21's built-in `max`.

```go
// Bad - compiles but converts unnecessarily
import "math"
best = int(math.Max(float64(best), float64(val)))

// Good - explicit comparison
if val > best {
    best = val
}

// Also good (Go 1.21+)
best = max(best, val)
```

**Mistake: Forgetting that Go maps have no guaranteed iteration order**

Java's `TreeMap` iterates in sorted key order. Go's `map` does not. For problems like Hand of Straights where you must process keys in ascending order, extract and sort keys explicitly.

```go
// Bad - iteration order is random
for key := range count {
    // process assuming sorted order? Undefined behavior!
}

// Good
keys := make([]int, 0, len(count))
for k := range count {
    keys = append(keys, k)
}
sort.Ints(keys)
for _, key := range keys {
    // now processing in ascending order
}
```

**Mistake: Slice insertion vs list insertion**

Java has `list.add(index, item)`. In Go, insert into a slice with append + copy.

```go
// Inserting person at index k in result (Queue Reconstruction)
result = append(result, person) // grow the slice
copy(result[k+1:], result[k:]) // shift elements right
result[k] = person              // place at correct position
```

**Mistake: sort.Ints vs sort.Slice for 2D slices**

`sort.Ints` only sorts a flat `[]int`. For `[][]int` or custom comparators, use `sort.Slice`.

```go
// Bad - sort.Ints can't sort a 2D slice by a specific column
sort.Ints(intervals) // compile error or wrong behavior

// Good
sort.Slice(intervals, func(i, j int) bool {
    return intervals[i][1] < intervals[j][1] // sort by end time
})
```"""

# Go templates block to append to section 20
GO_TEMPLATES_BLOCK = """

## Go Templates

### Handling the Go Greedy Gap

Go covers all greedy patterns well with its standard library. The main differences from Java/JavaScript:

- **Sorting:** `sort.Slice(s, func(i, j int) bool { return s[i] < s[j] })` instead of `Arrays.sort` with lambda
- **No sorted map:** Go's `map` has random iteration order. Extract and `sort.Ints(keys)` explicitly when you need sorted key traversal (e.g., Hand of Straights)
- **No Math.max for ints:** Use `if a > b { ... }` or Go 1.21's built-in `max(a, b)`
- **Slice insertion:** `append + copy` idiom replaces `list.add(index, item)`

**Template 1: Running Max/Min (Go)**

```go
// Buy/Sell Stock variant
if len(prices) == 0 {
    return 0
}

minPrice := prices[0]
maxProfit := 0

for i := 1; i < len(prices); i++ {
    profit := prices[i] - minPrice
    if profit > maxProfit {
        maxProfit = profit
    }
    if prices[i] < minPrice {
        minPrice = prices[i]
    }
}
return maxProfit

// Jump Game variant (reachability)
maxReach := 0
for i := 0; i < len(nums); i++ {
    if i > maxReach {
        return false
    }
    if i+nums[i] > maxReach {
        maxReach = i + nums[i]
    }
}
return true
```

**Template 2: Interval Selection (Go)**

```go
if len(intervals) == 0 {
    return 0
}

sort.Slice(intervals, func(i, j int) bool {
    return intervals[i][1] < intervals[j][1] // sort by END time
})

count := 1
lastEnd := intervals[0][1]

for i := 1; i < len(intervals); i++ {
    if intervals[i][0] >= lastEnd { // no overlap
        count++
        lastEnd = intervals[i][1]
    }
}
return count // or len(intervals)-count for removals
```

**Template 3: Two-Pointer Greedy (Go)**

```go
sort.Ints(arr)
left, right := 0, len(arr)-1
count := 0

for left <= right {
    if arr[left]+arr[right] <= limit {
        // Can pair smallest and largest
        left++
        right--
    } else {
        // Largest goes alone
        right--
    }
    count++
}
return count
```

**Template 4: Greedy with Pre-computation (Go)**

```go
// Step 1: Pre-compute helper data
lastIndex := [26]int{}
for i, c := range s {
    lastIndex[c-'a'] = i
}

// Step 2: Greedy scan using pre-computed data
result := []int{}
start, end := 0, 0

for i, c := range s {
    if lastIndex[c-'a'] > end {
        end = lastIndex[c-'a']
    }

    if i == end {
        result = append(result, end-start+1)
        start = i + 1
    }
}
return result
```

**Template 5: Circular Array Greedy (Go)**

```go
total, tank, start := 0, 0, 0

for i := 0; i < len(gas); i++ {
    net := gas[i] - cost[i]
    total += net
    tank += net

    if tank < 0 {
        start = i + 1 // reset: start from next station
        tank = 0
    }
}

if total >= 0 {
    return start
}
return -1
```

**Template 6: BFS-like Level Tracking (Go)**

```go
if len(nums) <= 1 {
    return 0
}

jumps, currentEnd, farthest := 0, 0, 0

for i := 0; i < len(nums)-1; i++ {
    if i+nums[i] > farthest {
        farthest = i + nums[i]
    }

    if i == currentEnd {
        jumps++
        currentEnd = farthest

        if currentEnd >= len(nums)-1 {
            break
        }
    }
}
return jumps
```

**Template 7: Frequency Map Processing (Go)**

```go
count := make(map[int]int)
for _, num := range hand {
    count[num]++
}

// Must sort keys explicitly - Go maps have no order
keys := make([]int, 0, len(count))
for k := range count {
    keys = append(keys, k)
}
sort.Ints(keys)

for _, start := range keys {
    freq := count[start]
    if freq == 0 {
        continue
    }

    for i := 0; i < groupSize; i++ {
        card := start + i
        if count[card] < freq {
            return false
        }
        count[card] -= freq
    }
}
return true
```

**Template 8: Sort + Strategic Insert (Go)**

```go
// Sort by primary DESC, secondary ASC
sort.Slice(people, func(i, j int) bool {
    if people[i][0] != people[j][0] {
        return people[i][0] > people[j][0] // Height DESC
    }
    return people[i][1] < people[j][1] // k ASC
})

result := make([][]int, 0, len(people))
for _, person := range people {
    k := person[1]
    result = append(result, person) // grow
    copy(result[k+1:], result[k:]) // shift right
    result[k] = person             // place at k
}
return result
```

**Template 9: Filter and Check Coverage (Go)**

```go
found := [3]bool{}

for _, item := range items {
    // Skip if any dimension exceeds target
    if item[0] > target[0] || item[1] > target[1] || item[2] > target[2] {
        continue
    }

    // Mark which target values this item provides
    for i := 0; i < 3; i++ {
        if item[i] == target[i] {
            found[i] = true
        }
    }
}

return found[0] && found[1] && found[2]
```

**Template 10: Kadane's Algorithm (Go)**

```go
maxSum := nums[0]
currentSum := nums[0]

for i := 1; i < len(nums); i++ {
    // Either extend current subarray or start fresh
    if nums[i] > currentSum+nums[i] {
        currentSum = nums[i]
    } else {
        currentSum = currentSum + nums[i]
    }
    if currentSum > maxSum {
        maxSum = currentSum
    }
}
return maxSum
```

**Template 11: Range Tracking (Go)**

```go
low, high := 0, 0

for _, c := range s {
    if c == '(' {
        low++
        high++
    } else if c == ')' {
        low--
        high--
    } else { // wildcard: could be '(', ')', or empty
        low--  // if treated as ')'
        high++ // if treated as '('
    }

    if high < 0 {
        return false // too many ')'
    }
    if low < 0 {
        low = 0 // can't have negative open parens
    }
}

return low == 0 // balanced if 0 is achievable
```"""

# Go key insight to add
GO_KEY_INSIGHT = "SORTING IN GO: Use sort.Slice with a closure for custom comparators. Go maps have no guaranteed order — extract keys and sort.Ints(keys) when sorted iteration is required (e.g., Hand of Straights). No Math.max for ints: use explicit if comparisons or Go 1.21's built-in max/min."

# Go common mistake to add
GO_COMMON_MISTAKE = "Go: map iteration order is random — unlike Java's TreeMap, extracting and sorting keys is required when processing in ascending order. Also, sort.Slice replaces Arrays.sort, and slice insertion (append+copy) replaces list.add(index, item)."


def patch():
    with open("frontend/src/lib/patterns.json", encoding="utf-8") as f:
        data = json.load(f)

    greedy = next(p for p in data if p.get("id") == "greedy")
    t = greedy["tutorial"]

    # Code sections: add go key
    t[3]["code"]["go"] = GO_S3
    t[4]["code"]["go"] = GO_S4
    t[5]["code"]["go"] = GO_S5
    t[6]["code"]["go"] = GO_S6
    t[7]["code"]["go"] = GO_S7
    t[8]["code"]["go"] = GO_S8
    t[9]["code"]["go"] = GO_S9
    t[10]["code"]["go"] = GO_S10
    t[11]["code"]["go"] = GO_S11
    t[12]["code"]["go"] = GO_S12
    t[13]["code"]["go"] = GO_S13
    t[14]["code"]["go"] = GO_S14
    t[15]["code"]["go"] = GO_S15

    # codeTemplates
    greedy["codeTemplates"]["go"] = GO_CODE_TEMPLATES

    # Variation templates
    greedy["variations"][0]["template"]["go"] = GO_VAR0
    greedy["variations"][1]["template"]["go"] = GO_VAR1
    greedy["variations"][2]["template"]["go"] = GO_VAR2
    greedy["variations"][3]["template"]["go"] = GO_VAR3
    greedy["variations"][4]["template"]["go"] = GO_VAR4
    greedy["variations"][5]["template"]["go"] = GO_VAR5
    greedy["variations"][6]["template"]["go"] = GO_VAR6
    greedy["variations"][7]["template"]["go"] = GO_VAR7
    greedy["variations"][8]["template"]["go"] = GO_VAR8
    greedy["variations"][9]["template"]["go"] = GO_VAR9
    greedy["variations"][10]["template"]["go"] = GO_VAR10
    greedy["variations"][11]["template"]["go"] = GO_VAR11
    greedy["variations"][12]["template"]["go"] = GO_VAR12
    greedy["variations"][13]["template"]["go"] = GO_VAR13

    # Section 17: append Go-specific mistakes
    if "## Go-Specific Mistakes" not in t[17]["content"]:
        t[17]["content"] += GO_MISTAKES_BLOCK

    # Section 20: append Go templates
    if "## Go Templates" not in t[20]["content"]:
        t[20]["content"] += GO_TEMPLATES_BLOCK

    # keyInsights: add Go entry if not present
    if not any("SORTING IN GO" in ki for ki in greedy["keyInsights"]):
        greedy["keyInsights"].append(GO_KEY_INSIGHT)

    # commonMistakes: add Go entry if not present
    if not any("Go:" in cm for cm in greedy["commonMistakes"]):
        greedy["commonMistakes"].append(GO_COMMON_MISTAKE)

    with open("frontend/src/lib/patterns.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print("Patch applied. Running verification...")
    verify(greedy)


def verify(greedy):
    t = greedy["tutorial"]
    failures = []

    def check(cond, msg):
        if not cond:
            failures.append(msg)

    # Code sections
    for i in range(3, 16):
        check("go" in t[i]["code"], f"Section {i} ({t[i]['title']}): missing go key")
        check(len(t[i]["code"]["go"]) > 50, f"Section {i}: go code too short")

    # codeTemplates
    check("go" in greedy["codeTemplates"], "codeTemplates missing go key")
    check(len(greedy["codeTemplates"]["go"]) > 200, "codeTemplates go too short")

    # Variation templates
    for i, v in enumerate(greedy["variations"]):
        check("go" in v["template"], f"variation[{i}] ({v['name']}): missing go key")
        check(len(v["template"]["go"]) > 50, f"variation[{i}]: go template too short")

    # Content updates
    check("Go-Specific Mistakes" in t[17]["content"], "Section 17 missing Go-Specific Mistakes")
    check("Go Templates" in t[20]["content"], "Section 20 missing Go Templates")
    check("Handling the Go Greedy Gap" in t[20]["content"], "Section 20 missing Go Greedy Gap callout")

    # keyInsights and commonMistakes
    check(any("SORTING IN GO" in ki for ki in greedy["keyInsights"]), "keyInsights missing Go entry")
    check(any("Go:" in cm for cm in greedy["commonMistakes"]), "commonMistakes missing Go entry")

    # Specific Go idioms
    check("sort.Slice" in greedy["codeTemplates"]["go"], "codeTemplates: missing sort.Slice")
    check("sort.Slice" in t[3]["code"]["go"], "Section 3: missing sort.Slice")
    check("sort.Ints" in t[9]["code"]["go"], "Section 9: missing sort.Ints for keys")
    check("[26]int{}" in t[10]["code"]["go"], "Section 10: missing [26]int array")
    check("copy(result[k+1:]" in t[11]["code"]["go"], "Section 11: missing copy idiom for insertion")
    check("math.MaxInt32" in t[6]["code"]["go"], "Section 6: missing math.MaxInt32")
    check("sort.Ints(people)" in t[8]["code"]["go"], "Section 8: missing sort.Ints")

    # Variation-specific checks
    check("sort.Slice" in greedy["variations"][0]["template"]["go"], "var[0]: missing sort.Slice")
    check("sort.Ints" in greedy["variations"][12]["template"]["go"], "var[12]: missing sort.Ints for keys")
    check("heap.Push" in greedy["variations"][5]["template"]["go"], "var[5]: missing heap.Push")
    check("maxFreqHeap" in greedy["variations"][5]["template"]["go"], "var[5]: missing maxFreqHeap type")

    total = 13 + 1 + 14 + 3 + 2 + 7 + 4  # code sections + templates + vars + content + insights + idioms + var-specific
    passed = total - len(failures)
    print(f"\n{passed}/{total} checks passed.")

    if failures:
        print("\nFAILED:")
        for f in failures:
            print(f"  FAIL: {f}")
    else:
        print("All checks passed!")


if __name__ == "__main__":
    patch()
