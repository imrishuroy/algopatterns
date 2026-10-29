#!/usr/bin/env python3
"""Patches the graphs pattern in patterns.json with Go language support."""
import json

# ── Section 3: Graph Representation ──────────────────────────────────────────
GO_SEC3 = """\
// Graph Representation
//
// Adjacency List: O(V + E) space - PREFERRED
// Adjacency Matrix: O(V²) space

// Adjacency List (Unweighted)
func buildAdjList(n int, edges [][]int) [][]int {
    adj := make([][]int, n+1)
    for _, edge := range edges {
        u, v := edge[0], edge[1]
        adj[u] = append(adj[u], v)
        adj[v] = append(adj[v], u) // Remove for directed graph
    }
    return adj
}

// Adjacency List (Weighted): each entry is [neighbor, weight]
func buildWeightedAdjList(n int, edges [][]int) [][][2]int {
    adj := make([][][2]int, n+1)
    for _, edge := range edges {
        u, v, w := edge[0], edge[1], edge[2]
        adj[u] = append(adj[u], [2]int{v, w})
        adj[v] = append(adj[v], [2]int{u, w}) // Remove for directed
    }
    return adj
}

// Adjacency Matrix
func buildAdjMatrix(n int, edges [][]int) [][]int {
    matrix := make([][]int, n+1)
    for i := range matrix {
        matrix[i] = make([]int, n+1)
    }
    for _, edge := range edges {
        matrix[edge[0]][edge[1]] = 1
        matrix[edge[1]][edge[0]] = 1 // Remove for directed
    }
    return matrix
}"""

# ── Section 4: DFS vs BFS ─────────────────────────────────────────────────────
GO_SEC4 = """\
// DFS - recursive
func dfs(graph [][]int, node int, visited []bool) {
    visited[node] = true
    // Process node here
    for _, neighbor := range graph[node] {
        if !visited[neighbor] {
            dfs(graph, neighbor, visited)
        }
    }
}

// BFS - iterative with slice as queue
func bfs(graph [][]int, start int) {
    visited := make([]bool, len(graph))
    queue := []int{start}
    visited[start] = true

    for len(queue) > 0 {
        node := queue[0]
        queue = queue[1:]
        // Process node here
        for _, neighbor := range graph[node] {
            if !visited[neighbor] {
                visited[neighbor] = true // Mark BEFORE adding
                queue = append(queue, neighbor)
            }
        }
    }
}"""

# ── Section 5: BFS: Find if Path Exists ───────────────────────────────────────
GO_SEC5 = """\
// Find if Path Exists in Graph (LC 1971)
//
// Time: O(V + E)
// Space: O(V)
func validPath(n int, edges [][]int, source int, destination int) bool {
    if source == destination {
        return true
    }

    adj := make([][]int, n)
    for _, edge := range edges {
        adj[edge[0]] = append(adj[edge[0]], edge[1])
        adj[edge[1]] = append(adj[edge[1]], edge[0]) // Undirected
    }

    visited := make([]bool, n)
    queue := []int{source}
    visited[source] = true

    for len(queue) > 0 {
        node := queue[0]
        queue = queue[1:]

        for _, neighbor := range adj[node] {
            if neighbor == destination {
                return true
            }
            if !visited[neighbor] {
                visited[neighbor] = true // Mark BEFORE adding
                queue = append(queue, neighbor)
            }
        }
    }

    return false
}"""

# ── Section 6: BFS: Walls and Gates ──────────────────────────────────────────
GO_SEC6 = """\
// Walls and Gates (LC 286)
//
// -1 = wall, 0 = gate, math.MaxInt32 = empty room
// Fill each empty room with the distance to its nearest gate.
//
// Multi-source BFS: start from ALL gates simultaneously.
//
// Time: O(m * n)
// Space: O(m * n)
import "math"

func wallsAndGates(rooms [][]int) {
    if len(rooms) == 0 {
        return
    }

    m, n := len(rooms), len(rooms[0])
    dirs := [][2]int{{0, 1}, {0, -1}, {1, 0}, {-1, 0}}
    const INF = math.MaxInt32

    var queue [][2]int
    for i := 0; i < m; i++ {
        for j := 0; j < n; j++ {
            if rooms[i][j] == 0 { // Gate
                queue = append(queue, [2]int{i, j})
            }
        }
    }

    for len(queue) > 0 {
        cell := queue[0]
        queue = queue[1:]
        row, col := cell[0], cell[1]

        for _, d := range dirs {
            nr, nc := row+d[0], col+d[1]
            if nr < 0 || nr >= m || nc < 0 || nc >= n {
                continue
            }
            if rooms[nr][nc] != INF {
                continue
            }
            rooms[nr][nc] = rooms[row][col] + 1
            queue = append(queue, [2]int{nr, nc})
        }
    }
}"""

# ── Section 7: BFS: Shortest Path in Unweighted Graph ────────────────────────
GO_SEC7 = """\
// Shortest Path in Unweighted Graph
//
// BFS explores level by level, so the first time a node is reached
// is guaranteed to be via the shortest path.
//
// Time: O(V + E)
// Space: O(V)

// Method 1: track distance alongside each node
func shortestPath(graph [][]int, source, dest int) int {
    if source == dest {
        return 0
    }

    visited := make([]bool, len(graph))
    // queue stores [node, distance]
    queue := [][2]int{{source, 0}}
    visited[source] = true

    for len(queue) > 0 {
        curr := queue[0]
        queue = queue[1:]
        node, dist := curr[0], curr[1]

        for _, neighbor := range graph[node] {
            if neighbor == dest {
                return dist + 1
            }
            if !visited[neighbor] {
                visited[neighbor] = true
                queue = append(queue, [2]int{neighbor, dist + 1})
            }
        }
    }

    return -1
}

// Method 2: level-by-level processing
func shortestPathLevelByLevel(graph [][]int, source, dest int) int {
    if source == dest {
        return 0
    }

    visited := make([]bool, len(graph))
    queue := []int{source}
    visited[source] = true
    distance := 0

    for len(queue) > 0 {
        size := len(queue)
        distance++

        for i := 0; i < size; i++ {
            node := queue[0]
            queue = queue[1:]

            for _, neighbor := range graph[node] {
                if neighbor == dest {
                    return distance
                }
                if !visited[neighbor] {
                    visited[neighbor] = true
                    queue = append(queue, neighbor)
                }
            }
        }
    }

    return -1
}"""

