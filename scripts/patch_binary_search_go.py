#!/usr/bin/env python3
"""Patches the binary-search pattern in patterns.json with Go language support."""
import json

# Section 3: Standard Binary Search Template
GO_S3 = """\
func binarySearch(nums []int, target int) int {
    left, right := 0, len(nums)-1

    for left <= right {
        // Avoid overflow: don't use (left + right) / 2
        mid := left + (right-left)/2

        if nums[mid] == target {
            return mid // Found!
        } else if nums[mid] < target {
            left = mid + 1 // Search right half
        } else {
            right = mid - 1 // Search left half
        }
    }

    return -1 // Not found
    // Or return left for insertion position
}\
"""

# Section 6: Finding Boundaries - First & Last Occurrence
GO_S6 = """\
// Find first occurrence (lower bound)
// Returns first index where nums[i] >= target
func lowerBound(nums []int, target int) int {
    left, right := 0, len(nums)

    for left < right {
        mid := left + (right-left)/2

        if nums[mid] < target {
            left = mid + 1 // Too small, search right
        } else {
            right = mid // Could be answer, search left
        }
    }

    return left // First index >= target
}

// Find last occurrence
// Returns last index where nums[i] <= target
func lastOccurrence(nums []int, target int) int {
    left, right := 0, len(nums)

    for left < right {
        mid := left + (right-left)/2

        if nums[mid] <= target {
            left = mid + 1 // Could still find later
        } else {
            right = mid // Too big
        }
    }

    return left - 1 // Last index <= target
}

// Find first and last position
func searchRange(nums []int, target int) [2]int {
    first := lowerBound(nums, target)

    // Check if target exists
    if first == len(nums) || nums[first] != target {
        return [2]int{-1, -1}
    }

    last := lastOccurrence(nums, target)
    return [2]int{first, last}
}\
"""

# Section 7: Search in Rotated Sorted Array
GO_S7 = """\
func search(nums []int, target int) int {
    left, right := 0, len(nums)-1

    for left <= right {
        mid := left + (right-left)/2

        if nums[mid] == target {
            return mid
        }

        // Check which half is sorted
        if nums[left] <= nums[mid] {
            // Left half is sorted
            if nums[left] <= target && target < nums[mid] {
                right = mid - 1 // Target in left half
            } else {
                left = mid + 1 // Target in right half
            }
        } else {
            // Right half is sorted
            if nums[mid] < target && target <= nums[right] {
                left = mid + 1 // Target in right half
            } else {
                right = mid - 1 // Target in left half
            }
        }
    }

    return -1
}\
"""

# Section 9: Find Minimum in Rotated Array
GO_S9 = """\
func findMin(nums []int) int {
    left, right := 0, len(nums)-1

    for left < right {
        mid := left + (right-left)/2

        if nums[mid] > nums[right] {
            // Rotation point is in right half
            left = mid + 1
        } else {
            // Minimum could be mid or in left half
            right = mid
        }
    }

    return nums[left] // left == right, found minimum
}

// With duplicates (harder)
func findMinWithDups(nums []int) int {
    left, right := 0, len(nums)-1

    for left < right {
        mid := left + (right-left)/2

        if nums[mid] > nums[right] {
            left = mid + 1
        } else if nums[mid] < nums[right] {
            right = mid
        } else {
            // nums[mid] == nums[right], can't decide
            // Safely shrink right (worst case O(n))
            right--
        }
    }

    return nums[left]
}\
"""

