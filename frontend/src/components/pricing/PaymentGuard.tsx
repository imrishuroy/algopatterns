"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import type { PlanFeatures } from "@/types";

interface PaymentGuardProps {
  feature: keyof PlanFeatures;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Determines if user has access to a specific feature based on their subscription.
 * For numeric features (max_patterns, max_visualizers, quiz_questions_per_pattern):
 *   - -1 means unlimited access
 *   - 0 means no access
 *   - >0 means limited access (considered "has access" for guard purposes)
 * For boolean features: true means access, false means no access.
 */
function hasFeatureAccess(
  features: PlanFeatures,
  feature: keyof PlanFeatures
): boolean {
  const value = features[feature];
  if (typeof value === "boolean") {
    return value;
  }
  // For numeric features, -1 = unlimited, 0 = none, >0 = limited access
  return value !== 0;
}

/**
 * Returns a human-readable description for each feature.
 */
function getFeatureDescription(feature: keyof PlanFeatures): string {
  // skipcq: JS-0067
  const descriptions: Record<keyof PlanFeatures, string> = {
    max_patterns: "Access all algorithm patterns and their detailed tutorials.",
    max_visualizers:
      "Use interactive visualizers to understand algorithms better.",
    quiz_questions_per_pattern:
      "Test your knowledge with quizzes for each pattern.",
    has_quiz_history: "Track your quiz performance and review past attempts.",
    has_code_playground:
      "Practice coding with our interactive code playground.",
    has_progress_sync: "Sync your learning progress across all devices.",
    has_highlighting: "Highlight and annotate content for better note-taking.",
    has_solutions_access:
      "Get detailed solutions and explanations for all problems.",
    has_offline_export: "Export content for offline learning.",
  };
  return descriptions[feature];
}

/**
 * PaymentGuard component wraps premium content and shows a blurred overlay
 * with an upgrade prompt for users who don't have access to the feature.
 */
export function PaymentGuard({
  // skipcq: JS-0067
  feature,
  children,
  fallback,
}: PaymentGuardProps) {
  const { features, isLoading } = useSubscription();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-3 text-gray-400">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // If user has access, render children normally
  if (hasFeatureAccess(features, feature)) {
    return <>{children}</>;
  }

  // If custom fallback provided, use it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default: show blurred content with upgrade overlay
  return (
    <div className="relative">
      {/* Blurred content */}
      <div
        className="blur-sm pointer-events-none select-none"
        aria-hidden="true"
      >
        {children}
      </div>

      {/* Overlay with upgrade prompt */}
      <div className="absolute inset-0 flex items-center justify-center bg-gray-900/70 backdrop-blur-[2px] rounded-md">
        <div className="flex flex-col items-center text-center p-6 max-w-sm">
          {/* Lock icon */}
          <div className="w-12 h-12 mb-4 flex items-center justify-center bg-gray-800 rounded-full border border-gray-700">
            <svg
              className="w-6 h-6 text-emerald-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-white mb-2">Premium Feature</h3>

          {/* Description */}
          <p className="text-gray-400 text-sm mb-5">
            {getFeatureDescription(feature)}
          </p>

          {/* Upgrade button */}
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-md transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
            Upgrade to Pro
          </Link>
        </div>
      </div>
    </div>
  );
}