# ── Section 8: BFS on Grid: Shortest Path in Binary Matrix ───────────────────
GO_SEC8 = """\
// Shortest Path in Binary Matrix (LC 1091)
//
// Find shortest path from (0,0) to (n-1,n-1) in a binary grid.
// 0 = passable, 1 = blocked. Can move in 8 directions.
//
// Time: O(n²)
// Space: O(n²)
func shortestPathBinaryMatrix(grid [][]int) int {
    n := len(grid)
    if grid[0][0] == 1 || grid[n-1][n-1] == 1 {
        return -1
    }
    if n == 1 {
        return 1
    }

    dirs := [][2]int{
        {-1, -1}, {-1, 0}, {-1, 1},
        {0, -1}, {0, 1},
        {1, -1}, {1, 0}, {1, 1},
    }

    // queue stores [row, col, distance]
    queue := [][3]int{{0, 0, 1}}
    grid[0][0] = 1 // mark visited

    for len(queue) > 0 {
        curr := queue[0]
        queue = queue[1:]
        row, col, dist := curr[0], curr[1], curr[2]

        for _, d := range dirs {
            nr, nc := row+d[0], col+d[1]
            if nr < 0 || nr >= n || nc < 0 || nc >= n {
                continue
            }
            if grid[nr][nc] == 1 {
                continue
            }
            if nr == n-1 && nc == n-1 {
                return dist + 1
            }
            grid[nr][nc] = 1 // mark visited
            queue = append(queue, [3]int{nr, nc, dist + 1})
        }
    }

    return -1
}"""

# ── Section 9: Grid as a Graph: Number of Islands ────────────────────────────
GO_SEC9 = """\
// Number of Islands - DFS Solution
//
// Treat each '1' cell as land. Connected '1's form an island.
//
// Time: O(m * n)
// Space: O(m * n)
var islandDirs = [][2]int{{0, 1}, {1, 0}, {-1, 0}, {0, -1}}

func numIslands(grid [][]byte) int {
    m, n := len(grid), len(grid[0])
    visited := make([][]bool, m)
    for i := range visited {
        visited[i] = make([]bool, n)
    }
    count := 0

    for i := 0; i < m; i++ {
        for j := 0; j < n; j++ {
            if !visited[i][j] && grid[i][j] == '1' {
                count++
                islandsDFS(i, j, grid, visited)
            }
        }
    }
    return count
}

func islandsDFS(i, j int, grid [][]byte, visited [][]bool) {
    if i < 0 || i >= len(grid) || j < 0 || j >= len(grid[0]) {
        return
    }
    if visited[i][j] || grid[i][j] == '0' {
        return
    }
    visited[i][j] = true
    for _, d := range islandDirs {
        islandsDFS(i+d[0], j+d[1], grid, visited)
    }
}

// Number of Islands - BFS Solution
func numIslandsBFS(grid [][]byte) int {
    m, n := len(grid), len(grid[0])
    visited := make([][]bool, m)
    for i := range visited {
        visited[i] = make([]bool, n)
    }
    count := 0

    for i := 0; i < m; i++ {
        for j := 0; j < n; j++ {
            if !visited[i][j] && grid[i][j] == '1' {
                count++
                islandsBFS(i, j, grid, visited)
            }
        }
    }
    return count
}

func islandsBFS(startR, startC int, grid [][]byte, visited [][]bool) {
    m, n := len(grid), len(grid[0])
    queue := [][2]int{{startR, startC}}
    visited[startR][startC] = true

    for len(queue) > 0 {
        cell := queue[0]
        queue = queue[1:]
        r, c := cell[0], cell[1]

        for _, d := range islandDirs {
            nr, nc := r+d[0], c+d[1]
            if nr >= 0 && nr < m && nc >= 0 && nc < n &&
                !visited[nr][nc] && grid[nr][nc] == '1' {
                visited[nr][nc] = true // Mark BEFORE adding
                queue = append(queue, [2]int{nr, nc})
            }
        }
    }
}"""

# ── Section 10: Multi-Source BFS: Rotting Oranges ────────────────────────────
GO_SEC10 = """\
// Rotting Oranges - Multi-Source BFS
//
// All rotten oranges (value 2) are BFS sources; BFS spreads
// level by level where each level represents one minute.
//
// Time: O(m * n)
// Space: O(m * n)
func orangesRotting(grid [][]int) int {
    rows, cols := len(grid), len(grid[0])
    dirs := [][2]int{{1, 0}, {-1, 0}, {0, 1}, {0, -1}}

    var queue [][2]int
    freshOranges := 0

    for i := 0; i < rows; i++ {
        for j := 0; j < cols; j++ {
            if grid[i][j] == 2 {
                queue = append(queue, [2]int{i, j})
            } else if grid[i][j] == 1 {
                freshOranges++
            }
        }
    }

    minutes := 0

    for len(queue) > 0 && freshOranges > 0 {
        size := len(queue)
        minutes++

        for i := 0; i < size; i++ {
            node := queue[0]
            queue = queue[1:]

            for _, d := range dirs {
                nr, nc := node[0]+d[0], node[1]+d[1]
                if nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == 1 {
                    grid[nr][nc] = 2
                    freshOranges--
                    queue = append(queue, [2]int{nr, nc})
                }
            }
        }
    }

    if freshOranges > 0 {
        return -1
    }
    return minutes
}"""

