# About

This document describes the design of the payment and subscription feature for AlgoPatterns. It covers the motivation, architecture, data model, idempotency guarantees, and implementation considerations for monetizing the platform through premium subscriptions. This is a living document and may be updated as the implementation evolves.

# Overview

AlgoPatterns is an educational platform for learning algorithm patterns through code templates, insights, tutorials, visualizers, and quizzes. The primary design goals for the payment feature are **reliability**, **idempotency**, and **seamless user experience**. Users should be able to upgrade to premium plans with confidence that their payment will be processed exactly once, their subscription status will be reflected immediately, and premium features will unlock without manual intervention.

The initial implementation focuses on **Indian payments via Razorpay**, with architecture designed to support international payment providers (DodoPayments, LemonSqueezy) in the future. Razorpay was chosen for its comprehensive support of Indian payment methods (UPI, cards, netbanking, wallets), low fees (2% + GST), and robust subscription management APIs.

The payment flow centers on three core operations: order creation, payment verification, and subscription activation. Each operation is designed to be idempotent—repeated requests with the same parameters produce the same result without duplicating side effects. This is critical because network failures, webhook retries, and user actions (double-clicking, refreshing) can all cause duplicate requests.

AlgoPatterns achieves reliability:
- Idempotent order creation using client-generated idempotency keys
- Webhook signature verification prevents forged payment confirmations
- Database transactions ensure subscription activation is atomic
- Graceful degradation when Razorpay is unavailable (cached subscription status)

AlgoPatterns achieves idempotency:
- Idempotency keys stored in database with TTL for deduplication
- Razorpay order IDs are stable identifiers for payment attempts
- Webhook handlers check existing state before processing
- All state transitions are guarded by current state checks

AlgoPatterns achieves seamless UX:
- Optimistic UI shows upgrade in progress immediately
- Webhook processing completes subscription activation asynchronously
- Polling fallback if webhook is delayed
- Clear error messages with retry guidance

# Pricing Strategy

## Subscription Tiers

| Tier | Display Price | Actual Price | Savings | Billing |
|------|---------------|--------------|---------|---------|
| **Free** | ₹0 | ₹0 | - | - |
| **Pro Monthly** | ₹299 | ₹299 | - | Monthly |
| **Pro Yearly** | ~~₹3,588~~ ₹1,200 | ₹1,200 | 67% off | Yearly |
| **Pro Lifetime** | ~~₹5,000~~ ₹2,500 | ₹2,500 | 50% off | One-time |

**Anchor Pricing Strategy:**
- Monthly at ₹299 is the anchor price
- Yearly shows ~~₹3,588~~ (₹299 × 12) struck through → ₹1,200 (saves ₹2,388)
- Lifetime shows ~~₹5,000~~ struck through → ₹2,500 (50% off)

The yearly plan is positioned as the default/recommended option with "Save 67%" badge. Lifetime is offered for early adopters and users who prefer one-time purchases.

**Key Value Proposition**: All plans include access to **all future patterns, visualizers, and features** at no additional cost. This is prominently displayed during checkout to increase perceived value.

**International Pricing (USD):**
| Tier | Display Price | Actual Price |
|------|---------------|--------------|
| Monthly | $5 | $5 |
| Yearly | ~~$60~~ $19 | $19 |
| Lifetime | ~~$80~~ $39 | $39 |

## Discount Codes

Support for promotional discount codes during checkout:

| Code Type | Example | Behavior |
|-----------|---------|----------|
| Percentage | `LAUNCH50` | 50% off, shown as strikethrough |
| Fixed Amount | `FLAT500` | ₹500 off |
| First Purchase | `WELCOME20` | 20% off, single use per user |

Discount codes are validated server-side before checkout. The UI shows:
- Original price (strikethrough)
- Discounted price
- GST (18% on discounted amount)
- Final total

## GST Handling

For Indian payments, 18% GST is added to all plans:

| Plan | Base Price | GST (18%) | Total |
|------|------------|-----------|-------|
| Monthly | ₹299 | ₹53.82 | ₹352.82 |
| Yearly | ₹1,200 | ₹216 | ₹1,416 |
| Lifetime | ₹2,500 | ₹450 | ₹2,950 |

GST is displayed separately in checkout for transparency, similar to the DodoPayments UI pattern.

**Note:** The strikethrough "original" prices (₹3,588, ₹5,000) are display-only anchors. GST is calculated on the actual discounted price.

## Feature Allocation

### Free Tier Features
| Feature | Limit | Rationale |
|---------|-------|-----------|
| Patterns | 2 full (Two Pointers, Hash Map) | Hook value, SEO |
| Pattern previews | All 15 (intro only) | Discovery, upgrade motivation |
| Visualizers | 5 basic | Demo capability |
| Quiz | 3 questions per pattern | Taste of quality |
| Progress sync | Local storage only | Upsell to cloud sync |
| Code playground | View only | Upsell to execution |

### Pro Tier Features
| Feature | Access | Value |
|---------|--------|-------|
| All patterns | Full access to 15 patterns | Core product |
| All visualizers | 57+ interactive visualizers | High effort content |
| Full quiz system | Unlimited questions + history | Learning validation |
| Code playground | Run and submit code | Expensive (servers) |
| Progress sync | Cross-device cloud sync | Retention driver |
| Highlighting | Annotate and save notes | Storage cost |
| Solutions | Detailed problem solutions | Key learning aid |
| Offline export | PDF download | Convenience |

# Architecture

AlgoPatterns implements a layered architecture for the payment feature. The frontend handles checkout UI and subscription state display. The backend manages payment orchestration, webhook processing, and subscription lifecycle. Razorpay handles the actual payment processing.

```
┌───────────────────────────────────────────────────────────────────────┐
│                       Frontend (Next.js 16)                           │
│                                                                       │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────────┐ │
│  │   Pricing    │    │  Checkout    │    │    Subscription          │ │
│  │    Page      │───▶│   Modal      │───▶│      Context             │ │
│  └──────────────┘    └──────────────┘    └──────────────────────────┘ │
│                             │                       │                 │
│                             ▼                       │                 │
│                      ┌──────────────┐               │                 │
│                      │   Razorpay   │               │                 │
│                      │   Checkout   │               │                 │
│                      │   (SDK)      │               │                 │
│                      └──────────────┘               │                 │
│                                                     │                 │
└─────────────────────────────────────────────────────┼─────────────────┘
                                                      │
                                                      │ HTTPS
                                                      ▼
┌───────────────────────────────────────────────────────────────────────┐
│                          Backend (Go)                                 │
│                                                                       │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────────┐ │
│  │   Payment    │    │   Payment    │    │      Payment             │ │
│  │   Handler    │───▶│   Service    │───▶│      Repository          │ │
│  └──────────────┘    └──────────────┘    └──────────────────────────┘ │
│         │                   │                       │                 │
│         │                   ▼                       │                 │
│         │            ┌──────────────┐               │                 │
│         │            │  Razorpay    │               │                 │
│         │            │   Client     │               │                 │
│         │            └──────────────┘               │                 │
│         ▼                                           │                 │
│  ┌──────────────┐    ┌──────────────┐               │                 │
│  │   Webhook    │    │  Idempotency │               │                 │
│  │   Handler    │───▶│   Service    │               │                 │
│  └──────────────┘    └──────────────┘               │                 │
│                                                     │                 │
└─────────────────────────────────────────────────────┼─────────────────┘
                                                      │
                    ┌─────────────────────────────────┼─────────────────┐
                    │                                 │                 │
                    ▼                                 ▼                 │
          ┌──────────────────┐              ┌──────────────────┐        │
          │   CockroachDB    │              │     Razorpay     │        │
          │   (subscriptions │              │    (payments)    │        │
          │    payments,     │              │                  │        │
          │    idempotency)  │              │                  │        │
          └──────────────────┘              └──────────────────┘        │
                    ▲                                 │                 │
                    │            Webhooks             │                 │
                    └─────────────────────────────────┘                 │
```

