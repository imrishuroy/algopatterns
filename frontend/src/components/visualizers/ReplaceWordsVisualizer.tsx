"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";

interface SearchStep {
  phase: "start" | "processing" | "found" | "no_match" | "complete";
  currentWord: string;
  currentWordIndex: number;
  currentChar: string;
  charIndex: number;
  triePath: string;
  triePathArray: string[];
  result: string | null;
  processedWords: { original: string; replaced: string; wordIndex: number }[];
  description: string;
}

// Build trie from dictionary
const buildTrie = (dictionary: string[]): Record<string, unknown> => {
  const root: Record<string, unknown> = {};

  for (const word of dictionary) {
    let node = root;
    for (const c of word) {
      if (!node[c]) {
        node[c] = {};
      }
      node = node[c] as Record<string, unknown>;
    }
    (node as Record<string, string>).word = word;
  }

  return root;
};

// Generate visualization steps
const generateSteps = (
  dictionary: string[],
  sentence: string
): SearchStep[] => {
  const steps: SearchStep[] = [];
  const trie = buildTrie(dictionary);
  const words = sentence.split(" ");
  const processedWords: {
    original: string;
    replaced: string;
    wordIndex: number;
  }[] = [];

  steps.push({
    phase: "start",
    currentWord: "",
    currentWordIndex: -1,
    currentChar: "",
    charIndex: -1,
    triePath: "root",
    triePathArray: [],
    result: null,
    processedWords: [],
    description: `Dictionary: [${dictionary.map((w) => `"${w}"`).join(", ")}]. Processing sentence...`,
  });

  for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
    const word = words[wordIndex];
    let node = trie;
    let found = false;
    const pathArray: string[] = [];

    for (let i = 0; i < word.length; i++) {
      const c = word[i];
      const pathSoFar = word.slice(0, i + 1);

      // Check if current node has a word (root found!)
      if ((node as Record<string, string>).word) {
        const root = (node as Record<string, string>).word;
        steps.push({
          phase: "found",
          currentWord: word,
          currentWordIndex: wordIndex,
          currentChar: c,
          charIndex: i,
          triePath: root,
          triePathArray: [...pathArray],
          result: root,
          processedWords: [...processedWords],
          description: `Found root "${root}" for "${word}"! Return immediately (shortest root).`,
        });
        processedWords.push({ original: word, replaced: root, wordIndex });
        found = true;
        break;
      }

      // Check if path exists in trie
      if (!(node as Record<string, unknown>)[c]) {
        steps.push({
          phase: "no_match",
          currentWord: word,
          currentWordIndex: wordIndex,
          currentChar: c,
          charIndex: i,
          triePath: pathSoFar,
          triePathArray: [...pathArray],
          result: word,
          processedWords: [...processedWords],
          description: `No path for '${c}' in Trie. Keep original word "${word}".`,
        });
        processedWords.push({ original: word, replaced: word, wordIndex });
        found = true;
        break;
      }

      pathArray.push(c);
      steps.push({
        phase: "processing",
        currentWord: word,
        currentWordIndex: wordIndex,
        currentChar: c,
        charIndex: i,
        triePath: pathSoFar,
        triePathArray: [...pathArray],
        result: null,
        processedWords: [...processedWords],
        description: `Traverse '${c}' → path: root${pathArray.map((p) => `→${p}`).join("")}`,
      });

      node = (node as Record<string, unknown>)[c] as Record<string, unknown>;
    }

    /* v8 ignore start -- defensive: sentence words are designed to find matches early */
    // Word fully traversed without finding root
    if (!found) {
      const nodeWord = (node as Record<string, string>).word;
      if (nodeWord) {
        steps.push({
          phase: "found",
          currentWord: word,
          currentWordIndex: wordIndex,
          currentChar: "",
          charIndex: word.length,
          triePath: nodeWord,
          triePathArray: [...pathArray],
          result: nodeWord,
          processedWords: [...processedWords],
          description: `Word "${word}" exactly matches root "${nodeWord}".`,
        });
        processedWords.push({ original: word, replaced: nodeWord, wordIndex });
      } else {
        steps.push({
          phase: "no_match",
          currentWord: word,
          currentWordIndex: wordIndex,
          currentChar: "",
          charIndex: word.length,
          triePath: word,
          triePathArray: [...pathArray],
          result: word,
          processedWords: [...processedWords],
          description: `No root found for "${word}". Keep original.`,
        });
        processedWords.push({ original: word, replaced: word, wordIndex });
      }
    }
    /* v8 ignore stop */
  }

  const finalResult = processedWords.map((w) => w.replaced).join(" ");
  steps.push({
    phase: "complete",
    currentWord: "",
    currentWordIndex: -1,
    currentChar: "",
    charIndex: -1,
    triePath: "",
    triePathArray: [],
    result: finalResult,
    processedWords: [...processedWords],
    description: `Complete! Result: "${finalResult}"`,
  });

  return steps;
};

