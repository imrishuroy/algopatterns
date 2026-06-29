package models

import (
	"encoding/json"
	"time"
)

// SubscriptionStatus represents the status of a subscription
type SubscriptionStatus string

const (
	SubscriptionStatusPending   SubscriptionStatus = "pending"
	SubscriptionStatusActive    SubscriptionStatus = "active"
	SubscriptionStatusPastDue   SubscriptionStatus = "past_due"
	SubscriptionStatusCancelled SubscriptionStatus = "cancelled"
	SubscriptionStatusExpired   SubscriptionStatus = "expired"
	SubscriptionStatusPaused    SubscriptionStatus = "paused"
)

// BillingPeriod represents the billing period type
type BillingPeriod string

const (
	BillingPeriodMonthly  BillingPeriod = "monthly"
	BillingPeriodYearly   BillingPeriod = "yearly"
	BillingPeriodLifetime BillingPeriod = "lifetime"
)

// OrderStatus represents the status of a payment order
type OrderStatus string

const (
	OrderStatusCreated   OrderStatus = "created"
	OrderStatusAttempted OrderStatus = "attempted"
	OrderStatusPaid      OrderStatus = "paid"
	OrderStatusExpired   OrderStatus = "expired"
	OrderStatusFailed    OrderStatus = "failed"
)

// PaymentStatus represents the status of a payment
type PaymentStatus string

const (
	PaymentStatusCreated           PaymentStatus = "created"
	PaymentStatusAuthorized        PaymentStatus = "authorized"
	PaymentStatusCaptured          PaymentStatus = "captured"
	PaymentStatusFailed            PaymentStatus = "failed"
	PaymentStatusRefunded          PaymentStatus = "refunded"
	PaymentStatusPartiallyRefunded PaymentStatus = "partially_refunded"
)

// DiscountType represents the type of discount
type DiscountType string

const (
	DiscountTypePercentage  DiscountType = "percentage"
	DiscountTypeFixedAmount DiscountType = "fixed_amount"
)

// IdempotencyStatus represents the status of an idempotency key
type IdempotencyStatus string

const (
	IdempotencyStatusPending   IdempotencyStatus = "pending"
	IdempotencyStatusCompleted IdempotencyStatus = "completed"
	IdempotencyStatusFailed    IdempotencyStatus = "failed"
)

// PlanFeatures represents the features available in a subscription plan
type PlanFeatures struct {
	MaxPatterns             int  `json:"max_patterns"`
	MaxVisualizers          int  `json:"max_visualizers"`
	QuizQuestionsPerPattern int  `json:"quiz_questions_per_pattern"`
	HasQuizHistory          bool `json:"has_quiz_history"`
	HasCodePlayground       bool `json:"has_code_playground"`
	HasProgressSync         bool `json:"has_progress_sync"`
	HasHighlighting         bool `json:"has_highlighting"`
	HasSolutionsAccess      bool `json:"has_solutions_access"`
	HasOfflineExport        bool `json:"has_offline_export"`
}

// SubscriptionPlan represents a subscription plan
type SubscriptionPlan struct {
	ID                string        `json:"id" db:"id"`
	Name              string        `json:"name" db:"name"`
	Description       *string       `json:"description,omitempty" db:"description"`
	AmountINR         int           `json:"amount_inr" db:"amount_inr"`
	OriginalAmountINR *int          `json:"original_amount_inr,omitempty" db:"original_amount_inr"`
	AmountUSD         *int          `json:"amount_usd,omitempty" db:"amount_usd"`
	OriginalAmountUSD *int          `json:"original_amount_usd,omitempty" db:"original_amount_usd"`
	BillingPeriod     BillingPeriod `json:"billing_period" db:"billing_period"`
	BillingInterval   int           `json:"billing_interval" db:"billing_interval"`
	RazorpayPlanID    *string       `json:"razorpay_plan_id,omitempty" db:"razorpay_plan_id"`
	Features          PlanFeatures  `json:"features" db:"features"`
	IsActive          bool          `json:"is_active" db:"is_active"`
	CreatedAt         time.Time     `json:"created_at" db:"created_at"`
	UpdatedAt         time.Time     `json:"updated_at" db:"updated_at"`
}

