package middleware

import (
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
