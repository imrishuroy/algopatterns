"use client";

import { useState, useEffect, startTransition } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    startTransition(() => {
      setMatches(media.matches);
    });

    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

export function useIsMobile(): boolean {
  return !useMediaQuery("(min-width: 1280px)");
}

export function useIsTablet(): boolean {
  const isMd = useMediaQuery("(min-width: 768px)");
  const isLg = useMediaQuery("(min-width: 1024px)");
  return isMd && !isLg;
}

export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1024px)");
}
