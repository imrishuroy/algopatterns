"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

type Mode = "can-jump" | "min-jumps";

export default function JumpGameVisualizer() {
  const [mode, setMode] = useState<Mode>("can-jump");
  const [isPlaying, setIsPlaying] = useState(false);
  const [step, setStep] = useState(0);
  const [speed, setSpeed] = useState(600);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [maxReach, setMaxReach] = useState(0);
  const [jumps, setJumps] = useState(0);
  const [currentEnd, setCurrentEnd] = useState(0);
  const [farthest, setFarthest] = useState(0);
  const [result, setResult] = useState<string | null>(null);

  const canJumpNums = [2, 3, 1, 1, 4];
  const cannotJumpNums = [3, 2, 1, 0, 4];
  const minJumpsNums = [2, 3, 1, 1, 4];

  const nums = mode === "can-jump" ? canJumpNums : minJumpsNums;
  const [showFailCase, setShowFailCase] = useState(false);
  const activeNums = showFailCase ? cannotJumpNums : nums;

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (currentIndex >= activeNums.length) {
        setIsPlaying(false);
        if (mode === "can-jump") {
          setResult(
            maxReach >= activeNums.length - 1
              ? "Can reach the end!"
              : "Cannot reach the end"
          );
        } else {
          setResult(`Minimum jumps: ${jumps}`);
        }
        return;
      }

      if (mode === "can-jump") {
        if (currentIndex > maxReach) {
          setIsPlaying(false);
          setResult("Stuck! Cannot reach the end.");
          return;
        }

        const newMaxReach = Math.max(
          maxReach,
          currentIndex + activeNums[currentIndex]
        );
        setMaxReach(newMaxReach);

        if (newMaxReach >= activeNums.length - 1) {
          setIsPlaying(false);
          setResult("Can reach the end!");
          return;
        }
      } else {
        const newFarthest = Math.max(
          farthest,
          currentIndex + activeNums[currentIndex]
        );
        setFarthest(newFarthest);

        if (
          currentIndex === currentEnd &&
          currentIndex < activeNums.length - 1
        ) {
          setJumps((j) => j + 1);
          setCurrentEnd(newFarthest);
        }
      }

      setCurrentIndex((i) => i + 1);
      setStep((s) => s + 1);
    }, speed);

    return () => clearTimeout(timer);
  }, [
    isPlaying,
    currentIndex,
    maxReach,
    mode,
    activeNums,
    currentEnd,
    farthest,
    jumps,
    speed,
  ]);

  const reset = () => {
    setStep(0);
    setIsPlaying(false);
    setCurrentIndex(0);
    setMaxReach(0);
    setJumps(0);
    setCurrentEnd(0);
    setFarthest(0);
    setResult(null);
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    reset();
  };

  const getCellColor = (idx: number) => {
    if (idx === currentIndex) return "bg-yellow-500 text-black";
    if (mode === "can-jump" && idx <= maxReach && idx < currentIndex)
      return "bg-green-500/30 border-green-500";
    if (mode === "min-jumps" && idx <= currentEnd && idx < currentIndex)
      return "bg-blue-500/30 border-blue-500";
    if (idx < currentIndex) return "bg-gray-700";
    return "bg-gray-800";
  };

  const getReachIndicator = () => {
    if (mode === "can-jump") {
      return (
        <motion.div
          animate={{
            width: `${Math.min(((maxReach + 1) / activeNums.length) * 100, 100)}%`,
          }}
          className="absolute top-0 left-0 h-full bg-green-500/20 border-r-2 border-green-500 rounded-l-lg"
          style={{ zIndex: 0 }}
        />
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">
          Jump Game Visualizer
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Greedy: Track the maximum reachable position
        </p>
      </div>

      <div className="p-4">
        {/* Mode Selector */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => switchMode("can-jump")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              mode === "can-jump"
                ? "bg-green-500 text-white"
                : "bg-gray-800 text-gray-400"
            }`}
          >
            Can Jump? (I)
          </button>
          <button
            onClick={() => switchMode("min-jumps")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              mode === "min-jumps"
                ? "bg-blue-500 text-white"
                : "bg-gray-800 text-gray-400"
            }`}
          >
            Min Jumps (II)
          </button>
          {mode === "can-jump" && (
            <label className="flex items-center gap-2 ml-4 cursor-pointer">
              <input
                type="checkbox"
                checked={showFailCase}
                onChange={(e) => {
                  setShowFailCase(e.target.checked);
                  reset();
                }}
                className="w-4 h-4 rounded accent-red-500"
              />
              <span className="text-gray-400 text-sm">Show fail case</span>
            </label>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={result !== null}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              isPlaying ? "bg-yellow-500 text-black" : "bg-green-500 text-white"
            } disabled:opacity-50`}
          >
            {isPlaying ? "Pause" : "Play"}
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
              max="1000"
              step="100"
              value={1200 - speed}
              onChange={(e) => setSpeed(1200 - Number(e.target.value))}
              className="w-20 accent-blue-500"
            />
          </div>
        </div>

        {/* Array Visualization */}
        <div className="mb-6">
          <div className="text-sm text-gray-400 mb-2">
            nums = [{activeNums.join(", ")}]
          </div>
          <div className="relative">
            {getReachIndicator()}
            <div className="flex gap-2 relative z-10">
              {activeNums.map((num, idx) => (
                <motion.div
                  key={`num-${num}-${idx}`}
                  animate={{
                    scale: idx === currentIndex ? 1.1 : 1,
                    y: idx === currentIndex ? -8 : 0,
                  }}
                  className={`flex-1 p-4 rounded-lg border-2 text-center transition-colors ${getCellColor(idx)}`}
                >
                  <div className="text-xs text-gray-500 mb-1">i={idx}</div>
                  <div className="text-2xl font-mono font-bold">{num}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {idx === 0
                      ? "Start"
                      : idx === activeNums.length - 1
                        ? "Goal"
                        : ""}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Jump arrows for min-jumps mode */}
          {mode === "min-jumps" && currentEnd > 0 && (
            <div className="relative h-8 mt-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${((currentEnd + 1) / activeNums.length) * 100}%`,
                }}
                className="absolute h-1 bg-blue-500 top-1/2 -translate-y-1/2 rounded-full"
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded"
                style={{
                  left: `${((currentEnd + 0.5) / activeNums.length) * 100}%`,
                  transform: "translateX(-50%) translateY(-50%)",
                }}
              >
                Level {jumps}
              </div>
            </div>
          )}
        </div>

        {/* State Display */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">Current Index</div>
            <div className="text-xl font-mono font-bold text-yellow-400">
              {currentIndex}
            </div>
          </div>
          {mode === "can-jump" ? (
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">Max Reach</div>
              <div className="text-xl font-mono font-bold text-green-400">
                {maxReach}
              </div>
            </div>
          ) : (
            <>
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500 mb-1">Current End</div>
                <div className="text-xl font-mono font-bold text-blue-400">
                  {currentEnd}
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500 mb-1">Farthest</div>
                <div className="text-xl font-mono font-bold text-purple-400">
                  {farthest}
                </div>
              </div>
            </>
          )}
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">
              {mode === "can-jump" ? "Target" : "Jumps"}
            </div>
            <div className="text-xl font-mono font-bold text-white">
              {mode === "can-jump" ? activeNums.length - 1 : jumps}
            </div>
          </div>
        </div>

        {/* Current calculation */}
        {currentIndex < activeNums.length && !result && (
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-gray-800/50 rounded-lg mb-4"
          >
            <code className="text-sm font-mono">
              {mode === "can-jump" ? (
                <span className="text-green-400">
                  maxReach = max({maxReach}, {currentIndex} +{" "}
                  {activeNums[currentIndex]}) = max({maxReach},{" "}
                  {currentIndex + activeNums[currentIndex]}) ={" "}
                  {Math.max(maxReach, currentIndex + activeNums[currentIndex])}
                </span>
              ) : (
                <span className="text-blue-400">
                  farthest = max({farthest}, {currentIndex} +{" "}
                  {activeNums[currentIndex]}) ={" "}
                  {Math.max(farthest, currentIndex + activeNums[currentIndex])}
                  {currentIndex === currentEnd &&
                    currentIndex < activeNums.length - 1 && (
                      <span className="text-yellow-400">
                        {" "}
                        | i == currentEnd, JUMP!
                      </span>
                    )}
                </span>
              )}
            </code>
          </motion.div>
        )}

        {/* Result */}
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 rounded-lg text-center font-bold text-lg ${
              result.includes("Cannot") || result.includes("Stuck")
                ? "bg-red-500/10 border border-red-500/30 text-red-400"
                : "bg-green-500/10 border border-green-500/30 text-green-400"
            }`}
          >
            {result}
          </motion.div>
        )}

        {/* Algorithm explanation */}
        <div className="mt-4 p-3 bg-gray-800/30 rounded-lg text-sm text-gray-400">
          {mode === "can-jump" ? (
            <p>
              <strong className="text-green-400">Greedy Insight:</strong> At
              each position, update the maximum reachable index. If current
              index exceeds maxReach, we&apos;re stuck. If maxReach {">="} last
              index, we can reach the end.
            </p>
          ) : (
            <p>
              <strong className="text-blue-400">BFS-like Greedy:</strong> Think
              of it as levels. currentEnd marks the boundary of current "level".
              When we reach it, we must jump (increment jumps) and set new
              boundary to farthest.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
