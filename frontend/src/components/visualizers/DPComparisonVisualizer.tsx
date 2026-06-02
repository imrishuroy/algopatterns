"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

type Approach = "recursion" | "memoization" | "tabulation" | "optimized";

interface Step {
  type: Approach;
  action: string;
  value?: number;
  highlight?: string;
}

export default function DPComparisonVisualizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(300);
  const [n] = useState(6);

  const [recursionCalls, setRecursionCalls] = useState(0);
  const [recursionStack, setRecursionStack] = useState<string[]>([]);
  const [recursionCompleted, setRecursionCompleted] = useState<
    Map<number, number>
  >(new Map());

  const [memoCalls, setMemoCalls] = useState(0);
  const [memoCache, setMemoCache] = useState<Map<number, number>>(new Map());
  const [memoCacheHits, setMemoCacheHits] = useState(0);

  const [tabIndex, setTabIndex] = useState(0);
  const [tabArray, setTabArray] = useState<(number | null)[]>(
    Array(n + 1).fill(null)
  );

  const [optIndex, setOptIndex] = useState(0);
  const [optPrev2, setOptPrev2] = useState(0);
  const [optPrev1, setOptPrev1] = useState(1);

  const [isComplete, setIsComplete] = useState(false);
  const [step, setStep] = useState(0);

  const totalRecursionCalls = Math.pow(2, n + 1) - 1;

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setStep((s) => {
        if (s >= 100) {
          setIsPlaying(false);
          setIsComplete(true);
          return s;
        }

        // Recursion - exponential growth
        if (recursionCalls < Math.min(totalRecursionCalls, 50)) {
          setRecursionCalls((c) => c + 1);
          if (recursionStack.length < 8) {
            setRecursionStack((prev) => [
              ...prev,
              `fib(${Math.max(0, n - prev.length)})`,
            ]);
          } else {
            setRecursionStack((prev) => {
              const newStack = [...prev];
              newStack.shift();
              newStack.push(`fib(${Math.floor(Math.random() * n)})`);
              return newStack;
            });
          }
        }

        // Memoization - linear with cache
        if (s % 3 === 0 && memoCache.size <= n) {
          const nextKey = memoCache.size;
          if (!memoCache.has(nextKey)) {
            setMemoCalls((c) => c + 1);
            if (nextKey <= 1) {
              setMemoCache((prev) => new Map(prev).set(nextKey, nextKey));
            } else {
              const val =
                (memoCache.get(nextKey - 1) || 0) +
                (memoCache.get(nextKey - 2) || 0);
              setMemoCache((prev) => new Map(prev).set(nextKey, val));
            }
          } else {
            setMemoCacheHits((h) => h + 1);
          }
        }

        // Tabulation - steady iteration
        if (s % 4 === 0 && tabIndex <= n) {
          setTabArray((prev) => {
            const newArr = [...prev];
            if (tabIndex <= 1) {
              newArr[tabIndex] = tabIndex;
            } else {
              newArr[tabIndex] =
                (newArr[tabIndex - 1] || 0) + (newArr[tabIndex - 2] || 0);
            }
            return newArr;
          });
          setTabIndex((i) => i + 1);
        }

        // Optimized - fastest
        if (s % 5 === 0 && optIndex <= n) {
          if (optIndex >= 2) {
            const curr = optPrev1 + optPrev2;
            setOptPrev2(optPrev1);
            setOptPrev1(curr);
          }
          setOptIndex((i) => i + 1);
        }

        return s + 1;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [
    isPlaying,
    speed,
    n,
    recursionCalls,
    memoCache,
    tabIndex,
    optIndex,
    optPrev1,
    optPrev2,
    totalRecursionCalls,
    recursionStack.length,
  ]);

  const reset = () => {
    setStep(0);
    setIsPlaying(false);
    setIsComplete(false);
    setRecursionCalls(0);
    setRecursionStack([]);
    setRecursionCompleted(new Map());
    setMemoCalls(0);
    setMemoCache(new Map());
    setMemoCacheHits(0);
    setTabIndex(0);
    setTabArray(Array(n + 1).fill(null));
    setOptIndex(0);
    setOptPrev2(0);
    setOptPrev1(1);
  };

  const getProgressPercent = (approach: Approach) => {
    switch (approach) {
      case "recursion":
        return Math.min((recursionCalls / 20) * 100, 100);
      case "memoization":
        return (memoCache.size / (n + 1)) * 100;
      case "tabulation":
        return (tabIndex / (n + 1)) * 100;
      case "optimized":
        return (optIndex / (n + 1)) * 100;
    }
  };

  const fib = (num: number): number => {
    if (num <= 1) return num;
    let a = 0,
      b = 1;
    for (let i = 2; i <= num; i++) {
      const c = a + b;
      a = b;
      b = c;
    }
    return b;
  };

  const finalAnswer = fib(n);

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">
          DP Approaches: Side-by-Side Race
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Computing fib({n}) = {finalAnswer} — Watch all 4 approaches compete!
        </p>
      </div>

      <div className="p-4">
        {/* Controls */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              isPlaying ? "bg-yellow-500 text-black" : "bg-green-500 text-white"
            }`}
          >
            {isPlaying ? "Pause" : "Start Race"}
          </button>
          <button
            onClick={reset}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600"
          >
            Reset
          </button>
          <div className="flex items-center gap-2 ml-4">
            <span className="text-gray-400 text-sm">Speed:</span>
            <input
              type="range"
              min="100"
              max="500"
              step="50"
              value={600 - speed}
              onChange={(e) => setSpeed(600 - Number(e.target.value))}
              className="w-20 accent-purple-500"
            />
          </div>
        </div>

        {/* Four Approaches Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Recursion */}
          <motion.div
            animate={{
              borderColor:
                getProgressPercent("recursion") >= 100 ? "#ef4444" : "#374151",
            }}
            className="bg-gray-800/50 rounded-xl border-2 p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-red-400 font-semibold">Pure Recursion</h4>
              <span className="text-xs text-gray-500 font-mono">O(2ⁿ)</span>
            </div>

            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Function Calls</span>
                <span className="text-red-400 font-mono">{recursionCalls}</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  animate={{
                    width: `${Math.min((recursionCalls / 50) * 100, 100)}%`,
                  }}
                  className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full"
                />
              </div>
            </div>

            {/* Call Stack Visualization */}
            <div className="bg-gray-900/50 rounded-lg p-2 h-24 overflow-hidden">
              <div className="text-xs text-gray-500 mb-1">Call Stack:</div>
              <div className="space-y-0.5">
                {recursionStack.slice(-5).map((call, i) => (
                  <motion.div
                    key={`call-${call}-${i}`}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="text-xs font-mono text-red-400 bg-red-500/10 px-2 py-0.5 rounded"
                  >
                    {"  ".repeat(i)}
                    {call}
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mt-2 text-xs text-red-300">
              ⚠️ Exponentially slow! Many duplicate calls...
            </div>
          </motion.div>

          {/* Memoization */}
          <motion.div
            animate={{
              borderColor:
                getProgressPercent("memoization") >= 100
                  ? "#eab308"
                  : "#374151",
            }}
            className="bg-gray-800/50 rounded-xl border-2 p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-yellow-400 font-semibold">Memoization</h4>
              <span className="text-xs text-gray-500 font-mono">O(n)</span>
            </div>

            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Calls</span>
                <span className="text-yellow-400 font-mono">{memoCalls}</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${getProgressPercent("memoization")}%` }}
                  className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full"
                />
              </div>
            </div>

            {/* Cache Visualization */}
            <div className="bg-gray-900/50 rounded-lg p-2 h-24">
              <div className="text-xs text-gray-500 mb-1">
                Cache: (hits: {memoCacheHits})
              </div>
              <div className="flex flex-wrap gap-1">
                {Array.from({ length: n + 1 }).map((_, i) => (
                  <motion.div
                    key={`memo-${i}-${memoCache.get(i) ?? 'empty'}`}
                    animate={{
                      scale: memoCache.has(i) ? 1 : 0.8,
                      opacity: memoCache.has(i) ? 1 : 0.3,
                    }}
                    className={`w-8 h-8 rounded flex items-center justify-center text-xs font-mono ${
                      memoCache.has(i)
                        ? "bg-yellow-500/30 border border-yellow-500 text-yellow-400"
                        : "bg-gray-700/50 text-gray-600"
                    }`}
                  >
                    {memoCache.get(i) ?? "?"}
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mt-2 text-xs text-yellow-300">
              ✓ Cache prevents duplicate work!
            </div>
          </motion.div>

          {/* Tabulation */}
          <motion.div
            animate={{
              borderColor:
                getProgressPercent("tabulation") >= 100 ? "#3b82f6" : "#374151",
            }}
            className="bg-gray-800/50 rounded-xl border-2 p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-blue-400 font-semibold">Tabulation</h4>
              <span className="text-xs text-gray-500 font-mono">O(n)</span>
            </div>

            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Index</span>
                <span className="text-blue-400 font-mono">
                  {tabIndex}/{n}
                </span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${getProgressPercent("tabulation")}%` }}
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                />
              </div>
            </div>

            {/* Array Visualization */}
            <div className="bg-gray-900/50 rounded-lg p-2 h-24">
              <div className="text-xs text-gray-500 mb-1">DP Array:</div>
              <div className="flex gap-1">
                {tabArray.map((val, i) => (
                  <motion.div
                    key={`tab-${i}-${val ?? 'null'}`}
                    animate={{
                      scale: i === tabIndex - 1 ? 1.2 : 1,
                      backgroundColor:
                        val !== null
                          ? "rgba(59, 130, 246, 0.3)"
                          : "rgba(55, 65, 81, 0.5)",
                    }}
                    className={`flex-1 h-12 rounded flex flex-col items-center justify-center border ${
                      val !== null ? "border-blue-500" : "border-gray-700"
                    }`}
                  >
                    <span className="text-xs text-gray-500">[{i}]</span>
                    <span
                      className={`text-sm font-mono ${val !== null ? "text-blue-400" : "text-gray-600"}`}
                    >
                      {val ?? "-"}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mt-2 text-xs text-blue-300">
              ✓ No recursion overhead, just iteration
            </div>
          </motion.div>

          {/* Space Optimized */}
          <motion.div
            animate={{
              borderColor:
                getProgressPercent("optimized") >= 100 ? "#22c55e" : "#374151",
            }}
            className="bg-gray-800/50 rounded-xl border-2 p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-green-400 font-semibold">Space Optimized</h4>
              <span className="text-xs text-gray-500 font-mono">
                O(1) space
              </span>
            </div>

            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Index</span>
                <span className="text-green-400 font-mono">
                  {optIndex}/{n}
                </span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${getProgressPercent("optimized")}%` }}
                  className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                />
              </div>
            </div>

            {/* Two Variables Visualization */}
            <div className="bg-gray-900/50 rounded-lg p-2 h-24">
              <div className="text-xs text-gray-500 mb-2">
                Just 2 variables:
              </div>
              <div className="flex justify-center gap-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="bg-green-500/30 border-2 border-green-500 rounded-lg px-4 py-2 text-center"
                >
                  <div className="text-xs text-green-400">prev2</div>
                  <div className="text-xl font-mono font-bold text-green-400">
                    {optPrev2}
                  </div>
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0.5 }}
                  className="bg-emerald-500/30 border-2 border-emerald-500 rounded-lg px-4 py-2 text-center"
                >
                  <div className="text-xs text-emerald-400">prev1</div>
                  <div className="text-xl font-mono font-bold text-emerald-400">
                    {optPrev1}
                  </div>
                </motion.div>
              </div>
            </div>

            <div className="mt-2 text-xs text-green-300">
              ✓ Minimal memory, maximum efficiency!
            </div>
          </motion.div>
        </div>

        {/* Summary */}
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl"
          >
            <h4 className="text-green-400 font-semibold mb-3">
              Race Complete! fib({n}) = {finalAnswer}
            </h4>
            <div className="grid grid-cols-4 gap-4 text-center text-sm">
              <div>
                <div className="text-red-400 font-bold">{recursionCalls}+</div>
                <div className="text-gray-500">Recursion Calls</div>
              </div>
              <div>
                <div className="text-yellow-400 font-bold">{memoCalls}</div>
                <div className="text-gray-500">Memo Calls</div>
              </div>
              <div>
                <div className="text-blue-400 font-bold">{n + 1}</div>
                <div className="text-gray-500">Tab Iterations</div>
              </div>
              <div>
                <div className="text-green-400 font-bold">2 vars</div>
                <div className="text-gray-500">Space Used</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
