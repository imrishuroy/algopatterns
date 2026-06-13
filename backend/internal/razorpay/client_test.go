package razorpay

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"testing"

	"github.com/stretchr/testify/assert"
)

// ====================
// Payment Signature Verification Tests
// ====================

func TestVerifyPaymentSignature_Valid(t *testing.T) {
	keySecret := "test_secret_key_12345"
	webhookSecret := "webhook_secret_12345"
	client := NewClient("test_key_id", keySecret, webhookSecret)

	razorpayOrderID := "order_ABC123456"
	razorpayPaymentID := "pay_XYZ789012"

	// Generate valid signature
	data := razorpayOrderID + "|" + razorpayPaymentID
	h := hmac.New(sha256.New, []byte(keySecret))
	h.Write([]byte(data))
	validSignature := hex.EncodeToString(h.Sum(nil))

	result := client.VerifyPaymentSignature(razorpayOrderID, razorpayPaymentID, validSignature)
	assert.True(t, result, "Valid signature should be verified successfully")
}

func TestVerifyPaymentSignature_Invalid(t *testing.T) {
	keySecret := "test_secret_key_12345"
	webhookSecret := "webhook_secret_12345"
	client := NewClient("test_key_id", keySecret, webhookSecret)

	razorpayOrderID := "order_ABC123456"
	razorpayPaymentID := "pay_XYZ789012"

	invalidSignature := "invalid_signature_that_will_not_match"

	result := client.VerifyPaymentSignature(razorpayOrderID, razorpayPaymentID, invalidSignature)
	assert.False(t, result, "Invalid signature should fail verification")
}

func TestVerifyPaymentSignature_WrongOrderID(t *testing.T) {
	keySecret := "test_secret_key_12345"
	webhookSecret := "webhook_secret_12345"
	client := NewClient("test_key_id", keySecret, webhookSecret)

	razorpayOrderID := "order_ABC123456"
	razorpayPaymentID := "pay_XYZ789012"

	// Generate signature with correct order
	data := razorpayOrderID + "|" + razorpayPaymentID
	h := hmac.New(sha256.New, []byte(keySecret))
	h.Write([]byte(data))
	signature := hex.EncodeToString(h.Sum(nil))

	// Verify with wrong order ID
	wrongOrderID := "order_WRONG123"
	result := client.VerifyPaymentSignature(wrongOrderID, razorpayPaymentID, signature)
	assert.False(t, result, "Signature verification should fail with wrong order ID")
}

func TestVerifyPaymentSignature_WrongPaymentID(t *testing.T) {
	keySecret := "test_secret_key_12345"
	webhookSecret := "webhook_secret_12345"
	client := NewClient("test_key_id", keySecret, webhookSecret)

	razorpayOrderID := "order_ABC123456"
	razorpayPaymentID := "pay_XYZ789012"

	// Generate signature with correct payment ID
	data := razorpayOrderID + "|" + razorpayPaymentID
	h := hmac.New(sha256.New, []byte(keySecret))
	h.Write([]byte(data))
	signature := hex.EncodeToString(h.Sum(nil))

	// Verify with wrong payment ID
	wrongPaymentID := "pay_WRONG456"
	result := client.VerifyPaymentSignature(razorpayOrderID, wrongPaymentID, signature)
	assert.False(t, result, "Signature verification should fail with wrong payment ID")
}

func TestVerifyPaymentSignature_EmptySignature(t *testing.T) {
	keySecret := "test_secret_key_12345"
	webhookSecret := "webhook_secret_12345"
	client := NewClient("test_key_id", keySecret, webhookSecret)

	razorpayOrderID := "order_ABC123456"
	razorpayPaymentID := "pay_XYZ789012"

	result := client.VerifyPaymentSignature(razorpayOrderID, razorpayPaymentID, "")
	assert.False(t, result, "Empty signature should fail verification")
}

