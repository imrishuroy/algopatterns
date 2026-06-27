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

func TestNewNVIDIAProviderDefaults(t *testing.T) {
	p := NewNVIDIAProvider(NVIDIAConfig{APIKey: "test-key"})
	assert.Equal(t, "https://integrate.api.nvidia.com/v1", p.baseURL)
	assert.Equal(t, "deepseek-ai/deepseek-v4-flash", p.model)
	assert.Equal(t, 60*time.Second, p.client.Timeout)
	assert.Equal(t, 2, p.maxRetry)
	assert.Equal(t, "test-key", p.apiKey)
}

func TestNewNVIDIAProviderCustom(t *testing.T) {
	p := NewNVIDIAProvider(NVIDIAConfig{
		BaseURL:  "https://custom.nvidia.com/v1/",
		APIKey:   "custom-key",
		Model:    "custom-model",
		Timeout:  45 * time.Second,
		MaxRetry: 3,
	})
	assert.Equal(t, "https://custom.nvidia.com/v1", p.baseURL)
	assert.Equal(t, "custom-model", p.model)
	assert.Equal(t, 45*time.Second, p.client.Timeout)
	assert.Equal(t, 3, p.maxRetry)
}

func TestNVIDIAProviderName(t *testing.T) {
	p := NewNVIDIAProvider(NVIDIAConfig{APIKey: "key"})
	assert.Equal(t, "nvidia", p.Name())
}

func TestNVIDIAProviderChat_Success(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		assert.Equal(t, "POST", r.Method)
		assert.Equal(t, "/chat/completions", r.URL.Path)
		assert.Equal(t, "Bearer nv-key", r.Header.Get("Authorization"))
		assert.Equal(t, "application/json", r.Header.Get("Content-Type"))

		var req nvidiaRequest
		err := json.NewDecoder(r.Body).Decode(&req)
		require.NoError(t, err)
		assert.Equal(t, "nv-model", req.Model)
		assert.False(t, req.Stream)
		assert.Len(t, req.Messages, 2)

		resp := nvidiaResponse{
			ID:      "chatcmpl-nv1",
			Object:  "chat.completion",
			Created: 1234567890,
			Model:   "nv-model",
			Choices: []struct {
				Index   int `json:"index"`
				Message struct {
					Role             string `json:"role"`
					Content          string `json:"content"`
					ReasoningContent string `json:"reasoning_content"`
					Reasoning        string `json:"reasoning"`
				} `json:"message"`
				FinishReason string `json:"finish_reason"`
			}{
				{
					Index: 0,
					Message: struct {
						Role             string `json:"role"`
						Content          string `json:"content"`
						ReasoningContent string `json:"reasoning_content"`
						Reasoning        string `json:"reasoning"`
					}{
						Role:             "assistant",
						Content:          "Hello from NVIDIA",
						ReasoningContent: "I think therefore I am",
						Reasoning:        "",
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
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
	}))
	defer srv.Close()

	p := NewNVIDIAProvider(NVIDIAConfig{
		BaseURL: srv.URL,
		APIKey:  "nv-key",
		Model:   "nv-model",
	})

	resp, err := p.Chat(context.Background(), ChatRequest{
		Messages: []Message{
			SystemMessage("You are a tutor"),
			UserMessage("Hello"),
		},
	})
	require.NoError(t, err)
	assert.Equal(t, "Hello from NVIDIA", resp.Content)
	assert.Equal(t, "I think therefore I am", resp.ReasoningContent)
	assert.Equal(t, "nv-model", resp.Model)
	assert.Equal(t, 5, resp.TokensInput)
	assert.Equal(t, 15, resp.TokensOutput)
	assert.Equal(t, "stop", resp.FinishReason)
}

func TestNVIDIAProviderChat_FallbackReasoningField(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		resp := nvidiaResponse{
			Model: "test",
			Choices: []struct {
				Index   int `json:"index"`
				Message struct {
					Role             string `json:"role"`
					Content          string `json:"content"`
					ReasoningContent string `json:"reasoning_content"`
					Reasoning        string `json:"reasoning"`
				} `json:"message"`
				FinishReason string `json:"finish_reason"`
			}{
				{
					Index: 0,
					Message: struct {
						Role             string `json:"role"`
						Content          string `json:"content"`
						ReasoningContent string `json:"reasoning_content"`
						Reasoning        string `json:"reasoning"`
					}{
						Role:             "assistant",
						Content:          "result",
						ReasoningContent: "",
						Reasoning:        "fallback reasoning",
					},
					FinishReason: "stop",
				},
			},
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
	}))
	defer srv.Close()

	p := NewNVIDIAProvider(NVIDIAConfig{BaseURL: srv.URL, APIKey: "key"})
	resp, err := p.Chat(context.Background(), ChatRequest{
		Messages: []Message{UserMessage("hi")},
	})
	require.NoError(t, err)
	assert.Equal(t, "fallback reasoning", resp.ReasoningContent)
}

