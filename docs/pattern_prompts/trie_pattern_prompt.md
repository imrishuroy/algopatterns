# Trie Pattern Improvement Prompt (FAANG-Ready Edition)

Use this prompt to rewrite the entire Trie pattern to match the quality of the DP pattern and Heap pattern.

---

# Implementation Notes

## Target Problems (Must Solve)

The Trie pattern must enable solving these core problems from interviews:

| Problem | LeetCode # | Difficulty | Companies |
|---------|-----------|------------|-----------|
| Implement Trie (Prefix Tree) | 208 | Medium | All FAANG |
| Design Add and Search Words Data Structure | 211 | Medium | Facebook, Amazon |
| Word Search II | 212 | Hard | Google, Amazon, Facebook |

## Current State Analysis

### What the Trie Pattern Has

| Aspect | Status | Details |
|--------|--------|---------|
| Tutorial sections | 14 | Good coverage of basics |
| Variations | 3 | Basic Trie, Wildcard, Word Search II |
| Common problems | 4 | Core problems listed |
| Key insights | 5 | Good fundamentals |
| Common mistakes | 3 | Needs expansion |
| ASCII diagrams | 5/14 sections | Could add more |
| Tables | 3/14 sections | Needs expansion |
| Visualizers linked | **0** | **CRITICAL GAP** |
| Code format | Correct (`code` not `approaches`) | Good |

### Critical Gaps

| Requirement | Current State | Action Needed |
|-------------|---------------|---------------|
| Learning objectives | Missing | Add "What You'll Learn" to Section 1 |
| Input constraint mapping | Missing | Add constraint table |
| Checkpoint questions | Missing | Add after key concepts |
| Follow-up questions | Missing | Add for each problem |
| Edge case checklist | Partial | Expand and formalize |
| Interview communication | Missing | Add UMPIRE scripts |
| Pattern comparison | Has (Section 12) | Could expand |
| Complexity derivations | Partial | Add formal proofs |
| Difficulty progression | Missing | Order problems Easy -> Hard |
| Dry-run trace tables | Partial | Formalize into tables |
| Visualizer integration | None linked | Link existing visualizers |
| Go code | Missing | Add Go implementations |

---

# Improve the Trie Pattern to FAANG Interview Standards

## Target Audience
- Software engineers preparing for FAANG (Meta, Amazon, Apple, Netflix, Google) interviews
- Engineers targeting top tech companies (Microsoft, Uber, Airbnb, LinkedIn, etc.)
- Competitive programmers preparing for contests
- Anyone wanting to master Trie at an expert level

## Quality Standard
The DP pattern and Heap pattern are the quality benchmark. The Trie pattern should:
1. Build intuition before algorithms
2. Explain every "why" with simple examples
3. Use extensive visualizations (decision trees, state diagrams)
4. Cover ALL common FAANG Trie problem types
5. Include templates for each sub-pattern
6. Provide interview-ready communication scripts

---

# What is a Trie?

## The Core Idea

A Trie (from re**trie**val, pronounced "try") is a tree-like data structure optimized for string prefix operations. Each node represents a character, and paths from root to nodes represent prefixes.

**Think of it like a phone book index:**
```
Looking up "Smith":
  S section → Sm section → Smi → Smit → Smith
  
At each step, you've eliminated all names that don't match the prefix so far.
```

## Visual Structure

```
         (root)
        /   |   \
       a    b    c
      /|\    \    \
     p n t    a    a
    /|  |     |    |
   p e  *     d    t*
  /|         /|
 l e*       *  s
 |
 e*

Words: "apple", "ape", "ant", "bad", "bads", "cat"
* = isEnd marker (complete word exists here)
```

## Key Properties

1. **Root is empty** - represents the empty prefix ""
2. **Each edge is a character** - traversing an edge appends that character
3. **Path from root = prefix** - any path represents a string prefix
4. **isEnd flag marks complete words** - distinguishes "app" (prefix only) from "app" (actual word)
5. **Shared prefixes share nodes** - "apple" and "application" share "appl"

---

# Input Constraint Analysis for Trie

## When Trie Techniques Are Feasible

| Input Size | Max Complexity | Trie Feasible? | Notes |
|------------|----------------|----------------|-------|
| N words, L max length | O(N * L) | Yes | Building Trie |
| N words, 10^5 total chars | O(total chars) | Yes | Space = O(total chars) |
| Single word queries | O(L) | Yes | Search/insert is O(L) |
| N queries | O(N * L) | Yes | Each query O(L) |
| Grid M*N, K words | O(M*N*4^L + K*L) | Check L | L > 10 may TLE |

## Constraint Signals for Trie Problems

| Constraint | Likely Approach |
|------------|-----------------|
| "prefix search", "startsWith" | Basic Trie |
| "autocomplete", "suggestions" | Trie + DFS |
| "wildcard", "." matches any | Trie + recursive DFS |
| "find words in grid" | Trie + Backtracking |
| "longest common prefix" | Trie traversal |
| "word dictionary" | Trie insert/search |

