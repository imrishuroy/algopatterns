"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

const containerStyle = {
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
  padding: "2rem",
  fontFamily: "system-ui, sans-serif",
};

const primaryButtonStyle = {
  padding: "0.75rem 1.5rem",
  backgroundColor: "#0070f3",
  color: "white",
  border: "none",
  borderRadius: "0.5rem",
  cursor: "pointer",
  fontSize: "1rem",
};

const secondaryButtonStyle = {
  padding: "0.75rem 1.5rem",
  backgroundColor: "transparent",
  color: "#0070f3",
  border: "1px solid #0070f3",
  borderRadius: "0.5rem",
  cursor: "pointer",
  fontSize: "1rem",
};

const ErrorContent = ({ reset }: { reset: () => void }) => {
  const handleReport = () => {
    const feedback = Sentry.getFeedback();
    if (feedback) {
      feedback
        .createForm()
        .then((form: { appendToDom: () => void; open: () => void }) => {
          form.appendToDom();
          form.open();
        });
    }
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ marginBottom: "1rem" }}>Something went wrong!</h1>
      <p style={{ marginBottom: "2rem", color: "#666" }}>
        An unexpected error occurred. Our team has been notified.
      </p>
      <div style={{ display: "flex", gap: "1rem" }}>
        <button onClick={reset} style={primaryButtonStyle}>
          Try again
        </button>
        <button onClick={handleReport} style={secondaryButtonStyle}>
          Report feedback
        </button>
      </div>
    </div>
  );
};

// skipcq: JS-0067 — Next.js error boundary convention requires default export function
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

  return (
    <html>
      <body>
        <ErrorContent reset={reset} />
      </body>
    </html>
  );
}
