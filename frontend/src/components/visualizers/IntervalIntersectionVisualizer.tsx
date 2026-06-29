"use client";

import React, { useState, useEffect, useCallback, useReducer, startTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Interval {
  start: number;
  end: number;
}

type PlayState = { step: number; isPlaying: boolean };
type PlayAction =
  | { type: "TOGGLE" }
  | { type: "STOP" }
  | { type: "ADVANCE" }
  | { type: "RESET" };

function playReducer(state: PlayState, action: PlayAction): PlayState {
  switch (action.type) {
    case "TOGGLE":
      return { ...state, isPlaying: !state.isPlaying };
    case "STOP":
      return { ...state, isPlaying: false };
    case "ADVANCE":
      return { ...state, step: state.step + 1 };
    case "RESET":
      return { step: 0, isPlaying: false };
  }
}

const listA: Interval[] = [
  { start: 0, end: 2 },
  { start: 5, end: 10 },
  { start: 13, end: 23 },
];

const listB: Interval[] = [
  { start: 1, end: 5 },
  { start: 8, end: 12 },
  { start: 15, end: 24 },
];

export default function IntervalIntersectionVisualizer() {
  const [{ isPlaying }, dispatch] = useReducer(playReducer, { step: 0, isPlaying: false });
  const [speed, setSpeed] = useState(1000);
  const [ptrA, setPtrA] = useState(0);
  const [ptrB, setPtrB] = useState(0);
  const [result, setResult] = useState<Interval[]>([]);
  const [currentIntersection, setCurrentIntersection] =
    useState<Interval | null>(null);
  const [phase, setPhase] = useState<"init" | "checking" | "done">("init");
  const [message, setMessage] = useState(
    "Click Play to find interval intersections"
  );

  const reset = useCallback(() => {
    setPtrA(0);
    setPtrB(0);
    setResult([]);
    setCurrentIntersection(null);
    setPhase("init");
    setMessage("Click Play to find interval intersections using two pointers");
    dispatch({ type: "STOP" });
  }, []);

  useEffect(() => {
    startTransition(() => {
      reset();
    });
  }, [reset]);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (phase === "init") {
        setPhase("checking");
        setMessage("Comparing intervals from both lists...");
      } else if (phase === "checking") {
        if (ptrA >= listA.length || ptrB >= listB.length) {
          setPhase("done");
          setCurrentIntersection(null);
          setMessage(`Done! Found ${result.length} intersections`);
          dispatch({ type: "STOP" });
          return;
        }

        const a = listA[ptrA];
        const b = listB[ptrB];

        // Calculate intersection
        const start = Math.max(a.start, b.start);
        const end = Math.min(a.end, b.end);

        if (start <= end) {
          // Valid intersection
          const intersection = { start, end };
          setCurrentIntersection(intersection);
          setResult([...result, intersection]);
          setMessage(
            `A[${ptrA}]=[${a.start},${a.end}] ∩ B[${ptrB}]=[${b.start},${b.end}] = [max(${a.start},${b.start}), min(${a.end},${b.end})] = [${start},${end}] ✓`
          );
        } else {
          setCurrentIntersection(null);
          setMessage(
            `A[${ptrA}]=[${a.start},${a.end}] ∩ B[${ptrB}]=[${b.start},${b.end}]: No intersection (${start} > ${end})`
          );
        }

        // Advance pointer with smaller end
        setTimeout(() => {
          if (a.end < b.end) {
            setPtrA(ptrA + 1);
          } else {
            setPtrB(ptrB + 1);
          }
        }, speed / 2);
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [isPlaying, phase, ptrA, ptrB, result, speed]);

  const maxEnd = Math.max(
    ...listA.map((i) => i.end),
    ...listB.map((i) => i.end)
  );

  return (
    <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">
          Interval List Intersection
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Two pointers: advance the interval that ends first
        </p>
      </div>

      <div className="p-4">
        {/* Controls */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => dispatch({ type: "TOGGLE" })}
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
              className="w-20 accent-cyan-500"
            />
          </div>
        </div>

        {/* List A */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-6 rounded-md bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
              A
            </span>
            <span className="text-sm text-gray-400">
              List A (sorted, non-overlapping)
            </span>
          </div>
          <div className="relative bg-gray-800/50 rounded-md p-4 h-16 overflow-hidden">
            {/* Timeline */}
            <div className="absolute bottom-2 left-4 right-4 h-0.5 bg-gray-600" />

            {listA.map((int, position) => (
              <motion.div
                key={`a-${int.start}-${int.end}`}
                animate={{
                  y: position === ptrA ? -3 : 0,
                  scale: position === ptrA ? 1.05 : 1,
                }}
                className={`absolute h-8 rounded-md flex items-center justify-center text-white text-xs font-bold shadow-lg ${
                  position === ptrA
                    ? "bg-blue-500 ring-2 ring-blue-300"
                    : "bg-blue-500/50"
                }`}
                style={{
                  left: `${(int.start / maxEnd) * 100}%`,
                  width: `${((int.end - int.start) / maxEnd) * 100}%`,
                  top: "8px",
                  minWidth: "50px",
                }}
              >
                [{int.start},{int.end}]
              </motion.div>
            ))}
          </div>
        </div>

        {/* List B */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-6 rounded-md bg-green-500 flex items-center justify-center text-white text-xs font-bold">
              B
            </span>
            <span className="text-sm text-gray-400">
              List B (sorted, non-overlapping)
            </span>
          </div>
          <div className="relative bg-gray-800/50 rounded-md p-4 h-16 overflow-hidden">
            {/* Timeline */}
            <div className="absolute bottom-2 left-4 right-4 h-0.5 bg-gray-600" />

            {listB.map((int, position) => (
              <motion.div
                key={`b-${int.start}-${int.end}`}
                animate={{
                  y: position === ptrB ? -3 : 0,
                  scale: position === ptrB ? 1.05 : 1,
                }}
                className={`absolute h-8 rounded-md flex items-center justify-center text-white text-xs font-bold shadow-lg ${
                  position === ptrB
                    ? "bg-green-500 ring-2 ring-green-300"
                    : "bg-green-500/50"
                }`}
                style={{
                  left: `${(int.start / maxEnd) * 100}%`,
                  width: `${((int.end - int.start) / maxEnd) * 100}%`,
                  top: "8px",
                  minWidth: "50px",
                }}
              >
                [{int.start},{int.end}]
              </motion.div>
            ))}
          </div>
        </div>

        {/* Current intersection highlight */}
        {currentIntersection && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-md"
          >
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 text-sm">
                Found intersection:
              </span>
              <span className="px-3 py-1 bg-yellow-500 text-black rounded-md font-mono font-bold">
                [{currentIntersection.start}, {currentIntersection.end}]
              </span>
            </div>
          </motion.div>
        )}

        {/* Result */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">Intersections found:</div>
          <div className="bg-gray-800/50 rounded-md p-3 min-h-[50px]">
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {result.map((int) => (
                  <motion.span
                    key={`result-${int.start}-${int.end}`}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="px-3 py-1 bg-cyan-500 text-white rounded-md font-mono font-bold"
                  >
                    [{int.start},{int.end}]
                  </motion.span>
                ))}
              </AnimatePresence>
              {result.length === 0 && (
                <span className="text-gray-500">
                  Intersections will appear here...
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Pointers */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-2xl font-bold text-blue-400">{ptrA}</div>
            <div className="text-xs text-gray-500">Pointer A</div>
          </div>
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-2xl font-bold text-green-400">{ptrB}</div>
            <div className="text-xs text-gray-500">Pointer B</div>
          </div>
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-2xl font-bold text-cyan-400">
              {result.length}
            </div>
            <div className="text-xs text-gray-500">Intersections</div>
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
            <strong className="text-cyan-400">Key Insight:</strong> Intersection
            = [max(a.start, b.start), min(a.end, b.end)]. Valid if start {"<="}{" "}
            end. Advance the pointer with smaller end time.
          </p>
        </div>
      </div>
    </div>
  );
}
