"use client";

import React, { useState, useEffect, useCallback, useReducer, startTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Interval {
  start: number;
  end: number;
  id: number;
  state: "unsorted" | "sorted" | "current" | "comparing" | "merged" | "added";
}

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
  }
}

const initialIntervals = [
  { start: 1, end: 3 },
  { start: 2, end: 6 },
  { start: 8, end: 10 },
  { start: 15, end: 18 },
];

export default function MergeIntervalsVisualizer() {
  const [{ isPlaying }, dispatch] = useReducer(playReducer, { step: 0, isPlaying: false });
  const [speed, setSpeed] = useState(1000);
  const [intervals, setIntervals] = useState<Interval[]>([]);
  const [result, setResult] = useState<Interval[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [phase, setPhase] = useState<"init" | "sorting" | "merging" | "done">(
    "init"
  );
  const [message, setMessage] = useState(
    "Click Play to merge overlapping intervals"
  );

  const reset = useCallback(() => {
    const ints = initialIntervals.map((int, i) => ({
      ...int,
      id: i,
      state: "unsorted" as const,
    }));
    setIntervals(ints);
    setResult([]);
    setCurrentIdx(0);
    setPhase("init");
    setMessage("Click Play to merge overlapping intervals");
    dispatch({ type: "STOP" });
  }, []);

  useEffect(() => {
    startTransition(() => {
      reset();
    });
  }, [reset]);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (phase === "init") {
        setPhase("sorting");
        setMessage("Step 1: Sort intervals by start time");
      } else if (phase === "sorting") {
        const sorted = [...intervals].sort((a, b) => a.start - b.start);
        sorted.forEach((int, i) => (int.id = i));
        const updated = sorted.map((int) => ({
          ...int,
          state: "sorted" as const,
        }));
        setIntervals(updated);

        // Initialize result with first interval
        const first = { ...updated[0], state: "added" as const };
        setResult([first]);
        setCurrentIdx(1);
        setPhase("merging");
        setMessage(
          `Sorted! Starting with first interval [${first.start}, ${first.end}]`
        );
      } else if (phase === "merging") {
        if (currentIdx >= intervals.length) {
          setPhase("done");
          setMessage(
            `Done! Merged ${initialIntervals.length} intervals into ${result.length}`
          );
          dispatch({ type: "STOP" });
          return;
        }

        const curr = intervals[currentIdx];
        const last = result[result.length - 1];

        // Mark current as being processed
        const updatedIntervals = intervals.map((int, i) =>
          i === currentIdx ? { ...int, state: "current" as const } : int
        );
        setIntervals(updatedIntervals);

        if (curr.start <= last.end) {
          // Overlap - merge
          const newEnd = Math.max(last.end, curr.end);
          const newResult = [...result];
          newResult[newResult.length - 1] = {
            ...last,
            end: newEnd,
            state: "merged" as const,
          };
          setResult(newResult);
          setMessage(
            `[${curr.start}, ${curr.end}] overlaps with [${last.start}, ${last.end}] (${curr.start} <= ${last.end}). Merge to [${last.start}, ${newEnd}]`
          );
        } else {
          // No overlap - add as new
          const newInterval = { ...curr, state: "added" as const };
          setResult([...result, newInterval]);
          setMessage(
            `[${curr.start}, ${curr.end}] doesn't overlap (${curr.start} > ${last.end}). Add as new interval.`
          );
        }

        setCurrentIdx(currentIdx + 1);
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [isPlaying, phase, currentIdx, intervals, result, speed]);

  const maxEnd = Math.max(...initialIntervals.map((i) => i.end));

  const getIntervalColor = (state: string) => {
    switch (state) {
      case "current":
        return "bg-yellow-500";
      case "merged":
        return "bg-green-500";
      case "added":
        return "bg-blue-500";
      case "sorted":
        return "bg-gray-600";
      default:
        return "bg-gray-700";
    }
  };

  return (
    <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">Merge Intervals</h3>
        <p className="text-gray-400 text-sm mt-1">
          Sort by start time, then merge overlapping intervals
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
              min="500"
              max="2000"
              step="100"
              value={2500 - speed}
              onChange={(e) => setSpeed(2500 - Number(e.target.value))}
              className="w-20 accent-emerald-500"
            />
          </div>
        </div>

        {/* Timeline visualization */}
        <div className="mb-6">
          <div className="text-sm text-gray-400 mb-2">
            Input Intervals (on timeline):
          </div>
          <div className="relative bg-gray-800/50 rounded-md p-4 h-40 overflow-hidden">
            {/* Timeline axis */}
            <div className="absolute bottom-4 left-4 right-4 h-0.5 bg-gray-600">
              {Array.from({ length: maxEnd + 2 }, (_, i) => (
                <div
                  key={`timeline-${i}`}
                  className="absolute bottom-0 w-0.5 h-2 bg-gray-600"
                  style={{ left: `${(i / (maxEnd + 1)) * 100}%` }}
                >
                  <span className="absolute top-3 -translate-x-1/2 text-xs text-gray-500">
                    {i}
                  </span>
                </div>
              ))}
            </div>

            {/* Intervals */}
            {intervals.map((int, idx) => (
              <motion.div
                key={int.id}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  y: int.state === "current" ? -5 : 0,
                }}
                className={`absolute h-8 rounded-md ${getIntervalColor(int.state)} flex items-center justify-center text-white text-xs font-bold shadow-lg`}
                style={{
                  left: `${(int.start / (maxEnd + 1)) * 100}%`,
                  width: `${((int.end - int.start) / (maxEnd + 1)) * 100}%`,
                  top: `${20 + idx * 24}px`,
                }}
              >
                [{int.start}, {int.end}]
              </motion.div>
            ))}
          </div>
        </div>

        {/* Result */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">Merged Result:</div>
          <div className="relative bg-gray-800/50 rounded-md p-4 h-20 overflow-hidden">
            {/* Timeline axis */}
            <div className="absolute bottom-4 left-4 right-4 h-0.5 bg-gray-600" />

            <AnimatePresence>
              {result.map((int, idx) => (
                <motion.div
                  key={`result-${int.start}-${int.end}-${idx}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`absolute h-10 rounded-md ${getIntervalColor(int.state)} flex items-center justify-center text-white text-sm font-bold shadow-lg ring-2 ring-white/30`}
                  style={{
                    left: `${(int.start / (maxEnd + 1)) * 100}%`,
                    width: `${((int.end - int.start) / (maxEnd + 1)) * 100}%`,
                    top: "8px",
                  }}
                >
                  [{int.start}, {int.end}]
                </motion.div>
              ))}
            </AnimatePresence>

            {result.length === 0 && (
              <span className="text-gray-500 text-sm absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                Merged intervals will appear here
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-2xl font-bold text-emerald-400">
              {intervals.length}
            </div>
            <div className="text-xs text-gray-500">Input Count</div>
          </div>
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {result.length}
            </div>
            <div className="text-xs text-gray-500">Result Count</div>
          </div>
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {currentIdx}/{intervals.length}
            </div>
            <div className="text-xs text-gray-500">Processed</div>
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
            <strong className="text-emerald-400">Key Insight:</strong> Sort by
            start time, then check if curr.start {"<="} prev.end. If overlap,
            merge by extending end to max(prev.end, curr.end).
          </p>
        </div>
      </div>
    </div>
  );
}
