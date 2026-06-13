package models

import "time"

// CreateOrderRequest represents a request to create a payment order
type CreateOrderRequest struct {
	PlanID       string `json:"plan_id" binding:"required"`
	DiscountCode string `json:"discount_code,omitempty"`
}

// CreateOrderResponse represents the response after creating an order
type CreateOrderResponse struct {
	OrderID         string          `json:"order_id"`
	RazorpayOrderID string          `json:"razorpay_order_id"`
	RazorpayKeyID   string          `json:"razorpay_key_id"`
	Plan            PlanSummary     `json:"plan"`
	Pricing         PricingBreakdown `json:"pricing"`
}

// PlanSummary represents a summary of the plan for checkout
type PlanSummary struct {
	ID            string `json:"id"`
	Name          string `json:"name"`
	BillingPeriod string `json:"billing_period"`
}

// PricingBreakdown represents the price breakdown for checkout
type PricingBreakdown struct {
	Subtotal       int     `json:"subtotal"`
	DiscountCode   string  `json:"discount_code,omitempty"`
	DiscountAmount int     `json:"discount_amount"`
	GSTRate        float64 `json:"gst_rate"`
	GSTAmount      int     `json:"gst_amount"`
	Total          int     `json:"total"`
	Currency       string  `json:"currency"`
}

// VerifyPaymentRequest represents a request to verify a payment
type VerifyPaymentRequest struct {
	RazorpayPaymentID string `json:"razorpay_payment_id" binding:"required"`
	RazorpayOrderID   string `json:"razorpay_order_id" binding:"required"`
	RazorpaySignature string `json:"razorpay_signature" binding:"required"`
}

// VerifyPaymentResponse represents the response after verifying a payment
type VerifyPaymentResponse struct {
	PaymentID    string               `json:"payment_id"`
	Subscription SubscriptionResponse `json:"subscription"`
}

// SubscriptionResponse represents a user's subscription for API response
type SubscriptionResponse struct {
	ID                 string        `json:"id,omitempty"`
	PlanID             string        `json:"plan_id"`
	Status             string        `json:"status"`
	CurrentPeriodStart *time.Time    `json:"current_period_start,omitempty"`
	CurrentPeriodEnd   *time.Time    `json:"current_period_end,omitempty"`
	CancelAtPeriodEnd  bool          `json:"cancel_at_period_end,omitempty"`
	Features           PlanFeatures  `json:"features"`
}

// ValidateDiscountRequest represents a request to validate a discount code
type ValidateDiscountRequest struct {
	Code   string `json:"code" binding:"required"`
	PlanID string `json:"plan_id" binding:"required"`
}

// ValidateDiscountResponse represents the response after validating a discount code
type ValidateDiscountResponse struct {
	Code           string `json:"code"`
	DiscountType   string `json:"discount_type"`
	DiscountValue  int    `json:"discount_value"`
	DiscountAmount int    `json:"discount_amount"`
	Message        string `json:"message"`
}

// CancelSubscriptionRequest represents a request to cancel a subscription
type CancelSubscriptionRequest struct {
	Reason   string `json:"reason,omitempty"`
	Feedback string `json:"feedback,omitempty"`
}

// CancelSubscriptionResponse represents the response after canceling
type CancelSubscriptionResponse struct {
	ID               string     `json:"id"`
	Status           string     `json:"status"`
	CancelAtPeriodEnd bool      `json:"cancel_at_period_end"`
	CurrentPeriodEnd *time.Time `json:"current_period_end,omitempty"`
}

// PlansListResponse represents the list of available plans
type PlansListResponse struct {
	Plans []PlanResponse `json:"plans"`
}

// PlanResponse represents a plan in API responses
type PlanResponse struct {
	ID                string       `json:"id"`
	Name              string       `json:"name"`
	Description       string       `json:"description,omitempty"`
	Price             int          `json:"price"`
	OriginalPrice     *int         `json:"original_price,omitempty"`
	Currency          string       `json:"currency"`
	BillingPeriod     string       `json:"billing_period"`
	SavingsPercentage *int         `json:"savings_percentage,omitempty"`
	Features          PlanFeatures `json:"features"`
	IsRecommended     bool         `json:"is_recommended,omitempty"`
}

