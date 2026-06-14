import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AlgoPatterns - Master DSA Patterns",
    short_name: "AlgoPatterns",
    description:
      "Master Data Structures & Algorithms with pattern-based learning for FAANG interviews.",
    start_url: "/",
    display: "standalone",
    background_color: "#111827",
    theme_color: "#6366f1",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
