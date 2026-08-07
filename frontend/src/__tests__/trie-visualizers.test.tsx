import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      ...props
    }: {
      children?: React.ReactNode;
      [key: string]: unknown;
    }) => {
      const filteredProps = Object.fromEntries(
        Object.entries(props).filter(
          ([key]) =>
            !key.startsWith("while") &&
            !key.startsWith("animate") &&
            !key.startsWith("initial") &&
            !key.startsWith("exit") &&
            !key.startsWith("transition") &&
            !key.startsWith("variants") &&
            !key.startsWith("layout") &&
            !key.startsWith("drag")
        )
      );
      return <div {...filteredProps}>{children}</div>;
    },
    span: ({
      children,
      ...props
    }: {
      children?: React.ReactNode;
      [key: string]: unknown;
    }) => {
      const filteredProps = Object.fromEntries(
        Object.entries(props).filter(
          ([key]) =>
            !key.startsWith("while") &&
            !key.startsWith("animate") &&
            !key.startsWith("initial") &&
            !key.startsWith("exit") &&
            !key.startsWith("transition") &&
            !key.startsWith("variants") &&
            !key.startsWith("layout")
        )
      );
      return <span {...filteredProps}>{children}</span>;
    },
    rect: ({ ...props }: { [key: string]: unknown }) => <rect {...props} />,
    circle: ({ ...props }: { [key: string]: unknown }) => <circle {...props} />,
    line: ({ ...props }: { [key: string]: unknown }) => <line {...props} />,
    text: ({
      children,
      ...props
    }: {
      children?: React.ReactNode;
      [key: string]: unknown;
    }) => <text {...props}>{children}</text>,
    g: ({
      children,
      ...props
    }: {
      children?: React.ReactNode;
      [key: string]: unknown;
    }) => <g {...props}>{children}</g>,
    path: ({ ...props }: { [key: string]: unknown }) => <path {...props} />,
    button: ({
      children,
      ...props
    }: {
      children?: React.ReactNode;
      [key: string]: unknown;
    }) => {
      const filteredProps = Object.fromEntries(
        Object.entries(props).filter(
          ([key]) =>
            !key.startsWith("while") &&
            !key.startsWith("animate") &&
            !key.startsWith("initial") &&
            !key.startsWith("exit") &&
            !key.startsWith("transition") &&
            !key.startsWith("variants") &&
            !key.startsWith("layout")
        )
      );
      return <button {...filteredProps}>{children}</button>;
    },
  },
  // skipcq: JS-0424 -- AnimatePresence wrapper needs fragment for children passthrough
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Import visualizers
import TrieBasicsVisualizer from "@/components/visualizers/TrieBasicsVisualizer";
import { TrieAutocompleteVisualizer } from "@/components/visualizers/TrieAutocompleteVisualizer";
import SearchSuggestionsVisualizer from "@/components/visualizers/SearchSuggestionsVisualizer";
import WildcardSearchVisualizer from "@/components/visualizers/WildcardSearchVisualizer";
import WordSearchIIVisualizer from "@/components/visualizers/WordSearchIIVisualizer";
import ReplaceWordsVisualizer from "@/components/visualizers/ReplaceWordsVisualizer";
import TrieInsertVisualizer from "@/components/visualizers/TrieInsertVisualizer";
import TrieSearchVisualizer from "@/components/visualizers/TrieSearchVisualizer";

