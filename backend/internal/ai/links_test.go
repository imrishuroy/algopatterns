package ai

import (
	"encoding/json"
	"testing"

	"github.com/imrishuroy/algopatterns/internal/ai/rag"
	"github.com/stretchr/testify/assert"
)

func TestBuildLinkManifest_Empty(t *testing.T) {
	result := BuildLinkManifest(nil)
	assert.Empty(t, result)

	result = BuildLinkManifest([]rag.ContentEmbedding{})
	assert.Empty(t, result)
}

func TestBuildLinkManifest_PatternType(t *testing.T) {
	metadata, _ := json.Marshal(map[string]interface{}{
		"slug":  "two-pointers",
		"title": "Two Pointers Pattern",
	})

	results := []rag.ContentEmbedding{
		{
			ContentType: "pattern",
			SourceID:    "two-pointers",
			Metadata:    metadata,
		},
	}

	links := BuildLinkManifest(results)

	assert.Len(t, links, 1)
	assert.Equal(t, "pattern", links[0].Type)
	assert.Equal(t, "two-pointers", links[0].Slug)
	assert.Equal(t, "Two Pointers Pattern", links[0].Title)
	assert.Equal(t, "/patterns/two-pointers", links[0].URL)
}

func TestBuildLinkManifest_ProblemType(t *testing.T) {
	metadata, _ := json.Marshal(map[string]interface{}{
		"slug":  "two-sum",
		"title": "Two Sum",
	})

	results := []rag.ContentEmbedding{
		{
			ContentType: "problem",
			SourceID:    "two-sum",
			Metadata:    metadata,
		},
	}

	links := BuildLinkManifest(results)

	assert.Len(t, links, 1)
	assert.Equal(t, "problem", links[0].Type)
	assert.Equal(t, "/problems/two-sum", links[0].URL)
}

func TestBuildLinkManifest_ConceptType(t *testing.T) {
	metadata, _ := json.Marshal(map[string]interface{}{
		"slug":  "big-o-notation",
		"title": "Big O Notation",
	})

	results := []rag.ContentEmbedding{
		{
			ContentType: "concept",
			SourceID:    "big-o-notation",
			Metadata:    metadata,
		},
	}

	links := BuildLinkManifest(results)

	assert.Len(t, links, 1)
	assert.Equal(t, "concept", links[0].Type)
	assert.Equal(t, "/dsa-fundamentals/big-o-notation", links[0].URL)
}

func TestBuildLinkManifest_ArticleType(t *testing.T) {
	metadata, _ := json.Marshal(map[string]interface{}{
		"slug":  "mastering-recursion",
		"title": "Mastering Recursion",
	})

	results := []rag.ContentEmbedding{
		{
			ContentType: "article",
			SourceID:    "mastering-recursion",
			Metadata:    metadata,
		},
	}

	links := BuildLinkManifest(results)

	assert.Len(t, links, 1)
	assert.Equal(t, "article", links[0].Type)
	assert.Equal(t, "/articles/mastering-recursion", links[0].URL)
}

func TestBuildLinkManifest_UnknownType(t *testing.T) {
	metadata, _ := json.Marshal(map[string]interface{}{
		"slug":  "unknown-content",
		"title": "Unknown Content",
	})

	results := []rag.ContentEmbedding{
		{
			ContentType: "unknown",
			SourceID:    "unknown-content",
			Metadata:    metadata,
		},
	}

	links := BuildLinkManifest(results)

	// Unknown types should be skipped
	assert.Empty(t, links)
}

func TestBuildLinkManifest_Deduplication(t *testing.T) {
	metadata, _ := json.Marshal(map[string]interface{}{
		"slug":  "sliding-window",
		"title": "Sliding Window",
	})

	results := []rag.ContentEmbedding{
		{
			ContentType: "pattern",
			SourceID:    "sliding-window",
			Metadata:    metadata,
		},
		{
			ContentType: "pattern",
			SourceID:    "sliding-window",
			Metadata:    metadata,
		},
		{
			ContentType: "pattern",
			SourceID:    "sliding-window",
			Metadata:    metadata,
		},
	}

	links := BuildLinkManifest(results)

	// Should be deduplicated to just one
	assert.Len(t, links, 1)
}

