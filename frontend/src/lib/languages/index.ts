import type {
  LanguageGuide,
  LanguageMeta,
  SupportedGuideLanguage,
} from "@/types/languages";
import goGuide from "./go.json";

// Type assertion for imported JSON
const guides: Record<SupportedGuideLanguage, LanguageGuide | null> = {
  go: goGuide as LanguageGuide,
  rust: null, // Coming soon
  java: null, // Coming soon
  python: null, // Coming soon
};

// Get a specific language guide
export const getLanguageGuide = (
  lang: SupportedGuideLanguage
): LanguageGuide | null => {
  return guides[lang] || null;
};

// Get all available language guides
export const getAllLanguageGuides = (): LanguageGuide[] => {
  return Object.values(guides).filter(
    (guide): guide is LanguageGuide => guide !== null
  );
};

// Get metadata for all languages (for hub page)
export const getLanguageMetas = (): LanguageMeta[] => {
  const metas: LanguageMeta[] = [
    {
      id: "go",
      name: "Go",
      displayName: "Data Structures and Algorithms in Go",
      description:
        "Master data structures and algorithms using Go with idiomatic code and efficient patterns.",
      sectionCount: goGuide.sections.length,
      difficulty: "Beginner to Advanced",
      icon: "go",
      available: true,
      version: goGuide.version,
    },
    {
      id: "rust",
      name: "Rust",
      displayName: "Data Structures and Algorithms in Rust",
      description:
        "Learn memory-safe implementations with Rust's ownership model.",
      sectionCount: 0,
      difficulty: "Intermediate to Advanced",
      icon: "rust",
      available: false,
    },
    {
      id: "java",
      name: "Java",
      displayName: "Data Structures and Algorithms in Java",
      description:
        "Comprehensive guide using Java collections and modern features.",
      sectionCount: 0,
      difficulty: "Beginner to Advanced",
      icon: "java",
      available: false,
    },
    {
      id: "python",
      name: "Python",
      displayName: "Data Structures and Algorithms in Python",
      description:
        "Pythonic approaches to data structures and algorithms for interviews.",
      sectionCount: 0,
      difficulty: "Beginner to Advanced",
      icon: "python",
      available: false,
    },
  ];

  return metas;
};

// Check if a language is supported and available
export const isLanguageAvailable = (lang: string): lang is SupportedGuideLanguage => {
  return lang in guides && guides[lang as SupportedGuideLanguage] !== null;
};

// Get all supported language IDs
export const getSupportedLanguages = (): SupportedGuideLanguage[] => {
  return Object.keys(guides) as SupportedGuideLanguage[];
};

// Get section categories for sidebar grouping
export const getSectionCategories = (guide: LanguageGuide): string[] => {
  const categories = new Set<string>();
  for (const section of guide.sections) {
    categories.add(section.category);
  }
  return Array.from(categories);
};

// Get sections by category
export const getSectionsByCategory = (
  guide: LanguageGuide,
  category: string
) => {
  return guide.sections.filter((section) => section.category === category);
};

// Find section index by ID
export const findSectionIndexById = (
  guide: LanguageGuide,
  sectionId: string
): number => {
  return guide.sections.findIndex((s) => s.id === sectionId);
};
