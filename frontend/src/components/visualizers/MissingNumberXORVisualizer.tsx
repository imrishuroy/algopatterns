"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Step {
  i: number;
  index: number;
  value: number;
  prevXor: number;
  newXor: number;
  explanation: string;
}

const DEFAULT_INPUT = [3, 0, 1];

const generateSteps = (nums: number[]): Step[] => {
  const steps: Step[] = [];
  let xor = nums.length;

  for (let i = 0; i < nums.length; i++) {
    const prevXor = xor;
    xor ^= i ^ nums[i];

    steps.push({
      i,
      index: i,
      value: nums[i],
      prevXor,
      newXor: xor,
      explanation:
        i === nums[i]
          ? `Index ${i} equals value ${nums[i]}, they cancel!`
          : `XOR index ${i} and value ${nums[i]}`,
    });
  }

  return steps;
};

// skipcq: JS-0067, JS-R1005, JS-0415 - visualizer component with inherent complexity
export default function MissingNumberXORVisualizer() {
  const [nums] = useState<number[]>(DEFAULT_INPUT);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1200);

  const n = nums.length;
  const steps = generateSteps(nums);
  const missingNumber = nums.reduce((xor, num, i) => xor ^ i ^ num, n);
  const isComplete = currentStep === steps.length - 1;

  const reset = useCallback(() => {
    setCurrentStep(-1);
    setIsPlaying(false);
  }, []);

  const play = useCallback(() => {
    if (isComplete) {
      setCurrentStep(-1);
    }
    setIsPlaying(true);
  }, [isComplete]);

  // skipcq: JS-0045 - cleanup function is standard React pattern
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (currentStep >= steps.length - 1) {
        setIsPlaying(false);
        return;
      }
      setCurrentStep((prev) => prev + 1);
    }, speed);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length, speed]);

  const currentStepData = currentStep >= 0 ? steps[currentStep] : null;
  const displayXor = currentStepData ? currentStepData.newXor : n;

  // Build the "all numbers" visualization
  const allNumbers = Array.from({ length: n + 1 }, (_, i) => i);

  return (
    <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">
          Missing Number: XOR with Indices
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          XOR indices and values together. Pairs cancel, missing number remains!
        </p>
      </div>

      <div className="p-4">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <button
            onClick={() => {
              if (isPlaying) {
                setIsPlaying(false);
              } else {
                play();
              }
            }}
            className={`px-3 md:px-4 py-2 rounded-md font-medium text-sm md:text-base transition ${
              isPlaying ? "bg-yellow-500 text-black" : "bg-green-500 text-white"
            }`}
          >
            {isPlaying ? "Pause" : isComplete ? "Replay" : "Play"}
          </button>
          <button
            onClick={() =>
              currentStep < steps.length - 1 && setCurrentStep((s) => s + 1)
            }
            disabled={isPlaying || isComplete}
            className="px-3 md:px-4 py-2 bg-gray-700 text-white rounded-md font-medium text-sm md:text-base hover:bg-gray-600 disabled:opacity-50"
          >
            Step
          </button>
          <button
            onClick={reset}
            className="px-3 md:px-4 py-2 bg-gray-700 text-white rounded-md font-medium text-sm md:text-base hover:bg-gray-600"
          >
            Reset
          </button>
          <div className="flex items-center gap-2 ml-auto md:ml-4">
            <span className="text-gray-400 text-xs md:text-sm">Speed:</span>
            <input
              type="range"
              min="400"
              max="1800"
              step="100"
              value={2200 - speed}
              onChange={(e) => setSpeed(2200 - parseInt(e.target.value))}
              className="w-16 md:w-24 accent-purple-500"
            />
          </div>
        </div>

        {/* Step indicator */}
        <div className="text-sm text-gray-400 mb-4">
          {currentStep === -1 ? (
            "Ready to start"
          ) : (
            <>
              Step {currentStep + 1} of {steps.length}
              {isComplete && (
                <span className="ml-2 text-green-400 font-medium">
                  Complete!
                </span>
              )}
            </>
          )}
        </div>

        {/* Complete range [0, n] */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">
            Complete range [0 to {n}]:
          </div>
          <div className="flex gap-2 flex-wrap">
            {allNumbers.map((num) => {
              const isMissing = num === missingNumber;
              const isInArray = nums.includes(num);

              return (
                <div
                  key={`complete-${num}`}
                  className={`
                    w-10 h-10 rounded-lg flex items-center justify-center text-base font-bold
                    border-2 transition-all duration-300
                    ${
                      isMissing && isComplete
                        ? "bg-red-500 border-red-400 text-white"
                        : isInArray
                          ? "bg-gray-700 border-gray-500 text-white"
                          : "bg-red-900 border-red-500 text-red-300"
                    }
                  `}
                >
                  {num}
                  {isMissing && !isComplete && (
                    <span className="text-xs ml-0.5">?</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Input array with indices */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">
            Array (with indices above):
          </div>
          <div className="flex gap-2 flex-wrap">
            {nums.map((num, i) => {
              const isCurrent = i === currentStep;
              const isProcessed = i <= currentStep;

              return (
                // skipcq: JS-0437 - index needed for duplicate values in array
                <div
                  key={`arr-${num}-${i}`}
                  className="flex flex-col items-center"
                >
                  <div className="text-xs text-blue-400 mb-1">i={i}</div>
                  <motion.div
                    className={`
                      w-10 h-10 rounded-lg flex items-center justify-center text-base font-bold
                      border-2 transition-all duration-300
                      ${
                        isCurrent
                          ? "bg-yellow-500 border-yellow-400 text-black"
                          : isProcessed
                            ? "bg-green-900 border-green-500 text-green-300"
                            : "bg-gray-800 border-gray-600 text-gray-400"
                      }
                    `}
                    animate={isCurrent ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {num}
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>

        {/* XOR Operation Display */}
        <div className="mb-4 bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-3">Current Operation:</div>
          <AnimatePresence mode="wait">
            {currentStepData ? (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="font-mono text-center"
              >
                <div className="text-lg mb-2">
                  <span className="text-blue-400">
                    {currentStepData.prevXor}
                  </span>
                  <span className="text-gray-400"> ^ </span>
                  <span className="text-purple-400">
                    {currentStepData.index}
                  </span>
                  <span className="text-gray-400"> ^ </span>
                  <span className="text-yellow-400">
                    {currentStepData.value}
                  </span>
                  <span className="text-gray-400"> = </span>
                  <span className="text-green-400 font-bold">
                    {currentStepData.newXor}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  (prev xor ^ index ^ value = new xor)
                </div>
                <div className="mt-2">
                  <span
                    className={`text-sm px-3 py-1 rounded-full ${
                      currentStepData.index === currentStepData.value
                        ? "bg-green-900 text-green-300"
                        : "bg-purple-900 text-purple-300"
                    }`}
                  >
                    {currentStepData.explanation}
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-gray-500 text-center py-4"
              >
                <div>Starting XOR = {n} (array length)</div>
                <div className="text-sm mt-1">Click Play or Step to start</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Result Display */}
        <div className="flex items-center justify-between bg-gray-800 rounded-lg p-4">
          <div>
            <div className="text-sm text-gray-400">Current XOR:</div>
            <div className="text-2xl font-bold text-white font-mono">
              {displayXor}
            </div>
          </div>
          {isComplete && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold"
            >
              Missing: {missingNumber}
            </motion.div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400 flex-wrap">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Current</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-900 border border-green-500 rounded"></div>
            <span>Processed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-900 border border-red-500 rounded"></div>
            <span>Missing</span>
          </div>
        </div>
      </div>
    </div>
  );
}
