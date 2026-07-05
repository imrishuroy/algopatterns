import { Concept } from "@/types";

export const concepts: Concept[] = [
  {
    id: "priority-queue-heap",
    name: "Priority Queue & Heap",
    slug: "priority-queue-heap",
    category: "Data Structures",
    description:
      "A Priority Queue is an abstract data type where each element has a priority. Elements with higher priority are served before elements with lower priority. In Java, PriorityQueue implements a min-heap by default.",
    timeComplexity: "O(log n) insert/delete, O(1) peek",
    spaceComplexity: "O(n)",
    whenToUse: [
      "Finding K largest/smallest elements",
      "Merge K sorted lists/arrays",
      "Task scheduling by priority",
      "Dijkstra's shortest path algorithm",
      "Median finding with two heaps",
    ],
    codeSnippets: {
      java: `// Min Heap (default)
PriorityQueue<Integer> minHeap = new PriorityQueue<>();

// Max Heap
PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Collections.reverseOrder());
// or
PriorityQueue<Integer> maxHeap = new PriorityQueue<>((a, b) -> b - a);

// Custom object heap (sort by frequency)
PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[1] - b[1]);

// Common operations
pq.offer(element);   // Add element - O(log n)
pq.poll();           // Remove and return top - O(log n)
pq.peek();           // View top without removing - O(1)
pq.size();           // Get size - O(1)
pq.isEmpty();        // Check if empty - O(1)

// Example: Top K Frequent Elements
Map<Integer, Integer> freq = new HashMap<>();
for (int num : nums) {
    freq.put(num, freq.getOrDefault(num, 0) + 1);
}

// Min heap to keep top K frequent
PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> a[1] - b[1]);
for (Map.Entry<Integer, Integer> entry : freq.entrySet()) {
    heap.offer(new int[]{entry.getKey(), entry.getValue()});
    if (heap.size() > k) {
        heap.poll(); // Remove smallest frequency
    }
}`,
      python: `import heapq

# Min Heap (default in Python)
min_heap = []
heapq.heappush(min_heap, 5)
heapq.heappush(min_heap, 3)
smallest = heapq.heappop(min_heap)  # Returns 3

# Max Heap (negate values)
max_heap = []
heapq.heappush(max_heap, -5)
heapq.heappush(max_heap, -3)
largest = -heapq.heappop(max_heap)  # Returns 5

# Heapify existing list - O(n)
nums = [5, 3, 8, 1, 2]
heapq.heapify(nums)  # Converts to min heap in-place

# K largest elements
k_largest = heapq.nlargest(k, nums)

# K smallest elements
k_smallest = heapq.nsmallest(k, nums)

# Custom comparison with tuples (compares by first element)
pq = []
heapq.heappush(pq, (priority, item))

# Example: Top K Frequent Elements
from collections import Counter
freq = Counter(nums)
return heapq.nlargest(k, freq.keys(), key=freq.get)`,
      cpp: `#include <queue>
#include <vector>
#include <functional>

// Min Heap
std::priority_queue<int, std::vector<int>, std::greater<int>> minHeap;

// Max Heap (default)
std::priority_queue<int> maxHeap;

// Custom comparator
auto cmp = [](const std::pair<int,int>& a, const std::pair<int,int>& b) {
    return a.second > b.second; // Min heap by second element
};
std::priority_queue<std::pair<int,int>,
                    std::vector<std::pair<int,int>>,
                    decltype(cmp)> pq(cmp);

// Common operations
pq.push(element);    // Add element - O(log n)
pq.pop();            // Remove top - O(log n)
pq.top();            // View top - O(1)
pq.size();           // Get size - O(1)
pq.empty();          // Check if empty - O(1)

// Example: Top K Frequent Elements
std::unordered_map<int, int> freq;
for (int num : nums) freq[num]++;

auto cmp = [](auto& a, auto& b) { return a.second > b.second; };
std::priority_queue<std::pair<int,int>,
                    std::vector<std::pair<int,int>>,
                    decltype(cmp)> heap(cmp);

for (auto& [num, count] : freq) {
    heap.push({num, count});
    if (heap.size() > k) heap.pop();
}`,
      javascript: `// JavaScript doesn't have built-in PriorityQueue
// Use a simple implementation or library

class MinHeap {
  constructor() {
    this.heap = [];
  }

  push(val) {
    this.heap.push(val);
    this.bubbleUp(this.heap.length - 1);
  }

  pop() {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.bubbleDown(0);
    }
    return top;
  }

  peek() {
    return this.heap[0];
  }

  bubbleUp(idx) {
    while (idx > 0) {
      const parent = Math.floor((idx - 1) / 2);
      if (this.heap[parent] <= this.heap[idx]) break;
      [this.heap[parent], this.heap[idx]] = [this.heap[idx], this.heap[parent]];
      idx = parent;
    }
  }

  bubbleDown(idx) {
    const n = this.heap.length;
    while (true) {
      let smallest = idx;
      const left = 2 * idx + 1;
      const right = 2 * idx + 2;
      if (left < n && this.heap[left] < this.heap[smallest]) smallest = left;
      if (right < n && this.heap[right] < this.heap[smallest]) smallest = right;
      if (smallest === idx) break;
      [this.heap[smallest], this.heap[idx]] = [this.heap[idx], this.heap[smallest]];
      idx = smallest;
    }
  }
}

// Example: Top K Frequent - using sorting approach
function topKFrequent(nums, k) {
  const freq = new Map();
  for (const num of nums) {
    freq.set(num, (freq.get(num) || 0) + 1);
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, k)
    .map(([num]) => num);
}`,
    },
    keyPoints: [
      "Java PriorityQueue is a MIN heap by default",
      "Use Collections.reverseOrder() or custom comparator for MAX heap",
      "Time: offer/poll O(log n), peek O(1)",
      "For Top K problems: use min heap of size K (not max heap!)",
      "Python heapq only supports min heap - negate values for max heap",
    ],
    commonMistakes: [
      "Using max heap for Top K (should use min heap of size K)",
      "Forgetting that Java PriorityQueue is min heap by default",
      "Comparator overflow: use Integer.compare(a, b) instead of a - b",
      "In Python, forgetting to negate values when popping from 'max heap'",
    ],
    relatedProblems: [
      "Top K Frequent Elements",
      "Kth Largest Element",
      "Merge K Sorted Lists",
      "Find Median from Data Stream",
    ],
    relatedPatterns: ["heap"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "arraydeque-stack-queue",
    name: "ArrayDeque for Stack & Queue",
    slug: "arraydeque-stack-queue",
    category: "Data Structures",
    description:
      "ArrayDeque is Java's recommended implementation for both Stack and Queue operations. It's faster than Stack class and LinkedList for most use cases. It's a resizable array implementation of the Deque interface.",
    timeComplexity: "O(1) push/pop/peek",
    spaceComplexity: "O(n)",
    whenToUse: [
      "Stack operations (LIFO) - push, pop, peek",
      "Queue operations (FIFO) - offer, poll, peek",
      "When you need both stack and queue operations",
      "BFS traversal (as queue)",
      "Expression evaluation, parentheses matching (as stack)",
    ],
    codeSnippets: {
      java: `// As Stack (LIFO)
ArrayDeque<Integer> stack = new ArrayDeque<>();
stack.push(1);        // Add to front
stack.push(2);
int top = stack.pop();   // Remove from front - returns 2
int peek = stack.peek(); // View front without removing

// As Queue (FIFO)
ArrayDeque<Integer> queue = new ArrayDeque<>();
queue.offer(1);       // Add to back
queue.offer(2);
int front = queue.poll();  // Remove from front - returns 1
int peek = queue.peek();   // View front without removing

// Deque operations (both ends)
ArrayDeque<Integer> deque = new ArrayDeque<>();
deque.addFirst(1);    // Add to front
deque.addLast(2);     // Add to back
deque.removeFirst();  // Remove from front
deque.removeLast();   // Remove from back
deque.peekFirst();    // View front
deque.peekLast();     // View back

// Example: Valid Parentheses
public boolean isValid(String s) {
    ArrayDeque<Character> stack = new ArrayDeque<>();
    for (char c : s.toCharArray()) {
        if (c == '(') stack.push(')');
        else if (c == '{') stack.push('}');
        else if (c == '[') stack.push(']');
        else if (stack.isEmpty() || stack.pop() != c) {
            return false;
        }
    }
    return stack.isEmpty();
}

// Example: Evaluate Reverse Polish Notation
public int evalRPN(String[] tokens) {
    ArrayDeque<Integer> stack = new ArrayDeque<>();
    for (String token : tokens) {
        if (token.equals("+")) {
            int a = stack.pop(), b = stack.pop();
            stack.push(b + a);
        } else if (token.equals("-")) {
            int a = stack.pop(), b = stack.pop();
            stack.push(b - a);
        } else if (token.equals("*")) {
            int a = stack.pop(), b = stack.pop();
            stack.push(b * a);
        } else if (token.equals("/")) {
            int a = stack.pop(), b = stack.pop();
            stack.push(b / a);
        } else {
            stack.push(Integer.parseInt(token));
        }
    }
    return stack.peek();
}`,
      python: `from collections import deque

# As Stack (LIFO)
stack = []
stack.append(1)      # Push
stack.append(2)
top = stack.pop()    # Pop - returns 2
peek = stack[-1]     # Peek

# As Queue (FIFO) - use deque for O(1) operations
queue = deque()
queue.append(1)      # Add to back
queue.append(2)
front = queue.popleft()  # Remove from front - returns 1
peek = queue[0]      # Peek front

# Deque operations (both ends)
dq = deque()
dq.appendleft(1)     # Add to front
dq.append(2)         # Add to back
dq.popleft()         # Remove from front
dq.pop()             # Remove from back

# Example: Valid Parentheses
def isValid(s):
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    for c in s:
        if c in mapping:
            if not stack or stack.pop() != mapping[c]:
                return False
        else:
            stack.append(c)
    return not stack

# Example: Evaluate RPN
def evalRPN(tokens):
    stack = []
    for token in tokens:
        if token in '+-*/':
            b, a = stack.pop(), stack.pop()
            if token == '+': stack.append(a + b)
            elif token == '-': stack.append(a - b)
            elif token == '*': stack.append(a * b)
            else: stack.append(int(a / b))  # Truncate toward zero
        else:
            stack.append(int(token))
    return stack[0]`,
      cpp: `#include <deque>
#include <stack>
#include <queue>

// As Stack
std::stack<int> stack;
stack.push(1);
stack.push(2);
int top = stack.top();  // View top
stack.pop();            // Remove top (void)

// As Queue
std::queue<int> queue;
queue.push(1);
queue.push(2);
int front = queue.front();  // View front
queue.pop();                // Remove front (void)

// As Deque (both ends)
std::deque<int> dq;
dq.push_front(1);    // Add to front
dq.push_back(2);     // Add to back
dq.pop_front();      // Remove from front
dq.pop_back();       // Remove from back
dq.front();          // View front
dq.back();           // View back

// Example: Valid Parentheses
bool isValid(std::string s) {
    std::stack<char> stack;
    for (char c : s) {
        if (c == '(') stack.push(')');
        else if (c == '{') stack.push('}');
        else if (c == '[') stack.push(']');
        else if (stack.empty() || stack.top() != c) {
            return false;
        } else {
            stack.pop();
        }
    }
    return stack.empty();
}`,
      javascript: `// As Stack (LIFO) - use array
const stack = [];
stack.push(1);       // Add to end
stack.push(2);
const top = stack.pop();   // Remove from end - returns 2
const peek = stack[stack.length - 1];  // Peek

// As Queue (FIFO) - shift is O(n), consider custom implementation for performance
const queue = [];
queue.push(1);       // Add to end
queue.push(2);
const front = queue.shift();  // Remove from front - returns 1 (O(n)!)

// For O(1) queue operations, use custom implementation or linked list
class Queue {
  constructor() {
    this.items = {};
    this.head = 0;
    this.tail = 0;
  }
  enqueue(item) {
    this.items[this.tail++] = item;
  }
  dequeue() {
    if (this.head === this.tail) return undefined;
    const item = this.items[this.head];
    delete this.items[this.head++];
    return item;
  }
  peek() {
    return this.items[this.head];
  }
  get size() {
    return this.tail - this.head;
  }
}

// Example: Valid Parentheses
function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (const c of s) {
    if (c in map) {
      if (!stack.length || stack.pop() !== map[c]) return false;
    } else {
      stack.push(c);
    }
  }
  return stack.length === 0;
}`,
    },
    keyPoints: [
      "ArrayDeque is faster than Stack class and LinkedList",
      "Use push/pop/peek for stack operations",
      "Use offer/poll/peek for queue operations",
      "ArrayDeque doesn't allow null elements",
      "Not thread-safe - use ConcurrentLinkedDeque for concurrency",
    ],
    commonMistakes: [
      "Using Stack class instead of ArrayDeque (legacy, slower)",
      "Using LinkedList for queue when ArrayDeque is faster",
      "Forgetting order in arithmetic: b - a, not a - b (second popped is left operand)",
      "In JavaScript, using shift() for queue is O(n) - use custom implementation",
    ],
    relatedProblems: [
      "Valid Parentheses",
      "Evaluate Reverse Polish Notation",
      "Binary Tree Level Order Traversal",
      "Car Fleet",
    ],
    relatedPatterns: ["stack"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "hashmap-operations",
    name: "HashMap Operations & Methods",
    slug: "hashmap-operations",
    category: "Collections & Maps",
    description:
      "HashMap provides O(1) average time complexity for get, put, and containsKey operations. It's the most commonly used data structure in coding interviews for frequency counting, two-sum patterns, and grouping.",
    timeComplexity: "O(1) average get/put",
    spaceComplexity: "O(n)",
    whenToUse: [
      "Two Sum pattern - finding complement",
      "Frequency counting",
      "Grouping elements (anagrams, by property)",
      "Caching/memoization",
      "Tracking seen elements",
    ],
    codeSnippets: {
      java: `// Basic operations
Map<String, Integer> map = new HashMap<>();
map.put("key", 1);              // Add/update
int val = map.get("key");       // Get value (null if not exists)
int val = map.getOrDefault("key", 0);  // Get with default
boolean exists = map.containsKey("key");
map.remove("key");              // Remove

// Iteration
for (Map.Entry<String, Integer> entry : map.entrySet()) {
    String key = entry.getKey();
    int value = entry.getValue();
}

for (String key : map.keySet()) { }
for (int value : map.values()) { }

// Advanced methods
map.putIfAbsent("key", 1);      // Only put if key doesn't exist
map.computeIfAbsent("key", k -> new ArrayList<>());  // Compute if absent
map.merge("key", 1, Integer::sum);  // Merge with existing value

// Frequency counting pattern
Map<Integer, Integer> freq = new HashMap<>();
for (int num : nums) {
    freq.put(num, freq.getOrDefault(num, 0) + 1);
}
// Or using merge
for (int num : nums) {
    freq.merge(num, 1, Integer::sum);
}

// Two Sum pattern
Map<Integer, Integer> seen = new HashMap<>();
for (int i = 0; i < nums.length; i++) {
    int complement = target - nums[i];
    if (seen.containsKey(complement)) {
        return new int[]{seen.get(complement), i};
    }
    seen.put(nums[i], i);
}

// Group Anagrams pattern
Map<String, List<String>> groups = new HashMap<>();
for (String s : strs) {
    char[] chars = s.toCharArray();
    Arrays.sort(chars);
    String key = new String(chars);
    groups.computeIfAbsent(key, k -> new ArrayList<>()).add(s);
}
return new ArrayList<>(groups.values());`,
      python: `# Basic operations
d = {}
d = dict()
d["key"] = 1                    # Add/update
val = d["key"]                  # Get (KeyError if not exists)
val = d.get("key")              # Get (None if not exists)
val = d.get("key", 0)           # Get with default
exists = "key" in d             # Check existence
del d["key"]                    # Remove
val = d.pop("key", None)        # Remove and return

# Iteration
for key in d:                   # Keys
    pass
for key, value in d.items():    # Key-value pairs
    pass
for value in d.values():        # Values
    pass

# defaultdict - auto-initializes missing keys
from collections import defaultdict
freq = defaultdict(int)         # Default value 0
groups = defaultdict(list)      # Default empty list

# Counter - frequency counting
from collections import Counter
freq = Counter(nums)            # Count frequencies
freq.most_common(k)             # K most common

# Frequency counting pattern
freq = {}
for num in nums:
    freq[num] = freq.get(num, 0) + 1
# Or
freq = Counter(nums)

# Two Sum pattern
seen = {}
for i, num in enumerate(nums):
    complement = target - num
    if complement in seen:
        return [seen[complement], i]
    seen[num] = i

# Group Anagrams pattern
from collections import defaultdict
groups = defaultdict(list)
for s in strs:
    key = tuple(sorted(s))
    groups[key].append(s)
return list(groups.values())`,
      cpp: `#include <unordered_map>

// Basic operations
std::unordered_map<std::string, int> map;
map["key"] = 1;                 // Add/update
int val = map["key"];           // Get (creates if not exists!)
auto it = map.find("key");      // Find iterator
if (it != map.end()) {          // Check existence
    int val = it->second;
}
map.erase("key");               // Remove
map.count("key");               // 0 or 1

// Iteration
for (auto& [key, value] : map) {
    // Use key and value
}

// Frequency counting pattern
std::unordered_map<int, int> freq;
for (int num : nums) {
    freq[num]++;
}

// Two Sum pattern
std::unordered_map<int, int> seen;
for (int i = 0; i < nums.size(); i++) {
    int complement = target - nums[i];
    if (seen.count(complement)) {
        return {seen[complement], i};
    }
    seen[nums[i]] = i;
}

// Group Anagrams pattern
std::unordered_map<std::string, std::vector<std::string>> groups;
for (const auto& s : strs) {
    std::string key = s;
    std::sort(key.begin(), key.end());
    groups[key].push_back(s);
}`,
      javascript: `// Using Map (preferred)
const map = new Map();
map.set("key", 1);              // Add/update
const val = map.get("key");     // Get (undefined if not exists)
const exists = map.has("key");  // Check existence
map.delete("key");              // Remove
map.size;                       // Size

// Iteration
for (const [key, value] of map) { }
for (const key of map.keys()) { }
for (const value of map.values()) { }
map.forEach((value, key) => { });

// Using Object (simpler, string keys only)
const obj = {};
obj["key"] = 1;
const val = obj["key"];
const exists = "key" in obj;
delete obj["key"];

// Frequency counting pattern
const freq = new Map();
for (const num of nums) {
  freq.set(num, (freq.get(num) || 0) + 1);
}

// Two Sum pattern
const seen = new Map();
for (let i = 0; i < nums.length; i++) {
  const complement = target - nums[i];
  if (seen.has(complement)) {
    return [seen.get(complement), i];
  }
  seen.set(nums[i], i);
}

// Group Anagrams pattern
const groups = new Map();
for (const s of strs) {
  const key = s.split('').sort().join('');
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(s);
}
return [...groups.values()];`,
    },
    keyPoints: [
      "O(1) average time for get, put, containsKey",
      "getOrDefault() avoids null checks",
      "computeIfAbsent() is perfect for grouping patterns",
      "merge() is concise for frequency counting",
      "Convert Map values to List: new ArrayList<>(map.values())",
    ],
    commonMistakes: [
      "Using array as HashMap key (use Arrays.toString() or String)",
      "Forgetting that get() returns null for missing keys",
      "In C++, operator[] creates entry if key doesn't exist",
      "Modifying map while iterating (use Iterator.remove() or collect keys first)",
    ],
    relatedProblems: [
      "Two Sum",
      "Group Anagrams",
      "Top K Frequent Elements",
      "Subarray Sum Equals K",
    ],
    relatedPatterns: ["arrays-strings", "hash-map"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "frequency-counter-array",
    name: "Frequency Counter with Array",
    slug: "frequency-counter-array",
    category: "String & Character",
    description:
      "Using a fixed-size array as a frequency counter is more efficient than HashMap for limited character sets. Use int[26] for lowercase letters, int[52] for both cases, or int[256] for ASCII characters.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(k) where k = range",
    whenToUse: [
      "Counting character frequencies in strings",
      "Anagram checking and grouping",
      "Sliding window with character frequency",
      "Permutation checking",
      "When character set is limited (a-z, A-Z, ASCII)",
    ],
    codeSnippets: {
      java: `// Lowercase letters only (a-z)
int[] freq = new int[26];
for (char c : str.toCharArray()) {
    freq[c - 'a']++;
}

// Uppercase letters only (A-Z)
int[] freq = new int[26];
for (char c : str.toCharArray()) {
    freq[c - 'A']++;
}

// Both cases (a-z and A-Z)
int[] freq = new int[52];
for (char c : str.toCharArray()) {
    if (c >= 'a') freq[c - 'a']++;
    else freq[c - 'A' + 26]++;
}

// All ASCII characters
int[] freq = new int[256];
for (char c : str.toCharArray()) {
    freq[c]++;
}

// Check if two strings are anagrams
public boolean isAnagram(String s, String t) {
    if (s.length() != t.length()) return false;

    int[] count = new int[26];
    for (int i = 0; i < s.length(); i++) {
        count[s.charAt(i) - 'a']++;
        count[t.charAt(i) - 'a']--;
    }

    for (int c : count) {
        if (c != 0) return false;
    }
    return true;
}

// Group Anagrams using frequency as key
public List<List<String>> groupAnagrams(String[] strs) {
    Map<String, List<String>> map = new HashMap<>();

    for (String str : strs) {
        int[] freq = new int[26];
        for (char c : str.toCharArray()) {
            freq[c - 'a']++;
        }

        // Build key from frequency array
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 26; i++) {
            sb.append(freq[i]).append("#");
        }
        String key = sb.toString();

        map.computeIfAbsent(key, k -> new ArrayList<>()).add(str);
    }

    return new ArrayList<>(map.values());
}

// Check permutation in string (sliding window)
public boolean checkInclusion(String s1, String s2) {
    if (s1.length() > s2.length()) return false;

    int[] s1Freq = new int[26];
    int[] s2Freq = new int[26];

    for (char c : s1.toCharArray()) {
        s1Freq[c - 'a']++;
    }

    for (int i = 0; i < s2.length(); i++) {
        s2Freq[s2.charAt(i) - 'a']++;

        // Remove leftmost character when window exceeds s1 length
        if (i >= s1.length()) {
            s2Freq[s2.charAt(i - s1.length()) - 'a']--;
        }

        if (Arrays.equals(s1Freq, s2Freq)) {
            return true;
        }
    }
    return false;
}`,
      python: `# Using list for frequency
freq = [0] * 26
for c in s:
    freq[ord(c) - ord('a')] += 1

# Using Counter (more Pythonic)
from collections import Counter
freq = Counter(s)

# Check anagrams
def is_anagram(s, t):
    return Counter(s) == Counter(t)

# Or with array
def is_anagram(s, t):
    if len(s) != len(t):
        return False
    count = [0] * 26
    for i in range(len(s)):
        count[ord(s[i]) - ord('a')] += 1
        count[ord(t[i]) - ord('a')] -= 1
    return all(c == 0 for c in count)

# Group Anagrams using tuple of frequency
def groupAnagrams(strs):
    groups = defaultdict(list)
    for s in strs:
        freq = [0] * 26
        for c in s:
            freq[ord(c) - ord('a')] += 1
        groups[tuple(freq)].append(s)
    return list(groups.values())

# Check permutation in string
def checkInclusion(s1, s2):
    if len(s1) > len(s2):
        return False

    s1_count = Counter(s1)
    window = Counter(s2[:len(s1)])

    if s1_count == window:
        return True

    for i in range(len(s1), len(s2)):
        window[s2[i]] += 1
        left = s2[i - len(s1)]
        window[left] -= 1
        if window[left] == 0:
            del window[left]
        if s1_count == window:
            return True

    return False`,
      cpp: `#include <array>
#include <string>
#include <vector>

// Using array for frequency
std::array<int, 26> freq{};  // Zero-initialized
for (char c : str) {
    freq[c - 'a']++;
}

// Check anagrams
bool isAnagram(std::string s, std::string t) {
    if (s.length() != t.length()) return false;

    std::array<int, 26> count{};
    for (size_t i = 0; i < s.length(); i++) {
        count[s[i] - 'a']++;
        count[t[i] - 'a']--;
    }

    for (int c : count) {
        if (c != 0) return false;
    }
    return true;
}

// Check permutation in string
bool checkInclusion(std::string s1, std::string s2) {
    if (s1.length() > s2.length()) return false;

    std::array<int, 26> s1Freq{}, s2Freq{};
    for (char c : s1) s1Freq[c - 'a']++;

    for (size_t i = 0; i < s2.length(); i++) {
        s2Freq[s2[i] - 'a']++;
        if (i >= s1.length()) {
            s2Freq[s2[i - s1.length()] - 'a']--;
        }
        if (s1Freq == s2Freq) return true;
    }
    return false;
}`,
      javascript: `// Using array for frequency
const freq = new Array(26).fill(0);
for (const c of str) {
  freq[c.charCodeAt(0) - 97]++; // 97 = 'a'.charCodeAt(0)
}

// Check anagrams
function isAnagram(s, t) {
  if (s.length !== t.length) return false;

  const count = new Array(26).fill(0);
  for (let i = 0; i < s.length; i++) {
    count[s.charCodeAt(i) - 97]++;
    count[t.charCodeAt(i) - 97]--;
  }

  return count.every(c => c === 0);
}

// Group Anagrams using frequency key
function groupAnagrams(strs) {
  const groups = new Map();

  for (const str of strs) {
    const freq = new Array(26).fill(0);
    for (const c of str) {
      freq[c.charCodeAt(0) - 97]++;
    }
    const key = freq.join('#');

    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(str);
  }

  return [...groups.values()];
}

// Check permutation in string
function checkInclusion(s1, s2) {
  if (s1.length > s2.length) return false;

  const s1Freq = new Array(26).fill(0);
  const s2Freq = new Array(26).fill(0);

  for (const c of s1) {
    s1Freq[c.charCodeAt(0) - 97]++;
  }

  for (let i = 0; i < s2.length; i++) {
    s2Freq[s2.charCodeAt(i) - 97]++;

    if (i >= s1.length) {
      s2Freq[s2.charCodeAt(i - s1.length) - 97]--;
    }

    if (s1Freq.every((v, j) => v === s2Freq[j])) {
      return true;
    }
  }
  return false;
}`,
    },
    keyPoints: [
      "'a' to 'z' maps to indices 0-25 using ch - 'a'",
      "'A' to 'Z' maps to indices 0-25 using ch - 'A'",
      "Arrays.equals() compares two arrays element by element",
      "Array is faster than HashMap for fixed character set",
      "Use int[256] for all ASCII characters",
    ],
    commonMistakes: [
      "Forgetting to handle uppercase vs lowercase",
      "Array index out of bounds when character is not in expected range",
      "Using == instead of Arrays.equals() to compare arrays",
      "Forgetting that charCodeAt returns number in JavaScript",
    ],
    relatedProblems: [
      "Valid Anagram",
      "Group Anagrams",
      "Permutation in String",
      "Find All Anagrams in a String",
    ],
    relatedPatterns: ["sliding-window", "arrays-strings"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "character-methods",
    name: "Character Class Methods",
    slug: "character-methods",
    category: "String & Character",
    description:
      "Java's Character class provides utility methods for checking and converting characters. These are essential for string manipulation problems involving alphanumeric characters, digits, and case conversion.",
    timeComplexity: "O(1)",
    spaceComplexity: "O(1)",
    whenToUse: [
      "Validating if character is letter or digit",
      "Converting between uppercase and lowercase",
      "Parsing numeric value from character",
      "Palindrome problems with alphanumeric filtering",
      "Expression parsing",
    ],
    codeSnippets: {
      java: `// Character type checking
Character.isLetter('a');        // true
Character.isDigit('5');         // true
Character.isLetterOrDigit('a'); // true
Character.isLetterOrDigit('5'); // true
Character.isLetterOrDigit('@'); // false
Character.isWhitespace(' ');    // true
Character.isUpperCase('A');     // true
Character.isLowerCase('a');     // true

// Case conversion
Character.toLowerCase('A');     // 'a'
Character.toUpperCase('a');     // 'A'

// Get numeric value
Character.getNumericValue('5'); // 5
Character.getNumericValue('a'); // 10 (hex)
Character.getNumericValue('f'); // 15 (hex)

// Char to int (digit only)
int digit = ch - '0';           // '5' - '0' = 5

// Example: Valid Palindrome (alphanumeric only)
public boolean isPalindrome(String s) {
    int left = 0, right = s.length() - 1;

    while (left < right) {
        // Skip non-alphanumeric from left
        while (left < right && !Character.isLetterOrDigit(s.charAt(left))) {
            left++;
        }
        // Skip non-alphanumeric from right
        while (left < right && !Character.isLetterOrDigit(s.charAt(right))) {
            right--;
        }

        // Compare (case-insensitive)
        if (Character.toLowerCase(s.charAt(left)) !=
            Character.toLowerCase(s.charAt(right))) {
            return false;
        }

        left++;
        right--;
    }
    return true;
}

// Example: String to Integer (atoi)
public int myAtoi(String s) {
    int i = 0, n = s.length();

    // Skip whitespace
    while (i < n && Character.isWhitespace(s.charAt(i))) {
        i++;
    }

    // Check sign
    int sign = 1;
    if (i < n && (s.charAt(i) == '+' || s.charAt(i) == '-')) {
        sign = s.charAt(i++) == '-' ? -1 : 1;
    }

    // Parse digits
    long result = 0;
    while (i < n && Character.isDigit(s.charAt(i))) {
        result = result * 10 + (s.charAt(i++) - '0');

        // Handle overflow
        if (result * sign > Integer.MAX_VALUE) return Integer.MAX_VALUE;
        if (result * sign < Integer.MIN_VALUE) return Integer.MIN_VALUE;
    }

    return (int) (result * sign);
}`,
      python: `# Character type checking
'a'.isalpha()           # True
'5'.isdigit()           # True
'a'.isalnum()           # True (letter or digit)
' '.isspace()           # True
'A'.isupper()           # True
'a'.islower()           # True

# Case conversion
'A'.lower()             # 'a'
'a'.upper()             # 'A'

# Char to int
int('5')                # 5
ord('a')                # 97 (ASCII value)
chr(97)                 # 'a'

# Example: Valid Palindrome
def isPalindrome(s):
    left, right = 0, len(s) - 1

    while left < right:
        while left < right and not s[left].isalnum():
            left += 1
        while left < right and not s[right].isalnum():
            right -= 1

        if s[left].lower() != s[right].lower():
            return False

        left += 1
        right -= 1

    return True

# One-liner (less efficient but Pythonic)
def isPalindrome(s):
    cleaned = ''.join(c.lower() for c in s if c.isalnum())
    return cleaned == cleaned[::-1]

# Example: String to Integer
def myAtoi(s):
    s = s.lstrip()
    if not s:
        return 0

    sign = 1
    i = 0
    if s[0] in ['+', '-']:
        sign = -1 if s[0] == '-' else 1
        i = 1

    result = 0
    while i < len(s) and s[i].isdigit():
        result = result * 10 + int(s[i])
        i += 1

    result *= sign
    return max(min(result, 2**31 - 1), -2**31)`,
      cpp: `#include <cctype>
#include <string>

// Character type checking
std::isalpha('a');      // true
std::isdigit('5');      // true
std::isalnum('a');      // true (letter or digit)
std::isspace(' ');      // true
std::isupper('A');      // true
std::islower('a');      // true

// Case conversion
std::tolower('A');      // 'a'
std::toupper('a');      // 'A'

// Char to int
int digit = ch - '0';   // '5' - '0' = 5

// Example: Valid Palindrome
bool isPalindrome(std::string s) {
    int left = 0, right = s.length() - 1;

    while (left < right) {
        while (left < right && !std::isalnum(s[left])) left++;
        while (left < right && !std::isalnum(s[right])) right--;

        if (std::tolower(s[left]) != std::tolower(s[right])) {
            return false;
        }
        left++;
        right--;
    }
    return true;
}`,
      javascript: `// Character type checking (using regex or manual)
const isLetter = c => /[a-zA-Z]/.test(c);
const isDigit = c => /[0-9]/.test(c);
const isAlphanumeric = c => /[a-zA-Z0-9]/.test(c);
const isWhitespace = c => /\\s/.test(c);

// Or using character codes
const isLetter = c => {
  const code = c.charCodeAt(0);
  return (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
};
const isDigit = c => c >= '0' && c <= '9';

// Case conversion
'A'.toLowerCase();      // 'a'
'a'.toUpperCase();      // 'A'

// Char to int
parseInt('5');          // 5
'5'.charCodeAt(0);      // 53 (ASCII)
String.fromCharCode(97);// 'a'

// Example: Valid Palindrome
function isPalindrome(s) {
  let left = 0, right = s.length - 1;

  while (left < right) {
    while (left < right && !/[a-zA-Z0-9]/.test(s[left])) left++;
    while (left < right && !/[a-zA-Z0-9]/.test(s[right])) right--;

    if (s[left].toLowerCase() !== s[right].toLowerCase()) {
      return false;
    }
    left++;
    right--;
  }
  return true;
}

// One-liner
const isPalindrome = s => {
  const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleaned === cleaned.split('').reverse().join('');
};`,
    },
    keyPoints: [
      "isLetterOrDigit() combines isLetter() and isDigit()",
      "toLowerCase()/toUpperCase() return the same char if not applicable",
      "getNumericValue() handles hex characters (a-f = 10-15)",
      "ch - '0' is faster than getNumericValue() for digit-only cases",
    ],
    commonMistakes: [
      "Forgetting to check for null/empty string before accessing characters",
      "Assuming isDigit() works on negative numbers (it doesn't)",
      "Not handling locale-specific characters with isLetter()",
      "Confusing getNumericValue() (handles hex) with ch - '0' (digits only)",
    ],
    relatedProblems: [
      "Valid Palindrome",
      "String to Integer (atoi)",
      "Reverse String",
      "Valid Number",
    ],
    relatedPatterns: ["two-pointers"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "integer-parseint-type-casting",
    name: "Integer.parseInt & Type Casting",
    slug: "integer-parseint-type-casting",
    category: "Type Conversions & Math",
    description:
      "Converting between strings and numbers, and handling type casting for division operations are common operations in coding problems. Understanding implicit widening and explicit casting is essential for correct calculations.",
    timeComplexity: "O(d) where d = digits",
    spaceComplexity: "O(1)",
    whenToUse: [
      "Parsing numbers from strings (expression evaluation)",
      "Floating-point division instead of integer division",
      "Handling large numbers to avoid overflow",
      "Converting results back to required types",
    ],
    codeSnippets: {
      java: `// String to int/long
int num = Integer.parseInt("123");
long bigNum = Long.parseLong("123456789");

// int to String
String s = String.valueOf(123);
String s = Integer.toString(123);
String s = "" + 123;  // Concat (less efficient)

// Integer division (truncates toward zero)
int a = 5, b = 2;
System.out.println(a / b);        // 2 (integer division)

// Floating-point division (explicit cast)
double result = (double) a / b;   // 2.5
// Note: Cast BEFORE division, not after!
double wrong = (double)(a / b);   // 2.0 (too late!)

// Alternative: multiply by 1.0
double result = a * 1.0 / b;      // 2.5

// Ceiling division formula (without using Math.ceil)
// ceil(a / b) = (a + b - 1) / b
int ceiling = (a + b - 1) / b;

// Example: Koko Eating Bananas
public int minEatingSpeed(int[] piles, int h) {
    int left = 1, right = getMax(piles);

    while (left < right) {
        int mid = left + (right - left) / 2;
        if (canFinish(piles, mid, h)) {
            right = mid;
        } else {
            left = mid + 1;
        }
    }
    return left;
}

private boolean canFinish(int[] piles, int speed, int h) {
    int hours = 0;
    for (int pile : piles) {
        // Ceiling division: how many hours to eat this pile
        hours += (pile + speed - 1) / speed;
    }
    return hours <= h;
}

// Long to int (be careful of overflow!)
long bigValue = 123456789L;
int intValue = (int) bigValue;  // May overflow!

// Safe conversion with bounds check
int safeValue = (int) Math.min(bigValue, Integer.MAX_VALUE);

// Integer overflow prevention
int a = 1000000, b = 1000000;
int overflow = a * b;           // OVERFLOW!
long safe = (long) a * b;       // Cast BEFORE multiply

// Example: Car Fleet (using double for time calculation)
public int carFleet(int target, int[] position, int[] speed) {
    int n = position.length;
    double[][] cars = new double[n][2];

    for (int i = 0; i < n; i++) {
        cars[i][0] = position[i];
        // Cast to double for precise division
        cars[i][1] = (double)(target - position[i]) / speed[i];
    }

    Arrays.sort(cars, (a, b) -> Double.compare(b[0], a[0]));

    int fleets = 0;
    double maxTime = 0;
    for (double[] car : cars) {
        if (car[1] > maxTime) {
            fleets++;
            maxTime = car[1];
        }
    }
    return fleets;
}`,
      python: `# String to int/float
num = int("123")
decimal = float("123.45")

# int to String
s = str(123)

# Python division
a, b = 5, 2
print(a / b)          # 2.5 (float division)
print(a // b)         # 2 (integer division, floor)

# Ceiling division
import math
ceiling = math.ceil(a / b)
# Or without import
ceiling = (a + b - 1) // b
# Or
ceiling = -(-a // b)

# Example: Koko Eating Bananas
def minEatingSpeed(piles, h):
    left, right = 1, max(piles)

    while left < right:
        mid = (left + right) // 2
        hours = sum((pile + mid - 1) // mid for pile in piles)
        if hours <= h:
            right = mid
        else:
            left = mid + 1

    return left

# No overflow in Python (arbitrary precision)
a = 10**100
b = 10**100
result = a * b  # Works fine!`,
      cpp: `#include <string>
#include <cmath>

// String to int/long
int num = std::stoi("123");
long bigNum = std::stol("123456789");
long long veryBig = std::stoll("123456789012345");

// int to String
std::string s = std::to_string(123);

// Integer division
int a = 5, b = 2;
std::cout << a / b;              // 2

// Floating-point division
double result = static_cast<double>(a) / b;  // 2.5
double result = (double)a / b;               // C-style cast

// Ceiling division
int ceiling = (a + b - 1) / b;

// Overflow prevention
int a = 1000000, b = 1000000;
long long safe = static_cast<long long>(a) * b;`,
      javascript: `// String to number
const num = parseInt("123");
const num = Number("123");
const decimal = parseFloat("123.45");

// Number to String
const s = String(123);
const s = (123).toString();
const s = "" + 123;

// JavaScript division (always float)
const a = 5, b = 2;
console.log(a / b);              // 2.5

// Integer division (floor)
const intDiv = Math.floor(a / b);  // 2
const intDiv = ~~(a / b);          // 2 (bitwise trick)
const intDiv = (a / b) | 0;        // 2 (bitwise trick)

// Ceiling division
const ceiling = Math.ceil(a / b);

// Truncate toward zero (like Java)
const truncate = Math.trunc(a / b);

// Example: Koko Eating Bananas
function minEatingSpeed(piles, h) {
  let left = 1, right = Math.max(...piles);

  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    const hours = piles.reduce((sum, pile) =>
      sum + Math.ceil(pile / mid), 0);

    if (hours <= h) {
      right = mid;
    } else {
      left = mid + 1;
    }
  }
  return left;
}`,
    },
    keyPoints: [
      "Cast BEFORE division: (double)a/b, not (double)(a/b)",
      "Ceiling division without Math.ceil: (a + b - 1) / b",
      "Cast BEFORE multiply to prevent overflow: (long)a * b",
      "Integer division truncates toward zero in Java/C++",
      "Python // is floor division (not truncate toward zero)",
    ],
    commonMistakes: [
      "Casting after division: (double)(a/b) gives wrong result",
      "Integer overflow: a * b overflows before cast to long",
      "Using Math.ceil with integer division (already truncated)",
      "Python // gives floor (not truncate) for negative numbers",
    ],
    relatedProblems: [
      "Koko Eating Bananas",
      "Car Fleet",
      "Evaluate Reverse Polish Notation",
      "Divide Two Integers",
    ],
    relatedPatterns: ["binary-search"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "arrays-sorting-pairs",
    name: "Sorting Arrays & Pairs",
    slug: "arrays-sorting-pairs",
    category: "Arrays & Sorting",
    description:
      "Sorting arrays with custom comparators and handling pairs (2D arrays) are fundamental operations. Understanding comparator syntax and avoiding overflow pitfalls is essential for interview problems.",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(n)",
    whenToUse: [
      "Sorting by custom criteria",
      "Sorting pairs/tuples by specific element",
      "Meeting rooms, interval problems",
      "Two-pointer problems requiring sorted input",
      "Greedy algorithms",
    ],
    codeSnippets: {
      java: `// Basic sorting
int[] nums = {5, 2, 8, 1};
Arrays.sort(nums);  // Ascending: [1, 2, 5, 8]

// Descending (only for Integer[], not int[])
Integer[] nums = {5, 2, 8, 1};
Arrays.sort(nums, Collections.reverseOrder());

// Custom comparator (ascending)
Arrays.sort(arr, (a, b) -> a - b);        // DANGER: can overflow!
Arrays.sort(arr, (a, b) -> Integer.compare(a, b));  // Safe

// Custom comparator (descending)
Arrays.sort(arr, (a, b) -> b - a);        // DANGER: can overflow!
Arrays.sort(arr, (a, b) -> Integer.compare(b, a));  // Safe
Arrays.sort(arr, Comparator.reverseOrder());

// Sorting 2D array (pairs)
int[][] pairs = {{3, 4}, {1, 2}, {5, 6}};

// Sort by first element (ascending)
Arrays.sort(pairs, (a, b) -> a[0] - b[0]);
Arrays.sort(pairs, (a, b) -> Integer.compare(a[0], b[0]));

// Sort by first element (descending)
Arrays.sort(pairs, (a, b) -> b[0] - a[0]);
Arrays.sort(pairs, (a, b) -> Integer.compare(b[0], a[0]));

// Sort by second element
Arrays.sort(pairs, (a, b) -> Integer.compare(a[1], b[1]));

// Sort by first, then by second (tie-breaker)
Arrays.sort(pairs, (a, b) -> {
    if (a[0] != b[0]) return Integer.compare(a[0], b[0]);
    return Integer.compare(a[1], b[1]);
});

// Using Comparator methods (cleaner)
Arrays.sort(pairs, Comparator
    .comparingInt((int[] a) -> a[0])
    .thenComparingInt(a -> a[1]));

// Sorting doubles
double[][] cars = {{10.0, 2.5}, {5.0, 1.0}};
Arrays.sort(cars, (a, b) -> Double.compare(b[0], a[0]));

// Example: Store pairs and sort
int[] north = {1, 3, 2};
int[] south = {4, 6, 5};
int n = north.length;

int[][] pairs = new int[n][2];
for (int i = 0; i < n; i++) {
    pairs[i][0] = north[i];
    pairs[i][1] = south[i];
}
Arrays.sort(pairs, (a, b) -> a[0] - b[0]);

// Example: Merge Intervals
public int[][] merge(int[][] intervals) {
    Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));

    List<int[]> result = new ArrayList<>();
    int[] current = intervals[0];

    for (int i = 1; i < intervals.length; i++) {
        if (intervals[i][0] <= current[1]) {
            current[1] = Math.max(current[1], intervals[i][1]);
        } else {
            result.add(current);
            current = intervals[i];
        }
    }
    result.add(current);

    return result.toArray(new int[result.size()][]);
}`,
      python: `# Basic sorting
nums = [5, 2, 8, 1]
nums.sort()                    # In-place: [1, 2, 5, 8]
sorted_nums = sorted(nums)     # New list

# Descending
nums.sort(reverse=True)
sorted_nums = sorted(nums, reverse=True)

# Custom key function
nums.sort(key=lambda x: -x)    # Descending
nums.sort(key=abs)             # By absolute value

# Sorting pairs/tuples
pairs = [(3, 4), (1, 2), (5, 6)]

# Sort by first element (default)
pairs.sort()

# Sort by second element
pairs.sort(key=lambda x: x[1])

# Sort by first descending, then second ascending
pairs.sort(key=lambda x: (-x[0], x[1]))

# Sorting 2D list
intervals = [[3, 4], [1, 2], [5, 6]]
intervals.sort(key=lambda x: x[0])

# Example: Merge Intervals
def merge(intervals):
    intervals.sort(key=lambda x: x[0])
    result = [intervals[0]]

    for start, end in intervals[1:]:
        if start <= result[-1][1]:
            result[-1][1] = max(result[-1][1], end)
        else:
            result.append([start, end])

    return result

# Zip and sort together
positions = [10, 5, 8]
speeds = [2, 4, 3]
cars = sorted(zip(positions, speeds), reverse=True)`,
      cpp: `#include <algorithm>
#include <vector>

// Basic sorting
std::vector<int> nums = {5, 2, 8, 1};
std::sort(nums.begin(), nums.end());  // Ascending

// Descending
std::sort(nums.begin(), nums.end(), std::greater<int>());

// Custom comparator
std::sort(nums.begin(), nums.end(), [](int a, int b) {
    return a < b;  // Ascending
});

// Sorting pairs
std::vector<std::pair<int, int>> pairs = {{3, 4}, {1, 2}};

// Sort by first (default)
std::sort(pairs.begin(), pairs.end());

// Sort by second
std::sort(pairs.begin(), pairs.end(), [](auto& a, auto& b) {
    return a.second < b.second;
});

// Sorting 2D vector
std::vector<std::vector<int>> intervals = {{3, 4}, {1, 2}};
std::sort(intervals.begin(), intervals.end(), [](auto& a, auto& b) {
    return a[0] < b[0];
});`,
      javascript: `// Basic sorting (CAUTION: default is lexicographic!)
const nums = [5, 2, 8, 1, 10];
nums.sort();                   // [1, 10, 2, 5, 8] WRONG!
nums.sort((a, b) => a - b);    // [1, 2, 5, 8, 10] Correct

// Descending
nums.sort((a, b) => b - a);

// Sorting pairs
const pairs = [[3, 4], [1, 2], [5, 6]];

// Sort by first element
pairs.sort((a, b) => a[0] - b[0]);

// Sort by second element
pairs.sort((a, b) => a[1] - b[1]);

// Sort by first desc, then second asc
pairs.sort((a, b) => {
  if (a[0] !== b[0]) return b[0] - a[0];
  return a[1] - b[1];
});

// Example: Merge Intervals
function merge(intervals) {
  intervals.sort((a, b) => a[0] - b[0]);
  const result = [intervals[0]];

  for (let i = 1; i < intervals.length; i++) {
    const last = result[result.length - 1];
    if (intervals[i][0] <= last[1]) {
      last[1] = Math.max(last[1], intervals[i][1]);
    } else {
      result.push(intervals[i]);
    }
  }
  return result;
}`,
    },
    keyPoints: [
      "Use Integer.compare(a, b) instead of a - b to avoid overflow",
      "Use Double.compare() for floating-point comparisons",
      "JavaScript default sort is lexicographic - always provide comparator",
      "Python supports tuple comparison for multi-key sorting",
      "Arrays.sort() modifies original array",
    ],
    commonMistakes: [
      "Comparator overflow: a - b fails for Integer.MIN_VALUE",
      "JS - forgetting comparator (lexicographic sort)",
      "Sorting primitive int[] with Collections.reverseOrder() (need Integer[])",
      "Modifying array while sorting",
    ],
    relatedProblems: ["Merge Intervals", "Meeting Rooms", "3Sum", "Car Fleet"],
    relatedPatterns: ["intervals", "two-pointers", "greedy"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "sum-carry-digit-math",
    name: "Sum and Carry (Digit Math)",
    slug: "sum-carry-digit-math",
    category: "Arithmetic Patterns",
    description:
      "The sum and carry pattern is used when adding numbers digit by digit, commonly in linked list addition or string number addition. Understanding modulo and division for digit extraction is key.",
    timeComplexity: "O(max(m,n))",
    spaceComplexity: "O(max(m,n))",
    whenToUse: [
      "Adding two numbers represented as linked lists",
      "Adding two numbers represented as strings",
      "Multiplying numbers digit by digit",
      "Any digit-by-digit arithmetic operation",
    ],
    codeSnippets: {
      java: `// Core formula for sum and carry
int sum = digit1 + digit2 + carry;
int newDigit = sum % 10;    // Get ones digit
int newCarry = sum / 10;    // Get tens digit (0 or 1)

// Example: Add Two Numbers (Linked Lists)
public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
    ListNode dummy = new ListNode(-1);
    ListNode curr = dummy;
    int carry = 0;

    while (l1 != null || l2 != null || carry != 0) {
        int sum = carry;

        if (l1 != null) {
            sum += l1.val;
            l1 = l1.next;
        }

        if (l2 != null) {
            sum += l2.val;
            l2 = l2.next;
        }

        curr.next = new ListNode(sum % 10);
        carry = sum / 10;
        curr = curr.next;
    }

    return dummy.next;
}

// Example: Add Strings
public String addStrings(String num1, String num2) {
    StringBuilder result = new StringBuilder();
    int i = num1.length() - 1;
    int j = num2.length() - 1;
    int carry = 0;

    while (i >= 0 || j >= 0 || carry != 0) {
        int sum = carry;

        if (i >= 0) {
            sum += num1.charAt(i--) - '0';
        }

        if (j >= 0) {
            sum += num2.charAt(j--) - '0';
        }

        result.append(sum % 10);
        carry = sum / 10;
    }

    return result.reverse().toString();
}

// Example: Plus One
public int[] plusOne(int[] digits) {
    for (int i = digits.length - 1; i >= 0; i--) {
        if (digits[i] < 9) {
            digits[i]++;
            return digits;
        }
        digits[i] = 0;
    }

    // All 9s case: 999 -> 1000
    int[] result = new int[digits.length + 1];
    result[0] = 1;
    return result;
}`,
      python: `# Core formula
sum_val = digit1 + digit2 + carry
new_digit = sum_val % 10
new_carry = sum_val // 10

# Example: Add Two Numbers (Linked Lists)
def addTwoNumbers(l1, l2):
    dummy = ListNode(-1)
    curr = dummy
    carry = 0

    while l1 or l2 or carry:
        sum_val = carry

        if l1:
            sum_val += l1.val
            l1 = l1.next

        if l2:
            sum_val += l2.val
            l2 = l2.next

        curr.next = ListNode(sum_val % 10)
        carry = sum_val // 10
        curr = curr.next

    return dummy.next

# Example: Add Strings
def addStrings(num1, num2):
    result = []
    i, j = len(num1) - 1, len(num2) - 1
    carry = 0

    while i >= 0 or j >= 0 or carry:
        sum_val = carry

        if i >= 0:
            sum_val += int(num1[i])
            i -= 1

        if j >= 0:
            sum_val += int(num2[j])
            j -= 1

        result.append(str(sum_val % 10))
        carry = sum_val // 10

    return ''.join(reversed(result))`,
      cpp: `// Example: Add Two Numbers
ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {
    ListNode dummy(-1);
    ListNode* curr = &dummy;
    int carry = 0;

    while (l1 || l2 || carry) {
        int sum = carry;

        if (l1) {
            sum += l1->val;
            l1 = l1->next;
        }

        if (l2) {
            sum += l2->val;
            l2 = l2->next;
        }

        curr->next = new ListNode(sum % 10);
        carry = sum / 10;
        curr = curr->next;
    }

    return dummy.next;
}`,
      javascript: `// Core formula
const sum = digit1 + digit2 + carry;
const newDigit = sum % 10;
const newCarry = Math.floor(sum / 10);

// Example: Add Two Numbers
function addTwoNumbers(l1, l2) {
  const dummy = new ListNode(-1);
  let curr = dummy;
  let carry = 0;

  while (l1 || l2 || carry) {
    let sum = carry;

    if (l1) {
      sum += l1.val;
      l1 = l1.next;
    }

    if (l2) {
      sum += l2.val;
      l2 = l2.next;
    }

    curr.next = new ListNode(sum % 10);
    carry = Math.floor(sum / 10);
    curr = curr.next;
  }

  return dummy.next;
}

// Example: Add Strings
function addStrings(num1, num2) {
  let result = [];
  let i = num1.length - 1;
  let j = num2.length - 1;
  let carry = 0;

  while (i >= 0 || j >= 0 || carry) {
    let sum = carry;

    if (i >= 0) sum += parseInt(num1[i--]);
    if (j >= 0) sum += parseInt(num2[j--]);

    result.push(sum % 10);
    carry = Math.floor(sum / 10);
  }

  return result.reverse().join('');
}`,
    },
    keyPoints: [
      "sum % 10 extracts the ones digit",
      "sum / 10 extracts the carry (0 or 1 for addition)",
      "Continue loop while any input OR carry exists",
      "Use dummy node for linked list to simplify edge cases",
      "Process from least significant digit (right to left for strings)",
    ],
    commonMistakes: [
      "Forgetting to handle remaining carry after loop",
      "Not handling different length inputs",
      "Forgetting to reverse result for string addition",
      "Using integer division in JavaScript without Math.floor()",
    ],
    relatedProblems: [
      "Add Two Numbers",
      "Add Strings",
      "Plus One",
      "Multiply Strings",
    ],
    relatedPatterns: ["linked-list"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "pass-by-value-reference-recursion",
    name: "Pass by Value & Sharing State in Recursion",
    slug: "pass-by-value-reference-recursion",
    category: "Java Fundamentals",
    description:
      "Java is strictly pass-by-value, but object references are passed by value. This means primitives cannot be modified across recursive calls, but arrays and objects can. Understanding this is crucial for recursive algorithms that need to share state.",
    timeComplexity: "Varies",
    spaceComplexity: "O(call stack)",
    whenToUse: [
      "When recursive calls need to share/modify state",
      "Counting in recursive traversals (kth smallest, etc.)",
      "Building results during recursion",
      "Backtracking with global state",
    ],
    codeSnippets: {
      java: `// PROBLEM: Primitive int doesn't work across recursion
// Each call gets its OWN COPY of k
public int kthSmallest(TreeNode root, int k) {
    int[] result = new int[1];  // Won't work with just 'int result'
    int[] count = new int[1];
    count[0] = k;

    inorder(root, count, result);
    return result[0];
}

// WRONG: This doesn't work
private void inorderWrong(TreeNode node, int k, int result) {
    if (node == null) return;

    inorderWrong(node.left, k, result);

    k--;  // This modification is LOCAL only!
    if (k == 0) {
        result = node.val;  // This doesn't update caller's result!
        return;
    }

    inorderWrong(node.right, k, result);
}

// CORRECT: Use array to share state
private void inorder(TreeNode node, int[] count, int[] result) {
    if (node == null) return;

    inorder(node.left, count, result);

    count[0]--;  // Modifies the SAME array element
    if (count[0] == 0) {
        result[0] = node.val;  // Modifies the SAME array element
        return;
    }

    inorder(node.right, count, result);
}

// Alternative: Use instance variable
class Solution {
    private int count;
    private int result;

    public int kthSmallest(TreeNode root, int k) {
        count = k;
        inorder(root);
        return result;
    }

    private void inorder(TreeNode node) {
        if (node == null) return;

        inorder(node.left);

        count--;
        if (count == 0) {
            result = node.val;
            return;
        }

        inorder(node.right);
    }
}

// Alternative: Return early with special value
public int kthSmallest(TreeNode root, int k) {
    int[] count = {k};
    return inorder(root, count);
}

private int inorder(TreeNode node, int[] count) {
    if (node == null) return -1;

    int left = inorder(node.left, count);
    if (left != -1) return left;  // Found in left subtree

    count[0]--;
    if (count[0] == 0) return node.val;

    return inorder(node.right, count);
}

// Understanding pass-by-value with objects
void modify(int[] arr, int num) {
    arr[0] = 100;  // Modifies original array
    num = 100;     // Does NOT modify caller's variable
}

int[] arr = {1};
int num = 1;
modify(arr, num);
// arr[0] is now 100
// num is still 1`,
      python: `# Python: Use list or nonlocal keyword

# Method 1: Use list (mutable)
def kthSmallest(root, k):
    result = [None]
    count = [k]

    def inorder(node):
        if not node:
            return

        inorder(node.left)

        count[0] -= 1
        if count[0] == 0:
            result[0] = node.val
            return

        inorder(node.right)

    inorder(root)
    return result[0]

# Method 2: Use nonlocal keyword
def kthSmallest(root, k):
    result = None
    count = k

    def inorder(node):
        nonlocal result, count  # Declare as nonlocal
        if not node:
            return

        inorder(node.left)

        count -= 1
        if count == 0:
            result = node.val
            return

        inorder(node.right)

    inorder(root)
    return result

# Method 3: Use class instance variable
class Solution:
    def kthSmallest(self, root, k):
        self.count = k
        self.result = None
        self.inorder(root)
        return self.result

    def inorder(self, node):
        if not node:
            return

        self.inorder(node.left)

        self.count -= 1
        if self.count == 0:
            self.result = node.val
            return

        self.inorder(node.right)`,
      cpp: `// C++: Use reference or pointer

// Method 1: Pass by reference
int kthSmallest(TreeNode* root, int k) {
    int result = -1;
    inorder(root, k, result);
    return result;
}

void inorder(TreeNode* node, int& k, int& result) {
    if (!node) return;

    inorder(node->left, k, result);

    k--;
    if (k == 0) {
        result = node->val;
        return;
    }

    inorder(node->right, k, result);
}

// Method 2: Use pointer
void inorder(TreeNode* node, int* k, int* result) {
    if (!node) return;

    inorder(node->left, k, result);

    (*k)--;
    if (*k == 0) {
        *result = node->val;
        return;
    }

    inorder(node->right, k, result);
}`,
      javascript: `// JS - Use object or array (closure also works)

// Method 1: Use object
function kthSmallest(root, k) {
  const state = { count: k, result: null };

  function inorder(node) {
    if (!node) return;

    inorder(node.left);

    state.count--;
    if (state.count === 0) {
      state.result = node.val;
      return;
    }

    inorder(node.right);
  }

  inorder(root);
  return state.result;
}

// Method 2: Use closure (let in outer scope)
function kthSmallest(root, k) {
  let count = k;
  let result = null;

  function inorder(node) {
    if (!node) return;

    inorder(node.left);

    count--;  // Closure captures the variable
    if (count === 0) {
      result = node.val;
      return;
    }

    inorder(node.right);
  }

  inorder(root);
  return result;
}`,
    },
    keyPoints: [
      "Java primitives are passed by value - modifications don't affect caller",
      "Arrays/objects references are passed by value - but you can modify contents",
      "Use int[1] or instance variables to share state in recursion",
      "Python: use list or 'nonlocal' keyword",
      "C++: use reference (&) or pointer (*)",
    ],
    commonMistakes: [
      "Trying to modify primitive parameter expecting caller to see change",
      "Reassigning array reference instead of modifying contents",
      "Forgetting 'nonlocal' in Python nested functions",
      "Confusing pass-by-value of reference with pass-by-reference",
    ],
    relatedProblems: [
      "Kth Smallest Element in BST",
      "Path Sum",
      "Binary Tree Maximum Path Sum",
    ],
    relatedPatterns: ["trees"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "treemap-treeset",
    name: "TreeMap & TreeSet",
    slug: "treemap-treeset",
    category: "Data Structures",
    description:
      "TreeMap and TreeSet are sorted collections backed by Red-Black trees, providing O(log n) operations. They're essential when you need ordered keys or floor/ceiling operations for range queries.",
    timeComplexity: "O(log n) operations",
    spaceComplexity: "O(n)",
    whenToUse: [
      "Need sorted keys or elements",
      "Floor/ceiling lookups (greatest key ≤ x, smallest key ≥ x)",
      "Range queries on keys",
      "Sliding window with sorted elements",
      "Calendar/interval scheduling problems",
    ],
    codeSnippets: {
      java: `// TreeMap - sorted by keys
TreeMap<Integer, String> treeMap = new TreeMap<>();
treeMap.put(5, "five");
treeMap.put(3, "three");
treeMap.put(8, "eight");

// Floor and Ceiling operations
treeMap.floorKey(6);     // 5 (greatest key ≤ 6)
treeMap.ceilingKey(6);   // 8 (smallest key ≥ 6)
treeMap.lowerKey(5);     // 3 (greatest key < 5)
treeMap.higherKey(5);    // 8 (smallest key > 5)

// First and Last
treeMap.firstKey();      // 3 (smallest)
treeMap.lastKey();       // 8 (largest)

// Range operations
treeMap.headMap(5);      // Keys < 5: {3}
treeMap.tailMap(5);      // Keys ≥ 5: {5, 8}
treeMap.subMap(3, 8);    // Keys [3, 8): {3, 5}

// TreeSet - sorted unique elements
TreeSet<Integer> treeSet = new TreeSet<>();
treeSet.add(5);
treeSet.add(3);
treeSet.add(8);

treeSet.floor(6);        // 5
treeSet.ceiling(6);      // 8
treeSet.lower(5);        // 3
treeSet.higher(5);       // 8

// Example: My Calendar (no double booking)
class MyCalendar {
    TreeMap<Integer, Integer> calendar;

    public MyCalendar() {
        calendar = new TreeMap<>();
    }

    public boolean book(int start, int end) {
        Integer prev = calendar.floorKey(start);
        Integer next = calendar.ceilingKey(start);

        if ((prev == null || calendar.get(prev) <= start) &&
            (next == null || end <= next)) {
            calendar.put(start, end);
            return true;
        }
        return false;
    }
}`,
      python: `# Python doesn't have built-in TreeMap
# Use sortedcontainers library or bisect module

from sortedcontainers import SortedDict, SortedList

# SortedDict (like TreeMap)
sd = SortedDict()
sd[5] = "five"
sd[3] = "three"
sd[8] = "eight"

# Find floor/ceiling using bisect
idx = sd.bisect_right(6) - 1  # Floor index
if idx >= 0:
    floor_key = sd.keys()[idx]  # 5

idx = sd.bisect_left(6)  # Ceiling index
if idx < len(sd):
    ceiling_key = sd.keys()[idx]  # 8

# SortedList (like TreeSet)
sl = SortedList([5, 3, 8])
sl.add(6)

# Using bisect for floor/ceiling
from bisect import bisect_left, bisect_right

arr = [3, 5, 8]  # Must be sorted

# Floor: largest element ≤ x
def floor(arr, x):
    idx = bisect_right(arr, x) - 1
    return arr[idx] if idx >= 0 else None

# Ceiling: smallest element ≥ x
def ceiling(arr, x):
    idx = bisect_left(arr, x)
    return arr[idx] if idx < len(arr) else None`,
      cpp: `#include <map>
#include <set>

// std::map is ordered (like TreeMap)
std::map<int, std::string> treeMap;
treeMap[5] = "five";
treeMap[3] = "three";
treeMap[8] = "eight";

// Floor: greatest key ≤ x
auto it = treeMap.upper_bound(6);
if (it != treeMap.begin()) {
    --it;  // it->first = 5
}

// Ceiling: smallest key ≥ x
auto it = treeMap.lower_bound(6);  // it->first = 8

// std::set is ordered (like TreeSet)
std::set<int> treeSet = {5, 3, 8};

// Floor
auto it = treeSet.upper_bound(6);
if (it != treeSet.begin()) {
    --it;  // *it = 5
}

// Ceiling
auto it = treeSet.lower_bound(6);  // *it = 8`,
      javascript: `// JavaScript doesn't have built-in sorted collections
// Use array with binary search or third-party library

// Manual binary search for floor/ceiling
function floor(arr, x) {
  let left = 0, right = arr.length - 1;
  let result = -1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] <= x) {
      result = mid;
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return result === -1 ? null : arr[result];
}

function ceiling(arr, x) {
  let left = 0, right = arr.length - 1;
  let result = -1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] >= x) {
      result = mid;
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }
  return result === -1 ? null : arr[result];
}

// Usage (array must be sorted)
const arr = [3, 5, 8];
console.log(floor(arr, 6));    // 5
console.log(ceiling(arr, 6));  // 8`,
    },
    keyPoints: [
      "TreeMap/TreeSet are O(log n) for all operations",
      "floorKey/floor: greatest element ≤ x",
      "ceilingKey/ceiling: smallest element ≥ x",
      "lowerKey/lower: greatest element < x (strictly less)",
      "higherKey/higher: smallest element > x (strictly greater)",
      "Perfect for interval/calendar problems",
    ],
    commonMistakes: [
      "Confusing floor vs lower (≤ vs <)",
      "Confusing ceiling vs higher (≥ vs >)",
      "In C++, upper_bound is > not ≥",
      "Forgetting to check for null/end iterator",
    ],
    relatedProblems: [
      "My Calendar I",
      "My Calendar II",
      "Count of Smaller Numbers After Self",
      "Sliding Window Median",
    ],
    relatedPatterns: ["binary-search", "intervals"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "linkedhashmap-lru",
    name: "LinkedHashMap for LRU Cache",
    slug: "linkedhashmap-lru",
    category: "Data Structures",
    description:
      "LinkedHashMap maintains insertion order (or access order) while providing O(1) operations. It's the go-to data structure for implementing LRU (Least Recently Used) cache.",
    timeComplexity: "O(1) get/put",
    spaceComplexity: "O(capacity)",
    whenToUse: [
      "LRU Cache implementation",
      "Maintaining insertion order with O(1) lookups",
      "Need both HashMap speed and ordering",
      "Removing oldest/least recently used elements",
    ],
    codeSnippets: {
      java: `// LinkedHashMap basics
// Insertion order (default)
LinkedHashMap<String, Integer> insertionOrder = new LinkedHashMap<>();

// Access order (for LRU) - third parameter = true
LinkedHashMap<String, Integer> accessOrder =
    new LinkedHashMap<>(16, 0.75f, true);

// LRU Cache using LinkedHashMap
class LRUCache extends LinkedHashMap<Integer, Integer> {
    private final int capacity;

    public LRUCache(int capacity) {
        // accessOrder = true for LRU behavior
        super(capacity, 0.75f, true);
        this.capacity = capacity;
    }

    public int get(int key) {
        return super.getOrDefault(key, -1);
    }

    public void put(int key, int value) {
        super.put(key, value);
    }

    @Override
    protected boolean removeEldestEntry(Map.Entry<Integer, Integer> eldest) {
        return size() > capacity;
    }
}

// Manual LRU Cache with HashMap + Doubly Linked List
class LRUCache {
    class Node {
        int key, val;
        Node prev, next;
        Node(int k, int v) { key = k; val = v; }
    }

    private Map<Integer, Node> map = new HashMap<>();
    private Node head = new Node(0, 0);
    private Node tail = new Node(0, 0);
    private int capacity;

    public LRUCache(int capacity) {
        this.capacity = capacity;
        head.next = tail;
        tail.prev = head;
    }

    public int get(int key) {
        if (!map.containsKey(key)) return -1;
        Node node = map.get(key);
        remove(node);
        insertAtHead(node);
        return node.val;
    }

    public void put(int key, int value) {
        if (map.containsKey(key)) {
            remove(map.get(key));
        }
        Node node = new Node(key, value);
        map.put(key, node);
        insertAtHead(node);

        if (map.size() > capacity) {
            Node lru = tail.prev;
            remove(lru);
            map.remove(lru.key);
        }
    }

    private void remove(Node node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }

    private void insertAtHead(Node node) {
        node.next = head.next;
        node.prev = head;
        head.next.prev = node;
        head.next = node;
    }
}`,
      python: `from collections import OrderedDict

# OrderedDict maintains insertion order
od = OrderedDict()
od['a'] = 1
od['b'] = 2
od['c'] = 3

# Move to end (most recently used)
od.move_to_end('a')  # Now: b, c, a

# Pop oldest (least recently used)
od.popitem(last=False)  # Removes 'b'

# LRU Cache using OrderedDict
class LRUCache:
    def __init__(self, capacity: int):
        self.cache = OrderedDict()
        self.capacity = capacity

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        # Move to end (most recently used)
        self.cache.move_to_end(key)
        return self.cache[key]

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.capacity:
            # Remove oldest (first item)
            self.cache.popitem(last=False)

# Python 3.7+ dict maintains insertion order
# But no move_to_end method`,
      cpp: `#include <list>
#include <unordered_map>

// C++ doesn't have LinkedHashMap
// Use list + unordered_map

class LRUCache {
private:
    int capacity;
    std::list<std::pair<int, int>> cache;  // {key, value}
    std::unordered_map<int, std::list<std::pair<int, int>>::iterator> map;

public:
    LRUCache(int capacity) : capacity(capacity) {}

    int get(int key) {
        if (map.find(key) == map.end()) return -1;

        // Move to front (most recently used)
        auto it = map[key];
        int value = it->second;
        cache.erase(it);
        cache.push_front({key, value});
        map[key] = cache.begin();

        return value;
    }

    void put(int key, int value) {
        if (map.find(key) != map.end()) {
            cache.erase(map[key]);
        }

        cache.push_front({key, value});
        map[key] = cache.begin();

        if (cache.size() > capacity) {
            // Remove oldest (back of list)
            int oldKey = cache.back().first;
            cache.pop_back();
            map.erase(oldKey);
        }
    }
};`,
      javascript: `// JavaScript Map maintains insertion order (ES6+)
// But no built-in move-to-end

class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return -1;

    // Move to end (most recently used)
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);

    return value;
  }

  put(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    this.cache.set(key, value);

    if (this.cache.size > this.capacity) {
      // Remove oldest (first key)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }
}

// Usage
const cache = new LRUCache(2);
cache.put(1, 1);
cache.put(2, 2);
cache.get(1);      // Returns 1, moves to end
cache.put(3, 3);   // Evicts key 2
cache.get(2);      // Returns -1 (not found)`,
    },
    keyPoints: [
      "LinkedHashMap(capacity, loadFactor, accessOrder=true) for LRU",
      "Override removeEldestEntry() for automatic eviction",
      "Alternative: HashMap + Doubly Linked List for more control",
      "Python: OrderedDict with move_to_end() and popitem(last=False)",
      "JavaScript Map maintains insertion order since ES6",
    ],
    commonMistakes: [
      "Forgetting accessOrder=true parameter for LRU behavior",
      "Not moving accessed elements to end on get()",
      "Removing by value instead of by eldest entry",
      "Memory leak from not removing map entry when evicting",
    ],
    relatedProblems: ["LRU Cache", "LFU Cache", "Design Twitter"],
    relatedPatterns: ["hash-map"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "monotonic-stack-queue",
    name: "Monotonic Stack & Queue",
    slug: "monotonic-stack-queue",
    category: "Data Structures",
    description:
      "A monotonic stack/queue maintains elements in sorted order (increasing or decreasing). Elements are removed when they violate the monotonic property. Essential for 'next greater element' and 'sliding window maximum' problems.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    whenToUse: [
      "Next Greater Element problems",
      "Previous Greater/Smaller Element",
      "Sliding Window Maximum/Minimum",
      "Largest Rectangle in Histogram",
      "Trapping Rain Water",
      "Stock span problems",
    ],
    codeSnippets: {
      java: `// Monotonic Decreasing Stack - for Next Greater Element
// Stack keeps indices of elements in decreasing order

public int[] nextGreaterElement(int[] nums) {
    int n = nums.length;
    int[] result = new int[n];
    Arrays.fill(result, -1);

    ArrayDeque<Integer> stack = new ArrayDeque<>();  // Stores indices

    for (int i = 0; i < n; i++) {
        // Pop all smaller elements - current is their next greater
        while (!stack.isEmpty() && nums[stack.peek()] < nums[i]) {
            result[stack.pop()] = nums[i];
        }
        stack.push(i);
    }

    return result;
}

// Monotonic Decreasing Deque - for Sliding Window Maximum
public int[] maxSlidingWindow(int[] nums, int k) {
    int n = nums.length;
    int[] result = new int[n - k + 1];

    ArrayDeque<Integer> deque = new ArrayDeque<>();  // Stores indices

    for (int i = 0; i < n; i++) {
        // Remove indices outside window
        while (!deque.isEmpty() && deque.peekFirst() < i - k + 1) {
            deque.pollFirst();
        }

        // Remove smaller elements (they can never be max)
        while (!deque.isEmpty() && nums[deque.peekLast()] < nums[i]) {
            deque.pollLast();
        }

        deque.offerLast(i);

        // Window is complete
        if (i >= k - 1) {
            result[i - k + 1] = nums[deque.peekFirst()];
        }
    }

    return result;
}

// Largest Rectangle in Histogram
public int largestRectangleArea(int[] heights) {
    int n = heights.length;
    int maxArea = 0;

    ArrayDeque<Integer> stack = new ArrayDeque<>();

    for (int i = 0; i <= n; i++) {
        int h = (i == n) ? 0 : heights[i];

        while (!stack.isEmpty() && heights[stack.peek()] > h) {
            int height = heights[stack.pop()];
            int width = stack.isEmpty() ? i : i - stack.peek() - 1;
            maxArea = Math.max(maxArea, height * width);
        }

        stack.push(i);
    }

    return maxArea;
}`,
      python: `from collections import deque

# Next Greater Element
def nextGreaterElement(nums):
    n = len(nums)
    result = [-1] * n
    stack = []  # Stores indices

    for i in range(n):
        while stack and nums[stack[-1]] < nums[i]:
            result[stack.pop()] = nums[i]
        stack.append(i)

    return result

# Sliding Window Maximum
def maxSlidingWindow(nums, k):
    result = []
    dq = deque()  # Stores indices

    for i, num in enumerate(nums):
        # Remove indices outside window
        while dq and dq[0] < i - k + 1:
            dq.popleft()

        # Remove smaller elements
        while dq and nums[dq[-1]] < num:
            dq.pop()

        dq.append(i)

        if i >= k - 1:
            result.append(nums[dq[0]])

    return result

# Largest Rectangle in Histogram
def largestRectangleArea(heights):
    heights.append(0)  # Sentinel
    stack = []
    max_area = 0

    for i, h in enumerate(heights):
        while stack and heights[stack[-1]] > h:
            height = heights[stack.pop()]
            width = i if not stack else i - stack[-1] - 1
            max_area = max(max_area, height * width)
        stack.append(i)

    heights.pop()  # Remove sentinel
    return max_area`,
      cpp: `#include <stack>
#include <deque>
#include <vector>

// Next Greater Element
std::vector<int> nextGreaterElement(std::vector<int>& nums) {
    int n = nums.size();
    std::vector<int> result(n, -1);
    std::stack<int> stk;

    for (int i = 0; i < n; i++) {
        while (!stk.empty() && nums[stk.top()] < nums[i]) {
            result[stk.top()] = nums[i];
            stk.pop();
        }
        stk.push(i);
    }

    return result;
}

// Sliding Window Maximum
std::vector<int> maxSlidingWindow(std::vector<int>& nums, int k) {
    std::vector<int> result;
    std::deque<int> dq;

    for (int i = 0; i < nums.size(); i++) {
        while (!dq.empty() && dq.front() < i - k + 1) {
            dq.pop_front();
        }
        while (!dq.empty() && nums[dq.back()] < nums[i]) {
            dq.pop_back();
        }
        dq.push_back(i);

        if (i >= k - 1) {
            result.push_back(nums[dq.front()]);
        }
    }

    return result;
}`,
      javascript: `// Next Greater Element
function nextGreaterElement(nums) {
  const n = nums.length;
  const result = new Array(n).fill(-1);
  const stack = [];  // Stores indices

  for (let i = 0; i < n; i++) {
    while (stack.length && nums[stack[stack.length - 1]] < nums[i]) {
      result[stack.pop()] = nums[i];
    }
    stack.push(i);
  }

  return result;
}

// Sliding Window Maximum
function maxSlidingWindow(nums, k) {
  const result = [];
  const deque = [];  // Stores indices

  for (let i = 0; i < nums.length; i++) {
    // Remove indices outside window
    while (deque.length && deque[0] < i - k + 1) {
      deque.shift();
    }

    // Remove smaller elements
    while (deque.length && nums[deque[deque.length - 1]] < nums[i]) {
      deque.pop();
    }

    deque.push(i);

    if (i >= k - 1) {
      result.push(nums[deque[0]]);
    }
  }

  return result;
}

// Largest Rectangle in Histogram
function largestRectangleArea(heights) {
  heights.push(0);  // Sentinel
  const stack = [];
  let maxArea = 0;

  for (let i = 0; i < heights.length; i++) {
    while (stack.length && heights[stack[stack.length - 1]] > heights[i]) {
      const height = heights[stack.pop()];
      const width = stack.length === 0 ? i : i - stack[stack.length - 1] - 1;
      maxArea = Math.max(maxArea, height * width);
    }
    stack.push(i);
  }

  heights.pop();  // Remove sentinel
  return maxArea;
}`,
    },
    keyPoints: [
      "Monotonic Decreasing: keeps larger elements, finds next greater",
      "Monotonic Increasing: keeps smaller elements, finds next smaller",
      "Store indices, not values (for width/position calculations)",
      "Use sentinel value (0 or Infinity) to flush remaining elements",
      "Deque for sliding window (remove from both ends)",
    ],
    commonMistakes: [
      "Storing values instead of indices",
      "Wrong comparison direction (< vs >)",
      "Forgetting to handle remaining elements in stack",
      "Off-by-one in width calculation",
      "Not removing elements outside window in sliding window",
    ],
    relatedProblems: [
      "Next Greater Element I/II",
      "Daily Temperatures",
      "Sliding Window Maximum",
      "Largest Rectangle in Histogram",
      "Trapping Rain Water",
    ],
    relatedPatterns: ["stack", "sliding-window"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "hashset-operations",
    name: "HashSet Operations",
    slug: "hashset-operations",
    category: "Collections & Maps",
    description:
      "HashSet provides O(1) average time for add, remove, and contains operations. It stores unique elements only and is essential for deduplication, membership testing, and set operations.",
    timeComplexity: "O(1) average",
    spaceComplexity: "O(n)",
    whenToUse: [
      "Checking if element exists (membership test)",
      "Removing duplicates from collection",
      "Finding unique elements",
      "Set operations (union, intersection, difference)",
      "Tracking visited nodes in graph traversal",
    ],
    codeSnippets: {
      java: `// Basic operations
Set<Integer> set = new HashSet<>();
set.add(1);                    // Add element
set.add(2);
set.add(1);                    // Duplicate ignored
boolean exists = set.contains(1);  // O(1) lookup
set.remove(1);                 // Remove element
int size = set.size();

// Initialize with elements
Set<Integer> set = new HashSet<>(Arrays.asList(1, 2, 3));
Set<Integer> set = Set.of(1, 2, 3);  // Immutable (Java 9+)

// Iterate
for (int num : set) {
    System.out.println(num);
}

// Set operations
Set<Integer> a = new HashSet<>(Arrays.asList(1, 2, 3));
Set<Integer> b = new HashSet<>(Arrays.asList(2, 3, 4));

// Union
Set<Integer> union = new HashSet<>(a);
union.addAll(b);  // {1, 2, 3, 4}

// Intersection
Set<Integer> intersection = new HashSet<>(a);
intersection.retainAll(b);  // {2, 3}

// Difference (a - b)
Set<Integer> difference = new HashSet<>(a);
difference.removeAll(b);  // {1}

// Contains Duplicate
public boolean containsDuplicate(int[] nums) {
    Set<Integer> seen = new HashSet<>();
    for (int num : nums) {
        if (!seen.add(num)) {  // add() returns false if exists
            return true;
        }
    }
    return false;
}

// Longest Consecutive Sequence
public int longestConsecutive(int[] nums) {
    Set<Integer> set = new HashSet<>();
    for (int num : nums) set.add(num);

    int longest = 0;
    for (int num : set) {
        // Only start counting from sequence start
        if (!set.contains(num - 1)) {
            int length = 1;
            while (set.contains(num + length)) {
                length++;
            }
            longest = Math.max(longest, length);
        }
    }
    return longest;
}`,
      python: `# Basic operations
s = set()
s.add(1)
s.add(2)
s.add(1)                  # Duplicate ignored
exists = 1 in s           # O(1) lookup
s.remove(1)               # Raises KeyError if not exists
s.discard(1)              # No error if not exists
size = len(s)

# Initialize with elements
s = {1, 2, 3}
s = set([1, 2, 3])

# Set operations (very Pythonic)
a = {1, 2, 3}
b = {2, 3, 4}

union = a | b              # {1, 2, 3, 4}
intersection = a & b       # {2, 3}
difference = a - b         # {1}
symmetric_diff = a ^ b     # {1, 4}

# Set comprehension
squares = {x**2 for x in range(5)}  # {0, 1, 4, 9, 16}

# Contains Duplicate
def containsDuplicate(nums):
    return len(nums) != len(set(nums))

# Or
def containsDuplicate(nums):
    seen = set()
    for num in nums:
        if num in seen:
            return True
        seen.add(num)
    return False

# Longest Consecutive Sequence
def longestConsecutive(nums):
    num_set = set(nums)
    longest = 0

    for num in num_set:
        if num - 1 not in num_set:  # Start of sequence
            length = 1
            while num + length in num_set:
                length += 1
            longest = max(longest, length)

    return longest`,
      cpp: `#include <unordered_set>

// Basic operations
std::unordered_set<int> s;
s.insert(1);
s.insert(2);
bool exists = s.count(1);  // 0 or 1
// or
bool exists = s.find(1) != s.end();
s.erase(1);
int size = s.size();

// Initialize
std::unordered_set<int> s = {1, 2, 3};

// Iterate
for (int num : s) {
    std::cout << num << std::endl;
}

// Contains Duplicate
bool containsDuplicate(std::vector<int>& nums) {
    std::unordered_set<int> seen;
    for (int num : nums) {
        if (seen.count(num)) return true;
        seen.insert(num);
    }
    return false;
}

// Or simply
bool containsDuplicate(std::vector<int>& nums) {
    return std::unordered_set<int>(nums.begin(), nums.end()).size()
           != nums.size();
}`,
      javascript: `// Basic operations
const set = new Set();
set.add(1);
set.add(2);
set.add(1);                   // Duplicate ignored
const exists = set.has(1);    // O(1) lookup
set.delete(1);
const size = set.size;

// Initialize
const set = new Set([1, 2, 3]);

// Convert to array
const arr = [...set];
const arr = Array.from(set);

// Iterate
for (const num of set) {
  console.log(num);
}
set.forEach(num => console.log(num));

// Set operations (manual)
const a = new Set([1, 2, 3]);
const b = new Set([2, 3, 4]);

// Union
const union = new Set([...a, ...b]);

// Intersection
const intersection = new Set([...a].filter(x => b.has(x)));

// Difference
const difference = new Set([...a].filter(x => !b.has(x)));

// Contains Duplicate
function containsDuplicate(nums) {
  return new Set(nums).size !== nums.length;
}

// Longest Consecutive Sequence
function longestConsecutive(nums) {
  const numSet = new Set(nums);
  let longest = 0;

  for (const num of numSet) {
    if (!numSet.has(num - 1)) {
      let length = 1;
      while (numSet.has(num + length)) {
        length++;
      }
      longest = Math.max(longest, length);
    }
  }

  return longest;
}`,
    },
    keyPoints: [
      "O(1) average for add, remove, contains",
      "Only stores unique elements",
      "add() returns false if element already exists (Java)",
      "Use for membership testing, not for ordered data",
      "HashSet allows null, but only one null element",
    ],
    commonMistakes: [
      "Using HashSet for ordered data (use LinkedHashSet or TreeSet)",
      "Modifying elements while iterating",
      "Using mutable objects as set elements (hashCode changes)",
      "Confusing remove() and discard() in Python",
    ],
    relatedProblems: [
      "Contains Duplicate",
      "Longest Consecutive Sequence",
      "Happy Number",
      "Intersection of Two Arrays",
    ],
    relatedPatterns: ["hash-map"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "arraylist-initialization",
    name: "ArrayList Initialization & Conversion",
    slug: "arraylist-initialization",
    category: "Collections & Maps",
    description:
      "ArrayList is Java's dynamic array implementation. Knowing how to quickly initialize it with elements and convert between List and array is essential for interview problems that expect List<List<Integer>> or similar return types.",
    timeComplexity: "O(1) amortized add",
    spaceComplexity: "O(n)",
    whenToUse: [
      "Building result lists dynamically",
      "Returning List<List<Integer>> from methods",
      "Converting between arrays and lists",
      "When you need dynamic resizing",
    ],
    codeSnippets: {
      java: `// Basic initialization
List<Integer> list = new ArrayList<>();
list.add(1);
list.add(2);

// Initialize with elements
List<Integer> list = new ArrayList<>(Arrays.asList(1, 2, 3));
List<Integer> list = List.of(1, 2, 3);  // Immutable (Java 9+)

// Initialize with capacity (optimization)
List<Integer> list = new ArrayList<>(1000);

// Create list inline - common in interview problems
// 3Sum: result.add(Arrays.asList(nums[i], nums[left], nums[right]));
List<List<Integer>> result = new ArrayList<>();
result.add(new ArrayList<>(Arrays.asList(1, 2, 3)));
result.add(Arrays.asList(4, 5, 6));  // Fixed-size list

// Convert array to List
int[] arr = {1, 2, 3};
// For primitives - manual conversion needed
List<Integer> list = new ArrayList<>();
for (int num : arr) list.add(num);

// For objects
String[] strArr = {"a", "b", "c"};
List<String> strList = new ArrayList<>(Arrays.asList(strArr));

// Convert List to array
List<Integer> list = Arrays.asList(1, 2, 3);

// To Integer[]
Integer[] arr = list.toArray(new Integer[0]);

// To int[] - manual conversion needed
int[] arr = new int[list.size()];
for (int i = 0; i < list.size(); i++) {
    arr[i] = list.get(i);
}

// Or with streams (Java 8+)
int[] arr = list.stream().mapToInt(Integer::intValue).toArray();

// Convert Map values to List
Map<String, List<String>> map = new HashMap<>();
// ... populate map
List<List<String>> result = new ArrayList<>(map.values());

// Sublist (view, not copy!)
List<Integer> sub = list.subList(1, 3);  // [1, 3)

// Copy a list
List<Integer> copy = new ArrayList<>(original);

// Common patterns in problems
// Permutations - add copy of current state
result.add(new ArrayList<>(current));

// Backtracking - remove last element
current.remove(current.size() - 1);

// 2D List for adjacency list
List<List<Integer>> graph = new ArrayList<>();
for (int i = 0; i < n; i++) {
    graph.add(new ArrayList<>());
}
graph.get(0).add(1);  // Edge 0 -> 1`,
      python: `# Lists are dynamic arrays in Python
lst = []
lst.append(1)
lst.append(2)

# Initialize with elements
lst = [1, 2, 3]

# List comprehension
lst = [i for i in range(5)]       # [0, 1, 2, 3, 4]
lst = [i**2 for i in range(5)]    # [0, 1, 4, 9, 16]
lst = [0] * 5                      # [0, 0, 0, 0, 0]

# 2D list (be careful!)
# WRONG - all rows share same list
matrix = [[0] * 3] * 3

# CORRECT
matrix = [[0] * 3 for _ in range(3)]

# Nested list for results
result = []
result.append([1, 2, 3])
result.append([4, 5, 6])

# Convert dict values to list
d = {'a': [1, 2], 'b': [3, 4]}
result = list(d.values())

# Slicing (creates copy)
sub = lst[1:3]

# Copy a list
copy = lst[:]
copy = lst.copy()
copy = list(lst)

# Deep copy for nested lists
import copy
deep = copy.deepcopy(nested_list)

# Remove last element
lst.pop()

# Add to beginning (O(n))
lst.insert(0, element)

# Extend vs append
lst.append([1, 2])   # [[1, 2]]
lst.extend([1, 2])   # [1, 2]`,
      cpp: `#include <vector>

// Basic initialization
std::vector<int> vec;
vec.push_back(1);
vec.push_back(2);

// Initialize with elements
std::vector<int> vec = {1, 2, 3};
std::vector<int> vec(5, 0);  // 5 zeros

// 2D vector
std::vector<std::vector<int>> matrix(3, std::vector<int>(4, 0));  // 3x4

// Nested vector for results
std::vector<std::vector<int>> result;
result.push_back({1, 2, 3});

// Convert to array (C++11)
std::vector<int> vec = {1, 2, 3};
int* arr = vec.data();

// Remove last element
vec.pop_back();

// Access last element
int last = vec.back();

// Reserve capacity
vec.reserve(1000);`,
      javascript: `// Arrays are dynamic in JavaScript
const arr = [];
arr.push(1);
arr.push(2);

// Initialize with elements
const arr = [1, 2, 3];
const arr = new Array(5).fill(0);  // [0, 0, 0, 0, 0]

// 2D array
const matrix = Array.from({ length: 3 }, () => new Array(4).fill(0));
// or
const matrix = [...Array(3)].map(() => Array(4).fill(0));

// Nested arrays for results
const result = [];
result.push([1, 2, 3]);
result.push([4, 5, 6]);

// Convert Map values to array
const map = new Map([['a', [1, 2]], ['b', [3, 4]]]);
const result = [...map.values()];

// Slice (creates copy)
const sub = arr.slice(1, 3);

// Copy array
const copy = [...arr];
const copy = arr.slice();

// Remove last element
arr.pop();

// Add to beginning
arr.unshift(element);  // O(n)

// Spread vs push
arr.push(...[1, 2]);   // [1, 2]
arr.push([1, 2]);      // [[1, 2]]`,
    },
    keyPoints: [
      "Arrays.asList() returns fixed-size list (can't add/remove)",
      "List.of() returns immutable list (Java 9+)",
      "new ArrayList<>(map.values()) converts map values to list",
      "Always use new ArrayList<>(current) when adding to result in backtracking",
      "subList() returns a view, not a copy",
    ],
    commonMistakes: [
      "Trying to add to Arrays.asList() result (throws UnsupportedOperationException)",
      "Python: using [[0]*n]*m creates shared references",
      "Adding reference instead of copy in backtracking",
      "Modifying subList affects original list",
    ],
    relatedProblems: ["3Sum", "Permutations", "Subsets", "Group Anagrams"],
    relatedPatterns: ["backtracking"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "stringbuilder-usage",
    name: "StringBuilder for String Building",
    slug: "stringbuilder-usage",
    category: "String & Character",
    description:
      "String concatenation in a loop creates new String objects each time, resulting in O(n²) time. StringBuilder provides O(n) string building by using a mutable character buffer.",
    timeComplexity: "O(1) amortized append",
    spaceComplexity: "O(n)",
    whenToUse: [
      "Building strings in loops",
      "Concatenating many strings",
      "Building keys for HashMaps (like anagram frequency keys)",
      "Reversing strings",
      "Any situation where you're modifying a string repeatedly",
    ],
    codeSnippets: {
      java: `// BAD - O(n²) due to String immutability
String result = "";
for (int i = 0; i < n; i++) {
    result += chars[i];  // Creates new String each time!
}

// GOOD - O(n) using StringBuilder
StringBuilder sb = new StringBuilder();
for (int i = 0; i < n; i++) {
    sb.append(chars[i]);
}
String result = sb.toString();

// Common operations
StringBuilder sb = new StringBuilder();
sb.append("Hello");           // Append string
sb.append(' ');               // Append char
sb.append(123);               // Append int (auto-converts)
sb.insert(0, "Start: ");      // Insert at index
sb.delete(0, 5);              // Delete range [0, 5)
sb.deleteCharAt(0);           // Delete single char
sb.reverse();                 // Reverse in-place
sb.setCharAt(0, 'h');         // Set char at index
int len = sb.length();        // Get length
char c = sb.charAt(0);        // Get char at index
String str = sb.toString();   // Convert to String

// Initialize with string
StringBuilder sb = new StringBuilder("Hello");

// Initialize with capacity (optimization)
StringBuilder sb = new StringBuilder(1000);

// Example: Group Anagrams - build frequency key
String buildKey(String s) {
    int[] freq = new int[26];
    for (char c : s.toCharArray()) {
        freq[c - 'a']++;
    }

    StringBuilder sb = new StringBuilder();
    for (int i = 0; i < 26; i++) {
        sb.append(freq[i]).append('#');
    }
    return sb.toString();
}

// Example: Reverse Words in a String
public String reverseWords(String s) {
    String[] words = s.trim().split("\\\\s+");
    StringBuilder sb = new StringBuilder();

    for (int i = words.length - 1; i >= 0; i--) {
        sb.append(words[i]);
        if (i > 0) sb.append(" ");
    }

    return sb.toString();
}

// Example: Build path string
StringBuilder path = new StringBuilder();
for (String dir : directories) {
    path.append("/").append(dir);
}`,
      python: `# Python strings are also immutable
# BAD - O(n²)
result = ""
for char in chars:
    result += char

# GOOD - O(n) using list and join
parts = []
for char in chars:
    parts.append(char)
result = "".join(parts)

# Even better - list comprehension
result = "".join([char for char in chars])

# Or generator (memory efficient)
result = "".join(char for char in chars)

# Common patterns
parts = []
parts.append("Hello")
parts.append(" ")
parts.append("World")
result = "".join(parts)  # "Hello World"

# Join with separator
words = ["Hello", "World"]
result = " ".join(words)   # "Hello World"
result = ", ".join(words)  # "Hello, World"
result = "".join(words)    # "HelloWorld"

# Reverse string
s = "hello"
reversed_s = s[::-1]  # "olleh"

# Build frequency key
def build_key(s):
    freq = [0] * 26
    for c in s:
        freq[ord(c) - ord('a')] += 1
    return tuple(freq)  # Use tuple as dict key

# f-strings for complex formatting (Python 3.6+)
name = "Alice"
age = 30
s = f"Name: {name}, Age: {age}"`,
      cpp: `#include <string>
#include <sstream>

// C++ strings are mutable, but += can still be slow
// Use reserve() or stringstream for many concatenations

// Using string with reserve
std::string result;
result.reserve(1000);  // Pre-allocate
for (char c : chars) {
    result += c;
}

// Using stringstream
std::stringstream ss;
ss << "Hello" << " " << "World" << 123;
std::string result = ss.str();

// Common operations
std::string s = "Hello";
s += " World";          // Append
s.append(" !");         // Append
s.insert(0, "Say: ");   // Insert at position
s.erase(0, 5);          // Erase range
s.replace(0, 5, "Hi");  // Replace range
std::reverse(s.begin(), s.end());  // Reverse

// Build with join (manual)
std::vector<std::string> words = {"Hello", "World"};
std::string result;
for (size_t i = 0; i < words.size(); i++) {
    if (i > 0) result += " ";
    result += words[i];
}`,
      javascript: `// JavaScript strings are immutable
// BAD - O(n²)
let result = "";
for (const char of chars) {
  result += char;
}

// GOOD - O(n) using array and join
const parts = [];
for (const char of chars) {
  parts.push(char);
}
const result = parts.join("");

// Even better - direct join
const result = chars.join("");

// Common patterns
const parts = [];
parts.push("Hello");
parts.push(" ");
parts.push("World");
const result = parts.join("");  // "Hello World"

// Join with separator
const words = ["Hello", "World"];
words.join(" ");   // "Hello World"
words.join(", ");  // "Hello, World"
words.join("");    // "HelloWorld"

// Template literals (ES6+)
const name = "Alice";
const age = 30;
const s = \`Name: \${name}, Age: \${age}\`;

// Reverse string
const reversed = str.split("").reverse().join("");

// Build frequency key
function buildKey(s) {
  const freq = new Array(26).fill(0);
  for (const c of s) {
    freq[c.charCodeAt(0) - 97]++;
  }
  return freq.join("#");
}`,
    },
    keyPoints: [
      "String + in loop is O(n²), StringBuilder is O(n)",
      "StringBuilder is mutable, String is immutable",
      "Use toString() to get final String",
      "Python: use list + join() instead of string concatenation",
      "JS - use array + join() for performance",
    ],
    commonMistakes: [
      "Using string concatenation in loops",
      "Forgetting to call toString() on StringBuilder",
      "Creating new StringBuilder inside loop instead of reusing",
      "In Python, forgetting that join() is a string method, not list method",
    ],
    relatedProblems: [
      "Group Anagrams",
      "Reverse Words in a String",
      "Serialize and Deserialize Binary Tree",
    ],
    relatedPatterns: ["arrays-strings"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "skip-duplicates-sorting",
    name: "Skip Duplicates via Sorting",
    slug: "skip-duplicates-sorting",
    category: "Arrays & Sorting",
    description:
      "Sorting brings duplicates together, making it easy to skip them with a simple comparison to the previous element. This technique is essential for problems like 3Sum that need unique combinations.",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(1)",
    whenToUse: [
      "Finding unique combinations (2Sum, 3Sum, 4Sum)",
      "Avoiding duplicate results in backtracking",
      "When order doesn't matter in the result",
      "Permutations/combinations with duplicates",
    ],
    codeSnippets: {
      java: `// Basic pattern: skip if same as previous
Arrays.sort(nums);
for (int i = 0; i < nums.length; i++) {
    // Skip duplicates
    if (i > 0 && nums[i] == nums[i - 1]) {
        continue;
    }
    // Process nums[i]
}

// 3Sum - skip duplicates at all levels
public List<List<Integer>> threeSum(int[] nums) {
    List<List<Integer>> result = new ArrayList<>();
    Arrays.sort(nums);

    for (int i = 0; i < nums.length - 2; i++) {
        // Skip duplicate for first element
        if (i > 0 && nums[i] == nums[i - 1]) continue;

        int target = -nums[i];
        int left = i + 1, right = nums.length - 1;

        while (left < right) {
            int sum = nums[left] + nums[right];

            if (sum == target) {
                result.add(Arrays.asList(nums[i], nums[left], nums[right]));
                left++;
                right--;

                // Skip duplicates for second element
                while (left < right && nums[left] == nums[left - 1]) {
                    left++;
                }
                // Skip duplicates for third element
                while (left < right && nums[right] == nums[right + 1]) {
                    right--;
                }
            } else if (sum < target) {
                left++;
            } else {
                right--;
            }
        }
    }

    return result;
}

// Permutations II - with duplicates
public List<List<Integer>> permuteUnique(int[] nums) {
    List<List<Integer>> result = new ArrayList<>();
    Arrays.sort(nums);
    boolean[] used = new boolean[nums.length];
    backtrack(nums, used, new ArrayList<>(), result);
    return result;
}

private void backtrack(int[] nums, boolean[] used,
                       List<Integer> current, List<List<Integer>> result) {
    if (current.size() == nums.length) {
        result.add(new ArrayList<>(current));
        return;
    }

    for (int i = 0; i < nums.length; i++) {
        // Skip if already used
        if (used[i]) continue;

        // Skip duplicates: if same as previous AND previous not used
        // (ensures we use duplicates in order)
        if (i > 0 && nums[i] == nums[i - 1] && !used[i - 1]) continue;

        used[i] = true;
        current.add(nums[i]);
        backtrack(nums, used, current, result);
        current.remove(current.size() - 1);
        used[i] = false;
    }
}

// Combination Sum II - no reuse, skip duplicates
public List<List<Integer>> combinationSum2(int[] candidates, int target) {
    List<List<Integer>> result = new ArrayList<>();
    Arrays.sort(candidates);
    backtrack(candidates, target, 0, new ArrayList<>(), result);
    return result;
}

private void backtrack(int[] candidates, int remaining, int start,
                       List<Integer> current, List<List<Integer>> result) {
    if (remaining == 0) {
        result.add(new ArrayList<>(current));
        return;
    }

    for (int i = start; i < candidates.length; i++) {
        if (candidates[i] > remaining) break;  // Optimization

        // Skip duplicates at same level
        if (i > start && candidates[i] == candidates[i - 1]) continue;

        current.add(candidates[i]);
        backtrack(candidates, remaining - candidates[i], i + 1, current, result);
        current.remove(current.size() - 1);
    }
}`,
      python: `# Basic pattern
nums.sort()
for i in range(len(nums)):
    if i > 0 and nums[i] == nums[i - 1]:
        continue
    # Process nums[i]

# 3Sum
def threeSum(nums):
    nums.sort()
    result = []

    for i in range(len(nums) - 2):
        if i > 0 and nums[i] == nums[i - 1]:
            continue

        left, right = i + 1, len(nums) - 1
        target = -nums[i]

        while left < right:
            total = nums[left] + nums[right]

            if total == target:
                result.append([nums[i], nums[left], nums[right]])
                left += 1
                right -= 1

                while left < right and nums[left] == nums[left - 1]:
                    left += 1
                while left < right and nums[right] == nums[right + 1]:
                    right -= 1
            elif total < target:
                left += 1
            else:
                right -= 1

    return result

# Permutations with duplicates
def permuteUnique(nums):
    nums.sort()
    result = []
    used = [False] * len(nums)

    def backtrack(current):
        if len(current) == len(nums):
            result.append(current[:])
            return

        for i in range(len(nums)):
            if used[i]:
                continue
            if i > 0 and nums[i] == nums[i - 1] and not used[i - 1]:
                continue

            used[i] = True
            current.append(nums[i])
            backtrack(current)
            current.pop()
            used[i] = False

    backtrack([])
    return result`,
      cpp: `// 3Sum
std::vector<std::vector<int>> threeSum(std::vector<int>& nums) {
    std::sort(nums.begin(), nums.end());
    std::vector<std::vector<int>> result;

    for (int i = 0; i < nums.size() - 2; i++) {
        if (i > 0 && nums[i] == nums[i - 1]) continue;

        int left = i + 1, right = nums.size() - 1;
        int target = -nums[i];

        while (left < right) {
            int sum = nums[left] + nums[right];

            if (sum == target) {
                result.push_back({nums[i], nums[left], nums[right]});
                left++;
                right--;

                while (left < right && nums[left] == nums[left - 1]) left++;
                while (left < right && nums[right] == nums[right + 1]) right--;
            } else if (sum < target) {
                left++;
            } else {
                right--;
            }
        }
    }

    return result;
}`,
      javascript: `// 3Sum
function threeSum(nums) {
  nums.sort((a, b) => a - b);
  const result = [];

  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;

    let left = i + 1, right = nums.length - 1;
    const target = -nums[i];

    while (left < right) {
      const sum = nums[left] + nums[right];

      if (sum === target) {
        result.push([nums[i], nums[left], nums[right]]);
        left++;
        right--;

        while (left < right && nums[left] === nums[left - 1]) left++;
        while (left < right && nums[right] === nums[right + 1]) right--;
      } else if (sum < target) {
        left++;
      } else {
        right--;
      }
    }
  }

  return result;
}

// Permutations with duplicates
function permuteUnique(nums) {
  nums.sort((a, b) => a - b);
  const result = [];
  const used = new Array(nums.length).fill(false);

  function backtrack(current) {
    if (current.length === nums.length) {
      result.push([...current]);
      return;
    }

    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      if (i > 0 && nums[i] === nums[i - 1] && !used[i - 1]) continue;

      used[i] = true;
      current.push(nums[i]);
      backtrack(current);
      current.pop();
      used[i] = false;
    }
  }

  backtrack([]);
  return result;
}`,
    },
    keyPoints: [
      "Sort first to bring duplicates together",
      "Skip if current == previous: if (i > 0 && nums[i] == nums[i-1]) continue",
      "For two pointers: skip duplicates for BOTH left and right",
      "In backtracking: i > start (not i > 0) for same-level duplicates",
      "Permutations: check !used[i-1] to use duplicates in order",
    ],
    commonMistakes: [
      "Forgetting to sort first",
      "Using i > 0 instead of i > start in combination problems",
      "Skipping only one side of two pointers",
      "Wrong condition in permutations (!used[i-1] vs used[i-1])",
    ],
    relatedProblems: [
      "3Sum",
      "4Sum",
      "Permutations II",
      "Combination Sum II",
      "Subsets II",
    ],
    relatedPatterns: ["two-pointers", "backtracking"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "comparator-overflow",
    name: "Comparator Overflow Safety",
    slug: "comparator-overflow",
    category: "Arrays & Sorting",
    description:
      "Using subtraction (a - b) in comparators can cause integer overflow for extreme values. Always use Integer.compare() or handle edge cases properly to avoid silent bugs.",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(log n)",
    whenToUse: [
      "Custom sorting with comparators",
      "PriorityQueue with custom ordering",
      "Any comparison involving integers that could be near Integer.MIN_VALUE or MAX_VALUE",
    ],
    codeSnippets: {
      java: `// DANGEROUS - can overflow!
Arrays.sort(arr, (a, b) -> a - b);

// Example of overflow:
// a = Integer.MAX_VALUE = 2147483647
// b = -1
// a - b = 2147483647 - (-1) = 2147483648 (OVERFLOW! becomes negative)

// SAFE - use Integer.compare()
Arrays.sort(arr, (a, b) -> Integer.compare(a, b));

// Or use Comparator methods
Arrays.sort(arr, Comparator.naturalOrder());           // Ascending
Arrays.sort(arr, Comparator.reverseOrder());           // Descending
Arrays.sort(arr, Comparator.comparingInt(x -> x));     // By int property

// For 2D arrays
int[][] intervals = {{1, 3}, {2, 4}};

// DANGEROUS
Arrays.sort(intervals, (a, b) -> a[0] - b[0]);

// SAFE
Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
Arrays.sort(intervals, Comparator.comparingInt(a -> a[0]));

// Multiple criteria - SAFE
Arrays.sort(arr, Comparator
    .comparingInt((int[] a) -> a[0])
    .thenComparingInt(a -> a[1]));

// For doubles
double[][] arr = {{1.5, 2.5}, {1.5, 1.5}};
Arrays.sort(arr, (a, b) -> Double.compare(a[0], b[0]));

// PriorityQueue - same issue
// DANGEROUS
PriorityQueue<Integer> pq = new PriorityQueue<>((a, b) -> a - b);

// SAFE
PriorityQueue<Integer> pq = new PriorityQueue<>();  // Natural order
PriorityQueue<Integer> pq = new PriorityQueue<>(Comparator.naturalOrder());
PriorityQueue<Integer> pq = new PriorityQueue<>((a, b) -> Integer.compare(a, b));

// For custom objects
class Interval {
    int start, end;
}
Arrays.sort(intervals, Comparator.comparingInt(i -> i.start));

// Why overflow happens:
// Integer.MAX_VALUE = 2147483647
// Integer.MIN_VALUE = -2147483648
// MAX - MIN = 2147483647 - (-2147483648) = overflow!
//
// The result wraps around to a negative number,
// making the comparator return wrong ordering.`,
      python: `# Python integers don't overflow, so subtraction is safe
arr.sort()  # Natural order
arr.sort(reverse=True)  # Descending
arr.sort(key=lambda x: x[0])  # By first element

# But for consistency and readability, prefer explicit comparison
# Using functools.cmp_to_key (when you need compare function)
from functools import cmp_to_key

def compare(a, b):
    if a < b:
        return -1
    elif a > b:
        return 1
    else:
        return 0

arr.sort(key=cmp_to_key(compare))

# Multiple criteria
intervals.sort(key=lambda x: (x[0], x[1]))

# Descending for first, ascending for second
intervals.sort(key=lambda x: (-x[0], x[1]))`,
      cpp: `#include <algorithm>
#include <functional>

// DANGEROUS - possible overflow
std::sort(arr.begin(), arr.end(), [](int a, int b) {
    return a - b < 0;  // Still wrong!
});

// SAFE - direct comparison
std::sort(arr.begin(), arr.end(), [](int a, int b) {
    return a < b;
});

// Or use std::less
std::sort(arr.begin(), arr.end(), std::less<int>());

// Descending
std::sort(arr.begin(), arr.end(), std::greater<int>());

// 2D array by first element
std::sort(intervals.begin(), intervals.end(), [](auto& a, auto& b) {
    return a[0] < b[0];
});

// Priority queue (max heap by default)
std::priority_queue<int> maxHeap;

// Min heap
std::priority_queue<int, std::vector<int>, std::greater<int>> minHeap;`,
      javascript: `// JavaScript numbers are floats, less likely to overflow
// But the same principle applies for very large numbers

// BETTER - explicit comparison
arr.sort((a, b) => {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
});

// Or for numbers (usually safe in JS)
arr.sort((a, b) => a - b);

// IMPORTANT: Default sort is lexicographic!
[10, 2, 1].sort();  // [1, 10, 2] - WRONG!
[10, 2, 1].sort((a, b) => a - b);  // [1, 2, 10] - Correct

// 2D array
intervals.sort((a, b) => a[0] - b[0]);

// Multiple criteria
intervals.sort((a, b) => {
  if (a[0] !== b[0]) return a[0] - b[0];
  return a[1] - b[1];
});`,
    },
    keyPoints: [
      "a - b overflows when a and b have opposite signs with extreme values",
      "Integer.compare(a, b) is always safe",
      "Comparator.comparingInt() is clean and safe",
      "Double.compare() handles NaN and -0.0 correctly",
      "JavaScript default sort is lexicographic - always provide comparator for numbers",
    ],
    commonMistakes: [
      "Using a - b with potentially large integers",
      "Forgetting that Integer.MAX_VALUE - negative = overflow",
      "JS - forgetting comparator for numeric sort",
      "Not considering Long overflow when sorting longs",
    ],
    relatedProblems: [
      "Merge Intervals",
      "Meeting Rooms",
      "Top K Frequent Elements",
    ],
    relatedPatterns: ["intervals", "heap"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "modular-arithmetic",
    name: "Modular Arithmetic",
    slug: "modular-arithmetic",
    category: "Type Conversions & Math",
    description:
      "Many problems require returning results modulo 10^9+7 to prevent overflow. Understanding modular arithmetic rules and handling negative remainders is essential.",
    timeComplexity: "O(1)",
    spaceComplexity: "O(1)",
    whenToUse: [
      "Problems asking for result modulo 10^9+7",
      "Counting problems with large results",
      "Dynamic programming with large numbers",
      "Combinatorics problems",
    ],
    codeSnippets: {
      java: `// Common modulo value
static final int MOD = 1_000_000_007;  // 10^9 + 7

// Basic modular arithmetic
// (a + b) % MOD
// (a - b) % MOD  // Can be negative!
// (a * b) % MOD
// (a / b) % MOD  // Requires modular inverse (not simple division!)

// Addition
long sum = ((long)a + b) % MOD;

// Subtraction (handle negative)
// Java % can return negative for negative numbers!
long diff = ((a - b) % MOD + MOD) % MOD;

// Multiplication (cast to long first!)
long product = ((long)a * b) % MOD;

// Power (for modular inverse)
// Fermat's little theorem: a^(p-1) ≡ 1 (mod p) when p is prime
// So: a^(-1) ≡ a^(p-2) (mod p)
long modPow(long base, long exp, long mod) {
    long result = 1;
    base %= mod;
    while (exp > 0) {
        if ((exp & 1) == 1) {
            result = (result * base) % mod;
        }
        exp >>= 1;
        base = (base * base) % mod;
    }
    return result;
}

// Division (multiply by modular inverse)
// a / b ≡ a * b^(-1) ≡ a * b^(MOD-2) (mod MOD)
long modDivide(long a, long b, long mod) {
    return (a * modPow(b, mod - 2, mod)) % mod;
}

// Example: Count paths with MOD
public int countPaths(int[][] grid) {
    int m = grid.length, n = grid[0].length;
    long[][] dp = new long[m][n];
    dp[0][0] = 1;

    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            if (i > 0) dp[i][j] = (dp[i][j] + dp[i-1][j]) % MOD;
            if (j > 0) dp[i][j] = (dp[i][j] + dp[i][j-1]) % MOD;
        }
    }

    return (int)dp[m-1][n-1];
}

// Example: Subarray sum divisible by K
// Handles negative remainders
public int subarraysDivByK(int[] nums, int k) {
    Map<Integer, Integer> remainderCount = new HashMap<>();
    remainderCount.put(0, 1);

    int sum = 0, count = 0;
    for (int num : nums) {
        sum += num;
        // Handle negative remainder
        int remainder = ((sum % k) + k) % k;
        count += remainderCount.getOrDefault(remainder, 0);
        remainderCount.merge(remainder, 1, Integer::sum);
    }

    return count;
}`,
      python: `MOD = 10**9 + 7

# Python's % always returns non-negative for positive divisor
# So (-5) % 3 = 1 in Python (unlike Java where it's -2)

# Addition
result = (a + b) % MOD

# Subtraction (safe in Python)
result = (a - b) % MOD

# Multiplication
result = (a * b) % MOD

# Power with mod
result = pow(base, exp, MOD)  # Built-in and efficient!

# Division (modular inverse)
# a / b ≡ a * b^(-1) ≡ a * pow(b, MOD-2, MOD)
def mod_divide(a, b, mod=MOD):
    return (a * pow(b, mod - 2, mod)) % mod

# Example: Count paths
def countPaths(grid):
    m, n = len(grid), len(grid[0])
    dp = [[0] * n for _ in range(m)]
    dp[0][0] = 1

    for i in range(m):
        for j in range(n):
            if i > 0:
                dp[i][j] = (dp[i][j] + dp[i-1][j]) % MOD
            if j > 0:
                dp[i][j] = (dp[i][j] + dp[i][j-1]) % MOD

    return dp[m-1][n-1]

# Combinations with MOD (using factorial)
def nCr(n, r, mod=MOD):
    if r > n:
        return 0

    # Precompute factorials
    fact = [1] * (n + 1)
    for i in range(1, n + 1):
        fact[i] = fact[i-1] * i % mod

    # nCr = n! / (r! * (n-r)!)
    return fact[n] * pow(fact[r], mod-2, mod) % mod * pow(fact[n-r], mod-2, mod) % mod`,
      cpp: `const int MOD = 1e9 + 7;

// C++ % can be negative for negative numbers
// Safe formula: ((a % MOD) + MOD) % MOD

// Power with mod
long long modPow(long long base, long long exp, long long mod) {
    long long result = 1;
    base %= mod;
    while (exp > 0) {
        if (exp & 1) result = result * base % mod;
        exp >>= 1;
        base = base * base % mod;
    }
    return result;
}

// Modular inverse
long long modInverse(long long a, long long mod) {
    return modPow(a, mod - 2, mod);
}

// Addition
long long sum = ((long long)a + b) % MOD;

// Subtraction (safe)
long long diff = ((a - b) % MOD + MOD) % MOD;

// Multiplication
long long product = (1LL * a * b) % MOD;`,
      javascript: `const MOD = 1e9 + 7;

// JavaScript % can be negative
// Safe formula: ((a % MOD) + MOD) % MOD

// Note: JavaScript numbers are floats (53-bit precision)
// For very large numbers, use BigInt

// Addition
const sum = ((a % MOD) + (b % MOD)) % MOD;

// Subtraction (safe)
const diff = (((a - b) % MOD) + MOD) % MOD;

// Multiplication (watch for precision loss)
const product = ((a % MOD) * (b % MOD)) % MOD;

// Power with mod
function modPow(base, exp, mod) {
  let result = 1n;
  base = BigInt(base) % BigInt(mod);
  exp = BigInt(exp);
  mod = BigInt(mod);

  while (exp > 0n) {
    if (exp & 1n) result = (result * base) % mod;
    exp >>= 1n;
    base = (base * base) % mod;
  }

  return Number(result);
}`,
    },
    keyPoints: [
      "MOD = 10^9 + 7 is prime (enables Fermat's little theorem)",
      "Java/C++ % can return negative - use ((x % MOD) + MOD) % MOD",
      "Python % always returns non-negative for positive divisor",
      "Cast to long BEFORE multiplication to avoid overflow",
      "Division requires modular inverse: a/b = a * b^(MOD-2)",
    ],
    commonMistakes: [
      "Forgetting to cast to long before multiplying",
      "Not handling negative remainders in Java/C++",
      "Using regular division instead of modular inverse",
      "Applying MOD after overflow (too late!)",
    ],
    relatedProblems: [
      "Unique Paths",
      "Count Vowels Permutation",
      "Knight Probability in Chessboard",
      "Subarray Sums Divisible by K",
    ],
    relatedPatterns: ["dynamic-programming"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "dummy-node-pattern",
    name: "Dummy Node Pattern",
    slug: "dummy-node-pattern",
    category: "Algorithm Idioms",
    description:
      "A dummy node (sentinel node) is a placeholder node at the beginning of a linked list. It simplifies edge cases where the head might change, eliminating special-case code for empty lists or head modifications.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    whenToUse: [
      "When the head of the list might change",
      "Merging or inserting at the beginning",
      "Removing nodes (including potentially the head)",
      "Building a new list from scratch",
    ],
    codeSnippets: {
      java: `// Without dummy node - need special cases
public ListNode removeElements(ListNode head, int val) {
    // Special case: remove from head
    while (head != null && head.val == val) {
        head = head.next;
    }

    ListNode curr = head;
    while (curr != null && curr.next != null) {
        if (curr.next.val == val) {
            curr.next = curr.next.next;
        } else {
            curr = curr.next;
        }
    }
    return head;
}

// With dummy node - clean and uniform
public ListNode removeElements(ListNode head, int val) {
    ListNode dummy = new ListNode(-1);
    dummy.next = head;

    ListNode curr = dummy;
    while (curr.next != null) {
        if (curr.next.val == val) {
            curr.next = curr.next.next;
        } else {
            curr = curr.next;
        }
    }

    return dummy.next;
}

// Merge Two Sorted Lists
public ListNode mergeTwoLists(ListNode l1, ListNode l2) {
    ListNode dummy = new ListNode(-1);
    ListNode curr = dummy;

    while (l1 != null && l2 != null) {
        if (l1.val <= l2.val) {
            curr.next = l1;
            l1 = l1.next;
        } else {
            curr.next = l2;
            l2 = l2.next;
        }
        curr = curr.next;
    }

    curr.next = (l1 != null) ? l1 : l2;

    return dummy.next;
}

// Add Two Numbers
public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
    ListNode dummy = new ListNode(-1);
    ListNode curr = dummy;
    int carry = 0;

    while (l1 != null || l2 != null || carry != 0) {
        int sum = carry;
        if (l1 != null) {
            sum += l1.val;
            l1 = l1.next;
        }
        if (l2 != null) {
            sum += l2.val;
            l2 = l2.next;
        }

        curr.next = new ListNode(sum % 10);
        carry = sum / 10;
        curr = curr.next;
    }

    return dummy.next;
}

// Partition List
public ListNode partition(ListNode head, int x) {
    ListNode lessHead = new ListNode(-1);
    ListNode greaterHead = new ListNode(-1);
    ListNode less = lessHead;
    ListNode greater = greaterHead;

    while (head != null) {
        if (head.val < x) {
            less.next = head;
            less = less.next;
        } else {
            greater.next = head;
            greater = greater.next;
        }
        head = head.next;
    }

    greater.next = null;  // Important: terminate the list
    less.next = greaterHead.next;

    return lessHead.next;
}`,
      python: `# Without dummy node
def removeElements(head, val):
    while head and head.val == val:
        head = head.next

    curr = head
    while curr and curr.next:
        if curr.next.val == val:
            curr.next = curr.next.next
        else:
            curr = curr.next

    return head

# With dummy node
def removeElements(head, val):
    dummy = ListNode(-1)
    dummy.next = head

    curr = dummy
    while curr.next:
        if curr.next.val == val:
            curr.next = curr.next.next
        else:
            curr = curr.next

    return dummy.next

# Merge Two Sorted Lists
def mergeTwoLists(l1, l2):
    dummy = ListNode(-1)
    curr = dummy

    while l1 and l2:
        if l1.val <= l2.val:
            curr.next = l1
            l1 = l1.next
        else:
            curr.next = l2
            l2 = l2.next
        curr = curr.next

    curr.next = l1 or l2

    return dummy.next

# Add Two Numbers
def addTwoNumbers(l1, l2):
    dummy = ListNode(-1)
    curr = dummy
    carry = 0

    while l1 or l2 or carry:
        val = carry
        if l1:
            val += l1.val
            l1 = l1.next
        if l2:
            val += l2.val
            l2 = l2.next

        curr.next = ListNode(val % 10)
        carry = val // 10
        curr = curr.next

    return dummy.next`,
      cpp: `// Merge Two Sorted Lists
ListNode* mergeTwoLists(ListNode* l1, ListNode* l2) {
    ListNode dummy(-1);
    ListNode* curr = &dummy;

    while (l1 && l2) {
        if (l1->val <= l2->val) {
            curr->next = l1;
            l1 = l1->next;
        } else {
            curr->next = l2;
            l2 = l2->next;
        }
        curr = curr->next;
    }

    curr->next = l1 ? l1 : l2;

    return dummy.next;
}`,
      javascript: `// With dummy node
function removeElements(head, val) {
  const dummy = new ListNode(-1);
  dummy.next = head;

  let curr = dummy;
  while (curr.next) {
    if (curr.next.val === val) {
      curr.next = curr.next.next;
    } else {
      curr = curr.next;
    }
  }

  return dummy.next;
}

// Merge Two Sorted Lists
function mergeTwoLists(l1, l2) {
  const dummy = new ListNode(-1);
  let curr = dummy;

  while (l1 && l2) {
    if (l1.val <= l2.val) {
      curr.next = l1;
      l1 = l1.next;
    } else {
      curr.next = l2;
      l2 = l2.next;
    }
    curr = curr.next;
  }

  curr.next = l1 || l2;

  return dummy.next;
}`,
    },
    keyPoints: [
      "Create dummy with any value (commonly -1 or 0)",
      "Point dummy.next to head",
      "Return dummy.next as the new head",
      "Eliminates special cases for head modification",
      "curr starts at dummy (not head) when building/modifying",
    ],
    commonMistakes: [
      "Returning dummy instead of dummy.next",
      "Starting curr at head instead of dummy",
      "Not terminating lists properly (e.g., greater.next = null in partition)",
      "Forgetting to handle the case when one list is exhausted",
    ],
    relatedProblems: [
      "Merge Two Sorted Lists",
      "Remove Linked List Elements",
      "Add Two Numbers",
      "Partition List",
      "Remove Nth Node From End",
    ],
    relatedPatterns: ["linked-list"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "bfs-visited-marking",
    name: "BFS Visited Marking",
    slug: "bfs-visited-marking",
    category: "Algorithm Idioms",
    description:
      "In BFS, mark nodes as visited BEFORE adding to the queue, not after removing. This prevents the same node from being added multiple times, which can cause TLE or incorrect results.",
    timeComplexity: "O(V + E)",
    spaceComplexity: "O(V)",
    whenToUse: [
      "Any BFS traversal (graphs, trees, grids)",
      "Shortest path in unweighted graphs",
      "Level-order traversal",
      "Multi-source BFS",
    ],
    codeSnippets: {
      java: `// WRONG - Mark visited after removing from queue
// Same node can be added multiple times!
public int bfsWrong(int[][] grid) {
    Queue<int[]> queue = new LinkedList<>();
    boolean[][] visited = new boolean[m][n];

    queue.offer(new int[]{0, 0});

    while (!queue.isEmpty()) {
        int[] curr = queue.poll();
        int r = curr[0], c = curr[1];

        if (visited[r][c]) continue;  // Too late! Already in queue multiple times
        visited[r][c] = true;

        for (int[] dir : directions) {
            int nr = r + dir[0], nc = c + dir[1];
            if (isValid(nr, nc) && !visited[nr][nc]) {
                queue.offer(new int[]{nr, nc});  // May add same cell multiple times
            }
        }
    }
}

// CORRECT - Mark visited BEFORE adding to queue
public int bfsCorrect(int[][] grid) {
    Queue<int[]> queue = new LinkedList<>();
    boolean[][] visited = new boolean[m][n];
    int[][] directions = {{0, 1}, {0, -1}, {1, 0}, {-1, 0}};

    queue.offer(new int[]{0, 0});
    visited[0][0] = true;  // Mark start as visited

    while (!queue.isEmpty()) {
        int[] curr = queue.poll();
        int r = curr[0], c = curr[1];

        for (int[] dir : directions) {
            int nr = r + dir[0], nc = c + dir[1];
            if (nr >= 0 && nr < m && nc >= 0 && nc < n &&
                !visited[nr][nc] && grid[nr][nc] == 0) {

                visited[nr][nc] = true;  // Mark BEFORE adding
                queue.offer(new int[]{nr, nc});
            }
        }
    }
}

// Shortest Path in Binary Matrix
public int shortestPathBinaryMatrix(int[][] grid) {
    int n = grid.length;
    if (grid[0][0] == 1 || grid[n-1][n-1] == 1) return -1;

    int[][] directions = {
        {0, 1}, {0, -1}, {1, 0}, {-1, 0},
        {1, 1}, {1, -1}, {-1, 1}, {-1, -1}
    };

    Queue<int[]> queue = new LinkedList<>();
    queue.offer(new int[]{0, 0});
    grid[0][0] = 1;  // Mark visited (modify grid)
    int steps = 1;

    while (!queue.isEmpty()) {
        int size = queue.size();

        for (int i = 0; i < size; i++) {
            int[] curr = queue.poll();
            int r = curr[0], c = curr[1];

            if (r == n - 1 && c == n - 1) return steps;

            for (int[] dir : directions) {
                int nr = r + dir[0], nc = c + dir[1];
                if (nr >= 0 && nr < n && nc >= 0 && nc < n && grid[nr][nc] == 0) {
                    grid[nr][nc] = 1;  // Mark BEFORE adding
                    queue.offer(new int[]{nr, nc});
                }
            }
        }

        steps++;
    }

    return -1;
}

// Multi-source BFS (e.g., Rotting Oranges)
public int orangesRotting(int[][] grid) {
    int m = grid.length, n = grid[0].length;
    Queue<int[]> queue = new LinkedList<>();
    int fresh = 0;

    // Add all rotten oranges to queue (multi-source)
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            if (grid[i][j] == 2) {
                queue.offer(new int[]{i, j});
            } else if (grid[i][j] == 1) {
                fresh++;
            }
        }
    }

    if (fresh == 0) return 0;

    int[][] directions = {{0, 1}, {0, -1}, {1, 0}, {-1, 0}};
    int minutes = 0;

    while (!queue.isEmpty()) {
        int size = queue.size();
        boolean rotted = false;

        for (int i = 0; i < size; i++) {
            int[] curr = queue.poll();
            int r = curr[0], c = curr[1];

            for (int[] dir : directions) {
                int nr = r + dir[0], nc = c + dir[1];
                if (nr >= 0 && nr < m && nc >= 0 && nc < n && grid[nr][nc] == 1) {
                    grid[nr][nc] = 2;  // Mark BEFORE adding
                    queue.offer(new int[]{nr, nc});
                    fresh--;
                    rotted = true;
                }
            }
        }

        if (rotted) minutes++;
    }

    return fresh == 0 ? minutes : -1;
}`,
      python: `from collections import deque

# CORRECT - Mark visited BEFORE adding
def bfs(grid):
    m, n = len(grid), len(grid[0])
    queue = deque([(0, 0)])
    visited = {(0, 0)}  # Mark start as visited
    directions = [(0, 1), (0, -1), (1, 0), (-1, 0)]

    while queue:
        r, c = queue.popleft()

        for dr, dc in directions:
            nr, nc = r + dr, c + dc
            if 0 <= nr < m and 0 <= nc < n and (nr, nc) not in visited:
                visited.add((nr, nc))  # Mark BEFORE adding
                queue.append((nr, nc))

# Shortest Path in Binary Matrix
def shortestPathBinaryMatrix(grid):
    n = len(grid)
    if grid[0][0] == 1 or grid[n-1][n-1] == 1:
        return -1

    directions = [(0,1), (0,-1), (1,0), (-1,0),
                  (1,1), (1,-1), (-1,1), (-1,-1)]

    queue = deque([(0, 0, 1)])  # (r, c, steps)
    visited = {(0, 0)}

    while queue:
        r, c, steps = queue.popleft()

        if r == n - 1 and c == n - 1:
            return steps

        for dr, dc in directions:
            nr, nc = r + dr, c + dc
            if 0 <= nr < n and 0 <= nc < n and \\
               (nr, nc) not in visited and grid[nr][nc] == 0:
                visited.add((nr, nc))
                queue.append((nr, nc, steps + 1))

    return -1

# Multi-source BFS
def orangesRotting(grid):
    m, n = len(grid), len(grid[0])
    queue = deque()
    fresh = 0

    for i in range(m):
        for j in range(n):
            if grid[i][j] == 2:
                queue.append((i, j))
            elif grid[i][j] == 1:
                fresh += 1

    if fresh == 0:
        return 0

    directions = [(0, 1), (0, -1), (1, 0), (-1, 0)]
    minutes = 0

    while queue:
        rotted = False
        for _ in range(len(queue)):
            r, c = queue.popleft()
            for dr, dc in directions:
                nr, nc = r + dr, c + dc
                if 0 <= nr < m and 0 <= nc < n and grid[nr][nc] == 1:
                    grid[nr][nc] = 2  # Mark BEFORE adding
                    queue.append((nr, nc))
                    fresh -= 1
                    rotted = True

        if rotted:
            minutes += 1

    return minutes if fresh == 0 else -1`,
      cpp: `#include <queue>
#include <vector>

// Shortest Path in Binary Matrix
int shortestPathBinaryMatrix(std::vector<std::vector<int>>& grid) {
    int n = grid.size();
    if (grid[0][0] == 1 || grid[n-1][n-1] == 1) return -1;

    std::vector<std::pair<int,int>> dirs = {
        {0,1}, {0,-1}, {1,0}, {-1,0},
        {1,1}, {1,-1}, {-1,1}, {-1,-1}
    };

    std::queue<std::pair<int,int>> q;
    q.push({0, 0});
    grid[0][0] = 1;  // Mark visited
    int steps = 1;

    while (!q.empty()) {
        int size = q.size();
        for (int i = 0; i < size; i++) {
            auto [r, c] = q.front();
            q.pop();

            if (r == n-1 && c == n-1) return steps;

            for (auto [dr, dc] : dirs) {
                int nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < n && nc >= 0 && nc < n && grid[nr][nc] == 0) {
                    grid[nr][nc] = 1;  // Mark BEFORE adding
                    q.push({nr, nc});
                }
            }
        }
        steps++;
    }

    return -1;
}`,
      javascript: `// CORRECT - Mark visited BEFORE adding
function bfs(grid) {
  const m = grid.length, n = grid[0].length;
  const queue = [[0, 0]];
  const visited = new Set(['0,0']);
  const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

  while (queue.length) {
    const [r, c] = queue.shift();

    for (const [dr, dc] of directions) {
      const nr = r + dr, nc = c + dc;
      const key = \`\${nr},\${nc}\`;

      if (nr >= 0 && nr < m && nc >= 0 && nc < n && !visited.has(key)) {
        visited.add(key);  // Mark BEFORE adding
        queue.push([nr, nc]);
      }
    }
  }
}

// Shortest Path in Binary Matrix
function shortestPathBinaryMatrix(grid) {
  const n = grid.length;
  if (grid[0][0] === 1 || grid[n-1][n-1] === 1) return -1;

  const directions = [
    [0, 1], [0, -1], [1, 0], [-1, 0],
    [1, 1], [1, -1], [-1, 1], [-1, -1]
  ];

  const queue = [[0, 0, 1]];
  grid[0][0] = 1;

  while (queue.length) {
    const [r, c, steps] = queue.shift();

    if (r === n - 1 && c === n - 1) return steps;

    for (const [dr, dc] of directions) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < n && nc >= 0 && nc < n && grid[nr][nc] === 0) {
        grid[nr][nc] = 1;  // Mark BEFORE adding
        queue.push([nr, nc, steps + 1]);
      }
    }
  }

  return -1;
}`,
    },
    keyPoints: [
      "Mark visited BEFORE queue.offer(), not after queue.poll()",
      "For grid problems, can modify grid itself as visited marker",
      "Multi-source BFS: add all sources to queue initially",
      "Track steps by processing level-by-level (queue.size())",
      "Use Set with string key for coordinate-based visited in JS",
    ],
    commonMistakes: [
      "Marking visited after polling (same node added multiple times)",
      "Forgetting to mark start position as visited",
      "Not processing by levels when counting steps",
      "Using array index for directions instead of direction values",
    ],
    relatedProblems: [
      "Shortest Path in Binary Matrix",
      "Rotting Oranges",
      "01 Matrix",
      "Word Ladder",
      "Number of Islands",
    ],
    relatedPatterns: ["graphs"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "four-directional-movement",
    name: "4-Directional Grid Movement",
    slug: "four-directional-movement",
    category: "Algorithm Idioms",
    description:
      "A clean pattern for moving in 4 directions (up, down, left, right) on a grid. Using a directions array makes code cleaner and easier to extend to 8 directions.",
    timeComplexity: "O(m × n)",
    spaceComplexity: "O(m × n)",
    whenToUse: [
      "Grid traversal problems",
      "Flood fill",
      "Number of Islands",
      "Shortest path in grid",
      "Any problem requiring adjacent cell visits",
    ],
    codeSnippets: {
      java: `// 4 directions: right, left, down, up
int[][] directions = {{0, 1}, {0, -1}, {1, 0}, {-1, 0}};

// 8 directions (including diagonals)
int[][] directions = {
    {0, 1}, {0, -1}, {1, 0}, {-1, 0},
    {1, 1}, {1, -1}, {-1, 1}, {-1, -1}
};

// Usage pattern
for (int[] dir : directions) {
    int newRow = row + dir[0];
    int newCol = col + dir[1];

    // Bounds check
    if (newRow >= 0 && newRow < m && newCol >= 0 && newCol < n) {
        // Process grid[newRow][newCol]
    }
}

// Number of Islands
public int numIslands(char[][] grid) {
    int m = grid.length, n = grid[0].length;
    int count = 0;

    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            if (grid[i][j] == '1') {
                dfs(grid, i, j);
                count++;
            }
        }
    }

    return count;
}

private void dfs(char[][] grid, int r, int c) {
    int m = grid.length, n = grid[0].length;

    if (r < 0 || r >= m || c < 0 || c >= n || grid[r][c] != '1') {
        return;
    }

    grid[r][c] = '0';  // Mark visited

    int[][] directions = {{0, 1}, {0, -1}, {1, 0}, {-1, 0}};
    for (int[] dir : directions) {
        dfs(grid, r + dir[0], c + dir[1]);
    }
}

// Alternative: direct recursion calls (less flexible)
private void dfsDirect(char[][] grid, int r, int c) {
    if (r < 0 || r >= m || c < 0 || c >= n || grid[r][c] != '1') return;
    grid[r][c] = '0';
    dfs(grid, r + 1, c);
    dfs(grid, r - 1, c);
    dfs(grid, r, c + 1);
    dfs(grid, r, c - 1);
}

// Flood Fill
public int[][] floodFill(int[][] image, int sr, int sc, int color) {
    int originalColor = image[sr][sc];
    if (originalColor != color) {
        dfs(image, sr, sc, originalColor, color);
    }
    return image;
}

private void dfs(int[][] image, int r, int c, int originalColor, int newColor) {
    int m = image.length, n = image[0].length;

    if (r < 0 || r >= m || c < 0 || c >= n || image[r][c] != originalColor) {
        return;
    }

    image[r][c] = newColor;

    int[][] directions = {{0, 1}, {0, -1}, {1, 0}, {-1, 0}};
    for (int[] dir : directions) {
        dfs(image, r + dir[0], c + dir[1], originalColor, newColor);
    }
}`,
      python: `# 4 directions
directions = [(0, 1), (0, -1), (1, 0), (-1, 0)]

# 8 directions
directions = [
    (0, 1), (0, -1), (1, 0), (-1, 0),
    (1, 1), (1, -1), (-1, 1), (-1, -1)
]

# Usage pattern
for dr, dc in directions:
    nr, nc = r + dr, c + dc
    if 0 <= nr < m and 0 <= nc < n:
        # Process grid[nr][nc]
        pass

# Number of Islands
def numIslands(grid):
    if not grid:
        return 0

    m, n = len(grid), len(grid[0])
    count = 0

    def dfs(r, c):
        if r < 0 or r >= m or c < 0 or c >= n or grid[r][c] != '1':
            return
        grid[r][c] = '0'  # Mark visited
        for dr, dc in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
            dfs(r + dr, c + dc)

    for i in range(m):
        for j in range(n):
            if grid[i][j] == '1':
                dfs(i, j)
                count += 1

    return count

# Flood Fill
def floodFill(image, sr, sc, color):
    original = image[sr][sc]
    if original == color:
        return image

    m, n = len(image), len(image[0])

    def dfs(r, c):
        if r < 0 or r >= m or c < 0 or c >= n or image[r][c] != original:
            return
        image[r][c] = color
        for dr, dc in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
            dfs(r + dr, c + dc)

    dfs(sr, sc)
    return image`,
      cpp: `#include <vector>

// 4 directions
std::vector<std::pair<int, int>> directions = {{0, 1}, {0, -1}, {1, 0}, {-1, 0}};

// Or as arrays
int dr[] = {0, 0, 1, -1};
int dc[] = {1, -1, 0, 0};

// Usage
for (int i = 0; i < 4; i++) {
    int nr = r + dr[i];
    int nc = c + dc[i];
    if (nr >= 0 && nr < m && nc >= 0 && nc < n) {
        // Process
    }
}

// Number of Islands
int numIslands(std::vector<std::vector<char>>& grid) {
    int m = grid.size(), n = grid[0].size();
    int count = 0;

    std::function<void(int, int)> dfs = [&](int r, int c) {
        if (r < 0 || r >= m || c < 0 || c >= n || grid[r][c] != '1') return;
        grid[r][c] = '0';
        for (auto [dr, dc] : directions) {
            dfs(r + dr, c + dc);
        }
    };

    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            if (grid[i][j] == '1') {
                dfs(i, j);
                count++;
            }
        }
    }

    return count;
}`,
      javascript: `// 4 directions
const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

// 8 directions
const directions8 = [
  [0, 1], [0, -1], [1, 0], [-1, 0],
  [1, 1], [1, -1], [-1, 1], [-1, -1]
];

// Usage pattern
for (const [dr, dc] of directions) {
  const nr = r + dr, nc = c + dc;
  if (nr >= 0 && nr < m && nc >= 0 && nc < n) {
    // Process grid[nr][nc]
  }
}

// Number of Islands
function numIslands(grid) {
  const m = grid.length, n = grid[0].length;
  let count = 0;

  function dfs(r, c) {
    if (r < 0 || r >= m || c < 0 || c >= n || grid[r][c] !== '1') return;
    grid[r][c] = '0';  // Mark visited
    for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      dfs(r + dr, c + dc);
    }
  }

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (grid[i][j] === '1') {
        dfs(i, j);
        count++;
      }
    }
  }

  return count;
}`,
    },
    keyPoints: [
      "directions array makes code cleaner and extensible",
      "Always check bounds: 0 <= r < m && 0 <= c < n",
      "Can modify grid to mark visited (set to '0', -1, etc.)",
      "For 8 directions, add 4 diagonal pairs",
      "Consider extracting bounds check to helper: isValid(r, c)",
    ],
    commonMistakes: [
      "Swapping row/col in bounds check",
      "Off-by-one: using > instead of >= in bounds check",
      "Not marking visited, causing infinite recursion",
      "Using wrong direction values (confusing row/col)",
    ],
    relatedProblems: [
      "Number of Islands",
      "Flood Fill",
      "Surrounded-md Regions",
      "Pacific Atlantic Water Flow",
      "Walls and Gates",
    ],
    relatedPatterns: ["graphs"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "binary-search-boundaries",
    name: "Binary Search Boundaries",
    slug: "binary-search-boundaries",
    category: "Algorithm Idioms",
    description:
      "Understanding when to use 'left < right' vs 'left <= right' and how to update boundaries correctly is crucial for binary search. The choice depends on whether you're finding an exact match or a boundary.",
    timeComplexity: "O(log n)",
    spaceComplexity: "O(1)",
    whenToUse: [
      "Searching for exact value in sorted array",
      "Finding first/last occurrence",
      "Finding insertion point (lower/upper bound)",
      "Binary search on answer (minimize/maximize)",
    ],
    codeSnippets: {
      java: `// Pattern 1: Find exact match
// Use: left <= right, return mid when found
public int binarySearch(int[] nums, int target) {
    int left = 0, right = nums.length - 1;

    while (left <= right) {
        int mid = left + (right - left) / 2;  // Avoid overflow

        if (nums[mid] == target) {
            return mid;  // Found
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    return -1;  // Not found
}

// Pattern 2: Find leftmost (first occurrence / lower bound)
// Use: left < right, shrink right to mid
public int findFirst(int[] nums, int target) {
    int left = 0, right = nums.length;  // Note: right = length

    while (left < right) {
        int mid = left + (right - left) / 2;

        if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid;  // Don't skip mid, it could be the answer
        }
    }

    // left is the insertion point (first element >= target)
    return (left < nums.length && nums[left] == target) ? left : -1;
}

// Pattern 3: Find rightmost (last occurrence)
// Use: left < right, shrink left to mid + 1
public int findLast(int[] nums, int target) {
    int left = 0, right = nums.length;

    while (left < right) {
        int mid = left + (right - left + 1) / 2;  // Bias to right

        if (nums[mid] > target) {
            right = mid - 1;
        } else {
            left = mid;  // Don't skip mid
        }
    }

    return (left < nums.length && nums[left] == target) ? left : -1;
}

// Pattern 4: Binary search on answer (minimize)
// Find minimum value that satisfies condition
public int minValid(int[] nums) {
    int left = minPossible, right = maxPossible;

    while (left < right) {
        int mid = left + (right - left) / 2;

        if (isValid(mid)) {
            right = mid;  // mid works, try smaller
        } else {
            left = mid + 1;  // mid doesn't work, try larger
        }
    }

    return left;  // First valid value
}

// Example: Koko Eating Bananas
public int minEatingSpeed(int[] piles, int h) {
    int left = 1;
    int right = Arrays.stream(piles).max().getAsInt();

    while (left < right) {
        int mid = left + (right - left) / 2;
        int hours = 0;
        for (int pile : piles) {
            hours += (pile + mid - 1) / mid;  // Ceiling division
        }

        if (hours <= h) {
            right = mid;  // Can finish, try slower speed
        } else {
            left = mid + 1;  // Too slow, need faster
        }
    }

    return left;
}

// Example: Search in Rotated Sorted Array
public int search(int[] nums, int target) {
    int left = 0, right = nums.length - 1;

    while (left <= right) {
        int mid = left + (right - left) / 2;

        if (nums[mid] == target) return mid;

        // Check which half is sorted
        if (nums[left] <= nums[mid]) {
            // Left half is sorted
            if (nums[left] <= target && target < nums[mid]) {
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        } else {
            // Right half is sorted
            if (nums[mid] < target && target <= nums[right]) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
    }

    return -1;
}`,
      python: `# Pattern 1: Find exact match
def binary_search(nums, target):
    left, right = 0, len(nums) - 1

    while left <= right:
        mid = (left + right) // 2

        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1

    return -1

# Pattern 2: Find leftmost (bisect_left)
def find_first(nums, target):
    left, right = 0, len(nums)

    while left < right:
        mid = (left + right) // 2

        if nums[mid] < target:
            left = mid + 1
        else:
            right = mid

    return left if left < len(nums) and nums[left] == target else -1

# Using bisect module
import bisect
def find_first_bisect(nums, target):
    idx = bisect.bisect_left(nums, target)
    return idx if idx < len(nums) and nums[idx] == target else -1

# Pattern 3: Find rightmost
def find_last(nums, target):
    left, right = 0, len(nums)

    while left < right:
        mid = (left + right) // 2

        if nums[mid] <= target:
            left = mid + 1
        else:
            right = mid

    return left - 1 if left > 0 and nums[left - 1] == target else -1

# Pattern 4: Binary search on answer
def min_eating_speed(piles, h):
    left, right = 1, max(piles)

    while left < right:
        mid = (left + right) // 2
        hours = sum((pile + mid - 1) // mid for pile in piles)

        if hours <= h:
            right = mid
        else:
            left = mid + 1

    return left`,
      cpp: `// Pattern 1: Find exact match
int binarySearch(vector<int>& nums, int target) {
    int left = 0, right = nums.size() - 1;

    while (left <= right) {
        int mid = left + (right - left) / 2;

        if (nums[mid] == target) return mid;
        else if (nums[mid] < target) left = mid + 1;
        else right = mid - 1;
    }

    return -1;
}

// Use STL algorithms
#include <algorithm>
auto it = std::lower_bound(nums.begin(), nums.end(), target);
// Returns iterator to first element >= target

auto it = std::upper_bound(nums.begin(), nums.end(), target);
// Returns iterator to first element > target

// Check if found
if (it != nums.end() && *it == target) {
    int index = it - nums.begin();
}`,
      javascript: `// Pattern 1: Find exact match
function binarySearch(nums, target) {
  let left = 0, right = nums.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (nums[mid] === target) return mid;
    else if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }

  return -1;
}

// Pattern 2: Find leftmost
function findFirst(nums, target) {
  let left = 0, right = nums.length;

  while (left < right) {
    const mid = Math.floor((left + right) / 2);

    if (nums[mid] < target) left = mid + 1;
    else right = mid;
  }

  return left < nums.length && nums[left] === target ? left : -1;
}

// Pattern 4: Binary search on answer
function minEatingSpeed(piles, h) {
  let left = 1, right = Math.max(...piles);

  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    const hours = piles.reduce((sum, pile) =>
      sum + Math.ceil(pile / mid), 0);

    if (hours <= h) right = mid;
    else left = mid + 1;
  }

  return left;
}`,
    },
    keyPoints: [
      "left <= right: search until exhausted, return when found",
      "left < right: converge to a boundary, answer is left at end",
      "Use mid = left + (right - left) / 2 to avoid overflow",
      "For rightmost: use mid = left + (right - left + 1) / 2 to avoid infinite loop",
      "Binary search on answer: define search space, check if mid satisfies condition",
    ],
    commonMistakes: [
      "Infinite loop from wrong mid calculation in rightmost search",
      "Off-by-one in right initialization (length vs length-1)",
      "Forgetting to check if result is valid after loop",
      "Using wrong comparison operator in condition",
    ],
    relatedProblems: [
      "Binary Search",
      "Search Insert Position",
      "Find First and Last Position",
      "Koko Eating Bananas",
      "Search in Rotated Sorted Array",
    ],
    relatedPatterns: ["binary-search"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "backtracking-template",
    name: "Backtracking Template",
    slug: "backtracking-template",
    category: "Algorithm Idioms",
    description:
      "Backtracking explores all possible solutions by building candidates incrementally and abandoning ('backtracking') when a candidate cannot lead to a valid solution. The key is: choose, explore, unchoose.",
    timeComplexity: "O(k × n^k)",
    spaceComplexity: "O(k)",
    whenToUse: [
      "Generate all permutations/combinations/subsets",
      "N-Queens, Sudoku (constraint satisfaction)",
      "Word search in grid",
      "Partition problems",
      "Path finding with constraints",
    ],
    codeSnippets: {
      java: `// Generic backtracking template
void backtrack(State state, List<Result> results) {
    if (isGoal(state)) {
        results.add(new Result(state));  // Found a solution
        return;
    }

    for (Choice choice : getChoices(state)) {
        if (isValid(choice, state)) {
            makeChoice(state, choice);      // Choose
            backtrack(state, results);       // Explore
            undoChoice(state, choice);       // Unchoose (backtrack)
        }
    }
}

// Subsets
public List<List<Integer>> subsets(int[] nums) {
    List<List<Integer>> result = new ArrayList<>();
    backtrack(nums, 0, new ArrayList<>(), result);
    return result;
}

private void backtrack(int[] nums, int start,
                       List<Integer> current, List<List<Integer>> result) {
    result.add(new ArrayList<>(current));  // Add current state as result

    for (int i = start; i < nums.length; i++) {
        current.add(nums[i]);                // Choose
        backtrack(nums, i + 1, current, result);  // Explore
        current.remove(current.size() - 1);  // Unchoose
    }
}

// Permutations
public List<List<Integer>> permute(int[] nums) {
    List<List<Integer>> result = new ArrayList<>();
    boolean[] used = new boolean[nums.length];
    backtrack(nums, used, new ArrayList<>(), result);
    return result;
}

private void backtrack(int[] nums, boolean[] used,
                       List<Integer> current, List<List<Integer>> result) {
    if (current.size() == nums.length) {
        result.add(new ArrayList<>(current));
        return;
    }

    for (int i = 0; i < nums.length; i++) {
        if (used[i]) continue;

        used[i] = true;                      // Choose
        current.add(nums[i]);
        backtrack(nums, used, current, result);  // Explore
        current.remove(current.size() - 1);  // Unchoose
        used[i] = false;
    }
}

// Combination Sum (can reuse elements)
public List<List<Integer>> combinationSum(int[] candidates, int target) {
    List<List<Integer>> result = new ArrayList<>();
    backtrack(candidates, target, 0, new ArrayList<>(), result);
    return result;
}

private void backtrack(int[] candidates, int remaining, int start,
                       List<Integer> current, List<List<Integer>> result) {
    if (remaining == 0) {
        result.add(new ArrayList<>(current));
        return;
    }
    if (remaining < 0) return;

    for (int i = start; i < candidates.length; i++) {
        current.add(candidates[i]);
        backtrack(candidates, remaining - candidates[i], i, current, result);  // i, not i+1 (reuse)
        current.remove(current.size() - 1);
    }
}

// N-Queens
public List<List<String>> solveNQueens(int n) {
    List<List<String>> result = new ArrayList<>();
    char[][] board = new char[n][n];
    for (char[] row : board) Arrays.fill(row, '.');

    backtrack(board, 0, result);
    return result;
}

private void backtrack(char[][] board, int row, List<List<String>> result) {
    if (row == board.length) {
        result.add(construct(board));
        return;
    }

    for (int col = 0; col < board.length; col++) {
        if (isValidPlacement(board, row, col)) {
            board[row][col] = 'Q';           // Choose
            backtrack(board, row + 1, result);  // Explore
            board[row][col] = '.';           // Unchoose
        }
    }
}

private boolean isValidPlacement(char[][] board, int row, int col) {
    // Check column
    for (int i = 0; i < row; i++) {
        if (board[i][col] == 'Q') return false;
    }
    // Check diagonal (upper-left)
    for (int i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
        if (board[i][j] == 'Q') return false;
    }
    // Check diagonal (upper-right)
    for (int i = row - 1, j = col + 1; i >= 0 && j < board.length; i--, j++) {
        if (board[i][j] == 'Q') return false;
    }
    return true;
}`,
      python: `# Subsets
def subsets(nums):
    result = []

    def backtrack(start, current):
        result.append(current[:])  # Add copy

        for i in range(start, len(nums)):
            current.append(nums[i])      # Choose
            backtrack(i + 1, current)    # Explore
            current.pop()                # Unchoose

    backtrack(0, [])
    return result

# Permutations
def permute(nums):
    result = []
    used = [False] * len(nums)

    def backtrack(current):
        if len(current) == len(nums):
            result.append(current[:])
            return

        for i in range(len(nums)):
            if used[i]:
                continue

            used[i] = True
            current.append(nums[i])
            backtrack(current)
            current.pop()
            used[i] = False

    backtrack([])
    return result

# Combination Sum
def combinationSum(candidates, target):
    result = []

    def backtrack(start, remaining, current):
        if remaining == 0:
            result.append(current[:])
            return
        if remaining < 0:
            return

        for i in range(start, len(candidates)):
            current.append(candidates[i])
            backtrack(i, remaining - candidates[i], current)  # i for reuse
            current.pop()

    backtrack(0, target, [])
    return result

# N-Queens
def solveNQueens(n):
    result = []
    board = [['.'] * n for _ in range(n)]

    def is_valid(row, col):
        for i in range(row):
            if board[i][col] == 'Q':
                return False
        for i, j in zip(range(row - 1, -1, -1), range(col - 1, -1, -1)):
            if board[i][j] == 'Q':
                return False
        for i, j in zip(range(row - 1, -1, -1), range(col + 1, n)):
            if board[i][j] == 'Q':
                return False
        return True

    def backtrack(row):
        if row == n:
            result.append([''.join(r) for r in board])
            return

        for col in range(n):
            if is_valid(row, col):
                board[row][col] = 'Q'
                backtrack(row + 1)
                board[row][col] = '.'

    backtrack(0)
    return result`,
      cpp: `// Subsets
vector<vector<int>> subsets(vector<int>& nums) {
    vector<vector<int>> result;
    vector<int> current;

    function<void(int)> backtrack = [&](int start) {
        result.push_back(current);

        for (int i = start; i < nums.size(); i++) {
            current.push_back(nums[i]);
            backtrack(i + 1);
            current.pop_back();
        }
    };

    backtrack(0);
    return result;
}

// Permutations
vector<vector<int>> permute(vector<int>& nums) {
    vector<vector<int>> result;
    vector<int> current;
    vector<bool> used(nums.size(), false);

    function<void()> backtrack = [&]() {
        if (current.size() == nums.size()) {
            result.push_back(current);
            return;
        }

        for (int i = 0; i < nums.size(); i++) {
            if (used[i]) continue;
            used[i] = true;
            current.push_back(nums[i]);
            backtrack();
            current.pop_back();
            used[i] = false;
        }
    };

    backtrack();
    return result;
}`,
      javascript: `// Subsets
function subsets(nums) {
  const result = [];

  function backtrack(start, current) {
    result.push([...current]);

    for (let i = start; i < nums.length; i++) {
      current.push(nums[i]);
      backtrack(i + 1, current);
      current.pop();
    }
  }

  backtrack(0, []);
  return result;
}

// Permutations
function permute(nums) {
  const result = [];
  const used = new Array(nums.length).fill(false);

  function backtrack(current) {
    if (current.length === nums.length) {
      result.push([...current]);
      return;
    }

    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;

      used[i] = true;
      current.push(nums[i]);
      backtrack(current);
      current.pop();
      used[i] = false;
    }
  }

  backtrack([]);
  return result;
}

// Combination Sum
function combinationSum(candidates, target) {
  const result = [];

  function backtrack(start, remaining, current) {
    if (remaining === 0) {
      result.push([...current]);
      return;
    }
    if (remaining < 0) return;

    for (let i = start; i < candidates.length; i++) {
      current.push(candidates[i]);
      backtrack(i, remaining - candidates[i], current);
      current.pop();
    }
  }

  backtrack(0, target, []);
  return result;
}`,
    },
    keyPoints: [
      "Template: Choose → Explore → Unchoose",
      "Always add a COPY of current to result (new ArrayList<>(current))",
      "Subsets: start from index, include empty set",
      "Permutations: use boolean[] used array",
      "Combinations: use start index to avoid duplicates",
      "For reuse: pass i instead of i+1",
    ],
    commonMistakes: [
      "Adding reference instead of copy to result",
      "Forgetting to unchoose (backtrack)",
      "Wrong start index causing duplicates",
      "Not handling base case properly",
    ],
    relatedProblems: [
      "Subsets",
      "Permutations",
      "Combination Sum",
      "N-Queens",
      "Word Search",
      "Palindrome Partitioning",
    ],
    relatedPatterns: ["backtracking"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "bit-manipulation-basics",
    name: "Bit Manipulation Basics",
    slug: "bit-manipulation-basics",
    category: "Algorithm Idioms",
    description:
      "Bit manipulation provides O(1) operations for certain problems. Understanding XOR properties, bit checking/setting, and common tricks can dramatically simplify solutions.",
    timeComplexity: "O(1)",
    spaceComplexity: "O(1)",
    whenToUse: [
      "Finding single number (XOR)",
      "Checking if power of 2",
      "Counting set bits",
      "Generating subsets using bitmask",
      "Swapping without temp variable",
    ],
    codeSnippets: {
      java: `// XOR properties
// a ^ a = 0
// a ^ 0 = a
// a ^ b ^ a = b (commutative and associative)

// Single Number - find the one that appears once
public int singleNumber(int[] nums) {
    int result = 0;
    for (int num : nums) {
        result ^= num;  // Duplicates cancel out
    }
    return result;
}

// Check if bit is set at position i
boolean isSet = (n & (1 << i)) != 0;

// Set bit at position i
n = n | (1 << i);

// Clear bit at position i
n = n & ~(1 << i);

// Toggle bit at position i
n = n ^ (1 << i);

// Check if power of 2
// Power of 2 has exactly one bit set: 1, 10, 100, 1000...
// n & (n-1) clears the lowest set bit
boolean isPowerOfTwo = n > 0 && (n & (n - 1)) == 0;

// Count set bits (Brian Kernighan's algorithm)
public int countBits(int n) {
    int count = 0;
    while (n != 0) {
        n &= (n - 1);  // Clear lowest set bit
        count++;
    }
    return count;
}

// Or use built-in
int count = Integer.bitCount(n);

// Get lowest set bit
int lowestBit = n & (-n);

// Clear lowest set bit
n = n & (n - 1);

// Swap without temp
a = a ^ b;
b = a ^ b;  // b = (a^b)^b = a
a = a ^ b;  // a = (a^b)^a = b

// Generate all subsets using bitmask
public List<List<Integer>> subsets(int[] nums) {
    List<List<Integer>> result = new ArrayList<>();
    int n = nums.length;

    // 2^n subsets, from 0 to 2^n - 1
    for (int mask = 0; mask < (1 << n); mask++) {
        List<Integer> subset = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            if ((mask & (1 << i)) != 0) {
                subset.add(nums[i]);
            }
        }
        result.add(subset);
    }

    return result;
}

// Missing Number (0 to n, one missing)
public int missingNumber(int[] nums) {
    int xor = nums.length;  // Start with n
    for (int i = 0; i < nums.length; i++) {
        xor ^= i ^ nums[i];  // XOR index and value
    }
    return xor;
}

// Two numbers appear once, others twice
public int[] singleNumberIII(int[] nums) {
    int xor = 0;
    for (int num : nums) xor ^= num;

    // Find rightmost set bit (difference between two numbers)
    int rightmostBit = xor & (-xor);

    int a = 0, b = 0;
    for (int num : nums) {
        if ((num & rightmostBit) != 0) {
            a ^= num;
        } else {
            b ^= num;
        }
    }

    return new int[]{a, b};
}`,
      python: `# XOR properties
# a ^ a = 0
# a ^ 0 = a

# Single Number
def singleNumber(nums):
    result = 0
    for num in nums:
        result ^= num
    return result

# Or using reduce
from functools import reduce
def singleNumber(nums):
    return reduce(lambda x, y: x ^ y, nums)

# Check if bit is set
is_set = (n & (1 << i)) != 0

# Set bit
n = n | (1 << i)

# Clear bit
n = n & ~(1 << i)

# Check power of 2
is_power_of_two = n > 0 and (n & (n - 1)) == 0

# Count set bits
count = bin(n).count('1')
# Or
count = n.bit_count()  # Python 3.10+

# Generate subsets with bitmask
def subsets(nums):
    n = len(nums)
    result = []

    for mask in range(1 << n):
        subset = []
        for i in range(n):
            if mask & (1 << i):
                subset.append(nums[i])
        result.append(subset)

    return result

# Missing Number
def missingNumber(nums):
    xor = len(nums)
    for i, num in enumerate(nums):
        xor ^= i ^ num
    return xor`,
      cpp: `// Single Number
int singleNumber(vector<int>& nums) {
    int result = 0;
    for (int num : nums) {
        result ^= num;
    }
    return result;
}

// Count set bits
int countBits(int n) {
    return __builtin_popcount(n);
}

// Check power of 2
bool isPowerOfTwo(int n) {
    return n > 0 && (n & (n - 1)) == 0;
}

// Generate subsets
vector<vector<int>> subsets(vector<int>& nums) {
    int n = nums.size();
    vector<vector<int>> result;

    for (int mask = 0; mask < (1 << n); mask++) {
        vector<int> subset;
        for (int i = 0; i < n; i++) {
            if (mask & (1 << i)) {
                subset.push_back(nums[i]);
            }
        }
        result.push_back(subset);
    }

    return result;
}`,
      javascript: `// Single Number
function singleNumber(nums) {
  return nums.reduce((a, b) => a ^ b, 0);
}

// Check if bit is set
const isSet = (n & (1 << i)) !== 0;

// Check power of 2
const isPowerOfTwo = n => n > 0 && (n & (n - 1)) === 0;

// Count set bits
function countBits(n) {
  let count = 0;
  while (n) {
    n &= (n - 1);
    count++;
  }
  return count;
}

// Generate subsets
function subsets(nums) {
  const n = nums.length;
  const result = [];

  for (let mask = 0; mask < (1 << n); mask++) {
    const subset = [];
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) {
        subset.push(nums[i]);
      }
    }
    result.push(subset);
  }

  return result;
}

// Missing Number
function missingNumber(nums) {
  let xor = nums.length;
  for (let i = 0; i < nums.length; i++) {
    xor ^= i ^ nums[i];
  }
  return xor;
}`,
    },
    keyPoints: [
      "XOR: a ^ a = 0, a ^ 0 = a",
      "n & (n-1) clears lowest set bit",
      "n & (-n) isolates lowest set bit",
      "Power of 2: n & (n-1) == 0",
      "Bitmask for subsets: iterate 0 to 2^n - 1",
    ],
    commonMistakes: [
      "Forgetting n > 0 check for power of 2 (0 is not power of 2)",
      "Using == instead of != 0 for bit check",
      "Integer overflow with 1 << 31 (use 1L << i for long)",
      "Confusing & (bitwise AND) with && (logical AND)",
    ],
    relatedProblems: [
      "Single Number",
      "Single Number II",
      "Single Number III",
      "Missing Number",
      "Power of Two",
      "Counting Bits",
    ],
    relatedPatterns: [],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "integer-overflow-prevention",
    name: "Integer Overflow Prevention",
    slug: "integer-overflow-prevention",
    category: "Type Conversions & Math",
    description:
      "Integer overflow is a silent bug that causes wrong results without throwing errors. Understanding when overflow can occur and how to prevent it is critical for correctness.",
    timeComplexity: "O(1)",
    spaceComplexity: "O(1)",
    whenToUse: [
      "Multiplying two integers",
      "Computing mid in binary search",
      "Summing large arrays",
      "Any arithmetic with potentially large values",
    ],
    codeSnippets: {
      java: `// Integer limits
// int: -2^31 to 2^31 - 1 (-2,147,483,648 to 2,147,483,647)
// long: -2^63 to 2^63 - 1

// DANGEROUS: Overflow in binary search mid calculation
int mid = (left + right) / 2;  // Can overflow if left + right > Integer.MAX_VALUE

// SAFE: Avoid overflow
int mid = left + (right - left) / 2;

// DANGEROUS: Multiplication overflow
int a = 100000, b = 100000;
int product = a * b;  // OVERFLOW! Result is 1410065408, not 10^10

// SAFE: Cast to long BEFORE multiplication
long product = (long) a * b;  // Correct: 10000000000L

// Note: casting AFTER multiplication is too late!
long wrong = (long) (a * b);  // Still wrong! Overflow already happened

// Check for overflow before it happens
public int safeMultiply(int a, int b) {
    if (a == 0 || b == 0) return 0;

    int result = a * b;
    if (result / a != b) {
        throw new ArithmeticException("Overflow");
    }
    return result;
}

// Or use Math.multiplyExact (throws on overflow)
try {
    int result = Math.multiplyExact(a, b);
} catch (ArithmeticException e) {
    // Handle overflow
}

// Safe addition
int safeAdd = Math.addExact(a, b);  // Throws on overflow

// Example: Reverse Integer (check overflow)
public int reverse(int x) {
    int result = 0;

    while (x != 0) {
        int digit = x % 10;
        x /= 10;

        // Check overflow BEFORE it happens
        if (result > Integer.MAX_VALUE / 10 ||
            (result == Integer.MAX_VALUE / 10 && digit > 7)) {
            return 0;
        }
        if (result < Integer.MIN_VALUE / 10 ||
            (result == Integer.MIN_VALUE / 10 && digit < -8)) {
            return 0;
        }

        result = result * 10 + digit;
    }

    return result;
}

// Example: String to Integer (handle overflow)
public int myAtoi(String s) {
    long result = 0;
    int sign = 1;
    int i = 0;

    // Skip whitespace
    while (i < s.length() && s.charAt(i) == ' ') i++;

    // Check sign
    if (i < s.length() && (s.charAt(i) == '+' || s.charAt(i) == '-')) {
        sign = s.charAt(i++) == '-' ? -1 : 1;
    }

    // Parse digits
    while (i < s.length() && Character.isDigit(s.charAt(i))) {
        result = result * 10 + (s.charAt(i++) - '0');

        // Check overflow (using long to detect)
        if (result * sign > Integer.MAX_VALUE) return Integer.MAX_VALUE;
        if (result * sign < Integer.MIN_VALUE) return Integer.MIN_VALUE;
    }

    return (int) (result * sign);
}

// Sum array without overflow
public long sumArray(int[] nums) {
    long sum = 0;
    for (int num : nums) {
        sum += num;  // int automatically widens to long
    }
    return sum;
}`,
      python: `# Python integers have arbitrary precision - no overflow!
a = 10 ** 100
b = 10 ** 100
result = a * b  # Works fine!

# But when interfacing with systems expecting 32-bit:
INT_MAX = 2**31 - 1
INT_MIN = -2**31

def clamp_to_int(x):
    return max(INT_MIN, min(INT_MAX, x))

# Reverse Integer
def reverse(x):
    INT_MAX, INT_MIN = 2**31 - 1, -2**31

    sign = -1 if x < 0 else 1
    x = abs(x)

    result = 0
    while x:
        result = result * 10 + x % 10
        x //= 10

    result *= sign
    return result if INT_MIN <= result <= INT_MAX else 0

# String to Integer
def myAtoi(s):
    INT_MAX, INT_MIN = 2**31 - 1, -2**31

    s = s.lstrip()
    if not s:
        return 0

    sign = 1
    i = 0
    if s[0] in ['+', '-']:
        sign = -1 if s[0] == '-' else 1
        i = 1

    result = 0
    while i < len(s) and s[i].isdigit():
        result = result * 10 + int(s[i])
        i += 1

    result *= sign
    return max(INT_MIN, min(INT_MAX, result))`,
      cpp: `#include <climits>
#include <stdexcept>

// INT_MAX = 2147483647
// INT_MIN = -2147483648
// LLONG_MAX, LLONG_MIN for long long

// Safe binary search mid
int mid = left + (right - left) / 2;

// Safe multiplication
long long product = static_cast<long long>(a) * b;

// Check overflow before multiplication
bool willOverflow(int a, int b) {
    if (a == 0 || b == 0) return false;
    return a > INT_MAX / b;
}

// Reverse Integer
int reverse(int x) {
    int result = 0;

    while (x != 0) {
        int digit = x % 10;
        x /= 10;

        if (result > INT_MAX / 10 || (result == INT_MAX / 10 && digit > 7)) {
            return 0;
        }
        if (result < INT_MIN / 10 || (result == INT_MIN / 10 && digit < -8)) {
            return 0;
        }

        result = result * 10 + digit;
    }

    return result;
}`,
      javascript: `// JavaScript numbers are 64-bit floats
// Safe integer range: -(2^53 - 1) to 2^53 - 1
// Number.MAX_SAFE_INTEGER = 9007199254740991
// Number.MIN_SAFE_INTEGER = -9007199254740991

// Check if safe integer
Number.isSafeInteger(value);

// For larger integers, use BigInt
const big = BigInt(Number.MAX_SAFE_INTEGER) + 1n;

// Safe binary search mid
const mid = Math.floor((left + right) / 2);
// Or
const mid = left + Math.floor((right - left) / 2);

// For 32-bit integer problems
const INT_MAX = 2147483647;
const INT_MIN = -2147483648;

// Reverse Integer
function reverse(x) {
  const INT_MAX = 2147483647;
  const INT_MIN = -2147483648;

  let result = 0;

  while (x !== 0) {
    const digit = x % 10;
    x = Math.trunc(x / 10);

    if (result > INT_MAX / 10 || (result === Math.floor(INT_MAX / 10) && digit > 7)) {
      return 0;
    }
    if (result < INT_MIN / 10 || (result === Math.ceil(INT_MIN / 10) && digit < -8)) {
      return 0;
    }

    result = result * 10 + digit;
  }

  return result;
}`,
    },
    keyPoints: [
      "Cast to long BEFORE multiplication: (long)a * b",
      "Use left + (right - left) / 2 for binary search mid",
      "Check overflow condition BEFORE the operation",
      "Integer.MAX_VALUE = 2^31 - 1 = 2,147,483,647",
      "Math.multiplyExact throws on overflow (Java 8+)",
    ],
    commonMistakes: [
      "Casting after multiplication: (long)(a * b) - too late!",
      "Using (left + right) / 2 when left + right can overflow",
      "Forgetting that int * int = int (not long)",
      "Not handling Integer.MIN_VALUE edge case in reverse/abs",
    ],
    relatedProblems: [
      "Reverse Integer",
      "String to Integer (atoi)",
      "Multiply Strings",
      "Pow(x, n)",
    ],
    relatedPatterns: [],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "deep-vs-shallow-copy",
    name: "Deep vs Shallow Copy",
    slug: "deep-vs-shallow-copy",
    category: "Java Fundamentals",
    description:
      "A shallow copy creates a new object but references the same nested objects. A deep copy creates new objects at all levels. Understanding this is crucial when working with 2D arrays, nested lists, or objects in backtracking.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    whenToUse: [
      "Cloning 2D arrays or nested structures",
      "Backtracking: adding current state to results",
      "When you need independent copies",
      "Avoiding unintended mutations",
    ],
    codeSnippets: {
      java: `// 1D Array - clone() works
int[] original = {1, 2, 3};
int[] copy = original.clone();  // Deep enough for primitives
copy[0] = 100;  // Doesn't affect original

// 2D Array - clone() is SHALLOW
int[][] matrix = {{1, 2}, {3, 4}};
int[][] shallowCopy = matrix.clone();
shallowCopy[0][0] = 100;  // ALSO changes matrix[0][0]!

// 2D Array - Deep copy (manual)
int[][] deepCopy = new int[matrix.length][];
for (int i = 0; i < matrix.length; i++) {
    deepCopy[i] = matrix[i].clone();
}

// Or using streams
int[][] deepCopy = Arrays.stream(matrix)
    .map(int[]::clone)
    .toArray(int[][]::new);

// ArrayList - shallow copy
List<List<Integer>> original = new ArrayList<>();
original.add(Arrays.asList(1, 2, 3));

List<List<Integer>> shallowCopy = new ArrayList<>(original);
shallowCopy.get(0).set(0, 100);  // ALSO changes original!

// ArrayList - deep copy
List<List<Integer>> deepCopy = new ArrayList<>();
for (List<Integer> inner : original) {
    deepCopy.add(new ArrayList<>(inner));
}

// COMMON MISTAKE in backtracking
// WRONG - adds reference
result.add(current);  // All results will be the same (empty) list!

// CORRECT - adds copy
result.add(new ArrayList<>(current));

// Object cloning
class Node implements Cloneable {
    int val;
    Node next;

    @Override
    protected Node clone() throws CloneNotSupportedException {
        Node cloned = (Node) super.clone();  // Shallow clone
        if (this.next != null) {
            cloned.next = this.next.clone();  // Deep clone
        }
        return cloned;
    }
}

// Arrays.copyOf - shallow for reference types
Integer[] arr = {1, 2, 3};
Integer[] copy = Arrays.copyOf(arr, arr.length);

// System.arraycopy - also shallow
int[] src = {1, 2, 3, 4, 5};
int[] dest = new int[5];
System.arraycopy(src, 0, dest, 0, src.length);

// HashMap - shallow copy
Map<String, List<Integer>> original = new HashMap<>();
Map<String, List<Integer>> shallowCopy = new HashMap<>(original);

// HashMap - deep copy
Map<String, List<Integer>> deepCopy = new HashMap<>();
for (Map.Entry<String, List<Integer>> entry : original.entrySet()) {
    deepCopy.put(entry.getKey(), new ArrayList<>(entry.getValue()));
}`,
      python: `# Shallow copy - multiple ways
import copy

original = [[1, 2], [3, 4]]

# These are all SHALLOW copies
shallow1 = original[:]
shallow2 = list(original)
shallow3 = original.copy()
shallow4 = copy.copy(original)

shallow1[0][0] = 100  # Changes original too!

# Deep copy
deep = copy.deepcopy(original)
deep[0][0] = 100  # Does NOT change original

# Common 2D list mistake
# WRONG - all rows reference the same list!
matrix = [[0] * 3] * 3
matrix[0][0] = 1  # Changes ALL rows!

# CORRECT - each row is a new list
matrix = [[0] * 3 for _ in range(3)]
matrix[0][0] = 1  # Only changes first row

# Backtracking - add copy
result = []
current = [1, 2, 3]

# WRONG
result.append(current)  # Reference!

# CORRECT
result.append(current[:])  # Shallow copy (ok for 1D)
result.append(list(current))  # Same
result.append(current.copy())  # Same

# For nested structures in backtracking
result.append(copy.deepcopy(current))

# Dictionary shallow copy
original = {'a': [1, 2]}
shallow = original.copy()
shallow = dict(original)

# Dictionary deep copy
deep = copy.deepcopy(original)`,
      cpp: `#include <vector>
#include <algorithm>

// 1D vector - assignment is deep copy
std::vector<int> original = {1, 2, 3};
std::vector<int> copy = original;  // Deep copy for primitives
copy[0] = 100;  // Does NOT affect original

// 2D vector - assignment is also deep
std::vector<std::vector<int>> matrix = {{1, 2}, {3, 4}};
std::vector<std::vector<int>> copy = matrix;  // Deep copy!
copy[0][0] = 100;  // Does NOT affect original

// C++ vectors copy by value, so this works correctly
// Unlike Java/Python, no extra work needed

// For pointers, you need manual deep copy
struct Node {
    int val;
    Node* next;

    Node* deepClone() {
        Node* newNode = new Node();
        newNode->val = this->val;
        if (this->next) {
            newNode->next = this->next->deepClone();
        }
        return newNode;
    }
};`,
      javascript: `// Shallow copy - multiple ways
const original = [[1, 2], [3, 4]];

// These are all SHALLOW copies
const shallow1 = [...original];
const shallow2 = original.slice();
const shallow3 = Array.from(original);
const shallow4 = Object.assign([], original);

shallow1[0][0] = 100;  // Changes original too!

// Deep copy - JSON method (works for serializable data)
const deep1 = JSON.parse(JSON.stringify(original));

// Deep copy - structuredClone (modern browsers, Node 17+)
const deep2 = structuredClone(original);

// Deep copy - manual for 2D array
const deepCopy = original.map(row => [...row]);

// Backtracking - add copy
const result = [];
const current = [1, 2, 3];

// WRONG
result.push(current);  // Reference!

// CORRECT
result.push([...current]);  // Spread operator
result.push(current.slice());  // slice()

// Object shallow copy
const obj = { a: [1, 2] };
const shallow = { ...obj };
const shallow2 = Object.assign({}, obj);

// Object deep copy
const deep = JSON.parse(JSON.stringify(obj));
const deep2 = structuredClone(obj);`,
    },
    keyPoints: [
      "clone() and copy() are SHALLOW for nested structures",
      "Backtracking: always add new ArrayList<>(current), not current",
      "Python [[0]*n]*m creates shared references - use list comprehension",
      "C++ vectors copy by value - safer by default",
      "JSON.parse(JSON.stringify(x)) is a quick deep copy in JS",
    ],
    commonMistakes: [
      "Adding reference to result in backtracking",
      "Using clone() expecting deep copy for 2D arrays",
      "Python: [[0]*n]*m creates rows that share the same list",
      "Forgetting that shallow copy of objects still shares nested data",
    ],
    relatedProblems: [
      "Clone Graph",
      "Copy List with Random Pointer",
      "Subsets",
      "Permutations",
    ],
    relatedPatterns: ["backtracking"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "trie-implementation",
    name: "Trie (Prefix Tree) Implementation",
    slug: "trie-implementation",
    category: "Data Structures",
    description:
      "A Trie is a tree-like data structure for efficient prefix-based operations on strings. It's essential for autocomplete, spell checking, and word search problems.",
    timeComplexity: "O(m) per operation",
    spaceComplexity: "O(ALPHABET × m × n)",
    whenToUse: [
      "Prefix matching / autocomplete",
      "Word dictionary with search and prefix check",
      "Word search in grid (prune paths)",
      "Longest common prefix",
      "Spell checking",
    ],
    codeSnippets: {
      java: `class TrieNode {
    TrieNode[] children = new TrieNode[26];
    boolean isEndOfWord = false;
}

class Trie {
    private TrieNode root;

    public Trie() {
        root = new TrieNode();
    }

    // Insert a word - O(m) where m is word length
    public void insert(String word) {
        TrieNode node = root;
        for (char c : word.toCharArray()) {
            int index = c - 'a';
            if (node.children[index] == null) {
                node.children[index] = new TrieNode();
            }
            node = node.children[index];
        }
        node.isEndOfWord = true;
    }

    // Search for exact word - O(m)
    public boolean search(String word) {
        TrieNode node = searchPrefix(word);
        return node != null && node.isEndOfWord;
    }

    // Check if any word starts with prefix - O(m)
    public boolean startsWith(String prefix) {
        return searchPrefix(prefix) != null;
    }

    private TrieNode searchPrefix(String prefix) {
        TrieNode node = root;
        for (char c : prefix.toCharArray()) {
            int index = c - 'a';
            if (node.children[index] == null) {
                return null;
            }
            node = node.children[index];
        }
        return node;
    }
}

// Alternative: Using HashMap (for larger character sets)
class TrieNodeMap {
    Map<Character, TrieNodeMap> children = new HashMap<>();
    boolean isEndOfWord = false;
}

// Word Search II - Trie for efficient pruning
public List<String> findWords(char[][] board, String[] words) {
    // Build Trie from words
    TrieNode root = new TrieNode();
    for (String word : words) {
        TrieNode node = root;
        for (char c : word.toCharArray()) {
            int idx = c - 'a';
            if (node.children[idx] == null) {
                node.children[idx] = new TrieNode();
            }
            node = node.children[idx];
        }
        node.word = word;  // Store word at end node
    }

    List<String> result = new ArrayList<>();
    int m = board.length, n = board[0].length;

    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            dfs(board, i, j, root, result);
        }
    }

    return result;
}

private void dfs(char[][] board, int i, int j, TrieNode node, List<String> result) {
    char c = board[i][j];
    if (c == '#' || node.children[c - 'a'] == null) return;

    node = node.children[c - 'a'];
    if (node.word != null) {
        result.add(node.word);
        node.word = null;  // Avoid duplicates
    }

    board[i][j] = '#';  // Mark visited
    int[][] dirs = {{0,1}, {0,-1}, {1,0}, {-1,0}};
    for (int[] dir : dirs) {
        int ni = i + dir[0], nj = j + dir[1];
        if (ni >= 0 && ni < board.length && nj >= 0 && nj < board[0].length) {
            dfs(board, ni, nj, node, result);
        }
    }
    board[i][j] = c;  // Restore
}`,
      python: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word: str) -> None:
        node = self.root
        for c in word:
            if c not in node.children:
                node.children[c] = TrieNode()
            node = node.children[c]
        node.is_end = True

    def search(self, word: str) -> bool:
        node = self._search_prefix(word)
        return node is not None and node.is_end

    def startsWith(self, prefix: str) -> bool:
        return self._search_prefix(prefix) is not None

    def _search_prefix(self, prefix: str) -> TrieNode:
        node = self.root
        for c in prefix:
            if c not in node.children:
                return None
            node = node.children[c]
        return node

# Word Search II
def findWords(board, words):
    root = TrieNode()

    # Build Trie
    for word in words:
        node = root
        for c in word:
            if c not in node.children:
                node.children[c] = TrieNode()
            node = node.children[c]
        node.word = word

    result = []
    m, n = len(board), len(board[0])

    def dfs(i, j, node):
        c = board[i][j]
        if c not in node.children:
            return

        node = node.children[c]
        if hasattr(node, 'word') and node.word:
            result.append(node.word)
            node.word = None

        board[i][j] = '#'
        for di, dj in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
            ni, nj = i + di, j + dj
            if 0 <= ni < m and 0 <= nj < n and board[ni][nj] != '#':
                dfs(ni, nj, node)
        board[i][j] = c

    for i in range(m):
        for j in range(n):
            dfs(i, j, root)

    return result`,
      cpp: `struct TrieNode {
    TrieNode* children[26] = {nullptr};
    bool isEndOfWord = false;
};

class Trie {
private:
    TrieNode* root;

public:
    Trie() {
        root = new TrieNode();
    }

    void insert(const std::string& word) {
        TrieNode* node = root;
        for (char c : word) {
            int idx = c - 'a';
            if (!node->children[idx]) {
                node->children[idx] = new TrieNode();
            }
            node = node->children[idx];
        }
        node->isEndOfWord = true;
    }

    bool search(const std::string& word) {
        TrieNode* node = searchPrefix(word);
        return node && node->isEndOfWord;
    }

    bool startsWith(const std::string& prefix) {
        return searchPrefix(prefix) != nullptr;
    }

private:
    TrieNode* searchPrefix(const std::string& prefix) {
        TrieNode* node = root;
        for (char c : prefix) {
            int idx = c - 'a';
            if (!node->children[idx]) return nullptr;
            node = node->children[idx];
        }
        return node;
    }
};`,
      javascript: `class TrieNode {
  constructor() {
    this.children = new Map();
    this.isEndOfWord = false;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word) {
    let node = this.root;
    for (const c of word) {
      if (!node.children.has(c)) {
        node.children.set(c, new TrieNode());
      }
      node = node.children.get(c);
    }
    node.isEndOfWord = true;
  }

  search(word) {
    const node = this._searchPrefix(word);
    return node !== null && node.isEndOfWord;
  }

  startsWith(prefix) {
    return this._searchPrefix(prefix) !== null;
  }

  _searchPrefix(prefix) {
    let node = this.root;
    for (const c of prefix) {
      if (!node.children.has(c)) {
        return null;
      }
      node = node.children.get(c);
    }
    return node;
  }
}`,
    },
    keyPoints: [
      "Each node has 26 children (for lowercase letters) or use Map",
      "Mark end of word with boolean flag",
      "Insert/Search/StartsWith are all O(m) where m is string length",
      "Space: O(alphabet_size * key_length * num_keys) worst case",
      "For Word Search II, store the word at end node for easy retrieval",
    ],
    commonMistakes: [
      "Forgetting to mark isEndOfWord",
      "Using wrong index (c instead of c - 'a')",
      "Not handling null/undefined children",
      "In Word Search II, not removing found word (causes duplicates)",
    ],
    relatedProblems: [
      "Implement Trie",
      "Word Search II",
      "Design Add and Search Words",
      "Replace Words",
      "Longest Word in Dictionary",
    ],
    relatedPatterns: ["trie"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "union-find-implementation",
    name: "Union-Find (Disjoint Set)",
    slug: "union-find-implementation",
    category: "Data Structures",
    description:
      "Union-Find is a data structure that tracks elements partitioned into disjoint sets. It supports near O(1) union and find operations with path compression and union by rank optimizations.",
    timeComplexity: "O(α(n)) ≈ O(1)",
    spaceComplexity: "O(n)",
    whenToUse: [
      "Finding connected components",
      "Detecting cycles in undirected graphs",
      "Kruskal's MST algorithm",
      "Grouping/clustering problems",
      "Dynamic connectivity queries",
    ],
    codeSnippets: {
      java: `class UnionFind {
    private int[] parent;
    private int[] rank;
    private int count;  // Number of components

    public UnionFind(int n) {
        parent = new int[n];
        rank = new int[n];
        count = n;

        for (int i = 0; i < n; i++) {
            parent[i] = i;  // Each element is its own parent
            rank[i] = 0;
        }
    }

    // Find with path compression - O(α(n)) ≈ O(1)
    public int find(int x) {
        if (parent[x] != x) {
            parent[x] = find(parent[x]);  // Path compression
        }
        return parent[x];
    }

    // Union by rank - O(α(n)) ≈ O(1)
    public boolean union(int x, int y) {
        int rootX = find(x);
        int rootY = find(y);

        if (rootX == rootY) {
            return false;  // Already in same set
        }

        // Union by rank
        if (rank[rootX] < rank[rootY]) {
            parent[rootX] = rootY;
        } else if (rank[rootX] > rank[rootY]) {
            parent[rootY] = rootX;
        } else {
            parent[rootY] = rootX;
            rank[rootX]++;
        }

        count--;
        return true;
    }

    public boolean connected(int x, int y) {
        return find(x) == find(y);
    }

    public int getCount() {
        return count;
    }
}

// Example: Number of Connected Components
public int countComponents(int n, int[][] edges) {
    UnionFind uf = new UnionFind(n);
    for (int[] edge : edges) {
        uf.union(edge[0], edge[1]);
    }
    return uf.getCount();
}

// Example: Redundant Connection (find cycle edge)
public int[] findRedundantConnection(int[][] edges) {
    int n = edges.length;
    UnionFind uf = new UnionFind(n + 1);

    for (int[] edge : edges) {
        if (!uf.union(edge[0], edge[1])) {
            return edge;  // This edge creates a cycle
        }
    }

    return new int[0];
}

// Example: Accounts Merge
public List<List<String>> accountsMerge(List<List<String>> accounts) {
    Map<String, Integer> emailToId = new HashMap<>();
    Map<String, String> emailToName = new HashMap<>();
    int id = 0;

    // Assign ID to each email
    for (List<String> account : accounts) {
        String name = account.get(0);
        for (int i = 1; i < account.size(); i++) {
            String email = account.get(i);
            if (!emailToId.containsKey(email)) {
                emailToId.put(email, id++);
            }
            emailToName.put(email, name);
        }
    }

    // Union emails in same account
    UnionFind uf = new UnionFind(id);
    for (List<String> account : accounts) {
        int firstId = emailToId.get(account.get(1));
        for (int i = 2; i < account.size(); i++) {
            uf.union(firstId, emailToId.get(account.get(i)));
        }
    }

    // Group emails by root
    Map<Integer, List<String>> rootToEmails = new HashMap<>();
    for (String email : emailToId.keySet()) {
        int root = uf.find(emailToId.get(email));
        rootToEmails.computeIfAbsent(root, k -> new ArrayList<>()).add(email);
    }

    // Build result
    List<List<String>> result = new ArrayList<>();
    for (List<String> emails : rootToEmails.values()) {
        Collections.sort(emails);
        emails.add(0, emailToName.get(emails.get(0)));
        result.add(emails);
    }

    return result;
}`,
      python: `class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n
        self.count = n

    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])  # Path compression
        return self.parent[x]

    def union(self, x, y):
        root_x, root_y = self.find(x), self.find(y)

        if root_x == root_y:
            return False

        # Union by rank
        if self.rank[root_x] < self.rank[root_y]:
            self.parent[root_x] = root_y
        elif self.rank[root_x] > self.rank[root_y]:
            self.parent[root_y] = root_x
        else:
            self.parent[root_y] = root_x
            self.rank[root_x] += 1

        self.count -= 1
        return True

    def connected(self, x, y):
        return self.find(x) == self.find(y)

# Number of Connected Components
def countComponents(n, edges):
    uf = UnionFind(n)
    for u, v in edges:
        uf.union(u, v)
    return uf.count

# Redundant Connection
def findRedundantConnection(edges):
    n = len(edges)
    uf = UnionFind(n + 1)

    for u, v in edges:
        if not uf.union(u, v):
            return [u, v]

    return []

# Number of Islands using Union-Find
def numIslands(grid):
    if not grid:
        return 0

    m, n = len(grid), len(grid[0])
    uf = UnionFind(m * n)
    count = 0

    for i in range(m):
        for j in range(n):
            if grid[i][j] == '1':
                count += 1

    for i in range(m):
        for j in range(n):
            if grid[i][j] == '1':
                idx = i * n + j
                # Union with right and down neighbors
                if j + 1 < n and grid[i][j + 1] == '1':
                    if uf.union(idx, idx + 1):
                        count -= 1
                if i + 1 < m and grid[i + 1][j] == '1':
                    if uf.union(idx, idx + n):
                        count -= 1

    return count`,
      cpp: `class UnionFind {
private:
    std::vector<int> parent, rank;
    int count;

public:
    UnionFind(int n) : parent(n), rank(n, 0), count(n) {
        for (int i = 0; i < n; i++) {
            parent[i] = i;
        }
    }

    int find(int x) {
        if (parent[x] != x) {
            parent[x] = find(parent[x]);
        }
        return parent[x];
    }

    bool unite(int x, int y) {
        int rootX = find(x);
        int rootY = find(y);

        if (rootX == rootY) return false;

        if (rank[rootX] < rank[rootY]) {
            parent[rootX] = rootY;
        } else if (rank[rootX] > rank[rootY]) {
            parent[rootY] = rootX;
        } else {
            parent[rootY] = rootX;
            rank[rootX]++;
        }

        count--;
        return true;
    }

    int getCount() { return count; }
};`,
      javascript: `class UnionFind {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
    this.count = n;
  }

  find(x) {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]);
    }
    return this.parent[x];
  }

  union(x, y) {
    const rootX = this.find(x);
    const rootY = this.find(y);

    if (rootX === rootY) return false;

    if (this.rank[rootX] < this.rank[rootY]) {
      this.parent[rootX] = rootY;
    } else if (this.rank[rootX] > this.rank[rootY]) {
      this.parent[rootY] = rootX;
    } else {
      this.parent[rootY] = rootX;
      this.rank[rootX]++;
    }

    this.count--;
    return true;
  }

  connected(x, y) {
    return this.find(x) === this.find(y);
  }
}

// Number of Connected Components
function countComponents(n, edges) {
  const uf = new UnionFind(n);
  for (const [u, v] of edges) {
    uf.union(u, v);
  }
  return uf.count;
}`,
    },
    keyPoints: [
      "Path compression: parent[x] = find(parent[x])",
      "Union by rank: attach smaller tree under root of larger tree",
      "With both optimizations: O(α(n)) ≈ O(1) per operation",
      "α(n) is inverse Ackermann function, effectively constant",
      "Track component count by decrementing on successful union",
    ],
    commonMistakes: [
      "Forgetting path compression",
      "Not initializing parent[i] = i",
      "Using parent directly instead of find()",
      "Off-by-one in node numbering (0-indexed vs 1-indexed)",
    ],
    relatedProblems: [
      "Number of Connected Components",
      "Redundant Connection",
      "Accounts Merge",
      "Number of Islands",
      "Graph Valid Tree",
    ],
    relatedPatterns: ["union-find", "graphs"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "sliding-window-template",
    name: "Sliding Window Template",
    slug: "sliding-window-template",
    category: "Algorithm Idioms",
    description:
      "Sliding window maintains a window of elements that satisfies certain conditions. The window expands by moving the right pointer and shrinks by moving the left pointer. It reduces O(n²) brute force to O(n).",
    timeComplexity: "O(n)",
    spaceComplexity: "O(k)",
    whenToUse: [
      "Finding longest/shortest substring with conditions",
      "Finding max/min in all windows of size k",
      "Subarray/substring problems with constraints",
      "Anagram/permutation matching",
    ],
    codeSnippets: {
      java: `// Template for variable-size sliding window
// Pattern: Longest substring with at most K distinct characters
public int lengthOfLongestSubstringKDistinct(String s, int k) {
    Map<Character, Integer> window = new HashMap<>();
    int left = 0;
    int maxLen = 0;

    for (int right = 0; right < s.length(); right++) {
        // Expand window: add s[right]
        char c = s.charAt(right);
        window.put(c, window.getOrDefault(c, 0) + 1);

        // Shrink window while condition violated
        while (window.size() > k) {
            char leftChar = s.charAt(left);
            window.put(leftChar, window.get(leftChar) - 1);
            if (window.get(leftChar) == 0) {
                window.remove(leftChar);
            }
            left++;
        }

        // Update answer
        maxLen = Math.max(maxLen, right - left + 1);
    }

    return maxLen;
}

// Longest Substring Without Repeating Characters
public int lengthOfLongestSubstring(String s) {
    Set<Character> window = new HashSet<>();
    int left = 0;
    int maxLen = 0;

    for (int right = 0; right < s.length(); right++) {
        char c = s.charAt(right);

        // Shrink until no duplicate
        while (window.contains(c)) {
            window.remove(s.charAt(left));
            left++;
        }

        window.add(c);
        maxLen = Math.max(maxLen, right - left + 1);
    }

    return maxLen;
}

// Minimum Window Substring
public String minWindow(String s, String t) {
    Map<Character, Integer> need = new HashMap<>();
    Map<Character, Integer> window = new HashMap<>();

    for (char c : t.toCharArray()) {
        need.put(c, need.getOrDefault(c, 0) + 1);
    }

    int left = 0;
    int valid = 0;  // Characters that satisfy the count
    int start = 0, minLen = Integer.MAX_VALUE;

    for (int right = 0; right < s.length(); right++) {
        char c = s.charAt(right);

        // Expand
        if (need.containsKey(c)) {
            window.put(c, window.getOrDefault(c, 0) + 1);
            if (window.get(c).equals(need.get(c))) {
                valid++;
            }
        }

        // Shrink when window contains all chars
        while (valid == need.size()) {
            // Update answer
            if (right - left + 1 < minLen) {
                minLen = right - left + 1;
                start = left;
            }

            char leftChar = s.charAt(left);
            if (need.containsKey(leftChar)) {
                if (window.get(leftChar).equals(need.get(leftChar))) {
                    valid--;
                }
                window.put(leftChar, window.get(leftChar) - 1);
            }
            left++;
        }
    }

    return minLen == Integer.MAX_VALUE ? "" : s.substring(start, start + minLen);
}

// Fixed-size window: Maximum Sum Subarray of Size K
public int maxSumSubarray(int[] nums, int k) {
    int windowSum = 0;
    int maxSum = Integer.MIN_VALUE;

    for (int i = 0; i < nums.length; i++) {
        windowSum += nums[i];

        if (i >= k - 1) {
            maxSum = Math.max(maxSum, windowSum);
            windowSum -= nums[i - k + 1];
        }
    }

    return maxSum;
}

// Permutation in String
public boolean checkInclusion(String s1, String s2) {
    if (s1.length() > s2.length()) return false;

    int[] s1Count = new int[26];
    int[] windowCount = new int[26];

    for (char c : s1.toCharArray()) {
        s1Count[c - 'a']++;
    }

    for (int i = 0; i < s2.length(); i++) {
        windowCount[s2.charAt(i) - 'a']++;

        // Remove leftmost when window exceeds s1 length
        if (i >= s1.length()) {
            windowCount[s2.charAt(i - s1.length()) - 'a']--;
        }

        if (Arrays.equals(s1Count, windowCount)) {
            return true;
        }
    }

    return false;
}`,
      python: `from collections import Counter, defaultdict

# Longest Substring Without Repeating Characters
def lengthOfLongestSubstring(s):
    window = set()
    left = 0
    max_len = 0

    for right, c in enumerate(s):
        while c in window:
            window.remove(s[left])
            left += 1

        window.add(c)
        max_len = max(max_len, right - left + 1)

    return max_len

# Minimum Window Substring
def minWindow(s, t):
    need = Counter(t)
    window = defaultdict(int)

    left = 0
    valid = 0
    start, min_len = 0, float('inf')

    for right, c in enumerate(s):
        if c in need:
            window[c] += 1
            if window[c] == need[c]:
                valid += 1

        while valid == len(need):
            if right - left + 1 < min_len:
                min_len = right - left + 1
                start = left

            left_char = s[left]
            if left_char in need:
                if window[left_char] == need[left_char]:
                    valid -= 1
                window[left_char] -= 1
            left += 1

    return "" if min_len == float('inf') else s[start:start + min_len]

# Permutation in String
def checkInclusion(s1, s2):
    if len(s1) > len(s2):
        return False

    s1_count = Counter(s1)
    window = Counter(s2[:len(s1)])

    if s1_count == window:
        return True

    for i in range(len(s1), len(s2)):
        window[s2[i]] += 1
        left = s2[i - len(s1)]
        window[left] -= 1
        if window[left] == 0:
            del window[left]

        if s1_count == window:
            return True

    return False`,
      cpp: `// Longest Substring Without Repeating Characters
int lengthOfLongestSubstring(std::string s) {
    std::unordered_set<char> window;
    int left = 0, maxLen = 0;

    for (int right = 0; right < s.length(); right++) {
        while (window.count(s[right])) {
            window.erase(s[left++]);
        }
        window.insert(s[right]);
        maxLen = std::max(maxLen, right - left + 1);
    }

    return maxLen;
}`,
      javascript: `// Longest Substring Without Repeating Characters
function lengthOfLongestSubstring(s) {
  const window = new Set();
  let left = 0;
  let maxLen = 0;

  for (let right = 0; right < s.length; right++) {
    while (window.has(s[right])) {
      window.delete(s[left++]);
    }
    window.add(s[right]);
    maxLen = Math.max(maxLen, right - left + 1);
  }

  return maxLen;
}

// Minimum Window Substring
function minWindow(s, t) {
  const need = new Map();
  for (const c of t) {
    need.set(c, (need.get(c) || 0) + 1);
  }

  const window = new Map();
  let left = 0, valid = 0;
  let start = 0, minLen = Infinity;

  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    if (need.has(c)) {
      window.set(c, (window.get(c) || 0) + 1);
      if (window.get(c) === need.get(c)) valid++;
    }

    while (valid === need.size) {
      if (right - left + 1 < minLen) {
        minLen = right - left + 1;
        start = left;
      }

      const leftChar = s[left];
      if (need.has(leftChar)) {
        if (window.get(leftChar) === need.get(leftChar)) valid--;
        window.set(leftChar, window.get(leftChar) - 1);
      }
      left++;
    }
  }

  return minLen === Infinity ? "" : s.substring(start, start + minLen);
}`,
    },
    keyPoints: [
      "Two pointers: left (shrink) and right (expand)",
      "Expand: always move right, add to window",
      "Shrink: move left when condition violated",
      "Update answer either after expanding or after shrinking",
      "Fixed-size: shrink when i >= k - 1",
    ],
    commonMistakes: [
      "Off-by-one in window size (right - left + 1, not right - left)",
      "Forgetting to update window when shrinking",
      "Wrong condition for shrinking",
      "Not handling empty string edge case",
    ],
    relatedProblems: [
      "Longest Substring Without Repeating Characters",
      "Minimum Window Substring",
      "Permutation in String",
      "Sliding Window Maximum",
    ],
    relatedPatterns: ["sliding-window"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "graph-adjacency-list",
    name: "Graph Adjacency List Setup",
    slug: "graph-adjacency-list",
    category: "Algorithm Idioms",
    description:
      "Building a graph from edge list is a common first step in graph problems. An adjacency list representation is memory efficient and allows O(1) access to neighbors.",
    timeComplexity: "O(V + E)",
    spaceComplexity: "O(V + E)",
    whenToUse: [
      "Any graph traversal (BFS, DFS)",
      "Finding connected components",
      "Topological sort",
      "Shortest path algorithms",
      "Cycle detection",
    ],
    codeSnippets: {
      java: `// Undirected graph from edges
// edges = [[0,1], [1,2], [2,0]]
List<List<Integer>> buildGraph(int n, int[][] edges) {
    List<List<Integer>> graph = new ArrayList<>();
    for (int i = 0; i < n; i++) {
        graph.add(new ArrayList<>());
    }

    for (int[] edge : edges) {
        int u = edge[0], v = edge[1];
        graph.get(u).add(v);
        graph.get(v).add(u);  // Remove for directed graph
    }

    return graph;
}

// Directed graph
List<List<Integer>> buildDirectedGraph(int n, int[][] edges) {
    List<List<Integer>> graph = new ArrayList<>();
    for (int i = 0; i < n; i++) {
        graph.add(new ArrayList<>());
    }

    for (int[] edge : edges) {
        graph.get(edge[0]).add(edge[1]);
    }

    return graph;
}

// Weighted graph
List<List<int[]>> buildWeightedGraph(int n, int[][] edges) {
    List<List<int[]>> graph = new ArrayList<>();
    for (int i = 0; i < n; i++) {
        graph.add(new ArrayList<>());
    }

    for (int[] edge : edges) {
        int u = edge[0], v = edge[1], w = edge[2];
        graph.get(u).add(new int[]{v, w});
        graph.get(v).add(new int[]{u, w});  // Remove for directed
    }

    return graph;
}

// Using HashMap (for sparse graphs or non-integer nodes)
Map<Integer, List<Integer>> buildGraphMap(int[][] edges) {
    Map<Integer, List<Integer>> graph = new HashMap<>();

    for (int[] edge : edges) {
        graph.computeIfAbsent(edge[0], k -> new ArrayList<>()).add(edge[1]);
        graph.computeIfAbsent(edge[1], k -> new ArrayList<>()).add(edge[0]);
    }

    return graph;
}

// Course Schedule (directed graph + topological sort)
public boolean canFinish(int numCourses, int[][] prerequisites) {
    List<List<Integer>> graph = new ArrayList<>();
    int[] inDegree = new int[numCourses];

    for (int i = 0; i < numCourses; i++) {
        graph.add(new ArrayList<>());
    }

    // Build graph: edge from prereq to course
    for (int[] prereq : prerequisites) {
        int course = prereq[0], pre = prereq[1];
        graph.get(pre).add(course);
        inDegree[course]++;
    }

    // BFS with in-degree
    Queue<Integer> queue = new LinkedList<>();
    for (int i = 0; i < numCourses; i++) {
        if (inDegree[i] == 0) {
            queue.offer(i);
        }
    }

    int completed = 0;
    while (!queue.isEmpty()) {
        int course = queue.poll();
        completed++;

        for (int next : graph.get(course)) {
            inDegree[next]--;
            if (inDegree[next] == 0) {
                queue.offer(next);
            }
        }
    }

    return completed == numCourses;
}

// Clone Graph
public Node cloneGraph(Node node) {
    if (node == null) return null;

    Map<Node, Node> visited = new HashMap<>();
    Queue<Node> queue = new LinkedList<>();

    queue.offer(node);
    visited.put(node, new Node(node.val));

    while (!queue.isEmpty()) {
        Node curr = queue.poll();

        for (Node neighbor : curr.neighbors) {
            if (!visited.containsKey(neighbor)) {
                visited.put(neighbor, new Node(neighbor.val));
                queue.offer(neighbor);
            }
            visited.get(curr).neighbors.add(visited.get(neighbor));
        }
    }

    return visited.get(node);
}`,
      python: `from collections import defaultdict, deque

# Undirected graph
def build_graph(n, edges):
    graph = defaultdict(list)
    for u, v in edges:
        graph[u].append(v)
        graph[v].append(u)
    return graph

# Or using list of lists
def build_graph_list(n, edges):
    graph = [[] for _ in range(n)]
    for u, v in edges:
        graph[u].append(v)
        graph[v].append(u)
    return graph

# Weighted graph
def build_weighted_graph(n, edges):
    graph = defaultdict(list)
    for u, v, w in edges:
        graph[u].append((v, w))
        graph[v].append((u, w))
    return graph

# Course Schedule
def canFinish(numCourses, prerequisites):
    graph = defaultdict(list)
    in_degree = [0] * numCourses

    for course, pre in prerequisites:
        graph[pre].append(course)
        in_degree[course] += 1

    queue = deque([i for i in range(numCourses) if in_degree[i] == 0])
    completed = 0

    while queue:
        course = queue.popleft()
        completed += 1

        for next_course in graph[course]:
            in_degree[next_course] -= 1
            if in_degree[next_course] == 0:
                queue.append(next_course)

    return completed == numCourses

# Clone Graph
def cloneGraph(node):
    if not node:
        return None

    visited = {node: Node(node.val)}
    queue = deque([node])

    while queue:
        curr = queue.popleft()

        for neighbor in curr.neighbors:
            if neighbor not in visited:
                visited[neighbor] = Node(neighbor.val)
                queue.append(neighbor)
            visited[curr].neighbors.append(visited[neighbor])

    return visited[node]`,
      cpp: `// Undirected graph
std::vector<std::vector<int>> buildGraph(int n, std::vector<std::vector<int>>& edges) {
    std::vector<std::vector<int>> graph(n);
    for (auto& edge : edges) {
        graph[edge[0]].push_back(edge[1]);
        graph[edge[1]].push_back(edge[0]);
    }
    return graph;
}

// Weighted graph
std::vector<std::vector<std::pair<int, int>>> buildWeightedGraph(
    int n, std::vector<std::vector<int>>& edges) {
    std::vector<std::vector<std::pair<int, int>>> graph(n);
    for (auto& edge : edges) {
        graph[edge[0]].push_back({edge[1], edge[2]});
        graph[edge[1]].push_back({edge[0], edge[2]});
    }
    return graph;
}`,
      javascript: `// Undirected graph
function buildGraph(n, edges) {
  const graph = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) {
    graph[u].push(v);
    graph[v].push(u);
  }
  return graph;
}

// Using Map
function buildGraphMap(edges) {
  const graph = new Map();
  for (const [u, v] of edges) {
    if (!graph.has(u)) graph.set(u, []);
    if (!graph.has(v)) graph.set(v, []);
    graph.get(u).push(v);
    graph.get(v).push(u);
  }
  return graph;
}

// Course Schedule
function canFinish(numCourses, prerequisites) {
  const graph = Array.from({ length: numCourses }, () => []);
  const inDegree = new Array(numCourses).fill(0);

  for (const [course, pre] of prerequisites) {
    graph[pre].push(course);
    inDegree[course]++;
  }

  const queue = [];
  for (let i = 0; i < numCourses; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }

  let completed = 0;
  while (queue.length) {
    const course = queue.shift();
    completed++;

    for (const next of graph[course]) {
      inDegree[next]--;
      if (inDegree[next] === 0) queue.push(next);
    }
  }

  return completed === numCourses;
}`,
    },
    keyPoints: [
      "Initialize with n empty lists: graph = [[] for _ in range(n)]",
      "Undirected: add edge both ways (u→v and v→u)",
      "Directed: add edge one way only",
      "Weighted: store (neighbor, weight) tuples",
      "Use defaultdict(list) in Python for cleaner code",
    ],
    commonMistakes: [
      "Forgetting to add both directions for undirected graph",
      "Index out of bounds if node numbering doesn't start at 0",
      "Not initializing graph with enough nodes",
      "Confusing edge direction in directed graphs",
    ],
    relatedProblems: [
      "Course Schedule",
      "Clone Graph",
      "Number of Connected Components",
      "Graph Valid Tree",
      "Shortest Path",
    ],
    relatedPatterns: ["graphs"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "two-pointer-technique",
    name: "Two Pointer Technique",
    slug: "two-pointer-technique",
    category: "Algorithm Idioms",
    description:
      "Two pointers scan through data from different positions (start/end, or both from start at different speeds). This technique often reduces O(n²) to O(n) for problems involving pairs or ranges.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    whenToUse: [
      "Finding pairs with a target sum in sorted array",
      "Removing duplicates in-place",
      "Partitioning arrays (Dutch National Flag)",
      "Reversing arrays/strings",
      "Fast and slow pointers for cycle detection",
    ],
    codeSnippets: {
      java: `// Pattern 1: Opposite ends (sorted array)
// Two Sum II - Input Array is Sorted
public int[] twoSum(int[] numbers, int target) {
    int left = 0, right = numbers.length - 1;

    while (left < right) {
        int sum = numbers[left] + numbers[right];

        if (sum == target) {
            return new int[]{left + 1, right + 1};  // 1-indexed
        } else if (sum < target) {
            left++;
        } else {
            right--;
        }
    }

    return new int[]{-1, -1};
}

// 3Sum - find triplets summing to 0
public List<List<Integer>> threeSum(int[] nums) {
    List<List<Integer>> result = new ArrayList<>();
    Arrays.sort(nums);

    for (int i = 0; i < nums.length - 2; i++) {
        // Skip duplicates for first element
        if (i > 0 && nums[i] == nums[i - 1]) continue;

        int target = -nums[i];
        int left = i + 1, right = nums.length - 1;

        while (left < right) {
            int sum = nums[left] + nums[right];

            if (sum == target) {
                result.add(Arrays.asList(nums[i], nums[left], nums[right]));
                left++;
                right--;

                // Skip duplicates
                while (left < right && nums[left] == nums[left - 1]) left++;
                while (left < right && nums[right] == nums[right + 1]) right--;
            } else if (sum < target) {
                left++;
            } else {
                right--;
            }
        }
    }

    return result;
}

// Pattern 2: Same direction (slow/fast)
// Remove Duplicates from Sorted Array
public int removeDuplicates(int[] nums) {
    if (nums.length == 0) return 0;

    int slow = 0;  // Position for next unique element

    for (int fast = 1; fast < nums.length; fast++) {
        if (nums[fast] != nums[slow]) {
            slow++;
            nums[slow] = nums[fast];
        }
    }

    return slow + 1;  // Length of unique elements
}

// Move Zeroes
public void moveZeroes(int[] nums) {
    int slow = 0;  // Position for next non-zero

    for (int fast = 0; fast < nums.length; fast++) {
        if (nums[fast] != 0) {
            // Swap nums[slow] and nums[fast]
            int temp = nums[slow];
            nums[slow] = nums[fast];
            nums[fast] = temp;
            slow++;
        }
    }
}

// Pattern 3: Dutch National Flag (3-way partition)
// Sort Colors (0s, 1s, 2s)
public void sortColors(int[] nums) {
    int low = 0;          // Boundary for 0s (exclusive)
    int mid = 0;          // Current element
    int high = nums.length - 1;  // Boundary for 2s (exclusive)

    while (mid <= high) {
        if (nums[mid] == 0) {
            swap(nums, low++, mid++);
        } else if (nums[mid] == 1) {
            mid++;
        } else {  // nums[mid] == 2
            swap(nums, mid, high--);
            // Don't increment mid, need to check swapped element
        }
    }
}

// Pattern 4: Linked list slow/fast
// Find middle of linked list
public ListNode findMiddle(ListNode head) {
    ListNode slow = head, fast = head;

    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
    }

    return slow;  // Middle (or second middle if even)
}

// Detect cycle
public boolean hasCycle(ListNode head) {
    ListNode slow = head, fast = head;

    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;

        if (slow == fast) return true;
    }

    return false;
}

// Container With Most Water
public int maxArea(int[] height) {
    int left = 0, right = height.length - 1;
    int maxWater = 0;

    while (left < right) {
        int water = Math.min(height[left], height[right]) * (right - left);
        maxWater = Math.max(maxWater, water);

        // Move the shorter line inward
        if (height[left] < height[right]) {
            left++;
        } else {
            right--;
        }
    }

    return maxWater;
}`,
      python: `# Two Sum II
def twoSum(numbers, target):
    left, right = 0, len(numbers) - 1

    while left < right:
        total = numbers[left] + numbers[right]

        if total == target:
            return [left + 1, right + 1]
        elif total < target:
            left += 1
        else:
            right -= 1

    return [-1, -1]

# 3Sum
def threeSum(nums):
    nums.sort()
    result = []

    for i in range(len(nums) - 2):
        if i > 0 and nums[i] == nums[i - 1]:
            continue

        left, right = i + 1, len(nums) - 1

        while left < right:
            total = nums[i] + nums[left] + nums[right]

            if total == 0:
                result.append([nums[i], nums[left], nums[right]])
                left += 1
                right -= 1

                while left < right and nums[left] == nums[left - 1]:
                    left += 1
                while left < right and nums[right] == nums[right + 1]:
                    right -= 1
            elif total < 0:
                left += 1
            else:
                right -= 1

    return result

# Remove Duplicates
def removeDuplicates(nums):
    if not nums:
        return 0

    slow = 0

    for fast in range(1, len(nums)):
        if nums[fast] != nums[slow]:
            slow += 1
            nums[slow] = nums[fast]

    return slow + 1

# Linked List Cycle
def hasCycle(head):
    slow = fast = head

    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next

        if slow == fast:
            return True

    return False`,
      cpp: `// Two Sum II
std::vector<int> twoSum(std::vector<int>& numbers, int target) {
    int left = 0, right = numbers.size() - 1;

    while (left < right) {
        int sum = numbers[left] + numbers[right];

        if (sum == target) {
            return {left + 1, right + 1};
        } else if (sum < target) {
            left++;
        } else {
            right--;
        }
    }

    return {-1, -1};
}

// Remove Duplicates
int removeDuplicates(std::vector<int>& nums) {
    if (nums.empty()) return 0;

    int slow = 0;
    for (int fast = 1; fast < nums.size(); fast++) {
        if (nums[fast] != nums[slow]) {
            nums[++slow] = nums[fast];
        }
    }

    return slow + 1;
}`,
      javascript: `// Two Sum II
function twoSum(numbers, target) {
  let left = 0, right = numbers.length - 1;

  while (left < right) {
    const sum = numbers[left] + numbers[right];

    if (sum === target) {
      return [left + 1, right + 1];
    } else if (sum < target) {
      left++;
    } else {
      right--;
    }
  }

  return [-1, -1];
}

// 3Sum
function threeSum(nums) {
  nums.sort((a, b) => a - b);
  const result = [];

  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;

    let left = i + 1, right = nums.length - 1;

    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];

      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]]);
        left++;
        right--;

        while (left < right && nums[left] === nums[left - 1]) left++;
        while (left < right && nums[right] === nums[right + 1]) right--;
      } else if (sum < 0) {
        left++;
      } else {
        right--;
      }
    }
  }

  return result;
}

// Remove Duplicates
function removeDuplicates(nums) {
  if (!nums.length) return 0;

  let slow = 0;

  for (let fast = 1; fast < nums.length; fast++) {
    if (nums[fast] !== nums[slow]) {
      nums[++slow] = nums[fast];
    }
  }

  return slow + 1;
}`,
    },
    keyPoints: [
      "Opposite ends: move pointers toward each other",
      "Same direction: slow maintains result, fast explores",
      "Dutch Flag: three pointers for 3-way partition",
      "Slow/fast: fast moves 2x speed for cycle detection",
      "Always handle duplicates in sorted arrays",
    ],
    commonMistakes: [
      "Not skipping duplicates (causes duplicate results in 3Sum)",
      "Wrong condition: left < right vs left <= right",
      "Forgetting to sort array for two-sum variants",
      "Infinite loop from wrong pointer update",
    ],
    relatedProblems: [
      "Two Sum II",
      "3Sum",
      "Remove Duplicates",
      "Move Zeroes",
      "Container With Most Water",
      "Linked List Cycle",
    ],
    relatedPatterns: ["two-pointers"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "dfs-bfs-templates",
    name: "DFS and BFS Templates",
    slug: "dfs-bfs-templates",
    category: "Algorithm Idioms",
    description:
      "DFS (Depth-First Search) explores as far as possible along a branch before backtracking. BFS (Breadth-First Search) explores all neighbors at current depth before moving deeper. Choose based on the problem structure.",
    timeComplexity: "O(V + E)",
    spaceComplexity: "O(V)",
    whenToUse: [
      "DFS: Path finding, backtracking, tree traversals, cycle detection",
      "BFS: Shortest path in unweighted graph, level-order traversal",
      "DFS: When solution is far from root or needs full path",
      "BFS: When solution is close to root or need shortest",
    ],
    codeSnippets: {
      java: `// DFS - Recursive (most common for trees)
void dfs(TreeNode node) {
    if (node == null) return;

    // Pre-order: process node BEFORE children
    process(node);
    dfs(node.left);
    dfs(node.right);

    // In-order: process BETWEEN children
    // dfs(node.left);
    // process(node);
    // dfs(node.right);

    // Post-order: process AFTER children
    // dfs(node.left);
    // dfs(node.right);
    // process(node);
}

// DFS - Iterative with stack
void dfsIterative(TreeNode root) {
    if (root == null) return;

    Stack<TreeNode> stack = new Stack<>();
    stack.push(root);

    while (!stack.isEmpty()) {
        TreeNode node = stack.pop();
        process(node);

        // Push right first so left is processed first
        if (node.right != null) stack.push(node.right);
        if (node.left != null) stack.push(node.left);
    }
}

// DFS on Graph (with visited set)
void dfsGraph(Map<Integer, List<Integer>> graph, int start) {
    Set<Integer> visited = new HashSet<>();
    dfsHelper(graph, start, visited);
}

void dfsHelper(Map<Integer, List<Integer>> graph, int node, Set<Integer> visited) {
    if (visited.contains(node)) return;

    visited.add(node);
    process(node);

    for (int neighbor : graph.getOrDefault(node, new ArrayList<>())) {
        dfsHelper(graph, neighbor, visited);
    }
}

// BFS - Queue based (standard)
void bfs(TreeNode root) {
    if (root == null) return;

    Queue<TreeNode> queue = new LinkedList<>();
    queue.offer(root);

    while (!queue.isEmpty()) {
        TreeNode node = queue.poll();
        process(node);

        if (node.left != null) queue.offer(node.left);
        if (node.right != null) queue.offer(node.right);
    }
}

// BFS - Level order (track level)
List<List<Integer>> levelOrder(TreeNode root) {
    List<List<Integer>> result = new ArrayList<>();
    if (root == null) return result;

    Queue<TreeNode> queue = new LinkedList<>();
    queue.offer(root);

    while (!queue.isEmpty()) {
        int levelSize = queue.size();  // KEY: process entire level
        List<Integer> level = new ArrayList<>();

        for (int i = 0; i < levelSize; i++) {
            TreeNode node = queue.poll();
            level.add(node.val);

            if (node.left != null) queue.offer(node.left);
            if (node.right != null) queue.offer(node.right);
        }

        result.add(level);
    }

    return result;
}

// BFS - Shortest Path (unweighted graph)
int shortestPath(Map<Integer, List<Integer>> graph, int start, int end) {
    Queue<Integer> queue = new LinkedList<>();
    Set<Integer> visited = new HashSet<>();

    queue.offer(start);
    visited.add(start);
    int distance = 0;

    while (!queue.isEmpty()) {
        int levelSize = queue.size();

        for (int i = 0; i < levelSize; i++) {
            int node = queue.poll();

            if (node == end) return distance;

            for (int neighbor : graph.getOrDefault(node, new ArrayList<>())) {
                if (!visited.contains(neighbor)) {
                    visited.add(neighbor);
                    queue.offer(neighbor);
                }
            }
        }

        distance++;
    }

    return -1;  // Not reachable
}

// DFS with path tracking (backtracking)
List<List<Integer>> allPaths(int[][] graph) {
    List<List<Integer>> result = new ArrayList<>();
    List<Integer> path = new ArrayList<>();
    path.add(0);
    dfsPath(graph, 0, path, result);
    return result;
}

void dfsPath(int[][] graph, int node, List<Integer> path, List<List<Integer>> result) {
    if (node == graph.length - 1) {
        result.add(new ArrayList<>(path));  // Add COPY
        return;
    }

    for (int next : graph[node]) {
        path.add(next);          // Choose
        dfsPath(graph, next, path, result);  // Explore
        path.remove(path.size() - 1);  // Unchoose
    }
}`,
      python: `from collections import deque

# DFS - Recursive
def dfs(root):
    if not root:
        return

    process(root)  # Pre-order
    dfs(root.left)
    dfs(root.right)

# DFS - Iterative with stack
def dfs_iterative(root):
    if not root:
        return

    stack = [root]

    while stack:
        node = stack.pop()
        process(node)

        if node.right:
            stack.append(node.right)
        if node.left:
            stack.append(node.left)

# DFS on Graph
def dfs_graph(graph, start):
    visited = set()

    def dfs(node):
        if node in visited:
            return
        visited.add(node)
        process(node)
        for neighbor in graph.get(node, []):
            dfs(neighbor)

    dfs(start)

# BFS - Level order
def level_order(root):
    if not root:
        return []

    result = []
    queue = deque([root])

    while queue:
        level_size = len(queue)
        level = []

        for _ in range(level_size):
            node = queue.popleft()
            level.append(node.val)

            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)

        result.append(level)

    return result

# BFS - Shortest Path
def shortest_path(graph, start, end):
    queue = deque([start])
    visited = {start}
    distance = 0

    while queue:
        for _ in range(len(queue)):
            node = queue.popleft()

            if node == end:
                return distance

            for neighbor in graph.get(node, []):
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)

        distance += 1

    return -1`,
      cpp: `// DFS - Recursive
void dfs(TreeNode* root) {
    if (!root) return;

    process(root);
    dfs(root->left);
    dfs(root->right);
}

// BFS - Level order
std::vector<std::vector<int>> levelOrder(TreeNode* root) {
    std::vector<std::vector<int>> result;
    if (!root) return result;

    std::queue<TreeNode*> q;
    q.push(root);

    while (!q.empty()) {
        int levelSize = q.size();
        std::vector<int> level;

        for (int i = 0; i < levelSize; i++) {
            TreeNode* node = q.front();
            q.pop();
            level.push_back(node->val);

            if (node->left) q.push(node->left);
            if (node->right) q.push(node->right);
        }

        result.push_back(level);
    }

    return result;
}`,
      javascript: `// DFS - Recursive
function dfs(root) {
  if (!root) return;

  process(root);  // Pre-order
  dfs(root.left);
  dfs(root.right);
}

// DFS - Iterative
function dfsIterative(root) {
  if (!root) return;

  const stack = [root];

  while (stack.length) {
    const node = stack.pop();
    process(node);

    if (node.right) stack.push(node.right);
    if (node.left) stack.push(node.left);
  }
}

// BFS - Level order
function levelOrder(root) {
  if (!root) return [];

  const result = [];
  const queue = [root];

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

  return result;
}

// BFS - Shortest Path
function shortestPath(graph, start, end) {
  const queue = [start];
  const visited = new Set([start]);
  let distance = 0;

  while (queue.length) {
    const levelSize = queue.length;

    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();

      if (node === end) return distance;

      for (const neighbor of graph[node] || []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }

    distance++;
  }

  return -1;
}`,
    },
    keyPoints: [
      "DFS uses stack (recursion or explicit), BFS uses queue",
      "BFS level-order: process queue.size() nodes per iteration",
      "BFS guarantees shortest path in unweighted graphs",
      "DFS for backtracking: choose → explore → unchoose",
      "Always mark visited BEFORE adding to queue (BFS)",
    ],
    commonMistakes: [
      "BFS: marking visited after dequeue instead of before enqueue (causes duplicates)",
      "DFS: not adding copy of path to result (all paths become same)",
      "Forgetting to check null/empty before processing",
      "Using wrong data structure (stack vs queue)",
    ],
    relatedProblems: [
      "Binary Tree Level Order Traversal",
      "Number of Islands",
      "Word Ladder",
      "Clone Graph",
      "All Paths From Source to Target",
    ],
    relatedPatterns: ["trees", "graphs"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "prefix-sum-technique",
    name: "Prefix Sum Technique",
    slug: "prefix-sum-technique",
    category: "Algorithm Idioms",
    description:
      "Prefix sum precomputes cumulative sums so that any range sum can be calculated in O(1). Combined with a HashMap, it efficiently solves 'subarray sum equals k' problems.",
    timeComplexity: "O(n) build, O(1) query",
    spaceComplexity: "O(n)",
    whenToUse: [
      "Range sum queries",
      "Subarray sum equals target",
      "Count subarrays with sum k",
      "Equilibrium index",
      "Product except self",
    ],
    codeSnippets: {
      java: `// Build prefix sum array
// prefix[i] = sum of nums[0..i-1]
int[] buildPrefixSum(int[] nums) {
    int[] prefix = new int[nums.length + 1];
    for (int i = 0; i < nums.length; i++) {
        prefix[i + 1] = prefix[i] + nums[i];
    }
    return prefix;
}

// Range sum [i, j] inclusive
int rangeSum(int[] prefix, int i, int j) {
    return prefix[j + 1] - prefix[i];
}

// Subarray Sum Equals K
// prefix[j] - prefix[i] = k means subarray [i, j-1] sums to k
public int subarraySum(int[] nums, int k) {
    Map<Integer, Integer> prefixCount = new HashMap<>();
    prefixCount.put(0, 1);  // Empty prefix has sum 0

    int sum = 0;
    int count = 0;

    for (int num : nums) {
        sum += num;

        // Check if (sum - k) exists as a previous prefix
        if (prefixCount.containsKey(sum - k)) {
            count += prefixCount.get(sum - k);
        }

        prefixCount.put(sum, prefixCount.getOrDefault(sum, 0) + 1);
    }

    return count;
}

// Continuous Subarray Sum (sum is multiple of k)
public boolean checkSubarraySum(int[] nums, int k) {
    Map<Integer, Integer> remainderIndex = new HashMap<>();
    remainderIndex.put(0, -1);  // Handle case where subarray starts at 0

    int sum = 0;

    for (int i = 0; i < nums.length; i++) {
        sum += nums[i];
        int remainder = sum % k;

        if (remainderIndex.containsKey(remainder)) {
            if (i - remainderIndex.get(remainder) >= 2) {
                return true;  // Subarray length >= 2
            }
        } else {
            remainderIndex.put(remainder, i);  // Only store first occurrence
        }
    }

    return false;
}

// Product of Array Except Self (without division)
public int[] productExceptSelf(int[] nums) {
    int n = nums.length;
    int[] result = new int[n];

    // Prefix products
    result[0] = 1;
    for (int i = 1; i < n; i++) {
        result[i] = result[i - 1] * nums[i - 1];
    }

    // Suffix products
    int suffix = 1;
    for (int i = n - 1; i >= 0; i--) {
        result[i] *= suffix;
        suffix *= nums[i];
    }

    return result;
}

// 2D Prefix Sum
int[][] buildPrefixSum2D(int[][] matrix) {
    int m = matrix.length, n = matrix[0].length;
    int[][] prefix = new int[m + 1][n + 1];

    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            prefix[i][j] = matrix[i-1][j-1]
                         + prefix[i-1][j]
                         + prefix[i][j-1]
                         - prefix[i-1][j-1];
        }
    }

    return prefix;
}

// Query sum of rectangle (r1, c1) to (r2, c2)
int query2D(int[][] prefix, int r1, int c1, int r2, int c2) {
    return prefix[r2+1][c2+1]
         - prefix[r1][c2+1]
         - prefix[r2+1][c1]
         + prefix[r1][c1];
}`,
      python: `# Build prefix sum
def build_prefix_sum(nums):
    prefix = [0]
    for num in nums:
        prefix.append(prefix[-1] + num)
    return prefix

# Range sum [i, j] inclusive
def range_sum(prefix, i, j):
    return prefix[j + 1] - prefix[i]

# Or use itertools.accumulate
from itertools import accumulate
prefix = list(accumulate(nums, initial=0))

# Subarray Sum Equals K
def subarraySum(nums, k):
    prefix_count = {0: 1}
    curr_sum = 0
    count = 0

    for num in nums:
        curr_sum += num

        if curr_sum - k in prefix_count:
            count += prefix_count[curr_sum - k]

        prefix_count[curr_sum] = prefix_count.get(curr_sum, 0) + 1

    return count

# Product Except Self
def productExceptSelf(nums):
    n = len(nums)
    result = [1] * n

    # Prefix products
    for i in range(1, n):
        result[i] = result[i - 1] * nums[i - 1]

    # Suffix products
    suffix = 1
    for i in range(n - 1, -1, -1):
        result[i] *= suffix
        suffix *= nums[i]

    return result`,
      cpp: `// Prefix sum array
std::vector<int> buildPrefixSum(const std::vector<int>& nums) {
    std::vector<int> prefix(nums.size() + 1, 0);
    for (int i = 0; i < nums.size(); i++) {
        prefix[i + 1] = prefix[i] + nums[i];
    }
    return prefix;
}

// Subarray Sum Equals K
int subarraySum(std::vector<int>& nums, int k) {
    std::unordered_map<int, int> prefixCount;
    prefixCount[0] = 1;

    int sum = 0, count = 0;

    for (int num : nums) {
        sum += num;

        if (prefixCount.count(sum - k)) {
            count += prefixCount[sum - k];
        }

        prefixCount[sum]++;
    }

    return count;
}`,
      javascript: `// Build prefix sum
function buildPrefixSum(nums) {
  const prefix = [0];
  for (const num of nums) {
    prefix.push(prefix[prefix.length - 1] + num);
  }
  return prefix;
}

// Range sum [i, j] inclusive
function rangeSum(prefix, i, j) {
  return prefix[j + 1] - prefix[i];
}

// Subarray Sum Equals K
function subarraySum(nums, k) {
  const prefixCount = new Map([[0, 1]]);
  let sum = 0;
  let count = 0;

  for (const num of nums) {
    sum += num;

    if (prefixCount.has(sum - k)) {
      count += prefixCount.get(sum - k);
    }

    prefixCount.set(sum, (prefixCount.get(sum) || 0) + 1);
  }

  return count;
}

// Product Except Self
function productExceptSelf(nums) {
  const n = nums.length;
  const result = new Array(n).fill(1);

  // Prefix products
  for (let i = 1; i < n; i++) {
    result[i] = result[i - 1] * nums[i - 1];
  }

  // Suffix products
  let suffix = 1;
  for (let i = n - 1; i >= 0; i--) {
    result[i] *= suffix;
    suffix *= nums[i];
  }

  return result;
}`,
    },
    keyPoints: [
      "prefix[i] = sum of nums[0..i-1], prefix[0] = 0",
      "Range sum [i,j] = prefix[j+1] - prefix[i]",
      "HashMap stores prefix → count for 'sum equals k' problems",
      "Initialize map with {0: 1} to handle subarrays starting at index 0",
      "For 2D: use inclusion-exclusion principle",
    ],
    commonMistakes: [
      "Forgetting to initialize {0: 1} in prefix count map",
      "Off-by-one in range sum: j+1 not j",
      "For modulo problems, not handling negative remainders",
      "Not using 'first occurrence' for index-based problems",
    ],
    relatedProblems: [
      "Subarray Sum Equals K",
      "Continuous Subarray Sum",
      "Product of Array Except Self",
      "Range Sum Query 2D",
    ],
    relatedPatterns: ["prefix-sum"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "dynamic-programming-patterns",
    name: "Dynamic Programming Patterns",
    slug: "dynamic-programming-patterns",
    category: "Algorithm Idioms",
    description:
      "Dynamic Programming solves complex problems by breaking them into overlapping subproblems. The key is defining the state, recurrence relation, and base cases. Common patterns include 1D/2D DP, state machine DP, and interval DP.",
    timeComplexity: "O(n × m) typical",
    spaceComplexity: "O(n) optimized",
    whenToUse: [
      "Optimization problems (min/max)",
      "Counting problems (number of ways)",
      "Decision problems (can we achieve X?)",
      "Problems with overlapping subproblems",
    ],
    codeSnippets: {
      java: `// Pattern 1: Linear DP (1D)
// Climbing Stairs - dp[i] = ways to reach step i
public int climbStairs(int n) {
    if (n <= 2) return n;

    int prev2 = 1, prev1 = 2;

    for (int i = 3; i <= n; i++) {
        int curr = prev1 + prev2;
        prev2 = prev1;
        prev1 = curr;
    }

    return prev1;
}

// House Robber - dp[i] = max money robbing houses 0..i
public int rob(int[] nums) {
    if (nums.length == 0) return 0;
    if (nums.length == 1) return nums[0];

    int prev2 = 0, prev1 = nums[0];

    for (int i = 1; i < nums.length; i++) {
        int curr = Math.max(prev1, prev2 + nums[i]);
        prev2 = prev1;
        prev1 = curr;
    }

    return prev1;
}

// Pattern 2: 2D DP
// Unique Paths - dp[i][j] = ways to reach (i, j)
public int uniquePaths(int m, int n) {
    int[][] dp = new int[m][n];

    // Base cases: first row and column = 1
    for (int i = 0; i < m; i++) dp[i][0] = 1;
    for (int j = 0; j < n; j++) dp[0][j] = 1;

    for (int i = 1; i < m; i++) {
        for (int j = 1; j < n; j++) {
            dp[i][j] = dp[i-1][j] + dp[i][j-1];
        }
    }

    return dp[m-1][n-1];
}

// Longest Common Subsequence
public int longestCommonSubsequence(String text1, String text2) {
    int m = text1.length(), n = text2.length();
    int[][] dp = new int[m + 1][n + 1];

    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (text1.charAt(i-1) == text2.charAt(j-1)) {
                dp[i][j] = dp[i-1][j-1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
            }
        }
    }

    return dp[m][n];
}

// Pattern 3: State Machine DP
// Best Time to Buy and Sell Stock with Cooldown
public int maxProfit(int[] prices) {
    int n = prices.length;
    // hold[i] = max profit on day i holding stock
    // sold[i] = max profit on day i just sold
    // rest[i] = max profit on day i resting

    int hold = Integer.MIN_VALUE;
    int sold = 0;
    int rest = 0;

    for (int price : prices) {
        int prevHold = hold;
        hold = Math.max(hold, rest - price);   // Buy
        rest = Math.max(rest, sold);           // Rest
        sold = prevHold + price;               // Sell
    }

    return Math.max(sold, rest);
}

// Pattern 4: Knapsack
// 0/1 Knapsack - each item used at most once
public int knapsack01(int[] weights, int[] values, int capacity) {
    int n = weights.length;
    int[] dp = new int[capacity + 1];

    for (int i = 0; i < n; i++) {
        // Iterate backwards to avoid using same item twice
        for (int w = capacity; w >= weights[i]; w--) {
            dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
        }
    }

    return dp[capacity];
}

// Unbounded Knapsack - items can be reused
// Coin Change - minimum coins to make amount
public int coinChange(int[] coins, int amount) {
    int[] dp = new int[amount + 1];
    Arrays.fill(dp, amount + 1);
    dp[0] = 0;

    for (int i = 1; i <= amount; i++) {
        for (int coin : coins) {
            if (coin <= i) {
                dp[i] = Math.min(dp[i], dp[i - coin] + 1);
            }
        }
    }

    return dp[amount] > amount ? -1 : dp[amount];
}

// Pattern 5: Interval DP
// Longest Palindromic Subsequence
public int longestPalindromeSubseq(String s) {
    int n = s.length();
    int[][] dp = new int[n][n];

    // Base case: single characters
    for (int i = 0; i < n; i++) {
        dp[i][i] = 1;
    }

    // Fill for increasing lengths
    for (int len = 2; len <= n; len++) {
        for (int i = 0; i <= n - len; i++) {
            int j = i + len - 1;

            if (s.charAt(i) == s.charAt(j)) {
                dp[i][j] = dp[i+1][j-1] + 2;
            } else {
                dp[i][j] = Math.max(dp[i+1][j], dp[i][j-1]);
            }
        }
    }

    return dp[0][n-1];
}`,
      python: `# Climbing Stairs - optimized space
def climbStairs(n):
    if n <= 2:
        return n

    prev2, prev1 = 1, 2

    for _ in range(3, n + 1):
        prev2, prev1 = prev1, prev2 + prev1

    return prev1

# House Robber
def rob(nums):
    prev2 = prev1 = 0

    for num in nums:
        prev2, prev1 = prev1, max(prev1, prev2 + num)

    return prev1

# Longest Common Subsequence
def longestCommonSubsequence(text1, text2):
    m, n = len(text1), len(text2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i-1] == text2[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])

    return dp[m][n]

# Coin Change
def coinChange(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0

    for i in range(1, amount + 1):
        for coin in coins:
            if coin <= i:
                dp[i] = min(dp[i], dp[i - coin] + 1)

    return dp[amount] if dp[amount] != float('inf') else -1

# Top-down with memoization
from functools import lru_cache

def longestPalindromeSubseq(s):
    @lru_cache(maxsize=None)
    def dp(i, j):
        if i > j:
            return 0
        if i == j:
            return 1
        if s[i] == s[j]:
            return dp(i + 1, j - 1) + 2
        return max(dp(i + 1, j), dp(i, j - 1))

    return dp(0, len(s) - 1)`,
      cpp: `// Climbing Stairs
int climbStairs(int n) {
    if (n <= 2) return n;

    int prev2 = 1, prev1 = 2;
    for (int i = 3; i <= n; i++) {
        int curr = prev1 + prev2;
        prev2 = prev1;
        prev1 = curr;
    }

    return prev1;
}

// Coin Change
int coinChange(std::vector<int>& coins, int amount) {
    std::vector<int> dp(amount + 1, amount + 1);
    dp[0] = 0;

    for (int i = 1; i <= amount; i++) {
        for (int coin : coins) {
            if (coin <= i) {
                dp[i] = std::min(dp[i], dp[i - coin] + 1);
            }
        }
    }

    return dp[amount] > amount ? -1 : dp[amount];
}`,
      javascript: `// Climbing Stairs
function climbStairs(n) {
  if (n <= 2) return n;

  let [prev2, prev1] = [1, 2];

  for (let i = 3; i <= n; i++) {
    [prev2, prev1] = [prev1, prev2 + prev1];
  }

  return prev1;
}

// House Robber
function rob(nums) {
  let prev2 = 0, prev1 = 0;

  for (const num of nums) {
    [prev2, prev1] = [prev1, Math.max(prev1, prev2 + num)];
  }

  return prev1;
}

// Coin Change
function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;

  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }

  return dp[amount] === Infinity ? -1 : dp[amount];
}

// LCS
function longestCommonSubsequence(text1, text2) {
  const m = text1.length, n = text2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp[m][n];
}`,
    },
    keyPoints: [
      "Define state: what does dp[i] or dp[i][j] represent?",
      "Find recurrence: how does dp[i] relate to previous states?",
      "Identify base cases: dp[0], dp[1], or boundary conditions",
      "Optimize space when only previous row/values are needed",
      "0/1 knapsack: iterate capacity backwards; unbounded: forwards",
    ],
    commonMistakes: [
      "Wrong state definition (not capturing all necessary info)",
      "Missing base cases",
      "Wrong iteration order (0/1 vs unbounded knapsack)",
      "Integer overflow in multiplication/addition",
    ],
    relatedProblems: [
      "Climbing Stairs",
      "House Robber",
      "Coin Change",
      "Longest Common Subsequence",
      "Edit Distance",
    ],
    relatedPatterns: ["dynamic-programming"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "dijkstra-algorithm",
    name: "Dijkstra's Shortest Path",
    slug: "dijkstra-algorithm",
    category: "Algorithm Idioms",
    description:
      "Dijkstra's algorithm finds the shortest path from a source to all other vertices in a weighted graph with non-negative edges. It uses a priority queue to always process the vertex with the smallest known distance.",
    timeComplexity: "O((V + E) log V)",
    spaceComplexity: "O(V)",
    whenToUse: [
      "Shortest path in weighted graph (non-negative weights)",
      "Network routing problems",
      "Finding minimum cost path",
      "Single-source shortest path",
    ],
    codeSnippets: {
      java: `// Dijkstra's Algorithm
// graph[u] = list of {neighbor, weight}
public int[] dijkstra(List<List<int[]>> graph, int src) {
    int n = graph.size();
    int[] dist = new int[n];
    Arrays.fill(dist, Integer.MAX_VALUE);
    dist[src] = 0;

    // Min heap: {distance, node}
    PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[0] - b[0]);
    pq.offer(new int[]{0, src});

    while (!pq.isEmpty()) {
        int[] curr = pq.poll();
        int d = curr[0], u = curr[1];

        // Skip if we've found a better path
        if (d > dist[u]) continue;

        for (int[] edge : graph.get(u)) {
            int v = edge[0], w = edge[1];
            int newDist = dist[u] + w;

            if (newDist < dist[v]) {
                dist[v] = newDist;
                pq.offer(new int[]{newDist, v});
            }
        }
    }

    return dist;
}

// Network Delay Time
public int networkDelayTime(int[][] times, int n, int k) {
    // Build adjacency list
    List<List<int[]>> graph = new ArrayList<>();
    for (int i = 0; i <= n; i++) {
        graph.add(new ArrayList<>());
    }
    for (int[] time : times) {
        graph.get(time[0]).add(new int[]{time[1], time[2]});
    }

    // Dijkstra
    int[] dist = new int[n + 1];
    Arrays.fill(dist, Integer.MAX_VALUE);
    dist[k] = 0;

    PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[0] - b[0]);
    pq.offer(new int[]{0, k});

    while (!pq.isEmpty()) {
        int[] curr = pq.poll();
        int d = curr[0], u = curr[1];

        if (d > dist[u]) continue;

        for (int[] edge : graph.get(u)) {
            int v = edge[0], w = edge[1];
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.offer(new int[]{dist[v], v});
            }
        }
    }

    int maxDist = 0;
    for (int i = 1; i <= n; i++) {
        if (dist[i] == Integer.MAX_VALUE) return -1;
        maxDist = Math.max(maxDist, dist[i]);
    }

    return maxDist;
}

// Path Reconstruction
public List<Integer> shortestPath(List<List<int[]>> graph, int src, int dst) {
    int n = graph.size();
    int[] dist = new int[n];
    int[] parent = new int[n];
    Arrays.fill(dist, Integer.MAX_VALUE);
    Arrays.fill(parent, -1);
    dist[src] = 0;

    PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[0] - b[0]);
    pq.offer(new int[]{0, src});

    while (!pq.isEmpty()) {
        int[] curr = pq.poll();
        int d = curr[0], u = curr[1];

        if (d > dist[u]) continue;

        for (int[] edge : graph.get(u)) {
            int v = edge[0], w = edge[1];
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                parent[v] = u;
                pq.offer(new int[]{dist[v], v});
            }
        }
    }

    // Reconstruct path
    List<Integer> path = new ArrayList<>();
    if (dist[dst] == Integer.MAX_VALUE) return path;

    for (int curr = dst; curr != -1; curr = parent[curr]) {
        path.add(curr);
    }
    Collections.reverse(path);

    return path;
}`,
      python: `import heapq
from collections import defaultdict

def dijkstra(graph, src):
    """graph[u] = [(v, weight), ...]"""
    dist = {src: 0}
    pq = [(0, src)]

    while pq:
        d, u = heapq.heappop(pq)

        if d > dist.get(u, float('inf')):
            continue

        for v, w in graph[u]:
            new_dist = dist[u] + w
            if new_dist < dist.get(v, float('inf')):
                dist[v] = new_dist
                heapq.heappush(pq, (new_dist, v))

    return dist

# Network Delay Time
def networkDelayTime(times, n, k):
    graph = defaultdict(list)
    for u, v, w in times:
        graph[u].append((v, w))

    dist = {k: 0}
    pq = [(0, k)]

    while pq:
        d, u = heapq.heappop(pq)

        if d > dist.get(u, float('inf')):
            continue

        for v, w in graph[u]:
            new_dist = dist[u] + w
            if new_dist < dist.get(v, float('inf')):
                dist[v] = new_dist
                heapq.heappush(pq, (new_dist, v))

    if len(dist) != n:
        return -1

    return max(dist.values())

# Path With Minimum Effort (binary search + Dijkstra variant)
def minimumEffortPath(heights):
    m, n = len(heights), len(heights[0])
    dist = [[float('inf')] * n for _ in range(m)]
    dist[0][0] = 0

    pq = [(0, 0, 0)]  # (effort, row, col)

    while pq:
        effort, r, c = heapq.heappop(pq)

        if r == m - 1 and c == n - 1:
            return effort

        if effort > dist[r][c]:
            continue

        for dr, dc in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
            nr, nc = r + dr, c + dc
            if 0 <= nr < m and 0 <= nc < n:
                new_effort = max(effort, abs(heights[nr][nc] - heights[r][c]))
                if new_effort < dist[nr][nc]:
                    dist[nr][nc] = new_effort
                    heapq.heappush(pq, (new_effort, nr, nc))

    return dist[m-1][n-1]`,
      cpp: `#include <queue>
#include <vector>
#include <climits>

std::vector<int> dijkstra(std::vector<std::vector<std::pair<int, int>>>& graph, int src) {
    int n = graph.size();
    std::vector<int> dist(n, INT_MAX);
    dist[src] = 0;

    // Min heap: {distance, node}
    std::priority_queue<std::pair<int, int>,
                        std::vector<std::pair<int, int>>,
                        std::greater<>> pq;
    pq.push({0, src});

    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();

        if (d > dist[u]) continue;

        for (auto [v, w] : graph[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.push({dist[v], v});
            }
        }
    }

    return dist;
}`,
      javascript: `// Using a simple array-based priority queue
function dijkstra(graph, src) {
  const n = graph.length;
  const dist = new Array(n).fill(Infinity);
  dist[src] = 0;

  // Simple min heap using array
  const pq = [[0, src]];  // [distance, node]

  while (pq.length) {
    // Find minimum (in practice, use a proper heap)
    pq.sort((a, b) => a[0] - b[0]);
    const [d, u] = pq.shift();

    if (d > dist[u]) continue;

    for (const [v, w] of graph[u] || []) {
      const newDist = dist[u] + w;
      if (newDist < dist[v]) {
        dist[v] = newDist;
        pq.push([newDist, v]);
      }
    }
  }

  return dist;
}

// Network Delay Time
function networkDelayTime(times, n, k) {
  const graph = Array.from({ length: n + 1 }, () => []);
  for (const [u, v, w] of times) {
    graph[u].push([v, w]);
  }

  const dist = new Array(n + 1).fill(Infinity);
  dist[k] = 0;

  const pq = [[0, k]];

  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    const [d, u] = pq.shift();

    if (d > dist[u]) continue;

    for (const [v, w] of graph[u]) {
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        pq.push([dist[v], v]);
      }
    }
  }

  let maxDist = 0;
  for (let i = 1; i <= n; i++) {
    if (dist[i] === Infinity) return -1;
    maxDist = Math.max(maxDist, dist[i]);
  }

  return maxDist;
}`,
    },
    keyPoints: [
      "Use min-heap ordered by distance",
      "Skip nodes if current distance > known distance (lazy deletion)",
      "Only works with non-negative edge weights",
      "Time: O((V + E) log V) with binary heap",
      "Track parent[] for path reconstruction",
    ],
    commonMistakes: [
      "Using with negative edge weights (use Bellman-Ford instead)",
      "Not checking if popped distance > current best",
      "Forgetting to handle unreachable nodes",
      "Integer overflow when adding distances",
    ],
    relatedProblems: [
      "Network Delay Time",
      "Path With Minimum Effort",
      "Cheapest Flights Within K Stops",
      "Swim in Rising Water",
    ],
    relatedPatterns: ["graphs"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "topological-sort",
    name: "Topological Sort",
    slug: "topological-sort",
    category: "Algorithm Idioms",
    description:
      "Topological sort orders vertices of a DAG (Directed Acyclic Graph) such that for every edge u→v, u comes before v. It's used for dependency resolution, task scheduling, and cycle detection.",
    timeComplexity: "O(V + E)",
    spaceComplexity: "O(V)",
    whenToUse: [
      "Course scheduling with prerequisites",
      "Build systems (dependency order)",
      "Task scheduling",
      "Detecting cycles in directed graphs",
    ],
    codeSnippets: {
      java: `// Kahn's Algorithm (BFS-based)
public int[] topologicalSort(int numNodes, int[][] edges) {
    List<List<Integer>> graph = new ArrayList<>();
    int[] inDegree = new int[numNodes];

    for (int i = 0; i < numNodes; i++) {
        graph.add(new ArrayList<>());
    }

    for (int[] edge : edges) {
        graph.get(edge[0]).add(edge[1]);
        inDegree[edge[1]]++;
    }

    Queue<Integer> queue = new LinkedList<>();
    for (int i = 0; i < numNodes; i++) {
        if (inDegree[i] == 0) {
            queue.offer(i);
        }
    }

    int[] result = new int[numNodes];
    int index = 0;

    while (!queue.isEmpty()) {
        int node = queue.poll();
        result[index++] = node;

        for (int neighbor : graph.get(node)) {
            inDegree[neighbor]--;
            if (inDegree[neighbor] == 0) {
                queue.offer(neighbor);
            }
        }
    }

    // If not all nodes processed, there's a cycle
    return index == numNodes ? result : new int[0];
}

// Course Schedule II
public int[] findOrder(int numCourses, int[][] prerequisites) {
    List<List<Integer>> graph = new ArrayList<>();
    int[] inDegree = new int[numCourses];

    for (int i = 0; i < numCourses; i++) {
        graph.add(new ArrayList<>());
    }

    for (int[] prereq : prerequisites) {
        int course = prereq[0], pre = prereq[1];
        graph.get(pre).add(course);
        inDegree[course]++;
    }

    Queue<Integer> queue = new LinkedList<>();
    for (int i = 0; i < numCourses; i++) {
        if (inDegree[i] == 0) {
            queue.offer(i);
        }
    }

    int[] order = new int[numCourses];
    int index = 0;

    while (!queue.isEmpty()) {
        int course = queue.poll();
        order[index++] = course;

        for (int next : graph.get(course)) {
            inDegree[next]--;
            if (inDegree[next] == 0) {
                queue.offer(next);
            }
        }
    }

    return index == numCourses ? order : new int[0];
}

// DFS-based Topological Sort
public int[] topologicalSortDFS(int numNodes, int[][] edges) {
    List<List<Integer>> graph = new ArrayList<>();
    for (int i = 0; i < numNodes; i++) {
        graph.add(new ArrayList<>());
    }
    for (int[] edge : edges) {
        graph.get(edge[0]).add(edge[1]);
    }

    int[] color = new int[numNodes];  // 0: white, 1: gray, 2: black
    List<Integer> result = new ArrayList<>();

    for (int i = 0; i < numNodes; i++) {
        if (color[i] == 0) {
            if (!dfs(graph, i, color, result)) {
                return new int[0];  // Cycle detected
            }
        }
    }

    Collections.reverse(result);
    return result.stream().mapToInt(i -> i).toArray();
}

private boolean dfs(List<List<Integer>> graph, int node, int[] color, List<Integer> result) {
    color[node] = 1;  // Gray: being processed

    for (int neighbor : graph.get(node)) {
        if (color[neighbor] == 1) {
            return false;  // Back edge = cycle
        }
        if (color[neighbor] == 0) {
            if (!dfs(graph, neighbor, color, result)) {
                return false;
            }
        }
    }

    color[node] = 2;  // Black: done
    result.add(node);
    return true;
}`,
      python: `from collections import deque, defaultdict

# Kahn's Algorithm (BFS)
def topological_sort(num_nodes, edges):
    graph = defaultdict(list)
    in_degree = [0] * num_nodes

    for u, v in edges:
        graph[u].append(v)
        in_degree[v] += 1

    queue = deque([i for i in range(num_nodes) if in_degree[i] == 0])
    result = []

    while queue:
        node = queue.popleft()
        result.append(node)

        for neighbor in graph[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    return result if len(result) == num_nodes else []

# Course Schedule II
def findOrder(numCourses, prerequisites):
    graph = defaultdict(list)
    in_degree = [0] * numCourses

    for course, pre in prerequisites:
        graph[pre].append(course)
        in_degree[course] += 1

    queue = deque([i for i in range(numCourses) if in_degree[i] == 0])
    order = []

    while queue:
        course = queue.popleft()
        order.append(course)

        for next_course in graph[course]:
            in_degree[next_course] -= 1
            if in_degree[next_course] == 0:
                queue.append(next_course)

    return order if len(order) == numCourses else []

# DFS-based with cycle detection
def topological_sort_dfs(num_nodes, edges):
    graph = defaultdict(list)
    for u, v in edges:
        graph[u].append(v)

    WHITE, GRAY, BLACK = 0, 1, 2
    color = [WHITE] * num_nodes
    result = []

    def dfs(node):
        color[node] = GRAY

        for neighbor in graph[node]:
            if color[neighbor] == GRAY:
                return False  # Cycle
            if color[neighbor] == WHITE:
                if not dfs(neighbor):
                    return False

        color[node] = BLACK
        result.append(node)
        return True

    for i in range(num_nodes):
        if color[i] == WHITE:
            if not dfs(i):
                return []

    return result[::-1]`,
      cpp: `std::vector<int> topologicalSort(int numNodes, std::vector<std::vector<int>>& edges) {
    std::vector<std::vector<int>> graph(numNodes);
    std::vector<int> inDegree(numNodes, 0);

    for (auto& edge : edges) {
        graph[edge[0]].push_back(edge[1]);
        inDegree[edge[1]]++;
    }

    std::queue<int> q;
    for (int i = 0; i < numNodes; i++) {
        if (inDegree[i] == 0) q.push(i);
    }

    std::vector<int> result;
    while (!q.empty()) {
        int node = q.front();
        q.pop();
        result.push_back(node);

        for (int neighbor : graph[node]) {
            if (--inDegree[neighbor] == 0) {
                q.push(neighbor);
            }
        }
    }

    return result.size() == numNodes ? result : std::vector<int>();
}`,
      javascript: `// Kahn's Algorithm
function topologicalSort(numNodes, edges) {
  const graph = Array.from({ length: numNodes }, () => []);
  const inDegree = new Array(numNodes).fill(0);

  for (const [u, v] of edges) {
    graph[u].push(v);
    inDegree[v]++;
  }

  const queue = [];
  for (let i = 0; i < numNodes; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }

  const result = [];
  while (queue.length) {
    const node = queue.shift();
    result.push(node);

    for (const neighbor of graph[node]) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor);
      }
    }
  }

  return result.length === numNodes ? result : [];
}

// Course Schedule II
function findOrder(numCourses, prerequisites) {
  const graph = Array.from({ length: numCourses }, () => []);
  const inDegree = new Array(numCourses).fill(0);

  for (const [course, pre] of prerequisites) {
    graph[pre].push(course);
    inDegree[course]++;
  }

  const queue = [];
  for (let i = 0; i < numCourses; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }

  const order = [];
  while (queue.length) {
    const course = queue.shift();
    order.push(course);

    for (const next of graph[course]) {
      if (--inDegree[next] === 0) {
        queue.push(next);
      }
    }
  }

  return order.length === numCourses ? order : [];
}`,
    },
    keyPoints: [
      "Kahn's (BFS): Start with in-degree 0 nodes, remove edges",
      "DFS: Post-order traversal, reverse at end",
      "Cycle detection: BFS returns fewer nodes; DFS finds back edge",
      "Works only on DAGs (Directed Acyclic Graphs)",
      "Multiple valid orderings may exist",
    ],
    commonMistakes: [
      "Forgetting to check for cycles (return empty if cycle exists)",
      "Wrong edge direction (prerequisite → course, not reverse)",
      "Not initializing in-degree array correctly",
      "DFS: forgetting to reverse the result",
    ],
    relatedProblems: [
      "Course Schedule",
      "Course Schedule II",
      "Alien Dictionary",
      "Minimum Height Trees",
    ],
    relatedPatterns: ["graphs"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "binary-tree-traversals",
    name: "Binary Tree Traversals",
    slug: "binary-tree-traversals",
    category: "Data Structures",
    description:
      "Binary tree traversals visit all nodes in a specific order. The three main types—preorder, inorder, postorder—differ in when the root is processed relative to its children. Level-order (BFS) processes level by level.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(h)",
    whenToUse: [
      "Preorder: Copy tree, serialize tree, prefix expression",
      "Inorder: BST gives sorted order, expression tree",
      "Postorder: Delete tree, evaluate expression, calculate height",
      "Level-order: Print levels, find width, shortest path in tree",
    ],
    codeSnippets: {
      java: `// Recursive Traversals
void preorder(TreeNode root, List<Integer> result) {
    if (root == null) return;
    result.add(root.val);      // Root
    preorder(root.left, result);  // Left
    preorder(root.right, result); // Right
}

void inorder(TreeNode root, List<Integer> result) {
    if (root == null) return;
    inorder(root.left, result);   // Left
    result.add(root.val);         // Root
    inorder(root.right, result);  // Right
}

void postorder(TreeNode root, List<Integer> result) {
    if (root == null) return;
    postorder(root.left, result);  // Left
    postorder(root.right, result); // Right
    result.add(root.val);          // Root
}

// Iterative Preorder (using stack)
public List<Integer> preorderIterative(TreeNode root) {
    List<Integer> result = new ArrayList<>();
    if (root == null) return result;

    Stack<TreeNode> stack = new Stack<>();
    stack.push(root);

    while (!stack.isEmpty()) {
        TreeNode node = stack.pop();
        result.add(node.val);

        // Push right first so left is processed first
        if (node.right != null) stack.push(node.right);
        if (node.left != null) stack.push(node.left);
    }

    return result;
}

// Iterative Inorder (most useful for BST)
public List<Integer> inorderIterative(TreeNode root) {
    List<Integer> result = new ArrayList<>();
    Stack<TreeNode> stack = new Stack<>();
    TreeNode curr = root;

    while (curr != null || !stack.isEmpty()) {
        // Go left as far as possible
        while (curr != null) {
            stack.push(curr);
            curr = curr.left;
        }

        curr = stack.pop();
        result.add(curr.val);
        curr = curr.right;
    }

    return result;
}

// Iterative Postorder (two stacks method)
public List<Integer> postorderIterative(TreeNode root) {
    List<Integer> result = new ArrayList<>();
    if (root == null) return result;

    Stack<TreeNode> stack1 = new Stack<>();
    Stack<TreeNode> stack2 = new Stack<>();
    stack1.push(root);

    while (!stack1.isEmpty()) {
        TreeNode node = stack1.pop();
        stack2.push(node);

        if (node.left != null) stack1.push(node.left);
        if (node.right != null) stack1.push(node.right);
    }

    while (!stack2.isEmpty()) {
        result.add(stack2.pop().val);
    }

    return result;
}

// Level Order (BFS)
public List<List<Integer>> levelOrder(TreeNode root) {
    List<List<Integer>> result = new ArrayList<>();
    if (root == null) return result;

    Queue<TreeNode> queue = new LinkedList<>();
    queue.offer(root);

    while (!queue.isEmpty()) {
        int levelSize = queue.size();
        List<Integer> level = new ArrayList<>();

        for (int i = 0; i < levelSize; i++) {
            TreeNode node = queue.poll();
            level.add(node.val);

            if (node.left != null) queue.offer(node.left);
            if (node.right != null) queue.offer(node.right);
        }

        result.add(level);
    }

    return result;
}

// Morris Inorder Traversal (O(1) space)
public List<Integer> morrisInorder(TreeNode root) {
    List<Integer> result = new ArrayList<>();
    TreeNode curr = root;

    while (curr != null) {
        if (curr.left == null) {
            result.add(curr.val);
            curr = curr.right;
        } else {
            // Find inorder predecessor
            TreeNode pred = curr.left;
            while (pred.right != null && pred.right != curr) {
                pred = pred.right;
            }

            if (pred.right == null) {
                // Create thread
                pred.right = curr;
                curr = curr.left;
            } else {
                // Remove thread
                pred.right = null;
                result.add(curr.val);
                curr = curr.right;
            }
        }
    }

    return result;
}`,
      python: `# Recursive
def preorder(root, result):
    if not root:
        return
    result.append(root.val)
    preorder(root.left, result)
    preorder(root.right, result)

def inorder(root, result):
    if not root:
        return
    inorder(root.left, result)
    result.append(root.val)
    inorder(root.right, result)

def postorder(root, result):
    if not root:
        return
    postorder(root.left, result)
    postorder(root.right, result)
    result.append(root.val)

# Iterative Inorder
def inorder_iterative(root):
    result = []
    stack = []
    curr = root

    while curr or stack:
        while curr:
            stack.append(curr)
            curr = curr.left

        curr = stack.pop()
        result.append(curr.val)
        curr = curr.right

    return result

# Level Order
from collections import deque

def levelOrder(root):
    if not root:
        return []

    result = []
    queue = deque([root])

    while queue:
        level = []
        for _ in range(len(queue)):
            node = queue.popleft()
            level.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        result.append(level)

    return result`,
      cpp: `// Iterative Inorder
std::vector<int> inorderIterative(TreeNode* root) {
    std::vector<int> result;
    std::stack<TreeNode*> stack;
    TreeNode* curr = root;

    while (curr || !stack.empty()) {
        while (curr) {
            stack.push(curr);
            curr = curr->left;
        }

        curr = stack.top();
        stack.pop();
        result.push_back(curr->val);
        curr = curr->right;
    }

    return result;
}

// Level Order
std::vector<std::vector<int>> levelOrder(TreeNode* root) {
    std::vector<std::vector<int>> result;
    if (!root) return result;

    std::queue<TreeNode*> q;
    q.push(root);

    while (!q.empty()) {
        int size = q.size();
        std::vector<int> level;

        for (int i = 0; i < size; i++) {
            TreeNode* node = q.front();
            q.pop();
            level.push_back(node->val);

            if (node->left) q.push(node->left);
            if (node->right) q.push(node->right);
        }

        result.push_back(level);
    }

    return result;
}`,
      javascript: `// Recursive
function preorder(root, result = []) {
  if (!root) return result;
  result.push(root.val);
  preorder(root.left, result);
  preorder(root.right, result);
  return result;
}

// Iterative Inorder
function inorderIterative(root) {
  const result = [];
  const stack = [];
  let curr = root;

  while (curr || stack.length) {
    while (curr) {
      stack.push(curr);
      curr = curr.left;
    }

    curr = stack.pop();
    result.push(curr.val);
    curr = curr.right;
  }

  return result;
}

// Level Order
function levelOrder(root) {
  if (!root) return [];

  const result = [];
  const queue = [root];

  while (queue.length) {
    const level = [];
    const size = queue.length;

    for (let i = 0; i < size; i++) {
      const node = queue.shift();
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }

    result.push(level);
  }

  return result;
}`,
    },
    keyPoints: [
      "Preorder: Root-Left-Right (NLR)",
      "Inorder: Left-Root-Right (LNR) - sorted for BST",
      "Postorder: Left-Right-Root (LRN)",
      "Iterative inorder: go left, pop, go right",
      "Morris traversal: O(1) space using threaded trees",
    ],
    commonMistakes: [
      "Forgetting null check at start of recursion",
      "Iterative preorder: pushing left before right",
      "Level order: not tracking level size correctly",
      "Confusing traversal orders",
    ],
    relatedProblems: [
      "Binary Tree Inorder Traversal",
      "Binary Tree Level Order Traversal",
      "Validate BST",
      "Kth Smallest in BST",
    ],
    relatedPatterns: ["trees"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "lowest-common-ancestor",
    name: "Lowest Common Ancestor (LCA)",
    slug: "lowest-common-ancestor",
    category: "Data Structures",
    description:
      "The Lowest Common Ancestor of two nodes p and q is the deepest node that is an ancestor of both. Different approaches exist for binary trees vs BSTs.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(h)",
    whenToUse: [
      "Finding common ancestor in trees",
      "Distance between two nodes",
      "Path queries in trees",
      "Determining relationships in hierarchies",
    ],
    codeSnippets: {
      java: `// LCA of Binary Tree (general)
public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
    if (root == null || root == p || root == q) {
        return root;
    }

    TreeNode left = lowestCommonAncestor(root.left, p, q);
    TreeNode right = lowestCommonAncestor(root.right, p, q);

    // If both left and right are non-null, root is LCA
    if (left != null && right != null) {
        return root;
    }

    // Otherwise, return non-null child
    return left != null ? left : right;
}

// LCA of Binary Search Tree (use BST property)
public TreeNode lowestCommonAncestorBST(TreeNode root, TreeNode p, TreeNode q) {
    while (root != null) {
        if (p.val < root.val && q.val < root.val) {
            root = root.left;  // Both in left subtree
        } else if (p.val > root.val && q.val > root.val) {
            root = root.right; // Both in right subtree
        } else {
            return root;  // Split point = LCA
        }
    }
    return null;
}

// LCA with parent pointers (like finding intersection of linked lists)
public Node lowestCommonAncestorWithParent(Node p, Node q) {
    Set<Node> ancestors = new HashSet<>();

    // Add all ancestors of p
    while (p != null) {
        ancestors.add(p);
        p = p.parent;
    }

    // Find first common ancestor
    while (q != null) {
        if (ancestors.contains(q)) {
            return q;
        }
        q = q.parent;
    }

    return null;
}

// Or two-pointer approach (like linked list intersection)
public Node lcaWithParentTwoPointer(Node p, Node q) {
    Node a = p, b = q;

    while (a != b) {
        a = (a == null) ? q : a.parent;
        b = (b == null) ? p : b.parent;
    }

    return a;
}

// Distance between two nodes
public int distance(TreeNode root, TreeNode p, TreeNode q) {
    TreeNode lca = lowestCommonAncestor(root, p, q);
    return depth(lca, p) + depth(lca, q);
}

private int depth(TreeNode root, TreeNode target) {
    if (root == null) return -1;
    if (root == target) return 0;

    int left = depth(root.left, target);
    if (left >= 0) return left + 1;

    int right = depth(root.right, target);
    if (right >= 0) return right + 1;

    return -1;
}`,
      python: `# LCA of Binary Tree
def lowestCommonAncestor(root, p, q):
    if not root or root == p or root == q:
        return root

    left = lowestCommonAncestor(root.left, p, q)
    right = lowestCommonAncestor(root.right, p, q)

    if left and right:
        return root

    return left if left else right

# LCA of BST
def lowestCommonAncestorBST(root, p, q):
    while root:
        if p.val < root.val and q.val < root.val:
            root = root.left
        elif p.val > root.val and q.val > root.val:
            root = root.right
        else:
            return root
    return None

# LCA with parent pointers
def lcaWithParent(p, q):
    ancestors = set()

    while p:
        ancestors.add(p)
        p = p.parent

    while q:
        if q in ancestors:
            return q
        q = q.parent

    return None`,
      cpp: `// LCA of Binary Tree
TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
    if (!root || root == p || root == q) {
        return root;
    }

    TreeNode* left = lowestCommonAncestor(root->left, p, q);
    TreeNode* right = lowestCommonAncestor(root->right, p, q);

    if (left && right) return root;
    return left ? left : right;
}

// LCA of BST
TreeNode* lowestCommonAncestorBST(TreeNode* root, TreeNode* p, TreeNode* q) {
    while (root) {
        if (p->val < root->val && q->val < root->val) {
            root = root->left;
        } else if (p->val > root->val && q->val > root->val) {
            root = root->right;
        } else {
            return root;
        }
    }
    return nullptr;
}`,
      javascript: `// LCA of Binary Tree
function lowestCommonAncestor(root, p, q) {
  if (!root || root === p || root === q) {
    return root;
  }

  const left = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);

  if (left && right) return root;
  return left || right;
}

// LCA of BST
function lowestCommonAncestorBST(root, p, q) {
  while (root) {
    if (p.val < root.val && q.val < root.val) {
      root = root.left;
    } else if (p.val > root.val && q.val > root.val) {
      root = root.right;
    } else {
      return root;
    }
  }
  return null;
}`,
    },
    keyPoints: [
      "Binary Tree: recursively search both subtrees",
      "BST: use property to go left or right based on values",
      "If both sides return non-null, current node is LCA",
      "With parent pointers: like finding linked list intersection",
      "Distance = depth(LCA, p) + depth(LCA, q)",
    ],
    commonMistakes: [
      "Not handling when p or q is the LCA itself",
      "BST: using wrong comparison (should check BOTH nodes)",
      "Forgetting that nodes are guaranteed to exist",
      "Confusing LCA with root",
    ],
    relatedProblems: [
      "Lowest Common Ancestor of a Binary Tree",
      "LCA of a BST",
      "LCA with Parent Pointers",
    ],
    relatedPatterns: ["trees"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "interval-problems",
    name: "Interval Problems",
    slug: "interval-problems",
    category: "Algorithm Idioms",
    description:
      "Interval problems involve ranges [start, end] and require merging, inserting, or finding overlaps. The key insight is usually to sort by start time and process sequentially.",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(n)",
    whenToUse: [
      "Merging overlapping intervals",
      "Meeting room scheduling",
      "Finding free time slots",
      "Insert interval into sorted list",
    ],
    codeSnippets: {
      java: `// Merge Intervals
public int[][] merge(int[][] intervals) {
    if (intervals.length <= 1) return intervals;

    // Sort by start time
    Arrays.sort(intervals, (a, b) -> a[0] - b[0]);

    List<int[]> result = new ArrayList<>();
    int[] current = intervals[0];

    for (int i = 1; i < intervals.length; i++) {
        if (intervals[i][0] <= current[1]) {
            // Overlapping - merge
            current[1] = Math.max(current[1], intervals[i][1]);
        } else {
            // Non-overlapping - add current and start new
            result.add(current);
            current = intervals[i];
        }
    }

    result.add(current);
    return result.toArray(new int[result.size()][]);
}

// Insert Interval
public int[][] insert(int[][] intervals, int[] newInterval) {
    List<int[]> result = new ArrayList<>();
    int i = 0;
    int n = intervals.length;

    // Add all intervals before newInterval
    while (i < n && intervals[i][1] < newInterval[0]) {
        result.add(intervals[i]);
        i++;
    }

    // Merge overlapping intervals
    while (i < n && intervals[i][0] <= newInterval[1]) {
        newInterval[0] = Math.min(newInterval[0], intervals[i][0]);
        newInterval[1] = Math.max(newInterval[1], intervals[i][1]);
        i++;
    }
    result.add(newInterval);

    // Add remaining intervals
    while (i < n) {
        result.add(intervals[i]);
        i++;
    }

    return result.toArray(new int[result.size()][]);
}

// Meeting Rooms II (minimum rooms needed)
public int minMeetingRooms(int[][] intervals) {
    if (intervals.length == 0) return 0;

    int[] starts = new int[intervals.length];
    int[] ends = new int[intervals.length];

    for (int i = 0; i < intervals.length; i++) {
        starts[i] = intervals[i][0];
        ends[i] = intervals[i][1];
    }

    Arrays.sort(starts);
    Arrays.sort(ends);

    int rooms = 0, endPtr = 0;

    for (int start : starts) {
        if (start < ends[endPtr]) {
            rooms++;  // Need new room
        } else {
            endPtr++; // Reuse a room
        }
    }

    return rooms;
}

// Using Priority Queue
public int minMeetingRoomsPQ(int[][] intervals) {
    if (intervals.length == 0) return 0;

    Arrays.sort(intervals, (a, b) -> a[0] - b[0]);

    // Min heap of end times
    PriorityQueue<Integer> pq = new PriorityQueue<>();
    pq.offer(intervals[0][1]);

    for (int i = 1; i < intervals.length; i++) {
        if (intervals[i][0] >= pq.peek()) {
            pq.poll();  // Reuse room
        }
        pq.offer(intervals[i][1]);
    }

    return pq.size();
}

// Non-overlapping Intervals (minimum removals)
public int eraseOverlapIntervals(int[][] intervals) {
    if (intervals.length <= 1) return 0;

    // Sort by end time (greedy: keep earliest ending)
    Arrays.sort(intervals, (a, b) -> a[1] - b[1]);

    int count = 0;
    int prevEnd = intervals[0][1];

    for (int i = 1; i < intervals.length; i++) {
        if (intervals[i][0] < prevEnd) {
            count++;  // Overlaps, remove this one
        } else {
            prevEnd = intervals[i][1];
        }
    }

    return count;
}`,
      python: `# Merge Intervals
def merge(intervals):
    if not intervals:
        return []

    intervals.sort(key=lambda x: x[0])
    result = [intervals[0]]

    for start, end in intervals[1:]:
        if start <= result[-1][1]:
            result[-1][1] = max(result[-1][1], end)
        else:
            result.append([start, end])

    return result

# Insert Interval
def insert(intervals, newInterval):
    result = []
    i = 0
    n = len(intervals)

    # Add intervals before newInterval
    while i < n and intervals[i][1] < newInterval[0]:
        result.append(intervals[i])
        i += 1

    # Merge overlapping
    while i < n and intervals[i][0] <= newInterval[1]:
        newInterval[0] = min(newInterval[0], intervals[i][0])
        newInterval[1] = max(newInterval[1], intervals[i][1])
        i += 1
    result.append(newInterval)

    # Add remaining
    result.extend(intervals[i:])
    return result

# Meeting Rooms II
import heapq

def minMeetingRooms(intervals):
    if not intervals:
        return 0

    intervals.sort(key=lambda x: x[0])
    heap = [intervals[0][1]]  # End times

    for start, end in intervals[1:]:
        if start >= heap[0]:
            heapq.heappop(heap)
        heapq.heappush(heap, end)

    return len(heap)`,
      cpp: `// Merge Intervals
std::vector<std::vector<int>> merge(std::vector<std::vector<int>>& intervals) {
    if (intervals.empty()) return {};

    std::sort(intervals.begin(), intervals.end());
    std::vector<std::vector<int>> result;
    result.push_back(intervals[0]);

    for (int i = 1; i < intervals.size(); i++) {
        if (intervals[i][0] <= result.back()[1]) {
            result.back()[1] = std::max(result.back()[1], intervals[i][1]);
        } else {
            result.push_back(intervals[i]);
        }
    }

    return result;
}`,
      javascript: `// Merge Intervals
function merge(intervals) {
  if (intervals.length <= 1) return intervals;

  intervals.sort((a, b) => a[0] - b[0]);
  const result = [intervals[0]];

  for (let i = 1; i < intervals.length; i++) {
    const last = result[result.length - 1];
    if (intervals[i][0] <= last[1]) {
      last[1] = Math.max(last[1], intervals[i][1]);
    } else {
      result.push(intervals[i]);
    }
  }

  return result;
}

// Meeting Rooms II
function minMeetingRooms(intervals) {
  const starts = intervals.map(i => i[0]).sort((a, b) => a - b);
  const ends = intervals.map(i => i[1]).sort((a, b) => a - b);

  let rooms = 0, endPtr = 0;

  for (const start of starts) {
    if (start < ends[endPtr]) {
      rooms++;
    } else {
      endPtr++;
    }
  }

  return rooms;
}`,
    },
    keyPoints: [
      "Sort by start time for merging",
      "Sort by end time for greedy scheduling (minimum removals)",
      "Two intervals overlap if a[0] <= b[1] && b[0] <= a[1]",
      "Meeting rooms: two-pointer on sorted starts/ends",
      "Insert: handle before, overlap, and after separately",
    ],
    commonMistakes: [
      "Wrong overlap condition (off-by-one on boundaries)",
      "Sorting by wrong key for the problem type",
      "Not handling single interval case",
      "Modifying input array when shouldn't",
    ],
    relatedProblems: [
      "Merge Intervals",
      "Insert Interval",
      "Meeting Rooms",
      "Meeting Rooms II",
      "Non-overlapping Intervals",
    ],
    relatedPatterns: ["intervals"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "matrix-traversal-patterns",
    name: "Matrix Traversal Patterns",
    slug: "matrix-traversal-patterns",
    category: "Algorithm Idioms",
    description:
      "Matrices can be traversed in various patterns: row-by-row, column-by-column, diagonal, spiral, or zigzag. Each pattern has its own indexing logic.",
    timeComplexity: "O(m × n)",
    spaceComplexity: "O(m × n)",
    whenToUse: [
      "Spiral order traversal",
      "Diagonal traversal",
      "Zigzag traversal",
      "Rotating or transposing matrices",
      "Layer-by-layer processing",
    ],
    codeSnippets: {
      java: `// Spiral Order
public List<Integer> spiralOrder(int[][] matrix) {
    List<Integer> result = new ArrayList<>();
    if (matrix.length == 0) return result;

    int top = 0, bottom = matrix.length - 1;
    int left = 0, right = matrix[0].length - 1;

    while (top <= bottom && left <= right) {
        // Right
        for (int col = left; col <= right; col++) {
            result.add(matrix[top][col]);
        }
        top++;

        // Down
        for (int row = top; row <= bottom; row++) {
            result.add(matrix[row][right]);
        }
        right--;

        // Left (check if row still valid)
        if (top <= bottom) {
            for (int col = right; col >= left; col--) {
                result.add(matrix[bottom][col]);
            }
            bottom--;
        }

        // Up (check if column still valid)
        if (left <= right) {
            for (int row = bottom; row >= top; row--) {
                result.add(matrix[row][left]);
            }
            left++;
        }
    }

    return result;
}

// Diagonal Traversal
public int[] findDiagonalOrder(int[][] mat) {
    int m = mat.length, n = mat[0].length;
    int[] result = new int[m * n];
    int row = 0, col = 0;
    boolean goingUp = true;

    for (int i = 0; i < m * n; i++) {
        result[i] = mat[row][col];

        if (goingUp) {
            if (col == n - 1) {
                row++;
                goingUp = false;
            } else if (row == 0) {
                col++;
                goingUp = false;
            } else {
                row--;
                col++;
            }
        } else {
            if (row == m - 1) {
                col++;
                goingUp = true;
            } else if (col == 0) {
                row++;
                goingUp = true;
            } else {
                row++;
                col--;
            }
        }
    }

    return result;
}

// Rotate Matrix 90° Clockwise (in-place)
public void rotate(int[][] matrix) {
    int n = matrix.length;

    // Transpose
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            int temp = matrix[i][j];
            matrix[i][j] = matrix[j][i];
            matrix[j][i] = temp;
        }
    }

    // Reverse each row
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n / 2; j++) {
            int temp = matrix[i][j];
            matrix[i][j] = matrix[i][n - 1 - j];
            matrix[i][n - 1 - j] = temp;
        }
    }
}

// Anti-diagonal traversal (for grouping)
// Elements on same anti-diagonal have same (row + col)
public List<List<Integer>> antiDiagonals(int[][] matrix) {
    int m = matrix.length, n = matrix[0].length;
    Map<Integer, List<Integer>> diagonals = new HashMap<>();

    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            int key = i + j;
            diagonals.computeIfAbsent(key, k -> new ArrayList<>()).add(matrix[i][j]);
        }
    }

    List<List<Integer>> result = new ArrayList<>();
    for (int i = 0; i < m + n - 1; i++) {
        result.add(diagonals.get(i));
    }

    return result;
}

// Set Matrix Zeroes (in-place)
public void setZeroes(int[][] matrix) {
    int m = matrix.length, n = matrix[0].length;
    boolean firstRowZero = false, firstColZero = false;

    // Check first row and column
    for (int j = 0; j < n; j++) {
        if (matrix[0][j] == 0) firstRowZero = true;
    }
    for (int i = 0; i < m; i++) {
        if (matrix[i][0] == 0) firstColZero = true;
    }

    // Use first row/col as markers
    for (int i = 1; i < m; i++) {
        for (int j = 1; j < n; j++) {
            if (matrix[i][j] == 0) {
                matrix[i][0] = 0;
                matrix[0][j] = 0;
            }
        }
    }

    // Set zeros based on markers
    for (int i = 1; i < m; i++) {
        for (int j = 1; j < n; j++) {
            if (matrix[i][0] == 0 || matrix[0][j] == 0) {
                matrix[i][j] = 0;
            }
        }
    }

    // Handle first row and column
    if (firstRowZero) {
        for (int j = 0; j < n; j++) matrix[0][j] = 0;
    }
    if (firstColZero) {
        for (int i = 0; i < m; i++) matrix[i][0] = 0;
    }
}`,
      python: `# Spiral Order
def spiralOrder(matrix):
    if not matrix:
        return []

    result = []
    top, bottom = 0, len(matrix) - 1
    left, right = 0, len(matrix[0]) - 1

    while top <= bottom and left <= right:
        # Right
        for col in range(left, right + 1):
            result.append(matrix[top][col])
        top += 1

        # Down
        for row in range(top, bottom + 1):
            result.append(matrix[row][right])
        right -= 1

        # Left
        if top <= bottom:
            for col in range(right, left - 1, -1):
                result.append(matrix[bottom][col])
            bottom -= 1

        # Up
        if left <= right:
            for row in range(bottom, top - 1, -1):
                result.append(matrix[row][left])
            left += 1

    return result

# Rotate 90° clockwise
def rotate(matrix):
    n = len(matrix)

    # Transpose
    for i in range(n):
        for j in range(i + 1, n):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]

    # Reverse rows
    for row in matrix:
        row.reverse()

# Anti-diagonals
from collections import defaultdict

def antiDiagonals(matrix):
    m, n = len(matrix), len(matrix[0])
    diags = defaultdict(list)

    for i in range(m):
        for j in range(n):
            diags[i + j].append(matrix[i][j])

    return [diags[k] for k in range(m + n - 1)]`,
      cpp: `// Spiral Order
std::vector<int> spiralOrder(std::vector<std::vector<int>>& matrix) {
    std::vector<int> result;
    if (matrix.empty()) return result;

    int top = 0, bottom = matrix.size() - 1;
    int left = 0, right = matrix[0].size() - 1;

    while (top <= bottom && left <= right) {
        for (int col = left; col <= right; col++)
            result.push_back(matrix[top][col]);
        top++;

        for (int row = top; row <= bottom; row++)
            result.push_back(matrix[row][right]);
        right--;

        if (top <= bottom) {
            for (int col = right; col >= left; col--)
                result.push_back(matrix[bottom][col]);
            bottom--;
        }

        if (left <= right) {
            for (int row = bottom; row >= top; row--)
                result.push_back(matrix[row][left]);
            left++;
        }
    }

    return result;
}`,
      javascript: `// Spiral Order
function spiralOrder(matrix) {
  if (!matrix.length) return [];

  const result = [];
  let top = 0, bottom = matrix.length - 1;
  let left = 0, right = matrix[0].length - 1;

  while (top <= bottom && left <= right) {
    for (let col = left; col <= right; col++)
      result.push(matrix[top][col]);
    top++;

    for (let row = top; row <= bottom; row++)
      result.push(matrix[row][right]);
    right--;

    if (top <= bottom) {
      for (let col = right; col >= left; col--)
        result.push(matrix[bottom][col]);
      bottom--;
    }

    if (left <= right) {
      for (let row = bottom; row >= top; row--)
        result.push(matrix[row][left]);
      left++;
    }
  }

  return result;
}

// Rotate 90° clockwise
function rotate(matrix) {
  const n = matrix.length;

  // Transpose
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];
    }
  }

  // Reverse rows
  for (const row of matrix) {
    row.reverse();
  }
}`,
    },
    keyPoints: [
      "Spiral: use four boundaries (top, bottom, left, right)",
      "Rotate 90° CW: transpose then reverse rows",
      "Rotate 90° CCW: reverse rows then transpose",
      "Anti-diagonal: elements share same (row + col)",
      "Main diagonal: elements share same (row - col)",
    ],
    commonMistakes: [
      "Spiral: not checking bounds after each direction",
      "Diagonal: wrong direction handling at edges",
      "Rotate: confusing transpose indices",
      "Set zeroes: modifying matrix while still scanning",
    ],
    relatedProblems: [
      "Spiral Matrix",
      "Rotate Image",
      "Diagonal Traverse",
      "Set Matrix Zeroes",
    ],
    relatedPatterns: ["arrays-strings"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "greedy-patterns",
    name: "Greedy Algorithm Patterns",
    slug: "greedy-patterns",
    category: "Algorithm Idioms",
    description:
      "Greedy algorithms make locally optimal choices at each step, hoping to find a global optimum. They work when the problem has optimal substructure and the greedy choice property.",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(1)",
    whenToUse: [
      "Activity/interval selection",
      "Huffman coding",
      "Minimum spanning tree (Kruskal/Prim)",
      "Jump game problems",
      "Task scheduling",
    ],
    codeSnippets: {
      java: `// Jump Game - can reach end?
public boolean canJump(int[] nums) {
    int maxReach = 0;

    for (int i = 0; i < nums.length; i++) {
        if (i > maxReach) return false;  // Can't reach this position
        maxReach = Math.max(maxReach, i + nums[i]);
    }

    return true;
}

// Jump Game II - minimum jumps to reach end
public int jump(int[] nums) {
    int jumps = 0;
    int currentEnd = 0;
    int farthest = 0;

    for (int i = 0; i < nums.length - 1; i++) {
        farthest = Math.max(farthest, i + nums[i]);

        if (i == currentEnd) {
            jumps++;
            currentEnd = farthest;
        }
    }

    return jumps;
}

// Gas Station
public int canCompleteCircuit(int[] gas, int[] cost) {
    int totalTank = 0;
    int currentTank = 0;
    int startStation = 0;

    for (int i = 0; i < gas.length; i++) {
        int diff = gas[i] - cost[i];
        totalTank += diff;
        currentTank += diff;

        if (currentTank < 0) {
            startStation = i + 1;  // Start from next station
            currentTank = 0;
        }
    }

    return totalTank >= 0 ? startStation : -1;
}

// Best Time to Buy and Sell Stock II (multiple transactions)
public int maxProfit(int[] prices) {
    int profit = 0;

    for (int i = 1; i < prices.length; i++) {
        if (prices[i] > prices[i - 1]) {
            profit += prices[i] - prices[i - 1];
        }
    }

    return profit;
}

// Task Scheduler
public int leastInterval(char[] tasks, int n) {
    int[] freq = new int[26];
    for (char task : tasks) {
        freq[task - 'A']++;
    }

    Arrays.sort(freq);
    int maxFreq = freq[25];
    int idleSlots = (maxFreq - 1) * n;

    for (int i = 24; i >= 0 && freq[i] > 0; i--) {
        idleSlots -= Math.min(freq[i], maxFreq - 1);
    }

    return tasks.length + Math.max(0, idleSlots);
}

// Partition Labels
public List<Integer> partitionLabels(String s) {
    int[] last = new int[26];
    for (int i = 0; i < s.length(); i++) {
        last[s.charAt(i) - 'a'] = i;
    }

    List<Integer> result = new ArrayList<>();
    int start = 0, end = 0;

    for (int i = 0; i < s.length(); i++) {
        end = Math.max(end, last[s.charAt(i) - 'a']);

        if (i == end) {
            result.add(end - start + 1);
            start = i + 1;
        }
    }

    return result;
}

// Minimum Number of Arrows to Burst Balloons
public int findMinArrowShots(int[][] points) {
    if (points.length == 0) return 0;

    // Sort by end point
    Arrays.sort(points, (a, b) -> Integer.compare(a[1], b[1]));

    int arrows = 1;
    int currentEnd = points[0][1];

    for (int i = 1; i < points.length; i++) {
        if (points[i][0] > currentEnd) {
            arrows++;
            currentEnd = points[i][1];
        }
    }

    return arrows;
}`,
      python: `# Jump Game
def canJump(nums):
    max_reach = 0

    for i, jump in enumerate(nums):
        if i > max_reach:
            return False
        max_reach = max(max_reach, i + jump)

    return True

# Jump Game II
def jump(nums):
    jumps = 0
    current_end = 0
    farthest = 0

    for i in range(len(nums) - 1):
        farthest = max(farthest, i + nums[i])

        if i == current_end:
            jumps += 1
            current_end = farthest

    return jumps

# Gas Station
def canCompleteCircuit(gas, cost):
    total_tank = current_tank = start = 0

    for i in range(len(gas)):
        diff = gas[i] - cost[i]
        total_tank += diff
        current_tank += diff

        if current_tank < 0:
            start = i + 1
            current_tank = 0

    return start if total_tank >= 0 else -1

# Best Time to Buy and Sell Stock II
def maxProfit(prices):
    return sum(max(prices[i] - prices[i-1], 0) for i in range(1, len(prices)))

# Partition Labels
def partitionLabels(s):
    last = {c: i for i, c in enumerate(s)}
    result = []
    start = end = 0

    for i, c in enumerate(s):
        end = max(end, last[c])
        if i == end:
            result.append(end - start + 1)
            start = i + 1

    return result`,
      cpp: `// Jump Game
bool canJump(std::vector<int>& nums) {
    int maxReach = 0;

    for (int i = 0; i < nums.size(); i++) {
        if (i > maxReach) return false;
        maxReach = std::max(maxReach, i + nums[i]);
    }

    return true;
}

// Jump Game II
int jump(std::vector<int>& nums) {
    int jumps = 0, currentEnd = 0, farthest = 0;

    for (int i = 0; i < nums.size() - 1; i++) {
        farthest = std::max(farthest, i + nums[i]);
        if (i == currentEnd) {
            jumps++;
            currentEnd = farthest;
        }
    }

    return jumps;
}`,
      javascript: `// Jump Game
function canJump(nums) {
  let maxReach = 0;

  for (let i = 0; i < nums.length; i++) {
    if (i > maxReach) return false;
    maxReach = Math.max(maxReach, i + nums[i]);
  }

  return true;
}

// Jump Game II
function jump(nums) {
  let jumps = 0, currentEnd = 0, farthest = 0;

  for (let i = 0; i < nums.length - 1; i++) {
    farthest = Math.max(farthest, i + nums[i]);
    if (i === currentEnd) {
      jumps++;
      currentEnd = farthest;
    }
  }

  return jumps;
}

// Partition Labels
function partitionLabels(s) {
  const last = {};
  for (let i = 0; i < s.length; i++) {
    last[s[i]] = i;
  }

  const result = [];
  let start = 0, end = 0;

  for (let i = 0; i < s.length; i++) {
    end = Math.max(end, last[s[i]]);
    if (i === end) {
      result.push(end - start + 1);
      start = i + 1;
    }
  }

  return result;
}`,
    },
    keyPoints: [
      "Greedy: make best local choice at each step",
      "Works when local optimum leads to global optimum",
      "Often involves sorting first",
      "Jump Game: track farthest reachable position",
      "Interval problems: sort by end for selection",
    ],
    commonMistakes: [
      "Using greedy when DP is needed (no optimal substructure)",
      "Wrong sorting criteria",
      "Off-by-one in boundary conditions",
      "Not proving greedy choice property",
    ],
    relatedProblems: [
      "Jump Game",
      "Jump Game II",
      "Gas Station",
      "Task Scheduler",
      "Partition Labels",
    ],
    relatedPatterns: ["greedy"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "string-matching-kmp",
    name: "String Matching (KMP)",
    slug: "string-matching-kmp",
    category: "String & Character",
    description:
      "The KMP (Knuth-Morris-Pratt) algorithm finds occurrences of a pattern in a text in O(n+m) time by using a failure function to avoid re-examining characters.",
    timeComplexity: "O(n + m)",
    spaceComplexity: "O(m)",
    whenToUse: [
      "Finding pattern in string",
      "Counting pattern occurrences",
      "Finding shortest repeated pattern",
      "When O(nm) brute force is too slow",
    ],
    codeSnippets: {
      java: `// Build failure/LPS (Longest Proper Prefix which is also Suffix) array
private int[] buildLPS(String pattern) {
    int m = pattern.length();
    int[] lps = new int[m];
    int len = 0;
    int i = 1;

    while (i < m) {
        if (pattern.charAt(i) == pattern.charAt(len)) {
            len++;
            lps[i] = len;
            i++;
        } else {
            if (len != 0) {
                len = lps[len - 1];  // Don't increment i
            } else {
                lps[i] = 0;
                i++;
            }
        }
    }

    return lps;
}

// KMP Search - find first occurrence
public int strStr(String text, String pattern) {
    if (pattern.isEmpty()) return 0;

    int[] lps = buildLPS(pattern);
    int n = text.length(), m = pattern.length();
    int i = 0, j = 0;

    while (i < n) {
        if (text.charAt(i) == pattern.charAt(j)) {
            i++;
            j++;

            if (j == m) {
                return i - j;  // Found at index i - j
            }
        } else {
            if (j != 0) {
                j = lps[j - 1];  // Use failure function
            } else {
                i++;
            }
        }
    }

    return -1;
}

// Find all occurrences
public List<Integer> findAllOccurrences(String text, String pattern) {
    List<Integer> result = new ArrayList<>();
    int[] lps = buildLPS(pattern);
    int n = text.length(), m = pattern.length();
    int i = 0, j = 0;

    while (i < n) {
        if (text.charAt(i) == pattern.charAt(j)) {
            i++;
            j++;

            if (j == m) {
                result.add(i - j);
                j = lps[j - 1];  // Continue searching
            }
        } else {
            if (j != 0) {
                j = lps[j - 1];
            } else {
                i++;
            }
        }
    }

    return result;
}

// Shortest repeating pattern
// If n % (n - lps[n-1]) == 0, pattern repeats
public String shortestRepeatingPattern(String s) {
    int[] lps = buildLPS(s);
    int n = s.length();
    int len = n - lps[n - 1];

    if (n % len == 0) {
        return s.substring(0, len);
    }

    return s;  // No repeating pattern
}

// Repeated Substring Pattern
public boolean repeatedSubstringPattern(String s) {
    int[] lps = buildLPS(s);
    int n = s.length();
    int len = lps[n - 1];

    return len > 0 && n % (n - len) == 0;
}`,
      python: `# Build LPS array
def build_lps(pattern):
    m = len(pattern)
    lps = [0] * m
    length = 0
    i = 1

    while i < m:
        if pattern[i] == pattern[length]:
            length += 1
            lps[i] = length
            i += 1
        elif length != 0:
            length = lps[length - 1]
        else:
            lps[i] = 0
            i += 1

    return lps

# KMP Search
def strStr(text, pattern):
    if not pattern:
        return 0

    lps = build_lps(pattern)
    n, m = len(text), len(pattern)
    i = j = 0

    while i < n:
        if text[i] == pattern[j]:
            i += 1
            j += 1
            if j == m:
                return i - j
        elif j != 0:
            j = lps[j - 1]
        else:
            i += 1

    return -1

# Alternative: use built-in (but understand KMP for interviews!)
def strStr_builtin(text, pattern):
    return text.find(pattern)

# Repeated Substring Pattern
def repeatedSubstringPattern(s):
    lps = build_lps(s)
    n = len(s)
    length = lps[n - 1]
    return length > 0 and n % (n - length) == 0`,
      cpp: `std::vector<int> buildLPS(const std::string& pattern) {
    int m = pattern.size();
    std::vector<int> lps(m, 0);
    int len = 0, i = 1;

    while (i < m) {
        if (pattern[i] == pattern[len]) {
            lps[i++] = ++len;
        } else if (len != 0) {
            len = lps[len - 1];
        } else {
            lps[i++] = 0;
        }
    }

    return lps;
}

int strStr(const std::string& text, const std::string& pattern) {
    if (pattern.empty()) return 0;

    auto lps = buildLPS(pattern);
    int n = text.size(), m = pattern.size();
    int i = 0, j = 0;

    while (i < n) {
        if (text[i] == pattern[j]) {
            i++; j++;
            if (j == m) return i - j;
        } else if (j != 0) {
            j = lps[j - 1];
        } else {
            i++;
        }
    }

    return -1;
}`,
      javascript: `// Build LPS array
function buildLPS(pattern) {
  const m = pattern.length;
  const lps = new Array(m).fill(0);
  let len = 0, i = 1;

  while (i < m) {
    if (pattern[i] === pattern[len]) {
      lps[i++] = ++len;
    } else if (len !== 0) {
      len = lps[len - 1];
    } else {
      lps[i++] = 0;
    }
  }

  return lps;
}

// KMP Search
function strStr(text, pattern) {
  if (!pattern) return 0;

  const lps = buildLPS(pattern);
  const n = text.length, m = pattern.length;
  let i = 0, j = 0;

  while (i < n) {
    if (text[i] === pattern[j]) {
      i++; j++;
      if (j === m) return i - j;
    } else if (j !== 0) {
      j = lps[j - 1];
    } else {
      i++;
    }
  }

  return -1;
}

// Alternative: built-in
function strStrBuiltin(text, pattern) {
  return text.indexOf(pattern);
}`,
    },
    keyPoints: [
      "LPS[i] = length of longest proper prefix which is also suffix",
      "On mismatch, use LPS to skip already matched characters",
      "Time: O(n + m), Space: O(m) for LPS array",
      "Repeated pattern: check if n % (n - LPS[n-1]) == 0",
      "Built-in indexOf/find is usually KMP or better",
    ],
    commonMistakes: [
      "Off-by-one when building LPS array",
      "Forgetting to check length != 0 before using lps[len-1]",
      "Not handling empty pattern case",
      "Confusing proper prefix (not entire string)",
    ],
    relatedProblems: [
      "Find the Index of the First Occurrence",
      "Repeated Substring Pattern",
      "Shortest Palindrome",
    ],
    relatedPatterns: [],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "heap-operations",
    name: "Heap Building and Operations",
    slug: "heap-operations",
    category: "Data Structures",
    description:
      "Understanding heap internals—how to build a heap in O(n), heapify up/down, and implement heap operations—is crucial for problems beyond basic PriorityQueue usage.",
    timeComplexity: "O(log n) insert/delete",
    spaceComplexity: "O(n)",
    whenToUse: [
      "Custom heap with removal of arbitrary elements",
      "Heap sort",
      "Building heap from array",
      "Understanding heap internals for interviews",
    ],
    codeSnippets: {
      java: `// Heap represented as array
// Parent of i: (i - 1) / 2
// Left child of i: 2 * i + 1
// Right child of i: 2 * i + 2

class MinHeap {
    private List<Integer> heap = new ArrayList<>();

    public void insert(int val) {
        heap.add(val);
        heapifyUp(heap.size() - 1);
    }

    public int extractMin() {
        if (heap.isEmpty()) throw new NoSuchElementException();

        int min = heap.get(0);
        int last = heap.remove(heap.size() - 1);

        if (!heap.isEmpty()) {
            heap.set(0, last);
            heapifyDown(0);
        }

        return min;
    }

    public int peek() {
        if (heap.isEmpty()) throw new NoSuchElementException();
        return heap.get(0);
    }

    private void heapifyUp(int index) {
        while (index > 0) {
            int parent = (index - 1) / 2;
            if (heap.get(index) >= heap.get(parent)) break;

            swap(index, parent);
            index = parent;
        }
    }

    private void heapifyDown(int index) {
        int size = heap.size();

        while (true) {
            int smallest = index;
            int left = 2 * index + 1;
            int right = 2 * index + 2;

            if (left < size && heap.get(left) < heap.get(smallest)) {
                smallest = left;
            }
            if (right < size && heap.get(right) < heap.get(smallest)) {
                smallest = right;
            }

            if (smallest == index) break;

            swap(index, smallest);
            index = smallest;
        }
    }

    private void swap(int i, int j) {
        int temp = heap.get(i);
        heap.set(i, heap.get(j));
        heap.set(j, temp);
    }
}

// Build heap from array - O(n)
public void buildHeap(int[] arr) {
    // Start from last non-leaf node
    for (int i = arr.length / 2 - 1; i >= 0; i--) {
        heapifyDown(arr, i, arr.length);
    }
}

private void heapifyDown(int[] arr, int index, int size) {
    while (true) {
        int smallest = index;
        int left = 2 * index + 1;
        int right = 2 * index + 2;

        if (left < size && arr[left] < arr[smallest]) smallest = left;
        if (right < size && arr[right] < arr[smallest]) smallest = right;

        if (smallest == index) break;

        int temp = arr[index];
        arr[index] = arr[smallest];
        arr[smallest] = temp;
        index = smallest;
    }
}

// Heap Sort - O(n log n)
public void heapSort(int[] arr) {
    int n = arr.length;

    // Build max heap
    for (int i = n / 2 - 1; i >= 0; i--) {
        maxHeapify(arr, i, n);
    }

    // Extract elements one by one
    for (int i = n - 1; i > 0; i--) {
        // Move current root to end
        int temp = arr[0];
        arr[0] = arr[i];
        arr[i] = temp;

        // Heapify reduced heap
        maxHeapify(arr, 0, i);
    }
}

private void maxHeapify(int[] arr, int index, int size) {
    while (true) {
        int largest = index;
        int left = 2 * index + 1;
        int right = 2 * index + 2;

        if (left < size && arr[left] > arr[largest]) largest = left;
        if (right < size && arr[right] > arr[largest]) largest = right;

        if (largest == index) break;

        int temp = arr[index];
        arr[index] = arr[largest];
        arr[largest] = temp;
        index = largest;
    }
}

// Kth Largest Element
public int findKthLargest(int[] nums, int k) {
    PriorityQueue<Integer> minHeap = new PriorityQueue<>();

    for (int num : nums) {
        minHeap.offer(num);
        if (minHeap.size() > k) {
            minHeap.poll();
        }
    }

    return minHeap.peek();
}`,
      python: `import heapq

# Python heapq is a min heap
# For max heap, negate values

# Build heap from list - O(n)
nums = [3, 1, 4, 1, 5, 9, 2, 6]
heapq.heapify(nums)  # Modifies in place

# Basic operations
heapq.heappush(nums, 0)     # Insert
smallest = heapq.heappop(nums)  # Extract min
peek = nums[0]               # Peek (just index)

# Push and pop in one operation
heapq.heappushpop(nums, 5)  # Push then pop
heapq.heapreplace(nums, 5)  # Pop then push

# N largest/smallest - O(n log k)
largest_3 = heapq.nlargest(3, nums)
smallest_3 = heapq.nsmallest(3, nums)

# Max heap using negation
max_heap = []
heapq.heappush(max_heap, -5)
heapq.heappush(max_heap, -3)
max_val = -heapq.heappop(max_heap)

# Custom class heap
class ListNode:
    def __init__(self, val):
        self.val = val

    def __lt__(self, other):
        return self.val < other.val

# Or use tuple (priority, item)
heap = []
heapq.heappush(heap, (priority, item))

# Kth Largest Element
def findKthLargest(nums, k):
    # Min heap of size k
    heap = nums[:k]
    heapq.heapify(heap)

    for num in nums[k:]:
        if num > heap[0]:
            heapq.heapreplace(heap, num)

    return heap[0]

# Alternative: nlargest
def findKthLargest_alt(nums, k):
    return heapq.nlargest(k, nums)[-1]`,
      cpp: `#include <queue>
#include <vector>
#include <algorithm>

// priority_queue is max heap by default
std::priority_queue<int> maxHeap;

// Min heap
std::priority_queue<int, std::vector<int>, std::greater<int>> minHeap;

// Custom comparator
auto cmp = [](const std::pair<int,int>& a, const std::pair<int,int>& b) {
    return a.first > b.first;  // Min heap by first element
};
std::priority_queue<std::pair<int,int>, std::vector<std::pair<int,int>>,
                   decltype(cmp)> pq(cmp);

// Build heap from vector - O(n)
std::vector<int> nums = {3, 1, 4, 1, 5, 9};
std::make_heap(nums.begin(), nums.end());  // Max heap

// Heap operations
std::push_heap(nums.begin(), nums.end());  // After push_back
std::pop_heap(nums.begin(), nums.end());   // Moves max to end
nums.pop_back();

// Heap sort
std::sort_heap(nums.begin(), nums.end());

// Kth Largest
int findKthLargest(std::vector<int>& nums, int k) {
    std::priority_queue<int, std::vector<int>, std::greater<int>> minHeap;

    for (int num : nums) {
        minHeap.push(num);
        if (minHeap.size() > k) {
            minHeap.pop();
        }
    }

    return minHeap.top();
}`,
      javascript: `// JavaScript doesn't have built-in heap
// Simple implementation:

class MinHeap {
  constructor() {
    this.heap = [];
  }

  push(val) {
    this.heap.push(val);
    this._heapifyUp(this.heap.length - 1);
  }

  pop() {
    if (this.heap.length === 0) return undefined;
    if (this.heap.length === 1) return this.heap.pop();

    const min = this.heap[0];
    this.heap[0] = this.heap.pop();
    this._heapifyDown(0);
    return min;
  }

  peek() {
    return this.heap[0];
  }

  size() {
    return this.heap.length;
  }

  _heapifyUp(index) {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.heap[index] >= this.heap[parent]) break;
      [this.heap[index], this.heap[parent]] = [this.heap[parent], this.heap[index]];
      index = parent;
    }
  }

  _heapifyDown(index) {
    while (true) {
      let smallest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;

      if (left < this.heap.length && this.heap[left] < this.heap[smallest]) {
        smallest = left;
      }
      if (right < this.heap.length && this.heap[right] < this.heap[smallest]) {
        smallest = right;
      }

      if (smallest === index) break;

      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      index = smallest;
    }
  }
}

// Kth Largest
function findKthLargest(nums, k) {
  const heap = new MinHeap();

  for (const num of nums) {
    heap.push(num);
    if (heap.size() > k) {
      heap.pop();
    }
  }

  return heap.peek();
}`,
    },
    keyPoints: [
      "Parent: (i-1)/2, Left: 2i+1, Right: 2i+2",
      "Build heap: O(n), Insert/Extract: O(log n)",
      "Build from bottom up, starting at last non-leaf",
      "Heap sort: build max heap, repeatedly extract max",
      "Kth largest: maintain min heap of size k",
    ],
    commonMistakes: [
      "Forgetting 0-indexed parent formula",
      "Not handling single element case in extract",
      "Using wrong comparison for min vs max heap",
      "Building heap with repeated inserts: O(n log n) vs O(n)",
    ],
    relatedProblems: [
      "Kth Largest Element",
      "Merge K Sorted Lists",
      "Top K Frequent Elements",
      "Find Median from Data Stream",
    ],
    relatedPatterns: ["heap"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "binary-tree-construction",
    name: "Binary Tree Construction",
    slug: "binary-tree-construction",
    category: "Data Structures",
    description:
      "Constructing binary trees from traversal sequences or serialized strings. Understanding which combinations uniquely define a tree is key.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    whenToUse: [
      "Build tree from preorder + inorder",
      "Build tree from postorder + inorder",
      "Serialize/deserialize binary tree",
      "Construct BST from preorder",
    ],
    codeSnippets: {
      java: `// Build tree from preorder and inorder
// Preorder: root is first element
// Inorder: elements left of root are in left subtree
public TreeNode buildTree(int[] preorder, int[] inorder) {
    Map<Integer, Integer> inorderMap = new HashMap<>();
    for (int i = 0; i < inorder.length; i++) {
        inorderMap.put(inorder[i], i);
    }

    return build(preorder, 0, preorder.length - 1,
                 inorder, 0, inorder.length - 1, inorderMap);
}

private int preIndex = 0;

private TreeNode build(int[] preorder, int preStart, int preEnd,
                       int[] inorder, int inStart, int inEnd,
                       Map<Integer, Integer> inorderMap) {
    if (preStart > preEnd || inStart > inEnd) return null;

    int rootVal = preorder[preIndex++];
    TreeNode root = new TreeNode(rootVal);

    int inRoot = inorderMap.get(rootVal);
    int leftSize = inRoot - inStart;

    root.left = build(preorder, preStart + 1, preStart + leftSize,
                      inorder, inStart, inRoot - 1, inorderMap);
    root.right = build(preorder, preStart + leftSize + 1, preEnd,
                       inorder, inRoot + 1, inEnd, inorderMap);

    return root;
}

// Alternative cleaner version using global index
private int preIdx = 0;

public TreeNode buildTreeClean(int[] preorder, int[] inorder) {
    Map<Integer, Integer> map = new HashMap<>();
    for (int i = 0; i < inorder.length; i++) {
        map.put(inorder[i], i);
    }
    preIdx = 0;
    return buildHelper(preorder, map, 0, inorder.length - 1);
}

private TreeNode buildHelper(int[] preorder, Map<Integer, Integer> map,
                             int left, int right) {
    if (left > right) return null;

    int rootVal = preorder[preIdx++];
    TreeNode root = new TreeNode(rootVal);
    int mid = map.get(rootVal);

    root.left = buildHelper(preorder, map, left, mid - 1);
    root.right = buildHelper(preorder, map, mid + 1, right);

    return root;
}

// Build from postorder and inorder
// Postorder: root is LAST element, process right BEFORE left
public TreeNode buildTreePost(int[] inorder, int[] postorder) {
    Map<Integer, Integer> map = new HashMap<>();
    for (int i = 0; i < inorder.length; i++) {
        map.put(inorder[i], i);
    }

    return buildPost(postorder, map, 0, inorder.length - 1,
                     new int[]{postorder.length - 1});
}

private TreeNode buildPost(int[] postorder, Map<Integer, Integer> map,
                           int left, int right, int[] postIdx) {
    if (left > right) return null;

    int rootVal = postorder[postIdx[0]--];
    TreeNode root = new TreeNode(rootVal);
    int mid = map.get(rootVal);

    // Build RIGHT subtree first (postorder is L-R-Root)
    root.right = buildPost(postorder, map, mid + 1, right, postIdx);
    root.left = buildPost(postorder, map, left, mid - 1, postIdx);

    return root;
}

// Construct BST from preorder
// Use min/max bounds to determine validity
public TreeNode bstFromPreorder(int[] preorder) {
    return buildBST(preorder, new int[]{0}, Integer.MIN_VALUE, Integer.MAX_VALUE);
}

private TreeNode buildBST(int[] preorder, int[] idx, int min, int max) {
    if (idx[0] >= preorder.length) return null;

    int val = preorder[idx[0]];
    if (val < min || val > max) return null;

    TreeNode root = new TreeNode(val);
    idx[0]++;

    root.left = buildBST(preorder, idx, min, val);
    root.right = buildBST(preorder, idx, val, max);

    return root;
}

// Serialize and Deserialize
public String serialize(TreeNode root) {
    StringBuilder sb = new StringBuilder();
    serializeHelper(root, sb);
    return sb.toString();
}

private void serializeHelper(TreeNode node, StringBuilder sb) {
    if (node == null) {
        sb.append("null,");
        return;
    }
    sb.append(node.val).append(",");
    serializeHelper(node.left, sb);
    serializeHelper(node.right, sb);
}

public TreeNode deserialize(String data) {
    Queue<String> queue = new LinkedList<>(Arrays.asList(data.split(",")));
    return deserializeHelper(queue);
}

private TreeNode deserializeHelper(Queue<String> queue) {
    String val = queue.poll();
    if (val.equals("null")) return null;

    TreeNode node = new TreeNode(Integer.parseInt(val));
    node.left = deserializeHelper(queue);
    node.right = deserializeHelper(queue);

    return node;
}`,
      python: `# Build from preorder and inorder
def buildTree(preorder, inorder):
    if not preorder or not inorder:
        return None

    inorder_map = {val: i for i, val in enumerate(inorder)}
    pre_idx = [0]

    def build(left, right):
        if left > right:
            return None

        root_val = preorder[pre_idx[0]]
        pre_idx[0] += 1

        root = TreeNode(root_val)
        mid = inorder_map[root_val]

        root.left = build(left, mid - 1)
        root.right = build(mid + 1, right)

        return root

    return build(0, len(inorder) - 1)

# Build from postorder and inorder
def buildTreePost(inorder, postorder):
    inorder_map = {val: i for i, val in enumerate(inorder)}
    post_idx = [len(postorder) - 1]

    def build(left, right):
        if left > right:
            return None

        root_val = postorder[post_idx[0]]
        post_idx[0] -= 1

        root = TreeNode(root_val)
        mid = inorder_map[root_val]

        # Build RIGHT first!
        root.right = build(mid + 1, right)
        root.left = build(left, mid - 1)

        return root

    return build(0, len(inorder) - 1)

# Serialize/Deserialize
def serialize(root):
    def helper(node):
        if not node:
            return ['null']
        return [str(node.val)] + helper(node.left) + helper(node.right)

    return ','.join(helper(root))

def deserialize(data):
    vals = iter(data.split(','))

    def helper():
        val = next(vals)
        if val == 'null':
            return None
        node = TreeNode(int(val))
        node.left = helper()
        node.right = helper()
        return node

    return helper()`,
      cpp: `TreeNode* buildTree(std::vector<int>& preorder, std::vector<int>& inorder) {
    std::unordered_map<int, int> map;
    for (int i = 0; i < inorder.size(); i++) {
        map[inorder[i]] = i;
    }

    int preIdx = 0;

    std::function<TreeNode*(int, int)> build = [&](int left, int right) -> TreeNode* {
        if (left > right) return nullptr;

        int rootVal = preorder[preIdx++];
        TreeNode* root = new TreeNode(rootVal);
        int mid = map[rootVal];

        root->left = build(left, mid - 1);
        root->right = build(mid + 1, right);

        return root;
    };

    return build(0, inorder.size() - 1);
}`,
      javascript: `// Build from preorder and inorder
function buildTree(preorder, inorder) {
  const map = new Map();
  inorder.forEach((val, i) => map.set(val, i));

  let preIdx = 0;

  function build(left, right) {
    if (left > right) return null;

    const rootVal = preorder[preIdx++];
    const root = new TreeNode(rootVal);
    const mid = map.get(rootVal);

    root.left = build(left, mid - 1);
    root.right = build(mid + 1, right);

    return root;
  }

  return build(0, inorder.length - 1);
}

// Serialize/Deserialize
function serialize(root) {
  const result = [];

  function helper(node) {
    if (!node) {
      result.push('null');
      return;
    }
    result.push(node.val);
    helper(node.left);
    helper(node.right);
  }

  helper(root);
  return result.join(',');
}

function deserialize(data) {
  const vals = data.split(',');
  let idx = 0;

  function helper() {
    if (vals[idx] === 'null') {
      idx++;
      return null;
    }

    const node = new TreeNode(parseInt(vals[idx++]));
    node.left = helper();
    node.right = helper();
    return node;
  }

  return helper();
}`,
    },
    keyPoints: [
      "Preorder + Inorder: preorder gives root, inorder splits left/right",
      "Postorder + Inorder: postorder root is last, build RIGHT first",
      "Use HashMap for O(1) inorder index lookup",
      "BST from preorder: use min/max bounds",
      "Serialize: preorder with null markers uniquely defines tree",
    ],
    commonMistakes: [
      "Postorder: forgetting to build right subtree first",
      "Not using HashMap (O(n²) instead of O(n))",
      "Wrong index calculation for subtree ranges",
      "Deserialize: not handling null correctly",
    ],
    relatedProblems: [
      "Construct Binary Tree from Preorder and Inorder",
      "Construct from Postorder and Inorder",
      "Serialize and Deserialize Binary Tree",
    ],
    relatedPatterns: ["trees"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "graph-cycle-detection",
    name: "Graph Cycle Detection",
    slug: "graph-cycle-detection",
    category: "Algorithm Idioms",
    description:
      "Detecting cycles in graphs is fundamental. The approach differs for directed vs undirected graphs, and can use DFS coloring, Union-Find, or BFS.",
    timeComplexity: "O(V + E)",
    spaceComplexity: "O(V)",
    whenToUse: [
      "Validating DAG (no cycles in directed graph)",
      "Checking if undirected graph is a tree",
      "Finding redundant edges",
      "Deadlock detection",
    ],
    codeSnippets: {
      java: `// Directed Graph - DFS with 3 colors
// White (0): unvisited, Gray (1): in current path, Black (2): done
public boolean hasCycleDirected(int n, int[][] edges) {
    List<List<Integer>> graph = new ArrayList<>();
    for (int i = 0; i < n; i++) graph.add(new ArrayList<>());
    for (int[] edge : edges) {
        graph.get(edge[0]).add(edge[1]);
    }

    int[] color = new int[n];

    for (int i = 0; i < n; i++) {
        if (color[i] == 0 && hasCycleDFS(graph, i, color)) {
            return true;
        }
    }

    return false;
}

private boolean hasCycleDFS(List<List<Integer>> graph, int node, int[] color) {
    color[node] = 1;  // Gray - visiting

    for (int neighbor : graph.get(node)) {
        if (color[neighbor] == 1) {
            return true;  // Back edge = cycle!
        }
        if (color[neighbor] == 0 && hasCycleDFS(graph, neighbor, color)) {
            return true;
        }
    }

    color[node] = 2;  // Black - done
    return false;
}

// Undirected Graph - DFS with parent tracking
public boolean hasCycleUndirected(int n, int[][] edges) {
    List<List<Integer>> graph = new ArrayList<>();
    for (int i = 0; i < n; i++) graph.add(new ArrayList<>());
    for (int[] edge : edges) {
        graph.get(edge[0]).add(edge[1]);
        graph.get(edge[1]).add(edge[0]);
    }

    boolean[] visited = new boolean[n];

    for (int i = 0; i < n; i++) {
        if (!visited[i] && hasCycleUndirectedDFS(graph, i, -1, visited)) {
            return true;
        }
    }

    return false;
}

private boolean hasCycleUndirectedDFS(List<List<Integer>> graph,
                                      int node, int parent, boolean[] visited) {
    visited[node] = true;

    for (int neighbor : graph.get(node)) {
        if (!visited[neighbor]) {
            if (hasCycleUndirectedDFS(graph, neighbor, node, visited)) {
                return true;
            }
        } else if (neighbor != parent) {
            return true;  // Visited but not parent = cycle
        }
    }

    return false;
}

// Undirected Graph - Union Find
public boolean hasCycleUnionFind(int n, int[][] edges) {
    int[] parent = new int[n];
    int[] rank = new int[n];
    for (int i = 0; i < n; i++) parent[i] = i;

    for (int[] edge : edges) {
        int rootX = find(parent, edge[0]);
        int rootY = find(parent, edge[1]);

        if (rootX == rootY) {
            return true;  // Same component = adding edge creates cycle
        }

        // Union by rank
        if (rank[rootX] < rank[rootY]) {
            parent[rootX] = rootY;
        } else if (rank[rootX] > rank[rootY]) {
            parent[rootY] = rootX;
        } else {
            parent[rootY] = rootX;
            rank[rootX]++;
        }
    }

    return false;
}

private int find(int[] parent, int x) {
    if (parent[x] != x) {
        parent[x] = find(parent, parent[x]);
    }
    return parent[x];
}

// Graph Valid Tree (n nodes, n-1 edges, no cycle, connected)
public boolean validTree(int n, int[][] edges) {
    if (edges.length != n - 1) return false;  // Tree has exactly n-1 edges

    int[] parent = new int[n];
    for (int i = 0; i < n; i++) parent[i] = i;

    for (int[] edge : edges) {
        int rootX = find(parent, edge[0]);
        int rootY = find(parent, edge[1]);

        if (rootX == rootY) return false;  // Cycle

        parent[rootX] = rootY;
    }

    return true;  // n-1 edges + no cycle = connected tree
}`,
      python: `# Directed Graph - DFS 3-color
def hasCycleDirected(n, edges):
    graph = [[] for _ in range(n)]
    for u, v in edges:
        graph[u].append(v)

    WHITE, GRAY, BLACK = 0, 1, 2
    color = [WHITE] * n

    def dfs(node):
        color[node] = GRAY

        for neighbor in graph[node]:
            if color[neighbor] == GRAY:
                return True  # Cycle!
            if color[neighbor] == WHITE and dfs(neighbor):
                return True

        color[node] = BLACK
        return False

    return any(color[i] == WHITE and dfs(i) for i in range(n))

# Undirected Graph - DFS with parent
def hasCycleUndirected(n, edges):
    graph = [[] for _ in range(n)]
    for u, v in edges:
        graph[u].append(v)
        graph[v].append(u)

    visited = [False] * n

    def dfs(node, parent):
        visited[node] = True

        for neighbor in graph[node]:
            if not visited[neighbor]:
                if dfs(neighbor, node):
                    return True
            elif neighbor != parent:
                return True

        return False

    return any(not visited[i] and dfs(i, -1) for i in range(n))

# Undirected Graph - Union Find
def hasCycleUnionFind(n, edges):
    parent = list(range(n))

    def find(x):
        if parent[x] != x:
            parent[x] = find(parent[x])
        return parent[x]

    for u, v in edges:
        root_u, root_v = find(u), find(v)
        if root_u == root_v:
            return True
        parent[root_u] = root_v

    return False`,
      cpp: `// Directed Graph - DFS
bool hasCycleDirected(int n, std::vector<std::vector<int>>& edges) {
    std::vector<std::vector<int>> graph(n);
    for (auto& e : edges) {
        graph[e[0]].push_back(e[1]);
    }

    std::vector<int> color(n, 0);

    std::function<bool(int)> dfs = [&](int node) -> bool {
        color[node] = 1;

        for (int neighbor : graph[node]) {
            if (color[neighbor] == 1) return true;
            if (color[neighbor] == 0 && dfs(neighbor)) return true;
        }

        color[node] = 2;
        return false;
    };

    for (int i = 0; i < n; i++) {
        if (color[i] == 0 && dfs(i)) return true;
    }

    return false;
}`,
      javascript: `// Directed Graph - DFS
function hasCycleDirected(n, edges) {
  const graph = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) {
    graph[u].push(v);
  }

  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Array(n).fill(WHITE);

  function dfs(node) {
    color[node] = GRAY;

    for (const neighbor of graph[node]) {
      if (color[neighbor] === GRAY) return true;
      if (color[neighbor] === WHITE && dfs(neighbor)) return true;
    }

    color[node] = BLACK;
    return false;
  }

  for (let i = 0; i < n; i++) {
    if (color[i] === WHITE && dfs(i)) return true;
  }

  return false;
}

// Undirected - Union Find
function hasCycleUnionFind(n, edges) {
  const parent = Array.from({ length: n }, (_, i) => i);

  function find(x) {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  }

  for (const [u, v] of edges) {
    const rootU = find(u), rootV = find(v);
    if (rootU === rootV) return true;
    parent[rootU] = rootV;
  }

  return false;
}`,
    },
    keyPoints: [
      "Directed: 3-color DFS, Gray node in path = cycle (back edge)",
      "Undirected DFS: track parent, visited non-parent neighbor = cycle",
      "Undirected Union-Find: same root before union = cycle",
      "Valid tree: n nodes, n-1 edges, connected, no cycle",
      "Course Schedule = directed cycle detection",
    ],
    commonMistakes: [
      "Using 2-color for directed graph (misses forward/cross edges)",
      "Undirected: counting edge to parent as cycle",
      "Not handling disconnected components",
      "Union-Find: forgetting path compression",
    ],
    relatedProblems: [
      "Course Schedule",
      "Course Schedule II",
      "Graph Valid Tree",
      "Redundant Connection",
    ],
    relatedPatterns: ["graphs", "union-find"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "quick-select",
    name: "Quick Select (Kth Element)",
    slug: "quick-select",
    category: "Algorithm Idioms",
    description:
      "Quick Select finds the kth smallest/largest element in O(n) average time using the partition logic from QuickSort. It only recurses on one side of the pivot.",
    timeComplexity: "O(n) average, O(n²) worst",
    spaceComplexity: "O(1)",
    whenToUse: [
      "Finding kth smallest/largest element",
      "Finding median",
      "When O(n) average is acceptable (vs O(n log k) heap)",
      "Partial sorting",
    ],
    codeSnippets: {
      java: `// Quick Select - O(n) average, O(n²) worst case
public int findKthLargest(int[] nums, int k) {
    // Kth largest = (n - k)th smallest (0-indexed)
    int targetIndex = nums.length - k;
    return quickSelect(nums, 0, nums.length - 1, targetIndex);
}

private int quickSelect(int[] nums, int left, int right, int targetIndex) {
    if (left == right) return nums[left];

    int pivotIndex = partition(nums, left, right);

    if (pivotIndex == targetIndex) {
        return nums[pivotIndex];
    } else if (pivotIndex < targetIndex) {
        return quickSelect(nums, pivotIndex + 1, right, targetIndex);
    } else {
        return quickSelect(nums, left, pivotIndex - 1, targetIndex);
    }
}

private int partition(int[] nums, int left, int right) {
    // Choose random pivot to avoid worst case
    int randomIndex = left + (int) (Math.random() * (right - left + 1));
    swap(nums, randomIndex, right);

    int pivot = nums[right];
    int i = left;

    for (int j = left; j < right; j++) {
        if (nums[j] <= pivot) {
            swap(nums, i, j);
            i++;
        }
    }

    swap(nums, i, right);
    return i;
}

private void swap(int[] nums, int i, int j) {
    int temp = nums[i];
    nums[i] = nums[j];
    nums[j] = temp;
}

// Iterative version
public int findKthLargestIterative(int[] nums, int k) {
    int targetIndex = nums.length - k;
    int left = 0, right = nums.length - 1;

    while (left <= right) {
        int pivotIndex = partition(nums, left, right);

        if (pivotIndex == targetIndex) {
            return nums[pivotIndex];
        } else if (pivotIndex < targetIndex) {
            left = pivotIndex + 1;
        } else {
            right = pivotIndex - 1;
        }
    }

    return -1;  // Should never reach here
}

// 3-way partition (handles duplicates better)
public int findKthLargest3Way(int[] nums, int k) {
    int targetIndex = nums.length - k;
    int left = 0, right = nums.length - 1;

    while (left <= right) {
        int[] result = partition3Way(nums, left, right);
        int lo = result[0], hi = result[1];

        if (targetIndex < lo) {
            right = lo - 1;
        } else if (targetIndex > hi) {
            left = hi + 1;
        } else {
            return nums[targetIndex];
        }
    }

    return -1;
}

private int[] partition3Way(int[] nums, int left, int right) {
    int randomIndex = left + (int) (Math.random() * (right - left + 1));
    int pivot = nums[randomIndex];

    int lt = left, gt = right, i = left;

    while (i <= gt) {
        if (nums[i] < pivot) {
            swap(nums, lt++, i++);
        } else if (nums[i] > pivot) {
            swap(nums, i, gt--);
        } else {
            i++;
        }
    }

    return new int[]{lt, gt};  // All elements in [lt, gt] equal pivot
}`,
      python: `import random

def findKthLargest(nums, k):
    target = len(nums) - k

    def quickSelect(left, right):
        # Random pivot
        pivot_idx = random.randint(left, right)
        nums[pivot_idx], nums[right] = nums[right], nums[pivot_idx]

        pivot = nums[right]
        i = left

        for j in range(left, right):
            if nums[j] <= pivot:
                nums[i], nums[j] = nums[j], nums[i]
                i += 1

        nums[i], nums[right] = nums[right], nums[i]

        if i == target:
            return nums[i]
        elif i < target:
            return quickSelect(i + 1, right)
        else:
            return quickSelect(left, i - 1)

    return quickSelect(0, len(nums) - 1)

# Using heapq (alternative O(n log k))
import heapq

def findKthLargestHeap(nums, k):
    return heapq.nlargest(k, nums)[-1]

# Using sorted (O(n log n) but simple)
def findKthLargestSort(nums, k):
    return sorted(nums, reverse=True)[k - 1]`,
      cpp: `int findKthLargest(std::vector<int>& nums, int k) {
    int target = nums.size() - k;
    int left = 0, right = nums.size() - 1;

    while (left <= right) {
        // Random pivot
        int pivotIdx = left + rand() % (right - left + 1);
        std::swap(nums[pivotIdx], nums[right]);

        int pivot = nums[right];
        int i = left;

        for (int j = left; j < right; j++) {
            if (nums[j] <= pivot) {
                std::swap(nums[i++], nums[j]);
            }
        }

        std::swap(nums[i], nums[right]);

        if (i == target) return nums[i];
        else if (i < target) left = i + 1;
        else right = i - 1;
    }

    return -1;
}

// STL alternative
int findKthLargestSTL(std::vector<int>& nums, int k) {
    std::nth_element(nums.begin(), nums.begin() + k - 1, nums.end(),
                     std::greater<int>());
    return nums[k - 1];
}`,
      javascript: `function findKthLargest(nums, k) {
  const target = nums.length - k;

  function quickSelect(left, right) {
    // Random pivot
    const pivotIdx = left + Math.floor(Math.random() * (right - left + 1));
    [nums[pivotIdx], nums[right]] = [nums[right], nums[pivotIdx]];

    const pivot = nums[right];
    let i = left;

    for (let j = left; j < right; j++) {
      if (nums[j] <= pivot) {
        [nums[i], nums[j]] = [nums[j], nums[i]];
        i++;
      }
    }

    [nums[i], nums[right]] = [nums[right], nums[i]];

    if (i === target) return nums[i];
    else if (i < target) return quickSelect(i + 1, right);
    else return quickSelect(left, i - 1);
  }

  return quickSelect(0, nums.length - 1);
}

// Simple alternative
function findKthLargestSort(nums, k) {
  return nums.sort((a, b) => b - a)[k - 1];
}`,
    },
    keyPoints: [
      "Average O(n), worst O(n²) - use random pivot",
      "Kth largest = (n-k)th smallest in 0-indexed",
      "Only recurse on side containing target index",
      "3-way partition handles duplicates efficiently",
      "Modifies input array (use copy if needed)",
    ],
    commonMistakes: [
      "Off-by-one: kth largest vs (n-k)th index",
      "Not using random pivot (degrades to O(n²))",
      "Not handling equal elements well",
      "Forgetting it modifies the input array",
    ],
    relatedProblems: [
      "Kth Largest Element in an Array",
      "Top K Frequent Elements",
      "K Closest Points to Origin",
    ],
    relatedPatterns: [],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "linked-list-techniques",
    name: "Linked List Techniques",
    slug: "linked-list-techniques",
    category: "Data Structures",
    description:
      "Common linked list operations: reversing, merging, detecting cycles, finding middle, and handling edge cases with dummy nodes.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    whenToUse: [
      "Reversing linked list (iterative/recursive)",
      "Merging sorted lists",
      "Detecting and finding cycle start",
      "Finding middle element",
      "Removing nth from end",
    ],
    codeSnippets: {
      java: `// Reverse Linked List - Iterative
public ListNode reverseList(ListNode head) {
    ListNode prev = null;
    ListNode curr = head;

    while (curr != null) {
        ListNode next = curr.next;
        curr.next = prev;
        prev = curr;
        curr = next;
    }

    return prev;
}

// Reverse Linked List - Recursive
public ListNode reverseListRecursive(ListNode head) {
    if (head == null || head.next == null) {
        return head;
    }

    ListNode newHead = reverseListRecursive(head.next);
    head.next.next = head;
    head.next = null;

    return newHead;
}

// Reverse portion [left, right]
public ListNode reverseBetween(ListNode head, int left, int right) {
    ListNode dummy = new ListNode(0);
    dummy.next = head;
    ListNode prev = dummy;

    // Move to node before left
    for (int i = 1; i < left; i++) {
        prev = prev.next;
    }

    // Reverse from left to right
    ListNode curr = prev.next;
    for (int i = 0; i < right - left; i++) {
        ListNode next = curr.next;
        curr.next = next.next;
        next.next = prev.next;
        prev.next = next;
    }

    return dummy.next;
}

// Merge Two Sorted Lists
public ListNode mergeTwoLists(ListNode l1, ListNode l2) {
    ListNode dummy = new ListNode(0);
    ListNode curr = dummy;

    while (l1 != null && l2 != null) {
        if (l1.val <= l2.val) {
            curr.next = l1;
            l1 = l1.next;
        } else {
            curr.next = l2;
            l2 = l2.next;
        }
        curr = curr.next;
    }

    curr.next = (l1 != null) ? l1 : l2;

    return dummy.next;
}

// Find Middle (slow/fast pointer)
public ListNode findMiddle(ListNode head) {
    ListNode slow = head, fast = head;

    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
    }

    return slow;  // For odd: exact middle, for even: second middle
}

// Detect Cycle - Floyd's Algorithm
public boolean hasCycle(ListNode head) {
    ListNode slow = head, fast = head;

    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;

        if (slow == fast) return true;
    }

    return false;
}

// Find Cycle Start
public ListNode detectCycle(ListNode head) {
    ListNode slow = head, fast = head;

    // Find meeting point
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;

        if (slow == fast) {
            // Reset slow to head
            slow = head;

            // Move both at same speed
            while (slow != fast) {
                slow = slow.next;
                fast = fast.next;
            }

            return slow;
        }
    }

    return null;
}

// Remove Nth From End
public ListNode removeNthFromEnd(ListNode head, int n) {
    ListNode dummy = new ListNode(0);
    dummy.next = head;

    ListNode fast = dummy, slow = dummy;

    // Move fast n+1 steps ahead
    for (int i = 0; i <= n; i++) {
        fast = fast.next;
    }

    // Move both until fast reaches end
    while (fast != null) {
        slow = slow.next;
        fast = fast.next;
    }

    slow.next = slow.next.next;

    return dummy.next;
}

// Palindrome Linked List
public boolean isPalindrome(ListNode head) {
    // Find middle
    ListNode slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
    }

    // Reverse second half
    ListNode secondHalf = reverseList(slow);
    ListNode firstHalf = head;

    // Compare
    while (secondHalf != null) {
        if (firstHalf.val != secondHalf.val) {
            return false;
        }
        firstHalf = firstHalf.next;
        secondHalf = secondHalf.next;
    }

    return true;
}`,
      python: `# Reverse List - Iterative
def reverseList(head):
    prev, curr = None, head

    while curr:
        next_node = curr.next
        curr.next = prev
        prev = curr
        curr = next_node

    return prev

# Reverse List - Recursive
def reverseListRecursive(head):
    if not head or not head.next:
        return head

    new_head = reverseListRecursive(head.next)
    head.next.next = head
    head.next = None

    return new_head

# Merge Two Sorted Lists
def mergeTwoLists(l1, l2):
    dummy = ListNode(0)
    curr = dummy

    while l1 and l2:
        if l1.val <= l2.val:
            curr.next = l1
            l1 = l1.next
        else:
            curr.next = l2
            l2 = l2.next
        curr = curr.next

    curr.next = l1 or l2
    return dummy.next

# Find Cycle Start
def detectCycle(head):
    slow = fast = head

    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next

        if slow == fast:
            slow = head
            while slow != fast:
                slow = slow.next
                fast = fast.next
            return slow

    return None

# Remove Nth From End
def removeNthFromEnd(head, n):
    dummy = ListNode(0)
    dummy.next = head
    fast = slow = dummy

    for _ in range(n + 1):
        fast = fast.next

    while fast:
        slow = slow.next
        fast = fast.next

    slow.next = slow.next.next
    return dummy.next`,
      cpp: `// Reverse List
ListNode* reverseList(ListNode* head) {
    ListNode* prev = nullptr;
    ListNode* curr = head;

    while (curr) {
        ListNode* next = curr->next;
        curr->next = prev;
        prev = curr;
        curr = next;
    }

    return prev;
}

// Find Cycle Start
ListNode* detectCycle(ListNode* head) {
    ListNode* slow = head;
    ListNode* fast = head;

    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;

        if (slow == fast) {
            slow = head;
            while (slow != fast) {
                slow = slow->next;
                fast = fast->next;
            }
            return slow;
        }
    }

    return nullptr;
}`,
      javascript: `// Reverse List
function reverseList(head) {
  let prev = null, curr = head;

  while (curr) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }

  return prev;
}

// Merge Two Sorted
function mergeTwoLists(l1, l2) {
  const dummy = new ListNode(0);
  let curr = dummy;

  while (l1 && l2) {
    if (l1.val <= l2.val) {
      curr.next = l1;
      l1 = l1.next;
    } else {
      curr.next = l2;
      l2 = l2.next;
    }
    curr = curr.next;
  }

  curr.next = l1 || l2;
  return dummy.next;
}

// Find Cycle Start
function detectCycle(head) {
  let slow = head, fast = head;

  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;

    if (slow === fast) {
      slow = head;
      while (slow !== fast) {
        slow = slow.next;
        fast = fast.next;
      }
      return slow;
    }
  }

  return null;
}`,
    },
    keyPoints: [
      "Dummy node: simplifies edge cases (empty list, single node)",
      "Reverse: save next, point to prev, move forward",
      "Slow/fast: middle, cycle detection",
      "Cycle start: math proof - reset slow to head after meeting",
      "Remove nth from end: fast ahead by n+1",
    ],
    commonMistakes: [
      "Not using dummy node (complex edge case handling)",
      "Losing reference to next before reassigning",
      "Off-by-one in nth from end",
      "Not handling null in cycle detection",
    ],
    relatedProblems: [
      "Reverse Linked List",
      "Merge Two Sorted Lists",
      "Linked List Cycle II",
      "Remove Nth Node From End",
    ],
    relatedPatterns: ["linked-list"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "recursion-memoization",
    name: "Recursion with Memoization",
    slug: "recursion-memoization",
    category: "Algorithm Idioms",
    description:
      "Memoization caches results of expensive function calls to avoid redundant computation. It's the top-down approach to dynamic programming.",
    timeComplexity: "O(subproblems)",
    spaceComplexity: "O(subproblems)",
    whenToUse: [
      "Recursive solutions with overlapping subproblems",
      "When easier to think recursively than iteratively",
      "Tree/graph traversal with repeated states",
      "Game theory / minimax problems",
    ],
    codeSnippets: {
      java: `// Fibonacci with memoization
public int fib(int n) {
    int[] memo = new int[n + 1];
    Arrays.fill(memo, -1);
    return fibMemo(n, memo);
}

private int fibMemo(int n, int[] memo) {
    if (n <= 1) return n;
    if (memo[n] != -1) return memo[n];

    memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
    return memo[n];
}

// Coin Change with memoization
public int coinChange(int[] coins, int amount) {
    int[] memo = new int[amount + 1];
    Arrays.fill(memo, Integer.MAX_VALUE);
    int result = coinChangeMemo(coins, amount, memo);
    return result == Integer.MAX_VALUE ? -1 : result;
}

private int coinChangeMemo(int[] coins, int amount, int[] memo) {
    if (amount == 0) return 0;
    if (amount < 0) return Integer.MAX_VALUE;
    if (memo[amount] != Integer.MAX_VALUE) return memo[amount];

    int min = Integer.MAX_VALUE;
    for (int coin : coins) {
        int sub = coinChangeMemo(coins, amount - coin, memo);
        if (sub != Integer.MAX_VALUE) {
            min = Math.min(min, sub + 1);
        }
    }

    memo[amount] = min;
    return min;
}

// 2D memoization - Unique Paths
public int uniquePaths(int m, int n) {
    Integer[][] memo = new Integer[m][n];
    return pathsMemo(0, 0, m, n, memo);
}

private int pathsMemo(int r, int c, int m, int n, Integer[][] memo) {
    if (r == m - 1 && c == n - 1) return 1;
    if (r >= m || c >= n) return 0;
    if (memo[r][c] != null) return memo[r][c];

    memo[r][c] = pathsMemo(r + 1, c, m, n, memo) +
                 pathsMemo(r, c + 1, m, n, memo);
    return memo[r][c];
}

// Longest Increasing Subsequence
public int lengthOfLIS(int[] nums) {
    int[] memo = new int[nums.length];
    Arrays.fill(memo, -1);

    int maxLen = 0;
    for (int i = 0; i < nums.length; i++) {
        maxLen = Math.max(maxLen, lisMemo(nums, i, memo));
    }

    return maxLen;
}

private int lisMemo(int[] nums, int i, int[] memo) {
    if (memo[i] != -1) return memo[i];

    int maxLen = 1;
    for (int j = 0; j < i; j++) {
        if (nums[j] < nums[i]) {
            maxLen = Math.max(maxLen, 1 + lisMemo(nums, j, memo));
        }
    }

    memo[i] = maxLen;
    return maxLen;
}

// Word Break with memoization
public boolean wordBreak(String s, List<String> wordDict) {
    Set<String> dict = new HashSet<>(wordDict);
    Boolean[] memo = new Boolean[s.length()];
    return wordBreakMemo(s, 0, dict, memo);
}

private boolean wordBreakMemo(String s, int start, Set<String> dict, Boolean[] memo) {
    if (start == s.length()) return true;
    if (memo[start] != null) return memo[start];

    for (int end = start + 1; end <= s.length(); end++) {
        String word = s.substring(start, end);
        if (dict.contains(word) && wordBreakMemo(s, end, dict, memo)) {
            memo[start] = true;
            return true;
        }
    }

    memo[start] = false;
    return false;
}`,
      python: `from functools import lru_cache

# Using @lru_cache decorator (easiest way!)
@lru_cache(maxsize=None)
def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)

# Coin Change
def coinChange(coins, amount):
    @lru_cache(maxsize=None)
    def dp(remaining):
        if remaining == 0:
            return 0
        if remaining < 0:
            return float('inf')

        min_coins = float('inf')
        for coin in coins:
            min_coins = min(min_coins, dp(remaining - coin) + 1)

        return min_coins

    result = dp(amount)
    return result if result != float('inf') else -1

# 2D memoization - Edit Distance
def minDistance(word1, word2):
    @lru_cache(maxsize=None)
    def dp(i, j):
        if i == 0:
            return j
        if j == 0:
            return i

        if word1[i - 1] == word2[j - 1]:
            return dp(i - 1, j - 1)

        return 1 + min(
            dp(i - 1, j),      # Delete
            dp(i, j - 1),      # Insert
            dp(i - 1, j - 1)   # Replace
        )

    return dp(len(word1), len(word2))

# Manual memoization with dict
def wordBreak(s, wordDict):
    word_set = set(wordDict)
    memo = {}

    def dp(start):
        if start == len(s):
            return True
        if start in memo:
            return memo[start]

        for end in range(start + 1, len(s) + 1):
            if s[start:end] in word_set and dp(end):
                memo[start] = True
                return True

        memo[start] = False
        return False

    return dp(0)`,
      cpp: `#include <unordered_map>
#include <vector>

// Fibonacci with memoization
std::unordered_map<int, int> memo;

int fib(int n) {
    if (n <= 1) return n;
    if (memo.count(n)) return memo[n];

    memo[n] = fib(n - 1) + fib(n - 2);
    return memo[n];
}

// Coin Change
int coinChange(std::vector<int>& coins, int amount) {
    std::vector<int> memo(amount + 1, INT_MAX);

    std::function<int(int)> dp = [&](int remaining) -> int {
        if (remaining == 0) return 0;
        if (remaining < 0) return INT_MAX;
        if (memo[remaining] != INT_MAX) return memo[remaining];

        int min_coins = INT_MAX;
        for (int coin : coins) {
            int sub = dp(remaining - coin);
            if (sub != INT_MAX) {
                min_coins = std::min(min_coins, sub + 1);
            }
        }

        return memo[remaining] = min_coins;
    };

    int result = dp(amount);
    return result == INT_MAX ? -1 : result;
}`,
      javascript: `// Fibonacci with memoization
function fib(n, memo = {}) {
  if (n <= 1) return n;
  if (n in memo) return memo[n];

  memo[n] = fib(n - 1, memo) + fib(n - 2, memo);
  return memo[n];
}

// Coin Change
function coinChange(coins, amount) {
  const memo = new Map();

  function dp(remaining) {
    if (remaining === 0) return 0;
    if (remaining < 0) return Infinity;
    if (memo.has(remaining)) return memo.get(remaining);

    let min = Infinity;
    for (const coin of coins) {
      min = Math.min(min, dp(remaining - coin) + 1);
    }

    memo.set(remaining, min);
    return min;
  }

  const result = dp(amount);
  return result === Infinity ? -1 : result;
}

// Word Break
function wordBreak(s, wordDict) {
  const wordSet = new Set(wordDict);
  const memo = new Map();

  function dp(start) {
    if (start === s.length) return true;
    if (memo.has(start)) return memo.get(start);

    for (let end = start + 1; end <= s.length; end++) {
      if (wordSet.has(s.slice(start, end)) && dp(end)) {
        memo.set(start, true);
        return true;
      }
    }

    memo.set(start, false);
    return false;
  }

  return dp(0);
}`,
    },
    keyPoints: [
      "Memoization = caching recursive calls (top-down DP)",
      "Use array memo when state is integer, Map/dict for complex state",
      "Python @lru_cache is the easiest memoization",
      "Check memo BEFORE computing, store AFTER computing",
      "Clear cache between test cases if using global memo",
    ],
    commonMistakes: [
      "Forgetting to check memo before computation",
      "Wrong initialization value (use null/None, not 0)",
      "Not handling base cases properly",
      "Global memo pollution between test cases",
    ],
    relatedProblems: [
      "Fibonacci Number",
      "Coin Change",
      "Word Break",
      "Longest Increasing Subsequence",
      "Edit Distance",
    ],
    relatedPatterns: ["dynamic-programming"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "stack-applications",
    name: "Stack Applications",
    slug: "stack-applications",
    category: "Data Structures",
    description:
      "Stacks are LIFO structures used for parsing, expression evaluation, undo operations, and tracking state during traversals. Many problems have elegant stack solutions.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    whenToUse: [
      "Matching parentheses/brackets",
      "Evaluating expressions (postfix, calculator)",
      "Simplifying file paths",
      "Tracking previous state (undo, back button)",
      "Monotonic stack for next greater element",
    ],
    codeSnippets: {
      java: `// Valid Parentheses
public boolean isValid(String s) {
    Stack<Character> stack = new Stack<>();
    Map<Character, Character> pairs = Map.of(')', '(', '}', '{', ']', '[');

    for (char c : s.toCharArray()) {
        if (pairs.containsKey(c)) {
            if (stack.isEmpty() || stack.pop() != pairs.get(c)) {
                return false;
            }
        } else {
            stack.push(c);
        }
    }

    return stack.isEmpty();
}

// Basic Calculator II (+ - * /)
public int calculate(String s) {
    Stack<Integer> stack = new Stack<>();
    int num = 0;
    char operation = '+';

    for (int i = 0; i < s.length(); i++) {
        char c = s.charAt(i);

        if (Character.isDigit(c)) {
            num = num * 10 + (c - '0');
        }

        if ((!Character.isDigit(c) && c != ' ') || i == s.length() - 1) {
            switch (operation) {
                case '+': stack.push(num); break;
                case '-': stack.push(-num); break;
                case '*': stack.push(stack.pop() * num); break;
                case '/': stack.push(stack.pop() / num); break;
            }
            operation = c;
            num = 0;
        }
    }

    int result = 0;
    for (int n : stack) result += n;
    return result;
}

// Decode String: 3[a2[c]] -> accaccacc
public String decodeString(String s) {
    Stack<Integer> countStack = new Stack<>();
    Stack<StringBuilder> stringStack = new Stack<>();
    StringBuilder current = new StringBuilder();
    int count = 0;

    for (char c : s.toCharArray()) {
        if (Character.isDigit(c)) {
            count = count * 10 + (c - '0');
        } else if (c == '[') {
            countStack.push(count);
            stringStack.push(current);
            current = new StringBuilder();
            count = 0;
        } else if (c == ']') {
            StringBuilder decoded = stringStack.pop();
            int repeatCount = countStack.pop();
            for (int i = 0; i < repeatCount; i++) {
                decoded.append(current);
            }
            current = decoded;
        } else {
            current.append(c);
        }
    }

    return current.toString();
}

// Simplify Path
public String simplifyPath(String path) {
    Stack<String> stack = new Stack<>();
    String[] parts = path.split("/");

    for (String part : parts) {
        if (part.equals("..")) {
            if (!stack.isEmpty()) stack.pop();
        } else if (!part.isEmpty() && !part.equals(".")) {
            stack.push(part);
        }
    }

    StringBuilder result = new StringBuilder();
    for (String dir : stack) {
        result.append("/").append(dir);
    }

    return result.length() == 0 ? "/" : result.toString();
}

// Min Stack - O(1) getMin
class MinStack {
    private Stack<Integer> stack = new Stack<>();
    private Stack<Integer> minStack = new Stack<>();

    public void push(int val) {
        stack.push(val);
        if (minStack.isEmpty() || val <= minStack.peek()) {
            minStack.push(val);
        }
    }

    public void pop() {
        if (stack.pop().equals(minStack.peek())) {
            minStack.pop();
        }
    }

    public int top() {
        return stack.peek();
    }

    public int getMin() {
        return minStack.peek();
    }
}

// Largest Rectangle in Histogram
public int largestRectangleArea(int[] heights) {
    Stack<Integer> stack = new Stack<>();
    int maxArea = 0;
    int n = heights.length;

    for (int i = 0; i <= n; i++) {
        int h = (i == n) ? 0 : heights[i];

        while (!stack.isEmpty() && h < heights[stack.peek()]) {
            int height = heights[stack.pop()];
            int width = stack.isEmpty() ? i : i - stack.peek() - 1;
            maxArea = Math.max(maxArea, height * width);
        }

        stack.push(i);
    }

    return maxArea;
}`,
      python: `# Valid Parentheses
def isValid(s):
    stack = []
    pairs = {')': '(', '}': '{', ']': '['}

    for c in s:
        if c in pairs:
            if not stack or stack.pop() != pairs[c]:
                return False
        else:
            stack.append(c)

    return not stack

# Basic Calculator II
def calculate(s):
    stack = []
    num = 0
    operation = '+'

    for i, c in enumerate(s + '+'):
        if c.isdigit():
            num = num * 10 + int(c)
        elif c in '+-*/':
            if operation == '+':
                stack.append(num)
            elif operation == '-':
                stack.append(-num)
            elif operation == '*':
                stack.append(stack.pop() * num)
            elif operation == '/':
                stack.append(int(stack.pop() / num))
            operation = c
            num = 0

    return sum(stack)

# Decode String
def decodeString(s):
    count_stack = []
    string_stack = []
    current = []
    count = 0

    for c in s:
        if c.isdigit():
            count = count * 10 + int(c)
        elif c == '[':
            count_stack.append(count)
            string_stack.append(current)
            current = []
            count = 0
        elif c == ']':
            decoded = string_stack.pop()
            decoded.extend(current * count_stack.pop())
            current = decoded
        else:
            current.append(c)

    return ''.join(current)

# Largest Rectangle in Histogram
def largestRectangleArea(heights):
    stack = []
    max_area = 0
    heights.append(0)

    for i, h in enumerate(heights):
        while stack and h < heights[stack[-1]]:
            height = heights[stack.pop()]
            width = i if not stack else i - stack[-1] - 1
            max_area = max(max_area, height * width)
        stack.append(i)

    return max_area`,
      cpp: `// Valid Parentheses
bool isValid(std::string s) {
    std::stack<char> stack;
    std::unordered_map<char, char> pairs = {{')', '('}, {'}', '{'}, {']', '['}};

    for (char c : s) {
        if (pairs.count(c)) {
            if (stack.empty() || stack.top() != pairs[c]) return false;
            stack.pop();
        } else {
            stack.push(c);
        }
    }

    return stack.empty();
}`,
      javascript: `// Valid Parentheses
function isValid(s) {
  const stack = [];
  const pairs = { ')': '(', '}': '{', ']': '[' };

  for (const c of s) {
    if (c in pairs) {
      if (!stack.length || stack.pop() !== pairs[c]) return false;
    } else {
      stack.push(c);
    }
  }

  return stack.length === 0;
}

// Decode String
function decodeString(s) {
  const countStack = [], stringStack = [];
  let current = '', count = 0;

  for (const c of s) {
    if (/[0-9]/.test(c)) {
      count = count * 10 + parseInt(c);
    } else if (c === '[') {
      countStack.push(count);
      stringStack.push(current);
      current = '';
      count = 0;
    } else if (c === ']') {
      current = stringStack.pop() + current.repeat(countStack.pop());
    } else {
      current += c;
    }
  }

  return current;
}`,
    },
    keyPoints: [
      "LIFO: Last In First Out",
      "Parentheses: push open, pop and match close",
      "Calculator: track last operation, process on next operator",
      "Use auxiliary stack for O(1) min/max operations",
      "Monotonic stack: pop while condition violated",
    ],
    commonMistakes: [
      "Forgetting to check stack.isEmpty() before pop/peek",
      "Calculator: not handling end of string",
      "Path: not handling multiple slashes or trailing slash",
      "Min stack: using < instead of <= when pushing to minStack",
    ],
    relatedProblems: [
      "Valid Parentheses",
      "Basic Calculator",
      "Decode String",
      "Min Stack",
      "Largest Rectangle in Histogram",
    ],
    relatedPatterns: [],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "array-rotation",
    name: "Array Rotation",
    slug: "array-rotation",
    category: "Arrays & Sorting",
    description:
      "Rotating arrays by k positions is a common interview question. The reverse method is elegant and O(1) space. Understanding rotation also helps with rotated sorted array problems.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    whenToUse: [
      "Rotate array by k positions",
      "Search in rotated sorted array",
      "Find minimum in rotated array",
      "Cyclic data structures",
    ],
    codeSnippets: {
      java: `// Rotate array right by k positions
// Method 1: Reverse (most elegant, O(1) space)
public void rotate(int[] nums, int k) {
    int n = nums.length;
    k = k % n;  // Handle k > n

    reverse(nums, 0, n - 1);      // Reverse entire array
    reverse(nums, 0, k - 1);      // Reverse first k
    reverse(nums, k, n - 1);      // Reverse rest
}

private void reverse(int[] nums, int start, int end) {
    while (start < end) {
        int temp = nums[start];
        nums[start] = nums[end];
        nums[end] = temp;
        start++;
        end--;
    }
}

// Example: [1,2,3,4,5,6,7], k=3
// Step 1: [7,6,5,4,3,2,1]  (reverse all)
// Step 2: [5,6,7,4,3,2,1]  (reverse 0..2)
// Step 3: [5,6,7,1,2,3,4]  (reverse 3..6)

// Method 2: Cyclic replacements
public void rotateCyclic(int[] nums, int k) {
    int n = nums.length;
    k = k % n;
    int count = 0;

    for (int start = 0; count < n; start++) {
        int current = start;
        int prev = nums[start];

        do {
            int next = (current + k) % n;
            int temp = nums[next];
            nums[next] = prev;
            prev = temp;
            current = next;
            count++;
        } while (start != current);
    }
}

// Find Minimum in Rotated Sorted Array
public int findMin(int[] nums) {
    int left = 0, right = nums.length - 1;

    while (left < right) {
        int mid = left + (right - left) / 2;

        if (nums[mid] > nums[right]) {
            left = mid + 1;  // Min is in right half
        } else {
            right = mid;     // Min is in left half (including mid)
        }
    }

    return nums[left];
}

// Find Minimum with Duplicates
public int findMinDuplicates(int[] nums) {
    int left = 0, right = nums.length - 1;

    while (left < right) {
        int mid = left + (right - left) / 2;

        if (nums[mid] > nums[right]) {
            left = mid + 1;
        } else if (nums[mid] < nums[right]) {
            right = mid;
        } else {
            right--;  // Can't determine, shrink
        }
    }

    return nums[left];
}

// Search in Rotated Sorted Array
public int search(int[] nums, int target) {
    int left = 0, right = nums.length - 1;

    while (left <= right) {
        int mid = left + (right - left) / 2;

        if (nums[mid] == target) return mid;

        // Left half is sorted
        if (nums[left] <= nums[mid]) {
            if (nums[left] <= target && target < nums[mid]) {
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        }
        // Right half is sorted
        else {
            if (nums[mid] < target && target <= nums[right]) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
    }

    return -1;
}`,
      python: `# Rotate right by k
def rotate(nums, k):
    n = len(nums)
    k = k % n

    def reverse(start, end):
        while start < end:
            nums[start], nums[end] = nums[end], nums[start]
            start += 1
            end -= 1

    reverse(0, n - 1)
    reverse(0, k - 1)
    reverse(k, n - 1)

# Python shortcut (creates new list)
def rotate_simple(nums, k):
    k = k % len(nums)
    nums[:] = nums[-k:] + nums[:-k]

# Find Minimum
def findMin(nums):
    left, right = 0, len(nums) - 1

    while left < right:
        mid = (left + right) // 2

        if nums[mid] > nums[right]:
            left = mid + 1
        else:
            right = mid

    return nums[left]

# Search in Rotated Array
def search(nums, target):
    left, right = 0, len(nums) - 1

    while left <= right:
        mid = (left + right) // 2

        if nums[mid] == target:
            return mid

        if nums[left] <= nums[mid]:
            if nums[left] <= target < nums[mid]:
                right = mid - 1
            else:
                left = mid + 1
        else:
            if nums[mid] < target <= nums[right]:
                left = mid + 1
            else:
                right = mid - 1

    return -1`,
      cpp: `void rotate(std::vector<int>& nums, int k) {
    int n = nums.size();
    k = k % n;

    std::reverse(nums.begin(), nums.end());
    std::reverse(nums.begin(), nums.begin() + k);
    std::reverse(nums.begin() + k, nums.end());
}

int findMin(std::vector<int>& nums) {
    int left = 0, right = nums.size() - 1;

    while (left < right) {
        int mid = left + (right - left) / 2;

        if (nums[mid] > nums[right]) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }

    return nums[left];
}`,
      javascript: `// Rotate right by k
function rotate(nums, k) {
  const n = nums.length;
  k = k % n;

  const reverse = (start, end) => {
    while (start < end) {
      [nums[start], nums[end]] = [nums[end], nums[start]];
      start++;
      end--;
    }
  };

  reverse(0, n - 1);
  reverse(0, k - 1);
  reverse(k, n - 1);
}

// Find Minimum
function findMin(nums) {
  let left = 0, right = nums.length - 1;

  while (left < right) {
    const mid = Math.floor((left + right) / 2);

    if (nums[mid] > nums[right]) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }

  return nums[left];
}

// Search in Rotated Array
function search(nums, target) {
  let left = 0, right = nums.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (nums[mid] === target) return mid;

    if (nums[left] <= nums[mid]) {
      if (nums[left] <= target && target < nums[mid]) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    } else {
      if (nums[mid] < target && target <= nums[right]) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
  }

  return -1;
}`,
    },
    keyPoints: [
      "Reverse method: reverse all, reverse [0,k), reverse [k,n)",
      "Always k = k % n to handle k > array length",
      "Rotated sorted: one half is always sorted",
      "Find min: compare mid with right (not left)",
      "Search: determine which half is sorted, check if target in that range",
    ],
    commonMistakes: [
      "Forgetting k = k % n",
      "Find min: comparing mid with left instead of right",
      "Search: wrong boundary conditions in comparisons",
      "Not handling duplicates (requires linear fallback)",
    ],
    relatedProblems: [
      "Rotate Array",
      "Search in Rotated Sorted Array",
      "Find Minimum in Rotated Sorted Array",
    ],
    relatedPatterns: ["binary-search"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "palindrome-techniques",
    name: "Palindrome Techniques",
    slug: "palindrome-techniques",
    category: "String & Character",
    description:
      "Palindromes read the same forwards and backwards. Key techniques include two-pointer expansion, DP for subsequences, and Manacher's algorithm for optimal substring finding.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1) or O(n²)",
    whenToUse: [
      "Check if string is palindrome",
      "Find longest palindromic substring",
      "Count palindromic substrings",
      "Minimum insertions to make palindrome",
      "Palindrome partitioning",
    ],
    codeSnippets: {
      java: `// Check palindrome (two pointers)
public boolean isPalindrome(String s) {
    int left = 0, right = s.length() - 1;

    while (left < right) {
        // Skip non-alphanumeric (for "valid palindrome" variant)
        while (left < right && !Character.isLetterOrDigit(s.charAt(left))) left++;
        while (left < right && !Character.isLetterOrDigit(s.charAt(right))) right--;

        if (Character.toLowerCase(s.charAt(left)) !=
            Character.toLowerCase(s.charAt(right))) {
            return false;
        }
        left++;
        right--;
    }

    return true;
}

// Longest Palindromic Substring - Expand Around Center
public String longestPalindrome(String s) {
    if (s == null || s.length() < 1) return "";

    int start = 0, maxLen = 0;

    for (int i = 0; i < s.length(); i++) {
        // Odd length palindrome
        int len1 = expandAroundCenter(s, i, i);
        // Even length palindrome
        int len2 = expandAroundCenter(s, i, i + 1);

        int len = Math.max(len1, len2);
        if (len > maxLen) {
            maxLen = len;
            start = i - (len - 1) / 2;
        }
    }

    return s.substring(start, start + maxLen);
}

private int expandAroundCenter(String s, int left, int right) {
    while (left >= 0 && right < s.length() &&
           s.charAt(left) == s.charAt(right)) {
        left--;
        right++;
    }
    return right - left - 1;
}

// Count Palindromic Substrings
public int countSubstrings(String s) {
    int count = 0;

    for (int i = 0; i < s.length(); i++) {
        // Odd length
        count += countPalindromes(s, i, i);
        // Even length
        count += countPalindromes(s, i, i + 1);
    }

    return count;
}

private int countPalindromes(String s, int left, int right) {
    int count = 0;
    while (left >= 0 && right < s.length() &&
           s.charAt(left) == s.charAt(right)) {
        count++;
        left--;
        right++;
    }
    return count;
}

// Longest Palindromic Subsequence (DP)
public int longestPalindromeSubseq(String s) {
    int n = s.length();
    int[][] dp = new int[n][n];

    // Single characters
    for (int i = 0; i < n; i++) {
        dp[i][i] = 1;
    }

    // Fill for increasing lengths
    for (int len = 2; len <= n; len++) {
        for (int i = 0; i <= n - len; i++) {
            int j = i + len - 1;

            if (s.charAt(i) == s.charAt(j)) {
                dp[i][j] = dp[i + 1][j - 1] + 2;
            } else {
                dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1]);
            }
        }
    }

    return dp[0][n - 1];
}

// Valid Palindrome II (can delete at most one character)
public boolean validPalindrome(String s) {
    int left = 0, right = s.length() - 1;

    while (left < right) {
        if (s.charAt(left) != s.charAt(right)) {
            // Try skipping left or right
            return isPalindromeRange(s, left + 1, right) ||
                   isPalindromeRange(s, left, right - 1);
        }
        left++;
        right--;
    }

    return true;
}

private boolean isPalindromeRange(String s, int left, int right) {
    while (left < right) {
        if (s.charAt(left++) != s.charAt(right--)) {
            return false;
        }
    }
    return true;
}

// Palindrome Partitioning (backtracking)
public List<List<String>> partition(String s) {
    List<List<String>> result = new ArrayList<>();
    backtrack(s, 0, new ArrayList<>(), result);
    return result;
}

private void backtrack(String s, int start, List<String> current,
                       List<List<String>> result) {
    if (start == s.length()) {
        result.add(new ArrayList<>(current));
        return;
    }

    for (int end = start + 1; end <= s.length(); end++) {
        if (isPalindromeRange(s, start, end - 1)) {
            current.add(s.substring(start, end));
            backtrack(s, end, current, result);
            current.remove(current.size() - 1);
        }
    }
}`,
      python: `# Check palindrome
def isPalindrome(s):
    s = ''.join(c.lower() for c in s if c.isalnum())
    return s == s[::-1]

# Longest Palindromic Substring - Expand
def longestPalindrome(s):
    def expand(left, right):
        while left >= 0 and right < len(s) and s[left] == s[right]:
            left -= 1
            right += 1
        return s[left + 1:right]

    result = ""
    for i in range(len(s)):
        odd = expand(i, i)
        even = expand(i, i + 1)
        result = max(result, odd, even, key=len)

    return result

# Count Palindromic Substrings
def countSubstrings(s):
    def count(left, right):
        count = 0
        while left >= 0 and right < len(s) and s[left] == s[right]:
            count += 1
            left -= 1
            right += 1
        return count

    return sum(count(i, i) + count(i, i + 1) for i in range(len(s)))

# Longest Palindromic Subsequence
def longestPalindromeSubseq(s):
    n = len(s)
    dp = [[0] * n for _ in range(n)]

    for i in range(n):
        dp[i][i] = 1

    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            if s[i] == s[j]:
                dp[i][j] = dp[i + 1][j - 1] + 2
            else:
                dp[i][j] = max(dp[i + 1][j], dp[i][j - 1])

    return dp[0][n - 1]

# Valid Palindrome II
def validPalindrome(s):
    def check(left, right):
        while left < right:
            if s[left] != s[right]:
                return False
            left += 1
            right -= 1
        return True

    left, right = 0, len(s) - 1
    while left < right:
        if s[left] != s[right]:
            return check(left + 1, right) or check(left, right - 1)
        left += 1
        right -= 1

    return True`,
      cpp: `// Longest Palindromic Substring
std::string longestPalindrome(std::string s) {
    int start = 0, maxLen = 0;

    auto expand = [&](int left, int right) -> int {
        while (left >= 0 && right < s.size() && s[left] == s[right]) {
            left--;
            right++;
        }
        return right - left - 1;
    };

    for (int i = 0; i < s.size(); i++) {
        int len = std::max(expand(i, i), expand(i, i + 1));
        if (len > maxLen) {
            maxLen = len;
            start = i - (len - 1) / 2;
        }
    }

    return s.substr(start, maxLen);
}`,
      javascript: `// Longest Palindromic Substring
function longestPalindrome(s) {
  let start = 0, maxLen = 0;

  const expand = (left, right) => {
    while (left >= 0 && right < s.length && s[left] === s[right]) {
      left--;
      right++;
    }
    return right - left - 1;
  };

  for (let i = 0; i < s.length; i++) {
    const len = Math.max(expand(i, i), expand(i, i + 1));
    if (len > maxLen) {
      maxLen = len;
      start = i - Math.floor((len - 1) / 2);
    }
  }

  return s.substring(start, start + maxLen);
}

// Count Palindromic Substrings
function countSubstrings(s) {
  let count = 0;

  const countPalindromes = (left, right) => {
    while (left >= 0 && right < s.length && s[left] === s[right]) {
      count++;
      left--;
      right++;
    }
  };

  for (let i = 0; i < s.length; i++) {
    countPalindromes(i, i);      // Odd
    countPalindromes(i, i + 1);  // Even
  }

  return count;
}`,
    },
    keyPoints: [
      "Two-pointer: compare from both ends",
      "Expand around center: handles both odd and even length",
      "Subsequence (not substring): use DP",
      "Start index from length: i - (len - 1) / 2",
      "Partitioning: backtrack with isPalindrome check",
    ],
    commonMistakes: [
      "Forgetting even-length palindromes (expand from i, i+1)",
      "Off-by-one in start index calculation",
      "Confusing substring (contiguous) vs subsequence",
      "Not handling case/alphanumeric in 'valid palindrome'",
    ],
    relatedProblems: [
      "Valid Palindrome",
      "Longest Palindromic Substring",
      "Palindromic Substrings",
      "Longest Palindromic Subsequence",
    ],
    relatedPatterns: [],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "math-tricks",
    name: "Math Tricks for DSA",
    slug: "math-tricks",
    category: "Type Conversions & Math",
    description:
      "Mathematical tricks and formulas commonly used in DSA problems: GCD/LCM, prime checking, combinations, geometric formulas, and number theory basics.",
    timeComplexity: "O(1) to O(√n)",
    spaceComplexity: "O(1)",
    whenToUse: [
      "GCD, LCM calculations",
      "Prime number problems",
      "Counting combinations (nCr)",
      "Geometric calculations",
      "Number digit operations",
    ],
    codeSnippets: {
      java: `// GCD - Euclidean Algorithm
public int gcd(int a, int b) {
    while (b != 0) {
        int temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

// Recursive version
public int gcdRecursive(int a, int b) {
    return b == 0 ? a : gcd(b, a % b);
}

// LCM using GCD
public int lcm(int a, int b) {
    return a / gcd(a, b) * b;  // Divide first to avoid overflow
}

// Check if prime
public boolean isPrime(int n) {
    if (n <= 1) return false;
    if (n <= 3) return true;
    if (n % 2 == 0 || n % 3 == 0) return false;

    for (int i = 5; i * i <= n; i += 6) {
        if (n % i == 0 || n % (i + 2) == 0) {
            return false;
        }
    }

    return true;
}

// Sieve of Eratosthenes - all primes up to n
public List<Integer> sieveOfEratosthenes(int n) {
    boolean[] isPrime = new boolean[n + 1];
    Arrays.fill(isPrime, true);
    isPrime[0] = isPrime[1] = false;

    for (int i = 2; i * i <= n; i++) {
        if (isPrime[i]) {
            for (int j = i * i; j <= n; j += i) {
                isPrime[j] = false;
            }
        }
    }

    List<Integer> primes = new ArrayList<>();
    for (int i = 2; i <= n; i++) {
        if (isPrime[i]) primes.add(i);
    }

    return primes;
}

// Fast exponentiation (a^n % mod)
public long power(long base, long exp, long mod) {
    long result = 1;
    base %= mod;

    while (exp > 0) {
        if ((exp & 1) == 1) {
            result = (result * base) % mod;
        }
        exp >>= 1;
        base = (base * base) % mod;
    }

    return result;
}

// Count digits
public int countDigits(int n) {
    if (n == 0) return 1;
    return (int) Math.log10(Math.abs(n)) + 1;
}

// Reverse number
public int reverseNumber(int n) {
    int reversed = 0;
    while (n != 0) {
        reversed = reversed * 10 + n % 10;
        n /= 10;
    }
    return reversed;
}

// Sum of digits
public int digitSum(int n) {
    int sum = 0;
    while (n != 0) {
        sum += n % 10;
        n /= 10;
    }
    return sum;
}

// nCr (combinations) using Pascal's triangle or direct
public long nCr(int n, int r) {
    if (r > n - r) r = n - r;  // Optimization

    long result = 1;
    for (int i = 0; i < r; i++) {
        result = result * (n - i) / (i + 1);
    }

    return result;
}

// Check if perfect square
public boolean isPerfectSquare(int n) {
    if (n < 0) return false;
    int root = (int) Math.sqrt(n);
    return root * root == n;
}

// Integer square root (without floating point)
public int mySqrt(int x) {
    if (x < 2) return x;

    long left = 1, right = x / 2;

    while (left <= right) {
        long mid = left + (right - left) / 2;
        long square = mid * mid;

        if (square == x) return (int) mid;
        else if (square < x) left = mid + 1;
        else right = mid - 1;
    }

    return (int) right;
}

// Count trailing zeros in n!
public int trailingZeroes(int n) {
    int count = 0;
    while (n >= 5) {
        n /= 5;
        count += n;
    }
    return count;
}`,
      python: `import math

# GCD and LCM (built-in)
gcd = math.gcd(a, b)
lcm = (a * b) // math.gcd(a, b)

# Python 3.9+
lcm = math.lcm(a, b)

# Check if prime
def is_prime(n):
    if n <= 1:
        return False
    if n <= 3:
        return True
    if n % 2 == 0 or n % 3 == 0:
        return False

    i = 5
    while i * i <= n:
        if n % i == 0 or n % (i + 2) == 0:
            return False
        i += 6

    return True

# Sieve of Eratosthenes
def sieve(n):
    is_prime = [True] * (n + 1)
    is_prime[0] = is_prime[1] = False

    for i in range(2, int(n**0.5) + 1):
        if is_prime[i]:
            for j in range(i * i, n + 1, i):
                is_prime[j] = False

    return [i for i in range(n + 1) if is_prime[i]]

# Fast power
def power(base, exp, mod):
    result = 1
    base %= mod

    while exp > 0:
        if exp & 1:
            result = (result * base) % mod
        exp >>= 1
        base = (base * base) % mod

    return result

# Built-in
pow(base, exp, mod)  # Fast modular exponentiation

# Combinations
from math import comb
nCr = comb(n, r)

# Factorial
from math import factorial
fact = factorial(n)

# Number of digits
digits = len(str(abs(n)))
# or
digits = int(math.log10(abs(n))) + 1 if n != 0 else 1

# Trailing zeros in n!
def trailing_zeroes(n):
    count = 0
    while n >= 5:
        n //= 5
        count += n
    return count`,
      cpp: `#include <cmath>
#include <algorithm>

// GCD (C++17 has std::gcd)
int gcd(int a, int b) {
    return b == 0 ? a : gcd(b, a % b);
}

// Or use __gcd (GCC)
int g = __gcd(a, b);

// C++17
int g = std::gcd(a, b);
int l = std::lcm(a, b);

// Fast power
long long power(long long base, long long exp, long long mod) {
    long long result = 1;
    base %= mod;

    while (exp > 0) {
        if (exp & 1) result = (result * base) % mod;
        exp >>= 1;
        base = (base * base) % mod;
    }

    return result;
}

// Check prime
bool isPrime(int n) {
    if (n <= 1) return false;
    if (n <= 3) return true;
    if (n % 2 == 0 || n % 3 == 0) return false;

    for (int i = 5; i * i <= n; i += 6) {
        if (n % i == 0 || n % (i + 2) == 0) return false;
    }

    return true;
}`,
      javascript: `// GCD
function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

// LCM
function lcm(a, b) {
  return Math.floor(a / gcd(a, b)) * b;
}

// Check prime
function isPrime(n) {
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;

  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }

  return true;
}

// Fast power
function power(base, exp, mod) {
  let result = 1n;
  base = BigInt(base) % BigInt(mod);
  exp = BigInt(exp);
  const modBig = BigInt(mod);

  while (exp > 0n) {
    if (exp & 1n) result = (result * base) % modBig;
    exp >>= 1n;
    base = (base * base) % modBig;
  }

  return Number(result);
}

// Count digits
function countDigits(n) {
  return n === 0 ? 1 : Math.floor(Math.log10(Math.abs(n))) + 1;
}

// Reverse number
function reverseNumber(n) {
  let reversed = 0;
  while (n !== 0) {
    reversed = reversed * 10 + n % 10;
    n = Math.trunc(n / 10);
  }
  return reversed;
}`,
    },
    keyPoints: [
      "GCD: Euclidean algorithm, b == 0 ? a : gcd(b, a % b)",
      "LCM = a / gcd(a, b) * b (divide first to avoid overflow)",
      "Prime check: only check up to sqrt(n), skip multiples of 2 and 3",
      "Fast power: O(log n), use for modular exponentiation",
      "Trailing zeros in n!: count factors of 5",
    ],
    commonMistakes: [
      "Overflow in LCM: always divide before multiply",
      "Prime check: forgetting n <= 1 case",
      "Fast power: not taking mod at each step",
      "sqrt: floating point precision issues, use binary search",
    ],
    relatedProblems: [
      "Count Primes",
      "Pow(x, n)",
      "Sqrt(x)",
      "Factorial Trailing Zeroes",
      "GCD of Strings",
    ],
    relatedPatterns: [],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "segment-tree",
    name: "Segment Tree",
    slug: "segment-tree",
    category: "Data Structures",
    description:
      "A Segment Tree is a binary tree for storing intervals/segments. It allows efficient range queries (sum, min, max) and point updates in O(log n) time.",
    timeComplexity: "O(log n) query/update",
    spaceComplexity: "O(n)",
    whenToUse: [
      "Range sum/min/max queries with updates",
      "Range updates with lazy propagation",
      "Counting inversions",
      "Finding intervals containing a point",
    ],
    codeSnippets: {
      java: `// Segment Tree for Range Sum Queries
class SegmentTree {
    private int[] tree;
    private int n;

    public SegmentTree(int[] nums) {
        n = nums.length;
        tree = new int[4 * n];  // 4n is safe upper bound
        build(nums, 0, 0, n - 1);
    }

    // Build tree: O(n)
    private void build(int[] nums, int node, int start, int end) {
        if (start == end) {
            tree[node] = nums[start];
            return;
        }

        int mid = (start + end) / 2;
        int leftChild = 2 * node + 1;
        int rightChild = 2 * node + 2;

        build(nums, leftChild, start, mid);
        build(nums, rightChild, mid + 1, end);

        tree[node] = tree[leftChild] + tree[rightChild];
    }

    // Point update: O(log n)
    public void update(int index, int val) {
        update(0, 0, n - 1, index, val);
    }

    private void update(int node, int start, int end, int index, int val) {
        if (start == end) {
            tree[node] = val;
            return;
        }

        int mid = (start + end) / 2;
        int leftChild = 2 * node + 1;
        int rightChild = 2 * node + 2;

        if (index <= mid) {
            update(leftChild, start, mid, index, val);
        } else {
            update(rightChild, mid + 1, end, index, val);
        }

        tree[node] = tree[leftChild] + tree[rightChild];
    }

    // Range query [left, right]: O(log n)
    public int query(int left, int right) {
        return query(0, 0, n - 1, left, right);
    }

    private int query(int node, int start, int end, int left, int right) {
        // No overlap
        if (right < start || left > end) {
            return 0;
        }

        // Complete overlap
        if (left <= start && end <= right) {
            return tree[node];
        }

        // Partial overlap
        int mid = (start + end) / 2;
        int leftChild = 2 * node + 1;
        int rightChild = 2 * node + 2;

        int leftSum = query(leftChild, start, mid, left, right);
        int rightSum = query(rightChild, mid + 1, end, left, right);

        return leftSum + rightSum;
    }
}

// Usage
int[] nums = {1, 3, 5, 7, 9, 11};
SegmentTree st = new SegmentTree(nums);
st.query(1, 3);    // Sum of nums[1..3] = 3+5+7 = 15
st.update(1, 10);  // nums[1] = 10
st.query(1, 3);    // Now 10+5+7 = 22

// Segment Tree for Range Minimum
class MinSegmentTree {
    private int[] tree;
    private int n;

    public MinSegmentTree(int[] nums) {
        n = nums.length;
        tree = new int[4 * n];
        Arrays.fill(tree, Integer.MAX_VALUE);
        build(nums, 0, 0, n - 1);
    }

    private void build(int[] nums, int node, int start, int end) {
        if (start == end) {
            tree[node] = nums[start];
            return;
        }

        int mid = (start + end) / 2;
        build(nums, 2 * node + 1, start, mid);
        build(nums, 2 * node + 2, mid + 1, end);
        tree[node] = Math.min(tree[2 * node + 1], tree[2 * node + 2]);
    }

    public int queryMin(int left, int right) {
        return queryMin(0, 0, n - 1, left, right);
    }

    private int queryMin(int node, int start, int end, int left, int right) {
        if (right < start || left > end) return Integer.MAX_VALUE;
        if (left <= start && end <= right) return tree[node];

        int mid = (start + end) / 2;
        return Math.min(
            queryMin(2 * node + 1, start, mid, left, right),
            queryMin(2 * node + 2, mid + 1, end, left, right)
        );
    }
}`,
      python: `class SegmentTree:
    def __init__(self, nums):
        self.n = len(nums)
        self.tree = [0] * (4 * self.n)
        self._build(nums, 0, 0, self.n - 1)

    def _build(self, nums, node, start, end):
        if start == end:
            self.tree[node] = nums[start]
            return

        mid = (start + end) // 2
        self._build(nums, 2 * node + 1, start, mid)
        self._build(nums, 2 * node + 2, mid + 1, end)
        self.tree[node] = self.tree[2 * node + 1] + self.tree[2 * node + 2]

    def update(self, index, val):
        self._update(0, 0, self.n - 1, index, val)

    def _update(self, node, start, end, index, val):
        if start == end:
            self.tree[node] = val
            return

        mid = (start + end) // 2
        if index <= mid:
            self._update(2 * node + 1, start, mid, index, val)
        else:
            self._update(2 * node + 2, mid + 1, end, index, val)

        self.tree[node] = self.tree[2 * node + 1] + self.tree[2 * node + 2]

    def query(self, left, right):
        return self._query(0, 0, self.n - 1, left, right)

    def _query(self, node, start, end, left, right):
        if right < start or left > end:
            return 0
        if left <= start and end <= right:
            return self.tree[node]

        mid = (start + end) // 2
        return (self._query(2 * node + 1, start, mid, left, right) +
                self._query(2 * node + 2, mid + 1, end, left, right))`,
      cpp: `class SegmentTree {
private:
    std::vector<int> tree;
    int n;

    void build(const std::vector<int>& nums, int node, int start, int end) {
        if (start == end) {
            tree[node] = nums[start];
            return;
        }

        int mid = (start + end) / 2;
        build(nums, 2 * node + 1, start, mid);
        build(nums, 2 * node + 2, mid + 1, end);
        tree[node] = tree[2 * node + 1] + tree[2 * node + 2];
    }

    void update(int node, int start, int end, int idx, int val) {
        if (start == end) {
            tree[node] = val;
            return;
        }

        int mid = (start + end) / 2;
        if (idx <= mid) update(2 * node + 1, start, mid, idx, val);
        else update(2 * node + 2, mid + 1, end, idx, val);

        tree[node] = tree[2 * node + 1] + tree[2 * node + 2];
    }

    int query(int node, int start, int end, int left, int right) {
        if (right < start || left > end) return 0;
        if (left <= start && end <= right) return tree[node];

        int mid = (start + end) / 2;
        return query(2 * node + 1, start, mid, left, right) +
               query(2 * node + 2, mid + 1, end, left, right);
    }

public:
    SegmentTree(std::vector<int>& nums) : n(nums.size()), tree(4 * n) {
        build(nums, 0, 0, n - 1);
    }

    void update(int idx, int val) { update(0, 0, n - 1, idx, val); }
    int query(int left, int right) { return query(0, 0, n - 1, left, right); }
};`,
      javascript: `class SegmentTree {
  constructor(nums) {
    this.n = nums.length;
    this.tree = new Array(4 * this.n).fill(0);
    this._build(nums, 0, 0, this.n - 1);
  }

  _build(nums, node, start, end) {
    if (start === end) {
      this.tree[node] = nums[start];
      return;
    }

    const mid = Math.floor((start + end) / 2);
    this._build(nums, 2 * node + 1, start, mid);
    this._build(nums, 2 * node + 2, mid + 1, end);
    this.tree[node] = this.tree[2 * node + 1] + this.tree[2 * node + 2];
  }

  update(index, val) {
    this._update(0, 0, this.n - 1, index, val);
  }

  _update(node, start, end, index, val) {
    if (start === end) {
      this.tree[node] = val;
      return;
    }

    const mid = Math.floor((start + end) / 2);
    if (index <= mid) {
      this._update(2 * node + 1, start, mid, index, val);
    } else {
      this._update(2 * node + 2, mid + 1, end, index, val);
    }

    this.tree[node] = this.tree[2 * node + 1] + this.tree[2 * node + 2];
  }

  query(left, right) {
    return this._query(0, 0, this.n - 1, left, right);
  }

  _query(node, start, end, left, right) {
    if (right < start || left > end) return 0;
    if (left <= start && end <= right) return this.tree[node];

    const mid = Math.floor((start + end) / 2);
    return this._query(2 * node + 1, start, mid, left, right) +
           this._query(2 * node + 2, mid + 1, end, left, right);
  }
}`,
    },
    keyPoints: [
      "Tree size: 4n is safe upper bound",
      "Node i has children at 2i+1 and 2i+2",
      "Build: O(n), Query: O(log n), Update: O(log n)",
      "Three cases: no overlap, complete overlap, partial overlap",
      "Can be adapted for sum, min, max, GCD, etc.",
    ],
    commonMistakes: [
      "Array size too small (use 4n)",
      "Wrong merge operation for query type",
      "Off-by-one in range boundaries",
      "Forgetting to update parent after child update",
    ],
    relatedProblems: [
      "Range Sum Query - Mutable",
      "Count of Smaller Numbers After Self",
      "Range Minimum Query",
    ],
    relatedPatterns: [],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "fenwick-tree",
    name: "Fenwick Tree (Binary Indexed Tree)",
    slug: "fenwick-tree",
    category: "Data Structures",
    description:
      "A Fenwick Tree (BIT) provides O(log n) prefix sums and point updates with less memory than a Segment Tree. It's simpler to implement but less flexible.",
    timeComplexity: "O(log n) query/update",
    spaceComplexity: "O(n)",
    whenToUse: [
      "Prefix sum queries with updates",
      "Counting inversions",
      "Range sum queries (using two prefix queries)",
      "When segment tree is overkill",
    ],
    codeSnippets: {
      java: `class FenwickTree {
    private int[] tree;
    private int n;

    public FenwickTree(int n) {
        this.n = n;
        this.tree = new int[n + 1];  // 1-indexed
    }

    // Build from array
    public FenwickTree(int[] nums) {
        this.n = nums.length;
        this.tree = new int[n + 1];

        for (int i = 0; i < n; i++) {
            update(i, nums[i]);
        }
    }

    // Add delta to index i (0-indexed input)
    public void update(int i, int delta) {
        i++;  // Convert to 1-indexed

        while (i <= n) {
            tree[i] += delta;
            i += i & (-i);  // Add lowest set bit
        }
    }

    // Prefix sum [0, i] (0-indexed input)
    public int prefixSum(int i) {
        i++;  // Convert to 1-indexed
        int sum = 0;

        while (i > 0) {
            sum += tree[i];
            i -= i & (-i);  // Remove lowest set bit
        }

        return sum;
    }

    // Range sum [left, right]
    public int rangeSum(int left, int right) {
        return prefixSum(right) - (left > 0 ? prefixSum(left - 1) : 0);
    }
}

// Count Smaller Numbers After Self
public List<Integer> countSmaller(int[] nums) {
    // Coordinate compression
    int[] sorted = nums.clone();
    Arrays.sort(sorted);
    Map<Integer, Integer> ranks = new HashMap<>();
    int rank = 1;
    for (int num : sorted) {
        if (!ranks.containsKey(num)) {
            ranks.put(num, rank++);
        }
    }

    int n = nums.length;
    int[] result = new int[n];
    FenwickTree bit = new FenwickTree(rank);

    // Process from right to left
    for (int i = n - 1; i >= 0; i--) {
        int r = ranks.get(nums[i]);
        result[i] = bit.prefixSum(r - 2);  // Count numbers smaller than current
        bit.update(r - 1, 1);
    }

    List<Integer> list = new ArrayList<>();
    for (int r : result) list.add(r);
    return list;
}

// Range Sum Query - Mutable
class NumArray {
    private FenwickTree bit;
    private int[] nums;

    public NumArray(int[] nums) {
        this.nums = nums.clone();
        this.bit = new FenwickTree(nums);
    }

    public void update(int index, int val) {
        int delta = val - nums[index];
        nums[index] = val;
        bit.update(index, delta);
    }

    public int sumRange(int left, int right) {
        return bit.rangeSum(left, right);
    }
}`,
      python: `class FenwickTree:
    def __init__(self, n):
        self.n = n
        self.tree = [0] * (n + 1)

    def update(self, i, delta):
        i += 1  # 1-indexed
        while i <= self.n:
            self.tree[i] += delta
            i += i & (-i)

    def prefix_sum(self, i):
        i += 1  # 1-indexed
        total = 0
        while i > 0:
            total += self.tree[i]
            i -= i & (-i)
        return total

    def range_sum(self, left, right):
        return self.prefix_sum(right) - (self.prefix_sum(left - 1) if left > 0 else 0)

# Count Smaller Numbers After Self
def countSmaller(nums):
    # Coordinate compression
    sorted_unique = sorted(set(nums))
    ranks = {v: i + 1 for i, v in enumerate(sorted_unique)}

    n = len(nums)
    result = [0] * n
    bit = FenwickTree(len(ranks))

    for i in range(n - 1, -1, -1):
        r = ranks[nums[i]]
        result[i] = bit.prefix_sum(r - 2) if r > 1 else 0
        bit.update(r - 1, 1)

    return result`,
      cpp: `class FenwickTree {
private:
    std::vector<int> tree;
    int n;

public:
    FenwickTree(int n) : n(n), tree(n + 1, 0) {}

    void update(int i, int delta) {
        i++;
        while (i <= n) {
            tree[i] += delta;
            i += i & (-i);
        }
    }

    int prefixSum(int i) {
        i++;
        int sum = 0;
        while (i > 0) {
            sum += tree[i];
            i -= i & (-i);
        }
        return sum;
    }

    int rangeSum(int left, int right) {
        return prefixSum(right) - (left > 0 ? prefixSum(left - 1) : 0);
    }
};`,
      javascript: `class FenwickTree {
  constructor(n) {
    this.n = n;
    this.tree = new Array(n + 1).fill(0);
  }

  update(i, delta) {
    i++;
    while (i <= this.n) {
      this.tree[i] += delta;
      i += i & (-i);
    }
  }

  prefixSum(i) {
    i++;
    let sum = 0;
    while (i > 0) {
      sum += this.tree[i];
      i -= i & (-i);
    }
    return sum;
  }

  rangeSum(left, right) {
    return this.prefixSum(right) - (left > 0 ? this.prefixSum(left - 1) : 0);
  }
}`,
    },
    keyPoints: [
      "1-indexed internally (convert 0-indexed input)",
      "i & (-i) gives lowest set bit",
      "Update: add lowest set bit; Query: remove lowest set bit",
      "Range sum = prefix(right) - prefix(left-1)",
      "Simpler than segment tree but only for prefix operations",
    ],
    commonMistakes: [
      "Forgetting 1-indexing",
      "Using update for setting value (should add delta)",
      "Off-by-one in range sum calculation",
      "Not doing coordinate compression for sparse values",
    ],
    relatedProblems: [
      "Range Sum Query - Mutable",
      "Count of Smaller Numbers After Self",
      "Count Inversions",
    ],
    relatedPatterns: [],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "bellman-ford",
    name: "Bellman-Ford Algorithm",
    slug: "bellman-ford",
    category: "Algorithm Idioms",
    description:
      "Bellman-Ford finds shortest paths from a source vertex to all other vertices, even with negative edge weights. It can also detect negative cycles.",
    timeComplexity: "O(V × E)",
    spaceComplexity: "O(V)",
    whenToUse: [
      "Shortest path with negative edges",
      "Detecting negative cycles",
      "When Dijkstra won't work",
      "Cheapest flights with k stops",
    ],
    codeSnippets: {
      java: `// Bellman-Ford Algorithm
// Returns distances from source, or null if negative cycle exists
public int[] bellmanFord(int n, int[][] edges, int source) {
    int[] dist = new int[n];
    Arrays.fill(dist, Integer.MAX_VALUE);
    dist[source] = 0;

    // Relax all edges n-1 times
    for (int i = 0; i < n - 1; i++) {
        boolean updated = false;

        for (int[] edge : edges) {
            int u = edge[0], v = edge[1], w = edge[2];

            if (dist[u] != Integer.MAX_VALUE && dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                updated = true;
            }
        }

        // Early termination if no updates
        if (!updated) break;
    }

    // Check for negative cycle
    for (int[] edge : edges) {
        int u = edge[0], v = edge[1], w = edge[2];

        if (dist[u] != Integer.MAX_VALUE && dist[u] + w < dist[v]) {
            return null;  // Negative cycle detected
        }
    }

    return dist;
}

// Cheapest Flights Within K Stops
public int findCheapestPrice(int n, int[][] flights, int src, int dst, int k) {
    int[] dist = new int[n];
    Arrays.fill(dist, Integer.MAX_VALUE);
    dist[src] = 0;

    // At most k+1 edges (k stops = k+1 edges)
    for (int i = 0; i <= k; i++) {
        int[] temp = dist.clone();  // Important: use previous iteration's values

        for (int[] flight : flights) {
            int u = flight[0], v = flight[1], w = flight[2];

            if (dist[u] != Integer.MAX_VALUE) {
                temp[v] = Math.min(temp[v], dist[u] + w);
            }
        }

        dist = temp;
    }

    return dist[dst] == Integer.MAX_VALUE ? -1 : dist[dst];
}

// Detect negative cycle
public boolean hasNegativeCycle(int n, int[][] edges) {
    int[] dist = new int[n];

    for (int i = 0; i < n - 1; i++) {
        for (int[] edge : edges) {
            int u = edge[0], v = edge[1], w = edge[2];
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
            }
        }
    }

    // Check for negative cycle
    for (int[] edge : edges) {
        int u = edge[0], v = edge[1], w = edge[2];
        if (dist[u] + w < dist[v]) {
            return true;
        }
    }

    return false;
}`,
      python: `def bellman_ford(n, edges, source):
    dist = [float('inf')] * n
    dist[source] = 0

    # Relax n-1 times
    for _ in range(n - 1):
        updated = False
        for u, v, w in edges:
            if dist[u] != float('inf') and dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                updated = True

        if not updated:
            break

    # Check for negative cycle
    for u, v, w in edges:
        if dist[u] != float('inf') and dist[u] + w < dist[v]:
            return None  # Negative cycle

    return dist

# Cheapest Flights Within K Stops
def findCheapestPrice(n, flights, src, dst, k):
    dist = [float('inf')] * n
    dist[src] = 0

    for _ in range(k + 1):
        temp = dist.copy()
        for u, v, w in flights:
            if dist[u] != float('inf'):
                temp[v] = min(temp[v], dist[u] + w)
        dist = temp

    return dist[dst] if dist[dst] != float('inf') else -1`,
      cpp: `std::vector<int> bellmanFord(int n, std::vector<std::vector<int>>& edges, int source) {
    std::vector<int> dist(n, INT_MAX);
    dist[source] = 0;

    for (int i = 0; i < n - 1; i++) {
        for (auto& edge : edges) {
            int u = edge[0], v = edge[1], w = edge[2];
            if (dist[u] != INT_MAX && dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
            }
        }
    }

    // Check negative cycle
    for (auto& edge : edges) {
        int u = edge[0], v = edge[1], w = edge[2];
        if (dist[u] != INT_MAX && dist[u] + w < dist[v]) {
            return {};  // Negative cycle
        }
    }

    return dist;
}`,
      javascript: `function bellmanFord(n, edges, source) {
  const dist = new Array(n).fill(Infinity);
  dist[source] = 0;

  for (let i = 0; i < n - 1; i++) {
    let updated = false;
    for (const [u, v, w] of edges) {
      if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        updated = true;
      }
    }
    if (!updated) break;
  }

  // Check negative cycle
  for (const [u, v, w] of edges) {
    if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
      return null;
    }
  }

  return dist;
}

// Cheapest Flights Within K Stops
function findCheapestPrice(n, flights, src, dst, k) {
  let dist = new Array(n).fill(Infinity);
  dist[src] = 0;

  for (let i = 0; i <= k; i++) {
    const temp = [...dist];
    for (const [u, v, w] of flights) {
      if (dist[u] !== Infinity) {
        temp[v] = Math.min(temp[v], dist[u] + w);
      }
    }
    dist = temp;
  }

  return dist[dst] === Infinity ? -1 : dist[dst];
}`,
    },
    keyPoints: [
      "Time: O(VE), works with negative edges",
      "Relax all edges V-1 times",
      "After V-1 iterations, if still updating → negative cycle",
      "For k stops: only k+1 iterations, clone array each iteration",
      "Use Dijkstra if no negative edges (faster)",
    ],
    commonMistakes: [
      "Not handling Integer.MAX_VALUE overflow",
      "Cheapest flights: not cloning array (uses current iteration values)",
      "Forgetting early termination optimization",
      "Using wrong number of iterations for k stops",
    ],
    relatedProblems: [
      "Cheapest Flights Within K Stops",
      "Network Delay Time",
      "Negative Cycle Detection",
    ],
    relatedPatterns: ["graphs"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "kruskal-prim-mst",
    name: "Minimum Spanning Tree (Kruskal & Prim)",
    slug: "kruskal-prim-mst",
    category: "Algorithm Idioms",
    description:
      "A Minimum Spanning Tree connects all vertices with minimum total edge weight. Kruskal's algorithm sorts edges and uses Union-Find; Prim's algorithm grows the tree from a starting vertex.",
    timeComplexity: "O(E log E)",
    spaceComplexity: "O(V)",
    whenToUse: [
      "Connecting all nodes with minimum cost",
      "Network design problems",
      "Clustering (stop before fully connected)",
      "Finding minimum cost to connect points",
    ],
    codeSnippets: {
      java: `// Kruskal's Algorithm - O(E log E)
public int kruskalMST(int n, int[][] edges) {
    // Sort edges by weight
    Arrays.sort(edges, (a, b) -> a[2] - b[2]);

    int[] parent = new int[n];
    int[] rank = new int[n];
    for (int i = 0; i < n; i++) parent[i] = i;

    int mstWeight = 0;
    int edgesUsed = 0;

    for (int[] edge : edges) {
        int u = edge[0], v = edge[1], w = edge[2];

        int rootU = find(parent, u);
        int rootV = find(parent, v);

        if (rootU != rootV) {
            mstWeight += w;
            edgesUsed++;

            // Union by rank
            if (rank[rootU] < rank[rootV]) {
                parent[rootU] = rootV;
            } else if (rank[rootU] > rank[rootV]) {
                parent[rootV] = rootU;
            } else {
                parent[rootV] = rootU;
                rank[rootU]++;
            }

            if (edgesUsed == n - 1) break;
        }
    }

    return edgesUsed == n - 1 ? mstWeight : -1;  // -1 if not connected
}

private int find(int[] parent, int x) {
    if (parent[x] != x) {
        parent[x] = find(parent, parent[x]);
    }
    return parent[x];
}

// Prim's Algorithm - O(E log V)
public int primMST(int n, List<List<int[]>> graph) {
    boolean[] inMST = new boolean[n];
    // {weight, vertex}
    PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[0] - b[0]);

    pq.offer(new int[]{0, 0});  // Start from vertex 0
    int mstWeight = 0;
    int edgesUsed = 0;

    while (!pq.isEmpty() && edgesUsed < n) {
        int[] curr = pq.poll();
        int w = curr[0], u = curr[1];

        if (inMST[u]) continue;

        inMST[u] = true;
        mstWeight += w;
        edgesUsed++;

        for (int[] edge : graph.get(u)) {
            int v = edge[0], weight = edge[1];
            if (!inMST[v]) {
                pq.offer(new int[]{weight, v});
            }
        }
    }

    return edgesUsed == n ? mstWeight : -1;
}

// Min Cost to Connect All Points
public int minCostConnectPoints(int[][] points) {
    int n = points.length;
    // Build complete graph with Manhattan distances
    List<int[]> edges = new ArrayList<>();

    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            int dist = Math.abs(points[i][0] - points[j][0]) +
                       Math.abs(points[i][1] - points[j][1]);
            edges.add(new int[]{i, j, dist});
        }
    }

    // Kruskal's
    edges.sort((a, b) -> a[2] - b[2]);
    int[] parent = new int[n];
    for (int i = 0; i < n; i++) parent[i] = i;

    int cost = 0, edgesUsed = 0;

    for (int[] edge : edges) {
        int rootU = find(parent, edge[0]);
        int rootV = find(parent, edge[1]);

        if (rootU != rootV) {
            parent[rootU] = rootV;
            cost += edge[2];
            edgesUsed++;
            if (edgesUsed == n - 1) break;
        }
    }

    return cost;
}`,
      python: `# Kruskal's Algorithm
def kruskal_mst(n, edges):
    edges.sort(key=lambda x: x[2])

    parent = list(range(n))

    def find(x):
        if parent[x] != x:
            parent[x] = find(parent[x])
        return parent[x]

    mst_weight = 0
    edges_used = 0

    for u, v, w in edges:
        root_u, root_v = find(u), find(v)

        if root_u != root_v:
            parent[root_u] = root_v
            mst_weight += w
            edges_used += 1

            if edges_used == n - 1:
                break

    return mst_weight if edges_used == n - 1 else -1

# Prim's Algorithm
import heapq

def prim_mst(n, graph):
    in_mst = [False] * n
    pq = [(0, 0)]  # (weight, vertex)
    mst_weight = 0
    edges_used = 0

    while pq and edges_used < n:
        w, u = heapq.heappop(pq)

        if in_mst[u]:
            continue

        in_mst[u] = True
        mst_weight += w
        edges_used += 1

        for v, weight in graph[u]:
            if not in_mst[v]:
                heapq.heappush(pq, (weight, v))

    return mst_weight if edges_used == n else -1

# Min Cost to Connect Points
def minCostConnectPoints(points):
    n = len(points)
    edges = []

    for i in range(n):
        for j in range(i + 1, n):
            dist = abs(points[i][0] - points[j][0]) + abs(points[i][1] - points[j][1])
            edges.append((dist, i, j))

    edges.sort()
    parent = list(range(n))

    def find(x):
        if parent[x] != x:
            parent[x] = find(parent[x])
        return parent[x]

    cost = 0
    for w, u, v in edges:
        root_u, root_v = find(u), find(v)
        if root_u != root_v:
            parent[root_u] = root_v
            cost += w

    return cost`,
      cpp: `int kruskalMST(int n, std::vector<std::vector<int>>& edges) {
    std::sort(edges.begin(), edges.end(),
              [](auto& a, auto& b) { return a[2] < b[2]; });

    std::vector<int> parent(n);
    std::iota(parent.begin(), parent.end(), 0);

    std::function<int(int)> find = [&](int x) {
        return parent[x] == x ? x : parent[x] = find(parent[x]);
    };

    int mstWeight = 0, edgesUsed = 0;

    for (auto& edge : edges) {
        int rootU = find(edge[0]);
        int rootV = find(edge[1]);

        if (rootU != rootV) {
            parent[rootU] = rootV;
            mstWeight += edge[2];
            if (++edgesUsed == n - 1) break;
        }
    }

    return edgesUsed == n - 1 ? mstWeight : -1;
}`,
      javascript: `// Kruskal's Algorithm
function kruskalMST(n, edges) {
  edges.sort((a, b) => a[2] - b[2]);

  const parent = Array.from({ length: n }, (_, i) => i);

  function find(x) {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  }

  let mstWeight = 0, edgesUsed = 0;

  for (const [u, v, w] of edges) {
    const rootU = find(u), rootV = find(v);

    if (rootU !== rootV) {
      parent[rootU] = rootV;
      mstWeight += w;
      if (++edgesUsed === n - 1) break;
    }
  }

  return edgesUsed === n - 1 ? mstWeight : -1;
}`,
    },
    keyPoints: [
      "MST has exactly n-1 edges for n vertices",
      "Kruskal: sort edges, use Union-Find, O(E log E)",
      "Prim: grow from start using min-heap, O(E log V)",
      "Kruskal better for sparse graphs, Prim for dense",
      "Stop early once n-1 edges are used",
    ],
    commonMistakes: [
      "Not checking if graph is connected (return -1)",
      "Forgetting path compression in Union-Find",
      "Prim: not skipping already-in-MST vertices",
      "Using wrong comparison in sort",
    ],
    relatedProblems: [
      "Min Cost to Connect All Points",
      "Connecting Cities With Minimum Cost",
      "Find Critical and Pseudo-Critical Edges",
    ],
    relatedPatterns: ["graphs", "union-find"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "string-hashing",
    name: "String Hashing (Rabin-Karp)",
    slug: "string-hashing",
    category: "String & Character",
    description:
      "String hashing converts strings to numbers for fast comparison. Rabin-Karp uses rolling hashes for pattern matching. Useful for substring problems and duplicate detection.",
    timeComplexity: "O(n) build, O(1) query",
    spaceComplexity: "O(n)",
    whenToUse: [
      "Pattern matching with multiple patterns",
      "Finding duplicate substrings",
      "Longest duplicate substring",
      "Comparing substrings quickly",
    ],
    codeSnippets: {
      java: `// Rabin-Karp Pattern Matching
public int rabinKarp(String text, String pattern) {
    int n = text.length(), m = pattern.length();
    if (m > n) return -1;

    long BASE = 26;
    long MOD = 1_000_000_007;

    // Calculate hash of pattern and first window
    long patternHash = 0, windowHash = 0;
    long power = 1;

    for (int i = 0; i < m; i++) {
        patternHash = (patternHash * BASE + pattern.charAt(i)) % MOD;
        windowHash = (windowHash * BASE + text.charAt(i)) % MOD;
        if (i < m - 1) power = (power * BASE) % MOD;
    }

    // Slide window
    for (int i = 0; i <= n - m; i++) {
        if (patternHash == windowHash) {
            // Verify (hash collision possible)
            if (text.substring(i, i + m).equals(pattern)) {
                return i;
            }
        }

        // Roll hash forward
        if (i < n - m) {
            windowHash = (windowHash - text.charAt(i) * power % MOD + MOD) % MOD;
            windowHash = (windowHash * BASE + text.charAt(i + m)) % MOD;
        }
    }

    return -1;
}

// Find all occurrences
public List<Integer> findAllOccurrences(String text, String pattern) {
    List<Integer> result = new ArrayList<>();
    int n = text.length(), m = pattern.length();

    long BASE = 31;
    long MOD = 1_000_000_007;

    long patternHash = 0, windowHash = 0;
    long power = 1;

    for (int i = 0; i < m; i++) {
        patternHash = (patternHash * BASE + pattern.charAt(i)) % MOD;
        windowHash = (windowHash * BASE + text.charAt(i)) % MOD;
        if (i < m - 1) power = (power * BASE) % MOD;
    }

    for (int i = 0; i <= n - m; i++) {
        if (patternHash == windowHash &&
            text.substring(i, i + m).equals(pattern)) {
            result.add(i);
        }

        if (i < n - m) {
            windowHash = (windowHash - text.charAt(i) * power % MOD + MOD) % MOD;
            windowHash = (windowHash * BASE + text.charAt(i + m)) % MOD;
        }
    }

    return result;
}

// Longest Duplicate Substring (Binary Search + Hashing)
public String longestDupSubstring(String s) {
    int n = s.length();
    int left = 1, right = n - 1;
    String result = "";

    while (left <= right) {
        int mid = left + (right - left) / 2;
        String dup = findDuplicate(s, mid);

        if (dup != null) {
            result = dup;
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    return result;
}

private String findDuplicate(String s, int len) {
    long BASE = 26;
    long MOD = (1L << 32);

    long hash = 0, power = 1;
    for (int i = 0; i < len; i++) {
        hash = (hash * BASE + s.charAt(i)) % MOD;
        if (i < len - 1) power = (power * BASE) % MOD;
    }

    Map<Long, List<Integer>> seen = new HashMap<>();
    seen.computeIfAbsent(hash, k -> new ArrayList<>()).add(0);

    for (int i = 1; i <= s.length() - len; i++) {
        hash = (hash - s.charAt(i - 1) * power % MOD + MOD) % MOD;
        hash = (hash * BASE + s.charAt(i + len - 1)) % MOD;

        if (seen.containsKey(hash)) {
            String current = s.substring(i, i + len);
            for (int j : seen.get(hash)) {
                if (s.substring(j, j + len).equals(current)) {
                    return current;
                }
            }
        }
        seen.computeIfAbsent(hash, k -> new ArrayList<>()).add(i);
    }

    return null;
}`,
      python: `# Rabin-Karp
def rabin_karp(text, pattern):
    n, m = len(text), len(pattern)
    if m > n:
        return -1

    BASE = 26
    MOD = 10**9 + 7

    pattern_hash = window_hash = 0
    power = 1

    for i in range(m):
        pattern_hash = (pattern_hash * BASE + ord(pattern[i])) % MOD
        window_hash = (window_hash * BASE + ord(text[i])) % MOD
        if i < m - 1:
            power = (power * BASE) % MOD

    for i in range(n - m + 1):
        if pattern_hash == window_hash and text[i:i+m] == pattern:
            return i

        if i < n - m:
            window_hash = (window_hash - ord(text[i]) * power) % MOD
            window_hash = (window_hash * BASE + ord(text[i + m])) % MOD

    return -1

# Longest Duplicate Substring
def longestDupSubstring(s):
    n = len(s)

    def find_duplicate(length):
        BASE = 26
        MOD = 2**63 - 1

        h = 0
        power = pow(BASE, length - 1, MOD)

        for i in range(length):
            h = (h * BASE + ord(s[i])) % MOD

        seen = {h: [0]}

        for i in range(1, n - length + 1):
            h = (h - ord(s[i - 1]) * power) % MOD
            h = (h * BASE + ord(s[i + length - 1])) % MOD

            if h in seen:
                for j in seen[h]:
                    if s[j:j + length] == s[i:i + length]:
                        return i
            seen.setdefault(h, []).append(i)

        return -1

    left, right = 1, n - 1
    result = ""

    while left <= right:
        mid = (left + right) // 2
        idx = find_duplicate(mid)

        if idx != -1:
            result = s[idx:idx + mid]
            left = mid + 1
        else:
            right = mid - 1

    return result`,
      cpp: `int rabinKarp(const std::string& text, const std::string& pattern) {
    int n = text.size(), m = pattern.size();
    if (m > n) return -1;

    long long BASE = 26, MOD = 1e9 + 7;
    long long patternHash = 0, windowHash = 0, power = 1;

    for (int i = 0; i < m; i++) {
        patternHash = (patternHash * BASE + pattern[i]) % MOD;
        windowHash = (windowHash * BASE + text[i]) % MOD;
        if (i < m - 1) power = (power * BASE) % MOD;
    }

    for (int i = 0; i <= n - m; i++) {
        if (patternHash == windowHash && text.substr(i, m) == pattern) {
            return i;
        }

        if (i < n - m) {
            windowHash = (windowHash - text[i] * power % MOD + MOD) % MOD;
            windowHash = (windowHash * BASE + text[i + m]) % MOD;
        }
    }

    return -1;
}`,
      javascript: `function rabinKarp(text, pattern) {
  const n = text.length, m = pattern.length;
  if (m > n) return -1;

  const BASE = 26n;
  const MOD = BigInt(1e9 + 7);

  let patternHash = 0n, windowHash = 0n;
  let power = 1n;

  for (let i = 0; i < m; i++) {
    patternHash = (patternHash * BASE + BigInt(pattern.charCodeAt(i))) % MOD;
    windowHash = (windowHash * BASE + BigInt(text.charCodeAt(i))) % MOD;
    if (i < m - 1) power = (power * BASE) % MOD;
  }

  for (let i = 0; i <= n - m; i++) {
    if (patternHash === windowHash && text.slice(i, i + m) === pattern) {
      return i;
    }

    if (i < n - m) {
      windowHash = (windowHash - BigInt(text.charCodeAt(i)) * power % MOD + MOD) % MOD;
      windowHash = (windowHash * BASE + BigInt(text.charCodeAt(i + m))) % MOD;
    }
  }

  return -1;
}`,
    },
    keyPoints: [
      "Rolling hash: remove old char, add new char in O(1)",
      "Always verify on hash match (collisions possible)",
      "Use large prime MOD to reduce collisions",
      "Binary search + hashing for longest duplicate substring",
      "BASE typically 26-31 for lowercase letters",
    ],
    commonMistakes: [
      "Not verifying string equality on hash match",
      "Negative modulo (add MOD before taking mod)",
      "Integer overflow (use long/BigInt)",
      "Wrong power calculation for rolling hash",
    ],
    relatedProblems: [
      "Implement strStr()",
      "Longest Duplicate Substring",
      "Repeated DNA Sequences",
    ],
    relatedPatterns: [],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "binary-search-variations",
    name: "Binary Search Variations",
    slug: "binary-search-variations",
    category: "Algorithm Idioms",
    description:
      "Beyond basic binary search, variations include searching in 2D matrices, finding peak elements, and binary search on answer space for optimization problems.",
    timeComplexity: "O(log n)",
    spaceComplexity: "O(1)",
    whenToUse: [
      "Search in sorted 2D matrix",
      "Find peak element",
      "Search in nearly sorted array",
      "Optimization problems (minimize maximum)",
    ],
    codeSnippets: {
      java: `// Search in 2D Matrix (sorted rows and columns)
public boolean searchMatrix(int[][] matrix, int target) {
    int m = matrix.length, n = matrix[0].length;

    // Start from top-right corner
    int row = 0, col = n - 1;

    while (row < m && col >= 0) {
        if (matrix[row][col] == target) {
            return true;
        } else if (matrix[row][col] < target) {
            row++;  // Eliminate current row
        } else {
            col--;  // Eliminate current column
        }
    }

    return false;
}

// Search in 2D Matrix (each row sorted, first element > last of prev row)
public boolean searchMatrixStrict(int[][] matrix, int target) {
    int m = matrix.length, n = matrix[0].length;

    // Treat as 1D sorted array
    int left = 0, right = m * n - 1;

    while (left <= right) {
        int mid = left + (right - left) / 2;
        int val = matrix[mid / n][mid % n];

        if (val == target) return true;
        else if (val < target) left = mid + 1;
        else right = mid - 1;
    }

    return false;
}

// Find Peak Element
public int findPeakElement(int[] nums) {
    int left = 0, right = nums.length - 1;

    while (left < right) {
        int mid = left + (right - left) / 2;

        if (nums[mid] > nums[mid + 1]) {
            right = mid;  // Peak is on left side (including mid)
        } else {
            left = mid + 1;  // Peak is on right side
        }
    }

    return left;
}

// Find Minimum in Rotated Sorted Array
public int findMin(int[] nums) {
    int left = 0, right = nums.length - 1;

    while (left < right) {
        int mid = left + (right - left) / 2;

        if (nums[mid] > nums[right]) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }

    return nums[left];
}

// Split Array Largest Sum (minimize maximum subarray sum)
public int splitArray(int[] nums, int k) {
    int left = 0, right = 0;

    for (int num : nums) {
        left = Math.max(left, num);   // Min possible: max element
        right += num;                  // Max possible: entire sum
    }

    while (left < right) {
        int mid = left + (right - left) / 2;

        if (canSplit(nums, k, mid)) {
            right = mid;
        } else {
            left = mid + 1;
        }
    }

    return left;
}

private boolean canSplit(int[] nums, int k, int maxSum) {
    int subarrays = 1;
    int currentSum = 0;

    for (int num : nums) {
        if (currentSum + num > maxSum) {
            subarrays++;
            currentSum = num;
        } else {
            currentSum += num;
        }
    }

    return subarrays <= k;
}

// Capacity To Ship Packages Within D Days
public int shipWithinDays(int[] weights, int days) {
    int left = 0, right = 0;

    for (int w : weights) {
        left = Math.max(left, w);
        right += w;
    }

    while (left < right) {
        int mid = left + (right - left) / 2;

        if (canShip(weights, days, mid)) {
            right = mid;
        } else {
            left = mid + 1;
        }
    }

    return left;
}

private boolean canShip(int[] weights, int days, int capacity) {
    int daysNeeded = 1;
    int currentLoad = 0;

    for (int w : weights) {
        if (currentLoad + w > capacity) {
            daysNeeded++;
            currentLoad = w;
        } else {
            currentLoad += w;
        }
    }

    return daysNeeded <= days;
}`,
      python: `# Search in 2D Matrix (top-right start)
def searchMatrix(matrix, target):
    m, n = len(matrix), len(matrix[0])
    row, col = 0, n - 1

    while row < m and col >= 0:
        if matrix[row][col] == target:
            return True
        elif matrix[row][col] < target:
            row += 1
        else:
            col -= 1

    return False

# Find Peak Element
def findPeakElement(nums):
    left, right = 0, len(nums) - 1

    while left < right:
        mid = (left + right) // 2

        if nums[mid] > nums[mid + 1]:
            right = mid
        else:
            left = mid + 1

    return left

# Split Array Largest Sum
def splitArray(nums, k):
    def can_split(max_sum):
        subarrays = 1
        current_sum = 0

        for num in nums:
            if current_sum + num > max_sum:
                subarrays += 1
                current_sum = num
            else:
                current_sum += num

        return subarrays <= k

    left = max(nums)
    right = sum(nums)

    while left < right:
        mid = (left + right) // 2

        if can_split(mid):
            right = mid
        else:
            left = mid + 1

    return left`,
      cpp: `// Search in 2D Matrix
bool searchMatrix(std::vector<std::vector<int>>& matrix, int target) {
    int m = matrix.size(), n = matrix[0].size();
    int row = 0, col = n - 1;

    while (row < m && col >= 0) {
        if (matrix[row][col] == target) return true;
        else if (matrix[row][col] < target) row++;
        else col--;
    }

    return false;
}

// Find Peak Element
int findPeakElement(std::vector<int>& nums) {
    int left = 0, right = nums.size() - 1;

    while (left < right) {
        int mid = left + (right - left) / 2;

        if (nums[mid] > nums[mid + 1]) right = mid;
        else left = mid + 1;
    }

    return left;
}`,
      javascript: `// Search in 2D Matrix
function searchMatrix(matrix, target) {
  const m = matrix.length, n = matrix[0].length;
  let row = 0, col = n - 1;

  while (row < m && col >= 0) {
    if (matrix[row][col] === target) return true;
    else if (matrix[row][col] < target) row++;
    else col--;
  }

  return false;
}

// Find Peak Element
function findPeakElement(nums) {
  let left = 0, right = nums.length - 1;

  while (left < right) {
    const mid = Math.floor((left + right) / 2);

    if (nums[mid] > nums[mid + 1]) right = mid;
    else left = mid + 1;
  }

  return left;
}

// Split Array Largest Sum
function splitArray(nums, k) {
  const canSplit = (maxSum) => {
    let subarrays = 1, currentSum = 0;

    for (const num of nums) {
      if (currentSum + num > maxSum) {
        subarrays++;
        currentSum = num;
      } else {
        currentSum += num;
      }
    }

    return subarrays <= k;
  };

  let left = Math.max(...nums);
  let right = nums.reduce((a, b) => a + b, 0);

  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (canSplit(mid)) right = mid;
    else left = mid + 1;
  }

  return left;
}`,
    },
    keyPoints: [
      "2D matrix: start from corner that eliminates row or column",
      "Peak element: move toward larger neighbor",
      "Binary search on answer: define search space, check feasibility",
      "Minimize maximum: search space is [max element, total sum]",
      "Always think about what to eliminate at each step",
    ],
    commonMistakes: [
      "Wrong corner for 2D search (use top-right or bottom-left)",
      "Peak: comparing mid with mid+1 when using left < right",
      "Binary search on answer: wrong feasibility check",
      "Off-by-one in search space bounds",
    ],
    relatedProblems: [
      "Search a 2D Matrix",
      "Find Peak Element",
      "Split Array Largest Sum",
      "Capacity To Ship Packages",
    ],
    relatedPatterns: ["binary-search"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "deque-operations",
    name: "Deque Operations",
    slug: "deque-operations",
    category: "Data Structures",
    description:
      "A Deque (double-ended queue) allows insertion and deletion at both ends in O(1). It's essential for sliding window maximum/minimum and BFS with 0-1 weights.",
    timeComplexity: "O(1) both ends",
    spaceComplexity: "O(n)",
    whenToUse: [
      "Sliding window maximum/minimum",
      "BFS with 0-1 edge weights (0-1 BFS)",
      "Implementing both stack and queue",
      "Problems requiring access to both ends",
    ],
    codeSnippets: {
      java: `// Deque basics
Deque<Integer> deque = new ArrayDeque<>();

// Add operations
deque.addFirst(1);   // Add to front
deque.addLast(2);    // Add to back
deque.offerFirst(3); // Same, returns boolean
deque.offerLast(4);

// Remove operations
deque.removeFirst(); // Remove from front, throws if empty
deque.removeLast();  // Remove from back
deque.pollFirst();   // Same, returns null if empty
deque.pollLast();

// Peek operations
deque.peekFirst();   // View front
deque.peekLast();    // View back
deque.getFirst();    // Throws if empty
deque.getLast();

// Sliding Window Maximum
public int[] maxSlidingWindow(int[] nums, int k) {
    int n = nums.length;
    int[] result = new int[n - k + 1];
    Deque<Integer> deque = new ArrayDeque<>();  // Store indices

    for (int i = 0; i < n; i++) {
        // Remove indices outside window
        while (!deque.isEmpty() && deque.peekFirst() < i - k + 1) {
            deque.pollFirst();
        }

        // Remove smaller elements (they'll never be max)
        while (!deque.isEmpty() && nums[deque.peekLast()] < nums[i]) {
            deque.pollLast();
        }

        deque.offerLast(i);

        // Add to result once window is complete
        if (i >= k - 1) {
            result[i - k + 1] = nums[deque.peekFirst()];
        }
    }

    return result;
}

// Shortest Subarray with Sum at Least K (can have negative numbers)
public int shortestSubarray(int[] nums, int k) {
    int n = nums.length;
    long[] prefix = new long[n + 1];

    for (int i = 0; i < n; i++) {
        prefix[i + 1] = prefix[i] + nums[i];
    }

    Deque<Integer> deque = new ArrayDeque<>();
    int minLen = Integer.MAX_VALUE;

    for (int i = 0; i <= n; i++) {
        // Check if we found a valid subarray
        while (!deque.isEmpty() && prefix[i] - prefix[deque.peekFirst()] >= k) {
            minLen = Math.min(minLen, i - deque.pollFirst());
        }

        // Maintain increasing prefix sums
        while (!deque.isEmpty() && prefix[i] <= prefix[deque.peekLast()]) {
            deque.pollLast();
        }

        deque.offerLast(i);
    }

    return minLen == Integer.MAX_VALUE ? -1 : minLen;
}

// 0-1 BFS (edges with weight 0 or 1)
public int shortestPath01(int n, List<List<int[]>> graph, int src, int dst) {
    int[] dist = new int[n];
    Arrays.fill(dist, Integer.MAX_VALUE);
    dist[src] = 0;

    Deque<Integer> deque = new ArrayDeque<>();
    deque.offerFirst(src);

    while (!deque.isEmpty()) {
        int u = deque.pollFirst();

        for (int[] edge : graph.get(u)) {
            int v = edge[0], w = edge[1];

            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;

                if (w == 0) {
                    deque.offerFirst(v);  // 0-weight: add to front
                } else {
                    deque.offerLast(v);   // 1-weight: add to back
                }
            }
        }
    }

    return dist[dst] == Integer.MAX_VALUE ? -1 : dist[dst];
}`,
      python: `from collections import deque

# Deque basics
d = deque()
d.append(1)      # Add right
d.appendleft(2)  # Add left
d.pop()          # Remove right
d.popleft()      # Remove left

# With max length (auto-removes from opposite end)
d = deque(maxlen=3)

# Sliding Window Maximum
def maxSlidingWindow(nums, k):
    result = []
    dq = deque()  # Store indices

    for i, num in enumerate(nums):
        # Remove indices outside window
        while dq and dq[0] < i - k + 1:
            dq.popleft()

        # Remove smaller elements
        while dq and nums[dq[-1]] < num:
            dq.pop()

        dq.append(i)

        if i >= k - 1:
            result.append(nums[dq[0]])

    return result

# Shortest Subarray with Sum at Least K
def shortestSubarray(nums, k):
    n = len(nums)
    prefix = [0] * (n + 1)

    for i in range(n):
        prefix[i + 1] = prefix[i] + nums[i]

    dq = deque()
    min_len = float('inf')

    for i in range(n + 1):
        while dq and prefix[i] - prefix[dq[0]] >= k:
            min_len = min(min_len, i - dq.popleft())

        while dq and prefix[i] <= prefix[dq[-1]]:
            dq.pop()

        dq.append(i)

    return min_len if min_len != float('inf') else -1`,
      cpp: `#include <deque>

// Sliding Window Maximum
std::vector<int> maxSlidingWindow(std::vector<int>& nums, int k) {
    std::vector<int> result;
    std::deque<int> dq;

    for (int i = 0; i < nums.size(); i++) {
        while (!dq.empty() && dq.front() < i - k + 1) {
            dq.pop_front();
        }

        while (!dq.empty() && nums[dq.back()] < nums[i]) {
            dq.pop_back();
        }

        dq.push_back(i);

        if (i >= k - 1) {
            result.push_back(nums[dq.front()]);
        }
    }

    return result;
}`,
      javascript: `// Sliding Window Maximum
function maxSlidingWindow(nums, k) {
  const result = [];
  const dq = [];  // Store indices

  for (let i = 0; i < nums.length; i++) {
    // Remove indices outside window
    while (dq.length && dq[0] < i - k + 1) {
      dq.shift();
    }

    // Remove smaller elements
    while (dq.length && nums[dq[dq.length - 1]] < nums[i]) {
      dq.pop();
    }

    dq.push(i);

    if (i >= k - 1) {
      result.push(nums[dq[0]]);
    }
  }

  return result;
}`,
    },
    keyPoints: [
      "Store indices, not values (to check window bounds)",
      "Maintain monotonic property: remove smaller for max, larger for min",
      "Remove from front when outside window",
      "0-1 BFS: 0-weight to front, 1-weight to back",
      "Deque operations are all O(1)",
    ],
    commonMistakes: [
      "Storing values instead of indices",
      "Forgetting to remove elements outside window",
      "Wrong monotonic direction (increasing vs decreasing)",
      "Not waiting until window is complete before recording",
    ],
    relatedProblems: [
      "Sliding Window Maximum",
      "Shortest Subarray with Sum at Least K",
      "Constrained Subsequence Sum",
    ],
    relatedPatterns: ["sliding-window", "stack"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "tree-diameter-paths",
    name: "Tree Diameter and Paths",
    slug: "tree-diameter-paths",
    category: "Data Structures",
    description:
      "The diameter of a tree is the longest path between any two nodes. Finding it involves understanding that the longest path through a node uses the two deepest subtrees.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(h)",
    whenToUse: [
      "Finding longest path in tree",
      "Maximum path sum in binary tree",
      "Finding tree center",
      "Network routing problems",
    ],
    codeSnippets: {
      java: `// Binary Tree Diameter
int diameter;

public int diameterOfBinaryTree(TreeNode root) {
    diameter = 0;
    depth(root);
    return diameter;
}

private int depth(TreeNode node) {
    if (node == null) return 0;

    int left = depth(node.left);
    int right = depth(node.right);

    // Update diameter (path through this node)
    diameter = Math.max(diameter, left + right);

    // Return depth of this subtree
    return 1 + Math.max(left, right);
}

// Binary Tree Maximum Path Sum (can be negative)
int maxSum;

public int maxPathSum(TreeNode root) {
    maxSum = Integer.MIN_VALUE;
    maxGain(root);
    return maxSum;
}

private int maxGain(TreeNode node) {
    if (node == null) return 0;

    // Only take positive gains
    int left = Math.max(0, maxGain(node.left));
    int right = Math.max(0, maxGain(node.right));

    // Update max sum (path through this node)
    maxSum = Math.max(maxSum, node.val + left + right);

    // Return max gain from this subtree
    return node.val + Math.max(left, right);
}

// N-ary Tree / Graph Diameter (two BFS)
public int treeDiameter(int n, int[][] edges) {
    if (n == 1) return 0;

    // Build adjacency list
    List<List<Integer>> graph = new ArrayList<>();
    for (int i = 0; i < n; i++) graph.add(new ArrayList<>());
    for (int[] edge : edges) {
        graph.get(edge[0]).add(edge[1]);
        graph.get(edge[1]).add(edge[0]);
    }

    // BFS from node 0 to find farthest node
    int[] first = bfs(graph, 0);
    int farthestNode = first[0];

    // BFS from farthest to find diameter
    int[] second = bfs(graph, farthestNode);

    return second[1];  // Distance = diameter
}

private int[] bfs(List<List<Integer>> graph, int start) {
    int n = graph.size();
    int[] dist = new int[n];
    Arrays.fill(dist, -1);
    dist[start] = 0;

    Queue<Integer> queue = new LinkedList<>();
    queue.offer(start);

    int farthest = start, maxDist = 0;

    while (!queue.isEmpty()) {
        int node = queue.poll();

        if (dist[node] > maxDist) {
            maxDist = dist[node];
            farthest = node;
        }

        for (int neighbor : graph.get(node)) {
            if (dist[neighbor] == -1) {
                dist[neighbor] = dist[node] + 1;
                queue.offer(neighbor);
            }
        }
    }

    return new int[]{farthest, maxDist};
}

// Longest Path in DAG (topological sort)
public int longestPathDAG(int n, int[][] edges) {
    List<List<int[]>> graph = new ArrayList<>();
    int[] inDegree = new int[n];

    for (int i = 0; i < n; i++) graph.add(new ArrayList<>());

    for (int[] edge : edges) {
        graph.get(edge[0]).add(new int[]{edge[1], edge[2]});
        inDegree[edge[1]]++;
    }

    int[] dist = new int[n];
    Arrays.fill(dist, Integer.MIN_VALUE);

    Queue<Integer> queue = new LinkedList<>();
    for (int i = 0; i < n; i++) {
        if (inDegree[i] == 0) {
            queue.offer(i);
            dist[i] = 0;
        }
    }

    while (!queue.isEmpty()) {
        int u = queue.poll();

        for (int[] edge : graph.get(u)) {
            int v = edge[0], w = edge[1];
            dist[v] = Math.max(dist[v], dist[u] + w);

            if (--inDegree[v] == 0) {
                queue.offer(v);
            }
        }
    }

    int maxDist = 0;
    for (int d : dist) {
        if (d != Integer.MIN_VALUE) {
            maxDist = Math.max(maxDist, d);
        }
    }

    return maxDist;
}`,
      python: `# Binary Tree Diameter
def diameterOfBinaryTree(root):
    diameter = [0]

    def depth(node):
        if not node:
            return 0

        left = depth(node.left)
        right = depth(node.right)

        diameter[0] = max(diameter[0], left + right)

        return 1 + max(left, right)

    depth(root)
    return diameter[0]

# Binary Tree Maximum Path Sum
def maxPathSum(root):
    max_sum = [float('-inf')]

    def max_gain(node):
        if not node:
            return 0

        left = max(0, max_gain(node.left))
        right = max(0, max_gain(node.right))

        max_sum[0] = max(max_sum[0], node.val + left + right)

        return node.val + max(left, right)

    max_gain(root)
    return max_sum[0]

# Tree Diameter (two BFS)
from collections import deque

def treeDiameter(n, edges):
    if n == 1:
        return 0

    graph = [[] for _ in range(n)]
    for u, v in edges:
        graph[u].append(v)
        graph[v].append(u)

    def bfs(start):
        dist = [-1] * n
        dist[start] = 0
        queue = deque([start])
        farthest = start

        while queue:
            node = queue.popleft()
            if dist[node] > dist[farthest]:
                farthest = node

            for neighbor in graph[node]:
                if dist[neighbor] == -1:
                    dist[neighbor] = dist[node] + 1
                    queue.append(neighbor)

        return farthest, dist[farthest]

    farthest, _ = bfs(0)
    _, diameter = bfs(farthest)

    return diameter`,
      cpp: `int diameter;

int depth(TreeNode* node) {
    if (!node) return 0;

    int left = depth(node->left);
    int right = depth(node->right);

    diameter = std::max(diameter, left + right);

    return 1 + std::max(left, right);
}

int diameterOfBinaryTree(TreeNode* root) {
    diameter = 0;
    depth(root);
    return diameter;
}`,
      javascript: `// Binary Tree Diameter
function diameterOfBinaryTree(root) {
  let diameter = 0;

  function depth(node) {
    if (!node) return 0;

    const left = depth(node.left);
    const right = depth(node.right);

    diameter = Math.max(diameter, left + right);

    return 1 + Math.max(left, right);
  }

  depth(root);
  return diameter;
}

// Binary Tree Maximum Path Sum
function maxPathSum(root) {
  let maxSum = -Infinity;

  function maxGain(node) {
    if (!node) return 0;

    const left = Math.max(0, maxGain(node.left));
    const right = Math.max(0, maxGain(node.right));

    maxSum = Math.max(maxSum, node.val + left + right);

    return node.val + Math.max(left, right);
  }

  maxGain(root);
  return maxSum;
}`,
    },
    keyPoints: [
      "Diameter through node = left depth + right depth",
      "Return depth to parent, update diameter globally",
      "Max path sum: only take positive contributions",
      "General tree diameter: two BFS (find farthest, then farthest from that)",
      "DAG longest path: topological sort with DP",
    ],
    commonMistakes: [
      "Returning diameter instead of depth from recursion",
      "Not handling negative values in max path sum",
      "Confusing edges vs nodes in diameter count",
      "General tree: forgetting it's undirected",
    ],
    relatedProblems: [
      "Diameter of Binary Tree",
      "Binary Tree Maximum Path Sum",
      "Longest Path With Different Adjacent Characters",
    ],
    relatedPatterns: ["trees"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "subsets-combinations-generation",
    name: "Subsets and Combinations Generation",
    slug: "subsets-combinations-generation",
    category: "Algorithm Idioms",
    description:
      "Generating all subsets, combinations, and permutations are fundamental backtracking problems. Understanding the patterns helps solve many enumeration problems.",
    timeComplexity: "O(2^n) or O(n!)",
    spaceComplexity: "O(n)",
    whenToUse: [
      "Generate all subsets (power set)",
      "Generate combinations of size k",
      "Handle duplicates in input",
      "Letter combinations, phone number digits",
    ],
    codeSnippets: {
      java: `// Subsets (no duplicates)
public List<List<Integer>> subsets(int[] nums) {
    List<List<Integer>> result = new ArrayList<>();
    backtrack(nums, 0, new ArrayList<>(), result);
    return result;
}

private void backtrack(int[] nums, int start, List<Integer> current,
                       List<List<Integer>> result) {
    result.add(new ArrayList<>(current));

    for (int i = start; i < nums.length; i++) {
        current.add(nums[i]);
        backtrack(nums, i + 1, current, result);
        current.remove(current.size() - 1);
    }
}

// Subsets with Duplicates
public List<List<Integer>> subsetsWithDup(int[] nums) {
    Arrays.sort(nums);  // Sort to group duplicates
    List<List<Integer>> result = new ArrayList<>();
    backtrackDup(nums, 0, new ArrayList<>(), result);
    return result;
}

private void backtrackDup(int[] nums, int start, List<Integer> current,
                          List<List<Integer>> result) {
    result.add(new ArrayList<>(current));

    for (int i = start; i < nums.length; i++) {
        // Skip duplicates at same level
        if (i > start && nums[i] == nums[i - 1]) continue;

        current.add(nums[i]);
        backtrackDup(nums, i + 1, current, result);
        current.remove(current.size() - 1);
    }
}

// Combinations (n choose k)
public List<List<Integer>> combine(int n, int k) {
    List<List<Integer>> result = new ArrayList<>();
    backtrackCombine(n, k, 1, new ArrayList<>(), result);
    return result;
}

private void backtrackCombine(int n, int k, int start, List<Integer> current,
                              List<List<Integer>> result) {
    if (current.size() == k) {
        result.add(new ArrayList<>(current));
        return;
    }

    // Pruning: need k - current.size() more elements
    for (int i = start; i <= n - (k - current.size()) + 1; i++) {
        current.add(i);
        backtrackCombine(n, k, i + 1, current, result);
        current.remove(current.size() - 1);
    }
}

// Combination Sum (can reuse, no duplicates in input)
public List<List<Integer>> combinationSum(int[] candidates, int target) {
    List<List<Integer>> result = new ArrayList<>();
    backtrackSum(candidates, target, 0, new ArrayList<>(), result);
    return result;
}

private void backtrackSum(int[] candidates, int remaining, int start,
                          List<Integer> current, List<List<Integer>> result) {
    if (remaining == 0) {
        result.add(new ArrayList<>(current));
        return;
    }
    if (remaining < 0) return;

    for (int i = start; i < candidates.length; i++) {
        current.add(candidates[i]);
        backtrackSum(candidates, remaining - candidates[i], i, current, result);  // i, not i+1
        current.remove(current.size() - 1);
    }
}

// Combination Sum II (each number used once, has duplicates)
public List<List<Integer>> combinationSum2(int[] candidates, int target) {
    Arrays.sort(candidates);
    List<List<Integer>> result = new ArrayList<>();
    backtrackSum2(candidates, target, 0, new ArrayList<>(), result);
    return result;
}

private void backtrackSum2(int[] candidates, int remaining, int start,
                           List<Integer> current, List<List<Integer>> result) {
    if (remaining == 0) {
        result.add(new ArrayList<>(current));
        return;
    }

    for (int i = start; i < candidates.length; i++) {
        if (candidates[i] > remaining) break;  // Pruning
        if (i > start && candidates[i] == candidates[i - 1]) continue;  // Skip dups

        current.add(candidates[i]);
        backtrackSum2(candidates, remaining - candidates[i], i + 1, current, result);
        current.remove(current.size() - 1);
    }
}

// Letter Combinations of Phone Number
public List<String> letterCombinations(String digits) {
    if (digits.isEmpty()) return new ArrayList<>();

    String[] mapping = {"", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"};
    List<String> result = new ArrayList<>();
    backtrackLetters(digits, 0, new StringBuilder(), mapping, result);
    return result;
}

private void backtrackLetters(String digits, int index, StringBuilder current,
                              String[] mapping, List<String> result) {
    if (index == digits.length()) {
        result.add(current.toString());
        return;
    }

    String letters = mapping[digits.charAt(index) - '0'];
    for (char c : letters.toCharArray()) {
        current.append(c);
        backtrackLetters(digits, index + 1, current, mapping, result);
        current.deleteCharAt(current.length() - 1);
    }
}`,
      python: `# Subsets
def subsets(nums):
    result = []

    def backtrack(start, current):
        result.append(current[:])

        for i in range(start, len(nums)):
            current.append(nums[i])
            backtrack(i + 1, current)
            current.pop()

    backtrack(0, [])
    return result

# Subsets with Duplicates
def subsetsWithDup(nums):
    nums.sort()
    result = []

    def backtrack(start, current):
        result.append(current[:])

        for i in range(start, len(nums)):
            if i > start and nums[i] == nums[i - 1]:
                continue
            current.append(nums[i])
            backtrack(i + 1, current)
            current.pop()

    backtrack(0, [])
    return result

# Combinations
def combine(n, k):
    result = []

    def backtrack(start, current):
        if len(current) == k:
            result.append(current[:])
            return

        for i in range(start, n - (k - len(current)) + 2):
            current.append(i)
            backtrack(i + 1, current)
            current.pop()

    backtrack(1, [])
    return result

# Combination Sum
def combinationSum(candidates, target):
    result = []

    def backtrack(start, remaining, current):
        if remaining == 0:
            result.append(current[:])
            return
        if remaining < 0:
            return

        for i in range(start, len(candidates)):
            current.append(candidates[i])
            backtrack(i, remaining - candidates[i], current)
            current.pop()

    backtrack(0, target, [])
    return result

# Letter Combinations
def letterCombinations(digits):
    if not digits:
        return []

    mapping = ["", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"]
    result = []

    def backtrack(index, current):
        if index == len(digits):
            result.append(''.join(current))
            return

        for c in mapping[int(digits[index])]:
            current.append(c)
            backtrack(index + 1, current)
            current.pop()

    backtrack(0, [])
    return result`,
      cpp: `std::vector<std::vector<int>> subsets(std::vector<int>& nums) {
    std::vector<std::vector<int>> result;
    std::vector<int> current;

    std::function<void(int)> backtrack = [&](int start) {
        result.push_back(current);

        for (int i = start; i < nums.size(); i++) {
            current.push_back(nums[i]);
            backtrack(i + 1);
            current.pop_back();
        }
    };

    backtrack(0);
    return result;
}`,
      javascript: `// Subsets
function subsets(nums) {
  const result = [];

  function backtrack(start, current) {
    result.push([...current]);

    for (let i = start; i < nums.length; i++) {
      current.push(nums[i]);
      backtrack(i + 1, current);
      current.pop();
    }
  }

  backtrack(0, []);
  return result;
}

// Subsets with Duplicates
function subsetsWithDup(nums) {
  nums.sort((a, b) => a - b);
  const result = [];

  function backtrack(start, current) {
    result.push([...current]);

    for (let i = start; i < nums.length; i++) {
      if (i > start && nums[i] === nums[i - 1]) continue;
      current.push(nums[i]);
      backtrack(i + 1, current);
      current.pop();
    }
  }

  backtrack(0, []);
  return result;
}`,
    },
    keyPoints: [
      "Subsets: add current state at start of each call",
      "Combinations: add only when size == k",
      "Duplicates: sort first, skip if nums[i] == nums[i-1] && i > start",
      "Can reuse: pass i (not i+1) in recursive call",
      "Prune: stop early if remaining elements can't satisfy requirement",
    ],
    commonMistakes: [
      "Forgetting to add copy (current[:] or new ArrayList<>(current))",
      "Wrong duplicate skip condition (i > start, not i > 0)",
      "Combination sum: passing i+1 when reuse is allowed",
      "Not sorting before handling duplicates",
    ],
    relatedProblems: [
      "Subsets",
      "Subsets II",
      "Combinations",
      "Combination Sum",
      "Combination Sum II",
      "Letter Combinations of Phone Number",
    ],
    relatedPatterns: ["backtracking"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "clone-problems",
    name: "Clone and Copy Problems",
    slug: "clone-problems",
    category: "Data Structures",
    description:
      "Cloning complex data structures like graphs and linked lists with random pointers requires careful handling to maintain relationships between nodes.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    whenToUse: [
      "Clone Graph",
      "Copy List with Random Pointer",
      "Deep copy of nested structures",
      "Maintaining node mappings",
    ],
    codeSnippets: {
      java: `// Clone Graph (BFS)
public Node cloneGraph(Node node) {
    if (node == null) return null;

    Map<Node, Node> visited = new HashMap<>();
    Queue<Node> queue = new LinkedList<>();

    queue.offer(node);
    visited.put(node, new Node(node.val));

    while (!queue.isEmpty()) {
        Node curr = queue.poll();

        for (Node neighbor : curr.neighbors) {
            if (!visited.containsKey(neighbor)) {
                visited.put(neighbor, new Node(neighbor.val));
                queue.offer(neighbor);
            }
            visited.get(curr).neighbors.add(visited.get(neighbor));
        }
    }

    return visited.get(node);
}

// Clone Graph (DFS)
public Node cloneGraphDFS(Node node) {
    if (node == null) return null;

    Map<Node, Node> visited = new HashMap<>();
    return dfsClone(node, visited);
}

private Node dfsClone(Node node, Map<Node, Node> visited) {
    if (visited.containsKey(node)) {
        return visited.get(node);
    }

    Node clone = new Node(node.val);
    visited.put(node, clone);

    for (Node neighbor : node.neighbors) {
        clone.neighbors.add(dfsClone(neighbor, visited));
    }

    return clone;
}

// Copy List with Random Pointer (HashMap)
public Node copyRandomList(Node head) {
    if (head == null) return null;

    Map<Node, Node> map = new HashMap<>();

    // First pass: create all nodes
    Node curr = head;
    while (curr != null) {
        map.put(curr, new Node(curr.val));
        curr = curr.next;
    }

    // Second pass: set next and random pointers
    curr = head;
    while (curr != null) {
        map.get(curr).next = map.get(curr.next);
        map.get(curr).random = map.get(curr.random);
        curr = curr.next;
    }

    return map.get(head);
}

// Copy List with Random Pointer (O(1) space - interleaving)
public Node copyRandomListO1(Node head) {
    if (head == null) return null;

    // Step 1: Interleave - insert copy after each original
    Node curr = head;
    while (curr != null) {
        Node copy = new Node(curr.val);
        copy.next = curr.next;
        curr.next = copy;
        curr = copy.next;
    }

    // Step 2: Set random pointers
    curr = head;
    while (curr != null) {
        if (curr.random != null) {
            curr.next.random = curr.random.next;
        }
        curr = curr.next.next;
    }

    // Step 3: Separate lists
    Node dummy = new Node(0);
    Node copyCurr = dummy;
    curr = head;

    while (curr != null) {
        copyCurr.next = curr.next;
        curr.next = curr.next.next;
        curr = curr.next;
        copyCurr = copyCurr.next;
    }

    return dummy.next;
}`,
      python: `# Clone Graph (DFS)
def cloneGraph(node):
    if not node:
        return None

    visited = {}

    def dfs(node):
        if node in visited:
            return visited[node]

        clone = Node(node.val)
        visited[node] = clone

        for neighbor in node.neighbors:
            clone.neighbors.append(dfs(neighbor))

        return clone

    return dfs(node)

# Clone Graph (BFS)
from collections import deque

def cloneGraphBFS(node):
    if not node:
        return None

    visited = {node: Node(node.val)}
    queue = deque([node])

    while queue:
        curr = queue.popleft()

        for neighbor in curr.neighbors:
            if neighbor not in visited:
                visited[neighbor] = Node(neighbor.val)
                queue.append(neighbor)
            visited[curr].neighbors.append(visited[neighbor])

    return visited[node]

# Copy List with Random Pointer
def copyRandomList(head):
    if not head:
        return None

    # Create mapping
    old_to_new = {}
    curr = head

    while curr:
        old_to_new[curr] = Node(curr.val)
        curr = curr.next

    # Set pointers
    curr = head
    while curr:
        old_to_new[curr].next = old_to_new.get(curr.next)
        old_to_new[curr].random = old_to_new.get(curr.random)
        curr = curr.next

    return old_to_new[head]`,
      cpp: `Node* cloneGraph(Node* node) {
    if (!node) return nullptr;

    std::unordered_map<Node*, Node*> visited;

    std::function<Node*(Node*)> dfs = [&](Node* n) -> Node* {
        if (visited.count(n)) return visited[n];

        Node* clone = new Node(n->val);
        visited[n] = clone;

        for (Node* neighbor : n->neighbors) {
            clone->neighbors.push_back(dfs(neighbor));
        }

        return clone;
    };

    return dfs(node);
}`,
      javascript: `// Clone Graph (DFS)
function cloneGraph(node) {
  if (!node) return null;

  const visited = new Map();

  function dfs(node) {
    if (visited.has(node)) return visited.get(node);

    const clone = new Node(node.val);
    visited.set(node, clone);

    for (const neighbor of node.neighbors) {
      clone.neighbors.push(dfs(neighbor));
    }

    return clone;
  }

  return dfs(node);
}

// Copy List with Random Pointer
function copyRandomList(head) {
  if (!head) return null;

  const map = new Map();

  let curr = head;
  while (curr) {
    map.set(curr, new Node(curr.val));
    curr = curr.next;
  }

  curr = head;
  while (curr) {
    map.get(curr).next = map.get(curr.next) || null;
    map.get(curr).random = map.get(curr.random) || null;
    curr = curr.next;
  }

  return map.get(head);
}`,
    },
    keyPoints: [
      "Use HashMap: old node → new node mapping",
      "Clone graph: create node when first visited, then add neighbors",
      "Random pointer: two passes - create nodes, then set pointers",
      "O(1) space: interleave technique for linked list",
      "Always handle null input",
    ],
    commonMistakes: [
      "Creating duplicate nodes (not checking visited)",
      "Not handling null pointers (next, random, neighbors)",
      "Circular reference infinite loop (must track visited)",
      "Interleave: forgetting to restore original list",
    ],
    relatedProblems: [
      "Clone Graph",
      "Copy List with Random Pointer",
      "Clone N-ary Tree",
      "Clone Binary Tree With Random Pointer",
    ],
    relatedPatterns: ["graphs", "linked-list"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];

export const conceptCategories: string[] = [
  "Data Structures",
  "Collections & Maps",
  "Arrays & Sorting",
  "String & Character",
  "Type Conversions & Math",
  "Arithmetic Patterns",
  "Java Fundamentals",
  "Algorithm Idioms",
];

export const getConceptBySlug = (slug: string): Concept | undefined =>
  concepts.find((c) => c.slug === slug);

export const getConceptsByCategory = (category: string): Concept[] =>
  concepts.filter((c) => c.category === category);
