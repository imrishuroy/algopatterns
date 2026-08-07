"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";

interface TrieNodeData {
  char: string;
  word: string | null; // Store complete word at end node
  children: { [key: string]: TrieNodeData };
}

interface AutocompleteStep {
  phase: "navigate" | "dfs" | "result";
  charIndex: number;
  char: string;
  currentPath: string[];
  action: string;
  description: string;
  collectedWords: string[];
  dfsNode?: string;
  dfsPath?: string;
  isEndCheck?: boolean;
  addWord?: boolean;
}

// Build trie with ["ape", "app", "apple"]
const buildTrie = (): TrieNodeData => {
  const root: TrieNodeData = { char: "root", word: null, children: {} };

  // Insert "ape"
  let node = root;
  for (const c of "ape") {
    if (!node.children[c]) {
      node.children[c] = { char: c, word: null, children: {} };
    }
    node = node.children[c];
  }
  node.word = "ape";

  // Insert "app"
  node = root;
  for (const c of "app") {
    if (!node.children[c]) {
      node.children[c] = { char: c, word: null, children: {} };
    }
    node = node.children[c];
  }
  node.word = "app";

  // Insert "apple"
  for (const c of "le") {
    if (!node.children[c]) {
      node.children[c] = { char: c, word: null, children: {} };
    }
    node = node.children[c];
  }
  node.word = "apple";

  return root;
};

const generateAutocompleteSteps = (
  trie: TrieNodeData,
  prefix: string
): AutocompleteStep[] => {
  const steps: AutocompleteStep[] = [];
  let node: TrieNodeData | null = trie;
  const currentPath: string[] = [];
  const collectedWords: string[] = [];

  // Phase 1: Navigate to prefix
  for (let i = 0; i < prefix.length; i++) {
    const char = prefix[i];

    if (node && node.children[char]) {
      currentPath.push(char);
      node = node.children[char];

      steps.push({
        phase: "navigate",
        charIndex: i,
        char,
        currentPath: [...currentPath],
        action: "navigate",
        description: `Navigate: '${char}' exists → move to '${char}' node`,
        collectedWords: [],
      });
    } else {
      /* v8 ignore start -- defensive: all offered prefixes exist in the trie */
      steps.push({
        phase: "navigate",
        charIndex: i,
        char,
        currentPath: [...currentPath],
        action: "notFound",
        description: `Navigate: '${char}' not found → prefix doesn't exist`,
        collectedWords: [],
      });

      steps.push({
        phase: "result",
        charIndex: i,
        char,
        currentPath: [...currentPath],
        action: "result",
        description: `Result: [] (prefix not in trie)`,
        collectedWords: [],
      });

      return steps;
      /* v8 ignore stop */
    }
  }

  // Phase 2: DFS from prefix node
  if (node) {
    const dfsSteps = (n: TrieNodeData, path: string, depth: number): void => {
      // Check if word is stored at this node
      const hasWord = n.word !== null;
      steps.push({
        phase: "dfs",
        charIndex: -1,
        char: "",
        currentPath: path.split(""),
        action: hasWord ? "addWord" : "checkEnd",
        description: hasWord
          ? `DFS at "${path}": word="${n.word}" → ADD "${n.word}"`
          : `DFS at "${path}": word=null → continue`,
        collectedWords: [...collectedWords],
        dfsNode: n.char,
        dfsPath: path,
        isEndCheck: true,
        addWord: hasWord,
      });

      if (hasWord) {
        collectedWords.push(n.word as string);
      }

      // Explore children in a-z order
      const sortedKeys = Object.keys(n.children).sort();
      for (const key of sortedKeys) {
        steps.push({
          phase: "dfs",
          charIndex: -1,
          char: key,
          currentPath: (path + key).split(""),
          action: "explore",
          description: `Explore child '${key}' → DFS("${path + key}")`,
          collectedWords: [...collectedWords],
          dfsNode: key,
          dfsPath: path + key,
        });

        dfsSteps(n.children[key], path + key, depth + 1);
      }
    };

    steps.push({
      phase: "dfs",
      charIndex: -1,
      char: "",
      currentPath: [...currentPath],
      action: "startDFS",
      description: `Start DFS from "${prefix}" node`,
      collectedWords: [],
      dfsPath: prefix,
    });

    dfsSteps(node, prefix, 0);
  }

  // Final result
  steps.push({
    phase: "result",
    charIndex: -1,
    char: "",
    currentPath: [...currentPath],
    action: "result",
    description: `Result: [${collectedWords.map((w) => `"${w}"`).join(", ")}]`,
    collectedWords: [...collectedWords],
  });

  return steps;
};

