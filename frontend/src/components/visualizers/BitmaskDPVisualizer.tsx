"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

type Phase = "concept" | "subsets" | "assignment" | "tsp";

// Subset Sum Problem: Find if subset sums to target
const subsetNums = [3, 1, 4, 2];
const subsetTarget = 5;

// Assignment Problem: Assign n people to n jobs with minimum cost
const assignmentCost = [
  [9, 2, 7],
  [6, 4, 3],
  [5, 8, 1],
];
const people = ["A", "B", "C"];
const jobs = ["J1", "J2", "J3"];

// TSP with 4 cities
const cities = ["A", "B", "C", "D"];
const n = cities.length;
const dist: number[][] = [
  [0, 10, 15, 20],
  [10, 0, 35, 25],
  [15, 35, 0, 30],
  [20, 25, 30, 0],
];
const INF = 999999;

// Concept phase steps
const conceptSteps: {
  title: string;
  description: string;
  mask: number;
  highlight: number[];
  code: string | null;
  bits: number;
}[] = [
  {
    title: "What is a Bitmask?",
    description: "A bitmask uses an integer to represent a SET. Each bit position indicates whether an element is included (1) or not (0).",
    mask: 0,
    highlight: [],
    code: null,
    bits: 4,
  },
  {
    title: "Empty Set",
    description: "mask = 0 means no elements selected. All bits are 0.",
    mask: 0,
    highlight: [],
    code: "mask = 0000 (decimal 0)",
    bits: 4,
  },
  {
    title: "Add Element 0",
    description: "To add element i to the set, use OR: mask | (1 << i). Adding element 0 sets bit 0.",
    mask: 1,
    highlight: [0],
    code: "mask | (1 << 0) = 0000 | 0001 = 0001",
    bits: 4,
  },
  {
    title: "Add Element 2",
    description: "Add element 2 to the set. Now elements {0, 2} are selected.",
    mask: 5,
    highlight: [0, 2],
    code: "mask | (1 << 2) = 0001 | 0100 = 0101",
    bits: 4,
  },
  {
    title: "Check if Element in Set",
    description: "To check if element i is in set: (mask >> i) & 1. Or: mask & (1 << i) != 0",
    mask: 5,
    highlight: [1],
    code: "(0101 >> 1) & 1 = 0 (element 1 NOT in set)",
    bits: 4,
  },
  {
    title: "Remove Element",
    description: "To remove element i: mask & ~(1 << i). This clears bit i.",
    mask: 4,
    highlight: [2],
    code: "0101 & ~(0001) = 0101 & 1110 = 0100",
    bits: 4,
  },
  {
    title: "Count Set Bits",
    description: "popcount(mask) counts elements in set. mask = 0101 has 2 bits set.",
    mask: 5,
    highlight: [0, 2],
    code: "popcount(0101) = 2",
    bits: 4,
  },
  {
    title: "Iterate All Subsets",
    description: "Loop mask from 0 to (1 << n) - 1 to enumerate all 2^n subsets.",
    mask: 15,
    highlight: [0, 1, 2, 3],
    code: "for mask in 0..(1 << 4): // 0 to 15",
    bits: 4,
  },
  {
    title: "Why Bitmask DP?",
    description: "When state depends on WHICH elements are used (not just count), use bitmask. State: dp[mask] = best answer using elements in mask.",
    mask: 7,
    highlight: [0, 1, 2],
    code: "dp[mask] = f(dp[smaller_masks])",
    bits: 4,
  },
];

