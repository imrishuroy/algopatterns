import * as Sentry from "@sentry/nextjs";

const isProduction = process.env.NODE_ENV === "production";
const release = process.env.SENTRY_RELEASE || process.env.NEXT_PUBLIC_GIT_TAG || process.env.NEXT_PUBLIC_GIT_COMMIT;

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  environment: process.env.SENTRY_ENVIRONMENT || (isProduction ? "production" : "development"),
  release,

  debug: process.env.SENTRY_DEBUG === "true",

  sampleRate: 1.0,
  tracesSampleRate: isProduction ? 0.1 : 1.0,

  enableLogs: true,
  enableMetrics: true,

  maxBreadcrumbs: 100,
  attachStacktrace: true,

  includeLocalVariables: !isProduction,

  tracePropagationTargets: [
    "localhost",
    /^https:\/\/.*\.algopatterns\.in/,
    /^https:\/\/api\.algopatterns\.in/,
  ],

  ignoreErrors: [
    "ECONNREFUSED",
    "ENOTFOUND",
    "ETIMEDOUT",
  ],

  beforeSend(event: Sentry.ErrorEvent) {
    return event;
  },
});