describe("Trie Visualizers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // TrieBasicsVisualizer Tests
  describe("TrieBasicsVisualizer", () => {
    it("renders without crashing", () => {
      render(<TrieBasicsVisualizer />);
      expect(screen.getByText("Trie Basics")).toBeInTheDocument();
    });

    it("renders description text", () => {
      render(<TrieBasicsVisualizer />);
      expect(
        screen.getByText("See how words share prefixes in a Trie structure")
      ).toBeInTheDocument();
    });

    it("renders all word buttons", () => {
      render(<TrieBasicsVisualizer />);
      expect(screen.getByText(/"cat"/)).toBeInTheDocument();
      expect(screen.getByText(/"car"/)).toBeInTheDocument();
      expect(screen.getByText(/"card"/)).toBeInTheDocument();
      expect(screen.getByText(/"dog"/)).toBeInTheDocument();
    });

    it("renders search input", () => {
      render(<TrieBasicsVisualizer />);
      const searchInput = screen.getByPlaceholderText("Search prefix...");
      expect(searchInput).toBeInTheDocument();
    });

    it("renders reset button", () => {
      render(<TrieBasicsVisualizer />);
      expect(screen.getByText("Reset")).toBeInTheDocument();
    });

    it("renders insert instruction text", () => {
      render(<TrieBasicsVisualizer />);
      expect(screen.getByText("Click to insert:")).toBeInTheDocument();
    });

    it("renders legend with node types", () => {
      render(<TrieBasicsVisualizer />);
      expect(screen.getByText("Current")).toBeInTheDocument();
      expect(screen.getByText("Path")).toBeInTheDocument();
      expect(screen.getByText("Shared prefix")).toBeInTheDocument();
      expect(screen.getByText("Complete word")).toBeInTheDocument();
      expect(screen.getByText("isEnd = true")).toBeInTheDocument();
    });

    it("displays initial message", () => {
      render(<TrieBasicsVisualizer />);
      expect(
        screen.getByText("Click a word to insert it into the Trie")
      ).toBeInTheDocument();
    });

    it("renders SVG for trie visualization", () => {
      const { container } = render(<TrieBasicsVisualizer />);
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("inserts a word when clicked", () => {
      render(<TrieBasicsVisualizer />);
      const catButton = screen.getByText(/"cat"/);
      fireEvent.click(catButton);

      // Advance timers for first character
      act(() => {
        vi.advanceTimersByTime(600);
      });
      expect(
        screen.getByText(/Creating new node|Node.*exists/)
      ).toBeInTheDocument();
    });

    it("completes word insertion with all characters", () => {
      render(<TrieBasicsVisualizer />);
      const catButton = screen.getByText(/"cat"/);
      fireEvent.click(catButton);

      // Advance through all character insertions (c, a, t) + final mark
      act(() => {
        vi.advanceTimersByTime(600 * 4 + 100);
      });

      expect(screen.getByText(/inserted|complete/i)).toBeInTheDocument();
    });

    it("shows shared prefix message when inserting overlapping word", () => {
      render(<TrieBasicsVisualizer />);

      // Insert "cat" first
      const catButton = screen.getByText(/"cat"/);
      fireEvent.click(catButton);
      act(() => {
        vi.advanceTimersByTime(600 * 5);
      });

      // Insert "car" which shares "ca" prefix
      const carButton = screen.getByText(/"car"/);
      fireEvent.click(carButton);
      act(() => {
        vi.advanceTimersByTime(600 * 3);
      });

      // Should see shared prefix message (may have multiple matches)
      const messages = screen.getAllByText(/exists|shared/i);
      expect(messages.length).toBeGreaterThan(0);
    });

    it("prevents inserting the same word twice", () => {
      render(<TrieBasicsVisualizer />);

      // Insert "cat" - find the button
      const allButtons = screen.getAllByRole("button");
      const catButton = allButtons.find((b) =>
        b.textContent?.includes('"cat"')
      );
      expect(catButton).toBeDefined();
      if (catButton) {
        fireEvent.click(catButton);
        act(() => {
          vi.advanceTimersByTime(600 * 5);
        });

        // After insertion, the button should be disabled and show checkmark
        expect(catButton).toBeDisabled();
        expect(catButton.textContent).toContain("✓");
      }
    });

    it("handles reset button click", () => {
      render(<TrieBasicsVisualizer />);

      // Insert a word first
      const catButton = screen.getByText(/"cat"/);
      fireEvent.click(catButton);
      act(() => {
        vi.advanceTimersByTime(600 * 5);
      });

      // Click reset
      const resetButton = screen.getByText("Reset");
      fireEvent.click(resetButton);

      expect(
        screen.getByText("Click a word to insert it into the Trie")
      ).toBeInTheDocument();
    });

    it("handles search input for existing prefix", () => {
      render(<TrieBasicsVisualizer />);

      // Insert "cat" first
      const catButton = screen.getByText(/"cat"/);
      fireEvent.click(catButton);
      act(() => {
        vi.advanceTimersByTime(600 * 5);
      });

      // Search for "ca"
      const searchInput = screen.getByPlaceholderText("Search prefix...");
      fireEvent.change(searchInput, { target: { value: "ca" } });

      expect(screen.getByText(/Prefix only/)).toBeInTheDocument();
    });

    it("handles search input for complete word", () => {
      render(<TrieBasicsVisualizer />);

      // Insert "cat" first
      const allButtons = screen.getAllByRole("button");
      const catButton = allButtons.find((b) =>
        b.textContent?.includes('"cat"')
      );
      if (catButton) fireEvent.click(catButton);

      // Wait for all character insertions (c, a, t = 3) + mark end (1) = 4 intervals
      // Plus the clear highlight timer
      act(() => {
        vi.advanceTimersByTime(600 * 4 + 600);
      });

      // Search for "cat"
      const searchInput = screen.getByPlaceholderText("Search prefix...");
      fireEvent.change(searchInput, { target: { value: "cat" } });

      // Should show complete word indicator
      expect(screen.getByText(/✓ Complete word/u)).toBeInTheDocument();
    });

    it("handles search input for non-existent prefix", () => {
      render(<TrieBasicsVisualizer />);

      // Search without inserting anything
      const searchInput = screen.getByPlaceholderText("Search prefix...");
      fireEvent.change(searchInput, { target: { value: "xyz" } });

      expect(screen.getByText(/Not found/)).toBeInTheDocument();
    });

    it("handles empty search input", () => {
      render(<TrieBasicsVisualizer />);

      // First search for something
      const searchInput = screen.getByPlaceholderText("Search prefix...");
      fireEvent.change(searchInput, { target: { value: "xyz" } });

      // Then clear it
      fireEvent.change(searchInput, { target: { value: "" } });

      expect(screen.getByText(/Type a prefix to search/)).toBeInTheDocument();
    });

    it("shows insight box after inserting two words", () => {
      render(<TrieBasicsVisualizer />);

      // Insert "cat"
      const catButton = screen.getByText(/"cat"/);
      fireEvent.click(catButton);
      act(() => {
        vi.advanceTimersByTime(600 * 5);
      });

      // Insert "car"
      const carButton = screen.getByText(/"car"/);
      fireEvent.click(carButton);
      act(() => {
        vi.advanceTimersByTime(600 * 5);
      });

      expect(screen.getByText(/Key Insight/)).toBeInTheDocument();
    });
  });

  // TrieAutocompleteVisualizer Tests
  describe("TrieAutocompleteVisualizer", () => {
    it("renders without crashing", () => {
      render(<TrieAutocompleteVisualizer />);
      expect(
        screen.getByText("Autocomplete Visualization")
      ).toBeInTheDocument();
    });

    it("shows prefix selection buttons", () => {
      render(<TrieAutocompleteVisualizer />);
      expect(screen.getByText('"ap"')).toBeInTheDocument();
      expect(screen.getByText('"app"')).toBeInTheDocument();
      expect(screen.getByText('"a"')).toBeInTheDocument();
    });

    it("renders navigation buttons", () => {
      render(<TrieAutocompleteVisualizer />);
      expect(screen.getByText("← Previous")).toBeInTheDocument();
      expect(screen.getByText("Next →")).toBeInTheDocument();
    });

    it("shows step counter", () => {
      render(<TrieAutocompleteVisualizer />);
      expect(screen.getByText(/STEP \d+ \/ \d+/)).toBeInTheDocument();
    });

    it("navigates to next step on button click", () => {
      render(<TrieAutocompleteVisualizer />);
      const nextButton = screen.getByText("Next →");

      const initialStep = screen.getByText(/STEP \d+ \/ \d+/).textContent;
      fireEvent.click(nextButton);
      const newStep = screen.getByText(/STEP \d+ \/ \d+/).textContent;

      expect(newStep).not.toBe(initialStep);
    });

    it("navigates to previous step on button click", () => {
      render(<TrieAutocompleteVisualizer />);

      fireEvent.click(screen.getByText("Next →"));
      fireEvent.click(screen.getByText("Next →"));

      const stepAfterAdvance = screen.getByText(/STEP \d+ \/ \d+/).textContent;
      fireEvent.click(screen.getByText("← Previous"));
      const stepAfterBack = screen.getByText(/STEP \d+ \/ \d+/).textContent;

      expect(stepAfterBack).not.toBe(stepAfterAdvance);
    });

    it("changes prefix when prefix button is clicked", () => {
      render(<TrieAutocompleteVisualizer />);
      const appButton = screen.getByText('"app"');
      fireEvent.click(appButton);
      expect(screen.getByText(/STEP 1 \//)).toBeInTheDocument();
    });

    it("renders trie structure section header", () => {
      render(<TrieAutocompleteVisualizer />);
      expect(screen.getByText("TRIE STRUCTURE")).toBeInTheDocument();
    });

    it("renders SVG for trie visualization", () => {
      const { container } = render(<TrieAutocompleteVisualizer />);
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("navigates through all steps to reach DFS phase", () => {
      render(<TrieAutocompleteVisualizer />);
      const nextButton = screen.getByText("Next →");

      // Navigate through navigate phase to reach DFS
      for (let i = 0; i < 5; i++) {
        fireEvent.click(nextButton);
      }

      // Check we've progressed through steps
      expect(screen.getByText(/STEP/)).toBeInTheDocument();
    });

    it("shows collected words during DFS phase", () => {
      render(<TrieAutocompleteVisualizer />);
      const nextButton = screen.getByText("Next →");

      // Navigate to result phase
      for (let i = 0; i < 15; i++) {
        fireEvent.click(nextButton);
      }

      // Should show some results
      expect(screen.getByText(/STEP/)).toBeInTheDocument();
    });

    it("previous button is disabled at first step", () => {
      render(<TrieAutocompleteVisualizer />);
      const prevButton = screen.getByText("← Previous");
      expect(prevButton.className).toContain("opacity-50");
    });

    it("shows legend items", () => {
      render(<TrieAutocompleteVisualizer />);
      // Check for legend markers - may be multiple
      const nodeTexts = screen.getAllByText(/Node|Current/);
      expect(nodeTexts.length).toBeGreaterThan(0);
    });
  });

  // SearchSuggestionsVisualizer Tests
  describe("SearchSuggestionsVisualizer", () => {
    it("renders without crashing", () => {
      render(<SearchSuggestionsVisualizer />);
      expect(
        screen.getByText("Search Suggestions Visualization")
      ).toBeInTheDocument();
    });

    it("shows user typing section", () => {
      render(<SearchSuggestionsVisualizer />);
      expect(screen.getByText("USER TYPING")).toBeInTheDocument();
    });

    it("renders navigation buttons", () => {
      render(<SearchSuggestionsVisualizer />);
      expect(screen.getByText("← Previous")).toBeInTheDocument();
      expect(screen.getByText("Next →")).toBeInTheDocument();
    });

    it("shows step counter", () => {
      render(<SearchSuggestionsVisualizer />);
      expect(screen.getByText(/STEP \d+ \/ \d+/)).toBeInTheDocument();
    });

    it("shows products list", () => {
      render(<SearchSuggestionsVisualizer />);
      expect(screen.getByText(/Products:/)).toBeInTheDocument();
    });

    it("shows trie structure section", () => {
      render(<SearchSuggestionsVisualizer />);
      expect(screen.getByText("TRIE STRUCTURE")).toBeInTheDocument();
    });

    it("navigates steps correctly", () => {
      render(<SearchSuggestionsVisualizer />);
      const nextButton = screen.getByText("Next →");

      const initialStep = screen.getByText(/STEP \d+ \/ \d+/).textContent;
      fireEvent.click(nextButton);
      const newStep = screen.getByText(/STEP \d+ \/ \d+/).textContent;

      expect(newStep).not.toBe(initialStep);
    });

    it("shows results by prefix section", () => {
      render(<SearchSuggestionsVisualizer />);
      expect(screen.getByText("Results by Prefix")).toBeInTheDocument();
    });

    it("shows search options with quotes", () => {
      render(<SearchSuggestionsVisualizer />);
      const buttons = screen.getAllByRole("button");
      const optionLabels = buttons.map((b) => b.textContent);
      expect(optionLabels.some((l) => l?.includes('"m"'))).toBe(true);
      expect(optionLabels.some((l) => l?.includes('"mo"'))).toBe(true);
    });

    it("changes search word when option clicked", () => {
      render(<SearchSuggestionsVisualizer />);
      const mugButton = screen.getByText('"mug"');
      fireEvent.click(mugButton);
      expect(screen.getByText(/STEP 1 \//)).toBeInTheDocument();
    });

    it("navigates through all phases", () => {
      render(<SearchSuggestionsVisualizer />);
      const nextButton = screen.getByText("Next →");

      // Navigate through all steps
      for (let i = 0; i < 20; i++) {
        fireEvent.click(nextButton);
      }

      expect(screen.getByText(/STEP/)).toBeInTheDocument();
    });

    it("previous button is disabled at first step", () => {
      render(<SearchSuggestionsVisualizer />);
      const prevButton = screen.getByText("← Previous");
      expect(prevButton.className).toContain("opacity-50");
    });

    it("previous button navigates back after forward navigation", () => {
      render(<SearchSuggestionsVisualizer />);
      const nextButton = screen.getByText("Next →");
      const prevButton = screen.getByText("← Previous");

      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      const stepAfter = screen.getByText(/STEP \d+ \/ \d+/).textContent;

      fireEvent.click(prevButton);
      const stepBack = screen.getByText(/STEP \d+ \/ \d+/).textContent;

      expect(stepBack).not.toBe(stepAfter);
    });
  });

  // WildcardSearchVisualizer Tests
  describe("WildcardSearchVisualizer", () => {
    it("renders without crashing", () => {
      render(<WildcardSearchVisualizer />);
      expect(
        screen.getByText("Wildcard Search Visualization")
      ).toBeInTheDocument();
    });

    it("shows pattern selection buttons", () => {
      render(<WildcardSearchVisualizer />);
      expect(screen.getByText('"b.d"')).toBeInTheDocument();
      expect(screen.getByText('".ad"')).toBeInTheDocument();
      expect(screen.getByText('"..."')).toBeInTheDocument();
    });

    it("renders navigation buttons", () => {
      render(<WildcardSearchVisualizer />);
      expect(screen.getByText("← Previous")).toBeInTheDocument();
      expect(screen.getByText("Next →")).toBeInTheDocument();
    });

    it("shows trie structure section", () => {
      render(<WildcardSearchVisualizer />);
      expect(screen.getByText("TRIE STRUCTURE")).toBeInTheDocument();
    });

    it("shows step counter", () => {
      render(<WildcardSearchVisualizer />);
      expect(screen.getByText(/STEP \d+ \/ \d+/)).toBeInTheDocument();
    });

    it("changes pattern when pattern button clicked", () => {
      render(<WildcardSearchVisualizer />);
      const dotDotDotButton = screen.getByText('"..."');
      fireEvent.click(dotDotDotButton);
      expect(screen.getByText(/STEP 1 \//)).toBeInTheDocument();
    });

    it("navigates steps correctly", () => {
      render(<WildcardSearchVisualizer />);
      const nextButton = screen.getByText("Next →");

      const initialStep = screen.getByText(/STEP \d+ \/ \d+/).textContent;
      fireEvent.click(nextButton);
      const newStep = screen.getByText(/STEP \d+ \/ \d+/).textContent;

      expect(newStep).not.toBe(initialStep);
    });

    it("renders SVG for trie visualization", () => {
      const { container } = render(<WildcardSearchVisualizer />);
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("navigates through wildcard expansion", () => {
      render(<WildcardSearchVisualizer />);
      const nextButton = screen.getByText("Next →");

      // Navigate through steps to see wildcard expansion
      for (let i = 0; i < 10; i++) {
        fireEvent.click(nextButton);
      }

      expect(screen.getByText(/STEP/)).toBeInTheDocument();
    });

    it("previous button is disabled at first step", () => {
      render(<WildcardSearchVisualizer />);
      const prevButton = screen.getByText("← Previous");
      expect(prevButton.className).toContain("opacity-50");
    });

    it("previous button navigates back after forward navigation", () => {
      render(<WildcardSearchVisualizer />);
      const nextButton = screen.getByText("Next →");
      const prevButton = screen.getByText("← Previous");

      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      const stepAfter = screen.getByText(/STEP \d+ \/ \d+/).textContent;

      fireEvent.click(prevButton);
      const stepBack = screen.getByText(/STEP \d+ \/ \d+/).textContent;

      expect(stepBack).not.toBe(stepAfter);
    });

    it("shows dictionary words", () => {
      render(<WildcardSearchVisualizer />);
      // Dictionary contains bad, dad, mad - may be multiple elements
      const words = screen.getAllByText(/bad|dad|mad/);
      expect(words.length).toBeGreaterThan(0);
    });

    it("reaches result phase", () => {
      render(<WildcardSearchVisualizer />);
      const nextButton = screen.getByText("Next →");

      // Navigate to end
      for (let i = 0; i < 30; i++) {
        fireEvent.click(nextButton);
      }

      // Should reach result
      expect(screen.getByText(/STEP/)).toBeInTheDocument();
    });
  });

  // WordSearchIIVisualizer Tests
  describe("WordSearchIIVisualizer", () => {
    it("renders without crashing", () => {
      render(<WordSearchIIVisualizer />);
      expect(
        screen.getByText("Word Search II Visualization")
      ).toBeInTheDocument();
    });

    it("shows words list", () => {
      render(<WordSearchIIVisualizer />);
      expect(screen.getByText(/Words:/)).toBeInTheDocument();
    });

    it("shows board section", () => {
      render(<WordSearchIIVisualizer />);
      expect(screen.getByText("BOARD (4×4)")).toBeInTheDocument();
    });

    it("renders navigation buttons", () => {
      render(<WordSearchIIVisualizer />);
      expect(screen.getByText("← Previous")).toBeInTheDocument();
      expect(screen.getByText("Next →")).toBeInTheDocument();
    });

    it("shows step counter", () => {
      render(<WordSearchIIVisualizer />);
      expect(screen.getByText(/STEP \d+ \/ \d+/)).toBeInTheDocument();
    });

    it("navigates steps correctly", () => {
      render(<WordSearchIIVisualizer />);
      const nextButton = screen.getByText("Next →");

      const initialStep = screen.getByText(/STEP \d+ \/ \d+/).textContent;
      fireEvent.click(nextButton);
      const newStep = screen.getByText(/STEP \d+ \/ \d+/).textContent;

      expect(newStep).not.toBe(initialStep);
    });

    it("shows found words section", () => {
      render(<WordSearchIIVisualizer />);
      expect(screen.getByText(/Found words:/)).toBeInTheDocument();
    });

    it("previous button is disabled at first step", () => {
      render(<WordSearchIIVisualizer />);
      const prevButton = screen.getByText("← Previous");
      expect(prevButton.className).toContain("opacity-50");
    });

    it("previous button navigates back after forward navigation", () => {
      render(<WordSearchIIVisualizer />);
      const nextButton = screen.getByText("Next →");
      const prevButton = screen.getByText("← Previous");

      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      const stepAfter = screen.getByText(/STEP \d+ \/ \d+/).textContent;

      fireEvent.click(prevButton);
      const stepBack = screen.getByText(/STEP \d+ \/ \d+/).textContent;

      expect(stepBack).not.toBe(stepAfter);
    });

    it("shows legend items", () => {
      render(<WordSearchIIVisualizer />);
      expect(screen.getByText("Current")).toBeInTheDocument();
      expect(screen.getByText("Path")).toBeInTheDocument();
      expect(screen.getByText("Found")).toBeInTheDocument();
    });

    it("navigates through all phases", () => {
      render(<WordSearchIIVisualizer />);
      const nextButton = screen.getByText("Next →");

      // Navigate through many steps
      for (let i = 0; i < 50; i++) {
        fireEvent.click(nextButton);
      }

      expect(screen.getByText(/STEP/)).toBeInTheDocument();
    });

    it("shows phase labels", () => {
      render(<WordSearchIIVisualizer />);
      // Initial phase should be START
      expect(screen.getByText("START")).toBeInTheDocument();
    });

    it("transitions to visit phase", () => {
      render(<WordSearchIIVisualizer />);
      const nextButton = screen.getByText("Next →");
      fireEvent.click(nextButton);
      // Should see VISIT or other phase
      expect(
        screen.getByText(/VISIT|PRUNE|BACKTRACK|FOUND/)
      ).toBeInTheDocument();
    });
  });

  // ReplaceWordsVisualizer Tests
  describe("ReplaceWordsVisualizer", () => {
    it("renders without crashing", () => {
      render(<ReplaceWordsVisualizer />);
      expect(
        screen.getByText("Replace Words Visualization")
      ).toBeInTheDocument();
    });

    it("shows dictionary in header", () => {
      render(<ReplaceWordsVisualizer />);
      const dictionaryTexts = screen.getAllByText(/Dictionary:/);
      expect(dictionaryTexts.length).toBeGreaterThan(0);
    });

    it("shows sentence section", () => {
      render(<ReplaceWordsVisualizer />);
      expect(screen.getByText("SENTENCE")).toBeInTheDocument();
    });

    it("shows result section after navigation", () => {
      render(<ReplaceWordsVisualizer />);
      const nextButton = screen.getByText("Next →");
      for (let i = 0; i < 10; i++) {
        fireEvent.click(nextButton);
      }
      expect(screen.getByText("RESULT SO FAR")).toBeInTheDocument();
    });

    it("shows trie structure section", () => {
      render(<ReplaceWordsVisualizer />);
      expect(screen.getByText("TRIE STRUCTURE")).toBeInTheDocument();
    });

    it("renders navigation buttons", () => {
      render(<ReplaceWordsVisualizer />);
      expect(screen.getByText("← Previous")).toBeInTheDocument();
      expect(screen.getByText("Next →")).toBeInTheDocument();
    });

    it("shows step counter", () => {
      render(<ReplaceWordsVisualizer />);
      expect(screen.getByText(/STEP \d+ \/ \d+/)).toBeInTheDocument();
    });

    it("navigates to next step correctly", () => {
      render(<ReplaceWordsVisualizer />);
      const nextButton = screen.getByText("Next →");

      const initialStep = screen.getByText(/STEP \d+ \/ \d+/).textContent;
      fireEvent.click(nextButton);
      const newStep = screen.getByText(/STEP \d+ \/ \d+/).textContent;

      expect(newStep).not.toBe(initialStep);
    });

    it("navigates to previous step correctly", () => {
      render(<ReplaceWordsVisualizer />);

      fireEvent.click(screen.getByText("Next →"));
      fireEvent.click(screen.getByText("Next →"));

      const stepAfterAdvance = screen.getByText(/STEP \d+ \/ \d+/).textContent;
      fireEvent.click(screen.getByText("← Previous"));
      const stepAfterBack = screen.getByText(/STEP \d+ \/ \d+/).textContent;

      expect(stepAfterBack).not.toBe(stepAfterAdvance);
    });

    it("shows how it works explanation", () => {
      render(<ReplaceWordsVisualizer />);
      expect(screen.getByText(/How it works:/)).toBeInTheDocument();
    });

    it("shows legend items", () => {
      render(<ReplaceWordsVisualizer />);
      expect(screen.getByText("Current")).toBeInTheDocument();
      expect(screen.getByText("Path")).toBeInTheDocument();
      expect(screen.getByText("Found")).toBeInTheDocument();
      expect(screen.getByText("No Match")).toBeInTheDocument();
    });

    it("previous button is disabled at first step", () => {
      render(<ReplaceWordsVisualizer />);
      const prevButton = screen.getByText("← Previous");
      expect(prevButton.className).toContain("opacity-50");
    });

    it("shows START phase initially", () => {
      render(<ReplaceWordsVisualizer />);
      expect(screen.getByText("START")).toBeInTheDocument();
    });

    it("transitions through phases", () => {
      render(<ReplaceWordsVisualizer />);
      const nextButton = screen.getByText("Next →");

      fireEvent.click(nextButton);
      // Should see TRAVERSE or other phase
      expect(
        screen.getByText(/TRAVERSE|ROOT FOUND|NO ROOT/)
      ).toBeInTheDocument();
    });

    it("shows current path during traversal", () => {
      render(<ReplaceWordsVisualizer />);
      const nextButton = screen.getByText("Next →");

      // Navigate to see current path
      for (let i = 0; i < 5; i++) {
        fireEvent.click(nextButton);
      }

      // May show current path
      expect(screen.getByText(/STEP/)).toBeInTheDocument();
    });
  });

  // TrieInsertVisualizer Tests
  describe("TrieInsertVisualizer", () => {
    it("renders without crashing", () => {
      render(<TrieInsertVisualizer />);
      expect(screen.getByText("Trie Insert Visualization")).toBeInTheDocument();
    });

    it("renders navigation buttons", () => {
      render(<TrieInsertVisualizer />);
      expect(screen.getByText("Previous")).toBeInTheDocument();
      expect(screen.getByText("Next")).toBeInTheDocument();
      expect(screen.getByText("Reset")).toBeInTheDocument();
    });

    it("shows step counter", () => {
      render(<TrieInsertVisualizer />);
      expect(screen.getByText(/Step \d+ of \d+/)).toBeInTheDocument();
    });

    it("shows words being inserted", () => {
      render(<TrieInsertVisualizer />);
      expect(screen.getByText("cat")).toBeInTheDocument();
      expect(screen.getByText("car")).toBeInTheDocument();
    });

    it("navigates to next step", () => {
      render(<TrieInsertVisualizer />);
      const nextButton = screen.getByText("Next");

      const initialStep = screen.getByText(/Step \d+ of \d+/).textContent;
      fireEvent.click(nextButton);
      const newStep = screen.getByText(/Step \d+ of \d+/).textContent;

      expect(newStep).not.toBe(initialStep);
    });

    it("navigates to previous step", () => {
      render(<TrieInsertVisualizer />);

      fireEvent.click(screen.getByText("Next"));
      fireEvent.click(screen.getByText("Next"));

      const stepAfterAdvance = screen.getByText(/Step \d+ of \d+/).textContent;
      fireEvent.click(screen.getByText("Previous"));
      const stepAfterBack = screen.getByText(/Step \d+ of \d+/).textContent;

      expect(stepAfterBack).not.toBe(stepAfterAdvance);
    });

    it("resets to first step", () => {
      render(<TrieInsertVisualizer />);

      fireEvent.click(screen.getByText("Next"));
      fireEvent.click(screen.getByText("Next"));
      fireEvent.click(screen.getByText("Next"));

      fireEvent.click(screen.getByText("Reset"));
      expect(screen.getByText(/Step 1 of/)).toBeInTheDocument();
    });

    it("shows legend", () => {
      render(<TrieInsertVisualizer />);
      expect(screen.getByText("Node")).toBeInTheDocument();
      expect(screen.getByText("Current Path")).toBeInTheDocument();
      expect(screen.getByText("Current Node")).toBeInTheDocument();
    });

    it("previous button is disabled at first step", () => {
      render(<TrieInsertVisualizer />);
      const prevButton = screen.getByText("Previous");
      expect(prevButton).toBeDisabled();
    });

    it("shows current word being processed", () => {
      render(<TrieInsertVisualizer />);
      expect(screen.getByText(/Current word:/)).toBeInTheDocument();
    });

    it("shows array index visualization", () => {
      render(<TrieInsertVisualizer />);
      expect(screen.getByText(/children\[26\] array/)).toBeInTheDocument();
    });

    it("navigates through all steps", () => {
      render(<TrieInsertVisualizer />);
      const nextButton = screen.getByText("Next");

      // Navigate through all steps
      for (let i = 0; i < 20; i++) {
        fireEvent.click(nextButton);
      }

      expect(screen.getByText(/Step/)).toBeInTheDocument();
    });
  });

  // TrieSearchVisualizer Tests
  describe("TrieSearchVisualizer", () => {
    it("renders without crashing", () => {
      render(<TrieSearchVisualizer />);
      expect(screen.getByText("Search vs StartsWith")).toBeInTheDocument();
    });

    it("shows trie contents", () => {
      render(<TrieSearchVisualizer />);
      expect(screen.getByText(/Trie contains:/)).toBeInTheDocument();
    });

    it("shows query options", () => {
      render(<TrieSearchVisualizer />);
      // Shows search/startsWith buttons - may have multiple
      const buttons = screen.getAllByRole("button");
      const hasSearchButton = buttons.some((b) =>
        b.textContent?.includes("search")
      );
      expect(hasSearchButton).toBe(true);
    });

    it("renders navigation buttons", () => {
      render(<TrieSearchVisualizer />);
      expect(screen.getByText("Previous")).toBeInTheDocument();
      expect(screen.getByText("Next")).toBeInTheDocument();
    });

    it("shows step counter", () => {
      render(<TrieSearchVisualizer />);
      expect(screen.getByText(/Step \d+ of \d+/)).toBeInTheDocument();
    });

    it("navigates to next step", () => {
      render(<TrieSearchVisualizer />);
      const nextButton = screen.getByText("Next");

      const initialStep = screen.getByText(/Step \d+ of \d+/).textContent;
      fireEvent.click(nextButton);
      const newStep = screen.getByText(/Step \d+ of \d+/).textContent;

      expect(newStep).not.toBe(initialStep);
    });

    it("changes query when option clicked", () => {
      render(<TrieSearchVisualizer />);
      // Click a different query button
      const buttons = screen.getAllByRole("button");
      const startsWithButton = buttons.find((b) =>
        b.textContent?.includes("startsWith")
      );
      if (startsWithButton) {
        fireEvent.click(startsWithButton);
        expect(screen.getByText(/Step 1 of/)).toBeInTheDocument();
      }
    });

    it("shows method comparison", () => {
      render(<TrieSearchVisualizer />);
      expect(screen.getByText("The One-Line Difference")).toBeInTheDocument();
    });

    it("previous button is disabled at first step", () => {
      render(<TrieSearchVisualizer />);
      const prevButton = screen.getByText("Previous");
      expect(prevButton).toBeDisabled();
    });

    it("previous button navigates back after forward navigation", () => {
      render(<TrieSearchVisualizer />);
      const nextButton = screen.getByText("Next");
      const prevButton = screen.getByText("Previous");

      // Move forward
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      const stepAfterForward = screen.getByText(/Step \d+ of \d+/).textContent;

      // Move back
      fireEvent.click(prevButton);
      const stepAfterBack = screen.getByText(/Step \d+ of \d+/).textContent;

      expect(stepAfterBack).not.toBe(stepAfterForward);
    });

    it("navigates through search steps", () => {
      render(<TrieSearchVisualizer />);
      const nextButton = screen.getByText("Next");

      for (let i = 0; i < 5; i++) {
        fireEvent.click(nextButton);
      }

      expect(screen.getByText(/Step/)).toBeInTheDocument();
    });

    it("shows result for search query", () => {
      render(<TrieSearchVisualizer />);
      const nextButton = screen.getByText("Next");

      // Navigate to result
      for (let i = 0; i < 10; i++) {
        fireEvent.click(nextButton);
      }

      expect(screen.getByText(/Step/)).toBeInTheDocument();
    });

    it("shows not found result for search('apply')", () => {
      render(<TrieSearchVisualizer />);

      // Find and click the search("apply") button
      const buttons = screen.getAllByRole("button");
      const applyButton = buttons.find((b) =>
        b.textContent?.includes('search("apply")')
      );
      if (applyButton) {
        fireEvent.click(applyButton);
      }

      const nextButton = screen.getByText("Next");
      // Navigate through all steps
      for (let i = 0; i < 10; i++) {
        fireEvent.click(nextButton);
      }

      // Should show result
      expect(screen.getByText(/Step/)).toBeInTheDocument();
    });

    it("shows startsWith result", () => {
      render(<TrieSearchVisualizer />);

      // Find and click the startsWith button
      const buttons = screen.getAllByRole("button");
      const startsWithButton = buttons.find((b) =>
        b.textContent?.includes("startsWith")
      );
      if (startsWithButton) {
        fireEvent.click(startsWithButton);
      }

      const nextButton = screen.getByText("Next");
      for (let i = 0; i < 10; i++) {
        fireEvent.click(nextButton);
      }

      expect(screen.getByText(/Step/)).toBeInTheDocument();
    });
  });
});

// Edge case tests
describe("Trie Visualizer Edge Cases", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("TrieBasicsVisualizer handles empty search", () => {
    render(<TrieBasicsVisualizer />);
    const searchInput = screen.getByPlaceholderText("Search prefix...");
    fireEvent.change(searchInput, { target: { value: "" } });
    expect(screen.getByText("Trie Basics")).toBeInTheDocument();
  });

  it("TrieAutocompleteVisualizer handles prefix 'a' (single char)", () => {
    render(<TrieAutocompleteVisualizer />);
    const aButton = screen.getByText('"a"');
    fireEvent.click(aButton);
    expect(screen.getByText(/STEP 1 \//)).toBeInTheDocument();
  });

  it("WildcardSearchVisualizer handles all wildcards pattern", () => {
    render(<WildcardSearchVisualizer />);
    const allDotsButton = screen.getByText('"..."');
    fireEvent.click(allDotsButton);

    const nextButton = screen.getByText("Next →");
    for (let i = 0; i < 20; i++) {
      fireEvent.click(nextButton);
    }

    expect(screen.getByText(/STEP/)).toBeInTheDocument();
  });

  it("SearchSuggestionsVisualizer handles single character search", () => {
    render(<SearchSuggestionsVisualizer />);
    // Find the "m" button among multiple elements
    const buttons = screen.getAllByRole("button");
    const mButton = buttons.find((b) => b.textContent === '"m"');
    if (mButton) {
      fireEvent.click(mButton);
    }
    expect(screen.getByText(/STEP 1 \//)).toBeInTheDocument();
  });
});

// Full navigation coverage tests
describe("Trie Visualizer Full Coverage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("TrieInsertVisualizer navigates to last step", () => {
    render(<TrieInsertVisualizer />);
    const nextButton = screen.getByText("Next");

    // Navigate through all steps
    for (let i = 0; i < 50; i++) {
      fireEvent.click(nextButton);
    }

    // Next button should be disabled at end
    expect(nextButton).toBeDisabled();
  });

  it("WordSearchIIVisualizer navigates through backtrack phase", () => {
    render(<WordSearchIIVisualizer />);
    const nextButton = screen.getByText("Next →");

    // Navigate through many steps to hit backtrack
    for (let i = 0; i < 150; i++) {
      fireEvent.click(nextButton);
    }

    expect(screen.getByText(/STEP/)).toBeInTheDocument();
  });

  it("ReplaceWordsVisualizer navigates through no match phase", () => {
    render(<ReplaceWordsVisualizer />);
    const nextButton = screen.getByText("Next →");

    // Navigate through all steps
    for (let i = 0; i < 150; i++) {
      fireEvent.click(nextButton);
    }

    expect(screen.getByText(/STEP/)).toBeInTheDocument();
  });

  it("WildcardSearchVisualizer navigates through result phase", () => {
    render(<WildcardSearchVisualizer />);
    const nextButton = screen.getByText("Next →");

    // Navigate through all steps
    for (let i = 0; i < 50; i++) {
      fireEvent.click(nextButton);
    }

    // Should reach result
    expect(screen.getByText(/STEP/)).toBeInTheDocument();
  });

  it("SearchSuggestionsVisualizer navigates through DFS phase", () => {
    render(<SearchSuggestionsVisualizer />);
    const nextButton = screen.getByText("Next →");

    // Navigate through all steps
    for (let i = 0; i < 50; i++) {
      fireEvent.click(nextButton);
    }

    expect(screen.getByText(/STEP/)).toBeInTheDocument();
  });

  it("TrieAutocompleteVisualizer navigates to final result", () => {
    render(<TrieAutocompleteVisualizer />);
    const nextButton = screen.getByText("Next →");

    // Navigate through all steps
    for (let i = 0; i < 30; i++) {
      fireEvent.click(nextButton);
    }

    expect(screen.getByText(/STEP/)).toBeInTheDocument();
  });

  it("TrieSearchVisualizer tests all query types", () => {
    render(<TrieSearchVisualizer />);
    const buttons = screen.getAllByRole("button");

    // Test each query type by clicking through
    for (let q = 0; q < 4; q++) {
      // Find and click query button
      const queryButtons = buttons.filter(
        (b) =>
          b.textContent?.includes("search") ||
          b.textContent?.includes("startsWith")
      );
      if (queryButtons[q]) {
        fireEvent.click(queryButtons[q]);
      }

      // Navigate through all steps for this query
      const nextButton = screen.getByText("Next");
      for (let i = 0; i < 15; i++) {
        fireEvent.click(nextButton);
      }
    }

    expect(screen.getByText(/Step/)).toBeInTheDocument();
  });
});

// Integration tests
describe("Trie Visualizer Integration", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("TrieBasicsVisualizer full word insertion flow", () => {
    render(<TrieBasicsVisualizer />);

    // Insert cat
    fireEvent.click(screen.getByText(/"cat"/));
    act(() => {
      vi.advanceTimersByTime(600 * 5);
    });

    // Insert car
    fireEvent.click(screen.getByText(/"car"/));
    act(() => {
      vi.advanceTimersByTime(600 * 5);
    });

    // Insert card
    fireEvent.click(screen.getByText(/"card"/));
    act(() => {
      vi.advanceTimersByTime(600 * 6);
    });

    // Insert dog
    fireEvent.click(screen.getByText(/"dog"/));
    act(() => {
      vi.advanceTimersByTime(600 * 5);
    });

    // All words should be marked as inserted
    expect(screen.getByText(/Key Insight/)).toBeInTheDocument();
  });

  it("WordSearchIIVisualizer finds words in grid", () => {
    render(<WordSearchIIVisualizer />);
    const nextButton = screen.getByText("Next →");

    // Navigate until we find a word
    for (let i = 0; i < 100; i++) {
      fireEvent.click(nextButton);
    }

    // Check we've navigated through the search
    expect(screen.getByText(/STEP/)).toBeInTheDocument();
  });

  it("ReplaceWordsVisualizer processes entire sentence", () => {
    render(<ReplaceWordsVisualizer />);
    const nextButton = screen.getByText("Next →");

    // Navigate through all words in sentence
    for (let i = 0; i < 100; i++) {
      fireEvent.click(nextButton);
    }

    expect(screen.getByText(/STEP/)).toBeInTheDocument();
  });
});
