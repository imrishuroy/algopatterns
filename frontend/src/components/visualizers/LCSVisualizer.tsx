"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

type Phase = "recursion" | "memoization" | "tabulation" | "spaceOptimized";

const text1 = "abcde";
const text2 = "ace";

interface RecursionStep {
  i: number;
  j: number;
  char1: string;
  char2: string;
  isMatch: boolean;
  action: string;
  result: number | null;
  depth: number;
  type: "call" | "return";
}

interface MemoStep {
  i: number;
  j: number;
  char1: string;
  char2: string;
  isMatch: boolean;
  action: string;
  result: number;
  fromCache: boolean;
  depth: number;
}

interface TableStep {
  i: number;
  j: number;
  value: number;
  formula: string;
  isMatch: boolean;
  char1: string;
  char2: string;
}

interface SpaceStep {
  i: number;
  j: number;
  value: number;
  formula: string;
  prev: number[];
  curr: number[];
  char1: string;
  char2: string;
  isMatch: boolean;
}

const generateRecursionSteps = (): RecursionStep[] => {
  const steps: RecursionStep[] = [];

  const solve = (i: number, j: number, depth: number): number => {
    if (i < 0 || j < 0) {
      steps.push({
        i,
        j,
        char1: "-",
        char2: "-",
        isMatch: false,
        action: `Base case: i=${i} or j=${j} < 0 → return 0`,
        result: 0,
        depth,
        type: "return",
      });
      return 0;
    }

    const char1 = text1[i];
    const char2 = text2[j];
    const isMatch = char1 === char2;

    steps.push({
      i,
      j,
      char1,
      char2,
      isMatch,
      action: isMatch
        ? `'${char1}' = '${char2}' → Match! Go diagonal`
        : `'${char1}' ≠ '${char2}' → Try both directions`,
      result: null,
      depth,
      type: "call",
    });

    let result: number;
    if (isMatch) {
      result = 1 + solve(i - 1, j - 1, depth + 1);
    } else {
      const left = solve(i - 1, j, depth + 1);
      const up = solve(i, j - 1, depth + 1);
      result = Math.max(left, up);
    }

    steps.push({
      i,
      j,
      char1,
      char2,
      isMatch,
      action: `lcs(${i}, ${j}) = ${result}`,
      result,
      depth,
      type: "return",
    });

    return result;
  };

  solve(text1.length - 1, text2.length - 1, 0);
  return steps;
};

const generateMemoSteps = (): { steps: MemoStep[]; cacheHits: number } => {
  const steps: MemoStep[] = [];
  const memo: Map<string, number> = new Map();
  let cacheHits = 0;

  const solve = (i: number, j: number, depth: number): number => {
    if (i < 0 || j < 0) return 0;

    const key = `${i},${j}`;
    if (memo.has(key)) {
      cacheHits++;
      steps.push({
        i,
        j,
        char1: text1[i],
        char2: text2[j],
        isMatch: text1[i] === text2[j],
        action: `CACHE HIT! memo[${i}][${j}] = ${memo.get(key)}`,
        result: memo.get(key)!,
        fromCache: true,
        depth,
      });
      return memo.get(key)!;
    }

    const char1 = text1[i];
    const char2 = text2[j];
    const isMatch = char1 === char2;

    let result: number;
    if (isMatch) {
      result = 1 + solve(i - 1, j - 1, depth + 1);
    } else {
      const left = solve(i - 1, j, depth + 1);
      const up = solve(i, j - 1, depth + 1);
      result = Math.max(left, up);
    }

    memo.set(key, result);
    steps.push({
      i,
      j,
      char1,
      char2,
      isMatch,
      action: isMatch
        ? `'${char1}' = '${char2}' → 1 + lcs(${i - 1}, ${j - 1}) = ${result}. Store in memo.`
        : `'${char1}' ≠ '${char2}' → max(lcs(${i - 1}, ${j}), lcs(${i}, ${j - 1})) = ${result}. Store in memo.`,
      result,
      fromCache: false,
      depth,
    });

    return result;
  };

  solve(text1.length - 1, text2.length - 1, 0);
  return { steps, cacheHits };
};

