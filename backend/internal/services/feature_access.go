package services

import (
	"context"

	"github.com/imrishuroy/algopatterns/internal/models"
	"github.com/imrishuroy/algopatterns/internal/repository"
)

var freePatternIDs = map[string]bool{
	"sliding-window": true,
	"two-pointers":   true,
	"binary-search":  true,
}

// freeVisualizerIDs defines the visualizers available to free users.
// These are the first 5 basic visualizers that provide essential learning value.
var freeVisualizerIDs = map[string]bool{
	"fixed-window":      true, // Sliding Window - basic fixed window concept
	"two-sum-sorted":    true, // Two Pointers - fundamental two pointer technique
	"binary-search":     true, // Binary Search - core binary search visualization
	"prefix-sum":        true, // Prefix Sum - essential prefix sum concept
	"valid-parentheses": true, // Stack - basic stack operations
}

// FeatureAccessRepository defines the interface for subscription data access needed by FeatureAccess.
type FeatureAccessRepository interface {
	GetActiveSubscriptionByUserID(ctx context.Context, userID string) (*models.Subscription, error)
	GetPlanByID(ctx context.Context, id string) (*models.SubscriptionPlan, error)
}

type FeatureAccess struct {
	paymentRepo FeatureAccessRepository
}

func NewFeatureAccess(paymentRepo *repository.PaymentRepository) *FeatureAccess {
	return &FeatureAccess{paymentRepo: paymentRepo}
}

// NewFeatureAccessWithRepo creates a FeatureAccess with any repository implementing the interface.
func NewFeatureAccessWithRepo(repo FeatureAccessRepository) *FeatureAccess {
	return &FeatureAccess{paymentRepo: repo}
}

func (f *FeatureAccess) GetUserFeatures(ctx context.Context, userID string) (*models.PlanFeatures, bool, error) {
	if userID == "" {
		return f.freeFeatures(), false, nil
	}

	sub, err := f.paymentRepo.GetActiveSubscriptionByUserID(ctx, userID)
	if err != nil {
		if err == repository.ErrSubscriptionNotFound {
			return f.freeFeatures(), false, nil
		}
		return nil, false, err
	}

	plan, err := f.paymentRepo.GetPlanByID(ctx, sub.PlanID)
	if err != nil {
		return f.freeFeatures(), false, nil
	}

	// Grant access for active subscriptions and those in grace period (past_due)
	isPro := sub.PlanID != "free" && (sub.Status == models.SubscriptionStatusActive || sub.Status == models.SubscriptionStatusPastDue)
	return &plan.Features, isPro, nil
}

func (f *FeatureAccess) IsInGracePeriod(ctx context.Context, userID string) (bool, error) {
	if userID == "" {
		return false, nil
	}

	sub, err := f.paymentRepo.GetActiveSubscriptionByUserID(ctx, userID)
	if err != nil {
		if err == repository.ErrSubscriptionNotFound {
			return false, nil
		}
		return false, err
	}

	return sub.Status == models.SubscriptionStatusPastDue, nil
}

func (f *FeatureAccess) CanAccessPattern(ctx context.Context, userID, patternID string) (bool, error) {
	if freePatternIDs[patternID] {
		return true, nil
	}

	features, isPro, err := f.GetUserFeatures(ctx, userID)
	if err != nil {
		return false, err
	}

	if isPro || features.MaxPatterns == -1 {
		return true, nil
	}

	return false, nil
}

func (f *FeatureAccess) CanAccessSolutions(ctx context.Context, userID string) (bool, error) {
	features, _, err := f.GetUserFeatures(ctx, userID)
	if err != nil {
		return false, err
	}
	return features.HasSolutionsAccess, nil
}

func (f *FeatureAccess) CanAccessQuizHistory(ctx context.Context, userID string) (bool, error) {
	features, _, err := f.GetUserFeatures(ctx, userID)
	if err != nil {
		return false, err
	}
	return features.HasQuizHistory, nil
}

func (f *FeatureAccess) CanAccessHighlighting(ctx context.Context, userID string) (bool, error) {
	features, _, err := f.GetUserFeatures(ctx, userID)
	if err != nil {
		return false, err
	}
	return features.HasHighlighting, nil
}

func (f *FeatureAccess) CanAccessCodePlayground(ctx context.Context, userID string) (bool, error) {
	features, _, err := f.GetUserFeatures(ctx, userID)
	if err != nil {
		return false, err
	}
	return features.HasCodePlayground, nil
}

// CanAccessVisualizer checks if a user can access a specific visualizer by ID.
// Logic:
// 1. Get user's subscription features
// 2. If max_visualizers == -1, allow all (unlimited access)
// 3. If max_visualizers > 0, check if the requested visualizer is in the free list
func (f *FeatureAccess) CanAccessVisualizer(ctx context.Context, userID, visualizerID string) (bool, error) {
	// Always allow free visualizers
	if freeVisualizerIDs[visualizerID] {
		return true, nil
	}

	features, isPro, err := f.GetUserFeatures(ctx, userID)
	if err != nil {
		return false, err
	}

	// Pro users or unlimited access (-1) can access all visualizers
	if isPro || features.MaxVisualizers == -1 {
		return true, nil
	}

	// Free users can only access visualizers in the free list
	return false, nil
}

func (f *FeatureAccess) freeFeatures() *models.PlanFeatures {
	return &models.PlanFeatures{
		MaxPatterns:             3,
		MaxVisualizers:          2,
		QuizQuestionsPerPattern: 3,
		HasQuizHistory:          false,
		HasCodePlayground:       false,
		HasProgressSync:         false,
		HasHighlighting:         false,
		HasSolutionsAccess:      false,
		HasOfflineExport:        false,
	}
}

func (f *FeatureAccess) GetFreePatternIDs() []string {
	ids := make([]string, 0, len(freePatternIDs))
	for id := range freePatternIDs {
		ids = append(ids, id)
	}
	return ids
}

func IsFreePattern(patternID string) bool {
	return freePatternIDs[patternID]
}

// GetFreeVisualizerIDs returns the list of visualizer IDs available to free users.
func (f *FeatureAccess) GetFreeVisualizerIDs() []string {
	ids := make([]string, 0, len(freeVisualizerIDs))
	for id := range freeVisualizerIDs {
		ids = append(ids, id)
	}
	return ids
}

// IsFreeVisualizer checks if a visualizer is available to free users.
func IsFreeVisualizer(visualizerID string) bool {
	return freeVisualizerIDs[visualizerID]
}
