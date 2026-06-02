"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

interface Edge {
  from: number;
  to: number;
}

export default function ConnectedComponentsVisualizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [parent, setParent] = useState([0, 1, 2, 3, 4, 5]);
  const [rank, setRank] = useState([0, 0, 0, 0, 0, 0]);
  const [componentCount, setComponentCount] = useState(6);
  const [edges] = useState<Edge[]>([
    { from: 0, to: 1 },
    { from: 1, to: 2 },
    { from: 3, to: 4 },
    { from: 4, to: 5 },
    { from: 2, to: 5 },
  ]);
  const [edgeIndex, setEdgeIndex] = useState(-1);
  const [processedEdges, setProcessedEdges] = useState<number[]>([]);
  const [phase, setPhase] = useState<"init" | "running" | "done">("init");
  const [message, setMessage] = useState("Click Play to merge components");

  const nodePositions = [
    { x: 60, y: 50 }, // 0
    { x: 160, y: 50 }, // 1
    { x: 260, y: 50 }, // 2
    { x: 60, y: 150 }, // 3
    { x: 160, y: 150 }, // 4
    { x: 260, y: 150 }, // 5
  ];

  const reset = useCallback(() => {
    setParent([0, 1, 2, 3, 4, 5]);
    setRank([0, 0, 0, 0, 0, 0]);
    setComponentCount(6);
    setEdgeIndex(-1);
    setProcessedEdges([]);
    setPhase("init");
    setMessage("Click Play to merge components");
    setIsPlaying(false);
  }, []);

  const find = useCallback((p: number[], x: number): number => {
    if (p[x] !== x) {
      return find(p, p[x]);
    }
    return x;
  }, []);

  const getComponentColor = useCallback(
    (node: number, p: number[]): string => {
      const root = find(p, node);
      const colors = [
        "#ef4444", // red
        "#22c55e", // green
        "#3b82f6", // blue
        "#eab308", // yellow
        "#a855f7", // purple
        "#f97316", // orange
      ];
      return colors[root % colors.length];
    },
    [find]
  );

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (phase === "init") {
        setPhase("running");
        setEdgeIndex(0);
        setMessage("Processing edges to find connected components...");
        return;
      }

      if (edgeIndex >= edges.length) {
        setPhase("done");
        setMessage(
          `Done! Found ${componentCount} connected component${componentCount !== 1 ? "s" : ""}`
        );
        setIsPlaying(false);
        return;
      }

      const edge = edges[edgeIndex];
      const rootFrom = find(parent, edge.from);
      const rootTo = find(parent, edge.to);

      if (rootFrom === rootTo) {
        setMessage(
          `Edge (${edge.from}, ${edge.to}): Already connected (same root = ${rootFrom})`
        );
      } else {
        // Perform union
        const newParent = [...parent];
        const newRank = [...rank];

        if (newRank[rootFrom] < newRank[rootTo]) {
          newParent[rootFrom] = rootTo;
        } else if (newRank[rootFrom] > newRank[rootTo]) {
          newParent[rootTo] = rootFrom;
        } else {
          newParent[rootTo] = rootFrom;
          newRank[rootFrom]++;
        }

        setParent(newParent);
        setRank(newRank);
        setComponentCount((prev) => prev - 1);
        setMessage(
          `Edge (${edge.from}, ${edge.to}): Merging components! Count: ${componentCount} → ${componentCount - 1}`
        );
      }

      setProcessedEdges((prev) => [...prev, edgeIndex]);
      setEdgeIndex(edgeIndex + 1);
    }, speed);

    return () => clearTimeout(timer);
  }, [
    isPlaying,
    phase,
    edgeIndex,
    edges,
    parent,
    rank,
    componentCount,
    find,
    speed,
  ]);

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">
          Connected Components
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Watch components merge as edges are processed
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
              min="500"
              max="1500"
              step="100"
              value={2000 - speed}
              onChange={(e) => setSpeed(2000 - Number(e.target.value))}
              className="w-20 accent-purple-500"
            />
          </div>
        </div>

        {/* Component count */}
        <div className="mb-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg text-center">
          <span className="text-gray-400">Components: </span>
          <motion.span
            key={componentCount}
            initial={{ scale: 1.5 }}
            animate={{ scale: 1 }}
            className="text-purple-400 font-bold text-2xl"
          >
            {componentCount}
          </motion.span>
        </div>

        {/* Graph visualization */}
        <div className="mb-4 flex justify-center">
          <svg width="320" height="200" className="bg-gray-800/30 rounded-lg">
            {/* Draw edges */}
            {edges.map((edge, idx) => {
              const from = nodePositions[edge.from];
              const to = nodePositions[edge.to];
              const isProcessed = processedEdges.includes(idx);
              const isCurrent = idx === edgeIndex;

              return (
                <motion.line
                  key={`edge-${idx}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  animate={{
                    stroke: isCurrent
                      ? "#eab308"
                      : isProcessed
                        ? "#22c55e"
                        : "#4b5563",
                    strokeWidth: isCurrent ? 4 : 2,
                  }}
                  strokeDasharray={isProcessed ? "0" : "5,5"}
                />
              );
            })}

            {/* Draw nodes */}
            {nodePositions.map((pos, idx) => (
              <g key={`node-${idx}`}>
                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  r={24}
                  animate={{
                    fill: getComponentColor(idx, parent),
                  }}
                  className="stroke-white stroke-2"
                />
                <text
                  x={pos.x}
                  y={pos.y + 5}
                  textAnchor="middle"
                  className="fill-white text-sm font-bold"
                >
                  {idx}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Edges list */}
        <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
          <div className="text-sm text-gray-400 mb-2">Edges to process:</div>
          <div className="flex gap-2 flex-wrap">
            {edges.map((edge, idx) => (
              <div
                key={`idx-${idx}`}
                className={`px-2 py-1 rounded text-xs font-mono ${
                  processedEdges.includes(idx)
                    ? "bg-green-500/30 text-green-300"
                    : idx === edgeIndex
                      ? "bg-yellow-500 text-black"
                      : "bg-gray-700 text-gray-300"
                }`}
              >
                ({edge.from}, {edge.to})
              </div>
            ))}
          </div>
        </div>

        {/* Parent array */}
        <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
          <div className="text-sm text-gray-400 mb-2">parent[] array:</div>
          <div className="flex gap-2 justify-center">
            {parent.map((p, i) => (
              <div key={`i-${i}`} className="text-center">
                <div className="text-xs text-gray-500 mb-1">{i}</div>
                <motion.div
                  animate={{ backgroundColor: getComponentColor(i, parent) }}
                  className="w-8 h-8 rounded flex items-center justify-center font-mono text-sm text-white"
                >
                  {p}
                </motion.div>
              </div>
            ))}
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

        {/* Key insight */}
        <div className="mt-4 p-3 bg-gray-800/30 rounded-lg text-sm text-gray-400">
          <p>
            <strong className="text-purple-400">Key Insight:</strong> Start with
            n components. Each successful union decreases count by 1. Nodes with
            same color belong to same component.
          </p>
        </div>
      </div>
    </div>
  );
}
