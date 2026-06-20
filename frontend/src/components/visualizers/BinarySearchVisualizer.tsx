"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

interface Step {
  left: number;
  right: number;
  mid: number;
  comparison: "equal" | "less" | "greater";
  message: string;
}

export default function BinarySearchVisualizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [nums] = useState([1, 3, 5, 7, 9, 11, 13, 15, 17]);
  const [target] = useState(11);
  const [left, setLeft] = useState(0);
  const [right, setRight] = useState(8);
  const [mid, setMid] = useState(-1);
  const [found, setFound] = useState<number | null>(null);
  const [phase, setPhase] = useState<"init" | "running" | "done">("init");
  const [message, setMessage] = useState(`Click Play to search for ${target}`);
  const [stepIndex, setStepIndex] = useState(-1);
  const [steps, setSteps] = useState<Step[]>([]);
  const [eliminated, setEliminated] = useState<Set<number>>(new Set());

  const generateSteps = useCallback(() => {
    const allSteps: Step[] = [];
    let l = 0,
      r = nums.length - 1;

    while (l <= r) {
      const m = l + Math.floor((r - l) / 2);

      if (nums[m] === target) {
        allSteps.push({
          left: l,
          right: r,
          mid: m,
          comparison: "equal",
          message: `mid=${m}, nums[${m}]=${nums[m]} === ${target}. Found!`,
        });
        break;
      } else if (nums[m] < target) {
        allSteps.push({
          left: l,
          right: r,
          mid: m,
          comparison: "less",
          message: `mid=${m}, nums[${m}]=${nums[m]} < ${target}. Search right half.`,
        });
        l = m + 1;
      } else {
        allSteps.push({
          left: l,
          right: r,
          mid: m,
          comparison: "greater",
          message: `mid=${m}, nums[${m}]=${nums[m]} > ${target}. Search left half.`,
        });
        r = m - 1;
      }
    }

    return allSteps;
  }, [nums, target]);

  const reset = useCallback(() => {
    setLeft(0);
    setRight(nums.length - 1);
    setMid(-1);
    setFound(null);
    setEliminated(new Set());
    setPhase("init");
    setMessage(`Click Play to search for ${target}`);
    setStepIndex(-1);
    setSteps(generateSteps());
    setIsPlaying(false);
  }, [nums.length, target, generateSteps]);

  useEffect(() => {
    setSteps(generateSteps());
  }, [generateSteps]);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (phase === "init") {
        setPhase("running");
        setStepIndex(0);
        const step = steps[0];
        setLeft(step.left);
        setRight(step.right);
        setMid(step.mid);
        setMessage(step.message);
        if (step.comparison === "equal") {
          setFound(step.mid);
          setPhase("done");
          setIsPlaying(false);
        }
        return;
      }

      const nextStepIdx = stepIndex + 1;
      if (nextStepIdx >= steps.length) {
        setPhase("done");
        if (found === null) {
          setMessage(`Target ${target} not found in the array`);
        }
        setIsPlaying(false);
        return;
      }

      // Mark eliminated indices
      const prevStep = steps[stepIndex];
      const newEliminated = new Set(eliminated);
      if (prevStep.comparison === "less") {
        for (let i = prevStep.left; i <= prevStep.mid; i++) {
          newEliminated.add(i);
        }
      } else if (prevStep.comparison === "greater") {
        for (let i = prevStep.mid; i <= prevStep.right; i++) {
          newEliminated.add(i);
        }
      }
      setEliminated(newEliminated);

      const step = steps[nextStepIdx];
      setStepIndex(nextStepIdx);
      setLeft(step.left);
      setRight(step.right);
      setMid(step.mid);
      setMessage(step.message);

      if (step.comparison === "equal") {
        setFound(step.mid);
        setPhase("done");
        setIsPlaying(false);
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [isPlaying, phase, stepIndex, steps, target, found, eliminated, speed]);

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">Binary Search</h3>
        <p className="text-gray-400 text-sm mt-1">
          O(log n) search by halving the search space
        </p>
      </div>

      <div className="p-4">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={phase === "done"}
            className={`px-3 md:px-4 py-2 rounded-lg font-medium text-sm md:text-base transition ${
              isPlaying ? "bg-yellow-500 text-black" : "bg-green-500 text-white"
            } disabled:opacity-50`}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            onClick={reset}
            className="px-3 md:px-4 py-2 bg-gray-700 text-white rounded-lg font-medium text-sm md:text-base hover:bg-gray-600"
          >
            Reset
          </button>
          <div className="flex items-center gap-2 ml-auto md:ml-4">
            <span className="text-gray-400 text-xs md:text-sm">Speed:</span>
            <input
              type="range"
              min="400"
              max="1200"
              step="100"
              value={1600 - speed}
              onChange={(e) => setSpeed(1600 - Number(e.target.value))}
              className="w-16 md:w-20 accent-blue-500"
            />
          </div>
        </div>

        {/* Target */}
        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-center">
          <span className="text-gray-400">Target: </span>
          <span className="text-blue-400 font-bold text-xl">{target}</span>
        </div>

        {/* Array visualization */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">Sorted Array:</div>
          <div className="flex gap-1 justify-center flex-wrap">
            {nums.map((num, idx) => {
              const isLeft = idx === left && phase !== "init";
              const isRight = idx === right && phase !== "init";
              const isMid = idx === mid;
              const isFound = idx === found;
              const isEliminated = eliminated.has(idx);

              return (
                <div key={`${num}-${idx}`} className="flex flex-col items-center">
                  <motion.div
                    animate={{
                      backgroundColor: isFound
                        ? "#22c55e"
                        : isMid
                          ? "#eab308"
                          : isEliminated
                            ? "#1f2937"
                            : "#4b5563",
                      opacity: isEliminated ? 0.4 : 1,
                      scale: isMid ? 1.15 : 1,
                    }}
                    className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm"
                  >
                    <span
                      className={isFound || isMid ? "text-black" : "text-white"}
                    >
                      {num}
                    </span>
                  </motion.div>
                  <div className="text-xs text-gray-500 mt-1">{idx}</div>
                  <div className="h-5 flex gap-0.5 mt-1">
                    {isLeft && (
                      <span className="text-blue-400 text-xs font-bold">L</span>
                    )}
                    {isMid && (
                      <span className="text-yellow-400 text-xs font-bold">
                        M
                      </span>
                    )}
                    {isRight && (
                      <span className="text-purple-400 text-xs font-bold">
                        R
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pointers info */}
        {phase !== "init" && (
          <div className="mb-4 grid grid-cols-3 gap-2 text-center text-sm">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <span className="text-blue-400">Left: {left}</span>
            </div>
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <span className="text-yellow-400">Mid: {mid}</span>
            </div>
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <span className="text-purple-400">Right: {right}</span>
            </div>
          </div>
        )}

        {/* Result */}
        {found !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-center"
          >
            <span className="text-green-400 font-bold text-lg">
              Found {target} at index {found}!
            </span>
            <div className="text-gray-400 text-sm mt-1">
              Completed in {stepIndex + 1} step{stepIndex > 0 ? "s" : ""} (log₂
              {nums.length} ≈ {Math.ceil(Math.log2(nums.length))})
            </div>
          </motion.div>
        )}

        {/* Message */}
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-lg text-sm ${
            phase === "done"
              ? found !== null
                ? "bg-green-500/10 border border-green-500/30 text-green-400"
                : "bg-red-500/10 border border-red-500/30 text-red-400"
              : "bg-gray-800 text-gray-300"
          }`}
        >
          {message}
        </motion.div>

        {/* Legend */}
        <div className="mt-4 flex gap-4 text-xs justify-center">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-yellow-500" />
            <span className="text-gray-400">Mid</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span className="text-gray-400">Found</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-gray-700 opacity-40" />
            <span className="text-gray-400">Eliminated</span>
          </div>
        </div>

        {/* Key insight */}
        <div className="mt-4 p-3 bg-gray-800/30 rounded-lg text-sm text-gray-400">
          <p>
            <strong className="text-blue-400">Key Insight:</strong> Each
            comparison eliminates half the remaining elements. For n elements,
            we need at most log₂(n) comparisons.
          </p>
        </div>
      </div>
    </div>
  );
}
