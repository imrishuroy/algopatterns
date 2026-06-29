package rag

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestVectorToString(t *testing.T) {
	v := []float32{1.0, 2.0, 3.0}
	result := vectorToString(v)
	assert.Equal(t, "[1,2,3]", result)
}

func TestBuildRAGContext(t *testing.T) {
	s := &Service{}

	t.Run("empty results", func(t *testing.T) {
		result := s.BuildRAGContext(nil)
		assert.Empty(t, result)
	})

	t.Run("single result", func(t *testing.T) {
		results := []ContentEmbedding{
			{
				ContentType: "pattern",
				ChunkType:   "overview",
				Content:     "This is a test pattern",
			},
		}
		result := s.BuildRAGContext(results)
		assert.Contains(t, result, "[pattern - overview]")
		assert.Contains(t, result, "This is a test pattern")
	})

	t.Run("multiple results", func(t *testing.T) {
		results := []ContentEmbedding{
			{
				ContentType: "pattern",
				ChunkType:   "overview",
				Content:     "First pattern",
			},
			{
				ContentType: "concept",
				ChunkType:   "insights",
				Content:     "Second concept",
			},
		}
		result := s.BuildRAGContext(results)
		assert.Contains(t, result, "[pattern - overview]")
		assert.Contains(t, result, "First pattern")
		assert.Contains(t, result, "[concept - insights]")
		assert.Contains(t, result, "Second concept")
		assert.Contains(t, result, "---")
	})
}
