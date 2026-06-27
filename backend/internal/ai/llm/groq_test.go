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

func TestNewGroqProviderDefaults(t *testing.T) {
	p := NewGroqProvider(GroqConfig{APIKey: "test-key"})
	assert.Equal(t, "https://api.groq.com/openai/v1", p.baseURL)
	assert.Equal(t, "openai/gpt-oss-120b", p.model)
	assert.Equal(t, 60*time.Second, p.client.Timeout)
	assert.Equal(t, 2, p.maxRetry)
	assert.Equal(t, "test-key", p.apiKey)
}

func TestNewGroqProviderCustom(t *testing.T) {
	p := NewGroqProvider(GroqConfig{
		BaseURL:  "https://custom.groq.com/v1",
		APIKey:   "custom-key",
		Model:    "custom-model",
		Timeout:  30 * time.Second,
		MaxRetry: 5,
	})
	assert.Equal(t, "https://custom.groq.com/v1", p.baseURL)
	assert.Equal(t, "custom-model", p.model)
	assert.Equal(t, 30*time.Second, p.client.Timeout)
	assert.Equal(t, 5, p.maxRetry)
}

func TestGroqProviderName(t *testing.T) {
	p := NewGroqProvider(GroqConfig{APIKey: "key"})
	assert.Equal(t, "groq", p.Name())
}

func TestGroqProviderChat_Success(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		assert.Equal(t, "POST", r.Method)
		assert.Equal(t, "/chat/completions", r.URL.Path)
		assert.Equal(t, "Bearer test-key", r.Header.Get("Authorization"))
		assert.Equal(t, "application/json", r.Header.Get("Content-Type"))

		var req groqRequest
		err := json.NewDecoder(r.Body).Decode(&req)
		require.NoError(t, err)
		assert.Equal(t, "gpt-model", req.Model)
		assert.False(t, req.Stream)
		assert.Len(t, req.Messages, 2)

		resp := groqResponse{
			ID:      "chatcmpl-123",
			Object:  "chat.completion",
			Created: 1234567890,
			Model:   "gpt-model",
			Choices: []struct {
				Index   int `json:"index"`
				Message struct {
					Role    string `json:"role"`
					Content string `json:"content"`
				} `json:"message"`
				FinishReason string `json:"finish_reason"`
			}{
				{
					Index: 0,
					Message: struct {
						Role    string `json:"role"`
						Content string `json:"content"`
					}{
						Role:    "assistant",
						Content: "Hello from Groq",
					},
					FinishReason: "stop",
				},
			},
			Usage: struct {
				PromptTokens     int `json:"prompt_tokens"`
				CompletionTokens int `json:"completion_tokens"`
				TotalTokens      int `json:"total_tokens"`
			}{
				PromptTokens:     10,
				CompletionTokens: 20,
				TotalTokens:      30,
			},
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
	}))
	defer srv.Close()

	p := NewGroqProvider(GroqConfig{
		BaseURL: srv.URL,
		APIKey:  "test-key",
		Model:   "gpt-model",
	})

	resp, err := p.Chat(context.Background(), ChatRequest{
		Messages: []Message{
			SystemMessage("You are a tutor"),
			UserMessage("Hello"),
		},
	})
	require.NoError(t, err)
	assert.Equal(t, "Hello from Groq", resp.Content)
	assert.Equal(t, "gpt-model", resp.Model)
	assert.Equal(t, 10, resp.TokensInput)
	assert.Equal(t, 20, resp.TokensOutput)
	assert.Equal(t, "stop", resp.FinishReason)
}

func TestGroqProviderChat_RateLimited(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusTooManyRequests)
	}))
	defer srv.Close()

	p := NewGroqProvider(GroqConfig{BaseURL: srv.URL, APIKey: "key"})
	_, err := p.Chat(context.Background(), ChatRequest{
		Messages: []Message{UserMessage("hi")},
	})
	assert.ErrorIs(t, err, ErrRateLimited)
}

