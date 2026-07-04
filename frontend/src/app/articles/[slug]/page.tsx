import { Metadata } from "next";
import { notFound } from "next/navigation";
import { articles, getArticleBySlug } from "@/content/articles";
import { siteConfig } from "@/lib/seo";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import ArticleOverviewContent from "./ArticleOverviewContent";

const siteUrl = siteConfig.url;

export function generateStaticParams() {
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return { title: "Article Not Found" };
  }

  return {
    title: article.title,
    description: article.description,
    keywords: article.tags,
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      url: `${siteUrl}/articles/${slug}`,
      siteName: siteConfig.name,
      locale: "en_US",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
      images: ["/opengraph-image"],
    },
    alternates: {
      canonical: `${siteUrl}/articles/${slug}`,
    },
  };
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArticleOverviewPage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
    return null;
  }

  const breadcrumbs = [
    { name: "Home", url: siteUrl },
    { name: "Articles", url: `${siteUrl}/articles` },
    { name: article.title, url: `${siteUrl}/articles/${slug}` },
  ];

  return (
    <>
      <ArticleJsonLd
        title={article.title}
        description={article.description}
        url={`${siteUrl}/articles/${slug}`}
        datePublished={article.publishedAt}
        author={article.author}
      />
      <BreadcrumbJsonLd items={breadcrumbs} />
      <ArticleOverviewContent article={article} />
    </>
  );
}
