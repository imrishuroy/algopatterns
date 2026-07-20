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

// testDeepSeekResponse is a test helper for building DeepSeek API responses
type testDeepSeekResponse struct {
	ID      string               `json:"id"`
	Object  string               `json:"object"`
	Created int64                `json:"created"`
	Model   string               `json:"model"`
	Choices []testDeepSeekChoice `json:"choices"`
	Usage   testDeepSeekUsage    `json:"usage,omitempty"`
}

type testDeepSeekChoice struct {
	Index        int                 `json:"index"`
	Message      testDeepSeekMessage `json:"message,omitempty"`
	Delta        testDeepSeekDelta   `json:"delta,omitempty"`
	FinishReason string              `json:"finish_reason,omitempty"`
}

type testDeepSeekMessage struct {
	Role             string `json:"role"`
	Content          string `json:"content"`
	ReasoningContent string `json:"reasoning_content,omitempty"`
}

type testDeepSeekDelta struct {
	Role             string `json:"role,omitempty"`
	Content          string `json:"content,omitempty"`
	ReasoningContent string `json:"reasoning_content,omitempty"`
}

type testDeepSeekUsage struct {
	PromptTokens     int `json:"prompt_tokens"`
	CompletionTokens int `json:"completion_tokens"`
	TotalTokens      int `json:"total_tokens"`
	ReasoningTokens  int `json:"reasoning_tokens,omitempty"`
}

func TestNewDeepSeekProviderDefaults(t *testing.T) {
	p := NewDeepSeekProvider(DeepSeekConfig{APIKey: "test-key"})
	assert.Equal(t, "https://api.deepseek.com/v1", p.baseURL)
	assert.Equal(t, "deepseek-v4-pro", p.model)
	assert.Equal(t, 30*time.Second, p.client.Timeout)
	assert.Equal(t, 2, p.maxRetry)
	assert.Equal(t, "test-key", p.apiKey)
}

func TestNewDeepSeekProviderCustom(t *testing.T) {
	p := NewDeepSeekProvider(DeepSeekConfig{
		BaseURL:  "https://custom.deepseek.com/v1",
		APIKey:   "custom-key",
		Model:    "custom-model",
		Timeout:  60 * time.Second,
		MaxRetry: 5,
	})
	assert.Equal(t, "https://custom.deepseek.com/v1", p.baseURL)
	assert.Equal(t, "custom-model", p.model)
	assert.Equal(t, 60*time.Second, p.client.Timeout)
	assert.Equal(t, 5, p.maxRetry)
}

func TestDeepSeekProviderName(t *testing.T) {
	p := NewDeepSeekProvider(DeepSeekConfig{APIKey: "key"})
	assert.Equal(t, "deepseek", p.Name())
}

func TestDeepSeekProviderChat_Success(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		assert.Equal(t, "POST", r.Method)
		assert.Equal(t, "/chat/completions", r.URL.Path)
		assert.Equal(t, "Bearer test-key", r.Header.Get("Authorization"))
		assert.Equal(t, "application/json", r.Header.Get("Content-Type"))

		var req deepseekRequest
		err := json.NewDecoder(r.Body).Decode(&req)
		require.NoError(t, err)
		assert.Equal(t, "deepseek-v4-pro", req.Model)
		assert.False(t, req.Stream)
		assert.Len(t, req.Messages, 2)

		resp := testDeepSeekResponse{
			ID:      "chatcmpl-123",
			Object:  "chat.completion",
			Created: 1234567890,
			Model:   "deepseek-v4-pro",
			Choices: []testDeepSeekChoice{{
				Index: 0,
				Message: testDeepSeekMessage{
					Role:    "assistant",
					Content: "Hello from DeepSeek",
				},
				FinishReason: "stop",
			}},
			Usage: testDeepSeekUsage{
				PromptTokens:     10,
				CompletionTokens: 20,
				TotalTokens:      30,
			},
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
	}))
	defer srv.Close()

	p := NewDeepSeekProvider(DeepSeekConfig{
		BaseURL: srv.URL,
		APIKey:  "test-key",
		Model:   "deepseek-v4-pro",
	})

	resp, err := p.Chat(context.Background(), ChatRequest{
		Messages: []Message{
			SystemMessage("You are a tutor"),
			UserMessage("Hello"),
		},
	})
	require.NoError(t, err)
	assert.Equal(t, "Hello from DeepSeek", resp.Content)
	assert.Equal(t, "deepseek-v4-pro", resp.Model)
	assert.Equal(t, 10, resp.TokensInput)
	assert.Equal(t, 20, resp.TokensOutput)
	assert.Equal(t, "stop", resp.FinishReason)
}