## Component Responsibilities

**Pricing Page**: Displays subscription plans with pricing, feature comparison, and upgrade CTAs. Detects user region for currency display (INR for India).

**Checkout Modal**: Initiates payment flow by creating an order via backend, then launches Razorpay checkout SDK with order details.

**Subscription Context**: Maintains user's subscription state in React context. Provides `isPro`, `tier`, `features`, and `expiresAt` to components. Refreshes on login and after successful payment.

**Payment Handler**: REST API endpoints for order creation, payment verification, and subscription management.

**Payment Service**: Business logic for payment orchestration. Communicates with Razorpay API, manages idempotency, and coordinates subscription activation.

**Webhook Handler**: Receives Razorpay webhook events (payment.captured, subscription.activated, etc.). Verifies signatures and updates subscription state.

**Idempotency Service**: Manages idempotency keys to prevent duplicate order creation and payment processing.

**Razorpay Client**: Wrapper around Razorpay API with retry logic, timeout handling, and error normalization.

# Payment Flow

## One-Time Payment Flow (Lifetime Plan)

```
┌─────────┐          ┌─────────┐          ┌─────────┐          ┌─────────┐
│ Browser │          │ Backend │          │Razorpay │          │ Webhook │
└────┬────┘          └────┬────┘          └────┬────┘          └────┬────┘
     │                    │                    │                    │
     │ POST /orders       │                    │                    │
     │ {plan, idempotency}│                    │                    │
     │───────────────────▶│                    │                    │
     │                    │                    │                    │
     │                    │ Check idempotency  │                    │
     │                    │ key in DB          │                    │
     │                    │─────────┐          │                    │
     │                    │         │          │                    │
     │                    │◀────────┘          │                    │
     │                    │                    │                    │
     │                    │ If new: create     │                    │
     │                    │ Razorpay order     │                    │
     │                    │───────────────────▶│                    │
     │                    │                    │                    │
     │                    │      order_id      │                    │
     │                    │◀───────────────────│                    │
     │                    │                    │                    │
     │                    │ Store order in DB  │                    │
     │                    │ with idempotency   │                    │
     │                    │─────────┐          │                    │
     │                    │         │          │                    │
     │                    │◀────────┘          │                    │
     │                    │                    │                    │
     │ {order_id, key_id} │                    │                    │
     │◀───────────────────│                    │                    │
     │                    │                    │                    │
     │ Open Razorpay      │                    │                    │
     │ Checkout Modal     │                    │                    │
     │════════════════════════════════════════▶│                    │
     │                    │                    │                    │
     │      User completes payment             │                    │
     │◀════════════════════════════════════════│                    │
     │                    │                    │                    │
     │ POST /verify       │                    │                    │
     │ {payment_id,       │                    │                    │
     │  order_id,         │                    │                    │
     │  signature}        │                    │                    │
     │───────────────────▶│                    │                    │
     │                    │                    │                    │
     │                    │ Verify signature   │                    │
     │                    │───────────────────▶│                    │
     │                    │                    │                    │
     │                    │      valid         │                    │
     │                    │◀───────────────────│                    │
     │                    │                    │                    │
     │                    │ Activate           │                    │
     │                    │ subscription       │                    │
     │                    │ (idempotent)       │                    │
     │                    │─────────┐          │                    │
     │                    │         │          │                    │
     │                    │◀────────┘          │                    │
     │                    │                    │                    │
     │ {success,          │                    │                    │
     │  subscription}     │                    │                    │
     │◀───────────────────│                    │                    │
     │                    │                    │                    │
     │                    │                    │ payment.captured   │
     │                    │                    │ webhook            │
     │                    │◀───────────────────────────────────────│
     │                    │                    │                    │
     │                    │ Verify signature   │                    │
     │                    │ Check if already   │                    │
     │                    │ processed          │                    │
     │                    │─────────┐          │                    │
     │                    │         │          │                    │
     │                    │◀────────┘          │                    │
     │                    │                    │                    │
     │                    │      200 OK        │                    │
     │                    │────────────────────────────────────────▶│
     │                    │                    │                    │
```

## Subscription Flow (Monthly/Yearly Plans)

For recurring subscriptions, we use Razorpay Subscriptions API instead of one-time orders:

1. Frontend requests subscription creation with plan ID
2. Backend creates Razorpay subscription (returns subscription_id)
3. Frontend opens Razorpay checkout with subscription_id
4. User authorizes recurring payment
5. Razorpay sends subscription.authenticated webhook
6. Backend activates subscription, stores mandate details
7. Razorpay auto-charges on renewal, sends invoice.paid webhook
8. Backend extends subscription period

# Idempotency Design

Idempotency is critical for payment systems. Network failures, webhook retries, and user double-clicks can all cause duplicate requests. Our idempotency design ensures that:

1. **Order creation is idempotent**: Same idempotency key returns same order
2. **Payment verification is idempotent**: Same payment_id activates subscription once
3. **Webhook processing is idempotent**: Same event ID processes once

