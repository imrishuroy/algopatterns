package main

import (
	"context"
	"encoding/json"
	"flag"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"github.com/imrishuroy/algopatterns/internal/ai/rag"
	"github.com/imrishuroy/algopatterns/internal/config"
	"github.com/imrishuroy/algopatterns/internal/repository"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

// Default path to frontend sources (relative to backend directory)
const defaultFrontendPath = "../frontend/src"

func main() {
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})

	indexType := flag.String("type", "all", "Type to index: problems, patterns, questions, solutions, concepts, articles, all")
	frontendPath := flag.String("frontend", defaultFrontendPath, "Path to frontend/src directory")
	flag.Parse()

	cfg, err := config.Load()
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to load config")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Minute)
	defer cancel()

	db, err := repository.NewDatabase(&cfg.Database)
	if err != nil {
		log.Error().Err(err).Msg("Failed to connect to database")
		return
	}
	defer db.Close()

	if cfg.AI.OpenAIAPIKey == "" {
		log.Error().Msg("OPENAI_API_KEY is required for RAG indexing")
		return
	}

	embeddingProvider := rag.NewOpenAIEmbedding(rag.OpenAIEmbeddingConfig{
		APIKey:     cfg.AI.OpenAIAPIKey,
		Model:      "text-embedding-3-small",
		Dimensions: 1536,
		Timeout:    30 * time.Second,
	})

	ragService := rag.NewService(db.Pool, embeddingProvider)
	indexer := rag.NewIndexer(ragService)

	switch *indexType {
	case "problems":
		if err := indexProblems(ctx, db, indexer); err != nil {
			log.Error().Err(err).Msg("Failed to index problems")
			return
		}
	case "patterns":
		if err := indexPatterns(ctx, indexer, *frontendPath); err != nil {
			log.Error().Err(err).Msg("Failed to index patterns")
			return
		}
	case "questions":
		if err := indexQuestions(ctx, indexer, *frontendPath); err != nil {
			log.Error().Err(err).Msg("Failed to index questions")
			return
		}
	case "solutions":
		if err := indexSolutions(ctx, indexer, *frontendPath); err != nil {
			log.Error().Err(err).Msg("Failed to index solutions")
			return
		}
	case "concepts":
		if err := indexConcepts(ctx, indexer, *frontendPath); err != nil {
			log.Error().Err(err).Msg("Failed to index concepts")
			return
		}
	case "articles":
		if err := indexArticles(ctx, indexer, *frontendPath); err != nil {
			log.Error().Err(err).Msg("Failed to index articles")
			return
		}
	case "all":
		log.Info().Msg("Indexing all content types...")

		if err := indexProblems(ctx, db, indexer); err != nil {
			log.Error().Err(err).Msg("Failed to index problems")
		}
		if err := indexPatterns(ctx, indexer, *frontendPath); err != nil {
			log.Error().Err(err).Msg("Failed to index patterns")
		}
		if err := indexQuestions(ctx, indexer, *frontendPath); err != nil {
			log.Error().Err(err).Msg("Failed to index questions")
		}
		if err := indexSolutions(ctx, indexer, *frontendPath); err != nil {
			log.Error().Err(err).Msg("Failed to index solutions")
		}
		if err := indexConcepts(ctx, indexer, *frontendPath); err != nil {
			log.Error().Err(err).Msg("Failed to index concepts")
		}
		if err := indexArticles(ctx, indexer, *frontendPath); err != nil {
			log.Error().Err(err).Msg("Failed to index articles")
		}
	default:
		log.Error().Str("type", *indexType).Msg("Unknown index type")
		return
	}

	count, err := ragService.GetEmbeddingCount(ctx)
	if err != nil {
		log.Error().Err(err).Msg("Failed to get embedding count")
	} else {
		log.Info().Int("total_embeddings", count).Msg("Indexing complete")
	}

	countByType, err := ragService.GetEmbeddingCountByType(ctx)
	if err != nil {
		log.Error().Err(err).Msg("Failed to get counts by type")
	} else {
		for t, c := range countByType {
			log.Info().Str("type", t).Int("count", c).Msg("Embeddings by type")
		}
	}
}

