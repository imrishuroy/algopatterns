package razorpay

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

const (
	baseURL           = "https://api.razorpay.com/v1"
	defaultTimeout    = 30 * time.Second
	maxRetries        = 3
	retryBackoffBase  = 100 * time.Millisecond
)

type Client struct {
	keyID         string
	keySecret     string
	webhookSecret string
	httpClient    *http.Client
}

type OrderRequest struct {
	Amount         int               `json:"amount"`
	Currency       string            `json:"currency"`
	Receipt        string            `json:"receipt,omitempty"`
	Notes          map[string]string `json:"notes,omitempty"`
	PartialPayment bool              `json:"partial_payment"`
}

type OrderResponse struct {
	ID            string            `json:"id"`
	Entity        string            `json:"entity"`
	Amount        int               `json:"amount"`
	AmountPaid    int               `json:"amount_paid"`
	AmountDue     int               `json:"amount_due"`
	Currency      string            `json:"currency"`
	Receipt       string            `json:"receipt"`
	Status        string            `json:"status"`
	Attempts      int               `json:"attempts"`
	Notes         map[string]string `json:"notes"`
	CreatedAt     int64             `json:"created_at"`
}

type PaymentResponse struct {
	ID              string            `json:"id"`
	Entity          string            `json:"entity"`
	Amount          int               `json:"amount"`
	Currency        string            `json:"currency"`
	Status          string            `json:"status"`
	OrderID         string            `json:"order_id"`
	Method          string            `json:"method"`
	Description     string            `json:"description"`
	Email           string            `json:"email"`
	Contact         string            `json:"contact"`
	Fee             int               `json:"fee"`
	Tax             int               `json:"tax"`
	ErrorCode       string            `json:"error_code,omitempty"`
	ErrorDescription string           `json:"error_description,omitempty"`
	ErrorSource     string            `json:"error_source,omitempty"`
	ErrorStep       string            `json:"error_step,omitempty"`
	ErrorReason     string            `json:"error_reason,omitempty"`
	Notes           map[string]string `json:"notes"`
	CreatedAt       int64             `json:"created_at"`
	CapturedAt      int64             `json:"captured_at,omitempty"`
}

type APIError struct {
	Code        string `json:"code"`
	Description string `json:"description"`
	Source      string `json:"source"`
	Step        string `json:"step"`
	Reason      string `json:"reason"`
	Field       string `json:"field,omitempty"`
}

// Subscription types for Razorpay Subscriptions API
type SubscriptionRequest struct {
	PlanID         string            `json:"plan_id"`
	TotalCount     int               `json:"total_count,omitempty"`
	Quantity       int               `json:"quantity,omitempty"`
	CustomerNotify int               `json:"customer_notify,omitempty"`
	StartAt        int64             `json:"start_at,omitempty"`
	ExpireBy       int64             `json:"expire_by,omitempty"`
	Notes          map[string]string `json:"notes,omitempty"`
}

type SubscriptionResponse struct {
	ID                 string            `json:"id"`
	Entity             string            `json:"entity"`
	PlanID             string            `json:"plan_id"`
	Status             string            `json:"status"`
	CurrentStart       int64             `json:"current_start,omitempty"`
	CurrentEnd         int64             `json:"current_end,omitempty"`
	EndedAt            int64             `json:"ended_at,omitempty"`
	Quantity           int               `json:"quantity"`
	Notes              map[string]string `json:"notes"`
	ChargeAt           int64             `json:"charge_at,omitempty"`
	StartAt            int64             `json:"start_at,omitempty"`
	EndAt              int64             `json:"end_at,omitempty"`
	AuthAttempts       int               `json:"auth_attempts"`
	TotalCount         int               `json:"total_count"`
	PaidCount          int               `json:"paid_count"`
	CustomerNotify     int               `json:"customer_notify"`
	CreatedAt          int64             `json:"created_at"`
	ExpireBy           int64             `json:"expire_by,omitempty"`
	ShortURL           string            `json:"short_url,omitempty"`
	HasScheduledChanges bool             `json:"has_scheduled_changes"`
	ChangeScheduledAt  int64             `json:"change_scheduled_at,omitempty"`
	PaymentMethod      string            `json:"payment_method,omitempty"`
}

type PlanRequest struct {
	Period   string            `json:"period"`
	Interval int               `json:"interval"`
	Item     PlanItem          `json:"item"`
	Notes    map[string]string `json:"notes,omitempty"`
}

type PlanItem struct {
	Name        string `json:"name"`
	Amount      int    `json:"amount"`
	Currency    string `json:"currency"`
	Description string `json:"description,omitempty"`
}

