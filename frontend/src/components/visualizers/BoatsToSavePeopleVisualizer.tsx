"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Example inputs
const EXAMPLES = [
  {
    people: [3, 2, 2, 1],
    limit: 3,
    expected: 3,
    description: "Classic example",
  },
  { people: [1, 2, 3, 4], limit: 5, expected: 2, description: "All can pair" },
  { people: [3, 5, 3, 4], limit: 5, expected: 4, description: "No one pairs" },
  {
    people: [1, 1, 1, 1],
    limit: 2,
    expected: 2,
    description: "Everyone pairs",
  },
];

interface Boat {
  people: number[];
  total: number;
}

interface StepInfo {
  type: "init" | "sort" | "check" | "pair" | "solo" | "done";
  left: number;
  right: number;
  sortedPeople: number[];
  boats: Boat[];
  message: string;
  canPair?: boolean;
  currentSum?: number;
}

// Compute all steps for the algorithm
const computeSteps = (people: number[], limit: number): StepInfo[] => {
  const steps: StepInfo[] = [];
  const original = [...people];
  const sorted = [...people].sort((a, b) => a - b);

  // Initial state
  steps.push({
    type: "init",
    left: 0,
    right: people.length - 1,
    sortedPeople: original,
    boats: [],
    message: `Start with ${people.length} people: [${original.join(", ")}]. Limit per boat: ${limit}`,
  });

  // After sorting
  steps.push({
    type: "sort",
    left: 0,
    right: sorted.length - 1,
    sortedPeople: sorted,
    boats: [],
    message: `Sort by weight: [${sorted.join(", ")}]. Set pointers: left=0 (lightest: ${sorted[0]}), right=${sorted.length - 1} (heaviest: ${sorted[sorted.length - 1]})`,
  });

  let left = 0;
  let right = sorted.length - 1;
  const boats: Boat[] = [];
  const handled = new Set<number>();

  while (left <= right) {
    const lightWeight = sorted[left];
    const heavyWeight = sorted[right];
    const sum = lightWeight + heavyWeight;
    const canPair = left !== right && sum <= limit;

    // Show the check step
    if (left === right) {
      steps.push({
        type: "check",
        left,
        right,
        sortedPeople: sorted,
        boats: [...boats],
        message: `Only one person left (weight ${sorted[left]}). They need their own boat.`,
        canPair: false,
        currentSum: sorted[left],
      });
    } else {
      steps.push({
        type: "check",
        left,
        right,
        sortedPeople: sorted,
        boats: [...boats],
        message: `Can lightest (${lightWeight}) + heaviest (${heavyWeight}) = ${sum} fit in boat (limit ${limit})? ${sum <= limit ? "YES!" : "NO!"}`,
        canPair,
        currentSum: sum,
      });
    }

    // Process the result
    if (left === right) {
      // Single person left
      boats.push({ people: [sorted[left]], total: sorted[left] });
      handled.add(left);

      steps.push({
        type: "solo",
        left: left + 1,
        right: right - 1,
        sortedPeople: sorted,
        boats: [...boats],
        message: `Boat ${boats.length}: Person with weight ${sorted[left]} goes alone.`,
      });
      break;
    } else if (canPair) {
      // Both can go together
      boats.push({ people: [lightWeight, heavyWeight], total: sum });
      handled.add(left);
      handled.add(right);

      const newLeft = left + 1;
      const newRight = right - 1;

      steps.push({
        type: "pair",
        left: newLeft,
        right: newRight,
        sortedPeople: sorted,
        boats: [...boats],
        message: `Boat ${boats.length}: Weights ${lightWeight} + ${heavyWeight} = ${sum} <= ${limit}. Both board! Move both pointers.`,
      });

      left = newLeft;
      right = newRight;
    } else {
      // Only heaviest goes
      boats.push({ people: [heavyWeight], total: heavyWeight });
      handled.add(right);

      const newRight = right - 1;

      steps.push({
        type: "solo",
        left,
        right: newRight,
        sortedPeople: sorted,
        boats: [...boats],
        message: `Boat ${boats.length}: Weight ${heavyWeight} goes alone (${sum} > ${limit}). Move right pointer only.`,
      });

      right = newRight;
    }
  }

  // Final step
  steps.push({
    type: "done",
    left,
    right,
    sortedPeople: sorted,
    boats: [...boats],
    message: `Done! All ${sorted.length} people rescued using ${boats.length} boats.`,
  });

  return steps;
};

