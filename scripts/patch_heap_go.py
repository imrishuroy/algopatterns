#!/usr/bin/env python3
"""Patches the heap pattern in patterns.json with Go language support."""

import json

# ── Section 3: Peek ──────────────────────────────────────────────────────────

GO_PEEK = """\
import (
\t"container/heap"
\t"fmt"
)

// IntHeap implements heap.Interface for a min-heap of integers.
// To make a max-heap, flip Less: h[i] > h[j].
type IntHeap []int

func (h IntHeap) Len() int {
\treturn len(h)
}

func (h IntHeap) Less(i, j int) bool {
\treturn h[i] < h[j]
}

func (h IntHeap) Swap(i, j int) {
\th[i], h[j] = h[j], h[i]
}

func (h *IntHeap) Push(x any) {
\t*h = append(*h, x.(int))
}

func (h *IntHeap) Pop() any {
\told := *h
\tn := len(old)
\tx := old[n-1]
\t*h = old[:n-1]
\treturn x
}

func main() {
\t// Min-heap (default: Less uses <)
\th := &IntHeap{}
\theap.Init(h)
\theap.Push(h, 20)
\theap.Push(h, 10)
\theap.Push(h, 15)

\t// Peek: index 0 is always the root (minimum for a min-heap)
\tfmt.Println("Min-heap peek:", (*h)[0])   // 10
\tfmt.Println("Size after peek:", h.Len()) // 3 — unchanged

\t// Max-heap: flip Less to h[i] > h[j]. Peek is still (*h)[0].
}"""

# ── Section 4: Insert ────────────────────────────────────────────────────────

GO_INSERT = """\
import (
\t"container/heap"
\t"fmt"
)

type IntHeap []int

func (h IntHeap) Len() int {
\treturn len(h)
}

func (h IntHeap) Less(i, j int) bool {
\treturn h[i] < h[j]
}

func (h IntHeap) Swap(i, j int) {
\th[i], h[j] = h[j], h[i]
}

func (h *IntHeap) Push(x any) {
\t*h = append(*h, x.(int))
}

func (h *IntHeap) Pop() any {
\told := *h
\tn := len(old)
\tx := old[n-1]
\t*h = old[:n-1]
\treturn x
}

func main() {
\th := &IntHeap{}
\theap.Init(h) // must call Init before use

\t// heap.Push appends and bubbles up — O(log n).
\t// Always use heap.Push(h, val), NOT h.Push(val) directly.
\theap.Push(h, 5)
\theap.Push(h, 3)
\theap.Push(h, 7)
\theap.Push(h, 1)

\tfmt.Println("Root after inserts:", (*h)[0]) // 1 — the minimum
\tfmt.Println("Heap size:", h.Len())           // 4
}"""

# ── Section 5: Extract ───────────────────────────────────────────────────────

GO_EXTRACT = """\
import (
\t"container/heap"
\t"fmt"
)

type IntHeap []int

func (h IntHeap) Len() int {
\treturn len(h)
}

func (h IntHeap) Less(i, j int) bool {
\treturn h[i] < h[j]
}

func (h IntHeap) Swap(i, j int) {
\th[i], h[j] = h[j], h[i]
}

func (h *IntHeap) Push(x any) {
\t*h = append(*h, x.(int))
}

func (h *IntHeap) Pop() any {
\told := *h
\tn := len(old)
\tx := old[n-1]
\t*h = old[:n-1]
\treturn x
}

func main() {
\th := &IntHeap{5, 3, 7, 1, 4}
\theap.Init(h) // heapify existing slice in O(n)

\t// heap.Pop swaps root with last, shrinks slice, sifts down — O(log n).
\t// Type assertion is required: Pop returns any.
\tmin := heap.Pop(h).(int)
\tfmt.Println("Extracted min:", min) // 1
\tfmt.Println("New root:", (*h)[0])  // 3
\tfmt.Println("New size:", h.Len())  // 4
}"""

# ── Section 6: Heapify ───────────────────────────────────────────────────────

GO_HEAPIFY = """\
import (
\t"container/heap"
\t"fmt"
)

type IntHeap []int

func (h IntHeap) Len() int {
\treturn len(h)
}

func (h IntHeap) Less(i, j int) bool {
\treturn h[i] < h[j]
}

func (h IntHeap) Swap(i, j int) {
\th[i], h[j] = h[j], h[i]
}

func (h *IntHeap) Push(x any) {
\t*h = append(*h, x.(int))
}

func (h *IntHeap) Pop() any {
\told := *h
\tn := len(old)
\tx := old[n-1]
\t*h = old[:n-1]
\treturn x
}

func main() {
\t// heap.Init heapifies in O(n) — not O(n log n).
\t// Works because most nodes are near the bottom and barely move.
\tnums := &IntHeap{9, 4, 7, 1, 8, 3, 6, 2, 5}
\theap.Init(nums)

\tfmt.Println("Min after Init:", (*nums)[0]) // 1

\t// Drain in sorted order: O(n log n)
\tfor nums.Len() > 0 {
\t\tfmt.Printf("%d ", heap.Pop(nums).(int))
\t}
\t// Output: 1 2 3 4 5 6 7 8 9
}"""

# ── Section 7: Summary ───────────────────────────────────────────────────────

GO_SUMMARY = """\
import (
\t"container/heap"
\t"fmt"
)

// MinHeap — Less uses <: smallest element is always at root.
type MinHeap []int

func (h MinHeap) Len() int {
\treturn len(h)
}

func (h MinHeap) Less(i, j int) bool {
\treturn h[i] < h[j]
}

func (h MinHeap) Swap(i, j int) {
\th[i], h[j] = h[j], h[i]
}

func (h *MinHeap) Push(x any) {
\t*h = append(*h, x.(int))
}

func (h *MinHeap) Pop() any {
\told := *h
\tn := len(old)
\tx := old[n-1]
\t*h = old[:n-1]
\treturn x
}

// MaxHeap — only Less changes: flip to > to put largest at root.
type MaxHeap []int

func (h MaxHeap) Len() int {
\treturn len(h)
}

func (h MaxHeap) Less(i, j int) bool {
\treturn h[i] > h[j] // flip!
}

func (h MaxHeap) Swap(i, j int) {
\th[i], h[j] = h[j], h[i]
}

func (h *MaxHeap) Push(x any) {
\t*h = append(*h, x.(int))
}

func (h *MaxHeap) Pop() any {
\told := *h
\tn := len(old)
\tx := old[n-1]
\t*h = old[:n-1]
\treturn x
}

func main() {
\tmin := &MinHeap{3, 1, 4, 1, 5, 9}
\theap.Init(min)
\tfmt.Println("MinHeap root:", (*min)[0]) // 1

\tmax := &MaxHeap{3, 1, 4, 1, 5, 9}
\theap.Init(max)
\tfmt.Println("MaxHeap root:", (*max)[0]) // 9

\t// Key operations — same regardless of min/max:
\t// Peek:  (*h)[0]
\t// Push:  heap.Push(h, val)
\t// Pop:   heap.Pop(h).(int)
\t// Init:  heap.Init(h) — call once before using a pre-filled slice
}"""

