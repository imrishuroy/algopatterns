import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  act,
  cleanup,
} from "@testing-library/react";
import type { ReactNode, Ref, ComponentType } from "react";

vi.mock("framer-motion", async () => {
  const { createElement, Fragment, forwardRef } = await import("react");
  const motionTag = (tag: string) =>
    forwardRef(
      (
        {
          children,
          ...props
        }: { children?: ReactNode; [key: string]: unknown },
        ref: Ref<unknown>
      ) => createElement(tag, { ...props, ref }, children)
    );
  return {
    motion: {
      div: motionTag("div"),
      span: motionTag("span"),
      p: motionTag("p"),
      h1: motionTag("h1"),
      h2: motionTag("h2"),
      h3: motionTag("h3"),
      h4: motionTag("h4"),
      button: motionTag("button"),
      circle: motionTag("circle"),
      rect: motionTag("rect"),
      svg: motionTag("svg"),
      line: motionTag("line"),
      g: motionTag("g"),
      text: motionTag("text"),
    },
    AnimatePresence: ({ children }: { children?: ReactNode }) =>
      createElement(Fragment, null, children),
  };
});

vi.mock("react-syntax-highlighter", () => ({
  Prism: ({ children }: { children?: ReactNode }) => (
    <code data-testid="syntax-hl">{children}</code>
  ),
}));

vi.mock("react-syntax-highlighter/dist/esm/styles/prism", () => ({
  oneDark: {},
}));

vi.mock("@/components/ui/CodeBlock", () => ({
  default: ({ code }: { code: string }) => (
    <pre data-testid="code-block">{code}</pre>
  ),
}));

import TwoSumVisualizer from "@/components/visualizers/TwoSumVisualizer";
import BinarySearchVisualizer from "@/components/visualizers/BinarySearchVisualizer";
import MergeIntervalsVisualizer from "@/components/visualizers/MergeIntervalsVisualizer";
import DPTableVisualizer from "@/components/visualizers/DPTableVisualizer";
import StepByStepExecutor from "@/components/visualizers/StepByStepExecutor";
import TrieInsertVisualizer from "@/components/visualizers/TrieInsertVisualizer";
import LinkedListReversalVisualizer from "@/components/visualizers/LinkedListReversalVisualizer";
import GridBFSVisualizer from "@/components/visualizers/GridBFSVisualizer";

beforeEach(() => {
  cleanup();
  vi.useRealTimers();
});

