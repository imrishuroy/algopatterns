package llm

import (
	"context"
	"errors"
	"fmt"
	"sync"
	"time"

	"github.com/rs/zerolog/log"
)

// Default retry configuration
const (
	defaultMaxRetries     = 2
	defaultInitialBackoff = 500 * time.Millisecond
	defaultMaxBackoff     = 5 * time.Second
)

// Manager manages multiple LLM providers with fallback support
type Manager struct {
	providers      map[string]Provider
	defaultName    string
	fallbackChain  []string
	maxRetries     int
	initialBackoff time.Duration
	maxBackoff     time.Duration
	mu             sync.RWMutex
}

// ManagerConfig holds configuration for the LLM Manager
type ManagerConfig struct {
	DefaultProvider string
	FallbackChain   []string
	MaxRetries      int           // Max retries per provider (default: 2)
	InitialBackoff  time.Duration // Initial backoff duration (default: 500ms)
	MaxBackoff      time.Duration // Max backoff duration (default: 5s)
}

// NewManager creates a new LLM manager
func NewManager(cfg ManagerConfig) *Manager {
	maxRetries := cfg.MaxRetries
	if maxRetries == 0 {
		maxRetries = defaultMaxRetries
	}
	initialBackoff := cfg.InitialBackoff
	if initialBackoff == 0 {
		initialBackoff = defaultInitialBackoff
	}
	maxBackoff := cfg.MaxBackoff
	if maxBackoff == 0 {
		maxBackoff = defaultMaxBackoff
	}

	return &Manager{
		providers:      make(map[string]Provider),
		defaultName:    cfg.DefaultProvider,
		fallbackChain:  cfg.FallbackChain,
		maxRetries:     maxRetries,
		initialBackoff: initialBackoff,
		maxBackoff:     maxBackoff,
	}
}

// isRetryableError determines if an error should be retried
func isRetryableError(err error) bool {
	if err == nil {
		return false
	}
	// Retry on rate limiting (after backoff)
	if errors.Is(err, ErrRateLimited) {
		return true
	}
	// Retry on invalid response (transient API issues)
	if errors.Is(err, ErrInvalidResponse) {
		return true
	}
	// Retry on provider unavailable
	if errors.Is(err, ErrProviderUnavailable) {
		return true
	}
	// Don't retry on context too large (not transient)
	if errors.Is(err, ErrContextTooLarge) {
		return false
	}
	// Check for common transient error patterns in error message
	errMsg := err.Error()
	transientPatterns := []string{
		"connection reset",
		"connection refused",
		"timeout",
		"temporary failure",
		"status 500",
		"status 502",
		"status 503",
		"status 504",
	}
	for _, pattern := range transientPatterns {
		if contains(errMsg, pattern) {
			return true
		}
	}
	return false
}

// contains checks if s contains substr (case-insensitive would be better but keeping simple)
func contains(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr || len(s) > 0 && containsSubstring(s, substr))
}

func containsSubstring(s, substr string) bool {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}

// chatWithRetry attempts a chat request with retries
func (m *Manager) chatWithRetry(ctx context.Context, provider Provider, providerName string, req ChatRequest) (*ChatResponse, error) {
	var lastErr error
	backoff := m.initialBackoff

	for attempt := 0; attempt <= m.maxRetries; attempt++ {
		if attempt > 0 {
			log.Debug().
				Str("provider", providerName).
				Int("attempt", attempt+1).
				Dur("backoff", backoff).
				Msg("Retrying LLM request")

			select {
			case <-ctx.Done():
				return nil, ctx.Err()
			case <-time.After(backoff):
			}

			// Exponential backoff with cap
			backoff *= 2
			if backoff > m.maxBackoff {
				backoff = m.maxBackoff
			}
		}

		resp, err := provider.Chat(ctx, req)
		if err == nil {
			if attempt > 0 {
				log.Info().
					Str("provider", providerName).
					Int("attempt", attempt+1).
					Msg("LLM request succeeded after retry")
			}
			return resp, nil
		}

		lastErr = err

		if !isRetryableError(err) {
			log.Debug().
				Err(err).
				Str("provider", providerName).
				Msg("Non-retryable error, skipping retries")
			return nil, err
		}

		log.Warn().
			Err(err).
			Str("provider", providerName).
			Int("attempt", attempt+1).
			Int("maxRetries", m.maxRetries+1).
			Msg("LLM request failed, will retry")
	}

	return nil, lastErr
}

