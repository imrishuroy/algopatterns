"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Problem = "lcs" | "edit-distance" | "grid-paths";

interface DPTableVisualizerProps {
  problem?: Problem;
}

export default function DPTableVisualizer({
  problem: initialProblem = "lcs",
}: DPTableVisualizerProps) {
  const [problem, setProblem] = useState<Problem>(initialProblem);
  const [isPlaying, setIsPlaying] = useState(false);
  const [step, setStep] = useState(0);
  const [speed, setSpeed] = useState(400);
  const [highlightedCells, setHighlightedCells] = useState<Set<string>>(
    new Set()
  );
  const [currentCell, setCurrentCell] = useState<string | null>(null);
  const [arrows, setArrows] = useState<{ from: string; to: string }[]>([]);

  const problems = {
    lcs: {
      title: "Longest Common Subsequence",
      s1: "ABCD",
      s2: "AEBD",
      description: "Find longest subsequence present in both strings",
    },
    "edit-distance": {
      title: "Edit Distance",
      s1: "CAT",
      s2: "CUT",
      description: "Minimum operations to transform s1 → s2",
    },
    "grid-paths": {
      title: "Unique Paths",
      rows: 4,
      cols: 4,
      description: "Count paths from top-left to bottom-right",
    },
  };

  const generateLCSSteps = () => {
    const s1 = problems["lcs"].s1;
    const s2 = problems["lcs"].s2;
    const m = s1.length;
    const n = s2.length;
    const steps: {
      i: number;
      j: number;
      value: number;
      formula: string;
      match?: boolean;
    }[] = [];

    for (let i = 0; i <= m; i++) {
      for (let j = 0; j <= n; j++) {
        if (i === 0 || j === 0) {
          steps.push({ i, j, value: 0, formula: "Base case: 0" });
        } else if (s1[i - 1] === s2[j - 1]) {
          const prev = steps.find((s) => s.i === i - 1 && s.j === j - 1);
          steps.push({
            i,
            j,
            value: (prev?.value || 0) + 1,
            formula: `'${s1[i - 1]}' = '${s2[j - 1]}' → dp[${i - 1}][${j - 1}] + 1 = ${(prev?.value || 0) + 1}`,
            match: true,
          });
        } else {
          const up = steps.find((s) => s.i === i - 1 && s.j === j);
          const left = steps.find((s) => s.i === i && s.j === j - 1);
          const maxVal = Math.max(up?.value || 0, left?.value || 0);
          steps.push({
            i,
            j,
            value: maxVal,
            formula: `'${s1[i - 1]}' ≠ '${s2[j - 1]}' → max(${up?.value || 0}, ${left?.value || 0}) = ${maxVal}`,
          });
        }
      }
    }
    return steps;
  };

  const generateEditDistanceSteps = () => {
    const s1 = problems["edit-distance"].s1;
    const s2 = problems["edit-distance"].s2;
    const m = s1.length;
    const n = s2.length;
    const steps: {
      i: number;
      j: number;
      value: number;
      formula: string;
      operation?: string;
    }[] = [];

    for (let i = 0; i <= m; i++) {
      for (let j = 0; j <= n; j++) {
        if (i === 0) {
          steps.push({
            i,
            j,
            value: j,
            formula: `Insert ${j} chars`,
            operation: j > 0 ? "insert" : "",
          });
        } else if (j === 0) {
          steps.push({
            i,
            j,
            value: i,
            formula: `Delete ${i} chars`,
            operation: i > 0 ? "delete" : "",
          });
        } else if (s1[i - 1] === s2[j - 1]) {
          const diag = steps.find((s) => s.i === i - 1 && s.j === j - 1);
          steps.push({
            i,
            j,
            value: diag?.value || 0,
            formula: `'${s1[i - 1]}' = '${s2[j - 1]}' → no operation`,
            operation: "match",
          });
        } else {
          const diag = steps.find((s) => s.i === i - 1 && s.j === j - 1);
          const up = steps.find((s) => s.i === i - 1 && s.j === j);
          const left = steps.find((s) => s.i === i && s.j === j - 1);
          const minVal =
            Math.min(diag?.value || 0, up?.value || 0, left?.value || 0) + 1;
          let op = "replace";
          if ((up?.value || 0) + 1 === minVal) op = "delete";
          if ((left?.value || 0) + 1 === minVal) op = "insert";
          steps.push({
            i,
            j,
            value: minVal,
            formula: `min(replace, delete, insert) + 1 = ${minVal}`,
            operation: op,
          });
        }
      }
    }
    return steps;
  };

  const generateGridSteps = () => {
    const { rows, cols } = problems["grid-paths"];
    const steps: { i: number; j: number; value: number; formula: string }[] =
      [];

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (i === 0 || j === 0) {
          steps.push({ i, j, value: 1, formula: "Edge: only 1 path" });
        } else {
          const up = steps.find((s) => s.i === i - 1 && s.j === j);
          const left = steps.find((s) => s.i === i && s.j === j - 1);
          steps.push({
            i,
            j,
            value: (up?.value || 0) + (left?.value || 0),
            formula: `↑${up?.value || 0} + ←${left?.value || 0} = ${(up?.value || 0) + (left?.value || 0)}`,
          });
        }
      }
    }
    return steps;
  };

  const getSteps = () => {
    switch (problem) {
      case "lcs":
        return generateLCSSteps();
      case "edit-distance":
        return generateEditDistanceSteps();
      case "grid-paths":
        return generateGridSteps();
    }
  };

  const steps = getSteps();
  const currentStepData = steps[step];

  useEffect(() => {
    if (!isPlaying || step >= steps.length) {
      if (step >= steps.length) setIsPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      const s = steps[step];
      setCurrentCell(`${s.i}-${s.j}`);
      setHighlightedCells((prev) => new Set([...prev, `${s.i}-${s.j}`]));
      setStep((st) => st + 1);
    }, speed);

    return () => clearTimeout(timer);
  }, [isPlaying, step, steps, speed]);

  const reset = () => {
    setStep(0);
    setIsPlaying(false);
    setHighlightedCells(new Set());
    setCurrentCell(null);
    setArrows([]);
  };

  const getTableDimensions = () => {
    switch (problem) {
      case "lcs":
        return {
          rows: problems.lcs.s1.length + 1,
          cols: problems.lcs.s2.length + 1,
        };
      case "edit-distance":
        return {
          rows: problems["edit-distance"].s1.length + 1,
          cols: problems["edit-distance"].s2.length + 1,
        };
      case "grid-paths":
        return {
          rows: problems["grid-paths"].rows,
          cols: problems["grid-paths"].cols,
        };
    }
  };

  const { rows, cols } = getTableDimensions();

  const getCellValue = (i: number, j: number) => {
    const cellStep = steps.find((s) => s.i === i && s.j === j);
    const cellIndex = steps.findIndex((s) => s.i === i && s.j === j);
    if (cellIndex < step) return cellStep?.value;
    return null;
  };

  const getCellColor = (i: number, j: number) => {
    const key = `${i}-${j}`;
    if (currentCell === key) return "bg-yellow-500 text-black";

    const cellStep = steps.find((s) => s.i === i && s.j === j) as
      | {
          i: number;
          j: number;
          value: number;
          match?: boolean;
          operation?: string;
        }
      | undefined;
    const cellIndex = steps.findIndex((s) => s.i === i && s.j === j);

    if (cellIndex < step) {
      if (problem === "lcs" && cellStep?.match)
        return "bg-green-500/30 border-green-500 text-green-400";
      if (problem === "edit-distance") {
        if (cellStep?.operation === "match")
          return "bg-green-500/30 border-green-500 text-green-400";
        if (cellStep?.operation === "replace")
          return "bg-orange-500/30 border-orange-500 text-orange-400";
        if (cellStep?.operation === "delete")
          return "bg-red-500/30 border-red-500 text-red-400";
        if (cellStep?.operation === "insert")
          return "bg-blue-500/30 border-blue-500 text-blue-400";
      }
      return "bg-indigo-500/20 border-indigo-500/50 text-indigo-400";
    }

    return "bg-gray-800/50 border-gray-700 text-gray-600";
  };

  const s1 = problem === "grid-paths" ? "" : problems[problem].s1;
  const s2 = problem === "grid-paths" ? "" : problems[problem].s2;

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">
          2D DP Table Visualizer
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Watch the table fill cell by cell
        </p>
      </div>

      <div className="p-4">
        {/* Problem Selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(Object.keys(problems) as Problem[]).map((p) => (
            <button
              key={`problem-${p}`}
              onClick={() => {
                setProblem(p);
                reset();
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                problem === p
                  ? "bg-blue-500 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {problems[p].title}
            </button>
          ))}
        </div>

        {/* Description */}
        <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
          <p className="text-gray-300 text-sm">
            {problems[problem].description}
          </p>
          {problem !== "grid-paths" && (
            <div className="mt-2 flex gap-4 font-mono text-sm">
              <span className="text-indigo-400">s1 = &quot;{s1}&quot;</span>
              <span className="text-purple-400">s2 = &quot;{s2}&quot;</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              isPlaying ? "bg-yellow-500 text-black" : "bg-green-500 text-white"
            }`}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            onClick={() =>
              step < steps.length &&
              setStep((s) => {
                const st = steps[s];
                setCurrentCell(`${st.i}-${st.j}`);
                setHighlightedCells(
                  (prev) => new Set([...prev, `${st.i}-${st.j}`])
                );
                return s + 1;
              })
            }
            disabled={step >= steps.length}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 disabled:opacity-50"
          >
            Step
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
              min="100"
              max="800"
              step="50"
              value={900 - speed}
              onChange={(e) => setSpeed(900 - Number(e.target.value))}
              className="w-20 accent-blue-500"
            />
          </div>
          <div className="ml-auto text-sm text-gray-500">
            Step {step}/{steps.length}
          </div>
        </div>

        {/* DP Table */}
        <div className="overflow-x-auto">
          <div className="inline-block">
            {/* Column headers */}
            {problem !== "grid-paths" && (
              <div className="flex">
                <div className="w-12 h-8" /> {/* Corner */}
                <div className="w-12 h-8 flex items-center justify-center text-gray-500 text-sm">
                  ""
                </div>
                {s2.split("").map((char, j) => (
                  <div
                    key={`col-${char}-${j}`}
                    className="w-12 h-8 flex items-center justify-center text-purple-400 font-mono font-bold"
                  >
                    {char}
                  </div>
                ))}
              </div>
            )}

            {/* Table rows */}
            {Array.from({ length: rows }).map((_, i) => (
              <div key={`row-${i}`} className="flex">
                {/* Row header */}
                {problem !== "grid-paths" && (
                  <div className="w-12 h-12 flex items-center justify-center text-indigo-400 font-mono font-bold">
                    {i === 0 ? '""' : s1[i - 1]}
                  </div>
                )}

                {/* Cells */}
                {Array.from({ length: cols }).map((_, j) => {
                  const value = getCellValue(i, j);
                  const colorClass = getCellColor(i, j);

                  return (
                    <motion.div
                      key={`${i}-${j}`}
                      initial={{ scale: 0.8, opacity: 0.5 }}
                      animate={{
                        scale: currentCell === `${i}-${j}` ? 1.1 : 1,
                        opacity: 1,
                      }}
                      className={`w-12 h-12 border-2 rounded-lg flex items-center justify-center font-mono font-bold text-lg m-0.5 transition-all ${colorClass}`}
                    >
                      <AnimatePresence mode="wait">
                        {value !== null && (
                          <motion.span
                            key={value}
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 30,
                            }}
                          >
                            {value}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Current Step Info */}
        {currentStepData && step > 0 && (
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <span className="text-blue-400 font-mono">
                dp[{steps[step - 1]?.i}][{steps[step - 1]?.j}]
              </span>
              <span className="text-gray-400">→</span>
              <span className="text-white">{steps[step - 1]?.formula}</span>
            </div>
          </motion.div>
        )}

        {/* Legend for Edit Distance */}
        {problem === "edit-distance" && (
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500/30 border border-green-500" />
              <span className="text-gray-400">Match</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-500/30 border border-orange-500" />
              <span className="text-gray-400">Replace</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500/30 border border-red-500" />
              <span className="text-gray-400">Delete</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500/30 border border-blue-500" />
              <span className="text-gray-400">Insert</span>
            </div>
          </div>
        )}

        {/* Final Result */}
        {step >= steps.length && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-center"
          >
            <span className="text-green-400 font-bold text-lg">
              {problem === "lcs" &&
                `LCS Length: ${steps[steps.length - 1]?.value}`}
              {problem === "edit-distance" &&
                `Min Operations: ${steps[steps.length - 1]?.value}`}
              {problem === "grid-paths" &&
                `Total Paths: ${steps[steps.length - 1]?.value}`}
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
