"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

interface NumberState {
  value: number;
  state:
    | "unseen"
    | "inSet"
    | "checking"
    | "sequenceStart"
    | "inSequence"
    | "notStart";
  sequenceId: number | null;
}

const SEQUENCE_COLORS = [
  "bg-green-500",
  "bg-blue-500",
  "bg-purple-500",
  "bg-orange-500",
];

const INITIAL_NUMS = [100, 4, 200, 1, 3, 2];

const INITIAL_NUMBERS: NumberState[] = INITIAL_NUMS.map((n) => ({
  value: n,
  state: "unseen" as const,
  sequenceId: null,
}));

export default function ConsecutiveSequenceVisualizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(600);
  const [numbers, setNumbers] = useState<NumberState[]>(INITIAL_NUMBERS);
  const [numSet, setNumSet] = useState<Set<number>>(new Set());
  const [currentNum, setCurrentNum] = useState<number | null>(null);
  const [currentSequence, setCurrentSequence] = useState<number[]>([]);
  const [longestSequence, setLongestSequence] = useState<number[]>([]);
  const [phase, setPhase] = useState<
    "init" | "building-set" | "scanning" | "extending" | "done"
  >("init");
  const [scanIndex, setScanIndex] = useState(0);
  const [sequenceCount, setSequenceCount] = useState(0);
  const [message, setMessage] = useState(
    "Click Play to find longest consecutive sequence"
  );

  const reset = useCallback(() => {
    const nums = INITIAL_NUMS.map((n) => ({
      value: n,
      state: "unseen" as const,
      sequenceId: null,
    }));
    setNumbers(nums);
    setNumSet(new Set());
    setCurrentNum(null);
    setCurrentSequence([]);
    setLongestSequence([]);
    setPhase("init");
    setScanIndex(0);
    setSequenceCount(0);
    setMessage("Click Play to find longest consecutive sequence");
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (phase === "init") {
        setPhase("building-set");
        setMessage("Step 1: Building HashSet from array for O(1) lookups");
      } else if (phase === "building-set") {
        const newSet = new Set(INITIAL_NUMS);
        setNumSet(newSet);
        const newNumbers = numbers.map((n) => ({
          ...n,
          state: "inSet" as const,
        }));
        setNumbers(newNumbers);
        setPhase("scanning");
        setMessage(
          "Step 2: Scan each number, only start counting from sequence beginnings"
        );
      } else if (phase === "scanning") {
        if (scanIndex >= numbers.length) {
          setPhase("done");
          setMessage(
            `Done! Longest consecutive sequence: [${longestSequence.join(", ")}] with length ${longestSequence.length}`
          );
          setIsPlaying(false);
          return;
        }

        const num = numbers[scanIndex].value;
        setCurrentNum(num);

        const newNumbers = [...numbers];
        const idx = newNumbers.findIndex((n) => n.value === num);
        newNumbers[idx] = { ...newNumbers[idx], state: "checking" };
        setNumbers(newNumbers);

        if (numSet.has(num - 1)) {
          setMessage(
            `${num}: Has predecessor (${num - 1} exists), skip - not a sequence start`
          );
          setTimeout(() => {
            const updated = [...newNumbers];
            updated[idx] = { ...updated[idx], state: "notStart" };
            setNumbers(updated);
            setScanIndex(scanIndex + 1);
          }, speed / 2);
        } else {
          setMessage(
            `${num}: No predecessor (${num - 1} not in set) - this is a sequence START!`
          );
          setPhase("extending");
          setCurrentSequence([num]);
          setSequenceCount(sequenceCount + 1);

          const updated = [...newNumbers];
          updated[idx] = {
            ...updated[idx],
            state: "sequenceStart",
            sequenceId: sequenceCount,
          };
          setNumbers(updated);
        }
      } else if (phase === "extending") {
        const lastNum = currentSequence[currentSequence.length - 1];
        const nextNum = lastNum + 1;

        if (numSet.has(nextNum)) {
          const newSequence = [...currentSequence, nextNum];
          setCurrentSequence(newSequence);
          setMessage(
            `Extending: ${lastNum} + 1 = ${nextNum} exists in set! Sequence: [${newSequence.join(", ")}]`
          );

          const newNumbers = [...numbers];
          const idx = newNumbers.findIndex((n) => n.value === nextNum);
          if (idx !== -1) {
            newNumbers[idx] = {
              ...newNumbers[idx],
              state: "inSequence",
              sequenceId: sequenceCount,
            };
            setNumbers(newNumbers);
          }
        } else {
          setMessage(
            `${nextNum} not in set. Sequence complete: [${currentSequence.join(", ")}] length = ${currentSequence.length}`
          );

          if (currentSequence.length > longestSequence.length) {
            setLongestSequence([...currentSequence]);
          }

          setCurrentSequence([]);
          setPhase("scanning");
          setScanIndex(scanIndex + 1);
        }
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [
    isPlaying,
    phase,
    scanIndex,
    numbers,
    numSet,
    currentSequence,
    longestSequence,
    sequenceCount,
    speed,
  ]);

  const getNumberStyle = (num: NumberState) => {
    switch (num.state) {
      case "checking":
        return "bg-yellow-500 text-black ring-2 ring-yellow-300";
      case "sequenceStart":
      case "inSequence":
        return `${SEQUENCE_COLORS[num.sequenceId! % SEQUENCE_COLORS.length]} text-white`;
      case "notStart":
        return "bg-gray-600 text-gray-400";
      case "inSet":
        return "bg-gray-700 text-gray-300";
      default:
        return "bg-gray-800 text-gray-500";
    }
  };

  const sortedDisplay = [...numbers].sort((a, b) => a.value - b.value);

  return (
    <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">
          Longest Consecutive Sequence
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Use HashSet to find consecutive sequences in O(n)
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
              min="300"
              max="1200"
              step="100"
              value={1500 - speed}
              onChange={(e) => setSpeed(1500 - Number(e.target.value))}
              className="w-20 accent-teal-500"
            />
          </div>
        </div>

        {/* Original Array */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">
            Original array (unsorted):
          </div>
          <div className="flex flex-wrap gap-2">
            {numbers.map((num, idx) => (
              <motion.div
                key={`num-${num.value}-${idx}`}
                animate={{
                  scale: num.value === currentNum ? 1.1 : 1,
                }}
                className={`w-14 h-14 rounded-md flex items-center justify-center font-mono text-lg font-bold transition-colors ${getNumberStyle(num)}`}
              >
                {num.value}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sorted View (conceptual) */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">
            Sorted view (for visualization only):
          </div>
          <div className="flex gap-1 items-end">
            {sortedDisplay.map((num) => (
              <motion.div
                key={num.value}
                layout
                className={`w-10 rounded-t-md flex items-center justify-center font-mono text-sm font-bold transition-colors ${getNumberStyle(num)}`}
                style={{
                  height: `${Math.max(30, Math.min(80, num.value / 2))}px`,
                }}
              >
                {num.value}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Current Sequence */}
        {currentSequence.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 p-3 bg-teal-500/10 border border-teal-500/30 rounded-md"
          >
            <div className="text-xs text-gray-500 mb-1">Current Sequence:</div>
            <div className="flex gap-2 items-center">
              {currentSequence.map((num, i) => (
                <React.Fragment key={num}>
                  <span className="px-3 py-1 bg-teal-500 text-white rounded-md font-mono font-bold">
                    {num}
                  </span>
                  {i < currentSequence.length - 1 && (
                    <span className="text-teal-400">→</span>
                  )}
                </React.Fragment>
              ))}
              <span className="ml-2 text-teal-400 font-bold">
                Length: {currentSequence.length}
              </span>
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-2xl font-bold text-cyan-400">
              {longestSequence.length}
            </div>
            <div className="text-xs text-gray-500">Longest Found</div>
            {longestSequence.length > 0 && (
              <div className="text-xs text-gray-400 mt-1">
                [{longestSequence.join(", ")}]
              </div>
            )}
          </div>
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {sequenceCount}
            </div>
            <div className="text-xs text-gray-500">Sequences Found</div>
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

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-yellow-500" />
            <span className="text-gray-400">Checking</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-green-500" />
            <span className="text-gray-400">In Sequence</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-gray-600" />
            <span className="text-gray-400">Not Start</span>
          </div>
        </div>

        {/* Algorithm explanation */}
        <div className="mt-4 p-3 bg-gray-800/30 rounded-md text-sm text-gray-400">
          <p>
            <strong className="text-teal-400">Key Insight:</strong> Only start
            counting from sequence beginnings (numbers where n-1 doesn&apos;t
            exist). Each number is visited at most twice: once in scan, once
            when extending a sequence. O(n) total.
          </p>
        </div>
      </div>
    </div>
  );
}
