"use client";

import { useState, useEffect, useReducer, startTransition } from "react";
import CodeBlock from "@/components/ui/CodeBlock";

interface MemoryBlock {
  id: number;
  address: string;
  name: string;
  value: string;
  type: "stack" | "return-address" | "local-var" | "parameter";
}

interface MemoryFrame {
  functionName: string;
  blocks: MemoryBlock[];
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

const allSteps: {
  action: "push" | "pop" | "update";
  frame?: MemoryFrame;
  message: string;
}[] = [
  {
    action: "push",
    frame: {
      functionName: "main()",
      blocks: [
        {
          id: 0,
          address: "0x7FFE",
          name: "return addr",
          value: "OS",
          type: "return-address",
        },
        {
          id: 1,
          address: "0x7FFC",
          name: "result",
          value: "?",
          type: "local-var",
        },
      ],
    },
    message: "main() starts executing, allocates space for result",
  },
  {
    action: "push",
    frame: {
      functionName: "factorial(4)",
      blocks: [
        {
          id: 2,
          address: "0x7FF8",
          name: "return addr",
          value: "main",
          type: "return-address",
        },
        {
          id: 3,
          address: "0x7FF4",
          name: "n",
          value: "4",
          type: "parameter",
        },
      ],
    },
    message: "factorial(4) called, n=4 pushed onto stack",
  },
  {
    action: "push",
    frame: {
      functionName: "factorial(3)",
      blocks: [
        {
          id: 4,
          address: "0x7FF0",
          name: "return addr",
          value: "fact(4)",
          type: "return-address",
        },
        {
          id: 5,
          address: "0x7FEC",
          name: "n",
          value: "3",
          type: "parameter",
        },
      ],
    },
    message: "factorial(3) called, n=3 pushed onto stack",
  },
  {
    action: "push",
    frame: {
      functionName: "factorial(2)",
      blocks: [
        {
          id: 6,
          address: "0x7FE8",
          name: "return addr",
          value: "fact(3)",
          type: "return-address",
        },
        {
          id: 7,
          address: "0x7FE4",
          name: "n",
          value: "2",
          type: "parameter",
        },
      ],
    },
    message: "factorial(2) called, n=2 pushed onto stack",
  },
  {
    action: "push",
    frame: {
      functionName: "factorial(1)",
      blocks: [
        {
          id: 8,
          address: "0x7FE0",
          name: "return addr",
          value: "fact(2)",
          type: "return-address",
        },
        {
          id: 9,
          address: "0x7FDC",
          name: "n",
          value: "1",
          type: "parameter",
        },
      ],
    },
    message: "factorial(1) called, n=1 pushed onto stack",
  },
  {
    action: "push",
    frame: {
      functionName: "factorial(0)",
      blocks: [
        {
          id: 10,
          address: "0x7FD8",
          name: "return addr",
          value: "fact(1)",
          type: "return-address",
        },
        {
          id: 11,
          address: "0x7FD4",
          name: "n",
          value: "0",
          type: "parameter",
        },
      ],
    },
    message: "factorial(0) called - BASE CASE reached!",
  },
  {
    action: "pop",
    message: "factorial(0) returns 1, frame popped",
  },
  {
    action: "pop",
    message: "factorial(1) returns 1*1=1, frame popped",
  },
  {
    action: "pop",
    message: "factorial(2) returns 2*1=2, frame popped",
  },
  {
    action: "pop",
    message: "factorial(3) returns 3*2=6, frame popped",
  },
  {
    action: "pop",
    message: "factorial(4) returns 4*6=24, frame popped",
  },
  {
    action: "update",
    message: "main() receives result = 24",
  },
];

// skipcq: JS-0067
export default function MemoryVisualizer() {
  const [frames, setFrames] = useState<MemoryFrame[]>([]);
  const [{ step, isPlaying }, dispatch] = useReducer(playReducer, {
    step: 0,
    isPlaying: false,
  });
  const [speed, setSpeed] = useState(1200);

  useEffect(() => {
    if (!isPlaying || step >= allSteps.length) {
      if (step >= allSteps.length) {
        startTransition(() => {
          dispatch({ type: "STOP" });
        });
      }
      return;
    }

    const timer = setTimeout(() => {
      const action = allSteps[step];

      if (action.action === "push" && action.frame) {
        setFrames((prev) => [...prev, action.frame!]);
      } else if (action.action === "pop") {
        setFrames((prev) => prev.slice(0, -1));
      }

      dispatch({ type: "ADVANCE" });
    }, speed);

    return () => clearTimeout(timer);
  }, [isPlaying, step, speed]);

  const reset = () => {
    setFrames([]);
    dispatch({ type: "RESET" });
  };

  const currentMessage =
    step > 0 && step <= allSteps.length
      ? allSteps[step - 1].message
      : "Click Play to start";

  const getTypeColor = (type: MemoryBlock["type"]) => {
    switch (type) {
      case "return-address":
        return "bg-purple-500/30 border-purple-500/50 text-purple-300";
      case "parameter":
        return "bg-blue-500/30 border-blue-500/50 text-blue-300";
      case "local-var":
        return "bg-green-500/30 border-green-500/50 text-green-300";
      default:
        return "bg-gray-500/30 border-gray-500/50 text-gray-300";
    }
  };

  const usedMemory = frames.reduce((acc, f) => acc + f.blocks.length * 8, 0);
  const maxMemory = 64;

  return (
    <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gray-800/50 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          Memory Visualization
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          See how recursion uses the call stack in memory
        </p>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <button
            onClick={() => dispatch({ type: "TOGGLE" })}
            className={`px-4 py-2 rounded-md font-medium transition ${
              isPlaying
                ? "bg-yellow-500 text-black hover:bg-yellow-400"
                : "bg-green-500 text-white hover:bg-green-400"
            }`}
          >
            {isPlaying ? "⏸ Pause" : "▶ Play"}
          </button>
          <button
            onClick={reset}
            className="px-4 py-2 bg-gray-700 text-white rounded-md font-medium hover:bg-gray-600 transition"
          >
            Reset
          </button>
          <div className="flex items-center gap-2 ml-4">
            <span className="text-gray-400 text-sm">Speed:</span>
            <input
              type="range"
              min="400"
              max="2000"
              step="200"
              value={2400 - speed}
              onChange={(e) => setSpeed(2400 - Number(e.target.value))}
              className="w-24 accent-indigo-500"
            />
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>Stack Usage</span>
            <span>
              {usedMemory} / {maxMemory} bytes
            </span>
          </div>
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                usedMemory / maxMemory > 0.8 ? "bg-red-500" : "bg-indigo-500"
              }`}
              style={{ width: `${(usedMemory / maxMemory) * 100}%` }}
            />
          </div>
        </div>

        <div
          className={`mb-4 p-3 rounded-md border ${
            step > 0 && allSteps[step - 1]?.action === "pop"
              ? "bg-green-500/10 border-green-500/30"
              : step > 0 && allSteps[step - 1]?.message.includes("BASE CASE")
                ? "bg-yellow-500/10 border-yellow-500/30"
                : "bg-gray-800/50 border-gray-700"
          }`}
        >
          <p
            className={`text-sm ${
              step > 0 && allSteps[step - 1]?.action === "pop"
                ? "text-green-400"
                : step > 0 && allSteps[step - 1]?.message.includes("BASE CASE")
                  ? "text-yellow-400"
                  : "text-gray-300"
            }`}
          >
            Step {step}/{allSteps.length}: {currentMessage}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gray-800/30 rounded-md p-4">
            <div className="text-sm text-gray-400 mb-3 flex items-center justify-between">
              <span>Call Stack</span>
              <span className="text-indigo-400">{frames.length} frames</span>
            </div>

            <div className="space-y-2">
              {frames.length === 0 ? (
                <div className="text-gray-600 text-center py-8 text-sm">
                  Stack is empty
                </div>
              ) : (
                [...frames].reverse().map((frame, idx) => (
                  <div
                    key={`${frame.functionName}-${idx}`}
                    className={`p-3 rounded-md border transition-all duration-300 ${
                      idx === 0
                        ? "bg-indigo-500/20 border-indigo-500/50 shadow-lg shadow-indigo-500/20"
                        : "bg-gray-700/30 border-gray-700"
                    }`}
                  >
                    <div className="font-mono text-sm text-white mb-2">
                      {frame.functionName}
                    </div>
                    <div className="space-y-1">
                      {frame.blocks.map((block) => (
                        <div
                          key={block.id}
                          className={`flex justify-between items-center px-2 py-1 rounded-md text-xs font-mono border ${getTypeColor(block.type)}`}
                        >
                          <span className="text-gray-500">{block.address}</span>
                          <span>{block.name}</span>
                          <span className="font-bold">{block.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {frames.length > 0 && (
              <div className="mt-3 text-xs text-gray-500 text-center">
                ↓ Bottom of stack (main)
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-gray-800/30 rounded-md p-4">
              <div className="text-sm text-gray-400 mb-3">Legend</div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-md bg-purple-500/30 border border-purple-500/50"></div>
                  <span className="text-gray-300">Return Address</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-md bg-blue-500/30 border border-blue-500/50"></div>
                  <span className="text-gray-300">Parameter</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-md bg-green-500/30 border border-green-500/50"></div>
                  <span className="text-gray-300">Local Variable</span>
                </div>
              </div>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 rounded-md p-4">
              <h4 className="text-red-400 font-medium text-sm mb-2">
                Stack Overflow
              </h4>
              <p className="text-gray-400 text-xs">
                If there&apos;s no base case or recursion depth is too deep, the
                stack will overflow and crash the program. Each function call
                uses memory!
              </p>
            </div>

            <CodeBlock
              code={`public int factorial(int n) {
    if (n == 0) return 1;
    return n * factorial(n - 1);
}`}
              language="java"
              showCopy={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
