import { MetadataRoute } from "next";
import patternsData from "@/lib/patterns.json";
import { Pattern } from "@/types";
import { concepts } from "@/lib/dsa-fundamentals";
import { articles } from "@/content/articles";

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
    // login/register/account/auth excluded — no SEO value and wastes crawl budget
  ];

  const patternPages: MetadataRoute.Sitemap = patterns.map((pattern) => ({
    url: `${baseUrl}/patterns/${pattern.id}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.9,
  }));

  const conceptPages: MetadataRoute.Sitemap = concepts.map((concept) => ({
    url: `${baseUrl}/dsa-fundamentals/${concept.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.85,
  }));

  const articlePages: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${baseUrl}/articles/${article.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...patternPages, ...conceptPages, ...articlePages];
};

export default sitemap;
