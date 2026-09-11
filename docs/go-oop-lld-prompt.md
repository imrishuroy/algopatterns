# Go OOP & LLD Section: Implementation Prompt

## Context

The AlgoPatterns website (`frontend/src/lib/languages/go.json`) currently has:

**Existing Concurrency Section (19 sections, well-organized):**
- Progresses from beginner (goroutines) to advanced (deadlocks, scheduler)
- Each section has 30-90 content items
- Includes code examples, ASCII diagrams, tips, warnings, comparisons, outputs

**Existing OOP-Related Sections (currently in "Go Language Fundamentals"):**
- `structs-custom-types` - Struct basics, zero values, embedding, constructor pattern
- `methods-receivers` - Value vs pointer receivers
- `interfaces-polymorphism` - Interface definition, empty interface, type assertions, type switch, interface composition
- `embedding-generics` - Struct/interface embedding, generics

## Goal

Create a new **"Object-Oriented Design & LLD"** category in go.json that:
1. **Consolidates all OOP content** by moving existing OOP sections from "Go Language Fundamentals"
2. Teaches Go's approach to OOP (composition over inheritance)
3. Covers SOLID principles adapted for Go
4. Implements essential design patterns in idiomatic Go
5. Includes practical LLD interview problems with Go solutions

## Reorganization Plan

### Step 1: Move Existing Sections

**Move these 4 sections from "Go Language Fundamentals" to "Object-Oriented Design & LLD":**

| Section ID | Current Category | New Category |
|------------|------------------|--------------|
| `structs-custom-types` | Go Language Fundamentals | Object-Oriented Design & LLD |
| `methods-receivers` | Go Language Fundamentals | Object-Oriented Design & LLD |
| `interfaces-polymorphism` | Go Language Fundamentals | Object-Oriented Design & LLD |
| `embedding-generics` | Go Language Fundamentals | Object-Oriented Design & LLD |

**Keep in "Go Language Fundamentals" (14 sections):**
- error-handling, defer-panic-recover, working-with-time, regular-expressions
- constants-iota, concurrency-patterns, files-io, json-encoding
- http-client, database-sql, testing-basics, benchmarking, logging, cli-flags

### Step 2: Add New Sections

Add 20 new sections to complete the OOP & LLD learning path.

### Final Structure: 24 Sections Total

```
Object-Oriented Design & LLD
│
├── Part 1: Go's Type System (4 sections - MOVED from Fundamentals)
│   ├── structs-custom-types (beginner)
│   ├── methods-receivers (beginner)
│   ├── interfaces-polymorphism (intermediate)
│   └── embedding-generics (intermediate)
│
├── Part 2: Go's OOP Philosophy (4 sections - NEW)
│   ├── oop-intro (beginner)
│   ├── composition-patterns (beginner)
│   ├── functional-options (intermediate)
│   └── constructor-patterns (beginner)
│
├── Part 3: SOLID Principles (4 sections - NEW)
│   ├── solid-intro (intermediate)
│   ├── srp-ocp (intermediate)
│   ├── lsp-isp (intermediate)
│   └── dip-di (intermediate)
│
├── Part 4: Design Patterns (3 sections - NEW)
│   ├── creational-patterns (intermediate)
│   ├── structural-patterns (intermediate)
│   └── behavioral-patterns (intermediate)
│
├── Part 5: LLD Problems (7 sections - NEW)
│   ├── lld-intro (intermediate)
│   ├── lld-cache (advanced)
│   ├── lld-rate-limiter (advanced)
│   ├── lld-parking-lot (advanced)
│   ├── lld-logger (intermediate)
│   ├── lld-pub-sub (advanced)
│   └── lld-circuit-breaker (advanced)
│
└── Part 6: Advanced Topics (2 sections - NEW)
    ├── clean-architecture (advanced)
    └── testing-oop (intermediate)
```

### Implementation Order

**Phase 0: Reorganize (do this first)**
1. Change category of 4 existing sections to "Object-Oriented Design & LLD"
2. Reorder sections so moved sections come first

**Phase 1-5: Add new content (as described in Proposed Section Structure below)**

## Critical Requirement: Runnable Code with Outputs & Textbook Explanations

**Every section MUST follow this pattern for each concept:**

### 1. Textbook-Style Explanation (BEFORE code)

Write explanations like a university textbook, not API documentation:

```
BAD (API doc style):
"The Strategy pattern defines a family of algorithms."

GOOD (Textbook style):
"Imagine you're building a payment system. Today you support credit cards,
but tomorrow you might add UPI, wallets, or crypto. You could use a giant
switch statement, but every new payment method means changing that code.
What if the payment logic could be swapped at runtime without touching
the existing code?

This is the problem the Strategy pattern solves. Instead of hardcoding
the algorithm, you define an interface that all payment methods implement.
The main code works with the interface, completely unaware of which
concrete implementation it's using."
```

**Textbook explanation requirements:**
- Start with a relatable problem or scenario
- Build intuition before introducing terminology
- Explain WHY before showing HOW
- Use analogies (real-world comparisons)
- Define jargon when first introduced
- 2-3 paragraphs minimum per major concept
- Progressive complexity (simple case first, edge cases later)

