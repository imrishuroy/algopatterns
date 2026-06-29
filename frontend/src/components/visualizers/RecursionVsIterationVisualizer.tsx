"use client";

import { useState, useEffect, useReducer, startTransition } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface ExecutionState {
  step: number;
  variables: Record<string, number | string>;
  output?: string;
  highlight: number;
}

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

type PlayState = { step: number; isPlaying: boolean };
type PlayAction =
  | { type: "TOGGLE" }
  | { type: "STOP" }
  | { type: "ADVANCE" }
  | { type: "RESET" };

function playReducer(state: PlayState, action: PlayAction): PlayState {
  switch (action.type) {
    case "TOGGLE":
      return { ...state, isPlaying: !state.isPlaying };
    case "STOP":
      return { ...state, isPlaying: false };
    case "ADVANCE":
      return { ...state, step: state.step + 1 };
    case "RESET":
      return { step: 0, isPlaying: false };
    default:
      return state;
  }
}

export default function RecursionVsIterationVisualizer() {
  const [input, setInput] = useState(5);
  const [{ isPlaying }, dispatch] = useReducer(playReducer, { step: 0, isPlaying: false });
  const [recursionStep, setRecursionStep] = useState(0);
  const [iterationStep, setIterationStep] = useState(0);
  const [speed, setSpeed] = useState(800);

  const recursiveCode = `int factRec(int n) {
    if (n == 0) return 1;
    return n * factRec(n - 1);
}`;

  const iterativeCode = `int factIter(int n) {
    int result = 1;
    for (int i = n; i > 0; i--) {
        result = result * i;
    }
    return result;
}`;

  const generateRecursionSteps = (n: number): ExecutionState[] => {
    const steps: ExecutionState[] = [];

    for (let i = n; i >= 0; i--) {
      steps.push({
        step: steps.length,
        variables: { n: i, "stack depth": n - i + 1 },
        highlight: i === 0 ? 2 : 3,
        output:
          i === 0 ? "Base case! Return 1" : `Waiting for factRec(${i - 1})...`,
      });
    }

    let result = 1;
    for (let i = 0; i <= n; i++) {
      steps.push({
        step: steps.length,
        variables: { n: i, result, "stack depth": n - i + 1 },
        highlight: 3,
        output:
          i === 0 ? "Return 1" : `Return ${i} * ${result / i} = ${result}`,
      });
      result *= i + 1;
    }

    return steps;
  };

  const generateIterationSteps = (n: number): ExecutionState[] => {
    const steps: ExecutionState[] = [];

    steps.push({
      step: 0,
      variables: { result: 1, i: n, n },
      highlight: 2,
      output: "Initialize result = 1",
    });

    let result = 1;
    for (let i = n; i > 0; i--) {
      steps.push({
        step: steps.length,
        variables: { result, i, n },
        highlight: 3,
        output: `Loop: i = ${i}, check i > 0? Yes`,
      });

      result *= i;
      steps.push({
        step: steps.length,
        variables: { result, i, n },
        highlight: 4,
        output: `result = ${result / i} * ${i} = ${result}`,
      });
    }

    steps.push({
      step: steps.length,
      variables: { result, i: 0, n },
      highlight: 6,
      output: `Loop ended. Return ${result}`,
    });

    return steps;
  };

  const recursionSteps = generateRecursionSteps(input);
  const iterationSteps = generateIterationSteps(input);

  const currentRecursion = recursionSteps[recursionStep] || recursionSteps[0];
  const currentIteration = iterationSteps[iterationStep] || iterationSteps[0];

  useEffect(() => {
    if (!isPlaying) return;

    const maxSteps = Math.max(recursionSteps.length, iterationSteps.length);
    const currentMax = Math.max(recursionStep, iterationStep);

    if (currentMax >= maxSteps - 1) {
      startTransition(() => {
        dispatch({ type: "STOP" });
      });
      return;
    }

    const timer = setTimeout(() => {
      if (recursionStep < recursionSteps.length - 1) {
        setRecursionStep((s) => s + 1);
      }
      if (iterationStep < iterationSteps.length - 1) {
        setIterationStep((s) => s + 1);
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [
    isPlaying,
    recursionStep,
    iterationStep,
    speed,
    recursionSteps.length,
    iterationSteps.length,
  ]);

  const reset = () => {
    setRecursionStep(0);
    setIterationStep(0);
    dispatch({ type: "STOP" });
  };

  const recursiveLines = recursiveCode.split("\n");
  const iterativeLines = iterativeCode.split("\n");

  const factorial = (n: number): number => {
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
  };

  return (
    <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gray-800/50 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          Recursion vs Iteration
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Compare how both approaches solve the same problem
        </p>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-4 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-gray-400 text-sm">Input n:</label>
            <input
              type="number"
              min="1"
              max="7"
              value={input}
              onChange={(e) => {
                setInput(
                  Math.min(7, Math.max(1, parseInt(e.target.value) || 1))
                );
                reset();
              }}
              className="w-16 px-2 py-1 bg-gray-800 border border-gray-700 rounded-md text-white text-center"
            />
          </div>

          <button
            onClick={() => dispatch({ type: "TOGGLE" })}
            className={`px-4 py-2 rounded-md font-medium transition ${
              isPlaying
                ? "bg-yellow-500 text-black hover:bg-yellow-400"
                : "bg-green-500 text-white hover:bg-green-400"
            }`}
          >
            {isPlaying ? "⏸ Pause" : "▶ Play Both"}
          </button>

          <button
            onClick={reset}
            className="px-4 py-2 bg-gray-700 text-white rounded-md font-medium hover:bg-gray-600 transition"
          >
            Reset
          </button>

          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Speed:</span>
            <input
              type="range"
              min="200"
              max="1500"
              step="100"
              value={1700 - speed}
              onChange={(e) => setSpeed(1700 - Number(e.target.value))}
              className="w-24 accent-indigo-500"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="border border-purple-500/30 rounded-md overflow-hidden">
            <div className="px-4 py-2 bg-purple-500/20 border-b border-purple-500/30 flex justify-between items-center">
              <span className="font-medium text-purple-300">Recursive</span>
              <span className="text-xs text-purple-400">
                Step {recursionStep + 1}/{recursionSteps.length}
              </span>
            </div>

            <div className="bg-[#011627] p-4">
              {recursiveLines.map((line, idx) => {
                const lineNum = idx + 1;
                const isActive = lineNum === currentRecursion.highlight;
                return (
                  <div
                    key={`rec-line-${lineNum}-${line.slice(0, 10)}`}
                    className={`flex transition-all duration-200 ${
                      isActive ? "bg-purple-500/20 -mx-4 px-4 rounded-md" : ""
                    }`}
                  >
                    <span
                      className={`w-6 text-right mr-3 select-none font-mono text-sm ${
                        isActive ? "text-purple-400" : "text-gray-600"
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

            <div className="p-3 bg-gray-800/50 border-t border-gray-700">
              <div className="flex flex-wrap gap-2 mb-2">
                {Object.entries(currentRecursion.variables).map(
                  ([key, value]) => (
                    <span
                      key={key}
                      className="px-2 py-1 bg-purple-500/20 rounded-md text-xs font-mono text-purple-300"
                    >
                      {key}: {value}
                    </span>
                  )
                )}
              </div>
              <p className="text-sm text-gray-300">{currentRecursion.output}</p>
            </div>
          </div>

          <div className="border border-blue-500/30 rounded-md overflow-hidden">
            <div className="px-4 py-2 bg-blue-500/20 border-b border-blue-500/30 flex justify-between items-center">
              <span className="font-medium text-blue-300">Iterative</span>
              <span className="text-xs text-blue-400">
                Step {iterationStep + 1}/{iterationSteps.length}
              </span>
            </div>

            <div className="bg-[#011627] p-4">
              {iterativeLines.map((line, idx) => {
                const lineNum = idx + 1;
                const isActive = lineNum === currentIteration.highlight;
                return (
                  <div
                    key={`iter-line-${lineNum}-${line.slice(0, 10)}`}
                    className={`flex transition-all duration-200 ${
                      isActive ? "bg-blue-500/20 -mx-4 px-4 rounded-md" : ""
                    }`}
                  >
                    <span
                      className={`w-6 text-right mr-3 select-none font-mono text-sm ${
                        isActive ? "text-blue-400" : "text-gray-600"
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

            <div className="p-3 bg-gray-800/50 border-t border-gray-700">
              <div className="flex flex-wrap gap-2 mb-2">
                {Object.entries(currentIteration.variables).map(
                  ([key, value]) => (
                    <span
                      key={key}
                      className="px-2 py-1 bg-blue-500/20 rounded-md text-xs font-mono text-blue-300"
                    >
                      {key}: {value}
                    </span>
                  )
                )}
              </div>
              <p className="text-sm text-gray-300">{currentIteration.output}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-lg font-bold text-white">
              {factorial(input)}
            </div>
            <div className="text-xs text-gray-500">Result ({input}!)</div>
          </div>
          <div className="bg-purple-500/10 rounded-md p-3 text-center">
            <div className="text-lg font-bold text-purple-400">O(n)</div>
            <div className="text-xs text-gray-500">Rec. Space</div>
          </div>
          <div className="bg-blue-500/10 rounded-md p-3 text-center">
            <div className="text-lg font-bold text-blue-400">O(1)</div>
            <div className="text-xs text-gray-500">Iter. Space</div>
          </div>
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-lg font-bold text-white">O(n)</div>
            <div className="text-xs text-gray-500">Both Time</div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-md">
          <p className="text-indigo-300 text-sm">
            <strong>Key Insight:</strong> Recursion uses the call stack
            implicitly (O(n) space), while iteration uses explicit variables
            (O(1) space). Both achieve O(n) time complexity for this problem.
          </p>
        </div>
      </div>
    </div>
  );
}
