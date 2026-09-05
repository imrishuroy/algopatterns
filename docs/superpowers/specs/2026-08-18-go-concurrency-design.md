# Go Concurrency Section Design

**Date:** 2026-08-18  
**Status:** Approved  
**Location:** `frontend/src/lib/languages/go.json`

## Overview

Add a comprehensive "Concurrency" category to go.json with 19 sections teaching Go's concurrency model from fundamentals to advanced production patterns. This content aims for textbook quality, significantly exceeding the depth of existing sections.

## Scope

### What We're Building
- 19 new sections under a single "Concurrency" category
- Estimated 18,000-22,000 lines of JSON content
- Complete coverage from goroutines to scheduler internals
- Production-focused examples and real-world use cases

### What We're Removing
Remove these 4 sections from "Go Language Fundamentals" (replaced by new content):
- `goroutines-basics`
- `channels-communication`
- `sync-primitives`
- `context-cancellation`

## Section List

All sections use `"category": "Concurrency"`. Difficulty is metadata for filtering.

| # | ID | Title | Difficulty | Est. Time |
|---|-----|-------|------------|-----------|
| 1 | `concurrency-intro` | Introduction to Concurrency | beginner | 15 min |
| 2 | `goroutines` | Goroutines | beginner | 25 min |
| 3 | `channels-basics` | Channels | beginner | 30 min |
| 4 | `buffered-channels` | Buffered Channels | beginner | 20 min |
| 5 | `channel-directions` | Channel Directions | beginner | 15 min |
| 6 | `closing-channels` | Closing Channels | intermediate | 20 min |
| 7 | `select-statement` | The select Statement | intermediate | 25 min |
| 8 | `nil-channels` | nil Channels | intermediate | 15 min |
| 9 | `waitgroups` | sync.WaitGroup | intermediate | 20 min |
| 10 | `mutexes` | Mutexes | intermediate | 25 min |
| 11 | `context-package` | The context Package | intermediate | 30 min |
| 12 | `atomic-operations` | Atomic Operations | advanced | 20 min |
| 13 | `sync-primitives` | Advanced sync Primitives | advanced | 25 min |
| 14 | `worker-pools` | Worker Pools | advanced | 30 min |
| 15 | `pipelines` | Pipelines | advanced | 30 min |
| 16 | `race-conditions` | Race Conditions | advanced | 25 min |
| 17 | `deadlocks` | Deadlocks | advanced | 20 min |
| 18 | `graceful-shutdown` | Graceful Shutdown | advanced | 25 min |
| 19 | `go-scheduler` | The Go Scheduler | advanced | 30 min |

**Total estimated time:** ~7 hours of learning content

## Content Structure Per Section

Each section follows this template:

### 1. Opening Hook (text)
- Why this concept matters
- Real problem it solves
- 2-3 sentences max

### 2. Mental Model (text + optional ASCII diagram)
- Analogy or visualization
- "Think of X as..."
- How it works conceptually

### 3. Basic Example (code)
- Simplest demonstration
- Complete, runnable with `go run`
- Heavily commented

### 4. How It Works (text + code)
- Mechanics explained
- Step-by-step behavior
- What happens under the hood

### 5. When to Use This (heading + table + code)
- Production scenarios table with columns: Scenario, How It Helps, Example
- Real-world code example
- Decision guide (when to use vs alternatives)

### 6. Variations & Edge Cases (text + code)
- Different forms/options
- Edge case behavior
- More complex examples

### 7. Common Pitfalls (warning blocks)
- What beginners get wrong
- Why it's wrong
- How to fix it

### 8. Best Practices (tip blocks)
- Idiomatic patterns
- Production considerations

### 9. Quick Reference (table or comparison)
- Summary cheat sheet
- Key points at a glance

### 10. What's Next (text)
- Connection to next topic
- "Now that you know X, you might wonder about Y..."

## Content Guidelines

### Writing Style
- Textbook quality (SICP, K&R, Donovan & Kernighan style)
- Build intuition first with analogies before syntax
- Explain "why" not just "what"
- Address questions a beginner would ask
- Reveal complexity gradually
- Short sentences, active voice
- Use "you" to address the reader directly

### Code Examples Must Be
- Complete (copy-paste runnable with `go run`)
- Minimal (ONE concept per example)
- Commented (key lines explained inline)
- Realistic (resembles production code)
- Idiomatic Go 1.22+

### Visual Elements
- ASCII diagrams for channel/goroutine interactions
- Rich descriptive mental models
- No em-dashes between words (per AGENTS.md)

### Real-World Use Cases
Every section must include production scenarios from:
- HTTP/API servers
- Database operations
- External service calls
- Background processing
- Real-time systems (WebSockets)
- File/IO operations
- Caching
- Microservices

## Content Block Types

| Type | Structure | Purpose |
|------|-----------|---------|
| `text` | `{type, text}` | Explanatory prose |
| `heading` | `{type, text, level}` | Section headers (level 3 typical) |
| `code` | `{type, code, language, filename}` | Code examples |
| `tip` | `{type, title, message}` | Helpful hints |
| `warning` | `{type, title, message}` | Cautions and pitfalls |
| `comparison` | `{type, items: [{label, description}]}` | Side-by-side comparisons |
| `table` | `{type, headers, rows}` | Tabular data |
| `complexity` | `{type, time, space, explanation}` | Big-O analysis |

## Section JSON Schema

