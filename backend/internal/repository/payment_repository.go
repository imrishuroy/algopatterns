package repository

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/imrishuroy/algopatterns/internal/models"
	"github.com/jackc/pgx/v5"
)

var (
	ErrPlanNotFound         = errors.New("subscription plan not found")
	ErrSubscriptionNotFound = errors.New("subscription not found")
	ErrOrderNotFound        = errors.New("order not found")
	ErrPaymentNotFound      = errors.New("payment not found")
	ErrDiscountCodeNotFound = errors.New("discount code not found")
	ErrDiscountCodeInvalid  = errors.New("discount code is invalid or expired")
	ErrIdempotencyConflict  = errors.New("request with this idempotency key is already being processed")
	ErrOrderAlreadyPaid     = errors.New("order has already been paid")
)

type PaymentRepository struct {
	db *Database
}

func NewPaymentRepository(db *Database) *PaymentRepository {
	return &PaymentRepository{db: db}
}

// Plans

func (r *PaymentRepository) GetAllPlans(ctx context.Context) ([]models.SubscriptionPlan, error) {
	rows, err := r.db.Pool.Query(ctx, `
		SELECT id, name, description, amount_inr, original_amount_inr,
			amount_usd, original_amount_usd, billing_period, billing_interval,
			razorpay_plan_id, features, is_active, created_at, updated_at
		FROM subscription_plans
		WHERE is_active = true
		ORDER BY amount_inr ASC
	`)
	if err != nil {
		return nil, fmt.Errorf("failed to query plans: %w", err)
	}
	defer rows.Close()

	var plans []models.SubscriptionPlan
	for rows.Next() {
		var p models.SubscriptionPlan
		var featuresJSON []byte
		err := rows.Scan(
			&p.ID, &p.Name, &p.Description, &p.AmountINR, &p.OriginalAmountINR,
			&p.AmountUSD, &p.OriginalAmountUSD, &p.BillingPeriod, &p.BillingInterval,
			&p.RazorpayPlanID, &featuresJSON, &p.IsActive, &p.CreatedAt, &p.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan plan: %w", err)
		}
		if err := json.Unmarshal(featuresJSON, &p.Features); err != nil {
			return nil, fmt.Errorf("failed to unmarshal features: %w", err)
		}
		plans = append(plans, p)
	}
	return plans, nil
}

func (r *PaymentRepository) GetPlanByID(ctx context.Context, id string) (*models.SubscriptionPlan, error) {
	var p models.SubscriptionPlan
	var featuresJSON []byte
	err := r.db.Pool.QueryRow(ctx, `
		SELECT id, name, description, amount_inr, original_amount_inr,
			amount_usd, original_amount_usd, billing_period, billing_interval,
			razorpay_plan_id, features, is_active, created_at, updated_at
		FROM subscription_plans
		WHERE id = $1 AND is_active = true
	`, id).Scan(
		&p.ID, &p.Name, &p.Description, &p.AmountINR, &p.OriginalAmountINR,
		&p.AmountUSD, &p.OriginalAmountUSD, &p.BillingPeriod, &p.BillingInterval,
		&p.RazorpayPlanID, &featuresJSON, &p.IsActive, &p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrPlanNotFound
		}
		return nil, fmt.Errorf("failed to get plan: %w", err)
	}
	if err := json.Unmarshal(featuresJSON, &p.Features); err != nil {
		return nil, fmt.Errorf("failed to unmarshal features: %w", err)
	}
	return &p, nil
}

// Subscriptions

func (r *PaymentRepository) CreateSubscription(ctx context.Context, s *models.Subscription) error {
	now := time.Now()
	s.CreatedAt = now
	s.UpdatedAt = now
	if s.ID == "" {
		s.ID = uuid.New().String()
	}

	_, err := r.db.Pool.Exec(ctx, `
		INSERT INTO subscriptions (
			id, user_id, plan_id, status, current_period_start, current_period_end,
			razorpay_subscription_id, razorpay_customer_id,
			cancel_at_period_end, cancelled_at, cancellation_reason,
			created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
	`, s.ID, s.UserID, s.PlanID, s.Status, s.CurrentPeriodStart, s.CurrentPeriodEnd,
		s.RazorpaySubscriptionID, s.RazorpayCustomerID,
		s.CancelAtPeriodEnd, s.CancelledAt, s.CancellationReason,
		s.CreatedAt, s.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to create subscription: %w", err)
	}
	return nil
}

