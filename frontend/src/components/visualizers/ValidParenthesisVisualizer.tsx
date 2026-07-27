"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Example strings to choose from
const EXAMPLES = [
  { s: "(*)", expected: true, description: "Basic with wildcard" },
  { s: "(*))", expected: true, description: "* becomes (" },
  { s: "(*))*", expected: true, description: "Two wildcards" },
  { s: ")(", expected: false, description: "Invalid order" },
  { s: "((**)", expected: true, description: "Multiple wildcards" },
];

interface StepInfo {
  type: "init" | "process" | "clamp" | "fail" | "done";
  index: number;
  char: string;
  lowBefore: number;
  highBefore: number;
  lowAfter: number;
  highAfter: number;
  message: string;
  failed?: boolean;
}

// Compute steps for a given string
const computeSteps = (s: string): StepInfo[] => {
  const steps: StepInfo[] = [];
  let low = 0;
  let high = 0;

  steps.push({
    type: "init",
    index: -1,
    char: "",
    lowBefore: 0,
    highBefore: 0,
    lowAfter: 0,
    highAfter: 0,
    message: `Start with range [0, 0]. Scan each character.`,
  });

  for (let i = 0; i < s.length; i++) {
    const char = s[i];
    const lowBefore = low;
    const highBefore = high;

    if (char === "(") {
      low++;
      high++;
    } else if (char === ")") {
      low--;
      high--;
    } else {
      // '*'
      low--;
      high++;
    }

    // Check for immediate failure
    if (high < 0) {
      steps.push({
        type: "fail",
        index: i,
        char,
        lowBefore,
        highBefore,
        lowAfter: low,
        highAfter: high,
        message: `'${char}' at index ${i}: high = ${high} < 0! Too many ')'. Impossible to fix.`,
        failed: true,
      });
      return steps;
    }

    // Check if we need to clamp low
    const needsClamp = low < 0;
    const lowClamped = Math.max(low, 0);

    let message = "";
    if (char === "(") {
      message = `'(' at index ${i}: Both increase. Range [${lowBefore}, ${highBefore}] → [${lowClamped}, ${high}]`;
    } else if (char === ")") {
      message = `')' at index ${i}: Both decrease. Range [${lowBefore}, ${highBefore}] → [${lowClamped}, ${high}]`;
    } else {
      message = `'*' at index ${i}: Can be '(', ')' or empty. Range expands [${lowBefore}, ${highBefore}] → [${lowClamped}, ${high}]`;
    }

    if (needsClamp) {
      message += ` (low clamped from ${low} to 0)`;
    }

    steps.push({
      type: needsClamp ? "clamp" : "process",
      index: i,
      char,
      lowBefore,
      highBefore,
      lowAfter: lowClamped,
      highAfter: high,
      message,
    });

    low = lowClamped;
  }

  // Final step
  const isValid = low === 0;
  steps.push({
    type: "done",
    index: s.length,
    char: "",
    lowBefore: low,
    highBefore: high,
    lowAfter: low,
    highAfter: high,
    message: isValid
      ? `Done! low = 0, so we CAN balance to exactly 0 open parens. Valid!`
      : `Done! low = ${low} ≠ 0, so we can't balance. Invalid!`,
    failed: !isValid,
  });

  return steps;
};

