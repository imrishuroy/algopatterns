import { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://algopatterns.in";

export const metadata: Metadata = {
  title: "Pricing - AlgoPatterns Pro Plans",
  description:
    "Choose your AlgoPatterns plan. Get access to all 17 DSA patterns, interactive visualizers, and curated problem sets for FAANG interview preparation. Free tier available.",
  keywords: [
    "algopatterns pricing",
    "dsa course price",
    "leetcode alternative pricing",
    "coding interview prep cost",
    "algorithm course subscription",
  ],
  openGraph: {
    title: "Pricing - AlgoPatterns Pro Plans",
    description:
      "Unlock all DSA patterns and features. Choose from monthly, yearly, or lifetime access.",
    url: `${siteUrl}/pricing`,
    type: "website",
    siteName: "AlgoPatterns",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "AlgoPatterns Pricing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing - AlgoPatterns Pro Plans",
    description:
      "Unlock all DSA patterns and features. Monthly, yearly, or lifetime access available.",
    images: ["/opengraph-image"],
  },
  alternates: {
    canonical: `${siteUrl}/pricing`,
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
