import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PatternPageClient from "@/app/patterns/[slug]/PatternPageClient";
import type { Pattern } from "@/types";

vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(() => ({
    get: vi.fn((key: string) => {
      if (key === "tab") return mockTabParam;
      return null;
    }),
  })),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("@/contexts/ProgressContext", () => ({
  useProgress: () => ({
    completed: new Set<string>(),
    toggleComplete: vi.fn(),
  }),
}));

vi.mock("@/contexts/SubscriptionContext", () => ({
  useSubscription: () => ({
    isPro: true,
    isLoading: false,
  }),
}));

vi.mock("@/lib/questions", () => ({
  questions: [
    {
      id: "q1",
      name: "Two Sum",
      url: "https://leetcode.com/problems/two-sum",
      difficulty: "Easy",
      pattern: "Hash Map",
      companies: ["Google"],
      frequency: "🔥",
      category: "Binary Search",
    },
  ],
  categoryToPatternId: {
    "Binary Search": "binary-search",
  },
}));

vi.mock("@/app/patterns/[slug]/tabs/TutorialTab", () => ({
  default: () => <div data-testid="tutorial-tab">Tutorial Content</div>,
}));

vi.mock("@/app/patterns/[slug]/tabs/ProblemsTab", () => ({
  default: () => <div data-testid="problems-tab">Problems Content</div>,
}));

vi.mock("@/app/patterns/[slug]/tabs/CheatsheetTab", () => ({
  default: () => <div data-testid="cheatsheet-tab">Cheatsheet Content</div>,
}));

vi.mock("@/components/ui/Highlightable", () => ({
  Highlightable: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("@/components/pricing", () => ({
  UpgradePrompt: () => <div data-testid="upgrade-prompt">Upgrade Required</div>,
}));

let mockTabParam: string | null = null;

const mockPattern: Pattern = {
  id: "binary-search",
  category: "Binary Search",
  description: "Binary search pattern description",
  difficulty: "Medium",
  timeComplexity: "O(log n)",
  spaceComplexity: "O(1)",
  whenToUse: ["Finding elements in sorted arrays"],
  codeTemplates: { java: "", python: "", javascript: "" },
  keyInsights: ["Divide and conquer"],
  variations: [],
  commonProblems: ["Binary Search", "Search in Rotated Sorted Array"],
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
};

describe("PatternPageClient", () => {
  beforeEach(() => {
    mockTabParam = null;
    vi.clearAllMocks();
  });

  it("renders pattern title and description", () => {
    render(<PatternPageClient pattern={mockPattern} />);

    expect(screen.getByText("Binary Search")).toBeInTheDocument();
  });

  it("shows tutorial tab by default", () => {
    render(<PatternPageClient pattern={mockPattern} />);

    expect(screen.getByTestId("tutorial-tab")).toBeInTheDocument();
  });

  it("shows problems tab when tab=problems in URL", () => {
    mockTabParam = "problems";
    render(<PatternPageClient pattern={mockPattern} />);

    expect(screen.getByTestId("problems-tab")).toBeInTheDocument();
  });

  it("shows cheatsheet tab when tab=cheatsheet in URL", () => {
    mockTabParam = "cheatsheet";
    render(<PatternPageClient pattern={mockPattern} />);

    expect(screen.getByTestId("cheatsheet-tab")).toBeInTheDocument();
  });

  it("switches to problems tab when clicked", () => {
    render(<PatternPageClient pattern={mockPattern} />);

    const problemsTabButton = screen.getByRole("button", { name: /problems/i });
    fireEvent.click(problemsTabButton);

    expect(screen.getByTestId("problems-tab")).toBeInTheDocument();
  });

  it("switches to cheatsheet tab when clicked", () => {
    render(<PatternPageClient pattern={mockPattern} />);

    const cheatsheetTabButton = screen.getByRole("button", {
      name: /cheatsheet/i,
    });
    fireEvent.click(cheatsheetTabButton);

    expect(screen.getByTestId("cheatsheet-tab")).toBeInTheDocument();
  });

  it("has a back button that links to home", () => {
    render(<PatternPageClient pattern={mockPattern} />);

    const backLink = screen.getByText("Back").closest("a");
    expect(backLink).toHaveAttribute("href", "/");
  });

  it("displays difficulty badge", () => {
    render(<PatternPageClient pattern={mockPattern} />);

    expect(screen.getByText("Medium")).toBeInTheDocument();
  });
});

describe("PatternPageClient - free patterns", () => {
  beforeEach(() => {
    mockTabParam = null;
    vi.clearAllMocks();
  });

  it("shows content for free patterns (sliding-window, two-pointers, binary-search)", () => {
    // binary-search is a free pattern, so content should be visible
    render(<PatternPageClient pattern={mockPattern} />);

    // Should show tutorial tab content, not upgrade prompt
    expect(screen.getByTestId("tutorial-tab")).toBeInTheDocument();
    expect(screen.queryByTestId("upgrade-prompt")).not.toBeInTheDocument();
  });
});
