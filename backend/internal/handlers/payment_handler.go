package handlers

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/imrishuroy/algopatterns/internal/middleware"
	"github.com/imrishuroy/algopatterns/internal/models"
	"github.com/imrishuroy/algopatterns/internal/services"
	"github.com/imrishuroy/algopatterns/pkg/response"
	"github.com/rs/zerolog/log"
)

const (
	idempotencyKeyHeader    = "Idempotency-Key"
	razorpaySignatureHeader = "X-Razorpay-Signature"
)

type PaymentHandler struct {
	paymentService *services.PaymentService
	webhookService *services.WebhookService
	authMW         *middleware.AuthMiddleware
}

func NewPaymentHandler(
	paymentService *services.PaymentService,
	webhookService *services.WebhookService,
	authMW *middleware.AuthMiddleware,
) *PaymentHandler {
	return &PaymentHandler{
		paymentService: paymentService,
		webhookService: webhookService,
		authMW:         authMW,
	}
}

func (h *PaymentHandler) RegisterRoutes(rg *gin.RouterGroup) {
	payments := rg.Group("/payments")
	{
		payments.GET("/plans", h.GetPlans)
		payments.POST("/webhook", h.HandleWebhook)

		authenticated := payments.Group("")
		authenticated.Use(h.authMW.RequireAuth())
		{
			authenticated.GET("/subscription", h.GetSubscription)
			authenticated.POST("/orders", h.CreateOrder)
			authenticated.POST("/verify", h.VerifyPayment)
			authenticated.POST("/validate-discount", h.ValidateDiscount)
			authenticated.POST("/cancel", h.CancelSubscription)

			// Recurring subscription endpoints
			authenticated.POST("/subscriptions", h.CreateSubscription)
			authenticated.POST("/subscriptions/verify", h.VerifySubscription)
		}
	}
}

// skipcq: RVV-A0006 - HTTP handler writes to response, doesn't return value
func (h *PaymentHandler) GetPlans(c *gin.Context) {
	currency := c.DefaultQuery("currency", "INR")

	plans, err := h.paymentService.GetPlans(c.Request.Context(), currency)
	if err != nil {
		log.Error().Err(err).Msg("Failed to get plans")
		response.InternalError(c)
		return
	}

	response.OK(c, models.PlansListResponse{Plans: plans})
}

// skipcq: RVV-A0006 - HTTP handler writes to response, doesn't return value
func (h *PaymentHandler) GetSubscription(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "User not authenticated")
		return
	}

	subscription, err := h.paymentService.GetSubscription(c.Request.Context(), userID.String())
	if err != nil {
		log.Error().Err(err).Str("user_id", userID.String()).Msg("Failed to get subscription")
		response.InternalError(c)
		return
	}

	response.OK(c, subscription)
}

func (h *PaymentHandler) CreateOrder(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "User not authenticated")
		return
	}

	var req models.CreateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]string{"error": err.Error()})
		return
	}

	idempotencyKey := c.GetHeader(idempotencyKeyHeader)

	reqBody, _ := json.Marshal(req)

	order, err := h.paymentService.CreateOrder(
		c.Request.Context(),
		userID.String(),
		req.PlanID,
		req.DiscountCode,
		idempotencyKey,
		c.Request.URL.Path,
		reqBody,
	)

	if err != nil {
		h.handlePaymentError(c, err)
		return
	}

	response.OK(c, order)
}

func (h *PaymentHandler) VerifyPayment(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "User not authenticated")
		return
	}

	var req models.VerifyPaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]string{"error": err.Error()})
		return
	}

	result, err := h.paymentService.VerifyPayment(
		c.Request.Context(),
		userID.String(),
		req.RazorpayPaymentID,
		req.RazorpayOrderID,
		req.RazorpaySignature,
	)

	if err != nil {
		h.handlePaymentError(c, err)
		return
	}

	response.OK(c, result)
}

