"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Item {
  name: string;
  weight: number;
  value: number;
}

interface TreeNode {
  id: string;
  index: number;
  capacity: number;
  choice?: "take" | "skip";
  result?: number;
  children: TreeNode[];
  isCacheHit?: boolean;
}

type Phase = "tree" | "memo" | "table";

const items: Item[] = [
  { name: "A", weight: 1, value: 1 },
  { name: "B", weight: 3, value: 4 },
  { name: "C", weight: 4, value: 5 },
];

const capacity = 7;

const buildTree = (
  index: number,
  cap: number,
  depth = 0,
  memo: Set<string> = new Set()
): TreeNode | null => {
  if (depth > 3) return null;

  const key = `${index},${cap}`;
  const isCacheHit = memo.has(key);

  const node: TreeNode = {
    id: key,
    index,
    capacity: cap,
    children: [],
    isCacheHit,
  };

  if (index < 0 || cap === 0) {
    node.result = 0;
    return node;
  }

  if (isCacheHit) return node;

  memo.add(key);

  const skipChild = buildTree(index - 1, cap, depth + 1, memo);
  if (skipChild) {
    skipChild.choice = "skip";
    node.children.push(skipChild);
  }

  if (items[index]?.weight <= cap) {
    const takeChild = buildTree(index - 1, cap - items[index].weight, depth + 1, memo);
    if (takeChild) {
      takeChild.choice = "take";
      node.children.push(takeChild);
    }
  }

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
  const steps: { i: number; w: number; value: number; explanation: string }[] = [];
  const dp: number[][] = Array(items.length + 1).fill(null).map(() => Array(capacity + 1).fill(0));

  for (let i = 1; i <= items.length; i++) {
    for (let w = 0; w <= capacity; w++) {
      const item = items[i - 1];
      const skip = dp[i - 1][w];
      let take = 0;

      if (item.weight <= w) {
        take = dp[i - 1][w - item.weight] + item.value;
      }

      dp[i][w] = Math.max(skip, take);
      const best = take > skip ? "take" : "skip";
      steps.push({
        i,
        w,
        value: dp[i][w],
        explanation: `${best}: max(${skip}, ${take}) = ${dp[i][w]}`,
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

  const nodeColor = node.isCacheHit && showMemo
    ? "#FCD34D"
    : isLatest
    ? "#3B82F6"
    : "#4B5563";

  return (
    <g>
      {parentX !== undefined && parentY !== undefined && (
        <line
          x1={parentX}
          y1={parentY + 20}
          x2={x}
          y2={y - 20}
          stroke={node.choice === "take" ? "#10B981" : "#EF4444"}
          strokeWidth={2}
          opacity={0.7}
        />
      )}
      <circle
        cx={x}
        cy={y}
        r={24}
        fill={nodeColor}
        stroke={isLatest ? "#60A5FA" : "#6B7280"}
        strokeWidth={isLatest ? 3 : 1.5}
      />
      <text x={x} y={y + 5} textAnchor="middle" className="text-sm fill-white font-mono font-medium">
        {node.index},{node.capacity}
      </text>
      {node.isCacheHit && showMemo && (
        <text x={x} y={y + 38} textAnchor="middle" className="text-xs fill-yellow-400 font-medium">
          cached
        </text>
      )}
    </g>
  );
};

const TreePhase = ({ step, showMemo }: { step: number; showMemo: boolean }) => {
  const tree = useMemo(() => buildTree(items.length - 1, capacity), []);
  const nodeOrder = useMemo(() => (tree ? flattenTree(tree) : []), [tree]);
  const visibleNodes = new Set(nodeOrder.slice(0, step + 1));

  const positions = useMemo(() => {
    const pos: Record<string, { x: number; y: number }> = {};
    const levelWidth = [1, 2, 4, 8];
    const levelCounts: Record<number, number> = {};

    const assignPositions = (node: TreeNode | null, depth: number) => {
      if (!node || depth > 3) return;

      levelCounts[depth] = (levelCounts[depth] || 0) + 1;
      const count = levelCounts[depth];
      const width = 680;
      const spacing = width / (levelWidth[depth] + 1);
      const x = spacing * count + (width - spacing * levelWidth[depth]) / 2 - spacing / 2;
      const y = depth * 90 + 40;

      pos[node.id] = { x, y };

      for (const child of node.children) {
        assignPositions(child, depth + 1);
      }
    };

    if (tree) assignPositions(tree, 0);
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

  return (
    <div className="flex flex-col items-center">
      <svg width="100%" height="400" viewBox="0 0 700 400" className="bg-gray-800/30 rounded-lg">
        {tree && renderTree(tree)}
      </svg>
      <div className="flex gap-6 mt-4 text-sm text-gray-400">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-green-500 rounded-full" /> take
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-red-500 rounded-full" /> skip
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

  const currentStep = step > 0 ? tableSteps[step - 1] : null;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="overflow-x-auto w-full flex justify-center">
        <table className="border-collapse text-base">
          <thead>
            <tr>
              <th className="p-3 text-gray-500 w-16 text-center font-medium">Item</th>
              {Array.from({ length: capacity + 1 }, (_, w) => (
                <th key={w} className="p-3 text-gray-400 w-14 text-center font-medium">{w}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: items.length + 1 }, (_, i) => (
              <tr key={i}>
                <td className="p-3 text-gray-400 text-center font-medium">
                  {i === 0 ? "-" : items[i - 1].name}
                </td>
                {Array.from({ length: capacity + 1 }, (_, w) => {
                  const isCurrent = currentStep && currentStep.i === i && currentStep.w === w;
                  const value = currentDp[i][w];

                  return (
                    <td
                      key={w}
                      className={`p-3 text-center border-2 w-14 h-14 transition-colors ${
                        isCurrent
                          ? "bg-blue-600 border-blue-400"
                          : value !== null
                          ? "bg-gray-800 border-gray-600"
                          : "bg-gray-900/50 border-gray-700"
                      }`}
                    >
                      {value !== null && (
                        <span className={`font-mono text-lg ${isCurrent ? "text-white font-bold" : "text-gray-300"}`}>
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
        <div className="text-base text-gray-400 text-center font-mono bg-gray-800/50 px-6 py-3 rounded-lg">
          dp[{currentStep.i}][{currentStep.w}] = {currentStep.explanation}
        </div>
      )}
    </div>
  );
};

export default function DPJourneyVisualizer() { // skipcq: JS-0067
  const phases: Phase[] = ["tree", "memo", "table"];
  const phaseLabels: Record<Phase, string> = {
    tree: "Recursion Tree",
    memo: "With Memoization",
    table: "DP Table",
  };

  const [currentPhase, setCurrentPhase] = useState<Phase>("tree");
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(600);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const tableSteps = useMemo(() => generateTableSteps(), []);
  const tree = useMemo(() => buildTree(items.length - 1, capacity), []);
  const treeNodeCount = useMemo(() => (tree ? flattenTree(tree).length : 0), [tree]);

  const getMaxSteps = useCallback(
    (phase: Phase) => {
      if (phase === "table") return tableSteps.length;
      return treeNodeCount - 1;
    },
    [tableSteps.length, treeNodeCount]
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
      <div className="flex justify-center mb-6">
        <div className="inline-flex bg-gray-800/50 p-1 rounded-xl">
          {phases.map((phase, index) => (
            <button
              key={phase}
              onClick={() => goToPhase(phase)}
              className={`relative px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
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
          {currentPhase === "memo" && <TreePhase step={step} showMemo />}
          {currentPhase === "table" && <TablePhase step={step} tableSteps={tableSteps} />}
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 pt-4 border-t border-gray-800 text-sm text-gray-500 text-center">
        Items: A(1kg, $1), B(3kg, $4), C(4kg, $5) | Capacity: 7kg
      </div>
    </div>
  );
}
