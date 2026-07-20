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

const ROWS = 3;
const COLS = 3;

interface MemoStep {
  row: number;
  col: number;
  value: number;
  action: string;
  fromCache: boolean;
}

interface TableStep {
  row: number;
  col: number;
  value: number;
  formula: string;
}

interface SpaceStep {
  rowIndex: number;
  dp: number[];
  formula: string;
}

const generateMemoSteps = (): MemoStep[] => {
  const memo: (number | null)[][] = Array.from({ length: ROWS }, () =>
    Array(COLS).fill(null)
  );
  const steps: MemoStep[] = [];

  const solve = (r: number, c: number): number => {
    // skipcq: JS-R1005
    if (r < 0 || c < 0) {
      return 0;
    }

    if (memo[r][c] !== null) {
      steps.push({
        row: r,
        col: c,
        value: memo[r][c] as number,
        action: `Cache hit! memo[${r}][${c}] = ${memo[r][c]}`,
        fromCache: true,
      });
      return memo[r][c] as number;
    }

    if (r === 0 && c === 0) {
      memo[0][0] = 1;
      steps.push({
        row: 0,
        col: 0,
        value: 1,
        action: `Base case: memo[0][0] = 1`, // skipcq: JS-R1004
        fromCache: false,
      });
      return 1;
    }

    const fromAbove = solve(r - 1, c);
    const fromLeft = solve(r, c - 1);
    const result = fromAbove + fromLeft;

    memo[r][c] = result;
    steps.push({
      row: r,
      col: c,
      value: result,
      action: `Compute memo[${r}][${c}] = ${fromAbove} + ${fromLeft} = ${result}`,
      fromCache: false,
    });

    return result;
  };

  solve(2, 2);
  return steps;
};

const generateTableSteps = (): TableStep[] => {
  const steps: TableStep[] = [];
  const dp: number[][] = Array.from({ length: ROWS }, () =>
    Array(COLS).fill(0)
  );

  dp[0][0] = 1;
  steps.push({ row: 0, col: 0, value: 1, formula: "dp[0][0] = 1 (start)" });

  for (let c = 1; c < COLS; c++) {
    dp[0][c] = 1;
    steps.push({
      row: 0,
      col: c,
      value: 1,
      formula: `dp[0][${c}] = 1 (only from left)`,
    });
  }

  for (let r = 1; r < ROWS; r++) {
    dp[r][0] = 1;
    steps.push({
      row: r,
      col: 0,
      value: 1,
      formula: `dp[${r}][0] = 1 (only from above)`,
    });
  }

  for (let r = 1; r < ROWS; r++) {
    for (let c = 1; c < COLS; c++) {
      dp[r][c] = dp[r - 1][c] + dp[r][c - 1];
      steps.push({
        row: r,
        col: c,
        value: dp[r][c],
        formula: `dp[${r}][${c}] = dp[${r - 1}][${c}] + dp[${r}][${c - 1}] = ${dp[r - 1][c]} + ${dp[r][c - 1]} = ${dp[r][c]}`,
      });
    }
  }

  return steps;
};

