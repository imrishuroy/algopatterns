"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

interface Node {
  id: number;
  label: string;
  x: number;
  y: number;
  dist: number;
  state: "unvisited" | "inQueue" | "processing" | "visited";
  prev: number | null;
}

interface Edge {
  from: number;
  to: number;
  weight: number;
  used: boolean;
}

const NODE_POSITIONS = [
  { id: 0, label: "A", x: 50, y: 100 },
  { id: 1, label: "B", x: 150, y: 50 },
  { id: 2, label: "C", x: 150, y: 150 },
  { id: 3, label: "D", x: 280, y: 50 },
  { id: 4, label: "E", x: 280, y: 150 },
  { id: 5, label: "F", x: 380, y: 100 },
];

const GRAPH_EDGES: [number, number, number][] = [
  [0, 1, 4],
  [0, 2, 2],
  [1, 2, 1],
  [1, 3, 5],
  [2, 4, 3],
  [3, 4, 1],
  [3, 5, 2],
  [4, 5, 1],
];

const DEFAULT_SOURCE = 0;
const DEFAULT_TARGET = 5;

function createInitialNodes(): Node[] {
  return NODE_POSITIONS.map((pos) => ({
    ...pos,
    dist: pos.id === DEFAULT_SOURCE ? 0 : Infinity,
    state: pos.id === DEFAULT_SOURCE ? "inQueue" : "unvisited",
    prev: null,
  }));
}

function createInitialEdges(): Edge[] {
  return GRAPH_EDGES.map(([from, to, weight]) => ({
    from,
    to,
    weight,
    used: false,
  }));
}

const INITIAL_NODES = createInitialNodes();
const INITIAL_EDGES = createInitialEdges();

