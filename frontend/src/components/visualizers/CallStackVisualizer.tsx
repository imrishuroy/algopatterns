"use client";

import { useState, useEffect, useCallback, useMemo, useReducer } from "react";
import CodeBlock from "@/components/ui/CodeBlock";

interface StackFrame {
  id: number;
  functionName: string;
  args: string;
  returnValue?: string;
  isReturning?: boolean;
}

interface CallStackVisualizerProps {
  example?: "factorial" | "fibonacci" | "sum";
  inputValue?: number;
}

export default function CallStackVisualizer({
  example = "factorial",
  inputValue = 5,
}: CallStackVisualizerProps) {
  type PlaybackState = {
    step: number;
    stack: StackFrame[];
    result: number | null;
    isPlaying: boolean;
  };

  const initialPlayback: PlaybackState = {
    step: 0,
    stack: [],
    result: null,
    isPlaying: false,
  };

  function playbackReducer(
    state: PlaybackState,
    action:
      | { type: "RESET" }
      | { type: "STEP_FORWARD"; allSteps: StackFrame[][] }
      | { type: "SET_RESULT"; payload: number | null }
      | { type: "SET_PLAYING"; payload: boolean }
      | { type: "FINISHED"; result: number }
  ): PlaybackState {
    switch (action.type) {
      case "RESET":
        return initialPlayback;
      case "STEP_FORWARD": {
        const nextStep = state.step + 1;
        return {
          ...state,
          stack: action.allSteps[state.step] || [],
          step: nextStep,
        };
      }
      case "SET_RESULT":
        return { ...state, result: action.payload };
      case "SET_PLAYING":
        return { ...state, isPlaying: action.payload };
      case "FINISHED":
        return { ...state, isPlaying: false, result: action.result };
      default:
        return state;
    }
  }

  const [playback, dispatch] = useReducer(playbackReducer, initialPlayback);
  const { step, stack, result, isPlaying } = playback;
  const [speed, setSpeed] = useState(1000);

  const generateFactorialSteps = useCallback((n: number): StackFrame[][] => {
    const steps: StackFrame[][] = [];
    const buildStack: StackFrame[] = [];
    let frameId = 0;

    for (let i = n; i >= 0; i--) {
      buildStack.push({
        id: frameId++,
        functionName: "factorial",
        args: `n = ${i}`,
      });
      steps.push([...buildStack]);
    }

    let returnVal = 1;
    for (let i = buildStack.length - 1; i >= 0; i--) {
      buildStack[i] = {
        ...buildStack[i],
        returnValue: `${returnVal}`,
        isReturning: true,
      };
      steps.push([...buildStack]);
      buildStack.pop();
      steps.push([...buildStack]);
      if (i > 0) returnVal *= n - i + 1;
    }

    return steps;
  }, []);

  const generateFibonacciSteps = useCallback((n: number): StackFrame[][] => {
    const steps: StackFrame[][] = [];
    const currentStack: StackFrame[] = [];
    let frameId = 0;

    function simulate(num: number, depth: number): number {
      const frame: StackFrame = {
        id: frameId++,
        functionName: "fib",
        args: `n = ${num}`,
      };
      currentStack.push(frame);
      steps.push([...currentStack]);

      if (num <= 1) {
        currentStack[currentStack.length - 1] = {
          ...frame,
          returnValue: `${num}`,
          isReturning: true,
        };
        steps.push([...currentStack]);
        currentStack.pop();
        steps.push([...currentStack]);
        return num;
      }

      const left = simulate(num - 1, depth + 1);
      const right = simulate(num - 2, depth + 1);
      const result = left + right;

      if (currentStack.length > 0) {
        const idx = currentStack.findIndex((f) => f.id === frame.id);
        if (idx !== -1) {
          currentStack[idx] = {
            ...frame,
            returnValue: `${result}`,
            isReturning: true,
          };
          steps.push([...currentStack]);
          currentStack.splice(idx, 1);
          steps.push([...currentStack]);
        }
      }

      return result;
    }

    if (n <= 5) simulate(n, 0);
    return steps;
  }, []);

  const generateSumSteps = useCallback((n: number): StackFrame[][] => {
    const steps: StackFrame[][] = [];
    const buildStack: StackFrame[] = [];
    let frameId = 0;

    for (let i = n; i >= 1; i--) {
      buildStack.push({
        id: frameId++,
        functionName: "sum",
        args: `n = ${i}`,
      });
      steps.push([...buildStack]);
    }

    buildStack.push({
      id: frameId++,
      functionName: "sum",
      args: `n = 0`,
    });
    steps.push([...buildStack]);

    let returnVal = 0;
    for (let i = buildStack.length - 1; i >= 0; i--) {
      const currentN = i === buildStack.length - 1 ? 0 : n - i;
      buildStack[i] = {
        ...buildStack[i],
        returnValue: `${returnVal}`,
        isReturning: true,
      };
      steps.push([...buildStack]);
      buildStack.pop();
      steps.push([...buildStack]);
      returnVal += currentN + 1;
    }

    return steps;
  }, []);

  const allSteps = useMemo(() => {
    let steps: StackFrame[][];
    switch (example) {
      case "fibonacci":
        steps = generateFibonacciSteps(Math.min(inputValue, 5));
        break;
      case "sum":
        steps = generateSumSteps(inputValue);
        break;
      default:
        steps = generateFactorialSteps(inputValue);
    }
    return steps;
  }, [
    example,
    inputValue,
    generateFactorialSteps,
    generateFibonacciSteps,
    generateSumSteps,
  ]);

  useEffect(() => {
    dispatch({ type: "RESET" });
  }, [
    example,
    inputValue,
    generateFactorialSteps,
    generateFibonacciSteps,
    generateSumSteps,
  ]);

  useEffect(() => {
    if (!isPlaying || step >= allSteps.length) {
      if (step >= allSteps.length && allSteps.length > 0) {
        if (example === "factorial") {
          let r = 1;
          for (let i = 2; i <= inputValue; i++) r *= i;
          dispatch({ type: "FINISHED", result: r });
        } else if (example === "sum") {
          dispatch({ type: "FINISHED", result: (inputValue * (inputValue + 1)) / 2 });
        } else {
          const fib = (n: number): number =>
            n <= 1 ? n : fib(n - 1) + fib(n - 2);
          dispatch({ type: "FINISHED", result: fib(inputValue) });
        }
      }
      return;
    }

    const timer = setTimeout(() => {
      dispatch({ type: "STEP_FORWARD", allSteps });
    }, speed);

    return () => clearTimeout(timer);
  }, [isPlaying, step, allSteps, speed, example, inputValue]);

  const reset = () => {
    dispatch({ type: "RESET" });
  };

  const stepForward = () => {
    if (step < allSteps.length) {
      dispatch({ type: "STEP_FORWARD", allSteps });
    }
  };

  const exampleCode = {
    factorial: `public int factorial(int n) {
    if (n == 0) return 1;
    return n * factorial(n - 1);
}`,
    fibonacci: `public int fib(int n) {
    if (n <= 1) return n;
    return fib(n - 1) + fib(n - 2);
}`,
    sum: `public int sum(int n) {
    if (n == 0) return 0;
    return n + sum(n - 1);
}`,
  };

  return (
    <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gray-800/50 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          Call Stack Visualizer
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Watch how recursive calls build up on the stack
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 p-4">
        <div>
          <div className="mb-4">
            <CodeBlock
              code={exampleCode[example]}
              language="java"
              showCopy={false}
            />
          </div>

          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <button
              onClick={() => dispatch({ type: "SET_PLAYING", payload: !isPlaying })}
              className={`px-4 py-2 rounded-md font-medium transition ${
                isPlaying
                  ? "bg-yellow-500 text-black hover:bg-yellow-400"
                  : "bg-green-500 text-white hover:bg-green-400"
              }`}
            >
              {isPlaying ? "⏸ Pause" : "▶ Play"}
            </button>
            <button
              onClick={stepForward}
              disabled={isPlaying || step >= allSteps.length}
              className="px-4 py-2 bg-indigo-500 text-white rounded-md font-medium hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Step →
            </button>
            <button
              onClick={reset}
              className="px-4 py-2 bg-gray-700 text-white rounded-md font-medium hover:bg-gray-600 transition"
            >
              Reset
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Speed:</span>
            <input
              type="range"
              min="200"
              max="2000"
              step="100"
              value={2200 - speed}
              onChange={(e) => setSpeed(2200 - Number(e.target.value))}
              className="w-32 accent-indigo-500"
            />
            <span className="text-gray-500 text-xs">{speed}ms</span>
          </div>

          {result !== null && (
            <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-md">
              <span className="text-green-400 font-medium">
                Result: {result}
              </span>
            </div>
          )}
        </div>

        <div className="bg-gray-800/50 rounded-md p-4 min-h-[300px]">
          <div className="text-sm text-gray-400 mb-3 flex justify-between">
            <span>
              Call Stack (Step {step}/{allSteps.length})
            </span>
            <span className="text-indigo-400">{stack.length} frames</span>
          </div>

          <div className="space-y-2">
            {stack.length === 0 ? (
              <div className="text-gray-600 text-center py-8">
                Stack is empty. Click Play to start.
              </div>
            ) : (
              [...stack].reverse().map((frame, idx) => (
                <div
                  key={frame.id}
                  className={`p-3 rounded-md border transition-all duration-300 ${
                    frame.isReturning
                      ? "bg-green-500/20 border-green-500/50 animate-pulse"
                      : idx === 0
                        ? "bg-indigo-500/20 border-indigo-500/50"
                        : "bg-gray-700/50 border-gray-700"
                  }`}
                  style={{
                    animation: !frame.isReturning
                      ? "slideIn 0.3s ease-out"
                      : undefined,
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-sm">
                      <span
                        className={
                          frame.isReturning
                            ? "text-green-400"
                            : "text-indigo-400"
                        }
                      >
                        {frame.functionName}
                      </span>
                      <span className="text-gray-400">({frame.args})</span>
                    </span>
                    {frame.returnValue && (
                      <span className="text-green-400 text-sm font-mono">
                        → {frame.returnValue}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="text-xs text-gray-500">
              ↑ Top of stack (most recent call)
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
