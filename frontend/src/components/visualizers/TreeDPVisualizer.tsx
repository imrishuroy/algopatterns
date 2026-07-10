"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

type Phase = "concept" | "postorder";

interface TreeNode {
  id: number;
  val: number;
  children: number[];
  parent: number | null;
  x?: number;
  y?: number;
}

const buildTree = (): TreeNode[] => {
  // Tree structure matching article example:
  //         3 (id:0)
  //        / \
  //       2   3   (id:1, id:2)
  //        \   \
  //         3   1  (id:3, id:4)
  // Answer: 7 (root 3 + grandchild 3 + grandchild 1)
  return [
    { id: 0, val: 3, children: [1, 2], parent: null },
    { id: 1, val: 2, children: [3], parent: 0 },
    { id: 2, val: 3, children: [4], parent: 0 },
    { id: 3, val: 3, children: [], parent: 1 },
    { id: 4, val: 1, children: [], parent: 2 },
  ];
};

const generateDPSteps = (tree: TreeNode[]) => {
  const steps: {
    nodeId: number;
    include: number;
    exclude: number;
    formula: string;
  }[] = [];
  const dp: { include: number; exclude: number }[] = tree.map(() => ({
    include: 0,
    exclude: 0,
  }));

  const postorder = (id: number) => {
    const node = tree[id];
    let sumIncludeChildren = 0;
    let sumExcludeChildren = 0;

    for (const childId of node.children) {
      postorder(childId);
      sumExcludeChildren += Math.max(dp[childId].include, dp[childId].exclude);
      sumIncludeChildren += dp[childId].exclude;
    }

    dp[id].include = node.val + sumIncludeChildren;
    dp[id].exclude = sumExcludeChildren;

    const childStr =
      node.children.length > 0
        ? node.children.map((c) => `node${c}`).join(", ")
        : "no children";

    steps.push({
      nodeId: id,
      include: dp[id].include,
      exclude: dp[id].exclude,
      formula:
        node.children.length === 0
          ? `Leaf ${node.val}: include=${node.val}, exclude=0`
          : `Node ${node.val} (children: ${childStr}): include=${node.val}+sum(exclude)=${dp[id].include}, exclude=max(inc,exc) per child=${dp[id].exclude}`,
    });
  };

  postorder(0);
  return { steps, dp, answer: Math.max(dp[0].include, dp[0].exclude) };
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
        className="w-10 h-10 flex items-center justify-center bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 disabled:opacity-30 transition-all"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      {isPlaying ? (
        <button
          onClick={onPause}
          className="w-12 h-12 flex items-center justify-center bg-yellow-600 rounded-full hover:bg-yellow-500 transition-all shadow-lg"
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
          className="w-12 h-12 flex items-center justify-center bg-green-600 rounded-full hover:bg-green-500 disabled:opacity-30 transition-all shadow-lg"
        >
          <svg
            className="w-6 h-6 ml-0.5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      )}
      <button
        onClick={onStep}
        disabled={step >= total}
        className="w-10 h-10 flex items-center justify-center bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 disabled:opacity-30 transition-all"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
      <button
        onClick={onReset}
        className="w-10 h-10 flex items-center justify-center bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-all ml-2"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>
    </div>
    <div className="flex items-center justify-center gap-4">
      <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-3 py-1.5">
        <span className="text-xs text-gray-500 uppercase">Speed</span>
        <div className="flex gap-1">
          {[
            { value: 1000, label: "0.5x" },
            { value: 600, label: "1x" },
            { value: 300, label: "2x" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSpeedChange(opt.value)}
              className={`px-2.5 py-1 rounded text-xs font-medium ${speed === opt.value ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-3 py-1.5">
        <span className="text-xs text-gray-500 uppercase">Step</span>
        <span className="text-sm font-mono text-white">
          {step} <span className="text-gray-500">/</span> {total}
        </span>
      </div>
    </div>
  </div>
);

const TreeVisualization = ({
  tree,
  computedNodes,
  currentNodeId,
}: {
  tree: TreeNode[];
  computedNodes: Set<number>;
  currentNodeId?: number;
}) => {
  const width = 400;
  const height = 200;
  const nodeRadius = 22;

  const positions: { x: number; y: number }[] = [
    { x: 200, y: 30 },   // root (id:0, val:3)
    { x: 100, y: 100 },  // left child (id:1, val:2)
    { x: 300, y: 100 },  // right child (id:2, val:3)
    { x: 100, y: 170 },  // left grandchild (id:3, val:3)
    { x: 300, y: 170 },  // right grandchild (id:4, val:1)
  ];

  return (
    <svg width={width} height={height} className="mx-auto">
      {tree.map((node) => {
        const pos = positions[node.id];
        return node.children.map((childId) => {
          const childPos = positions[childId];
          return (
            <line
              key={`${node.id}-${childId}`}
              x1={pos.x}
              y1={pos.y + nodeRadius}
              x2={childPos.x}
              y2={childPos.y - nodeRadius}
              stroke="#4B5563"
              strokeWidth={2}
            />
          );
        });
      })}
      {tree.map((node) => {
        const pos = positions[node.id];
        const isComputed = computedNodes.has(node.id);
        const isCurrent = currentNodeId === node.id;
        return (
          <g key={node.id}>
            <circle
              cx={pos.x}
              cy={pos.y}
              r={nodeRadius}
              fill={isCurrent ? "#2563EB" : isComputed ? "#059669" : "#374151"}
              stroke={
                isCurrent ? "#60A5FA" : isComputed ? "#34D399" : "#6B7280"
              }
              strokeWidth={3}
            />
            <text
              x={pos.x}
              y={pos.y + 5}
              textAnchor="middle"
              className="fill-white font-bold text-sm"
            >
              {node.val}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

const ConceptPhase = ({ tree, onStartAnimation }: { tree: TreeNode[]; onStartAnimation: () => void }) => (
  <div className="flex flex-col items-center gap-6">
    <TreeVisualization tree={tree} computedNodes={new Set()} />
    <div className="bg-gray-800/30 rounded-lg p-6 max-w-lg">
      <div className="text-center mb-4">
        <div className="text-white font-medium mb-2">
          House Robber III (Tree)
        </div>
        <div className="text-sm text-gray-400">
          Max sum without taking adjacent (parent-child) nodes
        </div>
      </div>
      <div className="text-sm text-gray-400 space-y-2">
        <div>For each node, compute two values:</div>
        <div className="pl-4">
          <div>
            <span className="text-green-400">include[node]</span> = node.val +
            sum(exclude[children])
          </div>
          <div>
            <span className="text-red-400">exclude[node]</span> = sum(max(inc,
            exc) for each child)
          </div>
        </div>
        <div className="text-gray-500 text-xs mt-2">
          Process bottom-up (postorder): leaves first, then parents
        </div>
      </div>
      <button
        onClick={onStartAnimation}
        className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-all"
      >
        Start Animation
      </button>
    </div>
  </div>
);

const PostorderPhase = ({
  tree,
  step,
  dpSteps,
  answer,
}: {
  tree: TreeNode[];
  step: number;
  dpSteps: ReturnType<typeof generateDPSteps>["steps"];
  answer: number;
}) => {
  const computedNodes = useMemo(() => {
    const set = new Set<number>();
    for (let s = 0; s < Math.min(step, dpSteps.length); s++) {
      set.add(dpSteps[s].nodeId);
    }
    return set;
  }, [step, dpSteps]);

  const currentStep =
    step > 0 && step <= dpSteps.length ? dpSteps[step - 1] : null;

  const dpTable = useMemo(() => {
    const table: { include: number | null; exclude: number | null }[] =
      tree.map(() => ({ include: null, exclude: null }));
    for (let s = 0; s < Math.min(step, dpSteps.length); s++) {
      const { nodeId, include, exclude } = dpSteps[s];
      table[nodeId] = { include, exclude };
    }
    return table;
  }, [step, dpSteps, tree]);

  const isComplete = step >= dpSteps.length && step > 0;
  const rootDp = dpTable[0];

  return (
    <div className="flex flex-col items-center gap-6">
      <TreeVisualization
        tree={tree}
        computedNodes={computedNodes}
        currentNodeId={currentStep?.nodeId}
      />

      <div className="text-center">
        <div className="text-sm text-gray-500 mb-3">
          DP Table (include / exclude)
        </div>
        <div className="flex gap-2 justify-center flex-wrap">
          {tree.map((node) => {
            const dp = dpTable[node.id];
            const isCurrent = currentStep?.nodeId === node.id;
            const isRoot = node.id === 0 && isComplete;
            return (
              <div
                key={node.id}
                className={`flex flex-col items-center p-2 rounded-lg border-2 ${
                  isCurrent
                    ? "border-blue-500 bg-blue-600/20"
                    : isRoot
                      ? "border-green-500 bg-green-600/20"
                      : "border-gray-700 bg-gray-800/50"
                }`}
              >
                <div className="text-xs text-gray-500">Node {node.val}{node.id === 0 ? " (root)" : ""}</div>
                <div className="flex gap-2 mt-1">
                  <div className="text-xs">
                    <span className="text-green-400">inc:</span>
                    <span className="text-white ml-1">{dp.include ?? "-"}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-red-400">exc:</span>
                    <span className="text-white ml-1">{dp.exclude ?? "-"}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {currentStep && (
        <div className="text-sm text-center font-mono bg-gray-800/50 text-gray-400 px-6 py-3 rounded-lg max-w-lg">
          {currentStep.formula}
        </div>
      )}

      {isComplete && rootDp.include !== null && rootDp.exclude !== null && (
        <div className="text-sm text-center bg-green-600/20 px-6 py-3 rounded-lg">
          <div className="text-green-400 font-bold mb-1">
            Answer: max(include, exclude) = max({rootDp.include}, {rootDp.exclude}) = {answer}
          </div>
          <div className="text-gray-400 text-xs">
            {answer === rootDp.include
              ? "Optimal: Include root 3 + grandchildren (3 + 1) = 7"
              : "Optimal: Exclude root, include children"}
          </div>
        </div>
      )}

      <div className="text-sm text-gray-500">
        Postorder: process children before parent (bottom-up)
      </div>
    </div>
  );
};

// skipcq: JS-0067
export default function TreeDPVisualizer() {
  // skipcq: JS-0067
  const phases: Phase[] = ["concept", "postorder"];
  const phaseLabels: Record<Phase, string> = {
    concept: "Concept",
    postorder: "Postorder DP",
  };

  const [currentPhase, setCurrentPhase] = useState<Phase>("concept");
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(600);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const tree = useMemo(() => buildTree(), []);
  const { steps: dpSteps, answer } = useMemo(
    () => generateDPSteps(tree),
    [tree]
  );

  const getMaxSteps = useCallback(
    (phase: Phase) => {
      if (phase === "postorder") return dpSteps.length;
      return 0; // concept phase is static, no steps
    },
    [dpSteps.length]
  );

  const maxSteps = getMaxSteps(currentPhase);

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

  const goToPhase = (phase: Phase) => {
    setCurrentPhase(phase);
    setStep(0);
    setIsPlaying(false);
  };

  return (
    <div className="p-6 bg-gray-900 rounded-xl w-full max-w-4xl mx-auto">
      <div className="text-center mb-4">
        <div className="text-lg font-medium text-white">
          Tree DP (House Robber III)
        </div>
        <div className="text-sm text-gray-400">
          Max sum without taking adjacent nodes in a tree
        </div>
      </div>
      <div className="flex justify-center mb-6">
        <div className="inline-flex bg-gray-800/50 p-1 rounded-xl">
          {phases.map((phase, index) => (
            <button
              key={phase}
              onClick={() => goToPhase(phase)}
              className={`relative px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${currentPhase === phase ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
            >
              <span className="flex items-center gap-2">
                <span
                  className={`w-5 h-5 flex items-center justify-center rounded-full text-xs ${currentPhase === phase ? "bg-blue-500" : "bg-gray-700"}`}
                >
                  {index + 1}
                </span>
                {phaseLabels[phase]}
              </span>
            </button>
          ))}
        </div>
      </div>
      {currentPhase !== "concept" && (
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
      )}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPhase}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {currentPhase === "concept" && <ConceptPhase tree={tree} onStartAnimation={() => goToPhase("postorder")} />}
          {currentPhase === "postorder" && (
            <PostorderPhase tree={tree} step={step} dpSteps={dpSteps} answer={answer} />
          )}
        </motion.div>
      </AnimatePresence>
      <div className="mt-6 pt-4 border-t border-gray-800 text-sm text-gray-500 text-center">
        Tree = [3, 2, 3, null, 3, null, 1] | Max sum = {answer} | Optimal: root(3) + grandchildren(3+1)
      </div>
    </div>
  );
}
