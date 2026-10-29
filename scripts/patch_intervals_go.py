#!/usr/bin/env python3
"""Patches the intervals pattern in patterns.json with Go language support."""
import json

# Section 1: Merge Overlapping Intervals
GO_S1 = """\
func merge(intervals [][]int) [][]int {
    if len(intervals) == 0 {
        return nil
    }

    // Sort by start time
    sort.Slice(intervals, func(i, j int) bool {
        return intervals[i][0] < intervals[j][0]
    })

    result := [][]int{intervals[0]}

    for i := 1; i < len(intervals); i++ {
        last := result[len(result)-1]
        curr := intervals[i]

        if curr[0] <= last[1] {
            // Overlaps: extend the end if needed
            if curr[1] > last[1] {
                last[1] = curr[1]
            }
        } else {
            // No overlap: add as a new interval
            result = append(result, curr)
        }
    }

    return result
}"""

# Section 2: Insert Interval
GO_S2 = """\
func insert(intervals [][]int, newInterval []int) [][]int {
    result := [][]int{}
    i := 0
    n := len(intervals)

    // Phase 1: Add intervals that end before newInterval starts
    for i < n && intervals[i][1] < newInterval[0] {
        result = append(result, intervals[i])
        i++
    }

    // Phase 2: Merge all overlapping intervals into newInterval
    for i < n && intervals[i][0] <= newInterval[1] {
        if intervals[i][0] < newInterval[0] {
            newInterval[0] = intervals[i][0]
        }
        if intervals[i][1] > newInterval[1] {
            newInterval[1] = intervals[i][1]
        }
        i++
    }
    result = append(result, newInterval)

    // Phase 3: Add intervals that start after merged interval ends
    for i < n {
        result = append(result, intervals[i])
        i++
    }

    return result
}"""

# Section 3: Meeting Rooms: Line Sweep
GO_S3 = """\
// Meeting Rooms II: minimum rooms needed
func minMeetingRooms(intervals [][]int) int {
    // Create events: +1 for start, -1 for end
    events := make([][2]int, 0, len(intervals)*2)
    for _, iv := range intervals {
        events = append(events, [2]int{iv[0], 1})  // start
        events = append(events, [2]int{iv[1], -1}) // end
    }

    // Sort by time; if same time, end (-1) before start (+1)
    sort.Slice(events, func(i, j int) bool {
        if events[i][0] != events[j][0] {
            return events[i][0] < events[j][0]
        }
        return events[i][1] < events[j][1]
    })

    rooms, maxRooms := 0, 0
    for _, e := range events {
        rooms += e[1]
        if rooms > maxRooms {
            maxRooms = rooms
        }
    }
    return maxRooms
}

// Meeting Rooms I: can attend all meetings?
func canAttendMeetings(intervals [][]int) bool {
    sort.Slice(intervals, func(i, j int) bool {
        return intervals[i][0] < intervals[j][0]
    })

    for i := 1; i < len(intervals); i++ {
        if intervals[i][0] < intervals[i-1][1] {
            return false // conflict
        }
    }
    return true
}"""

# Section 4: Non-overlapping Intervals (Greedy)
GO_S4 = """\
// Method 1: sort by END time, count how many we keep
func eraseOverlapIntervals(intervals [][]int) int {
    if len(intervals) == 0 {
        return 0
    }

    // Sort by end time (finishing early leaves room for more)
    sort.Slice(intervals, func(i, j int) bool {
        return intervals[i][1] < intervals[j][1]
    })

    kept := 1
    lastEnd := intervals[0][1]

    for i := 1; i < len(intervals); i++ {
        if intervals[i][0] >= lastEnd {
            // No overlap: keep it
            kept++
            lastEnd = intervals[i][1]
        }
    }

    return len(intervals) - kept
}

// Method 2: sort by START time, count removals directly
func eraseOverlapIntervalsAlt(intervals [][]int) int {
    if len(intervals) == 0 {
        return 0
    }

    sort.Slice(intervals, func(i, j int) bool {
        return intervals[i][0] < intervals[j][0]
    })

    removals := 0
    lastEnd := intervals[0][1]

    for i := 1; i < len(intervals); i++ {
        if intervals[i][0] < lastEnd {
            // Overlap: remove one, keep the one that ends earlier
            removals++
            if intervals[i][1] < lastEnd {
                lastEnd = intervals[i][1]
            }
        } else {
            lastEnd = intervals[i][1]
        }
    }

    return removals
}"""

