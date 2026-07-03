import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CourseNavigation from "@/components/course/CourseNavigation";
import type { Pattern } from "@/types";

vi.mock("@/contexts/PatternProgressContext", () => ({
  usePatternProgress: vi.fn(),
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

describe("CourseNavigation", () => {
  const mockToggleComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePatternProgress).mockReturnValue({
      isCompleted: vi.fn().mockReturnValue(false),
      markComplete: vi.fn(),
      markIncomplete: vi.fn(),
      toggleComplete: mockToggleComplete,
      getCompletedCount: vi.fn().mockReturnValue(0),
      getProgress: vi.fn().mockReturnValue(0),
    });
  });

  it("should render mark complete button when on first section", () => {
    render(
      <CourseNavigation
        pattern={mockPattern}
        currentSectionIndex={0}
        onNavigate={vi.fn()}
      />
    );

    expect(screen.getByText("Mark complete")).toBeInTheDocument();
  });

  it("should render next section button", () => {
    render(
      <CourseNavigation
        pattern={mockPattern}
        currentSectionIndex={0}
        onNavigate={vi.fn()}
      />
    );

    expect(screen.getByText("Basic Concept")).toBeInTheDocument();
  });

  it("should not render prev button on first section", () => {
    render(
      <CourseNavigation
        pattern={mockPattern}
        currentSectionIndex={0}
        onNavigate={vi.fn()}
      />
    );

    expect(screen.queryByText("Introduction")).not.toBeInTheDocument();
  });

  it("should render prev button on non-first sections", () => {
    render(
      <CourseNavigation
        pattern={mockPattern}
        currentSectionIndex={2}
        onNavigate={vi.fn()}
      />
    );

    expect(screen.getByText("Basic Concept")).toBeInTheDocument();
  });

  it("should call onNavigate with next index when next is clicked", () => {
    const onNavigate = vi.fn();

    render(
      <CourseNavigation
        pattern={mockPattern}
        currentSectionIndex={1}
        onNavigate={onNavigate}
      />
    );

    fireEvent.click(screen.getByText("Examples"));

    expect(onNavigate).toHaveBeenCalledWith(2);
  });

  it("should call onNavigate with prev index when prev is clicked", () => {
    const onNavigate = vi.fn();

    render(
      <CourseNavigation
        pattern={mockPattern}
        currentSectionIndex={2}
        onNavigate={onNavigate}
      />
    );

    fireEvent.click(screen.getByText("Basic Concept"));

    expect(onNavigate).toHaveBeenCalledWith(1);
  });

  it("should toggle complete when mark complete button is clicked", () => {
    render(
      <CourseNavigation
        pattern={mockPattern}
        currentSectionIndex={0}
        onNavigate={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText("Mark complete"));

    expect(mockToggleComplete).toHaveBeenCalledWith("sliding-window", 0);
  });

  it("should show Completed when section is already complete", () => {
    vi.mocked(usePatternProgress).mockReturnValue({
      isCompleted: vi.fn().mockReturnValue(true),
      markComplete: vi.fn(),
      markIncomplete: vi.fn(),
      toggleComplete: mockToggleComplete,
      getCompletedCount: vi.fn().mockReturnValue(1),
      getProgress: vi.fn().mockReturnValue(25),
    });

    render(
      <CourseNavigation
        pattern={mockPattern}
        currentSectionIndex={0}
        onNavigate={vi.fn()}
      />
    );

    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  it("should show Take Quiz button on last section", () => {
    render(
      <CourseNavigation
        pattern={mockPattern}
        currentSectionIndex={3}
        onNavigate={vi.fn()}
      />
    );

    expect(screen.getByText("Take Quiz")).toBeInTheDocument();
  });

  it("should navigate to quiz when Take Quiz is clicked", () => {
    const onNavigate = vi.fn();

    render(
      <CourseNavigation
        pattern={mockPattern}
        currentSectionIndex={3}
        onNavigate={onNavigate}
      />
    );

    fireEvent.click(screen.getByText("Take Quiz"));

    expect(onNavigate).toHaveBeenCalledWith(4);
  });
});
