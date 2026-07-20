"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { PricingCard } from "@/components/pricing/PricingCard";
import { CheckoutModal } from "@/components/pricing/CheckoutModal";
import type { Plan } from "@/types";

const FEATURE_ICONS = {
  patterns: (
    <svg
      className="w-10 h-10"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
      />
    </svg>
  ),
  visualizers: (
    <svg
      className="w-10 h-10"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  solutions: (
    <svg
      className="w-10 h-10"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
      />
    </svg>
  ),
};

type FeatureIconType = keyof typeof FEATURE_ICONS;

function FeatureHighlight({
  icon,
  title,
  description,
}: {
  icon: FeatureIconType;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-md bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 mb-4">
        {FEATURE_ICONS[icon]}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}

function SuccessModal({ onClose }: { onClose: () => void }) {
  // skipcq: JS-0067
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-gray-900 rounded-md p-8 w-full max-w-md mx-4 border border-gray-700 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-white mb-2">Welcome to Pro!</h2>
        <p className="text-gray-400 mb-6">
          Your subscription is now active. Enjoy unlimited access to all
          patterns and features.
        </p>
        <button
          onClick={onClose}
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-md"
        >
          Start Learning
        </button>
      </div>
    </div>
  );
}

function PageHeader() {
  // skipcq: JS-0067
  return (
    <div className="text-center mb-8 md:mb-12">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
        Choose Your Plan
      </h1>
      <p className="text-gray-400 text-lg max-w-2xl mx-auto">
        Unlock all patterns, visualizers, and features to accelerate your DSA
        learning journey
      </p>
    </div>
  );
}

function WhyUpgradeSection() {
  // skipcq: JS-0067
  return (
    <div className="text-center">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">
        Why Upgrade to Pro?
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
        <FeatureHighlight
          icon="patterns"
          title="All Patterns"
          description="Access every DSA pattern with detailed explanations and code"
        />
        <FeatureHighlight
          icon="visualizers"
          title="Interactive Visualizers"
          description="Understand algorithms with step-by-step animations"
        />
        <FeatureHighlight
          icon="solutions"
          title="Complete Solutions"
          description="Learn from expert solutions with multiple approaches"
        />
      </div>
    </div>
  );
}

function LifetimePromise() {
  // skipcq: JS-0067
  return (
    <div className="mt-10 md:mt-16 text-center">
      <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-md p-6 md:p-8 max-w-2xl mx-auto">
        <h3 className="text-xl font-bold text-white mb-2">
          Lifetime Access Promise
        </h3>
        <p className="text-gray-400">
          Get the lifetime plan and receive all future updates, new patterns,
          and features at no additional cost. Your one-time investment keeps
          growing in value.
        </p>
      </div>
    </div>
  );
}

export default function PricingPage() {
  // skipcq: JS-0067
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
    return (
      (order[a.id as keyof typeof order] ?? 99) -
      (order[b.id as keyof typeof order] ?? 99)
    );
  });

  return (
    <div className="min-h-screen py-8 md:py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <PageHeader />

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

        <WhyUpgradeSection />
        <LifetimePromise />
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

      {showSuccessModal && <SuccessModal onClose={handleCloseSuccessModal} />}
    </div>
  );
}
