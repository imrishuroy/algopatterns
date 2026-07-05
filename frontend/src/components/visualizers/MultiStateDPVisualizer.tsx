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
  currMax: number;
  currMin: number;
  maxProd: number;
  decision: "start" | "extendMax" | "extendMin";
  explanation: string;
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

interface ArrayItemProps {
  num: number;
  isCurrent: boolean;
  isPast: boolean;
}

const ArrayItem = ({ num, isCurrent, isPast }: ArrayItemProps) => (
  <motion.div
    animate={{
      backgroundColor: isCurrent ? "#a855f7" : isPast ? "#374151" : "#1f2937",
      scale: isCurrent ? 1.15 : 1,
      borderColor: isCurrent ? "#a855f7" : "#374151",
    }}
    className="w-12 h-12 rounded-md flex items-center justify-center font-bold text-lg border-2"
  >
    <span
      className={
        isCurrent ? "text-white" : num < 0 ? "text-red-400" : "text-white"
      }
    >
      {num}
    </span>
  </motion.div>
);

interface StatBoxProps {
  label: string;
  value: number;
  colorClass: string;
  bgClass: string;
}

const StatBox = ({ label, value, colorClass, bgClass }: StatBoxProps) => (
  <div className={`p-3 ${bgClass} rounded-md`}>
    <span className="text-gray-400 text-xs block mb-1">{label}</span>
    <motion.span
      key={value}
      initial={{ scale: 1.2 }}
      animate={{ scale: 1 }}
      className={`${colorClass} font-bold text-xl`}
    >
      {value}
    </motion.span>
  </div>
);

interface ControlsProps {
  isPlaying: boolean;
  isDone: boolean;
  speed: number;
  onToggle: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
}

const Controls = ({
  isPlaying,
  isDone,
  speed,
  onToggle,
  onReset,
  onSpeedChange,
}: ControlsProps) => (
  <div className="flex items-center gap-2 mb-4">
    <button
      onClick={onToggle}
      disabled={isDone}
      className={`px-4 py-2 rounded-md font-medium transition ${
        isPlaying ? "bg-yellow-500 text-black" : "bg-green-500 text-white"
      } disabled:opacity-50`}
    >
      {isPlaying ? "Pause" : "Play"}
    </button>
    <button
      onClick={onReset}
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
        onChange={(e) => onSpeedChange(2500 - Number(e.target.value))}
        className="w-20 accent-purple-500"
      />
    </div>
  </div>
);

