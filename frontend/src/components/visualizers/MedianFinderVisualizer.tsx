"use client";

import React, { useState, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Step {
  type:
    "process" | "add" | "move" | "rebalance" | "balanced" | "median" | "done";
  num: number;
  maxHeap: number[];
  minHeap: number[];
  median: number | null;
  message: string;
  inputIndex: number;
}

export default function MedianFinderVisualizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [stepIndex, setStepIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const nums = useMemo(() => [2, 3, 4, 1, 5, 6], []);

  // Generate all steps upfront for clearer visualization
  const steps = useMemo(() => {
    const allSteps: Step[] = [];
    const maxHeap: number[] = [];
    const minHeap: number[] = [];
    let currentMedian: number | null = null;

    for (let i = 0; i < nums.length; i++) {
      const num = nums[i];

      // Step 1: Show we're processing this number
      allSteps.push({
        type: "process",
        num,
        maxHeap: [...maxHeap],
        minHeap: [...minHeap],
        median: currentMedian,
        message: `Processing ${num}...`,
        inputIndex: i,
      });

      // Step 2: Add to maxHeap (small half) first
      maxHeap.push(num);
      maxHeap.sort((a, b) => b - a); // max heap: largest first
      allSteps.push({
        type: "add",
        num,
        maxHeap: [...maxHeap],
        minHeap: [...minHeap],
        median: currentMedian,
        message: `Step 1: Add ${num} to maxHeap (small half). MaxHeap = [${maxHeap.join(", ")}]`,
        inputIndex: i,
      });

      // Step 3: Move largest of maxHeap to minHeap
      const moved = maxHeap.shift()!;
      minHeap.push(moved);
      minHeap.sort((a, b) => a - b); // min heap: smallest first
      allSteps.push({
        type: "move",
        num: moved,
        maxHeap: [...maxHeap],
        minHeap: [...minHeap],
        median: currentMedian,
        message: `Step 2: Move largest (${moved}) from maxHeap to minHeap. Ensures partition: all in maxHeap ≤ all in minHeap.`,
        inputIndex: i,
      });

      // Step 4: Rebalance if needed
      if (minHeap.length > maxHeap.length) {
        const movedBack = minHeap.shift()!;
        maxHeap.push(movedBack);
        maxHeap.sort((a, b) => b - a);
        allSteps.push({
          type: "rebalance",
          num: movedBack,
          maxHeap: [...maxHeap],
          minHeap: [...minHeap],
          median: currentMedian,
          message: `Step 3: Rebalance! minHeap is larger, move ${movedBack} back to maxHeap.`,
          inputIndex: i,
        });
      } else {
        allSteps.push({
          type: "balanced",
          num,
          maxHeap: [...maxHeap],
          minHeap: [...minHeap],
          median: currentMedian,
          message: `Step 3: Heaps are balanced! (maxHeap.size ≥ minHeap.size)`,
          inputIndex: i,
        });
      }

      // Step 5: Calculate median
      if (maxHeap.length > minHeap.length) {
        currentMedian = maxHeap[0];
        allSteps.push({
          type: "median",
          num,
          maxHeap: [...maxHeap],
          minHeap: [...minHeap],
          median: currentMedian,
          message: `Median: Odd count (${maxHeap.length + minHeap.length}), median = maxHeap.top = ${currentMedian}`,
          inputIndex: i,
        });
      } else {
        currentMedian = (maxHeap[0] + minHeap[0]) / 2;
        allSteps.push({
          type: "median",
          num,
          maxHeap: [...maxHeap],
          minHeap: [...minHeap],
          median: currentMedian,
          message: `Median: Even count (${maxHeap.length + minHeap.length}), median = (${maxHeap[0]} + ${minHeap[0]}) / 2 = ${currentMedian}`,
          inputIndex: i,
        });
      }
    }

    // Final step
    allSteps.push({
      type: "done",
      num: 0,
      maxHeap: [...maxHeap],
      minHeap: [...minHeap],
      median: currentMedian,
      message: `Done! Final median: ${currentMedian}. MaxHeap (small): [${maxHeap.join(", ")}], MinHeap (large): [${minHeap.join(", ")}]`,
      inputIndex: nums.length - 1,
    });

    return allSteps;
  }, [nums]);

  const reset = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setStepIndex(0);
    setIsPlaying(false);
  }, []);

  // Auto-advance when playing
  const advanceStep = useCallback(() => {
    setStepIndex((prev) => {
      const next = prev + 1;
      if (next >= steps.length - 1) {
        setIsPlaying(false);
        return steps.length - 1;
      }
      return next;
    });
  }, [steps.length]);

  // Timer effect for auto-play
  React.useEffect(() => {
    if (isPlaying && stepIndex < steps.length - 1) {
      timerRef.current = setTimeout(advanceStep, speed);
      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }
  }, [isPlaying, stepIndex, steps.length, speed, advanceStep]);

  const currentStep = steps[stepIndex] || {
    type: "process",
    num: 0,
    maxHeap: [],
    minHeap: [],
    median: null,
    message: "Click Play or Step to find running median",
    inputIndex: -1,
  };

  const getArrayCellStyle = (index: number) => {
    if (currentStep.type === "done") return "bg-gray-600 text-gray-400";
    if (index === currentStep.inputIndex && currentStep.type === "process")
      return "bg-yellow-500 text-black ring-2 ring-yellow-300";
    if (
      index < currentStep.inputIndex ||
      (index === currentStep.inputIndex && currentStep.type !== "process")
    )
      return "bg-gray-600 text-gray-400";
    return "bg-gray-700 text-gray-300";
  };

  const getMessageStyle = () => {
    switch (currentStep.type) {
      case "done":
        return "bg-green-500/10 border border-green-500/30 text-green-400";
      case "rebalance":
      case "balanced":
        return "bg-yellow-500/10 border border-yellow-500/30 text-yellow-400";
      case "median":
        return "bg-rose-500/10 border border-rose-500/30 text-rose-400";
      case "add":
        return "bg-blue-500/10 border border-blue-500/30 text-blue-400";
      case "move":
        return "bg-green-500/10 border border-green-500/30 text-green-400";
      default:
        return "bg-gray-800 text-gray-300";
    }
  };

  return (
    <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
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
            disabled={currentStep.type === "done"}
            className={`px-4 py-2 rounded-md font-medium transition ${
              isPlaying ? "bg-yellow-500 text-black" : "bg-green-500 text-white"
            } disabled:opacity-50`}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            onClick={() =>
              setStepIndex(Math.min(stepIndex + 1, steps.length - 1))
            }
            disabled={stepIndex >= steps.length - 1}
            className="px-4 py-2 bg-gray-700 text-white rounded-md font-medium hover:bg-gray-600 disabled:opacity-50"
          >
            Step
          </button>
          <button
            onClick={reset}
            className="px-4 py-2 bg-gray-700 text-white rounded-md font-medium hover:bg-gray-600"
          >
            Reset
          </button>
          <div className="flex items-center gap-2 ml-4">
            <span className="text-gray-400 text-sm">Speed:</span>
            <input
              type="range"
              min="400"
              max="2000"
              step="100"
              value={2400 - speed}
              onChange={(e) => setSpeed(2400 - Number(e.target.value))}
              className="w-20 accent-rose-500"
            />
          </div>
        </div>

        {/* Input Stream */}
        <div className="mb-6">
          <div className="text-sm text-gray-400 mb-2 flex items-center gap-2">
            <span>Input stream:</span>
            <code className="bg-gray-800 px-2 py-0.5 rounded text-rose-400">
              [{nums.join(", ")}]
            </code>
          </div>
          <div className="flex gap-2">
            {nums.map((num, idx) => (
              <motion.div
                key={`num-${idx}`}
                animate={{
                  scale:
                    idx === currentStep.inputIndex &&
                    currentStep.type === "process"
                      ? 1.15
                      : 1,
                  y:
                    idx === currentStep.inputIndex &&
                    currentStep.type === "process"
                      ? -8
                      : 0,
                }}
                className={`w-12 h-12 rounded-md flex items-center justify-center font-mono text-lg font-bold transition-colors ${getArrayCellStyle(idx)}`}
              >
                {num}
              </motion.div>
            ))}
          </div>
          <div className="flex gap-2 mt-1">
            {nums.map((_, idx) => (
              <div
                key={`idx-${idx}`}
                className="w-12 text-center text-xs text-gray-500"
              >
                [{idx}]
              </div>
            ))}
          </div>
        </div>

        {/* Two Heaps Visualization */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Max Heap (Left Half) */}
          <div className="bg-gray-800/50 rounded-md p-4">
            <div className="text-sm text-gray-400 mb-2 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              MaxHeap (Left Half - Smaller)
            </div>
            <div className="flex flex-col items-center min-h-[120px] pt-6">
              <AnimatePresence mode="wait">
                {currentStep.maxHeap.length > 0 ? (
                  <motion.div
                    key={`maxheap-${currentStep.maxHeap.join("-")}`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="flex flex-col items-center"
                  >
                    {/* Root (max) */}
                    <motion.div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xl relative">
                      {currentStep.maxHeap[0]}
                      <span className="absolute -top-6 text-xs text-blue-400">
                        max
                      </span>
                    </motion.div>
                    {/* Children */}
                    {currentStep.maxHeap.length > 1 && (
                      <div className="flex gap-4 mt-3">
                        {currentStep.maxHeap.slice(1).map((num, i) => (
                          <motion.div
                            key={`max-child-${i}-${num}`}
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
              Size: {currentStep.maxHeap.length}
            </div>
          </div>

          {/* Min Heap (Right Half) */}
          <div className="bg-gray-800/50 rounded-md p-4">
            <div className="text-sm text-gray-400 mb-2 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              MinHeap (Right Half - Larger)
            </div>
            <div className="flex flex-col items-center min-h-[120px] pt-6">
              <AnimatePresence mode="wait">
                {currentStep.minHeap.length > 0 ? (
                  <motion.div
                    key={`minheap-${currentStep.minHeap.join("-")}`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="flex flex-col items-center"
                  >
                    {/* Root (min) */}
                    <motion.div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xl relative">
                      {currentStep.minHeap[0]}
                      <span className="absolute -top-6 text-xs text-green-400">
                        min
                      </span>
                    </motion.div>
                    {/* Children */}
                    {currentStep.minHeap.length > 1 && (
                      <div className="flex gap-4 mt-3">
                        {currentStep.minHeap.slice(1).map((num, i) => (
                          <motion.div
                            key={`min-child-${i}-${num}`}
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
              Size: {currentStep.minHeap.length}
            </div>
          </div>
        </div>

        {/* Current Median */}
        <div className="mb-4 p-4 bg-gradient-to-r from-rose-500/10 to-pink-500/10 rounded-md border border-rose-500/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500">Current Median</div>
              <div className="text-3xl font-bold text-rose-400">
                {currentStep.median !== null ? currentStep.median : "-"}
              </div>
            </div>
            <div className="text-right text-sm text-gray-400">
              <div>maxHeap.top: {currentStep.maxHeap[0] ?? "-"}</div>
              <div>minHeap.top: {currentStep.minHeap[0] ?? "-"}</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {currentStep.maxHeap.length}
            </div>
            <div className="text-xs text-gray-500">Left Size</div>
          </div>
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-2xl font-bold text-green-400">
              {currentStep.minHeap.length}
            </div>
            <div className="text-xs text-gray-500">Right Size</div>
          </div>
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {stepIndex}/{steps.length - 1}
            </div>
            <div className="text-xs text-gray-500">Step</div>
          </div>
        </div>

        {/* Message */}
        <AnimatePresence mode="wait">
          <motion.div
            key={stepIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-3 rounded-md text-sm ${getMessageStyle()}`}
          >
            {currentStep.message}
          </motion.div>
        </AnimatePresence>

        {/* Algorithm explanation */}
        <div className="mt-4 p-3 bg-gray-800/30 rounded-md text-sm text-gray-400 space-y-2">
          <p>
            <strong className="text-rose-400">
              Algorithm (3 steps per number):
            </strong>
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>
              <strong>Step 1:</strong> Add number to maxHeap (small half)
            </li>
            <li>
              <strong>Step 2:</strong> Move max of maxHeap to minHeap (ensures
              partition)
            </li>
            <li>
              <strong>Step 3:</strong> If minHeap is larger, move its min back
              to maxHeap (balance)
            </li>
            <li>
              <strong>Median:</strong> If odd count → maxHeap.top; if even →
              average of both tops
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
