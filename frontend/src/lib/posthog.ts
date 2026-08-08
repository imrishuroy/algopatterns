// PostHog is initialized in instrumentation-client.ts
// This module re-exports posthog for convenience and provides helpers

import posthog from "posthog-js";

export { posthog };

// Check if PostHog is available and initialized
export const isPostHogEnabled = (): boolean => {
  return (
    typeof window !== "undefined" &&
    !!process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
  );
};
