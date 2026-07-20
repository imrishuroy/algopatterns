"use client";

import React, { useState, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Step {
  type: "process" | "compare" | "add" | "remove" | "skip" | "done";
  num: number;
  heap: number[];
  message: string;
  highlight?: "current" | "root" | "swap";
  removed?: number;
}

export default function KthLargestVisualizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [stepIndex, setStepIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const nums = useMemo(() => [3, 2, 1, 5, 6, 4], []);
  const k = 3;

  // Generate all steps upfront for clearer visualization
  const steps = useMemo(() => {
    const allSteps: Step[] = [];
    const heap: number[] = [];

    for (let i = 0; i < nums.length; i++) {
      const num = nums[i];

      // Step 1: Show we're processing this number
      allSteps.push({
        type: "process",
        num,
        heap: [...heap],
        message: `Processing ${num}...`,
        highlight: "current",
      });

      if (heap.length < k) {
        // Heap not full yet, add the number
        heap.push(num);
        heap.sort((a, b) => a - b); // Min-heap: smallest at front
        allSteps.push({
          type: "add",
          num,
          heap: [...heap],
          message: `Heap size (${heap.length}) < k (${k}). Add ${num} to heap. Heap: [${heap.join(", ")}]`,
          highlight: "current",
        });
      } else {
        // Heap is full, compare with min (root)
        allSteps.push({
          type: "compare",
          num,
          heap: [...heap],
          message: `Compare ${num} with heap min (${heap[0]}). Is ${num} > ${heap[0]}?`,
          highlight: "root",
        });

        if (num > heap[0]) {
          const removed = heap.shift()!;
          heap.push(num);
          heap.sort((a, b) => a - b);
          allSteps.push({
            type: "remove",
            num,
            heap: [...heap],
            message: `Yes! ${num} > ${removed}. Remove ${removed}, add ${num}. New heap: [${heap.join(", ")}]`,
            highlight: "swap",
            removed,
          });
        } else {
          allSteps.push({
            type: "skip",
            num,
            heap: [...heap],
            message: `No. ${num} <= ${heap[0]}. Skip ${num} (not in top ${k}).`,
          });
        }
      }
    }

    // Final step
    allSteps.push({
      type: "done",
      num: heap[0],
      heap: [...heap],
      message: `Done! The ${k}rd largest element is ${heap[0]} (the min of the ${k} largest elements).`,
    });

    return allSteps;
  }, [nums, k]);

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
    heap: [],
    message: `Click Play to find the ${k}rd largest element`,
  };

  // Find which input array index we're on
  const getCurrentInputIndex = () => {
    let count = 0;
    for (let i = 0; i <= stepIndex; i++) {
      if (steps[i]?.type === "process") count++;
    }
    return Math.min(count - 1, nums.length - 1);
  };

  const currentInputIndex = getCurrentInputIndex();

  const getArrayCellStyle = (index: number) => {
    if (currentStep.type === "done") return "bg-gray-600 text-gray-400";
    if (index === currentInputIndex && currentStep.type === "process")
      return "bg-yellow-500 text-black ring-2 ring-yellow-300";
    if (
      index < currentInputIndex ||
      (index === currentInputIndex && currentStep.type !== "process")
    )
      return "bg-gray-600 text-gray-400";
    return "bg-gray-700 text-gray-300";
  };

  // Render heap as proper binary tree
  const renderHeapTree = (heap: number[]) => {
    if (heap.length === 0) {
      return (
        <div className="flex items-center justify-center h-32 text-gray-500">
          Empty heap - will store top {k} largest
        </div>
      );
    }

    // For a heap of size 3: root at [0], children at [1] and [2]
    // For larger heaps, we'd need more levels
    const root = heap[0];
    const leftChild = heap[1];
    const rightChild = heap[2];

    const isRootHighlighted =
      currentStep.highlight === "root" || currentStep.highlight === "swap";

    return (
      <div className="flex flex-col items-center py-4">
        {/* Root node */}
        <div className="relative">
          <motion.div
            key={`root-${root}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: isRootHighlighted ? 1.15 : 1,
              opacity: 1,
            }}
            className={`w-16 h-16 rounded-full flex flex-col items-center justify-center font-bold text-xl relative z-10 ${
              isRootHighlighted
                ? "bg-green-500 text-white ring-4 ring-green-300"
                : "bg-amber-500 text-black"
            }`}
          >
            {root}
            <span className="text-[10px] font-normal opacity-80">min</span>
          </motion.div>
          {/* Label */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-amber-400 whitespace-nowrap">
            Kth largest
          </div>
        </div>

        {/* Connecting lines */}
        {heap.length > 1 && (
          <svg
            className="w-48 h-8"
            viewBox="0 0 192 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {leftChild !== undefined && (
              <line
                x1="96"
                y1="0"
                x2="48"
                y2="32"
                stroke="#6b7280"
                strokeWidth="2"
              />
            )}
            {rightChild !== undefined && (
              <line
                x1="96"
                y1="0"
                x2="144"
                y2="32"
                stroke="#6b7280"
                strokeWidth="2"
              />
            )}
          </svg>
        )}

        {/* Children */}
        {heap.length > 1 && (
          <div className="flex gap-16">
            {leftChild !== undefined ? (
              <motion.div
                key={`left-${leftChild}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-14 h-14 rounded-full bg-orange-500/80 flex items-center justify-center text-white font-bold text-lg"
              >
                {leftChild}
              </motion.div>
            ) : (
              <div className="w-14 h-14" />
            )}
            {rightChild !== undefined ? (
              <motion.div
                key={`right-${rightChild}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-14 h-14 rounded-full bg-orange-500/80 flex items-center justify-center text-white font-bold text-lg"
              >
                {rightChild}
              </motion.div>
            ) : (
              <div className="w-14 h-14" />
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">
          Kth Largest Element
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Use a MIN-heap of size K. The root (minimum) is the Kth largest.
        </p>
      </div>

      <div className="p-4">
        {/* K value and explanation */}
        <div className="flex items-center gap-4 mb-4 p-3 bg-blue-500/10 rounded-md border border-blue-500/20">
          <div className="bg-gray-800 rounded-md px-4 py-2">
            <span className="text-gray-400 text-sm">k = </span>
            <span className="text-2xl font-bold text-amber-400">{k}</span>
          </div>
          <div className="text-sm text-blue-300">
            <strong>Goal:</strong> Find the{" "}
            <span className="text-amber-400 font-bold">{k}rd largest</span>{" "}
            element.
            <br />
            <span className="text-gray-400">
              Strategy: Keep only the {k} largest in a min-heap. The smallest of
              these (the root) is our answer.
            </span>
          </div>
        </div>

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
              className="w-20 accent-amber-500"
            />
          </div>
        </div>

        {/* Input Array */}
        <div className="mb-6">
          <div className="text-sm text-gray-400 mb-2 flex items-center gap-2">
            <span>Input array:</span>
            <code className="bg-gray-800 px-2 py-0.5 rounded text-amber-400">
              [{nums.join(", ")}]
            </code>
          </div>
          <div className="flex gap-2">
            {nums.map((num, idx) => (
              <motion.div
                key={`num-${idx}`}
                animate={{
                  scale:
                    idx === currentInputIndex && currentStep.type === "process"
                      ? 1.15
                      : 1,
                  y:
                    idx === currentInputIndex && currentStep.type === "process"
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

        {/* Min-Heap Visualization */}
        <div className="mb-6">
          <div className="text-sm text-gray-400 mb-2 flex items-center gap-2">
            <span>Min-Heap (size &le; {k}):</span>
            <span className="text-amber-400">
              Contains the {k} largest seen so far
            </span>
          </div>
          <div className="bg-gray-800/50 rounded-md p-4 min-h-[180px]">
            {/* Tree visualization */}
            {renderHeapTree(currentStep.heap)}

            {/* Array representation */}
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Array:</span>
                <div className="flex gap-1">
                  <span className="text-gray-500">[</span>
                  {currentStep.heap.map((num, i) => (
                    <span key={`heap-arr-${i}`} className="flex items-center">
                      <span
                        className={`px-2 py-0.5 rounded text-sm font-mono ${
                          i === 0
                            ? "bg-amber-500 text-black font-bold"
                            : "bg-gray-700 text-gray-300"
                        }`}
                      >
                        {num}
                      </span>
                      {i < currentStep.heap.length - 1 && (
                        <span className="text-gray-500 mx-0.5">,</span>
                      )}
                    </span>
                  ))}
                  <span className="text-gray-500">]</span>
                </div>
                {currentStep.heap.length > 0 && (
                  <span className="text-xs text-gray-500 ml-2">
                    (index 0 = root = min)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-2xl font-bold text-amber-400">
              {currentStep.heap.length}/{k}
            </div>
            <div className="text-xs text-gray-500">Heap Size</div>
          </div>
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-2xl font-bold text-green-400">
              {currentStep.heap[0] ?? "-"}
            </div>
            <div className="text-xs text-gray-500">Heap Min = Kth Largest</div>
          </div>
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {Math.max(0, currentInputIndex + 1)}/{nums.length}
            </div>
            <div className="text-xs text-gray-500">Elements Processed</div>
          </div>
        </div>

        {/* Message */}
        <AnimatePresence mode="wait">
          <motion.div
            key={stepIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-3 rounded-md text-sm ${
              currentStep.type === "done"
                ? "bg-green-500/10 border border-green-500/30 text-green-400"
                : currentStep.type === "add" || currentStep.type === "remove"
                  ? "bg-amber-500/10 border border-amber-500/30 text-amber-400"
                  : currentStep.type === "skip"
                    ? "bg-gray-700 border border-gray-600 text-gray-400"
                    : currentStep.type === "compare"
                      ? "bg-blue-500/10 border border-blue-500/30 text-blue-400"
                      : "bg-gray-800 text-gray-300"
            }`}
          >
            {currentStep.message}
          </motion.div>
        </AnimatePresence>

        {/* Algorithm explanation */}
        <div className="mt-4 p-3 bg-gray-800/30 rounded-md text-sm text-gray-400 space-y-2">
          <p>
            <strong className="text-amber-400">
              Why MIN-heap for K LARGEST?
            </strong>
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>
              We keep exactly K elements in the heap (the K largest seen so
              far).
            </li>
            <li>
              The root of the min-heap is the <em>smallest</em> of these K
              elements.
            </li>
            <li>This smallest of the K largest = the Kth largest overall!</li>
            <li>
              When a new number is bigger than the root, it deserves to be in
              the top K, so we swap.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
