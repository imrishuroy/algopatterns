"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

const BITS = 8;

const toBinary = (n: number): string => {
  return (n >>> 0).toString(2).padStart(BITS, "0").slice(-BITS);
};

// Find the position of the rightmost 1 bit
const findRightmostOneBit = (n: number): number => {
  if (n === 0) return -1;
  const rightmost = n & -n;
  return Math.log2(rightmost);
};

// skipcq: JS-0067, JS-R1005, JS-0415 - visualizer component with inherent complexity
export default function PowerOfTwoVisualizer() {
  const [inputNum, setInputNum] = useState<number>(8);
  const [animationPhase, setAnimationPhase] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1000);

  const isPowerOfTwo = inputNum > 0 && (inputNum & (inputNum - 1)) === 0;
  const nMinus1 = inputNum - 1;
  const andResult = inputNum & nMinus1;
  const rightmostOnePos = findRightmostOneBit(inputNum);

  // Phases:
  // -1: Initial state (show n)
  // 0: Show n in binary
  // 1: Show n-1 and highlight the flipped bits
  // 2: Show AND operation
  // 3: Show result and conclusion

  const totalPhases = 4;
  const isComplete = animationPhase === totalPhases - 1;

  const reset = useCallback(() => {
    setAnimationPhase(-1);
    setIsPlaying(false);
  }, []);

  const play = useCallback(() => {
    if (isComplete) {
      setAnimationPhase(-1);
    }
    setIsPlaying(true);
  }, [isComplete]);

  // skipcq: JS-0045 - cleanup function is standard React pattern
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (animationPhase >= totalPhases - 1) {
        setIsPlaying(false);
        return;
      }
      setAnimationPhase((prev) => prev + 1);
    }, speed);

    return () => clearTimeout(timer);
  }, [isPlaying, animationPhase, speed]);

  // Render a single bit with styling
  const renderBit = (
    bit: string,
    position: number,
    type: "n" | "nMinus1" | "result",
    highlight = false,
    animate = false
  ) => {
    const isOne = bit === "1";
    let bgClass = "bg-gray-700 text-gray-400";

    if (type === "n") {
      if (highlight && position === rightmostOnePos) {
        bgClass = "bg-yellow-500 text-black"; // Rightmost 1 highlighted
      } else if (isOne) {
        bgClass = "bg-blue-600 text-white";
      }
    } else if (type === "nMinus1") {
      if (position <= rightmostOnePos && highlight) {
        // Bits that flipped (rightmost 1 and everything to its right)
        bgClass = isOne ? "bg-orange-500 text-white" : "bg-red-500 text-white";
      } else if (isOne) {
        bgClass = "bg-blue-600 text-white";
      }
    } else if (type === "result") {
      if (isOne) {
        bgClass = "bg-green-600 text-white";
      }
    }

    return (
      <motion.span
        key={position}
        className={`w-7 h-9 flex items-center justify-center text-lg font-mono font-bold rounded ${bgClass}`}
        animate={animate ? { scale: [1, 1.15, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        {bit}
      </motion.span>
    );
  };

  // Render binary number with position labels
  const renderBinaryWithLabels = (
    binary: string,
    type: "n" | "nMinus1" | "result",
    highlight = false,
    showAnimation = false
  ) => {
    return (
      <div className="flex flex-col items-center gap-1">
        <div className="flex gap-0.5">
          {binary.split("").map((bit, i) => {
            const position = BITS - 1 - i;
            return renderBit(bit, position, type, highlight, showAnimation && highlight);
          })}
        </div>
        <div className="flex gap-0.5">
          {/* skipcq: JS-0437 - position labels are static indices */}
          {binary.split("").map((_, i) => {
            const position = BITS - 1 - i;
            return (
              <span
                key={`pos-${position}`}
                className="w-7 text-center text-xs text-gray-500 font-mono"
              >
                {position}
              </span>
            );
          })}
        </div>
      </div>
    );
  };

  const getPhaseDescription = () => {
    switch (animationPhase) {
      case 0:
        return `n = ${inputNum} in binary. ${isPowerOfTwo ? "This is a power of 2, so it has exactly ONE 1-bit." : `This has ${inputNum.toString(2).split("1").length - 1} 1-bits, so it's NOT a power of 2.`}`;
      case 1:
        return `n - 1 = ${nMinus1}. Subtracting 1 flips the rightmost 1 to 0, and all 0s to its right become 1s.`;
      case 2:
        return "AND operation: Each position is 1 only if BOTH bits are 1.";
      case 3:
        return andResult === 0
          ? `Result is 0! The only 1-bit was removed, confirming ${inputNum} IS a power of 2.`
          : `Result is ${andResult} (not 0). Some 1-bits remain, so ${inputNum} is NOT a power of 2.`;
      default:
        return "Click Play to see how we check if a number is a power of 2.";
    }
  };

  // Dropdown options: mix of powers of 2 and non-powers
  const inputOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 16, 24, 32, 64];

  return (
    <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">
          Power of Two Check: n & (n-1)
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          If a number has only ONE 1-bit, removing it gives 0
        </p>
      </div>

      <div className="p-4">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <button
            onClick={isPlaying ? () => setIsPlaying(false) : play}
            className={`px-3 md:px-4 py-2 rounded-md font-medium text-sm md:text-base transition ${
              isPlaying
                ? "bg-yellow-500 text-black"
                : "bg-purple-600 hover:bg-purple-700 text-white"
            }`}
          >
            {isPlaying ? "Pause" : isComplete ? "Replay" : "Play"}
          </button>
          <button
            onClick={() => {
              if (animationPhase < totalPhases - 1) {
                setAnimationPhase((prev) => prev + 1);
              }
            }}
            disabled={isPlaying || animationPhase >= totalPhases - 1}
            className="px-3 md:px-4 py-2 bg-gray-700 text-white rounded-md font-medium text-sm md:text-base hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Step
          </button>
          <button
            onClick={reset}
            className="px-3 md:px-4 py-2 bg-gray-700 text-white rounded-md font-medium text-sm md:text-base hover:bg-gray-600 transition-colors"
          >
            Reset
          </button>
          <div className="flex items-center gap-2 ml-auto md:ml-4">
            <span className="text-gray-400 text-xs md:text-sm">Speed:</span>
            <input
              type="range"
              min="400"
              max="2000"
              step="100"
              value={2400 - speed}
              onChange={(e) => setSpeed(2400 - Number(e.target.value))}
              className="w-16 md:w-24 accent-purple-500"
            />
          </div>
        </div>

        {/* Input selector */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <label className="text-gray-400 text-sm">n =</label>
            <select
              value={inputNum}
              onChange={(e) => {
                setInputNum(Number(e.target.value));
                setAnimationPhase(-1);
                setIsPlaying(false);
              }}
              className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-purple-500"
            >
              {inputOptions.map((n) => (
                <option key={n} value={n}>
                  {n} {(n & (n - 1)) === 0 && n > 0 ? `(2^${Math.log2(n)})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div
            className={`px-3 py-1 rounded text-sm font-medium ${
              isPowerOfTwo
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-red-500/20 text-red-400 border border-red-500/30"
            }`}
          >
            {isPowerOfTwo ? "Power of 2" : "Not a power of 2"}
          </div>
        </div>

        {/* Phase description */}
        <div className="bg-gray-800/30 rounded p-3 mb-4 min-h-[3rem]">
          <p className="text-gray-300 text-sm">{getPhaseDescription()}</p>
        </div>

        {/* Main visualization */}
        <div className="bg-gray-800/50 rounded-lg p-6 mb-6">
          <div className="flex flex-col items-center gap-4">
            {/* n */}
            <div className="flex items-center gap-4">
              <span className="text-gray-400 font-mono w-20 text-right">
                n = {inputNum}
              </span>
              {renderBinaryWithLabels(
                toBinary(inputNum),
                "n",
                animationPhase >= 0,
                animationPhase === 0
              )}
            </div>

            {/* n - 1 */}
            {animationPhase >= 1 && (
              <motion.div
                className="flex items-center gap-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-gray-400 font-mono w-20 text-right">
                  n-1 = {nMinus1}
                </span>
                {renderBinaryWithLabels(
                  toBinary(nMinus1),
                  "nMinus1",
                  true,
                  animationPhase === 1
                )}
              </motion.div>
            )}

            {/* AND operation line */}
            {animationPhase >= 2 && (
              <motion.div
                className="flex items-center gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-gray-500 font-mono w-20 text-right">AND</span>
                <div className="flex gap-0.5">
                  {Array(BITS)
                    .fill(0)
                    .map((_, i) => (
                      // skipcq: JS-0437 - static divider elements
                      <span
                        key={`div-${i}`}
                        className="w-7 h-1 bg-gray-600 rounded"
                      ></span>
                    ))}
                </div>
              </motion.div>
            )}

            {/* Result */}
            {animationPhase >= 2 && (
              <motion.div
                className="flex items-center gap-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <span className="text-gray-400 font-mono w-20 text-right">
                  = {andResult}
                </span>
                {renderBinaryWithLabels(
                  toBinary(andResult),
                  "result",
                  true,
                  animationPhase === 2
                )}
              </motion.div>
            )}

            {/* Final verdict */}
            {animationPhase >= 3 && (
              <motion.div
                className={`mt-4 px-6 py-3 rounded-lg text-center ${
                  isPowerOfTwo
                    ? "bg-green-500/20 border border-green-500/30"
                    : "bg-red-500/20 border border-red-500/30"
                }`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className={`text-lg font-bold ${
                    isPowerOfTwo ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {isPowerOfTwo
                    ? `${inputNum} IS a power of 2`
                    : `${inputNum} is NOT a power of 2`}
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  {isPowerOfTwo
                    ? `n & (n-1) = 0, so n = 2^${Math.log2(inputNum)}`
                    : `n & (n-1) = ${andResult} (not 0)`}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-gray-800">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-yellow-500"></span>
              <span className="text-gray-400">Rightmost 1 in n</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-orange-500"></span>
              <span className="text-gray-400">Flipped to 1 in n-1</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-red-500"></span>
              <span className="text-gray-400">Flipped to 0 in n-1</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-green-600"></span>
              <span className="text-gray-400">Result 1-bits</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