# Section 5: Interval List Intersection
GO_S5 = """\
func intervalIntersection(A [][]int, B [][]int) [][]int {
    result := [][]int{}
    i, j := 0, 0

    for i < len(A) && j < len(B) {
        // Overlap is the later start to the earlier end
        start := A[i][0]
        if B[j][0] > start {
            start = B[j][0]
        }
        end := A[i][1]
        if B[j][1] < end {
            end = B[j][1]
        }

        // Valid intersection
        if start <= end {
            result = append(result, []int{start, end})
        }

        // Advance the pointer with the smaller end
        if A[i][1] < B[j][1] {
            i++
        } else {
            j++
        }
    }

    return result
}"""

# Section 6: Minimum Arrows to Burst Balloons
GO_S6 = """\
func findMinArrowShots(points [][]int) int {
    if len(points) == 0 {
        return 0
    }

    // Sort by end point
    sort.Slice(points, func(i, j int) bool {
        return points[i][1] < points[j][1]
    })

    arrows := 1
    arrowPos := points[0][1] // shoot at first balloon's end

    for i := 1; i < len(points); i++ {
        // Balloon starts AFTER arrow position: need a new arrow
        // Note: > not >= (touching counts as overlap here)
        if points[i][0] > arrowPos {
            arrows++
            arrowPos = points[i][1]
        }
    }

    return arrows
}"""

# Section 7: Employee Free Time
GO_S7 = """\
type Interval struct {
    Start, End int
}

func employeeFreeTime(schedule [][]Interval) []Interval {
    // Step 1: Flatten all intervals into one slice
    var all []Interval
    for _, employee := range schedule {
        all = append(all, employee...)
    }

    // Step 2: Sort by start time
    sort.Slice(all, func(i, j int) bool {
        return all[i].Start < all[j].Start
    })

    // Step 3: Merge overlapping work intervals
    merged := []Interval{all[0]}
    for i := 1; i < len(all); i++ {
        last := &merged[len(merged)-1]
        curr := all[i]
        if curr.Start <= last.End {
            // Overlaps: extend end if needed
            if curr.End > last.End {
                last.End = curr.End
            }
        } else {
            merged = append(merged, curr)
        }
    }

    // Step 4: Gaps between work blocks = free time
    var free []Interval
    for i := 1; i < len(merged); i++ {
        free = append(free, Interval{merged[i-1].End, merged[i].Start})
    }
    return free
}"""

# Section 8: Interval Queries with Heap
GO_S8 = """\
// intervalHeap is a min-heap on [length, end] pairs.
type intervalHeap [][2]int

func (h intervalHeap) Len() int {
    return len(h)
}

func (h intervalHeap) Less(i, j int) bool {
    return h[i][0] < h[j][0]
}

func (h intervalHeap) Swap(i, j int) {
    h[i], h[j] = h[j], h[i]
}

func (h *intervalHeap) Push(x any) {
    *h = append(*h, x.([2]int))
}

func (h *intervalHeap) Pop() any {
    old := *h
    n := len(old)
    x := old[n-1]
    *h = old[:n-1]
    return x
}

func minInterval(intervals [][]int, queries []int) []int {
    n := len(intervals)
    m := len(queries)
    answer := make([]int, m)
    for i := range answer {
        answer[i] = -1
    }

    // Sort intervals by start time
    sort.Slice(intervals, func(i, j int) bool {
        return intervals[i][0] < intervals[j][0]
    })

    // Pair each query with its original index so we can restore order
    sortedQ := make([][2]int, m)
    for i, q := range queries {
        sortedQ[i] = [2]int{q, i}
    }
    sort.Slice(sortedQ, func(i, j int) bool {
        return sortedQ[i][0] < sortedQ[j][0]
    })

    h := &intervalHeap{}
    heap.Init(h)
    idx := 0

    for _, qp := range sortedQ {
        qVal, origIdx := qp[0], qp[1]

        // Add all intervals whose start <= current query value
        for idx < n && intervals[idx][0] <= qVal {
            length := intervals[idx][1] - intervals[idx][0] + 1
            heap.Push(h, [2]int{length, intervals[idx][1]})
            idx++
        }

        // Remove intervals whose end < query value (can't contain it)
        for h.Len() > 0 && (*h)[0][1] < qVal {
            heap.Pop(h)
        }

        // Smallest valid interval is at the top
        if h.Len() > 0 {
            answer[origIdx] = (*h)[0][0]
        }
    }

    return answer
}"""

