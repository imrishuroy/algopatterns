"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

interface TrieNode {
  char: string;
  isEnd: boolean;
  children: { [key: string]: TrieNode };
}

interface InsertStep {
  word: string;
  charIndex: number;
  char: string;
  arrayIndex: number;
  action: "check" | "create" | "move" | "markEnd" | "complete";
  description: string;
  trie: TrieNode;
  currentPath: string[];
}

const createEmptyTrie = (): TrieNode => ({
  char: "root",
  isEnd: false,
  children: {},
});

const cloneTrie = (node: TrieNode): TrieNode => ({
  char: node.char,
  isEnd: node.isEnd,
  children: Object.fromEntries(
    Object.entries(node.children).map(([k, v]) => [k, cloneTrie(v)])
  ),
});

const generateSteps = (words: string[]): InsertStep[] => {
  const steps: InsertStep[] = [];
  const trie = createEmptyTrie();

  for (const word of words) {
    let currentNode = trie;
    const currentPath: string[] = [];

    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      const arrayIndex = char.charCodeAt(0) - 97;

      // Check step
      steps.push({
        word,
        charIndex: i,
        char,
        arrayIndex,
        action: "check",
        description: `Check if '${char}' exists at children[${arrayIndex}]`,
        trie: cloneTrie(trie),
        currentPath: [...currentPath],
      });

      if (!currentNode.children[char]) {
        // Create step
        currentNode.children[char] = {
          char,
          isEnd: false,
          children: {},
        };

        steps.push({
          word,
          charIndex: i,
          char,
          arrayIndex,
          action: "create",
          description: `children[${arrayIndex}] is null → Create new node for '${char}'`,
          trie: cloneTrie(trie),
          currentPath: [...currentPath],
        });
      }

      // Move step
      currentPath.push(char);
      currentNode = currentNode.children[char];

      steps.push({
        word,
        charIndex: i,
        char,
        arrayIndex,
        action: "move",
        description: `Move to '${char}' node`,
        trie: cloneTrie(trie),
        currentPath: [...currentPath],
      });
    }

    // Mark end
    currentNode.isEnd = true;
    steps.push({
      word,
      charIndex: word.length - 1,
      char: word[word.length - 1],
      arrayIndex: word[word.length - 1].charCodeAt(0) - 97,
      action: "markEnd",
      description: `Mark isEnd = true for "${word}"`,
      trie: cloneTrie(trie),
      currentPath: [...currentPath],
    });

    // Complete
    steps.push({
      word,
      charIndex: word.length - 1,
      char: word[word.length - 1],
      arrayIndex: word[word.length - 1].charCodeAt(0) - 97,
      action: "complete",
      description: `"${word}" inserted successfully!`,
      trie: cloneTrie(trie),
      currentPath: [...currentPath],
    });
  }

  return steps;
};

