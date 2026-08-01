import { Metadata } from "next";
import { questions } from "@/lib/questions";
import Dashboard from "@/components/patterns/Dashboard";
import Footer from "@/components/layout/Footer";
import { siteConfig } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    absolute: "AlgoPatterns - Master DSA Patterns for FAANG Interviews",
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  alternates: {
    canonical: siteConfig.url,
  },
  openGraph: {
    title: "AlgoPatterns - Master DSA Patterns for FAANG Interviews",
    description: siteConfig.description,
    type: "website",
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "AlgoPatterns - Master DSA Patterns for FAANG Interviews",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AlgoPatterns - Master DSA Patterns for FAANG Interviews",
    description: siteConfig.description,
    images: ["/opengraph-image"],
  },
};

// skipcq: JS-0067
export default function Home() {
  return (
    <>
      <div className="max-w-6xl mx-auto px-4 py-4 md:py-8">
        <Dashboard questions={questions} />
      </div>
      <Footer />
    </>
  );
}
