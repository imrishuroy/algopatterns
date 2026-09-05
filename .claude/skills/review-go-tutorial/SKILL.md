---
name: review-go-tutorial
description: >
  Review and improve Go tutorial sections in go.json. Checks structure, code correctness,
  technical accuracy, beginner-friendliness, and content quality. Extracts and verifies
  all code examples compile and run correctly. Applies fixes and re-verifies.
  Use when asked to review, check, or improve Go tutorial content.
---

# Go Tutorial Section Review

This skill reviews Go tutorial sections in `frontend/src/lib/languages/go.json` for correctness, quality, and completeness.

## How to Use This Skill

### Slash Command (Quickest)

```
/review-go-tutorial section:<section-id>
```

Or with more detail:
```
/review-go-tutorial section: channels, mode: review and fix
```

### Invocation Methods

**Method 1: Slash command**
```
/review-go-tutorial section:<section-id>
```

**Method 2: Direct request**
```
Review the Deadlocks section in the Go tutorial
```

**Method 3: With section ID**
```
Use review-go-tutorial to check the channels section
```

**Method 4: Review and fix**
```
Review and fix the goroutines section in go.json
```

**Method 5: Review only (no fixes)**
```
Review the select-statement section but don't make changes yet
```

**Method 6: Review all concurrency sections**
```
Review all Go concurrency tutorial sections one by one
```

### Available Sections

To see all available sections in go.json:
```bash
node -e "
const data = JSON.parse(require('fs').readFileSync('frontend/src/lib/languages/go.json'));
data.sections.forEach(s => console.log(s.id + ' - ' + s.title));
"
```

Common concurrency sections:
- `goroutines` - Goroutines
- `channels` - Channels  
- `buffered-channels` - Buffered Channels
- `select-statement` - Select Statement
- `race-conditions` - Race Conditions
- `deadlocks` - Deadlocks
- `mutexes` - Mutexes
- `wait-groups` - WaitGroups
- `context-package` - Context Package
- `worker-pools` - Worker Pools

### Parameters

When invoking, you can specify:

| Parameter | Description | Example |
|-----------|-------------|---------|
| Section | Which section to review | "race-conditions", "Deadlocks" |
| Mode | Review only or review+fix | "review only", "review and fix" |
| Scope | What to check | "code only", "full review" |

### Example Workflows

**Quick code check:**
```
Check if all code examples in the mutexes section compile and run correctly
```

**Full review with fixes:**
```
Do a complete review of the context-package section and fix any issues
```

**Content expansion:**
```
Review the channels section and expand explanations to be more textbook-like
```

**Verify after changes:**
```
I updated the deadlocks section, can you verify all the code still works?
```

## What This Skill Does

1. **Reads** the specified section from `frontend/src/lib/languages/go.json`
2. **Extracts** all code examples and verifies they compile and run
3. **Checks** technical accuracy against Go documentation
4. **Validates** content structure and quality
5. **Reports** issues with severity and location
6. **Applies fixes** (if requested)
7. **Re-verifies** after fixes

## Review Process

### Phase 1: Extract and Read Section

1. Read the section from `frontend/src/lib/languages/go.json`
2. Parse all content items (text, code, tables, warnings, tips, etc.)
3. Identify all code examples by filename

### Phase 2: Structure Check

Verify the section includes:

- [ ] Opening hook explaining why this topic matters
- [ ] Mental model or analogy to aid understanding
- [ ] ASCII visualization (where applicable for complex concepts)
- [ ] Basic, complete, runnable code example
- [ ] Comparison table for approaches/methods (where applicable)
- [ ] Production/real-world code example
- [ ] Warning blocks covering common pitfalls
- [ ] Tip blocks covering best practices
- [ ] Quick reference section
- [ ] Clear transition to the next section

**For "Cause" or "Problem" sections:**
- [ ] Each cause has 2+ paragraphs explaining WHY the problem happens
- [ ] Each cause has an ASCII diagram showing the execution flow
- [ ] Diagrams use simple characters (not complex Unicode boxes)
- [ ] Buggy code has comments marking the problematic lines

**For "Fix" or "Solution" sections:**
- [ ] Each fix has 2+ paragraphs explaining WHY it works
- [ ] Fixed code example is complete and runnable
- [ ] Output block shows the fix works
- [ ] Summary text explains when to use this fix

