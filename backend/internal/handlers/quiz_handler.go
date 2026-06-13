package handlers

import (
	"errors"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/imrishuroy/algopatterns/internal/middleware"
	"github.com/imrishuroy/algopatterns/internal/models"
	"github.com/imrishuroy/algopatterns/internal/services"
	"github.com/imrishuroy/algopatterns/pkg/response"
	"github.com/rs/zerolog/log"
)

type QuizHandler struct {
	service       services.QuizServiceInterface
	featureAccess *services.FeatureAccess
	authMW        *middleware.AuthMiddleware
}

func NewQuizHandler(service services.QuizServiceInterface, featureAccess *services.FeatureAccess, authMW *middleware.AuthMiddleware) *QuizHandler {
	return &QuizHandler{
		service:       service,
		featureAccess: featureAccess,
		authMW:        authMW,
	}
}

func (h *QuizHandler) RegisterRoutes(rg *gin.RouterGroup) {
	quiz := rg.Group("/quiz")
	{
		// Public endpoints (work for both authenticated and anonymous users)
		quiz.GET("/questions/:patternId", h.ListQuestions)
		quiz.POST("/attempts", h.StartAttempt)
		quiz.POST("/attempts/:attemptId/responses", h.SubmitResponse)
		quiz.PATCH("/attempts/:attemptId/complete", h.CompleteAttempt)
		quiz.GET("/attempts/:attemptId", h.ShowAttempt)

		// Authenticated endpoints
		authenticated := quiz.Group("")
		authenticated.Use(h.authMW.RequireAuth())
		{
			authenticated.GET("/attempts", h.ListAttemptHistory)
		}
	}
}

// ListQuestions returns all questions for a pattern (without answers)
func (h *QuizHandler) ListQuestions(c *gin.Context) {
	patternID := c.Param("patternId")
	if patternID == "" {
		response.BadRequest(c, "Pattern ID is required", nil)
		return
	}

	var sectionSlug *string
	if s := c.Query("section"); s != "" {
		sectionSlug = &s
	}

	result, err := h.service.GetQuestions(c.Request.Context(), patternID, sectionSlug)
	if err != nil {
		log.Error().Err(err).Str("patternId", patternID).Msg("Failed to get questions")
		response.InternalError(c)
		return
	}

	// Check subscription status and limit questions for free users
	var userID string
	if uid, ok := middleware.GetUserID(c); ok {
		userID = uid.String()
	}

	features, isPro, err := h.featureAccess.GetUserFeatures(c.Request.Context(), userID)
	if err != nil {
		log.Error().Err(err).Msg("Failed to get user features")
		response.InternalError(c)
		return
	}

	// Limit questions for free users
	if !isPro && features.QuizQuestionsPerPattern > 0 && len(result.Questions) > features.QuizQuestionsPerPattern {
		result.Questions = result.Questions[:features.QuizQuestionsPerPattern]
		result.TotalQuestions = len(result.Questions)
		result.IsLimited = true
		result.LimitReason = "Upgrade to Pro to access all quiz questions"
	}

	response.OK(c, result)
}

// StartAttempt creates a new quiz attempt
func (h *QuizHandler) StartAttempt(c *gin.Context) {
	// Get user ID if authenticated (optional)
	var userID *uuid.UUID
	if uid, ok := middleware.GetUserID(c); ok {
		userID = &uid
	}

	var req models.StartAttemptRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]string{"error": err.Error()})
		return
	}

	result, err := h.service.StartAttempt(c.Request.Context(), userID, &req)
	if err != nil {
		log.Error().Err(err).Msg("Failed to start attempt")
		response.InternalError(c)
		return
	}

	response.Created(c, result)
}

