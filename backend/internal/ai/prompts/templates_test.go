package prompts

import (
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestFormatHistory_Empty(t *testing.T) {
	result := formatHistory(nil)
	assert.Empty(t, result)

	result = formatHistory([]ConversationTurn{})
	assert.Empty(t, result)
}

func TestFormatHistory_SingleUserTurn(t *testing.T) {
	history := []ConversationTurn{
		{Role: "user", Content: "Hello"},
	}
	result := formatHistory(history)
	assert.Contains(t, result, "<CONVERSATION_HISTORY>")
	assert.Contains(t, result, "[User]: Hello")
	assert.Contains(t, result, "</CONVERSATION_HISTORY>")
}

func TestFormatHistory_AssistantTutorLabel(t *testing.T) {
	history := []ConversationTurn{
		{Role: "assistant", Content: "Let me help you"},
	}
	result := formatHistory(history)
	assert.Contains(t, result, "[Tutor]: Let me help you")
}

func TestFormatHistory_MultipleTurns(t *testing.T) {
	history := []ConversationTurn{
		{Role: "user", Content: "What is two pointers?"},
		{Role: "assistant", Content: "It's a pattern"},
		{Role: "user", Content: "Can you give an example?"},
	}
	result := formatHistory(history)
	assert.Contains(t, result, "[User]: What is two pointers?")
	assert.Contains(t, result, "[Tutor]: It's a pattern")
	assert.Contains(t, result, "[User]: Can you give an example?")
	// Check ordering
	userIdx := strings.Index(result, "[User]: What is two pointers?")
	tutorIdx := strings.Index(result, "[Tutor]: It's a pattern")
	user2Idx := strings.Index(result, "[User]: Can you give an example?")
	assert.True(t, userIdx < tutorIdx)
	assert.True(t, tutorIdx < user2Idx)
}

func TestFormatHistory_TrimsWhitespace(t *testing.T) {
	history := []ConversationTurn{
		{Role: "user", Content: "  Hello  "},
	}
	result := formatHistory(history)
	assert.Contains(t, result, "[User]: Hello")
	assert.NotContains(t, result, "  Hello  ")
}

func TestInjectRAG_EmptyString(t *testing.T) {
	var sb strings.Builder
	injectRAG(&sb, "")
	assert.Empty(t, sb.String())
}

func TestInjectRAG_WithContext(t *testing.T) {
	var sb strings.Builder
	injectRAG(&sb, "sliding window pattern")
	result := sb.String()
	assert.Contains(t, result, "<ALGOPATTERNS_KNOWLEDGE_BASE>")
	assert.Contains(t, result, "sliding window pattern")
	assert.Contains(t, result, "</ALGOPATTERNS_KNOWLEDGE_BASE>")
}

func TestInjectRAG_MultiLineContext(t *testing.T) {
	var sb strings.Builder
	injectRAG(&sb, "line1\nline2\nline3")
	result := sb.String()
	assert.Contains(t, result, "line1\nline2\nline3")
}

func TestFormatCurrentProblem_Full(t *testing.T) {
	var sb strings.Builder
	formatCurrentProblem(&sb, "Two Sum", "Find pairs", "def two_sum(): pass", "python")
	result := sb.String()
	assert.Contains(t, result, "<CURRENT_PROBLEM>")
	assert.Contains(t, result, "Title: Two Sum")
	assert.Contains(t, result, "Language: python")
	assert.Contains(t, result, "Description: Find pairs")
	assert.Contains(t, result, "```python")
	assert.Contains(t, result, "def two_sum(): pass")
	assert.Contains(t, result, "</CURRENT_PROBLEM>")
}

func TestFormatCurrentProblem_EmptyFields(t *testing.T) {
	var sb strings.Builder
	formatCurrentProblem(&sb, "", "", "", "")
	result := sb.String()
	assert.Contains(t, result, "<CURRENT_PROBLEM>")
	assert.Contains(t, result, "</CURRENT_PROBLEM>")
	assert.NotContains(t, result, "Title:")
	assert.NotContains(t, result, "Language:")
	assert.NotContains(t, result, "Description:")
	assert.NotContains(t, result, "User's Code:")
}

func TestFormatCurrentProblem_CodeWithoutLanguage(t *testing.T) {
	var sb strings.Builder
	formatCurrentProblem(&sb, "Test", "", "print('hi')", "")
	result := sb.String()
	assert.Contains(t, result, "```\nprint('hi')\n```")
}

func TestBuildHintPrompt(t *testing.T) {
	history := []ConversationTurn{
		{Role: "user", Content: "I'm stuck"},
	}
	result := BuildHintPrompt(2, "Two Sum", "def f(): pass", "python", history, "sliding window context")
	assert.Contains(t, result, BaseSystemPrompt)
	assert.Contains(t, result, "Hint Level: 2/4")
	assert.Contains(t, result, "<CONVERSATION_HISTORY>")
	assert.Contains(t, result, "[User]: I'm stuck")
	assert.Contains(t, result, "<ALGOPATTERNS_KNOWLEDGE_BASE>")
	assert.Contains(t, result, "sliding window context")
	assert.Contains(t, result, "<CURRENT_PROBLEM>")
	assert.Contains(t, result, "Title: Two Sum")
	assert.Contains(t, result, "User's Code:\n```python")
}

func TestBuildHintPrompt_NoHistoryNoRAG(t *testing.T) {
	result := BuildHintPrompt(1, "Test", "code", "go", nil, "")
	assert.Contains(t, result, BaseSystemPrompt)
	assert.Contains(t, result, "Hint Level: 1/4")
	assert.NotContains(t, result, "<CONVERSATION_HISTORY>")
	assert.NotContains(t, result, "<ALGOPATTERNS_KNOWLEDGE_BASE>")
	assert.Contains(t, result, "<CURRENT_PROBLEM>")
}

func TestBuildReviewPrompt(t *testing.T) {
	history := []ConversationTurn{
		{Role: "user", Content: "Please review"},
	}
	result := BuildReviewPrompt("Two Sum", "def f(): pass", "python", []string{"time complexity", "edge cases"}, history, "context")
	assert.Contains(t, result, BaseSystemPrompt)
	assert.Contains(t, result, ReviewPromptTemplate)
	assert.Contains(t, result, "FOCUS AREAS: time complexity, edge cases")
	assert.Contains(t, result, "<CONVERSATION_HISTORY>")
	assert.Contains(t, result, "[User]: Please review")
	assert.Contains(t, result, "<ALGOPATTERNS_KNOWLEDGE_BASE>")
	assert.Contains(t, result, "<CURRENT_PROBLEM>")
}

func TestBuildReviewPrompt_NoFocusAreas(t *testing.T) {
	result := BuildReviewPrompt("Test", "code", "go", nil, nil, "")
	assert.NotContains(t, result, "FOCUS AREAS:")
}

func TestBuildReviewPrompt_EmptyFocusAreas(t *testing.T) {
	result := BuildReviewPrompt("Test", "code", "go", []string{}, nil, "")
	assert.NotContains(t, result, "FOCUS AREAS:")
}

func TestBuildExplainErrorPrompt(t *testing.T) {
	history := []ConversationTurn{
		{Role: "user", Content: "I got an error"},
	}
	result := BuildExplainErrorPrompt("TypeError", "int is not callable", 42, "x = 1\nx()", "python", history, "error context")
	assert.Contains(t, result, BaseSystemPrompt)
	assert.Contains(t, result, "Error type: TypeError")
	assert.Contains(t, result, "Error message: int is not callable")
	assert.Contains(t, result, "Line number: 42")
	assert.Contains(t, result, "<CONVERSATION_HISTORY>")
	assert.Contains(t, result, "<ALGOPATTERNS_KNOWLEDGE_BASE>")
	assert.Contains(t, result, "<CURRENT_PROBLEM>")
}

func TestBuildExplainErrorPrompt_NoLineNumber(t *testing.T) {
	result := BuildExplainErrorPrompt("Error", "msg", 0, "code", "go", nil, "")
	assert.NotContains(t, result, "Line number: 0")
	assert.NotContains(t, result, "Line number:")
}

func TestBuildChatPrompt_NoHistory(t *testing.T) {
	result := BuildChatPrompt("Two Sum", "python", nil, "")
	assert.Contains(t, result, "Session Stage: first message — start with problem understanding")
	assert.Contains(t, result, BaseSystemPrompt)
	assert.Contains(t, result, "First Message: Keep it brief")
	assert.Contains(t, result, "<CURRENT_PROBLEM>")
	assert.Contains(t, result, "Title: Two Sum")
	assert.NotContains(t, result, "<CONVERSATION_HISTORY>")
}

func TestBuildChatPrompt_WithHistory(t *testing.T) {
	history := []ConversationTurn{
		{Role: "user", Content: "Hi"},
		{Role: "assistant", Content: "Hello"},
	}
	result := BuildChatPrompt("Two Sum", "python", history, "")
	assert.Contains(t, result, "Session Stage: ongoing")
	assert.Contains(t, result, "2 prior turns")
	assert.Contains(t, result, "<CONVERSATION_HISTORY>")
}

func TestBuildChatPrompt_WithRAG(t *testing.T) {
	result := BuildChatPrompt("Test", "go", nil, "rag context data")
	assert.Contains(t, result, "<ALGOPATTERNS_KNOWLEDGE_BASE>")
	assert.Contains(t, result, "rag context data")
}

func TestBuildDebugPrompt(t *testing.T) {
	history := []ConversationTurn{
		{Role: "user", Content: "My code fails"},
	}
	result := BuildDebugPrompt("Two Sum", "def f(): pass", "python", "IndexError: list index out of range", history, "debug context")
	assert.Contains(t, result, BaseSystemPrompt)
	assert.Contains(t, result, DebugPromptTemplate)
	assert.Contains(t, result, "<CONVERSATION_HISTORY>")
	assert.Contains(t, result, "[User]: My code fails")
	assert.Contains(t, result, "<ALGOPATTERNS_KNOWLEDGE_BASE>")
	assert.Contains(t, result, "debug context")
	assert.Contains(t, result, "<CURRENT_PROBLEM>")
	assert.Contains(t, result, "<ERROR_OUTPUT>")
	assert.Contains(t, result, "IndexError: list index out of range")
}

func TestBuildDebugPrompt_NoErrorOutput(t *testing.T) {
	result := BuildDebugPrompt("Test", "code", "go", "", nil, "")
	assert.NotContains(t, result, "<ERROR_OUTPUT>")
}

func TestBuildDebugPrompt_NoHistoryNoRAG(t *testing.T) {
	result := BuildDebugPrompt("Test", "code", "go", "error msg", nil, "")
	assert.NotContains(t, result, "<CONVERSATION_HISTORY>")
	assert.NotContains(t, result, "<ALGOPATTERNS_KNOWLEDGE_BASE>")
	assert.Contains(t, result, "<ERROR_OUTPUT>")
}

func TestBuildPatternPrompt_RevealPattern(t *testing.T) {
	history := []ConversationTurn{
		{Role: "user", Content: "What pattern is this?"},
	}
	result := BuildPatternPrompt("Two Sum", "Find pairs", true, history, "pattern context")
	assert.Contains(t, result, BaseSystemPrompt)
	assert.Contains(t, result, PatternRecognitionPromptTemplate)
	assert.Contains(t, result, "<CONVERSATION_HISTORY>")
	assert.Contains(t, result, "<ALGOPATTERNS_KNOWLEDGE_BASE>")
	assert.Contains(t, result, "<CURRENT_PROBLEM>")
	assert.Contains(t, result, "<MODE>Reveal the pattern")
}

func TestBuildPatternPrompt_SocraticMode(t *testing.T) {
	history := []ConversationTurn{
		{Role: "user", Content: "Help me figure it out"},
	}
	result := BuildPatternPrompt("Two Sum", "Find pairs", false, history, "")
	assert.Contains(t, result, "<MODE>Socratic")
	assert.Contains(t, result, "guide the user to discover the pattern themselves")
	assert.NotContains(t, result, "Reveal the pattern")
}

func TestBuildPatternPrompt_NoHistoryNoRAG(t *testing.T) {
	result := BuildPatternPrompt("Test", "description", true, nil, "")
	assert.NotContains(t, result, "<CONVERSATION_HISTORY>")
	assert.NotContains(t, result, "<ALGOPATTERNS_KNOWLEDGE_BASE>")
	assert.Contains(t, result, "<CURRENT_PROBLEM>")
	assert.Contains(t, result, "Description: description")
}
