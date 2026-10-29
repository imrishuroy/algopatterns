#!/usr/bin/env python3
"""Patches the dynamic-programming pattern in patterns.json with Go language support."""
import json

# ─── Section 3: 1D DP (Climbing Stairs) ──────────────────────────────────────

GO_S3_RECURSION = """\
// Climbing Stairs - Recursion
// Count ways to climb n stairs (1 or 2 steps at a time)
// TIME: O(2^n), SPACE: O(n)

func climbStairs(n int) int {
    if n <= 1 {
        return 1
    }
    return climbStairs(n-1) + climbStairs(n-2)
}\
"""

GO_S3_MEMO = """\
// Climbing Stairs - Memoization
// TIME: O(n), SPACE: O(n)

func climbStairs(n int) int {
    memo := make([]int, n+1)
    for i := range memo {
        memo[i] = -1
    }
    return solve(n, memo)
}

func solve(n int, memo []int) int {
    if n <= 1 {
        return 1
    }
    if memo[n] != -1 {
        return memo[n]
    }
    memo[n] = solve(n-1, memo) + solve(n-2, memo)
    return memo[n]
}\
"""

GO_S3_TAB = """\
// Climbing Stairs - Tabulation
// TIME: O(n), SPACE: O(n)

func climbStairs(n int) int {
    if n <= 1 {
        return 1
    }
    dp := make([]int, n+1)
    dp[0] = 1
    dp[1] = 1
    for i := 2; i <= n; i++ {
        dp[i] = dp[i-1] + dp[i-2]
    }
    return dp[n]
}\
"""

GO_S3_SPACE = """\
// Climbing Stairs - Space Optimized
// TIME: O(n), SPACE: O(1)

func climbStairs(n int) int {
    if n <= 1 {
        return 1
    }
    prev2, prev1 := 1, 1
    for i := 2; i <= n; i++ {
        curr := prev1 + prev2
        prev2 = prev1
        prev1 = curr
    }
    return prev1
}\
"""

# ─── Section 4: Decision DP (House Robber) ───────────────────────────────────

GO_S4_RECURSION = """\
// House Robber - Recursion
// Max money robbing non-adjacent houses
// TIME: O(2^n), SPACE: O(n)

func rob(nums []int) int {
    return solve(len(nums)-1, nums)
}

func solve(n int, nums []int) int {
    if n < 0 {
        return 0
    }
    skip := solve(n-1, nums)
    take := nums[n] + solve(n-2, nums)
    if skip > take {
        return skip
    }
    return take
}\
"""

GO_S4_MEMO = """\
// House Robber - Memoization
// TIME: O(n), SPACE: O(n)

func rob(nums []int) int {
    memo := make([]int, len(nums))
    for i := range memo {
        memo[i] = -1
    }
    return solve(len(nums)-1, nums, memo)
}

func solve(n int, nums, memo []int) int {
    if n < 0 {
        return 0
    }
    if memo[n] != -1 {
        return memo[n]
    }
    skip := solve(n-1, nums, memo)
    take := nums[n] + solve(n-2, nums, memo)
    if skip > take {
        memo[n] = skip
    } else {
        memo[n] = take
    }
    return memo[n]
}\
"""

GO_S4_TAB = """\
// House Robber - Tabulation
// TIME: O(n), SPACE: O(n)

func rob(nums []int) int {
    n := len(nums)
    if n == 0 {
        return 0
    }
    if n == 1 {
        return nums[0]
    }
    dp := make([]int, n)
    dp[0] = nums[0]
    dp[1] = nums[0]
    if nums[1] > dp[1] {
        dp[1] = nums[1]
    }
    for i := 2; i < n; i++ {
        take := nums[i] + dp[i-2]
        if dp[i-1] > take {
            dp[i] = dp[i-1]
        } else {
            dp[i] = take
        }
    }
    return dp[n-1]
}\
"""

GO_S4_SPACE = """\
// House Robber - Space Optimized
// TIME: O(n), SPACE: O(1)

func rob(nums []int) int {
    n := len(nums)
    if n == 0 {
        return 0
    }
    if n == 1 {
        return nums[0]
    }
    prev2 := nums[0]
    prev1 := nums[0]
    if nums[1] > prev1 {
        prev1 = nums[1]
    }
    for i := 2; i < n; i++ {
        curr := prev1
        take := nums[i] + prev2
        if take > curr {
            curr = take
        }
        prev2 = prev1
        prev1 = curr
    }
    return prev1
}\
"""

# ─── Section 5: 0/1 Knapsack ─────────────────────────────────────────────────

GO_S5_RECURSION = """\
// 0/1 Knapsack - Recursion
// TIME: O(2^n), SPACE: O(n)

func knapsack(weights, values []int, capacity int) int {
    return solve(len(weights)-1, weights, values, capacity)
}

func solve(i int, weights, values []int, capacity int) int {
    if i < 0 || capacity == 0 {
        return 0
    }
    skip := solve(i-1, weights, values, capacity)
    take := 0
    if weights[i] <= capacity {
        take = values[i] + solve(i-1, weights, values, capacity-weights[i])
    }
    if skip > take {
        return skip
    }
    return take
}\
"""

GO_S5_MEMO = """\
// 0/1 Knapsack - Memoization
// TIME: O(n * capacity), SPACE: O(n * capacity)

func knapsack(weights, values []int, capacity int) int {
    n := len(weights)
    memo := make([][]int, n)
    for i := range memo {
        memo[i] = make([]int, capacity+1)
        for j := range memo[i] {
            memo[i][j] = -1
        }
    }
    return solve(n-1, weights, values, capacity, memo)
}

func solve(i int, weights, values []int, capacity int, memo [][]int) int {
    if i < 0 || capacity == 0 {
        return 0
    }
    if memo[i][capacity] != -1 {
        return memo[i][capacity]
    }
    skip := solve(i-1, weights, values, capacity, memo)
    take := 0
    if weights[i] <= capacity {
        take = values[i] + solve(i-1, weights, values, capacity-weights[i], memo)
    }
    if skip > take {
        memo[i][capacity] = skip
    } else {
        memo[i][capacity] = take
    }
    return memo[i][capacity]
}\
"""

GO_S5_TAB = """\
// 0/1 Knapsack - Tabulation
// TIME: O(n * capacity), SPACE: O(n * capacity)

func knapsack(weights, values []int, capacity int) int {
    n := len(weights)
    dp := make([][]int, n+1)
    for i := range dp {
        dp[i] = make([]int, capacity+1)
    }
    for i := 1; i <= n; i++ {
        for c := 0; c <= capacity; c++ {
            dp[i][c] = dp[i-1][c]
            if weights[i-1] <= c {
                take := values[i-1] + dp[i-1][c-weights[i-1]]
                if take > dp[i][c] {
                    dp[i][c] = take
                }
            }
        }
    }
    return dp[n][capacity]
}\
"""

GO_S5_SPACE = """\
// 0/1 Knapsack - Space Optimized
// BACKWARD loop ensures each item used at most once
// TIME: O(n * capacity), SPACE: O(capacity)

func knapsack(weights, values []int, capacity int) int {
    dp := make([]int, capacity+1)
    for i, w := range weights {
        for c := capacity; c >= w; c-- {
            take := values[i] + dp[c-w]
            if take > dp[c] {
                dp[c] = take
            }
        }
    }
    return dp[capacity]
}\
"""

# ─── Section 6: Unbounded Knapsack ───────────────────────────────────────────

GO_S6_RECURSION = """\
// Unbounded Knapsack - Recursion
// Each item can be used unlimited times
// TIME: O(n^capacity), SPACE: O(capacity)

func unboundedKnapsack(weights, values []int, capacity int) int {
    return solve(weights, values, capacity)
}

func solve(weights, values []int, cap int) int {
    if cap == 0 {
        return 0
    }
    best := 0
    for i, w := range weights {
        if w <= cap {
            take := values[i] + solve(weights, values, cap-w)
            if take > best {
                best = take
            }
        }
    }
    return best
}

// Test: weights = [2, 3, 4], values = [4, 5, 7], capacity = 7
// Output: 13 (items with w=2,2,3 give v=4+4+5=13)\
"""

