"use client";

import { useState } from "react";
import CodeBlock from "@/components/ui/CodeBlock";

interface RecursionTypeInfo {
  name: string;
  description: string;
  code: string;
  characteristics: string[];
  pros: string[];
  cons: string[];
  color: string;
}

const recursionTypes: RecursionTypeInfo[] = [
  {
    name: "Direct Recursion",
    description:
      "A function calls itself directly. The most common form of recursion.",
    code: `public int factorial(int n) {
    if (n == 0) return 1;
    return n * factorial(n - 1);
}

// factorial(4)
// = 4 * factorial(3)
// = 4 * 3 * factorial(2)
// = 4 * 3 * 2 * factorial(1)
// = 4 * 3 * 2 * 1 * factorial(0)
// = 4 * 3 * 2 * 1 * 1 = 24`,
    characteristics: [
      "Function calls itself with modified arguments",
      "Must have a base case to terminate",
      "Each call waits for the recursive call to return",
    ],
    pros: [
      "Simple to understand",
      "Natural for problems with recursive structure",
    ],
    cons: [
      "Uses stack space proportional to recursion depth",
      "Risk of stack overflow",
    ],
    color: "indigo",
  },
  {
    name: "Indirect Recursion",
    description:
      "Two or more functions call each other in a cycle until a base case is reached.",
    code: `public boolean isEven(int n) {
    if (n == 0) return true;
    return isOdd(n - 1);
}

public boolean isOdd(int n) {
    if (n == 0) return false;
    return isEven(n - 1);
}

// isEven(4) = isOdd(3)
// = isEven(2) = isOdd(1)
// = isEven(0) = true`,
    characteristics: [
      "Function A calls function B, which calls function A",
      "Creates a cycle of function calls",
      "All functions in the cycle need base cases",
    ],
    pros: [
      "Good for mutually dependent computations",
      "Models state machines naturally",
    ],
    cons: ["Harder to trace and debug", "More complex control flow"],
    color: "purple",
  },
  {
    name: "Tail Recursion",
    description:
      "The recursive call is the last operation in the function. Can be optimized by compilers.",
    code: `// NOT tail recursive
public int factorial(int n) {
    if (n == 0) return 1;
    return n * factorial(n - 1);
}

// TAIL recursive (last operation is the call)
public int factorialTail(int n, int acc) {
    if (n == 0) return acc;
    return factorialTail(n - 1, n * acc);
}

// factorialTail(4, 1) = factorialTail(3, 4)
// = factorialTail(2, 12) = factorialTail(1, 24)
// = factorialTail(0, 24) = 24`,
    characteristics: [
      "Recursive call is the LAST thing executed",
      "No pending operations after the recursive call",
      "Result passed as accumulator parameter",
    ],
    pros: [
      "Can be optimized to O(1) space (tail call optimization)",
      "No stack buildup with TCO",
    ],
    cons: [
      "Requires rewriting to use accumulators",
      "Not all languages support TCO",
    ],
    color: "green",
  },
  {
    name: "Head Recursion",
    description:
      "The recursive call is the first operation in the function, before any processing.",
    code: `public void printNumbers(int n) {
    if (n == 0) return;
    printNumbers(n - 1);
    System.out.println(n);
}

// printNumbers(4)
// = printNumbers(3)
// = printNumbers(2)
// = printNumbers(1)
// = printNumbers(0) [returns]
// prints: 1, 2, 3, 4`,
    characteristics: [
      "Recursive call happens before any processing",
      "Processing happens during unwinding",
      "Processes in reverse order of calls",
    ],
    pros: [
      "Good when you need to process in reverse",
      "Useful for certain tree traversals",
    ],
    cons: [
      "Cannot be tail-call optimized",
      "Processing delayed until base case reached",
    ],
    color: "orange",
  },
  {
    name: "Tree Recursion",
    description:
      "Function makes multiple recursive calls, creating a tree of calls.",
    code: `public int fib(int n) {
    if (n <= 1) return n;
    return fib(n - 1) + fib(n - 2);
}

//           fib(4)
//          /      \\
//       fib(3)    fib(2)
//       /   \\      /   \\
//    fib(2) fib(1) fib(1) fib(0)
//    /   \\
// fib(1) fib(0)`,
    characteristics: [
      "Multiple recursive calls per function invocation",
      "Creates a tree-like call structure",
      "Often leads to exponential time complexity",
    ],
    pros: ["Natural for tree/graph problems", "Elegant for divide-and-conquer"],
    cons: [
      "Exponential time without memoization",
      "Often has overlapping subproblems",
    ],
    color: "red",
  },
  {
    name: "Mutual Recursion",
    description:
      "Two or more functions that are defined in terms of each other.",
    code: `public Node parseExpr() {
    Node result = parseTerm();
    while (peek() == '+' || peek() == '-') {
        char op = consume();
        Node right = parseTerm();
        result = new Node(op, result, right);
    }
    return result;
}

public Node parseTerm() {
    Node result = parseFactor();
    while (peek() == '*' || peek() == '/') {
        result = parseFactor();
    }
    return result;
}

public Node parseFactor() {
    if (peek() == '(') {
        consume('(');
        Node expr = parseExpr();
        consume(')');
        return expr;
    }
    return parseNumber();
}`,
    characteristics: [
      "Functions call each other to solve related subproblems",
      "Common in parsers and compilers",
      "Each function handles a specific part of the problem",
    ],
    pros: ["Clean separation of concerns", "Models grammars naturally"],
    cons: ["Complex interdependencies", "Harder to reason about termination"],
    color: "cyan",
  },
];

