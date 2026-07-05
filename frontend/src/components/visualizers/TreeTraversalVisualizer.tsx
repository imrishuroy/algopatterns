"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useReducer,
  startTransition,
} from "react";
import { motion } from "framer-motion";

interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

const sampleTree: TreeNode = {
  val: 1,
  left: {
    val: 2,
    left: { val: 4, left: null, right: null },
    right: { val: 5, left: null, right: null },
  },
  right: {
    val: 3,
    left: null,
    right: null,
  },
};

type TraversalType = "preorder" | "inorder" | "postorder";

type PlayState = { step: number; isPlaying: boolean };
type PlayAction =
  | { type: "TOGGLE" }
  | { type: "STOP" }
  | { type: "ADVANCE" }
  | { type: "RESET" };

function playReducer(state: PlayState, action: PlayAction): PlayState {
  switch (action.type) {
    case "TOGGLE":
      return { ...state, isPlaying: !state.isPlaying };
    case "STOP":
      return { ...state, isPlaying: false };
    case "ADVANCE":
      return { ...state, step: state.step + 1 };
    case "RESET":
      return { step: 0, isPlaying: false };
    default:
      return state;
  }
}

// skipcq: JS-0067
export default function TreeTraversalVisualizer() {
  const [{ isPlaying }, dispatch] = useReducer(playReducer, {
    step: 0,
    isPlaying: false,
  });
  const [speed, setSpeed] = useState(800);
  const [traversalType, setTraversalType] = useState<TraversalType>("preorder");
  const [visitedNodes, setVisitedNodes] = useState<number[]>([]);
  const [currentNode, setCurrentNode] = useState<number | null>(null);
  const [result, setResult] = useState<number[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [phase, setPhase] = useState<"init" | "running" | "done">("init");
  const [message, setMessage] = useState(
    "Select traversal type and click Play"
  );

  const getTraversalSteps = useCallback(
    (type: TraversalType): { node: number; action: "visit" | "process" }[] => {
      const steps: { node: number; action: "visit" | "process" }[] = [];

      const preorder = (node: TreeNode | null) => {
        if (!node) return;
        steps.push({ node: node.val, action: "process" });
        preorder(node.left);
        preorder(node.right);
      };

      const inorder = (node: TreeNode | null) => {
        if (!node) return;
        inorder(node.left);
        steps.push({ node: node.val, action: "process" });
        inorder(node.right);
      };

      const postorder = (node: TreeNode | null) => {
        if (!node) return;
        postorder(node.left);
        postorder(node.right);
        steps.push({ node: node.val, action: "process" });
      };

      if (type === "preorder") preorder(sampleTree);
      else if (type === "inorder") inorder(sampleTree);
      else postorder(sampleTree);

      return steps;
    },
    []
  );

  const reset = useCallback(() => {
    setVisitedNodes([]);
    setCurrentNode(null);
    setResult([]);
    setStepIndex(0);
    setPhase("init");
    setMessage("Select traversal type and click Play");
    dispatch({ type: "STOP" });
  }, []);

  useEffect(() => {
    startTransition(() => {
      reset();
    });
  }, [traversalType, reset]);

  useEffect(() => {
    if (!isPlaying) return;

    const steps = getTraversalSteps(traversalType);

    const timer = setTimeout(() => {
      if (phase === "init") {
        setPhase("running");
        setMessage(`Starting ${traversalType} traversal...`);
      } else if (phase === "running") {
        if (stepIndex >= steps.length) {
          setPhase("done");
          setCurrentNode(null);
          setMessage(
            `${traversalType.charAt(0).toUpperCase() + traversalType.slice(1)}: [${result.join(", ")}]`
          );
          dispatch({ type: "STOP" });
          return;
        }

        const step = steps[stepIndex];
        setCurrentNode(step.node);
        setVisitedNodes((prev) => [...prev, step.node]);
        setResult((prev) => [...prev, step.node]);

        const orderDesc =
          traversalType === "preorder"
            ? "Root → Left → Right"
            : traversalType === "inorder"
              ? "Left → Root → Right"
              : "Left → Right → Root";
        setMessage(`Process node ${step.node} (${orderDesc})`);

        setStepIndex(stepIndex + 1);
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [
    isPlaying,
    phase,
    stepIndex,
    traversalType,
    result,
    getTraversalSteps,
    speed,
  ]);

  const getNodePosition = (val: number): { x: number; y: number } => {
    const positions: Record<number, { x: number; y: number }> = {
      1: { x: 150, y: 30 },
      2: { x: 75, y: 100 },
      3: { x: 225, y: 100 },
      4: { x: 37, y: 170 },
      5: { x: 112, y: 170 },
    };
    return positions[val] || { x: 0, y: 0 };
  };

  const renderNode = (val: number) => {
    const pos = getNodePosition(val);
    const isVisited = visitedNodes.includes(val);
    const isCurrent = currentNode === val;

    return (
      <motion.g key={val}>
        <motion.circle
          cx={pos.x}
          cy={pos.y}
          r={22}
          animate={{
            fill: isCurrent ? "#eab308" : isVisited ? "#22c55e" : "#374151",
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
    <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">DFS Tree Traversal</h3>
        <p className="text-gray-400 text-sm mt-1">
          Compare preorder, inorder, and postorder traversals
        </p>
      </div>

      <div className="p-4">
        {/* Controls */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <button
            onClick={() => dispatch({ type: "TOGGLE" })}
            disabled={phase === "done"}
            className={`px-4 py-2 rounded-md font-medium transition ${
              isPlaying ? "bg-yellow-500 text-black" : "bg-green-500 text-white"
            } disabled:opacity-50`}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            onClick={reset}
            className="px-4 py-2 bg-gray-700 text-white rounded-md font-medium hover:bg-gray-600"
          >
            Reset
          </button>
          <div className="flex gap-1 ml-2">
            {(["preorder", "inorder", "postorder"] as TraversalType[]).map(
              (type) => (
                <button
                  key={type}
                  onClick={() => setTraversalType(type)}
                  disabled={isPlaying}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                    traversalType === type
                      ? "bg-teal-500 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  } disabled:opacity-50`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              )
            )}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-gray-400 text-sm">Speed:</span>
            <input
              type="range"
              min="400"
              max="1500"
              step="100"
              value={1900 - speed}
              onChange={(e) => setSpeed(1900 - Number(e.target.value))}
              className="w-20 accent-teal-500"
            />
          </div>
        </div>

        {/* Tree visualization */}
        <div className="mb-4 flex justify-center">
          <svg width="300" height="220" className="bg-gray-800/30 rounded-md">
            {/* Edges */}
            {renderEdge(1, 2)}
            {renderEdge(1, 3)}
            {renderEdge(2, 4)}
            {renderEdge(2, 5)}
            {/* Nodes */}
            {[1, 2, 3, 4, 5].map(renderNode)}
          </svg>
        </div>

        {/* Traversal order description */}
        <div className="mb-4 p-3 bg-gray-800/50 rounded-md">
          <div className="text-sm text-gray-400 mb-1">
            {traversalType === "preorder" &&
              "Preorder: Process node BEFORE children (Root → Left → Right)"}
            {traversalType === "inorder" &&
              "Inorder: Process node BETWEEN children (Left → Root → Right)"}
            {traversalType === "postorder" &&
              "Postorder: Process node AFTER children (Left → Right → Root)"}
          </div>
        </div>

        {/* Result */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">Result:</div>
          <div className="flex gap-2 min-h-[40px] items-center">
            {result.map((val, idx) => (
              <motion.div
                key={`${val}-${idx}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-10 h-10 bg-green-500 rounded-md flex items-center justify-center font-mono text-white font-bold"
              >
                {val}
              </motion.div>
            ))}
            {result.length === 0 && (
              <span className="text-gray-500 italic">Empty</span>
            )}
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

        {/* Expected results */}
        <div className="mt-4 p-3 bg-gray-800/30 rounded-md text-sm text-gray-400">
          <p className="mb-1">
            <strong className="text-teal-400">Expected:</strong>
          </p>
          <p>
            Preorder: [1, 2, 4, 5, 3] | Inorder: [4, 2, 5, 1, 3] | Postorder:
            [4, 5, 2, 3, 1]
          </p>
        </div>
      </div>
    </div>
  );
}