GO_S6_MEMO = """\
// Unbounded Knapsack - Memoization
// TIME: O(n * capacity), SPACE: O(capacity)

func unboundedKnapsack(weights, values []int, capacity int) int {
    memo := make([]int, capacity+1)
    for i := range memo {
        memo[i] = -1
    }
    return solve(weights, values, capacity, memo)
}

func solve(weights, values []int, cap int, memo []int) int {
    if cap == 0 {
        return 0
    }
    if memo[cap] != -1 {
        return memo[cap]
    }
    best := 0
    for i, w := range weights {
        if w <= cap {
            take := values[i] + solve(weights, values, cap-w, memo)
            if take > best {
                best = take
            }
        }
    }
    memo[cap] = best
    return best
}

// Test: weights = [2, 3, 4], values = [4, 5, 7], capacity = 7
// Output: 13\
"""

GO_S6_TAB = """\
// Unbounded Knapsack - Tabulation
// FORWARD loop allows item reuse
// TIME: O(n * capacity), SPACE: O(capacity)

func unboundedKnapsack(weights, values []int, capacity int) int {
    dp := make([]int, capacity+1)
    for i, w := range weights {
        for c := w; c <= capacity; c++ { // FORWARD!
            take := values[i] + dp[c-w]
            if take > dp[c] {
                dp[c] = take
            }
        }
    }
    return dp[capacity]
}

// Test: weights = [2, 3, 4], values = [4, 5, 7], capacity = 7
// dp evolution:
// After item 0 (w=2,v=4): [0,0,4,4,8,8,12,12]
// After item 1 (w=3,v=5): [0,0,4,5,8,9,12,13]
// After item 2 (w=4,v=7): [0,0,4,5,8,9,12,13]
// Output: 13\
"""

GO_S6_SPACE = """\
// Unbounded Knapsack - Space Optimized
// Same as tabulation (already 1D)
// TIME: O(n * capacity), SPACE: O(capacity)

func unboundedKnapsack(weights, values []int, capacity int) int {
    dp := make([]int, capacity+1)
    for i, w := range weights {
        for c := w; c <= capacity; c++ {
            take := values[i] + dp[c-w]
            if take > dp[c] {
                dp[c] = take
            }
        }
    }
    return dp[capacity]
}

// Key insight:
// FORWARD loop = unlimited use (unbounded)
// BACKWARD loop = single use (0/1 knapsack)\
"""

# ─── Section 7: LCS ──────────────────────────────────────────────────────────

GO_S7_RECURSION = """\
// LCS - Recursion
// TIME: O(2^(m+n)), SPACE: O(m+n)

func longestCommonSubsequence(text1, text2 string) int {
    return lcs(len(text1)-1, len(text2)-1, text1, text2)
}

func lcs(i, j int, text1, text2 string) int {
    if i < 0 || j < 0 {
        return 0
    }
    if text1[i] == text2[j] {
        return 1 + lcs(i-1, j-1, text1, text2)
    }
    left := lcs(i-1, j, text1, text2)
    right := lcs(i, j-1, text1, text2)
    if left > right {
        return left
    }
    return right
}\
"""

GO_S7_MEMO = """\
// LCS - Memoization
// TIME: O(m * n), SPACE: O(m * n)

func longestCommonSubsequence(text1, text2 string) int {
    m, n := len(text1), len(text2)
    memo := make([][]int, m)
    for i := range memo {
        memo[i] = make([]int, n)
        for j := range memo[i] {
            memo[i][j] = -1
        }
    }
    return lcs(m-1, n-1, text1, text2, memo)
}

func lcs(i, j int, text1, text2 string, memo [][]int) int {
    if i < 0 || j < 0 {
        return 0
    }
    if memo[i][j] != -1 {
        return memo[i][j]
    }
    if text1[i] == text2[j] {
        memo[i][j] = 1 + lcs(i-1, j-1, text1, text2, memo)
    } else {
        left := lcs(i-1, j, text1, text2, memo)
        right := lcs(i, j-1, text1, text2, memo)
        if left > right {
            memo[i][j] = left
        } else {
            memo[i][j] = right
        }
    }
    return memo[i][j]
}\
"""

GO_S7_TAB = """\
// LCS - Tabulation
// TIME: O(m * n), SPACE: O(m * n)

func longestCommonSubsequence(text1, text2 string) int {
    m, n := len(text1), len(text2)
    dp := make([][]int, m+1)
    for i := range dp {
        dp[i] = make([]int, n+1)
    }
    for i := 1; i <= m; i++ {
        for j := 1; j <= n; j++ {
            if text1[i-1] == text2[j-1] {
                dp[i][j] = 1 + dp[i-1][j-1]
            } else if dp[i-1][j] > dp[i][j-1] {
                dp[i][j] = dp[i-1][j]
            } else {
                dp[i][j] = dp[i][j-1]
            }
        }
    }
    return dp[m][n]
}\
"""

GO_S7_SPACE = """\
// LCS - Space Optimized
// TIME: O(m * n), SPACE: O(min(m, n))

func longestCommonSubsequence(text1, text2 string) int {
    if len(text1) < len(text2) {
        text1, text2 = text2, text1
    }
    m, n := len(text1), len(text2)
    prev := make([]int, n+1)
    curr := make([]int, n+1)
    for i := 1; i <= m; i++ {
        for j := 1; j <= n; j++ {
            if text1[i-1] == text2[j-1] {
                curr[j] = 1 + prev[j-1]
            } else if prev[j] > curr[j-1] {
                curr[j] = prev[j]
            } else {
                curr[j] = curr[j-1]
            }
        }
        prev, curr = curr, prev
    }
    return prev[n]
}\
"""

# ─── Section 8: LIS ──────────────────────────────────────────────────────────

GO_S8_RECURSION = """\
// LIS - Recursion
// TIME: O(2^n), SPACE: O(n)

func lengthOfLIS(nums []int) int {
    return lisHelper(0, -1, nums)
}

func lisHelper(index, prevIndex int, nums []int) int {
    if index == len(nums) {
        return 0
    }
    skip := lisHelper(index+1, prevIndex, nums)
    take := 0
    if prevIndex == -1 || nums[index] > nums[prevIndex] {
        take = 1 + lisHelper(index+1, index, nums)
    }
    if skip > take {
        return skip
    }
    return take
}\
"""

GO_S8_MEMO = """\
// LIS - Memoization
// TIME: O(n^2), SPACE: O(n^2)

func lengthOfLIS(nums []int) int {
    n := len(nums)
    memo := make([][]int, n)
    for i := range memo {
        memo[i] = make([]int, n+1)
        for j := range memo[i] {
            memo[i][j] = -1
        }
    }
    return lisHelper(0, -1, nums, memo)
}

func lisHelper(index, prevIndex int, nums []int, memo [][]int) int {
    if index == len(nums) {
        return 0
    }
    if memo[index][prevIndex+1] != -1 {
        return memo[index][prevIndex+1]
    }
    skip := lisHelper(index+1, prevIndex, nums, memo)
    take := 0
    if prevIndex == -1 || nums[index] > nums[prevIndex] {
        take = 1 + lisHelper(index+1, index, nums, memo)
    }
    if skip > take {
        memo[index][prevIndex+1] = skip
    } else {
        memo[index][prevIndex+1] = take
    }
    return memo[index][prevIndex+1]
}\
"""

GO_S8_TAB = """\
// LIS - Tabulation
// TIME: O(n^2), SPACE: O(n)

func lengthOfLIS(nums []int) int {
    n := len(nums)
    if n == 0 {
        return 0
    }
    dp := make([]int, n)
    for i := range dp {
        dp[i] = 1
    }
    maxLen := 1
    for i := 1; i < n; i++ {
        for j := 0; j < i; j++ {
            if nums[j] < nums[i] && dp[j]+1 > dp[i] {
                dp[i] = dp[j] + 1
            }
        }
        if dp[i] > maxLen {
            maxLen = dp[i]
        }
    }
    return maxLen
}\
"""

GO_S8_SPACE = """\
// LIS - Binary Search O(n log n)
// TIME: O(n log n), SPACE: O(n)

import "sort"

func lengthOfLIS(nums []int) int {
    tails := []int{}
    for _, num := range nums {
        // sort.SearchInts returns first index where tails[i] >= num
        pos := sort.SearchInts(tails, num)
        if pos == len(tails) {
            tails = append(tails, num)
        } else {
            tails[pos] = num
        }
    }
    return len(tails)
}\
"""

# ─── Section 9: Grid DP ───────────────────────────────────────────────────────

GO_S9_RECURSION = """\
// Unique Paths - Recursion
// TIME: O(2^(m+n)), SPACE: O(m+n)

func uniquePaths(m, n int) int {
    return solve(m-1, n-1)
}

func solve(i, j int) int {
    if i == 0 && j == 0 {
        return 1
    }
    if i < 0 || j < 0 {
        return 0
    }
    return solve(i-1, j) + solve(i, j-1)
}\
"""

