"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useReducer,
  startTransition,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

type BoardState = ("." | "Q" | "X")[][];

interface Step {
  board: BoardState;
  row: number;
  col: number;
  action: "try" | "place" | "conflict" | "backtrack" | "solution";
  message: string;
}

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
export default function NQueensVisualizer() {
  const [{ isPlaying }, dispatch] = useReducer(playReducer, {
    step: 0,
    isPlaying: false,
  });
  const [speed, setSpeed] = useState(600);
  const [n] = useState(4);
  const [board, setBoard] = useState<BoardState>([]);
  const [solutions, setSolutions] = useState<string[][]>([]);
  const [phase, setPhase] = useState<"init" | "running" | "done">("init");
  const [message, setMessage] = useState("Click Play to solve 4-Queens");
  const [stepIndex, setStepIndex] = useState(-1);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentRow, setCurrentRow] = useState(-1);
  const [currentCol, setCurrentCol] = useState(-1);

  const createEmptyBoard = useCallback((): BoardState => {
    return Array(n)
      .fill(null)
      .map(() => Array(n).fill("."));
  }, [n]);

  const copyBoard = (b: BoardState): BoardState => {
    return b.map((row) => [...row]);
  };

  // skipcq: JS-R1005
  const isSafe = useCallback(
    (b: BoardState, row: number, col: number): boolean => {
      // Check column above
      for (let i = 0; i < row; i++) {
        if (b[i][col] === "Q") return false;
      }
      // Check upper-left diagonal
      for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
        if (b[i][j] === "Q") return false;
      }
      // Check upper-right diagonal
      for (let i = row - 1, j = col + 1; i >= 0 && j < n; i--, j++) {
        if (b[i][j] === "Q") return false;
      }
      return true;
    },
    [n]
  );

  const generateSteps = useCallback(() => {
    const allSteps: Step[] = [];
    const emptyBoard = createEmptyBoard();

    function solve(board: BoardState, row: number) {
      if (row === n) {
        allSteps.push({
          board: copyBoard(board),
          row: -1,
          col: -1,
          action: "solution",
          message: "Found a valid solution!",
        });
        return;
      }

      for (let col = 0; col < n; col++) {
        allSteps.push({
          board: copyBoard(board),
          row,
          col,
          action: "try",
          message: `Row ${row}: Try column ${col}`,
        });

        if (!isSafe(board, row, col)) {
          const conflictBoard = copyBoard(board);
          conflictBoard[row][col] = "X";
          allSteps.push({
            board: conflictBoard,
            row,
            col,
            action: "conflict",
            message: `Column ${col} conflicts with existing queen`,
          });
          continue;
        }

        board[row][col] = "Q";
        allSteps.push({
          board: copyBoard(board),
          row,
          col,
          action: "place",
          message: `Place queen at (${row}, ${col})`,
        });

        solve(board, row + 1);

        board[row][col] = ".";
        if (row < n - 1 || col < n - 1) {
          allSteps.push({
            board: copyBoard(board),
            row,
            col,
            action: "backtrack",
            message: `Backtrack: remove queen from (${row}, ${col})`,
          });
        }
      }
    }

    solve(emptyBoard, 0);
    return allSteps;
  }, [n, createEmptyBoard, isSafe]);

  const reset = useCallback(() => {
    setBoard(createEmptyBoard());
    setSolutions([]);
    setPhase("init");
    setMessage("Click Play to solve 4-Queens");
    setStepIndex(-1);
    setSteps(generateSteps());
    setCurrentRow(-1);
    setCurrentCol(-1);
    dispatch({ type: "STOP" });
  }, [createEmptyBoard, generateSteps]);

  useEffect(() => {
    startTransition(() => {
      setBoard(createEmptyBoard());
      setSteps(generateSteps());
    });
  }, [createEmptyBoard, generateSteps]);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (phase === "init") {
        setPhase("running");
        setStepIndex(0);
        const step = steps[0];
        setBoard(step.board);
        setCurrentRow(step.row);
        setCurrentCol(step.col);
        setMessage(step.message);
        return;
      }

      const nextStepIdx = stepIndex + 1;
      if (nextStepIdx >= steps.length) {
        setPhase("done");
        setMessage(`Done! Found ${solutions.length} solutions for ${n}-Queens`);
        dispatch({ type: "STOP" });
        return;
      }

      const step = steps[nextStepIdx];
      setStepIndex(nextStepIdx);
      setBoard(step.board);
      setCurrentRow(step.row);
      setCurrentCol(step.col);
      setMessage(step.message);

      if (step.action === "solution") {
        setSolutions((prev) => [
          ...prev,
          step.board.map((row) => row.join("")),
        ]);
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [isPlaying, phase, stepIndex, steps, n, solutions.length, speed]);

  const getCellColor = (row: number, col: number, cell: string) => {
    if (cell === "Q") return "#22c55e"; // Green for queen
    if (cell === "X") return "#ef4444"; // Red for conflict
    if (row === currentRow && col === currentCol) return "#eab308"; // Yellow for current
    return (row + col) % 2 === 0 ? "#4b5563" : "#374151"; // Checkerboard
  };

  return (
    <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">N-Queens Solver</h3>
        <p className="text-gray-400 text-sm mt-1">
          Place {n} queens on a {n}x{n} board with no conflicts
        </p>
      </div>

      <div className="p-4">
        {/* Controls */}
        <div className="flex items-center gap-2 mb-4">
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
          <div className="flex items-center gap-2 ml-4">
            <span className="text-gray-400 text-sm">Speed:</span>
            <input
              type="range"
              min="300"
              max="1000"
              step="100"
              value={1300 - speed}
              onChange={(e) => setSpeed(1300 - Number(e.target.value))}
              className="w-20 accent-emerald-500"
            />
          </div>
        </div>

        {/* Chess board */}
        <div className="mb-4 flex justify-center">
          <div className="inline-block border-2 border-gray-600 rounded-md overflow-hidden">
            {board.map((row, rowIdx) => (
              <div key={rowIdx} className="flex">
                {row.map((cell, colIdx) => (
                  <motion.div
                    key={colIdx}
                    animate={{
                      backgroundColor: getCellColor(rowIdx, colIdx, cell),
                    }}
                    className="w-12 h-12 flex items-center justify-center text-2xl"
                  >
                    {cell === "Q" && <span>♛</span>}
                    {cell === "X" && <span className="text-red-300">✗</span>}
                  </motion.div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mb-4 flex gap-4 justify-center text-xs">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-md bg-green-500 flex items-center justify-center text-xs">
              ♛
            </div>
            <span className="text-gray-400">Queen</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-md bg-yellow-500" />
            <span className="text-gray-400">Trying</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-md bg-red-500 flex items-center justify-center text-xs">
              ✗
            </div>
            <span className="text-gray-400">Conflict</span>
          </div>
        </div>

        {/* Solutions found */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">
            Solutions Found: {solutions.length}
          </div>
          <div className="flex gap-2 flex-wrap">
            <AnimatePresence>
              {solutions.map((sol, idx) => (
                <motion.div
                  key={`solution-${sol.join("")}-${idx}`}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-2 bg-green-500/20 border border-green-500/50 rounded-md"
                >
                  <div className="grid grid-cols-4 gap-0.5">
                    {sol.map((row, r) => (
                      <React.Fragment key={`r-${r}`}>
                        {row.split("").map((cell, c) => (
                          <div
                            key={`c-${c}`}
                            className={`w-3 h-3 ${
                              cell === "Q" ? "bg-green-500" : "bg-gray-600"
                            }`}
                          />
                        ))}
                      </React.Fragment>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
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

        {/* Constraints explanation */}
        <div className="mt-4 p-3 bg-gray-800/30 rounded-md text-sm text-gray-400">
          <p>
            <strong className="text-emerald-400">Constraint Checks:</strong>{" "}
            Same column (row-col), main diagonal (row-col constant),
            anti-diagonal (row+col constant).
          </p>
        </div>
      </div>
    </div>
  );
}
