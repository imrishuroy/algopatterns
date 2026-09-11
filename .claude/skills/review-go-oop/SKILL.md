---
name: review-go-oop
description: >
  Review and improve Go OOP & LLD tutorial sections in go.json. Checks structure, code correctness,
  design pattern accuracy, LLD solution quality, and beginner-friendliness. Extracts and verifies
  all code examples compile and run correctly. Applies fixes and re-verifies.
  Use when asked to review, check, or improve Go OOP/LLD tutorial content.
---

# Go OOP & LLD Section Review

This skill reviews Go OOP and LLD tutorial sections in `frontend/src/lib/languages/go.json` for correctness, quality, and completeness.

## How to Use This Skill

### Slash Command (Quickest)

```
/review-go-oop section:<section-id>
```

Or with more detail:
```
/review-go-oop section: lld-cache, mode: review and fix
```

### Invocation Methods

**Method 1: Slash command**
```
/review-go-oop section:<section-id>
```

**Method 2: Direct request**
```
Review the LLD cache section in the Go tutorial
```

**Method 3: Review and fix**
```
Review and fix the creational-patterns section in go.json
```

**Method 4: Review only (no fixes)**
```
Review the solid-intro section but don't make changes yet
```

**Method 5: Review all OOP sections**
```
Review all Go OOP tutorial sections one by one
```

### Available Sections

To see all available OOP/LLD sections in go.json:
```bash
node -e "
const data = JSON.parse(require('fs').readFileSync('frontend/src/lib/languages/go.json'));
data.sections
  .filter(s => s.category === 'Object-Oriented Design & LLD')
  .forEach(s => console.log(s.id + ' - ' + s.title));
"
```

Expected OOP/LLD sections (24 total):

**Part 1: Go's Type System (MOVED from Fundamentals)**
- `structs-custom-types` - Structs: Define Custom Types and Data Structures
- `methods-receivers` - Methods: Value and Pointer Receivers Explained
- `interfaces-polymorphism` - Interfaces: Polymorphism and Type Assertions
- `embedding-generics` - Embedding and Generics: Composition and Type Parameters

**Part 2: Go's OOP Philosophy (NEW)**
- `oop-intro` - OOP in Go: A Different Approach
- `composition-patterns` - Composition Patterns in Go
- `functional-options` - Functional Options Pattern
- `constructor-patterns` - Constructor Patterns in Go

**Part 3: SOLID Principles (NEW)**
- `solid-intro` - SOLID Principles: A Go Perspective
- `srp-ocp` - Single Responsibility & Open-Closed Principles
- `lsp-isp` - Liskov Substitution & Interface Segregation
- `dip-di` - Dependency Inversion & Injection

**Part 4: Design Patterns (NEW)**
- `creational-patterns` - Creational Patterns: Factory, Builder, Singleton
- `structural-patterns` - Structural Patterns: Adapter, Decorator, Facade
- `behavioral-patterns` - Behavioral Patterns: Strategy, Observer, Command

**Part 5: LLD Problems (NEW)**
- `lld-intro` - Low-Level Design: Approach & Methodology
- `lld-cache` - Design: In-Memory Cache
- `lld-rate-limiter` - Design: Rate Limiter
- `lld-parking-lot` - Design: Parking Lot System
- `lld-logger` - Design: Logging Framework
- `lld-pub-sub` - Design: Pub/Sub Message System
- `lld-circuit-breaker` - Design: Circuit Breaker

**Part 6: Advanced Topics (NEW)**
- `clean-architecture` - Clean Architecture in Go
- `testing-oop` - Testing OOP Code in Go

### Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| Section | Which section to review | "lld-cache", "behavioral-patterns" |
| Mode | Review only or review+fix | "review only", "review and fix" |
| Scope | What to check | "code only", "full review" |

## Review Process

### Phase 1: Extract and Read Section

1. Read the section from `frontend/src/lib/languages/go.json`
2. Parse all content items (text, code, tables, warnings, tips, etc.)
3. Identify all code examples by filename

### Phase 2: Structure Check

Verify the section includes:

- [ ] Opening hook explaining why this topic matters (2-3 paragraphs, story-driven)
- [ ] Problem statement with concrete scenario
- [ ] Mental model or analogy to aid understanding
- [ ] ASCII visualization (for relationships, data flow, state)
- [ ] Basic, complete, runnable code example
- [ ] Console output block immediately after EVERY code example
- [ ] Output explanation (what the output proves)
- [ ] Comparison table for approaches/methods (where applicable)
- [ ] Production/real-world code example
- [ ] Warning blocks covering common pitfalls
- [ ] Tip blocks covering best practices
- [ ] Quick reference section
- [ ] Clear transition to the next section

