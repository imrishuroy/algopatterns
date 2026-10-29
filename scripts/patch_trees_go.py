#!/usr/bin/env python3
"""Patches the trees pattern in patterns.json with Go language support."""
import json

# Section 5: The Three DFS Traversal Orders
GO_SEC_5 = """\
type TreeNode struct {
    Val   int
    Left  *TreeNode
    Right *TreeNode
}

// Preorder: Node → Left → Right
func preorder(node *TreeNode) {
    if node == nil {
        return
    }
    process(node)        // FIRST
    preorder(node.Left)
    preorder(node.Right)
}

// Inorder: Left → Node → Right
func inorder(node *TreeNode) {
    if node == nil {
        return
    }
    inorder(node.Left)
    process(node)        // MIDDLE
    inorder(node.Right)
}

// Postorder: Left → Right → Node
func postorder(node *TreeNode) {
    if node == nil {
        return
    }
    postorder(node.Left)
    postorder(node.Right)
    process(node)        // LAST
}\
"""

# Section 6: Preorder Traversal Deep Dive
GO_SEC_6 = """\
func preorderTraversal(root *TreeNode) []int {
    result := []int{}
    var preorder func(node *TreeNode)
    preorder = func(node *TreeNode) {
        if node == nil {
            return
        }
        result = append(result, node.Val) // Process FIRST
        preorder(node.Left)
        preorder(node.Right)
    }
    preorder(root)
    return result
}\
"""

# Section 7: Inorder Traversal Deep Dive (kth smallest BST)
GO_SEC_7 = """\
// Kth Smallest in BST
func kthSmallest(root *TreeNode, k int) int {
    count, result := 0, 0
    var inorder func(node *TreeNode)
    inorder = func(node *TreeNode) {
        if node == nil || count >= k {
            return
        }
        inorder(node.Left)    // Left first
        count++               // Count this node
        if count == k {
            result = node.Val // Found kth!
            return
        }
        inorder(node.Right)   // Then right
    }
    inorder(root)
    return result
}\
"""

# Section 9: Iterative DFS with Stack
GO_SEC_9 = """\
// Iterative Preorder - Push right first!
func preorderIterative(root *TreeNode) []int {
    result := []int{}
    if root == nil {
        return result
    }
    stack := []*TreeNode{root}
    for len(stack) > 0 {
        node := stack[len(stack)-1]
        stack = stack[:len(stack)-1]
        result = append(result, node.Val) // Process
        // Push right first so left pops first!
        if node.Right != nil {
            stack = append(stack, node.Right)
        }
        if node.Left != nil {
            stack = append(stack, node.Left)
        }
    }
    return result
}

// Iterative Inorder - Go left, then process, then right
func inorderIterative(root *TreeNode) []int {
    result := []int{}
    stack := []*TreeNode{}
    curr := root
    for curr != nil || len(stack) > 0 {
        // Go left as far as possible
        for curr != nil {
            stack = append(stack, curr)
            curr = curr.Left
        }
        curr = stack[len(stack)-1]
        stack = stack[:len(stack)-1]
        result = append(result, curr.Val) // Process
        curr = curr.Right                  // Move to right subtree
    }
    return result
}\
"""

# Section 10: BFS Level Order Traversal
GO_SEC_10 = """\
func levelOrder(root *TreeNode) [][]int {
    result := [][]int{}
    if root == nil {
        return result
    }
    queue := []*TreeNode{root}
    for len(queue) > 0 {
        levelSize := len(queue) // KEY: Save size!
        level := []int{}
        for i := 0; i < levelSize; i++ {
            node := queue[0]
            queue = queue[1:]
            level = append(level, node.Val)
            if node.Left != nil {
                queue = append(queue, node.Left)
            }
            if node.Right != nil {
                queue = append(queue, node.Right)
            }
        }
        result = append(result, level)
    }
    return result
}\
"""

