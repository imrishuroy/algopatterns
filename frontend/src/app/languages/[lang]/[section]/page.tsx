import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  getLanguageGuide,
  getSupportedLanguages,
  isLanguageAvailable,
} from "@/lib/languages";
import LanguageGuideClient from "../LanguageGuideClient";
import {
  BreadcrumbJsonLd,
  JsonLdScript,
} from "@/components/seo/JsonLd";
import { siteConfig } from "@/lib/seo";

interface PageProps {
  params: Promise<{ lang: string; section: string }>;
}

export const generateStaticParams = async () => {
  const params: { lang: string; section: string }[] = [];

  for (const lang of getSupportedLanguages()) {
    if (!isLanguageAvailable(lang)) continue;

    const guide = getLanguageGuide(lang);
    if (!guide) continue;

    for (const section of guide.sections) {
      params.push({ lang, section: section.id });
    }
  }

  return params;
};

export const generateMetadata = async ({
  params,
}: PageProps): Promise<Metadata> => {
  const { lang, section: sectionId } = await params;
  const guide = getLanguageGuide(lang as "go" | "rust" | "java" | "python");

  if (!guide) {
    return { title: "Guide Not Found" };
  }

  const section = guide.sections.find((s) => s.id === sectionId);
  if (!section) {
    return { title: "Section Not Found" };
  }

  const langName = guide.name;
  const langLower = langName.toLowerCase();

  const title = `${section.title} - ${langName} Tutorial`;
  const description = getSectionDescription(section, langName);
  const keywords = getSectionKeywords(section, langLower);

  return {
    title,
    description,
    keywords,
    openGraph: {
      title: `${section.title} - ${langName} DSA Guide`,
      description,
      type: "article",
      url: `${siteConfig.url}/languages/${lang}/${sectionId}`,
      siteName: siteConfig.name,
      images: ["/opengraph-image"],
    },
    twitter: {
      card: "summary_large_image",
      title: `${section.title} - ${langName} Tutorial`,
      description,
      images: ["/opengraph-image"],
    },
    alternates: {
      canonical: `${siteConfig.url}/languages/${lang}/${sectionId}`,
    },
  };
};

const getSectionDescription = (
  section: { title: string; category: string; content: { text?: string }[] },
  langName: string
): string => {
  const firstText = section.content.find((c) => c.text)?.text || "";
  const truncated = firstText.slice(0, 150).replace(/\s+/g, " ").trim();
  const ellipsis = firstText.length > 150 ? "..." : "";

  if (truncated) {
    return `${truncated}${ellipsis} Learn ${section.title} in ${langName} with examples and best practices.`;
  }

  return `Learn ${section.title} in ${langName}. Part of the ${section.category} section in our comprehensive ${langName} DSA guide.`;
};

const getSectionKeywords = (
  section: { title: string; category: string; id: string },
  langLower: string
): string[] => {
  const base = [
    `${langLower} ${section.title.toLowerCase()}`,
    `${section.title.toLowerCase()} ${langLower}`,
    `${langLower} ${section.category.toLowerCase()}`,
    `${langLower} tutorial`,
    `learn ${langLower}`,
  ];

  if (section.category === "Concurrency") {
    base.push(
      `${langLower} concurrency`,
      `${langLower} goroutines`,
      `${langLower} channels`,
      `${langLower} parallel programming`
    );
  }

  if (section.category === "Data Structures") {
    base.push(
      `${langLower} data structures`,
      `${langLower} dsa`,
      `${langLower} algorithms`
    );
  }

  return base;
};

// skipcq: JS-0067
export default async function SectionPage({ params }: PageProps) {
  const { lang, section: sectionId } = await params;
  const guide = getLanguageGuide(lang as "go" | "rust" | "java" | "python");

  if (!guide) {
    notFound();
  }

  const sectionIndex = guide.sections.findIndex((s) => s.id === sectionId);

  if (sectionIndex === -1) {
    redirect(`/languages/${lang}`);
  }

  const section = guide.sections[sectionIndex];

  const breadcrumbs = [
    { name: "Home", url: siteConfig.url },
    { name: "Languages", url: `${siteConfig.url}/languages` },
    { name: guide.displayName, url: `${siteConfig.url}/languages/${lang}` },
    {
      name: section.title,
      url: `${siteConfig.url}/languages/${lang}/${sectionId}`,
    },
  ];

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: `${section.title} - ${guide.name} Tutorial`,
    description: getSectionDescription(section, guide.name),
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
      "@id": `${siteConfig.url}/languages/${lang}/${sectionId}`,
    },
    about: {
      "@type": "Thing",
      name: section.category,
    },
    proficiencyLevel: section.difficulty,
    programmingLanguage: {
      "@type": "ComputerLanguage",
      name: guide.name,
    },
    isPartOf: {
      "@type": "Course",
      name: guide.displayName,
      url: `${siteConfig.url}/languages/${lang}`,
    },
  };

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <JsonLdScript data={articleJsonLd} />
      <LanguageGuideClient guide={guide} initialSectionId={sectionId} />
    </>
  );
}
