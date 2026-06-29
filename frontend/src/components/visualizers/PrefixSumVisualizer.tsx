"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";

export default function PrefixSumVisualizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [prefix, setPrefix] = useState<number[]>([0]);
  const [phase, setPhase] = useState<
    "init" | "building" | "built" | "querying" | "done"
  >("init");
  const [queryRange, setQueryRange] = useState<[number, number] | null>(null);
  const [queryResult, setQueryResult] = useState<number | null>(null);
  const [message, setMessage] = useState(
    "Click Play to build prefix sum array"
  );

  const arr = useMemo(() => [2, 4, 1, 3, 5], []);
  const queries: [number, number][] = useMemo(
    () => [
      [1, 3],
      [0, 4],
      [2, 2],
    ],
    []
  );
  const [queryIdx, setQueryIdx] = useState(0);

  const reset = useCallback(() => {
    setCurrentIdx(0);
    setPrefix([0]);
    setPhase("init");
    setQueryRange(null);
    setQueryResult(null);
    setQueryIdx(0);
    setMessage("Click Play to build prefix sum array");
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (phase === "init") {
        setPhase("building");
        setMessage("Building prefix sum: prefix[i] = prefix[i-1] + arr[i-1]");
      } else if (phase === "building") {
        if (currentIdx >= arr.length) {
          setPhase("built");
          setMessage(
            `Prefix sum built! Now let's answer range queries in O(1)`
          );
          return;
        }

        const newSum = prefix[prefix.length - 1] + arr[currentIdx];
        setPrefix([...prefix, newSum]);
        setMessage(
          `prefix[${currentIdx + 1}] = prefix[${currentIdx}] + arr[${currentIdx}] = ${prefix[prefix.length - 1]} + ${arr[currentIdx]} = ${newSum}`
        );
        setCurrentIdx(currentIdx + 1);
      } else if (phase === "built") {
        setPhase("querying");
        setMessage(
          "Answering queries using formula: sum(i,j) = prefix[j+1] - prefix[i]"
        );
      } else if (phase === "querying") {
        if (queryIdx >= queries.length) {
          setPhase("done");
          setMessage("Done! Each query answered in O(1) time");
          setIsPlaying(false);
          return;
        }

        const [i, j] = queries[queryIdx];
        setQueryRange([i, j]);
        const result = prefix[j + 1] - prefix[i];
        setQueryResult(result);
        setMessage(
          `Query sum(${i}, ${j}): prefix[${j + 1}] - prefix[${i}] = ${prefix[j + 1]} - ${prefix[i]} = ${result}`
        );
        setQueryIdx(queryIdx + 1);
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [isPlaying, phase, currentIdx, prefix, queryIdx, queries, arr, speed]);

  return (
    <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">Prefix Sum Array</h3>
        <p className="text-gray-400 text-sm mt-1">
          Build once O(n), query range sums in O(1)
        </p>
      </div>

      <div className="p-4">
        {/* Controls */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
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
              className="w-20 accent-orange-500"
            />
          </div>
        </div>

        {/* Original Array */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">Original Array:</div>
          <div className="flex gap-2">
            {arr.map((val, idx) => (
              <motion.div
                key={`arr-${val}-${idx}`}
                animate={{
                  scale: idx === currentIdx && phase === "building" ? 1.1 : 1,
                  backgroundColor:
                    queryRange && idx >= queryRange[0] && idx <= queryRange[1]
                      ? "#f59e0b"
                      : idx < currentIdx && phase === "building"
                        ? "#22c55e"
                        : "#374151",
                }}
                className="w-12 h-12 rounded-md flex flex-col items-center justify-center font-mono"
              >
                <span className="text-lg font-bold text-white">{val}</span>
                <span className="text-xs text-gray-400">[{idx}]</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Prefix Sum Array */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">Prefix Sum Array:</div>
          <div className="flex gap-2">
            {prefix.map((val, idx) => (
              <motion.div
                key={`prefix-${val}-${idx}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`w-12 h-12 rounded-md flex flex-col items-center justify-center font-mono ${
                  queryRange &&
                  (idx === queryRange[1] + 1 || idx === queryRange[0])
                    ? "bg-orange-500 ring-2 ring-orange-300"
                    : "bg-blue-500"
                }`}
              >
                <span className="text-lg font-bold text-white">{val}</span>
                <span className="text-xs text-blue-200">[{idx}]</span>
              </motion.div>
            ))}
            {prefix.length <= arr.length && (
              <div className="w-12 h-12 rounded-md flex items-center justify-center border-2 border-dashed border-gray-600 text-gray-500">
                ?
              </div>
            )}
          </div>
        </div>

        {/* Query Result */}
        {queryRange && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 p-4 bg-orange-500/10 border border-orange-500/30 rounded-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">
                  Query: sum(arr[{queryRange[0]}..{queryRange[1]}])
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Elements: [
                  {arr.slice(queryRange[0], queryRange[1] + 1).join(", ")}]
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-orange-400">
                  {queryResult}
                </div>
                <div className="text-xs text-gray-500">
                  prefix[{queryRange[1] + 1}] - prefix[{queryRange[0]}]
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {prefix.length - 1}/{arr.length}
            </div>
            <div className="text-xs text-gray-500">Built</div>
          </div>
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-2xl font-bold text-orange-400">
              {queryIdx}/{queries.length}
            </div>
            <div className="text-xs text-gray-500">Queries</div>
          </div>
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-2xl font-bold text-green-400">O(1)</div>
            <div className="text-xs text-gray-500">Per Query</div>
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

        {/* Formula */}
        <div className="mt-4 p-3 bg-gray-800/30 rounded-md text-sm text-gray-400">
          <p>
            <strong className="text-orange-400">Key Formula:</strong>{" "}
            sum(arr[i..j]) = prefix[j+1] - prefix[i]
          </p>
        </div>
      </div>
    </div>
  );
}
