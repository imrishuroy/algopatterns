"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Example string - same as tutorial
const INPUT_STRING = "ababcbacadefegdehijhklij";

interface StepInfo {
  type: "init" | "scan" | "extend" | "cut" | "done";
  index: number;
  char: string;
  lastIndex: number;
  start: number;
  end: number;
  partitions: number[];
  message: string;
}

// Pre-compute last index for each character
const computeLastIndex = (): Record<string, number> => {
  const lastIndex: Record<string, number> = {};
  for (let i = 0; i < INPUT_STRING.length; i++) {
    lastIndex[INPUT_STRING[i]] = i;
  }
  return lastIndex;
};

const LAST_INDEX = computeLastIndex();

// Pre-compute all steps
const computeSteps = (): StepInfo[] => {
  const steps: StepInfo[] = [];
  const partitions: number[] = [];
  let start = 0;
  let end = 0;

  // Initial state
  steps.push({
    type: "init",
    index: -1,
    char: "",
    lastIndex: -1,
    start: 0,
    end: 0,
    partitions: [],
    message: `Pre-computed last index for each letter. Now scan left to right.`,
  });

  for (let i = 0; i < INPUT_STRING.length; i++) {
    const char = INPUT_STRING[i];
    const charLastIndex = LAST_INDEX[char];
    const oldEnd = end;

    // Scan step
    steps.push({
      type: "scan",
      index: i,
      char,
      lastIndex: charLastIndex,
      start,
      end,
      partitions: [...partitions],
      message: `i=${i}, char='${char}': Last occurrence of '${char}' is at index ${charLastIndex}.`,
    });

    // Check if we need to extend
    if (charLastIndex > end) {
      end = charLastIndex;
      steps.push({
        type: "extend",
        index: i,
        char,
        lastIndex: charLastIndex,
        start,
        end,
        partitions: [...partitions],
        message: `Extend! end = max(${oldEnd}, ${charLastIndex}) = ${end}. Must reach index ${end}.`,
      });
    }

    // Check if we can cut
    if (i === end) {
      const size = end - start + 1;
      partitions.push(size);
      steps.push({
        type: "cut",
        index: i,
        char,
        lastIndex: charLastIndex,
        start,
        end,
        partitions: [...partitions],
        message: `CUT! i == end (${i} == ${end}). Partition size = ${end} - ${start} + 1 = ${size}`,
      });
      start = i + 1;
    }
  }

  // Done
  steps.push({
    type: "done",
    index: INPUT_STRING.length,
    char: "",
    lastIndex: -1,
    start,
    end,
    partitions: [...partitions],
    message: `Done! Partitions: [${partitions.join(", ")}]`,
  });

  return steps;
};

const STEPS = computeSteps();