## Idempotency Key Strategy

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Idempotency Key Lifecycle                       │
│                                                                     │
│   Client generates key    Backend checks key    Key stored with     │
│   (UUID v4)               in idempotency table  result and TTL      │
│                                                                     │
│   ┌─────────────┐         ┌─────────────┐       ┌─────────────┐     │
│   │   Client    │────────▶│   Check     │──────▶│   Store     │     │
│   │  key=uuid   │         │  EXISTS?    │       │  key+result │     │
│   └─────────────┘         └─────────────┘       └─────────────┘     │
│                                  │                     │            │
│                                  │ YES                 │            │
│                                  ▼                     │            │
│                           ┌─────────────┐              │            │
│                           │   Return    │              │            │
│                           │   cached    │              │            │
│                           │   result    │              │            │
│                           └─────────────┘              │            │
│                                                        │            │
│                                                        │ TTL: 24h   │
│                                                        ▼            │
│                                                 ┌─────────────┐     │
│                                                 │   Expire    │     │
│                                                 │   & delete  │     │
│                                                 └─────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
```

## Idempotency States

| State | Meaning | Action |
|-------|---------|--------|
| `pending` | Request in progress | Return 409 Conflict (retry later) |
| `completed` | Request succeeded | Return cached response |
| `failed` | Request failed | Allow retry with same key |

## Idempotency for Webhooks

Razorpay may send the same webhook multiple times. We deduplicate using:

1. **Event ID**: Each webhook has a unique `event_id`
2. **Payment State**: Check if payment is already in final state before processing
3. **Database Transaction**: Use `INSERT ... ON CONFLICT DO NOTHING` for state transitions

```go
// Webhook handler pseudocode
func HandleWebhook(event WebhookEvent) error {
    // 1. Verify signature
    if !verifySignature(event) {
        return ErrInvalidSignature
    }
    
    // 2. Check if already processed
    exists, err := repo.EventExists(event.ID)
    if err != nil {
        return err
    }
    if exists {
        return nil // Already processed, return success
    }
    
    // 3. Process in transaction
    return db.Transaction(func(tx *sql.Tx) error {
        // Record event first (idempotency guard)
        if err := repo.InsertEventTx(tx, event.ID); err != nil {
            if isUniqueViolation(err) {
                return nil // Concurrent processing, another handler got it
            }
            return err
        }
        
        // Process based on event type
        switch event.Type {
        case "payment.captured":
            return processPaymentCaptured(tx, event.Payload)
        case "subscription.activated":
            return processSubscriptionActivated(tx, event.Payload)
        // ... other event types
        }
        return nil
    })
}
```

# Data Model

The payment data model uses four main tables: subscriptions, payments, orders, and idempotency_keys.

```sql
-- Subscription plans (static reference data)
CREATE TABLE IF NOT EXISTS subscription_plans (
    id VARCHAR(50) PRIMARY KEY,                -- 'pro_monthly', 'pro_yearly', 'pro_lifetime'
    name VARCHAR(100) NOT NULL,                -- 'Pro Monthly'
    description TEXT,
    
    -- Pricing (store in smallest unit for precision)
    amount_inr INT NOT NULL,                   -- Amount in paise (29900 = ₹299, 120000 = ₹1200, 250000 = ₹2500)
    original_amount_inr INT,                   -- Anchor/strikethrough price in paise (358800 = ₹3588, 500000 = ₹5000)
    amount_usd INT,                            -- Amount in cents (500 = $5, 1900 = $19, 3900 = $39)
    original_amount_usd INT,                   -- Anchor price in cents (6000 = $60, 8000 = $80)
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    
    -- Billing
    billing_period VARCHAR(20) NOT NULL,       -- 'monthly', 'yearly', 'lifetime'
    billing_interval INT DEFAULT 1,            -- 1 month, 1 year, etc.
    
    -- Razorpay plan ID (for subscriptions)
    razorpay_plan_id VARCHAR(100),             -- plan_xxxxx (null for lifetime)
    
    -- Feature flags (JSONB for flexibility)
    features JSONB NOT NULL DEFAULT '{}',
    
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id VARCHAR(50) NOT NULL REFERENCES subscription_plans(id),
    
    -- Status
    status VARCHAR(30) NOT NULL DEFAULT 'pending'
        CHECK (status IN (
            'pending',           -- Order created, awaiting payment
            'active',            -- Currently active
            'past_due',          -- Payment failed, grace period
            'cancelled',         -- User cancelled, active until period end
            'expired',           -- Period ended, not renewed
            'paused'             -- Temporarily paused
        )),
    
    -- Period
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,            -- NULL for lifetime
    
    -- Razorpay references
    razorpay_subscription_id VARCHAR(100),     -- sub_xxxxx (for recurring)
    razorpay_customer_id VARCHAR(100),         -- cust_xxxxx
    
    -- Cancellation
    cancel_at_period_end BOOLEAN DEFAULT false,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Only one active subscription per user
    CONSTRAINT unique_active_subscription 
        EXCLUDE USING gist (user_id WITH =) 
        WHERE (status IN ('active', 'past_due', 'pending'))
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status) WHERE status = 'active';
CREATE INDEX idx_subscriptions_expiry ON subscriptions(current_period_end) 
    WHERE status = 'active' AND current_period_end IS NOT NULL;

-- Payment orders
CREATE TABLE IF NOT EXISTS payment_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    
    -- Order details
    plan_id VARCHAR(50) NOT NULL REFERENCES subscription_plans(id),
    subtotal INT NOT NULL,                     -- Base amount in paise (before discount/GST)
    discount_code_id UUID REFERENCES discount_codes(id),
    discount_amount INT NOT NULL DEFAULT 0,    -- Discount in paise
    gst_amount INT NOT NULL DEFAULT 0,         -- GST in paise (18% of discounted amount)
    total_amount INT NOT NULL,                 -- Final amount in paise (subtotal - discount + gst)
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    
    -- Razorpay order
    razorpay_order_id VARCHAR(100) UNIQUE,     -- order_xxxxx
    
    -- Status
    status VARCHAR(30) NOT NULL DEFAULT 'created'
        CHECK (status IN ('created', 'attempted', 'paid', 'expired', 'failed')),
    
    -- Idempotency
    idempotency_key VARCHAR(100) UNIQUE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',               -- Additional context
    expires_at TIMESTAMPTZ NOT NULL,           -- Order expiry (Razorpay default: 30 min)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON payment_orders(user_id);
CREATE INDEX idx_orders_razorpay ON payment_orders(razorpay_order_id);
CREATE INDEX idx_orders_idempotency ON payment_orders(idempotency_key);

-- Payment records
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_id UUID REFERENCES payment_orders(id) ON DELETE SET NULL,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    
    -- Razorpay payment details
    razorpay_payment_id VARCHAR(100) UNIQUE NOT NULL,  -- pay_xxxxx
    razorpay_order_id VARCHAR(100),
    razorpay_signature VARCHAR(500),
    
    -- Amount
    amount INT NOT NULL,                       -- Amount in paise
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    
    -- Payment method
    method VARCHAR(50),                        -- 'upi', 'card', 'netbanking', 'wallet'
    method_details JSONB DEFAULT '{}',         -- Bank name, card last4, etc.
    
    -- Status
    status VARCHAR(30) NOT NULL DEFAULT 'created'
        CHECK (status IN (
            'created',           -- Payment initiated
            'authorized',        -- Authorized but not captured
            'captured',          -- Payment successful
            'failed',            -- Payment failed
            'refunded',          -- Fully refunded
            'partially_refunded' -- Partially refunded
        )),
    
    -- Refund tracking
    refund_amount INT DEFAULT 0,
    refund_status VARCHAR(30),
    refunded_at TIMESTAMPTZ,
    
    -- Timestamps
    captured_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_subscription ON payments(subscription_id);
CREATE INDEX idx_payments_razorpay ON payments(razorpay_payment_id);
CREATE INDEX idx_payments_status ON payments(status, created_at DESC);

-- Idempotency keys
CREATE TABLE IF NOT EXISTS idempotency_keys (
    key VARCHAR(100) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Request details
    request_path VARCHAR(200) NOT NULL,
    request_hash VARCHAR(64) NOT NULL,         -- SHA256 of request body
    
    -- State
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'completed', 'failed')),
    
    -- Response (for completed requests)
    response_code INT,
    response_body JSONB,
    
    -- Lifecycle
    locked_at TIMESTAMPTZ,                     -- For preventing concurrent processing
    completed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_idempotency_user ON idempotency_keys(user_id);
CREATE INDEX idx_idempotency_expiry ON idempotency_keys(expires_at);