// Trie visualization component
const TrieVisualization: React.FC<{
  trie: TrieNodeData;
  highlightPath: string[];
  dfsPath?: string;
  showIsEnd?: string;
}> = ({ trie, highlightPath, dfsPath, showIsEnd }) => {
  const renderNode = (
    node: TrieNodeData,
    path: string,
    depth: number,
    xOffset: number
  ): React.ReactNode => {
    const pathArray = path.split("").filter(Boolean);
    const isHighlighted =
      highlightPath.length > 0 &&
      pathArray.every((c, i) => highlightPath[i] === c) &&
      pathArray.length <= highlightPath.length;

    const isDfsHighlighted = dfsPath && path === dfsPath;
    const isShowingEnd = showIsEnd === path;

    const sortedChildren = Object.entries(node.children).sort(([a], [b]) =>
      a.localeCompare(b)
    );

    const childWidth = 70;
    const totalWidth = Math.max(sortedChildren.length * childWidth, childWidth);
    const startX = xOffset - totalWidth / 2 + childWidth / 2;

    return (
      <g key={path || "root"}>
        {/* Node */}
        <motion.circle
          cx={xOffset}
          cy={depth * 60 + 30}
          r={20}
          fill={
            isDfsHighlighted
              ? "var(--accent-2)"
              : isHighlighted
                ? "var(--accent-1)"
                : "var(--bg-elevated)"
          }
          stroke={
            isShowingEnd && node.word !== null
              ? "#22c55e"
              : isDfsHighlighted
                ? "var(--accent-2)"
                : isHighlighted
                  ? "var(--accent-1)"
                  : "var(--border)"
          }
          strokeWidth={isShowingEnd && node.word !== null ? 3 : 2}
          animate={{
            scale: isDfsHighlighted ? 1.1 : 1,
          }}
          transition={{ duration: 0.2 }}
        />

        {/* Character label */}
        <text
          x={xOffset}
          y={depth * 60 + 35}
          textAnchor="middle"
          fill={isHighlighted || isDfsHighlighted ? "white" : "var(--text-1)"}
          fontSize={14}
          fontWeight="bold"
        >
          {node.char === "root" ? "∅" : node.char}
        </text>

        {/* Word marker (green dot = word stored here) */}
        {node.word !== null && (
          <motion.circle
            cx={xOffset + 14}
            cy={depth * 60 + 16}
            r={6}
            fill={isShowingEnd ? "#22c55e" : "#22c55e"}
            animate={{
              scale: isShowingEnd ? [1, 1.3, 1] : 1,
            }}
            transition={{ duration: 0.3 }}
          />
        )}

        {/* Children */}
        {sortedChildren.map(([char, childNode], idx) => {
          const childX = startX + idx * childWidth;
          const childY = (depth + 1) * 60 + 30;

          return (
            <g key={char}>
              {/* Edge */}
              <line
                x1={xOffset}
                y1={depth * 60 + 50}
                x2={childX}
                y2={childY - 20}
                stroke={
                  highlightPath[depth] === char ||
                  (dfsPath && dfsPath[depth] === char)
                    ? "var(--accent-1)"
                    : "var(--border)"
                }
                strokeWidth={
                  highlightPath[depth] === char ||
                  (dfsPath && dfsPath[depth] === char)
                    ? 2
                    : 1
                }
              />
              {renderNode(childNode, path + char, depth + 1, childX)}
            </g>
          );
        })}
      </g>
    );
  };

  return (
    <svg
      width="100%"
      height="380"
      viewBox="0 0 350 380"
      role="img"
      aria-label="Trie data structure visualization for autocomplete"
    >
      {renderNode(trie, "", 0, 175)}
    </svg>
  );
};

