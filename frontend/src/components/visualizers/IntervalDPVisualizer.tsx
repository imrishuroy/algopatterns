"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Phase = "concept" | "table" | "backtrack";

const balloons = [3, 1, 5, 8];
const n = balloons.length;

const generateTableSteps = () => {
  const steps: { l: number; r: number; k: number; value: number; formula: string; len: number }[] = [];
  const nums = [1, ...balloons, 1];
  const dp: number[][] = Array(n + 2).fill(null).map(() => Array(n + 2).fill(0));

  for (let len = 1; len <= n; len++) {
    for (let l = 1; l <= n - len + 1; l++) {
      const r = l + len - 1;
      for (let k = l; k <= r; k++) {
        const coins = nums[l - 1] * nums[k] * nums[r + 1] + dp[l][k - 1] + dp[k + 1][r];
        if (coins > dp[l][r]) {
          dp[l][r] = coins;
          steps.push({
            l, r, k, value: dp[l][r], len,
            formula: `Burst ${balloons[k - 1]} last: ${nums[l - 1]}*${nums[k]}*${nums[r + 1]} + dp[${l}][${k - 1}] + dp[${k + 1}][${r}] = ${coins}`,
          });
        }
      }
    }
  }

  return { steps, dp, answer: dp[1][n] };
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

const BalloonsDisplay = ({ highlightRange }: { highlightRange?: { l: number; r: number; k: number } }) => (
  <div className="flex justify-center gap-2 mb-4">
    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-700 text-gray-400 font-mono">1</div>
    {balloons.map((b, balloonIndex) => {
      const idx = balloonIndex + 1;
      const inRange = highlightRange && idx >= highlightRange.l && idx <= highlightRange.r;
      const isK = highlightRange && idx === highlightRange.k;
      return (
        <div key={`balloon-${balloonIndex}-${b}`} className={`w-12 h-12 flex items-center justify-center rounded-full font-mono font-bold transition-all ${
          isK ? "bg-red-600 text-white ring-2 ring-red-400" : inRange ? "bg-blue-600 text-white" : "bg-yellow-500 text-black"
        }`}>{b}</div>
      );
    })}
    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-700 text-gray-400 font-mono">1</div>
  </div>
);

const TablePhase = ({ step, tableSteps }: { step: number; tableSteps: ReturnType<typeof generateTableSteps>["steps"] }) => {
  const dpTable = useMemo(() => {
    const dp: number[][] = Array(n + 2).fill(null).map(() => Array(n + 2).fill(0));
    for (let s = 0; s < Math.min(step, tableSteps.length); s++) {
      const { l, r, value } = tableSteps[s];
      dp[l][r] = value;
    }
    return dp;
  }, [step, tableSteps]);

  const currentStep = step > 0 && step <= tableSteps.length ? tableSteps[step - 1] : null;

  return (
    <div className="flex flex-col items-center gap-6">
      <BalloonsDisplay highlightRange={currentStep ? { l: currentStep.l, r: currentStep.r, k: currentStep.k } : undefined} />

      <div className="text-center">
        <div className="text-sm text-gray-500 mb-2">dp[l][r] = max coins bursting balloons l to r</div>
        <div className="overflow-x-auto">
          <table className="border-collapse text-sm">
            <thead>
              <tr>
                <th className="p-2 text-gray-500 w-10">l\r</th>
                {Array(n).fill(0).map((_, colIdx) => (<th key={`col-${colIdx + 1}`} className="p-2 text-gray-400 w-12">{colIdx + 1}</th>))}
              </tr>
            </thead>
            <tbody>
              {Array(n).fill(0).map((_, rowL) => (
                <tr key={`row-${rowL + 1}`}>
                  <td className="p-2 text-gray-400 font-mono">{rowL + 1}</td>
                  {Array(n).fill(0).map((_, colR) => {
                    const isCurrent = currentStep && currentStep.l === rowL + 1 && currentStep.r === colR + 1;
                    const value = dpTable[rowL + 1]?.[colR + 1];
                    const isValid = colR >= rowL;
                    return (
                      <td key={`cell-${rowL + 1}-${colR + 1}`} className="p-1">
                        <div className={`w-12 h-10 flex items-center justify-center border-2 rounded font-mono text-sm ${
                          !isValid ? "bg-gray-900/30 border-gray-800 text-gray-700" :
                          isCurrent ? "bg-green-600 border-green-400 text-white font-bold" :
                          value > 0 ? "bg-gray-800 border-gray-600 text-gray-300" : "bg-gray-900/50 border-gray-700 text-gray-600"
                        }`}>{isValid ? (value || "") : ""}</div>
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
        <div className="text-sm text-center">
          <div className="text-gray-400 mb-1">Length {currentStep.len}: range [{currentStep.l}, {currentStep.r}]</div>
          <div className="font-mono bg-gray-800/50 text-green-400 px-6 py-3 rounded-lg">{currentStep.formula}</div>
        </div>
      )}
      <div className="text-sm text-gray-500">Process by LENGTH: len=1, then len=2, ... Think: which balloon to burst LAST</div>
    </div>
  );
};

const ConceptPhase = () => (
  <div className="flex flex-col items-center gap-6">
    <BalloonsDisplay />
    <div className="bg-gray-800/30 rounded-lg p-6 max-w-lg">
      <div className="text-center mb-4">
        <div className="text-white font-medium mb-2">Key Insight: Think BACKWARDS</div>
        <div className="text-sm text-gray-400">Instead of which balloon to burst FIRST, think which to burst LAST.</div>
      </div>
      <div className="text-sm text-gray-400 space-y-2">
        <div><span className="text-blue-400">dp[l][r]</span> = max coins from bursting balloons l to r</div>
        <div>If balloon k is burst <span className="text-red-400">LAST</span> in range [l, r]:</div>
        <div className="font-mono bg-gray-800 p-2 rounded text-xs">
          coins = nums[l-1] * nums[k] * nums[r+1] + dp[l][k-1] + dp[k+1][r]
        </div>
        <div className="text-gray-500 text-xs mt-2">Process by length: smaller ranges first (they become subproblems)</div>
      </div>
    </div>
  </div>
);

export default function IntervalDPVisualizer() { // skipcq: JS-0067
  const phases: Phase[] = ["concept", "table", "backtrack"];
  const phaseLabels: Record<Phase, string> = { concept: "Concept", table: "Fill by Length", backtrack: "Reconstruct" };

  const [currentPhase, setCurrentPhase] = useState<Phase>("concept");
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(600);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { steps: tableSteps, answer } = useMemo(() => generateTableSteps(), []);

  const getMaxSteps = useCallback((phase: Phase) => {
    if (phase === "table") return tableSteps.length;
    return 1;
  }, [tableSteps.length]);

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
        <div className="text-lg font-medium text-white">Interval DP (Burst Balloons)</div>
        <div className="text-sm text-gray-400">Maximize coins by bursting balloons - think which to burst LAST</div>
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
          {(currentPhase === "table" || currentPhase === "backtrack") && <TablePhase step={step} tableSteps={tableSteps} />}
        </motion.div>
      </AnimatePresence>
      <div className="mt-6 pt-4 border-t border-gray-800 text-sm text-gray-500 text-center">
        balloons = [{balloons.join(", ")}] | Max coins = {answer}
      </div>
    </div>
  );
}
