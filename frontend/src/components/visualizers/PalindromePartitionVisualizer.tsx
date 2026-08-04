"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TreeNode {
  id: string;
  start: number;
  partition: string[];
  children: TreeNode[];
  depth: number;
  isComplete: boolean;
  isPruned: boolean;
  substring: string;
}

const INPUT_STRING = "aab";

const isPalindrome = (s: string, lo: number, hi: number): boolean => {
  while (lo < hi) {
    if (s[lo] !== s[hi]) return false;
    lo++;
    hi--;
  }
  return true;
};

const buildPartitionTree = (): TreeNode => {
  const s = INPUT_STRING;
  const root: TreeNode = {
    id: "root",
    start: 0,
    partition: [],
    children: [],
    depth: 0,
    isComplete: false,
    isPruned: false,
    substring: "",
  };

  const build = (node: TreeNode) => {
    if (node.start === s.length) {
      node.isComplete = true;
      return;
    }

    for (let end = node.start; end < s.length; end++) {
      const substr = s.slice(node.start, end + 1);
      const isPalin = isPalindrome(s, node.start, end);

      const child: TreeNode = {
        id: `${node.id}-${node.start}-${end}`,
        start: end + 1,
        partition: [...node.partition, substr],
        children: [],
        depth: node.depth + 1,
        isComplete: false,
        isPruned: !isPalin,
        substring: substr,
      };
      node.children.push(child);

      if (isPalin) {
        build(child);
      }
    }
  };

  build(root);
  return root;
};

