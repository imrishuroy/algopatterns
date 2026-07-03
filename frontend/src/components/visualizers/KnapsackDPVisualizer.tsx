"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Item {
  name: string;
  weight: number;
  value: number;
  color: string;
}

type Phase = "tree" | "memo" | "table" | "optimized";

const items: Item[] = [
  { name: "A", weight: 1, value: 1, color: "blue" },
  { name: "B", weight: 3, value: 4, color: "purple" },
  { name: "C", weight: 4, value: 5, color: "green" },
];

const capacity = 7;

const generateTableSteps = () => {
  const n = items.length;
  const steps: {
    i: number;
    w: number;
    value: number;
    take: boolean;
    skipValue: number;
    takeValue: number;
    formula: string;
  }[] = [];

  const dp: number[][] = Array(n + 1)
    .fill(null)
    .map(() => Array(capacity + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      const item = items[i - 1];
      const skipValue = dp[i - 1][w];

      if (item.weight <= w) {
        const takeValue = dp[i - 1][w - item.weight] + item.value;
        const take = takeValue > skipValue;
        dp[i][w] = Math.max(skipValue, takeValue);

        steps.push({
          i,
          w,
          value: dp[i][w],
          take,
          skipValue,
          takeValue,
          formula: `dp[${i}][${w}] = max(skip=${skipValue}, take=${takeValue}) = ${dp[i][w]}`,
        });
      } else {
        dp[i][w] = skipValue;
        steps.push({
          i,
          w,
          value: dp[i][w],
          take: false,
          skipValue,
          takeValue: 0,
          formula: `dp[${i}][${w}] = skip (item too heavy) = ${dp[i][w]}`,
        });
      }
    }
  }

  return steps;
};

