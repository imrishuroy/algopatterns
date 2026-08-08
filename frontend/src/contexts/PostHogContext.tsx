"use client";

import { useEffect, createContext, useContext, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import posthog from "posthog-js";
import { isPostHogEnabled } from "@/lib/posthog";

interface PostHogContextType {
  isInitialized: boolean;
}

const PostHogContext = createContext<PostHogContextType>({
  isInitialized: false,
});

// skipcq: JS-0067
export function PostHogProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Capture pageviews on route change
  useEffect(() => {
    if (isPostHogEnabled() && pathname) {
      let url = window.origin + pathname;
      if (searchParams?.toString()) {
        url = url + "?" + searchParams.toString();
      }
      posthog.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams]);

  if (!isPostHogEnabled()) {
    return <>{children}</>;
  }

  return (
    <PHProvider client={posthog}>
      <PostHogContext.Provider value={{ isInitialized: true }}>
        {children}
      </PostHogContext.Provider>
    </PHProvider>
  );
}

export const usePostHogContext = () => useContext(PostHogContext);
