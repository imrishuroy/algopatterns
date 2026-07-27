"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Person represented as [height, k]
type Person = [number, number];

// Example inputs
const EXAMPLES: { people: Person[]; description: string }[] = [
  {
    people: [[7, 0], [4, 4], [7, 1], [5, 0], [6, 1], [5, 2]],
    description: "Classic example",
  },
  {
    people: [[6, 0], [5, 0], [4, 0], [3, 2], [2, 2], [1, 4]],
    description: "Various heights",
  },
  {
    people: [[2, 0], [3, 0], [4, 0], [5, 0]],
    description: "All k=0",
  },
  {
    people: [[3, 0], [3, 1], [3, 2]],
    description: "Same height",
  },
];

interface StepInfo {
  type: "init" | "sort" | "insert" | "done";
  currentPerson: Person | null;
  insertIndex: number;
  queue: Person[];
  sortedPeople: Person[];
  processedCount: number;
  message: string;
}

// Compute all steps for the algorithm
const computeSteps = (people: Person[]): StepInfo[] => {
  const steps: StepInfo[] = [];
  const original = [...people];

  // Sort: height DESC, then k ASC
  const sorted = [...people].sort((a, b) => {
    if (a[0] !== b[0]) return b[0] - a[0];
    return a[1] - b[1];
  });

  // Initial state
  steps.push({
    type: "init",
    currentPerson: null,
    insertIndex: -1,
    queue: [],
    sortedPeople: original,
    processedCount: 0,
    message: `Start with ${people.length} people. Each person [h, k] means: height h, with k taller-or-equal people in front.`,
  });

  // After sorting
  steps.push({
    type: "sort",
    currentPerson: null,
    insertIndex: -1,
    queue: [],
    sortedPeople: sorted,
    processedCount: 0,
    message: `Sort by height DESC, then k ASC. Tallest people first: [${sorted.map((p) => `[${p[0]},${p[1]}]`).join(", ")}]`,
  });

  // Insert each person
  const queue: Person[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const person = sorted[i];
    const insertIndex = person[1];

    // Insert at index k
    queue.splice(insertIndex, 0, person);

    const explanation =
      queue.length === 1
        ? `First person [${person[0]},${person[1]}] goes at index ${insertIndex}.`
        : `Insert [${person[0]},${person[1]}] at index ${insertIndex}. Everyone in queue is >= ${person[0]}, so k=${person[1]} means ${insertIndex} people in front.`;

    steps.push({
      type: "insert",
      currentPerson: person,
      insertIndex,
      queue: [...queue],
      sortedPeople: sorted,
      processedCount: i + 1,
      message: explanation,
    });
  }

  // Final step
  steps.push({
    type: "done",
    currentPerson: null,
    insertIndex: -1,
    queue: [...queue],
    sortedPeople: sorted,
    processedCount: sorted.length,
    message: `Done! Queue reconstructed: [${queue.map((p) => `[${p[0]},${p[1]}]`).join(", ")}]`,
  });

  return steps;
};

// Get height color
const getHeightColor = (height: number, maxHeight: number): string => {
  const intensity = height / maxHeight;
  if (intensity > 0.8) return "bg-red-500 border-red-400";
  if (intensity > 0.6) return "bg-orange-500 border-orange-400";
  if (intensity > 0.4) return "bg-yellow-500 border-yellow-400";
  if (intensity > 0.2) return "bg-green-500 border-green-400";
  return "bg-blue-500 border-blue-400";
};