func (r *PaymentRepository) GetActiveSubscriptionByUserID(ctx context.Context, userID string) (*models.Subscription, error) {
	var s models.Subscription
	err := r.db.Pool.QueryRow(ctx, `
		SELECT id, user_id, plan_id, status, current_period_start, current_period_end,
			razorpay_subscription_id, razorpay_customer_id,
			cancel_at_period_end, cancelled_at, cancellation_reason,
			created_at, updated_at
		FROM subscriptions
		WHERE user_id = $1 AND status IN ('active', 'past_due')
		ORDER BY created_at DESC
		LIMIT 1
	`, userID).Scan(
		&s.ID, &s.UserID, &s.PlanID, &s.Status, &s.CurrentPeriodStart, &s.CurrentPeriodEnd,
		&s.RazorpaySubscriptionID, &s.RazorpayCustomerID,
		&s.CancelAtPeriodEnd, &s.CancelledAt, &s.CancellationReason,
		&s.CreatedAt, &s.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrSubscriptionNotFound
		}
		return nil, fmt.Errorf("failed to get subscription: %w", err)
	}
	return &s, nil
}

func (r *PaymentRepository) GetSubscriptionByID(ctx context.Context, id string) (*models.Subscription, error) {
	var s models.Subscription
	err := r.db.Pool.QueryRow(ctx, `
		SELECT id, user_id, plan_id, status, current_period_start, current_period_end,
			razorpay_subscription_id, razorpay_customer_id,
			cancel_at_period_end, cancelled_at, cancellation_reason,
			created_at, updated_at
		FROM subscriptions
		WHERE id = $1
	`, id).Scan(
		&s.ID, &s.UserID, &s.PlanID, &s.Status, &s.CurrentPeriodStart, &s.CurrentPeriodEnd,
		&s.RazorpaySubscriptionID, &s.RazorpayCustomerID,
		&s.CancelAtPeriodEnd, &s.CancelledAt, &s.CancellationReason,
		&s.CreatedAt, &s.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrSubscriptionNotFound
		}
		return nil, fmt.Errorf("failed to get subscription: %w", err)
	}
	return &s, nil
}

func (r *PaymentRepository) GetSubscriptionByRazorpayID(ctx context.Context, razorpaySubID string) (*models.Subscription, error) {
	var s models.Subscription
	err := r.db.Pool.QueryRow(ctx, `
		SELECT id, user_id, plan_id, status, current_period_start, current_period_end,
			razorpay_subscription_id, razorpay_customer_id,
			cancel_at_period_end, cancelled_at, cancellation_reason,
			created_at, updated_at
		FROM subscriptions
		WHERE razorpay_subscription_id = $1
	`, razorpaySubID).Scan(
		&s.ID, &s.UserID, &s.PlanID, &s.Status, &s.CurrentPeriodStart, &s.CurrentPeriodEnd,
		&s.RazorpaySubscriptionID, &s.RazorpayCustomerID,
		&s.CancelAtPeriodEnd, &s.CancelledAt, &s.CancellationReason,
		&s.CreatedAt, &s.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrSubscriptionNotFound
		}
		return nil, fmt.Errorf("failed to get subscription by razorpay id: %w", err)
	}
	return &s, nil
}

func (r *PaymentRepository) UpdateSubscription(ctx context.Context, s *models.Subscription) error {
	s.UpdatedAt = time.Now()
	_, err := r.db.Pool.Exec(ctx, `
		UPDATE subscriptions SET
			status = $2, current_period_start = $3, current_period_end = $4,
			razorpay_subscription_id = $5, razorpay_customer_id = $6,
			cancel_at_period_end = $7, cancelled_at = $8, cancellation_reason = $9,
			updated_at = $10
		WHERE id = $1
	`, s.ID, s.Status, s.CurrentPeriodStart, s.CurrentPeriodEnd,
		s.RazorpaySubscriptionID, s.RazorpayCustomerID,
		s.CancelAtPeriodEnd, s.CancelledAt, s.CancellationReason,
		s.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to update subscription: %w", err)
	}
	return nil
}

// Orders

func (r *PaymentRepository) CreateOrder(ctx context.Context, o *models.PaymentOrder) error {
	now := time.Now()
	o.CreatedAt = now
	o.UpdatedAt = now
	if o.ID == "" {
		o.ID = uuid.New().String()
	}

	metadataJSON, err := json.Marshal(o.Metadata)
	if err != nil {
		return fmt.Errorf("failed to marshal metadata: %w", err)
	}

	_, err = r.db.Pool.Exec(ctx, `
		INSERT INTO payment_orders (
			id, user_id, subscription_id, plan_id,
			subtotal, discount_code_id, discount_amount, gst_amount, total_amount,
			currency, razorpay_order_id, status, idempotency_key,
			metadata, expires_at, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
	`, o.ID, o.UserID, o.SubscriptionID, o.PlanID,
		o.Subtotal, o.DiscountCodeID, o.DiscountAmount, o.GSTAmount, o.TotalAmount,
		o.Currency, o.RazorpayOrderID, o.Status, o.IdempotencyKey,
		metadataJSON, o.ExpiresAt, o.CreatedAt, o.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to create order: %w", err)
	}
	return nil
}

