package ai

import (
	"context"
	"errors"
	"testing"

	"github.com/imrishuroy/algopatterns/internal/ai/llm"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestNewClassifier(t *testing.T) {
	manager := &llm.Manager{}
	classifier := NewClassifier(manager)

	assert.NotNil(t, classifier)
	assert.Equal(t, manager, classifier.llmManager)
}

func TestClassifier_ClassifyWithHistory_ShortReply(t *testing.T) {
	// When there's conversation history and a short reply, default to concept
	classifier := &Classifier{llmManager: nil}

	history := []ConversationTurn{
		{Role: "user", Content: "What is binary search?"},
		{Role: "assistant", Content: "Binary search is a search algorithm..."},
	}

	// Short replies should return IntentConcept without calling LLM
	shortReplies := []string{
		"yes", "no", "ok", "okay", "sure", "got it", "i see", "thanks",
		"thank you", "right", "correct", "exactly", "yep", "nope",
		"i think so", "maybe", "not sure", "i don't know", "idk",
		"hmm", "ah", "oh", "aha", "interesting",
	}

	for _, reply := range shortReplies {
		t.Run(reply, func(t *testing.T) {
			intent, err := classifier.ClassifyWithHistory(context.Background(), reply, history)
			require.NoError(t, err)
			assert.Equal(t, IntentConcept, intent)
		})
	}
}

func TestIsShortReply(t *testing.T) {
	tests := []struct {
		message  string
		expected bool
	}{
		// Short replies that should return true
		{"yes", true},
		{"no", true},
		{"ok", true},
		{"okay", true},
		{"sure", true},
		{"got it", true},
		{"i see", true},
		{"thanks", true},
		{"thank you", true},
		{"right", true},
		{"correct", true},
		{"exactly", true},
		{"yep", true},
		{"nope", true},
		{"i think so", true},
		{"maybe", true},
		{"not sure", true},
		{"i don't know", true},
		{"idk", true},
		{"hmm", true},
		{"ah", true},
		{"oh", true},
		{"aha", true},
		{"interesting", true},

		// Case insensitive
		{"YES", true},
		{"No", true},
		{"OK", true},

		// With whitespace
		{"  yes  ", true},
		{"  thanks  ", true},

		// Longer messages should return false
		{"What is binary search?", false},
		{"Can you explain how hash tables work?", false},
		{"I need help with this problem", false},
		{"yes I understand and can you also tell me more", false},

		// More than 5 words should return false
		{"this is a very long message", false},
		{"one two three four five six", false},

		// Short but not a known reply
		{"hello", false},
		{"help", false},
		{"code", false},
	}

	for _, tt := range tests {
		t.Run(tt.message, func(t *testing.T) {
			result := isShortReply(tt.message)
			assert.Equal(t, tt.expected, result, "isShortReply(%q) = %v, want %v", tt.message, result, tt.expected)
		})
	}
}

func TestNeedsRAG(t *testing.T) {
	tests := []struct {
		intent   Intent
		expected bool
	}{
		{IntentBYOP, true},
		{IntentSyntax, false},
		{IntentComplexity, false},
		{IntentDiagram, true},
		{IntentIntersection, true},
		{IntentConcept, true},
		{IntentOutOfScope, false},
	}

	for _, tt := range tests {
		t.Run(string(tt.intent), func(t *testing.T) {
			result := NeedsRAG(tt.intent)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestOutOfScopeRefusal(t *testing.T) {
	// Verify the constant is set correctly
	assert.Contains(t, OutOfScopeRefusal, "Thor")
	assert.Contains(t, OutOfScopeRefusal, "DSA")
	assert.Contains(t, OutOfScopeRefusal, "algorithms")
}

func TestClassifierPrompt(t *testing.T) {
	// Verify the prompt contains all intent descriptions
	assert.Contains(t, ClassifierPrompt, "byop")
	assert.Contains(t, ClassifierPrompt, "syntax")
	assert.Contains(t, ClassifierPrompt, "complexity")
	assert.Contains(t, ClassifierPrompt, "diagram")
	assert.Contains(t, ClassifierPrompt, "intersection")
	assert.Contains(t, ClassifierPrompt, "concept")
	assert.Contains(t, ClassifierPrompt, "out_of_scope")
}

func TestValidIntents(t *testing.T) {
	// Verify all intent constants are in the validIntents map
	assert.Equal(t, IntentBYOP, validIntents["byop"])
	assert.Equal(t, IntentSyntax, validIntents["syntax"])
	assert.Equal(t, IntentComplexity, validIntents["complexity"])
	assert.Equal(t, IntentDiagram, validIntents["diagram"])
	assert.Equal(t, IntentIntersection, validIntents["intersection"])
	assert.Equal(t, IntentConcept, validIntents["concept"])
	assert.Equal(t, IntentOutOfScope, validIntents["out_of_scope"])
}

// classifierStubProvider implements llm.Provider for classifier testing
type classifierStubProvider struct {
	response string
	err      error
}

func (s *classifierStubProvider) Chat(_ context.Context, _ llm.ChatRequest) (*llm.ChatResponse, error) {
	if s.err != nil {
		return nil, s.err
	}
	return &llm.ChatResponse{Content: s.response}, nil
}

func (s *classifierStubProvider) ChatStream(_ context.Context, _ llm.ChatRequest) (<-chan llm.StreamChunk, error) {
	return nil, errors.New("not implemented")
}

func (s *classifierStubProvider) HealthCheck(_ context.Context) error {
	return nil
}

func (s *classifierStubProvider) Name() string {
	return "classifier-stub"
}

func createTestManager(provider llm.Provider) *llm.Manager {
	cfg := llm.ManagerConfig{
		DefaultProvider: provider.Name(),
	}
	manager := llm.NewManager(cfg)
	manager.RegisterProvider(provider.Name(), provider)
	return manager
}

func TestClassifier_Classify_WithMockManager(t *testing.T) {
	// Create a stub provider that returns a valid intent
	stub := &classifierStubProvider{response: "concept"}
	manager := createTestManager(stub)

	classifier := NewClassifier(manager)

	intent, err := classifier.Classify(context.Background(), "What is binary search?")
	require.NoError(t, err)
	assert.Equal(t, IntentConcept, intent)
}

func TestClassifier_Classify_UnknownIntent(t *testing.T) {
	// When LLM returns an unknown string, default to concept
	stub := &classifierStubProvider{response: "unknown_garbage_response"}
	manager := createTestManager(stub)
	classifier := NewClassifier(manager)

	intent, err := classifier.Classify(context.Background(), "What is binary search?")
	require.NoError(t, err)
	assert.Equal(t, IntentConcept, intent) // Defaults to concept
}

func TestClassifier_Classify_Error(t *testing.T) {
	// When LLM returns an error, default to concept
	stub := &classifierStubProvider{err: errors.New("LLM error")}
	manager := createTestManager(stub)
	classifier := NewClassifier(manager)

	intent, err := classifier.Classify(context.Background(), "What is binary search?")
	assert.Error(t, err)
	assert.Equal(t, IntentConcept, intent) // Defaults to concept even on error
}

func TestClassifier_ClassifyWithHistory_BuildsContext(t *testing.T) {
	stub := &classifierStubProvider{response: "concept"}
	manager := createTestManager(stub)
	classifier := NewClassifier(manager)

	history := []ConversationTurn{
		{Role: "user", Content: "What is a hash table?"},
		{Role: "assistant", Content: "A hash table is a data structure..."},
		{Role: "user", Content: "How does collision handling work?"},
		{Role: "assistant", Content: "There are several strategies..."},
	}

	intent, err := classifier.ClassifyWithHistory(context.Background(), "Can you give an example?", history)
	require.NoError(t, err)
	assert.Equal(t, IntentConcept, intent)
}

func TestClassifier_ClassifyWithHistory_TruncatesLongHistory(t *testing.T) {
	stub := &classifierStubProvider{response: "byop"}
	manager := createTestManager(stub)
	classifier := NewClassifier(manager)

	// Create more than 4 turns of history
	history := []ConversationTurn{
		{Role: "user", Content: "Message 1"},
		{Role: "assistant", Content: "Response 1"},
		{Role: "user", Content: "Message 2"},
		{Role: "assistant", Content: "Response 2"},
		{Role: "user", Content: "Message 3"},
		{Role: "assistant", Content: "Response 3"},
		{Role: "user", Content: "Message 4"},
		{Role: "assistant", Content: "Response 4"},
	}

	// This should only use the last 4 turns
	intent, err := classifier.ClassifyWithHistory(context.Background(), "Help me solve this problem", history)
	require.NoError(t, err)
	assert.Equal(t, IntentBYOP, intent)
}

func TestClassifier_Classify_AllValidIntents(t *testing.T) {
	tests := []struct {
		response string
		expected Intent
	}{
		{"byop", IntentBYOP},
		{"syntax", IntentSyntax},
		{"complexity", IntentComplexity},
		{"diagram", IntentDiagram},
		{"intersection", IntentIntersection},
		{"concept", IntentConcept},
		{"out_of_scope", IntentOutOfScope},
		{"BYOP", IntentBYOP},           // uppercase
		{"  concept  ", IntentConcept}, // whitespace
	}

	for _, tt := range tests {
		t.Run(tt.response, func(t *testing.T) {
			stub := &classifierStubProvider{response: tt.response}
			manager := createTestManager(stub)
			classifier := NewClassifier(manager)

			intent, err := classifier.Classify(context.Background(), "test message")
			require.NoError(t, err)
			assert.Equal(t, tt.expected, intent)
		})
	}
}

func TestIntentConstants(t *testing.T) {
	// Verify intent constants have correct values
	assert.Equal(t, Intent("byop"), IntentBYOP)
	assert.Equal(t, Intent("syntax"), IntentSyntax)
	assert.Equal(t, Intent("complexity"), IntentComplexity)
	assert.Equal(t, Intent("diagram"), IntentDiagram)
	assert.Equal(t, Intent("intersection"), IntentIntersection)
	assert.Equal(t, Intent("concept"), IntentConcept)
	assert.Equal(t, Intent("out_of_scope"), IntentOutOfScope)
}

func TestConversationTurnStruct(t *testing.T) {
	turn := ConversationTurn{
		Role:    "user",
		Content: "Hello",
	}
	assert.Equal(t, "user", turn.Role)
	assert.Equal(t, "Hello", turn.Content)
}
