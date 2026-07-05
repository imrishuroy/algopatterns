"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

export default function TwoSumSortedVisualizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [nums] = useState([2, 7, 11, 15, 19, 24]);
  const [target] = useState(26);
  const [left, setLeft] = useState(0);
  const [right, setRight] = useState(5);
  const [currentSum, setCurrentSum] = useState<number | null>(null);
  const [found, setFound] = useState(false);
  const [phase, setPhase] = useState<"init" | "running" | "done">("init");
  const [message, setMessage] = useState(
    "Click Play to find two numbers summing to 26"
  );
  const [history, setHistory] = useState<string[]>([]);

  const reset = useCallback(() => {
    setLeft(0);
    setRight(nums.length - 1);
    setCurrentSum(null);
    setFound(false);
    setPhase("init");
    setMessage(`Click Play to find two numbers summing to ${target}`);
    setHistory([]);
    setIsPlaying(false);
  }, [nums.length, target]);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (phase === "init") {
        setPhase("running");
        const sum = nums[left] + nums[right];
        setCurrentSum(sum);
        setMessage(`Checking: ${nums[left]} + ${nums[right]} = ${sum}`);
        setHistory([
          `left=0, right=${nums.length - 1}: ${nums[left]} + ${nums[right]} = ${sum}`,
        ]);
      } else if (phase === "running") {
        if (left >= right) {
          setPhase("done");
          setMessage("No pair found!");
          setIsPlaying(false);
          return;
        }

        const sum = nums[left] + nums[right];

        if (sum === target) {
          setFound(true);
          setPhase("done");
          setMessage(`Found! ${nums[left]} + ${nums[right]} = ${target}`);
          setIsPlaying(false);
          return;
        }

        if (sum < target) {
          const newLeft = left + 1;
          setLeft(newLeft);
          if (newLeft < right) {
            const newSum = nums[newLeft] + nums[right];
            setCurrentSum(newSum);
            setMessage(
              `${sum} < ${target}, move left. Now: ${nums[newLeft]} + ${nums[right]} = ${newSum}`
            );
            setHistory((prev) => [
              ...prev,
              `left=${newLeft}, right=${right}: ${nums[newLeft]} + ${nums[right]} = ${newSum}`,
            ]);
          }
        } else {
          const newRight = right - 1;
          setRight(newRight);
          if (left < newRight) {
            const newSum = nums[left] + nums[newRight];
            setCurrentSum(newSum);
            setMessage(
              `${sum} > ${target}, move right. Now: ${nums[left]} + ${nums[newRight]} = ${newSum}`
            );
            setHistory((prev) => [
              ...prev,
              `left=${left}, right=${newRight}: ${nums[left]} + ${nums[newRight]} = ${newSum}`,
            ]);
          }
        }
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [isPlaying, phase, left, right, nums, target, speed]);

  return (
    <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">
          Two Sum II (Sorted Array)
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Find two numbers summing to {target} using opposite direction pointers
        </p>
      </div>

      <div className="p-4">
        {/* Controls */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
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
              className="w-20 accent-blue-500"
            />
          </div>
        </div>

        {/* Target display */}
        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-md">
          <span className="text-gray-400">Target Sum: </span>
          <span className="text-blue-400 font-bold text-xl">{target}</span>
          {currentSum !== null && (
            <span className="ml-4">
              <span className="text-gray-400">Current Sum: </span>
              <span
                className={`font-bold text-xl ${
                  currentSum === target
                    ? "text-green-400"
                    : currentSum < target
                      ? "text-yellow-400"
                      : "text-orange-400"
                }`}
              >
                {currentSum}
                {currentSum !== target && (
                  <span className="text-sm ml-1">
                    ({currentSum < target ? "↑ need more" : "↓ need less"})
                  </span>
                )}
              </span>
            </span>
          )}
        </div>

        {/* Array visualization */}
        <div className="mb-4 flex justify-center gap-2">
          {nums.map((num, idx) => (
            <div
              key={`num-${num}-${idx}`}
              className="flex flex-col items-center"
            >
              <motion.div
                animate={{
                  backgroundColor:
                    found && (idx === left || idx === right)
                      ? "#22c55e"
                      : idx === left
                        ? "#3b82f6"
                        : idx === right
                          ? "#f59e0b"
                          : "#374151",
                  scale: idx === left || idx === right ? 1.1 : 1,
                }}
                className="w-12 h-12 rounded-md flex items-center justify-center font-bold text-white"
              >
                {num}
              </motion.div>
              <div className="mt-1 text-xs text-gray-500">{idx}</div>
              <div className="h-6 flex items-center">
                {idx === left && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-blue-400 font-bold text-sm"
                  >
                    L
                  </motion.span>
                )}
                {idx === right && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-yellow-400 font-bold text-sm"
                  >
                    R
                  </motion.span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Current calculation */}
        {phase !== "init" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 p-3 bg-gray-800/50 rounded-md text-center"
          >
            <span className="text-blue-400 font-mono">{nums[left]}</span>
            <span className="text-gray-400 mx-2">+</span>
            <span className="text-yellow-400 font-mono">{nums[right]}</span>
            <span className="text-gray-400 mx-2">=</span>
            <span
              className={`font-mono ${currentSum === target ? "text-green-400" : "text-white"}`}
            >
              {currentSum}
            </span>
          </motion.div>
        )}

        {/* Result */}
        {found && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 p-4 bg-green-500/20 border border-green-500/50 rounded-md text-center"
          >
            <span className="text-green-400 font-bold text-lg">
              Found! indices [{left}, {right}] → {nums[left]} + {nums[right]} ={" "}
              {target}
            </span>
          </motion.div>
        )}

        {/* History */}
        <div className="mb-4 max-h-24 overflow-y-auto">
          <div className="text-sm text-gray-400 mb-1">Steps:</div>
          <div className="space-y-1">
            {history.map((step, idx) => (
              <div
                key={`step-${step.slice(0, 20)}-${idx}`}
                className="text-xs font-mono text-gray-500"
              >
                {step}
              </div>
            ))}
          </div>
        </div>

        {/* Message */}
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-md text-sm ${
            phase === "done"
              ? found
                ? "bg-green-500/10 border border-green-500/30 text-green-400"
                : "bg-red-500/10 border border-red-500/30 text-red-400"
              : "bg-gray-800 text-gray-300"
          }`}
        >
          {message}
        </motion.div>

        {/* Legend */}
        <div className="mt-4 flex gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-md bg-blue-500" />
            <span className="text-gray-400">Left pointer</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-md bg-yellow-500" />
            <span className="text-gray-400">Right pointer</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-md bg-green-500" />
            <span className="text-gray-400">Found pair</span>
          </div>
        </div>
      </div>
    </div>
  );
}