-- Webhook events (for deduplication)
CREATE TABLE IF NOT EXISTS webhook_events (
    id VARCHAR(100) PRIMARY KEY,               -- Razorpay event ID
    event_type VARCHAR(100) NOT NULL,
    
    -- Processing
    payload JSONB NOT NULL,
    processed_at TIMESTAMPTZ,
    
    -- Metadata
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_webhook_events_type ON webhook_events(event_type, received_at DESC);

-- Invoices (for subscription renewals)
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
    
    -- Razorpay invoice
    razorpay_invoice_id VARCHAR(100) UNIQUE,
    
    -- Amount
    amount INT NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    
    -- Period
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    
    -- Status
    status VARCHAR(30) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'issued', 'paid', 'void', 'uncollectible')),
    
    -- Timestamps
    issued_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invoices_subscription ON invoices(subscription_id, period_start DESC);

-- Discount codes
CREATE TABLE IF NOT EXISTS discount_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,          -- 'LAUNCH50', 'WELCOME20'
    
    -- Discount details
    discount_type VARCHAR(20) NOT NULL         -- 'percentage', 'fixed_amount'
        CHECK (discount_type IN ('percentage', 'fixed_amount')),
    discount_value INT NOT NULL,               -- 50 for 50%, or 50000 for ₹500 off
    
    -- Restrictions
    applicable_plans JSONB DEFAULT '[]',       -- Empty = all plans, or ['pro_yearly', 'pro_lifetime']
    min_amount INT,                            -- Minimum order amount in paise
    max_discount INT,                          -- Maximum discount in paise (for percentage discounts)
    
    -- Usage limits
    max_uses INT,                              -- NULL = unlimited
    max_uses_per_user INT DEFAULT 1,           -- Per user limit
    current_uses INT NOT NULL DEFAULT 0,
    
    -- Validity
    starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,                    -- NULL = never expires
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_discount_codes_code ON discount_codes(code) WHERE is_active = true;

-- Discount code usage tracking
CREATE TABLE IF NOT EXISTS discount_code_uses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discount_code_id UUID NOT NULL REFERENCES discount_codes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_id UUID REFERENCES payment_orders(id) ON DELETE SET NULL,
    
    -- Discount applied
    discount_amount INT NOT NULL,              -- Actual discount in paise
    
    used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Prevent same user using same code multiple times (if restricted)
    UNIQUE(discount_code_id, user_id, order_id)
);

CREATE INDEX idx_discount_uses_user ON discount_code_uses(user_id);
CREATE INDEX idx_discount_uses_code ON discount_code_uses(discount_code_id);
```

## Design Decisions

1. **Amounts in smallest unit (paise/cents)**: Avoids floating-point precision issues. ₹299 is stored as 29900 paise.

2. **Anchor pricing with original_amount**: Plans store both actual price and "original" strikethrough price for display. This creates perceived value (e.g., ~~₹3,588~~ → ₹1,200 = "Save 67%").

3. **Separate orders and payments**: An order can have multiple payment attempts (user might fail first attempt). This also matches Razorpay's model.

4. **JSONB for features**: Subscription plans can have flexible feature flags without schema changes.

5. **Exclusion constraint for active subscriptions**: Ensures a user cannot have multiple active subscriptions simultaneously using PostgreSQL/CockroachDB GIST index.

6. **Idempotency keys with request hash**: We store a hash of the request body to detect conflicting requests with the same idempotency key but different parameters.

7. **Webhook events table**: Stores all received webhooks for debugging and audit, also serves as idempotency guard.

8. **Soft state for subscriptions**: Status like `past_due` allows grace periods before marking as expired.

# API Design

The payment API provides endpoints for order creation, payment verification, subscription management, and webhook handling.

## Validate Discount Code

Validates a discount code and returns the discount details.

```
POST /api/v1/payments/discount/validate
Content-Type: application/json
Authorization: Bearer <token>

{
    "code": "LAUNCH50",
    "plan_id": "pro_yearly"
}
```

Response:
```json
{
    "success": true,
    "data": {
        "code": "LAUNCH50",
        "discount_type": "percentage",
        "discount_value": 50,
        "discount_amount": 60000,
        "message": "50% off applied!"
    }
}
```

Error (invalid code):
```json
{
    "success": false,
    "error": {
        "code": "INVALID_DISCOUNT_CODE",
        "message": "This discount code is invalid or has expired"
    }
}
```

## Create Order

Creates a Razorpay order for a one-time purchase (lifetime plan).

```
POST /api/v1/payments/orders
Content-Type: application/json
Authorization: Bearer <token>
Idempotency-Key: <client-generated-uuid>

{
    "plan_id": "pro_lifetime",
    "discount_code": "LAUNCH50"
}
```

Response:
```json
{
    "success": true,
    "data": {
        "order_id": "uuid-xxx",
        "razorpay_order_id": "order_xxxxx",
        "razorpay_key_id": "rzp_live_xxxxx",
        "plan": {
            "id": "pro_lifetime",
            "name": "Pro Lifetime",
            "billing_period": "lifetime"
        },
        "pricing": {
            "subtotal": 250000,
            "discount_code": "LAUNCH50",
            "discount_amount": 125000,
            "gst_rate": 18,
            "gst_amount": 22500,
            "total": 147500,
            "currency": "INR"
        }
    }
}
```

**Idempotency behavior**:
- If idempotency key exists and completed: return cached response
- If idempotency key exists and pending: return 409 Conflict
- If idempotency key exists and failed: allow retry
- If new: create order, store with idempotency key

## Create Subscription

Creates a Razorpay subscription for recurring plans.

```
POST /api/v1/payments/subscriptions
Content-Type: application/json
Authorization: Bearer <token>
Idempotency-Key: <client-generated-uuid>

{
    "plan_id": "pro_yearly"
}
```

Response:
```json
{
    "success": true,
    "data": {
        "subscription_id": "uuid-xxx",
        "razorpay_subscription_id": "sub_xxxxx",
        "razorpay_key_id": "rzp_live_xxxxx",
        "plan": {
            "id": "pro_yearly",
            "name": "Pro Yearly",
            "amount": 199900,
            "currency": "INR",
            "billing_period": "yearly"
        }
    }
}
```

## Verify Payment

Verifies payment signature and activates subscription.

```
POST /api/v1/payments/verify
Content-Type: application/json
Authorization: Bearer <token>

{
    "razorpay_payment_id": "pay_xxxxx",
    "razorpay_order_id": "order_xxxxx",
    "razorpay_signature": "xxxxx"
}
```

Response:
```json
{
    "success": true,
    "data": {
        "payment_id": "uuid-xxx",
        "subscription": {
            "id": "uuid-xxx",
            "plan_id": "pro_lifetime",
            "status": "active",
            "current_period_start": "2026-05-22T10:00:00Z",
            "current_period_end": null
        }
    }
}
```

**Idempotency**: Payment verification is naturally idempotent via `razorpay_payment_id` uniqueness constraint. If payment already processed, return existing subscription.

## Get Subscription

Returns current user's subscription status.

```
GET /api/v1/subscriptions/me
Authorization: Bearer <token>
```

Response (Pro user):
```json
{
    "success": true,
    "data": {
        "id": "uuid-xxx",
        "plan_id": "pro_yearly",
        "status": "active",
        "current_period_start": "2026-05-22T10:00:00Z",
        "current_period_end": "2027-05-22T10:00:00Z",
        "cancel_at_period_end": false,
        "features": {
            "max_patterns": -1,
            "max_visualizers": -1,
            "quiz_questions_per_pattern": -1,
            "has_quiz_history": true,
            "has_code_playground": true,
            "has_progress_sync": true,
            "has_highlighting": true,
            "has_solutions_access": true,
            "has_offline_export": true
        }
    }
}
```

Response (Free user):
```json
{
    "success": true,
    "data": {
        "plan_id": "free",
        "status": "active",
        "features": {
            "max_patterns": 2,
            "max_visualizers": 5,
            "quiz_questions_per_pattern": 3,
            "has_quiz_history": false,
            "has_code_playground": false,
            "has_progress_sync": false,
            "has_highlighting": false,
            "has_solutions_access": false,
            "has_offline_export": false
        }
    }
}
```

## Cancel Subscription

Cancels subscription at period end.

```
POST /api/v1/subscriptions/me/cancel
Content-Type: application/json
Authorization: Bearer <token>