GO_S9_MEMO = """\
// Unique Paths - Memoization
// TIME: O(m*n), SPACE: O(m*n)

func uniquePaths(m, n int) int {
    memo := make([][]int, m)
    for i := range memo {
        memo[i] = make([]int, n)
        for j := range memo[i] {
            memo[i][j] = -1
        }
    }
    return solve(m-1, n-1, memo)
}

func solve(i, j int, memo [][]int) int {
    if i == 0 && j == 0 {
        return 1
    }
    if i < 0 || j < 0 {
        return 0
    }
    if memo[i][j] != -1 {
        return memo[i][j]
    }
    memo[i][j] = solve(i-1, j, memo) + solve(i, j-1, memo)
    return memo[i][j]
}\
"""

GO_S9_TAB = """\
// Unique Paths - Tabulation
// TIME: O(m*n), SPACE: O(m*n)

func uniquePaths(m, n int) int {
    dp := make([][]int, m)
    for i := range dp {
        dp[i] = make([]int, n)
        dp[i][0] = 1
    }
    for j := 0; j < n; j++ {
        dp[0][j] = 1
    }
    for i := 1; i < m; i++ {
        for j := 1; j < n; j++ {
            dp[i][j] = dp[i-1][j] + dp[i][j-1]
        }
    }
    return dp[m-1][n-1]
}\
"""

GO_S9_SPACE = """\
// Unique Paths - Space Optimized
// TIME: O(m*n), SPACE: O(n)

func uniquePaths(m, n int) int {
    dp := make([]int, n)
    for j := range dp {
        dp[j] = 1
    }
    for i := 1; i < m; i++ {
        for j := 1; j < n; j++ {
            dp[j] += dp[j-1]
        }
    }
    return dp[n-1]
}\
"""

# ─── Section 10: Interval DP (Burst Balloons) ────────────────────────────────

GO_S10_RECURSION = """\
// Burst Balloons - Recursion
// TIME: O(2^n), SPACE: O(n)

func maxCoins(nums []int) int {
    n := len(nums)
    arr := make([]int, n+2)
    arr[0] = 1
    arr[n+1] = 1
    for i, v := range nums {
        arr[i+1] = v
    }
    return solve(1, n, arr)
}

func solve(i, j int, arr []int) int {
    if i > j {
        return 0
    }
    result := 0
    for k := i; k <= j; k++ {
        coins := arr[i-1] * arr[k] * arr[j+1]
        total := solve(i, k-1, arr) + coins + solve(k+1, j, arr)
        if total > result {
            result = total
        }
    }
    return result
}\
"""

GO_S10_MEMO = """\
// Burst Balloons - Memoization
// TIME: O(n^3), SPACE: O(n^2)

func maxCoins(nums []int) int {
    n := len(nums)
    arr := make([]int, n+2)
    arr[0] = 1
    arr[n+1] = 1
    for i, v := range nums {
        arr[i+1] = v
    }
    memo := make([][]int, n+2)
    for i := range memo {
        memo[i] = make([]int, n+2)
        for j := range memo[i] {
            memo[i][j] = -1
        }
    }
    return solve(1, n, arr, memo)
}

func solve(i, j int, arr []int, memo [][]int) int {
    if i > j {
        return 0
    }
    if memo[i][j] != -1 {
        return memo[i][j]
    }
    result := 0
    for k := i; k <= j; k++ {
        coins := arr[i-1] * arr[k] * arr[j+1]
        total := solve(i, k-1, arr, memo) + coins + solve(k+1, j, arr, memo)
        if total > result {
            result = total
        }
    }
    memo[i][j] = result
    return result
}\
"""

GO_S10_TAB = """\
// Burst Balloons - Tabulation
// TIME: O(n^3), SPACE: O(n^2)

func maxCoins(nums []int) int {
    n := len(nums)
    arr := make([]int, n+2)
    arr[0] = 1
    arr[n+1] = 1
    for i, v := range nums {
        arr[i+1] = v
    }
    dp := make([][]int, n+2)
    for i := range dp {
        dp[i] = make([]int, n+2)
    }
    for length := 1; length <= n; length++ {
        for i := 1; i <= n-length+1; i++ {
            j := i + length - 1
            for k := i; k <= j; k++ {
                coins := arr[i-1] * arr[k] * arr[j+1]
                total := dp[i][k-1] + coins + dp[k+1][j]
                if total > dp[i][j] {
                    dp[i][j] = total
                }
            }
        }
    }
    return dp[1][n]
}\
"""

GO_S10_SPACE = """\
// Interval DP - Space Optimization Not Typical
// Most interval DP needs full O(n^2) table
// TIME: O(n^3), SPACE: O(n^2)

// Same as tabulation - 2D table required
// because dp[i][j] depends on both
// dp[i][k] and dp[k+1][j]

func maxCoins(nums []int) int {
    n := len(nums)
    arr := make([]int, n+2)
    arr[0] = 1
    arr[n+1] = 1
    for i, v := range nums {
        arr[i+1] = v
    }
    dp := make([][]int, n+2)
    for i := range dp {
        dp[i] = make([]int, n+2)
    }
    for length := 1; length <= n; length++ {
        for i := 1; i <= n-length+1; i++ {
            j := i + length - 1
            for k := i; k <= j; k++ {
                coins := arr[i-1] * arr[k] * arr[j+1]
                total := dp[i][k-1] + coins + dp[k+1][j]
                if total > dp[i][j] {
                    dp[i][j] = total
                }
            }
        }
    }
    return dp[1][n]
}\
"""

# ─── Section 11: Palindrome DP ───────────────────────────────────────────────

GO_S11_RECURSION = """\
// Longest Palindromic Substring - Recursion
// TIME: O(n^3), SPACE: O(n)

func longestPalindrome(s string) string {
    n := len(s)
    if n == 0 {
        return ""
    }
    start, maxLen := 0, 1
    for i := 0; i < n; i++ {
        for j := i; j < n; j++ {
            if isPalindrome(s, i, j) && j-i+1 > maxLen {
                start = i
                maxLen = j - i + 1
            }
        }
    }
    return s[start : start+maxLen]
}

func isPalindrome(s string, i, j int) bool {
    if i >= j {
        return true
    }
    if s[i] != s[j] {
        return false
    }
    return isPalindrome(s, i+1, j-1)
}\
"""

GO_S11_MEMO = """\
// Longest Palindromic Substring - Memoization
// TIME: O(n^2), SPACE: O(n^2)

func longestPalindrome(s string) string {
    n := len(s)
    if n == 0 {
        return ""
    }
    // 0=unvisited, 1=palindrome, -1=not palindrome
    memo := make([][]int, n)
    for i := range memo {
        memo[i] = make([]int, n)
    }
    start, maxLen := 0, 1
    for i := 0; i < n; i++ {
        for j := i; j < n; j++ {
            if isPalin(s, i, j, memo) && j-i+1 > maxLen {
                start = i
                maxLen = j - i + 1
            }
        }
    }
    return s[start : start+maxLen]
}

func isPalin(s string, i, j int, memo [][]int) bool {
    if i >= j {
        return true
    }
    if memo[i][j] != 0 {
        return memo[i][j] == 1
    }
    result := s[i] == s[j] && isPalin(s, i+1, j-1, memo)
    if result {
        memo[i][j] = 1
    } else {
        memo[i][j] = -1
    }
    return result
}\
"""

GO_S11_TAB = """\
// Longest Palindromic Substring - Tabulation
// Fill by increasing length so dp[i+1][j-1] is always ready
// TIME: O(n^2), SPACE: O(n^2)

func longestPalindrome(s string) string {
    n := len(s)
    if n == 0 {
        return ""
    }
    dp := make([][]bool, n)
    for i := range dp {
        dp[i] = make([]bool, n)
    }
    start, maxLen := 0, 1

    // Base: length 1
    for i := 0; i < n; i++ {
        dp[i][i] = true
    }

    // Base: length 2
    for i := 0; i < n-1; i++ {
        if s[i] == s[i+1] {
            dp[i][i+1] = true
            start = i
            maxLen = 2
        }
    }

    // General: length 3 and above
    for length := 3; length <= n; length++ {
        for i := 0; i <= n-length; i++ {
            j := i + length - 1
            if s[i] == s[j] && dp[i+1][j-1] {
                dp[i][j] = true
                if length > maxLen {
                    start = i
                    maxLen = length
                }
            }
        }
    }

    return s[start : start+maxLen]
}\
"""