const generateTableSteps = (): {
  steps: TableStep[];
  finalDp: number[][];
  finalAnswer: number;
} => {
  const m = text1.length;
  const n = text2.length;
  const steps: TableStep[] = [];
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0)
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const char1 = text1[i - 1];
      const char2 = text2[j - 1];
      const isMatch = char1 === char2;

      let value: number;
      let formula: string;

      if (isMatch) {
        value = dp[i - 1][j - 1] + 1;
        formula = `'${char1}' = '${char2}' → 1 + dp[${i - 1}][${j - 1}] = ${value}`;
      } else {
        value = Math.max(dp[i - 1][j], dp[i][j - 1]);
        formula = `'${char1}' ≠ '${char2}' → max(${dp[i - 1][j]}, ${dp[i][j - 1]}) = ${value}`;
      }

      dp[i][j] = value;
      steps.push({ i, j, value, formula, isMatch, char1, char2 });
    }
  }

  return { steps, finalDp: dp, finalAnswer: dp[m][n] };
};

const generateSpaceSteps = (): { steps: SpaceStep[]; finalAnswer: number } => {
  const m = text1.length;
  const n = text2.length;
  const steps: SpaceStep[] = [];
  let prev = new Array(n + 1).fill(0);
  let curr = new Array(n + 1).fill(0);

  for (let i = 1; i <= m; i++) {
    curr = new Array(n + 1).fill(0);
    for (let j = 1; j <= n; j++) {
      const char1 = text1[i - 1];
      const char2 = text2[j - 1];
      const isMatch = char1 === char2;

      let value: number;
      let formula: string;

      if (isMatch) {
        value = 1 + prev[j - 1];
        formula = `'${char1}' = '${char2}' → 1 + prev[${j - 1}] = ${value}`;
      } else {
        value = Math.max(prev[j], curr[j - 1]);
        formula = `'${char1}' ≠ '${char2}' → max(${prev[j]}, ${curr[j - 1]}) = ${value}`;
      }

      curr[j] = value;
      steps.push({
        i,
        j,
        value,
        formula,
        prev: [...prev],
        curr: [...curr],
        char1,
        char2,
        isMatch,
      });
    }
    prev = [...curr];
  }

  return { steps, finalAnswer: curr[n] };
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

const StringsDisplay = ({
  highlightI,
  highlightJ,
  isMatch,
}: {
  highlightI?: number;
  highlightJ?: number;
  isMatch?: boolean;
}) => (
  <div className="flex items-center justify-center gap-8">
    <div className="flex items-center gap-2">
      <span className="text-sm text-blue-400 font-medium w-14">text1:</span>
      <div className="flex">
        {text1.split("").map((char, idx) => (
          <div
            key={`t1-${idx}`}
            className={`w-9 h-9 flex items-center justify-center font-mono text-base font-bold border-2 transition-all ${
              highlightI === idx
                ? isMatch
                  ? "bg-green-600 border-green-400 text-white"
                  : "bg-blue-600 border-blue-400 text-white"
                : "bg-gray-800 border-gray-700 text-gray-300"
            }`}
          >
            {char}
          </div>
        ))}
      </div>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-sm text-purple-400 font-medium w-14">text2:</span>
      <div className="flex">
        {text2.split("").map((char, idx) => (
          <div
            key={`t2-${idx}`}
            className={`w-9 h-9 flex items-center justify-center font-mono text-base font-bold border-2 transition-all ${
              highlightJ === idx
                ? isMatch
                  ? "bg-green-600 border-green-400 text-white"
                  : "bg-purple-600 border-purple-400 text-white"
                : "bg-gray-800 border-gray-700 text-gray-300"
            }`}
          >
            {char}
          </div>
        ))}
      </div>
    </div>
  </div>
);

const RecursionPhase = ({
  step,
  recursionSteps,
}: {
  step: number;
  recursionSteps: RecursionStep[];
}) => {
  const visibleSteps = recursionSteps.slice(0, step);
  const currentStep = step > 0 ? recursionSteps[step - 1] : null;

  const callStack = useMemo(() => {
    const stack: { i: number; j: number; result: number | null }[] = [];
    for (const s of visibleSteps) {
      if (s.type === "call") {
        stack.push({ i: s.i, j: s.j, result: null });
      } else if (s.type === "return" && stack.length > 0) {
        const top = stack[stack.length - 1];
        if (top.i === s.i && top.j === s.j) {
          top.result = s.result;
        }
      }
    }
    return stack.slice(-6);
  }, [visibleSteps]);

  return (
    <div className="flex flex-col items-center gap-5">
      <StringsDisplay
        highlightI={currentStep?.i !== undefined && currentStep.i >= 0 ? currentStep.i : undefined}
        highlightJ={currentStep?.j !== undefined && currentStep.j >= 0 ? currentStep.j : undefined}
        isMatch={currentStep?.isMatch}
      />

      {/* Current comparison */}
      {currentStep && currentStep.i >= 0 && currentStep.j >= 0 && (
        <div
          className={`text-base font-mono px-5 py-2 rounded-lg ${
            currentStep.isMatch
              ? "bg-green-600/20 text-green-400 border border-green-600/50"
              : "bg-gray-800/50 text-gray-300 border border-gray-700"
          }`}
        >
          lcs({currentStep.i}, {currentStep.j}): &apos;{currentStep.char1}&apos;
          vs &apos;{currentStep.char2}&apos;
          {currentStep.isMatch ? " = MATCH!" : " ≠ No match"}
        </div>
      )}

      {/* Call stack visualization */}
      <div className="flex flex-col items-center gap-2">
        <div className="text-sm text-gray-500">Call Stack (recent calls):</div>
        <div className="flex flex-col-reverse gap-1">
          {callStack.map((call, idx) => (
            <div
              key={`stack-${idx}`}
              className={`px-4 py-2 rounded font-mono text-sm ${
                idx === callStack.length - 1
                  ? "bg-blue-600/30 border border-blue-500 text-blue-300"
                  : call.result !== null
                    ? "bg-green-600/20 border border-green-600/50 text-green-400"
                    : "bg-gray-800 border border-gray-700 text-gray-400"
              }`}
            >
              lcs({call.i}, {call.j})
              {call.result !== null && ` → ${call.result}`}
            </div>
          ))}
          {callStack.length === 0 && (
            <div className="text-gray-500 text-sm">Empty</div>
          )}
        </div>
      </div>

      {/* Current action */}
      {currentStep && (
        <div className="text-sm font-mono bg-gray-800/50 text-gray-300 px-5 py-2 rounded-lg max-w-lg text-center">
          {currentStep.action}
        </div>
      )}

      {/* Final answer */}
      {step >= recursionSteps.length && step > 0 && (
        <div className="text-base text-center bg-green-600/20 px-5 py-2 rounded-lg border border-green-600/50">
          <span className="text-green-400 font-bold">LCS Length = 3</span>
          <span className="text-gray-400 ml-2">
            (but O(2^n) time - very slow!)
          </span>
        </div>
      )}

      <div className="text-xs text-gray-500">
        Time: O(2^(m+n)) | Space: O(m+n) recursion stack
      </div>
    </div>
  );
};

const MemoizationPhase = ({
  step,
  memoSteps,
}: {
  step: number;
  memoSteps: MemoStep[];
}) => {
  const visibleSteps = memoSteps.slice(0, step);
  const currentStep = step > 0 ? memoSteps[step - 1] : null;

  const memoTable = useMemo(() => {
    const table: (number | null)[][] = Array.from({ length: text1.length }, () =>
      Array(text2.length).fill(null)
    );
    for (const s of visibleSteps) {
      if (!s.fromCache && s.i >= 0 && s.j >= 0) {
        table[s.i][s.j] = s.result;
      }
    }
    return table;
  }, [visibleSteps]);

  const cacheHitCount = visibleSteps.filter((s) => s.fromCache).length;
  const computedCount = visibleSteps.filter((s) => !s.fromCache).length;

  return (
    <div className="flex flex-col items-center gap-5">
      <StringsDisplay
        highlightI={currentStep?.i}
        highlightJ={currentStep?.j}
        isMatch={currentStep?.isMatch}
      />

      {/* Current comparison */}
      {currentStep && (
        <div
          className={`text-base font-mono px-5 py-2 rounded-lg ${
            currentStep.fromCache
              ? "bg-yellow-600/20 text-yellow-400 border border-yellow-600/50"
              : currentStep.isMatch
                ? "bg-green-600/20 text-green-400 border border-green-600/50"
                : "bg-gray-800/50 text-gray-300 border border-gray-700"
          }`}
        >
          {currentStep.fromCache
            ? `CACHE HIT! memo[${currentStep.i}][${currentStep.j}] = ${currentStep.result}`
            : `lcs(${currentStep.i}, ${currentStep.j}): '${currentStep.char1}' vs '${currentStep.char2}'`}
        </div>
      )}

      {/* Memo table */}
      <div className="flex flex-col items-center gap-2">
        <div className="text-sm text-gray-500">
          Memo Table (caches computed results):
        </div>
        <table className="border-collapse">
          <thead>
            <tr>
              <th className="w-8 h-8 text-xs text-gray-500">i\j</th>
              {text2.split("").map((char, idx) => (
                <th
                  key={`h-${idx}`}
                  className={`w-8 h-8 text-xs font-mono ${
                    currentStep?.j === idx ? "text-purple-400" : "text-gray-500"
                  }`}
                >
                  {idx}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {memoTable.map((row, rowIdx) => (
              <tr key={`row-${rowIdx}`}>
                <td
                  className={`w-8 h-8 text-xs font-mono text-center ${
                    currentStep?.i === rowIdx ? "text-blue-400" : "text-gray-500"
                  }`}
                >
                  {rowIdx}
                </td>
                {row.map((val, colIdx) => {
                  const isCurrent =
                    currentStep?.i === rowIdx && currentStep?.j === colIdx;
                  const isCacheHit = isCurrent && currentStep?.fromCache;

                  return (
                    <td key={`cell-${rowIdx}-${colIdx}`} className="p-0.5">
                      <div
                        className={`w-7 h-7 flex items-center justify-center rounded font-mono text-xs border transition-all ${
                          isCurrent
                            ? isCacheHit
                              ? "bg-yellow-600 border-yellow-400 text-white"
                              : "bg-blue-600 border-blue-400 text-white"
                            : val !== null
                              ? "bg-green-600/30 border-green-600/50 text-green-400"
                              : "bg-gray-800/50 border-gray-700 text-gray-600"
                        }`}
                      >
                        {val !== null ? val : "-"}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Stats */}
      <div className="flex gap-6 text-sm">
        <div className="text-gray-400">
          Computed: <span className="text-green-400">{computedCount}</span>
        </div>
        <div className="text-gray-400">
          Cache hits: <span className="text-yellow-400">{cacheHitCount}</span>
        </div>
      </div>

      {/* Current action */}
      {currentStep && !currentStep.fromCache && (
        <div className="text-sm font-mono bg-gray-800/50 text-gray-300 px-5 py-2 rounded-lg max-w-lg text-center">
          {currentStep.action}
        </div>
      )}

      {/* Final answer */}
      {step >= memoSteps.length && step > 0 && (
        <div className="text-base text-center bg-green-600/20 px-5 py-2 rounded-lg border border-green-600/50">
          <span className="text-green-400 font-bold">LCS Length = 3</span>
          <span className="text-gray-400 ml-2">(O(m×n) with memoization)</span>
        </div>
      )}

      <div className="text-xs text-gray-500">
        Time: O(m×n) | Space: O(m×n) memo table
      </div>
    </div>
  );
};

const TabulationPhase = ({
  step,
  tableSteps,
  finalAnswer,
}: {
  step: number;
  tableSteps: TableStep[];
  finalAnswer: number;
}) => {
  const currentDp = useMemo(() => {
    const m = text1.length;
    const n = text2.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () =>
      Array(n + 1).fill(0)
    );

    for (let s = 0; s < Math.min(step, tableSteps.length); s++) {
      const { i, j, value } = tableSteps[s];
      dp[i][j] = value;
    }

    return dp;
  }, [step, tableSteps]);

  const currentStep =
    step > 0 && step <= tableSteps.length ? tableSteps[step - 1] : null;

  return (
    <div className="flex flex-col items-center gap-5">
      <StringsDisplay
        highlightI={currentStep ? currentStep.i - 1 : undefined}
        highlightJ={currentStep ? currentStep.j - 1 : undefined}
        isMatch={currentStep?.isMatch}
      />

      {/* Current comparison */}
      {currentStep && (
        <div
          className={`text-base font-mono px-5 py-2 rounded-lg ${
            currentStep.isMatch
              ? "bg-green-600/20 text-green-400 border border-green-600/50"
              : "bg-gray-800/50 text-gray-300 border border-gray-700"
          }`}
        >
          dp[{currentStep.i}][{currentStep.j}]: &apos;{currentStep.char1}&apos;
          vs &apos;{currentStep.char2}&apos;
          {currentStep.isMatch ? " = MATCH!" : " ≠ No match"}
        </div>
      )}

      {/* DP Table */}
      <div className="overflow-x-auto">
        <table className="border-collapse">
          <thead>
            <tr>
              <th className="w-9 h-9 text-xs text-gray-500"></th>
              <th className="w-9 h-9 text-xs text-gray-500 font-mono">ε</th>
              {text2.split("").map((char, idx) => (
                <th
                  key={`h-${idx}`}
                  className={`w-9 h-9 text-sm font-mono font-bold ${
                    currentStep?.j === idx + 1 ? "text-purple-400" : "text-gray-400"
                  }`}
                >
                  {char}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="w-9 h-9 text-xs text-gray-500 font-mono text-center">
                ε
              </td>
              {currentDp[0].map((val, colIdx) => (
                <td key={`r0-c${colIdx}`} className="p-0.5">
                  <div className="w-8 h-8 flex items-center justify-center bg-gray-800/50 border border-gray-700 rounded font-mono text-xs text-gray-500">
                    {val}
                  </div>
                </td>
              ))}
            </tr>
            {text1.split("").map((rowChar, rowIndex) => (
              <tr key={`row-${rowIndex}`}>
                <td
                  className={`w-9 h-9 text-sm font-mono font-bold text-center ${
                    currentStep?.i === rowIndex + 1 ? "text-blue-400" : "text-gray-400"
                  }`}
                >
                  {rowChar}
                </td>
                {currentDp[rowIndex + 1].map((val, colIdx) => {
                  const isCurrentCell =
                    currentStep?.i === rowIndex + 1 && currentStep?.j === colIdx;
                  const stepIdx = tableSteps.findIndex(
                    (s) => s.i === rowIndex + 1 && s.j === colIdx
                  );
                  const isFilled = stepIdx >= 0 && stepIdx < step;

                  return (
                    <td key={`r${rowIndex + 1}-c${colIdx}`} className="p-0.5">
                      <div
                        className={`w-8 h-8 flex items-center justify-center rounded font-mono text-sm font-bold border-2 transition-all ${
                          isCurrentCell
                            ? currentStep?.isMatch
                              ? "bg-green-600 border-green-400 text-white scale-105"
                              : "bg-blue-600 border-blue-400 text-white scale-105"
                            : isFilled || colIdx === 0
                              ? "bg-gray-700/50 border-gray-600 text-gray-200"
                              : "bg-gray-800/30 border-gray-700 text-gray-500"
                        }`}
                      >
                        {val}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Formula */}
      {currentStep && (
        <div className="text-sm font-mono bg-gray-800/50 text-gray-300 px-5 py-2 rounded-lg">
          {currentStep.formula}
        </div>
      )}

      {/* Final answer */}
      {step >= tableSteps.length && step > 0 && (
        <div className="text-base text-center bg-green-600/20 px-5 py-2 rounded-lg border border-green-600/50">
          <span className="text-green-400 font-bold">
            LCS Length = {finalAnswer}
          </span>
        </div>
      )}

      <div className="text-xs text-gray-500">
        Time: O(m×n) | Space: O(m×n)
      </div>
    </div>
  );
};

const SpaceOptimizedPhase = ({
  step,
  spaceSteps,
  finalAnswer,
}: {
  step: number;
  spaceSteps: SpaceStep[];
  finalAnswer: number;
}) => {
  const currentStep =
    step > 0 && step <= spaceSteps.length ? spaceSteps[step - 1] : null;

  const prevArray = currentStep?.prev || new Array(text2.length + 1).fill(0);
  const currArray = currentStep?.curr || new Array(text2.length + 1).fill(0);

  return (
    <div className="flex flex-col items-center gap-5">
      <StringsDisplay
        highlightI={currentStep ? currentStep.i - 1 : undefined}
        highlightJ={currentStep ? currentStep.j - 1 : undefined}
        isMatch={currentStep?.isMatch}
      />

      {/* Current comparison */}
      {currentStep && (
        <div
          className={`text-base font-mono px-5 py-2 rounded-lg ${
            currentStep.isMatch
              ? "bg-green-600/20 text-green-400 border border-green-600/50"
              : "bg-gray-800/50 text-gray-300 border border-gray-700"
          }`}
        >
          Row {currentStep.i}: &apos;{currentStep.char1}&apos; vs &apos;
          {currentStep.char2}&apos;
          {currentStep.isMatch ? " = MATCH!" : " ≠ No match"}
        </div>
      )}

      {/* Two arrays */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm text-purple-400 font-medium w-16">
            prev[]:
          </span>
          <div className="flex">
            {prevArray.map((val, idx) => (
              <div
                key={`prev-${idx}`}
                className={`w-8 h-8 flex items-center justify-center font-mono text-sm font-bold border-2 transition-all ${
                  currentStep &&
                  currentStep.isMatch &&
                  idx === currentStep.j - 1
                    ? "bg-purple-600/30 border-purple-500 text-purple-300"
                    : "bg-gray-800 border-gray-700 text-gray-400"
                }`}
              >
                {val}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-blue-400 font-medium w-16">
            curr[]:
          </span>
          <div className="flex">
            {currArray.map((val, idx) => (
              <div
                key={`curr-${idx}`}
                className={`w-8 h-8 flex items-center justify-center font-mono text-sm font-bold border-2 transition-all ${
                  currentStep && idx === currentStep.j
                    ? currentStep.isMatch
                      ? "bg-green-600 border-green-400 text-white scale-105"
                      : "bg-blue-600 border-blue-400 text-white scale-105"
                    : "bg-gray-800 border-gray-700 text-gray-400"
                }`}
              >
                {val}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Formula */}
      {currentStep && (
        <div className="text-sm font-mono bg-gray-800/50 text-gray-300 px-5 py-2 rounded-lg">
          {currentStep.formula}
        </div>
      )}

      {/* Final answer */}
      {step >= spaceSteps.length && step > 0 && (
        <div className="text-base text-center bg-green-600/20 px-5 py-2 rounded-lg border border-green-600/50">
          <span className="text-green-400 font-bold">
            LCS Length = {finalAnswer}
          </span>
        </div>
      )}

      <div className="text-xs text-gray-500">
        Time: O(m×n) | Space: O(min(m,n)) - Only 2 rows!
      </div>
    </div>
  );
};

// skipcq: JS-0067
export default function LCSVisualizer() {
  const phases: Phase[] = [
    "recursion",
    "memoization",
    "tabulation",
    "spaceOptimized",
  ];
  const phaseLabels: Record<Phase, string> = {
    recursion: "Recursion",
    memoization: "Memoization",
    tabulation: "Tabulation",
    spaceOptimized: "Space Optimized",
  };

  const [currentPhase, setCurrentPhase] = useState<Phase>("tabulation");
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(600);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const recursionSteps = useMemo(() => generateRecursionSteps(), []);
  const { steps: memoSteps } = useMemo(() => generateMemoSteps(), []);
  const { steps: tableSteps, finalAnswer: tableAnswer } = useMemo(
    () => generateTableSteps(),
    []
  );
  const { steps: spaceSteps, finalAnswer: spaceAnswer } = useMemo(
    () => generateSpaceSteps(),
    []
  );

  const getMaxSteps = useCallback(
    (phase: Phase) => {
      if (phase === "recursion") return recursionSteps.length;
      if (phase === "memoization") return memoSteps.length;
      if (phase === "tabulation") return tableSteps.length;
      if (phase === "spaceOptimized") return spaceSteps.length;
      return 0;
    },
    [
      recursionSteps.length,
      memoSteps.length,
      tableSteps.length,
      spaceSteps.length,
    ]
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
    <div className="p-5 bg-gray-900 rounded-xl w-full max-w-4xl mx-auto">
      <div className="text-center mb-3">
        <div className="text-base font-medium text-white">
          Longest Common Subsequence (LCS)
        </div>
        <div className="text-sm text-gray-400">
          text1 = &quot;{text1}&quot; | text2 = &quot;{text2}&quot;
        </div>
      </div>
      <div className="flex justify-center mb-5">
        <div className="inline-flex bg-gray-800/50 p-1 rounded-xl flex-wrap justify-center">
          {phases.map((phase, index) => (
            <button
              key={phase}
              onClick={() => goToPhase(phase)}
              className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all ${currentPhase === phase ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
            >
              <span className="flex items-center gap-1.5">
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
      <div className="mb-5">
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
          {currentPhase === "recursion" && (
            <RecursionPhase step={step} recursionSteps={recursionSteps} />
          )}
          {currentPhase === "memoization" && (
            <MemoizationPhase step={step} memoSteps={memoSteps} />
          )}
          {currentPhase === "tabulation" && (
            <TabulationPhase
              step={step}
              tableSteps={tableSteps}
              finalAnswer={tableAnswer}
            />
          )}
          {currentPhase === "spaceOptimized" && (
            <SpaceOptimizedPhase
              step={step}
              spaceSteps={spaceSteps}
              finalAnswer={spaceAnswer}
            />
          )}
        </motion.div>
      </AnimatePresence>
      <div className="mt-5 pt-3 border-t border-gray-800 text-xs text-gray-500 text-center">
        LCS = &quot;ace&quot; (length 3)
      </div>
    </div>
  );
}
