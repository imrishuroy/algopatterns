"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

export default function ContainerWaterVisualizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(900);
  const [heights] = useState([1, 8, 6, 2, 5, 4, 8, 3, 7]);
  const [left, setLeft] = useState(0);
  const [right, setRight] = useState(8);
  const [maxArea, setMaxArea] = useState(0);
  const [currentArea, setCurrentArea] = useState(0);
  const [bestLeft, setBestLeft] = useState(-1);
  const [bestRight, setBestRight] = useState(-1);
  const [phase, setPhase] = useState<"init" | "running" | "done">("init");
  const [message, setMessage] = useState(
    "Click Play to find maximum water container"
  );

  const reset = useCallback(() => {
    setLeft(0);
    setRight(heights.length - 1);
    setMaxArea(0);
    setCurrentArea(0);
    setBestLeft(-1);
    setBestRight(-1);
    setPhase("init");
    setMessage("Click Play to find maximum water container");
    setIsPlaying(false);
  }, [heights.length]);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (phase === "init") {
        setPhase("running");
        const width = right - left;
        const h = Math.min(heights[left], heights[right]);
        const area = width * h;
        setCurrentArea(area);
        setMaxArea(area);
        setBestLeft(left);
        setBestRight(right);
        setMessage(
          `Area = min(${heights[left]}, ${heights[right]}) × ${width} = ${area}`
        );
      } else if (phase === "running") {
        if (left >= right) {
          setPhase("done");
          setMessage(
            `Done! Maximum area = ${maxArea} at indices [${bestLeft}, ${bestRight}]`
          );
          setIsPlaying(false);
          return;
        }

        // Calculate current area
        const width = right - left;
        const h = Math.min(heights[left], heights[right]);
        const area = width * h;
        setCurrentArea(area);

        if (area > maxArea) {
          setMaxArea(area);
          setBestLeft(left);
          setBestRight(right);
          setMessage(`New max! Area = ${area} (${heights[left]} × ${width})`);
        }

        // Move the shorter line
        if (heights[left] < heights[right]) {
          setMessage(
            `height[${left}]=${heights[left]} < height[${right}]=${heights[right]}, move left pointer`
          );
          setLeft(left + 1);
        } else {
          setMessage(
            `height[${left}]=${heights[left]} >= height[${right}]=${heights[right]}, move right pointer`
          );
          setRight(right - 1);
        }
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [
    isPlaying,
    phase,
    left,
    right,
    heights,
    maxArea,
    bestLeft,
    bestRight,
    speed,
  ]);

  const maxHeight = Math.max(...heights);
  const barWidth = 30;
  const gap = 8;
  const svgWidth = heights.length * (barWidth + gap);
  const svgHeight = maxHeight * 25 + 40;

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">
          Container With Most Water
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Move shorter line inward to find maximum area
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
              max="1400"
              step="100"
              value={1800 - speed}
              onChange={(e) => setSpeed(1800 - Number(e.target.value))}
              className="w-20 accent-cyan-500"
            />
          </div>
        </div>

        {/* Area display */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-800/50 rounded-lg">
            <span className="text-gray-400 text-sm">Current Area: </span>
            <span className="text-cyan-400 font-bold text-xl">
              {currentArea}
            </span>
          </div>
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <span className="text-gray-400 text-sm">Max Area: </span>
            <span className="text-cyan-400 font-bold text-xl">{maxArea}</span>
          </div>
        </div>

        {/* Container visualization */}
        <div className="mb-4 flex justify-center overflow-x-auto">
          <svg
            width={svgWidth}
            height={svgHeight}
            className="bg-gray-800/30 rounded-lg"
          >
            {/* Water area */}
            {phase !== "init" && (
              <motion.rect
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                x={left * (barWidth + gap) + barWidth / 2}
                y={
                  svgHeight - 20 - Math.min(heights[left], heights[right]) * 25
                }
                width={(right - left) * (barWidth + gap)}
                height={Math.min(heights[left], heights[right]) * 25}
                fill="#06b6d4"
              />
            )}

            {/* Bars */}
            {heights.map((h, idx) => (
              <g key={`height-${h}-${idx}`}>
                <motion.rect
                  x={idx * (barWidth + gap)}
                  y={svgHeight - 20 - h * 25}
                  width={barWidth}
                  height={h * 25}
                  rx={4}
                  animate={{
                    fill:
                      idx === bestLeft || idx === bestRight
                        ? "#22c55e"
                        : idx === left
                          ? "#3b82f6"
                          : idx === right
                            ? "#f59e0b"
                            : "#4b5563",
                  }}
                />
                <text
                  x={idx * (barWidth + gap) + barWidth / 2}
                  y={svgHeight - 5}
                  textAnchor="middle"
                  className="fill-gray-400 text-xs"
                >
                  {h}
                </text>
                {idx === left && (
                  <text
                    x={idx * (barWidth + gap) + barWidth / 2}
                    y={svgHeight - 25 - h * 25}
                    textAnchor="middle"
                    className="fill-blue-400 text-sm font-bold"
                  >
                    L
                  </text>
                )}
                {idx === right && (
                  <text
                    x={idx * (barWidth + gap) + barWidth / 2}
                    y={svgHeight - 25 - h * 25}
                    textAnchor="middle"
                    className="fill-yellow-400 text-sm font-bold"
                  >
                    R
                  </text>
                )}
              </g>
            ))}
          </svg>
        </div>

        {/* Formula */}
        {phase !== "init" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 p-3 bg-gray-800/50 rounded-lg text-center font-mono"
          >
            <span className="text-gray-400">Area = min(</span>
            <span className="text-blue-400">{heights[left]}</span>
            <span className="text-gray-400">, </span>
            <span className="text-yellow-400">{heights[right]}</span>
            <span className="text-gray-400">) × (</span>
            <span className="text-yellow-400">{right}</span>
            <span className="text-gray-400"> - </span>
            <span className="text-blue-400">{left}</span>
            <span className="text-gray-400">) = </span>
            <span className="text-cyan-400 font-bold">{currentArea}</span>
          </motion.div>
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

        {/* Key insight */}
        <div className="mt-4 p-3 bg-gray-800/30 rounded-lg text-sm text-gray-400">
          <p>
            <strong className="text-cyan-400">Key Insight:</strong> Always move
            the shorter line. The shorter line limits height, so keeping it can
            only decrease area as width shrinks.
          </p>
        </div>
      </div>
    </div>
  );
}
