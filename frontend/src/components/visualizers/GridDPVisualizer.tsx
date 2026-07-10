"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

type Phase = "paths" | "minpath" | "table";

const grid = [
  [1, 3, 1],
  [1, 5, 1],
  [4, 2, 1],
];
const rows = grid.length;
const cols = grid[0].length;

const generatePathSteps = () => {
  const steps: { r: number; c: number; value: number; formula: string }[] = [];
  const dp: number[][] = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(0));

  dp[0][0] = 1;
  steps.push({ r: 0, c: 0, value: 1, formula: "dp[0][0] = 1 (start)" });

  for (let c = 1; c < cols; c++) {
    dp[0][c] = 1;
    steps.push({
      r: 0,
      c,
      value: 1,
      formula: `dp[0][${c}] = 1 (only from left)`,
    });
  }

  for (let r = 1; r < rows; r++) {
    dp[r][0] = 1;
    steps.push({
      r,
      c: 0,
      value: 1,
      formula: `dp[${r}][0] = 1 (only from above)`,
    });
  }

  for (let r = 1; r < rows; r++) {
    for (let c = 1; c < cols; c++) {
      dp[r][c] = dp[r - 1][c] + dp[r][c - 1];
      steps.push({
        r,
        c,
        value: dp[r][c],
        formula: `dp[${r}][${c}] = dp[${r - 1}][${c}] + dp[${r}][${c - 1}] = ${dp[r - 1][c]} + ${dp[r][c - 1]} = ${dp[r][c]}`,
      });
    }
  }

  return { steps, dp };
};

const generateMinPathSteps = () => {
  const steps: { r: number; c: number; value: number; formula: string }[] = [];
  const dp: number[][] = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(0));

  dp[0][0] = grid[0][0];
  steps.push({
    r: 0,
    c: 0,
    value: dp[0][0],
    formula: `dp[0][0] = grid[0][0] = ${grid[0][0]}`,
  });

  for (let c = 1; c < cols; c++) {
    dp[0][c] = dp[0][c - 1] + grid[0][c];
    steps.push({
      r: 0,
      c,
      value: dp[0][c],
      formula: `dp[0][${c}] = ${dp[0][c - 1]} + ${grid[0][c]} = ${dp[0][c]}`,
    });
  }

  for (let r = 1; r < rows; r++) {
    dp[r][0] = dp[r - 1][0] + grid[r][0];
    steps.push({
      r,
      c: 0,
      value: dp[r][0],
      formula: `dp[${r}][0] = ${dp[r - 1][0]} + ${grid[r][0]} = ${dp[r][0]}`,
    });
  }

  for (let r = 1; r < rows; r++) {
    for (let c = 1; c < cols; c++) {
      dp[r][c] = Math.min(dp[r - 1][c], dp[r][c - 1]) + grid[r][c];
      steps.push({
        r,
        c,
        value: dp[r][c],
        formula: `dp[${r}][${c}] = min(${dp[r - 1][c]}, ${dp[r][c - 1]}) + ${grid[r][c]} = ${dp[r][c]}`,
      });
    }
  }

  return { steps, dp };
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