```json
{
  "id": "goroutines",
  "title": "Goroutines",
  "category": "Concurrency",
  "difficulty": "beginner",
  "estimatedTime": "25 min",
  "content": [
    {"type": "text", "text": "..."},
    {"type": "heading", "text": "...", "level": 3},
    {"type": "code", "code": "...", "language": "go", "filename": "example.go"},
    {"type": "tip", "title": "...", "message": "..."},
    {"type": "warning", "title": "...", "message": "..."}
  ]
}
```

## Topic Coverage Matrix

Ensuring nothing is missed from reference materials:

| Topic | Section | Notes |
|-------|---------|-------|
| Concurrency vs parallelism | `concurrency-intro` | Foundation |
| Process/thread/goroutine distinction | `concurrency-intro` | Foundation |
| Goroutine creation | `goroutines` | `go` keyword |
| Anonymous goroutines | `goroutines` | Closures |
| Loop variable capture | `goroutines` | Common pitfall |
| GOMAXPROCS | `goroutines` + `go-scheduler` | Runtime control |
| Channel basics | `channels-basics` | Create, send, receive |
| Unbuffered channels | `channels-basics` | Synchronous |
| Buffered channels | `buffered-channels` | Asynchronous |
| Channel directions | `channel-directions` | Send-only, receive-only |
| Closing channels | `closing-channels` | Close behavior, panics |
| Range over channels | `closing-channels` | Iteration pattern |
| nil channels | `nil-channels` | Blocking, dynamic select |
| Signal channels | `channels-basics` | struct{} pattern |
| select statement | `select-statement` | Multiplexing |
| Timeout patterns | `select-statement` | time.After |
| Default case | `select-statement` | Non-blocking |
| sync.WaitGroup | `waitgroups` | Add, Done, Wait |
| sync.Mutex | `mutexes` | Lock, Unlock |
| sync.RWMutex | `sync-primitives` | Multiple readers |
| sync.Once | `sync-primitives` | One-time init |
| sync.Cond | `sync-primitives` | Condition variables |
| sync.Map | `sync-primitives` | Concurrent map |
| sync.Pool | `sync-primitives` | Object pooling |
| atomic package | `atomic-operations` | Atomic counters |
| semaphore package | `sync-primitives` | Weighted access |
| context.Context | `context-package` | Interface |
| WithCancel | `context-package` | Cancellation |
| WithTimeout/Deadline | `context-package` | Timeouts |
| WithValue | `context-package` | Request-scoped data |
| Worker pools | `worker-pools` | Bounded concurrency |
| errgroup | `worker-pools` | Error handling |
| Pipelines | `pipelines` | Fan-out/fan-in |
| Race conditions | `race-conditions` | Data races |
| Race detector | `race-conditions` | `go run -race` |
| Deadlocks | `deadlocks` | Detection, prevention |
| Graceful shutdown | `graceful-shutdown` | Signal handling |
| Go scheduler | `go-scheduler` | M:N, work-stealing |

## Estimated Size Per Section

| Difficulty | Lines of JSON | Content Blocks |
|------------|---------------|----------------|
| Beginner | 600-900 | 15-25 |
| Intermediate | 800-1200 | 20-30 |
| Advanced | 1000-1500 | 25-40 |

**Total:** ~18,000-22,000 lines for all 19 sections

## Migration Plan

1. Read current go.json structure
2. Identify insertion point (after "Go Language Fundamentals", before "Essential Algorithms")
3. Remove 4 existing concurrency sections from "Go Language Fundamentals"
4. Insert 19 new Concurrency sections
5. Verify all section IDs are unique across entire file
6. Validate JSON structure

## Quality Checklist

### Content Quality
- [ ] All explanations are original (not copied from go-concurrency folder)
- [ ] Writing is clearer and deeper than existing go.json sections
- [ ] Mental models and visualizations aid understanding
- [ ] Progressive complexity (no forward references to unexplained concepts)
- [ ] Each section readable in stated estimatedTime

### Real-World Relevance
- [ ] Every section has "When to Use This" with production scenarios
- [ ] Code examples reflect actual backend patterns
- [ ] Use cases span HTTP servers, databases, microservices, background jobs
- [ ] Decision guides help choose between alternatives

### Code Quality
- [ ] All examples compile and run with `go run`
- [ ] Examples are minimal, focused on ONE concept
- [ ] Code is idiomatic Go 1.22+
- [ ] Production examples are realistic, not toy code

### Practical Value
- [ ] Covers common interview scenarios
- [ ] Addresses real production concerns
- [ ] Warning blocks prevent common bugs
- [ ] Tip blocks share expert knowledge

### Structure
- [ ] Category is "Concurrency" for all sections
- [ ] IDs are unique across entire go.json
- [ ] Difficulty ratings are accurate
- [ ] Time estimates are realistic

## Implementation Approach

Given the size (~20,000 lines), implement in batches:

1. **Batch 1 (Beginner):** concurrency-intro, goroutines, channels-basics, buffered-channels, channel-directions
2. **Batch 2 (Intermediate Part 1):** closing-channels, select-statement, nil-channels
3. **Batch 3 (Intermediate Part 2):** waitgroups, mutexes, context-package
4. **Batch 4 (Advanced Part 1):** atomic-operations, sync-primitives, worker-pools
5. **Batch 5 (Advanced Part 2):** pipelines, race-conditions, deadlocks, graceful-shutdown, go-scheduler

Each batch:
- Write sections
- Validate JSON syntax
- Review for quality
- Integrate into go.json

## References

Content inspiration (write original, do not copy):
- "The Go Programming Language" by Donovan & Kernighan
- Official Go blog posts on concurrency
- "Go Concurrency Patterns" talk by Rob Pike
- "Advanced Go Concurrency Patterns" talk
- Go Memory Model documentation
- Production patterns from Kubernetes, Docker, CockroachDB
