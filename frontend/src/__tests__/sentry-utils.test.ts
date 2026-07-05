import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@sentry/nextjs", () => {
  const mockCaptureException = vi.fn();
  const mockCaptureMessage = vi.fn();
  const mockWithScope = vi.fn((callback: (scope: unknown) => void) => {
    const mockScope = {
      setTag: vi.fn(),
      setLevel: vi.fn(),
      setExtra: vi.fn(),
    };
    callback(mockScope);
    return mockScope;
  });
  const mockSetUser = vi.fn();
  const mockAddBreadcrumb = vi.fn();
  const mockStartSpan = vi.fn((_options: unknown, callback: () => unknown) =>
    callback()
  );
  const mockSetContext = vi.fn();
  const mockSetTag = vi.fn();
  const mockSetTags = vi.fn();
  const mockGetFeedback = vi.fn();
  const mockLogger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
  const mockMetrics = {
    count: vi.fn(),
    gauge: vi.fn(),
    distribution: vi.fn(),
  };

  return {
    captureException: mockCaptureException,
    captureMessage: mockCaptureMessage,
    withScope: mockWithScope,
    setUser: mockSetUser,
    addBreadcrumb: mockAddBreadcrumb,
    startSpan: mockStartSpan,
    setContext: mockSetContext,
    setTag: mockSetTag,
    setTags: mockSetTags,
    getFeedback: mockGetFeedback,
    logger: mockLogger,
    metrics: mockMetrics,
    Scope: Object,
    SeverityLevel: {},
  };
});

import * as Sentry from "@sentry/nextjs";
import {
  captureError,
  captureMessage,
  setUser,
  addBreadcrumb,
  startSpan,
  startSpanAsync,
  setContext,
  setTag,
  setTags,
  showFeedback,
  trackApiCall,
  trackUserAction,
  trackNavigation,
  logger,
  metrics,
} from "@/lib/sentry";

beforeEach(() => {
  vi.clearAllMocks();
});

const mockSentry = vi.mocked(Sentry);

describe("captureError", () => {
  it("does nothing for null error", () => {
    captureError(null);
    expect(mockSentry.withScope).not.toHaveBeenCalled();
  });

  it("captures Error instance", () => {
    const error = new Error("test error");
    captureError(error);

    expect(mockSentry.withScope).toHaveBeenCalled();
    expect(mockSentry.captureException).toHaveBeenCalledWith(error);
  });

  it("captures non-Error as message", () => {
    captureError("string error");

    expect(mockSentry.withScope).toHaveBeenCalled();
    expect(mockSentry.captureMessage).toHaveBeenCalledWith("string error");
  });

  it("sets tags on scope", () => {
    const error = new Error("test");
    captureError(error, { tags: { service: "api", endpoint: "/users" } });

    expect(mockSentry.withScope).toHaveBeenCalled();
  });

  it("sets extra on scope", () => {
    const error = new Error("test");
    captureError(error, { extra: { userId: "123" } });

    expect(mockSentry.withScope).toHaveBeenCalled();
  });

  it("sets level on scope", () => {
    const error = new Error("test");
    captureError(error, { level: "warning" });

    expect(mockSentry.withScope).toHaveBeenCalled();
  });
});

describe("captureMessage", () => {
  it("captures message with default level", () => {
    captureMessage("test message");

    expect(mockSentry.withScope).toHaveBeenCalled();
    expect(mockSentry.captureMessage).toHaveBeenCalledWith("test message");
  });

  it("captures message with custom level", () => {
    captureMessage("warning message", "warning");

    expect(mockSentry.withScope).toHaveBeenCalled();
  });

  it("captures message with tags", () => {
    captureMessage("test", "info", { tags: { feature: "checkout" } });

    expect(mockSentry.withScope).toHaveBeenCalled();
  });

  it("captures message with extra", () => {
    captureMessage("test", "info", { extra: { orderId: "123" } });

    expect(mockSentry.withScope).toHaveBeenCalled();
  });
});

