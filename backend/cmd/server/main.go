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

	"github.com/getsentry/sentry-go"
	sentrygin "github.com/getsentry/sentry-go/gin"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/imrishuroy/algopatterns/internal/ai"
	aihandlers "github.com/imrishuroy/algopatterns/internal/ai/handlers"
	"github.com/imrishuroy/algopatterns/internal/ai/llm"
	"github.com/imrishuroy/algopatterns/internal/ai/rag"
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

var (
	GitCommit = "unknown"
	GitTag    = "unknown"
	BuildTime = "unknown"
)

func fatal(err error, msg string) {
	sentry.CaptureException(err)
	sentry.Flush(2 * time.Second)
	log.Fatal().Err(err).Msg(msg)
}

func main() {
	fmt.Println("Starting AlgoPatterns API server.....")

	cfg, err := config.Load()
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to load configuration")
	}

	setupLogger(cfg.Logging)

	if cfg.Sentry.DSN != "" {
		release := cfg.Sentry.Release
		if release == "" {
			if GitTag != "unknown" && GitTag != "" {
				release = GitTag
			} else if GitCommit != "unknown" && GitCommit != "" {
				release = GitCommit
			}
		}

		if err := sentry.Init(sentry.ClientOptions{
			Dsn:              cfg.Sentry.DSN,
			Environment:      cfg.Sentry.Environment,
			Release:          release,
			Debug:            cfg.Sentry.Debug,
			SampleRate:       cfg.Sentry.SampleRate,
			EnableTracing:    cfg.Sentry.EnableTracing,
			TracesSampleRate: cfg.Sentry.TracesSampleRate,
			AttachStacktrace: cfg.Sentry.AttachStacktrace,
			SendDefaultPII:   cfg.Sentry.SendDefaultPII,
			MaxBreadcrumbs:   cfg.Sentry.MaxBreadcrumbs,
			ServerName:       cfg.Sentry.ServerName,
			DisableLogs:      cfg.Sentry.DisableLogs,
			DisableMetrics:   cfg.Sentry.DisableMetrics,
			MaxSpans:         cfg.Sentry.MaxSpans,
		}); err != nil {
			log.Fatal().Err(err).Msg("Failed to initialize Sentry")
		}
		defer sentry.Flush(2 * time.Second)
		log.Info().
			Str("environment", cfg.Sentry.Environment).
			Str("release", release).
			Str("git_commit", GitCommit).
			Str("git_tag", GitTag).
			Str("build_time", BuildTime).
			Bool("tracing", cfg.Sentry.EnableTracing).
			Float64("traces_sample_rate", cfg.Sentry.TracesSampleRate).
			Msg("Sentry initialized")
	} else {
		sentry.Init(sentry.ClientOptions{})
	}

	log.Info().Msg("Starting FANGReady API Server...")

	metrics.Init()

	db, err := repository.NewDatabase(&cfg.Database)
	if err != nil {
		fatal(err, "Failed to connect to database")
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

	patternProgressRepo := repository.NewPatternProgressRepository(db)
	patternProgressService := services.NewPatternProgressService(patternProgressRepo)

	quizRepo := repository.NewQuizRepository(db)
	quizService := services.NewQuizService(quizRepo)

	searchRepo := repository.NewSearchRepository(db)
	searchService := services.NewSearchService(searchRepo)

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

	var aiService *ai.Service
	if cfg.AI.Enabled {
		llmManager := llm.NewManager(llm.ManagerConfig{
			DefaultProvider: cfg.AI.DefaultProvider,
			FallbackChain:   cfg.AI.FallbackProviders,
		})

		if cfg.AI.ClaudeAPIKey != "" {
			llmManager.RegisterProvider("claude", llm.NewClaudeProvider(llm.ClaudeConfig{
				APIKey:  cfg.AI.ClaudeAPIKey,
				BaseURL: cfg.AI.ClaudeBaseURL,
				Model:   cfg.AI.ClaudeModel,
			}))
		}

		if cfg.AI.DeepSeekAPIKey != "" {
			llmManager.RegisterProvider("deepseek", llm.NewDeepSeekProvider(llm.DeepSeekConfig{
				APIKey: cfg.AI.DeepSeekAPIKey,
				Model:  cfg.AI.DeepSeekModel,
			}))
		}

		if cfg.AI.GroqAPIKey != "" {
			llmManager.RegisterProvider("groq", llm.NewGroqProvider(llm.GroqConfig{
				APIKey: cfg.AI.GroqAPIKey,
				Model:  cfg.AI.GroqModel,
			}))
		}

		if cfg.AI.NVIDIAAPIKey != "" {
			llmManager.RegisterProvider("nvidia", llm.NewNVIDIAProvider(llm.NVIDIAConfig{
				APIKey: cfg.AI.NVIDIAAPIKey,
				Model:  cfg.AI.NVIDIAModel,
			}))
		}

		if cfg.AI.OpenAIAPIKey != "" {
			llmManager.RegisterProvider("openai", llm.NewOpenAIProvider(llm.OpenAIConfig{
				APIKey: cfg.AI.OpenAIAPIKey,
				Model:  cfg.AI.OpenAIModel,
			}))
		}

		aiConfig := ai.Config{
			Enabled:         true,
			DefaultProvider: cfg.AI.DefaultProvider,
			FallbackChain:   cfg.AI.FallbackProviders,
			RateLimit: ai.RateLimitConfig{
				FreeRequestsPerDay: cfg.AI.FreeRequestsPerDay,
				MaxCodeLength:      cfg.AI.MaxCodeLength,
			},
			Features: ai.FeaturesConfig{
				EnableChat:      true,
				EnableHints:     true,
				EnableReview:    true,
				EnableExplain:   true,
				EnableStreaming: true,
				EnableRAG:       cfg.AI.OpenAIAPIKey != "",
			},
		}

		if cfg.AI.OpenAIAPIKey != "" {
			embeddingProvider := rag.NewOpenAIEmbedding(rag.OpenAIEmbeddingConfig{
				APIKey:     cfg.AI.OpenAIAPIKey,
				Model:      "text-embedding-3-small",
				Dimensions: 1536,
			})
			ragService := rag.NewService(db.Pool, embeddingProvider)
			aiService = ai.NewServiceWithRAG(llmManager, ragService, aiConfig)
			log.Info().Msg("AI service initialized with RAG support")
		} else {
			aiService = ai.NewService(llmManager, aiConfig)
			log.Info().Msg("AI service initialized without RAG (no OpenAI API key)")
		}
	} else {
		log.Info().Msg("AI service disabled")
	}

	gin.SetMode(cfg.Server.Mode)
	router := setupRouter(cfg, db, patternService, authService, oauthService, sessionService, progressService, problemService, submissionService, highlightService, patternProgressService, quizService, searchService, paymentService, webhookService, featureAccess, aiService)

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
			fatal(err, "Failed to start server")
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

func setupRouter(cfg *config.Config, db *repository.Database, patternService *services.PatternService, authService *services.AuthService, oauthService *services.OAuthService, sessionService *services.SessionService, progressService *services.ProgressService, problemService *services.ProblemService, submissionService *services.SubmissionService, highlightService *services.HighlightService, patternProgressService *services.PatternProgressService, quizService *services.QuizService, searchService *services.SearchService, paymentService *services.PaymentService, webhookService *services.WebhookService, featureAccess *services.FeatureAccess, aiService *ai.Service) *gin.Engine {
	router := gin.New()

	rateLimiter := middleware.NewRateLimiter(cfg.Server.RateLimitRPS, cfg.Server.RateLimitBurst)

	router.Use(sentrygin.New(sentrygin.Options{
		Repanic:         true,
		WaitForDelivery: false,
		Timeout:         2 * time.Second,
	}))
	router.Use(middleware.Recovery())
	router.Use(middleware.RequestID())
	router.Use(middleware.Logger())
	router.Use(rateLimiter.Middleware())
	router.Use(middleware.SecurityHeaders())

	router.Use(cors.New(cors.Config{
		AllowOrigins:     cfg.Server.AllowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Request-ID", "Idempotency-Key", "sentry-trace", "baggage"},
		ExposeHeaders:    []string{"X-Request-ID", "Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Root handler — returns 200 so Googlebot doesn't index a 404 for api.algopatterns.in/
	router.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"service": "AlgoPatterns API",
			"version": "1.0.0",
			"docs":    "https://algopatterns.in",
			"status":  "ok",
		})
	})

	// Disallow search engine crawling of the API subdomain
	router.GET("/robots.txt", func(c *gin.Context) {
		c.String(http.StatusOK, "User-agent: *\nDisallow: /\n")
	})

	healthHandler := handlers.NewHealthHandler(db)
	healthHandler.RegisterRoutes(&router.RouterGroup)

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

		patternProgressHandler := handlers.NewPatternProgressHandler(patternProgressService, authMW)
		patternProgressHandler.RegisterRoutes(v1)

		quizHandler := handlers.NewQuizHandler(quizService, featureAccess, authMW)
		quizHandler.RegisterRoutes(v1)

		searchHandler := handlers.NewSearchHandler(searchService, authMW)
		searchHandler.RegisterRoutes(v1)

		paymentHandler := handlers.NewPaymentHandler(paymentService, webhookService, authMW)
		paymentHandler.RegisterRoutes(v1)

		if aiService != nil {
			aiChatRepo := repository.NewAIChatRepository(db)
			aiHandler := aihandlers.NewHandler(aiService, authMW, aiChatRepo)
			aiHandler.RegisterRoutes(v1)
		}
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
