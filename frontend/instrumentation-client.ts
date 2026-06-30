import * as Sentry from "@sentry/nextjs";

const isProduction = process.env.NODE_ENV === "production";
const release = process.env.NEXT_PUBLIC_SENTRY_RELEASE || process.env.NEXT_PUBLIC_GIT_TAG || process.env.NEXT_PUBLIC_GIT_COMMIT;

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || (isProduction ? "production" : "development"),
  release,

  debug: process.env.NEXT_PUBLIC_SENTRY_DEBUG === "true",

  sampleRate: 1.0,
  tracesSampleRate: isProduction ? 0.1 : 1.0,

  replaysSessionSampleRate: isProduction ? 0.1 : 1.0,
  replaysOnErrorSampleRate: 1.0,

  enableLogs: true,
  enableMetrics: true,

  maxBreadcrumbs: 100,
  attachStacktrace: true,

  tracePropagationTargets: [
    "localhost",
    /^https:\/\/.*\.algopatterns\.in/,
    /^https:\/\/api\.algopatterns\.in/,
  ],

  ignoreErrors: [
    "ResizeObserver loop limit exceeded",
    "ResizeObserver loop completed with undelivered notifications",
    "Non-Error promise rejection captured",
    /^Loading chunk .* failed/,
    /^Network request failed/,
  ],

  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
    Sentry.browserTracingIntegration(),
    Sentry.feedbackIntegration({
      autoInject: false,
      colorScheme: "system",
    }),
  ],

  beforeSend(event: Sentry.ErrorEvent) {
    return event;
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
