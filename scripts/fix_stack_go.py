#!/usr/bin/env python3
"""Fixes issues found in the stack pattern Go additions."""
import json

FIXED_SEC_1 = """\
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

// Safe peek as a function literal (valid inside a func body)
peek := func(s []int) int {
    return s[len(s)-1]
}\
"""

# Fixed walkthrough: i=3 comparison correctly references stack top (index 2, nums[2]=1)
FIXED_SEC_19_WALKTHROUGH_OLD = """\
Second pass (i = 3, 4, 5 → idx = 0, 1, 2):
  i=3 (idx=0): 1<2, 1<1... nothing
  i=4 (idx=1): 2>1, pop 2→result[2]=2. Stack: [1]
  i=5 (idx=2): 1<2, nothing\
"""

FIXED_SEC_19_WALKTHROUGH_NEW = """\
Second pass (i = 3, 4, 5 → idx = 0, 1, 2):
  i=3 (idx=0): nums[2]=1 not less than nums[0]=1, nothing
  i=4 (idx=1): nums[2]=1 < nums[1]=2, pop 2 → result[2]=2. Stack: [1]
  i=5 (idx=2): nums[1]=2 not less than nums[2]=1, nothing\
"""


def fix():
    with open("frontend/src/lib/patterns.json", encoding="utf-8") as f:
        data = json.load(f)

    p = next(x for x in data if x["id"] == "stack")
    t = p["tutorial"]

    # Fix 1: Section 1 Go code — replace invalid top-level func with function literal
    t[1]["code"]["go"] = FIXED_SEC_1

    # Fix 2: Section 19 walkthrough — correct the i=3 comparison description
    old_content = t[19]["content"]
    if FIXED_SEC_19_WALKTHROUGH_OLD in old_content:
        t[19]["content"] = old_content.replace(
            FIXED_SEC_19_WALKTHROUGH_OLD, FIXED_SEC_19_WALKTHROUGH_NEW
        )
        print("  fixed: section 19 walkthrough i=3")
    else:
        print("  WARN: section 19 walkthrough old text not found — check manually")

    # Fix 3: keyInsights em dash
    insights = p["keyInsights"]
    p["keyInsights"] = [
        i.replace(
            "Go: slice is the stack — append to push, s[len(s)-1] to peek, s=s[:len(s)-1] to pop",
            "Go: slice is the stack; append to push, s[len(s)-1] to peek, s=s[:len(s)-1] to pop",
        )
        for i in insights
    ]

    # Fix 4, 5, 6, 7: Section 17 content — em dashes and heading misnomer
    c17 = t[17]["content"]
    c17 = c17.replace(
        "Java's `ArrayDeque` encapsulates state — you call methods.",
        "Java's `ArrayDeque` encapsulates state: you call methods.",
    )
    c17 = c17.replace(
        "// c is rune — use rune comparisons",
        "// c is rune, use rune comparisons",
    )
    c17 = c17.replace(
        "**Mistake 2: Off-by-one on peek**",
        "**Mistake 2: Bounds error on peek**",
    )
    t[17]["content"] = c17

    # Fix 8: Section 18 em dash in Go language note
    c18 = t[18]["content"]
    c18 = c18.replace(
        "- Go: Use a `[]T` slice as a stack — `append` to push",
        "- Go: Use a `[]T` slice as a stack: `append` to push",
    )
    t[18]["content"] = c18

    with open("frontend/src/lib/patterns.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print("Fixes applied. Running verification...")
    verify(data)


def verify(data):
    p = next(x for x in data if x["id"] == "stack")
    t = p["tutorial"]
    errors = []

    def check(label, cond):
        if not cond:
            errors.append(f"FAIL: {label}")
        else:
            print(f"  ok  {label}")

    # Fix 1: section 1 no top-level func declaration
    sec1_go = t[1]["code"]["go"]
    check("sec1: no top-level 'func peek'", "func peek(" not in sec1_go)
    check("sec1: uses function literal 'peek :='", "peek :=" in sec1_go)
    check("sec1: still has append", "append" in sec1_go)

    # Fix 2: section 19 walkthrough corrected
    c19 = t[19]["content"]
    check("sec19: walkthrough i=3 corrected", "nums[2]=1 not less than nums[0]=1" in c19)
    check("sec19: no stale '1<2, 1<1'", "1<2, 1<1" not in c19)

    # Fix 3: keyInsights no em dash
    ki = " ".join(p["keyInsights"])
    check("keyInsights: no em dash", "—" not in ki)
    check("keyInsights: Go entry uses semicolon", "slice is the stack; append" in ki)

    # Fix 4: section 17 paragraph no em dash
    c17 = t[17]["content"]
    check("sec17: 'encapsulates state' uses colon not em dash", "encapsulates state:" in c17)

    # Fix 5: section 17 comment no em dash
    check("sec17: rune comment uses comma not em dash", "// c is rune, use rune comparisons" in c17)

    # Fix 6: section 17 Mistake 2 heading corrected
    check("sec17: Mistake 2 heading is 'Bounds error'", "Bounds error on peek" in c17)
    check("sec17: no 'Off-by-one on peek'", "Off-by-one on peek" not in c17)

    # Fix 7: section 18 note uses colon not em dash
    c18 = t[18]["content"]
    check("sec18: Go note uses colon not em dash", "slice as a stack: `append`" in c18)

    # Regression: all original code sections still have go
    for i in [1, 3, 7, 9, 10, 11, 13, 14]:
        check(f"sec {i} still has go", "go" in t[i].get("code", {}))

    print()
    if errors:
        for e in errors:
            print(e)
        raise SystemExit(f"\n{len(errors)} check(s) failed")
    else:
        print("All checks passed!")


if __name__ == "__main__":
    fix()
