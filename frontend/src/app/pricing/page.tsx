"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { PricingCard } from "@/components/pricing/PricingCard";
import { CheckoutModal } from "@/components/pricing/CheckoutModal";
import type { Plan } from "@/types";

export default function PricingPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { plans, subscription, isLoading, refreshSubscription } =
    useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSelectPlan = (plan: Plan) => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/pricing");
      return;
    }

    if (plan.id === "free") {
      return;
    }

    setSelectedPlan(plan);
  };

  const handleCheckoutSuccess = async () => {
    setSelectedPlan(null);
    setShowSuccessModal(true);
    await refreshSubscription();
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading plans...</div>
      </div>
    );
  }

  const sortedPlans = [...plans].sort((a, b) => {
    const order = { pro_monthly: 0, pro_yearly: 1, pro_lifetime: 2, free: 3 };
    return (order[a.id as keyof typeof order] ?? 99) - (order[b.id as keyof typeof order] ?? 99);
  });

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Unlock all patterns, visualizers, and features to accelerate your
            DSA learning journey
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {sortedPlans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              isCurrentPlan={subscription?.plan_id === plan.id}
              currentPlanId={subscription?.plan_id}
              onSelect={handleSelectPlan}
            />
          ))}
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-6">
            Why Upgrade to Pro?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <FeatureHighlight
              icon="📚"
              title="All Patterns"
              description="Access every DSA pattern with detailed explanations and code"
            />
            <FeatureHighlight
              icon="🎯"
              title="Interactive Visualizers"
              description="Understand algorithms with step-by-step animations"
            />
            <FeatureHighlight
              icon="💡"
              title="Complete Solutions"
              description="Learn from expert solutions with multiple approaches"
            />
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-2">
              Lifetime Access Promise
            </h3>
            <p className="text-gray-400">
              Get the lifetime plan and receive all future updates, new
              patterns, and features at no additional cost. Your one-time
              investment keeps growing in value.
            </p>
          </div>
        </div>
      </div>

      {selectedPlan && (
        <CheckoutModal
          plan={selectedPlan}
          isOpen={!!selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onSuccess={handleCheckoutSuccess}
          userEmail={user?.email}
          userName={user?.name}
        />
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-gray-900 rounded-2xl p-8 w-full max-w-md mx-4 border border-gray-700 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Welcome to Pro!
            </h2>
            <p className="text-gray-400 mb-6">
              Your subscription is now active. Enjoy unlimited access to all
              patterns and features.
            </p>
            <button
              onClick={handleCloseSuccessModal}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg"
            >
              Start Learning
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FeatureHighlight({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}
