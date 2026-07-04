import { Metadata } from "next";
import { siteConfig } from "@/lib/seo";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import PatternRecognitionClient from "./PatternRecognitionClient";

const siteUrl = siteConfig.url;

export const metadata: Metadata = {
  title: "Pattern Recognition Guide - Identify the Right Algorithm | AlgoPatterns",
  description:
    "Learn to identify the correct algorithm pattern for any coding problem. Constraint-based lookups, pattern cheatsheets, and keyword-to-algorithm mappings for FAANG interview prep.",
  keywords: [
    "pattern recognition",
    "algorithm identification",
    "coding problem patterns",
    "constraint based algorithm",
    "when to use sliding window",
    "when to use dynamic programming",
    "leetcode pattern guide",
    "algorithm decision tree",
  ],
  openGraph: {
    title: "Pattern Recognition Guide - Identify the Right Algorithm | AlgoPatterns",
    description:
      "Constraint-based algorithm lookups, pattern cheatsheets, and keyword-to-algorithm mappings for coding interviews.",
    type: "article",
    url: `${siteUrl}/pattern-recognition`,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "AlgoPatterns Pattern Recognition Guide",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pattern Recognition Guide | AlgoPatterns",
    description:
      "Learn to identify the right algorithm for any coding problem with constraint and keyword lookups.",
    images: ["/opengraph-image"],
  },
  alternates: {
    canonical: `${siteUrl}/pattern-recognition`,
  },
};

const breadcrumbs = [
  { name: "Home", url: siteUrl },
  { name: "Pattern Recognition", url: `${siteUrl}/pattern-recognition` },
];

// skipcq: JS-0067
export default function PatternRecognitionPage() {
  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <PatternRecognitionClient />
    </>
  );
}
