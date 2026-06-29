"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function TwoSumVisualizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hashMap, setHashMap] = useState<Map<number, number>>(new Map());
  const [found, setFound] = useState<[number, number] | null>(null);
  const [currentComplement, setCurrentComplement] = useState<number | null>(
    null
  );
  const [message, setMessage] = useState(
    "Click Play to find two numbers that sum to target"
  );
  const [phase, setPhase] = useState<
    "init" | "checking" | "adding" | "found" | "done"
  >("init");

  const nums = useMemo(() => [2, 7, 11, 15, 3, 6], []);
  const target = 9;

  const reset = useCallback(() => {
    setCurrentIndex(0);
    setHashMap(new Map());
    setFound(null);
    setCurrentComplement(null);
    setPhase("init");
    setMessage("Click Play to find two numbers that sum to target");
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (currentIndex >= nums.length) {
        setPhase("done");
        setMessage("No pair found that sums to target");
        setIsPlaying(false);
        return;
      }

      const currentNum = nums[currentIndex];
      const complement = target - currentNum;

      if (phase === "init" || phase === "adding") {
        setPhase("checking");
        setCurrentComplement(complement);
        setMessage(
          `At index ${currentIndex}: nums[${currentIndex}] = ${currentNum}. Looking for complement ${target} - ${currentNum} = ${complement}`
        );
      } else if (phase === "checking") {
        if (hashMap.has(complement)) {
          const complementIndex = hashMap.get(complement)!;
          setFound([complementIndex, currentIndex]);
          setPhase("found");
          setMessage(
            `Found! nums[${complementIndex}] + nums[${currentIndex}] = ${complement} + ${currentNum} = ${target}`
          );
          setIsPlaying(false);
        } else {
          setPhase("adding");
          const newMap = new Map(hashMap);
          newMap.set(currentNum, currentIndex);
          setHashMap(newMap);
          setMessage(
            `${complement} not in map. Adding {${currentNum}: ${currentIndex}} to map.`
          );
          setCurrentIndex(currentIndex + 1);
          setCurrentComplement(null);
        }
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [isPlaying, currentIndex, phase, hashMap, nums, target, speed]);

  const getArrayCellStyle = (index: number) => {
    if (found && (index === found[0] || index === found[1])) {
      return "bg-green-500 text-white";
    }
    if (index === currentIndex) {
      return "bg-yellow-500 text-black";
    }
    if (index < currentIndex) {
      return "bg-blue-500/30 border-blue-500";
    }
    return "bg-gray-700";
  };

  return (
    <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-pink-500/10 to-rose-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">
          Two Sum: Complement Lookup
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Use HashMap to find pair summing to target in O(n)
        </p>
      </div>

      <div className="p-4">
        {/* Target display */}
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-gray-800 rounded-md px-4 py-2">
            <span className="text-gray-400 text-sm">Target: </span>
            <span className="text-2xl font-bold text-pink-400">{target}</span>
          </div>
          {currentComplement !== null && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-purple-500/20 border border-purple-500 rounded-md px-4 py-2"
            >
              <span className="text-gray-400 text-sm">Looking for: </span>
              <span className="text-2xl font-bold text-purple-400">
                {currentComplement}
              </span>
            </motion.div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={phase === "found" || phase === "done"}
            className={`px-3 md:px-4 py-2 rounded-md font-medium text-sm md:text-base transition ${
              isPlaying ? "bg-yellow-500 text-black" : "bg-green-500 text-white"
            } disabled:opacity-50`}
          >
            {isPlaying ? "Pause" : "Play"}
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
              onChange={(e) => setSpeed(1900 - Number(e.target.value))}
              className="w-16 md:w-20 accent-pink-500"
            />
          </div>
        </div>

        {/* Array Visualization */}
        <div className="mb-6 overflow-x-auto">
          <div className="text-sm text-gray-400 mb-2">
            nums = [{nums.join(", ")}]
          </div>
          <div className="flex gap-1.5 md:gap-2 min-w-max">
            {nums.map((num, idx) => (
              <motion.div
                key={`num-${num}-${idx}`}
                animate={{
                  scale: idx === currentIndex ? 1.1 : 1,
                  y: idx === currentIndex ? -5 : 0,
                }}
                className={`w-10 h-10 md:w-14 md:h-14 rounded-md border-2 flex flex-col items-center justify-center transition-colors ${getArrayCellStyle(idx)}`}
              >
                <span className="text-[10px] md:text-xs text-gray-400">i={idx}</span>
                <span className="text-sm md:text-lg font-bold">{num}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* HashMap Visualization */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">
            HashMap: value → index
          </div>
          <div className="bg-gray-800/50 rounded-md p-4 min-h-[80px]">
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {Array.from(hashMap.entries()).map(([value, index]) => (
                  <motion.div
                    key={value}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    className={`px-3 py-2 rounded-md font-mono text-sm ${
                      currentComplement === value
                        ? "bg-green-500 text-white ring-2 ring-green-300"
                        : "bg-blue-500/30 border border-blue-500 text-blue-300"
                    }`}
                  >
                    {value} → {index}
                  </motion.div>
                ))}
              </AnimatePresence>
              {hashMap.size === 0 && (
                <span className="text-gray-500">
                  Empty - will store {"{value: index}"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Current calculation */}
        {currentIndex < nums.length && phase !== "found" && (
          <div className="p-3 bg-gray-800/50 rounded-md mb-4">
            <code className="text-sm font-mono">
              <span className="text-gray-400">complement = </span>
              <span className="text-pink-400">{target}</span>
              <span className="text-gray-400"> - </span>
              <span className="text-yellow-400">{nums[currentIndex]}</span>
              <span className="text-gray-400"> = </span>
              <span className="text-purple-400">
                {target - nums[currentIndex]}
              </span>
              {phase === "checking" && (
                <span className="ml-4">
                  {hashMap.has(target - nums[currentIndex]) ? (
                    <span className="text-green-400">✓ Found in map!</span>
                  ) : (
                    <span className="text-red-400">✗ Not in map</span>
                  )}
                </span>
              )}
            </code>
          </div>
        )}

        {/* Message */}
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-md text-sm ${
            phase === "found"
              ? "bg-green-500/10 border border-green-500/30 text-green-400"
              : phase === "done"
                ? "bg-red-500/10 border border-red-500/30 text-red-400"
                : "bg-gray-800 text-gray-300"
          }`}
        >
          {message}
        </motion.div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-yellow-500" />
            <span className="text-gray-400">Current</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-blue-500/30 border border-blue-500" />
            <span className="text-gray-400">In HashMap</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-green-500" />
            <span className="text-gray-400">Found Pair</span>
          </div>
        </div>

        {/* Algorithm explanation */}
        <div className="mt-4 p-3 bg-gray-800/30 rounded-md text-sm text-gray-400">
          <p>
            <strong className="text-pink-400">Key Insight:</strong> For each
            number, check if its complement (target - num) exists in the map.
            Check BEFORE adding to avoid matching element with itself.
          </p>
        </div>
      </div>
    </div>
  );
}
