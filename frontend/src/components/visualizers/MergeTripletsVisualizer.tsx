"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Example data from LeetCode
const TRIPLETS = [
  [2, 5, 3],
  [1, 8, 4],
  [1, 7, 5],
  [2, 3, 3],
  [7, 3, 3],
];
const TARGET = [7, 5, 3];

interface StepInfo {
  type: "init" | "check" | "skip" | "usable" | "done";
  tripletIndex: number;
  triplet?: number[];
  reason?: string;
  found: boolean[];
  exceedsAt?: number; // which position exceeds target
  matchesAt?: number[]; // which positions match target
}

// Pre-compute all steps
const computeSteps = (): StepInfo[] => {
  const steps: StepInfo[] = [];
  const found = [false, false, false];

  // Initial state
  steps.push({
    type: "init",
    tripletIndex: -1,
    found: [...found],
    reason: `Target: [${TARGET.join(", ")}]. Check each triplet.`,
  });

  for (let i = 0; i < TRIPLETS.length; i++) {
    const t = TRIPLETS[i];

    // Check step
    steps.push({
      type: "check",
      tripletIndex: i,
      triplet: t,
      found: [...found],
      reason: `Checking triplet ${i}: [${t.join(", ")}]`,
    });

    // Check if any value exceeds target
    let exceeds = -1;
    for (let j = 0; j < 3; j++) {
      if (t[j] > TARGET[j]) {
        exceeds = j;
        break;
      }
    }

    if (exceeds !== -1) {
      steps.push({
        type: "skip",
        tripletIndex: i,
        triplet: t,
        found: [...found],
        exceedsAt: exceeds,
        reason: `SKIP! Position ${exceeds}: ${t[exceeds]} > ${TARGET[exceeds]} (would overshoot)`,
      });
    } else {
      // Find which positions match target
      const matches: number[] = [];
      for (let j = 0; j < 3; j++) {
        if (t[j] === TARGET[j]) {
          found[j] = true;
          matches.push(j);
        }
      }

      steps.push({
        type: "usable",
        tripletIndex: i,
        triplet: t,
        found: [...found],
        matchesAt: matches,
        reason:
          matches.length > 0
            ? `USABLE! Contributes target position${matches.length > 1 ? "s" : ""}: ${matches.join(", ")}`
            : `USABLE! But doesn't match any target value exactly.`,
      });
    }
  }

  // Final step
  const allFound = found[0] && found[1] && found[2];
  steps.push({
    type: "done",
    tripletIndex: -1,
    found: [...found],
    reason: allFound
      ? "All target components found! Return true."
      : `Missing component(s): ${found
          .map((f, i) => (!f ? i : null))
          .filter((x) => x !== null)
          .join(", ")}. Return false.`,
  });

  return steps;
};

const STEPS = computeSteps();

