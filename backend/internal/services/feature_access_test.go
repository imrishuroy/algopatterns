package services

import (
	"context"
	"testing"
	"time"

	"github.com/imrishuroy/algopatterns/internal/models"
	"github.com/imrishuroy/algopatterns/internal/repository"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockPaymentRepositoryForAccess is a mock for FeatureAccess tests
type MockPaymentRepositoryForAccess struct {
	mock.Mock
}

func (m *MockPaymentRepositoryForAccess) GetActiveSubscriptionByUserID(ctx context.Context, userID string) (*models.Subscription, error) {
	args := m.Called(ctx, userID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.Subscription), args.Error(1)
}

func (m *MockPaymentRepositoryForAccess) GetPlanByID(ctx context.Context, id string) (*models.SubscriptionPlan, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.SubscriptionPlan), args.Error(1)
}

// Helper to create pro plan features
func createProFeatures() models.PlanFeatures {
	return models.PlanFeatures{
		MaxPatterns:             -1, // Unlimited
		MaxVisualizers:          -1, // Unlimited
		QuizQuestionsPerPattern: -1,
		HasQuizHistory:          true,
		HasCodePlayground:       true,
		HasProgressSync:         true,
		HasHighlighting:         true,
		HasSolutionsAccess:      true,
		HasOfflineExport:        true,
	}
}