const MultiStateDPVisualizer = () => {
  const [{ isPlaying }, dispatch] = useReducer(playReducer, {
    step: 0,
    isPlaying: false,
  });
  const [speed, setSpeed] = useState(1200);
  const [nums] = useState([2, 3, -2, 4, -1]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [steps, setSteps] = useState<Step[]>([]);
  const [phase, setPhase] = useState<"init" | "running" | "done">("init");
  const [message, setMessage] = useState(
    "Click Play to find the maximum product subarray"
  );

  const generateSteps = useCallback(() => {
    const result: Step[] = [];
    let maxProd = nums[0];
    let currMax = nums[0];
    let currMin = nums[0];

    result.push({
      index: 0,
      num: nums[0],
      currMax: nums[0],
      currMin: nums[0],
      maxProd: nums[0],
      decision: "start",
      explanation: `Initialize: currMax=${nums[0]}, currMin=${nums[0]}, maxProd=${nums[0]}`,
    });

    for (let i = 1; i < nums.length; i++) {
      const num = nums[i];
      const temp = currMax;

      const candidates = [num, num * currMax, num * currMin];
      const newMax = Math.max(...candidates);
      const newMin = Math.min(num, num * temp, num * currMin);

      let decision: "start" | "extendMax" | "extendMin";
      let explanation: string;

      if (newMax === num) {
        decision = "start";
        explanation = `${num} alone (${num}) beats extending. Start fresh!`;
      } else if (newMax === num * currMin) {
        decision = "extendMin";
        explanation = `${num} × min(${currMin}) = ${num * currMin}. Negative × Negative = Positive!`;
      } else {
        decision = "extendMax";
        explanation = `${num} × max(${temp}) = ${num * temp}. Extend the product.`;
      }

      currMax = newMax;
      currMin = newMin;
      maxProd = Math.max(maxProd, currMax);

      result.push({
        index: i,
        num,
        currMax,
        currMin,
        maxProd,
        decision,
        explanation,
      });
    }

    return result;
  }, [nums]);

  const reset = useCallback(() => {
    const newSteps = generateSteps();
    setSteps(newSteps);
    setCurrentStep(-1);
    setPhase("init");
    setMessage("Click Play to find the maximum product subarray");
    dispatch({ type: "STOP" });
  }, [generateSteps]);

  useEffect(() => {
    startTransition(() => {
      setSteps(generateSteps());
    });
  }, [generateSteps]);

  useEffect(() => {
    if (!isPlaying) return undefined;

    const timer = setTimeout(() => {
      if (phase === "init") {
        setPhase("running");
        setCurrentStep(0);
        const step = steps[0];
        setMessage(step.explanation);
        return;
      }

      const nextStep = currentStep + 1;
      if (nextStep >= steps.length) {
        setPhase("done");
        const finalStep = steps[steps.length - 1];
        setMessage(`Done! Maximum product = ${finalStep.maxProd}`);
        dispatch({ type: "STOP" });
        return;
      }

      setCurrentStep(nextStep);
      const step = steps[nextStep];
      setMessage(step.explanation);
    }, speed);

    return () => clearTimeout(timer);
  }, [isPlaying, phase, currentStep, steps, speed]);

  const current =
    currentStep >= 0 && currentStep < steps.length ? steps[currentStep] : null;

  const decisionClass =
    current?.decision === "start"
      ? "bg-blue-500/20 border border-blue-500/50 text-blue-400"
      : current?.decision === "extendMin"
        ? "bg-pink-500/20 border border-pink-500/50 text-pink-400"
        : "bg-green-500/20 border border-green-500/50 text-green-400";

  const decisionText =
    current?.decision === "start"
      ? "🔄 Start Fresh"
      : current?.decision === "extendMin"
        ? "🔀 Extend via Min (Negative Flip!)"
        : "📈 Extend via Max";

  return (
    <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">
          Maximum Product Subarray
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Track both max AND min at each position (negatives can flip!)
        </p>
      </div>

      <div className="p-4">
        <Controls
          isPlaying={isPlaying}
          isDone={phase === "done"}
          speed={speed}
          onToggle={() => dispatch({ type: "TOGGLE" })}
          onReset={reset}
          onSpeedChange={setSpeed}
        />

        <div className="mb-4 grid grid-cols-3 gap-3">
          <StatBox
            label="currMax"
            value={current?.currMax ?? nums[0]}
            colorClass="text-green-400"
            bgClass="bg-green-500/10 border border-green-500/30"
          />
          <StatBox
            label="currMin"
            value={current?.currMin ?? nums[0]}
            colorClass="text-red-400"
            bgClass="bg-red-500/10 border border-red-500/30"
          />
          <StatBox
            label="maxProd"
            value={current?.maxProd ?? nums[0]}
            colorClass="text-purple-400"
            bgClass="bg-purple-500/10 border border-purple-500/30"
          />
        </div>

        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">Array:</div>
          <div className="flex gap-2 justify-center flex-wrap">
            {nums.map((num, idx) => (
              <ArrayItem
                key={`num-${num}-${idx}`}
                num={num}
                isCurrent={current !== null && idx === current.index}
                isPast={current !== null && idx < current.index}
              />
            ))}
          </div>
          <div className="flex gap-2 justify-center mt-1">
            {nums.map((num, idx) => (
              <div
                key={`idx-${num}-${idx}`}
                className="w-12 text-center text-xs text-gray-500"
              >
                i={idx}
              </div>
            ))}
          </div>
        </div>

        {current && phase === "running" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`mb-4 p-3 rounded-md text-center font-medium ${decisionClass}`}
          >
            {decisionText}
          </motion.div>
        )}

        {phase === "done" && current && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 p-4 bg-purple-500/20 border border-purple-500/50 rounded-md text-center"
          >
            <div className="text-purple-400 font-bold text-lg">
              Maximum Product = {current.maxProd}
            </div>
          </motion.div>
        )}

        <motion.div
          key={message}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-md text-sm ${
            phase === "done"
              ? "bg-purple-500/10 border border-purple-500/30 text-purple-400"
              : "bg-gray-800 text-gray-300"
          }`}
        >
          {message}
        </motion.div>

        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-md bg-green-500" />
            <span className="text-gray-400">currMax (best positive)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-md bg-red-500" />
            <span className="text-gray-400">currMin (most negative)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-md bg-purple-500" />
            <span className="text-gray-400">Current position</span>
          </div>
        </div>

        <div className="mt-4 p-3 bg-gray-800/30 rounded-md text-sm text-gray-400">
          <p>
            <strong className="text-purple-400">Key Insight:</strong> Unlike
            sum, products can flip sign! A large negative (currMin) times
            another negative becomes the new maximum. That&apos;s why we track
            BOTH max and min.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MultiStateDPVisualizer;
