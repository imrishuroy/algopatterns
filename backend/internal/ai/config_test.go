package ai

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestDefaultConfig(t *testing.T) {
	cfg := DefaultConfig()

	assert.False(t, cfg.Enabled)
	assert.Equal(t, "claude", cfg.DefaultProvider)
	assert.Equal(t, []string{"deepseek", "openai"}, cfg.FallbackChain)

	// Claude config
	assert.False(t, cfg.Claude.Enabled)
	assert.Equal(t, "https://api.anthropic.com/v1", cfg.Claude.BaseURL)
	assert.Equal(t, "claude-sonnet-4-20250514", cfg.Claude.Model)
	assert.Equal(t, 60*time.Second, cfg.Claude.Timeout)
	assert.Equal(t, 2, cfg.Claude.MaxRetry)

	// DeepSeek config
	assert.False(t, cfg.DeepSeek.Enabled)
	assert.Equal(t, "https://api.deepseek.com/v1", cfg.DeepSeek.BaseURL)
	assert.Equal(t, "deepseek-v4-pro", cfg.DeepSeek.Model)
	assert.Equal(t, 60*time.Second, cfg.DeepSeek.Timeout)
	assert.Equal(t, 2, cfg.DeepSeek.MaxRetry)

	// Groq config (new)
	assert.False(t, cfg.Groq.Enabled)
	assert.Equal(t, "https://api.groq.com/openai/v1", cfg.Groq.BaseURL)
	assert.Equal(t, "openai/gpt-oss-120b", cfg.Groq.Model)
	assert.Equal(t, 60*time.Second, cfg.Groq.Timeout)
	assert.Equal(t, 2, cfg.Groq.MaxRetry)
	assert.Empty(t, cfg.Groq.APIKey)

	// NVIDIA config (new)
	assert.False(t, cfg.NVIDIA.Enabled)
	assert.Equal(t, "https://integrate.api.nvidia.com/v1", cfg.NVIDIA.BaseURL)
	assert.Equal(t, "deepseek-ai/deepseek-v4-flash", cfg.NVIDIA.Model)
	assert.Equal(t, 60*time.Second, cfg.NVIDIA.Timeout)
	assert.Equal(t, 2, cfg.NVIDIA.MaxRetry)
	assert.Empty(t, cfg.NVIDIA.APIKey)

	// OpenAI config
	assert.False(t, cfg.OpenAI.Enabled)
	assert.Equal(t, "https://api.openai.com/v1", cfg.OpenAI.BaseURL)
	assert.Equal(t, "gpt-4o-mini", cfg.OpenAI.Model)
	assert.Equal(t, 60*time.Second, cfg.OpenAI.Timeout)
	assert.Equal(t, 2, cfg.OpenAI.MaxRetry)

	// Embedding config
	assert.Equal(t, "openai", cfg.Embedding.Provider)
	assert.Equal(t, "text-embedding-3-small", cfg.Embedding.Model)
	assert.Equal(t, 1536, cfg.Embedding.Dimensions)

	// Rate limit config
	assert.Equal(t, 30, cfg.RateLimit.FreeRequestsPerDay)
	assert.Equal(t, -1, cfg.RateLimit.PremiumRequestsPerDay)
	assert.Equal(t, 4096, cfg.RateLimit.MaxTokensPerRequest)
	assert.Equal(t, 50000, cfg.RateLimit.MaxCodeLength)

	// Features config
	assert.True(t, cfg.Features.EnableChat)
	assert.True(t, cfg.Features.EnableHints)
	assert.True(t, cfg.Features.EnableReview)
	assert.True(t, cfg.Features.EnableExplain)
	assert.False(t, cfg.Features.EnableRAG)
	assert.True(t, cfg.Features.EnableStreaming)
}

func TestGroqConfigDefaults(t *testing.T) {
	cfg := DefaultConfig()
	assert.Equal(t, "openai/gpt-oss-120b", cfg.Groq.Model)
	assert.Equal(t, 60*time.Second, cfg.Groq.Timeout)
	assert.Equal(t, 2, cfg.Groq.MaxRetry)
}

func TestNVIDIAConfigDefaults(t *testing.T) {
	cfg := DefaultConfig()
	assert.Equal(t, "deepseek-ai/deepseek-v4-flash", cfg.NVIDIA.Model)
	assert.Equal(t, 60*time.Second, cfg.NVIDIA.Timeout)
	assert.Equal(t, 2, cfg.NVIDIA.MaxRetry)
}

func TestGroqConfigCustomization(t *testing.T) {
	cfg := DefaultConfig()
	cfg.Groq = struct {
		Enabled         bool
		BaseURL         string
		APIKey          string
		Model           string
		Timeout         time.Duration
		MaxRetry        int
		ReasoningEffort string
	}{
		Enabled:         true,
		BaseURL:         "https://custom.groq.com",
		APIKey:          "test-key",
		Model:           "custom-model",
		Timeout:         10 * time.Second,
		MaxRetry:        3,
		ReasoningEffort: "medium",
	}

	assert.True(t, cfg.Groq.Enabled)
	assert.Equal(t, "https://custom.groq.com", cfg.Groq.BaseURL)
	assert.Equal(t, "test-key", cfg.Groq.APIKey)
	assert.Equal(t, "custom-model", cfg.Groq.Model)
	assert.Equal(t, 10*time.Second, cfg.Groq.Timeout)
	assert.Equal(t, 3, cfg.Groq.MaxRetry)
	assert.Equal(t, "medium", cfg.Groq.ReasoningEffort)
}

func TestNVIDIAConfigCustomization(t *testing.T) {
	cfg := DefaultConfig()
	cfg.NVIDIA = struct {
		Enabled  bool
		BaseURL  string
		APIKey   string
		Model    string
		Timeout  time.Duration
		MaxRetry int
	}{
		Enabled:  true,
		BaseURL:  "https://custom.nvidia.com",
		APIKey:   "nv-key",
		Model:    "custom-nv",
		Timeout:  20 * time.Second,
		MaxRetry: 3,
	}

	assert.True(t, cfg.NVIDIA.Enabled)
	assert.Equal(t, "https://custom.nvidia.com", cfg.NVIDIA.BaseURL)
	assert.Equal(t, "nv-key", cfg.NVIDIA.APIKey)
	assert.Equal(t, "custom-nv", cfg.NVIDIA.Model)
	assert.Equal(t, 20*time.Second, cfg.NVIDIA.Timeout)
	assert.Equal(t, 3, cfg.NVIDIA.MaxRetry)
}

func TestFeaturesConfigDefaults(t *testing.T) {
	cfg := DefaultConfig()
	assert.True(t, cfg.Features.EnableChat)
	assert.True(t, cfg.Features.EnableHints)
	assert.True(t, cfg.Features.EnableReview)
	assert.True(t, cfg.Features.EnableExplain)
	assert.False(t, cfg.Features.EnableRAG)
	assert.True(t, cfg.Features.EnableStreaming)
}

func TestRateLimitConfigDefaults(t *testing.T) {
	cfg := DefaultConfig()
	assert.Equal(t, 30, cfg.RateLimit.FreeRequestsPerDay)
	assert.Equal(t, -1, cfg.RateLimit.PremiumRequestsPerDay)
	assert.Equal(t, 4096, cfg.RateLimit.MaxTokensPerRequest)
	assert.Equal(t, 50000, cfg.RateLimit.MaxCodeLength)
}