type PlanResponse struct {
	ID        string            `json:"id"`
	Entity    string            `json:"entity"`
	Interval  int               `json:"interval"`
	Period    string            `json:"period"`
	Item      PlanItem          `json:"item"`
	Notes     map[string]string `json:"notes"`
	CreatedAt int64             `json:"created_at"`
}

type ErrorResponse struct {
	Error APIError `json:"error"`
}

func NewClient(keyID, keySecret, webhookSecret string) *Client {
	return &Client{
		keyID:         keyID,
		keySecret:     keySecret,
		webhookSecret: webhookSecret,
		httpClient: &http.Client{
			Timeout: defaultTimeout,
		},
	}
}

func (c *Client) CreateOrder(req OrderRequest) (*OrderResponse, error) {
	body, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal order request: %w", err)
	}

	respBody, err := c.doRequest("POST", "/orders", body)
	if err != nil {
		return nil, err
	}

	var order OrderResponse
	if err := json.Unmarshal(respBody, &order); err != nil {
		return nil, fmt.Errorf("failed to unmarshal order response: %w", err)
	}

	return &order, nil
}

func (c *Client) FetchOrder(orderID string) (*OrderResponse, error) {
	respBody, err := c.doRequest("GET", "/orders/"+orderID, nil)
	if err != nil {
		return nil, err
	}

	var order OrderResponse
	if err := json.Unmarshal(respBody, &order); err != nil {
		return nil, fmt.Errorf("failed to unmarshal order response: %w", err)
	}

	return &order, nil
}

func (c *Client) FetchPayment(paymentID string) (*PaymentResponse, error) {
	respBody, err := c.doRequest("GET", "/payments/"+paymentID, nil)
	if err != nil {
		return nil, err
	}

	var payment PaymentResponse
	if err := json.Unmarshal(respBody, &payment); err != nil {
		return nil, fmt.Errorf("failed to unmarshal payment response: %w", err)
	}

	return &payment, nil
}

func (c *Client) VerifyPaymentSignature(razorpayOrderID, razorpayPaymentID, signature string) bool {
	data := razorpayOrderID + "|" + razorpayPaymentID
	return c.verifySignature(data, signature, c.keySecret)
}

func (c *Client) VerifySubscriptionSignature(razorpaySubscriptionID, razorpayPaymentID, signature string) bool {
	data := razorpayPaymentID + "|" + razorpaySubscriptionID
	return c.verifySignature(data, signature, c.keySecret)
}

// CreatePlan creates a new plan in Razorpay
func (c *Client) CreatePlan(req PlanRequest) (*PlanResponse, error) {
	body, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal plan request: %w", err)
	}

	respBody, err := c.doRequest("POST", "/plans", body)
	if err != nil {
		return nil, err
	}

	var plan PlanResponse
	if err := json.Unmarshal(respBody, &plan); err != nil {
		return nil, fmt.Errorf("failed to unmarshal plan response: %w", err)
	}

	return &plan, nil
}

// FetchPlan fetches a plan by ID
func (c *Client) FetchPlan(planID string) (*PlanResponse, error) {
	respBody, err := c.doRequest("GET", "/plans/"+planID, nil)
	if err != nil {
		return nil, err
	}

	var plan PlanResponse
	if err := json.Unmarshal(respBody, &plan); err != nil {
		return nil, fmt.Errorf("failed to unmarshal plan response: %w", err)
	}

	return &plan, nil
}

// CreateSubscription creates a new subscription
func (c *Client) CreateSubscription(req SubscriptionRequest) (*SubscriptionResponse, error) {
	body, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal subscription request: %w", err)
	}

	respBody, err := c.doRequest("POST", "/subscriptions", body)
	if err != nil {
		return nil, err
	}

	var sub SubscriptionResponse
	if err := json.Unmarshal(respBody, &sub); err != nil {
		return nil, fmt.Errorf("failed to unmarshal subscription response: %w", err)
	}

	return &sub, nil
}

// FetchSubscription fetches a subscription by ID
func (c *Client) FetchSubscription(subscriptionID string) (*SubscriptionResponse, error) {
	respBody, err := c.doRequest("GET", "/subscriptions/"+subscriptionID, nil)
	if err != nil {
		return nil, err
	}

	var sub SubscriptionResponse
	if err := json.Unmarshal(respBody, &sub); err != nil {
		return nil, fmt.Errorf("failed to unmarshal subscription response: %w", err)
	}

	return &sub, nil
}

