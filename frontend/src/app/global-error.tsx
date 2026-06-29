"use client";

// skipcq: JS-0067 — Next.js error boundary convention
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <h1>Something went wrong!</h1>
      </body>
    </html>
  );
}