# ── Section 8: Top K ─────────────────────────────────────────────────────────

GO_TOP_K = """\
import "container/heap"

// IntHeap is a min-heap of integers.
type IntHeap []int

func (h IntHeap) Len() int {
\treturn len(h)
}

func (h IntHeap) Less(i, j int) bool {
\treturn h[i] < h[j]
}

func (h IntHeap) Swap(i, j int) {
\th[i], h[j] = h[j], h[i]
}

func (h *IntHeap) Push(x any) {
\t*h = append(*h, x.(int))
}

func (h *IntHeap) Pop() any {
\told := *h
\tn := len(old)
\tx := old[n-1]
\t*h = old[:n-1]
\treturn x
}

// findKthLargest returns the kth largest element.
// Uses a MIN-heap of size k: root = weakest of the k best = kth largest.
func findKthLargest(nums []int, k int) int {
\th := &IntHeap{}
\theap.Init(h)

\tfor _, num := range nums {
\t\theap.Push(h, num)
\t\tif h.Len() > k {
\t\t\theap.Pop(h) // evict the smallest — it's no longer in top k
\t\t}
\t}

\treturn (*h)[0] // root = kth largest
}"""

# ── Section 9: Top K Frequent ────────────────────────────────────────────────

GO_TOP_K_FREQ = """\
import "container/heap"

// freqItem pairs a value with its frequency.
type freqItem struct {
\tval  int
\tfreq int
}

// freqHeap is a min-heap ordered by frequency.
type freqHeap []freqItem

func (h freqHeap) Len() int {
\treturn len(h)
}

func (h freqHeap) Less(i, j int) bool {
\treturn h[i].freq < h[j].freq
}

func (h freqHeap) Swap(i, j int) {
\th[i], h[j] = h[j], h[i]
}

func (h *freqHeap) Push(x any) {
\t*h = append(*h, x.(freqItem))
}

func (h *freqHeap) Pop() any {
\told := *h
\tn := len(old)
\tx := old[n-1]
\t*h = old[:n-1]
\treturn x
}

func topKFrequent(nums []int, k int) []int {
\tfreq := make(map[int]int)
\tfor _, n := range nums {
\t\tfreq[n]++
\t}

\th := &freqHeap{}
\theap.Init(h)

\tfor val, cnt := range freq {
\t\theap.Push(h, freqItem{val, cnt})
\t\tif h.Len() > k {
\t\t\theap.Pop(h) // evict least frequent
\t\t}
\t}

\tresult := make([]int, h.Len())
\tfor i := len(result) - 1; i >= 0; i-- {
\t\tresult[i] = heap.Pop(h).(freqItem).val
\t}
\treturn result
}"""

# ── Section 10: Two Heaps ────────────────────────────────────────────────────

GO_TWO_HEAPS = """\
import "container/heap"

// loHeap is the lower half — max-heap, largest element at root.
type loHeap []int

func (h loHeap) Len() int {
\treturn len(h)
}

func (h loHeap) Less(i, j int) bool {
\treturn h[i] > h[j] // max at root
}

func (h loHeap) Swap(i, j int) {
\th[i], h[j] = h[j], h[i]
}

func (h *loHeap) Push(x any) {
\t*h = append(*h, x.(int))
}

func (h *loHeap) Pop() any {
\told := *h
\tn := len(old)
\tx := old[n-1]
\t*h = old[:n-1]
\treturn x
}

// hiHeap is the upper half — min-heap, smallest element at root.
type hiHeap []int

func (h hiHeap) Len() int {
\treturn len(h)
}

func (h hiHeap) Less(i, j int) bool {
\treturn h[i] < h[j]
}

func (h hiHeap) Swap(i, j int) {
\th[i], h[j] = h[j], h[i]
}

func (h *hiHeap) Push(x any) {
\t*h = append(*h, x.(int))
}

func (h *hiHeap) Pop() any {
\told := *h
\tn := len(old)
\tx := old[n-1]
\t*h = old[:n-1]
\treturn x
}

// MedianFinder supports AddNum and FindMedian in O(log n) / O(1).
type MedianFinder struct {
\tlo *loHeap // lower half — max-heap
\thi *hiHeap // upper half — min-heap
}

func NewMedianFinder() *MedianFinder {
\tlo, hi := &loHeap{}, &hiHeap{}
\theap.Init(lo)
\theap.Init(hi)
\treturn &MedianFinder{lo, hi}
}

func (m *MedianFinder) AddNum(num int) {
\t// Always push to lo first, then rebalance.
\theap.Push(m.lo, num)
\theap.Push(m.hi, heap.Pop(m.lo).(int)) // move lo's max to hi

\t// Keep lo.Len >= hi.Len at all times.
\tif m.hi.Len() > m.lo.Len() {
\t\theap.Push(m.lo, heap.Pop(m.hi).(int))
\t}
}

func (m *MedianFinder) FindMedian() float64 {
\tif m.lo.Len() > m.hi.Len() {
\t\treturn float64((*m.lo)[0]) // odd count: middle is lo's max
\t}
\treturn float64((*m.lo)[0]+(*m.hi)[0]) / 2.0 // even: average two middles
}"""

# ── Section 11: Merge K Sorted ───────────────────────────────────────────────

