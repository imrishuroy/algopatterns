# AlgoPatterns

## Agent Rules

- **NEVER commit or push code.** Only make changes to files. The user will review and commit manually.
- Do not run `git commit`, `git push`, or create PRs unless explicitly requested by the user.

## Top-level Layout

```
backend/   # Go 1.26 + Gin API (clean architecture)
frontend/  # Next.js 16 App Router + React 19 + Tailwind CSS 4
public/    # Standalone static marketing site (vanilla HTML/JS, NOT part of Next.js)
docs/      # Design documents
```

Backend module path: `github.com/imrishuroy/algopatterns`

## Pattern Data

`frontend/src/lib/patterns.json` (~4k lines) is the embedded source of truth for DSA pattern content. The frontend renders pattern pages from this file — the backend API is not required for pattern browsing.

## Backend Commands (run from `backend/`)

| Command | What |
|---|---|
| `make run-dev` | Start with hot reload (GIN_MODE=debug, console logs) |
| `make test` | `go test -v -race -cover ./...` |
| `make lint` | `go vet ./... && gofmt -s -w .` |
| `make build` | CGO_ENABLED=0 build to `bin/algopatterns-api` |
| `make migrate-up` | Requires env var `DATABASE_URL`; runs `psql "$DATABASE_URL" -f migrations/*.up.sql` |
| `make seed` | `go run ./scripts/seed/main.go` |
| `make cockroach-cert` | Downloads CockroachDB cloud CA cert to `~/.postgresql/root.crt` |

- Tests use `stretchr/testify` with stub service structs (not mock generators). Check existing tests for the manual stub pattern.
- No `golangci-lint`; lint = `go vet` + `gofmt -s`.
- `JWT_SECRET` env var is **required** at startup (config panics if empty).
- `JUDGE0_MOCK_MODE=true` in `.env` for local dev without Judge0.
- Judge0 infra starts via `docker-compose -f docker-compose.judge0.yml up -d` (separate compose file).
- Prometheus metrics exposed at `GET /metrics`.
- Migrations are sequential SQL files; no migration tool like goose/golang-migrate.

### Backend API Overview

| Prefix | Handlers |
|---|---|
| `/api/v1/auth` | register, login, refresh, logout, Google OAuth |
| `/api/v1/patterns` | CRUD, search, categories, bulk, export |
| `/api/v1/problems` | list, detail by slug, test cases |
| `/api/v1/submissions` | run code, submit, get results |
| `/api/v1/highlights` | create, list, sync (offline-merge) |
| `/api/v1/quiz` | questions, submit answer |
| `/api/v1/payments` | plans, create order, verify, webhooks |
| `/api/v1/progress` | user progress tracking |
| `/health` | liveness, readiness, full health |

## Frontend Commands (run from `frontend/`)

| Command | What |
|---|---|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint (flat config, `eslint.config.mjs`) |
| `npm run format` / `format:check` | Prettier on `src/**/*.{ts,tsx}` |
| `npm test` | Vitest (watch mode) |
| `npm run test:run` | Vitest single run |
| `npm run test:coverage` | Vitest + v8 coverage |

- Frontend builds as static export (`next build` → `frontend/out/`). No Node server at runtime on Cloudflare Pages.

### Frontend Testing Quirks

- Vitest config at `frontend/vitest.config.ts` uses `jsdom` (not `@happy-dom`).
- Setup file: `src/__tests__/setup.ts` — imports `@testing-library/jest-dom/vitest`, `fake-indexeddb/auto`, mocks `localStorage` and `crypto.subtle`.
- Path alias `@/` → `src/` (configured in both tsconfig and vitest).
- Context tests mock `@/lib/api` via `vi.mock`. Check `AuthContext.test.tsx` for the pattern.
- 18 test files, all under `src/__tests__/`.

### Frontend Conventions

- `.npmrc` has `legacy-peer-deps=true`.
- Tailwind CSS 4 via `@tailwindcss/postcss` plugin (traditional PostCSS config, not v4 native config).
- Prettier: semicolons, double quotes, trailing commas, printWidth 80.
- ESLint uses `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript` (flat config).
- 7 React contexts: Auth, Filter, Highlight, Language, Progress, Subscription, Theme.
- API client in `src/lib/api.ts` — singleton `apiClient`, handles JWT refresh with dedup.

## Comment Style (applies to all code)

Use plain, simple comments. Never use decorative dividers made of box-drawing characters or repeated punctuation.

```typescript
// Bad — do not use these
// ─── Section ─────────────────────────────────────────────────────────────────
// ==== Section ====

// Good
// Section name
```

