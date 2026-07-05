import { Metadata } from "next";
import { concepts, conceptCategories } from "@/lib/dsa-fundamentals";
import { siteConfig } from "@/lib/seo";
import DSAFundamentalsClient from "./DSAFundamentalsClient";

const siteUrl = siteConfig.url;

export const metadata: Metadata = {
  title: "DSA Fundamentals - Essential Concepts for Coding Interviews",
  description:
    "Master essential data structures and algorithms concepts for coding interviews. Learn Java, Python, C++, and JavaScript implementations with code examples.",
  keywords: [
    "dsa fundamentals",
    "data structures",
    "algorithms",
    "coding interview",
    "java collections",
    "priority queue",
    "hashmap",
    "leetcode",
  ],
  openGraph: {
    title: "DSA Fundamentals - Essential Concepts for Coding Interviews",
    description:
      "Master essential data structures and algorithms concepts with code examples in Java, Python, C++, and JavaScript.",
    type: "website",
    url: `${siteUrl}/dsa-fundamentals`,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "AlgoPatterns DSA Fundamentals",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DSA Fundamentals - Essential Concepts for Coding Interviews",
    description:
      "Master data structures and algorithms with multi-language code examples for coding interview prep.",
    images: ["/opengraph-image"],
  },
  alternates: {
    canonical: `${siteUrl}/dsa-fundamentals`,
  },
};

export default function DSAFundamentalsPage() { // skipcq: JS-0067
  return (
    <DSAFundamentalsClient concepts={concepts} categories={conceptCategories} />
  );
}