// Generate Subset Sum steps
const generateSubsetSteps = () => { // skipcq: JS-R1005
  const steps: { mask: number; sum: number; possible: boolean; formula: string }[] = [];
  const allMask = 1 << subsetNums.length;

  for (let mask = 0; mask < allMask; mask++) {
    let sum = 0;
    const elements: number[] = [];
    for (let i = 0; i < subsetNums.length; i++) {
      if (mask & (1 << i)) {
        sum += subsetNums[i];
        elements.push(subsetNums[i]);
      }
    }
    const maskBin = mask.toString(2).padStart(subsetNums.length, "0");
    const elemStr = elements.length === 0 ? "{}" : `{${elements.join(", ")}}`;
    steps.push({
      mask,
      sum,
      possible: sum === subsetTarget,
      formula: `mask=${maskBin}: ${elemStr} sums to ${sum}${sum === subsetTarget ? " = TARGET!" : ""}`,
    });
  }

  return steps;
};

// Generate Assignment Problem steps (simplified Bitmask DP)
const generateAssignmentSteps = () => { // skipcq: JS-R1005
  const steps: { person: number; jobMask: number; job: number; cost: number; total: number; formula: string }[] = [];
  const nPeople = assignmentCost.length;
  const dp: number[] = Array(1 << nPeople).fill(INF);
  const parent: { mask: number; job: number }[] = Array(1 << nPeople).fill({ mask: -1, job: -1 });

  dp[0] = 0;
  steps.push({
    person: -1,
    jobMask: 0,
    job: -1,
    cost: 0,
    total: 0,
    formula: "dp[000] = 0 (no jobs assigned yet)",
  });

  for (let person = 0; person < nPeople; person++) {
    for (let mask = 0; mask < (1 << nPeople); mask++) {
      const popcount = mask.toString(2).split("1").length - 1;
      if (popcount !== person) continue;
      if (dp[mask] === INF) continue;

      for (let job = 0; job < nPeople; job++) {
        if (mask & (1 << job)) continue;

        const newMask = mask | (1 << job);
        const newCost = dp[mask] + assignmentCost[person][job];

        if (newCost < dp[newMask]) {
          dp[newMask] = newCost;
          parent[newMask] = { mask, job };

          const maskBin = mask.toString(2).padStart(nPeople, "0");
          const newMaskBin = newMask.toString(2).padStart(nPeople, "0");
          steps.push({
            person,
            jobMask: newMask,
            job,
            cost: assignmentCost[person][job],
            total: newCost,
            formula: `Person ${people[person]} takes ${jobs[job]}: dp[${newMaskBin}] = dp[${maskBin}] + ${assignmentCost[person][job]} = ${newCost}`,
          });
        }
      }
    }
  }

  const allJobs = (1 << nPeople) - 1;
  return { steps, answer: dp[allJobs], dp };
};

// Generate TSP steps
const generateTSPSteps = () => {
  const steps: { mask: number; pos: number; value: number; formula: string }[] = [];
  const allMask = (1 << n) - 1;
  const dp: number[][] = Array(1 << n)
    .fill(null)
    .map(() => Array(n).fill(INF));

  dp[1][0] = 0;
  steps.push({
    mask: 1,
    pos: 0,
    value: 0,
    formula: "Start at A: dp[0001][A] = 0",
  });

  for (let mask = 1; mask < 1 << n; mask++) {
    for (let pos = 0; pos < n; pos++) {
      if (!(mask & (1 << pos))) continue;
      if (dp[mask][pos] === INF) continue;

      for (let next = 0; next < n; next++) {
        if (mask & (1 << next)) continue;

        const newMask = mask | (1 << next);
        const newDist = dp[mask][pos] + dist[pos][next];

        if (newDist < dp[newMask][next]) {
          dp[newMask][next] = newDist;
          const maskBin = mask.toString(2).padStart(n, "0");
          steps.push({
            mask: newMask,
            pos: next,
            value: newDist,
            formula: `From ${cities[pos]} (${maskBin}) to ${cities[next]}: ${dp[mask][pos]} + ${dist[pos][next]} = ${newDist}`,
          });
        }
      }
    }
  }

  let minCost = INF;
  for (let pos = 1; pos < n; pos++) {
    const cost = dp[allMask][pos] + dist[pos][0];
    if (cost < minCost) minCost = cost;
  }

  return { steps, dp, answer: minCost };
};