# ── Section 11: Topological Sort: Course Schedule ────────────────────────────
GO_SEC11 = """\
// Can we finish all courses? (Cycle detection via Kahn's algorithm)
//
// Time: O(V + E)
// Space: O(V + E)
func canFinish(numCourses int, prerequisites [][]int) bool {
    graph := make([][]int, numCourses)
    indegree := make([]int, numCourses)

    for _, pre := range prerequisites {
        graph[pre[1]] = append(graph[pre[1]], pre[0])
        indegree[pre[0]]++
    }

    var queue []int
    for i := 0; i < numCourses; i++ {
        if indegree[i] == 0 {
            queue = append(queue, i)
        }
    }

    completed := 0
    for len(queue) > 0 {
        course := queue[0]
        queue = queue[1:]
        completed++

        for _, next := range graph[course] {
            indegree[next]--
            if indegree[next] == 0 {
                queue = append(queue, next)
            }
        }
    }

    return completed == numCourses // false if cycle exists
}"""

# ── Section 12: Dijkstra: Weighted Shortest Path ─────────────────────────────
GO_SEC12 = """\
// Network Delay Time: time for signal to reach all nodes
//
// Time: O((V + E) log V)
// Space: O(V + E)
import (
    "container/heap"
    "math"
)

// minHeap is a min-heap ordered by distance
type minHeap [][]int // each entry: [dist, node]

func (h minHeap) Len() int {
    return len(h)
}

func (h minHeap) Less(i, j int) bool {
    return h[i][0] < h[j][0]
}

func (h minHeap) Swap(i, j int) {
    h[i], h[j] = h[j], h[i]
}

func (h *minHeap) Push(x any) {
    *h = append(*h, x.([]int))
}

func (h *minHeap) Pop() any {
    old := *h
    n := len(old)
    x := old[n-1]
    *h = old[:n-1]
    return x
}

func networkDelayTime(times [][]int, n int, k int) int {
    adj := make([][][2]int, n+1)
    for _, t := range times {
        adj[t[0]] = append(adj[t[0]], [2]int{t[1], t[2]})
    }

    const inf = math.MaxInt32
    dist := make([]int, n+1)
    for i := range dist {
        dist[i] = inf
    }
    dist[k] = 0

    pq := &minHeap{{0, k}}
    heap.Init(pq)

    for pq.Len() > 0 {
        curr := heap.Pop(pq).([]int)
        d, u := curr[0], curr[1]

        if d > dist[u] {
            continue // stale entry
        }

        for _, e := range adj[u] {
            v, w := e[0], e[1]
            if dist[u]+w < dist[v] {
                dist[v] = dist[u] + w
                heap.Push(pq, []int{dist[v], v})
            }
        }
    }

    maxTime := 0
    for i := 1; i <= n; i++ {
        if dist[i] == inf {
            return -1
        }
        if dist[i] > maxTime {
            maxTime = dist[i]
        }
    }
    return maxTime
}"""

# ── Section 13: Clone Graph: Deep Copy with HashMap ──────────────────────────
GO_SEC13 = """\
// Clone Graph
//
// Use a map (original -> clone) to handle cycles: if we encounter
// a node already in the map, return its clone immediately instead
// of recursing infinitely.
//
// Time: O(V + E)
// Space: O(V)
type GraphNode struct {
    Val       int
    Neighbors []*GraphNode
}

func cloneGraph(node *GraphNode) *GraphNode {
    if node == nil {
        return nil
    }
    cloned := make(map[*GraphNode]*GraphNode)
    return cloneDFS(node, cloned)
}

func cloneDFS(node *GraphNode, cloned map[*GraphNode]*GraphNode) *GraphNode {
    if c, ok := cloned[node]; ok {
        return c
    }

    cp := &GraphNode{Val: node.Val}
    // Store BEFORE recursing to handle cycles
    cloned[node] = cp

    for _, nei := range node.Neighbors {
        cp.Neighbors = append(cp.Neighbors, cloneDFS(nei, cloned))
    }
    return cp
}"""

# ── Section 14: Implicit Graphs: Word Ladder ─────────────────────────────────
GO_SEC14 = """\
// Word Ladder
//
// Each word is a graph node; neighbors differ by exactly one character.
// BFS guarantees the shortest transformation sequence.
//
// Time: O(M² * N) where M = word length, N = wordList size
// Space: O(M * N)
func ladderLength(beginWord string, endWord string, wordList []string) int {
    wordSet := make(map[string]bool)
    for _, w := range wordList {
        wordSet[w] = true
    }
    if !wordSet[endWord] {
        return 0
    }

    queue := []string{beginWord}
    visited := map[string]bool{beginWord: true}
    level := 1

    for len(queue) > 0 {
        size := len(queue)

        for i := 0; i < size; i++ {
            word := queue[0]
            queue = queue[1:]

            chars := []byte(word)
            for j := 0; j < len(chars); j++ {
                original := chars[j]

                for c := byte('a'); c <= 'z'; c++ {
                    if c == original {
                        continue
                    }
                    chars[j] = c
                    newWord := string(chars)

                    if newWord == endWord {
                        return level + 1
                    }

                    if wordSet[newWord] && !visited[newWord] {
                        visited[newWord] = true
                        queue = append(queue, newWord)
                    }
                }
                chars[j] = original
            }
        }
        level++
    }
    return 0
}"""

