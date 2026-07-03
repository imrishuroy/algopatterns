"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Phase = "tree" | "memo" | "table" | "compare";

const coins = [1, 2, 5];
const targetAmount = 11;

const generateTableSteps = () => {
  const steps: {
    amount: number;
    coin: number;
    oldValue: number;
    newValue: number;
    formula: string;
    improved: boolean;
  }[] = [];

  const dp: number[] = Array(targetAmount + 1).fill(targetAmount + 1);
  dp[0] = 0;

  for (let a = 1; a <= targetAmount; a++) {
    for (const coin of coins) {
      if (coin <= a) {
        const oldValue = dp[a];
        const candidate = dp[a - coin] + 1;
        const improved = candidate < oldValue;
        dp[a] = Math.min(dp[a], candidate);

        steps.push({
          amount: a,
          coin,
          oldValue,
          newValue: dp[a],
          formula: `dp[${a}] = min(${oldValue === targetAmount + 1 ? "INF" : oldValue}, dp[${a - coin}]+1) = min(${oldValue === targetAmount + 1 ? "INF" : oldValue}, ${dp[a - coin] === targetAmount + 1 ? "INF" : candidate}) = ${dp[a]}`,
          improved,
        });
      }
    }
  }

  return steps;
};

const generateCompareSteps = () => {
  const forwardSteps: { amount: number; value: number; coinUsed: number }[] = [];
  const reverseSteps: { amount: number; value: number; coinUsed: number }[] = [];

  const dpForward: number[] = Array(targetAmount + 1).fill(targetAmount + 1);
  dpForward[0] = 0;

  for (const coin of coins) {
    for (let a = coin; a <= targetAmount; a++) {
      if (dpForward[a - coin] + 1 < dpForward[a]) {
        dpForward[a] = dpForward[a - coin] + 1;
        forwardSteps.push({ amount: a, value: dpForward[a], coinUsed: coin });
      }
    }
  }

  const dpReverse: number[] = Array(targetAmount + 1).fill(targetAmount + 1);
  dpReverse[0] = 0;

  for (const coin of coins) {
    for (let a = targetAmount; a >= coin; a--) {
      if (dpReverse[a - coin] + 1 < dpReverse[a]) {
        dpReverse[a] = dpReverse[a - coin] + 1;
        reverseSteps.push({ amount: a, value: dpReverse[a], coinUsed: coin });
      }
    }
  }

  return { forwardSteps, reverseSteps, dpForward, dpReverse };
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

const CoinsDisplay = ({ currentCoin }: { currentCoin?: number }) => (
  <div className="flex justify-center gap-4 mb-4">
    {coins.map((coin) => (
      <div
        key={coin}
        className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
          currentCoin === coin
            ? "bg-yellow-600/20 border-yellow-500"
            : "bg-gray-800/50 border-gray-700"
        }`}
      >
        <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-black font-bold">
          {coin}
        </div>
        <div className="text-xs text-gray-400 mt-1">coin</div>
      </div>
    ))}
    <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-green-600/20 border-2 border-green-500">
      <div className="text-xs text-green-300">Target</div>
      <div className="text-xl font-bold text-green-400">{targetAmount}</div>
    </div>
  </div>
);

const TreePhase = ({ step, showMemo }: { step: number; showMemo: boolean }) => {
  const currentAmount = Math.max(0, targetAmount - step);

  return (
    <div className="flex flex-col items-center gap-4">
      <CoinsDisplay />

      <div className="bg-gray-800/30 rounded-lg p-6 w-full">
        <div className="text-center mb-4">
          <div className="text-sm text-gray-400 mb-2">
            For amount = {currentAmount}, try each coin:
          </div>
          <div className="flex justify-center gap-4 flex-wrap">
            {coins.map((coin) => (
              <div key={coin} className="flex flex-col items-center">
                <div className={`w-20 h-20 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
                  coin <= currentAmount ? "bg-green-600/30 border-green-500" : "bg-gray-800 border-gray-600 opacity-50"
                }`}>
                  <span className="text-xs text-gray-400">use coin {coin}</span>
                  <span className="text-lg font-bold text-green-300">
                    {coin <= currentAmount ? `f(${currentAmount - coin})` : "N/A"}
                  </span>
                  <span className="text-xs text-gray-400">+ 1</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center text-sm text-gray-400 bg-gray-800/50 px-4 py-2 rounded-lg font-mono mt-4">
          f({currentAmount}) = 1 + min({coins.filter(c => c <= currentAmount).map(c => `f(${currentAmount - c})`).join(", ") || "no valid coins"})
        </div>
      </div>

      <div className="flex gap-6 text-sm text-gray-400">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-green-500 rounded-full" /> valid coin choice
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-gray-500 rounded-full" /> coin too large
        </span>
        {showMemo && (
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 bg-yellow-400 rounded-full" /> cached result
          </span>
        )}
      </div>
    </div>
  );
};

const TablePhase = ({ step, tableSteps }: { step: number; tableSteps: ReturnType<typeof generateTableSteps> }) => {
  const currentDp = useMemo(() => {
    const dp: number[] = Array(targetAmount + 1).fill(targetAmount + 1);
    dp[0] = 0;

    for (let s = 0; s < Math.min(step, tableSteps.length); s++) {
      const { amount, newValue } = tableSteps[s];
      dp[amount] = newValue;
    }

    return dp;
  }, [step, tableSteps]);

  const currentStep = step > 0 && step <= tableSteps.length ? tableSteps[step - 1] : null;

  return (
    <div className="flex flex-col items-center gap-6">
      <CoinsDisplay currentCoin={currentStep?.coin} />

      <div className="text-center">
        <div className="text-sm text-gray-500 mb-3">dp[] array (min coins for each amount)</div>
        <div className="flex gap-1 justify-center flex-wrap">
          {Array.from({ length: targetAmount + 1 }, (_, a) => {
            const isCurrent = currentStep && currentStep.amount === a;
            const value = currentDp[a];
            const isInfinite = value > targetAmount;
            return (
              <div key={a} className="flex flex-col items-center">
                <div className="text-xs text-gray-500 mb-1">{a}</div>
                <div
                  className={`w-10 h-10 flex items-center justify-center border-2 rounded-lg text-sm font-mono transition-all ${
                    isCurrent
                      ? currentStep.improved
                        ? "bg-green-600 border-green-400 text-white font-bold"
                        : "bg-blue-600 border-blue-400 text-white font-bold"
                      : isInfinite
                      ? "bg-gray-900/50 border-gray-700 text-gray-600"
                      : "bg-gray-800 border-gray-600 text-gray-300"
                  }`}
                >
                  {isInfinite ? "-" : value}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {currentStep && (
        <div className={`text-sm text-center font-mono px-6 py-3 rounded-lg ${
          currentStep.improved
            ? "bg-green-600/20 text-green-400"
            : "bg-gray-800/50 text-gray-400"
        }`}>
          Coin {currentStep.coin}: {currentStep.formula}
        </div>
      )}

      <div className="text-sm text-gray-500 text-center">
        <span className="text-green-400">FORWARD loop</span>: for each amount, try all coins.
        Each coin can be reused (unlimited).
      </div>
    </div>
  );
};

const ComparePhase = ({ step }: { step: number }) => {
  const { forwardSteps, reverseSteps, dpForward } = useMemo(() => generateCompareSteps(), []);

  const maxSteps = Math.max(forwardSteps.length, reverseSteps.length);
  const currentStep = Math.min(step, maxSteps);

  const forwardDp = useMemo(() => {
    const dp = Array(targetAmount + 1).fill(targetAmount + 1);
    dp[0] = 0;
    for (let s = 0; s < Math.min(currentStep, forwardSteps.length); s++) {
      dp[forwardSteps[s].amount] = forwardSteps[s].value;
    }
    return dp;
  }, [currentStep, forwardSteps]);

  const reverseDp = useMemo(() => {
    const dp = Array(targetAmount + 1).fill(targetAmount + 1);
    dp[0] = 0;
    for (let s = 0; s < Math.min(currentStep, reverseSteps.length); s++) {
      dp[reverseSteps[s].amount] = reverseSteps[s].value;
    }
    return dp;
  }, [currentStep, reverseSteps]);

  return (
    <div className="flex flex-col items-center gap-6">
      <CoinsDisplay />

      <div className="grid grid-cols-2 gap-6 w-full">
        <div className="text-center">
          <div className="text-sm font-medium text-green-400 mb-3">FORWARD Loop (Correct for Unbounded)</div>
          <div className="flex gap-1 justify-center flex-wrap">
            {Array.from({ length: Math.min(8, targetAmount + 1) }, (_, a) => {
              const value = forwardDp[a];
              const isInfinite = value > targetAmount;
              return (
                <div key={a} className="flex flex-col items-center">
                  <div className="text-xs text-gray-500 mb-1">{a}</div>
                  <div className={`w-8 h-8 flex items-center justify-center border rounded text-xs font-mono ${
                    isInfinite ? "bg-gray-900/50 border-gray-700 text-gray-600" : "bg-green-800/50 border-green-600 text-green-300"
                  }`}>
                    {isInfinite ? "-" : value}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-xs text-gray-500 mt-2">Coins can be reused</div>
        </div>

        <div className="text-center">
          <div className="text-sm font-medium text-red-400 mb-3">REVERSE Loop (Wrong for Unbounded)</div>
          <div className="flex gap-1 justify-center flex-wrap">
            {Array.from({ length: Math.min(8, targetAmount + 1) }, (_, a) => {
              const value = reverseDp[a];
              const isInfinite = value > targetAmount;
              return (
                <div key={a} className="flex flex-col items-center">
                  <div className="text-xs text-gray-500 mb-1">{a}</div>
                  <div className={`w-8 h-8 flex items-center justify-center border rounded text-xs font-mono ${
                    isInfinite ? "bg-gray-900/50 border-gray-700 text-gray-600" : "bg-red-800/50 border-red-600 text-red-300"
                  }`}>
                    {isInfinite ? "-" : value}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-xs text-gray-500 mt-2">Each coin used only once</div>
        </div>
      </div>

      <div className="text-sm text-gray-400 text-center bg-gray-800/50 px-6 py-3 rounded-lg max-w-lg">
        <div className="font-medium text-white mb-2">Loop Direction Matters!</div>
        <div><span className="text-green-400">FORWARD</span>: dp[a-coin] already updated this round = coin reused</div>
        <div><span className="text-red-400">REVERSE</span>: dp[a-coin] from previous round = coin used once</div>
      </div>

      <div className="text-sm text-gray-500 text-center">
        Final answer with FORWARD: {dpForward[targetAmount] > targetAmount ? "impossible" : dpForward[targetAmount]} coins
      </div>
    </div>
  );
};

export default function CoinChangeVisualizer() {
  const phases: Phase[] = ["tree", "memo", "table", "compare"];
  const phaseLabels: Record<Phase, string> = {
    tree: "Recursion",
    memo: "Memoization",
    table: "Tabulation",
    compare: "Forward vs Reverse",
  };

  const [currentPhase, setCurrentPhase] = useState<Phase>("tree");
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(600);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const tableSteps = useMemo(() => generateTableSteps(), []);
  const { forwardSteps, reverseSteps } = useMemo(() => generateCompareSteps(), []);

  const getMaxSteps = useCallback(
    (phase: Phase) => {
      if (phase === "table") return tableSteps.length;
      if (phase === "compare") return Math.max(forwardSteps.length, reverseSteps.length);
      return targetAmount;
    },
    [tableSteps.length, forwardSteps.length, reverseSteps.length]
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
        <div className="text-lg font-medium text-white">Coin Change (Unbounded Knapsack)</div>
        <div className="text-sm text-gray-400">
          Minimum coins to make amount {targetAmount} (coins can be reused)
        </div>
      </div>

      <div className="flex justify-center mb-6">
        <div className="inline-flex bg-gray-800/50 p-1 rounded-xl">
          {phases.map((phase, index) => (
            <button
              key={phase}
              onClick={() => goToPhase(phase)}
              className={`relative px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
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
          {currentPhase === "compare" && <ComparePhase step={step} />}
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 pt-4 border-t border-gray-800 text-sm text-gray-500 text-center">
        coins = [{coins.join(", ")}] | amount = {targetAmount} | Answer: 3 coins (5+5+1)
      </div>
    </div>
  );
}
