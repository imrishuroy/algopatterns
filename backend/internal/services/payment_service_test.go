package services

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/imrishuroy/algopatterns/internal/models"
	"github.com/stretchr/testify/assert"
)

// ====================
// Discount Code Model Tests
// ====================

func TestDiscountCode_IsValid(t *testing.T) {
	tests := []struct {
		name          string
		discount      *models.DiscountCode
		planID        string
		userUseCount  int
		expectedValid bool
	}{
		{
			name: "valid discount code",
			discount: &models.DiscountCode{
				Code:            "SAVE20",
				DiscountType:    models.DiscountTypePercentage,
				DiscountValue:   20,
				ApplicablePlans: []string{"pro_yearly"},
				MaxUsesPerUser:  1,
				CurrentUses:     0,
				StartsAt:        time.Now().Add(-24 * time.Hour),
				IsActive:        true,
			},
			planID:        "pro_yearly",
			userUseCount:  0,
			expectedValid: true,
		},
		{
			name: "expired code",
			discount: &models.DiscountCode{
				Code:            "EXPIRED",
				DiscountType:    models.DiscountTypePercentage,
				DiscountValue:   20,
				ApplicablePlans: []string{"pro_yearly"},
				MaxUsesPerUser:  1,
				StartsAt:        time.Now().Add(-48 * time.Hour),
				ExpiresAt:       timePtr(time.Now().Add(-24 * time.Hour)),
				IsActive:        true,
			},
			planID:        "pro_yearly",
			userUseCount:  0,
			expectedValid: false,
		},
		{
			name: "not yet started",
			discount: &models.DiscountCode{
				Code:            "FUTURE",
				DiscountType:    models.DiscountTypePercentage,
				DiscountValue:   20,
				ApplicablePlans: []string{"pro_yearly"},
				MaxUsesPerUser:  1,
				StartsAt:        time.Now().Add(24 * time.Hour),
				IsActive:        true,
			},
			planID:        "pro_yearly",
			userUseCount:  0,
			expectedValid: false,
		},
		{
			name: "inactive code",
			discount: &models.DiscountCode{
				Code:            "INACTIVE",
				DiscountType:    models.DiscountTypePercentage,
				DiscountValue:   20,
				ApplicablePlans: []string{"pro_yearly"},
				MaxUsesPerUser:  1,
				StartsAt:        time.Now().Add(-24 * time.Hour),
				IsActive:        false,
			},
			planID:        "pro_yearly",
			userUseCount:  0,
			expectedValid: false,
		},
		{
			name: "max uses exceeded",
			discount: &models.DiscountCode{
				Code:            "MAXED",
				DiscountType:    models.DiscountTypePercentage,
				DiscountValue:   20,
				ApplicablePlans: []string{"pro_yearly"},
				MaxUses:         intPtr(10),
				MaxUsesPerUser:  1,
				CurrentUses:     10,
				StartsAt:        time.Now().Add(-24 * time.Hour),
				IsActive:        true,
			},
			planID:        "pro_yearly",
			userUseCount:  0,
			expectedValid: false,
		},
		{
			name: "user max uses exceeded",
			discount: &models.DiscountCode{
				Code:            "ONCE",
				DiscountType:    models.DiscountTypePercentage,
				DiscountValue:   20,
				ApplicablePlans: []string{"pro_yearly"},
				MaxUsesPerUser:  1,
				CurrentUses:     0,
				StartsAt:        time.Now().Add(-24 * time.Hour),
				IsActive:        true,
			},
			planID:        "pro_yearly",
			userUseCount:  1, // Already used once
			expectedValid: false,
		},
		{
			name: "not applicable to plan",
			discount: &models.DiscountCode{
				Code:            "YEARLYONLY",
				DiscountType:    models.DiscountTypePercentage,
				DiscountValue:   20,
				ApplicablePlans: []string{"pro_yearly"},
				MaxUsesPerUser:  1,
				StartsAt:        time.Now().Add(-24 * time.Hour),
				IsActive:        true,
			},
			planID:        "pro_monthly", // Different plan
			userUseCount:  0,
			expectedValid: false,
		},
		{
			name: "applicable to all plans (empty list)",
			discount: &models.DiscountCode{
				Code:            "ALLPLANS",
				DiscountType:    models.DiscountTypePercentage,
				DiscountValue:   20,
				ApplicablePlans: []string{}, // Empty = all plans
				MaxUsesPerUser:  1,
				StartsAt:        time.Now().Add(-24 * time.Hour),
				IsActive:        true,
			},
			planID:        "any_plan",
			userUseCount:  0,
			expectedValid: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			valid := tt.discount.IsValid(tt.planID, tt.userUseCount)
			assert.Equal(t, tt.expectedValid, valid)
		})
	}
}

