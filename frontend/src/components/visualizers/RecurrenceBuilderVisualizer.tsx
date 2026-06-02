"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Problem = "climbing-stairs" | "house-robber" | "coin-change" | "lcs";

interface ProblemConfig {
  title: string;
  question: string;
  steps: {
    question: string;
    answer: string;
    explanation: string;
  }[];
  recurrence: string;
  baseCase: string;
}

const problems: Record<Problem, ProblemConfig> = {
  "climbing-stairs": {
    title: "Climbing Stairs",
    question: "You can climb 1 or 2 steps. How many ways to reach step n?",
    steps: [
      {
        question: "What decision am I making?",
        answer: "Which step size to take (1 or 2)",
        explanation:
          "At each step, I must decide: take 1 step or take 2 steps?",
      },
      {
        question: "What are my choices?",
        answer: "Take 1 step OR Take 2 steps",
        explanation:
          "These are the only two options available at any position.",
      },
      {
        question: "What happens after each choice?",
        answer: "Smaller subproblem remains",
        explanation:
          "• Take 1 step → solve for (n-1) remaining\n• Take 2 steps → solve for (n-2) remaining",
      },
      {
        question: "How do I combine results?",
        answer: "ADD them (counting ways)",
        explanation: "Total ways = ways via 1-step + ways via 2-steps",
      },
    ],
    recurrence: "ways(n) = ways(n-1) + ways(n-2)",
    baseCase: "ways(0) = 1, ways(1) = 1",
  },
  "house-robber": {
    title: "House Robber",
    question: "Rob houses for max money, but cannot rob adjacent houses.",
    steps: [
      {
        question: "What decision am I making?",
        answer: "Rob this house or skip it",
        explanation: "At each house, I decide: should I rob it or not?",
      },
      {
        question: "What are my choices?",
        answer: "ROB or SKIP",
        explanation:
          "• ROB: Take money, must skip next house\n• SKIP: Move to next house",
      },
      {
        question: "What happens after each choice?",
        answer: "Different subproblems",
        explanation:
          "• ROB: Get nums[i] + solve from (i+2)\n• SKIP: Solve from (i+1)",
      },
      {
        question: "How do I combine results?",
        answer: "MAX (maximizing money)",
        explanation: "Best = max(rob this house, skip this house)",
      },
    ],
    recurrence: "rob(i) = max(nums[i] + rob(i+2), rob(i+1))",
    baseCase: "rob(n) = 0, rob(n-1) = nums[n-1]",
  },
  "coin-change": {
    title: "Coin Change",
    question: "Minimum coins to make amount. Coins can be reused.",
    steps: [
      {
        question: "What decision am I making?",
        answer: "Which coin to use",
        explanation: "At each state, I pick one coin to use.",
      },
      {
        question: "What are my choices?",
        answer: "Any coin from the list",
        explanation: "For coins [1,2,5], I can pick 1, 2, or 5.",
      },
      {
        question: "What happens after each choice?",
        answer: "Amount decreases by coin value",
        explanation:
          "• Use coin c → solve for (amount - c)\n• Each coin can be used multiple times",
      },
      {
        question: "How do I combine results?",
        answer: "MIN + 1 (minimizing count)",
        explanation: "Min coins = 1 (coin used) + min of remaining subproblems",
      },
    ],
    recurrence: "minCoins(amt) = 1 + min(minCoins(amt-c)) for each coin c",
    baseCase: "minCoins(0) = 0, minCoins(<0) = ∞",
  },
  lcs: {
    title: "Longest Common Subsequence",
    question: "Find the longest subsequence present in both strings.",
    steps: [
      {
        question: "What decision am I making?",
        answer: "Do characters match?",
        explanation: "Compare s1[i] with s2[j] at each position.",
      },
      {
        question: "What are my choices?",
        answer: "Match OR Skip from one string",
        explanation:
          "• If match: take both characters\n• If no match: skip from s1 OR skip from s2",
      },
      {
        question: "What happens after each choice?",
        answer: "Move indices accordingly",
        explanation:
          "• Match: both indices move (i-1, j-1)\n• Skip: one index moves",
      },
      {
        question: "How do I combine results?",
        answer: "Match: +1, No match: MAX",
        explanation:
          "• Match: 1 + LCS(i-1, j-1)\n• No match: max(LCS(i-1, j), LCS(i, j-1))",
      },
    ],
    recurrence:
      "lcs(i,j) = match ? 1+lcs(i-1,j-1) : max(lcs(i-1,j), lcs(i,j-1))",
    baseCase: "lcs(0,j) = 0, lcs(i,0) = 0",
  },
};