---

# The 6 Trie Sub-Patterns

## 1. Basic Trie (Implement Trie - LC 208)

**When to use:** Prefix-based dictionary operations

**Key Insight:** Each path from root represents a prefix. `isEnd` distinguishes complete words from prefixes.

**Template:**
```
insert(word):
    node = root
    for char in word:
        if char not in node.children:
            node.children[char] = new TrieNode()
        node = node.children[char]
    node.isEnd = true

search(word):
    node = findNode(word)
    return node != null AND node.isEnd

startsWith(prefix):
    return findNode(prefix) != null

findNode(s):
    node = root
    for char in s:
        if char not in node.children: return null
        node = node.children[char]
    return node
```

**Time:** O(L) per operation where L = word length
**Space:** O(N * L) where N = words, L = avg length

**Problems:**
- Implement Trie (LC 208)
- Search Suggestions System (LC 1268)
- Longest Word in Dictionary (LC 720)

### Complete Runnable Code

**Go:**
```go
package main

import "fmt"

type TrieNode struct {
    children [26]*TrieNode
    isEnd    bool
}

type Trie struct {
    root *TrieNode
}

func Constructor() Trie {
    return Trie{root: &TrieNode{}}
}

func (t *Trie) Insert(word string) {
    node := t.root
    for _, c := range word {
        idx := c - 'a'
        if node.children[idx] == nil {
            node.children[idx] = &TrieNode{}
        }
        node = node.children[idx]
    }
    node.isEnd = true
}

func (t *Trie) Search(word string) bool {
    node := t.findNode(word)
    return node != nil && node.isEnd
}

func (t *Trie) StartsWith(prefix string) bool {
    return t.findNode(prefix) != nil
}

func (t *Trie) findNode(s string) *TrieNode {
    node := t.root
    for _, c := range s {
        idx := c - 'a'
        if node.children[idx] == nil {
            return nil
        }
        node = node.children[idx]
    }
    return node
}

func main() {
    trie := Constructor()
    trie.Insert("apple")
    fmt.Println(trie.Search("apple"))   // true
    fmt.Println(trie.Search("app"))     // false
    fmt.Println(trie.StartsWith("app")) // true
    trie.Insert("app")
    fmt.Println(trie.Search("app"))     // true
}
```

**Java:**
```java
class Trie {
    private TrieNode root;
    
    class TrieNode {
        TrieNode[] children = new TrieNode[26];
        boolean isEnd = false;
    }
    
    public Trie() {
        root = new TrieNode();
    }
    
    public void insert(String word) {
        TrieNode node = root;
        for (char c : word.toCharArray()) {
            int idx = c - 'a';
            if (node.children[idx] == null) {
                node.children[idx] = new TrieNode();
            }
            node = node.children[idx];
        }
        node.isEnd = true;
    }
    
    public boolean search(String word) {
        TrieNode node = findNode(word);
        return node != null && node.isEnd;
    }
    
    public boolean startsWith(String prefix) {
        return findNode(prefix) != null;
    }
    
    private TrieNode findNode(String s) {
        TrieNode node = root;
        for (char c : s.toCharArray()) {
            int idx = c - 'a';
            if (node.children[idx] == null) return null;
            node = node.children[idx];
        }
        return node;
    }
}
```

**JavaScript:**
```javascript
class Trie {
    constructor() {
        this.root = {};
    }
    
    insert(word) {
        let node = this.root;
        for (const c of word) {
            if (!node[c]) node[c] = {};
            node = node[c];
        }
        node.isEnd = true;
    }
    
    search(word) {
        const node = this._findNode(word);
        return node !== null && node.isEnd === true;
    }
    
    startsWith(prefix) {
        return this._findNode(prefix) !== null;
    }
    
    _findNode(s) {
        let node = this.root;
        for (const c of s) {
            if (!node[c]) return null;
            node = node[c];
        }
        return node;
    }
}

// Test
const trie = new Trie();
trie.insert("apple");
console.log(trie.search("apple"));   // true
console.log(trie.search("app"));     // false
console.log(trie.startsWith("app")); // true
trie.insert("app");
console.log(trie.search("app"));     // true
```

---

## 2. Wildcard Search (Design Add and Search Words - LC 211)

**When to use:** Pattern matching with "." wildcards

**Key Insight:** When encountering ".", recursively try ALL children. If ANY path succeeds, return true.

**Why DFS?** The wildcard "." can match any character, so we must explore all possibilities.

**Template:**
```
addWord(word):
    // Same as basic insert
    
search(word):
    return searchHelper(word, 0, root)

searchHelper(word, index, node):
    if node is null: return false
    if index == word.length: return node.isEnd
    
    char = word[index]
    if char == '.':
        // Try ALL children
        for each child in node.children:
            if searchHelper(word, index + 1, child):
                return true
        return false
    else:
        return searchHelper(word, index + 1, node.children[char])
```

**Time:** O(26^k * L) where k = number of wildcards, L = word length
**Space:** O(L) recursion depth

