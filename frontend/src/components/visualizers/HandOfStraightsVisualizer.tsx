"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Example data - same as tutorial
const HAND = [1, 2, 3, 6, 2, 3, 4, 7, 8];
const GROUP_SIZE = 3;

interface StepInfo {
  type:
    | "init"
    | "find-smallest"
    | "form-group"
    | "take-card"
    | "group-complete"
    | "done"
    | "fail";
  smallest?: number;
  currentCard?: number;
  groupCards?: number[];
  groupIndex?: number;
  counts: Map<number, number>;
  message: string;
  success?: boolean;
}

// Pre-compute all steps
const computeSteps = (): StepInfo[] => {
  const steps: StepInfo[] = [];

  // Check divisibility
  if (HAND.length % GROUP_SIZE !== 0) {
    steps.push({
      type: "fail",
      counts: new Map(),
      message: `${HAND.length} cards is not divisible by group size ${GROUP_SIZE}. Impossible!`,
      success: false,
    });
    return steps;
  }

  // Initial count
  const count = new Map<number, number>();
  for (const card of HAND) {
    count.set(card, (count.get(card) || 0) + 1);
  }

  steps.push({
    type: "init",
    counts: new Map(count),
    message: `Count frequency of each card. Total: ${HAND.length} cards, need ${HAND.length / GROUP_SIZE} groups of ${GROUP_SIZE}.`,
  });

  const sortedCards = [...count.keys()].sort((a, b) => a - b);
  let groupIndex = 0;

  // Process until all cards are used (Java-style: one group at a time)
  while (count.size > 0) {
    // Find the smallest card with count > 0
    let first: number | null = null;
    for (const card of sortedCards) {
      const cardCount = count.get(card) || 0;
      if (cardCount > 0) {
        first = card;
        break;
      }
    }

    if (first === null) break;

    const freq = count.get(first) || 0;

    // Find smallest step
    steps.push({
      type: "find-smallest",
      smallest: first,
      counts: new Map(count),
      groupIndex,
      message: `Smallest available card is ${first} (count: ${freq}). Start forming group ${groupIndex + 1}.`,
    });

    const groupCards: number[] = [];

    // Form ONE group (decrement by 1, not by freq)
    for (let i = 0; i < GROUP_SIZE; i++) {
      const card = first + i;
      const cardFreq = count.get(card) || 0;

      if (cardFreq === 0) {
        steps.push({
          type: "fail",
          currentCard: card,
          smallest: first,
          groupCards,
          counts: new Map(count),
          message: `Need card ${card} but it doesn't exist. Cannot form group!`,
          success: false,
        });
        return steps;
      }

      groupCards.push(card);

      const newCount = cardFreq - 1;
      steps.push({
        type: "take-card",
        smallest: first,
        currentCard: card,
        groupCards: [...groupCards],
        groupIndex,
        counts: new Map(count),
        message: `Take card ${card} (${cardFreq} → ${newCount}). Group so far: [${groupCards.join(", ")}]`,
      });

      if (newCount === 0) {
        count.delete(card);
      } else {
        count.set(card, newCount);
      }
    }

    steps.push({
      type: "group-complete",
      smallest: first,
      groupCards,
      groupIndex,
      counts: new Map(count),
      message: `Group ${groupIndex + 1} complete: [${groupCards.join(", ")}] ✓`,
    });

    groupIndex++;
  }

  steps.push({
    type: "done",
    counts: new Map(count),
    message: `All ${groupIndex} groups formed successfully!`,
    success: true,
  });

  return steps;
};

const STEPS = computeSteps();
const UNIQUE_CARDS = [...new Set(HAND)].sort((a, b) => a - b);