# Section 11: Maximum Depth of Binary Tree
GO_SEC_11 = """\
// Recursive (Postorder)
func maxDepth(root *TreeNode) int {
    if root == nil {
        return 0
    }
    leftDepth := maxDepth(root.Left)
    rightDepth := maxDepth(root.Right)
    if leftDepth > rightDepth {
        return 1 + leftDepth
    }
    return 1 + rightDepth
}

// BFS - Count levels
func maxDepthBFS(root *TreeNode) int {
    if root == nil {
        return 0
    }
    queue := []*TreeNode{root}
    depth := 0
    for len(queue) > 0 {
        size := len(queue)
        depth++ // New level
        for i := 0; i < size; i++ {
            node := queue[0]
            queue = queue[1:]
            if node.Left != nil {
                queue = append(queue, node.Left)
            }
            if node.Right != nil {
                queue = append(queue, node.Right)
            }
        }
    }
    return depth
}\
"""

# Section 12: Diameter of Binary Tree
GO_SEC_12 = """\
func diameterOfBinaryTree(root *TreeNode) int {
    maxDiameter := 0
    var height func(node *TreeNode) int
    height = func(node *TreeNode) int {
        if node == nil {
            return 0
        }
        leftHeight := height(node.Left)
        rightHeight := height(node.Right)
        // Path through this node
        pathThroughNode := leftHeight + rightHeight
        if pathThroughNode > maxDiameter {
            maxDiameter = pathThroughNode
        }
        // Return height for parent's calculation
        if leftHeight > rightHeight {
            return 1 + leftHeight
        }
        return 1 + rightHeight
    }
    height(root)
    return maxDiameter
}\
"""

# Section 14: Validate Binary Search Tree
GO_SEC_14 = """\
func isValidBST(root *TreeNode) bool {
    return validate(root, -(1 << 62), 1<<62)
}

func validate(node *TreeNode, min, max int) bool {
    if node == nil {
        return true
    }
    // Check current node against bounds
    if node.Val <= min || node.Val >= max {
        return false
    }
    // Left subtree: values must be less than current
    // Right subtree: values must be greater than current
    return validate(node.Left, min, node.Val) &&
        validate(node.Right, node.Val, max)
}

// Alternative: Inorder should be sorted
func isValidBSTInorder(root *TreeNode) bool {
    stack := []*TreeNode{}
    curr := root
    prev := -(1 << 62) // sentinel: negative infinity
    for curr != nil || len(stack) > 0 {
        for curr != nil {
            stack = append(stack, curr)
            curr = curr.Left
        }
        curr = stack[len(stack)-1]
        stack = stack[:len(stack)-1]
        if curr.Val <= prev {
            return false // Not sorted!
        }
        prev = curr.Val
        curr = curr.Right
    }
    return true
}\
"""

# Section 15: Lowest Common Ancestor
GO_SEC_15 = """\
// LCA of Binary Tree (no BST property)
func lowestCommonAncestor(root, p, q *TreeNode) *TreeNode {
    // Base cases
    if root == nil || root == p || root == q {
        return root
    }
    // Search both subtrees
    left := lowestCommonAncestor(root.Left, p, q)
    right := lowestCommonAncestor(root.Right, p, q)
    // If both sides found something, root is LCA
    if left != nil && right != nil {
        return root
    }
    // Otherwise return whichever side found it
    if left != nil {
        return left
    }
    return right
}

// LCA of BST (use BST property - faster)
func lcaBST(root, p, q *TreeNode) *TreeNode {
    for root != nil {
        if p.Val < root.Val && q.Val < root.Val {
            root = root.Left   // Both in left
        } else if p.Val > root.Val && q.Val > root.Val {
            root = root.Right  // Both in right
        } else {
            return root        // Split point = LCA
        }
    }
    return nil
}\
"""

