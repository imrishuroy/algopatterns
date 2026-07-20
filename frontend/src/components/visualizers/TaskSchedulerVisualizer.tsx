"use client";

import React, { useState, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TaskFreq {
  task: string;
  count: number;
  color: string;
}

interface ScheduleSlot {
  task: string | null; // null = idle
  time: number;
}

interface Step {
  type: "init" | "cycle-start" | "execute" | "idle" | "cycle-end" | "done";
  message: string;
  heap: TaskFreq[];
  schedule: ScheduleSlot[];
  currentCycle: number;
  highlightTask?: string;
  highlightSlot?: number;
}

const TASK_COLORS: Record<string, string> = {
  A: "bg-blue-500",
  B: "bg-green-500",
  C: "bg-purple-500",
  D: "bg-orange-500",
  idle: "bg-gray-600",
};

// skipcq: JS-0067
export default function TaskSchedulerVisualizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [stepIndex, setStepIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Example: tasks = ['A', 'A', 'A', 'B', 'B', 'B'], n = 2
  const tasks = useMemo(() => ["A", "A", "A", "B", "B", "B"], []);
  const n = 2;

  // Generate all steps upfront
  const steps = useMemo(() => {
    const allSteps: Step[] = [];

    // Count frequencies
    const freqMap: Record<string, number> = {};
    for (const task of tasks) {
      freqMap[task] = (freqMap[task] || 0) + 1;
    }

    // Convert to heap format
    const heap: TaskFreq[] = Object.entries(freqMap).map(([task, count]) => ({
      task,
      count,
      color: TASK_COLORS[task] || "bg-gray-500",
    }));
    heap.sort((a, b) => b.count - a.count);

    const schedule: ScheduleSlot[] = [];
    let cycleNum = 0;

    // Initial state
    allSteps.push({
      type: "init",
      message: `Tasks: ${tasks.join(", ")}. Cooldown n=${n}. Frequencies: ${heap.map((h) => `${h.task}=${h.count}`).join(", ")}`,
      heap: JSON.parse(JSON.stringify(heap)),
      schedule: [],
      currentCycle: 0,
    });

    // Process cycles
    while (heap.length > 0) {
      cycleNum++;
      const temp: TaskFreq[] = [];
      let cycle = n + 1;

      allSteps.push({
        type: "cycle-start",
        message: `Cycle ${cycleNum}: Process up to ${n + 1} tasks (cooldown = ${n})`,
        heap: JSON.parse(JSON.stringify(heap)),
        schedule: [...schedule],
        currentCycle: cycleNum,
      });

      // Execute tasks in this cycle
      while (cycle > 0 && heap.length > 0) {
        heap.sort((a, b) => b.count - a.count);
        const current = heap.shift()!;
        const timeSlot = schedule.length + 1;

        schedule.push({ task: current.task, time: timeSlot });

        allSteps.push({
          type: "execute",
          message: `Execute ${current.task} (count ${current.count} → ${current.count - 1}). Time slot ${timeSlot}.`,
          heap: JSON.parse(JSON.stringify(heap)),
          schedule: [...schedule],
          currentCycle: cycleNum,
          highlightTask: current.task,
          highlightSlot: timeSlot - 1,
        });

        if (current.count > 1) {
          temp.push({ ...current, count: current.count - 1 });
        }
        cycle--;
      }

      // Add idle slots if needed
      while (cycle > 0 && temp.length > 0) {
        const timeSlot = schedule.length + 1;
        schedule.push({ task: null, time: timeSlot });

        allSteps.push({
          type: "idle",
          message: `Idle at time slot ${timeSlot}. Waiting for cooldown.`,
          heap: JSON.parse(JSON.stringify(heap)),
          schedule: [...schedule],
          currentCycle: cycleNum,
          highlightSlot: timeSlot - 1,
        });
        cycle--;
      }

      // Put tasks back
      heap.push(...temp);
      heap.sort((a, b) => b.count - a.count);

      if (heap.length > 0) {
        allSteps.push({
          type: "cycle-end",
          message: `Cycle ${cycleNum} complete. Remaining tasks: ${heap.map((h) => `${h.task}=${h.count}`).join(", ")}`,
          heap: JSON.parse(JSON.stringify(heap)),
          schedule: [...schedule],
          currentCycle: cycleNum,
        });
      }
    }

    // Done
    allSteps.push({
      type: "done",
      message: `Done! Total time: ${schedule.length} units. Schedule: ${schedule.map((s) => s.task || "idle").join(" → ")}`,
      heap: [],
      schedule: [...schedule],
      currentCycle: cycleNum,
    });

    return allSteps;
  }, [tasks, n]);

  const reset = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setStepIndex(0);
    setIsPlaying(false);
  }, []);

  const advanceStep = useCallback(() => {
    setStepIndex((prev) => {
      const next = prev + 1;
      if (next >= steps.length - 1) {
        setIsPlaying(false);
        return steps.length - 1;
      }
      return next;
    });
  }, [steps.length]);

  React.useEffect(() => {
    if (isPlaying && stepIndex < steps.length - 1) {
      timerRef.current = setTimeout(advanceStep, speed);
      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }
  }, [isPlaying, stepIndex, steps.length, speed, advanceStep]);

  const currentStep = steps[stepIndex];

  return (
    <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">Task Scheduler</h3>
        <p className="text-gray-400 text-sm mt-1">
          Schedule tasks with cooldown using a max-heap greedy approach.
        </p>
      </div>

      <div className="p-4">
        {/* Problem setup */}
        <div className="flex flex-wrap items-center gap-4 mb-4 p-3 bg-teal-500/10 rounded-md border border-teal-500/20">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Tasks:</span>
            <div className="flex gap-1">
              {tasks.map((task, idx) => (
                <span
                  key={idx}
                  className={`px-2 py-0.5 rounded text-xs font-bold text-white ${TASK_COLORS[task]}`}
                >
                  {task}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-gray-800 rounded-md px-3 py-1">
            <span className="text-gray-400 text-sm">Cooldown n = </span>
            <span className="text-lg font-bold text-teal-400">{n}</span>
          </div>
          <div className="text-xs text-gray-400">
            Same task must wait {n} slots before running again
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={currentStep.type === "done"}
            className={`px-4 py-2 rounded-md font-medium transition ${
              isPlaying ? "bg-yellow-500 text-black" : "bg-green-500 text-white"
            } disabled:opacity-50`}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            onClick={() =>
              setStepIndex(Math.min(stepIndex + 1, steps.length - 1))
            }
            disabled={stepIndex >= steps.length - 1}
            className="px-4 py-2 bg-gray-700 text-white rounded-md font-medium hover:bg-gray-600 disabled:opacity-50"
          >
            Step
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
              min="300"
              max="1500"
              step="100"
              value={1800 - speed}
              onChange={(e) => setSpeed(1800 - Number(e.target.value))}
              className="w-20 accent-teal-500"
            />
          </div>
        </div>

        {/* Main visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Max-Heap */}
          <div className="bg-gray-800/50 rounded-md p-4">
            <div className="text-sm text-gray-400 mb-3">
              Max-Heap (by frequency):
            </div>
            <div className="min-h-[80px]">
              {currentStep.heap.length === 0 ? (
                <div className="text-gray-500 text-center py-4">
                  {currentStep.type === "done"
                    ? "All tasks completed!"
                    : "Heap empty"}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {currentStep.heap.map((item, idx) => (
                    <motion.div
                      key={`${item.task}-${idx}`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{
                        scale:
                          currentStep.highlightTask === item.task ? 1.1 : 1,
                        opacity: 1,
                      }}
                      className={`px-3 py-2 rounded-md font-bold text-white ${item.color} ${
                        idx === 0 ? "ring-2 ring-white/50" : ""
                      }`}
                    >
                      {item.task}
                      <span className="text-xs opacity-80 ml-1">
                        ×{item.count}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
            {currentStep.heap.length > 0 && (
              <div className="text-xs text-gray-500 mt-2">
                First element (most frequent) executes next
              </div>
            )}
          </div>

          {/* Schedule Timeline */}
          <div className="bg-gray-800/50 rounded-md p-4">
            <div className="text-sm text-gray-400 mb-3">Schedule Timeline:</div>
            <div className="min-h-[80px]">
              {currentStep.schedule.length === 0 ? (
                <div className="text-gray-500 text-center py-4">
                  Schedule will appear here
                </div>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {currentStep.schedule.map((slot, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{
                        scale: currentStep.highlightSlot === idx ? 1.15 : 1,
                        opacity: 1,
                      }}
                      className={`w-10 h-10 rounded flex flex-col items-center justify-center text-xs font-bold ${
                        slot.task
                          ? `${TASK_COLORS[slot.task]} text-white`
                          : "bg-gray-600 text-gray-400"
                      } ${currentStep.highlightSlot === idx ? "ring-2 ring-yellow-400" : ""}`}
                    >
                      <span>{slot.task || "idle"}</span>
                      <span className="text-[10px] opacity-70">
                        {slot.time}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-2xl font-bold text-teal-400">
              {currentStep.currentCycle}
            </div>
            <div className="text-xs text-gray-500">Current Cycle</div>
          </div>
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {currentStep.schedule.length}
            </div>
            <div className="text-xs text-gray-500">Time Units</div>
          </div>
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-2xl font-bold text-orange-400">
              {currentStep.schedule.filter((s) => !s.task).length}
            </div>
            <div className="text-xs text-gray-500">Idle Slots</div>
          </div>
        </div>

        {/* Message */}
        <AnimatePresence mode="wait">
          <motion.div
            key={stepIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-3 rounded-md text-sm ${
              currentStep.type === "done"
                ? "bg-green-500/10 border border-green-500/30 text-green-400"
                : currentStep.type === "execute"
                  ? "bg-blue-500/10 border border-blue-500/30 text-blue-400"
                  : currentStep.type === "idle"
                    ? "bg-gray-700 border border-gray-600 text-gray-400"
                    : currentStep.type === "cycle-start"
                      ? "bg-teal-500/10 border border-teal-500/30 text-teal-400"
                      : "bg-gray-800 text-gray-300"
            }`}
          >
            {currentStep.message}
          </motion.div>
        </AnimatePresence>

        {/* Explanation */}
        <div className="mt-4 p-3 bg-gray-800/30 rounded-md text-sm text-gray-400 space-y-2">
          <p>
            <strong className="text-teal-400">Why Max-Heap?</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>
              Most frequent tasks are the bottleneck, they need the most gaps.
            </li>
            <li>
              By always executing the most frequent available task, we spread
              them out optimally.
            </li>
            <li>Each cycle of (n+1) slots ensures cooldown is respected.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
