"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

// Linked list with cycle: 1 -> 2 -> 3 -> 4 -> 5 -> 3 (cycle back to index 2)
const nodes = [1, 2, 3, 4, 5];
const cycleStartIdx = 2; // Node 3 is the cycle start

function getNextIdx(idx: number): number {
  if (idx === nodes.length - 1) {
    return cycleStartIdx; // Last node points back to cycle start
  }
  return idx + 1;
}

export default function CycleDetectionVisualizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [slowIdx, setSlowIdx] = useState(0);
  const [fastIdx, setFastIdx] = useState(0);
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<
    "init" | "detecting" | "found" | "finding-start" | "done"
  >("init");
  const [message, setMessage] = useState(
    "Click Play to detect cycle using Floyd's algorithm"
  );
  const [visitedSlow, setVisitedSlow] = useState<Set<number>>(new Set());
  const [visitedFast, setVisitedFast] = useState<Set<number>>(new Set());

  // Linked list with cycle: 1 -> 2 -> 3 -> 4 -> 5 -> 3 (cycle back to index 2)

  const reset = useCallback(() => {
    setSlowIdx(0);
    setFastIdx(0);
    setStep(0);
    setPhase("init");
    setVisitedSlow(new Set());
    setVisitedFast(new Set());
    setMessage("Click Play to detect cycle using Floyd's algorithm");
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (phase === "init") {
        setPhase("detecting");
        setMessage("Start: Both pointers at head. Slow moves 1, Fast moves 2.");
        setVisitedSlow(new Set([0]));
        setVisitedFast(new Set([0]));
      } else if (phase === "detecting") {
        const newSlowIdx = getNextIdx(slowIdx);
        const newFastIdx = getNextIdx(getNextIdx(fastIdx));

        setStep(step + 1);
        setSlowIdx(newSlowIdx);
        setFastIdx(newFastIdx);
        setVisitedSlow(new Set([...visitedSlow, newSlowIdx]));
        setVisitedFast(new Set([...visitedFast, newFastIdx]));

        if (newSlowIdx === newFastIdx) {
          setPhase("found");
          setMessage(
            `Step ${step + 1}: CYCLE DETECTED! Slow and Fast meet at node ${nodes[newSlowIdx]}`
          );
        } else {
          setMessage(
            `Step ${step + 1}: Slow at ${nodes[newSlowIdx]}, Fast at ${nodes[newFastIdx]}`
          );
        }
      } else if (phase === "found") {
        setSlowIdx(0);
        setPhase("finding-start");
        setMessage(
          "Now find cycle start: Move slow to head, both move 1 step at a time"
        );
      } else if (phase === "finding-start") {
        if (slowIdx === 0 && fastIdx !== 0) {
          // First step after reset
          setSlowIdx(0);
          setMessage(
            `Slow at head (${nodes[0]}), Fast at ${nodes[fastIdx]}. Both move 1 step.`
          );
        }

        const nextSlow =
          slowIdx === 0 ? getNextIdx(slowIdx) : getNextIdx(slowIdx);
        const nextFast = getNextIdx(fastIdx);

        setSlowIdx(nextSlow);
        setFastIdx(nextFast);

        if (nextSlow === nextFast) {
          setPhase("done");
          setMessage(
            `Cycle starts at node ${nodes[nextSlow]}! Both pointers meet at the cycle entry.`
          );
          setIsPlaying(false);
        } else {
          setMessage(
            `Moving: Slow to ${nodes[nextSlow]}, Fast to ${nodes[nextFast]}`
          );
        }
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [
    isPlaying,
    phase,
    slowIdx,
    fastIdx,
    step,
    visitedSlow,
    visitedFast,
    speed,
  ]);

  // Calculate positions for circular layout of cycle
  const getNodePosition = (idx: number) => {
    if (idx < cycleStartIdx) {
      // Linear part before cycle
      return { x: 60 + idx * 80, y: 60 };
    }
    // Cycle part - arrange in a circle
    const cycleLength = nodes.length - cycleStartIdx;
    const cycleIdx = idx - cycleStartIdx;
    const angle = (cycleIdx / cycleLength) * Math.PI * 1.5 - Math.PI / 2;
    const radius = 70;
    const centerX = 60 + cycleStartIdx * 80 + radius;
    const centerY = 60 + radius + 20;
    return {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
    };
  };

  return (
    <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-green-500/10 to-teal-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">
          Cycle Detection (Floyd&apos;s Algorithm)
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Fast/Slow pointers: if they meet, there&apos;s a cycle
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
              className="w-20 accent-green-500"
            />
          </div>
        </div>

        {/* List info */}
        <div className="mb-4 p-3 bg-gray-800/50 rounded-md">
          <div className="text-sm text-gray-400">
            List: 1 → 2 → 3 → 4 → 5 →{" "}
            <span className="text-red-400">(back to 3)</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Cycle starts at node 3
          </div>
        </div>

        {/* Visual representation */}
        <div className="mb-6 relative h-48 bg-gray-800/30 rounded-md overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 450 180">
            {/* Draw arrows */}
            {nodes.map((_, idx) => {
              const start = getNodePosition(idx);
              const end = getNodePosition(getNextIdx(idx));
              const isCycleBack = idx === nodes.length - 1;

              return (
                <g key={`arrow-${idx}`}>
                  <line
                    x1={start.x + 15}
                    y1={start.y}
                    x2={end.x - 15}
                    y2={end.y}
                    stroke={isCycleBack ? "#ef4444" : "#6b7280"}
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                </g>
              );
            })}

            {/* Arrow marker */}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
              </marker>
            </defs>

            {/* Draw nodes */}
            {nodes.map((val, idx) => {
              const pos = getNodePosition(idx);
              const isSlow = idx === slowIdx;
              const isFast = idx === fastIdx;
              const isBoth = isSlow && isFast;
              const isCycleStart = idx === cycleStartIdx;

              return (
                <g key={`node-${idx}`}>
                  <motion.circle
                    cx={pos.x}
                    cy={pos.y}
                    r="20"
                    fill={
                      isBoth
                        ? "#eab308"
                        : isSlow
                          ? "#3b82f6"
                          : isFast
                            ? "#10b981"
                            : isCycleStart
                              ? "#ef4444"
                              : "#374151"
                    }
                    animate={{
                      scale: isBoth ? 1.2 : isSlow || isFast ? 1.1 : 1,
                    }}
                  />
                  <text
                    x={pos.x}
                    y={pos.y + 5}
                    textAnchor="middle"
                    fill="white"
                    fontSize="14"
                    fontWeight="bold"
                  >
                    {val}
                  </text>
                  {/* Labels */}
                  {(isSlow || isFast) && (
                    <text
                      x={pos.x}
                      y={pos.y - 28}
                      textAnchor="middle"
                      fill={isBoth ? "#eab308" : isSlow ? "#3b82f6" : "#10b981"}
                      fontSize="10"
                      fontWeight="bold"
                    >
                      {isBoth ? "S+F" : isSlow ? "Slow" : "Fast"}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Pointer Status */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-md p-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500" />
              <span className="text-sm text-gray-400">Slow Pointer</span>
            </div>
            <div className="text-2xl font-bold text-blue-400 mt-1">
              {nodes[slowIdx]}
            </div>
            <div className="text-xs text-gray-500">Moves 1 step</div>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-md p-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500" />
              <span className="text-sm text-gray-400">Fast Pointer</span>
            </div>
            <div className="text-2xl font-bold text-green-400 mt-1">
              {nodes[fastIdx]}
            </div>
            <div className="text-xs text-gray-500">Moves 2 steps</div>
          </div>
        </div>

        {/* Step counter */}
        <div className="mb-4 text-center">
          <span className="text-gray-500">Step: </span>
          <span className="text-xl font-bold text-purple-400">{step}</span>
        </div>

        {/* Message */}
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-md text-sm ${
            phase === "done"
              ? "bg-green-500/10 border border-green-500/30 text-green-400"
              : phase === "found"
                ? "bg-yellow-500/10 border border-yellow-500/30 text-yellow-400"
                : "bg-gray-800 text-gray-300"
          }`}
        >
          {message}
        </motion.div>

        {/* Algorithm explanation */}
        <div className="mt-4 p-3 bg-gray-800/30 rounded-md text-sm text-gray-400">
          <p>
            <strong className="text-green-400">Key Insight:</strong> If
            there&apos;s a cycle, fast will lap slow. After meeting, reset slow
            to head - they&apos;ll meet at cycle start.
          </p>
        </div>
      </div>
    </div>
  );
}