describe("setUser", () => {
  it("sets user with all fields", () => {
    setUser({ id: "123", email: "test@example.com", username: "testuser" });

    expect(mockSentry.setUser).toHaveBeenCalledWith({
      id: "123",
      email: "test@example.com",
      username: "testuser",
    });
  });

  it("sets user with partial fields", () => {
    setUser({ id: "123" });

    expect(mockSentry.setUser).toHaveBeenCalledWith({
      id: "123",
      email: undefined,
      username: undefined,
    });
  });

  it("clears user when null", () => {
    setUser(null);

    expect(mockSentry.setUser).toHaveBeenCalledWith(null);
  });
});

describe("addBreadcrumb", () => {
  it("adds breadcrumb with all fields", () => {
    addBreadcrumb("http", "API call", { url: "/api/users" }, "info");

    expect(mockSentry.addBreadcrumb).toHaveBeenCalledWith({
      category: "http",
      message: "API call",
      data: { url: "/api/users" },
      level: "info",
    });
  });

  it("adds breadcrumb with default level", () => {
    addBreadcrumb("navigation", "Page viewed");

    expect(mockSentry.addBreadcrumb).toHaveBeenCalledWith({
      category: "navigation",
      message: "Page viewed",
      data: undefined,
      level: "info",
    });
  });
});

describe("startSpan", () => {
  it("starts span and executes callback", () => {
    const callback = vi.fn(() => "result");
    const result = startSpan("test-span", "test.operation", callback);

    expect(mockSentry.startSpan).toHaveBeenCalledWith(
      { name: "test-span", op: "test.operation" },
      callback
    );
    expect(result).toBe("result");
  });
});

describe("startSpanAsync", () => {
  it("starts span and executes async callback", async () => {
    const callback = vi.fn(() => Promise.resolve("async result"));
    const result = await startSpanAsync(
      "async-span",
      "async.operation",
      callback
    );

    expect(mockSentry.startSpan).toHaveBeenCalledWith(
      { name: "async-span", op: "async.operation" },
      callback
    );
    expect(result).toBe("async result");
  });
});

describe("setContext", () => {
  it("sets context", () => {
    setContext("order", { id: "123", total: 99.99 });

    expect(mockSentry.setContext).toHaveBeenCalledWith("order", {
      id: "123",
      total: 99.99,
    });
  });

  it("clears context with null", () => {
    setContext("order", null);

    expect(mockSentry.setContext).toHaveBeenCalledWith("order", null);
  });
});

describe("setTag", () => {
  it("sets single tag", () => {
    setTag("environment", "production");

    expect(mockSentry.setTag).toHaveBeenCalledWith("environment", "production");
  });
});

describe("setTags", () => {
  it("sets multiple tags", () => {
    setTags({ environment: "production", version: "1.0.0" });

    expect(mockSentry.setTags).toHaveBeenCalledWith({
      environment: "production",
      version: "1.0.0",
    });
  });
});

describe("showFeedback", () => {
  it("opens feedback form when available", () => {
    const mockForm = {
      appendToDom: vi.fn(),
      open: vi.fn(),
    };
    const mockCreateForm = vi.fn().mockResolvedValue(mockForm);
    vi.mocked(mockSentry.getFeedback).mockReturnValue({
      createForm: mockCreateForm,
    } as unknown as ReturnType<typeof Sentry.getFeedback>);

    showFeedback();

    expect(mockSentry.getFeedback).toHaveBeenCalled();
    expect(mockCreateForm).toHaveBeenCalled();
  });

  it("handles missing feedback gracefully", () => {
    vi.mocked(mockSentry.getFeedback).mockReturnValue(
      undefined as unknown as ReturnType<typeof Sentry.getFeedback>
    );

    expect(() => showFeedback()).not.toThrow();
  });
});

