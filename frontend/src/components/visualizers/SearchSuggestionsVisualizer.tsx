"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";

interface TrieNodeData {
  char: string;
  word: string | null;
  children: { [key: string]: TrieNodeData };
}

interface SuggestionStep {
  charIndex: number;
  char: string;
  phase: "type" | "navigate" | "dfs" | "result";
  currentNode: string[];
  suggestions: string[];
  description: string;
  dfsPath?: string;
  foundWord?: string;
}

// Build trie from products
const buildTrie = (products: string[]): TrieNodeData => {
  const root: TrieNodeData = { char: "root", word: null, children: {} };

  for (const product of products) {
    let node = root;
    for (const c of product) {
      if (!node.children[c]) {
        node.children[c] = { char: c, word: null, children: {} };
      }
      node = node.children[c];
    }
    node.word = product;
  }

  return root;
};

// Generate steps for visualization
const generateSteps = (
  trie: TrieNodeData,
  searchWord: string
): SuggestionStep[] => {
  const steps: SuggestionStep[] = [];
  let node: TrieNodeData | null = trie;
  const currentPath: string[] = [];

  for (let i = 0; i < searchWord.length; i++) {
    const char = searchWord[i];

    // Step 1: User types character
    steps.push({
      charIndex: i,
      char,
      phase: "type",
      currentNode: [...currentPath],
      suggestions: [],
      description: `User types '${char}' → prefix is "${searchWord.slice(0, i + 1)}"`,
    });

    // Step 2: Navigate to child
    if (node && node.children[char]) {
      currentPath.push(char);
      node = node.children[char];

      steps.push({
        charIndex: i,
        char,
        phase: "navigate",
        currentNode: [...currentPath],
        suggestions: [],
        description: `Navigate: '${char}' exists → move to '${char}' node`,
      });

      // Step 3: DFS to find suggestions
      const suggestions: string[] = [];
      const dfsSteps: SuggestionStep[] = [];

      const dfs = (n: TrieNodeData, path: string): void => {
        if (suggestions.length >= 3) return;

        if (n.word !== null) {
          suggestions.push(n.word);
          dfsSteps.push({
            charIndex: i,
            char,
            phase: "dfs",
            currentNode: [...currentPath],
            suggestions: [...suggestions],
            description: `DFS: Found "${n.word}" → Add to suggestions`,
            dfsPath: path,
            foundWord: n.word,
          });
        }

        const sortedKeys = Object.keys(n.children).sort();
        for (const key of sortedKeys) {
          if (suggestions.length >= 3) break;
          dfs(n.children[key], path + key);
        }
      };

      steps.push({
        charIndex: i,
        char,
        phase: "dfs",
        currentNode: [...currentPath],
        suggestions: [],
        description: `Start DFS from "${currentPath.join("")}" to find top 3`,
        dfsPath: currentPath.join(""),
      });

      dfs(node, currentPath.join(""));
      steps.push(...dfsSteps);

      // Step 4: Result for this prefix
      steps.push({
        charIndex: i,
        char,
        phase: "result",
        currentNode: [...currentPath],
        suggestions: [...suggestions],
        description: `Result for "${searchWord.slice(0, i + 1)}": [${suggestions.map((s) => `"${s}"`).join(", ")}]`,
      });
    } else {
      /* v8 ignore start -- defensive: all search words have valid prefixes in the trie */
      // No matching child
      steps.push({
        charIndex: i,
        char,
        phase: "navigate",
        currentNode: [...currentPath],
        suggestions: [],
        description: `Navigate: '${char}' not found → no more suggestions`,
      });

      steps.push({
        charIndex: i,
        char,
        phase: "result",
        currentNode: [...currentPath],
        suggestions: [],
        description: `Result for "${searchWord.slice(0, i + 1)}": []`,
      });

      node = null;
      /* v8 ignore stop */
    }
  }

  return steps;
};

