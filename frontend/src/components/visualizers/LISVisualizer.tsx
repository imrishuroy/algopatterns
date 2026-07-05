"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

type Phase = "tree" | "memo" | "table" | "binary";

const nums = [10, 9, 2, 5, 3, 7, 101, 18];

const generateTableSteps = () => {
  const n = nums.length;
  const steps: {
    i: number;
    j: number;
    newLen: number;
    formula: string;
    improved: boolean;
  }[] = [];
  const dp: number[] = Array(n).fill(1);

  for (let i = 1; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) {
        const oldLen = dp[i];
        const candidate = dp[j] + 1;
        const improved = candidate > oldLen;
        if (improved) dp[i] = candidate;
        steps.push({
          i,
          j,
          newLen: dp[i],
          formula: `nums[${j}]=${nums[j]} < nums[${i}]=${nums[i]}: dp[${i}] = max(${oldLen}, dp[${j}]+1) = ${dp[i]}`,
          improved,
        });
      }
    }
  }

  return { steps, dp, maxLen: Math.max(...dp) };
};

const generateBinarySteps = () => {
  const steps: { i: number; num: number; tails: number[]; action: string }[] =
    [];
  const tails: number[] = [];

  for (let i = 0; i < nums.length; i++) {
    const num = nums[i];
    let left = 0,
      right = tails.length;

    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (tails[mid] < num) left = mid + 1;
      else right = mid;
    }

    if (left === tails.length) {
      tails.push(num);
      steps.push({
        i,
        num,
        tails: [...tails],
        action: `${num} > all tails, append. LIS length = ${tails.length}`,
      });
    } else {
      tails[left] = num;
      steps.push({
        i,
        num,
        tails: [...tails],
        action: `Replace tails[${left}] with ${num}. LIS length = ${tails.length}`,
      });
    }
  }

  return { steps, finalLen: tails.length };
};

