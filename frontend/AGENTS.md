<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Next.js 16 + React 19

**Read `node_modules/next/dist/docs/` before writing code.** Training data is outdated.

## Before Coding

- State assumptions. If uncertain, ask.
- If multiple approaches exist, present them.
- Simpler approach exists? Say so.

## Project Setup

- Static export: `next build` → `frontend/out/`. No Node server at runtime.
- Tailwind CSS 4 via `@tailwindcss/postcss`.
- ESLint flat config (`eslint.config.mjs`).
- Prettier: semicolons, double quotes, trailing commas, printWidth 80.
- `.npmrc` has `legacy-peer-deps=true`.

## Components

- 7 React contexts: Auth, Filter, Highlight, Language, Progress, Subscription, Theme.
- API client: `src/lib/api.ts` — singleton, handles JWT refresh with dedup.
- Pattern data: `src/lib/patterns.json` (~4k lines) — frontend source of truth.

## Folder Structure

```
src/
├── app/                  # Routes only. Keep thin.
│   ├── patterns/
│   │   ├── page.tsx              # Entry point, renders PatternsListClient
│   │   ├── PatternsListClient.tsx # Co-located client component
│   │   └── [slug]/
│   │       ├── page.tsx
│   │       └── PatternPageClient.tsx
│   └── ...
├── components/           # Shared components, grouped by domain
│   ├── ui/               # Design system (Button, Modal, Spinner)
│   ├── patterns/         # Pattern-specific components
│   ├── visualizers/      # Algorithm visualizers
│   ├── quiz/             # Quiz components
│   ├── payment/          # Payment flow
│   ├── ai/               # AI chat components
│   └── layout/           # Header, Footer, Sidebar
├── contexts/             # Global React contexts (Auth, Theme, etc.)
├── hooks/                # Shared hooks (useMediaQuery, useGlobalSearch)
├── lib/                  # Utilities, API client, services
│   ├── api.ts            # API client singleton
│   ├── patterns.json     # Pattern data source of truth
│   └── ...
└── types/                # Global TypeScript types
```

### Conventions

**app/ pages are thin entry points:**
```tsx
// app/patterns/page.tsx
import { PatternsListClient } from "./PatternsListClient";

// skipcq: JS-0067
export default function PatternsPage() {
  return <PatternsListClient />;
}
```

**Co-locate client components with their route:**
- `app/patterns/PatternsListClient.tsx` (not in components/)
- Complex logic lives in the `*Client.tsx` file

**components/ for shared/reusable only:**
- Used in 2+ places? → `components/`
- Used in 1 route? → Co-locate in `app/`

**hooks/ for cross-feature hooks:**
- Feature-specific logic stays in client component
- Shared behavior (media queries, search) → `hooks/`

**lib/ for utilities and services:**
- API client, data fetching
- IndexedDB services
- Static data (patterns.json, quotes.ts)

## Testing

- Vitest + jsdom (`vitest.config.ts`).
- Setup: `src/__tests__/setup.ts` — imports jest-dom, fake-indexeddb, mocks localStorage/crypto.
- Path alias `@/` → `src/`.
- Mock `@/lib/api` via `vi.mock`. See `AuthContext.test.tsx`.

### Test Pattern Example

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import type { ReactNode } from "react";

// Mock API client
vi.mock("@/lib/api", () => ({
  apiClient: {
    login: vi.fn(),
    logout: vi.fn(),
    getMe: vi.fn(),
  },
}));

import { apiClient } from "@/lib/api";

const mockUser = { id: "user-123", email: "test@test.com", name: "Test User" };

const Wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("logs in user", async () => {
    vi.mocked(apiClient.login).mockResolvedValue({ user: mockUser });

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.login("test@test.com", "password");
    });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });
  });
});
```

## Code Style

- Match existing style. Don't "improve" adjacent code.
- Every changed line traces to user's request.
- Arrow functions for non-component exports.
- Function declarations OK for React components with hooks (add `// skipcq: JS-0067` comment).

---

# DeepSource Compliance

This project uses DeepSource for static analysis. Follow these rules to minimize warnings.

## JS-0067: Function Declarations in Global Scope

Use arrow functions for exports. Exception: React components with hooks need function declarations.

```typescript
// Bad
export function getData() { return fetch('/api'); }

// Good
export const getData = () => fetch('/api');

// Exception: React components (add skipcq comment)
// skipcq: JS-0067
export default function Page() { return <div />; }
```

## JS-R1005: Cyclomatic Complexity

Keep functions simple. Max 10-15 branches. Split complex logic into helpers.

| Complexity | Action |
|------------|--------|
| 1-5 | OK |
| 6-15 | Review |
| 16+ | Refactor |

## JS-0437: Array Index as Key

Use unique identifiers, not array indices.

```tsx
// Bad
items.map((item, index) => <Item key={index} />)

// Good
items.map(item => <Item key={item.id} />)

// Last resort (add skipcq comment with reason)
// skipcq: JS-0437
items.map((item, idx) => <Item key={`prefix-${idx}`} />)
```

## JS-0415: JSX Nesting Too Deep

Keep JSX depth under 6 levels. Extract nested content into components.

## JS-0116: Async Without Await

Don't mark functions `async` if they don't use `await`.

## JS-W1042: Redundant Undefined

Don't pass `undefined` explicitly to optional parameters.

## JS-0045: Arrow Function Return Consistency

Be consistent with returns in arrow functions.

## JS-0323: No `any` Type

Use proper types or `unknown`.

## JS-0002: No Console in Browser

Never use `console.log()` in browser code.

## JS-0060: No eval()

Never use `eval()`.

## Security Rules

| Rule | Description |
|------|-------------|
| JS-S1012 | No direct innerHTML assignment |
| JS-S1021 | No hardcoded credentials |
| JS-S1010 | Validate input before shell commands |

## React/JSX Rules

| Rule | Description |
|------|-------------|
| JS-0414 | Always provide unique `key` in lists |
| JS-0417 | No `.bind()` or inline functions in JSX props |
| JS-0440 | Avoid `dangerouslySetInnerHTML` |
| JS-0820 | Follow React hooks rules |

## TypeScript Rules

| Rule | Description |
|------|-------------|
| JS-0349 | No unnecessary type assertions |
| JS-0324 | No unnecessary non-null assertion (`!`) |
| JS-0372 | Use `@ts-expect-error` over `@ts-ignore` |

## When to Use skipcq

Only suppress when rule cannot be satisfied:
1. Next.js conventions require function declarations (pages, layouts)
2. No stable key available for list items
3. Complex component that can't be simplified further

Always add reason:
```typescript
// skipcq: JS-0067 — Next.js page component convention
export default function Page() { /* ... */ }
```

---

## Comments

Plain comments only. No decorative dividers.

## Content Writing

No em dashes (`—`) between words. Use natural punctuation.

## Verification

Transform tasks into verifiable goals:
- "Add feature" → "Write test, make it pass"
- "Fix bug" → "Reproduce in test, fix, verify"
- Start dev server and test UI changes in browser before reporting complete.

## Debugging

When given a bug report or error, fix it autonomously:
- Read the error, log, or failing test. Trace it to the root cause.
- Fix it without asking for permission at each step.
- Verify the fix. Don't mark it done until it's proven to work.