// Subscription represents a user's subscription
type Subscription struct {
	ID                     string             `json:"id" db:"id"`
	UserID                 string             `json:"user_id" db:"user_id"`
	PlanID                 string             `json:"plan_id" db:"plan_id"`
	Status                 SubscriptionStatus `json:"status" db:"status"`
	CurrentPeriodStart     *time.Time         `json:"current_period_start,omitempty" db:"current_period_start"`
	CurrentPeriodEnd       *time.Time         `json:"current_period_end,omitempty" db:"current_period_end"`
	RazorpaySubscriptionID *string            `json:"razorpay_subscription_id,omitempty" db:"razorpay_subscription_id"`
	RazorpayCustomerID     *string            `json:"razorpay_customer_id,omitempty" db:"razorpay_customer_id"`
	CancelAtPeriodEnd      bool               `json:"cancel_at_period_end" db:"cancel_at_period_end"`
	CancelledAt            *time.Time         `json:"cancelled_at,omitempty" db:"cancelled_at"`
	CancellationReason     *string            `json:"cancellation_reason,omitempty" db:"cancellation_reason"`
	CreatedAt              time.Time          `json:"created_at" db:"created_at"`
	UpdatedAt              time.Time          `json:"updated_at" db:"updated_at"`
}

// DiscountCode represents a discount code
type DiscountCode struct {
	ID              string       `json:"id" db:"id"`
	Code            string       `json:"code" db:"code"`
	DiscountType    DiscountType `json:"discount_type" db:"discount_type"`
	DiscountValue   int          `json:"discount_value" db:"discount_value"`
	ApplicablePlans []string     `json:"applicable_plans" db:"applicable_plans"`
	MinAmount       *int         `json:"min_amount,omitempty" db:"min_amount"`
	MaxDiscount     *int         `json:"max_discount,omitempty" db:"max_discount"`
	MaxUses         *int         `json:"max_uses,omitempty" db:"max_uses"`
	MaxUsesPerUser  int          `json:"max_uses_per_user" db:"max_uses_per_user"`
	CurrentUses     int          `json:"current_uses" db:"current_uses"`
	StartsAt        time.Time    `json:"starts_at" db:"starts_at"`
	ExpiresAt       *time.Time   `json:"expires_at,omitempty" db:"expires_at"`
	IsActive        bool         `json:"is_active" db:"is_active"`
	CreatedAt       time.Time    `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time    `json:"updated_at" db:"updated_at"`
}

// PaymentOrder represents a payment order
type PaymentOrder struct {
	ID              string      `json:"id" db:"id"`
	UserID          string      `json:"user_id" db:"user_id"`
	SubscriptionID  *string     `json:"subscription_id,omitempty" db:"subscription_id"`
	PlanID          string      `json:"plan_id" db:"plan_id"`
	Subtotal        int         `json:"subtotal" db:"subtotal"`
	DiscountCodeID  *string     `json:"discount_code_id,omitempty" db:"discount_code_id"`
	DiscountAmount  int         `json:"discount_amount" db:"discount_amount"`
	GSTAmount       int         `json:"gst_amount" db:"gst_amount"`
	TotalAmount     int         `json:"total_amount" db:"total_amount"`
	Currency        string      `json:"currency" db:"currency"`
	RazorpayOrderID *string     `json:"razorpay_order_id,omitempty" db:"razorpay_order_id"`
	Status          OrderStatus `json:"status" db:"status"`
	IdempotencyKey  *string     `json:"idempotency_key,omitempty" db:"idempotency_key"`
	Metadata        Metadata    `json:"metadata" db:"metadata"`
	ExpiresAt       time.Time   `json:"expires_at" db:"expires_at"`
	CreatedAt       time.Time   `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time   `json:"updated_at" db:"updated_at"`
}

