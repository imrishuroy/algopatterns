import { Metadata } from "next";
import { siteConfig } from "@/lib/seo";
import { BreadcrumbJsonLd, JsonLdScript } from "@/components/seo/JsonLd";
import PricingPageClient from "./PricingPageClient";

const siteUrl = siteConfig.url;

export const metadata: Metadata = {
  title: "Pricing - DSA Learning Plans",
  description:
    "Choose the perfect plan to master Data Structures & Algorithms. Free tier available. Pro plans include all 18 patterns, 300+ problems, interactive visualizers, and lifetime access options.",
  keywords: [
    "DSA course pricing",
    "algorithm course subscription",
    "leetcode preparation course",
    "coding interview preparation",
    "FAANG interview course",
    "data structures course",
    "algorithm learning platform",
    "coding bootcamp alternative",
  ],
  openGraph: {
    title: "Pricing - AlgoPatterns DSA Learning Plans",
    description:
      "Unlock all DSA patterns, visualizers, and 300+ practice problems. Free tier available. Pro plans from ₹299/month with lifetime access option.",
    type: "website",
    url: `${siteUrl}/pricing`,
    siteName: siteConfig.name,
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "AlgoPatterns Pricing Plans",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing - AlgoPatterns DSA Learning Plans",
    description:
      "Unlock all DSA patterns, visualizers, and 300+ practice problems. Free tier available with Pro upgrade options.",
    images: ["/opengraph-image"],
  },
  alternates: {
    canonical: `${siteUrl}/pricing`,
  },
};

const pricingJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "AlgoPatterns Pro",
  description:
    "Complete DSA learning platform with 18 algorithmic patterns, 300+ practice problems, interactive visualizers, and AI-powered assistance for coding interview preparation.",
  brand: {
    "@type": "Brand",
    name: "AlgoPatterns",
  },
  offers: [
    {
      "@type": "Offer",
      name: "Pro Monthly",
      price: "299",
      priceCurrency: "INR",
      priceValidUntil: "2027-12-31",
      availability: "https://schema.org/InStock",
      url: `${siteUrl}/pricing`,
      description:
        "Monthly subscription with full access to all patterns and features",
    },
    {
      "@type": "Offer",
      name: "Pro Yearly",
      price: "1999",
      priceCurrency: "INR",
      priceValidUntil: "2027-12-31",
      availability: "https://schema.org/InStock",
      url: `${siteUrl}/pricing`,
      description: "Annual subscription with 44% savings over monthly",
    },
    {
      "@type": "Offer",
      name: "Pro Lifetime",
      price: "4999",
      priceCurrency: "INR",
      priceValidUntil: "2027-12-31",
      availability: "https://schema.org/InStock",
      url: `${siteUrl}/pricing`,
      description:
        "One-time payment for lifetime access including all future updates",
    },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    reviewCount: "127",
  },
};

const breadcrumbs = [
  { name: "Home", url: siteUrl },
  { name: "Pricing", url: `${siteUrl}/pricing` },
];

// skipcq: JS-0067
export default function PricingPage() {
  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <JsonLdScript data={pricingJsonLd} />
      <PricingPageClient />
    </>
  );
}
