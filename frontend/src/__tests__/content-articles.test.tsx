import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/components/ui/CodeBlock", () => ({
  default: ({ code, language }: { code: string; language?: string }) => (
    <div data-testid="code-block" data-language={language}>
      {typeof code === "string" ? code.substring(0, 80) : ""}
    </div>
  ),
}));

vi.mock("@/components/visualizers/CallStackVisualizer", () => ({
  default: () => <div data-testid="call-stack-visualizer" />,
}));

vi.mock("@/components/visualizers/StepByStepExecutor", () => ({
  default: () => <div data-testid="step-by-step-executor" />,
}));

vi.mock("@/components/visualizers/MemoryVisualizer", () => ({
  default: () => <div data-testid="memory-visualizer" />,
}));

vi.mock("@/components/visualizers/RecursionTypesVisualizer", () => ({
  default: () => <div data-testid="recursion-types-visualizer" />,
}));

vi.mock("@/components/visualizers/RecursionTreeVisualizer", () => ({
  default: () => <div data-testid="recursion-tree-visualizer" />,
}));

import {
  articles,
  getArticleBySlug,
  getArticleSections,
  getSection,
} from "@/content/articles";

import {
  sections as algoSectionMap,
  getSectionComponent as getAlgoSectionComponent,
} from "@/content/articles/algorithm-paradigms/sections";

import {
  sections as recursionSectionMap,
  getSectionComponent as getRecursionSectionComponent,
} from "@/content/articles/recursion/sections";

import QuickComparisonSection from "@/content/articles/algorithm-paradigms/sections/quick-comparison";
import KeyDifferencesSection from "@/content/articles/algorithm-paradigms/sections/key-differences";
import HowToIdentifySection from "@/content/articles/algorithm-paradigms/sections/how-to-identify";
import ConstraintsGuideSection from "@/content/articles/algorithm-paradigms/sections/constraints-guide";
import CommonPitfallsSection from "@/content/articles/algorithm-paradigms/sections/common-pitfalls";

import FundamentalsSection from "@/content/articles/recursion/sections/fundamentals";
import TypesSection from "@/content/articles/recursion/sections/types";
import NumbersSection from "@/content/articles/recursion/sections/numbers";
import StringsSection from "@/content/articles/recursion/sections/strings";
import ArraysSection from "@/content/articles/recursion/sections/arrays";
import DataStructuresSection from "@/content/articles/recursion/sections/data-structures";

const requiredArticleFields = [
  "title",
  "slug",
  "description",
  "author",
  "authorAvatar",
  "publishedAt",
  "difficulty",
  "estimatedTime",
  "tags",
  "sections",
] as const;

const requiredSectionFields = [
  "slug",
  "title",
  "description",
  "order",
  "estimatedTime",
] as const;

const validDifficulties = ["beginner", "intermediate", "advanced"];