export default function ValidParenthesisVisualizer() {
  const [selectedExample, setSelectedExample] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [currentStep, setCurrentStep] = useState(0);

  const currentString = EXAMPLES[selectedExample].s;

  // Compute steps using useMemo instead of state + effect
  const steps = useMemo(() => computeSteps(currentString), [currentString]);

  // Handle example change - reset state
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

  // Get current state
  const getCurrentState = () => {
    if (!currentStepData) {
      return { low: 0, high: 0, index: -1 };
    }
    return {
      low: currentStepData.lowAfter,
      high: currentStepData.highAfter,
      index: currentStepData.index,
    };
  };

  const state = getCurrentState();

  // Get character status for coloring
  const getCharStatus = (idx: number) => {
    if (!currentStepData) return "pending";
    if (currentStepData.failed && idx === currentStepData.index)
      return "failed";
    if (idx === state.index) return "current";
    if (idx < state.index) return "processed";
    return "pending";
  };

  const getCharStyle = (char: string, status: string) => {
    const baseColor =
      char === "("
        ? "text-green-400"
        : char === ")"
          ? "text-red-400"
          : "text-yellow-400";

    switch (status) {
      case "current":
        return `bg-yellow-500/30 border-yellow-500 ${baseColor} ring-2 ring-yellow-500/50`;
      case "failed":
        return `bg-red-500/30 border-red-500 text-red-400 ring-2 ring-red-500/50`;
      case "processed":
        return `bg-gray-700/50 border-gray-600 ${baseColor} opacity-70`;
      default:
        return `bg-gray-800 border-gray-700 ${baseColor}`;
    }
  };

  // Render the range visualization
  const renderRangeBar = () => {
    const maxRange = 5;
    const low = Math.max(0, state.low);
    const high = Math.min(maxRange, Math.max(0, state.high));

    return (
      <div className="flex flex-col items-center">
        <div className="text-sm text-gray-400 mb-2">
          Possible Open Parens Range
        </div>
        <div className="flex items-center gap-1 mb-6">
          {Array.from({ length: maxRange + 1 }).map((_, i) => {
            const inRange = i >= low && i <= high;
            const isLow = i === low;
            const isHigh = i === high;

            return (
              <motion.div
                key={i}
                animate={{
                  scale: inRange ? 1 : 0.8,
                  opacity: inRange ? 1 : 0.3,
                }}
                className={`relative w-10 h-10 rounded-lg border-2 flex items-center justify-center font-mono font-bold transition-all ${
                  inRange
                    ? "bg-blue-500/30 border-blue-500 text-blue-300"
                    : "bg-gray-800 border-gray-700 text-gray-600"
                }`}
              >
                {i}
                {isLow && inRange && (
                  <span className="absolute -bottom-5 text-xs text-blue-400">
                    low
                  </span>
                )}
                {isHigh && inRange && !isLow && (
                  <span className="absolute -bottom-5 text-xs text-cyan-400">
                    high
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
        <div className="mt-6 text-center font-mono">
          <span className="text-gray-400">Range: </span>
          <span className="text-blue-400">[{state.low}</span>
          <span className="text-gray-400">, </span>
          <span className="text-cyan-400">{state.high}]</span>
        </div>
      </div>
    );
  };

  const getFinalResult = () => {
    if (steps.length === 0) return null;
    const lastStep = steps[steps.length - 1];
    return !lastStep.failed;
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="p-4 border-b border-gray-800 bg-gradient-to-r from-violet-500/10 to-purple-500/10">
        <h3 className="text-lg font-semibold text-white">
          Valid Parenthesis String
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Track range [low, high] of possible open parens count
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
                className={`px-3 py-2 rounded-lg font-mono text-sm transition ${
                  selectedExample === idx
                    ? "bg-violet-500 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                &quot;{ex.s}&quot;
                <span
                  className={`ml-2 text-xs ${ex.expected ? "text-green-400" : "text-red-400"}`}
                >
                  {ex.expected ? "✓" : "✗"}
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
              className="w-20 accent-violet-500"
            />
          </div>
        </div>

        {/* String Visualization */}
        <div className="mb-6">
          <div className="text-sm text-gray-400 mb-2 text-center">
            String: &quot;{currentString}&quot;
          </div>
          <div className="flex justify-center gap-2">
            {currentString.split("").map((char, idx) => {
              const status = getCharStatus(idx);
              return (
                <motion.div
                  key={idx}
                  animate={{
                    scale: status === "current" ? 1.2 : 1,
                  }}
                  className={`w-12 h-12 rounded-lg border-2 flex flex-col items-center justify-center font-mono transition-all ${getCharStyle(char, status)}`}
                >
                  <span className="text-xl font-bold">{char}</span>
                  <span className="text-xs text-gray-500">{idx}</span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Character Legend */}
        <div className="mb-6 flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-green-400 font-mono font-bold">(</span>
            <span className="text-gray-400">low++, high++</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-red-400 font-mono font-bold">)</span>
            <span className="text-gray-400">low--, high--</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 font-mono font-bold">*</span>
            <span className="text-gray-400">low--, high++</span>
          </div>
        </div>

        {/* Range Visualization */}
        <div className="mb-6 p-4 bg-gray-800/30 rounded-lg">
          {renderRangeBar()}
        </div>

        {/* Current State */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">
              low (min possible)
            </div>
            <div
              className={`text-3xl font-mono font-bold ${state.low === 0 ? "text-green-400" : "text-blue-400"}`}
            >
              {state.low}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">
              high (max possible)
            </div>
            <div
              className={`text-3xl font-mono font-bold ${state.high < 0 ? "text-red-400" : "text-cyan-400"}`}
            >
              {state.high}
            </div>
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
                currentStepData.type === "fail" || currentStepData.failed
                  ? "bg-red-500/10 border border-red-500/30"
                  : currentStepData.type === "done" && !currentStepData.failed
                    ? "bg-green-500/10 border border-green-500/30"
                    : currentStepData.type === "clamp"
                      ? "bg-yellow-500/10 border border-yellow-500/30"
                      : "bg-gray-800/50"
              }`}
            >
              <div className="text-sm">
                <span
                  className={
                    currentStepData.type === "fail" || currentStepData.failed
                      ? "text-red-400"
                      : currentStepData.type === "done" &&
                          !currentStepData.failed
                        ? "text-green-400"
                        : currentStepData.type === "clamp"
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
            <div
              className={`font-bold text-lg ${getFinalResult() ? "text-green-400" : "text-red-400"}`}
            >
              {getFinalResult() ? "✓ Valid String!" : "✗ Invalid String!"}
            </div>
            <div className="text-gray-400 text-sm mt-2">
              {getFinalResult()
                ? "low = 0, so we can balance all parentheses."
                : state.high < 0
                  ? "high went negative - too many ')' to fix."
                  : "low ≠ 0 at end - can't balance to 0."}
            </div>
          </motion.div>
        )}

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-gray-800">
          <div className="flex flex-wrap gap-4 text-xs text-gray-500 justify-center">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500/30 border border-yellow-500 rounded"></div>
              <span>Current</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-700/50 border border-gray-600 rounded"></div>
              <span>Processed</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500/30 border border-blue-500 rounded"></div>
              <span>In range</span>
            </div>
          </div>
        </div>

        {/* Algorithm Summary */}
        <div className="mt-4 p-3 bg-gray-800/30 rounded-lg text-sm text-gray-400">
          <p>
            <strong className="text-violet-400">Key Rules:</strong> (1) If{" "}
            <code className="text-red-400">high &lt; 0</code>, return false
            immediately. (2) Keep{" "}
            <code className="text-blue-400">low ≥ 0</code> (clamp). (3) At end,{" "}
            <code className="text-green-400">low == 0</code> means valid.
          </p>
        </div>
      </div>
    </div>
  );
}