// Main component
export const TrieAutocompleteVisualizer: React.FC = () => {
  const [prefix, setPrefix] = useState<string>("ap");
  const [stepIndex, setStepIndex] = useState(0);

  const trie = useMemo(() => buildTrie(), []);
  const steps = useMemo(
    () => generateAutocompleteSteps(trie, prefix),
    [trie, prefix]
  );
  const currentStep = steps[stepIndex];

  const prefixOptions = ["ap", "app", "a", "b"];

  const handlePrefixChange = (newPrefix: string) => {
    setPrefix(newPrefix);
    setStepIndex(0);
  };

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
          Autocomplete Visualization
        </h3>
        <div className="flex gap-2 flex-wrap">
          {prefixOptions.map((p) => (
            <button
              key={p}
              onClick={() => handlePrefixChange(p)}
              className="px-3 py-1 rounded text-sm font-mono transition-colors"
              style={{
                backgroundColor:
                  prefix === p ? "var(--accent-1)" : "var(--bg-elevated)",
                color: prefix === p ? "white" : "var(--text-2)",
              }}
            >
              &quot;{p}&quot;
            </button>
          ))}
        </div>
      </div>

      {/* Trie words */}
      <div
        className="text-sm px-3 py-2 rounded"
        style={{
          backgroundColor: "var(--bg-elevated)",
          color: "var(--text-2)",
        }}
      >
        <span style={{ color: "var(--text-3)" }}>Trie contains:</span>{" "}
        [&quot;ape&quot;, &quot;app&quot;, &quot;apple&quot;]
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
              = word stored
            </span>
          </div>
          <TrieVisualization
            trie={trie}
            highlightPath={currentStep?.currentPath || []}
            dfsPath={currentStep?.dfsPath}
            showIsEnd={currentStep?.addWord ? currentStep.dfsPath : undefined}
          />
        </div>

        {/* Step info */}
        <div className="space-y-3">
          {/* Query info */}
          <div
            className="rounded-lg p-3"
            style={{ backgroundColor: "var(--bg-elevated)" }}
          >
            <div
              className="text-xs mb-2 font-medium"
              style={{ color: "var(--text-3)" }}
            >
              QUERY
            </div>
            <div
              className="font-mono text-lg"
              style={{ color: "var(--text-1)" }}
            >
              autocomplete(&quot;{prefix}&quot;)
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
              {/* Phase badge */}
              <div className="flex items-center gap-2">
                <span
                  className="px-2 py-0.5 rounded text-xs font-medium"
                  style={{
                    backgroundColor:
                      currentStep?.phase === "navigate"
                        ? "var(--accent-1)"
                        : currentStep?.phase === "dfs"
                          ? "var(--accent-2)"
                          : "#22c55e",
                    color: "white",
                  }}
                >
                  {currentStep?.phase === "navigate"
                    ? "NAVIGATE"
                    : currentStep?.phase === "dfs"
                      ? "DFS"
                      : "RESULT"}
                </span>
              </div>

              {/* Description */}
              <div style={{ color: "var(--text-1)" }}>
                {currentStep?.description}
              </div>

              {/* Collected words */}
              {currentStep?.phase !== "navigate" && (
                <div
                  className="text-sm mt-2 pt-2"
                  style={{
                    borderTop: "1px solid var(--border)",
                    color: "var(--text-2)",
                  }}
                >
                  <span style={{ color: "var(--text-3)" }}>
                    Collected words:
                  </span>{" "}
                  {currentStep?.collectedWords?.length
                    ? `[${currentStep.collectedWords.map((w) => `"${w}"`).join(", ")}]`
                    : "[]"}
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-2">
            <button
              onClick={() => setStepIndex(Math.max(0, stepIndex - 1))}
              disabled={stepIndex === 0}
              aria-label="Go to previous step"
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
              aria-label="Go to next step"
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

      {/* Algorithm summary */}
      <div
        className="rounded-lg p-4 mt-4"
        style={{
          backgroundColor: "var(--bg-elevated)",
          border: "1px solid var(--border)",
        }}
      >
        <div
          className="text-sm font-medium mb-2"
          style={{ color: "var(--text-1)" }}
        >
          Algorithm: Two Steps
        </div>
        <div
          className="grid md:grid-cols-2 gap-4 text-sm"
          style={{ color: "var(--text-2)" }}
        >
          <div>
            <span
              className="inline-block px-2 py-0.5 rounded text-xs font-medium mr-2"
              style={{ backgroundColor: "var(--accent-1)", color: "white" }}
            >
              1
            </span>
            <strong>Navigate</strong> to prefix node using findNode
          </div>
          <div>
            <span
              className="inline-block px-2 py-0.5 rounded text-xs font-medium mr-2"
              style={{ backgroundColor: "var(--accent-2)", color: "white" }}
            >
              2
            </span>
            <strong>DFS</strong> to collect all words (a→z order = sorted)
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrieAutocompleteVisualizer;
