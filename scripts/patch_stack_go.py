#!/usr/bin/env python3
"""Patches the stack pattern in patterns.json with Go language support."""
import json

# ─── Go code for each tutorial section ─────────────────────────────────────

GO_SEC_1 = """\
// Go: Use a slice as a stack
stack := []int{}

// Push - append to end
stack = append(stack, 10)
stack = append(stack, 20)
stack = append(stack, 30)
// stack = [10, 20, 30]

// Peek - view top without removing
top := stack[len(stack)-1]  // 30

// Pop - remove from end (must reassign!)
n := len(stack)
removed := stack[n-1]
stack = stack[:n-1]
// stack = [10, 20]

// isEmpty check
empty := len(stack) == 0  // false

// Safe peek helper
func peek(stack []int) int {
    return stack[len(stack)-1]
}\
"""

GO_SEC_3 = """\
func isValid(s string) bool {
    stack := []rune{}
    pairs := map[rune]rune{
        ')': '(',
        ']': '[',
        '}': '{',
    }

    for _, c := range s {
        if c == '(' || c == '[' || c == '{' {
            // Opening bracket: push onto stack
            stack = append(stack, c)
        } else {
            // Closing bracket: must match top of stack
            if len(stack) == 0 {
                return false
            }
            top := stack[len(stack)-1]
            stack = stack[:len(stack)-1]
            if top != pairs[c] {
                return false
            }
        }
    }

    // Valid only if all brackets were closed
    return len(stack) == 0
}

// Examples:
// isValid("()[]{}") → true
// isValid("([)]") → false
// isValid("{[]}") → true\
"""

GO_SEC_7 = """\
func nextGreaterElement(nums []int) []int {
    n := len(nums)
    result := make([]int, n)
    for i := range result {
        result[i] = -1  // default: no greater element
    }
    stack := []int{} // store indices

    for i := 0; i < n; i++ {
        // Pop all elements smaller than current
        // Current element is their "next greater"
        for len(stack) > 0 && nums[stack[len(stack)-1]] < nums[i] {
            idx := stack[len(stack)-1]
            stack = stack[:len(stack)-1]
            result[idx] = nums[i]
        }
        stack = append(stack, i)
    }

    // Elements still in stack have no next greater
    // (already initialized to -1)
    return result
}\
"""

GO_SEC_9 = """\
func dailyTemperatures(temperatures []int) []int {
    n := len(temperatures)
    result := make([]int, n) // default 0: no warmer day
    stack := []int{}         // indices of days waiting for warmer

    for i := 0; i < n; i++ {
        // Current temp is warmer than days on stack
        for len(stack) > 0 && temperatures[stack[len(stack)-1]] < temperatures[i] {
            idx := stack[len(stack)-1]
            stack = stack[:len(stack)-1]
            result[idx] = i - idx // distance, not value!
        }
        stack = append(stack, i)
    }

    return result
}\
"""

GO_SEC_10 = """\
func nextSmallerElement(nums []int) []int {
    n := len(nums)
    result := make([]int, n)
    for i := range result {
        result[i] = -1
    }
    stack := []int{} // increasing stack

    for i := 0; i < n; i++ {
        // Pop all elements GREATER than current
        // (flip from next greater)
        for len(stack) > 0 && nums[stack[len(stack)-1]] > nums[i] {
            idx := stack[len(stack)-1]
            stack = stack[:len(stack)-1]
            result[idx] = nums[i]
        }
        stack = append(stack, i)
    }

    return result
}\
"""

GO_SEC_11 = """\
func largestRectangleArea(heights []int) int {
    stack := []int{} // increasing stack of indices
    maxArea := 0

    // Process all bars + sentinel (height 0)
    for i := 0; i <= len(heights); i++ {
        h := 0
        if i < len(heights) {
            h = heights[i]
        }

        // Pop taller bars - they can't extend further right
        for len(stack) > 0 && heights[stack[len(stack)-1]] > h {
            height := heights[stack[len(stack)-1]]
            stack = stack[:len(stack)-1]

            // Width: from stack top to current position
            width := i
            if len(stack) > 0 {
                width = i - stack[len(stack)-1] - 1
            }

            if area := height * width; area > maxArea {
                maxArea = area
            }
        }
        stack = append(stack, i)
    }

    return maxArea
}\
"""