const Controls = ({
  isPlaying,
  onPlay,
  onPause,
  onStep,
  onBack,
  onReset,
  speed,
  onSpeedChange,
  step,
  total,
}: {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStep: () => void;
  onBack: () => void;
  onReset: () => void;
  speed: number;
  onSpeedChange: (s: number) => void;
  step: number;
  total: number;
}) => (
  <div className="flex flex-col gap-4">
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={onBack}
        disabled={step === 0}
        className="w-10 h-10 flex items-center justify-center bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 disabled:opacity-30 transition-all"
        title="Back"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      {isPlaying ? (
        <button
          onClick={onPause}
          className="w-12 h-12 flex items-center justify-center bg-yellow-600 rounded-full hover:bg-yellow-500 transition-all shadow-lg"
          title="Pause"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        </button>
      ) : (
        <button
          onClick={onPlay}
          disabled={step >= total}
          className="w-12 h-12 flex items-center justify-center bg-green-600 rounded-full hover:bg-green-500 disabled:opacity-30 transition-all shadow-lg"
          title="Play"
        >
          <svg
            className="w-6 h-6 ml-0.5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      )}
      <button
        onClick={onStep}
        disabled={step >= total}
        className="w-10 h-10 flex items-center justify-center bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 disabled:opacity-30 transition-all"
        title="Step"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
      <button
        onClick={onReset}
        className="w-10 h-10 flex items-center justify-center bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-all ml-2"
        title="Reset"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>
    </div>
    <div className="flex items-center justify-center gap-4">
      <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-3 py-1.5">
        <span className="text-xs text-gray-500 uppercase">Speed</span>
        <div className="flex gap-1">
          {[
            { value: 1000, label: "0.5x" },
            { value: 600, label: "1x" },
            { value: 300, label: "2x" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSpeedChange(opt.value)}
              className={`px-2.5 py-1 rounded text-xs font-medium ${speed === opt.value ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-3 py-1.5">
        <span className="text-xs text-gray-500 uppercase">Step</span>
        <span className="text-sm font-mono text-white">
          {step} <span className="text-gray-500">/</span> {total}
        </span>
      </div>
    </div>
  </div>
);

const ArrayDisplay = ({
  highlightI,
  highlightJ,
}: {
  highlightI?: number;
  highlightJ?: number;
}) => (
  <div className="flex justify-center gap-1 mb-4">
    {nums.map((num, numIndex) => (
      <div
        key={`num-${num}-${numIndex}`}
        className="flex flex-col items-center"
      >
        <div className="text-xs text-gray-500 mb-1">{numIndex}</div>
        <div
          className={`w-10 h-10 flex items-center justify-center rounded font-mono font-bold transition-all ${
            highlightI === numIndex
              ? "bg-blue-600 text-white"
              : highlightJ === numIndex
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-300"
          }`}
        >
          {num}
        </div>
      </div>
    ))}
  </div>
);

const TablePhase = ({
  step,
  tableSteps,
}: {
  step: number;
  tableSteps: ReturnType<typeof generateTableSteps>["steps"];
}) => {
  const currentDp = useMemo(() => {
    const dp = Array(nums.length).fill(1);
    for (let s = 0; s < Math.min(step, tableSteps.length); s++) {
      const { i, newLen } = tableSteps[s];
      dp[i] = Math.max(dp[i], newLen);
    }
    return dp;
  }, [step, tableSteps]);

  const currentStep =
    step > 0 && step <= tableSteps.length ? tableSteps[step - 1] : null;

  return (
    <div className="flex flex-col items-center gap-6">
      <ArrayDisplay highlightI={currentStep?.i} highlightJ={currentStep?.j} />
      <div className="text-center">
        <div className="text-sm text-gray-500 mb-3">
          dp[i] = LIS length ending at index i
        </div>
        <div className="flex gap-1 justify-center">
          {currentDp.map((len, dpIndex) => (
            <div
              key={`dp-${len}-${dpIndex}`}
              className="flex flex-col items-center"
            >
              <div className="text-xs text-gray-500 mb-1">{dpIndex}</div>
              <div
                className={`w-10 h-10 flex items-center justify-center border-2 rounded font-mono transition-all ${
                  currentStep?.i === dpIndex
                    ? "bg-blue-600 border-blue-400 text-white font-bold"
                    : "bg-gray-800 border-gray-600 text-gray-300"
                }`}
              >
                {len}
              </div>
            </div>
          ))}
        </div>
      </div>
      {currentStep && (
        <div
          className={`text-sm text-center font-mono px-6 py-3 rounded-lg ${currentStep.improved ? "bg-green-600/20 text-green-400" : "bg-gray-800/50 text-gray-400"}`}
        >
          {currentStep.formula}
        </div>
      )}
      <div className="text-sm text-gray-500">
        For each i, check all j &lt; i where nums[j] &lt; nums[i]
      </div>
    </div>
  );
};

const BinaryPhase = ({
  step,
  binarySteps,
}: {
  step: number;
  binarySteps: ReturnType<typeof generateBinarySteps>["steps"];
}) => {
  const currentStep =
    step > 0 && step <= binarySteps.length ? binarySteps[step - 1] : null;
  const currentTails = currentStep?.tails || [];

  return (
    <div className="flex flex-col items-center gap-6">
      <ArrayDisplay highlightI={currentStep?.i} />
      <div className="text-center">
        <div className="text-sm text-gray-500 mb-3">
          tails[] = smallest ending element for each LIS length
        </div>
        <div className="flex gap-1 justify-center min-h-[50px]">
          {currentTails.length > 0 ? (
            currentTails.map((val, tailIndex) => (
              <div
                key={`tail-${val}-${tailIndex}`}
                className="flex flex-col items-center"
              >
                <div className="text-xs text-gray-500 mb-1">
                  len {tailIndex + 1}
                </div>
                <div className="w-10 h-10 flex items-center justify-center bg-green-600/30 border-2 border-green-500 rounded font-mono text-green-300">
                  {val}
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-500">Empty</div>
          )}
        </div>
      </div>
      {currentStep && (
        <div className="text-sm text-center font-mono bg-gray-800/50 text-gray-400 px-6 py-3 rounded-lg">
          Processing {currentStep.num}: {currentStep.action}
        </div>
      )}
      <div className="text-sm text-gray-500 text-center max-w-md">
        O(n log n): Binary search to find position, then append or replace.
        tails.length = LIS length.
      </div>
    </div>
  );
};

export default function LISVisualizer() {
  // skipcq: JS-0067
  const phases: Phase[] = ["tree", "memo", "table", "binary"];
  const phaseLabels: Record<Phase, string> = {
    tree: "Recursion",
    memo: "Memoization",
    table: "O(n²) DP",
    binary: "O(n log n)",
  };

  const [currentPhase, setCurrentPhase] = useState<Phase>("table");
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(600);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { steps: tableSteps, maxLen } = useMemo(() => generateTableSteps(), []);
  const { steps: binarySteps } = useMemo(() => generateBinarySteps(), []);

  const getMaxSteps = useCallback(
    (phase: Phase) => {
      if (phase === "table") return tableSteps.length;
      if (phase === "binary") return binarySteps.length;
      return nums.length;
    },
    [tableSteps.length, binarySteps.length]
  );

  const maxSteps = getMaxSteps(currentPhase);

  useEffect(() => {
    if (isPlaying && step < maxSteps) {
      intervalRef.current = setTimeout(() => {
        setStep((s) => {
          if (s + 1 >= maxSteps) setIsPlaying(false);
          return s + 1;
        });
      }, speed);
    }
    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [isPlaying, step, speed, maxSteps]);

  const goToPhase = (phase: Phase) => {
    setCurrentPhase(phase);
    setStep(0);
    setIsPlaying(false);
  };

  return (
    <div className="p-6 bg-gray-900 rounded-xl w-full max-w-4xl mx-auto">
      <div className="text-center mb-4">
        <div className="text-lg font-medium text-white">
          Longest Increasing Subsequence (LIS)
        </div>
        <div className="text-sm text-gray-400">
          Find the length of the longest strictly increasing subsequence
        </div>
      </div>
      <div className="flex justify-center mb-6">
        <div className="inline-flex bg-gray-800/50 p-1 rounded-xl">
          {phases.map((phase, index) => (
            <button
              key={phase}
              onClick={() => goToPhase(phase)}
              className={`relative px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${currentPhase === phase ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
            >
              <span className="flex items-center gap-2">
                <span
                  className={`w-5 h-5 flex items-center justify-center rounded-full text-xs ${currentPhase === phase ? "bg-blue-500" : "bg-gray-700"}`}
                >
                  {index + 1}
                </span>
                {phaseLabels[phase]}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="mb-6">
        <Controls
          isPlaying={isPlaying}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onStep={() => step < maxSteps && setStep((s) => s + 1)}
          onBack={() => step > 0 && setStep((s) => s - 1)}
          onReset={() => {
            setStep(0);
            setIsPlaying(false);
          }}
          speed={speed}
          onSpeedChange={setSpeed}
          step={step}
          total={maxSteps}
        />
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPhase}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {(currentPhase === "tree" || currentPhase === "memo") && (
            <TablePhase step={0} tableSteps={tableSteps} />
          )}
          {currentPhase === "table" && (
            <TablePhase step={step} tableSteps={tableSteps} />
          )}
          {currentPhase === "binary" && (
            <BinaryPhase step={step} binarySteps={binarySteps} />
          )}
        </motion.div>
      </AnimatePresence>
      <div className="mt-6 pt-4 border-t border-gray-800 text-sm text-gray-500 text-center">
        nums = [{nums.join(", ")}] | LIS length = {maxLen} | Example: [2, 3, 7,
        101]
      </div>
    </div>
  );
}