// CancelSubscription cancels a subscription
func (c *Client) CancelSubscription(subscriptionID string, cancelAtCycleEnd bool) (*SubscriptionResponse, error) {
	body, _ := json.Marshal(map[string]bool{"cancel_at_cycle_end": cancelAtCycleEnd})

	respBody, err := c.doRequest("POST", "/subscriptions/"+subscriptionID+"/cancel", body)
	if err != nil {
		return nil, err
	}

	var sub SubscriptionResponse
	if err := json.Unmarshal(respBody, &sub); err != nil {
		return nil, fmt.Errorf("failed to unmarshal subscription response: %w", err)
	}

	return &sub, nil
}

// PauseSubscription pauses a subscription
func (c *Client) PauseSubscription(subscriptionID string) (*SubscriptionResponse, error) {
	body, _ := json.Marshal(map[string]string{"pause_initiated_by": "customer"})

	respBody, err := c.doRequest("POST", "/subscriptions/"+subscriptionID+"/pause", body)
	if err != nil {
		return nil, err
	}

	var sub SubscriptionResponse
	if err := json.Unmarshal(respBody, &sub); err != nil {
		return nil, fmt.Errorf("failed to unmarshal subscription response: %w", err)
	}

	return &sub, nil
}

// ResumeSubscription resumes a paused subscription
func (c *Client) ResumeSubscription(subscriptionID string) (*SubscriptionResponse, error) {
	respBody, err := c.doRequest("POST", "/subscriptions/"+subscriptionID+"/resume", nil)
	if err != nil {
		return nil, err
	}

	var sub SubscriptionResponse
	if err := json.Unmarshal(respBody, &sub); err != nil {
		return nil, fmt.Errorf("failed to unmarshal subscription response: %w", err)
	}

	return &sub, nil
}

func (c *Client) VerifyWebhookSignature(body []byte, signature string) bool {
	return c.verifySignature(string(body), signature, c.webhookSecret)
}

func (c *Client) verifySignature(data, signature, secret string) bool {
	h := hmac.New(sha256.New, []byte(secret))
	h.Write([]byte(data))
	expectedSignature := hex.EncodeToString(h.Sum(nil))
	return hmac.Equal([]byte(expectedSignature), []byte(signature))
}

func (c *Client) doRequest(method, path string, body []byte) ([]byte, error) {
	var lastErr error

	for attempt := 0; attempt < maxRetries; attempt++ {
		if attempt > 0 {
			backoff := retryBackoffBase * time.Duration(1<<uint(attempt-1))
			time.Sleep(backoff)
		}

		respBody, err, shouldRetry := c.executeRequest(method, path, body)
		if err == nil {
			return respBody, nil
		}

		lastErr = err
		if !shouldRetry {
			break
		}
	}

	return nil, lastErr
}

func (c *Client) executeRequest(method, path string, body []byte) ([]byte, error, bool) {
	var reqBody io.Reader
	if body != nil {
		reqBody = bytes.NewReader(body)
	}

	req, err := http.NewRequest(method, baseURL+path, reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err), false
	}

	req.SetBasicAuth(c.keyID, c.keySecret)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err), true
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err), true
	}

	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		return respBody, nil, false
	}

	shouldRetry := resp.StatusCode >= 500 || resp.StatusCode == 429

	var errResp ErrorResponse
	if err := json.Unmarshal(respBody, &errResp); err != nil {
		return nil, fmt.Errorf("razorpay error (status %d): %s", resp.StatusCode, string(respBody)), shouldRetry
	}

	return nil, &RazorpayError{
		StatusCode:  resp.StatusCode,
		Code:        errResp.Error.Code,
		Description: errResp.Error.Description,
		Source:      errResp.Error.Source,
		Step:        errResp.Error.Step,
		Reason:      errResp.Error.Reason,
		Field:       errResp.Error.Field,
	}, shouldRetry
}

type RazorpayError struct {
	StatusCode  int
	Code        string
	Description string
	Source      string
	Step        string
	Reason      string
	Field       string
}

func (e *RazorpayError) Error() string {
	return fmt.Sprintf("razorpay error [%s]: %s (source: %s, step: %s, reason: %s)",
		e.Code, e.Description, e.Source, e.Step, e.Reason)
}

func (e *RazorpayError) IsRetryable() bool {
	return e.StatusCode >= 500 || e.StatusCode == 429
}

func (e *RazorpayError) IsBadRequest() bool {
	return e.StatusCode == 400
}

func (e *RazorpayError) IsUnauthorized() bool {
	return e.StatusCode == 401
}
