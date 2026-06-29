package services

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"time"

	"github.com/google/uuid"
	"github.com/imrishuroy/algopatterns/internal/models"
	"github.com/imrishuroy/algopatterns/internal/razorpay"
	"github.com/imrishuroy/algopatterns/internal/repository"
)

type WebhookService struct {
	repo     *repository.PaymentRepository
	razorpay *razorpay.Client
	logger   *slog.Logger
}

func NewWebhookService(repo *repository.PaymentRepository, rzpClient *razorpay.Client, logger *slog.Logger) *WebhookService {
	return &WebhookService{
		repo:     repo,
		razorpay: rzpClient,
		logger:   logger,
	}
}

func (s *WebhookService) ProcessWebhook(ctx context.Context, body []byte, signature string) error {
	if !s.razorpay.VerifyWebhookSignature(body, signature) {
		return fmt.Errorf("invalid webhook signature")
	}

	var event models.RazorpayWebhookEvent
	if err := json.Unmarshal(body, &event); err != nil {
		return fmt.Errorf("failed to parse webhook: %w", err)
	}

	eventID := fmt.Sprintf("%s_%d", event.Event, event.CreatedAt)

	exists, err := s.repo.WebhookEventExists(ctx, eventID)
	if err != nil {
		return fmt.Errorf("failed to check event existence: %w", err)
	}
	if exists {
		s.logger.Info("webhook event already processed", "event_id", eventID)
		return nil
	}

	webhookEvent := &models.WebhookEvent{
		ID:        eventID,
		EventType: event.Event,
		Payload:   body,
	}
	if err := s.repo.CreateWebhookEvent(ctx, webhookEvent); err != nil {
		s.logger.Warn("failed to create webhook event record", "error", err)
	}

	switch event.Event {
	case "payment.captured":
		return s.handlePaymentCaptured(ctx, event)
	case "payment.failed":
		return s.handlePaymentFailed(ctx, event)
	case "order.paid":
		return s.handleOrderPaid(ctx, event)
	case "subscription.activated":
		return s.handleSubscriptionActivated(ctx, event)
	case "subscription.charged":
		return s.handleSubscriptionCharged(ctx, event)
	case "subscription.cancelled":
		return s.handleSubscriptionCancelled(ctx, event)
	case "subscription.paused":
		return s.handleSubscriptionPaused(ctx, event)
	case "subscription.resumed":
		return s.handleSubscriptionResumed(ctx, event)
	case "subscription.pending":
		return s.handleSubscriptionPending(ctx, event)
	case "subscription.halted":
		return s.handleSubscriptionHalted(ctx, event)
	case "refund.created":
		return s.handleRefundCreated(ctx, event)
	default:
		s.logger.Info("unhandled webhook event", "event", event.Event)
	}

	if err := s.repo.MarkWebhookEventProcessed(ctx, eventID); err != nil {
		s.logger.Warn("failed to mark webhook as processed", "error", err)
	}

	return nil
}

func (s *WebhookService) handlePaymentCaptured(ctx context.Context, event models.RazorpayWebhookEvent) error {
	paymentData, ok := event.Payload["payment"].(map[string]interface{})
	if !ok {
		return fmt.Errorf("invalid payment payload")
	}

	entityData, ok := paymentData["entity"].(map[string]interface{})
	if !ok {
		return fmt.Errorf("invalid payment entity")
	}

	paymentID, _ := entityData["id"].(string)
	orderID, _ := entityData["order_id"].(string)
	amount := int(entityData["amount"].(float64))
	method, _ := entityData["method"].(string)

	existing, err := s.repo.GetPaymentByRazorpayID(ctx, paymentID)
	if err == nil && existing != nil {
		s.logger.Info("payment already exists", "payment_id", paymentID)
		return nil
	}

	order, err := s.repo.GetOrderByRazorpayID(ctx, orderID)
	if err != nil {
		s.logger.Warn("order not found for webhook payment", "order_id", orderID)
		return nil
	}

	now := time.Now()
	payment := &models.Payment{
		ID:                uuid.New().String(),
		UserID:            order.UserID,
		OrderID:           &order.ID,
		RazorpayPaymentID: paymentID,
		RazorpayOrderID:   &orderID,
		Amount:            amount,
		Currency:          order.Currency,
		Method:            &method,
		Status:            models.PaymentStatusCaptured,
		CapturedAt:        &now,
	}

	if err := s.repo.CreatePayment(ctx, payment); err != nil {
		return fmt.Errorf("failed to create payment: %w", err)
	}

	if order.Status != models.OrderStatusPaid {
		if err := s.repo.UpdateOrderStatus(ctx, order.ID, models.OrderStatusPaid); err != nil {
			return fmt.Errorf("failed to update order: %w", err)
		}
	}

	// Activate subscription if not already active
	if err := s.activateSubscription(ctx, order); err != nil {
		s.logger.Error("failed to activate subscription via webhook", "error", err, "order_id", order.ID)
	}

	s.logger.Info("payment captured via webhook",
		"payment_id", paymentID,
		"order_id", orderID,
		"amount", amount,
	)

	return nil
}