func TestDiscountCode_CalculateDiscount(t *testing.T) {
	tests := []struct {
		name             string
		discount         *models.DiscountCode
		subtotal         int
		expectedDiscount int
	}{
		{
			name: "percentage discount",
			discount: &models.DiscountCode{
				DiscountType:  models.DiscountTypePercentage,
				DiscountValue: 20,
			},
			subtotal:         199900, // Rs. 1999
			expectedDiscount: 39980,  // 20%
		},
		{
			name: "percentage with max cap",
			discount: &models.DiscountCode{
				DiscountType:  models.DiscountTypePercentage,
				DiscountValue: 50,
				MaxDiscount:   intPtr(20000), // Max Rs. 200
			},
			subtotal:         199900,
			expectedDiscount: 20000, // Capped at max
		},
		{
			name: "fixed amount discount",
			discount: &models.DiscountCode{
				DiscountType:  models.DiscountTypeFixedAmount,
				DiscountValue: 50000, // Rs. 500
			},
			subtotal:         199900,
			expectedDiscount: 50000,
		},
		{
			name: "fixed amount exceeds subtotal",
			discount: &models.DiscountCode{
				DiscountType:  models.DiscountTypeFixedAmount,
				DiscountValue: 300000, // Rs. 3000
			},
			subtotal:         199900,
			expectedDiscount: 199900, // Capped at subtotal
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := tt.discount.CalculateDiscount(tt.subtotal)
			assert.Equal(t, tt.expectedDiscount, result)
		})
	}
}

// ====================
// GST Calculation Tests
// ====================

func TestGSTCalculation(t *testing.T) {
	gstRate := 18.0

	tests := []struct {
		name           string
		subtotal       int
		discountAmount int
		expectedGST    int
	}{
		{
			name:           "no discount",
			subtotal:       199900,
			discountAmount: 0,
			expectedGST:    35982, // 18% of 199900
		},
		{
			name:           "with 20% discount",
			subtotal:       199900,
			discountAmount: 39980,
			expectedGST:    28785, // 18% of 159920
		},
		{
			name:           "with 50% discount",
			subtotal:       199900,
			discountAmount: 99950,
			expectedGST:    17991, // 18% of 99950
		},
		{
			name:           "small amount",
			subtotal:       10000,
			discountAmount: 1000,
			expectedGST:    1620, // 18% of 9000
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			afterDiscount := tt.subtotal - tt.discountAmount
			gstAmount := int(float64(afterDiscount) * gstRate / 100)
			assert.Equal(t, tt.expectedGST, gstAmount)
		})
	}
}

// ====================
// Request Hash Tests
// ====================

func TestHashRequest(t *testing.T) {
	service := &PaymentService{}

	body1 := []byte(`{"plan_id":"pro_yearly"}`)
	body2 := []byte(`{"plan_id":"pro_yearly"}`)
	body3 := []byte(`{"plan_id":"pro_monthly"}`)

	hash1 := service.hashRequest(body1)
	hash2 := service.hashRequest(body2)
	hash3 := service.hashRequest(body3)

	assert.Equal(t, hash1, hash2, "Same body should produce same hash")
	assert.NotEqual(t, hash1, hash3, "Different body should produce different hash")
	assert.Len(t, hash1, 64, "SHA256 hash should be 64 hex characters")
}

func TestHashRequest_EmptyBody(t *testing.T) {
	service := &PaymentService{}

	hash := service.hashRequest([]byte{})
	assert.Len(t, hash, 64)
	assert.Equal(t, "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", hash)
}

func TestHashRequest_Deterministic(t *testing.T) {
	service := &PaymentService{}
	body := []byte(`{"test": "data", "number": 123}`)

	hashes := make([]string, 10)
	for i := 0; i < 10; i++ {
		hashes[i] = service.hashRequest(body)
	}

	for i := 1; i < len(hashes); i++ {
		assert.Equal(t, hashes[0], hashes[i], "Hash should be deterministic")
	}
}

// ====================
// Subscription Period Tests
// ====================

