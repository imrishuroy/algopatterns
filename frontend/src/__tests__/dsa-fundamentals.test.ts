import { describe, it, expect } from "vitest";
import {
  concepts,
  conceptCategories,
  getConceptBySlug,
  getConceptsByCategory,
} from "@/lib/dsa-fundamentals";

describe("dsa-fundamentals data", () => {
  it("exports concepts array with items", () => {
    expect(Array.isArray(concepts)).toBe(true);
    expect(concepts.length).toBeGreaterThan(0);
  });

  it("has 62 concepts", () => {
    expect(concepts.length).toBe(62);
  });

  it("exports conceptCategories array", () => {
    expect(Array.isArray(conceptCategories)).toBe(true);
    expect(conceptCategories.length).toBe(8);
  });

  it("has all expected categories", () => {
    const expectedCategories = [
      "Data Structures",
      "Collections & Maps",
      "Arrays & Sorting",
      "String & Character",
      "Type Conversions & Math",
      "Arithmetic Patterns",
      "Java Fundamentals",
      "Algorithm Idioms",
    ];

    expectedCategories.forEach((category) => {
      expect(conceptCategories).toContain(category);
    });
  });

  describe("concept structure", () => {
    it("each concept has required fields", () => {
      concepts.forEach((concept) => {
        expect(concept).toHaveProperty("id");
        expect(concept).toHaveProperty("name");
        expect(concept).toHaveProperty("slug");
        expect(concept).toHaveProperty("category");
        expect(concept).toHaveProperty("description");
        expect(concept).toHaveProperty("whenToUse");
        expect(concept).toHaveProperty("codeSnippets");
        expect(concept).toHaveProperty("createdAt");
        expect(concept).toHaveProperty("updatedAt");
      });
    });

    it("each concept has code snippets for all 4 languages", () => {
      concepts.forEach((concept) => {
        expect(concept.codeSnippets).toHaveProperty("java");
        expect(concept.codeSnippets).toHaveProperty("python");
        expect(concept.codeSnippets).toHaveProperty("cpp");
        expect(concept.codeSnippets).toHaveProperty("javascript");

        expect(typeof concept.codeSnippets.java).toBe("string");
        expect(typeof concept.codeSnippets.python).toBe("string");
        expect(typeof concept.codeSnippets.cpp).toBe("string");
        expect(typeof concept.codeSnippets.javascript).toBe("string");
      });
    });

    it("each concept has time and space complexity", () => {
      concepts.forEach((concept) => {
        expect(concept).toHaveProperty("timeComplexity");
        expect(concept).toHaveProperty("spaceComplexity");
        expect(typeof concept.timeComplexity).toBe("string");
        expect(typeof concept.spaceComplexity).toBe("string");
      });
    });

    it("each concept has a valid category", () => {
      concepts.forEach((concept) => {
        expect(conceptCategories).toContain(concept.category);
      });
    });

    it("each concept has unique id and slug", () => {
      const ids = concepts.map((c) => c.id);
      const slugs = concepts.map((c) => c.slug);

      expect(new Set(ids).size).toBe(ids.length);
      expect(new Set(slugs).size).toBe(slugs.length);
    });

    it("whenToUse is a non-empty array", () => {
      concepts.forEach((concept) => {
        expect(Array.isArray(concept.whenToUse)).toBe(true);
        expect(concept.whenToUse.length).toBeGreaterThan(0);
      });
    });
  });

  describe("getConceptBySlug", () => {
    it("returns concept for valid slug", () => {
      const concept = getConceptBySlug("priority-queue-heap");

      expect(concept).toBeDefined();
      expect(concept?.name).toBe("Priority Queue & Heap");
      expect(concept?.category).toBe("Data Structures");
    });

    it("returns undefined for invalid slug", () => {
      const concept = getConceptBySlug("invalid-slug-123");

      expect(concept).toBeUndefined();
    });

    it("returns correct concept for various slugs", () => {
      const testCases = [
        { slug: "hashmap-operations", nameContains: "HashMap Operations" },
        { slug: "binary-search-boundaries", nameContains: "Binary Search" },
        { slug: "sliding-window-template", nameContains: "Sliding Window" },
      ];

      testCases.forEach(({ slug, nameContains }) => {
        const concept = getConceptBySlug(slug);
        expect(concept).toBeDefined();
        expect(concept?.name).toContain(nameContains);
      });
    });
  });

  describe("getConceptsByCategory", () => {
    it("returns concepts for valid category", () => {
      const dataStructures = getConceptsByCategory("Data Structures");

      expect(dataStructures.length).toBeGreaterThan(0);
      dataStructures.forEach((concept) => {
        expect(concept.category).toBe("Data Structures");
      });
    });

    it("returns empty array for invalid category", () => {
      const concepts = getConceptsByCategory("Invalid Category");

      expect(concepts).toEqual([]);
    });

    it("returns correct count for Algorithm Idioms", () => {
      const idioms = getConceptsByCategory("Algorithm Idioms");

      expect(idioms.length).toBeGreaterThan(10);
    });
  });

  describe("related patterns validation", () => {
    it("all relatedPatterns are valid pattern IDs", () => {
      const validPatternIds = [
        "arrays-strings",
        "backtracking",
        "binary-search",
        "dynamic-programming",
        "graphs",
        "greedy",
        "hash-map",
        "heap",
        "intervals",
        "linked-list",
        "prefix-sum",
        "sliding-window",
        "stack",
        "trees",
        "trie",
        "two-pointers",
        "union-find",
      ];

      concepts.forEach((concept) => {
        if (concept.relatedPatterns) {
          concept.relatedPatterns.forEach((pattern) => {
            expect(validPatternIds).toContain(pattern);
          });
        }
      });
    });
  });
});