// RazorpayWebhookEvent represents a Razorpay webhook event
type RazorpayWebhookEvent struct {
	Entity    string                 `json:"entity"`
	AccountID string                 `json:"account_id"`
	Event     string                 `json:"event"`
	Contains  []string               `json:"contains"`
	Payload   map[string]interface{} `json:"payload"`
	CreatedAt int64                  `json:"created_at"`
}

// RazorpayPaymentEntity represents a payment entity from Razorpay
type RazorpayPaymentEntity struct {
	ID            string `json:"id"`
	Entity        string `json:"entity"`
	Amount        int    `json:"amount"`
	Currency      string `json:"currency"`
	Status        string `json:"status"`
	OrderID       string `json:"order_id"`
	Method        string `json:"method"`
	Email         string `json:"email"`
	Contact       string `json:"contact"`
	Fee           int    `json:"fee"`
	Tax           int    `json:"tax"`
	ErrorCode     string `json:"error_code,omitempty"`
	ErrorDesc     string `json:"error_description,omitempty"`
	CapturedAt    int64  `json:"captured_at,omitempty"`
}

// RazorpayOrderEntity represents an order entity from Razorpay
type RazorpayOrderEntity struct {
	ID         string `json:"id"`
	Entity     string `json:"entity"`
	Amount     int    `json:"amount"`
	AmountPaid int    `json:"amount_paid"`
	AmountDue  int    `json:"amount_due"`
	Currency   string `json:"currency"`
	Status     string `json:"status"`
}

// CreateSubscriptionRequest represents a request to create a recurring subscription
type CreateSubscriptionRequest struct {
	PlanID string `json:"plan_id" binding:"required"`
}

// CreateSubscriptionResponse represents the response after creating a subscription
type CreateSubscriptionResponse struct {
	SubscriptionID         string      `json:"subscription_id"`
	RazorpaySubscriptionID string      `json:"razorpay_subscription_id"`
	RazorpayKeyID          string      `json:"razorpay_key_id"`
	Plan                   PlanSummary `json:"plan"`
	Amount                 int         `json:"amount"`
	Currency               string      `json:"currency"`
}

// VerifySubscriptionRequest represents a request to verify a subscription payment
type VerifySubscriptionRequest struct {
	RazorpayPaymentID      string `json:"razorpay_payment_id" binding:"required"`
	RazorpaySubscriptionID string `json:"razorpay_subscription_id" binding:"required"`
	RazorpaySignature      string `json:"razorpay_signature" binding:"required"`
}

// ToSubscriptionResponse converts a Subscription to SubscriptionResponse
func (s *Subscription) ToResponse(features PlanFeatures) SubscriptionResponse {
	return SubscriptionResponse{
		ID:                 s.ID,
		PlanID:             s.PlanID,
		Status:             string(s.Status),
		CurrentPeriodStart: s.CurrentPeriodStart,
		CurrentPeriodEnd:   s.CurrentPeriodEnd,
		CancelAtPeriodEnd:  s.CancelAtPeriodEnd,
		Features:           features,
	}
}

// ToPlanResponse converts a SubscriptionPlan to PlanResponse
func (p *SubscriptionPlan) ToPlanResponse(currency string) PlanResponse {
	var price, originalPrice *int
	if currency == "USD" && p.AmountUSD != nil {
		price = p.AmountUSD
		originalPrice = p.OriginalAmountUSD
	} else {
		price = &p.AmountINR
		originalPrice = p.OriginalAmountINR
		currency = "INR"
	}

	var savings *int
	if originalPrice != nil && *originalPrice > 0 && price != nil && *price > 0 {
		s := ((*originalPrice - *price) * 100) / *originalPrice
		savings = &s
	}

	desc := ""
	if p.Description != nil {
		desc = *p.Description
	}

	return PlanResponse{
		ID:                p.ID,
		Name:              p.Name,
		Description:       desc,
		Price:             *price,
		OriginalPrice:     originalPrice,
		Currency:          currency,
		BillingPeriod:     string(p.BillingPeriod),
		SavingsPercentage: savings,
		Features:          p.Features,
		IsRecommended:     p.ID == "pro_yearly",
	}
}
