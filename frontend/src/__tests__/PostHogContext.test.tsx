import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { PostHogProvider } from "@/contexts/PostHogContext";

vi.mock("@/lib/posthog", () => ({
  initPostHog: vi.fn(() => null),
  getPostHogClient: vi.fn(() => null),
}));

vi.mock("posthog-js/react", () => ({
  PostHogProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="posthog-provider">{children}</div>
  ),
}));

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/test-path"),
  useSearchParams: vi.fn(() => null),
}));

describe("PostHogProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders children without crashing", () => {
    render(
      <PostHogProvider>
        <div data-testid="child">Test Child</div>
      </PostHogProvider>
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});
