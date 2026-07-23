"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useReducer,
  startTransition,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Interval {
  start: number;
  end: number;
  id: string;
  state: "before" | "overlap" | "after" | "new" | "merged" | "result";
}

type PlayState = { step: number; isPlaying: boolean };
type PlayAction =
  | { type: "TOGGLE" }
  | { type: "STOP" }
  | { type: "ADVANCE" }
  | { type: "RESET" };

const playReducer = (state: PlayState, action: PlayAction): PlayState => {
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
};

const initialIntervals = [
  { start: 1, end: 2 },
  { start: 3, end: 5 },
  { start: 6, end: 7 },
  { start: 8, end: 10 },
  { start: 12, end: 16 },
];

const newInterval = { start: 4, end: 8 };

// skipcq: JS-0067
export default function InsertIntervalVisualizer() {
  const [{ isPlaying }, dispatch] = useReducer(playReducer, {
    step: 0,
    isPlaying: false,
  });
  const [speed, setSpeed] = useState(1200);
  const [intervals, setIntervals] = useState<Interval[]>([]);
  const [insertInterval, setInsertInterval] = useState<Interval | null>(null);
  const [result, setResult] = useState<Interval[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [phase, setPhase] = useState<
    "init" | "before" | "merging" | "after" | "done"
  >("init");
  const [message, setMessage] = useState(
    "Click Play to insert a new interval and merge overlaps"
  );

  const reset = useCallback(() => {
    const ints = initialIntervals.map((int, i) => ({
      ...int,
      id: `existing-${i}`,
      state: "before" as const,
    }));
    setIntervals(ints);
    setInsertInterval({
      ...newInterval,
      id: "new",
      state: "new" as const,
    });
    setResult([]);
    setCurrentIdx(0);
    setPhase("init");
    setMessage("Click Play to insert a new interval and merge overlaps");
    dispatch({ type: "STOP" });
  }, []);

  useEffect(() => {
    startTransition(() => {
      reset();
    });
  }, [reset]);

  const performStep = useCallback(() => {
    if (!insertInterval) return;

    if (phase === "init") {
      setPhase("before");
      setMessage(
        "Phase 1: Find intervals that end BEFORE new interval starts"
      );
    } else if (phase === "before") {
      // Find intervals completely before newInterval
      if (
        currentIdx < intervals.length &&
        intervals[currentIdx].end < insertInterval.start
      ) {
        const updated = intervals.map((int, i) =>
          i === currentIdx
            ? { ...int, state: "before" as const }
            : i < currentIdx
              ? { ...int, state: "result" as const }
              : int
        );
        setIntervals(updated);
        setResult([...result, { ...intervals[currentIdx], state: "result" }]);
        setMessage(
          `[${intervals[currentIdx].start}, ${intervals[currentIdx].end}] ends at ${intervals[currentIdx].end} < ${insertInterval.start}. Add to result.`
        );
        setCurrentIdx(currentIdx + 1);
      } else {
        setPhase("merging");
        setMessage("Phase 2: Merge all overlapping intervals with new one");
      }
    } else if (phase === "merging") {
      // Merge overlapping intervals
      if (
        currentIdx < intervals.length &&
        intervals[currentIdx].start <= insertInterval.end
      ) {
        const curr = intervals[currentIdx];
        const newStart = Math.min(insertInterval.start, curr.start);
        const newEnd = Math.max(insertInterval.end, curr.end);

        const updated = intervals.map((int, i) =>
          i === currentIdx ? { ...int, state: "overlap" as const } : int
        );
        setIntervals(updated);

        setInsertInterval({
          ...insertInterval,
          start: newStart,
          end: newEnd,
          state: "merged",
        });

        setMessage(
          `[${curr.start}, ${curr.end}] overlaps (${curr.start} <= ${insertInterval.end}). Merge to [${newStart}, ${newEnd}]`
        );
        setCurrentIdx(currentIdx + 1);
      } else {
        // Done merging, add merged interval to result
        setResult([...result, { ...insertInterval, state: "result" }]);
        setPhase("after");
        setMessage("Phase 3: Add remaining intervals after the merge");
      }
    } else if (phase === "after") {
      if (currentIdx < intervals.length) {
        const curr = intervals[currentIdx];
        const updated = intervals.map((int, i) =>
          i === currentIdx ? { ...int, state: "after" as const } : int
        );
        setIntervals(updated);
        setResult([...result, { ...curr, state: "result" }]);
        setMessage(
          `[${curr.start}, ${curr.end}] is after merged interval. Add to result.`
        );
        setCurrentIdx(currentIdx + 1);
      } else {
        setPhase("done");
        setMessage(
          `Done! Result has ${result.length} intervals.`
        );
        dispatch({ type: "STOP" });
      }
    }
  }, [phase, currentIdx, intervals, insertInterval, result]);

  useEffect(() => {
    if (!isPlaying || phase === "done") return;

    const timer = setTimeout(performStep, speed);
    return () => clearTimeout(timer);
  }, [isPlaying, phase, speed, performStep]);

  const maxEnd = Math.max(
    ...initialIntervals.map((i) => i.end),
    newInterval.end
  );
  const timelineMax = maxEnd + 2;

  const getIntervalColor = (state: string) => {
    switch (state) {
      case "new":
        return "bg-yellow-500";
      case "merged":
        return "bg-green-500";
      case "overlap":
        return "bg-orange-500";
      case "before":
        return "bg-blue-400";
      case "after":
        return "bg-purple-400";
      case "result":
        return "bg-emerald-500";
      default:
        return "bg-gray-600";
    }
  };

  return (
    <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">Insert Interval</h3>
        <p className="text-gray-400 text-sm mt-1">
          Three phases: before, merge overlaps, after
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
            onClick={() => {
              if (!isPlaying && phase !== "done") {
                performStep();
              }
            }}
            disabled={isPlaying || phase === "done"}
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
              min="600"
              max="2000"
              step="100"
              value={2600 - speed}
              onChange={(e) => setSpeed(2600 - Number(e.target.value))}
              className="w-20 accent-amber-500"
            />
          </div>
        </div>

        {/* Phase indicator */}
        <div className="flex gap-2 mb-4">
          {["before", "merging", "after"].map((p, i) => (
            <div
              key={`phase-${p}`}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm ${
                phase === p || (phase === "init" && i === 0)
                  ? "bg-amber-500/20 border border-amber-500 text-amber-400"
                  : ["before", "merging", "after"].indexOf(phase) > i
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-800 text-gray-500"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                  phase === p || (phase === "init" && i === 0)
                    ? "bg-amber-500 text-white"
                    : "bg-gray-600"
                }`}
              >
                {i + 1}
              </span>
              {p === "before" ? "Before" : p === "merging" ? "Merge" : "After"}
            </div>
          ))}
        </div>

        {/* Timeline visualization - Existing intervals */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">Existing Intervals:</div>
          <div className="relative bg-gray-800/50 rounded-md p-4 h-48 overflow-hidden">
            {/* Timeline axis */}
            <div className="absolute bottom-4 left-4 right-4 h-0.5 bg-gray-600">
              {Array.from({ length: timelineMax + 1 }, (_, i) => (
                <div
                  key={`timeline-${i}`}
                  className="absolute bottom-0 w-0.5 h-2 bg-gray-600"
                  style={{ left: `${(i / timelineMax) * 100}%` }}
                >
                  <span className="absolute top-3 -translate-x-1/2 text-xs text-gray-500">
                    {i}
                  </span>
                </div>
              ))}
            </div>

            {/* Existing intervals */}
            <AnimatePresence>
              {intervals.map((int, idx) => (
                <motion.div
                  key={int.id}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: int.state === "overlap" ? 0.5 : 1,
                    y: idx === currentIdx ? -5 : 0,
                  }}
                  className={`absolute h-8 rounded-md ${getIntervalColor(int.state)} flex items-center justify-center text-white text-xs font-bold shadow-lg`}
                  style={{
                    left: `${(int.start / timelineMax) * 100}%`,
                    width: `${((int.end - int.start) / timelineMax) * 100}%`,
                    top: `${16 + idx * 28}px`,
                  }}
                >
                  [{int.start}, {int.end}]
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* New interval to insert */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">
            New Interval to Insert:
          </div>
          <div className="relative bg-gray-800/50 rounded-md p-4 h-16 overflow-hidden">
            <div className="absolute bottom-4 left-4 right-4 h-0.5 bg-gray-600" />
            {insertInterval && (
              <motion.div
                key={`insert-${insertInterval.start}-${insertInterval.end}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`absolute h-10 rounded-md ${getIntervalColor(insertInterval.state)} flex items-center justify-center text-white text-sm font-bold shadow-lg ring-2 ring-white/30`}
                style={{
                  left: `${(insertInterval.start / timelineMax) * 100}%`,
                  width: `${((insertInterval.end - insertInterval.start) / timelineMax) * 100}%`,
                  top: "8px",
                }}
              >
                [{insertInterval.start}, {insertInterval.end}]
                {insertInterval.state === "merged" && " (merged)"}
              </motion.div>
            )}
          </div>
        </div>

        {/* Result */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">Result:</div>
          <div className="relative bg-gray-800/50 rounded-md p-4 h-16 overflow-hidden">
            <div className="absolute bottom-4 left-4 right-4 h-0.5 bg-gray-600" />
            <AnimatePresence>
              {result.map((int, idx) => (
                <motion.div
                  key={`result-${int.id}-${idx}`}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute h-10 rounded-md bg-emerald-500 flex items-center justify-center text-white text-sm font-bold shadow-lg"
                  style={{
                    left: `${(int.start / timelineMax) * 100}%`,
                    width: `${((int.end - int.start) / timelineMax) * 100}%`,
                    top: "8px",
                  }}
                >
                  [{int.start}, {int.end}]
                </motion.div>
              ))}
            </AnimatePresence>
            {result.length === 0 && (
              <span className="text-gray-500 text-sm absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                Result will appear here
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-2xl font-bold text-amber-400">
              {intervals.length}
            </div>
            <div className="text-xs text-gray-500">Existing</div>
          </div>
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-2xl font-bold text-emerald-400">
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
              : phase === "merging"
                ? "bg-orange-500/10 border border-orange-500/30 text-orange-400"
                : "bg-gray-800 text-gray-300"
          }`}
        >
          {message}
        </motion.div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-yellow-500" />
            <span className="text-gray-400">New</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-blue-400" />
            <span className="text-gray-400">Before</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-orange-500" />
            <span className="text-gray-400">Overlapping</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-green-500" />
            <span className="text-gray-400">Merged</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-purple-400" />
            <span className="text-gray-400">After</span>
          </div>
        </div>

        {/* Algorithm explanation */}
        <div className="mt-4 p-3 bg-gray-800/30 rounded-md text-sm text-gray-400">
          <p>
            <strong className="text-amber-400">Key Insight:</strong> Three
            phases - add intervals ending before new starts, merge all
            overlapping, add intervals starting after merge ends.
          </p>
        </div>
      </div>
    </div>
  );
}
