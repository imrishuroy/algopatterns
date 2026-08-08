# PostHog Integration Design

Date: 2026-08-08

## Overview

Integrate PostHog analytics across the AlgoPatterns platform to enable product analytics, conversion tracking, A/B testing (future), and session replay.

## Goals

1. **Product Analytics:** Understand user behavior, feature usage, and drop-off points
2. **Conversion Tracking:** Track free-to-paid funnel, pricing page effectiveness
3. **Session Replay:** Debug UX issues by watching user sessions
4. **Future A/B Testing:** Infrastructure ready for experiments (not implemented initially)

## Scope

| Component | Integration |
|-----------|-------------|
| Next.js Frontend | `posthog-js` SDK with React provider |
| Go Backend | `posthog-go` SDK for server-side events |
| Marketing Site (public/) | `posthog-js` script tag |

## Non-Goals

- Feature flags (deferred to future iteration)
- Self-hosted PostHog (using PostHog Cloud)
- Replacing Google Analytics (keeping GA4 alongside PostHog)

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        PostHog Cloud                            │
│                    (us.i.posthog.com)                           │
└─────────────────────────────────────────────────────────────────┘
                    ▲              ▲              ▲
                    │              │              │
            posthog-js      posthog-js      posthog-go
                    │              │              │
┌───────────────────┴──┐  ┌────────┴───────┐  ┌──┴──────────────┐
│   Next.js Frontend   │  │  Marketing Site │  │   Go Backend    │
│   (App Router)       │  │  (public/)      │  │   (Gin API)     │
│                      │  │                 │  │                 │
│ - PostHogProvider    │  │ - Script tag    │  │ - posthog-go    │
│ - usePostHog hook    │  │ - Manual events │  │ - Server events │
│ - Auto pageviews     │  │ - Pageviews     │  │ - Webhooks      │
│ - Session replay     │  │                 │  │ - Auth events   │
└──────────────────────┘  └─────────────────┘  └─────────────────┘
```

## User Identification

- Anonymous users get auto-generated `distinct_id` from PostHog
- On login/register, call `posthog.identify(userId)` with database user ID
- Backend uses same `userId` for server-side events
- PostHog merges anonymous and identified events automatically
- Only user ID passed (no email or profile data for privacy)

## Events

### Auto-Captured (No Code Required)

- Pageviews (all route changes)
- Clicks (with element selectors)
- Form submissions
- Session recordings

### Frontend Custom Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `user_signed_up` | Registration success | `method: "email" \| "google"` |
| `user_logged_in` | Login success | `method: "email" \| "google"` |
| `user_logged_out` | Logout | - |
| `pattern_viewed` | Pattern page load | `pattern_slug`, `pattern_name` |
| `pattern_section_completed` | Mark section done | `pattern_slug`, `section_index` |
| `problem_viewed` | Problem page load | `problem_slug`, `difficulty`, `pattern` |
| `code_run` | Run button clicked | `problem_slug`, `language` |
| `code_submitted` | Submit button clicked | `problem_slug`, `language` |
| `submission_result` | Result received | `problem_slug`, `status`, `passed_count`, `total_count` |
| `quiz_started` | Start quiz | `pattern_slug` |
| `quiz_question_answered` | Answer submitted | `pattern_slug`, `is_correct` |
| `quiz_completed` | Quiz finished | `pattern_slug`, `score`, `total` |
| `search_performed` | Search executed | `query`, `mode: "keyword" \| "ai"`, `results_count` |
| `search_result_clicked` | Result selected | `query`, `result_type`, `result_slug` |
| `ai_chat_message_sent` | Chat message sent | `session_id`, `message_length` |
| `ai_hint_requested` | Hint button clicked | `problem_slug` |
| `pricing_page_viewed` | Pricing page load | - |
| `plan_selected` | Plan card clicked | `plan: "monthly" \| "yearly" \| "lifetime"` |
| `checkout_started` | Checkout modal opened | `plan`, `amount` |
| `payment_completed` | Payment verified | `plan`, `amount`, `discount_code` |
| `highlight_created` | Text highlighted | `content_type`, `color` |
| `theme_toggled` | Theme switch | `theme: "dark" \| "light"` |
| `language_changed` | Code language switch | `language` |

### Backend Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `user_registered` | POST /auth/register | `method` |
| `payment_webhook_received` | Razorpay webhook | `event_type`, `plan`, `amount` |
| `subscription_activated` | Payment verified | `plan`, `duration_days` |
| `subscription_cancelled` | Cancel request | `reason`, `days_remaining` |
| `code_execution_completed` | Judge0 callback | `problem_slug`, `language`, `status`, `execution_time_ms` |

### Marketing Site Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `marketing_page_viewed` | Page load | `page: "home"` |
| `question_filter_applied` | Filter changed | `filter_type`, `filter_value` |
| `question_completed_toggled` | Checkbox clicked | `question_id`, `completed` |
| `pattern_tutorial_opened` | Tutorial modal | `pattern_name` |
| `cta_clicked` | "Get Started" clicked | `location` |

## Session Replay

### Configuration

| Setting | Value | Reason |
|---------|-------|--------|
| `maskAllInputs` | `true` | Hide sensitive form data |
| `maskTextContent` | `false` | Keep text visible for context |
| `captureConsoleLogs` | `true` | Debug JavaScript errors |
| `captureNetworkRequests` | `true` | See API calls and failures |
| `recordCrossOriginIframes` | `false` | Not needed |

### Sampling Rates

| User Type | Sample Rate | Reason |
|-----------|-------------|--------|
| Free users | 10% | Reduce volume |
| Pro users | 50% | More valuable to understand |
| Error sessions | 100% | Always capture sessions with errors |

### Privacy Safeguards

- All `<input>` fields masked by default
- Add `data-ph-no-capture` attribute to sensitive elements
- Session recordings disabled for users who decline cookies (future consent banner)

## Environment Variables

### Frontend (.env.local)

```
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