func (s *WebhookService) activateSubscription(ctx context.Context, order *models.PaymentOrder) error {
	plan, err := s.repo.GetPlanByID(ctx, order.PlanID)
	if err != nil {
		return fmt.Errorf("failed to get plan: %w", err)
	}

	existing, err := s.repo.GetActiveSubscriptionByUserID(ctx, order.UserID)
	if err == nil && existing != nil && existing.Status == models.SubscriptionStatusActive {
		s.logger.Info("subscription already active", "user_id", order.UserID)
		return nil
	}

	now := time.Now()
	var periodEnd *time.Time

	switch plan.BillingPeriod {
	case models.BillingPeriodMonthly:
		end := now.AddDate(0, 1, 0)
		periodEnd = &end
	case models.BillingPeriodYearly:
		end := now.AddDate(1, 0, 0)
		periodEnd = &end
	case models.BillingPeriodLifetime:
		end := now.AddDate(100, 0, 0)
		periodEnd = &end
	}

	if existing != nil {
		existing.PlanID = order.PlanID
		existing.Status = models.SubscriptionStatusActive
		existing.CurrentPeriodStart = &now
		existing.CurrentPeriodEnd = periodEnd
		existing.CancelAtPeriodEnd = false
		existing.UpdatedAt = now

		if err := s.repo.UpdateSubscription(ctx, existing); err != nil {
			return fmt.Errorf("failed to update subscription: %w", err)
		}
		s.logger.Info("subscription updated via webhook", "user_id", order.UserID, "plan_id", order.PlanID)
		return nil
	}

	subscription := &models.Subscription{
		ID:                 uuid.New().String(),
		UserID:             order.UserID,
		PlanID:             order.PlanID,
		Status:             models.SubscriptionStatusActive,
		CurrentPeriodStart: &now,
		CurrentPeriodEnd:   periodEnd,
		CancelAtPeriodEnd:  false,
		CreatedAt:          now,
		UpdatedAt:          now,
	}

	if err := s.repo.CreateSubscription(ctx, subscription); err != nil {
		return fmt.Errorf("failed to create subscription: %w", err)
	}

	s.logger.Info("subscription created via webhook", "user_id", order.UserID, "plan_id", order.PlanID)
	return nil
}

func (s *WebhookService) handlePaymentFailed(ctx context.Context, event models.RazorpayWebhookEvent) error {
	paymentData, ok := event.Payload["payment"].(map[string]interface{})
	if !ok {
		return fmt.Errorf("invalid payment payload")
	}

	entityData, ok := paymentData["entity"].(map[string]interface{})
	if !ok {
		return fmt.Errorf("invalid payment entity")
	}

	paymentID, _ := entityData["id"].(string)
	orderID, _ := entityData["order_id"].(string)
	errorCode, _ := entityData["error_code"].(string)
	errorDesc, _ := entityData["error_description"].(string)

	order, err := s.repo.GetOrderByRazorpayID(ctx, orderID)
	if err != nil {
		s.logger.Warn("order not found for failed payment", "order_id", orderID)
		return nil
	}

	if order.Status == models.OrderStatusPaid {
		return nil
	}

	if err := s.repo.UpdateOrderStatus(ctx, order.ID, models.OrderStatusFailed); err != nil {
		return fmt.Errorf("failed to update order status: %w", err)
	}

	s.logger.Info("payment failed via webhook",
		"payment_id", paymentID,
		"order_id", orderID,
		"error_code", errorCode,
		"error_desc", errorDesc,
	)

	return nil
}

