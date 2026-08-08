# PostHog Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate PostHog analytics across the AlgoPatterns platform (Next.js frontend, Go backend, marketing site) for product analytics, conversion tracking, and session replay.

**Architecture:** Unified SDK approach with `posthog-js` on frontend/marketing site and `posthog-go` on backend. User identification by database ID. Events flow directly to PostHog Cloud.

**Tech Stack:** posthog-js, posthog-js/react, posthog-go, Next.js 16 App Router, Go 1.26 + Gin

## Global Constraints

- PostHog Cloud hosted at `us.i.posthog.com`
- Keep Google Analytics 4 running alongside PostHog
- Identify users by database ID only (no email/profile data)
- Mask all input fields in session replay
- Follow existing code patterns in the codebase

---

### Task 1: Add PostHog Dependencies

**Files:**
- Modify: `frontend/package.json`
- Modify: `backend/go.mod`

**Interfaces:**
- Consumes: None
- Produces: `posthog-js` available for import in frontend, `posthog-go` available for import in backend

- [ ] **Step 1: Install frontend dependency**

```bash
cd frontend && npm install posthog-js
```

- [ ] **Step 2: Install backend dependency**

```bash
cd backend && go get github.com/posthog/posthog-go
```

- [ ] **Step 3: Verify installations**

Run: `cd frontend && npm list posthog-js`
Expected: `posthog-js@<version>` listed

Run: `cd backend && go list -m github.com/posthog/posthog-go`
Expected: Module version listed

- [ ] **Step 4: Commit**

```bash
git add frontend/package.json frontend/package-lock.json backend/go.mod backend/go.sum
git commit -m "chore: add posthog-js and posthog-go dependencies"
```

---

### Task 2: Create PostHog Client Library (Frontend)

**Files:**
- Create: `frontend/src/lib/posthog.ts`

**Interfaces:**
- Consumes: `posthog-js` package
- Produces: `initPostHog(): PostHog | null`, `getPostHogClient(): PostHog | null`

- [ ] **Step 1: Create the PostHog client module**

Create `frontend/src/lib/posthog.ts`:

```typescript
import posthog from "posthog-js";

let posthogClient: typeof posthog | null = null;

export const initPostHog = (): typeof posthog | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.warn("PostHog API key not configured");
    }
    return null;
  }

  if (!posthogClient) {
    posthog.init(apiKey, {
      api_host: apiHost || "https://us.i.posthog.com",
      capture_pageview: false, // We handle this manually for App Router
      capture_pageleave: true,
      autocapture: true,
      persistence: "localStorage+cookie",
      disable_session_recording: false,
      session_recording: {
        maskAllInputs: true,
        maskTextSelector: "[data-ph-mask]",
      },
      loaded: (ph) => {
        if (process.env.NODE_ENV === "development") {
          ph.debug();
        }
      },
    });
    posthogClient = posthog;
  }

  return posthogClient;
};

export const getPostHogClient = (): typeof posthog | null => {
  return posthogClient;
};
```

- [ ] **Step 2: Verify file created**

Run: `ls -la frontend/src/lib/posthog.ts`
Expected: File exists

- [ ] **Step 3: Commit**

```bash
git add frontend/src/lib/posthog.ts
git commit -m "feat(frontend): add PostHog client initialization module"
```

---

### Task 3: Create PostHog React Provider (Frontend)

**Files:**
- Create: `frontend/src/contexts/PostHogContext.tsx`
- Test: `frontend/src/__tests__/PostHogContext.test.tsx`

**Interfaces:**
- Consumes: `initPostHog()` from `@/lib/posthog`, `posthog-js/react`
- Produces: `PostHogProvider` component, `usePostHogContext()` hook

- [ ] **Step 1: Write the failing test**

Create `frontend/src/__tests__/PostHogContext.test.tsx`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { PostHogProvider } from "@/contexts/PostHogContext";

vi.mock("@/lib/posthog", () => ({
  initPostHog: vi.fn(() => null),
  getPostHogClient: vi.fn(() => null),
}));

