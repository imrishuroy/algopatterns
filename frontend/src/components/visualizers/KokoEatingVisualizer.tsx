"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

interface Step {
  left: number;
  right: number;
  mid: number;
  hoursNeeded: number;
  canFinish: boolean;
  message: string;
}

export default function KokoEatingVisualizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [piles] = useState([3, 6, 7, 11]);
  const [hours] = useState(8);
  const [left, setLeft] = useState(1);
  const [right, setRight] = useState(11);
  const [mid, setMid] = useState(-1);
  const [currentHours, setCurrentHours] = useState<number | null>(null);
  const [answer, setAnswer] = useState<number | null>(null);
  const [phase, setPhase] = useState<"init" | "running" | "done">("init");
  const [message, setMessage] = useState(
    "Click Play to find minimum eating speed"
  );
  const [stepIndex, setStepIndex] = useState(-1);
  const [steps, setSteps] = useState<Step[]>([]);

  const calculateHours = (pilesList: number[], spd: number): number => {
    return pilesList.reduce((acc, pile) => acc + Math.ceil(pile / spd), 0);
  };

  const generateSteps = useCallback(() => {
    const allSteps: Step[] = [];
    let l = 1,
      r = Math.max(...piles);

    while (l < r) {
      const m = l + Math.floor((r - l) / 2);
      const hrs = calculateHours(piles, m);
      const canFinish = hrs <= hours;

      allSteps.push({
        left: l,
        right: r,
        mid: m,
        hoursNeeded: hrs,
        canFinish,
        message: `Speed ${m}: ${piles.map((p) => Math.ceil(p / m)).join(" + ")} = ${hrs} hours. ${canFinish ? `${hrs} <= ${hours}, try slower.` : `${hrs} > ${hours}, need faster.`}`,
      });

      if (canFinish) {
        r = m;
      } else {
        l = m + 1;
      }
    }

    return allSteps;
  }, [piles, hours]);

  const reset = useCallback(() => {
    setLeft(1);
    setRight(Math.max(...piles));
    setMid(-1);
    setCurrentHours(null);
    setAnswer(null);
    setPhase("init");
    setMessage("Click Play to find minimum eating speed");
    setStepIndex(-1);
    setSteps(generateSteps());
    setIsPlaying(false);
  }, [piles, generateSteps]);

  useEffect(() => {
    setSteps(generateSteps());
  }, [generateSteps]);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (phase === "init") {
        setPhase("running");
        setStepIndex(0);
        const step = steps[0];
        setLeft(step.left);
        setRight(step.right);
        setMid(step.mid);
        setCurrentHours(step.hoursNeeded);
        setMessage(step.message);
        return;
      }

      const nextStepIdx = stepIndex + 1;
      if (nextStepIdx >= steps.length) {
        setPhase("done");
        const finalSpeed = steps[steps.length - 1].canFinish
          ? steps[steps.length - 1].mid
          : steps[steps.length - 1].mid + 1;
        setAnswer(left);
        setMessage(
          `Minimum speed = ${left} bananas/hour to finish in ${hours} hours`
        );
        setIsPlaying(false);
        return;
      }

      const step = steps[nextStepIdx];
      setStepIndex(nextStepIdx);
      setLeft(step.left);
      setRight(step.right);
      setMid(step.mid);
      setCurrentHours(step.hoursNeeded);
      setMessage(step.message);
    }, speed);

    return () => clearTimeout(timer);
  }, [isPlaying, phase, stepIndex, steps, hours, left, speed]);

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">
          Binary Search on Answer
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Koko Eating Bananas - Find minimum speed to finish in time
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
              min="600"
              max="1400"
              step="100"
              value={2000 - speed}
              onChange={(e) => setSpeed(2000 - Number(e.target.value))}
              className="w-20 accent-yellow-500"
            />
          </div>
        </div>

        {/* Problem setup */}
        <div className="mb-4 grid grid-cols-2 gap-2">
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-center">
            <div className="text-gray-400 text-sm">Time Limit</div>
            <span className="text-yellow-400 font-bold text-xl">
              {hours} hours
            </span>
          </div>
          <div className="p-3 bg-gray-800/50 rounded-lg text-center">
            <div className="text-gray-400 text-sm">Speed Range</div>
            <span className="text-gray-300 font-mono">
              [{left}, {right}]
            </span>
          </div>
        </div>

        {/* Banana piles */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">Banana Piles:</div>
          <div className="flex gap-3 justify-center">
            {piles.map((pile, idx) => (
              <div key={`pile-${pile}-${idx}`} className="flex flex-col items-center">
                <div className="text-2xl mb-1">🍌</div>
                <motion.div
                  animate={{
                    backgroundColor: mid > 0 ? "#f59e0b" : "#4b5563",
                  }}
                  className="w-14 h-14 rounded-lg flex flex-col items-center justify-center"
                >
                  <span className="font-bold text-white">{pile}</span>
                  {mid > 0 && (
                    <span className="text-xs text-yellow-200">
                      {Math.ceil(pile / mid)}h
                    </span>
                  )}
                </motion.div>
              </div>
            ))}
          </div>
        </div>

        {/* Search space visualization */}
        <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
          <div className="text-sm text-gray-400 mb-2">
            Search Space (Speed):
          </div>
          <div className="relative h-8 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              animate={{
                left: `${((left - 1) / 10) * 100}%`,
                width: `${((right - left + 1) / 11) * 100}%`,
              }}
              className="absolute h-full bg-yellow-500/30"
            />
            {mid > 0 && (
              <motion.div
                animate={{
                  left: `${((mid - 1) / 10) * 100}%`,
                }}
                className="absolute top-0 w-1 h-full bg-yellow-400"
              />
            )}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1</span>
            <span>Speed</span>
            <span>11</span>
          </div>
        </div>

        {/* Current test */}
        {mid > 0 && phase === "running" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`mb-4 p-3 rounded-lg text-center ${
              currentHours !== null && currentHours <= hours
                ? "bg-green-500/20 border border-green-500/50"
                : "bg-red-500/20 border border-red-500/50"
            }`}
          >
            <div className="text-lg font-bold">
              <span className="text-gray-300">Testing speed </span>
              <span className="text-yellow-400">{mid}</span>
            </div>
            <div
              className={
                currentHours !== null && currentHours <= hours
                  ? "text-green-400"
                  : "text-red-400"
              }
            >
              {currentHours} hours needed{" "}
              {currentHours !== null && currentHours <= hours ? "✓" : "✗"}
            </div>
          </motion.div>
        )}

        {/* Result */}
        {answer !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-center"
          >
            <div className="text-green-400 font-bold text-lg">
              Minimum Speed = {answer} bananas/hour
            </div>
            <div className="text-gray-400 text-sm mt-1">
              Hours needed: {calculateHours(piles, answer)} ≤ {hours} ✓
            </div>
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
            <strong className="text-yellow-400">
              Binary Search on Answer:
            </strong>{" "}
            Instead of searching an array, search the range of possible answers
            [1, max(piles)]. Use a predicate{" "}
            <code className="text-amber-400">canFinish(speed)</code> to guide
            the search.
          </p>
        </div>
      </div>
    </div>
  );
}
