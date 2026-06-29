"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";

export default function PrefixSumArrayVisualizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [nums] = useState([1, 2, 3, 4, 5]);
  const [prefixSum, setPrefixSum] = useState<number[]>([]);
  const [buildIndex, setBuildIndex] = useState(-1);
  const [queryRange, setQueryRange] = useState<[number, number] | null>(null);
  const [queryResult, setQueryResult] = useState<number | null>(null);
  const [phase, setPhase] = useState<"init" | "building" | "querying" | "done">(
    "init"
  );
  const [message, setMessage] = useState(
    "Click Play to build prefix sum array"
  );

  const queries: [number, number][] = useMemo(
    () => [
      [1, 3],
      [0, 4],
      [2, 4],
    ],
    []
  );
  const [queryIndex, setQueryIndex] = useState(0);

  const reset = useCallback(() => {
    setPrefixSum([]);
    setBuildIndex(-1);
    setQueryRange(null);
    setQueryResult(null);
    setQueryIndex(0);
    setPhase("init");
    setMessage("Click Play to build prefix sum array");
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (phase === "init") {
        setPhase("building");
        setBuildIndex(0);
        setPrefixSum([nums[0]]);
        setMessage(`Building prefix[0] = ${nums[0]}`);
        return;
      }

      if (phase === "building") {
        const nextIdx = buildIndex + 1;
        if (nextIdx >= nums.length) {
          setPhase("querying");
          setMessage(
            "Prefix sum built! Now answering range queries in O(1)..."
          );
          return;
        }

        setBuildIndex(nextIdx);
        setPrefixSum((prev) => {
          const newVal = prev[prev.length - 1] + nums[nextIdx];
          return [...prev, newVal];
        });
        const newVal = prefixSum[prefixSum.length - 1] + nums[nextIdx];
        setMessage(
          `prefix[${nextIdx}] = prefix[${nextIdx - 1}] + nums[${nextIdx}] = ${prefixSum[prefixSum.length - 1]} + ${nums[nextIdx]} = ${newVal}`
        );
        return;
      }

      if (phase === "querying") {
        if (queryIndex >= queries.length) {
          setPhase("done");
          setMessage(
            "All queries answered in O(1) each! Total: O(n) build + O(1) per query"
          );
          setIsPlaying(false);
          return;
        }

        const [l, r] = queries[queryIndex];
        setQueryRange([l, r]);

        const result = l === 0 ? prefixSum[r] : prefixSum[r] - prefixSum[l - 1];
        setQueryResult(result);

        if (l === 0) {
          setMessage(`Query [${l}, ${r}]: prefix[${r}] = ${result}`);
        } else {
          setMessage(
            `Query [${l}, ${r}]: prefix[${r}] - prefix[${l - 1}] = ${prefixSum[r]} - ${prefixSum[l - 1]} = ${result}`
          );
        }

        setTimeout(() => {
          setQueryIndex(queryIndex + 1);
          setQueryRange(null);
          setQueryResult(null);
        }, speed);
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [
    isPlaying,
    phase,
    buildIndex,
    nums,
    prefixSum,
    queryIndex,
    queries,
    speed,
  ]);

  return (
    <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">Prefix Sum Array</h3>
        <p className="text-gray-400 text-sm mt-1">
          O(n) build, O(1) range sum queries
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
              max="1200"
              step="100"
              value={1600 - speed}
              onChange={(e) => setSpeed(1600 - Number(e.target.value))}
              className="w-20 accent-orange-500"
            />
          </div>
        </div>

        {/* Original array */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">Original Array:</div>
          <div className="flex gap-2 justify-center">
            {nums.map((num, idx) => (
              <motion.div
                key={`num-${num}-${idx}`}
                animate={{
                  backgroundColor:
                    queryRange && idx >= queryRange[0] && idx <= queryRange[1]
                      ? "#f97316"
                      : idx === buildIndex && phase === "building"
                        ? "#eab308"
                        : "#374151",
                  scale: idx === buildIndex && phase === "building" ? 1.1 : 1,
                }}
                className="w-12 h-12 rounded-md flex flex-col items-center justify-center"
              >
                <span
                  className={`font-bold ${
                    (queryRange &&
                      idx >= queryRange[0] &&
                      idx <= queryRange[1]) ||
                    (idx === buildIndex && phase === "building")
                      ? "text-black"
                      : "text-white"
                  }`}
                >
                  {num}
                </span>
                <span className="text-xs text-gray-400">{idx}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Prefix sum array */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">Prefix Sum Array:</div>
          <div className="flex gap-2 justify-center min-h-[48px]">
            {prefixSum.length === 0 ? (
              <span className="text-gray-500">[ ]</span>
            ) : (
              prefixSum.map((sum, idx) => (
                <motion.div
                  key={`prefix-${sum}-${idx}`}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    backgroundColor:
                      queryRange &&
                      (idx === queryRange[1] ||
                        (queryRange[0] > 0 && idx === queryRange[0] - 1))
                        ? "#f97316"
                        : "#22c55e",
                  }}
                  className="w-12 h-12 rounded-md flex flex-col items-center justify-center"
                >
                  <span className="font-bold text-black">{sum}</span>
                  <span className="text-xs text-black/60">{idx}</span>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Query result */}
        {queryResult !== null && queryRange && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 p-3 bg-orange-500/20 border border-orange-500/50 rounded-md text-center"
          >
            <span className="text-orange-400 font-bold">
              Sum of range [{queryRange[0]}, {queryRange[1]}] = {queryResult}
            </span>
            <div className="text-gray-400 text-sm mt-1">
              Elements: [
              {nums.slice(queryRange[0], queryRange[1] + 1).join(" + ")}] ={" "}
              {queryResult}
            </div>
          </motion.div>
        )}

        {/* Queries to answer */}
        <div className="mb-4 p-3 bg-gray-800/50 rounded-md">
          <div className="text-sm text-gray-400 mb-2">Range Queries:</div>
          <div className="flex gap-2">
            {queries.map(([l, r], idx) => (
              <div
                key={`query-${l}-${r}-${idx}`}
                className={`px-3 py-1 rounded-md text-sm font-mono ${
                  idx < queryIndex
                    ? "bg-green-500/30 text-green-300"
                    : idx === queryIndex && phase === "querying"
                      ? "bg-orange-500 text-black"
                      : "bg-gray-700 text-gray-300"
                }`}
              >
                [{l}, {r}]
              </div>
            ))}
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
            <strong className="text-orange-400">Formula:</strong> sum(l, r) =
            prefix[r] - prefix[l-1] (or prefix[r] if l=0)
          </p>
        </div>
      </div>
    </div>
  );
}