### 2. Complete Runnable Code Example

Every code example must be:
- **Complete**: Can be copied into a file and run with `go run`
- **Self-contained**: All imports, package declaration, main() included
- **Commented**: Key lines have inline comments explaining what they do
- **Named**: Has a descriptive filename (e.g., `strategy_payment.go`)

```go
// strategy_payment.go
package main

import "fmt"

// PaymentStrategy defines the interface for all payment methods.
// Any type that implements Process() can be used as a payment strategy.
type PaymentStrategy interface {
    Process(amount float64) error
}

// CreditCard implements PaymentStrategy for credit card payments.
type CreditCard struct {
    cardNumber string
}

// Process handles the credit card payment logic.
func (c *CreditCard) Process(amount float64) error {
    fmt.Printf("Processing $%.2f via Credit Card ending in %s\n", 
        amount, c.cardNumber[len(c.cardNumber)-4:])
    return nil
}

// UPI implements PaymentStrategy for UPI payments.
type UPI struct {
    upiID string
}

func (u *UPI) Process(amount float64) error {
    fmt.Printf("Processing $%.2f via UPI ID: %s\n", amount, u.upiID)
    return nil
}

// PaymentProcessor uses any PaymentStrategy to process payments.
// It doesn't know or care which specific strategy is being used.
type PaymentProcessor struct {
    strategy PaymentStrategy  // <-- Interface, not concrete type
}

func (p *PaymentProcessor) Pay(amount float64) error {
    return p.strategy.Process(amount)  // Delegates to the strategy
}

func main() {
    // Create different payment strategies
    creditCard := &CreditCard{cardNumber: "4111111111111234"}
    upi := &UPI{upiID: "user@okbank"}

    // Use credit card strategy
    processor := &PaymentProcessor{strategy: creditCard}
    processor.Pay(100.50)

    // Switch to UPI strategy at runtime - no code changes needed!
    processor.strategy = upi
    processor.Pay(75.25)
}
```

### 3. Console Output Block (IMMEDIATELY after code)

Show the exact output when the code runs:

```
$ go run strategy_payment.go
Processing $100.50 via Credit Card ending in 1234
Processing $75.25 via UPI ID: user@okbank
```

**Output block requirements:**
- Shows the command used to run (`$ go run filename.go`)
- Shows actual output (not imagined output)
- For concurrent code, may show multiple possible outputs
- For error demonstrations, shows the error message

### 4. Output Explanation (AFTER output)

Explain what the output demonstrates:

```
The output shows both payments processed successfully, but notice that
we used the same `PaymentProcessor` for both. The first payment went
through credit card, the second through UPI. We didn't modify the
processor - we simply swapped the strategy.

This is the power of the Strategy pattern: the processor is "closed for
modification" (we don't change its code) but "open for extension" (we
can add new payment methods by creating new strategy implementations).
```

### 5. Visual Diagram (where helpful)

For complex relationships, add ASCII diagrams:

```
    PaymentProcessor
          |
          | uses
          v
    +------------------+
    | PaymentStrategy  |  <-- Interface
    +------------------+
    | Process(amount)  |
    +------------------+
          ^
          | implements
          |
    +-----+-----+
    |           |
CreditCard    UPI    (add more without changing processor)
```

### 6. Testable Code with Unit Tests

**For intermediate/advanced sections, include test examples showing how to test the pattern/implementation.**

Every testable code example should demonstrate:
- How interfaces enable easy testing (mock/stub injection)
- Table-driven tests (Go idiom)
- Edge case coverage
- How the design makes testing easier

**Test file example (strategy_payment_test.go):**

```go
// strategy_payment_test.go
package main

import (
    "errors"
    "testing"
)

// MockPaymentStrategy is a test double that records calls and can simulate failures.
type MockPaymentStrategy struct {
    ProcessedAmounts []float64  // Records all amounts processed
    ShouldFail       bool       // If true, Process returns an error
}

func (m *MockPaymentStrategy) Process(amount float64) error {
    m.ProcessedAmounts = append(m.ProcessedAmounts, amount)
    if m.ShouldFail {
        return errors.New("payment failed")
    }
    return nil
}

func TestPaymentProcessor_Pay(t *testing.T) {
    tests := []struct {
        name        string
        amount      float64
        shouldFail  bool
        wantErr     bool
    }{
        {
            name:       "successful payment",
            amount:     100.50,
            shouldFail: false,
            wantErr:    false,
        },
        {
            name:       "failed payment",
            amount:     50.00,
            shouldFail: true,
            wantErr:    true,
        },
        {
            name:       "zero amount payment",
            amount:     0,
            shouldFail: false,
            wantErr:    false,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            // Arrange: Create mock strategy
            mock := &MockPaymentStrategy{ShouldFail: tt.shouldFail}
            processor := &PaymentProcessor{strategy: mock}

            // Act: Process payment
            err := processor.Pay(tt.amount)

            // Assert: Check error expectation
            if (err != nil) != tt.wantErr {
                t.Errorf("Pay() error = %v, wantErr %v", err, tt.wantErr)
            }

            // Assert: Verify the amount was passed to strategy
            if len(mock.ProcessedAmounts) != 1 {
                t.Errorf("Expected 1 call to Process, got %d", len(mock.ProcessedAmounts))
            }
            if mock.ProcessedAmounts[0] != tt.amount {
                t.Errorf("Process called with %v, want %v", mock.ProcessedAmounts[0], tt.amount)
            }
        })
    }
}
```

