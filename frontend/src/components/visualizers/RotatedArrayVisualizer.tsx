"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useReducer,
  startTransition,
} from "react";
import { motion } from "framer-motion";

interface Step {
  left: number;
  right: number;
  mid: number;
  sortedHalf: "left" | "right";
  targetInSorted: boolean;
  message: string;
  found?: boolean;
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
    default:
      return state;
  }
}

export default function RotatedArrayVisualizer() {
  const [{ isPlaying }, dispatch] = useReducer(playReducer, {
    step: 0,
    isPlaying: false,
  });
  const [speed, setSpeed] = useState(900);
  const [nums] = useState([4, 5, 6, 7, 0, 1, 2]);
  const [target] = useState(0);
  const [left, setLeft] = useState(0);
  const [right, setRight] = useState(6);
  const [mid, setMid] = useState(-1);
  const [sortedHalf, setSortedHalf] = useState<"left" | "right" | null>(null);
  const [found, setFound] = useState<number | null>(null);
  const [phase, setPhase] = useState<"init" | "running" | "done">("init");
  const [message, setMessage] = useState(
    `Click Play to search for ${target} in rotated array`
  );
  const [stepIndex, setStepIndex] = useState(-1);
  const [steps, setSteps] = useState<Step[]>([]);

  const generateSteps = useCallback(() => {
    const allSteps: Step[] = [];
    let l = 0,
      r = nums.length - 1;

    while (l <= r) {
      const m = l + Math.floor((r - l) / 2);

      if (nums[m] === target) {
        allSteps.push({
          left: l,
          right: r,
          mid: m,
          sortedHalf: "left",
          targetInSorted: true,
          message: `nums[${m}]=${nums[m]} === ${target}. Found!`,
          found: true,
        });
        break;
      }

      // Check which half is sorted
      if (nums[l] <= nums[m]) {
        // Left half is sorted
        const inLeft = nums[l] <= target && target < nums[m];
        allSteps.push({
          left: l,
          right: r,
          mid: m,
          sortedHalf: "left",
          targetInSorted: inLeft,
          message: `Left half [${nums[l]}...${nums[m]}] is sorted. Target ${target} ${inLeft ? "is" : "is NOT"} in this range.`,
        });
        if (inLeft) {
          r = m - 1;
        } else {
          l = m + 1;
        }
      } else {
        // Right half is sorted
        const inRight = nums[m] < target && target <= nums[r];
        allSteps.push({
          left: l,
          right: r,
          mid: m,
          sortedHalf: "right",
          targetInSorted: inRight,
          message: `Right half [${nums[m]}...${nums[r]}] is sorted. Target ${target} ${inRight ? "is" : "is NOT"} in this range.`,
        });
        if (inRight) {
          l = m + 1;
        } else {
          r = m - 1;
        }
      }
    }

    return allSteps;
  }, [nums, target]);

  const reset = useCallback(() => {
    setLeft(0);
    setRight(nums.length - 1);
    setMid(-1);
    setSortedHalf(null);
    setFound(null);
    setPhase("init");
    setMessage(`Click Play to search for ${target} in rotated array`);
    setStepIndex(-1);
    setSteps(generateSteps());
    dispatch({ type: "STOP" });
  }, [nums.length, target, generateSteps]);

  useEffect(() => {
    startTransition(() => {
      setSteps(generateSteps());
    });
  }, [generateSteps]);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (phase === "init") {
        setPhase("running");
        setStepIndex(0);
        const step = steps[0];
        setLeft(step.left);
        setRight(step.right);
        setMid(step.mid);
        setSortedHalf(step.sortedHalf);
        setMessage(step.message);
        if (step.found) {
          setFound(step.mid);
          setPhase("done");
          dispatch({ type: "STOP" });
        }
        return;
      }

      const nextStepIdx = stepIndex + 1;
      if (nextStepIdx >= steps.length) {
        setPhase("done");
        if (found === null) {
          setMessage(`Target ${target} not found`);
        }
        dispatch({ type: "STOP" });
        return;
      }

      const step = steps[nextStepIdx];
      setStepIndex(nextStepIdx);
      setLeft(step.left);
      setRight(step.right);
      setMid(step.mid);
      setSortedHalf(step.sortedHalf);
      setMessage(step.message);

      if (step.found) {
        setFound(step.mid);
        setPhase("done");
        dispatch({ type: "STOP" });
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [isPlaying, phase, stepIndex, steps, target, found, speed]);

  const isInSortedHalf = (idx: number) => {
    if (mid === -1 || sortedHalf === null) return false;
    if (sortedHalf === "left") {
      return idx >= left && idx <= mid;
    } else {
      return idx >= mid && idx <= right;
    }
  };

  const isInSearchRange = (idx: number) => {
    return idx >= left && idx <= right;
  };

  return (
    <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">
          Search in Rotated Sorted Array
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          One half is always sorted - use it to decide search direction
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
              max="1300"
              step="100"
              value={1800 - speed}
              onChange={(e) => setSpeed(1800 - Number(e.target.value))}
              className="w-20 accent-orange-500"
            />
          </div>
        </div>

        {/* Target and rotation info */}
        <div className="mb-4 grid grid-cols-2 gap-2">
          <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-md text-center">
            <span className="text-gray-400">Target: </span>
            <span className="text-orange-400 font-bold text-xl">{target}</span>
          </div>
          <div className="p-3 bg-gray-800/50 rounded-md text-center">
            <span className="text-gray-400 text-sm">
              Rotation point: index 4
            </span>
          </div>
        </div>

        {/* Array visualization */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">
            Rotated Array: [4,5,6,7 | 0,1,2]
          </div>
          <div className="flex gap-1 justify-center">
            {nums.map((num, idx) => {
              const isMid = idx === mid;
              const isFound = idx === found;
              const inSorted = isInSortedHalf(idx);
              const inRange = isInSearchRange(idx);

              return (
                <div
                  key={`num-${num}-${idx}`}
                  className="flex flex-col items-center"
                >
                  <motion.div
                    animate={{
                      backgroundColor: isFound
                        ? "#22c55e"
                        : isMid
                          ? "#eab308"
                          : inSorted && phase === "running"
                            ? "#3b82f6"
                            : inRange || phase === "init"
                              ? "#4b5563"
                              : "#1f2937",
                      opacity: !inRange && phase !== "init" ? 0.4 : 1,
                      scale: isMid ? 1.15 : 1,
                    }}
                    className="w-11 h-11 rounded-md flex items-center justify-center font-bold"
                  >
                    <span
                      className={
                        isFound || isMid || inSorted
                          ? "text-black"
                          : "text-white"
                      }
                    >
                      {num}
                    </span>
                  </motion.div>
                  <div className="text-xs text-gray-500 mt-1">{idx}</div>
                  <div className="h-5 flex gap-0.5 mt-1">
                    {idx === left && phase !== "init" && (
                      <span className="text-blue-400 text-xs font-bold">L</span>
                    )}
                    {isMid && (
                      <span className="text-yellow-400 text-xs font-bold">
                        M
                      </span>
                    )}
                    {idx === right && phase !== "init" && (
                      <span className="text-purple-400 text-xs font-bold">
                        R
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sorted half indicator */}
        {sortedHalf && phase === "running" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 p-3 bg-blue-500/20 border border-blue-500/50 rounded-md text-center"
          >
            <span className="text-blue-400 font-medium">
              {sortedHalf === "left" ? "← Left" : "Right →"} half is sorted
            </span>
          </motion.div>
        )}

        {/* Result */}
        {found !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 p-4 bg-green-500/20 border border-green-500/50 rounded-md text-center"
          >
            <span className="text-green-400 font-bold text-lg">
              Found {target} at index {found}!
            </span>
          </motion.div>
        )}

        {/* Message */}
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-md text-sm ${
            phase === "done"
              ? found !== null
                ? "bg-green-500/10 border border-green-500/30 text-green-400"
                : "bg-red-500/10 border border-red-500/30 text-red-400"
              : "bg-gray-800 text-gray-300"
          }`}
        >
          {message}
        </motion.div>

        {/* Legend */}
        <div className="mt-4 flex gap-4 text-xs justify-center">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-md bg-blue-500" />
            <span className="text-gray-400">Sorted Half</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-md bg-yellow-500" />
            <span className="text-gray-400">Mid</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-md bg-green-500" />
            <span className="text-gray-400">Found</span>
          </div>
        </div>

        {/* Key insight */}
        <div className="mt-4 p-3 bg-gray-800/30 rounded-md text-sm text-gray-400">
          <p>
            <strong className="text-orange-400">Key Insight:</strong> At any mid
            point, one half is ALWAYS sorted. Check if target is in the sorted
            half to decide direction.
          </p>
        </div>
      </div>
    </div>
  );
}