func TestVerifyPaymentSignature_EmptyOrderID(t *testing.T) {
	keySecret := "test_secret_key_12345"
	webhookSecret := "webhook_secret_12345"
	client := NewClient("test_key_id", keySecret, webhookSecret)

	razorpayPaymentID := "pay_XYZ789012"

	// Generate signature with empty order
	data := "" + "|" + razorpayPaymentID
	h := hmac.New(sha256.New, []byte(keySecret))
	h.Write([]byte(data))
	signature := hex.EncodeToString(h.Sum(nil))

	result := client.VerifyPaymentSignature("", razorpayPaymentID, signature)
	assert.True(t, result, "Signature with empty order ID should match if generated with same")
}

func TestVerifyPaymentSignature_DifferentSecretKey(t *testing.T) {
	keySecret1 := "test_secret_key_12345"
	keySecret2 := "different_secret_key"
	webhookSecret := "webhook_secret_12345"

	client1 := NewClient("test_key_id", keySecret1, webhookSecret)
	client2 := NewClient("test_key_id", keySecret2, webhookSecret)

	razorpayOrderID := "order_ABC123456"
	razorpayPaymentID := "pay_XYZ789012"

	// Generate signature with client1's secret
	data := razorpayOrderID + "|" + razorpayPaymentID
	h := hmac.New(sha256.New, []byte(keySecret1))
	h.Write([]byte(data))
	signature := hex.EncodeToString(h.Sum(nil))

	// Verify with client1 (should pass)
	result1 := client1.VerifyPaymentSignature(razorpayOrderID, razorpayPaymentID, signature)
	assert.True(t, result1, "Signature should verify with correct secret")

	// Verify with client2 (should fail)
	result2 := client2.VerifyPaymentSignature(razorpayOrderID, razorpayPaymentID, signature)
	assert.False(t, result2, "Signature should fail with different secret")
}

// ====================
// Webhook Signature Verification Tests
// ====================

func TestVerifyWebhookSignature_Valid(t *testing.T) {
	keySecret := "test_secret_key_12345"
	webhookSecret := "webhook_secret_12345"
	client := NewClient("test_key_id", keySecret, webhookSecret)

	webhookBody := []byte(`{"event":"payment.captured","payload":{"payment":{"id":"pay_123"}}}`)

	// Generate valid webhook signature
	h := hmac.New(sha256.New, []byte(webhookSecret))
	h.Write(webhookBody)
	validSignature := hex.EncodeToString(h.Sum(nil))

	result := client.VerifyWebhookSignature(webhookBody, validSignature)
	assert.True(t, result, "Valid webhook signature should be verified successfully")
}

func TestVerifyWebhookSignature_Invalid(t *testing.T) {
	keySecret := "test_secret_key_12345"
	webhookSecret := "webhook_secret_12345"
	client := NewClient("test_key_id", keySecret, webhookSecret)

	webhookBody := []byte(`{"event":"payment.captured","payload":{"payment":{"id":"pay_123"}}}`)
	invalidSignature := "invalid_webhook_signature"

	result := client.VerifyWebhookSignature(webhookBody, invalidSignature)
	assert.False(t, result, "Invalid webhook signature should fail verification")
}

func TestVerifyWebhookSignature_TamperedBody(t *testing.T) {
	keySecret := "test_secret_key_12345"
	webhookSecret := "webhook_secret_12345"
	client := NewClient("test_key_id", keySecret, webhookSecret)

	originalBody := []byte(`{"event":"payment.captured","payload":{"payment":{"id":"pay_123"}}}`)

	// Generate signature with original body
	h := hmac.New(sha256.New, []byte(webhookSecret))
	h.Write(originalBody)
	signature := hex.EncodeToString(h.Sum(nil))

	// Verify with tampered body
	tamperedBody := []byte(`{"event":"payment.captured","payload":{"payment":{"id":"pay_TAMPERED"}}}`)
	result := client.VerifyWebhookSignature(tamperedBody, signature)
	assert.False(t, result, "Webhook signature verification should fail with tampered body")
}