**Problems:**
- Design Add and Search Words Data Structure (LC 211)

### Complete Runnable Code

**Go:**
```go
package main

import "fmt"

type TrieNode struct {
    children [26]*TrieNode
    isEnd    bool
}

type WordDictionary struct {
    root *TrieNode
}

func Constructor() WordDictionary {
    return WordDictionary{root: &TrieNode{}}
}

func (wd *WordDictionary) AddWord(word string) {
    node := wd.root
    for _, c := range word {
        idx := c - 'a'
        if node.children[idx] == nil {
            node.children[idx] = &TrieNode{}
        }
        node = node.children[idx]
    }
    node.isEnd = true
}

func (wd *WordDictionary) Search(word string) bool {
    return wd.searchHelper(word, 0, wd.root)
}

func (wd *WordDictionary) searchHelper(word string, index int, node *TrieNode) bool {
    if node == nil {
        return false
    }
    if index == len(word) {
        return node.isEnd
    }
    
    c := word[index]
    if c == '.' {
        // Try all children
        for _, child := range node.children {
            if wd.searchHelper(word, index+1, child) {
                return true
            }
        }
        return false
    }
    
    return wd.searchHelper(word, index+1, node.children[c-'a'])
}

func main() {
    wd := Constructor()
    wd.AddWord("bad")
    wd.AddWord("dad")
    wd.AddWord("mad")
    fmt.Println(wd.Search("pad")) // false
    fmt.Println(wd.Search("bad")) // true
    fmt.Println(wd.Search(".ad")) // true (matches bad, dad, mad)
    fmt.Println(wd.Search("b..")) // true (matches bad)
}
```

**Java:**
```java
class WordDictionary {
    TrieNode root = new TrieNode();
    
    class TrieNode {
        TrieNode[] children = new TrieNode[26];
        boolean isEnd = false;
    }
    
    public void addWord(String word) {
        TrieNode node = root;
        for (char c : word.toCharArray()) {
            int idx = c - 'a';
            if (node.children[idx] == null) {
                node.children[idx] = new TrieNode();
            }
            node = node.children[idx];
        }
        node.isEnd = true;
    }
    
    public boolean search(String word) {
        return searchHelper(word, 0, root);
    }
    
    private boolean searchHelper(String word, int index, TrieNode node) {
        if (node == null) return false;
        if (index == word.length()) return node.isEnd;
        
        char c = word.charAt(index);
        if (c == '.') {
            // Wildcard: try ALL 26 children
            for (TrieNode child : node.children) {
                if (searchHelper(word, index + 1, child)) {
                    return true;
                }
            }
            return false;
        } else {
            return searchHelper(word, index + 1, node.children[c - 'a']);
        }
    }
}
```

**JavaScript:**
```javascript
class WordDictionary {
    constructor() {
        this.root = {};
    }
    
    addWord(word) {
        let node = this.root;
        for (const c of word) {
            if (!node[c]) node[c] = {};
            node = node[c];
        }
        node.isEnd = true;
    }
    
    search(word) {
        return this._searchHelper(word, 0, this.root);
    }
    
    _searchHelper(word, index, node) {
        if (!node) return false;
        if (index === word.length) return node.isEnd === true;
        
        const c = word[index];
        if (c === '.') {
            // Try all children
            for (const key of Object.keys(node)) {
                if (key !== 'isEnd' && 
                    this._searchHelper(word, index + 1, node[key])) {
                    return true;
                }
            }
            return false;
        } else {
            return this._searchHelper(word, index + 1, node[c]);
        }
    }
}

// Test
const wd = new WordDictionary();
wd.addWord("bad");
wd.addWord("dad");
wd.addWord("mad");
console.log(wd.search("pad")); // false
console.log(wd.search("bad")); // true
console.log(wd.search(".ad")); // true
console.log(wd.search("b..")); // true
```

---

## 3. Trie + Grid Backtracking (Word Search II - LC 212)

**When to use:** Find multiple dictionary words in a 2D grid

**Key Insight:** Build Trie from all words, then DFS from each grid cell. The Trie prunes invalid paths early.

**Why Trie over HashMap?**
- HashMap: For each cell, check if current path is a valid word prefix → O(words * L) per path
- Trie: Check if current path exists in Trie → O(1) per step

**Template:**
```
findWords(board, words):
    root = buildTrie(words)  // Store word at end node
    result = []
    
    for each cell (i, j):
        dfs(board, i, j, root, result)
    
    return result

buildTrie(words):
    root = new TrieNode()
    for word in words:
        node = root
        for char in word:
            if char not in node.children:
                node.children[char] = new TrieNode()
            node = node.children[char]
        node.word = word  // Store complete word at end!
    return root

dfs(board, i, j, node, result):
    // Bounds check
    if out of bounds: return
    
    char = board[i][j]
    if char == '#' or char not in node.children: return
    
    node = node.children[char]
    
    // Found a word!
    if node.word != null:
        result.add(node.word)
        node.word = null  // Avoid duplicates
    
    // Mark visited and explore
    board[i][j] = '#'
    dfs(board, i+1, j, node, result)
    dfs(board, i-1, j, node, result)
    dfs(board, i, j+1, node, result)
    dfs(board, i, j-1, node, result)
    board[i][j] = char  // Restore
```