### Phase 3: Code Verification

For EVERY code example in the section:

```bash
# 1. Extract code to temp file
# 2. Attempt compilation
go build -o /dev/null example.go

# 3. Run the code
go run example.go

# 4. For concurrency code, run with race detector
go run -race example.go

# 5. Compare actual output to documented output
```

Check each code example for:

- [ ] Compiles successfully with `go build`
- [ ] Runs without errors
- [ ] Output matches what documentation claims
- [ ] No unintended race conditions (verify with `-race`)
- [ ] No goroutine leaks
- [ ] No possible deadlocks
- [ ] Channel sends/receives are paired correctly
- [ ] Mutex Lock/Unlock are balanced
- [ ] Context cancellation handled correctly (if applicable)
- [ ] Imports match actual usage
- [ ] Follows idiomatic Go 1.22+ practices
- [ ] Inline comments explain important lines

### Phase 4: Technical Accuracy

Verify all technical claims:

- [ ] Statements about Go are correct per official documentation
- [ ] Go version-specific claims are accurate (especially Go 1.22+ changes like loop variable semantics)
- [ ] Numeric values (timings, memory sizes, overhead) are accurate
- [ ] Terminology is used correctly and consistently
- [ ] No misleading simplifications
- [ ] Edge cases are mentioned where relevant

**Critical Go 1.22+ checks:**
- Loop variable capture behavior changed in Go 1.22
- If content mentions loop variable bugs, verify it notes the Go 1.22 fix

### Phase 5: Content Quality

Check for textbook-style explanations:

- [ ] Concepts explained BEFORE syntax
- [ ] Every jargon term defined when first introduced
- [ ] Explains "why", not just "what"
- [ ] Each paragraph focuses on one concept
- [ ] Complexity increases progressively
- [ ] No forward references to unexplained concepts

**Required for each fix/solution section:**
- Detailed explanation of how the solution works
- Step-by-step breakdown for complex concepts
- Output block showing actual program output
- Explanation of why the output is what it is

### Phase 6: Style Compliance

Verify:

- [ ] No em-dashes (`—`) between words
- [ ] Category matches the section topic (e.g., "Concurrency" for concurrency sections)
- [ ] Difficulty rating appropriate for content
- [ ] Estimated time realistic for content depth
- [ ] Consistent with other tutorial sections' style

### Phase 7: JSON Validity

Verify:

- [ ] JSON structure is valid
- [ ] Strings properly escaped (`\n`, `\t`, `\"`, `\\`)
- [ ] No trailing commas
- [ ] No unescaped quotes breaking JSON

## Applying Fixes

When issues are found:

### For Missing Content

Add the required content following the section's existing style:
- Textbook-style explanations (2-3 paragraphs per concept)
- Output blocks after every runnable code example
- ASCII diagrams for complex flows
- Transition text at section end

### For Code Issues

1. Fix the code to be correct
2. Update any incorrect output blocks
3. Ensure line numbers in explanations match actual code
4. Re-run verification after fixes

### For Technical Inaccuracies

1. Verify the correct information against Go documentation
2. Update the text with accurate information
3. Add version notes where behavior differs between Go versions

## Output Format

After review, report:

```
## Section Review: [Section Title]

### Overall Status: PASS / PASS WITH FIXES / FAIL

### Summary
- Content items: X
- Code examples: X
- Issues found: X
- Issues fixed: X

### Code Verification Results

| Example | Compiles | Runs | Race-Free | Output Matches |
|---------|----------|------|-----------|----------------|
| file.go | ✓/✗      | ✓/✗  | ✓/✗/N/A   | ✓/✗            |

### Issues Found

For each issue:
- **Severity**: Critical / High / Medium / Low
- **Location**: [specific location]
- **Problem**: [description]
- **Fix**: [what was done or needs to be done]

### Fixes Applied

List all changes made to the JSON file.

### Final Verification

Confirm all fixes were applied and re-verified.
```

## Content Standards

### Code Example Requirements

Every runnable code example MUST have:

1. **The code block** with:
   - Package declaration
   - Required imports
   - Complete main() function (for standalone examples)
   - Inline comments on important lines
   - Descriptive filename

2. **Output block** immediately after, showing:
   - The command to run it
   - The actual output
   - Multiple runs if output varies (for race condition demos)

