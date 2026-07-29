"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Step {
  a: number;
  b: number;
  aBinary: string;
  bBinary: string;
  xorResult: number;
  xorBinary: string;
  andResult: number;
  andBinary: string;
  carryResult: number;
  carryBinary: string;
  stepNumber: number;
}

const BITS = 8;

const toBinary = (n: number): string => {
  return (n >>> 0).toString(2).padStart(BITS, "0").slice(-BITS);
};

const generateSteps = (a: number, b: number): Step[] => {
  const steps: Step[] = [];
  let stepNumber = 1;

  while (b !== 0) {
    const xorResult = a ^ b;
    const andResult = a & b;
    const carryResult = (andResult << 1) & 0xff; // Keep within 8 bits

    steps.push({
      a,
      b,
      aBinary: toBinary(a),
      bBinary: toBinary(b),
      xorResult,
      xorBinary: toBinary(xorResult),
      andResult,
      andBinary: toBinary(andResult),
      carryResult,
      carryBinary: toBinary(carryResult),
      stepNumber,
    });

    a = xorResult;
    b = carryResult;
    stepNumber++;

    // Safety check to prevent infinite loops
    if (stepNumber > 20) break;
  }

  // Add final step showing result
  steps.push({
    a,
    b: 0,
    aBinary: toBinary(a),
    bBinary: toBinary(0),
    xorResult: a,
    xorBinary: toBinary(a),
    andResult: 0,
    andBinary: toBinary(0),
    carryResult: 0,
    carryBinary: toBinary(0),
    stepNumber,
  });

  return steps;
};