// Section 1: Shared behavior tests (test common UI pattern)
describe("Shared visualizer UI pattern", () => {
  it("TwoSumVisualizer renders title heading", () => {
    render(<TwoSumVisualizer />);
    expect(screen.getByText("Two Sum: Complement Lookup")).toBeInTheDocument();
  });

  it("TwoSumVisualizer renders Play button", () => {
    render(<TwoSumVisualizer />);
    expect(screen.getByText("Play")).toBeInTheDocument();
  });

  it("TwoSumVisualizer renders Reset button", () => {
    render(<TwoSumVisualizer />);
    expect(screen.getByText("Reset")).toBeInTheDocument();
  });

  it("TwoSumVisualizer renders speed slider", () => {
    render(<TwoSumVisualizer />);
    const slider = document.querySelector('input[type="range"]');
    expect(slider).toBeInTheDocument();
  });

  it("TwoSumVisualizer Play toggles to Pause on click", () => {
    render(<TwoSumVisualizer />);
    const btn = screen.getByText("Play");
    fireEvent.click(btn);
    expect(screen.getByText("Pause")).toBeInTheDocument();
  });

  it("TwoSumVisualizer Reset button resets state from playing", () => {
    render(<TwoSumVisualizer />);
    fireEvent.click(screen.getByText("Play"));
    expect(screen.getByText("Pause")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Reset"));
    expect(screen.getByText("Play")).toBeInTheDocument();
  });

  it("TwoSumVisualizer renders visualization area with array", () => {
    const { container } = render(<TwoSumVisualizer />);
    expect(container.textContent).toContain("nums =");
  });

  it("TwoSumVisualizer renders initial step message", () => {
    render(<TwoSumVisualizer />);
    expect(
      screen.getByText("Click Play to find two numbers that sum to target")
    ).toBeInTheDocument();
  });

  it("BinarySearchVisualizer shares common Play/Reset/Slider pattern", () => {
    render(<BinarySearchVisualizer />);
    expect(screen.getByText("Play")).toBeInTheDocument();
    expect(screen.getByText("Reset")).toBeInTheDocument();
    expect(document.querySelector('input[type="range"]')).toBeInTheDocument();
    expect(screen.getByText("Binary Search")).toBeInTheDocument();
  });

  it("MergeIntervalsVisualizer shares common Play/Reset/Slider pattern", () => {
    render(<MergeIntervalsVisualizer />);
    expect(screen.getByText("Play")).toBeInTheDocument();
    expect(screen.getByText("Reset")).toBeInTheDocument();
    expect(document.querySelector('input[type="range"]')).toBeInTheDocument();
  });

  it("LinkedListReversalVisualizer renders heading", () => {
    render(<LinkedListReversalVisualizer />);
    expect(screen.getByText("Reverse Linked List")).toBeInTheDocument();
  });

  it("GridBFSVisualizer renders heading", () => {
    render(<GridBFSVisualizer />);
    expect(
      screen.getByText("Grid Traversal: Number of Islands")
    ).toBeInTheDocument();
  });

  it("DPTableVisualizer renders Play button", () => {
    render(<DPTableVisualizer />);
    expect(screen.getByText("Play")).toBeInTheDocument();
    expect(screen.getByText("Reset")).toBeInTheDocument();
    expect(document.querySelector('input[type="range"]')).toBeInTheDocument();
  });

  it("TrieInsertVisualizer renders heading and Play button", () => {
    render(<TrieInsertVisualizer />);
    expect(screen.getByText("Trie Insert")).toBeInTheDocument();
    expect(screen.getByText("Play")).toBeInTheDocument();
  });

  it("StepByStepExecutor renders heading and navigation", () => {
    render(<StepByStepExecutor />);
    expect(screen.getByText("Step-by-Step Execution")).toBeInTheDocument();
    expect(screen.getByText("Prev")).toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();
    expect(screen.getByText("Reset")).toBeInTheDocument();
  });
});

// Section 2: Thorough tests for 8 key visualizers

// 2a. TwoSumVisualizer
describe("TwoSumVisualizer", () => {
  it("renders target value 9", () => {
    render(<TwoSumVisualizer />);
    const matches = screen.getAllByText("9");
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it("shows complement display after playing", () => {
    vi.useFakeTimers();
    render(<TwoSumVisualizer />);
    fireEvent.click(screen.getByText("Play"));
    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(screen.getByText("Looking for:")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("shows hash map entries after enough steps", () => {
    vi.useFakeTimers();
    render(<TwoSumVisualizer />);
    fireEvent.click(screen.getByText("Play"));
    act(() => {
      vi.advanceTimersByTime(800);
    });
    act(() => {
      vi.advanceTimersByTime(800);
    });
    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(document.body.textContent).toContain("2");
    vi.useRealTimers();
  });

  it("reaches found state when pair exists", () => {
    vi.useFakeTimers();
    render(<TwoSumVisualizer />);
    fireEvent.click(screen.getByText("Play"));
    for (let i = 0; i < 4; i++) {
      act(() => {
        vi.advanceTimersByTime(800);
      });
    }
    expect(document.body.textContent).toContain("Found");
    expect(screen.getByText("Play").closest("button")).toBeDisabled();
    vi.useRealTimers();
  });

  it("reset clears hash map and restarts", () => {
    vi.useFakeTimers();
    render(<TwoSumVisualizer />);
    fireEvent.click(screen.getByText("Play"));
    act(() => {
      vi.advanceTimersByTime(800);
    });
    fireEvent.click(screen.getByText("Reset"));
    expect(screen.getByText("Play")).toBeInTheDocument();
    expect(
      screen.getByText("Click Play to find two numbers that sum to target")
    ).toBeInTheDocument();
    vi.useRealTimers();
  });
});

// 2b. BinarySearchVisualizer
describe("BinarySearchVisualizer", () => {
  it("renders the sorted array", () => {
    const { container } = render(<BinarySearchVisualizer />);
    expect(container.textContent).toMatch(/1.*3.*5.*7.*9.*11/);
  });

  it("renders target value 11", () => {
    render(<BinarySearchVisualizer />);
    expect(screen.getAllByText("11").length).toBeGreaterThanOrEqual(1);
  });

  it("shows L/M/R pointers after playing", () => {
    vi.useFakeTimers();
    render(<BinarySearchVisualizer />);
    fireEvent.click(screen.getByText("Play"));
    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(screen.getByText("L")).toBeInTheDocument();
    expect(screen.getByText("M")).toBeInTheDocument();
    expect(screen.getByText("R")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("reaches found state when target exists", () => {
    vi.useFakeTimers();
    render(<BinarySearchVisualizer />);
    fireEvent.click(screen.getByText("Play"));
    for (let i = 0; i < 4; i++) {
      act(() => {
        vi.advanceTimersByTime(800);
      });
    }
    expect(screen.getByText(/Found 11 at index/)).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("reset restores initial message", () => {
    vi.useFakeTimers();
    render(<BinarySearchVisualizer />);
    fireEvent.click(screen.getByText("Play"));
    act(() => {
      vi.advanceTimersByTime(800);
    });
    fireEvent.click(screen.getByText("Reset"));
    expect(screen.getByText("Play")).toBeInTheDocument();
    expect(screen.getByText(/Click Play to search/)).toBeInTheDocument();
    vi.useRealTimers();
  });
});

// 2c. MergeIntervalsVisualizer
describe("MergeIntervalsVisualizer", () => {
  it("renders input intervals placeholder", () => {
    render(<MergeIntervalsVisualizer />);
    expect(
      screen.getByText("Input Intervals (on timeline):")
    ).toBeInTheDocument();
  });

  it("renders merged result placeholder", () => {
    render(<MergeIntervalsVisualizer />);
    expect(screen.getByText("Merged Result:")).toBeInTheDocument();
  });

  it("shows stats grid", () => {
    render(<MergeIntervalsVisualizer />);
    expect(screen.getByText("Input Count")).toBeInTheDocument();
    expect(screen.getByText("Result Count")).toBeInTheDocument();
    expect(screen.getByText("Processed")).toBeInTheDocument();
  });

  it("progresses through sort and merge phases", () => {
    vi.useFakeTimers();
    render(<MergeIntervalsVisualizer />);
    fireEvent.click(screen.getByText("Play"));
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(document.body.textContent).toContain("Step 1");
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(document.body.textContent).toContain("Sorted");
    vi.useRealTimers();
  });

  it("reaches done state", () => {
    vi.useFakeTimers();
    render(<MergeIntervalsVisualizer />);
    fireEvent.click(screen.getByText("Play"));
    for (let i = 0; i < 7; i++) {
      act(() => {
        vi.advanceTimersByTime(1000);
      });
    }
    expect(screen.getByText(/Done/)).toBeInTheDocument();
    vi.useRealTimers();
  });
});

// 2d. DPTableVisualizer
describe("DPTableVisualizer", () => {
  it("renders title", () => {
    render(<DPTableVisualizer />);
    expect(screen.getByText("2D DP Table Visualizer")).toBeInTheDocument();
  });

  it("renders problem selector buttons", () => {
    render(<DPTableVisualizer />);
    expect(screen.getByText("Longest Common Subsequence")).toBeInTheDocument();
    expect(screen.getByText("Edit Distance")).toBeInTheDocument();
    expect(screen.getByText("Unique Paths")).toBeInTheDocument();
  });

  it("renders Step progression button", () => {
    render(<DPTableVisualizer />);
    expect(screen.getByText("Step")).toBeInTheDocument();
  });

  it("renders step counter", () => {
    render(<DPTableVisualizer />);
    expect(document.body.textContent).toMatch(/Step 0\//);
  });

  it("advances step on Step button click", () => {
    render(<DPTableVisualizer />);
    fireEvent.click(screen.getByText("Step"));
    expect(document.body.textContent).toMatch(/Step 1\//);
  });

  it("switches to Edit Distance problem", () => {
    render(<DPTableVisualizer />);
    fireEvent.click(screen.getByText("Edit Distance"));
    expect(screen.getByText('s1 = "CAT"')).toBeInTheDocument();
    expect(screen.getByText('s2 = "CUT"')).toBeInTheDocument();
  });

  it("switches to Unique Paths problem", () => {
    render(<DPTableVisualizer />);
    fireEvent.click(screen.getByText("Unique Paths"));
    expect(
      screen.getByText("Count paths from top-left to bottom-right")
    ).toBeInTheDocument();
  });

  it("highlights cells as step advances", () => {
    render(<DPTableVisualizer />);
    const btn = screen.getByText("Step");
    for (let i = 0; i < 5; i++) {
      fireEvent.click(btn);
    }
    expect(document.body.textContent).toMatch(/Step 5\//);
  });

  it("reset clears all steps", () => {
    render(<DPTableVisualizer />);
    fireEvent.click(screen.getByText("Step"));
    fireEvent.click(screen.getByText("Reset"));
    expect(document.body.textContent).toMatch(/Step 0\//);
  });
});

// 2e. StepByStepExecutor
describe("StepByStepExecutor", () => {
  it("renders code window", () => {
    render(<StepByStepExecutor />);
    expect(screen.getByText("Java")).toBeInTheDocument();
  });

  it("renders explanation panel", () => {
    render(<StepByStepExecutor />);
    expect(screen.getByText("Explanation")).toBeInTheDocument();
  });

  it("renders variables panel", () => {
    render(<StepByStepExecutor />);
    expect(screen.getByText("Variables")).toBeInTheDocument();
  });

  it("renders call stack panel", () => {
    render(<StepByStepExecutor />);
    expect(screen.getByText(/Call Stack/)).toBeInTheDocument();
  });

  it("starts with step 1 of 15", () => {
    render(<StepByStepExecutor />);
    expect(document.body.textContent).toMatch(/Step 1 of 15/);
  });

  it("Next button advances step", () => {
    render(<StepByStepExecutor />);
    expect(document.body.textContent).toMatch(/Step 1 of 15/);
    fireEvent.click(screen.getByText("Next"));
    expect(document.body.textContent).toMatch(/Step 2 of 15/);
  });

  it("Prev button goes back", () => {
    render(<StepByStepExecutor />);
    fireEvent.click(screen.getByText("Next"));
    fireEvent.click(screen.getByText("Next"));
    expect(document.body.textContent).toMatch(/Step 3 of 15/);
    fireEvent.click(screen.getByText("Prev"));
    expect(document.body.textContent).toMatch(/Step 2 of 15/);
  });

  it("Prev is disabled at first step", () => {
    render(<StepByStepExecutor />);
    expect(screen.getByText("Prev")).toBeDisabled();
  });

  it("Next is disabled at last step", () => {
    render(<StepByStepExecutor />);
    const next = screen.getByText("Next");
    for (let i = 0; i < 20; i++) {
      if (next.hasAttribute("disabled")) break;
      fireEvent.click(next);
    }
    expect(next).toBeDisabled();
  });

  it("Reset returns to step 1", () => {
    render(<StepByStepExecutor />);
    fireEvent.click(screen.getByText("Next"));
    fireEvent.click(screen.getByText("Next"));
    fireEvent.click(screen.getByText("Reset"));
    expect(document.body.textContent).toMatch(/Step 1 of 15/);
  });

  it("switches to Fibonacci example", () => {
    render(<StepByStepExecutor />);
    fireEvent.click(screen.getByText("Fibonacci"));
    expect(document.body.textContent).toContain("fib(4)");
  });

  it("switches to Reverse String example", () => {
    render(<StepByStepExecutor />);
    fireEvent.click(screen.getByText("Reverse String"));
    expect(document.body.textContent).toContain('reverse("hello")');
  });

  it("shows outputs after advancing past steps with output", () => {
    render(<StepByStepExecutor />);
    const next = screen.getByText("Next");
    for (let i = 0; i < 11; i++) {
      fireEvent.click(next);
    }
    expect(screen.getByText("Returns")).toBeInTheDocument();
  });
});

// 2f. TrieInsertVisualizer
describe("TrieInsertVisualizer", () => {
  it("renders SVG visualization area", () => {
    const { container } = render(<TrieInsertVisualizer />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders words to insert", () => {
    render(<TrieInsertVisualizer />);
    expect(screen.getByText("cat")).toBeInTheDocument();
    expect(screen.getByText("car")).toBeInTheDocument();
    expect(screen.getByText("card")).toBeInTheDocument();
  });

  it("renders legend", () => {
    render(<TrieInsertVisualizer />);
    expect(screen.getByText("Current")).toBeInTheDocument();
    expect(screen.getByText("Path")).toBeInTheDocument();
    expect(screen.getByText("isEnd")).toBeInTheDocument();
  });

  it("shows insertion progress after playing", () => {
    vi.useFakeTimers();
    render(<TrieInsertVisualizer />);
    fireEvent.click(screen.getByText("Play"));
    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(document.body.textContent).toMatch(/Inserting "cat"/);
    vi.useRealTimers();
  });

  it("inserts characters one by one", () => {
    vi.useFakeTimers();
    render(<TrieInsertVisualizer />);
    fireEvent.click(screen.getByText("Play"));
    // First timer: init → inserting, charIndex=0, message="Inserting cat"
    act(() => {
      vi.advanceTimersByTime(800);
    });
    // Second timer: inserting, charIndex=0 < len, process char 'c', create node
    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(document.body.textContent).toContain("Create node 'c'");
    vi.useRealTimers();
  });

  it("inserts subsequent characters", () => {
    vi.useFakeTimers();
    render(<TrieInsertVisualizer />);
    fireEvent.click(screen.getByText("Play"));
    // Timer 0: init → inserting
    act(() => {
      vi.advanceTimersByTime(800);
    });
    // Timer 1: process char 'c'
    act(() => {
      vi.advanceTimersByTime(800);
    });
    // Timer 2: process char 'a'
    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(document.body.textContent).toContain("Create node 'a'");
    vi.useRealTimers();
  });

  it("reaches done state after inserting all words", () => {
    vi.useFakeTimers();
    render(<TrieInsertVisualizer />);
    fireEvent.click(screen.getByText("Play"));
    for (let i = 0; i < 25; i++) {
      act(() => {
        vi.advanceTimersByTime(800);
      });
    }
    expect(document.body.textContent).toContain("Done");
    vi.useRealTimers();
  });
});

// 2g. LinkedListReversalVisualizer
describe("LinkedListReversalVisualizer", () => {
  it("renders all nodes", () => {
    render(<LinkedListReversalVisualizer />);
    expect(screen.getAllByText("1").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("2").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("3").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("4").length).toBeGreaterThanOrEqual(1);
  });

  it("renders the four step labels", () => {
    render(<LinkedListReversalVisualizer />);
    expect(screen.getByText("1. next = curr.next")).toBeInTheDocument();
    expect(screen.getByText("2. curr.next = prev")).toBeInTheDocument();
    expect(screen.getByText("3. prev = curr")).toBeInTheDocument();
    expect(screen.getByText("4. curr = next")).toBeInTheDocument();
  });

  it("renders pointer status boxes", () => {
    render(<LinkedListReversalVisualizer />);
    expect(screen.getAllByText("prev").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("curr").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("next").length).toBeGreaterThanOrEqual(1);
  });

  it("shows null at start for prev pointer", () => {
    render(<LinkedListReversalVisualizer />);
    const nulls = screen.getAllByText("null");
    expect(nulls.length).toBeGreaterThanOrEqual(2);
  });

  it("updates pointers after playing", () => {
    vi.useFakeTimers();
    render(<LinkedListReversalVisualizer />);
    fireEvent.click(screen.getByText("Play"));
    // Timer 0: init → save-next
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    // Timer 1: save-next → reverse-link + set message to "Step 1: Save next = node 2"
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(document.body.textContent).toMatch(/Step 1: Save next/);
    vi.useRealTimers();
  });

  it("progresses through reversal steps", () => {
    vi.useFakeTimers();
    render(<LinkedListReversalVisualizer />);
    fireEvent.click(screen.getByText("Play"));
    // Timer 0: init → save-next
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    // Timer 1: save-next → reverse-link (sets Step 1)
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    // Timer 2: reverse-link → move-prev (sets Step 2)
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(document.body.textContent).toMatch(/Step 2: Reverse link/);
    vi.useRealTimers();
  });

  it("reaches done state after full reversal", () => {
    vi.useFakeTimers();
    render(<LinkedListReversalVisualizer />);
    fireEvent.click(screen.getByText("Play"));
    for (let i = 0; i < 20; i++) {
      act(() => {
        vi.advanceTimersByTime(1000);
      });
    }
    expect(screen.getByText(/Done/)).toBeInTheDocument();
    vi.useRealTimers();
  });
});

// 2h. GridBFSVisualizer
describe("GridBFSVisualizer", () => {
  it("renders heading", () => {
    render(<GridBFSVisualizer />);
    expect(
      screen.getByText("Grid Traversal: Number of Islands")
    ).toBeInTheDocument();
  });

  it("renders mode toggle buttons", () => {
    render(<GridBFSVisualizer />);
    expect(screen.getByText("BFS (Queue)")).toBeInTheDocument();
    expect(screen.getByText("DFS (Stack)")).toBeInTheDocument();
  });

  it("renders legend", () => {
    render(<GridBFSVisualizer />);
    expect(screen.getByText("Unvisited Land")).toBeInTheDocument();
    expect(screen.getByText("Currently Exploring")).toBeInTheDocument();
    expect(screen.getByText("Visited (Island)")).toBeInTheDocument();
    expect(screen.getByText("Water")).toBeInTheDocument();
  });

  it("switches to DFS mode", () => {
    render(<GridBFSVisualizer />);
    fireEvent.click(screen.getByText("DFS (Stack)"));
    expect(screen.getByText("DFS (Stack)").closest("button")).toHaveClass(
      "bg-purple-500"
    );
  });

  it("renders islands counter", () => {
    render(<GridBFSVisualizer />);
    expect(screen.getByText("Islands Found")).toBeInTheDocument();
  });

  it("renders queue/stack display", () => {
    render(<GridBFSVisualizer />);
    expect(
      screen.getByText(/Queue \(FIFO\)|Stack \(LIFO\)/)
    ).toBeInTheDocument();
  });

  it("shows Empty queue initially", () => {
    render(<GridBFSVisualizer />);
    expect(screen.getByText("Empty")).toBeInTheDocument();
  });

  it("message updates after playing", () => {
    vi.useFakeTimers();
    render(<GridBFSVisualizer />);
    fireEvent.click(screen.getByText("Play"));
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(document.body.textContent).toMatch(/Found new island|Exploring/);
    vi.useRealTimers();
  });

  it("runs BFS exploration", () => {
    vi.useFakeTimers();
    render(<GridBFSVisualizer />);
    fireEvent.click(screen.getByText("Play"));
    for (let i = 0; i < 30; i++) {
      act(() => {
        vi.advanceTimersByTime(300);
      });
    }
    const body = document.body.textContent || "";
    expect(body.includes("islands") || body.includes("Exploring")).toBe(true);
    vi.useRealTimers();
  });
});

// Section 3: Smoke tests for ALL 57 visualizers
type VisualizerModule = { default: ComponentType<Record<string, unknown>> };

const VISUALIZER_PATHS = [
  "ActivitySelectionVisualizer",
  "AnagramGroupVisualizer",
  "BinarySearchVisualizer",
  "BSTValidationVisualizer",
  "CallStackVisualizer",
  "ConnectedComponentsVisualizer",
  "ConsecutiveSequenceVisualizer",
  "ContainerWaterVisualizer",
  "CycleDetectionVisualizer",
  "DijkstraVisualizer",
  "DPComparisonVisualizer",
  "DPTableVisualizer",
  "DPTransformationVisualizer",
  "DPTreeVisualizer",
  "FindAnagramsVisualizer",
  "FixedWindowVisualizer",
  "GridBFSVisualizer",
  "IntervalIntersectionVisualizer",
  "JumpGameVisualizer",
  "KadaneVisualizer",
  "KnapsackVisualizer",
  "KokoEatingVisualizer",
  "KthLargestVisualizer",
  "LargestRectangleVisualizer",
  "LevelOrderVisualizer",
  "LinkedListReversalVisualizer",
  "LongestSubstringVisualizer",
  "MedianFinderVisualizer",
  "MeetingRoomsVisualizer",
  "MemoryVisualizer",
  "MergeIntervalsVisualizer",
  "MergeKListsVisualizer",
  "NextGreaterVisualizer",
  "NQueensVisualizer",
  "PermutationsVisualizer",
  "PrefixSumArrayVisualizer",
  "PrefixSumVisualizer",
  "ProductExceptSelfVisualizer",
  "RecurrenceBuilderVisualizer",
  "RecursionTreeVisualizer",
  "RecursionTypesVisualizer",
  "RecursionVsIterationVisualizer",
  "RemoveDuplicatesVisualizer",
  "ReorderListVisualizer",
  "RotatedArrayVisualizer",
  "StepByStepExecutor",
  "SubarraySumKVisualizer",
  "SubsetsVisualizer",
  "TopologicalSortVisualizer",
  "TreeTraversalVisualizer",
  "TrieInsertVisualizer",
  "TrieSearchVisualizer",
  "TwoSumHashMapVisualizer",
  "TwoSumSortedVisualizer",
  "TwoSumVisualizer",
  "UnionFindVisualizer",
  "ValidParenthesesVisualizer",
];

describe.each(VISUALIZER_PATHS)("Smoke test: %s", (name) => {
  it("renders without crashing and has interactive elements", async () => {
    const mod = (await import(
      `@/components/visualizers/${name}.tsx`
    )) as VisualizerModule;
    const Component = mod.default;
    const { container } = render(<Component />);
    expect(container.firstElementChild).toBeTruthy();
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThanOrEqual(1);

    // Some visualizers (like RecursionTypesVisualizer) only have tab buttons,
    // most have Play/Reset, and StepByStepExecutor has Prev/Next/Reset.
    const hasControl = Array.from(buttons).some(
      (b) =>
        b.textContent === "Play" ||
        b.textContent === "Reset" ||
        b.textContent === "Next" ||
        b.textContent === "Prev" ||
        b.textContent === "Step" ||
        b.textContent?.includes("BFS") ||
        b.textContent?.includes("DFS") ||
        b.textContent === "Factorial" ||
        b.textContent === "Fibonacci" ||
        b.textContent === "Reverse String" ||
        b.textContent === "Direct Recursion" ||
        b.textContent === "Indirect Recursion"
    );
    expect(hasControl).toBe(true);
  });
});
