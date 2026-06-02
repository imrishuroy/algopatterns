"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

const sampleTree: TreeNode = {
  val: 3,
  left: {
    val: 9,
    left: null,
    right: null,
  },
  right: {
    val: 20,
    left: { val: 15, left: null, right: null },
    right: { val: 7, left: null, right: null },
  },
};

export default function LevelOrderVisualizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(900);
  const [queue, setQueue] = useState<number[]>([]);
  const [currentNode, setCurrentNode] = useState<number | null>(null);
  const [visitedNodes, setVisitedNodes] = useState<number[]>([]);
  const [result, setResult] = useState<number[][]>([]);
  const [currentLevel, setCurrentLevel] = useState<number[]>([]);
  const [levelIndex, setLevelIndex] = useState(0);
  const [phase, setPhase] = useState<"init" | "processing" | "done">("init");
  const [message, setMessage] = useState(
    "Click Play to start BFS level order traversal"
  );

  const nodeMap: Record<number, TreeNode> = {
    3: sampleTree,
    9: sampleTree.left!,
    20: sampleTree.right!,
    15: sampleTree.right!.left!,
    7: sampleTree.right!.right!,
  };

  const reset = useCallback(() => {
    setQueue([]);
    setCurrentNode(null);
    setVisitedNodes([]);
    setResult([]);
    setCurrentLevel([]);
    setLevelIndex(0);
    setPhase("init");
    setMessage("Click Play to start BFS level order traversal");
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (phase === "init") {
        setQueue([3]);
        setPhase("processing");
        setMessage("Initialize: Add root to queue");
      } else if (phase === "processing") {
        if (queue.length === 0) {
          // Finish current level if any
          if (currentLevel.length > 0) {
            setResult((prev) => [...prev, currentLevel]);
            setCurrentLevel([]);
          }
          setPhase("done");
          setCurrentNode(null);
          setMessage(
            `Done! Result: [[${result.map((l) => l.join(", ")).join("], [")}${currentLevel.length > 0 ? ", [" + currentLevel.join(", ") + "]" : ""}]]`
          );
          setIsPlaying(false);
          return;
        }

        // Process next node in queue
        const nodeVal = queue[0];
        const newQueue = queue.slice(1);
        const node = nodeMap[nodeVal];

        setCurrentNode(nodeVal);
        setVisitedNodes((prev) => [...prev, nodeVal]);

        const newLevel = [...currentLevel, nodeVal];
        setCurrentLevel(newLevel);

        // Add children to queue
        const children: number[] = [];
        if (node.left) {
          children.push(node.left.val);
          newQueue.push(node.left.val);
        }
        if (node.right) {
          children.push(node.right.val);
          newQueue.push(node.right.val);
        }

        setQueue(newQueue);

        // Check if level is complete (queue now has next level's nodes)
        const isLevelComplete =
          newQueue.length > 0 &&
          !newQueue.some((v) => currentLevel.includes(v) || v === nodeVal);

        if (newQueue.length === 0 || isLevelComplete) {
          if (newLevel.length > 0) {
            setResult((prev) => [...prev, newLevel]);
            setCurrentLevel([]);
            setLevelIndex((prev) => prev + 1);
          }
        }

        if (children.length > 0) {
          setMessage(
            `Process ${nodeVal}, add children [${children.join(", ")}] to queue`
          );
        } else {
          setMessage(`Process ${nodeVal} (leaf node, no children)`);
        }
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [
    isPlaying,
    phase,
    queue,
    currentLevel,
    result,
    levelIndex,
    nodeMap,
    speed,
  ]);

  const getNodePosition = (val: number): { x: number; y: number } => {
    const positions: Record<number, { x: number; y: number }> = {
      3: { x: 150, y: 30 },
      9: { x: 75, y: 100 },
      20: { x: 225, y: 100 },
      15: { x: 187, y: 170 },
      7: { x: 262, y: 170 },
    };
    return positions[val] || { x: 0, y: 0 };
  };

  const renderNode = (val: number) => {
    const pos = getNodePosition(val);
    const isVisited = visitedNodes.includes(val);
    const isCurrent = currentNode === val;
    const isInQueue = queue.includes(val);

    return (
      <motion.g key={val}>
        <motion.circle
          cx={pos.x}
          cy={pos.y}
          r={22}
          animate={{
            fill: isCurrent
              ? "#eab308"
              : isVisited
                ? "#22c55e"
                : isInQueue
                  ? "#3b82f6"
                  : "#374151",
            scale: isCurrent ? 1.2 : 1,
          }}
          className="stroke-gray-600 stroke-2"
        />
        <text
          x={pos.x}
          y={pos.y + 5}
          textAnchor="middle"
          className={`text-sm font-bold ${isCurrent ? "fill-black" : "fill-white"}`}
        >
          {val}
        </text>
      </motion.g>
    );
  };

  const renderEdge = (from: number, to: number) => {
    const fromPos = getNodePosition(from);
    const toPos = getNodePosition(to);
    return (
      <line
        key={`${from}-${to}`}
        x1={fromPos.x}
        y1={fromPos.y + 22}
        x2={toPos.x}
        y2={toPos.y - 22}
        className="stroke-gray-600 stroke-2"
      />
    );
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">
          BFS Level Order Traversal
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Process tree level by level using a queue
        </p>
      </div>

      <div className="p-4">
        {/* Controls */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={phase === "done"}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              isPlaying ? "bg-yellow-500 text-black" : "bg-green-500 text-white"
            } disabled:opacity-50`}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            onClick={reset}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600"
          >
            Reset
          </button>
          <div className="flex items-center gap-2 ml-4">
            <span className="text-gray-400 text-sm">Speed:</span>
            <input
              type="range"
              min="400"
              max="1500"
              step="100"
              value={1900 - speed}
              onChange={(e) => setSpeed(1900 - Number(e.target.value))}
              className="w-20 accent-blue-500"
            />
          </div>
        </div>

        {/* Tree visualization */}
        <div className="mb-4 flex justify-center">
          <svg width="340" height="220" className="bg-gray-800/30 rounded-lg">
            {/* Edges */}
            {renderEdge(3, 9)}
            {renderEdge(3, 20)}
            {renderEdge(20, 15)}
            {renderEdge(20, 7)}
            {/* Nodes */}
            {[3, 9, 20, 15, 7].map(renderNode)}
          </svg>
        </div>

        {/* Queue */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">Queue (FIFO):</div>
          <div className="bg-gray-800/50 rounded-lg p-3 min-h-[50px] flex items-center gap-2">
            <AnimatePresence>
              {queue.map((val, idx) => (
                <motion.div
                  key={`${val}-${idx}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="px-3 py-2 bg-blue-500 rounded-lg font-mono text-white font-bold"
                >
                  {val}
                </motion.div>
              ))}
            </AnimatePresence>
            {queue.length === 0 && (
              <span className="text-gray-500 italic">Empty</span>
            )}
            {queue.length > 0 && (
              <span className="text-xs text-gray-500 ml-2">← front</span>
            )}
          </div>
        </div>

        {/* Result */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">
            Result (level by level):
          </div>
          <div className="flex gap-2 flex-wrap min-h-[50px] items-center">
            {result.map((level, levelIdx) => (
              <div key={levelIdx} className="flex items-center gap-1">
                <span className="text-gray-500">[</span>
                {level.map((val, idx) => (
                  <motion.span
                    key={`level-${val}-${idx}`}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="px-2 py-1 bg-green-500 rounded text-white font-mono text-sm"
                  >
                    {val}
                  </motion.span>
                ))}
                <span className="text-gray-500">]</span>
              </div>
            ))}
            {currentLevel.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">[</span>
                {currentLevel.map((val, idx) => (
                  <span
                    key={`current-${val}-${idx}`}
                    className="px-2 py-1 bg-yellow-500 rounded text-black font-mono text-sm"
                  >
                    {val}
                  </span>
                ))}
                <span className="text-yellow-500">]</span>
              </div>
            )}
            {result.length === 0 && currentLevel.length === 0 && (
              <span className="text-gray-500 italic">Empty</span>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="mb-4 flex gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-gray-400">Current</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-gray-400">In Queue</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-400">Visited</span>
          </div>
        </div>

        {/* Message */}
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-lg text-sm ${
            phase === "done"
              ? "bg-green-500/10 border border-green-500/30 text-green-400"
              : "bg-gray-800 text-gray-300"
          }`}
        >
          {message}
        </motion.div>

        {/* Algorithm explanation */}
        <div className="mt-4 p-3 bg-gray-800/30 rounded-lg text-sm text-gray-400">
          <p>
            <strong className="text-blue-400">Key Insight:</strong> Save queue
            size at start of each level to know how many nodes belong to current
            level.
          </p>
        </div>
      </div>
    </div>
  );
}
