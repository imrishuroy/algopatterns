import { describe, it, expect, vi, afterEach } from "vitest";

const mockInit = vi.fn();
const mockReplayIntegration = vi.fn(() => ({ name: "replay" }));
const mockCaptureRouterTransitionStart = vi.fn();
const mockCaptureRequestError = vi.fn();

vi.mock("@sentry/nextjs", () => ({
  init: mockInit,
  replayIntegration: mockReplayIntegration,
  captureRouterTransitionStart: mockCaptureRouterTransitionStart,
  captureRequestError: mockCaptureRequestError,
}));

afterEach(() => {
  vi.unstubAllEnvs();
  mockInit.mockClear();
});

describe("instrumentation", () => {
  it("exports register function and onRequestError", async () => {
    vi.stubEnv("NODE_ENV", "production");

    const mod = await import("../../instrumentation");

    expect(mod.register).toBeInstanceOf(Function);
    expect(mod.onRequestError).toBe(mockCaptureRequestError);
  });
});

describe("sentry.server.config", () => {
  it("calls Sentry.init with server DSN and dev sample rate", async () => {
    vi.stubEnv("SENTRY_DSN", "https://key@o123.ingest.sentry.io/456");
    vi.stubEnv("NODE_ENV", "development");

    await import("../../sentry.server.config");

    expect(mockInit).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: "https://key@o123.ingest.sentry.io/456",
        tracesSampleRate: 1.0,
        enableLogs: true,
      }),
    );
  });
});

describe("sentry.edge.config", () => {
  it("calls Sentry.init with edge DSN from env", async () => {
    vi.stubEnv("SENTRY_DSN", "https://key@o123.ingest.sentry.io/456");

    await import("../../sentry.edge.config");

    expect(mockInit).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: "https://key@o123.ingest.sentry.io/456",
        enableLogs: true,
      }),
    );
  });
});

describe("instrumentation-client", () => {
  it("initializes Sentry with public DSN and replay integration", async () => {
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", "https://pubkey@o123.ingest.sentry.io/456");

    const mod = await import("../../instrumentation-client");

    expect(mockInit).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: "https://pubkey@o123.ingest.sentry.io/456",
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
        enableLogs: true,
        integrations: [{ name: "replay" }],
      }),
    );
    expect(mod.onRouterTransitionStart).toBe(mockCaptureRouterTransitionStart);
  });
});
