"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useReducer,
  startTransition,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Course {
  id: number;
  name: string;
  indegree: number;
  state: "waiting" | "ready" | "processing" | "completed";
}

interface Edge {
  from: number;
  to: number;
  active: boolean;
}

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
  }
}

const COURSE_NAMES = [
  "Intro CS",
  "Data Struct",
  "Algorithms",
  "Databases",
  "Web Dev",
  "ML",
];

const NORMAL_PREREQS: [number, number][] = [
  [0, 1],
  [0, 4],
  [1, 2],
  [1, 3],
  [2, 5],
  [3, 5],
];

const CYCLE_PREREQS: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 1],
];

// skipcq: JS-0067
export default function TopologicalSortVisualizer() {
  const [{ isPlaying }, dispatch] = useReducer(playReducer, {
    step: 0,
    isPlaying: false,
  });
  const [speed, setSpeed] = useState(800);
  const [courses, setCourses] = useState<Course[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [queue, setQueue] = useState<number[]>([]);
  const [order, setOrder] = useState<number[]>([]);
  const [, setCurrentCourse] = useState<number | null>(null);
  const [message, setMessage] = useState(
    "Click Play to start topological sort (Kahn's Algorithm)"
  );
  const [phase, setPhase] = useState<"init" | "processing" | "done" | "cycle">(
    "init"
  );
  const [showCycleExample, setShowCycleExample] = useState(false);

  const initGraph = useCallback(() => {
    const prereqs = showCycleExample ? CYCLE_PREREQS : NORMAL_PREREQS;
    const numCourses = showCycleExample ? 4 : 6;

    const newCourses: Course[] = Array.from({ length: numCourses }, (_, i) => ({
      id: i,
      name: COURSE_NAMES[i],
      indegree: 0,
      state: "waiting",
    }));

    const newEdges: Edge[] = prereqs.map(([from, to]) => ({
      from,
      to,
      active: true,
    }));

    for (const [, to] of prereqs) {
      newCourses[to].indegree++;
    }

    const readyQueue: number[] = [];
    for (const course of newCourses) {
      if (course.indegree === 0) {
        course.state = "ready";
        readyQueue.push(course.id);
      }
    }

    setCourses(newCourses);
    setEdges(newEdges);
    setQueue(readyQueue);
    setOrder([]);
    setCurrentCourse(null);
    setPhase("init");
    setMessage("Click Play to start topological sort (Kahn's Algorithm)");
    dispatch({ type: "STOP" });
  }, [showCycleExample]);

  useEffect(() => {
    startTransition(() => {
      initGraph();
    });
  }, [initGraph]);

  useEffect(() => {
    if (!isPlaying || courses.length === 0) return;

    const timer = setTimeout(() => {
      if (phase === "init" || phase === "processing") {
        if (queue.length === 0) {
          if (order.length === courses.length) {
            setPhase("done");
            setMessage(
              `Success! Valid order: ${order.map((i) => COURSE_NAMES[i]).join(" -> ")}`
            );
          } else {
            setPhase("cycle");
            setMessage("Cycle detected! Cannot complete all courses.");
          }
          dispatch({ type: "STOP" });
          return;
        }

        const courseId = queue[0];
        const newQueue = queue.slice(1);
        setCurrentCourse(courseId);

        const newCourses = [...courses];
        newCourses[courseId] = { ...newCourses[courseId], state: "processing" };
        setCourses(newCourses);
        setMessage(
          `Processing: ${COURSE_NAMES[courseId]} (indegree was 0, ready to take)`
        );

        setTimeout(() => {
          const updatedCourses = [...newCourses];
          updatedCourses[courseId] = {
            ...updatedCourses[courseId],
            state: "completed",
          };

          const newEdges = [...edges];
          const addToQueue: number[] = [];

          for (let i = 0; i < newEdges.length; i++) {
            if (newEdges[i].from === courseId && newEdges[i].active) {
              newEdges[i] = { ...newEdges[i], active: false };
              const neighbor = newEdges[i].to;
              updatedCourses[neighbor] = {
                ...updatedCourses[neighbor],
                indegree: updatedCourses[neighbor].indegree - 1,
              };
              if (
                updatedCourses[neighbor].indegree === 0 &&
                updatedCourses[neighbor].state === "waiting"
              ) {
                updatedCourses[neighbor] = {
                  ...updatedCourses[neighbor],
                  state: "ready",
                };
                addToQueue.push(neighbor);
              }
            }
          }

          setCourses(updatedCourses);
          setEdges(newEdges);
          setQueue([...newQueue, ...addToQueue]);
          setOrder([...order, courseId]);
          setCurrentCourse(null);
          setPhase("processing");
        }, speed / 2);
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [isPlaying, phase, queue, courses, edges, order, speed]);

  const getNodePosition = (id: number) => {
    if (showCycleExample) {
      const positions = [
        { x: 100, y: 50 },
        { x: 250, y: 50 },
        { x: 250, y: 150 },
        { x: 100, y: 150 },
      ];
      return positions[id] || { x: 0, y: 0 };
    }

    const positions = [
      { x: 50, y: 100 }, // Intro CS
      { x: 175, y: 100 }, // Data Struct
      { x: 300, y: 50 }, // Algorithms
      { x: 300, y: 150 }, // Databases
      { x: 50, y: 200 }, // Web Dev
      { x: 425, y: 100 }, // ML
    ];
    return positions[id] || { x: 0, y: 0 };
  };

  const getNodeColor = (state: string) => {
    switch (state) {
      case "completed":
        return "bg-green-500";
      case "processing":
        return "bg-yellow-500 animate-pulse";
      case "ready":
        return "bg-cyan-500";
      default:
        return "bg-gray-600";
    }
  };

  return (
    <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">
          Topological Sort: Course Schedule
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Kahn&apos;s Algorithm - Process courses with no remaining
          prerequisites
        </p>
      </div>

      <div className="p-4">
        {/* Controls */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <button
            onClick={() => dispatch({ type: "TOGGLE" })}
            disabled={phase === "done" || phase === "cycle"}
            className={`px-4 py-2 rounded-md font-medium transition ${
              isPlaying ? "bg-yellow-500 text-black" : "bg-green-500 text-white"
            } disabled:opacity-50`}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            onClick={initGraph}
            className="px-4 py-2 bg-gray-700 text-white rounded-md font-medium hover:bg-gray-600"
          >
            Reset
          </button>
          <label className="flex items-center gap-2 ml-4 cursor-pointer">
            <input
              type="checkbox"
              checked={showCycleExample}
              onChange={(e) => {
                setShowCycleExample(e.target.checked);
              }}
              className="w-4 h-4 rounded-md accent-red-500"
            />
            <span className="text-gray-400 text-sm">Show cycle example</span>
          </label>
          <div className="flex items-center gap-2 ml-4">
            <span className="text-gray-400 text-sm">Speed:</span>
            <input
              type="range"
              min="400"
              max="1500"
              step="100"
              value={1900 - speed}
              onChange={(e) => setSpeed(1900 - Number(e.target.value))}
              className="w-20 accent-purple-500"
            />
          </div>
        </div>

        {/* Graph Visualization */}
        <div className="relative h-64 bg-gray-800/50 rounded-md mb-4 overflow-hidden">
          {/* Edges */}
          <svg className="absolute inset-0 w-full h-full">
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
              </marker>
              <marker
                id="arrowhead-inactive"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#374151" />
              </marker>
            </defs>
            {edges.map((edge) => {
              const from = getNodePosition(edge.from);
              const to = getNodePosition(edge.to);
              const dx = to.x - from.x;
              const dy = to.y - from.y;
              const len = Math.sqrt(dx * dx + dy * dy);
              const offsetX = (dx / len) * 35;
              const offsetY = (dy / len) * 35;

              return (
                <motion.line
                  key={`edge-${edge.from}-${edge.to}`}
                  x1={from.x + 35 + offsetX}
                  y1={from.y + 20 + offsetY}
                  x2={to.x + 35 - offsetX}
                  y2={to.y + 20 - offsetY}
                  stroke={edge.active ? "#6b7280" : "#374151"}
                  strokeWidth={edge.active ? 2 : 1}
                  markerEnd={
                    edge.active ? "url(#arrowhead)" : "url(#arrowhead-inactive)"
                  }
                  strokeDasharray={edge.active ? "0" : "4"}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                />
              );
            })}
          </svg>

          {/* Nodes */}
          <AnimatePresence>
            {courses.map((course) => {
              const pos = getNodePosition(course.id);
              return (
                <motion.div
                  key={course.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, x: pos.x, y: pos.y }}
                  className={`absolute w-[70px] h-10 rounded-md flex flex-col items-center justify-center ${getNodeColor(course.state)} transition-colors`}
                  style={{ left: 0, top: 0 }}
                >
                  <span className="text-xs font-bold text-white truncate px-1">
                    {course.name}
                  </span>
                  <span className="text-[10px] text-white/70">
                    in: {course.indegree}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Queue and Order */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-800/50 rounded-md p-3">
            <div className="text-xs text-gray-500 mb-2">
              Queue (indegree = 0)
            </div>
            <div className="flex flex-wrap gap-1 min-h-[32px]">
              {queue.map((id, i) => (
                <span
                  key={`queue-${id}-${i}`}
                  className={`px-2 py-1 rounded-md text-xs font-medium ${
                    i === 0
                      ? "bg-yellow-500 text-black"
                      : "bg-cyan-500/50 text-cyan-200"
                  }`}
                >
                  {COURSE_NAMES[id]}
                </span>
              ))}
              {queue.length === 0 && (
                <span className="text-gray-500 text-xs">Empty</span>
              )}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-md p-3">
            <div className="text-xs text-gray-500 mb-2">Completed Order</div>
            <div className="flex flex-wrap gap-1 min-h-[32px]">
              {order.map((id, i) => (
                <span
                  key={`order-${id}-${i}`}
                  className="px-2 py-1 rounded-md text-xs font-medium bg-green-500/50 text-green-200"
                >
                  {i + 1}. {COURSE_NAMES[id]}
                </span>
              ))}
              {order.length === 0 && (
                <span className="text-gray-500 text-xs">None yet</span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {courses.length}
            </div>
            <div className="text-xs text-gray-500">Total Courses</div>
          </div>
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-2xl font-bold text-green-400">
              {order.length}
            </div>
            <div className="text-xs text-gray-500">Completed</div>
          </div>
          <div className="bg-gray-800/50 rounded-md p-3 text-center">
            <div className="text-2xl font-bold text-cyan-400">
              {queue.length}
            </div>
            <div className="text-xs text-gray-500">Ready</div>
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
              : phase === "cycle"
                ? "bg-red-500/10 border border-red-500/30 text-red-400"
                : "bg-gray-800 text-gray-300"
          }`}
        >
          {message}
        </motion.div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-gray-600" />
            <span className="text-gray-400">Has Prerequisites</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-cyan-500" />
            <span className="text-gray-400">Ready (indegree=0)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-yellow-500" />
            <span className="text-gray-400">Processing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-green-500" />
            <span className="text-gray-400">Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