const Controls = ({
  isPlaying,
  onPlay,
  onPause,
  onStep,
  onBack,
  onReset,
  speed,
  onSpeedChange,
  step,
  total,
}: {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStep: () => void;
  onBack: () => void;
  onReset: () => void;
  speed: number;
  onSpeedChange: (s: number) => void;
  step: number;
  total: number;
}) => (
  <div className="flex flex-col gap-4">
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={onBack}
        disabled={step === 0}
        className="w-10 h-10 flex items-center justify-center bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 disabled:opacity-30 transition-all"
        title="Back"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      {isPlaying ? (
        <button
          onClick={onPause}
          className="w-12 h-12 flex items-center justify-center bg-yellow-600 rounded-full hover:bg-yellow-500 transition-all shadow-lg"
          title="Pause"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        </button>
      ) : (
        <button
          onClick={onPlay}
          disabled={step >= total}
          className="w-12 h-12 flex items-center justify-center bg-green-600 rounded-full hover:bg-green-500 disabled:opacity-30 transition-all shadow-lg"
          title="Play"
        >
          <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      )}
      <button
        onClick={onStep}
        disabled={step >= total}
        className="w-10 h-10 flex items-center justify-center bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 disabled:opacity-30 transition-all"
        title="Step"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <button
        onClick={onReset}
        className="w-10 h-10 flex items-center justify-center bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-all ml-2"
        title="Reset"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
    <div className="flex items-center justify-center gap-4">
      <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-3 py-1.5">
        <span className="text-xs text-gray-500 uppercase">Speed</span>
        <div className="flex gap-1">
          {[
            { value: 1000, label: "0.5x" },
            { value: 600, label: "1x" },
            { value: 300, label: "2x" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSpeedChange(opt.value)}
              className={`px-2.5 py-1 rounded text-xs font-medium ${speed === opt.value ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-3 py-1.5">
        <span className="text-xs text-gray-500 uppercase">Step</span>
        <span className="text-sm font-mono text-white">
          {step} <span className="text-gray-500">/</span> {total}
        </span>
      </div>
    </div>
  </div>
);

const BitDisplay = ({
  mask,
  bits,
  labels,
  highlight,
}: {
  mask: number;
  bits: number;
  labels: string[];
  highlight?: number[];
}) => (
  <div className="flex justify-center gap-2">
    {Array.from({ length: bits }, (_, i) => { // skipcq: JS-R1005
      const isSet = (mask & (1 << i)) !== 0;
      const isHighlighted = highlight?.includes(i);
      return (
        <motion.div
          key={`bit-${i}`}
          className="flex flex-col items-center"
          animate={{ scale: isHighlighted ? 1.1 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className={`w-12 h-12 flex items-center justify-center rounded-lg font-mono font-bold text-lg border-2 transition-all ${
              isSet
                ? "bg-green-600 border-green-400 text-white"
                : isHighlighted
                  ? "bg-gray-700 border-yellow-400 text-yellow-400"
                  : "bg-gray-800 border-gray-600 text-gray-400"
            }`}
          >
            {labels[i] || i}
          </motion.div>
          <div className={`text-sm mt-1 font-mono ${isSet ? "text-green-400" : "text-gray-500"}`}>
            {(mask >> i) & 1}
          </div>
          <div className="text-xs text-gray-600">bit {i}</div>
        </motion.div>
      );
    })}
    <div className="ml-4 flex flex-col justify-center text-gray-500 text-sm font-mono">
      <div>mask = {mask.toString(2).padStart(bits, "0")}</div>
      <div className="text-gray-600">({mask})</div>
    </div>
  </div>
);

const ConceptPhase = ({ step }: { step: number }) => {
  const currentStep = conceptSteps[Math.min(step, conceptSteps.length - 1)];
  const displayMask = step === 0 ? 0 : currentStep.mask;
  const labels = ["A", "B", "C", "D"];

  return (
    <div className="flex flex-col items-center gap-6">
      <BitDisplay
        mask={displayMask}
        bits={currentStep.bits}
        labels={labels}
        highlight={currentStep.highlight}
      />

      <motion.div
        className="bg-gray-800/50 rounded-xl p-6 max-w-lg text-center"
        key={`concept-step-${step}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-white font-medium text-lg mb-2">{currentStep.title}</div>
        <div className="text-gray-400 text-sm mb-4">{currentStep.description}</div>
        {currentStep.code && (
          <div className="font-mono text-xs bg-gray-900 text-green-400 p-3 rounded-lg">
            {currentStep.code}
          </div>
        )}
      </motion.div>

      {step >= conceptSteps.length && step > 0 && (
        <div className="text-sm text-center bg-green-600/20 px-4 py-2 rounded-lg">
          <span className="text-green-400 font-bold">Bitmask basics complete!</span>
          <span className="text-gray-400 ml-2">Now try Subset Sum phase</span>
        </div>
      )}

      <div className="text-xs text-gray-500 text-center max-w-md">
        Bitmask operations: OR (|) to add, AND (&amp;) to check/intersect, XOR (^) to toggle, NOT (~) to complement
      </div>
    </div>
  );
};

const SubsetPhase = ({ // skipcq: JS-R1005
  step,
  subsetSteps,
}: {
  step: number;
  subsetSteps: ReturnType<typeof generateSubsetSteps>;
}) => {
  const currentStep = step > 0 && step <= subsetSteps.length ? subsetSteps[step - 1] : null;
  const foundTarget = subsetSteps.slice(0, step).find(s => s.possible);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <div className="text-sm text-gray-400 mb-2">
          Find subset of [{subsetNums.join(", ")}] that sums to {subsetTarget}
        </div>
      </div>

      <BitDisplay
        mask={currentStep?.mask || 0}
        bits={subsetNums.length}
        labels={subsetNums.map(String)}
        highlight={currentStep ? Array.from({ length: subsetNums.length }, (_, i) =>
          (currentStep.mask & (1 << i)) ? i : -1
        ).filter(i => i >= 0) : []}
      />

      <div className="grid grid-cols-4 gap-2 text-xs">
        {subsetSteps.slice(0, Math.min(step, subsetSteps.length)).map((s, idx) => (
          <div
            key={`subset-${s.mask}`}
            className={`px-2 py-1 rounded font-mono ${
              s.possible
                ? "bg-green-600/30 border border-green-500 text-green-400"
                : idx === step - 1
                  ? "bg-blue-600/30 border border-blue-500 text-blue-300"
                  : "bg-gray-800/50 text-gray-500"
            }`}
          >
            {s.mask.toString(2).padStart(4, "0")}: {s.sum}
          </div>
        ))}
      </div>

      {currentStep && (
        <div className={`text-sm text-center font-mono px-4 py-2 rounded-lg max-w-lg ${
          currentStep.possible ? "bg-green-600/20 text-green-400" : "bg-gray-800/50 text-gray-400"
        }`}>
          {currentStep.formula}
        </div>
      )}

      {step >= subsetSteps.length && step > 0 && (
        <div className="text-sm text-center bg-green-600/20 px-4 py-2 rounded-lg">
          <span className="text-green-400 font-bold">
            Answer: Subset {foundTarget ? `{${subsetNums.filter((_, i) => (foundTarget.mask & (1 << i))).join(", ")}}` : "none"} sums to {subsetTarget}
          </span>
          <span className="text-gray-400 ml-2">(checked all 2^{subsetNums.length} = {1 << subsetNums.length} subsets)</span>
        </div>
      )}

      <div className="text-xs text-gray-500 text-center">
        Enumerate all 2^n subsets using mask from 0 to 2^n - 1
      </div>
    </div>
  );
};

const AssignmentPhase = ({ // skipcq: JS-R1005
  step,
  assignmentSteps,
  answer,
}: {
  step: number;
  assignmentSteps: ReturnType<typeof generateAssignmentSteps>["steps"];
  answer: number;
}) => {
  const currentStep = step > 0 && step <= assignmentSteps.length ? assignmentSteps[step - 1] : null;
  const nJobs = assignmentCost.length;

  const currentDp = useMemo(() => {
    const dp: (number | null)[] = Array(1 << nJobs).fill(null);
    dp[0] = 0;
    for (let s = 1; s < Math.min(step, assignmentSteps.length); s++) {
      const st = assignmentSteps[s];
      dp[st.jobMask] = st.total;
    }
    if (currentStep) {
      dp[currentStep.jobMask] = currentStep.total;
    }
    return dp;
  }, [step, assignmentSteps, currentStep, nJobs]);

  return ( // skipcq: JS-0415 
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <div className="text-sm text-gray-400 mb-2">
          Assign {nJobs} people to {nJobs} jobs with minimum total cost
        </div>
      </div>

      <div className="flex gap-8 items-start flex-wrap justify-center">
        <div>
          <div className="text-xs text-gray-500 text-center mb-2">Cost Matrix</div>
          <table className="border-collapse text-sm">
            <thead>
              <tr>
                <th className="p-1.5 text-gray-500"></th>
                {jobs.map(j => (
                  <th key={`job-h-${j}`} className="p-1.5 text-gray-400 w-10">{j}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {people.map((p, pi) => (
                <tr key={`person-${p}`}>
                  <td className="p-1.5 text-gray-400 font-mono">{p}</td>
                  {assignmentCost[pi].map((cost, ji) => {
                    const isCurrentChoice = currentStep?.person === pi && currentStep?.job === ji;
                    return ( // skipcq: JS-0437 
                      <td key={`cost-${p}-${ji}`} className="p-1">
                        <div className={`w-10 h-8 flex items-center justify-center rounded text-xs ${
                          isCurrentChoice
                            ? "bg-blue-600 border-2 border-blue-400 text-white font-bold"
                            : "bg-gray-800 text-gray-300"
                        }`}>
                          {cost}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <div className="text-xs text-gray-500 text-center mb-2">dp[mask] = min cost for jobs in mask</div>
          <div className="grid grid-cols-4 gap-1 text-xs">
            {Array.from({ length: 1 << nJobs }, (_, mask) => {
              const maskBin = mask.toString(2).padStart(nJobs, "0");
              const val = currentDp[mask];
              const isCurrent = currentStep?.jobMask === mask;
              return (
                <div
                  key={`dp-${mask}`}
                  className={`px-2 py-1 rounded font-mono ${
                    isCurrent
                      ? "bg-blue-600/30 border border-blue-500 text-blue-300"
                      : val !== null
                        ? "bg-green-600/20 text-green-400"
                        : "bg-gray-800/50 text-gray-600"
                  }`}
                >
                  {maskBin}: {val !== null ? val : "-"}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {currentStep && (
        <div className="text-sm text-center font-mono bg-gray-800/50 text-gray-300 px-4 py-2 rounded-lg max-w-lg">
          {currentStep.formula}
        </div>
      )}

      {step >= assignmentSteps.length && step > 0 && (
        <div className="text-sm text-center bg-green-600/20 px-4 py-2 rounded-lg">
          <span className="text-green-400 font-bold">
            Minimum assignment cost = {answer}
          </span>
        </div>
      )}

      <div className="text-xs text-gray-500 text-center max-w-md">
        dp[mask] = min cost when jobs in mask are assigned. Process person by person (popcount order).
      </div>
    </div>
  );
};

const TSPPhase = ({ // skipcq: JS-R1005
  step,
  tspSteps,
  answer,
}: {
  step: number;
  tspSteps: ReturnType<typeof generateTSPSteps>["steps"];
  answer: number;
}) => {
  const currentStep = step > 0 && step <= tspSteps.length ? tspSteps[step - 1] : null;
  const currentMask = currentStep?.mask || 1;

  const dpTable = useMemo(() => {
    const dp: (number | null)[][] = Array(1 << n)
      .fill(null)
      .map(() => Array(n).fill(null));
    for (let s = 0; s < Math.min(step, tspSteps.length); s++) {
      const { mask, pos, value } = tspSteps[s];
      dp[mask][pos] = value;
    }
    return dp;
  }, [step, tspSteps]);

  const relevantMasks = useMemo(() => {
    const masks = new Set<number>();
    for (let s = 0; s < Math.min(step, tspSteps.length); s++) {
      masks.add(tspSteps[s].mask);
    }
    return Array.from(masks).sort((a, b) => a - b).slice(-6);
  }, [step, tspSteps]);

  return ( // skipcq: JS-0415 
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <div className="text-sm text-gray-400 mb-2">
          Visit all cities exactly once and return to start with minimum cost
        </div>
      </div>

      <BitDisplay
        mask={currentMask}
        bits={n}
        labels={cities}
        highlight={Array.from({ length: n }, (_, i) =>
          (currentMask & (1 << i)) ? i : -1
        ).filter(i => i >= 0)}
      />

      <div className="flex gap-8 items-start flex-wrap justify-center">
        <div>
          <div className="text-xs text-gray-500 text-center mb-2">Distance Matrix</div>
          <table className="border-collapse text-sm">
            <thead>
              <tr>
                <th className="p-1.5 text-gray-500"></th>
                {cities.map(c => (
                  <th key={`city-h-${c}`} className="p-1.5 text-gray-400 w-10">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cities.map((c, i) => (
                <tr key={`city-r-${c}`}>
                  <td className="p-1.5 text-gray-400 font-mono">{c}</td>
                  {dist[i].map((d, j) => ( // skipcq: JS-0437 
                    <td key={`dist-${c}-${j}`} className="p-1">
                      <div className={`w-10 h-8 flex items-center justify-center rounded text-xs ${
                        i === j ? "bg-gray-900/50 text-gray-600" : "bg-gray-800 text-gray-300"
                      }`}>
                        {d}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <div className="text-xs text-gray-500 text-center mb-2">dp[mask][city] = min dist</div>
          <table className="border-collapse text-xs">
            <thead>
              <tr>
                <th className="p-1.5 text-gray-500 w-14">mask</th>
                {cities.map(c => (
                  <th key={`tsp-h-${c}`} className="p-1.5 text-gray-400 w-10">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {relevantMasks.map(mask => (
                <tr key={`mask-${mask}`}>
                  <td className="p-1.5 text-gray-400 font-mono text-xs">
                    {mask.toString(2).padStart(n, "0")}
                  </td>
                  {cities.map((city, pos) => { // skipcq: JS-R1005
                    const value = dpTable[mask]?.[pos];
                    const isCurrent = currentStep?.mask === mask && currentStep?.pos === pos;
                    return (
                      <td key={`tsp-dp-${mask}-${city}`} className="p-1">
                        <div className={`w-10 h-7 flex items-center justify-center rounded font-mono text-xs ${
                          isCurrent
                            ? "bg-blue-600 border-2 border-blue-400 text-white font-bold"
                            : value !== null && value < INF
                              ? "bg-gray-800 text-gray-300"
                              : "bg-gray-900/50 text-gray-600"
                        }`}>
                          {value !== null && value < INF ? value : "-"}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {currentStep && (
        <div className="text-sm text-center font-mono bg-gray-800/50 text-green-400 px-4 py-2 rounded-lg max-w-lg">
          {currentStep.formula}
        </div>
      )}

      {step >= tspSteps.length && step > 0 && (
        <div className="text-sm text-center bg-green-600/20 px-4 py-2 rounded-lg">
          <span className="text-green-400 font-bold">Answer: Min tour cost = {answer}</span>
          <span className="text-gray-400 ml-2">(A-B-D-C-A)</span>
        </div>
      )}

      <div className="text-xs text-gray-500 text-center max-w-md">
        State: dp[mask][pos] = min cost to visit cities in mask, ending at pos. Process by popcount.
      </div>
    </div>
  );
};

// skipcq: JS-0067
export default function BitmaskDPVisualizer() {
  const phases: Phase[] = ["concept", "subsets", "assignment", "tsp"];
  const phaseLabels: Record<Phase, string> = {
    concept: "Bitmask Basics",
    subsets: "Subset Sum",
    assignment: "Assignment",
    tsp: "TSP",
  };

  const [currentPhase, setCurrentPhase] = useState<Phase>("concept");
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(600);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const subsetSteps = useMemo(() => generateSubsetSteps(), []);
  const { steps: assignmentSteps, answer: assignmentAnswer } = useMemo(() => generateAssignmentSteps(), []);
  const { steps: tspSteps, answer: tspAnswer } = useMemo(() => generateTSPSteps(), []);

  const getMaxSteps = useCallback(
    (phase: Phase) => {
      if (phase === "concept") return conceptSteps.length;
      if (phase === "subsets") return subsetSteps.length;
      if (phase === "assignment") return assignmentSteps.length;
      if (phase === "tsp") return tspSteps.length;
      return 0;
    },
    [subsetSteps.length, assignmentSteps.length, tspSteps.length]
  );

  const maxSteps = getMaxSteps(currentPhase);

  useEffect(() => {
    if (isPlaying && step < maxSteps) {
      intervalRef.current = setTimeout(() => {
        setStep((s) => {
          if (s + 1 >= maxSteps) setIsPlaying(false);
          return s + 1;
        });
      }, speed);
    }
    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [isPlaying, step, speed, maxSteps]);

  const goToPhase = (phase: Phase) => {
    setCurrentPhase(phase);
    setStep(0);
    setIsPlaying(false);
  };

  return (
    <div className="p-6 bg-gray-900 rounded-xl w-full max-w-5xl mx-auto">
      <div className="text-center mb-4">
        <div className="text-lg font-medium text-white">Bitmask DP</div>
        <div className="text-sm text-gray-400">
          Represent sets as integers, solve subset-based optimization problems
        </div>
      </div>

      <div className="flex justify-center mb-6">
        <div className="inline-flex bg-gray-800/50 p-1 rounded-xl flex-wrap justify-center">
          {phases.map((phase, index) => (
            <button
              key={phase}
              onClick={() => goToPhase(phase)}
              className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentPhase === phase
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <span className={`w-5 h-5 flex items-center justify-center rounded-full text-xs ${
                  currentPhase === phase ? "bg-blue-500" : "bg-gray-700"
                }`}>
                  {index + 1}
                </span>
                {phaseLabels[phase]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <Controls
          isPlaying={isPlaying}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onStep={() => step < maxSteps && setStep((s) => s + 1)}
          onBack={() => step > 0 && setStep((s) => s - 1)}
          onReset={() => {
            setStep(0);
            setIsPlaying(false);
          }}
          speed={speed}
          onSpeedChange={setSpeed}
          step={step}
          total={maxSteps}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentPhase}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {currentPhase === "concept" && <ConceptPhase step={step} />}
          {currentPhase === "subsets" && (
            <SubsetPhase step={step} subsetSteps={subsetSteps} />
          )}
          {currentPhase === "assignment" && (
            <AssignmentPhase
              step={step}
              assignmentSteps={assignmentSteps}
              answer={assignmentAnswer}
            />
          )}
          {currentPhase === "tsp" && (
            <TSPPhase step={step} tspSteps={tspSteps} answer={tspAnswer} />
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 pt-4 border-t border-gray-800 text-sm text-gray-500 text-center">
        Time: O(2^n) or O(n * 2^n). Use when n ≤ 20 and state depends on WHICH elements used.
      </div>
    </div>
  );
}
