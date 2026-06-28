package ai

import (
	"context"
	"errors"
	"strings"
	"sync"
	"testing"

	"github.com/imrishuroy/algopatterns/internal/ai/llm"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// stubProvider implements llm.Provider for testing.
type stubProvider struct {
	name     string
	chatFn   func(ctx context.Context, req llm.ChatRequest) (*llm.ChatResponse, error)
	streamFn func(ctx context.Context, req llm.ChatRequest) (<-chan llm.StreamChunk, error)
	healthFn func(ctx context.Context) error
	calls    []string
	mu       sync.Mutex
}

func (s *stubProvider) Chat(ctx context.Context, req llm.ChatRequest) (*llm.ChatResponse, error) {
	s.mu.Lock()
	s.calls = append(s.calls, "chat")
	s.mu.Unlock()
	if s.chatFn != nil {
		return s.chatFn(ctx, req)
	}
	return &llm.ChatResponse{Content: "mock", Model: "stub"}, nil
}

func (s *stubProvider) ChatStream(ctx context.Context, req llm.ChatRequest) (<-chan llm.StreamChunk, error) {
	s.mu.Lock()
	s.calls = append(s.calls, "stream")
	s.mu.Unlock()
	if s.streamFn != nil {
		return s.streamFn(ctx, req)
	}
	ch := make(chan llm.StreamChunk, 1)
	ch <- llm.StreamChunk{Done: true}
	close(ch)
	return ch, nil
}

func (s *stubProvider) Name() string { return s.name }

func (s *stubProvider) HealthCheck(ctx context.Context) error {
	if s.healthFn != nil {
		return s.healthFn(ctx)
	}
	return nil
}

func newTestService(cfgOverrides ...func(*Config)) *Service {
	cfg := DefaultConfig()
	cfg.Enabled = true
	for _, fn := range cfgOverrides {
		fn(&cfg)
	}

	mgr := llm.NewManager(llm.ManagerConfig{
		DefaultProvider: "stub",
		FallbackChain:   []string{},
	})
	mgr.RegisterProvider("stub", &stubProvider{name: "stub"})
	return NewService(mgr, cfg)
}

func TestNewService(t *testing.T) {
	s := newTestService(func(c *Config) { c.Enabled = false })
	assert.NotNil(t, s)
	assert.NotNil(t, s.llmManager)
	assert.Nil(t, s.ragService)
}

func TestNewServiceWithRAG(t *testing.T) {
	cfg := DefaultConfig()
	mgr := llm.NewManager(llm.ManagerConfig{DefaultProvider: "stub"})
	s := NewServiceWithRAG(mgr, nil, cfg)
	assert.NotNil(t, s)
	assert.Nil(t, s.ragService)
}

func TestIsEnabled(t *testing.T) {
	s := newTestService()
	assert.True(t, s.IsEnabled())

	s2 := newTestService(func(c *Config) { c.Enabled = false })
	assert.False(t, s2.IsEnabled())
}

func TestMapHistory_Nil(t *testing.T) {
	result := mapHistory(nil)
	assert.Nil(t, result)
}

func TestMapHistory_Empty(t *testing.T) {
	result := mapHistory([]ConversationMessage{})
	assert.Nil(t, result)
}

func TestMapHistory_Messages(t *testing.T) {
	history := []ConversationMessage{
		{Role: "user", Content: "Hello"},
		{Role: "assistant", Content: "Hi there"},
	}
	result := mapHistory(history)
	require.Len(t, result, 2)
	assert.Equal(t, "user", result[0].Role)
	assert.Equal(t, "Hello", result[0].Content)
	assert.Equal(t, "assistant", result[1].Role)
	assert.Equal(t, "Hi there", result[1].Content)
}

func TestChat_AIDisabled(t *testing.T) {
	s := newTestService(func(c *Config) { c.Enabled = false })
	_, err := s.Chat(context.Background(), ChatRequest{})
	assert.ErrorIs(t, err, ErrAIDisabled)
}

func TestChat_ChatFeatureDisabled(t *testing.T) {
	s := newTestService(func(c *Config) { c.Features.EnableChat = false })
	_, err := s.Chat(context.Background(), ChatRequest{})
	require.Error(t, err)
	assert.Contains(t, err.Error(), "chat feature is disabled")
}

func TestChat_CodeTooLong(t *testing.T) {
	s := newTestService(func(c *Config) { c.RateLimit.MaxCodeLength = 10 })
	_, err := s.Chat(context.Background(), ChatRequest{
		Code: "this is a very long code that exceeds the limit",
	})
	assert.ErrorIs(t, err, ErrCodeTooLong)
}

func TestChat_Success(t *testing.T) {
	mgr := llm.NewManager(llm.ManagerConfig{DefaultProvider: "stub"})
	mgr.RegisterProvider("stub", &stubProvider{
		name: "stub",
		chatFn: func(ctx context.Context, req llm.ChatRequest) (*llm.ChatResponse, error) {
			assert.Len(t, req.Messages, 2)
			assert.Equal(t, "system", req.Messages[0].Role)
			assert.Equal(t, "user", req.Messages[1].Role)

			msg := req.Messages[1].Content
			assert.Contains(t, msg, "Find pairs in array")
			assert.Contains(t, msg, "def f(): pass")
			assert.Contains(t, msg, "Help me")

			sysPrompt := req.Messages[0].Content
			assert.Contains(t, sysPrompt, "Two Pointers")

			return &llm.ChatResponse{
				Content:      "Hello from AI",
				Model:        "deepseek-chat",
				TokensInput:  10,
				TokensOutput: 20,
				FinishReason: "stop",
			}, nil
		},
	})

	s := NewService(mgr, func() Config {
		c := DefaultConfig()
		c.Enabled = true
		return c
	}())

	resp, err := s.Chat(context.Background(), ChatRequest{
		SessionID:          "session-1",
		Message:            "Help me with two pointers",
		ProblemSlug:        "two-pointers",
		ProblemTitle:       "Two Pointers",
		ProblemDescription: "Find pairs in array",
		Code:               "def f(): pass",
		Language:           "python",
	})
	require.NoError(t, err)
	assert.Equal(t, "Hello from AI", resp.Content)
	assert.Equal(t, "session-1", resp.SessionID)
	assert.Equal(t, 30, resp.TokensUsed)
	assert.Equal(t, "deepseek-chat", resp.Model)
}

func TestChat_ProviderFailure(t *testing.T) {
	mgr := llm.NewManager(llm.ManagerConfig{DefaultProvider: "stub"})
	mgr.RegisterProvider("stub", &stubProvider{
		chatFn: func(ctx context.Context, req llm.ChatRequest) (*llm.ChatResponse, error) {
			return nil, errors.New("provider error")
		},
	})

	cfg := DefaultConfig()
	cfg.Enabled = true
	s := NewService(mgr, cfg)
	_, err := s.Chat(context.Background(), ChatRequest{Message: "hi"})
	require.Error(t, err)
	assert.ErrorIs(t, err, ErrProviderFailed)
}

func TestChat_WithErrorMessage(t *testing.T) {
	mgr := llm.NewManager(llm.ManagerConfig{DefaultProvider: "stub"})
	mgr.RegisterProvider("stub", &stubProvider{})
	cfg := DefaultConfig()
	cfg.Enabled = true
	s := NewService(mgr, cfg)
	_, err := s.Chat(context.Background(), ChatRequest{
		Message:      "fix error",
		ErrorMessage: "NameError: x not defined",
		Code:         "print(x)",
		Language:     "python",
	})
	require.NoError(t, err)
}

func TestChat_WithHistory(t *testing.T) {
	mgr := llm.NewManager(llm.ManagerConfig{DefaultProvider: "stub"})
	mgr.RegisterProvider("stub", &stubProvider{})
	cfg := DefaultConfig()
	cfg.Enabled = true
	s := NewService(mgr, cfg)
	_, err := s.Chat(context.Background(), ChatRequest{
		Message: "continue",
		History: []ConversationMessage{
			{Role: "user", Content: "hello"},
			{Role: "assistant", Content: "hi"},
		},
	})
	require.NoError(t, err)
}

func TestChatStream_AIDisabled(t *testing.T) {
	s := newTestService(func(c *Config) { c.Enabled = false })
	_, err := s.ChatStream(context.Background(), ChatRequest{})
	assert.ErrorIs(t, err, ErrAIDisabled)
}

func TestChatStream_StreamingDisabled(t *testing.T) {
	s := newTestService(func(c *Config) { c.Features.EnableStreaming = false })
	_, err := s.ChatStream(context.Background(), ChatRequest{})
	require.Error(t, err)
	assert.Contains(t, err.Error(), "streaming chat is disabled")
}

func TestChatStream_Success(t *testing.T) {
	mgr := llm.NewManager(llm.ManagerConfig{DefaultProvider: "stub"})
	mgr.RegisterProvider("stub", &stubProvider{
		streamFn: func(ctx context.Context, req llm.ChatRequest) (<-chan llm.StreamChunk, error) {
			ch := make(chan llm.StreamChunk, 2)
			ch <- llm.StreamChunk{Content: "Hello"}
			ch <- llm.StreamChunk{Done: true}
			close(ch)
			return ch, nil
		},
	})

	cfg := DefaultConfig()
	cfg.Enabled = true
	s := NewService(mgr, cfg)
	outCh, err := s.ChatStream(context.Background(), ChatRequest{Message: "hi"})
	require.NoError(t, err)

	var received []string
	for chunk := range outCh {
		if chunk.Done {
			break
		}
		received = append(received, chunk.Content)
	}
	assert.Equal(t, []string{"Hello"}, received)
}

func TestChatStream_CodeTooLong(t *testing.T) {
	s := newTestService(func(c *Config) { c.RateLimit.MaxCodeLength = 5 })
	_, err := s.ChatStream(context.Background(), ChatRequest{Code: "too long code"})
	assert.ErrorIs(t, err, ErrCodeTooLong)
}

func TestGetHint_AIDisabled(t *testing.T) {
	s := newTestService(func(c *Config) { c.Enabled = false })
	_, err := s.GetHint(context.Background(), HintRequest{})
	assert.ErrorIs(t, err, ErrAIDisabled)
}

func TestGetHint_HintsDisabled(t *testing.T) {
	s := newTestService(func(c *Config) { c.Features.EnableHints = false })
	_, err := s.GetHint(context.Background(), HintRequest{})
	require.Error(t, err)
	assert.Contains(t, err.Error(), "hints feature is disabled")
}

func TestGetHint_CodeTooLong(t *testing.T) {
	s := newTestService(func(c *Config) { c.RateLimit.MaxCodeLength = 5 })
	_, err := s.GetHint(context.Background(), HintRequest{Code: "very long code here"})
	assert.ErrorIs(t, err, ErrCodeTooLong)
}

func TestGetHint_HintLevelAutoDetect(t *testing.T) {
	mgr := llm.NewManager(llm.ManagerConfig{DefaultProvider: "stub"})
	mgr.RegisterProvider("stub", &stubProvider{
		chatFn: func(ctx context.Context, req llm.ChatRequest) (*llm.ChatResponse, error) {
			return &llm.ChatResponse{
				Content:      "Here's a hint",
				Model:        "test",
				TokensInput:  5,
				TokensOutput: 10,
			}, nil
		},
	})

	cfg := DefaultConfig()
	cfg.Enabled = true
	s := NewService(mgr, cfg)
	resp, err := s.GetHint(context.Background(), HintRequest{
		ProblemTitle:       "Two Sum",
		ProblemDescription: "Find pairs",
		Code:               "def f(): pass",
		Language:           "python",
		HintLevel:          0,
		PreviousHints:      2,
	})
	require.NoError(t, err)
	assert.Equal(t, "Here's a hint", resp.Hint)
	assert.Equal(t, 3, resp.Level)
	assert.Equal(t, 15, resp.TokensUsed)
}

func TestGetHint_ExplicitLevel(t *testing.T) {
	mgr := llm.NewManager(llm.ManagerConfig{DefaultProvider: "stub"})
	mgr.RegisterProvider("stub", &stubProvider{})
	cfg := DefaultConfig()
	cfg.Enabled = true
	s := NewService(mgr, cfg)
	resp, err := s.GetHint(context.Background(), HintRequest{
		HintLevel: 2,
		Code:      "code",
	})
	require.NoError(t, err)
	assert.Equal(t, 2, resp.Level)
}

func TestGetHint_LevelClampedToRange(t *testing.T) {
	tests := []struct {
		hintLevel    int
		previousHits int
		expected     int
	}{
		{0, 0, 1},
		{0, 5, 4},
		{5, 0, 1},
		{3, 0, 3},
	}

	for _, tc := range tests {
		mgr := llm.NewManager(llm.ManagerConfig{DefaultProvider: "stub"})
		mgr.RegisterProvider("stub", &stubProvider{})
		cfg := DefaultConfig()
		cfg.Enabled = true
		s := NewService(mgr, cfg)
		resp, err := s.GetHint(context.Background(), HintRequest{
			HintLevel:     tc.hintLevel,
			PreviousHints: tc.previousHits,
			Code:          "code",
		})
		require.NoError(t, err)
		assert.Equal(t, tc.expected, resp.Level)
	}
}

func TestGetHint_WithHistory(t *testing.T) {
	mgr := llm.NewManager(llm.ManagerConfig{DefaultProvider: "stub"})
	mgr.RegisterProvider("stub", &stubProvider{})
	cfg := DefaultConfig()
	cfg.Enabled = true
	s := NewService(mgr, cfg)
	_, err := s.GetHint(context.Background(), HintRequest{
		HintLevel: 1,
		Code:      "code",
		History: []ConversationMessage{
			{Role: "user", Content: "I'm confused"},
		},
	})
	require.NoError(t, err)
}

func TestReviewCode_AIDisabled(t *testing.T) {
	s := newTestService(func(c *Config) { c.Enabled = false })
	_, err := s.ReviewCode(context.Background(), ReviewRequest{})
	assert.ErrorIs(t, err, ErrAIDisabled)
}

func TestReviewCode_ReviewDisabled(t *testing.T) {
	s := newTestService(func(c *Config) { c.Features.EnableReview = false })
	_, err := s.ReviewCode(context.Background(), ReviewRequest{})
	require.Error(t, err)
	assert.Contains(t, err.Error(), "review feature is disabled")
}

func TestReviewCode_EmptyCode(t *testing.T) {
	s := newTestService()
	_, err := s.ReviewCode(context.Background(), ReviewRequest{})
	require.Error(t, err)
	assert.ErrorIs(t, err, ErrInvalidRequest)
	assert.Contains(t, err.Error(), "code is required")
}

func TestReviewCode_CodeTooLong(t *testing.T) {
	s := newTestService(func(c *Config) { c.RateLimit.MaxCodeLength = 5 })
	_, err := s.ReviewCode(context.Background(), ReviewRequest{Code: "very long code here"})
	assert.ErrorIs(t, err, ErrCodeTooLong)
}

func TestReviewCode_Success(t *testing.T) {
	mgr := llm.NewManager(llm.ManagerConfig{DefaultProvider: "stub"})
	mgr.RegisterProvider("stub", &stubProvider{
		chatFn: func(ctx context.Context, req llm.ChatRequest) (*llm.ChatResponse, error) {
			return &llm.ChatResponse{
				Content:      "Great code!",
				Model:        "test",
				TokensInput:  8,
				TokensOutput: 12,
			}, nil
		},
	})
	cfg := DefaultConfig()
	cfg.Enabled = true
	s := NewService(mgr, cfg)
	resp, err := s.ReviewCode(context.Background(), ReviewRequest{
		ProblemTitle:       "Two Sum",
		ProblemDescription: "description",
		Code:               "def f(): pass",
		Language:           "python",
		FocusAreas:         []string{"efficiency"},
	})
	require.NoError(t, err)
	assert.Equal(t, "Great code!", resp.Review)
	assert.Equal(t, 20, resp.TokensUsed)
}

func TestReviewCode_WithHistory(t *testing.T) {
	mgr := llm.NewManager(llm.ManagerConfig{DefaultProvider: "stub"})
	mgr.RegisterProvider("stub", &stubProvider{})
	cfg := DefaultConfig()
	cfg.Enabled = true
	s := NewService(mgr, cfg)
	_, err := s.ReviewCode(context.Background(), ReviewRequest{
		Code: "def f(): pass",
		History: []ConversationMessage{
			{Role: "user", Content: "Check my code"},
		},
	})
	require.NoError(t, err)
}

func TestExplainError_AIDisabled(t *testing.T) {
	s := newTestService(func(c *Config) { c.Enabled = false })
	_, err := s.ExplainError(context.Background(), ExplainRequest{})
	assert.ErrorIs(t, err, ErrAIDisabled)
}

func TestExplainError_ExplainDisabled(t *testing.T) {
	s := newTestService(func(c *Config) { c.Features.EnableExplain = false })
	_, err := s.ExplainError(context.Background(), ExplainRequest{})
	require.Error(t, err)
	assert.Contains(t, err.Error(), "explain feature is disabled")
}

func TestExplainError_EmptyErrorMsg(t *testing.T) {
	s := newTestService()
	_, err := s.ExplainError(context.Background(), ExplainRequest{})
	require.Error(t, err)
	assert.ErrorIs(t, err, ErrInvalidRequest)
}

func TestExplainError_CodeTooLong(t *testing.T) {
	s := newTestService(func(c *Config) { c.RateLimit.MaxCodeLength = 5 })
	_, err := s.ExplainError(context.Background(), ExplainRequest{
		ErrorMessage: "error",
		Code:         "very long code",
	})
	assert.ErrorIs(t, err, ErrCodeTooLong)
}

func TestExplainError_Success(t *testing.T) {
	mgr := llm.NewManager(llm.ManagerConfig{DefaultProvider: "stub"})
	mgr.RegisterProvider("stub", &stubProvider{
		chatFn: func(ctx context.Context, req llm.ChatRequest) (*llm.ChatResponse, error) {
			return &llm.ChatResponse{
				Content:      "This error means...",
				Model:        "test",
				TokensInput:  3,
				TokensOutput: 7,
			}, nil
		},
	})
	cfg := DefaultConfig()
	cfg.Enabled = true
	s := NewService(mgr, cfg)
	resp, err := s.ExplainError(context.Background(), ExplainRequest{
		Code:         "x = 1\nx()",
		Language:     "python",
		ErrorType:    "TypeError",
		ErrorMessage: "int is not callable",
		LineNumber:   2,
	})
	require.NoError(t, err)
	assert.Equal(t, "This error means...", resp.Explanation)
	assert.Equal(t, 10, resp.TokensUsed)
}

func TestExplainError_WithHistory(t *testing.T) {
	mgr := llm.NewManager(llm.ManagerConfig{DefaultProvider: "stub"})
	mgr.RegisterProvider("stub", &stubProvider{})
	cfg := DefaultConfig()
	cfg.Enabled = true
	s := NewService(mgr, cfg)
	_, err := s.ExplainError(context.Background(), ExplainRequest{
		ErrorMessage: "error msg",
		Code:         "code",
		History: []ConversationMessage{
			{Role: "user", Content: "I have an error"},
		},
	})
	require.NoError(t, err)
}

func TestFilterSolutionContent_DirectIndicators(t *testing.T) {
	s := &Service{}

	tests := []struct {
		response string
		expected bool
	}{
		{"here's the solution: use binary search", true},
		{"the complete code is below", true},
		{"this is the final solution", true},
		{"here is the answer", true},
		{"the solution is to sort first", true},
		{"you should try using a hash map", false},
		{"what is the time complexity?", false},
		{"let's trace through an example", false},
	}

	for _, tc := range tests {
		got := s.FilterSolutionContent(tc.response, "test-problem")
		assert.Equal(t, tc.expected, got, "response: %q", tc.response)
	}
}

func TestFilterSolutionContent_LargeCodeBlock(t *testing.T) {
	s := &Service{}

	codeBlock := "before\n```\nline1\nline2\nline3\nline4\nline5\nline6\nline7\nline8\nline9\nline10\nline11\nline12\nline13\nline14\nline15\nline16\n```\nafter"
	got := s.FilterSolutionContent(codeBlock, "test")
	assert.True(t, got, "should filter 16-line code block")

	smallBlock := "before\n```\nline1\nline2\nline3\nline4\nline5\nline6\nline7\nline8\nline9\nline10\n```\nafter"
	got = s.FilterSolutionContent(smallBlock, "test")
	assert.False(t, got, "should not filter 10-line code block")
}

func TestFilterSolutionContent_NoCodeBlock(t *testing.T) {
	s := &Service{}
	got := s.FilterSolutionContent("This is a short response without a code block", "test")
	assert.False(t, got)
}

func TestFilterSolutionContent_EmptyResponse(t *testing.T) {
	s := &Service{}
	got := s.FilterSolutionContent("", "test")
	assert.False(t, got)
}

func TestFilterSolutionContent_CaseInsensitive(t *testing.T) {
	s := &Service{}
	got := s.FilterSolutionContent("HERE'S THE SOLUTION", "test")
	assert.True(t, got)
}

func TestValidateCode_UnderLimit(t *testing.T) {
	s := newTestService()
	err := s.validateCode("short")
	assert.NoError(t, err)
}

func TestValidateCode_OverLimit(t *testing.T) {
	s := newTestService(func(c *Config) { c.RateLimit.MaxCodeLength = 10 })
	err := s.validateCode("this is more than ten chars")
	assert.ErrorIs(t, err, ErrCodeTooLong)
}

func TestValidateCode_EmptyString(t *testing.T) {
	s := newTestService()
	err := s.validateCode("")
	assert.NoError(t, err)
}

func TestGetHint_ProviderFailure(t *testing.T) {
	mgr := llm.NewManager(llm.ManagerConfig{DefaultProvider: "stub"})
	mgr.RegisterProvider("stub", &stubProvider{
		chatFn: func(ctx context.Context, req llm.ChatRequest) (*llm.ChatResponse, error) {
			return nil, errors.New("provider dead")
		},
	})
	cfg := DefaultConfig()
	cfg.Enabled = true
	s := NewService(mgr, cfg)
	_, err := s.GetHint(context.Background(), HintRequest{HintLevel: 1, Code: "code"})
	require.Error(t, err)
	assert.ErrorIs(t, err, ErrProviderFailed)
}

func TestReviewCode_ProviderFailure(t *testing.T) {
	mgr := llm.NewManager(llm.ManagerConfig{DefaultProvider: "stub"})
	mgr.RegisterProvider("stub", &stubProvider{
		chatFn: func(ctx context.Context, req llm.ChatRequest) (*llm.ChatResponse, error) {
			return nil, errors.New("dead")
		},
	})
	cfg := DefaultConfig()
	cfg.Enabled = true
	s := NewService(mgr, cfg)
	_, err := s.ReviewCode(context.Background(), ReviewRequest{Code: "def f(): pass"})
	require.Error(t, err)
	assert.ErrorIs(t, err, ErrProviderFailed)
}

func TestExplainError_ProviderFailure(t *testing.T) {
	mgr := llm.NewManager(llm.ManagerConfig{DefaultProvider: "stub"})
	mgr.RegisterProvider("stub", &stubProvider{
		chatFn: func(ctx context.Context, req llm.ChatRequest) (*llm.ChatResponse, error) {
			return nil, errors.New("dead")
		},
	})
	cfg := DefaultConfig()
	cfg.Enabled = true
	s := NewService(mgr, cfg)
	_, err := s.ExplainError(context.Background(), ExplainRequest{ErrorMessage: "error", Code: "code"})
	require.Error(t, err)
	assert.ErrorIs(t, err, ErrProviderFailed)
}

func TestChat_ProviderFailureWrapsCorrectly(t *testing.T) {
	mgr := llm.NewManager(llm.ManagerConfig{DefaultProvider: "stub"})
	mgr.RegisterProvider("stub", &stubProvider{
		chatFn: func(ctx context.Context, req llm.ChatRequest) (*llm.ChatResponse, error) {
			return nil, errors.New("some internal error")
		},
	})
	cfg := DefaultConfig()
	cfg.Enabled = true
	s := NewService(mgr, cfg)
	_, err := s.Chat(context.Background(), ChatRequest{Message: "hi"})
	require.Error(t, err)
	assert.ErrorIs(t, err, ErrProviderFailed)
	assert.Contains(t, err.Error(), "some internal error")
}

func TestChatStream_ProviderFailure(t *testing.T) {
	mgr := llm.NewManager(llm.ManagerConfig{DefaultProvider: "stub"})
	mgr.RegisterProvider("stub", &stubProvider{
		streamFn: func(ctx context.Context, req llm.ChatRequest) (<-chan llm.StreamChunk, error) {
			return nil, errors.New("stream error")
		},
	})
	cfg := DefaultConfig()
	cfg.Enabled = true
	s := NewService(mgr, cfg)
	_, err := s.ChatStream(context.Background(), ChatRequest{Message: "hi"})
	require.Error(t, err)
}

func TestChatStream_WithHistory(t *testing.T) {
	mgr := llm.NewManager(llm.ManagerConfig{DefaultProvider: "stub"})
	mgr.RegisterProvider("stub", &stubProvider{})
	cfg := DefaultConfig()
	cfg.Enabled = true
	s := NewService(mgr, cfg)
	_, err := s.ChatStream(context.Background(), ChatRequest{
		Message: "continue",
		History: []ConversationMessage{
			{Role: "user", Content: "prev"},
		},
	})
	require.NoError(t, err)
}

func TestService_GetRAGContextWithNilRAG(t *testing.T) {
	mgr := llm.NewManager(llm.ManagerConfig{DefaultProvider: "stub"})
	mgr.RegisterProvider("stub", &stubProvider{})
	cfg := DefaultConfig()
	cfg.Enabled = true
	s := NewService(mgr, cfg)
	resp, err := s.Chat(context.Background(), ChatRequest{Message: "hi"})
	require.NoError(t, err)
	assert.Equal(t, "mock", resp.Content)
}

func TestService_GetRAGContextWithRAGDisabled(t *testing.T) {
	mgr := llm.NewManager(llm.ManagerConfig{DefaultProvider: "stub"})
	mgr.RegisterProvider("stub", &stubProvider{})
	cfg := DefaultConfig()
	cfg.Enabled = true
	cfg.Features.EnableRAG = false
	s := NewService(mgr, cfg)
	_, err := s.Chat(context.Background(), ChatRequest{Message: "hi"})
	require.NoError(t, err)
}

func TestCountCodeBlockLines(t *testing.T) {
	tests := []struct {
		input    string
		expected int
	}{
		{"no code block", 0},
		{"```\nline1\n```", 1},
		{"```\nline1\nline2\nline3\n```", 3},
		{"text\n```\nline1\n```\nmore", 1},
		{"```\n```", 0},
		{"```\nline1\nline2\n```\n```\na\nb\nc\n```", 5},
	}

	for _, tc := range tests {
		got := countCodeBlockLines(tc.input)
		assert.Equal(t, tc.expected, got, "input: %q", tc.input)
	}
}

func TestChat_AllFieldsInUserMessage(t *testing.T) {
	var capturedRequest llm.ChatRequest
	mgr := llm.NewManager(llm.ManagerConfig{DefaultProvider: "stub"})
	mgr.RegisterProvider("stub", &stubProvider{
		chatFn: func(ctx context.Context, req llm.ChatRequest) (*llm.ChatResponse, error) {
			capturedRequest = req
			return &llm.ChatResponse{Content: "resp", Model: "test"}, nil
		},
	})
	cfg := DefaultConfig()
	cfg.Enabled = true
	s := NewService(mgr, cfg)

	_, err := s.Chat(context.Background(), ChatRequest{
		Message:            "help",
		ProblemDescription: "desc",
		Code:               "print(1)",
		Language:           "python",
		ErrorMessage:       "SyntaxError",
	})
	require.NoError(t, err)
	require.Len(t, capturedRequest.Messages, 2)
	userMsg := capturedRequest.Messages[1].Content
	assert.Contains(t, userMsg, "PROBLEM DESCRIPTION:")
	assert.Contains(t, userMsg, "desc")
	assert.Contains(t, userMsg, "MY CURRENT CODE:")
	assert.Contains(t, userMsg, "print(1)")
	assert.Contains(t, userMsg, "ERROR FROM RUNNING MY CODE:")
	assert.Contains(t, userMsg, "SyntaxError")
	assert.True(t, strings.HasSuffix(userMsg, "help"), "message should end with the user's message")
}

func TestChat_UsesRequesterModel(t *testing.T) {
	var captured llm.ChatRequest
	mgr := llm.NewManager(llm.ManagerConfig{DefaultProvider: "stub"})
	mgr.RegisterProvider("stub", &stubProvider{
		chatFn: func(ctx context.Context, req llm.ChatRequest) (*llm.ChatResponse, error) {
			captured = req
			return &llm.ChatResponse{Content: "a", Model: "test"}, nil
		},
	})
	cfg := DefaultConfig()
	cfg.Enabled = true
	s := NewService(mgr, cfg)
	_, err := s.Chat(context.Background(), ChatRequest{Message: "hi"})
	require.NoError(t, err)
	assert.Equal(t, 0.7, captured.Temperature)
	assert.Equal(t, 2048, captured.MaxTokens)
}

func TestGetHint_UsesRequesterConfig(t *testing.T) {
	var captured llm.ChatRequest
	mgr := llm.NewManager(llm.ManagerConfig{DefaultProvider: "stub"})
	mgr.RegisterProvider("stub", &stubProvider{
		chatFn: func(ctx context.Context, req llm.ChatRequest) (*llm.ChatResponse, error) {
			captured = req
			return &llm.ChatResponse{Content: "hint", Model: "test"}, nil
		},
	})
	cfg := DefaultConfig()
	cfg.Enabled = true
	s := NewService(mgr, cfg)
	_, err := s.GetHint(context.Background(), HintRequest{HintLevel: 1, Code: "c"})
	require.NoError(t, err)
	assert.Equal(t, 0.7, captured.Temperature)
	assert.Equal(t, 1024, captured.MaxTokens)
}

func TestReviewCode_UsesRequesterConfig(t *testing.T) {
	var captured llm.ChatRequest
	mgr := llm.NewManager(llm.ManagerConfig{DefaultProvider: "stub"})
	mgr.RegisterProvider("stub", &stubProvider{
		chatFn: func(ctx context.Context, req llm.ChatRequest) (*llm.ChatResponse, error) {
			captured = req
			return &llm.ChatResponse{Content: "r", Model: "test"}, nil
		},
	})
	cfg := DefaultConfig()
	cfg.Enabled = true
	s := NewService(mgr, cfg)
	_, err := s.ReviewCode(context.Background(), ReviewRequest{Code: "c"})
	require.NoError(t, err)
	assert.Equal(t, 0.5, captured.Temperature)
	assert.Equal(t, 1536, captured.MaxTokens)
}

func TestExplainError_UsesRequesterConfig(t *testing.T) {
	var captured llm.ChatRequest
	mgr := llm.NewManager(llm.ManagerConfig{DefaultProvider: "stub"})
	mgr.RegisterProvider("stub", &stubProvider{
		chatFn: func(ctx context.Context, req llm.ChatRequest) (*llm.ChatResponse, error) {
			captured = req
			return &llm.ChatResponse{Content: "e", Model: "test"}, nil
		},
	})
	cfg := DefaultConfig()
	cfg.Enabled = true
	s := NewService(mgr, cfg)
	_, err := s.ExplainError(context.Background(), ExplainRequest{
		ErrorMessage: "err",
		Code:         "c",
	})
	require.NoError(t, err)
	assert.Equal(t, 0.3, captured.Temperature)
	assert.Equal(t, 768, captured.MaxTokens)
}
