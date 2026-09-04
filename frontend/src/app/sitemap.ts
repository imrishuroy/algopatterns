import { MetadataRoute } from "next";
import patternsData from "@/lib/patterns.json";
import { Pattern } from "@/types";
import { concepts } from "@/lib/dsa-fundamentals";
import { articles } from "@/content/articles";
import { getLanguageMetas, getLanguageGuide } from "@/lib/languages";
import type { SupportedGuideLanguage } from "@/types/languages";
import { slugify } from "@/lib/slugify";
import { questions } from "@/lib/questions";

const patterns = patternsData as Pattern[];

const sitemap = (): MetadataRoute.Sitemap => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://algopatterns.in";

  // Use a stable date so the sitemap doesn't change on every build.
  // Update this when content on the corresponding page actually changes.
  const now = new Date("2026-07-04");

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/patterns`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/dsa-fundamentals`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/articles`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/interview-cheatsheet`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pattern-recognition`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guides/expand-around-center`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // Legal pages
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/refund`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    // login/register/account/auth excluded — no SEO value and wastes crawl budget
  ];

  const patternSectionPages: MetadataRoute.Sitemap = [];
  for (const pattern of patterns) {
    if (pattern.tutorial && pattern.tutorial.length > 0) {
      for (const section of pattern.tutorial) {
        patternSectionPages.push({
          url: `${baseUrl}/patterns/${pattern.id}/${slugify(section.title)}`,
          lastModified: now,
          changeFrequency: "monthly" as const,
          priority: 0.9,
        });
      }
      patternSectionPages.push({
        url: `${baseUrl}/patterns/${pattern.id}/quiz`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      });
    }
  }

  const patternPages = patternSectionPages;

  const conceptPages: MetadataRoute.Sitemap = concepts.map((concept) => ({
    url: `${baseUrl}/dsa-fundamentals/${concept.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.85,
  }));

  const articleSectionPages: MetadataRoute.Sitemap = [];
  for (const article of articles) {
    for (const section of article.sections) {
      articleSectionPages.push({
        url: `${baseUrl}/articles/${article.slug}/${section.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.85,
      });
    }
  }

  const articlePages: MetadataRoute.Sitemap = [
    ...articles.map((article) => ({
      url: `${baseUrl}/articles/${article.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...articleSectionPages,
  ];

  const languageHubPage: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/languages`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  const languageSectionPages: MetadataRoute.Sitemap = [];
  for (const langMeta of getLanguageMetas()) {
    if (!langMeta.available) continue;

    const guide = getLanguageGuide(langMeta.id as SupportedGuideLanguage);
    if (!guide) continue;

    for (const section of guide.sections) {
      languageSectionPages.push({
        url: `${baseUrl}/languages/${langMeta.id}/${section.id}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: section.category === "Concurrency" ? 0.9 : 0.85,
      });
    }
  }

  const languagePages = [...languageHubPage, ...languageSectionPages];

  const problemPages: MetadataRoute.Sitemap = questions.map((question) => ({
    url: `${baseUrl}/problems/${slugify(question.name)}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  return [
    ...staticPages,
    ...patternPages,
    ...conceptPages,
    ...articlePages,
    ...languagePages,
    ...problemPages,
  ];
};

export default sitemap;