# Section 16: Path Sum Problems
GO_SEC_16 = """\
// Type 1: Root-to-Leaf Path Sum
func hasPathSum(root *TreeNode, targetSum int) bool {
    if root == nil {
        return false
    }
    // Leaf node - check if we've reached target
    if root.Left == nil && root.Right == nil {
        return targetSum == root.Val
    }
    // Continue with reduced target
    remaining := targetSum - root.Val
    return hasPathSum(root.Left, remaining) ||
        hasPathSum(root.Right, remaining)
}

// Type 2: Maximum Path Sum (any path)
func maxPathSum(root *TreeNode) int {
    maxSum := -(1 << 62)
    var maxGain func(node *TreeNode) int
    maxGain = func(node *TreeNode) int {
        if node == nil {
            return 0
        }
        // Max gain from left/right (ignore if negative)
        leftGain := maxGain(node.Left)
        if leftGain < 0 {
            leftGain = 0
        }
        rightGain := maxGain(node.Right)
        if rightGain < 0 {
            rightGain = 0
        }
        // Path through this node
        pathSum := node.Val + leftGain + rightGain
        if pathSum > maxSum {
            maxSum = pathSum
        }
        // Return max gain if continuing through this node
        if leftGain > rightGain {
            return node.Val + leftGain
        }
        return node.Val + rightGain
    }
    maxGain(root)
    return maxSum
}\
"""

# Section 17: Serialize and Deserialize Binary Tree
GO_SEC_17 = """\
import (
    "strconv"
    "strings"
)

// Serialize: Preorder with null markers
func serialize(root *TreeNode) string {
    var sb strings.Builder
    var helper func(node *TreeNode)
    helper = func(node *TreeNode) {
        if node == nil {
            sb.WriteString("null,")
            return
        }
        sb.WriteString(strconv.Itoa(node.Val))
        sb.WriteByte(',')
        helper(node.Left)
        helper(node.Right)
    }
    helper(root)
    return sb.String()
}

// Deserialize: Use index to process token stream
func deserialize(data string) *TreeNode {
    tokens := strings.Split(data, ",")
    idx := 0
    var helper func() *TreeNode
    helper = func() *TreeNode {
        if idx >= len(tokens) || tokens[idx] == "null" || tokens[idx] == "" {
            idx++
            return nil
        }
        val, _ := strconv.Atoi(tokens[idx])
        idx++
        node := &TreeNode{Val: val}
        node.Left = helper()
        node.Right = helper()
        return node
    }
    return helper()
}\
"""

# Section 18: Construct Tree from Traversals
GO_SEC_18 = """\
func buildTree(preorder []int, inorder []int) *TreeNode {
    inorderMap := make(map[int]int)
    for i, val := range inorder {
        inorderMap[val] = i
    }
    var build func(preStart, preEnd, inStart, inEnd int) *TreeNode
    build = func(preStart, preEnd, inStart, inEnd int) *TreeNode {
        if preStart > preEnd {
            return nil
        }
        // Root is first element of preorder
        rootVal := preorder[preStart]
        root := &TreeNode{Val: rootVal}
        // Find root in inorder to split left/right
        rootIndex := inorderMap[rootVal]
        leftSize := rootIndex - inStart
        // Build left subtree
        root.Left = build(preStart+1, preStart+leftSize, inStart, rootIndex-1)
        // Build right subtree
        root.Right = build(preStart+leftSize+1, preEnd, rootIndex+1, inEnd)
        return root
    }
    return build(0, len(preorder)-1, 0, len(inorder)-1)
}\
"""

# Section 19: Binary Tree Right Side View
GO_SEC_19 = """\
// BFS Approach
func rightSideView(root *TreeNode) []int {
    result := []int{}
    if root == nil {
        return result
    }
    queue := []*TreeNode{root}
    for len(queue) > 0 {
        size := len(queue)
        for i := 0; i < size; i++ {
            node := queue[0]
            queue = queue[1:]
            // Last node in level = visible from right
            if i == size-1 {
                result = append(result, node.Val)
            }
            if node.Left != nil {
                queue = append(queue, node.Left)
            }
            if node.Right != nil {
                queue = append(queue, node.Right)
            }
        }
    }
    return result
}

// DFS Approach (Right first)
func rightSideViewDFS(root *TreeNode) []int {
    result := []int{}
    var dfs func(node *TreeNode, depth int)
    dfs = func(node *TreeNode, depth int) {
        if node == nil {
            return
        }
        // First time visiting this depth
        if depth == len(result) {
            result = append(result, node.Val)
        }
        dfs(node.Right, depth+1) // Right first!
        dfs(node.Left, depth+1)
    }
    dfs(root, 0)
    return result
}\
"""

