package ai

import (
	"time"
)

// Config holds all AI-related configuration
type Config struct {
	Enabled         bool
	DefaultProvider string
	FallbackChain   []string

	Claude    ClaudeConfig
	DeepSeek  DeepSeekConfig
	OpenAI    OpenAIConfig
	Embedding EmbeddingConfig

	RateLimit RateLimitConfig
	Features  FeaturesConfig
}

// ClaudeConfig holds Claude/Anthropic provider configuration
type ClaudeConfig struct {
	Enabled  bool
	BaseURL  string
	APIKey   string
	Model    string
	Timeout  time.Duration
	MaxRetry int
}

// DeepSeekConfig holds DeepSeek provider configuration
type DeepSeekConfig struct {
	Enabled  bool
	BaseURL  string
	APIKey   string
	Model    string
	Timeout  time.Duration
	MaxRetry int
}

// OpenAIConfig holds OpenAI provider configuration
type OpenAIConfig struct {
	Enabled  bool
	BaseURL  string
	APIKey   string
	Model    string
	Timeout  time.Duration
	MaxRetry int
}

// EmbeddingConfig holds embedding configuration
type EmbeddingConfig struct {
	Provider   string // "openai" for now
	Model      string
	Dimensions int
}

// RateLimitConfig holds rate limiting configuration for AI endpoints
type RateLimitConfig struct {
	FreeRequestsPerDay    int
	PremiumRequestsPerDay int
	MaxTokensPerRequest   int
	MaxCodeLength         int
}

// FeaturesConfig holds feature flags
type FeaturesConfig struct {
	EnableChat       bool
	EnableHints      bool
	EnableReview     bool
	EnableExplain    bool
	EnableRAG        bool
	EnableStreaming  bool
}

// DefaultConfig returns a default AI configuration
func DefaultConfig() Config {
	return Config{
		Enabled:         false,
		DefaultProvider: "claude",
		FallbackChain:   []string{"deepseek", "openai"},

		Claude: ClaudeConfig{
			Enabled:  false,
			BaseURL:  "https://api.anthropic.com/v1",
			Model:    "claude-sonnet-4-20250514",
			Timeout:  60 * time.Second,
			MaxRetry: 2,
		},

		DeepSeek: DeepSeekConfig{
			Enabled:  false,
			BaseURL:  "https://api.deepseek.com/v1",
			Model:    "deepseek-chat",
			Timeout:  60 * time.Second,
			MaxRetry: 2,
		},

		OpenAI: OpenAIConfig{
			Enabled:  false,
			BaseURL:  "https://api.openai.com/v1",
			Model:    "gpt-4o-mini",
			Timeout:  60 * time.Second,
			MaxRetry: 2,
		},

		Embedding: EmbeddingConfig{
			Provider:   "openai",
			Model:      "text-embedding-3-small",
			Dimensions: 1536,
		},

		RateLimit: RateLimitConfig{
			FreeRequestsPerDay:    30,
			PremiumRequestsPerDay: -1, // unlimited
			MaxTokensPerRequest:   4096,
			MaxCodeLength:         50000, // 50KB
		},

		Features: FeaturesConfig{
			EnableChat:      true,
			EnableHints:     true,
			EnableReview:    true,
			EnableExplain:   true,
			EnableRAG:       false, // Enable after embeddings are set up
			EnableStreaming: true,
		},
	}
}