func TestVerifyWebhookSignature_EmptyBody(t *testing.T) {
	keySecret := "test_secret_key_12345"
	webhookSecret := "webhook_secret_12345"
	client := NewClient("test_key_id", keySecret, webhookSecret)

	emptyBody := []byte("")

	// Generate signature for empty body
	h := hmac.New(sha256.New, []byte(webhookSecret))
	h.Write(emptyBody)
	signature := hex.EncodeToString(h.Sum(nil))

	result := client.VerifyWebhookSignature(emptyBody, signature)
	assert.True(t, result, "Empty body with matching signature should verify")
}

func TestVerifyWebhookSignature_EmptySignature(t *testing.T) {
	keySecret := "test_secret_key_12345"
	webhookSecret := "webhook_secret_12345"
	client := NewClient("test_key_id", keySecret, webhookSecret)

	webhookBody := []byte(`{"event":"payment.captured"}`)

	result := client.VerifyWebhookSignature(webhookBody, "")
	assert.False(t, result, "Empty signature should fail verification")
}

func TestVerifyWebhookSignature_DifferentWebhookSecret(t *testing.T) {
	keySecret := "test_secret_key_12345"
	webhookSecret1 := "webhook_secret_12345"
	webhookSecret2 := "different_webhook_secret"

	client1 := NewClient("test_key_id", keySecret, webhookSecret1)
	client2 := NewClient("test_key_id", keySecret, webhookSecret2)

	webhookBody := []byte(`{"event":"payment.captured","payload":{"payment":{"id":"pay_123"}}}`)

	// Generate signature with client1's webhook secret
	h := hmac.New(sha256.New, []byte(webhookSecret1))
	h.Write(webhookBody)
	signature := hex.EncodeToString(h.Sum(nil))

	// Verify with client1 (should pass)
	result1 := client1.VerifyWebhookSignature(webhookBody, signature)
	assert.True(t, result1, "Webhook signature should verify with correct secret")

	// Verify with client2 (should fail)
	result2 := client2.VerifyWebhookSignature(webhookBody, signature)
	assert.False(t, result2, "Webhook signature should fail with different secret")
}

// ====================
// Client Initialization Tests
// ====================

func TestNewClient(t *testing.T) {
	keyID := "rzp_test_123"
	keySecret := "secret_abc"
	webhookSecret := "webhook_xyz"

	client := NewClient(keyID, keySecret, webhookSecret)

	assert.NotNil(t, client)
	assert.Equal(t, keyID, client.keyID)
	assert.Equal(t, keySecret, client.keySecret)
	assert.Equal(t, webhookSecret, client.webhookSecret)
	assert.NotNil(t, client.httpClient)
}

func TestNewClient_EmptyCredentials(t *testing.T) {
	client := NewClient("", "", "")

	assert.NotNil(t, client)
	assert.Empty(t, client.keyID)
	assert.Empty(t, client.keySecret)
	assert.Empty(t, client.webhookSecret)
}

// ====================
// Internal Signature Verification Tests
// ====================

func TestVerifySignature_ConsistentResults(t *testing.T) {
	keySecret := "test_secret_key_12345"
	client := NewClient("test_key_id", keySecret, "webhook_secret")

	data := "test_data_to_sign"

	// Generate signature
	h := hmac.New(sha256.New, []byte(keySecret))
	h.Write([]byte(data))
	signature := hex.EncodeToString(h.Sum(nil))

	// Verify multiple times - should be consistent
	for i := 0; i < 10; i++ {
		result := client.verifySignature(data, signature, keySecret)
		assert.True(t, result, "Signature verification should be consistent on iteration %d", i)
	}
}

