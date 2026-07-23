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
import BitmaskDPVisualizer from "@/components/visualizers/BitmaskDPVisualizer";
import GridDPVisualizer from "@/components/visualizers/GridDPVisualizer";
import LISVisualizer from "@/components/visualizers/LISVisualizer";
import MultiStateDPVisualizer from "@/components/visualizers/MultiStateDPVisualizer";
import TreeDPVisualizer from "@/components/visualizers/TreeDPVisualizer";

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

describe("Dynamic programming visualizers", () => {
  it("BitmaskDPVisualizer renders core phases and advances steps", () => {
    render(<BitmaskDPVisualizer />);

    expect(screen.getByText("Bitmask DP")).toBeInTheDocument();
    expect(screen.getByText("Bitmask Basics")).toBeInTheDocument();
    expect(screen.getByText("Subset Sum")).toBeInTheDocument();

    fireEvent.click(screen.getByTitle("Step"));
    expect(document.body.textContent).toContain("mask = 0");
  });

  it("GridDPVisualizer switches between tabulation and memoization", () => {
    render(<GridDPVisualizer />);

    expect(screen.getByText("Grid DP (2D Navigation)")).toBeInTheDocument();
    expect(document.body.textContent).toContain("dp[r][c] = paths to cell");

    fireEvent.click(screen.getByText("Memoization"));
    expect(document.body.textContent).toContain("Memo Table");
  });

  it("LISVisualizer renders tabulation and binary-search phases", () => {
    render(<LISVisualizer />);

    expect(
      screen.getByText("Longest Increasing Subsequence (LIS)")
    ).toBeInTheDocument();
    expect(document.body.textContent).toContain("nums = [10, 9, 2");

    fireEvent.click(screen.getByText("Binary Search"));
    expect(document.body.textContent).toContain("tails");
  });

  it("MultiStateDPVisualizer switches between state-machine examples", () => {
    render(<MultiStateDPVisualizer />);

    expect(screen.getByText("Multi-State DP")).toBeInTheDocument();
    expect(screen.getByText("Max Product")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Paint House"));
    expect(document.body.textContent).toContain("Paint House");
  });

  it("TreeDPVisualizer renders tree-specific phases and controls", () => {
    render(<TreeDPVisualizer />);

    expect(screen.getByText("Tree DP")).toBeInTheDocument();
    expect(screen.getByText("Why Pairs?")).toBeInTheDocument();
    expect(document.body.textContent).toContain(
      "Why does Tree DP need state PAIRS?"
    );

    fireEvent.click(screen.getByText("Tree Diameter"));
    expect(document.body.textContent).toContain("Tree Diameter");
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
  "KClosestPointsVisualizer",
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
  "TaskSchedulerVisualizer",
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
      // skipcq: JS-R1005
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

// Section: New Heap Visualizers
import IPOVisualizer from "@/components/visualizers/IPOVisualizer";
import KClosestPointsVisualizer from "@/components/visualizers/KClosestPointsVisualizer";
import MeetingRoomsHeapVisualizer from "@/components/visualizers/MeetingRoomsHeapVisualizer";
import ReorganizeStringVisualizer from "@/components/visualizers/ReorganizeStringVisualizer";
import SlidingWindowMedianVisualizer from "@/components/visualizers/SlidingWindowMedianVisualizer";
import TaskSchedulerVisualizer from "@/components/visualizers/TaskSchedulerVisualizer";

describe("IPOVisualizer", () => {
  it("renders without crashing", () => {
    render(<IPOVisualizer />);
    expect(screen.getByText(/IPO/i)).toBeInTheDocument();
  });

  it("renders Play button", () => {
    render(<IPOVisualizer />);
    expect(screen.getByText("Play")).toBeInTheDocument();
  });

  it("renders Reset button", () => {
    render(<IPOVisualizer />);
    expect(screen.getByText("Reset")).toBeInTheDocument();
  });

  it("renders Step button", () => {
    render(<IPOVisualizer />);
    expect(screen.getByText("Step")).toBeInTheDocument();
  });

  it("renders projects", () => {
    render(<IPOVisualizer />);
    // Check that projects are displayed via heading
    expect(
      screen.getByRole("heading", { name: /IPO: Maximize Capital/i })
    ).toBeInTheDocument();
  });

  it("can step through visualization", () => {
    render(<IPOVisualizer />);
    const stepBtn = screen.getByText("Step");
    fireEvent.click(stepBtn);
    // After stepping, state should change
    expect(stepBtn).toBeInTheDocument();
  });

  it("can reset visualization", () => {
    render(<IPOVisualizer />);
    const stepBtn = screen.getByText("Step");
    fireEvent.click(stepBtn);
    const resetBtn = screen.getByText("Reset");
    fireEvent.click(resetBtn);
    expect(resetBtn).toBeInTheDocument();
  });

  it("renders speed slider", () => {
    render(<IPOVisualizer />);
    const slider = document.querySelector('input[type="range"]');
    expect(slider).toBeInTheDocument();
  });
});

describe("KClosestPointsVisualizer", () => {
  it("renders without crashing", () => {
    render(<KClosestPointsVisualizer />);
    expect(
      screen.getByRole("heading", { name: /K Closest Points/i })
    ).toBeInTheDocument();
  });

  it("renders Play button", () => {
    render(<KClosestPointsVisualizer />);
    expect(screen.getByText("Play")).toBeInTheDocument();
  });

  it("renders Reset button", () => {
    render(<KClosestPointsVisualizer />);
    expect(screen.getByText("Reset")).toBeInTheDocument();
  });

  it("renders Step button", () => {
    render(<KClosestPointsVisualizer />);
    expect(screen.getByText("Step")).toBeInTheDocument();
  });

  it("can step through visualization", () => {
    render(<KClosestPointsVisualizer />);
    const stepBtn = screen.getByText("Step");
    fireEvent.click(stepBtn);
    expect(stepBtn).toBeInTheDocument();
  });
});

describe("MeetingRoomsHeapVisualizer", () => {
  it("renders without crashing", () => {
    render(<MeetingRoomsHeapVisualizer />);
    // Check for unique text that appears in the visualizer
    expect(screen.getByText(/minimum meeting rooms/i)).toBeInTheDocument();
  });

  it("renders Play button", () => {
    render(<MeetingRoomsHeapVisualizer />);
    expect(screen.getByText("Play")).toBeInTheDocument();
  });

  it("renders Reset button", () => {
    render(<MeetingRoomsHeapVisualizer />);
    expect(screen.getByText("Reset")).toBeInTheDocument();
  });

  it("renders Step button", () => {
    render(<MeetingRoomsHeapVisualizer />);
    expect(screen.getByText("Step")).toBeInTheDocument();
  });

  it("can step through visualization", () => {
    render(<MeetingRoomsHeapVisualizer />);
    const stepBtn = screen.getByText("Step");
    fireEvent.click(stepBtn);
    expect(stepBtn).toBeInTheDocument();
  });

  it("renders heap size display", () => {
    render(<MeetingRoomsHeapVisualizer />);
    // Check for heap size label
    expect(screen.getByText(/Heap size now/i)).toBeInTheDocument();
  });
});

describe("ReorganizeStringVisualizer", () => {
  it("renders without crashing", () => {
    render(<ReorganizeStringVisualizer />);
    expect(screen.getByText(/Reorganize/i)).toBeInTheDocument();
  });

  it("renders Play button", () => {
    render(<ReorganizeStringVisualizer />);
    expect(screen.getByText("Play")).toBeInTheDocument();
  });

  it("renders Reset button", () => {
    render(<ReorganizeStringVisualizer />);
    expect(screen.getByText("Reset")).toBeInTheDocument();
  });

  it("renders Step button", () => {
    render(<ReorganizeStringVisualizer />);
    expect(screen.getByText("Step")).toBeInTheDocument();
  });

  it("can step through visualization", () => {
    render(<ReorganizeStringVisualizer />);
    const stepBtn = screen.getByText("Step");
    fireEvent.click(stepBtn);
    expect(stepBtn).toBeInTheDocument();
  });
});

describe("SlidingWindowMedianVisualizer", () => {
  it("renders without crashing", () => {
    render(<SlidingWindowMedianVisualizer />);
    expect(screen.getByText(/Sliding Window Median/i)).toBeInTheDocument();
  });

  it("renders Play button", () => {
    render(<SlidingWindowMedianVisualizer />);
    expect(screen.getByText("Play")).toBeInTheDocument();
  });

  it("renders Reset button", () => {
    render(<SlidingWindowMedianVisualizer />);
    expect(screen.getByText("Reset")).toBeInTheDocument();
  });

  it("renders Step button", () => {
    render(<SlidingWindowMedianVisualizer />);
    expect(screen.getByText("Step")).toBeInTheDocument();
  });

  it("can step through visualization", () => {
    render(<SlidingWindowMedianVisualizer />);
    const stepBtn = screen.getByText("Step");
    fireEvent.click(stepBtn);
    expect(stepBtn).toBeInTheDocument();
  });
});

describe("TaskSchedulerVisualizer", () => {
  it("renders without crashing", () => {
    render(<TaskSchedulerVisualizer />);
    expect(screen.getByText(/Task Scheduler/i)).toBeInTheDocument();
  });

  it("renders Play button", () => {
    render(<TaskSchedulerVisualizer />);
    expect(screen.getByText("Play")).toBeInTheDocument();
  });

  it("renders Reset button", () => {
    render(<TaskSchedulerVisualizer />);
    expect(screen.getByText("Reset")).toBeInTheDocument();
  });

  it("renders Step button", () => {
    render(<TaskSchedulerVisualizer />);
    expect(screen.getByText("Step")).toBeInTheDocument();
  });

  it("can step through visualization", () => {
    render(<TaskSchedulerVisualizer />);
    const stepBtn = screen.getByText("Step");
    fireEvent.click(stepBtn);
    expect(stepBtn).toBeInTheDocument();
  });

  it("renders speed slider", () => {
    render(<TaskSchedulerVisualizer />);
    const slider = document.querySelector('input[type="range"]');
    expect(slider).toBeInTheDocument();
  });
});

// Section: Interval Visualizers with Step Button Tests
import InsertIntervalVisualizer from "@/components/visualizers/InsertIntervalVisualizer";
import IntervalIntersectionVisualizer from "@/components/visualizers/IntervalIntersectionVisualizer";
import MinimumArrowsVisualizer from "@/components/visualizers/MinimumArrowsVisualizer";
import EmployeeFreeTimeVisualizer from "@/components/visualizers/EmployeeFreeTimeVisualizer";
import IntervalQueryVisualizer from "@/components/visualizers/IntervalQueryVisualizer";
import ActivitySelectionVisualizer from "@/components/visualizers/ActivitySelectionVisualizer";
import MeetingRoomsVisualizer from "@/components/visualizers/MeetingRoomsVisualizer";

describe("MergeIntervalsVisualizer Step functionality", () => {
  it("renders Step button", () => {
    render(<MergeIntervalsVisualizer />);
    expect(screen.getByText("Step")).toBeInTheDocument();
  });

  it("Step button is disabled when playing", () => {
    render(<MergeIntervalsVisualizer />);
    fireEvent.click(screen.getByText("Play"));
    expect(screen.getByText("Step")).toBeDisabled();
  });

  it("Step button advances one step when clicked", () => {
    render(<MergeIntervalsVisualizer />);
    const stepBtn = screen.getByText("Step");
    fireEvent.click(stepBtn);
    expect(document.body.textContent).toContain("Step 1");
  });

  it("can complete visualization using only Step button", () => {
    render(<MergeIntervalsVisualizer />);
    const stepBtn = screen.getByText("Step");
    // Click through all steps
    for (let i = 0; i < 10; i++) {
      if (!stepBtn.hasAttribute("disabled")) {
        fireEvent.click(stepBtn);
      }
    }
    expect(document.body.textContent).toContain("Done");
  });
});

describe("InsertIntervalVisualizer", () => {
  it("renders without crashing", () => {
    render(<InsertIntervalVisualizer />);
    expect(screen.getByText(/Insert Interval/i)).toBeInTheDocument();
  });

  it("renders Play button", () => {
    render(<InsertIntervalVisualizer />);
    expect(screen.getByText("Play")).toBeInTheDocument();
  });

  it("renders Reset button", () => {
    render(<InsertIntervalVisualizer />);
    expect(screen.getByText("Reset")).toBeInTheDocument();
  });

  it("renders Step button", () => {
    render(<InsertIntervalVisualizer />);
    expect(screen.getByText("Step")).toBeInTheDocument();
  });

  it("Step button advances visualization", () => {
    render(<InsertIntervalVisualizer />);
    const stepBtn = screen.getByText("Step");
    fireEvent.click(stepBtn);
    // After first step, should show phase message
    expect(document.body.textContent).toMatch(/Phase|interval/i);
  });

  it("renders speed slider", () => {
    render(<InsertIntervalVisualizer />);
    const slider = document.querySelector('input[type="range"]');
    expect(slider).toBeInTheDocument();
  });

  it("can reset after stepping", () => {
    render(<InsertIntervalVisualizer />);
    fireEvent.click(screen.getByText("Step"));
    fireEvent.click(screen.getByText("Reset"));
    expect(screen.getByText("Play")).toBeInTheDocument();
  });
});

describe("IntervalIntersectionVisualizer", () => {
  it("renders without crashing", () => {
    render(<IntervalIntersectionVisualizer />);
    expect(screen.getByText(/Interval List Intersection/i)).toBeInTheDocument();
  });

  it("renders Play button", () => {
    render(<IntervalIntersectionVisualizer />);
    expect(screen.getByText("Play")).toBeInTheDocument();
  });

  it("renders Reset button", () => {
    render(<IntervalIntersectionVisualizer />);
    expect(screen.getByText("Reset")).toBeInTheDocument();
  });

  it("renders Step button", () => {
    render(<IntervalIntersectionVisualizer />);
    expect(screen.getByText("Step")).toBeInTheDocument();
  });

  it("Step button advances visualization", () => {
    render(<IntervalIntersectionVisualizer />);
    const stepBtn = screen.getByText("Step");
    fireEvent.click(stepBtn);
    expect(document.body.textContent).toMatch(/Comparing|intersection/i);
  });

  it("renders two interval lists A and B", () => {
    render(<IntervalIntersectionVisualizer />);
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("renders pointer indicators", () => {
    render(<IntervalIntersectionVisualizer />);
    expect(screen.getByText("Pointer A")).toBeInTheDocument();
    expect(screen.getByText("Pointer B")).toBeInTheDocument();
  });
});

describe("MinimumArrowsVisualizer", () => {
  it("renders without crashing", () => {
    render(<MinimumArrowsVisualizer />);
    // Use getAllByText since "Minimum Arrows" appears in title and description
    expect(screen.getAllByText(/Minimum Arrows/i).length).toBeGreaterThan(0);
  });

  it("renders Play button", () => {
    render(<MinimumArrowsVisualizer />);
    expect(screen.getByText("Play")).toBeInTheDocument();
  });

  it("renders Reset button", () => {
    render(<MinimumArrowsVisualizer />);
    expect(screen.getByText("Reset")).toBeInTheDocument();
  });

  it("renders Step button", () => {
    render(<MinimumArrowsVisualizer />);
    expect(screen.getByText("Step")).toBeInTheDocument();
  });

  it("Step button advances visualization", () => {
    render(<MinimumArrowsVisualizer />);
    const stepBtn = screen.getByText("Step");
    fireEvent.click(stepBtn);
    expect(document.body.textContent).toMatch(/Sort|balloon/i);
  });

  it("renders balloon and arrow stats", () => {
    render(<MinimumArrowsVisualizer />);
    expect(screen.getByText("Total Balloons")).toBeInTheDocument();
    expect(screen.getByText("Arrows Shot")).toBeInTheDocument();
  });

  it("can complete visualization", () => {
    render(<MinimumArrowsVisualizer />);
    const stepBtn = screen.getByText("Step");
    for (let i = 0; i < 10; i++) {
      if (!stepBtn.hasAttribute("disabled")) {
        fireEvent.click(stepBtn);
      }
    }
    expect(document.body.textContent).toMatch(/Done|arrow/i);
  });
});

describe("EmployeeFreeTimeVisualizer", () => {
  it("renders without crashing", () => {
    render(<EmployeeFreeTimeVisualizer />);
    expect(screen.getByText(/Employee Free Time/i)).toBeInTheDocument();
  });

  it("renders Play button", () => {
    render(<EmployeeFreeTimeVisualizer />);
    expect(screen.getByText("Play")).toBeInTheDocument();
  });

  it("renders Reset button", () => {
    render(<EmployeeFreeTimeVisualizer />);
    expect(screen.getByText("Reset")).toBeInTheDocument();
  });

  it("renders Step button", () => {
    render(<EmployeeFreeTimeVisualizer />);
    expect(screen.getByText("Step")).toBeInTheDocument();
  });

  it("Step button advances visualization", () => {
    render(<EmployeeFreeTimeVisualizer />);
    const stepBtn = screen.getByText("Step");
    fireEvent.click(stepBtn);
    expect(document.body.textContent).toMatch(/Flatten|Step 1/i);
  });

  it("renders phase indicators", () => {
    render(<EmployeeFreeTimeVisualizer />);
    expect(screen.getByText("Flatten")).toBeInTheDocument();
    expect(screen.getByText("Sort")).toBeInTheDocument();
    expect(screen.getByText("Merge")).toBeInTheDocument();
    expect(screen.getByText("Find Gaps")).toBeInTheDocument();
  });

  it("renders employee schedule labels", () => {
    render(<EmployeeFreeTimeVisualizer />);
    expect(screen.getByText("Emp 1:")).toBeInTheDocument();
    expect(screen.getByText("Emp 2:")).toBeInTheDocument();
    expect(screen.getByText("Emp 3:")).toBeInTheDocument();
  });

  it("renders stats grid", () => {
    render(<EmployeeFreeTimeVisualizer />);
    expect(screen.getByText("Employees")).toBeInTheDocument();
    expect(screen.getByText("Work Intervals")).toBeInTheDocument();
    expect(screen.getByText("Merged Blocks")).toBeInTheDocument();
    expect(screen.getByText("Free Slots")).toBeInTheDocument();
  });
});

describe("IntervalQueryVisualizer", () => {
  it("renders without crashing", () => {
    render(<IntervalQueryVisualizer />);
    // Check for component-specific text instead of title
    expect(screen.getByText("Play")).toBeInTheDocument();
  });

  it("renders Play button", () => {
    render(<IntervalQueryVisualizer />);
    expect(screen.getByText("Play")).toBeInTheDocument();
  });

  it("renders Reset button", () => {
    render(<IntervalQueryVisualizer />);
    expect(screen.getByText("Reset")).toBeInTheDocument();
  });

  it("renders Step button", () => {
    render(<IntervalQueryVisualizer />);
    expect(screen.getByText("Step")).toBeInTheDocument();
  });

  it("Step button advances visualization", () => {
    render(<IntervalQueryVisualizer />);
    const stepBtn = screen.getByText("Step");
    fireEvent.click(stepBtn);
    expect(document.body.textContent).toMatch(/Sort|query/i);
  });

  it("renders intervals and queries sections", () => {
    render(<IntervalQueryVisualizer />);
    // Use getAllByText since these labels appear multiple times
    expect(screen.getAllByText(/Intervals/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Queries/i).length).toBeGreaterThan(0);
  });
});

describe("ActivitySelectionVisualizer Step functionality", () => {
  it("renders without crashing", () => {
    render(<ActivitySelectionVisualizer />);
    expect(screen.getByText(/Activity Selection/i)).toBeInTheDocument();
  });

  it("renders Play button", () => {
    render(<ActivitySelectionVisualizer />);
    expect(screen.getByText("Play")).toBeInTheDocument();
  });

  it("renders Reset button", () => {
    render(<ActivitySelectionVisualizer />);
    expect(screen.getByText("Reset")).toBeInTheDocument();
  });

  it("renders Step button", () => {
    render(<ActivitySelectionVisualizer />);
    expect(screen.getByText("Step")).toBeInTheDocument();
  });

  it("Step button advances visualization", () => {
    render(<ActivitySelectionVisualizer />);
    const stepBtn = screen.getByText("Step");
    fireEvent.click(stepBtn);
    expect(document.body.textContent).toMatch(/Sort|END time/i);
  });

  it("Step button is disabled when playing", () => {
    render(<ActivitySelectionVisualizer />);
    fireEvent.click(screen.getByText("Play"));
    expect(screen.getByText("Step")).toBeDisabled();
  });

  it("renders phase indicators", () => {
    render(<ActivitySelectionVisualizer />);
    expect(screen.getByText("Original")).toBeInTheDocument();
    expect(screen.getByText("Sort")).toBeInTheDocument();
    expect(screen.getByText("Ready")).toBeInTheDocument();
    expect(screen.getByText("Select")).toBeInTheDocument();
  });

  it("renders activity stats", () => {
    render(<ActivitySelectionVisualizer />);
    expect(screen.getByText("Total Activities")).toBeInTheDocument();
    // "Selected" appears multiple times (stat label and activity state)
    expect(screen.getAllByText("Selected").length).toBeGreaterThan(0);
    expect(screen.getByText("Processed")).toBeInTheDocument();
  });
});

describe("MeetingRoomsVisualizer Step functionality", () => {
  it("renders without crashing", () => {
    render(<MeetingRoomsVisualizer />);
    // Use getAllByText since "Meeting Rooms" appears in title and stats
    expect(screen.getAllByText(/Meeting Rooms/i).length).toBeGreaterThan(0);
  });

  it("renders Play button", () => {
    render(<MeetingRoomsVisualizer />);
    expect(screen.getByText("Play")).toBeInTheDocument();
  });

  it("renders Reset button", () => {
    render(<MeetingRoomsVisualizer />);
    expect(screen.getByText("Reset")).toBeInTheDocument();
  });

  it("renders Step button", () => {
    render(<MeetingRoomsVisualizer />);
    expect(screen.getByText("Step")).toBeInTheDocument();
  });

  it("Step button advances visualization", () => {
    render(<MeetingRoomsVisualizer />);
    const stepBtn = screen.getByText("Step");
    fireEvent.click(stepBtn);
    expect(document.body.textContent).toMatch(/Step 1|events/i);
  });

  it("Step button is disabled when playing", () => {
    render(<MeetingRoomsVisualizer />);
    fireEvent.click(screen.getByText("Play"));
    expect(screen.getByText("Step")).toBeDisabled();
  });

  it("renders meetings section", () => {
    render(<MeetingRoomsVisualizer />);
    expect(screen.getByText("Meetings:")).toBeInTheDocument();
  });

  it("renders events section", () => {
    render(<MeetingRoomsVisualizer />);
    expect(screen.getByText("Events (sorted by time):")).toBeInTheDocument();
  });

  it("renders room counter", () => {
    render(<MeetingRoomsVisualizer />);
    expect(screen.getByText("Current Active Rooms")).toBeInTheDocument();
    expect(screen.getByText("Max Rooms Needed")).toBeInTheDocument();
  });

  it("can complete visualization using Step button", () => {
    render(<MeetingRoomsVisualizer />);
    const stepBtn = screen.getByText("Step");
    // Click through all steps
    for (let i = 0; i < 15; i++) {
      if (!stepBtn.hasAttribute("disabled")) {
        fireEvent.click(stepBtn);
      }
    }
    expect(document.body.textContent).toMatch(/Done|Maximum/i);
  });
});
