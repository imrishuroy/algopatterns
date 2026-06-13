package services

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/imrishuroy/algopatterns/internal/models"
	"github.com/imrishuroy/algopatterns/internal/razorpay"
	"github.com/imrishuroy/algopatterns/internal/repository"
)

var (
	ErrPlanNotFound          = errors.New("plan not found")
	ErrPlanNotActive         = errors.New("plan is not active")
	ErrInvalidDiscountCode   = errors.New("invalid discount code")
	ErrDiscountNotApplicable = errors.New("discount code not applicable to this plan")
	ErrOrderNotFound         = errors.New("order not found")
	ErrOrderExpired          = errors.New("order has expired")
	ErrOrderAlreadyPaid      = errors.New("order has already been paid")
	ErrPaymentVerification   = errors.New("payment verification failed")
	ErrSubscriptionNotFound  = errors.New("subscription not found")
	ErrAlreadySubscribed     = errors.New("user already has an active subscription")
	ErrIdempotencyConflict   = errors.New("idempotency key conflict")
)

type PaymentService struct {
	repo          *repository.PaymentRepository
	userRepo      *repository.UserRepository
	emailService  *EmailService
	razorpay      *razorpay.Client
	razorpayKeyID string
	gstRate       float64
}

func NewPaymentService(repo *repository.PaymentRepository, userRepo *repository.UserRepository, emailService *EmailService, rzpClient *razorpay.Client, keyID string, gstRate float64) *PaymentService {
	return &PaymentService{
		repo:          repo,
		userRepo:      userRepo,
		emailService:  emailService,
		razorpay:      rzpClient,
		razorpayKeyID: keyID,
		gstRate:       gstRate,
	}
}

func (s *PaymentService) GetPlans(ctx context.Context, currency string) ([]models.PlanResponse, error) {
	plans, err := s.repo.GetAllPlans(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get plans: %w", err)
	}

	var responses []models.PlanResponse
	for _, plan := range plans {
		responses = append(responses, plan.ToPlanResponse(currency))
	}

	return responses, nil
}

func (s *PaymentService) GetSubscription(ctx context.Context, userID string) (*models.SubscriptionResponse, error) {
	sub, err := s.repo.GetActiveSubscriptionByUserID(ctx, userID)
	if err != nil {
		if errors.Is(err, repository.ErrSubscriptionNotFound) {
			return s.getFreeTierResponse(), nil
		}
		return nil, fmt.Errorf("failed to get subscription: %w", err)
	}

	plan, err := s.repo.GetPlanByID(ctx, sub.PlanID)
	if err != nil {
		return nil, fmt.Errorf("failed to get plan: %w", err)
	}

	resp := sub.ToResponse(plan.Features)
	return &resp, nil
}

func (s *PaymentService) getFreeTierResponse() *models.SubscriptionResponse {
	return &models.SubscriptionResponse{
		PlanID: "free",
		Status: "active",
		Features: models.PlanFeatures{
			MaxPatterns:             3,
			MaxVisualizers:          2,
			QuizQuestionsPerPattern: 3,
			HasQuizHistory:          false,
			HasCodePlayground:       false,
			HasProgressSync:         false,
			HasHighlighting:         false,
			HasSolutionsAccess:      false,
			HasOfflineExport:        false,
		},
	}
}