func TestNVIDIAProviderChat_ExtraBody(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var body map[string]interface{}
		json.NewDecoder(r.Body).Decode(&body)
		assert.Equal(t, float64(0.8), body["temperature"])
		assert.Equal(t, "extra-value", body["extra_field"])

		resp := nvidiaResponse{
			Model: "test",
			Choices: []struct {
				Index   int `json:"index"`
				Message struct {
					Role             string `json:"role"`
					Content          string `json:"content"`
					ReasoningContent string `json:"reasoning_content"`
					Reasoning        string `json:"reasoning"`
				} `json:"message"`
				FinishReason string `json:"finish_reason"`
			}{
				{
					Index: 0,
					Message: struct {
						Role             string `json:"role"`
						Content          string `json:"content"`
						ReasoningContent string `json:"reasoning_content"`
						Reasoning        string `json:"reasoning"`
					}{Role: "assistant", Content: "ok"},
					FinishReason: "stop",
				},
			},
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
	}))
	defer srv.Close()

	p := NewNVIDIAProvider(NVIDIAConfig{BaseURL: srv.URL, APIKey: "key"})
	_, err := p.Chat(context.Background(), ChatRequest{
		Messages:    []Message{UserMessage("hi")},
		Temperature: 0.8,
		ExtraBody:   json.RawMessage(`{"extra_field": "extra-value"}`),
	})
	require.NoError(t, err)
}

func TestNVIDIAProviderChat_RateLimited(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusTooManyRequests)
	}))
	defer srv.Close()

	p := NewNVIDIAProvider(NVIDIAConfig{BaseURL: srv.URL, APIKey: "key"})
	_, err := p.Chat(context.Background(), ChatRequest{
		Messages: []Message{UserMessage("hi")},
	})
	assert.ErrorIs(t, err, ErrRateLimited)
}

func TestNVIDIAProviderChat_APIError(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(`{"error": "bad model"}`))
	}))
	defer srv.Close()

	p := NewNVIDIAProvider(NVIDIAConfig{BaseURL: srv.URL, APIKey: "key"})
	_, err := p.Chat(context.Background(), ChatRequest{
		Messages: []Message{UserMessage("hi")},
	})
	require.Error(t, err)
	assert.Contains(t, err.Error(), "API error")
	assert.Contains(t, err.Error(), "400")
}

func TestNVIDIAProviderChat_EmptyChoices(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		resp := nvidiaResponse{
			Model:   "test",
			Choices: []struct {
				Index   int `json:"index"`
				Message struct {
					Role             string `json:"role"`
					Content          string `json:"content"`
					ReasoningContent string `json:"reasoning_content"`
					Reasoning        string `json:"reasoning"`
				} `json:"message"`
				FinishReason string `json:"finish_reason"`
			}{},
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
	}))
	defer srv.Close()

	p := NewNVIDIAProvider(NVIDIAConfig{BaseURL: srv.URL, APIKey: "key"})
	_, err := p.Chat(context.Background(), ChatRequest{
		Messages: []Message{UserMessage("hi")},
	})
	assert.ErrorIs(t, err, ErrInvalidResponse)
}

