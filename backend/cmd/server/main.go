package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"log/slog"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/imrishuroy/algopatterns/internal/config"
	"github.com/imrishuroy/algopatterns/internal/handlers"
	"github.com/imrishuroy/algopatterns/internal/metrics"
	"github.com/imrishuroy/algopatterns/internal/middleware"
	"github.com/imrishuroy/algopatterns/internal/razorpay"
	"github.com/imrishuroy/algopatterns/internal/repository"
	"github.com/imrishuroy/algopatterns/internal/services"
	"github.com/prometheus/client_golang/prometheus/promhttp"
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

	// Initialize Prometheus metrics
	metrics.Init()

	db, err := repository.NewDatabase(&cfg.Database)
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to connect to database")
	}
	defer db.Close()

	patternRepo := repository.NewPatternRepository(db)
	patternService := services.NewPatternService(patternRepo)

	userRepo := repository.NewUserRepository(db)
	sessionRepo := repository.NewSessionRepository(db)
	oauthRepo := repository.NewOAuthRepository(db)

	sessionService := services.NewSessionService(sessionRepo, userRepo, &cfg.Auth)
	authService := services.NewAuthService(userRepo, sessionService, &cfg.Auth)
	oauthService := services.NewOAuthService(oauthRepo, userRepo, sessionRepo, &cfg.GoogleOAuth, &cfg.Auth)
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

	paymentRepo := repository.NewPaymentRepository(db)
	razorpayClient := razorpay.NewClient(cfg.Razorpay.KeyID, cfg.Razorpay.KeySecret, cfg.Razorpay.WebhookSecret)
	emailService := services.NewEmailService(services.EmailConfig{
		SMTPHost:     cfg.Email.SMTPHost,
		SMTPPort:     cfg.Email.SMTPPort,
		SMTPUser:     cfg.Email.SMTPUser,
		SMTPPassword: cfg.Email.SMTPPassword,
		FromEmail:    cfg.Email.FromEmail,
		FromName:     cfg.Email.FromName,
		Enabled:      cfg.Email.Enabled,
	})
	paymentService := services.NewPaymentService(paymentRepo, userRepo, emailService, razorpayClient, cfg.Razorpay.KeyID, cfg.Razorpay.GSTRate)
	webhookService := services.NewWebhookService(paymentRepo, razorpayClient, slog.Default())
	featureAccess := services.NewFeatureAccess(paymentRepo)

	gin.SetMode(cfg.Server.Mode)
	router := setupRouter(cfg, db, patternService, authService, oauthService, sessionService, progressService, problemService, submissionService, highlightService, quizService, paymentService, webhookService, featureAccess)

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

func setupRouter(cfg *config.Config, db *repository.Database, patternService *services.PatternService, authService *services.AuthService, oauthService *services.OAuthService, sessionService *services.SessionService, progressService *services.ProgressService, problemService *services.ProblemService, submissionService *services.SubmissionService, highlightService *services.HighlightService, quizService *services.QuizService, paymentService *services.PaymentService, webhookService *services.WebhookService, featureAccess *services.FeatureAccess) *gin.Engine {
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
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Request-ID", "Idempotency-Key"},
		ExposeHeaders:    []string{"X-Request-ID", "Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	healthHandler := handlers.NewHealthHandler(db)
	healthHandler.RegisterRoutes(&router.RouterGroup)

	// Prometheus metrics endpoint
	router.GET("/metrics", gin.WrapH(promhttp.Handler()))

	authMW := middleware.NewAuthMiddleware(authService)
	secureCookie := cfg.Server.Mode == "release"

	v1 := router.Group("/api/v1")
	{
		patternHandler := handlers.NewPatternHandler(patternService, featureAccess, authMW)
		patternHandler.RegisterRoutes(v1)

		authHandler := handlers.NewAuthHandler(authService, authMW, secureCookie)
		authHandler.RegisterRoutes(v1)

		oauthHandler := handlers.NewOAuthHandler(oauthService, authService, sessionService, authMW, secureCookie)
		oauthHandler.RegisterRoutes(v1)

		progressHandler := handlers.NewProgressHandler(progressService, authMW)
		progressHandler.RegisterRoutes(v1)

		problemHandler := handlers.NewProblemHandler(problemService, featureAccess, authMW)
		problemHandler.RegisterRoutes(v1)

		submissionHandler := handlers.NewSubmissionHandler(submissionService, featureAccess, authMW)
		submissionHandler.RegisterRoutes(v1)

		highlightHandler := handlers.NewHighlightHandler(highlightService, featureAccess, authMW)
		highlightHandler.RegisterRoutes(v1)

		quizHandler := handlers.NewQuizHandler(quizService, featureAccess, authMW)
		quizHandler.RegisterRoutes(v1)

		paymentHandler := handlers.NewPaymentHandler(paymentService, webhookService, authMW)
		paymentHandler.RegisterRoutes(v1)
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
