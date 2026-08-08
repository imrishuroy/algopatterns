package posthog

import (
	"github.com/posthog/posthog-go"
)

// Client wraps the PostHog client for analytics
type Client struct {
	client  posthog.Client
	enabled bool
}

// NewClient creates a new PostHog client. If apiKey is empty, returns a no-op client.
func NewClient(apiKey, host string) *Client {
	if apiKey == "" {
		return &Client{enabled: false}
	}

	endpoint := host
	if endpoint == "" {
		endpoint = "https://us.i.posthog.com"
	}

	client, _ := posthog.NewWithConfig(apiKey, posthog.Config{
		Endpoint: endpoint,
	})

	return &Client{
		client:  client,
		enabled: true,
	}
}

// Capture sends an event to PostHog
func (c *Client) Capture(distinctID, event string, properties map[string]any) {
	if !c.enabled || c.client == nil {
		return
	}

	props := posthog.NewProperties()
	for k, v := range properties {
		props.Set(k, v)
	}

	_ = c.client.Enqueue(posthog.Capture{
		DistinctId: distinctID,
		Event:      event,
		Properties: props,
	})
}

// Identify sets user properties in PostHog
func (c *Client) Identify(distinctID string, properties map[string]any) {
	if !c.enabled || c.client == nil {
		return
	}

	props := posthog.NewProperties()
	for k, v := range properties {
		props.Set(k, v)
	}

	_ = c.client.Enqueue(posthog.Identify{
		DistinctId: distinctID,
		Properties: props,
	})
}

// Close flushes pending events and closes the client
func (c *Client) Close() error {
	if !c.enabled || c.client == nil {
		return nil
	}
	return c.client.Close()
}

// IsEnabled returns whether the client is configured
func (c *Client) IsEnabled() bool {
	return c.enabled
}