func indexProblems(ctx context.Context, db *repository.Database, indexer *rag.Indexer) error {
	log.Info().Msg("Fetching problems from database...")

	rows, err := db.Pool.Query(ctx, `
		SELECT
			id,
			title,
			slug,
			difficulty,
			COALESCE(description, ''),
			COALESCE(hints, ''),
			COALESCE(pattern_id, '')
		FROM problems
		ORDER BY id
	`)
	if err != nil {
		return err
	}
	defer rows.Close()

	var problems []rag.Problem
	for rows.Next() {
		var p rag.Problem
		var hintsStr string
		if err := rows.Scan(&p.ID, &p.Title, &p.Slug, &p.Difficulty, &p.Description, &hintsStr, &p.PatternID); err != nil {
			return err
		}

		if hintsStr != "" {
			p.Hints = parseHints(hintsStr)
		}

		problems = append(problems, p)
	}

	log.Info().Int("count", len(problems)).Msg("Found problems to index")

	for i, p := range problems {
		log.Info().Int("progress", i+1).Int("total", len(problems)).Str("title", p.Title).Msg("Indexing problem")
		if err := indexer.IndexProblem(ctx, p); err != nil {
			log.Error().Err(err).Str("problemId", p.ID).Msg("Failed to index problem, continuing...")
		}
		time.Sleep(100 * time.Millisecond)
	}

	return nil
}

func parseHints(hintsStr string) []string {
	parts := strings.Split(hintsStr, "Hint ")
	var hints []string
	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part == "" {
			continue
		}
		if idx := strings.Index(part, ":"); idx > 0 {
			hint := strings.TrimSpace(part[idx+1:])
			if hint != "" {
				hints = append(hints, hint)
			}
		} else if part != "" {
			hints = append(hints, part)
		}
	}
	return hints
}

// Pattern data structures for frontend patterns.json
type patternRecord struct {
	ID              string                  `json:"id"`
	Category        string                  `json:"category"`
	Difficulty      string                  `json:"difficulty"`
	Description     string                  `json:"description"`
	WhenToUse       []string                `json:"whenToUse"`
	CodeTemplates   map[string]string       `json:"codeTemplates"`
	KeyInsights     []string                `json:"keyInsights"`
	CommonMistakes  []string                `json:"commonMistakes"`
	Variations      []variationRecord       `json:"variations"`
	CommonProblems  []string                `json:"commonProblems"`
	TimeComplexity  string                  `json:"timeComplexity"`
	SpaceComplexity string                  `json:"spaceComplexity"`
	Tutorial        []tutorialSectionRecord `json:"tutorial"`
}

type variationRecord struct {
	Name        string            `json:"name"`
	Description string            `json:"desc"`
	When        string            `json:"when"`
	Template    map[string]string `json:"template"`
	Problems    []string          `json:"problems"`
}

type tutorialSectionRecord struct {
	Title   string            `json:"title"`
	Content string            `json:"content"`
	Code    map[string]string `json:"code"`
}

