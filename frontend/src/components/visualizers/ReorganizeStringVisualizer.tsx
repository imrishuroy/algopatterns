"use client";

import React, { useState, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const INPUT = "aaabbc";

const CHAR_COLORS: Record<string, string> = {
  a: "bg-blue-500",
  b: "bg-green-500",
  c: "bg-purple-500",
  d: "bg-orange-500",
  e: "bg-pink-500",
};

const CHAR_BORDER: Record<string, string> = {
  a: "border-blue-400",
  b: "border-green-400",
  c: "border-purple-400",
  d: "border-orange-400",
  e: "border-pink-400",
};

interface HeapEntry {
  char: string;
  freq: number;
}

interface Step {
  type: "init" | "check" | "place" | "push-prev" | "done";
  heap: HeapEntry[];
  result: string;
  held: HeapEntry | null;
  placed: string | null;
  message: string;
  action: "idle" | "placing" | "pushing" | "impossible";
}

function buildSteps(): Step[] {
  const steps: Step[] = [];

  const freq: Record<string, number> = {};
  for (const c of INPUT) freq[c] = (freq[c] || 0) + 1;

  const n = INPUT.length;
  const maxFreq = Math.max(...Object.values(freq));
  const impossible = maxFreq > Math.ceil(n / 2);

  steps.push({
    type: "init",
    heap: [],
    result: "",
    held: null,
    placed: null,
    action: "idle",
    message: `Input: "${INPUT}". Count frequencies: ${Object.entries(freq)
      .map(([c, f]) => `${c}=${f}`)
      .join(", ")}`,
  });

  steps.push({
    type: "check",
    heap: [],
    result: "",
    held: null,
    placed: null,
    action: impossible ? "impossible" : "idle",
    message: impossible
      ? `Impossible! maxFreq=${maxFreq} > ⌈${n}/2⌉=${Math.ceil(n / 2)}`
      : `Possible: maxFreq=${maxFreq} <= ⌈${n}/2⌉=${Math.ceil(n / 2)}. Build max-heap.`,
  });

  if (impossible) {
    steps.push({
      type: "done",
      heap: [],
      result: "",
      held: null,
      placed: null,
      action: "impossible",
      message: 'Return "" — no valid arrangement exists.',
    });
    return steps;
  }

  // Build initial heap (sorted by freq desc)
  let heap: HeapEntry[] = Object.entries(freq)
    .map(([char, f]) => ({ char, freq: f }))
    .sort((a, b) => b.freq - a.freq || a.char.localeCompare(b.char));

  steps.push({
    type: "init",
    heap: [...heap],
    result: "",
    held: null,
    placed: null,
    action: "idle",
    message: `Initial heap: [${heap.map((h) => `(${h.char},${h.freq})`).join(", ")}]`,
  });

  let result = "";
  let prev: HeapEntry | null = null;

  while (heap.length > 0) {
    // Sort heap (max first)
    heap = [...heap].sort(
      (a, b) => b.freq - a.freq || a.char.localeCompare(b.char)
    );

    // Pop most frequent
    const curr = { ...heap[0] };
    heap = heap.slice(1);
    result += curr.char;
    curr.freq--;

    steps.push({
      type: "place",
      heap: [...heap],
      result,
      held: { ...curr },
      placed: curr.char,
      action: "placing",
      message: `Pop (${curr.char},${curr.freq + 1}). Place '${curr.char}'. Freq → ${curr.freq}. Hold it out.`,
    });

    // Push prev back if count > 0
    if (prev !== null && prev.freq > 0) {
      heap = [...heap, { ...prev }].sort(
        (a, b) => b.freq - a.freq || a.char.localeCompare(b.char)
      );

      steps.push({
        type: "push-prev",
        heap: [...heap],
        result,
        held: { ...curr },
        placed: null,
        action: "pushing",
        message: `Push held (${prev.char},${prev.freq}) back into heap. Safe to use again.`,
      });
    }

    prev = curr;
  }

  steps.push({
    type: "done",
    heap: [],
    result,
    held: null,
    placed: null,
    action: "idle",
    message: `Done! Result: "${result}" — no two adjacent characters are the same.`,
  });

  return steps;
}

// skipcq: JS-0067
export default function ReorganizeStringVisualizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(900);
  const [stepIndex, setStepIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const steps = useMemo(() => buildSteps(), []);

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

  React.useEffect(() => {
    if (isPlaying && stepIndex < steps.length - 1) {
      timerRef.current = setTimeout(advanceStep, speed);
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, [isPlaying, stepIndex, steps.length, speed, advanceStep]);

  const current = steps[stepIndex];
  const isDone = current.type === "done";

  return (
    <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">Reorganize String</h3>
        <p className="text-gray-400 text-sm mt-1">
          Max-heap + hold: always place the most frequent character that is not
          the last placed
        </p>
      </div>

      <div className="p-4 space-y-5">
        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handlePlayPause}
            disabled={isDone}
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
              max="1800"
              step="100"
              value={2200 - speed}
              onChange={(e) => setSpeed(2200 - Number(e.target.value))}
              className="w-20 accent-violet-500"
            />
          </div>
          <span className="text-gray-500 text-xs ml-2">
            Step {stepIndex + 1}/{steps.length}
          </span>
        </div>

        {/* Input + frequencies */}
        <div>
          <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
            Input: &quot;{INPUT}&quot;
          </div>
          <div className="flex gap-2">
            {INPUT.split("").map((ch, i) => (
              <div
                // skipcq: JS-0437
                key={`input-${ch}-${i}`}
                className={`w-9 h-9 rounded-md flex items-center justify-center font-mono font-bold text-white ${
                  CHAR_COLORS[ch] ?? "bg-gray-600"
                }`}
              >
                {ch}
              </div>
            ))}
          </div>
        </div>

        {/* Max-Heap */}
        <div>
          <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
            Max-Heap (most frequent at top)
          </div>
          <div className="bg-gray-800/50 rounded-md p-4 pt-8 min-h-[120px]">
            {current.heap.length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-2">
                Heap is empty
              </div>
            ) : (
              <div className="flex flex-col items-center gap-5">
                {/* Root */}
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={`root-${current.heap[0].char}-${current.heap[0].freq}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex flex-col items-center"
                  >
                    <span className="text-xs text-amber-400 font-semibold mb-1">
                      max
                    </span>
                    <div
                      className={`w-14 h-14 rounded-full ${CHAR_COLORS[current.heap[0].char] ?? "bg-gray-600"} flex flex-col items-center justify-center text-white font-bold shadow-lg`}
                    >
                      <span className="text-lg">{current.heap[0].char}</span>
                      <span className="text-xs opacity-75">
                        ×{current.heap[0].freq}
                      </span>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Level 2 */}
                {current.heap.length > 1 && (
                  <div className="flex gap-8">
                    {current.heap.slice(1, 3).map((entry) => (
                      <motion.div
                        key={`l2-${entry.char}-${entry.freq}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex flex-col items-center"
                      >
                        <div
                          className={`w-11 h-11 rounded-full ${CHAR_COLORS[entry.char] ?? "bg-gray-600"} flex flex-col items-center justify-center text-white font-bold opacity-80`}
                        >
                          <span>{entry.char}</span>
                          <span className="text-xs opacity-75">
                            ×{entry.freq}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Level 3+ (flat) */}
                {current.heap.length > 3 && (
                  <div className="flex gap-3">
                    {current.heap.slice(3).map((entry) => (
                      <motion.div
                        key={`l3-${entry.char}-${entry.freq}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`w-9 h-9 rounded-full ${CHAR_COLORS[entry.char] ?? "bg-gray-700"} flex flex-col items-center justify-center text-white text-xs font-bold opacity-70`}
                      >
                        <span>{entry.char}</span>
                        <span className="opacity-75">×{entry.freq}</span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Held character */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
              Held (blocked for one step)
            </div>
            <div className="bg-gray-800/50 rounded-md p-3 min-h-[56px] flex items-center">
              <AnimatePresence mode="popLayout">
                {current.held ? (
                  <motion.div
                    key={`held-${current.held.char}-${current.held.freq}`}
                    initial={{ scale: 0, x: -10 }}
                    animate={{ scale: 1, x: 0 }}
                    exit={{ scale: 0, x: 10 }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md border-2 ${CHAR_BORDER[current.held.char] ?? "border-gray-500"} bg-gray-900`}
                  >
                    <span
                      className={`w-8 h-8 rounded-full ${CHAR_COLORS[current.held.char] ?? "bg-gray-600"} flex items-center justify-center text-white font-bold`}
                    >
                      {current.held.char}
                    </span>
                    <span className="text-gray-300 text-sm">
                      ×{current.held.freq} remaining
                    </span>
                    {current.held.freq === 0 && (
                      <span className="text-xs text-gray-500">(done)</span>
                    )}
                  </motion.div>
                ) : (
                  <span className="text-gray-600 text-sm">none</span>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Last placed */}
          <div className="flex-1">
            <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
              Last placed
            </div>
            <div className="bg-gray-800/50 rounded-md p-3 min-h-[56px] flex items-center">
              <AnimatePresence mode="popLayout">
                {current.placed ? (
                  <motion.div
                    key={`placed-${current.placed}-${current.result}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className={`w-10 h-10 rounded-md ${CHAR_COLORS[current.placed] ?? "bg-gray-600"} flex items-center justify-center text-white font-bold text-lg`}
                  >
                    {current.placed}
                  </motion.div>
                ) : (
                  <span className="text-gray-600 text-sm">—</span>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Result string */}
        <div>
          <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
            Result so far
          </div>
          <div className="flex flex-wrap gap-1.5 min-h-[44px] p-3 bg-gray-800/50 rounded-md">
            <AnimatePresence>
              {current.result.split("").map((ch, i) => (
                <motion.div
                  // skipcq: JS-0437
                  key={`res-${ch}-${i}`}
                  initial={{ scale: 0, y: -8 }}
                  animate={{ scale: 1, y: 0 }}
                  className={`w-9 h-9 rounded-md flex items-center justify-center font-mono font-bold text-white ${
                    CHAR_COLORS[ch] ?? "bg-gray-600"
                  } ${i === current.result.length - 1 ? "ring-2 ring-white/60" : ""}`}
                >
                  {ch}
                </motion.div>
              ))}
              {current.result.length === 0 && (
                <span className="text-gray-600 text-sm self-center">empty</span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Message */}
        <motion.div
          key={current.message}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-md text-sm ${
            isDone && current.action !== "impossible"
              ? "bg-green-500/10 border border-green-500/30 text-green-400"
              : current.action === "impossible"
                ? "bg-red-500/10 border border-red-500/30 text-red-400"
                : current.action === "placing"
                  ? "bg-violet-500/10 border border-violet-500/30 text-violet-300"
                  : current.action === "pushing"
                    ? "bg-blue-500/10 border border-blue-500/30 text-blue-300"
                    : "bg-gray-800 text-gray-300"
          }`}
        >
          {current.message}
        </motion.div>

        {/* Key insight */}
        <div className="p-3 bg-gray-800/30 rounded-md text-sm text-gray-400">
          <strong className="text-violet-400">Key insight:</strong> After
          placing a character, hold it out for one step so it cannot appear
          twice in a row. Push it back into the heap only after placing a
          different character in between.
        </div>
      </div>
    </div>
  );
}