func (s *WebhookService) handleOrderPaid(ctx context.Context, event models.RazorpayWebhookEvent) error {
	orderData, ok := event.Payload["order"].(map[string]interface{})
	if !ok {
		return fmt.Errorf("invalid order payload")
	}

	entityData, ok := orderData["entity"].(map[string]interface{})
	if !ok {
		return fmt.Errorf("invalid order entity")
	}

	razorpayOrderID, _ := entityData["id"].(string)

	order, err := s.repo.GetOrderByRazorpayID(ctx, razorpayOrderID)
	if err != nil {
		s.logger.Warn("order not found", "razorpay_order_id", razorpayOrderID)
		return nil
	}

	if order.Status == models.OrderStatusPaid {
		return nil
	}

	if err := s.repo.UpdateOrderStatus(ctx, order.ID, models.OrderStatusPaid); err != nil {
		return fmt.Errorf("failed to update order: %w", err)
	}

	s.logger.Info("order marked paid via webhook", "order_id", order.ID)

	return nil
}

func (s *WebhookService) handleSubscriptionActivated(ctx context.Context, event models.RazorpayWebhookEvent) error {
	subData, ok := event.Payload["subscription"].(map[string]interface{})
	if !ok {
		return fmt.Errorf("invalid subscription payload")
	}

	entityData, ok := subData["entity"].(map[string]interface{})
	if !ok {
		return fmt.Errorf("invalid subscription entity")
	}

	razorpaySubID, _ := entityData["id"].(string)
	planID, _ := entityData["plan_id"].(string)

	sub, err := s.repo.GetSubscriptionByRazorpayID(ctx, razorpaySubID)
	if err != nil {
		s.logger.Warn("subscription not found for activation", "razorpay_sub_id", razorpaySubID)
		return nil
	}

	if sub.Status == models.SubscriptionStatusActive {
		return nil
	}

	now := time.Now()
	sub.Status = models.SubscriptionStatusActive
	sub.UpdatedAt = now

	if currentStart, ok := entityData["current_start"].(float64); ok {
		start := time.Unix(int64(currentStart), 0)
		sub.CurrentPeriodStart = &start
	}
	if currentEnd, ok := entityData["current_end"].(float64); ok {
		end := time.Unix(int64(currentEnd), 0)
		sub.CurrentPeriodEnd = &end
	}

	if err := s.repo.UpdateSubscription(ctx, sub); err != nil {
		return fmt.Errorf("failed to update subscription: %w", err)
	}

	s.logger.Info("subscription activated via webhook",
		"razorpay_sub_id", razorpaySubID,
		"plan_id", planID,
		"user_id", sub.UserID,
	)

	return nil
}

func (s *WebhookService) handleSubscriptionCharged(ctx context.Context, event models.RazorpayWebhookEvent) error {
	subData, ok := event.Payload["subscription"].(map[string]interface{})
	if !ok {
		return fmt.Errorf("invalid subscription payload")
	}

	entityData, ok := subData["entity"].(map[string]interface{})
	if !ok {
		return fmt.Errorf("invalid subscription entity")
	}

	razorpaySubID, _ := entityData["id"].(string)

	sub, err := s.repo.GetSubscriptionByRazorpayID(ctx, razorpaySubID)
	if err != nil {
		s.logger.Warn("subscription not found for charge", "razorpay_sub_id", razorpaySubID)
		return nil
	}

	now := time.Now()
	sub.Status = models.SubscriptionStatusActive
	sub.UpdatedAt = now

	if currentStart, ok := entityData["current_start"].(float64); ok {
		start := time.Unix(int64(currentStart), 0)
		sub.CurrentPeriodStart = &start
	}
	if currentEnd, ok := entityData["current_end"].(float64); ok {
		end := time.Unix(int64(currentEnd), 0)
		sub.CurrentPeriodEnd = &end
	}

	if err := s.repo.UpdateSubscription(ctx, sub); err != nil {
		return fmt.Errorf("failed to update subscription: %w", err)
	}

	// Record the payment
	paymentData, ok := event.Payload["payment"].(map[string]interface{})
	if ok {
		if paymentEntity, ok := paymentData["entity"].(map[string]interface{}); ok {
			paymentID, _ := paymentEntity["id"].(string)
			amount := int(paymentEntity["amount"].(float64))
			method, _ := paymentEntity["method"].(string)

			payment := &models.Payment{
				ID:                uuid.New().String(),
				UserID:            sub.UserID,
				SubscriptionID:    &sub.ID,
				RazorpayPaymentID: paymentID,
				Amount:            amount,
				Currency:          "INR",
				Method:            &method,
				Status:            models.PaymentStatusCaptured,
				CapturedAt:        &now,
			}

			if err := s.repo.CreatePayment(ctx, payment); err != nil {
				s.logger.Warn("failed to record subscription payment", "error", err)
			}
		}
	}

	s.logger.Info("subscription charged via webhook",
		"razorpay_sub_id", razorpaySubID,
		"user_id", sub.UserID,
	)

	return nil
}

