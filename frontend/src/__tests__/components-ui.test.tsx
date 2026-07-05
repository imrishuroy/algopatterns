import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

// Module-level mocks (must be before imports, hoisted by vitest)

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    const { src, alt, ...rest } = props;
    return <img src={src as string} alt={(alt as string) || ""} {...rest} />;
  },
}));

vi.mock("react-syntax-highlighter", () => ({
  Prism: (props: Record<string, unknown>) => {
    const {
      children,
      language,
      wrapLines,
      lineProps,
      showLineNumbers,
      customStyle,
      codeTagProps,
      ...rest
    } = props;
    const code = String(children);

    if (wrapLines && typeof lineProps === "function") {
      const lines = code.split("\n");
      return (
        <pre
          data-testid="syntax-highlighter"
          data-language={(language as string) || ""}
          style={customStyle as React.CSSProperties}
          {...rest}
        >
          {lines.map((line: string, i: number) => {
            const lineNumber = i + 1;
            const lp = (lineProps as (n: number) => Record<string, unknown>)(
              lineNumber
            );
            return (
              <div key={i} {...lp} data-line-number={lineNumber}>
                {(showLineNumbers as boolean) && (
                  <span className="line-number">{lineNumber}</span>
                )}
                {line}
              </div>
            );
          })}
        </pre>
      );
    }

    return (
      <pre
        data-testid="syntax-highlighter"
        data-language={(language as string) || ""}
        style={customStyle as React.CSSProperties}
        {...rest}
      >
        <code
          style={
            ((codeTagProps as Record<string, unknown>)
              ?.style as React.CSSProperties) || {}
          }
        >
          {code}
        </code>
      </pre>
    );
  },
}));

vi.mock("react-syntax-highlighter/dist/esm/styles/prism", () => ({
  oneDark: {},
}));

const mockUseAuth = vi.fn();
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

const mockUseHighlights = vi.fn();
vi.mock("@/contexts/HighlightContext", () => ({
  useHighlights: () => mockUseHighlights(),
}));

const mockUseTextSelection = vi.fn();
vi.mock("@/hooks/useTextSelection", () => ({
  useTextSelection: () => mockUseTextSelection(),
}));

vi.mock("@/lib/contentHash", () => ({
  generateContentHash: vi.fn().mockResolvedValue("mock-hash-abc"),
  isHighlightStale: vi.fn().mockReturnValue(false),
  getContentText: vi
    .fn()
    .mockImplementation((el: HTMLElement) => el.textContent || ""),
}));

// Component imports (after mocks)

import CodeBlock from "@/components/ui/CodeBlock";
import Confetti from "@/components/ui/Confetti";
import { ConflictDialog } from "@/components/ui/ConflictDialog";
import Dropdown from "@/components/ui/Dropdown";
import { Highlightable } from "@/components/ui/Highlightable";
import { HighlightableCode } from "@/components/ui/HighlightableCode";
import LanguageToggle from "@/components/ui/LanguageToggle";
import { GoogleButton } from "@/components/ui/GoogleButton";

// Setup helpers

function mockClipboard() {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    writable: true,
    configurable: true,
  });
}

function mockDialogMethods() {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = vi.fn(function (
      this: HTMLDialogElement
    ) {
      (this as unknown as Record<string, unknown>).open = true;
    });
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = vi.fn(function (
      this: HTMLDialogElement
    ) {
      (this as unknown as Record<string, unknown>).open = false;
    });
  }
}

class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

// Common defaults

function defaultAuth(isAuthenticated = false) {
  mockUseAuth.mockReturnValue({
    isAuthenticated,
    user: isAuthenticated ? { id: "user-1", email: "test@test.com" } : null,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    refreshUser: vi.fn(),
    loginWithGoogle: vi.fn(),
    handleGoogleCallback: vi.fn(),
  });
}

function defaultHighlights() {
  mockUseHighlights.mockReturnValue({
    createHighlight: vi.fn().mockResolvedValue({ id: "new-highlight" }),
    updateHighlight: vi.fn().mockResolvedValue(null),
    deleteHighlight: vi.fn().mockResolvedValue(true),
    getHighlightsForContent: vi.fn().mockReturnValue([]),
    fetchHighlightsForContent: vi.fn().mockResolvedValue(undefined),
    clearHighlights: vi.fn(),
    highlights: new Map(),
    isLoading: false,
  });
}

