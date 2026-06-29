"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

interface TrieNode {
  char: string;
  children: Map<string, TrieNode>;
  isEnd: boolean;
  x: number;
  y: number;
}

export default function TrieInsertVisualizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [root, setRoot] = useState<TrieNode>({
    char: "",
    children: new Map(),
    isEnd: false,
    x: 200,
    y: 30,
  });
  const [words] = useState(["cat", "car", "card"]);
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(-1);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [phase, setPhase] = useState<"init" | "inserting" | "done">("init");
  const [message, setMessage] = useState(
    "Click Play to insert words into the Trie"
  );

  const reset = useCallback(() => {
    setRoot({ char: "", children: new Map(), isEnd: false, x: 200, y: 30 });
    setWordIndex(0);
    setCharIndex(-1);
    setCurrentPath([]);
    setPhase("init");
    setMessage("Click Play to insert words into the Trie");
    setIsPlaying(false);
  }, []);

  const calculatePositions = useCallback(
    function calculatePositions(
      node: TrieNode,
      depth: number,
      leftBound: number,
      rightBound: number
    ): void {
      const children = Array.from(node.children.values());
      const width = rightBound - leftBound;
      const childWidth = width / (children.length || 1);

      children.forEach((child, idx) => {
        child.x = leftBound + childWidth * idx + childWidth / 2;
        child.y = 30 + depth * 60;
        calculatePositions(
          child,
          depth + 1,
          leftBound + childWidth * idx,
          leftBound + childWidth * (idx + 1)
        );
      });
    },
    []
  );

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (phase === "init") {
        setPhase("inserting");
        setCharIndex(0);
        setMessage(`Inserting "${words[wordIndex]}"...`);
      } else if (phase === "inserting") {
        const word = words[wordIndex];

        if (charIndex >= word.length) {
          // Mark end of word
          setRoot((prev) => {
            const newRoot = JSON.parse(
              JSON.stringify(prev, (key, value) =>
                value instanceof Map
                  ? { dataType: "Map", value: Array.from(value.entries()) }
                  : value
              ),
              (key, value) =>
                value && value.dataType === "Map" ? new Map(value.value) : value
            );

            let node = newRoot;
            for (const c of currentPath) {
              node = node.children.get(c);
            }
            node.isEnd = true;

            calculatePositions(newRoot, 1, 50, 350);
            return newRoot;
          });

          setMessage(`"${word}" inserted! Marked isEnd = true`);

          // Move to next word
          if (wordIndex + 1 >= words.length) {
            setPhase("done");
            setTimeout(() => {
              setMessage(`Done! Inserted all words: [${words.join(", ")}]`);
              setIsPlaying(false);
            }, speed);
          } else {
            setWordIndex(wordIndex + 1);
            setCharIndex(0);
            setCurrentPath([]);
            setTimeout(() => {
              setMessage(`Inserting "${words[wordIndex + 1]}"...`);
            }, speed / 2);
          }
          return;
        }

        const char = word[charIndex];
        const newPath = [...currentPath, char];
        setCurrentPath(newPath);

        setRoot((prev) => {
          const newRoot = JSON.parse(
            JSON.stringify(prev, (key, value) =>
              value instanceof Map
                ? { dataType: "Map", value: Array.from(value.entries()) }
                : value
            ),
            (key, value) =>
              value && value.dataType === "Map" ? new Map(value.value) : value
          );

          let node = newRoot;
          for (let i = 0; i < newPath.length - 1; i++) {
            node = node.children.get(newPath[i]);
          }

          if (!node.children.has(char)) {
            node.children.set(char, {
              char,
              children: new Map(),
              isEnd: false,
              x: 0,
              y: 0,
            });
            setMessage(`Create node '${char}'`);
          } else {
            setMessage(`Node '${char}' exists, follow it`);
          }

          calculatePositions(newRoot, 1, 50, 350);
          return newRoot;
        });

        setCharIndex(charIndex + 1);
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [
    isPlaying,
    phase,
    wordIndex,
    charIndex,
    words,
    currentPath,
    calculatePositions,
    speed,
  ]);

  const renderNode = (node: TrieNode, path: string[]): React.ReactNode => {
    const isInPath =
      path.length > 0 &&
      currentPath.slice(0, path.length).join("") === path.join("");
    const isCurrentNode = path.join("") === currentPath.join("");

    return (
      <g key={path.join("") || "root"}>
        {/* Edges to children */}
        {Array.from(node.children.entries()).map(([char, child]) => (
          <line
            key={`edge-${path.join("")}-${char}`}
            x1={node.x}
            y1={node.y + 20}
            x2={child.x}
            y2={child.y - 20}
            className="stroke-gray-600 stroke-2"
          />
        ))}

        {/* Node circle */}
        <motion.circle
          cx={node.x}
          cy={node.y}
          r={20}
          animate={{
            fill: isCurrentNode
              ? "#eab308"
              : isInPath
                ? "#3b82f6"
                : node.isEnd
                  ? "#22c55e"
                  : "#374151",
            scale: isCurrentNode ? 1.2 : 1,
          }}
          className="stroke-gray-500 stroke-2"
        />

        {/* Node label */}
        <text
          x={node.x}
          y={node.y + 5}
          textAnchor="middle"
          className={`text-sm font-bold ${isCurrentNode ? "fill-black" : "fill-white"}`}
        >
          {node.char || "∅"}
        </text>

        {/* isEnd indicator */}
        {node.isEnd && (
          <circle
            cx={node.x + 15}
            cy={node.y - 15}
            r={6}
            className="fill-green-500 stroke-white stroke-1"
          />
        )}

        {/* Render children */}
        {Array.from(node.children.entries()).map(([char, child]) =>
          renderNode(child, [...path, char])
        )}
      </g>
    );
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">Trie Insert</h3>
        <p className="text-gray-400 text-sm mt-1">
          Build a Trie by inserting words character by character
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

        {/* Words to insert */}
        <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
          <div className="text-sm text-gray-400 mb-2">Words to insert:</div>
          <div className="flex gap-2">
            {words.map((word, idx) => (
              <div
                key={word}
                className={`px-3 py-1 rounded-lg font-mono text-sm ${
                  idx < wordIndex
                    ? "bg-green-500/30 text-green-300"
                    : idx === wordIndex && phase === "inserting"
                      ? "bg-yellow-500 text-black"
                      : "bg-gray-700 text-gray-300"
                }`}
              >
                {word}
                {idx === wordIndex && phase === "inserting" && (
                  <span className="ml-1 text-xs">
                    [{charIndex}/{word.length}]
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Trie visualization */}
        <div className="mb-4 flex justify-center">
          <svg width="400" height="280" className="bg-gray-800/30 rounded-lg">
            {renderNode(root, [])}
          </svg>
        </div>

        {/* Legend */}
        <div className="mb-4 flex gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-gray-400">Current</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-gray-400">Path</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-400">isEnd</span>
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
            <strong className="text-violet-400">Key Insight:</strong> Shared
            prefixes share nodes. &ldquo;cat&rdquo;, &ldquo;car&rdquo;, &ldquo;card&rdquo; all share &ldquo;ca&rdquo; prefix.
          </p>
        </div>
      </div>
    </div>
  );
}
