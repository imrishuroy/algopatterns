"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TreeNode {
  id: string;
  index: number;
  segments: string[];
  children: TreeNode[];
  depth: number;
  isComplete: boolean;
  isPruned: boolean;
  segment: string;
  pruneReason?: string;
}

const INPUT_STRING = "25525";

const isValidSegment = (segment: string): { valid: boolean; reason?: string } => {
  if (segment.length === 0) {
    return { valid: false, reason: "empty" };
  }
  if (segment.length > 3) {
    return { valid: false, reason: "too long" };
  }
  if (segment.length > 1 && segment[0] === "0") {
    return { valid: false, reason: "leading zero" };
  }
  const num = parseInt(segment);
  if (num > 255) {
    return { valid: false, reason: "> 255" };
  }
  return { valid: true };
};

const buildIPTree = (): TreeNode => {
  const inputStr = INPUT_STRING;
  const root: TreeNode = {
    id: "root",
    index: 0,
    segments: [],
    children: [],
    depth: 0,
    isComplete: false,
    isPruned: false,
    segment: "",
  };

  const build = (node: TreeNode) => {
    // Check if complete (4 segments and used all chars)
    if (node.segments.length === 4) {
      if (node.index === inputStr.length) {
        node.isComplete = true;
      }
      return;
    }

    // Pruning check
    const remaining = inputStr.length - node.index;
    const segmentsNeeded = 4 - node.segments.length;
    if (remaining < segmentsNeeded || remaining > segmentsNeeded * 3) {
      return;
    }

    // Try taking 1, 2, or 3 characters
    for (let len = 1; len <= 3 && node.index + len <= inputStr.length; len++) {
      const segment = inputStr.slice(node.index, node.index + len);
      const { valid, reason } = isValidSegment(segment);

      const child: TreeNode = {
        id: `${node.id}-${node.index}-${len}`,
        index: node.index + len,
        segments: [...node.segments, segment],
        children: [],
        depth: node.depth + 1,
        isComplete: false,
        isPruned: !valid,
        segment,
        pruneReason: reason,
      };
      node.children.push(child);

      if (valid) {
        build(child);
      }
    }
  };

  build(root);
  return root;
};

