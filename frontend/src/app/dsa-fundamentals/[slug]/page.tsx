import { Metadata } from "next";
import { notFound } from "next/navigation";
import { concepts, getConceptBySlug } from "@/lib/dsa-fundamentals";
import ConceptPageClient from "./ConceptPageClient";
import { ConceptJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://algopatterns.in";

export const generateStaticParams = () =>
  concepts.map((concept) => ({
    slug: concept.slug,
  }));

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> => {
  const { slug } = await params;
  const concept = getConceptBySlug(slug);

  if (!concept) {
    return {
      title: "Concept Not Found",
      description: "The requested concept could not be found.",
    };
  }

  const title = `${concept.name} - DSA Fundamentals`;
  const description = `${concept.description} Learn with code examples in Java, Python, C++, and JavaScript.`;

  return {
    title,
    description,
    keywords: [
      concept.name.toLowerCase(),
      concept.category.toLowerCase(),
      "dsa",
      "data structures",
      "algorithms",
      "coding interview",
      "leetcode",
      "java",
      "python",
      "cpp",
    ],
    openGraph: {
      title,
      description,
      type: "article",
      url: `${siteUrl}/dsa-fundamentals/${slug}`,
      siteName: "AlgoPatterns",
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
      canonical: `${siteUrl}/dsa-fundamentals/${slug}`,
    },
  };
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

const ConceptPage = async ({ params }: PageProps) => {
  const { slug } = await params;
  const concept = getConceptBySlug(slug);

  if (!concept) {
    notFound();
  }

  const breadcrumbs = [
    { name: "Home", url: siteUrl },
    { name: "DSA Fundamentals", url: `${siteUrl}/dsa-fundamentals` },
    { name: concept.name, url: `${siteUrl}/dsa-fundamentals/${slug}` },
  ];

  return (
    <>
      <ConceptJsonLd concept={concept} />
      <BreadcrumbJsonLd items={breadcrumbs} />
      <ConceptPageClient concept={concept} />
    </>
  );
};

export default ConceptPage;