func TestNVIDIAProviderChat_RequestError(t *testing.T) {
	p := NewNVIDIAProvider(NVIDIAConfig{BaseURL: "http://invalid.invalid", APIKey: "key", Timeout: time.Millisecond})
	_, err := p.Chat(context.Background(), ChatRequest{
		Messages: []Message{UserMessage("hi")},
	})
	require.Error(t, err)
	assert.Contains(t, err.Error(), "request failed")
}

func TestNVIDIAProviderChat_CustomModel(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var req nvidiaRequest
		json.NewDecoder(r.Body).Decode(&req)
		assert.Equal(t, "override-model", req.Model)

		resp := nvidiaResponse{
			Model: "override-model",
			Choices: []struct {
				Index   int `json:"index"`
				Message struct {
					Role             string `json:"role"`
					Content          string `json:"content"`
					ReasoningContent string `json:"reasoning_content"`
					Reasoning        string `json:"reasoning"`
				} `json:"message"`
				FinishReason string `json:"finish_reason"`
			}{
				{
					Index: 0,
					Message: struct {
						Role             string `json:"role"`
						Content          string `json:"content"`
						ReasoningContent string `json:"reasoning_content"`
						Reasoning        string `json:"reasoning"`
					}{Role: "assistant", Content: "ok"},
					FinishReason: "stop",
				},
			},
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
	}))
	defer srv.Close()

	p := NewNVIDIAProvider(NVIDIAConfig{BaseURL: srv.URL, APIKey: "key", Model: "default"})
	_, err := p.Chat(context.Background(), ChatRequest{
		Model:    "override-model",
		Messages: []Message{UserMessage("hi")},
	})
	require.NoError(t, err)
}

func TestNVIDIAProviderChatStream_Success(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		assert.Equal(t, "text/event-stream", r.Header.Get("Accept"))
		w.Header().Set("Content-Type", "text/event-stream")
		w.WriteHeader(http.StatusOK)

		data, _ := json.Marshal(nvidiaStreamResponse{
			ID:      "1",
			Object:  "chat.completion.chunk",
			Created: 123,
			Model:   "nv-model",
			Choices: []struct {
				Index int `json:"index"`
				Delta struct {
					Role             string `json:"role,omitempty"`
					Content          string `json:"content,omitempty"`
					ReasoningContent string `json:"reasoning_content,omitempty"`
					Reasoning        string `json:"reasoning,omitempty"`
				} `json:"delta"`
				FinishReason string `json:"finish_reason,omitempty"`
			}{
				{
					Index: 0,
					Delta: struct {
						Role             string `json:"role,omitempty"`
						Content          string `json:"content,omitempty"`
						ReasoningContent string `json:"reasoning_content,omitempty"`
						Reasoning        string `json:"reasoning,omitempty"`
					}{Content: "Hello", ReasoningContent: "thinking..."},
				},
			},
		})
		w.Write([]byte("data: " + string(data) + "\n\n"))
		w.Write([]byte("data: [DONE]\n\n"))
	}))
	defer srv.Close()

	p := NewNVIDIAProvider(NVIDIAConfig{BaseURL: srv.URL, APIKey: "key", Model: "nv-model"})
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