export default function RecursionTypesVisualizer() {
  const [selectedType, setSelectedType] = useState(0);
  const type = recursionTypes[selectedType];

  const getColorClasses = (color: string) => ({
    bg: `bg-${color}-500/10`,
    border: `border-${color}-500/30`,
    text: `text-${color}-400`,
    bgSolid: `bg-${color}-500`,
  });

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gray-800/50 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          Types of Recursion
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Explore different recursion patterns and when to use them
        </p>
      </div>

      <div className="p-4">
        <div className="flex flex-wrap gap-2 mb-6">
          {recursionTypes.map((t, idx) => (
            <button
              key={t.name}
              onClick={() => setSelectedType(idx)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                selectedType === idx
                  ? `bg-${t.color}-500 text-white`
                  : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
              style={
                selectedType === idx
                  ? {
                      backgroundColor:
                        t.color === "indigo"
                          ? "#6366f1"
                          : t.color === "purple"
                            ? "#a855f7"
                            : t.color === "green"
                              ? "#22c55e"
                              : t.color === "orange"
                                ? "#f97316"
                                : t.color === "red"
                                  ? "#ef4444"
                                  : "#06b6d4",
                    }
                  : undefined
              }
            >
              {t.name}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-xl font-bold text-white mb-2">{type.name}</h4>
            <p className="text-gray-400 mb-4">{type.description}</p>

            <div className="mb-4">
              <CodeBlock code={type.code} language="java" showCopy={false} />
            </div>

            <div className="space-y-3">
              <div>
                <h5 className="text-sm font-medium text-gray-400 mb-2">
                  Key Characteristics
                </h5>
                <ul className="space-y-1">
                  {type.characteristics.map((char, idx) => (
                    <li
                      key={`idx-${idx}`}
                      className="flex items-start gap-2 text-sm text-gray-300"
                    >
                      <span className="text-indigo-400 mt-0.5">•</span>
                      {char}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <h5 className="text-sm font-medium text-green-400 mb-3 flex items-center gap-2">
                <span>✓</span> Advantages
              </h5>
              <ul className="space-y-2">
                {type.pros.map((pro, idx) => (
                  <li
                    key={`idx-${idx}`}
                    className="flex items-start gap-2 text-sm text-gray-300"
                  >
                    <span className="text-green-400 mt-0.5">+</span>
                    {pro}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <h5 className="text-sm font-medium text-red-400 mb-3 flex items-center gap-2">
                <span>✗</span> Disadvantages
              </h5>
              <ul className="space-y-2">
                {type.cons.map((con, idx) => (
                  <li
                    key={`idx-${idx}`}
                    className="flex items-start gap-2 text-sm text-gray-300"
                  >
                    <span className="text-red-400 mt-0.5">−</span>
                    {con}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <h5 className="text-sm font-medium text-gray-400 mb-3">
                When to Use
              </h5>
              <p className="text-sm text-gray-300">
                {type.name === "Direct Recursion" &&
                  "Use for problems that naturally break down into smaller versions of the same problem (factorial, tree traversal, binary search)."}
                {type.name === "Indirect Recursion" &&
                  "Use when you have two related computations that depend on each other, like even/odd checks or state machines."}
                {type.name === "Tail Recursion" &&
                  "Use when you want to optimize recursion to avoid stack overflow, especially in functional programming languages with TCO support."}
                {type.name === "Head Recursion" &&
                  'Use when you need to process elements in reverse order, or when processing should happen during the "unwinding" phase.'}
                {type.name === "Tree Recursion" &&
                  "Use for divide-and-conquer algorithms, but consider memoization or DP for overlapping subproblems."}
                {type.name === "Mutual Recursion" &&
                  "Use in parsers, compilers, and when modeling complex grammars or hierarchical structures."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
