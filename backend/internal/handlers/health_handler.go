package handlers

import (
	"context"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/imrishuroy/algopatterns/internal/repository"
	"github.com/imrishuroy/algopatterns/pkg/response"
)

type HealthHandler struct {
	db *repository.Database
}

func NewHealthHandler(db *repository.Database) *HealthHandler {
	return &HealthHandler{db: db}
}

func (h *HealthHandler) RegisterRoutes(rg *gin.RouterGroup) {
	rg.GET("/health", h.Health)
	rg.GET("/health/live", h.Live)
	rg.GET("/health/ready", h.Ready)
}

type HealthResponse struct {
	Status    string            `json:"status"`
	Timestamp string            `json:"timestamp"`
	Version   string            `json:"version"`
	Checks    map[string]string `json:"checks,omitempty"`
}

func (h *HealthHandler) Health(c *gin.Context) {
	checks := make(map[string]string)

	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	if err := h.db.Health(ctx); err != nil {
		checks["database"] = "unhealthy: " + err.Error()
	} else {
		checks["database"] = "healthy"
	}

	status := "healthy"
	for _, v := range checks {
		if v != "healthy" {
			status = "degraded"
			break
		}
	}

	response.OK(c, HealthResponse{
		Status:    status,
		Timestamp: time.Now().Format(time.RFC3339),
		Version:   "1.0.0",
		Checks:    checks,
	})
}

func (*HealthHandler) Live(c *gin.Context) {
	response.OK(c, HealthResponse{
		Status:    "alive",
		Timestamp: time.Now().Format(time.RFC3339),
		Version:   "1.0.0",
	})
}

func (h *HealthHandler) Ready(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	if err := h.db.Health(ctx); err != nil {
		c.JSON(503, HealthResponse{
			Status:    "not ready",
			Timestamp: time.Now().Format(time.RFC3339),
			Version:   "1.0.0",
			Checks:    map[string]string{"database": err.Error()},
		})
		return
	}

	response.OK(c, HealthResponse{
		Status:    "ready",
		Timestamp: time.Now().Format(time.RFC3339),
		Version:   "1.0.0",
	})
}
