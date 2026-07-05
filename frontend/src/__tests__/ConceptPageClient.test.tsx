import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ConceptPageClient from "@/app/dsa-fundamentals/[slug]/ConceptPageClient";
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

vi.mock("next/dynamic", () => ({
  default: () => {
    const Component = ({
      code,
      language,
    }: {
      code: string;
      language: string;
    }) => (
      <div data-testid="code-block">
        <span data-testid="code-language">{language}</span>
        <pre data-testid="code-content">{code}</pre>
      </div>
    );
    return Component;
  },
}));

vi.mock("@/contexts/LanguageContext", () => ({
  useLanguage: () => ({
    language: "java",
    setLanguage: vi.fn(),
  }),
}));

const mockConcept: Concept = {
  id: "priority-queue-heap",
  name: "Priority Queue & Heap",
  slug: "priority-queue-heap",
  category: "Data Structures",
  description:
    "A Priority Queue is an abstract data type where each element has a priority.",
  timeComplexity: "O(log n) insert/delete, O(1) peek",
  spaceComplexity: "O(n)",
  whenToUse: [
    "Finding K largest/smallest elements",
    "Merge K sorted lists/arrays",
    "Task scheduling by priority",
  ],
  codeSnippets: {
    java: "PriorityQueue<Integer> pq = new PriorityQueue<>();",
    python: "import heapq",
    cpp: "priority_queue<int> pq;",
    javascript: "class MinHeap { }",
  },
  keyPoints: [
    "Java PriorityQueue is a MIN heap by default",
    "Use Collections.reverseOrder() for MAX heap",
  ],
  commonMistakes: [
    "Using max heap for Top K",
    "Forgetting that Java PriorityQueue is min heap",
  ],
  relatedProblems: ["Top K Frequent Elements", "Kth Largest Element"],
  relatedPatterns: ["heap"],
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

describe("ConceptPageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders concept name", () => {
    render(<ConceptPageClient concept={mockConcept} />);

    expect(screen.getByText("Priority Queue & Heap")).toBeInTheDocument();
  });

  it("renders concept category badge", () => {
    render(<ConceptPageClient concept={mockConcept} />);

    expect(screen.getByText("Data Structures")).toBeInTheDocument();
  });

  it("renders time complexity", () => {
    render(<ConceptPageClient concept={mockConcept} />);

    expect(
      screen.getByText("O(log n) insert/delete, O(1) peek")
    ).toBeInTheDocument();
  });

  it("renders space complexity", () => {
    render(<ConceptPageClient concept={mockConcept} />);

    expect(screen.getByText("O(n)")).toBeInTheDocument();
  });

  it("renders description in What is it section", () => {
    render(<ConceptPageClient concept={mockConcept} />);

    expect(screen.getByText("What is it?")).toBeInTheDocument();
    expect(
      screen.getByText(/A Priority Queue is an abstract data type/)
    ).toBeInTheDocument();
  });

  it("renders When to Use section with all items", () => {
    render(<ConceptPageClient concept={mockConcept} />);

    expect(screen.getByText("When to Use")).toBeInTheDocument();
    expect(
      screen.getByText("Finding K largest/smallest elements")
    ).toBeInTheDocument();
    expect(screen.getByText("Merge K sorted lists/arrays")).toBeInTheDocument();
    expect(screen.getByText("Task scheduling by priority")).toBeInTheDocument();
  });

  it("renders Key Points section", () => {
    render(<ConceptPageClient concept={mockConcept} />);

    expect(screen.getByText("Key Points to Remember")).toBeInTheDocument();
    expect(
      screen.getByText("Java PriorityQueue is a MIN heap by default")
    ).toBeInTheDocument();
  });

  it("renders Common Mistakes section", () => {
    render(<ConceptPageClient concept={mockConcept} />);

    expect(screen.getByText("Common Mistakes to Avoid")).toBeInTheDocument();
    expect(screen.getByText("Using max heap for Top K")).toBeInTheDocument();
  });

  it("renders Practice Problems section", () => {
    render(<ConceptPageClient concept={mockConcept} />);

    expect(screen.getByText("Practice Problems")).toBeInTheDocument();
    expect(screen.getByText("Top K Frequent Elements")).toBeInTheDocument();
    expect(screen.getByText("Kth Largest Element")).toBeInTheDocument();
  });

  it("renders Related Patterns section with links", () => {
    render(<ConceptPageClient concept={mockConcept} />);

    expect(screen.getByText("Related Patterns")).toBeInTheDocument();
    const heapLink = screen.getByText("Heap");
    expect(heapLink.closest("a")).toHaveAttribute("href", "/patterns/heap");
  });

  it("renders back button linking to fundamentals page", () => {
    render(<ConceptPageClient concept={mockConcept} />);

    const backLink = screen.getByText("Back to Fundamentals").closest("a");
    expect(backLink).toHaveAttribute("href", "/dsa-fundamentals");
  });

  it("renders language selector buttons", () => {
    render(<ConceptPageClient concept={mockConcept} />);

    expect(screen.getByText("Java")).toBeInTheDocument();
    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(screen.getByText("C++")).toBeInTheDocument();
    expect(screen.getByText("JavaScript")).toBeInTheDocument();
  });

  it("renders code block component", () => {
    render(<ConceptPageClient concept={mockConcept} />);

    expect(screen.getByTestId("code-block")).toBeInTheDocument();
  });
});

describe("ConceptPageClient - minimal concept", () => {
  const minimalConcept: Concept = {
    id: "test-concept",
    name: "Test Concept",
    slug: "test-concept",
    category: "Data Structures",
    description: "A test concept",
    whenToUse: ["Test use case"],
    codeSnippets: {
      java: "// Java code",
      python: "# Python code",
      cpp: "// C++ code",
      javascript: "// JS code",
    },
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  };

  it("renders without optional fields", () => {
    render(<ConceptPageClient concept={minimalConcept} />);

    expect(screen.getByText("Test Concept")).toBeInTheDocument();
    expect(
      screen.queryByText("Key Points to Remember")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Common Mistakes to Avoid")
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Practice Problems")).not.toBeInTheDocument();
    expect(screen.queryByText("Related Patterns")).not.toBeInTheDocument();
  });

  it("does not render complexity badges when not provided", () => {
    render(<ConceptPageClient concept={minimalConcept} />);

    expect(screen.queryByText("Time:")).not.toBeInTheDocument();
    expect(screen.queryByText("Space:")).not.toBeInTheDocument();
  });
});
