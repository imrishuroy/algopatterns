package middleware

import (
	"errors"
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

func TestSentryMiddleware_WithRecovery_NoPanic(t *testing.T) {
	router := gin.New()
	router.Use(sentrygin.New(sentrygin.Options{Repanic: true}))
	router.Use(Recovery())
	router.GET("/test", func(c *gin.Context) {
		c.String(http.StatusOK, "ok")
	})

	req, _ := http.NewRequest("GET", "/test", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}

func TestSentryMiddleware_WithRecovery_HandlesPanic(t *testing.T) {
	router := gin.New()
	router.Use(sentrygin.New(sentrygin.Options{Repanic: true}))
	router.Use(Recovery())
	router.GET("/test", func(_ *gin.Context) {
		panic("sentry test panic")
	})

	req, _ := http.NewRequest("GET", "/test", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusInternalServerError, w.Code)
}

func TestSentryMiddleware_WithRecovery_HandlesPanicWithError(t *testing.T) {
	router := gin.New()
	router.Use(sentrygin.New(sentrygin.Options{Repanic: true}))
	router.Use(Recovery())
	router.GET("/test", func(_ *gin.Context) {
		panic(errors.New("error panic"))
	})

	req, _ := http.NewRequest("GET", "/test", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusInternalServerError, w.Code)
}

func TestSentryMiddleware_WithRecovery_HandlesPanicWithRequestID(t *testing.T) {
	router := gin.New()
	router.Use(RequestID())
	router.Use(sentrygin.New(sentrygin.Options{Repanic: true}))
	router.Use(Recovery())
	router.GET("/test", func(_ *gin.Context) {
		panic("panic with request id")
	})

	req, _ := http.NewRequest("GET", "/test", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusInternalServerError, w.Code)
	assert.NotEmpty(t, w.Header().Get("X-Request-ID"))
}

func TestSentryMiddleware_WithRecovery_WithExistingRequestID(t *testing.T) {
	router := gin.New()
	router.Use(RequestID())
	router.Use(sentrygin.New(sentrygin.Options{Repanic: true}))
	router.Use(Recovery())
	router.GET("/test", func(_ *gin.Context) {
		panic("panic with existing request id")
	})

	req, _ := http.NewRequest("GET", "/test", nil)
	req.Header.Set("X-Request-ID", "custom-request-id-123")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusInternalServerError, w.Code)
	assert.Equal(t, "custom-request-id-123", w.Header().Get("X-Request-ID"))
}

func TestSentryMiddleware_HubAvailableInHandler(t *testing.T) {
	router := gin.New()
	router.Use(sentrygin.New(sentrygin.Options{Repanic: true}))
	router.Use(Recovery())

	var hubAvailable bool
	router.GET("/test", func(c *gin.Context) {
		hub := sentrygin.GetHubFromContext(c)
		hubAvailable = hub != nil
		c.String(http.StatusOK, "ok")
	})

	req, _ := http.NewRequest("GET", "/test", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.True(t, hubAvailable, "sentry hub should be available in handler")
}

func TestSentryMiddleware_HubNotAvailableBeforeMiddleware(t *testing.T) {
	router := gin.New()

	var hubAvailable bool
	router.GET("/test", func(c *gin.Context) {
		hub := sentrygin.GetHubFromContext(c)
		hubAvailable = hub != nil
		c.String(http.StatusOK, "ok")
	})

	req, _ := http.NewRequest("GET", "/test", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.False(t, hubAvailable, "sentry hub should not be available without sentrygin middleware")
}

func TestSentryMiddleware_RepanicTrue(t *testing.T) {
	router := gin.New()
	router.Use(sentrygin.New(sentrygin.Options{Repanic: true}))
	router.Use(Recovery())
	router.GET("/test", func(_ *gin.Context) {
		panic("test repanic")
	})

	req, _ := http.NewRequest("GET", "/test", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusInternalServerError, w.Code)
}

func TestSentryMiddleware_SetsTagOnHub(t *testing.T) {
	router := gin.New()
	router.Use(sentrygin.New(sentrygin.Options{Repanic: true}))
	router.Use(Recovery())

	var tagSet bool
	router.GET("/test", func(c *gin.Context) {
		hub := sentrygin.GetHubFromContext(c)
		if hub != nil {
			hub.Scope().SetTag("test_tag", "test_value")
			tagSet = true
		}
		c.String(http.StatusOK, "ok")
	})

	req, _ := http.NewRequest("GET", "/test", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.True(t, tagSet, "tag should be settable on sentry hub")
}

func TestSentryMiddleware_SetUserOnHub(t *testing.T) {
	router := gin.New()
	router.Use(sentrygin.New(sentrygin.Options{Repanic: true}))
	router.Use(Recovery())

	var userSet bool
	router.GET("/test", func(c *gin.Context) {
		hub := sentrygin.GetHubFromContext(c)
		if hub != nil {
			hub.Scope().SetUser(sentry.User{
				ID:       "user-123",
				Email:    "test@example.com",
				Username: "testuser",
			})
			userSet = true
		}
		c.String(http.StatusOK, "ok")
	})

	req, _ := http.NewRequest("GET", "/test", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.True(t, userSet, "user should be settable on sentry hub")
}

func TestSentryMiddleware_SetContextOnHub(t *testing.T) {
	router := gin.New()
	router.Use(sentrygin.New(sentrygin.Options{Repanic: true}))
	router.Use(Recovery())

	var contextSet bool
	router.GET("/test", func(c *gin.Context) {
		hub := sentrygin.GetHubFromContext(c)
		if hub != nil {
			hub.Scope().SetContext("custom", sentry.Context{
				"key": "value",
			})
			contextSet = true
		}
		c.String(http.StatusOK, "ok")
	})

	req, _ := http.NewRequest("GET", "/test", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.True(t, contextSet, "context should be settable on sentry hub")
}

func TestSentryMiddleware_AddBreadcrumb(t *testing.T) {
	router := gin.New()
	router.Use(sentrygin.New(sentrygin.Options{Repanic: true}))
	router.Use(Recovery())

	var breadcrumbAdded bool
	router.GET("/test", func(c *gin.Context) {
		hub := sentrygin.GetHubFromContext(c)
		if hub != nil {
			hub.AddBreadcrumb(&sentry.Breadcrumb{
				Category: "test",
				Message:  "test breadcrumb",
				Level:    sentry.LevelInfo,
			}, nil)
			breadcrumbAdded = true
		}
		c.String(http.StatusOK, "ok")
	})

	req, _ := http.NewRequest("GET", "/test", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.True(t, breadcrumbAdded, "breadcrumb should be addable on sentry hub")
}

func TestSentryMiddleware_CaptureMessage(t *testing.T) {
	router := gin.New()
	router.Use(sentrygin.New(sentrygin.Options{Repanic: true}))
	router.Use(Recovery())

	var messageCaptured bool
	router.GET("/test", func(c *gin.Context) {
		hub := sentrygin.GetHubFromContext(c)
		if hub != nil {
			hub.CaptureMessage("test message")
			messageCaptured = true
		}
		c.String(http.StatusOK, "ok")
	})

	req, _ := http.NewRequest("GET", "/test", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.True(t, messageCaptured, "message should be capturable on sentry hub")
}

func TestSentryMiddleware_CaptureException(t *testing.T) {
	router := gin.New()
	router.Use(sentrygin.New(sentrygin.Options{Repanic: true}))
	router.Use(Recovery())

	var exceptionCaptured bool
	router.GET("/test", func(c *gin.Context) {
		hub := sentrygin.GetHubFromContext(c)
		if hub != nil {
			hub.CaptureException(errors.New("test exception"))
			exceptionCaptured = true
		}
		c.String(http.StatusOK, "ok")
	})

	req, _ := http.NewRequest("GET", "/test", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.True(t, exceptionCaptured, "exception should be capturable on sentry hub")
}

func TestSentryMiddleware_WithScope(t *testing.T) {
	router := gin.New()
	router.Use(sentrygin.New(sentrygin.Options{Repanic: true}))
	router.Use(Recovery())

	var scopeUsed bool
	router.GET("/test", func(c *gin.Context) {
		hub := sentrygin.GetHubFromContext(c)
		if hub != nil {
			hub.WithScope(func(scope *sentry.Scope) {
				scope.SetTag("scoped_tag", "scoped_value")
				scope.SetLevel(sentry.LevelWarning)
				hub.CaptureMessage("scoped message")
				scopeUsed = true
			})
		}
		c.String(http.StatusOK, "ok")
	})

	req, _ := http.NewRequest("GET", "/test", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.True(t, scopeUsed, "scope should be usable on sentry hub")
}

func TestSentryMiddleware_RecoveryWithoutSentryMiddleware(t *testing.T) {
	router := gin.New()
	router.Use(Recovery())
	router.GET("/test", func(_ *gin.Context) {
		panic("panic without sentry middleware")
	})

	req, _ := http.NewRequest("GET", "/test", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusInternalServerError, w.Code)
}

func TestSentryMiddleware_DifferentHTTPMethods(t *testing.T) {
	methods := []string{"GET", "POST", "PUT", "PATCH", "DELETE"}

	for _, method := range methods {
		t.Run(method, func(t *testing.T) {
			router := gin.New()
			router.Use(sentrygin.New(sentrygin.Options{Repanic: true}))
			router.Use(Recovery())
			router.Handle(method, "/test", func(_ *gin.Context) {
				panic("panic in " + method)
			})

			req, _ := http.NewRequest(method, "/test", nil)
			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			assert.Equal(t, http.StatusInternalServerError, w.Code)
		})
	}
}

func TestSentryMiddleware_WithQueryParams(t *testing.T) {
	router := gin.New()
	router.Use(sentrygin.New(sentrygin.Options{Repanic: true}))
	router.Use(Recovery())

	var hubAvailable bool
	router.GET("/test", func(c *gin.Context) {
		hub := sentrygin.GetHubFromContext(c)
		hubAvailable = hub != nil
		c.String(http.StatusOK, "ok")
	})

	req, _ := http.NewRequest("GET", "/test?foo=bar&baz=qux", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.True(t, hubAvailable)
}

func TestSentryMiddleware_WithHeaders(t *testing.T) {
	router := gin.New()
	router.Use(sentrygin.New(sentrygin.Options{Repanic: true}))
	router.Use(Recovery())

	var hubAvailable bool
	router.GET("/test", func(c *gin.Context) {
		hub := sentrygin.GetHubFromContext(c)
		hubAvailable = hub != nil
		c.String(http.StatusOK, "ok")
	})

	req, _ := http.NewRequest("GET", "/test", nil)
	req.Header.Set("Authorization", "Bearer token")
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Custom-Header", "custom-value")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.True(t, hubAvailable)
}
