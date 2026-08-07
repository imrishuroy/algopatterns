"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TreeNode {
  id: string;
  path: string;
  children: TreeNode[];
  depth: number;
  letter: string;
}

const DIGITS = "23";
const MAPPING: Record<string, string> = {
  "2": "abc",
  "3": "def",
  "4": "ghi",
  "5": "jkl",
  "6": "mno",
  "7": "pqrs",
  "8": "tuv",
  "9": "wxyz",
};

const buildPhoneTree = (digits: string): TreeNode => {
  const root: TreeNode = {
    id: "root",
    path: "",
    children: [],
    depth: 0,
    letter: "",
  };

  const build = (node: TreeNode, index: number) => {
    if (index >= digits.length) return;

    const letters = MAPPING[digits[index]];

    for (const letter of letters) {
      const child: TreeNode = {
        id: `${node.id}-${letter}`,
        path: node.path + letter,
        children: [],
        depth: node.depth + 1,
        letter,
      };
      node.children.push(child);
      build(child, index + 1);
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
                  ? "bg-amber-600 text-white"
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
export default function PhoneLetterVisualizer() {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const tree = useMemo(() => buildPhoneTree(DIGITS), []);
  const nodeOrder = useMemo(() => flattenTree(tree), [tree]);
  const totalNodes = nodeOrder.length;
  const maxSteps = totalNodes - 1;

  const visibleNodes = useMemo(() => {
    return new Set(nodeOrder.slice(0, step + 1).map((n) => n.id));
  }, [nodeOrder, step]);

  const currentNode = nodeOrder[step];

  // Only count complete combinations (depth === digits.length)
  const completeCombinations = useMemo(() => {
    return nodeOrder
      .slice(0, step + 1)
      .filter((n) => n.depth === DIGITS.length)
      .map((n) => n.path);
  }, [nodeOrder, step]);

  const totalCombinations = useMemo(() => {
    return DIGITS.split("").reduce((acc, d) => acc * MAPPING[d].length, 1);
  }, []);

  // Tree positions
  const positions = useMemo(() => {
    const pos: Record<string, { x: number; y: number }> = {};
    const levelHeight = 90;
    const svgWidth = 600;

    const getSubtreeWidth = (node: TreeNode): number => {
      if (node.children.length === 0) return 55;
      return (
        node.children.reduce((sum, child) => sum + getSubtreeWidth(child), 0) +
        (node.children.length - 1) * 10
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
        (node.children.length - 1) * 10;

      let currentLeft = x - totalWidth / 2;

      for (const child of node.children) {
        const childWidth = getSubtreeWidth(child);
        assignPositions(child, currentLeft, currentLeft + childWidth);
        currentLeft += childWidth + 10;
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
    const isComplete = node.depth === DIGITS.length;
    const pos = posMap[node.id];
    const parentPos = parentId ? posMap[parentId] : undefined;

    if (!pos) return null;

    const radius = 22;
    const nodeColor = isCurrent
      ? "#f59e0b"
      : isComplete && isVisible
        ? "#10B981"
        : isVisible
          ? "#8b5cf6"
          : "#374151";

    return (
      <g key={node.id}>
        {parentPos && isVisible && (
          <line
            x1={parentPos.x}
            y1={parentPos.y + radius}
            x2={pos.x}
            y2={pos.y - radius}
            stroke={isCurrent ? "#f59e0b" : "#6B7280"}
            strokeWidth={isCurrent ? 2.5 : 1.5}
            opacity={isVisible ? 0.6 : 0.2}
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
                isCurrent ? "#fbbf24" : isComplete ? "#34d399" : "#6B7280"
              }
              strokeWidth={isCurrent ? 3 : 1.5}
            />
            <text
              x={pos.x}
              y={pos.y + 5}
              textAnchor="middle"
              className="text-sm fill-white font-mono font-bold"
            >
              {node.path || '""'}
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
      return `Start with digits "${DIGITS}": build all letter combinations`;

    const curr = currentNode;
    const prev = nodeOrder[step - 1];
    const isComplete = curr.depth === DIGITS.length;

    if (isComplete) {
      return `Complete! Save "${curr.path}"`;
    }

    if (step >= maxSteps) {
      return `Done! Found all ${completeCombinations.length} combinations`;
    }

    const digit = DIGITS[curr.depth - 1];

    if (curr.depth > prev.depth) {
      return `Digit '${digit}' → Choose '${curr.letter}' → path = "${curr.path}"`;
    } else {
      return `Backtrack → Digit '${digit}' → Choose '${curr.letter}' → path = "${curr.path}"`;
    }
  };

  return (
    <div className="p-6 bg-gray-900 rounded-xl w-full max-w-4xl mx-auto">
      <div className="text-center mb-4">
        <div className="text-lg font-medium text-white">
          Phone Letter Combinations
        </div>
        <div className="text-sm text-gray-400">
          Digits &quot;{DIGITS}&quot; → {totalCombinations} combinations
        </div>
      </div>

      {/* Phone keypad display */}
      <div className="flex justify-center gap-4 mb-6">
        {DIGITS.split("").map((digit, idx) => {
          const isProcessed = currentNode && currentNode.depth > idx;
          const isCurrent = currentNode && currentNode.depth === idx + 1;
          return (
            <motion.div
              key={idx}
              animate={{
                scale: isCurrent ? 1.1 : 1,
                backgroundColor: isCurrent
                  ? "#f59e0b"
                  : isProcessed
                    ? "#10B981"
                    : "#374151",
              }}
              className="w-16 h-20 rounded-lg flex flex-col items-center justify-center shadow-lg"
              style={{
                boxShadow: isCurrent
                  ? "0 0 20px rgba(245, 158, 11, 0.4)"
                  : "none",
              }}
            >
              <span className="text-2xl font-bold text-white">{digit}</span>
              <span className="text-xs text-gray-300 font-mono">
                {MAPPING[digit]}
              </span>
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
            height="300"
            viewBox="0 0 600 300"
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
          <span className="w-3 h-3 bg-amber-500 rounded-full" /> current
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-violet-500 rounded-full" /> exploring
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-green-500 rounded-full" /> complete
        </span>
      </div>

      {/* Message */}
      <div className="text-center text-sm text-gray-400 bg-gray-800/50 px-4 py-3 rounded-lg font-mono mt-4">
        {getMessage()}
      </div>

      {/* Complete combinations */}
      <div className="mt-4 p-4 bg-gray-800/30 rounded-lg">
        <div className="text-sm text-gray-500 mb-2">
          Complete Combinations ({completeCombinations.length} /{" "}
          {totalCombinations}):
        </div>
        <div className="flex flex-wrap gap-2 min-h-[32px]">
          {completeCombinations.map((combo, idx) => (
            <motion.span
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-2 py-1 bg-green-600/20 border border-green-500/40 rounded text-green-400 text-sm font-mono"
            >
              &quot;{combo}&quot;
            </motion.span>
          ))}
        </div>
      </div>

      {/* Done message */}
      {step >= maxSteps && (
        <div className="text-sm text-center bg-green-600/20 px-4 py-2 rounded-lg mt-4">
          <span className="text-green-400 font-bold">
            Complete! Found all {totalCombinations} letter combinations
          </span>
        </div>
      )}

      {/* Key insight */}
      <div className="mt-4 pt-4 border-t border-gray-800 text-sm text-gray-500 text-center">
        <span className="text-amber-400">Key:</span> Each digit has different
        letters. Use <code className="text-amber-400">index</code> to track
        which digit we&apos;re processing.
      </div>
    </div>
  );
}
