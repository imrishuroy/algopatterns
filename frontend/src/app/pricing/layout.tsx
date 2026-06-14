import { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://algopatterns.com";

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
