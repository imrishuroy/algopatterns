"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Step {
  index: number;
  num: number;
  numBinary: string;
  prevResult: number;
  prevResultBinary: string;
  newResult: number;
  newResultBinary: string;
  explanation: string;
  isSecondAppearance: boolean;
}

const DEFAULT_INPUT = [4, 1, 2, 1, 2];

const toBinary = (n: number, bits = 4): string => {
  return n.toString(2).padStart(bits, "0");
};

const generateSteps = (nums: number[]): Step[] => {
  const steps: Step[] = [];
  let result = 0;

  for (let i = 0; i < nums.length; i++) {
    const num = nums[i];
    const prevResult = result;
    result = result ^ num;

    const countBefore = nums.slice(0, i).filter((x) => x === num).length;
    const isSecondAppearance = countBefore === 1;

    steps.push({
      index: i,
      num,
      numBinary: toBinary(num),
      prevResult,
      prevResultBinary: toBinary(prevResult),
      newResult: result,
      newResultBinary: toBinary(result),
      explanation: isSecondAppearance
        ? `${num} appeared before, XOR cancels it out!`
        : `First time seeing ${num}`,
      isSecondAppearance,
    });
  }

  return steps;
};

// skipcq: JS-0067, JS-R1005, JS-0415 - visualizer component with inherent complexity
export default function SingleNumberXORVisualizer() {
  const [nums] = useState<number[]>(DEFAULT_INPUT);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1000);

  const steps = generateSteps(nums);
  const finalResult = nums.reduce((acc, n) => acc ^ n, 0);
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
  const displayResult = currentStepData ? currentStepData.newResult : 0;
  const displayResultBinary = currentStepData
    ? currentStepData.newResultBinary
    : "0000";

  // Track which numbers have been cancelled (appeared twice)
  const getCellStyle = (index: number) => {
    const num = nums[index];
    const isCurrent = index === currentStep;
    const isProcessed = index <= currentStep;

    if (!isProcessed) {
      return "bg-gray-800 border-gray-600 text-gray-400";
    }

    if (isCurrent) {
      return "bg-yellow-500 border-yellow-400 text-black";
    }

    // Check if this number has been fully cancelled
    // (both occurrences have been processed)
    const firstIndex = nums.indexOf(num);
    const lastIndex = nums.lastIndexOf(num);
    const bothProcessed = lastIndex <= currentStep && firstIndex !== lastIndex;

    if (bothProcessed) {
      return "bg-green-900 border-green-500 text-green-300";
    }

    return "bg-gray-700 border-gray-500 text-white";
  };

  return (
    <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">
          Single Number: XOR Cancellation
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Watch how XOR cancels pairs, leaving only the unique number
        </p>
      </div>

      <div className="p-4">
        {/* Controls at the top */}
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
              max="1500"
              step="100"
              value={1900 - speed}
              onChange={(e) => setSpeed(1900 - parseInt(e.target.value))}
              className="w-16 md:w-24 accent-cyan-500"
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

        {/* Input Array */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">Input Array:</div>
          <div className="flex gap-2 flex-wrap">
            {nums.map((num, i) => {
              const isCurrent = i === currentStep;

              return (
                // skipcq: JS-0437 - index needed for duplicate values in array
                <motion.div
                  key={`num-${num}-${i}`}
                  className={`
                    w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold
                    border-2 transition-all duration-300
                    ${getCellStyle(i)}
                  `}
                  animate={isCurrent ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {num}
                </motion.div>
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
                className="font-mono"
              >
                {/* Binary XOR visualization */}
                <div className="flex flex-col items-center gap-1 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 w-20 text-right text-sm">
                      result:
                    </span>
                    <span className="text-blue-400 text-lg tracking-wider">
                      {currentStepData.prevResultBinary}
                    </span>
                    <span className="text-gray-500 text-sm">
                      ({currentStepData.prevResult})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 w-20 text-right text-sm">
                      ^ num:
                    </span>
                    <span className="text-yellow-400 text-lg tracking-wider">
                      {currentStepData.numBinary}
                    </span>
                    <span className="text-gray-500 text-sm">
                      ({currentStepData.num})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 border-t border-gray-600 pt-1">
                    <span className="text-gray-400 w-20 text-right text-sm">
                      =
                    </span>
                    <span className="text-green-400 text-lg tracking-wider font-bold">
                      {currentStepData.newResultBinary}
                    </span>
                    <span className="text-gray-500 text-sm">
                      ({currentStepData.newResult})
                    </span>
                  </div>
                </div>

                {/* Explanation */}
                <div className="text-center">
                  <span
                    className={`text-sm px-3 py-1 rounded-full ${
                      currentStepData.isSecondAppearance
                        ? "bg-green-900 text-green-300"
                        : "bg-blue-900 text-blue-300"
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
                Click Play or Step to start
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Result Display */}
        <div className="flex items-center justify-between bg-gray-800 rounded-lg p-4">
          <div>
            <div className="text-sm text-gray-400">Current Result:</div>
            <div className="text-2xl font-bold text-white font-mono">
              {displayResult}
              <span className="text-sm text-gray-500 ml-2">
                ({displayResultBinary})
              </span>
            </div>
          </div>
          {isComplete && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold"
            >
              Answer: {finalResult}
            </motion.div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Current</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-900 border border-green-500 rounded"></div>
            <span>Pair Cancelled</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-700 border border-gray-500 rounded"></div>
            <span>Processed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