**Test output block:**

```
$ go test -v strategy_payment_test.go strategy_payment.go
=== RUN   TestPaymentProcessor_Pay
=== RUN   TestPaymentProcessor_Pay/successful_payment
=== RUN   TestPaymentProcessor_Pay/failed_payment
=== RUN   TestPaymentProcessor_Pay/zero_amount_payment
--- PASS: TestPaymentProcessor_Pay (0.00s)
    --- PASS: TestPaymentProcessor_Pay/successful_payment (0.00s)
    --- PASS: TestPaymentProcessor_Pay/failed_payment (0.00s)
    --- PASS: TestPaymentProcessor_Pay/zero_amount_payment (0.00s)
PASS
ok      command-line-arguments  0.002s
```

**Test explanation:**

```
The tests demonstrate a key benefit of the Strategy pattern: testability. Because
PaymentProcessor depends on the PaymentStrategy interface (not a concrete type),
we can inject a MockPaymentStrategy that:

1. Records all calls for verification
2. Can simulate failures on demand
3. Doesn't require actual payment infrastructure

This is Dependency Inversion in action - high-level code (PaymentProcessor) depends
on an abstraction (PaymentStrategy), making it trivially testable. Notice we didn't
need any mocking framework - Go's implicit interfaces let us create test doubles
with just a struct.
```

**Testable code requirements:**
- Show mock/stub creation using interfaces
- Use table-driven tests (Go standard)
- Include positive AND negative test cases
- Show the Arrange-Act-Assert pattern
- Demonstrate how the design enables testing
- Include test output showing all tests pass

**When to include tests:**
| Section Type | Include Tests? |
|--------------|----------------|
| OOP Intro | No (too basic) |
| Design Patterns | Yes (shows testability benefit) |
| SOLID Principles | Yes (especially DIP) |
| LLD Problems | Yes (mandatory, full coverage) |
| Clean Architecture | Yes (layer isolation) |

### Complete Section Flow Example

For each concept in a section, follow this exact flow:

```
1. HOOK: Why should I care about this?
   "Imagine you're building..."

2. PROBLEM: What problem does this solve?
   "Without this pattern, you'd have to..."

3. CONCEPT: What is the solution?
   "The Strategy pattern defines..."

4. DIAGRAM: Visual representation
   (ASCII diagram of relationships)

5. CODE: Complete runnable example
   (Full code with comments)

6. OUTPUT: What happens when you run it
   ($ go run ... followed by output)

7. EXPLANATION: What does the output prove?
   "Notice that the output shows..."

8. TEST CODE: How to test this (for intermediate+ sections)
   (Complete test file with mocks/stubs)

9. TEST OUTPUT: Show tests passing
   ($ go test -v ... followed by output)

10. TEST EXPLANATION: Why is this testable?
    "Notice how interfaces enable mocking..."

11. PITFALLS: What can go wrong?
    (Warning blocks)

12. BEST PRACTICES: How to use it well
    (Tip blocks)

13. TRANSITION: What's next?
    "Now that you understand Strategy, let's see how..."
```

**Visual flow for sections with tests:**

```
┌─────────────────────────────────────────────────────────────┐
│  EXPLANATION → DIAGRAM → CODE → OUTPUT → OUTPUT EXPLANATION │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  TEST CODE → TEST OUTPUT → TEST EXPLANATION                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  PITFALLS (warnings) → BEST PRACTICES (tips) → TRANSITION   │
└─────────────────────────────────────────────────────────────┘
```

## Proposed Section Structure

### Part 1: Go's Type System (MOVED from "Go Language Fundamentals")

> **Note:** These 4 sections already exist. Only change their `category` field to "Object-Oriented Design & LLD" and ensure they appear first in the section order.

#### Section 1: `structs-custom-types` - "Structs: Define Custom Types and Data Structures"
**Difficulty:** beginner | **Time:** 25 min | **Status:** EXISTS - MOVE ONLY

Already covers:
- Defining structs, zero values, named fields
- Comparing structs, embedded structs
- Anonymous structs, struct tags
- Constructor pattern (NewXxx), common mistakes

**Review during move:** Ensure textbook-style explanations, runnable code with outputs.

#### Section 2: `methods-receivers` - "Methods: Value and Pointer Receivers Explained"
**Difficulty:** beginner | **Time:** 20 min | **Status:** EXISTS - MOVE ONLY

Already covers:
- Value receivers vs pointer receivers
- When to use each
- Method sets and interface satisfaction

**Review during move:** Ensure textbook-style explanations, runnable code with outputs.

