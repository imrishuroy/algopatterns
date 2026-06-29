"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SubarraySumKVisualizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [sum, setSum] = useState(0);
  const [count, setCount] = useState(0);
  const [prefixMap, setPrefixMap] = useState<Map<number, number>>(
    new Map([[0, 1]])
  );
  const [foundSubarrays, setFoundSubarrays] = useState<[number, number][]>([]);
  const [lookingFor, setLookingFor] = useState<number | null>(null);
  const [phase, setPhase] = useState<"init" | "processing" | "done">("init");
  const [message, setMessage] = useState(
    "Click Play to count subarrays with sum = 3"
  );

  const arr = useMemo(() => [1, 2, 1, 1, 1], []);
  const k = 3;

  const reset = useCallback(() => {
    setCurrentIdx(-1);
    setSum(0);
    setCount(0);
    setPrefixMap(new Map([[0, 1]]));
    setFoundSubarrays([]);
    setLookingFor(null);
    setPhase("init");
    setMessage(`Click Play to count subarrays with sum = ${k}`);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (phase === "init") {
        setPhase("processing");
        setMessage(`Initialize: map = {0: 1}, sum = 0, count = 0`);
        setCurrentIdx(0);
      } else if (phase === "processing") {
        if (currentIdx >= arr.length) {
          setPhase("done");
          setMessage(`Done! Found ${count} subarrays with sum = ${k}`);
          setIsPlaying(false);
          return;
        }

        const num = arr[currentIdx];
        const newSum = sum + num;
        const complement = newSum - k;
        setLookingFor(complement);

        // Check if complement exists
        const complementCount = prefixMap.get(complement) || 0;
        const newCount = count + complementCount;

        // Find subarrays ending here
        if (complementCount > 0) {
          // This is a simplification - in reality we'd track all positions
          setFoundSubarrays([
            ...foundSubarrays,
            [Math.max(0, currentIdx - 1), currentIdx],
          ]);
        }

        // Update map
        const newMap = new Map(prefixMap);
        newMap.set(newSum, (newMap.get(newSum) || 0) + 1);

        setSum(newSum);
        setCount(newCount);
        setPrefixMap(newMap);

        if (complementCount > 0) {
          setMessage(
            `arr[${currentIdx}]=${num}: sum=${newSum}, looking for ${complement} → Found ${complementCount}! count=${newCount}`
          );
        } else {
          setMessage(
            `arr[${currentIdx}]=${num}: sum=${newSum}, looking for ${complement} → Not found. count=${newCount}`
          );
        }

        setCurrentIdx(currentIdx + 1);
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [
    isPlaying,
    phase,
    currentIdx,
    sum,
    count,
    prefixMap,
    foundSubarrays,
    arr,
    k,
    speed,
  ]);

  return (
    <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-pink-500/10 to-rose-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">
          Subarray Sum Equals K
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Prefix Sum + HashMap: Look for complement (sum - k)
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
              min="500"
              max="2000"
              step="100"
              value={2500 - speed}
              onChange={(e) => setSpeed(2500 - Number(e.target.value))}
              className="w-20 accent-pink-500"
            />
          </div>
        </div>

        {/* Target K */}
        <div className="mb-4 p-3 bg-pink-500/10 border border-pink-500/30 rounded-md">
          <span className="text-gray-400">Target sum k = </span>
          <span className="text-2xl font-bold text-pink-400">{k}</span>
        </div>

        {/* Array */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">Array:</div>
          <div className="flex gap-2">
            {arr.map((val, idx) => (
              <motion.div
                key={`${val}-${idx}`}
                animate={{
                  scale: idx === currentIdx ? 1.1 : 1,
                  y: idx === currentIdx ? -5 : 0,
                }}
                className={`w-12 h-12 rounded-md flex flex-col items-center justify-center font-mono ${
                  idx === currentIdx
                    ? "bg-yellow-500 text-black ring-2 ring-yellow-300"
                    : idx < currentIdx
                      ? "bg-gray-600 text-gray-300"
                      : "bg-gray-700 text-gray-300"
                }`}
              >
                <span className="text-lg font-bold">{val}</span>
                <span className="text-xs opacity-70">[{idx}]</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Current state */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">Running Sum</div>
            <div className="text-2xl font-bold text-blue-400">{sum}</div>
          </div>
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">Looking For</div>
            <div className="text-2xl font-bold text-orange-400">
              {lookingFor !== null ? lookingFor : "-"}
            </div>
            <div className="text-xs text-gray-500">sum - k</div>
          </div>
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">Count</div>
            <div className="text-2xl font-bold text-green-400">{count}</div>
          </div>
        </div>

        {/* HashMap */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">
            Prefix Sum Map (sum → count):
          </div>
          <div className="bg-gray-800/50 rounded-md p-3">
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {Array.from(prefixMap.entries()).map(([key, value]) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`px-3 py-2 rounded-md font-mono text-sm ${
                      key === lookingFor
                        ? "bg-orange-500 text-white ring-2 ring-orange-300"
                        : "bg-gray-700 text-gray-300"
                    }`}
                  >
                    {key}: {value}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Found subarrays indicator */}
        {count > 0 && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-md">
            <div className="text-sm text-green-400">
              Found {count} subarray{count > 1 ? "s" : ""} with sum = {k}
            </div>
          </div>
        )}

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
            <strong className="text-pink-400">Key Insight:</strong> If prefix[j]
            - prefix[i] = k, then subarray [i+1, j] sums to k. So we look for
            (currentSum - k) in the HashMap.
          </p>
        </div>
      </div>
    </div>
  );
}
