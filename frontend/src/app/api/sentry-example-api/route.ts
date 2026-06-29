// skipcq: JS-0116, JS-0067 — Next.js route handler convention
export const dynamic = "force-dynamic";

export function GET() {
  throw new Error("Sentry Test Error from API route");
}
