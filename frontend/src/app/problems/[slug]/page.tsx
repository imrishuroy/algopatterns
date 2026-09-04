import { Metadata } from "next";
import ProblemPageClient from "./ProblemPageClient";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { questions } from "@/lib/questions";
import { slugify } from "@/lib/slugify";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://algopatterns.in";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const generateStaticParams = () => {
  return questions.map((q) => ({
    slug: slugify(q.name),
  }));
};

// skipcq: JS-0067 — Next.js metadata generation function
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  // Convert slug to readable title (e.g., "two-sum" -> "Two Sum")
  const title = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const description = `Solve the ${title} coding problem with step-by-step guidance. Practice with multiple programming languages and test cases on AlgoPatterns.`;

  return {
    title: `${title} - Coding Problem`,
    description,
    keywords: [
      title,
      "coding problem",
      "leetcode",
      "algorithm",
      "data structures",
      "interview preparation",
      "FAANG interview",
    ],
    openGraph: {
      title: `${title} - Coding Problem | AlgoPatterns`,
      description,
      type: "article",
      url: `${siteUrl}/problems/${slug}`,
      siteName: "AlgoPatterns",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} - Coding Problem | AlgoPatterns`,
      description,
    },
    alternates: {
      canonical: `${siteUrl}/problems/${slug}`,
    },
  };
}

// skipcq: JS-0067
export default async function ProblemPage({ params }: PageProps) {
  const { slug } = await params;

  const breadcrumbs = [
    { name: "Home", url: siteUrl },
    { name: "Problems", url: `${siteUrl}/problems` },
    {
      name: slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      url: `${siteUrl}/problems/${slug}`,
    },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <ProblemPageClient params={params} />
    </>
  );
}
