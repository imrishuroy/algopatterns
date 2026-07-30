import { Metadata, Viewport } from "next";
import { Suspense } from "react";
import patternsData from "@/lib/patterns.json";
import { Pattern } from "@/types";
import { siteConfig } from "@/lib/seo";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import PatternsListClient from "./PatternsListClient";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const patterns = patternsData as Pattern[];

const siteUrl = siteConfig.url;

export const metadata: Metadata = {
  title: "DSA Patterns - All Algorithm Patterns | AlgoPatterns",
  description:
    "Master Data Structures & Algorithms with AI Enabled pattern-first learning. 18 patterns including Sliding Window, Two Pointers, Binary Search, DP, Graphs, Trees, and 300+ curated problems.",
  keywords: [
    "DSA patterns",
    "algorithm patterns",
    "coding interview patterns",
    "leetcode patterns",
    "FAANG interview prep",
    "sliding window",
    "two pointers",
    "dynamic programming",
    "graph algorithms",
    "data structures",
  ],
  openGraph: {
    title: "DSA Patterns - All Algorithm Patterns | AlgoPatterns",
    description:
      "Master DSA with AI Enabled pattern-first learning. Interactive visualizations and 300+ curated problems.",
    type: "website",
    url: `${siteUrl}/patterns`,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "AlgoPatterns - DSA Patterns",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DSA Patterns - All Algorithm Patterns | AlgoPatterns",
    description:
      "Master DSA with AI Enabled pattern-first learning and interactive visualizations.",
    images: ["/opengraph-image"],
  },
  alternates: {
    canonical: `${siteUrl}/patterns`,
  },
};

const breadcrumbs = [
  { name: "Home", url: siteUrl },
  { name: "Patterns", url: `${siteUrl}/patterns` },
];

// skipcq: JS-0067
export default function PatternsPage() {
  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      {/* Static SEO content — crawlable by Googlebot */}
      <div className="max-w-6xl mx-auto px-4 py-4 md:py-8">
        <div className="mb-6">
          <h1
            className="text-2xl md:text-3xl font-bold mb-2"
            style={{
              color: "var(--text-1)",
              fontFamily: "var(--font-heading)",
            }}
          >
            DSA Algorithm Patterns
          </h1>
          <p
            className="text-sm md:text-base"
            style={{ color: "var(--text-2)" }}
          >
            {patterns.length} patterns — master them to solve any coding
            interview problem
          </p>
        </div>
        <Suspense
          fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {patterns.slice(0, 6).map((p) => (
                <div
                  key={p.id}
                  className="h-40 animate-pulse"
                  style={{
                    background: "var(--bg-surface)",
                    borderRadius: "var(--radius-xl)",
                  }}
                />
              ))}
            </div>
          }
        >
          <PatternsListClient patterns={patterns} />
        </Suspense>
      </div>
    </>
  );
}
