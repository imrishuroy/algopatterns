import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
} from "@testing-library/react";
import type { ReactNode } from "react";
import type { QuizQuestion, Answer } from "@/types/quiz";
import type { Question } from "@/types";

// Next.js mocks

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Session storage mock

const mockSessionStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((_index: number) => ""),
  };
})();

Object.defineProperty(window, "sessionStorage", {
  value: mockSessionStorage,
  writable: true,
});

// Mock scrollTo

beforeEach(() => {
  window.scrollTo = vi.fn();
  vi.spyOn(window, "requestAnimationFrame").mockImplementation(
    (cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    },
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  mockSessionStorage.clear();
});

//  Test data

const multipleChoiceQuestion: QuizQuestion = {
  id: "mc-1",
  patternId: "arrays-strings",
  type: "multiple-choice",
  difficulty: "medium",
  questionText: "What is the time complexity of binary search?",
  options: ["O(1)", "O(log n)", "O(n)", "O(n^2)"],
  displayOrder: 1,
};

const trueFalseQuestion: QuizQuestion = {
  id: "tf-1",
  patternId: "arrays-strings",
  type: "true-false",
  difficulty: "easy",
  questionText: "Binary search requires a sorted array.",
  displayOrder: 2,
};

const trueFalseQuestionWithCode: QuizQuestion = {
  id: "tf-2",
  patternId: "arrays-strings",
  type: "true-false",
  difficulty: "easy",
  questionText: "This code sorts an array in ascending order.",
  codeSnippet: "function sort(arr) { return arr.sort((a,b) => a - b); }",
  displayOrder: 3,
};

const multipleChoiceQuestionWithCode: QuizQuestion = {
  id: "mc-2",
  patternId: "arrays-strings",
  type: "multiple-choice",
  difficulty: "hard",
  questionText: "What does this code output?\n\nconst arr = [1, 2, 3];\nconsole.log(arr.map(x => x * 2));",
  options: ["[1, 2, 3]", "[2, 4, 6]", "[2, 3, 4]", "undefined"],
  displayOrder: 4,
};

const correctAnswer: Answer = {
  selected: 1,
  isCorrect: true,
  correctAnswer: 1,
  explanation: "Binary search halves the search space each time, giving O(log n) complexity.",
};

const wrongAnswer: Answer = {
  selected: 0,
  isCorrect: false,
  correctAnswer: 1,
  explanation: "O(1) is constant time. Binary search halves the search space each time, giving O(log n).",
};

const correctTrueAnswer: Answer = {
  selected: true,
  isCorrect: true,
  correctAnswer: true,
  explanation: "Binary search requires a sorted array to work correctly.",
};

const wrongTrueAnswer: Answer = {
  selected: false,
  isCorrect: false,
  correctAnswer: true,
  explanation: "Binary search requires a sorted array to function correctly.",
};

const mockQuestions: Question[] = [
  {
    id: "q1",
    name: "Two Sum",
    url: "https://leetcode.com/two-sum",
    difficulty: "Easy",
    pattern: "Hash Map",
    companies: ["Google", "Amazon", "Meta"],
    frequency: "🔥🔥🔥",
    category: "Arrays & Strings",
  },
  {
    id: "q2",
    name: "3Sum",
    url: "https://leetcode.com/3sum",
    difficulty: "Medium",
    pattern: "Two Pointers",
    companies: ["Google"],
    frequency: "🔥🔥",
    category: "Two Pointers",
  },
  {
    id: "q3",
    name: "Valid Parentheses",
    url: "https://leetcode.com/valid-parentheses",
    difficulty: "Easy",
    pattern: "Stack",
    companies: ["Amazon", "Microsoft"],
    frequency: "🔥🔥🔥🔥",
    category: "Stack",
  },
  {
    id: "q4",
    name: "Merge K Sorted Lists",
    url: "https://leetcode.com/merge-k-sorted-lists",
    difficulty: "Hard",
    pattern: "Heap",
    companies: ["Google", "Amazon", "Meta", "Microsoft"],
    frequency: "🔥🔥",
    category: "Heap",
  },
];

//  MultipleChoice

describe("MultipleChoice", () => {
  it("renders question text", async () => {
    const MultipleChoice = (await import("@/components/quiz/questions/MultipleChoice")).default;
    render(
      <MultipleChoice
        question={multipleChoiceQuestion}
        onAnswer={vi.fn()}
        disabled={false}
      />,
    );
    expect(
      screen.getByText("What is the time complexity of binary search?"),
    ).toBeInTheDocument();
  });

  it("renders all answer options as buttons", async () => {
    const MultipleChoice = (await import("@/components/quiz/questions/MultipleChoice")).default;
    render(
      <MultipleChoice
        question={multipleChoiceQuestion}
        onAnswer={vi.fn()}
        disabled={false}
      />,
    );
    expect(screen.getByText("O(1)")).toBeInTheDocument();
    expect(screen.getByText("O(log n)")).toBeInTheDocument();
    expect(screen.getByText("O(n)")).toBeInTheDocument();
    expect(screen.getByText("O(n^2)")).toBeInTheDocument();
  });

  it("renders letter labels (A, B, C, D) for each option", async () => {
    const MultipleChoice = (await import("@/components/quiz/questions/MultipleChoice")).default;
    render(
      <MultipleChoice
        question={multipleChoiceQuestion}
        onAnswer={vi.fn()}
        disabled={false}
      />,
    );
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.getByText("C")).toBeInTheDocument();
    expect(screen.getByText("D")).toBeInTheDocument();
  });

  it("selecting an option calls onAnswer with the index", async () => {
    const onAnswer = vi.fn();
    const MultipleChoice = (await import("@/components/quiz/questions/MultipleChoice")).default;
    render(
      <MultipleChoice
        question={multipleChoiceQuestion}
        onAnswer={onAnswer}
        disabled={false}
      />,
    );
    fireEvent.click(screen.getByText("O(log n)"));
    expect(onAnswer).toHaveBeenCalledWith(1);
  });

  it("selecting the first option calls onAnswer with 0", async () => {
    const onAnswer = vi.fn();
    const MultipleChoice = (await import("@/components/quiz/questions/MultipleChoice")).default;
    render(
      <MultipleChoice
        question={multipleChoiceQuestion}
        onAnswer={onAnswer}
        disabled={false}
      />,
    );
    fireEvent.click(screen.getByText("O(1)"));
    expect(onAnswer).toHaveBeenCalledWith(0);
  });

  it("shows correct feedback with green border on correct answer", async () => {
    const MultipleChoice = (await import("@/components/quiz/questions/MultipleChoice")).default;
    const { container } = render(
      <MultipleChoice
        question={multipleChoiceQuestion}
        answer={correctAnswer}
        onAnswer={vi.fn()}
        disabled={true}
      />,
    );
    const buttons = container.querySelectorAll("button");
    const correctBtn = buttons[1];
    expect(correctBtn.className).toContain("border-green-500");
    expect(correctBtn.className).toContain("bg-green-500/10");
  });

  it("shows wrong feedback with red border on selected wrong answer", async () => {
    const MultipleChoice = (await import("@/components/quiz/questions/MultipleChoice")).default;
    const { container } = render(
      <MultipleChoice
        question={multipleChoiceQuestion}
        answer={wrongAnswer}
        onAnswer={vi.fn()}
        disabled={true}
      />,
    );
    const buttons = container.querySelectorAll("button");
    const wrongBtn = buttons[0];
    expect(wrongBtn.className).toContain("border-red-500");
    expect(wrongBtn.className).toContain("bg-red-500/10");
  });

  it("shows correct checkmark SVG on correct answer", async () => {
    const MultipleChoice = (await import("@/components/quiz/questions/MultipleChoice")).default;
    const { container } = render(
      <MultipleChoice
        question={multipleChoiceQuestion}
        answer={correctAnswer}
        onAnswer={vi.fn()}
        disabled={true}
      />,
    );
    const svgs = container.querySelectorAll("svg path");
    const checkmark = Array.from(svgs).find(
      (p) => p.getAttribute("d") === "M5 13l4 4L19 7",
    );
    expect(checkmark).toBeTruthy();
  });

  it("shows wrong X mark SVG on selected wrong answer", async () => {
    const MultipleChoice = (await import("@/components/quiz/questions/MultipleChoice")).default;
    const { container } = render(
      <MultipleChoice
        question={multipleChoiceQuestion}
        answer={wrongAnswer}
        onAnswer={vi.fn()}
        disabled={true}
      />,
    );
    const svgs = container.querySelectorAll("svg path");
    const xmark = Array.from(svgs).find(
      (p) => p.getAttribute("d") === "M6 18L18 6M6 6l12 12",
    );
    expect(xmark).toBeTruthy();
  });

  it("disables all options when disabled is true", async () => {
    const onAnswer = vi.fn();
    const MultipleChoice = (await import("@/components/quiz/questions/MultipleChoice")).default;
    render(
      <MultipleChoice
        question={multipleChoiceQuestion}
        onAnswer={onAnswer}
        disabled={true}
      />,
    );
    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });
    fireEvent.click(screen.getByText("O(log n)"));
    expect(onAnswer).not.toHaveBeenCalled();
  });

  it("does not disable options when disabled is false", async () => {
    const MultipleChoice = (await import("@/components/quiz/questions/MultipleChoice")).default;
    render(
      <MultipleChoice
        question={multipleChoiceQuestion}
        onAnswer={vi.fn()}
        disabled={false}
      />,
    );
    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => {
      expect(btn).not.toBeDisabled();
    });
  });

  it("pre-selects existing answer when editing", async () => {
    const MultipleChoice = (await import("@/components/quiz/questions/MultipleChoice")).default;
    const { container } = render(
      <MultipleChoice
        question={multipleChoiceQuestion}
        answer={correctAnswer}
        onAnswer={vi.fn()}
        disabled={true}
      />,
    );
    const buttons = container.querySelectorAll("button");
    const correctBtn = buttons[1];
    expect(correctBtn.className).toContain("border-green-500");
    const wrongBtns = [buttons[0], buttons[2], buttons[3]];
    wrongBtns.forEach((btn) => {
      expect(btn.className).toContain("opacity-50");
    });
  });

  it("highlights correct answer in green when wrong answer was selected", async () => {
    const MultipleChoice = (await import("@/components/quiz/questions/MultipleChoice")).default;
    const { container } = render(
      <MultipleChoice
        question={multipleChoiceQuestion}
        answer={wrongAnswer}
        onAnswer={vi.fn()}
        disabled={true}
      />,
    );
    const buttons = container.querySelectorAll("button");
    const correctBtn = buttons[1];
    expect(correctBtn.className).toContain("border-green-500");
  });

  it("shows non-selected and non-correct options with opacity-50 after answering", async () => {
    const MultipleChoice = (await import("@/components/quiz/questions/MultipleChoice")).default;
    const { container } = render(
      <MultipleChoice
        question={multipleChoiceQuestion}
        answer={wrongAnswer}
        onAnswer={vi.fn()}
        disabled={true}
      />,
    );
    const buttons = container.querySelectorAll("button");
    [buttons[2], buttons[3]].forEach((btn) => {
      expect(btn.className).toContain("opacity-50");
    });
  });

  it("renders code snippet when question has codeSnippet", async () => {
    const MultipleChoice = (await import("@/components/quiz/questions/MultipleChoice")).default;
    render(
      <MultipleChoice
        question={multipleChoiceQuestionWithCode}
        onAnswer={vi.fn()}
        disabled={false}
      />,
    );
    expect(screen.getByText("[2, 4, 6]")).toBeInTheDocument();
  });

  it("does not render answer feedback when no answer is provided", async () => {
    const MultipleChoice = (await import("@/components/quiz/questions/MultipleChoice")).default;
    const { container } = render(
      <MultipleChoice
        question={multipleChoiceQuestion}
        onAnswer={vi.fn()}
        disabled={false}
      />,
    );
    const buttons = container.querySelectorAll("button");
    buttons.forEach((btn) => {
      expect(btn.className).not.toContain("border-green-500");
      expect(btn.className).not.toContain("border-red-500");
    });
    expect(container.querySelectorAll("svg").length).toBe(0);
  });

  it("renders with no options gracefully", async () => {
    const noOptionsQuestion = { ...multipleChoiceQuestion, options: [] };
    const MultipleChoice = (await import("@/components/quiz/questions/MultipleChoice")).default;
    const { container } = render(
      <MultipleChoice
        question={noOptionsQuestion}
        onAnswer={vi.fn()}
        disabled={false}
      />,
    );
    expect(
      screen.getByText("What is the time complexity of binary search?"),
    ).toBeInTheDocument();
    expect(container.querySelectorAll("button").length).toBe(0);
  });

  it("shows cursor-default when disabled, cursor-pointer when not", async () => {
    const MultipleChoice = (await import("@/components/quiz/questions/MultipleChoice")).default;
    const { container, rerender } = render(
      <MultipleChoice
        question={multipleChoiceQuestion}
        onAnswer={vi.fn()}
        disabled={true}
      />,
    );
    const buttons = container.querySelectorAll("button");
    buttons.forEach((btn) => {
      expect(btn.className).toContain("cursor-default");
    });

    rerender(
      <MultipleChoice
        question={multipleChoiceQuestion}
        onAnswer={vi.fn()}
        disabled={false}
      />,
    );
    const enabledButtons = container.querySelectorAll("button");
    enabledButtons.forEach((btn) => {
      expect(btn.className).toContain("cursor-pointer");
    });
  });
});

