"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";

interface SearchStep {
  row: number;
  col: number;
  charIndex: number;
  action: "try" | "match" | "mismatch" | "visited" | "found" | "backtrack";
  path: [number, number][];
}

const BOARD = [
  ["A", "B", "C", "E"],
  ["S", "F", "C", "S"],
  ["A", "D", "E", "E"],
];
const WORD = "SEE";

const generateSearchSteps = (): SearchStep[] => {
  const steps: SearchStep[] = [];
  const m = BOARD.length;
  const n = BOARD[0].length;
  const visited: boolean[][] = Array(m)
    .fill(null)
    .map(() => Array(n).fill(false));

  const backtrack = (
    i: number,
    j: number,
    k: number,
    path: [number, number][]
  ): boolean => {
    // Try this cell
    steps.push({
      row: i,
      col: j,
      charIndex: k,
      action: "try",
      path: [...path],
    });

    // Out of bounds
    if (i < 0 || i >= m || j < 0 || j >= n) {
      steps.push({
        row: i,
        col: j,
        charIndex: k,
        action: "mismatch",
        path: [...path],
      });
      return false;
    }

    // Already visited
    if (visited[i][j]) {
      steps.push({
        row: i,
        col: j,
        charIndex: k,
        action: "visited",
        path: [...path],
      });
      return false;
    }

    // Character mismatch
    if (BOARD[i][j] !== WORD[k]) {
      steps.push({
        row: i,
        col: j,
        charIndex: k,
        action: "mismatch",
        path: [...path],
      });
      return false;
    }

    // Match!
    const newPath: [number, number][] = [...path, [i, j]];
    steps.push({
      row: i,
      col: j,
      charIndex: k,
      action: "match",
      path: newPath,
    });

    // Found complete word
    if (k === WORD.length - 1) {
      steps.push({
        row: i,
        col: j,
        charIndex: k,
        action: "found",
        path: newPath,
      });
      return true;
    }

    // Mark visited
    visited[i][j] = true;

    // Explore 4 directions
    const directions = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];
    for (const [di, dj] of directions) {
      if (backtrack(i + di, j + dj, k + 1, newPath)) {
        return true;
      }
    }

    // Backtrack
    visited[i][j] = false;
    steps.push({
      row: i,
      col: j,
      charIndex: k,
      action: "backtrack",
      path: path,
    });

    return false;
  };

  // Try starting from each cell
  outer: for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (BOARD[i][j] === WORD[0]) {
        if (backtrack(i, j, 0, [])) {
          break outer;
        }
      }
    }
  }

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
        className="w-10 h-10 flex items-center justify-center bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        title="Step Back"
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
        className="w-10 h-10 flex items-center justify-center bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        title="Step Forward"
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
        className="w-10 h-10 flex items-center justify-center bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:border-gray-600 transition-all ml-2"
        title="Reset"
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
        <span className="text-xs text-gray-500 uppercase tracking-wide">
          Speed
        </span>
        <div className="flex gap-1">
          {[
            { value: 800, label: "0.5x" },
            { value: 400, label: "1x" },
            { value: 200, label: "2x" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSpeedChange(opt.value)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                speed === opt.value
                  ? "bg-sky-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-3 py-1.5">
        <span className="text-xs text-gray-500 uppercase tracking-wide">
          Step
        </span>
        <span className="text-sm font-mono text-white">
          {step + 1} <span className="text-gray-500">/</span> {total + 1}
        </span>
      </div>
    </div>
  </div>
);

// skipcq: JS-0067
export default function WordSearchVisualizer() {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(400);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const steps = useMemo(() => generateSearchSteps(), []);
  const maxSteps = steps.length - 1;

  const currentStep = steps[step];
  const isFound = currentStep?.action === "found";

  useEffect(() => {
    if (isPlaying && step < maxSteps && !isFound) {
      intervalRef.current = setTimeout(() => {
        setStep((s) => {
          const nextStep = steps[s + 1];
          // Stop when found - handled in callback to avoid sync setState in effect
          if (nextStep?.action === "found") {
            // Use setTimeout to avoid sync setState warning
            setTimeout(() => setIsPlaying(false), 0);
          }
          return s + 1;
        });
      }, speed);
    }
    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [isPlaying, step, speed, maxSteps, isFound, steps]);

  const getCellColor = (row: number, col: number) => {
    if (!currentStep) return "bg-gray-700";

    const isInPath = currentStep.path.some(([r, c]) => r === row && c === col);
    const isCurrent = currentStep.row === row && currentStep.col === col;

    if (isFound && isInPath) {
      return "bg-green-500";
    }

    if (isCurrent) {
      if (currentStep.action === "match") return "bg-green-500";
      if (currentStep.action === "mismatch") return "bg-red-500";
      if (currentStep.action === "visited") return "bg-orange-500";
      if (currentStep.action === "try") return "bg-sky-500";
      if (currentStep.action === "backtrack") return "bg-yellow-500";
    }

    if (isInPath) {
      return "bg-sky-600";
    }

    return "bg-gray-700";
  };

  const getMessage = () => {
    if (!currentStep) return "Click Play to search for the word";

    const { row, col, charIndex, action } = currentStep;
    const rows = BOARD.length;
    const cols = BOARD[0].length;
    const char = row >= 0 && row < rows && col >= 0 && col < cols ? BOARD[row][col] : "?";
    const lookingFor = WORD[charIndex];

    switch (action) {
      case "try":
        return `Trying (${row},${col}): looking for '${lookingFor}'`;
      case "match":
        return `Match! '${char}' at (${row},${col}) = '${lookingFor}'`;
      case "mismatch":
        if (row < 0 || row >= rows || col < 0 || col >= cols) {
          return `Out of bounds (${row},${col})`;
        }
        return `Mismatch: '${char}' ≠ '${lookingFor}'`;
      case "visited":
        return `Already visited (${row},${col}): skip to avoid cycle`;
      case "backtrack":
        return `Backtrack from (${row},${col}): no valid path found`;
      case "found":
        return `Found "${WORD}"! Path: ${currentStep.path.map(([r, c]) => `(${r},${c})`).join(" → ")}`;
      default:
        return "";
    }
  };

  return (
    <div className="p-6 bg-gray-900 rounded-xl w-full max-w-4xl mx-auto">
      <div className="text-center mb-4">
        <div className="text-lg font-medium text-white">
          Word Search: Grid Backtracking
        </div>
        <div className="text-sm text-gray-400">
          Find &quot;{WORD}&quot; in the grid
        </div>
      </div>

      {/* Word display */}
      <div className="flex justify-center gap-2 mb-6">
        {WORD.split("").map((char, idx) => {
          const matched =
            currentStep && currentStep.path.length > idx;
          return (
            <motion.div
              key={idx}
              animate={{
                backgroundColor: matched ? "#10b981" : "#374151",
                scale: matched ? 1.1 : 1,
              }}
              className="w-12 h-12 rounded-lg flex items-center justify-center shadow-lg"
            >
              <span className="text-xl font-bold text-white">{char}</span>
            </motion.div>
          );
        })}
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

      {/* Grid visualization */}
      <div className="flex justify-center mb-6">
        <div className="grid grid-cols-4 gap-2">
          {BOARD.map((row, i) =>
            row.map((cell, j) => (
              <motion.div
                key={`${i}-${j}`}
                animate={{
                  backgroundColor:
                    getCellColor(i, j) === "bg-green-500"
                      ? "#10b981"
                      : getCellColor(i, j) === "bg-red-500"
                        ? "#ef4444"
                        : getCellColor(i, j) === "bg-orange-500"
                          ? "#f97316"
                          : getCellColor(i, j) === "bg-sky-500"
                            ? "#0ea5e9"
                            : getCellColor(i, j) === "bg-sky-600"
                              ? "#0284c7"
                              : getCellColor(i, j) === "bg-yellow-500"
                                ? "#eab308"
                                : "#374151",
                  scale:
                    currentStep?.row === i && currentStep?.col === j ? 1.1 : 1,
                }}
                className="w-14 h-14 rounded-lg flex flex-col items-center justify-center shadow-lg"
              >
                <span className="text-xl font-bold text-white">{cell}</span>
                <span className="text-[10px] text-gray-300">
                  ({i},{j})
                </span>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400 mb-4">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-sky-500 rounded" /> trying
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-green-500 rounded" /> match
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-red-500 rounded" /> mismatch
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-orange-500 rounded" /> visited
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-yellow-500 rounded" /> backtrack
        </span>
      </div>

      {/* Message */}
      <div
        className={`text-center text-sm px-4 py-3 rounded-lg font-mono ${
          isFound
            ? "bg-green-500/20 text-green-400"
            : currentStep?.action === "mismatch"
              ? "bg-red-500/20 text-red-400"
              : currentStep?.action === "visited"
                ? "bg-orange-500/20 text-orange-400"
                : currentStep?.action === "backtrack"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-gray-800/50 text-gray-400"
        }`}
      >
        {getMessage()}
      </div>

      {/* Current path */}
      <div className="mt-4 p-4 bg-gray-800/30 rounded-lg">
        <div className="text-sm text-gray-500 mb-2">Current Path:</div>
        <div className="flex flex-wrap gap-2 min-h-[32px] items-center">
          {currentStep?.path.map(([r, c], idx) => (
            <React.Fragment key={idx}>
              <span className="px-2 py-1 bg-sky-600/20 border border-sky-500/40 rounded text-sky-400 text-sm font-mono">
                {BOARD[r][c]}({r},{c})
              </span>
              {idx < currentStep.path.length - 1 && (
                <span className="text-gray-500">→</span>
              )}
            </React.Fragment>
          ))}
          {(!currentStep || currentStep.path.length === 0) && (
            <span className="text-gray-500 text-sm">Empty</span>
          )}
        </div>
      </div>

      {/* Done message */}
      {isFound && (
        <div className="text-sm text-center bg-green-600/20 px-4 py-2 rounded-lg mt-4">
          <span className="text-green-400 font-bold">
            Found &quot;{WORD}&quot;! Word exists in the grid.
          </span>
        </div>
      )}

      {/* Key insight */}
      <div className="mt-4 pt-4 border-t border-gray-800 text-sm text-gray-500 text-center">
        <span className="text-sky-400">Key:</span> Mark cells visited with
        &apos;#&apos;, restore after backtracking
      </div>
    </div>
  );
}
