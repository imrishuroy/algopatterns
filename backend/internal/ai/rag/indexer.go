package rag

import (
	"context"
	"fmt"
	"strings"

	"github.com/rs/zerolog/log"
)

// Indexer handles indexing content for RAG
type Indexer struct {
	rag *Service
}

// NewIndexer creates a new content indexer
func NewIndexer(rag *Service) *Indexer {
	return &Indexer{rag: rag}
}

// Pattern represents a DSA pattern to be indexed
type Pattern struct {
	ID             string
	Category       string
	Description    string
	WhenToUse      []string
	KeyInsights    []string
	CommonMistakes []string
	CodeTemplates  map[string]string
	Variations     []PatternVariation
}

// PatternVariation represents a pattern variation
type PatternVariation struct {
	Name        string
	Description string
}

// IndexPattern creates embeddings for all chunks of a pattern
func (i *Indexer) IndexPattern(ctx context.Context, p Pattern) error {
	chunks := []EmbeddingInput{
		{
			ID:          fmt.Sprintf("pattern-%s-overview", p.ID),
			ContentType: "pattern",
			SourceID:    p.ID,
			ChunkType:   "overview",
			Content: fmt.Sprintf("Pattern: %s\n\n%s\n\nWhen to use:\n%s",
				p.Category, p.Description, joinList(p.WhenToUse)),
			Metadata: map[string]interface{}{
				"patternId": p.ID,
				"category":  p.Category,
			},
		},
	}

	if len(p.KeyInsights) > 0 {
		chunks = append(chunks, EmbeddingInput{
			ID:          fmt.Sprintf("pattern-%s-insights", p.ID),
			ContentType: "pattern",
			SourceID:    p.ID,
			ChunkType:   "insights",
			Content: fmt.Sprintf("Key insights for %s:\n\n%s",
				p.Category, numberedList(p.KeyInsights)),
			Metadata: map[string]interface{}{
				"patternId": p.ID,
			},
		})
	}

	if len(p.CommonMistakes) > 0 {
		chunks = append(chunks, EmbeddingInput{
			ID:          fmt.Sprintf("pattern-%s-mistakes", p.ID),
			ContentType: "pattern",
			SourceID:    p.ID,
			ChunkType:   "mistakes",
			Content: fmt.Sprintf("Common mistakes in %s:\n\n%s",
				p.Category, numberedList(p.CommonMistakes)),
			Metadata: map[string]interface{}{
				"patternId": p.ID,
			},
		})
	}

	for lang, template := range p.CodeTemplates {
		langStr := lang
		chunks = append(chunks, EmbeddingInput{
			ID:          fmt.Sprintf("pattern-%s-template-%s", p.ID, lang),
			ContentType: "pattern",
			SourceID:    p.ID,
			ChunkType:   "template",
			Language:    &langStr,
			Content: fmt.Sprintf("%s code template for %s:\n\n```%s\n%s\n```",
				lang, p.Category, lang, template),
			Metadata: map[string]interface{}{
				"patternId": p.ID,
				"language":  lang,
			},
		})
	}

	for idx, v := range p.Variations {
		chunks = append(chunks, EmbeddingInput{
			ID:          fmt.Sprintf("pattern-%s-variation-%d", p.ID, idx),
			ContentType: "pattern",
			SourceID:    p.ID,
			ChunkType:   "overview",
			Content: fmt.Sprintf("Variation of %s: %s\n\n%s",
				p.Category, v.Name, v.Description),
			Metadata: map[string]interface{}{
				"patternId":     p.ID,
				"variationName": v.Name,
			},
		})
	}

	for _, chunk := range chunks {
		if err := i.rag.UpsertEmbedding(ctx, chunk); err != nil {
			return fmt.Errorf("failed to index chunk %s: %w", chunk.ID, err)
		}
	}

	log.Info().Str("patternId", p.ID).Int("chunks", len(chunks)).Msg("Indexed pattern")
	return nil
}