3. **Explanation text** after the output:
   - What the output shows
   - Why it behaves that way
   - Connection to the concept being taught

### Explanation Requirements

For each major concept:

1. **Introduction** (1-2 paragraphs):
   - What the concept is
   - Why it matters
   - Analogy or mental model (e.g., "like two cars on a narrow road")

2. **How It Works** (2-3 paragraphs):
   - Step-by-step explanation
   - What happens at runtime/CPU level (where relevant)
   - Why this solves the problem

3. **Example with Output**:
   - Complete runnable code
   - Actual output
   - Output explanation

### Cause/Problem Section Requirements

For sections that explain bugs, errors, or problems (e.g., "Cause 1: Unbuffered Channel"):

1. **Problem explanation** (2+ paragraphs):
   - What the problem is
   - WHY it happens (not just that it happens)
   - Step-by-step breakdown of execution
   - Analogy to make it memorable

2. **ASCII diagram** showing:
   - The flow of execution
   - Where blocking/waiting occurs
   - The dependency that causes the problem

3. **Buggy code example** with:
   - Comments marking the problematic line
   - Inline explanation of what goes wrong

### Fix/Solution Section Requirements

For sections that explain solutions:

1. **Fix explanation** (2+ paragraphs):
   - What the fix is
   - WHY it works (not just that it works)
   - How it breaks the problematic dependency

2. **Fixed code example** with:
   - Clear comments showing the fix
   - Differences from buggy version highlighted

3. **Output block** showing:
   - The code now works
   - Expected output

4. **Summary text** explaining:
   - What the output demonstrates
   - When to use this fix

### ASCII Diagram Formatting Standards

When creating or reviewing ASCII diagrams:

**DO use:**
- Simple characters: `-`, `|`, `+`, `v`, `^`, `>`, `<`, `X`
- Clear labels: "BLOCKED", "OK", "holds:", "wants:", "waiting for"
- Vertical flow for sequential execution
- Side-by-side columns for parallel goroutines
- Consistent indentation (4 spaces)

**DON'T use:**
- Complex Unicode box-drawing characters (┌ ┐ └ ┘ │ ─) unless necessary
- Nested boxes within boxes
- Overly wide diagrams (keep under 60 chars)
- Arrows that are hard to follow

**Example of GOOD diagram:**
```
    Time   Goroutine A          Goroutine B
    ----   -----------          -----------
     1     mu1.Lock()  OK       mu2.Lock()  OK
           holds: mu1           holds: mu2

     2     mu2.Lock()  BLOCKED  mu1.Lock()  BLOCKED
           wants: mu2           wants: mu1

    Result: DEADLOCK
```

**Example of BAD diagram:**
```
    ┌──────────────┐         ┌──────────────┐
    │ Goroutine A  │         │ Goroutine B  │
    │ ┌──────────┐ │◄───────►│ ┌──────────┐ │
    │ │ waiting  │ │ blocked │ │ waiting  │ │
    │ └──────────┘ │         │ └──────────┘ │
    └──────────────┘         └──────────────┘
```
(Too many nested boxes, hard to read)

### Concurrency Section Specifics

For concurrency tutorials, additionally verify:

- [ ] Goroutine lifecycle is clear (creation, execution, termination)
- [ ] Synchronization points are identified
- [ ] Blocking behavior is explained
- [ ] Channel ownership is clear (who sends, who receives, who closes)
- [ ] Error scenarios are covered (deadlock, race, leak)
- [ ] Go memory model concepts are accurate (happens-before)

## Quick Reference

```bash
# Validate JSON
node -e "JSON.parse(require('fs').readFileSync('frontend/src/lib/languages/go.json'))"

# Extract section for review
node -e "
const data = JSON.parse(require('fs').readFileSync('frontend/src/lib/languages/go.json'));
const section = data.sections.find(s => s.id === 'SECTION_ID');
console.log(JSON.stringify(section, null, 2));
"

# Count content items
node -e "
const data = JSON.parse(require('fs').readFileSync('frontend/src/lib/languages/go.json'));
const section = data.sections.find(s => s.id === 'SECTION_ID');
console.log('Items:', section.content.length);
"

# Test Go code
go build -o /dev/null example.go  # Compile check
go run example.go                  # Run
go run -race example.go            # Race check
```