func (r *PaymentRepository) GetOrderByID(ctx context.Context, id string) (*models.PaymentOrder, error) {
	var o models.PaymentOrder
	var metadataJSON []byte
	err := r.db.Pool.QueryRow(ctx, `
		SELECT id, user_id, subscription_id, plan_id,
			subtotal, discount_code_id, discount_amount, gst_amount, total_amount,
			currency, razorpay_order_id, status, idempotency_key,
			metadata, expires_at, created_at, updated_at
		FROM payment_orders
		WHERE id = $1
	`, id).Scan(
		&o.ID, &o.UserID, &o.SubscriptionID, &o.PlanID,
		&o.Subtotal, &o.DiscountCodeID, &o.DiscountAmount, &o.GSTAmount, &o.TotalAmount,
		&o.Currency, &o.RazorpayOrderID, &o.Status, &o.IdempotencyKey,
		&metadataJSON, &o.ExpiresAt, &o.CreatedAt, &o.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrOrderNotFound
		}
		return nil, fmt.Errorf("failed to get order: %w", err)
	}
	if metadataJSON != nil {
		if err := json.Unmarshal(metadataJSON, &o.Metadata); err != nil {
			return nil, fmt.Errorf("failed to unmarshal metadata: %w", err)
		}
	}
	return &o, nil
}

func (r *PaymentRepository) GetOrderByRazorpayID(ctx context.Context, razorpayOrderID string) (*models.PaymentOrder, error) {
	var o models.PaymentOrder
	var metadataJSON []byte
	err := r.db.Pool.QueryRow(ctx, `
		SELECT id, user_id, subscription_id, plan_id,
			subtotal, discount_code_id, discount_amount, gst_amount, total_amount,
			currency, razorpay_order_id, status, idempotency_key,
			metadata, expires_at, created_at, updated_at
		FROM payment_orders
		WHERE razorpay_order_id = $1
	`, razorpayOrderID).Scan(
		&o.ID, &o.UserID, &o.SubscriptionID, &o.PlanID,
		&o.Subtotal, &o.DiscountCodeID, &o.DiscountAmount, &o.GSTAmount, &o.TotalAmount,
		&o.Currency, &o.RazorpayOrderID, &o.Status, &o.IdempotencyKey,
		&metadataJSON, &o.ExpiresAt, &o.CreatedAt, &o.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrOrderNotFound
		}
		return nil, fmt.Errorf("failed to get order: %w", err)
	}
	if metadataJSON != nil {
		if err := json.Unmarshal(metadataJSON, &o.Metadata); err != nil {
			return nil, fmt.Errorf("failed to unmarshal metadata: %w", err)
		}
	}
	return &o, nil
}

func (r *PaymentRepository) UpdateOrderStatus(ctx context.Context, id string, status models.OrderStatus) error {
	_, err := r.db.Pool.Exec(ctx, `
		UPDATE payment_orders SET status = $2, updated_at = $3 WHERE id = $1
	`, id, status, time.Now())
	if err != nil {
		return fmt.Errorf("failed to update order status: %w", err)
	}
	return nil
}

// Payments

func (r *PaymentRepository) CreatePayment(ctx context.Context, p *models.Payment) error {
	now := time.Now()
	p.CreatedAt = now
	p.UpdatedAt = now
	if p.ID == "" {
		p.ID = uuid.New().String()
	}

	methodDetailsJSON, err := json.Marshal(p.MethodDetails)
	if err != nil {
		return fmt.Errorf("failed to marshal method details: %w", err)
	}

	_, err = r.db.Pool.Exec(ctx, `
		INSERT INTO payments (
			id, user_id, order_id, subscription_id,
			razorpay_payment_id, razorpay_order_id, razorpay_signature,
			amount, currency, method, method_details, status,
			refund_amount, refund_status, refunded_at, captured_at,
			created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
	`, p.ID, p.UserID, p.OrderID, p.SubscriptionID,
		p.RazorpayPaymentID, p.RazorpayOrderID, p.RazorpaySignature,
		p.Amount, p.Currency, p.Method, methodDetailsJSON, p.Status,
		p.RefundAmount, p.RefundStatus, p.RefundedAt, p.CapturedAt,
		p.CreatedAt, p.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to create payment: %w", err)
	}
	return nil
}