# codeTemplates.go
GO_CODE_TEMPLATE = """\
type TreeNode struct {
    Val   int
    Left  *TreeNode
    Right *TreeNode
}

// DFS Recursive Template
func dfs(node *TreeNode) int {
    if node == nil {
        return 0 // base case
    }
    // Preorder: process BEFORE children (e.g. path from root)
    left := dfs(node.Left)
    // Inorder: process BETWEEN children (BST sorted order)
    right := dfs(node.Right)
    // Postorder: process AFTER children (e.g. height, diameter)
    return combine(left, right, node.Val)
}

// BFS Level Order Traversal
func bfs(root *TreeNode) [][]int {
    result := [][]int{}
    if root == nil {
        return result
    }
    queue := []*TreeNode{root}
    for len(queue) > 0 {
        levelSize := len(queue)
        level := []int{}
        for i := 0; i < levelSize; i++ {
            node := queue[0]
            queue = queue[1:]
            level = append(level, node.Val)
            if node.Left != nil {
                queue = append(queue, node.Left)
            }
            if node.Right != nil {
                queue = append(queue, node.Right)
            }
        }
        result = append(result, level)
    }
    return result
}

// Validate BST - pass bounds down the tree
func isValidBST(node *TreeNode, min, max int) bool {
    if node == nil {
        return true
    }
    if node.Val <= min || node.Val >= max {
        return false
    }
    return isValidBST(node.Left, min, node.Val) &&
        isValidBST(node.Right, node.Val, max)
}\
"""

# variation[0]: DFS Preorder
GO_VAR_0 = """\
func preorder(root *TreeNode) []int {
    result := []int{}
    var helper func(node *TreeNode)
    helper = func(node *TreeNode) {
        if node == nil {
            return
        }
        result = append(result, node.Val) // Process first
        helper(node.Left)
        helper(node.Right)
    }
    helper(root)
    return result
}\
"""

# variation[1]: BST Inorder (kth smallest)
GO_VAR_1 = """\
func kthSmallest(root *TreeNode, k int) int {
    count, result := 0, 0
    var inorder func(node *TreeNode)
    inorder = func(node *TreeNode) {
        if node == nil || count >= k {
            return
        }
        inorder(node.Left)
        count++
        if count == k {
            result = node.Val
            return
        }
        inorder(node.Right)
    }
    inorder(root)
    return result
}\
"""

# variation[2]: Diameter
GO_VAR_2 = """\
func diameterOfBinaryTree(root *TreeNode) int {
    maxDiameter := 0
    var height func(node *TreeNode) int
    height = func(node *TreeNode) int {
        if node == nil {
            return 0
        }
        left := height(node.Left)
        right := height(node.Right)
        if left+right > maxDiameter {
            maxDiameter = left + right
        }
        if left > right {
            return 1 + left
        }
        return 1 + right
    }
    height(root)
    return maxDiameter
}\
"""

# variation[3]: BFS Level Order
GO_VAR_3 = """\
func levelOrder(root *TreeNode) [][]int {
    result := [][]int{}
    if root == nil {
        return result
    }
    queue := []*TreeNode{root}
    for len(queue) > 0 {
        size := len(queue)
        level := []int{}
        for i := 0; i < size; i++ {
            node := queue[0]
            queue = queue[1:]
            level = append(level, node.Val)
            if node.Left != nil {
                queue = append(queue, node.Left)
            }
            if node.Right != nil {
                queue = append(queue, node.Right)
            }
        }
        result = append(result, level)
    }
    return result
}\
"""