**Time:** O(M * N * 4^L) where M*N = grid size, L = max word length
**Space:** O(total characters in all words)

**Problems:**
- Word Search II (LC 212)
- Boggle Game

### Complete Runnable Code

**Go:**
```go
package main

import "fmt"

type TrieNode struct {
    children [26]*TrieNode
    word     string // Store complete word at end
}

func findWords(board [][]byte, words []string) []string {
    root := buildTrie(words)
    result := []string{}
    
    for i := 0; i < len(board); i++ {
        for j := 0; j < len(board[0]); j++ {
            dfs(board, i, j, root, &result)
        }
    }
    return result
}

func buildTrie(words []string) *TrieNode {
    root := &TrieNode{}
    for _, word := range words {
        node := root
        for _, c := range word {
            idx := c - 'a'
            if node.children[idx] == nil {
                node.children[idx] = &TrieNode{}
            }
            node = node.children[idx]
        }
        node.word = word
    }
    return root
}

func dfs(board [][]byte, i, j int, node *TrieNode, result *[]string) {
    // Bounds check
    if i < 0 || i >= len(board) || j < 0 || j >= len(board[0]) {
        return
    }
    
    c := board[i][j]
    if c == '#' || node.children[c-'a'] == nil {
        return
    }
    
    node = node.children[c-'a']
    
    // Found a word!
    if node.word != "" {
        *result = append(*result, node.word)
        node.word = "" // Avoid duplicates
    }
    
    // Mark visited and explore
    board[i][j] = '#'
    dfs(board, i+1, j, node, result)
    dfs(board, i-1, j, node, result)
    dfs(board, i, j+1, node, result)
    dfs(board, i, j-1, node, result)
    board[i][j] = c // Restore
}

func main() {
    board := [][]byte{
        {'o', 'a', 'a', 'n'},
        {'e', 't', 'a', 'e'},
        {'i', 'h', 'k', 'r'},
        {'i', 'f', 'l', 'v'},
    }
    words := []string{"oath", "pea", "eat", "rain"}
    result := findWords(board, words)
    fmt.Println(result) // ["oath", "eat"]
}
```

**Java:**
```java
import java.util.*;

class Solution {
    public List<String> findWords(char[][] board, String[] words) {
        List<String> result = new ArrayList<>();
        TrieNode root = buildTrie(words);
        
        for (int i = 0; i < board.length; i++) {
            for (int j = 0; j < board[0].length; j++) {
                dfs(board, i, j, root, result);
            }
        }
        return result;
    }
    
    private TrieNode buildTrie(String[] words) {
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
            node.word = word;
        }
        return root;
    }
    
    private void dfs(char[][] board, int i, int j, 
                     TrieNode node, List<String> result) {
        // Bounds check
        if (i < 0 || i >= board.length || 
            j < 0 || j >= board[0].length) return;
        
        char c = board[i][j];
        if (c == '#' || node.children[c - 'a'] == null) return;
        
        node = node.children[c - 'a'];
        
        // Found a word!
        if (node.word != null) {
            result.add(node.word);
            node.word = null; // Avoid duplicates
        }
        
        // Mark visited and explore
        board[i][j] = '#';
        dfs(board, i + 1, j, node, result);
        dfs(board, i - 1, j, node, result);
        dfs(board, i, j + 1, node, result);
        dfs(board, i, j - 1, node, result);
        board[i][j] = c; // Restore
    }
    
    class TrieNode {
        TrieNode[] children = new TrieNode[26];
        String word = null;
    }
}
```

**JavaScript:**
```javascript
function findWords(board, words) {
    const result = [];
    const root = buildTrie(words);
    
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
            dfs(board, i, j, root, result);
        }
    }
    return result;
}

function buildTrie(words) {
    const root = {};
    for (const word of words) {
        let node = root;
        for (const c of word) {
            if (!node[c]) node[c] = {};
            node = node[c];
        }
        node.word = word;
    }
    return root;
}

function dfs(board, i, j, node, result) {
    // Bounds check
    if (i < 0 || i >= board.length || 
        j < 0 || j >= board[0].length) return;
    
    const c = board[i][j];
    if (c === '#' || !node[c]) return;
    
    node = node[c];
    
    // Found a word!
    if (node.word) {
        result.push(node.word);
        node.word = null; // Avoid duplicates
    }
    
    // Mark visited and explore
    board[i][j] = '#';
    dfs(board, i + 1, j, node, result);
    dfs(board, i - 1, j, node, result);
    dfs(board, i, j + 1, node, result);
    dfs(board, i, j - 1, node, result);
    board[i][j] = c; // Restore
}

// Test
const board = [
    ['o','a','a','n'],
    ['e','t','a','e'],
    ['i','h','k','r'],
    ['i','f','l','v']
];
const words = ["oath","pea","eat","rain"];
console.log(findWords(board, words)); // ["oath", "eat"]
```