func TestGroqProviderChat_APIError(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(`{"error": "bad request"}`))
	}))
	defer srv.Close()

	p := NewGroqProvider(GroqConfig{BaseURL: srv.URL, APIKey: "key"})
	_, err := p.Chat(context.Background(), ChatRequest{
		Messages: []Message{UserMessage("hi")},
	})
	require.Error(t, err)
	assert.Contains(t, err.Error(), "API error")
	assert.Contains(t, err.Error(), "400")
}

func TestGroqProviderChat_EmptyChoices(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		resp := groqResponse{
			ID:      "chatcmpl-123",
			Object:  "chat.completion",
			Created: 1234567890,
			Model:   "test",
			Choices: []struct {
				Index   int `json:"index"`
				Message struct {
					Role    string `json:"role"`
					Content string `json:"content"`
				} `json:"message"`
				FinishReason string `json:"finish_reason"`
			}{},
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
	}))
	defer srv.Close()

	p := NewGroqProvider(GroqConfig{BaseURL: srv.URL, APIKey: "key"})
	_, err := p.Chat(context.Background(), ChatRequest{
		Messages: []Message{UserMessage("hi")},
	})
	assert.ErrorIs(t, err, ErrInvalidResponse)
}

func TestGroqProviderChat_RequestError(t *testing.T) {
	p := NewGroqProvider(GroqConfig{BaseURL: "http://invalid.invalid", APIKey: "key", Timeout: time.Millisecond})
	_, err := p.Chat(context.Background(), ChatRequest{
		Messages: []Message{UserMessage("hi")},
	})
	require.Error(t, err)
	assert.Contains(t, err.Error(), "request failed")
}

func TestGroqProviderChat_CustomModel(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var req groqRequest
		json.NewDecoder(r.Body).Decode(&req)
		assert.Equal(t, "custom-model", req.Model)

		resp := groqResponse{
			Model: "custom-model",
			Choices: []struct {
				Index   int `json:"index"`
				Message struct {
					Role    string `json:"role"`
					Content string `json:"content"`
				} `json:"message"`
				FinishReason string `json:"finish_reason"`
			}{
				{
					Index: 0,
					Message: struct {
						Role    string `json:"role"`
						Content string `json:"content"`
					}{Role: "assistant", Content: "ok"},
					FinishReason: "stop",
				},
			},
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
	}))
	defer srv.Close()

	p := NewGroqProvider(GroqConfig{BaseURL: srv.URL, APIKey: "key", Model: "default"})
	_, err := p.Chat(context.Background(), ChatRequest{
		Model:    "custom-model",
		Messages: []Message{UserMessage("hi")},
	})
	require.NoError(t, err)
}

func TestGroqProviderChatStream_Success(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		assert.Equal(t, "text/event-stream", r.Header.Get("Accept"))

		var req groqRequest
		json.NewDecoder(r.Body).Decode(&req)
		assert.True(t, req.Stream)

		w.Header().Set("Content-Type", "text/event-stream")
		w.WriteHeader(http.StatusOK)

		data, _ := json.Marshal(groqStreamResponse{
			ID:      "1",
			Object:  "chat.completion.chunk",
			Created: 123,
			Model:   "gpt-model",
			Choices: []struct {
				Index int `json:"index"`
				Delta struct {
					Role    string `json:"role,omitempty"`
					Content string `json:"content,omitempty"`
				} `json:"delta"`
				FinishReason string `json:"finish_reason,omitempty"`
			}{
				{
					Index: 0,
					Delta: struct {
						Role    string `json:"role,omitempty"`
						Content string `json:"content,omitempty"`
					}{Content: "Hello"},
				},
			},
		})
		w.Write([]byte("data: " + string(data) + "\n\n"))
		w.Write([]byte("data: [DONE]\n\n"))
	}))
	defer srv.Close()

	p := NewGroqProvider(GroqConfig{BaseURL: srv.URL, APIKey: "key", Model: "gpt-model"})
	chunks, err := p.ChatStream(context.Background(), ChatRequest{
		Messages: []Message{UserMessage("hi")},
	})
	require.NoError(t, err)

	var contents []string
	for chunk := range chunks {
		if chunk.Done {
			break
		}
		if chunk.Error != nil {
			t.Fatal(chunk.Error)
		}
		contents = append(contents, chunk.Content)
	}
	assert.Equal(t, []string{"Hello"}, contents)
}

