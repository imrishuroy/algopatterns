"use client";

import { useEffect, createContext, useContext, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { initPostHog, getPostHogClient } from "@/lib/posthog";

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

  useEffect(() => {
    initPostHog();
  }, []);

  useEffect(() => {
    const client = getPostHogClient();
    if (client && pathname) {
      let url = window.origin + pathname;
      if (searchParams?.toString()) {
        url = url + "?" + searchParams.toString();
      }
      client.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams]);

  const client = getPostHogClient();

  if (!client) {
    return <>{children}</>;
  }

  return (
    <PHProvider client={client}>
      <PostHogContext.Provider value={{ isInitialized: true }}>
        {children}
      </PostHogContext.Provider>
    </PHProvider>
  );
}

export const usePostHogContext = () => useContext(PostHogContext);