---

## 4. Autocomplete / Search Suggestions (LC 1268)

**When to use:** Return top K suggestions as user types

**Key Insight:** Navigate to prefix node, then DFS to collect words in lexicographic order.

**Template:**
```
suggestedProducts(products, searchWord):
    root = buildTrie(products)  // Store word at end
    results = []
    node = root
    
    for char in searchWord:
        suggestions = []
        if node != null:
            node = node.children[char]
        if node != null:
            dfs(node, suggestions, limit=3)
        results.add(suggestions)
    
    return results

dfs(node, suggestions, limit):
    if suggestions.size() == limit: return
    if node.word != null:
        suggestions.add(node.word)
    // Iterate a-z for lexicographic order
    for i = 0 to 25:
        if node.children[i] != null:
            dfs(node.children[i], suggestions, limit)
```

**Problems:**
- Search Suggestions System (LC 1268)
- Design Search Autocomplete System (LC 642)

---

## 5. Replace Words with Prefix (LC 648)

**When to use:** Replace words with their shortest root/prefix from dictionary

**Key Insight:** Build Trie from roots. For each word, traverse Trie and return immediately when hitting `isEnd` (shortest root wins).

**Template:**
```
replaceWords(dictionary, sentence):
    root = buildTrie(dictionary)
    words = sentence.split(" ")
    
    for each word in words:
        replacement = findRoot(root, word)
        // use replacement
    
    return joined result

findRoot(root, word):
    node = root
    for i, char in word:
        // Found a root - return immediately!
        if node.word != null:
            return node.word
        // Path doesn't exist - no root found
        if char not in node.children:
            return word
        node = node.children[char]
    return node.word or word
```

**Problems:**
- Replace Words (LC 648)

---

## 6. Longest Common Prefix

**When to use:** Find longest prefix shared by all strings

**Key Insight:** Insert all words, then traverse while only one child exists and not at word end.

**Template:**
```
longestCommonPrefix(strs):
    if empty: return ""
    
    root = buildTrie(strs)
    node = root
    prefix = ""
    
    while node has exactly 1 child AND not isEnd:
        char = the single child's character
        prefix += char
        node = node.children[char]
    
    return prefix
```

**Problems:**
- Longest Common Prefix (LC 14)

---

# FAANG Company-Specific Problem Focus

## Google
- Word Search II (Boggle game)
- Autocomplete systems
- Spell checker with suggestions
- **Frequently Asked:** Implement Trie, Search Suggestions System

## Amazon
- Product search autocomplete
- Word dictionary with wildcards
- **Frequently Asked:** Design Add and Search Words, Word Search II

## Meta (Facebook)
- Typeahead suggestions
- Name/entity search
- **Frequently Asked:** Design Add and Search Words, Implement Trie

## Microsoft
- IntelliSense-style completion
- Spell checking
- **Frequently Asked:** Implement Trie

## Apple
- Keyboard autocomplete
- Siri voice recognition preprocessing
- **Frequently Asked:** Implement Trie, Search Suggestions

---

# Edge Case Checklist for Trie

## Universal Trie Edge Cases

- [ ] **Empty string**: `insert("")`, `search("")`
- [ ] **Single character**: `insert("a")`, `search("a")`
- [ ] **Prefix is also a word**: insert both "app" and "apple"
- [ ] **Search non-existent**: search for word never inserted
- [ ] **Case sensitivity**: usually lowercase only, clarify in interview
- [ ] **Non-alphabetic chars**: hyphens, numbers → use HashMap children

## Pattern-Specific Edge Cases

### Basic Trie (LC 208):
- [ ] Insert same word twice (harmless, sets isEnd=true again)
- [ ] Search before any insert
- [ ] startsWith("") returns true (empty prefix matches all)
- [ ] Word that is prefix of another: "app" vs "apple"

### Wildcard Search (LC 211):
- [ ] All wildcards: search("...")
- [ ] Wildcard at start: search(".ad")
- [ ] Wildcard at end: search("ba.")
- [ ] Multiple wildcards: search(".a.")
- [ ] No matches for wildcard pattern

### Word Search II (LC 212):
- [ ] Single cell grid
- [ ] Word longer than grid allows
- [ ] Same word found multiple times (dedupe via node.word = null)
- [ ] Words sharing common prefix
- [ ] All words found vs none found
- [ ] Word uses same cell twice (disallowed)

---

# Follow-up Questions for Trie

## Implement Trie Follow-ups

| Original Problem | Common Follow-up | How to Handle |
|-----------------|------------------|---------------|
| Basic Trie | "Add delete operation?" | Decrement count or remove nodes |
| Basic Trie | "Return all words with prefix?" | DFS from prefix node |
| Basic Trie | "Count words with prefix?" | Store count at each node |
| Basic Trie | "Handle unicode characters?" | Use HashMap instead of array |

## Wildcard Search Follow-ups

