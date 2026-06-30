import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const mockCaptureException = vi.fn();
const mockWithScope = vi.fn((callback: (scope: unknown) => void) => {
  const mockScope = {
    setTag: vi.fn(),
    setLevel: vi.fn(),
    setExtra: vi.fn(),
  };
  callback(mockScope);
});
const mockGetFeedback = vi.fn();

vi.mock("@sentry/nextjs", () => ({
  captureException: (...args: unknown[]) => mockCaptureException(...args),
  withScope: (callback: (scope: unknown) => void) => mockWithScope(callback),
  getFeedback: () => mockGetFeedback(),
  Scope: Object,
}));

import GlobalError from "@/app/global-error";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GlobalError", () => {
  const mockReset = vi.fn();

  beforeEach(() => {
    mockReset.mockClear();
  });

  it("renders error message", () => {
    const error = new Error("test error");
    render(<GlobalError error={error} reset={mockReset} />);

    expect(screen.getByText("Something went wrong!")).toBeInTheDocument();
  });

  it("renders description text", () => {
    const error = new Error("test error");
    render(<GlobalError error={error} reset={mockReset} />);

    expect(screen.getByText("An unexpected error occurred. Our team has been notified.")).toBeInTheDocument();
  });

  it("calls Sentry.withScope and captureException with the error", () => {
    const error = new Error("test error");
    render(<GlobalError error={error} reset={mockReset} />);

    expect(mockWithScope).toHaveBeenCalled();
    expect(mockCaptureException).toHaveBeenCalledWith(error);
  });

  it("sets error_boundary tag and fatal level", () => {
    const error = new Error("test error");
    render(<GlobalError error={error} reset={mockReset} />);

    expect(mockWithScope).toHaveBeenCalled();
    const scopeCallback = mockWithScope.mock.calls[0][0];
    const mockScope = {
      setTag: vi.fn(),
      setLevel: vi.fn(),
      setExtra: vi.fn(),
    };
    scopeCallback(mockScope);

    expect(mockScope.setTag).toHaveBeenCalledWith("error_boundary", "global");
    expect(mockScope.setLevel).toHaveBeenCalledWith("fatal");
  });

  it("sets digest as extra when present", () => {
    const error = new Error("test error") as Error & { digest?: string };
    error.digest = "abc123";
    render(<GlobalError error={error} reset={mockReset} />);

    expect(mockWithScope).toHaveBeenCalled();
    const scopeCallback = mockWithScope.mock.calls[0][0];
    const mockScope = {
      setTag: vi.fn(),
      setLevel: vi.fn(),
      setExtra: vi.fn(),
    };
    scopeCallback(mockScope);

    expect(mockScope.setExtra).toHaveBeenCalledWith("digest", "abc123");
  });

  it("renders Try again button that calls reset", () => {
    const error = new Error("test error");
    render(<GlobalError error={error} reset={mockReset} />);

    const tryAgainButton = screen.getByText("Try again");
    expect(tryAgainButton).toBeInTheDocument();

    fireEvent.click(tryAgainButton);
    expect(mockReset).toHaveBeenCalled();
  });

  it("renders Report feedback button", () => {
    const error = new Error("test error");
    render(<GlobalError error={error} reset={mockReset} />);

    const feedbackButton = screen.getByText("Report feedback");
    expect(feedbackButton).toBeInTheDocument();
  });

  it("opens feedback form when Report feedback is clicked", () => {
    const mockForm = {
      appendToDom: vi.fn(),
      open: vi.fn(),
    };
    const mockCreateForm = vi.fn().mockResolvedValue(mockForm);
    mockGetFeedback.mockReturnValue({
      createForm: mockCreateForm,
    });

    const error = new Error("test error");
    render(<GlobalError error={error} reset={mockReset} />);

    const feedbackButton = screen.getByText("Report feedback");
    fireEvent.click(feedbackButton);

    expect(mockGetFeedback).toHaveBeenCalled();
    expect(mockCreateForm).toHaveBeenCalled();
  });

  it("handles missing feedback integration gracefully", () => {
    mockGetFeedback.mockReturnValue(null);

    const error = new Error("test error");
    render(<GlobalError error={error} reset={mockReset} />);

    const feedbackButton = screen.getByText("Report feedback");
    expect(() => fireEvent.click(feedbackButton)).not.toThrow();
  });

  it("wraps content in html/body structure", () => {
    const error = new Error("test error");
    render(<GlobalError error={error} reset={mockReset} />);

    expect(document.documentElement).toBeInTheDocument();
    expect(document.body).toBeInTheDocument();
  });
});