// chatStreamWithRetry attempts a streaming chat request with retries
func (m *Manager) chatStreamWithRetry(ctx context.Context, provider Provider, providerName string, req ChatRequest) (<-chan StreamChunk, error) {
	var lastErr error
	backoff := m.initialBackoff

	for attempt := 0; attempt <= m.maxRetries; attempt++ {
		if attempt > 0 {
			log.Debug().
				Str("provider", providerName).
				Int("attempt", attempt+1).
				Dur("backoff", backoff).
				Msg("Retrying LLM streaming request")

			select {
			case <-ctx.Done():
				return nil, ctx.Err()
			case <-time.After(backoff):
			}

			backoff *= 2
			if backoff > m.maxBackoff {
				backoff = m.maxBackoff
			}
		}

		chunks, err := provider.ChatStream(ctx, req)
		if err == nil {
			if attempt > 0 {
				log.Info().
					Str("provider", providerName).
					Int("attempt", attempt+1).
					Msg("LLM streaming request succeeded after retry")
			}
			return chunks, nil
		}

		lastErr = err

		if !isRetryableError(err) {
			log.Debug().
				Err(err).
				Str("provider", providerName).
				Msg("Non-retryable error, skipping retries")
			return nil, err
		}

		log.Warn().
			Err(err).
			Str("provider", providerName).
			Int("attempt", attempt+1).
			Int("maxRetries", m.maxRetries+1).
			Msg("LLM streaming request failed, will retry")
	}

	return nil, lastErr
}

// RegisterProvider registers a provider with the manager
func (m *Manager) RegisterProvider(name string, provider Provider) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.providers[name] = provider
	log.Info().Str("provider", name).Msg("Registered LLM provider")
}

// GetProvider returns a specific provider by name
func (m *Manager) GetProvider(name string) (Provider, bool) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	p, ok := m.providers[name]
	return p, ok
}

// DefaultProvider returns the default provider
func (m *Manager) DefaultProvider() (Provider, bool) {
	return m.GetProvider(m.defaultName)
}

// Chat sends a request using the default provider with fallback support
func (m *Manager) Chat(ctx context.Context, req ChatRequest) (*ChatResponse, error) {
	m.mu.RLock()
	provider, ok := m.providers[m.defaultName]
	fallbacks := m.fallbackChain
	m.mu.RUnlock()

	if !ok {
		return nil, fmt.Errorf("default provider %s not found", m.defaultName)
	}

	// Try primary provider with retries
	resp, err := m.chatWithRetry(ctx, provider, m.defaultName, req)
	if err == nil {
		return resp, nil
	}

	log.Warn().
		Err(err).
		Str("provider", m.defaultName).
		Msg("Primary provider failed after retries, trying fallbacks")

	// Try each fallback with retries
	for _, name := range fallbacks {
		m.mu.RLock()
		fallback, ok := m.providers[name]
		m.mu.RUnlock()

		if !ok {
			continue
		}

		resp, err = m.chatWithRetry(ctx, fallback, name, req)
		if err == nil {
			log.Info().Str("provider", name).Msg("Fallback provider succeeded")
			return resp, nil
		}

		log.Warn().Err(err).Str("provider", name).Msg("Fallback provider failed after retries")
	}

	return nil, fmt.Errorf("all providers failed, last error: %w", err)
}

// ChatStream sends a streaming request using the default provider with fallback
func (m *Manager) ChatStream(ctx context.Context, req ChatRequest) (<-chan StreamChunk, error) {
	m.mu.RLock()
	provider, ok := m.providers[m.defaultName]
	fallbacks := m.fallbackChain
	m.mu.RUnlock()

	if !ok {
		return nil, fmt.Errorf("default provider %s not found", m.defaultName)
	}

	// Try primary provider with retries
	chunks, err := m.chatStreamWithRetry(ctx, provider, m.defaultName, req)
	if err == nil {
		return chunks, nil
	}

	log.Warn().
		Err(err).
		Str("provider", m.defaultName).
		Msg("Primary provider streaming failed after retries, trying fallbacks")

	// Try each fallback with retries
	for _, name := range fallbacks {
		m.mu.RLock()
		fallback, ok := m.providers[name]
		m.mu.RUnlock()

		if !ok {
			continue
		}

		chunks, err = m.chatStreamWithRetry(ctx, fallback, name, req)
		if err == nil {
			log.Info().Str("provider", name).Msg("Fallback provider streaming succeeded")
			return chunks, nil
		}

		log.Warn().Err(err).Str("provider", name).Msg("Fallback provider streaming failed after retries")
	}

	return nil, fmt.Errorf("all providers failed for streaming, last error: %w", err)
}

// HealthCheck checks all registered providers
func (m *Manager) HealthCheck(ctx context.Context) map[string]error {
	m.mu.RLock()
	providers := make(map[string]Provider, len(m.providers))
	for k, v := range m.providers {
		providers[k] = v
	}
	m.mu.RUnlock()

	results := make(map[string]error)
	for name, provider := range providers {
		results[name] = provider.HealthCheck(ctx)
	}

	return results
}

// AvailableProviders returns a list of registered provider names
func (m *Manager) AvailableProviders() []string {
	m.mu.RLock()
	defer m.mu.RUnlock()

	names := make([]string, 0, len(m.providers))
	for name := range m.providers {
		names = append(names, name)
	}
	return names
}
