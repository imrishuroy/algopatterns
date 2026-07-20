package llm

import (
	"context"
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockProvider is a mock implementation of Provider for testing
type MockProvider struct {
	mock.Mock
}

func (m *MockProvider) Chat(ctx context.Context, req ChatRequest) (*ChatResponse, error) {
	args := m.Called(ctx, req)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*ChatResponse), args.Error(1)
}

func (m *MockProvider) ChatStream(ctx context.Context, req ChatRequest) (<-chan StreamChunk, error) {
	args := m.Called(ctx, req)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(<-chan StreamChunk), args.Error(1)
}

func (m *MockProvider) Name() string {
	args := m.Called()
	return args.String(0)
}

func (m *MockProvider) HealthCheck(ctx context.Context) error {
	args := m.Called(ctx)
	return args.Error(0)
}

func TestManagerRegisterProvider(t *testing.T) {
	manager := NewManager(ManagerConfig{
		DefaultProvider: "test",
	})

	mockProvider := new(MockProvider)
	mockProvider.On("Name").Return("test")

	manager.RegisterProvider("test", mockProvider)

	provider, ok := manager.GetProvider("test")
	assert.True(t, ok)
	assert.NotNil(t, provider)
}

func TestManagerChatSuccess(t *testing.T) {
	manager := NewManager(ManagerConfig{
		DefaultProvider: "primary",
		FallbackChain:   []string{"fallback"},
	})

	mockPrimary := new(MockProvider)
	mockPrimary.On("Chat", mock.Anything, mock.Anything).Return(&ChatResponse{
		Content: "Hello from primary",
		Model:   "test-model",
	}, nil)

	manager.RegisterProvider("primary", mockPrimary)

	resp, err := manager.Chat(context.Background(), ChatRequest{
		Messages: []Message{UserMessage("Hello")},
	})

	assert.NoError(t, err)
	assert.Equal(t, "Hello from primary", resp.Content)
	mockPrimary.AssertExpectations(t)
}

func TestManagerChatFallback(t *testing.T) {
	manager := NewManager(ManagerConfig{
		DefaultProvider: "primary",
		FallbackChain:   []string{"fallback"},
	})

	mockPrimary := new(MockProvider)
	mockPrimary.On("Chat", mock.Anything, mock.Anything).Return(nil, errors.New("primary failed"))

	mockFallback := new(MockProvider)
	mockFallback.On("Chat", mock.Anything, mock.Anything).Return(&ChatResponse{
		Content: "Hello from fallback",
		Model:   "fallback-model",
	}, nil)

	manager.RegisterProvider("primary", mockPrimary)
	manager.RegisterProvider("fallback", mockFallback)

	resp, err := manager.Chat(context.Background(), ChatRequest{
		Messages: []Message{UserMessage("Hello")},
	})

	assert.NoError(t, err)
	assert.Equal(t, "Hello from fallback", resp.Content)
	mockPrimary.AssertExpectations(t)
	mockFallback.AssertExpectations(t)
}

func TestManagerAvailableProviders(t *testing.T) {
	manager := NewManager(ManagerConfig{
		DefaultProvider: "test",
	})

	mock1 := new(MockProvider)
	mock2 := new(MockProvider)

	manager.RegisterProvider("provider1", mock1)
	manager.RegisterProvider("provider2", mock2)

	providers := manager.AvailableProviders()
	assert.Len(t, providers, 2)
	assert.Contains(t, providers, "provider1")
	assert.Contains(t, providers, "provider2")
}

func TestManagerChatRetryOnInvalidResponse(t *testing.T) {
	manager := NewManager(ManagerConfig{
		DefaultProvider: "primary",
		MaxRetries:      2,
	})

	mockPrimary := new(MockProvider)
	// First call fails with retryable error, second succeeds
	mockPrimary.On("Chat", mock.Anything, mock.Anything).Return(nil, ErrInvalidResponse).Once()
	mockPrimary.On("Chat", mock.Anything, mock.Anything).Return(&ChatResponse{
		Content: "Success after retry",
		Model:   "test-model",
	}, nil).Once()

	manager.RegisterProvider("primary", mockPrimary)

	resp, err := manager.Chat(context.Background(), ChatRequest{
		Messages: []Message{UserMessage("Hello")},
	})

	assert.NoError(t, err)
	assert.Equal(t, "Success after retry", resp.Content)
	mockPrimary.AssertExpectations(t)
}