# ── Section 15: Union-Find: Dynamic Connectivity ─────────────────────────────
GO_SEC15 = """\
// Union-Find with path compression and union by rank
type UnionFind struct {
    parent     []int
    rank       []int
    components int
}

func newUnionFind(n int) *UnionFind {
    parent := make([]int, n)
    for i := range parent {
        parent[i] = i
    }
    return &UnionFind{parent: parent, rank: make([]int, n), components: n}
}

// Find with path compression
func (uf *UnionFind) find(x int) int {
    if uf.parent[x] != x {
        uf.parent[x] = uf.find(uf.parent[x])
    }
    return uf.parent[x]
}

// Union by rank
func (uf *UnionFind) union(x, y int) bool {
    px, py := uf.find(x), uf.find(y)
    if px == py {
        return false // already connected
    }
    switch {
    case uf.rank[px] < uf.rank[py]:
        uf.parent[px] = py
    case uf.rank[px] > uf.rank[py]:
        uf.parent[py] = px
    default:
        uf.parent[py] = px
        uf.rank[px]++
    }
    uf.components--
    return true
}

func (uf *UnionFind) connected(x, y int) bool {
    return uf.find(x) == uf.find(y)
}"""

# ── Section 16: Cycle Detection: The Three-Color Method ──────────────────────
GO_SEC16 = """\
// Cycle detection in directed graph using DFS with 3 states
//
// 0 = unvisited (white)
// 1 = in current DFS path (gray), a gray neighbor means cycle
// 2 = fully explored (black)
//
// Time: O(V + E)
// Space: O(V)
func hasCycle(n int, edges [][]int) bool {
    graph := make([][]int, n)
    for _, e := range edges {
        graph[e[0]] = append(graph[e[0]], e[1])
    }

    color := make([]int, n) // 0=white, 1=gray, 2=black

    var cycleDFS func(node int) bool
    cycleDFS = func(node int) bool {
        color[node] = 1 // gray: being explored

        for _, neighbor := range graph[node] {
            if color[neighbor] == 1 {
                return true // back edge = cycle!
            }
            if color[neighbor] == 0 && cycleDFS(neighbor) {
                return true
            }
        }

        color[node] = 2 // black: fully explored
        return false
    }

    for i := 0; i < n; i++ {
        if color[i] == 0 && cycleDFS(i) {
            return true
        }
    }
    return false
}"""

# ── Section 17: Bipartite Graph Check ────────────────────────────────────────
GO_SEC17 = """\
// Bipartite Graph Check using BFS 2-coloring
//
// Try to color the graph with 2 colors so that no two adjacent
// nodes share the same color. Handles disconnected graphs.
//
// Time: O(V + E)
// Space: O(V)
func isBipartite(graph [][]int) bool {
    n := len(graph)
    color := make([]int, n)
    for i := range color {
        color[i] = -1 // -1 = uncolored
    }

    for i := 0; i < n; i++ {
        if color[i] != -1 {
            continue
        }
        queue := []int{i}
        color[i] = 0

        for len(queue) > 0 {
            node := queue[0]
            queue = queue[1:]

            for _, neighbor := range graph[node] {
                if color[neighbor] == -1 {
                    color[neighbor] = 1 - color[node] // opposite color
                    queue = append(queue, neighbor)
                } else if color[neighbor] == color[node] {
                    return false // same color = not bipartite
                }
            }
        }
    }
    return true
}"""

# ── Section 18: Minimum Spanning Tree: Kruskal's Algorithm ───────────────────
GO_SEC18 = """\
// Minimum Cost to Connect All Points (LC 1584): Kruskal's Algorithm
//
// Time: O(E log E) for sorting edges
// Space: O(E)
import "sort"

func minCostConnectPoints(points [][]int) int {
    n := len(points)

    type edge struct{ cost, u, v int }
    edges := make([]edge, 0, n*(n-1)/2)

    for i := 0; i < n; i++ {
        for j := i + 1; j < n; j++ {
            cost := abs(points[i][0]-points[j][0]) + abs(points[i][1]-points[j][1])
            edges = append(edges, edge{cost, i, j})
        }
    }

    sort.Slice(edges, func(a, b int) bool {
        return edges[a].cost < edges[b].cost
    })

    parent := make([]int, n)
    for i := range parent {
        parent[i] = i
    }

    var findRoot func(x int) int
    findRoot = func(x int) int {
        if parent[x] != x {
            parent[x] = findRoot(parent[x])
        }
        return parent[x]
    }

    totalCost, edgesUsed := 0, 0
    for _, e := range edges {
        pu, pv := findRoot(e.u), findRoot(e.v)
        if pu != pv {
            parent[pu] = pv
            totalCost += e.cost
            edgesUsed++
            if edgesUsed == n-1 {
                break // MST complete
            }
        }
    }
    return totalCost
}

func abs(x int) int {
    if x < 0 {
        return -x
    }
    return x
}"""

# ── codeTemplates.go ──────────────────────────────────────────────────────────
GO_TEMPLATE = """\
// DFS on Grid - Number of Islands
func numIslands(grid [][]byte) int {
    rows, cols := len(grid), len(grid[0])
    count := 0

    var dfs func(r, c int)
    dfs = func(r, c int) {
        if r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] == '0' {
            return
        }
        grid[r][c] = '0' // mark visited
        dfs(r+1, c)
        dfs(r-1, c)
        dfs(r, c+1)
        dfs(r, c-1)
    }

    for r := 0; r < rows; r++ {
        for c := 0; c < cols; c++ {
            if grid[r][c] == '1' {
                count++
                dfs(r, c)
            }
        }
    }
    return count
}

// BFS - Shortest Path
func shortestPath(graph [][]int, start, end int) int {
    // queue stores [node, distance]
    queue := [][2]int{{start, 0}}
    visited := map[int]bool{start: true}

    for len(queue) > 0 {
        node, dist := queue[0][0], queue[0][1]
        queue = queue[1:]
        if node == end {
            return dist
        }
        for _, neighbor := range graph[node] {
            if !visited[neighbor] {
                visited[neighbor] = true
                queue = append(queue, [2]int{neighbor, dist + 1})
            }
        }
    }
    return -1
}

// Topological Sort (Kahn's BFS)
func topologicalSort(numNodes int, edges [][]int) []int {
    graph := make([][]int, numNodes)
    indegree := make([]int, numNodes)

    for _, e := range edges {
        graph[e[0]] = append(graph[e[0]], e[1])
        indegree[e[1]]++
    }

    var queue []int
    for i := 0; i < numNodes; i++ {
        if indegree[i] == 0 {
            queue = append(queue, i)
        }
    }

    var order []int
    for len(queue) > 0 {
        node := queue[0]
        queue = queue[1:]
        order = append(order, node)
        for _, neighbor := range graph[node] {
            indegree[neighbor]--
            if indegree[neighbor] == 0 {
                queue = append(queue, neighbor)
            }
        }
    }
    if len(order) == numNodes {
        return order
    }
    return nil // cycle detected
}"""

