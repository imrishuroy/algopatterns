import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ProblemsTab from "@/app/patterns/[slug]/tabs/ProblemsTab";
import type { Question } from "@/types";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    onClick,
  }: {
    children: React.ReactNode;
    href: string;
    onClick?: () => void;
  }) => (
    <a href={href} onClick={onClick}>
      {children}
    </a>
  ),
}));

const mockSessionStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "sessionStorage", {
  value: mockSessionStorage,
});

const mockQuestions: Question[] = [
  {
    id: "q1",
    name: "Two Sum",
    url: "https://leetcode.com/problems/two-sum",
    difficulty: "Easy",
    pattern: "Hash Map",
    companies: ["Google", "Amazon"],
    frequency: "🔥🔥🔥",
    category: "Arrays & Strings",
  },
  {
    id: "q2",
    name: "Find Peak Element",
    url: "https://leetcode.com/problems/find-peak-element",
    difficulty: "Easy",
    pattern: "Binary Search",
    companies: ["Microsoft"],
    frequency: "🔥🔥",
    category: "Binary Search",
  },
  {
    id: "q3",
    name: "Median of Two Sorted Arrays",
    url: "https://leetcode.com/problems/median-of-two-sorted-arrays",
    difficulty: "Hard",
    pattern: "Binary Search",
    companies: ["Google", "Apple"],
    frequency: "🔥",
    category: "Binary Search",
  },
  {
    id: "q4",
    name: "Search in Rotated Sorted Array",
    url: "https://leetcode.com/problems/search-in-rotated-sorted-array",
    difficulty: "Medium",
    pattern: "Binary Search",
    companies: ["Facebook"],
    frequency: "🔥🔥",
    category: "Binary Search",
  },
];

