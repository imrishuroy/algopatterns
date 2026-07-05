package main

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestParseStringArray(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected []string
	}{
		{
			name:     "empty string",
			input:    "",
			expected: nil,
		},
		{
			name:     "single item",
			input:    `"Google"`,
			expected: []string{"Google"},
		},
		{
			name:     "multiple items",
			input:    `"Google", "Amazon", "Meta"`,
			expected: []string{"Google", "Amazon", "Meta"},
		},
		{
			name:     "with whitespace",
			input:    `"Google" , "Amazon" , "Meta"`,
			expected: []string{"Google", "Amazon", "Meta"},
		},
		{
			name:     "with newlines",
			input:    "\"Google\",\n      \"Amazon\"",
			expected: []string{"Google", "Amazon"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := parseStringArray(tt.input)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestSlugToName(t *testing.T) {
	tests := []struct {
		name     string
		slug     string
		expected string
	}{
		{
			name:     "single word",
			slug:     "array",
			expected: "Array",
		},
		{
			name:     "two words",
			slug:     "two-sum",
			expected: "Two Sum",
		},
		{
			name:     "multiple words",
			slug:     "product-of-array-except-self",
			expected: "Product Of Array Except Self",
		},
		{
			name:     "empty string",
			slug:     "",
			expected: "",
		},
		{
			name:     "already capitalized",
			slug:     "Two-Sum",
			expected: "Two Sum",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := slugToName(tt.slug)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestParseQuestionsFromTS(t *testing.T) {
	t.Run("empty content", func(t *testing.T) {
		result := parseQuestionsFromTS("")
		assert.Empty(t, result)
	})

	t.Run("no questions array", func(t *testing.T) {
		content := `export const something = [];`
		result := parseQuestionsFromTS(content)
		assert.Empty(t, result)
	})

	t.Run("single question", func(t *testing.T) {
		content := `
export const questions: Question[] = [
  {
    id: "as-1",
    name: "Two Sum",
    url: "https://leetcode.com/problems/two-sum",
    difficulty: "Easy",
    pattern: "Hash Map",
    companies: ["Google", "Amazon"],
    frequency: "High",
    category: "Arrays & Strings",
  },
];`
		result := parseQuestionsFromTS(content)
		assert.Len(t, result, 1)
		assert.Equal(t, "as-1", result[0].ID)
		assert.Equal(t, "Two Sum", result[0].Name)
		assert.Equal(t, "Easy", result[0].Difficulty)
		assert.Equal(t, "Hash Map", result[0].Pattern)
		assert.Equal(t, []string{"Google", "Amazon"}, result[0].Companies)
		assert.Equal(t, "High", result[0].Frequency)
		assert.Equal(t, "Arrays & Strings", result[0].Category)
	})

	t.Run("multiple questions", func(t *testing.T) {
		content := `
export const questions: Question[] = [
  {
    id: "q-1",
    name: "Question One",
    url: "https://example.com/1",
    difficulty: "Easy",
    pattern: "Pattern A",
    companies: ["Company1"],
    frequency: "Low",
    category: "Category A",
  },
  {
    id: "q-2",
    name: "Question Two",
    url: "https://example.com/2",
    difficulty: "Medium",
    pattern: "Pattern B",
    companies: ["Company2", "Company3"],
    frequency: "High",
    category: "Category B",
  },
];`
		result := parseQuestionsFromTS(content)
		assert.Len(t, result, 2)
		assert.Equal(t, "q-1", result[0].ID)
		assert.Equal(t, "q-2", result[1].ID)
	})

	t.Run("question with empty companies", func(t *testing.T) {
		content := `
export const questions: Question[] = [
  {
    id: "q-1",
    name: "Test",
    url: "https://example.com",
    difficulty: "Easy",
    pattern: "Test",
    companies: [],
    frequency: "Low",
    category: "Test",
  },
];`
		result := parseQuestionsFromTS(content)
		assert.Len(t, result, 1)
		assert.Empty(t, result[0].Companies)
	})
}

func TestParseSolutionsFromTS(t *testing.T) {
	t.Run("empty content", func(t *testing.T) {
		result := parseSolutionsFromTS("")
		assert.Empty(t, result)
	})

	t.Run("single solution", func(t *testing.T) {
		content := `
export const solutions: Record<string, Solution> = {
  "two-sum": {
    approach: "Use a hash map to store each number and its index",
    steps: [
      "Create hash map",
      "Iterate through array",
      "Return indices"
    ],
    code: ` + "`" + `class Solution {
    public int[] twoSum(int[] nums, int target) {
        return new int[]{};
    }
}` + "`" + `,
    language: "java",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
  },
};`
		result := parseSolutionsFromTS(content)
		assert.Len(t, result, 1)

		sol, exists := result["two-sum"]
		assert.True(t, exists)
		assert.Equal(t, "Use a hash map to store each number and its index", sol.Approach)
		assert.Equal(t, "java", sol.Language)
		assert.Equal(t, "O(n)", sol.TimeComplexity)
		assert.Equal(t, "O(n)", sol.SpaceComplexity)
		assert.Len(t, sol.Steps, 3)
		assert.NotEmpty(t, sol.Code)
	})

	t.Run("solution without code", func(t *testing.T) {
		content := `
export const solutions: Record<string, Solution> = {
  "simple": {
    approach: "Simple approach",
    steps: ["Step 1"],
    language: "javascript",
    timeComplexity: "O(1)",
    spaceComplexity: "O(1)",
  },
};`
		result := parseSolutionsFromTS(content)
		assert.Len(t, result, 1)

		sol, exists := result["simple"]
		assert.True(t, exists)
		assert.Empty(t, sol.Code)
	})
}

func TestParseConceptsFromTS(t *testing.T) {
	t.Run("empty content", func(t *testing.T) {
		result := parseConceptsFromTS("")
		assert.Empty(t, result)
	})

	t.Run("single concept", func(t *testing.T) {
		content := `
export const concepts: Concept[] = [
  {
    id: "priority-queue",
    name: "Priority Queue",
    slug: "priority-queue",
    category: "Data Structures",
    description: "A queue where elements have priority",
    timeComplexity: "O(log n)",
    spaceComplexity: "O(n)",
    whenToUse: [
      "Finding K largest elements",
      "Task scheduling"
    ],
    codeSnippets: {
      java: ` + "`" + `PriorityQueue<Integer> pq = new PriorityQueue<>();` + "`" + `,
      python: ` + "`" + `import heapq` + "`" + `,
    },
  },
];`
		result := parseConceptsFromTS(content)
		assert.Len(t, result, 1)
		assert.Equal(t, "priority-queue", result[0].ID)
		assert.Equal(t, "Priority Queue", result[0].Name)
		assert.Equal(t, "Data Structures", result[0].Category)
		assert.Equal(t, "O(log n)", result[0].TimeComplexity)
		assert.Equal(t, "O(n)", result[0].SpaceComplexity)
		assert.Len(t, result[0].WhenToUse, 2)
	})

	t.Run("concept without optional fields", func(t *testing.T) {
		content := `
export const concepts: Concept[] = [
  {
    id: "basic",
    name: "Basic Concept",
    slug: "basic",
    category: "Basics",
    description: "A basic concept",
  },
];`
		result := parseConceptsFromTS(content)
		assert.Len(t, result, 1)
		assert.Equal(t, "basic", result[0].ID)
		assert.Empty(t, result[0].TimeComplexity)
		assert.Empty(t, result[0].WhenToUse)
	})
}

func TestQuestionRecordStruct(t *testing.T) {
	q := questionRecord{
		ID:         "test-id",
		Name:       "Test Question",
		URL:        "https://example.com",
		Difficulty: "Medium",
		Pattern:    "Arrays",
		Companies:  []string{"Google", "Meta"},
		Frequency:  "High",
		Category:   "Arrays & Strings",
	}

	assert.Equal(t, "test-id", q.ID)
	assert.Equal(t, "Test Question", q.Name)
	assert.Equal(t, "https://example.com", q.URL)
	assert.Equal(t, "Medium", q.Difficulty)
	assert.Equal(t, "Arrays", q.Pattern)
	assert.Equal(t, []string{"Google", "Meta"}, q.Companies)
	assert.Equal(t, "High", q.Frequency)
	assert.Equal(t, "Arrays & Strings", q.Category)
}

func TestSolutionRecordStruct(t *testing.T) {
	s := solutionRecord{
		Approach:        "Use two pointers",
		Steps:           []string{"Step 1", "Step 2"},
		Code:            "function solve() {}",
		Language:        "javascript",
		TimeComplexity:  "O(n)",
		SpaceComplexity: "O(1)",
	}

	assert.Equal(t, "Use two pointers", s.Approach)
	assert.Equal(t, []string{"Step 1", "Step 2"}, s.Steps)
	assert.Equal(t, "function solve() {}", s.Code)
	assert.Equal(t, "javascript", s.Language)
	assert.Equal(t, "O(n)", s.TimeComplexity)
	assert.Equal(t, "O(1)", s.SpaceComplexity)
}

func TestConceptRecordStruct(t *testing.T) {
	c := conceptRecord{
		ID:              "hash-map",
		Name:            "Hash Map",
		Slug:            "hash-map",
		Category:        "Data Structures",
		Description:     "Key-value store",
		TimeComplexity:  "O(1)",
		SpaceComplexity: "O(n)",
		WhenToUse:       []string{"Fast lookup"},
		CodeSnippets:    map[string]string{"java": "HashMap<K,V> map = new HashMap<>();"},
	}

	assert.Equal(t, "hash-map", c.ID)
	assert.Equal(t, "Hash Map", c.Name)
	assert.Equal(t, "hash-map", c.Slug)
	assert.Equal(t, "Data Structures", c.Category)
	assert.Equal(t, "Key-value store", c.Description)
	assert.Equal(t, "O(1)", c.TimeComplexity)
	assert.Equal(t, "O(n)", c.SpaceComplexity)
	assert.Equal(t, []string{"Fast lookup"}, c.WhenToUse)
	assert.Equal(t, "HashMap<K,V> map = new HashMap<>();", c.CodeSnippets["java"])
}

func TestPatternRecordStruct(t *testing.T) {
	p := patternRecord{
		ID:          "sliding-window",
		Category:    "Sliding Window",
		Difficulty:  "Medium",
		Description: "A technique for arrays",
		WhenToUse:   []string{"Subarrays", "Substrings"},
		CodeTemplates: map[string]string{
			"java": "// template",
		},
		KeyInsights:    []string{"Use two pointers"},
		CommonMistakes: []string{"Off by one"},
		Variations: []variationRecord{
			{Name: "Fixed", Description: "Fixed window"},
		},
		CommonProblems:  []string{"Max sum subarray"},
		TimeComplexity:  "O(n)",
		SpaceComplexity: "O(1)",
		Tutorial: []tutorialSectionRecord{
			{Title: "Intro", Content: "Introduction"},
		},
	}

	assert.Equal(t, "sliding-window", p.ID)
	assert.Equal(t, "Sliding Window", p.Category)
	assert.Equal(t, "Medium", p.Difficulty)
	assert.Equal(t, "A technique for arrays", p.Description)
	assert.Equal(t, []string{"Subarrays", "Substrings"}, p.WhenToUse)
	assert.Equal(t, "// template", p.CodeTemplates["java"])
	assert.Equal(t, []string{"Use two pointers"}, p.KeyInsights)
	assert.Equal(t, []string{"Off by one"}, p.CommonMistakes)
	assert.Len(t, p.Variations, 1)
	assert.Equal(t, "Fixed", p.Variations[0].Name)
	assert.Equal(t, []string{"Max sum subarray"}, p.CommonProblems)
	assert.Equal(t, "O(n)", p.TimeComplexity)
	assert.Equal(t, "O(1)", p.SpaceComplexity)
	assert.Len(t, p.Tutorial, 1)
	assert.Equal(t, "Intro", p.Tutorial[0].Title)
}

func TestVariationRecordStruct(t *testing.T) {
	v := variationRecord{
		Name:        "Fixed Window",
		Description: "Fixed size window",
		When:        "When window size is known",
		Template: map[string]string{
			"java": "// fixed window template",
		},
		Problems: []string{"Max Average Subarray"},
	}

	assert.Equal(t, "Fixed Window", v.Name)
	assert.Equal(t, "Fixed size window", v.Description)
	assert.Equal(t, "When window size is known", v.When)
	assert.Equal(t, "// fixed window template", v.Template["java"])
	assert.Equal(t, []string{"Max Average Subarray"}, v.Problems)
}

func TestTutorialSectionRecordStruct(t *testing.T) {
	ts := tutorialSectionRecord{
		Title:   "Getting Started",
		Content: "Learn the basics",
		Code: map[string]string{
			"java":       "public class Main {}",
			"javascript": "function main() {}",
		},
	}

	assert.Equal(t, "Getting Started", ts.Title)
	assert.Equal(t, "Learn the basics", ts.Content)
	assert.Equal(t, "public class Main {}", ts.Code["java"])
	assert.Equal(t, "function main() {}", ts.Code["javascript"])
}

func TestArticleMetaStruct(t *testing.T) {
	a := articleMeta{
		Title:       "Recursion Guide",
		Slug:        "recursion",
		Description: "Learn recursion",
		Difficulty:  "intermediate",
		Tags:        []string{"Recursion", "Algorithms"},
		Sections: []articleSection{
			{Slug: "intro", Title: "Introduction", Description: "Intro", Order: 1},
		},
	}

	assert.Equal(t, "Recursion Guide", a.Title)
	assert.Equal(t, "recursion", a.Slug)
	assert.Equal(t, "Learn recursion", a.Description)
	assert.Equal(t, "intermediate", a.Difficulty)
	assert.Equal(t, []string{"Recursion", "Algorithms"}, a.Tags)
	assert.Len(t, a.Sections, 1)
	assert.Equal(t, "intro", a.Sections[0].Slug)
}

func TestArticleSectionStruct(t *testing.T) {
	s := articleSection{
		Slug:        "fundamentals",
		Title:       "Fundamentals",
		Description: "Basic concepts",
		Order:       1,
	}

	assert.Equal(t, "fundamentals", s.Slug)
	assert.Equal(t, "Fundamentals", s.Title)
	assert.Equal(t, "Basic concepts", s.Description)
	assert.Equal(t, 1, s.Order)
}
