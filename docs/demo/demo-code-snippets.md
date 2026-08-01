# Demo Code Snippets

Copy-paste these during the demo recording.

## Problem: Longest Substring Without Repeating Characters

### Python
```python
def lengthOfLongestSubstring(s: str) -> int:
    char_set = set()
    left = 0
    max_length = 0
    
    for right in range(len(s)):
        while s[right] in char_set:
            char_set.remove(s[left])
            left += 1
        char_set.add(s[right])
        max_length = max(max_length, right - left + 1)
    
    return max_length
```

### Java
```java
public int lengthOfLongestSubstring(String s) {
    Set<Character> charSet = new HashSet<>();
    int left = 0, maxLength = 0;
    
    for (int right = 0; right < s.length(); right++) {
        while (charSet.contains(s.charAt(right))) {
            charSet.remove(s.charAt(left));
            left++;
        }
        charSet.add(s.charAt(right));
        maxLength = Math.max(maxLength, right - left + 1);
    }
    
    return maxLength;
}
```

### Go
```go
func lengthOfLongestSubstring(s string) int {
    charSet := make(map[byte]bool)
    left, maxLength := 0, 0
    
    for right := 0; right < len(s); right++ {
        for charSet[s[right]] {
            delete(charSet, s[left])
            left++
        }
        charSet[s[right]] = true
        if right-left+1 > maxLength {
            maxLength = right - left + 1
        }
    }
    
    return maxLength
}
```

### JavaScript
```javascript
var lengthOfLongestSubstring = function(s) {
    const charSet = new Set();
    let left = 0, maxLength = 0;
    
    for (let right = 0; right < s.length; right++) {
        while (charSet.has(s[right])) {
            charSet.delete(s[left]);
            left++;
        }
        charSet.add(s[right]);
        maxLength = Math.max(maxLength, right - left + 1);
    }
    
    return maxLength;
};
```

---

## AI Chat Demo Questions

Use one of these when demoing the AI tutor:

1. "Explain the sliding window pattern with a simple example"
2. "When should I use two pointers vs sliding window?"
3. "Help me understand how to solve longest substring without repeating characters"
4. "What's the time complexity of sliding window problems?"

---

## Quick Copy Commands

Open Terminal and run to copy code to clipboard:

```bash
# Python version
echo 'def lengthOfLongestSubstring(s: str) -> int:
    char_set = set()
    left = 0
    max_length = 0
    
    for right in range(len(s)):
        while s[right] in char_set:
            char_set.remove(s[left])
            left += 1
        char_set.add(s[right])
        max_length = max(max_length, right - left + 1)
    
    return max_length' | pbcopy
```