func TestGroqProviderChatStream_RateLimited(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusTooManyRequests)
	}))
	defer srv.Close()

	p := NewGroqProvider(GroqConfig{BaseURL: srv.URL, APIKey: "key"})
	_, err := p.ChatStream(context.Background(), ChatRequest{
		Messages: []Message{UserMessage("hi")},
	})
	assert.ErrorIs(t, err, ErrRateLimited)
}

func TestGroqProviderChatStream_APIError(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(`{"error": "server error"}`))
	}))
	defer srv.Close()

	p := NewGroqProvider(GroqConfig{BaseURL: srv.URL, APIKey: "key"})
	_, err := p.ChatStream(context.Background(), ChatRequest{
		Messages: []Message{UserMessage("hi")},
	})
	require.Error(t, err)
	assert.Contains(t, err.Error(), "API error")
}

func TestGroqProviderChatStream_RequestError(t *testing.T) {
	p := NewGroqProvider(GroqConfig{BaseURL: "http://invalid.invalid", APIKey: "key", Timeout: time.Millisecond})
	_, err := p.ChatStream(context.Background(), ChatRequest{
		Messages: []Message{UserMessage("hi")},
	})
	require.Error(t, err)
	assert.Contains(t, err.Error(), "request failed")
}

func TestGroqProviderChatStream_FinishReason(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/event-stream")
		w.WriteHeader(http.StatusOK)

		data, _ := json.Marshal(groqStreamResponse{
			ID:      "1",
			Object:  "chat.completion.chunk",
			Created: 123,
			Model:   "test",
			Choices: []struct {
				Index int `json:"index"`
				Delta struct {
					Role    string `json:"role,omitempty"`
					Content string `json:"content,omitempty"`
				} `json:"delta"`
				FinishReason string `json:"finish_reason,omitempty"`
			}{
				{
					Index: 0,
					Delta: struct {
						Role    string `json:"role,omitempty"`
						Content string `json:"content,omitempty"`
					}{Content: "Hello"},
					FinishReason: "stop",
				},
			},
		})
		w.Write([]byte("data: " + string(data) + "\n\n"))
	}))
	defer srv.Close()

	p := NewGroqProvider(GroqConfig{BaseURL: srv.URL, APIKey: "key"})
	chunks, err := p.ChatStream(context.Background(), ChatRequest{
		Messages: []Message{UserMessage("hi")},
	})
	require.NoError(t, err)

	var received []string
	for chunk := range chunks {
		if chunk.Done {
			break
		}
		if chunk.Error != nil {
			t.Fatal(chunk.Error)
		}
		received = append(received, chunk.Content)
	}
	assert.Equal(t, []string{"Hello"}, received)
}

func TestGroqProviderHealthCheck(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		resp := groqResponse{
			Model: "test",
			Choices: []struct {
				Index   int `json:"index"`
				Message struct {
					Role    string `json:"role"`
					Content string `json:"content"`
				} `json:"message"`
				FinishReason string `json:"finish_reason"`
			}{
				{
					Index: 0,
					Message: struct {
						Role    string `json:"role"`
						Content string `json:"content"`
					}{Role: "assistant", Content: "pong"},
					FinishReason: "stop",
				},
			},
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
	}))
	defer srv.Close()

	p := NewGroqProvider(GroqConfig{BaseURL: srv.URL, APIKey: "key"})
	err := p.HealthCheck(context.Background())
	assert.NoError(t, err)
}

func TestGroqProviderHealthCheck_Failure(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusServiceUnavailable)
	}))
	defer srv.Close()

	p := NewGroqProvider(GroqConfig{BaseURL: srv.URL, APIKey: "key"})
	err := p.HealthCheck(context.Background())
	require.Error(t, err)
	assert.Contains(t, err.Error(), "health check failed")
}