{
    "reason": "too_expensive",
    "feedback": "Optional feedback text"
}
```

Response:
```json
{
    "success": true,
    "data": {
        "id": "uuid-xxx",
        "status": "cancelled",
        "cancel_at_period_end": true,
        "current_period_end": "2027-05-22T10:00:00Z"
    }
}
```

## Razorpay Webhook

Handles Razorpay webhook events.

```
POST /api/v1/webhooks/razorpay
Content-Type: application/json
X-Razorpay-Signature: <signature>

{
    "event": "payment.captured",
    "payload": {
        "payment": {
            "entity": {
                "id": "pay_xxxxx",
                "order_id": "order_xxxxx",
                "amount": 499900,
                "status": "captured"
            }
        }
    }
}
```

**Supported webhook events**:

| Event | Action |
|-------|--------|
| `payment.captured` | Activate subscription (backup for verify) |
| `payment.failed` | Update order status, send failure email |
| `subscription.activated` | Activate recurring subscription |
| `subscription.charged` | Record renewal payment, extend period |
| `subscription.cancelled` | Mark subscription cancelled |
| `subscription.paused` | Mark subscription paused |
| `subscription.resumed` | Reactivate subscription |
| `refund.created` | Record refund, potentially revoke access |

# Frontend Implementation

## Checkout UI Design

The checkout UI is inspired by DodoPayments' clean, dark-themed design. Key elements:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌─────────────────────────────────────┐  ┌───────────────────────────────┐ │
│  │                                     │  │                               │ │
│  │  🔷 AlgoPatterns    [Pay in INR ▼]  │  │  Contact Information          │ │
│  │                                     │  │                               │ │
│  │  ┌─────┐  Pro Yearly               │  │  Full Name *                  │ │
│  │  │ 📊 │  ₹3,588  ₹1,200 / Year     │  │  ┌─────────────────────────┐  │ │
│  │  └─────┘                            │  │  │ Rishu Kumar             │  │ │
│  │  Master DSA patterns with all 15    │  │  └─────────────────────────┘  │ │
│  │  patterns, 57+ visualizers, full    │  │                               │ │
│  │  quizzes, and code playground.      │  │  Email *        Phone (opt)   │ │
│  │  Includes all future updates.       │  │  ┌───────────┐ ┌───────────┐  │ │
│  │                                     │  │  │user@email │ │🇮🇳 +91    │  │ │
│  │  ─────────────────────────────────  │  │  └───────────┘ └───────────┘  │ │
│  │                                     │  │                               │ │
│  │  Have a discount code?              │  │  Billing address *            │ │
│  │  ┌──────────────┐ [Apply code]      │  │  ┌─────────────────────────┐  │ │
│  │  │ LAUNCH50     │                   │  │  │ India              ▼   │  │ │
│  │  └──────────────┘                   │  │  └─────────────────────────┘  │ │
│  │                                     │  │  ┌─────────────────────────┐  │ │
│  │  ─────────────────────────────────  │  │  │ Address Line            │  │ │
│  │                                     │  │  └─────────────────────────┘  │ │
│  │  Subtotal              ₹1,200.00    │  │                               │ │
│  │  Discount (50%)          -₹600.00   │  │  ☐ Purchasing as a business   │ │
│  │  GST (18%)                ₹108.00   │  │                               │ │
│  │  ─────────────────────────────────  │  │  ┌─────────────────────────┐  │ │
│  │  Total                   ₹708.00    │  │  │  Continue to Payment    │  │ │
│  │                                     │  │  └─────────────────────────┘  │ │
│  │                                     │  │                               │ │
│  └─────────────────────────────────────┘  │  Secure payments by Razorpay  │ │
│                                           └───────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key UI Elements

| Element | Description |
|---------|-------------|
| **Currency Toggle** | "Pay in INR / USD" dropdown (future: auto-detect from IP) |
| **Plan Card** | Icon, name, original price (strikethrough), discounted price |
| **Value Proposition** | "Includes all future updates" prominently displayed |
| **Discount Code Input** | Collapsible section, validates on "Apply" |
| **Price Breakdown** | Subtotal, Discount, GST, Total - always visible |
| **Contact Form** | Name, Email, Phone (optional), Country |
| **Continue Button** | Opens Razorpay checkout with pre-filled details |

### Checkout Flow States

```typescript
type CheckoutState =
    | { step: 'select_plan' }
    | { step: 'apply_discount'; discount?: DiscountInfo }
    | { step: 'collecting_info' }
    | { step: 'processing_payment' }
    | { step: 'success'; subscription: Subscription }
    | { step: 'failed'; error: string };
```

### Responsive Design

- **Desktop**: Two-column layout (order summary left, form right)
- **Mobile**: Single column (order summary first, then form)
- **Price breakdown**: Always sticky at bottom on mobile

## Subscription Context

The SubscriptionContext provides subscription state to the entire app.

```typescript
// types/subscription.ts
export type SubscriptionTier = 'free' | 'pro';
export type SubscriptionStatus = 'active' | 'past_due' | 'cancelled' | 'expired';

export interface SubscriptionFeatures {
    maxPatterns: number;           // -1 = unlimited
    maxVisualizers: number;
    quizQuestionsPerPattern: number;
    hasQuizHistory: boolean;
    hasCodePlayground: boolean;
    hasProgressSync: boolean;
    hasHighlighting: boolean;
    hasSolutionsAccess: boolean;
    hasOfflineExport: boolean;
}

export interface Subscription {
    id?: string;
    planId: string;
    status: SubscriptionStatus;
    currentPeriodStart?: string;
    currentPeriodEnd?: string;
    cancelAtPeriodEnd?: boolean;
    features: SubscriptionFeatures;
}

// contexts/SubscriptionContext.tsx
interface SubscriptionContextType {
    subscription: Subscription;
    isLoading: boolean;
    isPro: boolean;
    canAccess: (feature: keyof SubscriptionFeatures) => boolean;
    refresh: () => Promise<void>;
}

const FREE_FEATURES: SubscriptionFeatures = {
    maxPatterns: 2,
    maxVisualizers: 5,
    quizQuestionsPerPattern: 3,
    hasQuizHistory: false,
    hasCodePlayground: false,
    hasProgressSync: false,
    hasHighlighting: false,
    hasSolutionsAccess: false,
    hasOfflineExport: false,
};

