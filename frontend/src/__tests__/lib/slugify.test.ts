import { describe, it, expect } from "vitest";
import { slugify, findSectionIndexBySlug } from "@/lib/slugify";

describe("slugify", () => {
  describe("basic conversions", () => {
    it("converts title to lowercase kebab-case", () => {
      expect(slugify("Minimum Arrows to Burst Balloons")).toBe(
        "minimum-arrows-to-burst-balloons"
      );
    });

    it("converts simple title", () => {
      expect(slugify("Hello World")).toBe("hello-world");
    });

    it("handles single word", () => {
      expect(slugify("Introduction")).toBe("introduction");
    });
  });

  describe("special characters", () => {
    it("handles colons", () => {
      expect(slugify("Meeting Rooms: Line Sweep")).toBe(
        "meeting-rooms-line-sweep"
      );
    });

    it("removes question marks", () => {
      expect(slugify("What's the Problem?")).toBe("whats-the-problem");
    });

    it("removes parentheses", () => {
      expect(slugify("Binary Search (Advanced)")).toBe(
        "binary-search-advanced"
      );
    });

    it("removes brackets", () => {
      expect(slugify("Array [Basics]")).toBe("array-basics");
    });

    it("removes ampersands", () => {
      expect(slugify("Arrays & Strings")).toBe("arrays-strings");
    });

    it("removes periods", () => {
      expect(slugify("Dr. Strange")).toBe("dr-strange");
    });

    it("removes commas", () => {
      expect(slugify("One, Two, Three")).toBe("one-two-three");
    });

    it("removes exclamation marks", () => {
      expect(slugify("Hello World!")).toBe("hello-world");
    });
  });

  describe("whitespace handling", () => {
    it("handles multiple spaces", () => {
      expect(slugify("Hello   World")).toBe("hello-world");
    });

    it("handles leading spaces", () => {
      expect(slugify("  Hello World")).toBe("hello-world");
    });

    it("handles trailing spaces", () => {
      expect(slugify("Hello World  ")).toBe("hello-world");
    });

    it("handles leading and trailing spaces", () => {
      expect(slugify("  Hello World  ")).toBe("hello-world");
    });

    it("handles tabs", () => {
      expect(slugify("Hello\tWorld")).toBe("hello-world");
    });
  });

  describe("numbers", () => {
    it("preserves numbers", () => {
      expect(slugify("Two Sum 2")).toBe("two-sum-2");
    });

    it("handles leading numbers", () => {
      expect(slugify("3 Sum Problem")).toBe("3-sum-problem");
    });

    it("handles numbers only", () => {
      expect(slugify("123")).toBe("123");
    });
  });

  describe("hyphens", () => {
    it("preserves existing hyphens", () => {
      expect(slugify("Two-Pointer Technique")).toBe("two-pointer-technique");
    });

    it("collapses multiple hyphens", () => {
      expect(slugify("Hello--World")).toBe("hello-world");
    });

    it("removes leading hyphens", () => {
      expect(slugify("-Hello World")).toBe("hello-world");
    });

    it("removes trailing hyphens", () => {
      expect(slugify("Hello World-")).toBe("hello-world");
    });
  });

  describe("edge cases", () => {
    it("handles empty string", () => {
      expect(slugify("")).toBe("");
    });

    it("handles only spaces", () => {
      expect(slugify("   ")).toBe("");
    });

    it("handles only special characters", () => {
      expect(slugify("!@#$%")).toBe("");
    });

    it("handles unicode characters", () => {
      // Non-word characters are removed
      expect(slugify("Café")).toBe("caf");
    });

    it("handles mixed case", () => {
      expect(slugify("HeLLo WoRLd")).toBe("hello-world");
    });
  });

  describe("real-world section titles", () => {
    it("handles Introduction to Interval Problems", () => {
      expect(slugify("Introduction to Interval Problems")).toBe(
        "introduction-to-interval-problems"
      );
    });

    it("handles Merge Overlapping Intervals", () => {
      expect(slugify("Merge Overlapping Intervals")).toBe(
        "merge-overlapping-intervals"
      );
    });

    it("handles Non-overlapping Selection (Greedy)", () => {
      expect(slugify("Non-overlapping Selection (Greedy)")).toBe(
        "non-overlapping-selection-greedy"
      );
    });

    it("handles Edge Cases Checklist", () => {
      expect(slugify("Edge Cases Checklist")).toBe("edge-cases-checklist");
    });

    it("handles How to Choose the Right Approach", () => {
      expect(slugify("How to Choose the Right Approach")).toBe(
        "how-to-choose-the-right-approach"
      );
    });
  });
});