// Concept represents a DSA concept to be indexed
type Concept struct {
	ID              string
	Name            string
	Slug            string
	Category        string
	Description     string
	Explanation     string
	TimeComplexity  string
	SpaceComplexity string
	WhenToUse       []string
	KeyPoints       []string
	CommonMistakes  []string
	CodeSnippets    map[string]string
}

// IndexConcept creates embeddings for a DSA concept
func (i *Indexer) IndexConcept(ctx context.Context, c Concept) error {
	// Build overview content
	overviewContent := fmt.Sprintf("DSA Concept: %s\nCategory: %s\n\n%s",
		c.Name, c.Category, c.Description)

	if c.Explanation != "" {
		overviewContent += "\n\n" + c.Explanation
	}

	if c.TimeComplexity != "" || c.SpaceComplexity != "" {
		overviewContent += fmt.Sprintf("\n\nTime Complexity: %s\nSpace Complexity: %s",
			c.TimeComplexity, c.SpaceComplexity)
	}

	if len(c.WhenToUse) > 0 {
		overviewContent += "\n\nWhen to use:\n" + joinList(c.WhenToUse)
	}

	chunks := []EmbeddingInput{
		{
			ID:          fmt.Sprintf("concept-%s-overview", c.ID),
			ContentType: "concept",
			SourceID:    c.ID,
			ChunkType:   "overview",
			Content:     overviewContent,
			Metadata: map[string]interface{}{
				"conceptId": c.ID,
				"slug":      c.Slug,
				"category":  c.Category,
			},
		},
	}

	if len(c.KeyPoints) > 0 {
		chunks = append(chunks, EmbeddingInput{
			ID:          fmt.Sprintf("concept-%s-keypoints", c.ID),
			ContentType: "concept",
			SourceID:    c.ID,
			ChunkType:   "insights",
			Content: fmt.Sprintf("Key points for %s:\n\n%s",
				c.Name, numberedList(c.KeyPoints)),
			Metadata: map[string]interface{}{
				"conceptId": c.ID,
			},
		})
	}

	if len(c.CommonMistakes) > 0 {
		chunks = append(chunks, EmbeddingInput{
			ID:          fmt.Sprintf("concept-%s-mistakes", c.ID),
			ContentType: "concept",
			SourceID:    c.ID,
			ChunkType:   "mistakes",
			Content: fmt.Sprintf("Common mistakes with %s:\n\n%s",
				c.Name, numberedList(c.CommonMistakes)),
			Metadata: map[string]interface{}{
				"conceptId": c.ID,
			},
		})
	}

	for lang, code := range c.CodeSnippets {
		langStr := lang
		chunks = append(chunks, EmbeddingInput{
			ID:          fmt.Sprintf("concept-%s-code-%s", c.ID, lang),
			ContentType: "concept",
			SourceID:    c.ID,
			ChunkType:   "template",
			Language:    &langStr,
			Content: fmt.Sprintf("%s implementation of %s:\n\n```%s\n%s\n```",
				lang, c.Name, lang, code),
			Metadata: map[string]interface{}{
				"conceptId": c.ID,
				"language":  lang,
			},
		})
	}

	for _, chunk := range chunks {
		if err := i.rag.UpsertEmbedding(ctx, chunk); err != nil {
			return fmt.Errorf("failed to index chunk %s: %w", chunk.ID, err)
		}
	}

	log.Info().Str("conceptId", c.ID).Int("chunks", len(chunks)).Msg("Indexed concept")
	return nil
}

// Problem represents a coding problem to be indexed
type Problem struct {
	ID          string
	Title       string
	Slug        string
	Difficulty  string
	PatternID   string
	Description string
	Companies   []string
	Hints       []string
}