func (h *PaymentHandler) ValidateDiscount(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "User not authenticated")
		return
	}

	var req models.ValidateDiscountRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]string{"error": err.Error()})
		return
	}

	result, err := h.paymentService.ValidateDiscount(c.Request.Context(), userID.String(), req.Code, req.PlanID)
	if err != nil {
		h.handlePaymentError(c, err)
		return
	}

	response.OK(c, result)
}

func (h *PaymentHandler) CancelSubscription(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "User not authenticated")
		return
	}

	var req models.CancelSubscriptionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]string{"error": err.Error()})
		return
	}

	result, err := h.paymentService.CancelSubscription(c.Request.Context(), userID.String(), req.Reason, req.Feedback)
	if err != nil {
		h.handlePaymentError(c, err)
		return
	}

	response.OK(c, result)
}

func (h *PaymentHandler) CreateSubscription(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "User not authenticated")
		return
	}

	var req models.CreateSubscriptionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]string{"error": err.Error()})
		return
	}

	idempotencyKey := c.GetHeader(idempotencyKeyHeader)
	reqBody, _ := json.Marshal(req)

	result, err := h.paymentService.CreateRecurringSubscription(
		c.Request.Context(),
		userID.String(),
		req.PlanID,
		idempotencyKey,
		c.Request.URL.Path,
		reqBody,
	)
	if err != nil {
		h.handlePaymentError(c, err)
		return
	}

	response.OK(c, result)
}

func (h *PaymentHandler) VerifySubscription(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "User not authenticated")
		return
	}

	var req models.VerifySubscriptionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]string{"error": err.Error()})
		return
	}

	result, err := h.paymentService.VerifyRecurringSubscription(
		c.Request.Context(),
		userID.String(),
		req.RazorpayPaymentID,
		req.RazorpaySubscriptionID,
		req.RazorpaySignature,
	)
	if err != nil {
		h.handlePaymentError(c, err)
		return
	}

	response.OK(c, result)
}

func (h *PaymentHandler) HandleWebhook(c *gin.Context) {
	signature := c.GetHeader(razorpaySignatureHeader)
	if signature == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing signature"})
		return
	}

	body, err := io.ReadAll(c.Request.Body)
	if err != nil {
		log.Error().Err(err).Msg("Failed to read webhook body")
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"})
		return
	}

	if err := h.webhookService.ProcessWebhook(c.Request.Context(), body, signature); err != nil {
		log.Error().Err(err).Msg("Failed to process webhook")
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

func (h *PaymentHandler) handlePaymentError(c *gin.Context, err error) {
	switch {
	case errors.Is(err, services.ErrPlanNotFound):
		response.NotFound(c, "Plan")
	case errors.Is(err, services.ErrPlanNotActive):
		response.BadRequest(c, "Plan is not available", nil)
	case errors.Is(err, services.ErrInvalidDiscountCode):
		response.BadRequest(c, "Invalid or expired discount code", nil)
	case errors.Is(err, services.ErrDiscountNotApplicable):
		response.BadRequest(c, "Discount code not applicable to this plan", nil)
	case errors.Is(err, services.ErrOrderNotFound):
		response.NotFound(c, "Order")
	case errors.Is(err, services.ErrOrderExpired):
		response.BadRequest(c, "Order has expired", nil)
	case errors.Is(err, services.ErrOrderAlreadyPaid):
		response.BadRequest(c, "Order has already been paid", nil)
	case errors.Is(err, services.ErrPaymentVerification):
		response.BadRequest(c, "Payment verification failed", nil)
	case errors.Is(err, services.ErrSubscriptionNotFound):
		response.NotFound(c, "Subscription")
	case errors.Is(err, services.ErrAlreadySubscribed):
		response.Conflict(c, "You already have an active subscription")
	case errors.Is(err, services.ErrIdempotencyConflict):
		response.Conflict(c, "Idempotency key mismatch")
	default:
		log.Error().Err(err).Msg("Payment operation failed")
		response.InternalError(c)
	}
}
