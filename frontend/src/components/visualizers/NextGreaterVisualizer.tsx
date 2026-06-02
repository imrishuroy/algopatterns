"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function NextGreaterVisualizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(900);
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [stack, setStack] = useState<number[]>([]);
  const [result, setResult] = useState<number[]>([]);
  const [poppingIdx, setPoppingIdx] = useState<number | null>(null);
  const [phase, setPhase] = useState<"init" | "processing" | "done">("init");
  const [message, setMessage] = useState(
    "Click Play to find next greater elements"
  );

  const nums = [2, 1, 2, 4, 3];

  const reset = useCallback(() => {
    setCurrentIdx(-1);
    setStack([]);
    setResult(new Array(nums.length).fill(-1));
    setPoppingIdx(null);
    setPhase("init");
    setMessage("Click Play to find next greater elements");
    setIsPlaying(false);
  }, [nums.length]);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (phase === "init") {
        setPhase("processing");
        setCurrentIdx(0);
        setResult(new Array(nums.length).fill(-1));
        setMessage("Monotonic decreasing stack: pop when current > top");
      } else if (phase === "processing") {
        if (currentIdx >= nums.length) {
          setPhase("done");
          setMessage(
            `Done! Result: [${result.join(", ")}]. Elements left on stack have no greater element.`
          );
          setIsPlaying(false);
          return;
        }

        const currentVal = nums[currentIdx];

        // Check if we need to pop
        if (stack.length > 0 && nums[stack[stack.length - 1]] < currentVal) {
          const idxToPop = stack[stack.length - 1];
          setPoppingIdx(idxToPop);
          const newResult = [...result];
          newResult[idxToPop] = currentVal;
          setResult(newResult);
          setStack(stack.slice(0, -1));
          setMessage(
            `${currentVal} > ${nums[idxToPop]}: POP index ${idxToPop}, its next greater is ${currentVal}`
          );
        } else {
          setPoppingIdx(null);
          setStack([...stack, currentIdx]);
          setMessage(
            `Push index ${currentIdx} (value ${currentVal}) onto stack`
          );
          setCurrentIdx(currentIdx + 1);
        }
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [isPlaying, phase, currentIdx, stack, result, nums, speed]);

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-orange-500/10 to-amber-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">
          Next Greater Element
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Monotonic decreasing stack - pop when current greater than top
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
              min="400"
              max="1500"
              step="100"
              value={1900 - speed}
              onChange={(e) => setSpeed(1900 - Number(e.target.value))}
              className="w-20 accent-orange-500"
            />
          </div>
        </div>

        {/* Input array */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">Input Array:</div>
          <div className="flex gap-2">
            {nums.map((val, idx) => (
              <motion.div
                key={`num-${val}-${idx}`}
                animate={{
                  scale: idx === currentIdx ? 1.1 : 1,
                  y: idx === currentIdx ? -8 : poppingIdx === idx ? -4 : 0,
                }}
                className={`w-14 h-14 rounded-lg flex flex-col items-center justify-center font-mono ${
                  idx === currentIdx
                    ? "bg-yellow-500 text-black ring-2 ring-yellow-300"
                    : poppingIdx === idx
                      ? "bg-green-500 text-white ring-2 ring-green-300"
                      : stack.includes(idx)
                        ? "bg-orange-500 text-white"
                        : idx < currentIdx
                          ? "bg-gray-600 text-gray-400"
                          : "bg-gray-700 text-gray-300"
                }`}
              >
                <span className="text-lg font-bold">{val}</span>
                <span className="text-xs opacity-70">[{idx}]</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stack visualization */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">
            Monotonic Decreasing Stack (indices):
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 min-h-[60px] flex items-center gap-2">
            <AnimatePresence>
              {stack.map((idx) => (
                <motion.div
                  key={`stack-${nums[idx]}-${idx}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`px-3 py-2 rounded-lg font-mono ${
                    poppingIdx === idx
                      ? "bg-green-500 text-white"
                      : "bg-orange-500/80 text-white"
                  }`}
                >
                  [{idx}]={nums[idx]}
                </motion.div>
              ))}
            </AnimatePresence>
            {stack.length === 0 && (
              <span className="text-gray-500 italic">Empty</span>
            )}
          </div>
        </div>

        {/* Result array */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">
            Result (Next Greater):
          </div>
          <div className="flex gap-2">
            {result.map((val, idx) => (
              <motion.div
                key={`result-${val}-${idx}`}
                animate={{
                  backgroundColor: poppingIdx === idx ? "#22c55e" : "#6b7280",
                }}
                className="w-14 h-14 rounded-lg flex flex-col items-center justify-center font-mono text-white"
              >
                <span className="text-lg font-bold">{val}</span>
                <span className="text-xs opacity-70">[{idx}]</span>
              </motion.div>
            ))}
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
              : "bg-gray-800 text-gray-300"
          }`}
        >
          {message}
        </motion.div>

        {/* Algorithm explanation */}
        <div className="mt-4 p-3 bg-gray-800/30 rounded-lg text-sm text-gray-400">
          <p>
            <strong className="text-orange-400">Key Insight:</strong> Elements
            wait on stack until a larger element "answers" them. Each element
            pushed once, popped at most once = O(n).
          </p>
        </div>
      </div>
    </div>
  );
}
