"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useReducer,
  startTransition,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

interface WorkInterval {
  start: number;
  end: number;
  employeeId: number;
  state: "original" | "flattening" | "merging" | "merged";
}

interface FreeInterval {
  start: number;
  end: number;
}

type PlayState = { step: number; isPlaying: boolean };
type PlayAction =
  | { type: "TOGGLE" }
  | { type: "STOP" }
  | { type: "ADVANCE" }
  | { type: "RESET" };

const timelineTicks = (max: number) =>
  Array.from({ length: max + 1 }, (_, tick) => tick);

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

const employeeSchedules = [
  {
    id: "emp-1",
    label: "Emp 1",
    color: "bg-blue-500",
    intervals: [
      { start: 1, end: 3 },
      { start: 6, end: 7 },
    ],
  },
  {
    id: "emp-2",
    label: "Emp 2",
    color: "bg-green-500",
    intervals: [{ start: 2, end: 4 }],
  },
  {
    id: "emp-3",
    label: "Emp 3",
    color: "bg-purple-500",
    intervals: [
      { start: 2, end: 5 },
      { start: 9, end: 12 },
    ],
  },
];

// skipcq: JS-0067
// skipcq: JS-R1005
// Reason: The visualizer keeps several playback and derived timeline states together.
export default function EmployeeFreeTimeVisualizer() {
  const [{ isPlaying }, dispatch] = useReducer(playReducer, {
    step: 0,
    isPlaying: false,
  });
  const [speed, setSpeed] = useState(1000);
  const [flattenedIntervals, setFlattenedIntervals] = useState<WorkInterval[]>(
    []
  );
  const [mergedIntervals, setMergedIntervals] = useState<WorkInterval[]>([]);
  const [freeTime, setFreeTime] = useState<FreeInterval[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [phase, setPhase] = useState<
    "init" | "flatten" | "sort" | "merge" | "findGaps" | "done"
  >("init");
  const [message, setMessage] = useState(
    "Click Play to find when all employees are free"
  );

  const reset = useCallback(() => {
    setFlattenedIntervals([]);
    setMergedIntervals([]);
    setFreeTime([]);
    setCurrentIdx(0);
    setPhase("init");
    setMessage("Click Play to find when all employees are free");
    dispatch({ type: "STOP" });
  }, []);

  useEffect(() => {
    startTransition(() => {
      reset();
    });
  }, [reset]);

  // skipcq: JS-R1005
  // Reason: The explicit phase branches mirror the tutorial walkthrough steps.
  const performStep = useCallback(() => {
    if (phase === "init") {
      setPhase("flatten");
      setMessage("Step 1: Flatten all employee schedules into one list");
    } else if (phase === "flatten") {
      // Flatten all schedules
      const flattened: WorkInterval[] = [];
      employeeSchedules.forEach((employee, employeeIndex) => {
        employee.intervals.forEach((interval) => {
          flattened.push({
            ...interval,
            employeeId: employeeIndex,
            state: "original",
          });
        });
      });
      setFlattenedIntervals(flattened);
      setPhase("sort");
      setMessage(
        `Flattened ${flattened.length} work intervals. Now sorting by start time...`
      );
    } else if (phase === "sort") {
      // Sort by start time
      const sorted = [...flattenedIntervals].sort((a, b) => a.start - b.start);
      setFlattenedIntervals(sorted);
      // Initialize merged with first interval
      if (sorted.length > 0) {
        setMergedIntervals([{ ...sorted[0], state: "merged" }]);
        setCurrentIdx(1);
      }
      setPhase("merge");
      setMessage("Sorted! Now merging overlapping work intervals...");
    } else if (phase === "merge") {
      if (currentIdx >= flattenedIntervals.length) {
        setPhase("findGaps");
        setCurrentIdx(0);
        setMessage(
          "Merged all work time! Now finding gaps (free time) between work blocks..."
        );
        return;
      }

      const curr = flattenedIntervals[currentIdx];
      const last = mergedIntervals[mergedIntervals.length - 1];

      // Mark current as being processed
      const updatedFlattened = flattenedIntervals.map((int, i) =>
        i === currentIdx ? { ...int, state: "merging" as const } : int
      );
      setFlattenedIntervals(updatedFlattened);

      if (curr.start <= last.end) {
        // Overlaps, merge
        const newEnd = Math.max(last.end, curr.end);
        const newMerged = [...mergedIntervals];
        newMerged[newMerged.length - 1] = { ...last, end: newEnd };
        setMergedIntervals(newMerged);
        setMessage(
          `[${curr.start}, ${curr.end}] overlaps with [${last.start}, ${last.end}]. Merged to [${last.start}, ${newEnd}]`
        );
      } else {
        // No overlap, add new merged block
        setMergedIntervals([...mergedIntervals, { ...curr, state: "merged" }]);
        setMessage(
          `[${curr.start}, ${curr.end}] doesn't overlap. New work block.`
        );
      }

      setCurrentIdx(currentIdx + 1);
    } else if (phase === "findGaps") {
      if (currentIdx >= mergedIntervals.length - 1) {
        setPhase("done");
        setMessage(
          `Found ${freeTime.length} free time slot${freeTime.length !== 1 ? "s" : ""} when everyone is available!`
        );
        dispatch({ type: "STOP" });
        return;
      }

      // Find gap between merged[currentIdx] and merged[currentIdx + 1]
      const curr = mergedIntervals[currentIdx];
      const next = mergedIntervals[currentIdx + 1];
      const gapStart = curr.end;
      const gapEnd = next.start;

      setFreeTime([...freeTime, { start: gapStart, end: gapEnd }]);
      setMessage(
        `Gap between [${curr.start}, ${curr.end}] and [${next.start}, ${next.end}]: FREE TIME [${gapStart}, ${gapEnd}]`
      );
      setCurrentIdx(currentIdx + 1);
    }
  }, [phase, currentIdx, flattenedIntervals, mergedIntervals, freeTime]);

  useEffect(() => {
    if (!isPlaying || phase === "done") return undefined;

    const timer = setTimeout(performStep, speed);
    return () => clearTimeout(timer);
  }, [isPlaying, phase, speed, performStep]);

  const maxEnd =
    Math.max(
      ...employeeSchedules.flatMap((employee) =>
        employee.intervals.map((interval) => interval.end)
      ),
      12
    ) + 1;

  // skipcq: JS-0415
  // Reason: Timeline rows are nested to keep labels, grids, and bars aligned.
  return (
    <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">Employee Free Time</h3>
        <p className="text-gray-400 text-sm mt-1">
          Flatten schedules, merge work time, find gaps
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
              min="500"
              max="1800"
              step="100"
              value={2300 - speed}
              onChange={(e) => setSpeed(2300 - Number(e.target.value))}
              className="w-20 accent-cyan-500"
            />
          </div>
        </div>

        {/* Phase indicator */}
        <div className="flex flex-wrap gap-2 mb-4">
          {["flatten", "sort", "merge", "findGaps"].map((p, i) => (
            <div
              key={`phase-${p}`}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm ${
                phase === p || (phase === "init" && i === 0)
                  ? "bg-cyan-500/20 border border-cyan-500 text-cyan-400"
                  : ["flatten", "sort", "merge", "findGaps"].indexOf(phase) > i
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-800 text-gray-500"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                  phase === p || (phase === "init" && i === 0)
                    ? "bg-cyan-500 text-white"
                    : "bg-gray-600"
                }`}
              >
                {i + 1}
              </span>
              {p === "flatten"
                ? "Flatten"
                : p === "sort"
                  ? "Sort"
                  : p === "merge"
                    ? "Merge"
                    : "Find Gaps"}
            </div>
          ))}
        </div>

        {/* Timeline header */}
        <div className="flex justify-between text-xs text-gray-500 mb-2 px-2">
          {timelineTicks(maxEnd).map((tick) => (
            <span key={`time-${tick}`}>{tick}</span>
          ))}
        </div>

        {/* Employee schedules */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">Employee Schedules:</div>
          <div className="relative bg-gray-800/50 rounded-md p-4 overflow-hidden">
            {employeeSchedules.map((employee) => (
              <div key={employee.id} className="relative h-10 mb-2">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 text-xs text-gray-400 w-16">
                  {employee.label}:
                </div>
                <div className="ml-16 relative h-full">
                  {/* Grid lines */}
                  {timelineTicks(maxEnd).map((tick) => (
                    <div
                      key={`grid-${employee.id}-${tick}`}
                      className="absolute top-0 bottom-0 border-l border-gray-700/30"
                      style={{ left: `${(tick / maxEnd) * 100}%` }}
                    />
                  ))}
                  {/* Intervals */}
                  {employee.intervals.map((interval) => (
                    <div
                      key={`${employee.id}-${interval.start}-${interval.end}`}
                      className={`absolute h-8 top-1 rounded-md ${employee.color} flex items-center justify-center text-white text-xs font-bold shadow-md`}
                      style={{
                        left: `${(interval.start / maxEnd) * 100}%`,
                        width: `${((interval.end - interval.start) / maxEnd) * 100}%`,
                      }}
                    >
                      [{interval.start},{interval.end}]
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Merged work time */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">
            Merged Work Time (Everyone Busy):
          </div>
          <div className="relative bg-gray-800/50 rounded-md p-4 h-16 overflow-hidden">
            {/* Grid lines */}
            {timelineTicks(maxEnd).map((tick) => (
              <div
                key={`grid-merged-${tick}`}
                className="absolute top-0 bottom-0 border-l border-gray-700/30"
                style={{ left: `${(tick / maxEnd) * 100}%` }}
              />
            ))}
            <AnimatePresence>
              {mergedIntervals.map((interval) => (
                <motion.div
                  key={`merged-${interval.employeeId}-${interval.start}-${interval.end}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute h-10 top-2 rounded-md bg-red-500 flex items-center justify-center text-white text-xs font-bold shadow-lg"
                  style={{
                    left: `${(interval.start / maxEnd) * 100}%`,
                    width: `${((interval.end - interval.start) / maxEnd) * 100}%`,
                  }}
                >
                  [{interval.start},{interval.end}]
                </motion.div>
              ))}
            </AnimatePresence>
            {mergedIntervals.length === 0 && (
              <span className="text-gray-500 text-sm absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                Merged work blocks will appear here
              </span>
            )}
          </div>
        </div>

        {/* Free time */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">
            Free Time (Everyone Available):
          </div>
          <div className="relative bg-gray-800/50 rounded-md p-4 h-16 overflow-hidden">
            {/* Grid lines */}
            {timelineTicks(maxEnd).map((tick) => (
              <div
                key={`grid-free-${tick}`}
                className="absolute top-0 bottom-0 border-l border-gray-700/30"
                style={{ left: `${(tick / maxEnd) * 100}%` }}
              />
            ))}
            <AnimatePresence>
              {freeTime.map((interval) => (
                <motion.div
                  key={`free-${interval.start}-${interval.end}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute h-10 top-2 rounded-md bg-emerald-500 flex items-center justify-center text-white text-sm font-bold shadow-lg ring-2 ring-emerald-400/50"
                  style={{
                    left: `${(interval.start / maxEnd) * 100}%`,
                    width: `${((interval.end - interval.start) / maxEnd) * 100}%`,
                  }}
                >
                  [{interval.start},{interval.end}]
                </motion.div>
              ))}
            </AnimatePresence>
            {freeTime.length === 0 && phase !== "done" && (
              <span className="text-gray-500 text-sm absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                Free time slots will appear here
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-2xl font-bold text-white">
              {employeeSchedules.length}
            </div>
            <div className="text-xs text-gray-500">Employees</div>
          </div>
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {employeeSchedules.reduce(
                (sum, employee) => sum + employee.intervals.length,
                0
              )}
            </div>
            <div className="text-xs text-gray-500">Work Intervals</div>
          </div>
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-2xl font-bold text-red-400">
              {mergedIntervals.length}
            </div>
            <div className="text-xs text-gray-500">Merged Blocks</div>
          </div>
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-2xl font-bold text-emerald-400">
              {freeTime.length}
            </div>
            <div className="text-xs text-gray-500">Free Slots</div>
          </div>
        </div>

        {/* Message */}
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-md text-sm mb-4 ${
            phase === "done"
              ? "bg-green-500/10 border border-green-500/30 text-green-400"
              : message.includes("FREE TIME")
                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                : "bg-gray-800 text-gray-300"
          }`}
        >
          {message}
        </motion.div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 text-sm mb-4">
          {employeeSchedules.map((employee) => (
            <div key={`legend-${employee.id}`} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-md ${employee.color}`} />
              <span className="text-gray-400">{employee.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-red-500" />
            <span className="text-gray-400">Merged (Busy)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-emerald-500" />
            <span className="text-gray-400">Free Time</span>
          </div>
        </div>

        {/* Algorithm explanation */}
        <div className="p-3 bg-gray-800/30 rounded-md text-sm text-gray-400">
          <p>
            <strong className="text-cyan-400">Key Insight:</strong> Flatten all
            work schedules into one list, merge overlapping work times, then the
            gaps between merged blocks are when everyone is free!
          </p>
        </div>
      </div>
    </div>
  );
}