# Section 10: Binary Search on Answer
GO_S10 = """\
// Koko Eating Bananas
func minEatingSpeed(piles []int, h int) int {
    left := 1
    right := 0
    for _, p := range piles {
        if p > right {
            right = p
        }
    }

    for left < right {
        mid := left + (right-left)/2

        if canFinish(piles, mid, h) {
            right = mid // Try slower speed
        } else {
            left = mid + 1 // Need faster speed
        }
    }

    return left
}

func canFinish(piles []int, speed, h int) bool {
    hours := 0
    for _, pile := range piles {
        // Ceiling division: (pile + speed - 1) / speed
        hours += (pile + speed - 1) / speed
    }
    return hours <= h
}

// Capacity to Ship Packages
func shipWithinDays(weights []int, days int) int {
    left, right := 0, 0
    for _, w := range weights {
        if w > left {
            left = w
        }
        right += w
    }

    for left < right {
        mid := left + (right-left)/2

        if canShip(weights, mid, days) {
            right = mid
        } else {
            left = mid + 1
        }
    }

    return left
}

func canShip(weights []int, capacity, days int) bool {
    daysNeeded, currentLoad := 1, 0

    for _, weight := range weights {
        if currentLoad+weight > capacity {
            daysNeeded++
            currentLoad = 0
        }
        currentLoad += weight
    }

    return daysNeeded <= days
}\
"""

# Section 12: Find Peak Element
GO_S12 = """\
func findPeakElement(nums []int) int {
    left, right := 0, len(nums)-1

    for left < right {
        mid := left + (right-left)/2

        if nums[mid] < nums[mid+1] {
            // Rising slope, peak on right
            left = mid + 1
        } else {
            // Falling slope, peak on left (or mid)
            right = mid
        }
    }

    return left // left == right == peak index
}

// Peak in Mountain Array (same concept)
func peakIndexInMountainArray(arr []int) int {
    left, right := 0, len(arr)-1

    for left < right {
        mid := left + (right-left)/2

        if arr[mid] < arr[mid+1] {
            left = mid + 1 // Still climbing
        } else {
            right = mid // Past peak or at peak
        }
    }

    return left
}\
"""

# Section 13: Search in 2D Matrix
GO_S13 = """\
// Type 1: Treat as 1D array
func searchMatrix(matrix [][]int, target int) bool {
    m, n := len(matrix), len(matrix[0])
    left, right := 0, m*n-1

    for left <= right {
        mid := left + (right-left)/2
        row, col := mid/n, mid%n
        value := matrix[row][col]

        if value == target {
            return true
        } else if value < target {
            left = mid + 1
        } else {
            right = mid - 1
        }
    }

    return false
}

// Type 2: Start from corner (O(m + n))
func searchMatrixII(matrix [][]int, target int) bool {
    m, n := len(matrix), len(matrix[0])
    row, col := 0, n-1 // Start top-right

    for row < m && col >= 0 {
        if matrix[row][col] == target {
            return true
        } else if matrix[row][col] > target {
            col-- // Go left (smaller)
        } else {
            row++ // Go down (larger)
        }
    }

    return false
}\
"""

# codeTemplates.go
GO_TEMPLATES = """\
// Standard Binary Search
func binarySearch(arr []int, target int) int {
    left, right := 0, len(arr)-1

    for left <= right {
        mid := left + (right-left)/2

        if arr[mid] == target {
            return mid
        }
        if arr[mid] < target {
            left = mid + 1
        } else {
            right = mid - 1
        }
    }
    return -1 // Not found (or return left for insert position)
}

// Find First Occurrence (Lower Bound)
func lowerBound(arr []int, target int) int {
    left, right := 0, len(arr)

    for left < right {
        mid := left + (right-left)/2
        if arr[mid] < target {
            left = mid + 1
        } else {
            right = mid
        }
    }
    return left // First index where arr[i] >= target
}

// Binary Search on Answer
func binarySearchOnAnswer(canAchieve func(int) bool, minVal, maxVal int) int {
    left, right := minVal, maxVal

    for left < right {
        mid := left + (right-left)/2

        if canAchieve(mid) {
            right = mid // Try smaller (for minimize)
        } else {
            left = mid + 1
        }
    }
    return left
}\
"""

