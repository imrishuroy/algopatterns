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

// testGroqResponse is a test helper for building Groq API responses
type testGroqResponse struct {
	ID      string           `json:"id"`
	Object  string           `json:"object"`
	Created int64            `json:"created"`
	Model   string           `json:"model"`
	Choices []testGroqChoice `json:"choices"`
	Usage   testGroqUsage    `json:"usage,omitempty"`
}

type testGroqChoice struct {
	Index        int             `json:"index"`
	Message      testGroqMessage `json:"message,omitempty"`
	Delta        testGroqDelta   `json:"delta,omitempty"`
	FinishReason string          `json:"finish_reason,omitempty"`
}

type testGroqMessage struct {
	Role      string `json:"role"`
	Content   string `json:"content"`
	Reasoning string `json:"reasoning,omitempty"`
}

type testGroqDelta struct {
	Role      string `json:"role,omitempty"`
	Content   string `json:"content,omitempty"`
	Reasoning string `json:"reasoning,omitempty"`
}

type testGroqUsage struct {
	PromptTokens     int `json:"prompt_tokens"`
	CompletionTokens int `json:"completion_tokens"`
	TotalTokens      int `json:"total_tokens"`
}

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
		assert.Empty(t, req.ReasoningEffort)
		assert.Nil(t, req.IncludeReasoning)
		assert.Len(t, req.Messages, 2)

		resp := testGroqResponse{
			ID:      "chatcmpl-123",
			Object:  "chat.completion",
			Created: 1234567890,
			Model:   "gpt-model",
			Choices: []testGroqChoice{{
				Index: 0,
				Message: testGroqMessage{
					Role:    "assistant",
					Content: "Hello from Groq",
				},
				FinishReason: "stop",
			}},
			Usage: testGroqUsage{
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

func TestGroqProviderChat_ReasoningFields(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var req groqRequest
		json.NewDecoder(r.Body).Decode(&req)
		assert.Equal(t, "high", req.ReasoningEffort)
		assert.False(t, *req.IncludeReasoning)

		resp := testGroqResponse{
			Model: "openai/gpt-oss-120b",
			Choices: []testGroqChoice{{
				Message: testGroqMessage{
					Role:    "assistant",
					Content: "reasoned answer",
				},
			}},
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
	}))
	defer srv.Close()

	p := NewGroqProvider(GroqConfig{
		BaseURL:          srv.URL,
		APIKey:           "key",
		Model:            "openai/gpt-oss-120b",
		ReasoningEffort:  "high",
		IncludeReasoning: boolPtr(false),
	})

	resp, err := p.Chat(context.Background(), ChatRequest{
		Messages: []Message{UserMessage("hi")},
	})
	require.NoError(t, err)
	assert.Equal(t, "reasoned answer", resp.Content)
}

func TestGroqProviderChat_RateLimited(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
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
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
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
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		resp := testGroqResponse{
			ID:      "chatcmpl-123",
			Object:  "chat.completion",
			Created: 1234567890,
			Model:   "test",
			Choices: []testGroqChoice{},
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

		resp := testGroqResponse{
			Model: "custom-model",
			Choices: []testGroqChoice{{
				Message: testGroqMessage{
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

		resp := testGroqResponse{
			ID:      "1",
			Object:  "chat.completion.chunk",
			Created: 123,
			Model:   "gpt-model",
			Choices: []testGroqChoice{{
				Index: 0,
				Delta: testGroqDelta{Content: "Hello"},
			}},
		}
		data, _ := json.Marshal(resp)
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

func TestGroqProviderChatStream_SkipsReasoningChunks(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "text/event-stream")
		w.WriteHeader(http.StatusOK)

		// reasoning chunk (should be skipped in output)
		resp1 := testGroqResponse{
			ID:      "1",
			Object:  "chat.completion.chunk",
			Created: 123,
			Model:   "gpt-model",
			Choices: []testGroqChoice{{
				Delta: testGroqDelta{Reasoning: "thinking..."},
			}},
		}
		data1, _ := json.Marshal(resp1)
		w.Write([]byte("data: " + string(data1) + "\n\n"))

		// content chunk (should be forwarded)
		resp2 := testGroqResponse{
			ID:      "2",
			Object:  "chat.completion.chunk",
			Created: 124,
			Model:   "gpt-model",
			Choices: []testGroqChoice{{
				Delta: testGroqDelta{Content: "answer"},
			}},
		}
		data2, _ := json.Marshal(resp2)
		w.Write([]byte("data: " + string(data2) + "\n\n"))

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
	assert.Equal(t, []string{"answer"}, contents)
}

func TestGroqProviderChatStream_RateLimited(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
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
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
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
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "text/event-stream")
		w.WriteHeader(http.StatusOK)

		resp := testGroqResponse{
			ID:      "1",
			Object:  "chat.completion.chunk",
			Created: 123,
			Model:   "test",
			Choices: []testGroqChoice{{
				Delta:        testGroqDelta{Content: "Hello"},
				FinishReason: "stop",
			}},
		}
		data, _ := json.Marshal(resp)
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
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		resp := testGroqResponse{
			Model: "test",
			Choices: []testGroqChoice{{
				Message: testGroqMessage{
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

	p := NewGroqProvider(GroqConfig{BaseURL: srv.URL, APIKey: "key"})
	err := p.HealthCheck(context.Background())
	assert.NoError(t, err)
}

func TestGroqProviderHealthCheck_Failure(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusServiceUnavailable)
	}))
	defer srv.Close()

	p := NewGroqProvider(GroqConfig{BaseURL: srv.URL, APIKey: "key"})
	err := p.HealthCheck(context.Background())
	require.Error(t, err)
	assert.Contains(t, err.Error(), "health check failed")
}

func boolPtr(b bool) *bool {
	return &b
}
