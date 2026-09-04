import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import type { ReactNode } from "react";
import type { Pattern, Question, SupportedLanguage } from "@/types";

// Next.js mocks

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    const { src, alt, ...rest } = props;
    return <img src={src as string} alt={alt as string} {...rest} />;
  },
}));

vi.mock("next/dynamic", () => ({
  default: () => {
    const DynComponent = (props: Record<string, unknown>) => (
      <div data-testid="dynamic-mock" {...props} />
    );
    DynComponent.displayName = "DynamicMock";
    return DynComponent;
  },
}));

const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: mockPush,
    replace: mockReplace,
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  })),
  usePathname: vi.fn(() => "/patterns/test-pattern"),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

// Third-party mocks

vi.mock("react-markdown", () => ({
  default: ({ children }: { children?: string }) => (
    <div data-testid="markdown-content">{children}</div>
  ),
}));

vi.mock("remark-gfm", () => ({
  default: () => {},
}));

vi.mock("react-syntax-highlighter", () => ({
  Prism: ({ children }: { children?: string }) => (
    <code data-testid="syntax-highlight">{children}</code>
  ),
}));

vi.mock("react-syntax-highlighter/dist/esm/styles/prism", () => ({
  oneDark: {},
}));

// UI component mocks

vi.mock("@/components/ui/CodeBlock", () => ({
  default: ({
    code,
    language,
    "data-testid": testId,
  }: {
    code?: string;
    language?: string;
    "data-testid"?: string;
  }) => (
    <div data-testid={testId || "codeblock"}>
      <span data-testid="codeblock-lang">{language}</span>
      <pre data-testid="codeblock-content">{code}</pre>
    </div>
  ),
}));

vi.mock("@/components/ui/LanguageToggle", () => ({
  default: ({
    currentLang,
    onChange,
    languages,
  }: {
    currentLang: string;
    onChange: (l: string) => void;
    languages?: string[];
  }) => (
    <div data-testid="language-toggle">
      {languages?.map((lang) => (
        <button
          key={lang}
          data-testid={`lang-btn-${lang}`}
          data-active={currentLang === lang}
          onClick={() => onChange(lang)}
        >
          {lang}
        </button>
      ))}
    </div>
  ),
}));

vi.mock("@/components/ui/Confetti", () => ({
  default: () => <div data-testid="confetti" />,
}));