GO_S11_SPACE = """\
// Longest Palindromic Substring - Expand Around Center
// O(1) space by expanding from each possible center
// TIME: O(n^2), SPACE: O(1)

func longestPalindrome(s string) string {
    n := len(s)
    if n == 0 {
        return ""
    }
    start, maxLen := 0, 1
    for center := 0; center < 2*n-1; center++ {
        left := center / 2
        right := left + center%2
        for left >= 0 && right < n && s[left] == s[right] {
            if right-left+1 > maxLen {
                start = left
                maxLen = right - left + 1
            }
            left--
            right++
        }
    }
    return s[start : start+maxLen]
}\
"""

# ─── Section 12: Multi-State DP (Stock with Cooldown) ────────────────────────

GO_S12_RECURSION = """\
// Best Time to Buy and Sell Stock with Cooldown - Recursion
// TIME: O(2^n), SPACE: O(n)

func maxProfit(prices []int) int {
    // state: 0=REST, 1=HOLD, 2=SOLD
    var dfs func(day, state int) int
    dfs = func(day, state int) int {
        if day >= len(prices) {
            return 0
        }
        if state == 0 { // REST: buy or do nothing
            buy := dfs(day+1, 1) - prices[day]
            rest := dfs(day+1, 0)
            if buy > rest {
                return buy
            }
            return rest
        } else if state == 1 { // HOLD: sell or keep holding
            sell := dfs(day+1, 2) + prices[day]
            hold := dfs(day+1, 1)
            if sell > hold {
                return sell
            }
            return hold
        }
        // SOLD: cooldown
        return dfs(day+1, 0)
    }
    return dfs(0, 0)
}\
"""

GO_S12_MEMO = """\
// Best Time to Buy and Sell Stock with Cooldown - Memoization
// TIME: O(n), SPACE: O(n)

func maxProfit(prices []int) int {
    n := len(prices)
    memo := make([][3]int, n)
    for i := range memo {
        memo[i] = [3]int{-1, -1, -1}
    }
    // state: 0=REST, 1=HOLD, 2=SOLD
    var dfs func(day, state int) int
    dfs = func(day, state int) int {
        if day >= n {
            return 0
        }
        if memo[day][state] != -1 {
            return memo[day][state]
        }
        var result int
        if state == 0 {
            buy := dfs(day+1, 1) - prices[day]
            rest := dfs(day+1, 0)
            if buy > rest {
                result = buy
            } else {
                result = rest
            }
        } else if state == 1 {
            sell := dfs(day+1, 2) + prices[day]
            hold := dfs(day+1, 1)
            if sell > hold {
                result = sell
            } else {
                result = hold
            }
        } else {
            result = dfs(day+1, 0)
        }
        memo[day][state] = result
        return result
    }
    return dfs(0, 0)
}\
"""

GO_S12_TAB = """\
// Best Time to Buy and Sell Stock with Cooldown - Tabulation
// TIME: O(n), SPACE: O(n)

func maxProfit(prices []int) int {
    n := len(prices)
    if n == 0 {
        return 0
    }
    hold := make([]int, n)
    sold := make([]int, n)
    rest := make([]int, n)

    hold[0] = -prices[0]
    sold[0] = -(1 << 30) // impossible on day 0
    rest[0] = 0

    for i := 1; i < n; i++ {
        newHold := hold[i-1]
        if rest[i-1]-prices[i] > newHold {
            newHold = rest[i-1] - prices[i] // buy only from REST
        }
        hold[i] = newHold
        sold[i] = hold[i-1] + prices[i] // sell from HOLD
        newRest := rest[i-1]
        if sold[i-1] > newRest {
            newRest = sold[i-1] // cooldown ends
        }
        rest[i] = newRest
    }

    if sold[n-1] > rest[n-1] {
        return sold[n-1]
    }
    return rest[n-1]
}\
"""

GO_S12_SPACE = """\
// Best Time to Buy and Sell Stock with Cooldown - Space Optimized O(1)
// TIME: O(n), SPACE: O(1)

func maxProfit(prices []int) int {
    n := len(prices)
    if n == 0 {
        return 0
    }
    hold := -prices[0]
    sold := -(1 << 30) // impossible on day 0
    rest := 0

    for i := 1; i < n; i++ {
        prevHold := hold // save BEFORE hold updates
        newHold := hold
        if rest-prices[i] > newHold {
            newHold = rest - prices[i]
        }
        newRest := rest
        if sold > newRest {
            newRest = sold // use OLD sold
        }
        newSold := prevHold + prices[i] // use saved prevHold
        hold = newHold
        rest = newRest
        sold = newSold
    }

    if sold > rest {
        return sold
    }
    return rest
}\
"""

# ─── Section 13: Tree DP (House Robber III) ──────────────────────────────────

GO_S13_RECURSION = """\
// House Robber III - Recursion
// TIME: Exponential, SPACE: O(h)

type TreeNode struct {
    Val   int
    Left  *TreeNode
    Right *TreeNode
}

func rob(root *TreeNode) int {
    r := robNode(root)
    s := skipNode(root)
    if r > s {
        return r
    }
    return s
}

func robNode(node *TreeNode) int {
    if node == nil {
        return 0
    }
    return node.Val + skipNode(node.Left) + skipNode(node.Right)
}

func skipNode(node *TreeNode) int {
    if node == nil {
        return 0
    }
    leftBest := robNode(node.Left)
    if s := skipNode(node.Left); s > leftBest {
        leftBest = s
    }
    rightBest := robNode(node.Right)
    if s := skipNode(node.Right); s > rightBest {
        rightBest = s
    }
    return leftBest + rightBest
}\
"""

GO_S13_MEMO = """\
// House Robber III - Memoization
// TIME: O(n), SPACE: O(n)

func rob(root *TreeNode) int {
    robMemo := make(map[*TreeNode]int)
    skipMemo := make(map[*TreeNode]int)

    var robNode func(*TreeNode) int
    var skipNodeFn func(*TreeNode) int

    robNode = func(node *TreeNode) int {
        if node == nil {
            return 0
        }
        if v, ok := robMemo[node]; ok {
            return v
        }
        result := node.Val + skipNodeFn(node.Left) + skipNodeFn(node.Right)
        robMemo[node] = result
        return result
    }

    skipNodeFn = func(node *TreeNode) int {
        if node == nil {
            return 0
        }
        if v, ok := skipMemo[node]; ok {
            return v
        }
        left := robNode(node.Left)
        if s := skipNodeFn(node.Left); s > left {
            left = s
        }
        right := robNode(node.Right)
        if s := skipNodeFn(node.Right); s > right {
            right = s
        }
        result := left + right
        skipMemo[node] = result
        return result
    }

    r := robNode(root)
    s := skipNodeFn(root)
    if r > s {
        return r
    }
    return s
}\
"""

GO_S13_TAB = """\
// House Robber III - Tabulation (Post-Order with Pair Return)
// TIME: O(n), SPACE: O(h)

func rob(root *TreeNode) int {
    included, excluded := solve(root)
    if included > excluded {
        return included
    }
    return excluded
}

func solve(node *TreeNode) (included, excluded int) {
    if node == nil {
        return 0, 0
    }
    leftIn, leftEx := solve(node.Left)
    rightIn, rightEx := solve(node.Right)

    // included: take this node, children excluded
    included = node.Val + leftEx + rightEx

    // excluded: skip this node, children free to choose
    leftBest := leftIn
    if leftEx > leftBest {
        leftBest = leftEx
    }
    rightBest := rightIn
    if rightEx > rightBest {
        rightBest = rightEx
    }
    excluded = leftBest + rightBest
    return
}\
"""

