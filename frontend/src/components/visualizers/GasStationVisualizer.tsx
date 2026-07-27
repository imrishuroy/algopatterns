"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

// Example data
const GAS = [1, 2, 3, 4, 5];
const COST = [3, 4, 5, 1, 2];
const N = GAS.length;

interface StepInfo {
  station: number;
  gasAtStation: number;
  costToNext: number;
  tankBefore: number;
  tankAfter: number;
  canProceed: boolean;
  startStation: number;
}

// Pre-compute steps (runs once since GAS/COST are constants)
const computeSteps = (): { steps: StepInfo[]; answer: number } => {
  const allSteps: StepInfo[] = [];
  let tank = 0;
  let start = 0;

  for (let i = 0; i < N; i++) {
    const tankBefore = tank;
    tank += GAS[i] - COST[i];

    const step: StepInfo = {
      station: i,
      gasAtStation: GAS[i],
      costToNext: COST[i],
      tankBefore,
      tankAfter: tank,
      canProceed: tank >= 0,
      startStation: start,
    };

    allSteps.push(step);

    if (tank < 0) {
      start = i + 1;
      tank = 0;
    }
  }

  const totalGas = GAS.reduce((a, b) => a + b, 0);
  const totalCost = COST.reduce((a, b) => a + b, 0);

  return {
    steps: allSteps,
    answer: totalGas >= totalCost ? start : -1,
  };
};

const PRECOMPUTED = computeSteps();

