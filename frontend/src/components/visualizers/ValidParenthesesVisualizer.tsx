"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ValidParenthesesVisualizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [stack, setStack] = useState<string[]>([]);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [phase, setPhase] = useState<"init" | "processing" | "done">("init");
  const [message, setMessage] = useState("Click Play to validate parentheses");

  const input = "([{}])";
  const pairs: Record<string, string> = { ")": "(", "]": "[", "}": "{" };

  const reset = useCallback(() => {
    setCurrentIdx(-1);
    setStack([]);
    setIsValid(null);
    setPhase("init");
    setMessage("Click Play to validate parentheses");
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (phase === "init") {
        setPhase("processing");
        setCurrentIdx(0);
        setMessage("Starting: Process each character");
      } else if (phase === "processing") {
        if (currentIdx >= input.length) {
          setPhase("done");
          const valid = stack.length === 0;
          setIsValid(valid);
          setMessage(
            valid
              ? "Valid! Stack is empty at the end."
              : `Invalid! Stack still has: ${stack.join(", ")}`
          );
          setIsPlaying(false);
          return;
        }

        const char = input[currentIdx];
        const isOpening = "([{".includes(char);

        if (isOpening) {
          setStack([...stack, char]);
          setMessage(`'${char}' is opening bracket - PUSH onto stack`);
        } else {
          const expected = pairs[char];
          if (stack.length === 0) {
            setPhase("done");
            setIsValid(false);
            setMessage(`'${char}' has no matching opening bracket - Invalid!`);
            setIsPlaying(false);
            return;
          }
          const top = stack[stack.length - 1];
          if (top === expected) {
            setStack(stack.slice(0, -1));
            setMessage(`'${char}' matches '${top}' - POP from stack`);
          } else {
            setPhase("done");
            setIsValid(false);
            setMessage(
              `'${char}' expected '${expected}' but got '${top}' - Invalid!`
            );
            setIsPlaying(false);
            return;
          }
        }

        setCurrentIdx(currentIdx + 1);
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [isPlaying, phase, currentIdx, stack, input, pairs, speed]);

  const getCharColor = (idx: number) => {
    if (idx < currentIdx) return "bg-gray-600 text-gray-400";
    if (idx === currentIdx)
      return "bg-yellow-500 text-black ring-2 ring-yellow-300";
    return "bg-gray-700 text-gray-300";
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">Valid Parentheses</h3>
        <p className="text-gray-400 text-sm mt-1">
          Stack for matching opening and closing brackets
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
              className="w-20 accent-green-500"
            />
          </div>
        </div>

        {/* Input string */}
        <div className="mb-6">
          <div className="text-sm text-gray-400 mb-2">Input String:</div>
          <div className="flex gap-1 justify-center">
            {input.split("").map((char, idx) => (
              <motion.div
                key={`char-${char}-${idx}`}
                animate={{
                  scale: idx === currentIdx ? 1.2 : 1,
                  y: idx === currentIdx ? -8 : 0,
                }}
                className={`w-12 h-12 rounded-lg flex items-center justify-center font-mono text-xl font-bold ${getCharColor(idx)}`}
              >
                {char}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stack visualization */}
        <div className="mb-6">
          <div className="text-sm text-gray-400 mb-2">
            Stack (top on right):
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 min-h-[80px] flex items-end gap-2">
            <AnimatePresence>
              {stack.map((char, idx) => (
                <motion.div
                  key={`${idx}-${char}`}
                  initial={{ opacity: 0, y: 20, scale: 0 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0 }}
                  className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center font-mono text-xl font-bold text-white"
                >
                  {char}
                </motion.div>
              ))}
            </AnimatePresence>
            {stack.length === 0 && (
              <span className="text-gray-500 italic">Empty</span>
            )}
            {stack.length > 0 && (
              <div className="ml-2 text-xs text-gray-500 self-center">
                ← top
              </div>
            )}
          </div>
        </div>

        {/* Pairs reference */}
        <div className="mb-4 p-3 bg-gray-800/30 rounded-lg">
          <div className="text-sm text-gray-400 mb-2">Matching Pairs:</div>
          <div className="flex gap-4">
            <span className="font-mono text-green-400">( ↔ )</span>
            <span className="font-mono text-blue-400">[ ↔ ]</span>
            <span className="font-mono text-purple-400">{"{ ↔ }"}</span>
          </div>
        </div>

        {/* Result indicator */}
        {isValid !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`mb-4 p-4 rounded-lg text-center text-lg font-bold ${
              isValid
                ? "bg-green-500/20 border border-green-500/50 text-green-400"
                : "bg-red-500/20 border border-red-500/50 text-red-400"
            }`}
          >
            {isValid ? "VALID" : "INVALID"}
          </motion.div>
        )}

        {/* Message */}
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-lg text-sm ${
            phase === "done"
              ? isValid
                ? "bg-green-500/10 border border-green-500/30 text-green-400"
                : "bg-red-500/10 border border-red-500/30 text-red-400"
              : "bg-gray-800 text-gray-300"
          }`}
        >
          {message}
        </motion.div>

        {/* Algorithm explanation */}
        <div className="mt-4 p-3 bg-gray-800/30 rounded-lg text-sm text-gray-400">
          <p>
            <strong className="text-green-400">Key Insight:</strong> Opening
            brackets push, closing brackets pop and check match. Stack must be
            empty at end for valid string.
          </p>
        </div>
      </div>
    </div>
  );
}
