package sentry

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/getsentry/sentry-go"
	sentrygin "github.com/getsentry/sentry-go/gin"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func init() {
	gin.SetMode(gin.TestMode)
	sentry.Init(sentry.ClientOptions{})
}

func TestCaptureError_NilError(_ *testing.T) {
	CaptureError(context.Background(), nil, nil)
}

func TestCaptureError_WithError(_ *testing.T) {
	err := errors.New("test error")
	CaptureError(context.Background(), err, map[string]string{"key": "value"})
}

func TestCaptureError_WithMultipleTags(_ *testing.T) {
	err := errors.New("test error with multiple tags")
	tags := map[string]string{
		"service":  "api",
		"endpoint": "/users",
		"method":   "GET",
	}
	CaptureError(context.Background(), err, tags)
}

func TestCaptureError_WithNilTags(_ *testing.T) {
	err := errors.New("test error with nil tags")
	CaptureError(context.Background(), err, nil)
}

func TestCaptureError_WithEmptyTags(_ *testing.T) {
	err := errors.New("test error with empty tags")
	CaptureError(context.Background(), err, map[string]string{})
}

func TestCaptureErrorWithContext_NilError(_ *testing.T) {
	CaptureErrorWithContext(context.Background(), nil, nil, nil)
}

func TestCaptureErrorWithContext_WithError(_ *testing.T) {
	err := errors.New("test error")
	CaptureErrorWithContext(context.Background(), err, map[string]string{"key": "value"}, map[string]sentry.Context{
		"custom": {"field": "value"},
	})
}

func TestCaptureErrorWithContext_WithMultipleContexts(_ *testing.T) {
	err := errors.New("test error with multiple contexts")
	tags := map[string]string{"service": "api"}
	contexts := map[string]sentry.Context{
		"request": {
			"url":    "/api/users",
			"method": "POST",
		},
		"user": {
			"id":    "user-123",
			"email": "test@example.com",
		},
		"custom": {
			"feature_flag": "enabled",
		},
	}
	CaptureErrorWithContext(context.Background(), err, tags, contexts)
}

func TestCaptureErrorWithContext_NilContexts(_ *testing.T) {
	err := errors.New("test error with nil contexts")
	CaptureErrorWithContext(context.Background(), err, map[string]string{"key": "value"}, nil)
}