# ── Variation 0: Grid BFS ─────────────────────────────────────────────────────
GO_VAR0 = """\
dirs := [][2]int{{0, 1}, {0, -1}, {1, 0}, {-1, 0}}

func gridBFS(grid [][]int, startR, startC int) {
    rows, cols := len(grid), len(grid[0])
    visited := make([][]bool, rows)
    for i := range visited {
        visited[i] = make([]bool, cols)
    }

    queue := [][2]int{{startR, startC}}
    visited[startR][startC] = true

    for len(queue) > 0 {
        cell := queue[0]
        queue = queue[1:]

        for _, d := range dirs {
            nr, nc := cell[0]+d[0], cell[1]+d[1]
            if nr >= 0 && nr < rows && nc >= 0 && nc < cols &&
                !visited[nr][nc] && grid[nr][nc] == 1 {
                visited[nr][nc] = true
                queue = append(queue, [2]int{nr, nc})
            }
        }
    }
}"""

# ── Variation 1: Course Schedule (Topological Sort) ───────────────────────────
GO_VAR1 = """\
func canFinish(numCourses int, prerequisites [][]int) bool {
    graph := make([][]int, numCourses)
    indegree := make([]int, numCourses)

    for _, pre := range prerequisites {
        graph[pre[1]] = append(graph[pre[1]], pre[0])
        indegree[pre[0]]++
    }

    var queue []int
    for i := 0; i < numCourses; i++ {
        if indegree[i] == 0 {
            queue = append(queue, i)
        }
    }

    completed := 0
    for len(queue) > 0 {
        course := queue[0]
        queue = queue[1:]
        completed++
        for _, next := range graph[course] {
            indegree[next]--
            if indegree[next] == 0 {
                queue = append(queue, next)
            }
        }
    }
    return completed == numCourses
}"""

# ── Variation 2: Clone Graph ──────────────────────────────────────────────────
GO_VAR2 = """\
type GraphNode struct {
    Val       int
    Neighbors []*GraphNode
}

func cloneGraph(node *GraphNode) *GraphNode {
    if node == nil {
        return nil
    }
    cloned := make(map[*GraphNode]*GraphNode)
    return cloneHelper(node, cloned)
}

func cloneHelper(node *GraphNode, cloned map[*GraphNode]*GraphNode) *GraphNode {
    if c, ok := cloned[node]; ok {
        return c
    }

    cp := &GraphNode{Val: node.Val}
    cloned[node] = cp // store before recursing to handle cycles

    for _, neighbor := range node.Neighbors {
        cp.Neighbors = append(cp.Neighbors, cloneHelper(neighbor, cloned))
    }
    return cp
}"""

# ── Variation 3: Dijkstra ─────────────────────────────────────────────────────
GO_VAR3 = """\
import (
    "container/heap"
    "math"
)

type dijkHeap [][]int // [dist, node]

func (h dijkHeap) Len() int {
    return len(h)
}

func (h dijkHeap) Less(i, j int) bool {
    return h[i][0] < h[j][0]
}

func (h dijkHeap) Swap(i, j int) {
    h[i], h[j] = h[j], h[i]
}

func (h *dijkHeap) Push(x any) {
    *h = append(*h, x.([]int))
}

func (h *dijkHeap) Pop() any {
    old := *h
    n := len(old)
    x := old[n-1]
    *h = old[:n-1]
    return x
}

func dijkstra(graph [][][2]int, n, start int) []int {
    const inf = math.MaxInt32
    dist := make([]int, n)
    for i := range dist {
        dist[i] = inf
    }
    dist[start] = 0

    pq := &dijkHeap{{0, start}}
    heap.Init(pq)

    for pq.Len() > 0 {
        curr := heap.Pop(pq).([]int)
        d, u := curr[0], curr[1]

        if d > dist[u] {
            continue
        }

        for _, edge := range graph[u] {
            v, w := edge[0], edge[1]
            if dist[u]+w < dist[v] {
                dist[v] = dist[u] + w
                heap.Push(pq, []int{dist[v], v})
            }
        }
    }
    return dist
}"""

# ── Variation 4: Rotting Oranges ──────────────────────────────────────────────
GO_VAR4 = """\
func orangesRotting(grid [][]int) int {
    m, n := len(grid), len(grid[0])
    dirs := [][2]int{{0, 1}, {0, -1}, {1, 0}, {-1, 0}}

    var queue [][2]int
    fresh := 0

    for i := 0; i < m; i++ {
        for j := 0; j < n; j++ {
            if grid[i][j] == 2 {
                queue = append(queue, [2]int{i, j})
            } else if grid[i][j] == 1 {
                fresh++
            }
        }
    }

    if fresh == 0 {
        return 0
    }

    minutes := 0
    for len(queue) > 0 && fresh > 0 {
        size := len(queue)
        minutes++
        for i := 0; i < size; i++ {
            curr := queue[0]
            queue = queue[1:]
            for _, d := range dirs {
                nr, nc := curr[0]+d[0], curr[1]+d[1]
                if nr >= 0 && nr < m && nc >= 0 && nc < n && grid[nr][nc] == 1 {
                    grid[nr][nc] = 2
                    fresh--
                    queue = append(queue, [2]int{nr, nc})
                }
            }
        }
    }

    if fresh == 0 {
        return minutes
    }
    return -1
}"""