func indexPatterns(ctx context.Context, indexer *rag.Indexer, frontendPath string) error {
	patternsPath := filepath.Join(frontendPath, "lib", "patterns.json")
	log.Info().Str("path", patternsPath).Msg("Loading patterns from frontend...")

	data, err := os.ReadFile(patternsPath)
	if err != nil {
		return err
	}

	var patterns []patternRecord
	if err := json.Unmarshal(data, &patterns); err != nil {
		return err
	}

	log.Info().Int("count", len(patterns)).Msg("Found patterns to index")

	for i, pr := range patterns {
		log.Info().Int("progress", i+1).Int("total", len(patterns)).Str("id", pr.ID).Msg("Indexing pattern")

		p := rag.Pattern{
			ID:             pr.ID,
			Category:       pr.Category,
			Description:    pr.Description,
			WhenToUse:      pr.WhenToUse,
			KeyInsights:    pr.KeyInsights,
			CommonMistakes: pr.CommonMistakes,
			CodeTemplates:  pr.CodeTemplates,
		}

		for _, vr := range pr.Variations {
			when := vr.When
			if when == "" {
				when = "Various scenarios"
			}
			p.Variations = append(p.Variations, rag.PatternVariation{
				Name:        vr.Name,
				Description: vr.Description + "\nWhen to use: " + when,
			})
		}

		if err := indexer.IndexPattern(ctx, p); err != nil {
			log.Error().Err(err).Str("patternId", pr.ID).Msg("Failed to index pattern, continuing...")
		}

		// Index tutorial sections
		for sectionIdx, ts := range pr.Tutorial {
			if ts.Content == "" {
				continue
			}

			tutorialSection := rag.TutorialSection{
				Title:   ts.Title,
				Content: ts.Content,
				Code:    ts.Code,
			}

			if err := indexer.IndexTutorialSection(ctx, pr.ID, sectionIdx, tutorialSection); err != nil {
				log.Error().Err(err).Str("patternId", pr.ID).Int("section", sectionIdx).Msg("Failed to index tutorial section, continuing...")
			}
		}

		time.Sleep(100 * time.Millisecond)
	}

	return nil
}

// Question data structure matching frontend questions.ts
type questionRecord struct {
	ID         string   `json:"id"`
	Name       string   `json:"name"`
	URL        string   `json:"url"`
	Difficulty string   `json:"difficulty"`
	Pattern    string   `json:"pattern"`
	Companies  []string `json:"companies"`
	Frequency  string   `json:"frequency"`
	Category   string   `json:"category"`
}

func indexQuestions(ctx context.Context, indexer *rag.Indexer, frontendPath string) error {
	questionsPath := filepath.Join(frontendPath, "lib", "questions.ts")
	log.Info().Str("path", questionsPath).Msg("Loading questions from frontend...")

	data, err := os.ReadFile(questionsPath)
	if err != nil {
		return err
	}

	questions := parseQuestionsFromTS(string(data))
	log.Info().Int("count", len(questions)).Msg("Found questions to index")

	for i, q := range questions {
		if i > 0 && i%50 == 0 {
			log.Info().Int("progress", i).Int("total", len(questions)).Msg("Indexing questions...")
		}

		ragQuestion := rag.Question{
			ID:         q.ID,
			Name:       q.Name,
			URL:        q.URL,
			Difficulty: q.Difficulty,
			Pattern:    q.Pattern,
			Companies:  q.Companies,
			Frequency:  q.Frequency,
			Category:   q.Category,
		}

		if err := indexer.IndexQuestion(ctx, ragQuestion); err != nil {
			log.Error().Err(err).Str("questionId", q.ID).Msg("Failed to index question, continuing...")
		}
		time.Sleep(50 * time.Millisecond)
	}

	return nil
}

// parseQuestionsFromTS extracts question data from TypeScript file
func parseQuestionsFromTS(content string) []questionRecord {
	var questions []questionRecord

	// Find the array content
	startIdx := strings.Index(content, "export const questions: Question[] = [")
	if startIdx == -1 {
		log.Warn().Msg("Could not find questions array in file")
		return questions
	}

	// Extract individual question objects using regex
	questionRegex := regexp.MustCompile(`\{\s*id:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*url:\s*"([^"]+)",\s*difficulty:\s*"([^"]+)",\s*pattern:\s*"([^"]+)",\s*companies:\s*\[([^\]]*)\],\s*frequency:\s*"([^"]+)",\s*category:\s*"([^"]+)",?\s*\}`)

	matches := questionRegex.FindAllStringSubmatch(content, -1)
	for _, match := range matches {
		if len(match) >= 9 {
			companies := parseStringArray(match[6])
			questions = append(questions, questionRecord{
				ID:         match[1],
				Name:       match[2],
				URL:        match[3],
				Difficulty: match[4],
				Pattern:    match[5],
				Companies:  companies,
				Frequency:  match[7],
				Category:   match[8],
			})
		}
	}

	return questions
}

