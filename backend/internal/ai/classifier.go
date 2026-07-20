package ai

import (
	"context"
	"strings"

	"github.com/imrishuroy/algopatterns/internal/ai/llm"
	"github.com/rs/zerolog/log"
)

// Intent represents the classified intent of a user message
type Intent string

const (
	IntentBYOP         Intent = "byop"
	IntentSyntax       Intent = "syntax"
	IntentComplexity   Intent = "complexity"
	IntentDiagram      Intent = "diagram"
	IntentIntersection Intent = "intersection"
	IntentConcept      Intent = "concept"
	IntentOutOfScope   Intent = "out_of_scope"
)

// validIntents maps valid intent strings
var validIntents = map[string]Intent{
	"byop":         IntentBYOP,
	"syntax":       IntentSyntax,
	"complexity":   IntentComplexity,
	"diagram":      IntentDiagram,
	"intersection": IntentIntersection,
	"concept":      IntentConcept,
	"out_of_scope": IntentOutOfScope,
}

// ClassifierPrompt is the system prompt for intent classification
const ClassifierPrompt = `You are an intent classifier for a DSA (Data Structures and Algorithms) tutoring chat.
Classify the user's message into exactly ONE of these labels:

- byop: The user pasted or described a specific DSA coding problem and wants help solving it.
- syntax: The user asks about language mechanics (syntax, API, how to write X in language Y).
- complexity: The user pasted code and wants time/space complexity analysis.
- diagram: The user explicitly requests a visual or diagram, or asks to visualize an algorithm.
- intersection: The user asks how two or more DSA patterns or concepts work together.
- concept: The user asks about a DSA concept in general (not a specific problem to solve).
- out_of_scope: The message is not about DSA, algorithms, or coding concepts.

Rules:
- If the message contains a problem statement (inputs, outputs, constraints) and asks for help, it is "byop".
- If the message asks "how do I" or "how to" write syntax, it is "syntax".
- If the message contains a code block and asks about complexity or performance, it is "complexity".
- If the message is about web development, general knowledge, or anything outside DSA, it is "out_of_scope".
- IMPORTANT: Short replies like "yes", "no", "ok", "I see", "got it", "thanks", or single words that are RESPONSES to a prior tutor question should be classified based on the CONVERSATION CONTEXT, not as standalone messages. If the conversation is about DSA, classify as "concept".

Respond with ONLY the label, no other text.`

// Classifier classifies user messages into intents
type Classifier struct {
	llmManager *llm.Manager
}

// NewClassifier creates a new intent classifier
func NewClassifier(llmManager *llm.Manager) *Classifier {
	return &Classifier{
		llmManager: llmManager,
	}
}

// ConversationTurn represents a message in conversation history for the classifier
type ConversationTurn struct {
	Role    string
	Content string
}

// Classify classifies a user message into an intent
func (c *Classifier) Classify(ctx context.Context, message string) (Intent, error) {
	return c.ClassifyWithHistory(ctx, message, nil)
}

// ClassifyWithHistory classifies a user message with conversation context
func (c *Classifier) ClassifyWithHistory(ctx context.Context, message string, history []ConversationTurn) (Intent, error) {
	// For very short messages that are likely responses to tutor questions,
	// default to concept if there's ongoing conversation history
	if len(history) > 0 && isShortReply(message) {
		return IntentConcept, nil
	}

	// Build the classification request with context
	var userContent strings.Builder
	if len(history) > 0 {
		userContent.WriteString("Recent conversation context:\n")
		// Include last 2-4 turns for context (to keep token usage low)
		startIdx := 0
		if len(history) > 4 {
			startIdx = len(history) - 4
		}
		for _, turn := range history[startIdx:] {
			role := "User"
			if turn.Role == "assistant" {
				role = "Tutor"
			}
			userContent.WriteString(role)
			userContent.WriteString(": ")
			userContent.WriteString(turn.Content)
			userContent.WriteString("\n")
		}
		userContent.WriteString("\nNew message to classify: ")
	}
	userContent.WriteString(message)

	messages := []llm.Message{
		llm.SystemMessage(ClassifierPrompt),
		llm.UserMessage(userContent.String()),
	}

	req := llm.ChatRequest{
		Messages:    messages,
		Temperature: 0.0, // Deterministic for classification
		MaxTokens:   32,  // Intent labels are short
	}

	resp, err := c.llmManager.Chat(ctx, req)
	if err != nil {
		log.Warn().Err(err).Msg("Intent classification failed")
		return IntentConcept, err // Default to concept on error
	}

	// Parse the response and validate it's a known intent
	intentStr := strings.TrimSpace(strings.ToLower(resp.Content))

	if intent, ok := validIntents[intentStr]; ok {
		return intent, nil
	}

	// If we can't parse the response, default to concept
	log.Warn().
		Str("response", resp.Content).
		Msg("Classifier returned unknown intent, defaulting to concept")
	return IntentConcept, nil
}

// isShortReply detects short conversational replies that shouldn't be classified standalone
func isShortReply(message string) bool {
	msg := strings.ToLower(strings.TrimSpace(message))
	// Very short messages (3 words or less) in the context of ongoing conversation
	wordCount := len(strings.Fields(msg))
	if wordCount > 5 {
		return false
	}

	// Common short replies that are responses to tutor questions
	shortReplies := []string{
		"yes", "no", "ok", "okay", "sure", "got it", "i see", "thanks",
		"thank you", "right", "correct", "exactly", "yep", "nope",
		"i think so", "maybe", "not sure", "i don't know", "idk",
		"hmm", "ah", "oh", "aha", "interesting",
	}

	for _, reply := range shortReplies {
		if msg == reply {
			return true
		}
	}

	return false
}

// NeedsRAG returns whether the given intent requires RAG context
func NeedsRAG(intent Intent) bool {
	switch intent {
	case IntentSyntax, IntentComplexity, IntentOutOfScope:
		return false
	default:
		return true
	}
}

// OutOfScopeRefusal is the canned response for out-of-scope queries
const OutOfScopeRefusal = `I'm Thor, your DSA and algorithms tutor. I can help with data structures, algorithms, coding patterns, complexity analysis, and programming concepts.

I'm not able to help with that topic. If you have a DSA question, paste it here and I'll guide you through it.`
