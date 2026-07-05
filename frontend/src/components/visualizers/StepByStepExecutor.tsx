"use client";

import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface ExecutionStep {
  lineNumber: number;
  variables: Record<string, string | number>;
  callStack: string[];
  output?: string;
  explanation: string;
}

interface StepByStepExecutorProps {
  example?: "factorial" | "fibonacci" | "reverse-string";
}

const examples = {
  factorial: {
    code: `public int factorial(int n) {
    if (n == 0) {
        return 1;
    }
    return n * factorial(n - 1);
}

// Call: factorial(4)`,
    steps: [
      {
        lineNumber: 8,
        variables: { n: 4 },
        callStack: ["factorial(4)"],
        explanation: "Starting factorial(4)",
      },
      {
        lineNumber: 2,
        variables: { n: 4 },
        callStack: ["factorial(4)"],
        explanation: "Check if n == 0? No, 4 != 0",
      },
      {
        lineNumber: 5,
        variables: { n: 4 },
        callStack: ["factorial(4)"],
        explanation: "Need to compute 4 * factorial(3)",
      },
      {
        lineNumber: 2,
        variables: { n: 3 },
        callStack: ["factorial(4)", "factorial(3)"],
        explanation: "In factorial(3): Check if n == 0? No",
      },
      {
        lineNumber: 5,
        variables: { n: 3 },
        callStack: ["factorial(4)", "factorial(3)"],
        explanation: "Need to compute 3 * factorial(2)",
      },
      {
        lineNumber: 2,
        variables: { n: 2 },
        callStack: ["factorial(4)", "factorial(3)", "factorial(2)"],
        explanation: "In factorial(2): Check if n == 0? No",
      },
      {
        lineNumber: 5,
        variables: { n: 2 },
        callStack: ["factorial(4)", "factorial(3)", "factorial(2)"],
        explanation: "Need to compute 2 * factorial(1)",
      },
      {
        lineNumber: 2,
        variables: { n: 1 },
        callStack: [
          "factorial(4)",
          "factorial(3)",
          "factorial(2)",
          "factorial(1)",
        ],
        explanation: "In factorial(1): Check if n == 0? No",
      },
      {
        lineNumber: 5,
        variables: { n: 1 },
        callStack: [
          "factorial(4)",
          "factorial(3)",
          "factorial(2)",
          "factorial(1)",
        ],
        explanation: "Need to compute 1 * factorial(0)",
      },
      {
        lineNumber: 2,
        variables: { n: 0 },
        callStack: [
          "factorial(4)",
          "factorial(3)",
          "factorial(2)",
          "factorial(1)",
          "factorial(0)",
        ],
        explanation: "In factorial(0): Check if n == 0? YES! Base case!",
      },
      {
        lineNumber: 3,
        variables: { n: 0, return: 1 },
        callStack: [
          "factorial(4)",
          "factorial(3)",
          "factorial(2)",
          "factorial(1)",
          "factorial(0)",
        ],
        explanation: "Return 1 (base case)",
        output: "factorial(0) = 1",
      },
      {
        lineNumber: 5,
        variables: { n: 1, return: 1 },
        callStack: [
          "factorial(4)",
          "factorial(3)",
          "factorial(2)",
          "factorial(1)",
        ],
        explanation: "Back to factorial(1): return 1 * 1 = 1",
        output: "factorial(1) = 1",
      },
      {
        lineNumber: 5,
        variables: { n: 2, return: 2 },
        callStack: ["factorial(4)", "factorial(3)", "factorial(2)"],
        explanation: "Back to factorial(2): return 2 * 1 = 2",
        output: "factorial(2) = 2",
      },
      {
        lineNumber: 5,
        variables: { n: 3, return: 6 },
        callStack: ["factorial(4)", "factorial(3)"],
        explanation: "Back to factorial(3): return 3 * 2 = 6",
        output: "factorial(3) = 6",
      },
      {
        lineNumber: 5,
        variables: { n: 4, return: 24 },
        callStack: ["factorial(4)"],
        explanation: "Back to factorial(4): return 4 * 6 = 24",
        output: "factorial(4) = 24",
      },
    ] as ExecutionStep[],
  },
  fibonacci: {
    code: `public int fib(int n) {
    if (n <= 1) {
        return n;
    }
    return fib(n - 1) + fib(n - 2);
}

// Call: fib(4)`,
    steps: [
      {
        lineNumber: 8,
        variables: { n: 4 },
        callStack: ["fib(4)"],
        explanation: "Starting fib(4)",
      },
      {
        lineNumber: 2,
        variables: { n: 4 },
        callStack: ["fib(4)"],
        explanation: "Check if n <= 1? No, 4 > 1",
      },
      {
        lineNumber: 5,
        variables: { n: 4 },
        callStack: ["fib(4)"],
        explanation: "Need fib(3) + fib(2), calling fib(3) first",
      },
      {
        lineNumber: 2,
        variables: { n: 3 },
        callStack: ["fib(4)", "fib(3)"],
        explanation: "In fib(3): Check if n <= 1? No",
      },
      {
        lineNumber: 5,
        variables: { n: 3 },
        callStack: ["fib(4)", "fib(3)"],
        explanation: "Need fib(2) + fib(1), calling fib(2) first",
      },
      {
        lineNumber: 2,
        variables: { n: 2 },
        callStack: ["fib(4)", "fib(3)", "fib(2)"],
        explanation: "In fib(2): Check if n <= 1? No",
      },
      {
        lineNumber: 2,
        variables: { n: 1 },
        callStack: ["fib(4)", "fib(3)", "fib(2)", "fib(1)"],
        explanation: "In fib(1): Check if n <= 1? YES!",
        output: "fib(1) = 1",
      },
      {
        lineNumber: 2,
        variables: { n: 0 },
        callStack: ["fib(4)", "fib(3)", "fib(2)", "fib(0)"],
        explanation: "In fib(0): Check if n <= 1? YES!",
        output: "fib(0) = 0",
      },
      {
        lineNumber: 5,
        variables: { n: 2, return: 1 },
        callStack: ["fib(4)", "fib(3)", "fib(2)"],
        explanation: "fib(2) = fib(1) + fib(0) = 1 + 0 = 1",
        output: "fib(2) = 1",
      },
      {
        lineNumber: 2,
        variables: { n: 1 },
        callStack: ["fib(4)", "fib(3)", "fib(1)"],
        explanation: "Now calling fib(1) for fib(3)",
        output: "fib(1) = 1",
      },
      {
        lineNumber: 5,
        variables: { n: 3, return: 2 },
        callStack: ["fib(4)", "fib(3)"],
        explanation: "fib(3) = fib(2) + fib(1) = 1 + 1 = 2",
        output: "fib(3) = 2",
      },
      {
        lineNumber: 5,
        variables: { n: 4 },
        callStack: ["fib(4)", "fib(2)"],
        explanation: "Now calling fib(2) for fib(4)",
        output: "fib(2) = 1",
      },
      {
        lineNumber: 5,
        variables: { n: 4, return: 3 },
        callStack: ["fib(4)"],
        explanation: "fib(4) = fib(3) + fib(2) = 2 + 1 = 3",
        output: "fib(4) = 3",
      },
    ] as ExecutionStep[],
  },
  "reverse-string": {
    code: `public String reverse(String str) {
    if (str.isEmpty()) {
        return "";
    }
    return reverse(str.substring(1)) + str.charAt(0);
}

// Call: reverse("hello")`,
    steps: [
      {
        lineNumber: 8,
        variables: { str: '"hello"' },
        callStack: ['reverse("hello")'],
        explanation: 'Starting reverse("hello")',
      },
      {
        lineNumber: 2,
        variables: { str: '"hello"' },
        callStack: ['reverse("hello")'],
        explanation: "Check if str.isEmpty()? No",
      },
      {
        lineNumber: 5,
        variables: { str: '"hello"', "charAt(0)": '"h"' },
        callStack: ['reverse("hello")'],
        explanation: 'Need reverse("ello") + "h"',
      },
      {
        lineNumber: 2,
        variables: { str: '"ello"' },
        callStack: ['reverse("hello")', 'reverse("ello")'],
        explanation: 'In reverse("ello"): Check if str.isEmpty()? No',
      },
      {
        lineNumber: 5,
        variables: { str: '"ello"', "charAt(0)": '"e"' },
        callStack: ['reverse("hello")', 'reverse("ello")'],
        explanation: 'Need reverse("llo") + "e"',
      },
      {
        lineNumber: 2,
        variables: { str: '"llo"' },
        callStack: ['reverse("hello")', 'reverse("ello")', 'reverse("llo")'],
        explanation: 'In reverse("llo"): Check if str.isEmpty()? No',
      },
      {
        lineNumber: 5,
        variables: { str: '"llo"', "charAt(0)": '"l"' },
        callStack: ['reverse("hello")', 'reverse("ello")', 'reverse("llo")'],
        explanation: 'Need reverse("lo") + "l"',
      },
      {
        lineNumber: 2,
        variables: { str: '"lo"' },
        callStack: [
          'reverse("hello")',
          'reverse("ello")',
          'reverse("llo")',
          'reverse("lo")',
        ],
        explanation: 'In reverse("lo"): Check if str.isEmpty()? No',
      },
      {
        lineNumber: 5,
        variables: { str: '"lo"', "charAt(0)": '"l"' },
        callStack: [
          'reverse("hello")',
          'reverse("ello")',
          'reverse("llo")',
          'reverse("lo")',
        ],
        explanation: 'Need reverse("o") + "l"',
      },
      {
        lineNumber: 2,
        variables: { str: '"o"' },
        callStack: [
          'reverse("hello")',
          'reverse("ello")',
          'reverse("llo")',
          'reverse("lo")',
          'reverse("o")',
        ],
        explanation: 'In reverse("o"): Check if str.isEmpty()? No',
      },
      {
        lineNumber: 5,
        variables: { str: '"o"', "charAt(0)": '"o"' },
        callStack: [
          'reverse("hello")',
          'reverse("ello")',
          'reverse("llo")',
          'reverse("lo")',
          'reverse("o")',
        ],
        explanation: 'Need reverse("") + "o"',
      },
      {
        lineNumber: 3,
        variables: { str: '""' },
        callStack: [
          'reverse("hello")',
          'reverse("ello")',
          'reverse("llo")',
          'reverse("lo")',
          'reverse("o")',
          'reverse("")',
        ],
        explanation: 'BASE CASE! reverse("") = ""',
        output: 'reverse("") = ""',
      },
      {
        lineNumber: 5,
        variables: { return: '"o"' },
        callStack: [
          'reverse("hello")',
          'reverse("ello")',
          'reverse("llo")',
          'reverse("lo")',
          'reverse("o")',
        ],
        explanation: 'reverse("o") = "" + "o" = "o"',
        output: 'reverse("o") = "o"',
      },
      {
        lineNumber: 5,
        variables: { return: '"ol"' },
        callStack: [
          'reverse("hello")',
          'reverse("ello")',
          'reverse("llo")',
          'reverse("lo")',
        ],
        explanation: 'reverse("lo") = "o" + "l" = "ol"',
        output: 'reverse("lo") = "ol"',
      },
      {
        lineNumber: 5,
        variables: { return: '"oll"' },
        callStack: ['reverse("hello")', 'reverse("ello")', 'reverse("llo")'],
        explanation: 'reverse("llo") = "ol" + "l" = "oll"',
        output: 'reverse("llo") = "oll"',
      },
      {
        lineNumber: 5,
        variables: { return: '"olle"' },
        callStack: ['reverse("hello")', 'reverse("ello")'],
        explanation: 'reverse("ello") = "oll" + "e" = "olle"',
        output: 'reverse("ello") = "olle"',
      },
      {
        lineNumber: 5,
        variables: { return: '"olleh"' },
        callStack: ['reverse("hello")'],
        explanation: 'reverse("hello") = "olle" + "h" = "olleh"',
        output: 'reverse("hello") = "olleh"',
      },
    ] as ExecutionStep[],
  },
};

