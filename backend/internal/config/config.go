package config

import (
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Server      ServerConfig
	Database    DatabaseConfig
	Logging     LoggingConfig
	Auth        AuthConfig
	GoogleOAuth GoogleOAuthConfig
	Judge0      Judge0Config
	Razorpay    RazorpayConfig
	Email       EmailConfig
	AI          AIConfig
	Sentry      SentryConfig
}

type SentryConfig struct {
	DSN              string
	Environment      string
	Release          string
	Debug            bool
	SampleRate       float64
	TracesSampleRate float64
	EnableTracing    bool
	AttachStacktrace bool
	SendDefaultPII   bool
	MaxBreadcrumbs   int
	ServerName       string
	DisableLogs      bool
	DisableMetrics   bool
	TracePropagation bool
	MaxSpans         int
}

type AIConfig struct {
	Enabled                 bool
	DefaultProvider         string
	FallbackProviders       []string
	ClaudeAPIKey            string
	ClaudeModel             string
	ClaudeBaseURL           string
	DeepSeekAPIKey          string
	DeepSeekModel           string
	DeepSeekReasoningEffort string
	GroqAPIKey              string
	GroqModel               string
	GroqReasoningEffort     string
	NVIDIAAPIKey            string
	NVIDIAModel             string
	OpenAIAPIKey            string
	OpenAIModel             string
	ClineAPIKey             string
	ClineModel              string
	ClineBaseURL            string
	EmbeddingModel          string
	FreeRequestsPerDay      int
	MaxCodeLength           int
}

type EmailConfig struct {
	SMTPHost     string
	SMTPPort     string
	SMTPUser     string
	SMTPPassword string
	FromEmail    string
	FromName     string
	Enabled      bool
}

type RazorpayConfig struct {
	KeyID         string
	KeySecret     string
	WebhookSecret string
	GSTRate       float64
}

type Judge0Config struct {
	BaseURL       string
	APIKey        string
	CPUTimeLimit  float64
	WallTimeLimit float64
	MemoryLimit   int
	StackLimit    int
	PollInterval  time.Duration
	MaxPollTime   time.Duration
}

type AuthConfig struct {
	JWTSecret            string
	AccessTokenDuration  time.Duration
	RefreshTokenDuration time.Duration
	BCryptCost           int
	SingleSessionEnabled bool
}

type GoogleOAuthConfig struct {
	ClientID     string
	ClientSecret string
	RedirectURI  string
}

type ServerConfig struct {
	Host            string
	Port            string
	Mode            string
	ReadTimeout     time.Duration
	WriteTimeout    time.Duration
	ShutdownTimeout time.Duration
	AllowedOrigins  []string
	RateLimitRPS    int
	RateLimitBurst  int
}

type DatabaseConfig struct {
	Host            string
	Port            string
	User            string
	Password        string
	Name            string
	SSLMode         string
	SSLRootCert     string
	MaxOpenConns    int
	MaxIdleConns    int
	ConnMaxLifetime time.Duration
	ConnMaxIdleTime time.Duration
}

type LoggingConfig struct {
	Level  string
	Format string
}