GO_SEC_13 = """\
func calculate(s string) int {
    stack := []int{}
    num := 0
    prevOp := byte('+') // start with '+'

    for i := 0; i <= len(s); i++ {
        var c byte
        if i < len(s) {
            c = s[i]
        } else {
            c = '+' // sentinel
        }

        if c >= '0' && c <= '9' {
            num = num*10 + int(c-'0')
        } else if c != ' ' {
            n := len(stack)
            switch prevOp {
            case '+':
                stack = append(stack, num)
            case '-':
                stack = append(stack, -num)
            case '*':
                stack[n-1] *= num
            case '/':
                stack[n-1] /= num // Go integer division truncates toward zero
            }
            prevOp = c
            num = 0
        }
    }

    result := 0
    for _, v := range stack {
        result += v
    }
    return result
}\
"""

GO_SEC_14 = """\
func decodeString(s string) string {
    countStack := []int{}
    strStack := []string{}
    curr := ""
    num := 0

    for _, c := range s {
        switch {
        case c >= '0' && c <= '9':
            // Building a number (could be multi-digit)
            num = num*10 + int(c-'0')
        case c == '[':
            // Save current state, start fresh
            countStack = append(countStack, num)
            strStack = append(strStack, curr)
            num = 0
            curr = ""
        case c == ']':
            // Restore and combine
            count := countStack[len(countStack)-1]
            countStack = countStack[:len(countStack)-1]
            prev := strStack[len(strStack)-1]
            strStack = strStack[:len(strStack)-1]
            curr = prev + strings.Repeat(curr, count)
        default:
            curr += string(c)
        }
    }

    return curr
}\
"""

GO_SEC_19 = """\
For circular arrays (like Next Greater Element II), the last element wraps around to the first.

**Problem:** `[1, 2, 1]` → `[2, -1, 2]` (the last 1 sees the first 2)

**Solution:** Iterate 2n times, using `i % n` for the actual index.

```go
func nextGreaterCircular(nums []int) []int {
    n := len(nums)
    result := make([]int, n)
    for i := range result {
        result[i] = -1
    }
    stack := []int{}

    // Iterate twice through the array
    for i := 0; i < 2*n; i++ {
        idx := i % n // actual index in array

        for len(stack) > 0 && nums[stack[len(stack)-1]] < nums[idx] {
            top := stack[len(stack)-1]
            stack = stack[:len(stack)-1]
            result[top] = nums[idx]
        }

        // Only push during first pass
        if i < n {
            stack = append(stack, i)
        }
    }

    return result
}
```

**Walkthrough: `[1, 2, 1]`**
```
First pass (i = 0, 1, 2):
  i=0: push 0. Stack: [0]
  i=1: 2>1, pop 0 → result[0]=2. Push 1. Stack: [1]
  i=2: 1<2, push 2. Stack: [1, 2]

Second pass (i = 3, 4, 5 → idx = 0, 1, 2):
  i=3 (idx=0): 1<2, nothing
  i=4 (idx=1): 2>1, pop 2 → result[2]=2. Stack: [1]
  i=5 (idx=2): 1<2, nothing

Result: [2, -1, 2] ✓
```\
"""

# ─── Go code template ──────────────────────────────────────────────────────