func TestManagerChatRetryOnRateLimited(t *testing.T) {
	manager := NewManager(ManagerConfig{
		DefaultProvider: "primary",
		MaxRetries:      1,
	})

	mockPrimary := new(MockProvider)
	// First call rate limited, second succeeds
	mockPrimary.On("Chat", mock.Anything, mock.Anything).Return(nil, ErrRateLimited).Once()
	mockPrimary.On("Chat", mock.Anything, mock.Anything).Return(&ChatResponse{
		Content: "Success after rate limit",
		Model:   "test-model",
	}, nil).Once()

	manager.RegisterProvider("primary", mockPrimary)

	resp, err := manager.Chat(context.Background(), ChatRequest{
		Messages: []Message{UserMessage("Hello")},
	})

	assert.NoError(t, err)
	assert.Equal(t, "Success after rate limit", resp.Content)
	mockPrimary.AssertExpectations(t)
}

func TestManagerChatNoRetryOnContextTooLarge(t *testing.T) {
	manager := NewManager(ManagerConfig{
		DefaultProvider: "primary",
		FallbackChain:   []string{"fallback"},
		MaxRetries:      2,
	})

	mockPrimary := new(MockProvider)
	// Context too large is not retryable, should go straight to fallback
	mockPrimary.On("Chat", mock.Anything, mock.Anything).Return(nil, ErrContextTooLarge).Once()

	mockFallback := new(MockProvider)
	mockFallback.On("Chat", mock.Anything, mock.Anything).Return(&ChatResponse{
		Content: "Fallback response",
		Model:   "fallback-model",
	}, nil).Once()

	manager.RegisterProvider("primary", mockPrimary)
	manager.RegisterProvider("fallback", mockFallback)

	resp, err := manager.Chat(context.Background(), ChatRequest{
		Messages: []Message{UserMessage("Hello")},
	})

	assert.NoError(t, err)
	assert.Equal(t, "Fallback response", resp.Content)
	// Primary should only be called once (no retry for non-retryable error)
	mockPrimary.AssertNumberOfCalls(t, "Chat", 1)
	mockFallback.AssertExpectations(t)
}

func TestManagerChatStreamRetry(t *testing.T) {
	manager := NewManager(ManagerConfig{
		DefaultProvider: "primary",
		MaxRetries:      1,
	})

	chunks := make(chan StreamChunk, 1)
	chunks <- StreamChunk{Content: "Hello", Done: true}
	close(chunks)

	mockPrimary := new(MockProvider)
	// First call fails, second succeeds
	mockPrimary.On("ChatStream", mock.Anything, mock.Anything).Return(nil, ErrInvalidResponse).Once()
	mockPrimary.On("ChatStream", mock.Anything, mock.Anything).Return((<-chan StreamChunk)(chunks), nil).Once()

	manager.RegisterProvider("primary", mockPrimary)

	result, err := manager.ChatStream(context.Background(), ChatRequest{
		Messages: []Message{UserMessage("Hello")},
	})

	assert.NoError(t, err)
	assert.NotNil(t, result)
	mockPrimary.AssertExpectations(t)
}

func TestIsRetryableError(t *testing.T) {
	tests := []struct {
		name     string
		err      error
		expected bool
	}{
		{"nil error", nil, false},
		{"rate limited", ErrRateLimited, true},
		{"invalid response", ErrInvalidResponse, true},
		{"provider unavailable", ErrProviderUnavailable, true},
		{"context too large", ErrContextTooLarge, false},
		{"connection reset", errors.New("connection reset by peer"), true},
		{"timeout", errors.New("request timeout"), true},
		{"status 503", errors.New("API error (status 503): service unavailable"), true},
		{"status 400", errors.New("API error (status 400): bad request"), false},
		{"generic error", errors.New("something went wrong"), false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := isRetryableError(tt.err)
			assert.Equal(t, tt.expected, result)
		})
	}
}
