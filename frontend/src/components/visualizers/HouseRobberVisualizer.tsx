"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Phase = "tree" | "memo" | "table" | "optimized";

const houses = [2, 7, 9, 3, 1];

const generateTableSteps = () => {
  const n = houses.length;
  const steps: { i: number; value: number; formula: string; robOrSkip: string }[] = [];

  if (n === 0) return steps;

  steps.push({
    i: 0,
    value: houses[0],
    formula: `dp[0] = ${houses[0]} (only one house)`,
    robOrSkip: "rob",
  });

  if (n === 1) return steps;

  const dp1 = Math.max(houses[0], houses[1]);
  steps.push({
    i: 1,
    value: dp1,
    formula: `dp[1] = max(${houses[0]}, ${houses[1]}) = ${dp1}`,
    robOrSkip: dp1 === houses[1] ? "rob" : "skip",
  });

  const dp: number[] = [houses[0], dp1];

  for (let i = 2; i < n; i++) {
    const rob = houses[i] + dp[i - 2];
    const skip = dp[i - 1];
    const best = Math.max(rob, skip);
    dp.push(best);

    steps.push({
      i,
      value: best,
      formula: `dp[${i}] = max(${houses[i]} + dp[${i - 2}], dp[${i - 1}]) = max(${rob}, ${skip}) = ${best}`,
      robOrSkip: rob > skip ? "rob" : "skip",
    });
  }

  return steps;
};

