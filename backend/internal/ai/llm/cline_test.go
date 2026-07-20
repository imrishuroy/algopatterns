package llm

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestNewClineProviderDefaults(t *testing.T) {
	p := NewClineProvider(ClineConfig{APIKey: "test-key"})
	assert.Equal(t, "https://api.cline.bot/api/v1", p.baseURL)
	assert.Equal(t, "deepseek/deepseek-v4-flash", p.model)
	assert.Equal(t, 60*time.Second, p.client.Timeout)
	assert.Equal(t, 2, p.maxRetry)
	assert.Equal(t, "test-key", p.apiKey)
}

func TestNewClineProviderCustom(t *testing.T) {
	p := NewClineProvider(ClineConfig{
		BaseURL:  "https://custom.cline.bot/api/v1/",
		APIKey:   "custom-key",
		Model:    "custom-model",
		Timeout:  45 * time.Second,
		MaxRetry: 3,
	})
	assert.Equal(t, "https://custom.cline.bot/api/v1", p.baseURL)
	assert.Equal(t, "custom-model", p.model)
	assert.Equal(t, 45*time.Second, p.client.Timeout)
	assert.Equal(t, 3, p.maxRetry)
}

func TestClineProviderName(t *testing.T) {
	p := NewClineProvider(ClineConfig{APIKey: "key"})
	assert.Equal(t, "cline", p.Name())
}

func TestClineProviderChat_Success(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		assert.Equal(t, "POST", r.Method)
		assert.Equal(t, "/chat/completions", r.URL.Path)
		assert.Equal(t, "Bearer cline-key", r.Header.Get("Authorization"))
		assert.Equal(t, "application/json", r.Header.Get("Content-Type"))

		var req clineRequest
		err := json.NewDecoder(r.Body).Decode(&req)
		require.NoError(t, err)
		assert.Equal(t, "cline-model", req.Model)
		assert.False(t, req.Stream)
		assert.Len(t, req.Messages, 2)

		resp := clineResponse{
			Success: true,
			Data: clineResponseData{
				ID:      "chatcmpl-cl1",
				Object:  "chat.completion",
				Created: 1234567890,
				Model:   "cline-model",
				Choices: []struct {
					Index   int `json:"index"`
					Message struct {
						Role             string `json:"role"`
						Content          string `json:"content"`
						ReasoningContent string `json:"reasoning_content"`
					} `json:"message"`
					FinishReason string `json:"finish_reason"`
				}{
					{
						Index: 0,
						Message: struct {
							Role             string `json:"role"`
							Content          string `json:"content"`
							ReasoningContent string `json:"reasoning_content"`
						}{
							Role:             "assistant",
							Content:          "Hello from Cline",
							ReasoningContent: "I think therefore I am",
						},
						FinishReason: "stop",
					},
				},
				Usage: struct {
					PromptTokens     int `json:"prompt_tokens"`
					CompletionTokens int `json:"completion_tokens"`
					TotalTokens      int `json:"total_tokens"`
				}{
					PromptTokens:     5,
					CompletionTokens: 15,
					TotalTokens:      20,
				},
			},
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
	}))
	defer srv.Close()

	p := NewClineProvider(ClineConfig{
		BaseURL: srv.URL,
		APIKey:  "cline-key",
		Model:   "cline-model",
	})

	resp, err := p.Chat(context.Background(), ChatRequest{
		Messages: []Message{
			SystemMessage("You are a tutor"),
			UserMessage("Hello"),
		},
	})
	require.NoError(t, err)
	assert.Equal(t, "Hello from Cline", resp.Content)
	assert.Equal(t, "I think therefore I am", resp.ReasoningContent)
	assert.Equal(t, "cline-model", resp.Model)
	assert.Equal(t, 5, resp.TokensInput)
	assert.Equal(t, 15, resp.TokensOutput)
	assert.Equal(t, "stop", resp.FinishReason)
}