func TestDeepSeekProviderChat_WithReasoning(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var req deepseekRequest
		json.NewDecoder(r.Body).Decode(&req)
		assert.Equal(t, "high", req.ReasoningEffort)
		assert.True(t, *req.IncludeReasoning)
		assert.NotNil(t, req.Thinking)
		assert.Equal(t, "enabled", req.Thinking.Type)

		resp := testDeepSeekResponse{
			Model: "deepseek-v4-pro",
			Choices: []testDeepSeekChoice{{
				Message: testDeepSeekMessage{
					Role:             "assistant",
					Content:          "final answer",
					ReasoningContent: "thinking process",
				},
				FinishReason: "stop",
			}},
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
	}))
	defer srv.Close()

	includeReasoning := true
	p := NewDeepSeekProvider(DeepSeekConfig{
		BaseURL:          srv.URL,
		APIKey:           "key",
		Model:            "deepseek-v4-pro",
		ReasoningEffort:  "high",
		IncludeReasoning: &includeReasoning,
	})

	resp, err := p.Chat(context.Background(), ChatRequest{
		Messages: []Message{UserMessage("hi")},
	})
	require.NoError(t, err)
	assert.Equal(t, "final answer", resp.Content)
	assert.Equal(t, "thinking process", resp.ReasoningContent)
}

func TestDeepSeekProviderChat_RateLimited(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusTooManyRequests)
	}))
	defer srv.Close()

	p := NewDeepSeekProvider(DeepSeekConfig{BaseURL: srv.URL, APIKey: "key"})
	_, err := p.Chat(context.Background(), ChatRequest{
		Messages: []Message{UserMessage("hi")},
	})
	assert.ErrorIs(t, err, ErrRateLimited)
}

func TestDeepSeekProviderChat_APIError(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(`{"error": "bad request"}`))
	}))
	defer srv.Close()

	p := NewDeepSeekProvider(DeepSeekConfig{BaseURL: srv.URL, APIKey: "key"})
	_, err := p.Chat(context.Background(), ChatRequest{
		Messages: []Message{UserMessage("hi")},
	})
	require.Error(t, err)
	assert.Contains(t, err.Error(), "API error")
	assert.Contains(t, err.Error(), "400")
}

func TestDeepSeekProviderChat_EmptyChoices(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		resp := testDeepSeekResponse{
			ID:      "chatcmpl-123",
			Object:  "chat.completion",
			Created: 1234567890,
			Model:   "test",
			Choices: []testDeepSeekChoice{},
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
	}))
	defer srv.Close()

	p := NewDeepSeekProvider(DeepSeekConfig{BaseURL: srv.URL, APIKey: "key"})
	_, err := p.Chat(context.Background(), ChatRequest{
		Messages: []Message{UserMessage("hi")},
	})
	assert.ErrorIs(t, err, ErrInvalidResponse)
}

func TestDeepSeekProviderChat_RequestError(t *testing.T) {
	p := NewDeepSeekProvider(DeepSeekConfig{BaseURL: "http://invalid.invalid", APIKey: "key", Timeout: time.Millisecond})
	_, err := p.Chat(context.Background(), ChatRequest{
		Messages: []Message{UserMessage("hi")},
	})
	require.Error(t, err)
	assert.Contains(t, err.Error(), "request failed")
}

func TestDeepSeekProviderChat_CustomModel(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var req deepseekRequest
		json.NewDecoder(r.Body).Decode(&req)
		assert.Equal(t, "custom-model", req.Model)

		resp := testDeepSeekResponse{
			Model: "custom-model",
			Choices: []testDeepSeekChoice{{
				Message: testDeepSeekMessage{
					Role:    "assistant",
					Content: "ok",
				},
				FinishReason: "stop",
			}},
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
	}))
	defer srv.Close()

	p := NewDeepSeekProvider(DeepSeekConfig{BaseURL: srv.URL, APIKey: "key", Model: "default"})
	_, err := p.Chat(context.Background(), ChatRequest{
		Model:    "custom-model",
		Messages: []Message{UserMessage("hi")},
	})
	require.NoError(t, err)
}

func TestDeepSeekProviderChatStream_Success(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		assert.Equal(t, "text/event-stream", r.Header.Get("Accept"))

		var req deepseekRequest
		json.NewDecoder(r.Body).Decode(&req)
		assert.True(t, req.Stream)

		w.Header().Set("Content-Type", "text/event-stream")
		w.WriteHeader(http.StatusOK)

		resp := testDeepSeekResponse{
			ID:      "1",
			Object:  "chat.completion.chunk",
			Created: 123,
			Model:   "deepseek-v4-pro",
			Choices: []testDeepSeekChoice{{
				Index: 0,
				Delta: testDeepSeekDelta{Content: "Hello"},
			}},
		}
		data, _ := json.Marshal(resp)
		w.Write([]byte("data: " + string(data) + "\n\n"))
		w.Write([]byte("data: [DONE]\n\n"))
	}))
	defer srv.Close()

	p := NewDeepSeekProvider(DeepSeekConfig{BaseURL: srv.URL, APIKey: "key", Model: "deepseek-v4-pro"})
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