# ── Variation 5: Word Ladder ──────────────────────────────────────────────────
GO_VAR5 = """\
func ladderLength(beginWord string, endWord string, wordList []string) int {
    wordSet := make(map[string]bool)
    for _, w := range wordList {
        wordSet[w] = true
    }
    if !wordSet[endWord] {
        return 0
    }

    queue := []string{beginWord}
    visited := map[string]bool{beginWord: true}
    level := 1

    for len(queue) > 0 {
        size := len(queue)
        for i := 0; i < size; i++ {
            word := queue[0]
            queue = queue[1:]
            chars := []byte(word)

            for j := 0; j < len(chars); j++ {
                original := chars[j]
                for c := byte('a'); c <= 'z'; c++ {
                    if c == original {
                        continue
                    }
                    chars[j] = c
                    newWord := string(chars)

                    if newWord == endWord {
                        return level + 1
                    }
                    if wordSet[newWord] && !visited[newWord] {
                        visited[newWord] = true
                        queue = append(queue, newWord)
                    }
                }
                chars[j] = original
            }
        }
        level++
    }
    return 0
}"""

# ── Variation 6: Count Components ────────────────────────────────────────────
GO_VAR6 = """\
func countComponents(n int, edges [][]int) int {
    graph := make([][]int, n)
    for _, edge := range edges {
        graph[edge[0]] = append(graph[edge[0]], edge[1])
        graph[edge[1]] = append(graph[edge[1]], edge[0])
    }

    visited := make([]bool, n)

    var dfs func(node int)
    dfs = func(node int) {
        visited[node] = true
        for _, neighbor := range graph[node] {
            if !visited[neighbor] {
                dfs(neighbor)
            }
        }
    }

    count := 0
    for i := 0; i < n; i++ {
        if !visited[i] {
            dfs(i)
            count++
        }
    }
    return count
}"""

# ── Variation 7: Valid Path ───────────────────────────────────────────────────
GO_VAR7 = """\
func validPath(n int, edges [][]int, source, dest int) bool {
    if source == dest {
        return true
    }

    graph := make([][]int, n)
    for _, edge := range edges {
        graph[edge[0]] = append(graph[edge[0]], edge[1])
        graph[edge[1]] = append(graph[edge[1]], edge[0])
    }

    queue := []int{source}
    visited := make([]bool, n)
    visited[source] = true

    for len(queue) > 0 {
        node := queue[0]
        queue = queue[1:]
        for _, neighbor := range graph[node] {
            if neighbor == dest {
                return true
            }
            if !visited[neighbor] {
                visited[neighbor] = true
                queue = append(queue, neighbor)
            }
        }
    }
    return false
}"""

# ── Variation 8: Kruskal's MST ────────────────────────────────────────────────
GO_VAR8 = """\
import "sort"

func minCostConnectPoints(points [][]int) int {
    n := len(points)

    type edge struct{ cost, u, v int }
    edges := make([]edge, 0, n*(n-1)/2)

    for i := 0; i < n; i++ {
        for j := i + 1; j < n; j++ {
            cost := abs(points[i][0]-points[j][0]) + abs(points[i][1]-points[j][1])
            edges = append(edges, edge{cost, i, j})
        }
    }

    sort.Slice(edges, func(a, b int) bool {
        return edges[a].cost < edges[b].cost
    })

    parent := make([]int, n)
    for i := range parent {
        parent[i] = i
    }

    var findRoot func(x int) int
    findRoot = func(x int) int {
        if parent[x] != x {
            parent[x] = findRoot(parent[x])
        }
        return parent[x]
    }

    totalCost, edgesUsed := 0, 0
    for _, e := range edges {
        pu, pv := findRoot(e.u), findRoot(e.v)
        if pu != pv {
            parent[pu] = pv
            totalCost += e.cost
            edgesUsed++
            if edgesUsed == n-1 {
                break
            }
        }
    }
    return totalCost
}

func abs(x int) int {
    if x < 0 {
        return -x
    }
    return x
}"""