func TestClineProviderChat_ExtraBody(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var body map[string]interface{}
		json.NewDecoder(r.Body).Decode(&body)
		assert.Equal(t, float64(0.8), body["temperature"])
		assert.Equal(t, "extra-value", body["extra_field"])

		resp := clineResponse{
			Success: true,
			Data: clineResponseData{
				Model: "test",
				Choices: []struct {
					Index   int `json:"index"`
					Message struct {
						Role             string `json:"role"`
						Content          string `json:"content"`
						ReasoningContent string `json:"reasoning_content"`
					} `json:"message"`
					FinishReason string `json:"finish_reason"`
				}{
					{
						Index: 0,
						Message: struct {
							Role             string `json:"role"`
							Content          string `json:"content"`
							ReasoningContent string `json:"reasoning_content"`
						}{Role: "assistant", Content: "ok"},
						FinishReason: "stop",
					},
				},
			},
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
	}))
	defer srv.Close()

	p := NewClineProvider(ClineConfig{BaseURL: srv.URL, APIKey: "key"})
	_, err := p.Chat(context.Background(), ChatRequest{
		Messages:    []Message{UserMessage("hi")},
		Temperature: 0.8,
		ExtraBody:   json.RawMessage(`{"extra_field": "extra-value"}`),
	})
	require.NoError(t, err)
}

func TestClineProviderChat_RateLimited(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusTooManyRequests)
	}))
	defer srv.Close()

	p := NewClineProvider(ClineConfig{BaseURL: srv.URL, APIKey: "key"})
	_, err := p.Chat(context.Background(), ChatRequest{
		Messages: []Message{UserMessage("hi")},
	})
	assert.ErrorIs(t, err, ErrRateLimited)
}

func TestClineProviderChat_APIError(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(`{"error": "bad model"}`))
	}))
	defer srv.Close()

	p := NewClineProvider(ClineConfig{BaseURL: srv.URL, APIKey: "key"})
	_, err := p.Chat(context.Background(), ChatRequest{
		Messages: []Message{UserMessage("hi")},
	})
	require.Error(t, err)
	assert.Contains(t, err.Error(), "API error")
	assert.Contains(t, err.Error(), "400")
}

func TestClineProviderChat_EmptyChoices(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		resp := clineResponse{
			Success: true,
			Data: clineResponseData{
				Model: "test",
				Choices: []struct {
					Index   int `json:"index"`
					Message struct {
						Role             string `json:"role"`
						Content          string `json:"content"`
						ReasoningContent string `json:"reasoning_content"`
					} `json:"message"`
					FinishReason string `json:"finish_reason"`
				}{},
			},
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
	}))
	defer srv.Close()

	p := NewClineProvider(ClineConfig{BaseURL: srv.URL, APIKey: "key"})
	_, err := p.Chat(context.Background(), ChatRequest{
		Messages: []Message{UserMessage("hi")},
	})
	assert.ErrorIs(t, err, ErrInvalidResponse)
}

func TestClineProviderChat_RequestError(t *testing.T) {
	p := NewClineProvider(ClineConfig{BaseURL: "http://invalid.invalid", APIKey: "key", Timeout: time.Millisecond})
	_, err := p.Chat(context.Background(), ChatRequest{
		Messages: []Message{UserMessage("hi")},
	})
	require.Error(t, err)
	assert.Contains(t, err.Error(), "request failed")
}

func TestClineProviderChat_CustomModel(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var req clineRequest
		json.NewDecoder(r.Body).Decode(&req)
		assert.Equal(t, "override-model", req.Model)

		resp := clineResponse{
			Success: true,
			Data: clineResponseData{
				Model: "override-model",
				Choices: []struct {
					Index   int `json:"index"`
					Message struct {
						Role             string `json:"role"`
						Content          string `json:"content"`
						ReasoningContent string `json:"reasoning_content"`
					} `json:"message"`
					FinishReason string `json:"finish_reason"`
				}{
					{
						Index: 0,
						Message: struct {
							Role             string `json:"role"`
							Content          string `json:"content"`
							ReasoningContent string `json:"reasoning_content"`
						}{Role: "assistant", Content: "ok"},
						FinishReason: "stop",
					},
				},
			},
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
	}))
	defer srv.Close()

	p := NewClineProvider(ClineConfig{BaseURL: srv.URL, APIKey: "key", Model: "default"})
	_, err := p.Chat(context.Background(), ChatRequest{
		Model:    "override-model",
		Messages: []Message{UserMessage("hi")},
	})
	require.NoError(t, err)
}

