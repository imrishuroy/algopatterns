package llm

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewMessage(t *testing.T) {
	msg := NewMessage("user", "Hello")
	assert.Equal(t, "user", msg.Role)
	assert.Equal(t, "Hello", msg.Content)
}

func TestSystemMessage(t *testing.T) {
	msg := SystemMessage("You are a helpful assistant")
	assert.Equal(t, "system", msg.Role)
	assert.Equal(t, "You are a helpful assistant", msg.Content)
}

func TestUserMessage(t *testing.T) {
	msg := UserMessage("What is 2+2?")
	assert.Equal(t, "user", msg.Role)
	assert.Equal(t, "What is 2+2?", msg.Content)
}

func TestAssistantMessage(t *testing.T) {
	msg := AssistantMessage("2+2 equals 4")
	assert.Equal(t, "assistant", msg.Role)
	assert.Equal(t, "2+2 equals 4", msg.Content)
}