export default function GasStationVisualizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = PRECOMPUTED.steps;
  const finalAnswer = PRECOMPUTED.answer;

  const isDone = currentStep >= steps.length;

  const performStep = useCallback(() => {
    if (currentStep < steps.length) {
      setCurrentStep((s) => s + 1);
    } else {
      setIsPlaying(false);
    }
  }, [currentStep, steps.length]);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      performStep();
    }, speed);

    return () => clearTimeout(timer);
  }, [isPlaying, performStep, speed]);

  const reset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  // Get current state based on steps processed
  const getCurrentState = () => {
    if (currentStep === 0) {
      return { tank: 0, start: 0, processed: -1 };
    }
    const lastStep = steps[currentStep - 1];
    return {
      tank: lastStep.canProceed ? lastStep.tankAfter : 0,
      start: lastStep.canProceed ? lastStep.startStation : lastStep.station + 1,
      processed: lastStep.station,
    };
  };

  const state = getCurrentState();

  // Determine station status for coloring
  const getStationStatus = (idx: number) => {
    if (isDone && finalAnswer === idx) return "answer";
    if (idx > state.processed) return "unvisited";
    if (idx < state.start) return "skipped";
    if (idx === state.processed) return "current";
    return "in-range";
  };

  const getStationStyle = (status: string) => {
    switch (status) {
      case "answer":
        return "bg-green-500 border-green-400 text-white";
      case "current":
        return "bg-yellow-500 border-yellow-400 text-black";
      case "skipped":
        return "bg-red-500/20 border-red-500/50 text-gray-400";
      case "in-range":
        return "bg-blue-500/30 border-blue-500 text-white";
      default:
        return "bg-gray-800 border-gray-700 text-gray-300";
    }
  };

  const currentStepData = currentStep > 0 ? steps[currentStep - 1] : null;

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="p-4 border-b border-gray-800 bg-gradient-to-r from-orange-500/10 to-amber-500/10">
        <h3 className="text-lg font-semibold text-white">Gas Station</h3>
        <p className="text-gray-400 text-sm mt-1">
          Find which station to start from to complete the circular route
        </p>
      </div>

      <div className="p-4">
        {/* Controls */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={isDone}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              isPlaying ? "bg-yellow-500 text-black" : "bg-green-500 text-white"
            } disabled:opacity-50`}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            onClick={() => {
              if (!isPlaying && !isDone) {
                performStep();
              }
            }}
            disabled={isPlaying || isDone}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 disabled:opacity-50"
          >
            Step
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
              min="200"
              max="1500"
              step="100"
              value={1700 - speed}
              onChange={(e) => setSpeed(1700 - Number(e.target.value))}
              className="w-20 accent-orange-500"
            />
          </div>
        </div>

        {/* Data Display */}
        <div className="mb-6 p-4 bg-gray-800/50 rounded-lg font-mono text-sm">
          <div className="flex gap-8 justify-center flex-wrap">
            <div>
              <span className="text-gray-500">gas  = </span>
              <span className="text-green-400">[{GAS.join(", ")}]</span>
            </div>
            <div>
              <span className="text-gray-500">cost = </span>
              <span className="text-red-400">[{COST.join(", ")}]</span>
            </div>
          </div>
        </div>

        {/* Circular Route Visualization */}
        <div className="mb-6">
          <div className="text-sm text-gray-400 mb-3 text-center">
            Circular Route: 0 → 1 → 2 → 3 → 4 → back to 0
          </div>

          <div className="flex justify-center items-center gap-1 flex-wrap">
            {GAS.map((g, idx) => {
              const status = getStationStatus(idx);
              const net = g - COST[idx];
              return (
                <React.Fragment key={idx}>
                  <motion.div
                    animate={{
                      scale: status === "current" ? 1.1 : 1,
                    }}
                    className={`relative w-24 p-3 rounded-lg border-2 text-center transition-all ${getStationStyle(status)}`}
                  >
                    <div className="text-xs opacity-70 mb-1">Station {idx}</div>
                    <div className="text-sm">
                      <span className="text-green-400">+{g}</span>
                      <span className="opacity-50"> gas</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-red-400">-{COST[idx]}</span>
                      <span className="opacity-50"> cost</span>
                    </div>
                    <div
                      className={`text-xs mt-1 font-bold ${
                        net >= 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      net: {net >= 0 ? "+" : ""}{net}
                    </div>
                    {isDone && finalAnswer === idx && (
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded font-bold">
                        START
                      </div>
                    )}
                  </motion.div>
                  {idx < N - 1 && (
                    <div className="text-gray-500 text-xl">→</div>
                  )}
                </React.Fragment>
              );
            })}
            <div className="text-gray-500 text-xl">↩</div>
          </div>
        </div>

        {/* Current State */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">Current Tank</div>
            <div
              className={`text-2xl font-mono font-bold ${
                state.tank >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {state.tank}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">Trying Start From</div>
            <div className="text-2xl font-mono font-bold text-blue-400">
              Station {state.start}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">Progress</div>
            <div className="text-2xl font-mono font-bold text-white">
              {currentStep} / {N}
            </div>
          </div>
        </div>

        {/* Step Explanation */}
        {currentStepData && (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-gray-800/50 rounded-lg mb-4"
          >
            <div className="text-sm space-y-2">
              <div className="text-gray-300">
                <span className="text-yellow-400 font-bold">
                  Station {currentStepData.station}:
                </span>{" "}
                We have <span className="text-blue-400">{currentStepData.tankBefore}</span> gas in tank.
              </div>
              <div className="text-gray-300">
                → Get <span className="text-green-400">+{currentStepData.gasAtStation}</span> gas,
                need <span className="text-red-400">-{currentStepData.costToNext}</span> to drive to next station.
              </div>
              <div className="text-gray-300">
                → Tank after: {currentStepData.tankBefore} + {currentStepData.gasAtStation} - {currentStepData.costToNext} ={" "}
                <span
                  className={
                    currentStepData.tankAfter >= 0 ? "text-green-400 font-bold" : "text-red-400 font-bold"
                  }
                >
                  {currentStepData.tankAfter}
                </span>
              </div>
              {!currentStepData.canProceed && (
                <div className="text-red-400 font-bold mt-2">
                  ❌ Tank negative! Station {currentStepData.station} can&apos;t be reached from Station {currentStepData.startStation}. 
                  Reset and try starting from Station {currentStepData.station + 1}.
                </div>
              )}
              {currentStepData.canProceed && (
                <div className="text-green-400">
                  ✓ Tank is positive, continue to next station.
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Final Result */}
        {isDone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 rounded-lg text-center ${
              finalAnswer === -1
                ? "bg-red-500/10 border border-red-500/30"
                : "bg-green-500/10 border border-green-500/30"
            }`}
          >
            {finalAnswer === -1 ? (
              <div className="text-red-400 font-bold text-lg">
                ❌ Impossible: Total gas {"<"} Total cost
              </div>
            ) : (
              <>
                <div className="text-green-400 font-bold text-lg">
                  ✓ Answer: Start from Station {finalAnswer}
                </div>
                <div className="text-gray-400 text-sm mt-2">
                  Total gas ({GAS.reduce((a, b) => a + b, 0)}) ≥ Total cost ({COST.reduce((a, b) => a + b, 0)}), 
                  so a solution exists!
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-gray-800">
          <div className="flex flex-wrap gap-4 text-xs text-gray-500 justify-center">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>Processing</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500/30 border border-blue-500 rounded"></div>
              <span>Valid start range</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500/20 border border-red-500/50 rounded"></div>
              <span>Can&apos;t start here</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Answer</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