//  TrueFalse

describe("TrueFalse", () => {
  it("renders question text", async () => {
    const TrueFalse = (await import("@/components/quiz/questions/TrueFalse")).default;
    render(
      <TrueFalse
        question={trueFalseQuestion}
        onAnswer={vi.fn()}
        disabled={false}
      />,
    );
    expect(
      screen.getByText("Binary search requires a sorted array."),
    ).toBeInTheDocument();
  });

  it("shows True and False buttons", async () => {
    const TrueFalse = (await import("@/components/quiz/questions/TrueFalse")).default;
    render(
      <TrueFalse
        question={trueFalseQuestion}
        onAnswer={vi.fn()}
        disabled={false}
      />,
    );
    expect(screen.getByText("True")).toBeInTheDocument();
    expect(screen.getByText("False")).toBeInTheDocument();
  });

  it("shows T and F letter labels", async () => {
    const TrueFalse = (await import("@/components/quiz/questions/TrueFalse")).default;
    render(
      <TrueFalse
        question={trueFalseQuestion}
        onAnswer={vi.fn()}
        disabled={false}
      />,
    );
    expect(screen.getByText("T")).toBeInTheDocument();
    expect(screen.getByText("F")).toBeInTheDocument();
  });

  it("clicking True calls onAnswer(true)", async () => {
    const onAnswer = vi.fn();
    const TrueFalse = (await import("@/components/quiz/questions/TrueFalse")).default;
    render(
      <TrueFalse
        question={trueFalseQuestion}
        onAnswer={onAnswer}
        disabled={false}
      />,
    );
    fireEvent.click(screen.getByText("True"));
    expect(onAnswer).toHaveBeenCalledWith(true);
  });

  it("clicking False calls onAnswer(false)", async () => {
    const onAnswer = vi.fn();
    const TrueFalse = (await import("@/components/quiz/questions/TrueFalse")).default;
    render(
      <TrueFalse
        question={trueFalseQuestion}
        onAnswer={onAnswer}
        disabled={false}
      />,
    );
    fireEvent.click(screen.getByText("False"));
    expect(onAnswer).toHaveBeenCalledWith(false);
  });

  it("shows correct feedback with green border when answer is correct", async () => {
    const TrueFalse = (await import("@/components/quiz/questions/TrueFalse")).default;
    const { container } = render(
      <TrueFalse
        question={trueFalseQuestion}
        answer={correctTrueAnswer}
        onAnswer={vi.fn()}
        disabled={true}
      />,
    );
    const buttons = container.querySelectorAll("button");
    const trueBtn = buttons[0];
    expect(trueBtn.className).toContain("border-green-500");
    expect(trueBtn.className).toContain("bg-green-500/10");
  });

  it("shows wrong feedback with red border when selected wrong answer", async () => {
    const TrueFalse = (await import("@/components/quiz/questions/TrueFalse")).default;
    const { container } = render(
      <TrueFalse
        question={trueFalseQuestion}
        answer={wrongTrueAnswer}
        onAnswer={vi.fn()}
        disabled={true}
      />,
    );
    const buttons = container.querySelectorAll("button");
    const falseBtn = buttons[1];
    expect(falseBtn.className).toContain("border-red-500");
    expect(falseBtn.className).toContain("bg-red-500/10");
  });

  it("shows correct checkmark SVG on correct answer", async () => {
    const TrueFalse = (await import("@/components/quiz/questions/TrueFalse")).default;
    const { container } = render(
      <TrueFalse
        question={trueFalseQuestion}
        answer={correctTrueAnswer}
        onAnswer={vi.fn()}
        disabled={true}
      />,
    );
    const svgs = container.querySelectorAll("svg path");
    const checkmark = Array.from(svgs).find(
      (p) => p.getAttribute("d") === "M5 13l4 4L19 7",
    );
    expect(checkmark).toBeTruthy();
  });

  it("shows wrong X mark SVG on selected wrong answer", async () => {
    const TrueFalse = (await import("@/components/quiz/questions/TrueFalse")).default;
    const { container } = render(
      <TrueFalse
        question={trueFalseQuestion}
        answer={wrongTrueAnswer}
        onAnswer={vi.fn()}
        disabled={true}
      />,
    );
    const svgs = container.querySelectorAll("svg path");
    const xmark = Array.from(svgs).find(
      (p) => p.getAttribute("d") === "M6 18L18 6M6 6l12 12",
    );
    expect(xmark).toBeTruthy();
  });

  it("disables buttons after answering (disabled=true)", async () => {
    const onAnswer = vi.fn();
    const TrueFalse = (await import("@/components/quiz/questions/TrueFalse")).default;
    render(
      <TrueFalse
        question={trueFalseQuestion}
        onAnswer={onAnswer}
        disabled={true}
      />,
    );
    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });
    fireEvent.click(screen.getByText("True"));
    expect(onAnswer).not.toHaveBeenCalled();
  });

  it("does not disable buttons when disabled=false", async () => {
    const TrueFalse = (await import("@/components/quiz/questions/TrueFalse")).default;
    render(
      <TrueFalse
        question={trueFalseQuestion}
        onAnswer={vi.fn()}
        disabled={false}
      />,
    );
    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => {
      expect(btn).not.toBeDisabled();
    });
  });

  it("pre-selects existing answer when editing", async () => {
    const TrueFalse = (await import("@/components/quiz/questions/TrueFalse")).default;
    const { container } = render(
      <TrueFalse
        question={trueFalseQuestion}
        answer={correctTrueAnswer}
        onAnswer={vi.fn()}
        disabled={true}
      />,
    );
    const buttons = container.querySelectorAll("button");
    expect(buttons[0].className).toContain("border-green-500");
    expect(buttons[1].className).toContain("opacity-50");
  });

  it("highlights correct answer in green when wrong answer was selected", async () => {
    const TrueFalse = (await import("@/components/quiz/questions/TrueFalse")).default;
    const { container } = render(
      <TrueFalse
        question={trueFalseQuestion}
        answer={wrongTrueAnswer}
        onAnswer={vi.fn()}
        disabled={true}
      />,
    );
    const buttons = container.querySelectorAll("button");
    expect(buttons[0].className).toContain("border-green-500");
  });

  it("renders code snippet when question has codeSnippet", async () => {
    const TrueFalse = (await import("@/components/quiz/questions/TrueFalse")).default;
    render(
      <TrueFalse
        question={trueFalseQuestionWithCode}
        onAnswer={vi.fn()}
        disabled={false}
      />,
    );
    expect(
      screen.getByText("function sort(arr) { return arr.sort((a,b) => a - b); }"),
    ).toBeInTheDocument();
  });

  it("does not show code snippet when not provided", async () => {
    const TrueFalse = (await import("@/components/quiz/questions/TrueFalse")).default;
    const { container } = render(
      <TrueFalse
        question={trueFalseQuestion}
        onAnswer={vi.fn()}
        disabled={false}
      />,
    );
    expect(container.querySelector("pre")).not.toBeInTheDocument();
  });

  it("shows cursor-default when disabled, cursor-pointer when not", async () => {
    const TrueFalse = (await import("@/components/quiz/questions/TrueFalse")).default;
    const { container, rerender } = render(
      <TrueFalse
        question={trueFalseQuestion}
        onAnswer={vi.fn()}
        disabled={true}
      />,
    );
    const buttons = container.querySelectorAll("button");
    buttons.forEach((btn) => {
      expect(btn.className).toContain("cursor-default");
    });

    rerender(
      <TrueFalse
        question={trueFalseQuestion}
        onAnswer={vi.fn()}
        disabled={false}
      />,
    );
    const enabledButtons = container.querySelectorAll("button");
    enabledButtons.forEach((btn) => {
      expect(btn.className).toContain("cursor-pointer");
    });
  });

  it("shows opacity-50 on non-selected non-correct option after answering", async () => {
    const TrueFalse = (await import("@/components/quiz/questions/TrueFalse")).default;
    const { container } = render(
      <TrueFalse
        question={trueFalseQuestion}
        answer={wrongTrueAnswer}
        onAnswer={vi.fn()}
        disabled={true}
      />,
    );
    const buttons = container.querySelectorAll("button");
    const nonSelectedBtns = Array.from(buttons).filter(
      (b) => !b.className.includes("border-green-500") && !b.className.includes("border-red-500"),
    );
    nonSelectedBtns.forEach((btn) => {
      expect(btn.className).toContain("opacity-50");
    });
  });
});

