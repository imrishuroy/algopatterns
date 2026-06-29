export const dynamic = "force-dynamic";

export async function GET() {
  throw new Error("Sentry Test Error from API route");
}
