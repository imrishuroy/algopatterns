"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useReducer,
  startTransition,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Balloon {
  start: number;
  end: number;
  id: string;
  state: "unsorted" | "sorted" | "current" | "burst" | "waiting";
  burstBy: number | null;
}

type PlayState = { step: number; isPlaying: boolean };
type PlayAction =
  | { type: "TOGGLE" }
  | { type: "STOP" }
  | { type: "ADVANCE" }
  | { type: "RESET" };

const playReducer = (state: PlayState, action: PlayAction): PlayState => {
  switch (action.type) {
    case "TOGGLE":
      return { ...state, isPlaying: !state.isPlaying };
    case "STOP":
      return { ...state, isPlaying: false };
    case "ADVANCE":
      return { ...state, step: state.step + 1 };
    case "RESET":
      return { step: 0, isPlaying: false };
    default:
      return state;
  }
};

const initialBalloons = [
  { id: "balloon-10-16", start: 10, end: 16 },
  { id: "balloon-2-8", start: 2, end: 8 },
  { id: "balloon-1-6", start: 1, end: 6 },
  { id: "balloon-7-12", start: 7, end: 12 },
];

const timelineTicks = (max: number) =>
  Array.from({ length: max + 1 }, (_, tick) => tick);

// skipcq: JS-0067
// skipcq: JS-R1005
// Reason: The visualizer owns arrow, balloon, and playback state for a compact demo.
export default function MinimumArrowsVisualizer() {
  const [{ isPlaying }, dispatch] = useReducer(playReducer, {
    step: 0,
    isPlaying: false,
  });
  const [speed, setSpeed] = useState(1200);
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [arrows, setArrows] = useState<number[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [phase, setPhase] = useState<
    "init" | "sorting" | "processing" | "done"
  >("init");
  const [message, setMessage] = useState(
    "Click Play to find minimum arrows to burst all balloons"
  );

  const reset = useCallback(() => {
    const balls = initialBalloons.map((balloon) => ({
      ...balloon,
      state: "unsorted" as const,
      burstBy: null,
    }));
    setBalloons(balls);
    setArrows([]);
    setCurrentIdx(0);
    setPhase("init");
    setMessage("Click Play to find minimum arrows to burst all balloons");
    dispatch({ type: "STOP" });
  }, []);

  useEffect(() => {
    startTransition(() => {
      reset();
    });
  }, [reset]);

  // skipcq: JS-R1005
  // Reason: Branches mirror the sorting and greedy arrow playback phases.
  const performStep = useCallback(() => {
    if (phase === "init") {
      setPhase("sorting");
      setMessage("Step 1: Sort balloons by END position (greedy insight!)");
    } else if (phase === "sorting") {
      // Sort by end position
      const sorted = [...balloons].sort((a, b) => a.end - b.end);
      const updated = sorted.map((balloon) => ({
        ...balloon,
        state: "sorted" as const,
      }));
      setBalloons(updated);
      setPhase("processing");
      setMessage("Sorted! Now shoot arrows greedily at each balloon's end.");
    } else if (phase === "processing") {
      if (currentIdx >= balloons.length) {
        setPhase("done");
        setMessage(
          `Done! ${arrows.length} arrow${arrows.length !== 1 ? "s" : ""} burst all ${balloons.length} balloons.`
        );
        dispatch({ type: "STOP" });
        return;
      }

      const curr = balloons[currentIdx];

      // Mark current balloon
      const updatedWithCurrent = balloons.map((b, i) =>
        i === currentIdx ? { ...b, state: "current" as const } : b
      );
      setBalloons(updatedWithCurrent);

      // Check if current arrow (last arrow) can burst this balloon
      const lastArrow = arrows.length > 0 ? arrows[arrows.length - 1] : null;

      if (lastArrow !== null && curr.start <= lastArrow) {
        // Current arrow can burst this balloon (touching counts!)
        const updated = balloons.map((b, i) =>
          i === currentIdx
            ? { ...b, state: "burst" as const, burstBy: arrows.length - 1 }
            : b
        );
        setBalloons(updated);
        setMessage(
          `Balloon [${curr.start}, ${curr.end}] starts at ${curr.start} <= arrow at ${lastArrow}. Same arrow bursts it!`
        );
      } else {
        // Need new arrow at this balloon's end
        const newArrowPos = curr.end;
        setArrows([...arrows, newArrowPos]);
        const updated = balloons.map((b, i) =>
          i === currentIdx
            ? { ...b, state: "burst" as const, burstBy: arrows.length }
            : b
        );
        setBalloons(updated);
        setMessage(
          `Balloon [${curr.start}, ${curr.end}] needs new arrow at position ${newArrowPos}. Arrow #${arrows.length + 1} shot!`
        );
      }

      setCurrentIdx(currentIdx + 1);
    }
  }, [phase, currentIdx, balloons, arrows]);

  useEffect(() => {
    if (!isPlaying || phase === "done") return undefined;

    const timer = setTimeout(performStep, speed);
    return () => clearTimeout(timer);
  }, [isPlaying, phase, speed, performStep]);

  const maxEnd = Math.max(...initialBalloons.map((b) => b.end)) + 2;

  const getBalloonColor = (state: string, burstBy: number | null) => {
    if (state === "burst") {
      // Alternate colors for different arrows
      const colors = [
        "bg-red-500",
        "bg-blue-500",
        "bg-green-500",
        "bg-purple-500",
      ];
      return burstBy !== null ? colors[burstBy % colors.length] : "bg-gray-500";
    }
    switch (state) {
      case "current":
        return "bg-yellow-500";
      case "sorted":
        return "bg-gray-600";
      default:
        return "bg-gray-700";
    }
  };

  const getArrowColor = (idx: number) => {
    const colors = [
      "border-red-500",
      "border-blue-500",
      "border-green-500",
      "border-purple-500",
    ];
    return colors[idx % colors.length];
  };

  // skipcq: JS-R1005
  // Reason: Rendering needs derived position and state classes for each balloon.
  const renderBalloon = (balloon: Balloon, idx: number) => {
    const width = ((balloon.end - balloon.start) / maxEnd) * 100;
    const left = (balloon.start / maxEnd) * 100;
    const top = 24 + idx * 28;

    return (
      <motion.div
        key={balloon.id}
        layout
        initial={{ opacity: 0, y: -20 }}
        animate={{
          opacity: balloon.state === "burst" ? 0.7 : 1,
          y: balloon.state === "current" ? -5 : 0,
          scale: balloon.state === "burst" ? 0.95 : 1,
        }}
        className={`absolute h-7 rounded-full ${getBalloonColor(balloon.state, balloon.burstBy)} flex items-center justify-center text-white text-xs font-bold shadow-lg transition-all ${
          balloon.state === "current"
            ? "ring-2 ring-yellow-400 ring-offset-2 ring-offset-gray-900"
            : ""
        } ${balloon.state === "burst" ? "line-through" : ""}`}
        style={{
          left: `${left}%`,
          width: `${width}%`,
          top: `${top}px`,
        }}
      >
        🎈 [{balloon.start}, {balloon.end}]
      </motion.div>
    );
  };

  // skipcq: JS-0415
  // Reason: Timeline markup nests labels, grid, arrows, and balloons for alignment.
  return (
    <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-red-500/10 to-pink-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">
          Minimum Arrows to Burst Balloons
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Greedy: Sort by end, shoot at earliest possible position
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
            onClick={() => {
              if (!isPlaying && phase !== "done") {
                performStep();
              }
            }}
            disabled={isPlaying || phase === "done"}
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
              min="600"
              max="2000"
              step="100"
              value={2600 - speed}
              onChange={(e) => setSpeed(2600 - Number(e.target.value))}
              className="w-20 accent-red-500"
            />
          </div>
        </div>

        {/* Timeline visualization */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-2 px-2">
            {timelineTicks(maxEnd).map((tick) => (
              <span key={`label-${tick}`}>{tick}</span>
            ))}
          </div>
          <div className="relative bg-gray-800/50 rounded-md p-4 h-48 overflow-hidden">
            {/* Grid lines */}
            {timelineTicks(maxEnd).map((tick) => (
              <div
                key={`grid-${tick}`}
                className="absolute top-0 bottom-0 border-l border-gray-700/50"
                style={{ left: `${(tick / maxEnd) * 100}%` }}
              />
            ))}

            {/* Arrow lines */}
            <AnimatePresence>
              {arrows.map((pos, idx) => (
                <motion.div
                  key={`arrow-${pos}`}
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{ opacity: 1, scaleY: 1 }}
                  className={`absolute top-0 bottom-0 border-l-2 border-dashed ${getArrowColor(idx)} z-10`}
                  style={{ left: `${(pos / maxEnd) * 100}%` }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -top-1 -translate-x-1/2"
                  >
                    <div className="text-2xl">🏹</div>
                    <div className="text-xs text-center text-gray-400 mt-1">
                      {pos}
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Balloons */}
            <AnimatePresence>{balloons.map(renderBalloon)}</AnimatePresence>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-2xl font-bold text-white">
              {balloons.length}
            </div>
            <div className="text-xs text-gray-500">Total Balloons</div>
          </div>
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-2xl font-bold text-red-400">
              {arrows.length}
            </div>
            <div className="text-xs text-gray-500">Arrows Shot</div>
          </div>
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-2xl font-bold text-green-400">
              {balloons.filter((b) => b.state === "burst").length}
            </div>
            <div className="text-xs text-gray-500">Balloons Burst</div>
          </div>
        </div>

        {/* Message */}
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-md text-sm mb-4 ${
            phase === "done"
              ? "bg-green-500/10 border border-green-500/30 text-green-400"
              : message.includes("new arrow")
                ? "bg-red-500/10 border border-red-500/30 text-red-400"
                : message.includes("Same arrow")
                  ? "bg-blue-500/10 border border-blue-500/30 text-blue-400"
                  : "bg-gray-800 text-gray-300"
          }`}
        >
          {message}
        </motion.div>

        {/* Arrow positions */}
        {arrows.length > 0 && (
          <div className="mb-4 p-3 bg-gray-800/50 rounded-md">
            <div className="text-sm text-gray-400 mb-2">
              Arrow Positions ({arrows.length}):
            </div>
            <div className="flex flex-wrap gap-2">
              {arrows.map((pos, idx) => (
                <span
                  key={`arrow-tag-${pos}`}
                  className={`px-2 py-1 rounded-md text-sm ${
                    idx === 0
                      ? "bg-red-500/20 text-red-400"
                      : idx === 1
                        ? "bg-blue-500/20 text-blue-400"
                        : idx === 2
                          ? "bg-green-500/20 text-green-400"
                          : "bg-purple-500/20 text-purple-400"
                  }`}
                >
                  Arrow #{idx + 1}: x = {pos}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Algorithm explanation */}
        <div className="p-3 bg-gray-800/30 rounded-md text-sm text-gray-400">
          <p>
            <strong className="text-red-400">Key Insight:</strong> Sort by END
            position. Shoot arrow at first balloon&apos;s end. Any balloon
            starting at or before that position gets burst by the same arrow
            (touching counts!).
          </p>
        </div>
      </div>
    </div>
  );
}
