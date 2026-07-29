"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Step {
  n: number;
  nBinary: string;
  nMinus1: number;
  nMinus1Binary: string;
  result: number;
  resultBinary: string;
  count: number;
  removedBitPosition: number;
}

const toBinary = (n: number, bits = 8): string => {
  return (n >>> 0).toString(2).padStart(bits, "0");
};

const generateSteps = (num: number): Step[] => {
  const steps: Step[] = [];
  let n = num;
  let count = 0;

  while (n !== 0) {
    const nMinus1 = n - 1;
    const result = n & nMinus1;
    count++;

    // Find which bit was removed (rightmost 1)
    const removedBit = n & -n;
    const removedBitPosition = Math.log2(removedBit);

    steps.push({
      n,
      nBinary: toBinary(n),
      nMinus1,
      nMinus1Binary: toBinary(nMinus1),
      result,
      resultBinary: toBinary(result),
      count,
      removedBitPosition,
    });

    n = result;
  }

  return steps;
};

// skipcq: JS-0067, JS-R1005, JS-0415 - visualizer component with inherent complexity
export default function CountingBitsVisualizer() {
  const [inputNum, setInputNum] = useState<number>(11);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1200);

  const steps = generateSteps(inputNum);
  const totalOnes = steps.length;
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
  const displayCount = currentStepData ? currentStepData.count : 0;
  const displayN = currentStepData ? currentStepData.result : inputNum;
  const displayBinary = toBinary(displayN);

  // Render binary with highlighted bits
  const renderBinary = (
    binary: string,
    highlightPos?: number,
    isResult?: boolean
  ) => {
    return (
      <div className="flex gap-0.5">
        {/* skipcq: JS-0437 - bit positions are stable identifiers */}
        {binary.split("").map((bit, i) => {
          const pos = binary.length - 1 - i;
          const isHighlighted = highlightPos !== undefined && pos === highlightPos;
          const isOne = bit === "1";

          return (
            <motion.span
              key={`bit-${pos}`}
              className={`
                w-6 h-8 flex items-center justify-center text-lg font-mono font-bold rounded
                ${
                  isHighlighted
                    ? "bg-red-500 text-white"
                    : isOne
                      ? isResult
                        ? "bg-green-600 text-white"
                        : "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-400"
                }
              `}
              animate={isHighlighted ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              {bit}
            </motion.span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">
          Counting 1 Bits: n & (n-1) Trick
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Watch how we remove one 1-bit at a time until nothing is left
        </p>
      </div>

      <div className="p-4">
        {/* Input selector */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm">Number:</span>
            <div className="relative">
              <select
                value={inputNum}
                onChange={(e) => {
                  setInputNum(parseInt(e.target.value));
                  setCurrentStep(-1);
                  setIsPlaying(false);
                }}
                className="appearance-none bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-2 pr-10 text-sm font-medium cursor-pointer hover:border-orange-500/50 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition-all"
              >
                <option value={5}>5 (0101)</option>
                <option value={7}>7 (0111)</option>
                <option value={11}>11 (1011)</option>
                <option value={13}>13 (1101)</option>
                <option value={15}>15 (1111)</option>
                <option value={23}>23 (10111)</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            Has <span className="text-orange-400 font-bold">{totalOnes}</span>{" "}
            one{totalOnes !== 1 ? "s" : ""}
          </div>
        </div>

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
              className="w-16 md:w-24 accent-orange-500"
            />
          </div>
        </div>

        {/* Step indicator */}
        <div className="text-sm text-gray-400 mb-4">
          {currentStep === -1 ? (
            <>
              Ready to start. n = {inputNum} ({toBinary(inputNum)})
            </>
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

        {/* Current binary display */}
        <div className="mb-4 bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-2">Current n:</div>
          <div className="flex items-center gap-3">
            {renderBinary(displayBinary)}
            <span className="text-gray-400">=</span>
            <span className="text-2xl font-bold text-white">{displayN}</span>
          </div>
        </div>

        {/* Operation Display */}
        <div className="mb-4 bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-3">Current Operation:</div>
          <AnimatePresence mode="wait">
            {currentStepData ? (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                {/* n */}
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 w-16 text-right text-sm">
                    n:
                  </span>
                  {renderBinary(
                    currentStepData.nBinary,
                    currentStepData.removedBitPosition
                  )}
                  <span className="text-gray-500 text-sm">
                    ({currentStepData.n})
                  </span>
                </div>

                {/* n - 1 */}
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 w-16 text-right text-sm">
                    n - 1:
                  </span>
                  {renderBinary(currentStepData.nMinus1Binary)}
                  <span className="text-gray-500 text-sm">
                    ({currentStepData.nMinus1})
                  </span>
                </div>

                {/* AND line */}
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 w-16 text-right text-sm">
                    &
                  </span>
                  <div className="border-t border-gray-600 flex-1 max-w-[200px]"></div>
                </div>

                {/* Result */}
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 w-16 text-right text-sm">
                    result:
                  </span>
                  {renderBinary(currentStepData.resultBinary, undefined, true)}
                  <span className="text-gray-500 text-sm">
                    ({currentStepData.result})
                  </span>
                </div>

                {/* Explanation */}
                <div className="mt-3 text-center">
                  <span className="text-sm px-3 py-1 rounded-full bg-orange-900 text-orange-300">
                    Removed 1 at position {currentStepData.removedBitPosition}!
                    Count = {currentStepData.count}
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-gray-500 text-center py-4"
              >
                Click Play or Step to start removing 1s
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Count Display */}
        <div className="flex items-center justify-between bg-gray-800 rounded-lg p-4">
          <div>
            <div className="text-sm text-gray-400">1s removed so far:</div>
            <div className="text-3xl font-bold text-orange-400">
              {displayCount}
            </div>
          </div>
          {isComplete && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold"
            >
              Total: {totalOnes} one{totalOnes !== 1 ? "s" : ""}
            </motion.div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400 flex-wrap">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-600 rounded"></div>
            <span>1 bit</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Being removed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-700 rounded"></div>
            <span>0 bit</span>
          </div>
        </div>
      </div>
    </div>
  );
}