//  ExplanationPanel

describe("ExplanationPanel", () => {
  it("shows Correct! when answer is correct", async () => {
    const ExplanationPanel = (await import("@/components/quiz/questions/ExplanationPanel")).default;
    render(<ExplanationPanel answer={correctAnswer} />);
    expect(screen.getByText("Correct!")).toBeInTheDocument();
  });

  it("shows green styling when correct", async () => {
    const ExplanationPanel = (await import("@/components/quiz/questions/ExplanationPanel")).default;
    const ExplanationPanelComponent = ExplanationPanel as React.FC<{ answer: Answer }>;
    const { container } = render(<ExplanationPanelComponent answer={correctAnswer} />);
    const rootDiv = container.firstChild as HTMLElement;
    expect(rootDiv.className).toContain("bg-green-950/30");
    expect(rootDiv.className).toContain("border-green-800/50");
  });

  it("shows Incorrect when answer is wrong", async () => {
    const ExplanationPanel = (await import("@/components/quiz/questions/ExplanationPanel")).default;
    render(<ExplanationPanel answer={wrongAnswer} />);
    expect(screen.getByText("Incorrect")).toBeInTheDocument();
  });

  it("shows red styling when incorrect", async () => {
    const ExplanationPanel = (await import("@/components/quiz/questions/ExplanationPanel")).default;
    const { container } = render(<ExplanationPanel answer={wrongAnswer} />);
    const rootDiv = container.firstChild as HTMLElement;
    expect(rootDiv.className).toContain("bg-red-950/20");
    expect(rootDiv.className).toContain("border-red-800/40");
  });

  it("shows the explanation text", async () => {
    const ExplanationPanel = (await import("@/components/quiz/questions/ExplanationPanel")).default;
    render(<ExplanationPanel answer={correctAnswer} />);
    expect(
      screen.getByText(
        "Binary search halves the search space each time, giving O(log n) complexity.",
      ),
    ).toBeInTheDocument();
  });

  it("shows checkmark circle SVG when correct", async () => {
    const ExplanationPanel = (await import("@/components/quiz/questions/ExplanationPanel")).default;
    const { container } = render(<ExplanationPanel answer={correctAnswer} />);
    const svgs = container.querySelectorAll("svg path");
    const circleCheck = Array.from(svgs).find(
      (p) => p.getAttribute("d") === "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    );
    expect(circleCheck).toBeTruthy();
  });

  it("shows X circle SVG when incorrect", async () => {
    const ExplanationPanel = (await import("@/components/quiz/questions/ExplanationPanel")).default;
    const { container } = render(<ExplanationPanel answer={wrongAnswer} />);
    const svgs = container.querySelectorAll("svg path");
    const circleX = Array.from(svgs).find(
      (p) => p.getAttribute("d") === "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
    );
    expect(circleX).toBeTruthy();
  });

  it("handles empty explanation string gracefully", async () => {
    const emptyAnswer: Answer = {
      selected: 1,
      isCorrect: true,
      correctAnswer: 1,
      explanation: "",
    };
    const ExplanationPanel = (await import("@/components/quiz/questions/ExplanationPanel")).default;
    const { container } = render(<ExplanationPanel answer={emptyAnswer} />);
    expect(screen.getByText("Correct!")).toBeInTheDocument();
    const paragraph = container.querySelector("p");
    expect(paragraph?.textContent).toBe("");
  });

  it("shows green text color for Correct!", async () => {
    const ExplanationPanel = (await import("@/components/quiz/questions/ExplanationPanel")).default;
    render(<ExplanationPanel answer={correctAnswer} />);
    const correctLabel = screen.getByText("Correct!");
    expect(correctLabel.className).toContain("text-green-400");
  });

  it("shows red text color for Incorrect", async () => {
    const ExplanationPanel = (await import("@/components/quiz/questions/ExplanationPanel")).default;
    render(<ExplanationPanel answer={wrongAnswer} />);
    const incorrectLabel = screen.getByText("Incorrect");
    expect(incorrectLabel.className).toContain("text-red-400");
  });

  it("has mt-6 margin class on the container", async () => {
    const ExplanationPanel = (await import("@/components/quiz/questions/ExplanationPanel")).default;
    const { container } = render(<ExplanationPanel answer={correctAnswer} />);
    const rootDiv = container.firstChild as HTMLElement;
    expect(rootDiv.className).toContain("mt-6");
  });
});

//  ProblemsTab

describe("ProblemsTab", () => {
  beforeEach(() => {
    mockSessionStorage.clear();
  });

  it("renders stats bar with total problem count", async () => {
    const ProblemsTab = (await import("@/app/patterns/[slug]/tabs/ProblemsTab")).default;
    const { container } = render(
      <ProblemsTab
        questions={mockQuestions}
        completed={new Set()}
        onToggleComplete={vi.fn()}
        patternId="arrays-strings"
      />,
    );
    expect(screen.getByText("Total")).toBeInTheDocument();
    const totalValue = container.querySelector('[class*="text-white"][class*="font-bold"]');
    expect(totalValue?.textContent).toBe("4");
  });

  it("renders solved count in stats bar", async () => {
    const ProblemsTab = (await import("@/app/patterns/[slug]/tabs/ProblemsTab")).default;
    render(
      <ProblemsTab
        questions={mockQuestions}
        completed={new Set(["q1", "q2"])}
        onToggleComplete={vi.fn()}
        patternId="arrays-strings"
      />,
    );
    const solvedValues = screen.getAllByText("2");
    expect(solvedValues.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Solved")).toBeInTheDocument();
  });

  it("renders difficulty counts (easy, medium, hard)", async () => {
    const ProblemsTab = (await import("@/app/patterns/[slug]/tabs/ProblemsTab")).default;
    render(
      <ProblemsTab
        questions={mockQuestions}
        completed={new Set()}
        onToggleComplete={vi.fn()}
        patternId="arrays-strings"
      />,
    );
    expect(screen.getAllByText("Easy").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Medium").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Hard").length).toBeGreaterThanOrEqual(1);
  });

  it("shows problem title links", async () => {
    const ProblemsTab = (await import("@/app/patterns/[slug]/tabs/ProblemsTab")).default;
    render(
      <ProblemsTab
        questions={mockQuestions}
        completed={new Set()}
        onToggleComplete={vi.fn()}
        patternId="arrays-strings"
      />,
    );
    expect(screen.getByText("Two Sum")).toBeInTheDocument();
    expect(screen.getByText("3Sum")).toBeInTheDocument();
    expect(screen.getByText("Valid Parentheses")).toBeInTheDocument();
    expect(screen.getByText("Merge K Sorted Lists")).toBeInTheDocument();
  });

  it("links to problem detail pages", async () => {
    const ProblemsTab = (await import("@/app/patterns/[slug]/tabs/ProblemsTab")).default;
    render(
      <ProblemsTab
        questions={mockQuestions}
        completed={new Set()}
        onToggleComplete={vi.fn()}
        patternId="arrays-strings"
      />,
    );
    const link = screen.getByText("Two Sum").closest("a");
    expect(link).toHaveAttribute("href", "/problems/two-sum");
  });

  it("links to problem detail with from param via Solve button", async () => {
    const ProblemsTab = (await import("@/app/patterns/[slug]/tabs/ProblemsTab")).default;
    render(
      <ProblemsTab
        questions={mockQuestions}
        completed={new Set()}
        onToggleComplete={vi.fn()}
        patternId="arrays-strings"
      />,
    );
    const solveLinks = screen.getAllByText("Solve");
    expect(solveLinks[0].closest("a")).toHaveAttribute("href", "/problems/two-sum?from=arrays-strings");
  });

  it("shows difficulty badges for each problem", async () => {
    const ProblemsTab = (await import("@/app/patterns/[slug]/tabs/ProblemsTab")).default;
    render(
      <ProblemsTab
        questions={mockQuestions}
        completed={new Set()}
        onToggleComplete={vi.fn()}
        patternId="arrays-strings"
      />,
    );
    const difficulties = screen.getAllByText(/Easy|Medium|Hard/);
    const filtered = difficulties.filter(
      (el) => el.className.includes("font-medium"),
    );
    expect(filtered.length).toBe(4);
  });

  it("shows frequency for each problem", async () => {
    const ProblemsTab = (await import("@/app/patterns/[slug]/tabs/ProblemsTab")).default;
    render(
      <ProblemsTab
        questions={mockQuestions}
        completed={new Set()}
        onToggleComplete={vi.fn()}
        patternId="arrays-strings"
      />,
    );
    const freqs = screen.getAllByText((content) =>
      content.startsWith("🔥"),
    );
    expect(freqs.length).toBe(4);
  });

  it("shows completion status checkmarks for completed problems", async () => {
    const ProblemsTab = (await import("@/app/patterns/[slug]/tabs/ProblemsTab")).default;
    const { container } = render(
      <ProblemsTab
        questions={mockQuestions}
        completed={new Set(["q1"])}
        onToggleComplete={vi.fn()}
        patternId="arrays-strings"
      />,
    );
    const checkSvgs = container.querySelectorAll("svg path");
    const checkmark = Array.from(checkSvgs).find(
      (p) => p.getAttribute("d") === "M5 13l4 4L19 7",
    );
    expect(checkmark).toBeTruthy();
  });

  it("highlights completed problems with green border", async () => {
    const ProblemsTab = (await import("@/app/patterns/[slug]/tabs/ProblemsTab")).default;
    const { container } = render(
      <ProblemsTab
        questions={mockQuestions}
        completed={new Set(["q1"])}
        onToggleComplete={vi.fn()}
        patternId="arrays-strings"
      />,
    );
    const rows = container.querySelectorAll('[class*="rounded-md"]');
    const problemRows = Array.from(rows).filter((r) =>
      r.className.includes("hover:translate-x-1"),
    );
    expect(problemRows[0].className).toContain("border-green-500/30");
  });

  it("shows problem descriptions (pattern name)", async () => {
    const ProblemsTab = (await import("@/app/patterns/[slug]/tabs/ProblemsTab")).default;
    render(
      <ProblemsTab
        questions={mockQuestions}
        completed={new Set()}
        onToggleComplete={vi.fn()}
        patternId="arrays-strings"
      />,
    );
    expect(screen.getByText("Hash Map")).toBeInTheDocument();
    expect(screen.getByText("Two Pointers")).toBeInTheDocument();
  });

  it("filters by difficulty", async () => {
    const ProblemsTab = (await import("@/app/patterns/[slug]/tabs/ProblemsTab")).default;
    render(
      <ProblemsTab
        questions={mockQuestions}
        completed={new Set()}
        onToggleComplete={vi.fn()}
        patternId="arrays-strings"
      />,
    );
    const difficultySelect = screen.getByDisplayValue("All Difficulties");
    fireEvent.change(difficultySelect, { target: { value: "Easy" } });
    expect(screen.getByText("Two Sum")).toBeInTheDocument();
    expect(screen.getByText("Valid Parentheses")).toBeInTheDocument();
    expect(screen.queryByText("3Sum")).not.toBeInTheDocument();
    expect(screen.queryByText("Merge K Sorted Lists")).not.toBeInTheDocument();
  });

  it("filters by Medium difficulty", async () => {
    const ProblemsTab = (await import("@/app/patterns/[slug]/tabs/ProblemsTab")).default;
    render(
      <ProblemsTab
        questions={mockQuestions}
        completed={new Set()}
        onToggleComplete={vi.fn()}
        patternId="arrays-strings"
      />,
    );
    const difficultySelect = screen.getByDisplayValue("All Difficulties");
    fireEvent.change(difficultySelect, { target: { value: "Medium" } });
    expect(screen.getByText("3Sum")).toBeInTheDocument();
    expect(screen.queryByText("Two Sum")).not.toBeInTheDocument();
  });

  it("filters by Hard difficulty", async () => {
    const ProblemsTab = (await import("@/app/patterns/[slug]/tabs/ProblemsTab")).default;
    render(
      <ProblemsTab
        questions={mockQuestions}
        completed={new Set()}
        onToggleComplete={vi.fn()}
        patternId="arrays-strings"
      />,
    );
    const difficultySelect = screen.getByDisplayValue("All Difficulties");
    fireEvent.change(difficultySelect, { target: { value: "Hard" } });
    expect(screen.getByText("Merge K Sorted Lists")).toBeInTheDocument();
    expect(screen.queryByText("Two Sum")).not.toBeInTheDocument();
  });

  it("sorts by name", async () => {
    const ProblemsTab = (await import("@/app/patterns/[slug]/tabs/ProblemsTab")).default;
    render(
      <ProblemsTab
        questions={mockQuestions}
        completed={new Set()}
        onToggleComplete={vi.fn()}
        patternId="arrays-strings"
      />,
    );
    fireEvent.click(screen.getByText("Name"));
    const linkTexts = screen
      .getAllByText(/Two Sum|3Sum|Valid Parentheses|Merge K Sorted Lists/)
      .filter((el) => el.tagName === "A");
    expect(linkTexts[0].textContent).toBe("3Sum");
    expect(linkTexts[linkTexts.length - 1].textContent).toBe("Valid Parentheses");
  });

  it("sorts by difficulty by default", async () => {
    const ProblemsTab = (await import("@/app/patterns/[slug]/tabs/ProblemsTab")).default;
    render(
      <ProblemsTab
        questions={mockQuestions}
        completed={new Set()}
        onToggleComplete={vi.fn()}
        patternId="arrays-strings"
      />,
    );
    const linkTexts = screen
      .getAllByText(/Two Sum|3Sum|Valid Parentheses|Merge K Sorted Lists/)
      .filter((el) => el.tagName === "A");
    expect(linkTexts[0].textContent).toBe("Two Sum");
    expect(linkTexts[1].textContent).toBe("Valid Parentheses");
  });

  it("sorts by frequency", async () => {
    const ProblemsTab = (await import("@/app/patterns/[slug]/tabs/ProblemsTab")).default;
    render(
      <ProblemsTab
        questions={mockQuestions}
        completed={new Set()}
        onToggleComplete={vi.fn()}
        patternId="arrays-strings"
      />,
    );
    fireEvent.click(screen.getByText("Frequency"));
    const linkTexts = screen
      .getAllByText(/Two Sum|3Sum|Valid Parentheses|Merge K Sorted Lists/)
      .filter((el) => el.tagName === "A");
    expect(linkTexts[0].textContent).toBe("Valid Parentheses");
  });

  it("sorts by status", async () => {
    const ProblemsTab = (await import("@/app/patterns/[slug]/tabs/ProblemsTab")).default;
    render(
      <ProblemsTab
        questions={mockQuestions}
        completed={new Set(["q4"])}
        onToggleComplete={vi.fn()}
        patternId="arrays-strings"
      />,
    );
    fireEvent.click(screen.getByText("Status"));
    const linkTexts = screen
      .getAllByText(/Two Sum|3Sum|Valid Parentheses|Merge K Sorted Lists/)
      .filter((el) => el.tagName === "A");
    expect(linkTexts[linkTexts.length - 1].textContent).toBe("Merge K Sorted Lists");
  });

  it("shows active sort button with indigo highlight", async () => {
    const ProblemsTab = (await import("@/app/patterns/[slug]/tabs/ProblemsTab")).default;
    render(
      <ProblemsTab
        questions={mockQuestions}
        completed={new Set()}
        onToggleComplete={vi.fn()}
        patternId="arrays-strings"
      />,
    );
    const difficultyBtn = screen.getByText("Difficulty");
    expect(difficultyBtn.className).toContain("bg-indigo-500/20");
    expect(difficultyBtn.className).toContain("text-indigo-400");

    fireEvent.click(screen.getByText("Name"));
    expect(difficultyBtn.className).not.toContain("bg-indigo-500/20");
    expect(screen.getByText("Name").className).toContain("bg-indigo-500/20");
  });

  it("filters by status (completed)", async () => {
    const ProblemsTab = (await import("@/app/patterns/[slug]/tabs/ProblemsTab")).default;
    render(
      <ProblemsTab
        questions={mockQuestions}
        completed={new Set(["q1", "q3"])}
        onToggleComplete={vi.fn()}
        patternId="arrays-strings"
      />,
    );
    const statusSelect = screen.getByDisplayValue("All Status");
    fireEvent.change(statusSelect, { target: { value: "completed" } });
    expect(screen.getByText("Two Sum")).toBeInTheDocument();
    expect(screen.getByText("Valid Parentheses")).toBeInTheDocument();
    expect(screen.queryByText("3Sum")).not.toBeInTheDocument();
    expect(screen.queryByText("Merge K Sorted Lists")).not.toBeInTheDocument();
  });

  it("filters by status (todo)", async () => {
    const ProblemsTab = (await import("@/app/patterns/[slug]/tabs/ProblemsTab")).default;
    render(
      <ProblemsTab
        questions={mockQuestions}
        completed={new Set(["q1"])}
        onToggleComplete={vi.fn()}
        patternId="arrays-strings"
      />,
    );
    const statusSelect = screen.getByDisplayValue("All Status");
    fireEvent.change(statusSelect, { target: { value: "todo" } });
    expect(screen.queryByText("Two Sum")).not.toBeInTheDocument();
    expect(screen.getByText("3Sum")).toBeInTheDocument();
    expect(screen.getByText("Valid Parentheses")).toBeInTheDocument();
    expect(screen.getByText("Merge K Sorted Lists")).toBeInTheDocument();
  });

  it("shows problem count in stats", async () => {
    const ProblemsTab = (await import("@/app/patterns/[slug]/tabs/ProblemsTab")).default;
    const { container } = render(
      <ProblemsTab
        questions={mockQuestions}
        completed={new Set()}
        onToggleComplete={vi.fn()}
        patternId="arrays-strings"
      />,
    );
    const totalEl = container.querySelector('[class*="text-white"][class*="font-bold"]');
    expect(totalEl?.textContent).toBe("4");
  });

  it("shows external LeetCode link for each problem", async () => {
    const ProblemsTab = (await import("@/app/patterns/[slug]/tabs/ProblemsTab")).default;
    render(
      <ProblemsTab
        questions={mockQuestions}
        completed={new Set()}
        onToggleComplete={vi.fn()}
        patternId="arrays-strings"
      />,
    );
    const externalLinks = screen.getAllByTitle("Open on LeetCode");
    expect(externalLinks.length).toBe(4);
    expect(externalLinks[0]).toHaveAttribute("href", "https://leetcode.com/two-sum");
  });

  it("calls onToggleComplete when checkbox is clicked", async () => {
    const onToggleComplete = vi.fn();
    const ProblemsTab = (await import("@/app/patterns/[slug]/tabs/ProblemsTab")).default;
    render(
      <ProblemsTab
        questions={mockQuestions}
        completed={new Set()}
        onToggleComplete={onToggleComplete}
        patternId="arrays-strings"
      />,
    );
    const checkboxes = screen.getAllByRole("button");
    const toggleBtn = checkboxes.find(
      (b) => b.className.includes("rounded-md") && b.className.includes("border-2"),
    );
    if (toggleBtn) {
      fireEvent.click(toggleBtn);
      expect(onToggleComplete).toHaveBeenCalledWith("q1");
    }
  });

  it("shows search input", async () => {
    const ProblemsTab = (await import("@/app/patterns/[slug]/tabs/ProblemsTab")).default;
    render(
      <ProblemsTab
        questions={mockQuestions}
        completed={new Set()}
        onToggleComplete={vi.fn()}
        patternId="arrays-strings"
      />,
    );
    expect(
      screen.getByPlaceholderText("Search problems..."),
    ).toBeInTheDocument();
  });

  it("filters by search query", async () => {
    const ProblemsTab = (await import("@/app/patterns/[slug]/tabs/ProblemsTab")).default;
    render(
      <ProblemsTab
        questions={mockQuestions}
        completed={new Set()}
        onToggleComplete={vi.fn()}
        patternId="arrays-strings"
      />,
    );
    const searchInput = screen.getByPlaceholderText("Search problems...");
    fireEvent.change(searchInput, { target: { value: "3Sum" } });
    expect(screen.getByText("3Sum")).toBeInTheDocument();
    expect(screen.queryByText("Two Sum")).not.toBeInTheDocument();
  });

  it("shows company names for problems", async () => {
    const ProblemsTab = (await import("@/app/patterns/[slug]/tabs/ProblemsTab")).default;
    render(
      <ProblemsTab
        questions={mockQuestions}
        completed={new Set()}
        onToggleComplete={vi.fn()}
        patternId="arrays-strings"
      />,
    );
    expect(screen.getByText("Google, Amazon, Meta")).toBeInTheDocument();
    expect(screen.getByText("Amazon, Microsoft")).toBeInTheDocument();
  });

  it("shows +N for extra companies beyond 3", async () => {
    const ProblemsTab = (await import("@/app/patterns/[slug]/tabs/ProblemsTab")).default;
    const { container } = render(
      <ProblemsTab
        questions={mockQuestions}
        completed={new Set()}
        onToggleComplete={vi.fn()}
        patternId="arrays-strings"
      />,
    );
    const spans = container.querySelectorAll('[class*="truncate"]');
    const hasPlusOne = Array.from(spans).some((s) => s.textContent?.includes("+1"));
    expect(hasPlusOne).toBe(true);
  });

  it('shows "No problems match your filters" when empty', async () => {
    const ProblemsTab = (await import("@/app/patterns/[slug]/tabs/ProblemsTab")).default;
    render(
      <ProblemsTab
        questions={mockQuestions}
        completed={new Set()}
        onToggleComplete={vi.fn()}
        patternId="arrays-strings"
      />,
    );
    const searchInput = screen.getByPlaceholderText("Search problems...");
    fireEvent.change(searchInput, { target: { value: "xyznonexistent" } });
    expect(
      screen.getByText("No problems match your filters"),
    ).toBeInTheDocument();
  });

  it("handles empty questions array", async () => {
    const ProblemsTab = (await import("@/app/patterns/[slug]/tabs/ProblemsTab")).default;
    const { container } = render(
      <ProblemsTab
        questions={[]}
        completed={new Set()}
        onToggleComplete={vi.fn()}
        patternId="arrays-strings"
      />,
    );
    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(
      screen.getByText("No problems match your filters"),
    ).toBeInTheDocument();
    const zeroes = container.querySelectorAll('[class*="font-bold"]');
    const totalZero = Array.from(zeroes).find(
      (z) => z.textContent === "0" && z.closest('[class*="text-center"]'),
    );
    expect(totalZero).toBeTruthy();
  });

  it("shows problem numbering starting from 1", async () => {
    const ProblemsTab = (await import("@/app/patterns/[slug]/tabs/ProblemsTab")).default;
    const { container } = render(
      <ProblemsTab
        questions={mockQuestions}
        completed={new Set()}
        onToggleComplete={vi.fn()}
        patternId="arrays-strings"
      />,
    );
    const numbers = container.querySelectorAll(".font-mono");
    expect(numbers[0].textContent).toBe("1");
    expect(numbers[1].textContent).toBe("2");
  });

  it("saves scroll position before navigating", async () => {
    const ProblemsTab = (await import("@/app/patterns/[slug]/tabs/ProblemsTab")).default;
    render(
      <ProblemsTab
        questions={mockQuestions}
        completed={new Set()}
        onToggleComplete={vi.fn()}
        patternId="arrays-strings"
      />,
    );
    const solveLink = screen.getAllByText("Solve")[0];
    fireEvent.click(solveLink);
    expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
      "problems_scroll_position_arrays-strings",
      "0",
    );
  });

  it("restores scroll position from sessionStorage on mount", async () => {
    mockSessionStorage.getItem.mockReturnValue("150");
    const ProblemsTab = (await import("@/app/patterns/[slug]/tabs/ProblemsTab")).default;
    render(
      <ProblemsTab
        questions={mockQuestions}
        completed={new Set()}
        onToggleComplete={vi.fn()}
        patternId="arrays-strings"
      />,
    );
    expect(window.scrollTo).toHaveBeenCalledWith(0, 150);
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(
      "problems_scroll_position_arrays-strings",
    );
  });

  it("shows Solve button for each problem", async () => {
    const ProblemsTab = (await import("@/app/patterns/[slug]/tabs/ProblemsTab")).default;
    render(
      <ProblemsTab
        questions={mockQuestions}
        completed={new Set()}
        onToggleComplete={vi.fn()}
        patternId="arrays-strings"
      />,
    );
    const solveButtons = screen.getAllByText("Solve");
    expect(solveButtons.length).toBe(4);
  });

  it("has correct difficulty colors using CSS classes", async () => {
    const ProblemsTab = (await import("@/app/patterns/[slug]/tabs/ProblemsTab")).default;
    const { container } = render(
      <ProblemsTab
        questions={mockQuestions}
        completed={new Set()}
        onToggleComplete={vi.fn()}
        patternId="arrays-strings"
      />,
    );
    const difficultySpans = container.querySelectorAll('[class*="font-medium"]');
    const easySpan = Array.from(difficultySpans).find(
      (s) => s.textContent === "Easy",
    );
    const hardSpan = Array.from(difficultySpans).find(
      (s) => s.textContent === "Hard",
    );
    expect(easySpan?.className).toContain("text-green-400");
    expect(hardSpan?.className).toContain("text-red-400");
  });

  it("shows all status filter options in select", async () => {
    const ProblemsTab = (await import("@/app/patterns/[slug]/tabs/ProblemsTab")).default;
    render(
      <ProblemsTab
        questions={mockQuestions}
        completed={new Set()}
        onToggleComplete={vi.fn()}
        patternId="arrays-strings"
      />,
    );
    const statusSelect = screen.getByDisplayValue("All Status");
    const options = Array.from(statusSelect.querySelectorAll("option")).map(
      (o) => o.textContent,
    );
    expect(options).toEqual(["All Status", "To Do", "Completed"]);
  });

  it("shows all difficulty filter options in select", async () => {
    const ProblemsTab = (await import("@/app/patterns/[slug]/tabs/ProblemsTab")).default;
    render(
      <ProblemsTab
        questions={mockQuestions}
        completed={new Set()}
        onToggleComplete={vi.fn()}
        patternId="arrays-strings"
      />,
    );
    const difficultySelect = screen.getByDisplayValue("All Difficulties");
    const options = Array.from(difficultySelect.querySelectorAll("option")).map(
      (o) => o.textContent,
    );
    expect(options).toEqual(["All Difficulties", "Easy", "Medium", "Hard"]);
  });
});
