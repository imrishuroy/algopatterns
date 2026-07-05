"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useReducer,
  startTransition,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

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

export default function SubsetsVisualizer() {
  const [{ isPlaying }, dispatch] = useReducer(playReducer, {
    step: 0,
    isPlaying: false,
  });
  const [speed, setSpeed] = useState(800);
  const [nums] = useState([1, 2, 3]);
  const [currentPath, setCurrentPath] = useState<number[]>([]);
  const [results, setResults] = useState<number[][]>([]);
  const [phase, setPhase] = useState<"init" | "running" | "done">("init");
  const [message, setMessage] = useState("Click Play to generate all subsets");
  const [stepIndex, setStepIndex] = useState(-1);
  const [steps, setSteps] = useState<
    { path: number[]; action: "add" | "choose" | "backtrack"; index: number }[]
  >([]);

  const generateSteps = useCallback(() => {
    const allSteps: {
      path: number[];
      action: "add" | "choose" | "backtrack";
      index: number;
    }[] = [];

    function backtrack(start: number, path: number[]) {
      allSteps.push({ path: [...path], action: "add", index: start });

      for (let i = start; i < nums.length; i++) {
        allSteps.push({ path: [...path, nums[i]], action: "choose", index: i });
        backtrack(i + 1, [...path, nums[i]]);
        allSteps.push({ path: [...path], action: "backtrack", index: i });
      }
    }

    backtrack(0, []);
    return allSteps;
  }, [nums]);

  const reset = useCallback(() => {
    setCurrentPath([]);
    setResults([]);
    setPhase("init");
    setMessage("Click Play to generate all subsets");
    setStepIndex(-1);
    setSteps(generateSteps());
    dispatch({ type: "STOP" });
  }, [generateSteps]);

  useEffect(() => {
    startTransition(() => {
      setSteps(generateSteps());
    });
  }, [generateSteps]);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (phase === "init") {
        setPhase("running");
        setStepIndex(0);
        const step = steps[0];
        setCurrentPath(step.path);
        setResults([step.path]);
        setMessage(`Add [] to results (empty subset is valid)`);
        return;
      }

      const nextStepIdx = stepIndex + 1;
      if (nextStepIdx >= steps.length) {
        setPhase("done");
        setMessage(
          `Done! Generated all ${results.length} subsets using backtracking`
        );
        dispatch({ type: "STOP" });
        return;
      }

      const step = steps[nextStepIdx];
      setStepIndex(nextStepIdx);
      setCurrentPath(step.path);

      if (step.action === "add") {
        setResults((prev) => [...prev, step.path]);
        setMessage(`Add [${step.path.join(", ")}] to results`);
      } else if (step.action === "choose") {
        setMessage(
          `Choose ${nums[step.index]}, path = [${step.path.join(", ")}]`
        );
      } else {
        setMessage(
          `Backtrack: remove ${nums[step.index]}, path = [${step.path.join(", ")}]`
        );
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [isPlaying, phase, stepIndex, steps, nums, results.length, speed]);

  return (
    <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">Subsets Generator</h3>
        <p className="text-gray-400 text-sm mt-1">
          Generate all 2^n subsets using backtracking
        </p>
      </div>

      <div className="p-4">
        {/* Controls */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => dispatch({ type: "TOGGLE" })}
            disabled={phase === "done"}
            className={`px-4 py-2 rounded-md font-medium transition ${
              isPlaying ? "bg-yellow-500 text-black" : "bg-green-500 text-white"
            } disabled:opacity-50`}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            onClick={reset}
            className="px-4 py-2 bg-gray-700 text-white rounded-md font-medium hover:bg-gray-600"
          >
            Reset
          </button>
          <div className="flex items-center gap-2 ml-4">
            <span className="text-gray-400 text-sm">Speed:</span>
            <input
              type="range"
              min="400"
              max="1200"
              step="100"
              value={1600 - speed}
              onChange={(e) => setSpeed(1600 - Number(e.target.value))}
              className="w-20 accent-purple-500"
            />
          </div>
        </div>

        {/* Input array */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">Input Array:</div>
          <div className="flex gap-2 justify-center">
            {nums.map((num, idx) => (
              <motion.div
                key={`${num}-${idx}`}
                animate={{
                  backgroundColor: currentPath.includes(num)
                    ? "#a855f7"
                    : "#374151",
                  scale: currentPath.includes(num) ? 1.1 : 1,
                }}
                className="w-12 h-12 rounded-md flex flex-col items-center justify-center"
              >
                <span
                  className={`font-bold ${currentPath.includes(num) ? "text-white" : "text-white"}`}
                >
                  {num}
                </span>
                <span className="text-xs text-gray-400">{idx}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Current path */}
        <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-md">
          <div className="text-sm text-gray-400 mb-1">Current Path:</div>
          <div className="text-purple-400 font-mono text-lg">
            [{currentPath.join(", ")}]
          </div>
        </div>

        {/* Decision tree visualization */}
        <div className="mb-4 p-3 bg-gray-800/50 rounded-md">
          <div className="text-sm text-gray-400 mb-2">Decision Tree:</div>
          <pre className="text-xs text-gray-300 font-mono overflow-x-auto">
            {`                    []
           /        |        \\
         [1]       [2]       [3]
        /   \\       |
     [1,2] [1,3]  [2,3]
       |
    [1,2,3]`}
          </pre>
        </div>

        {/* Results */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">
            Results ({results.length} / {Math.pow(2, nums.length)}):
          </div>
          <div className="flex flex-wrap gap-2 min-h-[40px]">
            <AnimatePresence>
              {results.map((subset, idx) => (
                <motion.div
                  key={`[${subset.join(",")}]-${idx}`}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-md text-green-400 font-mono text-sm"
                >
                  [{subset.join(", ")}]
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Message */}
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-md text-sm ${
            phase === "done"
              ? "bg-green-500/10 border border-green-500/30 text-green-400"
              : "bg-gray-800 text-gray-300"
          }`}
        >
          {message}
        </motion.div>

        {/* Key insight */}
        <div className="mt-4 p-3 bg-gray-800/30 rounded-md text-sm text-gray-400">
          <p>
            <strong className="text-purple-400">Key Insight:</strong> At each
            index, we have two choices: include the element or skip it. Total
            subsets = 2^n (each element can be in or out).
          </p>
        </div>
      </div>
    </div>
  );
}
