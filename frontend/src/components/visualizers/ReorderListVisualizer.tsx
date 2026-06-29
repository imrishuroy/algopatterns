"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ORIGINAL_LIST = [1, 2, 3, 4, 5];

export default function ReorderListVisualizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [slowIdx, setSlowIdx] = useState(0);
  const [fastIdx, setFastIdx] = useState(0);
  const [firstHalf, setFirstHalf] = useState<number[]>([]);
  const [secondHalf, setSecondHalf] = useState<number[]>([]);
  const [result, setResult] = useState<number[]>([]);
  const [phase, setPhase] = useState<
    | "init"
    | "finding-middle"
    | "found-middle"
    | "reversing"
    | "merging"
    | "done"
  >("init");
  const [, setStep] = useState(0);
  const [message, setMessage] = useState("Click Play to reorder the list");

  const reset = useCallback(() => {
    setSlowIdx(0);
    setFastIdx(0);
    setFirstHalf([]);
    setSecondHalf([]);
    setResult([]);
    setPhase("init");
    setStep(0);
    setMessage("Click Play to reorder: L0→Ln→L1→Ln-1→...");
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (phase === "init") {
        setPhase("finding-middle");
        setMessage("Step 1: Find middle using fast/slow pointers");
      } else if (phase === "finding-middle") {
        // Fast moves 2, slow moves 1
        const newFast = Math.min(fastIdx + 2, ORIGINAL_LIST.length);
        const newSlow = slowIdx + 1;

        if (newFast >= ORIGINAL_LIST.length - 1) {
          // Found middle
          setSlowIdx(newSlow - 1);
          setPhase("found-middle");
          const mid = newSlow - 1;
          setFirstHalf(ORIGINAL_LIST.slice(0, mid + 1));
          setSecondHalf(ORIGINAL_LIST.slice(mid + 1));
          setMessage(
            `Middle found at index ${mid} (value ${ORIGINAL_LIST[mid]}). Splitting list.`
          );
        } else {
          setFastIdx(newFast);
          setSlowIdx(newSlow);
          setMessage(
            `Slow at ${ORIGINAL_LIST[newSlow]}, Fast at ${ORIGINAL_LIST[newFast]}`
          );
        }
      } else if (phase === "found-middle") {
        setPhase("reversing");
        setMessage("Step 2: Reverse second half");
      } else if (phase === "reversing") {
        setSecondHalf([...secondHalf].reverse());
        setPhase("merging");
        setMessage(
          `Second half reversed: [${[...secondHalf].reverse().join(", ")}]. Now merge alternating.`
        );
      } else if (phase === "merging") {
        if (result.length === 0) {
          // Start merging
          const merged = [...result];
          const first = [...firstHalf];
          const second = [...secondHalf].reverse();

          // Take one from first, one from second
          if (first.length > 0) {
            merged.push(first.shift()!);
          }
          if (second.length > 0) {
            merged.push(second.shift()!);
          }
          setResult(merged);
          setFirstHalf(first);
          setSecondHalf(second.reverse()); // Reverse back to show original order
          setMessage(`Merged: [${merged.join(" → ")}]`);
        } else {
          const first = [...firstHalf];
          const second = [...secondHalf];
          const merged = [...result];

          if (first.length > 0 || second.length > 0) {
            if (first.length > 0) {
              merged.push(first.shift()!);
            }
            if (second.length > 0) {
              merged.push(second.shift()!);
            }
            setResult(merged);
            setFirstHalf(first);
            setSecondHalf(second);
            setMessage(`Merged: [${merged.join(" → ")}]`);
          } else {
            setPhase("done");
            setMessage(`Done! Reordered: ${merged.join(" → ")}`);
            setIsPlaying(false);
          }
        }
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [
    isPlaying,
    phase,
    slowIdx,
    fastIdx,
    firstHalf,
    secondHalf,
    result,
    speed,
  ]);

  return (
    <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">Reorder List</h3>
        <p className="text-gray-400 text-sm mt-1">
          Three steps: Find middle → Reverse second half → Merge alternating
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
              min="500"
              max="2000"
              step="100"
              value={2500 - speed}
              onChange={(e) => setSpeed(2500 - Number(e.target.value))}
              className="w-20 accent-purple-500"
            />
          </div>
        </div>

        {/* Phase indicator */}
        <div className="mb-4 flex gap-2">
          {["Finding Middle", "Reversing", "Merging"].map((p, i) => {
            const phaseOrder = ["finding-middle", "reversing", "merging"];
            const currentPhaseIdx = phaseOrder.indexOf(phase);
            const isActive =
              currentPhaseIdx >= i ||
              phase === "done" ||
              (phase === "found-middle" && i === 0);
            const isCurrent =
              ((phase === "finding-middle" || phase === "found-middle") &&
                i === 0) ||
              (phase === "reversing" && i === 1) ||
              (phase === "merging" && i === 2);

            return (
              <div
                key={`p-${p}`}
                className={`flex-1 p-2 rounded-md text-center text-sm font-medium transition-colors ${
                  isCurrent
                    ? "bg-purple-500 text-white"
                    : isActive
                      ? "bg-purple-500/30 text-purple-300"
                      : "bg-gray-800 text-gray-500"
                }`}
              >
                {i + 1}. {p}
              </div>
            );
          })}
        </div>

        {/* Original list with pointers */}
        {(phase === "init" || phase === "finding-middle") && (
          <div className="mb-6">
            <div className="text-sm text-gray-400 mb-2">
              Original List (finding middle):
            </div>
            <div className="flex items-center gap-2">
              {ORIGINAL_LIST.map((val, idx) => (
                <React.Fragment key={`node-${val}-${idx}`}>
                  <motion.div
                    animate={{
                      scale: idx === slowIdx || idx === fastIdx ? 1.1 : 1,
                      y: idx === slowIdx || idx === fastIdx ? -5 : 0,
                    }}
                    className="flex flex-col items-center"
                  >
                    <div
                      className={`w-12 h-12 rounded-md flex items-center justify-center font-mono text-lg font-bold ${
                        idx === slowIdx && idx === fastIdx
                          ? "bg-yellow-500 text-black"
                          : idx === slowIdx
                            ? "bg-blue-500 text-white"
                            : idx === fastIdx
                              ? "bg-green-500 text-white"
                              : "bg-gray-700 text-gray-300"
                      }`}
                    >
                      {val}
                    </div>
                    <div className="text-xs mt-1 h-4">
                      {idx === slowIdx && idx === fastIdx && (
                        <span className="text-yellow-400">S+F</span>
                      )}
                      {idx === slowIdx && idx !== fastIdx && (
                        <span className="text-blue-400">Slow</span>
                      )}
                      {idx === fastIdx && idx !== slowIdx && (
                        <span className="text-green-400">Fast</span>
                      )}
                    </div>
                  </motion.div>
                  {idx < ORIGINAL_LIST.length - 1 && (
                    <span className="text-gray-500">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Split lists */}
        {(phase === "found-middle" ||
          phase === "reversing" ||
          phase === "merging" ||
          phase === "done") && (
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-400 mb-2">First Half:</div>
              <div className="flex gap-1 p-3 bg-blue-500/10 rounded-md min-h-[60px]">
                <AnimatePresence>
                  {firstHalf.map((val) => (
                    <motion.div
                      key={`first-${val}`}
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      className="w-10 h-10 rounded-md bg-blue-500 flex items-center justify-center text-white font-bold"
                    >
                      {val}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {firstHalf.length === 0 && (
                  <span className="text-gray-500 text-sm">Empty</span>
                )}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-2">
                Second Half{" "}
                {phase === "reversing" ||
                phase === "merging" ||
                phase === "done"
                  ? "(reversed)"
                  : ""}
                :
              </div>
              <div className="flex gap-1 p-3 bg-green-500/10 rounded-md min-h-[60px]">
                <AnimatePresence>
                  {secondHalf.map((val) => (
                    <motion.div
                      key={`second-${val}`}
                      layout
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      className="w-10 h-10 rounded-md bg-green-500 flex items-center justify-center text-white font-bold"
                    >
                      {val}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {secondHalf.length === 0 && (
                  <span className="text-gray-500 text-sm">Empty</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Result */}
        {(phase === "merging" || phase === "done") && (
          <div className="mb-4">
            <div className="text-sm text-gray-400 mb-2">Reordered Result:</div>
            <div className="flex gap-1 p-3 bg-purple-500/10 rounded-md min-h-[60px]">
              <AnimatePresence>
                {result.map((val, idx) => (
                  <React.Fragment key={`result-${idx}`}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0, x: -20 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      className="w-10 h-10 rounded-md bg-purple-500 flex items-center justify-center text-white font-bold"
                    >
                      {val}
                    </motion.div>
                    {idx < result.length - 1 && (
                      <span className="text-purple-400 self-center">→</span>
                    )}
                  </React.Fragment>
                ))}
              </AnimatePresence>
              {result.length === 0 && (
                <span className="text-gray-500 text-sm">Building...</span>
              )}
            </div>
          </div>
        )}

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
            <strong className="text-purple-400">Key Insight:</strong> Combine
            three techniques: Fast/slow finds middle, then reverse second half,
            then interleave both halves. Same pattern works for Palindrome
            check.
          </p>
        </div>
      </div>
    </div>
  );
}
