"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

type Phase = "recursion" | "memo" | "tabulation" | "space";

const balloons = [3, 1, 5, 8];
const n = balloons.length;
const nums = [1, ...balloons, 1];

interface TreeStep {
  nodeId: string;
  action: string;
  result: number | null;
}

interface MemoStep {
  l: number;
  r: number;
  value: number;
  action: string;
  fromCache: boolean;
}

interface TableStep {
  l: number;
  r: number;
  k: number;
  value: number;
  formula: string;
  len: number;
}

interface TreeNodeData {
  id: string;
  label: string;
  x: number;
  y: number;
  result: number | null;
  parentId: string | null;
}

const buildRecursionTreeData = (): {
  nodes: TreeNodeData[];
  steps: TreeStep[];
} => {
  const nodes: TreeNodeData[] = [];
  const steps: TreeStep[] = [];

  // Simplified tree for solve(1,4) showing key structure and overlap
  nodes.push({
    id: "1,4",
    label: "[1,4]",
    x: 350,
    y: 30,
    result: null,
    parentId: null,
  });

  // Level 1: try k=1,2,3,4 as last burst
  nodes.push({
    id: "1,0+2,4-k1",
    label: "[2,4]",
    x: 150,
    y: 90,
    result: null,
    parentId: "1,4",
  });
  nodes.push({
    id: "1,1+3,4-k2",
    label: "[1,1]",
    x: 280,
    y: 90,
    result: null,
    parentId: "1,4",
  });
  nodes.push({
    id: "3,4-k2",
    label: "[3,4]",
    x: 350,
    y: 90,
    result: null,
    parentId: "1,4",
  });
  nodes.push({
    id: "1,2+4,4-k3",
    label: "[1,2]",
    x: 450,
    y: 90,
    result: null,
    parentId: "1,4",
  });
  nodes.push({
    id: "1,3-k4",
    label: "[1,3]",
    x: 550,
    y: 90,
    result: null,
    parentId: "1,4",
  });

  // Level 2: subproblems
  nodes.push({
    id: "2,2",
    label: "[2,2]",
    x: 100,
    y: 150,
    result: null,
    parentId: "1,0+2,4-k1",
  });
  nodes.push({
    id: "3,4-sub",
    label: "[3,4]",
    x: 200,
    y: 150,
    result: null,
    parentId: "1,0+2,4-k1",
  });
  nodes.push({
    id: "1,1-sub",
    label: "[1,1]",
    x: 450,
    y: 150,
    result: null,
    parentId: "1,2+4,4-k3",
  });
  nodes.push({
    id: "2,2-sub",
    label: "[2,2]",
    x: 520,
    y: 150,
    result: null,
    parentId: "1,2+4,4-k3",
  });

  // Steps showing exploration with repeated subproblems
  steps.push({
    nodeId: "1,4",
    action: "solve(1,4): Find max coins for all 4 balloons",
    result: null,
  });
  steps.push({
    nodeId: "1,0+2,4-k1",
    action: "Try k=1 last: need solve(2,4)",
    result: null,
  });
  steps.push({
    nodeId: "2,2",
    action: "solve(2,2): single balloon [1] = 3*1*5 = 15",
    result: 15,
  });
  steps.push({
    nodeId: "3,4-sub",
    action: "solve(3,4): need to solve [3,4] range",
    result: null,
  });
  steps.push({
    nodeId: "3,4-sub",
    action: "solve(3,4) = max(40, 48) = 48",
    result: 48,
  });
  steps.push({
    nodeId: "1,0+2,4-k1",
    action: "solve(2,4) = 15 + 48 + merge = 159",
    result: 159,
  });
  steps.push({
    nodeId: "1,1+3,4-k2",
    action: "Try k=2 last: need solve(1,1) and solve(3,4)",
    result: null,
  });
  steps.push({
    nodeId: "1,1+3,4-k2",
    action: "solve(1,1) = 1*3*1 = 3",
    result: 3,
  });
  steps.push({
    nodeId: "3,4-k2",
    action: "solve(3,4): REPEATED! Already computed = 48",
    result: 48,
  });
  steps.push({
    nodeId: "1,2+4,4-k3",
    action: "Try k=3 last: need solve(1,2)",
    result: null,
  });
  steps.push({ nodeId: "1,1-sub", action: "solve(1,1) = 3", result: 3 });
  steps.push({
    nodeId: "2,2-sub",
    action: "solve(2,2): REPEATED! = 15",
    result: 15,
  });
  steps.push({ nodeId: "1,2+4,4-k3", action: "solve(1,2) = 30", result: 30 });
  steps.push({
    nodeId: "1,3-k4",
    action: "Try k=4 last: need solve(1,3)",
    result: null,
  });
  steps.push({
    nodeId: "1,3-k4",
    action: "solve(1,3) computed similarly...",
    result: 159,
  });
  steps.push({
    nodeId: "1,4",
    action: "solve(1,4) = max(all k options) = 167",
    result: 167,
  });

  return { nodes, steps };
};