vi.mock("@/components/ui/Dropdown", () => ({
  default: ({
    value,
    onChange,
    options,
    placeholder,
  }: {
    value: string;
    onChange: (v: string) => void;
    options: string[];
    placeholder?: string;
  }) => (
    <div data-testid="dropdown-mock">
      <select
        data-testid="company-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{placeholder || "All Companies"}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  ),
}));

vi.mock("@/components/QuoteSection", () => ({
  default: () => <div data-testid="quote-section">Quote</div>,
}));

// Quiz mock

vi.mock("@/components/quiz", () => ({
  QuizCard: ({ patternId }: { patternId: string }) => (
    <div data-testid="quiz-card">Quiz for {patternId}</div>
  ),
}));

// Context mocks

vi.mock("@/contexts/PatternProgressContext", () => ({
  usePatternProgress: () => ({
    isCompleted: vi.fn().mockReturnValue(false),
    markComplete: vi.fn(),
    markIncomplete: vi.fn(),
    toggleComplete: vi.fn(),
    getCompletedCount: vi.fn().mockReturnValue(0),
    getProgress: vi.fn().mockReturnValue(0),
  }),
}));

vi.mock("@/contexts/HighlightContext", () => ({
  useHighlights: () => ({
    highlights: [],
    loading: false,
    createHighlight: vi.fn(),
    updateHighlight: vi.fn(),
    deleteHighlight: vi.fn(),
    getHighlightsForContent: vi.fn().mockReturnValue([]),
    refreshHighlights: vi.fn(),
  }),
}));

vi.mock("@/components/ui/Highlightable", () => ({
  Highlightable: ({ children }: { children: ReactNode }) => (
    <div data-testid="highlightable">{children}</div>
  ),
}));

// Data mocks

const mockPatternsData: Pattern[] = [
  {
    id: "arrays-strings",
    category: "Arrays & Strings",
    difficulty: "Easy-Medium",
    description: "Fundamental data structure patterns",
    whenToUse: ["Hash Map for O(1) lookups", "Sorting when order matters"],
    codeTemplates: {
      java: "// Java code template",
      javascript: "// JS code template",
      python: "",
      cpp: "",
      go: "",
    },
    keyInsights: ["Hash Map: O(1) average lookup"],
    commonMistakes: ["Off-by-one errors", "Integer overflow"],
    variations: [
      {
        id: "var-1",
        name: "Hash Map Lookup",
        desc: "Use hash map for O(1) lookups",
        when: "Two Sum, finding pairs",
        template: { java: "// var java" },
        problems: ["Two Sum", "Contains Duplicate"],
      },
    ],
    commonProblems: ["Two Sum", "Group Anagrams"],
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    tutorial: [
      {
        title: "Introduction to Arrays",
        content: "Arrays are fundamental data structures.",
        code: { java: "// intro java", javascript: "// intro js" },
      },
      {
        title: "Hash Map Technique",
        content: "The Hash Map provides O(1) lookups.",
      },
    ],
    createdAt: "2026-01-01T00:00:00.000000Z",
    updatedAt: "2026-01-01T00:00:00.000000Z",
  },
  {
    id: "two-pointers",
    category: "Two Pointers",
    difficulty: "Medium",
    description: "Use two pointers to iterate through data",
    whenToUse: ["Sorted arrays", "Linked list cycle detection"],
    codeTemplates: {
      java: "// Two pointer Java",
      javascript: "",
      python: "",
      cpp: "",
      go: "",
    },
    keyInsights: ["Reduces O(n²) to O(n)"],
    variations: [],
    commonProblems: ["Two Sum II", "3Sum"],
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    createdAt: "2026-01-02T00:00:00.000000Z",
    updatedAt: "2026-01-02T00:00:00.000000Z",
  },
  {
    id: "sliding-window",
    category: "Sliding Window",
    difficulty: "Easy",
    description: "Technique for subarray problems",
    whenToUse: ["Subarray sums", "Longest substring"],
    codeTemplates: {
      java: "// Sliding window Java",
      javascript: "",
      python: "",
      cpp: "",
      go: "",
    },
    keyInsights: ["Fixed and variable windows"],
    variations: [],
    commonProblems: ["Maximum Subarray"],
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    tutorial: [
      {
        title: "Sliding Window Basics",
        content: "Sliding window optimizes from O(n²) to O(n).",
      },
    ],
    createdAt: "2026-01-03T00:00:00.000000Z",
    updatedAt: "2026-01-03T00:00:00.000000Z",
  },
];

vi.mock("@/lib/patterns.json", () => ({
  default: mockPatternsData,
}));

vi.mock("@/lib/questions", () => ({
  categoryToPatternId: {
    "Arrays & Strings": "arrays-strings",
    "Two Pointers": "two-pointers",
    "Sliding Window": "sliding-window",
  },
}));

// Context mocks

const mockToggleComplete = vi.fn();
const mockResetProgress = vi.fn();
const mockSyncFromLocal = vi.fn();
let mockCompletedSet = new Set<string>();
let mockIsLoading = false;
let mockCelebrationKey = 0;

vi.mock("@/contexts/ProgressContext", () => ({
  useProgress: vi.fn(() => ({
    completed: mockCompletedSet,
    isLoading: mockIsLoading,
    toggleComplete: mockToggleComplete,
    resetProgress: mockResetProgress,
    syncFromLocal: mockSyncFromLocal,
    celebrationKey: mockCelebrationKey,
  })),
  ProgressProvider: ({ children }: { children: ReactNode }) =>
    children as React.ReactElement,
}));

let mockCompanyFilter = "";
const mockSetCompanyFilter = vi.fn();

vi.mock("@/contexts/FilterContext", () => ({
  useFilter: vi.fn(() => ({
    companyFilter: mockCompanyFilter,
    setCompanyFilter: mockSetCompanyFilter,
  })),
  FilterProvider: ({ children }: { children: ReactNode }) =>
    children as React.ReactElement,
}));

let mockIsPro = false;

vi.mock("@/contexts/SubscriptionContext", () => ({
  useSubscription: vi.fn(() => ({
    isPro: mockIsPro,
    subscription: null,
    plans: [],
    isLoading: false,
    features: {
      max_patterns: 3,
      max_visualizers: 2,
      quiz_questions_per_pattern: 3,
      has_quiz_history: false,
      has_code_playground: false,
      has_progress_sync: false,
      has_highlighting: false,
      has_solutions_access: false,
      has_offline_export: false,
    },
    refreshSubscription: vi.fn(),
    createOrder: vi.fn(),
    verifyPayment: vi.fn(),
    validateDiscount: vi.fn(),
    cancelSubscription: vi.fn(),
  })),
  SubscriptionProvider: ({ children }: { children: ReactNode }) => (
    <>{children}</>
  ),
}));

let mockLanguage: SupportedLanguage = "java";
const mockSetLanguage = vi.fn();

vi.mock("@/contexts/LanguageContext", () => ({
  useLanguage: vi.fn(() => ({
    language: mockLanguage,
    setLanguage: mockSetLanguage,
  })),
  LanguageProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn(() => ({
    isAuthenticated: false,
    user: null,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    refreshUser: vi.fn(),
    loginWithGoogle: vi.fn(),
    handleGoogleCallback: vi.fn(),
  })),
  AuthProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

// Test data

const mockQuestions: Question[] = [
  {
    id: "q1",
    name: "Two Sum",
    url: "https://leetcode.com/two-sum",
    difficulty: "Easy",
    pattern: "Hash Map",
    companies: ["Google", "Amazon"],
    frequency: "🔥🔥🔥",
    category: "Arrays & Strings",
  },
  {
    id: "q2",
    name: "3Sum",
    url: "https://leetcode.com/3sum",
    difficulty: "Medium",
    pattern: "Two Pointers",
    companies: ["Google", "Meta"],
    frequency: "🔥🔥",
    category: "Two Pointers",
  },
  {
    id: "q3",
    name: "Container With Most Water",
    url: "https://leetcode.com/container",
    difficulty: "Medium",
    pattern: "Two Pointers",
    companies: ["Amazon"],
    frequency: "🔥",
    category: "Two Pointers",
  },
];

const mockPatternNoTutorialWithMistakes: Pattern = {
  ...mockPatternsData[2],
  tutorial: undefined,
  commonMistakes: ["Test mistake 1", "Test mistake 2"],
  whenToUse: ["When you need O(n)"],
  keyInsights: ["Sliding windows are efficient"],
};

const mockPatternNoCommonMistakes: Pattern = {
  ...mockPatternsData[2],
  tutorial: undefined,
  commonMistakes: undefined,
};

// Helpers

// skipcq: JS-0067
function resetMockState() {
  mockCompletedSet = new Set();
  mockIsLoading = false;
  mockCelebrationKey = 0;
  mockCompanyFilter = "";
  mockIsPro = false;
  mockLanguage = "java";
  mockToggleComplete.mockReset();
  mockResetProgress.mockReset();
  mockSyncFromLocal.mockReset();
  mockSetCompanyFilter.mockReset();
  mockSetLanguage.mockReset();
  mockPush.mockClear();
  mockReplace.mockClear();
  window.location.hash = "";
}

beforeEach(() => {
  resetMockState();
});

afterEach(() => {
  cleanup();
});

// PatternCard

describe("PatternCard", () => {
  it("renders pattern name and links to detail page", async () => {
    const PatternCard = (await import("@/components/patterns/PatternCard"))
      .default;

    render(
      <PatternCard
        pattern={mockPatternsData[0]}
        questionsCount={5}
        completedCount={2}
      />
    );

    expect(screen.getByText("Arrays & Strings")).toBeInTheDocument();
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/patterns/arrays-strings");
  });

  it("shows difficulty badge", async () => {
    const PatternCard = (await import("@/components/patterns/PatternCard"))
      .default;

    render(
      <PatternCard
        pattern={mockPatternsData[0]}
        questionsCount={5}
        completedCount={0}
      />
    );

    expect(screen.getByText("Easy-Medium")).toBeInTheDocument();
  });

  it("shows truncated description", async () => {
    const PatternCard = (await import("@/components/patterns/PatternCard"))
      .default;

    render(
      <PatternCard
        pattern={mockPatternsData[0]}
        questionsCount={5}
        completedCount={0}
      />
    );

    expect(
      screen.getByText(/Fundamental data structure patterns/)
    ).toBeInTheDocument();
  });

  it("shows completion progress", async () => {
    const PatternCard = (await import("@/components/patterns/PatternCard"))
      .default;

    render(
      <PatternCard
        pattern={mockPatternsData[0]}
        questionsCount={10}
        completedCount={3}
      />
    );

    expect(screen.getByText("3/10 solved")).toBeInTheDocument();
    expect(screen.getByText("30%")).toBeInTheDocument();
  });

  it("shows zero progress when no questions", async () => {
    const PatternCard = (await import("@/components/patterns/PatternCard"))
      .default;

    render(
      <PatternCard
        pattern={mockPatternsData[0]}
        questionsCount={0}
        completedCount={0}
      />
    );

    expect(screen.getByText("0/0 solved")).toBeInTheDocument();
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("shows Free badge when isFree is true", async () => {
    const PatternCard = (await import("@/components/patterns/PatternCard"))
      .default;

    render(
      <PatternCard
        pattern={mockPatternsData[0]}
        questionsCount={5}
        completedCount={0}
        isFree={true}
      />
    );

    expect(screen.getByText("Free")).toBeInTheDocument();
  });

  it("shows Pro badge when isLocked is true", async () => {
    const PatternCard = (await import("@/components/patterns/PatternCard"))
      .default;

    render(
      <PatternCard
        pattern={mockPatternsData[0]}
        questionsCount={5}
        completedCount={0}
        isLocked={true}
      />
    );

    expect(screen.getByText("Pro")).toBeInTheDocument();
    expect(screen.getByText("Pro").closest("span")).toBeInTheDocument();
  });

  it("does not show Free or Pro badges when neither is set", async () => {
    const PatternCard = (await import("@/components/patterns/PatternCard"))
      .default;

    render(
      <PatternCard
        pattern={mockPatternsData[0]}
        questionsCount={5}
        completedCount={0}
      />
    );

    expect(screen.queryByText("Free")).not.toBeInTheDocument();
    expect(screen.queryByText("Pro")).not.toBeInTheDocument();
  });

  it("responds to hover events on the card", async () => {
    const PatternCard = (await import("@/components/patterns/PatternCard"))
      .default;

    render(
      <PatternCard
        pattern={mockPatternsData[0]}
        questionsCount={5}
        completedCount={2}
      />
    );

    const cardEl = screen
      .getByText("Arrays & Strings")
      .closest('[class*="group"]') as HTMLElement | null;
    expect(cardEl).toBeTruthy();
    if (cardEl) {
      fireEvent.mouseEnter(cardEl);
      expect(cardEl.style.borderColor).toBe("var(--border-2)");
      fireEvent.mouseLeave(cardEl);
      expect(cardEl.style.borderColor).toBe("var(--border-1)");
    }
  });

  it("uses fallback difficulty colors for unknown difficulty", async () => {
    const PatternCard = (await import("@/components/patterns/PatternCard"))
      .default;

    const unknownPattern = {
      ...mockPatternsData[0],
      difficulty: "Unknown" as Pattern["difficulty"],
    };

    render(
      <PatternCard
        pattern={unknownPattern}
        questionsCount={2}
        completedCount={0}
      />
    );

    expect(screen.getByText("Unknown")).toBeInTheDocument();
  });
});

// PatternSectionCard

describe("PatternSectionCard", () => {
  it("renders card header with title and difficulty badge", async () => {
    const PatternSectionCard = (
      await import("@/components/patterns/PatternSectionCard")
    ).default;

    render(<PatternSectionCard pattern={mockPatternsData[0]} />);

    expect(screen.getByText("About This Pattern")).toBeInTheDocument();
    expect(screen.getByText("Click to learn more")).toBeInTheDocument();
    expect(screen.getByText("Easy-Medium")).toBeInTheDocument();
  });

  it("shows complexity info after expanding", async () => {
    const PatternSectionCard = (
      await import("@/components/patterns/PatternSectionCard")
    ).default;

    render(<PatternSectionCard pattern={mockPatternsData[0]} />);

    expect(screen.queryByText("Time:")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("About This Pattern"));

    expect(screen.getByText("Time:")).toBeInTheDocument();
    expect(screen.getByText("Space:")).toBeInTheDocument();
  });

  it("shows tutorial content when pattern has tutorial", async () => {
    const PatternSectionCard = (
      await import("@/components/patterns/PatternSectionCard")
    ).default;

    render(<PatternSectionCard pattern={mockPatternsData[0]} />);

    fireEvent.click(screen.getByText("About This Pattern"));

    expect(
      screen.getByText("Arrays are fundamental data structures.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("The Hash Map provides O(1) lookups.")
    ).toBeInTheDocument();
  });

  it("shows code blocks with language toggles after expand", async () => {
    const PatternSectionCard = (
      await import("@/components/patterns/PatternSectionCard")
    ).default;

    render(<PatternSectionCard pattern={mockPatternsData[0]} />);

    fireEvent.click(screen.getByText("About This Pattern"));

    const langToggles = screen.getAllByTestId("language-toggle");
    expect(langToggles.length).toBeGreaterThanOrEqual(1);
  });

  it("switches language on toggle click", async () => {
    const PatternSectionCard = (
      await import("@/components/patterns/PatternSectionCard")
    ).default;

    render(<PatternSectionCard pattern={mockPatternsData[0]} />);

    fireEvent.click(screen.getByText("About This Pattern"));

    const jsBtn = screen.getByTestId("lang-btn-javascript");
    fireEvent.click(jsBtn);
    expect(jsBtn.getAttribute("data-active")).toBe("true");
  });

  it("shows fallback when-to-use and key-insights for patterns without tutorial", async () => {
    const PatternSectionCard = (
      await import("@/components/patterns/PatternSectionCard")
    ).default;

    render(<PatternSectionCard pattern={mockPatternsData[1]} />);

    fireEvent.click(screen.getByText("About This Pattern"));

    expect(
      screen.getByText("Use two pointers to iterate through data")
    ).toBeInTheDocument();
    expect(screen.getByText("When to Use")).toBeInTheDocument();
    expect(screen.getByText("Key Insights")).toBeInTheDocument();
    expect(screen.getByText("Sorted arrays")).toBeInTheDocument();
    expect(screen.getByText("Reduces O(n²) to O(n)")).toBeInTheDocument();
  });

  it("shows common mistakes section when pattern has no tutorial", async () => {
    const PatternSectionCard = (
      await import("@/components/patterns/PatternSectionCard")
    ).default;

    const noTutorialPattern: Pattern = {
      ...mockPatternsData[0],
      tutorial: undefined,
    };

    render(<PatternSectionCard pattern={noTutorialPattern} />);

    fireEvent.click(screen.getByText("About This Pattern"));

    expect(screen.getByText("Common Mistakes")).toBeInTheDocument();
    expect(screen.getByText("Off-by-one errors")).toBeInTheDocument();
    expect(screen.getByText("Integer overflow")).toBeInTheDocument();
  });

  it("shows variations section when available", async () => {
    const PatternSectionCard = (
      await import("@/components/patterns/PatternSectionCard")
    ).default;

    render(<PatternSectionCard pattern={mockPatternsData[0]} />);

    fireEvent.click(screen.getByText("About This Pattern"));

    expect(screen.getByText("Variations")).toBeInTheDocument();
    expect(screen.getByText("Hash Map Lookup")).toBeInTheDocument();
    expect(
      screen.getByText("Use hash map for O(1) lookups")
    ).toBeInTheDocument();
  });

  it("collapses and expands on header click", async () => {
    const PatternSectionCard = (
      await import("@/components/patterns/PatternSectionCard")
    ).default;

    render(<PatternSectionCard pattern={mockPatternsData[0]} />);

    expect(screen.queryByText("Time:")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("About This Pattern"));
    expect(screen.getByText("Time:")).toBeInTheDocument();

    fireEvent.click(screen.getByText("About This Pattern"));
    expect(screen.queryByText("Time:")).not.toBeInTheDocument();
  });

  it("handles missing template code gracefully for patterns without tutorial", async () => {
    const PatternSectionCard = (
      await import("@/components/patterns/PatternSectionCard")
    ).default;

    const noTutorialPattern: Pattern = {
      ...mockPatternsData[1],
      tutorial: undefined,
    };

    render(<PatternSectionCard pattern={noTutorialPattern} />);
    fireEvent.click(screen.getByText("About This Pattern"));

    expect(screen.getByText("Code Template")).toBeInTheDocument();
    const codeBlocks = screen.getAllByTestId("codeblock-content");
    expect(codeBlocks.length).toBeGreaterThanOrEqual(1);
    expect(codeBlocks[0].textContent).toBe("// Two pointer Java");
  });

  it("shows code template header in fallback mode", async () => {
    const PatternSectionCard = (
      await import("@/components/patterns/PatternSectionCard")
    ).default;

    render(<PatternSectionCard pattern={mockPatternsData[1]} />);
    fireEvent.click(screen.getByText("About This Pattern"));

    expect(screen.getByText("Code Template")).toBeInTheDocument();
  });
});

// Dashboard

describe("Dashboard", () => {
  const renderDashboard = async (questions = mockQuestions) => {
    const Dashboard = (await import("@/components/patterns/Dashboard")).default;
    return render(<Dashboard questions={questions} />);
  };

  it("renders all pattern names as card titles", async () => {
    await renderDashboard();

    expect(
      screen.getAllByText("Arrays & Strings").length
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Two Pointers").length).toBeGreaterThanOrEqual(
      1
    );
    expect(screen.getAllByText("Sliding Window").length).toBeGreaterThanOrEqual(
      1
    );
  });

  it("shows pattern count", async () => {
    await renderDashboard();

    expect(screen.getByText("3 patterns")).toBeInTheDocument();
  });

  it("shows search input", async () => {
    await renderDashboard();

    expect(
      screen.getByPlaceholderText("Search patterns...")
    ).toBeInTheDocument();
  });

  it("shows company dropdown filter", async () => {
    await renderDashboard();

    expect(screen.getByTestId("company-select")).toBeInTheDocument();
  });

  it("shows quote section", async () => {
    await renderDashboard();

    expect(screen.getByTestId("quote-section")).toBeInTheDocument();
  });

  it("shows filter heading as All Patterns by default", async () => {
    await renderDashboard();

    expect(screen.getByText("All Patterns")).toBeInTheDocument();
  });

  it("search filters patterns by name", async () => {
    await renderDashboard();

    const searchInput = screen.getByPlaceholderText("Search patterns...");
    fireEvent.change(searchInput, { target: { value: "two pointer" } });

    expect(screen.getByText("1 patterns")).toBeInTheDocument();
    expect(screen.queryByText("Arrays & Strings")).not.toBeInTheDocument();
    expect(screen.getAllByText("Two Pointers").length).toBeGreaterThanOrEqual(
      1
    );
    expect(screen.queryByText("Sliding Window")).not.toBeInTheDocument();
  });

  it("filters patterns by company via companyFilter context", async () => {
    mockCompanyFilter = "Meta";

    await renderDashboard();

    expect(screen.getByText("Two Pointers")).toBeInTheDocument();
    expect(screen.queryByText("Sliding Window")).not.toBeInTheDocument();
  });

  it("shows company-specific heading when company filter is active", async () => {
    mockCompanyFilter = "Google";
    mockCompletedSet = new Set(["q1", "q2"]);

    await renderDashboard();

    expect(
      screen.getByText("Patterns with Google Questions")
    ).toBeInTheDocument();
  });

  it("shows clear button when search is active", async () => {
    await renderDashboard();

    expect(screen.queryByText("Clear")).not.toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText("Search patterns...");
    fireEvent.change(searchInput, { target: { value: "test" } });

    expect(screen.getByText("Clear")).toBeInTheDocument();
  });

  it("clears company filter when clear is clicked", async () => {
    mockCompanyFilter = "Google";

    await renderDashboard();

    const searchInput = screen.getByPlaceholderText("Search patterns...");
    fireEvent.change(searchInput, { target: { value: "array" } });

    fireEvent.click(screen.getByText("Clear"));

    expect(mockSetCompanyFilter).toHaveBeenCalledWith("");
  });

  it('shows "no results" state when filters match nothing', async () => {
    await renderDashboard();

    const searchInput = screen.getByPlaceholderText("Search patterns...");
    fireEvent.change(searchInput, { target: { value: "xyznonexistent" } });

    expect(
      screen.getByText("No patterns match your filters")
    ).toBeInTheDocument();
    expect(screen.getByText("Clear filters")).toBeInTheDocument();
  });

  it('clicking "Clear filters" in empty state resets', async () => {
    await renderDashboard();

    const searchInput = screen.getByPlaceholderText("Search patterns...");
    fireEvent.change(searchInput, { target: { value: "xyznonexistent" } });

    fireEvent.click(screen.getByText("Clear filters"));

    expect(mockSetCompanyFilter).toHaveBeenCalledWith("");
  });

  it("renders with empty questions", async () => {
    await renderDashboard([]);

    expect(screen.getByText("All Patterns")).toBeInTheDocument();
    expect(screen.getAllByText("0/0 solved").length).toBe(3);
  });

  it("company dropdown lists available companies from questions", async () => {
    await renderDashboard();

    const select = screen.getByTestId("company-select");
    const options = Array.from(select.querySelectorAll("option")).map(
      (o) => o.textContent
    );
    expect(options).toContain("All Companies");
    expect(options).toContain("Google");
    expect(options).toContain("Amazon");
    expect(options).toContain("Meta");
  });

  it("shows free badge for free patterns when user is not pro", async () => {
    mockIsPro = false;

    await renderDashboard();

    const freeBadges = screen.getAllByText("Free");
    expect(freeBadges.length).toBeGreaterThanOrEqual(1);

    const proBadges = screen.queryAllByText("Pro");
    expect(proBadges.length).toBeGreaterThanOrEqual(1);
  });

  it("does not lock any patterns when user is pro", async () => {
    mockIsPro = true;

    await renderDashboard();

    expect(screen.queryByText("Pro")).not.toBeInTheDocument();
  });

  it("search filters by description", async () => {
    await renderDashboard();

    const searchInput = screen.getByPlaceholderText("Search patterns...");
    fireEvent.change(searchInput, { target: { value: "subarray" } });

    expect(screen.getByText("1 patterns")).toBeInTheDocument();
    expect(screen.queryByText("Arrays & Strings")).not.toBeInTheDocument();
  });

  it("shows difficulty badges on each card", async () => {
    await renderDashboard();

    expect(screen.getByText("Easy-Medium")).toBeInTheDocument();
    expect(screen.getByText("Medium")).toBeInTheDocument();
    expect(screen.getByText("Easy")).toBeInTheDocument();
  });
});

// PatternSection

describe("PatternSection", () => {
  it("renders section title and problem count", async () => {
    const PatternSection = (
      await import("@/components/patterns/PatternSection")
    ).default;

    render(
      <PatternSection
        pattern={mockPatternsData[0]}
        questions={[mockQuestions[0]]}
        completed={new Set()}
        onToggleComplete={mockToggleComplete}
      />
    );

    expect(screen.getByText("Arrays & Strings")).toBeInTheDocument();
    expect(screen.getByText("1 problems")).toBeInTheDocument();
    expect(screen.getByText("0/1 done")).toBeInTheDocument();
  });

  it("renders PatternSectionCard", async () => {
    const PatternSection = (
      await import("@/components/patterns/PatternSection")
    ).default;

    render(
      <PatternSection
        pattern={mockPatternsData[0]}
        questions={[mockQuestions[0]]}
        completed={new Set()}
        onToggleComplete={mockToggleComplete}
      />
    );

    expect(screen.getByText("About This Pattern")).toBeInTheDocument();
  });

  it("renders Practice Problems list", async () => {
    const PatternSection = (
      await import("@/components/patterns/PatternSection")
    ).default;

    render(
      <PatternSection
        pattern={mockPatternsData[0]}
        questions={[mockQuestions[0]]}
        completed={new Set()}
        onToggleComplete={mockToggleComplete}
      />
    );

    expect(screen.getByText("Practice Problems")).toBeInTheDocument();
    expect(screen.getByText("Two Sum")).toBeInTheDocument();
  });

  it("shows updated completion stats", async () => {
    const PatternSection = (
      await import("@/components/patterns/PatternSection")
    ).default;

    render(
      <PatternSection
        pattern={mockPatternsData[0]}
        questions={[mockQuestions[0]]}
        completed={new Set(["q1"])}
        onToggleComplete={mockToggleComplete}
      />
    );

    expect(screen.getByText("1/1 done")).toBeInTheDocument();
  });

  it("calls onToggleComplete when toggle button is clicked", async () => {
    const PatternSection = (
      await import("@/components/patterns/PatternSection")
    ).default;

    render(
      <PatternSection
        pattern={mockPatternsData[0]}
        questions={[mockQuestions[0]]}
        completed={new Set()}
        onToggleComplete={mockToggleComplete}
      />
    );

    const buttons = screen.getAllByRole("button");
    const toggleBtn = buttons.find(
      (b) => b.closest('[class*="space-y-2"]') !== null
    );

    if (toggleBtn) {
      fireEvent.click(toggleBtn);
      expect(mockToggleComplete).toHaveBeenCalledWith("q1");
    }
  });

  it("shows problem difficulty, pattern, companies, and frequency", async () => {
    const PatternSection = (
      await import("@/components/patterns/PatternSection")
    ).default;

    render(
      <PatternSection
        pattern={mockPatternsData[0]}
        questions={[mockQuestions[0]]}
        completed={new Set()}
        onToggleComplete={mockToggleComplete}
      />
    );

    expect(screen.getByText("Easy")).toBeInTheDocument();
    expect(screen.getByText("🔥🔥🔥")).toBeInTheDocument();
    expect(screen.getByText("Hash Map")).toBeInTheDocument();
    expect(screen.getByText("Google, Amazon")).toBeInTheDocument();
  });

  it("renders external link to LeetCode", async () => {
    const PatternSection = (
      await import("@/components/patterns/PatternSection")
    ).default;

    render(
      <PatternSection
        pattern={mockPatternsData[0]}
        questions={[mockQuestions[0]]}
        completed={new Set()}
        onToggleComplete={mockToggleComplete}
      />
    );

    const externalLinks = screen.queryAllByTitle("Open on LeetCode");
    expect(externalLinks.length).toBeGreaterThanOrEqual(1);
    if (externalLinks[0]) {
      expect(externalLinks[0]).toHaveAttribute(
        "href",
        "https://leetcode.com/two-sum"
      );
    }
  });

  it("renders multiple problems", async () => {
    const PatternSection = (
      await import("@/components/patterns/PatternSection")
    ).default;

    render(
      <PatternSection
        pattern={mockPatternsData[1]}
        questions={[mockQuestions[1], mockQuestions[2]]}
        completed={new Set()}
        onToggleComplete={mockToggleComplete}
      />
    );

    expect(screen.getByText("2 problems")).toBeInTheDocument();
    expect(screen.getByText("3Sum")).toBeInTheDocument();
    expect(screen.getByText("Container With Most Water")).toBeInTheDocument();
  });

  it("shows completion checkmark for completed questions", async () => {
    const PatternSection = (
      await import("@/components/patterns/PatternSection")
    ).default;

    render(
      <PatternSection
        pattern={mockPatternsData[0]}
        questions={[mockQuestions[0]]}
        completed={new Set(["q1"])}
        onToggleComplete={mockToggleComplete}
      />
    );

    const svgs = document.querySelectorAll("svg");
    const checkSvg = Array.from(svgs).find((s) =>
      s.innerHTML.includes("M5 13l4 4L19 7")
    );
    expect(checkSvg).toBeTruthy();
  });
});

// UnifiedTracker

describe("UnifiedTracker", () => {
  const renderTracker = async (questions = mockQuestions) => {
    const UnifiedTracker = (
      await import("@/components/patterns/UnifiedTracker")
    ).default;
    return render(<UnifiedTracker questions={questions} />);
  };

  it("renders filter controls", async () => {
    await renderTracker();

    expect(
      screen.getByPlaceholderText("Search questions...")
    ).toBeInTheDocument();
    expect(screen.getByText("All Difficulties")).toBeInTheDocument();
    expect(screen.getByText("All Companies")).toBeInTheDocument();
  });

  it("renders QuoteSection", async () => {
    await renderTracker();

    expect(screen.getByTestId("quote-section")).toBeInTheDocument();
  });

  it("renders pattern sections for each category", async () => {
    await renderTracker();

    expect(screen.getByText("Arrays & Strings")).toBeInTheDocument();
    expect(screen.getAllByText("Two Pointers").length).toBeGreaterThanOrEqual(
      1
    );
    expect(
      screen.getAllByText("Practice Problems").length
    ).toBeGreaterThanOrEqual(1);
  });

  it("shows confetti when celebrationKey > 0", async () => {
    mockCelebrationKey = 42;

    const UnifiedTracker = (
      await import("@/components/patterns/UnifiedTracker")
    ).default;

    render(<UnifiedTracker questions={mockQuestions} />);

    expect(screen.getByTestId("confetti")).toBeInTheDocument();
  });

  it("shows Filters header", async () => {
    await renderTracker();

    expect(screen.getByText("Filters")).toBeInTheDocument();
  });

  it("shows Clear Filters and Reset Progress buttons", async () => {
    await renderTracker();

    expect(screen.getByText("Clear Filters")).toBeInTheDocument();
    expect(screen.getByText("Reset Progress")).toBeInTheDocument();
  });

  it("calls resetProgress when Reset Progress is clicked", async () => {
    await renderTracker();

    fireEvent.click(screen.getByText("Reset Progress"));
    expect(mockResetProgress).toHaveBeenCalled();
  });

  it("filters questions by search query", async () => {
    await renderTracker();

    const searchInput = screen.getByPlaceholderText("Search questions...");
    fireEvent.change(searchInput, { target: { value: "3Sum" } });

    expect(screen.getByText("3Sum")).toBeInTheDocument();
    expect(screen.queryByText("Two Sum")).not.toBeInTheDocument();
  });

  it("filters questions by difficulty", async () => {
    await renderTracker();

    const difficultySelect = screen.getByDisplayValue("All Difficulties");
    fireEvent.change(difficultySelect, { target: { value: "Easy" } });

    expect(screen.getByText("Two Sum")).toBeInTheDocument();
    expect(screen.queryByText("3Sum")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Container With Most Water")
    ).not.toBeInTheDocument();
  });

  it("filters questions by company", async () => {
    await renderTracker();

    const companySelect = screen.getByDisplayValue("All Companies");
    fireEvent.change(companySelect, { target: { value: "Amazon" } });

    expect(screen.getByText("Two Sum")).toBeInTheDocument();
    expect(screen.getByText("Container With Most Water")).toBeInTheDocument();
    expect(screen.queryByText("3Sum")).not.toBeInTheDocument();
  });

  it("clears all filters when Clear Filters is clicked", async () => {
    await renderTracker();

    const searchInput = screen.getByPlaceholderText("Search questions...");
    fireEvent.change(searchInput, { target: { value: "3Sum" } });

    fireEvent.click(screen.getByText("Clear Filters"));

    expect(screen.getByText("Two Sum")).toBeInTheDocument();
    expect(screen.getByText("3Sum")).toBeInTheDocument();
  });

  it('shows "no questions match" state when filters match nothing', async () => {
    await renderTracker();

    const searchInput = screen.getByPlaceholderText("Search questions...");
    fireEvent.change(searchInput, { target: { value: "xyznonexistent" } });

    expect(
      screen.getByText("No questions match your filters")
    ).toBeInTheDocument();
  });

  it("renders with empty questions list", async () => {
    await renderTracker([]);

    expect(
      screen.getByText("No questions match your filters")
    ).toBeInTheDocument();
  });

  it("renders categories without mapped patterns as standalone sections", async () => {
    const UnmappedQuestion: Question = {
      id: "unmapped-1",
      name: "Unique Question",
      url: "https://example.com",
      difficulty: "Easy",
      pattern: "Custom Pattern",
      companies: [],
      frequency: "🔥",
      category: "Custom Category",
    };

    const UnifiedTracker = (
      await import("@/components/patterns/UnifiedTracker")
    ).default;

    render(<UnifiedTracker questions={[UnmappedQuestion]} />);

    expect(screen.getByText("Custom Category")).toBeInTheDocument();
    expect(screen.getByText("Unique Question")).toBeInTheDocument();
  });

  it("calls toggleComplete when toggling a question in unmapped category", async () => {
    const UnmappedQuestion: Question = {
      id: "unmapped-2",
      name: "Toggle Test",
      url: "https://example.com",
      difficulty: "Medium",
      pattern: "Custom",
      companies: ["Google"],
      frequency: "🔥🔥",
      category: "Other Category",
    };

    const UnifiedTracker = (
      await import("@/components/patterns/UnifiedTracker")
    ).default;

    render(<UnifiedTracker questions={[UnmappedQuestion]} />);

    const toggleBtns = screen.getAllByRole("button");
    const sectionToggle = toggleBtns.find(
      (btn) =>
        btn.closest("section")?.querySelector("svg") ===
        btn.querySelector("svg")
    );

    if (sectionToggle) {
      fireEvent.click(sectionToggle);
      expect(mockToggleComplete).toHaveBeenCalledWith("unmapped-2");
    }
  });

  it("renders company options from question data", async () => {
    await renderTracker();

    const companySelect = screen.getByDisplayValue("All Companies");
    const options = Array.from(companySelect.querySelectorAll("option")).map(
      (o) => o.textContent
    );
    expect(options).toContain("Google");
    expect(options).toContain("Amazon");
    expect(options).toContain("Meta");
  });
});

// TutorialTab

describe("TutorialTab", () => {
  it("renders current tutorial section title from pattern data", async () => {
    const TutorialTab = (await import("@/app/patterns/[slug]/tabs/TutorialTab"))
      .default;

    render(<TutorialTab pattern={mockPatternsData[0]} />);

    // The new TutorialTab shows one section at a time, starting with the first section
    expect(screen.getByText("Introduction to Arrays")).toBeInTheDocument();
  });

  it("renders section content text via ReactMarkdown", async () => {
    const TutorialTab = (await import("@/app/patterns/[slug]/tabs/TutorialTab"))
      .default;

    render(<TutorialTab pattern={mockPatternsData[0]} />);

    // Only the first section content is shown initially
    expect(
      screen.getByText("Arrays are fundamental data structures.")
    ).toBeInTheDocument();
  });

  it("renders code blocks with language toggle for sections that have code", async () => {
    const TutorialTab = (await import("@/app/patterns/[slug]/tabs/TutorialTab"))
      .default;

    render(<TutorialTab pattern={mockPatternsData[0]} />);

    // Code blocks are shown for the current section
    expect(
      screen.getAllByTestId("language-toggle").length
    ).toBeGreaterThanOrEqual(1);
  });

  it("renders section numbering for current section", async () => {
    const TutorialTab = (await import("@/app/patterns/[slug]/tabs/TutorialTab"))
      .default;

    render(<TutorialTab pattern={mockPatternsData[0]} />);

    // The first section shows "1." numbering
    expect(screen.getByText("1.")).toBeInTheDocument();
  });

  it("renders fallback overview when pattern has no tutorial", async () => {
    const TutorialTab = (await import("@/app/patterns/[slug]/tabs/TutorialTab"))
      .default;

    const noTutorialPattern = { ...mockPatternsData[1], tutorial: undefined };
    render(<TutorialTab pattern={noTutorialPattern} />);

    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(
      screen.getByText("Use two pointers to iterate through data")
    ).toBeInTheDocument();
  });

  it("renders When to Use in fallback mode", async () => {
    const TutorialTab = (await import("@/app/patterns/[slug]/tabs/TutorialTab"))
      .default;

    const noTutorialPattern = { ...mockPatternsData[1], tutorial: undefined };
    render(<TutorialTab pattern={noTutorialPattern} />);

    expect(screen.getByText("When to Use")).toBeInTheDocument();
    expect(screen.getByText("Sorted arrays")).toBeInTheDocument();
    expect(screen.getByText("Linked list cycle detection")).toBeInTheDocument();
  });

  it("renders Key Insights in fallback mode", async () => {
    const TutorialTab = (await import("@/app/patterns/[slug]/tabs/TutorialTab"))
      .default;

    const noTutorialPattern = { ...mockPatternsData[1], tutorial: undefined };
    render(<TutorialTab pattern={noTutorialPattern} />);

    expect(screen.getByText("Key Insights")).toBeInTheDocument();
    expect(screen.getByText("Reduces O(n²) to O(n)")).toBeInTheDocument();
  });

  it("renders Common Mistakes in fallback mode when pattern has them but no tutorial", async () => {
    const TutorialTab = (await import("@/app/patterns/[slug]/tabs/TutorialTab"))
      .default;

    render(<TutorialTab pattern={mockPatternNoTutorialWithMistakes} />);

    expect(screen.getByText("Common Mistakes")).toBeInTheDocument();
    expect(screen.getByText("Test mistake 1")).toBeInTheDocument();
    expect(screen.getByText("Test mistake 2")).toBeInTheDocument();
  });

  it("renders sidebar with navigation links including quiz option", async () => {
    const TutorialTab = (await import("@/app/patterns/[slug]/tabs/TutorialTab"))
      .default;

    render(<TutorialTab pattern={mockPatternsData[0]} />);

    // The sidebar includes section navigation and Take Quiz button
    // Quiz is accessed via sidebar navigation, not rendered at the bottom
    expect(screen.getAllByText("Take Quiz").length).toBeGreaterThanOrEqual(1);
  });

  it("handles missing content gracefully for pattern without tutorial and no commonMistakes", async () => {
    const TutorialTab = (await import("@/app/patterns/[slug]/tabs/TutorialTab"))
      .default;

    render(<TutorialTab pattern={mockPatternNoCommonMistakes} />);

    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("When to Use")).toBeInTheDocument();
    expect(screen.getByText("Key Insights")).toBeInTheDocument();
    expect(screen.queryByText("Common Mistakes")).not.toBeInTheDocument();
  });
});

// CheatsheetTab

describe("CheatsheetTab", () => {
  it("renders When to Use section", async () => {
    const CheatsheetTab = (
      await import("@/app/patterns/[slug]/tabs/CheatsheetTab")
    ).default;

    render(<CheatsheetTab pattern={mockPatternsData[0]} />);

    expect(screen.getByText("When to Use")).toBeInTheDocument();
    expect(screen.getByText("Hash Map for O(1) lookups")).toBeInTheDocument();
    expect(screen.getByText("Sorting when order matters")).toBeInTheDocument();
  });

  it("renders Key Insights section", async () => {
    const CheatsheetTab = (
      await import("@/app/patterns/[slug]/tabs/CheatsheetTab")
    ).default;

    render(<CheatsheetTab pattern={mockPatternsData[0]} />);

    expect(screen.getByText("Key Insights")).toBeInTheDocument();
    expect(
      screen.getByText("Hash Map: O(1) average lookup")
    ).toBeInTheDocument();
  });

  it("renders Common Mistakes section when available", async () => {
    const CheatsheetTab = (
      await import("@/app/patterns/[slug]/tabs/CheatsheetTab")
    ).default;

    render(<CheatsheetTab pattern={mockPatternsData[0]} />);

    expect(screen.getByText("Common Mistakes")).toBeInTheDocument();
    expect(screen.getByText("Off-by-one errors")).toBeInTheDocument();
    expect(screen.getByText("Integer overflow")).toBeInTheDocument();
  });

  it("does not render Common Mistakes section when empty", async () => {
    const CheatsheetTab = (
      await import("@/app/patterns/[slug]/tabs/CheatsheetTab")
    ).default;

    const patternNoMistakes = {
      ...mockPatternsData[0],
      commonMistakes: undefined,
    };
    render(<CheatsheetTab pattern={patternNoMistakes} />);

    expect(screen.queryByText("Common Mistakes")).not.toBeInTheDocument();
  });

  it("renders Quick Template section heading", async () => {
    const CheatsheetTab = (
      await import("@/app/patterns/[slug]/tabs/CheatsheetTab")
    ).default;

    render(<CheatsheetTab pattern={mockPatternsData[0]} />);

    expect(screen.getByText("Quick Template")).toBeInTheDocument();
  });

  it("renders code via dynamic mock", async () => {
    const CheatsheetTab = (
      await import("@/app/patterns/[slug]/tabs/CheatsheetTab")
    ).default;

    render(<CheatsheetTab pattern={mockPatternsData[0]} />);

    const dynamicMocks = screen.getAllByTestId("dynamic-mock");
    expect(dynamicMocks.length).toBeGreaterThanOrEqual(1);

    const codeEl = dynamicMocks[0];
    expect(codeEl.getAttribute("code")).toBe("// Java code template");
  });

  it("renders complexity information", async () => {
    const CheatsheetTab = (
      await import("@/app/patterns/[slug]/tabs/CheatsheetTab")
    ).default;

    render(<CheatsheetTab pattern={mockPatternsData[0]} />);

    expect(screen.getByText("Time:")).toBeInTheDocument();
    expect(screen.getByText("Space:")).toBeInTheDocument();
    const complexities = screen.getAllByText("O(n)");
    expect(complexities.length).toBe(2);
  });

  it("renders language toggle for template switching", async () => {
    const CheatsheetTab = (
      await import("@/app/patterns/[slug]/tabs/CheatsheetTab")
    ).default;

    render(<CheatsheetTab pattern={mockPatternsData[0]} />);

    expect(screen.getByTestId("language-toggle")).toBeInTheDocument();
  });

  it("calls setLanguage when language toggle button is clicked", async () => {
    const CheatsheetTab = (
      await import("@/app/patterns/[slug]/tabs/CheatsheetTab")
    ).default;

    render(<CheatsheetTab pattern={mockPatternsData[0]} />);

    const jsBtn = screen.getByTestId("lang-btn-javascript");
    fireEvent.click(jsBtn);

    expect(mockSetLanguage).toHaveBeenCalledWith("javascript");
  });

  it("uses current language from LanguageContext in code attribute", async () => {
    mockLanguage = "javascript";

    const CheatsheetTab = (
      await import("@/app/patterns/[slug]/tabs/CheatsheetTab")
    ).default;

    render(<CheatsheetTab pattern={mockPatternsData[0]} />);

    const dynamicMocks = screen.getAllByTestId("dynamic-mock");
    const codeEl = dynamicMocks.find(
      (el) => el.getAttribute("language") === "javascript"
    );
    expect(codeEl).toBeTruthy();
  });

  it("handles pattern with no code templates gracefully", async () => {
    const CheatsheetTab = (
      await import("@/app/patterns/[slug]/tabs/CheatsheetTab")
    ).default;

    const emptyTemplatePattern = {
      ...mockPatternsData[0],
      codeTemplates: {
        java: "",
        javascript: "",
        python: "",
        cpp: "",
        go: "",
      },
    };

    render(<CheatsheetTab pattern={emptyTemplatePattern} />);

    expect(screen.getByText("Quick Template")).toBeInTheDocument();
    const dynamicMocks = screen.getAllByTestId("dynamic-mock");
    const codeEl = dynamicMocks[0];
    expect(codeEl.getAttribute("code")).toBe("");
  });

  it("uses first available language as fallback when current language not in codeTemplates", async () => {
    const CheatsheetTab = (
      await import("@/app/patterns/[slug]/tabs/CheatsheetTab")
    ).default;

    const onlyJavaPattern = {
      ...mockPatternsData[0],
      codeTemplates: {
        java: "// Only Java",
        javascript: "",
        python: "",
        cpp: "",
        go: "",
      },
    };

    mockLanguage = "python";

    render(<CheatsheetTab pattern={onlyJavaPattern} />);

    const dynamicMocks = screen.getAllByTestId("dynamic-mock");
    const codeEl = dynamicMocks[0];
    expect(codeEl.getAttribute("code")).toContain("Only Java");
  });
});