# variation[4]: Iterative DFS (Preorder, Inorder, Postorder)
GO_VAR_4 = """\
// Iterative Preorder - Push right first!
func preorderIterative(root *TreeNode) []int {
    result := []int{}
    if root == nil {
        return result
    }
    stack := []*TreeNode{root}
    for len(stack) > 0 {
        node := stack[len(stack)-1]
        stack = stack[:len(stack)-1]
        result = append(result, node.Val) // Process
        // Push right first so left is processed first
        if node.Right != nil {
            stack = append(stack, node.Right)
        }
        if node.Left != nil {
            stack = append(stack, node.Left)
        }
    }
    return result
}

// Iterative Inorder
func inorderIterative(root *TreeNode) []int {
    result := []int{}
    stack := []*TreeNode{}
    curr := root
    for curr != nil || len(stack) > 0 {
        // Go left as far as possible
        for curr != nil {
            stack = append(stack, curr)
            curr = curr.Left
        }
        curr = stack[len(stack)-1]
        stack = stack[:len(stack)-1]
        result = append(result, curr.Val) // Process
        curr = curr.Right                  // Move to right subtree
    }
    return result
}

// Iterative Postorder (reverse of modified preorder)
func postorderIterative(root *TreeNode) []int {
    if root == nil {
        return []int{}
    }
    result := []int{}
    stack := []*TreeNode{root}
    for len(stack) > 0 {
        node := stack[len(stack)-1]
        stack = stack[:len(stack)-1]
        result = append(result, node.Val)
        if node.Left != nil {
            stack = append(stack, node.Left)
        }
        if node.Right != nil {
            stack = append(stack, node.Right)
        }
    }
    // Reverse to get postorder
    for i, j := 0, len(result)-1; i < j; i, j = i+1, j-1 {
        result[i], result[j] = result[j], result[i]
    }
    return result
}\
"""

# variation[5]: LCA (Binary Tree + BST)
GO_VAR_5 = """\
// LCA of Binary Tree
func lowestCommonAncestor(root, p, q *TreeNode) *TreeNode {
    if root == nil || root == p || root == q {
        return root
    }
    left := lowestCommonAncestor(root.Left, p, q)
    right := lowestCommonAncestor(root.Right, p, q)
    if left != nil && right != nil {
        return root // p and q in different subtrees
    }
    if left != nil {
        return left
    }
    return right
}

// LCA of BST - Use BST property
func lcaBST(root, p, q *TreeNode) *TreeNode {
    for root != nil {
        if p.Val < root.Val && q.Val < root.Val {
            root = root.Left
        } else if p.Val > root.Val && q.Val > root.Val {
            root = root.Right
        } else {
            return root // Split point is LCA
        }
    }
    return nil
}\
"""

# Go-specific mistakes to append to section 20 content
GO_MISTAKES_BLOCK = """

## Go-Specific Mistakes

**1. Nil pointer on TreeNode fields**
Go struct fields are zero-initialized but pointer fields like `Left` and `Right` are `nil`, not absent. Always guard with `if node == nil` before accessing fields.

**2. Forgetting to declare the closure variable before assigning**
```go
// Bad - compile error: undefined var dfs
var dfs func(*TreeNode)
dfs = func(node *TreeNode) { dfs(node.Left) } // ok only if declared first

// Good
var dfs func(*TreeNode)
dfs = func(node *TreeNode) {
    if node == nil { return }
    dfs(node.Left)
}
```

**3. Slice-as-queue inefficiency**
`queue = queue[1:]` does not free the backing array. For very deep BFS, this leaks memory. For interviews this is fine; in production use `container/list` or a ring buffer.

**4. Shadowing the outer variable in closures**
Closures capture variables by reference. Reassigning a captured slice inside a closure (e.g., `result = append(result, ...)`) works correctly because the closure and the outer function share the same variable.

**5. Integer overflow in BST validation**
Java's `long` avoids `int` overflow. In Go, use wide sentinel values: `-(1 << 62)` and `1<<62` instead of `math.MinInt32`/`math.MaxInt32` when node values can be at the int32 boundary.\
"""

