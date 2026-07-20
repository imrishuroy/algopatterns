"use client";

import React, { useState, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Project {
  name: string;
  capital: number;
  profit: number;
}

interface Step {
  type: "init" | "unlock" | "pick" | "no-affordable" | "done";
  round: number;
  capital: number;
  minHeap: Project[]; // still locked
  maxHeap: Project[]; // unlocked, available
  justUnlocked: Project[];
  picked: Project | null;
  message: string;
}

const PROJECTS: Project[] = [
  { name: "A", capital: 0, profit: 2 },
  { name: "B", capital: 0, profit: 1 },
  { name: "C", capital: 2, profit: 3 },
  { name: "D", capital: 3, profit: 5 },
  { name: "E", capital: 5, profit: 8 },
];

const K = 4;
const W0 = 0;

const PROJECT_COLORS: Record<string, string> = {
  A: "bg-blue-500",
  B: "bg-green-500",
  C: "bg-purple-500",
  D: "bg-orange-500",
  E: "bg-pink-500",
};

const PROJECT_RING: Record<string, string> = {
  A: "ring-blue-400",
  B: "ring-green-400",
  C: "ring-purple-400",
  D: "ring-orange-400",
  E: "ring-pink-400",
};

function buildSteps(): Step[] {
  const steps: Step[] = [];

  // Sort by capital (min-heap order)
  const sorted = [...PROJECTS].sort((a, b) => a.capital - b.capital);

  steps.push({
    type: "init",
    round: 0,
    capital: W0,
    minHeap: [...sorted],
    maxHeap: [],
    justUnlocked: [],
    picked: null,
    message: `Start: W = ${W0}. All ${PROJECTS.length} projects locked in min-heap (sorted by capital needed).`,
  });

  let w = W0;
  let idx = 0;
  const maxHeap: Project[] = [];
  const minHeapRemaining = [...sorted];

  for (let round = 1; round <= K; round++) {
    // Unlock affordable projects
    const justUnlocked: Project[] = [];
    while (idx < sorted.length && sorted[idx].capital <= w) {
      justUnlocked.push(sorted[idx]);
      maxHeap.push(sorted[idx]);
      const removeIdx = minHeapRemaining.findIndex(
        (p) => p.name === sorted[idx].name
      );
      if (removeIdx >= 0) {
        minHeapRemaining.splice(removeIdx, 1);
      }
      idx++;
    }

    const sortedMax = [...maxHeap].sort((a, b) => b.profit - a.profit);

    steps.push({
      type: justUnlocked.length > 0 ? "unlock" : "pick",
      round,
      capital: w,
      minHeap: [...minHeapRemaining],
      maxHeap: sortedMax,
      justUnlocked,
      picked: null,
      message:
        justUnlocked.length > 0
          ? `Round ${round}: W=${w}. Unlock ${justUnlocked.map((p) => `${p.name}(needs ${p.capital})`).join(", ")} → move to max-heap.`
          : `Round ${round}: W=${w}. No new projects unlocked.`,
    });

    if (maxHeap.length === 0) {
      steps.push({
        type: "no-affordable",
        round,
        capital: w,
        minHeap: [...minHeapRemaining],
        maxHeap: [],
        justUnlocked: [],
        picked: null,
        message: `Round ${round}: Max-heap is empty. No affordable projects. Stop early.`,
      });
      break;
    }

    // Pick best (highest profit)
    maxHeap.sort((a, b) => b.profit - a.profit);
    const best = maxHeap.shift()!;
    const prevW = w;
    w += best.profit;

    const sortedMaxAfter = [...maxHeap].sort((a, b) => b.profit - a.profit);

    steps.push({
      type: "pick",
      round,
      capital: w,
      minHeap: [...minHeapRemaining],
      maxHeap: sortedMaxAfter,
      justUnlocked: [],
      picked: best,
      message: `Pick ${best.name} (profit=${best.profit}, highest in max-heap). W: ${prevW} → ${w}.`,
    });
  }

  steps.push({
    type: "done",
    round: K,
    capital: w,
    minHeap: [...minHeapRemaining],
    maxHeap: [...maxHeap].sort((a, b) => b.profit - a.profit),
    justUnlocked: [],
    picked: null,
    message: `Done! Final capital = ${w} after ${K} rounds.`,
  });

  return steps;
}

// skipcq: JS-0067
export default function IPOVisualizer() {
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
  const isDone = current.type === "done";

  return (
    <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">
          IPO: Maximize Capital
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          k={K}, starting capital={W0}. Two heaps: min-heap unlocks projects,
          max-heap picks the best.
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
              className="w-20 accent-amber-500"
            />
          </div>
          <span className="text-gray-500 text-xs ml-2">
            Step {stepIndex + 1}/{steps.length}
          </span>
        </div>

        {/* Project reference table */}
        <div>
          <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
            Projects
          </div>
          <div className="flex flex-wrap gap-2">
            {PROJECTS.map((p) => {
              const inMin = current.minHeap.some((x) => x.name === p.name);
              const inMax = current.maxHeap.some((x) => x.name === p.name);
              const isPicked = current.picked?.name === p.name;
              return (
                <motion.div
                  key={p.name}
                  animate={{
                    scale: isPicked ? 1.08 : 1,
                    opacity: !inMin && !inMax && !isPicked ? 0.35 : 1,
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md border ${
                    isPicked
                      ? `border-white bg-white/10 ring-2 ${PROJECT_RING[p.name]}`
                      : inMax
                        ? `border-amber-500/60 bg-amber-500/10`
                        : inMin
                          ? "border-gray-600 bg-gray-800/60"
                          : "border-gray-700 bg-gray-800/30"
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-full ${PROJECT_COLORS[p.name]} flex items-center justify-center text-white font-bold text-sm`}
                  >
                    {p.name}
                  </span>
                  <div className="text-xs">
                    <div className="text-gray-300">cap: {p.capital}</div>
                    <div className="text-green-400">profit: +{p.profit}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-2 text-xs text-gray-500">
            <span>
              <span className="inline-block w-3 h-3 rounded-sm border border-gray-600 bg-gray-800/60 mr-1" />
              locked (min-heap)
            </span>
            <span>
              <span className="inline-block w-3 h-3 rounded-sm border border-amber-500/60 bg-amber-500/10 mr-1" />
              unlocked (max-heap)
            </span>
            <span>
              <span className="inline-block w-3 h-3 rounded-sm border border-white/40 bg-white/10 mr-1" />
              just picked
            </span>
            <span>
              <span className="inline-block w-3 h-3 rounded-sm border border-gray-700 bg-gray-800/30 mr-1 opacity-40" />
              done
            </span>
          </div>
        </div>

        {/* Two heaps side by side */}
        <div className="grid grid-cols-2 gap-4">
          {/* Min-heap */}
          <div>
            <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
              Min-Heap (locked, by capital)
            </div>
            <div className="bg-gray-800/50 rounded-md p-3 min-h-[100px]">
              {current.minHeap.length === 0 ? (
                <div className="text-center text-gray-600 text-sm py-4">
                  empty
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {current.minHeap.map((p, i) => (
                    <motion.div
                      key={p.name}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-md bg-gray-700/60 ${i === 0 ? "ring-1 ring-gray-500" : ""}`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full ${PROJECT_COLORS[p.name]} flex items-center justify-center text-white text-xs font-bold`}
                      >
                        {p.name}
                      </span>
                      <span className="text-xs text-gray-300">
                        needs {p.capital}
                      </span>
                      {i === 0 && (
                        <span className="ml-auto text-xs text-gray-500">
                          min
                        </span>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Max-heap */}
          <div>
            <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
              Max-Heap (unlocked, by profit)
            </div>
            <div className="bg-gray-800/50 rounded-md p-3 min-h-[100px]">
              {current.maxHeap.length === 0 ? (
                <div className="text-center text-gray-600 text-sm py-4">
                  empty
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <AnimatePresence>
                    {current.maxHeap.map((p, i) => (
                      <motion.div
                        key={p.name}
                        layout
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10, scale: 0.8 }}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-md ${
                          i === 0
                            ? "bg-amber-500/20 ring-1 ring-amber-500/60"
                            : "bg-gray-700/60"
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-full ${PROJECT_COLORS[p.name]} flex items-center justify-center text-white text-xs font-bold`}
                        >
                          {p.name}
                        </span>
                        <span className="text-xs text-green-400">
                          +{p.profit}
                        </span>
                        {i === 0 && (
                          <span className="ml-auto text-xs text-amber-400 font-semibold">
                            pick this
                          </span>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Capital tracker */}
        <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-md border border-amber-500/20 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500">Current Capital</div>
            <motion.div
              key={current.capital}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-4xl font-bold text-amber-400"
            >
              {current.capital}
            </motion.div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">Round</div>
            <div className="text-2xl font-bold text-gray-300">
              {current.round > 0 ? current.round : "—"} / {K}
            </div>
          </div>
          <div className="text-right">
            {current.picked && (
              <motion.div
                key={current.picked.name}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="text-xs text-gray-500">Just picked</div>
                <div className="flex items-center gap-2 justify-end mt-1">
                  <span
                    className={`w-8 h-8 rounded-full ${PROJECT_COLORS[current.picked.name]} flex items-center justify-center text-white font-bold`}
                  >
                    {current.picked.name}
                  </span>
                  <span className="text-green-400 font-bold text-lg">
                    +{current.picked.profit}
                  </span>
                </div>
              </motion.div>
            )}
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
              : current.type === "pick"
                ? "bg-amber-500/10 border border-amber-500/30 text-amber-300"
                : current.type === "unlock"
                  ? "bg-blue-500/10 border border-blue-500/30 text-blue-300"
                  : current.type === "no-affordable"
                    ? "bg-red-500/10 border border-red-500/30 text-red-400"
                    : "bg-gray-800 text-gray-300"
          }`}
        >
          {current.message}
        </motion.div>

        {/* Key insight */}
        <div className="p-3 bg-gray-800/30 rounded-md text-sm text-gray-400">
          <strong className="text-amber-400">Key insight:</strong> Projects stay
          locked in the min-heap until you can afford them. Once unlocked, they
          stay in the max-heap even across future rounds. Always pick the
          highest profit from what is currently available.
        </div>
      </div>
    </div>
  );
}
