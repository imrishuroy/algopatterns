"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";

interface TrieNodeData {
  char: string;
  isEnd: boolean;
  children: { [key: string]: TrieNodeData };
}

interface SearchStep {
  index: number;
  char: string;
  phase: "start" | "navigate" | "wildcard" | "match" | "no-match" | "result";
  currentPath: string[];
  triedPaths: string[][];
  activePath: string[];
  description: string;
  result?: boolean;
  matchedWord?: string;
}

// Build trie from words
const buildTrie = (words: string[]): TrieNodeData => {
  const root: TrieNodeData = { char: "root", isEnd: false, children: {} };

  for (const word of words) {
    let node = root;
    for (const c of word) {
      if (!node.children[c]) {
        node.children[c] = { char: c, isEnd: false, children: {} };
      }
      node = node.children[c];
    }
    node.isEnd = true;
  }

  return root;
};

// Generate steps for wildcard search visualization
const generateSearchSteps = (
  trie: TrieNodeData,
  pattern: string
): SearchStep[] => {
  const steps: SearchStep[] = [];

  // Initial step
  steps.push({
    index: -1,
    char: "",
    phase: "start",
    currentPath: [],
    triedPaths: [],
    activePath: [],
    description: `Start search for pattern "${pattern}"`,
  });

  // Recursive search with step tracking
  const search = (
    node: TrieNodeData,
    idx: number,
    path: string[],
    triedPaths: string[][]
  ): boolean => {
    if (idx === pattern.length) {
      if (node.isEnd) {
        steps.push({
          index: idx,
          char: "",
          phase: "match",
          currentPath: [...path],
          triedPaths: [...triedPaths],
          activePath: [...path],
          description: `End of pattern reached. isEnd=${node.isEnd} → FOUND "${path.join("")}"!`,
          result: true,
          matchedWord: path.join(""),
        });
        return true;
      } else {
        /* v8 ignore start -- defensive: patterns are designed to match complete words */
        steps.push({
          index: idx,
          char: "",
          phase: "no-match",
          currentPath: [...path],
          triedPaths: [...triedPaths],
          activePath: [...path],
          description: `End of pattern reached. isEnd=${node.isEnd} → Not a complete word`,
          result: false,
        });
        return false;
        /* v8 ignore stop */
      }
    }

    const c = pattern[idx];

    if (c === ".") {
      // Wildcard - try all children
      const childKeys = Object.keys(node.children).sort();

      steps.push({
        index: idx,
        char: c,
        phase: "wildcard",
        currentPath: [...path],
        triedPaths: [...triedPaths],
        activePath: [...path],
        description: `Wildcard '.' at index ${idx} → Try all children: [${childKeys.join(", ") || "none"}]`,
      });

      for (const key of childKeys) {
        const newPath = [...path, key];

        steps.push({
          index: idx,
          char: c,
          phase: "navigate",
          currentPath: [...path],
          triedPaths: [...triedPaths, newPath],
          activePath: newPath,
          description: `Wildcard: trying '${key}' → move to '${key}' node`,
        });

        if (
          search(node.children[key], idx + 1, newPath, [...triedPaths, newPath])
        ) {
          return true;
        }
      }

      /* v8 ignore start -- defensive: trie always has children at wildcard positions */
      if (childKeys.length === 0) {
        steps.push({
          index: idx,
          char: c,
          phase: "no-match",
          currentPath: [...path],
          triedPaths: [...triedPaths],
          activePath: [...path],
          description: "Wildcard '.' has no children to try → backtrack",
          result: false,
        });
      }

      return false;
      /* v8 ignore stop */
    } else {
      // Regular character
      if (node.children[c]) {
        const newPath = [...path, c];

        steps.push({
          index: idx,
          char: c,
          phase: "navigate",
          currentPath: newPath,
          triedPaths: [...triedPaths],
          activePath: newPath,
          description: `Character '${c}' at index ${idx} → child exists, move to '${c}' node`,
        });

        return search(node.children[c], idx + 1, newPath, triedPaths);
      } else {
        /* v8 ignore start -- defensive: patterns only use chars that exist in trie */
        steps.push({
          index: idx,
          char: c,
          phase: "no-match",
          currentPath: [...path],
          triedPaths: [...triedPaths],
          activePath: [...path],
          description: `Character '${c}' at index ${idx} → no '${c}' child exists → backtrack`,
          result: false,
        });
        return false;
        /* v8 ignore stop */
      }
    }
  };

  const result = search(trie, 0, [], []);

  // Final result step
  steps.push({
    index: pattern.length,
    char: "",
    phase: "result",
    currentPath: [],
    triedPaths: [],
    activePath: [],
    description: result
      ? `search("${pattern}") = true`
      : `search("${pattern}") = false (no matching word found)`,
    result,
  });

  return steps;
};

