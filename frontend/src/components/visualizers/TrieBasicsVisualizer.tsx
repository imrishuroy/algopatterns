"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TrieNodeData {
  char: string;
  children: Map<string, TrieNodeData>;
  isEnd: boolean;
  x: number;
  y: number;
  isNew?: boolean;
  isShared?: boolean;
}

// skipcq: JS-0067
export default function TrieBasicsVisualizer() {
  const [root, setRoot] = useState<TrieNodeData>({
    char: "",
    children: new Map(),
    isEnd: false,
    x: 250,
    y: 40,
  });
  const [words] = useState(["cat", "car", "card", "dog"]);
  const [insertedWords, setInsertedWords] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState<string | null>(null);
  const [highlightPath, setHighlightPath] = useState<string[]>([]);
  const [message, setMessage] = useState(
    "Click a word to insert it into the Trie"
  );
  const [searchInput, setSearchInput] = useState("");
  const [searchResult, setSearchResult] = useState<
    "found" | "not-found" | "prefix" | null
  >(null);

  const calculatePositions = useCallback(function calc(
    node: TrieNodeData,
    depth: number,
    leftBound: number,
    rightBound: number
  ): void {
    const children = Array.from(node.children.values());
    const width = rightBound - leftBound;
    const childWidth = width / (children.length || 1);

    children.forEach((child, idx) => {
      child.x = leftBound + childWidth * idx + childWidth / 2;
      child.y = 40 + depth * 70;
      calc(
        child,
        depth + 1,
        leftBound + childWidth * idx,
        leftBound + childWidth * (idx + 1)
      );
    });
  }, []);

  const cloneRoot = (r: TrieNodeData): TrieNodeData => {
    return JSON.parse(
      JSON.stringify(r, (key, value) =>
        value instanceof Map
          ? { dataType: "Map", value: Array.from(value.entries()) }
          : value
      ),
      (key, value) =>
        value && value.dataType === "Map" ? new Map(value.value) : value
    );
  };

  const insertWord = (word: string) => {
    /* v8 ignore next 3 -- defensive: button is disabled when word is already inserted */
    if (insertedWords.includes(word)) {
      setMessage(`"${word}" is already in the Trie`);
      return;
    }

    setCurrentWord(word);
    const path: string[] = [];
    let delay = 0;
    const stepDelay = 600;

    // Animate character by character
    // skipcq: JS-S1016 -- i === word.length is the final step to mark isEnd, guarded by if check
    for (let i = 0; i <= word.length; i++) {
      setTimeout(() => {
        if (i < word.length) {
          const char = word[i];
          path.push(char);
          setHighlightPath([...path]);

          setRoot((prev) => {
            const newRoot = cloneRoot(prev);
            let node = newRoot;

            // Clear previous isNew and isShared flags
            const clearFlags = (n: TrieNodeData) => {
              n.isNew = false;
              n.isShared = false;
              n.children.forEach(clearFlags);
            };
            clearFlags(newRoot);

            // Navigate and mark/create nodes
            for (let j = 0; j < path.length; j++) {
              const c = path[j];
              if (!node.children.has(c)) {
                node.children.set(c, {
                  char: c,
                  children: new Map(),
                  isEnd: false,
                  x: 0,
                  y: 0,
                  isNew: true,
                });
                setMessage(`Creating new node '${c}'`);
              } else {
                const existingNode = node.children.get(c);
                if (existingNode) {
                  existingNode.isShared = true;
                  setMessage(`Node '${c}' exists (shared prefix)`);
                }
              }
              const nextNode = node.children.get(c);
              if (nextNode) node = nextNode;
            }

            calculatePositions(newRoot, 1, 30, 470);
            return newRoot;
          });
        } else {
          // Mark isEnd
          setRoot((prev) => {
            const newRoot = cloneRoot(prev);
            let node = newRoot;
            for (const c of path) {
              const nextNode = node.children.get(c);
              if (nextNode) node = nextNode;
            }
            node.isEnd = true;
            calculatePositions(newRoot, 1, 30, 470);
            return newRoot;
          });
          setMessage(`"${word}" inserted! Marked as complete word.`);
          setInsertedWords((prev) => [...prev, word]);
          setCurrentWord(null);
          setTimeout(() => setHighlightPath([]), 500);
        }
      }, delay);
      delay += stepDelay;
    }
  };

  const searchPrefix = (prefix: string) => {
    if (!prefix) {
      setSearchResult(null);
      setHighlightPath([]);
      setMessage("Type a prefix to search");
      return;
    }

    const path: string[] = [];
    let node = root;

    for (const char of prefix) {
      if (!node.children.has(char)) {
        setSearchResult("not-found");
        setHighlightPath(path);
        setMessage(`"${prefix}" not found in Trie`);
        return;
      }
      path.push(char);
      const nextNode = node.children.get(char);
      if (nextNode) node = nextNode;
    }

    setHighlightPath(path);
    if (node.isEnd) {
      setSearchResult("found");
      setMessage(`"${prefix}" is a complete word in the Trie`);
    } else {
      setSearchResult("prefix");
      setMessage(
        `"${prefix}" is a prefix (path exists, but not a complete word)`
      );
    }
  };

  const reset = () => {
    setRoot({ char: "", children: new Map(), isEnd: false, x: 250, y: 40 });
    setInsertedWords([]);
    setCurrentWord(null);
    setHighlightPath([]);
    setMessage("Click a word to insert it into the Trie");
    setSearchInput("");
    setSearchResult(null);
  };

  const renderNode = (node: TrieNodeData, path: string[]): React.ReactNode => {
    const pathStr = path.join("");
    const highlightStr = highlightPath.slice(0, path.length).join("");
    const isInPath = path.length > 0 && highlightStr === pathStr;
    const isCurrentNode =
      highlightPath.join("") === pathStr &&
      path.length === highlightPath.length;

    return (
      <g key={pathStr || "root"}>
        {/* Edges to children */}
        {Array.from(node.children.entries()).map(([char, child]) => {
          const childPath = [...path, char];
          const childPathStr = childPath.join("");
          const childHighlightStr = highlightPath
            .slice(0, childPath.length)
            .join("");
          const isEdgeHighlighted = childHighlightStr === childPathStr;

          return (
            <motion.line
              key={`edge-${pathStr}-${char}`}
              x1={node.x}
              y1={node.y + 22}
              x2={child.x}
              y2={child.y - 22}
              initial={{ pathLength: 0 }}
              animate={{
                pathLength: 1,
                stroke: isEdgeHighlighted ? "#22c55e" : "#4b5563",
              }}
              transition={{ duration: 0.3 }}
              strokeWidth={isEdgeHighlighted ? 3 : 2}
            />
          );
        })}

        {/* Node circle */}
        <motion.circle
          cx={node.x}
          cy={node.y}
          r={22}
          initial={node.isNew ? { scale: 0 } : { scale: 1 }}
          animate={{
            scale: 1,
            fill: isCurrentNode
              ? "#eab308" // yellow - current
              : isInPath
                ? "#22c55e" // green - in path
                : node.isShared
                  ? "#3b82f6" // blue - shared prefix
                  : node.isEnd
                    ? "#8b5cf6" // purple - end of word
                    : "#374151", // gray - default
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          stroke={node.isEnd ? "#a78bfa" : "#6b7280"}
          strokeWidth={node.isEnd ? 3 : 2}
        />

        {/* Node label */}
        <text
          x={node.x}
          y={node.y + 5}
          textAnchor="middle"
          className="text-sm font-bold fill-white select-none"
          style={{ pointerEvents: "none" }}
        >
          {node.char || "⊙"}
        </text>

        {/* isEnd indicator (star) */}
        {node.isEnd && (
          <motion.text
            x={node.x + 18}
            y={node.y - 14}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-lg fill-yellow-400 select-none"
            style={{ pointerEvents: "none" }}
          >
            ★
          </motion.text>
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
      <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">Trie Basics</h3>
        <p className="text-gray-400 text-sm mt-1">
          See how words share prefixes in a Trie structure
        </p>
      </div>

      <div className="p-4">
        {/* Word buttons */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">Click to insert:</div>
          <div className="flex flex-wrap gap-2">
            {words.map((word) => (
              <button
                key={word}
                onClick={() => insertWord(word)}
                disabled={insertedWords.includes(word) || currentWord !== null}
                className={`px-4 py-2 rounded-lg font-mono text-sm transition ${
                  insertedWords.includes(word)
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : currentWord === word
                      ? "bg-yellow-500 text-black"
                      : "bg-gray-700 text-gray-200 hover:bg-gray-600"
                } disabled:cursor-not-allowed`}
              >
                &quot;{word}&quot;
                {insertedWords.includes(word) && " ✓"}
              </button>
            ))}
            <button
              onClick={reset}
              className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg font-medium hover:bg-gray-600 ml-2"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="mb-4 flex gap-2 items-center">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value.toLowerCase());
              searchPrefix(e.target.value.toLowerCase());
            }}
            placeholder="Search prefix..."
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-emerald-500"
          />
          {searchResult && (
            <span
              className={`text-sm ${
                searchResult === "found"
                  ? "text-green-400"
                  : searchResult === "prefix"
                    ? "text-yellow-400"
                    : "text-red-400"
              }`}
            >
              {searchResult === "found" && "✓ Complete word"}
              {searchResult === "prefix" && "○ Prefix only"}
              {searchResult === "not-found" && "✗ Not found"}
            </span>
          )}
        </div>

        {/* Trie visualization */}
        <div className="mb-4 flex justify-center bg-gray-800/30 rounded-lg p-2">
          <svg width="500" height="320" className="overflow-visible">
            {renderNode(root, [])}
            {/* Root label */}
            <text
              x={250}
              y={75}
              textAnchor="middle"
              className="text-xs fill-gray-500"
            >
              root
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="mb-4 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-yellow-500" />
            <span className="text-gray-400">Current</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-green-500" />
            <span className="text-gray-400">Path</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-blue-500" />
            <span className="text-gray-400">Shared prefix</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-purple-500 border-2 border-purple-400" />
            <span className="text-gray-400">Complete word</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-yellow-400 text-lg">★</span>
            <span className="text-gray-400">isEnd = true</span>
          </div>
        </div>

        {/* Message */}
        <AnimatePresence mode="wait">
          <motion.div
            key={message}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-gray-800 rounded-lg text-sm text-gray-300"
          >
            {message}
          </motion.div>
        </AnimatePresence>

        {/* Insight box */}
        {insertedWords.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-sm text-emerald-300"
          >
            <strong>Key Insight:</strong> Notice how &quot;{insertedWords[0]}
            &quot; and &quot;{insertedWords[1]}&quot; share the same path for
            their common prefix. This is why Trie is efficient for prefix
            operations!
          </motion.div>
        )}
      </div>
    </div>
  );
}