func (s *PaymentService) CreateOrder(ctx context.Context, userID, planID, discountCode, idempotencyKey, requestPath string, requestBody []byte) (*models.CreateOrderResponse, error) {
	requestHash := s.hashRequest(requestBody)

	if idempotencyKey != "" {
		existing, err := s.repo.GetIdempotencyKey(ctx, idempotencyKey)
		if err != nil {
			return nil, fmt.Errorf("failed to check idempotency: %w", err)
		}
		if existing != nil {
			if existing.UserID != userID || existing.RequestHash != requestHash {
				return nil, ErrIdempotencyConflict
			}
			if existing.Status == models.IdempotencyStatusCompleted && existing.ResponseBody != nil {
				var resp models.CreateOrderResponse
				if err := json.Unmarshal(existing.ResponseBody, &resp); err == nil {
					return &resp, nil
				}
			}
			if existing.Status == models.IdempotencyStatusFailed {
				return nil, errors.New("previous request failed")
			}
		} else {
			idempKey := &models.IdempotencyKey{
				Key:         idempotencyKey,
				UserID:      userID,
				RequestPath: requestPath,
				RequestHash: requestHash,
				Status:      models.IdempotencyStatusPending,
				ExpiresAt:   time.Now().Add(24 * time.Hour),
			}
			if err := s.repo.CreateIdempotencyKey(ctx, idempKey); err != nil {
				return nil, fmt.Errorf("failed to create idempotency key: %w", err)
			}
		}
	}

	resp, err := s.createOrderInternal(ctx, userID, planID, discountCode)
	if err != nil {
		if idempotencyKey != "" {
			_ = s.repo.FailIdempotencyKey(ctx, idempotencyKey)
		}
		return nil, err
	}

	if idempotencyKey != "" {
		respBody, _ := json.Marshal(resp)
		_ = s.repo.CompleteIdempotencyKey(ctx, idempotencyKey, 200, respBody)
	}

	return resp, nil
}

