import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";
import { execSync } from "child_process";

// skipcq: JS-0067 — Config file runs at build time, not in browser
const getGitInfo = () => {
  try {
    const commit = execSync("git rev-parse --short HEAD", { encoding: "utf-8" }).trim();
    const tag = execSync("git describe --tags --always", { encoding: "utf-8" }).trim();
    return { commit, tag };
  } catch {
    return { commit: "unknown", tag: "unknown" };
  }
};

const gitInfo = getGitInfo();
const release = process.env.SENTRY_RELEASE || process.env.NEXT_PUBLIC_SENTRY_RELEASE || gitInfo.tag || gitInfo.commit;

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  env: {
    NEXT_PUBLIC_GIT_COMMIT: gitInfo.commit,
    NEXT_PUBLIC_GIT_TAG: gitInfo.tag,
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
  },
  experimental: {},
};

export default withSentryConfig(nextConfig, {
  org: "algo-patterns",
  project: "algo-patterns-frontend",

  authToken: process.env.SENTRY_AUTH_TOKEN,

  release: {
    name: release,
    create: true,
  },

  tunnelRoute: "/sentry-tunnel",

  silent: !process.env.CI,
});
