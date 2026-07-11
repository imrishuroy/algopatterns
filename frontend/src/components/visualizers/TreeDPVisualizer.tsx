"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

type Phase = "why-pairs" | "robber" | "diameter";

interface TreeNode {
  id: number;
  val: number;
  left: number | null;
  right: number | null;
  x: number;
  y: number;
}

// House Robber III tree:
//       3
//      / \
//     2   3
//      \   \
//       3   1
const robberTree: TreeNode[] = [
  { id: 0, val: 3, left: 1, right: 2, x: 200, y: 30 },
  { id: 1, val: 2, left: null, right: 3, x: 100, y: 100 },
  { id: 2, val: 3, left: null, right: 4, x: 300, y: 100 },
  { id: 3, val: 3, left: null, right: null, x: 100, y: 170 },
  { id: 4, val: 1, left: null, right: null, x: 300, y: 170 },
];

// Diameter tree:
//       1
//      / \
//     2   3
//    / \
//   4   5
const diameterTree: TreeNode[] = [
  { id: 0, val: 1, left: 1, right: 2, x: 200, y: 30 },
  { id: 1, val: 2, left: 3, right: 4, x: 100, y: 100 },
  { id: 2, val: 3, left: null, right: null, x: 300, y: 100 },
  { id: 3, val: 4, left: null, right: null, x: 50, y: 170 },
  { id: 4, val: 5, left: null, right: null, x: 150, y: 170 },
];

// Why-pairs demonstration tree (linear chain):
//     2
//    /
//   3
//  /
// 4
const chainTree: TreeNode[] = [
  { id: 0, val: 2, left: 1, right: null, x: 80, y: 35 },
  { id: 1, val: 3, left: 2, right: null, x: 55, y: 105 },
  { id: 2, val: 4, left: null, right: null, x: 30, y: 175 },
];

interface RobberStep {
  nodeId: number;
  inc: number;
  exc: number;
  formula: string;
  phase: "visit" | "compute";
}

interface DiameterStep {
  nodeId: number;
  height: number;
  pathThrough: number;
  maxDiameter: number;
  formula: string;
}

interface WhyPairsStep {
  nodeId: number;
  wrongValue: number;
  inc: number;
  exc: number;
  explanation: string;
  showsProblem: boolean;
}

const generateRobberSteps = (): { steps: RobberStep[]; answer: number } => {
  const steps: RobberStep[] = [];
  const dp: { inc: number; exc: number }[] = robberTree.map(() => ({ inc: 0, exc: 0 }));

  const postorder = (id: number) => {
    const node = robberTree[id];

    steps.push({
      nodeId: id,
      inc: 0,
      exc: 0,
      formula: `Visit node ${node.val}`,
      phase: "visit",
    });

    let leftInc = 0, leftExc = 0, rightInc = 0, rightExc = 0;

    if (node.left !== null) {
      postorder(node.left);
      leftInc = dp[node.left].inc;
      leftExc = dp[node.left].exc;
    }
    if (node.right !== null) {
      postorder(node.right);
      rightInc = dp[node.right].inc;
      rightExc = dp[node.right].exc;
    }

    dp[id].inc = node.val + leftExc + rightExc;
    dp[id].exc = Math.max(leftInc, leftExc) + Math.max(rightInc, rightExc);

    const isLeaf = node.left === null && node.right === null;
    const formula = isLeaf
      ? `Leaf ${node.val}: inc=${node.val}, exc=0`
      : `Node ${node.val}: inc=${node.val}+${leftExc}+${rightExc}=${dp[id].inc}, exc=max(${leftInc},${leftExc})+max(${rightInc},${rightExc})=${dp[id].exc}`;

    steps.push({
      nodeId: id,
      inc: dp[id].inc,
      exc: dp[id].exc,
      formula,
      phase: "compute",
    });
  };

  postorder(0);
  return { steps, answer: Math.max(dp[0].inc, dp[0].exc) };
};