# Go templates to append to section 22 content
GO_TEMPLATES_BLOCK = """

### Handling the Go Tree Gap

Go has no built-in tree or queue type. Use slices as stacks and queues:
- **Stack**: `stack = append(stack, node)` to push, `stack[len(stack)-1]` to peek, `stack = stack[:len(stack)-1]` to pop
- **Queue**: `queue = append(queue, node)` to enqueue, `queue[0]` to peek, `queue = queue[1:]` to dequeue
- **Recursive closures**: declare the variable first (`var dfs func(*TreeNode)`), then assign, so the closure can call itself

In an interview, state this once at the start: "In Go I'll use a slice as a queue and declare recursive helpers as closures."

## Go Templates

**Template 1: DFS Recursive**
```go
func dfs(node *TreeNode) int {
    if node == nil {
        return 0 // BASE_CASE
    }
    left := dfs(node.Left)
    right := dfs(node.Right)
    return combine(left, right, node.Val)
}
```

**Template 2: DFS with closure (captures state)**
```go
globalMax := 0
var helper func(node *TreeNode) int
helper = func(node *TreeNode) int {
    if node == nil {
        return 0
    }
    left := helper(node.Left)
    right := helper(node.Right)
    if left+right > globalMax {
        globalMax = left + right
    }
    if left > right {
        return 1 + left
    }
    return 1 + right
}
helper(root)
```

**Template 3: BFS Level Order**
```go
queue := []*TreeNode{root}
for len(queue) > 0 {
    size := len(queue)
    for i := 0; i < size; i++ {
        node := queue[0]
        queue = queue[1:]
        // process node
        if node.Left != nil { queue = append(queue, node.Left) }
        if node.Right != nil { queue = append(queue, node.Right) }
    }
}
```

**Template 4: BST Validation**
```go
func validate(node *TreeNode, min, max int) bool {
    if node == nil { return true }
    if node.Val <= min || node.Val >= max { return false }
    return validate(node.Left, min, node.Val) &&
        validate(node.Right, node.Val, max)
}
// Call: validate(root, -(1<<62), 1<<62)
```

**Template 5: LCA**
```go
func lca(root, p, q *TreeNode) *TreeNode {
    if root == nil || root == p || root == q { return root }
    left := lca(root.Left, p, q)
    right := lca(root.Right, p, q)
    if left != nil && right != nil { return root }
    if left != nil { return left }
    return right
}
```\
"""

GO_COMMON_MISTAKE = "In Go, use slice literals as stacks/queues ([]*TreeNode{}), declare recursive closures with var before assigning, and use pointer equality (root == p) not value equality for tree node comparisons"


