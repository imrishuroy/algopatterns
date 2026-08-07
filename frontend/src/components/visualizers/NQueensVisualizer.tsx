"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

type CellState = "empty" | "queen" | "attack" | "trying" | "conflict";

interface BoardSnapshot {
  cells: CellState[][];
  queens: [number, number][];
}

interface Step {
  board: BoardSnapshot;
  row: number;
  col: number;
  action: "try" | "place" | "conflict" | "backtrack" | "solution";
  message: string;
  conflictReason?: string;
}

// Controls component matching other visualizers
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
                  ? "bg-emerald-600 text-white"
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

// Board cell component
const Cell = ({
  row,
  col,
  state,
  size,
  isCurrent,
  n,
}: {
  row: number;
  col: number;
  state: CellState;
  size: number;
  isCurrent: boolean;
  n: number;
}) => {
  const isLight = (row + col) % 2 === 0;

  const getBgColor = () => {
    if (state === "queen") return "#22c55e"; // green-500
    if (state === "conflict") return "#ef4444"; // red-500
    if (state === "trying") return "#eab308"; // yellow-500
    if (state === "attack") return isLight ? "#7f1d1d" : "#991b1b"; // red-900/red-800
    return isLight ? "#4b5563" : "#374151"; // gray-600/gray-700
  };

  return (
    <motion.div
      animate={{
        backgroundColor: getBgColor(),
        scale: isCurrent ? 1.05 : 1,
      }}
      transition={{ duration: 0.15 }}
      className="flex items-center justify-center relative"
      style={{
        width: size,
        height: size,
        boxShadow: isCurrent ? "0 0 12px rgba(234, 179, 8, 0.6)" : "none",
      }}
    >
      {state === "queen" && (
        <motion.span
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="text-white drop-shadow-lg"
          style={{ fontSize: size * 0.6 }}
        >
          ♛
        </motion.span>
      )}
      {state === "conflict" && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-white font-bold"
          style={{ fontSize: size * 0.5 }}
        >
          ✗
        </motion.span>
      )}
      {state === "trying" && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-yellow-900 font-bold"
          style={{ fontSize: size * 0.4 }}
        >
          ?
        </motion.span>
      )}
      {/* Row/col labels */}
      {col === 0 && (
        <span className="absolute -left-6 text-xs text-gray-500 font-mono">
          {row}
        </span>
      )}
      {row === n - 1 && (
        <span className="absolute -bottom-5 text-xs text-gray-500 font-mono">
          {col}
        </span>
      )}
    </motion.div>
  );
};

