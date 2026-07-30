import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getLanguageGuide,
  getSupportedLanguages,
  isLanguageAvailable,
} from "@/lib/languages";
import LanguageGuideClient from "./LanguageGuideClient";

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

  return {
    title: `${guide.displayName} - Complete Guide | AlgoPatterns`,
    description: guide.description,
    keywords: [
      `dsa in ${guide.name.toLowerCase()}`,
      `${guide.name.toLowerCase()} data structures`,
      `${guide.name.toLowerCase()} algorithms`,
      `${guide.name.toLowerCase()} leetcode`,
      `${guide.name.toLowerCase()} coding interview`,
      `${guide.name.toLowerCase()} interview preparation`,
    ],
    openGraph: {
      title: `${guide.displayName} - Complete Guide for Coding Interviews`,
      description: guide.description,
      type: "article",
      url: `/languages/${lang}`,
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

  return <LanguageGuideClient guide={guide} />;
}