// Trie visualization component
const TrieVisualization: React.FC<{
  trie: TrieNodeData;
  highlightPath: string[];
  dfsPath?: string;
  foundWord?: string;
}> = ({ trie, highlightPath, dfsPath, foundWord }) => {
  const renderNode = (
    node: TrieNodeData,
    path: string,
    depth: number,
    xOffset: number
  ): React.ReactNode => {
    const pathArray = path.split("").filter(Boolean);
    const isHighlighted =
      highlightPath.length > 0 &&
      pathArray.length <= highlightPath.length &&
      pathArray.every((c, i) => highlightPath[i] === c);

    const isDfsPath = dfsPath && path === dfsPath;
    const isFoundWord = foundWord && node.word === foundWord;

    const sortedChildren = Object.entries(node.children).sort(([a], [b]) =>
      a.localeCompare(b)
    );

    const childWidth = 50;
    const totalWidth = Math.max(sortedChildren.length * childWidth, childWidth);
    const startX = xOffset - totalWidth / 2 + childWidth / 2;

    return (
      <g key={path || "root"}>
        <motion.circle
          cx={xOffset}
          cy={depth * 50 + 25}
          r={16}
          fill={
            isFoundWord
              ? "#22c55e"
              : isDfsPath
                ? "var(--accent-2)"
                : isHighlighted
                  ? "var(--accent-1)"
                  : "var(--bg-elevated)"
          }
          stroke={
            isFoundWord
              ? "#22c55e"
              : isDfsPath
                ? "var(--accent-2)"
                : isHighlighted
                  ? "var(--accent-1)"
                  : "var(--border)"
          }
          strokeWidth={2}
          animate={{
            scale: isFoundWord ? [1, 1.2, 1] : 1,
          }}
          transition={{ duration: 0.3 }}
        />

        <text
          x={xOffset}
          y={depth * 50 + 30}
          textAnchor="middle"
          fill={
            isHighlighted || isDfsPath || isFoundWord
              ? "white"
              : "var(--text-1)"
          }
          fontSize={12}
          fontWeight="bold"
        >
          {node.char === "root" ? "∅" : node.char}
        </text>

        {node.word !== null && (
          <circle cx={xOffset + 12} cy={depth * 50 + 13} r={5} fill="#22c55e" />
        )}

        {sortedChildren.map(([char, childNode], idx) => {
          const childX = startX + idx * childWidth;
          const childY = (depth + 1) * 50 + 25;

          return (
            <g key={char}>
              <line
                x1={xOffset}
                y1={depth * 50 + 41}
                x2={childX}
                y2={childY - 16}
                stroke={
                  highlightPath[depth] === char
                    ? "var(--accent-1)"
                    : "var(--border)"
                }
                strokeWidth={highlightPath[depth] === char ? 2 : 1}
              />
              {renderNode(childNode, path + char, depth + 1, childX)}
            </g>
          );
        })}
      </g>
    );
  };

  return (
    <svg width="100%" height="220" viewBox="0 0 300 220">
      {renderNode(trie, "", 0, 150)}
    </svg>
  );
};

// Main component
const PRODUCTS = ["mobile", "monkey", "mouse", "mug"];

