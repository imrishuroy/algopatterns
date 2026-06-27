package llm

import (
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
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

func TestMarshalWithExtra_NoExtra(t *testing.T) {
	type testStruct struct {
		Name string `json:"name"`
		Age  int    `json:"age"`
	}
	v := testStruct{Name: "test", Age: 25}

	result, err := MarshalWithExtra(v, nil)
	require.NoError(t, err)

	var decoded map[string]interface{}
	err = json.Unmarshal(result, &decoded)
	require.NoError(t, err)
	assert.Equal(t, "test", decoded["name"])
	assert.Equal(t, float64(25), decoded["age"])
	assert.Len(t, decoded, 2)
}

func TestMarshalWithExtra_EmptyExtra(t *testing.T) {
	type testStruct struct {
		Name string `json:"name"`
	}
	v := testStruct{Name: "test"}

	result, err := MarshalWithExtra(v, json.RawMessage(""))
	require.NoError(t, err)

	var decoded map[string]interface{}
	err = json.Unmarshal(result, &decoded)
	require.NoError(t, err)
	assert.Equal(t, "test", decoded["name"])
}

func TestMarshalWithExtra_NullExtra(t *testing.T) {
	type testStruct struct {
		Name string `json:"name"`
	}
	v := testStruct{Name: "test"}

	result, err := MarshalWithExtra(v, json.RawMessage("null"))
	require.NoError(t, err)

	var decoded map[string]interface{}
	err = json.Unmarshal(result, &decoded)
	require.NoError(t, err)
	assert.Equal(t, "test", decoded["name"])
}

func TestMarshalWithExtra_MergesExtra(t *testing.T) {
	type testStruct struct {
		Name string `json:"name"`
	}
	v := testStruct{Name: "test"}

	extra := json.RawMessage(`{"extra_field": "extra_value", "extra_number": 42}`)
	result, err := MarshalWithExtra(v, extra)
	require.NoError(t, err)

	var decoded map[string]interface{}
	err = json.Unmarshal(result, &decoded)
	require.NoError(t, err)
	assert.Equal(t, "test", decoded["name"])
	assert.Equal(t, "extra_value", decoded["extra_field"])
	assert.Equal(t, float64(42), decoded["extra_number"])
}

func TestMarshalWithExtra_OverridesConflictingFields(t *testing.T) {
	type testStruct struct {
		Name string `json:"name"`
	}
	v := testStruct{Name: "original"}

	extra := json.RawMessage(`{"name": "overridden"}`)
	result, err := MarshalWithExtra(v, extra)
	require.NoError(t, err)

	var decoded map[string]interface{}
	err = json.Unmarshal(result, &decoded)
	require.NoError(t, err)
	assert.Equal(t, "overridden", decoded["name"])
}

func TestMarshalWithExtra_InvalidBase(t *testing.T) {
	// Channels can't be marshaled to JSON
	_, err := MarshalWithExtra(make(chan int), nil)
	require.Error(t, err)
}

func TestMarshalWithExtra_InvalidExtra(t *testing.T) {
	type testStruct struct {
		Name string `json:"name"`
	}
	v := testStruct{Name: "test"}

	_, err := MarshalWithExtra(v, json.RawMessage(`{invalid json}`))
	require.Error(t, err)
}

func TestChatRequestDefaults(t *testing.T) {
	req := ChatRequest{
		Messages: []Message{UserMessage("hello")},
	}
	assert.Equal(t, float64(0), req.Temperature)
	assert.Equal(t, float64(0), req.TopP)
	assert.Equal(t, 0, req.MaxTokens)
	assert.False(t, req.Stream)
	assert.Nil(t, req.ExtraBody)
	assert.Empty(t, req.Model)
}

func TestChatResponseReasoningContent(t *testing.T) {
	resp := ChatResponse{
		Content:          "answer",
		ReasoningContent: "chain of thought",
	}
	assert.Equal(t, "answer", resp.Content)
	assert.Equal(t, "chain of thought", resp.ReasoningContent)
}

func TestStreamChunkReasoningContent(t *testing.T) {
	chunk := StreamChunk{
		Content:          "hello",
		ReasoningContent: "thinking",
	}
	assert.Equal(t, "hello", chunk.Content)
	assert.Equal(t, "thinking", chunk.ReasoningContent)
}

func TestStreamChunkDone(t *testing.T) {
	chunk := StreamChunk{Done: true}
	assert.True(t, chunk.Done)
	assert.Empty(t, chunk.Content)
}

func TestStreamChunkError(t *testing.T) {
	chunk := StreamChunk{Error: assert.AnError}
	assert.Error(t, chunk.Error)
}

func TestChatRequestTopP(t *testing.T) {
	req := ChatRequest{
		Messages: []Message{UserMessage("hi")},
		TopP:     0.9,
	}
	assert.Equal(t, 0.9, req.TopP)
}

func TestChatRequestExtraBody(t *testing.T) {
	extra := json.RawMessage(`{"key": "value"}`)
	req := ChatRequest{
		Messages:  []Message{UserMessage("hi")},
		ExtraBody: extra,
	}
	assert.Equal(t, extra, req.ExtraBody)
}