func TestBuildLinkManifest_NoMetadata(t *testing.T) {
	results := []rag.ContentEmbedding{
		{
			ContentType: "pattern",
			SourceID:    "binary-search",
			Metadata:    nil,
		},
	}

	links := BuildLinkManifest(results)

	assert.Len(t, links, 1)
	assert.Equal(t, "binary-search", links[0].Slug)
	assert.Equal(t, "Binary Search", links[0].Title) // Auto-formatted
	assert.Equal(t, "/patterns/binary-search", links[0].URL)
}

func TestBuildLinkManifest_InvalidJSON(t *testing.T) {
	results := []rag.ContentEmbedding{
		{
			ContentType: "pattern",
			SourceID:    "test-pattern",
			Metadata:    []byte("invalid json"),
		},
	}

	links := BuildLinkManifest(results)

	// Should still create a link using sourceID
	assert.Len(t, links, 1)
	assert.Equal(t, "test-pattern", links[0].Slug)
}

func TestBuildLinkManifest_MetadataWithCategory(t *testing.T) {
	metadata, _ := json.Marshal(map[string]interface{}{
		"category": "Arrays",
		"slug":     "array-pattern",
	})

	results := []rag.ContentEmbedding{
		{
			ContentType: "pattern",
			SourceID:    "array-pattern",
			Metadata:    metadata,
		},
	}

	links := BuildLinkManifest(results)

	assert.Len(t, links, 1)
	// Category is used as title when no name or title is present
	assert.Equal(t, "Arrays", links[0].Title)
}

func TestBuildLinkManifest_MetadataWithName(t *testing.T) {
	metadata, _ := json.Marshal(map[string]interface{}{
		"category": "Arrays",
		"name":     "Array Techniques",
		"slug":     "array-techniques",
	})

	results := []rag.ContentEmbedding{
		{
			ContentType: "pattern",
			SourceID:    "array-techniques",
			Metadata:    metadata,
		},
	}

	links := BuildLinkManifest(results)

	assert.Len(t, links, 1)
	// Name overrides category
	assert.Equal(t, "Array Techniques", links[0].Title)
}

func TestBuildLinkManifest_TitleOverridesAll(t *testing.T) {
	metadata, _ := json.Marshal(map[string]interface{}{
		"category": "Arrays",
		"name":     "Array Techniques",
		"title":    "The Ultimate Array Guide",
		"slug":     "array-guide",
	})

	results := []rag.ContentEmbedding{
		{
			ContentType: "pattern",
			SourceID:    "array-guide",
			Metadata:    metadata,
		},
	}

	links := BuildLinkManifest(results)

	assert.Len(t, links, 1)
	// Title takes priority over name and category
	assert.Equal(t, "The Ultimate Array Guide", links[0].Title)
}

