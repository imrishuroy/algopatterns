"use client";

import Link from "next/link";

interface UpgradePromptProps {
  feature?: string;
  title?: string;
  description?: string;
  compact?: boolean;
}

// skipcq: JS-0067
export function UpgradePrompt({
  feature = "this content",
  title,
  description,
  compact = false,
}: UpgradePromptProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-md">
        <div className="text-2xl">🔒</div>
        <div className="flex-1">
          <p className="text-amber-200 text-sm">
            Upgrade to Pro to access {feature}
          </p>
        </div>
        <Link
          href="/pricing"
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-md transition-colors"
        >
          Upgrade
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-800/50 to-gray-900/50 border border-gray-700 rounded-md text-center">
      <div className="text-6xl mb-4">🔒</div>
      <h3 className="text-xl font-bold text-white mb-2">
        {title || "Premium Content"}
      </h3>
      <p className="text-gray-400 mb-6 max-w-md">
        {description ||
          `Upgrade to Pro to unlock ${feature} and get access to all patterns, visualizers, and features.`}
      </p>
      <Link
        href="/pricing"
        className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-md transition-colors"
      >
        Upgrade to Pro
      </Link>
      <p className="mt-4 text-gray-500 text-sm">Starting at just ₹299/month</p>
    </div>
  );
}

export function LockedOverlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="blur-sm pointer-events-none select-none">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center bg-gray-900/60 backdrop-blur-[2px]">
        <UpgradePrompt compact />
      </div>
    </div>
  );
}