// parseStringArray extracts strings from a TS array literal
func parseStringArray(content string) []string {
	var result []string
	stringRegex := regexp.MustCompile(`"([^"]+)"`)
	matches := stringRegex.FindAllStringSubmatch(content, -1)
	for _, match := range matches {
		if len(match) >= 2 {
			result = append(result, match[1])
		}
	}
	return result
}

// Solution data structure matching frontend solutions.ts
type solutionRecord struct {
	Approach        string   `json:"approach"`
	Steps           []string `json:"steps"`
	Code            string   `json:"code"`
	Language        string   `json:"language"`
	TimeComplexity  string   `json:"timeComplexity"`
	SpaceComplexity string   `json:"spaceComplexity"`
}

func indexSolutions(ctx context.Context, indexer *rag.Indexer, frontendPath string) error {
	solutionsPath := filepath.Join(frontendPath, "lib", "solutions.ts")
	log.Info().Str("path", solutionsPath).Msg("Loading solutions from frontend...")

	data, err := os.ReadFile(solutionsPath)
	if err != nil {
		return err
	}

	solutions := parseSolutionsFromTS(string(data))
	log.Info().Int("count", len(solutions)).Msg("Found solutions to index")

	for slug, sol := range solutions {
		ragSolution := rag.Solution{
			ProblemSlug:     slug,
			ProblemName:     slugToName(slug),
			Approach:        sol.Approach,
			Steps:           sol.Steps,
			Code:            sol.Code,
			Language:        sol.Language,
			TimeComplexity:  sol.TimeComplexity,
			SpaceComplexity: sol.SpaceComplexity,
		}

		if err := indexer.IndexSolution(ctx, ragSolution); err != nil {
			log.Error().Err(err).Str("slug", slug).Msg("Failed to index solution, continuing...")
		}
		time.Sleep(100 * time.Millisecond)
	}

	return nil
}

// parseSolutionsFromTS extracts solution data from TypeScript file
func parseSolutionsFromTS(content string) map[string]solutionRecord {
	solutions := make(map[string]solutionRecord)

	// Find solution entries: "slug-name": { ... }
	solutionRegex := regexp.MustCompile(`"([a-z0-9-]+)":\s*\{\s*approach:\s*"([^"]+)"`)
	matches := solutionRegex.FindAllStringSubmatch(content, -1)

	for _, match := range matches {
		if len(match) >= 3 {
			slug := match[1]

			// Extract full solution block
			startIdx := strings.Index(content, `"`+slug+`"`)
			if startIdx == -1 {
				continue
			}

			// Find the solution object boundaries
			blockStart := strings.Index(content[startIdx:], "{")
			if blockStart == -1 {
				continue
			}
			blockStart += startIdx

			// Parse steps
			stepsRegex := regexp.MustCompile(`steps:\s*\[([^\]]+)\]`)
			stepsMatch := stepsRegex.FindStringSubmatch(content[blockStart:])
			var steps []string
			if len(stepsMatch) >= 2 {
				steps = parseStringArray(stepsMatch[1])
			}

			// Parse language
			langRegex := regexp.MustCompile(`language:\s*"([^"]+)"`)
			langMatch := langRegex.FindStringSubmatch(content[blockStart:])
			language := "java"
			if len(langMatch) >= 2 {
				language = langMatch[1]
			}

			// Parse complexities
			timeRegex := regexp.MustCompile(`timeComplexity:\s*"([^"]+)"`)
			timeMatch := timeRegex.FindStringSubmatch(content[blockStart:])
			timeComplexity := ""
			if len(timeMatch) >= 2 {
				timeComplexity = timeMatch[1]
			}

			spaceRegex := regexp.MustCompile(`spaceComplexity:\s*"([^"]+)"`)
			spaceMatch := spaceRegex.FindStringSubmatch(content[blockStart:])
			spaceComplexity := ""
			if len(spaceMatch) >= 2 {
				spaceComplexity = spaceMatch[1]
			}

			// Parse code block (backtick string)
			codeRegex := regexp.MustCompile("code:\\s*`([^`]+)`")
			codeMatch := codeRegex.FindStringSubmatch(content[blockStart:])
			code := ""
			if len(codeMatch) >= 2 {
				code = codeMatch[1]
			}

			solutions[slug] = solutionRecord{
				Approach:        match[2],
				Steps:           steps,
				Code:            code,
				Language:        language,
				TimeComplexity:  timeComplexity,
				SpaceComplexity: spaceComplexity,
			}
		}
	}

	return solutions
}

