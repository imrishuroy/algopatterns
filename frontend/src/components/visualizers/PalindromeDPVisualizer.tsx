"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Phase = "concept" | "table" | "expand";

const str = "babad";
const n = str.length;

const generateTableSteps = () => {
  const steps: { i: number; j: number; isPalin: boolean; formula: string; len: number }[] = [];
  const dp: boolean[][] = Array(n).fill(null).map(() => Array(n).fill(false));
  let longestStart = 0, longestLen = 1;

  for (let i = 0; i < n; i++) {
    dp[i][i] = true;
    steps.push({ i, j: i, isPalin: true, formula: `Single char '${str[i]}' is palindrome`, len: 1 });
  }

  for (let i = 0; i < n - 1; i++) {
    const isPalin = str[i] === str[i + 1];
    dp[i][i + 1] = isPalin;
    if (isPalin && 2 > longestLen) { longestStart = i; longestLen = 2; }
    steps.push({ i, j: i + 1, isPalin, formula: `'${str[i]}${str[i + 1]}': ${str[i]} ${isPalin ? "==" : "!="} ${str[i + 1]}`, len: 2 });
  }

  for (let len = 3; len <= n; len++) {
    for (let i = 0; i <= n - len; i++) {
      const j = i + len - 1;
      const outerMatch = str[i] === str[j];
      const innerPalin = dp[i + 1][j - 1];
      const isPalin = outerMatch && innerPalin;
      dp[i][j] = isPalin;
      if (isPalin && len > longestLen) { longestStart = i; longestLen = len; }
      steps.push({
        i, j, isPalin, len,
        formula: `'${str.substring(i, j + 1)}': ${str[i]}==${str[j]}? ${outerMatch ? "Yes" : "No"}, inner palin? ${innerPalin ? "Yes" : "No"} => ${isPalin ? "PALIN" : "no"}`,
      });
    }
  }

  return { steps, dp, longest: str.substring(longestStart, longestStart + longestLen) };
};