GO_S13_SPACE = """\
// House Robber III - Iterative Post-Order
// TIME: O(n), SPACE: O(n)
// Use when tree is very deep and recursion may overflow

func rob(root *TreeNode) int {
    if root == nil {
        return 0
    }
    type pair struct{ incl, excl int }
    dp := make(map[*TreeNode]pair)
    stack := []*TreeNode{root}

    for len(stack) > 0 {
        node := stack[len(stack)-1]
        _, leftDone := dp[node.Left]
        _, rightDone := dp[node.Right]
        leftDone = node.Left == nil || leftDone
        rightDone = node.Right == nil || rightDone

        if leftDone && rightDone {
            stack = stack[:len(stack)-1]
            var left, right pair
            if node.Left != nil {
                left = dp[node.Left]
            }
            if node.Right != nil {
                right = dp[node.Right]
            }
            incl := node.Val + left.excl + right.excl
            leftBest := left.incl
            if left.excl > leftBest {
                leftBest = left.excl
            }
            rightBest := right.incl
            if right.excl > rightBest {
                rightBest = right.excl
            }
            dp[node] = pair{incl, leftBest + rightBest}
        } else {
            if node.Right != nil {
                if _, done := dp[node.Right]; !done {
                    stack = append(stack, node.Right)
                }
            }
            if node.Left != nil {
                if _, done := dp[node.Left]; !done {
                    stack = append(stack, node.Left)
                }
            }
        }
    }

    result := dp[root]
    if result.incl > result.excl {
        return result.incl
    }
    return result.excl
}\
"""

# ─── Section 14: Bitmask DP (TSP) ────────────────────────────────────────────

GO_S14_RECURSION = """\
// TSP - Recursion
// TIME: O(n! * n), SPACE: O(n)

func minCost(dist [][]int) int {
    n := len(dist)
    return solve(0, 1, n, dist)
}

func solve(curr, mask, n int, dist [][]int) int {
    if mask == (1<<n)-1 {
        return dist[curr][0]
    }
    result := 1 << 30
    for next := 0; next < n; next++ {
        if mask&(1<<next) == 0 {
            cost := dist[curr][next] + solve(next, mask|(1<<next), n, dist)
            if cost < result {
                result = cost
            }
        }
    }
    return result
}\
"""

GO_S14_MEMO = """\
// TSP - Memoization
// TIME: O(2^n * n^2), SPACE: O(2^n * n)

func minCost(dist [][]int) int {
    n := len(dist)
    memo := make([][]int, n)
    for i := range memo {
        memo[i] = make([]int, 1<<n)
        for j := range memo[i] {
            memo[i][j] = -1
        }
    }
    return solve(0, 1, n, dist, memo)
}

func solve(curr, mask, n int, dist [][]int, memo [][]int) int {
    if mask == (1<<n)-1 {
        return dist[curr][0]
    }
    if memo[curr][mask] != -1 {
        return memo[curr][mask]
    }
    result := 1 << 30
    for next := 0; next < n; next++ {
        if mask&(1<<next) == 0 {
            cost := dist[curr][next] + solve(next, mask|(1<<next), n, dist, memo)
            if cost < result {
                result = cost
            }
        }
    }
    memo[curr][mask] = result
    return result
}\
"""

GO_S14_TAB = """\
// TSP - Tabulation
// TIME: O(2^n * n^2), SPACE: O(2^n * n)

func minCost(dist [][]int) int {
    n := len(dist)
    dp := make([][]int, 1<<n)
    for i := range dp {
        dp[i] = make([]int, n)
        for j := range dp[i] {
            dp[i][j] = 1 << 30
        }
    }
    dp[1][0] = 0

    for mask := 1; mask < (1 << n); mask++ {
        for curr := 0; curr < n; curr++ {
            if dp[mask][curr] == 1<<30 {
                continue
            }
            for next := 0; next < n; next++ {
                if mask&(1<<next) == 0 {
                    newMask := mask | (1 << next)
                    cost := dp[mask][curr] + dist[curr][next]
                    if cost < dp[newMask][next] {
                        dp[newMask][next] = cost
                    }
                }
            }
        }
    }

    fullMask := (1 << n) - 1
    result := 1 << 30
    for i := 0; i < n; i++ {
        if dp[fullMask][i] != 1<<30 {
            cost := dp[fullMask][i] + dist[i][0]
            if cost < result {
                result = cost
            }
        }
    }
    return result
}\
"""

GO_S14_SPACE = """\
// Beautiful Arrangement - Space Optimized
// TIME: O(2^n * n), SPACE: O(2^n)

import "math/bits"

func countArrangement(n int) int {
    dp := make([]int, 1<<n)
    dp[0] = 1

    for mask := 0; mask < (1 << n); mask++ {
        pos := bits.OnesCount(uint(mask)) + 1
        for i := 0; i < n; i++ {
            if mask&(1<<i) == 0 {
                num := i + 1
                if num%pos == 0 || pos%num == 0 {
                    dp[mask|(1<<i)] += dp[mask]
                }
            }
        }
    }
    return dp[(1<<n)-1]
}\
"""

# ─── codeTemplates.go ─────────────────────────────────────────────────────────

GO_CODE_TEMPLATES = """\
/*
 * DP THINKING FRAMEWORK - Example: Climbing Stairs
 *
 * STEP 1: IDENTIFY THE PROBLEM TYPE
 * - Question: Count ways to reach step n (can take 1 or 2 steps)
 * - This is a COUNTING problem: likely DP
 *
 * STEP 2: DEFINE STATE & DECISIONS
 * - STATE: Current step number (what position am I at?)
 * - DECISION: At each step, should I take 1 step or 2 steps?
 * - CHOICES: Take 1 step OR Take 2 steps
 *
 * STEP 3: WRITE RECURRENCE (in words first)
 * - ways(n) = ways(n-1) + ways(n-2)
 *
 * STEP 4: IDENTIFY BASE CASES
 * - ways(0) = 1 (one way to stay at ground)
 * - ways(1) = 1 (one way to reach step 1)
 */

// STEP 1: PURE RECURSION (Brute Force)
// Time: O(2^n), Space: O(n)
func climbStairsRecursive(n int) int {
    if n <= 1 {
        return 1
    }
    return climbStairsRecursive(n-1) + climbStairsRecursive(n-2)
}

// STEP 2: MEMOIZATION (Top-Down DP)
// Time: O(n), Space: O(n)
func climbStairsMemo(n int) int {
    memo := make([]int, n+1)
    for i := range memo {
        memo[i] = -1
    }
    return helper(n, memo)
}

func helper(n int, memo []int) int {
    if n <= 1 {
        return 1
    }
    if memo[n] != -1 {
        return memo[n] // already computed
    }
    memo[n] = helper(n-1, memo) + helper(n-2, memo)
    return memo[n]
}

// STEP 3: TABULATION (Bottom-Up DP)
// Time: O(n), Space: O(n)
func climbStairsTab(n int) int {
    if n <= 1 {
        return 1
    }
    dp := make([]int, n+1)
    dp[0] = 1
    dp[1] = 1
    for i := 2; i <= n; i++ {
        dp[i] = dp[i-1] + dp[i-2]
    }
    return dp[n]
}

// STEP 4: SPACE OPTIMIZATION
// Time: O(n), Space: O(1)
func climbStairsOptimized(n int) int {
    if n <= 1 {
        return 1
    }
    prev2 := 1 // dp[i-2]
    prev1 := 1 // dp[i-1]
    for i := 2; i <= n; i++ {
        curr := prev1 + prev2
        prev2 = prev1
        prev1 = curr
    }
    return prev1
}\
"""

# ─── variations[0].go — Universal DP Framework (House Robber) ────────────────

