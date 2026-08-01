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
hover over dynamic programming card
wait 1 second

# Scene 2: Pattern Page - Dynamic Programming
go to /patterns/dynamic-programming
show the entire content of the page by scrolling down slowly, Introduction to Dynamic Programming
wait 2 seconds

# The page has 3 tabs: Tutorial, Problems, Cheatsheet
# Tutorial tab is active by default and shows sidebar with sections
# The left sidebar contains a list of sections for the DP tutorial
# Show all the content in the left sidebar by scrolling down slowly
scroll left sidebar slowly to show all sections
wait 2 seconds
# Sidebar contains: Introduction, How DP is Discovered, Universal Framework, 
#                   1D DP, Decision DP, LCS, LIS, Grid DP, etc.

# Navigate sidebar to show tutorial sections
scroll left sidebar slowly to show section titles
wait 2 seconds

# Click on "LCS (Two Sequences)" section in left sidebar
# Section title: "LCS (Two Sequences)"
click on sidebar item "LCS (Two Sequences)"
wait for content to load
wait 2 seconds

# Show LCS tutorial content (main content area), scroll down slowly to show explanation, code blocks, templates, approaches
# Content includes: markdown explanation, code blocks, templates, approaches
scroll main content area slowly to show explanation
wait 2 seconds

# Templates section shows approach tabs: Recursion, Memoization, Tabulation, Space Optimized, this section is at the bottom of the LCS tutorial content, so scroll arrodingly
# Click through each template tab to show code
scroll to "Templates" heading in main content
wait 1 second

# Click "Recursion" tab (first tab in template tabs)
click on tab button with text "Recursion"
wait 2 seconds

# Click "Memoization" tab
click on tab button with text "Memoization"  
wait 2 seconds

# Click "Tabulation" tab
click on tab button with text "Tabulation"
wait 2 seconds

# Click "Space Optimized" tab
click on tab button with text "Space Optimized"
wait 2 seconds

# Scene 2b: AI Capabilities - Ask Thor AI
# User can select any text and click "Ask Thor AI" button that appears
scroll up to LCS explanation paragraph
wait 1 second

# Select text (any paragraph text) - triple click to select paragraph
triple-click on paragraph containing "LCS" to select text
wait 1 second

# Floating "Ask Thor AI" button appears on text selection
click floating button "Ask Thor AI"
wait 3 seconds for AI chat panel to open and respond

# AI chat panel opens on the right side
# Type follow-up question in the chat input at bottom
click on chat input textarea at bottom of AI panel
type "Can you give me a simple example comparing two strings?"
wait 500ms
click send button (arrow icon)
wait 5 seconds for AI response to stream
scroll AI chat panel to show full response

# Scene 3: Visualizer
# Some tutorial sections have interactive visualizers (e.g., "1D DP" has ClimbingStairsVisualizer)
# Go back to 1D DP section which has a visualizer
click on sidebar item "1D DP (Recursive Numbers)"
wait 2 seconds

# Scroll to find the visualizer component
scroll main content to find visualizer section
wait 1 second

# Visualizer has Play/Pause, Step, Reset buttons and speed slider
click "Play" button on visualizer
wait 5 seconds for animation to play

# Click "Reset" to restart
click "Reset" button
wait 1 second

# Scene 4: Problems Tab
# Click "Problems" tab in the tab bar (Tutorial | Problems | Cheatsheet)
click on tab "Problems" in main tab bar
wait 2 seconds

# Problems tab shows list of practice problems related to this pattern
# Each problem shows: difficulty badge, title, tags
scroll down slowly to show problem list
wait 2 seconds

# Scene 5: Problem Workspace
# Click on "House Robber" problem (listed in the problems)
click on problem link "House Robber"
wait for page to load
wait 2 seconds

# Problem workspace has: left panel (description), right panel (code editor + AI)
# Show the code editor area
scroll right panel to show code editor
wait 1 second

# AI chat panel is on the right side (can toggle open/close)
# Click AI chat toggle if not open
click AI chat toggle button if closed
wait 1 second

# Ask AI for help with the problem
click on AI chat input textarea
type "Help me understand the approach to solve this House Robber problem step by step"
click send button
wait 5 seconds for AI response to stream
scroll AI panel to show full response
wait 2 seconds

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
