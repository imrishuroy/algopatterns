"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";

interface TrieNodeData {
  children: { [key: string]: TrieNodeData };
  word: string | null;
}

interface SearchStep {
  phase: "start" | "visit" | "found" | "backtrack" | "prune" | "complete";
  cell: [number, number] | null;
  path: [number, number][];
  trieProgress: string;
  foundWords: string[];
  description: string;
  board: string[][];
}

// Build trie from words
const buildTrie = (words: string[]): TrieNodeData => {
  const root: TrieNodeData = { children: {}, word: null };

  for (const word of words) {
    let node = root;
    for (const c of word) {
      if (!node.children[c]) {
        node.children[c] = { children: {}, word: null };
      }
      node = node.children[c];
    }
    node.word = word;
  }

  return root;
};

// Deep clone board
const cloneBoard = (board: string[][]): string[][] => {
  return board.map((row) => [...row]);
};

// Generate search steps for visualization
const generateSteps = (
  initialBoard: string[][],
  words: string[]
): SearchStep[] => {
  const steps: SearchStep[] = [];
  const trie = buildTrie(words);
  const board = cloneBoard(initialBoard);
  const foundWords: string[] = [];

  steps.push({
    phase: "start",
    cell: null,
    path: [],
    trieProgress: "root",
    foundWords: [],
    description: `Starting search for words: [${words.map((w) => `"${w}"`).join(", ")}]`,
    board: cloneBoard(board),
  });

  const dfs = (
    i: number,
    j: number,
    node: TrieNodeData,
    path: [number, number][]
  ): void => {
    // Bounds check
    if (i < 0 || i >= board.length || j < 0 || j >= board[0].length) {
      return;
    }

    const c = board[i][j];

    // Already visited or not in trie
    if (c === "#" || !node.children[c]) {
      if (c !== "#" && !node.children[c]) {
        steps.push({
          phase: "prune",
          cell: [i, j],
          path: [...path],
          trieProgress:
            path.map((p) => initialBoard[p[0]][p[1]]).join("→") || "root",
          foundWords: [...foundWords],
          description: `Cell (${i},${j})='${c}' not in Trie path → prune`,
          board: cloneBoard(board),
        });
      }
      return;
    }

    // Move to next trie node
    const newPath: [number, number][] = [...path, [i, j]];
    const pathStr = newPath.map((p) => initialBoard[p[0]][p[1]]).join("→");
    node = node.children[c];

    steps.push({
      phase: "visit",
      cell: [i, j],
      path: newPath,
      trieProgress: pathStr,
      foundWords: [...foundWords],
      description: `Visit (${i},${j})='${c}' → Trie path: ${pathStr}`,
      board: cloneBoard(board),
    });

    // Found a word!
    if (node.word) {
      foundWords.push(node.word);
      steps.push({
        phase: "found",
        cell: [i, j],
        path: newPath,
        trieProgress: pathStr,
        foundWords: [...foundWords],
        description: `Found word "${node.word}"! Path: ${newPath.map((p) => `(${p[0]},${p[1]})`).join("→")}`,
        board: cloneBoard(board),
      });
      node.word = null; // Prevent duplicates
    }

    // Mark visited
    const original = board[i][j];
    board[i][j] = "#";

    // Explore 4 directions
    dfs(i + 1, j, node, newPath); // down
    dfs(i - 1, j, node, newPath); // up
    dfs(i, j + 1, node, newPath); // right
    dfs(i, j - 1, node, newPath); // left

    // Backtrack
    board[i][j] = original;

    if (path.length > 0) {
      steps.push({
        phase: "backtrack",
        cell: [i, j],
        path: path,
        trieProgress:
          path.map((p) => initialBoard[p[0]][p[1]]).join("→") || "root",
        foundWords: [...foundWords],
        description: `Backtrack from (${i},${j}), restore '${original}'`,
        board: cloneBoard(board),
      });
    }
  };

  // Start DFS from each cell (but limit for visualization)
  let searchCount = 0;
  const maxSearches = 8; // Limit to avoid too many steps

  outer: for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[0].length; j++) {
      const c = board[i][j];
      if (trie.children[c]) {
        searchCount++;
        if (searchCount > maxSearches) break outer;
        dfs(i, j, trie, []);
      }
    }
  }

  steps.push({
    phase: "complete",
    cell: null,
    path: [],
    trieProgress: "",
    foundWords: [...foundWords],
    description: `Search complete! Found ${foundWords.length} word(s): [${foundWords.map((w) => `"${w}"`).join(", ") || "none"}]`,
    board: cloneBoard(initialBoard),
  });

  return steps;
};