// SubmitResponse validates and stores a user's answer
func (h *QuizHandler) SubmitResponse(c *gin.Context) {
	attemptIDStr := c.Param("attemptId")
	attemptID, err := uuid.Parse(attemptIDStr)
	if err != nil {
		response.BadRequest(c, "Invalid attempt ID", nil)
		return
	}

	// Get user ID if authenticated (optional)
	var userID *uuid.UUID
	if uid, ok := middleware.GetUserID(c); ok {
		userID = &uid
	}

	var req models.SubmitResponseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]string{"error": err.Error()})
		return
	}

	result, err := h.service.SubmitResponse(c.Request.Context(), attemptID, userID, &req)
	if err != nil {
		if errors.Is(err, services.ErrAttemptNotFound) {
			response.NotFound(c, "Attempt")
			return
		}
		if errors.Is(err, services.ErrQuestionNotFound) {
			response.NotFound(c, "Question")
			return
		}
		if errors.Is(err, services.ErrResponseAlreadyExists) {
			response.Conflict(c, "Response already submitted for this question")
			return
		}
		if errors.Is(err, services.ErrAttemptAlreadyCompleted) {
			response.Conflict(c, "Attempt is already completed")
			return
		}
		if errors.Is(err, services.ErrUnauthorizedAttempt) {
			response.Forbidden(c, "Not authorized to access this attempt")
			return
		}
		log.Error().Err(err).Msg("Failed to submit response")
		response.InternalError(c)
		return
	}

	response.OK(c, result)
}

// CompleteAttempt marks an attempt as completed
func (h *QuizHandler) CompleteAttempt(c *gin.Context) {
	attemptIDStr := c.Param("attemptId")
	attemptID, err := uuid.Parse(attemptIDStr)
	if err != nil {
		response.BadRequest(c, "Invalid attempt ID", nil)
		return
	}

	// Get user ID if authenticated (optional)
	var userID *uuid.UUID
	if uid, ok := middleware.GetUserID(c); ok {
		userID = &uid
	}

	var req models.CompleteAttemptRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		// Allow empty body
		req = models.CompleteAttemptRequest{}
	}

	result, err := h.service.CompleteAttempt(c.Request.Context(), attemptID, userID, &req)
	if err != nil {
		if errors.Is(err, services.ErrAttemptNotFound) {
			response.NotFound(c, "Attempt")
			return
		}
		if errors.Is(err, services.ErrAttemptAlreadyCompleted) {
			response.Conflict(c, "Attempt is already completed")
			return
		}
		if errors.Is(err, services.ErrUnauthorizedAttempt) {
			response.Forbidden(c, "Not authorized to access this attempt")
			return
		}
		log.Error().Err(err).Msg("Failed to complete attempt")
		response.InternalError(c)
		return
	}

	response.OK(c, result)
}

// ShowAttempt returns a specific attempt
func (h *QuizHandler) ShowAttempt(c *gin.Context) {
	attemptIDStr := c.Param("attemptId")
	attemptID, err := uuid.Parse(attemptIDStr)
	if err != nil {
		response.BadRequest(c, "Invalid attempt ID", nil)
		return
	}

	// Get user ID if authenticated (optional)
	var userID *uuid.UUID
	if uid, ok := middleware.GetUserID(c); ok {
		userID = &uid
	}

	result, err := h.service.GetAttemptByID(c.Request.Context(), attemptID, userID)
	if err != nil {
		if errors.Is(err, services.ErrAttemptNotFound) {
			response.NotFound(c, "Attempt")
			return
		}
		if errors.Is(err, services.ErrUnauthorizedAttempt) {
			response.Forbidden(c, "Not authorized to access this attempt")
			return
		}
		log.Error().Err(err).Msg("Failed to get attempt")
		response.InternalError(c)
		return
	}

	response.OK(c, result)
}

// ListAttemptHistory returns user's quiz history (requires authentication)
func (h *QuizHandler) ListAttemptHistory(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "Not authenticated")
		return
	}

	// Check if user has access to quiz history
	canAccess, err := h.featureAccess.CanAccessQuizHistory(c.Request.Context(), userID.String())
	if err != nil {
		log.Error().Err(err).Msg("Failed to check feature access")
		response.InternalError(c)
		return
	}
	if !canAccess {
		response.Forbidden(c, "Upgrade to Pro to access quiz history")
		return
	}

	var req models.AttemptHistoryRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		response.ValidationError(c, map[string]string{"error": err.Error()})
		return
	}

	result, err := h.service.GetAttemptHistory(c.Request.Context(), userID, &req)
	if err != nil {
		log.Error().Err(err).Msg("Failed to get attempt history")
		response.InternalError(c)
		return
	}

	response.OK(c, result)
}