GO_MERGE_K = """\
import "container/heap"

type ListNode struct {
\tVal  int
\tNext *ListNode
}

// nodeHeap is a min-heap of list nodes ordered by Val.
type nodeHeap []*ListNode

func (h nodeHeap) Len() int {
\treturn len(h)
}

func (h nodeHeap) Less(i, j int) bool {
\treturn h[i].Val < h[j].Val
}

func (h nodeHeap) Swap(i, j int) {
\th[i], h[j] = h[j], h[i]
}

func (h *nodeHeap) Push(x any) {
\t*h = append(*h, x.(*ListNode))
}

func (h *nodeHeap) Pop() any {
\told := *h
\tn := len(old)
\tx := old[n-1]
\t*h = old[:n-1]
\treturn x
}

func mergeKLists(lists []*ListNode) *ListNode {
\th := &nodeHeap{}
\theap.Init(h)

\tfor _, node := range lists {
\t\tif node != nil {
\t\t\theap.Push(h, node)
\t\t}
\t}

\tdummy := &ListNode{}
\tcur := dummy

\tfor h.Len() > 0 {
\t\tnode := heap.Pop(h).(*ListNode)
\t\tcur.Next = node
\t\tcur = cur.Next
\t\tif node.Next != nil {
\t\t\theap.Push(h, node.Next) // push successor into heap
\t\t}
\t}

\treturn dummy.Next
}"""

# ── Section 12: Task Scheduler — heap approach ───────────────────────────────

GO_TASK_SCHEDULER_HEAP = """\
import "container/heap"

// maxHeap is a max-heap of task frequencies.
type maxHeap []int

func (h maxHeap) Len() int {
\treturn len(h)
}

func (h maxHeap) Less(i, j int) bool {
\treturn h[i] > h[j]
}

func (h maxHeap) Swap(i, j int) {
\th[i], h[j] = h[j], h[i]
}

func (h *maxHeap) Push(x any) {
\t*h = append(*h, x.(int))
}

func (h *maxHeap) Pop() any {
\told := *h
\tn := len(old)
\tx := old[n-1]
\t*h = old[:n-1]
\treturn x
}

func leastInterval(tasks []byte, n int) int {
\tfreq := [26]int{}
\tfor _, t := range tasks {
\t\tfreq[t-'A']++
\t}

\th := &maxHeap{}
\theap.Init(h)
\tfor _, f := range freq {
\t\tif f > 0 {
\t\t\theap.Push(h, f)
\t\t}
\t}

\ttime := 0
\tfor h.Len() > 0 {
\t\tvar temp []int
\t\tcycle := n + 1 // one CPU block: (n+1) slots

\t\tfor cycle > 0 && h.Len() > 0 {
\t\t\tcnt := heap.Pop(h).(int)
\t\t\tif cnt > 1 {
\t\t\t\ttemp = append(temp, cnt-1)
\t\t\t}
\t\t\ttime++
\t\t\tcycle--
\t\t}

\t\tfor _, t := range temp {
\t\t\theap.Push(h, t)
\t\t}

\t\t// Add idle slots only if more tasks remain.
\t\tif h.Len() > 0 {
\t\t\ttime += cycle
\t\t}
\t}
\treturn time
}"""

# ── Section 12: Task Scheduler — formula approach ────────────────────────────

GO_TASK_SCHEDULER_FORMULA = """\
func leastInterval(tasks []byte, n int) int {
\tfreq := [26]int{}
\tfor _, t := range tasks {
\t\tfreq[t-'A']++
\t}

\tmaxFreq := 0
\tfor _, f := range freq {
\t\tif f > maxFreq {
\t\t\tmaxFreq = f
\t\t}
\t}

\tmaxCount := 0
\tfor _, f := range freq {
\t\tif f == maxFreq {
\t\t\tmaxCount++
\t\t}
\t}

\t// (maxFreq-1) full blocks of size (n+1), plus a final partial block.
\tminSlots := (maxFreq-1)*(n+1) + maxCount

\tif len(tasks) > minSlots {
\t\treturn len(tasks)
\t}
\treturn minSlots
}"""

# ── Section 13: K Closest Points ─────────────────────────────────────────────

GO_K_CLOSEST = """\
import "container/heap"

// distHeap is a MAX-heap by squared distance.
// We keep k smallest: evict the farthest when size exceeds k.
type distHeap [][2]int // [x, y]

func (h distHeap) Len() int {
\treturn len(h)
}

func (h distHeap) Less(i, j int) bool {
\tdi := h[i][0]*h[i][0] + h[i][1]*h[i][1]
\tdj := h[j][0]*h[j][0] + h[j][1]*h[j][1]
\treturn di > dj // max-heap: farthest at root
}

func (h distHeap) Swap(i, j int) {
\th[i], h[j] = h[j], h[i]
}

func (h *distHeap) Push(x any) {
\t*h = append(*h, x.([2]int))
}

func (h *distHeap) Pop() any {
\told := *h
\tn := len(old)
\tx := old[n-1]
\t*h = old[:n-1]
\treturn x
}

func kClosest(points [][]int, k int) [][]int {
\th := &distHeap{}
\theap.Init(h)

\tfor _, p := range points {
\t\theap.Push(h, [2]int{p[0], p[1]})
\t\tif h.Len() > k {
\t\t\theap.Pop(h) // evict farthest point
\t\t}
\t}

\tresult := make([][]int, h.Len())
\tfor i := range result {
\t\tp := heap.Pop(h).([2]int)
\t\tresult[i] = []int{p[0], p[1]}
\t}
\treturn result
}"""

# ── Section 14: Meeting Rooms II ─────────────────────────────────────────────

GO_MEETING_ROOMS = """\
import (
\t"container/heap"
\t"sort"
)

// endTimeHeap is a min-heap of meeting end times.
type endTimeHeap []int

func (h endTimeHeap) Len() int {
\treturn len(h)
}

func (h endTimeHeap) Less(i, j int) bool {
\treturn h[i] < h[j]
}

func (h endTimeHeap) Swap(i, j int) {
\th[i], h[j] = h[j], h[i]
}

func (h *endTimeHeap) Push(x any) {
\t*h = append(*h, x.(int))
}

func (h *endTimeHeap) Pop() any {
\told := *h
\tn := len(old)
\tx := old[n-1]
\t*h = old[:n-1]
\treturn x
}

func minMeetingRooms(intervals [][]int) int {
\tsort.Slice(intervals, func(i, j int) bool {
\t\treturn intervals[i][0] < intervals[j][0] // sort by start time
\t})

\th := &endTimeHeap{}
\theap.Init(h)

\tfor _, interval := range intervals {
\t\t// Root holds the earliest end time. If that room is free, reuse it.
\t\tif h.Len() > 0 && (*h)[0] <= interval[0] {
\t\t\theap.Pop(h)
\t\t}
\t\theap.Push(h, interval[1]) // allocate this meeting a room
\t}

\treturn h.Len() // rooms in use at peak
}"""

