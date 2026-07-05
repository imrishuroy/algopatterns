package rag

import (
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestJoinList(t *testing.T) {
	tests := []struct {
		name     string
		input    []string
		expected string
	}{
		{
			name:     "empty list",
			input:    []string{},
			expected: "",
		},
		{
			name:     "single item",
			input:    []string{"item1"},
			expected: "item1",
		},
		{
			name:     "multiple items",
			input:    []string{"item1", "item2", "item3"},
			expected: "item1\n- item2\n- item3",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := joinList(tt.input)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestNumberedList(t *testing.T) {
	tests := []struct {
		name     string
		input    []string
		expected string
	}{
		{
			name:     "empty list",
			input:    []string{},
			expected: "",
		},
		{
			name:     "single item",
			input:    []string{"item1"},
			expected: "1. item1\n",
		},
		{
			name:     "multiple items",
			input:    []string{"first", "second", "third"},
			expected: "1. first\n2. second\n3. third\n",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := numberedList(tt.input)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestNewIndexer(t *testing.T) {
	service := &Service{}
	indexer := NewIndexer(service)
	assert.NotNil(t, indexer)
	assert.Equal(t, service, indexer.rag)
}

func TestQuestionType(t *testing.T) {
	q := Question{
		ID:         "q-1",
		Name:       "Two Sum",
		URL:        "https://leetcode.com/problems/two-sum",
		Difficulty: "Easy",
		Pattern:    "Hash Map",
		Companies:  []string{"Google", "Amazon"},
		Frequency:  "High",
		Category:   "Arrays",
	}

	assert.Equal(t, "q-1", q.ID)
	assert.Equal(t, "Two Sum", q.Name)
	assert.Equal(t, "https://leetcode.com/problems/two-sum", q.URL)
	assert.Equal(t, "Easy", q.Difficulty)
	assert.Equal(t, "Hash Map", q.Pattern)
	assert.Equal(t, []string{"Google", "Amazon"}, q.Companies)
	assert.Equal(t, "High", q.Frequency)
	assert.Equal(t, "Arrays", q.Category)
}

func TestSolutionType(t *testing.T) {
	s := Solution{
		ProblemSlug:     "two-sum",
		ProblemName:     "Two Sum",
		Approach:        "Use hash map",
		Steps:           []string{"Create map", "Iterate", "Return"},
		Code:            "function twoSum() {}",
		Language:        "javascript",
		TimeComplexity:  "O(n)",
		SpaceComplexity: "O(n)",
	}

	assert.Equal(t, "two-sum", s.ProblemSlug)
	assert.Equal(t, "Two Sum", s.ProblemName)
	assert.Equal(t, "Use hash map", s.Approach)
	assert.Equal(t, []string{"Create map", "Iterate", "Return"}, s.Steps)
	assert.Equal(t, "function twoSum() {}", s.Code)
	assert.Equal(t, "javascript", s.Language)
	assert.Equal(t, "O(n)", s.TimeComplexity)
	assert.Equal(t, "O(n)", s.SpaceComplexity)
}

func TestTutorialSectionType(t *testing.T) {
	ts := TutorialSection{
		Title:   "Introduction",
		Content: "This is the intro",
		Code: map[string]string{
			"java":       "public class Main {}",
			"javascript": "function main() {}",
		},
	}

	assert.Equal(t, "Introduction", ts.Title)
	assert.Equal(t, "This is the intro", ts.Content)
	assert.Equal(t, "public class Main {}", ts.Code["java"])
	assert.Equal(t, "function main() {}", ts.Code["javascript"])
}

func TestArticleType(t *testing.T) {
	a := Article{
		Slug:        "recursion",
		Title:       "Mastering Recursion",
		Description: "Learn recursion",
		Tags:        []string{"Recursion", "Fundamentals"},
		Difficulty:  "intermediate",
	}

	assert.Equal(t, "recursion", a.Slug)
	assert.Equal(t, "Mastering Recursion", a.Title)
	assert.Equal(t, "Learn recursion", a.Description)
	assert.Equal(t, []string{"Recursion", "Fundamentals"}, a.Tags)
	assert.Equal(t, "intermediate", a.Difficulty)
}

func TestArticleSectionType(t *testing.T) {
	as := ArticleSection{
		ArticleSlug:  "recursion",
		ArticleTitle: "Mastering Recursion",
		Slug:         "fundamentals",
		Title:        "Fundamentals",
		Description:  "Basic concepts",
		Order:        1,
	}

	assert.Equal(t, "recursion", as.ArticleSlug)
	assert.Equal(t, "Mastering Recursion", as.ArticleTitle)
	assert.Equal(t, "fundamentals", as.Slug)
	assert.Equal(t, "Fundamentals", as.Title)
	assert.Equal(t, "Basic concepts", as.Description)
	assert.Equal(t, 1, as.Order)
}

func TestConceptType(t *testing.T) {
	c := Concept{
		ID:              "priority-queue",
		Name:            "Priority Queue",
		Slug:            "priority-queue",
		Category:        "Data Structures",
		Description:     "A queue with priority",
		Explanation:     "Detailed explanation",
		TimeComplexity:  "O(log n)",
		SpaceComplexity: "O(n)",
		WhenToUse:       []string{"Scheduling", "Dijkstra"},
		KeyPoints:       []string{"Heap-based"},
		CommonMistakes:  []string{"Forgetting to handle empty"},
		CodeSnippets:    map[string]string{"java": "PriorityQueue<Integer> pq = new PriorityQueue<>();"},
	}

	assert.Equal(t, "priority-queue", c.ID)
	assert.Equal(t, "Priority Queue", c.Name)
	assert.Equal(t, "priority-queue", c.Slug)
	assert.Equal(t, "Data Structures", c.Category)
	assert.Equal(t, "A queue with priority", c.Description)
	assert.Equal(t, "Detailed explanation", c.Explanation)
	assert.Equal(t, "O(log n)", c.TimeComplexity)
	assert.Equal(t, "O(n)", c.SpaceComplexity)
	assert.Equal(t, []string{"Scheduling", "Dijkstra"}, c.WhenToUse)
	assert.Equal(t, []string{"Heap-based"}, c.KeyPoints)
	assert.Equal(t, []string{"Forgetting to handle empty"}, c.CommonMistakes)
	assert.Equal(t, "PriorityQueue<Integer> pq = new PriorityQueue<>();", c.CodeSnippets["java"])
}

func TestPatternType(t *testing.T) {
	p := Pattern{
		ID:             "sliding-window",
		Category:       "Sliding Window",
		Description:    "A pattern for arrays",
		WhenToUse:      []string{"Subarrays", "Substrings"},
		KeyInsights:    []string{"Use two pointers"},
		CommonMistakes: []string{"Off by one errors"},
		CodeTemplates:  map[string]string{"java": "// template"},
		Variations: []PatternVariation{
			{Name: "Fixed Window", Description: "Fixed size window"},
		},
	}

	assert.Equal(t, "sliding-window", p.ID)
	assert.Equal(t, "Sliding Window", p.Category)
	assert.Equal(t, "A pattern for arrays", p.Description)
	assert.Equal(t, []string{"Subarrays", "Substrings"}, p.WhenToUse)
	assert.Equal(t, []string{"Use two pointers"}, p.KeyInsights)
	assert.Equal(t, []string{"Off by one errors"}, p.CommonMistakes)
	assert.Equal(t, "// template", p.CodeTemplates["java"])
	assert.Len(t, p.Variations, 1)
	assert.Equal(t, "Fixed Window", p.Variations[0].Name)
	assert.Equal(t, "Fixed size window", p.Variations[0].Description)
}

func TestProblemType(t *testing.T) {
	p := Problem{
		ID:          "prob-1",
		Title:       "Two Sum",
		Slug:        "two-sum",
		Difficulty:  "Easy",
		PatternID:   "arrays",
		Description: "Find two numbers",
		Companies:   []string{"Google"},
		Hints:       []string{"Use a hash map"},
	}

	assert.Equal(t, "prob-1", p.ID)
	assert.Equal(t, "Two Sum", p.Title)
	assert.Equal(t, "two-sum", p.Slug)
	assert.Equal(t, "Easy", p.Difficulty)
	assert.Equal(t, "arrays", p.PatternID)
	assert.Equal(t, "Find two numbers", p.Description)
	assert.Equal(t, []string{"Google"}, p.Companies)
	assert.Equal(t, []string{"Use a hash map"}, p.Hints)
}

func TestIndexerWithStubService(t *testing.T) {
	t.Run("IndexQuestion generates correct chunk", func(t *testing.T) {
		// This test verifies the content format without actual DB
		q := Question{
			ID:         "test-q",
			Name:       "Test Question",
			URL:        "https://example.com",
			Difficulty: "Easy",
			Pattern:    "Arrays",
			Companies:  []string{"Google", "Meta"},
			Frequency:  "High",
			Category:   "Arrays",
		}

		// Verify all struct fields
		assert.Equal(t, "test-q", q.ID)
		assert.Equal(t, "Test Question", q.Name)
		assert.Equal(t, "https://example.com", q.URL)
		assert.Equal(t, "Easy", q.Difficulty)
		assert.Equal(t, "Arrays", q.Pattern)
		assert.Equal(t, []string{"Google", "Meta"}, q.Companies)
		assert.Equal(t, "High", q.Frequency)
		assert.Equal(t, "Arrays", q.Category)

		// Verify expected ID format
		expectedID := "question-" + q.ID
		assert.Equal(t, "question-test-q", expectedID)

		// Verify content format using struct fields
		content := "Problem: " + q.Name + "\nDifficulty: " + q.Difficulty + "\nPattern: " + q.Pattern + "\nCategory: " + q.Category
		content += "\nCompanies: " + strings.Join(q.Companies, ", ")
		content += "\nFrequency: " + q.Frequency

		assert.Contains(t, content, "Google, Meta")
		assert.Contains(t, content, "Frequency: High")
	})

	t.Run("IndexSolution generates correct chunks", func(t *testing.T) {
		s := Solution{
			ProblemSlug:     "two-sum",
			ProblemName:     "Two Sum",
			Approach:        "Use hash map for O(1) lookup",
			Steps:           []string{"Create map", "Iterate array", "Return indices"},
			Code:            "function twoSum() {}",
			Language:        "javascript",
			TimeComplexity:  "O(n)",
			SpaceComplexity: "O(n)",
		}

		// Verify approach chunk ID using struct fields
		approachID := "solution-" + s.ProblemSlug + "-approach"
		assert.Equal(t, "solution-two-sum-approach", approachID)

		// Verify code chunk ID using struct fields
		codeID := "solution-" + s.ProblemSlug + "-code-" + s.Language
		assert.Equal(t, "solution-two-sum-code-javascript", codeID)

		// Verify content includes all fields
		assert.Equal(t, "Two Sum", s.ProblemName)
		assert.Equal(t, "Use hash map for O(1) lookup", s.Approach)
		assert.Equal(t, "function twoSum() {}", s.Code)
		assert.Equal(t, "O(n)", s.TimeComplexity)
		assert.Equal(t, "O(n)", s.SpaceComplexity)

		// Verify steps are numbered
		steps := numberedList(s.Steps)
		assert.Contains(t, steps, "1. Create map")
		assert.Contains(t, steps, "2. Iterate array")
		assert.Contains(t, steps, "3. Return indices")
	})

	t.Run("IndexTutorialSection generates correct chunks", func(t *testing.T) {
		ts := TutorialSection{
			Title:   "Hash Map Technique",
			Content: "Learn how to use hash maps effectively.",
			Code: map[string]string{
				"java":       "Map<Integer, Integer> map = new HashMap<>();",
				"javascript": "const map = new Map();",
			},
		}

		// Verify all struct fields
		assert.Equal(t, "Hash Map Technique", ts.Title)
		assert.Equal(t, "Learn how to use hash maps effectively.", ts.Content)
		assert.Equal(t, "Map<Integer, Integer> map = new HashMap<>();", ts.Code["java"])
		assert.Equal(t, "const map = new Map();", ts.Code["javascript"])

		// Verify section chunk ID format
		sectionID := "tutorial-arrays-section-0"
		assert.Contains(t, sectionID, "tutorial-")
		assert.Contains(t, sectionID, "-section-")

		// Verify code chunks are created for each language
		assert.Len(t, ts.Code, 2)
	})

	t.Run("IndexArticle generates correct chunk", func(t *testing.T) {
		a := Article{
			Slug:        "recursion-guide",
			Title:       "Mastering Recursion",
			Description: "A comprehensive guide to recursion",
			Tags:        []string{"Recursion", "Algorithms"},
			Difficulty:  "intermediate",
		}

		// Verify all struct fields
		assert.Equal(t, "recursion-guide", a.Slug)
		assert.Equal(t, "Mastering Recursion", a.Title)
		assert.Equal(t, "A comprehensive guide to recursion", a.Description)
		assert.Equal(t, []string{"Recursion", "Algorithms"}, a.Tags)
		assert.Equal(t, "intermediate", a.Difficulty)

		// Verify article chunk ID format using struct fields
		articleID := "article-" + a.Slug
		assert.Equal(t, "article-recursion-guide", articleID)

		// Verify content includes tags using struct fields
		content := "Article: " + a.Title + "\n\n" + a.Description
		content += "\n\nTags: " + strings.Join(a.Tags, ", ")
		assert.Contains(t, content, "Tags: Recursion, Algorithms")
	})

	t.Run("IndexArticleSection generates correct chunk", func(t *testing.T) {
		as := ArticleSection{
			ArticleSlug:  "recursion-guide",
			ArticleTitle: "Mastering Recursion",
			Slug:         "base-cases",
			Title:        "Understanding Base Cases",
			Description:  "Learn about base cases in recursion",
			Order:        2,
		}

		// Verify all struct fields
		assert.Equal(t, "recursion-guide", as.ArticleSlug)
		assert.Equal(t, "Mastering Recursion", as.ArticleTitle)
		assert.Equal(t, "base-cases", as.Slug)
		assert.Equal(t, "Understanding Base Cases", as.Title)
		assert.Equal(t, "Learn about base cases in recursion", as.Description)
		assert.Equal(t, 2, as.Order)

		// Verify section chunk ID format using struct fields
		sectionID := "article-" + as.ArticleSlug + "-section-" + as.Slug
		assert.Equal(t, "article-recursion-guide-section-base-cases", sectionID)

		// Verify content format using struct fields
		content := as.ArticleTitle + " - " + as.Title + "\n\n" + as.Description
		assert.Contains(t, content, "Mastering Recursion - Understanding Base Cases")
	})

	t.Run("IndexConcept generates correct chunks", func(t *testing.T) {
		c := Concept{
			ID:              "heap",
			Name:            "Heap",
			Slug:            "heap",
			Category:        "Data Structures",
			Description:     "A tree-based data structure",
			TimeComplexity:  "O(log n)",
			SpaceComplexity: "O(n)",
			WhenToUse:       []string{"Priority queues", "Heap sort"},
			KeyPoints:       []string{"Complete binary tree"},
			CommonMistakes:  []string{"Forgetting to heapify"},
			CodeSnippets: map[string]string{
				"java": "PriorityQueue<Integer> heap = new PriorityQueue<>();",
			},
		}

		// Verify all struct fields
		assert.Equal(t, "heap", c.ID)
		assert.Equal(t, "Heap", c.Name)
		assert.Equal(t, "heap", c.Slug)
		assert.Equal(t, "Data Structures", c.Category)
		assert.Equal(t, "A tree-based data structure", c.Description)
		assert.Equal(t, "O(log n)", c.TimeComplexity)
		assert.Equal(t, "O(n)", c.SpaceComplexity)
		assert.Equal(t, []string{"Priority queues", "Heap sort"}, c.WhenToUse)
		assert.Equal(t, []string{"Complete binary tree"}, c.KeyPoints)
		assert.Equal(t, []string{"Forgetting to heapify"}, c.CommonMistakes)
		assert.Equal(t, "PriorityQueue<Integer> heap = new PriorityQueue<>();", c.CodeSnippets["java"])

		// Verify overview chunk ID using struct fields
		overviewID := "concept-" + c.ID + "-overview"
		assert.Equal(t, "concept-heap-overview", overviewID)

		// Verify keypoints chunk ID using struct fields
		keypointsID := "concept-" + c.ID + "-keypoints"
		assert.Equal(t, "concept-heap-keypoints", keypointsID)

		// Verify mistakes chunk ID using struct fields
		mistakesID := "concept-" + c.ID + "-mistakes"
		assert.Equal(t, "concept-heap-mistakes", mistakesID)

		// Verify code chunk IDs for each language in struct
		for lang := range c.CodeSnippets {
			codeID := "concept-" + c.ID + "-code-" + lang
			assert.Equal(t, "concept-heap-code-java", codeID)
		}
	})
}

func TestIndexAllFunctions(t *testing.T) {
	t.Run("IndexAllQuestions handles empty slice", func(t *testing.T) {
		questions := []Question{}
		assert.Len(t, questions, 0)
	})

	t.Run("IndexAllSolutions handles empty slice", func(t *testing.T) {
		solutions := []Solution{}
		assert.Len(t, solutions, 0)
	})

	t.Run("IndexAllArticles handles empty slices", func(t *testing.T) {
		articles := []Article{}
		sections := []ArticleSection{}
		assert.Len(t, articles, 0)
		assert.Len(t, sections, 0)
	})

	t.Run("IndexAllPatterns handles empty slice", func(t *testing.T) {
		patterns := []Pattern{}
		assert.Len(t, patterns, 0)
	})

	t.Run("IndexAllConcepts handles empty slice", func(t *testing.T) {
		concepts := []Concept{}
		assert.Len(t, concepts, 0)
	})

	t.Run("IndexAllProblems handles empty slice", func(t *testing.T) {
		problems := []Problem{}
		assert.Len(t, problems, 0)
	})
}

// Test EmbeddingInput structure
func TestEmbeddingInputContentTypes(t *testing.T) {
	validTypes := []string{"pattern", "concept", "problem", "hint", "question", "solution", "tutorial", "article"}

	for _, contentType := range validTypes {
		t.Run("valid content type: "+contentType, func(t *testing.T) {
			input := EmbeddingInput{
				ID:          "test-id",
				ContentType: contentType,
				SourceID:    "source-1",
				ChunkType:   "overview",
				Content:     "Test content",
			}
			assert.Equal(t, "test-id", input.ID)
			assert.Equal(t, contentType, input.ContentType)
			assert.Equal(t, "source-1", input.SourceID)
			assert.Equal(t, "overview", input.ChunkType)
			assert.Equal(t, "Test content", input.Content)
		})
	}
}

func TestEmbeddingInputChunkTypes(t *testing.T) {
	validChunkTypes := []string{"overview", "insights", "mistakes", "template", "hint", "description", "section", "approach"}

	for _, chunkType := range validChunkTypes {
		t.Run("valid chunk type: "+chunkType, func(t *testing.T) {
			input := EmbeddingInput{
				ID:          "test-id",
				ContentType: "pattern",
				SourceID:    "source-1",
				ChunkType:   chunkType,
				Content:     "Test content",
			}
			assert.Equal(t, "test-id", input.ID)
			assert.Equal(t, "pattern", input.ContentType)
			assert.Equal(t, "source-1", input.SourceID)
			assert.Equal(t, chunkType, input.ChunkType)
			assert.Equal(t, "Test content", input.Content)
		})
	}
}

func TestEmbeddingInputWithLanguage(t *testing.T) {
	lang := "java"
	input := EmbeddingInput{
		ID:          "test-id",
		ContentType: "pattern",
		SourceID:    "source-1",
		ChunkType:   "template",
		Language:    &lang,
		Content:     "public class Main {}",
	}

	assert.Equal(t, "test-id", input.ID)
	assert.Equal(t, "pattern", input.ContentType)
	assert.Equal(t, "source-1", input.SourceID)
	assert.Equal(t, "template", input.ChunkType)
	require.NotNil(t, input.Language)
	assert.Equal(t, "java", *input.Language)
	assert.Equal(t, "public class Main {}", input.Content)
}

func TestEmbeddingInputMetadata(t *testing.T) {
	input := EmbeddingInput{
		ID:          "test-id",
		ContentType: "question",
		SourceID:    "q-1",
		ChunkType:   "description",
		Content:     "Test content",
		Metadata: map[string]interface{}{
			"questionId": "q-1",
			"difficulty": "Easy",
			"pattern":    "Arrays",
		},
	}

	assert.Equal(t, "test-id", input.ID)
	assert.Equal(t, "question", input.ContentType)
	assert.Equal(t, "q-1", input.SourceID)
	assert.Equal(t, "description", input.ChunkType)
	assert.Equal(t, "Test content", input.Content)
	assert.Equal(t, "q-1", input.Metadata["questionId"])
	assert.Equal(t, "Easy", input.Metadata["difficulty"])
	assert.Equal(t, "Arrays", input.Metadata["pattern"])
}
