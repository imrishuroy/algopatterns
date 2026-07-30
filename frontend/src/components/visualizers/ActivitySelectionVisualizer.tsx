"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Activity {
  id: number;
  start: number;
  end: number;
  name: string;
  color: string;
}

interface ActivitySelectionVisualizerProps {
  // "activity" = Activity Selection framing (maximize selections)
  // "intervals" = Non-Overlapping Intervals framing (minimize removals)
  mode?: "activity" | "intervals";
}

// skipcq: JS-0067
// skipcq: JS-R1005
// Reason: This visualizer coordinates playback, selection state, and timeline rendering.
export default function ActivitySelectionVisualizer({
  mode = "activity",
}: ActivitySelectionVisualizerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [selectedActivities, setSelectedActivities] = useState<Set<number>>(
    new Set()
  );
  const [currentActivity, setCurrentActivity] = useState<number | null>(null);
  const [lastEnd, setLastEnd] = useState(0);
  const [phase, setPhase] = useState<
    "unsorted" | "sorting" | "sorted" | "selecting"
  >("unsorted");

  const originalActivities: Activity[] = [
    { id: 0, start: 1, end: 4, name: "A", color: "#ef4444" },
    { id: 1, start: 3, end: 5, name: "B", color: "#f97316" },
    { id: 2, start: 0, end: 6, name: "C", color: "#eab308" },
    { id: 3, start: 5, end: 7, name: "D", color: "#22c55e" },
    { id: 4, start: 3, end: 9, name: "E", color: "#3b82f6" },
    { id: 5, start: 5, end: 9, name: "F", color: "#8b5cf6" },
    { id: 6, start: 6, end: 10, name: "G", color: "#ec4899" },
    { id: 7, start: 8, end: 11, name: "H", color: "#06b6d4" },
  ];

  const sortedActivities = [...originalActivities].sort(
    (a, b) => a.end - b.end
  );

  const [activities, setActivities] = useState(originalActivities);
  const initialMessage =
    mode === "intervals"
      ? "Intervals shown in original order. Click Play to find minimum removals!"
      : "Activities shown in original order. Click Play to start!";
  const [message, setMessage] = useState(initialMessage);

  const timelineMax = 12;
  const timelineTicks = Array.from(
    { length: timelineMax + 1 },
    (_, tick) => tick
  );

  const isDone =
    phase === "selecting" && (currentActivity ?? 0) >= sortedActivities.length;

  // skipcq: JS-R1005
  // Reason: Each branch maps directly to one visible visualizer phase.
  const performStep = useCallback(() => {
    const itemLabel = mode === "intervals" ? "intervals" : "activities";
    const keepLabel = mode === "intervals" ? "Kept" : "Selected";
    const skipLabel = mode === "intervals" ? "Removed" : "Skipped";

    if (phase === "unsorted") {
      setPhase("sorting");
      setMessage("Sorting by END time (the greedy insight!)");
    } else if (phase === "sorting") {
      setActivities(sortedActivities);
      setPhase("sorted");
      setMessage(`Sorted! Now selecting ${itemLabel} greedily...`);
    } else if (phase === "sorted") {
      setPhase("selecting");
      setCurrentActivity(0);
    } else if (phase === "selecting") {
      const sortedActs = sortedActivities;
      const currentIdx = currentActivity ?? 0;

      if (currentIdx >= sortedActs.length) {
        setIsPlaying(false);
        const total = sortedActs.length;
        const kept = selectedActivities.size;
        const removed = total - kept;
        if (mode === "intervals") {
          setMessage(
            `Done! Kept ${kept} non-overlapping intervals. Remove ${removed} interval${removed !== 1 ? "s" : ""}.`
          );
        } else {
          setMessage(`Done! Selected ${kept} non-overlapping activities.`);
        }
        return;
      }

      const act = sortedActs[currentIdx];

      if (act.start >= lastEnd) {
        setSelectedActivities((prev) => new Set([...prev, act.id]));
        setLastEnd(act.end);
        setMessage(
          `${keepLabel} ${act.name} (ends at ${act.end}). Last end = ${act.end}`
        );
      } else {
        setMessage(
          `${skipLabel} ${act.name} (starts at ${act.start} < lastEnd ${lastEnd})`
        );
      }

      setCurrentActivity(currentIdx + 1);
    }
  }, [
    phase,
    currentActivity,
    lastEnd,
    selectedActivities.size,
    sortedActivities,
    mode,
  ]);

  useEffect(() => {
    if (!isPlaying || isDone) return undefined;

    const timer = setTimeout(performStep, speed);
    return () => clearTimeout(timer);
  }, [isPlaying, isDone, speed, performStep]);

  const reset = () => {
    setIsPlaying(false);
    setPhase("unsorted");
    setActivities(originalActivities);
    setSelectedActivities(new Set());
    setCurrentActivity(null);
    setLastEnd(0);
    setMessage(initialMessage);
  };

  const getActivityStyle = (act: Activity) => {
    const isSelected = selectedActivities.has(act.id);
    const isCurrent =
      phase === "selecting" &&
      sortedActivities[currentActivity ?? -1]?.id === act.id;
    const isSkipped =
      phase === "selecting" &&
      currentActivity !== null &&
      sortedActivities.slice(0, currentActivity).some((a) => a.id === act.id) &&
      !selectedActivities.has(act.id);

    if (isCurrent)
      return "ring-4 ring-yellow-400 ring-offset-2 ring-offset-gray-900";
    if (isSelected) return "ring-2 ring-green-400";
    if (isSkipped) return "opacity-40";
    return "";
  };

  // Mode-specific labels
  const title =
    mode === "intervals"
      ? "Non-Overlapping Intervals Visualizer"
      : "Activity Selection Visualizer";

  const description =
    mode === "intervals"
      ? "Find minimum intervals to remove by keeping maximum non-overlapping ones"
      : "Watch how we pick the most activities by always choosing the one that ends first";

  const gradientFrom =
    mode === "intervals" ? "from-orange-500/10" : "from-green-500/10";
  const gradientTo =
    mode === "intervals" ? "to-amber-500/10" : "to-emerald-500/10";

  return (
    <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
      <div
        className={`p-4 bg-gradient-to-r ${gradientFrom} ${gradientTo} border-b border-gray-800`}
      >
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-gray-400 text-sm mt-1">{description}</p>
      </div>

      <div className="p-4">
        {/* Controls */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={isDone}
            className={`px-4 py-2 rounded-md font-medium transition ${
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
              className="w-20 accent-green-500"
            />
          </div>
        </div>

        {/* Phase Indicator */}
        <div className="flex gap-2 mb-4">
          {["unsorted", "sorting", "sorted", "selecting"].map((p, i) => (
            <div
              key={`p-${p}`}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm ${
                phase === p
                  ? "bg-green-500/20 border border-green-500 text-green-400"
                  : i <
                      ["unsorted", "sorting", "sorted", "selecting"].indexOf(
                        phase
                      )
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-800 text-gray-500"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                  phase === p ? "bg-green-500 text-white" : "bg-gray-600"
                }`}
              >
                {i + 1}
              </span>
              {p === "unsorted"
                ? "Original"
                : p === "sorting"
                  ? "Sort"
                  : p === "sorted"
                    ? "Ready"
                    : "Select"}
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-2 px-2">
            {timelineTicks.map((tick) => (
              <span key={`timeline-label-${tick}`}>{tick}</span>
            ))}
          </div>
          <div className="relative h-64 bg-gray-800/50 rounded-md overflow-hidden">
            {/* Time grid lines */}
            {timelineTicks.map((tick) => (
              <div
                key={`grid-line-${tick}`}
                className="absolute top-0 bottom-0 border-l border-gray-700/50"
                style={{ left: `${(tick / timelineMax) * 100}%` }}
              />
            ))}

            {/* Last end marker */}
            {phase === "selecting" && lastEnd > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  left: `${(lastEnd / timelineMax) * 100}%`,
                }}
                className="absolute top-0 bottom-0 border-l-2 border-green-500 border-dashed z-10"
              >
                <div className="absolute -top-6 -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-md">
                  lastEnd={lastEnd}
                </div>
              </motion.div>
            )}

            {/* Activities */}
            <AnimatePresence>
              {activities.map((act, idx) => {
                const width = ((act.end - act.start) / timelineMax) * 100;
                const left = (act.start / timelineMax) * 100;
                const top = 8 + idx * 28;

                return (
                  <motion.div
                    key={act.id}
                    layout
                    initial={{ opacity: 0, y: -20 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      left: `${left}%`,
                      top: `${top}px`,
                      width: `${width}%`,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className={`absolute h-6 rounded-md flex items-center justify-center text-white text-xs font-bold transition-all ${getActivityStyle(act)}`}
                    style={{ backgroundColor: act.color }}
                  >
                    {act.name} ({act.start}-{act.end})
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Message */}
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-md mb-4 ${
            message.includes("Selected")
              ? "bg-green-500/10 border border-green-500/30 text-green-400"
              : message.includes("Skipped")
                ? "bg-red-500/10 border border-red-500/30 text-red-400"
                : message.includes("Sorting")
                  ? "bg-yellow-500/10 border border-yellow-500/30 text-yellow-400"
                  : "bg-gray-800 text-gray-300"
          }`}
        >
          {message}
        </motion.div>

        {/* Stats */}
        <div
          className={`grid ${mode === "intervals" ? "grid-cols-4" : "grid-cols-3"} gap-3`}
        >
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-2xl font-bold text-white">
              {activities.length}
            </div>
            <div className="text-xs text-gray-500">
              {mode === "intervals" ? "Total Intervals" : "Total Activities"}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-2xl font-bold text-green-400">
              {selectedActivities.size}
            </div>
            <div className="text-xs text-gray-500">
              {mode === "intervals" ? "Kept" : "Selected"}
            </div>
          </div>
          {mode === "intervals" && (
            <div className="bg-gray-800/50 rounded-md p-3 text-center">
              <div className="text-2xl font-bold text-orange-400">
                {activities.length - selectedActivities.size}
              </div>
              <div className="text-xs text-gray-500">To Remove</div>
            </div>
          )}
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-2xl font-bold text-gray-400">
              {phase === "selecting" ? (currentActivity ?? 0) : 0}/
              {activities.length}
            </div>
            <div className="text-xs text-gray-500">Processed</div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-yellow-500" />
            <span className="text-gray-400">Current</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-green-500/50 ring-2 ring-green-400" />
            <span className="text-gray-400">
              {mode === "intervals" ? "Kept" : "Selected"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-gray-600 opacity-40" />
            <span className="text-gray-400">
              {mode === "intervals" ? "Removed" : "Skipped"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
