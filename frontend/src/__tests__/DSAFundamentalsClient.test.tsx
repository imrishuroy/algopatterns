import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DSAFundamentalsClient from "@/app/dsa-fundamentals/DSAFundamentalsClient";
import type { Concept } from "@/types";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("@/contexts/LanguageContext", () => ({
  useLanguage: () => ({
    language: "java",
    setLanguage: vi.fn(),
  }),
}));

const mockConcepts: Concept[] = [
  {
    id: "priority-queue-heap",
    name: "Priority Queue & Heap",
    slug: "priority-queue-heap",
    category: "Data Structures",
    description: "A Priority Queue is an abstract data type.",
    whenToUse: ["Finding K largest/smallest elements"],
    codeSnippets: {
      java: "PriorityQueue<Integer> pq = new PriorityQueue<>();",
      python: "import heapq",
      cpp: "priority_queue<int> pq;",
      javascript: "class MinHeap { }",
    },
    keyPoints: ["Java PriorityQueue is a MIN heap by default"],
    relatedProblems: ["Top K Frequent Elements"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "hashmap-operations",
    name: "HashMap Operations",
    slug: "hashmap-operations",
    category: "Collections & Maps",
    description: "HashMap provides O(1) average time for get/put operations.",
    whenToUse: ["Fast key-value lookups"],
    codeSnippets: {
      java: "Map<String, Integer> map = new HashMap<>();",
      python: "d = {}",
      cpp: "unordered_map<string, int> m;",
      javascript: "const map = new Map();",
    },
    keyPoints: ["Average O(1) operations"],
    relatedProblems: ["Two Sum"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "binary-search-boundaries",
    name: "Binary Search Boundaries",
    slug: "binary-search-boundaries",
    category: "Algorithm Idioms",
    description: "Finding left and right boundaries using binary search.",
    whenToUse: ["Finding first/last occurrence"],
    codeSnippets: {
      java: "int left = 0, right = n - 1;",
      python: "left, right = 0, n - 1",
      cpp: "int left = 0, right = n - 1;",
      javascript: "let left = 0, right = n - 1;",
    },
    keyPoints: ["Handle boundary conditions carefully"],
    relatedProblems: ["Search Insert Position"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];

const mockCategories = [
  "Data Structures",
  "Collections & Maps",
  "Algorithm Idioms",
];

describe("DSAFundamentalsClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders page title", () => {
    render(
      <DSAFundamentalsClient
        concepts={mockConcepts}
        categories={mockCategories}
      />
    );

    expect(screen.getByText("DSA Fundamentals")).toBeInTheDocument();
  });

  it("renders subtitle", () => {
    render(
      <DSAFundamentalsClient
        concepts={mockConcepts}
        categories={mockCategories}
      />
    );

    expect(
      screen.getByText(
        "Essential concepts and code snippets for coding interviews"
      )
    ).toBeInTheDocument();
  });

  it("renders all concept cards", () => {
    render(
      <DSAFundamentalsClient
        concepts={mockConcepts}
        categories={mockCategories}
      />
    );

    expect(screen.getByText("Priority Queue & Heap")).toBeInTheDocument();
    expect(screen.getByText("HashMap Operations")).toBeInTheDocument();
    expect(screen.getByText("Binary Search Boundaries")).toBeInTheDocument();
  });

  it("renders category headers in grouped view", () => {
    render(
      <DSAFundamentalsClient
        concepts={mockConcepts}
        categories={mockCategories}
      />
    );

    const categoryHeaders = screen.getAllByRole("heading", { level: 2 });
    const headerTexts = categoryHeaders.map((h) => h.textContent);

    expect(headerTexts.some((t) => t?.includes("Data Structures"))).toBe(true);
    expect(headerTexts.some((t) => t?.includes("Collections & Maps"))).toBe(
      true
    );
    expect(headerTexts.some((t) => t?.includes("Algorithm Idioms"))).toBe(true);
  });

  it("renders language selector", () => {
    render(
      <DSAFundamentalsClient
        concepts={mockConcepts}
        categories={mockCategories}
      />
    );

    expect(screen.getByText("Java")).toBeInTheDocument();
    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(screen.getByText("C++")).toBeInTheDocument();
    expect(screen.getByText("JavaScript")).toBeInTheDocument();
  });

  it("renders search input", () => {
    render(
      <DSAFundamentalsClient
        concepts={mockConcepts}
        categories={mockCategories}
      />
    );

    expect(
      screen.getByPlaceholderText("Search concepts...")
    ).toBeInTheDocument();
  });

  it("renders category filter dropdown", () => {
    render(
      <DSAFundamentalsClient
        concepts={mockConcepts}
        categories={mockCategories}
      />
    );

    expect(screen.getByText("All Categories")).toBeInTheDocument();
  });

  it("filters concepts by search query", () => {
    render(
      <DSAFundamentalsClient
        concepts={mockConcepts}
        categories={mockCategories}
      />
    );

    const searchInput = screen.getByPlaceholderText("Search concepts...");
    fireEvent.change(searchInput, { target: { value: "HashMap" } });

    expect(screen.getByText("HashMap Operations")).toBeInTheDocument();
    expect(screen.queryByText("Priority Queue & Heap")).not.toBeInTheDocument();
  });

  it("filters concepts by category", () => {
    render(
      <DSAFundamentalsClient
        concepts={mockConcepts}
        categories={mockCategories}
      />
    );

    const categorySelect = screen.getByRole("combobox");
    fireEvent.change(categorySelect, { target: { value: "Data Structures" } });

    expect(screen.getByText("Priority Queue & Heap")).toBeInTheDocument();
    expect(screen.queryByText("HashMap Operations")).not.toBeInTheDocument();
  });

  it("shows no results message when search has no matches", () => {
    render(
      <DSAFundamentalsClient
        concepts={mockConcepts}
        categories={mockCategories}
      />
    );

    const searchInput = screen.getByPlaceholderText("Search concepts...");
    fireEvent.change(searchInput, { target: { value: "xyz123nonexistent" } });

    expect(
      screen.getByText("No concepts found matching your criteria.")
    ).toBeInTheDocument();
  });

  it("shows clear filters button when no results", () => {
    render(
      <DSAFundamentalsClient
        concepts={mockConcepts}
        categories={mockCategories}
      />
    );

    const searchInput = screen.getByPlaceholderText("Search concepts...");
    fireEvent.change(searchInput, { target: { value: "xyz123nonexistent" } });

    expect(screen.getByText("Clear filters")).toBeInTheDocument();
  });

  it("clears filters when Clear filters button is clicked", () => {
    render(
      <DSAFundamentalsClient
        concepts={mockConcepts}
        categories={mockCategories}
      />
    );

    const searchInput = screen.getByPlaceholderText("Search concepts...");
    fireEvent.change(searchInput, { target: { value: "xyz123nonexistent" } });

    const clearButton = screen.getByText("Clear filters");
    fireEvent.click(clearButton);

    expect(screen.getByText("Priority Queue & Heap")).toBeInTheDocument();
    expect(screen.getByText("HashMap Operations")).toBeInTheDocument();
  });

  it("concept cards link to correct detail pages", () => {
    render(
      <DSAFundamentalsClient
        concepts={mockConcepts}
        categories={mockCategories}
      />
    );

    const heapCard = screen.getByText("Priority Queue & Heap").closest("a");
    expect(heapCard).toHaveAttribute(
      "href",
      "/dsa-fundamentals/priority-queue-heap"
    );
  });

  it("displays problem count on cards", () => {
    render(
      <DSAFundamentalsClient
        concepts={mockConcepts}
        categories={mockCategories}
      />
    );

    expect(screen.getAllByText(/1 problem/)).toHaveLength(3);
  });

  it("displays key points count on cards", () => {
    render(
      <DSAFundamentalsClient
        concepts={mockConcepts}
        categories={mockCategories}
      />
    );

    expect(screen.getAllByText(/1 key point/)).toHaveLength(3);
  });
});

describe("DSAFundamentalsClient - empty state", () => {
  it("handles empty concepts array", () => {
    render(<DSAFundamentalsClient concepts={[]} categories={[]} />);

    expect(
      screen.getByText("No concepts found matching your criteria.")
    ).toBeInTheDocument();
  });
});
