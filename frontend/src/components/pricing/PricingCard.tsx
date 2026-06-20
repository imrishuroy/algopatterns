"use client";

import type { Plan } from "@/types";

// Plan hierarchy for upgrade logic (higher = better)
const PLAN_RANK: Record<string, number> = {
  free: 0,
  pro_monthly: 1,
  pro_yearly: 2,
  pro_lifetime: 3,
};

interface PricingCardProps {
  plan: Plan;
  isCurrentPlan?: boolean;
  currentPlanId?: string;
  onSelect: (plan: Plan) => void;
  isLoading?: boolean;
}

export function PricingCard({
  plan,
  isCurrentPlan,
  currentPlanId,
  onSelect,
  isLoading,
}: PricingCardProps) {
  const currentRank = PLAN_RANK[currentPlanId || "free"] ?? 0;
  const planRank = PLAN_RANK[plan.id] ?? 0;
  const canUpgrade = planRank > currentRank;
  const isDowngrade = planRank < currentRank && planRank > 0;
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: plan.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount / 100);
  };

  const getBillingLabel = () => {
    switch (plan.billing_period) {
      case "monthly":
        return "/month";
      case "yearly":
        return "/year";
      case "lifetime":
        return " one-time";
      default:
        return "";
    }
  };

  return (
    <div
      className={`relative rounded-2xl p-6 flex flex-col h-full ${
        plan.is_recommended
          ? "bg-gradient-to-b from-emerald-500/10 to-emerald-500/5 border-2 border-emerald-500"
          : "bg-gray-800/50 border border-gray-700"
      }`}
    >
      {plan.is_recommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
            Most Popular
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
        {plan.description && (
          <p className="text-gray-400 text-sm">{plan.description}</p>
        )}
      </div>

      <div className="text-center mb-6">
        {plan.original_price && plan.original_price > plan.price && (
          <div className="text-gray-500 line-through text-lg">
            {formatPrice(plan.original_price)}
          </div>
        )}
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl font-bold text-white">
            {formatPrice(plan.price)}
          </span>
          <span className="text-gray-400">{getBillingLabel()}</span>
        </div>
        {plan.savings_percentage && plan.savings_percentage > 0 && (
          <div className="mt-2">
            <span className="bg-emerald-500/20 text-emerald-400 text-sm px-2 py-1 rounded">
              Save {plan.savings_percentage}%
            </span>
          </div>
        )}
      </div>

      <ul className="space-y-3 mb-6 flex-grow">
        <FeatureItem
          included={plan.features.max_patterns === -1}
          text={
            plan.features.max_patterns === -1
              ? "All patterns"
              : `${plan.features.max_patterns} patterns`
          }
        />
        <FeatureItem
          included={plan.features.max_visualizers === -1}
          text={
            plan.features.max_visualizers === -1
              ? "All visualizers"
              : `${plan.features.max_visualizers} visualizers`
          }
        />
        <FeatureItem
          included={plan.features.has_quiz_history}
          text="Quiz history"
        />
        <FeatureItem
          included={plan.features.has_code_playground}
          text="Code playground"
        />
        <FeatureItem
          included={plan.features.has_progress_sync}
          text="Progress sync"
        />
        <FeatureItem
          included={plan.features.has_highlighting}
          text="Highlighting"
        />
        <FeatureItem
          included={plan.features.has_solutions_access}
          text="Solutions access"
        />
      </ul>

      <div className="mt-auto">
        {plan.id !== "free" ? (
          <p className="text-center text-emerald-400 text-sm mb-4">
            All future updates included
          </p>
        ) : (
          <div className="h-6 mb-4" />
        )}

        <button
        onClick={() => onSelect(plan)}
        disabled={isCurrentPlan || isLoading || isDowngrade}
        className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
          isCurrentPlan
            ? "bg-gray-700 text-gray-400 cursor-not-allowed"
            : isDowngrade
              ? "bg-gray-800 text-gray-500 cursor-not-allowed"
              : plan.is_recommended
                ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                : "bg-gray-700 hover:bg-gray-600 text-white"
        }`}
      >
        {isCurrentPlan
          ? "Current Plan"
          : isLoading
            ? "Loading..."
            : isDowngrade
              ? "Current plan is better"
              : plan.id === "free"
                ? "Get Started"
                : canUpgrade
                  ? "Upgrade Now"
                  : "Get Started"}
        </button>
      </div>
    </div>
  );
}

function FeatureItem({ included, text }: { included: boolean; text: string }) {
  return (
    <li className="flex items-center gap-3">
      {included ? (
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
      ) : (
        <span className="w-1.5 h-1.5 rounded-full bg-gray-600 flex-shrink-0" />
      )}
      <span className={included ? "text-gray-300" : "text-gray-500"}>
        {text}
      </span>
    </li>
  );
}