export default function DijkstraVisualizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [nodes, setNodes] = useState<Node[]>(INITIAL_NODES);
  const [edges, setEdges] = useState<Edge[]>(INITIAL_EDGES);
  const [priorityQueue, setPriorityQueue] =
    useState<[number, number][]>([[0, DEFAULT_SOURCE]]);
  const [source] = useState(DEFAULT_SOURCE);
  const [target] = useState(DEFAULT_TARGET);
  const [message, setMessage] = useState(
    "Click Play to find shortest path from A to F"
  );
  const [phase, setPhase] = useState<"init" | "processing" | "done">("init");

  const initGraph = useCallback(() => {
    const newNodes: Node[] = NODE_POSITIONS.map((pos) => ({
      ...pos,
      dist: pos.id === source ? 0 : Infinity,
      state: pos.id === source ? "inQueue" : "unvisited",
      prev: null,
    }));

    const newEdges: Edge[] = GRAPH_EDGES.map(([from, to, weight]) => ({
      from,
      to,
      weight,
      used: false,
    }));

    setNodes(newNodes);
    setEdges(newEdges);
    setPriorityQueue([[0, source]]);
    setPhase("init");
    setMessage(
      `Click Play to find shortest path from ${NODE_POSITIONS[source].label} to ${NODE_POSITIONS[target].label}`
    );
    setIsPlaying(false);
  }, [source, target]);

  const getNeighbors = useCallback(
    (nodeId: number): [number, number][] => {
      const neighbors: [number, number][] = [];
      for (const edge of edges) {
        if (edge.from === nodeId) {
          neighbors.push([edge.to, edge.weight]);
        } else if (edge.to === nodeId) {
          neighbors.push([edge.from, edge.weight]);
        }
      }
      return neighbors;
    },
    [edges]
  );

  useEffect(() => {
    if (!isPlaying || nodes.length === 0) return;

    const timer = setTimeout(() => {
      if (priorityQueue.length === 0) {
        setPhase("done");
        const targetNode = nodes[target];
        if (targetNode.dist === Infinity) {
          setMessage("No path found!");
        } else {
          const path: string[] = [];
          let curr: number | null = target;
          while (curr !== null) {
            path.unshift(nodes[curr].label);
            curr = nodes[curr].prev;
          }
          setMessage(
            `Shortest path: ${path.join(" -> ")} (distance: ${targetNode.dist})`
          );
        }
        setIsPlaying(false);
        return;
      }

      const sortedQueue = [...priorityQueue].sort((a, b) => a[0] - b[0]);
      const [dist, u] = sortedQueue[0];
      const newQueue = sortedQueue.slice(1);

      if (dist > nodes[u].dist) {
        setPriorityQueue(newQueue);
        return;
      }

      const newNodes = [...nodes];
      newNodes[u] = { ...newNodes[u], state: "processing" };
      setNodes(newNodes);
      setMessage(`Processing node ${nodes[u].label} (distance: ${dist})`);

      setTimeout(() => {
        const updatedNodes = [...newNodes];
        updatedNodes[u] = { ...updatedNodes[u], state: "visited" };

        const neighbors = getNeighbors(u);
        const toAdd: [number, number][] = [];
        const newEdges = [...edges];

        for (const [v, w] of neighbors) {
          const newDist = updatedNodes[u].dist + w;
          if (newDist < updatedNodes[v].dist) {
            updatedNodes[v] = {
              ...updatedNodes[v],
              dist: newDist,
              prev: u,
              state:
                updatedNodes[v].state === "visited" ? "visited" : "inQueue",
            };
            toAdd.push([newDist, v]);

            for (let i = 0; i < newEdges.length; i++) {
              if (
                (newEdges[i].from === u && newEdges[i].to === v) ||
                (newEdges[i].to === u && newEdges[i].from === v)
              ) {
                newEdges[i] = { ...newEdges[i], used: true };
              }
            }
          }
        }

        setNodes(updatedNodes);
        setEdges(newEdges);
        setPriorityQueue([...newQueue, ...toAdd]);

        if (u === target) {
          setPhase("done");
          const path: string[] = [];
          let curr: number | null = target;
          while (curr !== null) {
            path.unshift(updatedNodes[curr].label);
            curr = updatedNodes[curr].prev;
          }
          setMessage(
            `Found shortest path: ${path.join(" -> ")} (distance: ${updatedNodes[target].dist})`
          );
          setIsPlaying(false);
        }
      }, speed / 2);
    }, speed);

    return () => clearTimeout(timer);
  }, [isPlaying, priorityQueue, nodes, edges, speed, target, getNeighbors]);

  const getNodeColor = (node: Node) => {
    if (node.id === source) return "bg-green-500";
    if (node.id === target)
      return node.state === "visited" ? "bg-green-500" : "bg-red-500";
    switch (node.state) {
      case "visited":
        return "bg-blue-500";
      case "processing":
        return "bg-yellow-500 animate-pulse";
      case "inQueue":
        return "bg-cyan-500";
      default:
        return "bg-gray-600";
    }
  };

  const getEdgeColor = (edge: Edge) => {
    const fromNode = nodes[edge.from];
    const toNode = nodes[edge.to];
    if (
      edge.used &&
      (fromNode?.state === "visited" || toNode?.state === "visited")
    ) {
      return "#22c55e";
    }
    return "#4b5563";
  };

  const formatDist = (d: number) => (d === Infinity ? "∞" : d);

  return (
    <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">
          Dijkstra&apos;s Algorithm
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Find shortest path in weighted graph using priority queue
        </p>
      </div>

      <div className="p-4">
        {/* Controls */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={phase === "done"}
            className={`px-4 py-2 rounded-md font-medium transition ${
              isPlaying ? "bg-yellow-500 text-black" : "bg-green-500 text-white"
            } disabled:opacity-50`}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            onClick={initGraph}
            className="px-4 py-2 bg-gray-700 text-white rounded-md font-medium hover:bg-gray-600"
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
              className="w-20 accent-orange-500"
            />
          </div>
        </div>

        {/* Graph Visualization */}
        <div className="relative h-56 bg-gray-800/50 rounded-md mb-4 overflow-hidden">
          {/* Edges */}
          <svg className="absolute inset-0 w-full h-full">
            {edges.map((edge, i) => {
              const from = nodes[edge.from];
              const to = nodes[edge.to];
              if (!from || !to) return null;

              const midX = (from.x + to.x) / 2 + 20;
              const midY = (from.y + to.y) / 2 + 20;

              return (
                <g key={`edge-${edge.from}-${edge.to}-${i}`}>
                  <line
                    x1={from.x + 20}
                    y1={from.y + 20}
                    x2={to.x + 20}
                    y2={to.y + 20}
                    stroke={getEdgeColor(edge)}
                    strokeWidth={edge.used ? 3 : 2}
                  />
                  <circle cx={midX} cy={midY} r="12" fill="#1f2937" />
                  <text
                    x={midX}
                    y={midY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#9ca3af"
                    fontSize="12"
                    fontWeight="bold"
                  >
                    {edge.weight}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => (
            <motion.div
              key={node.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`absolute w-10 h-10 rounded-full flex items-center justify-center ${getNodeColor(node)} transition-colors`}
              style={{ left: node.x, top: node.y }}
            >
              <span className="text-white font-bold">{node.label}</span>
            </motion.div>
          ))}

          {/* Distance labels */}
          {nodes.map((node) => (
            <div
              key={`dist-${node.id}`}
              className="absolute text-xs font-mono text-cyan-400 bg-gray-900/80 px-1 rounded-md"
              style={{ left: node.x + 30, top: node.y - 5 }}
            >
              d={formatDist(node.dist)}
            </div>
          ))}
        </div>

        {/* Priority Queue */}
        <div className="bg-gray-800/50 rounded-md p-3 mb-4">
          <div className="text-xs text-gray-500 mb-2">
            Priority Queue (min-heap by distance)
          </div>
          <div className="flex flex-wrap gap-2 min-h-[32px]">
            {[...priorityQueue]
              .sort((a, b) => a[0] - b[0])
              .map(([dist, nodeId], i) => (
                <span
                  key={`pq-${nodeId}-${dist}-${i}`}
                  className={`px-3 py-1 rounded-md text-sm font-mono ${
                    i === 0
                      ? "bg-yellow-500 text-black"
                      : "bg-gray-700 text-gray-300"
                  }`}
                >
                  ({nodes[nodeId]?.label}, {dist})
                </span>
              ))}
            {priorityQueue.length === 0 && (
              <span className="text-gray-500 text-xs">Empty</span>
            )}
          </div>
        </div>

        {/* Distance Table */}
        <div className="bg-gray-800/50 rounded-md p-3 mb-4 overflow-x-auto">
          <div className="text-xs text-gray-500 mb-2">Distance Table</div>
          <div className="flex gap-2">
            {nodes.map((node) => (
              <div
                key={node.id}
                className={`flex flex-col items-center p-2 rounded-md min-w-[50px] ${
                  node.state === "visited"
                    ? "bg-blue-500/20"
                    : node.state === "processing"
                      ? "bg-yellow-500/20"
                      : "bg-gray-700/50"
                }`}
              >
                <span className="text-white font-bold">{node.label}</span>
                <span
                  className={`text-sm font-mono ${
                    node.dist === Infinity ? "text-gray-500" : "text-cyan-400"
                  }`}
                >
                  {formatDist(node.dist)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Message */}
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-md text-sm ${
            phase === "done"
              ? "bg-green-500/10 border border-green-500/30 text-green-400"
              : "bg-gray-800 text-gray-300"
          }`}
        >
          {message}
        </motion.div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500" />
            <span className="text-gray-400">Source/Target</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-cyan-500" />
            <span className="text-gray-400">In Queue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500" />
            <span className="text-gray-400">Processing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500" />
            <span className="text-gray-400">Visited</span>
          </div>
        </div>

        {/* Algorithm explanation */}
        <div className="mt-4 p-3 bg-gray-800/30 rounded-md text-sm text-gray-400">
          <p>
            <strong className="text-orange-400">Dijkstra:</strong> Always
            process the node with smallest known distance. Update neighbors if
            going through current node is shorter. Time: O((V+E) log V) with
            min-heap.
          </p>
        </div>
      </div>
    </div>
  );
}