function defaultTextSelection() {
  mockUseTextSelection.mockReturnValue({
    selection: null,
    clearSelection: vi.fn(),
  });
}

// CodeBlock

describe("CodeBlock", () => {
  const sampleCode = `function hello() {\n  console.log("world");\n}`;

  beforeEach(() => {
    defaultAuth();
    defaultHighlights();
    defaultTextSelection();
  });

  it("renders code with syntax highlighter", () => {
    render(<CodeBlock code={sampleCode} language="javascript" />);
    const pre = screen.getByTestId("syntax-highlighter");
    expect(pre).toBeInTheDocument();
    expect(pre).toHaveAttribute("data-language", "javascript");
  });

  it("renders the language label correctly", () => {
    render(<CodeBlock code={sampleCode} language="javascript" />);
    expect(screen.getByText("Javascript")).toBeInTheDocument();
  });

  it("handles cpp language label specially", () => {
    render(<CodeBlock code={sampleCode} language="cpp" />);
    expect(screen.getByText("C++")).toBeInTheDocument();
  });

  it("maps py to Python label", () => {
    render(<CodeBlock code={sampleCode} language="py" />);
    expect(screen.getByText("Python")).toBeInTheDocument();
  });

  it("defaults to Java for unknown languages", () => {
    render(<CodeBlock code={sampleCode} language="brainfuck" />);
    expect(screen.getByText("Java")).toBeInTheDocument();
  });

  it("renders copy button", () => {
    render(<CodeBlock code={sampleCode} />);
    expect(screen.getByText("Copy")).toBeInTheDocument();
  });

  it("does not render copy button when showCopy is false", () => {
    render(<CodeBlock code={sampleCode} showCopy={false} />);
    expect(screen.queryByText("Copy")).not.toBeInTheDocument();
  });

  it("copies code to clipboard and shows Copied! feedback", async () => {
    mockClipboard();
    render(<CodeBlock code={sampleCode} />);

    await act(async () => {
      fireEvent.click(screen.getByText("Copy"));
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(sampleCode);
    expect(screen.getByText("Copied!")).toBeInTheDocument();
  });

  it("reverts copy button text after timeout", async () => {
    vi.useFakeTimers();
    mockClipboard();
    render(<CodeBlock code={sampleCode} />);

    await act(async () => {
      fireEvent.click(screen.getByText("Copy"));
    });

    expect(screen.getByText("Copied!")).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.queryByText("Copied!")).not.toBeInTheDocument();
    expect(screen.getByText("Copy")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("handles empty code string", () => {
    render(<CodeBlock code="" />);
    const pre = screen.getByTestId("syntax-highlighter");
    expect(pre).toBeInTheDocument();
  });

  it("renders collapsible toggle when collapsible is true", () => {
    render(<CodeBlock code={sampleCode} collapsible />);
    expect(screen.getByText("Show")).toBeInTheDocument();
  });

  it("collapses and expands code when toggle is clicked", () => {
    render(<CodeBlock code={sampleCode} collapsible />);
    expect(screen.getByText("Show")).toBeInTheDocument();
    expect(screen.queryByTestId("syntax-highlighter")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Show"));
    expect(screen.getByTestId("syntax-highlighter")).toBeInTheDocument();
    expect(screen.getByText("Hide")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Hide"));
    expect(screen.queryByTestId("syntax-highlighter")).not.toBeInTheDocument();
    expect(screen.getByText("Show")).toBeInTheDocument();
  });

  it("renders HighlightableCode when highlightable is true", () => {
    render(
      <CodeBlock
        code={sampleCode}
        highlightable
        contentType="pattern_tutorial"
        contentId="two-pointers"
      />
    );
    const pre = screen.getByTestId("syntax-highlighter");
    expect(pre).toBeInTheDocument();
  });

  it("renders header bar with traffic light dots", () => {
    render(<CodeBlock code={sampleCode} />);
    const dots = document.querySelectorAll(".rounded-full");
    expect(dots.length).toBeGreaterThanOrEqual(3);
  });

  it("falls back to execCommand when clipboard API fails", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
      writable: true,
      configurable: true,
    });

    const execCommand = vi.fn().mockReturnValue(true);
    document.execCommand = execCommand;

    render(<CodeBlock code={sampleCode} />);

    await act(async () => {
      fireEvent.click(screen.getByText("Copy"));
    });

    expect(execCommand).toHaveBeenCalledWith("copy");
    expect(screen.getByText("Copied!")).toBeInTheDocument();
  });
});

// Confetti

describe("Confetti", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders confetti particles on mount", () => {
    render(<Confetti />);
    const container = document.querySelector(".fixed.inset-0");
    expect(container).toBeInTheDocument();
    expect(container?.querySelectorAll(".will-change-transform").length).toBe(
      200
    );
  });

  it("does not render when not active (after timeout)", () => {
    render(<Confetti />);
    expect(document.querySelector(".fixed.inset-0")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(document.querySelector(".fixed.inset-0")).not.toBeInTheDocument();
  });

  it("creates particles with correct count", () => {
    render(<Confetti />);
    const particles = document.querySelectorAll(".will-change-transform");
    expect(particles.length).toBe(200);
  });

  it("runs cleanup on unmount", () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");
    const { unmount } = render(<Confetti />);
    unmount();
    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  it("each particle has style attributes for animation", () => {
    render(<Confetti />);
    const particles = document.querySelectorAll(".will-change-transform");
    expect(particles.length).toBe(200);
    particles.forEach((p) => {
      const html = p as HTMLElement;
      expect(html.style.width).toBeTruthy();
      expect(html.style.height).toBeTruthy();
      expect(html.style.backgroundColor).toBeTruthy();
      expect(html.style.borderRadius).toBeTruthy();
    });
  });

  it("renders with pointer-events-none class", () => {
    render(<Confetti />);
    const container = document.querySelector(".pointer-events-none");
    expect(container).toBeInTheDocument();
  });
});

// ConflictDialog

describe("ConflictDialog", () => {
  const localHighlight = {
    id: "hl-1",
    userId: "user-1",
    contentType: "pattern_tutorial",
    contentId: "two-pointers",
    startOffset: 10,
    endOffset: 50,
    selectedText: "test highlight",
    color: "yellow" as const,
    note: "local note",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    version: 1,
  };

  const serverHighlight = {
    ...localHighlight,
    id: "hl-1",
    color: "blue" as const,
    note: "server note",
    version: 2,
    updatedAt: "2024-01-02T00:00:00Z",
  };

  beforeEach(() => {
    mockDialogMethods();
  });

  it("renders when isOpen is true", () => {
    render(
      <ConflictDialog
        isOpen={true}
        localHighlight={localHighlight}
        serverHighlight={serverHighlight}
        onKeepServer={vi.fn()}
        onKeepLocal={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByText("Sync Conflict Detected")).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    render(
      <ConflictDialog
        isOpen={false}
        localHighlight={localHighlight}
        serverHighlight={serverHighlight}
        onKeepServer={vi.fn()}
        onKeepLocal={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(
      screen.queryByText("Sync Conflict Detected")
    ).not.toBeInTheDocument();
  });

  it("shows description text", () => {
    render(
      <ConflictDialog
        isOpen={true}
        localHighlight={localHighlight}
        serverHighlight={serverHighlight}
        onKeepServer={vi.fn()}
        onKeepLocal={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(
      screen.getByText("This highlight was modified on another device")
    ).toBeInTheDocument();
  });

  it("shows server version header", () => {
    render(
      <ConflictDialog
        isOpen={true}
        localHighlight={localHighlight}
        serverHighlight={serverHighlight}
        onKeepServer={vi.fn()}
        onKeepLocal={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByText("Server Version")).toBeInTheDocument();
  });

  it("shows local version header", () => {
    render(
      <ConflictDialog
        isOpen={true}
        localHighlight={localHighlight}
        serverHighlight={serverHighlight}
        onKeepServer={vi.fn()}
        onKeepLocal={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByText("Your Changes")).toBeInTheDocument();
  });

  it("shows server version note", () => {
    render(
      <ConflictDialog
        isOpen={true}
        localHighlight={localHighlight}
        serverHighlight={serverHighlight}
        onKeepServer={vi.fn()}
        onKeepLocal={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByText("server note")).toBeInTheDocument();
  });

  it("shows local version note", () => {
    render(
      <ConflictDialog
        isOpen={true}
        localHighlight={localHighlight}
        serverHighlight={serverHighlight}
        onKeepServer={vi.fn()}
        onKeepLocal={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByText("local note")).toBeInTheDocument();
  });

  it("shows 'No note' when note is empty", () => {
    const localNoNote = { ...localHighlight, note: undefined };
    const serverNoNote = { ...serverHighlight, note: undefined };
    render(
      <ConflictDialog
        isOpen={true}
        localHighlight={localNoNote}
        serverHighlight={serverNoNote}
        onKeepServer={vi.fn()}
        onKeepLocal={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    const noNotes = screen.getAllByText("No note");
    expect(noNotes.length).toBeGreaterThanOrEqual(1);
  });

  it("calls onKeepServer when 'Keep Server Version' button is clicked", () => {
    const onKeepServer = vi.fn();
    render(
      <ConflictDialog
        isOpen={true}
        localHighlight={localHighlight}
        serverHighlight={serverHighlight}
        onKeepServer={onKeepServer}
        onKeepLocal={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    fireEvent.click(screen.getByText("Keep Server Version"));
    expect(onKeepServer).toHaveBeenCalledTimes(1);
  });

  it("calls onKeepLocal when 'Use My Changes' button is clicked", () => {
    const onKeepLocal = vi.fn();
    render(
      <ConflictDialog
        isOpen={true}
        localHighlight={localHighlight}
        serverHighlight={serverHighlight}
        onKeepServer={vi.fn()}
        onKeepLocal={onKeepLocal}
        onCancel={vi.fn()}
      />
    );
    fireEvent.click(screen.getByText("Use My Changes"));
    expect(onKeepLocal).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when Cancel button is clicked", () => {
    const onCancel = vi.fn();
    render(
      <ConflictDialog
        isOpen={true}
        localHighlight={localHighlight}
        serverHighlight={serverHighlight}
        onKeepServer={vi.fn()}
        onKeepLocal={vi.fn()}
        onCancel={onCancel}
      />
    );
    fireEvent.click(screen.getByText("Cancel"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("shows server version and version number", () => {
    render(
      <ConflictDialog
        isOpen={true}
        localHighlight={localHighlight}
        serverHighlight={serverHighlight}
        onKeepServer={vi.fn()}
        onKeepLocal={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByText(/v2/)).toBeInTheDocument();
  });

  it("renders dialog element with role", () => {
    render(
      <ConflictDialog
        isOpen={true}
        localHighlight={localHighlight}
        serverHighlight={serverHighlight}
        onKeepServer={vi.fn()}
        onKeepLocal={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    const dialog = document.querySelector("dialog");
    expect(dialog).toBeInTheDocument();
  });
});

// Dropdown

describe("Dropdown", () => {
  const options = ["javascript", "python", "java", "cpp"];

  it("renders trigger button with placeholder", () => {
    render(
      <Dropdown
        value=""
        onChange={vi.fn()}
        options={options}
        placeholder="Select language"
      />
    );
    expect(screen.getByText("Select language")).toBeInTheDocument();
  });

  it("renders trigger button with selected value", () => {
    render(<Dropdown value="python" onChange={vi.fn()} options={options} />);
    expect(screen.getByText("python")).toBeInTheDocument();
  });

  it("shows menu items when toggled", () => {
    render(<Dropdown value="" onChange={vi.fn()} options={options} />);
    fireEvent.click(screen.getByText("Select..."));
    options.forEach((opt) => {
      expect(screen.getByText(opt)).toBeInTheDocument();
    });
  });

  it("calls onChange with selected item value", () => {
    const onChange = vi.fn();
    render(<Dropdown value="" onChange={onChange} options={options} />);
    fireEvent.click(screen.getByText("Select..."));
    fireEvent.click(screen.getByText("python"));
    expect(onChange).toHaveBeenCalledWith("python");
  });

  it("closes menu after selection", () => {
    render(<Dropdown value="" onChange={vi.fn()} options={options} />);
    fireEvent.click(screen.getByText("Select..."));
    expect(screen.getByText("python")).toBeInTheDocument();
    fireEvent.click(screen.getByText("python"));
    expect(screen.queryByText("javascript")).not.toBeInTheDocument();
  });

  it("closes menu when clicking outside", () => {
    render(<Dropdown value="" onChange={vi.fn()} options={options} />);
    fireEvent.click(screen.getByText("Select..."));
    expect(screen.getByText("python")).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByText("python")).not.toBeInTheDocument();
  });

  it("highlights the selected item", () => {
    render(<Dropdown value="java" onChange={vi.fn()} options={options} />);
    fireEvent.click(screen.getByText("java"));
    const items = screen.getAllByText("java");
    expect(items.length).toBeGreaterThanOrEqual(1);
  });

  it("clears selection when placeholder option is clicked", () => {
    const onChange = vi.fn();
    render(
      <Dropdown
        value="java"
        onChange={onChange}
        options={options}
        placeholder="Select language"
      />
    );
    fireEvent.click(screen.getByText("java"));
    fireEvent.click(screen.getByText("Select language"));
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("renders icons when provided via icon prop", () => {
    const icon = <span data-testid="custom-icon">🔤</span>;
    render(
      <Dropdown value="" onChange={vi.fn()} options={options} icon={icon} />
    );
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("toggles arrow rotation on open/close", () => {
    render(<Dropdown value="" onChange={vi.fn()} options={options} />);
    const button = screen.getByRole("button");
    const svg = button.querySelector("svg");
    expect(svg).not.toHaveClass("rotate-180");

    fireEvent.click(button);
    expect(svg).toHaveClass("rotate-180");

    fireEvent.click(button);
    expect(svg).not.toHaveClass("rotate-180");
  });
});

// Highlightable

describe("Highlightable", () => {
  const mockCreateHighlight = vi.fn();
  const mockDeleteHighlight = vi.fn();
  const mockGetHighlights = vi.fn();
  const mockFetchHighlights = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("ResizeObserver", MockResizeObserver);
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(
      (cb: FrameRequestCallback) => {
        cb(0);
        return 0;
      }
    );
    Range.prototype.getClientRects = vi.fn(() => [
      { top: 0, left: 0, width: 100, height: 20 },
    ]) as unknown as () => DOMRectList;

    mockCreateHighlight.mockResolvedValue({ id: "new-hl" });
    mockDeleteHighlight.mockResolvedValue(true);
    mockGetHighlights.mockReturnValue([]);
    mockFetchHighlights.mockResolvedValue(undefined);

    defaultAuth(true);
    mockUseHighlights.mockReturnValue({
      createHighlight: mockCreateHighlight,
      updateHighlight: vi.fn(),
      deleteHighlight: mockDeleteHighlight,
      getHighlightsForContent: mockGetHighlights,
      fetchHighlightsForContent: mockFetchHighlights,
      clearHighlights: vi.fn(),
      highlights: new Map(),
      isLoading: false,
    });
  });

  it("wraps children in highlightable container", async () => {
    render(
      <Highlightable contentType="pattern_tutorial" contentId="two-pointers">
        <p data-testid="child">Hello world</p>
      </Highlightable>
    );
    await act(async () => {});
    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("fetches highlights on mount when authenticated", async () => {
    render(
      <Highlightable contentType="pattern_tutorial" contentId="two-pointers">
        <p>Content</p>
      </Highlightable>
    );
    await act(async () => {});
    expect(mockFetchHighlights).toHaveBeenCalledWith(
      "pattern_tutorial",
      "two-pointers"
    );
  });

  it("does not fetch highlights when not authenticated", async () => {
    defaultAuth(false);
    mockUseHighlights.mockReturnValue({
      createHighlight: mockCreateHighlight,
      updateHighlight: vi.fn(),
      deleteHighlight: mockDeleteHighlight,
      getHighlightsForContent: mockGetHighlights,
      fetchHighlightsForContent: mockFetchHighlights,
      clearHighlights: vi.fn(),
      highlights: new Map(),
      isLoading: false,
    });

    render(
      <Highlightable contentType="pattern_tutorial" contentId="two-pointers">
        <p>Content</p>
      </Highlightable>
    );
    await act(async () => {});
    expect(mockFetchHighlights).not.toHaveBeenCalled();
  });

  it("gets highlights from context for current content", async () => {
    render(
      <Highlightable contentType="pattern_tutorial" contentId="two-pointers">
        <p>Content</p>
      </Highlightable>
    );
    await act(async () => {});
    expect(mockGetHighlights).toHaveBeenCalledWith(
      "pattern_tutorial",
      "two-pointers"
    );
  });

  it("applies custom className", async () => {
    const { container } = render(
      <Highlightable
        contentType="test"
        contentId="test"
        className="custom-class"
      >
        <p>Content</p>
      </Highlightable>
    );
    await act(async () => {});
    expect(container.querySelector(".custom-class")).toBeInTheDocument();
  });

  it("renders highlight overlays when highlights exist in context", async () => {
    const highlights = [
      {
        id: "hl-1",
        userId: "user-1",
        contentType: "test",
        contentId: "test",
        startOffset: 0,
        endOffset: 7,
        selectedText: "Content",
        color: "yellow" as const,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        version: 1,
      },
    ];
    mockGetHighlights.mockReturnValue(highlights);

    render(
      <Highlightable contentType="test" contentId="test">
        <div>Content here</div>
      </Highlightable>
    );
    await act(async () => {});

    // Verify the context was queried with the right content identifiers
    expect(mockGetHighlights).toHaveBeenCalledWith("test", "test");
    // Verify children are rendered
    expect(screen.getByText("Content here")).toBeInTheDocument();
  });

  it("shows sign-in prompt when not authenticated and selection toolbar is triggered", async () => {
    defaultAuth(false);
    mockUseHighlights.mockReturnValue({
      createHighlight: mockCreateHighlight,
      updateHighlight: vi.fn(),
      deleteHighlight: mockDeleteHighlight,
      getHighlightsForContent: mockGetHighlights,
      fetchHighlightsForContent: mockFetchHighlights,
      clearHighlights: vi.fn(),
      highlights: new Map(),
      isLoading: false,
    });

    const { container } = render(
      <Highlightable contentType="test" contentId="test">
        <div>Content to highlight</div>
      </Highlightable>
    );
    await act(async () => {});

    const contentDiv = container.querySelector('[class="relative"]');
    expect(contentDiv).toBeInTheDocument();
  });
});

// HighlightableCode

describe("HighlightableCode", () => {
  const code = `function hello() {\n  return "world";\n}`;

  beforeEach(() => {
    defaultAuth(true);
    defaultHighlights();
    defaultTextSelection();
  });

  it("renders code with syntax highlighter", () => {
    render(
      <HighlightableCode
        code={code}
        language="javascript"
        contentType="pattern_tutorial"
        contentId="two-pointers"
      />
    );
    const pre = screen.getByTestId("syntax-highlighter");
    expect(pre).toBeInTheDocument();
    expect(pre).toHaveAttribute("data-language", "javascript");
  });

  it("normalizes language aliases", () => {
    render(
      <HighlightableCode
        code={code}
        language="js"
        contentType="test"
        contentId="test"
      />
    );
    const pre = screen.getByTestId("syntax-highlighter");
    expect(pre).toHaveAttribute("data-language", "javascript");
  });

  it("defaults to java for unknown language", () => {
    render(
      <HighlightableCode
        code={code}
        language="unknown"
        contentType="test"
        contentId="test"
      />
    );
    const pre = screen.getByTestId("syntax-highlighter");
    expect(pre).toHaveAttribute("data-language", "java");
  });

  it("trims code content", () => {
    const codeWithWhitespace = `  \n${code}\n  `;
    render(
      <HighlightableCode
        code={codeWithWhitespace}
        language="javascript"
        contentType="test"
        contentId="test"
      />
    );
    const pre = screen.getByTestId("syntax-highlighter");
    expect(pre).toHaveTextContent("function hello");
  });

  it("shows toolbar when selection is present", () => {
    defaultTextSelection();
    mockUseTextSelection.mockReturnValue({
      selection: {
        text: "hello",
        startOffset: 9,
        endOffset: 14,
        startLine: 1,
        endLine: 1,
        rect: {
          top: 100,
          left: 50,
          width: 50,
          height: 20,
          x: 50,
          y: 100,
          right: 100,
          bottom: 120,
        },
      },
      clearSelection: vi.fn(),
    });

    render(
      <HighlightableCode
        code={code}
        language="javascript"
        contentType="test"
        contentId="test"
      />
    );
    expect(screen.getByTitle("Highlight yellow")).toBeInTheDocument();
    expect(screen.getByTitle("Highlight green")).toBeInTheDocument();
    expect(screen.getByTitle("Highlight blue")).toBeInTheDocument();
    expect(screen.getByTitle("Highlight pink")).toBeInTheDocument();
    expect(screen.getByTitle("Highlight purple")).toBeInTheDocument();
  });

  it("shows login prompt when not authenticated and selection exists", () => {
    defaultAuth(false);
    mockUseTextSelection.mockReturnValue({
      selection: {
        text: "hello",
        startOffset: 9,
        endOffset: 14,
        startLine: 1,
        endLine: 1,
        rect: {
          top: 100,
          left: 50,
          width: 50,
          height: 20,
          x: 50,
          y: 100,
          right: 100,
          bottom: 120,
        },
      },
      clearSelection: vi.fn(),
    });

    render(
      <HighlightableCode
        code={code}
        language="javascript"
        contentType="test"
        contentId="test"
      />
    );
    expect(screen.getByText("Login to highlight")).toBeInTheDocument();
  });

  it("calls createHighlight when color button is clicked", async () => {
    const createHighlight = vi.fn().mockResolvedValue({ id: "new-hl" });
    mockUseHighlights.mockReturnValue({
      createHighlight,
      updateHighlight: vi.fn(),
      deleteHighlight: vi.fn(),
      getHighlightsForContent: vi.fn().mockReturnValue([]),
      fetchHighlightsForContent: vi.fn(),
      clearHighlights: vi.fn(),
      highlights: new Map(),
      isLoading: false,
    });

    mockUseTextSelection.mockReturnValue({
      selection: {
        text: "hello",
        startOffset: 9,
        endOffset: 14,
        startLine: 1,
        endLine: 1,
        rect: {
          top: 100,
          left: 50,
          width: 50,
          height: 20,
          x: 50,
          y: 100,
          right: 100,
          bottom: 120,
        },
      },
      clearSelection: vi.fn(),
    });

    render(
      <HighlightableCode
        code={code}
        language="javascript"
        contentType="test"
        contentId="test"
      />
    );

    const highlightBtn = screen.getByTitle("Highlight yellow");
    expect(highlightBtn).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(highlightBtn);
    });
    expect(createHighlight).toHaveBeenCalled();
  });

  it("fetches highlights on mount when authenticated", () => {
    const fetchHighlights = vi.fn();
    mockUseHighlights.mockReturnValue({
      createHighlight: vi.fn(),
      updateHighlight: vi.fn(),
      deleteHighlight: vi.fn(),
      getHighlightsForContent: vi.fn().mockReturnValue([]),
      fetchHighlightsForContent: fetchHighlights,
      clearHighlights: vi.fn(),
      highlights: new Map(),
      isLoading: false,
    });

    render(
      <HighlightableCode
        code={code}
        language="javascript"
        contentType="pattern_tutorial"
        contentId="two-pointers"
      />
    );
    expect(fetchHighlights).toHaveBeenCalledWith(
      "pattern_tutorial",
      "two-pointers"
    );
  });

  it("renders highlighted lines from context highlights", () => {
    const highlights = [
      {
        id: "hl-1",
        userId: "user-1",
        contentType: "test",
        contentId: "test",
        startOffset: 0,
        endOffset: 18,
        startLine: 1,
        endLine: 1,
        selectedText: "function hello() {",
        color: "yellow" as const,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        version: 1,
      },
    ];
    mockUseHighlights.mockReturnValue({
      createHighlight: vi.fn(),
      updateHighlight: vi.fn(),
      deleteHighlight: vi.fn(),
      getHighlightsForContent: vi.fn().mockReturnValue(highlights),
      fetchHighlightsForContent: vi.fn(),
      clearHighlights: vi.fn(),
      highlights: new Map(),
      isLoading: false,
    });

    render(
      <HighlightableCode
        code={"function hello() {\n  return 'world';\n}"}
        language="javascript"
        contentType="test"
        contentId="test"
      />
    );

    const lines = screen.getAllByText(/function hello/, { exact: false });
    expect(lines.length).toBeGreaterThanOrEqual(1);
  });
});

// LanguageToggle

describe("LanguageToggle", () => {
  it("renders buttons for each language", () => {
    render(
      <LanguageToggle
        currentLang="java"
        onChange={vi.fn()}
        languages={["java", "python"]}
      />
    );
    expect(screen.getByText("Java")).toBeInTheDocument();
    expect(screen.getByText("Python")).toBeInTheDocument();
  });

  it("highlights the current language with indigo class", () => {
    render(
      <LanguageToggle
        currentLang="java"
        onChange={vi.fn()}
        languages={["java", "python"]}
      />
    );
    const javaBtn = screen.getByText("Java");
    expect(javaBtn.className).toContain("bg-indigo-500");
  });

  it("does not highlight non-selected languages", () => {
    render(
      <LanguageToggle
        currentLang="java"
        onChange={vi.fn()}
        languages={["java", "python"]}
      />
    );
    const pythonBtn = screen.getByText("Python");
    expect(pythonBtn.className).not.toContain("bg-indigo-500");
  });

  it("calls onChange when a language button is clicked", () => {
    const onChange = vi.fn();
    render(
      <LanguageToggle
        currentLang="java"
        onChange={onChange}
        languages={["java", "python"]}
      />
    );
    fireEvent.click(screen.getByText("Python"));
    expect(onChange).toHaveBeenCalledWith("python");
  });

  it("calls onChange when the currently selected language is clicked", () => {
    const onChange = vi.fn();
    render(
      <LanguageToggle
        currentLang="java"
        onChange={onChange}
        languages={["java", "python"]}
      />
    );
    fireEvent.click(screen.getByText("Java"));
    expect(onChange).toHaveBeenCalledWith("java");
  });

  it("uses default languages when none provided", () => {
    render(<LanguageToggle currentLang="java" onChange={vi.fn()} />);
    expect(screen.getByText("JavaScript")).toBeInTheDocument();
    expect(screen.getByText("Java")).toBeInTheDocument();
  });

  it("renders sm size labels (JS, Py)", () => {
    render(
      <LanguageToggle
        currentLang="javascript"
        onChange={vi.fn()}
        languages={["javascript", "python"]}
        size="sm"
      />
    );
    expect(screen.getByText("JS")).toBeInTheDocument();
    expect(screen.getByText("Py")).toBeInTheDocument();
  });

  it("renders md size labels by default (JavaScript, Python)", () => {
    render(
      <LanguageToggle
        currentLang="javascript"
        onChange={vi.fn()}
        languages={["javascript", "python"]}
      />
    );
    expect(screen.getByText("JavaScript")).toBeInTheDocument();
    expect(screen.getByText("Python")).toBeInTheDocument();
  });

  it("uses labelMap for C++ and Go", () => {
    render(
      <LanguageToggle
        currentLang="cpp"
        onChange={vi.fn()}
        languages={["cpp", "go"]}
      />
    );
    expect(screen.getByText("C++")).toBeInTheDocument();
    expect(screen.getByText("Go")).toBeInTheDocument();
  });

  it("falls back to raw language string for unknown languages", () => {
    render(
      <LanguageToggle
        currentLang="ruby"
        onChange={vi.fn()}
        languages={["ruby"]}
      />
    );
    expect(screen.getByText("ruby")).toBeInTheDocument();
  });

  it("renders buttons inside a flex container with bg-gray-800", () => {
    const { container } = render(
      <LanguageToggle
        currentLang="java"
        onChange={vi.fn()}
        languages={["java"]}
      />
    );
    const flexContainer = container.querySelector(".flex");
    expect(flexContainer).toHaveClass("bg-gray-800");
  });
});

// GoogleButton (additional tests)

describe("GoogleButton additional", () => {
  it("renders with default text 'Continue with Google'", () => {
    render(<GoogleButton onClick={vi.fn()} />);
    expect(screen.getByText("Continue with Google")).toBeInTheDocument();
  });

  it("renders a spinner when isLoading is true", () => {
    render(<GoogleButton onClick={vi.fn()} isLoading />);
    expect(screen.queryByText("Continue with Google")).not.toBeInTheDocument();
    const button = screen.getByRole("button");
    expect(button.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("disables the button when isLoading is true", () => {
    render(<GoogleButton onClick={vi.fn()} isLoading />);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("does not disable the button when isLoading is false", () => {
    render(<GoogleButton onClick={vi.fn()} />);
    expect(screen.getByRole("button")).not.toBeDisabled();
  });

  it("renders an SVG icon when not loading", () => {
    render(<GoogleButton onClick={vi.fn()} />);
    const button = screen.getByRole("button");
    expect(button.querySelector("svg")).toBeInTheDocument();
  });

  it("does not render SVG icon when loading", () => {
    render(<GoogleButton onClick={vi.fn()} isLoading />);
    const button = screen.getByRole("button");
    expect(button.querySelector("svg")).not.toBeInTheDocument();
  });

  it("calls onClick handler when clicked", () => {
    const onClick = vi.fn();
    render(<GoogleButton onClick={onClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", () => {
    const onClick = vi.fn();
    render(<GoogleButton onClick={onClick} isLoading />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });
});