describe("findSectionIndexBySlug", () => {
  const sections = [
    { title: "Introduction to Interval Problems" },
    { title: "Merge Overlapping Intervals" },
    { title: "Insert Interval" },
    { title: "Meeting Rooms: Line Sweep" },
    { title: "Non-overlapping Selection (Greedy)" },
    { title: "Interval List Intersection" },
    { title: "Minimum Arrows to Burst Balloons" },
  ];

  describe("exact matches", () => {
    it("finds first section (index 0)", () => {
      expect(
        findSectionIndexBySlug(sections, "introduction-to-interval-problems")
      ).toBe(0);
    });

    it("finds middle section", () => {
      expect(findSectionIndexBySlug(sections, "meeting-rooms-line-sweep")).toBe(
        3
      );
    });

    it("finds last section", () => {
      expect(
        findSectionIndexBySlug(sections, "minimum-arrows-to-burst-balloons")
      ).toBe(6);
    });

    it("finds section with special characters in title", () => {
      expect(
        findSectionIndexBySlug(sections, "non-overlapping-selection-greedy")
      ).toBe(4);
    });
  });

  describe("case insensitivity", () => {
    it("handles uppercase slug", () => {
      expect(
        findSectionIndexBySlug(sections, "MERGE-OVERLAPPING-INTERVALS")
      ).toBe(1);
    });

    it("handles mixed case slug", () => {
      expect(findSectionIndexBySlug(sections, "Insert-INTERVAL")).toBe(2);
    });

    it("handles lowercase slug", () => {
      expect(findSectionIndexBySlug(sections, "insert-interval")).toBe(2);
    });
  });

  describe("not found cases", () => {
    it("returns -1 for non-existent slug", () => {
      expect(findSectionIndexBySlug(sections, "non-existent-section")).toBe(-1);
    });

    it("returns -1 for empty slug", () => {
      expect(findSectionIndexBySlug(sections, "")).toBe(-1);
    });

    it("returns -1 for partial match", () => {
      expect(findSectionIndexBySlug(sections, "introduction")).toBe(-1);
    });

    it("returns -1 for slug with extra words", () => {
      expect(
        findSectionIndexBySlug(
          sections,
          "introduction-to-interval-problems-extra"
        )
      ).toBe(-1);
    });
  });

  describe("edge cases", () => {
    it("handles empty sections array", () => {
      expect(findSectionIndexBySlug([], "any-slug")).toBe(-1);
    });

    it("handles single section array", () => {
      const singleSection = [{ title: "Only Section" }];
      expect(findSectionIndexBySlug(singleSection, "only-section")).toBe(0);
      expect(findSectionIndexBySlug(singleSection, "other")).toBe(-1);
    });

    it("handles sections with similar titles", () => {
      const similarSections = [
        { title: "Binary Search" },
        { title: "Binary Search Tree" },
        { title: "Binary Search Variations" },
      ];
      expect(findSectionIndexBySlug(similarSections, "binary-search")).toBe(0);
      expect(
        findSectionIndexBySlug(similarSections, "binary-search-tree")
      ).toBe(1);
      expect(
        findSectionIndexBySlug(similarSections, "binary-search-variations")
      ).toBe(2);
    });
  });
});