## Content Writing Style

Never use em dashes (`—`) between words. They read as AI-generated. Use natural punctuation:

| Instead of | Use |
|------------|-----|
| `label — explanation` | `label: explanation` |
| `clause — continuation` | `clause, continuation` |

## Next.js 16 — Breaking Changes

Read `node_modules/next/dist/docs/` before writing any code. APIs and conventions may differ from older Next.js.

## Key Docs to Read Before Touching Features

| Doc | When to read |
|---|---|
| `docs/design-system.md` | Before making UI changes, styling, or adding components |
| `docs/authentication-design.md` | Before touching auth or OAuth code |
| `docs/database.md` | Schema design decisions |
| `docs/payment-feature.md` | Razorpay integration |
| `docs/highlight-feature.md` | Offline support + conflict resolution |
| `docs/architecture-judge0-integration.md` | Code execution sandbox |

## CI / Deployment

- **Backend**: GitHub Actions → GCP Artifact Registry → Cloud Run (`asia-south1`). Triggered on pushes to `main` touching `backend/**`.
- **Frontend**: Deployed via Cloudflare Pages (`wrangler.jsonc` sets `pages_build_output_dir` = `frontend/out`).

---

# Go Guidelines

## Before Coding

- State assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them.
- If a simpler approach exists, say so.

## Backend Folder Structure

```
backend/
├── cmd/                  # Entry points
│   ├── server/           # Main API server
│   ├── indexer/          # Content indexer CLI
│   └── preview-emails/   # Email preview tool
├── internal/             # Private packages (clean architecture)
│   ├── config/           # Configuration loading
│   ├── models/           # Domain models + validation
│   ├── repository/       # Database access (pgx)
│   ├── services/         # Business logic
│   ├── handlers/         # HTTP handlers (Gin)
│   ├── middleware/       # Gin middleware
│   ├── ai/               # AI service (LLM, RAG)
│   ├── razorpay/         # Payment client
│   └── metrics/          # Prometheus metrics
├── pkg/                  # Public packages (reusable)
│   ├── response/         # HTTP response helpers
│   └── sentry/           # Sentry utilities
├── migrations/           # SQL migration files
└── scripts/              # CLI tools (seed, index)
```

### Clean Architecture Layers

- `handlers/` → HTTP layer, calls services
- `services/` → Business logic, calls repositories
- `repository/` → Database access only

### New Feature Flow

1. Model in `models/`
2. Repository interface + impl in `repository/`
3. Service in `services/`
4. Handler in `handlers/`
5. Wire up in `cmd/server/main.go`

## Code Style

- Run `make lint` from `backend/` before committing (`go vet` + `gofmt -s`).
- No `golangci-lint` in this repo.
- Match existing style. Don't "improve" adjacent code.
- Every changed line should trace to the user's request.

## Naming

- Package: lowercase, no underscores.
- Variables/functions: MixedCaps. Acronyms: consistent case (ID not Id, URL not Url).
- Avoid stutter: `package kv; type Store` (not `KVStore`).

## Error Handling

- Wrap with context: `fmt.Errorf("open %s: %w", path, err)`.
- Use `errors.Is`/`errors.As` for control flow.
- Don't panic in library code.

## Context

- `context.Context` as first parameter.
- Don't store in structs.
- Propagate non-nil ctx; honor Done/deadlines.

## Concurrency

- Sender closes channels, never receiver.
- Tie goroutine lifetime to context.
- Protect shared state with `sync.Mutex`/`atomic`.
- Use `errgroup` for fan-out.

## Testing

- Table-driven tests with `stretchr/testify`.
- Manual stub structs (no mock generators).
- Run `-race` (`make test`).
- Mark safe tests with `t.Parallel()`.

### Test Pattern Example

```go
func TestRequestID_GeneratesNewID(t *testing.T) {
    router := gin.New()
    router.Use(RequestID())
    router.GET("/test", func(c *gin.Context) {
        requestID, exists := c.Get("request_id")
        assert.True(t, exists)
        assert.NotEmpty(t, requestID)
        c.String(http.StatusOK, "ok")
    })

    req, _ := http.NewRequest("GET", "/test", nil)
    w := httptest.NewRecorder()
    router.ServeHTTP(w, req)

    assert.Equal(t, http.StatusOK, w.Code)
    assert.NotEmpty(t, w.Header().Get("X-Request-ID"))
}
```

## Logging

- Use `zerolog` (structured, leveled).
- Correlate via request IDs from context.

## Functions