def patch():
    with open("frontend/src/lib/patterns.json", encoding="utf-8") as f:
        data = json.load(f)

    pattern = next(x for x in data if x["id"] == "trees")
    t = pattern["tutorial"]

    # Code sections
    t[5]["code"]["go"] = GO_SEC_5
    t[6]["code"]["go"] = GO_SEC_6
    t[7]["code"]["go"] = GO_SEC_7
    t[9]["code"]["go"] = GO_SEC_9
    t[10]["code"]["go"] = GO_SEC_10
    t[11]["code"]["go"] = GO_SEC_11
    t[12]["code"]["go"] = GO_SEC_12
    t[14]["code"]["go"] = GO_SEC_14
    t[15]["code"]["go"] = GO_SEC_15
    t[16]["code"]["go"] = GO_SEC_16
    t[17]["code"]["go"] = GO_SEC_17
    t[18]["code"]["go"] = GO_SEC_18
    t[19]["code"]["go"] = GO_SEC_19

    # codeTemplates
    pattern["codeTemplates"]["go"] = GO_CODE_TEMPLATE

    # variations
    variations = pattern["variations"]
    variations[0]["template"]["go"] = GO_VAR_0
    variations[1]["template"]["go"] = GO_VAR_1
    variations[2]["template"]["go"] = GO_VAR_2
    variations[3]["template"]["go"] = GO_VAR_3
    variations[4]["template"]["go"] = GO_VAR_4
    variations[5]["template"]["go"] = GO_VAR_5

    # Section 20: append Go-specific mistakes
    t[20]["content"] += GO_MISTAKES_BLOCK

    # Section 22: append Go templates
    t[22]["content"] += GO_TEMPLATES_BLOCK

    # commonMistakes: add Go-specific entry
    pattern["commonMistakes"].append(GO_COMMON_MISTAKE)

    # Write back
    with open("frontend/src/lib/patterns.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print("Patch applied. Running verification...")
    verify(data)


def verify(data):
    pattern = next(x for x in data if x["id"] == "trees")
    t = pattern["tutorial"]
    failures = []

    def check(label, condition):
        if not condition:
            failures.append(f"FAIL: {label}")
        else:
            print(f"  ok  {label}")

    # Code section checks
    for idx in [5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19]:
        check(f"section[{idx}] has go key", "go" in t[idx].get("code", {}))
        check(f"section[{idx}] go code non-empty", bool(t[idx]["code"]["go"]))

    # Check specific Go idioms
    check("sec5 uses *TreeNode", "*TreeNode" in t[5]["code"]["go"])
    check("sec5 uses node.Left/node.Right", "node.Left" in t[5]["code"]["go"])
    check("sec6 uses closure pattern", "var preorder func" in t[6]["code"]["go"])
    check("sec7 closure kth smallest", "var inorder func" in t[7]["code"]["go"])
    check("sec9 iterative stack slice", "stack[:len(stack)-1]" in t[9]["code"]["go"])
    check("sec10 queue slice", "queue[1:]" in t[10]["code"]["go"])
    check("sec11 no Math.max (Java)", "Math.max" not in t[11]["code"]["go"])
    check("sec12 closure captures maxDiameter", "maxDiameter" in t[12]["code"]["go"])
    check("sec14 no Long.MIN_VALUE", "Long.MIN_VALUE" not in t[14]["code"]["go"])
    check("sec14 uses sentinel bit shift", "1 << 62" in t[14]["code"]["go"])
    check("sec15 pointer equality root == p", "root == p" in t[15]["code"]["go"])
    check("sec16 leftGain < 0 check", "leftGain < 0" in t[16]["code"]["go"])
    check("sec17 strings.Builder", "strings.Builder" in t[17]["code"]["go"])
    check("sec17 strconv.Itoa", "strconv.Itoa" in t[17]["code"]["go"])
    check("sec18 inorderMap", "inorderMap" in t[18]["code"]["go"])
    check("sec19 BFS right side view", "i == size-1" in t[19]["code"]["go"])
    check("sec19 DFS right first", "Right, depth+1" in t[19]["code"]["go"])

    # codeTemplates
    ct = pattern["codeTemplates"]
    check("codeTemplates has go", "go" in ct)
    check("codeTemplates go non-empty", bool(ct["go"]))
    check("codeTemplates go has TreeNode struct", "type TreeNode struct" in ct["go"])
    check("codeTemplates go has BFS", "func bfs" in ct["go"])
    check("codeTemplates go has isValidBST", "func isValidBST" in ct["go"])

    # variations
    variations = pattern["variations"]
    for i in range(6):
        check(f"variation[{i}] has go template", "go" in variations[i].get("template", {}))
        check(f"variation[{i}] go template non-empty", bool(variations[i]["template"]["go"]))

    check("var0 closure pattern", "var helper func" in variations[0]["template"]["go"])
    check("var1 kthSmallest closure", "count, result" in variations[1]["template"]["go"])
    check("var2 diameterOfBinaryTree", "diameterOfBinaryTree" in variations[2]["template"]["go"])
    check("var3 levelOrder", "levelOrder" in variations[3]["template"]["go"])
    check("var4 postorder reverse", "i, j := 0, len(result)-1" in variations[4]["template"]["go"])
    check("var5 lca pointer equality", "root == p" in variations[5]["template"]["go"])

    # section 20 Go mistakes
    check("section[20] has Go-Specific Mistakes", "Go-Specific Mistakes" in t[20]["content"])
    check("section[20] mentions nil pointer", "Nil pointer" in t[20]["content"])

    # section 22 Go templates
    check("section[22] has Go Templates", "## Go Templates" in t[22]["content"])
    check("section[22] has Handling the Go Tree Gap", "Handling the Go Tree Gap" in t[22]["content"])
    check("section[22] has BFS template", "Template 3: BFS Level Order" in t[22]["content"])

    # commonMistakes
    cm = pattern["commonMistakes"]
    check("commonMistakes has Go entry", any("Go" in m for m in cm))

    print()
    if failures:
        for f in failures:
            print(f)
        raise SystemExit(f"{len(failures)} check(s) failed")
    else:
        print(f"All {48} checks passed.")


if __name__ == "__main__":
    patch()
