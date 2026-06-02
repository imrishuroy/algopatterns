"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GROUP_COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-cyan-500",
];

export default function AnagramGroupVisualizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [groups, setGroups] = useState<Map<string, string[]>>(new Map());
  const [currentWord, setCurrentWord] = useState<string | null>(null);
  const [currentKey, setCurrentKey] = useState<string | null>(null);
  const [phase, setPhase] = useState<"init" | "sorting" | "grouping" | "done">(
    "init"
  );
  const [message, setMessage] = useState("Click Play to group anagrams");

  const words = ["eat", "tea", "tan", "ate", "nat", "bat"];

  const getSortedKey = (word: string) => {
    return [...word].sort().join("");
  };

  const reset = useCallback(() => {
    setCurrentIndex(0);
    setGroups(new Map());
    setCurrentWord(null);
    setCurrentKey(null);
    setPhase("init");
    setMessage("Click Play to group anagrams");
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (currentIndex >= words.length) {
        setPhase("done");
        setCurrentWord(null);
        setCurrentKey(null);
        setMessage(`Done! Found ${groups.size} anagram groups.`);
        setIsPlaying(false);
        return;
      }

      const word = words[currentIndex];

      if (phase === "init" || phase === "grouping") {
        setPhase("sorting");
        setCurrentWord(word);
        setMessage(`Processing "${word}" - sorting characters...`);
      } else if (phase === "sorting") {
        const key = getSortedKey(word);
        setCurrentKey(key);
        setPhase("grouping");
        setMessage(`"${word}" sorted = "${key}" - adding to group`);

        const newGroups = new Map(groups);
        if (!newGroups.has(key)) {
          newGroups.set(key, []);
        }
        newGroups.get(key)!.push(word);
        setGroups(newGroups);

        setTimeout(() => {
          setCurrentIndex(currentIndex + 1);
        }, speed / 2);
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [isPlaying, currentIndex, phase, groups, speed]);

  const getWordColor = (word: string) => {
    const key = getSortedKey(word);
    const keys = Array.from(groups.keys());
    const keyIndex = keys.indexOf(key);
    if (keyIndex === -1) return "bg-gray-700";
    return GROUP_COLORS[keyIndex % GROUP_COLORS.length];
  };

  const isProcessed = (index: number) => {
    return index < currentIndex;
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">Group Anagrams</h3>
        <p className="text-gray-400 text-sm mt-1">
          Use sorted string as key to group anagrams together
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
              className="w-20 accent-indigo-500"
            />
          </div>
        </div>

        {/* Input Words */}
        <div className="mb-6">
          <div className="text-sm text-gray-400 mb-2">Input words:</div>
          <div className="flex flex-wrap gap-2">
            {words.map((word, idx) => (
              <motion.div
                key={`${word}-${idx}`}
                animate={{
                  scale: currentWord === word ? 1.1 : 1,
                  y: currentWord === word ? -5 : 0,
                }}
                className={`px-4 py-2 rounded-lg font-mono text-lg transition-colors ${
                  currentWord === word
                    ? "bg-yellow-500 text-black ring-2 ring-yellow-300"
                    : isProcessed(idx)
                      ? `${getWordColor(word)} text-white`
                      : "bg-gray-700 text-gray-300"
                }`}
              >
                {word}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Current Processing */}
        {currentWord && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 p-4 bg-gray-800/50 rounded-lg"
          >
            <div className="flex items-center gap-4 flex-wrap">
              <div>
                <div className="text-xs text-gray-500 mb-1">Current Word</div>
                <div className="text-2xl font-mono font-bold text-yellow-400">
                  {currentWord}
                </div>
              </div>
              <div className="text-2xl text-gray-500">→</div>
              <div>
                <div className="text-xs text-gray-500 mb-1">
                  Sort Characters
                </div>
                <div className="flex gap-1">
                  {[...currentWord].map((char, i) => (
                    <motion.span
                      key={`${char}-${i}`}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center text-white font-mono"
                    >
                      {char}
                    </motion.span>
                  ))}
                </div>
              </div>
              {currentKey && (
                <>
                  <div className="text-2xl text-gray-500">→</div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">
                      Key (sorted)
                    </div>
                    <div className="text-2xl font-mono font-bold text-green-400">
                      &quot;{currentKey}&quot;
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* Groups HashMap */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">
            HashMap: sorted_key → [words]
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 min-h-[100px]">
            <div className="space-y-2">
              <AnimatePresence>
                {Array.from(groups.entries()).map(
                  ([key, wordList], groupIdx) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-3 rounded-lg ${GROUP_COLORS[groupIdx % GROUP_COLORS.length]}/20 border ${GROUP_COLORS[groupIdx % GROUP_COLORS.length].replace("bg-", "border-")}`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2 py-1 rounded font-mono text-sm ${GROUP_COLORS[groupIdx % GROUP_COLORS.length]} text-white`}
                        >
                          &quot;{key}&quot;
                        </span>
                        <span className="text-gray-400">→</span>
                        <div className="flex gap-2 flex-wrap">
                          {wordList.map((word, i) => (
                            <motion.span
                              key={`${word}-${i}`}
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="px-2 py-1 bg-gray-700 rounded font-mono text-gray-200"
                            >
                              {word}
                            </motion.span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )
                )}
              </AnimatePresence>
              {groups.size === 0 && (
                <span className="text-gray-500">
                  Empty - groups will appear here
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-indigo-400">
              {words.length}
            </div>
            <div className="text-xs text-gray-500">Total Words</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-400">
              {currentIndex}
            </div>
            <div className="text-xs text-gray-500">Processed</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {groups.size}
            </div>
            <div className="text-xs text-gray-500">Groups Found</div>
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
              : "bg-gray-800 text-gray-300"
          }`}
        >
          {message}
        </motion.div>

        {/* Algorithm explanation */}
        <div className="mt-4 p-3 bg-gray-800/30 rounded-lg text-sm text-gray-400">
          <p>
            <strong className="text-indigo-400">Key Insight:</strong> Anagrams
            have the same characters, so sorting them produces the same key. Use
            this sorted string as the HashMap key to group all anagrams
            together.
          </p>
        </div>
      </div>
    </div>
  );
}