const GridDisplay = ({
  dpTable,
  currentCell,
  showGrid,
  showCost,
}: {
  dpTable: number[][];
  currentCell?: { r: number; c: number };
  showGrid: boolean;
  showCost: boolean;
}) => (
  <div className="flex justify-center gap-8">
    {showGrid && (
      <div className="text-center">
        <div className="text-sm text-gray-500 mb-2">Grid (costs)</div>
        <div
          className="inline-grid gap-1"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {grid.map((row, r) =>
            row.map((val, c) => (
              <div
                // skipcq: JS-0437
                key={`grid-cell-${r}-${c}-${val}`}
                className={`w-12 h-12 flex items-center justify-center rounded font-mono ${
                  r === 0 && c === 0
                    ? "bg-green-600 text-white"
                    : r === rows - 1 && c === cols - 1
                      ? "bg-red-600 text-white"
                      : "bg-gray-800 text-gray-300"
                }`}
              >
                {val}
              </div>
            ))
          )}
        </div>
      </div>
    )}
    <div className="text-center">
      <div className="text-sm text-gray-500 mb-2">
        {showCost ? "Min Path Sum" : "Unique Paths"}
      </div>
      <div
        className="inline-grid gap-1"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {dpTable.map((row, r) =>
          row.map((val, c) => {
            const isCurrent = currentCell?.r === r && currentCell?.c === c;
            return (
              <div
                // skipcq: JS-0437
                key={`dp-cell-${r}-${c}-${val}`}
                className={`w-12 h-12 flex items-center justify-center rounded font-mono border-2 transition-all ${
                  isCurrent
                    ? "bg-blue-600 border-blue-400 text-white font-bold"
                    : val > 0
                      ? "bg-gray-800 border-gray-600 text-gray-300"
                      : "bg-gray-900/50 border-gray-700 text-gray-600"
                }`}
              >
                {val || ""}
              </div>
            );
          })
        )}
      </div>
    </div>
  </div>
);

const PathsPhase = ({
  step,
  pathSteps,
}: {
  step: number;
  pathSteps: ReturnType<typeof generatePathSteps>["steps"];
}) => {
  const dpTable = useMemo(() => {
    const dp: number[][] = Array(rows)
      .fill(null)
      .map(() => Array(cols).fill(0));
    for (let s = 0; s < Math.min(step, pathSteps.length); s++) {
      const { r, c, value } = pathSteps[s];
      dp[r][c] = value;
    }
    return dp;
  }, [step, pathSteps]);

  const currentStep =
    step > 0 && step <= pathSteps.length ? pathSteps[step - 1] : null;

  return (
    <div className="flex flex-col items-center gap-6">
      <GridDisplay
        dpTable={dpTable}
        currentCell={
          currentStep ? { r: currentStep.r, c: currentStep.c } : undefined
        }
        showGrid={false}
        showCost={false}
      />
      {currentStep && (
        <div className="text-sm text-center font-mono bg-gray-800/50 text-gray-400 px-6 py-3 rounded-lg">
          {currentStep.formula}
        </div>
      )}
      <div className="text-sm text-gray-500">
        dp[r][c] = dp[r-1][c] + dp[r][c-1] (paths from above + left)
      </div>
    </div>
  );
};

const MinPathPhase = ({
  step,
  minPathSteps,
}: {
  step: number;
  minPathSteps: ReturnType<typeof generateMinPathSteps>["steps"];
}) => {
  const dpTable = useMemo(() => {
    const dp: number[][] = Array(rows)
      .fill(null)
      .map(() => Array(cols).fill(0));
    for (let s = 0; s < Math.min(step, minPathSteps.length); s++) {
      const { r, c, value } = minPathSteps[s];
      dp[r][c] = value;
    }
    return dp;
  }, [step, minPathSteps]);

  const currentStep =
    step > 0 && step <= minPathSteps.length ? minPathSteps[step - 1] : null;

  return (
    <div className="flex flex-col items-center gap-6">
      <GridDisplay
        dpTable={dpTable}
        currentCell={
          currentStep ? { r: currentStep.r, c: currentStep.c } : undefined
        }
        showGrid
        showCost
      />
      {currentStep && (
        <div className="text-sm text-center font-mono bg-gray-800/50 text-gray-400 px-6 py-3 rounded-lg">
          {currentStep.formula}
        </div>
      )}
      <div className="text-sm text-gray-500">
        dp[r][c] = min(dp[r-1][c], dp[r][c-1]) + grid[r][c]
      </div>
    </div>
  );
};

