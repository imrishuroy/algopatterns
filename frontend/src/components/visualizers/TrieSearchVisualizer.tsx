"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

interface TrieNode {
  char: string;
  isEnd: boolean;
  children: { [key: string]: TrieNode };
}

interface SearchStep {
  query: string;
  method: "search" | "startsWith";
  charIndex: number;
  char: string;
  action: "navigate" | "notFound" | "checkEnd" | "result";
  pathExists: boolean;
  isEnd: boolean | null;
  result: boolean | null;
  description: string;
  currentPath: string[];
}

// Build a pre-populated trie with ["app", "apple"]
const buildTrie = (): TrieNode => {
  const root: TrieNode = { char: "root", isEnd: false, children: {} };

  // Insert "app"
  let node = root;
  for (const c of "app") {
    node.children[c] = { char: c, isEnd: false, children: {} };
    node = node.children[c];
  }
  node.isEnd = true; // "app" ends here

  // Insert "apple" (continue from "app")
  for (const c of "le") {
    node.children[c] = { char: c, isEnd: false, children: {} };
    node = node.children[c];
  }
  node.isEnd = true; // "apple" ends here

  return root;
};

const generateSearchSteps = (
  trie: TrieNode,
  query: string,
  method: "search" | "startsWith"
): SearchStep[] => {
  const steps: SearchStep[] = [];
  let node: TrieNode | null = trie;
  const currentPath: string[] = [];

  for (let i = 0; i < query.length; i++) {
    const char = query[i];

    // Check if path exists
    if (node && node.children[char]) {
      currentPath.push(char);
      node = node.children[char];

      steps.push({
        query,
        method,
        charIndex: i,
        char,
        action: "navigate",
        pathExists: true,
        isEnd: node.isEnd,
        result: null,
        description: `'${char}' exists → move to '${char}' node`,
        currentPath: [...currentPath],
      });
    } else {
      // Path doesn't exist
      steps.push({
        query,
        method,
        charIndex: i,
        char,
        action: "notFound",
        pathExists: false,
        isEnd: null,
        result: false,
        description: `'${char}' not found → path doesn't exist`,
        currentPath: [...currentPath],
      });

      // Final result step
      steps.push({
        query,
        method,
        charIndex: i,
        char,
        action: "result",
        pathExists: false,
        isEnd: null,
        result: false,
        description: `${method}("${query}") = false (path broken)`,
        currentPath: [...currentPath],
      });

      return steps;
    }
  }

  // Reached end of query - check isEnd for search
  const finalNode = node as TrieNode;

  steps.push({
    query,
    method,
    charIndex: query.length - 1,
    char: query[query.length - 1],
    action: "checkEnd",
    pathExists: true,
    isEnd: finalNode.isEnd,
    result: null,
    description:
      method === "search"
        ? `Check: node.isEnd = ${finalNode.isEnd}`
        : `Check: node != null (path exists)`,
    currentPath: [...currentPath],
  });

  // Final result
  const result = method === "search" ? finalNode.isEnd : true;

  steps.push({
    query,
    method,
    charIndex: query.length - 1,
    char: query[query.length - 1],
    action: "result",
    pathExists: true,
    isEnd: finalNode.isEnd,
    result,
    description: `${method}("${query}") = ${result}`,
    currentPath: [...currentPath],
  });

  return steps;
};