// skipcq: JS-0067 — React component with hooks requires function declaration
export default function HandOfStraightsVisualizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedGroups, setCompletedGroups] = useState<number[][]>([]);

  const isDone = currentStep >= STEPS.length;
  const currentStepData = currentStep > 0 ? STEPS[currentStep - 1] : null;

  const performStep = useCallback(() => {
    if (currentStep < STEPS.length) {
      const step = STEPS[currentStep];
      if (step.type === "group-complete" && step.groupCards) {
        const cards = step.groupCards;
        setCompletedGroups((prev) => [...prev, cards]);
      }
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
    setCompletedGroups([]);
  };

  // Get current counts
  const getCurrentCounts = (): Map<number, number> => {
    if (currentStep === 0) {
      const count = new Map<number, number>();
      for (const card of HAND) {
        count.set(card, (count.get(card) || 0) + 1);
      }
      return count;
    }
    return currentStepData?.counts || new Map();
  };

  const counts = getCurrentCounts();

  // Get card status for coloring
  const getCardStatus = (card: number) => {
    if (!currentStepData) return "default";

    if (
      currentStepData.type === "fail" &&
      currentStepData.currentCard === card
    ) {
      return "error";
    }
    if (currentStepData.currentCard === card) {
      return "current";
    }
    if (currentStepData.groupCards?.includes(card)) {
      return "in-group";
    }
    if (currentStepData.smallest === card) {
      return "smallest";
    }
    const count = counts.get(card) || 0;
    if (count === 0) {
      return "used";
    }
    return "default";
  };

  const getCardStyle = (status: string) => {
    switch (status) {
      case "error":
        return "bg-red-500 border-red-400 text-white";
      case "current":
        return "bg-yellow-500 border-yellow-400 text-black";
      case "in-group":
        return "bg-blue-500/50 border-blue-400 text-white";
      case "smallest":
        return "bg-green-500/50 border-green-400 text-white";
      case "used":
        return "bg-gray-800/50 border-gray-700 text-gray-600";
      default:
        return "bg-gray-800 border-gray-600 text-white";
    }
  };

  const getFinalStatus = () => {
    if (!isDone) return null;
    const lastStep = STEPS[STEPS.length - 1];
    return lastStep.success;
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="p-4 border-b border-gray-800 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
        <h3 className="text-lg font-semibold text-white">Hand of Straights</h3>
        <p className="text-gray-400 text-sm mt-1">
          Group cards into consecutive sequences of size {GROUP_SIZE}
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

        {/* Input Data */}
        <div className="mb-6 p-4 bg-gray-800/50 rounded-lg font-mono text-sm">
          <div className="flex gap-8 justify-center flex-wrap">
            <div>
              <span className="text-gray-500">hand = </span>
              <span className="text-purple-400">[{HAND.join(", ")}]</span>
            </div>
            <div>
              <span className="text-gray-500">groupSize = </span>
              <span className="text-pink-400">{GROUP_SIZE}</span>
            </div>
          </div>
        </div>

        {/* Card Frequency Display (TreeMap visualization) */}
        <div className="mb-6">
          <div className="text-sm text-gray-400 mb-3 text-center">
            Card Frequencies (sorted like TreeMap)
          </div>
          <div className="flex justify-center items-end gap-2 flex-wrap">
            {UNIQUE_CARDS.map((card) => {
              const count = counts.get(card) || 0;
              const status = getCardStatus(card);
              return (
                <motion.div
                  key={card}
                  animate={{
                    scale:
                      status === "current" || status === "smallest" ? 1.1 : 1,
                  }}
                  className={`relative w-16 p-3 rounded-lg border-2 text-center transition-all ${getCardStyle(status)}`}
                >
                  <div className="text-2xl font-bold">{card}</div>
                  <div className="text-xs mt-1 opacity-80">count: {count}</div>
                  {status === "smallest" && (
                    <div className="absolute -top-2 -left-2 bg-green-500 text-white text-xs px-1 rounded">
                      min
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Current Group Being Formed */}
        {currentStepData?.groupCards &&
          currentStepData.groupCards.length > 0 &&
          !isDone && (
            <div className="mb-6">
              <div className="text-sm text-gray-400 mb-2 text-center">
                Forming Group {(currentStepData.groupIndex || 0) + 1}
              </div>
              <div className="flex justify-center gap-2">
                {/* skipcq: JS-0437 - cards are unique values, index used for animation ordering */}
                {currentStepData.groupCards.map((card, idx) => (
                  <motion.div
                    key={`card-${card}-${idx}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                  >
                    {card}
                  </motion.div>
                ))}
                {/* Placeholder for remaining cards - skipcq: JS-0437 - placeholders have no unique id */}
                {Array.from({
                  length: GROUP_SIZE - currentStepData.groupCards.length,
                }).map((_, idx) => (
                  <div
                    key={`placeholder-${idx}`}
                    className="w-12 h-12 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center text-gray-600"
                  >
                    ?
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Completed Groups */}
        {completedGroups.length > 0 && (
          <div className="mb-6">
            <div className="text-sm text-gray-400 mb-2 text-center">
              Completed Groups ({completedGroups.length})
            </div>
            <div className="flex justify-center gap-4 flex-wrap">
              <AnimatePresence>
                {completedGroups.map((group, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex gap-1 p-2 bg-green-500/20 border border-green-500/50 rounded-lg"
                  >
                    {group.map((card, cardIdx) => (
                      <div
                        key={cardIdx}
                        className="w-8 h-8 bg-green-500 rounded flex items-center justify-center text-white font-bold text-sm"
                      >
                        {card}
                      </div>
                    ))}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Step Explanation */}
        {currentStepData && (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg mb-4 ${
              currentStepData.type === "fail"
                ? "bg-red-500/10 border border-red-500/30"
                : currentStepData.type === "group-complete"
                  ? "bg-green-500/10 border border-green-500/30"
                  : "bg-gray-800/50"
            }`}
          >
            <div className="text-sm">
              <span
                className={
                  currentStepData.type === "fail"
                    ? "text-red-400"
                    : currentStepData.type === "group-complete" ||
                        currentStepData.type === "done"
                      ? "text-green-400"
                      : "text-gray-300"
                }
              >
                {currentStepData.message}
              </span>
            </div>
          </motion.div>
        )}

        {/* Final Result */}
        {isDone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 rounded-lg text-center ${
              getFinalStatus()
                ? "bg-green-500/10 border border-green-500/30"
                : "bg-red-500/10 border border-red-500/30"
            }`}
          >
            {getFinalStatus() ? (
              <>
                <div className="text-green-400 font-bold text-lg">
                  ✓ Success! All groups formed.
                </div>
                <div className="text-gray-400 text-sm mt-2">
                  {completedGroups.length} groups of {GROUP_SIZE} consecutive
                  cards each.
                </div>
              </>
            ) : (
              <div className="text-red-400 font-bold text-lg">
                ✗ Cannot form valid groups
              </div>
            )}
          </motion.div>
        )}

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-gray-800">
          <div className="flex flex-wrap gap-4 text-xs text-gray-500 justify-center">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500/50 border border-green-400 rounded"></div>
              <span>Smallest (start)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>Taking card</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500/50 border border-blue-400 rounded"></div>
              <span>In current group</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-800/50 border border-gray-700 rounded"></div>
              <span>Used up</span>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-4 p-3 bg-gray-800/30 rounded-lg text-sm text-gray-400">
          <p>
            <strong className="text-purple-400">How it works:</strong> Count
            card frequencies, then always start groups from the smallest
            available card. Take consecutive cards until the group is complete.
            Repeat until all cards are used.
          </p>
        </div>
      </div>
    </div>
  );
}
