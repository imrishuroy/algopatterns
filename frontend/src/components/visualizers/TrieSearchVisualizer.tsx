"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

interface TrieNode {
  children: Record<string, TrieNode>;
  isEnd: boolean;
}

export default function TrieSearchVisualizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(700);
  const [searchMode, setSearchMode] = useState<"search" | "startsWith">(
    "search"
  );
  const [query, setQuery] = useState("app");
  const [charIndex, setCharIndex] = useState(-1);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [result, setResult] = useState<boolean | null>(null);
  const [phase, setPhase] = useState<"init" | "searching" | "done">("init");
  const [message, setMessage] = useState("Click Play to search in the Trie");

  // Pre-built trie with words: apple, app, ape, bat
  const trie: TrieNode = {
    children: {
      a: {
        children: {
          p: {
            children: {
              p: {
                children: {
                  l: {
                    children: {
                      e: { children: {}, isEnd: true },
                    },
                    isEnd: false,
                  },
                },
                isEnd: true, // "app"
              },
              e: { children: {}, isEnd: true }, // "ape"
            },
            isEnd: false,
          },
        },
        isEnd: false,
      },
      b: {
        children: {
          a: {
            children: {
              t: { children: {}, isEnd: true }, // "bat"
            },
            isEnd: false,
          },
        },
        isEnd: false,
      },
    },
    isEnd: false,
  };

  const words = ["apple", "app", "ape", "bat"];
  const queries = ["app", "appl", "ap", "bat", "bad"];

  const reset = useCallback(() => {
    setCharIndex(-1);
    setCurrentPath([]);
    setResult(null);
    setPhase("init");
    setMessage(`Click Play to ${searchMode}("${query}")`);
    setIsPlaying(false);
  }, [searchMode, query]);

  useEffect(() => {
    reset();
  }, [query, searchMode, reset]);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (phase === "init") {
        setPhase("searching");
        setCharIndex(0);
        setMessage(`${searchMode}("${query}"): Starting at root`);
      } else if (phase === "searching") {
        if (charIndex >= query.length) {
          // Reached end of query
          let node: TrieNode | undefined = trie;
          for (const c of currentPath) {
            node = node?.children[c];
          }

          if (searchMode === "search") {
            const found = node?.isEnd === true;
            setResult(found);
            setMessage(
              found
                ? `search("${query}"): Found! isEnd = true`
                : `search("${query}"): Not found! isEnd = ${node?.isEnd ?? "N/A"}`
            );
          } else {
            setResult(true);
            setMessage(`startsWith("${query}"): Prefix exists!`);
          }

          setPhase("done");
          setIsPlaying(false);
          return;
        }

        const char = query[charIndex];
        let node: TrieNode | undefined = trie;
        for (const c of currentPath) {
          node = node?.children[c];
        }

        if (!node?.children[char]) {
          // Character not found
          setResult(false);
          setMessage(
            `'${char}' not found in Trie. ${searchMode}("${query}") = false`
          );
          setPhase("done");
          setIsPlaying(false);
          return;
        }

        setCurrentPath([...currentPath, char]);
        setMessage(`Found '${char}', moving to next character...`);
        setCharIndex(charIndex + 1);
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [
    isPlaying,
    phase,
    charIndex,
    query,
    currentPath,
    searchMode,
    trie,
    speed,
  ]);

  const getNodePosition = (path: string[]): { x: number; y: number } | null => {
    const positions: Record<string, { x: number; y: number }> = {
      "": { x: 200, y: 30 },
      a: { x: 120, y: 90 },
      b: { x: 280, y: 90 },
      ap: { x: 120, y: 150 },
      ba: { x: 280, y: 150 },
      app: { x: 80, y: 210 },
      ape: { x: 160, y: 210 },
      bat: { x: 280, y: 210 },
      appl: { x: 80, y: 270 },
      apple: { x: 80, y: 330 },
    };
    return positions[path.join("")] || null;
  };

  const renderTrieNode = (node: TrieNode, path: string[], char: string) => {
    const pos = getNodePosition(path);
    if (!pos) return null;

    const pathStr = path.join("");
    const currentPathStr = currentPath.join("");
    const isInPath =
      currentPathStr.startsWith(pathStr) &&
      pathStr.length <= currentPathStr.length;
    const isCurrent = pathStr === currentPathStr;

    return (
      <g key={pathStr || "root"}>
        <motion.circle
          cx={pos.x}
          cy={pos.y}
          r={18}
          animate={{
            fill: isCurrent
              ? "#eab308"
              : isInPath
                ? "#3b82f6"
                : node.isEnd
                  ? "#22c55e"
                  : "#374151",
            scale: isCurrent ? 1.2 : 1,
          }}
          className="stroke-gray-500 stroke-2"
        />
        <text
          x={pos.x}
          y={pos.y + 5}
          textAnchor="middle"
          className={`text-sm font-bold ${isCurrent ? "fill-black" : "fill-white"}`}
        >
          {char || "∅"}
        </text>
        {node.isEnd && (
          <text
            x={pos.x + 22}
            y={pos.y - 10}
            className="fill-green-400 text-xs"
          >
            *
          </text>
        )}
      </g>
    );
  };

  const renderEdge = (from: string[], to: string[]) => {
    const fromPos = getNodePosition(from);
    const toPos = getNodePosition(to);
    if (!fromPos || !toPos) return null;

    return (
      <line
        key={`${from.join("")}-${to.join("")}`}
        x1={fromPos.x}
        y1={fromPos.y + 18}
        x2={toPos.x}
        y2={toPos.y - 18}
        className="stroke-gray-600 stroke-2"
      />
    );
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">
          Search vs StartsWith
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          search() checks isEnd flag, startsWith() just checks path exists
        </p>
      </div>

      <div className="p-4">
        {/* Controls */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
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
          <div className="flex gap-1 ml-2">
            <button
              onClick={() => setSearchMode("search")}
              disabled={isPlaying}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                searchMode === "search"
                  ? "bg-indigo-500 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              } disabled:opacity-50`}
            >
              search()
            </button>
            <button
              onClick={() => setSearchMode("startsWith")}
              disabled={isPlaying}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                searchMode === "startsWith"
                  ? "bg-indigo-500 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              } disabled:opacity-50`}
            >
              startsWith()
            </button>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-gray-400 text-sm">Speed:</span>
            <input
              type="range"
              min="400"
              max="1200"
              step="100"
              value={1600 - speed}
              onChange={(e) => setSpeed(1600 - Number(e.target.value))}
              className="w-20 accent-indigo-500"
            />
          </div>
        </div>

        {/* Query selection */}
        <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
          <div className="text-sm text-gray-400 mb-2">
            Select query (Trie contains: {words.join(", ")}):
          </div>
          <div className="flex gap-2 flex-wrap">
            {queries.map((q) => (
              <button
                key={`q-${q}`}
                onClick={() => setQuery(q)}
                disabled={isPlaying}
                className={`px-3 py-1 rounded-lg font-mono text-sm transition ${
                  query === q
                    ? "bg-yellow-500 text-black"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                } disabled:opacity-50`}
              >
                "{q}"
              </button>
            ))}
          </div>
        </div>

        {/* Trie visualization */}
        <div className="mb-4 flex justify-center">
          <svg width="400" height="360" className="bg-gray-800/30 rounded-lg">
            {/* Edges */}
            {renderEdge([], ["a"])}
            {renderEdge([], ["b"])}
            {renderEdge(["a"], ["a", "p"])}
            {renderEdge(["b"], ["b", "a"])}
            {renderEdge(["a", "p"], ["a", "p", "p"])}
            {renderEdge(["a", "p"], ["a", "p", "e"])}
            {renderEdge(["b", "a"], ["b", "a", "t"])}
            {renderEdge(["a", "p", "p"], ["a", "p", "p", "l"])}
            {renderEdge(["a", "p", "p", "l"], ["a", "p", "p", "l", "e"])}

            {/* Nodes */}
            {renderTrieNode(trie, [], "")}
            {renderTrieNode(trie.children.a, ["a"], "a")}
            {renderTrieNode(trie.children.b, ["b"], "b")}
            {renderTrieNode(trie.children.a.children.p, ["a", "p"], "p")}
            {renderTrieNode(trie.children.b.children.a, ["b", "a"], "a")}
            {renderTrieNode(
              trie.children.a.children.p.children.p,
              ["a", "p", "p"],
              "p"
            )}
            {renderTrieNode(
              trie.children.a.children.p.children.e,
              ["a", "p", "e"],
              "e"
            )}
            {renderTrieNode(
              trie.children.b.children.a.children.t,
              ["b", "a", "t"],
              "t"
            )}
            {renderTrieNode(
              trie.children.a.children.p.children.p.children.l,
              ["a", "p", "p", "l"],
              "l"
            )}
            {renderTrieNode(
              trie.children.a.children.p.children.p.children.l.children.e,
              ["a", "p", "p", "l", "e"],
              "e"
            )}
          </svg>
        </div>

        {/* Result */}
        {result !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`mb-4 p-4 rounded-lg text-center text-lg font-bold ${
              result
                ? "bg-green-500/20 border border-green-500/50 text-green-400"
                : "bg-red-500/20 border border-red-500/50 text-red-400"
            }`}
          >
            {searchMode}(&quot;{query}&quot;) = {result.toString()}
          </motion.div>
        )}

        {/* Message */}
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-lg text-sm ${
            phase === "done"
              ? result
                ? "bg-green-500/10 border border-green-500/30 text-green-400"
                : "bg-red-500/10 border border-red-500/30 text-red-400"
              : "bg-gray-800 text-gray-300"
          }`}
        >
          {message}
        </motion.div>

        {/* Key difference */}
        <div className="mt-4 p-3 bg-gray-800/30 rounded-lg text-sm text-gray-400">
          <p>
            <strong className="text-indigo-400">Key Difference:</strong>{" "}
            search(&quot;appl&quot;) = false (not a word), but startsWith(&quot;appl&quot;) = true
            (prefix exists). * marks isEnd = true.
          </p>
        </div>
      </div>
    </div>
  );
}
