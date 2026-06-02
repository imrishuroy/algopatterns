"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Stage = "recursion" | "memoization" | "tabulation" | "optimized";

interface StageInfo {
  title: string;
  time: string;
  space: string;
  color: string;
  description: string;
}

const stages: Record<Stage, StageInfo> = {
  recursion: {
    title: "Pure Recursion",
    time: "O(2ⁿ)",
    space: "O(n)",
    color: "red",
    description: "Brute force - every call branches into more calls",
  },
  memoization: {
    title: "Memoization",
    time: "O(n)",
    space: "O(n)",
    color: "yellow",
    description: "Top-down with cache - same subproblem never computed twice",
  },
  tabulation: {
    title: "Tabulation",
    time: "O(n)",
    space: "O(n)",
    color: "blue",
    description: "Bottom-up iteration - no recursion overhead",
  },
  optimized: {
    title: "Space Optimized",
    time: "O(n)",
    space: "O(1)",
    color: "green",
    description: "Only track what we need - minimal memory",
  },
};

const stageOrder: Stage[] = [
  "recursion",
  "memoization",
  "tabulation",
  "optimized",
];

export default function DPTransformationVisualizer() {
  const [currentStage, setCurrentStage] = useState<Stage>("recursion");
  const [isPlaying, setIsPlaying] = useState(false);
  const [step, setStep] = useState(0);
  const [speed, setSpeed] = useState(500);

  const nums = [2, 7, 9, 3, 1];

  const recursionTrace = [
    { call: "rob(0)", action: "enter", depth: 0 },
    { call: "rob(2)", action: "enter", depth: 1, choice: "ROB $2" },
    { call: "rob(4)", action: "enter", depth: 2, choice: "ROB $9" },
    { call: "rob(4)", action: "exit", result: 1, depth: 2 },
    { call: "rob(3)", action: "enter", depth: 2, choice: "SKIP" },
    { call: "rob(3)", action: "exit", result: 3, depth: 2 },
    { call: "rob(2)", action: "exit", result: 10, depth: 1 },
    { call: "rob(1)", action: "enter", depth: 1, choice: "SKIP" },
    {
      call: "rob(3)",
      action: "enter",
      depth: 2,
      choice: "ROB $7",
      duplicate: true,
    },
    { call: "rob(3)", action: "exit", result: 3, depth: 2, duplicate: true },
    {
      call: "rob(2)",
      action: "enter",
      depth: 2,
      choice: "SKIP",
      duplicate: true,
    },
    { call: "rob(2)", action: "exit", result: 10, depth: 2, duplicate: true },
    { call: "rob(1)", action: "exit", result: 10, depth: 1 },
    { call: "rob(0)", action: "exit", result: 12, depth: 0 },
  ];

  const memoTrace: {
    call: string;
    action: string;
    memo: Record<number, number>;
    result?: number;
  }[] = [
    { call: "rob(0)", action: "compute", memo: {} },
    { call: "rob(2)", action: "compute", memo: {} },
    { call: "rob(4)", action: "compute", memo: {}, result: 1 },
    { call: "rob(3)", action: "compute", memo: { 4: 1 }, result: 3 },
    { call: "rob(2)", action: "store", memo: { 4: 1, 3: 3 }, result: 10 },
    { call: "rob(1)", action: "compute", memo: { 4: 1, 3: 3, 2: 10 } },
    {
      call: "rob(3)",
      action: "cache-hit",
      memo: { 4: 1, 3: 3, 2: 10 },
      result: 3,
    },
    {
      call: "rob(2)",
      action: "cache-hit",
      memo: { 4: 1, 3: 3, 2: 10 },
      result: 10,
    },
    {
      call: "rob(1)",
      action: "store",
      memo: { 4: 1, 3: 3, 2: 10, 1: 10 },
      result: 10,
    },
    {
      call: "rob(0)",
      action: "store",
      memo: { 4: 1, 3: 3, 2: 10, 1: 10, 0: 12 },
      result: 12,
    },
  ];

  const tabulationTrace = [
    { i: 4, dp: [null, null, null, null, 1], formula: "dp[4] = nums[4] = 1" },
    { i: 3, dp: [null, null, null, 3, 1], formula: "dp[3] = max(3+0, 1) = 3" },
    { i: 2, dp: [null, null, 10, 3, 1], formula: "dp[2] = max(9+1, 3) = 10" },
    { i: 1, dp: [null, 10, 10, 3, 1], formula: "dp[1] = max(7+3, 10) = 10" },
    { i: 0, dp: [12, 10, 10, 3, 1], formula: "dp[0] = max(2+10, 10) = 12" },
  ];

  const optimizedTrace = [
    { i: 4, next1: 1, next2: 0, formula: "curr = max(1+0, 0) = 1" },
    { i: 3, next1: 3, next2: 1, formula: "curr = max(3+0, 1) = 3" },
    { i: 2, next1: 10, next2: 3, formula: "curr = max(9+1, 3) = 10" },
    { i: 1, next1: 10, next2: 10, formula: "curr = max(7+3, 10) = 10" },
    { i: 0, next1: 12, next2: 10, formula: "curr = max(2+10, 10) = 12" },
  ];

  const getTrace = () => {
    switch (currentStage) {
      case "recursion":
        return recursionTrace;
      case "memoization":
        return memoTrace;
      case "tabulation":
        return tabulationTrace;
      case "optimized":
        return optimizedTrace;
    }
  };

  const trace = getTrace();

  useEffect(() => {
    if (!isPlaying || step >= trace.length) {
      if (step >= trace.length) setIsPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      setStep((s) => s + 1);
    }, speed);

    return () => clearTimeout(timer);
  }, [isPlaying, step, trace.length, speed]);

  const reset = () => {
    setStep(0);
    setIsPlaying(false);
  };

  const stageInfo = stages[currentStage];

  const renderRecursion = () => {
    const currentTrace = trace.slice(0, step) as typeof recursionTrace;
    const callStack: string[] = [];
    const completed: { call: string; result: number }[] = [];

    for (const t of currentTrace) {
      if (t.action === "enter") {
        callStack.push(t.call);
      } else if (t.action === "exit") {
        callStack.pop();
        completed.push({ call: t.call, result: t.result! });
      }
    }

    const currentStep = step < trace.length ? trace[step] : null;

    return (
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-white font-medium mb-2">Call Stack</h4>
          <div className="bg-gray-800/50 rounded-lg p-4 min-h-[200px]">
            <AnimatePresence>
              {callStack.map((call, depth) => (
                <motion.div
                  // eslint-disable-next-line react/no-array-index-key -- depth is part of call stack identity
                  key={`stack-${call}-depth${depth}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`p-2 mb-2 rounded font-mono text-sm ${
                    depth === callStack.length - 1
                      ? "bg-yellow-500/20 border border-yellow-500 text-yellow-400"
                      : "bg-gray-700/50 text-gray-400"
                  }`}
                >
                  {"  ".repeat(depth)}
                  {call}
                </motion.div>
              ))}
            </AnimatePresence>
            {callStack.length === 0 && (
              <div className="text-gray-600 text-sm">Stack empty</div>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-white font-medium mb-2">Computed Results</h4>
          <div className="bg-gray-800/50 rounded-lg p-4 min-h-[200px]">
            <AnimatePresence>
              {completed.slice(-5).map((c) => (
                <motion.div
                  key={`result-${c.call}-${c.result}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-2 mb-2 rounded font-mono text-sm ${
                    (currentTrace[step - 1] as any)?.duplicate
                      ? "bg-red-500/20 border border-red-500 text-red-400"
                      : "bg-green-500/20 text-green-400"
                  }`}
                >
                  {c.call} = {c.result}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {currentStep && (currentStep as any).duplicate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
          >
            <span className="text-red-400 font-medium">Duplicate work!</span>
            <span className="text-red-300 ml-2">
              {(currentStep as any).call} is being computed again
            </span>
          </motion.div>
        )}
      </div>
    );
  };

  const renderMemoization = () => {
    const currentTrace = trace.slice(0, step) as typeof memoTrace;
    const lastStep = currentTrace[currentTrace.length - 1];
    const memo = lastStep?.memo || {};

    return (
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-white font-medium mb-2">Execution</h4>
          <div className="bg-gray-800/50 rounded-lg p-4 min-h-[200px] space-y-2">
            <AnimatePresence>
              {currentTrace.slice(-6).map((t) => (
                <motion.div
                  key={`trace-${t.call}-${t.action}-${t.result ?? 'pending'}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-2 rounded font-mono text-sm ${
                    t.action === "cache-hit"
                      ? "bg-purple-500/20 border border-purple-500 text-purple-400"
                      : t.action === "store"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-gray-700/50 text-gray-400"
                  }`}
                >
                  {t.call}
                  {t.action === "cache-hit" && (
                    <span className="ml-2 text-purple-300">CACHE HIT!</span>
                  )}
                  {t.result !== undefined && (
                    <span className="ml-2">= {t.result}</span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div>
          <h4 className="text-white font-medium mb-2">Memo Cache</h4>
          <div className="bg-gray-800/50 rounded-lg p-4 min-h-[200px]">
            <div className="grid grid-cols-5 gap-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={`memo-${i}`}
                  animate={{
                    scale: memo[i] !== undefined ? 1 : 0.9,
                    opacity: memo[i] !== undefined ? 1 : 0.4,
                  }}
                  className={`p-3 rounded-lg text-center ${
                    memo[i] !== undefined
                      ? "bg-purple-500/20 border border-purple-500"
                      : "bg-gray-700/30 border border-gray-700"
                  }`}
                >
                  <div className="text-xs text-gray-500 mb-1">memo[{i}]</div>
                  <div
                    className={`font-mono font-bold ${
                      memo[i] !== undefined
                        ? "text-purple-400"
                        : "text-gray-600"
                    }`}
                  >
                    {memo[i] ?? "—"}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-4 p-2 bg-purple-500/10 rounded text-sm text-purple-300">
              Cache size: {Object.keys(memo).length} / 5
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTabulation = () => {
    const currentTrace = trace.slice(0, step) as typeof tabulationTrace;
    const lastStep = currentTrace[currentTrace.length - 1];
    const dp = lastStep?.dp || [null, null, null, null, null];
    const currentI = lastStep?.i;

    return (
      <div>
        <h4 className="text-white font-medium mb-2">
          DP Table (filling right to left)
        </h4>

        <div className="bg-gray-800/50 rounded-lg p-4">
          {/* Index row */}
          <div className="grid grid-cols-5 gap-2 mb-2">
            {nums.map((num, position) => (
              <div
                // eslint-disable-next-line react/no-array-index-key -- static array with fixed positions
                key={`tab-idx-pos${position}-val${num}`}
                className="text-center text-xs text-gray-500"
              >
                i = {position}
              </div>
            ))}
          </div>

          {/* Values row */}
          <div className="grid grid-cols-5 gap-2 mb-4">
            {nums.map((num, position) => (
              <div
                // eslint-disable-next-line react/no-array-index-key -- static array with fixed positions
                key={`tab-val-pos${position}-$${num}`}
                className="p-2 bg-gray-700/30 rounded text-center"
              >
                <span className="text-gray-400 text-sm">${num}</span>
              </div>
            ))}
          </div>

          {/* DP row */}
          <div className="grid grid-cols-5 gap-2">
            {dp.map((val, position) => (
              <motion.div
                // eslint-disable-next-line react/no-array-index-key -- dp array position is semantically meaningful
                key={`tab-dp-pos${position}-${val ?? 'null'}`}
                animate={{
                  scale: currentI === position ? 1.1 : 1,
                  borderColor:
                    currentI === position
                      ? "#3b82f6"
                      : val !== null
                        ? "#22c55e"
                        : "#374151",
                }}
                className={`p-3 rounded-lg text-center border-2 ${
                  val !== null ? "bg-green-500/20" : "bg-gray-700/30"
                }`}
              >
                <div className="text-xs text-gray-500 mb-1">dp[{position}]</div>
                <motion.div
                  key={val}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`font-mono font-bold text-lg ${
                    val !== null ? "text-green-400" : "text-gray-600"
                  }`}
                >
                  {val ?? "—"}
                </motion.div>
              </motion.div>
            ))}
          </div>

          {lastStep && (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg"
            >
              <code className="text-blue-400 font-mono text-sm">
                {lastStep.formula}
              </code>
            </motion.div>
          )}
        </div>
      </div>
    );
  };

  const renderOptimized = () => {
    const currentTrace = trace.slice(0, step) as typeof optimizedTrace;
    const lastStep = currentTrace[currentTrace.length - 1];

    return (
      <div>
        <h4 className="text-white font-medium mb-2">Two Variables Only!</h4>

        <div className="bg-gray-800/50 rounded-lg p-4">
          {/* Array reference */}
          <div className="grid grid-cols-5 gap-2 mb-4">
            {nums.map((num, position) => (
              <motion.div
                // eslint-disable-next-line react/no-array-index-key -- static array with fixed positions
                key={`opt-pos${position}-$${num}`}
                animate={{
                  scale: lastStep?.i === position ? 1.1 : 1,
                  borderColor: lastStep?.i === position ? "#22c55e" : "#374151",
                }}
                className="p-2 bg-gray-700/30 rounded text-center border-2"
              >
                <div className="text-xs text-gray-500">nums[{position}]</div>
                <span className="text-gray-400 font-mono">${num}</span>
              </motion.div>
            ))}
          </div>

          {/* Variables */}
          <div className="flex justify-center gap-8 my-6">
            <motion.div
              animate={{ scale: lastStep ? 1.1 : 1 }}
              className="p-4 bg-green-500/20 border-2 border-green-500 rounded-xl text-center min-w-[120px]"
            >
              <div className="text-xs text-green-400 mb-1">next1</div>
              <div className="text-3xl font-mono font-bold text-green-400">
                {lastStep?.next1 ?? 0}
              </div>
              <div className="text-xs text-gray-500 mt-1">dp[i+1]</div>
            </motion.div>

            <motion.div
              animate={{ scale: lastStep ? 1.1 : 1 }}
              className="p-4 bg-blue-500/20 border-2 border-blue-500 rounded-xl text-center min-w-[120px]"
            >
              <div className="text-xs text-blue-400 mb-1">next2</div>
              <div className="text-3xl font-mono font-bold text-blue-400">
                {lastStep?.next2 ?? 0}
              </div>
              <div className="text-xs text-gray-500 mt-1">dp[i+2]</div>
            </motion.div>
          </div>

          {lastStep && (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-center"
            >
              <code className="text-green-400 font-mono text-sm">
                {lastStep.formula}
              </code>
            </motion.div>
          )}

          <div className="mt-4 p-3 bg-gray-700/30 rounded-lg text-center">
            <span className="text-gray-400">Space used: </span>
            <span className="text-green-400 font-bold">2 variables</span>
            <span className="text-gray-500"> (constant space!)</span>
          </div>
        </div>
      </div>
    );
  };

  const renderVisualization = () => {
    switch (currentStage) {
      case "recursion":
        return renderRecursion();
      case "memoization":
        return renderMemoization();
      case "tabulation":
        return renderTabulation();
      case "optimized":
        return renderOptimized();
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case "red":
        return "from-red-500/20 to-red-500/5 border-red-500/30";
      case "yellow":
        return "from-yellow-500/20 to-yellow-500/5 border-yellow-500/30";
      case "blue":
        return "from-blue-500/20 to-blue-500/5 border-blue-500/30";
      case "green":
        return "from-green-500/20 to-green-500/5 border-green-500/30";
      default:
        return "from-gray-500/20 to-gray-500/5 border-gray-500/30";
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div
        className={`p-4 bg-gradient-to-r ${getColorClasses(stageInfo.color)} border-b border-gray-800`}
      >
        <h3 className="text-lg font-semibold text-white">
          DP Transformation: Recursion → O(1) Space
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          House Robber: [{nums.join(", ")}] → Maximum: $12
        </p>
      </div>

      <div className="p-4">
        {/* Stage Selector */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {stageOrder.map((stage, idx) => (
            <button
              key={stage}
              onClick={() => {
                setCurrentStage(stage);
                reset();
              }}
              className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                currentStage === stage
                  ? `bg-${stages[stage].color}-500/20 border border-${stages[stage].color}-500 text-white`
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
              style={{
                backgroundColor:
                  currentStage === stage
                    ? `var(--color-${stages[stage].color})`
                    : undefined,
              }}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                  currentStage === stage ? "bg-white/20" : "bg-gray-700"
                }`}
              >
                {idx + 1}
              </span>
              {stages[stage].title}
            </button>
          ))}
        </div>

        {/* Stage Info */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">Time</div>
            <div
              className={`font-mono font-bold ${
                stageInfo.time === "O(2ⁿ)" ? "text-red-400" : "text-green-400"
              }`}
            >
              {stageInfo.time}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">Space</div>
            <div
              className={`font-mono font-bold ${
                stageInfo.space === "O(1)"
                  ? "text-green-400"
                  : "text-yellow-400"
              }`}
            >
              {stageInfo.space}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">Progress</div>
            <div className="font-mono font-bold text-white">
              {step} / {trace.length}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              isPlaying
                ? "bg-yellow-500 text-black hover:bg-yellow-400"
                : "bg-green-500 text-white hover:bg-green-400"
            }`}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            onClick={() => step < trace.length && setStep((s) => s + 1)}
            disabled={step >= trace.length}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition disabled:opacity-50"
          >
            Step
          </button>
          <button
            onClick={reset}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition"
          >
            Reset
          </button>
          <div className="flex items-center gap-2 ml-4">
            <span className="text-gray-400 text-sm">Speed:</span>
            <input
              type="range"
              min="200"
              max="1000"
              step="100"
              value={1200 - speed}
              onChange={(e) => setSpeed(1200 - Number(e.target.value))}
              className="w-20 accent-indigo-500"
            />
          </div>
        </div>

        {/* Visualization */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderVisualization()}
          </motion.div>
        </AnimatePresence>

        {/* Description */}
        <motion.div
          key={currentStage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`mt-4 p-3 rounded-lg border ${getColorClasses(stageInfo.color)}`}
        >
          <p className="text-gray-300 text-sm">
            <strong className="text-white">{stageInfo.title}:</strong>{" "}
            {stageInfo.description}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
