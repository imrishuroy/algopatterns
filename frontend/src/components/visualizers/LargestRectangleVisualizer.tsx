"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";

export default function LargestRectangleVisualizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(900);
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [stack, setStack] = useState<number[]>([]);
  const [maxArea, setMaxArea] = useState(0);
  const [currentArea, setCurrentArea] = useState<{
    height: number;
    width: number;
    area: number;
  } | null>(null);
  const [highlightRange, setHighlightRange] = useState<[number, number] | null>(
    null
  );
  const [phase, setPhase] = useState<"init" | "processing" | "done">("init");
  const [message, setMessage] = useState(
    "Click Play to find largest rectangle in histogram"
  );

  const heights = useMemo(() => [2, 1, 5, 6, 2, 3], []);
  const maxHeight = Math.max(...heights);

  const reset = useCallback(() => {
    setCurrentIdx(-1);
    setStack([]);
    setMaxArea(0);
    setCurrentArea(null);
    setHighlightRange(null);
    setPhase("init");
    setMessage("Click Play to find largest rectangle in histogram");
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (phase === "init") {
        setPhase("processing");
        setCurrentIdx(0);
        setMessage("Monotonic increasing stack: pop when current < top");
      } else if (phase === "processing") {
        // Use heights.length as sentinel (height 0)
        const h = currentIdx >= heights.length ? 0 : heights[currentIdx];

        // Check if we need to pop
        if (stack.length > 0 && heights[stack[stack.length - 1]] > h) {
          const poppedIdx = stack[stack.length - 1];
          const poppedHeight = heights[poppedIdx];
          const newStack = stack.slice(0, -1);
          const width =
            newStack.length > 0
              ? currentIdx - newStack[newStack.length - 1] - 1
              : currentIdx;
          const area = poppedHeight * width;

          setStack(newStack);
          setCurrentArea({ height: poppedHeight, width, area });

          // Calculate highlight range
          const leftBound =
            newStack.length > 0 ? newStack[newStack.length - 1] + 1 : 0;
          const rightBound = currentIdx - 1;
          setHighlightRange([leftBound, rightBound]);

          if (area > maxArea) {
            setMaxArea(area);
            setMessage(
              `POP bar ${poppedIdx} (h=${poppedHeight}): width=${width}, area=${area} - NEW MAX!`
            );
          } else {
            setMessage(
              `POP bar ${poppedIdx} (h=${poppedHeight}): width=${width}, area=${area}`
            );
          }
        } else {
          setCurrentArea(null);
          setHighlightRange(null);

          if (currentIdx > heights.length) {
            setPhase("done");
            setMessage(`Done! Maximum rectangle area = ${maxArea}`);
            setIsPlaying(false);
            return;
          }

          if (currentIdx < heights.length) {
            setStack([...stack, currentIdx]);
            setMessage(
              `Push bar ${currentIdx} (height ${heights[currentIdx]}) onto stack`
            );
          } else {
            setMessage(
              "Processing sentinel (height 0) to flush remaining bars"
            );
          }
          setCurrentIdx(currentIdx + 1);
        }
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [isPlaying, phase, currentIdx, stack, maxArea, heights, speed]);

  return (
    <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-purple-500/10 to-violet-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">
          Largest Rectangle in Histogram
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Monotonic increasing stack - find max area by tracking boundaries
        </p>
      </div>

      <div className="p-4">
        {/* Controls */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={phase === "done"}
            className={`px-4 py-2 rounded-md font-medium transition ${
              isPlaying ? "bg-yellow-500 text-black" : "bg-green-500 text-white"
            } disabled:opacity-50`}
          >
            {isPlaying ? "Pause" : "Play"}
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
              className="w-20 accent-purple-500"
            />
          </div>
        </div>

        {/* Histogram visualization */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">Histogram:</div>
          <div className="flex items-end gap-1 h-40 bg-gray-800/30 rounded-md p-3">
            {heights.map((h, idx) => {
              const barHeight = (h / maxHeight) * 100;
              const isInStack = stack.includes(idx);
              const isCurrent = idx === currentIdx;
              const isHighlighted =
                highlightRange &&
                idx >= highlightRange[0] &&
                idx <= highlightRange[1];

              return (
                <motion.div
                  key={`bar-${h}-${idx}`}
                  className="flex flex-col items-center"
                  animate={{ scale: isCurrent ? 1.05 : 1 }}
                >
                  <motion.div
                    style={{ height: `${barHeight}%` }}
                    animate={{
                      backgroundColor: isHighlighted
                        ? "#a855f7"
                        : isCurrent && currentIdx < heights.length
                          ? "#eab308"
                          : isInStack
                            ? "#3b82f6"
                            : "#6b7280",
                    }}
                    className="w-10 rounded-t-md flex items-end justify-center"
                  >
                    <span className="text-xs text-white font-bold mb-1">
                      {h}
                    </span>
                  </motion.div>
                  <div className="text-xs text-gray-500 mt-1">[{idx}]</div>
                </motion.div>
              );
            })}
            {/* Sentinel indicator */}
            {currentIdx >= heights.length && (
              <div className="flex flex-col items-center">
                <div className="w-10 h-1 bg-red-500 rounded-md" />
                <div className="text-xs text-red-400 mt-1">0</div>
              </div>
            )}
          </div>
        </div>

        {/* Stack visualization */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">
            Monotonic Increasing Stack:
          </div>
          <div className="bg-gray-800/50 rounded-md p-3 min-h-[50px] flex items-center gap-2 flex-wrap">
            {stack.map((idx) => (
              <motion.div
                key={`stack-${heights[idx]}-${idx}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-3 py-1 bg-blue-500 rounded-md font-mono text-sm text-white"
              >
                [{idx}]={heights[idx]}
              </motion.div>
            ))}
            {stack.length === 0 && (
              <span className="text-gray-500 italic">Empty</span>
            )}
          </div>
        </div>

        {/* Current calculation */}
        {currentArea && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-md"
          >
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-400">
                Area = height × width = {currentArea.height} ×{" "}
                {currentArea.width} ={" "}
                <span className="text-purple-400 font-bold">
                  {currentArea.area}
                </span>
              </span>
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">Current Position</div>
            <div className="text-2xl font-bold text-yellow-400">
              {currentIdx >= 0
                ? currentIdx >= heights.length
                  ? "sentinel"
                  : currentIdx
                : "-"}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">Max Area</div>
            <div className="text-2xl font-bold text-green-400">{maxArea}</div>
          </div>
        </div>

        {/* Message */}
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-md text-sm ${
            phase === "done"
              ? "bg-green-500/10 border border-green-500/30 text-green-400"
              : "bg-gray-800 text-gray-300"
          }`}
        >
          {message}
        </motion.div>

        {/* Algorithm explanation */}
        <div className="mt-4 p-3 bg-gray-800/30 rounded-md text-sm text-gray-400">
          <p>
            <strong className="text-purple-400">Key Insight:</strong> When
            popping bar i, it can extend from stack top to current position. Add
            sentinel 0 at end to flush all remaining bars.
          </p>
        </div>
      </div>
    </div>
  );
}
