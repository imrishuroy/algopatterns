import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import TutorialTab from "@/app/patterns/[slug]/tabs/TutorialTab";
import type { Pattern } from "@/types";

// Mock dependencies
vi.mock("@/contexts/PatternProgressContext", () => ({
  usePatternProgress: () => ({
    isCompleted: vi.fn().mockReturnValue(false),
    markComplete: vi.fn(),
    markIncomplete: vi.fn(),
    toggleComplete: vi.fn(),
    getCompletedCount: vi.fn().mockReturnValue(0),
    getProgress: vi.fn().mockReturnValue(0),
    isLoading: false,
  }),
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

vi.mock("@/components/quiz", () => ({
  QuizCard: ({ patternId }: { patternId: string }) => (
    <div data-testid="quiz-card">Quiz for {patternId}</div>
  ),
}));

vi.mock("@/components/ui/Highlightable", () => ({
  Highlightable: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="highlightable">{children}</div>
  ),
}));

vi.mock("@/components/course/TutorialSection", () => ({
  default: ({
    section,
    sectionIndex,
  }: {
    section: { title: string };
    sectionIndex: number;
  }) => (
    <div data-testid={`tutorial-section-${sectionIndex}`}>
      <h2>{section.title}</h2>
    </div>
  ),
}));

// Store original window properties
const originalLocation = window.location;
const originalHistory = window.history;

// Mock pattern with tutorial sections
const mockPatternWithTutorial: Pattern = {
  id: "intervals",
  category: "Intervals",
  difficulty: "Medium",
  description: "Learn interval problems",
  whenToUse: ["Scheduling", "Merging ranges"],
  codeTemplates: { javascript: "// code" },
  keyInsights: ["Sort by start or end"],
  variations: [],
  commonProblems: ["Merge Intervals"],
  timeComplexity: "O(n log n)",
  spaceComplexity: "O(n)",
  tutorial: [
    { title: "Introduction to Interval Problems", content: "Content 1" },
    { title: "Merge Overlapping Intervals", content: "Content 2" },
    { title: "Insert Interval", content: "Content 3" },
    { title: "Meeting Rooms: Line Sweep", content: "Content 4" },
    { title: "Minimum Arrows to Burst Balloons", content: "Content 5" },
  ],
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

const mockPatternWithoutTutorial: Pattern = {
  id: "no-tutorial",
  category: "No Tutorial",
  difficulty: "Easy",
  description: "Pattern without tutorial",
  whenToUse: ["Test case"],
  codeTemplates: { javascript: "// code" },
  keyInsights: ["Test insight"],
  commonMistakes: ["Test mistake"],
  variations: [],
  commonProblems: [],
  timeComplexity: "O(n)",
  spaceComplexity: "O(1)",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

describe("TutorialTab", () => {
  let mockHash = "";
  let mockReplaceState: ReturnType<typeof vi.fn>;
  let hashChangeListeners: Array<() => void> = [];

  beforeEach(() => {
    vi.clearAllMocks();
    mockHash = "";
    hashChangeListeners = [];
    mockReplaceState = vi.fn();

    // Mock window.location
    Object.defineProperty(window, "location", {
      value: {
        ...originalLocation,
        get hash() {
          return mockHash;
        },
        set hash(value: string) {
          mockHash = value;
        },
      },
      writable: true,
    });

    // Mock window.history.replaceState
    Object.defineProperty(window, "history", {
      value: {
        ...originalHistory,
        replaceState: mockReplaceState,
      },
      writable: true,
    });

    // Mock window.scrollTo
    window.scrollTo = vi.fn();

    // Mock addEventListener for hashchange
    const originalAddEventListener = window.addEventListener;
    const originalRemoveEventListener = window.removeEventListener;

    window.addEventListener = vi.fn((event, handler) => {
      if (event === "hashchange") {
        hashChangeListeners.push(handler as () => void);
      }
      return originalAddEventListener.call(window, event, handler);
    });

    window.removeEventListener = vi.fn((event, handler) => {
      if (event === "hashchange") {
        hashChangeListeners = hashChangeListeners.filter((h) => h !== handler);
      }
      return originalRemoveEventListener.call(window, event, handler);
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
    });
    Object.defineProperty(window, "history", {
      value: originalHistory,
      writable: true,
    });
  });

  describe("rendering without tutorial", () => {
    it("renders overview when pattern has no tutorial", () => {
      render(<TutorialTab pattern={mockPatternWithoutTutorial} />);

      expect(screen.getByText("Overview")).toBeInTheDocument();
      expect(
        screen.getByText("Pattern without tutorial")
      ).toBeInTheDocument();
    });

    it("renders When to Use section", () => {
      render(<TutorialTab pattern={mockPatternWithoutTutorial} />);

      expect(screen.getByText("When to Use")).toBeInTheDocument();
      expect(screen.getByText("Test case")).toBeInTheDocument();
    });

    it("renders Key Insights section", () => {
      render(<TutorialTab pattern={mockPatternWithoutTutorial} />);

      expect(screen.getByText("Key Insights")).toBeInTheDocument();
      expect(screen.getByText("Test insight")).toBeInTheDocument();
    });

    it("renders Common Mistakes section when present", () => {
      render(<TutorialTab pattern={mockPatternWithoutTutorial} />);

      expect(screen.getByText("Common Mistakes")).toBeInTheDocument();
      expect(screen.getByText("Test mistake")).toBeInTheDocument();
    });

    it("does not render Common Mistakes when empty", () => {
      const patternNoMistakes = {
        ...mockPatternWithoutTutorial,
        commonMistakes: [],
      };
      render(<TutorialTab pattern={patternNoMistakes} />);

      expect(screen.queryByText("Common Mistakes")).not.toBeInTheDocument();
    });
  });

  describe("rendering with tutorial", () => {
    it("renders first section by default", () => {
      render(<TutorialTab pattern={mockPatternWithTutorial} />);

      expect(
        screen.getByText("Introduction to Interval Problems")
      ).toBeInTheDocument();
      expect(screen.getByTestId("tutorial-section-0")).toBeInTheDocument();
    });

    it("renders sidebar with all sections", () => {
      render(<TutorialTab pattern={mockPatternWithTutorial} />);

      // Check sidebar content (appears twice for desktop and mobile)
      expect(
        screen.getAllByText(/1\. Introduction to Interval Problems/)[0]
      ).toBeInTheDocument();
      expect(
        screen.getAllByText(/2\. Merge Overlapping Intervals/)[0]
      ).toBeInTheDocument();
    });

    it("renders course navigation", () => {
      render(<TutorialTab pattern={mockPatternWithTutorial} />);

      // Next section button should be visible
      expect(
        screen.getByText("Merge Overlapping Intervals")
      ).toBeInTheDocument();
    });
  });

  describe("section navigation via sidebar", () => {
    it("changes section when sidebar item is clicked", async () => {
      render(<TutorialTab pattern={mockPatternWithTutorial} />);

      // Click on third section in sidebar
      const sectionButtons = screen.getAllByText(/3\. Insert Interval/);
      fireEvent.click(sectionButtons[0]);

      await waitFor(() => {
        expect(screen.getByTestId("tutorial-section-2")).toBeInTheDocument();
      });
    });

    it("updates URL hash when section changes", async () => {
      render(<TutorialTab pattern={mockPatternWithTutorial} />);

      const sectionButtons = screen.getAllByText(/3\. Insert Interval/);
      fireEvent.click(sectionButtons[0]);

      await waitFor(() => {
        expect(mockReplaceState).toHaveBeenCalledWith(
          null,
          "",
          "#insert-interval"
        );
      });
    });

    it("scrolls to top when section changes", async () => {
      render(<TutorialTab pattern={mockPatternWithTutorial} />);

      const sectionButtons = screen.getAllByText(/2\. Merge Overlapping/);
      fireEvent.click(sectionButtons[0]);

      await waitFor(() => {
        expect(window.scrollTo).toHaveBeenCalledWith({
          top: 0,
          behavior: "smooth",
        });
      });
    });
  });

  describe("quiz navigation", () => {
    it("shows quiz when quiz section is selected", async () => {
      render(<TutorialTab pattern={mockPatternWithTutorial} />);

      // Click on Take Quiz
      const quizButtons = screen.getAllByText("Take Quiz");
      fireEvent.click(quizButtons[0]);

      await waitFor(() => {
        expect(screen.getByTestId("quiz-card")).toBeInTheDocument();
        expect(screen.getByText("Quiz for intervals")).toBeInTheDocument();
      });
    });

    it("updates URL hash to #quiz when quiz is selected", async () => {
      render(<TutorialTab pattern={mockPatternWithTutorial} />);

      const quizButtons = screen.getAllByText("Take Quiz");
      fireEvent.click(quizButtons[0]);

      await waitFor(() => {
        expect(mockReplaceState).toHaveBeenCalledWith(null, "", "#quiz");
      });
    });
  });

  describe("edge cases for handleSectionChange", () => {
    it("handles invalid section index gracefully", async () => {
      // This tests the else branch when currentSections[index] is undefined
      const patternWithSingleSection: Pattern = {
        ...mockPatternWithTutorial,
        tutorial: [{ title: "Only Section", content: "Content" }],
      };

      render(<TutorialTab pattern={patternWithSingleSection} />);

      // The section should render
      expect(screen.getByTestId("tutorial-section-0")).toBeInTheDocument();

      // Navigating to quiz (index = 1 which equals sections.length)
      const quizButtons = screen.getAllByText("Take Quiz");
      fireEvent.click(quizButtons[0]);

      await waitFor(() => {
        expect(mockReplaceState).toHaveBeenCalledWith(null, "", "#quiz");
      });
    });
  });

  describe("URL hash navigation on mount", () => {
    it("navigates to section based on slug hash on mount", async () => {
      mockHash = "#minimum-arrows-to-burst-balloons";

      render(<TutorialTab pattern={mockPatternWithTutorial} />);

      await waitFor(() => {
        expect(screen.getByTestId("tutorial-section-4")).toBeInTheDocument();
      });
    });

    it("navigates to section based on numeric hash on mount", async () => {
      mockHash = "#section-2";

      render(<TutorialTab pattern={mockPatternWithTutorial} />);

      await waitFor(() => {
        expect(screen.getByTestId("tutorial-section-2")).toBeInTheDocument();
      });
    });

    it("navigates to quiz based on #quiz hash on mount", async () => {
      mockHash = "#quiz";

      render(<TutorialTab pattern={mockPatternWithTutorial} />);

      await waitFor(() => {
        expect(screen.getByTestId("quiz-card")).toBeInTheDocument();
      });
    });

    it("normalizes numeric hash to slug format", async () => {
      mockHash = "#section-1";

      render(<TutorialTab pattern={mockPatternWithTutorial} />);

      await waitFor(() => {
        expect(mockReplaceState).toHaveBeenCalledWith(
          null,
          "",
          "#merge-overlapping-intervals"
        );
      });
    });

    it("normalizes uppercase slug to lowercase", async () => {
      mockHash = "#MEETING-ROOMS-LINE-SWEEP";

      render(<TutorialTab pattern={mockPatternWithTutorial} />);

      await waitFor(() => {
        expect(mockReplaceState).toHaveBeenCalledWith(
          null,
          "",
          "#meeting-rooms-line-sweep"
        );
      });
    });

    it("does not update hash if already normalized", async () => {
      mockHash = "#insert-interval";

      render(<TutorialTab pattern={mockPatternWithTutorial} />);

      // Wait a bit to ensure no unnecessary replaceState calls
      await new Promise((resolve) => setTimeout(resolve, 100));

      // replaceState should not be called with the same hash
      const calls = mockReplaceState.mock.calls.filter(
        (call) => call[2] === "#insert-interval"
      );
      expect(calls.length).toBe(0);
    });

    it("stays on first section for invalid hash", async () => {
      mockHash = "#non-existent-section";

      render(<TutorialTab pattern={mockPatternWithTutorial} />);

      await waitFor(() => {
        expect(screen.getByTestId("tutorial-section-0")).toBeInTheDocument();
      });
    });

    it("stays on first section for out-of-range numeric hash", async () => {
      mockHash = "#section-99";

      render(<TutorialTab pattern={mockPatternWithTutorial} />);

      await waitFor(() => {
        expect(screen.getByTestId("tutorial-section-0")).toBeInTheDocument();
      });
    });

    it("handles empty hash", async () => {
      mockHash = "";

      render(<TutorialTab pattern={mockPatternWithTutorial} />);

      await waitFor(() => {
        expect(screen.getByTestId("tutorial-section-0")).toBeInTheDocument();
      });
    });

    it("handles hash with only #", async () => {
      mockHash = "#";

      render(<TutorialTab pattern={mockPatternWithTutorial} />);

      await waitFor(() => {
        expect(screen.getByTestId("tutorial-section-0")).toBeInTheDocument();
      });
    });
  });

  describe("hashchange event handling", () => {
    it("responds to hashchange events", async () => {
      render(<TutorialTab pattern={mockPatternWithTutorial} />);

      // Verify first section is shown
      expect(screen.getByTestId("tutorial-section-0")).toBeInTheDocument();

      // Simulate hash change
      mockHash = "#insert-interval";
      act(() => {
        hashChangeListeners.forEach((listener) => listener());
      });

      await waitFor(() => {
        expect(screen.getByTestId("tutorial-section-2")).toBeInTheDocument();
      });
    });

    it("removes hashchange listener on unmount", () => {
      const { unmount } = render(
        <TutorialTab pattern={mockPatternWithTutorial} />
      );

      const initialListenerCount = hashChangeListeners.length;
      unmount();

      // After unmount, the listener should be removed
      expect(hashChangeListeners.length).toBeLessThan(initialListenerCount);
    });
  });

  describe("empty sections handling", () => {
    it("does not set up hash navigation for empty tutorial", () => {
      const patternEmptyTutorial = {
        ...mockPatternWithTutorial,
        tutorial: [],
      };

      render(<TutorialTab pattern={patternEmptyTutorial} />);

      // Should show overview instead
      expect(screen.getByText("Overview")).toBeInTheDocument();
    });
  });

  describe("section navigation with special titles", () => {
    it("handles section with colon in title", async () => {
      render(<TutorialTab pattern={mockPatternWithTutorial} />);

      // Click on "Meeting Rooms: Line Sweep"
      const sectionButtons = screen.getAllByText(/4\. Meeting Rooms/);
      fireEvent.click(sectionButtons[0]);

      await waitFor(() => {
        expect(mockReplaceState).toHaveBeenCalledWith(
          null,
          "",
          "#meeting-rooms-line-sweep"
        );
      });
    });
  });

  describe("onAskAI callback", () => {
    it("passes onAskAI to Highlightable component", () => {
      const mockOnAskAI = vi.fn();
      render(
        <TutorialTab pattern={mockPatternWithTutorial} onAskAI={mockOnAskAI} />
      );

      // Highlightable should be rendered
      expect(screen.getByTestId("highlightable")).toBeInTheDocument();
    });
  });

  describe("course navigation integration", () => {
    it("navigates to next section via course navigation", async () => {
      render(<TutorialTab pattern={mockPatternWithTutorial} />);

      // Find and click the next section link in course navigation
      const nextButton = screen.getByText("Merge Overlapping Intervals");
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByTestId("tutorial-section-1")).toBeInTheDocument();
      });
    });
  });

  describe("sidebar wheel scroll handling", () => {
    it("stops propagation when scrolling down and not at bottom", async () => {
      render(<TutorialTab pattern={mockPatternWithTutorial} />);

      // Find the sidebar container (desktop version)
      const sidebarContainers = document.querySelectorAll(
        ".sticky.top-0.max-h-\\[70vh\\]"
      );

      if (sidebarContainers.length > 0) {
        const sidebar = sidebarContainers[0] as HTMLElement;

        // Mock scroll properties
        Object.defineProperty(sidebar, "scrollTop", { value: 50, writable: true });
        Object.defineProperty(sidebar, "scrollHeight", { value: 500, writable: true });
        Object.defineProperty(sidebar, "clientHeight", { value: 200, writable: true });

        const wheelEvent = new WheelEvent("wheel", {
          deltaY: 10,
          bubbles: true,
          cancelable: true,
        });

        const stopPropagationSpy = vi.spyOn(wheelEvent, "stopPropagation");
        sidebar.dispatchEvent(wheelEvent);

        expect(stopPropagationSpy).toHaveBeenCalled();
      }
    });

    it("stops propagation when scrolling up and not at top", async () => {
      render(<TutorialTab pattern={mockPatternWithTutorial} />);

      const sidebarContainers = document.querySelectorAll(
        ".sticky.top-0.max-h-\\[70vh\\]"
      );

      if (sidebarContainers.length > 0) {
        const sidebar = sidebarContainers[0] as HTMLElement;

        Object.defineProperty(sidebar, "scrollTop", { value: 50, writable: true });
        Object.defineProperty(sidebar, "scrollHeight", { value: 500, writable: true });
        Object.defineProperty(sidebar, "clientHeight", { value: 200, writable: true });

        const wheelEvent = new WheelEvent("wheel", {
          deltaY: -10,
          bubbles: true,
          cancelable: true,
        });

        const stopPropagationSpy = vi.spyOn(wheelEvent, "stopPropagation");
        sidebar.dispatchEvent(wheelEvent);

        expect(stopPropagationSpy).toHaveBeenCalled();
      }
    });

    it("allows parent scroll when at top and scrolling up", async () => {
      render(<TutorialTab pattern={mockPatternWithTutorial} />);

      const sidebarContainers = document.querySelectorAll(
        ".sticky.top-0.max-h-\\[70vh\\]"
      );

      if (sidebarContainers.length > 0) {
        const sidebar = sidebarContainers[0] as HTMLElement;

        // At top of scroll
        Object.defineProperty(sidebar, "scrollTop", { value: 0, writable: true });
        Object.defineProperty(sidebar, "scrollHeight", { value: 500, writable: true });
        Object.defineProperty(sidebar, "clientHeight", { value: 200, writable: true });

        const wheelEvent = new WheelEvent("wheel", {
          deltaY: -10,
          bubbles: true,
          cancelable: true,
        });

        const stopPropagationSpy = vi.spyOn(wheelEvent, "stopPropagation");
        sidebar.dispatchEvent(wheelEvent);

        // Should not stop propagation when at top and scrolling up
        expect(stopPropagationSpy).not.toHaveBeenCalled();
      }
    });

    it("allows parent scroll when at bottom and scrolling down", async () => {
      render(<TutorialTab pattern={mockPatternWithTutorial} />);

      const sidebarContainers = document.querySelectorAll(
        ".sticky.top-0.max-h-\\[70vh\\]"
      );

      if (sidebarContainers.length > 0) {
        const sidebar = sidebarContainers[0] as HTMLElement;

        // At bottom of scroll (scrollTop + clientHeight >= scrollHeight - 1)
        Object.defineProperty(sidebar, "scrollTop", { value: 300, writable: true });
        Object.defineProperty(sidebar, "scrollHeight", { value: 500, writable: true });
        Object.defineProperty(sidebar, "clientHeight", { value: 200, writable: true });

        const wheelEvent = new WheelEvent("wheel", {
          deltaY: 10,
          bubbles: true,
          cancelable: true,
        });

        const stopPropagationSpy = vi.spyOn(wheelEvent, "stopPropagation");
        sidebar.dispatchEvent(wheelEvent);

        // Should not stop propagation when at bottom and scrolling down
        expect(stopPropagationSpy).not.toHaveBeenCalled();
      }
    });

    it("handles wheel event with zero deltaY", async () => {
      render(<TutorialTab pattern={mockPatternWithTutorial} />);

      const sidebarContainers = document.querySelectorAll(
        ".sticky.top-0.max-h-\\[70vh\\]"
      );

      if (sidebarContainers.length > 0) {
        const sidebar = sidebarContainers[0] as HTMLElement;

        Object.defineProperty(sidebar, "scrollTop", { value: 50, writable: true });
        Object.defineProperty(sidebar, "scrollHeight", { value: 500, writable: true });
        Object.defineProperty(sidebar, "clientHeight", { value: 200, writable: true });

        const wheelEvent = new WheelEvent("wheel", {
          deltaY: 0,
          bubbles: true,
          cancelable: true,
        });

        const stopPropagationSpy = vi.spyOn(wheelEvent, "stopPropagation");
        sidebar.dispatchEvent(wheelEvent);

        // Should stop propagation for edge case
        expect(stopPropagationSpy).toHaveBeenCalled();
      }
    });
  });
});