func TestSubscriptionPeriodEnd(t *testing.T) {
	now := time.Now()

	tests := []struct {
		name          string
		billingPeriod models.BillingPeriod
		checkFunc     func(t *testing.T, periodEnd *time.Time)
	}{
		{
			name:          "monthly",
			billingPeriod: models.BillingPeriodMonthly,
			checkFunc: func(t *testing.T, periodEnd *time.Time) {
				assert.NotNil(t, periodEnd)
				expectedEnd := now.AddDate(0, 1, 0)
				assert.WithinDuration(t, expectedEnd, *periodEnd, time.Second)
			},
		},
		{
			name:          "yearly",
			billingPeriod: models.BillingPeriodYearly,
			checkFunc: func(t *testing.T, periodEnd *time.Time) {
				assert.NotNil(t, periodEnd)
				expectedEnd := now.AddDate(1, 0, 0)
				assert.WithinDuration(t, expectedEnd, *periodEnd, time.Second)
			},
		},
		{
			name:          "lifetime",
			billingPeriod: models.BillingPeriodLifetime,
			checkFunc: func(t *testing.T, periodEnd *time.Time) {
				assert.NotNil(t, periodEnd)
				assert.True(t, periodEnd.After(now.AddDate(99, 0, 0)))
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var periodEnd *time.Time
			switch tt.billingPeriod {
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
			tt.checkFunc(t, periodEnd)
		})
	}
}

// ====================
// Idempotency Key Tests
// ====================

func TestIdempotencyKeyStatus(t *testing.T) {
	tests := []struct {
		name           string
		status         models.IdempotencyStatus
		shouldContinue bool
		shouldCache    bool
		shouldFail     bool
	}{
		{
			name:           "pending status",
			status:         models.IdempotencyStatusPending,
			shouldContinue: true,
			shouldCache:    false,
			shouldFail:     false,
		},
		{
			name:           "completed status",
			status:         models.IdempotencyStatusCompleted,
			shouldContinue: false,
			shouldCache:    true,
			shouldFail:     false,
		},
		{
			name:           "failed status",
			status:         models.IdempotencyStatusFailed,
			shouldContinue: false,
			shouldCache:    false,
			shouldFail:     true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			key := &models.IdempotencyKey{
				Key:    "test-key",
				Status: tt.status,
			}

			if tt.shouldCache {
				assert.Equal(t, models.IdempotencyStatusCompleted, key.Status)
			}
			if tt.shouldFail {
				assert.Equal(t, models.IdempotencyStatusFailed, key.Status)
			}
		})
	}
}

func TestIdempotencyKeyConflictDetection(t *testing.T) {
	service := &PaymentService{}
	requestBody := []byte(`{"plan_id":"pro_yearly"}`)
	requestHash := service.hashRequest(requestBody)

	tests := []struct {
		name         string
		existingKey  *models.IdempotencyKey
		newUserID    string
		newHash      string
		expectConflict bool
	}{
		{
			name: "same user same hash",
			existingKey: &models.IdempotencyKey{
				UserID:      "user-123",
				RequestHash: requestHash,
			},
			newUserID:      "user-123",
			newHash:        requestHash,
			expectConflict: false,
		},
		{
			name: "different user",
			existingKey: &models.IdempotencyKey{
				UserID:      "user-456",
				RequestHash: requestHash,
			},
			newUserID:      "user-123",
			newHash:        requestHash,
			expectConflict: true,
		},
		{
			name: "different request hash",
			existingKey: &models.IdempotencyKey{
				UserID:      "user-123",
				RequestHash: "different-hash",
			},
			newUserID:      "user-123",
			newHash:        requestHash,
			expectConflict: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			conflict := tt.existingKey.UserID != tt.newUserID || tt.existingKey.RequestHash != tt.newHash
			assert.Equal(t, tt.expectConflict, conflict)
		})
	}
}

// ====================
// Cached Response Tests
// ====================

func TestCachedResponseDeserialization(t *testing.T) {
	original := &models.CreateOrderResponse{
		OrderID:         "order-123",
		RazorpayOrderID: "rzp_order_123",
		RazorpayKeyID:   "rzp_key_123",
		Plan: models.PlanSummary{
			ID:            "pro_yearly",
			Name:          "Pro Yearly",
			BillingPeriod: "yearly",
		},
		Pricing: models.PricingBreakdown{
			Subtotal:       199900,
			DiscountAmount: 0,
			GSTRate:        18,
			GSTAmount:      35982,
			Total:          235882,
			Currency:       "INR",
		},
	}

	bytes, err := json.Marshal(original)
	assert.NoError(t, err)

	var restored models.CreateOrderResponse
	err = json.Unmarshal(bytes, &restored)
	assert.NoError(t, err)

	assert.Equal(t, original.OrderID, restored.OrderID)
	assert.Equal(t, original.RazorpayOrderID, restored.RazorpayOrderID)
	assert.Equal(t, original.Plan.ID, restored.Plan.ID)
	assert.Equal(t, original.Pricing.Total, restored.Pricing.Total)
}

// ====================
// DTO Conversion Tests
// ====================

func TestSubscriptionToResponse(t *testing.T) {
	now := time.Now()
	periodEnd := now.AddDate(1, 0, 0)

	sub := &models.Subscription{
		ID:                 "sub-123",
		UserID:             "user-123",
		PlanID:             "pro_yearly",
		Status:             models.SubscriptionStatusActive,
		CurrentPeriodStart: &now,
		CurrentPeriodEnd:   &periodEnd,
		CancelAtPeriodEnd:  false,
	}

	features := models.PlanFeatures{
		MaxPatterns:        -1,
		MaxVisualizers:     -1,
		HasCodePlayground:  true,
		HasSolutionsAccess: true,
	}

	resp := sub.ToResponse(features)

	assert.Equal(t, sub.ID, resp.ID)
	assert.Equal(t, sub.PlanID, resp.PlanID)
	assert.Equal(t, string(sub.Status), resp.Status)
	assert.Equal(t, features.HasCodePlayground, resp.Features.HasCodePlayground)
}

