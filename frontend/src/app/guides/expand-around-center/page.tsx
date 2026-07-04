import { Metadata } from "next";
import { siteConfig } from "@/lib/seo";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import ExpandAroundCenterClient from "./ExpandAroundCenterClient";

const siteUrl = siteConfig.url;

export const metadata: Metadata = {
  title: "Expand Around Center Pattern - Optimal Palindrome Algorithm",
  description:
    "Learn the Expand Around Center technique for palindrome substring problems. Achieves O(n) time and O(1) space — optimal for longest palindromic substring and palindrome partitioning.",
  keywords: [
    "expand around center",
    "palindrome algorithm",
    "longest palindromic substring",
    "palindrome substring",
    "o1 space palindrome",
    "manacher algorithm alternative",
    "two pointer palindrome",
  ],
  openGraph: {
    title: "Expand Around Center Pattern - Optimal Palindrome Algorithm",
    description:
      "Master the Expand Around Center technique for O(n) time, O(1) space palindrome detection with code examples.",
    type: "article",
    url: `${siteUrl}/guides/expand-around-center`,
    siteName: siteConfig.name,
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Expand Around Center Pattern Guide",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Expand Around Center Pattern - Palindrome Algorithm Guide",
    description:
      "O(n) time, O(1) space palindrome technique with step-by-step code examples.",
    images: ["/opengraph-image"],
  },
  alternates: {
    canonical: `${siteUrl}/guides/expand-around-center`,
  },
};

const breadcrumbs = [
  { name: "Home", url: siteUrl },
  { name: "Guides", url: `${siteUrl}/guides` },
  { name: "Expand Around Center", url: `${siteUrl}/guides/expand-around-center` },
];

// skipcq: JS-0067
export default function ExpandAroundCenterPage() {
  return (
    <>
      <ArticleJsonLd
        title="Expand Around Center Pattern - Optimal Palindrome Algorithm"
        description="Learn the Expand Around Center technique for palindrome substring problems with O(n) time and O(1) space."
        url={`${siteUrl}/guides/expand-around-center`}
        datePublished="2024-01-01"
      />
      <BreadcrumbJsonLd items={breadcrumbs} />
      <ExpandAroundCenterClient />
    </>
  );
}