// Trie Tree Visualization
const TrieTree = ({
  node,
  currentPath,
  depth = 0,
  pathSoFar = "",
  highlightIsEnd = false,
}: {
  node: TrieNode;
  currentPath: string[];
  depth?: number;
  pathSoFar?: string;
  highlightIsEnd?: boolean;
}) => {
  /* v8 ignore next 2 -- sort comparator callback */
  const children = Object.entries(node.children).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  const isInPath =
    depth === 0 || currentPath.slice(0, depth).join("") === pathSoFar;
  const isCurrentNode = currentPath.join("") === pathSoFar && pathSoFar !== "";
  const shouldHighlightIsEnd = highlightIsEnd && isCurrentNode && node.isEnd;

  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className={`
          relative flex items-center justify-center
          w-12 h-12 rounded-full border-3 font-bold text-lg
          transition-all duration-300
          ${
            isCurrentNode
              ? shouldHighlightIsEnd
                ? "bg-green-500 border-green-400 text-white shadow-lg shadow-green-500/50"
                : "bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/50"
              : isInPath
                ? "bg-blue-500/70 border-blue-400 text-white"
                : "bg-gray-700 border-gray-600 text-gray-300"
          }
        `}
      >
        {node.char === "root" ? "○" : node.char}
        {node.isEnd && (
          <div
            className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              shouldHighlightIsEnd
                ? "bg-yellow-400 text-black ring-2 ring-yellow-300 animate-pulse"
                : "bg-yellow-400 text-black"
            }`}
          >
            ✓
          </div>
        )}
      </motion.div>

      {children.length > 0 && (
        <>
          <div className="w-0.5 h-6 bg-gray-600" />
          <div className="flex gap-6">
            {children.map(([char, child]) => (
              <div key={char} className="flex flex-col items-center">
                <TrieTree
                  node={child}
                  currentPath={currentPath}
                  depth={depth + 1}
                  pathSoFar={pathSoFar + char}
                  highlightIsEnd={highlightIsEnd}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Query Progress Display
const QueryProgress = ({
  query,
  charIndex,
  action,
}: {
  query: string;
  charIndex: number;
  action: string;
}) => (
  <div className="flex items-center justify-center gap-1 text-2xl font-mono">
    {query.split("").map((char, i) => (
      <span
        key={i}
        className={`
          w-10 h-10 flex items-center justify-center rounded-lg border-2 transition-all
          ${
            i < charIndex
              ? "bg-green-500/20 border-green-500 text-green-400"
              : i === charIndex
                ? action === "result"
                  ? "bg-green-500 border-green-400 text-white"
                  : action === "notFound"
                    ? "bg-red-500 border-red-400 text-white"
                    : "bg-blue-500 border-blue-400 text-white animate-pulse"
                : "bg-gray-800 border-gray-700 text-gray-500"
          }
        `}
      >
        {char}
      </span>
    ))}
  </div>
);

// Code Display for Search/StartsWith
const CodeDisplay = ({ step }: { step: SearchStep }) => {
  const getCode = () => {
    switch (step.action) {
      case "navigate":
        return `// '${step.char}' exists in children
node = node.children['${step.char}'];`;
      case "notFound":
        return `// '${step.char}' not in children
return ${step.method === "search" ? "false" : "false"};  // path broken`;
      case "checkEnd":
        return step.method === "search"
          ? `// Reached end of "${step.query}"
return node.isEnd;  // ${step.isEnd}`
          : `// Reached end of "${step.query}"
return node != null;  // true (path exists)`;
      case "result":
        return `// Result: ${step.method}("${step.query}") = ${step.result}`;
      /* v8 ignore next 2 -- defensive: all actions handled above */
      default:
        return "";
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 font-mono text-sm">
      <pre
        className={`${
          step.action === "result"
            ? step.result
              ? "text-green-400"
              : "text-red-400"
            : step.action === "notFound"
              ? "text-red-400"
              : "text-blue-400"
        }`}
      >
        {getCode()}
      </pre>
    </div>
  );
};

// Method comparison display
const MethodComparison = ({
  method,
  isEnd,
  action,
}: {
  method: "search" | "startsWith";
  isEnd: boolean | null;
  action: string;
}) => (
  <div className="bg-gray-800 rounded-lg p-4">
    <div className="text-sm text-gray-400 mb-3 text-center">
      The One-Line Difference
    </div>
    <div className="space-y-2 font-mono text-sm">
      <div
        className={`p-2 rounded ${
          method === "search" && action === "checkEnd"
            ? "bg-blue-500/20 border border-blue-500"
            : "bg-gray-700/50"
        }`}
      >
        <span className="text-purple-400">search:</span>{" "}
        <span className="text-gray-300">node != null</span>
        <span className="text-yellow-400"> && node.isEnd</span>
      </div>
      <div
        className={`p-2 rounded ${
          method === "startsWith" && action === "checkEnd"
            ? "bg-blue-500/20 border border-blue-500"
            : "bg-gray-700/50"
        }`}
      >
        <span className="text-purple-400">startsWith:</span>{" "}
        <span className="text-gray-300">node != null</span>
        <span className="text-gray-500"> (no isEnd check)</span>
      </div>
    </div>
    {action === "checkEnd" && isEnd !== null && (
      <div className="mt-3 text-center text-sm">
        <span className="text-gray-400">Current node.isEnd = </span>
        <span className={isEnd ? "text-green-400" : "text-red-400"}>
          {String(isEnd)}
        </span>
      </div>
    )}
  </div>
);

