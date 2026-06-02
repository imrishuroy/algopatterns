"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

export default function RemoveDuplicatesVisualizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [originalNums] = useState([1, 1, 2, 2, 2, 3, 4, 4, 5]);
  const [nums, setNums] = useState([...originalNums]);
  const [slow, setSlow] = useState(0);
  const [fast, setFast] = useState(1);
  const [phase, setPhase] = useState<"init" | "running" | "done">("init");
  const [message, setMessage] = useState(
    "Click Play to remove duplicates in-place"
  );
  const [history, setHistory] = useState<string[]>([]);

  const reset = useCallback(() => {
    setNums([...originalNums]);
    setSlow(0);
    setFast(1);
    setPhase("init");
    setMessage("Click Play to remove duplicates in-place");
    setHistory([]);
    setIsPlaying(false);
  }, [originalNums]);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (phase === "init") {
        setPhase("running");
        setMessage(
          `Comparing nums[${fast}]=${nums[fast]} with nums[${slow}]=${nums[slow]}`
        );
      } else if (phase === "running") {
        if (fast >= nums.length) {
          setPhase("done");
          const uniqueLength = slow + 1;
          setMessage(
            `Done! ${uniqueLength} unique elements: [${nums.slice(0, uniqueLength).join(", ")}]`
          );
          setIsPlaying(false);
          return;
        }

        if (nums[fast] !== nums[slow]) {
          // Found new unique element
          const newSlow = slow + 1;
          const newNums = [...nums];
          newNums[newSlow] = nums[fast];
          setNums(newNums);
          setSlow(newSlow);
          setHistory((prev) => [
            ...prev,
            `nums[${fast}]=${nums[fast]} ≠ nums[${slow}]=${nums[slow]} → copy to position ${newSlow}`,
          ]);
          setMessage(`Found unique ${nums[fast]}! Copy to position ${newSlow}`);
        } else {
          setHistory((prev) => [
            ...prev,
            `nums[${fast}]=${nums[fast]} = nums[${slow}]=${nums[slow]} → skip`,
          ]);
          setMessage(`${nums[fast]} == ${nums[slow]}, skip duplicate`);
        }

        setFast(fast + 1);
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [isPlaying, phase, nums, slow, fast, speed]);

  const uniqueLength = slow + 1;

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">
          Remove Duplicates (Sorted Array)
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Fast/slow pointers for in-place deduplication
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
              max="1200"
              step="100"
              value={1600 - speed}
              onChange={(e) => setSpeed(1600 - Number(e.target.value))}
              className="w-20 accent-purple-500"
            />
          </div>
        </div>

        {/* Original array */}
        <div className="mb-2 p-2 bg-gray-800/30 rounded-lg">
          <span className="text-gray-500 text-xs">Original: </span>
          <span className="text-gray-400 font-mono text-sm">
            [{originalNums.join(", ")}]
          </span>
        </div>

        {/* Array visualization */}
        <div className="mb-4 flex justify-center gap-1 flex-wrap">
          {nums.map((num, idx) => (
            <div key={`num-${num}-${idx}`} className="flex flex-col items-center">
              <motion.div
                animate={{
                  backgroundColor:
                    idx <= slow
                      ? "#22c55e"
                      : idx === fast
                        ? "#eab308"
                        : "#374151",
                  scale: idx === slow || idx === fast ? 1.1 : 1,
                  opacity: phase === "done" && idx > slow ? 0.3 : 1,
                }}
                className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-sm"
              >
                {num}
              </motion.div>
              <div className="mt-1 text-xs text-gray-500">{idx}</div>
              <div className="h-6 flex flex-col items-center">
                {idx === slow && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-green-400 font-bold text-xs"
                  >
                    S
                  </motion.span>
                )}
                {idx === fast && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-yellow-400 font-bold text-xs"
                  >
                    F
                  </motion.span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pointer explanation */}
        <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
          <div className="p-2 bg-green-500/10 border border-green-500/30 rounded-lg">
            <span className="text-green-400 font-bold">Slow (S): </span>
            <span className="text-gray-300">
              Position of last unique = {slow}
            </span>
          </div>
          <div className="p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <span className="text-yellow-400 font-bold">Fast (F): </span>
            <span className="text-gray-300">Scanning position = {fast}</span>
          </div>
        </div>

        {/* Result preview */}
        {phase === "done" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg"
          >
            <div className="text-green-400 font-bold">
              Result: [{nums.slice(0, uniqueLength).join(", ")}]
            </div>
            <div className="text-green-300 text-sm mt-1">
              Length: {uniqueLength} unique elements
            </div>
          </motion.div>
        )}

        {/* History */}
        <div className="mb-4 max-h-24 overflow-y-auto">
          <div className="text-sm text-gray-400 mb-1">Steps:</div>
          <div className="space-y-1">
            {history.slice(-5).map((step, idx) => (
              <div key={`step-${step.slice(0, 15)}-${idx}`} className="text-xs font-mono text-gray-500">
                {step}
              </div>
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

        {/* Legend */}
        <div className="mt-4 flex gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span className="text-gray-400">Unique region</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-yellow-500" />
            <span className="text-gray-400">Fast pointer</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-gray-500 opacity-50" />
            <span className="text-gray-400">Ignored</span>
          </div>
        </div>

        {/* Key insight */}
        <div className="mt-4 p-3 bg-gray-800/30 rounded-lg text-sm text-gray-400">
          <p>
            <strong className="text-purple-400">Key Insight:</strong> Slow marks
            where to write next unique. Fast scans for new values. When fast
            finds a new unique, copy it to slow+1.
          </p>
        </div>
      </div>
    </div>
  );
}
