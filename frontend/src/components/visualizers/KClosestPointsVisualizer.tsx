"use client";

import React, { useState, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Point {
  x: number;
  y: number;
  dist: number; // squared distance
}

interface Step {
  type: "process" | "compare" | "add" | "remove" | "skip" | "done";
  point: Point;
  heap: Point[];
  message: string;
  highlight?: "current" | "root" | "swap";
  removed?: Point;
}

// skipcq: JS-0067
export default function KClosestPointsVisualizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1200);
  const [stepIndex, setStepIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Example points (matches the text example)
  const rawPoints = useMemo(
    () => [
      [3, 3],
      [5, -1],
      [-2, 4],
    ],
    []
  );
  const k = 2;

  // Convert to Point objects with squared distance
  const points: Point[] = useMemo(
    () =>
      rawPoints.map(([x, y]) => ({
        x,
        y,
        dist: x * x + y * y,
      })),
    [rawPoints]
  );

  // Generate all steps upfront
  const steps = useMemo(() => {
    const allSteps: Step[] = [];
    const heap: Point[] = [];

    for (const point of points) {
      // Step 1: Show we're processing this point
      allSteps.push({
        type: "process",
        point,
        heap: [...heap],
        message: `Processing point [${point.x}, ${point.y}] with squared distance ${point.dist}...`,
        highlight: "current",
      });

      if (heap.length < k) {
        // Heap not full yet, add the point
        heap.push(point);
        heap.sort((a, b) => b.dist - a.dist); // Max-heap: furthest at front
        allSteps.push({
          type: "add",
          point,
          heap: [...heap],
          message: `Heap size (${heap.length}) < k (${k}). Add [${point.x}, ${point.y}] to heap.`,
          highlight: "current",
        });
      } else {
        // Heap is full, compare with max (root)
        const root = heap[0];
        allSteps.push({
          type: "compare",
          point,
          heap: [...heap],
          message: `Compare dist(${point.dist}) with heap max (${root.dist}). Is ${point.dist} < ${root.dist}?`,
          highlight: "root",
        });

        if (point.dist < root.dist) {
          const removed = heap.shift()!;
          heap.push(point);
          heap.sort((a, b) => b.dist - a.dist);
          allSteps.push({
            type: "remove",
            point,
            heap: [...heap],
            message: `Yes! ${point.dist} < ${removed.dist}. Remove [${removed.x}, ${removed.y}], add [${point.x}, ${point.y}].`,
            highlight: "swap",
            removed,
          });
        } else {
          allSteps.push({
            type: "skip",
            point,
            heap: [...heap],
            message: `No. ${point.dist} >= ${root.dist}. Skip [${point.x}, ${point.y}] (too far).`,
          });
        }
      }
    }

    // Final step
    allSteps.push({
      type: "done",
      point: heap[0],
      heap: [...heap],
      message: `Done! The ${k} closest points are shown in the heap.`,
    });

    return allSteps;
  }, [points, k]);

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
    point: points[0],
    heap: [],
    message: `Click Play to find the ${k} closest points`,
  };

  // Find which input point index we're on
  const getCurrentPointIndex = () => {
    let count = 0;
    for (let i = 0; i <= stepIndex; i++) {
      if (steps[i]?.type === "process") count++;
    }
    return Math.min(count - 1, points.length - 1);
  };

  const currentPointIndex = getCurrentPointIndex();

  // Check if a point is in the current heap
  const isInHeap = (point: Point) => {
    return currentStep.heap.some((p) => p.x === point.x && p.y === point.y);
  };

  // Coordinate grid visualization
  const gridSize = 160;
  const scale = gridSize / 12; // -6 to 6 range

  const toScreenX = (x: number) => gridSize / 2 + x * scale;
  const toScreenY = (y: number) => gridSize / 2 - y * scale; // Flip Y

  // Render heap as tree
  const renderHeapTree = (heap: Point[]) => {
    if (heap.length === 0) {
      return (
        <div className="flex items-center justify-center h-32 text-gray-500">
          Empty heap, will store {k} closest points
        </div>
      );
    }

    const root = heap[0];
    const leftChild = heap[1];
    const rightChild = heap[2];

    const isRootHighlighted =
      currentStep.highlight === "root" || currentStep.highlight === "swap";

    return (
      <div className="flex flex-col items-center pt-6 pb-2">
        {/* Root node */}
        <div className="relative">
          <motion.div
            key={`root-${root.x}-${root.y}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: isRootHighlighted ? 1.15 : 1,
              opacity: 1,
            }}
            className={`w-20 h-16 rounded-lg flex flex-col items-center justify-center font-bold relative z-10 ${
              isRootHighlighted
                ? "bg-red-500 text-white ring-4 ring-red-300"
                : "bg-orange-500 text-white"
            }`}
          >
            <span className="text-sm">
              [{root.x}, {root.y}]
            </span>
            <span className="text-xs opacity-80">dist: {root.dist}</span>
          </motion.div>
          {/* Label */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-orange-400 whitespace-nowrap">
            furthest of K closest
          </div>
        </div>

        {/* Connecting lines */}
        {heap.length > 1 && (
          <svg
            className="w-48 h-6"
            viewBox="0 0 192 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {leftChild !== undefined && (
              <line
                x1="96"
                y1="0"
                x2="48"
                y2="24"
                stroke="#6b7280"
                strokeWidth="2"
              />
            )}
            {rightChild !== undefined && (
              <line
                x1="96"
                y1="0"
                x2="144"
                y2="24"
                stroke="#6b7280"
                strokeWidth="2"
              />
            )}
          </svg>
        )}

        {/* Children */}
        {heap.length > 1 && (
          <div className="flex gap-8">
            {leftChild !== undefined ? (
              <motion.div
                key={`left-${leftChild.x}-${leftChild.y}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-18 h-14 rounded-lg bg-amber-500/80 flex flex-col items-center justify-center text-white font-bold text-sm px-2"
              >
                <span>
                  [{leftChild.x}, {leftChild.y}]
                </span>
                <span className="text-xs opacity-80">
                  dist: {leftChild.dist}
                </span>
              </motion.div>
            ) : (
              <div className="w-18 h-14" />
            )}
            {rightChild !== undefined ? (
              <motion.div
                key={`right-${rightChild.x}-${rightChild.y}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-18 h-14 rounded-lg bg-amber-500/80 flex flex-col items-center justify-center text-white font-bold text-sm px-2"
              >
                <span>
                  [{rightChild.x}, {rightChild.y}]
                </span>
                <span className="text-xs opacity-80">
                  dist: {rightChild.dist}
                </span>
              </motion.div>
            ) : (
              <div className="w-18 h-14" />
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">
          K Closest Points to Origin
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Use a MAX-heap of size K. The root (maximum distance) is the furthest
          of the K closest.
        </p>
      </div>

      <div className="p-4">
        {/* K value and explanation */}
        <div className="flex items-center gap-4 mb-4 p-3 bg-purple-500/10 rounded-md border border-purple-500/20">
          <div className="bg-gray-800 rounded-md px-4 py-2">
            <span className="text-gray-400 text-sm">k = </span>
            <span className="text-2xl font-bold text-purple-400">{k}</span>
          </div>
          <div className="text-sm text-purple-300">
            <strong>Goal:</strong> Find the{" "}
            <span className="text-purple-400 font-bold">{k} closest</span>{" "}
            points to origin.
            <br />
            <span className="text-gray-400">
              Strategy: Keep only the {k} closest in a max-heap. The furthest of
              these (the root) gets replaced when we find a closer point.
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
              className="w-20 accent-purple-500"
            />
          </div>
        </div>

        {/* Main visualization area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Coordinate Grid */}
          <div className="bg-gray-800/50 rounded-md p-4">
            <div className="text-sm text-gray-400 mb-2">Coordinate Plane:</div>
            <svg
              width={gridSize}
              height={gridSize}
              className="mx-auto"
              viewBox={`0 0 ${gridSize} ${gridSize}`}
            >
              {/* Grid lines */}
              <defs>
                <pattern
                  id="grid"
                  width={scale}
                  height={scale}
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d={`M ${scale} 0 L 0 0 0 ${scale}`}
                    fill="none"
                    stroke="#374151"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Axes */}
              <line
                x1="0"
                y1={gridSize / 2}
                x2={gridSize}
                y2={gridSize / 2}
                stroke="#6b7280"
                strokeWidth="1"
              />
              <line
                x1={gridSize / 2}
                y1="0"
                x2={gridSize / 2}
                y2={gridSize}
                stroke="#6b7280"
                strokeWidth="1"
              />

              {/* Origin label */}
              <circle
                cx={gridSize / 2}
                cy={gridSize / 2}
                r="4"
                fill="#ef4444"
              />
              <text
                x={gridSize / 2 + 8}
                y={gridSize / 2 - 8}
                fill="#ef4444"
                fontSize="10"
              >
                Origin
              </text>

              {/* Points */}
              {points.map((point, idx) => {
                const isCurrentProcessing =
                  idx === currentPointIndex && currentStep.type === "process";
                const inHeap = isInHeap(point);
                const wasRemoved =
                  currentStep.removed &&
                  currentStep.removed.x === point.x &&
                  currentStep.removed.y === point.y;

                let fill = "#6b7280"; // gray - not processed
                if (wasRemoved)
                  fill = "#ef4444"; // red - being removed
                else if (inHeap)
                  fill = "#22c55e"; // green - in heap
                else if (
                  idx < currentPointIndex ||
                  (idx === currentPointIndex && currentStep.type !== "process")
                )
                  fill = "#9ca3af"; // light gray - processed but not in heap
                if (isCurrentProcessing) fill = "#eab308"; // yellow - currently processing

                return (
                  <g key={`point-${idx}`}>
                    {/* Distance circle (when processing) */}
                    {isCurrentProcessing && (
                      <circle
                        cx={gridSize / 2}
                        cy={gridSize / 2}
                        r={Math.sqrt(point.dist) * scale}
                        fill="none"
                        stroke="#eab308"
                        strokeWidth="1"
                        strokeDasharray="4,4"
                        opacity="0.5"
                      />
                    )}
                    <motion.circle
                      cx={toScreenX(point.x)}
                      cy={toScreenY(point.y)}
                      r={isCurrentProcessing ? 8 : 6}
                      fill={fill}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                    />
                    <text
                      x={toScreenX(point.x)}
                      y={toScreenY(point.y) - 10}
                      fill={fill}
                      fontSize="8"
                      textAnchor="middle"
                    >
                      [{point.x},{point.y}]
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-gray-400">Processing</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-gray-400">In heap</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-gray-400">Removed</span>
              </div>
            </div>
          </div>

          {/* Heap visualization */}
          <div className="bg-gray-800/50 rounded-md p-4">
            <div className="text-sm text-gray-400 mb-2 flex items-center gap-2">
              <span>MAX-Heap (size &le; {k}):</span>
              <span className="text-purple-400">
                Contains the {k} closest seen so far
              </span>
            </div>
            <div className="min-h-[140px]">
              {renderHeapTree(currentStep.heap)}
            </div>
          </div>
        </div>

        {/* Input Points Table */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">Input points:</div>
          <div className="flex flex-wrap gap-3">
            {points.map((point, idx) => {
              const isCurrentProcessing =
                idx === currentPointIndex && currentStep.type === "process";
              const inHeap = isInHeap(point);

              let bgClass = "bg-gray-700 text-gray-300";
              if (isCurrentProcessing)
                bgClass = "bg-yellow-500 text-black ring-2 ring-yellow-300";
              else if (inHeap) bgClass = "bg-green-600 text-white";
              else if (
                idx < currentPointIndex ||
                (idx === currentPointIndex && currentStep.type !== "process")
              )
                bgClass = "bg-gray-600 text-gray-400";

              return (
                <motion.div
                  key={`input-${idx}`}
                  animate={{
                    scale: isCurrentProcessing ? 1.1 : 1,
                    y: isCurrentProcessing ? -4 : 0,
                  }}
                  className={`px-2 py-1.5 rounded-md font-mono text-xs transition-colors whitespace-nowrap ${bgClass}`}
                >
                  [{point.x}, {point.y}]{" "}
                  <span className="opacity-70">d={point.dist}</span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {currentStep.heap.length}/{k}
            </div>
            <div className="text-xs text-gray-500">Heap Size</div>
          </div>
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-2xl font-bold text-orange-400">
              {currentStep.heap[0]?.dist ?? "-"}
            </div>
            <div className="text-xs text-gray-500">
              Heap Max (furthest of K)
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {Math.max(0, currentPointIndex + 1)}/{points.length}
            </div>
            <div className="text-xs text-gray-500">Points Processed</div>
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
                  ? "bg-purple-500/10 border border-purple-500/30 text-purple-400"
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
            <strong className="text-purple-400">
              Why MAX-heap for K CLOSEST?
            </strong>
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>
              We keep exactly K elements in the heap (the K closest seen so
              far).
            </li>
            <li>
              The root of the max-heap is the <em>furthest</em> of these K
              elements.
            </li>
            <li>
              When a new point is closer than the root, it deserves to be in the
              top K, so we swap.
            </li>
            <li>
              <strong>Optimization:</strong> Compare squared distances to skip
              expensive sqrt calculations.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