- Use input structs for >2 arguments (context excluded).
- Accept interfaces where needed; return concrete types.
- Keep functions small and orthogonal.

## Imports

Group: stdlib, external, internal.

```go
import (
    "context"
    "fmt"

    "github.com/gin-gonic/gin"

    "github.com/imrishuroy/algopatterns/internal/config"
)
```

## Security

- Validate inputs; set I/O timeouts.
- Never log secrets.
- Use `crypto/rand` for security randomness, not `math/rand`.

---

# DeepSource Go Compliance

## Bug Risk Rules

### VET-V0010: Loop Variable Capture

Don't capture loop variables in goroutines or closures.

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

### VET-V0008: Lock Passed by Value

Pass mutexes by pointer.

```go
// Bad
func process(mu sync.Mutex) { ... }

// Good
func process(mu *sync.Mutex) { ... }
```

### GO-W5016: Nil Pointer Dereference

Check nil before dereferencing.

```go
// Bad
return user.Name

// Good
if user != nil {
    return user.Name
}
return ""
```

### SCC-SA5000: Assignment to Nil Map

Initialize maps before writing.

```go
// Bad
var m map[string]int
m["key"] = 1 // panic!

// Good
m := make(map[string]int)
m["key"] = 1
```

### SCC-SA4006: Unused Assignment

Don't assign values that are never read.

### SCC-SA4010: Append Result Not Used

Always use return value of `append()`.

```go
// Bad
append(slice, item)

// Good
slice = append(slice, item)
```

## Security Rules

### GO-S2307: Unsafe Defer Close

Check errors from `Close()` on writers.

```go
// Readers (ok to ignore)
defer resp.Body.Close()

// Writers (check error)
defer func() {
    if err := f.Close(); err != nil {
        log.Error().Err(err).Msg("close failed")
    }
}()
```

### GSC-G401: Weak Crypto

Don't use MD5, SHA1, DES, RC4 for security.

### GSC-G404: Insecure Random

Use `crypto/rand` for security-sensitive randomness.

### GO-S2306: File Permissions

Use restrictive permissions for new files.

```go
// Bad
os.WriteFile(path, data, 0777)

// Good
os.WriteFile(path, data, 0600)
```

## Style Rules

### SCC-ST1003: Identifier Names

- Package: lowercase, no underscores
- Variables: MixedCaps (not `user_name`)
- Acronyms: consistent (URL, ID, HTTP)

### SCC-ST1005: Error Strings

Error strings should not be capitalized or end with punctuation.

```go
// Bad
fmt.Errorf("Failed to open file.")

// Good
fmt.Errorf("failed to open file")
```

### SCC-ST1006: Receiver Names

Use short, consistent receiver names.

```go
// Bad
func (this *User) Name() string { ... }

// Good
func (u *User) Name() string { ... }
```

### GO-R3001: Use `any`

Use `any` instead of `interface{}` (Go 1.18+).

### GO-C4001: Deprecated ioutil

Use `io` and `os` instead of `io/ioutil`.

## Performance Rules

### CRT-P0005: Copy of Large Value in Range

Use pointer or index for large structs in range.

```go
// Bad
for _, item := range largeItems {
    process(item)
}

// Good
for i := range largeItems {
    process(&largeItems[i])
}
```

### SCC-SA6005: Inefficient String Comparison

Use `strings.EqualFold` for case-insensitive comparison.

### SCC-S1001: Use copy()

Replace manual copy loops.

## Critical Rules

### CRT-D0011: os.Exit/log.Fatal with Defer

`log.Fatal()` and `os.Exit()` terminate immediately — defers won't run.

```go
// Bad
defer cleanup()
if err != nil {
    log.Fatal(err) // defer never runs!
}

// Good: Use helper that flushes first
func fatal(err error, msg string) {
    sentry.CaptureException(err)
    sentry.Flush(2 * time.Second)
    log.Fatal().Err(err).Msg(msg)
}
```

## When to Suppress

Only suppress when rule cannot be satisfied. Always add reason:

```go
// skipcq: GO-W5016 — nil checked in caller
return user.Name
```

---

## Verification

Transform tasks into verifiable goals:
- "Add validation" → "Write test for invalid input, make it pass"
- "Fix bug" → "Write reproducing test, make it pass"
- "Refactor X" → "Tests pass before and after"

## Debugging

When given a bug report or error, fix it autonomously:
- Read the error, log, or failing test. Trace it to the root cause.
- Fix it without asking for permission at each step.
- Verify the fix. Don't mark it done until it's proven to work.