// IndexProblem creates embeddings for a coding problem
func (i *Indexer) IndexProblem(ctx context.Context, p Problem) error {
	chunks := []EmbeddingInput{
		{
			ID:          fmt.Sprintf("problem-%s-meta", p.ID),
			ContentType: "problem",
			SourceID:    p.ID,
			ChunkType:   "description",
			Content: fmt.Sprintf("Problem: %s\nDifficulty: %s\nPattern: %s\nCompanies: %s\n\n%s",
				p.Title, p.Difficulty, p.PatternID, strings.Join(p.Companies, ", "), p.Description),
			Metadata: map[string]interface{}{
				"problemId":  p.ID,
				"slug":       p.Slug,
				"difficulty": p.Difficulty,
				"patternId":  p.PatternID,
			},
		},
	}

	if len(p.Hints) > 0 {
		chunks = append(chunks, EmbeddingInput{
			ID:          fmt.Sprintf("problem-%s-hints", p.ID),
			ContentType: "problem",
			SourceID:    p.ID,
			ChunkType:   "hint",
			Content: fmt.Sprintf("Hints for %s:\n\n%s",
				p.Title, numberedList(p.Hints)),
			Metadata: map[string]interface{}{
				"problemId": p.ID,
			},
		})
	}

	for _, chunk := range chunks {
		if err := i.rag.UpsertEmbedding(ctx, chunk); err != nil {
			return fmt.Errorf("failed to index chunk %s: %w", chunk.ID, err)
		}
	}

	log.Info().Str("problemId", p.ID).Int("chunks", len(chunks)).Msg("Indexed problem")
	return nil
}

// IndexAllPatterns indexes multiple patterns
func (i *Indexer) IndexAllPatterns(ctx context.Context, patterns []Pattern) error {
	for _, p := range patterns {
		if err := i.IndexPattern(ctx, p); err != nil {
			return err
		}
	}
	log.Info().Int("count", len(patterns)).Msg("Indexed all patterns")
	return nil
}

// IndexAllConcepts indexes multiple concepts
func (i *Indexer) IndexAllConcepts(ctx context.Context, concepts []Concept) error {
	for _, c := range concepts {
		if err := i.IndexConcept(ctx, c); err != nil {
			return err
		}
	}
	log.Info().Int("count", len(concepts)).Msg("Indexed all concepts")
	return nil
}

// IndexAllProblems indexes multiple problems
func (i *Indexer) IndexAllProblems(ctx context.Context, problems []Problem) error {
	for _, p := range problems {
		if err := i.IndexProblem(ctx, p); err != nil {
			return err
		}
	}
	log.Info().Int("count", len(problems)).Msg("Indexed all problems")
	return nil
}

// Question represents a LeetCode-style question to be indexed
type Question struct {
	ID         string
	Name       string
	URL        string
	Difficulty string
	Pattern    string
	Companies  []string
	Frequency  string
	Category   string
}

// IndexQuestion creates embeddings for a coding question
func (i *Indexer) IndexQuestion(ctx context.Context, q Question) error {
	content := fmt.Sprintf("Problem: %s\nDifficulty: %s\nPattern: %s\nCategory: %s",
		q.Name, q.Difficulty, q.Pattern, q.Category)

	if len(q.Companies) > 0 {
		content += fmt.Sprintf("\nCompanies: %s", strings.Join(q.Companies, ", "))
	}

	if q.Frequency != "" {
		content += fmt.Sprintf("\nFrequency: %s", q.Frequency)
	}

	chunk := EmbeddingInput{
		ID:          fmt.Sprintf("question-%s", q.ID),
		ContentType: "question",
		SourceID:    q.ID,
		ChunkType:   "description",
		Content:     content,
		Metadata: map[string]interface{}{
			"questionId": q.ID,
			"name":       q.Name,
			"url":        q.URL,
			"difficulty": q.Difficulty,
			"pattern":    q.Pattern,
			"category":   q.Category,
		},
	}

	if err := i.rag.UpsertEmbedding(ctx, chunk); err != nil {
		return fmt.Errorf("failed to index question %s: %w", q.ID, err)
	}

	log.Info().Str("questionId", q.ID).Msg("Indexed question")
	return nil
}