# ── Section 19 updated content ────────────────────────────────────────────────
SEC19_CONTENT = """\
**Edge Cases to Handle:**

**1. Empty Graph / Single Node**
```
if n == 0: return 0
if n == 1: return 0  // No edges needed
```

**2. Disconnected Graph**
```
// Check all components, not just one
for i in 0..n:
    if not visited[i]:
        dfs(i)  // Start new traversal
```

**3. Self-Loops**
```
if u == v: continue  // Skip self-loops if not allowed
```

**4. Multiple Edges Between Same Nodes**
```
// Usually keep all for weighted, or dedupe for unweighted
seen = set()
if (u, v) not in seen:
    seen.add((u, v))
    process(u, v)
```

**5. Source/Destination Same**
```
if source == destination: return true  // Or 0 for distance
```

**Common Mistakes:**

| Mistake | Consequence |
|---------|-------------|
| Mark visited after adding to queue | Process same node multiple times |
| Forget to handle disconnected | Miss some components |
| DFS for shortest path | Gets A path, not shortest |
| Dijkstra with negative weights | Incorrect results |
| Topo sort on cyclic graph | Infinite loop or wrong order |

## Go-Specific Mistakes

**1. Slice as queue causes O(n) dequeue**

Using `queue = queue[1:]` leaves the underlying array allocated. For correctness this is fine, but for very large graphs the slice's backing array grows unbounded. In interview code this is acceptable; in production, use a proper deque or index-based approach.

**2. Forgetting to check bounds before grid access**

Go does not have guard clauses like Java's `if (newRow < 0 || newRow >= m)` built into array access. Out-of-bounds access causes a runtime panic, not a compile error. Always validate row and column before indexing `grid[nr][nc]`.

**3. Capturing loop variable in goroutine**

When parallelising BFS levels:
```go
// Bad: all goroutines share the same 'cell' variable
for _, cell := range level {
    go func() { process(cell) }()
}

// Good: pass as argument
for _, cell := range level {
    go func(c [2]int) { process(c) }(cell)
}
```

**4. Using Dijkstra's algorithm without container/heap**

Go has no built-in priority queue. You must implement `heap.Interface` (Len, Less, Swap, Push, Pop) and use `heap.Push`/`heap.Pop` from `container/heap`. Never call Push or Pop directly on the struct: always use the package-level functions.

**5. Nil map write panic**

```go
var adj map[int][]int
adj[0] = append(adj[0], 1) // panic: assignment to entry in nil map

// Correct
adj := make(map[int][]int)
adj[0] = append(adj[0], 1) // safe
```

**6. Type assertion on heap.Pop**

`heap.Pop` returns `any`. Always assert the concrete type:
```go
curr := heap.Pop(pq).([]int) // correct
```
A missing assertion compiles but panics at runtime."""

# ── Section 21 updated content ────────────────────────────────────────────────
SEC21_SUFFIX = """

### Handling the Go Graph Gap

Go has no built-in queue, deque, or priority queue. Say this in an interview:

> "In Go I'll use a slice as a queue: `queue = queue[1:]` to dequeue.
> For Dijkstra I need `container/heap`, which requires implementing the
> five-method `heap.Interface`. Let me define the type first."

Then write the five methods (Len, Less, Swap, Push, Pop) before your algorithm.

## Go Graph Templates

**DFS on Graph:**
```go
func dfs(graph [][]int, node int, visited []bool) {
    visited[node] = true
    for _, neighbor := range graph[node] {
        if !visited[neighbor] {
            dfs(graph, neighbor, visited)
        }
    }
}
```

**BFS on Graph:**
```go
func bfs(graph [][]int, start int) {
    visited := make([]bool, len(graph))
    queue := []int{start}
    visited[start] = true

    for len(queue) > 0 {
        node := queue[0]
        queue = queue[1:]
        for _, neighbor := range graph[node] {
            if !visited[neighbor] {
                visited[neighbor] = true
                queue = append(queue, neighbor)
            }
        }
    }
}
```

**BFS Shortest Path:**
```go
// queue stores [node, dist]
queue := [][2]int{{start, 0}}
for len(queue) > 0 {
    node, dist := queue[0][0], queue[0][1]
    queue = queue[1:]
    if node == dest { return dist }
    for _, nb := range graph[node] {
        if !visited[nb] {
            visited[nb] = true
            queue = append(queue, [2]int{nb, dist + 1})
        }
    }
}
```

**Grid BFS (4-directional):**
```go
dirs := [][2]int{{0, 1}, {0, -1}, {1, 0}, {-1, 0}}
for len(queue) > 0 {
    cell := queue[0]; queue = queue[1:]
    r, c := cell[0], cell[1]
    for _, d := range dirs {
        nr, nc := r+d[0], c+d[1]
        if nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited[nr][nc] {
            visited[nr][nc] = true
            queue = append(queue, [2]int{nr, nc})
        }
    }
}
```

**Topological Sort (Kahn's):**
```go
var queue []int
for i := 0; i < n; i++ {
    if indegree[i] == 0 { queue = append(queue, i) }
}
for len(queue) > 0 {
    node := queue[0]; queue = queue[1:]
    order = append(order, node)
    for _, nb := range graph[node] {
        indegree[nb]--
        if indegree[nb] == 0 { queue = append(queue, nb) }
    }
}
```

**Dijkstra with container/heap:**
```go
type minH [][]int
func (h minH) Len() int            { return len(h) }
func (h minH) Less(i, j int) bool  { return h[i][0] < h[j][0] }
func (h minH) Swap(i, j int)       { h[i], h[j] = h[j], h[i] }
func (h *minH) Push(x any)         { *h = append(*h, x.([]int)) }
func (h *minH) Pop() any {
    old := *h; n := len(old); x := old[n-1]; *h = old[:n-1]; return x
}

pq := &minH{{0, start}}
heap.Init(pq)
for pq.Len() > 0 {
    curr := heap.Pop(pq).([]int)
    d, u := curr[0], curr[1]
    if d > dist[u] { continue }
    for _, e := range adj[u] {
        if dist[u]+e[1] < dist[e[0]] {
            dist[e[0]] = dist[u] + e[1]
            heap.Push(pq, []int{dist[e[0]], e[0]})
        }
    }
}
```

**Union-Find:**
```go
parent := make([]int, n)
for i := range parent { parent[i] = i }

var find func(x int) int
find = func(x int) int {
    if parent[x] != x { parent[x] = find(parent[x]) }
    return parent[x]
}
union := func(x, y int) bool {
    px, py := find(x), find(y)
    if px == py { return false }
    parent[px] = py
    return true
}
```"""