# ── Section 15: Reorganize String ────────────────────────────────────────────

GO_REORGANIZE = """\
import "container/heap"

type charFreq struct {
\tch   byte
\tfreq int
}

// charHeap is a max-heap ordered by frequency.
type charHeap []charFreq

func (h charHeap) Len() int {
\treturn len(h)
}

func (h charHeap) Less(i, j int) bool {
\treturn h[i].freq > h[j].freq
}

func (h charHeap) Swap(i, j int) {
\th[i], h[j] = h[j], h[i]
}

func (h *charHeap) Push(x any) {
\t*h = append(*h, x.(charFreq))
}

func (h *charHeap) Pop() any {
\told := *h
\tn := len(old)
\tx := old[n-1]
\t*h = old[:n-1]
\treturn x
}

func reorganizeString(s string) string {
\tfreq := [26]int{}
\tfor _, c := range s {
\t\tfreq[c-'a']++
\t}

\th := &charHeap{}
\theap.Init(h)
\tfor i, f := range freq {
\t\tif f > 0 {
\t\t\theap.Push(h, charFreq{byte('a' + i), f})
\t\t}
\t}

\tresult := make([]byte, 0, len(s))
\tvar prev charFreq

\tfor h.Len() > 0 {
\t\tcurr := heap.Pop(h).(charFreq)
\t\tresult = append(result, curr.ch)
\t\tcurr.freq--

\t\tif prev.freq > 0 {
\t\t\theap.Push(h, prev) // previous char has cooled down, safe to reuse
\t\t}
\t\tprev = curr // hold curr out for one round (cooldown)
\t}

\tif len(result) != len(s) {
\t\treturn "" // impossible
\t}
\treturn string(result)
}"""

# ── Section 16: IPO ──────────────────────────────────────────────────────────

GO_IPO = """\
import (
\t"container/heap"
\t"sort"
)

// capHeap is a min-heap of [capital, profit] pairs — sorted by capital.
type capHeap [][2]int

func (h capHeap) Len() int {
\treturn len(h)
}

func (h capHeap) Less(i, j int) bool {
\treturn h[i][0] < h[j][0]
}

func (h capHeap) Swap(i, j int) {
\th[i], h[j] = h[j], h[i]
}

func (h *capHeap) Push(x any) {
\t*h = append(*h, x.([2]int))
}

func (h *capHeap) Pop() any {
\told := *h
\tn := len(old)
\tx := old[n-1]
\t*h = old[:n-1]
\treturn x
}

// profitHeap is a max-heap of profits — always pick the best available.
type profitHeap []int

func (h profitHeap) Len() int {
\treturn len(h)
}

func (h profitHeap) Less(i, j int) bool {
\treturn h[i] > h[j]
}

func (h profitHeap) Swap(i, j int) {
\th[i], h[j] = h[j], h[i]
}

func (h *profitHeap) Push(x any) {
\t*h = append(*h, x.(int))
}

func (h *profitHeap) Pop() any {
\told := *h
\tn := len(old)
\tx := old[n-1]
\t*h = old[:n-1]
\treturn x
}

func findMaximizedCapital(k, w int, profits, capital []int) int {
\tn := len(profits)
\tprojects := make([][2]int, n)
\tfor i := range projects {
\t\tprojects[i] = [2]int{capital[i], profits[i]}
\t}
\tsort.Slice(projects, func(i, j int) bool {
\t\treturn projects[i][0] < projects[j][0]
\t})

\tlocked := &capHeap{}
\tavailable := &profitHeap{}
\theap.Init(locked)
\theap.Init(available)
\tfor _, p := range projects {
\t\theap.Push(locked, p)
\t}

\tfor round := 0; round < k; round++ {
\t\t// Unlock everything we can now afford.
\t\tfor locked.Len() > 0 && (*locked)[0][0] <= w {
\t\t\tp := heap.Pop(locked).([2]int)
\t\t\theap.Push(available, p[1])
\t\t}
\t\tif available.Len() == 0 {
\t\t\tbreak // nothing affordable
\t\t}
\t\tw += heap.Pop(available).(int) // take the most profitable
\t}
\treturn w
}"""

# ── Section 17: Sliding Window Median ────────────────────────────────────────

GO_SLIDING_MEDIAN = """\
import "sort"

// Sliding Window Median using a sorted slice maintained with binary search.
// Time: O(n*k) — use two-heap + lazy deletion for the O(n log k) approach.
func medianSlidingWindow(nums []int, k int) []float64 {
\twindow := make([]int, 0, k)
\tresult := make([]float64, 0, len(nums)-k+1)

\tinsertSorted := func(arr []int, val int) []int {
\t\ti := sort.SearchInts(arr, val)
\t\tarr = append(arr, 0)
\t\tcopy(arr[i+1:], arr[i:])
\t\tarr[i] = val
\t\treturn arr
\t}

\tremoveSorted := func(arr []int, val int) []int {
\t\ti := sort.SearchInts(arr, val)
\t\treturn append(arr[:i], arr[i+1:]...)
\t}

\tfor i, num := range nums {
\t\twindow = insertSorted(window, num)
\t\tif i >= k {
\t\t\twindow = removeSorted(window, nums[i-k])
\t\t}
\t\tif i >= k-1 {
\t\t\tmid := k / 2
\t\t\tif k%2 == 1 {
\t\t\t\tresult = append(result, float64(window[mid]))
\t\t\t} else {
\t\t\t\tresult = append(result, float64(window[mid-1]+window[mid])/2.0)
\t\t\t}
\t\t}
\t}
\treturn result
}"""

# ── codeTemplates ─────────────────────────────────────────────────────────────