func TestDeepSeekProviderChatStream_WithReasoning(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "text/event-stream")
		w.WriteHeader(http.StatusOK)

		// reasoning chunk
		resp1 := testDeepSeekResponse{
			ID:      "1",
			Object:  "chat.completion.chunk",
			Created: 123,
			Model:   "deepseek-v4-pro",
			Choices: []testDeepSeekChoice{{
				Delta: testDeepSeekDelta{ReasoningContent: "thinking..."},
			}},
		}
		data1, _ := json.Marshal(resp1)
		w.Write([]byte("data: " + string(data1) + "\n\n"))

		// content chunk
		resp2 := testDeepSeekResponse{
			ID:      "2",
			Object:  "chat.completion.chunk",
			Created: 124,
			Model:   "deepseek-v4-pro",
			Choices: []testDeepSeekChoice{{
				Delta: testDeepSeekDelta{Content: "answer"},
			}},
		}
		data2, _ := json.Marshal(resp2)
		w.Write([]byte("data: " + string(data2) + "\n\n"))

		w.Write([]byte("data: [DONE]\n\n"))
	}))
	defer srv.Close()

	p := NewDeepSeekProvider(DeepSeekConfig{BaseURL: srv.URL, APIKey: "key", Model: "deepseek-v4-pro"})
	chunks, err := p.ChatStream(context.Background(), ChatRequest{
		Messages: []Message{UserMessage("hi")},
	})
	require.NoError(t, err)

	var contents []string
	var reasoning []string
	for chunk := range chunks {
		if chunk.Done {
			break
		}
		if chunk.Error != nil {
			t.Fatal(chunk.Error)
		}
		if chunk.Content != "" {
			contents = append(contents, chunk.Content)
		}
		if chunk.ReasoningContent != "" {
			reasoning = append(reasoning, chunk.ReasoningContent)
		}
	}
	assert.Equal(t, []string{"answer"}, contents)
	assert.Equal(t, []string{"thinking..."}, reasoning)
}

func TestDeepSeekProviderChatStream_RateLimited(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusTooManyRequests)
	}))
	defer srv.Close()

	p := NewDeepSeekProvider(DeepSeekConfig{BaseURL: srv.URL, APIKey: "key"})
	_, err := p.ChatStream(context.Background(), ChatRequest{
		Messages: []Message{UserMessage("hi")},
	})
	assert.ErrorIs(t, err, ErrRateLimited)
}

func TestDeepSeekProviderChatStream_APIError(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(`{"error": "server error"}`))
	}))
	defer srv.Close()

	p := NewDeepSeekProvider(DeepSeekConfig{BaseURL: srv.URL, APIKey: "key"})
	_, err := p.ChatStream(context.Background(), ChatRequest{
		Messages: []Message{UserMessage("hi")},
	})
	require.Error(t, err)
	assert.Contains(t, err.Error(), "API error")
}

func TestDeepSeekProviderChatStream_RequestError(t *testing.T) {
	p := NewDeepSeekProvider(DeepSeekConfig{BaseURL: "http://invalid.invalid", APIKey: "key", Timeout: time.Millisecond})
	_, err := p.ChatStream(context.Background(), ChatRequest{
		Messages: []Message{UserMessage("hi")},
	})
	require.Error(t, err)
	assert.Contains(t, err.Error(), "request failed")
}

func TestDeepSeekProviderChatStream_FinishReason(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "text/event-stream")
		w.WriteHeader(http.StatusOK)

		resp := testDeepSeekResponse{
			ID:      "1",
			Object:  "chat.completion.chunk",
			Created: 123,
			Model:   "test",
			Choices: []testDeepSeekChoice{{
				Delta:        testDeepSeekDelta{Content: "Hello"},
				FinishReason: "stop",
			}},
		}
		data, _ := json.Marshal(resp)
		w.Write([]byte("data: " + string(data) + "\n\n"))
	}))
	defer srv.Close()

	p := NewDeepSeekProvider(DeepSeekConfig{BaseURL: srv.URL, APIKey: "key"})
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

func TestDeepSeekProviderHealthCheck(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		resp := testDeepSeekResponse{
			Model: "test",
			Choices: []testDeepSeekChoice{{
				Message: testDeepSeekMessage{
					Role:    "assistant",
					Content: "pong",
				},
				FinishReason: "stop",
			}},
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
	}))
	defer srv.Close()

	p := NewDeepSeekProvider(DeepSeekConfig{BaseURL: srv.URL, APIKey: "key"})
	err := p.HealthCheck(context.Background())
	assert.NoError(t, err)
}

func TestDeepSeekProviderHealthCheck_Failure(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusServiceUnavailable)
	}))
	defer srv.Close()

	p := NewDeepSeekProvider(DeepSeekConfig{BaseURL: srv.URL, APIKey: "key"})
	err := p.HealthCheck(context.Background())
	require.Error(t, err)
	assert.Contains(t, err.Error(), "health check failed")
}

func TestDeepSeekProviderChat_InvalidJSON(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{invalid json`))
	}))
	defer srv.Close()

	p := NewDeepSeekProvider(DeepSeekConfig{BaseURL: srv.URL, APIKey: "key"})
	_, err := p.Chat(context.Background(), ChatRequest{
		Messages: []Message{UserMessage("hi")},
	})
	require.Error(t, err)
	assert.Contains(t, err.Error(), "failed to decode response")
}
