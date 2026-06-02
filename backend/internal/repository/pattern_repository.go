package repository

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/imrishuroy/algopatterns/internal/models"
	"github.com/jackc/pgx/v5"
)

var ErrNotFound = errors.New("not found")
var ErrDuplicate = errors.New("duplicate entry")

type PatternRepository struct {
	db *Database
}

func NewPatternRepository(db *Database) *PatternRepository {
	return &PatternRepository{db: db}
}

func (r *PatternRepository) Create(ctx context.Context, pattern *models.Pattern) error {
	tx, err := r.db.Pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	now := time.Now()
	pattern.CreatedAt = now
	pattern.UpdatedAt = now

	_, err = tx.Exec(ctx, `
		INSERT INTO patterns (id, category, difficulty, description, time_complexity, space_complexity, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`, pattern.ID, pattern.Category, pattern.Difficulty, pattern.Description,
		pattern.TimeComplexity, pattern.SpaceComplexity, pattern.CreatedAt, pattern.UpdatedAt)
	if err != nil {
		if strings.Contains(err.Error(), "duplicate key") {
			return ErrDuplicate
		}
		return fmt.Errorf("failed to insert pattern: %w", err)
	}

	if err := r.insertRelatedData(ctx, tx, pattern); err != nil {
		return err
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

func (*PatternRepository) insertRelatedData(ctx context.Context, tx pgx.Tx, pattern *models.Pattern) error {
	if err := insertWhenToUse(ctx, tx, pattern.ID, pattern.WhenToUse); err != nil {
		return err
	}
	if err := insertCodeTemplates(ctx, tx, pattern.ID, &pattern.CodeTemplates); err != nil {
		return err
	}
	if err := insertInsights(ctx, tx, pattern.ID, pattern.KeyInsights); err != nil {
		return err
	}
	if err := insertMistakes(ctx, tx, pattern.ID, pattern.CommonMistakes); err != nil {
		return err
	}
	if err := insertVariations(ctx, tx, pattern.ID, pattern.Variations); err != nil {
		return err
	}
	if err := insertProblems(ctx, tx, pattern.ID, pattern.CommonProblems); err != nil {
		return err
	}
	return nil
}

func insertWhenToUse(ctx context.Context, tx pgx.Tx, patternID string, useCases []string) error {
	for i, useCase := range useCases {
		_, err := tx.Exec(ctx, `
			INSERT INTO pattern_when_to_use (id, pattern_id, use_case, order_index)
			VALUES ($1, $2, $3, $4)
		`, uuid.New(), patternID, useCase, i)
		if err != nil {
			return fmt.Errorf("failed to insert when_to_use: %w", err)
		}
	}
	return nil
}

func insertCodeTemplates(ctx context.Context, tx pgx.Tx, patternID string, templates *models.CodeTemplates) error {
	templateMap := map[string]string{
		"javascript": templates.JavaScript,
		"java":       templates.Java,
		"python":     templates.Python,
		"cpp":        templates.Cpp,
		"go":         templates.Go,
	}
	for lang, code := range templateMap {
		if code != "" {
			_, err := tx.Exec(ctx, `
				INSERT INTO pattern_code_templates (id, pattern_id, language, code)
				VALUES ($1, $2, $3, $4)
			`, uuid.New(), patternID, lang, code)
			if err != nil {
				return fmt.Errorf("failed to insert code_template: %w", err)
			}
		}
	}
	return nil
}

func insertInsights(ctx context.Context, tx pgx.Tx, patternID string, insights []string) error {
	for i, insight := range insights {
		_, err := tx.Exec(ctx, `
			INSERT INTO pattern_insights (id, pattern_id, insight, order_index)
			VALUES ($1, $2, $3, $4)
		`, uuid.New(), patternID, insight, i)
		if err != nil {
			return fmt.Errorf("failed to insert insight: %w", err)
		}
	}
	return nil
}

func insertMistakes(ctx context.Context, tx pgx.Tx, patternID string, mistakes []string) error {
	for i, mistake := range mistakes {
		_, err := tx.Exec(ctx, `
			INSERT INTO pattern_mistakes (id, pattern_id, mistake, order_index)
			VALUES ($1, $2, $3, $4)
		`, uuid.New(), patternID, mistake, i)
		if err != nil {
			return fmt.Errorf("failed to insert mistake: %w", err)
		}
	}
	return nil
}

func insertVariations(ctx context.Context, tx pgx.Tx, patternID string, variations []models.PatternVariation) error {
	for i, variation := range variations {
		variationID := uuid.New()
		_, err := tx.Exec(ctx, `
			INSERT INTO pattern_variations (id, pattern_id, name, description, when_to_use, order_index)
			VALUES ($1, $2, $3, $4, $5, $6)
		`, variationID, patternID, variation.Name, variation.Desc, variation.When, i)
		if err != nil {
			return fmt.Errorf("failed to insert variation: %w", err)
		}

		if err := insertVariationTemplates(ctx, tx, variationID, variation.Template); err != nil {
			return err
		}
		if err := insertVariationProblems(ctx, tx, variationID, variation.Problems); err != nil {
			return err
		}
	}
	return nil
}

func insertVariationTemplates(ctx context.Context, tx pgx.Tx, variationID uuid.UUID, template *models.VariationTemplate) error {
	if template == nil {
		return nil
	}
	templates := map[string]string{
		"javascript": template.JavaScript,
		"java":       template.Java,
	}
	for lang, code := range templates {
		if code != "" {
			_, err := tx.Exec(ctx, `
				INSERT INTO variation_code_templates (id, variation_id, language, code)
				VALUES ($1, $2, $3, $4)
			`, uuid.New(), variationID, lang, code)
			if err != nil {
				return fmt.Errorf("failed to insert variation template: %w", err)
			}
		}
	}
	return nil
}

func insertVariationProblems(ctx context.Context, tx pgx.Tx, variationID uuid.UUID, problems []string) error {
	for _, problem := range problems {
		_, err := tx.Exec(ctx, `
			INSERT INTO variation_problems (id, variation_id, problem_name)
			VALUES ($1, $2, $3)
		`, uuid.New(), variationID, problem)
		if err != nil {
			return fmt.Errorf("failed to insert variation problem: %w", err)
		}
	}
	return nil
}

func insertProblems(ctx context.Context, tx pgx.Tx, patternID string, problems []string) error {
	for _, problem := range problems {
		_, err := tx.Exec(ctx, `
			INSERT INTO pattern_problems (id, pattern_id, problem_name)
			VALUES ($1, $2, $3)
		`, uuid.New(), patternID, problem)
		if err != nil {
			return fmt.Errorf("failed to insert problem: %w", err)
		}
	}
	return nil
}

func (r *PatternRepository) GetByID(ctx context.Context, id string) (*models.Pattern, error) {
	pattern := &models.Pattern{}

	err := r.db.Pool.QueryRow(ctx, `
		SELECT id, category, difficulty, description, time_complexity, space_complexity, created_at, updated_at
		FROM patterns WHERE id = $1
	`, id).Scan(&pattern.ID, &pattern.Category, &pattern.Difficulty, &pattern.Description,
		&pattern.TimeComplexity, &pattern.SpaceComplexity, &pattern.CreatedAt, &pattern.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("failed to get pattern: %w", err)
	}

	if err := r.loadRelatedData(ctx, pattern); err != nil {
		return nil, err
	}

	return pattern, nil
}

func (r *PatternRepository) loadRelatedData(ctx context.Context, pattern *models.Pattern) error {
	var err error
	if pattern.WhenToUse, err = r.loadWhenToUse(ctx, pattern.ID); err != nil {
		return err
	}
	if err = r.loadCodeTemplates(ctx, pattern); err != nil {
		return err
	}
	if pattern.KeyInsights, err = r.loadInsights(ctx, pattern.ID); err != nil {
		return err
	}
	if pattern.CommonMistakes, err = r.loadMistakes(ctx, pattern.ID); err != nil {
		return err
	}
	if pattern.Variations, err = r.loadVariations(ctx, pattern.ID); err != nil {
		return err
	}
	if pattern.CommonProblems, err = r.loadProblems(ctx, pattern.ID); err != nil {
		return err
	}
	return nil
}

func (r *PatternRepository) loadWhenToUse(ctx context.Context, patternID string) ([]string, error) {
	rows, err := r.db.Pool.Query(ctx, `
		SELECT use_case FROM pattern_when_to_use WHERE pattern_id = $1 ORDER BY order_index
	`, patternID)
	if err != nil {
		return nil, fmt.Errorf("failed to load when_to_use: %w", err)
	}
	defer rows.Close()

	var useCases []string
	for rows.Next() {
		var useCase string
		if err := rows.Scan(&useCase); err != nil {
			return nil, err
		}
		useCases = append(useCases, useCase)
	}
	return useCases, nil
}

func (r *PatternRepository) loadCodeTemplates(ctx context.Context, pattern *models.Pattern) error {
	rows, err := r.db.Pool.Query(ctx, `
		SELECT language, code FROM pattern_code_templates WHERE pattern_id = $1
	`, pattern.ID)
	if err != nil {
		return fmt.Errorf("failed to load code_templates: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var lang, code string
		if err := rows.Scan(&lang, &code); err != nil {
			return err
		}
		assignCodeTemplate(&pattern.CodeTemplates, lang, code)
	}
	return nil
}

func assignCodeTemplate(templates *models.CodeTemplates, lang, code string) {
	switch lang {
	case "javascript":
		templates.JavaScript = code
	case "java":
		templates.Java = code
	case "python":
		templates.Python = code
	case "cpp":
		templates.Cpp = code
	case "go":
		templates.Go = code
	}
}

func (r *PatternRepository) loadInsights(ctx context.Context, patternID string) ([]string, error) {
	rows, err := r.db.Pool.Query(ctx, `
		SELECT insight FROM pattern_insights WHERE pattern_id = $1 ORDER BY order_index
	`, patternID)
	if err != nil {
		return nil, fmt.Errorf("failed to load insights: %w", err)
	}
	defer rows.Close()

	var insights []string
	for rows.Next() {
		var insight string
		if err := rows.Scan(&insight); err != nil {
			return nil, err
		}
		insights = append(insights, insight)
	}
	return insights, nil
}

func (r *PatternRepository) loadMistakes(ctx context.Context, patternID string) ([]string, error) {
	rows, err := r.db.Pool.Query(ctx, `
		SELECT mistake FROM pattern_mistakes WHERE pattern_id = $1 ORDER BY order_index
	`, patternID)
	if err != nil {
		return nil, fmt.Errorf("failed to load mistakes: %w", err)
	}
	defer rows.Close()

	var mistakes []string
	for rows.Next() {
		var mistake string
		if err := rows.Scan(&mistake); err != nil {
			return nil, err
		}
		mistakes = append(mistakes, mistake)
	}
	return mistakes, nil
}

func (r *PatternRepository) loadVariations(ctx context.Context, patternID string) ([]models.PatternVariation, error) {
	rows, err := r.db.Pool.Query(ctx, `
		SELECT id, name, description, when_to_use FROM pattern_variations WHERE pattern_id = $1 ORDER BY order_index
	`, patternID)
	if err != nil {
		return nil, fmt.Errorf("failed to load variations: %w", err)
	}
	defer rows.Close()

	var variations []models.PatternVariation
	for rows.Next() {
		v, err := r.scanVariation(rows)
		if err != nil {
			return nil, err
		}
		if err := r.loadVariationDetails(ctx, &v); err != nil {
			return nil, err
		}
		variations = append(variations, v)
	}
	return variations, nil
}

func (*PatternRepository) scanVariation(rows pgx.Rows) (models.PatternVariation, error) {
	var v models.PatternVariation
	var whenToUse *string
	if err := rows.Scan(&v.ID, &v.Name, &v.Desc, &whenToUse); err != nil {
		return v, err
	}
	if whenToUse != nil {
		v.When = *whenToUse
	}
	return v, nil
}

func (r *PatternRepository) loadVariationDetails(ctx context.Context, v *models.PatternVariation) error {
	var err error
	if v.Template, err = r.loadVariationTemplates(ctx, v.ID); err != nil {
		return err
	}
	if v.Problems, err = r.loadVariationProblems(ctx, v.ID); err != nil {
		return err
	}
	return nil
}

func (r *PatternRepository) loadVariationTemplates(ctx context.Context, variationID uuid.UUID) (*models.VariationTemplate, error) {
	rows, err := r.db.Pool.Query(ctx, `
		SELECT language, code FROM variation_code_templates WHERE variation_id = $1
	`, variationID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	template := &models.VariationTemplate{}
	for rows.Next() {
		var lang, code string
		if err := rows.Scan(&lang, &code); err != nil {
			return nil, err
		}
		switch lang {
		case "javascript":
			template.JavaScript = code
		case "java":
			template.Java = code
		}
	}
	return template, nil
}

func (r *PatternRepository) loadVariationProblems(ctx context.Context, variationID uuid.UUID) ([]string, error) {
	rows, err := r.db.Pool.Query(ctx, `
		SELECT problem_name FROM variation_problems WHERE variation_id = $1
	`, variationID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var problems []string
	for rows.Next() {
		var problem string
		if err := rows.Scan(&problem); err != nil {
			return nil, err
		}
		problems = append(problems, problem)
	}
	return problems, nil
}

func (r *PatternRepository) loadProblems(ctx context.Context, patternID string) ([]string, error) {
	rows, err := r.db.Pool.Query(ctx, `
		SELECT problem_name FROM pattern_problems WHERE pattern_id = $1
	`, patternID)
	if err != nil {
		return nil, fmt.Errorf("failed to load problems: %w", err)
	}
	defer rows.Close()

	var problems []string
	for rows.Next() {
		var problem string
		if err := rows.Scan(&problem); err != nil {
			return nil, err
		}
		problems = append(problems, problem)
	}
	return problems, nil
}

func (r *PatternRepository) List(ctx context.Context, req *models.PatternListRequest) ([]models.Pattern, int64, error) {
	var conditions []string
	var args []interface{}
	argNum := 1

	if req.Search != "" {
		conditions = append(conditions, fmt.Sprintf("(category ILIKE $%d OR description ILIKE $%d)", argNum, argNum+1))
		args = append(args, "%"+req.Search+"%", "%"+req.Search+"%")
		argNum += 2
	}
	if req.Difficulty != "" {
		conditions = append(conditions, fmt.Sprintf("difficulty = $%d", argNum))
		args = append(args, req.Difficulty)
		argNum++
	}
	if req.Category != "" {
		conditions = append(conditions, fmt.Sprintf("category ILIKE $%d", argNum))
		args = append(args, "%"+req.Category+"%")
		argNum++
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	var total int64
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM patterns %s", whereClause)
	err := r.db.Pool.QueryRow(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count patterns: %w", err)
	}

	orderClause := fmt.Sprintf("ORDER BY %s %s", req.SortBy, req.SortOrder)
	offset := (req.Page - 1) * req.PageSize

	query := fmt.Sprintf(`
		SELECT id, category, difficulty, description, time_complexity, space_complexity, created_at, updated_at
		FROM patterns %s %s LIMIT $%d OFFSET $%d
	`, whereClause, orderClause, argNum, argNum+1)
	args = append(args, req.PageSize, offset)

	rows, err := r.db.Pool.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list patterns: %w", err)
	}
	defer rows.Close()

	var patterns []models.Pattern
	for rows.Next() {
		var p models.Pattern
		if err := rows.Scan(&p.ID, &p.Category, &p.Difficulty, &p.Description,
			&p.TimeComplexity, &p.SpaceComplexity, &p.CreatedAt, &p.UpdatedAt); err != nil {
			return nil, 0, err
		}
		if err := r.loadRelatedData(ctx, &p); err != nil {
			return nil, 0, err
		}
		patterns = append(patterns, p)
	}

	return patterns, total, nil
}

func (r *PatternRepository) Update(ctx context.Context, id string, updates map[string]interface{}) error {
	tx, err := r.db.Pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	var setClauses []string
	var args []interface{}
	argNum := 1

	for key, value := range updates {
		setClauses = append(setClauses, fmt.Sprintf("%s = $%d", key, argNum))
		args = append(args, value)
		argNum++
	}
	setClauses = append(setClauses, fmt.Sprintf("updated_at = $%d", argNum))
	args = append(args, time.Now())
	argNum++

	args = append(args, id)
	query := fmt.Sprintf("UPDATE patterns SET %s WHERE id = $%d", strings.Join(setClauses, ", "), argNum)

	result, err := tx.Exec(ctx, query, args...)
	if err != nil {
		return fmt.Errorf("failed to update pattern: %w", err)
	}
	if result.RowsAffected() == 0 {
		return ErrNotFound
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

func (r *PatternRepository) Delete(ctx context.Context, id string) error {
	result, err := r.db.Pool.Exec(ctx, "DELETE FROM patterns WHERE id = $1", id)
	if err != nil {
		return fmt.Errorf("failed to delete pattern: %w", err)
	}
	if result.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (r *PatternRepository) GetCategories(ctx context.Context) ([]string, error) {
	rows, err := r.db.Pool.Query(ctx, "SELECT DISTINCT category FROM patterns ORDER BY category")
	if err != nil {
		return nil, fmt.Errorf("failed to get categories: %w", err)
	}
	defer rows.Close()

	var categories []string
	for rows.Next() {
		var cat string
		if err := rows.Scan(&cat); err != nil {
			return nil, err
		}
		categories = append(categories, cat)
	}
	return categories, nil
}

func (r *PatternRepository) BulkCreate(ctx context.Context, patterns []models.Pattern) (int, []string, error) {
	var imported int
	var errs []string

	for _, p := range patterns {
		if err := r.Create(ctx, &p); err != nil {
			errs = append(errs, fmt.Sprintf("%s: %v", p.ID, err))
		} else {
			imported++
		}
	}

	return imported, errs, nil
}

func (r *PatternRepository) ExportAll(ctx context.Context) ([]byte, error) {
	req := &models.PatternListRequest{
		Page:     1,
		PageSize: 1000,
		SortBy:   "category",
		SortOrder: "asc",
	}
	patterns, _, err := r.List(ctx, req)
	if err != nil {
		return nil, err
	}

	export := map[string]interface{}{
		"version":       "1.0.0",
		"exportedAt":    time.Now().Format(time.RFC3339),
		"totalPatterns": len(patterns),
		"patterns":      patterns,
	}

	return json.MarshalIndent(export, "", "  ")
}