# Variation 0: standard search
GO_VAR0 = """\
func search(arr []int, target int) int {
    left, right := 0, len(arr)-1

    for left <= right {
        mid := left + (right-left)/2
        if arr[mid] == target {
            return mid
        }
        if arr[mid] < target {
            left = mid + 1
        } else {
            right = mid - 1
        }
    }
    return -1
}\
"""

# Variation 1: lower/upper bound
GO_VAR1 = """\
// Lower bound: first index where arr[i] >= target
func lowerBound(arr []int, target int) int {
    left, right := 0, len(arr)
    for left < right {
        mid := left + (right-left)/2
        if arr[mid] < target {
            left = mid + 1
        } else {
            right = mid
        }
    }
    return left
}

// Upper bound: first index where arr[i] > target
func upperBound(arr []int, target int) int {
    left, right := 0, len(arr)
    for left < right {
        mid := left + (right-left)/2
        if arr[mid] <= target {
            left = mid + 1
        } else {
            right = mid
        }
    }
    return left
}\
"""

# Variation 2: rotated array
GO_VAR2 = """\
func searchRotated(nums []int, target int) int {
    left, right := 0, len(nums)-1

    for left <= right {
        mid := left + (right-left)/2
        if nums[mid] == target {
            return mid
        }

        // Left half is sorted
        if nums[left] <= nums[mid] {
            if nums[left] <= target && target < nums[mid] {
                right = mid - 1
            } else {
                left = mid + 1
            }
        } else {
            // Right half is sorted
            if nums[mid] < target && target <= nums[right] {
                left = mid + 1
            } else {
                right = mid - 1
            }
        }
    }
    return -1
}\
"""

# Variation 3: binary search on answer
GO_VAR3 = """\
// Example: Koko Eating Bananas
func minEatingSpeed(piles []int, h int) int {
    // Search space: [1, max(piles)]
    left, right := 1, 0
    for _, p := range piles {
        if p > right {
            right = p
        }
    }

    canFinish := func(speed int) bool {
        hours := 0
        for _, pile := range piles {
            hours += (pile + speed - 1) / speed
        }
        return hours <= h
    }

    for left < right {
        mid := left + (right-left)/2
        if canFinish(mid) {
            right = mid // Try smaller speed
        } else {
            left = mid + 1
        }
    }
    return left
}\
"""

# Variation 4: 2D matrix
GO_VAR4 = """\
// Search 2D Matrix I - Treat as 1D array
// Matrix is sorted: last element of row i < first element of row i+1
func searchMatrix(matrix [][]int, target int) bool {
    m, n := len(matrix), len(matrix[0])
    left, right := 0, m*n-1

    for left <= right {
        mid := left + (right-left)/2
        row, col := mid/n, mid%n

        if matrix[row][col] == target {
            return true
        }
        if matrix[row][col] < target {
            left = mid + 1
        } else {
            right = mid - 1
        }
    }
    return false
}

// Search 2D Matrix II - Each row and column sorted
// Start from top-right or bottom-left corner
func searchMatrixII(matrix [][]int, target int) bool {
    row, col := 0, len(matrix[0])-1

    for row < len(matrix) && col >= 0 {
        if matrix[row][col] == target {
            return true
        }
        if matrix[row][col] > target {
            col--
        } else {
            row++
        }
    }
    return false
}\
"""

