"use client";

import { useState, useEffect, useCallback, useReducer, useMemo, startTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Item {
  weight: number;
  value: number;
  name: string;
  color: string;
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
  }
}

const capacity = 7;
const items: Item[] = [
  { weight: 1, value: 1, name: "Phone", color: "blue" },
  { weight: 3, value: 4, name: "Laptop", color: "purple" },
  { weight: 4, value: 5, name: "Camera", color: "green" },
  { weight: 2, value: 3, name: "Tablet", color: "orange" },
];

function generateSteps() {
    const n = items.length;
    const steps: {
      i: number;
      j: number;
      value: number;
      take: boolean;
      skipValue: number;
      takeValue: number;
      formula: string;
    }[] = [];

    const dp: number[][] = Array(n + 1)
      .fill(null)
      .map(() => Array(capacity + 1).fill(0));

    for (let i = 1; i <= n; i++) {
      for (let w = 0; w <= capacity; w++) {
        const item = items[i - 1];
        const skipValue = dp[i - 1][w];

        if (item.weight <= w) {
          const takeValue = dp[i - 1][w - item.weight] + item.value;
          const take = takeValue > skipValue;
          dp[i][w] = Math.max(skipValue, takeValue);

          steps.push({
            i,
            j: w,
            value: dp[i][w],
            take,
            skipValue,
            takeValue,
            formula: take
              ? `TAKE ${item.name}: ${takeValue} > ${skipValue}`
              : `SKIP ${item.name}: ${skipValue} ≥ ${takeValue}`,
          });
        } else {
          dp[i][w] = skipValue;
          steps.push({
            i,
            j: w,
            value: dp[i][w],
            take: false,
            skipValue,
            takeValue: 0,
            formula: `Can't fit ${item.name} (weight ${item.weight} > capacity ${w})`,
          });
        }
      }
    }

    return { steps, dp };
  }

