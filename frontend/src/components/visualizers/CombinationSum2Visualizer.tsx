"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TreeNode {
  id: string;
  path: number[];
  children: TreeNode[];
  depth: number;
  remaining: number;
  status: "exploring" | "found" | "pruned" | "skipped";
  skippedDuplicate?: boolean;
}

const CANDIDATES = [1, 1, 2, 4];
const TARGET = 5;

const buildCombinationSum2Tree = (): TreeNode => {
  const sorted = [...CANDIDATES].sort((a, b) => a - b);

  const root: TreeNode = {
    id: "root",
    path: [],
    children: [],
    depth: 0,
    remaining: TARGET,
    status: "exploring",
  };

  const build = (node: TreeNode, start: number) => {
    if (node.remaining === 0) {
      node.status = "found";
      return;
    }
    if (node.remaining < 0) {
      node.status = "pruned";
      return;
    }

    for (let i = start; i < sorted.length; i++) {
      // Skip duplicates at same level
      if (i > start && sorted[i] === sorted[i - 1]) {
        const skippedChild: TreeNode = {
          id: `${node.id}-skip-${i}`,
          path: [...node.path, sorted[i]],
          children: [],
          depth: node.depth + 1,
          remaining: node.remaining - sorted[i],
          status: "skipped",
          skippedDuplicate: true,
        };
        node.children.push(skippedChild);
        continue;
      }

      const newRemaining = node.remaining - sorted[i];
      const child: TreeNode = {
        id: `${node.id}-${sorted[i]}-${i}`,
        path: [...node.path, sorted[i]],
        children: [],
        depth: node.depth + 1,
        remaining: newRemaining,
        status:
          newRemaining === 0
            ? "found"
            : newRemaining < 0
              ? "pruned"
              : "exploring",
      };
      node.children.push(child);

      if (newRemaining > 0) {
        build(child, i + 1); // i+1 to prevent reuse
      }
    }
  };

  build(root, 0);
  return root;
};