export function SubscriptionProvider({ children }: { children: ReactNode }) {
    const { user, isAuthenticated } = useAuth();
    const [subscription, setSubscription] = useState<Subscription>({
        planId: 'free',
        status: 'active',
        features: FREE_FEATURES,
    });
    const [isLoading, setIsLoading] = useState(true);

    const refresh = useCallback(async () => {
        if (!isAuthenticated) {
            setSubscription({ planId: 'free', status: 'active', features: FREE_FEATURES });
            setIsLoading(false);
            return;
        }

        try {
            const response = await apiClient.getSubscription();
            if (response.success) {
                setSubscription(response.data);
            }
        } catch {
            // Use cached/default on error
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        refresh();
    }, [refresh, user]);

    const isPro = subscription.planId !== 'free' && subscription.status === 'active';

    const canAccess = useCallback((feature: keyof SubscriptionFeatures) => {
        const value = subscription.features[feature];
        if (typeof value === 'boolean') return value;
        if (typeof value === 'number') return value !== 0;
        return false;
    }, [subscription]);

    return (
        <SubscriptionContext.Provider value={{ subscription, isLoading, isPro, canAccess, refresh }}>
            {children}
        </SubscriptionContext.Provider>
    );
}
```

## PaymentGuard Component

Guards premium features with upgrade prompt.

```typescript
interface PaymentGuardProps {
    feature: keyof SubscriptionFeatures;
    children: ReactNode;
    fallback?: ReactNode;
}

export function PaymentGuard({ feature, children, fallback }: PaymentGuardProps) {
    const { canAccess, isLoading } = useSubscription();
    const [showUpgrade, setShowUpgrade] = useState(false);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (canAccess(feature)) {
        return <>{children}</>;
    }

    if (fallback) {
        return <>{fallback}</>;
    }

    return (
        <>
            <div className="relative">
                <div className="blur-sm pointer-events-none opacity-50">
                    {children}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-gray-900/95 border border-gray-700 rounded-xl p-6 text-center max-w-sm">
                        <LockIcon className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-white mb-2">
                            Premium Feature
                        </h3>
                        <p className="text-gray-400 text-sm mb-4">
                            Upgrade to Pro to unlock this feature and accelerate your learning.
                        </p>
                        <button
                            onClick={() => setShowUpgrade(true)}
                            className="px-6 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 
                                       text-black font-medium rounded-lg hover:opacity-90"
                        >
                            Upgrade to Pro
                        </button>
                    </div>
                </div>
            </div>
            
            <UpgradeModal 
                isOpen={showUpgrade} 
                onClose={() => setShowUpgrade(false)} 
            />
        </>
    );
}
```

## Checkout Flow

```typescript
// hooks/useCheckout.ts
export function useCheckout() {
    const { refresh } = useSubscription();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const checkout = useCallback(async (planId: string) => {
        setIsProcessing(true);
        setError(null);

        try {
            // Generate idempotency key
            const idempotencyKey = crypto.randomUUID();

            // Create order/subscription
            const isRecurring = planId !== 'pro_lifetime';
            const response = isRecurring
                ? await apiClient.createSubscription(planId, idempotencyKey)
                : await apiClient.createOrder(planId, idempotencyKey);

            if (!response.success) {
                throw new Error(response.error?.message || 'Failed to create order');
            }

            // Open Razorpay checkout
            const options: RazorpayOptions = {
                key: response.data.razorpay_key_id,
                amount: response.data.amount,
                currency: response.data.currency || 'INR',
                name: 'AlgoPatterns',
                description: response.data.plan.name,
                order_id: response.data.razorpay_order_id,
                subscription_id: response.data.razorpay_subscription_id,
                prefill: {
                    email: user?.email,
                    name: user?.name,
                },
                theme: {
                    color: '#14B8A6',
                },
                handler: async (paymentResponse: RazorpayResponse) => {
                    // Verify payment
                    const verifyResponse = await apiClient.verifyPayment({
                        razorpay_payment_id: paymentResponse.razorpay_payment_id,
                        razorpay_order_id: paymentResponse.razorpay_order_id,
                        razorpay_signature: paymentResponse.razorpay_signature,
                    });

                    if (verifyResponse.success) {
                        await refresh();
                        toast.success('Welcome to AlgoPatterns Pro!');
                    } else {
                        setError('Payment verification failed. Please contact support.');
                    }
                },
                modal: {
                    ondismiss: () => {
                        setIsProcessing(false);
                    },
                },
            };

            const razorpay = new (window as any).Razorpay(options);
            razorpay.open();

            razorpay.on('payment.failed', (response: any) => {
                setError(response.error.description || 'Payment failed');
                setIsProcessing(false);
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            setIsProcessing(false);
        }
    }, [refresh, user]);

    return { checkout, isProcessing, error };
}
```

## Pricing Page

```typescript
export function PricingPage() {
    const { isPro, subscription } = useSubscription();
    const { checkout, isProcessing, error } = useCheckout();

    const plans = [
        {
            id: 'pro_monthly',
            name: 'Monthly',
            price: 299,
            currency: 'INR',
            period: '/month',
            features: ['All 15 patterns', '57+ visualizers', 'Full quiz system', 'Code playground'],
        },
        {
            id: 'pro_yearly',
            name: 'Yearly',
            price: 1200,
            originalPrice: 3588,  // 299 * 12 (anchor price)
            currency: 'INR',
            period: '/year',
            badge: 'Save 67%',
            recommended: true,
            features: ['Everything in Monthly', 'All future updates included', 'Priority support'],
        },
        {
            id: 'pro_lifetime',
            name: 'Lifetime',
            price: 2500,
            originalPrice: 5000,  // Anchor price
            currency: 'INR',
            period: 'one-time',
            badge: '50% Off',
            features: ['Everything forever', 'All future patterns & features', 'No recurring charges'],
        },
    ];

    if (isPro) {
        return <CurrentSubscriptionView subscription={subscription} />;
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-16">
            <div className="text-center mb-12">
                <h1 className="text-3xl font-bold text-white mb-4">
                    Master DSA Patterns Faster
                </h1>
                <p className="text-gray-400 text-lg">
                    Join thousands of developers preparing smarter
                </p>
            </div>

            {error && (
                <div className="mb-8 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-400">
                    {error}
                </div>
            )}

            <div className="grid md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <PricingCard
                        key={plan.id}
                        plan={plan}
                        onSelect={() => checkout(plan.id)}
                        isLoading={isProcessing}
                    />
                ))}
            </div>

            <div className="mt-12 text-center text-gray-500 text-sm">
                <p>Secure payments powered by Razorpay</p>
                <p className="mt-2">Questions? Email support@algopatterns.dev</p>
            </div>
        </div>
    );
}
```

# Webhook Processing

## Webhook Handler

```go
// internal/handlers/webhook_handler.go
func (h *WebhookHandler) HandleRazorpayWebhook(c *gin.Context) {
    // Read raw body for signature verification
    body, err := io.ReadAll(c.Request.Body)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
        return
    }

    // Verify webhook signature
    signature := c.GetHeader("X-Razorpay-Signature")
    if !h.razorpay.VerifyWebhookSignature(body, signature) {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid signature"})
        return
    }

    // Parse event
    var event WebhookEvent
    if err := json.Unmarshal(body, &event); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event payload"})
        return
    }

    // Process event (idempotent)
    if err := h.service.ProcessWebhookEvent(c.Request.Context(), event); err != nil {
        // Log error but return 200 to prevent Razorpay retries for processing errors
        h.logger.Error("webhook processing failed", "event_id", event.ID, "error", err)
    }

    c.JSON(http.StatusOK, gin.H{"status": "processed"})
}
```

## Event Processing

```go
// internal/services/webhook_service.go
func (s *WebhookService) ProcessWebhookEvent(ctx context.Context, event WebhookEvent) error {
    // Check if already processed (idempotency)
    exists, err := s.repo.WebhookEventExists(ctx, event.ID)
    if err != nil {
        return err
    }
    if exists {
        s.logger.Info("webhook event already processed", "event_id", event.ID)
        return nil
    }

    // Process in transaction
    return s.db.Transaction(ctx, func(tx *sql.Tx) error {
        // Insert event record first (idempotency guard)
        if err := s.repo.InsertWebhookEventTx(ctx, tx, event); err != nil {
            if isUniqueViolation(err) {
                return nil // Another goroutine is processing
            }
            return err
        }

        // Route to handler
        switch event.Type {
        case "payment.captured":
            return s.handlePaymentCaptured(ctx, tx, event.Payload)
        case "payment.failed":
            return s.handlePaymentFailed(ctx, tx, event.Payload)
        case "subscription.activated":
            return s.handleSubscriptionActivated(ctx, tx, event.Payload)
        case "subscription.charged":
            return s.handleSubscriptionCharged(ctx, tx, event.Payload)
        case "subscription.cancelled":
            return s.handleSubscriptionCancelled(ctx, tx, event.Payload)
        default:
            s.logger.Warn("unhandled webhook event type", "type", event.Type)
            return nil
        }
    })
}