const generateSpaceOptimizedSteps = () => {
  const steps: { row: number; dp: number[]; formula: string }[] = [];
  const dp = new Array(cols).fill(1);
  steps.push({
    row: 0,
    dp: [...dp],
    formula: "Initialize dp = [1, 1, 1] (first row: only one path to each cell)",
  });
  for (let r = 1; r < rows; r++) {
    for (let c = 1; c < cols; c++) {
      dp[c] = dp[c] + dp[c - 1];
    }
    steps.push({
      row: r,
      dp: [...dp],
      formula: `Process row ${r}: dp = [${dp.join(", ")}]  (dp[0] stays 1; dp[j] = old dp[j] + dp[j-1])`,
    });
  }
  return steps;
};

const SpaceOptimizedPhase = ({
  step,
  spaceSteps,
}: {
  step: number;
  spaceSteps: ReturnType<typeof generateSpaceOptimizedSteps>;
}) => {
  const currentStep =
    step > 0 && step <= spaceSteps.length ? spaceSteps[step - 1] : null;
  const displayDp = currentStep ? currentStep.dp : new Array(cols).fill(0);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <div className="text-sm text-gray-500 mb-2">Rolling 1D Array</div>
        <div
          className="inline-grid gap-1"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {displayDp.map((val, c) => (
            <div
              // skipcq: JS-0437
              key={`space-cell-${c}-${val}`}
              className={`w-16 h-16 flex flex-col items-center justify-center rounded font-mono border-2 transition-all ${
                currentStep
                  ? "bg-purple-700 border-purple-400 text-white font-bold"
                  : "bg-gray-900/50 border-gray-700 text-gray-600"
              }`}
            >
              <span className="text-xs text-gray-400">dp[{c}]</span>
              <span className="text-lg">{currentStep ? val : ""}</span>
            </div>
          ))}
        </div>
      </div>
      {currentStep && (
        <div className="text-sm text-center font-mono bg-gray-800/50 text-gray-400 px-6 py-3 rounded-lg max-w-lg">
          {currentStep.formula}
        </div>
      )}
      <div className="text-sm text-gray-500">
        dp[j] = dp[j] + dp[j-1] &nbsp;|&nbsp; dp[j] before update = value from row above
      </div>
    </div>
  );
};

// skipcq: JS-0067
export default function GridDPVisualizer() {
  // skipcq: JS-0067
  const phases: Phase[] = ["paths", "minpath", "table"];
  const phaseLabels: Record<Phase, string> = {
    paths: "Unique Paths",
    minpath: "Min Path Sum",
    table: "Space O(n)",
  };

  const [currentPhase, setCurrentPhase] = useState<Phase>("paths");
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(600);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { steps: pathSteps, dp: pathDp } = useMemo(
    () => generatePathSteps(),
    []
  );
  const { steps: minPathSteps, dp: minPathDp } = useMemo(
    () => generateMinPathSteps(),
    []
  );
  const spaceSteps = useMemo(() => generateSpaceOptimizedSteps(), []);

  const getMaxSteps = useCallback(
    (phase: Phase) => {
      if (phase === "paths") return pathSteps.length;
      if (phase === "minpath") return minPathSteps.length;
      return spaceSteps.length;
    },
    [pathSteps.length, minPathSteps.length, spaceSteps.length]
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
          Grid DP (2D Navigation)
        </div>
        <div className="text-sm text-gray-400">
          Count paths or find min cost from top-left to bottom-right
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
          {currentPhase === "paths" && (
            <PathsPhase step={step} pathSteps={pathSteps} />
          )}
          {currentPhase === "minpath" && (
            <MinPathPhase step={step} minPathSteps={minPathSteps} />
          )}
          {currentPhase === "table" && (
            <SpaceOptimizedPhase step={step} spaceSteps={spaceSteps} />
          )}
        </motion.div>
      </AnimatePresence>
      <div className="mt-6 pt-4 border-t border-gray-800 text-sm text-gray-500 text-center">
        {rows}x{cols} grid | Unique Paths = {pathDp[rows - 1][cols - 1]} | Min
        Path Sum = {minPathDp[rows - 1][cols - 1]}
      </div>
    </div>
  );
}