// skipcq: JS-0067
export default function NQueensVisualizer() {
  const [n, setN] = useState(4);
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(400);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate all steps for the N-Queens solution
  const steps = useMemo(() => {
    const allSteps: Step[] = [];

    const createEmptyBoard = (): BoardSnapshot => ({
      cells: Array(n)
        .fill(null)
        .map(() => Array(n).fill("empty" as CellState)),
      queens: [],
    });

    const copyBoard = (b: BoardSnapshot): BoardSnapshot => ({
      cells: b.cells.map((row) => [...row]),
      queens: [...b.queens],
    });

    const markAttacks = (
      board: BoardSnapshot,
      row: number,
      col: number
    ): BoardSnapshot => {
      const newBoard = copyBoard(board);
      // Mark cells under attack by this queen
      for (let c = 0; c < n; c++) {
        if (c !== col && newBoard.cells[row][c] === "empty") {
          newBoard.cells[row][c] = "attack";
        }
      }
      for (let r = 0; r < n; r++) {
        if (r !== row && newBoard.cells[r][col] === "empty") {
          newBoard.cells[r][col] = "attack";
        }
      }
      // Diagonals
      for (let i = 1; i < n; i++) {
        if (
          row - i >= 0 &&
          col - i >= 0 &&
          newBoard.cells[row - i][col - i] === "empty"
        ) {
          newBoard.cells[row - i][col - i] = "attack";
        }
        if (
          row - i >= 0 &&
          col + i < n &&
          newBoard.cells[row - i][col + i] === "empty"
        ) {
          newBoard.cells[row - i][col + i] = "attack";
        }
        if (
          row + i < n &&
          col - i >= 0 &&
          newBoard.cells[row + i][col - i] === "empty"
        ) {
          newBoard.cells[row + i][col - i] = "attack";
        }
        if (
          row + i < n &&
          col + i < n &&
          newBoard.cells[row + i][col + i] === "empty"
        ) {
          newBoard.cells[row + i][col + i] = "attack";
        }
      }
      return newBoard;
    };

    const isSafe = (
      board: BoardSnapshot,
      row: number,
      col: number
    ): { safe: boolean; reason?: string } => {
      // Check column
      for (let i = 0; i < row; i++) {
        if (board.cells[i][col] === "queen") {
          return {
            safe: false,
            reason: `Column ${col} blocked by queen at row ${i}`,
          };
        }
      }
      // Check upper-left diagonal
      for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
        if (board.cells[i][j] === "queen") {
          return {
            safe: false,
            reason: `Diagonal ↖ blocked by queen at (${i}, ${j})`,
          };
        }
      }
      // Check upper-right diagonal
      for (let i = row - 1, j = col + 1; i >= 0 && j < n; i--, j++) {
        if (board.cells[i][j] === "queen") {
          return {
            safe: false,
            reason: `Diagonal ↗ blocked by queen at (${i}, ${j})`,
          };
        }
      }
      return { safe: true };
    };

    const solve = (board: BoardSnapshot, row: number) => {
      if (row === n) {
        allSteps.push({
          board: copyBoard(board),
          row: -1,
          col: -1,
          action: "solution",
          message: `Found a valid solution with ${n} queens!`,
        });
        return;
      }

      for (let col = 0; col < n; col++) {
        // Show trying this cell
        const tryBoard = copyBoard(board);
        tryBoard.cells[row][col] = "trying";
        allSteps.push({
          board: tryBoard,
          row,
          col,
          action: "try",
          message: `Row ${row}: Can we place a queen at column ${col}?`,
        });

        const { safe, reason } = isSafe(board, row, col);

        if (!safe) {
          // Show conflict
          const conflictBoard = copyBoard(board);
          conflictBoard.cells[row][col] = "conflict";
          allSteps.push({
            board: conflictBoard,
            row,
            col,
            action: "conflict",
            message: `No! ${reason}`,
            conflictReason: reason,
          });
          continue;
        }

        // Place queen
        const placeBoard = copyBoard(board);
        placeBoard.cells[row][col] = "queen";
        placeBoard.queens = [...board.queens, [row, col]];

        // Mark attack paths
        const boardWithAttacks = markAttacks(placeBoard, row, col);

        allSteps.push({
          board: boardWithAttacks,
          row,
          col,
          action: "place",
          message: `Yes! Place queen at (${row}, ${col}). Now try row ${row + 1}.`,
        });

        solve(boardWithAttacks, row + 1);

        // Backtrack
        if (row < n - 1 || col < n - 1) {
          const backtrackBoard = copyBoard(board);
          allSteps.push({
            board: backtrackBoard,
            row,
            col,
            action: "backtrack",
            message: `Backtrack: Remove queen from (${row}, ${col}). Try next column.`,
          });
        }
      }
    };

    // Initial state
    allSteps.push({
      board: createEmptyBoard(),
      row: -1,
      col: -1,
      action: "try",
      message: `Solve ${n}-Queens: Place ${n} queens so none attack each other.`,
    });

    solve(createEmptyBoard(), 0);

    return allSteps;
  }, [n]);

  const maxSteps = steps.length - 1;
  const currentStep = steps[step];

  // Count solutions found so far
  const solutionsFound = useMemo(() => {
    return steps.slice(0, step + 1).filter((s) => s.action === "solution")
      .length;
  }, [steps, step]);

  // Total solutions for this n
  const totalSolutions = useMemo(() => {
    return steps.filter((s) => s.action === "solution").length;
  }, [steps]);

  // Auto-play effect
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

  // Reset when n changes
  const handleNChange = useCallback((newN: number) => {
    setN(newN);
    setStep(0);
    setIsPlaying(false);
  }, []);

  const cellSize = n <= 5 ? 56 : n <= 6 ? 48 : 40;

  return (
    <div className="p-6 bg-gray-900 rounded-xl w-full max-w-4xl mx-auto">
      <div className="text-center mb-4">
        <div className="text-lg font-medium text-white">N-Queens Solver</div>
        <div className="text-sm text-gray-400">
          Place {n} queens on a {n}×{n} board with no conflicts
        </div>
      </div>

      {/* Board size selector */}
      <div className="flex justify-center gap-2 mb-6">
        <span className="text-gray-400 text-sm self-center mr-2">
          Board size:
        </span>
        {[4, 5, 6, 7, 8].map((size) => (
          <button
            key={size}
            onClick={() => handleNChange(size)}
            className={`w-10 h-10 rounded-lg font-mono text-sm font-medium transition-all ${
              n === size
                ? "bg-emerald-600 text-white ring-2 ring-emerald-400"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
            }`}
          >
            {size}
          </button>
        ))}
      </div>

      {/* Stats display */}
      <div className="flex justify-center gap-6 mb-6">
        <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-4 py-2">
          <span className="text-gray-400 text-sm">Queens placed:</span>
          <span className="text-emerald-400 font-mono text-lg font-bold">
            {currentStep?.board.queens.length ?? 0}
          </span>
          <span className="text-gray-600">/</span>
          <span className="text-gray-400 font-mono">{n}</span>
        </div>
        <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-4 py-2">
          <span className="text-gray-400 text-sm">Solutions:</span>
          <span className="text-emerald-400 font-mono text-lg font-bold">
            {solutionsFound}
          </span>
          <span className="text-gray-600">/</span>
          <span className="text-gray-400 font-mono">{totalSolutions}</span>
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

      {/* Chess board */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`board-${n}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex justify-center mb-6"
        >
          <div className="relative pl-6 pb-6">
            <div
              className="border-2 border-gray-600 rounded-lg overflow-hidden shadow-2xl"
              style={{
                boxShadow: "0 0 40px rgba(16, 185, 129, 0.15)",
              }}
            >
              {currentStep?.board.cells.map((row, rowIdx) => (
                <div key={rowIdx} className="flex">
                  {row.map((cell, colIdx) => (
                    <Cell
                      key={`${rowIdx}-${colIdx}`}
                      row={rowIdx}
                      col={colIdx}
                      state={cell}
                      size={cellSize}
                      isCurrent={
                        rowIdx === currentStep?.row &&
                        colIdx === currentStep?.col
                      }
                      n={n}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Legend */}
      <div className="flex justify-center gap-6 mb-4 text-sm text-gray-400 flex-wrap">
        <span className="flex items-center gap-2">
          <span className="w-5 h-5 bg-green-500 rounded flex items-center justify-center text-xs">
            ♛
          </span>
          queen
        </span>
        <span className="flex items-center gap-2">
          <span className="w-5 h-5 bg-yellow-500 rounded flex items-center justify-center text-xs text-yellow-900 font-bold">
            ?
          </span>
          trying
        </span>
        <span className="flex items-center gap-2">
          <span className="w-5 h-5 bg-red-500 rounded flex items-center justify-center text-xs font-bold">
            ✗
          </span>
          conflict
        </span>
        <span className="flex items-center gap-2">
          <span className="w-5 h-5 bg-red-900 rounded" />
          under attack
        </span>
      </div>

      {/* Message */}
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className={`text-center text-base px-4 py-3 rounded-xl font-mono ${
          currentStep?.action === "solution"
            ? "bg-green-600/20 text-green-400 border border-green-500/30"
            : currentStep?.action === "conflict"
              ? "bg-red-600/20 text-red-400 border border-red-500/30"
              : currentStep?.action === "backtrack"
                ? "bg-orange-600/20 text-orange-400 border border-orange-500/30"
                : "bg-gray-800/50 text-gray-300"
        }`}
      >
        {currentStep?.message}
      </motion.div>

      {/* Solutions gallery */}
      {solutionsFound > 0 && (
        <div className="mt-4 p-4 bg-gray-800/30 rounded-xl">
          <div className="text-sm text-gray-500 mb-3">
            Solutions Found ({solutionsFound} / {totalSolutions}):
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {steps
              .slice(0, step + 1)
              .filter((s) => s.action === "solution")
              .map((sol, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-2 bg-green-600/20 border border-green-500/40 rounded-lg"
                >
                  <div
                    className="grid gap-0.5"
                    style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}
                  >
                    {sol.board.cells.map((row, r) =>
                      row.map((cell, c) => (
                        <div
                          key={`${r}-${c}`}
                          className={`w-3 h-3 rounded-sm ${
                            cell === "queen"
                              ? "bg-green-500"
                              : (r + c) % 2 === 0
                                ? "bg-gray-500"
                                : "bg-gray-600"
                          }`}
                        />
                      ))
                    )}
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      )}

      {/* Done message */}
      {step >= maxSteps && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-base text-center bg-green-600/20 px-4 py-3 rounded-xl mt-4"
        >
          <span className="text-green-400 font-bold">
            Complete! Found all {totalSolutions} solutions for {n}-Queens
          </span>
        </motion.div>
      )}

      {/* Key insight */}
      <div className="mt-4 pt-4 border-t border-gray-800 text-sm text-gray-500 text-center">
        <span className="text-emerald-400">Key insight:</span> Check column
        (col), main diagonal (row-col), and anti-diagonal (row+col) constraints
        before placing each queen
      </div>
    </div>
  );
}