export const SearchSuggestionsVisualizer: React.FC = () => {
  const [searchWord, setSearchWord] = useState("mo");
  const [stepIndex, setStepIndex] = useState(0);

  const trie = useMemo(() => buildTrie(PRODUCTS), []);
  const steps = useMemo(
    () => generateSteps(trie, searchWord),
    [trie, searchWord]
  );
  const currentStep = steps[stepIndex];

  const searchOptions = ["m", "mo", "mou", "mug"];

  const handleSearchChange = (newSearch: string) => {
    setSearchWord(newSearch);
    setStepIndex(0);
  };

  // Build results summary
  const resultsByPrefix = useMemo(() => {
    const results: { [prefix: string]: string[] } = {};
    for (const step of steps) {
      if (step.phase === "result") {
        const prefix = searchWord.slice(0, step.charIndex + 1);
        results[prefix] = step.suggestions;
      }
    }
    return results;
  }, [steps, searchWord]);

  return (
    <div
      className="rounded-lg p-4 space-y-4"
      style={{ backgroundColor: "var(--bg-surface)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3
          className="text-lg font-semibold"
          style={{ color: "var(--text-1)" }}
        >
          Search Suggestions Visualization
        </h3>
        <div className="flex gap-2 flex-wrap">
          {searchOptions.map((s) => (
            <button
              key={s}
              onClick={() => handleSearchChange(s)}
              className="px-3 py-1 rounded text-sm font-mono transition-colors"
              style={{
                backgroundColor:
                  searchWord === s ? "var(--accent-1)" : "var(--bg-elevated)",
                color: searchWord === s ? "white" : "var(--text-2)",
              }}
            >
              &quot;{s}&quot;
            </button>
          ))}
        </div>
      </div>

      {/* Products */}
      <div
        className="text-sm px-3 py-2 rounded"
        style={{
          backgroundColor: "var(--bg-elevated)",
          color: "var(--text-2)",
        }}
      >
        <span style={{ color: "var(--text-3)" }}>Products:</span> [
        {PRODUCTS.map((p: string) => `"${p}"`).join(", ")}]
      </div>

      {/* Main visualization area */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Trie */}
        <div
          className="rounded-lg p-3"
          style={{ backgroundColor: "var(--bg-elevated)" }}
        >
          <div
            className="text-xs mb-2 font-medium"
            style={{ color: "var(--text-3)" }}
          >
            TRIE STRUCTURE{" "}
            <span
              className="ml-2 inline-flex items-center gap-1"
              style={{ color: "#22c55e" }}
            >
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ backgroundColor: "#22c55e" }}
              />
              = word
            </span>
          </div>
          <TrieVisualization
            trie={trie}
            highlightPath={currentStep?.currentNode || []}
            dfsPath={currentStep?.dfsPath}
            foundWord={currentStep?.foundWord}
          />
        </div>

        {/* Step info */}
        <div className="space-y-3">
          {/* Search input display */}
          <div
            className="rounded-lg p-3"
            style={{ backgroundColor: "var(--bg-elevated)" }}
          >
            <div
              className="text-xs mb-2 font-medium"
              style={{ color: "var(--text-3)" }}
            >
              USER TYPING
            </div>
            <div
              className="font-mono text-lg"
              style={{ color: "var(--text-1)" }}
            >
              {searchWord.split("").map((char, i) => (
                <span
                  key={i}
                  style={{
                    color:
                      currentStep && i <= currentStep.charIndex
                        ? "var(--accent-1)"
                        : "var(--text-3)",
                    fontWeight:
                      currentStep && i === currentStep.charIndex
                        ? "bold"
                        : "normal",
                  }}
                >
                  {char}
                </span>
              ))}
              <span
                className="animate-pulse"
                style={{ color: "var(--text-3)" }}
              >
                |
              </span>
            </div>
          </div>

          {/* Current step */}
          <div
            className="rounded-lg p-3"
            style={{ backgroundColor: "var(--bg-elevated)" }}
          >
            <div
              className="text-xs mb-2 font-medium"
              style={{ color: "var(--text-3)" }}
            >
              STEP {stepIndex + 1} / {steps.length}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className="px-2 py-0.5 rounded text-xs font-medium"
                  style={{
                    backgroundColor:
                      currentStep?.phase === "type"
                        ? "#6366f1"
                        : currentStep?.phase === "navigate"
                          ? "var(--accent-1)"
                          : currentStep?.phase === "dfs"
                            ? "var(--accent-2)"
                            : "#22c55e",
                    color: "white",
                  }}
                >
                  {currentStep?.phase === "type"
                    ? "TYPE"
                    : currentStep?.phase === "navigate"
                      ? "NAVIGATE"
                      : currentStep?.phase === "dfs"
                        ? "DFS"
                        : "RESULT"}
                </span>
              </div>
              <div style={{ color: "var(--text-1)" }}>
                {currentStep?.description}
              </div>
              {currentStep?.suggestions &&
                currentStep.suggestions.length > 0 && (
                  <div
                    className="text-sm mt-2 pt-2"
                    style={{
                      borderTop: "1px solid var(--border)",
                      color: "var(--text-2)",
                    }}
                  >
                    <span style={{ color: "var(--text-3)" }}>Suggestions:</span>{" "}
                    [{currentStep.suggestions.map((s) => `"${s}"`).join(", ")}]
                  </div>
                )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-2">
            <button
              onClick={() => setStepIndex(Math.max(0, stepIndex - 1))}
              disabled={stepIndex === 0}
              className="flex-1 px-3 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50"
              style={{
                backgroundColor: "var(--bg-elevated)",
                color: "var(--text-2)",
              }}
            >
              ← Previous
            </button>
            <button
              onClick={() =>
                setStepIndex(Math.min(steps.length - 1, stepIndex + 1))
              }
              disabled={stepIndex === steps.length - 1}
              className="flex-1 px-3 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50"
              style={{
                backgroundColor: "var(--accent-1)",
                color: "white",
              }}
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* Results summary */}
      <div
        className="rounded-lg p-4"
        style={{
          backgroundColor: "var(--bg-elevated)",
          border: "1px solid var(--border)",
        }}
      >
        <div
          className="text-sm font-medium mb-3"
          style={{ color: "var(--text-1)" }}
        >
          Results by Prefix
        </div>
        <div className="space-y-2">
          {Object.entries(resultsByPrefix).map(([prefix, suggestions]) => (
            <div
              key={prefix}
              className="flex items-center gap-3 text-sm font-mono"
              style={{ color: "var(--text-2)" }}
            >
              <span
                className="px-2 py-0.5 rounded"
                style={{ backgroundColor: "var(--bg-surface)" }}
              >
                &quot;{prefix}&quot;
              </span>
              <span style={{ color: "var(--text-3)" }}>→</span>
              <span>
                [
                {suggestions.length > 0
                  ? suggestions.map((s) => `"${s}"`).join(", ")
                  : ""}
                ]
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchSuggestionsVisualizer;