# codeTemplates.go
GO_TEMPLATES = """\
// Merge Overlapping Intervals
func merge(intervals [][]int) [][]int {
    sort.Slice(intervals, func(i, j int) bool {
        return intervals[i][0] < intervals[j][0]
    })
    result := [][]int{intervals[0]}

    for i := 1; i < len(intervals); i++ {
        last := result[len(result)-1]
        curr := intervals[i]
        if curr[0] <= last[1] {
            if curr[1] > last[1] {
                last[1] = curr[1] // extend end
            }
        } else {
            result = append(result, curr) // no overlap
        }
    }
    return result
}

// Meeting Rooms II: minimum rooms (line sweep)
func minMeetingRooms(intervals [][]int) int {
    events := make([][2]int, 0, len(intervals)*2)
    for _, iv := range intervals {
        events = append(events, [2]int{iv[0], 1}, [2]int{iv[1], -1})
    }
    sort.Slice(events, func(i, j int) bool {
        if events[i][0] != events[j][0] {
            return events[i][0] < events[j][0]
        }
        return events[i][1] < events[j][1]
    })
    rooms, maxRooms := 0, 0
    for _, e := range events {
        rooms += e[1]
        if rooms > maxRooms {
            maxRooms = rooms
        }
    }
    return maxRooms
}

// Non-overlapping Intervals: minimum removals (greedy, sort by end)
func eraseOverlapIntervals(intervals [][]int) int {
    sort.Slice(intervals, func(i, j int) bool {
        return intervals[i][1] < intervals[j][1]
    })
    kept, lastEnd := 1, intervals[0][1]
    for i := 1; i < len(intervals); i++ {
        if intervals[i][0] >= lastEnd {
            kept++
            lastEnd = intervals[i][1]
        }
    }
    return len(intervals) - kept
}

// Insert Interval (input already sorted)
func insert(intervals [][]int, newInterval []int) [][]int {
    result, i, n := [][]int{}, 0, len(intervals)
    for i < n && intervals[i][1] < newInterval[0] {
        result = append(result, intervals[i])
        i++
    }
    for i < n && intervals[i][0] <= newInterval[1] {
        if intervals[i][0] < newInterval[0] {
            newInterval[0] = intervals[i][0]
        }
        if intervals[i][1] > newInterval[1] {
            newInterval[1] = intervals[i][1]
        }
        i++
    }
    result = append(result, newInterval)
    return append(result, intervals[i:]...)
}

// Interval List Intersection (two sorted lists)
func intervalIntersection(A, B [][]int) [][]int {
    result := [][]int{}
    i, j := 0, 0
    for i < len(A) && j < len(B) {
        lo := max(A[i][0], B[j][0])
        hi := min(A[i][1], B[j][1])
        if lo <= hi {
            result = append(result, []int{lo, hi})
        }
        if A[i][1] < B[j][1] {
            i++
        } else {
            j++
        }
    }
    return result
}

// Helpers (Go 1.21+ has built-in min/max)
func max(a, b int) int {
    if a > b {
        return a
    }
    return b
}

func min(a, b int) int {
    if a < b {
        return a
    }
    return b
}"""

# variation[0]: Merge intervals
GO_VAR0 = """\
func merge(intervals [][]int) [][]int {
    sort.Slice(intervals, func(i, j int) bool {
        return intervals[i][0] < intervals[j][0]
    })
    result := [][]int{intervals[0]}

    for _, curr := range intervals[1:] {
        last := result[len(result)-1]
        if curr[0] <= last[1] {
            if curr[1] > last[1] {
                last[1] = curr[1]
            }
        } else {
            result = append(result, curr)
        }
    }
    return result
}"""