const generateOptimizedSteps = () => {
  const steps: {
    itemIdx: number;
    w: number;
    oldValue: number;
    newValue: number;
    formula: string;
  }[] = [];

  const dp: number[] = Array(capacity + 1).fill(0);

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    for (let w = capacity; w >= item.weight; w--) {
      const oldValue = dp[w];
      const takeValue = dp[w - item.weight] + item.value;
      dp[w] = Math.max(dp[w], takeValue);

      steps.push({
        itemIdx: i,
        w,
        oldValue,
        newValue: dp[w],
        formula: `dp[${w}] = max(${oldValue}, dp[${w - item.weight}]+${item.value}) = ${dp[w]}`,
      });
    }
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

const ItemsDisplay = ({ currentItem }: { currentItem?: number }) => (
  <div className="flex justify-center gap-3 mb-4">
    {items.map((item, i) => (
      <div
        key={i}
        className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
          currentItem === i
            ? "bg-blue-600/20 border-blue-500"
            : "bg-gray-800/50 border-gray-700"
        }`}
      >
        <div className="text-lg font-bold text-white">{item.name}</div>
        <div className="text-xs text-gray-400 mt-1">{item.weight}kg</div>
        <div className="text-sm font-medium text-green-400">${item.value}</div>
      </div>
    ))}
    <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-orange-600/20 border-2 border-orange-500">
      <div className="text-xs text-orange-300">Capacity</div>
      <div className="text-xl font-bold text-orange-400">{capacity}kg</div>
    </div>
  </div>
);

const TreePhase = ({ step, showMemo }: { step: number; showMemo: boolean }) => {
  const currentItemIdx = Math.min(Math.floor(step / 2), items.length - 1);
  const isDecisionStep = step % 2 === 1;

  return (
    <div className="flex flex-col items-center gap-4">
      <ItemsDisplay currentItem={currentItemIdx} />

      <div className="bg-gray-800/30 rounded-lg p-6 w-full">
        <div className="text-center mb-4">
          <div className="text-sm text-gray-400 mb-2">
            At item {items[currentItemIdx]?.name} ({items[currentItemIdx]?.weight}kg, ${items[currentItemIdx]?.value}):
          </div>
          <div className="flex justify-center gap-8">
            <div className="flex flex-col items-center">
              <div className={`w-24 h-20 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
                isDecisionStep ? "bg-green-600/30 border-green-500" : "bg-gray-800 border-gray-600"
              }`}>
                <span className="text-xs text-green-400">TAKE</span>
                <span className="text-lg font-bold text-green-300">+${items[currentItemIdx]?.value}</span>
                <span className="text-xs text-gray-400">-{items[currentItemIdx]?.weight}kg</span>
              </div>
            </div>
            <div className="flex items-center text-gray-500 text-2xl">or</div>
            <div className="flex flex-col items-center">
              <div className={`w-24 h-20 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
                !isDecisionStep && step > 0 ? "bg-red-600/30 border-red-500" : "bg-gray-800 border-gray-600"
              }`}>
                <span className="text-xs text-red-400">SKIP</span>
                <span className="text-lg font-bold text-red-300">+$0</span>
                <span className="text-xs text-gray-400">same cap</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-400 bg-gray-800/50 px-4 py-2 rounded-lg font-mono mt-4">
          knapsack({items.length - 1 - currentItemIdx}, cap) = max(skip, take)
        </div>
      </div>

      <div className="flex gap-6 text-sm text-gray-400">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-green-500 rounded-full" /> take (add value, reduce capacity)
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-red-500 rounded-full" /> skip (keep capacity)
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
    const dp: (number | null)[][] = Array(items.length + 1)
      .fill(null)
      .map(() => Array(capacity + 1).fill(null));

    for (let w = 0; w <= capacity; w++) dp[0][w] = 0;

    for (let s = 0; s < Math.min(step, tableSteps.length); s++) {
      const { i, w, value } = tableSteps[s];
      dp[i][w] = value;
    }

    return dp;
  }, [step, tableSteps]);

  const currentStep = step > 0 && step <= tableSteps.length ? tableSteps[step - 1] : null;

  return (
    <div className="flex flex-col items-center gap-6">
      <ItemsDisplay currentItem={currentStep ? currentStep.i - 1 : undefined} />

      <div className="overflow-x-auto w-full flex justify-center">
        <table className="border-collapse text-sm">
          <thead>
            <tr>
              <th className="p-2 text-gray-500 w-16 text-center font-medium">Item</th>
              {Array.from({ length: capacity + 1 }, (_, w) => (
                <th key={w} className="p-2 text-gray-400 w-12 text-center font-medium">{w}kg</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: items.length + 1 }, (_, i) => (
              <tr key={i}>
                <td className="p-2 text-gray-400 text-center font-medium">
                  {i === 0 ? "-" : items[i - 1].name}
                </td>
                {Array.from({ length: capacity + 1 }, (_, w) => {
                  const isCurrent = currentStep && currentStep.i === i && currentStep.w === w;
                  const value = currentDp[i][w];
                  const wasTaken = currentStep && currentStep.i === i && currentStep.w === w && currentStep.take;

                  return (
                    <td
                      key={w}
                      className={`p-1 text-center border-2 w-12 h-12 transition-colors ${
                        isCurrent
                          ? wasTaken
                            ? "bg-green-600 border-green-400"
                            : "bg-blue-600 border-blue-400"
                          : value !== null
                          ? "bg-gray-800 border-gray-600"
                          : "bg-gray-900/50 border-gray-700"
                      }`}
                    >
                      {value !== null && (
                        <span className={`font-mono ${isCurrent ? "text-white font-bold" : "text-gray-300"}`}>
                          {value}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {currentStep && (
        <div className={`text-base text-center font-mono px-6 py-3 rounded-lg ${
          currentStep.take
            ? "bg-green-600/20 text-green-400"
            : "bg-gray-800/50 text-gray-400"
        }`}>
          {currentStep.formula}
        </div>
      )}

      <div className="text-sm text-gray-500 text-center">
        dp[i][w] = max(dp[i-1][w], dp[i-1][w-weight] + value)
      </div>
    </div>
  );
};

const OptimizedPhase = ({ step, optimizedSteps }: { step: number; optimizedSteps: ReturnType<typeof generateOptimizedSteps> }) => {
  const currentDp = useMemo(() => {
    const dp: number[] = Array(capacity + 1).fill(0);
    for (let s = 0; s < Math.min(step, optimizedSteps.length); s++) {
      const { w, newValue } = optimizedSteps[s];
      dp[w] = newValue;
    }
    return dp;
  }, [step, optimizedSteps]);

  const currentStep = step > 0 && step <= optimizedSteps.length ? optimizedSteps[step - 1] : null;

  return (
    <div className="flex flex-col items-center gap-6">
      <ItemsDisplay currentItem={currentStep?.itemIdx} />

      <div className="text-center">
        <div className="text-sm text-gray-500 mb-3">1D dp[] array (REVERSE iteration)</div>
        <div className="flex gap-1 justify-center">
          {Array.from({ length: capacity + 1 }, (_, w) => {
            const isCurrent = currentStep && currentStep.w === w;
            const value = currentDp[w];
            return (
              <div key={w} className="flex flex-col items-center">
                <div className="text-xs text-gray-500 mb-1">{w}kg</div>
                <div
                  className={`w-12 h-12 flex items-center justify-center border-2 rounded-lg text-sm font-mono transition-all ${
                    isCurrent
                      ? "bg-blue-600 border-blue-400 text-white font-bold"
                      : "bg-gray-800 border-gray-600 text-gray-300"
                  }`}
                >
                  {value}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {currentStep && (
        <div className="text-base text-gray-400 text-center font-mono bg-gray-800/50 px-6 py-3 rounded-lg">
          Item {items[currentStep.itemIdx].name}: {currentStep.formula}
        </div>
      )}

      <div className="text-sm text-gray-500 text-center max-w-md">
        <span className="text-yellow-400">REVERSE loop (w = capacity down to weight)</span> ensures each item is used only once.
        Forward loop would allow reusing items.
      </div>
    </div>
  );
};

export default function KnapsackDPVisualizer() {
  const phases: Phase[] = ["tree", "memo", "table", "optimized"];
  const phaseLabels: Record<Phase, string> = {
    tree: "Decision Tree",
    memo: "Memoization",
    table: "2D Table",
    optimized: "1D (Reverse)",
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
      return items.length * 2;
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
        <div className="text-lg font-medium text-white">0/1 Knapsack</div>
        <div className="text-sm text-gray-400">
          Maximize value without exceeding capacity (each item used at most once)
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
        Items: A(1kg,$1), B(3kg,$4), C(4kg,$5) | Capacity: {capacity}kg | Answer: $9 (B+C)
      </div>
    </div>
  );
}
