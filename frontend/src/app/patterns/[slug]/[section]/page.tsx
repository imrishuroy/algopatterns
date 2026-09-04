import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import patternsData from "@/lib/patterns.json";
import { Pattern } from "@/types";
import { siteConfig } from "@/lib/seo";
import { slugify, findSectionIndexBySlug } from "@/lib/slugify";
import { BreadcrumbJsonLd, JsonLdScript } from "@/components/seo/JsonLd";
import PatternPageClient from "../PatternPageClient";

const patterns = patternsData as Pattern[];

interface PageProps {
  params: Promise<{ slug: string; section: string }>;
}

const getSectionDescription = (
  section: { title: string; content: string; exampleName?: string },
  pattern: Pattern
): string => {
  const contentPreview = section.content
    .replace(/<[^>]*>/g, "")
    .slice(0, 120)
    .trim();

  if (section.exampleName) {
    return `Learn ${section.title} with the ${section.exampleName} problem. Part of the ${pattern.category} pattern tutorial. ${contentPreview}...`;
  }

  return `${section.title} - ${pattern.category} pattern tutorial. ${contentPreview}... Master this technique for coding interviews.`;
};

const getSectionKeywords = (
  section: { title: string; exampleName?: string },
  pattern: Pattern
): string[] => {
  const base = [
    section.title.toLowerCase(),
    `${pattern.category.toLowerCase()} ${section.title.toLowerCase()}`,
    `${section.title.toLowerCase()} algorithm`,
    `${section.title.toLowerCase()} leetcode`,
    `${pattern.category.toLowerCase()} pattern`,
    "coding interview",
    "dsa",
  ];

  if (section.exampleName) {
    base.push(
      section.exampleName.toLowerCase(),
      `${section.exampleName.toLowerCase()} solution`,
      `${section.exampleName.toLowerCase()} leetcode`
    );
  }

  return base;
};

export const generateStaticParams = () => {
  const params: { slug: string; section: string }[] = [];

  for (const pattern of patterns) {
    if (!pattern.tutorial || pattern.tutorial.length === 0) continue;

    for (const section of pattern.tutorial) {
      params.push({
        slug: pattern.id,
        section: slugify(section.title),
      });
    }

    params.push({
      slug: pattern.id,
      section: "quiz",
    });
  }

  return params;
};

// skipcq: JS-R1005
export const generateMetadata = async ({
  params,
}: PageProps): Promise<Metadata> => {
  const { slug, section: sectionSlug } = await params;
  const pattern = patterns.find((p) => p.id === slug);

  if (!pattern) {
    return { title: "Pattern Not Found" };
  }

  if (sectionSlug === "quiz") {
    return {
      title: `${pattern.category} Quiz - Test Your Knowledge`,
      description: `Test your understanding of ${pattern.category} patterns with interactive quiz questions. Practice coding interview concepts.`,
      openGraph: {
        title: `${pattern.category} Pattern Quiz`,
        description: `Test your ${pattern.category} knowledge with practice questions.`,
        type: "article",
        url: `${siteConfig.url}/patterns/${slug}/quiz`,
      },
      alternates: {
        canonical: `${siteConfig.url}/patterns/${slug}/quiz`,
      },
    };
  }

  const sectionIndex = findSectionIndexBySlug(
    pattern.tutorial || [],
    sectionSlug
  );
  if (sectionIndex === -1 || !pattern.tutorial) {
    return { title: "Section Not Found" };
  }

  const section = pattern.tutorial[sectionIndex];
  const title = `${section.title} - ${pattern.category} Pattern`;
  const description = getSectionDescription(section, pattern);
  const keywords = getSectionKeywords(section, pattern);

  return {
    title,
    description,
    keywords,
    openGraph: {
      title: `${section.title} - ${pattern.category} Tutorial`,
      description,
      type: "article",
      url: `${siteConfig.url}/patterns/${slug}/${sectionSlug}`,
      siteName: siteConfig.name,
      images: ["/opengraph-image"],
    },
    twitter: {
      card: "summary_large_image",
      title: `${section.title} - ${pattern.category}`,
      description,
      images: ["/opengraph-image"],
    },
    alternates: {
      canonical: `${siteConfig.url}/patterns/${slug}/${sectionSlug}`,
    },
  };
};

// skipcq: JS-0067, JS-R1005
export default async function PatternSectionPage({ params }: PageProps) {
  const { slug, section: sectionSlug } = await params;
  const pattern = patterns.find((p) => p.id === slug);

  if (!pattern) {
    notFound();
  }

  if (!pattern.tutorial || pattern.tutorial.length === 0) {
    redirect(`/patterns/${slug}`);
  }

  let sectionIndex: number;
  let sectionTitle: string;

  if (sectionSlug === "quiz") {
    sectionIndex = pattern.tutorial.length;
    sectionTitle = "Quiz";
  } else {
    sectionIndex = findSectionIndexBySlug(pattern.tutorial, sectionSlug);
    if (sectionIndex === -1) {
      redirect(`/patterns/${slug}`);
    }
    sectionTitle = pattern.tutorial[sectionIndex].title;
  }

  const breadcrumbs = [
    { name: "Home", url: siteConfig.url },
    { name: "Patterns", url: `${siteConfig.url}/patterns` },
    { name: pattern.category, url: `${siteConfig.url}/patterns/${slug}` },
    {
      name: sectionTitle,
      url: `${siteConfig.url}/patterns/${slug}/${sectionSlug}`,
    },
  ];

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: `${sectionTitle} - ${pattern.category} Pattern`,
    description:
      sectionSlug === "quiz"
        ? `Quiz for ${pattern.category} pattern`
        : getSectionDescription(pattern.tutorial[sectionIndex], pattern),
    author: {
      "@type": "Organization",
      name: siteConfig.name,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteConfig.url}/patterns/${slug}/${sectionSlug}`,
    },
    about: {
      "@type": "Thing",
      name: pattern.category,
    },
    proficiencyLevel: pattern.difficulty,
    isPartOf: {
      "@type": "Course",
      name: `${pattern.category} Pattern`,
      url: `${siteConfig.url}/patterns/${slug}`,
    },
  };

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <JsonLdScript data={articleJsonLd} />
      <PatternPageClient pattern={pattern} initialSectionSlug={sectionSlug} />
    </>
  );
}
