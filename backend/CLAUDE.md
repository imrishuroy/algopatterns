@../AGENTS.md

# DeepSource Integration

## Skills Available
Two DeepSource skills are installed in `.agents/skills/`:
- **deepsource**: Retrieve code review issues, vulnerabilities, report cards via CLI
- **sentinel-api**: Scan code for security vulnerabilities, leaked secrets, auto-fix issues

## Using DeepSource CLI (requires authentication)
```bash
deepsource auth login
deepsource issues --severity critical --output json
deepsource report-card --output json
deepsource vulnerabilities --output json
```

## Before Committing Code
Always ensure code passes DeepSource rules. When writing Go code, follow the rules below.

---

# DeepSource Go Linting Rules

Follow these rules to pass DeepSource analysis. Full reference: https://deepsource.com/directory/go

## Critical Rules

### CRT-D0011: os.Exit/log.Fatal with defer
`log.Fatal()` and `os.Exit()` terminate immediately — `defer` statements won't run.

**Bad:**
```go
defer cleanup()
if err != nil {
    log.Fatal(err) // defer cleanup() never runs!
}
```

**Good:**
```go
func fatal(err error, msg string) {
    sentry.CaptureException(err)
    sentry.Flush(2 * time.Second)
    log.Fatal().Err(err).Msg(msg)
}

defer cleanup()
if err != nil {
    fatal(err, "something failed")
}
```

Or use return + handle exit at caller level.

### GO-W5016: Possible nil pointer dereference
Always check for nil before dereferencing pointers.

```go
// Bad
return user.Name

// Good
if user != nil {
    return user.Name
}
```

## Bug Risk Rules

### SCC-SA4006: Value assigned but never used
Don't assign values that are immediately overwritten or never read.

### SCC-SA4010: Result of append not used
Always use the return value of `append()`.

```go
// Bad
append(slice, item)

// Good
slice = append(slice, item)
```

### SCC-SA5000: Assignment to nil map
Initialize maps before writing to them.

```go
// Bad
var m map[string]int
m["key"] = 1 // panic!

// Good
m := make(map[string]int)
m["key"] = 1
```

### VET-V0010: Loop variable captured in closure
Don't capture loop variables directly in goroutines.

```go
// Bad
for _, item := range items {
    go func() {
        process(item) // captures changing variable
    }()
}

// Good
for _, item := range items {
    go func(i Item) {
        process(i)
    }(item)
}
```

### VET-V0008: Lock passed by value
Pass mutexes by pointer, not by value.

```go
// Bad
func process(mu sync.Mutex) { ... }

// Good
func process(mu *sync.Mutex) { ... }
```

## Security Rules

### GO-S2307: Unsafe defer of .Close method
Check errors from Close() on writers.

```go
// For readers (ok to ignore)
defer resp.Body.Close()

// For writers (check error)
defer func() {
    if err := f.Close(); err != nil {
        log.Error(err)
    }
}()
```

### GSC-G401: Weak cryptographic algorithms
Don't use MD5, SHA1, DES, or RC4 for security purposes.

```go
// Bad
hash := md5.Sum(data)

// Good
hash := sha256.Sum256(data)
```

### GSC-G404: Insecure random number generation
Use crypto/rand for security-sensitive randomness.

```go
// Bad (predictable)
import "math/rand"
token := rand.Int()

// Good (cryptographically secure)
import "crypto/rand"
token := make([]byte, 32)
rand.Read(token)
```

### GO-S1010: Uncontrolled data in network request
Validate/sanitize user input before using in URLs or network requests.

## Style Rules

### SCC-ST1003: Poorly chosen identifiers
- Package names: lowercase, single-word, no underscores
- Variables/functions: MixedCaps or mixedCaps, not underscores
- Acronyms: consistent case (URL not Url, ID not Id)

### SCC-S1001: Replace for loop with copy
```go
// Bad
for i := range src {
    dst[i] = src[i]
}

// Good
copy(dst, src)
```

## Unused Code Rules

### SCC-U1000: Unused code
Remove dead code — unused functions, variables, constants.

### Unused test parameters
If a test function doesn't use `t`, name it `_`:

```go
// Bad
func TestFoo(t *testing.T) {
    result := compute()
    // t is never used
}

// Good
func TestFoo(_ *testing.T) {
    result := compute()
}
```

## Error Handling Rules

### Always check errors
```go
// Bad
result, _ := someFunc()

// Good
result, err := someFunc()
if err != nil {
    return err
}
```

### Don't panic in library code
Return errors instead of panicking. Reserve panic for truly unrecoverable situations.

## Context Rules

- Pass `context.Context` as first parameter
- Don't store contexts in structs
- Use `context.Background()` only at entry points

## Import Organization

Group imports: stdlib, external packages, internal packages.

```go
import (
    "context"
    "fmt"

    "github.com/gin-gonic/gin"
    "github.com/rs/zerolog"

    "github.com/imrishuroy/algopatterns/internal/config"
)
```