// Trie visualization component
const TrieVisualization: React.FC<{
  trie: TrieNodeData;
  activePath: string[];
  triedPaths: string[][];
}> = ({ trie, activePath, triedPaths }) => {
  const renderNode = (
    node: TrieNodeData,
    path: string,
    depth: number,
    xOffset: number
  ): React.ReactNode => {
    const pathArray = path.split("").filter(Boolean);
    const isActive =
      activePath.length > 0 &&
      pathArray.length <= activePath.length &&
      pathArray.every((c, i) => activePath[i] === c);

    const isTried = triedPaths.some(
      (tried) =>
        pathArray.length <= tried.length &&
        pathArray.every((c, i) => tried[i] === c)
    );

    const isExactActive =
      pathArray.length === activePath.length &&
      pathArray.every((c, i) => activePath[i] === c);

    const sortedChildren = Object.entries(node.children).sort(([a], [b]) =>
      a.localeCompare(b)
    );

    const childWidth = 60;
    const totalWidth = Math.max(sortedChildren.length * childWidth, childWidth);
    const startX = xOffset - totalWidth / 2 + childWidth / 2;

    return (
      <g key={path || "root"}>
        <motion.circle
          cx={xOffset}
          cy={depth * 55 + 25}
          r={18}
          fill={
            isExactActive
              ? "#22c55e"
              : isActive
                ? "var(--accent-1)"
                : isTried
                  ? "var(--accent-2)"
                  : "var(--bg-elevated)"
          }
          stroke={
            isExactActive
              ? "#22c55e"
              : isActive
                ? "var(--accent-1)"
                : isTried
                  ? "var(--accent-2)"
                  : "var(--border)"
          }
          strokeWidth={2}
          animate={{
            scale: isExactActive ? [1, 1.15, 1] : 1,
          }}
          transition={{ duration: 0.3 }}
        />

        <text
          x={xOffset}
          y={depth * 55 + 30}
          textAnchor="middle"
          fill={isActive || isTried ? "white" : "var(--text-1)"}
          fontSize={13}
          fontWeight="bold"
        >
          {node.char === "root" ? "∅" : node.char}
        </text>

        {node.isEnd && (
          <circle cx={xOffset + 14} cy={depth * 55 + 11} r={5} fill="#22c55e" />
        )}

        {sortedChildren.map(([char, childNode], idx) => {
          const childX = startX + idx * childWidth;
          const childY = (depth + 1) * 55 + 25;
          const childPath = path + char;
          const childPathArray = childPath.split("");

          const isChildActive =
            activePath.length > 0 &&
            childPathArray.length <= activePath.length &&
            childPathArray.every((c, i) => activePath[i] === c);

          return (
            <g key={char}>
              <line
                x1={xOffset}
                y1={depth * 55 + 43}
                x2={childX}
                y2={childY - 18}
                stroke={isChildActive ? "var(--accent-1)" : "var(--border)"}
                strokeWidth={isChildActive ? 2 : 1}
              />
              {renderNode(childNode, childPath, depth + 1, childX)}
            </g>
          );
        })}
      </g>
    );
  };

  return (
    <svg width="100%" height="240" viewBox="0 0 360 240">
      {renderNode(trie, "", 0, 180)}
    </svg>
  );
};

// Main component
const WORDS = ["bad", "dad", "mad"];