GO_CODE_TEMPLATES = """\
import "container/heap"

// MinIntHeap implements heap.Interface — copy this boilerplate for every heap.
// Change Less to h[i] > h[j] for a max-heap.
type MinIntHeap []int

func (h MinIntHeap) Len() int {
\treturn len(h)
}

func (h MinIntHeap) Less(i, j int) bool {
\treturn h[i] < h[j]
}

func (h MinIntHeap) Swap(i, j int) {
\th[i], h[j] = h[j], h[i]
}

func (h *MinIntHeap) Push(x any) {
\t*h = append(*h, x.(int))
}

func (h *MinIntHeap) Pop() any {
\told := *h
\tn := len(old)
\tx := old[n-1]
\t*h = old[:n-1]
\treturn x
}

// Top K: min-heap of size k. Root = kth largest (weakest keeper).
func kLargest(nums []int, k int) int {
\th := &MinIntHeap{}
\theap.Init(h)
\tfor _, num := range nums {
\t\theap.Push(h, num)
\t\tif h.Len() > k {
\t\t\theap.Pop(h)
\t\t}
\t}
\treturn (*h)[0] // kth largest
}

// Two Heaps — Streaming Median
type loHeap []int // max-heap

func (h loHeap) Len() int {
\treturn len(h)
}

func (h loHeap) Less(i, j int) bool {
\treturn h[i] > h[j]
}

func (h loHeap) Swap(i, j int) {
\th[i], h[j] = h[j], h[i]
}

func (h *loHeap) Push(x any) {
\t*h = append(*h, x.(int))
}

func (h *loHeap) Pop() any {
\told := *h
\tn := len(old)
\tx := old[n-1]
\t*h = old[:n-1]
\treturn x
}

type hiHeap []int // min-heap

func (h hiHeap) Len() int {
\treturn len(h)
}

func (h hiHeap) Less(i, j int) bool {
\treturn h[i] < h[j]
}

func (h hiHeap) Swap(i, j int) {
\th[i], h[j] = h[j], h[i]
}

func (h *hiHeap) Push(x any) {
\t*h = append(*h, x.(int))
}

func (h *hiHeap) Pop() any {
\told := *h
\tn := len(old)
\tx := old[n-1]
\t*h = old[:n-1]
\treturn x
}

type MedianFinder struct {
\tlo *loHeap
\thi *hiHeap
}

func NewMedianFinder() *MedianFinder {
\tlo, hi := &loHeap{}, &hiHeap{}
\theap.Init(lo)
\theap.Init(hi)
\treturn &MedianFinder{lo, hi}
}

func (m *MedianFinder) AddNum(num int) {
\theap.Push(m.lo, num)
\theap.Push(m.hi, heap.Pop(m.lo).(int))
\tif m.hi.Len() > m.lo.Len() {
\t\theap.Push(m.lo, heap.Pop(m.hi).(int))
\t}
}

func (m *MedianFinder) FindMedian() float64 {
\tif m.lo.Len() > m.hi.Len() {
\t\treturn float64((*m.lo)[0])
\t}
\treturn float64((*m.lo)[0]+(*m.hi)[0]) / 2.0
}"""

# ── Variation templates ───────────────────────────────────────────────────────

GO_VAR_TOP_K = """\
import "container/heap"

// IntHeap is a min-heap for K largest; flip Less for K smallest.
type IntHeap []int

func (h IntHeap) Len() int {
\treturn len(h)
}

func (h IntHeap) Less(i, j int) bool {
\treturn h[i] < h[j]
}

func (h IntHeap) Swap(i, j int) {
\th[i], h[j] = h[j], h[i]
}

func (h *IntHeap) Push(x any) {
\t*h = append(*h, x.(int))
}

func (h *IntHeap) Pop() any {
\told := *h
\tn := len(old)
\tx := old[n-1]
\t*h = old[:n-1]
\treturn x
}

func topKLargest(nums []int, k int) []int {
\th := &IntHeap{}
\theap.Init(h)
\tfor _, num := range nums {
\t\theap.Push(h, num)
\t\tif h.Len() > k {
\t\t\theap.Pop(h) // evict smallest — not in top k
\t\t}
\t}
\t// h contains the k largest; (*h)[0] = kth largest
\tresult := make([]int, h.Len())
\tfor i := len(result) - 1; i >= 0; i-- {
\t\tresult[i] = heap.Pop(h).(int)
\t}
\treturn result
}"""

GO_VAR_TWO_HEAPS = """\
import "container/heap"

type loH []int // max-heap — lower half

func (h loH) Len() int {
\treturn len(h)
}

func (h loH) Less(i, j int) bool {
\treturn h[i] > h[j]
}

func (h loH) Swap(i, j int) {
\th[i], h[j] = h[j], h[i]
}

func (h *loH) Push(x any) {
\t*h = append(*h, x.(int))
}

func (h *loH) Pop() any {
\told := *h
\tn := len(old)
\tx := old[n-1]
\t*h = old[:n-1]
\treturn x
}

type hiH []int // min-heap — upper half

func (h hiH) Len() int {
\treturn len(h)
}

func (h hiH) Less(i, j int) bool {
\treturn h[i] < h[j]
}

func (h hiH) Swap(i, j int) {
\th[i], h[j] = h[j], h[i]
}

func (h *hiH) Push(x any) {
\t*h = append(*h, x.(int))
}

func (h *hiH) Pop() any {
\told := *h
\tn := len(old)
\tx := old[n-1]
\t*h = old[:n-1]
\treturn x
}

var lo, hi = &loH{}, &hiH{}

func addNum(num int) {
\theap.Push(lo, num)
\theap.Push(hi, heap.Pop(lo).(int)) // balance: move lo's max to hi

\tif hi.Len() > lo.Len() {
\t\theap.Push(lo, heap.Pop(hi).(int))
\t}
}

func findMedian() float64 {
\tif lo.Len() > hi.Len() {
\t\treturn float64((*lo)[0])
\t}
\treturn float64((*lo)[0]+(*hi)[0]) / 2.0
}"""

