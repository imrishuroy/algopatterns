// Local search utility for static content (concepts, articles, solutions, patterns)
// Uses Fuse.js for fuzzy search with typo tolerance

import Fuse, { IFuseOptions } from "fuse.js";
import { concepts } from "./dsa-fundamentals";
import { solutions } from "./solutions";
import { articles } from "@/content/articles";
import patternsData from "./patterns.json";
import type { SearchResult, SearchContentType, Pattern } from "@/types";

const patterns = patternsData as Pattern[];

interface LocalSearchOptions {
  limit?: number;
  types?: SearchContentType[];
}

// Searchable item interface for Fuse.js
interface SearchableItem {
  id: string;
  type: SearchContentType;
  title: string;
  description: string;
  category?: string;
  keywords?: string;
  difficulty?: string;
  url: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  slug?: string;
  parentTitle?: string;
}

// Fuse.js options with weighted fields
// Lower weight = more important (Fuse uses inverse scoring)
const fuseOptions: IFuseOptions<SearchableItem> = {
  // Keys to search with weights (lower = more important)
  keys: [
    { name: "title", weight: 0.4 },
    { name: "category", weight: 0.5 },
    { name: "keywords", weight: 0.6 },
    { name: "description", weight: 0.8 },
  ],
  // Fuzzy matching settings
  threshold: 0.4, // 0 = exact match, 1 = match anything (0.4 is good balance)
  distance: 100, // How far to search for fuzzy match
  minMatchCharLength: 2,
  includeScore: true,
  ignoreLocation: true, // Search entire string, not just beginning
  useExtendedSearch: false,
  findAllMatches: true,
};

// Build searchable items from all content sources
function buildSearchableItems(): SearchableItem[] {
  const items: SearchableItem[] = [];

  // Add concepts
  for (const concept of concepts) {
    items.push({
      id: concept.id,
      type: "concept",
      title: concept.name,
      description: concept.description,
      category: concept.category,
      keywords: [
        ...(concept.whenToUse || []),
        ...(concept.keyPoints || []),
        ...(concept.relatedProblems || []),
      ].join(" "),
      url: `/dsa-fundamentals/${concept.slug}`,
      timeComplexity: concept.timeComplexity,
      spaceComplexity: concept.spaceComplexity,
      slug: concept.slug,
    });
  }

  // Add patterns
  for (const pattern of patterns) {
    items.push({
      id: pattern.id,
      type: "pattern",
      title: pattern.category,
      description: pattern.description,
      category: pattern.category,
      keywords: [
        ...(pattern.whenToUse || []),
        ...(pattern.keyInsights || []),
        ...pattern.commonProblems,
      ].join(" "),
      difficulty: pattern.difficulty,
      url: `/patterns/${pattern.id}`,
      timeComplexity: pattern.timeComplexity,
      spaceComplexity: pattern.spaceComplexity,
      slug: pattern.id,
    });

    // Add pattern variations (link to parent pattern page)
    for (const variation of pattern.variations || []) {
      items.push({
        id: `${pattern.id}-${variation.id}`,
        type: "pattern",
        title: variation.name,
        description: variation.desc,
        category: pattern.category,
        keywords: variation.when || "",
        difficulty: pattern.difficulty,
        url: `/patterns/${pattern.id}`,
        slug: pattern.id,
        parentTitle: pattern.category,
      });
    }

    // Add tutorial sections (link with hash for direct navigation)
    for (let i = 0; i < (pattern.tutorial || []).length; i++) {
      const section = pattern.tutorial![i];
      items.push({
        id: `${pattern.id}-section-${i}`,
        type: "pattern",
        title: section.title,
        description: section.content.slice(0, 200),
        category: pattern.category,
        keywords: section.exampleName || "",
        difficulty: pattern.difficulty,
        url: `/patterns/${pattern.id}#section-${i}`,
        slug: pattern.id,
        parentTitle: pattern.category,
      });
    }
  }

  // Add solutions
  for (const [slug, solution] of Object.entries(solutions)) {
    const title = slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    items.push({
      id: slug,
      type: "solution",
      title: title,
      description: solution.approach,
      keywords: solution.steps.join(" "),
      url: `/problems/${slug}`,
      timeComplexity: solution.timeComplexity,
      spaceComplexity: solution.spaceComplexity,
    });
  }

  // Add articles and sections
  for (const article of articles) {
    items.push({
      id: article.slug,
      type: "article",
      title: article.title,
      description: article.description,
      category: article.tags[0],
      keywords: article.tags.join(" "),
      difficulty: article.difficulty,
      url: `/articles/${article.slug}`,
    });

    // Add article sections
    for (const section of article.sections) {
      items.push({
        id: `${article.slug}-${section.slug}`,
        type: "article",
        title: section.title,
        description: section.description,
        category: article.tags[0],
        url: `/articles/${article.slug}/${section.slug}`,
        difficulty: article.difficulty,
        parentTitle: article.title,
      });
    }
  }

  return items;
}

