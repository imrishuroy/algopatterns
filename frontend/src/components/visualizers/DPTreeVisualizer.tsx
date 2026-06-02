"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TreeNode {
  id: string;
  label: string;
  value: number;
  result?: number;
  children: TreeNode[];
  depth: number;
  isCacheHit?: boolean;
  choice?: string;
}

type Problem = "fibonacci" | "climbing-stairs" | "house-robber";

interface DPTreeVisualizerProps {
  problem?: Problem;
  showMemo?: boolean;
}

export default function DPTreeVisualizer({
  problem: initialProblem = "fibonacci",
  showMemo: initialShowMemo = false,
}: DPTreeVisualizerProps) {
  const [problem, setProblem] = useState<Problem>(initialProblem);
  const [showMemo, setShowMemo] = useState(initialShowMemo);
  const [activeNodes, setActiveNodes] = useState<Set<string>>(new Set());
  const [completedNodes, setCompletedNodes] = useState<Set<string>>(new Set());
  const [cacheHits, setCacheHits] = useState<Set<string>>(new Set());
  const [nodeResults, setNodeResults] = useState<Map<string, number>>(
    new Map()
  );
  const [memoCache, setMemoCache] = useState<Map<number, number>>(new Map());
  const [isPlaying, setIsPlaying] = useState(false);
  const [step, setStep] = useState(0);
  const [speed, setSpeed] = useState(600);
  const [callCount, setCallCount] = useState(0);
  const [cacheHitCount, setCacheHitCount] = useState(0);

  const problemConfigs = {
    fibonacci: {
      input: 5,
      title: "Fibonacci",
      description: "fib(n) = fib(n-1) + fib(n-2)",
    },
    "climbing-stairs": {
      input: 4,
      title: "Climbing Stairs",
      description: "ways(n) = ways(n-1) + ways(n-2)",
    },
    "house-robber": {
      input: [2, 7, 9, 3],
      title: "House Robber",
      description: "rob(i) = max(nums[i] + rob(i+2), rob(i+1))",
    },
  };

  const buildFibTree = useCallback(
    (
      n: number,
      depth: number = 0,
      id: string = "0",
      memo: Set<number> = new Set()
    ): TreeNode | null => {
      if (n < 0) return null;

      const isCacheHit = showMemo && memo.has(n);

      const node: TreeNode = {
        id,
        label: `fib(${n})`,
        value: n,
        depth,
        children: [],
        isCacheHit,
      };

      if (n <= 1) {
        node.result = n;
        return node;
      }

      if (isCacheHit) {
        return node;
      }

      if (showMemo) {
        memo.add(n);
      }

      const left = buildFibTree(n - 1, depth + 1, `${id}L`, memo);
      const right = buildFibTree(n - 2, depth + 1, `${id}R`, memo);

      if (left) node.children.push(left);
      if (right) node.children.push(right);

      return node;
    },
    [showMemo]
  );

  const buildClimbingTree = useCallback(
    (
      n: number,
      depth: number = 0,
      id: string = "0",
      memo: Set<number> = new Set()
    ): TreeNode | null => {
      if (n < 0) return null;

      const isCacheHit = showMemo && memo.has(n);

      const node: TreeNode = {
        id,
        label: `ways(${n})`,
        value: n,
        depth,
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

      if (showMemo) {
        memo.add(n);
      }

      const left = buildClimbingTree(n - 1, depth + 1, `${id}L`, memo);
      const right = buildClimbingTree(n - 2, depth + 1, `${id}R`, memo);

      if (left) {
        left.choice = "+1 step";
        node.children.push(left);
      }
      if (right) {
        right.choice = "+2 steps";
        node.children.push(right);
      }

      return node;
    },
    [showMemo]
  );

  const buildRobberTree = useCallback(
    (
      nums: number[],
      i: number = 0,
      depth: number = 0,
      id: string = "0",
      memo: Set<number> = new Set()
    ): TreeNode | null => {
      if (i >= nums.length) {
        return {
          id,
          label: `rob(${i})`,
          value: i,
          result: 0,
          depth,
          children: [],
        };
      }

      const isCacheHit = showMemo && memo.has(i);

      const node: TreeNode = {
        id,
        label: `rob(${i})`,
        value: i,
        depth,
        children: [],
        isCacheHit,
      };

      if (isCacheHit) {
        return node;
      }

      if (showMemo) {
        memo.add(i);
      }

      const robChild = buildRobberTree(nums, i + 2, depth + 1, `${id}R`, memo);
      const skipChild = buildRobberTree(nums, i + 1, depth + 1, `${id}S`, memo);

      if (robChild) {
        robChild.choice = `ROB $${nums[i]}`;
        node.children.push(robChild);
      }
      if (skipChild) {
        skipChild.choice = "SKIP";
        node.children.push(skipChild);
      }

      return node;
    },
    [showMemo]
  );

  const tree = useMemo(() => {
    const config = problemConfigs[problem];
    switch (problem) {
      case "fibonacci":
        return buildFibTree(config.input as number);
      case "climbing-stairs":
        return buildClimbingTree(config.input as number);
      case "house-robber":
        return buildRobberTree(config.input as number[], 0);
      default:
        return null;
    }
  }, [problem, buildFibTree, buildClimbingTree, buildRobberTree, showMemo]);

  const generateExecutionOrder = useCallback(
    (node: TreeNode | null): string[] => {
      if (!node) return [];
      const order: string[] = [];

      function traverse(n: TreeNode) {
        order.push(`enter:${n.id}:${n.isCacheHit ? "hit" : "miss"}`);

        if (!n.isCacheHit) {
          for (const child of n.children) {
            traverse(child);
          }
        }

        order.push(`exit:${n.id}:${n.isCacheHit ? "hit" : "miss"}`);
      }

      traverse(node);
      return order;
    },
    []
  );

  const executionOrder = useMemo(() => {
    return tree ? generateExecutionOrder(tree) : [];
  }, [tree, generateExecutionOrder]);

  useEffect(() => {
    if (!isPlaying || step >= executionOrder.length) {
      if (step >= executionOrder.length && step > 0) {
        setIsPlaying(false);
      }
      return;
    }

    const timer = setTimeout(() => {
      const action = executionOrder[step];
      const [type, nodeId, hitStatus] = action.split(":");
      const isHit = hitStatus === "hit";

      if (type === "enter") {
        setActiveNodes((prev) => new Set([...prev, nodeId]));
        setCallCount((c) => c + 1);
        if (isHit) {
          setCacheHits((prev) => new Set([...prev, nodeId]));
          setCacheHitCount((c) => c + 1);
        }
      } else if (type === "exit") {
        setActiveNodes((prev) => {
          const next = new Set(prev);
          next.delete(nodeId);
          return next;
        });
        setCompletedNodes((prev) => new Set([...prev, nodeId]));
      }

      setStep((s) => s + 1);
    }, speed);

    return () => clearTimeout(timer);
  }, [isPlaying, step, executionOrder, speed]);

  const reset = () => {
    setStep(0);
    setActiveNodes(new Set());
    setCompletedNodes(new Set());
    setCacheHits(new Set());
    setNodeResults(new Map());
    setMemoCache(new Map());
    setIsPlaying(false);
    setCallCount(0);
    setCacheHitCount(0);
  };

  const countNodes = (node: TreeNode | null): number => {
    if (!node) return 0;
    return 1 + node.children.reduce((sum, child) => sum + countNodes(child), 0);
  };

  const totalNodes = tree ? countNodes(tree) : 0;

  const renderNode = (
    node: TreeNode | null,
    isRoot: boolean = true
  ): React.ReactNode => {
    if (!node) return null;

    const isActive = activeNodes.has(node.id);
    const isCompleted = completedNodes.has(node.id);
    const isCacheHit = cacheHits.has(node.id);

    return (
      <motion.div
        key={node.id}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: node.depth * 0.05 }}
        className="flex flex-col items-center"
      >
        {node.choice && !isRoot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-xs mb-1 px-2 py-0.5 rounded-full ${
              node.choice.includes("ROB")
                ? "bg-green-500/20 text-green-400"
                : node.choice === "SKIP"
                  ? "bg-gray-500/20 text-gray-400"
                  : "bg-indigo-500/20 text-indigo-400"
            }`}
          >
            {node.choice}
          </motion.div>
        )}

        <motion.div
          animate={{
            scale: isActive ? 1.15 : 1,
            boxShadow: isActive ? "0 0 20px rgba(234, 179, 8, 0.5)" : "none",
          }}
          transition={{ duration: 0.2 }}
          className={`
            relative px-3 py-2 rounded-lg font-mono text-sm font-medium
            border-2 transition-colors duration-300 min-w-[70px] text-center
            ${isActive ? "bg-yellow-500 border-yellow-400 text-black" : ""}
            ${isCacheHit && isCompleted ? "bg-purple-500/30 border-purple-500 text-purple-300" : ""}
            ${isCompleted && !isActive && !isCacheHit ? "bg-green-500/20 border-green-500 text-green-400" : ""}
            ${!isActive && !isCompleted ? "bg-gray-800 border-gray-700 text-gray-400" : ""}
          `}
        >
          <span>{node.label}</span>
          {isCacheHit && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 text-xs bg-purple-500 text-white px-1.5 py-0.5 rounded-full"
            >
              CACHE
            </motion.span>
          )}
          {node.result !== undefined && isCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-green-400 whitespace-nowrap"
            >
              = {node.result}
            </motion.div>
          )}
        </motion.div>

        {node.children.length > 0 && (
          <div className="relative mt-8">
            <svg
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full"
              width={node.children.length * 100}
              height="32"
              style={{
                marginLeft:
                  node.children.length === 1
                    ? 0
                    : -(node.children.length - 1) * 50,
              }}
            >
              {node.children.map((child, idx) => {
                const startX = (node.children.length * 100) / 2;
                const endX = idx * 100 + 50;
                const childCompleted = completedNodes.has(child.id);
                const childCacheHit = cacheHits.has(child.id);

                return (
                  <motion.line
                    key={child.id}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.3 }}
                    x1={startX}
                    y1="0"
                    x2={endX}
                    y2="32"
                    stroke={
                      childCacheHit
                        ? "#a855f7"
                        : childCompleted
                          ? "#22c55e"
                          : "#374151"
                    }
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                );
              })}
            </svg>
            <div className="flex gap-6 justify-center">
              {node.children.map((child) => renderNode(child, false))}
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          DP Decision Tree Visualizer
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Watch how recursive calls branch out and see memoization in action
        </p>
      </div>

      <div className="p-4">
        {/* Problem Selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(Object.keys(problemConfigs) as Problem[]).map((p) => (
            <button
              key={`p-${p}`}
              onClick={() => {
                setProblem(p);
                reset();
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                problem === p
                  ? "bg-indigo-500 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {problemConfigs[p].title}
            </button>
          ))}
        </div>

        {/* Memo Toggle */}
        <div className="flex items-center gap-4 mb-4 p-3 bg-gray-800/50 rounded-lg">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showMemo}
              onChange={(e) => {
                setShowMemo(e.target.checked);
                reset();
              }}
              className="w-4 h-4 rounded accent-purple-500"
            />
            <span className="text-white font-medium">Enable Memoization</span>
          </label>
          <span className="text-gray-500 text-sm">
            {showMemo
              ? "Cache enabled - watch for purple CACHE hits!"
              : "Pure recursion - notice repeated work"}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
              isPlaying
                ? "bg-yellow-500 text-black hover:bg-yellow-400"
                : "bg-green-500 text-white hover:bg-green-400"
            }`}
          >
            {isPlaying ? (
              <>
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
                Pause
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
                Play
              </>
            )}
          </button>
          <button
            onClick={reset}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition"
          >
            Reset
          </button>
          <div className="flex items-center gap-2 ml-4">
            <span className="text-gray-400 text-sm">Speed:</span>
            <input
              type="range"
              min="100"
              max="1000"
              step="50"
              value={1100 - speed}
              onChange={(e) => setSpeed(1100 - Number(e.target.value))}
              className="w-24 accent-indigo-500"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-white">{totalNodes}</div>
            <div className="text-xs text-gray-500">Total Nodes</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-yellow-400">{callCount}</div>
            <div className="text-xs text-gray-500">Function Calls</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-green-400">
              {completedNodes.size}
            </div>
            <div className="text-xs text-gray-500">Completed</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-purple-400">
              {cacheHitCount}
            </div>
            <div className="text-xs text-gray-500">Cache Hits</div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500"></div>
            <span className="text-gray-400">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500/20 border-2 border-green-500"></div>
            <span className="text-gray-400">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-purple-500/30 border-2 border-purple-500"></div>
            <span className="text-gray-400">Cache Hit</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-800 border-2 border-gray-700"></div>
            <span className="text-gray-400">Pending</span>
          </div>
        </div>

        {/* Tree Visualization */}
        <div className="bg-gray-800/30 rounded-lg p-6 overflow-x-auto">
          <div className="flex justify-center min-w-max py-8">
            <AnimatePresence mode="wait">
              {tree && renderNode(tree)}
            </AnimatePresence>
          </div>
        </div>

        {/* Formula Display */}
        <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
          <code className="text-indigo-400 text-sm font-mono">
            {problemConfigs[problem].description}
          </code>
        </div>

        {/* Insight Box */}
        <motion.div
          key={showMemo ? "memo" : "no-memo"}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 p-4 rounded-lg border ${
            showMemo
              ? "bg-purple-500/10 border-purple-500/30"
              : "bg-yellow-500/10 border-yellow-500/30"
          }`}
        >
          {showMemo ? (
            <p className="text-purple-300 text-sm">
              <strong>With Memoization:</strong> Notice the purple CACHE hits!
              Once we compute a value, we never compute it again. This reduces
              time complexity from O(2<sup>n</sup>) to O(n).
            </p>
          ) : (
            <p className="text-yellow-300 text-sm">
              <strong>Without Memoization:</strong> Watch how the same
              subproblems are solved multiple times. This is{" "}
              <strong>overlapping subproblems</strong> — the key indicator that
              DP will help!
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
