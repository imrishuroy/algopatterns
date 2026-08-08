import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";

// Mock state - must be declared before vi.mock calls
let mockPathname: string | null = "/test-path";
let mockSearchParams: { toString: () => string } | null = null;
let mockIsEnabled = false;

vi.mock("posthog-js", () => ({
  default: {
    capture: vi.fn(),
    identify: vi.fn(),
    reset: vi.fn(),
  },
}));

vi.mock("posthog-js/react", () => ({
  PostHogProvider: ({ children }: { children: ReactNode }) => (
    <div data-testid="ph-provider">{children}</div>
  ),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
}));

vi.mock("@/lib/posthog", () => ({
  isPostHogEnabled: () => mockIsEnabled,
}));

// Import after mocks are set up
import posthog from "posthog-js";
import { PostHogProvider, usePostHogContext } from "@/contexts/PostHogContext";

describe("PostHogProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsEnabled = false;
    mockPathname = "/test-path";
    mockSearchParams = null;

    // Mock window.origin
    Object.defineProperty(window, "origin", {
      value: "http://localhost:3000",
      writable: true,
    });
  });

  it("renders children when PostHog is disabled", () => {
    mockIsEnabled = false;

    render(
      <PostHogProvider>
        <div data-testid="child">Test Child</div>
      </PostHogProvider>
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    // Should not render the PostHog provider wrapper
    expect(screen.queryByTestId("ph-provider")).not.toBeInTheDocument();
  });

  it("renders children with PostHog provider when enabled", () => {
    mockIsEnabled = true;

    render(
      <PostHogProvider>
        <div data-testid="child">Test Child</div>
      </PostHogProvider>
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByTestId("ph-provider")).toBeInTheDocument();
  });

  it("captures pageview when PostHog is enabled and pathname exists", () => {
    mockIsEnabled = true;
    mockPathname = "/patterns";

    render(
      <PostHogProvider>
        <div>Test</div>
      </PostHogProvider>
    );

    expect(posthog.capture).toHaveBeenCalledWith("$pageview", {
      $current_url: "http://localhost:3000/patterns",
    });
  });

  it("captures pageview with search params when present", () => {
    mockIsEnabled = true;
    mockPathname = "/search";
    mockSearchParams = {
      toString: () => "q=test&page=1",
    };

    render(
      <PostHogProvider>
        <div>Test</div>
      </PostHogProvider>
    );

    expect(posthog.capture).toHaveBeenCalledWith("$pageview", {
      $current_url: "http://localhost:3000/search?q=test&page=1",
    });
  });

  it("does not capture pageview when PostHog is disabled", () => {
    mockIsEnabled = false;

    render(
      <PostHogProvider>
        <div>Test</div>
      </PostHogProvider>
    );

    expect(posthog.capture).not.toHaveBeenCalled();
  });

  it("does not capture pageview when pathname is null", () => {
    mockIsEnabled = true;
    mockPathname = null;

    render(
      <PostHogProvider>
        <div>Test</div>
      </PostHogProvider>
    );

    expect(posthog.capture).not.toHaveBeenCalled();
  });

  it("handles empty search params string", () => {
    mockIsEnabled = true;
    mockPathname = "/page";
    mockSearchParams = {
      toString: () => "",
    };

    render(
      <PostHogProvider>
        <div>Test</div>
      </PostHogProvider>
    );

    expect(posthog.capture).toHaveBeenCalledWith("$pageview", {
      $current_url: "http://localhost:3000/page",
    });
  });
});

describe("usePostHogContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns isInitialized as false when PostHog is disabled", () => {
    mockIsEnabled = false;

    const wrapper = ({ children }: { children: ReactNode }) => (
      <PostHogProvider>{children}</PostHogProvider>
    );

    const { result } = renderHook(() => usePostHogContext(), { wrapper });

    expect(result.current.isInitialized).toBe(false);
  });

  it("returns isInitialized as true when PostHog is enabled", () => {
    mockIsEnabled = true;

    const wrapper = ({ children }: { children: ReactNode }) => (
      <PostHogProvider>{children}</PostHogProvider>
    );

    const { result } = renderHook(() => usePostHogContext(), { wrapper });

    expect(result.current.isInitialized).toBe(true);
  });

  it("returns default context value when used outside provider", () => {
    const { result } = renderHook(() => usePostHogContext());

    expect(result.current.isInitialized).toBe(false);
  });
});
