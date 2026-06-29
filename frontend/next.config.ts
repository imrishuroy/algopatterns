import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {},
};

export default withSentryConfig(nextConfig, {
  org: "algo-patterns",
  project: "algo-patterns-frontend",

  authToken: process.env.SENTRY_AUTH_TOKEN,

  tunnelRoute: "/sentry-tunnel",

  silent: !process.env.CI,
});
