package posthog

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewClient_WithEmptyAPIKey(t *testing.T) {
	client := NewClient("", "")

	assert.NotNil(t, client)
	assert.False(t, client.IsEnabled())
}

func TestNewClient_WithAPIKey(t *testing.T) {
	client := NewClient("test-api-key", "")

	assert.NotNil(t, client)
	assert.True(t, client.IsEnabled())

	// Clean up
	_ = client.Close()
}

func TestNewClient_WithCustomHost(t *testing.T) {
	client := NewClient("test-api-key", "https://custom.posthog.com")

	assert.NotNil(t, client)
	assert.True(t, client.IsEnabled())

	// Clean up
	_ = client.Close()
}

func TestClient_Capture_WhenDisabled(t *testing.T) {
	client := NewClient("", "")

	// Should not panic when disabled
	client.Capture("user-123", "test_event", map[string]any{
		"property": "value",
	})

	assert.False(t, client.IsEnabled())
}

func TestClient_Capture_WhenEnabled(t *testing.T) {
	client := NewClient("test-api-key", "")
	defer func() { _ = client.Close() }()

	// Should not panic when capturing events
	client.Capture("user-123", "test_event", map[string]any{
		"property": "value",
	})

	assert.True(t, client.IsEnabled())
}

func TestClient_Capture_WithNilProperties(t *testing.T) {
	client := NewClient("test-api-key", "")
	defer func() { _ = client.Close() }()

	// Should not panic with nil properties
	client.Capture("user-123", "test_event", nil)

	assert.True(t, client.IsEnabled())
}

func TestClient_Identify_WhenDisabled(t *testing.T) {
	client := NewClient("", "")

	// Should not panic when disabled
	client.Identify("user-123", map[string]any{
		"email": "test@example.com",
	})

	assert.False(t, client.IsEnabled())
}

func TestClient_Identify_WhenEnabled(t *testing.T) {
	client := NewClient("test-api-key", "")
	defer func() { _ = client.Close() }()

	// Should not panic when identifying users
	client.Identify("user-123", map[string]any{
		"name": "Test User",
	})

	assert.True(t, client.IsEnabled())
}

func TestClient_Identify_WithNilProperties(t *testing.T) {
	client := NewClient("test-api-key", "")
	defer func() { _ = client.Close() }()

	// Should not panic with nil properties
	client.Identify("user-123", nil)

	assert.True(t, client.IsEnabled())
}

func TestClient_Close_WhenDisabled(t *testing.T) {
	client := NewClient("", "")

	err := client.Close()

	assert.NoError(t, err)
}

func TestClient_Close_WhenEnabled(t *testing.T) {
	client := NewClient("test-api-key", "")

	err := client.Close()

	assert.NoError(t, err)
}

func TestClient_IsEnabled(t *testing.T) {
	tests := []struct {
		name     string
		apiKey   string
		expected bool
	}{
		{
			name:     "returns false when API key is empty",
			apiKey:   "",
			expected: false,
		},
		{
			name:     "returns true when API key is provided",
			apiKey:   "test-api-key",
			expected: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			client := NewClient(tt.apiKey, "")
			defer func() { _ = client.Close() }()

			assert.Equal(t, tt.expected, client.IsEnabled())
		})
	}
}

func TestClient_Capture_WithMultipleProperties(t *testing.T) {
	client := NewClient("test-api-key", "")
	defer func() { _ = client.Close() }()

	props := map[string]any{
		"string_prop": "value",
		"int_prop":    123,
		"bool_prop":   true,
		"float_prop":  3.14,
	}

	// Should handle multiple property types
	client.Capture("user-123", "complex_event", props)

	assert.True(t, client.IsEnabled())
}

func TestClient_NilClientField(t *testing.T) {
	// Test with a client that has enabled=true but nil client
	// This simulates an edge case
	client := &Client{
		client:  nil,
		enabled: true,
	}

	// Should not panic with nil internal client
	client.Capture("user-123", "test_event", nil)
	client.Identify("user-123", nil)
	err := client.Close()

	assert.NoError(t, err)
}