func (r *PaymentRepository) GetPaymentByRazorpayID(ctx context.Context, razorpayPaymentID string) (*models.Payment, error) {
	var p models.Payment
	var methodDetailsJSON []byte
	err := r.db.Pool.QueryRow(ctx, `
		SELECT id, user_id, order_id, subscription_id,
			razorpay_payment_id, razorpay_order_id, razorpay_signature,
			amount, currency, method, method_details, status,
			refund_amount, refund_status, refunded_at, captured_at,
			created_at, updated_at
		FROM payments
		WHERE razorpay_payment_id = $1
	`, razorpayPaymentID).Scan(
		&p.ID, &p.UserID, &p.OrderID, &p.SubscriptionID,
		&p.RazorpayPaymentID, &p.RazorpayOrderID, &p.RazorpaySignature,
		&p.Amount, &p.Currency, &p.Method, &methodDetailsJSON, &p.Status,
		&p.RefundAmount, &p.RefundStatus, &p.RefundedAt, &p.CapturedAt,
		&p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrPaymentNotFound
		}
		return nil, fmt.Errorf("failed to get payment: %w", err)
	}
	if methodDetailsJSON != nil {
		if err := json.Unmarshal(methodDetailsJSON, &p.MethodDetails); err != nil {
			return nil, fmt.Errorf("failed to unmarshal method details: %w", err)
		}
	}
	return &p, nil
}

func (r *PaymentRepository) UpdatePaymentStatus(ctx context.Context, id string, status models.PaymentStatus, capturedAt *time.Time) error {
	_, err := r.db.Pool.Exec(ctx, `
		UPDATE payments SET status = $2, captured_at = $3, updated_at = $4 WHERE id = $1
	`, id, status, capturedAt, time.Now())
	if err != nil {
		return fmt.Errorf("failed to update payment status: %w", err)
	}
	return nil
}

func (r *PaymentRepository) UpdatePayment(ctx context.Context, p *models.Payment) error {
	p.UpdatedAt = time.Now()

	methodDetailsJSON, err := json.Marshal(p.MethodDetails)
	if err != nil {
		return fmt.Errorf("failed to marshal method details: %w", err)
	}

	_, err = r.db.Pool.Exec(ctx, `
		UPDATE payments SET
			status = $2, method = $3, method_details = $4,
			refund_amount = $5, refund_status = $6, refunded_at = $7,
			captured_at = $8, updated_at = $9
		WHERE id = $1
	`, p.ID, p.Status, p.Method, methodDetailsJSON,
		p.RefundAmount, p.RefundStatus, p.RefundedAt,
		p.CapturedAt, p.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to update payment: %w", err)
	}
	return nil
}

// Discount Codes

func (r *PaymentRepository) GetDiscountCodeByCode(ctx context.Context, code string) (*models.DiscountCode, error) {
	var d models.DiscountCode
	var applicablePlansJSON []byte
	err := r.db.Pool.QueryRow(ctx, `
		SELECT id, code, discount_type, discount_value, applicable_plans,
			min_amount, max_discount, max_uses, max_uses_per_user, current_uses,
			starts_at, expires_at, is_active, created_at, updated_at
		FROM discount_codes
		WHERE UPPER(code) = UPPER($1)
	`, code).Scan(
		&d.ID, &d.Code, &d.DiscountType, &d.DiscountValue, &applicablePlansJSON,
		&d.MinAmount, &d.MaxDiscount, &d.MaxUses, &d.MaxUsesPerUser, &d.CurrentUses,
		&d.StartsAt, &d.ExpiresAt, &d.IsActive, &d.CreatedAt, &d.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrDiscountCodeNotFound
		}
		return nil, fmt.Errorf("failed to get discount code: %w", err)
	}
	if applicablePlansJSON != nil {
		if err := json.Unmarshal(applicablePlansJSON, &d.ApplicablePlans); err != nil {
			return nil, fmt.Errorf("failed to unmarshal applicable plans: %w", err)
		}
	}
	return &d, nil
}

func (r *PaymentRepository) GetUserDiscountCodeUses(ctx context.Context, userID, discountCodeID string) (int, error) {
	var count int
	err := r.db.Pool.QueryRow(ctx, `
		SELECT COUNT(*) FROM discount_code_uses
		WHERE user_id = $1 AND discount_code_id = $2
	`, userID, discountCodeID).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to count discount uses: %w", err)
	}
	return count, nil
}

