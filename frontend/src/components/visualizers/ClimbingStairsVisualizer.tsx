"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TreeNode {
  id: string;
  n: number;
  result?: number;
  children: TreeNode[];
  isCacheHit?: boolean;
}

type Phase = "tree" | "memo" | "table" | "optimized";

const TARGET_N = 5;

const buildTree = (
  n: number,
  depth: number = 0,
  memo: Set<number> = new Set()
): TreeNode | null => {
  if (depth > 5) return null;

  const isCacheHit = memo.has(n);

  const node: TreeNode = {
    id: `${depth}-${n}`,
    n,
    children: [],
    isCacheHit,
  };

  if (n <= 1) {
    node.result = 1;
    return node;
  }

  if (isCacheHit) {
    return node;
  }

  memo.add(n);

  const child1 = buildTree(n - 1, depth + 1, memo);
  if (child1) node.children.push(child1);

  const child2 = buildTree(n - 2, depth + 1, memo);
  if (child2) node.children.push(child2);

  return node;
};

const flattenTree = (node: TreeNode | null, order: string[] = []): string[] => {
  if (!node) return order;
  order.push(node.id);
  for (const child of node.children) {
    flattenTree(child, order);
  }
  return order;
};

const generateTableSteps = () => {
  const steps: { i: number; value: number; formula: string }[] = [];

  steps.push({ i: 0, value: 1, formula: "dp[0] = 1 (base case)" });
  steps.push({ i: 1, value: 1, formula: "dp[1] = 1 (base case)" });

  let prev2 = 1, prev1 = 1;
  for (let i = 2; i <= TARGET_N; i++) {
    const curr = prev1 + prev2;
    steps.push({
      i,
      value: curr,
      formula: `dp[${i}] = dp[${i-1}] + dp[${i-2}] = ${prev1} + ${prev2} = ${curr}`,
    });
    prev2 = prev1;
    prev1 = curr;
  }

  return steps;
};

