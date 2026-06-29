"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const {
    subscription,
    isPro,
    features,
    isLoading: subLoading,
    cancelSubscription,
  } = useSubscription();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelFeedback, setCancelFeedback] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/account");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    setCancelError(null);

    const result = await cancelSubscription(cancelReason, cancelFeedback);

    if (result.success) {
      setShowCancelModal(false);
      setCancelReason("");
      setCancelFeedback("");
    } else {
      setCancelError(result.error || "Failed to cancel subscription");
    }

    setIsCancelling(false);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getPlanDisplayName = (planId?: string) => {
    switch (planId) {
      case "pro_monthly":
        return "Pro Monthly";
      case "pro_yearly":
        return "Pro Yearly";
      case "pro_lifetime":
        return "Pro Lifetime";
      default:
        return "Free";
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Dashboard</span>
          </Link>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8">Account Settings</h1>

        {/* Profile Section */}
        <section className="bg-gray-900 border border-gray-800 rounded-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Profile</h2>
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-800 gap-1">
              <span className="text-gray-400">Name</span>
              <span className="text-white break-all">{user?.name || "Not set"}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-800 gap-1">
              <span className="text-gray-400">Email</span>
              <span className="text-white break-all">{user?.email}</span>
            </div>
          </div>
        </section>

        {/* Subscription Section */}
        <section className="bg-gray-900 border border-gray-800 rounded-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Subscription</h2>
            {isPro && (
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-sm font-medium rounded-full">
                Active
              </span>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <span className="text-gray-400">Current Plan</span>
              <span className="text-white font-medium">
                {getPlanDisplayName(subscription?.plan_id)}
              </span>
            </div>

            {subscription?.current_period_start && (
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-gray-400">Started</span>
                <span className="text-white">
                  {formatDate(subscription.current_period_start)}
                </span>
              </div>
            )}

            {subscription?.current_period_end &&
              subscription.plan_id !== "pro_lifetime" && (
                <div className="flex justify-between items-center py-2 border-b border-gray-800">
                  <span className="text-gray-400">
                    {subscription.cancel_at_period_end
                      ? "Access ends"
                      : "Renews on"}
                  </span>
                  <span className="text-white">
                    {formatDate(subscription.current_period_end)}
                  </span>
                </div>
              )}

            {subscription?.cancel_at_period_end && (
              <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-md">
                <p className="text-amber-400 text-sm">
                  Your subscription has been cancelled and will end on{" "}
                  {formatDate(subscription.current_period_end)}. You will
                  continue to have access until then.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {!isPro && (
              <Link
                href="/pricing"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-md transition-colors"
              >
                Upgrade to Pro
              </Link>
            )}

            {isPro &&
              !subscription?.cancel_at_period_end &&
              subscription?.plan_id !== "pro_lifetime" && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-md transition-colors"
                >
                  Cancel Subscription
                </button>
              )}

            {subscription?.plan_id === "pro_lifetime" && (
              <span className="px-4 py-2 text-emerald-400 text-sm">
                Lifetime access - no renewal required
              </span>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-gray-900 border border-gray-800 rounded-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Your Features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FeatureItem
              label="Patterns"
              value={
                features.max_patterns === -1
                  ? "Unlimited"
                  : `${features.max_patterns} patterns`
              }
              enabled={features.max_patterns !== 0}
            />
            <FeatureItem
              label="Visualizers"
              value={
                features.max_visualizers === -1
                  ? "Unlimited"
                  : `${features.max_visualizers} visualizers`
              }
              enabled={features.max_visualizers !== 0}
            />
            <FeatureItem
              label="Quiz Questions"
              value={
                features.quiz_questions_per_pattern === -1
                  ? "Unlimited"
                  : `${features.quiz_questions_per_pattern} per pattern`
              }
              enabled={features.quiz_questions_per_pattern !== 0}
            />
            <FeatureItem
              label="Quiz History"
              value={features.has_quiz_history ? "Enabled" : "Not available"}
              enabled={features.has_quiz_history}
            />
            <FeatureItem
              label="Solutions Access"
              value={features.has_solutions_access ? "Enabled" : "Not available"}
              enabled={features.has_solutions_access}
            />
            <FeatureItem
              label="Highlighting"
              value={features.has_highlighting ? "Enabled" : "Not available"}
              enabled={features.has_highlighting}
            />
            <FeatureItem
              label="Code Playground"
              value={features.has_code_playground ? "Enabled" : "Not available"}
              enabled={features.has_code_playground}
            />
            <FeatureItem
              label="Progress Sync"
              value={features.has_progress_sync ? "Enabled" : "Not available"}
              enabled={features.has_progress_sync}
            />
          </div>
        </section>

        {/* Logout */}
        <section className="text-center">
          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </section>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCancelModal(false)}
          />
          <div className="relative bg-gray-900 rounded-md p-6 w-full max-w-md mx-4 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">
              Cancel Subscription
            </h2>
            <p className="text-gray-400 mb-4">
              We&apos;re sorry to see you go. Your access will continue until{" "}
              {formatDate(subscription?.current_period_end)}.
            </p>

            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">
                Reason for cancelling
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">Select a reason</option>
                <option value="too_expensive">Too expensive</option>
                <option value="not_using">Not using it enough</option>
                <option value="found_alternative">Found an alternative</option>
                <option value="missing_features">Missing features</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">
                Additional feedback (optional)
              </label>
              <textarea
                value={cancelFeedback}
                onChange={(e) => setCancelFeedback(e.target.value)}
                placeholder="Tell us how we can improve..."
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 resize-none"
                rows={3}
              />
            </div>

            {cancelError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-400 text-sm">
                {cancelError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md transition-colors"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={isCancelling}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-md transition-colors"
              >
                {isCancelling ? "Cancelling..." : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FeatureItem({
  label,
  value,
  enabled,
}: {
  label: string;
  value: string;
  enabled: boolean;
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-md">
      <div
        className={`w-2 h-2 rounded-full ${
          enabled ? "bg-emerald-500" : "bg-gray-600"
        }`}
      />
      <div>
        <div className="text-sm text-gray-400">{label}</div>
        <div className={`text-sm ${enabled ? "text-white" : "text-gray-500"}`}>
          {value}
        </div>
      </div>
    </div>
  );
}
