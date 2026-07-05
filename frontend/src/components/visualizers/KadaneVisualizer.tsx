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
  index: number;
  num: number;
  currentSum: number;
  maxSum: number;
  decision: "extend" | "start";
  subarrayStart: number;
  subarrayEnd: number;
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

export default function KadaneVisualizer() {
  const [{ isPlaying }, dispatch] = useReducer(playReducer, {
    step: 0,
    isPlaying: false,
  });
  const [speed, setSpeed] = useState(1000);
  const [nums] = useState([-2, 1, -3, 4, -1, 2, 1, -5, 4]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [steps, setSteps] = useState<Step[]>([]);
  const [phase, setPhase] = useState<"init" | "running" | "done">("init");
  const [message, setMessage] = useState(
    "Click Play to find the maximum subarray sum"
  );

  const generateSteps = useCallback(() => {
    const result: Step[] = [];
    let maxSum = nums[0];
    let currentSum = nums[0];
    let start = 0;
    let maxStart = 0;
    let maxEnd = 0;

    result.push({
      index: 0,
      num: nums[0],
      currentSum: nums[0],
      maxSum: nums[0],
      decision: "start",
      subarrayStart: 0,
      subarrayEnd: 0,
    });

    for (let i = 1; i < nums.length; i++) {
      const extendSum = currentSum + nums[i];
      const startNew = nums[i];

      let decision: "extend" | "start";
      if (startNew > extendSum) {
        currentSum = startNew;
        start = i;
        decision = "start";
      } else {
        currentSum = extendSum;
        decision = "extend";
      }

      if (currentSum > maxSum) {
        maxSum = currentSum;
        maxStart = start;
        maxEnd = i;
      }

      result.push({
        index: i,
        num: nums[i],
        currentSum,
        maxSum,
        decision,
        subarrayStart: maxStart,
        subarrayEnd: maxEnd,
      });
    }

    return result;
  }, [nums]);

  const reset = useCallback(() => {
    const newSteps = generateSteps();
    setSteps(newSteps);
    setCurrentStep(-1);
    setPhase("init");
    setMessage("Click Play to find the maximum subarray sum");
    dispatch({ type: "STOP" });
  }, [generateSteps]);

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
        setCurrentStep(0);
        const step = steps[0];
        setMessage(
          `i=0: Start with nums[0]=${step.num}. currentSum=${step.currentSum}, maxSum=${step.maxSum}`
        );
        return;
      }

      const nextStep = currentStep + 1;
      if (nextStep >= steps.length) {
        setPhase("done");
        const finalStep = steps[steps.length - 1];
        setMessage(
          `Done! Maximum subarray sum = ${finalStep.maxSum} (indices ${finalStep.subarrayStart} to ${finalStep.subarrayEnd})`
        );
        dispatch({ type: "STOP" });
        return;
      }

      setCurrentStep(nextStep);
      const step = steps[nextStep];
      const prevSum = steps[nextStep - 1].currentSum;

      if (step.decision === "start") {
        setMessage(
          `i=${step.index}: ${step.num} > ${prevSum} + ${step.num} = ${prevSum + step.num}. Start new subarray! currentSum=${step.currentSum}`
        );
      } else {
        setMessage(
          `i=${step.index}: ${prevSum} + ${step.num} = ${step.currentSum} >= ${step.num}. Extend subarray. currentSum=${step.currentSum}`
        );
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [isPlaying, phase, currentStep, steps, speed]);

  const current =
    currentStep >= 0 && currentStep < steps.length ? steps[currentStep] : null;

  return (
    <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">
          Kadane&apos;s Algorithm
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Find maximum subarray sum in O(n) time
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
              max="1500"
              step="100"
              value={2000 - speed}
              onChange={(e) => setSpeed(2000 - Number(e.target.value))}
              className="w-20 accent-amber-500"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-800/50 rounded-md">
            <span className="text-gray-400 text-sm">Current Sum: </span>
            <motion.span
              key={current?.currentSum}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              className={`font-bold text-xl ${
                current && current.currentSum > 0
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {current?.currentSum ?? 0}
            </motion.span>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-md">
            <span className="text-gray-400 text-sm">Max Sum: </span>
            <motion.span
              key={current?.maxSum}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              className="text-amber-400 font-bold text-xl"
            >
              {current?.maxSum ?? nums[0]}
            </motion.span>
          </div>
        </div>

        {/* Array visualization */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">Array:</div>
          <div className="flex gap-1 justify-center flex-wrap">
            {nums.map((num, idx) => {
              const isInMaxSubarray =
                current &&
                idx >= current.subarrayStart &&
                idx <= current.subarrayEnd;
              const isCurrent = current && idx === current.index;

              return (
                <motion.div
                  key={`num-${num}-${idx}`}
                  animate={{
                    backgroundColor: isCurrent
                      ? "#eab308"
                      : isInMaxSubarray
                        ? "#22c55e"
                        : "#374151",
                    scale: isCurrent ? 1.15 : 1,
                  }}
                  className="w-10 h-10 rounded-md flex items-center justify-center font-bold text-sm"
                >
                  <span
                    className={
                      isCurrent
                        ? "text-black"
                        : isInMaxSubarray
                          ? "text-black"
                          : "text-white"
                    }
                  >
                    {num}
                  </span>
                </motion.div>
              );
            })}
          </div>
          <div className="flex gap-1 justify-center mt-1">
            {nums.map((num, idx) => (
              <div
                key={`num-${num}-${idx}`}
                className="w-10 text-center text-xs text-gray-500"
              >
                {idx}
              </div>
            ))}
          </div>
        </div>

        {/* Decision indicator */}
        {current && phase === "running" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`mb-4 p-3 rounded-md text-center font-medium ${
              current.decision === "start"
                ? "bg-blue-500/20 border border-blue-500/50 text-blue-400"
                : "bg-green-500/20 border border-green-500/50 text-green-400"
            }`}
          >
            {current.decision === "start"
              ? "🔄 Start New Subarray"
              : "➕ Extend Subarray"}
          </motion.div>
        )}

        {/* Final result */}
        {phase === "done" && current && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 p-4 bg-amber-500/20 border border-amber-500/50 rounded-md text-center"
          >
            <div className="text-amber-400 font-bold text-lg">
              Maximum Sum = {current.maxSum}
            </div>
            <div className="text-gray-400 text-sm mt-1">
              Subarray: [
              {nums
                .slice(current.subarrayStart, current.subarrayEnd + 1)
                .join(", ")}
              ] (indices {current.subarrayStart} to {current.subarrayEnd})
            </div>
          </motion.div>
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

        {/* Legend */}
        <div className="mt-4 flex gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-md bg-yellow-500" />
            <span className="text-gray-400">Current</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-md bg-green-500" />
            <span className="text-gray-400">Max Subarray</span>
          </div>
        </div>

        {/* Key insight */}
        <div className="mt-4 p-3 bg-gray-800/30 rounded-md text-sm text-gray-400">
          <p>
            <strong className="text-amber-400">Key Insight:</strong> At each
            position, decide: extend previous subarray or start fresh? If
            previous sum is negative, starting fresh is always better.
          </p>
        </div>
      </div>
    </div>
  );
}