// IndexAllQuestions indexes multiple questions
func (i *Indexer) IndexAllQuestions(ctx context.Context, questions []Question) error {
	for _, q := range questions {
		if err := i.IndexQuestion(ctx, q); err != nil {
			return err
		}
	}
	log.Info().Int("count", len(questions)).Msg("Indexed all questions")
	return nil
}

// Solution represents a problem solution to be indexed
type Solution struct {
	ProblemSlug     string
	ProblemName     string
	Approach        string
	Steps           []string
	Code            string
	Language        string
	TimeComplexity  string
	SpaceComplexity string
}

// IndexSolution creates embeddings for a problem solution
func (i *Indexer) IndexSolution(ctx context.Context, s Solution) error {
	// Build solution content
	content := fmt.Sprintf("Solution for %s\n\nApproach: %s", s.ProblemName, s.Approach)

	if len(s.Steps) > 0 {
		content += "\n\nSteps:\n" + numberedList(s.Steps)
	}

	content += fmt.Sprintf("\n\nTime Complexity: %s\nSpace Complexity: %s",
		s.TimeComplexity, s.SpaceComplexity)

	chunks := []EmbeddingInput{
		{
			ID:          fmt.Sprintf("solution-%s-approach", s.ProblemSlug),
			ContentType: "solution",
			SourceID:    s.ProblemSlug,
			ChunkType:   "approach",
			Content:     content,
			Metadata: map[string]interface{}{
				"problemSlug":     s.ProblemSlug,
				"problemName":     s.ProblemName,
				"timeComplexity":  s.TimeComplexity,
				"spaceComplexity": s.SpaceComplexity,
			},
		},
	}

	if s.Code != "" {
		langStr := s.Language
		chunks = append(chunks, EmbeddingInput{
			ID:          fmt.Sprintf("solution-%s-code-%s", s.ProblemSlug, s.Language),
			ContentType: "solution",
			SourceID:    s.ProblemSlug,
			ChunkType:   "template",
			Language:    &langStr,
			Content: fmt.Sprintf("Solution code for %s (%s):\n\n```%s\n%s\n```",
				s.ProblemName, s.Language, s.Language, s.Code),
			Metadata: map[string]interface{}{
				"problemSlug": s.ProblemSlug,
				"language":    s.Language,
			},
		})
	}

	for _, chunk := range chunks {
		if err := i.rag.UpsertEmbedding(ctx, chunk); err != nil {
			return fmt.Errorf("failed to index chunk %s: %w", chunk.ID, err)
		}
	}

	log.Info().Str("problemSlug", s.ProblemSlug).Int("chunks", len(chunks)).Msg("Indexed solution")
	return nil
}

// IndexAllSolutions indexes multiple solutions
func (i *Indexer) IndexAllSolutions(ctx context.Context, solutions []Solution) error {
	for _, s := range solutions {
		if err := i.IndexSolution(ctx, s); err != nil {
			return err
		}
	}
	log.Info().Int("count", len(solutions)).Msg("Indexed all solutions")
	return nil
}

// TutorialSection represents a tutorial section within a pattern
type TutorialSection struct {
	Title   string
	Content string
	Code    map[string]string
}

// IndexTutorialSection creates embeddings for a tutorial section
func (i *Indexer) IndexTutorialSection(ctx context.Context, patternID string, sectionIdx int, t TutorialSection) error {
	chunks := []EmbeddingInput{
		{
			ID:          fmt.Sprintf("tutorial-%s-section-%d", patternID, sectionIdx),
			ContentType: "tutorial",
			SourceID:    patternID,
			ChunkType:   "section",
			Content: fmt.Sprintf("Tutorial: %s\n\n%s",
				t.Title, t.Content),
			Metadata: map[string]interface{}{
				"patternId":    patternID,
				"sectionIndex": sectionIdx,
				"sectionTitle": t.Title,
			},
		},
	}

	for lang, code := range t.Code {
		langStr := lang
		chunks = append(chunks, EmbeddingInput{
			ID:          fmt.Sprintf("tutorial-%s-section-%d-code-%s", patternID, sectionIdx, lang),
			ContentType: "tutorial",
			SourceID:    patternID,
			ChunkType:   "template",
			Language:    &langStr,
			Content: fmt.Sprintf("Code example for %s (%s):\n\n```%s\n%s\n```",
				t.Title, lang, lang, code),
			Metadata: map[string]interface{}{
				"patternId":    patternID,
				"sectionIndex": sectionIdx,
				"language":     lang,
			},
		})
	}

	for _, chunk := range chunks {
		if err := i.rag.UpsertEmbedding(ctx, chunk); err != nil {
			return fmt.Errorf("failed to index chunk %s: %w", chunk.ID, err)
		}
	}

	return nil
}