vi.mock("posthog-js/react", () => ({
  PostHogProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="posthog-provider">{children}</div>
  ),
}));

describe("PostHogProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders children without crashing", () => {
    render(
      <PostHogProvider>
        <div data-testid="child">Test Child</div>
      </PostHogProvider>
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npm test -- --run PostHogContext`
Expected: FAIL with "Cannot find module" or similar

- [ ] **Step 3: Write the PostHogProvider component**

Create `frontend/src/contexts/PostHogContext.tsx`:

```typescript
"use client";

import { useEffect, createContext, useContext, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { initPostHog, getPostHogClient } from "@/lib/posthog";

interface PostHogContextType {
  isInitialized: boolean;
}

const PostHogContext = createContext<PostHogContextType>({
  isInitialized: false,
});

// skipcq: JS-0067
export function PostHogProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    initPostHog();
  }, []);

  useEffect(() => {
    const client = getPostHogClient();
    if (client && pathname) {
      let url = window.origin + pathname;
      if (searchParams?.toString()) {
        url = url + "?" + searchParams.toString();
      }
      client.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams]);

  const client = getPostHogClient();

  if (!client) {
    return <>{children}</>;
  }

  return (
    <PHProvider client={client}>
      <PostHogContext.Provider value={{ isInitialized: true }}>
        {children}
      </PostHogContext.Provider>
    </PHProvider>
  );
}

export const usePostHogContext = () => useContext(PostHogContext);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npm test -- --run PostHogContext`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/contexts/PostHogContext.tsx frontend/src/__tests__/PostHogContext.test.tsx
git commit -m "feat(frontend): add PostHogProvider context with pageview tracking"
```

---

### Task 4: Integrate PostHogProvider into Layout

**Files:**
- Modify: `frontend/src/app/layout.tsx:1-94`

**Interfaces:**
- Consumes: `PostHogProvider` from `@/contexts/PostHogContext`
- Produces: PostHog available in all pages

- [ ] **Step 1: Add PostHogProvider import**

In `frontend/src/app/layout.tsx`, add import after line 13:

```typescript
import { PostHogProvider } from "@/contexts/PostHogContext";
```

- [ ] **Step 2: Wrap the app with PostHogProvider**

In `frontend/src/app/layout.tsx`, wrap the body content with PostHogProvider. Change the body content (lines 70-90) to:

```typescript
        <PostHogProvider>
          <ThemeProvider>
            <LanguageProvider>
              <AuthProvider>
                <SubscriptionProvider>
                  <HighlightProvider>
                    <ProgressProvider>
                      <PatternProgressProvider>
                        <FilterProvider>
                          <SearchProvider>
                            <GlobalSearchHandler />
                            <Header />
                            <main className="flex-1">{children}</main>
                          </SearchProvider>
                        </FilterProvider>
                      </PatternProgressProvider>
                    </ProgressProvider>
                  </HighlightProvider>
                </SubscriptionProvider>
              </AuthProvider>
            </LanguageProvider>
          </ThemeProvider>
        </PostHogProvider>
```

- [ ] **Step 3: Verify build passes**

Run: `cd frontend && npm run build`
Expected: Build succeeds without errors

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/layout.tsx
git commit -m "feat(frontend): integrate PostHogProvider into root layout"
```

---

### Task 5: Add User Identification to AuthContext

**Files:**
- Modify: `frontend/src/contexts/AuthContext.tsx:1-190`

**Interfaces:**
- Consumes: `getPostHogClient()` from `@/lib/posthog`
- Produces: PostHog `identify()` called on login, `reset()` called on logout

- [ ] **Step 1: Add PostHog import**

In `frontend/src/contexts/AuthContext.tsx`, add import after line 11:

```typescript
import { getPostHogClient } from "@/lib/posthog";
```

- [ ] **Step 2: Add identify call in login success**

In the `login` callback (around line 77-92), after `setUser(response.data.user)` (line 81), add:

```typescript
        const posthog = getPostHogClient();
        if (posthog && response.data.user.id) {
          posthog.identify(response.data.user.id);
        }
```

- [ ] **Step 3: Add identify call in register success**

In the `register` callback (around line 94-109), after `setUser(response.data.user)` (line 98), add:

```typescript
        const posthog = getPostHogClient();
        if (posthog && response.data.user.id) {
          posthog.identify(response.data.user.id);
          posthog.capture("user_signed_up", { method: "email" });
        }
```

- [ ] **Step 4: Add reset call in logout**

In the `logout` callback (around line 111-119), inside the `finally` block after `setUser(null)` (line 115), add:

```typescript
      const posthog = getPostHogClient();
      if (posthog) {
        posthog.reset();
      }
```

- [ ] **Step 5: Add identify and capture in Google callback success**

In the `handleGoogleCallback` callback (around line 133-163), after `setUser(response.data.user)` (line 147), add:

```typescript
          const posthog = getPostHogClient();
          if (posthog && response.data.user.id) {
            posthog.identify(response.data.user.id);
            posthog.capture("user_signed_up", { method: "google" });
          }
```

- [ ] **Step 6: Add identify in refreshUser on success**

In the `refreshUser` callback (lines 41-56), after `setUser(response.data)` (line 45), add:

```typescript
        const posthog = getPostHogClient();
        if (posthog && response.data?.id) {
          posthog.identify(response.data.id);
        }
```

- [ ] **Step 7: Verify lint passes**

Run: `cd frontend && npm run lint`
Expected: No errors

- [ ] **Step 8: Commit**

```bash
git add frontend/src/contexts/AuthContext.tsx
git commit -m "feat(frontend): add PostHog user identification on auth events"
```

---

### Task 6: Add Environment Variables (Frontend)

**Files:**
- Modify: `frontend/.env.local` (local only, don't commit)

**Interfaces:**
- Consumes: PostHog project API key from PostHog Cloud
- Produces: `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` available at runtime

- [ ] **Step 1: Add environment variables to local env**

Add to `frontend/.env.local`:

```
NEXT_PUBLIC_POSTHOG_KEY=phc_your_project_api_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

- [ ] **Step 2: Verify dev server starts**

Run: `cd frontend && npm run dev`
Expected: Server starts, check console for "PostHog API key not configured" warning (expected until real key is added)

- [ ] **Step 3: No commit needed for local env file**

Local `.env.local` should be in `.gitignore`. Skip commit.

---

### Task 7: Create PostHog Client (Backend)

**Files:**
- Create: `backend/internal/posthog/client.go`

**Interfaces:**
- Consumes: `github.com/posthog/posthog-go`, config values
- Produces: `Client` struct with `Capture(distinctID string, event string, properties map[string]any)`, `Close()`, `NewClient(apiKey, host string) *Client`

- [ ] **Step 1: Create the posthog package directory**

Run: `mkdir -p backend/internal/posthog`

- [ ] **Step 2: Create the client module**

Create `backend/internal/posthog/client.go`:

```go
package posthog

import (
	"github.com/posthog/posthog-go"
)

// Client wraps the PostHog client for analytics
type Client struct {
	client  posthog.Client
	enabled bool
}

// NewClient creates a new PostHog client. If apiKey is empty, returns a no-op client.
func NewClient(apiKey, host string) *Client {
	if apiKey == "" {
		return &Client{enabled: false}
	}

	endpoint := host
	if endpoint == "" {
		endpoint = "https://us.i.posthog.com"
	}

	client, _ := posthog.NewWithConfig(apiKey, posthog.Config{
		Endpoint: endpoint,
	})

	return &Client{
		client:  client,
		enabled: true,
	}
}

// Capture sends an event to PostHog
func (c *Client) Capture(distinctID, event string, properties map[string]any) {
	if !c.enabled || c.client == nil {
		return
	}

	props := posthog.NewProperties()
	for k, v := range properties {
		props.Set(k, v)
	}

	_ = c.client.Enqueue(posthog.Capture{
		DistinctId: distinctID,
		Event:      event,
		Properties: props,
	})
}

// Identify sets user properties in PostHog
func (c *Client) Identify(distinctID string, properties map[string]any) {
	if !c.enabled || c.client == nil {
		return
	}

	props := posthog.NewProperties()
	for k, v := range properties {
		props.Set(k, v)
	}

	_ = c.client.Enqueue(posthog.Identify{
		DistinctId: distinctID,
		Properties: props,
	})
}

// Close flushes pending events and closes the client
func (c *Client) Close() error {
	if !c.enabled || c.client == nil {
		return nil
	}
	return c.client.Close()
}

// IsEnabled returns whether the client is configured
func (c *Client) IsEnabled() bool {
	return c.enabled
}
```

- [ ] **Step 3: Verify file compiles**

Run: `cd backend && go build ./internal/posthog/...`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add backend/internal/posthog/client.go
git commit -m "feat(backend): add PostHog client wrapper"
```

---

### Task 8: Add PostHog Config to Backend

**Files:**
- Modify: `backend/internal/config/config.go:12-262`

**Interfaces:**
- Consumes: Environment variables `POSTHOG_API_KEY`, `POSTHOG_HOST`
- Produces: `PostHogConfig` struct in `Config`, loaded from env

- [ ] **Step 1: Add PostHogConfig struct**

In `backend/internal/config/config.go`, after the `SentryConfig` struct (around line 41), add:

```go
type PostHogConfig struct {
	APIKey string
	Host   string
}
```

- [ ] **Step 2: Add PostHog field to Config struct**

In the `Config` struct (lines 12-23), add after `Sentry SentryConfig` (line 22):

```go
	PostHog PostHogConfig
```

- [ ] **Step 3: Load PostHog config in Load function**

In the `Load()` function (lines 141-262), add after the Sentry config block (after line 254), before the closing brace of the cfg initialization:

```go
		PostHog: PostHogConfig{
			APIKey: getEnv("POSTHOG_API_KEY", ""),
			Host:   getEnv("POSTHOG_HOST", "https://us.i.posthog.com"),
		},
```

- [ ] **Step 4: Verify build passes**

Run: `cd backend && go build ./...`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add backend/internal/config/config.go
git commit -m "feat(backend): add PostHog configuration"
```

---

### Task 9: Initialize PostHog Client in Server Main

**Files:**
- Modify: `backend/cmd/server/main.go:1-403`

**Interfaces:**
- Consumes: `posthog.NewClient()` from `internal/posthog`, `cfg.PostHog`
- Produces: PostHog client available for handlers

- [ ] **Step 1: Add import**

In `backend/cmd/server/main.go`, add import after line 27 (in the import block):

```go
	"github.com/imrishuroy/algopatterns/internal/posthog"
```

- [ ] **Step 2: Initialize PostHog client**

After the AI service initialization (around line 243, after `log.Info().Msg("AI service disabled")`), add:

```go
	posthogClient := posthog.NewClient(cfg.PostHog.APIKey, cfg.PostHog.Host)
	defer posthogClient.Close()
	if posthogClient.IsEnabled() {
		log.Info().Msg("PostHog analytics initialized")
	}
```

- [ ] **Step 3: Update setupRouter function signature**

Modify the `setupRouter` function signature (line 285) to add `posthogClient *posthog.Client` as the last parameter:

```go
func setupRouter(cfg *config.Config, db *repository.Database, patternService *services.PatternService, authService *services.AuthService, oauthService *services.OAuthService, sessionService *services.SessionService, progressService *services.ProgressService, problemService *services.ProblemService, submissionService *services.SubmissionService, highlightService *services.HighlightService, patternProgressService *services.PatternProgressService, quizService *services.QuizService, searchService *services.SearchService, paymentService *services.PaymentService, webhookService *services.WebhookService, featureAccess *services.FeatureAccess, aiService *ai.Service, posthogClient *posthog.Client) *gin.Engine {
```

- [ ] **Step 4: Update setupRouter call**

Update the call site (line 246) to pass posthogClient:

```go
	router := setupRouter(cfg, db, patternService, authService, oauthService, sessionService, progressService, problemService, submissionService, highlightService, patternProgressService, quizService, searchService, paymentService, webhookService, featureAccess, aiService, posthogClient)
```

- [ ] **Step 5: Verify build passes**

Run: `cd backend && go build ./cmd/server/...`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add backend/cmd/server/main.go
git commit -m "feat(backend): initialize PostHog client in server"
```

---

### Task 10: Add PostHog Events to Auth Handler

**Files:**
- Modify: `backend/internal/handlers/auth_handler.go:1-342`

**Interfaces:**
- Consumes: `*posthog.Client`
- Produces: `user_registered` event emitted on registration

- [ ] **Step 1: Add posthogClient field to AuthHandler**

In `backend/internal/handlers/auth_handler.go`, modify the `AuthHandler` struct (lines 21-25) to add a posthogClient field:

```go
type AuthHandler struct {
	authService   *services.AuthService
	authMW        *middleware.AuthMiddleware
	secureCookie  bool
	posthogClient interface {
		Capture(distinctID, event string, properties map[string]any)
	}
}
```

- [ ] **Step 2: Update constructor**

Modify `NewAuthHandler` (lines 27-33) to accept posthogClient:

```go
func NewAuthHandler(authService *services.AuthService, authMW *middleware.AuthMiddleware, secureCookie bool, posthogClient interface {
	Capture(distinctID, event string, properties map[string]any)
}) *AuthHandler {
	return &AuthHandler{
		authService:   authService,
		authMW:        authMW,
		secureCookie:  secureCookie,
		posthogClient: posthogClient,
	}
}
```

- [ ] **Step 3: Add capture call in Register**

In the `Register` method (lines 55-94), before `response.Created` (line 89), add:

```go
	if h.posthogClient != nil {
		h.posthogClient.Capture(user.ID.String(), "user_registered", map[string]any{
			"method": "email",
		})
	}
```

- [ ] **Step 4: Update constructor call in main.go**

In `backend/cmd/server/main.go`, update the `NewAuthHandler` call (around line 338):

```go
		authHandler := handlers.NewAuthHandler(authService, authMW, secureCookie, posthogClient)
```

- [ ] **Step 5: Verify build passes**

Run: `cd backend && go build ./...`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add backend/internal/handlers/auth_handler.go backend/cmd/server/main.go
git commit -m "feat(backend): emit user_registered event to PostHog"
```

---

### Task 11: Add PostHog Events to Payment Handler

**Files:**
- Modify: `backend/internal/handlers/payment_handler.go:1-311`

**Interfaces:**
- Consumes: `*posthog.Client`
- Produces: `subscription_activated` event emitted on payment verification

- [ ] **Step 1: Add posthogClient field to PaymentHandler**

In `backend/internal/handlers/payment_handler.go`, modify the `PaymentHandler` struct (lines 22-26):

```go
type PaymentHandler struct {
	paymentService *services.PaymentService
	webhookService *services.WebhookService
	authMW         *middleware.AuthMiddleware
	posthogClient  interface {
		Capture(distinctID, event string, properties map[string]any)
	}
}
```

- [ ] **Step 2: Update constructor**

Modify `NewPaymentHandler` (lines 28-38):

```go
func NewPaymentHandler(
	paymentService *services.PaymentService,
	webhookService *services.WebhookService,
	authMW *middleware.AuthMiddleware,
	posthogClient interface {
		Capture(distinctID, event string, properties map[string]any)
	},
) *PaymentHandler {
	return &PaymentHandler{
		paymentService: paymentService,
		webhookService: webhookService,
		authMW:         authMW,
		posthogClient:  posthogClient,
	}
}
```

- [ ] **Step 3: Add capture call in VerifyPayment**

In the `VerifyPayment` method (lines 127-154), before `response.OK(c, result)` (line 153), add:

```go
	if h.posthogClient != nil {
		h.posthogClient.Capture(userID.String(), "subscription_activated", map[string]any{
			"order_id": req.RazorpayOrderID,
		})
	}
```

- [ ] **Step 4: Update constructor call in main.go**

In `backend/cmd/server/main.go`, update the `NewPaymentHandler` call (around line 365):

```go
		paymentHandler := handlers.NewPaymentHandler(paymentService, webhookService, authMW, posthogClient)
```

- [ ] **Step 5: Verify build passes**

Run: `cd backend && go build ./...`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add backend/internal/handlers/payment_handler.go backend/cmd/server/main.go
git commit -m "feat(backend): emit subscription_activated event to PostHog"
```

---

### Task 12: Add PostHog to Marketing Site

**Files:**
- Modify: `public/index.html:1-100`
- Modify: `public/app.js:1-100`

**Interfaces:**
- Consumes: PostHog script tag
- Produces: PostHog tracking on marketing site

- [ ] **Step 1: Add PostHog script to index.html**

In `public/index.html`, add after the Tailwind config script (after line 48, before the `<style>` tag), add:

```html
    <!-- PostHog Analytics -->
    <script>
        !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys onSessionId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    </script>
    <script src="posthog-init.js"></script>
```

- [ ] **Step 2: Create posthog-init.js file**

Create `public/posthog-init.js`:

```javascript
// PostHog initialization for marketing site
// Replace POSTHOG_API_KEY with your actual key in production
(function() {
    var apiKey = ''; // Set via deployment or replace with actual key
    if (apiKey) {
        posthog.init(apiKey, {
            api_host: 'https://us.i.posthog.com',
            capture_pageview: true,
            autocapture: true
        });
    }
})();
```

- [ ] **Step 3: Add event tracking helper to app.js**

In `public/app.js`, add at the top after line 3 (after `const STORAGE_KEY`):

```javascript
// PostHog tracking helper
const trackEvent = (event, properties = {}) => {
    if (typeof posthog !== 'undefined' && posthog.capture) {
        posthog.capture(event, properties);
    }
};
```

- [ ] **Step 4: Verify HTML is valid**

Open `public/index.html` in a browser and check console for errors.
Expected: No JavaScript errors

- [ ] **Step 5: Commit**

```bash
git add public/index.html public/app.js public/posthog-init.js
git commit -m "feat(marketing): add PostHog tracking to marketing site"
```

---

### Task 13: Verification and Testing

**Files:**
- None (manual verification)

**Interfaces:**
- Consumes: All previous tasks completed
- Produces: Verified working PostHog integration

- [ ] **Step 1: Start frontend dev server**

Run: `cd frontend && npm run dev`
Expected: Server starts without errors

- [ ] **Step 2: Open browser console**

Open http://localhost:3000 in browser, open DevTools console.
Expected: PostHog debug logs visible (if key configured) or "PostHog API key not configured" warning

- [ ] **Step 3: Start backend server**

Run: `cd backend && make run-dev`
Expected: Server starts, logs "PostHog analytics initialized" if key configured

- [ ] **Step 4: Verify all tests pass**

Run: `cd frontend && npm test -- --run`
Run: `cd backend && make test`
Expected: All tests pass

- [ ] **Step 5: Verify lint passes**

Run: `cd frontend && npm run lint`
Run: `cd backend && make lint`
Expected: No errors

- [ ] **Step 6: Final review**

Review all changes with `git diff HEAD~13` to ensure everything is correct.

---

## PostHog Cloud Setup Instructions

Before running the application with PostHog enabled:

1. **Create PostHog Account**
   - Go to https://posthog.com
   - Sign up for free account
   - Select US or EU region

2. **Create Project**
   - Create a new project in PostHog dashboard
   - Copy the Project API Key from Project Settings

3. **Configure Environment Variables**
   
   Frontend (`frontend/.env.local`):
   ```
   NEXT_PUBLIC_POSTHOG_KEY=phc_your_key_here
   NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
   ```
   
   Backend (`backend/.env`):
   ```
   POSTHOG_API_KEY=phc_your_key_here
   POSTHOG_HOST=https://us.i.posthog.com
   ```
   
   Marketing Site (`public/posthog-init.js`):
   ```javascript
   var apiKey = 'phc_your_key_here';
   ```

4. **Verify in PostHog Dashboard**
   - Go to PostHog dashboard
   - Check Events tab for incoming events
   - Check Recordings tab for session replays