// slugToName converts a slug to a readable name
func slugToName(slug string) string {
	words := strings.Split(slug, "-")
	for i, word := range words {
		if len(word) > 0 {
			words[i] = strings.ToUpper(word[:1]) + word[1:]
		}
	}
	return strings.Join(words, " ")
}

// Concept data structure matching frontend dsa-fundamentals.ts
type conceptRecord struct {
	ID              string            `json:"id"`
	Name            string            `json:"name"`
	Slug            string            `json:"slug"`
	Category        string            `json:"category"`
	Description     string            `json:"description"`
	Explanation     string            `json:"explanation"`
	TimeComplexity  string            `json:"timeComplexity"`
	SpaceComplexity string            `json:"spaceComplexity"`
	WhenToUse       []string          `json:"whenToUse"`
	CodeSnippets    map[string]string `json:"codeSnippets"`
	KeyPoints       []string          `json:"keyPoints"`
	CommonMistakes  []string          `json:"commonMistakes"`
}

func indexConcepts(ctx context.Context, indexer *rag.Indexer, frontendPath string) error {
	conceptsPath := filepath.Join(frontendPath, "lib", "dsa-fundamentals.ts")
	log.Info().Str("path", conceptsPath).Msg("Loading concepts from frontend...")

	data, err := os.ReadFile(conceptsPath)
	if err != nil {
		return err
	}

	concepts := parseConceptsFromTS(string(data))
	log.Info().Int("count", len(concepts)).Msg("Found concepts to index")

	for i, c := range concepts {
		if i > 0 && i%10 == 0 {
			log.Info().Int("progress", i).Int("total", len(concepts)).Msg("Indexing concepts...")
		}

		ragConcept := rag.Concept{
			ID:              c.ID,
			Name:            c.Name,
			Slug:            c.Slug,
			Category:        c.Category,
			Description:     c.Description,
			Explanation:     c.Explanation,
			TimeComplexity:  c.TimeComplexity,
			SpaceComplexity: c.SpaceComplexity,
			WhenToUse:       c.WhenToUse,
			KeyPoints:       c.KeyPoints,
			CommonMistakes:  c.CommonMistakes,
			CodeSnippets:    c.CodeSnippets,
		}

		if err := indexer.IndexConcept(ctx, ragConcept); err != nil {
			log.Error().Err(err).Str("conceptId", c.ID).Msg("Failed to index concept, continuing...")
		}
		time.Sleep(100 * time.Millisecond)
	}

	return nil
}