// Grid visualization component
const GridVisualization: React.FC<{
  board: string[][];
  currentCell: [number, number] | null;
  path: [number, number][];
  phase: string;
}> = ({ board, currentCell, path, phase }) => {
  const cellSize = 48;

  const isInPath = (i: number, j: number): boolean => {
    return path.some((p) => p[0] === i && p[1] === j);
  };

  const isCurrentCell = (i: number, j: number): boolean => {
    return currentCell !== null && currentCell[0] === i && currentCell[1] === j;
  };

  return (
    <div className="inline-block">
      {board.map((row, i) => (
        <div key={i} className="flex">
          {row.map((cell, j) => {
            const isCurrent = isCurrentCell(i, j);
            const inPath = isInPath(i, j);
            const isVisited = cell === "#";

            let bgColor = "var(--bg-elevated)";
            let textColor = "var(--text-1)";

            if (isCurrent && phase === "found") {
              bgColor = "#22c55e";
              textColor = "white";
            } else if (isCurrent) {
              bgColor = "var(--accent-1)";
              textColor = "white";
            } else if (inPath) {
              bgColor = "var(--accent-2)";
              textColor = "white";
              /* v8 ignore start -- visual state rarely reached in step navigation */
            } else if (isVisited) {
              bgColor = "var(--bg-surface)";
              textColor = "var(--text-3)";
              /* v8 ignore stop */
            }

            return (
              <motion.div
                key={`${i}-${j}`}
                className="flex items-center justify-center font-mono font-bold text-lg border"
                style={{
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: bgColor,
                  color: textColor,
                  borderColor: "var(--border)",
                }}
                animate={{
                  scale: isCurrent ? [1, 1.1, 1] : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                {cell === "#" ? "·" : cell}
              </motion.div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// Trie path visualization
const TriePathVisualization: React.FC<{
  path: string;
  phase: string;
}> = ({ path, phase }) => {
  if (!path || path === "root") {
    return (
      <div
        className="font-mono text-sm px-3 py-2 rounded"
        style={{
          backgroundColor: "var(--bg-elevated)",
          color: "var(--text-2)",
        }}
      >
        Trie: root
      </div>
    );
  }

  const chars = path.split("→");

  return (
    <div
      className="font-mono text-sm px-3 py-2 rounded flex items-center gap-1 flex-wrap"
      style={{ backgroundColor: "var(--bg-elevated)" }}
    >
      <span style={{ color: "var(--text-3)" }}>Trie:</span>
      <span style={{ color: "var(--text-2)" }}>root</span>
      {chars.map((char, i) => (
        <React.Fragment key={i}>
          <span style={{ color: "var(--text-3)" }}>→</span>
          <span
            style={{
              color:
                i === chars.length - 1
                  ? phase === "found"
                    ? "#22c55e"
                    : "var(--accent-1)"
                  : "var(--text-2)",
              fontWeight: i === chars.length - 1 ? "bold" : "normal",
            }}
          >
            {char}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
};

// Main component
const BOARD = [
  ["o", "a", "a", "n"],
  ["e", "t", "a", "e"],
  ["i", "h", "k", "r"],
  ["i", "f", "l", "v"],
];

const WORDS = ["oath", "eat"];

export const WordSearchIIVisualizer: React.FC = () => {
  const [stepIndex, setStepIndex] = useState(0);

  const steps = useMemo(() => generateSteps(BOARD, WORDS), []);
  const currentStep = steps[stepIndex];

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case "start":
        return "#6366f1";
      case "visit":
        return "var(--accent-1)";
      case "found":
        return "#22c55e";
      case "backtrack":
        return "var(--accent-2)";
      case "prune":
        return "#f59e0b";
      case "complete":
        return "#22c55e";
      /* v8 ignore next 2 -- defensive: all phases are explicitly handled */
      default:
        return "var(--text-2)";
    }
  };

  const getPhaseLabel = (phase: string) => {
    switch (phase) {
      case "start":
        return "START";
      case "visit":
        return "VISIT";
      case "found":
        return "FOUND";
      case "backtrack":
        return "BACKTRACK";
      case "prune":
        return "PRUNE";
      case "complete":
        return "COMPLETE";
      /* v8 ignore next 2 -- defensive: all phases are explicitly handled */
      default:
        return phase.toUpperCase();
    }
  };

  return (
    <div
      className="rounded-lg p-4 space-y-4"
      style={{ backgroundColor: "var(--bg-surface)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3
          className="text-lg font-semibold"
          style={{ color: "var(--text-1)" }}
        >
          Word Search II Visualization
        </h3>
        <div
          className="text-sm px-3 py-1 rounded"
          style={{
            backgroundColor: "var(--bg-elevated)",
            color: "var(--text-2)",
          }}
        >
          Words: [{WORDS.map((w) => `"${w}"`).join(", ")}]
        </div>
      </div>

      {/* Main visualization */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Grid */}
        <div
          className="rounded-lg p-4"
          style={{ backgroundColor: "var(--bg-elevated)" }}
        >
          <div
            className="text-xs mb-3 font-medium"
            style={{ color: "var(--text-3)" }}
          >
            BOARD (4×4)
          </div>
          <div className="flex justify-center">
            <GridVisualization
              board={currentStep?.board || BOARD}
              currentCell={currentStep?.cell || null}
              path={currentStep?.path || []}
              phase={currentStep?.phase || "start"}
            />
          </div>
          <div
            className="mt-3 text-xs flex gap-4 justify-center"
            style={{ color: "var(--text-3)" }}
          >
            <span className="flex items-center gap-1">
              <span
                className="w-3 h-3 rounded"
                style={{ backgroundColor: "var(--accent-1)" }}
              />
              Current
            </span>
            <span className="flex items-center gap-1">
              <span
                className="w-3 h-3 rounded"
                style={{ backgroundColor: "var(--accent-2)" }}
              />
              Path
            </span>
            <span className="flex items-center gap-1">
              <span
                className="w-3 h-3 rounded"
                style={{ backgroundColor: "#22c55e" }}
              />
              Found
            </span>
          </div>
        </div>

        {/* Step info */}
        <div className="space-y-3">
          {/* Trie path */}
          <TriePathVisualization
            path={currentStep?.trieProgress || ""}
            phase={currentStep?.phase || "start"}
          />

          {/* Found words */}
          <div
            className="px-3 py-2 rounded"
            style={{ backgroundColor: "var(--bg-elevated)" }}
          >
            <span
              className="text-xs font-medium"
              style={{ color: "var(--text-3)" }}
            >
              Found words:{" "}
            </span>
            <span
              className="font-mono text-sm"
              style={{
                color:
                  currentStep?.foundWords.length > 0
                    ? "#22c55e"
                    : "var(--text-2)",
              }}
            >
              [{currentStep?.foundWords.map((w) => `"${w}"`).join(", ") || ""}]
            </span>
          </div>

          {/* Current step */}
          <div
            className="rounded-lg p-3"
            style={{ backgroundColor: "var(--bg-elevated)" }}
          >
            <div
              className="text-xs mb-2 font-medium"
              style={{ color: "var(--text-3)" }}
            >
              STEP {stepIndex + 1} / {steps.length}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className="px-2 py-0.5 rounded text-xs font-medium"
                  style={{
                    backgroundColor: getPhaseColor(currentStep?.phase || ""),
                    color: "white",
                  }}
                >
                  {getPhaseLabel(currentStep?.phase || "")}
                </span>
                {currentStep?.cell && (
                  <span
                    className="px-2 py-0.5 rounded text-xs font-mono"
                    style={{
                      backgroundColor: "var(--bg-surface)",
                      color: "var(--text-2)",
                    }}
                  >
                    ({currentStep.cell[0]},{currentStep.cell[1]})
                  </span>
                )}
              </div>
              <div style={{ color: "var(--text-1)" }}>
                {currentStep?.description}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-2">
            <button
              onClick={() => setStepIndex(Math.max(0, stepIndex - 1))}
              disabled={stepIndex === 0}
              className="flex-1 px-3 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50"
              style={{
                backgroundColor: "var(--bg-elevated)",
                color: "var(--text-2)",
              }}
            >
              ← Previous
            </button>
            <button
              onClick={() =>
                setStepIndex(Math.min(steps.length - 1, stepIndex + 1))
              }
              disabled={stepIndex === steps.length - 1}
              className="flex-1 px-3 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50"
              style={{
                backgroundColor: "var(--accent-1)",
                color: "white",
              }}
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div
        className="rounded-lg p-3 text-xs"
        style={{
          backgroundColor: "var(--bg-elevated)",
          color: "var(--text-3)",
        }}
      >
        <strong>How it works:</strong> DFS traverses the grid while following
        Trie paths. When the current cell&apos;s character isn&apos;t in the
        Trie, we prune that path. When we reach a node with a stored word, we
        found a match!
      </div>
    </div>
  );
};

export default WordSearchIIVisualizer;