GO_VAR_MERGE_K = """\
import "container/heap"

// entry tracks a value and where to find the next element from the same source.
type entry struct {
\tval     int
\tlistIdx int
\telemIdx int
}

type entryHeap []entry

func (h entryHeap) Len() int {
\treturn len(h)
}

func (h entryHeap) Less(i, j int) bool {
\treturn h[i].val < h[j].val
}

func (h entryHeap) Swap(i, j int) {
\th[i], h[j] = h[j], h[i]
}

func (h *entryHeap) Push(x any) {
\t*h = append(*h, x.(entry))
}

func (h *entryHeap) Pop() any {
\told := *h
\tn := len(old)
\tx := old[n-1]
\t*h = old[:n-1]
\treturn x
}

func mergeKArrays(arrays [][]int) []int {
\th := &entryHeap{}
\theap.Init(h)

\tfor i, arr := range arrays {
\t\tif len(arr) > 0 {
\t\t\theap.Push(h, entry{arr[0], i, 0})
\t\t}
\t}

\tvar result []int
\tfor h.Len() > 0 {
\t\te := heap.Pop(h).(entry)
\t\tresult = append(result, e.val)
\t\tnextIdx := e.elemIdx + 1
\t\tif nextIdx < len(arrays[e.listIdx]) {
\t\t\theap.Push(h, entry{arrays[e.listIdx][nextIdx], e.listIdx, nextIdx})
\t\t}
\t}
\treturn result
}"""

GO_VAR_MIN_PROBLEMS = """\
import "container/heap"

// item represents a candidate in a "minimum cost" problem.
// Adapt the Less function to your problem's comparison key.
type item struct {
\tcost int
\t// add other fields as needed (e.g., index, coordinates)
}

type minProblemHeap []item

func (h minProblemHeap) Len() int {
\treturn len(h)
}

func (h minProblemHeap) Less(i, j int) bool {
\treturn h[i].cost < h[j].cost
}

func (h minProblemHeap) Swap(i, j int) {
\th[i], h[j] = h[j], h[i]
}

func (h *minProblemHeap) Push(x any) {
\t*h = append(*h, x.(item))
}

func (h *minProblemHeap) Pop() any {
\told := *h
\tn := len(old)
\tx := old[n-1]
\t*h = old[:n-1]
\treturn x
}

func minimumCostExample(items []item, k int) int {
\th := &minProblemHeap{}
\theap.Init(h)
\tfor _, it := range items {
\t\theap.Push(h, it)
\t}

\ttotalCost := 0
\tfor i := 0; i < k && h.Len() > 0; i++ {
\t\ttotalCost += heap.Pop(h).(item).cost
\t}
\treturn totalCost
}"""

# ── Section 19 additions (Go mistakes) ───────────────────────────────────────

GO_MISTAKES_ADDITION = """

## Go-Specific Mistakes

### Mistake: Calling the Method Directly Instead of the Package Function

```go
// WRONG: bypasses heap property maintenance
h.Push(5)
h.Pop()

// RIGHT: always use the package-level functions
heap.Push(h, 5)
heap.Pop(h)
```

Calling `h.Push` / `h.Pop` directly only appends/removes from the underlying slice. It does **not** bubble up or sift down. The heap silently breaks and you get wrong answers.

### Mistake: Forgetting heap.Init

```go
// WRONG: skipping Init on a pre-filled slice
h := &IntHeap{9, 4, 7, 1, 8}
fmt.Println(heap.Pop(h)) // wrong result — not a valid heap

// RIGHT: always call Init first
h := &IntHeap{9, 4, 7, 1, 8}
heap.Init(h)             // heapifies in O(n)
fmt.Println(heap.Pop(h)) // 1
```

`heap.Init` is only needed when you pre-fill a slice. If you start empty and use `heap.Push` from the start, it is not required.

### Mistake: Missing Type Assertion on Pop

```go
// WRONG: compile error — Pop returns any, not int
val := heap.Pop(h)
result = append(result, val+1)

// RIGHT: assert the concrete type
val := heap.Pop(h).(int)
result = append(result, val+1)
```

`heap.Pop` returns `any`. You must assert the concrete type or you get a compile error on arithmetic operations.

### Mistake: Wrong Less Direction for Max-Heap

```go
// WRONG: negating values — error-prone with overflow
func (h MaxHeap) Less(i, j int) bool {
\treturn -h[i] < -h[j]
}

// RIGHT: flip the comparison operator
func (h MaxHeap) Less(i, j int) bool {
\treturn h[i] > h[j]
}
```

The idiomatic Go way to make a max-heap is to flip `<` to `>` in `Less`. Negating values works but is error-prone with integer overflow."""

# ── Section 21 Go templates section ──────────────────────────────────────────