### Backend (.env)

```
POSTHOG_API_KEY=phc_xxxxxxxxxxxx
POSTHOG_HOST=https://us.i.posthog.com
```

## Files to Create

| File | Purpose |
|------|---------|
| `frontend/src/lib/posthog.ts` | PostHog client initialization |
| `frontend/src/contexts/PostHogContext.tsx` | React provider with identify logic |
| `backend/internal/posthog/client.go` | Go PostHog client singleton |

## Files to Modify

| File | Changes |
|------|---------|
| `frontend/src/app/layout.tsx` | Add PostHogProvider wrapper |
| `frontend/src/contexts/AuthContext.tsx` | Call `posthog.identify()` on login, `posthog.reset()` on logout |
| `backend/internal/config/config.go` | Add PostHog config fields |
| `backend/cmd/server/main.go` | Initialize PostHog client |
| `backend/internal/handlers/auth_handler.go` | Emit `user_registered` event |
| `backend/internal/handlers/payment_handler.go` | Emit payment events |
| `public/index.html` | Add PostHog script tag |
| `public/app.js` | Add event tracking calls |

## Dependencies

### Frontend

```bash
npm install posthog-js
```

### Backend

```bash
go get github.com/posthog/posthog-go
```

## PostHog Cloud Setup

1. Create account at https://posthog.com
2. Create new project (select US or EU region)
3. Copy Project API Key from Project Settings
4. Set environment variables with the key and host

## Testing and Verification

### Development Testing

| Check | Method |
|-------|--------|
| Events firing | Enable `posthog.debug()` in development |
| Correct properties | Check network tab for `/capture` requests |
| User identification | Verify `distinct_id` changes after login |
| Session replay | Check Replays tab in PostHog dashboard |

### Verification Checklist

1. Anonymous user flow: Visit site, events have auto-generated `distinct_id`
2. Login flow: Login triggers `identify()`, subsequent events use `userId`
3. Cross-device: Same user ID links events across devices
4. Backend events: Payment webhook appears in PostHog with correct user
5. Marketing site: Visit public/ site, separate pageview events captured
6. Session replay: Recording visible in PostHog Replays tab

### Frontend Tests

Simple test to verify provider renders:

```typescript
it('renders children without crashing', () => {
  render(<PostHogProvider><div>Test</div></PostHogProvider>)
})
```

### Backend

No mocking needed. PostHog Go SDK is fire-and-forget with async batching. Skip initialization in test mode.

## GA4 Coexistence

Keep Google Analytics 4 running alongside PostHog:
- GA4: SEO attribution, Google Ads integration, Search Console data
- PostHog: Product analytics, session replay, funnels, user behavior

No changes to existing GA4 setup.

## Future Enhancements

- Feature flags for gradual rollouts
- A/B testing experiments
- Custom dashboards and insights
- Cohort analysis
- Retention tracking
