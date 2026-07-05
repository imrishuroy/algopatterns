"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useReducer,
  startTransition,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

interface HeapNode {
  value: number;
  listIndex: number;
  nodeIndex: number;
}

const LIST_COLORS = ["bg-blue-500", "bg-green-500", "bg-purple-500"];

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

const INITIAL_LISTS = [
  [1, 4, 5],
  [1, 3, 4],
  [2, 6],
];

export default function MergeKListsVisualizer() {
  const [{ isPlaying }, dispatch] = useReducer(playReducer, {
    step: 0,
    isPlaying: false,
  });
  const [speed, setSpeed] = useState(800);
  const [, setLists] = useState<number[][]>([]);
  const [pointers, setPointers] = useState<number[]>([]);
  const [heap, setHeap] = useState<HeapNode[]>([]);
  const [result, setResult] = useState<number[]>([]);
  const [phase, setPhase] = useState<
    "init" | "initializing" | "extracting" | "adding" | "done"
  >("init");
  const [currentExtracted, setCurrentExtracted] = useState<HeapNode | null>(
    null
  );
  const [message, setMessage] = useState("Click Play to merge K sorted lists");

  const reset = useCallback(() => {
    setLists(INITIAL_LISTS.map((l) => [...l]));
    setPointers(INITIAL_LISTS.map(() => 0));
    setHeap([]);
    setResult([]);
    setPhase("init");
    setCurrentExtracted(null);
    setMessage("Click Play to merge K sorted lists using min-heap");
    dispatch({ type: "STOP" });
  }, []);

  useEffect(() => {
    startTransition(() => {
      reset();
    });
  }, [reset]);

  const sortHeap = (h: HeapNode[]) => {
    return [...h].sort((a, b) => a.value - b.value);
  };

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (phase === "init") {
        setPhase("initializing");
        setMessage("Step 1: Initialize heap with first element from each list");
      } else if (phase === "initializing") {
        // Add first element from each list to heap
        const newHeap: HeapNode[] = [];
        INITIAL_LISTS.forEach((list, i) => {
          if (list.length > 0) {
            newHeap.push({ value: list[0], listIndex: i, nodeIndex: 0 });
          }
        });
        setHeap(sortHeap(newHeap));
        setPointers(INITIAL_LISTS.map(() => 0));
        setPhase("extracting");
        setMessage(
          `Heap initialized with first elements: [${newHeap.map((n) => n.value).join(", ")}]`
        );
      } else if (phase === "extracting") {
        if (heap.length === 0) {
          setPhase("done");
          setMessage(`Done! Merged result: [${result.join(", ")}]`);
          dispatch({ type: "STOP" });
          return;
        }

        // Extract min from heap
        const newHeap = [...heap];
        const min = newHeap.shift()!;
        setCurrentExtracted(min);
        setHeap(newHeap);
        setResult([...result, min.value]);
        setMessage(`Extract min: ${min.value} from list ${min.listIndex + 1}`);
        setPhase("adding");
      } else if (phase === "adding") {
        if (currentExtracted) {
          const { listIndex, nodeIndex } = currentExtracted;
          const nextIndex = nodeIndex + 1;
          const newPointers = [...pointers];
          newPointers[listIndex] = nextIndex;
          setPointers(newPointers);

          if (nextIndex < INITIAL_LISTS[listIndex].length) {
            const nextValue = INITIAL_LISTS[listIndex][nextIndex];
            const newHeap = [
              ...heap,
              { value: nextValue, listIndex, nodeIndex: nextIndex },
            ];
            setHeap(sortHeap(newHeap));
            setMessage(
              `Add next from list ${listIndex + 1}: ${nextValue}. Heap: [${sortHeap(
                newHeap
              )
                .map((n) => n.value)
                .join(", ")}]`
            );
          } else {
            setMessage(
              `List ${listIndex + 1} exhausted. No more elements to add.`
            );
          }
        }
        setCurrentExtracted(null);
        setPhase("extracting");
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [isPlaying, phase, heap, result, pointers, currentExtracted, speed]);

  return (
    <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">
          Merge K Sorted Lists
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Use min-heap to always get the smallest available element
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
              min="400"
              max="1500"
              step="100"
              value={1900 - speed}
              onChange={(e) => setSpeed(1900 - Number(e.target.value))}
              className="w-20 accent-violet-500"
            />
          </div>
        </div>

        {/* K Sorted Lists */}
        <div className="mb-6">
          <div className="text-sm text-gray-400 mb-2">
            K = {INITIAL_LISTS.length} Sorted Lists:
          </div>
          <div className="space-y-2">
            {INITIAL_LISTS.map((list, listIdx) => (
              <div key={listIdx} className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-md ${LIST_COLORS[listIdx]} flex items-center justify-center text-white text-xs font-bold`}
                >
                  {listIdx + 1}
                </span>
                <div className="flex gap-1">
                  {list.map((num, nodeIdx) => (
                    <motion.div
                      key={nodeIdx}
                      animate={{
                        opacity: nodeIdx < pointers[listIdx] ? 0.3 : 1,
                        scale: nodeIdx === pointers[listIdx] ? 1.1 : 1,
                      }}
                      className={`w-10 h-10 rounded-md flex items-center justify-center font-mono font-bold transition-colors ${
                        nodeIdx < pointers[listIdx]
                          ? "bg-gray-700 text-gray-500"
                          : nodeIdx === pointers[listIdx]
                            ? `${LIST_COLORS[listIdx]} text-white ring-2 ring-white/50`
                            : "bg-gray-700 text-gray-300"
                      }`}
                    >
                      {num}
                    </motion.div>
                  ))}
                  {pointers[listIdx] >= list.length && (
                    <span className="text-gray-500 text-sm ml-2 self-center">
                      exhausted
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Min-Heap */}
        <div className="mb-6">
          <div className="text-sm text-gray-400 mb-2">
            Min-Heap (current front pointers):
          </div>
          <div className="bg-gray-800/50 rounded-md p-4 min-h-[80px]">
            <div className="flex flex-col items-center">
              <AnimatePresence>
                {heap.length > 0 ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex flex-col items-center"
                  >
                    {/* Root (min) */}
                    <motion.div
                      className={`w-14 h-14 rounded-full ${LIST_COLORS[heap[0].listIndex]} flex items-center justify-center text-white font-bold text-xl relative`}
                    >
                      {heap[0].value}
                      <span className="absolute -top-5 text-xs text-violet-400">
                        min
                      </span>
                    </motion.div>
                    {/* Children */}
                    {heap.length > 1 && (
                      <div className="flex gap-4 mt-3">
                        {heap.slice(1).map((node, i) => (
                          <motion.div
                            key={`${node.value}-${node.listIndex}-${i}`}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`w-10 h-10 rounded-full ${LIST_COLORS[node.listIndex]}/70 flex items-center justify-center text-white font-bold`}
                          >
                            {node.value}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <span className="text-gray-500">
                    {phase === "done" ? "All elements processed!" : "Empty"}
                  </span>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Currently Extracted */}
        {currentExtracted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-md"
          >
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 text-sm">Extracted:</span>
              <span
                className={`px-3 py-1 rounded-md ${LIST_COLORS[currentExtracted.listIndex]} text-white font-bold`}
              >
                {currentExtracted.value}
              </span>
              <span className="text-gray-400 text-sm">
                from List {currentExtracted.listIndex + 1}
              </span>
            </div>
          </motion.div>
        )}

        {/* Result */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">Merged Result:</div>
          <div className="bg-gray-800/50 rounded-md p-3 min-h-[50px]">
            <div className="flex gap-1 flex-wrap">
              <AnimatePresence>
                {result.map((num, idx) => (
                  <motion.span
                    key={`result-${num}-${idx}`}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="px-3 py-1 bg-violet-500 text-white rounded-md font-mono font-bold"
                  >
                    {num}
                  </motion.span>
                ))}
              </AnimatePresence>
              {result.length === 0 && (
                <span className="text-gray-500">
                  Elements will appear here...
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-2xl font-bold text-violet-400">
              {heap.length}
            </div>
            <div className="text-xs text-gray-500">Heap Size</div>
          </div>
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-2xl font-bold text-green-400">
              {result.length}
            </div>
            <div className="text-xs text-gray-500">Merged Count</div>
          </div>
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {INITIAL_LISTS.reduce((sum, l) => sum + l.length, 0) -
                result.length}
            </div>
            <div className="text-xs text-gray-500">Remaining</div>
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

        {/* Algorithm explanation */}
        <div className="mt-4 p-3 bg-gray-800/30 rounded-md text-sm text-gray-400">
          <p>
            <strong className="text-violet-400">Key Insight:</strong> Keep a
            min-heap of size K (one element from each list). Extract min, add to
            result, then push the next element from that list. Time: O(N log K)
            where N is total elements.
          </p>
        </div>
      </div>
    </div>
  );
}