# variation[1]: Line Sweep (Meeting Rooms II)
GO_VAR1 = """\
// Meeting Rooms II: line sweep
func minMeetingRooms(intervals [][]int) int {
    events := make([][2]int, 0, len(intervals)*2)
    for _, iv := range intervals {
        events = append(events, [2]int{iv[0], 1})  // start
        events = append(events, [2]int{iv[1], -1}) // end
    }
    // Sort by time; ends before starts at the same time
    sort.Slice(events, func(i, j int) bool {
        if events[i][0] != events[j][0] {
            return events[i][0] < events[j][0]
        }
        return events[i][1] < events[j][1]
    })

    rooms, maxRooms := 0, 0
    for _, e := range events {
        rooms += e[1]
        if rooms > maxRooms {
            maxRooms = rooms
        }
    }
    return maxRooms
}"""

# variation[2]: Non-overlapping intervals (greedy)
GO_VAR2 = """\
// Minimum intervals to remove for non-overlapping
func eraseOverlapIntervals(intervals [][]int) int {
    if len(intervals) == 0 {
        return 0
    }

    // Sort by END time (greedy: pick earliest ending)
    sort.Slice(intervals, func(i, j int) bool {
        return intervals[i][1] < intervals[j][1]
    })

    count := 0
    prevEnd := intervals[0][1]

    for i := 1; i < len(intervals); i++ {
        if intervals[i][0] < prevEnd {
            // Overlap: remove this interval
            count++
        } else {
            prevEnd = intervals[i][1]
        }
    }
    return count
}"""

# variation[3]: Interval intersection
GO_VAR3 = """\
func intervalIntersection(A [][]int, B [][]int) [][]int {
    result := [][]int{}
    i, j := 0, 0

    for i < len(A) && j < len(B) {
        start := A[i][0]
        if B[j][0] > start {
            start = B[j][0]
        }
        end := A[i][1]
        if B[j][1] < end {
            end = B[j][1]
        }

        if start <= end {
            result = append(result, []int{start, end})
        }

        // Move pointer with the smaller end
        if A[i][1] < B[j][1] {
            i++
        } else {
            j++
        }
    }
    return result
}"""

# Go-specific mistakes to append to section 13 content
GO_SPECIFIC_MISTAKES = """

## Go-Specific Mistakes

| Mistake | Fix |
|---------|-----|
| Using `sort.Ints` on a `[][]int` — it won't compile | Use `sort.Slice` with a custom less function |
| Modifying a slice element through a copy: `last := result[len(result)-1]; last[1] = x` has no effect on the slice | Take a pointer: `last := result[len(result)-1]` then modify `last[1]` directly (slices of slices), or use `result[len(result)-1][1] = x` |
| Calling heap methods directly: `h.Push(val)` | Always use package-level functions: `heap.Push(h, val)` and `heap.Pop(h)` |
| Forgetting `heap.Init(h)` when the heap starts pre-filled | Required for pre-filled slices; safe on empty heaps |
| Returning `nil` vs `[][]int{}` — some tests care | Return `[][]int{}` for an empty result if the problem expects a non-nil empty slice |

### Handling the Go Sort Gap

Go has no built-in lambda sort on primitives like Java's `Arrays.sort`. Every custom sort uses `sort.Slice`:

```go
// Sort by start time
sort.Slice(intervals, func(i, j int) bool {
    return intervals[i][0] < intervals[j][0]
})

// Sort by end time
sort.Slice(intervals, func(i, j int) bool {
    return intervals[i][1] < intervals[j][1]
})

// Sort events: by time, ends before starts at ties
sort.Slice(events, func(i, j int) bool {
    if events[i][0] != events[j][0] {
        return events[i][0] < events[j][0]
    }
    return events[i][1] < events[j][1]
})
```

## Go Templates

### Template 1: Merge Overlapping
```go
func merge(intervals [][]int) [][]int {
    sort.Slice(intervals, func(i, j int) bool {
        return intervals[i][0] < intervals[j][0]
    })
    result := [][]int{intervals[0]}
    for _, curr := range intervals[1:] {
        last := result[len(result)-1]
        if curr[0] <= last[1] {
            if curr[1] > last[1] {
                last[1] = curr[1]
            }
        } else {
            result = append(result, curr)
        }
    }
    return result
}
```

### Template 2: Line Sweep (Count Concurrent)
```go
func countMax(intervals [][]int) int {
    events := make([][2]int, 0, len(intervals)*2)
    for _, iv := range intervals {
        events = append(events, [2]int{iv[0], 1}, [2]int{iv[1], -1})
    }
    sort.Slice(events, func(i, j int) bool {
        if events[i][0] != events[j][0] {
            return events[i][0] < events[j][0]
        }
        return events[i][1] < events[j][1]
    })
    cur, maxVal := 0, 0
    for _, e := range events {
        cur += e[1]
        if cur > maxVal {
            maxVal = cur
        }
    }
    return maxVal
}
```

### Template 3: Greedy Non-Overlap (Sort by End)
```go
func eraseOverlapIntervals(intervals [][]int) int {
    sort.Slice(intervals, func(i, j int) bool {
        return intervals[i][1] < intervals[j][1]
    })
    kept, lastEnd := 1, intervals[0][1]
    for i := 1; i < len(intervals); i++ {
        if intervals[i][0] >= lastEnd {
            kept++
            lastEnd = intervals[i][1]
        }
    }
    return len(intervals) - kept
}
```

### Template 4: Insert Interval (Three Phases)
```go
func insert(intervals [][]int, newInterval []int) [][]int {
    result, i, n := [][]int{}, 0, len(intervals)
    for i < n && intervals[i][1] < newInterval[0] {
        result = append(result, intervals[i])
        i++
    }
    for i < n && intervals[i][0] <= newInterval[1] {
        if intervals[i][0] < newInterval[0] {
            newInterval[0] = intervals[i][0]
        }
        if intervals[i][1] > newInterval[1] {
            newInterval[1] = intervals[i][1]
        }
        i++
    }
    result = append(result, newInterval)
    return append(result, intervals[i:]...)
}
```

### Template 5: Interval Intersection (Two Pointers)
```go
func intervalIntersection(A, B [][]int) [][]int {
    result := [][]int{}
    i, j := 0, 0
    for i < len(A) && j < len(B) {
        lo := max(A[i][0], B[j][0])
        hi := min(A[i][1], B[j][1])
        if lo <= hi {
            result = append(result, []int{lo, hi})
        }
        if A[i][1] < B[j][1] {
            i++
        } else {
            j++
        }
    }
    return result
}
```"""