// skipcq: JS-0067 — React component with hooks requires function declaration
export default function MergeTripletsVisualizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
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

  // Get current found state
  const getCurrentFound = (): boolean[] => {
    if (currentStep === 0) return [false, false, false];
    return currentStepData?.found || [false, false, false];
  };

  const found = getCurrentFound();

  // Get triplet status for coloring
  const getTripletStatus = (idx: number) => {
    if (!currentStepData) return "pending";
    if (idx > currentStepData.tripletIndex) return "pending";

    // Look through steps to find this triplet's status
    for (let i = currentStep - 1; i >= 0; i--) {
      const step = STEPS[i];
      if (step.tripletIndex === idx) {
        if (step.type === "skip") return "skipped";
        if (step.type === "usable") return "usable";
        if (step.type === "check") return "checking";
      }
    }
    return "pending";
  };

  const getTripletStyle = (status: string) => {
    switch (status) {
      case "checking":
        return "bg-yellow-500/20 border-yellow-500 ring-2 ring-yellow-500/50";
      case "skipped":
        return "bg-red-500/10 border-red-500/50 opacity-50";
      case "usable":
        return "bg-green-500/10 border-green-500/50";
      default:
        return "bg-gray-800 border-gray-700";
    }
  };

  const getCellStyle = (tripletIdx: number, cellIdx: number, value: number) => {
    const status = getTripletStatus(tripletIdx);

    // If currently checking this triplet
    if (
      currentStepData?.tripletIndex === tripletIdx &&
      currentStepData.type === "check"
    ) {
      return "bg-yellow-500/30 text-yellow-300";
    }

    // If this triplet was skipped and this cell exceeds
    if (
      status === "skipped" &&
      currentStepData?.tripletIndex === tripletIdx &&
      currentStepData.exceedsAt === cellIdx
    ) {
      return "bg-red-500 text-white font-bold";
    }

    // Check historical skip
    for (let i = 0; i < currentStep; i++) {
      const step = STEPS[i];
      if (
        step.tripletIndex === tripletIdx &&
        step.type === "skip" &&
        step.exceedsAt === cellIdx
      ) {
        return "bg-red-500/50 text-red-300";
      }
    }

    // If this triplet is usable and this cell matches target
    if (status === "usable" && value === TARGET[cellIdx]) {
      return "bg-green-500 text-white font-bold";
    }

    // If exceeds target (even if not the first one to cause skip)
    if (value > TARGET[cellIdx]) {
      return "bg-red-500/20 text-red-400";
    }

    return "text-gray-300";
  };

  const getFinalResult = () => {
    const lastStep = STEPS[STEPS.length - 1];
    return lastStep.found[0] && lastStep.found[1] && lastStep.found[2];
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="p-4 border-b border-gray-800 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
        <h3 className="text-lg font-semibold text-white">
          Merge Triplets to Form Target
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Filter bad triplets, collect target components
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
              max="1500"
              step="100"
              value={1700 - speed}
              onChange={(e) => setSpeed(1700 - Number(e.target.value))}
              className="w-20 accent-purple-500"
            />
          </div>
        </div>

        {/* Target Display */}
        <div className="mb-6 p-4 bg-gray-800/50 rounded-lg">
          <div className="text-sm text-gray-400 mb-3 text-center">
            Target Triplet
          </div>
          <div className="flex justify-center gap-2">
            {TARGET.map((val, idx) => (
              <motion.div
                key={idx}
                animate={{
                  scale: found[idx] ? 1.1 : 1,
                  backgroundColor: found[idx] ? "#22c55e" : "#1f2937",
                }}
                className={`w-16 h-16 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
                  found[idx]
                    ? "border-green-500 bg-green-500"
                    : "border-gray-600 bg-gray-800"
                }`}
              >
                <div
                  className={`text-xs mb-1 ${found[idx] ? "text-white/80" : "text-gray-400"}`}
                >
                  pos {idx}
                </div>
                <div
                  className={`text-xl font-bold ${found[idx] ? "text-white" : "text-gray-300"}`}
                >
                  {val}
                </div>
                {found[idx] && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-xs text-white"
                  >
                    ✓
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-2 text-sm">
            <span className="text-gray-500">Found: </span>
            <span
              className={
                found.every((f) => f) ? "text-green-400" : "text-gray-400"
              }
            >
              [{found.map((f) => (f ? "✓" : "?")).join(", ")}]
            </span>
          </div>
        </div>

        {/* Triplets Grid */}
        <div className="mb-6">
          <div className="text-sm text-gray-400 mb-3 text-center">
            Triplets ({TRIPLETS.length} total)
          </div>
          <div className="space-y-2">
            {TRIPLETS.map((triplet, idx) => {
              const status = getTripletStatus(idx);
              return (
                <motion.div
                  key={idx}
                  animate={{
                    scale:
                      currentStepData?.tripletIndex === idx &&
                      currentStepData?.type === "check"
                        ? 1.02
                        : 1,
                  }}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${getTripletStyle(status)}`}
                >
                  <div className="text-sm text-gray-500 w-8">#{idx}</div>
                  <div className="flex gap-2">
                    {triplet.map((val, cellIdx) => (
                      <div
                        key={cellIdx}
                        className={`w-12 h-12 rounded flex items-center justify-center text-lg font-mono border border-gray-700 ${getCellStyle(idx, cellIdx, val)}`}
                      >
                        {val}
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 text-sm ml-2">
                    {status === "checking" && (
                      <span className="text-yellow-400">Checking...</span>
                    )}
                    {status === "skipped" && (
                      <span className="text-red-400">
                        ✗ Skipped (exceeds target)
                      </span>
                    )}
                    {status === "usable" && (
                      <span className="text-green-400">✓ Usable</span>
                    )}
                  </div>
                  {/* Show comparison with target */}
                  <div className="flex gap-1 text-xs">
                    {triplet.map((val, cellIdx) => (
                      <div
                        key={cellIdx}
                        className={`px-1 rounded ${
                          val > TARGET[cellIdx]
                            ? "bg-red-500/30 text-red-400"
                            : val === TARGET[cellIdx]
                              ? "bg-green-500/30 text-green-400"
                              : "bg-gray-700 text-gray-400"
                        }`}
                      >
                        {val > TARGET[cellIdx]
                          ? ">"
                          : val === TARGET[cellIdx]
                            ? "="
                            : "<"}
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Step Explanation */}
        <AnimatePresence mode="wait">
          {currentStepData && (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4 rounded-lg mb-4 ${
                currentStepData.type === "skip"
                  ? "bg-red-500/10 border border-red-500/30"
                  : currentStepData.type === "usable"
                    ? "bg-green-500/10 border border-green-500/30"
                    : currentStepData.type === "done"
                      ? getFinalResult()
                        ? "bg-green-500/10 border border-green-500/30"
                        : "bg-red-500/10 border border-red-500/30"
                      : "bg-gray-800/50"
              }`}
            >
              <div className="text-sm">
                <span
                  className={
                    currentStepData.type === "skip"
                      ? "text-red-400"
                      : currentStepData.type === "usable" ||
                          (currentStepData.type === "done" && getFinalResult())
                        ? "text-green-400"
                        : currentStepData.type === "done"
                          ? "text-red-400"
                          : "text-gray-300"
                  }
                >
                  {currentStepData.reason}
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
            className={`p-4 rounded-lg text-center ${
              getFinalResult()
                ? "bg-green-500/10 border border-green-500/30"
                : "bg-red-500/10 border border-red-500/30"
            }`}
          >
            {getFinalResult() ? (
              <>
                <div className="text-green-400 font-bold text-lg">
                  ✓ Result: TRUE
                </div>
                <div className="text-gray-400 text-sm mt-2">
                  All target components can be collected from usable triplets!
                </div>
              </>
            ) : (
              <>
                <div className="text-red-400 font-bold text-lg">
                  ✗ Result: FALSE
                </div>
                <div className="text-gray-400 text-sm mt-2">
                  Cannot collect all target components.
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-gray-800">
          <div className="flex flex-wrap gap-4 text-xs text-gray-500 justify-center">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500/30 border border-yellow-500 rounded"></div>
              <span>Checking</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500/30 border border-green-500 rounded"></div>
              <span>Usable</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500/30 border border-red-500/50 rounded"></div>
              <span>Skipped</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Matches target</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Exceeds target</span>
            </div>
          </div>
        </div>

        {/* Algorithm Summary */}
        <div className="mt-4 p-3 bg-gray-800/30 rounded-lg text-sm text-gray-400">
          <p>
            <strong className="text-purple-400">Algorithm:</strong> For each
            triplet, if ANY value exceeds target, skip it (would overshoot).
            Otherwise, collect any values that match target exactly. Return true
            if all 3 target positions are collected.
          </p>
        </div>
      </div>
    </div>
  );
}