// skipcq: JS-0067
export default function SumIntegersVisualizer() {
  const [inputA, setInputA] = useState<number>(5);
  const [inputB, setInputB] = useState<number>(3);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1500);

  const steps = generateSteps(inputA, inputB);
  const isComplete = currentStep === steps.length - 1;
  const expectedSum = inputA + inputB;

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

  // Render binary with bit highlighting
  const renderBinary = (
    binary: string,
    highlightBits?: string,
    color: "blue" | "green" | "orange" | "purple" | "gray" = "gray"
  ) => {
    const colorClasses = {
      blue: "bg-blue-600 text-white",
      green: "bg-green-600 text-white",
      orange: "bg-orange-500 text-white",
      purple: "bg-purple-600 text-white",
      gray: "bg-gray-700 text-gray-300",
    };

    return (
      <div className="flex gap-0.5">
        {/* skipcq: JS-0437 - bit positions are stable */}
        {binary.split("").map((bit, i) => {
          const isHighlighted = highlightBits && highlightBits[i] === "1";
          return (
            <motion.span
              key={`bit-${BITS - 1 - i}`}
              className={`w-6 h-7 flex items-center justify-center text-sm font-mono font-bold rounded ${
                isHighlighted || bit === "1"
                  ? colorClasses[color]
                  : colorClasses.gray
              }`}
              animate={isHighlighted ? { scale: [1, 1.1, 1] } : {}}
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
      <div className="p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">
          Sum Without + Operator
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Watch XOR calculate sum and AND find carries
        </p>
      </div>

      <div className="p-4">
        {/* Input selectors */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">a:</span>
            <select
              value={inputA}
              onChange={(e) => {
                setInputA(parseInt(e.target.value));
                setCurrentStep(-1);
                setIsPlaying(false);
              }}
              className="appearance-none bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-1.5 text-sm font-medium cursor-pointer hover:border-green-500/50 focus:outline-none focus:border-green-500 transition-all"
            >
              {[3, 5, 7, 9, 12, 15].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <span className="text-gray-400 text-lg">+</span>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">b:</span>
            <select
              value={inputB}
              onChange={(e) => {
                setInputB(parseInt(e.target.value));
                setCurrentStep(-1);
                setIsPlaying(false);
              }}
              className="appearance-none bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-1.5 text-sm font-medium cursor-pointer hover:border-green-500/50 focus:outline-none focus:border-green-500 transition-all"
            >
              {[2, 3, 5, 7, 8, 11].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <span className="text-gray-400 text-lg">=</span>
          <span className="text-green-400 font-bold text-lg">{expectedSum}</span>
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
              min="500"
              max="2500"
              step="100"
              value={3000 - speed}
              onChange={(e) => setSpeed(3000 - parseInt(e.target.value))}
              className="w-16 md:w-24 accent-green-500"
            />
          </div>
        </div>

        {/* Step indicator */}
        <div className="text-sm text-gray-400 mb-4">
          {currentStep === -1 ? (
            <>Ready to calculate {inputA} + {inputB}</>
          ) : isComplete ? (
            <span className="text-green-400 font-medium">
              Complete! No more carry. Answer: {currentStepData?.a}
            </span>
          ) : (
            <>Step {currentStep + 1} of {steps.length}</>
          )}
        </div>

        {/* Main visualization */}
        <AnimatePresence mode="wait">
          {currentStepData && !isComplete ? (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Current values */}
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-3">
                  Step {currentStepData.stepNumber}: a = {currentStepData.a}, b = {currentStepData.b}
                </div>
                
                {/* XOR operation */}
                <div className="mb-4">
                  <div className="text-xs text-blue-400 mb-2 font-medium">
                    1. XOR gives sum without carry:
                  </div>
                  <div className="flex flex-col items-center gap-1 font-mono text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-16 text-right text-gray-400">a:</span>
                      {renderBinary(currentStepData.aBinary, currentStepData.aBinary, "blue")}
                      <span className="text-gray-500">({currentStepData.a})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-16 text-right text-gray-400">b:</span>
                      {renderBinary(currentStepData.bBinary, currentStepData.bBinary, "purple")}
                      <span className="text-gray-500">({currentStepData.b})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-16 text-right text-orange-400">XOR:</span>
                      {renderBinary(currentStepData.xorBinary, currentStepData.xorBinary, "orange")}
                      <span className="text-orange-400">({currentStepData.xorResult})</span>
                    </div>
                  </div>
                </div>

                {/* AND operation */}
                <div className="mb-4">
                  <div className="text-xs text-green-400 mb-2 font-medium">
                    2. AND finds where both bits are 1 (need carry):
                  </div>
                  <div className="flex flex-col items-center gap-1 font-mono text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-16 text-right text-gray-400">a:</span>
                      {renderBinary(currentStepData.aBinary, currentStepData.andBinary, "blue")}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-16 text-right text-gray-400">b:</span>
                      {renderBinary(currentStepData.bBinary, currentStepData.andBinary, "purple")}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-16 text-right text-green-400">AND:</span>
                      {renderBinary(currentStepData.andBinary, currentStepData.andBinary, "green")}
                      <span className="text-green-400">({currentStepData.andResult})</span>
                    </div>
                  </div>
                </div>

                {/* Shift operation */}
                <div>
                  <div className="text-xs text-purple-400 mb-2 font-medium">
                    3. Shift left (carry goes to next position):
                  </div>
                  <div className="flex flex-col items-center gap-1 font-mono text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-16 text-right text-gray-400">AND:</span>
                      {renderBinary(currentStepData.andBinary, currentStepData.andBinary, "green")}
                      <span className="text-gray-500">({currentStepData.andResult})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-16 text-right text-purple-400">{"<< 1:"}</span>
                      {renderBinary(currentStepData.carryBinary, currentStepData.carryBinary, "purple")}
                      <span className="text-purple-400">({currentStepData.carryResult})</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next iteration preview */}
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <span className="text-gray-400 text-sm">
                  Next: a = {currentStepData.xorResult}, b = {currentStepData.carryResult}
                  {currentStepData.carryResult === 0 && (
                    <span className="text-green-400 ml-2">(b = 0, done!)</span>
                  )}
                </span>
              </div>
            </motion.div>
          ) : currentStepData && isComplete ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-900/30 border border-green-700 rounded-lg p-6 text-center"
            >
              <div className="text-green-400 font-bold text-xl mb-2">
                {inputA} + {inputB} = {currentStepData.a}
              </div>
              <div className="text-gray-300">
                b = 0, no more carries. The answer is in a!
              </div>
              <div className="mt-3 font-mono text-sm">
                <span className="text-gray-400">Result: </span>
                {renderBinary(currentStepData.aBinary, currentStepData.aBinary, "green")}
              </div>
            </motion.div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-6 text-center text-gray-500">
              <div className="mb-2">Click Play or Step to start</div>
              <div className="text-sm">
                We&apos;ll add {inputA} ({toBinary(inputA)}) and {inputB} ({toBinary(inputB)})
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* Formula reminder */}
        <div className="mt-4 bg-gray-800/50 rounded-lg p-3">
          <div className="text-xs text-gray-400 mb-1">Formula:</div>
          <code className="text-green-300 text-sm">
            while (b != 0) {"{"} carry = (a & b) {"<<"} 1; a = a ^ b; b = carry; {"}"}
          </code>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400 flex-wrap">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-600 rounded"></div>
            <span>a value</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-purple-600 rounded"></div>
            <span>b value</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span>XOR (sum)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-600 rounded"></div>
            <span>AND (carry)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
