import { siteConfig } from "@/lib/seo";
import { Pattern } from "@/types";

/**
 * Renders JSON-LD structured data as a script tag.
 * Safe to use dangerouslySetInnerHTML here because:
 * 1. Data is from controlled internal sources (not user input)
 * 2. JSON.stringify escapes any special characters
 * 3. This is the standard pattern for JSON-LD in React/Next.js
 */
function JsonLdScript({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function WebsiteJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/patterns?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return <JsonLdScript data={jsonLd} />;
}

export function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    sameAs: [
      "https://twitter.com/algopatterns",
      "https://github.com/algopatterns",
    ],
  };

  return <JsonLdScript data={jsonLd} />;
}

export function CourseJsonLd({ pattern }: { pattern: Pattern }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: `${pattern.category} Pattern`,
    description: pattern.description,
    provider: {
      "@type": "Organization",
      name: siteConfig.name,
      sameAs: siteConfig.url,
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: "PT2H",
    },
    teaches: pattern.whenToUse,
    educationalLevel: pattern.difficulty,
    isAccessibleForFree: true,
    inLanguage: "en",
  };

  return <JsonLdScript data={jsonLd} />;
}

type FAQ = {
  question: string;
  answer: string;
};

export function FAQJsonLd({ faqs }: { faqs: FAQ[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return <JsonLdScript data={jsonLd} />;
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return <JsonLdScript data={jsonLd} />;
}

export function ArticleJsonLd({
  title,
  description,
  url,
  datePublished,
  dateModified,
  author,
}: {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      "@type": "Organization",
      name: author || siteConfig.name,
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
      "@id": url,
    },
  };

  return <JsonLdScript data={jsonLd} />;
}