def patch():
    with open("frontend/src/lib/patterns.json", encoding="utf-8") as f:
        data = json.load(f)

    pattern = next(x for x in data if x["id"] == "graphs")
    t = pattern["tutorial"]

    # Sections 3-18: inject Go code
    t[3]["code"]["go"] = GO_SEC3
    t[4]["code"]["go"] = GO_SEC4
    t[5]["code"]["go"] = GO_SEC5
    t[6]["code"]["go"] = GO_SEC6
    t[7]["code"]["go"] = GO_SEC7
    t[8]["code"]["go"] = GO_SEC8
    t[9]["code"]["go"] = GO_SEC9
    t[10]["code"]["go"] = GO_SEC10
    t[11]["code"]["go"] = GO_SEC11
    t[12]["code"]["go"] = GO_SEC12
    t[13]["code"]["go"] = GO_SEC13
    t[14]["code"]["go"] = GO_SEC14
    t[15]["code"]["go"] = GO_SEC15
    t[16]["code"]["go"] = GO_SEC16
    t[17]["code"]["go"] = GO_SEC17
    t[18]["code"]["go"] = GO_SEC18

    # Section 19: replace Java code with pseudocode + append Go-specific mistakes
    t[19]["content"] = SEC19_CONTENT

    # Section 21: append Go templates (idempotent)
    if "Go Graph Templates" not in t[21]["content"]:
        t[21]["content"] = t[21]["content"] + SEC21_SUFFIX

    # codeTemplates
    pattern["codeTemplates"]["go"] = GO_TEMPLATE

    # Variations 0-8
    pattern["variations"][0]["template"]["go"] = GO_VAR0
    pattern["variations"][1]["template"]["go"] = GO_VAR1
    pattern["variations"][2]["template"]["go"] = GO_VAR2
    pattern["variations"][3]["template"]["go"] = GO_VAR3
    pattern["variations"][4]["template"]["go"] = GO_VAR4
    pattern["variations"][5]["template"]["go"] = GO_VAR5
    pattern["variations"][6]["template"]["go"] = GO_VAR6
    pattern["variations"][7]["template"]["go"] = GO_VAR7
    pattern["variations"][8]["template"]["go"] = GO_VAR8

    # keyInsights: add Go-specific insight (idempotent)
    go_insight = (
        "Go graph tip: use [][]int slices as adjacency lists; "
        "slice queues for BFS; container/heap for Dijkstra"
    )
    if not any("Go graph tip" in str(k) for k in pattern["keyInsights"]):
        pattern["keyInsights"].append(go_insight)

    # commonMistakes: add Go-specific entry (idempotent)
    go_mistake = (
        "Go: slice queue (queue[1:]) is O(n) dequeue and leaks memory "
        "for large graphs; use an index or container/list for production code"
    )
    if not any("Go: slice queue" in str(m) for m in pattern["commonMistakes"]):
        pattern["commonMistakes"].append(go_mistake)

    with open("frontend/src/lib/patterns.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print("Patch applied. Running verification...")

    # Reload and verify
    with open("frontend/src/lib/patterns.json", encoding="utf-8") as f:
        data2 = json.load(f)

    pattern2 = next(x for x in data2 if x["id"] == "graphs")
    t2 = pattern2["tutorial"]
    v2 = pattern2["variations"]

    checks = []

    # Check all 16 code sections have go
    for i in range(3, 19):
        sec = t2[i]
        has_go = "go" in sec.get("code", {})
        checks.append((f"section {i} has go key", has_go))

    # Check codeTemplates
    checks.append(("codeTemplates.go exists", "go" in pattern2["codeTemplates"]))

    # Check all 9 variations
    for i in range(9):
        has_go = "go" in v2[i].get("template", {})
        checks.append((f"variation {i} has go", has_go))

    # Check section 19 content updated (no java code blocks)
    sec19 = t2[19]["content"]
    checks.append(("section 19 no java code block", "```java" not in sec19))
    checks.append(("section 19 has Go-specific mistakes", "Go-Specific Mistakes" in sec19))

    # Check section 21 has Go templates
    sec21 = t2[21]["content"]
    checks.append(("section 21 has Go templates", "Go Graph Templates" in sec21))
    checks.append(("section 21 has Go heap interface", "Handling the Go Graph Gap" in sec21))

    # Check keyInsights updated
    ki = pattern2["keyInsights"]
    checks.append(("keyInsights has Go entry", any("Go" in str(k) for k in ki)))

    # Check commonMistakes updated
    cm = pattern2["commonMistakes"]
    checks.append(("commonMistakes has Go entry", any("Go" in str(m) for m in cm)))

    # Check Go code quality
    sec12_go = t2[12]["code"]["go"]
    checks.append(("section 12 uses container/heap", "container/heap" in sec12_go))
    checks.append(("section 12 uses heap.Push", "heap.Push" in sec12_go))
    checks.append(("section 12 uses heap.Pop", "heap.Pop" in sec12_go))

    sec15_go = t2[15]["code"]["go"]
    checks.append(("section 15 UnionFind struct", "UnionFind" in sec15_go))
    checks.append(("section 15 path compression", "uf.find(uf.parent[x])" in sec15_go))

    sec18_go = t2[18]["code"]["go"]
    checks.append(("section 18 sort.Slice", "sort.Slice" in sec18_go))
    checks.append(("section 18 findRoot", "findRoot" in sec18_go))

    sec16_go = t2[16]["code"]["go"]
    checks.append(("section 16 3-color DFS", "color[node] = 1" in sec16_go and "color[node] = 2" in sec16_go))

    var3_go = v2[3]["template"]["go"]
    checks.append(("variation 3 dijkHeap defined", "dijkHeap" in var3_go))
    checks.append(("variation 3 heap.Init", "heap.Init" in var3_go))

    passed = sum(1 for _, ok in checks if ok)
    total = len(checks)
    print(f"\nResults: {passed}/{total} checks passed\n")

    for name, ok in checks:
        status = "PASS" if ok else "FAIL"
        print(f"  [{status}] {name}")

    if passed < total:
        print(f"\n{total - passed} check(s) FAILED")
    else:
        print("\nAll checks passed!")


if __name__ == "__main__":
    patch()
