"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

interface UFState {
  parent: number[];
  rank: number[];
}

export default function UnionFindVisualizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(900);
  const [state, setState] = useState<UFState>({
    parent: [0, 1, 2, 3, 4, 5],
    rank: [0, 0, 0, 0, 0, 0],
  });
  const [operations] = useState<[string, number, number][]>([
    ["union", 0, 1],
    ["union", 2, 3],
    ["union", 4, 5],
    ["union", 1, 3],
    ["find", 4, -1],
    ["union", 3, 5],
    ["find", 0, -1],
  ]);
  const [opIndex, setOpIndex] = useState(0);
  const [highlighted, setHighlighted] = useState<number[]>([]);
  const [pathNodes, setPathNodes] = useState<number[]>([]);
  const [phase, setPhase] = useState<"init" | "running" | "done">("init");
  const [message, setMessage] = useState(
    "Click Play to see Union-Find operations"
  );

  const reset = useCallback(() => {
    setState({
      parent: [0, 1, 2, 3, 4, 5],
      rank: [0, 0, 0, 0, 0, 0],
    });
    setOpIndex(0);
    setHighlighted([]);
    setPathNodes([]);
    setPhase("init");
    setMessage("Click Play to see Union-Find operations");
    setIsPlaying(false);
  }, []);

  const find = useCallback(
    (parent: number[], x: number): [number, number[]] => {
      const path: number[] = [x];
      while (parent[x] !== x) {
        x = parent[x];
        path.push(x);
      }
      return [x, path];
    },
    []
  );

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (phase === "init") {
        setPhase("running");
      }

      if (opIndex >= operations.length) {
        setPhase("done");
        setMessage(
          "All operations complete! Notice how path compression flattened the trees."
        );
        setIsPlaying(false);
        setHighlighted([]);
        setPathNodes([]);
        return;
      }

      const [op, x, y] = operations[opIndex];

      if (op === "find") {
        const [root, path] = find(state.parent, x);
        setPathNodes(path);
        setHighlighted([x, root]);
        setMessage(`find(${x}): Following path ${path.join(" → ")} = ${root}`);

        // Apply path compression
        setTimeout(() => {
          setState((prev) => {
            const newParent = [...prev.parent];
            for (const node of path) {
              newParent[node] = root;
            }
            return { ...prev, parent: newParent };
          });
          setMessage(
            `find(${x}): Path compression applied! All nodes now point to ${root}`
          );
        }, speed / 2);
      } else {
        // Union operation
        const [rootX, pathX] = find(state.parent, x);
        const [rootY, pathY] = find(state.parent, y);

        setHighlighted([x, y, rootX, rootY]);
        setPathNodes([...pathX, ...pathY]);

        if (rootX === rootY) {
          setMessage(
            `union(${x}, ${y}): Already in same set (root = ${rootX})`
          );
        } else {
          setState((prev) => {
            const newParent = [...prev.parent];
            const newRank = [...prev.rank];

            // Union by rank
            if (newRank[rootX] < newRank[rootY]) {
              newParent[rootX] = rootY;
              setMessage(
                `union(${x}, ${y}): rank[${rootX}] < rank[${rootY}], attach ${rootX} under ${rootY}`
              );
            } else if (newRank[rootX] > newRank[rootY]) {
              newParent[rootY] = rootX;
              setMessage(
                `union(${x}, ${y}): rank[${rootX}] > rank[${rootY}], attach ${rootY} under ${rootX}`
              );
            } else {
              newParent[rootY] = rootX;
              newRank[rootX]++;
              setMessage(
                `union(${x}, ${y}): Equal ranks, attach ${rootY} under ${rootX}, increase rank`
              );
            }

            return { parent: newParent, rank: newRank };
          });
        }
      }

      setOpIndex(opIndex + 1);
    }, speed);

    return () => clearTimeout(timer);
  }, [isPlaying, phase, opIndex, operations, state, find, speed]);

  const getNodePosition = (idx: number) => {
    const cols = 3;
    const row = Math.floor(idx / cols);
    const col = idx % cols;
    return {
      x: 80 + col * 100,
      y: 60 + row * 100,
    };
  };

  const renderTree = () => {
    const nodes: React.ReactNode[] = [];
    const edges: React.ReactNode[] = [];

    // Draw edges first (parent relationships)
    state.parent.forEach((p, i) => {
      if (p !== i) {
        const from = getNodePosition(i);
        const to = getNodePosition(p);
        edges.push(
          <motion.line
            key={`edge-${i}-${p}`}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="stroke-gray-500 stroke-2"
            markerEnd="url(#arrowhead)"
          />
        );
      }
    });

    // Draw nodes
    state.parent.forEach((_, i) => {
      const pos = getNodePosition(i);
      const isHighlighted = highlighted.includes(i);
      const isInPath = pathNodes.includes(i);
      const isRoot = state.parent[i] === i;

      nodes.push(
        <g key={`node-${i}`}>
          <motion.circle
            cx={pos.x}
            cy={pos.y}
            r={24}
            animate={{
              fill: isHighlighted
                ? "#eab308"
                : isInPath
                  ? "#3b82f6"
                  : isRoot
                    ? "#22c55e"
                    : "#374151",
              scale: isHighlighted ? 1.2 : 1,
            }}
            className="stroke-gray-600 stroke-2"
          />
          <text
            x={pos.x}
            y={pos.y + 5}
            textAnchor="middle"
            className={`text-sm font-bold ${isHighlighted ? "fill-black" : "fill-white"}`}
          >
            {i}
          </text>
          {isRoot && (
            <text
              x={pos.x}
              y={pos.y - 30}
              textAnchor="middle"
              className="fill-green-400 text-xs"
            >
              root
            </text>
          )}
        </g>
      );
    });

    return [...edges, ...nodes];
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">
          Union-Find Operations
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Watch union and find with path compression
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
              className="w-20 accent-emerald-500"
            />
          </div>
        </div>

        {/* Operations queue */}
        <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
          <div className="text-sm text-gray-400 mb-2">Operations:</div>
          <div className="flex gap-2 flex-wrap">
            {operations.map(([op, x, y], idx) => (
              <div
                key={`op-${op}-${x}-${y}-${idx}`}
                className={`px-2 py-1 rounded text-xs font-mono ${
                  idx < opIndex
                    ? "bg-green-500/30 text-green-300"
                    : idx === opIndex && phase === "running"
                      ? "bg-yellow-500 text-black"
                      : "bg-gray-700 text-gray-300"
                }`}
              >
                {op}({x}
                {y >= 0 ? `, ${y}` : ""})
              </div>
            ))}
          </div>
        </div>

        {/* Tree visualization */}
        <div className="mb-4 flex justify-center">
          <svg width="340" height="220" className="bg-gray-800/30 rounded-lg">
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
              </marker>
            </defs>
            {renderTree()}
          </svg>
        </div>

        {/* Parent array display */}
        <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
          <div className="text-sm text-gray-400 mb-2">parent[] array:</div>
          <div className="flex gap-2 justify-center">
            {state.parent.map((p, i) => (
              <div key={`parent-${p}-${i}`} className="text-center">
                <div className="text-xs text-gray-500 mb-1">{i}</div>
                <div
                  className={`w-8 h-8 rounded flex items-center justify-center font-mono text-sm ${
                    p === i
                      ? "bg-green-500/30 text-green-300"
                      : "bg-gray-700 text-gray-300"
                  }`}
                >
                  {p}
                </div>
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

        {/* Legend */}
        <div className="mt-4 flex gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-400">Root</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-gray-400">Active</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-gray-400">Path</span>
          </div>
        </div>
      </div>
    </div>
  );
}