func TestCaptureErrorFromGin_NilError(t *testing.T) {
	router := gin.New()
	router.Use(sentrygin.New(sentrygin.Options{}))
	router.GET("/test", func(c *gin.Context) {
		CaptureErrorFromGin(c, nil, nil)
		c.String(http.StatusOK, "ok")
	})

	req, _ := http.NewRequest("GET", "/test", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	assert.Equal(t, http.StatusOK, w.Code)
}

func TestCaptureErrorFromGin_WithError(t *testing.T) {
	router := gin.New()
	router.Use(sentrygin.New(sentrygin.Options{}))
	router.GET("/test", func(c *gin.Context) {
		c.Set("request_id", "test-123")
		err := errors.New("test error")
		CaptureErrorFromGin(c, err, map[string]string{"endpoint": "test"})
		c.String(http.StatusOK, "ok")
	})

	req, _ := http.NewRequest("GET", "/test", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	assert.Equal(t, http.StatusOK, w.Code)
}

func TestCaptureErrorFromGin_WithoutRequestID(t *testing.T) {
	router := gin.New()
	router.Use(sentrygin.New(sentrygin.Options{}))
	router.GET("/test", func(c *gin.Context) {
		err := errors.New("test error without request id")
		CaptureErrorFromGin(c, err, map[string]string{"endpoint": "test"})
		c.String(http.StatusOK, "ok")
	})

	req, _ := http.NewRequest("GET", "/test", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	assert.Equal(t, http.StatusOK, w.Code)
}

func TestCaptureErrorFromGin_WithInvalidRequestID(t *testing.T) {
	router := gin.New()
	router.Use(sentrygin.New(sentrygin.Options{}))
	router.GET("/test", func(c *gin.Context) {
		c.Set("request_id", 12345) // Not a string
		err := errors.New("test error with invalid request id")
		CaptureErrorFromGin(c, err, nil)
		c.String(http.StatusOK, "ok")
	})

	req, _ := http.NewRequest("GET", "/test", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	assert.Equal(t, http.StatusOK, w.Code)
}

func TestCaptureErrorFromGin_WithoutSentryMiddleware(t *testing.T) {
	router := gin.New()
	router.GET("/test", func(c *gin.Context) {
		err := errors.New("test error without sentry middleware")
		CaptureErrorFromGin(c, err, map[string]string{"endpoint": "test"})
		c.String(http.StatusOK, "ok")
	})

	req, _ := http.NewRequest("GET", "/test", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	assert.Equal(t, http.StatusOK, w.Code)
}

func TestCaptureMessage(_ *testing.T) {
	CaptureMessage(context.Background(), "test message", sentry.LevelInfo)
}

func TestCaptureMessage_AllLevels(t *testing.T) {
	levels := []sentry.Level{
		sentry.LevelDebug,
		sentry.LevelInfo,
		sentry.LevelWarning,
		sentry.LevelError,
		sentry.LevelFatal,
	}

	for _, level := range levels {
		t.Run(fmt.Sprintf("Level_%s", level), func(_ *testing.T) {
			CaptureMessage(context.Background(), fmt.Sprintf("test message at %s level", level), level)
		})
	}
}

func TestAddBreadcrumb(_ *testing.T) {
	AddBreadcrumb(context.Background(), "test", "test breadcrumb", map[string]interface{}{"key": "value"})
}

func TestAddBreadcrumb_WithNilData(_ *testing.T) {
	AddBreadcrumb(context.Background(), "navigation", "User clicked button", nil)
}

func TestAddBreadcrumb_WithComplexData(_ *testing.T) {
	data := map[string]interface{}{
		"user_id":    "user-123",
		"action":     "click",
		"element":    "submit_button",
		"page":       "/checkout",
		"timestamp":  1234567890,
		"is_premium": true,
	}
	AddBreadcrumb(context.Background(), "ui.interaction", "User submitted form", data)
}

func TestSetUser(_ *testing.T) {
	SetUser(context.Background(), "user-123", "test@example.com", "testuser")
}

func TestSetUser_WithEmptyFields(_ *testing.T) {
	SetUser(context.Background(), "", "", "")
}

func TestSetUser_PartialInfo(_ *testing.T) {
	SetUser(context.Background(), "user-456", "", "")
}

func TestSetUserFromGin(t *testing.T) {
	router := gin.New()
	router.Use(sentrygin.New(sentrygin.Options{}))
	router.GET("/test", func(c *gin.Context) {
		SetUserFromGin(c, "user-123", "test@example.com", "testuser")
		c.String(http.StatusOK, "ok")
	})

	req, _ := http.NewRequest("GET", "/test", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	assert.Equal(t, http.StatusOK, w.Code)
}

func TestSetUserFromGin_WithoutSentryMiddleware(t *testing.T) {
	router := gin.New()
	router.GET("/test", func(c *gin.Context) {
		SetUserFromGin(c, "user-123", "test@example.com", "testuser")
		c.String(http.StatusOK, "ok")
	})

	req, _ := http.NewRequest("GET", "/test", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	assert.Equal(t, http.StatusOK, w.Code)
}

func TestStartSpan(t *testing.T) {
	span, ctx := StartSpan(context.Background(), "test.operation", "Test description")
	assert.NotNil(t, span)
	assert.NotNil(t, ctx)
	FinishSpan(span)
}

func TestStartSpan_NestedSpans(t *testing.T) {
	parentSpan, parentCtx := StartSpan(context.Background(), "http.request", "GET /api/users")
	assert.NotNil(t, parentSpan)
	assert.NotNil(t, parentCtx)

	childSpan, childCtx := StartSpan(parentCtx, "db.query", "SELECT * FROM users")
	assert.NotNil(t, childSpan)
	assert.NotNil(t, childCtx)

	grandchildSpan, _ := StartSpan(childCtx, "cache.get", "Get user from cache")
	assert.NotNil(t, grandchildSpan)

	FinishSpan(grandchildSpan)
	FinishSpan(childSpan)
	FinishSpan(parentSpan)
}

func TestStartSpan_WithEmptyOperation(t *testing.T) {
	span, ctx := StartSpan(context.Background(), "", "")
	assert.NotNil(t, span)
	assert.NotNil(t, ctx)
	FinishSpan(span)
}

func TestFinishSpan_Nil(_ *testing.T) {
	FinishSpan(nil)
}

func TestNewMeter(t *testing.T) {
	meter := NewMeter(context.Background())
	assert.NotNil(t, meter)
}

func TestNewMeter_UseCounter(t *testing.T) {
	meter := NewMeter(context.Background())
	assert.NotNil(t, meter)
	meter.Count("test.counter", 1)
}

func TestNewMeter_UseGauge(t *testing.T) {
	meter := NewMeter(context.Background())
	assert.NotNil(t, meter)
	meter.Gauge("test.gauge", 42.5)
}

func TestNewMeter_UseDistribution(t *testing.T) {
	meter := NewMeter(context.Background())
	assert.NotNil(t, meter)
	meter.Distribution("test.distribution", 100.5)
}

func TestNewLogger(t *testing.T) {
	logger := NewLogger(context.Background())
	assert.NotNil(t, logger)
}

func TestNewLogger_EmitLogs(t *testing.T) {
	logger := NewLogger(context.Background())
	assert.NotNil(t, logger)
	logger.Info().Emit("Test info message")
	logger.Warn().Emit("Test warning message")
	logger.Error().Emit("Test error message")
}

func TestIntegration_CaptureErrorAndSetUser(t *testing.T) {
	router := gin.New()
	router.Use(sentrygin.New(sentrygin.Options{}))
	router.GET("/test", func(c *gin.Context) {
		SetUserFromGin(c, "user-123", "test@example.com", "testuser")
		err := errors.New("test error with user context")
		CaptureErrorFromGin(c, err, map[string]string{"action": "test"})
		c.String(http.StatusOK, "ok")
	})

	req, _ := http.NewRequest("GET", "/test", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	assert.Equal(t, http.StatusOK, w.Code)
}

func TestIntegration_SpanWithBreadcrumbs(_ *testing.T) {
	span, ctx := StartSpan(context.Background(), "http.request", "Process request")

	AddBreadcrumb(ctx, "validation", "Input validated", nil)
	AddBreadcrumb(ctx, "db", "Query executed", map[string]interface{}{"rows": 10})
	AddBreadcrumb(ctx, "response", "Response prepared", nil)

	FinishSpan(span)
}

func TestIntegration_CompleteFlow(t *testing.T) {
	router := gin.New()
	router.Use(sentrygin.New(sentrygin.Options{}))
	router.POST("/api/order", func(c *gin.Context) {
		SetUserFromGin(c, "user-789", "customer@example.com", "customer")

		span, ctx := StartSpan(c.Request.Context(), "order.process", "Process new order")

		AddBreadcrumb(ctx, "validation", "Order validated", nil)

		childSpan, _ := StartSpan(ctx, "db.insert", "Insert order to database")
		FinishSpan(childSpan)

		AddBreadcrumb(ctx, "notification", "Email sent", map[string]interface{}{"to": "customer@example.com"})

		FinishSpan(span)

		c.String(http.StatusOK, "ok")
	})

	req, _ := http.NewRequest("POST", "/api/order", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	assert.Equal(t, http.StatusOK, w.Code)
}