| Original Problem | Common Follow-up | How to Handle |
|-----------------|------------------|---------------|
| "." wildcard | "Support '*' (0+ chars)?" | More complex DFS with loops |
| "." wildcard | "Case insensitive?" | Normalize during insert/search |
| "." wildcard | "Return all matches, not just boolean?" | Collect in result list |

## Word Search II Follow-ups

| Original Problem | Common Follow-up | How to Handle |
|-----------------|------------------|---------------|
| Find words in grid | "What if words can wrap around edges?" | Modify bounds check |
| Find words in grid | "Count occurrences of each word?" | Track count instead of removing |
| Find words in grid | "Find longest word only?" | Track max length found |
| Find words in grid | "Diagonal movement allowed?" | Add 4 more directions |

---

# Interview Communication for Trie

## The UMPIRE Method for Trie Problems

### Understand
> "Let me make sure I understand. We have [words/dictionary] and need to [insert/search/find]. The search should support [exact match/prefix/wildcards]?"

### Match
> "This is a Trie problem. I recognize it because [we need prefix operations / pattern matching / dictionary with prefix queries]."

### Plan

**For Basic Trie:**
> "I'll implement a Trie with nodes containing a children map and isEnd flag. Insert traverses character by character, creating nodes as needed. Search traverses and checks isEnd. StartsWith is the same but ignores isEnd."

**For Wildcard Search:**
> "For wildcards, I'll use recursive DFS. When I hit a '.', I try ALL children and return true if any path succeeds. Regular characters follow the normal path."

**For Word Search II:**
> "I'll build a Trie from all words, storing the complete word at each end node. Then DFS from each grid cell, using the Trie to prune invalid paths. When I find a word, I add it to results and set node.word = null to avoid duplicates."

### Implement
Write clean, commented code.

### Review
> "Let me trace through [example]. Starting from root, I traverse..."

### Evaluate
> "Time complexity is O([X]) because [reason].
> Space complexity is O([Y]) because [reason]."

---

# Checkpoint Questions for Trie

## After "What is a Trie?" (Section 1)