// skipcq: JS-0067 — React component with hooks requires function declaration
export default function QueueReconstructionVisualizer() {
  const [selectedExample, setSelectedExample] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [currentStep, setCurrentStep] = useState(0);

  const people = EXAMPLES[selectedExample].people;
  const steps = useMemo(() => computeSteps(people), [people]);
  const maxHeight = Math.max(...people.map((p) => p[0]));

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

  // Get display state
  const displayState = currentStepData || {
    queue: [],
    sortedPeople: people,
    currentPerson: null,
    insertIndex: -1,
    processedCount: 0,
    type: "init" as const,
  };

  // Render a person card
  const renderPerson = (
    person: Person,
    isCurrentlyInserting = false
  ) => {
    const heightPercent = (person[0] / maxHeight) * 100;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: 1,
          scale: isCurrentlyInserting ? 1.1 : 1,
        }}
        className={`relative flex flex-col items-center ${isCurrentlyInserting ? "z-10" : ""}`}
      >
        {/* Height bar */}
        <div
          className={`w-12 rounded-t border-2 ${getHeightColor(person[0], maxHeight)} ${isCurrentlyInserting ? "ring-2 ring-white ring-offset-2 ring-offset-gray-900" : ""}`}
          style={{ height: `${Math.max(heightPercent * 0.8, 20)}px` }}
        />
        {/* Person info */}
        <div
          className={`w-12 bg-gray-800 border-2 border-t-0 ${isCurrentlyInserting ? "border-white" : "border-gray-700"} rounded-b px-1 py-1 text-center`}
        >
          <div className="text-xs font-mono text-white">h={person[0]}</div>
          <div className="text-xs font-mono text-gray-400">k={person[1]}</div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="p-4 border-b border-gray-800 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
        <h3 className="text-lg font-semibold text-white">
          Queue Reconstruction by Height
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Sort tallest first, insert at index k
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
                    ? "bg-purple-500 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                {ex.description}
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
              isPlaying
                ? "bg-yellow-500 text-black"
                : "bg-purple-500 text-white"
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

        {/* Sorted People (to process) */}
        <div className="mb-6 p-4 bg-gray-800/30 rounded-lg">
          <div className="text-sm text-gray-400 mb-3">
            People to Process (sorted: tallest first, then by k)
          </div>
          <div className="flex gap-2 flex-wrap min-h-[80px] items-end">
            {displayState.sortedPeople.map((person, idx) => {
              const isProcessed = idx < displayState.processedCount;
              const isCurrentlyProcessing =
                displayState.type === "insert" &&
                idx === displayState.processedCount - 1;

              return (
                <div
                  key={`sorted-${idx}`}
                  className={`transition-opacity ${isProcessed ? "opacity-30" : "opacity-100"}`}
                >
                  {renderPerson(person, isCurrentlyProcessing)}
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Queue */}
        <div className="mb-6 p-4 bg-gray-800/30 rounded-lg">
          <div className="text-sm text-gray-400 mb-4 flex justify-between">
            <span>Reconstructed Queue</span>
            <span className="text-purple-400">
              {displayState.queue.length} / {people.length} placed
            </span>
          </div>
          
          {displayState.queue.length === 0 ? (
            <div className="min-h-[120px] flex items-center">
              <span className="text-gray-500 text-sm">Queue is empty</span>
            </div>
          ) : (
            <>
              {/* Index labels row - fixed height */}
              <div className="flex gap-2 mb-1 h-5">
                <AnimatePresence>
                  {displayState.queue.map((person, idx) => {
                    const isJustInserted =
                      displayState.type === "insert" &&
                      displayState.currentPerson !== null &&
                      person[0] === displayState.currentPerson[0] &&
                      person[1] === displayState.currentPerson[1] &&
                      idx === displayState.insertIndex;

                    return (
                      <motion.div
                        key={`label-${idx}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`w-12 text-center text-xs ${isJustInserted ? "text-green-400 font-bold" : "text-gray-500"}`}
                      >
                        {isJustInserted ? `↓${idx}` : idx}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
              
              {/* People row - aligned to bottom */}
              <div className="flex gap-2 items-end min-h-[100px]">
                <AnimatePresence>
                  {displayState.queue.map((person, idx) => {
                    const isJustInserted =
                      displayState.type === "insert" &&
                      displayState.currentPerson !== null &&
                      person[0] === displayState.currentPerson[0] &&
                      person[1] === displayState.currentPerson[1] &&
                      idx === displayState.insertIndex;

                    return (
                      <div key={`queue-${idx}`}>
                            {renderPerson(person, Boolean(isJustInserted))}
                      </div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>

        {/* Current Operation */}
        {displayState.type === "insert" && displayState.currentPerson && (
          <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="text-purple-400 font-bold">
                  Inserting [{displayState.currentPerson[0]},{displayState.currentPerson[1]}]
                </span>
                <span className="text-gray-400"> at index </span>
                <span className="text-green-400 font-bold">
                  {displayState.insertIndex}
                </span>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              k = {displayState.currentPerson[1]} means {displayState.currentPerson[1]} people
              with height ≥ {displayState.currentPerson[0]} should be in front
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
                currentStepData.type === "done"
                  ? "bg-green-500/10 border border-green-500/30"
                  : currentStepData.type === "insert"
                    ? "bg-purple-500/10 border border-purple-500/30"
                    : "bg-gray-800/50"
              }`}
            >
              <div className="text-sm">
                <span
                  className={
                    currentStepData.type === "done"
                      ? "text-green-400"
                      : currentStepData.type === "insert"
                        ? "text-purple-400"
                        : "text-gray-300"
                  }
                >
                  {currentStepData.message}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Verification (when done) */}
        {displayState.type === "done" && (
          <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
            <div className="text-sm text-gray-400 mb-2">Verification:</div>
            <div className="space-y-1 text-xs font-mono">
              {displayState.queue.map((person, idx) => {
                const peopleInFront = displayState.queue.slice(0, idx);
                const tallerOrEqualCount = peopleInFront.filter(
                  (p) => p[0] >= person[0]
                ).length;
                const isCorrect = tallerOrEqualCount === person[1];

                return (
                  <div key={idx} className="flex gap-2">
                    <span className="text-gray-500">pos {idx}:</span>
                    <span className="text-white">
                      [{person[0]},{person[1]}]
                    </span>
                    <span className="text-gray-500">
                      sees {tallerOrEqualCount} people ≥ {person[0]}
                    </span>
                    <span className={isCorrect ? "text-green-400" : "text-red-400"}>
                      {isCorrect ? "✓" : "✗"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-gray-800">
          <div className="flex flex-wrap gap-4 text-xs text-gray-500 justify-center">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 border border-red-400 rounded"></div>
              <span>Tallest</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-500 border border-orange-400 rounded"></div>
              <span>Tall</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 border border-yellow-400 rounded"></div>
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 border border-green-400 rounded"></div>
              <span>Short</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 border border-blue-400 rounded"></div>
              <span>Shortest</span>
            </div>
          </div>
        </div>

        {/* Algorithm Summary */}
        <div className="mt-4 p-3 bg-gray-800/30 rounded-lg text-sm text-gray-400">
          <p>
            <strong className="text-purple-400">Key Insight:</strong> Tall people
            don&apos;t &quot;see&quot; shorter people. Process tallest first, then
            insert at index k. Shorter people inserted later don&apos;t affect
            taller people&apos;s k values.
          </p>
        </div>
      </div>
    </div>
  );
}