GO_VAR0 = """\
/*
 * UNIVERSAL DP FRAMEWORK
 * Example: House Robber - Max money robbing non-adjacent houses
 *
 * STEP 1: DEFINE THE PROBLEM
 * - Input: Array of house values [2, 7, 9, 3, 1]
 * - Output: Maximum money (can't rob adjacent houses)
 *
 * STEP 2: IDENTIFY STATE & DECISION
 * - STATE: Current house index i
 * - DECISION at each house: ROB it or SKIP it
 * - CHOICES:
 *   - ROB: Take nums[i] + answer for i+2 (skip next house)
 *   - SKIP: Take answer for i+1 (move to next house)
 *
 * STEP 3: RECURRENCE
 * - rob(i) = max(nums[i] + rob(i+2), rob(i+1))
 *
 * STEP 4: BASE CASES
 * - rob(n) = 0 (no more houses)
 * - rob(n-1) = nums[n-1] (only one house left, rob it)
 */

// RECURSION (Brute Force) - O(2^n) time
func robRecursive(nums []int, i int) int {
    if i >= len(nums) {
        return 0
    }
    rob := nums[i] + robRecursive(nums, i+2)   // ROB this house
    skip := robRecursive(nums, i+1)             // SKIP this house
    if rob > skip {
        return rob
    }
    return skip
}

// MEMOIZATION (Top-Down) - O(n) time, O(n) space
func robMemo(nums []int) int {
    memo := make([]int, len(nums))
    for i := range memo {
        memo[i] = -1
    }
    return robHelper(nums, 0, memo)
}

func robHelper(nums []int, i int, memo []int) int {
    if i >= len(nums) {
        return 0
    }
    if memo[i] != -1 {
        return memo[i]
    }
    rob := nums[i] + robHelper(nums, i+2, memo)
    skip := robHelper(nums, i+1, memo)
    if rob > skip {
        memo[i] = rob
    } else {
        memo[i] = skip
    }
    return memo[i]
}

// TABULATION (Bottom-Up) - O(n) time, O(n) space
func robTab(nums []int) int {
    n := len(nums)
    if n == 0 {
        return 0
    }
    if n == 1 {
        return nums[0]
    }
    dp := make([]int, n)
    dp[0] = nums[0]
    dp[1] = nums[0]
    if nums[1] > dp[1] {
        dp[1] = nums[1]
    }
    for i := 2; i < n; i++ {
        skip := dp[i-1]
        rob := nums[i] + dp[i-2]
        if rob > skip {
            dp[i] = rob
        } else {
            dp[i] = skip
        }
    }
    return dp[n-1]
}

// SPACE OPTIMIZED - O(n) time, O(1) space
func robOptimized(nums []int) int {
    prev2 := 0 // dp[i-2]
    prev1 := 0 // dp[i-1]
    for _, num := range nums {
        curr := prev1
        take := num + prev2
        if take > curr {
            curr = take
        }
        prev2 = prev1
        prev1 = curr
    }
    return prev1
}\
"""

# ─── variations[1].go — 0/1 Knapsack (Can Partition) ────────────────────────

GO_VAR1 = """\
/*
 * 0/1 KNAPSACK PATTERN
 * Decision at each item: TAKE it or LEAVE it (can't take same item twice)
 *
 * Example: Can we partition array into two equal sum subsets?
 * [1, 5, 11, 5] -> [1, 5, 5] and [11] both sum to 11
 *
 * STATE: (index, remaining_sum)
 * DECISION: Include nums[i] in subset or not
 */

// RECURSION
func canPartitionRecursive(nums []int, i, target int) bool {
    if target == 0 {
        return true // Found valid subset!
    }
    if i >= len(nums) || target < 0 {
        return false
    }
    // CHOICE 1: Include nums[i]
    // CHOICE 2: Exclude nums[i]
    return canPartitionRecursive(nums, i+1, target-nums[i]) ||
        canPartitionRecursive(nums, i+1, target)
}

// TABULATION with REVERSE loop (key for 0/1 knapsack!)
func canPartition(nums []int) bool {
    total := 0
    for _, n := range nums {
        total += n
    }
    if total%2 != 0 {
        return false
    }
    target := total / 2

    dp := make([]bool, target+1)
    dp[0] = true // Sum of 0 is always achievable (empty subset)

    for _, num := range nums {
        // REVERSE loop: ensures each item used only once!
        // If we go forward, dp[j-num] might already include current num
        for j := target; j >= num; j-- {
            dp[j] = dp[j] || dp[j-num]
        }
    }
    return dp[target]
}\
"""

# ─── variations[2].go — Unbounded Knapsack (Coin Change) ─────────────────────

GO_VAR2 = """\
/*
 * UNBOUNDED KNAPSACK PATTERN
 * Decision: Use this item (can use again!) or try next item
 *
 * Example: Minimum coins to make amount
 * coins = [1, 2, 5], amount = 11 -> Answer: 3 (5 + 5 + 1)
 */

// RECURSION
func coinChangeRecursive(coins []int, amount int) int {
    if amount == 0 {
        return 0
    }
    if amount < 0 {
        return -1
    }
    minCoins := 1 << 30
    for _, coin := range coins {
        result := coinChangeRecursive(coins, amount-coin)
        if result >= 0 && result+1 < minCoins {
            minCoins = result + 1
        }
    }
    if minCoins == 1<<30 {
        return -1
    }
    return minCoins
}

// TABULATION with FORWARD loop (allows reusing coins)
func coinChange(coins []int, amount int) int {
    dp := make([]int, amount+1)
    for i := range dp {
        dp[i] = amount + 1 // initialize with impossible value
    }
    dp[0] = 0

    for _, coin := range coins {
        // FORWARD loop: allows using same coin multiple times
        for i := coin; i <= amount; i++ {
            if dp[i-coin]+1 < dp[i] {
                dp[i] = dp[i-coin] + 1
            }
        }
    }
    if dp[amount] > amount {
        return -1
    }
    return dp[amount]
}

// Count ways (not minimum) - Coin Change II
func countWays(coins []int, amount int) int {
    dp := make([]int, amount+1)
    dp[0] = 1 // one way to make 0: use no coins
    for _, coin := range coins {
        for i := coin; i <= amount; i++ {
            dp[i] += dp[i-coin]
        }
    }
    return dp[amount]
}\
"""

# ─── variations[3].go — LCS Pattern ──────────────────────────────────────────

GO_VAR3 = """\
/*
 * LCS PATTERN - 2D DP on two strings
 *
 * STATE: (i, j) = considering text1[0..i] and text2[0..j]
 * DECISION: Do characters match?
 *   - Match: Take both + LCS of remaining
 *   - No match: Max of (skip char from text1, skip char from text2)
 */

// RECURSION
func lcsRecursive(s1, s2 string, i, j int) int {
    if i < 0 || j < 0 {
        return 0
    }
    if s1[i] == s2[j] {
        return 1 + lcsRecursive(s1, s2, i-1, j-1)
    }
    left := lcsRecursive(s1, s2, i-1, j)
    right := lcsRecursive(s1, s2, i, j-1)
    if left > right {
        return left
    }
    return right
}

// TABULATION
func longestCommonSubsequence(text1, text2 string) int {
    m, n := len(text1), len(text2)
    dp := make([][]int, m+1)
    for i := range dp {
        dp[i] = make([]int, n+1)
    }
    // dp[i][j] = LCS of text1[0..i-1] and text2[0..j-1]
    // Base: dp[0][j] = dp[i][0] = 0 (empty string)
    for i := 1; i <= m; i++ {
        for j := 1; j <= n; j++ {
            if text1[i-1] == text2[j-1] {
                dp[i][j] = 1 + dp[i-1][j-1] // Match!
            } else if dp[i-1][j] > dp[i][j-1] {
                dp[i][j] = dp[i-1][j]
            } else {
                dp[i][j] = dp[i][j-1]
            }
        }
    }
    return dp[m][n]
}\
"""

# ─── variations[4].go — LIS Pattern ──────────────────────────────────────────

GO_VAR4 = """\
/*
 * LIS PATTERN
 * STATE: dp[i] = length of LIS ending at index i
 * DECISION: For each j < i, can we extend LIS ending at j?
 */

import "sort"

// O(n^2) DP Solution - Easy to understand
func lengthOfLIS(nums []int) int {
    n := len(nums)
    dp := make([]int, n)
    for i := range dp {
        dp[i] = 1 // each element is LIS of length 1
    }
    maxLen := 1
    for i := 1; i < n; i++ {
        for j := 0; j < i; j++ {
            if nums[j] < nums[i] && dp[j]+1 > dp[i] { // can extend?
                dp[i] = dp[j] + 1
            }
        }
        if dp[i] > maxLen {
            maxLen = dp[i]
        }
    }
    return maxLen
}

// O(n log n) Binary Search - Optimal
func lengthOfLISOptimal(nums []int) int {
    tails := []int{} // tails[i] = smallest tail of all LIS of length i+1
    for _, num := range nums {
        pos := sort.SearchInts(tails, num)
        if pos == len(tails) {
            tails = append(tails, num) // extend LIS
        } else {
            tails[pos] = num // replace with smaller
        }
    }
    return len(tails)
}\
"""

# ─── variations[5].go — Grid DP ──────────────────────────────────────────────

