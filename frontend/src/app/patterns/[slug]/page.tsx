import { Metadata } from "next";
import { notFound } from "next/navigation";
import patternsData from "@/lib/patterns.json";
import { Pattern } from "@/types";
import { getPatternMetadata } from "@/lib/seo";
import { CourseJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import PatternPageClient from "./PatternPageClient";

const patterns = patternsData as Pattern[];
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://algopatterns.com";

export function generateStaticParams() {
  return patterns.map((pattern) => ({
    slug: pattern.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pattern = patterns.find((p) => p.id === slug);

  if (!pattern) {
    return {
      title: "Pattern Not Found",
      description: "The requested pattern could not be found.",
    };
  }

  return getPatternMetadata(slug, pattern.category, pattern.description);
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PatternPage({ params }: PageProps) {
  const { slug } = await params;
  const pattern = patterns.find((p) => p.id === slug);

  if (!pattern) {
    notFound();
  }

  const breadcrumbs = [
    { name: "Home", url: siteUrl },
    { name: "Patterns", url: `${siteUrl}/patterns` },
    { name: pattern.category, url: `${siteUrl}/patterns/${slug}` },
  ];

  return (
    <>
      <CourseJsonLd pattern={pattern} />
      <BreadcrumbJsonLd items={breadcrumbs} />
      <PatternPageClient pattern={pattern} />
    </>
  );
}