func TestNVIDIAProviderChatStream_FallbackReasoning(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/event-stream")
		w.WriteHeader(http.StatusOK)

		data, _ := json.Marshal(nvidiaStreamResponse{
			ID:      "1",
			Object:  "chat.completion.chunk",
			Created: 123,
			Model:   "test",
			Choices: []struct {
				Index int `json:"index"`
				Delta struct {
					Role             string `json:"role,omitempty"`
					Content          string `json:"content,omitempty"`
					ReasoningContent string `json:"reasoning_content,omitempty"`
					Reasoning        string `json:"reasoning,omitempty"`
				} `json:"delta"`
				FinishReason string `json:"finish_reason,omitempty"`
			}{
				{
					Index: 0,
					Delta: struct {
						Role             string `json:"role,omitempty"`
						Content          string `json:"content,omitempty"`
						ReasoningContent string `json:"reasoning_content,omitempty"`
						Reasoning        string `json:"reasoning,omitempty"`
					}{Content: "Hi", ReasoningContent: "", Reasoning: "fallback"},
				},
			},
		})
		w.Write([]byte("data: " + string(data) + "\n\n"))
		w.Write([]byte("data: [DONE]\n\n"))
	}))
	defer srv.Close()

	p := NewNVIDIAProvider(NVIDIAConfig{BaseURL: srv.URL, APIKey: "key"})
	chunks, err := p.ChatStream(context.Background(), ChatRequest{
		Messages: []Message{UserMessage("hi")},
	})
	require.NoError(t, err)

	for chunk := range chunks {
		if chunk.Done {
			break
		}
		if chunk.Error != nil {
			t.Fatal(chunk.Error)
		}
		assert.Equal(t, "fallback", chunk.ReasoningContent)
		break
	}
}

func TestNVIDIAProviderChatStream_RateLimited(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusTooManyRequests)
	}))
	defer srv.Close()

	p := NewNVIDIAProvider(NVIDIAConfig{BaseURL: srv.URL, APIKey: "key"})
	_, err := p.ChatStream(context.Background(), ChatRequest{
		Messages: []Message{UserMessage("hi")},
	})
	assert.ErrorIs(t, err, ErrRateLimited)
}

func TestNVIDIAProviderChatStream_APIError(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
	}))
	defer srv.Close()

	p := NewNVIDIAProvider(NVIDIAConfig{BaseURL: srv.URL, APIKey: "key"})
	_, err := p.ChatStream(context.Background(), ChatRequest{
		Messages: []Message{UserMessage("hi")},
	})
	require.Error(t, err)
	assert.Contains(t, err.Error(), "API error")
}

func TestNVIDIAProviderChatStream_RequestError(t *testing.T) {
	p := NewNVIDIAProvider(NVIDIAConfig{BaseURL: "http://invalid.invalid", APIKey: "key", Timeout: time.Millisecond})
	_, err := p.ChatStream(context.Background(), ChatRequest{
		Messages: []Message{UserMessage("hi")},
	})
	require.Error(t, err)
	assert.Contains(t, err.Error(), "request failed")
}

func TestNVIDIAProviderHealthCheck(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		resp := nvidiaResponse{
			Model: "test",
			Choices: []struct {
				Index   int `json:"index"`
				Message struct {
					Role             string `json:"role"`
					Content          string `json:"content"`
					ReasoningContent string `json:"reasoning_content"`
					Reasoning        string `json:"reasoning"`
				} `json:"message"`
				FinishReason string `json:"finish_reason"`
			}{
				{
					Index: 0,
					Message: struct {
						Role             string `json:"role"`
						Content          string `json:"content"`
						ReasoningContent string `json:"reasoning_content"`
						Reasoning        string `json:"reasoning"`
					}{Role: "assistant", Content: "pong"},
					FinishReason: "stop",
				},
			},
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
	}))
	defer srv.Close()

	p := NewNVIDIAProvider(NVIDIAConfig{BaseURL: srv.URL, APIKey: "key"})
	err := p.HealthCheck(context.Background())
	assert.NoError(t, err)
}

func TestNVIDIAProviderHealthCheck_Failure(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusServiceUnavailable)
	}))
	defer srv.Close()

	p := NewNVIDIAProvider(NVIDIAConfig{BaseURL: srv.URL, APIKey: "key"})
	err := p.HealthCheck(context.Background())
	require.Error(t, err)
	assert.Contains(t, err.Error(), "health check failed")
}