const generateMemoSteps = (): MemoStep[] => {
  const memo: (number | null)[][] = Array.from({ length: n + 2 }, () =>
    Array(n + 2).fill(null)
  );
  const steps: MemoStep[] = [];

  const solve = (l: number, r: number): number => {
    if (l > r) return 0;

    if (memo[l][r] !== null) {
      steps.push({
        l,
        r,
        value: memo[l][r] as number,
        action: `Cache hit! memo[${l}][${r}] = ${memo[l][r]}`,
        fromCache: true,
      });
      return memo[l][r] as number;
    }

    let maxCoins = 0;
    for (let k = l; k <= r; k++) {
      const coins =
        nums[l - 1] * nums[k] * nums[r + 1] + solve(l, k - 1) + solve(k + 1, r);
      maxCoins = Math.max(maxCoins, coins);
    }

    memo[l][r] = maxCoins;
    steps.push({
      l,
      r,
      value: maxCoins,
      action: `Compute memo[${l}][${r}] = ${maxCoins}`,
      fromCache: false,
    });

    return maxCoins;
  };

  solve(1, n);
  return steps;
};

const generateTableSteps = (): { steps: TableStep[]; answer: number } => {
  const steps: TableStep[] = [];
  const dp: number[][] = Array(n + 2)
    .fill(null)
    .map(() => Array(n + 2).fill(0));

  for (let len = 1; len <= n; len++) {
    for (let l = 1; l <= n - len + 1; l++) {
      const r = l + len - 1;
      for (let k = l; k <= r; k++) {
        const coins =
          nums[l - 1] * nums[k] * nums[r + 1] + dp[l][k - 1] + dp[k + 1][r];
        if (coins > dp[l][r]) {
          dp[l][r] = coins;
          steps.push({
            l,
            r,
            k,
            value: dp[l][r],
            len,
            formula: `k=${k} last: ${nums[l - 1]}*${nums[k]}*${nums[r + 1]} + dp[${l}][${k - 1}] + dp[${k + 1}][${r}] = ${coins}`,
          });
        }
      }
    }
  }

  return { steps, answer: dp[1][n] };
};

const INTERVAL_DP_ANSWER = generateTableSteps().answer;

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

const BalloonsDisplay = ({
  highlightRange,
}: {
  highlightRange?: { l: number; r: number; k?: number };
}) => (
  <div className="flex justify-center gap-2 mb-4">
    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-700 text-gray-400 font-mono text-sm">
      1
    </div>
    {balloons.map((b, idx) => {
      const pos = idx + 1;
      const inRange =
        highlightRange && pos >= highlightRange.l && pos <= highlightRange.r;
      const isK = highlightRange && pos === highlightRange.k;
      return (
        <div
          key={`balloon-${pos}`}
          className={`w-12 h-12 flex items-center justify-center rounded-full font-mono font-bold transition-all ${
            isK
              ? "bg-red-600 text-white ring-2 ring-red-400"
              : inRange
                ? "bg-blue-600 text-white"
                : "bg-yellow-500 text-black"
          }`}
        >
          {b}
        </div>
      );
    })}
    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-700 text-gray-400 font-mono text-sm">
      1
    </div>
  </div>
);