const customStyle = {
  ...oneDark,
  'pre[class*="language-"]': {
    ...oneDark['pre[class*="language-"]'],
    background: "transparent",
    margin: 0,
    padding: 0,
    fontSize: "0.875rem",
    lineHeight: "1.6",
  },
  'code[class*="language-"]': {
    ...oneDark['code[class*="language-"]'],
    background: "transparent",
    fontSize: "0.875rem",
  },
};

export default function StepByStepExecutor({
  example = "factorial",
}: StepByStepExecutorProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedExample, setSelectedExample] =
    useState<keyof typeof examples>(example);
  const [outputs, setOutputs] = useState<string[]>([]);

  const data = examples[selectedExample];
  const step = data.steps[currentStep];
  const codeLines = data.code.split("\n");

  const handleNext = () => {
    if (currentStep < data.steps.length - 1) {
      const nextStep = data.steps[currentStep + 1];
      if (nextStep.output) {
        setOutputs((prev) => [...prev, nextStep.output!]);
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const currentStepData = data.steps[currentStep];
      if (currentStepData.output) {
        setOutputs((prev) => prev.slice(0, -1));
      }
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setOutputs([]);
  };

  const handleExampleChange = (ex: keyof typeof examples) => {
    setSelectedExample(ex);
    setCurrentStep(0);
    setOutputs([]);
  };

  return (
    <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gray-800/50 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          Step-by-Step Execution
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Walk through each line of code execution
        </p>
      </div>

      <div className="p-4">
        <div className="flex gap-2 mb-4 flex-wrap">
          {(Object.keys(examples) as Array<keyof typeof examples>).map((ex) => (
            <button
              key={ex}
              onClick={() => handleExampleChange(ex)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                selectedExample === ex
                  ? "bg-indigo-500 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {ex === "factorial"
                ? "Factorial"
                : ex === "fibonacci"
                  ? "Fibonacci"
                  : "Reverse String"}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="bg-[#011627] rounded-md overflow-hidden">
              <div className="px-4 py-2 bg-[#0d1b2a] border-b border-gray-800 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                <span className="text-xs text-gray-400 ml-2">Java</span>
              </div>
              <div className="p-4">
                {codeLines.map((line, idx) => {
                  const lineNum = idx + 1;
                  const isActive = lineNum === step.lineNumber;
                  return (
                    <div
                      key={`line-${lineNum}-${line.slice(0, 20).replace(/\s+/g, "")}`}
                      className={`flex transition-all duration-200 ${
                        isActive ? "bg-yellow-500/20 -mx-4 px-4 rounded-md" : ""
                      }`}
                    >
                      <span
                        className={`w-8 text-right mr-4 select-none font-mono text-sm ${
                          isActive ? "text-yellow-400" : "text-gray-600"
                        }`}
                      >
                        {lineNum}
                      </span>
                      <div className="flex-1 overflow-hidden">
                        <SyntaxHighlighter
                          language="java"
                          style={customStyle}
                          customStyle={{
                            margin: 0,
                            padding: 0,
                            background: "transparent",
                          }}
                          codeTagProps={{
                            style: {
                              fontFamily:
                                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                            },
                          }}
                        >
                          {line || " "}
                        </SyntaxHighlighter>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex gap-2">
                <button
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className="px-4 py-2 bg-gray-700 text-white rounded-md font-medium hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Prev
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentStep >= data.steps.length - 1}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-md font-medium hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </div>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-md text-sm hover:bg-gray-700 transition"
              >
                Reset
              </button>
            </div>

            <div className="mt-2 text-sm text-gray-500">
              Step {currentStep + 1} of {data.steps.length}
            </div>
          </div>

          <div className="space-y-4">
            <div
              className={`p-4 rounded-md border ${
                step.explanation.includes("BASE CASE") ||
                step.explanation.includes("base case")
                  ? "bg-yellow-500/10 border-yellow-500/30"
                  : step.explanation.includes("Back to") ||
                      step.explanation.includes("Return")
                    ? "bg-green-500/10 border-green-500/30"
                    : "bg-gray-800/50 border-gray-700"
              }`}
            >
              <h4 className="text-sm font-medium text-gray-400 mb-2">
                Explanation
              </h4>
              <p
                className={`${
                  step.explanation.includes("BASE CASE") ||
                  step.explanation.includes("base case")
                    ? "text-yellow-300"
                    : step.explanation.includes("Back to")
                      ? "text-green-300"
                      : "text-white"
                }`}
              >
                {step.explanation}
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-md p-4">
              <h4 className="text-sm font-medium text-gray-400 mb-3">
                Variables
              </h4>
              <div className="space-y-2">
                {Object.entries(step.variables).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between items-center px-3 py-2 bg-gray-700/50 rounded-md"
                  >
                    <span className="text-indigo-400 font-mono text-sm">
                      {key}
                    </span>
                    <span className="text-white font-mono text-sm">
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-md p-4">
              <h4 className="text-sm font-medium text-gray-400 mb-3">
                Call Stack ({step.callStack.length})
              </h4>
              <div className="space-y-1">
                {[...step.callStack].reverse().map((call, idx) => (
                  <div
                    key={`${call}-${idx}`}
                    className={`px-3 py-2 rounded-md font-mono text-sm ${
                      idx === 0
                        ? "bg-indigo-500/20 border border-indigo-500/50 text-indigo-300"
                        : "bg-gray-700/30 text-gray-400"
                    }`}
                  >
                    {call}
                  </div>
                ))}
              </div>
            </div>

            {outputs.length > 0 && (
              <div className="bg-gray-800/50 rounded-md p-4">
                <h4 className="text-sm font-medium text-gray-400 mb-3">
                  Returns
                </h4>
                <div className="space-y-1 font-mono text-sm">
                  {outputs.map((output, idx) => (
                    <div key={`${output}-${idx}`} className="text-green-400">
                      {output}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