// Lazy-initialized Fuse instance
let fuseInstance: Fuse<SearchableItem> | null = null;
let searchableItems: SearchableItem[] | null = null;

function getFuseInstance(): Fuse<SearchableItem> {
  if (!fuseInstance) {
    searchableItems = buildSearchableItems();
    fuseInstance = new Fuse(searchableItems, fuseOptions);
  }
  return fuseInstance;
}

// Convert Fuse result to SearchResult
function toSearchResult(item: SearchableItem, score: number): SearchResult {
  // Build title with parent context if available
  const displayTitle =
    item.parentTitle && item.type === "pattern"
      ? `${item.parentTitle}: ${item.title}`
      : item.type === "solution"
        ? `Solution: ${item.title}`
        : item.title;

  // Truncate description
  const truncatedDesc =
    item.description.length > 150
      ? item.description.slice(0, 150) + "..."
      : item.description;

  return {
    id: item.id,
    type: item.type,
    title: displayTitle,
    description: truncatedDesc,
    difficulty: item.difficulty,
    url: item.url,
    score: Math.round((1 - score) * 100), // Convert Fuse score (0-1, lower=better) to our score (0-100, higher=better)
    preview: {
      timeComplexity: item.timeComplexity,
      spaceComplexity: item.spaceComplexity,
      category: item.category,
      slug: item.slug,
    },
  };
}

// Main local search function with fuzzy matching
export function localSearch(
  query: string,
  options: LocalSearchOptions = {}
): Record<SearchContentType, SearchResult[]> {
  const { limit = 10, types } = options;

  const results: Record<SearchContentType, SearchResult[]> = {
    pattern: [],
    question: [],
    concept: [],
    article: [],
    solution: [],
    highlight: [],
  };

  if (!query || query.length < 2) {
    return results;
  }

  const fuse = getFuseInstance();
  const fuseResults = fuse.search(query, { limit: limit * 6 }); // Get more results to distribute across types

  // Group results by type
  for (const result of fuseResults) {
    const item = result.item;
    const score = result.score ?? 1;

    // Filter by types if specified
    if (types && !types.includes(item.type)) {
      continue;
    }

    // Add to appropriate type array if under limit
    if (results[item.type].length < limit) {
      results[item.type].push(toSearchResult(item, score));
    }
  }

  return results;
}

// Get total count from local search results
export function getLocalSearchCount(
  results: Record<SearchContentType, SearchResult[]>
): number {
  return Object.values(results).reduce((sum, arr) => sum + arr.length, 0);
}

// Merge local and API search results
export function mergeSearchResults(
  localResults: Record<SearchContentType, SearchResult[]>,
  apiResults: Record<SearchContentType, SearchResult[]>
): Record<SearchContentType, SearchResult[]> {
  const merged: Record<SearchContentType, SearchResult[]> = {
    pattern: [],
    question: [],
    concept: [],
    article: [],
    solution: [],
    highlight: [],
  };

  const contentTypes: SearchContentType[] = [
    "pattern",
    "question",
    "concept",
    "article",
    "solution",
    "highlight",
  ];

  for (const type of contentTypes) {
    const local = localResults[type] || [];
    const api = apiResults[type] || [];

    // Dedupe by id, prefer API results (they may have more info)
    const seenIds = new Set<string>();
    const combined: SearchResult[] = [];

    // Add API results first
    for (const result of api) {
      if (!seenIds.has(result.id)) {
        seenIds.add(result.id);
        combined.push(result);
      }
    }

    // Add local results that aren't duplicates
    for (const result of local) {
      if (!seenIds.has(result.id)) {
        seenIds.add(result.id);
        combined.push(result);
      }
    }

    // Sort by score and take top results
    merged[type] = combined.sort((a, b) => b.score - a.score).slice(0, 10);
  }

  return merged;
}

// Reset the Fuse instance (useful for testing)
export function resetSearchIndex(): void {
  fuseInstance = null;
  searchableItems = null;
}