GO_VAR5 = """\
/*
 * GRID DP PATTERN
 * STATE: (row, col) = current position
 * DECISION: Move right or move down (or other allowed moves)
 */

// Unique Paths - Count paths from top-left to bottom-right
func uniquePaths(m, n int) int {
    dp := make([][]int, m)
    for i := range dp {
        dp[i] = make([]int, n)
        dp[i][0] = 1
    }
    for j := 0; j < n; j++ {
        dp[0][j] = 1
    }
    for i := 1; i < m; i++ {
        for j := 1; j < n; j++ {
            dp[i][j] = dp[i-1][j] + dp[i][j-1] // from top + from left
        }
    }
    return dp[m-1][n-1]
}

// Minimum Path Sum
func minPathSum(grid [][]int) int {
    m, n := len(grid), len(grid[0])
    dp := make([][]int, m)
    for i := range dp {
        dp[i] = make([]int, n)
    }
    dp[0][0] = grid[0][0]
    for i := 1; i < m; i++ {
        dp[i][0] = dp[i-1][0] + grid[i][0]
    }
    for j := 1; j < n; j++ {
        dp[0][j] = dp[0][j-1] + grid[0][j]
    }
    for i := 1; i < m; i++ {
        for j := 1; j < n; j++ {
            if dp[i-1][j] < dp[i][j-1] {
                dp[i][j] = dp[i-1][j] + grid[i][j]
            } else {
                dp[i][j] = dp[i][j-1] + grid[i][j]
            }
        }
    }
    return dp[m-1][n-1]
}\
"""

# ─── variations[6].go — Interval DP (Matrix Chain) ───────────────────────────

GO_VAR6 = """\
// Matrix Chain Multiplication
// Time: O(n^3), Space: O(n^2)

func mcmTabulation(p []int) int {
    n := len(p) - 1
    dp := make([][]int, n+1)
    for i := range dp {
        dp[i] = make([]int, n+1)
    }
    // Base case: dp[i][i] = 0 for all i (single matrix, no cost)

    for length := 2; length <= n; length++ {         // OUTER: range length
        for i := 1; i <= n-length+1; i++ {           // start of range
            j := i + length - 1                       // end of range (inclusive)
            dp[i][j] = 1 << 30
            for k := i; k < j; k++ {                 // try all split points
                cost := dp[i][k] + dp[k+1][j] + p[i-1]*p[k]*p[j]
                if cost < dp[i][j] {
                    dp[i][j] = cost
                }
            }
        }
    }
    return dp[1][n]
}

func main() {
    p := []int{10, 30, 5, 60, 40}
    println(mcmTabulation(p)) // Output: 15500
}\
"""

# ─── variations[7].go — Palindrome (Expand Around Center) ────────────────────

GO_VAR7 = """\
// Expand Around Center Pattern
// Time: O(n^2) | Space: O(1)

// Count all palindromic substrings
func countSubstrings(s string) int {
    count := 0
    for i := 0; i < len(s); i++ {
        count += expand(s, i, i)     // odd length
        count += expand(s, i, i+1)   // even length
    }
    return count
}

func expand(s string, left, right int) int {
    count := 0
    for left >= 0 && right < len(s) && s[left] == s[right] {
        count++
        left--
        right++
    }
    return count
}

// Longest Palindromic Substring
func longestPalindrome(s string) string {
    start, end := 0, 0
    for i := 0; i < len(s); i++ {
        len1 := expandLen(s, i, i)
        len2 := expandLen(s, i, i+1)
        length := len1
        if len2 > length {
            length = len2
        }
        if length > end-start {
            start = i - (length-1)/2
            end = i + length/2
        }
    }
    return s[start : end+1]
}

func expandLen(s string, l, r int) int {
    for l >= 0 && r < len(s) && s[l] == s[r] {
        l--
        r++
    }
    return r - l - 1
}

// Valid Palindrome II - can remove one char
func validPalindrome(s string) bool {
    l, r := 0, len(s)-1
    for l < r {
        if s[l] != s[r] {
            return isPalin(s, l+1, r) || isPalin(s, l, r-1)
        }
        l++
        r--
    }
    return true
}

func isPalin(s string, l, r int) bool {
    for l < r {
        if s[l] != s[r] {
            return false
        }
        l++
        r--
    }
    return true
}\
"""

# ─── variations[8].go — Multi-State DP ───────────────────────────────────────

GO_VAR8 = """\
/*
 * MULTI-STATE DP PATTERN
 * When tracking ONE value per position isn't enough.
 *
 * Key Insight: Some problems need to track MULTIPLE possibilities
 * at each position because a "bad" value now might become "good" later.
 *
 * Example: Maximum Product Subarray
 * - Negative x Negative = Positive
 * - So current MINIMUM might become future MAXIMUM!
 * - Must track BOTH currMax AND currMin at each position
 */

// MAXIMUM PRODUCT SUBARRAY
// Track both max and min ending at each position
// Time: O(n), Space: O(1)
func maxProduct(nums []int) int {
    maxProd := nums[0]
    currMax := nums[0] // max product ending here
    currMin := nums[0] // min product ending here (for negatives!)

    for i := 1; i < len(nums); i++ {
        n := nums[i]
        prevMax, prevMin := currMax, currMin
        // after multiplying by a negative, max and min swap
        currMax = n
        if n*prevMax > currMax {
            currMax = n * prevMax
        }
        if n*prevMin > currMax {
            currMax = n * prevMin
        }
        currMin = n
        if n*prevMax < currMin {
            currMin = n * prevMax
        }
        if n*prevMin < currMin {
            currMin = n * prevMin
        }
        if currMax > maxProd {
            maxProd = currMax
        }
    }
    return maxProd
}

// BEST TIME TO BUY AND SELL STOCK WITH COOLDOWN
// States: hold (have stock), sold (just sold), rest (cooldown)
// Time: O(n), Space: O(1)
func maxProfitCooldown(prices []int) int {
    hold := -(1 << 30) // max profit while holding stock
    sold := 0          // max profit just after selling
    rest := 0          // max profit during cooldown

    for _, price := range prices {
        prevHold := hold
        newHold := hold
        if rest-price > newHold {
            newHold = rest - price // keep holding OR buy after rest
        }
        newRest := rest
        if sold > newRest {
            newRest = sold // keep resting OR cooldown after sell
        }
        newSold := prevHold + price // sell what we're holding
        hold, rest, sold = newHold, newRest, newSold
    }
    if sold > rest {
        return sold
    }
    return rest
}

// BEST TIME TO BUY AND SELL STOCK WITH TRANSACTION FEE
// States: hold (have stock), cash (no stock)
func maxProfitWithFee(prices []int, fee int) int {
    hold := -prices[0] // bought first stock
    cash := 0          // haven't bought anything

    for i := 1; i < len(prices); i++ {
        newHold := hold
        if cash-prices[i] > newHold {
            newHold = cash - prices[i] // keep OR buy
        }
        newCash := cash
        if hold+prices[i]-fee > newCash {
            newCash = hold + prices[i] - fee // keep OR sell (with fee)
        }
        hold, cash = newHold, newCash
    }
    return cash
}

// PAINT HOUSE - 3 colors, no adjacent same color
// States: cost ending with each color
func minCostPaintHouse(costs [][]int) int {
    red := costs[0][0]
    blue := costs[0][1]
    green := costs[0][2]

    for i := 1; i < len(costs); i++ {
        newRed := costs[i][0] + min(blue, green)
        newBlue := costs[i][1] + min(red, green)
        newGreen := costs[i][2] + min(red, blue)
        red, blue, green = newRed, newBlue, newGreen
    }
    return min(red, blue, green)
}\
"""