GO_TEMPLATES_SECTION = """

---

## The Go Heap Interface

Go has no built-in priority queue. Every heap requires implementing 5 methods on your type:

```go
import "container/heap"

type IntHeap []int

func (h IntHeap) Len() int {
    return len(h)
}

func (h IntHeap) Less(i, j int) bool {
    return h[i] < h[j] // < = min-heap, > = max-heap
}

func (h IntHeap) Swap(i, j int) {
    h[i], h[j] = h[j], h[i]
}

func (h *IntHeap) Push(x any) {
    *h = append(*h, x.(int))
}

func (h *IntHeap) Pop() any {
    old := *h
    n := len(old)
    x := old[n-1]
    *h = old[:n-1]
    return x
}
// Peek:  (*h)[0]
// Push:  heap.Push(h, val)  — NOT h.Push(val)
// Pop:   heap.Pop(h).(int)  — always assert the type
// Init:  heap.Init(h)       — call once before using a pre-filled slice
```

Declare this once per problem. Adjust the element type and `Less` for each use case.

---

## Go Templates

### Template 1: Top K Elements

```go
// K largest: min-heap of size k. Root = kth largest (weakest keeper).
// K smallest: max-heap of size k. Root = kth smallest (weakest keeper).
type IntHeap []int

func (h IntHeap) Len() int {
    return len(h)
}

func (h IntHeap) Less(i, j int) bool {
    return h[i] < h[j] // flip to > for k smallest
}

func (h IntHeap) Swap(i, j int) {
    h[i], h[j] = h[j], h[i]
}

func (h *IntHeap) Push(x any) {
    *h = append(*h, x.(int))
}

func (h *IntHeap) Pop() any {
    old := *h
    n := len(old)
    x := old[n-1]
    *h = old[:n-1]
    return x
}

h := &IntHeap{}
heap.Init(h)
for _, num := range nums {
    heap.Push(h, num)
    if h.Len() > k {
        heap.Pop(h) // evict weakest keeper
    }
}
// (*h)[0] = kth largest
```

### Template 2: Two Heaps (Streaming Median)

```go
type loH []int // max-heap — lower half

func (h loH) Len() int {
    return len(h)
}

func (h loH) Less(i, j int) bool {
    return h[i] > h[j]
}

func (h loH) Swap(i, j int) {
    h[i], h[j] = h[j], h[i]
}

func (h *loH) Push(x any) {
    *h = append(*h, x.(int))
}

func (h *loH) Pop() any {
    old := *h
    n := len(old)
    x := old[n-1]
    *h = old[:n-1]
    return x
}

type hiH []int // min-heap — upper half

func (h hiH) Len() int {
    return len(h)
}

func (h hiH) Less(i, j int) bool {
    return h[i] < h[j]
}

func (h hiH) Swap(i, j int) {
    h[i], h[j] = h[j], h[i]
}

func (h *hiH) Push(x any) {
    *h = append(*h, x.(int))
}

func (h *hiH) Pop() any {
    old := *h
    n := len(old)
    x := old[n-1]
    *h = old[:n-1]
    return x
}

lo, hi := &loH{}, &hiH{}
heap.Init(lo)
heap.Init(hi)

func addNum(num int) {
    heap.Push(lo, num)
    heap.Push(hi, heap.Pop(lo).(int))
    if hi.Len() > lo.Len() {
        heap.Push(lo, heap.Pop(hi).(int))
    }
}

func findMedian() float64 {
    if lo.Len() > hi.Len() {
        return float64((*lo)[0])
    }
    return float64((*lo)[0]+(*hi)[0]) / 2.0
}
```

### Template 3: Merge K Sorted Sequences

```go
type entry struct {
    val     int
    listIdx int
    elemIdx int
}

type entryHeap []entry

func (h entryHeap) Len() int {
    return len(h)
}

func (h entryHeap) Less(i, j int) bool {
    return h[i].val < h[j].val
}

func (h entryHeap) Swap(i, j int) {
    h[i], h[j] = h[j], h[i]
}

func (h *entryHeap) Push(x any) {
    *h = append(*h, x.(entry))
}

func (h *entryHeap) Pop() any {
    old := *h
    n := len(old)
    x := old[n-1]
    *h = old[:n-1]
    return x
}

h := &entryHeap{}
heap.Init(h)
for i, arr := range arrays {
    if len(arr) > 0 {
        heap.Push(h, entry{arr[0], i, 0})
    }
}
for h.Len() > 0 {
    e := heap.Pop(h).(entry)
    result = append(result, e.val)
    if nextIdx := e.elemIdx + 1; nextIdx < len(arrays[e.listIdx]) {
        heap.Push(h, entry{arrays[e.listIdx][nextIdx], e.listIdx, nextIdx})
    }
}
```

### Template 4: Meeting Rooms II (Min-Heap of End Times)

```go
type endH []int

func (h endH) Len() int {
    return len(h)
}

func (h endH) Less(i, j int) bool {
    return h[i] < h[j]
}

func (h endH) Swap(i, j int) {
    h[i], h[j] = h[j], h[i]
}

func (h *endH) Push(x any) {
    *h = append(*h, x.(int))
}

func (h *endH) Pop() any {
    old := *h
    n := len(old)
    x := old[n-1]
    *h = old[:n-1]
    return x
}

sort.Slice(intervals, func(i, j int) bool { return intervals[i][0] < intervals[j][0] })
h := &endH{}
heap.Init(h)
for _, interval := range intervals {
    if h.Len() > 0 && (*h)[0] <= interval[0] {
        heap.Pop(h) // reuse earliest-ending room
    }
    heap.Push(h, interval[1])
}
return h.Len() // peak concurrent meetings
```

### Template 5: Scheduling / Reorganize (Max-Heap by Frequency)

```go
type cf struct {
    ch   byte
    freq int
}

type cfHeap []cf

func (h cfHeap) Len() int {
    return len(h)
}

func (h cfHeap) Less(i, j int) bool {
    return h[i].freq > h[j].freq
}

func (h cfHeap) Swap(i, j int) {
    h[i], h[j] = h[j], h[i]
}

func (h *cfHeap) Push(x any) {
    *h = append(*h, x.(cf))
}

func (h *cfHeap) Pop() any {
    old := *h
    n := len(old)
    x := old[n-1]
    *h = old[:n-1]
    return x
}

h := &cfHeap{}
heap.Init(h)
// fill h with cf{char, freq} pairs

var prev cf
for h.Len() > 0 {
    curr := heap.Pop(h).(cf)
    result = append(result, curr.ch)
    curr.freq--
    if prev.freq > 0 {
        heap.Push(h, prev) // prev has cooled down, safe to reuse
    }
    prev = curr
}
```

### Template 6: IPO: Two Heaps (Lock + Pick)

```go
// capH: min-heap by capital (locked projects)
type capH [][2]int

func (h capH) Len() int {
    return len(h)
}

func (h capH) Less(i, j int) bool {
    return h[i][0] < h[j][0]
}

func (h capH) Swap(i, j int) {
    h[i], h[j] = h[j], h[i]
}

func (h *capH) Push(x any) {
    *h = append(*h, x.([2]int))
}

func (h *capH) Pop() any {
    old := *h
    n := len(old)
    x := old[n-1]
    *h = old[:n-1]
    return x
}

// profH: max-heap by profit (available projects)
type profH []int

func (h profH) Len() int {
    return len(h)
}

func (h profH) Less(i, j int) bool {
    return h[i] > h[j]
}

func (h profH) Swap(i, j int) {
    h[i], h[j] = h[j], h[i]
}

func (h *profH) Push(x any) {
    *h = append(*h, x.(int))
}

func (h *profH) Pop() any {
    old := *h
    n := len(old)
    x := old[n-1]
    *h = old[:n-1]
    return x
}

locked, available := &capH{}, &profH{}
heap.Init(locked)
heap.Init(available)
for _, p := range projects {
    heap.Push(locked, p)
}
for round := 0; round < k; round++ {
    for locked.Len() > 0 && (*locked)[0][0] <= w {
        p := heap.Pop(locked).([2]int)
        heap.Push(available, p[1])
    }
    if available.Len() == 0 {
        break
    }
    w += heap.Pop(available).(int)
}
```"""


