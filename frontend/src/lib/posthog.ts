import posthog from "posthog-js";

let posthogClient: typeof posthog | null = null;

export const initPostHog = (): typeof posthog | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.warn("PostHog API key not configured");
    }
    return null;
  }

  if (!posthogClient) {
    posthog.init(apiKey, {
      api_host: apiHost || "https://us.i.posthog.com",
      capture_pageview: false, // We handle this manually for App Router
      capture_pageleave: true,
      autocapture: true,
      persistence: "localStorage+cookie",
      disable_session_recording: false,
      session_recording: {
        maskAllInputs: true,
        maskTextSelector: "[data-ph-mask]",
      },
      loaded: (ph) => {
        if (process.env.NODE_ENV === "development") {
          ph.debug();
        }
      },
    });
    posthogClient = posthog;
  }

  return posthogClient;
};

export const getPostHogClient = (): typeof posthog | null => {
  return posthogClient;
};
