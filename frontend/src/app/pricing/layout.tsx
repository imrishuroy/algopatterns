import { Metadata } from "next";
import { PricingJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";

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

const pricingPlans = [
  {
    name: "Free",
    description:
      "Get started with basic DSA patterns and visualizers for free.",
    price: "0",
    currency: "INR",
    features: [
      "3 DSA Patterns",
      "Basic Visualizers",
      "Community Support",
      "Limited Problem Sets",
    ],
  },
  {
    name: "Pro Monthly",
    description: "Full access to all patterns and features, billed monthly.",
    price: "299",
    currency: "INR",
    features: [
      "All 17 DSA Patterns",
      "Interactive Visualizers",
      "Complete Solutions",
      "Priority Support",
    ],
  },
  {
    name: "Pro Yearly",
    description:
      "Best value with yearly billing. Save 40% compared to monthly.",
    price: "1999",
    currency: "INR",
    features: [
      "All 17 DSA Patterns",
      "Interactive Visualizers",
      "Complete Solutions",
      "Priority Support",
      "40% Savings",
    ],
  },
  {
    name: "Pro Lifetime",
    description:
      "One-time payment for lifetime access to all current and future features.",
    price: "4999",
    currency: "INR",
    features: [
      "All 17 DSA Patterns",
      "Interactive Visualizers",
      "Complete Solutions",
      "Priority Support",
      "Lifetime Updates",
      "All Future Features",
    ],
  },
];

// skipcq: JS-0067 — Next.js layout component
export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbs = [
    { name: "Home", url: siteUrl },
    { name: "Pricing", url: `${siteUrl}/pricing` },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <PricingJsonLd plans={pricingPlans} />
      {children}
    </>
  );
}
