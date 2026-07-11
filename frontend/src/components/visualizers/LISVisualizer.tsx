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
const treeNums = [2, 5, 3];

interface RecursionStep {
  index: number;
  prevIndex: number;
  action: string;
  result: number | null;
  phase: "enter" | "return";
}

interface MemoStep {
  index: number;
  prevIndex: number;
  value: number;
  action: string;
  fromCache: boolean;
}

const generateRecursionSteps = (): RecursionStep[] => {
  const steps: RecursionStep[] = [];

  const solve = (index: number, prevIndex: number): number => { // skipcq: JS-R1005
    const prevVal = prevIndex === -1 ? "-∞" : String(treeNums[prevIndex]);

    if (index >= treeNums.length) {
      steps.push({
        index,
        prevIndex,
        action: `solve(${index}, ${prevIndex}): Base case, return 0`,
        result: 0,
        phase: "return",
      });
      return 0;
    }

    const currentNum = treeNums[index];
    const prevValue = prevIndex === -1 ? -Infinity : treeNums[prevIndex];
    const canTake = currentNum > prevValue;

    steps.push({
      index,
      prevIndex,
      action: `solve(${index}, ${prevIndex}): At ${currentNum}, prev=${prevVal}. ${canTake ? "Can take or skip." : "Can only skip."}`,
      result: null,
      phase: "enter",
    });

    let result: number;
    if (canTake) {
      const take = 1 + solve(index + 1, index);
      const skip = solve(index + 1, prevIndex);
      result = Math.max(take, skip);
      steps.push({
        index,
        prevIndex,
        action: `solve(${index}, ${prevIndex}): take=${take}, skip=${skip}. Return ${result}`,
        result,
        phase: "return",
      });
    } else {
      result = solve(index + 1, prevIndex);
      steps.push({
        index,
        prevIndex,
        action: `solve(${index}, ${prevIndex}): Only skip. Return ${result}`,
        result,
        phase: "return",
      });
    }

    return result;
  };

  solve(0, -1);
  return steps;
};

const generateMemoSteps = (): {
  steps: MemoStep[];
} => {
  const n = treeNums.length;
  const memo: (number | null)[][] = Array.from({ length: n + 1 }, () =>
    Array(n + 1).fill(null)
  );
  const steps: MemoStep[] = [];

  const solve = (index: number, prevIndex: number): number => {
    if (index >= n) {
      return 0;
    }

    if (memo[index][prevIndex + 1] !== null) {
      steps.push({
        index,
        prevIndex,
        value: memo[index][prevIndex + 1] as number,
        action: `Cache hit! memo[${index}][${prevIndex + 1}] = ${memo[index][prevIndex + 1]}`,
        fromCache: true,
      });
      return memo[index][prevIndex + 1] as number;
    }

    const prevValue = prevIndex === -1 ? -Infinity : treeNums[prevIndex];
    const currentNum = treeNums[index];

    let result: number;
    if (currentNum > prevValue) {
      const take = 1 + solve(index + 1, index);
      const skip = solve(index + 1, prevIndex);
      result = Math.max(take, skip);
      steps.push({
        index,
        prevIndex,
        value: result,
        action: `Compute memo[${index}][${prevIndex + 1}]: take=${take}, skip=${skip}. Store ${result}.`,
        fromCache: false,
      });
    } else {
      result = solve(index + 1, prevIndex);
      steps.push({
        index,
        prevIndex,
        value: result,
        action: `Can't take ${currentNum} (prev=${prevValue}). Skip. Store ${result}.`,
        fromCache: false,
      });
    }

    memo[index][prevIndex + 1] = result;
    return result;
  };

  solve(0, -1);

  return { steps };
};

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

interface TreeNodeData {
  id: number;
  label: string;
  x: number;
  y: number;
  result: number | null;
  parentId: number | null;
  edgeLabel: string;
}