const flattenTree = (node: TreeNode, order: TreeNode[] = []): TreeNode[] => {
  order.push(node);
  for (const child of node.children) {
    flattenTree(child, order);
  }
  return order;
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
        className="w-10 h-10 flex items-center justify-center bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        title="Step Forward"
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
        className="w-10 h-10 flex items-center justify-center bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:border-gray-600 transition-all ml-2"
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
        <span className="text-xs text-gray-500 uppercase tracking-wide">
          Speed
        </span>
        <div className="flex gap-1">
          {[
            { value: 1000, label: "0.5x" },
            { value: 500, label: "1x" },
            { value: 250, label: "2x" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSpeedChange(opt.value)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                speed === opt.value
                  ? "bg-orange-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-3 py-1.5">
        <span className="text-xs text-gray-500 uppercase tracking-wide">
          Step
        </span>
        <span className="text-sm font-mono text-white">
          {step + 1} <span className="text-gray-500">/</span> {total + 1}
        </span>
      </div>
    </div>
  </div>
);

// skipcq: JS-0067
export default function CombinationSum2Visualizer() {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const tree = useMemo(() => buildCombinationSum2Tree(), []);
  const nodeOrder = useMemo(() => flattenTree(tree), [tree]);
  const totalNodes = nodeOrder.length;
  const maxSteps = totalNodes - 1;

  const visibleNodes = useMemo(() => {
    return new Set(nodeOrder.slice(0, step + 1).map((n) => n.id));
  }, [nodeOrder, step]);

  const currentNode = nodeOrder[step];

  const foundCombinations = useMemo(() => {
    return nodeOrder
      .slice(0, step + 1)
      .filter((n) => n.status === "found")
      .map((n) => n.path);
  }, [nodeOrder, step]);

  const positions = useMemo(() => {
    const pos: Record<string, { x: number; y: number }> = {};
    const levelHeight = 100;
    const svgWidth = 600;

    const getSubtreeWidth = (node: TreeNode): number => {
      if (node.children.length === 0) return 80;
      return (
        node.children.reduce((sum, child) => sum + getSubtreeWidth(child), 0) +
        (node.children.length - 1) * 20
      );
    };

    const assignPositions = (
      node: TreeNode,
      leftBound: number,
      rightBound: number
    ) => {
      const x = (leftBound + rightBound) / 2;
      const y = node.depth * levelHeight + 50;
      pos[node.id] = { x, y };

      if (node.children.length === 0) return;

      const totalWidth =
        node.children.reduce((sum, child) => sum + getSubtreeWidth(child), 0) +
        (node.children.length - 1) * 20;

      let currentLeft = x - totalWidth / 2;

      for (const child of node.children) {
        const childWidth = getSubtreeWidth(child);
        assignPositions(child, currentLeft, currentLeft + childWidth);
        currentLeft += childWidth + 20;
      }
    };

    const treeWidth = getSubtreeWidth(tree);
    const startX = (svgWidth - treeWidth) / 2;
    assignPositions(tree, startX, startX + treeWidth);
    return pos;
  }, [tree]);

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

  const renderTreeNode = (
    node: TreeNode,
    parentId: string | undefined,
    visibleSet: Set<string>,
    currentId: string | undefined,
    posMap: Record<string, { x: number; y: number }>
  ): React.ReactNode => {
    const isVisible = visibleSet.has(node.id);
    const isCurrent = currentId === node.id;
    const pos = posMap[node.id];
    const parentPos = parentId ? posMap[parentId] : undefined;

    if (!pos) return null;

    const radius = 28;
    const nodeColor =
      node.status === "found"
        ? "#10B981"
        : node.status === "pruned"
          ? "#ef4444"
          : node.status === "skipped"
            ? "#f59e0b"
            : isCurrent
              ? "#f97316"
              : isVisible
                ? "#f97316"
                : "#374151";

    return (
      <g key={node.id}>
        {parentPos && isVisible && (
          <line
            x1={parentPos.x}
            y1={parentPos.y + radius}
            x2={pos.x}
            y2={pos.y - radius}
            stroke={
              node.status === "pruned" || node.status === "skipped"
                ? node.status === "skipped"
                  ? "#f59e0b"
                  : "#ef4444"
                : isCurrent
                  ? "#f97316"
                  : "#6B7280"
            }
            strokeWidth={isCurrent ? 2.5 : 1.5}
            opacity={
              isVisible
                ? node.status === "pruned" || node.status === "skipped"
                  ? 0.4
                  : 0.6
                : 0.2
            }
            strokeDasharray={
              node.status === "pruned" || node.status === "skipped"
                ? "4,4"
                : "none"
            }
          />
        )}
        {isVisible && (
          <>
            <circle
              cx={pos.x}
              cy={pos.y}
              r={radius}
              fill={nodeColor}
              stroke={
                node.status === "found"
                  ? "#34d399"
                  : node.status === "pruned"
                    ? "#f87171"
                    : node.status === "skipped"
                      ? "#fbbf24"
                      : isCurrent
                        ? "#fb923c"
                        : "#fb923c"
              }
              strokeWidth={isCurrent ? 3 : 1.5}
              opacity={
                node.status === "pruned" || node.status === "skipped" ? 0.5 : 1
              }
            />
            <text
              x={pos.x}
              y={pos.y + 5}
              textAnchor="middle"
              className="text-[11px] fill-white font-mono font-medium"
            >
              {node.path.length === 0 ? "[]" : `[${node.path.join(",")}]`}
            </text>
            <text
              x={pos.x}
              y={pos.y + radius + 14}
              textAnchor="middle"
              className="text-[10px] fill-gray-400 font-mono"
            >
              {node.status === "skipped" ? "skip" : `r=${node.remaining}`}
            </text>
          </>
        )}
        {node.children.map((child) =>
          renderTreeNode(child, node.id, visibleSet, currentId, posMap)
        )}
      </g>
    );
  };

  const getMessage = () => {
    if (step === 0)
      return `Target = ${TARGET}. Find combinations from [${CANDIDATES.join(", ")}] (sorted). No reuse, skip duplicates.`;

    const curr = currentNode;

    if (curr.status === "found") {
      return `Sum = ${TARGET}! Save [${curr.path.join(", ")}]`;
    }

    if (curr.status === "skipped") {
      return `Skip duplicate value ${curr.path[curr.path.length - 1]} at same level`;
    }

    if (curr.status === "pruned") {
      return `Sum = ${curr.path.reduce((a, b) => a + b, 0)} > ${TARGET}. Prune.`;
    }

    const sum = curr.path.reduce((a, b) => a + b, 0);
    return `[${curr.path.join(", ")}] = ${sum}, need ${curr.remaining} more`;
  };

  return (
    <div className="p-6 bg-gray-900 rounded-xl w-full max-w-4xl mx-auto">
      <div className="text-center mb-4">
        <div className="text-lg font-medium text-white">
          Combination Sum II (No Reuse + Skip Duplicates)
        </div>
        <div className="text-sm text-gray-400">
          candidates = [{CANDIDATES.join(", ")}], target = {TARGET}
        </div>
      </div>

      <div className="flex justify-center items-center gap-6 mb-6">
        <div className="flex gap-2">
          {[...CANDIDATES]
            .sort((a, b) => a - b)
            .map((num, idx) => (
              <motion.div
                key={`cand-${idx}`}
                className="w-10 h-10 rounded-lg bg-orange-600 flex items-center justify-center shadow-lg"
              >
                <span className="text-lg font-bold text-white">{num}</span>
              </motion.div>
            ))}
        </div>
        <div className="text-gray-400 text-2xl">=</div>
        <motion.div
          className="w-12 h-12 rounded-lg bg-emerald-600 flex items-center justify-center shadow-lg"
          animate={{
            boxShadow:
              foundCombinations.length > 0
                ? "0 0 20px rgba(16, 185, 129, 0.5)"
                : "none",
          }}
        >
          <span className="text-xl font-bold text-white">{TARGET}</span>
        </motion.div>
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
          key="tree"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <svg
            width="100%"
            height="400"
            viewBox="0 0 600 400"
            preserveAspectRatio="xMidYMid meet"
            className="bg-gray-800/30 rounded-lg"
          >
            {renderTreeNode(
              tree,
              undefined,
              visibleNodes,
              currentNode?.id,
              positions
            )}
          </svg>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-center gap-6 mt-4 text-sm text-gray-400">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-emerald-500 rounded-full" /> found
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-orange-500 rounded-full" /> exploring
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-amber-500 rounded-full opacity-50" />{" "}
          skipped (dup)
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-red-500 rounded-full opacity-50" /> pruned
        </span>
      </div>

      <div
        className={`text-center text-sm px-4 py-3 rounded-lg font-mono mt-4 ${
          currentNode?.status === "found"
            ? "bg-green-500/20 text-green-400"
            : currentNode?.status === "skipped"
              ? "bg-amber-500/20 text-amber-400"
              : currentNode?.status === "pruned"
                ? "bg-red-500/20 text-red-400"
                : "bg-gray-800/50 text-gray-400"
        }`}
      >
        {getMessage()}
      </div>

      <div className="mt-4 p-4 bg-gray-800/30 rounded-lg">
        <div className="text-sm text-gray-500 mb-2">
          Found Combinations ({foundCombinations.length}):
        </div>
        <div className="flex flex-wrap gap-2 min-h-[32px]">
          {foundCombinations.map((combo, idx) => (
            <motion.span
              key={`found-${idx}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-2 py-1 bg-green-600/20 border border-green-500/40 rounded text-green-400 text-sm font-mono"
            >
              [{combo.join(", ")}] = {combo.reduce((a, b) => a + b, 0)}
            </motion.span>
          ))}
        </div>
      </div>

      {step >= maxSteps && (
        <div className="text-sm text-center bg-green-600/20 px-4 py-2 rounded-lg mt-4">
          <span className="text-green-400 font-bold">
            Complete! Found {foundCombinations.length} combination(s) that sum
            to {TARGET}
          </span>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-800 text-sm text-gray-500 text-center">
        <span className="text-orange-400">Key:</span> Pass{" "}
        <code className="text-orange-400">i+1</code> (no reuse) + skip when{" "}
        <code className="text-orange-400">nums[i] == nums[i-1]</code>
      </div>
    </div>
  );
}