// Payment represents a payment record
type Payment struct {
	ID                string        `json:"id" db:"id"`
	UserID            string        `json:"user_id" db:"user_id"`
	OrderID           *string       `json:"order_id,omitempty" db:"order_id"`
	SubscriptionID    *string       `json:"subscription_id,omitempty" db:"subscription_id"`
	RazorpayPaymentID string        `json:"razorpay_payment_id" db:"razorpay_payment_id"`
	RazorpayOrderID   *string       `json:"razorpay_order_id,omitempty" db:"razorpay_order_id"`
	RazorpaySignature *string       `json:"razorpay_signature,omitempty" db:"razorpay_signature"`
	Amount            int           `json:"amount" db:"amount"`
	Currency          string        `json:"currency" db:"currency"`
	Method            *string       `json:"method,omitempty" db:"method"`
	MethodDetails     Metadata      `json:"method_details" db:"method_details"`
	Status            PaymentStatus `json:"status" db:"status"`
	RefundAmount      int           `json:"refund_amount" db:"refund_amount"`
	RefundStatus      *string       `json:"refund_status,omitempty" db:"refund_status"`
	RefundedAt        *time.Time    `json:"refunded_at,omitempty" db:"refunded_at"`
	CapturedAt        *time.Time    `json:"captured_at,omitempty" db:"captured_at"`
	CreatedAt         time.Time     `json:"created_at" db:"created_at"`
	UpdatedAt         time.Time     `json:"updated_at" db:"updated_at"`
}

// IdempotencyKey represents an idempotency key record
type IdempotencyKey struct {
	Key          string            `json:"key" db:"key"`
	UserID       string            `json:"user_id" db:"user_id"`
	RequestPath  string            `json:"request_path" db:"request_path"`
	RequestHash  string            `json:"request_hash" db:"request_hash"`
	Status       IdempotencyStatus `json:"status" db:"status"`
	ResponseCode *int              `json:"response_code,omitempty" db:"response_code"`
	ResponseBody json.RawMessage   `json:"response_body,omitempty" db:"response_body"`
	LockedAt     *time.Time        `json:"locked_at,omitempty" db:"locked_at"`
	CompletedAt  *time.Time        `json:"completed_at,omitempty" db:"completed_at"`
	ExpiresAt    time.Time         `json:"expires_at" db:"expires_at"`
	CreatedAt    time.Time         `json:"created_at" db:"created_at"`
}

// WebhookEvent represents a webhook event record
type WebhookEvent struct {
	ID          string          `json:"id" db:"id"`
	EventType   string          `json:"event_type" db:"event_type"`
	Payload     json.RawMessage `json:"payload" db:"payload"`
	ProcessedAt *time.Time      `json:"processed_at,omitempty" db:"processed_at"`
	ReceivedAt  time.Time       `json:"received_at" db:"received_at"`
}

// Metadata is a type alias for arbitrary JSON metadata
type Metadata map[string]interface{}

// IsActive returns true if the subscription is currently active
func (s *Subscription) IsActive() bool {
	if s.Status != SubscriptionStatusActive {
		return false
	}
	if s.CurrentPeriodEnd != nil && s.CurrentPeriodEnd.Before(time.Now()) {
		return false
	}
	return true
}

// IsPro returns true if the subscription is a pro plan
func (s *Subscription) IsPro() bool {
	return s.IsActive() && s.PlanID != "free"
}

// CalculateDiscount calculates the discount amount for a given subtotal
func (d *DiscountCode) CalculateDiscount(subtotal int) int {
	var discount int
	if d.DiscountType == DiscountTypePercentage {
		discount = (subtotal * d.DiscountValue) / 100
	} else {
		discount = d.DiscountValue
	}
	if d.MaxDiscount != nil && discount > *d.MaxDiscount {
		discount = *d.MaxDiscount
	}
	if discount > subtotal {
		discount = subtotal
	}
	return discount
}

// IsValid checks if the discount code is valid for use
func (d *DiscountCode) IsValid(planID string, userUses int) bool {
	if !d.IsActive {
		return false
	}
	now := time.Now()
	if now.Before(d.StartsAt) {
		return false
	}
	if d.ExpiresAt != nil && now.After(*d.ExpiresAt) {
		return false
	}
	if d.MaxUses != nil && d.CurrentUses >= *d.MaxUses {
		return false
	}
	if userUses >= d.MaxUsesPerUser {
		return false
	}
	if len(d.ApplicablePlans) > 0 {
		applicable := false
		for _, p := range d.ApplicablePlans {
			if p == planID {
				applicable = true
				break
			}
		}
		if !applicable {
			return false
		}
	}
	return true
}