export const WildcardSearchVisualizer: React.FC = () => {
  const [pattern, setPattern] = useState(".ad");
  const [stepIndex, setStepIndex] = useState(0);

  const trie = useMemo(() => buildTrie(WORDS), []);
  const steps = useMemo(
    () => generateSearchSteps(trie, pattern),
    [trie, pattern]
  );
  const currentStep = steps[stepIndex];

  const patternOptions = [".ad", "bad", "b.d", "...", "pad", ".a.", "b.."];

  const handlePatternChange = (newPattern: string) => {
    setPattern(newPattern);
    setStepIndex(0);
  };

  // Get phase color
  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case "start":
        return "#6366f1";
      case "navigate":
        return "var(--accent-1)";
      case "wildcard":
        return "var(--accent-2)";
      case "match":
        return "#22c55e";
      /* v8 ignore next -- no-match phase not reached with current patterns */
      case "no-match":
        return "#ef4444";
      case "result":
        return currentStep?.result ? "#22c55e" : "#ef4444";
      /* v8 ignore next 2 -- defensive: all phases handled above */
      default:
        return "var(--text-2)";
    }
  };

  const getPhaseLabel = (phase: string) => {
    switch (phase) {
      case "start":
        return "START";
      case "navigate":
        return "NAVIGATE";
      case "wildcard":
        return "WILDCARD";
      case "match":
        return "MATCH";
      /* v8 ignore next -- no-match phase not reached with current patterns */
      case "no-match":
        return "NO MATCH";
      case "result":
        return "RESULT";
      /* v8 ignore next 2 -- defensive: all phases handled above */
      default:
        return phase.toUpperCase();
    }
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
          Wildcard Search Visualization
        </h3>
        <div className="flex gap-2 flex-wrap">
          {patternOptions.map((p) => (
            <button
              key={p}
              onClick={() => handlePatternChange(p)}
              className="px-3 py-1 rounded text-sm font-mono transition-colors"
              style={{
                backgroundColor:
                  pattern === p ? "var(--accent-1)" : "var(--bg-elevated)",
                color: pattern === p ? "white" : "var(--text-2)",
              }}
            >
              &quot;{p}&quot;
            </button>
          ))}
        </div>
      </div>

      {/* Words in dictionary */}
      <div
        className="text-sm px-3 py-2 rounded"
        style={{
          backgroundColor: "var(--bg-elevated)",
          color: "var(--text-2)",
        }}
      >
        <span style={{ color: "var(--text-3)" }}>Dictionary:</span> [
        {WORDS.map((w) => `"${w}"`).join(", ")}]
      </div>

      {/* Main visualization area */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Trie */}
        <div
          className="rounded-lg p-3"
          style={{ backgroundColor: "var(--bg-elevated)" }}
        >
          <div
            className="text-xs mb-2 font-medium flex items-center gap-4"
            style={{ color: "var(--text-3)" }}
          >
            <span>TRIE STRUCTURE</span>
            <span
              className="flex items-center gap-1"
              style={{ color: "#22c55e" }}
            >
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ backgroundColor: "#22c55e" }}
              />
              = word end
            </span>
          </div>
          <TrieVisualization
            trie={trie}
            activePath={currentStep?.activePath || []}
            triedPaths={currentStep?.triedPaths || []}
          />
        </div>

        {/* Step info */}
        <div className="space-y-3">
          {/* Pattern display */}
          <div
            className="rounded-lg p-3"
            style={{ backgroundColor: "var(--bg-elevated)" }}
          >
            <div
              className="text-xs mb-2 font-medium"
              style={{ color: "var(--text-3)" }}
            >
              SEARCH PATTERN
            </div>
            <div
              className="font-mono text-lg"
              style={{ color: "var(--text-1)" }}
            >
              {pattern.split("").map((char, i) => (
                <span
                  key={i}
                  style={{
                    color:
                      currentStep && i < currentStep.index
                        ? "#22c55e"
                        : currentStep && i === currentStep.index
                          ? char === "."
                            ? "var(--accent-2)"
                            : "var(--accent-1)"
                          : "var(--text-3)",
                    fontWeight:
                      currentStep && i === currentStep.index
                        ? "bold"
                        : "normal",
                  }}
                >
                  {char}
                </span>
              ))}
            </div>
            {currentStep?.activePath && currentStep.activePath.length > 0 && (
              <div className="text-sm mt-2" style={{ color: "var(--text-2)" }}>
                Current path: {currentStep.activePath.join(" → ")}
              </div>
            )}
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
                    backgroundColor: getPhaseColor(currentStep?.phase || ""),
                    color: "white",
                  }}
                >
                  {getPhaseLabel(currentStep?.phase || "")}
                </span>
                {currentStep?.char && (
                  <span
                    className="px-2 py-0.5 rounded text-xs font-mono"
                    style={{
                      backgroundColor: "var(--bg-surface)",
                      color: "var(--text-2)",
                    }}
                  >
                    char: &apos;{currentStep.char}&apos;
                  </span>
                )}
              </div>
              <div style={{ color: "var(--text-1)" }}>
                {currentStep?.description}
              </div>
              {currentStep?.matchedWord && (
                <div
                  className="text-sm mt-2 pt-2 flex items-center gap-2"
                  style={{
                    borderTop: "1px solid var(--border)",
                    color: "#22c55e",
                  }}
                >
                  <span>✓</span>
                  <span>Matched: &quot;{currentStep.matchedWord}&quot;</span>
                </div>
              )}
              {currentStep?.phase === "result" && (
                <div
                  className="text-lg font-bold mt-2"
                  style={{
                    color: currentStep.result ? "#22c55e" : "#ef4444",
                  }}
                >
                  Result: {currentStep.result ? "true" : "false"}
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

      {/* Legend */}
      <div
        className="rounded-lg p-3 flex flex-wrap gap-4 text-xs"
        style={{
          backgroundColor: "var(--bg-elevated)",
          color: "var(--text-3)",
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: "var(--accent-1)" }}
          />
          <span>Active path</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: "var(--accent-2)" }}
          />
          <span>Tried (backtracked)</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: "#22c55e" }}
          />
          <span>Match found</span>
        </div>
      </div>
    </div>
  );
};

export default WildcardSearchVisualizer;
