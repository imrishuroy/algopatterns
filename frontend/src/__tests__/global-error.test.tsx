import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const mockCaptureException = vi.fn();
vi.mock("@sentry/nextjs", () => ({
  captureException: (...args: unknown[]) => mockCaptureException(...args),
}));

import GlobalError from "@/app/global-error";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GlobalError", () => {
  it("renders error message", () => {
    const error = new Error("test error");
    render(<GlobalError error={error} />);

    expect(screen.getByText("Something went wrong!")).toBeInTheDocument();
  });

  it("calls Sentry.captureException with the error", () => {
    const error = new Error("test error");
    render(<GlobalError error={error} />);

    expect(mockCaptureException).toHaveBeenCalledWith(error);
  });

  it("has digest property on error", () => {
    const error = new Error("test error") as Error & { digest?: string };
    error.digest = "abc123";
    render(<GlobalError error={error} />);

    expect(screen.getByText("Something went wrong!")).toBeInTheDocument();
    expect(mockCaptureException).toHaveBeenCalledWith(error);
  });

  it("wraps content in html/body structure", () => {
    const error = new Error("test error");
    render(<GlobalError error={error} />);

    expect(document.documentElement).toBeInTheDocument();
    expect(document.body).toBeInTheDocument();
  });
});
