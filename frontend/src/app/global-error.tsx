"use client";

// skipcq: JS-0067 — Next.js error boundary convention
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.withScope((scope: Sentry.Scope) => {
      scope.setTag("error_boundary", "global");
      scope.setLevel("fatal");
      if (error.digest) {
        scope.setExtra("digest", error.digest);
      }
      Sentry.captureException(error);
    });
  }, [error]);

  const handleReport = () => {
    const feedback = Sentry.getFeedback();
    if (feedback) {
      feedback.createForm().then((form: { appendToDom: () => void; open: () => void }) => {
        form.appendToDom();
        form.open();
      });
    }
  };

  return (
    <html>
      <body>
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "2rem",
          fontFamily: "system-ui, sans-serif",
        }}>
          <h1 style={{ marginBottom: "1rem" }}>Something went wrong!</h1>
          <p style={{ marginBottom: "2rem", color: "#666" }}>
            An unexpected error occurred. Our team has been notified.
          </p>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              onClick={reset}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#0070f3",
                color: "white",
                border: "none",
                borderRadius: "0.5rem",
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              Try again
            </button>
            <button
              onClick={handleReport}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "transparent",
                color: "#0070f3",
                border: "1px solid #0070f3",
                borderRadius: "0.5rem",
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              Report feedback
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
