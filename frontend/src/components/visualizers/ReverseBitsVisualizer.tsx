"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Step {
  bitIndex: number;
  inputBit: number;
  outputPosition: number;
  inputBinary: string;
  resultBinary: string;
  resultValue: number;
  explanation: string;
}

const BITS = 8; // Use 8 bits for clearer visualization

const toBinary = (n: number, bits = BITS): string => {
  return (n >>> 0).toString(2).padStart(bits, "0");
};

const generateSteps = (num: number): Step[] => {
  const steps: Step[] = [];
  const inputBinary = toBinary(num);
  let result = 0;

  for (let i = 0; i < BITS; i++) {
    const bit = (num >>> i) & 1;
    const outputPosition = BITS - 1 - i;
    result = result | (bit << outputPosition);

    steps.push({
      bitIndex: i,
      inputBit: bit,
      outputPosition,
      inputBinary,
      resultBinary: toBinary(result),
      resultValue: result,
      explanation:
        bit === 1
          ? `Bit at position ${i} is 1, place it at position ${outputPosition}`
          : `Bit at position ${i} is 0, position ${outputPosition} stays 0`,
    });
  }

  return steps;
};

// skipcq: JS-0067, JS-R1005, JS-0415 - visualizer component with inherent complexity
export default function ReverseBitsVisualizer() {
  const [inputNum, setInputNum] = useState<number>(43);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1000);

  const steps = generateSteps(inputNum);
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
  const inputBinary = toBinary(inputNum);

  // Calculate current result to show
  const currentResult = currentStepData
    ? currentStepData.resultBinary
    : "0".repeat(BITS);
  const currentResultValue = currentStepData ? currentStepData.resultValue : 0;

  // Get final result
  const finalResult = steps[steps.length - 1]?.resultValue ?? 0;

  // Render a single bit cell
  const renderBit = (
    bit: string,
    position: number,
    isActive: boolean,
    isSource: boolean,
    color: "blue" | "green" | "gray" | "orange"
  ) => {
    const colorClasses = {
      blue: "bg-blue-600 text-white",
      green: "bg-green-600 text-white",
      gray: "bg-gray-700 text-gray-400",
      orange: "bg-orange-500 text-white",
    };

    return (
      <motion.div
        key={position}
        className="relative flex flex-col items-center"
        animate={isActive ? { scale: [1, 1.15, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <div
          className={`w-8 h-10 flex items-center justify-center text-lg font-mono font-bold rounded ${
            isActive ? colorClasses.orange : colorClasses[color]
          } ${bit === "1" ? "" : ""}`}
        >
          {bit}
        </div>
        <span className="text-xs text-gray-500 mt-1">{position}</span>
        {isActive && isSource && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-5 text-orange-400 text-xs font-medium whitespace-nowrap"
          >
            extract
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">
          Reverse Bits: Mirror the Binary
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Watch each bit move from position i to position ({BITS - 1} - i)
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
                className="appearance-none bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-2 pr-10 text-sm font-medium cursor-pointer hover:border-purple-500/50 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all"
              >
                <option value={43}>43 (00101011)</option>
                <option value={13}>13 (00001101)</option>
                <option value={85}>85 (01010101)</option>
                <option value={170}>170 (10101010)</option>
                <option value={15}>15 (00001111)</option>
                <option value={240}>240 (11110000)</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            Reversed:{" "}
            <span className="text-purple-400 font-bold">{finalResult}</span> (
            {toBinary(finalResult)})
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
              className="w-16 md:w-24 accent-purple-500"
            />
          </div>
        </div>

        {/* Step indicator */}
        <div className="text-sm text-gray-400 mb-4">
          {currentStep === -1 ? (
            <>
              Ready to start. Input = {inputNum} ({inputBinary})
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

        {/* Main visualization */}
        <div className="space-y-6">
          {/* Input bits */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-3">
              Input: {inputNum} (read from right, position 0)
            </div>
            <div className="flex justify-center gap-1 pt-6">
              {inputBinary.split("").map((bit, i) => {
                const position = BITS - 1 - i;
                const isActive = currentStepData?.bitIndex === position;
                return renderBit(
                  bit,
                  position,
                  isActive,
                  true,
                  bit === "1" ? "blue" : "gray"
                );
              })}
            </div>
            <div className="flex justify-center mt-2">
              <span className="text-xs text-gray-500">
                ← higher positions | lower positions →
              </span>
            </div>
          </div>

          {/* Arrow showing the mapping */}
          <AnimatePresence mode="wait">
            {currentStepData && (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex justify-center"
              >
                <div className="bg-gray-800/50 rounded-lg px-4 py-2 text-center">
                  <div className="text-orange-400 font-medium">
                    Position {currentStepData.bitIndex} → Position{" "}
                    {currentStepData.outputPosition}
                  </div>
                  <div className="text-gray-400 text-sm mt-1">
                    {currentStepData.explanation}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Result bits */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-3">
              Result: {currentResultValue} (building from left)
            </div>
            <div className="flex justify-center gap-1">
              {currentResult.split("").map((bit, i) => {
                const position = BITS - 1 - i;
                const isActive = currentStepData?.outputPosition === position;
                const hasBeenSet =
                  currentStepData &&
                  position >= currentStepData.outputPosition &&
                  currentResult[i] === "1";
                return renderBit(
                  bit,
                  position,
                  isActive,
                  false,
                  hasBeenSet ? "green" : bit === "1" ? "green" : "gray"
                );
              })}
            </div>
            <div className="flex justify-center mt-2">
              <span className="text-xs text-gray-500">
                ← higher positions | lower positions →
              </span>
            </div>
          </div>
        </div>

        {/* Formula reminder */}
        <div className="mt-4 bg-gray-800/50 rounded-lg p-3 text-center">
          <code className="text-purple-300 text-sm">
            result |= ((n &gt;&gt; i) & 1) &lt;&lt; ({BITS - 1} - i)
          </code>
        </div>

        {/* Completion message */}
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-green-900/30 border border-green-700 rounded-lg p-4 text-center"
          >
            <div className="text-green-400 font-bold text-lg">Reversed!</div>
            <div className="text-gray-300 mt-1">
              {inputNum} ({inputBinary}) → {finalResult} (
              {toBinary(finalResult)})
            </div>
          </motion.div>
        )}

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400 flex-wrap">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-600 rounded"></div>
            <span>Input 1</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-600 rounded"></div>
            <span>Output 1</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span>Current bit</span>
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
