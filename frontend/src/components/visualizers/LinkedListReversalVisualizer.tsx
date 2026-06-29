"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

interface Node {
  val: number;
  id: number;
}

export default function LinkedListReversalVisualizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [nodes] = useState<Node[]>([
    { val: 1, id: 0 },
    { val: 2, id: 1 },
    { val: 3, id: 2 },
    { val: 4, id: 3 },
  ]);
  const [prevIdx, setPrevIdx] = useState<number | null>(null);
  const [currIdx, setCurrIdx] = useState<number | null>(0);
  const [nextIdx, setNextIdx] = useState<number | null>(null);
  const [reversedLinks, setReversedLinks] = useState<Set<number>>(new Set());
  const [phase, setPhase] = useState<
    "init" | "save-next" | "reverse-link" | "move-prev" | "move-curr" | "done"
  >("init");
  const [message, setMessage] = useState(
    "Click Play to reverse the linked list"
  );

  const reset = useCallback(() => {
    setPrevIdx(null);
    setCurrIdx(0);
    setNextIdx(null);
    setReversedLinks(new Set());
    setPhase("init");
    setMessage("Click Play to reverse the linked list");
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (phase === "init") {
        setMessage("Initialize: prev = null, curr = head (node 1)");
        setPhase("save-next");
      } else if (phase === "save-next") {
        if (currIdx === null || currIdx >= nodes.length) {
          setPhase("done");
          setMessage(
            `Done! New head is node ${nodes[nodes.length - 1].val}. Reversed: ${nodes
              .map((n) => n.val)
              .reverse()
              .join(" -> ")}`
          );
          setIsPlaying(false);
          return;
        }
        // Step 1: Save next
        const next = currIdx + 1 < nodes.length ? currIdx + 1 : null;
        setNextIdx(next);
        setMessage(
          `Step 1: Save next = ${next !== null ? `node ${nodes[next].val}` : "null"}`
        );
        setPhase("reverse-link");
      } else if (phase === "reverse-link") {
        // Step 2: Reverse link
        if (currIdx !== null) {
          setReversedLinks(new Set([...reversedLinks, currIdx]));
        }
        setMessage(
          `Step 2: Reverse link - curr.next = prev (${prevIdx !== null ? `node ${nodes[prevIdx].val}` : "null"})`
        );
        setPhase("move-prev");
      } else if (phase === "move-prev") {
        // Step 3: Move prev
        setPrevIdx(currIdx);
        setMessage(
          `Step 3: Move prev to curr (node ${currIdx !== null ? nodes[currIdx].val : "null"})`
        );
        setPhase("move-curr");
      } else if (phase === "move-curr") {
        // Step 4: Move curr
        setCurrIdx(nextIdx);
        setMessage(
          `Step 4: Move curr to next (${nextIdx !== null ? `node ${nodes[nextIdx].val}` : "null"})`
        );
        setNextIdx(null);
        setPhase("save-next");
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [
    isPlaying,
    phase,
    currIdx,
    prevIdx,
    nextIdx,
    nodes,
    reversedLinks,
    speed,
  ]);

  const getPointerLabel = (idx: number) => {
    const labels = [];
    if (idx === prevIdx) labels.push("prev");
    if (idx === currIdx) labels.push("curr");
    if (idx === nextIdx) labels.push("next");
    return labels.join(", ");
  };

  return (
    <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">
          Reverse Linked List
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Three-pointer technique: prev, curr, next
        </p>
      </div>

      <div className="p-4">
        {/* Controls */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={phase === "done"}
            className={`px-4 py-2 rounded-md font-medium transition ${
              isPlaying ? "bg-yellow-500 text-black" : "bg-green-500 text-white"
            } disabled:opacity-50`}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            onClick={reset}
            className="px-4 py-2 bg-gray-700 text-white rounded-md font-medium hover:bg-gray-600"
          >
            Reset
          </button>
          <div className="flex items-center gap-2 ml-4">
            <span className="text-gray-400 text-sm">Speed:</span>
            <input
              type="range"
              min="500"
              max="2000"
              step="100"
              value={2500 - speed}
              onChange={(e) => setSpeed(2500 - Number(e.target.value))}
              className="w-20 accent-blue-500"
            />
          </div>
        </div>

        {/* Linked List Visualization */}
        <div className="mb-6">
          <div className="text-sm text-gray-400 mb-3">Linked List:</div>
          <div className="flex items-center gap-2 overflow-x-auto pb-4">
            {/* Null before first node (for reversed links) */}
            <div className="flex flex-col items-center">
              <div
                className={`w-16 h-12 rounded-md flex items-center justify-center font-mono text-sm ${
                  prevIdx === null && phase !== "init"
                    ? "bg-purple-500/30 border-2 border-purple-500"
                    : "bg-gray-700/50"
                } text-gray-400`}
              >
                null
              </div>
              {prevIdx === null && phase !== "init" && (
                <span className="text-xs text-purple-400 mt-1">prev</span>
              )}
            </div>

            {/* Reversed arrow to null */}
            {reversedLinks.has(0) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-green-400 text-xl"
              >
                ←
              </motion.div>
            )}

            {nodes.map((node, idx) => (
              <React.Fragment key={node.id}>
                {/* Node */}
                <motion.div
                  animate={{
                    scale: idx === currIdx ? 1.1 : 1,
                    y: idx === currIdx ? -5 : 0,
                  }}
                  className="flex flex-col items-center"
                >
                  <div
                    className={`w-16 h-12 rounded-md flex items-center justify-center font-mono text-lg font-bold transition-colors ${
                      idx === currIdx
                        ? "bg-yellow-500 text-black ring-2 ring-yellow-300"
                        : idx === prevIdx
                          ? "bg-purple-500 text-white"
                          : idx === nextIdx
                            ? "bg-cyan-500 text-white"
                            : reversedLinks.has(idx)
                              ? "bg-green-500/50 text-white"
                              : "bg-gray-700 text-gray-300"
                    }`}
                  >
                    {node.val}
                  </div>
                  {getPointerLabel(idx) && (
                    <span
                      className={`text-xs mt-1 ${
                        idx === currIdx
                          ? "text-yellow-400"
                          : idx === prevIdx
                            ? "text-purple-400"
                            : idx === nextIdx
                              ? "text-cyan-400"
                              : ""
                      }`}
                    >
                      {getPointerLabel(idx)}
                    </span>
                  )}
                </motion.div>

                {/* Arrow */}
                {idx < nodes.length - 1 && (
                  <div className="flex flex-col items-center justify-center h-12">
                    {!reversedLinks.has(idx + 1) && (
                      <span className="text-gray-500 text-xl">→</span>
                    )}
                    {reversedLinks.has(idx + 1) && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-green-400 text-xl"
                      >
                        ←
                      </motion.span>
                    )}
                  </div>
                )}
              </React.Fragment>
            ))}

            {/* Null after last node (original) */}
            {!reversedLinks.has(nodes.length - 1) && (
              <>
                <span className="text-gray-500 text-xl">→</span>
                <div className="w-16 h-12 rounded-md flex items-center justify-center font-mono text-sm bg-gray-700/50 text-gray-400">
                  null
                </div>
              </>
            )}
          </div>
        </div>

        {/* Pointer Status */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-md p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">prev</div>
            <div className="text-lg font-bold text-purple-400">
              {prevIdx !== null ? nodes[prevIdx].val : "null"}
            </div>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-md p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">curr</div>
            <div className="text-lg font-bold text-yellow-400">
              {currIdx !== null ? nodes[currIdx].val : "null"}
            </div>
          </div>
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-md p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">next</div>
            <div className="text-lg font-bold text-cyan-400">
              {nextIdx !== null ? nodes[nextIdx].val : "null"}
            </div>
          </div>
        </div>

        {/* Steps Legend */}
        <div className="mb-4 p-3 bg-gray-800/50 rounded-md">
          <div className="text-xs text-gray-500 mb-2">
            The Four Steps (repeated):
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div
              className={
                phase === "save-next" ? "text-cyan-400" : "text-gray-500"
              }
            >
              1. next = curr.next
            </div>
            <div
              className={
                phase === "reverse-link" ? "text-green-400" : "text-gray-500"
              }
            >
              2. curr.next = prev
            </div>
            <div
              className={
                phase === "move-prev" ? "text-purple-400" : "text-gray-500"
              }
            >
              3. prev = curr
            </div>
            <div
              className={
                phase === "move-curr" ? "text-yellow-400" : "text-gray-500"
              }
            >
              4. curr = next
            </div>
          </div>
        </div>

        {/* Message */}
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-md text-sm ${
            phase === "done"
              ? "bg-green-500/10 border border-green-500/30 text-green-400"
              : "bg-gray-800 text-gray-300"
          }`}
        >
          {message}
        </motion.div>

        {/* Algorithm explanation */}
        <div className="mt-4 p-3 bg-gray-800/30 rounded-md text-sm text-gray-400">
          <p>
            <strong className="text-blue-400">Key Insight:</strong> Use three
            pointers: prev (already reversed), curr (processing), next (saved
            reference). Repeat: save next, reverse link, move prev, move curr.
          </p>
        </div>
      </div>
    </div>
  );
}
