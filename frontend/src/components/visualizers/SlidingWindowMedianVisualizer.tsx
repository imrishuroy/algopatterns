"use client";

import React, { useState, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NUMS = [1, 3, -1, -3, 5, 3, 6, 7];
const K = 3;

interface Step {
  type: "init" | "building" | "window";
  windowStart: number;
  windowEnd: number;
  sorted: number[];
  enteringIdx: number | null; // index in NUMS of new element
  leavingIdx: number | null; // index in NUMS of removed element
  medianIdx: number | null; // index into sorted (-1 = even avg, null = not yet)
  medianValue: number | null;
  results: number[];
  message: string;
}

function buildSteps(): Step[] {
  const steps: Step[] = [];
  const sorted: number[] = [];
  const results: number[] = [];

  function insertIdx(arr: number[], val: number): number {
    let lo = 0,
      hi = arr.length;
    while (lo < hi) {
      const m = (lo + hi) >> 1;
      if (arr[m] < val) lo = m + 1;
      else hi = m;
    }
    return lo;
  }

  steps.push({
    type: "init",
    windowStart: 0,
    windowEnd: -1,
    sorted: [],
    enteringIdx: null,
    leavingIdx: null,
    medianIdx: null,
    medianValue: null,
    results: [],
    message: `Input: [${NUMS.join(", ")}],  k = ${K}. Slide a window of ${K} and find the median of each complete window.`,
  });

  for (let i = 0; i < NUMS.length; i++) {
    const entering = NUMS[i];
    const leavingIdx = i >= K ? i - K : null;
    const leaving = leavingIdx !== null ? NUMS[leavingIdx] : null;
    const wStart = Math.max(0, i - K + 1);

    // Update sorted: insert new, remove old — BOTH at once before snapshot
    sorted.splice(insertIdx(sorted, entering), 0, entering);
    if (leaving !== null) {
      sorted.splice(insertIdx(sorted, leaving), 1);
    }

    const windowFull = i >= K - 1;
    const mid = Math.floor(K / 2);
    const medianValue = windowFull
      ? K % 2 === 1
        ? sorted[mid]
        : (sorted[mid - 1] + sorted[mid]) / 2
      : null;
    const medianIdx = windowFull ? (K % 2 === 1 ? mid : -1) : null;

    if (medianValue !== null) results.push(medianValue);

    const windowNums = NUMS.slice(wStart, i + 1);
    const enterMsg = `Enter ${entering}`;
    const leaveMsg = leaving !== null ? `, remove ${leaving}` : "";
    const medMsg =
      medianValue !== null
        ? K % 2 === 1
          ? `  →  median = sorted[${mid}] = ${medianValue}`
          : `  →  median = (${sorted[mid - 1]} + ${sorted[mid]}) / 2 = ${medianValue}`
        : "";

    steps.push({
      type: windowFull ? "window" : "building",
      windowStart: wStart,
      windowEnd: i,
      sorted: [...sorted],
      enteringIdx: i,
      leavingIdx,
      medianIdx,
      medianValue,
      results: [...results],
      message: `Window [${windowNums.join(", ")}] → sorted: [${sorted.join(", ")}]. ${enterMsg}${leaveMsg}.${medMsg}`,
    });
  }

  steps.push({
    type: "window",
    windowStart: NUMS.length - K,
    windowEnd: NUMS.length - 1,
    sorted: [...sorted],
    enteringIdx: null,
    leavingIdx: null,
    medianIdx: null,
    medianValue: null,
    results: [...results],
    message: `Done! All medians: [${results.join(", ")}]`,
  });

  return steps;
}

// skipcq: JS-0067
export default function SlidingWindowMedianVisualizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(900);
  const [stepIndex, setStepIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const steps = useMemo(() => buildSteps(), []);

  const reset = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setStepIndex(0);
    setIsPlaying(false);
  }, []);

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const advanceStep = useCallback(() => {
    setStepIndex((prev) => {
      const next = prev + 1;
      if (next >= steps.length - 1) {
        setIsPlaying(false);
        return steps.length - 1;
      }
      return next;
    });
  }, [steps.length]);

  React.useEffect(() => {
    if (isPlaying && stepIndex < steps.length - 1) {
      timerRef.current = setTimeout(advanceStep, speed);
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, [isPlaying, stepIndex, steps.length, speed, advanceStep]);

  const current = steps[stepIndex];
  const isDone = current.type === "window" && current.enteringIdx === null;
  const mid = Math.floor(K / 2);

  return (
    <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">
          Sliding Window Median
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          k = {K}. Each step shows the window after entering the new element and
          removing the old one. Median is the middle of the sorted window.
        </p>
      </div>

      <div className="p-4 space-y-5">
        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handlePlayPause}
            disabled={isDone}
            className={`px-4 py-2 rounded-md font-medium transition ${
              isPlaying ? "bg-yellow-500 text-black" : "bg-green-500 text-white"
            } disabled:opacity-50`}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            onClick={() =>
              setStepIndex(Math.min(stepIndex + 1, steps.length - 1))
            }
            disabled={stepIndex >= steps.length - 1}
            className="px-4 py-2 bg-gray-700 text-white rounded-md font-medium hover:bg-gray-600 disabled:opacity-50"
          >
            Step
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
              max="1800"
              step="100"
              value={2200 - speed}
              onChange={(e) => setSpeed(2200 - Number(e.target.value))}
              className="w-20 accent-cyan-500"
            />
          </div>
          <span className="text-gray-500 text-xs ml-2">
            Step {stepIndex + 1}/{steps.length}
          </span>
        </div>

        {/* Input array */}
        <div>
          <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
            Input array — window size k = {K}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {NUMS.map((n, i) => {
              const inWindow =
                i >= current.windowStart && i <= current.windowEnd;
              const isEntering = i === current.enteringIdx;
              const isLeaving = i === current.leavingIdx;
              return (
                <motion.div
                  key={`num-${i}`}
                  animate={{
                    scale: isEntering ? 1.12 : isLeaving ? 0.88 : 1,
                    opacity: isLeaving ? 0.35 : inWindow ? 1 : 0.25,
                  }}
                  className={`w-10 h-10 rounded-md flex flex-col items-center justify-center font-mono font-bold text-sm relative ${
                    isLeaving
                      ? "bg-red-500/60 text-white ring-1 ring-red-400"
                      : isEntering
                        ? "bg-green-500 text-white ring-2 ring-green-300"
                        : inWindow
                          ? "bg-cyan-600 text-white"
                          : "bg-gray-700 text-gray-400"
                  }`}
                >
                  {n}
                  {isEntering && (
                    <span className="absolute -bottom-4 text-xs text-green-400 font-normal whitespace-nowrap">
                      in
                    </span>
                  )}
                  {isLeaving && (
                    <span className="absolute -bottom-4 text-xs text-red-400 font-normal whitespace-nowrap">
                      out
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-6 text-xs text-gray-500">
            <span>
              <span className="inline-block w-3 h-3 rounded-sm bg-cyan-600 mr-1" />
              in window
            </span>
            <span>
              <span className="inline-block w-3 h-3 rounded-sm bg-green-500 mr-1" />
              entering
            </span>
            <span>
              <span className="inline-block w-3 h-3 rounded-sm bg-red-500/60 mr-1" />
              leaving
            </span>
          </div>
        </div>

        {/* Sorted window */}
        <div>
          <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
            Sorted window — {current.sorted.length} element
            {current.sorted.length !== 1 ? "s" : ""}
            {current.type === "building" ? " (building up…)" : ""}
          </div>
          <div className="bg-gray-800/50 rounded-md p-4 pt-7 min-h-[72px] flex items-center gap-2">
            <AnimatePresence mode="popLayout">
              {current.sorted.length === 0 ? (
                <span className="text-gray-600 text-sm">empty</span>
              ) : (
                current.sorted.map((n, i) => {
                  const isMedianCell =
                    current.medianIdx !== null &&
                    current.medianIdx !== -1 &&
                    i === current.medianIdx;
                  const isMedianEven =
                    current.medianIdx === -1 && (i === mid - 1 || i === mid);
                  return (
                    <motion.div
                      key={`sorted-${i}-${n}`}
                      layout
                      initial={{ scale: 0, y: -10 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className={`relative w-11 h-11 rounded-md flex items-center justify-center font-mono font-bold text-sm ${
                        isMedianCell
                          ? "bg-amber-500 text-white ring-2 ring-amber-300"
                          : isMedianEven
                            ? "bg-amber-500/70 text-white ring-1 ring-amber-400"
                            : "bg-gray-700 text-gray-200"
                      }`}
                    >
                      {n}
                      {isMedianCell && (
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs text-amber-400 font-semibold whitespace-nowrap">
                          median
                        </span>
                      )}
                      {isMedianEven && (
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs text-amber-400 whitespace-nowrap">
                          avg
                        </span>
                      )}
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Median + results */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-md border border-cyan-500/20">
            <div className="text-xs text-gray-500 mb-1">
              {current.type === "building"
                ? "Median (window not full yet)"
                : "Current median"}
            </div>
            <AnimatePresence mode="wait">
              {current.medianValue !== null ? (
                <motion.div
                  key={current.medianValue}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-4xl font-bold text-amber-400"
                >
                  {current.medianValue}
                </motion.div>
              ) : (
                <div className="text-2xl text-gray-600">—</div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-4 bg-gray-800/50 rounded-md">
            <div className="text-xs text-gray-500 mb-2">Results</div>
            <div className="flex flex-wrap gap-1.5">
              <AnimatePresence>
                {current.results.map((r, i) => (
                  <motion.div
                    // skipcq: JS-0437
                    key={`res-${i}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`px-2 py-1 rounded-md text-sm font-mono font-bold ${
                      i === current.results.length - 1 &&
                      current.medianValue !== null
                        ? "bg-amber-500 text-white"
                        : "bg-gray-700 text-gray-300"
                    }`}
                  >
                    {r}
                  </motion.div>
                ))}
              </AnimatePresence>
              {current.results.length === 0 && (
                <span className="text-gray-600 text-sm">none yet</span>
              )}
            </div>
          </div>
        </div>

        {/* Message */}
        <motion.div
          key={current.message}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-md text-sm ${
            isDone
              ? "bg-green-500/10 border border-green-500/30 text-green-400"
              : current.type === "window" && current.medianValue !== null
                ? "bg-amber-500/10 border border-amber-500/30 text-amber-300"
                : current.type === "building"
                  ? "bg-cyan-500/10 border border-cyan-500/30 text-cyan-300"
                  : "bg-gray-800 text-gray-300"
          }`}
        >
          {current.message}
        </motion.div>

        {/* Key insight */}
        <div className="p-3 bg-gray-800/30 rounded-md text-sm text-gray-400">
          <strong className="text-cyan-400">Key insight:</strong> Keeping the
          window in sorted order makes the median a direct index lookup — O(1).
          For odd k, median = <code className="text-cyan-300">sorted[k/2]</code>
          . For even k, median = average of{" "}
          <code className="text-cyan-300">sorted[k/2-1]</code> and{" "}
          <code className="text-cyan-300">sorted[k/2]</code>.
        </div>
      </div>
    </div>
  );
}
