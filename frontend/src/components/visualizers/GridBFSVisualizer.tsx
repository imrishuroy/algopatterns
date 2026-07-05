"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useReducer,
  startTransition,
} from "react";
import { motion } from "framer-motion";

type CellState = "water" | "land" | "visiting" | "visited";
type Mode = "dfs" | "bfs";

interface Cell {
  row: number;
  col: number;
  state: CellState;
  islandId: number | null;
}

const ISLAND_COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-cyan-500",
];

const initialGridData = [
  [1, 1, 0, 0, 0],
  [1, 1, 0, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 0, 1, 1],
];

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
export default function GridBFSVisualizer() {
  const [mode, setMode] = useState<Mode>("bfs");
  const [{ isPlaying }, dispatch] = useReducer(playReducer, {
    step: 0,
    isPlaying: false,
  });
  const [speed, setSpeed] = useState(300);
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [queue, setQueue] = useState<[number, number][]>([]);
  const [stack, setStack] = useState<[number, number][]>([]);
  const [islandCount, setIslandCount] = useState(0);
  const [currentIsland, setCurrentIsland] = useState(0);
  const [scanPosition, setScanPosition] = useState<[number, number]>([0, 0]);
  const [phase, setPhase] = useState<"scanning" | "exploring" | "done">(
    "scanning"
  );
  const [message, setMessage] = useState("Click Play to start finding islands");

  const initGrid = useCallback(() => {
    const newGrid: Cell[][] = initialGridData.map((row, r) =>
      row.map((val, c) => ({
        row: r,
        col: c,
        state: val === 1 ? "land" : "water",
        islandId: null,
      }))
    );
    setGrid(newGrid);
    setQueue([]);
    setStack([]);
    setIslandCount(0);
    setCurrentIsland(0);
    setScanPosition([0, 0]);
    setPhase("scanning");
    setMessage("Click Play to start finding islands");
    dispatch({ type: "STOP" });
  }, []);

  useEffect(() => {
    startTransition(() => {
      initGrid();
    });
  }, [initGrid]);

  // skipcq: JS-R1005
  const getNeighbors = useCallback(
    (r: number, c: number): [number, number][] => {
      const dirs = [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
      ];
      const neighbors: [number, number][] = [];
      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < grid.length && nc >= 0 && nc < grid[0].length) {
          neighbors.push([nr, nc]);
        }
      }
      return neighbors;
    },
    [grid]
  );

  useEffect(() => {
    if (!isPlaying || grid.length === 0) return;

    const timer = setTimeout(() => {
      if (phase === "scanning") {
        const [sr, sc] = scanPosition;

        if (sr >= grid.length) {
          setPhase("done");
          setMessage(`Found ${islandCount} islands!`);
          dispatch({ type: "STOP" });
          return;
        }

        const cell = grid[sr][sc];

        if (cell.state === "land") {
          const newIslandId = currentIsland + 1;
          setCurrentIsland(newIslandId);
          setIslandCount(newIslandId);
          setMessage(
            `Found new island #${newIslandId}! Starting ${mode.toUpperCase()} exploration...`
          );

          const newGrid = [...grid.map((row) => [...row])];
          newGrid[sr][sc] = { ...newGrid[sr][sc], state: "visiting" };
          setGrid(newGrid);

          if (mode === "bfs") {
            setQueue([[sr, sc]]);
          } else {
            setStack([[sr, sc]]);
          }
          setPhase("exploring");
        } else {
          let nextR = sr;
          let nextC = sc + 1;
          if (nextC >= grid[0].length) {
            nextC = 0;
            nextR++;
          }
          setScanPosition([nextR, nextC]);
        }
      } else if (phase === "exploring") {
        const frontier = mode === "bfs" ? queue : stack;

        if (frontier.length === 0) {
          setPhase("scanning");
          let [sr, sc] = scanPosition;
          sc++;
          if (sc >= grid[0].length) {
            sc = 0;
            sr++;
          }
          setScanPosition([sr, sc]);
          setMessage("Continuing scan for more islands...");
          return;
        }

        const [r, c] =
          mode === "bfs" ? frontier[0] : frontier[frontier.length - 1];
        const newFrontier =
          mode === "bfs" ? frontier.slice(1) : frontier.slice(0, -1);

        const newGrid = [...grid.map((row) => [...row])];
        newGrid[r][c] = {
          ...newGrid[r][c],
          state: "visited",
          islandId: currentIsland,
        };

        const neighbors = getNeighbors(r, c);
        const toAdd: [number, number][] = [];

        for (const [nr, nc] of neighbors) {
          if (newGrid[nr][nc].state === "land") {
            newGrid[nr][nc] = { ...newGrid[nr][nc], state: "visiting" };
            toAdd.push([nr, nc]);
          }
        }

        setGrid(newGrid);

        if (mode === "bfs") {
          setQueue([...newFrontier, ...toAdd]);
        } else {
          setStack([...newFrontier, ...toAdd]);
        }

        setMessage(
          `${mode.toUpperCase()}: Exploring island #${currentIsland}, ${newFrontier.length + toAdd.length} cells in ${mode === "bfs" ? "queue" : "stack"}`
        );
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [
    isPlaying,
    phase,
    scanPosition,
    queue,
    stack,
    grid,
    mode,
    currentIsland,
    islandCount,
    speed,
    getNeighbors,
  ]);

  const getCellColor = (cell: Cell) => {
    if (cell.state === "water") return "bg-gray-800";
    if (cell.state === "visiting") return "bg-yellow-500 animate-pulse";
    if (cell.state === "visited" && cell.islandId !== null) {
      return ISLAND_COLORS[(cell.islandId - 1) % ISLAND_COLORS.length];
    }
    return "bg-gray-600";
  };

  const isScanPosition = (r: number, c: number) => {
    return (
      phase === "scanning" && scanPosition[0] === r && scanPosition[1] === c
    );
  };

  return (
    <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">
          Grid Traversal: Number of Islands
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          DFS/BFS to find connected components in a grid
        </p>
      </div>

      <div className="p-4">
        {/* Mode Selector */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => {
              setMode("bfs");
              initGrid();
            }}
            className={`px-4 py-2 rounded-md font-medium transition ${
              mode === "bfs"
                ? "bg-cyan-500 text-white"
                : "bg-gray-800 text-gray-400"
            }`}
          >
            BFS (Queue)
          </button>
          <button
            onClick={() => {
              setMode("dfs");
              initGrid();
            }}
            className={`px-4 py-2 rounded-md font-medium transition ${
              mode === "dfs"
                ? "bg-purple-500 text-white"
                : "bg-gray-800 text-gray-400"
            }`}
          >
            DFS (Stack)
          </button>
        </div>

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
            onClick={initGrid}
            className="px-4 py-2 bg-gray-700 text-white rounded-md font-medium hover:bg-gray-600"
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
              className="w-20 accent-cyan-500"
            />
          </div>
        </div>

        {/* Grid Visualization */}
        <div className="flex justify-center mb-4">
          <div className="inline-block p-4 bg-gray-800/50 rounded-md">
            {grid.map((row, rowIndex) => (
              <div
                key={`row${rowIndex}-${row.map((c) => c.state).join("")}`} // skipcq: JS-0437
                className="flex gap-1 mb-1"
              >
                {row.map((cell) => (
                  <motion.div
                    key={`cell-r${cell.row}-c${cell.col}`}
                    animate={{
                      scale: cell.state === "visiting" ? 1.1 : 1,
                    }}
                    className={`w-12 h-12 rounded-md flex items-center justify-center font-mono text-sm transition-colors relative ${getCellColor(cell)} ${
                      isScanPosition(cell.row, cell.col)
                        ? "ring-2 ring-white ring-offset-2 ring-offset-gray-900"
                        : ""
                    }`}
                  >
                    {cell.state === "water" ? (
                      <span className="text-gray-600">~</span>
                    ) : cell.state === "visited" ? (
                      <span className="text-white font-bold">
                        {cell.islandId}
                      </span>
                    ) : cell.state === "visiting" ? (
                      <span className="text-black font-bold">?</span>
                    ) : (
                      <span className="text-gray-300">1</span>
                    )}
                  </motion.div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Data Structure Display */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-800/50 rounded-md p-3">
            <div className="text-xs text-gray-500 mb-2">
              {mode === "bfs" ? "Queue (FIFO)" : "Stack (LIFO)"}
            </div>
            <div className="flex flex-wrap gap-1 min-h-[32px]">
              {(mode === "bfs" ? queue : stack).map(([r, c], position) => (
                <span
                  key={`frontier-r${r}-c${c}-pos${position}`} // skipcq: JS-0437
                  className={`px-2 py-1 rounded-md text-xs font-mono ${
                    position === 0 && mode === "bfs"
                      ? "bg-yellow-500 text-black"
                      : position === (mode === "dfs" ? stack.length - 1 : -1)
                        ? "bg-yellow-500 text-black"
                        : "bg-gray-700 text-gray-300"
                  }`}
                >
                  ({r},{c})
                </span>
              ))}
              {(mode === "bfs" ? queue : stack).length === 0 && (
                <span className="text-gray-500 text-xs">Empty</span>
              )}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-md p-3">
            <div className="text-xs text-gray-500 mb-2">Islands Found</div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-cyan-400">
                {islandCount}
              </span>
              <div className="flex gap-1">
                {Array.from({ length: islandCount }).map((_, i) => (
                  <div
                    key={`island-${i + 1}`}
                    className={`w-4 h-4 rounded-md ${ISLAND_COLORS[i % ISLAND_COLORS.length]}`}
                  />
                ))}
              </div>
            </div>
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
              : phase === "exploring"
                ? "bg-yellow-500/10 border border-yellow-500/30 text-yellow-400"
                : "bg-gray-800 text-gray-300"
          }`}
        >
          {message}
        </motion.div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-gray-600" />
            <span className="text-gray-400">Unvisited Land</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-yellow-500" />
            <span className="text-gray-400">Currently Exploring</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-blue-500" />
            <span className="text-gray-400">Visited (Island)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-gray-800" />
            <span className="text-gray-400">Water</span>
          </div>
        </div>

        {/* Algorithm explanation */}
        <div className="mt-4 p-3 bg-gray-800/30 rounded-md text-sm text-gray-400">
          <p>
            <strong
              className={mode === "bfs" ? "text-cyan-400" : "text-purple-400"}
            >
              {mode === "bfs" ? "BFS" : "DFS"}:
            </strong>{" "}
            {mode === "bfs"
              ? "Uses a queue (FIFO) - explores level by level, spreading outward like ripples."
              : "Uses a stack (LIFO) - goes deep first, backtracking when hitting dead ends."}
          </p>
        </div>
      </div>
    </div>
  );
}