const generateSpaceSteps = (): SpaceStep[] => {
  const steps: SpaceStep[] = [];
  const dp = new Array(COLS).fill(1);

  steps.push({
    rowIndex: 0,
    dp: [...dp],
    formula: "Initialize dp = [1, 1, 1] (first row: one path to each cell)",
  });

  for (let r = 1; r < ROWS; r++) {
    for (let c = 1; c < COLS; c++) {
      dp[c] = dp[c] + dp[c - 1];
    }
    steps.push({
      rowIndex: r,
      dp: [...dp],
      formula: `Process row ${r}: dp[j] = dp[j] + dp[j-1] results in [${dp.join(", ")}]`,
    });
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

interface TreeNodeData {
  id: string;
  label: string;
  x: number;
  y: number;
  result: number | null;
  parentId: string | null;
}

interface TreeStep {
  nodeId: string;
  action: string;
  result: number | null;
}

const buildRecursionTreeData = (): {
  nodes: TreeNodeData[];
  steps: TreeStep[];
} => {
  const nodes: TreeNodeData[] = [];
  const steps: TreeStep[] = [];

  // Tree for solve(2,2) on 3x3 grid - simplified to show key overlapping subproblem
  // Level 0: root
  nodes.push({
    id: "2,2",
    label: "(2,2)",
    x: 350,
    y: 30,
    result: null,
    parentId: null,
  });

  // Level 1: children of (2,2)
  nodes.push({
    id: "1,2",
    label: "(1,2)",
    x: 175,
    y: 90,
    result: null,
    parentId: "2,2",
  });
  nodes.push({
    id: "2,1",
    label: "(2,1)",
    x: 525,
    y: 90,
    result: null,
    parentId: "2,2",
  });

  // Level 2: children of (1,2) and (2,1)
  nodes.push({
    id: "0,2",
    label: "(0,2)",
    x: 80,
    y: 150,
    result: null,
    parentId: "1,2",
  });
  nodes.push({
    id: "1,1-a",
    label: "(1,1)",
    x: 220,
    y: 150,
    result: null,
    parentId: "1,2",
  });
  nodes.push({
    id: "1,1-b",
    label: "(1,1)",
    x: 430,
    y: 150,
    result: null,
    parentId: "2,1",
  });
  nodes.push({
    id: "2,0",
    label: "(2,0)",
    x: 580,
    y: 150,
    result: null,
    parentId: "2,1",
  });

  // Level 3: show (0,0) base case
  nodes.push({
    id: "0,1",
    label: "(0,1)",
    x: 50,
    y: 210,
    result: null,
    parentId: "0,2",
  });
  nodes.push({
    id: "0,0-a",
    label: "(0,0)",
    x: 130,
    y: 210,
    result: 1,
    parentId: "0,2",
  });

  // Steps showing DFS traversal with computed results
  steps.push({
    nodeId: "2,2",
    action: "solve(2,2): Start at destination",
    result: null,
  });
  steps.push({
    nodeId: "1,2",
    action: "solve(1,2): Go to cell above (2,2)",
    result: null,
  });
  steps.push({
    nodeId: "0,2",
    action: "solve(0,2): Go to cell above (1,2)",
    result: null,
  });
  steps.push({
    nodeId: "0,1",
    action: "solve(0,1): Go left from (0,2)",
    result: null,
  });
  steps.push({
    nodeId: "0,0-a",
    action: "solve(0,0): Base case = 1",
    result: 1,
  });
  steps.push({ nodeId: "0,1", action: "solve(0,1) = 0 + 1 = 1", result: 1 });
  steps.push({ nodeId: "0,2", action: "solve(0,2) = 0 + 1 = 1", result: 1 });
  steps.push({
    nodeId: "1,1-a",
    action: "solve(1,1): Go left from (1,2)",
    result: null,
  });
  steps.push({ nodeId: "1,1-a", action: "solve(1,1) = 1 + 1 = 2", result: 2 });
  steps.push({ nodeId: "1,2", action: "solve(1,2) = 1 + 2 = 3", result: 3 });
  steps.push({
    nodeId: "2,1",
    action: "solve(2,1): Go left from (2,2)",
    result: null,
  });
  steps.push({
    nodeId: "1,1-b",
    action: "solve(1,1): REPEATED! Same as before = 2",
    result: 2,
  });
  steps.push({ nodeId: "2,0", action: "solve(2,0) = 1 + 0 = 1", result: 1 });
  steps.push({ nodeId: "2,1", action: "solve(2,1) = 2 + 1 = 3", result: 3 });
  steps.push({ nodeId: "2,2", action: "solve(2,2) = 3 + 3 = 6", result: 6 });

  return { nodes, steps };
};

const RecursionPhase = ({
  // skipcq: JS-R1005
  step,
}: {
  step: number;
}) => {
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
      <div className="text-sm text-gray-400">
        3x3 Grid | Node: (row, col) | Shows overlapping subproblems
      </div>

      <svg width="700" height="300" className="mx-auto">
        {nodes.map((node) => {
          if (node.parentId === null) return null;
          const parent = nodes.find((n) => n.id === node.parentId);
          if (!parent) return null;

          const isVisited = visitedSet.has(node.id);
          return (
            <g key={`edge-${node.id}`} opacity={isVisited ? 1 : 0.2}>
              <line
                x1={parent.x}
                y1={parent.y + 20}
                x2={node.x}
                y2={node.y - 20}
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
          const isRepeated = node.id.includes("-b");

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
              <circle
                cx={node.x}
                cy={node.y}
                r="22"
                fill={fill}
                stroke={stroke}
                strokeWidth="2"
              />
              <text
                x={node.x}
                y={node.y + 5}
                fill="white"
                fontSize="12"
                textAnchor="middle"
                fontFamily="monospace"
                fontWeight="500"
              >
                {node.label}
              </text>
              {hasResult && (
                <text
                  x={node.x + 26}
                  y={node.y + 5}
                  fill="#86efac"
                  fontSize="11"
                  fontWeight="bold"
                >
                  ={result}
                </text>
              )}
              {isRepeated && isVisited && (
                <text
                  x={node.x}
                  y={node.y + 38}
                  fill="#fde047"
                  fontSize="10"
                  textAnchor="middle"
                >
                  REPEATED
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {currentStep && (
        <div className="text-sm text-center bg-gray-800/50 px-4 py-2 rounded-lg max-w-lg">
          <span className="text-gray-300">{currentStep.action}</span>
        </div>
      )}

      {step >= treeSteps.length && step > 0 && (
        <div className="text-sm text-center bg-green-600/20 px-4 py-2 rounded-lg">
          <span className="text-green-400 font-bold">
            Answer: Unique Paths = 6
          </span>
        </div>
      )}

      <div className="text-xs text-gray-500 text-center">
        solve(r,c) = solve(r-1,c) + solve(r,c-1) | Yellow = repeated subproblem
      </div>
    </div>
  );
};

const MemoPhase = ({
  // skipcq: JS-0415, JS-R1005
  step,
  memoSteps,
}: {
  step: number;
  memoSteps: MemoStep[];
}) => {
  const currentStep =
    step > 0 && step <= memoSteps.length ? memoSteps[step - 1] : null;
  const visibleSteps = memoSteps.slice(0, step);

  const currentMemo = useMemo(() => {
    const memo: (number | null)[][] = Array.from({ length: ROWS }, () =>
      Array(COLS).fill(null)
    );
    for (const s of visibleSteps) {
      if (!s.fromCache) {
        memo[s.row][s.col] = s.value;
      }
    }
    return memo;
  }, [visibleSteps]);

  const cacheHits = visibleSteps.filter((s) => s.fromCache).length;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-sm text-gray-400">
        3x3 Grid | Yellow = cache hit (no recomputation needed)
      </div>

      <div className="flex gap-8 items-start">
        <div>
          <div className="text-xs text-gray-500 text-center mb-2">
            Memo Table
          </div>
          <div
            className="inline-grid gap-1"
            style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
          >
            {currentMemo.map((row, r) =>
              row.map((val, c) => {
                // skipcq: JS-R1005
                const isCurrent =
                  currentStep?.row === r && currentStep?.col === c;
                const isCacheHit = currentStep?.fromCache && isCurrent;

                return (
                  <div
                    key={`memo-${r}-${c}`} // skipcq: JS-0437
                    className={`w-14 h-14 flex flex-col items-center justify-center rounded font-mono border-2 transition-all ${
                      isCurrent
                        ? isCacheHit
                          ? "bg-yellow-600/30 border-yellow-500 text-yellow-300"
                          : "bg-blue-600 border-blue-400 text-white"
                        : val !== null
                          ? "bg-green-600/20 border-green-600 text-green-300"
                          : "bg-gray-900/50 border-gray-700 text-gray-600"
                    }`}
                  >
                    <span className="text-xs text-gray-400">
                      ({r},{c})
                    </span>
                    <span className="text-lg">{val !== null ? val : "-"}</span>
                  </div>
                );
              })
            )}
          </div>
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
            Answer: Unique Paths = 6
          </span>
        </div>
      )}

      <div className="text-xs text-gray-500 text-center">
        Time: O(m*n). Each cell computed once, then cached.
      </div>
    </div>
  );
};

const TabulationPhase = ({
  // skipcq: JS-R1005
  step,
  tableSteps,
}: {
  step: number;
  tableSteps: TableStep[];
}) => {
  const dpTable = useMemo(() => {
    const dp: number[][] = Array.from({ length: ROWS }, () =>
      Array(COLS).fill(0)
    );
    for (let s = 0; s < Math.min(step, tableSteps.length); s++) {
      const { row, col, value } = tableSteps[s];
      dp[row][col] = value;
    }
    return dp;
  }, [step, tableSteps]);

  const currentStep =
    step > 0 && step <= tableSteps.length ? tableSteps[step - 1] : null;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-sm text-gray-400">
        Fill row-by-row: first row, first col, then interior cells
      </div>

      <div className="text-center">
        <div className="text-sm text-gray-500 mb-2">
          dp[r][c] = paths to cell (r,c)
        </div>
        <div
          className="inline-grid gap-1"
          style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
        >
          {dpTable.map((row, r) =>
            row.map((val, c) => {
              // skipcq: JS-R1005
              const isCurrent =
                currentStep?.row === r && currentStep?.col === c;
              const isStart = r === 0 && c === 0;
              const isEnd = r === ROWS - 1 && c === COLS - 1;

              return (
                <div
                  key={`dp-${r}-${c}`} // skipcq: JS-0437
                  className={`w-14 h-14 flex flex-col items-center justify-center rounded font-mono border-2 transition-all ${
                    isCurrent
                      ? "bg-blue-600 border-blue-400 text-white font-bold"
                      : isStart
                        ? "bg-green-600 border-green-500 text-white"
                        : isEnd && val > 0
                          ? "bg-purple-600 border-purple-500 text-white"
                          : val > 0
                            ? "bg-gray-800 border-gray-600 text-gray-300"
                            : "bg-gray-900/50 border-gray-700 text-gray-600"
                  }`}
                >
                  <span className="text-xs text-gray-400">
                    ({r},{c})
                  </span>
                  <span className="text-lg">{val || ""}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {currentStep && (
        <div className="text-sm text-center font-mono bg-gray-800/50 text-gray-400 px-6 py-3 rounded-lg">
          {currentStep.formula}
        </div>
      )}

      {step >= tableSteps.length && step > 0 && (
        <div className="text-sm text-center bg-green-600/20 px-4 py-2 rounded-lg">
          <span className="text-green-400 font-bold">
            Answer: Unique Paths = 6
          </span>
        </div>
      )}

      <div className="text-sm text-gray-500">
        dp[r][c] = dp[r-1][c] + dp[r][c-1] (from above + from left)
      </div>
    </div>
  );
};

const SpaceOptimizedPhase = ({
  // skipcq: JS-R1005
  step,
  spaceSteps,
}: {
  step: number;
  spaceSteps: SpaceStep[];
}) => {
  const currentStep =
    step > 0 && step <= spaceSteps.length ? spaceSteps[step - 1] : null;
  const displayDp = currentStep ? currentStep.dp : new Array(COLS).fill(0);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-sm text-gray-400">
        Only keep one row in memory. dp[j] before update = value from above.
      </div>

      <div className="text-center">
        <div className="text-sm text-gray-500 mb-2">
          Rolling 1D Array (row {currentStep?.rowIndex ?? 0})
        </div>
        <div
          className="inline-grid gap-1"
          style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
        >
          {displayDp.map((val, c) => (
            <div
              key={`space-${c}`} // skipcq: JS-0437
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

      {step >= spaceSteps.length && step > 0 && (
        <div className="text-sm text-center bg-green-600/20 px-4 py-2 rounded-lg">
          <span className="text-green-400 font-bold">
            Answer: Unique Paths = {displayDp[COLS - 1]}
          </span>
        </div>
      )}

      <div className="text-sm text-gray-500">
        Space: O(n) instead of O(m*n). dp[j] += dp[j-1] on each row.
      </div>
    </div>
  );
};

// skipcq: JS-0067
export default function GridDPVisualizer() {
  const phases: Phase[] = ["recursion", "memo", "tabulation", "space"];
  const phaseLabels: Record<Phase, string> = {
    recursion: "Recursion",
    memo: "Memoization",
    tabulation: "Tabulation",
    space: "Space O(n)",
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
  const tableSteps = useMemo(() => generateTableSteps(), []);
  const spaceSteps = useMemo(() => generateSpaceSteps(), []);

  const getMaxSteps = useCallback(
    (phase: Phase) => {
      if (phase === "recursion") return recursionTreeSteps.length;
      if (phase === "memo") return memoSteps.length;
      if (phase === "tabulation") return tableSteps.length;
      return spaceSteps.length;
    },
    [
      recursionTreeSteps.length,
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
    <div className="p-6 bg-gray-900 rounded-xl w-full max-w-5xl mx-auto">
      <div className="text-center mb-4">
        <div className="text-lg font-medium text-white">
          Grid DP (2D Navigation)
        </div>
        <div className="text-sm text-gray-400">
          Count unique paths from top-left to bottom-right (right/down only)
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
          {currentPhase === "space" && (
            <SpaceOptimizedPhase step={step} spaceSteps={spaceSteps} />
          )}
        </motion.div>
      </AnimatePresence>
      <div className="mt-6 pt-4 border-t border-gray-800 text-sm text-gray-500 text-center">
        {ROWS}x{COLS} grid | Unique Paths = 6 | Time: O(m*n), Space: O(n)
        optimized
      </div>
    </div>
  );
}
