"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

export default function ProductExceptSelfVisualizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [leftIdx, setLeftIdx] = useState(0);
  const [rightIdx, setRightIdx] = useState(3);
  const [leftProducts, setLeftProducts] = useState<number[]>([]);
  const [rightProduct, setRightProduct] = useState(1);
  const [result, setResult] = useState<number[]>([]);
  const [phase, setPhase] = useState<
    "init" | "left-pass" | "right-pass" | "done"
  >("init");
  const [message, setMessage] = useState(
    "Click Play to compute product except self"
  );

  const arr = [1, 2, 3, 4];

  const reset = useCallback(() => {
    setLeftIdx(0);
    setRightIdx(arr.length - 1);
    setLeftProducts([]);
    setRightProduct(1);
    setResult([]);
    setPhase("init");
    setMessage("Click Play to compute product except self (without division)");
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (phase === "init") {
        setPhase("left-pass");
        setLeftProducts([1]);
        setResult([1, 0, 0, 0]);
        setMessage(
          "Pass 1: Build left products (product of all elements to the left)"
        );
      } else if (phase === "left-pass") {
        if (leftIdx >= arr.length - 1) {
          setPhase("right-pass");
          setRightIdx(arr.length - 1);
          setMessage(
            "Pass 2: Multiply by right products (product of all elements to the right)"
          );
          return;
        }

        const newLeftProduct = leftProducts[leftIdx] * arr[leftIdx];
        const newLeftProducts = [...leftProducts, newLeftProduct];
        const newResult = [...result];
        newResult[leftIdx + 1] = newLeftProduct;

        setLeftProducts(newLeftProducts);
        setResult(newResult);
        setMessage(
          `result[${leftIdx + 1}] = result[${leftIdx}] × arr[${leftIdx}] = ${leftProducts[leftIdx]} × ${arr[leftIdx]} = ${newLeftProduct}`
        );
        setLeftIdx(leftIdx + 1);
      } else if (phase === "right-pass") {
        if (rightIdx < 0) {
          setPhase("done");
          setMessage(`Done! Product except self: [${result.join(", ")}]`);
          setIsPlaying(false);
          return;
        }

        const newResult = [...result];
        newResult[rightIdx] = result[rightIdx] * rightProduct;

        setResult(newResult);
        setMessage(
          `result[${rightIdx}] = ${result[rightIdx]} × rightProduct(${rightProduct}) = ${newResult[rightIdx]}`
        );

        setRightProduct(rightProduct * arr[rightIdx]);
        setRightIdx(rightIdx - 1);
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [
    isPlaying,
    phase,
    leftIdx,
    rightIdx,
    leftProducts,
    rightProduct,
    result,
    arr,
    speed,
  ]);

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">
          Product of Array Except Self
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Two passes: Left products × Right products (no division needed)
        </p>
      </div>

      <div className="p-4">
        {/* Controls */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={phase === "done"}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              isPlaying ? "bg-yellow-500 text-black" : "bg-green-500 text-white"
            } disabled:opacity-50`}
          >
            {isPlaying ? "Pause" : "Play"}
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
              min="400"
              max="1500"
              step="100"
              value={1900 - speed}
              onChange={(e) => setSpeed(1900 - Number(e.target.value))}
              className="w-20 accent-violet-500"
            />
          </div>
        </div>

        {/* Phase indicator */}
        <div className="mb-4 flex gap-2">
          <div
            className={`flex-1 p-2 rounded-lg text-center text-sm font-medium ${
              phase === "left-pass"
                ? "bg-blue-500 text-white"
                : phase === "right-pass" || phase === "done"
                  ? "bg-blue-500/30 text-blue-300"
                  : "bg-gray-800 text-gray-500"
            }`}
          >
            Pass 1: Left Products →
          </div>
          <div
            className={`flex-1 p-2 rounded-lg text-center text-sm font-medium ${
              phase === "right-pass"
                ? "bg-green-500 text-white"
                : phase === "done"
                  ? "bg-green-500/30 text-green-300"
                  : "bg-gray-800 text-gray-500"
            }`}
          >
            ← Pass 2: Right Products
          </div>
        </div>

        {/* Original Array */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">Original Array:</div>
          <div className="flex gap-2">
            {arr.map((val, idx) => (
              <motion.div
                key={`idx-${idx}`}
                animate={{
                  scale:
                    (phase === "left-pass" && idx === leftIdx) ||
                    (phase === "right-pass" && idx === rightIdx)
                      ? 1.1
                      : 1,
                  y:
                    (phase === "left-pass" && idx === leftIdx) ||
                    (phase === "right-pass" && idx === rightIdx)
                      ? -5
                      : 0,
                }}
                className={`w-14 h-14 rounded-lg flex flex-col items-center justify-center font-mono ${
                  phase === "left-pass" && idx === leftIdx
                    ? "bg-blue-500 text-white ring-2 ring-blue-300"
                    : phase === "right-pass" && idx === rightIdx
                      ? "bg-green-500 text-white ring-2 ring-green-300"
                      : "bg-gray-700 text-gray-300"
                }`}
              >
                <span className="text-lg font-bold">{val}</span>
                <span className="text-xs opacity-70">[{idx}]</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Left Products (during left pass) */}
        {(phase === "left-pass" ||
          phase === "right-pass" ||
          phase === "done") && (
          <div className="mb-4">
            <div className="text-sm text-blue-400 mb-2">
              Left Products (product of elements to the left):
            </div>
            <div className="flex gap-2">
              {leftProducts.map((val, idx) => (
                <motion.div
                  key={`idx-${idx}`}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-14 h-10 rounded-lg bg-blue-500/30 flex items-center justify-center font-mono text-blue-300"
                >
                  {val}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Right Product tracker */}
        {phase === "right-pass" && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <span className="text-gray-400">Right Product (running): </span>
            <span className="text-2xl font-bold text-green-400">
              {rightProduct}
            </span>
          </div>
        )}

        {/* Result Array */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">
            Result (Product Except Self):
          </div>
          <div className="flex gap-2">
            {result.length > 0
              ? result.map((val, idx) => (
                  <motion.div
                    key={`idx-${idx}`}
                    animate={{
                      backgroundColor:
                        (phase === "left-pass" && idx === leftIdx + 1) ||
                        (phase === "right-pass" && idx === rightIdx)
                          ? "#a855f7"
                          : "#7c3aed",
                    }}
                    className="w-14 h-14 rounded-lg flex flex-col items-center justify-center font-mono text-white"
                  >
                    <span className="text-lg font-bold">{val}</span>
                    <span className="text-xs opacity-70">[{idx}]</span>
                  </motion.div>
                ))
              : arr.map((_, idx) => (
                  <div
                    key={`idx-${idx}`}
                    className="w-14 h-14 rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center text-gray-500"
                  >
                    ?
                  </div>
                ))}
          </div>
        </div>

        {/* Expected result */}
        {phase === "done" && (
          <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <div className="text-sm text-gray-400">
              Verification: Each result[i] = product of all elements except
              arr[i]
            </div>
            <div className="text-sm text-purple-300 mt-1">
              [24, 12, 8, 6] = [2×3×4, 1×3×4, 1×2×4, 1×2×3]
            </div>
          </div>
        )}

        {/* Message */}
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-lg text-sm ${
            phase === "done"
              ? "bg-green-500/10 border border-green-500/30 text-green-400"
              : "bg-gray-800 text-gray-300"
          }`}
        >
          {message}
        </motion.div>

        {/* Algorithm explanation */}
        <div className="mt-4 p-3 bg-gray-800/30 rounded-lg text-sm text-gray-400">
          <p>
            <strong className="text-violet-400">Key Insight:</strong> result[i]
            = (product of all left) × (product of all right). Build left
            products forward, then multiply by right products backward.
          </p>
        </div>
      </div>
    </div>
  );
}