### Phase 2.5: Textbook-Style Explanation Check

**For EVERY major concept, verify this sequence exists:**

1. **Problem Explanation** (1-2 text blocks)
   - [ ] Starts with relatable scenario ("Imagine you're building...")
   - [ ] Shows what happens WITHOUT the concept/pattern
   - [ ] Makes the reader feel the pain of the problem
   - [ ] NO code yet - pure explanation

2. **Solution Concept** (1-2 text blocks)
   - [ ] Introduces the pattern/concept name
   - [ ] Explains core idea in plain English (no jargon)
   - [ ] Uses real-world analogy
   - [ ] Defines any new terminology

3. **How It Works** (1-2 text blocks)
   - [ ] Step-by-step breakdown
   - [ ] Connects to Go-specific implementation
   - [ ] Prepares reader for the code

4. **Visual Diagram** (code block with ASCII)
   - [ ] Shows relationships between types
   - [ ] Uses simple characters (not complex Unicode)
   - [ ] Labels are clear and descriptive

5. **Complete Code Example** (code block)
   - [ ] Filename comment at top
   - [ ] Package declaration
   - [ ] All necessary imports
   - [ ] Type definitions with doc comments
   - [ ] Implementation with inline comments on KEY lines
   - [ ] main() function demonstrating usage
   - [ ] Multiple use cases shown in main()

6. **Console Output** (output block)
   - [ ] Shows `$ go run filename.go`
   - [ ] Shows actual output (not imagined)
   - [ ] Immediately follows the code block

7. **Output Explanation** (text block)
   - [ ] Explains what the output demonstrates
   - [ ] Connects output back to the concept
   - [ ] "Notice that..." style explanation

**Red flags to catch:**
- Code without output block following it
- Output without explanation
- Jargon used before being defined
- "This pattern does X" without explaining why you'd want X
- Code that doesn't compile or run
- Output that doesn't match actual execution

**For Design Pattern sections:**
- [ ] Problem statement: What problem does this pattern solve?
- [ ] UML or ASCII diagram showing class/interface relationships
- [ ] When to use / when NOT to use the pattern
- [ ] Go-specific considerations (interfaces, embedding, channels)
- [ ] Comparison with traditional OOP languages (if relevant)
- [ ] Real-world example from Go standard library or popular packages

**For LLD Problem sections:**
- [ ] Clear requirements analysis (functional & non-functional)
- [ ] Entity/interface identification
- [ ] Relationship mapping (ASCII diagram)
- [ ] Design patterns used (and why)
- [ ] Thread-safety considerations
- [ ] Complete, runnable implementation
- [ ] Test cases demonstrating key functionality
- [ ] Time/space complexity analysis
- [ ] Extension possibilities mentioned

**For SOLID Principle sections:**
- [ ] Clear definition of the principle
- [ ] Go-specific interpretation (not just Java-style OOP)
- [ ] Violation example (what NOT to do)
- [ ] Correct example (what TO do)
- [ ] Connection to Go idioms (interfaces, packages, etc.)

### Phase 3: Code Verification

For EVERY code example in the section:

```bash
# 1. Extract code to temp file
# 2. Attempt compilation
go build -o /dev/null example.go

# 3. Run the code
go run example.go

# 4. For concurrent code, run with race detector
go run -race example.go

# 5. Compare actual output to documented output
```

Check each code example for:

- [ ] Compiles successfully with `go build`
- [ ] Runs without errors
- [ ] Output matches what documentation claims
- [ ] No unintended race conditions (verify with `-race`)
- [ ] Follows Go naming conventions (MixedCaps, not snake_case)
- [ ] Interfaces are small and focused
- [ ] Consumer-defined interfaces (Go idiom)
- [ ] No "Java in Go" patterns (excessive getters/setters, deep inheritance)
- [ ] Error handling follows Go conventions
- [ ] Context usage is correct (if applicable)
- [ ] Imports match actual usage
- [ ] Follows idiomatic Go 1.22+ practices

### Phase 3.5: Test Code Verification

**For intermediate/advanced sections, verify test examples exist and work:**