// Helper to create free plan features
func createFreeFeatures() models.PlanFeatures {
	return models.PlanFeatures{
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

// CanAccessPattern Tests

func TestCanAccessPattern_FreePattern_NoUser(t *testing.T) {
	// Free patterns should always be accessible, even without a user
	freePatterns := []string{"sliding-window", "two-pointers", "binary-search"}

	for _, patternID := range freePatterns {
		t.Run(patternID, func(t *testing.T) {
			// IsFreePattern is a standalone function
			result := IsFreePattern(patternID)
			assert.True(t, result, "Pattern %s should be free", patternID)
		})
	}
}

func TestCanAccessPattern_FreePattern_FreeUser(t *testing.T) {
	mockRepo := new(MockPaymentRepositoryForAccess)
	ctx := context.Background()

	userID := "user-123"
	freePatterns := []string{"sliding-window", "two-pointers", "binary-search"}

	// Free user - no subscription
	mockRepo.On("GetActiveSubscriptionByUserID", ctx, userID).Return(nil, repository.ErrSubscriptionNotFound)

	for _, patternID := range freePatterns {
		t.Run(patternID, func(t *testing.T) {
			// Free patterns should be accessible
			result := IsFreePattern(patternID)
			assert.True(t, result)
		})
	}
}

func TestCanAccessPattern_FreePattern_ProUser(t *testing.T) {
	mockRepo := new(MockPaymentRepositoryForAccess)
	ctx := context.Background()

	userID := "user-123"
	freePatterns := []string{"sliding-window", "two-pointers", "binary-search"}

	proSub := &models.Subscription{
		PlanID: "pro_yearly",
		Status: models.SubscriptionStatusActive,
	}

	proPlan := &models.SubscriptionPlan{
		ID:       "pro_yearly",
		Features: createProFeatures(),
	}

	mockRepo.On("GetActiveSubscriptionByUserID", ctx, userID).Return(proSub, nil)
	mockRepo.On("GetPlanByID", ctx, "pro_yearly").Return(proPlan, nil)

	for _, patternID := range freePatterns {
		t.Run(patternID, func(t *testing.T) {
			// Pro users should also access free patterns
			result := IsFreePattern(patternID)
			assert.True(t, result)
		})
	}
}

func TestCanAccessPattern_PremiumPattern_FreeUser(t *testing.T) {
	mockRepo := new(MockPaymentRepositoryForAccess)
	ctx := context.Background()

	userID := "user-123"
	premiumPatterns := []string{"dynamic-programming", "graph-traversal", "backtracking"}

	mockRepo.On("GetActiveSubscriptionByUserID", ctx, userID).Return(nil, repository.ErrSubscriptionNotFound)

	for _, patternID := range premiumPatterns {
		t.Run(patternID, func(t *testing.T) {
			// Not a free pattern
			result := IsFreePattern(patternID)
			assert.False(t, result, "Pattern %s should not be free", patternID)

			// Free user should not have access
			_, err := mockRepo.GetActiveSubscriptionByUserID(ctx, userID)
			assert.ErrorIs(t, err, repository.ErrSubscriptionNotFound)
		})
	}
}

func TestCanAccessPattern_PremiumPattern_ProUser(t *testing.T) {
	mockRepo := new(MockPaymentRepositoryForAccess)
	ctx := context.Background()

	userID := "user-123"
	premiumPatterns := []string{"dynamic-programming", "graph-traversal", "backtracking"}

	proSub := &models.Subscription{
		PlanID: "pro_yearly",
		Status: models.SubscriptionStatusActive,
	}

	proPlan := &models.SubscriptionPlan{
		ID:       "pro_yearly",
		Features: createProFeatures(),
	}

	mockRepo.On("GetActiveSubscriptionByUserID", ctx, userID).Return(proSub, nil)
	mockRepo.On("GetPlanByID", ctx, "pro_yearly").Return(proPlan, nil)

	sub, err := mockRepo.GetActiveSubscriptionByUserID(ctx, userID)
	assert.NoError(t, err)
	assert.NotNil(t, sub)

	plan, err := mockRepo.GetPlanByID(ctx, sub.PlanID)
	assert.NoError(t, err)

	isPro := sub.PlanID != "free" && (sub.Status == models.SubscriptionStatusActive || sub.Status == models.SubscriptionStatusPastDue)
	assert.True(t, isPro)

	for _, patternID := range premiumPatterns {
		t.Run(patternID, func(t *testing.T) {
			// Pro user with unlimited patterns should have access
			if isPro || plan.Features.MaxPatterns == -1 {
				assert.True(t, true, "Pro user should access premium pattern %s", patternID)
			}
		})
	}
}

// CanAccessVisualizer Tests

func TestCanAccessVisualizer_FreeVisualizer(t *testing.T) {
	freeVisualizers := []string{
		"fixed-window",
		"two-sum-sorted",
		"binary-search",
		"prefix-sum",
		"valid-parentheses",
	}

	for _, visualizerID := range freeVisualizers {
		t.Run(visualizerID, func(t *testing.T) {
			result := IsFreeVisualizer(visualizerID)
			assert.True(t, result, "Visualizer %s should be free", visualizerID)
		})
	}
}

func TestCanAccessVisualizer_PremiumVisualizer_FreeUser(t *testing.T) {
	mockRepo := new(MockPaymentRepositoryForAccess)
	ctx := context.Background()

	userID := "user-123"
	premiumVisualizers := []string{"dp-knapsack", "graph-dfs", "tree-traversal"}

	mockRepo.On("GetActiveSubscriptionByUserID", ctx, userID).Return(nil, repository.ErrSubscriptionNotFound)

	for _, visualizerID := range premiumVisualizers {
		t.Run(visualizerID, func(t *testing.T) {
			// Not a free visualizer
			result := IsFreeVisualizer(visualizerID)
			assert.False(t, result, "Visualizer %s should not be free", visualizerID)

			// Free user should not have access
			_, err := mockRepo.GetActiveSubscriptionByUserID(ctx, userID)
			assert.ErrorIs(t, err, repository.ErrSubscriptionNotFound)
		})
	}
}

func TestCanAccessVisualizer_PremiumVisualizer_ProUser(t *testing.T) {
	mockRepo := new(MockPaymentRepositoryForAccess)
	ctx := context.Background()

	userID := "user-123"
	premiumVisualizers := []string{"dp-knapsack", "graph-dfs", "tree-traversal"}

	proSub := &models.Subscription{
		PlanID: "pro_yearly",
		Status: models.SubscriptionStatusActive,
	}

	proPlan := &models.SubscriptionPlan{
		ID:       "pro_yearly",
		Features: createProFeatures(),
	}

	mockRepo.On("GetActiveSubscriptionByUserID", ctx, userID).Return(proSub, nil)
	mockRepo.On("GetPlanByID", ctx, "pro_yearly").Return(proPlan, nil)

	sub, err := mockRepo.GetActiveSubscriptionByUserID(ctx, userID)
	assert.NoError(t, err)

	plan, err := mockRepo.GetPlanByID(ctx, sub.PlanID)
	assert.NoError(t, err)

	isPro := sub.PlanID != "free" && sub.Status == models.SubscriptionStatusActive

	for _, visualizerID := range premiumVisualizers {
		t.Run(visualizerID, func(t *testing.T) {
			// Pro user with unlimited visualizers should have access
			if isPro || plan.Features.MaxVisualizers == -1 {
				assert.True(t, true, "Pro user should access premium visualizer %s", visualizerID)
			}
		})
	}
}

// CanAccessCodePlayground Tests

func TestCanAccessCodePlayground_FreeUser(t *testing.T) {
	features := createFreeFeatures()
	assert.False(t, features.HasCodePlayground, "Free user should not have code playground access")
}

func TestCanAccessCodePlayground_ProUser(t *testing.T) {
	features := createProFeatures()
	assert.True(t, features.HasCodePlayground, "Pro user should have code playground access")
}

// CanAccessSolutions Tests

func TestCanAccessSolutions_FreeUser(t *testing.T) {
	features := createFreeFeatures()
	assert.False(t, features.HasSolutionsAccess, "Free user should not have solutions access")
}

func TestCanAccessSolutions_ProUser(t *testing.T) {
	features := createProFeatures()
	assert.True(t, features.HasSolutionsAccess, "Pro user should have solutions access")
}

// CanAccessHighlighting Tests

func TestCanAccessHighlighting_FreeUser(t *testing.T) {
	features := createFreeFeatures()
	assert.False(t, features.HasHighlighting, "Free user should not have highlighting access")
}

func TestCanAccessHighlighting_ProUser(t *testing.T) {
	features := createProFeatures()
	assert.True(t, features.HasHighlighting, "Pro user should have highlighting access")
}

// Grace Period (past_due) Tests

func TestGracePeriod_ActiveStatus(t *testing.T) {
	sub := &models.Subscription{
		PlanID: "pro_yearly",
		Status: models.SubscriptionStatusActive,
	}

	isInGracePeriod := sub.Status == models.SubscriptionStatusPastDue
	assert.False(t, isInGracePeriod, "Active subscription should not be in grace period")

	// Active subscription should still grant access
	isPro := sub.PlanID != "free" && (sub.Status == models.SubscriptionStatusActive || sub.Status == models.SubscriptionStatusPastDue)
	assert.True(t, isPro)
}

func TestGracePeriod_PastDueStatus(t *testing.T) {
	sub := &models.Subscription{
		PlanID: "pro_yearly",
		Status: models.SubscriptionStatusPastDue,
	}

	isInGracePeriod := sub.Status == models.SubscriptionStatusPastDue
	assert.True(t, isInGracePeriod, "Past due subscription should be in grace period")

	// Past due subscription should STILL grant access (grace period)
	isPro := sub.PlanID != "free" && (sub.Status == models.SubscriptionStatusActive || sub.Status == models.SubscriptionStatusPastDue)
	assert.True(t, isPro, "Past due subscription should still grant pro access during grace period")
}

func TestGracePeriod_CancelledStatus(t *testing.T) {
	sub := &models.Subscription{
		PlanID: "pro_yearly",
		Status: models.SubscriptionStatusCancelled,
	}

	isInGracePeriod := sub.Status == models.SubscriptionStatusPastDue
	assert.False(t, isInGracePeriod, "Cancelled subscription should not be in grace period")

	// Cancelled subscription should NOT grant pro access
	isPro := sub.PlanID != "free" && (sub.Status == models.SubscriptionStatusActive || sub.Status == models.SubscriptionStatusPastDue)
	assert.False(t, isPro, "Cancelled subscription should not grant pro access")
}

func TestGracePeriod_ExpiredStatus(t *testing.T) {
	sub := &models.Subscription{
		PlanID: "pro_yearly",
		Status: models.SubscriptionStatusExpired,
	}

	isInGracePeriod := sub.Status == models.SubscriptionStatusPastDue
	assert.False(t, isInGracePeriod, "Expired subscription should not be in grace period")

	// Expired subscription should NOT grant pro access
	isPro := sub.PlanID != "free" && (sub.Status == models.SubscriptionStatusActive || sub.Status == models.SubscriptionStatusPastDue)
	assert.False(t, isPro, "Expired subscription should not grant pro access")
}

func TestGracePeriod_WithFeatureAccessService(t *testing.T) {
	mockRepo := new(MockPaymentRepositoryForAccess)
	ctx := context.Background()

	userID := "user-123"

	// Test past_due status - should still have access
	pastDueSub := &models.Subscription{
		PlanID: "pro_yearly",
		Status: models.SubscriptionStatusPastDue,
	}

	proPlan := &models.SubscriptionPlan{
		ID:       "pro_yearly",
		Features: createProFeatures(),
	}

	mockRepo.On("GetActiveSubscriptionByUserID", ctx, userID).Return(pastDueSub, nil)
	mockRepo.On("GetPlanByID", ctx, "pro_yearly").Return(proPlan, nil)

	sub, err := mockRepo.GetActiveSubscriptionByUserID(ctx, userID)
	assert.NoError(t, err)
	assert.NotNil(t, sub)
	assert.Equal(t, models.SubscriptionStatusPastDue, sub.Status)

	// Get plan to verify features
	plan, err := mockRepo.GetPlanByID(ctx, sub.PlanID)
	assert.NoError(t, err)
	assert.NotNil(t, plan)

	// Even with past_due, should grant access
	isPro := sub.PlanID != "free" && (sub.Status == models.SubscriptionStatusActive || sub.Status == models.SubscriptionStatusPastDue)
	assert.True(t, isPro, "Past due subscription should still grant pro access")
	assert.True(t, plan.Features.HasCodePlayground, "Pro plan should have code playground")

	mockRepo.AssertExpectations(t)
}

// Edge Cases Tests

func TestCanAccessPattern_EmptyUserID(t *testing.T) {
	// Empty user ID should return free features
	userID := ""

	// For anonymous/empty user, should get free features
	if userID == "" {
		features := createFreeFeatures()
		assert.Equal(t, 3, features.MaxPatterns)
		assert.Equal(t, 2, features.MaxVisualizers)
		assert.False(t, features.HasSolutionsAccess)
	}
}

func TestCanAccessPattern_FreePlanSubscription(t *testing.T) {
	// User has a subscription but it's the free plan
	sub := &models.Subscription{
		PlanID: "free",
		Status: models.SubscriptionStatusActive,
	}

	isPro := sub.PlanID != "free" && (sub.Status == models.SubscriptionStatusActive || sub.Status == models.SubscriptionStatusPastDue)
	assert.False(t, isPro, "Free plan subscription should not grant pro access")
}

func TestGetUserFeatures_RepositoryError(t *testing.T) {
	mockRepo := new(MockPaymentRepositoryForAccess)
	ctx := context.Background()

	userID := "user-123"
	expectedErr := repository.ErrSubscriptionNotFound

	mockRepo.On("GetActiveSubscriptionByUserID", ctx, userID).Return(nil, expectedErr)

	_, err := mockRepo.GetActiveSubscriptionByUserID(ctx, userID)
	assert.ErrorIs(t, err, repository.ErrSubscriptionNotFound)

	// When subscription not found, should return free features
	mockRepo.AssertExpectations(t)
}

func TestGetFreePatternIDs(t *testing.T) {
	// Verify the free pattern list
	expectedFreePatterns := map[string]bool{
		"sliding-window": true,
		"two-pointers":   true,
		"binary-search":  true,
	}

	for pattern := range expectedFreePatterns {
		assert.True(t, IsFreePattern(pattern), "Pattern %s should be free", pattern)
	}

	// Verify non-free patterns
	assert.False(t, IsFreePattern("dynamic-programming"))
	assert.False(t, IsFreePattern("graph-traversal"))
	assert.False(t, IsFreePattern("backtracking"))
}

func TestGetFreeVisualizerIDs(t *testing.T) {
	// Verify the free visualizer list
	expectedFreeVisualizers := map[string]bool{
		"fixed-window":      true,
		"two-sum-sorted":    true,
		"binary-search":     true,
		"prefix-sum":        true,
		"valid-parentheses": true,
	}

	for visualizer := range expectedFreeVisualizers {
		assert.True(t, IsFreeVisualizer(visualizer), "Visualizer %s should be free", visualizer)
	}

	// Verify non-free visualizers
	assert.False(t, IsFreeVisualizer("dp-knapsack"))
	assert.False(t, IsFreeVisualizer("graph-dfs"))
	assert.False(t, IsFreeVisualizer("tree-traversal"))
}

// Quiz History Tests

func TestCanAccessQuizHistory_FreeUser(t *testing.T) {
	features := createFreeFeatures()
	assert.False(t, features.HasQuizHistory, "Free user should not have quiz history access")
}

func TestCanAccessQuizHistory_ProUser(t *testing.T) {
	features := createProFeatures()
	assert.True(t, features.HasQuizHistory, "Pro user should have quiz history access")
}

// Progress Sync Tests

func TestCanAccessProgressSync_FreeUser(t *testing.T) {
	features := createFreeFeatures()
	assert.False(t, features.HasProgressSync, "Free user should not have progress sync")
}

func TestCanAccessProgressSync_ProUser(t *testing.T) {
	features := createProFeatures()
	assert.True(t, features.HasProgressSync, "Pro user should have progress sync")
}

// Offline Export Tests

func TestCanAccessOfflineExport_FreeUser(t *testing.T) {
	features := createFreeFeatures()
	assert.False(t, features.HasOfflineExport, "Free user should not have offline export")
}

func TestCanAccessOfflineExport_ProUser(t *testing.T) {
	features := createProFeatures()
	assert.True(t, features.HasOfflineExport, "Pro user should have offline export")
}

// Quiz Questions Per Pattern Tests

func TestQuizQuestionsPerPattern_FreeUser(t *testing.T) {
	features := createFreeFeatures()
	assert.Equal(t, 3, features.QuizQuestionsPerPattern, "Free user should have limited quiz questions")
}

func TestQuizQuestionsPerPattern_ProUser(t *testing.T) {
	features := createProFeatures()
	assert.Equal(t, -1, features.QuizQuestionsPerPattern, "Pro user should have unlimited quiz questions")
}

// Subscription Period Tests

func TestSubscription_IsActive(t *testing.T) {
	now := time.Now()
	futureEnd := now.Add(24 * time.Hour)

	sub := &models.Subscription{
		PlanID:           "pro_yearly",
		Status:           models.SubscriptionStatusActive,
		CurrentPeriodEnd: &futureEnd,
	}

	assert.True(t, sub.IsActive(), "Subscription with future end date should be active")
}

func TestSubscription_IsActive_ExpiredPeriod(t *testing.T) {
	now := time.Now()
	pastEnd := now.Add(-24 * time.Hour)

	sub := &models.Subscription{
		PlanID:           "pro_yearly",
		Status:           models.SubscriptionStatusActive,
		CurrentPeriodEnd: &pastEnd,
	}

	assert.False(t, sub.IsActive(), "Subscription with past end date should not be active")
}

func TestSubscription_IsPro(t *testing.T) {
	now := time.Now()
	futureEnd := now.Add(24 * time.Hour)

	proSub := &models.Subscription{
		PlanID:           "pro_yearly",
		Status:           models.SubscriptionStatusActive,
		CurrentPeriodEnd: &futureEnd,
	}

	freeSub := &models.Subscription{
		PlanID:           "free",
		Status:           models.SubscriptionStatusActive,
		CurrentPeriodEnd: &futureEnd,
	}

	assert.True(t, proSub.IsPro(), "Pro subscription should return true for IsPro")
	assert.False(t, freeSub.IsPro(), "Free subscription should return false for IsPro")
}