func TestBuildURL(t *testing.T) {
	tests := []struct {
		contentType string
		slug        string
		sourceID    string
		expected    string
	}{
		{"pattern", "two-pointers", "", "/patterns/two-pointers"},
		{"problem", "two-sum", "", "/problems/two-sum"},
		{"concept", "big-o", "", "/dsa-fundamentals/big-o"},
		{"article", "recursion", "", "/articles/recursion"},
		{"unknown", "test", "", ""},
		{"pattern", "", "fallback-id", "/patterns/fallback-id"},
		{"pattern", "", "", ""},
	}

	for _, tt := range tests {
		t.Run(tt.contentType+"_"+tt.slug, func(t *testing.T) {
			result := buildURL(tt.contentType, tt.slug, tt.sourceID)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestFormatTitle(t *testing.T) {
	tests := []struct {
		slug     string
		expected string
	}{
		{"two-pointers", "Two Pointers"},
		{"sliding-window", "Sliding Window"},
		{"binary-search", "Binary Search"},
		{"dfs", "Dfs"},
		{"a-b-c-d", "A B C D"},
		{"", ""},
		{"single", "Single"},
	}

	for _, tt := range tests {
		t.Run(tt.slug, func(t *testing.T) {
			result := formatTitle(tt.slug)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestFormatLinkManifest_Empty(t *testing.T) {
	result := FormatLinkManifest(nil)
	assert.Empty(t, result)

	result = FormatLinkManifest([]LinkEntry{})
	assert.Empty(t, result)
}

func TestFormatLinkManifest_SingleLink(t *testing.T) {
	links := []LinkEntry{
		{
			Type:  "pattern",
			Slug:  "two-pointers",
			Title: "Two Pointers",
			URL:   "/patterns/two-pointers",
		},
	}

	result := FormatLinkManifest(links)

	assert.Contains(t, result, "The following are the ONLY valid internal links")
	assert.Contains(t, result, "| Title | URL |")
	assert.Contains(t, result, "| Two Pointers | /patterns/two-pointers |")
	assert.Contains(t, result, "Format links in your response as: [Title](/path)")
}

func TestFormatLinkManifest_MultipleLinks(t *testing.T) {
	links := []LinkEntry{
		{Type: "pattern", Slug: "two-pointers", Title: "Two Pointers", URL: "/patterns/two-pointers"},
		{Type: "problem", Slug: "two-sum", Title: "Two Sum", URL: "/problems/two-sum"},
		{Type: "concept", Slug: "arrays", Title: "Arrays", URL: "/dsa-fundamentals/arrays"},
	}

	result := FormatLinkManifest(links)

	assert.Contains(t, result, "| Two Pointers | /patterns/two-pointers |")
	assert.Contains(t, result, "| Two Sum | /problems/two-sum |")
	assert.Contains(t, result, "| Arrays | /dsa-fundamentals/arrays |")
}

func TestDedupeBySourceID_Empty(t *testing.T) {
	result := DedupeBySourceID(nil)
	assert.Empty(t, result)

	result = DedupeBySourceID([]rag.ContentEmbedding{})
	assert.Empty(t, result)
}

func TestDedupeBySourceID_NoDuplicates(t *testing.T) {
	results := []rag.ContentEmbedding{
		{ContentType: "pattern", SourceID: "pattern-1"},
		{ContentType: "pattern", SourceID: "pattern-2"},
		{ContentType: "problem", SourceID: "problem-1"},
	}

	deduped := DedupeBySourceID(results)

	assert.Len(t, deduped, 3)
}

func TestDedupeBySourceID_WithDuplicates(t *testing.T) {
	results := []rag.ContentEmbedding{
		{ContentType: "pattern", SourceID: "pattern-1"},
		{ContentType: "pattern", SourceID: "pattern-1"}, // duplicate
		{ContentType: "pattern", SourceID: "pattern-2"},
		{ContentType: "problem", SourceID: "problem-1"},
		{ContentType: "problem", SourceID: "problem-1"}, // duplicate
		{ContentType: "problem", SourceID: "problem-1"}, // duplicate
	}

	deduped := DedupeBySourceID(results)

	assert.Len(t, deduped, 3)
	// Verify order is preserved (first occurrence kept)
	assert.Equal(t, "pattern-1", deduped[0].SourceID)
	assert.Equal(t, "pattern-2", deduped[1].SourceID)
	assert.Equal(t, "problem-1", deduped[2].SourceID)
}

func TestDedupeBySourceID_SameSourceIDDifferentType(t *testing.T) {
	// Same sourceID but different content type should NOT be considered duplicates
	results := []rag.ContentEmbedding{
		{ContentType: "pattern", SourceID: "two-sum"},
		{ContentType: "problem", SourceID: "two-sum"},
	}

	deduped := DedupeBySourceID(results)

	assert.Len(t, deduped, 2) // Both should be kept
}

func TestLinkEntry_JSON(t *testing.T) {
	link := LinkEntry{
		Type:  "pattern",
		Slug:  "two-pointers",
		Title: "Two Pointers",
		URL:   "/patterns/two-pointers",
	}

	data, err := json.Marshal(link)
	assert.NoError(t, err)

	var parsed LinkEntry
	err = json.Unmarshal(data, &parsed)
	assert.NoError(t, err)

	assert.Equal(t, link, parsed)
}
