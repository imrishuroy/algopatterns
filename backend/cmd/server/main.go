package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/imrishuroy/algopatterns/internal/config"
	"github.com/imrishuroy/algopatterns/internal/handlers"
	"github.com/imrishuroy/algopatterns/internal/middleware"
	"github.com/imrishuroy/algopatterns/internal/repository"
	"github.com/imrishuroy/algopatterns/internal/services"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

func main() {
	fmt.Println("Starting AlgoPatterns API server.....")

	cfg, err := config.Load()
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to load configuration")
	}

	setupLogger(cfg.Logging)

	log.Info().Msg("Starting FANGReady API Server...")

	db, err := repository.NewDatabase(&cfg.Database)
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to connect to database")
	}
	defer db.Close()

	patternRepo := repository.NewPatternRepository(db)
	patternService := services.NewPatternService(patternRepo)

	userRepo := repository.NewUserRepository(db)
	authService := services.NewAuthService(userRepo, &cfg.Auth)
	progressService := services.NewProgressService(userRepo)

	problemRepo := repository.NewProblemRepository(db)
	submissionRepo := repository.NewSubmissionRepository(db)
	judgeService := services.NewJudgeService(&cfg.Judge0)
	problemService := services.NewProblemService(problemRepo, submissionRepo)
	submissionService := services.NewSubmissionService(submissionRepo, problemRepo, judgeService)

	highlightRepo := repository.NewHighlightRepository(db)
	highlightService := services.NewHighlightService(highlightRepo)

	quizRepo := repository.NewQuizRepository(db)
	quizService := services.NewQuizService(quizRepo)

	gin.SetMode(cfg.Server.Mode)
	router := setupRouter(cfg, db, patternService, authService, progressService, problemService, submissionService, highlightService, quizService)

	srv := &http.Server{
		Addr:         fmt.Sprintf("%s:%s", cfg.Server.Host, cfg.Server.Port),
		Handler:      router,
		ReadTimeout:  cfg.Server.ReadTimeout,
		WriteTimeout: cfg.Server.WriteTimeout,
		IdleTimeout:  120 * time.Second,
	}

	go func() {
		log.Info().
			Str("host", cfg.Server.Host).
			Str("port", cfg.Server.Port).
			Str("mode", cfg.Server.Mode).
			Msg("Server started")

		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal().Err(err).Msg("Failed to start server")
		}
	}()

	gracefulShutdown(srv, cfg.Server.ShutdownTimeout)
}

func setupLogger(cfg config.LoggingConfig) {
	level, err := zerolog.ParseLevel(cfg.Level)
	if err != nil {
		level = zerolog.InfoLevel
	}
	zerolog.SetGlobalLevel(level)

	if cfg.Format == "console" {
		log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stdout, TimeFormat: time.RFC3339})
	} else {
		zerolog.TimeFieldFormat = time.RFC3339
	}
}

func setupRouter(cfg *config.Config, db *repository.Database, patternService *services.PatternService, authService *services.AuthService, progressService *services.ProgressService, problemService *services.ProblemService, submissionService *services.SubmissionService, highlightService *services.HighlightService, quizService *services.QuizService) *gin.Engine {
	router := gin.New()

	rateLimiter := middleware.NewRateLimiter(cfg.Server.RateLimitRPS, cfg.Server.RateLimitBurst)

	router.Use(middleware.Recovery())
	router.Use(middleware.RequestID())
	router.Use(middleware.Logger())
	router.Use(rateLimiter.Middleware())
	router.Use(middleware.SecurityHeaders())

	router.Use(cors.New(cors.Config{
		AllowOrigins:     cfg.Server.AllowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Request-ID"},
		ExposeHeaders:    []string{"X-Request-ID", "Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	healthHandler := handlers.NewHealthHandler(db)
	healthHandler.RegisterRoutes(&router.RouterGroup)

	authMW := middleware.NewAuthMiddleware(authService)
	secureCookie := cfg.Server.Mode == "release"

	v1 := router.Group("/api/v1")
	{
		patternHandler := handlers.NewPatternHandler(patternService)
		patternHandler.RegisterRoutes(v1)

		authHandler := handlers.NewAuthHandler(authService, authMW, secureCookie)
		authHandler.RegisterRoutes(v1)

		progressHandler := handlers.NewProgressHandler(progressService, authMW)
		progressHandler.RegisterRoutes(v1)

		problemHandler := handlers.NewProblemHandler(problemService, authMW)
		problemHandler.RegisterRoutes(v1)

		submissionHandler := handlers.NewSubmissionHandler(submissionService, authMW)
		submissionHandler.RegisterRoutes(v1)

		highlightHandler := handlers.NewHighlightHandler(highlightService, authMW)
		highlightHandler.RegisterRoutes(v1)

		quizHandler := handlers.NewQuizHandler(quizService, authMW)
		quizHandler.RegisterRoutes(v1)
	}

	router.NoRoute(func(c *gin.Context) {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "NOT_FOUND",
				"message": "The requested resource was not found",
			},
		})
	})

	return router
}

func gracefulShutdown(srv *http.Server, timeout time.Duration) {
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	<-quit
	log.Info().Msg("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Error().Err(err).Msg("Server forced to shutdown")
	}

	log.Info().Msg("Server exited")
}