// skipcq: JS-0067 — React component with hooks requires function declaration
export default function BoatsToSavePeopleVisualizer() {
  const [selectedExample, setSelectedExample] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [currentStep, setCurrentStep] = useState(0);

  const { people, limit } = EXAMPLES[selectedExample];
  const steps = useMemo(() => computeSteps(people, limit), [people, limit]);

  const handleExampleChange = (idx: number) => {
    setSelectedExample(idx);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const isDone = currentStep >= steps.length;
  const currentStepData = currentStep > 0 ? steps[currentStep - 1] : null;

  const performStep = useCallback(() => {
    if (currentStep < steps.length) {
      setCurrentStep((s) => s + 1);
    } else {
      setIsPlaying(false);
    }
  }, [currentStep, steps.length]);

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

  // Get current display state
  const displayState = currentStepData || {
    left: 0,
    right: people.length - 1,
    sortedPeople: people,
    boats: [],
    type: "init" as const,
  };

  // Check if a person index is handled (in a boat)
  // Since we process from ends, we can check if idx is outside [left, right]
  const isHandled = (idx: number): boolean => {
    if (displayState.type === "init") return false;
    if (displayState.type === "sort") return false;
    return idx < displayState.left || idx > displayState.right;
  };

  // Get person style based on state
  const getPersonStyle = (idx: number) => {
    const isLeft =
      idx === displayState.left &&
      displayState.type !== "init" &&
      displayState.type !== "done";
    const isRight =
      idx === displayState.right &&
      displayState.type !== "init" &&
      displayState.type !== "done";
    const handled = isHandled(idx);

    if (handled) {
      return "bg-gray-700 border-gray-600 opacity-50";
    }
    if (isLeft && isRight) {
      return "bg-purple-500 border-purple-400 ring-2 ring-purple-400/50";
    }
    if (isLeft) {
      return "bg-green-500 border-green-400 ring-2 ring-green-400/50";
    }
    if (isRight) {
      return "bg-blue-500 border-blue-400 ring-2 ring-blue-400/50";
    }
    return "bg-gray-800 border-gray-700";
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="p-4 border-b border-gray-800 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
        <h3 className="text-lg font-semibold text-white">
          Boats to Save People
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Pair heaviest with lightest to minimize boats
        </p>
      </div>

      <div className="p-4">
        {/* Example Selector */}
        <div className="mb-6">
          <div className="text-sm text-gray-400 mb-2">Choose Example:</div>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex, idx) => (
              <button
                key={idx}
                onClick={() => handleExampleChange(idx)}
                className={`px-3 py-2 rounded-lg text-sm transition ${
                  selectedExample === idx
                    ? "bg-cyan-500 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                [{ex.people.join(",")}] limit={ex.limit}
                <span className="ml-2 text-xs text-gray-500">
                  → {ex.expected} boats
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={isDone}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              isPlaying ? "bg-yellow-500 text-black" : "bg-cyan-500 text-white"
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
              className="w-20 accent-cyan-500"
            />
          </div>
        </div>

        {/* People Array Visualization */}
        <div className="mb-6 p-4 bg-gray-800/30 rounded-lg">
          <div className="text-sm text-gray-400 mb-3 text-center">
            People (sorted by weight) | Limit: {limit}
          </div>
          <div className="flex justify-center gap-2 mb-2">
            {displayState.sortedPeople.map((weight, idx) => (
              <motion.div
                key={idx}
                layout
                className={`relative w-14 h-14 rounded-lg border-2 flex flex-col items-center justify-center font-mono transition-all ${getPersonStyle(idx)}`}
              >
                <span className="text-lg font-bold text-white">{weight}</span>
                <span className="text-xs text-gray-400">#{idx}</span>

                {/* Pointer labels */}
                {idx === displayState.left &&
                  displayState.type !== "init" &&
                  displayState.type !== "done" &&
                  !isHandled(idx) && (
                    <span className="absolute -bottom-6 text-xs font-bold text-green-400">
                      L
                    </span>
                  )}
                {idx === displayState.right &&
                  idx !== displayState.left &&
                  displayState.type !== "init" &&
                  displayState.type !== "done" &&
                  !isHandled(idx) && (
                    <span className="absolute -bottom-6 text-xs font-bold text-blue-400">
                      R
                    </span>
                  )}
                {idx === displayState.left &&
                  idx === displayState.right &&
                  displayState.type !== "init" &&
                  displayState.type !== "done" &&
                  !isHandled(idx) && (
                    <span className="absolute -bottom-6 text-xs font-bold text-purple-400">
                      L=R
                    </span>
                  )}
              </motion.div>
            ))}
          </div>
          <div className="h-6"></div> {/* Space for pointer labels */}
        </div>

        {/* Current Check Info */}
        {currentStepData && currentStepData.type === "check" && (
          <div
            className={`mb-4 p-3 rounded-lg ${currentStepData.canPair ? "bg-green-500/10 border border-green-500/30" : "bg-red-500/10 border border-red-500/30"}`}
          >
            <div className="text-center font-mono">
              {currentStepData.left !== currentStepData.right ? (
                <>
                  <span className="text-green-400">
                    {displayState.sortedPeople[currentStepData.left]}
                  </span>
                  <span className="text-gray-400"> + </span>
                  <span className="text-blue-400">
                    {displayState.sortedPeople[currentStepData.right]}
                  </span>
                  <span className="text-gray-400"> = </span>
                  <span
                    className={
                      currentStepData.canPair
                        ? "text-green-400"
                        : "text-red-400"
                    }
                  >
                    {currentStepData.currentSum}
                  </span>
                  <span className="text-gray-400">
                    {" "}
                    {currentStepData.canPair ? "≤" : ">"} {limit}
                  </span>
                  <span
                    className={`ml-2 font-bold ${currentStepData.canPair ? "text-green-400" : "text-red-400"}`}
                  >
                    {currentStepData.canPair ? "✓ CAN PAIR" : "✗ TOO HEAVY"}
                  </span>
                </>
              ) : (
                <span className="text-purple-400">
                  Single person left:{" "}
                  {displayState.sortedPeople[currentStepData.left]}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Boats Visualization */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">
            Boats Used: {displayState.boats.length}
          </div>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {displayState.boats.map((boat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-cyan-500/20 border border-cyan-500/50 rounded-lg px-3 py-2 flex items-center gap-2"
                >
                  <span className="text-cyan-400 text-sm">⛵ {idx + 1}:</span>
                  <span className="font-mono text-white">
                    {boat.people.join(" + ")} = {boat.total}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
            {displayState.boats.length === 0 && (
              <span className="text-gray-500 text-sm">No boats used yet</span>
            )}
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
                currentStepData.type === "done"
                  ? "bg-cyan-500/10 border border-cyan-500/30"
                  : currentStepData.type === "pair"
                    ? "bg-green-500/10 border border-green-500/30"
                    : currentStepData.type === "solo"
                      ? "bg-yellow-500/10 border border-yellow-500/30"
                      : "bg-gray-800/50"
              }`}
            >
              <div className="text-sm">
                <span
                  className={
                    currentStepData.type === "done"
                      ? "text-cyan-400"
                      : currentStepData.type === "pair"
                        ? "text-green-400"
                        : currentStepData.type === "solo"
                          ? "text-yellow-400"
                          : "text-gray-300"
                  }
                >
                  {currentStepData.message}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-gray-800">
          <div className="flex flex-wrap gap-4 text-xs text-gray-500 justify-center">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 border border-green-400 rounded"></div>
              <span>Left (Lightest)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 border border-blue-400 rounded"></div>
              <span>Right (Heaviest)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-purple-500 border border-purple-400 rounded"></div>
              <span>L=R (Last person)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-700 border border-gray-600 rounded opacity-50"></div>
              <span>In a boat</span>
            </div>
          </div>
        </div>

        {/* Algorithm Summary */}
        <div className="mt-4 p-3 bg-gray-800/30 rounded-lg text-sm text-gray-400">
          <p>
            <strong className="text-cyan-400">Strategy:</strong> Always try to
            pair the heaviest with the lightest. If they fit, both go. If not,
            the heaviest goes alone (no one else could pair with them either).
          </p>
        </div>
      </div>
    </div>
  );
}