export default function KnapsackVisualizer() {
  const [{ step, isPlaying }, dispatch] = useReducer(playReducer, { step: 0, isPlaying: false });
  const [speed, setSpeed] = useState(600);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [dpTable, setDpTable] = useState<number[][]>([]);
  const [currentCell, setCurrentCell] = useState<{
    i: number;
    j: number;
  } | null>(null);
  const [decision, setDecision] = useState<string>("");

  const { steps, dp: finalDp } = useMemo(() => generateSteps(), []);

  const [completed, setCompleted] = useState(false);

  const backtrackSolution = useCallback(
    function backtrackSolution() {
      const selected = new Set<number>();
      let w = capacity;

      for (let i = items.length; i > 0 && w > 0; i--) {
        const stepIdx = (i - 1) * (capacity + 1) + w;
        if (stepIdx < steps.length && steps[stepIdx]?.take) {
          selected.add(i - 1);
          w -= items[i - 1].weight;
        }
      }

      setSelectedItems(selected);
    },
    [steps]
  );

  useEffect(() => {
    if (!isPlaying) return;

    if (step >= steps.length) {
      startTransition(() => {
        dispatch({ type: "STOP" });
        if (!completed) {
          setCompleted(true);
          backtrackSolution();
        }
      });
      return;
    }

    const timer = setTimeout(() => {
      const s = steps[step];
      setCurrentCell({ i: s.i, j: s.j });
      setDecision(s.formula);

      setDpTable((prev) => {
        const newTable = prev.map((row) => [...row]);
        if (!newTable[s.i]) newTable[s.i] = Array(capacity + 1).fill(0);
        newTable[s.i][s.j] = s.value;
        return newTable;
      });

      dispatch({ type: "ADVANCE" });
    }, speed);

    return () => clearTimeout(timer);
  }, [isPlaying, step, steps, speed, completed, backtrackSolution]);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
    setCompleted(false);
    setDpTable(
      Array(items.length + 1)
        .fill(null)
        .map(() => Array(capacity + 1).fill(0))
    );
    setCurrentCell(null);
    setDecision("");
    setSelectedItems(new Set());
  }, []);

  useEffect(() => {
    startTransition(() => {
      reset();
    });
  }, [reset]);

  const getCellValue = (i: number, j: number) => {
    if (i === 0 || j < 0) return 0;
    return dpTable[i]?.[j] ?? 0;
  };

  const getCellColor = (i: number, j: number) => {
    if (currentCell?.i === i && currentCell?.j === j) {
      return "bg-yellow-500 text-black border-yellow-400";
    }

    const stepIdx = steps.findIndex((s) => s.i === i && s.j === j);
    if (stepIdx !== -1 && stepIdx < step) {
      const s = steps[stepIdx];
      if (s.take) {
        return "bg-green-500/30 border-green-500 text-green-400";
      }
      return "bg-indigo-500/20 border-indigo-500/50 text-indigo-400";
    }

    return "bg-gray-800/50 border-gray-700 text-gray-600";
  };

  const getItemColorClass = (color: string) => {
    switch (color) {
      case "blue":
        return "from-blue-500 to-blue-600";
      case "purple":
        return "from-purple-500 to-purple-600";
      case "green":
        return "from-green-500 to-green-600";
      case "orange":
        return "from-orange-500 to-orange-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const totalValue = [...selectedItems].reduce(
    (sum, i) => sum + items[i].value,
    0
  );
  const totalWeight = [...selectedItems].reduce(
    (sum, i) => sum + items[i].weight,
    0
  );

  return (
    <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">
          0/1 Knapsack Visualizer
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Capacity: {capacity}kg — Select items to maximize value
        </p>
      </div>

      <div className="p-4">
        {/* Items Display */}
        <div className="mb-6">
          <h4 className="text-white font-medium mb-3">Available Items</h4>
          <div className="flex flex-wrap gap-3">
            {items.map((item, idx) => (
              <motion.div
                key={`item-${item.name}-${idx}`}
                animate={{
                  scale: selectedItems.has(idx) ? 1.05 : 1,
                  y: selectedItems.has(idx) ? -5 : 0,
                }}
                className={`relative p-3 rounded-md bg-gradient-to-br ${getItemColorClass(item.color)} ${
                  selectedItems.has(idx)
                    ? "ring-2 ring-white ring-offset-2 ring-offset-gray-900"
                    : ""
                }`}
              >
                <div className="text-white font-bold">{item.name}</div>
                <div className="flex gap-3 mt-1 text-sm text-white/80">
                  <span>⚖️ {item.weight}kg</span>
                  <span>💰 ${item.value}</span>
                </div>
                {selectedItems.has(idx) && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <span className="text-white text-sm">✓</span>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Knapsack */}
        <div className="mb-6">
          <h4 className="text-white font-medium mb-3">Your Knapsack</h4>
          <div className="relative bg-gray-800/50 rounded-md border-2 border-dashed border-gray-600 p-4 min-h-[100px]">
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {[...selectedItems].map((idx) => (
                  <motion.div
                    key={`selected-${items[idx].name}-${idx}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className={`px-3 py-2 rounded-md bg-gradient-to-br ${getItemColorClass(items[idx].color)} text-white text-sm font-medium`}
                  >
                    {items[idx].name}
                  </motion.div>
                ))}
              </AnimatePresence>
              {selectedItems.size === 0 && (
                <span className="text-gray-600 text-sm">
                  Items will appear here...
                </span>
              )}
            </div>

            {/* Capacity bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Weight Used</span>
                <span
                  className={
                    totalWeight > capacity ? "text-red-400" : "text-green-400"
                  }
                >
                  {totalWeight}/{capacity}kg
                </span>
              </div>
              <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  animate={{
                    width: `${Math.min((totalWeight / capacity) * 100, 100)}%`,
                  }}
                  className={`h-full rounded-full ${
                    totalWeight > capacity
                      ? "bg-red-500"
                      : "bg-gradient-to-r from-green-500 to-emerald-500"
                  }`}
                />
              </div>
            </div>

            {/* Total value */}
            <div className="absolute top-2 right-2 bg-yellow-500 text-black px-3 py-1 rounded-full font-bold">
              💰 ${totalValue}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => dispatch({ type: "TOGGLE" })}
            className={`px-4 py-2 rounded-md font-medium transition ${
              isPlaying ? "bg-yellow-500 text-black" : "bg-green-500 text-white"
            }`}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            onClick={() => {
              if (step < steps.length) {
                const s = steps[step];
                setCurrentCell({ i: s.i, j: s.j });
                setDecision(s.formula);
                setDpTable((prev) => {
                  const newTable = prev.map((row) => [...row]);
                  if (!newTable[s.i])
                    newTable[s.i] = Array(capacity + 1).fill(0);
                  newTable[s.i][s.j] = s.value;
                  return newTable;
                });
                dispatch({ type: "ADVANCE" });
              }
            }}
            disabled={step >= steps.length}
            className="px-4 py-2 bg-gray-700 text-white rounded-md font-medium hover:bg-gray-600 disabled:opacity-50"
          >
            Step
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
              min="200"
              max="1000"
              step="100"
              value={1200 - speed}
              onChange={(e) => setSpeed(1200 - Number(e.target.value))}
              className="w-20 accent-orange-500"
            />
          </div>
        </div>

        {/* DP Table */}
        <div className="overflow-x-auto">
          <div className="inline-block">
            {/* Header - capacities */}
            <div className="flex">
              <div className="w-20 h-10 flex items-center justify-center text-gray-500 text-sm">
                Item\Cap
              </div>
              {Array.from({ length: capacity + 1 }).map((_, j) => (
                <div
                  key={`capacity-${j}`}
                  className="w-12 h-10 flex items-center justify-center text-gray-400 font-mono"
                >
                  {j}kg
                </div>
              ))}
            </div>

            {/* Rows */}
            {Array.from({ length: items.length + 1 }).map((_, i) => (
              <div key={`row-${i === 0 ? 'empty' : items[i - 1].name}-${i}`} className="flex">
                <div className="w-20 h-12 flex items-center justify-center text-gray-400 text-sm">
                  {i === 0 ? "∅" : items[i - 1].name}
                </div>
                {Array.from({ length: capacity + 1 }).map((_, j) => (
                  <motion.div
                    key={`${i}-${j}`}
                    animate={{
                      scale:
                        currentCell?.i === i && currentCell?.j === j ? 1.15 : 1,
                    }}
                    className={`w-12 h-12 border-2 rounded-md flex items-center justify-center font-mono font-bold m-0.5 transition-colors ${getCellColor(i, j)}`}
                  >
                    {i === 0 ? 0 : getCellValue(i, j) || ""}
                  </motion.div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Decision Display */}
        {decision && (
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-3 rounded-md border ${
              decision.includes("TAKE")
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : decision.includes("SKIP")
                  ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                  : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            <span className="font-mono">{decision}</span>
          </motion.div>
        )}

        {/* Progress */}
        <div className="mt-4 flex justify-between text-sm text-gray-500">
          <span>
            Progress: {step}/{steps.length} cells
          </span>
          {step >= steps.length && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-green-400 font-medium"
            >
              ✓ Optimal solution found: $
              {finalDp[items.length]?.[capacity] || 0}
            </motion.span>
          )}
        </div>
      </div>
    </div>
  );
}
