"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TreeNode {
  id: string;
  path: number[];
  children: TreeNode[];
  depth: number;
  skipped: boolean;
  skipReason?: string;
}

const NUMS = [1, 2, 2]; // Already sorted

const buildSubsetsIITree = (): TreeNode => {
  const root: TreeNode = {
    id: "root",
    path: [],
    children: [],
    depth: 0,
    skipped: false,
  };

  const build = (node: TreeNode, start: number) => {
    for (let i = start; i < NUMS.length; i++) {
      // Check if this would be skipped
      const shouldSkip = i > start && NUMS[i] === NUMS[i - 1];

      const child: TreeNode = {
        id: `${node.id}-${i}`,
        path: [...node.path, NUMS[i]],
        children: [],
        depth: node.depth + 1,
        skipped: shouldSkip,
        skipReason: shouldSkip
          ? `i=${i} > start=${start} && nums[${i}]==${NUMS[i]} == nums[${i - 1}]`
          : undefined,
      };
      node.children.push(child);

      if (!shouldSkip) {
        build(child, i + 1);
      }
    }
  };

  build(root, 0);
  return root;
};

const flattenTree = (
  node: TreeNode,
  order: TreeNode[] = [],
  includeSkipped = true
): TreeNode[] => {
  order.push(node);
  for (const child of node.children) {
    if (includeSkipped || !child.skipped) {
      flattenTree(child, order, includeSkipped);
    }
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
                  ? "bg-rose-600 text-white"
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
export default function SubsetsIIVisualizer() {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const tree = useMemo(() => buildSubsetsIITree(), []);
  // Include skipped nodes in the order to show them being skipped
  const nodeOrder = useMemo(() => flattenTree(tree, [], true), [tree]);
  const totalNodes = nodeOrder.length;
  const maxSteps = totalNodes - 1;

  const visibleNodes = useMemo(() => {
    return new Set(nodeOrder.slice(0, step + 1).map((n) => n.id));
  }, [nodeOrder, step]);

  const currentNode = nodeOrder[step];

  // Count saved subsets (non-skipped nodes)
  const savedSubsets = useMemo(() => {
    return nodeOrder
      .slice(0, step + 1)
      .filter((n) => !n.skipped)
      .map((n) => n.path);
  }, [nodeOrder, step]);

  // Tree positions
  const positions = useMemo(() => {
    const pos: Record<string, { x: number; y: number }> = {};
    const levelHeight = 80;
    const svgWidth = 500;

    const getSubtreeWidth = (node: TreeNode): number => {
      if (node.children.length === 0) return 70;
      return (
        node.children.reduce((sum, child) => sum + getSubtreeWidth(child), 0) +
        (node.children.length - 1) * 15
      );
    };

    const assignPositions = (
      node: TreeNode,
      leftBound: number,
      rightBound: number
    ) => {
      const x = (leftBound + rightBound) / 2;
      const y = node.depth * levelHeight + 40;
      pos[node.id] = { x, y };

      if (node.children.length === 0) return;

      const totalWidth =
        node.children.reduce((sum, child) => sum + getSubtreeWidth(child), 0) +
        (node.children.length - 1) * 15;

      let currentLeft = x - totalWidth / 2;

      for (const child of node.children) {
        const childWidth = getSubtreeWidth(child);
        assignPositions(child, currentLeft, currentLeft + childWidth);
        currentLeft += childWidth + 15;
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

    const radius = 24;
    const nodeColor = node.skipped
      ? "#ef4444"
      : isCurrent
        ? "#f43f5e"
        : isVisible
          ? "#10B981"
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
              node.skipped ? "#ef4444" : isCurrent ? "#f43f5e" : "#6B7280"
            }
            strokeWidth={isCurrent ? 2.5 : 1.5}
            opacity={isVisible ? (node.skipped ? 0.4 : 0.6) : 0.2}
            strokeDasharray={node.skipped ? "4,4" : "none"}
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
                node.skipped ? "#f87171" : isCurrent ? "#fb7185" : "#34d399"
              }
              strokeWidth={isCurrent ? 3 : 1.5}
              opacity={node.skipped ? 0.5 : 1}
            />
            {node.skipped && (
              <line
                x1={pos.x - 12}
                y1={pos.y - 12}
                x2={pos.x + 12}
                y2={pos.y + 12}
                stroke="#fff"
                strokeWidth={2}
              />
            )}
            <text
              x={pos.x}
              y={pos.y + 4}
              textAnchor="middle"
              className="text-xs fill-white font-mono font-medium"
              opacity={node.skipped ? 0.7 : 1}
            >
              {node.path.length === 0 ? "[]" : `[${node.path.join(",")}]`}
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
      return `Start with sorted array [${NUMS.join(", ")}]. Save []`;

    const curr = currentNode;

    if (curr.skipped) {
      return `SKIP [${curr.path.join(", ")}]: duplicate at same level`;
    }

    if (step >= maxSteps) {
      return `Done! Found ${savedSubsets.length} unique subsets`;
    }

    return `Save [${curr.path.join(", ")}]`;
  };

  return (
    <div className="p-6 bg-gray-900 rounded-xl w-full max-w-4xl mx-auto">
      <div className="text-center mb-4">
        <div className="text-lg font-medium text-white">
          Subsets II: Handling Duplicates
        </div>
        <div className="text-sm text-gray-400">
          Input: [{NUMS.join(", ")}] (sorted) — Skip duplicate branches
        </div>
      </div>

      {/* Input array display */}
      <div className="flex justify-center gap-3 mb-6">
        {NUMS.map((num, idx) => {
          const isInPath = currentNode?.path.includes(num);
          const isDuplicate = idx > 0 && NUMS[idx] === NUMS[idx - 1];
          return (
            <motion.div
              key={idx}
              animate={{
                scale: isInPath ? 1.1 : 1,
                backgroundColor: isInPath ? "#f43f5e" : "#374151",
              }}
              className="w-14 h-14 rounded-lg flex flex-col items-center justify-center shadow-lg relative"
              style={{
                boxShadow: isInPath
                  ? "0 0 20px rgba(244, 63, 94, 0.4)"
                  : "none",
              }}
            >
              <span className="text-lg font-bold text-white">{num}</span>
              <span className="text-xs text-gray-400">idx {idx}</span>
              {isDuplicate && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full text-[10px] flex items-center justify-center text-black font-bold">
                  !
                </span>
              )}
            </motion.div>
          );
        })}
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

      {/* Tree visualization */}
      <AnimatePresence mode="wait">
        <motion.div
          key="tree"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <svg
            width="100%"
            height="320"
            viewBox="0 0 500 320"
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

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4 text-sm text-gray-400">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-rose-500 rounded-full" /> current
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-green-500 rounded-full" /> saved
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-red-500 rounded-full opacity-50" />{" "}
          skipped
        </span>
      </div>

      {/* Message */}
      <div
        className={`text-center text-sm px-4 py-3 rounded-lg font-mono mt-4 ${
          currentNode?.skipped
            ? "bg-red-500/20 text-red-400"
            : "bg-gray-800/50 text-gray-400"
        }`}
      >
        {getMessage()}
      </div>

      {/* Saved subsets */}
      <div className="mt-4 p-4 bg-gray-800/30 rounded-lg">
        <div className="text-sm text-gray-500 mb-2">
          Unique Subsets ({savedSubsets.length} / 6):
        </div>
        <div className="flex flex-wrap gap-2 min-h-[32px]">
          {savedSubsets.map((subset, idx) => (
            <motion.span
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-2 py-1 bg-green-600/20 border border-green-500/40 rounded text-green-400 text-sm font-mono"
            >
              [{subset.length === 0 ? "" : subset.join(", ")}]
            </motion.span>
          ))}
        </div>
      </div>

      {/* Done message */}
      {step >= maxSteps && (
        <div className="text-sm text-center bg-green-600/20 px-4 py-2 rounded-lg mt-4">
          <span className="text-green-400 font-bold">
            Complete! Found 6 unique subsets (skipped 2 duplicates)
          </span>
        </div>
      )}

      {/* Key insight */}
      <div className="mt-4 pt-4 border-t border-gray-800 text-sm text-gray-500 text-center">
        <span className="text-rose-400">Key:</span> Sort first, then skip when{" "}
        <code className="text-rose-400">
          i &gt; start && nums[i] == nums[i-1]
        </code>
      </div>
    </div>
  );
}
