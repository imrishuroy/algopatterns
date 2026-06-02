"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function KthLargestVisualizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [heap, setHeap] = useState<number[]>([]);
  const [message, setMessage] = useState(
    "Click Play to find the 3rd largest element"
  );
  const [phase, setPhase] = useState<"init" | "processing" | "done">("init");
  const [lastAction, setLastAction] = useState<"add" | "remove" | null>(null);

  const nums = [3, 2, 1, 5, 6, 4];
  const k = 3;

  const reset = useCallback(() => {
    setCurrentIndex(0);
    setHeap([]);
    setPhase("init");
    setMessage(`Click Play to find the ${k}rd largest element`);
    setLastAction(null);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (currentIndex >= nums.length) {
        setPhase("done");
        setMessage(`Done! The ${k}rd largest element is ${heap[0]}`);
        setIsPlaying(false);
        return;
      }

      const num = nums[currentIndex];
      const newHeap = [...heap];

      if (newHeap.length < k) {
        newHeap.push(num);
        newHeap.sort((a, b) => a - b);
        setHeap(newHeap);
        setLastAction("add");
        setMessage(
          `Added ${num} to heap. Heap size ${newHeap.length} < k=${k}, so we keep it.`
        );
      } else if (num > newHeap[0]) {
        const removed = newHeap.shift()!;
        newHeap.push(num);
        newHeap.sort((a, b) => a - b);
        setHeap(newHeap);
        setLastAction("add");
        setMessage(
          `${num} > heap min (${removed}). Removed ${removed}, added ${num}. Heap now: [${newHeap.join(", ")}]`
        );
      } else {
        setLastAction(null);
        setMessage(
          `${num} <= heap min (${newHeap[0]}). Skip - not in top ${k}.`
        );
      }

      setCurrentIndex(currentIndex + 1);
    }, speed);

    return () => clearTimeout(timer);
  }, [isPlaying, currentIndex, heap, speed]);

  const getArrayCellStyle = (index: number) => {
    if (index === currentIndex) return "bg-yellow-500 text-black";
    if (index < currentIndex) return "bg-gray-600 text-gray-400";
    return "bg-gray-700 text-gray-300";
  };

  const isInHeap = (num: number, index: number) => {
    if (index >= currentIndex) return false;
    return heap.includes(num);
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">
          Kth Largest Element
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Use min-heap of size K - root is the Kth largest
        </p>
      </div>

      <div className="p-4">
        {/* K value display */}
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-gray-800 rounded-lg px-4 py-2">
            <span className="text-gray-400 text-sm">k = </span>
            <span className="text-2xl font-bold text-amber-400">{k}</span>
          </div>
          <div className="text-gray-400 text-sm">
            Finding the{" "}
            <span className="text-amber-400 font-bold">{k}rd largest</span>{" "}
            element
          </div>
        </div>

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
              min="400"
              max="1500"
              step="100"
              value={1900 - speed}
              onChange={(e) => setSpeed(1900 - Number(e.target.value))}
              className="w-20 accent-amber-500"
            />
          </div>
        </div>

        {/* Array Visualization */}
        <div className="mb-6">
          <div className="text-sm text-gray-400 mb-2">
            Input array: [{nums.join(", ")}]
          </div>
          <div className="flex gap-2">
            {nums.map((num, idx) => (
              <motion.div
                key={`num-${num}-${idx}`}
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

        {/* Min-Heap Visualization */}
        <div className="mb-6">
          <div className="text-sm text-gray-400 mb-2">
            Min-Heap (size ≤ {k}): Contains {k} largest seen so far
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 min-h-[100px]">
            {/* Tree-like visualization */}
            <div className="flex flex-col items-center gap-2">
              <AnimatePresence>
                {heap.length > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex flex-col items-center"
                  >
                    {/* Root */}
                    <motion.div
                      key={heap[0]}
                      className="w-14 h-14 rounded-full bg-amber-500 flex items-center justify-center text-black font-bold text-xl relative"
                    >
                      {heap[0]}
                      <span className="absolute -top-5 text-xs text-amber-400">
                        min (root)
                      </span>
                    </motion.div>

                    {/* Children */}
                    {heap.length > 1 && (
                      <div className="flex gap-8 mt-4">
                        {heap.slice(1).map((num, i) => (
                          <motion.div
                            key={`${num}-${i}`}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-12 h-12 rounded-full bg-orange-500/70 flex items-center justify-center text-white font-bold text-lg"
                          >
                            {num}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              {heap.length === 0 && (
                <span className="text-gray-500">
                  Empty - will store top {k} largest
                </span>
              )}
            </div>

            {/* Array representation */}
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="text-xs text-gray-500 mb-2">
                Array representation:
              </div>
              <div className="flex gap-1">
                {heap.map((num, i) => (
                  <span
                    key={`heap-${num}-${i}`}
                    className={`px-2 py-1 rounded text-sm font-mono ${
                      i === 0
                        ? "bg-amber-500 text-black"
                        : "bg-gray-700 text-gray-300"
                    }`}
                  >
                    {num}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-amber-400">
              {heap.length}
            </div>
            <div className="text-xs text-gray-500">Heap Size</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-400">
              {heap[0] ?? "-"}
            </div>
            <div className="text-xs text-gray-500">Heap Min (Kth Largest)</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-400">
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
              : lastAction === "add"
                ? "bg-amber-500/10 border border-amber-500/30 text-amber-400"
                : "bg-gray-800 text-gray-300"
          }`}
        >
          {message}
        </motion.div>

        {/* Algorithm explanation */}
        <div className="mt-4 p-3 bg-gray-800/30 rounded-lg text-sm text-gray-400">
          <p>
            <strong className="text-amber-400">Key Insight:</strong> Use a
            MIN-heap of size K. The smallest element in the heap is the Kth
            largest overall. If a new number is larger than the heap&apos;s min,
            swap them.
          </p>
        </div>
      </div>
    </div>
  );
}