describe("content/articles/index.ts - article registry", () => {
  it("exports articles array with items", () => {
    expect(Array.isArray(articles)).toBe(true);
    expect(articles.length).toBeGreaterThan(0);
  });

  it("has exactly 2 articles", () => {
    expect(articles.length).toBe(2);
  });

  it("each article has all required fields", () => {
    articles.forEach((article) => {
      requiredArticleFields.forEach((field) => {
        expect(article).toHaveProperty(field);
        const value = article[field];
        if (field === "difficulty") {
          expect(validDifficulties).toContain(value);
        } else if (field === "tags") {
          expect(Array.isArray(value)).toBe(true);
          expect(value.length).toBeGreaterThan(0);
        } else if (field === "sections") {
          expect(Array.isArray(value)).toBe(true);
          expect(value.length).toBeGreaterThan(0);
        } else {
          expect(typeof value).toBe("string");
          expect(value).toBeTruthy();
        }
      });
    });
  });

  it("article slugs are unique", () => {
    const slugs = articles.map((a) => a.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("each article section has all required fields", () => {
    articles.forEach((article) => {
      article.sections.forEach((section) => {
        requiredSectionFields.forEach((field) => {
          expect(section).toHaveProperty(field);
          const value = section[field];
          if (field === "order") {
            expect(typeof value).toBe("number");
          } else {
            expect(typeof value).toBe("string");
            expect(value).toBeTruthy();
          }
        });
      });
    });
  });

  it("section slugs are unique within each article", () => {
    articles.forEach((article) => {
      const slugs = article.sections.map((s) => s.slug);
      expect(new Set(slugs).size).toBe(slugs.length);
    });
  });

  describe("getArticleBySlug", () => {
    it("returns algorithm-paradigms article", () => {
      const article = getArticleBySlug("algorithm-paradigms");
      expect(article).toBeDefined();
      expect(article?.title).toContain("Recursion vs Backtracking");
    });

    it("returns recursion article", () => {
      const article = getArticleBySlug("recursion");
      expect(article).toBeDefined();
      expect(article?.title).toContain("Mastering Recursion");
    });

    it("returns undefined for unknown slug", () => {
      expect(getArticleBySlug("non-existent-article")).toBeUndefined();
    });
  });

  describe("getArticleSections", () => {
    it("returns sections for existing article", () => {
      const sections = getArticleSections("algorithm-paradigms");
      expect(sections.length).toBe(5);
    });

    it("returns empty array for unknown article", () => {
      expect(getArticleSections("unknown-slug")).toEqual([]);
    });
  });

  describe("getSection", () => {
    it("returns section for valid article+section slug", () => {
      const section = getSection("algorithm-paradigms", "quick-comparison");
      expect(section).toBeDefined();
      expect(section?.title).toBe("Quick Comparison Table");
    });

    it("returns undefined for invalid section slug", () => {
      expect(getSection("algorithm-paradigms", "fake-section")).toBeUndefined();
    });
  });
});

describe("algorithm-paradigms/sections/index.ts", () => {
  const expectedSlugs = [
    "quick-comparison",
    "key-differences",
    "how-to-identify",
    "constraints-guide",
    "common-pitfalls",
  ];

  it("exports all 5 section components", () => {
    expectedSlugs.forEach((slug) => {
      expect(algoSectionMap).toHaveProperty(slug);
      expect(typeof algoSectionMap[slug]).toBe("function");
    });
  });

  it("exports exactly 5 sections", () => {
    expect(Object.keys(algoSectionMap).length).toBe(5);
  });

  it("section slugs in meta.json match section map keys", () => {
    const meta = getArticleBySlug("algorithm-paradigms");
    const metaSlugs = meta!.sections.map((s) => s.slug).sort();
    expect(metaSlugs).toEqual([...expectedSlugs].sort());
  });

  describe("getSectionComponent", () => {
    it("returns component for valid slug", () => {
      const component = getAlgoSectionComponent("how-to-identify");
      expect(component).toBeDefined();
      expect(typeof component).toBe("function");
    });

    it("returns undefined for invalid slug", () => {
      expect(getAlgoSectionComponent("invalid")).toBeUndefined();
    });
  });
});

describe("recursion/sections/index.ts", () => {
  const expectedSlugs = [
    "fundamentals",
    "types",
    "numbers",
    "strings",
    "arrays",
    "data-structures",
  ];

  it("exports all 6 section components", () => {
    expectedSlugs.forEach((slug) => {
      expect(recursionSectionMap).toHaveProperty(slug);
      expect(typeof recursionSectionMap[slug]).toBe("function");
    });
  });

  it("exports exactly 6 sections", () => {
    expect(Object.keys(recursionSectionMap).length).toBe(6);
  });

  it("section slugs in meta.json match section map keys", () => {
    const meta = getArticleBySlug("recursion");
    const metaSlugs = meta!.sections.map((s) => s.slug).sort();
    expect(metaSlugs).toEqual([...expectedSlugs].sort());
  });

  describe("getSectionComponent", () => {
    it("returns component for valid slug", () => {
      const component = getRecursionSectionComponent("fundamentals");
      expect(component).toBeDefined();
      expect(typeof component).toBe("function");
    });

    it("returns undefined for invalid slug", () => {
      expect(getRecursionSectionComponent("invalid")).toBeUndefined();
    });
  });
});

const algoSectionComponents: [string, React.ComponentType, string][] = [
  ["QuickComparisonSection", QuickComparisonSection, "Quick Comparison Table"],
  ["KeyDifferencesSection", KeyDifferencesSection, "Key Differences Explained"],
  [
    "HowToIdentifySection",
    HowToIdentifySection,
    "How to Identify the Right Approach",
  ],
  [
    "ConstraintsGuideSection",
    ConstraintsGuideSection,
    "Constraints-Based Selection",
  ],
  ["CommonPitfallsSection", CommonPitfallsSection, "Common Pitfalls & Traps"],
];

const recursionSectionComponents: [string, React.ComponentType, string][] = [
  ["FundamentalsSection", FundamentalsSection, "Fundamentals of Recursion"],
  ["TypesSection", TypesSection, "Types of Recursion"],
  ["NumbersSection", NumbersSection, "Recursion with Numbers"],
  ["StringsSection", StringsSection, "Recursion with Strings"],
  ["ArraysSection", ArraysSection, "Recursion with Arrays"],
  [
    "DataStructuresSection",
    DataStructuresSection,
    "Recursion with Data Structures",
  ],
];

function testSectionRender(
  name: string,
  Component: React.ComponentType,
  expectedHeading: string
) {
  describe(name, () => {
    it("renders without crashing", () => {
      const { container } = render(<Component />);
      expect(container).toBeTruthy();
    });

    it("renders non-empty content", () => {
      const { container } = render(<Component />);
      expect(container.textContent).toBeTruthy();
      expect(container.textContent!.trim().length).toBeGreaterThan(0);
    });

    it(`renders heading: ${expectedHeading}`, () => {
      render(<Component />);
      expect(
        screen.getByRole("heading", { level: 1, name: expectedHeading })
      ).toBeInTheDocument();
    });
  });
}

describe("Algorithm Paradigms section rendering", () => {
  algoSectionComponents.forEach(([name, Component, heading]) => {
    testSectionRender(name, Component, heading);
  });

  describe("HowToIdentifySection - specific content", () => {
    it("renders decision flowchart", () => {
      render(<HowToIdentifySection />);
      expect(screen.getByText("Decision Flowchart")).toBeInTheDocument();
    });

    it("renders keyword recognition guide", () => {
      render(<HowToIdentifySection />);
      expect(screen.getByText("Keyword Recognition Guide")).toBeInTheDocument();
    });
  });

  describe("CommonPitfallsSection - specific content", () => {
    it("renders greedy trap section", () => {
      render(<CommonPitfallsSection />);
      expect(
        screen.getByText("Pitfall 1: The Greedy Trap")
      ).toBeInTheDocument();
    });

    it("renders CodeBlock elements", () => {
      render(<CommonPitfallsSection />);
      const codeBlocks = screen.getAllByTestId("code-block");
      expect(codeBlocks.length).toBeGreaterThan(0);
    });
  });

  describe("ConstraintsGuideSection - specific content", () => {
    it("renders golden rule", () => {
      render(<ConstraintsGuideSection />);
      expect(screen.getByText("The Golden Rule")).toBeInTheDocument();
    });

    it("renders constraint to approach mapping", () => {
      render(<ConstraintsGuideSection />);
      expect(
        screen.getByText("Constraint → Approach Mapping")
      ).toBeInTheDocument();
    });
  });

  describe("KeyDifferencesSection - specific content", () => {
    it("renders decision tree model", () => {
      render(<KeyDifferencesSection />);
      expect(
        screen.getByText("The Decision Tree Mental Model")
      ).toBeInTheDocument();
    });
  });

  describe("QuickComparisonSection - specific content", () => {
    it("renders one-liner definitions", () => {
      render(<QuickComparisonSection />);
      expect(screen.getByText("One-Liner Definitions")).toBeInTheDocument();
    });

    it("renders how they relate", () => {
      render(<QuickComparisonSection />);
      expect(screen.getByText("How They Relate")).toBeInTheDocument();
    });
  });
});

describe("Recursion section rendering", () => {
  recursionSectionComponents.forEach(([name, Component, heading]) => {
    testSectionRender(name, Component, heading);
  });

  describe("FundamentalsSection - specific content", () => {
    it("renders key components", () => {
      render(<FundamentalsSection />);
      expect(
        screen.getByText("Key Components of Recursion")
      ).toBeInTheDocument();
    });

    it("renders visualizer components", () => {
      render(<FundamentalsSection />);
      expect(screen.getByTestId("call-stack-visualizer")).toBeInTheDocument();
      expect(screen.getByTestId("step-by-step-executor")).toBeInTheDocument();
      expect(screen.getByTestId("memory-visualizer")).toBeInTheDocument();
    });
  });

  describe("TypesSection - specific content", () => {
    it("renders summary of recursion types", () => {
      render(<TypesSection />);
      expect(
        screen.getByText("Summary of Recursion Types")
      ).toBeInTheDocument();
    });

    it("renders recursion types visualizer", () => {
      render(<TypesSection />);
      expect(
        screen.getByTestId("recursion-types-visualizer")
      ).toBeInTheDocument();
    });
  });

  describe("NumbersSection - specific content", () => {
    it("renders fibonacci section", () => {
      render(<NumbersSection />);
      expect(screen.getByText("Fibonacci Sequence")).toBeInTheDocument();
    });

    it("renders recursion tree visualizer", () => {
      render(<NumbersSection />);
      expect(
        screen.getByTestId("recursion-tree-visualizer")
      ).toBeInTheDocument();
    });
  });

  describe("StringsSection - specific content", () => {
    it("renders reverse string section", () => {
      render(<StringsSection />);
      expect(screen.getByText("Reverse a String")).toBeInTheDocument();
    });

    it("renders step-by-step executor", () => {
      render(<StringsSection />);
      expect(screen.getByTestId("step-by-step-executor")).toBeInTheDocument();
    });
  });

  describe("ArraysSection - specific content", () => {
    it("renders binary search section", () => {
      render(<ArraysSection />);
      expect(screen.getByText("Binary Search")).toBeInTheDocument();
    });

    it("renders merge sort section", () => {
      render(<ArraysSection />);
      expect(screen.getByText("Merge Sort")).toBeInTheDocument();
    });

    it("renders CodeBlock elements", () => {
      render(<ArraysSection />);
      expect(screen.getAllByTestId("code-block").length).toBeGreaterThan(0);
    });
  });

  describe("DataStructuresSection - specific content", () => {
    it("renders linked list operations", () => {
      render(<DataStructuresSection />);
      expect(screen.getByText("Linked List Operations")).toBeInTheDocument();
    });

    it("renders BST operations", () => {
      render(<DataStructuresSection />);
      expect(
        screen.getByText("Binary Search Tree Operations")
      ).toBeInTheDocument();
    });

    it("renders graph traversals", () => {
      render(<DataStructuresSection />);
      expect(screen.getByText("Graph Traversals")).toBeInTheDocument();
    });
  });
});