def patch():
    with open("frontend/src/lib/patterns.json", encoding="utf-8") as f:
        data = json.load(f)

    pattern = next(p for p in data if p["id"] == "intervals")
    t = pattern["tutorial"]

    # Inject Go code into tutorial sections
    t[1]["code"]["go"] = GO_S1
    t[2]["code"]["go"] = GO_S2
    t[3]["code"]["go"] = GO_S3
    t[4]["code"]["go"] = GO_S4
    t[5]["code"]["go"] = GO_S5
    t[6]["code"]["go"] = GO_S6
    t[7]["code"]["go"] = GO_S7
    t[8]["code"]["go"] = GO_S8

    # Inject codeTemplates
    pattern["codeTemplates"]["go"] = GO_TEMPLATES

    # Inject variation templates
    pattern["variations"][0]["template"]["go"] = GO_VAR0
    pattern["variations"][1]["template"]["go"] = GO_VAR1
    pattern["variations"][2]["template"]["go"] = GO_VAR2
    pattern["variations"][3]["template"]["go"] = GO_VAR3

    # Append Go-specific section to Interview Tips (section 13) content (idempotent)
    if "Go-Specific Mistakes" not in t[13]["content"]:
        t[13]["content"] = t[13]["content"] + GO_SPECIFIC_MISTAKES

    # Add Go-specific entry to commonMistakes (idempotent)
    go_mistake = "In Go, always use sort.Slice with a custom less function for interval sorting — sort.Ints won't work on [][]int. Use heap.Push/heap.Pop (package-level) not h.Push/h.Pop for priority queue operations."
    if not any("sort.Slice" in str(m) for m in pattern["commonMistakes"]):
        pattern["commonMistakes"].append(go_mistake)

    # Update keyInsights to include Go equivalents (idempotent)
    for i, insight in enumerate(pattern["keyInsights"]):
        if "Sorting makes interval problems easy" in insight and "sort.Slice" not in insight:
            pattern["keyInsights"][i] = (
                insight
                + " — in Go, use sort.Slice with a custom less function for all interval sorting"
            )
            break

    # Write back
    with open("frontend/src/lib/patterns.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print("Patch applied. Running verification...")

    # Verification
    with open("frontend/src/lib/patterns.json", encoding="utf-8") as f:
        data = json.load(f)

    pattern = next(p for p in data if p["id"] == "intervals")
    t = pattern["tutorial"]

    checks = []

    # Code sections
    for i in [1, 2, 3, 4, 5, 6, 7, 8]:
        has_go = "go" in t[i].get("code", {})
        checks.append((f"Section {i} ({t[i]['title']}) has go key", has_go))

    # Verify Go code content is non-empty
    for i, label in [
        (1, "merge"),
        (2, "insert"),
        (3, "minMeetingRooms"),
        (4, "eraseOverlapIntervals"),
        (5, "intervalIntersection"),
        (6, "findMinArrowShots"),
        (7, "employeeFreeTime"),
        (8, "minInterval"),
    ]:
        code = t[i]["code"].get("go", "")
        checks.append((f"Section {i} Go code contains '{label}'", label in code))

    # codeTemplates
    checks.append(("codeTemplates has go key", "go" in pattern["codeTemplates"]))
    checks.append(
        (
            "codeTemplates go contains merge",
            "merge" in pattern["codeTemplates"]["go"],
        )
    )
    checks.append(
        (
            "codeTemplates go contains minMeetingRooms",
            "minMeetingRooms" in pattern["codeTemplates"]["go"],
        )
    )
    checks.append(
        (
            "codeTemplates go contains eraseOverlapIntervals",
            "eraseOverlapIntervals" in pattern["codeTemplates"]["go"],
        )
    )

    # Variations
    for i in range(4):
        has_go = "go" in pattern["variations"][i].get("template", {})
        checks.append((f"variation[{i}] template has go key", has_go))

    # Section 13 appendix
    checks.append(
        (
            "Section 13 has Go-Specific Mistakes",
            "Go-Specific Mistakes" in t[13]["content"],
        )
    )
    checks.append(
        (
            "Section 13 has Go Templates",
            "Go Templates" in t[13]["content"],
        )
    )
    checks.append(
        (
            "Section 13 has sort.Slice example",
            "sort.Slice" in t[13]["content"],
        )
    )

    # commonMistakes
    checks.append(
        (
            "commonMistakes has Go entry",
            any("Go" in str(m) or "go" in str(m).lower() for m in pattern["commonMistakes"]),
        )
    )
    checks.append(
        (
            "commonMistakes Go entry mentions sort.Slice",
            any("sort.Slice" in str(m) for m in pattern["commonMistakes"]),
        )
    )

    # keyInsights updated
    checks.append(
        (
            "keyInsights updated with Go sort.Slice note",
            any("sort.Slice" in str(k) for k in pattern["keyInsights"]),
        )
    )

    # Heap-specific checks for section 8
    go_s8 = t[8]["code"]["go"]
    checks.append(("Section 8 uses heap.Push", "heap.Push" in go_s8))
    checks.append(("Section 8 uses heap.Pop", "heap.Pop" in go_s8))
    checks.append(("Section 8 uses heap.Init", "heap.Init" in go_s8))
    checks.append(("Section 8 has intervalHeap type", "intervalHeap" in go_s8))
    checks.append(("Section 8 Pop is multi-line", "old := *h" in go_s8))

    # Sort checks
    checks.append(("Section 1 Go uses sort.Slice", "sort.Slice" in t[1]["code"]["go"]))
    checks.append(("Section 3 Go uses sort.Slice", "sort.Slice" in t[3]["code"]["go"]))
    checks.append(("Section 6 Go uses sort.Slice", "sort.Slice" in t[6]["code"]["go"]))

    # No Java-specific method names in Go code
    for i in [1, 2, 3, 4, 5, 6, 7, 8]:
        code = t[i]["code"].get("go", "")
        checks.append(
            (
                f"Section {i} Go code has no Java ArrayList",
                "ArrayList" not in code,
            )
        )

    passed = 0
    failed = []
    for desc, result in checks:
        if result:
            passed += 1
        else:
            failed.append(desc)

    print(f"\nResults: {passed}/{len(checks)} checks passed")
    if failed:
        print("\nFAILED checks:")
        for f in failed:
            print(f"  - {f}")
    else:
        print("All checks passed!")


if __name__ == "__main__":
    patch()