// parseConceptsFromTS extracts concept data from TypeScript file
func parseConceptsFromTS(content string) []conceptRecord {
	var concepts []conceptRecord

	// Find concept objects
	conceptRegex := regexp.MustCompile(`\{\s*id:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*slug:\s*"([^"]+)",\s*category:\s*"([^"]+)",\s*description:\s*"([^"]+)"`)

	matches := conceptRegex.FindAllStringSubmatch(content, -1)
	for _, match := range matches {
		if len(match) >= 6 {
			id := match[1]

			// Find this concept's block for additional fields
			conceptStart := strings.Index(content, `id: "`+id+`"`)
			if conceptStart == -1 {
				continue
			}

			// Find the code snippets section
			codeSnippets := make(map[string]string)
			snippetsStart := strings.Index(content[conceptStart:], "codeSnippets:")
			if snippetsStart != -1 {
				snippetsSection := content[conceptStart+snippetsStart:]
				// Extract Java code
				javaRegex := regexp.MustCompile("java:\\s*`([^`]+)`")
				if javaMatch := javaRegex.FindStringSubmatch(snippetsSection); len(javaMatch) >= 2 {
					codeSnippets["java"] = javaMatch[1]
				}
				// Extract Python code
				pythonRegex := regexp.MustCompile("python:\\s*`([^`]+)`")
				if pythonMatch := pythonRegex.FindStringSubmatch(snippetsSection); len(pythonMatch) >= 2 {
					codeSnippets["python"] = pythonMatch[1]
				}
			}

			// Extract timeComplexity
			timeRegex := regexp.MustCompile(`timeComplexity:\s*"([^"]+)"`)
			timeMatch := timeRegex.FindStringSubmatch(content[conceptStart:])
			timeComplexity := ""
			if len(timeMatch) >= 2 {
				timeComplexity = timeMatch[1]
			}

			// Extract spaceComplexity
			spaceRegex := regexp.MustCompile(`spaceComplexity:\s*"([^"]+)"`)
			spaceMatch := spaceRegex.FindStringSubmatch(content[conceptStart:])
			spaceComplexity := ""
			if len(spaceMatch) >= 2 {
				spaceComplexity = spaceMatch[1]
			}

			// Extract whenToUse array
			whenRegex := regexp.MustCompile(`whenToUse:\s*\[([^\]]+)\]`)
			whenMatch := whenRegex.FindStringSubmatch(content[conceptStart:])
			var whenToUse []string
			if len(whenMatch) >= 2 {
				whenToUse = parseStringArray(whenMatch[1])
			}

			concepts = append(concepts, conceptRecord{
				ID:              id,
				Name:            match[2],
				Slug:            match[3],
				Category:        match[4],
				Description:     match[5],
				TimeComplexity:  timeComplexity,
				SpaceComplexity: spaceComplexity,
				WhenToUse:       whenToUse,
				CodeSnippets:    codeSnippets,
			})
		}
	}

	return concepts
}

// Article data structures matching frontend articles
type articleMeta struct {
	Title       string           `json:"title"`
	Slug        string           `json:"slug"`
	Description string           `json:"description"`
	Difficulty  string           `json:"difficulty"`
	Tags        []string         `json:"tags"`
	Sections    []articleSection `json:"sections"`
}

type articleSection struct {
	Slug        string `json:"slug"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Order       int    `json:"order"`
}

func indexArticles(ctx context.Context, indexer *rag.Indexer, frontendPath string) error {
	articlesDir := filepath.Join(frontendPath, "content", "articles")
	log.Info().Str("path", articlesDir).Msg("Loading articles from frontend...")

	// Read article directories
	entries, err := os.ReadDir(articlesDir)
	if err != nil {
		return err
	}

	var articles []rag.Article
	var sections []rag.ArticleSection

	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}

		metaPath := filepath.Join(articlesDir, entry.Name(), "meta.json")
		metaData, err := os.ReadFile(metaPath)
		if err != nil {
			log.Warn().Str("dir", entry.Name()).Err(err).Msg("Could not read meta.json, skipping...")
			continue
		}

		var meta articleMeta
		if err := json.Unmarshal(metaData, &meta); err != nil {
			log.Warn().Str("dir", entry.Name()).Err(err).Msg("Could not parse meta.json, skipping...")
			continue
		}

		articles = append(articles, rag.Article{
			Slug:        meta.Slug,
			Title:       meta.Title,
			Description: meta.Description,
			Tags:        meta.Tags,
			Difficulty:  meta.Difficulty,
		})

		for _, sec := range meta.Sections {
			sections = append(sections, rag.ArticleSection{
				ArticleSlug:  meta.Slug,
				ArticleTitle: meta.Title,
				Slug:         sec.Slug,
				Title:        sec.Title,
				Description:  sec.Description,
				Order:        sec.Order,
			})
		}
	}

	log.Info().Int("articles", len(articles)).Int("sections", len(sections)).Msg("Found articles to index")

	if err := indexer.IndexAllArticles(ctx, articles, sections); err != nil {
		return err
	}

	return nil
}