GO_TEMPLATE = """\
// Valid Parentheses
func isValid(s string) bool {
    stack := []rune{}
    pairs := map[rune]rune{')': '(', ']': '[', '}': '{'}

    for _, c := range s {
        if c == '(' || c == '[' || c == '{' {
            stack = append(stack, c)
        } else {
            if len(stack) == 0 || stack[len(stack)-1] != pairs[c] {
                return false
            }
            stack = stack[:len(stack)-1]
        }
    }
    return len(stack) == 0
}

// Monotonic Stack - Next Greater Element
func nextGreater(nums []int) []int {
    n := len(nums)
    result := make([]int, n)
    for i := range result {
        result[i] = -1
    }
    stack := []int{} // store indices

    for i := 0; i < n; i++ {
        // Pop all smaller elements - current is their answer
        for len(stack) > 0 && nums[stack[len(stack)-1]] < nums[i] {
            idx := stack[len(stack)-1]
            stack = stack[:len(stack)-1]
            result[idx] = nums[i]
        }
        stack = append(stack, i)
    }
    return result
}

// Basic Calculator II
func calculate(s string) int {
    stack := []int{}
    num := 0
    prevOp := byte('+')

    for i := 0; i <= len(s); i++ {
        var c byte
        if i < len(s) {
            c = s[i]
        } else {
            c = '+'
        }
        if c >= '0' && c <= '9' {
            num = num*10 + int(c-'0')
        } else if c != ' ' {
            n := len(stack)
            switch prevOp {
            case '+':
                stack = append(stack, num)
            case '-':
                stack = append(stack, -num)
            case '*':
                stack[n-1] *= num
            case '/':
                stack[n-1] /= num
            }
            prevOp = c
            num = 0
        }
    }

    result := 0
    for _, v := range stack {
        result += v
    }
    return result
}\
"""

# ─── Go variation templates ────────────────────────────────────────────────

GO_VAR_0 = """\
func isValidParentheses(s string) bool {
    stack := []rune{}
    pairs := map[rune]rune{')': '(', ']': '[', '}': '{'}

    for _, c := range s {
        if _, isClosing := pairs[c]; isClosing {
            if len(stack) == 0 || stack[len(stack)-1] != pairs[c] {
                return false
            }
            stack = stack[:len(stack)-1]
        } else {
            stack = append(stack, c)
        }
    }
    return len(stack) == 0
}\
"""

GO_VAR_1 = """\
func nextGreater(nums []int) []int {
    n := len(nums)
    result := make([]int, n)
    for i := range result {
        result[i] = -1
    }
    stack := []int{} // decreasing stack of indices

    for i := 0; i < n; i++ {
        for len(stack) > 0 && nums[stack[len(stack)-1]] < nums[i] {
            idx := stack[len(stack)-1]
            stack = stack[:len(stack)-1]
            result[idx] = nums[i]
        }
        stack = append(stack, i)
    }
    return result
}\
"""

GO_VAR_2 = """\
func largestRectangle(heights []int) int {
    stack := []int{} // increasing stack of indices
    maxArea := 0

    for i := 0; i <= len(heights); i++ {
        h := 0
        if i < len(heights) {
            h = heights[i]
        }
        for len(stack) > 0 && heights[stack[len(stack)-1]] > h {
            height := heights[stack[len(stack)-1]]
            stack = stack[:len(stack)-1]
            width := i
            if len(stack) > 0 {
                width = i - stack[len(stack)-1] - 1
            }
            if area := height * width; area > maxArea {
                maxArea = area
            }
        }
        stack = append(stack, i)
    }
    return maxArea
}\
"""

GO_VAR_3 = """\
func calculate(s string) int {
    stack := []int{}
    num := 0
    prevOp := byte('+')
    // append sentinel so the last number is always flushed
    s += "+"

    for i := 0; i < len(s); i++ {
        c := s[i]
        if c >= '0' && c <= '9' {
            num = num*10 + int(c-'0')
        } else if c != ' ' {
            n := len(stack)
            switch prevOp {
            case '+':
                stack = append(stack, num)
            case '-':
                stack = append(stack, -num)
            case '*':
                stack[n-1] *= num
            case '/':
                stack[n-1] /= num
            }
            prevOp = c
            num = 0
        }
    }

    result := 0
    for _, v := range stack {
        result += v
    }
    return result
}\
"""

# ─── Content additions ─────────────────────────────────────────────────────

GO_MISTAKES_SECTION = """\n\n## Go-Specific Mistakes

**Mistake 1: Forgetting to reassign the slice when popping**
```go
// WRONG: the slice header is not updated
_ = stack[len(stack)-1]
stack[:len(stack)-1]  // creates a new slice but discards it

// CORRECT: always reassign
top := stack[len(stack)-1]
stack = stack[:len(stack)-1]
```

**Mistake 2: Off-by-one on peek**
```go
// WRONG: panics with index out of range
top := stack[len(stack)]

// CORRECT
top := stack[len(stack)-1]
```

**Mistake 3: Using strings.Repeat without importing "strings"**
```go
// In decodeString, this requires: import "strings"
curr = prev + strings.Repeat(curr, count)
```

**Mistake 4: Ranging over a string gives runes, not bytes**
```go
// Ranging a string in Go gives rune (Unicode code point)
for _, c := range s {
    // c is rune — use rune comparisons
    if c == '(' { ... }
}

// If you need byte indexing, use s[i] (returns byte)
```\
"""

