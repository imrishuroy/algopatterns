"use client";

import CodeBlock from "@/components/ui/CodeBlock";

export default function DataStructuresSection() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-3xl font-bold text-white mb-6">
        Recursion with Data Structures
      </h1>

      <p className="text-lg text-gray-300 leading-relaxed mb-8">
        Data structures like linked lists, trees, and graphs are inherently
        recursive. A linked list is either empty or a node followed by another
        linked list. A tree is either empty or a node with subtrees as children.
      </p>

      <h2 className="text-2xl font-bold text-white mb-4">
        Linked List Operations
      </h2>

      <h3 className="text-xl font-semibold text-gray-300 mb-3 mt-6">
        Print List in Reverse
      </h3>
      <CodeBlock
        code={`class ListNode {
    int val;
    ListNode next;
    ListNode(int val) { this.val = val; }
}

public void printReverse(ListNode head) {
    if (head == null) return;
    printReverse(head.next);  // Recurse first
    System.out.println(head.val);  // Then print
}

// List: 1 -> 2 -> 3 -> 4
// Output: 4, 3, 2, 1`}
        language="java"
      />

      <h3 className="text-xl font-semibold text-gray-300 mb-3 mt-6">
        Sum of List Values
      </h3>
      <CodeBlock
        code={`public int sumList(ListNode head) {
    if (head == null) return 0;
    return head.val + sumList(head.next);
}`}
        language="java"
      />

      <h3 className="text-xl font-semibold text-gray-300 mb-3 mt-6">
        Search in List
      </h3>
      <CodeBlock
        code={`public boolean search(ListNode head, int target) {
    if (head == null) return false;
    if (head.val == target) return true;
    return search(head.next, target);
}`}
        language="java"
      />

      <h3 className="text-xl font-semibold text-gray-300 mb-3 mt-6">
        Reverse Linked List
      </h3>
      <CodeBlock
        code={`public ListNode reverse(ListNode head) {
    if (head == null || head.next == null) {
        return head;
    }

    ListNode newHead = reverse(head.next);
    head.next.next = head;
    head.next = null;

    return newHead;
}`}
        language="java"
      />

      <h2 className="text-2xl font-bold text-white mb-4 mt-10">
        Binary Search Tree Operations
      </h2>

      <h3 className="text-xl font-semibold text-gray-300 mb-3 mt-6">
        Insert Value
      </h3>
      <CodeBlock
        code={`class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode(int val) { this.val = val; }
}

public TreeNode insert(TreeNode root, int val) {
    if (root == null) return new TreeNode(val);

    if (val < root.val) {
        root.left = insert(root.left, val);
    } else {
        root.right = insert(root.right, val);
    }
    return root;
}`}
        language="java"
      />

      <h3 className="text-xl font-semibold text-gray-300 mb-3 mt-6">
        Tree Traversals
      </h3>
      <CodeBlock
        code={`// Inorder: Left, Root, Right (sorted order for BST)
public void inorder(TreeNode root) {
    if (root == null) return;
    inorder(root.left);
    System.out.println(root.val);
    inorder(root.right);
}

// Preorder: Root, Left, Right
public void preorder(TreeNode root) {
    if (root == null) return;
    System.out.println(root.val);
    preorder(root.left);
    preorder(root.right);
}

// Postorder: Left, Right, Root
public void postorder(TreeNode root) {
    if (root == null) return;
    postorder(root.left);
    postorder(root.right);
    System.out.println(root.val);
}`}
        language="java"
      />

      <h3 className="text-xl font-semibold text-gray-300 mb-3 mt-6">
        Search in BST
      </h3>
      <CodeBlock
        code={`public boolean search(TreeNode root, int target) {
    if (root == null) return false;
    if (root.val == target) return true;

    if (target < root.val) {
        return search(root.left, target);
    }
    return search(root.right, target);
}

// Time: O(h) where h is height of tree`}
        language="java"
      />

      <h3 className="text-xl font-semibold text-gray-300 mb-3 mt-6">
        Tree Height
      </h3>
      <CodeBlock
        code={`public int height(TreeNode root) {
    if (root == null) return 0;
    int leftHeight = height(root.left);
    int rightHeight = height(root.right);
    return 1 + Math.max(leftHeight, rightHeight);
}`}
        language="java"
      />

      <h2 className="text-2xl font-bold text-white mb-4 mt-10">
        Graph Traversals
      </h2>

      <h3 className="text-xl font-semibold text-gray-300 mb-3 mt-6">
        Depth-First Search (DFS)
      </h3>
      <CodeBlock
        code={`public void dfs(Map<Integer, List<Integer>> graph,
                int node, Set<Integer> visited) {
    if (visited.contains(node)) return;

    visited.add(node);
    System.out.println("Visiting: " + node);

    for (int neighbor : graph.getOrDefault(node, List.of())) {
        dfs(graph, neighbor, visited);
    }
}`}
        language="java"
      />

      <h3 className="text-xl font-semibold text-gray-300 mb-3 mt-6">
        Topological Sort
      </h3>
      <CodeBlock
        code={`public void topologicalSort(Map<Integer, List<Integer>> graph,
                             int node,
                             Set<Integer> visited,
                             Stack<Integer> stack) {
    if (visited.contains(node)) return;
    visited.add(node);

    for (int neighbor : graph.getOrDefault(node, List.of())) {
        topologicalSort(graph, neighbor, visited, stack);
    }

    stack.push(node);  // Add after all descendants
}

// Pop stack for topological order`}
        language="java"
      />

      <h3 className="text-xl font-semibold text-gray-300 mb-3 mt-6">
        Detect Cycle in Graph
      </h3>
      <CodeBlock
        code={`public boolean hasCycle(Map<Integer, List<Integer>> graph,
                        int node,
                        Set<Integer> visited,
                        Set<Integer> inStack) {
    if (inStack.contains(node)) return true;  // Back edge found
    if (visited.contains(node)) return false;

    visited.add(node);
    inStack.add(node);

    for (int neighbor : graph.getOrDefault(node, List.of())) {
        if (hasCycle(graph, neighbor, visited, inStack)) {
            return true;
        }
    }

    inStack.remove(node);
    return false;
}`}
        language="java"
      />

      <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-md p-6 mt-8">
        <h4 className="text-lg font-semibold text-indigo-300 mb-3">
          Key Takeaways
        </h4>
        <ul className="text-gray-300 space-y-2">
          <li>Linked lists: Think of it as head + rest of list</li>
          <li>Trees: Process current node, then recurse on children</li>
          <li>Graphs: Track visited nodes to avoid infinite loops</li>
          <li>Most tree/graph problems have elegant recursive solutions</li>
        </ul>
      </div>
    </div>
  );
}
