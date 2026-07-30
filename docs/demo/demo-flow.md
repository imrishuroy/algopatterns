# Demo Flow Configuration

Write your demo flow in plain English below. I'll convert it to Playwright code.

## Instructions

- Each line is a step
- Use simple actions: "go to", "click", "scroll", "wait", "type"
- Specify timing if needed: "wait 3 seconds"
- Add comments with `#`

---

## Demo Flow

```
# Scene 1: Homepage
go to homepage
wait 2 seconds
scroll down slowly
hover over sliding window pattern card
wait 1 second

# Scene 2: Pattern Page
click on sliding window pattern
wait 2 seconds
scroll down to show tutorial content
wait 2 seconds

# Scene 3: Visualizer
scroll to visualizer section
click play button
wait 5 seconds for animation

# Scene 4: Problems
click on Problems tab
wait 2 seconds
scroll to show problem list

# Scene 5: Problem Workspace
click on first problem
wait 2 seconds
show code editor
click Run button
wait 3 seconds for results

# Scene 6: AI Chat
go to /chat
wait 2 seconds
type "Explain the sliding window pattern"
click send
wait 5 seconds for response
scroll to show response

# Scene 7: Interview Cheatsheet
go to /interview-cheatsheet
scroll down slowly
wait 2 seconds

# Scene 8: DSA Fundamentals
go to /dsa-fundamentals
scroll down slowly
wait 2 seconds

# Scene 9: Final
go to homepage
wait 3 seconds
```

---

## Available Pages

| Page | URL |
|------|-----|
| Homepage | `/` |
| Patterns List | `/patterns` |
| Sliding Window | `/patterns/sliding-window` |
| Two Pointers | `/patterns/two-pointers` |
| Binary Search | `/patterns/binary-search` |
| Dynamic Programming | `/patterns/dynamic-programming` |
| Graphs | `/patterns/graphs` |
| Trees | `/patterns/trees` |
| AI Chat | `/chat` |
| Interview Cheatsheet | `/interview-cheatsheet` |
| Pattern Recognition | `/pattern-recognition` |
| DSA Fundamentals | `/dsa-fundamentals` |
| Languages | `/languages` |
| Go Guide | `/languages/go` |
| Articles | `/articles` |

---

## Available Actions

| Action | Example |
|--------|---------|
| Navigate | `go to /patterns/sliding-window` |
| Wait | `wait 3 seconds` |
| Scroll | `scroll down slowly` or `scroll down 500 pixels` |
| Click | `click on Problems tab` or `click Run button` |
| Hover | `hover over sliding window card` |
| Type | `type "your text here"` |

---

## Notes

- Edit the flow above
- Save the file
- Tell me when ready and I'll update the Playwright script
