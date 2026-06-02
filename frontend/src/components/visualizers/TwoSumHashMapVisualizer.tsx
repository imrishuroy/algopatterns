"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MapEntry {
  value: number;
  index: number;
}

export default function TwoSumHashMapVisualizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(900);
  const [nums] = useState([2, 7, 11, 15]);
  const [target] = useState(9);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [hashMap, setHashMap] = useState<MapEntry[]>([]);
  const [complement, setComplement] = useState<number | null>(null);
  const [found, setFound] = useState<[number, number] | null>(null);
  const [phase, setPhase] = useState<"init" | "running" | "done">("init");
  const [message, setMessage] = useState(
    "Click Play to find two numbers summing to 9"
  );

  const reset = useCallback(() => {
    setCurrentIndex(-1);
    setHashMap([]);
    setComplement(null);
    setFound(null);
    setPhase("init");
    setMessage(`Click Play to find two numbers summing to ${target}`);
    setIsPlaying(false);
  }, [target]);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (phase === "init") {
        setPhase("running");
        setCurrentIndex(0);
        const comp = target - nums[0];
        setComplement(comp);
        setMessage(
          `i=0: Looking for complement ${target} - ${nums[0]} = ${comp} in map...`
        );
        return;
      }

      if (currentIndex >= nums.length) {
        setPhase("done");
        setMessage("No pair found!");
        setIsPlaying(false);
        return;
      }

      const currentNum = nums[currentIndex];
      const comp = target - currentNum;

      // Check if complement exists
      const foundEntry = hashMap.find((e) => e.value === comp);

      if (foundEntry) {
        setFound([foundEntry.index, currentIndex]);
        setPhase("done");
        setMessage(
          `Found! map[${comp}] = ${foundEntry.index}. Return [${foundEntry.index}, ${currentIndex}]`
        );
        setIsPlaying(false);
        return;
      }

      // Add current to map
      setHashMap((prev) => [
        ...prev,
        { value: currentNum, index: currentIndex },
      ]);
      setMessage(
        `${comp} not in map. Store map[${currentNum}] = ${currentIndex}`
      );

      // Move to next
      setTimeout(() => {
        const nextIdx = currentIndex + 1;
        if (nextIdx < nums.length) {
          setCurrentIndex(nextIdx);
          const nextComp = target - nums[nextIdx];
          setComplement(nextComp);
          setMessage(
            `i=${nextIdx}: Looking for complement ${target} - ${nums[nextIdx]} = ${nextComp} in map...`
          );
        } else {
          setCurrentIndex(nextIdx);
        }
      }, speed / 2);
    }, speed);

    return () => clearTimeout(timer);
  }, [isPlaying, phase, currentIndex, nums, target, hashMap, speed]);

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-pink-500/10 to-rose-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">Two Sum - Hash Map</h3>
        <p className="text-gray-400 text-sm mt-1">
          O(n) solution using hash map for complement lookup
        </p>
      </div>

      <div className="p-4">
        {/* Controls */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={phase === "done"}
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
              min="500"
              max="1500"
              step="100"
              value={2000 - speed}
              onChange={(e) => setSpeed(2000 - Number(e.target.value))}
              className="w-20 accent-pink-500"
            />
          </div>
        </div>

        {/* Target */}
        <div className="mb-4 p-3 bg-pink-500/10 border border-pink-500/30 rounded-lg text-center">
          <span className="text-gray-400">Target: </span>
          <span className="text-pink-400 font-bold text-xl">{target}</span>
          {complement !== null && phase === "running" && (
            <span className="ml-4">
              <span className="text-gray-400">Looking for: </span>
              <span className="text-yellow-400 font-bold">{complement}</span>
            </span>
          )}
        </div>

        {/* Array visualization */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">Array:</div>
          <div className="flex gap-2 justify-center">
            {nums.map((num, idx) => (
              <motion.div
                key={`idx-${idx}`}
                animate={{
                  backgroundColor: found?.includes(idx)
                    ? "#22c55e"
                    : idx === currentIndex
                      ? "#eab308"
                      : "#374151",
                  scale: idx === currentIndex ? 1.1 : 1,
                }}
                className="w-14 h-14 rounded-lg flex flex-col items-center justify-center"
              >
                <span
                  className={`font-bold ${found?.includes(idx) || idx === currentIndex ? "text-black" : "text-white"}`}
                >
                  {num}
                </span>
                <span className="text-xs text-gray-400">i={idx}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Hash Map visualization */}
        <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
          <div className="text-sm text-gray-400 mb-2">
            Hash Map (value → index):
          </div>
          <div className="flex gap-2 flex-wrap min-h-[40px]">
            <AnimatePresence>
              {hashMap.length === 0 ? (
                <span className="text-gray-500 text-sm">{}</span>
              ) : (
                hashMap.map((entry) => (
                  <motion.div
                    key={entry.value}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      backgroundColor:
                        entry.value === complement ? "#eab308" : "#4b5563",
                    }}
                    className="px-3 py-1 rounded-lg text-sm font-mono"
                  >
                    <span
                      className={
                        entry.value === complement ? "text-black" : "text-white"
                      }
                    >
                      {entry.value}
                    </span>
                    <span
                      className={
                        entry.value === complement
                          ? "text-black/70"
                          : "text-gray-400"
                      }
                    >
                      {" → "}
                    </span>
                    <span
                      className={
                        entry.value === complement
                          ? "text-black"
                          : "text-green-400"
                      }
                    >
                      {entry.index}
                    </span>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Result */}
        {found && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-center"
          >
            <span className="text-green-400 font-bold text-lg">
              nums[{found[0]}] + nums[{found[1]}] = {nums[found[0]]} +{" "}
              {nums[found[1]]} = {target}
            </span>
          </motion.div>
        )}

        {/* Message */}
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-lg text-sm ${
            phase === "done"
              ? found
                ? "bg-green-500/10 border border-green-500/30 text-green-400"
                : "bg-red-500/10 border border-red-500/30 text-red-400"
              : "bg-gray-800 text-gray-300"
          }`}
        >
          {message}
        </motion.div>

        {/* Key insight */}
        <div className="mt-4 p-3 bg-gray-800/30 rounded-lg text-sm text-gray-400">
          <p>
            <strong className="text-pink-400">Key Insight:</strong> For each
            number, check if its complement (target - num) exists in the map.
            This trades O(n) space for O(1) lookup time.
          </p>
        </div>
      </div>
    </div>
  );
}