const flattenTree = (node: TreeNode, order: TreeNode[] = []): TreeNode[] => {
  order.push(node);
  // First add valid children (depth-first)
  for (const child of node.children) {
    if (!child.isPruned) {
      flattenTree(child, order);
    }
  }
  // Then add pruned children
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
                  ? "bg-cyan-600 text-white"
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

// Node card component
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
    if (isCurrent) return "bg-cyan-900/60 border-cyan-500";
    if (node.isComplete) return "bg-green-900/60 border-green-500/50";
    return "bg-blue-900/60 border-blue-500/50";
  };

  const getLabel = () => {
    if (node.segments.length === 0) return `"${INPUT_STRING}"`;
    return node.segments.join(".");
  };

  const getStatus = () => {
    if (node.isComplete) return "Valid IP!";
    if (node.isPruned) return node.pruneReason || "invalid";
    return `${node.segments.length}/4 segments`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-xl border-2 px-4 py-3 min-w-[100px] text-center ${getBgColor()} ${isCurrent ? "ring-2 ring-cyan-400 ring-offset-2 ring-offset-gray-900" : ""}`}
    >
      <div className="text-base font-mono font-bold text-white mb-1">
        {getLabel()}
      </div>
      <div className={`text-xs ${node.isPruned ? "text-red-300" : node.isComplete ? "text-green-300" : "text-gray-400"}`}>
        {getStatus()}
      </div>
    </motion.div>
  );
};

// skipcq: JS-0067
export default function RestoreIPVisualizer() {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const tree = useMemo(() => buildIPTree(), []);
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
      .map((n) => n.segments.join("."));
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
      const depthGroup = groups.get(node.depth);
      if (depthGroup) {
        depthGroup.push(node);
      }
    }
    return groups;
  }, [nodeOrder]);

  const getMessage = () => {
    if (step === 0) return `Start: Restore valid IPs from "${INPUT_STRING}"`;

    const curr = currentNode;

    if (curr.isPruned) {
      return `"${curr.segment}" is INVALID (${curr.pruneReason}) - PRUNE`;
    }

    if (curr.isComplete) {
      return `Complete! Valid IP: ${curr.segments.join(".")}`;
    }

    if (step >= maxSteps) {
      return `Done! Found ${completeResults.length} valid IP addresses`;
    }

    return `Take "${curr.segment}" → segments: [${curr.segments.map(s => `"${s}"`).join(", ")}]`;
  };

  // Render tree using cards
  const renderLevel = (depth: number) => {
    const nodes = nodesByDepth.get(depth) || [];
    return (
      <div key={depth} className="flex justify-center gap-4 flex-wrap">
        {nodes.map((node) => (
          <div key={node.id} className="flex flex-col items-center">
            {/* Edge label */}
            {node.segment && visibleNodes.has(node.id) && (
              <div className={`text-sm font-mono mb-2 px-2 py-0.5 rounded ${
                node.isPruned 
                  ? "text-red-400 bg-red-900/30" 
                  : "text-cyan-400 bg-cyan-900/30"
              }`}>
                +&quot;{node.segment}&quot;
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
          Restore IP Addresses
        </div>
        <div className="text-sm text-gray-400">
          Insert dots into &quot;{INPUT_STRING}&quot; to form valid IP addresses
        </div>
      </div>

      {/* Input string display */}
      <div className="flex justify-center gap-1 mb-6">
        {INPUT_STRING.split("").map((char, idx) => {
          // Highlight characters that are part of current segments
          let charIdx = 0;
          let highlighted = false;
          let segmentIndex = -1;
          
          for (let i = 0; i < (currentNode?.segments?.length || 0); i++) {
            const seg = currentNode.segments[i];
            if (idx >= charIdx && idx < charIdx + seg.length) {
              highlighted = true;
              segmentIndex = i;
              break;
            }
            charIdx += seg.length;
          }

          // Different colors for different segments
          const colors = [
            "bg-cyan-500",
            "bg-blue-500", 
            "bg-purple-500",
            "bg-pink-500",
          ];

          return (
            <motion.div
              key={idx}
              animate={{
                scale: highlighted ? 1.1 : 1,
                backgroundColor: highlighted 
                  ? undefined
                  : "#374151",
              }}
              className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-lg text-xl font-bold text-white font-mono ${
                highlighted ? colors[segmentIndex % colors.length] : "bg-gray-700"
              }`}
              style={{
                boxShadow: highlighted ? "0 0 20px rgba(6, 182, 212, 0.4)" : "none",
              }}
            >
              {char}
            </motion.div>
          );
        })}
      </div>

      {/* Current segments display */}
      <div className="flex justify-center mb-6">
        <div className="flex items-center gap-3 bg-gray-800/60 rounded-xl px-5 py-3">
          <span className="text-gray-400 text-sm">Current:</span>
          <span className="text-cyan-400 font-mono text-lg font-bold">
            {currentNode?.segments?.length > 0 
              ? currentNode.segments.join(".")
              : "(empty)"}
          </span>
          <span className="text-gray-500 text-sm">
            ({currentNode?.segments?.length || 0}/4 segments)
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
          className="bg-gray-800/30 rounded-xl p-6 space-y-6 overflow-x-auto"
        >
          {Array.from(nodesByDepth.keys())
            .sort((a, b) => a - b)
            .map((depth) => renderLevel(depth))}
        </motion.div>
      </AnimatePresence>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4 text-sm text-gray-400 flex-wrap">
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 bg-cyan-600 rounded border-2 border-cyan-400" /> current
        </span>
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 bg-blue-900 rounded border-2 border-blue-500" /> exploring
        </span>
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 bg-green-900 rounded border-2 border-green-500" /> valid IP
        </span>
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 bg-red-900/60 rounded border-2 border-red-500/50" /> invalid
        </span>
      </div>

      {/* Message */}
      <div className="text-center text-base text-gray-300 bg-gray-800/50 px-4 py-3 rounded-xl font-mono mt-4">
        {getMessage()}
      </div>

      {/* Valid IPs found */}
      <div className="mt-4 p-4 bg-gray-800/30 rounded-xl">
        <div className="text-sm text-gray-500 mb-2">
          Valid IP Addresses Found ({completeResults.length}):
        </div>
        <div className="flex flex-wrap gap-2 min-h-[40px]">
          {completeResults.length === 0 ? (
            <span className="text-gray-600 text-sm italic">None yet...</span>
          ) : (
            completeResults.map((ip, idx) => (
              <motion.span
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-4 py-2 bg-green-600/20 border border-green-500/40 rounded-lg text-green-400 text-base font-mono"
              >
                {ip}
              </motion.span>
            ))
          )}
        </div>
      </div>

      {/* Done message */}
      {step >= maxSteps && (
        <div className="text-base text-center bg-green-600/20 px-4 py-3 rounded-xl mt-4">
          <span className="text-green-400 font-bold">
            Complete! Found {completeResults.length} valid IP address{completeResults.length !== 1 ? "es" : ""}
          </span>
        </div>
      )}

      {/* Key insight */}
      <div className="mt-4 pt-4 border-t border-gray-800 text-sm text-gray-500 text-center">
        <span className="text-cyan-400">Key:</span> Each segment must be 0-255 with no leading zeros. Need exactly 4 segments.
      </div>
    </div>
  );
}