def patch():
    with open("frontend/src/lib/patterns.json", encoding="utf-8") as f:
        data = json.load(f)

    heap = next(x for x in data if x["id"] == "heap")
    t = heap["tutorial"]

    t[3]["code"]["go"] = GO_PEEK
    t[4]["code"]["go"] = GO_INSERT
    t[5]["code"]["go"] = GO_EXTRACT
    t[6]["code"]["go"] = GO_HEAPIFY
    t[7]["code"]["go"] = GO_SUMMARY
    t[8]["code"]["go"] = GO_TOP_K
    t[9]["code"]["go"] = GO_TOP_K_FREQ
    t[10]["code"]["go"] = GO_TWO_HEAPS
    t[11]["code"]["go"] = GO_MERGE_K
    t[12]["approaches"]["heap"]["go"] = GO_TASK_SCHEDULER_HEAP
    t[12]["approaches"]["formula"]["go"] = GO_TASK_SCHEDULER_FORMULA
    t[13]["code"]["go"] = GO_K_CLOSEST
    t[14]["code"]["go"] = GO_MEETING_ROOMS
    t[15]["code"]["go"] = GO_REORGANIZE
    t[16]["code"]["go"] = GO_IPO
    t[17]["code"]["go"] = GO_SLIDING_MEDIAN

    heap["codeTemplates"]["go"] = GO_CODE_TEMPLATES

    heap["variations"][0]["template"]["go"] = GO_VAR_TOP_K
    heap["variations"][1]["template"]["go"] = GO_VAR_TWO_HEAPS
    heap["variations"][2]["template"]["go"] = GO_VAR_MERGE_K
    heap["variations"][3]["template"]["go"] = GO_VAR_MIN_PROBLEMS

    # Rebuild section 19 without any previous Go addition, then append fresh
    content19 = t[19]["content"]
    cutoff = content19.find("\n\n## Go-Specific Mistakes")
    if cutoff != -1:
        content19 = content19[:cutoff]
    t[19]["content"] = content19 + GO_MISTAKES_ADDITION

    # Rebuild section 21 similarly
    content21 = t[21]["content"]
    cutoff = content21.find("\n\n---\n\n## The Go Heap Interface")
    if cutoff != -1:
        content21 = content21[:cutoff]
    t[21]["content"] = content21 + GO_TEMPLATES_SECTION

    # keyInsights — update Java-only line
    insights = heap["keyInsights"]
    for i, insight in enumerate(insights):
        if "Java PriorityQueue" in insight:
            insights[i] = (
                "Java PriorityQueue is a min-heap by default. "
                "For max-heap: Collections.reverseOrder() or (a,b)->b-a. "
                "Go's container/heap is a min-heap by default; "
                "flip Less to h[i]>h[j] for max-heap."
            )

    # commonMistakes — ensure Go entry exists exactly once
    go_mistake = (
        "Go: calling h.Push()/h.Pop() directly instead of heap.Push(h,x)/heap.Pop(h) "
        "— the direct methods skip sift-up/sift-down and silently break the heap property"
    )
    heap["commonMistakes"] = [m for m in heap["commonMistakes"] if "heap.Push" not in m]
    heap["commonMistakes"].append(go_mistake)

    with open("frontend/src/lib/patterns.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print("Done. Verifying...")
    with open("frontend/src/lib/patterns.json", encoding="utf-8") as f:
        data2 = json.load(f)
    heap2 = next(x for x in data2 if x["id"] == "heap")
    t2 = heap2["tutorial"]

    checks = [
        ("t[3] code.go", bool(t2[3]["code"].get("go"))),
        ("t[4] code.go", bool(t2[4]["code"].get("go"))),
        ("t[5] code.go", bool(t2[5]["code"].get("go"))),
        ("t[6] code.go", bool(t2[6]["code"].get("go"))),
        ("t[7] code.go", bool(t2[7]["code"].get("go"))),
        ("t[8] code.go", bool(t2[8]["code"].get("go"))),
        ("t[9] code.go", bool(t2[9]["code"].get("go"))),
        ("t[10] code.go", bool(t2[10]["code"].get("go"))),
        ("t[11] code.go", bool(t2[11]["code"].get("go"))),
        ("t[12] approaches.heap.go", bool(t2[12]["approaches"]["heap"].get("go"))),
        ("t[12] approaches.formula.go", bool(t2[12]["approaches"]["formula"].get("go"))),
        ("t[13] code.go", bool(t2[13]["code"].get("go"))),
        ("t[14] code.go", bool(t2[14]["code"].get("go"))),
        ("t[15] code.go", bool(t2[15]["code"].get("go"))),
        ("t[16] code.go", bool(t2[16]["code"].get("go"))),
        ("t[17] code.go", bool(t2[17]["code"].get("go"))),
        ("codeTemplates.go", bool(heap2["codeTemplates"].get("go"))),
        ("variations[0] go", bool(heap2["variations"][0]["template"].get("go"))),
        ("variations[1] go", bool(heap2["variations"][1]["template"].get("go"))),
        ("variations[2] go", bool(heap2["variations"][2]["template"].get("go"))),
        ("variations[3] go", bool(heap2["variations"][3]["template"].get("go"))),
        ("t[19] Go mistakes", "Go-Specific Mistakes" in t2[19]["content"]),
        ("t[21] Go templates", "Go Templates" in t2[21]["content"]),
        ("keyInsights Go", any("container/heap" in x for x in heap2["keyInsights"])),
        ("commonMistakes Go", any("heap.Push" in x for x in heap2["commonMistakes"])),
        ("proper multiline Len", "{\n\treturn len(h)" in t2[3]["code"]["go"]),
        ("proper multiline Less", "{\n\treturn h[i] < h[j]" in t2[3]["code"]["go"]),
        ("proper multiline Push", "{\n\t*h = append" in t2[3]["code"]["go"]),
        ("proper multiline Pop", "{\n\told := *h\n\tn := len(old)" in t2[3]["code"]["go"]),
    ]

    all_ok = True
    for name, ok in checks:
        status = "OK  " if ok else "FAIL"
        print(f"  {status}: {name}")
        if not ok:
            all_ok = False

    if all_ok:
        print("\nAll checks passed.")
    else:
        print("\nSome checks failed!")


if __name__ == "__main__":
    patch()