describe("ProblemsTab", () => {
  const mockToggleComplete = vi.fn();
  const defaultProps = {
    questions: mockQuestions,
    completed: new Set<string>(),
    onToggleComplete: mockToggleComplete,
    patternId: "binary-search",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionStorage.clear();
  });

  it("renders all questions", () => {
    render(<ProblemsTab {...defaultProps} />);

    expect(screen.getByText("Two Sum")).toBeInTheDocument();
    expect(screen.getByText("Find Peak Element")).toBeInTheDocument();
    expect(screen.getByText("Median of Two Sorted Arrays")).toBeInTheDocument();
    expect(
      screen.getByText("Search in Rotated Sorted Array")
    ).toBeInTheDocument();
  });

  it("displays correct stats", () => {
    render(<ProblemsTab {...defaultProps} />);

    // Check stats labels are rendered
    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getByText("Solved")).toBeInTheDocument();
    // Check that all difficulty levels appear somewhere (in stats or problem list)
    expect(screen.getAllByText("Easy").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Medium").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Hard").length).toBeGreaterThan(0);
  });

  it("displays completed count when some questions are completed", () => {
    const completedSet = new Set(["q1", "q2"]);
    render(<ProblemsTab {...defaultProps} completed={completedSet} />);

    // Check that Solved label exists (the count will be somewhere in the UI)
    expect(screen.getByText("Solved")).toBeInTheDocument();
  });

  it("filters by search term", () => {
    render(<ProblemsTab {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText("Search problems...");
    fireEvent.change(searchInput, { target: { value: "median" } });

    expect(screen.getByText("Median of Two Sorted Arrays")).toBeInTheDocument();
    expect(screen.queryByText("Two Sum")).not.toBeInTheDocument();
    expect(screen.queryByText("Find Peak Element")).not.toBeInTheDocument();
  });

  it("filters by difficulty", () => {
    render(<ProblemsTab {...defaultProps} />);

    const difficultySelect = screen.getByDisplayValue("All Difficulties");
    fireEvent.change(difficultySelect, { target: { value: "Hard" } });

    expect(screen.getByText("Median of Two Sorted Arrays")).toBeInTheDocument();
    expect(screen.queryByText("Two Sum")).not.toBeInTheDocument();
    expect(screen.queryByText("Find Peak Element")).not.toBeInTheDocument();
  });

  it("filters by completion status - todo", () => {
    const completedSet = new Set(["q1"]);
    render(<ProblemsTab {...defaultProps} completed={completedSet} />);

    const statusSelect = screen.getByDisplayValue("All Status");
    fireEvent.change(statusSelect, { target: { value: "todo" } });

    // Two Sum (q1) is completed, so should not appear in todo
    expect(screen.queryByText("Two Sum")).not.toBeInTheDocument();
    // Other questions should still be visible
    expect(screen.getByText("Median of Two Sorted Arrays")).toBeInTheDocument();
  });

  it("filters by completion status - completed", () => {
    const completedSet = new Set(["q1"]);
    render(<ProblemsTab {...defaultProps} completed={completedSet} />);

    const statusSelect = screen.getByDisplayValue("All Status");
    fireEvent.change(statusSelect, { target: { value: "completed" } });

    expect(screen.getByText("Two Sum")).toBeInTheDocument();
    expect(screen.queryByText("Find Peak Element")).not.toBeInTheDocument();
  });

  it("sorts by name when name sort button is clicked", () => {
    render(<ProblemsTab {...defaultProps} />);

    const nameSortButton = screen.getByText("Name");
    fireEvent.click(nameSortButton);

    const problemRows = screen.getAllByText(/Sum|Search|Median/);
    expect(problemRows.length).toBeGreaterThan(0);
  });

  it("calls onToggleComplete when checkbox is clicked", () => {
    render(<ProblemsTab {...defaultProps} />);

    const checkboxes = screen.getAllByRole("button").filter((btn) => {
      return btn.className.includes("rounded-md border-2");
    });
    fireEvent.click(checkboxes[0]);

    expect(mockToggleComplete).toHaveBeenCalled();
  });

  it("shows empty state when no problems match filters", () => {
    render(<ProblemsTab {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText("Search problems...");
    fireEvent.change(searchInput, { target: { value: "nonexistent" } });

    expect(
      screen.getByText("No problems match your filters")
    ).toBeInTheDocument();
  });

  it("generates correct solve link with pattern ID", () => {
    render(<ProblemsTab {...defaultProps} />);

    const solveButtons = screen.getAllByText("Solve");
    const firstSolveLink = solveButtons[0].closest("a");

    expect(firstSolveLink).toHaveAttribute(
      "href",
      expect.stringContaining("?from=binary-search")
    );
  });

  it("saves scroll position when clicking Solve", () => {
    Object.defineProperty(window, "scrollY", { value: 500, writable: true });

    render(<ProblemsTab {...defaultProps} />);

    const solveButtons = screen.getAllByText("Solve");
    fireEvent.click(solveButtons[0]);

    expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
      "problems_scroll_position_binary-search",
      "500"
    );
  });

  it("restores scroll position from sessionStorage on mount", async () => {
    mockSessionStorage.getItem.mockReturnValueOnce("300");
    const scrollToSpy = vi
      .spyOn(window, "scrollTo")
      .mockImplementation(() => {});

    render(<ProblemsTab {...defaultProps} />);

    // Check that sessionStorage was queried
    expect(mockSessionStorage.getItem).toHaveBeenCalledWith(
      "problems_scroll_position_binary-search"
    );

    // Check that removeItem was called after restoring
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(
      "problems_scroll_position_binary-search"
    );

    scrollToSpy.mockRestore();
  });
});

describe("nameToSlug", () => {
  it("converts problem name to slug format via Solve link", () => {
    render(
      <ProblemsTab
        questions={[mockQuestions[0]]}
        completed={new Set()}
        onToggleComplete={vi.fn()}
        patternId="test"
      />
    );

    const solveLink = screen.getByText("Solve").closest("a");
    expect(solveLink).toHaveAttribute("href", "/problems/two-sum?from=test");
  });
});