// Trie Tree Visualization
const TrieTree = ({
  node,
  currentPath,
  depth = 0,
  pathSoFar = "",
}: {
  node: TrieNode;
  currentPath: string[];
  depth?: number;
  pathSoFar?: string;
}) => {
  const children = Object.entries(node.children).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  const isInPath =
    depth === 0 || currentPath.slice(0, depth).join("") === pathSoFar;
  const isCurrentNode = currentPath.join("") === pathSoFar && pathSoFar !== "";

  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={`
          relative flex items-center justify-center
          w-12 h-12 rounded-full border-3 font-bold text-lg
          transition-all duration-300
          ${
            isCurrentNode
              ? "bg-green-500 border-green-400 text-white shadow-lg shadow-green-500/50"
              : isInPath
                ? "bg-blue-500 border-blue-400 text-white"
                : "bg-gray-700 border-gray-600 text-gray-300"
          }
        `}
      >
        {node.char === "root" ? "○" : node.char}
        {node.isEnd && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center text-[10px] text-black font-bold">
            ✓
          </div>
        )}
      </motion.div>

      {children.length > 0 && (
        <>
          <div className="w-0.5 h-6 bg-gray-600" />
          <div className="flex gap-8">
            {children.map(([char, child]) => (
              <div key={char} className="flex flex-col items-center">
                <TrieTree
                  node={child}
                  currentPath={currentPath}
                  depth={depth + 1}
                  pathSoFar={pathSoFar + char}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Array Index Visualization
const ArrayIndexVisual = ({
  char,
  index,
  action,
}: {
  char: string;
  index: number;
  action: string;
}) => {
  const slots = Array.from({ length: 26 }, (_, i) =>
    String.fromCharCode(97 + i)
  );

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="text-sm text-gray-400 mb-3 text-center">
        children[26] array — Index calculation: &apos;{char}&apos; -
        &apos;a&apos; = {index}
      </div>
      <div className="flex flex-wrap justify-center gap-1">
        {slots.map((c, i) => (
          <div
            key={i}
            className={`
              w-7 h-7 flex items-center justify-center text-xs font-mono rounded
              ${
                i === index
                  ? action === "create"
                    ? "bg-green-500 text-white ring-2 ring-green-400"
                    : "bg-blue-500 text-white ring-2 ring-blue-400"
                  : "bg-gray-700 text-gray-500"
              }
            `}
          >
            {c}
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-1 mt-1">
        {slots.map((_, i) => (
          <div
            key={i}
            className={`w-7 text-center text-[10px] ${
              i === index ? "text-blue-400 font-bold" : "text-gray-600"
            }`}
          >
            {i}
          </div>
        ))}
      </div>
    </div>
  );
};

// Word Progress Display
const WordProgress = ({
  word,
  charIndex,
  action,
}: {
  word: string;
  charIndex: number;
  action: string;
}) => (
  <div className="flex items-center justify-center gap-1 text-2xl font-mono">
    {word.split("").map((char, i) => (
      <span
        key={i}
        className={`
          w-10 h-10 flex items-center justify-center rounded-lg border-2 transition-all
          ${
            i < charIndex
              ? "bg-green-500/20 border-green-500 text-green-400"
              : i === charIndex
                ? action === "complete" || action === "markEnd"
                  ? "bg-green-500 border-green-400 text-white"
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

// Code Display
const CodeDisplay = ({ step }: { step: InsertStep }) => {
  const getCode = () => {
    switch (step.action) {
      case "check":
        return `int index = '${step.char}' - 'a';  // ${step.arrayIndex}
if (node.children[${step.arrayIndex}] == null)`;
      case "create":
        return `// children[${step.arrayIndex}] is null
node.children[${step.arrayIndex}] = new TrieNode();`;
      case "move":
        return `node = node.children[${step.arrayIndex}];  // move to '${step.char}'`;
      case "markEnd":
        return `node.isEnd = true;  // "${step.word}" ends here`;
      case "complete":
        return `// "${step.word}" inserted!`;
      /* v8 ignore next 2 -- defensive: all actions are explicitly handled */
      default:
        return "";
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 font-mono text-sm">
      <pre
        className={`${
          step.action === "create"
            ? "text-green-400"
            : step.action === "markEnd" || step.action === "complete"
              ? "text-yellow-400"
              : "text-blue-400"
        }`}
      >
        {getCode()}
      </pre>
    </div>
  );
};

// skipcq: JS-0067
export default function TrieInsertVisualizer() {
  const [words] = useState(["cat", "car"]);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = React.useMemo(() => generateSteps(words), [words]);
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

  const handleReset = () => {
    setCurrentStep(0);
  };

  if (!step) return null;

  return (
    <div className="bg-gray-900 rounded-xl p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-white mb-2">
          Trie Insert Visualization
        </h3>
        <p className="text-gray-400 text-sm">
          Inserting words:{" "}
          {words.map((w) => (
            <span
              key={w}
              className={`mx-1 px-2 py-0.5 rounded ${
                step.word === w ? "bg-blue-600 text-white" : "bg-gray-700"
              }`}
            >
              {w}
            </span>
          ))}
        </p>
      </div>

      {/* Current Word Progress */}
      <div className="mb-6">
        <div className="text-center text-sm text-gray-500 mb-2">
          Current word: &quot;{step.word}&quot;
        </div>
        <WordProgress
          word={step.word}
          charIndex={step.charIndex}
          action={step.action}
        />
      </div>

      {/* Main Visualization Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Trie Tree */}
        <div className="bg-gray-800/50 rounded-xl p-6 min-h-[250px] flex items-center justify-center">
          <TrieTree node={step.trie} currentPath={step.currentPath} />
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          {/* Array Index */}
          <ArrayIndexVisual
            char={step.char}
            index={step.arrayIndex}
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
            step.action === "create"
              ? "bg-green-600/20 text-green-400 border border-green-600/30"
              : step.action === "markEnd"
                ? "bg-yellow-600/20 text-yellow-400 border border-yellow-600/30"
                : step.action === "complete"
                  ? "bg-blue-600/20 text-blue-400 border border-blue-600/30"
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

        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition"
        >
          Reset
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
          <div className="w-4 h-4 rounded-full bg-green-500" />
          <span>Current Node</span>
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
