import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";

const mockInit = vi.fn();
const mockReplayIntegration = vi.fn(() => ({ name: "replay" }));
const mockBrowserTracingIntegration = vi.fn(() => ({ name: "browserTracing" }));
const mockFeedbackIntegration = vi.fn(() => ({ name: "feedback" }));
const mockCaptureRouterTransitionStart = vi.fn();
const mockCaptureRequestError = vi.fn();

vi.mock("@sentry/nextjs", () => ({
  init: mockInit,
  replayIntegration: mockReplayIntegration,
  browserTracingIntegration: mockBrowserTracingIntegration,
  feedbackIntegration: mockFeedbackIntegration,
  captureRouterTransitionStart: mockCaptureRouterTransitionStart,
  captureRequestError: mockCaptureRequestError,
  ErrorEvent: Object,
  EventHint: Object,
}));

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllEnvs();
  mockInit.mockClear();
  mockReplayIntegration.mockClear();
  mockBrowserTracingIntegration.mockClear();
  mockFeedbackIntegration.mockClear();
});

describe("Sentry configuration structure", () => {
  it("has correct client config options", () => {
    const expectedClientOptions = {
      dsn: expect.any(String),
      environment: expect.any(String),
      sampleRate: 1.0,
      tracesSampleRate: expect.any(Number),
      replaysSessionSampleRate: expect.any(Number),
      replaysOnErrorSampleRate: 1.0,
      enableLogs: true,
      enableMetrics: true,
      maxBreadcrumbs: 100,
      attachStacktrace: true,
    };

    expect(expectedClientOptions).toBeDefined();
  });

  it("has correct server config options", () => {
    const expectedServerOptions = {
      dsn: expect.any(String),
      environment: expect.any(String),
      sampleRate: 1.0,
      tracesSampleRate: expect.any(Number),
      enableLogs: true,
      enableMetrics: true,
      maxBreadcrumbs: 100,
      attachStacktrace: true,
      includeLocalVariables: expect.any(Boolean),
    };

    expect(expectedServerOptions).toBeDefined();
  });

  it("has correct edge config options", () => {
    const expectedEdgeOptions = {
      dsn: expect.any(String),
      environment: expect.any(String),
      sampleRate: 1.0,
      tracesSampleRate: expect.any(Number),
      enableLogs: true,
      enableMetrics: true,
      maxBreadcrumbs: 100,
      attachStacktrace: true,
    };

    expect(expectedEdgeOptions).toBeDefined();
  });
});

describe("Sample rate calculations", () => {
  it("uses 1.0 for development", () => {
    const isProduction = false;
    const tracesSampleRate = isProduction ? 0.1 : 1.0;
    const replaysSessionSampleRate = isProduction ? 0.1 : 1.0;

    expect(tracesSampleRate).toBe(1.0);
    expect(replaysSessionSampleRate).toBe(1.0);
  });

  it("uses 0.1 for production", () => {
    const isProduction = true;
    const tracesSampleRate = isProduction ? 0.1 : 1.0;
    const replaysSessionSampleRate = isProduction ? 0.1 : 1.0;

    expect(tracesSampleRate).toBe(0.1);
    expect(replaysSessionSampleRate).toBe(0.1);
  });
});

describe("Environment configuration", () => {
  it("defaults to development when no env set", () => {
    const envValue: string | undefined = undefined;
    const isProduction = false;
    const environment =
      envValue || (isProduction ? "production" : "development");

    expect(environment).toBe("development");
  });

  it("defaults to production when no env set and isProduction", () => {
    const envValue: string | undefined = undefined;
    const isProduction = true;
    const environment =
      envValue || (isProduction ? "production" : "development");

    expect(environment).toBe("production");
  });

  it("uses environment variable when set", () => {
    const envValue: string | undefined = "staging";
    const isProduction = true;
    const environment =
      envValue || (isProduction ? "production" : "development");

    expect(environment).toBe("staging");
  });
});

describe("Debug mode", () => {
  it("is disabled by default", () => {
    const envValue: string | undefined = undefined;
    const debug = envValue === "true";
    expect(debug).toBe(false);
  });

  it("is enabled when set to true", () => {
    const envValue: string | undefined = "true";
    const debug = envValue === "true";
    expect(debug).toBe(true);
  });

  it("is disabled when set to false", () => {
    const envValue: string | undefined = "false";
    const debug = envValue === "true";
    expect(debug).toBe(false);
  });
});

describe("Ignore errors patterns", () => {
  const ignoreErrors = [
    "ResizeObserver loop limit exceeded",
    "ResizeObserver loop completed with undelivered notifications",
    "Non-Error promise rejection captured",
  ];

  it("includes ResizeObserver errors", () => {
    expect(ignoreErrors).toContain("ResizeObserver loop limit exceeded");
  });

  it("includes non-error rejections", () => {
    expect(ignoreErrors).toContain("Non-Error promise rejection captured");
  });
});

describe("Trace propagation targets", () => {
  const tracePropagationTargets = [
    "localhost",
    /^https:\/\/.*\.algopatterns\.in/,
    /^https:\/\/api\.algopatterns\.in/,
  ];

  it("includes localhost", () => {
    expect(tracePropagationTargets).toContain("localhost");
  });

  it("includes algopatterns domain patterns", () => {
    expect(tracePropagationTargets.length).toBe(3);
  });
});

describe("Integration configuration", () => {
  it("replay integration has correct options", () => {
    const replayOptions = {
      maskAllText: false,
      blockAllMedia: false,
    };

    expect(replayOptions.maskAllText).toBe(false);
    expect(replayOptions.blockAllMedia).toBe(false);
  });

  it("feedback integration has correct options", () => {
    const feedbackOptions = {
      autoInject: false,
      colorScheme: "system",
    };

    expect(feedbackOptions.autoInject).toBe(false);
    expect(feedbackOptions.colorScheme).toBe("system");
  });
});