func (r *PaymentRepository) RecordDiscountCodeUse(ctx context.Context, discountCodeID, userID, orderID string, discountAmount int) error {
	tx, err := r.db.Pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	_, err = tx.Exec(ctx, `
		INSERT INTO discount_code_uses (discount_code_id, user_id, order_id, discount_amount)
		VALUES ($1, $2, $3, $4)
	`, discountCodeID, userID, orderID, discountAmount)
	if err != nil {
		return fmt.Errorf("failed to record discount use: %w", err)
	}

	_, err = tx.Exec(ctx, `
		UPDATE discount_codes SET current_uses = current_uses + 1, updated_at = $2 WHERE id = $1
	`, discountCodeID, time.Now())
	if err != nil {
		return fmt.Errorf("failed to increment discount uses: %w", err)
	}

	return tx.Commit(ctx)
}

// Idempotency

func (r *PaymentRepository) GetIdempotencyKey(ctx context.Context, key string) (*models.IdempotencyKey, error) {
	var k models.IdempotencyKey
	err := r.db.Pool.QueryRow(ctx, `
		SELECT key, user_id, request_path, request_hash, status,
			response_code, response_body, locked_at, completed_at, expires_at, created_at
		FROM idempotency_keys
		WHERE key = $1
	`, key).Scan(
		&k.Key, &k.UserID, &k.RequestPath, &k.RequestHash, &k.Status,
		&k.ResponseCode, &k.ResponseBody, &k.LockedAt, &k.CompletedAt, &k.ExpiresAt, &k.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get idempotency key: %w", err)
	}
	return &k, nil
}

func (r *PaymentRepository) CreateIdempotencyKey(ctx context.Context, k *models.IdempotencyKey) error {
	now := time.Now()
	k.CreatedAt = now
	k.LockedAt = &now

	_, err := r.db.Pool.Exec(ctx, `
		INSERT INTO idempotency_keys (key, user_id, request_path, request_hash, status, locked_at, expires_at, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`, k.Key, k.UserID, k.RequestPath, k.RequestHash, k.Status, k.LockedAt, k.ExpiresAt, k.CreatedAt)
	if err != nil {
		return fmt.Errorf("failed to create idempotency key: %w", err)
	}
	return nil
}

func (r *PaymentRepository) CompleteIdempotencyKey(ctx context.Context, key string, responseCode int, responseBody []byte) error {
	now := time.Now()
	_, err := r.db.Pool.Exec(ctx, `
		UPDATE idempotency_keys
		SET status = $2, response_code = $3, response_body = $4, completed_at = $5
		WHERE key = $1
	`, key, models.IdempotencyStatusCompleted, responseCode, responseBody, now)
	if err != nil {
		return fmt.Errorf("failed to complete idempotency key: %w", err)
	}
	return nil
}

func (r *PaymentRepository) FailIdempotencyKey(ctx context.Context, key string) error {
	_, err := r.db.Pool.Exec(ctx, `
		UPDATE idempotency_keys SET status = $2 WHERE key = $1
	`, key, models.IdempotencyStatusFailed)
	if err != nil {
		return fmt.Errorf("failed to fail idempotency key: %w", err)
	}
	return nil
}

// Webhook Events

func (r *PaymentRepository) WebhookEventExists(ctx context.Context, eventID string) (bool, error) {
	var exists bool
	err := r.db.Pool.QueryRow(ctx, `
		SELECT EXISTS(SELECT 1 FROM webhook_events WHERE id = $1)
	`, eventID).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("failed to check webhook event: %w", err)
	}
	return exists, nil
}

func (r *PaymentRepository) CreateWebhookEvent(ctx context.Context, e *models.WebhookEvent) error {
	e.ReceivedAt = time.Now()
	_, err := r.db.Pool.Exec(ctx, `
		INSERT INTO webhook_events (id, event_type, payload, received_at)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (id) DO NOTHING
	`, e.ID, e.EventType, e.Payload, e.ReceivedAt)
	if err != nil {
		return fmt.Errorf("failed to create webhook event: %w", err)
	}
	return nil
}

func (r *PaymentRepository) MarkWebhookEventProcessed(ctx context.Context, eventID string) error {
	now := time.Now()
	_, err := r.db.Pool.Exec(ctx, `
		UPDATE webhook_events SET processed_at = $2 WHERE id = $1
	`, eventID, now)
	if err != nil {
		return fmt.Errorf("failed to mark webhook processed: %w", err)
	}
	return nil
}
