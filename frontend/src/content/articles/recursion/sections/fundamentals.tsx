"use client";

import CodeBlock from "@/components/ui/CodeBlock";
import CallStackVisualizer from "@/components/visualizers/CallStackVisualizer";
import StepByStepExecutor from "@/components/visualizers/StepByStepExecutor";
import MemoryVisualizer from "@/components/visualizers/MemoryVisualizer";

export default function FundamentalsSection() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-3xl font-bold text-white mb-6">
        Fundamentals of Recursion
      </h1>

      <p className="text-lg text-gray-300 leading-relaxed mb-8">
        In programming, recursion is a fundamental concept that is used to solve
        problems that involve repetitive or recursive logic. It is a technique
        where a <strong className="text-white">function calls itself</strong>{" "}
        repeatedly until it meets a predefined condition known as a{" "}
        <strong className="text-white">base case</strong>.
      </p>

      <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-md p-6 mb-8">
        <h3 className="text-xl font-bold text-indigo-300 mb-3">
          Definition of Recursion
        </h3>
        <p className="text-gray-300">
          Recursion is a technique where a function calls itself repeatedly,
          breaking down the problem into smaller and smaller sub-problems until
          a <strong className="text-white">base case</strong> is reached, which
          stops the recursion from continuing indefinitely.
        </p>
      </div>

      <h2 className="text-2xl font-bold text-white mb-4 mt-10">
        The Basic Principle
      </h2>
      <p className="text-gray-300 mb-6">
        The basic principle of recursion is to break down a complex problem into
        smaller sub-problems that can be easily solved. Each sub-problem is
        solved by the same function that called it, with the values carried
        forward to the next recursive call.
      </p>

      <div className="mb-8">
        <CodeBlock
          code={`public int factorial(int n) {
    // Base case: factorial of 0 is 1
    if (n == 0) {
        return 1;
    }
    // Recursive case: n! = n * (n-1)!
    return n * factorial(n - 1);
}

// Example: factorial(5)
// 5 * factorial(4)
// 5 * 4 * factorial(3)
// 5 * 4 * 3 * factorial(2)
// 5 * 4 * 3 * 2 * factorial(1)
// 5 * 4 * 3 * 2 * 1 * factorial(0)
// 5 * 4 * 3 * 2 * 1 * 1 = 120`}
          language="java"
        />
      </div>

      <h2 className="text-2xl font-bold text-white mb-4 mt-10">
        Step-by-Step Execution
      </h2>
      <p className="text-gray-300 mb-6">
        Watch how the code executes line by line, tracking variables and the
        call stack:
      </p>
      <div className="mb-8">
        <StepByStepExecutor example="factorial" />
      </div>

      <h2 className="text-2xl font-bold text-white mb-4 mt-10">
        Understanding the Call Stack
      </h2>
      <p className="text-gray-300 mb-6">
        Each recursive call creates a new frame on the call stack. Watch how
        frames are pushed and popped:
      </p>
      <div className="mb-8">
        <CallStackVisualizer example="factorial" inputValue={5} />
      </div>

      <h2 className="text-2xl font-bold text-white mb-4 mt-10">
        Memory Visualization
      </h2>
      <p className="text-gray-300 mb-6">
        Understanding how recursion uses memory is crucial for writing efficient
        code:
      </p>
      <div className="mb-8">
        <MemoryVisualizer />
      </div>

      <h2 className="text-2xl font-bold text-white mb-4 mt-10">
        Key Components of Recursion
      </h2>
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-900 rounded-md border border-gray-800 p-5">
          <h4 className="text-lg font-semibold text-green-400 mb-2">
            Base Case
          </h4>
          <p className="text-gray-400 text-sm">
            The condition that stops the recursion. Without it, the function
            would call itself infinitely, causing a stack overflow.
          </p>
        </div>
        <div className="bg-gray-900 rounded-md border border-gray-800 p-5">
          <h4 className="text-lg font-semibold text-blue-400 mb-2">
            Recursive Case
          </h4>
          <p className="text-gray-400 text-sm">
            The part where the function calls itself with a modified argument,
            moving closer to the base case.
          </p>
        </div>
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-md p-6">
        <h4 className="text-lg font-semibold text-yellow-400 mb-3">
          When to Use Recursion
        </h4>
        <ul className="text-gray-300 space-y-2">
          <li>
            - Problems that can be broken into smaller, similar sub-problems
          </li>
          <li>- Tree and graph traversals</li>
          <li>- Divide and conquer algorithms</li>
          <li>- When the iterative solution is complex or unclear</li>
        </ul>
      </div>
    </div>
  );
}