func Load() (*Config, error) {
	if err := godotenv.Load(); err != nil {
		if !os.IsNotExist(err) {
			return nil, fmt.Errorf("error loading .env file: %w", err)
		}
	}

	cfg := &Config{
		Server: ServerConfig{
			Host:            getEnv("SERVER_HOST", "0.0.0.0"),
			Port:            getEnv("SERVER_PORT", "8080"),
			Mode:            getEnv("GIN_MODE", "release"),
			ReadTimeout:     getDurationEnv("SERVER_READ_TIMEOUT", 10*time.Second),
			WriteTimeout:    getDurationEnv("SERVER_WRITE_TIMEOUT", 30*time.Second),
			ShutdownTimeout: getDurationEnv("SERVER_SHUTDOWN_TIMEOUT", 30*time.Second),
			AllowedOrigins:  getEnvSlice("ALLOWED_ORIGINS", []string{"http://localhost:3000"}),
			RateLimitRPS:    getIntEnv("RATE_LIMIT_RPS", 100),
			RateLimitBurst:  getIntEnv("RATE_LIMIT_BURST", 200),
		},
		Database: DatabaseConfig{
			Host:            getEnv("DB_HOST", "localhost"),
			Port:            getEnv("DB_PORT", "26257"),
			User:            getEnv("DB_USER", "root"),
			Password:        getEnv("DB_PASSWORD", ""),
			Name:            getEnv("DB_NAME", "faangready"),
			SSLMode:         getEnv("DB_SSL_MODE", "verify-full"),
			SSLRootCert:     getEnv("DB_SSL_ROOT_CERT", ""),
			MaxOpenConns:    getIntEnv("DB_MAX_OPEN_CONNS", 25),
			MaxIdleConns:    getIntEnv("DB_MAX_IDLE_CONNS", 10),
			ConnMaxLifetime: getDurationEnv("DB_CONN_MAX_LIFETIME", 5*time.Minute),
			ConnMaxIdleTime: getDurationEnv("DB_CONN_MAX_IDLE_TIME", 1*time.Minute),
		},
		Logging: LoggingConfig{
			Level:  getEnv("LOG_LEVEL", "info"),
			Format: getEnv("LOG_FORMAT", "json"),
		},
		Auth: AuthConfig{
			JWTSecret:            getEnv("JWT_SECRET", ""),
			AccessTokenDuration:  getDurationEnv("ACCESS_TOKEN_DURATION", 15*time.Minute),
			RefreshTokenDuration: getDurationEnv("REFRESH_TOKEN_DURATION", 7*24*time.Hour),
			BCryptCost:           getIntEnv("BCRYPT_COST", 12),
			SingleSessionEnabled: getBoolEnv("SINGLE_SESSION_ENABLED", true),
		},
		GoogleOAuth: GoogleOAuthConfig{
			ClientID:     getEnv("GOOGLE_CLIENT_ID", ""),
			ClientSecret: getEnv("GOOGLE_CLIENT_SECRET", ""),
			RedirectURI:  getEnv("GOOGLE_REDIRECT_URI", "http://localhost:8080/api/v1/auth/google/callback"),
		},
		Judge0: Judge0Config{
			BaseURL:       getEnv("JUDGE0_URL", "http://localhost:2358"),
			APIKey:        getEnv("JUDGE0_API_KEY", ""),
			CPUTimeLimit:  getFloatEnv("JUDGE0_CPU_TIME_LIMIT", 5.0),
			WallTimeLimit: getFloatEnv("JUDGE0_WALL_TIME_LIMIT", 10.0),
			MemoryLimit:   getIntEnv("JUDGE0_MEMORY_LIMIT", 128000),
			StackLimit:    getIntEnv("JUDGE0_STACK_LIMIT", 64000),
			PollInterval:  getDurationEnv("JUDGE0_POLL_INTERVAL", 500*time.Millisecond),
			MaxPollTime:   getDurationEnv("JUDGE0_MAX_POLL_TIME", 30*time.Second),
		},
		Razorpay: RazorpayConfig{
			KeyID:         getEnv("RAZORPAY_KEY_ID", ""),
			KeySecret:     getEnv("RAZORPAY_KEY_SECRET", ""),
			WebhookSecret: getEnv("RAZORPAY_WEBHOOK_SECRET", ""),
			GSTRate:       getFloatEnv("RAZORPAY_GST_RATE", 18.0),
		},
		Email: EmailConfig{
			SMTPHost:     getEnv("SMTP_HOST", "smtp.gmail.com"),
			SMTPPort:     getEnv("SMTP_PORT", "587"),
			SMTPUser:     getEnv("SMTP_USER", ""),
			SMTPPassword: getEnv("SMTP_PASSWORD", ""),
			FromEmail:    getEnv("EMAIL_FROM", "hello@algopatterns.in"),
			FromName:     getEnv("EMAIL_FROM_NAME", "AlgoPatterns"),
			Enabled:      getBoolEnv("EMAIL_ENABLED", false),
		},
		AI: AIConfig{
			Enabled:                 getBoolEnv("AI_ENABLED", false),
			DefaultProvider:         getEnv("AI_DEFAULT_PROVIDER", "cline"),
			FallbackProviders:       getEnvSlice("AI_FALLBACK_PROVIDERS", []string{"groq", "openai"}),
			ClaudeAPIKey:            getEnv("CLAUDE_API_KEY", ""),
			ClaudeModel:             getEnv("CLAUDE_MODEL", "claude-sonnet-4-20250514"),
			ClaudeBaseURL:           getEnv("CLAUDE_BASE_URL", "https://api.anthropic.com/v1"),
			DeepSeekAPIKey:          getEnv("DEEPSEEK_API_KEY", ""),
			DeepSeekModel:           getEnv("DEEPSEEK_MODEL", "deepseek-v4-pro"),
			DeepSeekReasoningEffort: getEnv("DEEPSEEK_REASONING_EFFORT", ""),
			GroqAPIKey:              getEnv("GROQ_API_KEY", ""),
			GroqModel:               getEnv("GROQ_MODEL", "openai/gpt-oss-120b"),
			GroqReasoningEffort:     getEnv("GROQ_REASONING_EFFORT", ""),
			NVIDIAAPIKey:            getEnv("NVIDIA_API_KEY", ""),
			NVIDIAModel:             getEnv("NVIDIA_MODEL", "deepseek-ai/deepseek-v4-flash"),
			OpenAIAPIKey:            getEnv("OPENAI_API_KEY", ""),
			OpenAIModel:             getEnv("OPENAI_MODEL", "gpt-4o-mini"),
			ClineAPIKey:             getEnv("CLINE_API_KEY", ""),
			ClineModel:              getEnv("CLINE_MODEL", "deepseek/deepseek-v4-flash"),
			ClineBaseURL:            getEnv("CLINE_BASE_URL", "https://api.cline.bot/api/v1"),
			EmbeddingModel:          getEnv("EMBEDDING_MODEL", "text-embedding-3-small"),
			FreeRequestsPerDay:      getIntEnv("AI_FREE_REQUESTS_PER_DAY", 30),
			MaxCodeLength:           getIntEnv("AI_MAX_CODE_LENGTH", 50000),
		},
		Sentry: SentryConfig{
			DSN:              getEnv("SENTRY_DSN", ""),
			Environment:      getEnv("SENTRY_ENVIRONMENT", "development"),
			Release:          getEnv("SENTRY_RELEASE", ""),
			Debug:            getBoolEnv("SENTRY_DEBUG", false),
			SampleRate:       getFloatEnv("SENTRY_SAMPLE_RATE", 1.0),
			TracesSampleRate: getFloatEnv("SENTRY_TRACES_SAMPLE_RATE", 0.1),
			EnableTracing:    getBoolEnv("SENTRY_ENABLE_TRACING", true),
			AttachStacktrace: getBoolEnv("SENTRY_ATTACH_STACKTRACE", true),
			SendDefaultPII:   getBoolEnv("SENTRY_SEND_DEFAULT_PII", false),
			MaxBreadcrumbs:   getIntEnv("SENTRY_MAX_BREADCRUMBS", 100),
			ServerName:       getEnv("SENTRY_SERVER_NAME", ""),
			DisableLogs:      getBoolEnv("SENTRY_DISABLE_LOGS", false),
			DisableMetrics:   getBoolEnv("SENTRY_DISABLE_METRICS", false),
			TracePropagation: getBoolEnv("SENTRY_TRACE_PROPAGATION", true),
			MaxSpans:         getIntEnv("SENTRY_MAX_SPANS", 1000),
		},
	}

	if cfg.Auth.JWTSecret == "" {
		return nil, fmt.Errorf("JWT_SECRET environment variable is required")
	}

	return cfg, nil
}

