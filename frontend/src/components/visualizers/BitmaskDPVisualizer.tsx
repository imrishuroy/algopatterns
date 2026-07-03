"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Phase = "concept" | "tsp" | "result";

const cities = ["A", "B", "C", "D"];
const n = cities.length;
const dist: number[][] = [
  [0, 10, 15, 20],
  [10, 0, 35, 25],
  [15, 35, 0, 30],
  [20, 25, 30, 0],
];

const INF = 999999;

const generateTSPSteps = () => {
  const steps: { mask: number; pos: number; value: number; formula: string }[] = [];
  const allMask = (1 << n) - 1;
  const dp: number[][] = Array(1 << n).fill(null).map(() => Array(n).fill(INF));

  dp[1][0] = 0;
  steps.push({ mask: 1, pos: 0, value: 0, formula: "Start at A: dp[0001][A] = 0" });

  for (let mask = 1; mask < (1 << n); mask++) {
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
          const newMaskBin = newMask.toString(2).padStart(n, "0");
          steps.push({
            mask: newMask, pos: next, value: newDist,
            formula: `From ${cities[pos]} (mask=${maskBin}) to ${cities[next]}: ${dp[mask][pos]} + ${dist[pos][next]} = ${newDist} → dp[${newMaskBin}][${cities[next]}]`,
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
  isPlaying, onPlay, onPause, onStep, onBack, onReset, speed, onSpeedChange, step, total,
}: {
  isPlaying: boolean; onPlay: () => void; onPause: () => void; onStep: () => void;
  onBack: () => void; onReset: () => void; speed: number; onSpeedChange: (s: number) => void;
  step: number; total: number;
}) => (
  <div className="flex flex-col gap-4">
    <div className="flex items-center justify-center gap-2">
      <button onClick={onBack} disabled={step === 0} className="w-10 h-10 flex items-center justify-center bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 disabled:opacity-30 transition-all">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
      </button>
      {isPlaying ? (
        <button onClick={onPause} className="w-12 h-12 flex items-center justify-center bg-yellow-600 rounded-full hover:bg-yellow-500 transition-all shadow-lg">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
        </button>
      ) : (
        <button onClick={onPlay} disabled={step >= total} className="w-12 h-12 flex items-center justify-center bg-green-600 rounded-full hover:bg-green-500 disabled:opacity-30 transition-all shadow-lg">
          <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
        </button>
      )}
      <button onClick={onStep} disabled={step >= total} className="w-10 h-10 flex items-center justify-center bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 disabled:opacity-30 transition-all">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      </button>
      <button onClick={onReset} className="w-10 h-10 flex items-center justify-center bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-all ml-2">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
      </button>
    </div>
    <div className="flex items-center justify-center gap-4">
      <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-3 py-1.5">
        <span className="text-xs text-gray-500 uppercase">Speed</span>
        <div className="flex gap-1">
          {[{ value: 1000, label: "0.5x" }, { value: 600, label: "1x" }, { value: 300, label: "2x" }].map((opt) => (
            <button key={opt.value} onClick={() => onSpeedChange(opt.value)} className={`px-2.5 py-1 rounded text-xs font-medium ${speed === opt.value ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}>{opt.label}</button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-3 py-1.5">
        <span className="text-xs text-gray-500 uppercase">Step</span>
        <span className="text-sm font-mono text-white">{step} <span className="text-gray-500">/</span> {total}</span>
      </div>
    </div>
  </div>
);

const MaskDisplay = ({ mask, visited }: { mask: number; visited: Set<number> }) => (
  <div className="flex justify-center gap-2 mb-4">
    {cities.map((city, i) => {
      const isVisited = visited.has(i) || (mask & (1 << i)) !== 0;
      return (
        <div key={i} className="flex flex-col items-center">
          <div className={`w-12 h-12 flex items-center justify-center rounded-full font-mono font-bold text-lg transition-all ${
            isVisited ? "bg-green-600 text-white" : "bg-gray-800 text-gray-400"
          }`}>{city}</div>
          <div className="text-xs text-gray-500 mt-1">{(mask >> i) & 1}</div>
        </div>
      );
    })}
    <div className="ml-4 flex items-center text-gray-500 text-sm font-mono">
      mask = {mask.toString(2).padStart(n, "0")} ({mask})
    </div>
  </div>
);

const DistanceMatrix = () => (
  <div className="text-center mb-4">
    <div className="text-sm text-gray-500 mb-2">Distance Matrix</div>
    <table className="border-collapse text-sm mx-auto">
      <thead>
        <tr>
          <th className="p-1.5 text-gray-500 w-8"></th>
          {cities.map((c, i) => (<th key={i} className="p-1.5 text-gray-400 w-10">{c}</th>))}
        </tr>
      </thead>
      <tbody>
        {cities.map((c, i) => (
          <tr key={i}>
            <td className="p-1.5 text-gray-400 font-mono">{c}</td>
            {dist[i].map((d, j) => (
              <td key={j} className="p-1">
                <div className={`w-10 h-8 flex items-center justify-center rounded text-xs ${
                  i === j ? "bg-gray-900/50 text-gray-600" : "bg-gray-800 text-gray-300"
                }`}>{d}</div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const ConceptPhase = () => (
  <div className="flex flex-col items-center gap-6">
    <MaskDisplay mask={0} visited={new Set([0])} />
    <DistanceMatrix />
    <div className="bg-gray-800/30 rounded-lg p-6 max-w-lg">
      <div className="text-center mb-4">
        <div className="text-white font-medium mb-2">TSP with Bitmask DP</div>
        <div className="text-sm text-gray-400">Visit all cities exactly once, return to start, minimize cost</div>
      </div>
      <div className="text-sm text-gray-400 space-y-2">
        <div><span className="text-blue-400">State:</span> dp[mask][pos] = min cost to reach pos with visited set = mask</div>
        <div><span className="text-green-400">Mask:</span> bit i = 1 means city i is visited</div>
        <div className="font-mono bg-gray-800 p-2 rounded text-xs mt-2">
          dp[newMask][next] = min(dp[newMask][next], dp[mask][pos] + dist[pos][next])
        </div>
        <div className="text-gray-500 text-xs mt-2">Answer: min(dp[1111][pos] + dist[pos][0]) for all pos</div>
      </div>
    </div>
  </div>
);

const TSPPhase = ({
  step, tspSteps,
}: {
  step: number;
  tspSteps: ReturnType<typeof generateTSPSteps>["steps"];
}) => {
  const currentStep = step > 0 && step <= tspSteps.length ? tspSteps[step - 1] : null;
  const currentMask = currentStep?.mask || 1;

  const visited = useMemo(() => {
    const set = new Set<number>();
    for (let i = 0; i < n; i++) {
      if (currentMask & (1 << i)) set.add(i);
    }
    return set;
  }, [currentMask]);

  const dpTable = useMemo(() => {
    const dp: (number | null)[][] = Array(1 << n).fill(null).map(() => Array(n).fill(null));
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
    return Array.from(masks).sort((a, b) => a - b).slice(-5);
  }, [step, tspSteps]);

  return (
    <div className="flex flex-col items-center gap-6">
      <MaskDisplay mask={currentMask} visited={visited} />

      <div className="text-center overflow-x-auto">
        <div className="text-sm text-gray-500 mb-2">DP Table (recent masks)</div>
        <table className="border-collapse text-xs mx-auto">
          <thead>
            <tr>
              <th className="p-1.5 text-gray-500 w-16">mask</th>
              {cities.map((c, i) => (<th key={i} className="p-1.5 text-gray-400 w-12">{c}</th>))}
            </tr>
          </thead>
          <tbody>
            {relevantMasks.map((mask) => (
              <tr key={mask}>
                <td className="p-1.5 text-gray-400 font-mono text-xs">{mask.toString(2).padStart(n, "0")}</td>
                {cities.map((_, pos) => {
                  const value = dpTable[mask]?.[pos];
                  const isCurrent = currentStep?.mask === mask && currentStep?.pos === pos;
                  return (
                    <td key={pos} className="p-1">
                      <div className={`w-12 h-8 flex items-center justify-center rounded font-mono text-xs ${
                        isCurrent ? "bg-blue-600 border-2 border-blue-400 text-white font-bold" :
                        value !== null && value < INF ? "bg-gray-800 text-gray-300" : "bg-gray-900/50 text-gray-600"
                      }`}>{value !== null && value < INF ? value : "-"}</div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {currentStep && (
        <div className="text-sm text-center font-mono bg-gray-800/50 text-green-400 px-6 py-3 rounded-lg max-w-lg">
          {currentStep.formula}
        </div>
      )}

      <div className="text-sm text-gray-500">Process by increasing popcount: fewer visited cities first</div>
    </div>
  );
};

export default function BitmaskDPVisualizer() {
  const phases: Phase[] = ["concept", "tsp", "result"];
  const phaseLabels: Record<Phase, string> = { concept: "Concept", tsp: "TSP Steps", result: "Result" };

  const [currentPhase, setCurrentPhase] = useState<Phase>("concept");
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(600);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { steps: tspSteps, answer } = useMemo(() => generateTSPSteps(), []);

  const getMaxSteps = useCallback((phase: Phase) => {
    if (phase === "tsp" || phase === "result") return tspSteps.length;
    return 1;
  }, [tspSteps.length]);

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
    return () => { if (intervalRef.current) clearTimeout(intervalRef.current); };
  }, [isPlaying, step, speed, maxSteps]);

  const goToPhase = (phase: Phase) => { setCurrentPhase(phase); setStep(0); setIsPlaying(false); };

  return (
    <div className="p-6 bg-gray-900 rounded-xl w-full max-w-4xl mx-auto">
      <div className="text-center mb-4">
        <div className="text-lg font-medium text-white">Bitmask DP (TSP)</div>
        <div className="text-sm text-gray-400">Traveling Salesman Problem - visit all cities with minimum cost</div>
      </div>
      <div className="flex justify-center mb-6">
        <div className="inline-flex bg-gray-800/50 p-1 rounded-xl">
          {phases.map((phase, index) => (
            <button key={phase} onClick={() => goToPhase(phase)} className={`relative px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${currentPhase === phase ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}>
              <span className="flex items-center gap-2">
                <span className={`w-5 h-5 flex items-center justify-center rounded-full text-xs ${currentPhase === phase ? "bg-blue-500" : "bg-gray-700"}`}>{index + 1}</span>
                {phaseLabels[phase]}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="mb-6">
        <Controls isPlaying={isPlaying} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onStep={() => step < maxSteps && setStep(s => s + 1)} onBack={() => step > 0 && setStep(s => s - 1)} onReset={() => { setStep(0); setIsPlaying(false); }} speed={speed} onSpeedChange={setSpeed} step={step} total={maxSteps} />
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={currentPhase} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          {currentPhase === "concept" && <ConceptPhase />}
          {(currentPhase === "tsp" || currentPhase === "result") && <TSPPhase step={step} tspSteps={tspSteps} />}
        </motion.div>
      </AnimatePresence>
      <div className="mt-6 pt-4 border-t border-gray-800 text-sm text-gray-500 text-center">
        {n} cities: {cities.join(", ")} | Min tour cost = {answer}
      </div>
    </div>
  );
}
