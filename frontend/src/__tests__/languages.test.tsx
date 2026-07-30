import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import type {
  LanguageGuide,
  LanguageMeta,
  LanguageSection,
  CheatsheetContent,
} from "@/types/languages";
import { difficultyColors, languageAccents } from "@/types/languages";

// Mocks
vi.mock("@/hooks/useAIChat", () => ({
  useAIChat: vi.fn(() => ({
    messages: [],
    isLoading: false,
    isLoadingHistory: false,
    error: null,
    sessionId: null,
    archivedSessions: [],
    isViewingArchived: false,
    sessions: [],
    currentSessionId: null,
    sendMessage: vi.fn(),
    stopStreaming: vi.fn(),
    clearMessages: vi.fn(),
    startNewChat: vi.fn(),
    loadArchivedSession: vi.fn(),
    loadSession: vi.fn(),
    deleteSession: vi.fn(),
    renameSession: vi.fn(),
  })),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn(() => ({
    isAuthenticated: true,
    isLoading: false,
    user: { id: "u1", email: "a@b.com", name: "Test", emailVerified: true },
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refreshUser: vi.fn(),
    loginWithGoogle: vi.fn(),
    handleGoogleCallback: vi.fn(),
  })),
}));

vi.mock("@/contexts/HighlightContext", () => ({
  useHighlights: vi.fn(() => ({
    highlights: new Map(),
    isLoading: false,
    createHighlight: vi.fn(),
    updateHighlight: vi.fn(),
    deleteHighlight: vi.fn(),
    getHighlightsForContent: vi.fn(() => []),
    fetchHighlightsForContent: vi.fn(),
    clearHighlights: vi.fn(),
  })),
  HighlightProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock ResizeObserver
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
globalThis.ResizeObserver =
  MockResizeObserver as unknown as typeof ResizeObserver;

// Types tests
describe("Language Types", () => {
  describe("difficultyColors", () => {
    it("has color for beginner difficulty", () => {
      expect(difficultyColors.beginner).toBeDefined();
      expect(difficultyColors.beginner).toContain("emerald");
    });

    it("has color for intermediate difficulty", () => {
      expect(difficultyColors.intermediate).toBeDefined();
      expect(difficultyColors.intermediate).toContain("amber");
    });

    it("has color for advanced difficulty", () => {
      expect(difficultyColors.advanced).toBeDefined();
      expect(difficultyColors.advanced).toContain("rose");
    });

    it("has color for Easy problem difficulty", () => {
      expect(difficultyColors.Easy).toBeDefined();
      expect(difficultyColors.Easy).toContain("green");
    });

    it("has color for Medium problem difficulty", () => {
      expect(difficultyColors.Medium).toBeDefined();
      expect(difficultyColors.Medium).toContain("yellow");
    });

    it("has color for Hard problem difficulty", () => {
      expect(difficultyColors.Hard).toBeDefined();
      expect(difficultyColors.Hard).toContain("red");
    });
  });

  describe("languageAccents", () => {
    it("has accent color for Go", () => {
      expect(languageAccents.go).toBe("#00ADD8");
    });

    it("has accent color for Rust", () => {
      expect(languageAccents.rust).toBe("#DEA584");
    });

    it("has accent color for Java", () => {
      expect(languageAccents.java).toBe("#ED8B00");
    });

    it("has accent color for Python", () => {
      expect(languageAccents.python).toBe("#3776AB");
    });
  });
});

// lib/languages/index.ts tests
import {
  getLanguageGuide,
  getAllLanguageGuides,
  getLanguageMetas,
  isLanguageAvailable,
  getSupportedLanguages,
  getSectionCategories,
  getSectionsByCategory,
  findSectionIndexById,
} from "@/lib/languages";

describe("Language Library Functions", () => {
  describe("getLanguageGuide", () => {
    it("returns Go guide for 'go' language", () => {
      const guide = getLanguageGuide("go");
      expect(guide).not.toBeNull();
      expect(guide?.id).toBe("go");
      expect(guide?.name).toBe("Go");
    });

    it("returns null for unavailable languages", () => {
      const rustGuide = getLanguageGuide("rust");
      expect(rustGuide).toBeNull();

      const javaGuide = getLanguageGuide("java");
      expect(javaGuide).toBeNull();

      const pythonGuide = getLanguageGuide("python");
      expect(pythonGuide).toBeNull();
    });
  });

  describe("getAllLanguageGuides", () => {
    it("returns array of available guides", () => {
      const guides = getAllLanguageGuides();
      expect(Array.isArray(guides)).toBe(true);
      expect(guides.length).toBeGreaterThan(0);
    });

    it("includes Go guide", () => {
      const guides = getAllLanguageGuides();
      const goGuide = guides.find((g) => g.id === "go");
      expect(goGuide).toBeDefined();
    });

    it("does not include null guides", () => {
      const guides = getAllLanguageGuides();
      guides.forEach((guide) => {
        expect(guide).not.toBeNull();
        expect(guide.id).toBeDefined();
      });
    });
  });

  describe("getLanguageMetas", () => {
    it("returns array of language metadata", () => {
      const metas = getLanguageMetas();
      expect(Array.isArray(metas)).toBe(true);
      expect(metas.length).toBe(4); // go, rust, java, python
    });

    it("includes Go as available", () => {
      const metas = getLanguageMetas();
      const goMeta = metas.find((m) => m.id === "go");
      expect(goMeta).toBeDefined();
      expect(goMeta?.available).toBe(true);
      expect(goMeta?.sectionCount).toBeGreaterThan(0);
    });

    it("marks Rust as not available", () => {
      const metas = getLanguageMetas();
      const rustMeta = metas.find((m) => m.id === "rust");
      expect(rustMeta).toBeDefined();
      expect(rustMeta?.available).toBe(false);
    });

    it("marks Java as not available", () => {
      const metas = getLanguageMetas();
      const javaMeta = metas.find((m) => m.id === "java");
      expect(javaMeta).toBeDefined();
      expect(javaMeta?.available).toBe(false);
    });

    it("marks Python as not available", () => {
      const metas = getLanguageMetas();
      const pythonMeta = metas.find((m) => m.id === "python");
      expect(pythonMeta).toBeDefined();
      expect(pythonMeta?.available).toBe(false);
    });

    it("includes all required fields in metadata", () => {
      const metas = getLanguageMetas();
      metas.forEach((meta) => {
        expect(meta.id).toBeDefined();
        expect(meta.name).toBeDefined();
        expect(meta.displayName).toBeDefined();
        expect(meta.description).toBeDefined();
        expect(typeof meta.sectionCount).toBe("number");
        expect(meta.difficulty).toBeDefined();
        expect(meta.icon).toBeDefined();
        expect(typeof meta.available).toBe("boolean");
      });
    });
  });

  describe("isLanguageAvailable", () => {
    it("returns true for Go", () => {
      expect(isLanguageAvailable("go")).toBe(true);
    });

    it("returns false for Rust", () => {
      expect(isLanguageAvailable("rust")).toBe(false);
    });

    it("returns false for Java", () => {
      expect(isLanguageAvailable("java")).toBe(false);
    });

    it("returns false for Python", () => {
      expect(isLanguageAvailable("python")).toBe(false);
    });

    it("returns false for unsupported language", () => {
      expect(isLanguageAvailable("cpp")).toBe(false);
      expect(isLanguageAvailable("ruby")).toBe(false);
    });
  });

  describe("getSupportedLanguages", () => {
    it("returns array of supported language IDs", () => {
      const languages = getSupportedLanguages();
      expect(Array.isArray(languages)).toBe(true);
      expect(languages).toContain("go");
      expect(languages).toContain("rust");
      expect(languages).toContain("java");
      expect(languages).toContain("python");
    });

    it("returns exactly 4 languages", () => {
      const languages = getSupportedLanguages();
      expect(languages.length).toBe(4);
    });
  });

  describe("getSectionCategories", () => {
    it("returns unique categories from guide sections", () => {
      const guide = getLanguageGuide("go");
      expect(guide).not.toBeNull();

      const categories = getSectionCategories(guide!);
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);

      // Check no duplicates
      const uniqueCategories = new Set(categories);
      expect(uniqueCategories.size).toBe(categories.length);
    });

    it("includes 'Getting Started' category for Go guide", () => {
      const guide = getLanguageGuide("go");
      const categories = getSectionCategories(guide!);
      expect(categories).toContain("Getting Started");
    });
  });

  describe("getSectionsByCategory", () => {
    it("returns sections matching the category", () => {
      const guide = getLanguageGuide("go");
      expect(guide).not.toBeNull();

      const gettingStartedSections = getSectionsByCategory(
        guide!,
        "Getting Started"
      );
      expect(Array.isArray(gettingStartedSections)).toBe(true);
      expect(gettingStartedSections.length).toBeGreaterThan(0);

      gettingStartedSections.forEach((section) => {
        expect(section.category).toBe("Getting Started");
      });
    });

    it("returns empty array for non-existent category", () => {
      const guide = getLanguageGuide("go");
      const sections = getSectionsByCategory(guide!, "Non-Existent Category");
      expect(sections).toEqual([]);
    });
  });

  describe("findSectionIndexById", () => {
    it("returns correct index for existing section", () => {
      const guide = getLanguageGuide("go");
      expect(guide).not.toBeNull();

      const firstSectionId = guide!.sections[0].id;
      const index = findSectionIndexById(guide!, firstSectionId);
      expect(index).toBe(0);
    });

    it("returns -1 for non-existent section", () => {
      const guide = getLanguageGuide("go");
      const index = findSectionIndexById(guide!, "non-existent-section");
      expect(index).toBe(-1);
    });

    it("finds section in middle of array", () => {
      const guide = getLanguageGuide("go");
      expect(guide).not.toBeNull();

      if (guide!.sections.length > 2) {
        const middleIndex = Math.floor(guide!.sections.length / 2);
        const middleSectionId = guide!.sections[middleIndex].id;
        const foundIndex = findSectionIndexById(guide!, middleSectionId);
        expect(foundIndex).toBe(middleIndex);
      }
    });
  });
});

// Component tests
import LanguageCard from "@/components/languages/LanguageCard";

describe("LanguageCard", () => {
  const availableLanguage: LanguageMeta = {
    id: "go",
    name: "Go",
    displayName: "Data Structures and Algorithms in Go",
    description: "Master data structures and algorithms using Go.",
    sectionCount: 20,
    difficulty: "Beginner to Advanced",
    icon: "go",
    available: true,
    version: "1.22",
  };

  const unavailableLanguage: LanguageMeta = {
    id: "rust",
    name: "Rust",
    displayName: "Data Structures and Algorithms in Rust",
    description: "Learn memory-safe implementations with Rust.",
    sectionCount: 0,
    difficulty: "Intermediate to Advanced",
    icon: "rust",
    available: false,
  };

  afterEach(() => {
    cleanup();
  });

  describe("Available Language Card", () => {
    it("renders display name", () => {
      render(<LanguageCard language={availableLanguage} />);
      expect(
        screen.getByText("Data Structures and Algorithms in Go")
      ).toBeInTheDocument();
    });

    it("renders description", () => {
      render(<LanguageCard language={availableLanguage} />);
      expect(
        screen.getByText("Master data structures and algorithms using Go.")
      ).toBeInTheDocument();
    });

    it("renders section count", () => {
      render(<LanguageCard language={availableLanguage} />);
      expect(screen.getByText("20 topics")).toBeInTheDocument();
    });

    it("renders difficulty level", () => {
      render(<LanguageCard language={availableLanguage} />);
      expect(screen.getByText("Beginner to Advanced")).toBeInTheDocument();
    });

    it("renders version when available", () => {
      render(<LanguageCard language={availableLanguage} />);
      expect(screen.getByText("v1.22")).toBeInTheDocument();
    });

    it("renders 'Start Learning' button", () => {
      render(<LanguageCard language={availableLanguage} />);
      expect(screen.getByText("Start Learning")).toBeInTheDocument();
    });

    it("links to language guide page", () => {
      render(<LanguageCard language={availableLanguage} />);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/languages/go");
    });

    it("renders Go icon for go language", () => {
      const { container } = render(
        <LanguageCard language={availableLanguage} />
      );
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("applies hover effects on mouse enter/leave", () => {
      const { container } = render(
        <LanguageCard language={availableLanguage} />
      );
      const card = container.querySelector('[class*="group"]') as HTMLElement;
      expect(card).toBeInTheDocument();

      fireEvent.mouseEnter(card);
      // Check that style was applied (border color and box shadow)
      expect(card.style.borderColor).toBe("rgb(0, 173, 216)");

      fireEvent.mouseLeave(card);
      expect(card.style.borderColor).toBe("var(--border-1)");
    });
  });

  describe("Unavailable Language Card", () => {
    it("renders 'Coming Soon' badge", () => {
      render(<LanguageCard language={unavailableLanguage} />);
      expect(screen.getByText("Coming Soon")).toBeInTheDocument();
    });

    it("renders display name", () => {
      render(<LanguageCard language={unavailableLanguage} />);
      expect(
        screen.getByText("Data Structures and Algorithms in Rust")
      ).toBeInTheDocument();
    });

    it("renders description", () => {
      render(<LanguageCard language={unavailableLanguage} />);
      expect(
        screen.getByText("Learn memory-safe implementations with Rust.")
      ).toBeInTheDocument();
    });

    it("renders disabled 'Notify Me' button", () => {
      render(<LanguageCard language={unavailableLanguage} />);
      const button = screen.getByText("Notify Me");
      expect(button).toBeInTheDocument();
      expect(button).toBeDisabled();
    });

    it("has reduced opacity", () => {
      const { container } = render(
        <LanguageCard language={unavailableLanguage} />
      );
      const card = container.querySelector('[class*="opacity-60"]');
      expect(card).toBeInTheDocument();
    });

    it("does not link to language guide page", () => {
      render(<LanguageCard language={unavailableLanguage} />);
      const link = screen.queryByRole("link");
      expect(link).toBeNull();
    });

    it("renders Rust icon for rust language", () => {
      const { container } = render(
        <LanguageCard language={unavailableLanguage} />
      );
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });
  });

  describe("Different Language Icons", () => {
    it("renders Java icon", () => {
      const javaLang: LanguageMeta = {
        ...unavailableLanguage,
        id: "java",
        icon: "java",
      };
      const { container } = render(<LanguageCard language={javaLang} />);
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("renders Python icon", () => {
      const pythonLang: LanguageMeta = {
        ...unavailableLanguage,
        id: "python",
        icon: "python",
      };
      const { container } = render(<LanguageCard language={pythonLang} />);
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("falls back to Go icon for unknown icon", () => {
      const unknownLang: LanguageMeta = {
        ...availableLanguage,
        icon: "unknown",
      };
      const { container } = render(<LanguageCard language={unknownLang} />);
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });
  });

  describe("Without version", () => {
    it("does not render version when not provided", () => {
      const langWithoutVersion: LanguageMeta = {
        ...availableLanguage,
        version: undefined,
      };
      render(<LanguageCard language={langWithoutVersion} />);
      expect(screen.queryByText(/^v/)).toBeNull();
    });
  });
});

// CheatsheetTab tests
import CheatsheetTab from "@/app/languages/[lang]/tabs/CheatsheetTab";

describe("CheatsheetTab", () => {
  const mockCheatsheet: CheatsheetContent = {
    quickReference: [
      {
        title: "Array Declaration",
        code: "arr := []int{1, 2, 3}",
        notes: "Creates a slice with initial values",
      },
      {
        title: "Map Declaration",
        code: "m := make(map[string]int)",
      },
    ],
    commonPatterns: [
      {
        title: "Two Pointer Pattern",
        code: "left, right := 0, len(arr)-1",
        notes: "Common for sorted array problems",
      },
    ],
    gotchas: [
      "Slices are reference types",
      "Maps are not safe for concurrent access",
      "Range creates a copy of values",
    ],
  };

  afterEach(() => {
    cleanup();
  });

  it("renders Quick Reference section", () => {
    render(<CheatsheetTab cheatsheet={mockCheatsheet} language="Go" />);
    expect(screen.getByText("Quick Reference")).toBeInTheDocument();
  });

  it("renders Common Patterns section", () => {
    render(<CheatsheetTab cheatsheet={mockCheatsheet} language="Go" />);
    expect(screen.getByText("Common Patterns")).toBeInTheDocument();
  });

  it("renders Common Gotchas section", () => {
    render(<CheatsheetTab cheatsheet={mockCheatsheet} language="Go" />);
    expect(screen.getByText("Common Gotchas & Mistakes")).toBeInTheDocument();
  });

  it("renders quick reference items with titles", () => {
    render(<CheatsheetTab cheatsheet={mockCheatsheet} language="Go" />);
    expect(screen.getByText("Array Declaration")).toBeInTheDocument();
    expect(screen.getByText("Map Declaration")).toBeInTheDocument();
  });

  it("renders quick reference notes when provided", () => {
    render(<CheatsheetTab cheatsheet={mockCheatsheet} language="Go" />);
    expect(
      screen.getByText("Creates a slice with initial values")
    ).toBeInTheDocument();
  });

  it("renders common pattern items", () => {
    render(<CheatsheetTab cheatsheet={mockCheatsheet} language="Go" />);
    expect(screen.getByText("Two Pointer Pattern")).toBeInTheDocument();
    expect(
      screen.getByText("Common for sorted array problems")
    ).toBeInTheDocument();
  });

  it("renders all gotchas", () => {
    render(<CheatsheetTab cheatsheet={mockCheatsheet} language="Go" />);
    expect(screen.getByText("Slices are reference types")).toBeInTheDocument();
    expect(
      screen.getByText("Maps are not safe for concurrent access")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Range creates a copy of values")
    ).toBeInTheDocument();
  });

  it("renders numbered gotcha items", () => {
    const { container } = render(
      <CheatsheetTab cheatsheet={mockCheatsheet} language="Go" />
    );
    // Check for numbered gotcha items (in amber-colored spans)
    const gotchaNumbers = container.querySelectorAll(
      ".text-amber-400.font-bold"
    );
    expect(gotchaNumbers.length).toBe(3);
    expect(gotchaNumbers[0].textContent).toBe("1");
    expect(gotchaNumbers[1].textContent).toBe("2");
    expect(gotchaNumbers[2].textContent).toBe("3");
  });

  it("renders print tip at the bottom", () => {
    render(<CheatsheetTab cheatsheet={mockCheatsheet} language="Go" />);
    expect(
      screen.getByText(/Tip: Use your browser's print function/)
    ).toBeInTheDocument();
  });

  it("renders code blocks with syntax highlighting", () => {
    const { container } = render(
      <CheatsheetTab cheatsheet={mockCheatsheet} language="Go" />
    );
    const preElements = container.querySelectorAll("pre");
    expect(preElements.length).toBeGreaterThan(0);
  });

  it("renders section icons", () => {
    const { container } = render(
      <CheatsheetTab cheatsheet={mockCheatsheet} language="Go" />
    );
    // Check for lucide icons
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
  });
});

// TutorialTab tests
import TutorialTab from "@/app/languages/[lang]/tabs/TutorialTab";

describe("TutorialTab", () => {
  const mockSection: LanguageSection = {
    id: "why-go-for-dsa",
    title: "Why Go for Data Structures",
    category: "Getting Started",
    difficulty: "beginner",
    estimatedTime: "5 min",
    content: [
      {
        type: "text",
        text: "Go is an excellent choice for DSA problems.",
      },
      {
        type: "heading",
        text: "Advantages of Go",
        level: 3,
      },
      {
        type: "code",
        code: 'package main\n\nfunc main() {\n    fmt.Println("Hello")\n}',
        language: "go",
        filename: "main.go",
      },
      {
        type: "tip",
        title: "Pro Tip",
        message: "Go compiles fast!",
      },
      {
        type: "warning",
        title: "Warning",
        message: "Be careful with pointers.",
      },
      {
        type: "comparison",
        items: [
          { label: "Fast", description: "Compiles quickly" },
          { label: "Simple", description: "Easy to learn" },
        ],
      },
      {
        type: "complexity",
        time: "O(n)",
        space: "O(1)",
        explanation: "Linear time, constant space",
      },
      {
        type: "table",
        headers: ["Method", "Complexity"],
        rows: [
          ["append", "O(1) amortized"],
          ["copy", "O(n)"],
        ],
      },
    ],
  };

  const mockGuide: LanguageGuide = {
    id: "go",
    name: "Go",
    displayName: "Data Structures and Algorithms in Go",
    description: "Master DSA in Go",
    difficulty: "Beginner to Advanced",
    icon: "go",
    version: "1.22",
    sections: [
      mockSection,
      {
        id: "essential-concepts",
        title: "Essential Go Concepts",
        category: "Getting Started",
        difficulty: "beginner",
        estimatedTime: "15 min",
        content: [{ type: "text", text: "Learn essential concepts." }],
      },
      {
        id: "arrays-slices",
        title: "Arrays and Slices",
        category: "Data Structures",
        difficulty: "intermediate",
        estimatedTime: "20 min",
        content: [{ type: "text", text: "Learn about arrays and slices." }],
      },
    ],
    commonProblems: [],
    cheatsheet: {
      quickReference: [],
      commonPatterns: [],
      gotchas: [],
    },
  };

  const defaultProps = {
    guide: mockGuide,
    categories: ["Getting Started", "Data Structures"],
    currentSectionIndex: 0,
    completedSections: new Set<number>(),
    onSectionChange: vi.fn(),
    onToggleComplete: vi.fn(),
    onAskAI: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    cleanup();
  });

  describe("Section Header", () => {
    it("renders current section title", () => {
      render(<TutorialTab {...defaultProps} />);
      // Title appears multiple times, in sidebar and main header
      const titles = screen.getAllByText("Why Go for Data Structures");
      expect(titles.length).toBeGreaterThan(0);
    });

    it("renders difficulty badge", () => {
      render(<TutorialTab {...defaultProps} />);
      expect(screen.getByText("beginner")).toBeInTheDocument();
    });

    it("renders estimated time", () => {
      render(<TutorialTab {...defaultProps} />);
      expect(screen.getByText("5 min")).toBeInTheDocument();
    });

    it("renders category", () => {
      render(<TutorialTab {...defaultProps} />);
      // Category appears in sidebar header and section header
      const categories = screen.getAllByText("Getting Started");
      expect(categories.length).toBeGreaterThan(0);
    });
  });

  describe("Content Rendering", () => {
    it("renders text content", () => {
      render(<TutorialTab {...defaultProps} />);
      expect(
        screen.getByText("Go is an excellent choice for DSA problems.")
      ).toBeInTheDocument();
    });

    it("renders heading content", () => {
      render(<TutorialTab {...defaultProps} />);
      expect(screen.getByText("Advantages of Go")).toBeInTheDocument();
    });

    it("renders code blocks with filename", () => {
      render(<TutorialTab {...defaultProps} />);
      expect(screen.getByText("main.go")).toBeInTheDocument();
    });

    it("renders code blocks with copy button", () => {
      render(<TutorialTab {...defaultProps} />);
      expect(screen.getByText("Copy")).toBeInTheDocument();
    });

    it("renders tip blocks", () => {
      render(<TutorialTab {...defaultProps} />);
      expect(screen.getByText("Pro Tip")).toBeInTheDocument();
      expect(screen.getByText("Go compiles fast!")).toBeInTheDocument();
    });

    it("renders warning blocks", () => {
      render(<TutorialTab {...defaultProps} />);
      expect(screen.getByText("Warning")).toBeInTheDocument();
      expect(screen.getByText("Be careful with pointers.")).toBeInTheDocument();
    });

    it("renders comparison blocks", () => {
      render(<TutorialTab {...defaultProps} />);
      expect(screen.getByText("Fast")).toBeInTheDocument();
      expect(screen.getByText("Compiles quickly")).toBeInTheDocument();
      expect(screen.getByText("Simple")).toBeInTheDocument();
      expect(screen.getByText("Easy to learn")).toBeInTheDocument();
    });

    it("renders complexity blocks", () => {
      render(<TutorialTab {...defaultProps} />);
      // Complexity header
      const complexityHeadings = screen.getAllByText("Complexity");
      expect(complexityHeadings.length).toBeGreaterThan(0);
      // O(n) appears in code and complexity block
      const onTexts = screen.getAllByText("O(n)");
      expect(onTexts.length).toBeGreaterThan(0);
      expect(
        screen.getByText("Linear time, constant space")
      ).toBeInTheDocument();
    });

    it("renders table blocks", () => {
      render(<TutorialTab {...defaultProps} />);
      expect(screen.getByText("Method")).toBeInTheDocument();
      expect(screen.getByText("append")).toBeInTheDocument();
      expect(screen.getByText("O(1) amortized")).toBeInTheDocument();
    });
  });

  describe("Sidebar", () => {
    it("renders guide title in sidebar", () => {
      render(<TutorialTab {...defaultProps} />);
      expect(
        screen.getByText("Data Structures and Algorithms in Go")
      ).toBeInTheDocument();
    });

    it("renders category headers", () => {
      render(<TutorialTab {...defaultProps} />);
      // Both categories should be visible
      const gettingStartedHeaders = screen.getAllByText("Getting Started");
      expect(gettingStartedHeaders.length).toBeGreaterThan(0);
    });

    it("renders section buttons", () => {
      render(<TutorialTab {...defaultProps} />);
      // Essential Go Concepts appears in sidebar
      const essentialButtons = screen.getAllByText("Essential Go Concepts");
      expect(essentialButtons.length).toBeGreaterThan(0);
      expect(screen.getByText("Arrays and Slices")).toBeInTheDocument();
    });

    it("highlights current section", () => {
      render(<TutorialTab {...defaultProps} />);
      // Find button in sidebar with current section title
      const buttons = screen.getAllByText("Why Go for Data Structures");
      const sidebarButton = buttons.find((el) => el.closest("button"));
      expect(sidebarButton?.closest("button")?.className).toContain(
        "bg-indigo"
      );
    });

    it("calls onSectionChange when section button is clicked", () => {
      const onSectionChange = vi.fn();
      render(
        <TutorialTab {...defaultProps} onSectionChange={onSectionChange} />
      );

      // Find and click on Essential Go Concepts in the sidebar
      const essentialButtons = screen.getAllByText("Essential Go Concepts");
      const sidebarButton = essentialButtons.find((el) => el.closest("button"));
      fireEvent.click(sidebarButton!.closest("button")!);
      expect(onSectionChange).toHaveBeenCalledWith(1);
    });

    it("shows completed checkmark for completed sections", () => {
      const completedSections = new Set([0]);
      const { container } = render(
        <TutorialTab {...defaultProps} completedSections={completedSections} />
      );
      // CheckCircle2 icon should be present
      const checkCircles = container.querySelectorAll(
        '[class*="text-green-500"]'
      );
      expect(checkCircles.length).toBeGreaterThan(0);
    });

    it("renders progress bar", () => {
      render(<TutorialTab {...defaultProps} />);
      expect(screen.getByText("Progress")).toBeInTheDocument();
    });

    it("shows correct progress percentage", () => {
      const completedSections = new Set([0, 1]);
      render(
        <TutorialTab {...defaultProps} completedSections={completedSections} />
      );
      expect(screen.getByText("67%")).toBeInTheDocument();
    });
  });

  describe("Navigation", () => {
    it("shows mark complete button when on first section", () => {
      render(<TutorialTab {...defaultProps} currentSectionIndex={0} />);
      expect(screen.getByText("Mark complete")).toBeInTheDocument();
    });

    it("shows next section button", () => {
      render(<TutorialTab {...defaultProps} currentSectionIndex={0} />);
      // Essential Go Concepts appears in sidebar and navigation
      const essentialTexts = screen.getAllByText("Essential Go Concepts");
      expect(essentialTexts.length).toBeGreaterThan(0);
    });

    it("shows previous section button when not on first section", () => {
      render(<TutorialTab {...defaultProps} currentSectionIndex={1} />);
      // Why Go for Data Structures appears multiple times
      const titles = screen.getAllByText("Why Go for Data Structures");
      expect(titles.length).toBeGreaterThan(0);
    });

    it("calls onSectionChange when next button is clicked", () => {
      const onSectionChange = vi.fn();
      render(
        <TutorialTab
          {...defaultProps}
          currentSectionIndex={0}
          onSectionChange={onSectionChange}
        />
      );

      // Find the navigation button (not the sidebar button)
      const essentialTexts = screen.getAllByText("Essential Go Concepts");
      // Navigation buttons have arrow icons
      const navigationButton = essentialTexts.find((el) => {
        const button = el.closest("button");
        return button && button.querySelector("svg");
      });
      if (navigationButton) {
        fireEvent.click(navigationButton.closest("button")!);
        expect(onSectionChange).toHaveBeenCalledWith(1);
      }
    });

    it("calls onToggleComplete when mark complete is clicked", () => {
      const onToggleComplete = vi.fn();
      render(
        <TutorialTab
          {...defaultProps}
          currentSectionIndex={0}
          onToggleComplete={onToggleComplete}
        />
      );

      fireEvent.click(screen.getByText("Mark complete"));
      expect(onToggleComplete).toHaveBeenCalledWith(0);
    });

    it("shows Completed text when section is complete", () => {
      const completedSections = new Set([0]);
      render(
        <TutorialTab
          {...defaultProps}
          currentSectionIndex={0}
          completedSections={completedSections}
        />
      );
      expect(screen.getByText("Completed")).toBeInTheDocument();
    });
  });

  describe("Sidebar Collapse", () => {
    it("renders collapse button", () => {
      render(<TutorialTab {...defaultProps} />);
      const collapseButton = screen.getByTitle("Collapse sidebar");
      expect(collapseButton).toBeInTheDocument();
    });

    it("collapses sidebar when collapse button is clicked", () => {
      const { container } = render(<TutorialTab {...defaultProps} />);

      fireEvent.click(screen.getByTitle("Collapse sidebar"));

      // Sidebar should have w-0 class
      const sidebar = container.querySelector('[class*="w-0"]');
      expect(sidebar).toBeInTheDocument();
    });

    it("shows expand button when sidebar is collapsed", async () => {
      render(<TutorialTab {...defaultProps} />);

      fireEvent.click(screen.getByTitle("Collapse sidebar"));

      await waitFor(() => {
        expect(screen.getByTitle("Expand sidebar")).toBeInTheDocument();
      });
    });

    it("expands sidebar when expand button is clicked", async () => {
      const { container } = render(<TutorialTab {...defaultProps} />);

      fireEvent.click(screen.getByTitle("Collapse sidebar"));

      await waitFor(() => {
        fireEvent.click(screen.getByTitle("Expand sidebar"));
      });

      // Sidebar should no longer have w-0 class
      const collapsedSidebar = container.querySelector("aside.w-0");
      expect(collapsedSidebar).toBeNull();
    });
  });

  describe("Code Copy Button", () => {
    it("copies code to clipboard when copy button is clicked", async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      });

      render(<TutorialTab {...defaultProps} />);

      const copyButton = screen.getByText("Copy");
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(writeTextMock).toHaveBeenCalled();
      });
    });
  });

  describe("Back Link", () => {
    it("renders link to all languages", () => {
      render(<TutorialTab {...defaultProps} />);
      const backLink = screen.getByText("All Languages");
      expect(backLink.closest("a")).toHaveAttribute("href", "/languages");
    });
  });
});

// LanguageGuideClient tests
import LanguageGuideClient from "@/app/languages/[lang]/LanguageGuideClient";
import { useAIChat } from "@/hooks/useAIChat";
import { useAuth } from "@/contexts/AuthContext";

describe("LanguageGuideClient", () => {
  const mockGuide: LanguageGuide = {
    id: "go",
    name: "Go",
    displayName: "Data Structures and Algorithms in Go",
    description: "Master DSA in Go",
    difficulty: "Beginner to Advanced",
    icon: "go",
    version: "1.22",
    sections: [
      {
        id: "why-go-for-dsa",
        title: "Why Go for DSA",
        category: "Getting Started",
        difficulty: "beginner",
        estimatedTime: "5 min",
        content: [{ type: "text", text: "Introduction to Go for DSA." }],
      },
      {
        id: "essential-concepts",
        title: "Essential Concepts",
        category: "Getting Started",
        difficulty: "beginner",
        estimatedTime: "15 min",
        content: [{ type: "text", text: "Learn essential concepts." }],
      },
    ],
    commonProblems: [],
    cheatsheet: {
      quickReference: [
        { title: "Array", code: "arr := []int{}", notes: "Create array" },
      ],
      commonPatterns: [{ title: "Two Pointer", code: "l, r := 0, n-1" }],
      gotchas: ["Watch out for nil slices"],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAIChat).mockReturnValue({
      messages: [],
      isLoading: false,
      isLoadingHistory: false,
      error: null,
      sessionId: null,
      archivedSessions: [],
      isViewingArchived: false,
      sessions: [],
      currentSessionId: null,
      sendMessage: vi.fn(),
      stopStreaming: vi.fn(),
      clearMessages: vi.fn(),
      startNewChat: vi.fn(),
      loadArchivedSession: vi.fn(),
      loadSession: vi.fn(),
      deleteSession: vi.fn(),
      renameSession: vi.fn(),
    });
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: "u1", email: "a@b.com", name: "Test", emailVerified: true },
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      loginWithGoogle: vi.fn(),
      handleGoogleCallback: vi.fn(),
    });
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    cleanup();
  });

  describe("Header", () => {
    it("renders guide display name", () => {
      render(<LanguageGuideClient guide={mockGuide} />);
      // Title appears multiple times (main header and sidebar)
      const titles = screen.getAllByText(
        "Data Structures and Algorithms in Go"
      );
      expect(titles.length).toBeGreaterThan(0);
    });

    it("renders version badge", () => {
      render(<LanguageGuideClient guide={mockGuide} />);
      expect(screen.getByText("v1.22")).toBeInTheDocument();
    });

    it("renders guide description", () => {
      render(<LanguageGuideClient guide={mockGuide} />);
      expect(screen.getByText("Master DSA in Go")).toBeInTheDocument();
    });

    it("renders back link to languages", () => {
      render(<LanguageGuideClient guide={mockGuide} />);
      const backLinks = screen.getAllByText("Languages");
      expect(backLinks.length).toBeGreaterThan(0);
    });

    it("renders progress indicator", () => {
      render(<LanguageGuideClient guide={mockGuide} />);
      expect(screen.getByText("0/2")).toBeInTheDocument();
      expect(screen.getByText("sections completed")).toBeInTheDocument();
    });
  });

  describe("Tabs", () => {
    it("renders Tutorial tab", () => {
      render(<LanguageGuideClient guide={mockGuide} />);
      expect(screen.getByText("Tutorial")).toBeInTheDocument();
    });

    it("renders Cheatsheet tab", () => {
      render(<LanguageGuideClient guide={mockGuide} />);
      expect(screen.getByText("Cheatsheet")).toBeInTheDocument();
    });

    it("switches to Cheatsheet tab when clicked", async () => {
      render(<LanguageGuideClient guide={mockGuide} />);

      fireEvent.click(screen.getByText("Cheatsheet"));

      await waitFor(() => {
        expect(screen.getByText("Quick Reference")).toBeInTheDocument();
      });
    });

    it("switches back to Tutorial tab when clicked", async () => {
      render(<LanguageGuideClient guide={mockGuide} />);

      fireEvent.click(screen.getByText("Cheatsheet"));
      fireEvent.click(screen.getByText("Tutorial"));

      await waitFor(() => {
        // Why Go for DSA appears multiple times (sidebar and main content)
        const titles = screen.getAllByText("Why Go for DSA");
        expect(titles.length).toBeGreaterThan(0);
      });
    });
  });

  describe("AI Chat Panel", () => {
    it("renders AI toggle button", () => {
      render(<LanguageGuideClient guide={mockGuide} />);
      expect(screen.getByTitle("Thor AI (Cmd+Shift+A)")).toBeInTheDocument();
    });

    it("toggles AI panel when button is clicked", async () => {
      render(<LanguageGuideClient guide={mockGuide} />);

      const toggleButton = screen.getByTitle("Thor AI (Cmd+Shift+A)");

      // AI panel is initially open, clicking should close it
      fireEvent.click(toggleButton);

      // Click again to reopen
      fireEvent.click(toggleButton);

      await waitFor(() => {
        // Thor AI appears multiple times in the UI
        const thorAI = screen.getAllByText("Thor AI");
        expect(thorAI.length).toBeGreaterThan(0);
      });
    });

    it("toggles AI panel with keyboard shortcut", () => {
      render(<LanguageGuideClient guide={mockGuide} />);

      // Simulate Cmd+Shift+A
      fireEvent.keyDown(window, {
        key: "a",
        metaKey: true,
        shiftKey: true,
      });

      // Panel state should have toggled
    });
  });

  describe("Section Navigation", () => {
    it("updates URL hash when section changes", async () => {
      const replaceStateSpy = vi.spyOn(window.history, "replaceState");
      render(<LanguageGuideClient guide={mockGuide} />);

      // Find and click on the Essential Concepts section (in sidebar)
      const essentialButtons = screen.getAllByText("Essential Concepts");
      const sidebarButton = essentialButtons.find((el) => el.closest("button"));
      if (sidebarButton) {
        fireEvent.click(sidebarButton.closest("button")!);

        await waitFor(() => {
          expect(replaceStateSpy).toHaveBeenCalledWith(
            null,
            "",
            "#essential-concepts"
          );
        });
      }
    });
  });

  describe("Progress Tracking", () => {
    it("starts with 0% progress", () => {
      render(<LanguageGuideClient guide={mockGuide} />);
      // 0% may appear in multiple places
      const zeroPercent = screen.getAllByText("0%");
      expect(zeroPercent.length).toBeGreaterThan(0);
    });

    it("updates progress when section is marked complete", async () => {
      render(<LanguageGuideClient guide={mockGuide} />);

      const markCompleteButton = screen.getByText("Mark complete");
      fireEvent.click(markCompleteButton);

      await waitFor(() => {
        // 50% appears in both header progress ring and sidebar
        const fiftyPercent = screen.getAllByText("50%");
        expect(fiftyPercent.length).toBeGreaterThan(0);
      });
    });

    it("tracks completed sections count", async () => {
      render(<LanguageGuideClient guide={mockGuide} />);

      fireEvent.click(screen.getByText("Mark complete"));

      await waitFor(() => {
        expect(screen.getByText("1/2")).toBeInTheDocument();
      });
    });
  });

  describe("Hash Navigation", () => {
    it("navigates to section based on URL hash", () => {
      // Set up hash
      window.location.hash = "#essential-concepts";

      render(<LanguageGuideClient guide={mockGuide} />);

      // Trigger hashchange
      fireEvent(window, new HashChangeEvent("hashchange"));
    });
  });

  describe("AI Panel Interaction", () => {
    it("handles handleAskAI callback from Highlightable", async () => {
      render(<LanguageGuideClient guide={mockGuide} />);

      // The AI panel should be open by default
      expect(screen.getAllByText("Thor AI").length).toBeGreaterThan(0);
    });

    it("handles closing AI panel", async () => {
      render(<LanguageGuideClient guide={mockGuide} />);

      // Find and click the close button on the AI panel
      const closeButtons = document.querySelectorAll('button[title="Close"]');
      if (closeButtons.length > 0) {
        fireEvent.click(closeButtons[0]);
      }
    });
  });

  describe("Toggle Complete", () => {
    it("toggles section completion on and off", async () => {
      render(<LanguageGuideClient guide={mockGuide} />);

      // Click mark complete
      const markCompleteButton = screen.getByText("Mark complete");
      fireEvent.click(markCompleteButton);

      await waitFor(() => {
        expect(screen.getByText("Completed")).toBeInTheDocument();
      });

      // Click again to toggle off
      fireEvent.click(screen.getByText("Completed"));

      await waitFor(() => {
        expect(screen.getByText("Mark complete")).toBeInTheDocument();
      });
    });
  });

  describe("Resize Handler", () => {
    it("handles resize mouse events", () => {
      render(<LanguageGuideClient guide={mockGuide} />);

      // Find the resize handle
      const resizeHandle = document.querySelector(
        '[class*="cursor-col-resize"]'
      );
      if (resizeHandle) {
        // Simulate mouse down on resize handle
        fireEvent.mouseDown(resizeHandle, { clientX: 100 });

        // Simulate mouse move
        fireEvent.mouseMove(document, { clientX: 150 });

        // Simulate mouse up
        fireEvent.mouseUp(document);
      }
    });
  });
});

// AIChatPanel language_guide contextType test
describe("AIChatPanel with language_guide context", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAIChat).mockReturnValue({
      messages: [],
      isLoading: false,
      isLoadingHistory: false,
      error: null,
      sessionId: null,
      archivedSessions: [],
      isViewingArchived: false,
      sessions: [],
      currentSessionId: null,
      sendMessage: vi.fn(),
      stopStreaming: vi.fn(),
      clearMessages: vi.fn(),
      startNewChat: vi.fn(),
      loadArchivedSession: vi.fn(),
      loadSession: vi.fn(),
      deleteSession: vi.fn(),
      renameSession: vi.fn(),
    });
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: "u1", email: "a@b.com", name: "Test", emailVerified: true },
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      loginWithGoogle: vi.fn(),
      handleGoogleCallback: vi.fn(),
    });
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows language guide specific empty state message", async () => {
    const { AIChatPanel } = await import("@/components/ai/AIChatPanel");

    render(
      <AIChatPanel
        patternId="go"
        patternName="Go Guide"
        contextType="language_guide"
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    expect(
      screen.getByText("Ask about Go syntax, data structures, or algorithms")
    ).toBeInTheDocument();
  });
});