const flattenTree = (node: TreeNode, order: TreeNode[] = []): TreeNode[] => {
  order.push(node);
  for (const child of node.children) {
    if (!child.isPruned) {
      flattenTree(child, order);
    }
  }
  for (const child of node.children) {
    if (child.isPruned) {
      order.push(child);
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
        <span className="text-xs text-gray-500 uppercase tracking-wide">Step</span>
        <span className="text-sm font-mono text-white">
          {step + 1} <span className="text-gray-500">/</span> {total + 1}
        </span>
      </div>
    </div>
  </div>
);

// Card-based node component for clearer display
const NodeCard = ({
  node,
  isCurrent,
  isVisible,
}: {
  node: TreeNode;
  isCurrent: boolean;
  isVisible: boolean;
}) => {
  if (!isVisible) return null;

  const getBgColor = () => {
    if (node.isPruned) return "bg-red-900/60 border-red-500/50";
    if (isCurrent) return "bg-amber-900/60 border-amber-500";
    if (node.isComplete) return "bg-green-900/60 border-green-500/50";
    return "bg-violet-900/60 border-violet-500/50";
  };

  const getLabel = () => {
    if (node.partition.length === 0) return `"${INPUT_STRING}"`;
    return node.partition.map((p) => `"${p}"`).join(", ");
  };

  const getStatus = () => {
    if (node.isComplete) return "Valid partition!";
    if (node.isPruned) return `"${node.substring}" not palindrome`;
    return `start index: ${node.start}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-xl border-2 px-4 py-3 min-w-[120px] text-center ${getBgColor()} ${isCurrent ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-gray-900" : ""}`}
    >
      <div className="text-base font-mono font-bold text-white mb-1">
        [{getLabel()}]
      </div>
      <div className={`text-xs ${node.isPruned ? "text-red-300" : node.isComplete ? "text-green-300" : "text-gray-400"}`}>
        {getStatus()}
      </div>
    </motion.div>
  );
};

// skipcq: JS-0067
export default function PalindromePartitionVisualizer() {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const tree = useMemo(() => buildPartitionTree(), []);
  const nodeOrder = useMemo(() => flattenTree(tree), [tree]);
  const maxSteps = nodeOrder.length - 1;

  const visibleNodes = useMemo(() => {
    return new Set(nodeOrder.slice(0, step + 1).map((n) => n.id));
  }, [nodeOrder, step]);

  const currentNode = nodeOrder[step];

  const completeResults = useMemo(() => {
    return nodeOrder
      .slice(0, step + 1)
      .filter((n) => n.isComplete)
      .map((n) => n.partition);
  }, [nodeOrder, step]);

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

  // Group nodes by depth for horizontal layout
  const nodesByDepth = useMemo(() => {
    const groups: Map<number, TreeNode[]> = new Map();
    for (const node of nodeOrder) {
      if (!groups.has(node.depth)) {
        groups.set(node.depth, []);
      }
      groups.get(node.depth)!.push(node);
    }
    return groups;
  }, [nodeOrder]);

  const getMessage = () => {
    if (step === 0) return `Start: Partition "${INPUT_STRING}" into palindromes`;

    const curr = currentNode;

    if (curr.isPruned) {
      return `"${curr.substring}" is NOT a palindrome - PRUNE this branch`;
    }

    if (curr.isComplete) {
      return `Complete partition found: [${curr.partition.map((p) => `"${p}"`).join(", ")}]`;
    }

    if (step >= maxSteps) {
      return `Done! Found ${completeResults.length} valid partitions`;
    }

    return `Try taking "${curr.substring}" (palindrome) → partition so far: [${curr.partition.map((p) => `"${p}"`).join(", ")}]`;
  };

  // Render tree using cards with connecting lines
  const renderLevel = (depth: number) => {
    const nodes = nodesByDepth.get(depth) || [];
    return (
      <div key={depth} className="flex justify-center gap-4 flex-wrap">
        {nodes.map((node) => (
          <div key={node.id} className="flex flex-col items-center">
            {/* Edge label */}
            {node.substring && visibleNodes.has(node.id) && (
              <div className={`text-sm font-mono mb-2 px-2 py-0.5 rounded ${node.isPruned ? "text-red-400 bg-red-900/30" : "text-amber-400 bg-amber-900/30"}`}>
                take &quot;{node.substring}&quot;
              </div>
            )}
            <NodeCard
              node={node}
              isCurrent={currentNode?.id === node.id}
              isVisible={visibleNodes.has(node.id)}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-900 rounded-xl w-full max-w-4xl mx-auto">
      <div className="text-center mb-4">
        <div className="text-lg font-medium text-white">
          Palindrome Partitioning
        </div>
        <div className="text-sm text-gray-400">
          Partition &quot;{INPUT_STRING}&quot; such that every substring is a palindrome
        </div>
      </div>

      {/* Input string display */}
      <div className="flex justify-center gap-2 mb-6">
        {INPUT_STRING.split("").map((char, idx) => {
          let charIdx = 0;
          let highlighted = false;
          for (const part of currentNode?.partition || []) {
            if (idx >= charIdx && idx < charIdx + part.length) {
              highlighted = true;
              break;
            }
            charIdx += part.length;
          }

          return (
            <motion.div
              key={idx}
              animate={{
                scale: highlighted ? 1.15 : 1,
                backgroundColor: highlighted ? "#f59e0b" : "#374151",
              }}
              className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg text-2xl font-bold text-white font-mono"
              style={{
                boxShadow: highlighted ? "0 0 25px rgba(245, 158, 11, 0.5)" : "none",
              }}
            >
              {char}
            </motion.div>
          );
        })}
      </div>

      {/* Current partition display */}
      <div className="flex justify-center mb-6">
        <div className="flex items-center gap-3 bg-gray-800/60 rounded-xl px-5 py-3">
          <span className="text-gray-400 text-sm">Current partition:</span>
          <span className="text-amber-400 font-mono text-lg font-bold">
            [{currentNode?.partition.map((p) => `"${p}"`).join(", ") || ""}]
          </span>
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

      {/* Tree visualization using card layout */}
      <AnimatePresence mode="wait">
        <motion.div
          key="tree"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="bg-gray-800/30 rounded-xl p-6 space-y-6"
        >
          {Array.from(nodesByDepth.keys())
            .sort((a, b) => a - b)
            .map((depth) => renderLevel(depth))}
        </motion.div>
      </AnimatePresence>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4 text-sm text-gray-400">
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 bg-amber-600 rounded border-2 border-amber-400" /> current
        </span>
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 bg-violet-900 rounded border-2 border-violet-500" /> exploring
        </span>
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 bg-green-900 rounded border-2 border-green-500" /> complete
        </span>
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 bg-red-900/60 rounded border-2 border-red-500/50" /> pruned
        </span>
      </div>

      {/* Message */}
      <div className="text-center text-base text-gray-300 bg-gray-800/50 px-4 py-3 rounded-xl font-mono mt-4">
        {getMessage()}
      </div>

      {/* Valid partitions found */}
      <div className="mt-4 p-4 bg-gray-800/30 rounded-xl">
        <div className="text-sm text-gray-500 mb-2">
          Valid Partitions Found ({completeResults.length}):
        </div>
        <div className="flex flex-wrap gap-2 min-h-[40px]">
          {completeResults.map((parts, idx) => (
            <motion.span
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-4 py-2 bg-green-600/20 border border-green-500/40 rounded-lg text-green-400 text-base font-mono"
            >
              [{parts.map((p) => `"${p}"`).join(", ")}]
            </motion.span>
          ))}
        </div>
      </div>

      {/* Done message */}
      {step >= maxSteps && (
        <div className="text-base text-center bg-green-600/20 px-4 py-3 rounded-xl mt-4">
          <span className="text-green-400 font-bold">
            Complete! Found {completeResults.length} valid palindrome partitions
          </span>
        </div>
      )}

      {/* Key insight */}
      <div className="mt-4 pt-4 border-t border-gray-800 text-sm text-gray-500 text-center">
        <span className="text-amber-400">Key insight:</span> Only continue exploring if the current substring is a palindrome (early pruning)
      </div>
    </div>
  );
}
