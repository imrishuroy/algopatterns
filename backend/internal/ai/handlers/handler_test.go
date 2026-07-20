package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/imrishuroy/algopatterns/internal/ai"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func setupRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	return gin.New()
}

func setUserID(c *gin.Context, userID uuid.UUID) {
	c.Set("user_id", userID)
}

func TestNewHandler(t *testing.T) {
	h := NewHandler(nil, nil, nil)
	assert.NotNil(t, h)
}

func TestHandleError_AIDisabled(t *testing.T) {
	router := setupRouter()
	h := &Handler{}

	router.POST("/test", func(c *gin.Context) {
		h.handleError(c, ai.ErrAIDisabled)
	})

	req := httptest.NewRequest("POST", "/test", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusServiceUnavailable, w.Code)
	var resp map[string]any
	json.Unmarshal(w.Body.Bytes(), &resp)
	assert.Equal(t, false, resp["success"])
	errorObj := resp["error"].(map[string]any)
	assert.Equal(t, "AI_DISABLED", errorObj["code"])
}

func TestHandleError_RateLimited(t *testing.T) {
	router := setupRouter()
	h := &Handler{}

	router.POST("/test", func(c *gin.Context) {
		h.handleError(c, ai.ErrRateLimited)
	})

	req := httptest.NewRequest("POST", "/test", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusTooManyRequests, w.Code)
	var resp map[string]any
	json.Unmarshal(w.Body.Bytes(), &resp)
	errorObj := resp["error"].(map[string]any)
	assert.Equal(t, "AI_RATE_LIMITED", errorObj["code"])
}