const generateExpandSteps = () => {
  const steps: { center: number; left: number; right: number; expanded: string; type: "odd" | "even" }[] = [];
  let longestStart = 0, longestLen = 1;

  for (let i = 0; i < n; i++) {
    let l = i, r = i;
    while (l >= 0 && r < n && str[l] === str[r]) {
      if (r - l + 1 > longestLen) { longestStart = l; longestLen = r - l + 1; }
      steps.push({ center: i, left: l, right: r, expanded: str.substring(l, r + 1), type: "odd" });
      l--; r++;
    }

    l = i; r = i + 1;
    while (l >= 0 && r < n && str[l] === str[r]) {
      if (r - l + 1 > longestLen) { longestStart = l; longestLen = r - l + 1; }
      steps.push({ center: i, left: l, right: r, expanded: str.substring(l, r + 1), type: "even" });
      l--; r++;
    }
  }

  return { steps, longest: str.substring(longestStart, longestStart + longestLen) };
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

const StringDisplay = ({ highlightRange }: { highlightRange?: { left: number; right: number } }) => (
  <div className="flex justify-center gap-1 mb-4">
    {str.split("").map((c, i) => {
      const inRange = highlightRange && i >= highlightRange.left && i <= highlightRange.right;
      return (
        <div key={i} className="flex flex-col items-center">
          <div className="text-xs text-gray-500 mb-1">{i}</div>
          <div className={`w-10 h-10 flex items-center justify-center rounded font-mono font-bold text-lg transition-all ${
            inRange ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-300"
          }`}>{c}</div>
        </div>
      );
    })}
  </div>
);

const ConceptPhase = () => (
  <div className="flex flex-col items-center gap-6">
    <StringDisplay />
    <div className="bg-gray-800/30 rounded-lg p-6 max-w-lg">
      <div className="text-center mb-4">
        <div className="text-white font-medium mb-2">Two Approaches</div>
      </div>
      <div className="text-sm text-gray-400 space-y-4">
        <div>
          <div className="text-blue-400 font-medium">1. 2D DP Table O(n²)</div>
          <div>dp[i][j] = true if s[i..j] is palindrome</div>
          <div className="font-mono bg-gray-800 p-2 rounded text-xs mt-1">
            dp[i][j] = (s[i] == s[j]) && dp[i+1][j-1]
          </div>
        </div>
        <div>
          <div className="text-green-400 font-medium">2. Expand Around Center O(n²)</div>
          <div>Try each index as center, expand outward</div>
          <div className="text-gray-500 text-xs">Check both odd (single center) and even (two centers) lengths</div>
        </div>
      </div>
    </div>
  </div>
);

const TablePhase = ({ step, tableSteps }: { step: number; tableSteps: ReturnType<typeof generateTableSteps>["steps"] }) => {
  const dpTable = useMemo(() => {
    const dp: (boolean | null)[][] = Array(n).fill(null).map(() => Array(n).fill(null));
    for (let s = 0; s < Math.min(step, tableSteps.length); s++) {
      const { i, j, isPalin } = tableSteps[s];
      dp[i][j] = isPalin;
    }
    return dp;
  }, [step, tableSteps]);

  const currentStep = step > 0 && step <= tableSteps.length ? tableSteps[step - 1] : null;

  return (
    <div className="flex flex-col items-center gap-6">
      <StringDisplay highlightRange={currentStep ? { left: currentStep.i, right: currentStep.j } : undefined} />

      <div className="text-center">
        <div className="text-sm text-gray-500 mb-2">dp[i][j] = is s[i..j] palindrome?</div>
        <div className="overflow-x-auto">
          <table className="border-collapse text-sm">
            <thead>
              <tr>
                <th className="p-2 text-gray-500 w-8">i\j</th>
                {str.split("").map((c, i) => (<th key={i} className="p-2 text-gray-400 w-10">{c}</th>))}
              </tr>
            </thead>
            <tbody>
              {str.split("").map((c, i) => (
                <tr key={i}>
                  <td className="p-2 text-gray-400 font-mono">{c}</td>
                  {str.split("").map((_, j) => {
                    const isCurrent = currentStep && currentStep.i === i && currentStep.j === j;
                    const value = dpTable[i]?.[j];
                    const isValid = j >= i;
                    return (
                      <td key={j} className="p-1">
                        <div className={`w-10 h-10 flex items-center justify-center border-2 rounded font-mono text-xs ${
                          !isValid ? "bg-gray-900/30 border-gray-800" :
                          isCurrent ? (value ? "bg-green-600 border-green-400" : "bg-red-600/50 border-red-400") + " text-white font-bold" :
                          value === true ? "bg-green-600/30 border-green-600/50 text-green-400" :
                          value === false ? "bg-gray-800/50 border-gray-700 text-gray-600" : "bg-gray-900/50 border-gray-700 text-gray-600"
                        }`}>{isValid ? (value === null ? "" : value ? "T" : "F") : ""}</div>
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
          <div className="text-gray-400 mb-1">Length {currentStep.len}</div>
          <div className={`font-mono px-6 py-3 rounded-lg ${currentStep.isPalin ? "bg-green-600/20 text-green-400" : "bg-gray-800/50 text-gray-400"}`}>
            {currentStep.formula}
          </div>
        </div>
      )}
      <div className="text-sm text-gray-500">Process by LENGTH: len=1, then len=2, then len=3...</div>
    </div>
  );
};

const ExpandPhase = ({ step, expandSteps }: { step: number; expandSteps: ReturnType<typeof generateExpandSteps>["steps"] }) => {
  const currentStep = step > 0 && step <= expandSteps.length ? expandSteps[step - 1] : null;

  return (
    <div className="flex flex-col items-center gap-6">
      <StringDisplay highlightRange={currentStep ? { left: currentStep.left, right: currentStep.right } : undefined} />

      <div className="text-center">
        {currentStep && (
          <>
            <div className="text-sm text-gray-400 mb-2">
              Center: {currentStep.center} ({currentStep.type === "odd" ? "single" : "between"})
            </div>
            <div className="text-2xl font-mono text-purple-400 mb-2">{currentStep.expanded}</div>
            <div className="text-sm text-gray-500">
              Expanding: [{currentStep.left}, {currentStep.right}]
            </div>
          </>
        )}
        {!currentStep && <div className="text-gray-500">Press play to expand around centers</div>}
      </div>

      <div className="text-sm text-gray-500 text-center max-w-md">
        For each center, expand while s[left] == s[right].
        Check both odd-length (single center) and even-length (two centers).
      </div>
    </div>
  );
};

export default function PalindromeDPVisualizer() {
  const phases: Phase[] = ["concept", "table", "expand"];
  const phaseLabels: Record<Phase, string> = { concept: "Concept", table: "2D DP Table", expand: "Expand Center" };

  const [currentPhase, setCurrentPhase] = useState<Phase>("concept");
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(600);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { steps: tableSteps, longest: tableLongest } = useMemo(() => generateTableSteps(), []);
  const { steps: expandSteps } = useMemo(() => generateExpandSteps(), []);

  const getMaxSteps = useCallback((phase: Phase) => {
    if (phase === "table") return tableSteps.length;
    if (phase === "expand") return expandSteps.length;
    return 1;
  }, [tableSteps.length, expandSteps.length]);

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
        <div className="text-lg font-medium text-white">Palindrome DP</div>
        <div className="text-sm text-gray-400">Find longest palindromic substring</div>
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
          {currentPhase === "table" && <TablePhase step={step} tableSteps={tableSteps} />}
          {currentPhase === "expand" && <ExpandPhase step={step} expandSteps={expandSteps} />}
        </motion.div>
      </AnimatePresence>
      <div className="mt-6 pt-4 border-t border-gray-800 text-sm text-gray-500 text-center">
        s = {str} | Longest palindrome = {tableLongest}
      </div>
    </div>
  );
}