func (s *WebhookService) handlePaymentCaptured(ctx context.Context, tx *sql.Tx, payload PaymentPayload) error {
    payment := payload.Payment.Entity

    // Check if payment already processed
    existing, err := s.paymentRepo.GetByRazorpayIDTx(ctx, tx, payment.ID)
    if err != nil && !errors.Is(err, ErrNotFound) {
        return err
    }
    if existing != nil && existing.Status == "captured" {
        return nil // Already processed
    }

    // Update or create payment record
    if existing != nil {
        existing.Status = "captured"
        existing.CapturedAt = time.Now()
        if err := s.paymentRepo.UpdateTx(ctx, tx, existing); err != nil {
            return err
        }
    } else {
        // Payment created via webhook (unusual but handle gracefully)
        // Look up order to get subscription
        order, err := s.orderRepo.GetByRazorpayIDTx(ctx, tx, payment.OrderID)
        if err != nil {
            return fmt.Errorf("order not found for payment: %w", err)
        }

        newPayment := &Payment{
            UserID:            order.UserID,
            OrderID:           order.ID,
            SubscriptionID:    order.SubscriptionID,
            RazorpayPaymentID: payment.ID,
            RazorpayOrderID:   payment.OrderID,
            Amount:            payment.Amount,
            Currency:          payment.Currency,
            Method:            payment.Method,
            Status:            "captured",
            CapturedAt:        time.Now(),
        }
        if err := s.paymentRepo.CreateTx(ctx, tx, newPayment); err != nil {
            return err
        }

        // Activate subscription
        return s.activateSubscriptionTx(ctx, tx, order.SubscriptionID, payment)
    }

    return nil
}
```

# Security Considerations

## Webhook Signature Verification

All Razorpay webhooks are verified using HMAC-SHA256 signatures:

```go
func (c *RazorpayClient) VerifyWebhookSignature(body []byte, signature string) bool {
    mac := hmac.New(sha256.New, []byte(c.webhookSecret))
    mac.Write(body)
    expectedSignature := hex.EncodeToString(mac.Sum(nil))
    return hmac.Equal([]byte(signature), []byte(expectedSignature))
}
```

## Payment Signature Verification

After checkout, the frontend receives `razorpay_signature` which must be verified:

```go
func (c *RazorpayClient) VerifyPaymentSignature(orderID, paymentID, signature string) bool {
    data := orderID + "|" + paymentID
    mac := hmac.New(sha256.New, []byte(c.keySecret))
    mac.Write([]byte(data))
    expectedSignature := hex.EncodeToString(mac.Sum(nil))
    return hmac.Equal([]byte(signature), []byte(expectedSignature))
}
```

## Authorization

- All payment endpoints require authentication
- Users can only access their own subscriptions and payments
- Repository layer enforces `user_id` filter on all queries
- Webhook endpoint validates Razorpay signature instead of JWT

## Input Validation

- `plan_id` must exist in `subscription_plans` table
- `idempotency_key` must be valid UUID format
- Razorpay IDs must match expected prefixes (`order_`, `pay_`, `sub_`)

## Rate Limiting

| Endpoint | Limit | Reason |
|----------|-------|--------|
| POST /orders | 10/min/user | Prevent order spam |
| POST /verify | 30/min/user | Allow retries |
| GET /subscriptions/me | 60/min/user | Allow frequent checks |
| POST /webhooks/razorpay | 100/min/IP | Allow Razorpay retries |

## Secrets Management

- Razorpay Key ID: Stored in env vars (can be public)
- Razorpay Key Secret: Stored in env vars (never exposed to frontend)
- Webhook Secret: Stored in env vars (separate from Key Secret)

# Error Handling

## Order Creation Errors

| Error | Cause | Resolution |
|-------|-------|------------|
| `IDEMPOTENCY_CONFLICT` | Same key, different params | Use new idempotency key |
| `IDEMPOTENCY_IN_PROGRESS` | Previous request pending | Retry after delay |
| `PLAN_NOT_FOUND` | Invalid plan_id | Show valid plans |
| `ALREADY_SUBSCRIBED` | User has active subscription | Show current subscription |
| `RAZORPAY_ERROR` | Razorpay API failed | Retry with backoff |

## Payment Verification Errors

| Error | Cause | Resolution |
|-------|-------|------------|
| `INVALID_SIGNATURE` | Tampered response | Do not activate, alert |
| `ORDER_NOT_FOUND` | Order expired or invalid | Create new order |
| `PAYMENT_ALREADY_PROCESSED` | Duplicate verification | Return existing subscription |

## Webhook Processing Errors

| Error | Cause | Resolution |
|-------|-------|------------|
| `INVALID_SIGNATURE` | Forged webhook | Return 401, don't process |
| `EVENT_ALREADY_PROCESSED` | Duplicate delivery | Return 200, skip processing |
| `SUBSCRIPTION_NOT_FOUND` | Reference missing | Log and return 200 (don't retry) |

# Monitoring and Observability

## Metrics

```
# Payment operations
algopatterns_orders_created_total{plan, status}
algopatterns_payments_processed_total{plan, method, status}
algopatterns_subscriptions_activated_total{plan}
algopatterns_subscriptions_cancelled_total{reason}

# Webhook processing
algopatterns_webhooks_received_total{event_type}
algopatterns_webhooks_processed_total{event_type, status}
algopatterns_webhook_processing_duration_seconds{event_type}

# Idempotency
algopatterns_idempotency_hits_total
algopatterns_idempotency_conflicts_total