export default function RecurrenceBuilderVisualizer() {
  const [selectedProblem, setSelectedProblem] =
    useState<Problem>("climbing-stairs");
  const [currentStep, setCurrentStep] = useState(0);
  const [revealedSteps, setRevealedSteps] = useState<Set<number>>(new Set());
  const [showRecurrence, setShowRecurrence] = useState(false);

  const problem = problems[selectedProblem];

  const revealStep = () => {
    if (currentStep < problem.steps.length) {
      setRevealedSteps((prev) => new Set([...prev, currentStep]));
      setCurrentStep((s) => s + 1);
    } else if (!showRecurrence) {
      setShowRecurrence(true);
    }
  };

  const reset = () => {
    setCurrentStep(0);
    setRevealedSteps(new Set());
    setShowRecurrence(false);
  };

  const changeProblem = (p: Problem) => {
    setSelectedProblem(p);
    reset();
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">
          Recurrence Relation Builder
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Learn to derive recurrence relations step-by-step
        </p>
      </div>

      <div className="p-4">
        {/* Problem Selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(Object.keys(problems) as Problem[]).map((p) => (
            <button
              key={`p-${p}`}
              onClick={() => changeProblem(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                selectedProblem === p
                  ? "bg-indigo-500 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {problems[p].title}
            </button>
          ))}
        </div>

        {/* Problem Statement */}
        <div className="mb-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
          <h4 className="text-white font-semibold mb-2">{problem.title}</h4>
          <p className="text-gray-300">{problem.question}</p>
        </div>

        {/* The 4 Questions */}
        <div className="mb-6">
          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
            <span className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-xs">
              ?
            </span>
            The 4-Question Method
          </h4>

          <div className="space-y-3">
            {problem.steps.map((step, idx) => (
              <motion.div
                key={`idx-${idx}`}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: revealedSteps.has(idx) ? 1 : 0.5 }}
                className={`rounded-xl border-2 overflow-hidden transition-colors ${
                  revealedSteps.has(idx)
                    ? "bg-indigo-500/10 border-indigo-500/50"
                    : "bg-gray-800/30 border-gray-700"
                }`}
              >
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        revealedSteps.has(idx)
                          ? "bg-indigo-500 text-white"
                          : "bg-gray-700 text-gray-400"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span
                      className={`font-medium ${
                        revealedSteps.has(idx)
                          ? "text-indigo-300"
                          : "text-gray-400"
                      }`}
                    >
                      {step.question}
                    </span>
                  </div>

                  <AnimatePresence>
                    {revealedSteps.has(idx) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="ml-11 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-green-400">→</span>
                            <span className="text-white font-semibold">
                              {step.answer}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm whitespace-pre-line">
                            {step.explanation}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Reveal Button */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={revealStep}
            disabled={showRecurrence}
            className={`flex-1 py-3 rounded-xl font-medium transition ${
              showRecurrence
                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                : "bg-indigo-500 text-white hover:bg-indigo-400"
            }`}
          >
            {currentStep < problem.steps.length
              ? `Reveal Step ${currentStep + 1}`
              : showRecurrence
                ? "Complete!"
                : "Show Recurrence"}
          </button>
          <button
            onClick={reset}
            className="px-6 py-3 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600"
          >
            Reset
          </button>
        </div>

        {/* Final Recurrence */}
        <AnimatePresence>
          {showRecurrence && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="p-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl border-2 border-green-500/50"
            >
              <div className="text-center mb-4">
                <span className="text-green-400 text-sm font-medium uppercase tracking-wide">
                  The Recurrence Relation
                </span>
              </div>

              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="text-center mb-4"
              >
                <code className="text-2xl font-mono font-bold text-white bg-gray-800/50 px-6 py-3 rounded-xl inline-block">
                  {problem.recurrence}
                </code>
              </motion.div>

              <div className="text-center">
                <span className="text-gray-400 text-sm">Base Case: </span>
                <code className="text-yellow-400 font-mono">
                  {problem.baseCase}
                </code>
              </div>

              <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
                <p className="text-gray-300 text-sm text-center">
                  Now you can implement this as recursion → memoization →
                  tabulation → space optimized!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Reference */}
        <div className="mt-6 p-4 bg-gray-800/30 rounded-xl">
          <h5 className="text-gray-400 text-sm font-medium mb-2">
            Combination Patterns:
          </h5>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-indigo-400">+</span>
              <span className="text-gray-300">Count ways</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">max()</span>
              <span className="text-gray-300">Maximize value</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-400">min()</span>
              <span className="text-gray-300">Minimize cost</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-purple-400">||</span>
              <span className="text-gray-300">Check possibility</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
