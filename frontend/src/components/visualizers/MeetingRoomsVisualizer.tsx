"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useReducer,
  startTransition,
} from "react";
import { motion } from "framer-motion";

interface Meeting {
  start: number;
  end: number;
  id: number;
  room?: number;
}

interface Event {
  time: number;
  type: "start" | "end";
  meetingId: number;
}

const initialMeetings: Meeting[] = [
  { start: 0, end: 30, id: 0 },
  { start: 5, end: 10, id: 1 },
  { start: 15, end: 20, id: 2 },
];

const ROOM_COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-pink-500",
];

type PlayState = { step: number; isPlaying: boolean };
type PlayAction =
  | { type: "TOGGLE" }
  | { type: "STOP" }
  | { type: "ADVANCE" }
  | { type: "RESET" };

function playReducer(state: PlayState, action: PlayAction): PlayState {
  switch (action.type) {
    case "TOGGLE":
      return { ...state, isPlaying: !state.isPlaying };
    case "STOP":
      return { ...state, isPlaying: false };
    case "ADVANCE":
      return { ...state, step: state.step + 1 };
    case "RESET":
      return { step: 0, isPlaying: false };
    default:
      return state;
  }
}

// skipcq: JS-0067
// skipcq: JS-R1005
// Reason: The component intentionally owns all state for a small playback demo.
export default function MeetingRoomsVisualizer() {
  const [{ isPlaying }, dispatch] = useReducer(playReducer, {
    step: 0,
    isPlaying: false,
  });
  const [speed, setSpeed] = useState(800);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [currentEventIdx, setCurrentEventIdx] = useState(0);
  const [activeRooms, setActiveRooms] = useState(0);
  const [maxRooms, setMaxRooms] = useState(0);
  const [roomsTimeline, setRoomsTimeline] = useState<
    { time: number; rooms: number }[]
  >([]);
  const [phase, setPhase] = useState<
    "init" | "creating-events" | "sweeping" | "done"
  >("init");
  const [message, setMessage] = useState(
    "Click Play to find minimum meeting rooms"
  );

  const reset = useCallback(() => {
    setMeetings(initialMeetings);
    setEvents([]);
    setCurrentEventIdx(0);
    setActiveRooms(0);
    setMaxRooms(0);
    setRoomsTimeline([]);
    setPhase("init");
    setMessage("Click Play to find minimum meeting rooms using Line Sweep");
    dispatch({ type: "STOP" });
  }, []);

  useEffect(() => {
    startTransition(() => {
      reset();
    });
  }, [reset]);

  // skipcq: JS-R1005
  // Reason: Branches map to line-sweep setup and sweep playback phases.
  const performStep = useCallback(() => {
    if (phase === "init") {
      setPhase("creating-events");
      setMessage("Step 1: Create events - starts (+1) and ends (-1)");
    } else if (phase === "creating-events") {
      // Create and sort events
      const evts: Event[] = [];
      for (const meeting of initialMeetings) {
        evts.push({
          time: meeting.start,
          type: "start",
          meetingId: meeting.id,
        });
        evts.push({ time: meeting.end, type: "end", meetingId: meeting.id });
      }
      // Sort by time; if same time, ends before starts
      evts.sort((a, b) => {
        if (a.time !== b.time) return a.time - b.time;
        return a.type === "end" ? -1 : 1;
      });
      setEvents(evts);
      setPhase("sweeping");
      setMessage(`Created ${evts.length} events. Now sweep through time...`);
    } else if (phase === "sweeping") {
      if (currentEventIdx >= events.length) {
        setPhase("done");
        setMessage(
          `Done! Maximum concurrent meetings: ${maxRooms} rooms needed`
        );
        dispatch({ type: "STOP" });
        return;
      }

      const event = events[currentEventIdx];
      let newRooms = activeRooms;

      if (event.type === "start") {
        newRooms = activeRooms + 1;
        setMessage(
          `Time ${event.time}: Meeting ${event.meetingId + 1} STARTS → rooms: ${activeRooms} + 1 = ${newRooms}`
        );
      } else {
        newRooms = activeRooms - 1;
        setMessage(
          `Time ${event.time}: Meeting ${event.meetingId + 1} ENDS → rooms: ${activeRooms} - 1 = ${newRooms}`
        );
      }

      setActiveRooms(newRooms);
      setRoomsTimeline([
        ...roomsTimeline,
        { time: event.time, rooms: newRooms },
      ]);

      if (newRooms > maxRooms) {
        setMaxRooms(newRooms);
      }

      setCurrentEventIdx(currentEventIdx + 1);
    }
  }, [phase, currentEventIdx, events, activeRooms, maxRooms, roomsTimeline]);

  useEffect(() => {
    if (!isPlaying || phase === "done") return undefined;

    const timer = setTimeout(performStep, speed);
    return () => clearTimeout(timer);
  }, [isPlaying, phase, speed, performStep]);

  const maxTime = Math.max(...initialMeetings.map((m) => m.end));

  return (
    <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">Meeting Rooms II</h3>
        <p className="text-gray-400 text-sm mt-1">
          Line Sweep: Count concurrent meetings with +1/-1 events
        </p>
      </div>

      <div className="p-4">
        {/* Controls */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => dispatch({ type: "TOGGLE" })}
            disabled={phase === "done"}
            className={`px-4 py-2 rounded-md font-medium transition ${
              isPlaying ? "bg-yellow-500 text-black" : "bg-green-500 text-white"
            } disabled:opacity-50`}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            onClick={() => {
              if (!isPlaying && phase !== "done") {
                performStep();
              }
            }}
            disabled={isPlaying || phase === "done"}
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
              max="1500"
              step="100"
              value={1900 - speed}
              onChange={(e) => setSpeed(1900 - Number(e.target.value))}
              className="w-20 accent-indigo-500"
            />
          </div>
        </div>

        {/* Meetings timeline */}
        <div className="mb-6">
          <div className="text-sm text-gray-400 mb-2">Meetings:</div>
          <div className="relative bg-gray-800/50 rounded-md p-4 h-32 overflow-hidden">
            {/* Timeline axis */}
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
            {meetings.map((meeting, idx) => (
              <motion.div
                key={meeting.id}
                className={`absolute h-6 rounded-md ${ROOM_COLORS[idx % ROOM_COLORS.length]} flex items-center justify-center text-white text-xs font-bold shadow-lg`}
                style={{
                  left: `${(meeting.start / maxTime) * 100}%`,
                  width: `${((meeting.end - meeting.start) / maxTime) * 100}%`,
                  top: `${12 + idx * 28}px`,
                }}
              >
                Meeting {meeting.id + 1}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Events list */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">
            Events (sorted by time):
          </div>
          <div className="flex flex-wrap gap-2">
            {events.map((event, idx) => (
              <motion.div
                key={`event-${event.time}-${event.type}-${event.meetingId}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  scale: idx === currentEventIdx ? 1.1 : 1,
                }}
                className={`px-3 py-2 rounded-md text-sm font-mono ${
                  idx < currentEventIdx
                    ? "bg-gray-700 text-gray-400"
                    : idx === currentEventIdx
                      ? "bg-yellow-500 text-black ring-2 ring-yellow-300"
                      : "bg-gray-800 text-gray-300"
                }`}
              >
                ({event.time}, {event.type === "start" ? "+1" : "-1"})
              </motion.div>
            ))}
            {events.length === 0 && (
              <span className="text-gray-500">Events will be created...</span>
            )}
          </div>
        </div>

        {/* Room counter visualization */}
        <div className="mb-4 p-4 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 rounded-md border border-indigo-500/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500">Current Active Rooms</div>
              <div className="text-4xl font-bold text-indigo-400">
                {activeRooms}
              </div>
            </div>
            <div className="flex gap-2">
              {Array.from({ length: maxRooms }, (_, i) => (
                <motion.div
                  key={`room-${i + 1}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: i < activeRooms ? 1 : 0.5 }}
                  className={`w-8 h-8 rounded-md flex items-center justify-center font-bold text-white ${
                    i < activeRooms
                      ? ROOM_COLORS[i % ROOM_COLORS.length]
                      : "bg-gray-700"
                  }`}
                >
                  {i + 1}
                </motion.div>
              ))}
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Max Rooms Needed</div>
              <div className="text-4xl font-bold text-green-400">
                {maxRooms}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-2xl font-bold text-indigo-400">
              {meetings.length}
            </div>
            <div className="text-xs text-gray-500">Meetings</div>
          </div>
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {events.length}
            </div>
            <div className="text-xs text-gray-500">Events</div>
          </div>
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {currentEventIdx}/{events.length}
            </div>
            <div className="text-xs text-gray-500">Processed</div>
          </div>
        </div>

        {/* Message */}
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-md text-sm ${
            phase === "done"
              ? "bg-green-500/10 border border-green-500/30 text-green-400"
              : "bg-gray-800 text-gray-300"
          }`}
        >
          {message}
        </motion.div>

        {/* Algorithm explanation */}
        <div className="mt-4 p-3 bg-gray-800/30 rounded-md text-sm text-gray-400">
          <p>
            <strong className="text-indigo-400">Key Insight:</strong> Treat each
            start as +1, each end as -1. Sort events by time (ends before starts
            at same time). Sweep through and track max concurrent meetings.
          </p>
        </div>
      </div>
    </div>
  );
}
