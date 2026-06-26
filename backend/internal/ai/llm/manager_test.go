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
