"use client";

import React, { useState, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface HeapNode {
  value: number;
  listIndex: number;
  nodeIndex: number;
}

interface Step {
  type: "init" | "initialize" | "extract" | "add" | "exhausted" | "done";
  heap: HeapNode[];
  pointers: number[];
  result: number[];
  extracted?: HeapNode;
  added?: HeapNode;
  message: string;
}

const LIST_COLORS = ["bg-blue-500", "bg-green-500", "bg-purple-500"];

const INITIAL_LISTS = [
  [1, 4, 7],
  [2, 5, 8],
  [3, 6, 9],
];

const sortHeap = (h: HeapNode[]) => [...h].sort((a, b) => a.value - b.value);

// skipcq: JS-0067
export default function MergeKListsVisualizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [stepIndex, setStepIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Pre-compute all steps
  const steps = useMemo(() => {
    const allSteps: Step[] = [];
    const heap: HeapNode[] = [];
    const pointers: number[] = INITIAL_LISTS.map(() => 0);
    const result: number[] = [];

    // Initial state
    allSteps.push({
      type: "init",
      heap: [],
      pointers: [...pointers],
      result: [],
      message: "Click Play or Step to merge K sorted lists using min-heap",
    });

    // Initialize heap with first element from each list
    const initHeap: HeapNode[] = [];
    INITIAL_LISTS.forEach((list, i) => {
      if (list.length > 0) {
        initHeap.push({ value: list[0], listIndex: i, nodeIndex: 0 });
      }
    });
    heap.push(...sortHeap(initHeap));

    allSteps.push({
      type: "initialize",
      heap: [...heap],
      pointers: [...pointers],
      result: [],
      message: `Initialize heap with first element from each list: [${heap.map((n) => n.value).join(", ")}]`,
    });

    // Process until heap is empty
    while (heap.length > 0) {
      // Extract min
      const min = heap.shift()!;
      result.push(min.value);

      allSteps.push({
        type: "extract",
        heap: [...heap],
        pointers: [...pointers],
        result: [...result],
        extracted: min,
        message: `Extract min: ${min.value} from List ${min.listIndex + 1}. Add to result.`,
      });

      // Update pointer and add next element if available
      const { listIndex, nodeIndex } = min;
      const nextIndex = nodeIndex + 1;
      pointers[listIndex] = nextIndex;

      if (nextIndex < INITIAL_LISTS[listIndex].length) {
        const nextValue = INITIAL_LISTS[listIndex][nextIndex];
        const newNode = { value: nextValue, listIndex, nodeIndex: nextIndex };
        heap.push(newNode);
        heap.sort((a, b) => a.value - b.value);

        allSteps.push({
          type: "add",
          heap: [...heap],
          pointers: [...pointers],
          result: [...result],
          added: newNode,
          message: `Add next from List ${listIndex + 1}: ${nextValue}. Heap: [${heap.map((n) => n.value).join(", ")}]`,
        });
      } else {
        allSteps.push({
          type: "exhausted",
          heap: [...heap],
          pointers: [...pointers],
          result: [...result],
          message: `List ${listIndex + 1} exhausted. No more elements to add.`,
        });
      }
    }

    // Done
    allSteps.push({
      type: "done",
      heap: [],
      pointers: [...pointers],
      result: [...result],
      message: `Done! Merged result: [${result.join(", ")}]`,
    });

    return allSteps;
  }, []);

  const reset = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setStepIndex(0);
    setIsPlaying(false);
  }, []);

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  }, [isPlaying]);

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

  const currentStep = steps[stepIndex];

  return (
    <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">
          Merge K Sorted Lists
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Use min-heap to always get the smallest available element
        </p>
      </div>

      <div className="p-4">
        {/* Controls */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={handlePlayPause}
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
              max="1500"
              step="100"
              value={1900 - speed}
              onChange={(e) => setSpeed(1900 - Number(e.target.value))}
              className="w-20 accent-violet-500"
            />
          </div>
          <span className="text-gray-500 text-xs ml-2">
            Step {stepIndex + 1}/{steps.length}
          </span>
        </div>

        {/* K Sorted Lists */}
        <div className="mb-6">
          <div className="text-sm text-gray-400 mb-2">
            K = {INITIAL_LISTS.length} Sorted Lists:
          </div>
          <div className="space-y-2">
            {INITIAL_LISTS.map((list, listIdx) => (
              <div key={listIdx} className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-md ${LIST_COLORS[listIdx]} flex items-center justify-center text-white text-xs font-bold`}
                >
                  {listIdx + 1}
                </span>
                <div className="flex gap-1">
                  {list.map((num, nodeIdx) => (
                    <motion.div
                      key={nodeIdx}
                      animate={{
                        opacity:
                          nodeIdx < currentStep.pointers[listIdx] ? 0.3 : 1,
                        scale:
                          nodeIdx === currentStep.pointers[listIdx] ? 1.1 : 1,
                      }}
                      className={`w-10 h-10 rounded-md flex items-center justify-center font-mono font-bold transition-colors ${
                        nodeIdx < currentStep.pointers[listIdx]
                          ? "bg-gray-700 text-gray-500"
                          : nodeIdx === currentStep.pointers[listIdx]
                            ? `${LIST_COLORS[listIdx]} text-white ring-2 ring-white/50`
                            : "bg-gray-700 text-gray-300"
                      }`}
                    >
                      {num}
                    </motion.div>
                  ))}
                  {currentStep.pointers[listIdx] >= list.length && (
                    <span className="text-gray-500 text-sm ml-2 self-center">
                      exhausted
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Min-Heap */}
        <div className="mb-6">
          <div className="text-sm text-gray-400 mb-2">
            Min-Heap (current front pointers):
          </div>
          <div className="bg-gray-800/50 rounded-md p-4 pt-6 min-h-[80px]">
            <div className="flex flex-col items-center">
              <AnimatePresence>
                {currentStep.heap.length > 0 ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex flex-col items-center"
                  >
                    {/* Root (min) */}
                    <motion.div
                      className={`w-14 h-14 rounded-full ${LIST_COLORS[currentStep.heap[0].listIndex]} flex items-center justify-center text-white font-bold text-xl relative`}
                    >
                      {currentStep.heap[0].value}
                      <span className="absolute -top-5 text-xs text-violet-400">
                        min
                      </span>
                    </motion.div>
                    {/* Children */}
                    {currentStep.heap.length > 1 && (
                      <div className="flex gap-4 mt-3">
                        {currentStep.heap.slice(1).map((node, i) => (
                          <motion.div
                            key={`${node.value}-${node.listIndex}-${i}`}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`w-10 h-10 rounded-full ${LIST_COLORS[node.listIndex]}/70 flex items-center justify-center text-white font-bold`}
                          >
                            {node.value}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <span className="text-gray-500">
                    {currentStep.type === "done"
                      ? "All elements processed!"
                      : "Empty"}
                  </span>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Currently Extracted */}
        <AnimatePresence>
          {currentStep.extracted && currentStep.type === "extract" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-md"
            >
              <div className="flex items-center gap-3">
                <span className="text-yellow-400 text-sm">Extracted:</span>
                <span
                  className={`px-3 py-1 rounded-md ${LIST_COLORS[currentStep.extracted.listIndex]} text-white font-bold`}
                >
                  {currentStep.extracted.value}
                </span>
                <span className="text-gray-400 text-sm">
                  from List {currentStep.extracted.listIndex + 1}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">Merged Result:</div>
          <div className="bg-gray-800/50 rounded-md p-3 min-h-[50px]">
            <div className="flex gap-1 flex-wrap">
              <AnimatePresence>
                {currentStep.result.map((num, idx) => (
                  <motion.span
                    key={`result-${idx}`}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="px-3 py-1 bg-violet-500 text-white rounded-md font-mono font-bold"
                  >
                    {num}
                  </motion.span>
                ))}
              </AnimatePresence>
              {currentStep.result.length === 0 && (
                <span className="text-gray-500">
                  Elements will appear here...
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-2xl font-bold text-violet-400">
              {currentStep.heap.length}
            </div>
            <div className="text-xs text-gray-500">Heap Size</div>
          </div>
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-2xl font-bold text-green-400">
              {currentStep.result.length}
            </div>
            <div className="text-xs text-gray-500">Merged Count</div>
          </div>
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {INITIAL_LISTS.reduce((sum, l) => sum + l.length, 0) -
                currentStep.result.length}
            </div>
            <div className="text-xs text-gray-500">Remaining</div>
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
                : currentStep.type === "extract"
                  ? "bg-yellow-500/10 border border-yellow-500/30 text-yellow-400"
                  : currentStep.type === "add"
                    ? "bg-blue-500/10 border border-blue-500/30 text-blue-400"
                    : currentStep.type === "exhausted"
                      ? "bg-gray-700 border border-gray-600 text-gray-400"
                      : currentStep.type === "initialize"
                        ? "bg-violet-500/10 border border-violet-500/30 text-violet-400"
                        : "bg-gray-800 text-gray-300"
            }`}
          >
            {currentStep.message}
          </motion.div>
        </AnimatePresence>

        {/* Algorithm explanation */}
        <div className="mt-4 p-3 bg-gray-800/30 rounded-md text-sm text-gray-400">
          <p>
            <strong className="text-violet-400">Key Insight:</strong> Keep a
            min-heap of size K (one element from each list). Extract min, add to
            result, then push the next element from that list. Time: O(N log K)
            where N is total elements.
          </p>
        </div>
      </div>
    </div>
  );
}
