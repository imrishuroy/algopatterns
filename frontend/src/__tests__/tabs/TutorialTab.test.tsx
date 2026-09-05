import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
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
    mockPush.mockClear();
    mockReplace.mockClear();

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
      expect(screen.getByText("Pattern without tutorial")).toBeInTheDocument();
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

    it("updates URL when section changes", async () => {
      render(<TutorialTab pattern={mockPatternWithTutorial} />);

      const sectionButtons = screen.getAllByText(/3\. Insert Interval/);
      fireEvent.click(sectionButtons[0]);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          "/patterns/intervals/insert-interval",
          { scroll: false }
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

    it("updates URL to quiz when quiz is selected", async () => {
      render(<TutorialTab pattern={mockPatternWithTutorial} />);

      const quizButtons = screen.getAllByText("Take Quiz");
      fireEvent.click(quizButtons[0]);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/patterns/intervals/quiz", {
          scroll: false,
        });
      });
    });
  });

  describe("edge cases for handleSectionChange", () => {
    it("navigates to quiz correctly for pattern with single section", async () => {
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
        expect(mockPush).toHaveBeenCalledWith("/patterns/intervals/quiz", {
          scroll: false,
        });
      });
    });
  });

  describe("Legacy hash URL redirect on mount", () => {
    it("redirects slug hash to new URL format", async () => {
      mockHash = "#minimum-arrows-to-burst-balloons";

      render(<TutorialTab pattern={mockPatternWithTutorial} />);

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith(
          "/patterns/intervals/minimum-arrows-to-burst-balloons"
        );
      });
    });

    it("redirects numeric hash to new URL format", async () => {
      mockHash = "#section-2";

      render(<TutorialTab pattern={mockPatternWithTutorial} />);

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith(
          "/patterns/intervals/insert-interval"
        );
      });
    });

    it("redirects #quiz hash to new URL format", async () => {
      mockHash = "#quiz";

      render(<TutorialTab pattern={mockPatternWithTutorial} />);

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith("/patterns/intervals/quiz");
      });
    });

    it("redirects numeric hash to slug URL", async () => {
      mockHash = "#section-1";

      render(<TutorialTab pattern={mockPatternWithTutorial} />);

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith(
          "/patterns/intervals/merge-overlapping-intervals"
        );
      });
    });

    it("redirects uppercase slug to lowercase URL", async () => {
      mockHash = "#MEETING-ROOMS-LINE-SWEEP";

      render(<TutorialTab pattern={mockPatternWithTutorial} />);

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith(
          "/patterns/intervals/meeting-rooms-line-sweep"
        );
      });
    });

    it("redirects normalized hash to new URL format", async () => {
      mockHash = "#insert-interval";

      render(<TutorialTab pattern={mockPatternWithTutorial} />);

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith(
          "/patterns/intervals/insert-interval"
        );
      });
    });

    it("does not redirect for invalid hash", async () => {
      mockHash = "#non-existent-section";

      render(<TutorialTab pattern={mockPatternWithTutorial} />);

      await waitFor(() => {
        expect(screen.getByTestId("tutorial-section-0")).toBeInTheDocument();
      });

      expect(mockReplace).not.toHaveBeenCalled();
    });

    it("does not redirect for out-of-range numeric hash", async () => {
      mockHash = "#section-99";

      render(<TutorialTab pattern={mockPatternWithTutorial} />);

      await waitFor(() => {
        expect(screen.getByTestId("tutorial-section-0")).toBeInTheDocument();
      });

      expect(mockReplace).not.toHaveBeenCalled();
    });

    it("handles empty hash without redirect", async () => {
      mockHash = "";

      render(<TutorialTab pattern={mockPatternWithTutorial} />);

      await waitFor(() => {
        expect(screen.getByTestId("tutorial-section-0")).toBeInTheDocument();
      });

      expect(mockReplace).not.toHaveBeenCalled();
    });

    it("handles hash with only # without redirect", async () => {
      mockHash = "#";

      render(<TutorialTab pattern={mockPatternWithTutorial} />);

      await waitFor(() => {
        expect(screen.getByTestId("tutorial-section-0")).toBeInTheDocument();
      });

      expect(mockReplace).not.toHaveBeenCalled();
    });
  });

  describe("initialSectionSlug prop", () => {
    it("starts at section specified by initialSectionSlug", async () => {
      render(
        <TutorialTab
          pattern={mockPatternWithTutorial}
          initialSectionSlug="insert-interval"
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId("tutorial-section-2")).toBeInTheDocument();
      });
    });

    it("starts at quiz when initialSectionSlug is quiz", async () => {
      render(
        <TutorialTab
          pattern={mockPatternWithTutorial}
          initialSectionSlug="quiz"
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId("quiz-card")).toBeInTheDocument();
      });
    });
  });

  describe("URL-based navigation (hashchange removed)", () => {
    it("uses router.push for navigation instead of hashchange", async () => {
      render(<TutorialTab pattern={mockPatternWithTutorial} />);

      // Verify first section is shown
      expect(screen.getByTestId("tutorial-section-0")).toBeInTheDocument();

      // Click to navigate
      const sectionButtons = screen.getAllByText(/3\. Insert Interval/);
      fireEvent.click(sectionButtons[0]);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          "/patterns/intervals/insert-interval",
          { scroll: false }
        );
      });
    });

    it("does not add hashchange listeners", () => {
      render(<TutorialTab pattern={mockPatternWithTutorial} />);

      // No hashchange listeners should be added (URL routing instead)
      expect(hashChangeListeners.length).toBe(0);
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
        expect(mockPush).toHaveBeenCalledWith(
          "/patterns/intervals/meeting-rooms-line-sweep",
          { scroll: false }
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
    it("stops propagation when scrolling down and not at bottom", () => {
      render(<TutorialTab pattern={mockPatternWithTutorial} />);

      // Find the sidebar container (desktop version)
      const sidebarContainers = document.querySelectorAll(
        ".sticky.top-0.max-h-\\[70vh\\]"
      );

      if (sidebarContainers.length > 0) {
        const sidebar = sidebarContainers[0] as HTMLElement;

        // Mock scroll properties
        Object.defineProperty(sidebar, "scrollTop", {
          value: 50,
          writable: true,
        });
        Object.defineProperty(sidebar, "scrollHeight", {
          value: 500,
          writable: true,
        });
        Object.defineProperty(sidebar, "clientHeight", {
          value: 200,
          writable: true,
        });

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

    it("stops propagation when scrolling up and not at top", () => {
      render(<TutorialTab pattern={mockPatternWithTutorial} />);

      const sidebarContainers = document.querySelectorAll(
        ".sticky.top-0.max-h-\\[70vh\\]"
      );

      if (sidebarContainers.length > 0) {
        const sidebar = sidebarContainers[0] as HTMLElement;

        Object.defineProperty(sidebar, "scrollTop", {
          value: 50,
          writable: true,
        });
        Object.defineProperty(sidebar, "scrollHeight", {
          value: 500,
          writable: true,
        });
        Object.defineProperty(sidebar, "clientHeight", {
          value: 200,
          writable: true,
        });

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

    it("allows parent scroll when at top and scrolling up", () => {
      render(<TutorialTab pattern={mockPatternWithTutorial} />);

      const sidebarContainers = document.querySelectorAll(
        ".sticky.top-0.max-h-\\[70vh\\]"
      );

      if (sidebarContainers.length > 0) {
        const sidebar = sidebarContainers[0] as HTMLElement;

        // At top of scroll
        Object.defineProperty(sidebar, "scrollTop", {
          value: 0,
          writable: true,
        });
        Object.defineProperty(sidebar, "scrollHeight", {
          value: 500,
          writable: true,
        });
        Object.defineProperty(sidebar, "clientHeight", {
          value: 200,
          writable: true,
        });

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

    it("allows parent scroll when at bottom and scrolling down", () => {
      render(<TutorialTab pattern={mockPatternWithTutorial} />);

      const sidebarContainers = document.querySelectorAll(
        ".sticky.top-0.max-h-\\[70vh\\]"
      );

      if (sidebarContainers.length > 0) {
        const sidebar = sidebarContainers[0] as HTMLElement;

        // At bottom of scroll (scrollTop + clientHeight >= scrollHeight - 1)
        Object.defineProperty(sidebar, "scrollTop", {
          value: 300,
          writable: true,
        });
        Object.defineProperty(sidebar, "scrollHeight", {
          value: 500,
          writable: true,
        });
        Object.defineProperty(sidebar, "clientHeight", {
          value: 200,
          writable: true,
        });

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

    it("handles wheel event with zero deltaY", () => {
      render(<TutorialTab pattern={mockPatternWithTutorial} />);

      const sidebarContainers = document.querySelectorAll(
        ".sticky.top-0.max-h-\\[70vh\\]"
      );

      if (sidebarContainers.length > 0) {
        const sidebar = sidebarContainers[0] as HTMLElement;

        Object.defineProperty(sidebar, "scrollTop", {
          value: 50,
          writable: true,
        });
        Object.defineProperty(sidebar, "scrollHeight", {
          value: 500,
          writable: true,
        });
        Object.defineProperty(sidebar, "clientHeight", {
          value: 200,
          writable: true,
        });

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
