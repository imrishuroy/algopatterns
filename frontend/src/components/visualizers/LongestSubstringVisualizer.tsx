"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LongestSubstringVisualizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [left, setLeft] = useState(0);
  const [right, setRight] = useState(-1);
  const [seen, setSeen] = useState<Set<string>>(new Set());
  const [maxLen, setMaxLen] = useState(0);
  const [maxWindow, setMaxWindow] = useState<[number, number] | null>(null);
  const [phase, setPhase] = useState<
    "init" | "expanding" | "shrinking" | "done"
  >("init");
  const [message, setMessage] = useState(
    "Click Play to find longest substring without repeating characters"
  );

  const str = "abcabcbb";

  const reset = useCallback(() => {
    setLeft(0);
    setRight(-1);
    setSeen(new Set());
    setMaxLen(0);
    setMaxWindow(null);
    setPhase("init");
    setMessage(
      "Click Play to find longest substring without repeating characters"
    );
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (phase === "init") {
        setPhase("expanding");
        setRight(0);
        setMessage("Starting: Try to expand the window to the right");
      } else if (phase === "expanding") {
        if (right >= str.length) {
          setPhase("done");
          setMessage(
            `Done! Longest substring without repeating: "${str.slice(maxWindow![0], maxWindow![1] + 1)}" (length ${maxLen})`
          );
          setIsPlaying(false);
          return;
        }

        const char = str[right];

        if (seen.has(char)) {
          // Duplicate found - need to shrink
          setPhase("shrinking");
          setMessage(`'${char}' already in window! Need to shrink from left`);
        } else {
          // Can expand
          const newSeen = new Set(seen);
          newSeen.add(char);
          setSeen(newSeen);

          const windowLen = right - left + 1;
          if (windowLen > maxLen) {
            setMaxLen(windowLen);
            setMaxWindow([left, right]);
          }

          setMessage(
            `Add '${char}'. Window = "${str.slice(left, right + 1)}" (len=${windowLen})`
          );
          setRight(right + 1);
        }
      } else if (phase === "shrinking") {
        const charToAdd = str[right];
        const charToRemove = str[left];

        const newSeen = new Set(seen);
        newSeen.delete(charToRemove);
        setSeen(newSeen);
        setMessage(
          `Remove '${charToRemove}' from left. Looking for '${charToAdd}'...`
        );
        setLeft(left + 1);

        // Check if we can now add the character
        if (charToRemove === charToAdd) {
          setPhase("expanding");
        }
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [isPlaying, phase, left, right, seen, maxLen, maxWindow, str, speed]);

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">
          Longest Substring Without Repeating
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Variable-size window with Set for uniqueness
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
              className="w-20 accent-purple-500"
            />
          </div>
        </div>

        {/* String visualization */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">String: &quot;{str}&quot;</div>
          <div className="flex gap-1">
            {str.split("").map((char, idx) => {
              const inWindow =
                idx >= left && idx < (right >= 0 ? right + 1 : 0);
              const isRight = idx === right;
              const isLeft = idx === left && phase !== "init";
              const isDuplicate = isRight && seen.has(char);
              const isMaxWindow =
                maxWindow &&
                idx >= maxWindow[0] &&
                idx <= maxWindow[1] &&
                phase === "done";

              return (
                <motion.div
                  key={`char-${char}-${idx}`}
                  animate={{
                    scale: isRight || isLeft ? 1.1 : 1,
                    y: isRight ? -8 : isLeft ? -4 : 0,
                  }}
                  className={`w-10 h-12 rounded-lg flex flex-col items-center justify-center font-mono relative ${
                    isDuplicate
                      ? "bg-red-500 text-white ring-2 ring-red-300"
                      : isMaxWindow
                        ? "bg-green-500 text-white"
                        : inWindow
                          ? "bg-purple-500 text-white"
                          : "bg-gray-700 text-gray-300"
                  }`}
                >
                  <span className="text-lg font-bold">{char}</span>
                  <span className="text-xs opacity-70">{idx}</span>
                  {isLeft && (
                    <div className="absolute -top-6 text-xs text-yellow-400 font-bold">
                      L
                    </div>
                  )}
                  {isRight && (
                    <div className="absolute -top-6 text-xs text-blue-400 font-bold">
                      R
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Seen characters */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">
            Characters in Window (Set):
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 min-h-[48px]">
            <div className="flex gap-2 flex-wrap">
              <AnimatePresence>
                {Array.from(seen).map((char) => (
                  <motion.div
                    key={char}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    className="px-3 py-1 bg-purple-500/30 rounded-lg font-mono text-purple-300"
                  >
                    '{char}'
                  </motion.div>
                ))}
              </AnimatePresence>
              {seen.size === 0 && (
                <span className="text-gray-500 italic">Empty</span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">Current Window</div>
            <div className="text-lg font-mono text-purple-400">
              {right >= left ? `"${str.slice(left, right + 1)}"` : '""'}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">Current Length</div>
            <div className="text-2xl font-bold text-purple-400">
              {Math.max(0, right - left + 1)}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">Max Length</div>
            <div className="text-2xl font-bold text-green-400">{maxLen}</div>
          </div>
        </div>

        {/* Phase indicator */}
        <div className="mb-4 flex gap-2">
          <div
            className={`flex-1 p-2 rounded-lg text-center text-sm font-medium ${
              phase === "expanding"
                ? "bg-green-500 text-white"
                : "bg-gray-800 text-gray-500"
            }`}
          >
            Expanding →
          </div>
          <div
            className={`flex-1 p-2 rounded-lg text-center text-sm font-medium ${
              phase === "shrinking"
                ? "bg-red-500 text-white"
                : "bg-gray-800 text-gray-500"
            }`}
          >
            ← Shrinking
          </div>
        </div>

        {/* Message */}
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-lg text-sm ${
            phase === "done"
              ? "bg-green-500/10 border border-green-500/30 text-green-400"
              : phase === "shrinking"
                ? "bg-red-500/10 border border-red-500/30 text-red-400"
                : "bg-gray-800 text-gray-300"
          }`}
        >
          {message}
        </motion.div>

        {/* Algorithm explanation */}
        <div className="mt-4 p-3 bg-gray-800/30 rounded-lg text-sm text-gray-400">
          <p>
            <strong className="text-purple-400">Key Insight:</strong> Use a Set
            to track characters in window. When duplicate found, shrink from
            left until the duplicate is removed. Update max AFTER shrinking
            (when window is valid).
          </p>
        </div>
      </div>
    </div>
  );
}
