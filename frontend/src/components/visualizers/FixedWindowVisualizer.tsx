"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";

export default function FixedWindowVisualizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [windowSum, setWindowSum] = useState(0);
  const [maxSum, setMaxSum] = useState(-Infinity);
  const [maxWindow, setMaxWindow] = useState<[number, number] | null>(null);
  const [phase, setPhase] = useState<"init" | "building" | "sliding" | "done">(
    "init"
  );
  const [message, setMessage] = useState(
    "Click Play to find maximum sum of k=3 consecutive elements"
  );

  const arr = useMemo(() => [2, 1, 5, 1, 3, 2], []);
  const k = 3;

  const reset = useCallback(() => {
    setCurrentIdx(-1);
    setWindowSum(0);
    setMaxSum(-Infinity);
    setMaxWindow(null);
    setPhase("init");
    setMessage(`Click Play to find maximum sum of k=${k} consecutive elements`);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (phase === "init") {
        setPhase("building");
        setCurrentIdx(0);
        setMessage("Phase 1: Building initial window of size k");
      } else if (phase === "building") {
        if (currentIdx >= k) {
          setPhase("sliding");
          setMaxSum(windowSum);
          setMaxWindow([0, k - 1]);
          setMessage(`Window built! Sum = ${windowSum}. Now sliding...`);
          return;
        }

        const newSum = windowSum + arr[currentIdx];
        setWindowSum(newSum);
        setMessage(
          `Adding arr[${currentIdx}] = ${arr[currentIdx]} to window. Sum = ${newSum}`
        );
        setCurrentIdx(currentIdx + 1);
      } else if (phase === "sliding") {
        if (currentIdx >= arr.length) {
          setPhase("done");
          setMessage(
            `Done! Maximum sum = ${maxSum} at window [${maxWindow![0]}, ${maxWindow![1]}]`
          );
          setIsPlaying(false);
          return;
        }

        // Add right element, remove left element
        const rightVal = arr[currentIdx];
        const leftVal = arr[currentIdx - k];
        const newSum = windowSum + rightVal - leftVal;

        setWindowSum(newSum);
        setMessage(
          `Remove arr[${currentIdx - k}] = ${leftVal}, Add arr[${currentIdx}] = ${rightVal}. Sum = ${newSum}`
        );

        if (newSum > maxSum) {
          setMaxSum(newSum);
          setMaxWindow([currentIdx - k + 1, currentIdx]);
        }

        setCurrentIdx(currentIdx + 1);
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [
    isPlaying,
    phase,
    currentIdx,
    windowSum,
    maxSum,
    maxWindow,
    arr,
    k,
    speed,
  ]);

  const getWindowRange = (): [number, number] => {
    if (phase === "building") {
      return [0, Math.min(currentIdx, k - 1)];
    } else if (phase === "sliding" || phase === "done") {
      const right = Math.min(currentIdx - 1, arr.length - 1);
      const left = Math.max(0, right - k + 1);
      return [left, right];
    }
    return [-1, -1];
  };

  const [winLeft, winRight] = getWindowRange();

  return (
    <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">
          Fixed Size Sliding Window
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Find maximum sum of k consecutive elements
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
              max="1500"
              step="100"
              value={1900 - speed}
              onChange={(e) => setSpeed(1900 - Number(e.target.value))}
              className="w-20 accent-blue-500"
            />
          </div>
        </div>

        {/* Window size indicator */}
        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-md">
          <span className="text-gray-400">Window size k = </span>
          <span className="text-2xl font-bold text-blue-400">{k}</span>
        </div>

        {/* Array visualization */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">Array:</div>
          <div className="flex gap-2">
            {arr.map((val, position) => {
              const inWindow = position >= winLeft && position <= winRight;
              const isMaxWindow =
                maxWindow && position >= maxWindow[0] && position <= maxWindow[1];

              return (
                <motion.div
                  key={`arr-pos${position}-val${val}`}
                  animate={{
                    scale: inWindow ? 1.05 : 1,
                    y: inWindow ? -5 : 0,
                  }}
                  className={`w-14 h-14 rounded-md flex flex-col items-center justify-center font-mono relative ${
                    inWindow
                      ? "bg-blue-500 text-white ring-2 ring-blue-300"
                      : phase === "done" && isMaxWindow
                        ? "bg-green-500/50 text-white"
                        : "bg-gray-700 text-gray-300"
                  }`}
                >
                  <span className="text-lg font-bold">{val}</span>
                  <span className="text-xs opacity-70">[{position}]</span>
                  {inWindow && (
                    <div className="absolute -top-6 text-xs text-blue-400">
                      {position === winLeft && "L"}
                      {position === winRight && "R"}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Window bracket */}
          {phase !== "init" && winLeft >= 0 && (
            <div className="flex gap-2 mt-1">
              {arr.map((val, position) => (
                <div
                  key={`bracket-pos${position}-val${val}`}
                  className={`w-14 h-1 rounded-md ${
                    position >= winLeft && position <= winRight
                      ? "bg-blue-500"
                      : "bg-transparent"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">Current Window Sum</div>
            <div className="text-2xl font-bold text-blue-400">{windowSum}</div>
          </div>
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">Maximum Sum</div>
            <div className="text-2xl font-bold text-green-400">
              {maxSum === -Infinity ? "-" : maxSum}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">Best Window</div>
            <div className="text-lg font-bold text-orange-400">
              {maxWindow ? `[${maxWindow[0]}, ${maxWindow[1]}]` : "-"}
            </div>
          </div>
        </div>

        {/* Phase indicator */}
        <div className="mb-4 flex gap-2">
          <div
            className={`flex-1 p-2 rounded-md text-center text-sm font-medium ${
              phase === "building"
                ? "bg-yellow-500 text-black"
                : phase === "sliding" || phase === "done"
                  ? "bg-yellow-500/30 text-yellow-300"
                  : "bg-gray-800 text-gray-500"
            }`}
          >
            Build Window
          </div>
          <div
            className={`flex-1 p-2 rounded-md text-center text-sm font-medium ${
              phase === "sliding"
                ? "bg-blue-500 text-white"
                : phase === "done"
                  ? "bg-blue-500/30 text-blue-300"
                  : "bg-gray-800 text-gray-500"
            }`}
          >
            Slide Window
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

        {/* Algorithm explanation */}
        <div className="mt-4 p-3 bg-gray-800/30 rounded-md text-sm text-gray-400">
          <p>
            <strong className="text-blue-400">Key Insight:</strong> Instead of
            summing k elements each time O(k), update incrementally: newSum =
            oldSum + arr[right] - arr[left]. O(1) per slide!
          </p>
        </div>
      </div>
    </div>
  );
}
