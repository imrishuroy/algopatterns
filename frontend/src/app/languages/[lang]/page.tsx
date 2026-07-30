import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getLanguageGuide,
  getSupportedLanguages,
  isLanguageAvailable,
} from "@/lib/languages";
import LanguageGuideClient from "./LanguageGuideClient";
import { LanguageGuideJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { siteConfig } from "@/lib/seo";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export const generateStaticParams = async () => {
  return getSupportedLanguages()
    .filter((lang) => isLanguageAvailable(lang))
    .map((lang) => ({ lang }));
};

export const generateMetadata = async ({
  params,
}: PageProps): Promise<Metadata> => {
  const { lang } = await params;
  const guide = getLanguageGuide(lang as "go" | "rust" | "java" | "python");

  if (!guide) {
    return {
      title: "Language Guide Not Found | AlgoPatterns",
    };
  }

  const langLower = guide.name.toLowerCase();

  return {
    title: `${guide.displayName} - Complete Guide | AlgoPatterns`,
    description: guide.description,
    keywords: [
      `dsa in ${langLower}`,
      `${langLower} data structures`,
      `${langLower} algorithms`,
      `${langLower} leetcode`,
      `${langLower} coding interview`,
      `${langLower} interview preparation`,
      `${langLower} standard library`,
      `learn ${langLower} for interviews`,
    ],
    openGraph: {
      title: `${guide.displayName} - Complete Guide for Coding Interviews`,
      description: guide.description,
      type: "article",
      url: `${siteConfig.url}/languages/${lang}`,
      siteName: siteConfig.name,
      images: ["/opengraph-image"],
    },
    twitter: {
      card: "summary_large_image",
      title: `${guide.displayName} DSA Guide | AlgoPatterns`,
      description: guide.description,
      images: ["/opengraph-image"],
    },
    alternates: {
      canonical: `${siteConfig.url}/languages/${lang}`,
    },
  };
};

// skipcq: JS-0067
export default async function LanguageGuidePage({ params }: PageProps) {
  const { lang } = await params;
  const guide = getLanguageGuide(lang as "go" | "rust" | "java" | "python");

  if (!guide) {
    notFound();
  }

  const breadcrumbs = [
    { name: "Home", url: siteConfig.url },
    { name: "Languages", url: `${siteConfig.url}/languages` },
    { name: guide.displayName, url: `${siteConfig.url}/languages/${lang}` },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <LanguageGuideJsonLd
        guide={{
          name: guide.name,
          displayName: guide.displayName,
          description: guide.description,
          slug: lang,
        }}
      />
      <LanguageGuideClient guide={guide} />
    </>
  );
}
