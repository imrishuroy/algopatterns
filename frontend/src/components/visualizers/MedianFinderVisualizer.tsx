"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function MedianFinderVisualizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [maxHeap, setMaxHeap] = useState<number[]>([]); // left half (smaller numbers)
  const [minHeap, setMinHeap] = useState<number[]>([]); // right half (larger numbers)
  const [median, setMedian] = useState<number | null>(null);
  const [phase, setPhase] = useState<
    "init" | "adding" | "balancing" | "calculating" | "done"
  >("init");
  const [message, setMessage] = useState("Click Play to find running median");

  const nums = [2, 3, 4, 1, 5, 6];

  const reset = useCallback(() => {
    setCurrentIndex(0);
    setMaxHeap([]);
    setMinHeap([]);
    setMedian(null);
    setPhase("init");
    setMessage("Click Play to find running median using Two Heaps");
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (currentIndex >= nums.length) {
        setPhase("done");
        setMessage(`Done! Final median: ${median}`);
        setIsPlaying(false);
        return;
      }

      const num = nums[currentIndex];

      if (phase === "init" || phase === "calculating") {
        setPhase("adding");
        const newMaxHeap = [...maxHeap];
        const newMinHeap = [...minHeap];

        // Add to appropriate heap
        if (maxHeap.length === 0 || num <= maxHeap[0]) {
          newMaxHeap.push(num);
          newMaxHeap.sort((a, b) => b - a); // max heap: largest first
          setMaxHeap(newMaxHeap);
          setMessage(
            `Adding ${num}: Since ${maxHeap.length === 0 ? "maxHeap is empty" : `${num} <= maxHeap top (${maxHeap[0]})`}, add to maxHeap (left half)`
          );
        } else {
          newMinHeap.push(num);
          newMinHeap.sort((a, b) => a - b); // min heap: smallest first
          setMinHeap(newMinHeap);
          setMessage(
            `Adding ${num}: Since ${num} > maxHeap top (${maxHeap[0]}), add to minHeap (right half)`
          );
        }
      } else if (phase === "adding") {
        setPhase("balancing");
        const newMaxHeap = [...maxHeap];
        const newMinHeap = [...minHeap];

        // Balance heaps: maxHeap can have at most 1 more element than minHeap
        if (newMaxHeap.length > newMinHeap.length + 1) {
          const moved = newMaxHeap.shift()!;
          newMinHeap.push(moved);
          newMinHeap.sort((a, b) => a - b);
          setMaxHeap(newMaxHeap);
          setMinHeap(newMinHeap);
          setMessage(`Balancing: maxHeap too large, move ${moved} to minHeap`);
        } else if (newMinHeap.length > newMaxHeap.length) {
          const moved = newMinHeap.shift()!;
          newMaxHeap.push(moved);
          newMaxHeap.sort((a, b) => b - a);
          setMaxHeap(newMaxHeap);
          setMinHeap(newMinHeap);
          setMessage(`Balancing: minHeap too large, move ${moved} to maxHeap`);
        } else {
          setMessage("Heaps are balanced!");
        }
      } else if (phase === "balancing") {
        setPhase("calculating");
        // Calculate median
        let newMedian: number;
        if (maxHeap.length > minHeap.length) {
          newMedian = maxHeap[0];
          setMessage(
            `Median: maxHeap has more elements, median = maxHeap top = ${newMedian}`
          );
        } else {
          newMedian = (maxHeap[0] + minHeap[0]) / 2;
          setMessage(
            `Median: Equal sizes, median = (${maxHeap[0]} + ${minHeap[0]}) / 2 = ${newMedian}`
          );
        }
        setMedian(newMedian);
        setCurrentIndex(currentIndex + 1);
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [isPlaying, currentIndex, phase, maxHeap, minHeap, median, speed]);

  const getArrayCellStyle = (index: number) => {
    if (index === currentIndex)
      return "bg-yellow-500 text-black ring-2 ring-yellow-300";
    if (index < currentIndex) return "bg-gray-600 text-gray-400";
    return "bg-gray-700 text-gray-300";
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-rose-500/10 to-pink-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">
          Find Median from Data Stream
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Two Heaps: maxHeap for left half, minHeap for right half
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
              max="2000"
              step="100"
              value={2500 - speed}
              onChange={(e) => setSpeed(2500 - Number(e.target.value))}
              className="w-20 accent-rose-500"
            />
          </div>
        </div>

        {/* Input Stream */}
        <div className="mb-6">
          <div className="text-sm text-gray-400 mb-2">
            Input stream: [{nums.join(", ")}]
          </div>
          <div className="flex gap-2">
            {nums.map((num, idx) => (
              <motion.div
                key={`idx-${idx}`}
                animate={{
                  scale: idx === currentIndex ? 1.1 : 1,
                  y: idx === currentIndex ? -5 : 0,
                }}
                className={`w-12 h-12 rounded-lg flex items-center justify-center font-mono text-lg font-bold transition-colors ${getArrayCellStyle(idx)}`}
              >
                {num}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Two Heaps Visualization */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Max Heap (Left Half) */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-2 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              MaxHeap (Left Half - Smaller)
            </div>
            <div className="flex flex-col items-center min-h-[100px]">
              <AnimatePresence>
                {maxHeap.length > 0 ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex flex-col items-center"
                  >
                    {/* Root (max) */}
                    <motion.div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xl relative">
                      {maxHeap[0]}
                      <span className="absolute -top-5 text-xs text-blue-400">
                        max
                      </span>
                    </motion.div>
                    {/* Children */}
                    {maxHeap.length > 1 && (
                      <div className="flex gap-4 mt-3">
                        {maxHeap.slice(1).map((num, i) => (
                          <motion.div
                            key={`${num}-${i}`}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-10 h-10 rounded-full bg-blue-500/60 flex items-center justify-center text-white font-bold"
                          >
                            {num}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <span className="text-gray-500 text-sm">Empty</span>
                )}
              </AnimatePresence>
            </div>
            <div className="text-center text-xs text-gray-500 mt-2">
              Size: {maxHeap.length}
            </div>
          </div>

          {/* Min Heap (Right Half) */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-2 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              MinHeap (Right Half - Larger)
            </div>
            <div className="flex flex-col items-center min-h-[100px]">
              <AnimatePresence>
                {minHeap.length > 0 ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex flex-col items-center"
                  >
                    {/* Root (min) */}
                    <motion.div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xl relative">
                      {minHeap[0]}
                      <span className="absolute -top-5 text-xs text-green-400">
                        min
                      </span>
                    </motion.div>
                    {/* Children */}
                    {minHeap.length > 1 && (
                      <div className="flex gap-4 mt-3">
                        {minHeap.slice(1).map((num, i) => (
                          <motion.div
                            key={`${num}-${i}`}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-10 h-10 rounded-full bg-green-500/60 flex items-center justify-center text-white font-bold"
                          >
                            {num}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <span className="text-gray-500 text-sm">Empty</span>
                )}
              </AnimatePresence>
            </div>
            <div className="text-center text-xs text-gray-500 mt-2">
              Size: {minHeap.length}
            </div>
          </div>
        </div>

        {/* Current Median */}
        <div className="mb-4 p-4 bg-gradient-to-r from-rose-500/10 to-pink-500/10 rounded-lg border border-rose-500/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500">Current Median</div>
              <div className="text-3xl font-bold text-rose-400">
                {median !== null ? median : "-"}
              </div>
            </div>
            <div className="text-right text-sm text-gray-400">
              <div>maxHeap.top: {maxHeap[0] ?? "-"}</div>
              <div>minHeap.top: {minHeap[0] ?? "-"}</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {maxHeap.length}
            </div>
            <div className="text-xs text-gray-500">Left Size</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-400">
              {minHeap.length}
            </div>
            <div className="text-xs text-gray-500">Right Size</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {currentIndex}/{nums.length}
            </div>
            <div className="text-xs text-gray-500">Processed</div>
          </div>
        </div>

        {/* Message */}
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-lg text-sm ${
            phase === "done"
              ? "bg-green-500/10 border border-green-500/30 text-green-400"
              : phase === "balancing"
                ? "bg-yellow-500/10 border border-yellow-500/30 text-yellow-400"
                : "bg-gray-800 text-gray-300"
          }`}
        >
          {message}
        </motion.div>

        {/* Algorithm explanation */}
        <div className="mt-4 p-3 bg-gray-800/30 rounded-lg text-sm text-gray-400">
          <p>
            <strong className="text-rose-400">Key Insight:</strong> Keep two
            heaps balanced. MaxHeap stores smaller half, MinHeap stores larger
            half. Median is either maxHeap.top (odd count) or average of both
            tops (even count).
          </p>
        </div>
      </div>
    </div>
  );
}
