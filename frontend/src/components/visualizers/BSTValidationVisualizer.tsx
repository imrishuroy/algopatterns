"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";

interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

// Invalid BST: 6 > 5 but is in right subtree of 4 which is in left subtree of 5
const invalidTree: TreeNode = {
  val: 5,
  left: {
    val: 4,
    left: null,
    right: { val: 6, left: null, right: null }, // Invalid: 6 > 5!
  },
  right: {
    val: 7,
    left: null,
    right: null,
  },
};

interface Step {
  node: number;
  min: number;
  max: number;
  valid: boolean;
  message: string;
}

export default function BSTValidationVisualizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(900);
  const [stepIndex, setStepIndex] = useState(-1);
  const [visitedNodes, setVisitedNodes] = useState<number[]>([]);
  const [invalidNode, setInvalidNode] = useState<number | null>(null);
  const [phase, setPhase] = useState<"init" | "running" | "done">("init");
  const [message, setMessage] = useState(
    "Click Play to validate BST with bounds checking"
  );

  const generateSteps = useCallback((): Step[] => {
    const result: Step[] = [];

    const validate = (
      node: TreeNode | null,
      min: number,
      max: number
    ): boolean => {
      if (!node) return true;

      const isValid = node.val > min && node.val < max;
      result.push({
        node: node.val,
        min,
        max,
        valid: isValid,
        message: isValid
          ? `Node ${node.val}: ${min} < ${node.val} < ${max} ✓`
          : `Node ${node.val}: NOT in range (${min}, ${max}) ✗`,
      });

      if (!isValid) return false;

      return (
        validate(node.left, min, node.val) &&
        validate(node.right, node.val, max)
      );
    };

    validate(invalidTree, -Infinity, Infinity);
    return result;
  }, []);

  const steps = useMemo(() => generateSteps(), [generateSteps]);

  const reset = useCallback(() => {
    setStepIndex(-1);
    setVisitedNodes([]);
    setInvalidNode(null);
    setPhase("init");
    setMessage("Click Play to validate BST with bounds checking");
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (phase === "init") {
        setPhase("running");
        setStepIndex(0);
        setMessage("Starting validation with range (-∞, +∞)");
      } else if (phase === "running") {
        if (stepIndex >= steps.length) {
          setPhase("done");
          const isValid = !invalidNode;
          setMessage(
            isValid
              ? "Valid BST!"
              : `Invalid BST! Node ${invalidNode} violates BST property.`
          );
          setIsPlaying(false);
          return;
        }

        const step = steps[stepIndex];
        setVisitedNodes((prev) => [...prev, step.node]);
        setMessage(step.message);

        if (!step.valid) {
          setInvalidNode(step.node);
          setPhase("done");
          setMessage(
            `Invalid! Node ${step.node} is NOT in valid range (${step.min === -Infinity ? "-∞" : step.min}, ${step.max === Infinity ? "+∞" : step.max})`
          );
          setIsPlaying(false);
          return;
        }

        setStepIndex(stepIndex + 1);
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [isPlaying, phase, stepIndex, steps, invalidNode, speed]);

  const currentStep =
    stepIndex >= 0 && stepIndex < steps.length ? steps[stepIndex] : null;

  const getNodePosition = (val: number): { x: number; y: number } => {
    const positions: Record<number, { x: number; y: number }> = {
      5: { x: 150, y: 30 },
      4: { x: 75, y: 100 },
      7: { x: 225, y: 100 },
      6: { x: 112, y: 170 },
    };
    return positions[val] || { x: 0, y: 0 };
  };

  const renderNode = (val: number) => {
    const pos = getNodePosition(val);
    const isVisited = visitedNodes.includes(val);
    const isInvalid = invalidNode === val;
    const isCurrent = currentStep?.node === val;

    return (
      <motion.g key={val}>
        <motion.circle
          cx={pos.x}
          cy={pos.y}
          r={22}
          animate={{
            fill: isInvalid
              ? "#ef4444"
              : isCurrent
                ? "#eab308"
                : isVisited
                  ? "#22c55e"
                  : "#374151",
            scale: isCurrent ? 1.2 : 1,
          }}
          className="stroke-gray-600 stroke-2"
        />
        <text
          x={pos.x}
          y={pos.y + 5}
          textAnchor="middle"
          className={`text-sm font-bold ${isCurrent || isInvalid ? "fill-black" : "fill-white"}`}
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

  const formatBound = (val: number) => {
    if (val === -Infinity) return "-∞";
    if (val === Infinity) return "+∞";
    return val.toString();
  };

  return (
    <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-red-500/10 to-orange-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">BST Validation</h3>
        <p className="text-gray-400 text-sm mt-1">
          Validate BST by passing min/max bounds down the tree
        </p>
      </div>

      <div className="p-4">
        {/* Controls */}
        <div className="flex items-center gap-2 mb-4">
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
            onClick={reset}
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

        {/* Tree visualization */}
        <div className="mb-4 flex justify-center">
          <svg width="300" height="220" className="bg-gray-800/30 rounded-md">
            {/* Edges */}
            {renderEdge(5, 4)}
            {renderEdge(5, 7)}
            {renderEdge(4, 6)}
            {/* Nodes */}
            {[5, 4, 7, 6].map(renderNode)}
            {/* Labels showing bounds */}
            <text
              x="150"
              y="70"
              textAnchor="middle"
              className="fill-gray-500 text-xs"
            >
              root
            </text>
          </svg>
        </div>

        {/* Current bounds */}
        {currentStep && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-md"
          >
            <div className="text-sm text-gray-400 mb-1">Current Check:</div>
            <div className="font-mono text-lg">
              <span className="text-gray-400">
                {formatBound(currentStep.min)}
              </span>
              <span className="text-orange-400"> &lt; </span>
              <span
                className={
                  currentStep.valid ? "text-green-400" : "text-red-400"
                }
              >
                {currentStep.node}
              </span>
              <span className="text-orange-400"> &lt; </span>
              <span className="text-gray-400">
                {formatBound(currentStep.max)}
              </span>
              <span
                className={`ml-2 ${currentStep.valid ? "text-green-400" : "text-red-400"}`}
              >
                {currentStep.valid ? "✓" : "✗"}
              </span>
            </div>
          </motion.div>
        )}

        {/* Explanation of the invalid node */}
        <div className="mb-4 p-3 bg-gray-800/50 rounded-md">
          <div className="text-sm text-gray-400">
            <strong className="text-orange-400">Tree Structure:</strong> Node 6
            is in the RIGHT subtree of node 4, but 4 is in the LEFT subtree of
            root 5. So 6 must be less than 5, but it&apos;s not!
          </div>
        </div>

        {/* Validation history */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">Validation Steps:</div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {steps.slice(0, stepIndex + 1).map((step, idx) => (
              <div
                key={`step-${step.node}-${step.min}-${step.max}-${idx}`}
                className={`text-sm font-mono px-2 py-1 rounded-md ${
                  step.valid ? "text-green-400" : "text-red-400 bg-red-500/10"
                }`}
              >
                {formatBound(step.min)} &lt; {step.node} &lt;{" "}
                {formatBound(step.max)} {step.valid ? "✓" : "✗"}
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
              ? invalidNode
                ? "bg-red-500/10 border border-red-500/30 text-red-400"
                : "bg-green-500/10 border border-green-500/30 text-green-400"
              : "bg-gray-800 text-gray-300"
          }`}
        >
          {message}
        </motion.div>

        {/* Algorithm explanation */}
        <div className="mt-4 p-3 bg-gray-800/30 rounded-md text-sm text-gray-400">
          <p>
            <strong className="text-orange-400">Key Insight:</strong> Pass valid
            range (min, max) DOWN the tree. Left child inherits (min, node.val),
            right child inherits (node.val, max).
          </p>
        </div>
      </div>
    </div>
  );
}
