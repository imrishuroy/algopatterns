"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FindAnagramsVisualizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(900);
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [sFreq, setSFreq] = useState<Map<string, number>>(new Map());
  const [matches, setMatches] = useState(0);
  const [foundIndices, setFoundIndices] = useState<number[]>([]);
  const [phase, setPhase] = useState<"init" | "processing" | "done">("init");
  const [message, setMessage] = useState(
    'Click Play to find all anagrams of "abc" in the string'
  );

  const s = "cbaebabacd";
  const p = "abc";

  const pFreq = useMemo(
    () =>
      new Map<string, number>([
        ["a", 1],
        ["b", 1],
        ["c", 1],
      ]),
    []
  );
  const required = pFreq.size; // 3

  const reset = useCallback(() => {
    setCurrentIdx(-1);
    setSFreq(new Map());
    setMatches(0);
    setFoundIndices([]);
    setPhase("init");
    setMessage(`Click Play to find all anagrams of "${p}" in the string`);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (phase === "init") {
        setPhase("processing");
        setCurrentIdx(0);
        setMessage(
          `Pattern "${p}" has ${required} unique characters: {a:1, b:1, c:1}`
        );
      } else if (phase === "processing") {
        if (currentIdx >= s.length) {
          setPhase("done");
          setMessage(
            `Done! Found ${foundIndices.length} anagrams at indices: [${foundIndices.join(", ")}]`
          );
          setIsPlaying(false);
          return;
        }

        const newFreq = new Map(sFreq);
        let newMatches = matches;

        // Add right character
        const c = s[currentIdx];
        const prevCount = newFreq.get(c) || 0;
        newFreq.set(c, prevCount + 1);

        // Check if this char now matches pattern
        if (newFreq.get(c) === pFreq.get(c)) {
          newMatches++;
        } else if (prevCount === pFreq.get(c)) {
          // Was matching, now doesn't
          newMatches--;
        }

        // Remove left character when window exceeds pattern length
        if (currentIdx >= p.length) {
          const leftIdx = currentIdx - p.length;
          const left = s[leftIdx];
          const leftPrevCount = newFreq.get(left) || 0;

          if (leftPrevCount === pFreq.get(left)) {
            newMatches--; // Was matching, will decrease
          } else if (leftPrevCount === (pFreq.get(left) || 0) + 1) {
            newMatches++; // Will match after decrease
          }
          newFreq.set(left, leftPrevCount - 1);
          if (newFreq.get(left) === 0) newFreq.delete(left);
        }

        setSFreq(newFreq);
        setMatches(newMatches);

        // Check if we found an anagram
        if (newMatches === required && currentIdx >= p.length - 1) {
          const startIdx = currentIdx - p.length + 1;
          setFoundIndices([...foundIndices, startIdx]);
          setMessage(
            `Anagram found at index ${startIdx}! Window "${s.slice(startIdx, currentIdx + 1)}" matches "${p}"`
          );
        } else {
          const windowStart = Math.max(0, currentIdx - p.length + 1);
          setMessage(
            `Window "${s.slice(windowStart, currentIdx + 1)}" - matches: ${newMatches}/${required}`
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
    sFreq,
    matches,
    foundIndices,
    s,
    p,
    required,
    pFreq,
    speed,
  ]);

  const getWindowRange = (): [number, number] => {
    if (currentIdx < 0) return [-1, -1];
    const right = currentIdx;
    const left = Math.max(0, right - p.length + 1);
    return [left, right];
  };

  const [winLeft, winRight] = getWindowRange();

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-pink-500/10 to-rose-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">Find All Anagrams</h3>
        <p className="text-gray-400 text-sm mt-1">
          Fixed window with frequency matching counter
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
              className="w-20 accent-pink-500"
            />
          </div>
        </div>

        {/* Pattern display */}
        <div className="mb-4 p-3 bg-pink-500/10 border border-pink-500/30 rounded-lg flex items-center gap-4">
          <div>
            <span className="text-gray-400">Pattern: </span>
            <span className="text-xl font-mono font-bold text-pink-400">
              &ldquo;{p}&rdquo;
            </span>
          </div>
          <div className="text-sm text-gray-400">
            Required: {"{"}a:1, b:1, c:1{"}"} ({required} chars)
          </div>
        </div>

        {/* String visualization */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">
            String: &quot;{s}&quot;
          </div>
          <div className="flex gap-1">
            {s.split("").map((char, position) => {
              const inWindow =
                position >= winLeft && position <= winRight && currentIdx >= 0;
              const isFound = foundIndices.some(
                (start) => position >= start && position < start + p.length
              );

              return (
                <motion.div
                  key={`s-pos${position}-${char}`} // skipcq: JS-0437
                  animate={{
                    scale: position === currentIdx ? 1.1 : 1,
                    y: position === currentIdx ? -5 : 0,
                  }}
                  className={`w-9 h-11 rounded-lg flex flex-col items-center justify-center font-mono ${
                    phase === "done" && isFound
                      ? "bg-green-500 text-white"
                      : inWindow
                        ? matches === required
                          ? "bg-green-500 text-white ring-2 ring-green-300"
                          : "bg-pink-500 text-white"
                        : "bg-gray-700 text-gray-300"
                  }`}
                >
                  <span className="text-base font-bold">{char}</span>
                  <span className="text-xs opacity-70">{position}</span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Frequency comparison */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-sm text-gray-400 mb-2">Pattern Frequency:</div>
            <div className="flex gap-2 flex-wrap">
              {Array.from(pFreq.entries()).map(([char, count]) => (
                <div
                  key={char}
                  className="px-2 py-1 bg-pink-500/30 rounded font-mono text-sm text-pink-300"
                >
                  {char}: {count}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-sm text-gray-400 mb-2">Window Frequency:</div>
            <div className="flex gap-2 flex-wrap">
              <AnimatePresence>
                {Array.from(sFreq.entries()).map(([char, count]) => {
                  const matchesPattern = count === pFreq.get(char);
                  return (
                    <motion.div
                      key={char}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      className={`px-2 py-1 rounded font-mono text-sm ${
                        matchesPattern
                          ? "bg-green-500/30 text-green-300 ring-1 ring-green-500"
                          : "bg-gray-700 text-gray-300"
                      }`}
                    >
                      {char}: {count}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {sFreq.size === 0 && (
                <span className="text-gray-500 italic text-sm">Empty</span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">Matches</div>
            <div
              className={`text-2xl font-bold ${
                matches === required ? "text-green-400" : "text-pink-400"
              }`}
            >
              {matches}/{required}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">Window</div>
            <div className="text-lg font-mono text-pink-400">
              {currentIdx >= 0 ? `"${s.slice(winLeft, winRight + 1)}"` : "-"}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">Found</div>
            <div className="text-2xl font-bold text-green-400">
              {foundIndices.length}
            </div>
          </div>
        </div>

        {/* Found anagrams */}
        {foundIndices.length > 0 && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="text-sm text-green-400">
              Anagrams found at indices: [{foundIndices.join(", ")}]
              {foundIndices.map((idx) => (
                <span
                  key={`found-${idx}-${s.slice(idx, idx + p.length)}`}
                  className="ml-2 font-mono"
                >
                  &ldquo;{s.slice(idx, idx + p.length)}&rdquo;
                </span>
              ))}
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
              : matches === required
                ? "bg-green-500/10 border border-green-500/30 text-green-400"
                : "bg-gray-800 text-gray-300"
          }`}
        >
          {message}
        </motion.div>

        {/* Algorithm explanation */}
        <div className="mt-4 p-3 bg-gray-800/30 rounded-lg text-sm text-gray-400">
          <p>
            <strong className="text-pink-400">Key Insight:</strong> Track how
            many unique characters have matching frequencies. When matches
            equals required unique chars, the window is an anagram. O(n) with a
            &ldquo;matches&rdquo; counter!
          </p>
        </div>
      </div>
    </div>
  );
}
