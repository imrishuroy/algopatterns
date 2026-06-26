package llm

import (
	"context"
	"fmt"
	"sync"

	"github.com/rs/zerolog/log"
)

// Manager manages multiple LLM providers with fallback support
type Manager struct {
	providers     map[string]Provider
	defaultName   string
	fallbackChain []string
	mu            sync.RWMutex
}

// ManagerConfig holds configuration for the LLM Manager
type ManagerConfig struct {
	DefaultProvider string
	FallbackChain   []string
}

// NewManager creates a new LLM manager
func NewManager(cfg ManagerConfig) *Manager {
	return &Manager{
		providers:     make(map[string]Provider),
		defaultName:   cfg.DefaultProvider,
		fallbackChain: cfg.FallbackChain,
	}
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

	resp, err := provider.Chat(ctx, req)
	if err == nil {
		return resp, nil
	}

	log.Warn().
		Err(err).
		Str("provider", m.defaultName).
		Msg("Primary provider failed, trying fallbacks")

	for _, name := range fallbacks {
		m.mu.RLock()
		fallback, ok := m.providers[name]
		m.mu.RUnlock()

		if !ok {
			continue
		}

		resp, err := fallback.Chat(ctx, req)
		if err == nil {
			log.Info().Str("provider", name).Msg("Fallback provider succeeded")
			return resp, nil
		}

		log.Warn().Err(err).Str("provider", name).Msg("Fallback provider failed")
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

	chunks, err := provider.ChatStream(ctx, req)
	if err == nil {
		return chunks, nil
	}

	log.Warn().
		Err(err).
		Str("provider", m.defaultName).
		Msg("Primary provider streaming failed, trying fallbacks")

	for _, name := range fallbacks {
		m.mu.RLock()
		fallback, ok := m.providers[name]
		m.mu.RUnlock()

		if !ok {
			continue
		}

		chunks, err := fallback.ChatStream(ctx, req)
		if err == nil {
			log.Info().Str("provider", name).Msg("Fallback provider streaming succeeded")
			return chunks, nil
		}

		log.Warn().Err(err).Str("provider", name).Msg("Fallback provider streaming failed")
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
