"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";

interface TreeNode {
  id: string;
  value: number;
  result?: number;
  left?: TreeNode;
  right?: TreeNode;
  depth: number;
  position: number;
  isActive?: boolean;
  isCompleted?: boolean;
}

interface RecursionTreeVisualizerProps {
  example?: "fibonacci" | "power" | "factorial";
  inputValue?: number;
}

// skipcq: JS-0067
export default function RecursionTreeVisualizer({
  example: _example = "fibonacci",
  inputValue = 5,
}: RecursionTreeVisualizerProps) {
  void _example;
  const [activeNodes, setActiveNodes] = useState<Set<string>>(new Set());
  const [completedNodes, setCompletedNodes] = useState<Set<string>>(new Set());
  const [nodeResults, setNodeResults] = useState<Map<string, number>>(
    new Map()
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [step, setStep] = useState(0);
  const [speed, setSpeed] = useState(800);

  const buildFibTree = useCallback(function buildFibTree(
    n: number,
    depth = 0,
    pos = 0,
    id = "0"
  ): TreeNode | null {
    if (n < 0) return null;

    const node: TreeNode = {
      id,
      value: n,
      depth,
      position: pos,
    };

    if (n <= 1) {
      node.result = n;
      return node;
    }

    node.left = buildFibTree(n - 1, depth + 1, pos * 2, `${id}L`) || undefined;
    node.right =
      buildFibTree(n - 2, depth + 1, pos * 2 + 1, `${id}R`) || undefined;

    return node;
  }, []);

  const tree = useMemo(() => {
    const maxInput = Math.min(inputValue, 6);
    return buildFibTree(maxInput);
  }, [inputValue, buildFibTree]);

  const generateExecutionOrder = useCallback(
    (node: TreeNode | null | undefined): string[] => {
      if (!node) return [];

      const order: string[] = [];

      function traverse(n: TreeNode) {
        order.push(`enter:${n.id}`);

        if (n.left) traverse(n.left);
        if (n.right) traverse(n.right);

        order.push(`exit:${n.id}`);
      }

      traverse(node);
      return order;
    },
    []
  );

  const executionOrder = useMemo(() => {
    return tree ? generateExecutionOrder(tree) : [];
  }, [tree, generateExecutionOrder]);

  const calculateResult = useCallback(
    function calculateResult(node: TreeNode): number {
      if (node.value <= 1) return node.value;

      const leftResult = node.left
        ? (nodeResults.get(node.left.id) ?? calculateResult(node.left))
        : 0;
      const rightResult = node.right
        ? (nodeResults.get(node.right.id) ?? calculateResult(node.right))
        : 0;

      return leftResult + rightResult;
    },
    [nodeResults]
  );

  useEffect(() => {
    if (!isPlaying || step >= executionOrder.length) {
      if (step >= executionOrder.length) {
        setIsPlaying(false);
      }
      return;
    }

    const timer = setTimeout(() => {
      const action = executionOrder[step];
      const [type, nodeId] = action.split(":");

      if (type === "enter") {
        setActiveNodes((prev) => new Set([...prev, nodeId]));
      } else if (type === "exit") {
        setActiveNodes((prev) => {
          const next = new Set(prev);
          next.delete(nodeId);
          return next;
        });
        setCompletedNodes((prev) => new Set([...prev, nodeId]));

        const findNode = (
          n: TreeNode | null | undefined,
          id: string
        ): TreeNode | null => {
          if (!n) return null;
          if (n.id === id) return n;
          return findNode(n.left, id) || findNode(n.right, id);
        };

        const node = tree ? findNode(tree, nodeId) : null;
        if (node) {
          const result =
            node.value <= 1
              ? node.value
              : (nodeResults.get(node.left?.id || "") ?? 0) +
                (nodeResults.get(node.right?.id || "") ?? 0);
          setNodeResults((prev) => new Map([...prev, [nodeId, result]]));
        }
      }

      setStep((s) => s + 1);
    }, speed);

    return () => clearTimeout(timer);
  }, [
    isPlaying,
    step,
    executionOrder,
    speed,
    tree,
    nodeResults,
    calculateResult,
  ]);

  const reset = () => {
    setStep(0);
    setActiveNodes(new Set());
    setCompletedNodes(new Set());
    setNodeResults(new Map());
    setIsPlaying(false);
  };

  const renderNode = (
    node: TreeNode | null | undefined,
    level: number = 0
  ): React.ReactNode => {
    if (!node) return null;

    const isActive = activeNodes.has(node.id);
    const isCompleted = completedNodes.has(node.id);
    const result = nodeResults.get(node.id);

    return (
      <div key={node.id} className="flex flex-col items-center">
        <div
          className={`
            w-12 h-12 rounded-full flex items-center justify-center font-mono text-sm font-bold
            border-2 transition-all duration-300 relative
            ${isActive ? "bg-yellow-500 border-yellow-400 text-black scale-110 shadow-lg shadow-yellow-500/50" : ""}
            ${isCompleted && !isActive ? "bg-green-500/20 border-green-500 text-green-400" : ""}
            ${!isActive && !isCompleted ? "bg-gray-800 border-gray-700 text-gray-400" : ""}
          `}
        >
          <span>f({node.value})</span>
          {result !== undefined && (
            <span className="absolute -bottom-6 text-xs text-green-400 font-normal">
              = {result}
            </span>
          )}
        </div>

        {(node.left || node.right) && (
          <div className="flex mt-8 relative">
            {node.left && (
              <svg
                className="absolute top-0 left-1/2 -translate-y-8 -translate-x-full"
                width="60"
                height="32"
              >
                <line
                  x1="60"
                  y1="0"
                  x2="30"
                  y2="32"
                  stroke={
                    completedNodes.has(node.left.id) ? "#22c55e" : "#374151"
                  }
                  strokeWidth="2"
                />
              </svg>
            )}
            {node.right && (
              <svg
                className="absolute top-0 left-1/2 -translate-y-8"
                width="60"
                height="32"
              >
                <line
                  x1="0"
                  y1="0"
                  x2="30"
                  y2="32"
                  stroke={
                    completedNodes.has(node.right.id) ? "#22c55e" : "#374151"
                  }
                  strokeWidth="2"
                />
              </svg>
            )}
            <div className="flex gap-4">
              {node.left && renderNode(node.left, level + 1)}
              {node.right && renderNode(node.right, level + 1)}
            </div>
          </div>
        )}
      </div>
    );
  };

  const countNodes = (node: TreeNode | null | undefined): number => {
    if (!node) return 0;
    return 1 + countNodes(node.left) + countNodes(node.right);
  };

  const totalNodes = tree ? countNodes(tree) : 0;
  const finalResult = nodeResults.get("0");

  return (
    <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gray-800/50 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          Recursion Tree Visualizer
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          See how Fibonacci creates a tree of recursive calls
        </p>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 rounded-md font-medium transition ${
              isPlaying
                ? "bg-yellow-500 text-black hover:bg-yellow-400"
                : "bg-green-500 text-white hover:bg-green-400"
            }`}
          >
            {isPlaying ? "⏸ Pause" : "▶ Play"}
          </button>
          <button
            onClick={reset}
            className="px-4 py-2 bg-gray-700 text-white rounded-md font-medium hover:bg-gray-600 transition"
          >
            Reset
          </button>
          <div className="flex items-center gap-2 ml-4">
            <span className="text-gray-400 text-sm">Speed:</span>
            <input
              type="range"
              min="200"
              max="1500"
              step="100"
              value={1700 - speed}
              onChange={(e) => setSpeed(1700 - Number(e.target.value))}
              className="w-24 accent-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-2xl font-bold text-white">{totalNodes}</div>
            <div className="text-xs text-gray-500">Total Calls</div>
          </div>
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-2xl font-bold text-green-400">
              {completedNodes.size}
            </div>
            <div className="text-xs text-gray-500">Completed</div>
          </div>
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-2xl font-bold text-indigo-400">
              {finalResult !== undefined ? finalResult : "—"}
            </div>
            <div className="text-xs text-gray-500">Result</div>
          </div>
        </div>

        <div className="flex justify-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
            <span className="text-gray-400">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500/20 border-2 border-green-500"></div>
            <span className="text-gray-400">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gray-800 border-2 border-gray-700"></div>
            <span className="text-gray-400">Pending</span>
          </div>
        </div>

        <div className="bg-gray-800/30 rounded-md p-6 overflow-x-auto">
          <div className="flex justify-center min-w-max py-4">
            {tree && renderNode(tree)}
          </div>
        </div>

        <div className="mt-4 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-md">
          <p className="text-indigo-300 text-sm">
            <strong>Observation:</strong> Notice how fib(3) is calculated
            multiple times? This is called
            <strong> overlapping subproblems</strong> — the main reason we use
            Dynamic Programming to optimize!
          </p>
        </div>
      </div>
    </div>
  );
}