**When tests are REQUIRED:**
| Section Type | Tests Required? |
|--------------|-----------------|
| OOP Intro (beginner) | No |
| Composition Patterns | Optional |
| Design Patterns | Yes |
| SOLID Principles (especially DIP) | Yes |
| LLD Problems | Yes (mandatory, comprehensive) |
| Clean Architecture | Yes |
| Testing OOP | Yes (it's about testing!) |

**For each test example, verify:**

```bash
# 1. Extract both main code and test code to temp files
# 2. Run tests
go test -v example_test.go example.go

# 3. For concurrent code, run with race detector
go test -race -v example_test.go example.go

# 4. Compare actual test output to documented output
```

**Test code checklist:**

- [ ] Test file exists for sections that require it
- [ ] Tests compile and run successfully
- [ ] Test output matches what documentation claims
- [ ] Uses table-driven tests (Go idiom)
- [ ] Includes positive AND negative test cases
- [ ] Shows mock/stub creation using interfaces
- [ ] Follows Arrange-Act-Assert pattern
- [ ] No race conditions in tests (`go test -race` passes)
- [ ] Test demonstrates the testability benefit of the pattern

**Test content checklist:**

- [ ] Mock/stub struct is clearly defined
- [ ] Mock implements the interface being tested
- [ ] Test cases cover edge cases (zero values, errors, boundaries)
- [ ] Test explanation connects testing to design principles
- [ ] Shows WHY this design is testable (not just HOW to test)

**Example of GOOD test section:**

```
1. Text block: "Testing the Strategy Pattern"
   - Explains how interfaces enable mocking
   - Mentions no framework needed (Go's strength)

2. Code block: Mock struct + table-driven tests
   - MockPaymentStrategy that records calls
   - 3+ test cases (success, failure, edge case)
   - Clear Arrange-Act-Assert comments

3. Output block: $ go test -v ...
   - Shows all tests passing
   - Named test cases visible

4. Text block: Explanation
   - "Notice we didn't need a mocking framework..."
   - Connects to Dependency Inversion
   - Highlights testability as a design benefit
```

**Red flags to catch:**
- Design pattern section without test example
- LLD section without comprehensive tests
- Tests that don't actually test anything meaningful
- Tests without the corresponding test output
- Mocks that don't demonstrate interface benefit

### Phase 4: Design Pattern Accuracy

For design pattern sections, verify:

- [ ] Pattern is implemented correctly per GoF definitions
- [ ] Go-specific adaptations are appropriate
- [ ] Not over-engineered (Go favors simplicity)
- [ ] Interfaces are used appropriately (not forced)
- [ ] Embedding is used where composition fits
- [ ] Thread-safety is addressed where needed

**Common Go pattern pitfalls to check:**
- Singleton: Uses `sync.Once`, not double-checked locking
- Factory: Returns interfaces when appropriate, concrete types otherwise
- Builder: Uses method chaining correctly
- Observer: Considers using channels instead of callback lists
- Strategy: Uses interfaces, not empty interfaces with type assertions

### Phase 5: LLD Solution Quality

For LLD problem sections, verify:

- [ ] Solution handles all stated requirements
- [ ] Edge cases are considered
- [ ] Concurrency is handled correctly (if mentioned in requirements)
- [ ] No goroutine leaks
- [ ] No deadlock possibilities
- [ ] Appropriate data structures chosen
- [ ] Time complexity is reasonable
- [ ] Code is extensible (follows OCP)
- [ ] Interfaces allow for easy testing

**LLD-specific checks:**
- Cache: Eviction policy works correctly, TTL is honored
- Rate Limiter: Handles concurrent requests, window calculations correct
- Parking Lot: Vehicle types handled, spot allocation thread-safe
- Logger: Levels work correctly, formatters are extensible
- Pub/Sub: No message loss, backpressure handled
- Circuit Breaker: State transitions correct, timing accurate

### Phase 6: Technical Accuracy

Verify all technical claims:

- [ ] Statements about Go are correct per official documentation
- [ ] Design pattern descriptions are accurate
- [ ] SOLID principle explanations are correct
- [ ] Go version-specific claims are accurate (especially Go 1.22+ changes)
- [ ] Interface behavior is correctly described
- [ ] Embedding/composition behavior is correctly described
- [ ] No misleading comparisons to other languages

### Phase 7: Content Quality

Check for textbook-style explanations:

- [ ] Concepts explained BEFORE syntax
- [ ] Every jargon term defined when first introduced
- [ ] Explains "why", not just "what"
- [ ] Each paragraph focuses on one concept
- [ ] Complexity increases progressively
- [ ] No forward references to unexplained concepts
- [ ] Go idioms are emphasized over traditional OOP

**Go-specific content checks:**
- Emphasizes "Accept interfaces, return structs"
- Shows consumer-defined interfaces
- Avoids unnecessary abstraction
- Shows composition over inheritance

### Phase 8: Style Compliance

Verify:

- [ ] No em-dashes (`—`) between words
- [ ] Category is "Object-Oriented Design & LLD"
- [ ] Difficulty rating appropriate for content
- [ ] Estimated time realistic for content depth
- [ ] Consistent with other tutorial sections' style
- [ ] No decorative dividers in comments

### Phase 9: JSON Validity

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
- ASCII diagrams for complex relationships
- Transition text at section end

### For Code Issues

1. Fix the code to be correct
2. Update any incorrect output blocks
3. Ensure line numbers in explanations match actual code
4. Re-run verification after fixes

### For Pattern Inaccuracies

1. Verify the correct pattern implementation against GoF definitions
2. Update to follow Go idioms
3. Remove unnecessary abstraction
4. Add Go-specific considerations

### For LLD Issues

1. Verify requirements are all met
2. Fix thread-safety issues
3. Add missing edge case handling
4. Update complexity analysis if needed

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

### Design Pattern/LLD Checks

| Check | Status |
|-------|--------|
| Pattern implementation correct | ✓/✗ |
| Go idioms followed | ✓/✗ |
| Thread-safety addressed | ✓/✗/N/A |
| Requirements met (LLD) | ✓/✗/N/A |

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

### MANDATORY: Runnable Code + Output + Explanation

**This is the #1 quality requirement. Every code example MUST follow this pattern:**

```
┌────────────────────────────────────────────────────────────────┐
│ STEP 1: TEXTBOOK EXPLANATION (before code)                     │
│                                                                │
│ - Explain the problem (1-2 paragraphs)                         │
│ - Explain the solution concept (1-2 paragraphs)                │
│ - Use analogies and plain English                              │
│ - Define jargon before using it                                │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│ STEP 2: ASCII DIAGRAM (where helpful)                          │
│                                                                │
│     Interface                                                  │
│         ^                                                      │
│    implements                                                  │
│         |                                                      │
│   +-----+-----+                                                │
│   |           |                                                │
│ StructA    StructB                                             │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│ STEP 3: COMPLETE RUNNABLE CODE                                 │
│                                                                │
│ // filename.go                                                 │
│ package main                                                   │
│                                                                │
│ import "fmt"                                                   │
│                                                                │
│ // Type doc comment                                            │
│ type MyInterface interface { ... }                             │
│                                                                │
│ // Implementation with inline comments                         │
│ func (s *Struct) Method() {                                    │
│     // Key line explanation                                    │
│     ...                                                        │
│ }                                                              │
│                                                                │
│ func main() {                                                  │
│     // Demonstrate usage                                       │
│     ...                                                        │
│ }                                                              │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│ STEP 4: CONSOLE OUTPUT (IMMEDIATELY after code)                │
│                                                                │
│ $ go run filename.go                                           │
│ Output line 1                                                  │
│ Output line 2                                                  │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│ STEP 5: OUTPUT EXPLANATION                                     │
│                                                                │
│ "The output shows X, which demonstrates Y. Notice that Z..."   │
│ (1-2 paragraphs connecting output to the concept)              │
└────────────────────────────────────────────────────────────────┘
                              ↓
         (For intermediate/advanced sections)
                              ↓
┌────────────────────────────────────────────────────────────────┐
│ STEP 6: TEST CODE                                              │
│                                                                │
│ // filename_test.go                                            │
│ package main                                                   │
│                                                                │
│ import "testing"                                               │
│                                                                │
│ // MockStruct for testing                                      │
│ type MockStruct struct { ... }                                 │
│                                                                │
│ func TestFeature(t *testing.T) {                               │
│     tests := []struct{ ... }{ ... }  // Table-driven           │
│     for _, tt := range tests {                                 │
│         t.Run(tt.name, func(t *testing.T) {                    │
│             // Arrange - Act - Assert                          │
│         })                                                     │
│     }                                                          │
│ }                                                              │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│ STEP 7: TEST OUTPUT                                            │
│                                                                │
│ $ go test -v filename_test.go filename.go                      │
│ === RUN   TestFeature                                          │
│ === RUN   TestFeature/case_1                                   │
│ === RUN   TestFeature/case_2                                   │
│ --- PASS: TestFeature (0.00s)                                  │
│ PASS                                                           │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│ STEP 8: TEST EXPLANATION                                       │
│                                                                │
│ "The tests demonstrate how interfaces enable easy mocking..."  │
│ "Notice we didn't need a mocking framework..."                 │
│ (1-2 paragraphs on testability benefits)                       │
└────────────────────────────────────────────────────────────────┘
```

**FAIL the review if:**
- Code exists without an output block following it
- Output block doesn't match actual execution
- No explanation after the output
- Code doesn't compile or run
- Design pattern section missing test example
- LLD section missing comprehensive tests
- Test code that doesn't compile or pass

### Code Example Requirements

Every runnable code example MUST have:

1. **The code block** with:
   - Filename comment at top (e.g., `// strategy_payment.go`)
   - Package declaration (`package main` for standalone examples)
   - Required imports (only what's actually used)
   - Type definitions with doc comments
   - Complete main() function demonstrating usage
   - Inline comments on KEY lines only (not every line)
   - Multiple usage scenarios in main() where appropriate

2. **Output block** IMMEDIATELY after, showing:
   - The command: `$ go run filename.go`
   - The actual output (copy-pasted from terminal)
   - Multiple outputs if behavior can vary (concurrent code)

3. **Explanation text** after the output:
   - "The output shows..." or "Notice that..."
   - What the output proves about the concept
   - Connection back to the problem being solved

### Textbook-Style Explanation Requirements

**For EVERY major concept, write like a university textbook:**

```
BAD (API doc style - FAIL):
"The Strategy pattern defines a family of algorithms, encapsulates each one,
and makes them interchangeable."

GOOD (Textbook style - PASS):
"Imagine you're building a navigation app. Today it calculates routes by car.
But users also want walking directions, cycling routes, and public transit.
Each mode has completely different logic - cars avoid pedestrian zones, bikes
use cycle lanes, transit follows fixed schedules.

The naive approach is a giant if-else chain. But every new transport mode
means modifying that code, risking bugs in working modes. What if each
routing algorithm could live in its own isolated unit, and the app could
swap between them at runtime?

This is exactly what the Strategy pattern provides. You define a common
interface - let's call it RouteStrategy - that all routing algorithms
implement. The navigation app works with this interface, completely unaware
of whether it's calculating a car route or a walking path. Adding a new
transport mode means creating a new strategy, not touching existing code."
```

**Checklist for textbook style:**
- [ ] Starts with "Imagine..." or a concrete scenario
- [ ] Explains the problem BEFORE the solution
- [ ] Uses everyday analogies (not just technical comparisons)
- [ ] Defines jargon when first introduced
- [ ] 2-3 paragraphs minimum before showing code
- [ ] Progressive complexity (simple case first)

### Design Pattern Section Requirements

1. **Problem Statement** (2-3 paragraphs):
   - Concrete scenario where you'd encounter this
   - What happens without the pattern (the pain)
   - Why existing solutions don't work

2. **Pattern Overview**:
   - ASCII diagram showing relationships
   - Key participants (interfaces, structs)
   - Real-world analogy

3. **Go Implementation**:
   - Complete runnable code
   - Output block
   - Output explanation
   - Go-specific considerations noted

4. **When to Use / When NOT to Use**:
   - Clear guidance with examples
   - Go alternatives mentioned
   - Over-engineering warnings

### LLD Section Requirements

1. **Requirements Analysis**:
   - Functional requirements (bulleted list)
   - Non-functional requirements (concurrency, performance)
   - Table format preferred

2. **Design**:
   - Entity/interface identification
   - ASCII diagram of relationships
   - Design patterns chosen (and why)

3. **Implementation**:
   - Complete, runnable code
   - Thread-safety addressed
   - Output block with results

4. **Testing** (MANDATORY for LLD):
   - Complete test file with table-driven tests
   - Test output showing all tests pass
   - Tests for core operations AND edge cases

5. **Analysis**:
   - Time/space complexity
   - Extension possibilities

### Test Code Requirements (for intermediate/advanced sections)

**Every test example MUST have:**

1. **Mock/Stub Definition:**
   ```go
   // MockService implements Service interface for testing
   type MockService struct {
       CallCount int           // Track number of calls
       ReturnErr error         // Configurable error return
       LastInput string        // Record inputs for verification
   }
   
   func (m *MockService) DoSomething(input string) error {
       m.CallCount++
       m.LastInput = input
       return m.ReturnErr
   }
   ```

2. **Table-Driven Tests:**
   ```go
   func TestFeature(t *testing.T) {
       tests := []struct {
           name      string  // Descriptive test case name
           input     string  // Test input
           mockErr   error   // Mock behavior configuration
           wantErr   bool    // Expected error state
       }{
           {"success case", "valid", nil, false},
           {"error case", "invalid", errors.New("fail"), true},
           {"edge case", "", nil, false},
       }
       
       for _, tt := range tests {
           t.Run(tt.name, func(t *testing.T) {
               // Arrange
               mock := &MockService{ReturnErr: tt.mockErr}
               sut := NewFeature(mock)
               
               // Act
               err := sut.Execute(tt.input)
               
               // Assert
               if (err != nil) != tt.wantErr {
                   t.Errorf("Execute() error = %v, wantErr %v", err, tt.wantErr)
               }
           })
       }
   }
   ```

3. **Test Output Block:**
   ```
   $ go test -v feature_test.go feature.go
   === RUN   TestFeature
   === RUN   TestFeature/success_case
   === RUN   TestFeature/error_case
   === RUN   TestFeature/edge_case
   --- PASS: TestFeature (0.00s)
       --- PASS: TestFeature/success_case (0.00s)
       --- PASS: TestFeature/error_case (0.00s)
       --- PASS: TestFeature/edge_case (0.00s)
   PASS
   ok      command-line-arguments  0.003s
   ```

4. **Test Explanation:**
   - How interfaces enabled the mock
   - Why table-driven tests are idiomatic Go
   - How this demonstrates testability as a design benefit

**Test coverage checklist for LLD problems:**

| LLD Problem | Required Test Cases |
|-------------|---------------------|
| Cache | Get hit, Get miss, Put new, Put overwrite, Eviction trigger, TTL expiry |
| Rate Limiter | Under limit, At limit, Over limit, Limit reset, Concurrent requests |
| Parking Lot | Park success, Park full, Unpark success, Unpark invalid, Concurrent parking |
| Logger | Log at each level, Format output, Multiple handlers |
| Pub/Sub | Publish, Subscribe, Unsubscribe, Multiple subscribers |
| Circuit Breaker | Closed state, Open state, Half-open state, State transitions |

### ASCII Diagram Standards

For OOP/LLD diagrams:

**DO use:**
- Simple characters: `-`, `|`, `+`, `>`, `<`
- Clear labels for interfaces and structs
- Method signatures where helpful
- Arrows showing "implements" or "uses" relationships

**DON'T use:**
- Complex Unicode box-drawing characters unless necessary
- UML-specific notation that Go developers won't recognize
- Overly wide diagrams (keep under 70 chars)

**Example of GOOD OOP diagram:**
```
    +---------+       +------------+
    | Logger  |<------| FileLogger |
    +---------+       +------------+
    | Log()   |       | file *File |
    +---------+       | Log()      |
         ^            +------------+
         |
    +-------------+
    | ConsoleLogger|
    +-------------+
    | Log()        |
    +-------------+
```

**Example of GOOD LLD diagram:**
```
    ParkingLot
        |
        +-- floors []Floor
                |
                +-- spots []Spot
                        |
                        +-- vehicle Vehicle (interface)
                                |
                                +-- Car, Bike, Truck
```

## Quick Reference

```bash
# Validate JSON
node -e "JSON.parse(require('fs').readFileSync('frontend/src/lib/languages/go.json'))"

# List all OOP/LLD sections
node -e "
const data = JSON.parse(require('fs').readFileSync('frontend/src/lib/languages/go.json'));
data.sections
  .filter(s => s.category === 'Object-Oriented Design & LLD')
  .forEach(s => console.log(s.id + ' - ' + s.title));
"

# Extract section for review
node -e "
const data = JSON.parse(require('fs').readFileSync('frontend/src/lib/languages/go.json'));
const section = data.sections.find(s => s.id === 'SECTION_ID');
console.log(JSON.stringify(section, null, 2));
"

# Test Go code
go build -o /dev/null example.go  # Compile check
go run example.go                  # Run
go run -race example.go            # Race check
```

## Common Go OOP Anti-Patterns to Flag

1. **"Java in Go"**: Excessive interfaces, getters/setters everywhere
2. **Forced Design Patterns**: Patterns used where simple functions would work
3. **Deep Embedding**: More than 2 levels of struct embedding
4. **Fat Interfaces**: Interfaces with 5+ methods
5. **Producer-Defined Interfaces**: Interfaces defined by the implementer, not consumer
6. **Over-Abstraction**: Interfaces for everything, even single implementations
7. **Missing Composition**: Using complex patterns where simple composition suffices