def patch():
    with open("frontend/src/lib/patterns.json", encoding="utf-8") as f:
        data = json.load(f)

    dp = next(x for x in data if x["id"] == "dynamic-programming")
    t = dp["tutorial"]

    # Section 3: 1D DP
    t[3]["approaches"]["recursion"]["go"] = GO_S3_RECURSION
    t[3]["approaches"]["memoization"]["go"] = GO_S3_MEMO
    t[3]["approaches"]["tabulation"]["go"] = GO_S3_TAB
    t[3]["approaches"]["spaceOptimized"]["go"] = GO_S3_SPACE

    # Section 4: Decision DP
    t[4]["approaches"]["recursion"]["go"] = GO_S4_RECURSION
    t[4]["approaches"]["memoization"]["go"] = GO_S4_MEMO
    t[4]["approaches"]["tabulation"]["go"] = GO_S4_TAB
    t[4]["approaches"]["spaceOptimized"]["go"] = GO_S4_SPACE

    # Section 5: 0/1 Knapsack
    t[5]["approaches"]["recursion"]["go"] = GO_S5_RECURSION
    t[5]["approaches"]["memoization"]["go"] = GO_S5_MEMO
    t[5]["approaches"]["tabulation"]["go"] = GO_S5_TAB
    t[5]["approaches"]["spaceOptimized"]["go"] = GO_S5_SPACE

    # Section 6: Unbounded Knapsack
    t[6]["approaches"]["recursion"]["go"] = GO_S6_RECURSION
    t[6]["approaches"]["memoization"]["go"] = GO_S6_MEMO
    t[6]["approaches"]["tabulation"]["go"] = GO_S6_TAB
    t[6]["approaches"]["spaceOptimized"]["go"] = GO_S6_SPACE

    # Section 7: LCS
    t[7]["approaches"]["recursion"]["go"] = GO_S7_RECURSION
    t[7]["approaches"]["memoization"]["go"] = GO_S7_MEMO
    t[7]["approaches"]["tabulation"]["go"] = GO_S7_TAB
    t[7]["approaches"]["spaceOptimized"]["go"] = GO_S7_SPACE

    # Section 8: LIS
    t[8]["approaches"]["recursion"]["go"] = GO_S8_RECURSION
    t[8]["approaches"]["memoization"]["go"] = GO_S8_MEMO
    t[8]["approaches"]["tabulation"]["go"] = GO_S8_TAB
    t[8]["approaches"]["spaceOptimized"]["go"] = GO_S8_SPACE

    # Section 9: Grid DP
    t[9]["approaches"]["recursion"]["go"] = GO_S9_RECURSION
    t[9]["approaches"]["memoization"]["go"] = GO_S9_MEMO
    t[9]["approaches"]["tabulation"]["go"] = GO_S9_TAB
    t[9]["approaches"]["spaceOptimized"]["go"] = GO_S9_SPACE

    # Section 10: Interval DP
    t[10]["approaches"]["recursion"]["go"] = GO_S10_RECURSION
    t[10]["approaches"]["memoization"]["go"] = GO_S10_MEMO
    t[10]["approaches"]["tabulation"]["go"] = GO_S10_TAB
    t[10]["approaches"]["spaceOptimized"]["go"] = GO_S10_SPACE

    # Section 11: Palindrome DP
    t[11]["approaches"]["recursion"]["go"] = GO_S11_RECURSION
    t[11]["approaches"]["memoization"]["go"] = GO_S11_MEMO
    t[11]["approaches"]["tabulation"]["go"] = GO_S11_TAB
    t[11]["approaches"]["spaceOptimized"]["go"] = GO_S11_SPACE

    # Section 12: Multi-State DP
    t[12]["approaches"]["recursion"]["go"] = GO_S12_RECURSION
    t[12]["approaches"]["memoization"]["go"] = GO_S12_MEMO
    t[12]["approaches"]["tabulation"]["go"] = GO_S12_TAB
    t[12]["approaches"]["spaceOptimized"]["go"] = GO_S12_SPACE

    # Section 13: Tree DP
    t[13]["approaches"]["recursion"]["go"] = GO_S13_RECURSION
    t[13]["approaches"]["memoization"]["go"] = GO_S13_MEMO
    t[13]["approaches"]["tabulation"]["go"] = GO_S13_TAB
    t[13]["approaches"]["spaceOptimized"]["go"] = GO_S13_SPACE

    # Section 14: Bitmask DP
    t[14]["approaches"]["recursion"]["go"] = GO_S14_RECURSION
    t[14]["approaches"]["memoization"]["go"] = GO_S14_MEMO
    t[14]["approaches"]["tabulation"]["go"] = GO_S14_TAB
    t[14]["approaches"]["spaceOptimized"]["go"] = GO_S14_SPACE

    # codeTemplates
    dp["codeTemplates"]["go"] = GO_CODE_TEMPLATES

    # variations
    variations = dp["variations"]
    variations[0]["template"]["go"] = GO_VAR0
    variations[1]["template"]["go"] = GO_VAR1
    variations[2]["template"]["go"] = GO_VAR2
    variations[3]["template"]["go"] = GO_VAR3
    variations[4]["template"]["go"] = GO_VAR4
    variations[5]["template"]["go"] = GO_VAR5
    variations[6]["template"]["go"] = GO_VAR6
    variations[7]["template"]["go"] = GO_VAR7
    variations[8]["template"]["go"] = GO_VAR8

    # keyInsights: add Go note to the RECURSION->MEMO entry
    ki = dp["keyInsights"]
    for i, insight in enumerate(ki):
        if "RECURSION -> MEMO" in insight or "RECURSION -> TABULATION" in insight:
            # The insight about memos — add Go note
            pass
        if "SPACE OPTIMIZATION" in insight:
            if "Go:" not in insight:
                ki[i] = insight + " In Go, use variables (prev1, prev2) just like any other language."

    # commonMistakes: add Go-specific entry
    cm = dp.get("commonMistakes", [])
    go_mistake = (
        "Go: using a bare recursive function with a named helper can shadow "
        "outer variables: prefer closures (var dfs func(...)) for memoized recursion "
        "so the memo slice is captured correctly"
    )
    if not any("Go:" in m for m in cm):
        cm.append(go_mistake)
    dp["commonMistakes"] = cm

    with open("frontend/src/lib/patterns.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print("Patch applied. Running verification checks...")
    verify(data)


def verify(data):
    dp = next(x for x in data if x["id"] == "dynamic-programming")
    t = dp["tutorial"]
    errors = []
    checks = 0

    # Check all 48 approach go keys
    sections = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
    approach_names = ["recursion", "memoization", "tabulation", "spaceOptimized"]
    for sec_idx in sections:
        sec = t[sec_idx]
        approaches = sec.get("approaches", {})
        for app in approach_names:
            checks += 1
            code = approaches.get(app, {}).get("go", "")
            if not code:
                errors.append(f"  MISSING: section[{sec_idx}].approaches[{app}].go")
            elif len(code) < 50:
                errors.append(f"  TOO SHORT: section[{sec_idx}].approaches[{app}].go ({len(code)} chars)")

    # Check codeTemplates
    checks += 1
    if not dp["codeTemplates"].get("go"):
        errors.append("  MISSING: codeTemplates.go")

    # Check variations
    for i in range(9):
        checks += 1
        tmpl = dp["variations"][i].get("template", {}).get("go", "")
        if not tmpl:
            errors.append(f"  MISSING: variations[{i}].template.go")
        elif len(tmpl) < 100:
            errors.append(f"  TOO SHORT: variations[{i}].template.go ({len(tmpl)} chars)")

    # Check Go-specific commonMistake
    checks += 1
    cm = dp.get("commonMistakes", [])
    if not any("Go:" in m for m in cm):
        errors.append("  MISSING: Go-specific commonMistakes entry")

    # Spot-check content quality
    checks += 1
    s3_tab = t[3]["approaches"]["tabulation"]["go"]
    if "make([]int" not in s3_tab:
        errors.append("  QUALITY: section[3] tabulation missing make([]int")

    checks += 1
    s8_space = t[8]["approaches"]["spaceOptimized"]["go"]
    if "sort.SearchInts" not in s8_space:
        errors.append("  QUALITY: section[8] spaceOptimized missing sort.SearchInts")

    checks += 1
    s12_memo = t[12]["approaches"]["memoization"]["go"]
    if "dfs" not in s12_memo:
        errors.append("  QUALITY: section[12] memoization missing dfs closure")

    checks += 1
    s13_tab = t[13]["approaches"]["tabulation"]["go"]
    if "included, excluded" not in s13_tab:
        errors.append("  QUALITY: section[13] tabulation missing named returns")

    checks += 1
    s14_space = t[14]["approaches"]["spaceOptimized"]["go"]
    if "bits.OnesCount" not in s14_space:
        errors.append("  QUALITY: section[14] spaceOptimized missing bits.OnesCount")

    checks += 1
    var8 = dp["variations"][8]["template"]["go"]
    if "maxProduct" not in var8:
        errors.append("  QUALITY: variations[8] missing maxProduct")

    # Check no Java syntax leaked in
    checks += 1
    java_keywords = ["Arrays.fill", "Math.max", "Math.min", "Integer.MAX_VALUE", "ArrayList<", "HashMap<"]
    for sec_idx in sections:
        for app in approach_names:
            code = t[sec_idx]["approaches"][app].get("go", "")
            for kw in java_keywords:
                if kw in code:
                    errors.append(f"  JAVA LEAK: section[{sec_idx}].{app} contains '{kw}'")

    print(f"\n{'='*60}")
    print(f"Verification: {checks} checks, {len(errors)} errors")
    print(f"{'='*60}")
    if errors:
        print("ERRORS:")
        for e in errors:
            print(e)
        raise SystemExit(1)
    else:
        print("All checks passed!")


if __name__ == "__main__":
    patch()