# Razorpay API
algopatterns_razorpay_requests_total{endpoint, status}
algopatterns_razorpay_request_duration_seconds{endpoint}
```

## Alerts

| Alert | Condition | Severity |
|-------|-----------|----------|
| Payment failure spike | >10% failures in 5min | High |
| Webhook verification failures | >5 in 10min | High |
| Razorpay API errors | >5% error rate | Medium |
| Subscription activation delay | >5min from payment | Medium |

## Audit Logging

All payment operations are logged with:
- User ID (hashed for privacy)
- Operation type
- Amount and plan
- Razorpay IDs
- Success/failure status
- Error details (if any)

# Testing Strategy

## Unit Tests

- Idempotency service logic
- Signature verification
- Subscription state machine transitions
- Feature flag evaluation

## Integration Tests

- Order creation flow (with mock Razorpay)
- Payment verification flow
- Webhook processing (all event types)
- Subscription lifecycle

## End-to-End Tests

- Complete checkout flow (using Razorpay test mode)
- Subscription cancellation
- Failed payment recovery
- Feature access after upgrade

## Test Mode

Razorpay provides test mode credentials. All test card numbers:
- Success: 4111 1111 1111 1111
- Failure: 4000 0000 0000 0002
- UPI: success@razorpay (test)

# Future Considerations

## International Payments (Phase 2)

The architecture supports adding DodoPayments for international users:

**Why DodoPayments:**
- Merchant of Record (MoR) model - they handle VAT/GST compliance globally
- Clean checkout UI (as shown in reference screenshots)
- Supports cards globally
- Automatic tax calculation per region
- Handles refunds and disputes

**Implementation:**
1. Add `payment_gateway` field to subscriptions (`razorpay` | `dodo`)
2. Implement gateway-specific clients with common interface:
   ```go
   type PaymentGateway interface {
       CreateOrder(ctx context.Context, req OrderRequest) (*Order, error)
       VerifyPayment(ctx context.Context, paymentID string) (*Payment, error)
       CreateSubscription(ctx context.Context, req SubRequest) (*Subscription, error)
   }
   ```
3. Route based on user region detection (IP geolocation)
4. Display prices in user's local currency (INR for India, USD for others)

**Pricing for International:**
| Plan | Display | Actual | Savings |
|------|---------|--------|---------|
| Monthly | $5 | $5 | - |
| Yearly | ~~$60~~ $19 | $19 | 68% off |
| Lifetime | ~~$80~~ $39 | $39 | 51% off |

## Discount Codes (Implemented)

Discount codes are now part of the core implementation:
- Percentage and fixed amount discounts
- Per-user usage limits
- Plan-specific restrictions
- Expiry dates

## Referral Program

1. Add `referrals` table linking referrer and referee
2. Credit referrer when referee subscribes
3. Apply as account credit or discount

## Team/Enterprise Plans

1. Add `organizations` table
2. Link multiple users to organization subscription
3. Admin dashboard for member management

## Usage-Based Billing

1. Track API calls or feature usage
2. Implement metering service
3. Add usage tiers or overage charges

# Implementation Plan

## Phase 1: Core Payment System (Week 1-2)
- [ ] Database schema and migrations
- [ ] Razorpay client wrapper
- [ ] Idempotency service
- [ ] Order creation endpoint
- [ ] Payment verification endpoint
- [ ] Basic webhook handler (payment.captured)

## Phase 2: Subscription Management (Week 2-3)
- [ ] Recurring subscription creation
- [ ] Subscription webhooks (activated, charged, cancelled)
- [ ] Cancellation endpoint
- [ ] Subscription status endpoint
- [ ] Grace period handling

## Phase 3: Discount Codes & GST (Week 3)
- [ ] Discount codes table and CRUD
- [ ] Validate discount code endpoint
- [ ] GST calculation service
- [ ] Apply discount in order creation
- [ ] Discount code UI in checkout

## Phase 4: Frontend Integration (Week 3-4)
- [ ] SubscriptionContext
- [ ] PaymentGuard component
- [ ] Pricing page with new prices (₹149/₹1200/₹2500)
- [ ] Checkout page (DodoPayments-inspired layout)
- [ ] Discount code input component
- [ ] Price breakdown display (subtotal, discount, GST, total)
- [ ] Current subscription management UI

## Phase 5: Feature Gating (Week 4-5)
- [ ] Pattern access control
- [ ] Visualizer access control
- [ ] Quiz limits
- [ ] Code playground gating
- [ ] Upgrade prompts at gate points

## Phase 6: Polish & Monitoring (Week 5-6)
- [ ] Error handling improvements
- [ ] Metrics and alerting
- [ ] Email notifications (welcome, receipt, expiring)
- [ ] Testing (unit, integration, e2e)
- [ ] "All future updates" messaging

# Files to Create

```
Backend:
├── internal/handlers/
│   ├── payment_handler.go         # Order, verify, subscription endpoints
│   ├── discount_handler.go        # Discount code validation
│   └── webhook_handler.go         # Razorpay webhook handler
├── internal/services/
│   ├── payment_service.go         # Payment orchestration
│   ├── subscription_service.go    # Subscription lifecycle
│   ├── discount_service.go        # Discount code validation & application
│   ├── gst_service.go             # GST calculation (18%)
│   ├── idempotency_service.go     # Idempotency key management
│   └── webhook_service.go         # Webhook event processing
├── internal/repository/
│   ├── subscription_repository.go
│   ├── payment_repository.go
│   ├── order_repository.go
│   ├── discount_repository.go     # Discount codes & usage
│   └── idempotency_repository.go
├── internal/models/
│   ├── subscription.go
│   ├── payment.go
│   ├── order.go
│   └── discount.go                # Discount code model
├── internal/razorpay/
│   ├── client.go                  # Razorpay API client
│   └── types.go                   # Razorpay request/response types
└── migrations/
    └── 00X_create_payment_tables.sql

Frontend:
├── src/contexts/
│   └── SubscriptionContext.tsx    # Subscription state management
├── src/components/payment/
│   ├── PricingPage.tsx            # Pricing plans display
│   ├── PricingCard.tsx            # Individual plan card
│   ├── CheckoutPage.tsx           # Full checkout page (DodoPayments style)
│   ├── CheckoutSummary.tsx        # Order summary with price breakdown
│   ├── DiscountCodeInput.tsx      # Discount code input with validation
│   ├── PriceBreakdown.tsx         # Subtotal, discount, GST, total display
│   ├── PaymentGuard.tsx           # Feature gating component
│   ├── UpgradePrompt.tsx          # Inline upgrade CTA
│   └── CurrentSubscription.tsx    # Active subscription view
├── src/hooks/
│   ├── useCheckout.ts             # Checkout flow hook
│   └── useDiscountCode.ts         # Discount code validation hook
├── src/lib/
│   ├── razorpay.ts                # Razorpay SDK wrapper
│   └── pricing.ts                 # Price calculation utilities
└── src/types/
    └── subscription.ts            # Subscription & discount types
```

# References

- [Razorpay Orders API](https://razorpay.com/docs/api/orders/) - For one-time payments
- [Razorpay Subscriptions API](https://razorpay.com/docs/api/subscriptions/) - For recurring payments
- [Razorpay Webhooks](https://razorpay.com/docs/webhooks/) - For event handling
- [Idempotency Patterns](https://stripe.com/docs/api/idempotent_requests) - Stripe's idempotency design (applicable principles)
- [Subscription State Machine](https://stripe.com/docs/billing/subscriptions/overview) - Stripe's subscription lifecycle (applicable principles)
- [Payment Security Best Practices](https://razorpay.com/docs/payments/best-practices/) - Razorpay security guidelines