#### Section 3: `interfaces-polymorphism` - "Interfaces: Polymorphism and Type Assertions"
**Difficulty:** intermediate | **Time:** 30 min | **Status:** EXISTS - MOVE ONLY

Already covers:
- Defining and implementing interfaces
- Empty interface (any), type assertions, type switch
- Interface composition, common standard library interfaces
- Compile-time interface check, nil interface gotcha

**Review during move:** Ensure textbook-style explanations, runnable code with outputs. Add tests if missing.

#### Section 4: `embedding-generics` - "Embedding and Generics: Composition and Type Parameters"
**Difficulty:** intermediate | **Time:** 25 min | **Status:** EXISTS - MOVE ONLY

Already covers:
- Struct embedding basics, method shadowing
- Interface embedding
- Generic functions, type constraints, generic types

**Review during move:** Ensure textbook-style explanations, runnable code with outputs. Add tests if missing.

---

### Part 2: Go's OOP Philosophy (NEW)

#### Section 5: `oop-intro` - "OOP in Go: A Different Approach"
**Difficulty:** beginner | **Time:** 20 min | **Status:** NEW

Content:
- Why Go doesn't have classes or inheritance
- Go's philosophy: "Accept interfaces, return structs"
- Composition vs inheritance mental model
- When Go's approach is better/worse than traditional OOP
- Comparison table: Go vs Java/Python OOP
- Code example: Same problem solved with inheritance (pseudocode) vs Go composition

Key headings:
- The Case Against Inheritance
- Go's Building Blocks: Structs, Methods, Interfaces
- Composition Over Inheritance: A Mental Model
- When Traditional OOP Patterns Don't Fit Go

#### Section 6: `composition-patterns` - "Composition Patterns in Go"
**Difficulty:** beginner | **Time:** 25 min | **Status:** NEW

Content:
- Struct embedding deep dive (promotion, shadowing)
- Interface embedding patterns
- The "has-a" vs "is-a" relationship in Go
- Building complex types from simple ones
- ASCII diagram: Composition relationships
- Real-world example: Building a logger with composition

Key headings:
- Struct Embedding: Method Promotion
- Interface Embedding: Combining Behaviors
- Designing with Composition
- Common Composition Mistakes
- When Embedding Goes Wrong

#### Section 7: `functional-options` - "Functional Options Pattern"
**Difficulty:** intermediate | **Time:** 20 min | **Status:** NEW

Content:
- The problem: Too many constructor parameters
- Functional options explained
- Implementing the pattern step by step
- Default values and validation
- Comparison: Options struct vs functional options
- Real-world example: HTTP server configuration

Key headings:
- The Constructor Problem
- Introducing Functional Options
- Building an Options-Based API
- When to Use This Pattern
- Standard Library Examples (http.Server)

#### Section 8: `constructor-patterns` - "Constructor Patterns in Go"
**Difficulty:** beginner | **Time:** 20 min | **Status:** NEW

Content:
- The `NewXxx` convention
- Simple constructors with validation
- Factory functions returning interfaces
- Builder pattern for complex objects
- Object pool pattern basics
- Error handling in constructors

Key headings:
- The NewXxx Convention
- Simple Constructors
- Factory Functions
- The Builder Pattern
- Returning Interfaces vs Structs

---

### Part 3: SOLID Principles in Go (NEW)

#### Section 9: `solid-intro` - "SOLID Principles: A Go Perspective"
**Difficulty:** intermediate | **Time:** 15 min

Content:
- What SOLID means and why it matters
- How Go's design naturally encourages some SOLID principles
- Overview of each principle with Go lens
- When to apply vs when to keep it simple (KISS)