describe("trackApiCall", () => {
  it("adds breadcrumb for successful API call", () => {
    trackApiCall("/api/users", "GET", 200, 150);

    expect(mockSentry.addBreadcrumb).toHaveBeenCalledWith({
      category: "http",
      message: "GET /api/users",
      data: {
        url: "/api/users",
        method: "GET",
        status_code: 200,
        duration_ms: 150,
      },
      level: "info",
    });
  });

  it("adds error breadcrumb for failed API call", () => {
    trackApiCall("/api/users", "POST", 500, 200);

    expect(mockSentry.addBreadcrumb).toHaveBeenCalledWith({
      category: "http",
      message: "POST /api/users",
      data: {
        url: "/api/users",
        method: "POST",
        status_code: 500,
        duration_ms: 200,
      },
      level: "error",
    });
  });
});

describe("trackUserAction", () => {
  it("adds breadcrumb for user action", () => {
    trackUserAction("clicked_button", { buttonId: "submit" });

    expect(mockSentry.addBreadcrumb).toHaveBeenCalledWith({
      category: "user",
      message: "clicked_button",
      data: { buttonId: "submit" },
      level: "info",
    });
  });

  it("adds breadcrumb without data", () => {
    trackUserAction("page_scrolled");

    expect(mockSentry.addBreadcrumb).toHaveBeenCalledWith({
      category: "user",
      message: "page_scrolled",
      data: undefined,
      level: "info",
    });
  });
});

describe("trackNavigation", () => {
  it("adds navigation breadcrumb", () => {
    trackNavigation("/home", "/dashboard");

    expect(mockSentry.addBreadcrumb).toHaveBeenCalledWith({
      category: "navigation",
      message: "Navigated from /home to /dashboard",
      data: { from: "/home", to: "/dashboard" },
      level: "info",
    });
  });
});

describe("logger", () => {
  it("logs debug message", () => {
    logger.debug("debug message", { key: "value" });

    expect(mockSentry.logger.debug).toHaveBeenCalledWith("debug message", {
      key: "value",
    });
  });

  it("logs info message", () => {
    logger.info("info message");

    expect(mockSentry.logger.info).toHaveBeenCalledWith("info message");
  });

  it("logs warn message", () => {
    logger.warn("warning message");

    expect(mockSentry.logger.warn).toHaveBeenCalledWith("warning message");
  });

  it("logs error message", () => {
    logger.error("error message", { errorCode: "E001" });

    expect(mockSentry.logger.error).toHaveBeenCalledWith("error message", {
      errorCode: "E001",
    });
  });
});

describe("metrics", () => {
  it("counts events", () => {
    metrics.count("button_clicks", 1, { page: "home" });

    expect(mockSentry.metrics.count).toHaveBeenCalledWith("button_clicks", 1, {
      attributes: { page: "home" },
    });
  });

  it("counts with default value", () => {
    metrics.count("page_views");

    expect(mockSentry.metrics.count).toHaveBeenCalledWith("page_views", 1, {
      attributes: undefined,
    });
  });

  it("sets gauge", () => {
    metrics.gauge("queue_size", 42, { queue: "main" });

    expect(mockSentry.metrics.gauge).toHaveBeenCalledWith("queue_size", 42, {
      attributes: { queue: "main" },
    });
  });

  it("records distribution", () => {
    metrics.distribution("response_time", 150.5, { endpoint: "/api" });

    expect(mockSentry.metrics.distribution).toHaveBeenCalledWith(
      "response_time",
      150.5,
      { attributes: { endpoint: "/api" }, unit: undefined }
    );
  });

  it("records distribution with unit", () => {
    metrics.distribution(
      "api_latency",
      200,
      { endpoint: "/api" },
      "millisecond"
    );

    expect(mockSentry.metrics.distribution).toHaveBeenCalledWith(
      "api_latency",
      200,
      { attributes: { endpoint: "/api" }, unit: "millisecond" }
    );
  });
});
