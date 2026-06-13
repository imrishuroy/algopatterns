-- Subscription plans (static reference data)
CREATE TABLE IF NOT EXISTS subscription_plans (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,

    -- Pricing (store in smallest unit for precision)
    amount_inr INT NOT NULL,
    original_amount_inr INT,
    amount_usd INT,
    original_amount_usd INT,

    -- Billing
    billing_period VARCHAR(20) NOT NULL CHECK (billing_period IN ('monthly', 'yearly', 'lifetime')),
    billing_interval INT DEFAULT 1,

    -- Razorpay plan ID (for subscriptions)
    razorpay_plan_id VARCHAR(100),

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
        CHECK (status IN ('pending', 'active', 'past_due', 'cancelled', 'expired', 'paused')),

    -- Period
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,

    -- Razorpay references
    razorpay_subscription_id VARCHAR(100),
    razorpay_customer_id VARCHAR(100),

    -- Cancellation
    cancel_at_period_end BOOLEAN DEFAULT false,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status) WHERE status = 'active';
CREATE INDEX idx_subscriptions_expiry ON subscriptions(current_period_end)
    WHERE status = 'active' AND current_period_end IS NOT NULL;

-- Discount codes
CREATE TABLE IF NOT EXISTS discount_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,

    -- Discount details
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
    discount_value INT NOT NULL,

    -- Restrictions
    applicable_plans JSONB DEFAULT '[]',
    min_amount INT,
    max_discount INT,

    -- Usage limits
    max_uses INT,
    max_uses_per_user INT DEFAULT 1,
    current_uses INT NOT NULL DEFAULT 0,

    -- Validity
    starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_discount_codes_code ON discount_codes(code) WHERE is_active = true;

-- Payment orders
CREATE TABLE IF NOT EXISTS payment_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,

    -- Order details
    plan_id VARCHAR(50) NOT NULL REFERENCES subscription_plans(id),
    subtotal INT NOT NULL,
    discount_code_id UUID REFERENCES discount_codes(id),
    discount_amount INT NOT NULL DEFAULT 0,
    gst_amount INT NOT NULL DEFAULT 0,
    total_amount INT NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',

    -- Razorpay order
    razorpay_order_id VARCHAR(100) UNIQUE,

    -- Status
    status VARCHAR(30) NOT NULL DEFAULT 'created'
        CHECK (status IN ('created', 'attempted', 'paid', 'expired', 'failed')),

    -- Idempotency
    idempotency_key VARCHAR(100) UNIQUE,

    -- Metadata
    metadata JSONB DEFAULT '{}',
    expires_at TIMESTAMPTZ NOT NULL,
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
    razorpay_payment_id VARCHAR(100) UNIQUE NOT NULL,
    razorpay_order_id VARCHAR(100),
    razorpay_signature VARCHAR(500),

    -- Amount
    amount INT NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',

    -- Payment method
    method VARCHAR(50),
    method_details JSONB DEFAULT '{}',

    -- Status
    status VARCHAR(30) NOT NULL DEFAULT 'created'
        CHECK (status IN ('created', 'authorized', 'captured', 'failed', 'refunded', 'partially_refunded')),

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
    request_hash VARCHAR(64) NOT NULL,

    -- State
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'completed', 'failed')),

    -- Response (for completed requests)
    response_code INT,
    response_body JSONB,

    -- Lifecycle
    locked_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_idempotency_user ON idempotency_keys(user_id);
CREATE INDEX idx_idempotency_expiry ON idempotency_keys(expires_at);

-- Webhook events (for deduplication)
CREATE TABLE IF NOT EXISTS webhook_events (
    id VARCHAR(100) PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,

    -- Processing
    payload JSONB NOT NULL,
    processed_at TIMESTAMPTZ,

    -- Metadata
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_webhook_events_type ON webhook_events(event_type, received_at DESC);

-- Discount code usage tracking
CREATE TABLE IF NOT EXISTS discount_code_uses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discount_code_id UUID NOT NULL REFERENCES discount_codes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_id UUID REFERENCES payment_orders(id) ON DELETE SET NULL,

    -- Discount applied
    discount_amount INT NOT NULL,

    used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(discount_code_id, user_id, order_id)
);

CREATE INDEX idx_discount_uses_user ON discount_code_uses(user_id);
CREATE INDEX idx_discount_uses_code ON discount_code_uses(discount_code_id);

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

-- Seed default subscription plans
INSERT INTO subscription_plans (id, name, description, amount_inr, original_amount_inr, amount_usd, original_amount_usd, billing_period, features) VALUES
('free', 'Free', 'Basic access to AlgoPatterns', 0, NULL, 0, NULL, 'lifetime',
 '{"max_patterns": 2, "max_visualizers": 5, "quiz_questions_per_pattern": 3, "has_quiz_history": false, "has_code_playground": false, "has_progress_sync": false, "has_highlighting": false, "has_solutions_access": false, "has_offline_export": false}'::jsonb),
('pro_monthly', 'Pro Monthly', 'Full access to all features, billed monthly', 29900, NULL, 500, NULL, 'monthly',
 '{"max_patterns": -1, "max_visualizers": -1, "quiz_questions_per_pattern": -1, "has_quiz_history": true, "has_code_playground": true, "has_progress_sync": true, "has_highlighting": true, "has_solutions_access": true, "has_offline_export": true}'::jsonb),
('pro_yearly', 'Pro Yearly', 'Full access to all features, billed yearly. Save 67%!', 120000, 358800, 1900, 6000, 'yearly',
 '{"max_patterns": -1, "max_visualizers": -1, "quiz_questions_per_pattern": -1, "has_quiz_history": true, "has_code_playground": true, "has_progress_sync": true, "has_highlighting": true, "has_solutions_access": true, "has_offline_export": true}'::jsonb),
('pro_lifetime', 'Pro Lifetime', 'Full access forever. All future updates included!', 250000, 500000, 3900, 8000, 'lifetime',
 '{"max_patterns": -1, "max_visualizers": -1, "quiz_questions_per_pattern": -1, "has_quiz_history": true, "has_code_playground": true, "has_progress_sync": true, "has_highlighting": true, "has_solutions_access": true, "has_offline_export": true}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    amount_inr = EXCLUDED.amount_inr,
    original_amount_inr = EXCLUDED.original_amount_inr,
    amount_usd = EXCLUDED.amount_usd,
    original_amount_usd = EXCLUDED.original_amount_usd,
    features = EXCLUDED.features,
    updated_at = NOW();