> **Quick Check:** Why do we need an `isEnd` flag? What happens without it?
>
> <details>
> <summary>Think first, then click</summary>
>
> Without `isEnd`, we can't distinguish between:
> - A complete word like "app" (inserted into dictionary)
> - A prefix like "app" (exists only because "apple" was inserted)
>
> Example: Insert "apple" only. Search "app" should return false (it's just a prefix, not a word).
> Without `isEnd`, both would appear to exist.
> </details>

## After "Search vs StartsWith" (Section 5)

> **Quick Check:** What's the only code difference between `search` and `startsWith`?
>
> <details>
> <summary>Think first, then click</summary>
>
> `search` returns `node != null && node.isEnd`
> `startsWith` returns `node != null`
>
> The `findNode` helper is identical. The only difference is whether we check `isEnd`.
> </details>

## After "Wildcard Search" (Section 8)

> **Quick Check:** For the pattern "..d" searching in a Trie with ["bad", "bed", "bid", "bud"], how many recursive calls happen at the first '.'?
>
> <details>
> <summary>Think first, then click</summary>
>
> At the first '.', we try ALL children of root. If only 'b' exists as a child, we make 1 recursive call.
> At the second '.', we try ALL children of 'b'. If 'a', 'e', 'i', 'u' exist, we make 4 recursive calls.
> Each of those checks if 'd' child exists.
>
> Total calls at first '.': depends on trie structure. Worst case: 26 calls per '.'.
> </details>

## After "Word Search II" (Section 9)

> **Quick Check:** Why do we set `node.word = null` after finding a word? What bug does this prevent?
>
> <details>
> <summary>Think first, then click</summary>
>
> Without this, we'd add duplicate words to results.
>
> Example: Grid has "eat" starting at (0,0) and also at (1,1). Without `node.word = null`, we'd add "eat" twice.
>
> Setting it to null after first find ensures each word appears only once.
> </details>

---

# Complexity Derivations for Trie

## Insert: O(L)

**Claim:** Inserting a word of length L takes O(L) time.

**Why:**
1. We iterate through L characters
2. Each character: O(1) lookup + possible O(1) node creation
3. No loops or recursion beyond the L iterations

**Total:** O(L)

## Search/StartsWith: O(L)

**Claim:** Searching a word/prefix of length L takes O(L) time.

**Why:**
1. We iterate through L characters
2. Each character: O(1) child lookup (array index or hash)
3. Final isEnd check: O(1)

**Total:** O(L)

## Wildcard Search: O(26^k * L)

**Claim:** Searching with k wildcards in word of length L takes O(26^k * L) worst case.

**Why:**
1. Each '.' can branch to 26 children
2. With k wildcards, worst case is 26^k paths
3. Each path traverses up to L nodes

**Total:** O(26^k * L)

**Average case:** Much better if Trie is sparse (few words).

## Word Search II: O(M * N * 4^L)

**Claim:** Finding words in M×N grid with max word length L takes O(M * N * 4^L).

**Why:**
1. Start DFS from each of M*N cells
2. From each cell, up to 4 directions
3. Path can be up to L characters long
4. Branching factor: 4 (not 26, because grid is 2D)
5. Trie lookup at each step: O(1)

**Total:** O(M * N * 4^L)

**Pruning helps:** Trie prunes paths that don't match any word prefix, so actual time is often much less.

---

# Pattern Comparison: Trie vs Alternatives

## When to Use Trie vs HashMap vs Other

| Decision Factor | Trie | HashMap | Sorted Array |
|-----------------|------|---------|--------------|
| Exact lookup | O(L) | O(L) | O(L log N) |
| Prefix search | O(L) | O(N * L) | O(L log N) |
| Autocomplete | O(L + results) | O(N * L) | O(log N + K) |
| Space | O(total chars) | O(N * L) | O(N * L) |
| Insert | O(L) | O(L) | O(N) |

## Decision Tree

```
Need prefix operations (startsWith, autocomplete)?
├── YES → Use Trie
│   ├── Fixed alphabet (a-z)? → Array children (faster)
│   └── Large/Unicode alphabet? → HashMap children (flexible)
└── NO → Consider HashMap
    ├── Only exact match? → HashMap is simpler
    └── Need sorted iteration? → TreeMap
```

## Common Mistakes in Pattern Choice

| Problem | Wrong Approach | Correct Approach | Why |
|---------|----------------|------------------|-----|
| Autocomplete | HashMap + filter | Trie | O(L) vs O(N*L) for prefix |
| Exact word lookup only | Trie | HashMap | Simpler, same complexity |
| Word Search II | HashMap per word | Trie | Shared prefixes, early pruning |
| Case-insensitive search | Trie with case | Normalize + Trie | Consistent indexing |

---

# Dry-Run Trace Tables

## Basic Trie Insert/Search Trace

**Insert "cat", "car", "card":**

| Step | Word | Action | Trie State |
|------|------|--------|------------|
| 1 | "cat" | Insert | root→c→a→t* |
| 2 | "car" | Insert | root→c→a→(t*, r*) |
| 3 | "card" | Insert | root→c→a→(t*, r→d*) |

**Search "car", "cat", "ca", "card":**

| Step | Word | Path | isEnd? | Result |
|------|------|------|--------|--------|
| 1 | "car" | c→a→r | true | true |
| 2 | "cat" | c→a→t | true | true |
| 3 | "ca" | c→a | false | false |
| 4 | "card" | c→a→r→d | true | true |

## Wildcard Search Trace

**Trie contains: ["bad", "dad", "mad"]**
**Search ".ad":**

| Step | Index | Char | Node | Action |
|------|-------|------|------|--------|
| 1 | 0 | '.' | root | Try all children: b, d, m |
| 2a | 1 | 'a' | b | Check b→a: exists |
| 3a | 2 | 'd' | a | Check a→d: exists, isEnd=true |
| Result | - | - | - | Return true (found "bad") |

## Word Search II Trace

**Board:**
```
o a a n
e t a e
i h k r
i f l v
```
**Words: ["oath", "eat"]**

| Step | Cell | Path | Trie Path | Action |
|------|------|------|-----------|--------|
| 1 | (0,0) | "o" | root→o | Valid prefix |
| 2 | (1,0) | "oe" | root→o→? | No 'e' child, backtrack |
| 3 | (0,1) | "oa" | root→o→a | Valid prefix |
| 4 | (1,1) | "oat" | root→o→a→t | Valid prefix |
| 5 | (1,2) | "oath" | root→o→a→t→h | Found "oath"! |
| ... | ... | ... | ... | Continue for "eat"... |

---

# Difficulty Progression for Trie

## Easy
1. **Implement Trie** (LC 208) - Foundation problem
2. **Longest Common Prefix** (LC 14) - Can solve with Trie

## Medium
3. **Design Add and Search Words** (LC 211) - Wildcard search
4. **Replace Words** (LC 648) - Shortest prefix replacement
5. **Search Suggestions System** (LC 1268) - Autocomplete
6. **Map Sum Pairs** (LC 677) - Trie with values
7. **Longest Word in Dictionary** (LC 720) - Built character by character

## Hard
8. **Word Search II** (LC 212) - Trie + Backtracking
9. **Palindrome Pairs** (LC 336) - Trie with reverse
10. **Stream of Characters** (LC 1032) - Suffix Trie
11. **Design Search Autocomplete System** (LC 642) - Trie + ranking

---

# Complete FAANG Trie Problem List (20+ Problems)

## Tier 1: Must Know (Asked Frequently)

| Problem | LeetCode # | Difficulty | Companies | Sub-Pattern |
|---------|-----------|------------|-----------|-------------|
| Implement Trie (Prefix Tree) | 208 | Medium | All FAANG | Basic Trie |
| Design Add and Search Words | 211 | Medium | Facebook, Amazon | Wildcard |
| Word Search II | 212 | Hard | Google, Amazon, FB | Trie + Backtracking |
| Search Suggestions System | 1268 | Medium | Amazon | Autocomplete |
| Replace Words | 648 | Medium | Google | Prefix Replace |

## Tier 2: Commonly Asked

| Problem | LeetCode # | Difficulty | Companies | Sub-Pattern |
|---------|-----------|------------|-----------|-------------|
| Longest Common Prefix | 14 | Easy | Amazon | Trie/String |
| Longest Word in Dictionary | 720 | Medium | Google | BFS on Trie |
| Map Sum Pairs | 677 | Medium | Facebook | Trie with Values |
| Maximum XOR of Two Numbers | 421 | Medium | Google | Bit Trie |
| Design Search Autocomplete | 642 | Hard | Google, Amazon | Trie + Ranking |

## Tier 3: Advanced

| Problem | LeetCode # | Difficulty | Companies | Sub-Pattern |
|---------|-----------|------------|-----------|-------------|
| Palindrome Pairs | 336 | Hard | Airbnb, Google | Trie + Reverse |
| Stream of Characters | 1032 | Hard | Google | Suffix Trie |
| Concatenated Words | 472 | Hard | Amazon | Trie + DP |
| Word Squares | 425 | Hard | Google | Trie + Backtracking |

---

# Optimization Techniques

## 1. Array vs HashMap Children

**Array (fixed 26):**
```java
TrieNode[] children = new TrieNode[26];
// Access: children[c - 'a']
```
- Pro: O(1) access, cache-friendly
- Con: Wastes space for sparse tries
- Use when: Lowercase English letters only

**HashMap:**
```java
Map<Character, TrieNode> children = new HashMap<>();
// Access: children.get(c)
```
- Pro: Memory efficient for sparse/unicode
- Con: HashMap overhead
- Use when: Large alphabet, unicode, mixed case

## 2. Store Word at End Node

Instead of rebuilding string during DFS:
```java
class TrieNode {
    TrieNode[] children;
    String word; // null if not end of word
}
```

Benefits:
- No StringBuilder needed during autocomplete
- Direct access to word in Word Search II

## 3. Pruning in Word Search II

**Remove found words:**
```java
if (node.word != null) {
    result.add(node.word);
    node.word = null; // Don't find again
}
```

**Remove empty branches (advanced):**
```java
// After DFS returns, if node has no children and no word, remove it
// This prevents re-exploring dead branches
```

## 4. Prefix Count for Autocomplete

```java
class TrieNode {
    int prefixCount; // How many words pass through here
}

void insert(String word) {
    TrieNode node = root;
    for (char c : word.toCharArray()) {
        node.prefixCount++;
        // ... create child, move to child
    }
    node.isEnd = true;
}
```

Use: "How many words start with this prefix?" → O(L)

---

# Review Checklist for Trie Pattern

Before finalizing, verify:

## Content Completeness
- [ ] Section 1 has "What You'll Learn" objectives
- [ ] Input constraint mapping table added
- [ ] Follow-up questions for each sub-pattern
- [ ] Edge case checklist expanded
- [ ] Interview communication (UMPIRE) scripts
- [ ] Checkpoint questions after key concepts (5+)

## Visualizations
- [ ] ASCII visualizations for Trie structure
- [ ] Dry-run trace tables formalized (3+)
- [ ] Search existing visualizers and link them

## Teaching Quality
- [ ] Complexity derivations added (not just stated)
- [ ] Pattern comparison matrix (Trie vs HashMap)
- [ ] Problems ordered by difficulty (Easy → Hard)
- [ ] Common mistakes section with code examples

## Code Quality
- [ ] All sections have Go, Java, and JavaScript
- [ ] No unused variables
- [ ] Edge cases handled in code comments
- [ ] Consistent naming

## Structure
- [ ] JSON validates
- [ ] Test code runs correctly

---

# Implementation Priority

## Phase 1: Critical (Do First)
1. Add Go code to all implementations
2. Add "What You'll Learn" to Section 1
3. Add input constraint mapping table
4. Link any existing visualizers

## Phase 2: High Value
4. Add checkpoint questions (5+ minimum)
5. Add follow-up questions for each sub-pattern
6. Expand edge case checklist
7. Add UMPIRE communication scripts

## Phase 3: Polish
8. Add complexity derivations with proofs
9. Formalize dry-run trace tables
10. Expand Trie vs HashMap comparison
11. Reorder problems by difficulty

---

# Final Deliverable

After implementing all improvements:

1. Go, Java, and JavaScript code for all 6 sub-patterns
2. 5+ checkpoint questions
3. Follow-up questions for main problems
4. Complete edge case checklist
5. UMPIRE scripts for Trie problems
6. Constraint mapping table
7. 3+ formal trace tables
8. Complexity derivations with intuition

The Trie pattern should enable solving:
- **LC 208: Implement Trie** - Basic operations
- **LC 211: Design Add and Search Words** - Wildcard search
- **LC 212: Word Search II** - Grid + Trie + Backtracking

And prepare users for any Trie variation in FAANG interviews.
