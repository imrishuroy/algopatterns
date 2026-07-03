"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Phase = "tree" | "memo" | "table" | "backtrack";

const str1 = "ABCDE";
const str2 = "ACE";

const generateTableSteps = () => {
  const m = str1.length;
  const n = str2.length;
  const steps: {
    i: number;
    j: number;
    value: number;
    match: boolean;
    formula: string;
  }[] = [];

  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
        steps.push({
          i,
          j,
          value: dp[i][j],
          match: true,
          formula: `'${str1[i - 1]}' == '${str2[j - 1]}': dp[${i - 1}][${j - 1}] + 1 = ${dp[i][j]}`,
        });
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        steps.push({
          i,
          j,
          value: dp[i][j],
          match: false,
          formula: `'${str1[i - 1]}' != '${str2[j - 1]}': max(dp[${i - 1}][${j}], dp[${i}][${j - 1}]) = ${dp[i][j]}`,
        });
      }
    }
  }

  return { steps, dp };
};

const generateBacktrackSteps = (dp: number[][]) => {
  const steps: { i: number; j: number; char?: string; action: string }[] = [];
  let i = str1.length;
  let j = str2.length;
  const lcs: string[] = [];

  while (i > 0 && j > 0) {
    if (str1[i - 1] === str2[j - 1]) {
      lcs.unshift(str1[i - 1]);
      steps.push({ i, j, char: str1[i - 1], action: `Match '${str1[i - 1]}' - add to LCS, go diagonal` });
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      steps.push({ i, j, action: `dp[${i - 1}][${j}] > dp[${i}][${j - 1}] - go up` });
      i--;
    } else {
      steps.push({ i, j, action: `dp[${i}][${j - 1}] >= dp[${i - 1}][${j}] - go left` });
      j--;
    }
  }

  return { steps, lcs: lcs.join("") };
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
      <button onClick={onBack} disabled={step === 0} className="w-10 h-10 flex items-center justify-center bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 disabled:opacity-30 transition-all" title="Back">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
      </button>
      {isPlaying ? (
        <button onClick={onPause} className="w-12 h-12 flex items-center justify-center bg-yellow-600 rounded-full hover:bg-yellow-500 transition-all shadow-lg" title="Pause">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
        </button>
      ) : (
        <button onClick={onPlay} disabled={step >= total} className="w-12 h-12 flex items-center justify-center bg-green-600 rounded-full hover:bg-green-500 disabled:opacity-30 transition-all shadow-lg" title="Play">
          <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
        </button>
      )}
      <button onClick={onStep} disabled={step >= total} className="w-10 h-10 flex items-center justify-center bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 disabled:opacity-30 transition-all" title="Step">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      </button>
      <button onClick={onReset} className="w-10 h-10 flex items-center justify-center bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-all ml-2" title="Reset">
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

const StringsDisplay = ({ highlightI, highlightJ }: { highlightI?: number; highlightJ?: number }) => (
  <div className="flex justify-center gap-8 mb-4">
    <div className="text-center">
      <div className="text-xs text-gray-500 mb-1">String 1</div>
      <div className="flex gap-1">
        {str1.split("").map((c, charIndex) => (
          <div key={`s1-char-${charIndex}-${c}`} className={`w-8 h-8 flex items-center justify-center rounded font-mono font-bold ${highlightI === charIndex + 1 ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300"}`}>{c}</div>
        ))}
      </div>
    </div>
    <div className="text-center">
      <div className="text-xs text-gray-500 mb-1">String 2</div>
      <div className="flex gap-1">
        {str2.split("").map((c, charIndex) => (
          <div key={`s2-char-${charIndex}-${c}`} className={`w-8 h-8 flex items-center justify-center rounded font-mono font-bold ${highlightJ === charIndex + 1 ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-300"}`}>{c}</div>
        ))}
      </div>
    </div>
  </div>
);

const TablePhase = ({ step, tableSteps }: { step: number; tableSteps: ReturnType<typeof generateTableSteps>["steps"] }) => {
  const currentDp = useMemo(() => {
    const table: number[][] = Array(str1.length + 1).fill(null).map(() => Array(str2.length + 1).fill(0));
    for (let s = 0; s < Math.min(step, tableSteps.length); s++) {
      const { i, j, value } = tableSteps[s];
      table[i][j] = value;
    }
    return table;
  }, [step, tableSteps]);

  const currentStep = step > 0 && step <= tableSteps.length ? tableSteps[step - 1] : null;

  return (
    <div className="flex flex-col items-center gap-6">
      <StringsDisplay highlightI={currentStep?.i} highlightJ={currentStep?.j} />
      <div className="overflow-x-auto">
        <table className="border-collapse text-sm">
          <thead>
            <tr>
              <th className="p-2 text-gray-500 w-10"></th>
              <th className="p-2 text-gray-500 w-10">-</th>
              {str2.split("").map((c, charIndex) => (<th key={`header-s2-${charIndex}-${c}`} className="p-2 text-purple-400 w-10 font-mono">{c}</th>))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 text-gray-500">-</td>
              {Array(str2.length + 1).fill(0).map((_, colIdx) => (<td key={`zero-row-${colIdx}`} className="p-1"><div className="w-10 h-10 flex items-center justify-center bg-gray-800 border border-gray-700 rounded text-gray-400 font-mono">0</div></td>))}
            </tr>
            {str1.split("").map((c, rowIndex) => (
              <tr key={`table-row-${rowIndex}-${c}`}>
                <td className="p-2 text-blue-400 font-mono">{c}</td>
                <td className="p-1"><div className="w-10 h-10 flex items-center justify-center bg-gray-800 border border-gray-700 rounded text-gray-400 font-mono">0</div></td>
                {Array(str2.length).fill(0).map((_, colIndex) => {
                  const isCurrent = currentStep && currentStep.i === rowIndex + 1 && currentStep.j === colIndex + 1;
                  const value = currentDp[rowIndex + 1]?.[colIndex + 1];
                  const isMatch = currentStep && isCurrent && currentStep.match;
                  return (
                    <td key={`table-cell-${rowIndex}-${colIndex}`} className="p-1">
                      <div className={`w-10 h-10 flex items-center justify-center border-2 rounded font-mono transition-all ${
                        isCurrent ? (isMatch ? "bg-green-600 border-green-400 text-white font-bold" : "bg-blue-600 border-blue-400 text-white font-bold")
                        : value > 0 ? "bg-gray-800 border-gray-600 text-gray-300" : "bg-gray-900/50 border-gray-700 text-gray-600"
                      }`}>{value || ""}</div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {currentStep && (
        <div className={`text-sm text-center font-mono px-6 py-3 rounded-lg ${currentStep.match ? "bg-green-600/20 text-green-400" : "bg-gray-800/50 text-gray-400"}`}>
          {currentStep.formula}
        </div>
      )}
      <div className="text-sm text-gray-500">If match: diagonal + 1 | Else: max(up, left)</div>
    </div>
  );
};

const BacktrackPhase = ({ step, backtrackSteps, dp }: { step: number; backtrackSteps: { i: number; j: number; char?: string; action: string }[]; dp: number[][] }) => {
  const currentStep = step > 0 && step <= backtrackSteps.length ? backtrackSteps[step - 1] : null;
  const foundChars = backtrackSteps.slice(0, step).filter(s => s.char).map(s => s.char).reverse();

  return (
    <div className="flex flex-col items-center gap-6">
      <StringsDisplay />
      <div className="overflow-x-auto">
        <table className="border-collapse text-sm">
          <thead>
            <tr>
              <th className="p-2 text-gray-500 w-10"></th>
              <th className="p-2 text-gray-500 w-10">-</th>
              {str2.split("").map((c, charIndex) => (<th key={`header-s2-${charIndex}-${c}`} className="p-2 text-purple-400 w-10 font-mono">{c}</th>))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 text-gray-500">-</td>
              {Array(str2.length + 1).fill(0).map((_, colIdx) => (<td key={`zero-row-${colIdx}`} className="p-1"><div className="w-10 h-10 flex items-center justify-center bg-gray-800 border border-gray-700 rounded text-gray-400 font-mono">0</div></td>))}
            </tr>
            {str1.split("").map((c, rowIndex) => (
              <tr key={`table-row-${rowIndex}-${c}`}>
                <td className="p-2 text-blue-400 font-mono">{c}</td>
                <td className="p-1"><div className="w-10 h-10 flex items-center justify-center bg-gray-800 border border-gray-700 rounded text-gray-400 font-mono">0</div></td>
                {Array(str2.length).fill(0).map((_, colIndex) => {
                  const isCurrent = currentStep && currentStep.i === rowIndex + 1 && currentStep.j === colIndex + 1;
                  const value = dp[rowIndex + 1]?.[colIndex + 1];
                  return (
                    <td key={`bt-cell-${rowIndex}-${colIndex}`} className="p-1">
                      <div className={`w-10 h-10 flex items-center justify-center border-2 rounded font-mono ${
                        isCurrent ? "bg-yellow-600 border-yellow-400 text-white font-bold" : "bg-gray-800 border-gray-600 text-gray-300"
                      }`}>{value}</div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-center">
        <div className="text-sm text-gray-500 mb-2">LCS found so far:</div>
        <div className="text-2xl font-mono font-bold text-green-400">{foundChars.join("") || "-"}</div>
      </div>
      {currentStep && (
        <div className="text-sm text-center font-mono bg-gray-800/50 text-gray-400 px-6 py-3 rounded-lg">{currentStep.action}</div>
      )}
    </div>
  );
};

export default function LCSVisualizer() { // skipcq: JS-0067
  const phases: Phase[] = ["tree", "memo", "table", "backtrack"];
  const phaseLabels: Record<Phase, string> = { tree: "Recursion", memo: "Memoization", table: "2D Table", backtrack: "Backtrack LCS" };

  const [currentPhase, setCurrentPhase] = useState<Phase>("table");
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(600);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { steps: tableSteps, dp } = useMemo(() => generateTableSteps(), []);
  const { steps: backtrackSteps, lcs } = useMemo(() => generateBacktrackSteps(dp), [dp]);

  const getMaxSteps = useCallback((phase: Phase) => {
    if (phase === "table") return tableSteps.length;
    if (phase === "backtrack") return backtrackSteps.length;
    return str1.length + str2.length;
  }, [tableSteps.length, backtrackSteps.length]);

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
        <div className="text-lg font-medium text-white">Longest Common Subsequence (LCS)</div>
        <div className="text-sm text-gray-400">Find the longest subsequence common to both strings</div>
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
          {(currentPhase === "tree" || currentPhase === "memo") && <TablePhase step={0} tableSteps={tableSteps} />}
          {currentPhase === "table" && <TablePhase step={step} tableSteps={tableSteps} />}
          {currentPhase === "backtrack" && <BacktrackPhase step={step} backtrackSteps={backtrackSteps} dp={dp} />}
        </motion.div>
      </AnimatePresence>
      <div className="mt-6 pt-4 border-t border-gray-800 text-sm text-gray-500 text-center">
        s1 = {str1} | s2 = {str2} | LCS = {lcs} (length {lcs.length})
      </div>
    </div>
  );
}