# Go-specific pitfalls block to append to section 14
GO_PITFALLS_BLOCK = """

## Go-Specific Pitfalls

**Go-Pitfall 1: No Unsigned Right Shift for Midpoint**
Java's `>>> 1` unsigned right shift does not exist in Go. The safe formula remains:
```go
mid := left + (right-left)/2  // Always use this
```
Go's `>>` is arithmetic (sign-extending), but since left and right are non-negative in binary search, `(left + right) >> 1` would give the same result as division. The formula above avoids overflow entirely and is the idiomatic choice.

**Go-Pitfall 2: sort.Search Returns Insertion Point, Not -1**
Go's standard library provides `sort.SearchInts(a, x)` which returns the lower bound index, not -1 for missing elements:
```go
// sort.SearchInts returns the index to insert x (lower bound)
i := sort.SearchInts(nums, target)
if i < len(nums) && nums[i] == target {
    // target found at index i
}
// If i == len(nums) or nums[i] != target, element is absent
```
Know when to use the stdlib versus a custom implementation.

**Go-Pitfall 3: Slice Bounds Panic on nums[mid+1]**
Go panics on out-of-bounds access. In Find Peak Element, the loop condition `left < right` guarantees `mid < right <= len-1`, so `mid+1` is always valid inside the loop. If you change the loop condition, re-verify this invariant."""

# Go templates block to append to section 15
GO_TEMPLATES_BLOCK = """

## Go Templates

### sort.Search (Standard Library)
```go
// sort.Search: find first i in [0, n) where f(i) is true
// f must be monotone: false, false, ..., true, true
i := sort.Search(len(nums), func(i int) bool {
    return nums[i] >= target
})
// i is now the lower bound index
if i < len(nums) && nums[i] == target {
    // found
}
```

### Standard Binary Search
```go
func binarySearch(nums []int, target int) int {
    left, right := 0, len(nums)-1
    for left <= right {
        mid := left + (right-left)/2
        if nums[mid] == target {
            return mid
        }
        if nums[mid] < target {
            left = mid + 1
        } else {
            right = mid - 1
        }
    }
    return -1
}
```

### Lower Bound
```go
func lowerBound(nums []int, target int) int {
    left, right := 0, len(nums)
    for left < right {
        mid := left + (right-left)/2
        if nums[mid] < target {
            left = mid + 1
        } else {
            right = mid
        }
    }
    return left
}
```

### Binary Search on Answer
```go
func binarySearchOnAnswer(canAchieve func(int) bool, lo, hi int) int {
    for lo < hi {
        mid := lo + (hi-lo)/2
        if canAchieve(mid) {
            hi = mid
        } else {
            lo = mid + 1
        }
    }
    return lo
}
```"""


