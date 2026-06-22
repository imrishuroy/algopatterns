import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: [
      "react-syntax-highlighter",
      "react-markdown",
      "remark-gfm",
      "@monaco-editor/react",
    ],
  },
};

export default nextConfig;
