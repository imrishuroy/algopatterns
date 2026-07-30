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
  length: number;
  id: string;
  state: "waiting" | "added" | "expired" | "best";
}

interface QueryResult {
  queryId: string;
  query: number;
  answer: number;
  bestInterval: Interval | null;
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
    default:
      return state;
  }
};

// Example data
const initialIntervals = [
  { id: "interval-1-3", start: 1, end: 3 },
  { id: "interval-2-3", start: 2, end: 3 },
  { id: "interval-3-7", start: 3, end: 7 },
  { id: "interval-6-6", start: 6, end: 6 },
];

const queryItems = [
  { id: "query-2", query: 2 },
  { id: "query-3", query: 3 },
  { id: "query-1", query: 1 },
  { id: "query-7", query: 7 },
  { id: "query-6", query: 6 },
  { id: "query-8", query: 8 },
];

const queries = queryItems.map((item) => item.query);

// skipcq: JS-0067
// skipcq: JS-R1005
// Reason: This visualizer owns offline query, heap, playback, and result state.
export default function IntervalQueryVisualizer() {
  const [{ isPlaying }, dispatch] = useReducer(playReducer, {
    step: 0,
    isPlaying: false,
  });
  const [speed, setSpeed] = useState(1200);
  const [intervals, setIntervals] = useState<Interval[]>([]);
  const [sortedQueries, setSortedQueries] = useState<
    { query: number; queryId: string }[]
  >([]);
  const [currentQueryIdx, setCurrentQueryIdx] = useState(0);
  const [heap, setHeap] = useState<Interval[]>([]);
  const [results, setResults] = useState<QueryResult[]>([]);
  const [phase, setPhase] = useState<
    "init" | "sorting" | "processing" | "done"
  >("init");
  const [message, setMessage] = useState(
    "Click Play to find minimum interval for each query"
  );
  const [intervalIdx, setIntervalIdx] = useState(0);

  const reset = useCallback(() => {
    const ints = initialIntervals.map((int) => ({
      ...int,
      length: int.end - int.start + 1,
      state: "waiting" as const,
    }));
    setIntervals(ints);
    setSortedQueries([]);
    setCurrentQueryIdx(0);
    setHeap([]);
    setResults([]);
    setPhase("init");
    setIntervalIdx(0);
    setMessage("Click Play to find minimum interval for each query");
    dispatch({ type: "STOP" });
  }, []);

  useEffect(() => {
    startTransition(() => {
      reset();
    });
  }, [reset]);

  // skipcq: JS-R1005
  // Reason: The algorithm is shown as explicit sorting and processing phases.
  const performStep = useCallback(() => {
    if (phase === "init") {
      setPhase("sorting");
      setMessage("Step 1: Sort intervals by START, queries by value");
    } else if (phase === "sorting") {
      // Sort intervals by start
      const sortedInts = [...intervals].sort((a, b) => a.start - b.start);
      setIntervals(sortedInts);

      // Sort queries but keep original indices
      const sq = queryItems.map((item) => ({
        query: item.query,
        queryId: item.id,
      }));
      sq.sort((a, b) => a.query - b.query);
      setSortedQueries(sq);

      setPhase("processing");
      setCurrentQueryIdx(0);
      setIntervalIdx(0);
      setMessage("Sorted! Now process queries from smallest to largest.");
    } else if (phase === "processing") {
      if (currentQueryIdx >= sortedQueries.length) {
        setPhase("done");
        setMessage(
          `Done! Answered all ${queries.length} queries using offline processing + min-heap.`
        );
        dispatch({ type: "STOP" });
        return;
      }

      const currentQuery = sortedQueries[currentQueryIdx].query;

      // Add all intervals that start <= current query
      const newHeap = [...heap];
      const newIntervals = [...intervals];
      let newIntervalIdx = intervalIdx;

      while (
        newIntervalIdx < intervals.length &&
        intervals[newIntervalIdx].start <= currentQuery
      ) {
        const int = { ...intervals[newIntervalIdx], state: "added" as const };
        newHeap.push(int);
        newIntervals[newIntervalIdx] = int;
        newIntervalIdx++;
      }

      // Sort heap by length (min-heap simulation)
      newHeap.sort((a, b) => a.length - b.length);

      // Remove expired intervals (end < query)
      const validHeap: Interval[] = [];
      for (const int of newHeap) {
        if (int.end >= currentQuery) {
          validHeap.push(int);
        } else {
          // Mark as expired
          const intervalIndex = newIntervals.findIndex(
            (interval) => interval.id === int.id
          );
          if (intervalIndex !== -1) {
            newIntervals[intervalIndex] = {
              ...newIntervals[intervalIndex],
              state: "expired",
            };
          }
        }
      }

      // Find answer
      let answer = -1;
      let bestInterval: Interval | null = null;
      if (validHeap.length > 0) {
        bestInterval = validHeap[0];
        answer = bestInterval.length;
        // Mark best
        const bestIntervalId = bestInterval.id;
        const intervalIndex = newIntervals.findIndex(
          (interval) => interval.id === bestIntervalId
        );
        if (intervalIndex !== -1) {
          newIntervals[intervalIndex] = {
            ...newIntervals[intervalIndex],
            state: "best",
          };
        }
      }

      setIntervals(newIntervals);
      setHeap(validHeap);
      setIntervalIdx(newIntervalIdx);

      // Store result
      const newResult: QueryResult = {
        queryId: sortedQueries[currentQueryIdx].queryId,
        query: currentQuery,
        answer,
        bestInterval,
      };
      setResults([...results, newResult]);

      if (answer === -1) {
        setMessage(
          `Query ${currentQuery}: No interval contains it. Answer = -1`
        );
      } else {
        const interval = bestInterval;
        setMessage(
          interval
            ? `Query ${currentQuery}: Smallest interval is [${interval.start},${interval.end}] with length ${answer}`
            : `Query ${currentQuery}: No interval contains it. Answer = -1`
        );
      }

      // Reset interval states for next query (except expired)
      setTimeout(() => {
        setIntervals((prev) =>
          prev.map((int) =>
            int.state === "best" || int.state === "added"
              ? { ...int, state: "added" }
              : int
          )
        );
        setCurrentQueryIdx(currentQueryIdx + 1);
      }, speed / 2);
    }
  }, [
    phase,
    intervals,
    sortedQueries,
    currentQueryIdx,
    heap,
    results,
    intervalIdx,
    speed,
  ]);

  useEffect(() => {
    if (!isPlaying || phase === "done") return undefined;

    const timer = setTimeout(performStep, speed);
    return () => clearTimeout(timer);
  }, [isPlaying, phase, speed, performStep]);

  const maxEnd =
    Math.max(...initialIntervals.map((i) => i.end), ...queries) + 1;
  const scaleTicks = Array.from({ length: maxEnd + 1 }, (_, tick) => tick);

  const getIntervalColor = (state: string) => {
    switch (state) {
      case "best":
        return "bg-green-500";
      case "added":
        return "bg-blue-500";
      case "expired":
        return "bg-gray-600 opacity-50";
      default:
        return "bg-gray-700";
    }
  };

  // skipcq: JS-0415
  // Reason: Nested markup is needed to align query labels, heap entries, and timeline bars.
  return (
    <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">
          Minimum Interval to Include Each Query
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Offline processing + Min-Heap: Sort queries, sweep through intervals
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
              className="w-20 accent-purple-500"
            />
          </div>
        </div>

        {/* Input Display */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-800/50 rounded-md p-3">
            <div className="text-sm text-gray-400 mb-2">Intervals:</div>
            <div className="flex flex-wrap gap-2">
              {initialIntervals.map((int) => (
                <span
                  key={int.id}
                  className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-sm font-mono"
                >
                  [{int.start},{int.end}]
                </span>
              ))}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-md p-3">
            <div className="text-sm text-gray-400 mb-2">Queries:</div>
            <div className="flex flex-wrap gap-2">
              {queryItems.map((item) => {
                const result = results.find((r) => r.queryId === item.id);
                const isProcessed = result !== undefined;
                const isCurrent =
                  sortedQueries[currentQueryIdx]?.queryId === item.id &&
                  phase === "processing";
                return (
                  <span
                    key={item.id}
                    className={`px-2 py-1 rounded text-sm font-mono ${
                      isCurrent
                        ? "bg-yellow-500 text-black"
                        : isProcessed
                          ? "bg-green-500/20 text-green-300"
                          : "bg-gray-700 text-gray-300"
                    }`}
                  >
                    {item.query}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Timeline visualization */}
        <div className="mb-4 bg-gray-800/30 rounded-lg p-4">
          {/* Timeline scale */}
          <div className="relative h-5 mb-2">
            {scaleTicks.map((tick) => (
              <span
                key={`scale-${tick}`}
                className="absolute text-xs text-gray-500 -translate-x-1/2"
                style={{ left: `${(tick / maxEnd) * 100}%` }}
              >
                {tick}
              </span>
            ))}
          </div>

          {/* Intervals */}
          <div className="relative h-32 mb-2">
            {intervals.map((int, idx) => {
              const leftPct = (int.start / maxEnd) * 100;
              const widthPct = ((int.end - int.start + 1) / maxEnd) * 100;
              const top = 8 + idx * 28;
              return (
                <motion.div
                  key={`interval-${int.id}`}
                  animate={{
                    scale: int.state === "best" ? 1.05 : 1,
                    opacity: int.state === "expired" ? 0.4 : 1,
                  }}
                  className={`absolute h-6 rounded flex items-center justify-center text-white text-xs font-bold ${getIntervalColor(int.state)} ${
                    int.state === "best" ? "ring-2 ring-green-300 z-10" : ""
                  }`}
                  style={{
                    left: `${leftPct}%`,
                    width: `${Math.max(widthPct, 3)}%`,
                    top: `${top}px`,
                    minWidth: "45px",
                  }}
                >
                  [{int.start},{int.end}]
                </motion.div>
              );
            })}

            {/* Current query marker */}
            {phase === "processing" &&
              currentQueryIdx < sortedQueries.length && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute top-0 bottom-0 w-0.5 bg-yellow-400 z-20"
                  style={{
                    left: `${(sortedQueries[currentQueryIdx].query / maxEnd) * 100}%`,
                  }}
                >
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-yellow-400 text-lg">
                    ▼
                  </div>
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-yellow-400 text-xs font-bold">
                    Q={sortedQueries[currentQueryIdx].query}
                  </div>
                </motion.div>
              )}
          </div>
        </div>

        {/* Heap visualization */}
        <div className="mb-4 bg-gray-800/50 rounded-md p-3">
          <div className="text-sm text-gray-400 mb-2">
            Min-Heap (by length):
          </div>
          <div className="flex flex-wrap gap-2 min-h-[32px]">
            <AnimatePresence>
              {heap.length === 0 ? (
                <span className="text-gray-500 text-sm italic">Empty</span>
              ) : (
                heap.map((int, idx) => (
                  <motion.span
                    key={`heap-${int.id}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className={`px-2 py-1 rounded text-sm font-mono ${
                      idx === 0
                        ? "bg-green-500 text-white"
                        : "bg-gray-700 text-gray-300"
                    }`}
                  >
                    [{int.start},{int.end}] len={int.length}
                  </motion.span>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Results */}
        <div className="mb-4 bg-gray-800/50 rounded-md p-3">
          <div className="text-sm text-gray-400 mb-2">Results:</div>
          <div className="flex flex-wrap gap-2 min-h-[32px]">
            {results.length === 0 ? (
              <span className="text-gray-500 text-sm italic">
                No results yet
              </span>
            ) : (
              queryItems.map((item) => {
                const result = results.find(
                  (entry) => entry.queryId === item.id
                );
                const answer = result?.answer ?? null;
                return (
                  <span
                    key={`result-${item.id}`}
                    className={`px-2 py-1 rounded text-sm font-mono ${
                      answer !== null
                        ? answer === -1
                          ? "bg-red-500/20 text-red-300"
                          : "bg-green-500/20 text-green-300"
                        : "bg-gray-700 text-gray-500"
                    }`}
                  >
                    {answer !== null ? answer : "?"}
                  </span>
                );
              })
            )}
          </div>
          {results.length > 0 && results.length === queries.length && (
            <div className="mt-2 text-xs text-gray-500">
              Output array: [
              {queryItems
                .map((item) => {
                  const result = results.find(
                    (entry) => entry.queryId === item.id
                  );
                  return result?.answer ?? "?";
                })
                .join(", ")}
              ]
            </div>
          )}
        </div>

        {/* Message */}
        <div className="p-3 bg-gray-800 rounded-md">
          <div className="text-gray-300 text-sm">{message}</div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-gray-700" />
            <span>Waiting</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span>In Heap</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span>Best (Min Length)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-gray-600 opacity-50" />
            <span>Expired</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-1 bg-yellow-400" />
            <span>Current Query</span>
          </div>
        </div>
      </div>
    </div>
  );
}