def patch():
    with open("frontend/src/lib/patterns.json", encoding="utf-8") as f:
        data = json.load(f)

    bs = next(x for x in data if x["id"] == "binary-search")
    t = bs["tutorial"]

    # Section 3: Standard Binary Search Template
    t[3]["code"]["go"] = GO_S3

    # Section 6: Finding Boundaries - First & Last Occurrence
    t[6]["code"]["go"] = GO_S6

    # Section 7: Search in Rotated Sorted Array
    t[7]["code"]["go"] = GO_S7

    # Section 9: Find Minimum in Rotated Array
    t[9]["code"]["go"] = GO_S9

    # Section 10: Binary Search on Answer
    t[10]["code"]["go"] = GO_S10

    # Section 12: Find Peak Element
    t[12]["code"]["go"] = GO_S12

    # Section 13: Search in 2D Matrix
    t[13]["code"]["go"] = GO_S13

    # Section 14: Common Pitfalls - append Go-specific block
    if "## Go-Specific Pitfalls" not in t[14]["content"]:
        t[14]["content"] += GO_PITFALLS_BLOCK

    # Section 15: Template Summary - append Go templates block
    if "## Go Templates" not in t[15]["content"]:
        t[15]["content"] += GO_TEMPLATES_BLOCK

    # codeTemplates.go
    bs["codeTemplates"]["go"] = GO_TEMPLATES

    # Variation templates
    bs["variations"][0]["template"]["go"] = GO_VAR0
    bs["variations"][1]["template"]["go"] = GO_VAR1
    bs["variations"][2]["template"]["go"] = GO_VAR2
    bs["variations"][3]["template"]["go"] = GO_VAR3
    bs["variations"][4]["template"]["go"] = GO_VAR4

    # keyInsights: add Go stdlib note
    go_insight = "Go's sort.SearchInts (and sort.Search) implements lower bound: use it when the array is already sorted and you need the insertion point"
    if not any("sort.Search" in ki for ki in bs.get("keyInsights", [])):
        bs["keyInsights"].append(go_insight)

    # commonMistakes: add Go-specific entry
    go_mistake = "In Go, sort.SearchInts returns the insertion index (lower bound), not -1; always check nums[i] == target after the call"
    if not any("sort.Search" in cm for cm in bs.get("commonMistakes", [])):
        bs["commonMistakes"].append(go_mistake)

    with open("frontend/src/lib/patterns.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print("Patch applied. Running verification...")
    verify(bs)


def verify(bs):
    t = bs["tutorial"]
    checks = []

    def check(label, cond):
        status = "PASS" if cond else "FAIL"
        checks.append((status, label))

    # Code sections have go key
    check("s3 has go", "go" in t[3].get("code", {}))
    check("s6 has go", "go" in t[6].get("code", {}))
    check("s7 has go", "go" in t[7].get("code", {}))
    check("s9 has go", "go" in t[9].get("code", {}))
    check("s10 has go", "go" in t[10].get("code", {}))
    check("s12 has go", "go" in t[12].get("code", {}))
    check("s13 has go", "go" in t[13].get("code", {}))

    # Go code is non-empty
    check("s3 go non-empty", len(t[3]["code"].get("go", "")) > 50)
    check("s6 go non-empty", len(t[6]["code"].get("go", "")) > 50)
    check("s7 go non-empty", len(t[7]["code"].get("go", "")) > 50)
    check("s9 go non-empty", len(t[9]["code"].get("go", "")) > 50)
    check("s10 go non-empty", len(t[10]["code"].get("go", "")) > 50)
    check("s12 go non-empty", len(t[12]["code"].get("go", "")) > 50)
    check("s13 go non-empty", len(t[13]["code"].get("go", "")) > 50)

    # codeTemplates
    check("codeTemplates has go", "go" in bs.get("codeTemplates", {}))
    check("codeTemplates go non-empty", len(bs.get("codeTemplates", {}).get("go", "")) > 100)

    # Variations
    for i in range(5):
        check(f"var{i} has go", "go" in bs["variations"][i].get("template", {}))
        check(f"var{i} go non-empty", len(bs["variations"][i]["template"].get("go", "")) > 30)

    # Section 14 pitfalls appended
    check("s14 Go pitfalls appended", "Go-Specific Pitfalls" in t[14]["content"])
    check("s14 sort.Search mentioned", "sort.Search" in t[14]["content"])

    # Section 15 templates appended
    check("s15 Go templates appended", "Go Templates" in t[15]["content"])
    check("s15 binarySearch template", "func binarySearch" in t[15]["content"])
    check("s15 lowerBound template", "func lowerBound" in t[15]["content"])
    check("s15 binarySearchOnAnswer template", "func binarySearchOnAnswer" in t[15]["content"])

    # Go syntax: no Java idioms in go blocks
    for i in [3, 6, 7, 9, 10, 12, 13]:
        code = t[i]["code"].get("go", "")
        check(f"s{i} no Java types", "int[]" not in code and "boolean" not in code)
        check(f"s{i} uses :=" , ":=" in code or "func " in code)

    # keyInsights updated
    check("keyInsights has Go note", any("sort.Search" in ki for ki in bs.get("keyInsights", [])))

    # commonMistakes updated
    check("commonMistakes has Go entry", any("sort.Search" in cm for cm in bs.get("commonMistakes", [])))

    passed = sum(1 for s, _ in checks if s == "PASS")
    failed = sum(1 for s, _ in checks if s == "FAIL")
    for status, label in checks:
        print(f"  [{status}] {label}")
    print(f"\n{passed}/{len(checks)} checks passed, {failed} failed")
    if failed > 0:
        raise SystemExit(1)


if __name__ == "__main__":
    patch()