func TestClineProviderChatStream_Success(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		assert.Equal(t, "text/event-stream", r.Header.Get("Accept"))
		w.Header().Set("Content-Type", "text/event-stream")
		w.WriteHeader(http.StatusOK)

		data, _ := json.Marshal(clineStreamResponse{
			ID:      "1",
			Object:  "chat.completion.chunk",
			Created: 123,
			Model:   "cline-model",
			Choices: []struct {
				Index int `json:"index"`
				Delta struct {
					Role             string `json:"role,omitempty"`
					Content          string `json:"content,omitempty"`
					ReasoningContent string `json:"reasoning_content,omitempty"`
				} `json:"delta"`
				FinishReason string `json:"finish_reason,omitempty"`
			}{
				{
					Index: 0,
					Delta: struct {
						Role             string `json:"role,omitempty"`
						Content          string `json:"content,omitempty"`
						ReasoningContent string `json:"reasoning_content,omitempty"`
					}{Content: "Hello", ReasoningContent: "thinking..."},
				},
			},
		})
		w.Write([]byte("data: " + string(data) + "\n\n"))
		w.Write([]byte("data: [DONE]\n\n"))
	}))
	defer srv.Close()

	p := NewClineProvider(ClineConfig{BaseURL: srv.URL, APIKey: "key", Model: "cline-model"})
	chunks, err := p.ChatStream(context.Background(), ChatRequest{
		Messages: []Message{UserMessage("hi")},
	})
	require.NoError(t, err)

	var contents []string
	var reasonings []string
	for chunk := range chunks {
		if chunk.Done {
			break
		}
		if chunk.Error != nil {
			t.Fatal(chunk.Error)
		}
		contents = append(contents, chunk.Content)
		reasonings = append(reasonings, chunk.ReasoningContent)
	}
	assert.Equal(t, []string{"Hello"}, contents)
	assert.Equal(t, []string{"thinking..."}, reasonings)
}

func TestClineProviderChatStream_RateLimited(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusTooManyRequests)
	}))
	defer srv.Close()

	p := NewClineProvider(ClineConfig{BaseURL: srv.URL, APIKey: "key"})
	_, err := p.ChatStream(context.Background(), ChatRequest{
		Messages: []Message{UserMessage("hi")},
	})
	assert.ErrorIs(t, err, ErrRateLimited)
}

func TestClineProviderChatStream_APIError(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
	}))
	defer srv.Close()

	p := NewClineProvider(ClineConfig{BaseURL: srv.URL, APIKey: "key"})
	_, err := p.ChatStream(context.Background(), ChatRequest{
		Messages: []Message{UserMessage("hi")},
	})
	require.Error(t, err)
	assert.Contains(t, err.Error(), "API error")
}

func TestClineProviderChatStream_RequestError(t *testing.T) {
	p := NewClineProvider(ClineConfig{BaseURL: "http://invalid.invalid", APIKey: "key", Timeout: time.Millisecond})
	_, err := p.ChatStream(context.Background(), ChatRequest{
		Messages: []Message{UserMessage("hi")},
	})
	require.Error(t, err)
	assert.Contains(t, err.Error(), "request failed")
}

func TestClineProviderHealthCheck(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		resp := clineResponse{
			Success: true,
			Data: clineResponseData{
				Model: "test",
				Choices: []struct {
					Index   int `json:"index"`
					Message struct {
						Role             string `json:"role"`
						Content          string `json:"content"`
						ReasoningContent string `json:"reasoning_content"`
					} `json:"message"`
					FinishReason string `json:"finish_reason"`
				}{
					{
						Index: 0,
						Message: struct {
							Role             string `json:"role"`
							Content          string `json:"content"`
							ReasoningContent string `json:"reasoning_content"`
						}{Role: "assistant", Content: "pong"},
						FinishReason: "stop",
					},
				},
			},
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
	}))
	defer srv.Close()

	p := NewClineProvider(ClineConfig{BaseURL: srv.URL, APIKey: "key"})
	err := p.HealthCheck(context.Background())
	assert.NoError(t, err)
}

func TestClineProviderHealthCheck_Failure(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusServiceUnavailable)
	}))
	defer srv.Close()

	p := NewClineProvider(ClineConfig{BaseURL: srv.URL, APIKey: "key"})
	err := p.HealthCheck(context.Background())
	require.Error(t, err)
	assert.Contains(t, err.Error(), "health check failed")
}