func (s *PaymentService) createOrderInternal(ctx context.Context, userID, planID, discountCode string) (*models.CreateOrderResponse, error) {
	plan, err := s.repo.GetPlanByID(ctx, planID)
	if err != nil {
		if errors.Is(err, repository.ErrPlanNotFound) {
			return nil, ErrPlanNotFound
		}
		return nil, fmt.Errorf("failed to get plan: %w", err)
	}
	if !plan.IsActive {
		return nil, ErrPlanNotActive
	}

	existingSub, err := s.repo.GetActiveSubscriptionByUserID(ctx, userID)
	if err != nil && !errors.Is(err, repository.ErrSubscriptionNotFound) {
		return nil, fmt.Errorf("failed to check existing subscription: %w", err)
	}
	if existingSub != nil && existingSub.PlanID != "free" {
		return nil, ErrAlreadySubscribed
	}

	subtotal := plan.AmountINR
	var discountAmount int
	var discountCodeID *string
	var appliedDiscountCode string

	if discountCode != "" {
		discount, err := s.repo.GetDiscountCodeByCode(ctx, discountCode)
		if err != nil {
			if errors.Is(err, repository.ErrDiscountCodeNotFound) {
				return nil, ErrInvalidDiscountCode
			}
			return nil, fmt.Errorf("failed to validate discount: %w", err)
		}

		userUses, err := s.repo.GetUserDiscountCodeUses(ctx, userID, discount.ID)
		if err != nil {
			return nil, fmt.Errorf("failed to check discount usage: %w", err)
		}

		if !discount.IsValid(planID, userUses) {
			return nil, ErrInvalidDiscountCode
		}

		discountAmount = discount.CalculateDiscount(subtotal)
		discountCodeID = &discount.ID
		appliedDiscountCode = discount.Code
	}

	afterDiscount := subtotal - discountAmount
	gstAmount := int(float64(afterDiscount) * s.gstRate / 100)
	totalAmount := afterDiscount + gstAmount

	orderID := uuid.New().String()
	razorpayOrder, err := s.razorpay.CreateOrder(razorpay.OrderRequest{
		Amount:         totalAmount,
		Currency:       "INR",
		Receipt:        orderID,
		PartialPayment: false,
		Notes: map[string]string{
			"user_id": userID,
			"plan_id": planID,
		},
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create razorpay order: %w", err)
	}

	order := &models.PaymentOrder{
		ID:              orderID,
		UserID:          userID,
		PlanID:          planID,
		Subtotal:        subtotal,
		DiscountCodeID:  discountCodeID,
		DiscountAmount:  discountAmount,
		GSTAmount:       gstAmount,
		TotalAmount:     totalAmount,
		Currency:        "INR",
		RazorpayOrderID: &razorpayOrder.ID,
		Status:          models.OrderStatusCreated,
		ExpiresAt:       time.Now().Add(30 * time.Minute),
		Metadata:        models.Metadata{},
	}

	if err := s.repo.CreateOrder(ctx, order); err != nil {
		return nil, fmt.Errorf("failed to save order: %w", err)
	}

	return &models.CreateOrderResponse{
		OrderID:         orderID,
		RazorpayOrderID: razorpayOrder.ID,
		RazorpayKeyID:   s.razorpayKeyID,
		Plan: models.PlanSummary{
			ID:            plan.ID,
			Name:          plan.Name,
			BillingPeriod: string(plan.BillingPeriod),
		},
		Pricing: models.PricingBreakdown{
			Subtotal:       subtotal,
			DiscountCode:   appliedDiscountCode,
			DiscountAmount: discountAmount,
			GSTRate:        s.gstRate,
			GSTAmount:      gstAmount,
			Total:          totalAmount,
			Currency:       "INR",
		},
	}, nil
}

func (s *PaymentService) VerifyPayment(ctx context.Context, userID, razorpayPaymentID, razorpayOrderID, signature string) (*models.VerifyPaymentResponse, error) {
	if !s.razorpay.VerifyPaymentSignature(razorpayOrderID, razorpayPaymentID, signature) {
		return nil, ErrPaymentVerification
	}

	order, err := s.repo.GetOrderByRazorpayID(ctx, razorpayOrderID)
	if err != nil {
		if errors.Is(err, repository.ErrOrderNotFound) {
			return nil, ErrOrderNotFound
		}
		return nil, fmt.Errorf("failed to get order: %w", err)
	}
	if order.UserID != userID {
		return nil, ErrOrderNotFound
	}
	if order.Status == models.OrderStatusPaid {
		return nil, ErrOrderAlreadyPaid
	}
	if time.Now().After(order.ExpiresAt) {
		return nil, ErrOrderExpired
	}

	paymentDetails, err := s.razorpay.FetchPayment(razorpayPaymentID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch payment details: %w", err)
	}

	payment := &models.Payment{
		ID:                uuid.New().String(),
		UserID:            userID,
		OrderID:           &order.ID,
		RazorpayPaymentID: razorpayPaymentID,
		RazorpayOrderID:   &razorpayOrderID,
		RazorpaySignature: &signature,
		Amount:            order.TotalAmount,
		Currency:          order.Currency,
		Method:            &paymentDetails.Method,
		Status:            models.PaymentStatusCaptured,
	}

	if paymentDetails.CapturedAt > 0 {
		capturedAt := time.Unix(paymentDetails.CapturedAt, 0)
		payment.CapturedAt = &capturedAt
	}

	if err := s.repo.CreatePayment(ctx, payment); err != nil {
		return nil, fmt.Errorf("failed to save payment: %w", err)
	}

	if err := s.repo.UpdateOrderStatus(ctx, order.ID, models.OrderStatusPaid); err != nil {
		return nil, fmt.Errorf("failed to update order status: %w", err)
	}

	if order.DiscountCodeID != nil {
		_ = s.repo.RecordDiscountCodeUse(ctx, *order.DiscountCodeID, userID, order.ID, order.DiscountAmount)
	}

	plan, err := s.repo.GetPlanByID(ctx, order.PlanID)
	if err != nil {
		return nil, fmt.Errorf("failed to get plan: %w", err)
	}

	subscription, err := s.createOrUpdateSubscription(ctx, userID, order.PlanID, plan.BillingPeriod)
	if err != nil {
		return nil, fmt.Errorf("failed to create subscription: %w", err)
	}

	// Send emails asynchronously
	go s.sendPaymentEmails(context.Background(), userID, payment, plan)

	return &models.VerifyPaymentResponse{
		PaymentID:    payment.ID,
		Subscription: subscription.ToResponse(plan.Features),
	}, nil
}

func (s *PaymentService) sendPaymentEmails(ctx context.Context, userID string, payment *models.Payment, plan *models.SubscriptionPlan) {
	if s.emailService == nil || s.userRepo == nil {
		return
	}

	userUUID, err := uuid.Parse(userID)
	if err != nil {
		return
	}

	user, err := s.userRepo.GetByID(ctx, userUUID)
	if err != nil {
		return
	}

	name := "there"
	if user.Name != nil && *user.Name != "" {
		name = *user.Name
	}

	_ = s.emailService.SendWelcomeEmail(ctx, user.Email, name, plan.Name)
	_ = s.emailService.SendReceiptEmail(ctx, user.Email, name, payment, plan)
}

func (s *PaymentService) createOrUpdateSubscription(ctx context.Context, userID, planID string, billingPeriod models.BillingPeriod) (*models.Subscription, error) {
	existing, err := s.repo.GetActiveSubscriptionByUserID(ctx, userID)
	if err != nil && !errors.Is(err, repository.ErrSubscriptionNotFound) {
		return nil, err
	}

	now := time.Now()
	var periodEnd *time.Time

	switch billingPeriod {
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
		existing.PlanID = planID
		existing.Status = models.SubscriptionStatusActive
		existing.CurrentPeriodStart = &now
		existing.CurrentPeriodEnd = periodEnd
		existing.CancelAtPeriodEnd = false
		existing.UpdatedAt = now

		if err := s.repo.UpdateSubscription(ctx, existing); err != nil {
			return nil, err
		}
		return existing, nil
	}

	subscription := &models.Subscription{
		ID:                 uuid.New().String(),
		UserID:             userID,
		PlanID:             planID,
		Status:             models.SubscriptionStatusActive,
		CurrentPeriodStart: &now,
		CurrentPeriodEnd:   periodEnd,
		CancelAtPeriodEnd:  false,
		CreatedAt:          now,
		UpdatedAt:          now,
	}

	if err := s.repo.CreateSubscription(ctx, subscription); err != nil {
		return nil, err
	}

	return subscription, nil
}

func (s *PaymentService) ValidateDiscount(ctx context.Context, userID, code, planID string) (*models.ValidateDiscountResponse, error) {
	plan, err := s.repo.GetPlanByID(ctx, planID)
	if err != nil {
		if errors.Is(err, repository.ErrPlanNotFound) {
			return nil, ErrPlanNotFound
		}
		return nil, fmt.Errorf("failed to get plan: %w", err)
	}

	discount, err := s.repo.GetDiscountCodeByCode(ctx, code)
	if err != nil {
		if errors.Is(err, repository.ErrDiscountCodeNotFound) {
			return nil, ErrInvalidDiscountCode
		}
		return nil, fmt.Errorf("failed to get discount: %w", err)
	}

	userUses, err := s.repo.GetUserDiscountCodeUses(ctx, userID, discount.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to check usage: %w", err)
	}

	if !discount.IsValid(planID, userUses) {
		return nil, ErrInvalidDiscountCode
	}

	discountAmount := discount.CalculateDiscount(plan.AmountINR)

	return &models.ValidateDiscountResponse{
		Code:           discount.Code,
		DiscountType:   string(discount.DiscountType),
		DiscountValue:  discount.DiscountValue,
		DiscountAmount: discountAmount,
		Message:        fmt.Sprintf("Discount of ₹%d will be applied", discountAmount/100),
	}, nil
}

func (s *PaymentService) CancelSubscription(ctx context.Context, userID, reason, feedback string) (*models.CancelSubscriptionResponse, error) {
	sub, err := s.repo.GetActiveSubscriptionByUserID(ctx, userID)
	if err != nil {
		if errors.Is(err, repository.ErrSubscriptionNotFound) {
			return nil, ErrSubscriptionNotFound
		}
		return nil, fmt.Errorf("failed to get subscription: %w", err)
	}

	now := time.Now()
	sub.CancelAtPeriodEnd = true
	sub.CancelledAt = &now
	if reason != "" {
		sub.CancellationReason = &reason
	}
	sub.UpdatedAt = now

	if err := s.repo.UpdateSubscription(ctx, sub); err != nil {
		return nil, fmt.Errorf("failed to update subscription: %w", err)
	}

	return &models.CancelSubscriptionResponse{
		ID:                sub.ID,
		Status:            string(sub.Status),
		CancelAtPeriodEnd: true,
		CurrentPeriodEnd:  sub.CurrentPeriodEnd,
	}, nil
}

func (s *PaymentService) hashRequest(body []byte) string {
	hash := sha256.Sum256(body)
	return hex.EncodeToString(hash[:])
}

// CreateRecurringSubscription creates a Razorpay subscription for recurring billing (monthly/yearly)
func (s *PaymentService) CreateRecurringSubscription(ctx context.Context, userID, planID, idempotencyKey, requestPath string, requestBody []byte) (*models.CreateSubscriptionResponse, error) {
	requestHash := s.hashRequest(requestBody)

	if idempotencyKey != "" {
		existing, err := s.repo.GetIdempotencyKey(ctx, idempotencyKey)
		if err != nil {
			return nil, fmt.Errorf("failed to check idempotency: %w", err)
		}
		if existing != nil {
			if existing.UserID != userID || existing.RequestHash != requestHash {
				return nil, ErrIdempotencyConflict
			}
			if existing.Status == models.IdempotencyStatusCompleted && existing.ResponseBody != nil {
				var resp models.CreateSubscriptionResponse
				if err := json.Unmarshal(existing.ResponseBody, &resp); err == nil {
					return &resp, nil
				}
			}
			if existing.Status == models.IdempotencyStatusFailed {
				return nil, errors.New("previous request failed")
			}
		} else {
			idempKey := &models.IdempotencyKey{
				Key:         idempotencyKey,
				UserID:      userID,
				RequestPath: requestPath,
				RequestHash: requestHash,
				Status:      models.IdempotencyStatusPending,
				ExpiresAt:   time.Now().Add(24 * time.Hour),
			}
			if err := s.repo.CreateIdempotencyKey(ctx, idempKey); err != nil {
				return nil, fmt.Errorf("failed to create idempotency key: %w", err)
			}
		}
	}

	resp, err := s.createRecurringSubscriptionInternal(ctx, userID, planID)
	if err != nil {
		if idempotencyKey != "" {
			_ = s.repo.FailIdempotencyKey(ctx, idempotencyKey)
		}
		return nil, err
	}

	if idempotencyKey != "" {
		respBody, _ := json.Marshal(resp)
		_ = s.repo.CompleteIdempotencyKey(ctx, idempotencyKey, 200, respBody)
	}

	return resp, nil
}

func (s *PaymentService) createRecurringSubscriptionInternal(ctx context.Context, userID, planID string) (*models.CreateSubscriptionResponse, error) {
	plan, err := s.repo.GetPlanByID(ctx, planID)
	if err != nil {
		if errors.Is(err, repository.ErrPlanNotFound) {
			return nil, ErrPlanNotFound
		}
		return nil, fmt.Errorf("failed to get plan: %w", err)
	}
	if !plan.IsActive {
		return nil, ErrPlanNotActive
	}

	// Recurring subscriptions require a razorpay_plan_id
	if plan.RazorpayPlanID == nil || *plan.RazorpayPlanID == "" {
		return nil, fmt.Errorf("plan %s does not support recurring billing", planID)
	}

	existingSub, err := s.repo.GetActiveSubscriptionByUserID(ctx, userID)
	if err != nil && !errors.Is(err, repository.ErrSubscriptionNotFound) {
		return nil, fmt.Errorf("failed to check existing subscription: %w", err)
	}
	if existingSub != nil && existingSub.PlanID != "free" {
		return nil, ErrAlreadySubscribed
	}

	// Create Razorpay subscription
	rzpSub, err := s.razorpay.CreateSubscription(razorpay.SubscriptionRequest{
		PlanID:         *plan.RazorpayPlanID,
		TotalCount:     12, // Auto-renew for up to 12 cycles
		CustomerNotify: 1,
		Notes: map[string]string{
			"user_id": userID,
			"plan_id": planID,
		},
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create razorpay subscription: %w", err)
	}

	// Create local subscription record
	now := time.Now()
	subscription := &models.Subscription{
		ID:                     uuid.New().String(),
		UserID:                 userID,
		PlanID:                 planID,
		Status:                 models.SubscriptionStatusPending,
		RazorpaySubscriptionID: &rzpSub.ID,
		CancelAtPeriodEnd:      false,
		CreatedAt:              now,
		UpdatedAt:              now,
	}

	if err := s.repo.CreateSubscription(ctx, subscription); err != nil {
		return nil, fmt.Errorf("failed to save subscription: %w", err)
	}

	return &models.CreateSubscriptionResponse{
		SubscriptionID:         subscription.ID,
		RazorpaySubscriptionID: rzpSub.ID,
		RazorpayKeyID:          s.razorpayKeyID,
		Plan: models.PlanSummary{
			ID:            plan.ID,
			Name:          plan.Name,
			BillingPeriod: string(plan.BillingPeriod),
		},
		Amount:   plan.AmountINR,
		Currency: "INR",
	}, nil
}

// VerifyRecurringSubscription verifies a recurring subscription payment
func (s *PaymentService) VerifyRecurringSubscription(ctx context.Context, userID, razorpayPaymentID, razorpaySubscriptionID, signature string) (*models.VerifyPaymentResponse, error) {
	if !s.razorpay.VerifySubscriptionSignature(razorpaySubscriptionID, razorpayPaymentID, signature) {
		return nil, ErrPaymentVerification
	}

	sub, err := s.repo.GetSubscriptionByRazorpayID(ctx, razorpaySubscriptionID)
	if err != nil {
		return nil, fmt.Errorf("subscription not found: %w", err)
	}
	if sub.UserID != userID {
		return nil, ErrSubscriptionNotFound
	}

	// Fetch subscription details from Razorpay
	rzpSub, err := s.razorpay.FetchSubscription(razorpaySubscriptionID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch subscription: %w", err)
	}

	// Update subscription with period dates
	now := time.Now()
	sub.Status = models.SubscriptionStatusActive
	if rzpSub.CurrentStart > 0 {
		start := time.Unix(rzpSub.CurrentStart, 0)
		sub.CurrentPeriodStart = &start
	}
	if rzpSub.CurrentEnd > 0 {
		end := time.Unix(rzpSub.CurrentEnd, 0)
		sub.CurrentPeriodEnd = &end
	}
	sub.UpdatedAt = now

	if err := s.repo.UpdateSubscription(ctx, sub); err != nil {
		return nil, fmt.Errorf("failed to update subscription: %w", err)
	}

	// Record the payment
	payment := &models.Payment{
		ID:                uuid.New().String(),
		UserID:            userID,
		SubscriptionID:    &sub.ID,
		RazorpayPaymentID: razorpayPaymentID,
		RazorpaySignature: &signature,
		Amount:            rzpSub.Quantity,
		Currency:          "INR",
		Status:            models.PaymentStatusCaptured,
		CapturedAt:        &now,
	}

	if err := s.repo.CreatePayment(ctx, payment); err != nil {
		return nil, fmt.Errorf("failed to save payment: %w", err)
	}

	plan, err := s.repo.GetPlanByID(ctx, sub.PlanID)
	if err != nil {
		return nil, fmt.Errorf("failed to get plan: %w", err)
	}

	// Send emails asynchronously
	go s.sendPaymentEmails(context.Background(), userID, payment, plan)

	return &models.VerifyPaymentResponse{
		PaymentID:    payment.ID,
		Subscription: sub.ToResponse(plan.Features),
	}, nil
}