// Predefined queries to demonstrate
const QUERIES = [
  { query: "app", method: "search" as const, expected: true },
  { query: "appl", method: "search" as const, expected: false },
  { query: "appl", method: "startsWith" as const, expected: true },
  { query: "apply", method: "search" as const, expected: false },
];

// skipcq: JS-0067
export default function TrieSearchVisualizer() {
  const [queryIndex, setQueryIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const trie = React.useMemo(() => buildTrie(), []);

  const currentQuery = QUERIES[queryIndex];
  const steps = React.useMemo(
    () => generateSearchSteps(trie, currentQuery.query, currentQuery.method),
    [trie, currentQuery]
  );

  const step = steps[currentStep];
  const maxStep = steps.length - 1;

  const handleNext = () => {
    if (currentStep < maxStep) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleQueryChange = (index: number) => {
    setQueryIndex(index);
    setCurrentStep(0);
  };

  if (!step) return null;

  return (
    <div className="bg-gray-900 rounded-xl p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-white mb-2">
          Search vs StartsWith
        </h3>
        <p className="text-gray-400 text-sm">
          Trie contains: [&quot;app&quot;, &quot;apple&quot;]
        </p>
      </div>

      {/* Query Selector */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {QUERIES.map((q, i) => (
          <button
            key={i}
            onClick={() => handleQueryChange(i)}
            className={`px-3 py-1.5 rounded-lg text-sm font-mono transition ${
              i === queryIndex
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {q.method}(&quot;{q.query}&quot;) → {String(q.expected)}
          </button>
        ))}
      </div>

      {/* Current Query Progress */}
      <div className="mb-6">
        <div className="text-center text-sm text-gray-500 mb-2">
          {step.method}(&quot;{step.query}&quot;)
        </div>
        <QueryProgress
          query={step.query}
          charIndex={step.charIndex}
          action={step.action}
        />
      </div>

      {/* Main Visualization Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Trie Tree */}
        <div className="bg-gray-800/50 rounded-xl p-6 min-h-[280px] flex items-center justify-center">
          <TrieTree
            node={trie}
            currentPath={step.currentPath}
            highlightIsEnd={
              step.action === "checkEnd" && step.method === "search"
            }
          />
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          {/* Method Comparison */}
          <MethodComparison
            method={step.method}
            isEnd={step.isEnd}
            action={step.action}
          />

          {/* Code */}
          <CodeDisplay step={step} />
        </div>
      </div>

      {/* Status Message */}
      <div className="text-center mb-6">
        <div
          className={`inline-block px-6 py-3 rounded-lg text-sm font-medium ${
            step.action === "result"
              ? step.result
                ? "bg-green-600/20 text-green-400 border border-green-600/30"
                : "bg-red-600/20 text-red-400 border border-red-600/30"
              : step.action === "notFound"
                ? "bg-red-600/20 text-red-400 border border-red-600/30"
                : step.action === "checkEnd"
                  ? "bg-yellow-600/20 text-yellow-400 border border-yellow-600/30"
                  : "bg-gray-800 text-gray-300 border border-gray-700"
          }`}
        >
          {step.description}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Previous
        </button>

        <div className="text-gray-400 text-sm">
          Step {currentStep + 1} of {maxStep + 1}
        </div>

        <button
          onClick={handleNext}
          disabled={currentStep >= maxStep}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-2"
        >
          Next
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-800 flex flex-wrap justify-center gap-6 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gray-700 border border-gray-600" />
          <span>Node</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-500" />
          <span>Current Path</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gray-700 border border-gray-600 relative">
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-yellow-400 rounded-full" />
          </div>
          <span>isEnd = true</span>
        </div>
      </div>
    </div>
  );
}
