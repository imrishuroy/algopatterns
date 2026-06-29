// skipcq: JS-0067 — Next.js page component convention
"use client";

import * as Sentry from "@sentry/nextjs";

export default function SentryExamplePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Sentry Test Page</h1>
      <button
        className="rounded bg-red-600 px-4 py-2 text-white"
        onClick={() => {
          throw new Error("Sentry Test Error from browser");
        }}
      >
        Throw Error (Browser)
      </button>
      <button
        className="ml-4 rounded bg-blue-600 px-4 py-2 text-white"
        onClick={() => {
          Sentry.captureException(new Error("Sentry Test Error via captureException"));
        }}
      >
        Sentry.captureException
      </button>
    </div>
  );
}