const generateOptimizedSteps = () => {
  const steps: { i: number; prev2: number; prev1: number; curr?: number; formula: string }[] = [];

  steps.push({ i: 0, prev2: 1, prev1: 1, formula: "prev2 = 1, prev1 = 1 (base cases)" });

  let prev2 = 1, prev1 = 1;
  for (let i = 2; i <= TARGET_N; i++) {
    const curr = prev1 + prev2;
    steps.push({
      i,
      prev2,
      prev1,
      curr,
      formula: `curr = ${prev1} + ${prev2} = ${curr}`,
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

const TreeNodeComponent = ({
  node,
  visible,
  isLatest,
  showMemo,
  x,
  y,
  parentX,
  parentY,
}: {
  node: TreeNode;
  visible: boolean;
  isLatest: boolean;
  showMemo: boolean;
  x: number;
  y: number;
  parentX?: number;
  parentY?: number;
}) => {
  if (!visible) return null;

  const isBaseCase = node.n <= 1;
  const nodeColor = node.isCacheHit && showMemo
    ? "#FCD34D"
    : isLatest
    ? "#3B82F6"
    : isBaseCase
    ? "#10B981"
    : "#4B5563";

  const radius = 24;

  return (
    <g>
      {parentX !== undefined && parentY !== undefined && (
        <line
          x1={parentX}
          y1={parentY + radius}
          x2={x}
          y2={y - radius}
          stroke="#6B7280"
          strokeWidth={2}
          opacity={0.4}
        />
      )}
      <circle
        cx={x}
        cy={y}
        r={radius}
        fill={nodeColor}
        stroke={isLatest ? "#60A5FA" : "#6B7280"}
        strokeWidth={isLatest ? 3 : 1.5}
      />
      <text x={x} y={y + 5} textAnchor="middle" className="text-sm fill-white font-mono font-medium">
        f({node.n})
      </text>
      {isBaseCase && (
        <text x={x} y={y + radius + 14} textAnchor="middle" className="text-xs fill-green-400 font-medium">
          = 1
        </text>
      )}
      {node.isCacheHit && showMemo && (
        <text x={x} y={y + radius + 14} textAnchor="middle" className="text-xs fill-yellow-400 font-medium">
          cached
        </text>
      )}
    </g>
  );
};

const TreePhase = ({ step, showMemo }: { step: number; showMemo: boolean }) => {
  const tree = useMemo(() => buildTree(TARGET_N), []);
  const nodeOrder = useMemo(() => (tree ? flattenTree(tree) : []), [tree]);
  const visibleNodes = new Set(nodeOrder.slice(0, step + 1));

  const positions = useMemo(() => {
    const pos: Record<string, { x: number; y: number }> = {};
    const nodeWidth = 70;
    const nodeGap = 25;
    const levelHeight = 80;
    const svgWidth = 700;

    const getSubtreeWidth = (node: TreeNode | null): number => {
      if (!node) return 0;
      if (node.children.length === 0) return nodeWidth;
      return node.children.reduce((sum, child) => sum + getSubtreeWidth(child), 0) + (node.children.length - 1) * nodeGap;
    };

    const assignPositions = (node: TreeNode | null, depth: number, leftBound: number, rightBound: number) => {
      if (!node) return;

      const x = (leftBound + rightBound) / 2;
      const y = depth * levelHeight + 35;
      pos[node.id] = { x, y };

      if (node.children.length === 0) return;

      const totalChildWidth = node.children.reduce((sum, child) => sum + getSubtreeWidth(child), 0);
      const gaps = (node.children.length - 1) * nodeGap;
      const totalWidth = totalChildWidth + gaps;

      let currentLeft = x - totalWidth / 2;

      for (const child of node.children) {
        const childWidth = getSubtreeWidth(child);
        const childRight = currentLeft + childWidth;
        assignPositions(child, depth + 1, currentLeft, childRight);
        currentLeft = childRight + nodeGap;
      }
    };

    if (tree) {
      const treeWidth = getSubtreeWidth(tree);
      const startX = (svgWidth - treeWidth) / 2;
      assignPositions(tree, 0, startX, startX + treeWidth);
    }
    return pos;
  }, [tree]);

  const renderTree = (node: TreeNode | null, parentId?: string): React.ReactNode => {
    if (!node) return null;

    const isVisible = visibleNodes.has(node.id);
    const isLatest = nodeOrder[step] === node.id;
    const pos = positions[node.id];
    const parentPos = parentId ? positions[parentId] : undefined;

    return (
      <g key={node.id}>
        <TreeNodeComponent
          node={node}
          visible={isVisible}
          isLatest={isLatest}
          showMemo={showMemo}
          x={pos?.x || 0}
          y={pos?.y || 0}
          parentX={parentPos?.x}
          parentY={parentPos?.y}
        />
        {node.children.map((child) => renderTree(child, node.id))}
      </g>
    );
  };

  const currentNode = nodeOrder[step];
  const currentN = currentNode ? parseInt(currentNode.split("-")[1]) : TARGET_N;

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width="100%" height="420" viewBox="0 0 700 420" preserveAspectRatio="xMidYMid meet" className="bg-gray-800/30 rounded-lg">
        {tree && renderTree(tree)}
      </svg>

      <div className="flex gap-6 mt-4 text-sm text-gray-400">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-green-500 rounded-full" /> base case
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-blue-500 rounded-full" /> current
        </span>
        {showMemo && (
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 bg-yellow-400 rounded-full" /> cached
          </span>
        )}
      </div>

      <div className="text-center text-sm text-gray-400 bg-gray-800/50 px-4 py-2 rounded-lg font-mono">
        {currentN <= 1
          ? `f(${currentN}) = 1 (base case)`
          : `f(${currentN}) = f(${currentN - 1}) + f(${currentN - 2})`
        }
      </div>
    </div>
  );
};

const TablePhase = ({ step, tableSteps }: { step: number; tableSteps: ReturnType<typeof generateTableSteps> }) => {
  const currentDp = useMemo(() => {
    const dp: (number | null)[] = Array(TARGET_N + 1).fill(null);
    for (let s = 0; s < Math.min(step, tableSteps.length); s++) {
      const { i, value } = tableSteps[s];
      dp[i] = value;
    }
    return dp;
  }, [step, tableSteps]);

  const currentStep = step > 0 && step <= tableSteps.length ? tableSteps[step - 1] : null;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <div className="text-sm text-gray-500 mb-3">dp[] array</div>
        <div className="flex gap-2 justify-center">
          {Array.from({ length: TARGET_N + 1 }, (_, i) => {
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
        Building bottom-up: fill dp[0], dp[1], then dp[2] to dp[{TARGET_N}]
      </div>
    </div>
  );
};

const OptimizedPhase = ({ step, optimizedSteps }: { step: number; optimizedSteps: ReturnType<typeof generateOptimizedSteps> }) => {
  const currentStep = step > 0 && step <= optimizedSteps.length ? optimizedSteps[step - 1] : null;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <div className="text-sm text-gray-500 mb-4">Only 2 variables needed</div>
        <div className="flex gap-8 justify-center">
          <div className="flex flex-col items-center">
            <div className="text-xs text-gray-500 mb-2">prev2</div>
            <div className="w-16 h-16 flex items-center justify-center bg-purple-600/30 border-2 border-purple-500 rounded-lg text-xl font-mono text-purple-300">
              {currentStep ? currentStep.prev2 : 1}
            </div>
            <div className="text-xs text-gray-500 mt-1">dp[i-2]</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-xs text-gray-500 mb-2">prev1</div>
            <div className="w-16 h-16 flex items-center justify-center bg-blue-600/30 border-2 border-blue-500 rounded-lg text-xl font-mono text-blue-300">
              {currentStep ? currentStep.prev1 : 1}
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
          {currentStep.i > 1 ? `i = ${currentStep.i}: ` : ""}{currentStep.formula}
        </div>
      )}

      <div className="text-sm text-gray-500 text-center max-w-md">
        Space O(1): Instead of storing all values, just keep track of the last two.
        After each step, slide the window: prev2 = prev1, prev1 = curr.
      </div>
    </div>
  );
};

export default function ClimbingStairsVisualizer() {
  const phases: Phase[] = ["tree", "memo", "table", "optimized"];
  const phaseLabels: Record<Phase, string> = {
    tree: "Recursion",
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
  const tree = useMemo(() => buildTree(TARGET_N), []);
  const treeNodeCount = useMemo(() => (tree ? flattenTree(tree).length : 0), [tree]);

  const getMaxSteps = useCallback(
    (phase: Phase) => {
      if (phase === "table") return tableSteps.length;
      if (phase === "optimized") return optimizedSteps.length;
      return treeNodeCount - 1;
    },
    [tableSteps.length, optimizedSteps.length, treeNodeCount]
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
        <div className="text-lg font-medium text-white">Climbing Stairs</div>
        <div className="text-sm text-gray-400">
          How many ways to reach step {TARGET_N}? (can take 1 or 2 steps)
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
        f(n) = f(n-1) + f(n-2) | f(0) = 1, f(1) = 1 | Answer: f({TARGET_N}) = 8
      </div>
    </div>
  );
}