Key headings:
- What is SOLID?
- Go's Natural Alignment with SOLID
- When SOLID Helps (and When It Doesn't)
- The Go Philosophy: Simplicity First

#### Section 10: `srp-ocp` - "Single Responsibility & Open-Closed Principles"
**Difficulty:** intermediate | **Time:** 25 min | **Status:** NEW

Content:
- **SRP:** One reason to change
  - Go packages as SRP boundaries
  - Splitting large structs
  - Code example: Refactoring a monolithic handler
- **OCP:** Open for extension, closed for modification
  - Interfaces enable OCP naturally
  - Plugin architecture example
  - Code example: Payment processor with new payment methods

Key headings:
- Single Responsibility: One Job Per Type
- SRP at the Package Level
- Open-Closed: Extending Without Modifying
- Interfaces as Extension Points
- Practical Examples

#### Section 11: `lsp-isp` - "Liskov Substitution & Interface Segregation"
**Difficulty:** intermediate | **Time:** 25 min | **Status:** NEW

Content:
- **LSP:** Subtypes must be substitutable
  - Go's implicit interfaces enforce LSP
  - Behavioral contracts
  - Code example: Violating LSP with square/rectangle
- **ISP:** Clients shouldn't depend on unused methods
  - Small interfaces are Go's strength
  - The `io.Reader` / `io.Writer` example
  - Code example: Breaking up a fat interface

Key headings:
- Liskov Substitution in Go
- Interface Contracts
- Interface Segregation: Keep It Small
- The Power of Single-Method Interfaces
- Standard Library Wisdom (io.Reader)

#### Section 12: `dip-di` - "Dependency Inversion & Injection"
**Difficulty:** intermediate | **Time:** 30 min | **Status:** NEW

Content:
- **DIP:** Depend on abstractions, not concretions
  - Consumer-defined interfaces in Go
  - High-level modules shouldn't depend on low-level
- **Dependency Injection:**
  - Constructor injection (most common in Go)
  - Method injection
  - Manual DI vs DI frameworks (wire)
  - Code example: Service with injected dependencies

Key headings:
- Dependency Inversion Explained
- Consumer-Defined Interfaces
- Dependency Injection in Go
- Constructor Injection Pattern
- When to Use a DI Framework

---

### Part 4: Design Patterns in Go (NEW)

#### Section 13: `creational-patterns` - "Creational Patterns: Factory, Builder, Singleton"
**Difficulty:** intermediate | **Time:** 35 min | **Status:** NEW

Content:
- **Factory Pattern:**
  - Simple factory functions
  - Abstract factory with interfaces
  - Code example: Database connection factory
- **Builder Pattern:**
  - Method chaining in Go
  - Immutable builders
  - Code example: Query builder
- **Singleton Pattern:**
  - Using `sync.Once` for thread safety
  - Why singletons are often avoided in Go
  - Code example: Application config singleton

Key headings:
- Factory Pattern
- Abstract Factory
- Builder Pattern
- Singleton with sync.Once
- Object Pool Pattern (brief)

#### Section 14: `structural-patterns` - "Structural Patterns: Adapter, Decorator, Facade"
**Difficulty:** intermediate | **Time:** 35 min | **Status:** NEW

Content:
- **Adapter Pattern:**
  - Making incompatible interfaces work together
  - Code example: Adapting third-party logger
- **Decorator Pattern:**
  - Adding behavior without changing original
  - HTTP middleware as decorators
  - Code example: Logging decorator for handlers
- **Facade Pattern:**
  - Simplifying complex subsystems
  - Code example: Payment facade

Key headings:
- Adapter: Bridging Interfaces
- Decorator: Wrapping for Extra Behavior
- HTTP Middleware as Decorators
- Facade: Simplifying Complexity
- Proxy Pattern (brief)

#### Section 15: `behavioral-patterns` - "Behavioral Patterns: Strategy, Observer, Command"
**Difficulty:** intermediate | **Time:** 35 min | **Status:** NEW

Content:
- **Strategy Pattern:**
  - Interchangeable algorithms
  - Most common pattern in LLD interviews
  - Code example: Payment strategies (credit card, UPI, wallet)
- **Observer Pattern:**
  - Event notification system
  - Go channels as observers
  - Code example: Stock price notifier
- **Command Pattern:**
  - Encapsulating requests as objects
  - Undo/redo support
  - Code example: Text editor commands

Key headings:
- Strategy: Interchangeable Algorithms
- Observer: Notification System
- Command: Request as Object
- Template Method Pattern (brief)
- State Pattern (brief)

---

### Part 5: LLD Interview Problems (NEW)

#### Section 16: `lld-intro` - "Low-Level Design: Approach & Methodology"
**Difficulty:** intermediate | **Time:** 20 min | **Status:** NEW

Content:
- What LLD interviews test
- The structured approach: Requirements → Objects → Interactions
- Common patterns across LLD problems
- Go-specific considerations (concurrency, interfaces)
- Example walkthrough: Problem decomposition

Key headings:
- What is LLD?
- The Structured Approach
- Identifying Entities and Relationships
- Go's Advantages in LLD
- Common Patterns Across Problems

#### Section 17: `lld-cache` - "Design: In-Memory Cache"
**Difficulty:** advanced | **Time:** 40 min | **Status:** NEW

Content:
- Requirements: Get, Put, TTL, eviction policies, thread-safe
- Interface design first
- Implementing LRU cache with doubly linked list + map
- Adding TTL support
- Thread safety with `sync.RWMutex`
- Extending to LFU
- Complete runnable code with tests

Key headings:
- Requirements Analysis
- Interface Design
- LRU Cache Implementation
- Adding TTL Support
- Making It Thread-Safe
- Extending to LFU
- Testing the Cache

#### Section 18: `lld-rate-limiter` - "Design: Rate Limiter"
**Difficulty:** advanced | **Time:** 40 min | **Status:** NEW

Content:
- Requirements: Per-key limits, configurable rates, thread-safe
- Token bucket algorithm explained
- Sliding window algorithm explained
- Implementation with `sync.Mutex`
- Distributed considerations (brief)
- Complete runnable code

Key headings:
- Requirements Analysis
- Token Bucket Algorithm
- Sliding Window Algorithm
- Implementation
- Per-Key Rate Limiting
- Testing and Edge Cases

#### Section 19: `lld-parking-lot` - "Design: Parking Lot System"
**Difficulty:** advanced | **Time:** 45 min | **Status:** NEW

Content:
- Requirements: Multiple floors, vehicle types, pricing, concurrency
- Entity identification: ParkingLot, Floor, Spot, Vehicle, Ticket
- Interface design
- Strategy pattern for pricing
- Thread-safe spot allocation
- Complete implementation

Key headings:
- Requirements Gathering
- Entity Design
- Relationships and Interactions
- Pricing Strategy
- Concurrent Parking
- Complete Implementation

#### Section 20: `lld-logger` - "Design: Logging Framework"
**Difficulty:** intermediate | **Time:** 35 min | **Status:** NEW

Content:
- Requirements: Multiple levels, multiple outputs, structured logs
- Interface design (Logger, Handler, Formatter)
- Chain of responsibility for log levels
- Decorator pattern for adding context
- Complete implementation resembling log4j/slog

Key headings:
- Requirements Analysis
- Core Interfaces
- Log Levels with Chain of Responsibility
- Multiple Handlers
- Structured Logging
- Complete Implementation

#### Section 21: `lld-pub-sub` - "Design: Pub/Sub Message System"
**Difficulty:** advanced | **Time:** 40 min | **Status:** NEW

Content:
- Requirements: Topics, subscribers, async delivery, backpressure
- Using Go channels for message delivery
- Fan-out pattern
- Subscriber management
- Graceful shutdown
- Complete implementation

Key headings:
- Requirements Analysis
- Core Design
- Topic and Subscriber Management
- Async Message Delivery
- Handling Backpressure
- Complete Implementation

#### Section 22: `lld-circuit-breaker` - "Design: Circuit Breaker"
**Difficulty:** advanced | **Time:** 35 min | **Status:** NEW

Content:
- Requirements: Closed/Open/Half-Open states, configurable thresholds
- State machine design
- Rolling window for failure counting
- Thread-safe state transitions
- Integration with HTTP client
- Complete implementation

Key headings:
- The Circuit Breaker Pattern
- State Machine Design
- Failure Tracking
- State Transitions
- Integration Example
- Complete Implementation

---

### Part 6: Advanced OOP Topics (NEW)

#### Section 23: `clean-architecture` - "Clean Architecture in Go"
**Difficulty:** advanced | **Time:** 30 min | **Status:** NEW

Content:
- Layers: Entities, Use Cases, Interfaces, Infrastructure
- Dependency rule (point inward)
- Package structure example
- Interface boundaries between layers
- Testing each layer independently
- Real project example structure

Key headings:
- Clean Architecture Overview
- The Dependency Rule
- Package Structure
- Interface Boundaries
- Testing Strategies
- Example: User Registration Flow

#### Section 24: `testing-oop` - "Testing OOP Code in Go"
**Difficulty:** intermediate | **Time:** 25 min | **Status:** NEW

Content:
- Interface-based testing
- Creating test doubles (stubs, mocks, fakes)
- Table-driven tests for polymorphic code
- Testing with dependency injection
- Integration testing patterns

Key headings:
- Testing with Interfaces
- Stubs, Mocks, and Fakes
- Table-Driven Tests
- Testing Injected Dependencies
- Integration Testing

---

## Section Summary

| Part | Sections | Status |
|------|----------|--------|
| Part 1: Go's Type System | 1-4 | MOVE from Fundamentals |
| Part 2: Go's OOP Philosophy | 5-8 | NEW |
| Part 3: SOLID Principles | 9-12 | NEW |
| Part 4: Design Patterns | 13-15 | NEW |
| Part 5: LLD Problems | 16-22 | NEW |
| Part 6: Advanced Topics | 23-24 | NEW |
| **Total** | **24 sections** | 4 moved + 20 new |

## Content Standards (Enhanced for OOP/LLD)

### Required Elements Per Section

1. **Opening Hook:** Why this topic matters (2-3 paragraphs, story-driven)
2. **Problem Statement:** What problem does this solve? (with concrete scenario)
3. **Mental Model:** Analogy or visual to aid understanding
4. **ASCII Diagram:** For relationships, data flow, state transitions
5. **Runnable Code Examples:** EVERY example must compile and run
6. **Console Output:** EVERY code example followed by actual output
7. **Output Explanation:** What the output proves/demonstrates
8. **Comparison Tables:** When comparing approaches (with pros/cons)
9. **Tips/Warnings:** Best practices and common mistakes
10. **Quick Reference:** End-of-section summary table
11. **Transition:** How this connects to the next topic

### Textbook-Style Explanation Requirements

**For EVERY concept, explain in this order:**

1. **The Problem** (1-2 paragraphs)
   - Start with a relatable scenario
   - Show what happens WITHOUT the pattern/concept
   - Make the reader feel the pain

2. **The Solution Concept** (2-3 paragraphs)
   - Introduce the pattern/concept name
   - Explain the core idea in plain English
   - Use an analogy from everyday life

3. **How It Works** (2-3 paragraphs)
   - Step-by-step breakdown
   - Define any new terminology
   - Connect to Go-specific implementation

4. **Visual Representation**
   - ASCII diagram showing structure
   - Flow diagram for processes
   - State diagram for state machines

**Example of good textbook explanation:**

```
The Problem:

You're building an e-commerce checkout system. Today it supports credit cards.
Next month, the business wants UPI. The month after, wallets. Each payment
method has completely different logic - credit cards need CVV verification,
UPI needs VPA validation, wallets need balance checks.

The naive approach is a giant switch statement:

    switch paymentType {
    case "credit_card": // 50 lines of credit card logic
    case "upi":         // 40 lines of UPI logic  
    case "wallet":      // 60 lines of wallet logic
    }

Every new payment method means modifying this function. It violates the
Open-Closed Principle and becomes a maintenance nightmare.

The Solution:

The Strategy pattern solves this by defining a common interface that all
payment methods implement. Think of it like electrical outlets - your laptop
charger has a standard plug that works in any outlet. The outlet doesn't
care if it's charging a laptop, phone, or toaster. It just provides power
through a standard interface.

Similarly, our checkout system works with a PaymentStrategy interface. It
doesn't know or care whether it's processing credit cards or crypto. It
just calls Process() and the concrete strategy handles the details.
```

### Code Example Requirements (MANDATORY)

**Every code example MUST have ALL of these:**

```
┌─────────────────────────────────────────────────────────────┐
│  1. FILENAME COMMENT                                        │
│     // strategy_payment.go                                  │
├─────────────────────────────────────────────────────────────┤
│  2. PACKAGE DECLARATION                                     │
│     package main                                            │
├─────────────────────────────────────────────────────────────┤
│  3. IMPORTS (only what's used)                              │
│     import "fmt"                                            │
├─────────────────────────────────────────────────────────────┤
│  4. TYPE DEFINITIONS with doc comments                      │
│     // PaymentStrategy defines the contract for payments.   │
│     type PaymentStrategy interface { ... }                  │
├─────────────────────────────────────────────────────────────┤
│  5. IMPLEMENTATION with inline comments on key lines        │
│     func (c *CreditCard) Process(amount float64) error {    │
│         // Validate card before processing                  │
│         ...                                                 │
│     }                                                       │
├─────────────────────────────────────────────────────────────┤
│  6. MAIN FUNCTION demonstrating usage                       │
│     func main() {                                           │
│         // Create and use different strategies              │
│         ...                                                 │
│     }                                                       │
└─────────────────────────────────────────────────────────────┘
```

**Immediately after EVERY code block, include:**

```
┌─────────────────────────────────────────────────────────────┐
│  OUTPUT BLOCK                                               │
│  $ go run strategy_payment.go                               │
│  Processing $100.50 via Credit Card ending in 1234          │
│  Processing $75.25 via UPI ID: user@okbank                  │
└─────────────────────────────────────────────────────────────┘
```

**Then explain the output:**

```
┌─────────────────────────────────────────────────────────────┐
│  OUTPUT EXPLANATION (1-2 paragraphs)                        │
│                                                             │
│  "The output shows both payments succeeded using the same   │
│  PaymentProcessor. Notice we didn't modify the processor    │
│  code - we simply swapped the strategy. This is OCP in      │
│  action: closed for modification, open for extension."      │
└─────────────────────────────────────────────────────────────┘
```

### Content Types (JSON structure)

```json
{
  "type": "text" | "heading" | "code" | "output" | "tip" | "warning" | "comparison" | "table"
}
```

**Required sequence for each concept:**
1. `text` - Problem explanation
2. `text` - Solution concept  
3. `text` - How it works
4. `code` - Complete runnable example
5. `output` - Console output
6. `text` - Output explanation
7. `tip` or `warning` - Best practices/pitfalls

### LLD Section Special Requirements

For LLD problems (cache, rate limiter, parking lot, etc.), include:

1. **Requirements Table:**
```
| Requirement | Type | Priority |
|-------------|------|----------|
| Thread-safe operations | Non-functional | Must have |
| O(1) get/put | Non-functional | Must have |
| TTL support | Functional | Should have |
```

2. **Entity Diagram:**
```
Cache
  |-- capacity: int
  |-- items: map[string]*Item
  |-- evictionPolicy: EvictionPolicy (interface)
  |-- mu: sync.RWMutex

Item
  |-- key: string
  |-- value: any
  |-- expiry: time.Time
  |-- frequency: int (for LFU)
```

3. **Test Cases in Code:**
```go
func main() {
    cache := NewLRUCache(3)
    
    // Test 1: Basic get/put
    cache.Put("a", 1)
    fmt.Println(cache.Get("a")) // Expected: 1, true
    
    // Test 2: Eviction
    cache.Put("b", 2)
    cache.Put("c", 3)
    cache.Put("d", 4) // Should evict "a"
    fmt.Println(cache.Get("a")) // Expected: 0, false
}
```

4. **Complexity Analysis:**
```
| Operation | Time | Space |
|-----------|------|-------|
| Get       | O(1) | -     |
| Put       | O(1) | -     |
| Overall   | -    | O(n)  |
```

### Difficulty Progression

| Level | Sections |
|-------|----------|
| beginner | oop-intro, composition-patterns, constructor-patterns |
| intermediate | functional-options, solid-*, creational-patterns, structural-patterns, behavioral-patterns, lld-intro, lld-logger, testing-oop |
| advanced | lld-cache, lld-rate-limiter, lld-parking-lot, lld-pub-sub, lld-circuit-breaker, clean-architecture |

## Implementation Guidelines

### Phase 0: Reorganize Existing Content (DO THIS FIRST)

**Step 1:** Change category for these 4 sections from "Go Language Fundamentals" to "Object-Oriented Design & LLD":
```javascript
// In go.json, find each section and update:
section.category = "Object-Oriented Design & LLD"
```

| Section ID | Change |
|------------|--------|
| `structs-custom-types` | category → "Object-Oriented Design & LLD" |
| `methods-receivers` | category → "Object-Oriented Design & LLD" |
| `interfaces-polymorphism` | category → "Object-Oriented Design & LLD" |
| `embedding-generics` | category → "Object-Oriented Design & LLD" |

**Step 2:** Reorder sections array so OOP sections appear together (after Concurrency).

**Step 3:** Review moved sections for quality:
- Ensure textbook-style explanations
- Ensure runnable code with outputs
- Add tests if missing (especially for interfaces, embedding)

### Phase 1: OOP Philosophy (4 NEW sections)
5. `oop-intro`
6. `composition-patterns`
7. `functional-options`
8. `constructor-patterns`

### Phase 2: SOLID (4 NEW sections)
9. `solid-intro`
10. `srp-ocp`
11. `lsp-isp`
12. `dip-di`

### Phase 3: Design Patterns (3 NEW sections)
13. `creational-patterns`
14. `structural-patterns`
15. `behavioral-patterns`

### Phase 4: LLD Problems (7 NEW sections)
16. `lld-intro`
17. `lld-cache`
18. `lld-rate-limiter`
19. `lld-parking-lot`
20. `lld-logger`
21. `lld-pub-sub`
22. `lld-circuit-breaker`

### Phase 5: Advanced (2 NEW sections)
23. `clean-architecture`
24. `testing-oop`

## Relationship to Existing Content

### Sections Being MOVED (not duplicated)
- `structs-custom-types` → Moved to OOP category
- `methods-receivers` → Moved to OOP category
- `interfaces-polymorphism` → Moved to OOP category
- `embedding-generics` → Moved to OOP category

### Cross-Reference from New Sections
- New OOP sections should build on the moved fundamentals
- Example: `composition-patterns` can say "Building on what you learned in the Structs section..."
- LLD problems should reference Concurrency sections for sync primitives (mutexes, channels)

### What Stays in "Go Language Fundamentals" (14 sections)
- error-handling, defer-panic-recover, working-with-time
- regular-expressions, constants-iota, concurrency-patterns
- files-io, json-encoding, http-client, database-sql
- testing-basics, benchmarking, logging, cli-flags

## Example Section Structure (JSON)

```json
{
  "id": "lld-cache",
  "title": "Design: In-Memory Cache",
  "category": "Object-Oriented Design & LLD",
  "difficulty": "advanced",
  "estimatedTime": "40 min",
  "prerequisites": ["interfaces-polymorphism", "mutexes"],
  "content": [
    {
      "type": "text",
      "content": "The in-memory cache is one of the most frequently asked LLD interview problems..."
    },
    {
      "type": "heading",
      "level": 3,
      "text": "Requirements Analysis"
    },
    // ... more content items
  ]
}
```

## Research Sources

- [Go Interfaces: Design Patterns & Best Practices](https://blog.marcnuri.com/go-interfaces-design-patterns-and-best-practices)
- [Refactoring.guru Design Patterns in Go](https://refactoring.guru/design-patterns/go)
- [awesome-low-level-design GitHub](https://github.com/ashishps1/awesome-low-level-design)
- [Hello Interview LLD Patterns](https://www.hellointerview.com/learn/low-level-design/in-a-hurry/patterns)
- [Interface Composition in Go](https://leapcell.io/blog/interface-composition-and-best-practices-in-go)
- [Effective Go](https://go.dev/doc/effective_go)
- [Go by Example](https://gobyexample.com)
- [Common LLD Interview Problems](https://medium.com/@chakresh0108/ultimate-list-of-lld-machine-coding-concurrency-design-questions-for-interviews)

## Quality Checklist (Per Section)

- [ ] All code compiles and runs
- [ ] All outputs match actual execution
- [ ] Technical claims verified against Go docs
- [ ] Difficulty rating appropriate
- [ ] Estimated time realistic
- [ ] ASCII diagrams use simple characters
- [ ] No em-dashes between words
- [ ] Transitions to next section included
- [ ] Prerequisites accurate

## Notes for Implementation

1. **Start with Phase 1** to establish the foundation
2. **Review existing OOP sections** before starting to avoid duplication
3. **Use the review-go-tutorial skill** to verify each section after creation
4. **Consider creating a `review-go-oop` skill** similar to the concurrency one
5. **Run all code examples** with `go run` and `go run -race` before including
6. **Keep LLD solutions practical** - not over-engineered, but interview-ready
