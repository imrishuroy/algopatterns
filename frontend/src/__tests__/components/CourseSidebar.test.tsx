import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CourseSidebar from "@/components/course/CourseSidebar";
import type { Pattern } from "@/types";

vi.mock("@/contexts/PatternProgressContext", () => ({
  usePatternProgress: vi.fn(),
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

import { usePatternProgress } from "@/contexts/PatternProgressContext";

const mockPattern: Pattern = {
  id: "sliding-window",
  category: "Sliding Window",
  difficulty: "Easy",
  description: "Learn the sliding window pattern",
  whenToUse: ["When you need a sliding window approach"],
  codeTemplates: { javascript: "// code" },
  keyInsights: ["Key insight 1"],
  variations: [],
  commonProblems: [],
  timeComplexity: "O(n)",
  spaceComplexity: "O(1)",
  tutorial: [
    { title: "Introduction", content: "Intro content" },
    { title: "Basic Concept", content: "Basic content" },
    { title: "Examples", content: "Examples content" },
    { title: "Practice", content: "Practice content" },
  ],
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

describe("CourseSidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePatternProgress).mockReturnValue({
      isCompleted: vi.fn().mockReturnValue(false),
      markComplete: vi.fn(),
      markIncomplete: vi.fn(),
      toggleComplete: vi.fn(),
      getCompletedCount: vi.fn().mockReturnValue(0),
      getProgress: vi.fn().mockReturnValue(0),
      isLoading: false,
    });
  });

  it("should render pattern category and difficulty", () => {
    render(
      <CourseSidebar
        pattern={mockPattern}
        currentSectionIndex={0}
        onSectionChange={vi.fn()}
      />
    );

    expect(screen.getAllByText("Sliding Window")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Easy")[0]).toBeInTheDocument();
  });

  it("should render all section titles", () => {
    render(
      <CourseSidebar
        pattern={mockPattern}
        currentSectionIndex={0}
        onSectionChange={vi.fn()}
      />
    );

    expect(screen.getAllByText(/1\. Introduction/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/2\. Basic Concept/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/3\. Examples/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/4\. Practice/)[0]).toBeInTheDocument();
  });

  it("should render progress bar", () => {
    vi.mocked(usePatternProgress).mockReturnValue({
      isCompleted: vi.fn().mockReturnValue(false),
      markComplete: vi.fn(),
      markIncomplete: vi.fn(),
      toggleComplete: vi.fn(),
      getCompletedCount: vi.fn().mockReturnValue(2),
      getProgress: vi.fn().mockReturnValue(50),
      isLoading: false,
    });

    render(
      <CourseSidebar
        pattern={mockPattern}
        currentSectionIndex={0}
        onSectionChange={vi.fn()}
      />
    );

    expect(screen.getAllByText("50%")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Progress")[0]).toBeInTheDocument();
  });

  it("should call onSectionChange when section is clicked", () => {
    const onSectionChange = vi.fn();

    render(
      <CourseSidebar
        pattern={mockPattern}
        currentSectionIndex={0}
        onSectionChange={onSectionChange}
      />
    );

    fireEvent.click(screen.getAllByText(/2\. Basic Concept/)[0]);

    expect(onSectionChange).toHaveBeenCalledWith(1);
  });

  it("should show checkmarks for completed sections", () => {
    vi.mocked(usePatternProgress).mockReturnValue({
      isCompleted: vi.fn((_, index) => index === 0 || index === 1),
      markComplete: vi.fn(),
      markIncomplete: vi.fn(),
      toggleComplete: vi.fn(),
      getCompletedCount: vi.fn().mockReturnValue(2),
      getProgress: vi.fn().mockReturnValue(50),
      isLoading: false,
    });

    render(
      <CourseSidebar
        pattern={mockPattern}
        currentSectionIndex={2}
        onSectionChange={vi.fn()}
      />
    );

    const isCompleted = vi.mocked(usePatternProgress)().isCompleted;
    expect(isCompleted).toHaveBeenCalledWith("sliding-window", 0);
    expect(isCompleted).toHaveBeenCalledWith("sliding-window", 1);
  });

  it("should render back to patterns link", () => {
    render(
      <CourseSidebar
        pattern={mockPattern}
        currentSectionIndex={0}
        onSectionChange={vi.fn()}
      />
    );

    const backLinks = screen.getAllByText("All Patterns");
    expect(backLinks[0].closest("a")).toHaveAttribute("href", "/patterns");
  });

  it("should render Take Quiz button", () => {
    render(
      <CourseSidebar
        pattern={mockPattern}
        currentSectionIndex={0}
        onSectionChange={vi.fn()}
      />
    );

    expect(screen.getAllByText("Take Quiz")[0]).toBeInTheDocument();
  });

  it("should call onSectionChange with quiz index when Take Quiz is clicked", () => {
    const onSectionChange = vi.fn();

    render(
      <CourseSidebar
        pattern={mockPattern}
        currentSectionIndex={0}
        onSectionChange={onSectionChange}
      />
    );

    fireEvent.click(screen.getAllByText("Take Quiz")[0]);

    expect(onSectionChange).toHaveBeenCalledWith(4);
  });
});
