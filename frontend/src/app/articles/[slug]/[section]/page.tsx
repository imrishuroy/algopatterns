import { Metadata } from "next";
import { notFound } from "next/navigation";
import { articles, getArticleBySlug, getSection } from "@/content/articles";
import { siteConfig } from "@/lib/seo";
import { BreadcrumbJsonLd, JsonLdScript } from "@/components/seo/JsonLd";
import ArticleSectionClient from "./ArticleSectionClient";

const siteUrl = siteConfig.url;

export function generateStaticParams() {
  const params: { slug: string; section: string }[] = [];

  articles.forEach((article) => {
    article.sections.forEach((section) => {
      params.push({
        slug: article.slug,
        section: section.slug,
      });
    });
  });

  return params;
}

// skipcq: JS-0067
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; section: string }>;
}): Promise<Metadata> {
  const { slug, section } = await params;
  const article = getArticleBySlug(slug);
  const sectionData = getSection(slug, section);

  if (!article || !sectionData) {
    return { title: "Section Not Found" };
  }

  const title = `${sectionData.title} | ${article.title}`;
  const description = sectionData.description || article.description;
  const canonicalUrl = `${siteUrl}/articles/${slug}/${section}`;

  return {
    title,
    description,
    keywords: article.tags,
    openGraph: {
      title,
      description,
      type: "article",
      url: canonicalUrl,
      siteName: siteConfig.name,
      locale: "en_US",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/opengraph-image"],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

interface PageProps {
  params: Promise<{ slug: string; section: string }>;
}

// skipcq: JS-0067
export default async function ArticleSectionPage({ params }: PageProps) {
  const { slug, section } = await params;
  const article = getArticleBySlug(slug);
  const sectionData = getSection(slug, section);

  if (!article || !sectionData) {
    notFound();
  }

  const sectionIndex = article.sections.findIndex((s) => s.slug === section);

  const breadcrumbs = [
    { name: "Home", url: siteUrl },
    { name: "Articles", url: `${siteUrl}/articles` },
    { name: article.title, url: `${siteUrl}/articles/${slug}` },
    { name: sectionData.title, url: `${siteUrl}/articles/${slug}/${section}` },
  ];

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: sectionData.title,
    description: sectionData.description || article.description,
    datePublished: article.publishedAt,
    author: {
      "@type": "Person",
      name: article.author,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/articles/${slug}/${section}`,
    },
    keywords: article.tags.join(", "),
    proficiencyLevel: article.difficulty,
    isPartOf: {
      "@type": "Article",
      name: article.title,
      url: `${siteUrl}/articles/${slug}`,
    },
  };

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <JsonLdScript data={articleJsonLd} />
      <ArticleSectionClient
        article={article}
        section={sectionData}
        sectionIndex={sectionIndex}
      />
    </>
  );
}