func (s *WebhookService) handleSubscriptionCancelled(ctx context.Context, event models.RazorpayWebhookEvent) error {
	subData, ok := event.Payload["subscription"].(map[string]interface{})
	if !ok {
		return fmt.Errorf("invalid subscription payload")
	}

	entityData, ok := subData["entity"].(map[string]interface{})
	if !ok {
		return fmt.Errorf("invalid subscription entity")
	}

	razorpaySubID, _ := entityData["id"].(string)

	sub, err := s.repo.GetSubscriptionByRazorpayID(ctx, razorpaySubID)
	if err != nil {
		s.logger.Warn("subscription not found for cancellation", "razorpay_sub_id", razorpaySubID)
		return nil
	}

	now := time.Now()
	sub.Status = models.SubscriptionStatusCancelled
	sub.CancelledAt = &now
	sub.UpdatedAt = now

	if err := s.repo.UpdateSubscription(ctx, sub); err != nil {
		return fmt.Errorf("failed to update subscription: %w", err)
	}

	s.logger.Info("subscription cancelled via webhook",
		"razorpay_sub_id", razorpaySubID,
		"user_id", sub.UserID,
	)

	return nil
}

func (s *WebhookService) handleSubscriptionPaused(ctx context.Context, event models.RazorpayWebhookEvent) error {
	subData, ok := event.Payload["subscription"].(map[string]interface{})
	if !ok {
		return fmt.Errorf("invalid subscription payload")
	}

	entityData, ok := subData["entity"].(map[string]interface{})
	if !ok {
		return fmt.Errorf("invalid subscription entity")
	}

	razorpaySubID, _ := entityData["id"].(string)

	sub, err := s.repo.GetSubscriptionByRazorpayID(ctx, razorpaySubID)
	if err != nil {
		s.logger.Warn("subscription not found for pause", "razorpay_sub_id", razorpaySubID)
		return nil
	}

	now := time.Now()
	sub.Status = models.SubscriptionStatusPaused
	sub.UpdatedAt = now

	if err := s.repo.UpdateSubscription(ctx, sub); err != nil {
		return fmt.Errorf("failed to update subscription: %w", err)
	}

	s.logger.Info("subscription paused via webhook",
		"razorpay_sub_id", razorpaySubID,
		"user_id", sub.UserID,
	)

	return nil
}

func (s *WebhookService) handleSubscriptionResumed(ctx context.Context, event models.RazorpayWebhookEvent) error {
	subData, ok := event.Payload["subscription"].(map[string]interface{})
	if !ok {
		return fmt.Errorf("invalid subscription payload")
	}

	entityData, ok := subData["entity"].(map[string]interface{})
	if !ok {
		return fmt.Errorf("invalid subscription entity")
	}

	razorpaySubID, _ := entityData["id"].(string)

	sub, err := s.repo.GetSubscriptionByRazorpayID(ctx, razorpaySubID)
	if err != nil {
		s.logger.Warn("subscription not found for resume", "razorpay_sub_id", razorpaySubID)
		return nil
	}

	now := time.Now()
	sub.Status = models.SubscriptionStatusActive
	sub.UpdatedAt = now

	if err := s.repo.UpdateSubscription(ctx, sub); err != nil {
		return fmt.Errorf("failed to update subscription: %w", err)
	}

	s.logger.Info("subscription resumed via webhook",
		"razorpay_sub_id", razorpaySubID,
		"user_id", sub.UserID,
	)

	return nil
}