func TestHandleError_CodeTooLong(t *testing.T) {
	router := setupRouter()
	h := &Handler{}

	router.POST("/test", func(c *gin.Context) {
		h.handleError(c, ai.ErrCodeTooLong)
	})

	req := httptest.NewRequest("POST", "/test", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
	var resp map[string]any
	json.Unmarshal(w.Body.Bytes(), &resp)
	errorObj := resp["error"].(map[string]any)
	assert.Equal(t, "AI_CODE_TOO_LONG", errorObj["code"])
}

func TestHandleError_InvalidRequest(t *testing.T) {
	router := setupRouter()
	h := &Handler{}

	router.POST("/test", func(c *gin.Context) {
		h.handleError(c, ai.ErrInvalidRequest)
	})

	req := httptest.NewRequest("POST", "/test", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestHandleError_GenericError(t *testing.T) {
	router := setupRouter()
	h := &Handler{}

	router.POST("/test", func(c *gin.Context) {
		h.handleError(c, assert.AnError)
	})

	req := httptest.NewRequest("POST", "/test", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusInternalServerError, w.Code)
	var resp map[string]any
	json.Unmarshal(w.Body.Bytes(), &resp)
	errorObj := resp["error"].(map[string]any)
	assert.Equal(t, "AI_ERROR", errorObj["code"])
}

func TestChat_InvalidBody(t *testing.T) {
	router := setupRouter()
	h := &Handler{}

	router.POST("/chat", func(c *gin.Context) {
		setUserID(c, uuid.New())
		h.Chat(c)
	})

	req := httptest.NewRequest("POST", "/chat", bytes.NewBufferString(`{invalid`))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestChat_MissingUserID(t *testing.T) {
	router := setupRouter()
	h := &Handler{}

	router.POST("/chat", h.Chat)

	body := ChatRequestBody{Message: "hello"}
	bodyBytes, _ := json.Marshal(body)
	req := httptest.NewRequest("POST", "/chat", bytes.NewBuffer(bodyBytes))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestChatStream_InvalidBody(t *testing.T) {
	router := setupRouter()
	h := &Handler{}

	router.POST("/chat/stream", func(c *gin.Context) {
		setUserID(c, uuid.New())
		h.ChatStream(c)
	})

	req := httptest.NewRequest("POST", "/chat/stream", bytes.NewBufferString(`{invalid`))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestChatStream_MissingUserID(t *testing.T) {
	router := setupRouter()
	h := &Handler{}

	router.POST("/chat/stream", h.ChatStream)

	body := ChatRequestBody{Message: "hello"}
	bodyBytes, _ := json.Marshal(body)
	req := httptest.NewRequest("POST", "/chat/stream", bytes.NewBuffer(bodyBytes))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestHandleHint_InvalidBody(t *testing.T) {
	router := setupRouter()
	h := &Handler{}

	router.POST("/hint", h.HandleHint)

	req := httptest.NewRequest("POST", "/hint", bytes.NewBufferString(`{invalid`))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestHandleHint_MissingRequired(t *testing.T) {
	router := setupRouter()
	h := &Handler{}

	router.POST("/hint", h.HandleHint)

	body := map[string]string{}
	bodyBytes, _ := json.Marshal(body)
	req := httptest.NewRequest("POST", "/hint", bytes.NewBuffer(bodyBytes))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestReviewCode_InvalidBody(t *testing.T) {
	router := setupRouter()
	h := &Handler{}

	router.POST("/review", h.ReviewCode)

	req := httptest.NewRequest("POST", "/review", bytes.NewBufferString(`{invalid`))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestReviewCode_MissingRequired(t *testing.T) {
	router := setupRouter()
	h := &Handler{}

	router.POST("/review", h.ReviewCode)

	body := map[string]string{"problem_slug": "test"}
	bodyBytes, _ := json.Marshal(body)
	req := httptest.NewRequest("POST", "/review", bytes.NewBuffer(bodyBytes))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestExplainError_InvalidBody(t *testing.T) {
	router := setupRouter()
	h := &Handler{}

	router.POST("/explain", h.ExplainError)

	req := httptest.NewRequest("POST", "/explain", bytes.NewBufferString(`{invalid`))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestExplainError_MissingRequired(t *testing.T) {
	router := setupRouter()
	h := &Handler{}

	router.POST("/explain", h.ExplainError)

	body := map[string]string{"code": "test"}
	bodyBytes, _ := json.Marshal(body)
	req := httptest.NewRequest("POST", "/explain", bytes.NewBuffer(bodyBytes))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestListSessions_MissingUserID(t *testing.T) {
	router := setupRouter()
	h := &Handler{}

	router.GET("/sessions", h.ListSessions)

	req := httptest.NewRequest("GET", "/sessions", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestListSessionMessages_MissingUserID(t *testing.T) {
	router := setupRouter()
	h := &Handler{}

	router.GET("/sessions/:sessionId/messages", h.ListSessionMessages)

	req := httptest.NewRequest("GET", "/sessions/123/messages", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestListSessionMessages_MissingSessionID(t *testing.T) {
	router := setupRouter()
	h := &Handler{}

	router.GET("/test-empty-session", func(c *gin.Context) {
		setUserID(c, uuid.New())
		c.Params = gin.Params{{Key: "sessionId", Value: ""}}
		h.ListSessionMessages(c)
	})

	req := httptest.NewRequest("GET", "/test-empty-session", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestClearSession_MissingUserID(t *testing.T) {
	router := setupRouter()
	h := &Handler{}

	router.DELETE("/sessions/:sessionId/messages", h.ClearSession)

	req := httptest.NewRequest("DELETE", "/sessions/123/messages", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestClearSession_MissingSessionID(t *testing.T) {
	router := setupRouter()
	h := &Handler{}

	router.DELETE("/test-clear-empty", func(c *gin.Context) {
		setUserID(c, uuid.New())
		c.Params = gin.Params{{Key: "sessionId", Value: ""}}
		h.ClearSession(c)
	})

	req := httptest.NewRequest("DELETE", "/test-clear-empty", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestDeleteSession_MissingUserID(t *testing.T) {
	router := setupRouter()
	h := &Handler{}

	router.DELETE("/sessions/:sessionId", h.DeleteSession)

	req := httptest.NewRequest("DELETE", "/sessions/123", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestDeleteSession_MissingSessionID(t *testing.T) {
	router := setupRouter()
	h := &Handler{}

	router.DELETE("/sessions/", func(c *gin.Context) {
		setUserID(c, uuid.New())
		c.Params = gin.Params{{Key: "sessionId", Value: ""}}
		h.DeleteSession(c)
	})

	req := httptest.NewRequest("DELETE", "/sessions/", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestArchiveSession_MissingUserID(t *testing.T) {
	router := setupRouter()
	h := &Handler{}

	router.POST("/sessions/:sessionId/archive", h.ArchiveSession)

	req := httptest.NewRequest("POST", "/sessions/123/archive", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestArchiveSession_MissingSessionID(t *testing.T) {
	router := setupRouter()
	h := &Handler{}

	router.POST("/test-archive-empty", func(c *gin.Context) {
		setUserID(c, uuid.New())
		c.Params = gin.Params{{Key: "sessionId", Value: ""}}
		h.ArchiveSession(c)
	})

	req := httptest.NewRequest("POST", "/test-archive-empty", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestUpdateSessionTitle_MissingUserID(t *testing.T) {
	router := setupRouter()
	h := &Handler{}

	router.PATCH("/sessions/:sessionId/title", h.UpdateSessionTitle)

	body := map[string]string{"title": "New Title"}
	bodyBytes, _ := json.Marshal(body)
	req := httptest.NewRequest("PATCH", "/sessions/123/title", bytes.NewBuffer(bodyBytes))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestUpdateSessionTitle_MissingSessionID(t *testing.T) {
	router := setupRouter()
	h := &Handler{}

	router.PATCH("/test-title-empty", func(c *gin.Context) {
		setUserID(c, uuid.New())
		c.Params = gin.Params{{Key: "sessionId", Value: ""}}
		h.UpdateSessionTitle(c)
	})

	body := map[string]string{"title": "New Title"}
	bodyBytes, _ := json.Marshal(body)
	req := httptest.NewRequest("PATCH", "/test-title-empty", bytes.NewBuffer(bodyBytes))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestUpdateSessionTitle_MissingTitle(t *testing.T) {
	router := setupRouter()
	h := &Handler{}

	router.PATCH("/sessions/:sessionId/title", func(c *gin.Context) {
		setUserID(c, uuid.New())
		h.UpdateSessionTitle(c)
	})

	body := map[string]string{}
	bodyBytes, _ := json.Marshal(body)
	req := httptest.NewRequest("PATCH", "/sessions/123/title", bytes.NewBuffer(bodyBytes))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestGenerateTitle_MissingUserID(t *testing.T) {
	router := setupRouter()
	h := &Handler{}

	router.POST("/sessions/generate-title", h.GenerateTitle)

	body := map[string]any{"messages": []map[string]string{{"role": "user", "content": "hi"}}}
	bodyBytes, _ := json.Marshal(body)
	req := httptest.NewRequest("POST", "/sessions/generate-title", bytes.NewBuffer(bodyBytes))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestGenerateTitle_InvalidBody(t *testing.T) {
	router := setupRouter()
	h := &Handler{}

	router.POST("/sessions/generate-title", func(c *gin.Context) {
		setUserID(c, uuid.New())
		h.GenerateTitle(c)
	})

	req := httptest.NewRequest("POST", "/sessions/generate-title", bytes.NewBufferString(`{invalid`))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestListArchivedSessions_MissingUserID(t *testing.T) {
	router := setupRouter()
	h := &Handler{}

	router.GET("/sessions/archived", h.ListArchivedSessions)

	req := httptest.NewRequest("GET", "/sessions/archived?problem_slug=test", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestListArchivedSessions_MissingQueryParams(t *testing.T) {
	router := setupRouter()
	h := &Handler{}

	router.GET("/sessions/archived", func(c *gin.Context) {
		setUserID(c, uuid.New())
		h.ListArchivedSessions(c)
	})

	req := httptest.NewRequest("GET", "/sessions/archived", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestRequestBodies_JSONRoundTrip(t *testing.T) {
	t.Run("ChatRequestBody", func(t *testing.T) {
		body := ChatRequestBody{
			Message:     "test",
			ContextType: "problem",
		}
		data, err := json.Marshal(body)
		require.NoError(t, err)
		assert.Contains(t, string(data), `"message":"test"`)
		assert.Contains(t, string(data), `"context_type":"problem"`)
	})

	t.Run("HintRequestBody", func(t *testing.T) {
		body := HintRequestBody{
			ProblemSlug: "two-sum",
			Language:    "python",
			HintLevel:   1,
		}
		data, err := json.Marshal(body)
		require.NoError(t, err)
		assert.Contains(t, string(data), `"problem_slug":"two-sum"`)
		assert.Contains(t, string(data), `"hint_level":1`)
	})

	t.Run("ReviewRequestBody", func(t *testing.T) {
		body := ReviewRequestBody{
			ProblemSlug: "two-sum",
			Code:        "code",
			Language:    "python",
		}
		data, err := json.Marshal(body)
		require.NoError(t, err)
		assert.Contains(t, string(data), `"problem_slug":"two-sum"`)
		assert.Contains(t, string(data), `"code":"code"`)
	})

	t.Run("ExplainRequestBody", func(t *testing.T) {
		body := ExplainRequestBody{
			Code:         "code",
			Language:     "python",
			ErrorMessage: "error",
		}
		data, err := json.Marshal(body)
		require.NoError(t, err)
		assert.Contains(t, string(data), `"error_message":"error"`)
	})

	t.Run("ArchiveSessionBody", func(t *testing.T) {
		body := ArchiveSessionBody{
			Title: "My Chat",
		}
		data, err := json.Marshal(body)
		require.NoError(t, err)
		assert.Contains(t, string(data), `"title":"My Chat"`)
	})
}
