# Agnet Patterns

## Top-level layout

```
backend/   # Go 1.26 + Gin API (clean architecture)
frontend/  # Next.js 16 App Router + React 19 + Tailwind CSS 4
public/    # Standalone static marketing site (vanilla HTML/JS, NOT part of Next.js)
docs/      # Design documents
```

Backend module path: `github.com/imrishuroy/algopatterns`

## Pattern data

`frontend/src/lib/patterns.json` (~4k lines) is the embedded source of truth for DSA pattern content. The frontend renders pattern pages from this file — the backend API is not required for pattern browsing.

## Backend commands (run from `backend/`)

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

### Backend API overview

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

## Frontend commands (run from `frontend/`)

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

### Frontend testing quirks

- Vitest config at `frontend/vitest.config.ts` uses `jsdom` (not `@happy-dom`).
- Setup file: `src/__tests__/setup.ts` — imports `@testing-library/jest-dom/vitest`, `fake-indexeddb/auto`, mocks `localStorage` and `crypto.subtle`.
- Path alias `@/` → `src/` (configured in both tsconfig and vitest).
- Context tests mock `@/lib/api` via `vi.mock`. Check `AuthContext.test.tsx` for the pattern.
- 18 test files, all under `src/__tests__/`.

### Frontend conventions

- `.npmrc` has `legacy-peer-deps=true`.
- Tailwind CSS 4 via `@tailwindcss/postcss` plugin (traditional PostCSS config, not v4 native config).
- Prettier: semicolons, double quotes, trailing commas, printWidth 80.
- ESLint uses `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript` (flat config).
- 7 React contexts: Auth, Filter, Highlight, Language, Progress, Subscription, Theme.
- API client in `src/lib/api.ts` — singleton `apiClient`, handles JWT refresh with dedup.

### Comment style (applies to all code — frontend and backend)

Use plain, simple comments. Never use decorative dividers made of box-drawing characters or repeated punctuation.

```typescript
// Bad — do not use these
// ─── Section ─────────────────────────────────────────────────────────────────
// ── Sub-section ──────────────────────────────────────────────────────────────
// ==== Section ====
// **** Section ****

// Good
// Section name
// Sub-section description
```

### Content writing style (applies to all markdown articles, tutorials, and educational content in patterns.json)

Never use em dashes (`—`) between words. They read as AI-generated. Use natural punctuation instead:

| Instead of | Use |
|------------|-----|
| `label — explanation` | `label: explanation` |
| `clause — continuation` | `clause, continuation` |
| `text — aside` | `text (aside)` |
| `sentence — new thought` | `sentence. New thought.` |

```markdown
// Bad
**Time:** O(n^2) — each pair computed once.
- **Burst Balloons** — requires the last-burst insight.
The subsequence does not need to be contiguous — elements can be skipped.

// Good
**Time:** O(n^2). Each pair computed once.
- **Burst Balloons**: requires the last-burst insight.
The subsequence does not need to be contiguous (elements can be skipped).
```

## Next.js 16 — breaking changes

Read `node_modules/next/dist/docs/` before writing any code. APIs and conventions may differ from older Next.js.

## Key docs to read before touching features

| Doc | When to read |
|---|---|
| `docs/authentication-design.md` | Before touching auth or OAuth code |
| `docs/database.md` | Schema design decisions |
| `docs/payment-feature.md` | Razorpay integration |
| `docs/highlight-feature.md` | Offline support + conflict resolution |
| `docs/architecture-judge0-integration.md` | Code execution sandbox |

## CI / Deployment

- **Backend**: GitHub Actions → GCP Artifact Registry → Cloud Run (`asia-south1`). Triggered on pushes to `main` touching `backend/**`.
- **Frontend**: Deployed via Cloudflare Pages (`wrangler.jsonc` sets `pages_build_output_dir` = `frontend/out`).
- Railway config also exists for the backend (`railway.json`, `nixpacks.toml`, `Procfile`).

## Existing instruction files

- `frontend/AGENTS.md` — Next.js 16 warning (preserved above).
- `frontend/CLAUDE.md` — just `@AGENTS.md`.