const buildRecursionTreeData = (): { nodes: TreeNodeData[]; visitOrder: number[] } => {
  const nodes: TreeNodeData[] = [];
  const visitOrder: number[] = [];

  nodes.push({ id: 0, label: "(0,-)", x: 350, y: 35, result: null, parentId: null, edgeLabel: "" });

  nodes.push({ id: 1, label: "(1,0)", x: 175, y: 100, result: null, parentId: 0, edgeLabel: "take 2" });
  nodes.push({ id: 2, label: "(1,-)", x: 525, y: 100, result: null, parentId: 0, edgeLabel: "skip" });

  nodes.push({ id: 3, label: "(2,1)", x: 90, y: 165, result: null, parentId: 1, edgeLabel: "take 5" });
  nodes.push({ id: 4, label: "(2,0)", x: 260, y: 165, result: null, parentId: 1, edgeLabel: "skip" });
  nodes.push({ id: 5, label: "(2,1)", x: 440, y: 165, result: null, parentId: 2, edgeLabel: "take 5" });
  nodes.push({ id: 6, label: "(2,-)", x: 610, y: 165, result: null, parentId: 2, edgeLabel: "skip" });

  visitOrder.push(0);
  visitOrder.push(1);
  visitOrder.push(3);
  nodes[3].result = 0;
  visitOrder.push(3);
  visitOrder.push(4);
  nodes[4].result = 1;
  visitOrder.push(4);
  nodes[1].result = 2;
  visitOrder.push(1);
  visitOrder.push(2);
  visitOrder.push(5);
  nodes[5].result = 0;
  visitOrder.push(5);
  visitOrder.push(6);
  nodes[6].result = 1;
  visitOrder.push(6);
  nodes[2].result = 1;
  visitOrder.push(2);
  nodes[0].result = 2;
  visitOrder.push(0);

  return { nodes, visitOrder };
};