// Article represents an educational article to be indexed
type Article struct {
	Slug        string
	Title       string
	Description string
	Tags        []string
	Difficulty  string
}

// ArticleSection represents a section within an article
type ArticleSection struct {
	ArticleSlug  string
	ArticleTitle string
	Slug         string
	Title        string
	Description  string
	Order        int
}

// IndexArticle creates embeddings for an article
func (i *Indexer) IndexArticle(ctx context.Context, a Article) error {
	content := fmt.Sprintf("Article: %s\n\n%s", a.Title, a.Description)

	if len(a.Tags) > 0 {
		content += fmt.Sprintf("\n\nTags: %s", strings.Join(a.Tags, ", "))
	}

	if a.Difficulty != "" {
		content += fmt.Sprintf("\nDifficulty: %s", a.Difficulty)
	}

	chunk := EmbeddingInput{
		ID:          fmt.Sprintf("article-%s", a.Slug),
		ContentType: "article",
		SourceID:    a.Slug,
		ChunkType:   "overview",
		Content:     content,
		Metadata: map[string]interface{}{
			"articleSlug": a.Slug,
			"title":       a.Title,
			"difficulty":  a.Difficulty,
		},
	}

	if err := i.rag.UpsertEmbedding(ctx, chunk); err != nil {
		return fmt.Errorf("failed to index article %s: %w", a.Slug, err)
	}

	log.Info().Str("articleSlug", a.Slug).Msg("Indexed article")
	return nil
}

// IndexArticleSection creates embeddings for an article section
func (i *Indexer) IndexArticleSection(ctx context.Context, s ArticleSection) error {
	content := fmt.Sprintf("%s - %s\n\n%s",
		s.ArticleTitle, s.Title, s.Description)

	chunk := EmbeddingInput{
		ID:          fmt.Sprintf("article-%s-section-%s", s.ArticleSlug, s.Slug),
		ContentType: "article",
		SourceID:    s.ArticleSlug,
		ChunkType:   "section",
		Content:     content,
		Metadata: map[string]interface{}{
			"articleSlug":  s.ArticleSlug,
			"sectionSlug":  s.Slug,
			"sectionTitle": s.Title,
			"order":        s.Order,
		},
	}

	if err := i.rag.UpsertEmbedding(ctx, chunk); err != nil {
		return fmt.Errorf("failed to index article section %s/%s: %w", s.ArticleSlug, s.Slug, err)
	}

	log.Info().Str("articleSlug", s.ArticleSlug).Str("sectionSlug", s.Slug).Msg("Indexed article section")
	return nil
}

// IndexAllArticles indexes multiple articles and their sections
func (i *Indexer) IndexAllArticles(ctx context.Context, articles []Article, sections []ArticleSection) error {
	for _, a := range articles {
		if err := i.IndexArticle(ctx, a); err != nil {
			return err
		}
	}

	for _, s := range sections {
		if err := i.IndexArticleSection(ctx, s); err != nil {
			return err
		}
	}

	log.Info().Int("articles", len(articles)).Int("sections", len(sections)).Msg("Indexed all articles")
	return nil
}

func joinList(items []string) string {
	return strings.Join(items, "\n- ")
}

func numberedList(items []string) string {
	var sb strings.Builder
	for i, item := range items {
		sb.WriteString(fmt.Sprintf("%d. %s\n", i+1, item))
	}
	return sb.String()
}