// Trie visualization component
const TrieVisualization: React.FC<{
  dictionary: string[];
  currentPath: string[];
  phase: string;
}> = ({ dictionary, currentPath, phase }) => {
  // Group words by first letter
  const grouped = dictionary.reduce(
    (acc, word) => {
      const first = word[0];
      if (!acc[first]) acc[first] = [];
      acc[first].push(word);
      return acc;
    },
    {} as Record<string, string[]>
  );

  const isInPath = (char: string, depth: number) => {
    return currentPath.length > depth && currentPath[depth] === char;
  };

  const isEndOfPath = (char: string, depth: number) => {
    return currentPath.length === depth + 1 && currentPath[depth] === char;
  };

  return (
    <div
      className="rounded-lg p-3"
      style={{ backgroundColor: "var(--bg-elevated)" }}
    >
      <div
        className="text-xs mb-3 font-medium"
        style={{ color: "var(--text-3)" }}
      >
        TRIE STRUCTURE
      </div>
      <div className="font-mono text-sm">
        {/* Root */}
        <div className="flex items-center gap-1 mb-2">
          <span
            className="px-2 py-1 rounded"
            style={{
              backgroundColor:
                currentPath.length === 0
                  ? "var(--accent-1)"
                  : "var(--bg-surface)",
              color: currentPath.length === 0 ? "white" : "var(--text-2)",
            }}
          >
            root
          </span>
        </div>

        {/* Branches */}
        <div className="ml-4 space-y-1">
          {Object.entries(grouped)
            .sort()
            .map(([firstChar, words]) => (
              <div key={firstChar} className="flex items-center gap-1">
                <span style={{ color: "var(--text-3)" }}>├─</span>
                {words[0].split("").map((char, i) => {
                  const inPath = isInPath(char, i);
                  const endPath = isEndOfPath(char, i);
                  const isWordEnd = i === words[0].length - 1;

                  return (
                    <React.Fragment key={i}>
                      {i > 0 && (
                        <span style={{ color: "var(--text-3)" }}>→</span>
                      )}
                      <motion.span
                        className="px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: endPath
                            ? phase === "found"
                              ? "#22c55e"
                              : phase === "no_match"
                                ? "#f59e0b"
                                : "var(--accent-1)"
                            : inPath
                              ? "var(--accent-2)"
                              : "var(--bg-surface)",
                          color: inPath || endPath ? "white" : "var(--text-2)",
                        }}
                        animate={{
                          scale: endPath ? [1, 1.1, 1] : 1,
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        {char}
                        {isWordEnd && (
                          <span
                            className="ml-0.5"
                            style={{ color: inPath ? "white" : "#22c55e" }}
                          >
                            ●
                          </span>
                        )}
                      </motion.span>
                    </React.Fragment>
                  );
                })}
                <span
                  className="text-xs ml-1"
                  style={{ color: "var(--text-3)" }}
                >
                  &quot;{words[0]}&quot;
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

// Word display component
const WordDisplay: React.FC<{
  word: string;
  currentCharIndex: number;
  isCurrentWord: boolean;
  phase: string;
}> = ({ word, currentCharIndex, isCurrentWord, phase }) => {
  return (
    <div className="flex">
      {word.split("").map((char, i) => {
        let bgColor = "transparent";
        let textColor = "var(--text-2)";

        if (isCurrentWord) {
          if (i < currentCharIndex) {
            bgColor = "var(--accent-2)";
            textColor = "white";
          } else if (i === currentCharIndex) {
            bgColor =
              phase === "found"
                ? "#22c55e"
                : phase === "no_match"
                  ? "#ef4444"
                  : "var(--accent-1)";
            textColor = "white";
          }
        }

        return (
          <motion.span
            key={i}
            className="inline-block px-1 py-0.5 font-mono text-lg rounded"
            style={{ backgroundColor: bgColor, color: textColor }}
            animate={{
              scale: isCurrentWord && i === currentCharIndex ? [1, 1.2, 1] : 1,
            }}
            transition={{ duration: 0.2 }}
          >
            {char}
          </motion.span>
        );
      })}
    </div>
  );
};

// Main component
const DICTIONARY = ["cat", "bat", "rat"];
const SENTENCE = "the cattle was rattled by the battery";

export const ReplaceWordsVisualizer: React.FC = () => {
  const [stepIndex, setStepIndex] = useState(0);

  const steps = useMemo(() => generateSteps(DICTIONARY, SENTENCE), []);
  const currentStep = steps[stepIndex];

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case "start":
        return "#6366f1";
      case "processing":
        return "var(--accent-1)";
      case "found":
        return "#22c55e";
      case "no_match":
        return "#f59e0b";
      case "complete":
        return "#22c55e";
      /* v8 ignore next 2 -- defensive: all phases are explicitly handled */
      default:
        return "var(--text-2)";
    }
  };

  const getPhaseLabel = (phase: string) => {
    switch (phase) {
      case "start":
        return "START";
      case "processing":
        return "TRAVERSE";
      case "found":
        return "ROOT FOUND";
      case "no_match":
        return "NO ROOT";
      case "complete":
        return "COMPLETE";
      /* v8 ignore next 2 -- defensive: all phases are explicitly handled */
      default:
        return phase.toUpperCase();
    }
  };

  const sentenceWords = SENTENCE.split(" ");

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
          Replace Words Visualization
        </h3>
        <div
          className="text-sm px-3 py-1 rounded"
          style={{
            backgroundColor: "var(--bg-elevated)",
            color: "var(--text-2)",
          }}
        >
          Dictionary: [{DICTIONARY.map((w) => `"${w}"`).join(", ")}]
        </div>
      </div>

      {/* Sentence display */}
      <div
        className="rounded-lg p-4"
        style={{ backgroundColor: "var(--bg-elevated)" }}
      >
        <div
          className="text-xs mb-3 font-medium"
          style={{ color: "var(--text-3)" }}
        >
          SENTENCE
        </div>
        <div className="flex flex-wrap gap-2">
          {sentenceWords.map((word, i) => {
            const isCurrentWord = currentStep?.currentWordIndex === i;
            const processed = currentStep?.processedWords.find(
              (w) => w.wordIndex === i
            );

            return (
              <div key={`word-${i}`} className="text-center">
                <WordDisplay
                  word={word}
                  currentCharIndex={
                    isCurrentWord ? (currentStep?.charIndex ?? -1) : -1
                  }
                  isCurrentWord={isCurrentWord}
                  phase={currentStep?.phase ?? "start"}
                />
                {processed && (
                  <div
                    className="text-xs mt-1 font-mono"
                    style={{
                      color:
                        processed.original !== processed.replaced
                          ? "#22c55e"
                          : "var(--text-3)",
                    }}
                  >
                    → {processed.replaced}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Trie and step info */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Trie visualization */}
        <TrieVisualization
          dictionary={DICTIONARY}
          currentPath={currentStep?.triePathArray || []}
          phase={currentStep?.phase || "start"}
        />

        {/* Step info */}
        <div
          className="rounded-lg p-4"
          style={{ backgroundColor: "var(--bg-elevated)" }}
        >
          <div
            className="text-xs mb-2 font-medium"
            style={{ color: "var(--text-3)" }}
          >
            STEP {stepIndex + 1} / {steps.length}
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="px-2 py-0.5 rounded text-xs font-medium"
              style={{
                backgroundColor: getPhaseColor(currentStep?.phase || ""),
                color: "white",
              }}
            >
              {getPhaseLabel(currentStep?.phase || "")}
            </span>
            {currentStep?.currentWord && (
              <span
                className="px-2 py-0.5 rounded text-xs font-mono"
                style={{
                  backgroundColor: "var(--bg-surface)",
                  color: "var(--text-2)",
                }}
              >
                &quot;{currentStep.currentWord}&quot;
              </span>
            )}
          </div>
          <div className="text-sm" style={{ color: "var(--text-1)" }}>
            {currentStep?.description}
          </div>

          {/* Current path display */}
          {currentStep?.triePathArray &&
            currentStep.triePathArray.length > 0 && (
              <div
                className="mt-3 pt-3"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <div
                  className="text-xs mb-1"
                  style={{ color: "var(--text-3)" }}
                >
                  Current Path:
                </div>
                <div className="font-mono text-sm flex items-center gap-1">
                  <span style={{ color: "var(--text-2)" }}>root</span>
                  {currentStep.triePathArray.map((char, i) => (
                    <React.Fragment key={i}>
                      <span style={{ color: "var(--text-3)" }}>→</span>
                      <span
                        style={{
                          color:
                            i === currentStep.triePathArray.length - 1
                              ? currentStep.phase === "found"
                                ? "#22c55e"
                                : "var(--accent-1)"
                              : "var(--text-2)",
                        }}
                      >
                        {char}
                      </span>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Result preview */}
      {currentStep?.processedWords.length > 0 && (
        <div
          className="rounded-lg p-3"
          style={{ backgroundColor: "var(--bg-elevated)" }}
        >
          <div
            className="text-xs mb-1 font-medium"
            style={{ color: "var(--text-3)" }}
          >
            RESULT SO FAR
          </div>
          <div className="font-mono" style={{ color: "var(--text-1)" }}>
            &quot;
            {currentStep.processedWords.map((w) => w.replaced).join(" ")}
            &quot;
          </div>
        </div>
      )}

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

      {/* Legend */}
      <div
        className="rounded-lg p-3 text-xs space-y-2"
        style={{
          backgroundColor: "var(--bg-elevated)",
          color: "var(--text-3)",
        }}
      >
        <div>
          <strong>How it works:</strong> For each word, traverse the Trie
          character by character. If we find a stored word (root), return it
          immediately. The first root found is guaranteed to be the shortest.
        </div>
        <div className="flex flex-wrap gap-3">
          <span className="flex items-center gap-1">
            <span
              className="w-3 h-3 rounded"
              style={{ backgroundColor: "var(--accent-1)" }}
            />
            Current
          </span>
          <span className="flex items-center gap-1">
            <span
              className="w-3 h-3 rounded"
              style={{ backgroundColor: "var(--accent-2)" }}
            />
            Path
          </span>
          <span className="flex items-center gap-1">
            <span
              className="w-3 h-3 rounded"
              style={{ backgroundColor: "#22c55e" }}
            />
            Found
          </span>
          <span className="flex items-center gap-1">
            <span
              className="w-3 h-3 rounded"
              style={{ backgroundColor: "#f59e0b" }}
            />
            No Match
          </span>
          <span className="flex items-center gap-1">
            <span style={{ color: "#22c55e" }}>●</span>
            Word End
          </span>
        </div>
      </div>
    </div>
  );
};

export default ReplaceWordsVisualizer;