// skipcq: JS-0067 — React component with hooks requires function declaration
export default function PartitionLabelsVisualizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [currentStep, setCurrentStep] = useState(0);

  const isDone = currentStep >= STEPS.length;
  const currentStepData = currentStep > 0 ? STEPS[currentStep - 1] : null;

  const performStep = useCallback(() => {
    if (currentStep < STEPS.length) {
      setCurrentStep((s) => s + 1);
    } else {
      setIsPlaying(false);
    }
  }, [currentStep]);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      performStep();
    }, speed);

    return () => clearTimeout(timer);
  }, [isPlaying, performStep, speed]);

  const reset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  // Get current state
  const getCurrentState = () => {
    if (!currentStepData) {
      return { start: 0, end: 0, index: -1, partitions: [] };
    }
    return {
      start: currentStepData.start,
      end: currentStepData.end,
      index: currentStepData.index,
      partitions: currentStepData.partitions,
    };
  };

  const state = getCurrentState();

  // Get character status for coloring
  const getCharStatus = (idx: number) => {
    if (!currentStepData) return "pending";

    // Check if this index is in a completed partition
    let partitionEnd = -1;
    for (const size of state.partitions) {
      partitionEnd += size;
      if (idx <= partitionEnd) {
        return "completed";
      }
    }

    if (idx === state.index) return "current";
    if (idx >= state.start && idx <= state.end) return "in-range";
    if (idx < state.start) return "completed";
    return "pending";
  };

  const getCharStyle = (status: string) => {
    switch (status) {
      case "current":
        return "bg-yellow-500 text-black border-yellow-400";
      case "in-range":
        return "bg-blue-500/30 text-blue-300 border-blue-500";
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/50";
      default:
        return "bg-gray-800 text-gray-400 border-gray-700";
    }
  };

  // Get partition boundaries for visualization
  const getPartitionBoundaries = (): number[] => {
    const boundaries: number[] = [];
    let pos = -1;
    for (const size of state.partitions) {
      pos += size;
      boundaries.push(pos);
    }
    return boundaries;
  };

  const partitionBoundaries = getPartitionBoundaries();

  // Compute partition colors
  const getPartitionColor = (partitionIndex: number) => {
    const colors = [
      "bg-green-500/30 border-green-500",
      "bg-purple-500/30 border-purple-500",
      "bg-orange-500/30 border-orange-500",
      "bg-pink-500/30 border-pink-500",
      "bg-cyan-500/30 border-cyan-500",
    ];
    return colors[partitionIndex % colors.length];
  };

  // Get which partition a character belongs to
  const getPartitionIndex = (idx: number): number => {
    let end = -1;
    for (let p = 0; p < state.partitions.length; p++) {
      end += state.partitions[p];
      if (idx <= end) return p;
    }
    return -1;
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="p-4 border-b border-gray-800 bg-gradient-to-r from-teal-500/10 to-cyan-500/10">
        <h3 className="text-lg font-semibold text-white">Partition Labels</h3>
        <p className="text-gray-400 text-sm mt-1">
          Split string so each letter appears in only one partition
        </p>
      </div>

      <div className="p-4">
        {/* Controls */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={isDone}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              isPlaying ? "bg-yellow-500 text-black" : "bg-green-500 text-white"
            } disabled:opacity-50`}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            onClick={() => {
              if (!isPlaying && !isDone) {
                performStep();
              }
            }}
            disabled={isPlaying || isDone}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 disabled:opacity-50"
          >
            Step
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
              min="200"
              max="1200"
              step="100"
              value={1400 - speed}
              onChange={(e) => setSpeed(1400 - Number(e.target.value))}
              className="w-20 accent-teal-500"
            />
          </div>
        </div>

        {/* Last Index Display */}
        <div className="mb-6 p-3 bg-gray-800/50 rounded-lg">
          <div className="text-sm text-gray-400 mb-2 text-center">
            Last Index of Each Letter
          </div>
          <div className="flex flex-wrap justify-center gap-2 font-mono text-sm">
            {Object.entries(LAST_INDEX)
              .sort((a, b) => a[1] - b[1])
              .map(([char, idx]) => (
                <div
                  key={char}
                  className={`px-2 py-1 rounded border ${
                    currentStepData?.char === char
                      ? "bg-yellow-500/20 border-yellow-500 text-yellow-300"
                      : "bg-gray-800 border-gray-700 text-gray-400"
                  }`}
                >
                  <span className="text-white">{char}</span>
                  <span className="text-gray-500">:</span>
                  <span className="text-cyan-400">{idx}</span>
                </div>
              ))}
          </div>
        </div>

        {/* String Visualization */}
        <div className="mb-6 overflow-x-auto">
          <div className="text-sm text-gray-400 mb-2 text-center">
            String: &quot;{INPUT_STRING}&quot; ({INPUT_STRING.length} chars)
          </div>

          {/* Index numbers */}
          <div className="flex justify-center gap-0.5 mb-1 font-mono text-xs text-gray-500">
            {INPUT_STRING.split("").map((_, idx) => (
              <div key={idx} className="w-6 text-center">
                {idx}
              </div>
            ))}
          </div>

          {/* Characters */}
          <div className="flex justify-center gap-0.5">
            {INPUT_STRING.split("").map((char, idx) => {
              const status = getCharStatus(idx);
              const partitionIdx = getPartitionIndex(idx);
              const isBoundary = partitionBoundaries.includes(idx);

              return (
                <motion.div
                  key={idx}
                  animate={{
                    scale: status === "current" ? 1.1 : 1,
                  }}
                  className={`relative w-6 h-8 flex items-center justify-center rounded border-2 font-mono text-sm font-bold transition-all ${getCharStyle(status)} ${
                    partitionIdx >= 0 ? getPartitionColor(partitionIdx) : ""
                  }`}
                >
                  {char}
                  {isBoundary && (
                    <div className="absolute -right-0.5 top-0 bottom-0 w-0.5 bg-white/70 rounded"></div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Current range indicator */}
          {currentStepData && currentStepData.type !== "done" && (
            <div className="flex justify-center gap-0.5 mt-2 font-mono text-xs">
              {INPUT_STRING.split("").map((_, idx) => (
                <div key={idx} className="w-6 text-center">
                  {idx === state.start && (
                    <span className="text-blue-400">S</span>
                  )}
                  {idx === state.end && idx !== state.start && (
                    <span className="text-cyan-400">E</span>
                  )}
                  {idx === state.index &&
                    idx !== state.start &&
                    idx !== state.end && (
                      <span className="text-yellow-400">i</span>
                    )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Current State */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">start</div>
            <div className="text-2xl font-mono font-bold text-blue-400">
              {state.start}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">end (must reach)</div>
            <div className="text-2xl font-mono font-bold text-cyan-400">
              {state.end}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">current i</div>
            <div className="text-2xl font-mono font-bold text-yellow-400">
              {state.index >= 0 ? state.index : "-"}
            </div>
          </div>
        </div>

        {/* Partitions Found */}
        {state.partitions.length > 0 && (
          <div className="mb-4 p-3 bg-gray-800/30 rounded-lg">
            <div className="text-sm text-gray-400 mb-2 text-center">
              Partitions Found: {state.partitions.length}
            </div>
            <div className="flex justify-center gap-2">
              <AnimatePresence>
                {state.partitions.map((size, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`px-4 py-2 rounded-lg border-2 ${getPartitionColor(idx)}`}
                  >
                    <span className="text-white font-bold">{size}</span>
                    <span className="text-gray-400 text-sm ml-1">chars</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Step Explanation */}
        <AnimatePresence mode="wait">
          {currentStepData && (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4 rounded-lg mb-4 ${
                currentStepData.type === "cut"
                  ? "bg-green-500/10 border border-green-500/30"
                  : currentStepData.type === "extend"
                    ? "bg-blue-500/10 border border-blue-500/30"
                    : currentStepData.type === "done"
                      ? "bg-teal-500/10 border border-teal-500/30"
                      : "bg-gray-800/50"
              }`}
            >
              <div className="text-sm">
                <span
                  className={
                    currentStepData.type === "cut"
                      ? "text-green-400"
                      : currentStepData.type === "extend"
                        ? "text-blue-400"
                        : currentStepData.type === "done"
                          ? "text-teal-400"
                          : "text-gray-300"
                  }
                >
                  {currentStepData.message}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Final Result */}
        {isDone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-lg text-center bg-teal-500/10 border border-teal-500/30"
          >
            <div className="text-teal-400 font-bold text-lg">
              Result: [{state.partitions.join(", ")}]
            </div>
            <div className="text-gray-400 text-sm mt-2">
              {state.partitions.length} partitions, each letter appears in only
              one partition!
            </div>
          </motion.div>
        )}

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-gray-800">
          <div className="flex flex-wrap gap-4 text-xs text-gray-500 justify-center">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>Current (i)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500/30 border border-blue-500 rounded"></div>
              <span>In range</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500/20 border border-green-500/50 rounded"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-blue-400 font-bold">S</span>
              <span>=start</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-cyan-400 font-bold">E</span>
              <span>=end</span>
            </div>
          </div>
        </div>

        {/* Algorithm Summary */}
        <div className="mt-4 p-3 bg-gray-800/30 rounded-lg text-sm text-gray-400">
          <p>
            <strong className="text-teal-400">Algorithm:</strong> For each
            character, extend <code className="text-cyan-400">end</code> to its
            last occurrence. When{" "}
            <code className="text-cyan-400">i == end</code>, all characters in{" "}
            <code className="text-cyan-400">[start..end]</code> have their last
            occurrence within this range, so we can cut!
          </p>
        </div>
      </div>
    </div>
  );
}
