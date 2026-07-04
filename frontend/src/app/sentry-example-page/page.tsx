import { Metadata } from "next";
import SentryExampleClient from "./SentryExampleClient";

export const metadata: Metadata = {
  title: "Sentry Test",
  robots: { index: false, follow: false },
};

// skipcq: JS-0067 — Next.js page component convention
export default function SentryExamplePage() {
  return <SentryExampleClient />;
}