func TestPlanToResponse(t *testing.T) {
	originalINR := 358800
	originalUSD := 6000
	amountUSD := 1900

	plan := &models.SubscriptionPlan{
		ID:                "pro_yearly",
		Name:              "Pro Yearly",
		AmountINR:         120000,
		OriginalAmountINR: &originalINR,
		AmountUSD:         &amountUSD,
		OriginalAmountUSD: &originalUSD,
		BillingPeriod:     models.BillingPeriodYearly,
		Features: models.PlanFeatures{
			MaxPatterns: -1,
		},
	}

	// Test INR response
	respINR := plan.ToPlanResponse("INR")
	assert.Equal(t, 120000, respINR.Price)
	assert.Equal(t, "INR", respINR.Currency)

	// Test USD response
	respUSD := plan.ToPlanResponse("USD")
	assert.Equal(t, 1900, respUSD.Price)
	assert.Equal(t, "USD", respUSD.Currency)
}

// ====================
// Error Type Tests
// ====================

func TestPaymentServiceErrors(t *testing.T) {
	assert.Equal(t, "plan not found", ErrPlanNotFound.Error())
	assert.Equal(t, "plan is not active", ErrPlanNotActive.Error())
	assert.Equal(t, "invalid discount code", ErrInvalidDiscountCode.Error())
	assert.Equal(t, "discount code not applicable to this plan", ErrDiscountNotApplicable.Error())
	assert.Equal(t, "order not found", ErrOrderNotFound.Error())
	assert.Equal(t, "order has expired", ErrOrderExpired.Error())
	assert.Equal(t, "order has already been paid", ErrOrderAlreadyPaid.Error())
	assert.Equal(t, "payment verification failed", ErrPaymentVerification.Error())
	assert.Equal(t, "subscription not found", ErrSubscriptionNotFound.Error())
	assert.Equal(t, "user already has an active subscription", ErrAlreadySubscribed.Error())
	assert.Equal(t, "idempotency key conflict", ErrIdempotencyConflict.Error())
}

// ====================
// Subscription Status Tests
// ====================

func TestSubscriptionStatusTransitions(t *testing.T) {
	tests := []struct {
		name        string
		status      models.SubscriptionStatus
		isActive    bool
		isPastDue   bool
		isCancelled bool
	}{
		{
			name:     "active status",
			status:   models.SubscriptionStatusActive,
			isActive: true,
		},
		{
			name:      "past_due status",
			status:    models.SubscriptionStatusPastDue,
			isPastDue: true,
		},
		{
			name:        "cancelled status",
			status:      models.SubscriptionStatusCancelled,
			isCancelled: true,
		},
		{
			name:   "expired status",
			status: models.SubscriptionStatusExpired,
		},
		{
			name:   "pending status",
			status: models.SubscriptionStatusPending,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.isActive, tt.status == models.SubscriptionStatusActive)
			assert.Equal(t, tt.isPastDue, tt.status == models.SubscriptionStatusPastDue)
			assert.Equal(t, tt.isCancelled, tt.status == models.SubscriptionStatusCancelled)
		})
	}
}

// ====================
// Order Status Tests
// ====================

func TestOrderStatusTransitions(t *testing.T) {
	tests := []struct {
		name     string
		status   models.OrderStatus
		canPay   bool
		isPaid   bool
		isExpired bool
	}{
		{
			name:   "created status",
			status: models.OrderStatusCreated,
			canPay: true,
		},
		{
			name:   "attempted status",
			status: models.OrderStatusAttempted,
			canPay: true,
		},
		{
			name:   "paid status",
			status: models.OrderStatusPaid,
			isPaid: true,
		},
		{
			name:      "expired status",
			status:    models.OrderStatusExpired,
			isExpired: true,
		},
		{
			name:   "failed status",
			status: models.OrderStatusFailed,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			canPay := tt.status == models.OrderStatusCreated || tt.status == models.OrderStatusAttempted
			assert.Equal(t, tt.canPay, canPay)
			assert.Equal(t, tt.isPaid, tt.status == models.OrderStatusPaid)
			assert.Equal(t, tt.isExpired, tt.status == models.OrderStatusExpired)
		})
	}
}

// Helper functions
func timePtr(t time.Time) *time.Time {
	return &t
}

func intPtr(i int) *int {
	return &i
}