const RecursionPhase = ({ step }: { step: number }) => {
  // skipcq: JS-R1005
  const { nodes, steps: treeSteps } = useMemo(
    () => buildRecursionTreeData(),
    []
  );
  const currentStep =
    step > 0 && step <= treeSteps.length ? treeSteps[step - 1] : null;

  const visitedSet = useMemo(() => {
    const set = new Set<string>();
    for (let i = 0; i < Math.min(step, treeSteps.length); i++) {
      set.add(treeSteps[i].nodeId);
    }
    return set;
  }, [step, treeSteps]);

  const currentNodeId = currentStep?.nodeId ?? null;

  const nodeResults = useMemo(() => {
    const results = new Map<string, number>();
    for (let i = 0; i < Math.min(step, treeSteps.length); i++) {
      const s = treeSteps[i]; // skipcq: JS-C1002
      if (s.result !== null) {
        results.set(s.nodeId, s.result);
      }
    }
    return results;
  }, [step, treeSteps]);

  return (
    // skipcq: JS-0415
    <div className="flex flex-col items-center gap-4">
      <BalloonsDisplay />
      <div className="text-sm text-gray-400 mb-2">
        solve(l, r) tries each k as LAST burst. Overlapping subproblems: [3,4],
        [2,2] computed multiple times.
      </div>

      <svg width="700" height="200" className="mx-auto">
        {nodes.map((node) => {
          if (node.parentId === null) return null;
          const parent = nodes.find((nd) => nd.id === node.parentId);
          if (!parent) return null;

          const isVisited = visitedSet.has(node.id);
          return (
            <g key={`edge-${node.id}`} opacity={isVisited ? 1 : 0.2}>
              <line
                x1={parent.x}
                y1={parent.y + 18}
                x2={node.x}
                y2={node.y - 18}
                stroke="#4b5563"
                strokeWidth="2"
              />
            </g>
          );
        })}

        {nodes.map((node) => {
          // skipcq: JS-R1005
          const isVisited = visitedSet.has(node.id);
          const isCurrent = node.id === currentNodeId;
          const hasResult = nodeResults.has(node.id);
          const result = nodeResults.get(node.id);
          const isRepeated = node.id.includes("-sub") || node.id === "3,4-k2";

          let fill = "#1f2937";
          let stroke = "#4b5563";
          if (isCurrent) {
            fill = "#2563eb";
            stroke = "#60a5fa";
          } else if (isRepeated && isVisited) {
            fill = "#854d0e";
            stroke = "#ca8a04";
          } else if (hasResult) {
            fill = "#166534";
            stroke = "#22c55e";
          } else if (isVisited) {
            fill = "#374151";
            stroke = "#6b7280";
          }

          return (
            <g key={`node-${node.id}`} opacity={isVisited ? 1 : 0.2}>
              <rect
                x={node.x - 28}
                y={node.y - 14}
                width="56"
                height="28"
                rx="6"
                fill={fill}
                stroke={stroke}
                strokeWidth="2"
              />
              <text
                x={node.x}
                y={node.y + 5}
                fill="white"
                fontSize="11"
                textAnchor="middle"
                fontFamily="monospace"
                fontWeight="500"
              >
                {node.label}
              </text>
              {hasResult && (
                <text
                  x={node.x + 32}
                  y={node.y + 5}
                  fill="#86efac"
                  fontSize="10"
                  fontWeight="bold"
                >
                  ={result}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {currentStep && (
        <div className="text-sm text-center bg-gray-800/50 px-4 py-2 rounded-lg max-w-xl">
          <span className="text-gray-300">{currentStep.action}</span>
        </div>
      )}

      {step >= treeSteps.length && step > 0 && (
        <div className="text-sm text-center bg-green-600/20 px-4 py-2 rounded-lg">
          <span className="text-green-400 font-bold">
            Answer: Max coins = {INTERVAL_DP_ANSWER}
          </span>
        </div>
      )}

      <div className="text-xs text-gray-500 text-center">
        Yellow = repeated subproblem (computed multiple times in brute force)
      </div>
    </div>
  );
};

const MemoPhase = ({
  step,
  memoSteps,
}: {
  step: number;
  memoSteps: MemoStep[];
}) => {
  // skipcq: JS-0415, JS-R1005
  const currentStep =
    step > 0 && step <= memoSteps.length ? memoSteps[step - 1] : null;
  const visibleSteps = memoSteps.slice(0, step);

  const currentMemo = useMemo(() => {
    const memo: (number | null)[][] = Array.from({ length: n + 2 }, () =>
      Array(n + 2).fill(null)
    );
    for (const s of visibleSteps) {
      if (!s.fromCache) {
        memo[s.l][s.r] = s.value;
      }
    }
    return memo;
  }, [visibleSteps]);

  const cacheHits = visibleSteps.filter((s) => s.fromCache).length;

  return (
    // skipcq: JS-0415
    <div className="flex flex-col items-center gap-4">
      <BalloonsDisplay
        highlightRange={
          currentStep ? { l: currentStep.l, r: currentStep.r } : undefined
        }
      />
      <div className="text-sm text-gray-400">
        memo[l][r] caches max coins for range [l,r]. Yellow = cache hit.
      </div>

      <div className="flex gap-6 items-start">
        <div>
          <div className="text-xs text-gray-500 text-center mb-2">
            Memo Table
          </div>
          <table className="border-collapse text-sm">
            <thead>
              <tr>
                <th className="p-1 text-gray-500 w-8">l\r</th>
                {Array.from({ length: n }, (_, c) => (
                  <th key={`mh-${c + 1}`} className="p-1 text-gray-400 w-10">
                    {c + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: n }, (_, rowL) => (
                <tr key={`mr-${rowL + 1}`}>
                  <td className="p-1 text-gray-400 font-mono text-center">
                    {rowL + 1}
                  </td>
                  {Array.from({ length: n }, (_, colR) => {
                    // skipcq: JS-R1005
                    const isCurrent =
                      currentStep &&
                      currentStep.l === rowL + 1 &&
                      currentStep.r === colR + 1;
                    const isCacheHit = currentStep?.fromCache && isCurrent;
                    const value = currentMemo[rowL + 1]?.[colR + 1];
                    const isValid = colR >= rowL;

                    return (
                      <td key={`mc-${rowL + 1}-${colR + 1}`} className="p-0.5">
                        <div
                          className={`w-10 h-8 flex items-center justify-center border rounded font-mono text-xs transition-all ${
                            !isValid
                              ? "bg-gray-900/30 border-gray-800 text-gray-700"
                              : isCurrent
                                ? isCacheHit
                                  ? "bg-yellow-600/30 border-yellow-500 text-yellow-300"
                                  : "bg-blue-600 border-blue-400 text-white"
                                : value !== null
                                  ? "bg-green-600/20 border-green-600 text-green-300"
                                  : "bg-gray-900/50 border-gray-700 text-gray-600"
                          }`}
                        >
                          {isValid && value !== null ? value : ""}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-sm">
          <div className="text-gray-400 mb-2">Stats:</div>
          <div className="text-gray-400">
            Computed: <span className="text-green-400">{step - cacheHits}</span>
          </div>
          <div className="text-gray-400">
            Cache hits: <span className="text-yellow-400">{cacheHits}</span>
          </div>
        </div>
      </div>

      {currentStep && (
        <div
          className={`text-sm text-center font-mono px-4 py-2 rounded-lg ${
            currentStep.fromCache
              ? "bg-yellow-600/20 text-yellow-400"
              : "bg-blue-600/20 text-blue-300"
          }`}
        >
          {currentStep.action}
        </div>
      )}

      {step >= memoSteps.length && step > 0 && (
        <div className="text-sm text-center bg-green-600/20 px-4 py-2 rounded-lg">
          <span className="text-green-400 font-bold">
            Answer: Max coins = {INTERVAL_DP_ANSWER}
          </span>
        </div>
      )}

      <div className="text-xs text-gray-500 text-center">
        Time: O(n^3). Each [l,r] computed once, then cached.
      </div>
    </div>
  );
};

const TabulationPhase = ({
  step,
  tableSteps,
}: {
  step: number;
  tableSteps: TableStep[];
}) => {
  // skipcq: JS-0415, JS-R1005
  const dpTable = useMemo(() => {
    const dp: number[][] = Array(n + 2)
      .fill(null)
      .map(() => Array(n + 2).fill(0));
    for (let s = 0; s < Math.min(step, tableSteps.length); s++) {
      const { l, r, value } = tableSteps[s];
      dp[l][r] = value;
    }
    return dp;
  }, [step, tableSteps]);

  const currentStep =
    step > 0 && step <= tableSteps.length ? tableSteps[step - 1] : null;

  return (
    <div className="flex flex-col items-center gap-4">
      <BalloonsDisplay
        highlightRange={
          currentStep
            ? { l: currentStep.l, r: currentStep.r, k: currentStep.k }
            : undefined
        }
      />

      <div className="text-sm text-gray-400">
        Fill by LENGTH: len=1 (single balloons), then len=2, len=3, len=4
      </div>

      <div className="text-center">
        <div className="text-xs text-gray-500 mb-2">
          dp[l][r] = max coins bursting [l,r]
        </div>
        <table className="border-collapse text-sm">
          <thead>
            <tr>
              <th className="p-1 text-gray-500 w-10">l\r</th>
              {Array.from({ length: n }, (_, c) => (
                <th key={`th-${c + 1}`} className="p-1 text-gray-400 w-12">
                  {c + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: n }, (_, rowL) => (
              <tr key={`tr-${rowL + 1}`}>
                <td className="p-1 text-gray-400 font-mono">{rowL + 1}</td>
                {Array.from({ length: n }, (_, colR) => {
                  // skipcq: JS-R1005
                  const isCurrent =
                    currentStep &&
                    currentStep.l === rowL + 1 &&
                    currentStep.r === colR + 1;
                  const value = dpTable[rowL + 1]?.[colR + 1];
                  const isValid = colR >= rowL;

                  return (
                    <td key={`td-${rowL + 1}-${colR + 1}`} className="p-0.5">
                      <div
                        className={`w-12 h-10 flex items-center justify-center border-2 rounded font-mono text-sm ${
                          !isValid
                            ? "bg-gray-900/30 border-gray-800 text-gray-700"
                            : isCurrent
                              ? "bg-green-600 border-green-400 text-white font-bold"
                              : value > 0
                                ? "bg-gray-800 border-gray-600 text-gray-300"
                                : "bg-gray-900/50 border-gray-700 text-gray-600"
                        }`}
                      >
                        {isValid ? value || "" : ""}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {currentStep && (
        <div className="text-sm text-center">
          <div className="text-gray-400 mb-1">
            Length {currentStep.len}: range [{currentStep.l}, {currentStep.r}],
            burst {balloons[currentStep.k - 1]} last
          </div>
          <div className="font-mono bg-gray-800/50 text-green-400 px-4 py-2 rounded-lg text-xs">
            {currentStep.formula}
          </div>
        </div>
      )}

      {step >= tableSteps.length && step > 0 && (
        <div className="text-sm text-center bg-green-600/20 px-4 py-2 rounded-lg">
          <span className="text-green-400 font-bold">
            Answer: Max coins = {INTERVAL_DP_ANSWER}
          </span>
        </div>
      )}

      <div className="text-xs text-gray-500 text-center">
        Time: O(n^3), Space: O(n^2). Fill order ensures dependencies ready.
      </div>
    </div>
  );
};

const SpaceNote = () => (
  <div className="flex flex-col items-center gap-6">
    <BalloonsDisplay />

    <div className="bg-gray-800/30 rounded-lg p-6 max-w-lg text-center">
      <div className="text-white font-medium mb-4">
        Space Optimization: Not Applicable
      </div>
      <div className="text-sm text-gray-400 space-y-3">
        <p>
          Unlike Grid DP where dp[i][j] only needs dp[i-1][j] and dp[i][j-1],
          Interval DP has more complex dependencies.
        </p>
        <p>
          dp[l][r] depends on dp[l][k-1] and dp[k+1][r] for ALL k in [l,r].
          These span multiple columns and rows.
        </p>
        <p className="text-gray-500">
          Therefore, the full O(n^2) table must be kept. No rolling-row
          optimization possible.
        </p>
      </div>
    </div>

    <div className="text-sm text-center bg-blue-600/20 px-4 py-2 rounded-lg">
      <span className="text-blue-400">Space: O(n^2)</span>
      <span className="text-gray-400 ml-2">(cannot reduce like Grid DP)</span>
    </div>
  </div>
);

// skipcq: JS-0067
export default function IntervalDPVisualizer() {
  const phases: Phase[] = ["recursion", "memo", "tabulation", "space"];
  const phaseLabels: Record<Phase, string> = {
    recursion: "Recursion",
    memo: "Memoization",
    tabulation: "Tabulation",
    space: "Space O(n^2)",
  };

  const [currentPhase, setCurrentPhase] = useState<Phase>("tabulation");
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(600);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { steps: recursionTreeSteps } = useMemo(
    () => buildRecursionTreeData(),
    []
  );
  const memoSteps = useMemo(() => generateMemoSteps(), []);
  const { steps: tableSteps, answer } = useMemo(() => generateTableSteps(), []);

  const getMaxSteps = useCallback(
    (phase: Phase) => {
      if (phase === "recursion") return recursionTreeSteps.length;
      if (phase === "memo") return memoSteps.length;
      if (phase === "tabulation") return tableSteps.length;
      return 1;
    },
    [recursionTreeSteps.length, memoSteps.length, tableSteps.length]
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
          Interval DP (Burst Balloons)
        </div>
        <div className="text-sm text-gray-400">
          Maximize coins: think which balloon to burst LAST in each range
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
          {currentPhase === "recursion" && <RecursionPhase step={step} />}
          {currentPhase === "memo" && (
            <MemoPhase step={step} memoSteps={memoSteps} />
          )}
          {currentPhase === "tabulation" && (
            <TabulationPhase step={step} tableSteps={tableSteps} />
          )}
          {currentPhase === "space" && <SpaceNote />}
        </motion.div>
      </AnimatePresence>
      <div className="mt-6 pt-4 border-t border-gray-800 text-sm text-gray-500 text-center">
        balloons = [{balloons.join(", ")}] | Max coins = {answer}
      </div>
    </div>
  );
}