const generateOptimizedSteps = () => {
  const n = houses.length;
  const steps: { i: number; prev2: number; prev1: number; curr?: number; formula: string }[] = [];

  if (n === 0) return steps;

  let prev2 = 0;
  let prev1 = houses[0];

  steps.push({
    i: 0,
    prev2: 0,
    prev1: houses[0],
    formula: `prev2 = 0, prev1 = ${houses[0]}`,
  });

  for (let i = 1; i < n; i++) {
    const curr = Math.max(prev1, houses[i] + prev2);
    steps.push({
      i,
      prev2,
      prev1,
      curr,
      formula: `curr = max(${prev1}, ${houses[i]} + ${prev2}) = ${curr}`,
    });
    prev2 = prev1;
    prev1 = curr;
  }

  return steps;
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
        className="w-10 h-10 flex items-center justify-center bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        title="Step Back"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {isPlaying ? (
        <button
          onClick={onPause}
          className="w-12 h-12 flex items-center justify-center bg-yellow-600 rounded-full hover:bg-yellow-500 transition-all shadow-lg shadow-yellow-600/20"
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
          className="w-12 h-12 flex items-center justify-center bg-green-600 rounded-full hover:bg-green-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-600/20"
          title="Play"
        >
          <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      )}

      <button
        onClick={onStep}
        disabled={step >= total}
        className="w-10 h-10 flex items-center justify-center bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        title="Step Forward"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <button
        onClick={onReset}
        className="w-10 h-10 flex items-center justify-center bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:border-gray-600 transition-all ml-2"
        title="Reset"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>

    <div className="flex items-center justify-center gap-4">
      <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-3 py-1.5">
        <span className="text-xs text-gray-500 uppercase tracking-wide">Speed</span>
        <div className="flex gap-1">
          {[
            { value: 1000, label: "0.5x" },
            { value: 600, label: "1x" },
            { value: 300, label: "2x" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSpeedChange(opt.value)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                speed === opt.value
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-3 py-1.5">
        <span className="text-xs text-gray-500 uppercase tracking-wide">Step</span>
        <span className="text-sm font-mono text-white">
          {step} <span className="text-gray-500">/</span> {total}
        </span>
      </div>
    </div>
  </div>
);

const HousesDisplay = ({ highlightIndex, robbed }: { highlightIndex?: number; robbed?: Set<number> }) => (
  <div className="flex justify-center gap-2 mb-4">
    {houses.map((value, i) => (
      <div key={i} className="flex flex-col items-center">
        <div
          className={`w-14 h-12 flex items-center justify-center rounded-t-lg border-2 transition-all ${
            highlightIndex === i
              ? "bg-blue-600 border-blue-400"
              : robbed?.has(i)
              ? "bg-green-600 border-green-400"
              : "bg-gray-800 border-gray-600"
          }`}
        >
          <span className="text-lg font-bold text-white">${value}</span>
        </div>
        <div className="w-14 h-6 bg-gray-700 rounded-b border-x-2 border-b-2 border-gray-600 flex items-center justify-center">
          <span className="text-xs text-gray-400">{i}</span>
        </div>
      </div>
    ))}
  </div>
);

const TreePhase = ({ step, showMemo }: { step: number; showMemo: boolean }) => {
  const currentIndex = Math.min(step, houses.length - 1);

  return (
    <div className="flex flex-col items-center gap-4">
      <HousesDisplay highlightIndex={currentIndex} />

      <div className="bg-gray-800/30 rounded-lg p-6 w-full">
        <div className="text-center mb-4">
          <div className="text-sm text-gray-400 mb-2">Decision at house {currentIndex}:</div>
          <div className="flex justify-center gap-8">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-lg bg-green-600/30 border-2 border-green-500 flex flex-col items-center justify-center">
                <span className="text-xs text-green-400">ROB</span>
                <span className="text-lg font-bold text-green-300">${houses[currentIndex]}</span>
              </div>
              <span className="text-xs text-gray-500 mt-2">+ skip to i+2</span>
            </div>
            <div className="flex items-center text-gray-500 text-2xl">or</div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-lg bg-red-600/30 border-2 border-red-500 flex flex-col items-center justify-center">
                <span className="text-xs text-red-400">SKIP</span>
                <span className="text-lg font-bold text-red-300">$0</span>
              </div>
              <span className="text-xs text-gray-500 mt-2">go to i+1</span>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-400 bg-gray-800/50 px-4 py-2 rounded-lg font-mono mt-4">
          rob({currentIndex}) = max(${houses[currentIndex]} + rob({currentIndex + 2}), rob({currentIndex + 1}))
        </div>
      </div>

      <div className="flex gap-6 text-sm text-gray-400">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-green-500 rounded-full" /> rob (take value)
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-red-500 rounded-full" /> skip (take 0)
        </span>
        {showMemo && (
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 bg-yellow-400 rounded-full" /> cached
          </span>
        )}
      </div>
    </div>
  );
};

const TablePhase = ({ step, tableSteps }: { step: number; tableSteps: ReturnType<typeof generateTableSteps> }) => {
  const currentDp = useMemo(() => {
    const dp: (number | null)[] = Array(houses.length).fill(null);
    for (let s = 0; s < Math.min(step, tableSteps.length); s++) {
      const { i, value } = tableSteps[s];
      dp[i] = value;
    }
    return dp;
  }, [step, tableSteps]);

  const currentStep = step > 0 && step <= tableSteps.length ? tableSteps[step - 1] : null;
  const robbedHouses = useMemo(() => {
    const robbed = new Set<number>();
    if (currentStep) {
      for (let s = 0; s < Math.min(step, tableSteps.length); s++) {
        if (tableSteps[s].robOrSkip === "rob") {
          robbed.add(tableSteps[s].i);
        }
      }
    }
    return robbed;
  }, [step, tableSteps, currentStep]);

  return (
    <div className="flex flex-col items-center gap-6">
      <HousesDisplay highlightIndex={currentStep?.i} robbed={robbedHouses} />

      <div className="text-center">
        <div className="text-sm text-gray-500 mb-3">dp[] array (max money up to house i)</div>
        <div className="flex gap-2 justify-center">
          {Array.from({ length: houses.length }, (_, i) => {
            const isCurrent = currentStep && currentStep.i === i;
            const value = currentDp[i];
            return (
              <div key={i} className="flex flex-col items-center">
                <div className="text-xs text-gray-500 mb-1">{i}</div>
                <div
                  className={`w-14 h-14 flex items-center justify-center border-2 rounded-lg text-lg font-mono transition-all ${
                    isCurrent
                      ? "bg-blue-600 border-blue-400 text-white font-bold"
                      : value !== null
                      ? "bg-gray-800 border-gray-600 text-gray-300"
                      : "bg-gray-900/50 border-gray-700 text-gray-600"
                  }`}
                >
                  {value !== null ? value : "?"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {currentStep && (
        <div className="text-base text-gray-400 text-center font-mono bg-gray-800/50 px-6 py-3 rounded-lg">
          {currentStep.formula}
        </div>
      )}

      <div className="text-sm text-gray-500 text-center">
        dp[i] = max(nums[i] + dp[i-2], dp[i-1]) = max(rob, skip)
      </div>
    </div>
  );
};

const OptimizedPhase = ({ step, optimizedSteps }: { step: number; optimizedSteps: ReturnType<typeof generateOptimizedSteps> }) => {
  const currentStep = step > 0 && step <= optimizedSteps.length ? optimizedSteps[step - 1] : null;

  return (
    <div className="flex flex-col items-center gap-6">
      <HousesDisplay highlightIndex={currentStep?.i} />

      <div className="text-center">
        <div className="text-sm text-gray-500 mb-4">Only 2 variables needed</div>
        <div className="flex gap-8 justify-center">
          <div className="flex flex-col items-center">
            <div className="text-xs text-gray-500 mb-2">prev2</div>
            <div className="w-16 h-16 flex items-center justify-center bg-purple-600/30 border-2 border-purple-500 rounded-lg text-xl font-mono text-purple-300">
              {currentStep ? currentStep.prev2 : 0}
            </div>
            <div className="text-xs text-gray-500 mt-1">dp[i-2]</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-xs text-gray-500 mb-2">prev1</div>
            <div className="w-16 h-16 flex items-center justify-center bg-blue-600/30 border-2 border-blue-500 rounded-lg text-xl font-mono text-blue-300">
              {currentStep ? currentStep.prev1 : houses[0]}
            </div>
            <div className="text-xs text-gray-500 mt-1">dp[i-1]</div>
          </div>
          {currentStep && currentStep.curr !== undefined && (
            <div className="flex flex-col items-center">
              <div className="text-xs text-gray-500 mb-2">curr</div>
              <div className="w-16 h-16 flex items-center justify-center bg-green-600/30 border-2 border-green-500 rounded-lg text-xl font-mono text-green-300 animate-pulse">
                {currentStep.curr}
              </div>
              <div className="text-xs text-gray-500 mt-1">dp[i]</div>
            </div>
          )}
        </div>
      </div>

      {currentStep && (
        <div className="text-base text-gray-400 text-center font-mono bg-gray-800/50 px-6 py-3 rounded-lg">
          {currentStep.i > 0 ? `i = ${currentStep.i}: ` : ""}{currentStep.formula}
        </div>
      )}

      <div className="text-sm text-gray-500 text-center max-w-md">
        Space O(1): curr = max(prev1, nums[i] + prev2), then slide window.
      </div>
    </div>
  );
};

export default function HouseRobberVisualizer() {
  const phases: Phase[] = ["tree", "memo", "table", "optimized"];
  const phaseLabels: Record<Phase, string> = {
    tree: "Decision Tree",
    memo: "Memoization",
    table: "Tabulation",
    optimized: "Space O(1)",
  };

  const [currentPhase, setCurrentPhase] = useState<Phase>("tree");
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(600);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const tableSteps = useMemo(() => generateTableSteps(), []);
  const optimizedSteps = useMemo(() => generateOptimizedSteps(), []);

  const getMaxSteps = useCallback(
    (phase: Phase) => {
      if (phase === "table") return tableSteps.length;
      if (phase === "optimized") return optimizedSteps.length;
      return houses.length;
    },
    [tableSteps.length, optimizedSteps.length]
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
        <div className="text-lg font-medium text-white">House Robber</div>
        <div className="text-sm text-gray-400">
          Max money without robbing adjacent houses
        </div>
      </div>

      <div className="flex justify-center mb-6">
        <div className="inline-flex bg-gray-800/50 p-1 rounded-xl">
          {phases.map((phase, index) => (
            <button
              key={phase}
              onClick={() => goToPhase(phase)}
              className={`relative px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                currentPhase === phase
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className={`w-5 h-5 flex items-center justify-center rounded-full text-xs ${
                  currentPhase === phase ? "bg-blue-500" : "bg-gray-700"
                }`}>
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
          {currentPhase === "tree" && <TreePhase step={step} showMemo={false} />}
          {currentPhase === "memo" && <TreePhase step={step} showMemo={true} />}
          {currentPhase === "table" && <TablePhase step={step} tableSteps={tableSteps} />}
          {currentPhase === "optimized" && <OptimizedPhase step={step} optimizedSteps={optimizedSteps} />}
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 pt-4 border-t border-gray-800 text-sm text-gray-500 text-center">
        houses = [{houses.join(", ")}] | f(i) = max(nums[i] + f(i-2), f(i-1)) | Answer: 12
      </div>
    </div>
  );
}