const TreePhase = ({ // skipcq: JS-R1005
  step,
  recursionSteps,
}: {
  step: number;
  recursionSteps: RecursionStep[];
}) => {
  const { nodes, visitOrder } = useMemo(() => buildRecursionTreeData(), []);
  const currentStep = step > 0 ? recursionSteps[step - 1] : null;

  const visitedSet = useMemo(() => {
    const set = new Set<number>();
    for (let i = 0; i < Math.min(step, visitOrder.length); i++) {
      set.add(visitOrder[i]);
    }
    return set;
  }, [step, visitOrder]);

  const currentNodeId = step > 0 && step <= visitOrder.length ? visitOrder[step - 1] : null;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-sm text-gray-400">
        Array: [{treeNums.join(", ")}] | Node: (index, prev)
      </div>

      <svg width="700" height="220" className="mx-auto">
        {nodes.map((node) => {
          if (node.parentId === null) return null;
          const parent = nodes.find(n => n.id === node.parentId);
          if (!parent) return null;

          const isVisited = visitedSet.has(node.id);
          return (
            <g key={`edge-${node.id}`} opacity={isVisited ? 1 : 0.2}>
              <line
                x1={parent.x}
                y1={parent.y + 22}
                x2={node.x}
                y2={node.y - 22}
                stroke="#4b5563"
                strokeWidth="2"
              />
              <text
                x={(parent.x + node.x) / 2}
                y={(parent.y + node.y) / 2}
                fill="#d1d5db"
                fontSize="11"
                textAnchor="middle"
                fontWeight="500"
              >
                {node.edgeLabel}
              </text>
            </g>
          );
        })}

        {nodes.map((node) => { // skipcq: JS-R1005
          const isVisited = visitedSet.has(node.id);
          const isCurrent = node.id === currentNodeId;
          const hasResult = node.result !== null && isVisited;

          let fill = "#1f2937";
          let stroke = "#4b5563";
          if (isCurrent) {
            fill = "#2563eb";
            stroke = "#60a5fa";
          } else if (hasResult) {
            fill = "#166534";
            stroke = "#22c55e";
          } else if (isVisited) {
            fill = "#374151";
            stroke = "#6b7280";
          }

          return (
            <g key={`node-${node.id}`} opacity={isVisited ? 1 : 0.2}>
              <circle cx={node.x} cy={node.y} r="24" fill={fill} stroke={stroke} strokeWidth="2" />
              <text x={node.x} y={node.y + 5} fill="white" fontSize="13" textAnchor="middle" fontFamily="monospace" fontWeight="500">
                {node.label}
              </text>
              {hasResult && (
                <text x={node.x + 28} y={node.y + 5} fill="#86efac" fontSize="12" fontWeight="bold">
                  ={node.result}
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

      {step >= recursionSteps.length && step > 0 && (
        <div className="text-sm text-center bg-green-600/20 px-4 py-2 rounded-lg">
          <span className="text-green-400 font-bold">Answer: LIS length = 2</span>
          <span className="text-gray-400 ml-2">(e.g., [2, 5] or [2, 3])</span>
        </div>
      )}

      <div className="text-xs text-gray-500 text-center">
        Each node: take current element or skip. Green = computed result.
      </div>
    </div>
  );
};

const buildMemoTreeData = (): { nodes: TreeNodeData[]; visitOrder: { nodeId: number; fromCache: boolean }[] } => {
  const nodes: TreeNodeData[] = [];
  const visitOrder: { nodeId: number; fromCache: boolean }[] = [];

  nodes.push({ id: 0, label: "(0,-)", x: 250, y: 35, result: null, parentId: null, edgeLabel: "" });
  nodes.push({ id: 1, label: "(1,0)", x: 125, y: 100, result: null, parentId: 0, edgeLabel: "take 2" });
  nodes.push({ id: 2, label: "(1,-)", x: 375, y: 100, result: null, parentId: 0, edgeLabel: "skip" });
  nodes.push({ id: 3, label: "(2,1)", x: 65, y: 165, result: null, parentId: 1, edgeLabel: "take 5" });
  nodes.push({ id: 4, label: "(2,0)", x: 185, y: 165, result: null, parentId: 1, edgeLabel: "skip" });
  nodes.push({ id: 5, label: "(2,1)", x: 315, y: 165, result: null, parentId: 2, edgeLabel: "take 5" });
  nodes.push({ id: 6, label: "(2,-)", x: 435, y: 165, result: null, parentId: 2, edgeLabel: "skip" });

  visitOrder.push({ nodeId: 0, fromCache: false });
  visitOrder.push({ nodeId: 1, fromCache: false });
  visitOrder.push({ nodeId: 3, fromCache: false });
  nodes[3].result = 0;
  visitOrder.push({ nodeId: 3, fromCache: false });
  visitOrder.push({ nodeId: 4, fromCache: false });
  nodes[4].result = 1;
  visitOrder.push({ nodeId: 4, fromCache: false });
  nodes[1].result = 2;
  visitOrder.push({ nodeId: 1, fromCache: false });
  visitOrder.push({ nodeId: 2, fromCache: false });
  visitOrder.push({ nodeId: 5, fromCache: true });
  nodes[5].result = 0;
  visitOrder.push({ nodeId: 6, fromCache: false });
  nodes[6].result = 1;
  visitOrder.push({ nodeId: 6, fromCache: false });
  nodes[2].result = 1;
  visitOrder.push({ nodeId: 2, fromCache: false });
  nodes[0].result = 2;
  visitOrder.push({ nodeId: 0, fromCache: false });

  return { nodes, visitOrder };
};

const MemoPhase = ({ // skipcq: JS-0415, JS-R1005
  step,
  memoSteps,
}: {
  step: number;
  memoSteps: MemoStep[];
}) => {
  const currentStep = step > 0 && step <= memoSteps.length ? memoSteps[step - 1] : null;
  const visibleSteps = memoSteps.slice(0, step);

  const { nodes, visitOrder } = useMemo(() => buildMemoTreeData(), []);

  const visitedInfo = useMemo(() => {
    const info = new Map<number, { visited: boolean; fromCache: boolean; result: number | null }>();
    for (let i = 0; i < Math.min(step, visitOrder.length); i++) {
      const v = visitOrder[i]; // skipcq: JS-C1002
      const node = nodes.find(n => n.id === v.nodeId);
      info.set(v.nodeId, { visited: true, fromCache: v.fromCache, result: node?.result ?? null });
    }
    return info;
  }, [step, visitOrder, nodes]);

  const currentNodeId = step > 0 && step <= visitOrder.length ? visitOrder[step - 1].nodeId : null;

  const currentMemo = useMemo(() => {
    const memo: (number | null)[][] = Array.from(
      { length: treeNums.length },
      () => Array(treeNums.length + 1).fill(null)
    );
    for (const st of visibleSteps) {
      if (!st.fromCache) {
        memo[st.index][st.prevIndex + 1] = st.value;
      }
    }
    return memo;
  }, [visibleSteps]);

  const cacheHits = visibleSteps.filter(s => s.fromCache).length;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-sm text-gray-400">
        Array: [{treeNums.join(", ")}] | Yellow = cache hit (pruned subtree)
      </div>

      <div className="flex gap-6 items-start flex-wrap justify-center">
        <div>
          <div className="text-xs text-gray-500 text-center mb-2">Recursion Tree</div>
          <svg width="500" height="210" className="mx-auto">
            {nodes.map((node) => { // skipcq: JS-R1005
              if (node.parentId === null) return null;
              const parent = nodes.find(n => n.id === node.parentId);
              if (!parent) return null;

              const info = visitedInfo.get(node.id);
              const isVisited = !!info?.visited; // skipcq: JS-0066
              const isCacheHit = info?.fromCache;

              return (
                <g key={`memo-edge-${node.id}`} opacity={isVisited ? 1 : 0.2}>
                  <line
                    x1={parent.x}
                    y1={parent.y + 20}
                    x2={node.x}
                    y2={node.y - 20}
                    stroke={isCacheHit ? "#ca8a04" : "#4b5563"}
                    strokeWidth="2"
                    strokeDasharray={isCacheHit ? "5,3" : "none"}
                  />
                  <text
                    x={(parent.x + node.x) / 2}
                    y={(parent.y + node.y) / 2}
                    fill="#d1d5db"
                    fontSize="10"
                    textAnchor="middle"
                    fontWeight="500"
                  >
                    {node.edgeLabel}
                  </text>
                </g>
              );
            })}

            {nodes.map((node) => { // skipcq: JS-R1005
              const info = visitedInfo.get(node.id);
              const isVisited = !!info?.visited; // skipcq: JS-0066
              const isCacheHit = info?.fromCache;
              const isCurrent = node.id === currentNodeId;

              let fill = "#1f2937";
              let stroke = "#4b5563";
              if (isCurrent) {
                fill = isCacheHit ? "#854d0e" : "#2563eb";
                stroke = isCacheHit ? "#ca8a04" : "#60a5fa";
              } else if (isCacheHit) {
                fill = "#854d0e";
                stroke = "#ca8a04";
              } else if (isVisited && node.result !== null) {
                fill = "#166534";
                stroke = "#22c55e";
              } else if (isVisited) {
                fill = "#374151";
                stroke = "#6b7280";
              }

              return (
                <g key={`memo-node-${node.id}`} opacity={isVisited ? 1 : 0.2}>
                  <circle cx={node.x} cy={node.y} r="22" fill={fill} stroke={stroke} strokeWidth="2" />
                  <text x={node.x} y={node.y + 5} fill="white" fontSize="12" textAnchor="middle" fontFamily="monospace" fontWeight="500">
                    {node.label}
                  </text>
                  {isVisited && node.result !== null && (
                    <text x={node.x + 26} y={node.y + 5} fill={isCacheHit ? "#fde047" : "#86efac"} fontSize="11" fontWeight="bold">
                      ={node.result}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        <div>
          <div className="text-xs text-gray-500 text-center mb-2">Memo Table</div>
          <table className="border-collapse">
            <thead>
              <tr>
                <th className="w-7 h-5 text-xs text-gray-500">i\p</th>
                {Array.from({ length: treeNums.length + 1 }, (_, p) => (
                  <th key={`memo-h-${p}`} className="w-7 h-5 text-xs text-gray-500">{p - 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentMemo.map((row, rowIndex) => ( 
                <tr
                  // skipcq: JS-0437
                  key={`memo-r-${rowIndex}`}
                  >
                  <td className="w-7 h-7 text-xs text-gray-500 text-center">{rowIndex}</td>
                  {row.map((val, colIndex) => { // skipcq: JS-R1005
                    const isCurrentCell = currentStep && currentStep.index === rowIndex && currentStep.prevIndex + 1 === colIndex;
                    const isCacheHit = currentStep?.fromCache && isCurrentCell;

                    return (
                      <td
                        key={`memo-c-${rowIndex}-${colIndex}`} // skipcq: JS-0437
                        className={`w-7 h-7 border border-gray-700 text-center font-mono text-xs transition-all ${
                          isCurrentCell
                            ? isCacheHit ? "bg-yellow-600/30 border-yellow-500" : "bg-blue-600/30 border-blue-500"
                            : val !== null ? "bg-green-600/20" : "bg-gray-800/50"
                        }`}
                      >
                        {val !== null ? val : "-"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {currentStep && (
        <div className={`text-sm text-center font-mono px-4 py-2 rounded-lg ${
          currentStep.fromCache ? "bg-yellow-600/20 text-yellow-400" : "bg-blue-600/20 text-blue-300"
        }`}>
          {currentStep.action}
        </div>
      )}

      <div className="flex gap-4 text-sm">
        <div className="text-gray-400">Computed: <span className="text-green-400">{step - cacheHits}</span></div>
        <div className="text-gray-400">Cache hits: <span className="text-yellow-400">{cacheHits}</span></div>
      </div>

      {step >= memoSteps.length && step > 0 && (
        <div className="text-sm text-center bg-green-600/20 px-4 py-2 rounded-lg">
          <span className="text-green-400 font-bold">Answer: LIS length = 2</span>
          <span className="text-gray-400 ml-2">(e.g., [2, 5] or [2, 3])</span>
        </div>
      )}

      <div className="text-xs text-gray-500 text-center">
        Yellow nodes = cache hit, skips recomputing subtree. Green = freshly computed.
      </div>
    </div>
  );
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
        // skipcq: JS-0437
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

const TablePhase = ({ // skipcq: JS-R1005
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
              // skipcq: JS-0437
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
      {step >= tableSteps.length && step > 0 && (
        <div className="text-sm text-center bg-green-600/20 px-4 py-2 rounded-lg">
          <span className="text-green-400 font-bold">Answer: LIS length = {Math.max(...currentDp)}</span>
          <span className="text-gray-400 ml-2">(e.g., [2, 3, 7, 101])</span>
        </div>
      )}
      <div className="text-sm text-gray-500">
        For each i, check all j &lt; i where nums[j] &lt; nums[i]
      </div>
    </div>
  );
};

const BinaryPhase = ({ // skipcq: JS-R1005
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
                // skipcq: JS-0437
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
      {step >= binarySteps.length && step > 0 && (
        <div className="text-sm text-center bg-green-600/20 px-4 py-2 rounded-lg">
          <span className="text-green-400 font-bold">Answer: LIS length = {binarySteps[binarySteps.length - 1]?.tails.length || 0}</span>
          <span className="text-gray-400 ml-2">(e.g., [2, 3, 7, 101])</span>
        </div>
      )}
      <div className="text-sm text-gray-500 text-center max-w-md">
        O(n log n): Binary search to find position, then append or replace.
        tails.length = LIS length.
      </div>
    </div>
  );
};

// skipcq: JS-0067
export default function LISVisualizer() {
  // skipcq: JS-0067
  const phases: Phase[] = ["tree", "memo", "table", "binary"];
  const phaseLabels: Record<Phase, string> = {
    tree: "Recursion",
    memo: "Memoization",
    table: "Tabulation",
    binary: "Binary Search",
  };

  const [currentPhase, setCurrentPhase] = useState<Phase>("table");
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(600);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { steps: tableSteps, maxLen } = useMemo(() => generateTableSteps(), []);
  const { steps: binarySteps } = useMemo(() => generateBinarySteps(), []);
  const recursionSteps = useMemo(() => generateRecursionSteps(), []);
  const { steps: memoSteps } = useMemo(() => generateMemoSteps(), []);

  const getMaxSteps = useCallback(
    (phase: Phase) => {
      if (phase === "table") return tableSteps.length;
      if (phase === "binary") return binarySteps.length;
      if (phase === "tree") return recursionSteps.length;
      if (phase === "memo") return memoSteps.length;
      return nums.length;
    },
    [tableSteps.length, binarySteps.length, recursionSteps.length, memoSteps.length]
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
          {currentPhase === "tree" && (
            <TreePhase step={step} recursionSteps={recursionSteps} />
          )}
          {currentPhase === "memo" && (
            <MemoPhase step={step} memoSteps={memoSteps} />
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