func (c *DatabaseConfig) DSN() string {
	dsn := fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=%s",
		c.User, c.Password, c.Host, c.Port, c.Name, c.SSLMode,
	)
	if c.SSLRootCert != "" {
		dsn += fmt.Sprintf("&sslrootcert=%s", c.SSLRootCert)
	}
	return dsn
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getIntEnv(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intVal, err := strconv.Atoi(value); err == nil {
			return intVal
		}
	}
	return defaultValue
}

func getFloatEnv(key string, defaultValue float64) float64 {
	if value := os.Getenv(key); value != "" {
		if floatVal, err := strconv.ParseFloat(value, 64); err == nil {
			return floatVal
		}
	}
	return defaultValue
}

func getBoolEnv(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		if boolVal, err := strconv.ParseBool(value); err == nil {
			return boolVal
		}
	}
	return defaultValue
}

func getDurationEnv(key string, defaultValue time.Duration) time.Duration {
	if value := os.Getenv(key); value != "" {
		if duration, err := time.ParseDuration(value); err == nil {
			return duration
		}
	}
	return defaultValue
}

func getEnvSlice(key string, defaultValue []string) []string {
	if value := os.Getenv(key); value != "" {
		return splitAndTrim(value, ",")
	}
	return defaultValue
}

func splitAndTrim(s, sep string) []string {
	var result []string
	for _, part := range splitString(s, sep) {
		if trimmed := trimSpace(part); trimmed != "" {
			result = append(result, trimmed)
		}
	}
	return result
}

func splitString(s, sep string) []string {
	var result []string
	start := 0
	for i := 0; i <= len(s)-len(sep); i++ {
		if s[i:i+len(sep)] == sep {
			result = append(result, s[start:i])
			start = i + len(sep)
		}
	}
	result = append(result, s[start:])
	return result
}

func trimSpace(s string) string {
	start := 0
	end := len(s)
	for start < end && (s[start] == ' ' || s[start] == '\t') {
		start++
	}
	for end > start && (s[end-1] == ' ' || s[end-1] == '\t') {
		end--
	}
	return s[start:end]
}