func (s *WebhookService) handleSubscriptionPending(ctx context.Context, event models.RazorpayWebhookEvent) error {
	subData, ok := event.Payload["subscription"].(map[string]interface{})
	if !ok {
		return fmt.Errorf("invalid subscription payload")
	}

	entityData, ok := subData["entity"].(map[string]interface{})
	if !ok {
		return fmt.Errorf("invalid subscription entity")
	}

	razorpaySubID, _ := entityData["id"].(string)

	sub, err := s.repo.GetSubscriptionByRazorpayID(ctx, razorpaySubID)
	if err != nil {
		s.logger.Warn("subscription not found for pending", "razorpay_sub_id", razorpaySubID)
		return nil
	}

	now := time.Now()
	sub.Status = models.SubscriptionStatusPastDue
	sub.UpdatedAt = now

	if err := s.repo.UpdateSubscription(ctx, sub); err != nil {
		return fmt.Errorf("failed to update subscription: %w", err)
	}

	s.logger.Info("subscription pending (past due) via webhook",
		"razorpay_sub_id", razorpaySubID,
		"user_id", sub.UserID,
	)

	return nil
}

func (s *WebhookService) handleSubscriptionHalted(ctx context.Context, event models.RazorpayWebhookEvent) error {
	subData, ok := event.Payload["subscription"].(map[string]interface{})
	if !ok {
		return fmt.Errorf("invalid subscription payload")
	}

	entityData, ok := subData["entity"].(map[string]interface{})
	if !ok {
		return fmt.Errorf("invalid subscription entity")
	}

	razorpaySubID, _ := entityData["id"].(string)

	sub, err := s.repo.GetSubscriptionByRazorpayID(ctx, razorpaySubID)
	if err != nil {
		s.logger.Warn("subscription not found for halt", "razorpay_sub_id", razorpaySubID)
		return nil
	}

	now := time.Now()
	sub.Status = models.SubscriptionStatusExpired
	sub.UpdatedAt = now

	if err := s.repo.UpdateSubscription(ctx, sub); err != nil {
		return fmt.Errorf("failed to update subscription: %w", err)
	}

	s.logger.Info("subscription halted (expired) via webhook",
		"razorpay_sub_id", razorpaySubID,
		"user_id", sub.UserID,
	)

	return nil
}

func (s *WebhookService) handleRefundCreated(ctx context.Context, event models.RazorpayWebhookEvent) error {
	refundData, ok := event.Payload["refund"].(map[string]interface{})
	if !ok {
		return fmt.Errorf("invalid refund payload")
	}

	entityData, ok := refundData["entity"].(map[string]interface{})
	if !ok {
		return fmt.Errorf("invalid refund entity")
	}

	refundID, _ := entityData["id"].(string)
	paymentID, _ := entityData["payment_id"].(string)
	amount := int(entityData["amount"].(float64))

	payment, err := s.repo.GetPaymentByRazorpayID(ctx, paymentID)
	if err != nil {
		s.logger.Warn("payment not found for refund", "payment_id", paymentID)
		return nil
	}

	now := time.Now()
	payment.RefundAmount = amount
	refundStatus := "refunded"
	payment.RefundStatus = &refundStatus
	payment.RefundedAt = &now
	payment.UpdatedAt = now

	if amount >= payment.Amount {
		payment.Status = models.PaymentStatusRefunded
	} else {
		payment.Status = models.PaymentStatusPartiallyRefunded
	}

	if err := s.repo.UpdatePayment(ctx, payment); err != nil {
		return fmt.Errorf("failed to update payment: %w", err)
	}

	// If fully refunded, consider revoking subscription access
	if payment.Status == models.PaymentStatusRefunded && payment.SubscriptionID != nil {
		sub, err := s.repo.GetSubscriptionByID(ctx, *payment.SubscriptionID)
		if err == nil && sub != nil {
			sub.Status = models.SubscriptionStatusCancelled
			sub.CancelledAt = &now
			reason := "refunded"
			sub.CancellationReason = &reason
			sub.UpdatedAt = now
			_ = s.repo.UpdateSubscription(ctx, sub)
		}
	}

	s.logger.Info("refund processed via webhook",
		"refund_id", refundID,
		"payment_id", paymentID,
		"amount", amount,
	)

	return nil
}