const generateDiameterSteps = (): { steps: DiameterStep[]; answer: number } => {
  const steps: DiameterStep[] = [];
  const heights: number[] = diameterTree.map(() => 0);
  let maxDiameter = 0;

  const postorder = (id: number): number => {
    const node = diameterTree[id];

    let leftH = 0, rightH = 0;
    if (node.left !== null) {
      leftH = postorder(node.left);
    }
    if (node.right !== null) {
      rightH = postorder(node.right);
    }

    const height = 1 + Math.max(leftH, rightH);
    const pathThrough = leftH + rightH;
    maxDiameter = Math.max(maxDiameter, pathThrough);
    heights[id] = height;

    const isLeaf = node.left === null && node.right === null;
    const formula = isLeaf
      ? `Leaf ${node.val}: height=1, path=0`
      : `Node ${node.val}: height=1+max(${leftH},${rightH})=${height}, path=${leftH}+${rightH}=${pathThrough}`;

    steps.push({
      nodeId: id,
      height,
      pathThrough,
      maxDiameter,
      formula,
    });

    return height;
  };

  postorder(0);
  return { steps, answer: maxDiameter };
};

const generateWhyPairsSteps = (): WhyPairsStep[] => {
  const steps: WhyPairsStep[] = [];

  // Step 1: Leaf node 4 (id:2 in chainTree)
  steps.push({
    nodeId: 2,
    wrongValue: 4,
    inc: 4,
    exc: 0,
    explanation: "Leaf 4: Single-value 'best=4'. With pairs: inc=4 (take it), exc=0 (skip it).",
    showsProblem: false,
  });

  // Step 2: Node 3 (id:1) with child 4
  steps.push({
    nodeId: 1,
    wrongValue: 4,
    inc: 3,
    exc: 4,
    explanation: "Node 3: Single-value 'best=max(3+0, 4)=4'. But to compute parent, we need to know: was 4 included?",
    showsProblem: true,
  });

  // Step 3: Root 2 (id:0) - the problem
  steps.push({
    nodeId: 0,
    wrongValue: 4,
    inc: 6,
    exc: 4,
    explanation: "Root 2: Can we take 2? Only if child 3 was EXCLUDED. Single-value 'best=4' loses this info!",
    showsProblem: true,
  });

  // Step 4: Correct answer with pairs
  steps.push({
    nodeId: 0,
    wrongValue: 4,
    inc: 6,
    exc: 4,
    explanation: "With pairs: inc[2]=2+exc[3]=2+4=6, exc[2]=max(inc[3],exc[3])=max(3,4)=4. Answer=max(6,4)=6!",
    showsProblem: false,
  });

  return steps;
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
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
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
          <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      )}
      <button
        onClick={onStep}
        disabled={step >= total}
        className="w-10 h-10 flex items-center justify-center bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 disabled:opacity-30 transition-all"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <button
        onClick={onReset}
        className="w-10 h-10 flex items-center justify-center bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-all ml-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
    <div className="flex items-center justify-center gap-4">
      <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-3 py-1.5">
        <span className="text-xs text-gray-500 uppercase">Speed</span>
        <div className="flex gap-1">
          {[
            { value: 1200, label: "0.5x" },
            { value: 700, label: "1x" },
            { value: 350, label: "2x" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSpeedChange(opt.value)}
              className={`px-2.5 py-1 rounded text-xs font-medium ${speed === opt.value ? "bg-emerald-600 text-white" : "text-gray-400 hover:text-white"}`}
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

const TreeSVG = ({
  tree,
  computedNodes,
  currentNodeId,
  nodeLabels,
  width = 400,
  height = 220,
  labelSide = "right",
}: {
  tree: TreeNode[];
  computedNodes: Map<number, { top: string; bottom: string }>;
  currentNodeId?: number;
  nodeLabels?: Map<number, string>;
  width?: number;
  height?: number;
  labelSide?: "right" | "left";
}) => {
  const nodeRadius = 22;
  const labelOffset = labelSide === "right" ? nodeRadius + 8 : -(nodeRadius + 8);
  const labelAnchor = labelSide === "right" ? "start" : "end";

  return (
    <svg width={width} height={height} className="mx-auto">
      {tree.map((node) => {
        const children = [node.left, node.right].filter((c) => c !== null) as number[];
        return children.map((childId) => {
          const child = tree[childId];
          return (
            <line
              key={`edge-${node.id}-${childId}`}
              x1={node.x}
              y1={node.y + nodeRadius}
              x2={child.x}
              y2={child.y - nodeRadius}
              stroke="#4B5563"
              strokeWidth={2}
            />
          );
        });
      })}

      {tree.map((node) => {
        const isComputed = computedNodes.has(node.id);
        const isCurrent = currentNodeId === node.id;
        const label = nodeLabels?.get(node.id);
        const dpInfo = computedNodes.get(node.id);

        return (
          <g key={`node-${node.id}`}>
            <motion.circle
              cx={node.x}
              cy={node.y}
              r={nodeRadius}
              fill={isCurrent ? "#2563EB" : isComputed ? "#059669" : "#374151"}
              stroke={isCurrent ? "#60A5FA" : isComputed ? "#34D399" : "#6B7280"}
              strokeWidth={3}
              animate={{
                scale: isCurrent ? 1.1 : 1,
              }}
            />
            <text
              x={node.x}
              y={node.y + 5}
              textAnchor="middle"
              className="fill-white font-bold text-sm"
            >
              {node.val}
            </text>

            {dpInfo && (
              <g>
                <text
                  x={node.x + labelOffset}
                  y={node.y - 3}
                  textAnchor={labelAnchor}
                  className="fill-green-400 text-xs font-mono"
                >
                  {dpInfo.top}
                </text>
                <text
                  x={node.x + labelOffset}
                  y={node.y + 11}
                  textAnchor={labelAnchor}
                  className="fill-red-400 text-xs font-mono"
                >
                  {dpInfo.bottom}
                </text>
              </g>
            )}

            {label && (
              <text
                x={node.x + labelOffset}
                y={node.y + 25}
                textAnchor={labelAnchor}
                className="fill-yellow-400 text-xs font-mono"
              >
                {label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

const WhyPairsPhase = ({ step, steps }: { step: number; steps: WhyPairsStep[] }) => {
  const currentStep = step > 0 && step <= steps.length ? steps[step - 1] : null;

  const computedNodes = useMemo(() => {
    const map = new Map<number, { top: string; bottom: string }>();
    for (let s = 0; s < Math.min(step, steps.length); s++) {
      const st = steps[s];
      map.set(st.nodeId, { top: `inc=${st.inc}`, bottom: `exc=${st.exc}` });
    }
    return map;
  }, [step, steps]);

  const wrongLabels = useMemo(() => {
    const map = new Map<number, string>();
    for (let s = 0; s < Math.min(step, steps.length); s++) {
      const st = steps[s];
      map.set(st.nodeId, `wrong: ${st.wrongValue}`);
    }
    return map;
  }, [step, steps]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-sm text-gray-400 text-center max-w-md">
        Why does Tree DP need state PAIRS? Single value loses critical info.
      </div>

      <div className="flex gap-8 items-start flex-wrap justify-center">
        <div>
          <div className="text-xs text-gray-500 text-center mb-2">Chain: 2 - 3 - 4</div>
          <TreeSVG
            tree={chainTree}
            computedNodes={computedNodes}
            currentNodeId={currentStep?.nodeId}
            nodeLabels={wrongLabels}
            width={200}
            height={220}
            labelSide="right"
          />
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4 max-w-xs">
          <div className="text-sm text-gray-300 mb-3">
            <span className="text-red-400 font-bold">Problem:</span> Max non-adjacent sum
          </div>
          <div className="text-xs text-gray-400 space-y-2">
            <div>
              <span className="text-red-400">Wrong:</span> dp[node] = best sum for subtree
            </div>
            <div>
              <span className="text-green-400">Correct:</span> dp[node] = (include, exclude) pair
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-700 text-xs">
            <div className="text-green-400">inc[n] = n.val + exc[children]</div>
            <div className="text-red-400">exc[n] = sum(max(inc,exc) per child)</div>
          </div>
        </div>
      </div>

      {currentStep && (
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-sm text-center px-4 py-3 rounded-lg max-w-lg ${
            currentStep.showsProblem
              ? "bg-red-600/20 border border-red-500/50 text-red-300"
              : "bg-gray-800/50 text-gray-300"
          }`}
        >
          {currentStep.explanation}
        </motion.div>
      )}

      {step >= steps.length && step > 0 && (
        <div className="text-sm text-center bg-green-600/20 px-4 py-3 rounded-lg">
          <span className="text-green-400 font-bold">Key Insight:</span>
          <span className="text-gray-300 ml-2">
            Parent needs to know IF child was included, not just the best value.
          </span>
        </div>
      )}

      <div className="text-xs text-gray-500 text-center">
        Optimal for chain 2-3-4 is 2+4=6 (skip 3). Single-value DP cannot compute this!
      </div>
    </div>
  );
};

const RobberPhase = ({ step, steps, answer }: { step: number; steps: RobberStep[]; answer: number }) => {
  const computedNodes = useMemo(() => {
    const map = new Map<number, { top: string; bottom: string }>();
    for (let s = 0; s < Math.min(step, steps.length); s++) {
      const st = steps[s];
      if (st.phase === "compute") {
        map.set(st.nodeId, { top: `inc=${st.inc}`, bottom: `exc=${st.exc}` });
      }
    }
    return map;
  }, [step, steps]);

  const currentStep = step > 0 && step <= steps.length ? steps[step - 1] : null;
  const isComplete = step >= steps.length && step > 0;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-sm text-gray-400">
        House Robber III: Max sum without adjacent (parent-child) nodes
      </div>

      <TreeSVG
        tree={robberTree}
        computedNodes={computedNodes}
        currentNodeId={currentStep?.nodeId}
      />

      <div className="flex gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-gray-400">Current</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-gray-400">Computed</span>
        </div>
        <div className="text-green-400">inc = include node</div>
        <div className="text-red-400">exc = exclude node</div>
      </div>

      {currentStep && (
        <motion.div
          key={step}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-sm text-center font-mono px-4 py-2 rounded-lg ${
            currentStep.phase === "visit"
              ? "bg-blue-600/20 text-blue-300"
              : "bg-green-600/20 text-green-300"
          }`}
        >
          {currentStep.formula}
        </motion.div>
      )}

      {isComplete && (
        <div className="text-sm text-center bg-green-600/20 px-6 py-3 rounded-lg">
          <div className="text-green-400 font-bold mb-1">
            Answer: max(inc, exc) at root = max(7, 6) = {answer}
          </div>
          <div className="text-gray-400 text-xs">
            Optimal: Root(3) + grandchildren(3+1) = 7
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 text-center max-w-md">
        Postorder traversal: process children BEFORE parent. Each node returns (include, exclude) pair.
      </div>
    </div>
  );
};

const DiameterPhase = ({ step, steps, answer }: { step: number; steps: DiameterStep[]; answer: number }) => {
  const computedNodes = useMemo(() => {
    const map = new Map<number, { top: string; bottom: string }>();
    for (let s = 0; s < Math.min(step, steps.length); s++) {
      const st = steps[s];
      map.set(st.nodeId, { top: `h=${st.height}`, bottom: `path=${st.pathThrough}` });
    }
    return map;
  }, [step, steps]);

  const currentStep = step > 0 && step <= steps.length ? steps[step - 1] : null;
  const isComplete = step >= steps.length && step > 0;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-sm text-gray-400">
        Binary Tree Diameter: Longest path between any two nodes (in edges)
      </div>

      <TreeSVG
        tree={diameterTree}
        computedNodes={computedNodes}
        currentNodeId={currentStep?.nodeId}
      />

      <div className="flex gap-4 text-xs flex-wrap justify-center">
        <div className="text-green-400">h = subtree depth (1 for leaf)</div>
        <div className="text-red-400">path = left_h + right_h (edges through node)</div>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-3 text-xs text-gray-400 max-w-md">
        <div className="font-bold text-white mb-1">Recurrence:</div>
        <div>height[n] = 1 + max(height[left], height[right])</div>
        <div>pathThrough[n] = height[left] + height[right]</div>
        <div className="text-yellow-400 mt-1">diameter = max(pathThrough) across all nodes</div>
      </div>

      {currentStep && (
        <motion.div
          key={step}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-center font-mono bg-gray-800/50 px-4 py-2 rounded-lg text-gray-300"
        >
          {currentStep.formula}
          {currentStep.maxDiameter > 0 && (
            <span className="text-yellow-400 ml-2">| maxDia={currentStep.maxDiameter}</span>
          )}
        </motion.div>
      )}

      {isComplete && (
        <div className="text-sm text-center bg-green-600/20 px-6 py-3 rounded-lg">
          <div className="text-green-400 font-bold mb-1">
            Diameter = {answer} edges
          </div>
          <div className="text-gray-400 text-xs">
            Longest path: 4 - 2 - 1 - 3 or 5 - 2 - 1 - 3 (3 edges)
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 text-center max-w-md">
        Each node reports HEIGHT up to parent. Diameter is tracked globally as max path through any node.
      </div>
    </div>
  );
};

// skipcq: JS-0067
export default function TreeDPVisualizer() {
  const phases: Phase[] = ["why-pairs", "robber", "diameter"];
  const phaseLabels: Record<Phase, string> = {
    "why-pairs": "Why Pairs?",
    robber: "House Robber III",
    diameter: "Tree Diameter",
  };

  const [currentPhase, setCurrentPhase] = useState<Phase>("why-pairs");
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(700);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const whyPairsSteps = useMemo(() => generateWhyPairsSteps(), []);
  const { steps: robberSteps, answer: robberAnswer } = useMemo(() => generateRobberSteps(), []);
  const { steps: diameterSteps, answer: diameterAnswer } = useMemo(() => generateDiameterSteps(), []);

  const getMaxSteps = useCallback(
    (phase: Phase) => {
      if (phase === "why-pairs") return whyPairsSteps.length;
      if (phase === "robber") return robberSteps.length;
      if (phase === "diameter") return diameterSteps.length;
      return 0;
    },
    [whyPairsSteps.length, robberSteps.length, diameterSteps.length]
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
        <div className="text-lg font-medium text-white">Tree DP</div>
        <div className="text-sm text-gray-400">
          Postorder traversal + state pairs for optimal subtree aggregation
        </div>
      </div>

      <div className="flex justify-center mb-6">
        <div className="inline-flex bg-gray-800/50 p-1 rounded-xl flex-wrap justify-center gap-1">
          {phases.map((phase, index) => (
            <button
              key={phase}
              onClick={() => goToPhase(phase)}
              className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentPhase === phase
                  ? "bg-emerald-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-2">
                <span
                  className={`w-5 h-5 flex items-center justify-center rounded-full text-xs ${
                    currentPhase === phase ? "bg-emerald-500" : "bg-gray-700"
                  }`}
                >
                  {index + 1}
                </span>
                {phaseLabels[phase]}
              </span>
            </button>
          ))}
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

      <AnimatePresence mode="wait">
        <motion.div
          key={currentPhase}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {currentPhase === "why-pairs" && <WhyPairsPhase step={step} steps={whyPairsSteps} />}
          {currentPhase === "robber" && <RobberPhase step={step} steps={robberSteps} answer={robberAnswer} />}
          {currentPhase === "diameter" && <DiameterPhase step={step} steps={diameterSteps} answer={diameterAnswer} />}
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 pt-4 border-t border-gray-800 text-sm text-gray-500 text-center">
        House Robber III = {robberAnswer} | Tree Diameter = {diameterAnswer} edges | Chain 2-3-4 = 6
      </div>
    </div>
  );
}
