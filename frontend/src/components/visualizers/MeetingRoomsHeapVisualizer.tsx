"use client";

import React, { useState, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface HeapItem {
  endTime: number;
  meetingId: number;
}

interface Step {
  type: "init" | "sort" | "allocate" | "reuse" | "push" | "done";
  heap: HeapItem[];
  processedIdx: number;
  assignedRooms: number;
  action: "allocating" | "reusing" | "checking" | "idle";
  message: string;
}

interface Meeting {
  start: number;
  end: number;
  id: number;
}

const INITIAL_MEETINGS: Meeting[] = [
  { start: 0, end: 30, id: 0 },
  { start: 5, end: 10, id: 1 },
  { start: 15, end: 20, id: 2 },
  { start: 20, end: 35, id: 3 },
  { start: 25, end: 40, id: 4 },
  { start: 35, end: 50, id: 5 },
];

const ROOM_COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-pink-500",
];

const sortHeap = (h: HeapItem[]) =>
  [...h].sort((a, b) => a.endTime - b.endTime);

// skipcq: JS-0067
export default function MeetingRoomsHeapVisualizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(900);
  const [stepIndex, setStepIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const sortedMeetings = useMemo(
    () => [...INITIAL_MEETINGS].sort((a, b) => a.start - b.start),
    []
  );

  const maxTime =
    INITIAL_MEETINGS.length > 0
      ? Math.max(...INITIAL_MEETINGS.map((m) => m.end))
      : 1;

  const steps = useMemo(() => {
    const allSteps: Step[] = [];
    const heap: HeapItem[] = [];
    let assignedRooms = 0;

    allSteps.push({
      type: "init",
      heap: [],
      processedIdx: -1,
      assignedRooms: 0,
      action: "idle",
      message:
        "Click Play or Step to find minimum meeting rooms using a min-heap of end times",
    });

    allSteps.push({
      type: "sort",
      heap: [],
      processedIdx: -1,
      assignedRooms: 0,
      action: "idle",
      message: `Sort meetings by start time: [${sortedMeetings
        .map((m) => `[${m.start}, ${m.end}]`)
        .join(", ")}]`,
    });

    sortedMeetings.forEach((meeting, idx) => {
      const canReuse = heap.length > 0 && heap[0].endTime <= meeting.start;

      if (canReuse) {
        allSteps.push({
          type: "reuse",
          heap: [...heap],
          processedIdx: idx,
          assignedRooms,
          action: "checking",
          message: `Meeting [${meeting.start}, ${meeting.end}]: earliest end = ${heap[0].endTime}, start = ${meeting.start}. ${meeting.start} >= ${heap[0].endTime}, reuse room!`,
        });

        heap.shift();
        assignedRooms = Math.max(assignedRooms, heap.length + 1);

        allSteps.push({
          type: "push",
          heap: [
            ...sortHeap([
              ...heap,
              { endTime: meeting.end, meetingId: meeting.id },
            ]),
          ],
          processedIdx: idx,
          assignedRooms,
          action: "reusing",
          message: `Popped earliest end, pushed ${meeting.end}. Room reused, heap size stays ${heap.length + 1}.`,
        });

        heap.push({ endTime: meeting.end, meetingId: meeting.id });
        heap.sort((a, b) => a.endTime - b.endTime);
      } else {
        allSteps.push({
          type: "allocate",
          heap: [...heap],
          processedIdx: idx,
          assignedRooms,
          action: "checking",
          message:
            heap.length === 0
              ? `Meeting [${meeting.start}, ${meeting.end}]: heap is empty, allocate new room`
              : `Meeting [${meeting.start}, ${meeting.end}]: earliest end = ${heap[0].endTime}, start = ${meeting.start}. ${meeting.start} < ${heap[0].endTime}, no room free yet`,
        });

        heap.push({ endTime: meeting.end, meetingId: meeting.id });
        heap.sort((a, b) => a.endTime - b.endTime);
        assignedRooms = Math.max(assignedRooms, heap.length);

        allSteps.push({
          type: "push",
          heap: [...heap],
          processedIdx: idx,
          assignedRooms,
          action: "allocating",
          message: `Push end time ${meeting.end}. Heap now has ${heap.length} room${heap.length === 1 ? "" : "s"} in use.`,
        });
      }
    });

    allSteps.push({
      type: "done",
      heap: [...heap],
      processedIdx: sortedMeetings.length - 1,
      assignedRooms,
      action: "idle",
      message: `Done! Minimum rooms needed = peak heap size = ${assignedRooms}`,
    });

    return allSteps;
  }, [sortedMeetings]);

  const reset = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setStepIndex(0);
    setIsPlaying(false);
  }, []);

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  }, [isPlaying]);

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
      <div className="p-4 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">
          Meeting Rooms II (Min-Heap)
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          6 meetings, 3 rooms needed. Watch reuse (blue) vs new room (amber).
        </p>
      </div>

      <div className="p-4">
        {/* Controls */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={handlePlayPause}
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
              min="400"
              max="1800"
              step="100"
              value={2200 - speed}
              onChange={(e) => setSpeed(2200 - Number(e.target.value))}
              className="w-20 accent-indigo-500"
            />
          </div>
          <span className="text-gray-500 text-xs ml-2">
            Step {stepIndex + 1}/{steps.length}
          </span>
        </div>

        {/* Meetings timeline */}
        <div className="mb-6">
          <div className="text-sm text-gray-400 mb-2">
            Meetings (sorted by start, processed in order):
          </div>
          <div className="relative bg-gray-800/50 rounded-md p-4 pt-6 min-h-[240px]">
            {/* Time axis */}
            <div className="absolute bottom-4 left-4 right-4 h-0.5 bg-gray-600">
              {Array.from({ length: Math.ceil(maxTime / 5) + 1 }, (_, i) => (
                <div
                  key={`time-${i * 5}`}
                  className="absolute bottom-0 w-0.5 h-2 bg-gray-600"
                  style={{ left: `${((i * 5) / maxTime) * 100}%` }}
                >
                  <span className="absolute top-3 -translate-x-1/2 text-xs text-gray-500">
                    {i * 5}
                  </span>
                </div>
              ))}
            </div>

            {/* Meeting bars */}
            {sortedMeetings.map((meeting, idx) => {
              const isProcessed = idx <= currentStep.processedIdx;
              const isCurrent = idx === currentStep.processedIdx;
              const colorIdx = idx % ROOM_COLORS.length;
              return (
                <motion.div
                  key={meeting.id}
                  animate={{
                    opacity: isProcessed ? 1 : 0.35,
                    scale: isCurrent ? 1.03 : 1,
                  }}
                  className={`absolute h-7 rounded-md ${ROOM_COLORS[colorIdx]} flex items-center justify-center text-white text-xs font-bold shadow-lg overflow-hidden px-1 ${
                    isCurrent ? "ring-2 ring-white/60" : ""
                  }`}
                  style={{
                    left: `${(meeting.start / maxTime) * 100}%`,
                    width: `${((meeting.end - meeting.start) / maxTime) * 100}%`,
                    top: `${8 + idx * 32}px`,
                  }}
                >
                  <span className="truncate">
                    M{meeting.id + 1} ({meeting.start}-{meeting.end})
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Min-Heap */}
        <div className="mb-6">
          <div className="text-sm text-gray-400 mb-2">
            Min-Heap of end times (root = earliest ending meeting):
          </div>
          <div className="bg-gray-800/50 rounded-md p-4 pt-10 min-h-[140px]">
            {currentStep.heap.length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-4">
                Heap is empty
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <AnimatePresence mode="popLayout">
                  {/* Root */}
                  <motion.div
                    key={`root-${currentStep.heap[0].meetingId}-${currentStep.heap[0].endTime}`}
                    initial={{ scale: 0, y: -10 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0, y: -10 }}
                    className="flex flex-col items-center"
                  >
                    <span className="text-xs text-amber-400 font-semibold mb-1 whitespace-nowrap">
                      min (earliest end)
                    </span>
                    <div className="w-16 h-16 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {currentStep.heap[0].endTime}
                    </div>
                  </motion.div>

                  {/* Level 2 */}
                  {currentStep.heap.length > 1 && (
                    <div className="flex gap-8 mt-5">
                      {currentStep.heap.slice(1, 3).map((item) => (
                        <motion.div
                          key={`l2-${item.meetingId}-${item.endTime}`}
                          initial={{ scale: 0, y: -10 }}
                          animate={{ scale: 1, y: 0 }}
                          className="flex flex-col items-center gap-1"
                        >
                          <span className="text-xs text-gray-500">
                            M{item.meetingId + 1}
                          </span>
                          <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold shadow">
                            {item.endTime}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Level 3 */}
                  {currentStep.heap.length > 3 && (
                    <div className="flex gap-4 mt-4">
                      {currentStep.heap.slice(3, 7).map((item) => (
                        <motion.div
                          key={`l3-${item.meetingId}-${item.endTime}`}
                          initial={{ scale: 0, y: -10 }}
                          animate={{ scale: 1, y: 0 }}
                          className="flex flex-col items-center gap-1"
                        >
                          <span className="text-xs text-gray-500">
                            M{item.meetingId + 1}
                          </span>
                          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white text-sm font-bold">
                            {item.endTime}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Extra (linear fallback) */}
                  {currentStep.heap.length > 7 && (
                    <div className="flex gap-2 mt-3">
                      {currentStep.heap.slice(7).map((item) => (
                        <motion.div
                          key={`lx-${item.meetingId}-${item.endTime}`}
                          initial={{ scale: 0, y: -10 }}
                          animate={{ scale: 1, y: 0 }}
                          className="flex flex-col items-center gap-1"
                        >
                          <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-white text-xs font-bold border border-gray-600">
                            {item.endTime}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Counters */}
        <div className="mb-4 p-4 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 rounded-md border border-indigo-500/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500">Heap size now</div>
              <div className="text-4xl font-bold text-indigo-400">
                {currentStep.heap.length}
              </div>
            </div>
            <div className="flex gap-2">
              {Array.from(
                { length: Math.max(currentStep.assignedRooms, 1) },
                (_, i) => (
                  <motion.div
                    key={`room-pill-${i}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: i < currentStep.heap.length ? 1 : 0.4 }}
                    className={`w-9 h-9 rounded-md flex items-center justify-center font-bold text-white text-sm ${
                      i < currentStep.heap.length
                        ? ROOM_COLORS[i % ROOM_COLORS.length]
                        : "bg-gray-700"
                    }`}
                  >
                    {i + 1}
                  </motion.div>
                )
              )}
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Max rooms needed</div>
              <div className="text-4xl font-bold text-green-400">
                {currentStep.assignedRooms}
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        <motion.div
          key={currentStep.message}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-md text-sm ${
            currentStep.type === "done"
              ? "bg-green-500/10 border border-green-500/30 text-green-400"
              : currentStep.action === "reusing"
                ? "bg-blue-500/10 border border-blue-500/30 text-blue-300"
                : currentStep.action === "allocating"
                  ? "bg-amber-500/10 border border-amber-500/30 text-amber-300"
                  : "bg-gray-800 text-gray-300"
          }`}
        >
          {currentStep.message}
        </motion.div>

        {/* Insight */}
        <div className="mt-4 p-3 bg-gray-800/30 rounded-md text-sm text-gray-400">
          <p>
            <strong className="text-indigo-400">Key Insight:</strong> The heap
            stores end times of ongoing meetings. If the current meeting starts
            on or after the earliest end (heap root), reuse that room. The peak
            heap size across all steps equals the minimum rooms needed.
          </p>
        </div>
      </div>
    </div>
  );
}