GO_COMPLEXITY_NOTE = "- Go: Use a `[]T` slice as a stack — `append` to push, `s[len(s)-1]` to peek, `s = s[:len(s)-1]` to pop; all O(1) amortized. No special import required."

GO_TEMPLATES_SECTION = """\n\n### Handling the Go Stack Gap

Go has no built-in stack type. The idiomatic pattern is a plain slice:

```go
// Push
stack = append(stack, val)

// Peek
top := stack[len(stack)-1]

// Pop (must reassign!)
top := stack[len(stack)-1]
stack = stack[:len(stack)-1]

// isEmpty
len(stack) == 0
```

**Key difference from Java:** Java's `ArrayDeque` encapsulates state — you call methods. In Go you manage the slice directly, so every pop must reassign the variable.

## Go Templates

**Valid Parentheses:**
```go
func isValid(s string) bool {
    stack := []rune{}
    pairs := map[rune]rune{')': '(', ']': '[', '}': '{'}
    for _, c := range s {
        if c == '(' || c == '[' || c == '{' {
            stack = append(stack, c)
        } else {
            if len(stack) == 0 || stack[len(stack)-1] != pairs[c] {
                return false
            }
            stack = stack[:len(stack)-1]
        }
    }
    return len(stack) == 0
}
```

**Monotonic Stack (Next Greater):**
```go
func nextGreater(nums []int) []int {
    result := make([]int, len(nums))
    for i := range result { result[i] = -1 }
    stack := []int{}
    for i, v := range nums {
        for len(stack) > 0 && nums[stack[len(stack)-1]] < v {
            idx := stack[len(stack)-1]
            stack = stack[:len(stack)-1]
            result[idx] = v
        }
        stack = append(stack, i)
    }
    return result
}
```

**Largest Rectangle in Histogram:**
```go
func largestRectangleArea(heights []int) int {
    stack := []int{}
    maxArea := 0
    for i := 0; i <= len(heights); i++ {
        h := 0
        if i < len(heights) { h = heights[i] }
        for len(stack) > 0 && heights[stack[len(stack)-1]] > h {
            height := heights[stack[len(stack)-1]]
            stack = stack[:len(stack)-1]
            width := i
            if len(stack) > 0 { width = i - stack[len(stack)-1] - 1 }
            if area := height * width; area > maxArea { maxArea = area }
        }
        stack = append(stack, i)
    }
    return maxArea
}
```

**Basic Calculator II:**
```go
func calculate(s string) int {
    stack, num, prevOp := []int{}, 0, byte('+')
    for i := 0; i <= len(s); i++ {
        c := byte('+')
        if i < len(s) { c = s[i] }
        if c >= '0' && c <= '9' {
            num = num*10 + int(c-'0')
        } else if c != ' ' {
            n := len(stack)
            switch prevOp {
            case '+': stack = append(stack, num)
            case '-': stack = append(stack, -num)
            case '*': stack[n-1] *= num
            case '/': stack[n-1] /= num
            }
            prevOp, num = c, 0
        }
    }
    result := 0
    for _, v := range stack { result += v }
    return result
}
```

**Decode String:**
```go
func decodeString(s string) string {
    countStack, strStack := []int{}, []string{}
    curr, num := "", 0
    for _, c := range s {
        switch {
        case c >= '0' && c <= '9':
            num = num*10 + int(c-'0')
        case c == '[':
            countStack = append(countStack, num)
            strStack = append(strStack, curr)
            num, curr = 0, ""
        case c == ']':
            count := countStack[len(countStack)-1]
            countStack = countStack[:len(countStack)-1]
            prev := strStack[len(strStack)-1]
            strStack = strStack[:len(strStack)-1]
            curr = prev + strings.Repeat(curr, count)
        default:
            curr += string(c)
        }
    }
    return curr
}
```\
"""