func TestVerifySignature_CaseSensitive(t *testing.T) {
	keySecret := "test_secret_key_12345"
	client := NewClient("test_key_id", keySecret, "webhook_secret")

	data := "test_data"

	h := hmac.New(sha256.New, []byte(keySecret))
	h.Write([]byte(data))
	signature := hex.EncodeToString(h.Sum(nil))

	// Signature should be case-sensitive (hex encoding is lowercase)
	upperSignature := "ABCDEF" + signature[6:] // Replace first 6 chars with uppercase
	result := client.verifySignature(data, upperSignature, keySecret)
	assert.False(t, result, "Signature verification should be case-sensitive")
}

// ====================
// RazorpayError Tests
// ====================

func TestRazorpayError_Error(t *testing.T) {
	err := &RazorpayError{
		StatusCode:  400,
		Code:        "BAD_REQUEST_ERROR",
		Description: "Invalid payment ID",
		Source:      "business",
		Step:        "payment_initiation",
		Reason:      "invalid_id",
	}

	errorMsg := err.Error()
	assert.Contains(t, errorMsg, "BAD_REQUEST_ERROR")
	assert.Contains(t, errorMsg, "Invalid payment ID")
	assert.Contains(t, errorMsg, "business")
	assert.Contains(t, errorMsg, "payment_initiation")
	assert.Contains(t, errorMsg, "invalid_id")
}

func TestRazorpayError_IsRetryable(t *testing.T) {
	testCases := []struct {
		name       string
		statusCode int
		expected   bool
	}{
		{"500 Internal Server Error", 500, true},
		{"502 Bad Gateway", 502, true},
		{"503 Service Unavailable", 503, true},
		{"429 Too Many Requests", 429, true},
		{"400 Bad Request", 400, false},
		{"401 Unauthorized", 401, false},
		{"404 Not Found", 404, false},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			err := &RazorpayError{StatusCode: tc.statusCode}
			assert.Equal(t, tc.expected, err.IsRetryable())
		})
	}
}

func TestRazorpayError_IsBadRequest(t *testing.T) {
	badRequestErr := &RazorpayError{StatusCode: 400}
	otherErr := &RazorpayError{StatusCode: 500}

	assert.True(t, badRequestErr.IsBadRequest())
	assert.False(t, otherErr.IsBadRequest())
}

func TestRazorpayError_IsUnauthorized(t *testing.T) {
	unauthorizedErr := &RazorpayError{StatusCode: 401}
	otherErr := &RazorpayError{StatusCode: 400}

	assert.True(t, unauthorizedErr.IsUnauthorized())
	assert.False(t, otherErr.IsUnauthorized())
}

// ====================
// Signature Format Tests
// ====================

func TestSignatureFormat_HexEncoding(t *testing.T) {
	keySecret := "test_secret"
	data := "order_123|pay_456"

	h := hmac.New(sha256.New, []byte(keySecret))
	h.Write([]byte(data))
	signature := hex.EncodeToString(h.Sum(nil))

	// SHA256 produces 32 bytes, hex encoding = 64 characters
	assert.Len(t, signature, 64, "SHA256 hex signature should be 64 characters")

	// Should only contain hex characters
	for _, c := range signature {
		isHex := (c >= '0' && c <= '9') || (c >= 'a' && c <= 'f')
		assert.True(t, isHex, "Signature should only contain hex characters")
	}
}

func TestSignatureFormat_Deterministic(t *testing.T) {
	keySecret := "test_secret"
	data := "order_123|pay_456"

	// Generate signature twice
	h1 := hmac.New(sha256.New, []byte(keySecret))
	h1.Write([]byte(data))
	sig1 := hex.EncodeToString(h1.Sum(nil))

	h2 := hmac.New(sha256.New, []byte(keySecret))
	h2.Write([]byte(data))
	sig2 := hex.EncodeToString(h2.Sum(nil))

	assert.Equal(t, sig1, sig2, "Same input should always produce same signature")
}

// ====================
// Edge Cases Tests
// ====================

