"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PermutationsVisualizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(700);
  const [nums] = useState([1, 2, 3]);
  const [currentPath, setCurrentPath] = useState<number[]>([]);
  const [used, setUsed] = useState<boolean[]>([false, false, false]);
  const [results, setResults] = useState<number[][]>([]);
  const [phase, setPhase] = useState<"init" | "running" | "done">("init");
  const [message, setMessage] = useState(
    "Click Play to generate all permutations"
  );
  const [stepIndex, setStepIndex] = useState(-1);
  const [steps, setSteps] = useState<
    {
      path: number[];
      used: boolean[];
      action: "add" | "choose" | "backtrack";
      index: number;
    }[]
  >([]);

  const generateSteps = useCallback(() => {
    const allSteps: {
      path: number[];
      used: boolean[];
      action: "add" | "choose" | "backtrack";
      index: number;
    }[] = [];

    function backtrack(path: number[], usedArr: boolean[]) {
      if (path.length === nums.length) {
        allSteps.push({
          path: [...path],
          used: [...usedArr],
          action: "add",
          index: -1,
        });
        return;
      }

      for (let i = 0; i < nums.length; i++) {
        if (usedArr[i]) continue;

        usedArr[i] = true;
        path.push(nums[i]);
        allSteps.push({
          path: [...path],
          used: [...usedArr],
          action: "choose",
          index: i,
        });

        backtrack(path, usedArr);

        path.pop();
        usedArr[i] = false;
        if (path.length < nums.length - 1 || i < nums.length - 1) {
          allSteps.push({
            path: [...path],
            used: [...usedArr],
            action: "backtrack",
            index: i,
          });
        }
      }
    }

    allSteps.push({
      path: [],
      used: [false, false, false],
      action: "choose",
      index: -1,
    });
    backtrack([], [false, false, false]);
    return allSteps;
  }, [nums]);

  const reset = useCallback(() => {
    setCurrentPath([]);
    setUsed([false, false, false]);
    setResults([]);
    setPhase("init");
    setMessage("Click Play to generate all permutations");
    setStepIndex(-1);
    setSteps(generateSteps());
    setIsPlaying(false);
  }, [generateSteps]);

  useEffect(() => {
    setSteps(generateSteps());
  }, [generateSteps]);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (phase === "init") {
        setPhase("running");
        setStepIndex(0);
        setMessage("Starting with empty path, all elements available");
        return;
      }

      const nextStepIdx = stepIndex + 1;
      if (nextStepIdx >= steps.length) {
        setPhase("done");
        setMessage(
          `Done! Generated all ${results.length} permutations (${nums.length}! = ${results.length})`
        );
        setIsPlaying(false);
        return;
      }

      const step = steps[nextStepIdx];
      setStepIndex(nextStepIdx);
      setCurrentPath(step.path);
      setUsed(step.used);

      if (step.action === "add") {
        setResults((prev) => [...prev, step.path]);
        setMessage(
          `Complete permutation! Add [${step.path.join(", ")}] to results`
        );
      } else if (step.action === "choose") {
        if (step.index === -1) {
          setMessage("Start exploring permutations");
        } else {
          setMessage(
            `Choose ${nums[step.index]}, mark as used, path = [${step.path.join(", ")}]`
          );
        }
      } else {
        setMessage(`Backtrack: remove ${nums[step.index]}, mark as unused`);
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [isPlaying, phase, stepIndex, steps, nums, results.length, speed]);

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">
          Permutations Generator
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Generate all n! orderings using backtracking
        </p>
      </div>

      <div className="p-4">
        {/* Controls */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={phase === "done"}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              isPlaying ? "bg-yellow-500 text-black" : "bg-green-500 text-white"
            } disabled:opacity-50`}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            onClick={reset}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600"
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
              className="w-20 accent-blue-500"
            />
          </div>
        </div>

        {/* Input array with used markers */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">Available Elements:</div>
          <div className="flex gap-2 justify-center">
            {nums.map((num, idx) => (
              <motion.div
                key={`idx-${idx}`}
                animate={{
                  backgroundColor: used[idx] ? "#ef4444" : "#22c55e",
                  scale: used[idx] ? 0.9 : 1,
                  opacity: used[idx] ? 0.5 : 1,
                }}
                className="w-14 h-14 rounded-lg flex flex-col items-center justify-center"
              >
                <span className="font-bold text-white">{num}</span>
                <span
                  className={`text-xs ${used[idx] ? "text-red-300" : "text-green-300"}`}
                >
                  {used[idx] ? "used" : "free"}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Current path */}
        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="text-sm text-gray-400 mb-1">
            Current Permutation (building):
          </div>
          <div className="flex gap-2 justify-center min-h-[48px]">
            {currentPath.length === 0 ? (
              <span className="text-gray-500 text-lg">[ ]</span>
            ) : (
              currentPath.map((num, idx) => (
                <motion.div
                  key={`idx-${idx}`}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center"
                >
                  <span className="font-bold text-white text-lg">{num}</span>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Results */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">
            Complete Permutations ({results.length} / {6}):
          </div>
          <div className="flex flex-wrap gap-2 min-h-[40px]">
            <AnimatePresence>
              {results.map((perm, idx) => (
                <motion.div
                  key={`idx-${idx}`}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 font-mono text-sm"
                >
                  [{perm.join(", ")}]
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
          className={`p-3 rounded-lg text-sm ${
            phase === "done"
              ? "bg-green-500/10 border border-green-500/30 text-green-400"
              : "bg-gray-800 text-gray-300"
          }`}
        >
          {message}
        </motion.div>

        {/* Key insight */}
        <div className="mt-4 p-3 bg-gray-800/30 rounded-lg text-sm text-gray-400">
          <p>
            <strong className="text-blue-400">
              Key Difference from Subsets:
            </strong>{" "}
            We use a <code className="text-cyan-400">used[]</code> array instead
            of a start index. This lets us pick any unused element at each
            position.
          </p>
        </div>
      </div>
    </div>
  );
}