def patch():
    with open("frontend/src/lib/patterns.json", encoding="utf-8") as f:
        data = json.load(f)

    pattern = next(x for x in data if x["id"] == "stack")
    t = pattern["tutorial"]

    # Section 1: Core Stack Operations
    t[1]["code"]["go"] = GO_SEC_1

    # Section 3: Matching Parentheses
    t[3]["code"]["go"] = GO_SEC_3

    # Section 7: Pattern 2a: Next Greater Element
    t[7]["code"]["go"] = GO_SEC_7

    # Section 9: Pattern 2b: Daily Temperatures
    t[9]["code"]["go"] = GO_SEC_9

    # Section 10: Pattern 2c: Next Smaller Element
    t[10]["code"]["go"] = GO_SEC_10

    # Section 11: Pattern 2d: Largest Rectangle in Histogram
    t[11]["code"]["go"] = GO_SEC_11

    # Section 13: Expression Evaluation
    t[13]["code"]["go"] = GO_SEC_13

    # Section 14: Nested Structures (Decode String)
    t[14]["code"]["go"] = GO_SEC_14

    # Section 17: Common Mistakes - append Go section
    if "## Go-Specific Mistakes" not in t[17].get("content", ""):
        t[17]["content"] += GO_MISTAKES_SECTION

    # Section 18: Complexity Analysis - add Go to language notes
    content_18 = t[18].get("content", "")
    if "Go:" not in content_18:
        # Insert Go line after the C++ line
        old = "- C++: Use `std::stack` or `std::vector`"
        new = old + "\n" + GO_COMPLEXITY_NOTE
        if old in content_18:
            t[18]["content"] = content_18.replace(old, new)
        else:
            t[18]["content"] = content_18 + "\n" + GO_COMPLEXITY_NOTE

    # Section 19: Advanced: Circular Arrays - replace with Go version
    t[19]["content"] = GO_SEC_19

    # codeTemplates
    pattern["codeTemplates"]["go"] = GO_TEMPLATE

    # Variation templates
    pattern["variations"][0]["template"]["go"] = GO_VAR_0
    pattern["variations"][1]["template"]["go"] = GO_VAR_1
    pattern["variations"][2]["template"]["go"] = GO_VAR_2
    pattern["variations"][3]["template"]["go"] = GO_VAR_3

    # keyInsights: add Go slice-as-stack insight if not present
    insights = pattern.get("keyInsights", [])
    go_insight = "Go: slice is the stack — append to push, s[len(s)-1] to peek, s=s[:len(s)-1] to pop"
    if go_insight not in insights:
        insights.append(go_insight)
    pattern["keyInsights"] = insights

    # commonMistakes: add Go-specific entry
    mistakes = pattern.get("commonMistakes", [])
    go_mistake = "In Go, forgetting to reassign after pop (stack = stack[:len(stack)-1]) leaves the variable unchanged"
    if go_mistake not in mistakes:
        mistakes.append(go_mistake)
    pattern["commonMistakes"] = mistakes

    # Section 17: also add interview tips template section if not present
    # (this is the "Interview Tips" equivalent; section 17 is Common Mistakes)
    # Look for a section titled Interview Tips and Templates
    interview_sec_idx = None
    for idx, sec in enumerate(t):
        title = sec.get("title", "")
        if "Interview" in title and "Template" in title:
            interview_sec_idx = idx
            break

    if interview_sec_idx is not None:
        sec = t[interview_sec_idx]
        if "## Go Templates" not in sec.get("content", ""):
            sec["content"] = sec.get("content", "") + GO_TEMPLATES_SECTION
    else:
        # No dedicated interview tips section; append Go Templates to section 17
        if "## Go Templates" not in t[17].get("content", ""):
            t[17]["content"] += GO_TEMPLATES_SECTION

    with open("frontend/src/lib/patterns.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print("Patch applied. Running verification...")
    verify(data)


def verify(data):
    pattern = next(x for x in data if x["id"] == "stack")
    t = pattern["tutorial"]
    errors = []

    def check(label, cond):
        if not cond:
            errors.append(f"FAIL: {label}")
        else:
            print(f"  ok  {label}")

    # Code sections
    check("sec 1 has go", "go" in t[1].get("code", {}))
    check("sec 3 has go", "go" in t[3].get("code", {}))
    check("sec 7 has go", "go" in t[7].get("code", {}))
    check("sec 9 has go", "go" in t[9].get("code", {}))
    check("sec 10 has go", "go" in t[10].get("code", {}))
    check("sec 11 has go", "go" in t[11].get("code", {}))
    check("sec 13 has go", "go" in t[13].get("code", {}))
    check("sec 14 has go", "go" in t[14].get("code", {}))

    # Content of each Go code block
    check("sec 1 go has append", "append" in t[1]["code"]["go"])
    check("sec 3 go has isValid", "isValid" in t[3]["code"]["go"])
    check("sec 7 go has nextGreaterElement", "nextGreaterElement" in t[7]["code"]["go"])
    check("sec 9 go has dailyTemperatures", "dailyTemperatures" in t[9]["code"]["go"])
    check("sec 10 go has nextSmallerElement", "nextSmallerElement" in t[10]["code"]["go"])
    check("sec 11 go has largestRectangleArea", "largestRectangleArea" in t[11]["code"]["go"])
    check("sec 13 go has calculate", "calculate" in t[13]["code"]["go"])
    check("sec 14 go has decodeString", "decodeString" in t[14]["code"]["go"])
    check("sec 14 go uses strings.Repeat", "strings.Repeat" in t[14]["code"]["go"])

    # Section 13: Go uses integer division (not float cast)
    check("sec 13 go uses /= not float64", "float64" not in t[13]["code"]["go"])

    # No Java-specific patterns in Go code
    for i in [1, 3, 7, 9, 10, 11, 13, 14]:
        code = t[i]["code"].get("go", "")
        check(f"sec {i} go no ArrayDeque", "ArrayDeque" not in code)
        check(f"sec {i} go no isEmpty()", "isEmpty()" not in code)

    # Section 17: Go mistakes appended
    check("sec 17 has Go-Specific Mistakes", "Go-Specific Mistakes" in t[17].get("content", ""))

    # Section 18: Go added to language notes
    check("sec 18 has Go note", "Go:" in t[18].get("content", ""))

    # Section 19: Go circular array code
    check("sec 19 has Go circular code", "nextGreaterCircular" in t[19].get("content", ""))
    check("sec 19 Go uses i % n", "i % n" in t[19].get("content", "") or "i%n" in t[19].get("content", ""))

    # codeTemplates
    check("codeTemplates has go", "go" in pattern.get("codeTemplates", {}))
    check("codeTemplates go has nextGreater", "nextGreater" in pattern["codeTemplates"].get("go", ""))
    check("codeTemplates go has calculate", "calculate" in pattern["codeTemplates"].get("go", ""))

    # Variations
    for i in range(4):
        check(f"variation {i} has go template", "go" in pattern["variations"][i].get("template", {}))

    check("variation 0 go has isValidParentheses", "isValidParentheses" in pattern["variations"][0]["template"].get("go", ""))
    check("variation 1 go has nextGreater", "nextGreater" in pattern["variations"][1]["template"].get("go", ""))
    check("variation 2 go has largestRectangle", "largestRectangle" in pattern["variations"][2]["template"].get("go", ""))
    check("variation 3 go has calculate", "calculate" in pattern["variations"][3]["template"].get("go", ""))

    # keyInsights
    insights_str = " ".join(pattern.get("keyInsights", []))
    check("keyInsights has Go entry", "Go:" in insights_str or "go" in insights_str.lower())

    # commonMistakes
    mistakes_str = " ".join(str(m) for m in pattern.get("commonMistakes", []))
    check("commonMistakes has Go entry", "Go" in mistakes_str)

    # Sec 17 also has Go Templates
    check("sec 17 has Go Templates", "## Go Templates" in t[17].get("content", ""))

    print()
    if errors:
        for e in errors:
            print(e)
        raise SystemExit(f"\n{len(errors)} check(s) failed")
    else:
        print(f"All checks passed!")


if __name__ == "__main__":
    patch()