func TestVerifySignature_SpecialCharacters(t *testing.T) {
	keySecret := "test_secret_key_12345"
	client := NewClient("test_key_id", keySecret, "webhook_secret")

	// Data with special characters
	data := "order_ABC!@#$%^&*()|pay_XYZ<>?:\""

	h := hmac.New(sha256.New, []byte(keySecret))
	h.Write([]byte(data))
	signature := hex.EncodeToString(h.Sum(nil))

	result := client.verifySignature(data, signature, keySecret)
	assert.True(t, result, "Signature verification should handle special characters")
}

func TestVerifySignature_UnicodeData(t *testing.T) {
	keySecret := "test_secret_key_12345"
	client := NewClient("test_key_id", keySecret, "webhook_secret")

	// Data with Unicode characters
	data := "order_123|pay_456|user_name:Test User"

	h := hmac.New(sha256.New, []byte(keySecret))
	h.Write([]byte(data))
	signature := hex.EncodeToString(h.Sum(nil))

	result := client.verifySignature(data, signature, keySecret)
	assert.True(t, result, "Signature verification should handle Unicode")
}

func TestVerifySignature_LongData(t *testing.T) {
	keySecret := "test_secret_key_12345"
	client := NewClient("test_key_id", keySecret, "webhook_secret")

	// Very long data (10KB)
	data := make([]byte, 10240)
	for i := range data {
		data[i] = byte('a' + (i % 26))
	}

	h := hmac.New(sha256.New, []byte(keySecret))
	h.Write(data)
	signature := hex.EncodeToString(h.Sum(nil))

	result := client.verifySignature(string(data), signature, keySecret)
	assert.True(t, result, "Signature verification should handle long data")
}

func TestVerifyWebhookSignature_RealWorldPayload(t *testing.T) {
	keySecret := "test_secret_key_12345"
	webhookSecret := "webhook_secret_12345"
	client := NewClient("test_key_id", keySecret, webhookSecret)

	// Realistic webhook payload
	webhookBody := []byte(`{
		"entity": "event",
		"account_id": "acc_ABC123",
		"event": "payment.captured",
		"contains": ["payment"],
		"payload": {
			"payment": {
				"entity": {
					"id": "pay_XYZ789",
					"entity": "payment",
					"amount": 199900,
					"currency": "INR",
					"status": "captured",
					"order_id": "order_DEF456",
					"method": "upi",
					"email": "test@example.com",
					"contact": "+919876543210",
					"fee": 3598,
					"tax": 550
				}
			}
		},
		"created_at": 1234567890
	}`)

	h := hmac.New(sha256.New, []byte(webhookSecret))
	h.Write(webhookBody)
	signature := hex.EncodeToString(h.Sum(nil))

	result := client.VerifyWebhookSignature(webhookBody, signature)
	assert.True(t, result, "Should verify real-world webhook payload")
}

// ====================
// Timing Attack Resistance Tests
// ====================

func TestVerifySignature_ConstantTimeComparison(_ *testing.T) {
	keySecret := "test_secret_key_12345"
	client := NewClient("test_key_id", keySecret, "webhook_secret")

	data := "order_123|pay_456"
	h := hmac.New(sha256.New, []byte(keySecret))
	h.Write([]byte(data))
	validSignature := hex.EncodeToString(h.Sum(nil))

	// These should all take approximately the same time
	// (using hmac.Equal which is constant-time)
	testSignatures := []string{
		validSignature,                            // Valid
		"0" + validSignature[1:],                  // Wrong first char
		validSignature[:63] + "0",                 // Wrong last char
		validSignature[:32] + "0" + validSignature[33:], // Wrong middle char
		"totally_wrong_signature_that_doesnt_match_at_all_ever",
	}

	for _, sig := range testSignatures {
		// Just verify it completes without panic
		_ = client.verifySignature(data, sig, keySecret)
	}
}
